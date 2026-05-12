// Notification.js
import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { createPortal } from "react-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchNotifications,
  fetchTripReminders,
  markAllAsRead,
  markAsRead,
  resetNotifications,
  setNeedsRefresh as setNotificationNeedsRefresh,
} from "@/store/slices/notificationSlice";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBed,
  faPlane,
  faSpinner,
  faTrain,
  faBus,
  faTaxi,
} from "@fortawesome/free-solid-svg-icons";
import style from "./styles.module.css";
import { useRouter } from "next/router";
import axios, { getTabSpecificData } from "@/utils/axios/axios";
import config from "@/config";
import showToast from "@/utils/toast";
import RequestModal from "@/components/corporate/approvalRequest/request";
import Loader from "@/components/corporate/loader/Loader";
import WalletPaymentModal from "@/components/Modals/WalletPaymentModal";
import { formatPrice } from "@/utils/common";
import { routeToPg } from "@/paymentGateways/pgRouting";
import { getPaymentSessionID } from "@/utils/bookingAPI";
import { setNeedsRefresh } from "@/store/slices/approvalSlice";
import { useUserPermissions } from "@/hooks/useUserPermissions";
import {
  confirmPaymentHotels,
  confirmPaymentFlights,
} from "@/utils/walletApis";
import { selectCorporateWalletBalance } from "@/store/selectors/corporateSelectors";

