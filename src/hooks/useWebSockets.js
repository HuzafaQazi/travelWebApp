// hooks/useWebSockets.js or components/corporate/WebSocket/useWebSockets.js

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useSelector } from "react-redux";
import { useRouter } from "next/router";
import SockJS from "sockjs-client";
import Stomp from "stompjs";
import config from "@/config";
import {
  setNotifications,
  setNeedsRefresh as setNotificationNeedsRefresh,
} from "@/store/slices/notificationSlice";
import {
  setApprovals,
  setNeedsRefresh,
  setApprovalStatusNeedsRefresh,
} from "@/store/slices/approvalSlice";
import {
  setPolicyChanged,
  fetchEmployeesByIds,
  refetchFixedInitialOptions,
} from "@/store/slices/travellersSlice";
import { store } from "@/store/store";
import showToast from "@/utils/toast";
import { fetchAndUpdateUserDetails } from "@/utils/axios/axios";
import { TRAVEL_CATEGORIES } from "@/utils/constants";
import {
  selectCorporateUserId,
  selectCorporateIsAuthenticated,
} from "@/store/selectors/corporateSelectors";
import { getActiveUserType } from "@/utils/axios/axios";

// Debounce function to prevent multiple calls
const debounce = (func, wait) => {
  let timeout;
  return (...args) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

const useWebSockets = () => {
  const router = useRouter();

  // ✅ Use Redux selectors instead of session storage
  const isAuthenticated = useSelector(selectCorporateIsAuthenticated);
  const userId = useSelector(selectCorporateUserId);
  const userType = getActiveUserType();

  // Track if user details fetch is in progress
  const isFetchingUserDetails = useRef(false);

  // Reference to track last fetch time
  const lastFetchTimestamp = useRef(0);

  // Track processed message IDs to prevent duplicates
  const processedMessageIds = useRef(new Set());

  // LRU cache to limit the size of processedMessageIds
  const MAX_PROCESSED_IDS = 100;
  const addProcessedMessageId = (id) => {
    if (processedMessageIds.current.size >= MAX_PROCESSED_IDS) {
      // Remove oldest entry (first item in the set)
      const oldest = processedMessageIds.current.values().next().value;
      processedMessageIds.current.delete(oldest);
    }
    processedMessageIds.current.add(id);
  };

  // ✅ Get selected travelers from Redux
  const selectedFlightTravelers = useSelector(
    (state) =>
      state.travellers.travelersByCategory[TRAVEL_CATEGORIES.FLIGHTS] || []
  );
  const selectedHotelTravelers = useSelector(
    (state) =>
      state.travellers.travelersByCategory[TRAVEL_CATEGORIES.HOTELS] || []
  );

  // Combine userId + flight/hotel IDs => no duplicates => final array
  const combinedTravelerIds = useMemo(() => {
    if (!userId) return [];
    const flightIds = selectedFlightTravelers.map((t) => t.value);
    const hotelIds = selectedHotelTravelers.map((t) => t.value);
    const allIds = new Set([userId, ...flightIds, ...hotelIds].filter(Boolean));
    return Array.from(allIds);
  }, [userId, selectedFlightTravelers, selectedHotelTravelers]);

  // STOMP client + reference
  const stompClientRef = useRef(null);

  // For reconnect logic
  const reconnectAttempts = useRef(0);

  // For dynamic traveler subscriptions
  const travelerSubsRef = useRef({});

  // KeepAlive interval
  const keepAliveIntervalRef = useRef(null);

  // Track if we are "connected" so the second effect waits for it
  const [isConnected, setIsConnected] = useState(false);

  // Create a debounced version of fetchAndUpdateUserDetails
  const debouncedFetchUserDetails = useCallback(
    debounce(async () => {
      // If a fetch is already in progress, don't start another one
      if (isFetchingUserDetails.current) return;

      // Check if enough time has passed since last fetch (at least 1 second)
      const now = Date.now();
      if (now - lastFetchTimestamp.current < 1000) return;

      isFetchingUserDetails.current = true;
      lastFetchTimestamp.current = now;

      try {
        console.log("Fetching user details via WebSocket update");
        await fetchAndUpdateUserDetails();
      } catch (error) {
        console.error("Error fetching user details:", error);
      } finally {
        isFetchingUserDetails.current = false;
      }
    }, 300), // 300ms debounce
    []
  );

  // -------------------------------------------
  //   Keep-alive helpers
  // -------------------------------------------
  const startKeepAlive = useCallback(() => {
    stopKeepAlive();
    keepAliveIntervalRef.current = setInterval(() => {
      if (stompClientRef.current && stompClientRef.current.connected) {
        stompClientRef.current.send("/app/keepAlive", {}, JSON.stringify({}));
        console.log("Sent keep-alive message");
      }
    }, 30000);
  }, []);

  const stopKeepAlive = useCallback(() => {
    if (keepAliveIntervalRef.current) {
      clearInterval(keepAliveIntervalRef.current);
      keepAliveIntervalRef.current = null;
    }
  }, []);

  // -------------------------------------------
  //  1) EFFECT => Connect the WebSocket once
  // -------------------------------------------
  useEffect(() => {
    // ✅ Early return if not corporate user
    if (userType !== "corporate") {
      console.log("WebSocket: Not a corporate user, skipping connection");
      return;
    }

    // ✅ Check authentication and userId from Redux
    if (!isAuthenticated || !userId) {
      // If no user => disconnect if needed
      if (stompClientRef.current) {
        stompClientRef.current.disconnect(() => {
          console.log("WebSocket disconnected (logout/no user)");
        });
        stompClientRef.current = null;
      }
      setIsConnected(false);
      return;
    }

    console.log("WebSocket: Connecting for corporate user:", userId);

    // Attempt to connect
    const webSocketEndPoint = config.WEB_SOCKET_URL;
    const ws = new SockJS(webSocketEndPoint);
    const stompClient = Stomp.over(ws);

    // Reduce debug output
    stompClient.debug = null; // Set to null to disable debug messages

    stompClient.heartbeat.outgoing = 20000; // 20s
    stompClient.heartbeat.incoming = 0;

    stompClient.connect(
      {},
      (frame) => {
        console.log("Connected to WebSocket:", frame);
        stompClientRef.current = stompClient;
        reconnectAttempts.current = 0;
        setIsConnected(true); // Mark as connected
        startKeepAlive();

        // Subscribe to standard user-based topics...
        try {
          // 1) Notification
          console.log(`Subscribing to topic: /topic/notification_${userId}`);
          stompClient.subscribe(`/topic/notification_${userId}`, (message) => {
            // Check for duplicate message
            if (
              processedMessageIds.current.has(message.headers["message-id"])
            ) {
              console.log(
                "Skipping duplicate notification message:",
                message.headers["message-id"]
              );
              return;
            }
            addProcessedMessageId(message.headers["message-id"]);

            const body = JSON.parse(message.body);
            const notificationCount = body?.notificationCount || 0;
            store.dispatch(setNotifications(notificationCount));
            store.dispatch(
              setNotificationNeedsRefresh({
                approvals: true,
                travelRequests: true,
                tripReminders: true,
              })
            );
            console.log("Received Notification:", body);
          });
          console.log(`✅ Subscribed to topic: /topic/notification_${userId}`);

          // 2) Approval
          console.log(`Subscribing to topic: /topic/approval_${userId}`);
          stompClient.subscribe(`/topic/approval_${userId}`, (message) => {
            // Check for duplicate message
            if (
              processedMessageIds.current.has(message.headers["message-id"])
            ) {
              console.log(
                "Skipping duplicate approval message:",
                message.headers["message-id"]
              );
              return;
            }
            addProcessedMessageId(message.headers["message-id"]);

            const body = JSON.parse(message.body);

            const {
              bookingId,
              companyId,
              approvalStatus,
              notificationCount,
              travelCategory,
              hasQuote,
            } = body;

            let toastMessage = "";
            let toastType = "info";

            // Check if it's a transport booking (categories 3, 4, 5)
            const isTransportBooking = ["3", "4", "5"].includes(travelCategory);

            if (isTransportBooking) {
              // Transport booking messages based on hasQuote status
              if (hasQuote === false || hasQuote === undefined) {
                toastMessage =
                  "Transport request received and waiting for Qugo to respond";
                toastType = "info";
              } else if (hasQuote === true) {
                toastMessage =
                  "Quote received from Qugo for your transport request";
                toastType = "success";
              }

              showToast(toastType, toastMessage);
            }

            const approvalCount = body?.approvalCount || 0;
            store.dispatch(setApprovals({ count: approvalCount, data: [] }));
            store.dispatch(setNeedsRefresh(true));

            store.dispatch(setNotifications(notificationCount));
            store.dispatch(
              setNotificationNeedsRefresh({
                approvals: true,
                travelRequests: true,
                tripReminders: true,
              })
            );
            console.log("Received Approval:", body);
          });
          console.log(`✅ Subscribed to topic: /topic/approval_${userId}`);

          // 3) Corporate User
          console.log(`Subscribing to topic: /topic/corporateUser_${userId}`);
          stompClient.subscribe(`/topic/corporateUser_${userId}`, (message) => {
            // Check for duplicate message
            if (
              processedMessageIds.current.has(message.headers["message-id"])
            ) {
              console.log(
                "Skipping duplicate corporate user message:",
                message.headers["message-id"]
              );
              return;
            }
            addProcessedMessageId(message.headers["message-id"]);

            const body = JSON.parse(message.body);
            const {
              bookingId,
              companyId,
              approvalStatus,
              travelCategory,
              hasQuote,
            } = body;

            let toastMessage = "";
            let toastType = "info";

            // Check if it's a transport booking (categories 3, 4, 5)
            const isTransportBooking = ["3", "4", "5"].includes(travelCategory);

            if (isTransportBooking) {
              // Transport booking messages based on hasQuote status
              if (hasQuote === false) {
                toastMessage =
                  "Transport request received and waiting for Qugo to respond";
                toastType = "info";
              } else if (hasQuote === true) {
                toastMessage =
                  "Quote received from Qugo for your transport request";
                toastType = "success";
              } else {
                // Fallback for regular approval status for transport
                toastMessage =
                  approvalStatus?.toLowerCase() === "approved"
                    ? "Your transport request has been approved!"
                    : approvalStatus?.toLowerCase() === "declined" ||
                      approvalStatus?.toLowerCase() === "rejected"
                    ? "Your transport request has been declined."
                    : "Your transport request status has been updated.";
                toastType =
                  approvalStatus?.toLowerCase() === "approved"
                    ? "success"
                    : approvalStatus?.toLowerCase() === "declined" ||
                      approvalStatus?.toLowerCase() === "rejected"
                    ? "error"
                    : "info";
              }
            } else {
              // Non-transport bookings (existing logic)
              toastMessage =
                approvalStatus?.toLowerCase() === "approved"
                  ? "Your travel request has been approved!"
                  : approvalStatus?.toLowerCase() === "declined" ||
                    approvalStatus?.toLowerCase() === "rejected"
                  ? "Your travel request has been declined."
                  : "Your travel request status has been updated.";
              toastType =
                approvalStatus?.toLowerCase() === "approved"
                  ? "success"
                  : approvalStatus?.toLowerCase() === "declined" ||
                    approvalStatus?.toLowerCase() === "rejected"
                  ? "error"
                  : "info";
            }

            let approvalUrl = `/corporate/auth/booking/hotels/approvalStatus?companyId=${companyId}&bookingId=${bookingId}`;
            if (travelCategory === "2") {
              approvalUrl = `/corporate/auth/booking/flights/flightApproval?companyId=${companyId}&bookingId=${bookingId}`;
            } else if (isTransportBooking) {
              approvalUrl = `/corporate/auth/booking/carbustrain/commonApproval?companyId=${companyId}&bookingId=${bookingId}`;
            }

            showToast(toastType, toastMessage, {
              onClick: () => {
                if (router.asPath !== approvalUrl) router.push(approvalUrl);
                else router.replace(router.asPath);
              },
            });

            store.dispatch(
              setApprovalStatusNeedsRefresh({
                travelCategory: Number(travelCategory),
                status: true,
              })
            );

            console.log("Received Corporate User Update:", body);
          });
          console.log(`✅ Subscribed to topic: /topic/corporateUser_${userId}`);

          // 4) Edit employee/role => re-fetch user
          console.log(
            `Subscribing to topic: /topic/corporateEmployee_${userId}`
          );
          stompClient.subscribe(
            `/topic/corporateEmployee_${userId}`,
            async (msg) => {
              // Check for duplicate message
              if (processedMessageIds.current.has(msg.headers["message-id"])) {
                console.log(
                  "Skipping duplicate employee message:",
                  msg.headers["message-id"]
                );
                return;
              }
              addProcessedMessageId(msg.headers["message-id"]);

              const body = msg.body;
              await debouncedFetchUserDetails();
              console.log("Received Edit employee/role:", body);
            }
          );
          console.log(
            `✅ Subscribed to topic: /topic/corporateEmployee_${userId}`
          );

          // 5) Booking Confirmation
          console.log(
            `Subscribing to topic: /topic/bookingConfirmation_${userId}`
          );
          stompClient.subscribe(
            `/topic/bookingConfirmation_${userId}`,
            (message) => {
              // Check for duplicate message
              if (
                processedMessageIds.current.has(message.headers["message-id"])
              ) {
                console.log(
                  "Skipping duplicate booking confirmation message:",
                  message.headers["message-id"]
                );
                return;
              }
              addProcessedMessageId(message.headers["message-id"]);

              const body = JSON.parse(message.body);
              const {
                bookingId,
                companyId,
                travelCategory,
                bookingStatus,
                message: customMessage,
                transportType,
                totalAmount,
                travelDate,
                origin,
                destination,
                hasInvoice,
                hasTicket,
                bookedDate,
              } = body;

              // Get transport category name for display
              const getCategoryName = (category) => {
                switch (category) {
                  case "3":
                    return "Car Rental";
                  case "4":
                    return "Bus";
                  case "5":
                    return "Train";
                  default:
                    return "Transport";
                }
              };

              // Create booking confirmation message
              const categoryName = getCategoryName(travelCategory);
              let toastMessage =
                customMessage ||
                `Your ${categoryName} booking has been confirmed!`;

              // Add additional details if available
              if (origin && destination) {
                toastMessage += ` Route: ${origin} to ${destination}`;
              }
              if (totalAmount) {
                toastMessage += ` | Amount: ₹${totalAmount}`;
              }

              const toastType = "success";

              // Determine the booking URL
              const bookingUrl = `/corporate/auth/booking/carbustrain/BookingDetails?bookingId=${bookingId}`;

              // Show booking confirmation toast with enhanced styling
              showToast(toastType, toastMessage, {
                duration: 8000, // Longer duration for booking confirmations
                onClick: () => {
                  if (router.asPath !== bookingUrl) router.push(bookingUrl);
                  else router.replace(router.asPath);
                },
                icon: "✅",
              });

              // Log the booking confirmation
              console.log("Received Booking Confirmation:", {
                bookingId,
                travelCategory,
                categoryName,
                bookingStatus,
                hasAttachments: hasInvoice || hasTicket,
                body,
              });
            }
          );
          console.log(
            `✅ Subscribed to topic: /topic/bookingConfirmation_${userId}`
          );
        } catch (err) {
          console.error("Subscription Error:", err);
        }
      },
      (error) => {
        console.error("WebSocket Connection Error:", error);
        setIsConnected(false);

        if (reconnectAttempts.current < 5) {
          reconnectAttempts.current += 1;
          console.log(`Reconnection attempt ${reconnectAttempts.current}`);
          setTimeout(() => {
            if (!stompClientRef.current || !stompClientRef.current.connected) {
              stompClient.connect({});
            }
          }, 5000);
        } else {
          console.error("Max reconnection attempts reached.");
        }
      }
    );

    // Cleanup
    return () => {
      if (stompClientRef.current) {
        stompClientRef.current.disconnect(() => {
          console.log("WebSocket disconnected on unmount");
        });
        stompClientRef.current = null;
      }
      stopKeepAlive();
      setIsConnected(false);
    };
  }, [
    isAuthenticated,
    userId,
    userType,
    router,
    startKeepAlive,
    stopKeepAlive,
    debouncedFetchUserDetails,
  ]);

  // -------------------------------------------
  //  2) EFFECT => Dynamic traveler subscriptions
  // -------------------------------------------
  useEffect(() => {
    // Only do traveler subscriptions if connected
    if (!isConnected || !stompClientRef.current?.connected) {
      return;
    }

    // A) Unsubscribe from IDs no longer in combinedTravelerIds
    Object.keys(travelerSubsRef.current).forEach((oldId) => {
      if (!combinedTravelerIds.includes(oldId)) {
        const sub = travelerSubsRef.current[oldId];
        if (sub) {
          sub.unsubscribe();
          console.log(
            `🔴 Unsubscribed from topic: /topic/corporateEmpTravelPolicy_${oldId} (Traveler ID: ${oldId})`
          );
        }
        delete travelerSubsRef.current[oldId];
      }
    });

    // B) Subscribe to newly added IDs
    combinedTravelerIds.forEach((travId) => {
      // if not already subscribed => subscribe
      const topic = `/topic/corporateEmpTravelPolicy_${travId}`;
      if (!travelerSubsRef.current[travId]) {
        const subscription = stompClientRef.current.subscribe(
          topic,
          async (msg) => {
            // Check for duplicate message
            if (processedMessageIds.current.has(msg.headers["message-id"])) {
              console.log(
                "Skipping duplicate travel policy message:",
                msg.headers["message-id"]
              );
              return;
            }
            addProcessedMessageId(msg.headers["message-id"]);

            console.log(
              `Received policy update for traveler ${travId} with message ID: ${msg.headers["message-id"]}`
            );

            // If ID is user's own => re-fetch
            if (travId === userId) {
              debouncedFetchUserDetails();
            }

            // Dispatch to Redux (only once per message)
            store.dispatch(setPolicyChanged(true));

            const state = store.getState();
            const selectedTravelers = state.travellers.selectedTravelers;
            if (selectedTravelers?.length) {
              const selectedIds = selectedTravelers.map((trav) => trav.value);
              store.dispatch(fetchEmployeesByIds(selectedIds));
            }

            store.dispatch(refetchFixedInitialOptions());
          }
        );

        travelerSubsRef.current[travId] = subscription;
        console.log(
          `✅ Subscribed to topic: ${topic} (Traveler ID: ${travId})`
        );
      } else {
        console.log(
          `ℹ️ Already subscribed to topic: ${topic} (Traveler ID: ${travId})`
        );
      }
    });
  }, [isConnected, combinedTravelerIds, userId, debouncedFetchUserDetails]);

  return null; // No UI
};

export default useWebSockets;
