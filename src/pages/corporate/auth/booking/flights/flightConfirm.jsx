import Link from "next/link";
import { useState, useEffect, useRef, useMemo } from "react";
import React from "react";
import { useRouter } from "next/router";
import useLocalStorage from "@/hooks/useLocalStorage";
import { toast } from "react-toastify";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Header from "@/components/corporate/auth/Header";
import config from "@/config";
import axios, { getTabSpecificData } from "@/utils/axios/axios";
import {
  faCheck,
  faCircleDown,
  faSpinner,
  faXmark,
} from "@fortawesome/free-solid-svg-icons";
import Image from "next/image";
import { getRefundStatus } from "@/utils/profileAPI";
import { faClock } from "@fortawesome/free-regular-svg-icons";
import ApproverDetails from "@/components/corporate/approvalRequest/ApproverDetails";
import TravelerDetails from "@/components/corporate/common/travelerDetails";
import showToast from "@/utils/toast";
import GSTDetails from "@/components/corporate/details/GSTDetails";
import FlightConfirmationSkeleton from "@/components/corporate/Loaders/Flight/FlightConfirmationSkeleton";
import WebSocketService from "@/webSocketService/WebSocketService";
import { useWalletBalance } from "@/hooks/useWalletBalance";
import { getPaymentGateway, getPaymentSessionID } from "@/utils/bookingAPI";
import { confirmPaymentFlights } from "@/utils/walletApis";
import { routeToPg } from "@/paymentGateways/pgRouting";
import { useUserPermissions } from "@/hooks/useUserPermissions";
import ProtectedRoute from "@/components/corporate/protectedRoute/ProtectedRoute";
import {
  ErrorMessage,
  NoDataMessage,
} from "@/components/corporate/errorStatus/StatusComponents";
import { refreshProfile } from "@/store/initializeB2CStore";