const Notification = ({ isOpen, onClose }) => {
  const walletBalance = useSelector(selectCorporateWalletBalance);

  const { userType, isApprover, isAdminApprover } = useUserPermissions();

  const userDetails = useSelector((state) => state?.user?.userInfo);
  const isWalletAllowed =
    userDetails?.loggedInDetails?.configuration?.walletAllowed;

  const [activeButton, setActiveButton] = useState(1);
  const [activeTab, setActiveTab] = useState(null);
  const [isCancelRequestModalOpen, setIsCancelRequestModalOpen] =
    useState(false);
  const [loading, setLoading] = useState(false);
  const [confirmationType, setConfirmationType] = useState(null);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [pageLoader, setPageLoader] = useState(false);
  const [confirmingApprovalId, setConfirmingApprovalId] = useState(null);
  const [hoveredIndex, setHoveredIndex] = useState(null);
  const [walletModalData, setWalletModalData] = useState(null);

  const dispatch = useDispatch();
  const router = useRouter();
  const userId = getTabSpecificData("userID");

  const needsRefresh = useSelector((state) => state?.approvals?.needsRefresh);
  const approvals = useSelector(
    (state) => state?.notifications?.notifications?.approvals,
  );
  const travelRequests = useSelector(
    (state) => state?.notifications?.notifications?.travelRequests,
  );
  const tripReminders = useSelector(
    (state) => state?.notifications?.notifications?.tripReminders,
  );
  const hasMoreApprovals = useSelector(
    (state) => state?.notifications?.hasMoreApprovals,
  );
  const hasMoreTravelRequests = useSelector(
    (state) => state?.notifications?.hasMoreTravelRequests,
  );
  const approvalsPage = useSelector(
    (state) => state?.notifications?.approvalsPage,
  );
  const travelRequestsPage = useSelector(
    (state) => state?.notifications?.travelRequestsPage,
  );

  const needsNotificationRefresh = useSelector(
    (state) => state?.notifications?.needsRefresh,
  );

  const notificationCount = useSelector((state) => state?.notifications?.count);

  const [loadingMoreApprovals, setLoadingMoreApprovals] = useState(false);
  const [loadingMoreTravelRequests, setLoadingMoreTravelRequests] =
    useState(false);

  // Refs for infinite scroll
  const approvalsObserver = useRef();
  const travelRequestsObserver = useRef();

  // Helper functions for transport bookings
  const isTransportBooking = (travelCategory) => {
    return ["3", "4", "5"].includes(travelCategory);
  };

  const getTransportIcon = (travelCategory) => {
    switch (travelCategory) {
      case "3":
        return faTrain;
      case "4":
        return faBus;
      case "5":
        return faTaxi;
      default:
        return faTrain;
    }
  };

  const getTransportName = (travelCategory) => {
    switch (travelCategory) {
      case "3":
        return "Train";
      case "4":
        return "Bus";
      case "5":
        return "Cab/Taxi";
      default:
        return "Transport";
    }
  };

  const getBookingIcon = (travelCategory) => {
    if (isTransportBooking(travelCategory)) {
      return getTransportIcon(travelCategory);
    }
    return travelCategory === "1" ? faBed : faPlane;
  };

  const getRequestTypeLabel = (travelCategory) => {
    if (isTransportBooking(travelCategory)) {
      return getTransportName(travelCategory);
    }
    return travelCategory === "1" ? "Stay" : "Flight";
  };

  const tabData = useMemo(
    () => [
      {
        id: 1,
        title: "For You to Approve",
      },
      {
        id: 2,
        title: "Your Travel Requests",
      },
    ],
    [],
  );

  const getFilteredTabs = useCallback(() => {
    if (userType) {
      if (userType === 1 || isAdminApprover || isApprover) {
        return tabData; // Return all tabs for admin, approver, or admin approver
      } else if (userType === 2) {
        return tabData.filter((tab) => tab.id === 2); // Only "Your Travel Requests" for regular employees
      }
    }
    return [];
  }, [userType, isAdminApprover, isApprover, tabData]);

  useEffect(() => {
    const filteredTabs = getFilteredTabs();
    if (filteredTabs.length > 0 && activeTab === null) {
      const initialRequestType = filteredTabs[0].id;
      setActiveTab(initialRequestType);
    }
  }, [getFilteredTabs, activeTab]);

  const handleMarkAllAsRead = () => {
    dispatch(markAllAsRead({ userId }))
      .then((result) => {
        if (result.meta.requestStatus === "fulfilled") {
          dispatch(resetNotifications());
        }
      })
      .catch((error) => {
        console.error("Failed to mark all as read:", error);
        showToast("error", "Failed to mark all notifications as read");
      });
  };

  useEffect(() => {
    let isCancelled = false;

    const fetchData = async () => {
      if (!isOpen) return;

      setLoading(true);

      try {
        if (activeButton === 1) {
          if (
            activeTab === 1 &&
            (needsNotificationRefresh.approvals || approvals.length === 0)
          ) {
            await dispatch(
              fetchNotifications({
                userId,
                requestType: "4",
                pageNo: approvalsPage,
              }),
            );
          } else if (
            activeTab === 2 &&
            (needsNotificationRefresh.travelRequests ||
              travelRequests.length === 0)
          ) {
            await dispatch(
              fetchNotifications({
                userId,
                requestType: "2",
                pageNo: travelRequestsPage,
              }),
            );
          }
        } else if (
          activeButton === 2 &&
          (needsNotificationRefresh.tripReminders || tripReminders.length === 0)
        ) {
          await dispatch(fetchTripReminders({ userId }));
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        if (!isCancelled) {
          setLoading(false);
        }
      }
    };
    fetchData();

    return () => {
      isCancelled = true;
    };
  }, [
    isOpen,
    activeButton,
    dispatch,
    userId,
    activeTab,
    needsNotificationRefresh,
    approvalsPage,
    travelRequestsPage,
    approvals.length,
    travelRequests.length,
    tripReminders.length,
  ]);

  useEffect(() => {
    if (needsRefresh) {
      dispatch(
        fetchNotifications({ userId, requestType: "4", pageNo: approvalsPage }),
      );
      dispatch(setNeedsRefresh(false)); // Reset needsRefresh
    }
  }, [needsRefresh, dispatch, userId, approvalsPage]);

  // Watch for needsRefresh flags
  useEffect(() => {
    if (
      needsNotificationRefresh.approvals &&
      activeTab === 1 &&
      activeButton === 1
    ) {
      dispatch(
        fetchNotifications({ userId, requestType: "4", pageNo: 1 }),
      ).then(() => {
        dispatch(setNotificationNeedsRefresh({ approvals: false }));
      });
    }
    if (
      needsNotificationRefresh.travelRequests &&
      activeTab === 2 &&
      activeButton === 1
    ) {
      dispatch(
        fetchNotifications({ userId, requestType: "2", pageNo: 1 }),
      ).then(() => {
        dispatch(setNotificationNeedsRefresh({ travelRequests: false }));
      });
    }
    if (needsNotificationRefresh.tripReminders && activeButton === 2) {
      dispatch(fetchTripReminders({ userId })).then(() => {
        dispatch(setNotificationNeedsRefresh({ tripReminders: false }));
      });
    }
  }, [
    needsNotificationRefresh,
    activeTab,
    activeButton,
    dispatch,
    userId,
    approvalsPage,
    travelRequestsPage,
  ]);

  // Infinite Scroll for Approvals
  const lastApprovalElementRef = useCallback(
    (node) => {
      if (loadingMoreApprovals) return;
      if (approvalsObserver.current) approvalsObserver.current.disconnect();
      approvalsObserver.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMoreApprovals) {
          setLoadingMoreApprovals(true);
          dispatch(
            fetchNotifications({
              userId,
              requestType: "4",
              pageNo: approvalsPage + 1,
            }),
          ).then(() => setLoadingMoreApprovals(false));
        }
      });
      if (node) approvalsObserver.current.observe(node);
    },
    [loadingMoreApprovals, hasMoreApprovals, approvalsPage, dispatch, userId],
  );

  // Infinite Scroll for Travel Requests
  const lastTravelRequestElementRef = useCallback(
    (node) => {
      if (loadingMoreTravelRequests) return;
      if (travelRequestsObserver.current)
        travelRequestsObserver.current.disconnect();
      travelRequestsObserver.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMoreTravelRequests) {
          setLoadingMoreTravelRequests(true);
          dispatch(
            fetchNotifications({
              userId,
              requestType: "2",
              pageNo: travelRequestsPage + 1,
            }),
          ).then(() => setLoadingMoreTravelRequests(false));
        }
      });
      if (node) travelRequestsObserver.current.observe(node);
    },
    [
      loadingMoreTravelRequests,
      hasMoreTravelRequests,
      travelRequestsPage,
      dispatch,
      userId,
    ],
  );

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "visible";
    }

    return () => {
      document.body.style.overflow = "visible";
    };
  }, [isOpen]);

  // Function to format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const options = {
      weekday: "short",
      day: "numeric",
      month: "short",
      year: "numeric",
    };
    return date.toLocaleDateString(undefined, options);
  };

  const getTimeAgo = (timestamp) => {
    const now = new Date();
    const diff = now - new Date(timestamp);
    const seconds = Math.floor(diff / 1000);
    if (seconds < 60) return `${seconds} seconds ago`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes} minutes ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} hours ago`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days} days ago`;
    const weeks = Math.floor(days / 7);
    if (weeks < 4) return `${weeks} weeks ago`;
    const months = Math.floor(days / 30);
    if (months < 12) return `${months} months ago`;
    const years = Math.floor(days / 365);
    return `${years} years ago`;
  };

  const handleViewDetails = async (trip) => {
    setPageLoader(true);
    try {
      // Mark the notification as read
      dispatch(markAsRead({ userId, bookingId: trip.bookingId }));
      let url;
      if (trip.travelCategory === "1") {
        url = `/corporate/auth/booking/hotels/approvalStatus?bookingId=${trip?.bookingId}`;
      } else if (isTransportBooking(trip.travelCategory)) {
        // Transport booking URL
        url = `/corporate/auth/booking/carbustrain/commonApproval?bookingId=${trip?.bookingId}`;
      } else {
        url = `/corporate/auth/booking/flights/flightApproval?bookingId=${trip?.bookingId}`;
      }
      await router.push(url);
      onClose();
    } catch (error) {
      console.log(error);
    } finally {
      setPageLoader(false);
    }
  };

  const remindersViewDetails = async (trip) => {
    setPageLoader(true);
    try {
      let url;
      if (trip.product === "Hotel") {
        url = `/corporate/auth/booking/hotels/approvalStatus?bookingId=${trip?.bookingId}`;
      } else if (
        trip.product === "Transport" ||
        ["Train", "Bus", "Cab/Taxi"].includes(trip.product)
      ) {
        url = `/corporate/auth/booking/transport/approvalStatus?bookingId=${trip?.bookingId}`;
      } else {
        url = `/corporate/auth/booking/flights/flightApproval?bookingId=${trip?.bookingId}`;
      }
      await router.push(url);
    } catch (error) {
      console.log(error);
    } finally {
      setPageLoader(false);
      onClose();
    }
  };

  const openConfirmationModal = (type, request) => {
    setConfirmationType(type);
    setSelectedRequest(request);
    setConfirmingApprovalId(request.bookingId);
  };

  const handleApprove = async () => {
    setLoading(true);
    try {
      const url = `${config.CORPORATE.UPDATE_APPROVAL_STATUS}?bookingId=${selectedRequest?.bookingId}&status=Approved`;
      const response = await axios.post(url);
      if (response?.data?.status === "SUCCESS") {
        showToast("success", "Request approved successfully");
        // dispatch(resetNotifications());
        // Mark as read
        dispatch(markAsRead({ userId, bookingId: selectedRequest.bookingId }));
        setConfirmingApprovalId(null);
      }
    } catch (error) {
      console.error("Error approving request:", error);
      showToast(
        "error",
        error?.response?.data?.message || "Failed to approve request",
      );
    } finally {
      setLoading(false);
      setConfirmingApprovalId(null);
    }
  };

  const handleReject = async () => {
    setLoading(true);
    try {
      const url = `${config.CORPORATE.UPDATE_APPROVAL_STATUS}?bookingId=${selectedRequest?.bookingId}&status=Declined`;
      const response = await axios.post(url);
      if (response?.data?.status === "SUCCESS") {
        showToast("success", "Request rejected successfully");
        // dispatch(resetNotifications());
        // Mark as read
        dispatch(markAsRead({ userId, bookingId: selectedRequest.bookingId }));
        setConfirmingApprovalId(null);
      }
    } catch (error) {
      console.error("Error rejecting request:", error);
      showToast(
        "error",
        error?.response?.data?.message || "Failed to reject request",
      );
    } finally {
      setLoading(false);
      setConfirmingApprovalId(null);
    }
  };

  const showCancelRequestModal = (request) => {
    setSelectedRequest(request);
    setIsCancelRequestModalOpen(true);
  };

  const closeCancelRequestModal = () => {
    setIsCancelRequestModalOpen(false);
    setLoading(false);
  };

  const handleCancelRequest = async (data) => {
    setLoading(true);
    try {
      let url = `${config.CORPORATE.CANCEL_APPROVAL}?bookingId=${selectedRequest?.bookingId}`;

      if (data?.reason) {
        url += `&reason=${encodeURIComponent(data.reason)}`;
      }
      if (data?.description) {
        url += `&description=${encodeURIComponent(data.description)}`;
      }
      const response = await axios.post(url);
      if (response?.data?.status === "SUCCESS") {
        showToast("success", "Approval Request cancelled successfully");
        setIsCancelRequestModalOpen(false);
        // Mark as read
        dispatch(markAsRead({ userId, bookingId: selectedRequest.bookingId }));
      }
    } catch (error) {
      console.log(error);
      showToast(
        "error",
        error?.response?.data?.message || "Something went wrong",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleProceedToPay = (trip) => {
    const totalAmount = Number(trip?.bookingdetails?.totalBookingAmount || 0);
    if (isWalletAllowed && walletBalance > 0) {
      setWalletModalData({ trip, totalAmount });
    } else {
      handlePaymentProcess(totalAmount, 0, trip);
    }
  };

  const handlePaymentProcess = async (payableAmount, walletDeduction, trip) => {
    setLoading(true);
    try {
      if (payableAmount > 0) {
        const pgResponse = await axios.get(config.GET_PAYMENT_GATEWAY);
        if (pgResponse?.data?.status === "SUCCESS") {
          const pgCode = pgResponse?.data?.data?.pgCode;
          if (trip.travelCategory === "1") {
            await handleHotelPayment(
              pgCode,
              payableAmount,
              walletDeduction,
              trip,
            );
          } else {
            await handleFlightPayment(
              pgCode,
              payableAmount,
              walletDeduction,
              trip,
            );
          }
        }
      } else {
        // Payable amount is zero, confirm payment and redirect
        if (trip?.travelCategory === "1") {
          await confirmHotelPayment(walletDeduction, trip);
        } else {
          await confirmFlightPayment(walletDeduction, trip);
        }
      }
    } catch (error) {
      console.log("Error during payment:", error);
      showToast("error", "Payment process failed.");
    } finally {
      setLoading(false);
      setWalletModalData(null);
    }
  };

  const handleFlightPayment = async (
    pgCode,
    payableAmount,
    walletDeduction,
    trip,
  ) => {
    try {
      let bookingPaymentRef;
      const bookingPaymentRefs =
        trip?.bookingResponse?.[0]?.data?.bookingPaymentRefId;
      const mobileNumber = getTabSpecificData("phoneNumber");
      const bookingId = trip?.bookingId;
      const companyId = trip?.companyId;
      if (bookingPaymentRefs) {
        bookingPaymentRef = {
          bookingPaymentRefIds: [bookingPaymentRefs],
          isWeb: true,
        };
      }
      const redirectUrl = null;
      const walletAmount = Math.max(0, walletDeduction);
      const charges = 0;
      const paymentCategory = "BOOKING";
      const amount = payableAmount;
      const travelCategory = 2;
      const getPaymentSessionIDResp = await getPaymentSessionID(
        redirectUrl,
        walletAmount,
        charges,
        paymentCategory,
        bookingId,
        amount,
        mobileNumber,
        pgCode,
        travelCategory,
        bookingPaymentRef,
        null,
      );

      if (
        getPaymentSessionIDResp !== null &&
        getPaymentSessionIDResp.data.data.paymentSessionId !== ""
      ) {
        const queryParams = {
          booking_id: bookingId,
        };
        routeToPg(
          pgCode,
          getPaymentSessionIDResp.data.data.paymentSessionId,
          queryParams,
          bookingId,
          2,
          "BOOKING",
          "",
          companyId,
        );
      }
    } catch (error) {
      console.log(error);
    }
  };

  const handleHotelPayment = async (
    pgCode,
    payableAmount,
    walletDeduction,
    trip,
  ) => {
    try {
      const mobile = getTabSpecificData("phoneNumber");
      const bookingId = trip.bookingId;
      const companyId = trip.companyId;
      const payload = {
        pgCode,
        travelCategory: "1",
        charges: 0,
        walletAmount: Math.max(0, walletDeduction),
        paymentCategory: "BOOKING",
        bookingId,
        companyId,
        orderAmount: payableAmount,
        customerDetails: {
          customerPhone: mobile,
          customerName: null,
          customerEmail: null,
        },
      };

      const response = await axios.post(`${config.GET_SESSION_ID}`, payload);
      if (response?.data?.status === "SUCCESS") {
        routeToPg(
          pgCode,
          response.data.data.paymentSessionId,
          { bookingId },
          bookingId,
          1,
          "BOOKING",
          "",
          companyId,
        );
      }
    } catch (error) {
      console.log("Hotel payment error:", error);
    }
  };

  const confirmHotelPayment = async (walletDeduction, trip) => {
    try {
      const bookingId = trip?.bookingId;
      const companyId = trip?.companyId;
      const confirmReq = {
        bookingId: bookingId,
        paymentRefernceId: companyId,
        paymentStatus: "SUCCESS",
        paymentAmount: 0,
        pgCode: null,
        walletAmount: Math.max(0, walletDeduction),
      };
      const resp = await confirmPaymentHotels(confirmReq);
      console.log(resp);
      // if (resp?.message === "SUCCESS") {
      router.push({
        pathname: "/corporate/auth/booking/hotels/confirmation",
        query: { bookingId: bookingId },
      });
    } catch (error) {
      console.log("Error confirming hotel payment", error);
      showToast("error", "Failed to confirm hotel payment.");
    }
  };

  const confirmFlightPayment = async (walletDeduction, trip) => {
    try {
      const bookingId = trip?.bookingId;
      const companyId = trip?.companyId;
      const confirmReq = {
        bookingId: bookingId,
        paymentReferenceId: companyId,
        paymentStatus: "SUCCESS",
        paymentAmount: 0,
        pgCode: null,
        walletAmount: Math.max(0, walletDeduction),
      };
      const resp = await confirmPaymentFlights(confirmReq);
      // if (resp?.message === "SUCCESS") {
      router.push({
        pathname: "/corporate/auth/booking/flights/flightConfirm",
        query: { booking_id: bookingId },
      });
    } catch (error) {
      console.log("Error confirming flight payment", error);
      showToast("error", "Failed to confirm flight payment.");
    }
  };

  return createPortal(
    <>
      {isOpen && (
        <div
          className="fixed inset-0 bg-black opacity-50 z-[99999] cursor-pointer"
          onClick={onClose}
        ></div>
      )}
      {/* Top Sheet */}
      <div
        className={`fixed m-1 mt-0 rounded-lg top-0 right-0 p-2 h-[80%] w-[80%] sm:w-[30%] z-[999999] bg-white shadow-lg transition-transform duration-500 ease-in-out transform ${
          isOpen ? "translate-y-0 mt-1" : "-translate-y-full"
        }`}
      >
        <div className="flex items-center justify-between">
          <div className="text-base text-[#443C38E5] font-medium">
            Notifications
          </div>
          {notificationCount > 0 && (
            <div
              onClick={handleMarkAllAsRead}
              className="text-[#878786] font-medium text-sm cursor-pointer"
            >
              Clear All
            </div>
          )}
        </div>
        <div className="mt-3">
          <div className="flex items-center bg-[#028FA31A] p-2 rounded-full justify-between w-full">
            {/* Approvals Button */}
            <button
              className={`py-1 px-4 rounded-full text-sm  ${
                activeButton === 1
                  ? "bg-[#028FA3] text-white font-semibold"
                  : "bg-transparent text-[#028FA3] font-normal"
              }`}
              onClick={() => setActiveButton(1)}
            >
              Approvals
            </button>

            {/* Trip Reminders Button */}
            <button
              className={`py-1 px-4 rounded-full text-sm  ${
                activeButton === 2
                  ? "bg-[#028FA3] text-white font-semibold"
                  : "bg-transparent text-[#028FA3] font-normal"
              }`}
              onClick={() => setActiveButton(2)}
            >
              Reminders
            </button>
          </div>
        </div>

        <div className="border-b-2 border-[#A7AAAB80] mt-3 -m-2 "></div>

        {loading ? (
          <div className="flex justify-center py-4">
            <FontAwesomeIcon icon={faSpinner} spin />
          </div>
        ) : (
          <div className="mt-3 ">
            {activeButton === 1 && (
              <>
                <div>
                  <div className="flex justify-around w-full ">
                    {getFilteredTabs().map((tab) => (
                      <button
                        key={tab.id}
                        className={`text-xs  p-2 ${
                          activeTab === tab.id
                            ? "text-[#443C38] font-medium border-b-2 border-[#028fa3]"
                            : "text-[#878786] font-normal"
                        }`}
                        onClick={() => setActiveTab(tab.id)}
                      >
                        {tab.title}
                      </button>
                    ))}
                  </div>

                  {activeTab === 1 && (
                    <>
                      <div className={style.Notification}>
                        <div className="p-1 mt-2 ">
                          {approvals?.map((approval, index) => {
                            const isLastElement =
                              approvals.length === index + 1;
                            // Extract necessary data from approval
                            const {
                              bookingId,
                              bookingResponse,
                              bookingdetails,
                              userName,
                              travelCategory,
                              createdAt = bookingResponse?.[0]?.data
                                ?.createdDate,
                              approvalStatus,
                              companyId,
                              isRead,
                              transportBookingData, // Transport booking data
                            } = approval;

                            const isHotel = travelCategory === "1";
                            const isTransport =
                              isTransportBooking(travelCategory);
                            const icon = getBookingIcon(travelCategory);
                            const requestTypeLabel =
                              getRequestTypeLabel(travelCategory);

                            // Get transport booking status if it's a transport booking

                            const transportData = transportBookingData;
                            const transportBookingStatus =
                              transportBookingData?.booking?.bookingStatus ||
                              "pending";
                            const isQuoted =
                              transportBookingStatus === "quoted";

                            const formattedDate = formatDate(createdAt);
                            const timeAgo = getTimeAgo(createdAt);

                            // Primary Traveler
                            const primaryTraveler =
                              bookingdetails?.passengerDetails?.[0]?.email ||
                              "N/A";

                            // Travelers Count
                            const travelersCount =
                              bookingdetails?.passengerDetails?.length || 1;

                            // Destination info
                            let destinationInfo = "";
                            if (isHotel) {
                              destinationInfo = `${
                                bookingResponse?.HotelName || "Hotel"
                              }, ${bookingResponse?.CityName || ""}`;
                            } else if (isTransport) {
                              // For transport, get from transport booking data
                              const journeys =
                                transportBookingData?.bookingDetails || [];
                              if (journeys.length > 0) {
                                const firstJourney = journeys[0];
                                const fromCity =
                                  firstJourney.fromCity?.name ||
                                  firstJourney.fromCity;
                                const toCity =
                                  firstJourney.toCity?.name ||
                                  firstJourney.toCity;
                                destinationInfo = `${fromCity} - ${toCity}`;
                              } else {
                                destinationInfo = `${
                                  bookingdetails?.origin || ""
                                } - ${bookingdetails?.destination || ""}`;
                              }
                            } else {
                              // Flight
                              destinationInfo = `${
                                bookingdetails?.origin || ""
                              } - ${bookingdetails?.destination || ""}`;
                            }

                            // Render approval buttons based on booking type and status
                            const renderApprovalButtons = () => {
                              // For transport bookings, only show buttons if quoted

                              const isAutoRejected =
                                transportData?.booking?.autoRejected || false;
                              const rejectionReason =
                                transportData?.booking?.rejectionReason || null;
                              const policyViolations =
                                transportData?.booking?.policyViolationDetails
                                  ?.violationMessages || [];

                              // ✅ Handle auto-rejected bookings (highest priority)
                              if (
                                isTransport &&
                                isAutoRejected &&
                                transportBookingStatus === "rejected"
                              ) {
                                return (
                                  <div className="flex flex-col items-start p-3 bg-red-50 rounded-lg border border-red-200">
                                    <div className="flex items-center gap-2 mb-2">
                                      <span className="text-red-600 text-lg">
                                        🚫
                                      </span>
                                      <div className="text-sm text-red-700 font-semibold">
                                        Auto-Rejected
                                      </div>
                                    </div>

                                    {/* Main Rejection Reason */}
                                    {rejectionReason && (
                                      <div className="text-xs text-red-600 mb-2 font-medium">
                                        {rejectionReason}
                                      </div>
                                    )}

                                    {/* Policy Violation Details */}
                                    {policyViolations.length > 0 && (
                                      <div className="mt-2 w-full">
                                        <div className="text-xs text-gray-700 font-semibold mb-1">
                                          Policy Violations:
                                        </div>
                                        <ul className="list-disc list-inside space-y-1">
                                          {policyViolations.map(
                                            (violation, index) => (
                                              <li
                                                key={index}
                                                className="text-xs text-gray-600"
                                              >
                                                {violation}
                                              </li>
                                            ),
                                          )}
                                        </ul>
                                      </div>
                                    )}

                                    {/* Additional Info */}
                                    <div className="text-xs text-gray-500 mt-2 italic">
                                      This booking was automatically rejected
                                      due to policy violations.
                                    </div>
                                  </div>
                                );
                              }

                              // ✅ Handle manually rejected bookings (not auto-rejected)
                              if (
                                isTransport &&
                                transportBookingStatus === "rejected" &&
                                !isAutoRejected
                              ) {
                                return (
                                  <div className="flex flex-col items-center p-2">
                                    <div className="text-center">
                                      <div className="text-sm text-red-600 font-medium mb-1">
                                        ❌ Booking Rejected
                                      </div>
                                      <div className="text-xs text-gray-600">
                                        This transport booking has been rejected
                                      </div>
                                      {rejectionReason && (
                                        <div className="text-xs text-gray-500 mt-1 italic">
                                          Reason: {rejectionReason}
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                );
                              }
                              if (isTransport && !isQuoted) {
                                return (
                                  <div className="flex flex-col items-center text-center">
                                    <div className="text-xs text-[#C2A406] font-medium mb-1">
                                      ⏳ Waiting for Quote
                                    </div>
                                    <div className="text-xxs text-gray-600">
                                      QuGo is working on getting the best quote
                                    </div>
                                    <div className="text-xxs text-gray-500 mt-1">
                                      Status:{" "}
                                      <span className="font-medium capitalize">
                                        {transportBookingStatus}
                                      </span>
                                    </div>
                                  </div>
                                );
                              }

                              // Regular approve/reject buttons
                              return (
                                <div className="flex gap-1 sm:gap-2">
                                  <button
                                    onClick={() =>
                                      openConfirmationModal("approve", approval)
                                    }
                                    className=" bg-[#418C1226] p-1 px-2 text-[#418C12] rounded-full text-xxs sm:text-xs font-semibold mt-2"
                                  >
                                    APPROVE
                                  </button>
                                  <button
                                    onClick={() =>
                                      openConfirmationModal("reject", approval)
                                    }
                                    className=" bg-[#FFFFFF] p-1 px-2  text-[#E53944CC] border-1 border-[#E5394450] rounded-full text-xxs sm:text-xs font-semibold mt-2"
                                  >
                                    DECLINE
                                  </button>
                                </div>
                              );
                            };

                            return (
                              <div
                                key={bookingId}
                                ref={
                                  isLastElement ? lastApprovalElementRef : null
                                }
                                className="flex gap-2 items-center border-b-2 border-[#E2E5E6] py-3 relative"
                              >
                                <div className="flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 cursor-pointer text-white bg-[#FA5D0480] text-xxs sm:text-sm border border-solid border-[#FA5D0480] rounded-full">
                                  {userName
                                    .split(" ")
                                    .slice(0, 2)
                                    .map((n) => n[0])
                                    .join("")
                                    .toUpperCase()}
                                </div>

                                <div className="flex flex-col space-y-1 flex-grow">
                                  <div className="text-[#443C38] text-xs font-medium">
                                    {userName} has requested for approval.
                                  </div>
                                  <div className=" flex text-[#443C38D9] text-xs font-semibold">
                                    {requestTypeLabel}:{" "}
                                    <div className="text-[#443C38D9] text-xs font-normal  ">
                                      {destinationInfo} {" | "}
                                      {isHotel && <br />}
                                      {formattedDate}
                                    </div>
                                  </div>

                                  {/* Transport booking status display */}
                                  {isTransport && (
                                    <div className="text-[#443C38D9] text-xs font-semibold">
                                      Booking Status:{" "}
                                      <span
                                        className={`font-normal capitalize ${
                                          transportBookingStatus === "quoted"
                                            ? "text-green-600"
                                            : transportBookingStatus ===
                                                "pending"
                                              ? "text-yellow-600"
                                              : "text-gray-600"
                                        }`}
                                      >
                                        {transportBookingStatus}
                                      </span>
                                    </div>
                                  )}

                                  <div
                                    key={index}
                                    className="text-[#443C38D9] text-xs font-semibold relative"
                                  >
                                    Travelers:{" "}
                                    <span className="text-[#443C38D9] text-xs font-normal">
                                      {primaryTraveler}
                                      {travelersCount > 1 && (
                                        <div className="relative inline-block">
                                          {" "}
                                          <span
                                            className="text-[#028FA3] text-xs font-medium cursor-pointer"
                                            onMouseEnter={() =>
                                              setHoveredIndex(index)
                                            }
                                            onMouseLeave={() =>
                                              setHoveredIndex(null)
                                            }
                                          >
                                            +{travelersCount - 1}
                                          </span>
                                          {hoveredIndex === index && (
                                            <div
                                              className="absolute top-full -left-24 bg-white border border-gray-300 rounded-md shadow-lg p-2 z-10"
                                              onMouseEnter={() =>
                                                setHoveredIndex(index)
                                              }
                                              onMouseLeave={() =>
                                                setHoveredIndex(null)
                                              }
                                            >
                                              {bookingdetails?.passengerDetails
                                                ?.slice(1)
                                                .map(
                                                  (traveler, travelerIndex) => (
                                                    <div
                                                      key={travelerIndex}
                                                      className="text-[#443C38D9] text-xs font-normal mb-1"
                                                    >
                                                      {traveler.email}
                                                    </div>
                                                  ),
                                                )}
                                            </div>
                                          )}
                                        </div>
                                      )}
                                    </span>
                                  </div>

                                  <div
                                    onClick={() => handleViewDetails(approval)}
                                    className="text-[#028FA3] text-xs font-medium underline cursor-pointer"
                                  >
                                    {requestTypeLabel} details
                                  </div>
                                  <div className="flex gap-1 sm:gap-5 justify-between items-center">
                                    <div className="text-xxs text-[#777575] font-normal">
                                      {timeAgo}
                                    </div>
                                    <div className="flex ">
                                      {renderApprovalButtons()}
                                    </div>
                                  </div>
                                  {/* Inline Confirmation */}
                                  {confirmingApprovalId === bookingId && (
                                    <div className="mt-2 p-2 bg-gray-100 rounded shadow">
                                      <p className="text-sm">
                                        {confirmationType === "approve"
                                          ? "Are you sure you want to approve this travel request? This action cannot be undone."
                                          : "Are you sure you want to reject this travel request? This action cannot be undone."}
                                      </p>
                                      <div className="flex justify-end mt-2">
                                        <button
                                          className="bg-gray-500 text-white p-1 px-3 rounded hover:bg-gray-700 transition-colors duration-300"
                                          onClick={() =>
                                            setConfirmingApprovalId(null)
                                          }
                                        >
                                          Cancel
                                        </button>
                                        <button
                                          className={`ml-2 p-1 px-3 rounded text-white transition-colors duration-300 ${
                                            confirmationType === "approve"
                                              ? "bg-[#028FA3]"
                                              : "bg-red-600 hover:bg-red-800"
                                          }`}
                                          onClick={
                                            confirmationType === "approve"
                                              ? handleApprove
                                              : handleReject
                                          }
                                          disabled={
                                            loading &&
                                            confirmingApprovalId === bookingId
                                          }
                                        >
                                          {loading &&
                                          confirmingApprovalId === bookingId ? (
                                            <FontAwesomeIcon
                                              icon={faSpinner}
                                              spin
                                              className="mr-2"
                                            />
                                          ) : confirmationType === "approve" ? (
                                            "Approve"
                                          ) : (
                                            "Reject"
                                          )}
                                        </button>
                                      </div>
                                    </div>
                                  )}
                                </div>
                                {/* Blue Dot for Unread Notifications */}
                                {!isRead && (
                                  <div className="h-2 w-2 bg-blue-500 rounded-full absolute right-0 top-0 mt-4 mr-1"></div>
                                )}
                              </div>
                            );
                          })}
                          {loadingMoreApprovals && (
                            <div className="flex justify-center py-2">
                              <FontAwesomeIcon icon={faSpinner} spin />
                            </div>
                          )}
                          {!hasMoreApprovals && approvals?.length === 0 && (
                            <div className="flex flex-col justify-center items-center">
                              <div className="text-[#443C38] font-normal text-sm">
                                There are no requests for you to approve.
                              </div>
                              <div className="text-[#878786] font-normal text-xs">
                                You will get notified when you get travel
                                requests to approve.
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </>
                  )}

                  {activeTab === 2 && (
                    <>
                      <div className={style.Notification}>
                        <div className="p-1 mt-2">
                          {travelRequests.map((request, index) => {
                            const isLastElement =
                              travelRequests.length === index + 1;

                            // Extract necessary data from request
                            const {
                              bookingId,
                              bookingResponse,
                              bookingdetails,
                              approvalStatus,
                              travelCategory,
                              createdAt,
                              paymentStatus,
                              companyId,
                              isRead,
                              transportBookingData,
                            } = request;

                            const isHotel = travelCategory === "1";
                            const isTransport =
                              isTransportBooking(travelCategory);
                            const requestTypeLabel =
                              getRequestTypeLabel(travelCategory);

                            const formattedDate = formatDate(createdAt);
                            const timeAgo = getTimeAgo(createdAt);

                            // Payment Status
                            const isPaid =
                              paymentStatus === "PAID" ||
                              paymentStatus === "SUCCESS";

                            // Title
                            let title = "";
                            if (isHotel) {
                              title = `Stay at ${
                                bookingResponse?.HotelName || "Hotel"
                              }, ${bookingResponse?.CityName || ""}`;
                            } else if (isTransport) {
                              // For transport, get from transport booking data
                              const journeys =
                                transportBookingData?.bookingDetails || [];
                              if (journeys.length > 0) {
                                const firstJourney = journeys[0];
                                const fromCity =
                                  firstJourney.fromCity?.name ||
                                  firstJourney.fromCity;
                                const toCity =
                                  firstJourney.toCity?.name ||
                                  firstJourney.toCity;
                                title = `${getTransportName(
                                  travelCategory,
                                )} from ${fromCity} to ${toCity}`;
                              } else {
                                title = `${getTransportName(
                                  travelCategory,
                                )} from ${bookingdetails?.origin || ""} to ${
                                  bookingdetails?.destination || ""
                                }`;
                              }
                            } else {
                              title = `Flight from ${bookingdetails?.origin} to ${bookingdetails?.destination}`;
                            }

                            const totalBookingAmount =
                              Number(bookingdetails?.totalBookingAmount) ||
                              (isTransport
                                ? Number(
                                    transportBookingData?.booking?.totalAmount,
                                  )
                                : 0) ||
                              0;

                            const renderButtons = () => {
                              if (approvalStatus === "Approved") {
                                if (isPaid) {
                                  return (
                                    <div className="flex items-center gap-2">
                                      <span className="bg-[#418C12] text-white px-4 py-2 rounded-full text-sm">
                                        Paid
                                      </span>
                                    </div>
                                  );
                                }

                                // Don't show payment buttons for transport bookings
                                return (
                                  // userType === 1 ||
                                  !isTransport &&
                                  (isWalletAllowed || userType === 1) && (
                                    <>
                                      <button
                                        onClick={() =>
                                          approvalStatus === "Approved" &&
                                          handleProceedToPay(request)
                                        }
                                        disabled={loading}
                                        className="w-fit px-4 flex flex-col items-center bg-[#028fa3] p-2 rounded-full text-white text-xs"
                                      >
                                        {loading ? (
                                          <div className="flex items-center gap-2">
                                            <FontAwesomeIcon
                                              icon={faSpinner}
                                              spin
                                            />
                                            <span>Processing...</span>
                                          </div>
                                        ) : (
                                          <div>
                                            Proceed to Pay | Rs{" "}
                                            {formatPrice(totalBookingAmount)}
                                          </div>
                                        )}
                                      </button>

                                      {/* Wallet Payment Modal */}
                                      {walletModalData?.trip.bookingId ===
                                        bookingId && (
                                        <WalletPaymentModal
                                          isOpen={!!walletModalData}
                                          onClose={() =>
                                            setWalletModalData(null)
                                          }
                                          onProceed={(
                                            payableAmount,
                                            walletDeduction,
                                          ) =>
                                            handlePaymentProcess(
                                              payableAmount,
                                              walletDeduction,
                                              request,
                                            )
                                          }
                                          totalAmount={
                                            walletModalData.totalAmount
                                          }
                                          travelCategory={travelCategory}
                                          bookingId={bookingId}
                                          companyId={companyId}
                                        />
                                      )}
                                    </>
                                  )
                                );
                              }
                              return null;
                            };

                            return (
                              <div
                                key={bookingId}
                                ref={
                                  isLastElement
                                    ? lastTravelRequestElementRef
                                    : null
                                }
                                className="flex flex-col space-y-1 border-b-2 border-[#E2E5E6] py-3 relative"
                              >
                                <div className="text-[#443C38E5] text-sm font-normal">
                                  Your travel request is{" "}
                                  <span
                                    className={
                                      approvalStatus === "Approved"
                                        ? "text-[#418C12] font-medium"
                                        : approvalStatus === "Declined"
                                          ? "text-[#E53944] font-medium"
                                          : "text-[#C2A406] font-medium"
                                    }
                                  >
                                    {approvalStatus}!
                                  </span>
                                </div>
                                <div className="text-[#443C38] text-xs font-medium">
                                  {title}
                                </div>
                                {/* Transport booking status */}
                                {isTransport &&
                                  transportBookingData?.booking && (
                                    <div className="text-[#443C38D9] text-xs font-semibold">
                                      Booking Status:{" "}
                                      <span
                                        className={`font-normal capitalize ${
                                          transportBookingData.booking
                                            .bookingStatus === "quoted"
                                            ? "text-green-600"
                                            : transportBookingData.booking
                                                  .bookingStatus === "pending"
                                              ? "text-yellow-600"
                                              : "text-gray-600"
                                        }`}
                                      >
                                        {
                                          transportBookingData.booking
                                            .bookingStatus
                                        }
                                      </span>
                                    </div>
                                  )}
                                <div className="flex justify-between items-center">
                                  <div className="text-[#777575] text-xs font-normal">
                                    {formattedDate}
                                  </div>
                                  <button
                                    onClick={() => handleViewDetails(request)}
                                    className="bg-[#028FA314] text-xs font-normal p-2 rounded-lg text-[#028FA3]"
                                  >
                                    View Details
                                  </button>
                                </div>
                                <div className="flex justify-between items-center mt-2">
                                  <div className="text-xxs text-[#777575] font-normal">
                                    {timeAgo}
                                  </div>
                                  {renderButtons()}
                                </div>
                                {!isRead && (
                                  <div className="h-2 w-2 bg-blue-500 rounded-full absolute right-0 top-0 mt-4 mr-4"></div>
                                )}
                              </div>
                            );
                          })}
                          {loadingMoreTravelRequests && (
                            <div className="flex justify-center py-2">
                              <FontAwesomeIcon icon={faSpinner} spin />
                            </div>
                          )}
                          {!hasMoreTravelRequests &&
                            travelRequests.length === 0 && (
                              <div className="flex flex-col justify-center items-center">
                                <div className="text-[#443C38] font-normal text-sm">
                                  No travel requests have been raised by you.
                                </div>
                                <div className="text-[#878786] font-normal text-xs">
                                  Requests raised by you will appear here.
                                </div>
                              </div>
                            )}
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </>
            )}

            {activeButton === 2 && (
              <>
                <div className={style.Notification1}>
                  <div className="p-3 mt-2 flex flex-col">
                    {tripReminders.map((reminder, index) => {
                      const {
                        bookingId,
                        travelDate,
                        amount,
                        customerName,
                        product,
                        bookingStatus,
                        walletAmount,
                        totalPaid,
                        refundAmount,
                        walletRefundAmount,
                      } = reminder;

                      // Format travel date
                      const formattedDate = new Date(
                        travelDate,
                      ).toLocaleDateString("en-IN", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      });

                      const isFlight = product === "Flight";
                      const isHotel = product === "Hotel";
                      const isTransport = [
                        "Transport",
                        "Train",
                        "Bus",
                        "Cab/Taxi",
                      ].includes(product);

                      let icon = faPlane;
                      let bgColor = "bg-blue-100";
                      let iconColor = "text-blue-500";

                      if (isHotel) {
                        icon = faBed;
                        bgColor = "bg-orange-100";
                        iconColor = "text-orange-500";
                      } else if (isTransport) {
                        if (product === "Train") {
                          icon = faTrain;
                        } else if (product === "Bus") {
                          icon = faBus;
                        } else if (product === "Cab/Taxi") {
                          icon = faTaxi;
                        } else {
                          icon = faTrain; // Default for generic transport
                        }
                        bgColor = "bg-green-100";
                        iconColor = "text-green-500";
                      }

                      const statusColor =
                        bookingStatus.toLowerCase() === "confirmed"
                          ? "text-green-600"
                          : "text-red-600";

                      return (
                        <div
                          key={index}
                          className="flex justify-between items-center border-b-2 border-[#E2E5E6] py-3"
                        >
                          {/* Icon */}
                          <div className={`${bgColor} rounded-lg p-2`}>
                            <FontAwesomeIcon
                              icon={icon}
                              className={iconColor}
                            />
                          </div>

                          {/* Details */}
                          <div className="flex-1 mx-2">
                            <div className="text-gray-700 text-sm font-medium">
                              {customerName} - {product}
                            </div>
                            <div className="text-gray-500 text-xs">
                              Date: {formattedDate}
                            </div>
                            <div className="text-gray-500 text-xs">
                              Amount: ₹{formatPrice(amount)}
                            </div>
                            <div
                              className={`text-xs ${statusColor} font-semibold`}
                            >
                              Status: {bookingStatus}
                            </div>
                            {walletAmount > 0 && (
                              <div className="text-gray-500 text-xs">
                                Wallet Amount Used: ₹{formatPrice(walletAmount)}
                              </div>
                            )}
                            {refundAmount && (
                              <div className="text-gray-500 text-xs">
                                Refund Amount: ₹{formatPrice(refundAmount)}
                              </div>
                            )}
                            {walletRefundAmount > 0 && (
                              <div className="text-gray-500 text-xs">
                                Wallet Refund: ₹
                                {formatPrice(walletRefundAmount)}
                              </div>
                            )}
                          </div>

                          {/* Action */}
                          <button
                            className="text-blue-600 underline text-xs font-medium"
                            onClick={() => remindersViewDetails(reminder)}
                          >
                            View Details
                          </button>
                        </div>
                      );
                    })}
                    {tripReminders.length === 0 && (
                      <div className="flex flex-col justify-center items-center">
                        <div className="text-[#443C38] font-normal text-sm">
                          No reminders for now!
                        </div>
                        <div className="text-[#878786] font-normal text-sm">
                          Check your trip reminders here.
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {isCancelRequestModalOpen && (
        <RequestModal
          isOpen={isCancelRequestModalOpen}
          onClose={closeCancelRequestModal}
          title="Are you sure you want to cancel your Travel Request?"
          subtitle="If you cancel your request, your approver will be notified about the cancellation."
          showApproverDetails={false}
          showReasonInput={true}
          onSubmit={handleCancelRequest}
          buttonConfig={{
            submit: "Cancel Request",
          }}
          loading={loading}
        />
      )}

      {pageLoader && <Loader />}
    </>,
    document.body,
  );
};

export default Notification;