export default function FlightConfirm() {
  const [isToastVisible, setIsToastVisible] = useState(false);
  const [isWalletPopupOpen, setIsWalletPopupOpen] = useState(false);
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [bookingDetails, setBookingDetails] = useState();
  const [totalAmount, setTotalAmount] = useState();
  const [travelerFare, setTravelerFare] = useState();
  const [ssrFare, setSsrFare] = useState();
  const [infantCount, setInfantCount] = useState();
  const [adultCount, setAdultCount] = useState();
  const [childCount, setChildCount] = useState();
  const [totalPassengerCount, setTotalPassengerCount] = useState();
  const [refundData, setRefundData] = useState(null);
  const [bookingStatus, setBookingStatus] = useState();
  const [approvalData, setApprovalData] = useState(null);
  const [isRefundLoading, setIsRefundLoading] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const popupRef = useRef(null);
  const [getUserID, setUserID] = useLocalStorage("userID");
  const [getuserip, setuserip] = useLocalStorage("userip");
  const [paymentData, setPaymentData] = useState({
    totalPayableAmount: 0,
    walletAmount: 0,
    totalAmount: 0,
    walletSelected: false,
  });
  const { booking_id, profile } = router.query;
  const { walletBalance } = useWalletBalance();
  const { userType } = useUserPermissions();
  const [downloading, setDownloading] = useState(false);
  const [downloading1, setDownloading1] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [ssrPassengerIndex, setSsrPassengerIndex] = useState(0);
  const [showDetails, setShowDetails] = useState(false);
  const [selectedPassengerIndex, setSelectedPassengerIndex] = useState(0);

  const formatPrice = (price) => {
    console.log("price ", price);
    if (price) {
      return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    }
  };

  useEffect(() => {
    const webSocketService = new WebSocketService();
    let isSocketTriggered = false;
    let hasDataLoaded = false;
    let isInitialFetchCompleted = false;

    const fetchFlightBookingDetails = async (isFromSocket = false) => {
      if (!booking_id) return;

      try {
        if (!isInitialFetchCompleted) setIsLoading(true);
        setErrorMessage("");

        // First API call: Fetch flight booking details
        try {
          const payload = {
            getBookingDetailsReq: {
              endUserIp: getTabSpecificData("userip"),
              bookingId: booking_id,
            },
          };

          const response = await axios.post(
            `${config.FLIGHTS_BOOKING_DETAIL}`,
            payload,
            {
              headers: {
                "Content-Type": "application/json",
              },
            },
          );

          console.log("Flight API response:", response.data);

          if (response.data && response.data.status === "SUCCESS") {
            // Check if booking is still pending
            const isBookingPending =
              response.data?.data[0]?.data?.bookingStatus === "Pending";
            const paymentStatus = response.data?.data[0]?.data?.paymentStatus;

            // If coming from profile OR booking is not pending OR payment has failed, we can process and display the data
            // Don't wait for WebSocket if payment has failed (even if booking status is pending)
            if (
              profile ||
              !isBookingPending ||
              (isBookingPending && paymentStatus === "PENDING")
            ) {
              hasDataLoaded = true;

              // Calculate final booking status
              let finalBookingStatus;
              if (response.data?.data.length > 1) {
                const status1 = response.data.data[0]?.data.bookingStatus;
                const status2 = response.data.data[1]?.data.bookingStatus;

                if (
                  status1.toLowerCase() === "confirmed" &&
                  status2.toLowerCase() === "confirmed"
                ) {
                  finalBookingStatus = "Confirmed";
                } else if (
                  status1.toLowerCase() === "confirmed" ||
                  status2.toLowerCase() === "confirmed"
                ) {
                  finalBookingStatus = "Partial Success";
                } else {
                  finalBookingStatus = "Failed";
                }
              } else {
                finalBookingStatus =
                  response.data.data[0]?.data.bookingStatus === "CONFIRMED"
                    ? "Confirmed"
                    : response.data.data[0]?.data.bookingStatus === "Pending"
                      ? "Pending"
                      : "Failed";
              }

              // Calculate total payment amount
              const totalPayableAmount =
                response.data.data[0]?.data?.flightItinerary?.fare
                  ?.totalAmountWithSSR +
                (response?.data?.data[1]?.data?.flightItinerary?.fare
                  ?.totalAmountWithSSR || 0);

              // Transform approver details
              const transformedApprovalDetails =
                response.data?.data[0].data.approverDetails?.map(
                  (approvalDetail) => {
                    return {
                      value: approvalDetail.employeeUserId,
                      label: approvalDetail.employeeEmail,
                      data: {
                        _id: approvalDetail.employeeUserId,
                        firstName: approvalDetail.employeeName,
                        workEmail: approvalDetail.employeeEmail,
                        approverUserDetails: approvalDetail?.approvers?.map(
                          (approver, i) => ({
                            _id: approver.approverId || i,
                            title: approver.title || "",
                            firstName: approver.firstName || "Unknown",
                            lastName: approver.lastName || "",
                            workEmail: approver.email,
                            approvalStatus:
                              approver.approvalStatus || "Pending",
                          }),
                        ),
                      },
                    };
                  },
                ) || [];

              // Set all the state data
              setBookingStatus(finalBookingStatus);
              setPaymentData({
                totalPayableAmount,
                walletAmount: 0,
                totalAmount: totalPayableAmount,
              });
              setBookingDetails(response.data);
              setApprovalData(transformedApprovalDetails);

              setIsLoading(false);
              if (isFromSocket) {
                            const walletAmountUsed =
                              response.data?.data[0]?.data?.walletAmount;
                            if (walletAmountUsed > 0) {
                              await refreshProfile();
                            }
                          }
            } else {
              // Booking is still pending, payment hasn't failed, and not from profile - keep loading, wait for socket
              console.log(
                "Booking is pending and payment is still processing, waiting for WebSocket update...",
              );
            }
          } else {
            throw new Error("Failed to fetch flight booking details");
          }
        } catch (err) {
          console.error("Flight booking details error:", err);
          if (profile || (isInitialFetchCompleted && !isSocketTriggered)) {
            throw new Error("Failed to fetch flight booking details");
          }
        }

        // Second API call: Fetch additional payment/booking status if needed
        try {
          if (!profile) {
            // Add any additional API calls here if needed
            // await savePaymentDetails(booking_id, "1");
          }
        } catch (err) {
          console.error("Failed to fetch additional flight data:", err);
        }
      } catch (err) {
        if (profile || (isSocketTriggered && !hasDataLoaded)) {
          setErrorMessage(
            err.message || "Unable to fetch flight booking details.",
          );
          setIsLoading(false);
        }
      } finally {
        isInitialFetchCompleted = true;
        if (profile || isSocketTriggered || hasDataLoaded) {
          // Only stop loading if we have processed the data or it's from profile
          if (hasDataLoaded || profile) {
            setIsLoading(false);
          }
        }
      }
    };

    const setupWebSocket = () => {
      try {
        const topic = `/topic/${booking_id}`;
        const callback = (message) => {
          console.log("Flight WebSocket Message:", message);
          isSocketTriggered = true;
          fetchFlightBookingDetails(true); // Refresh data on WebSocket message
        };

        // Ensure connection is established before subscribing
        webSocketService.connect(topic, callback, {
          onConnectSuccess: () => {
            console.log("Flight WebSocket connection established");
          },
          onConnectError: (error) => {
            console.error("Flight WebSocket connection failed:", error);
            // If WebSocket fails and we don't have data loaded, stop loading after some time
            setTimeout(() => {
              if (!hasDataLoaded && !profile) {
                setIsLoading(false);
              }
            }, 10000); // 10 seconds timeout
          },
        });
      } catch (error) {
        console.error("Flight WebSocket setup error:", error);
      }
    };

    if (booking_id) {
      fetchFlightBookingDetails();
      if (!profile) setupWebSocket();
    }

    return () => {
      console.log("Flight socket disconnected");
      webSocketService.disconnect();
    };
  }, [booking_id, profile]);

  const handleClickOutside = (event) => {
    // Check if the click is outside the popup and the button
    if (popupRef.current && !popupRef.current.contains(event.target)) {
      setShowPopup(false);
    }
  };

  useEffect(() => {
    // Add event listener for clicks outside
    document.addEventListener("mousedown", handleClickOutside);

    // Cleanup the event listener on component unmount
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleClosePopup = () => {
    setIsWalletPopupOpen(false);
  };

  const retryPayment = () => {
    setIsWalletPopupOpen(true);
  };

  const handleWalletChange = () => {
    setPaymentData((prevData) => ({
      ...prevData,
      walletSelected: !prevData.walletSelected,
      totalPayableAmount: !prevData.walletSelected
        ? walletBalance > prevData.totalAmount
          ? 0
          : prevData.totalAmount - walletBalance
        : prevData.totalAmount,
      walletAmount: !prevData.walletSelected
        ? walletBalance > prevData.totalAmount
          ? prevData.totalAmount
          : walletBalance
        : 0,
    }));
  };

  const handlePayment = async () => {
    try {
      if (booking_id) {
        const bookingId = booking_id;
        let bookingPaymentRef;
        const mobileNumber = getTabSpecificData("phoneNumber");
        bookingPaymentRef = [
          bookingDetails?.data[0]?.data?.bookingPaymentRefId,
        ];

        if (bookingDetails?.data.length > 1) {
          bookingPaymentRef = [
            bookingDetails?.data[0]?.data?.bookingPaymentRefId,
            bookingDetails?.data[1]?.data?.bookingPaymentRefId,
          ];
        }
        bookingPaymentRef = {
          bookingPaymentRefIds: bookingPaymentRef,
          isWeb: true,
        };
        const pgRes = await getPaymentGateway();
        if (pgRes.status === "SUCCESS") {
          if (paymentData.totalPayableAmount > 0) {
            let getPaymeneSessionIDResp = await getPaymentSessionID(
              null,
              Math.max(0, paymentData.walletAmount),
              0,
              "BOOKING",
              bookingId,
              Math.max(0, paymentData.totalPayableAmount),
              mobileNumber,
              pgRes.data.pgCode,
              2,
              bookingPaymentRef,
              bookingDetails?.data[0]?.data?.companyId,
            );
            if (
              getPaymeneSessionIDResp !== null &&
              getPaymeneSessionIDResp.data.data.paymentSessionId !== ""
            ) {
              const queryParams = {
                booking_id: bookingId,
              };
              routeToPg(
                pgRes.data.pgCode,
                getPaymeneSessionIDResp.data.data.paymentSessionId,
                queryParams,
                bookingId,
                2,
                "BOOKING",
                "",
                bookingDetails?.data[0]?.data?.companyId,
              );
            }
          } else {
            let confirmReq = {
              bookingId: bookingId,
              paymentRefernceId: getTabSpecificData("userID"),
              paymentStatus: "SUCCESS",
              paymentAmount: paymentData.totalPayableAmount,
              pgCode: pgRes.data.pgCode,
              bookingPaymentRefIds: bookingPaymentRef.bookingPaymentRefIds,
              walletAmount: Math.max(0, paymentData.walletAmount),
            };
            setIsLoading(true);
            const resp = await confirmPaymentFlights(confirmReq);
            fetchFlightBookingDetails();
          }
        }
      }
    } catch (error) {
      console.log(error);
      showToast("error", "Something went wrong");
    }
  };

  const handleRefundStatusClick = async () => {
    const data0 = bookingDetails?.data[0]?.data;
    const data1 = bookingDetails?.data[1]?.data;

    let refundAmount = data0?.refundAmount || data1?.refundAmount;

    if (data0?.paymentStatus !== "SUCCESS" || !(refundAmount > 0)) return;

    let walletAmount = data0?.walletAmount || data1?.walletAmount || 0;
    let walletRefundAmount =
      walletAmount > refundAmount ? refundAmount : walletAmount;
    let walletRefundStatus = data0?.refundStatus || data1?.refundStatus;

    const baseRefundResponse = {
      walletRefundAmount,
      walletRefundStatus,
    };

    // ✅ Only call PG refund API if payment was NOT fully covered by wallet
    const totalAmountPaid =
      data0?.totalAmountPaid || data1?.totalAmountPaid || 0;
    const pgAmountPaid = totalAmountPaid - walletAmount; // ✅ actual PG amount

    if (pgAmountPaid > 0) {
      // Mixed payment — call PG refund API
      const refundPgRes = await getRefundStatus(booking_id);

      if (refundPgRes?.status === "SUCCESS") {
        setRefundData({
          ...baseRefundResponse,
          refundAmount: refundPgRes?.data?.refundAmount || null,
          refundStatus: refundPgRes?.data?.refundStatus || null,
        });
        setShowPopup(true);
      } else {
        showToast("error", "Failed to fetch refund status");
      }
    } else {
      // ✅ Full wallet payment — skip PG API entirely, show wallet refund directly
      setRefundData(baseRefundResponse);
      setShowPopup(true);
    }
  };

  const redirectHome = async () => {
    await router.push("/corporate");
  };

  useEffect(() => {
    let totalAmount = 0;
    let travelerFare = 0;
    let ssrFare = 0;
    let adultCount = parseInt(
      bookingDetails?.data[0]?.data?.flightItinerary?.noOfadults,
    );
    let childCount = parseInt(
      bookingDetails?.data[0]?.data?.flightItinerary?.noOfchildren,
    );
    let infantCount = parseInt(
      bookingDetails?.data[0]?.data?.flightItinerary?.noOFinfants,
    );

    let totalPassengerCount = adultCount + childCount + infantCount;
    setAdultCount(adultCount);
    setChildCount(childCount);
    setInfantCount(infantCount);
    setTotalPassengerCount(totalPassengerCount);
    bookingDetails?.data?.map(
      (booking, index) => (
        (totalAmount +=
          booking?.data?.flightItinerary?.fare?.totalAmountWithSSR),
        (travelerFare +=
          booking?.data?.flightItinerary?.fare?.offeredFareRoundedOff),
        (ssrFare += booking?.data?.flightItinerary?.fare?.ssrFare)
      ),
    );
    setTotalAmount(totalAmount);
    setTravelerFare(travelerFare);
    setSsrFare(ssrFare);
  }, [bookingDetails]);

  const fetchAndDownloadInvoice = async () => {
    try {
      setDownloading(true);
      const travelCategory = 2;
      const configuration = {
        headers: {
          "Content-Type": "application/pdf",
          "Access-Control-Allow-Origin": "*",
        },
        responseType: "arraybuffer",
      };
      const response = await axios.get(
        `${config.GENERATE_PDF}?bookingId=${booking_id}&travelCategory=${travelCategory}`,
        configuration,
      );
      const pdfData = response.data;
      if (pdfData && pdfData.byteLength > 0) {
        const blob = new Blob([pdfData], { type: "application/pdf" });

        // Trigger download
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = "INV_" + booking_id + ".pdf";
        link.click();

        return URL.revokeObjectURL(link.href);
      }

      return;
    } catch (error) {
      console.error("An error occurred while calling GENERATE_PDF", error);
      // if (!isToastVisible) {
      showToast("error", "something went wrong!");
      //   setIsToastVisible(true);

      //   // Reset the flag after a specific duration (e.g., 3 seconds)
      //   setTimeout(() => {
      //     setIsToastVisible(false);
      //   }, 6000);
      // }
    } finally {
      setDownloading(false); // End downloading, regardless of success or failure
    }
  };

  const fetchAndDownloadTicket = async () => {
    const normalizeBookingData = (data) => {
      if (data.length === 1) {
        return [
          {
            pnr: data[0].data.pnr,
            bookingId: data[0].data.bookingId,
            bookingStatus: data[0].data.bookingStatus,
            // ✅ Check pnrReleased from segmentPassengerSsr
            pnrReleased:
              data[0].data.segmentPassengerSsr?.some(
                (seg) => seg.pnr === data[0].data.pnr && seg.pnrReleased,
              ) || false,
            isReturn: false,
            isInternational: data.isInternational,
          },
        ];
      } else if (data.length === 2) {
        return [
          {
            pnr: data[0].data.pnr,
            bookingId: data[0].data.bookingId,
            bookingStatus: data[0].data.bookingStatus,
            pnrReleased:
              data[0].data.segmentPassengerSsr?.some(
                (seg) => seg.pnr === data[0].data.pnr && seg.pnrReleased,
              ) || false,
            isReturn: false,
            isInternational: data.isInternational,
          },
          {
            pnr: data[1].data.pnr,
            bookingId: data[1].data.bookingId,
            bookingStatus: data[1].data.bookingStatus,
            pnrReleased:
              data[1].data.segmentPassengerSsr?.some(
                (seg) => seg.pnr === data[1].data.pnr && seg.pnrReleased,
              ) || false,
            isReturn: true,
            isInternational: data.isInternational,
          },
        ];
      }
      return [];
    };

    const downloadTicket = async (
      pnr,
      bookingId,
      isReturn,
      isInternational,
    ) => {
      try {
        const response = await axios.get(`${config.DOWNLOAD_TICKET}`, {
          params: { pnr, bookingId, travelCategory: 2 },
          responseType: "blob",
        });
        if (
          response &&
          response.data instanceof Blob &&
          response.data.size > 0
        ) {
          const contentDisposition = response.headers["content-disposition"];
          let fileName = isInternational
            ? `E-Ticket_${bookingId}.pdf`
            : `E-Ticket_${bookingId}_${isReturn ? "return" : "departure"}.pdf`;
          if (contentDisposition) {
            const fileNameMatch = contentDisposition.match(/filename="?(.+)"?/);
            if (fileNameMatch?.length > 1) {
              fileName = fileNameMatch[1];
            }
          }
          const blob = new Blob([response.data], { type: "application/pdf" });
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.style.display = "none";
          a.href = url;
          a.download = fileName;
          document.body.appendChild(a);
          a.click();
          window.URL.revokeObjectURL(url);
          return;
        }
        showToast("error", "File corrupted or no data found");
      } catch (error) {
        showToast("error", `Error downloading ticket for PNR ${pnr}`);
        console.error(`Error downloading ticket for PNR ${pnr}:`, error);
      }
    };

    try {
      setDownloading1(true);
      const normalizedData = normalizeBookingData(bookingDetails.data);

      const uniqueBookings = Array.from(
        new Map(
          normalizedData.map((booking) => [booking.pnr, booking]),
        ).values(),
      );

      // ✅ Filter: only download if CONFIRMED and PNR not released
      const downloadableBookings = uniqueBookings.filter((booking) => {
        if (booking.pnr === null) return false;
        if (booking.bookingStatus !== "CONFIRMED") {
          console.log(
            `Skipping PNR ${booking.pnr} - status: ${booking.bookingStatus}`,
          );
          return false;
        }
        if (booking.pnrReleased) {
          console.log(`Skipping PNR ${booking.pnr} - PNR has been released`);
          return false;
        }
        return true;
      });

      if (downloadableBookings.length === 0) {
        showToast("error", "No confirmed tickets available to download");
        return;
      }

      for (const booking of downloadableBookings) {
        await downloadTicket(
          booking.pnr,
          booking.bookingId,
          booking.isReturn,
          booking.isInternational,
        );
      }
    } catch (error) {
      console.error("Error in fetchAndDownloadTicket:", error);
    } finally {
      setDownloading1(false);
    }
  };

  const passengersWithFF = useMemo(() => {
    return (
      bookingDetails?.data[0]?.data?.segmentPassengerSsr?.[
        ssrPassengerIndex
      ]?.ssr?.filter(
        (ssrPassenger) =>
          ssrPassenger?.frequentFlyerDetails?.length > 0 &&
          ssrPassenger?.frequentFlyerDetails?.some(
            (ff) => ff?.frequentFlyerNumber,
          ),
      ) || []
    );
  }, [bookingDetails, ssrPassengerIndex]);

  const handleFlightDuration = (departureTime, arrivalTime) => {
    const departureDate = new Date(departureTime);
    const arrivalDate = new Date(arrivalTime);

    // Get the start of the departure day
    const departureDayStart = new Date(
      departureDate.getFullYear(),
      departureDate.getMonth(),
      departureDate.getDate(),
    );

    // Get the start of the arrival day
    const arrivalDayStart = new Date(
      arrivalDate.getFullYear(),
      arrivalDate.getMonth(),
      arrivalDate.getDate(),
    );

    // Calculate the difference in days
    const timeDifference =
      arrivalDayStart.getTime() - departureDayStart.getTime();
    const daysDifference = timeDifference / (1000 * 3600 * 24);
    return Math.ceil(daysDifference);

    if (daysDifference === 0) {
      // If the arrival date is on the same day, return 0 days
      return 0;
    } else {
      // If the arrival date is on the next day or later, return the number of days
      return Math.ceil(daysDifference);
    }
  };

  return (
    <ProtectedRoute>
      <div className="flex flex-col ">
        <div className="border-b w-full fixed top-0 left-0 bg-white z-10">
          <Header />
        </div>
        {/* confirmation / failed section */}
        {isLoading ? (
          <FlightConfirmationSkeleton />
        ) : errorMessage ? (
          <ErrorMessage message={errorMessage} />
        ) : !bookingDetails ? (
          <NoDataMessage message="No booking data available" />
        ) : bookingDetails &&
          bookingStatus &&
          bookingDetails?.data[0]?.data?.paymentStatus === "SUCCESS" ? (
          <div className="bg-[#E5E9EB] h-96 flex gap-3 flex-1 pt-20 px-2 2xl:mx-[12%]">
            <div className="bg-white w-full h-fit overflow-y-scroll p-3 pt-5 mt-3 rounded-md">
              {bookingDetails?.data[0]?.data?.bookingStatus !== "COMPLETED" && (
                <div className="flex sm:flex-row flex-col gap-2">
                  <div className="flex items-center gap-2">
                    <div className="w-min sm:min-w-fit">
                      {bookingStatus.toLowerCase() !== "failed" && (
                        <div className="text-white bg-green-600 w-10 h-10 flex items-center justify-center rounded-full text-3xl">
                          <FontAwesomeIcon icon={faCheck} />
                        </div>
                      )}
                      {bookingStatus.toLowerCase() === "failed" && (
                        <div className="text-white bg-red-600 w-10 h-10 rounded-full text-center text-3xl">
                          <FontAwesomeIcon icon={faXmark} />
                        </div>
                      )}
                    </div>
                    <div
                      className={`w-5/6 sm:min-w-fit ${
                        bookingStatus.toLowerCase() === "failed"
                          ? "flex items-center"
                          : ""
                      }`}
                    >
                      <div className="text-base font-semibold">
                        Booking
                        <span className="ml-1">{bookingStatus}</span>
                        {bookingStatus.toLowerCase() === "failed" && (
                          <span className="ml-1 text-red-600">
                            : Money will be credited shortly
                          </span>
                        )}
                      </div>
                      {bookingStatus.toLowerCase() !== "failed" && (
                        <div>
                          <div className="text-xs">
                            Booking details will be sent on the contact number
                            <span className="ml-1 font-semibold">
                              {
                                bookingDetails?.data[0]?.data?.flightItinerary
                                  ?.passengers?.[0]?.contactNo
                              }
                            </span>{" "}
                            and email id :
                            <span className="ml-1 font-semibold">
                              {
                                bookingDetails?.data[0]?.data?.flightItinerary
                                  ?.passengers?.[0]?.email
                              }
                            </span>
                          </div>
                          <div className="text-xs font-bold text-green-600">
                            To cancel your booking, please contact Qugo by phone
                            at 7411940705 or 7204186969, or send an email to
                            bookings@qugo.io.
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="ml-auto flex items-center justify-center gap-2">
                    <div className="flex flex-col items-center ">
                      {bookingStatus.toLowerCase() !== "confirmed" && (
                        <button
                          className="text-white bg-[#155EEF] text-xs p-2 px-4 rounded-md"
                          onClick={handleRefundStatusClick}
                        >
                          Refund Status
                        </button>
                      )}
                      <div className="flex flex-col w-fit">
                        {isRefundLoading ? (
                          <div className="ml-0 w-fit text-xs">
                            <div className="relative bg-white p-[10px] rounded-md w-[300px] text-center font-xs">
                              Loading...
                            </div>
                          </div>
                        ) : (
                          showPopup && (
                            <div
                              ref={popupRef}
                              className="ml-0 w-fit text-xs absolute right-[5%] border-[1px] border-gray-300 rounded-md"
                            >
                              <div className="relative bg-white p-[10px] rounded-md w-[300px] text-center font-xs">
                                <div>
                                  {refundData?.walletRefundAmount > 0 && (
                                    <div>
                                      Wallet Refund status:{" "}
                                      <span className="">
                                        {refundData.walletRefundStatus}
                                      </span>
                                    </div>
                                  )}
                                  {refundData?.walletRefundAmount > 0 && (
                                    <div>
                                      Wallet Refund Amount:{" "}
                                      <span className="">
                                        {refundData.walletRefundAmount}
                                      </span>
                                    </div>
                                  )}
                                  {refundData?.refundAmount > 0 && (
                                    <div>
                                      Payment Refund Status:{" "}
                                      <span className="">
                                        {refundData.refundStatus}
                                      </span>
                                    </div>
                                  )}
                                  {refundData?.refundAmount && (
                                    <div>
                                      Payment Refund Amount:{" "}
                                      <span className="">
                                        Rs.{" "}
                                        {formatPrice(refundData.refundAmount)}
                                      </span>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          )
                        )}
                      </div>
                    </div>
                    <div className="flex justify-center gap-2">
                      {userType === 1 && (
                        <button
                          className="bg-[#155EEF]  text-white flex gap-1 justify-center items-center text-base font-medium p-1 px-2 rounded-lg"
                          onClick={fetchAndDownloadInvoice}
                          disabled={downloading}
                        >
                          {downloading ? (
                            <>
                              <FontAwesomeIcon
                                icon={faSpinner}
                                spin
                                className="text-base"
                              />
                              Downloading
                            </>
                          ) : (
                            <>
                              <FontAwesomeIcon
                                icon={faCircleDown}
                                className="text-base"
                              />
                              Invoice
                            </>
                          )}
                        </button>
                      )}
                      {bookingStatus.toLowerCase() !== "failed" && (
                        <button
                          className="bg-[#155EEF]  text-white flex gap-1 justify-center items-center text-base font-medium p-1 px-2 rounded-lg"
                          onClick={fetchAndDownloadTicket}
                          disabled={downloading1}
                        >
                          {downloading1 ? (
                            <>
                              <FontAwesomeIcon
                                icon={faSpinner}
                                spin
                                className="text-base"
                              />
                              Downloading
                            </>
                          ) : (
                            <>
                              <FontAwesomeIcon
                                icon={faCircleDown}
                                className="text-base"
                              />
                              Ticket
                            </>
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* approver details */}
              {approvalData && approvalData.length > 0 && (
                <div className="border-[1px] border-[#155EEF2E] shadow-[6px_6px_30px_0px_#7D99B40D] rounded-xl mt-3 p-3">
                  {approvalData && (
                    <ApproverDetails
                      travellers={approvalData}
                      parentClassName="bg-white p-0 rounded-lg"
                    />
                  )}
                </div>
              )}

              {/* booking details */}
              <div className="border-[1px] border-[#155EEF2E] shadow-[6px_6px_30px_0px_#7D99B40D] rounded-xl mt-3 p-3">
                <div className="text-sm font-semibold">Booking Details</div>
                <div className="flex flex-col sm:flex-row gap-1 sm:gap-5 mt-2 sm:mt-0">
                  <div className="flex items-center text-xs font-medium">
                    Booking ID:
                    <div className="text-[#155EEF] font-semibold">
                      {bookingDetails?.data[0]?.data.bookingId}
                    </div>
                  </div>
                  <div className="flex items-center text-xs font-medium">
                    Booked on:
                    <div className="text-[#155EEF] font-semibold">
                      {new Date(
                        bookingDetails?.data[0]?.data.bookedDate,
                      ).toLocaleTimeString([], {
                        weekday: "short",
                        month: "short",
                        day: "2-digit",
                        year: "numeric",
                        hour: "numeric",
                        minute: "numeric",
                        hour12: true,
                      })}
                    </div>
                  </div>
                </div>
              </div>

              {/* flight details */}
              {bookingDetails ? (
                bookingDetails?.data?.map((booking, index) => (
                  <div key={index}>
                    {bookingDetails ? (
                      booking?.data.flightItinerary?.segments?.map(
                        (segmentGroup, segmentsIndex) => {
                          const numOfDays = handleFlightDuration(
                            segmentGroup.segment[0].origin.depTime,
                            segmentGroup.segment[
                              segmentGroup.segment.length - 1
                            ].destination.arrTime,
                          );
                          return (
                            <div
                              key={segmentsIndex}
                              className="mt-2 border p-2 rounded-md"
                            >
                              {bookingDetails?.data[index]?.data
                                ?.bookingStatus !== "COMPLETED" && (
                                <div className="flex gap-1 items-center">
                                  {" "}
                                  <div className="min-w-fit">
                                    {bookingDetails?.data[
                                      index
                                    ]?.data?.bookingStatus.toLowerCase() ===
                                      "confirmed" && (
                                      <div className="text-white bg-green-600 w-8 h-8 rounded-full text-center text-2xl">
                                        <FontAwesomeIcon icon={faCheck} />
                                      </div>
                                    )}
                                    {bookingDetails?.data[index]?.data
                                      ?.bookingStatus === "FAILED" && (
                                      <div className="text-white bg-red-600 w-8 h-8 rounded-full text-center text-2xl">
                                        <FontAwesomeIcon icon={faXmark} />
                                      </div>
                                    )}
                                  </div>
                                  <div className="flex flex-col">
                                    <div className="text-sm sm:text-base font-semibold">
                                      Booking
                                      <span className="ml-1">
                                        {bookingDetails?.data[index]?.data
                                          ?.bookingStatus === "CONFIRMED" &&
                                          "Successful"}
                                        {bookingDetails?.data[index]?.data
                                          ?.bookingStatus !== "CONFIRMED" &&
                                          "Failed"}
                                      </span>
                                      {bookingDetails?.data[index]?.data
                                        ?.bookingStatus !== "CONFIRMED" && (
                                        <span className="ml-1 text-red-600">
                                          : Money will be credited shortly
                                        </span>
                                      )}
                                    </div>
                                    <span className="text-sm sm:text-base ml-0 sm:ml-1">
                                      {`${segmentGroup.segment[0].origin.airport.cityName} (${segmentGroup.segment[0].origin.airport.airportCode})`}
                                      -
                                      {`${
                                        segmentGroup.segment[
                                          segmentGroup.segment.length - 1
                                        ].destination.airport.cityName
                                      } (${
                                        segmentGroup.segment[
                                          segmentGroup.segment.length - 1
                                        ].destination.airport.airportCode
                                      })`}
                                    </span>
                                  </div>
                                </div>
                              )}
                              {segmentGroup.segment.map(
                                (segment, segmentIndex) => (
                                  <div
                                    key={segmentIndex}
                                    className="flex flex-col"
                                  >
                                    <div
                                      key={segmentIndex}
                                      className="border-[1px] border-[#155EEF2E] shadow-[6px_6px_30px_0px_#7D99B40D] rounded-xl mt-3 p-3"
                                    >
                                      <div className="text-base font-medium mb-2">
                                        Flight Details
                                      </div>
                                      <div className="flex justify-between text-xs">
                                        <div className="flex items-center gap-2">
                                          <Image
                                            src={segment.airline.airlineLogoUrl}
                                            alt="airline"
                                            height={30}
                                            width={30}
                                            className="w-5 h-5 sm:w-10 sm:h-10"
                                          />
                                          <div className="flex flex-col items-left mt-1 text-xxxs sm:text-base font-semibold">
                                            <div>
                                              {segment?.airline.airlineName}
                                            </div>
                                            <div className="flex">
                                              <div>
                                                {segment?.airline.airlineCode}
                                              </div>
                                              -
                                              <div>
                                                {segment?.airline.flightNumber}
                                              </div>
                                            </div>
                                          </div>
                                        </div>
                                        {booking?.data?.pnr && (
                                          <div className="flex text-xxs sm:text-base items-center font-semibold">
                                            PNR :
                                            <span className="ml-1 font-semibold text-[#155EEF]">
                                              <div>
                                                {segment.airlinePNR &&
                                                segment.airlinePNR.trim() !== ""
                                                  ? segment.airlinePNR
                                                  : booking?.data?.pnr}
                                              </div>
                                            </span>
                                          </div>
                                        )}
                                        <div className="flex items-center gap-2">
                                          <div className="border-[1px] text-xxxs sm:text-base rounded-md border-[#155EEF2E] shadow-[6px_6px_30px_0px_#7D99B40D] p-2">
                                            {booking?.data?.flightItinerary
                                              ?.journeyTypeCode === "1"
                                              ? "One Way"
                                              : booking?.data?.flightItinerary
                                                    ?.journeyTypeCode === "2"
                                                ? "Two Way"
                                                : booking?.data?.flightItinerary
                                                      ?.journeyTypeCode === "3"
                                                  ? "Multi City"
                                                  : "Unknown"}
                                          </div>
                                          <div className="border-[1px] text-xxxs sm:text-base rounded-md border-[#155EEF2E] box-shadow-[6px_6px_30px_0px_#7D99B40D] p-2">
                                            {segment?.cabinClassName}
                                          </div>
                                        </div>
                                      </div>
                                      <div className="flex justify-between items-center mt-2">
                                        <div className="w-2/6 self-baseline">
                                          <div className="text-[#155EEF] text-xs sm:text-lg font-medium">
                                            {new Date(
                                              segment.origin.depTime,
                                            ).toLocaleTimeString([], {
                                              hour: "2-digit",
                                              minute: "2-digit",
                                            })}
                                          </div>
                                          <div className="font-medium text-xs sm:text-base">
                                            {segment.origin.airport.cityName}
                                          </div>
                                          <div className="font-medium text-xxs sm:text-sm text-[#000000]">
                                            {segment.origin.airport.airportName}{" "}
                                            (
                                            {segment.origin.airport.airportCode}
                                            )
                                          </div>
                                          <div className="text-xxs sm:text-base">
                                            {new Date(
                                              segment.origin.depTime,
                                            ).toLocaleDateString([], {
                                              weekday: "short",
                                              month: "short",
                                              day: "2-digit",
                                              year: "numeric",
                                            })}
                                          </div>
                                        </div>
                                        <div className="w-2/6 flex flex-col items-center justify-start">
                                          <div className="text-center text-xxs mb-1 text-[#171A1966]">
                                            <FontAwesomeIcon
                                              icon={faClock}
                                              className="h-3 w-3 text-[#868687] text-xxs sm:text-xs"
                                            />
                                            <span className="ml-1 text-[#000000] text-xxs sm:text-xs">
                                              {Math.floor(
                                                segment.duration / 60,
                                              )}{" "}
                                              hr {segment.duration % 60} mins
                                            </span>{" "}
                                          </div>
                                          <div className="w-full h-1 border-t-2 border-dashed text-[#868687]" />
                                          <div className="text-center text-xxs sm:text-xs text-[#000000]">
                                            <span>
                                              {segment.cabinBaggage} -{" "}
                                              {segment.baggage}
                                            </span>{" "}
                                            |
                                            <span className="ml-1 text-[#155EEF] font-medium">
                                              {booking?.data?.flightItinerary
                                                .nonRefundable
                                                ? "Non Refundable"
                                                : "Refundable"}
                                            </span>
                                          </div>
                                        </div>
                                        <div className="w-2/6 text-end self-baseline">
                                          <div className="text-[#155EEF] text-xs sm:text-lg">
                                            {new Date(
                                              segment.destination.arrTime,
                                            ).toLocaleTimeString([], {
                                              hour: "2-digit",
                                              minute: "2-digit",
                                            })}
                                          </div>
                                          <div className="font-medium text-xs sm:text-base">
                                            {
                                              segment.destination.airport
                                                .cityName
                                            }
                                          </div>
                                          <div className="font-medium text-xxs sm:text-sm text-[#000000]">
                                            {
                                              segment.destination.airport
                                                .airportName
                                            }{" "}
                                            (
                                            {
                                              segment.destination.airport
                                                .airportCode
                                            }
                                            )
                                          </div>
                                          <div className="text-xxs sm:text-base">
                                            {new Date(
                                              segment.destination.arrTime,
                                            ).toLocaleDateString([], {
                                              weekday: "short",
                                              month: "short",
                                              day: "2-digit",
                                              year: "numeric",
                                            })}
                                          </div>
                                        </div>
                                      </div>
                                      <div className="flex justify-center mt-4 text-sm">
                                        <div></div>
                                      </div>
                                    </div>
                                    {segmentIndex !==
                                      segmentGroup.segment.length - 1 && (
                                      <span className="text-[#868687] text-xs text-center pt-2">
                                        ----------Layover----------
                                      </span>
                                    )}
                                  </div>
                                ),
                              )}
                            </div>
                          );
                        },
                      )
                    ) : (
                      <></>
                    )}
                  </div>
                ))
              ) : (
                <></>
              )}

              {/* price details */}
              <div className="border-[1px] border-[#155EEF2E] shadow-[6px_6px_30px_0px_#7D99B40D] rounded-md mt-3 p-3">
                <div className="flex items-center gap-5">
                  <div className="text-base font-medium">Price Details</div>
                </div>
                <div className="p-2 flex w-full justify-between mt-3 text-sm font-medium">
                  <div>Adult</div>
                  <div>{formatPrice(travelerFare)}</div>
                </div>
                <div className="p-2 flex w-full justify-between mt-0 text-sm font-medium">
                  <div>Special service charges</div>
                  <div>{formatPrice(ssrFare?.toString() ?? "0")}</div>
                </div>
                {
                  <>
                    {bookingDetails?.data[0]?.data?.walletAmount > 0 && (
                      <div className="p-2 flex w-full justify-between mt-0 text-sm font-medium">
                        <div>Wallet amount used</div>
                        <div>
                          {formatPrice(
                            bookingDetails?.data[0]?.data?.walletAmount,
                          )}
                        </div>
                      </div>
                    )}
                    {bookingDetails?.data[0]?.data?.totalAmountPaid > 0 && (
                      <div className="p-2 flex w-full justify-between mt-0 text-sm font-medium">
                        <div>Paid using other modes</div>
                        <div>
                          {formatPrice(
                            paymentData?.totalAmount -
                              bookingDetails?.data[0]?.data?.walletAmount,
                          ) ?? 0}
                        </div>
                      </div>
                    )}
                    <div className="p-2 py-3 flex w-full justify-between mt-1 rounded-md text-lg bg-[#155EEF0F] text-[#155EEF]">
                      <div>Total</div>
                      <div>Rs.{formatPrice(paymentData?.totalAmount)}</div>
                    </div>
                  </>
                }
              </div>

              {/* ff details */}

              {/* <div className="border-[1px] border-[#155EEF2E] shadow-[6px_6px_30px_0px_#7D99B40D] rounded-md p-3 mt-3 bg-white">
                <h2 className="text-base sm:text-lg font-bold mb-3">FF Details</h2>
                {bookingDetails?.data[0]?.data?.segmentPassengerSsr?.length > 0 &&
                  bookingDetails?.data[0]?.data?.segmentPassengerSsr?.[ssrPassengerIndex]?.ssr
                    ?.length > 0 ? (
                  <>
                   
                    <div className="flex flex-wrap gap-2 mb-2">
                      {bookingDetails?.data[0]?.data?.segmentPassengerSsr?.[ssrPassengerIndex]?.ssr.map(
                        (ssrPassenger, index) => (
                          <button
                            key={index}
                            onClick={() => setSelectedPassengerIndex(index)}
                            className={`px-2 py-1 rounded ${selectedPassengerIndex === index
                                ? "bg-[#155EEF] text-white"
                                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                              }`}
                          >
                            {ssrPassenger?.passengerName || "-"}
                          </button>
                        )
                      )}
                    </div>

                    
                    <div className="overflow-x-auto">
                      <table className="w-full border-collapse">
                    
                        <thead className="border-b border-gray-200">
                          <tr className="text-left text-xs sm:text-sm font-semibold">
                            <th className="sm:px-4 py-2">FF Number</th>
                            <th className="sm:px-4 py-2">FF Airline Code</th>
                            <th className="sm:px-4 py-2">Airline Name</th>
                            <th className="sm:px-4 py-2">Origin</th>
                            <th className="sm:px-4 py-2">Destination</th>
                            <th className="sm:px-4 py-2">Segment Type</th>
                          </tr>
                        </thead>
                       
                        <tbody>
                          {bookingDetails?.data[0]?.data?.segmentPassengerSsr?.[ssrPassengerIndex]?.ssr[
                            selectedPassengerIndex
                          ]?.frequentFlyerDetails?.length > 0 ? (
                            bookingDetails?.data[0]?.data?.segmentPassengerSsr?.[ssrPassengerIndex]?.ssr[
                              selectedPassengerIndex
                            ]?.frequentFlyerDetails?.map((ffDetail, index, arr) => (
                              <tr
                                key={index}
                                className={`${index !== arr.length - 1 ? "border-b border-gray-200" : ""}`}
                              >
                                <td className="sm:px-4 py-2 text-xxs sm:text-xs">
                                  {ffDetail?.frequentFlyerNumber || "N/A"}
                                </td>
                                <td className="sm:px-4 py-2 text-xxs sm:text-xs">
                                  {ffDetail?.airlineCode || "N/A"}
                                </td>
                                <td className="sm:px-4 py-2 text-xxs sm:text-xs">
                                  {ffDetail?.airlineName || "N/A"}
                                </td>
                                <td className="sm:px-4 py-2 text-xxs sm:text-xs">
                                  {ffDetail?.origin || "N/A"}
                                </td>
                                <td className="sm:px-4 py-2 text-xxs sm:text-xs">
                                  {ffDetail?.destination || "N/A"}
                                </td>
                                <td className="sm:px-4 py-2 text-xxs sm:text-xs">
                                  {ffDetail?.segmentType || "N/A"}
                                </td>
                              </tr>
                            ))
                          ) : (
                            <tr>
                              <td colSpan="6" className="sm:px-4 py-2 text-center text-gray-500">
                                No frequent flyer details available
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </>
                ) : (
                  <p className="text-gray-500">No passengers available</p>
                )}
              </div> */}

              {passengersWithFF.length > 0 && (
                <div className="border-[1px] border-[#155EEF2E] shadow-[6px_6px_30px_0px_#7D99B40D] rounded-md p-3 mt-3 bg-white">
                  <h2 className="text-base sm:text-lg font-bold mb-3">
                    FF Details
                  </h2>

                  {/* Passenger Names Above Table */}
                  <div className="flex flex-wrap gap-2 mb-2">
                    {passengersWithFF.map((ssrPassenger, index) => (
                      <button
                        key={index}
                        onClick={() => setSelectedPassengerIndex(index)}
                        className={`px-2 py-1 rounded ${
                          selectedPassengerIndex === index
                            ? "bg-[#155EEF] text-white"
                            : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                        }`}
                      >
                        {ssrPassenger?.passengerName || "-"}
                      </button>
                    ))}
                  </div>

                  {/* Table */}
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                      <thead className="border-b border-gray-200">
                        <tr className="text-left text-xs sm:text-sm font-semibold">
                          <th className="sm:px-4 py-2">FF Number</th>
                          <th className="sm:px-4 py-2">FF Airline Code</th>
                          <th className="sm:px-4 py-2">Airline Name</th>
                          <th className="sm:px-4 py-2">Origin</th>
                          <th className="sm:px-4 py-2">Destination</th>
                          <th className="sm:px-4 py-2">Segment Type</th>
                        </tr>
                      </thead>
                      <tbody>
                        {passengersWithFF[
                          selectedPassengerIndex
                        ]?.frequentFlyerDetails?.map((ffDetail, index, arr) => (
                          <tr
                            key={index}
                            className={`${
                              index !== arr.length - 1
                                ? "border-b border-gray-200"
                                : ""
                            }`}
                          >
                            <td className="sm:px-4 py-2 text-xxs sm:text-xs">
                              {ffDetail?.frequentFlyerNumber || "N/A"}
                            </td>
                            <td className="sm:px-4 py-2 text-xxs sm:text-xs">
                              {ffDetail?.airlineCode || "N/A"}
                            </td>
                            <td className="sm:px-4 py-2 text-xxs sm:text-xs">
                              {ffDetail?.airlineName || "N/A"}
                            </td>
                            <td className="sm:px-4 py-2 text-xxs sm:text-xs">
                              {ffDetail?.origin || "N/A"}
                            </td>
                            <td className="sm:px-4 py-2 text-xxs sm:text-xs">
                              {ffDetail?.destination || "N/A"}
                            </td>
                            <td className="sm:px-4 py-2 text-xxs sm:text-xs">
                              {ffDetail?.segmentType || "N/A"}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* traveler details */}
              <div className="border-[1px] border-[#155EEF2E] shadow-[6px_6px_30px_0px_#7D99B40D] rounded-md mt-3 p-3">
                <TravelerDetails bookingDetails={bookingDetails?.data} />
              </div>

              {/* GST details */}

              <div className="border-[1px] border-[#155EEF2E] shadow-[6px_6px_30px_0px_#7D99B40D] rounded-md mt-3 p-3 bg-white">
                <GSTDetails
                  companyName={
                    bookingDetails?.data[0]?.data?.companyGstDetails
                      ?.gstCompanyName
                  }
                  gstNumber={
                    bookingDetails?.data[0]?.data?.companyGstDetails?.gstNumber
                  }
                  companyEmail={
                    bookingDetails?.data[0]?.data?.companyGstDetails
                      ?.gstCompanyEmail
                  }
                  companyMobile={
                    bookingDetails?.data[0]?.data?.companyGstDetails
                      ?.gstCompanyContactNumber
                  }
                  companyAddress={
                    bookingDetails?.data[0]?.data?.companyGstDetails
                      ?.gstCompanyAddress
                  }
                />
              </div>
            </div>
          </div>
        ) : (
          <>
            <div className="bg-[#E5E9EB] h-screen pt-28 px-2 2xl:mx-[12%]">
              <div className="flex px-4 gap-2 py-2">
                <div className="text-white bg-red-600 w-10 h-10 rounded-full text-center text-3xl">
                  <FontAwesomeIcon icon={faXmark} />
                </div>
                <div className="flex flex-col ">
                  <div className="text-[#171A19] font-medium text-xl">
                    Payment Failed
                  </div>
                  <div>
                    <div className="text-xs">
                      Booking details will be sent to your Email Id
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white mb-2 p-4 mx-4 mt-2 rounded-lg">
                <div className="text-[#171A19CC] font-semibold text-lg">
                  Error in payment process. Please try again
                </div>
                <div className="flex gap-[100px] w-fit px-4 mb-4 mt-4 rounded-full py-2 bg-[#155EEF0D]">
                  <div className="text-[#155EEF] font-semibold text-base">
                    Amount to be paid
                  </div>
                  <div className="text-[#155EEF] font-semibold text-base">
                    ₹ {formatPrice(paymentData.totalAmount)}
                  </div>
                </div>

                <div className="flex w-1/3 gap-10">
                  <button
                    onClick={redirectHome}
                    className="border-1 border-[#155EEF] w-full text-[#155EEF] text-sm p-3 rounded-lg"
                  >
                    Homepage
                  </button>

                  <button
                    onClick={retryPayment}
                    className="bg-[#155EEF] w-full text-white text-sm p-3 mt-5 rounded-lg"
                  >
                    Retry
                  </button>
                  {isWalletPopupOpen && (
                    <div className="fixed inset-0 flex items-center justify-center z-50">
                      {/* Background Blur */}
                      <div
                        className="absolute inset-0 bg-black cursor-pointer opacity-50 backdrop-blur-sm"
                        onClick={handleClosePopup}
                      ></div>

                      {/* Popup Content */}
                      <div className="bg-white rounded-lg shadow-lg p-6 z-10">
                        <div className="flex justify-between">
                          <h2 className="text-lg font-semibold">
                            Retry Payment
                          </h2>
                          <FontAwesomeIcon
                            icon={faXmark}
                            size="sm"
                            className="text-white py-[2px] px-[4px] cursor-pointer rounded-full bg-gray-500"
                            onClick={handleClosePopup}
                          />
                        </div>
                        {walletBalance > 0 && (
                          <div
                            className="flex items-center justify-start gap-2 cursor-pointer"
                            onClick={handleWalletChange}
                          >
                            <input
                              type="checkbox"
                              checked={paymentData?.walletSelected}
                            />
                            <span>Use wallet payment</span>
                          </div>
                        )}
                        <div className="mt-2">
                          Wallet Balance:
                          {/* <span>₹{walletBalance > 0 ? "****" : 0} </span> */}
                          <span>
                            ₹
                            {userType !== 1
                              ? walletBalance > 0
                                ? "****"
                                : 0
                              : walletBalance}
                          </span>
                          {userType === 1 && (
                            <Link
                              href={{
                                pathname: "/walletDetails",
                                query: {
                                  fromPage:
                                    typeof window !== "undefined"
                                      ? window.location.pathname
                                      : "/walletDetails",
                                },
                              }}
                              as={`/walletDetails`}
                            >
                              Recharge now
                            </Link>
                          )}
                        </div>
                        <div className="mt-4 flex justify-center">
                          <button
                            onClick={handlePayment}
                            className="bg-[#155EEF] text-white px-4 py-2 rounded-lg"
                          >
                            {paymentData?.totalPayableAmount > 0
                              ? `Proceed to pay | Rs. ${formatPrice(
                                  paymentData?.totalPayableAmount,
                                )}`
                              : "Proceed to Book"}
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </>
        )}
      </div>
      {/* <div className="pt-5">
        <Footer2 />
      </div> */}
    </ProtectedRoute>
  );
}
