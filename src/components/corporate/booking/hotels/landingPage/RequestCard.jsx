import { useState } from "react";
import Image from "next/image";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBed,
  faCalendar,
  faCircleInfo,
  faPlane,
  faUser,
  faSpinner,
  faTrain,
  faBus,
  faCar,
} from "@fortawesome/free-solid-svg-icons";
import planeImage from "@/images/corporate/Rectangle 24431.png";
import RequestModal from "@/components/corporate/approvalRequest/request";
import Modal from "@/components/corporate/modal/Modal";
import WalletPaymentModal from "@/components/Modals/WalletPaymentModal";
import { formatPrice } from "@/utils/common";
import { routeToPg } from "@/paymentGateways/pgRouting";
import { getPaymentSessionID } from "@/utils/bookingAPI";
import axios, { getTabSpecificData } from "@/utils/axios/axios";
import config from "@/config";
import showToast from "@/utils/toast";
import {
  confirmPaymentHotels,
  confirmPaymentFlights,
} from "@/utils/walletApis";
import fallbackImage from "@/images/Group 14468.png";
import { useUserPermissions } from "@/hooks/useUserPermissions";
import { useSelector } from "react-redux";

const RequestCard = ({
  data,
  showProceedButton = false,
  showCancelButton = false,
  showApprovalButtons = false,
  onActionComplete = null,
  walletBalance = 0,
}) => {
  const { userType } = useUserPermissions();

  const userDetails = useSelector((state) => state?.user?.userInfo);

  const isWalletAllowed =
    userDetails?.loggedInDetails?.configuration?.walletAllowed;

  const [isCancelRequestModalOpen, setIsCancelRequestModalOpen] =
    useState(false);
  const [isConfirmationModalOpen, setIsConfirmationModalOpen] = useState(false);
  const [confirmationType, setConfirmationType] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isWalletModalOpen, setIsWalletModalOpen] = useState(false);
  const [totalAmount, setTotalAmount] = useState(
    Number(data?.bookingdetails?.totalBookingAmount) || 0,
  );

  const isHotel = data?.travelCategory === "1";
  const isFlight = data?.travelCategory === "2";
  const isTrain = data?.travelCategory === "3";
  const isBus = data?.travelCategory === "4";
  const isCab = data?.travelCategory === "5";
  const icon = isHotel ? faBed : faPlane;
  const imageSrc = isHotel ? data?.bookingResponse?.HotelImageUrl : planeImage;

  const status = data?.approvalStatus || "Pending";
  const transportData = data?.transportBookingData;
  const bookingStatus = transportData?.booking?.bookingStatus || "pending";
  const isQuoted = bookingStatus === "quoted";

  console.log("the status is ", status);

  const getFlightDetails = () => {
    if (!data?.bookingResponse || !Array.isArray(data?.bookingResponse)) {
      return { from: null, to: null, duration: null };
    }

    let firstFlight = null;
    let lastFlight = null;

    // Get journeyTypeName from the correct path in the response
    const journeyTypeName =
      data?.bookingResponse?.[0]?.data?.flightItinerary?.journeyTypeName ||
      "OneWay";

    // Handle multiple booking responses (round trip)
    if (data?.bookingResponse?.length > 1) {
      const firstSegment =
        data.bookingResponse[0]?.data?.flightItinerary?.segments?.[0];
      firstFlight = firstSegment?.segment?.[0];

      const lastBookingSegments =
        data?.bookingResponse?.[data?.bookingResponse?.length - 1]?.data
          ?.flightItinerary?.segments;
      const lastSegment =
        journeyTypeName === "Return"
          ? firstSegment
          : lastBookingSegments?.[lastBookingSegments?.length - 1];
      lastFlight = lastSegment?.segment[lastSegment?.segment.length - 1];

      // Get duration of only the flight segment
      const duration = firstSegment?.journeyDuration || 0;

      // Calculate the date difference between departure and arrival
      const departureDate = new Date(firstFlight?.origin?.depTime);
      const arrivalDate = new Date(lastFlight?.destination?.arrTime);
      const dayDifference = Math.floor(
        (arrivalDate - departureDate) / (1000 * 60 * 60 * 24),
      );

      // Define the day indicator (e.g., +1D, +2D, etc.)
      const dayIndicator = dayDifference > 0 ? ` +${dayDifference}D` : "";

      return {
        from: firstFlight
          ? {
              code: firstFlight?.origin?.airport?.airportCode,
              city: firstFlight?.origin?.airport?.cityName,
              date: firstFlight?.origin?.depTime,
            }
          : null,
        to: lastFlight
          ? {
              code: lastFlight?.destination?.airport?.airportCode,
              city: lastFlight?.destination?.airport?.cityName,
              date: lastFlight?.destination?.arrTime,
            }
          : null,
        duration: `${Math.floor(duration / 60)}h ${duration % 60}m`,
        hasLayovers: data?.bookingResponse?.some((booking) =>
          booking?.data?.flightItinerary?.segments?.some(
            (segment) => segment?.segment?.length > 1,
          ),
        ),
        journeyTypeName,
        dayIndicator,
      };
    } else {
      const segments =
        data?.bookingResponse?.[0]?.data?.flightItinerary?.segments;
      if (segments && segments.length > 0) {
        firstFlight = segments[0]?.segment[0];
        const lastSegment = segments[segments.length - 1];
        lastFlight = lastSegment?.segment[lastSegment?.segment.length - 1];

        // Get duration of only the current flight segment
        // const duration = segments?.[0]?.journeyDuration || 0;

        const duration = segments.reduce((acc, segment) => {
          const segmentDuration = Number(segment?.journeyDuration) || 0;
          return acc + segmentDuration;
        }, 0);

        // Calculate the date difference between departure and arrival
        const departureDate = new Date(firstFlight?.origin?.depTime);
        const arrivalDate = new Date(lastFlight?.destination?.arrTime);
        const dayDifference = Math.floor(
          (arrivalDate - departureDate) / (1000 * 60 * 60 * 24),
        );

        // Define the day indicator (e.g., +1D, +2D, etc.)
        const dayIndicator = dayDifference > 0 ? ` (+${dayDifference}D)` : "";

        return {
          from: firstFlight
            ? {
                code: firstFlight?.origin?.airport?.airportCode,
                city: firstFlight?.origin?.airport?.cityName,
                date: firstFlight?.origin?.depTime,
              }
            : null,
          to: lastFlight
            ? {
                code: lastFlight?.destination?.airport?.airportCode,
                city: lastFlight?.destination?.airport?.cityName,
                date: lastFlight?.destination?.arrTime,
              }
            : null,
          duration: `${Math.floor(duration / 60)}h ${duration % 60}m`,
          hasLayovers: segments?.some(
            (segment) => segment?.segment?.length > 1,
          ),
          journeyTypeName,
          dayIndicator,
        };
      }
    }

    return {
      from: null,
      to: null,
      duration: null,
      hasLayovers: false,
      journeyTypeName,
      dayIndicator: "",
    };
  };

  const { from, to, duration, hasLayovers, journeyTypeName, dayIndicator } =
    !isHotel ? getFlightDetails() : {};

  // const title = isHotel
  //   ? `Stay at ${data?.bookingResponse?.HotelName || "Hotel"},${
  //       data?.bookingResponse?.CityName || "NA"
  //     }`
  //   : `Flight from ${from?.city || data?.bookingdetails?.origin} to ${
  //       to?.city || data?.bookingdetails?.destination
  //     }`;
  const title = isHotel
    ? `Stay at ${data?.bookingResponse?.HotelName || "Hotel"}, ${data?.bookingResponse?.CityName || "NA"}`
    : isTrain
      ? `Train from ${from?.city || data?.transportBookingData?.booking?.origin} to ${to?.city || data?.transportBookingData?.booking?.destination}`
      : isBus
        ? `Bus from ${from?.city || data?.transportBookingData?.booking?.origin} to ${to?.city || data?.transportBookingData?.booking?.destination}`
        : isCab
          ? `Cab from ${from?.city || data?.transportBookingData?.booking?.origin} to ${to?.city || data?.transportBookingData?.booking?.destination}`
          : `Flight from ${from?.city || data?.bookingdetails?.origin} to ${to?.city || data?.bookingdetails?.destination}`;

  const isOutOfPolicy = data?.isOutOfPolicy || false;

  const totalBookingAmount =
    Number(data?.bookingdetails?.totalBookingAmount) ||
    data?.transportBookingData?.bookingDetails?.[0]?.journeyAmount ||
    0;
  const totalCost =
    totalBookingAmount % 1 === 0
      ? totalBookingAmount.toFixed(0)
      : totalBookingAmount.toFixed(2);

  const travelers = data?.bookingdetails?.passengerDetails?.length || 0;

  const primaryTraveler =
    data?.bookingdetails?.passengerDetails?.[0]?.email || "N/A";

  const checkIn = isHotel ? data?.bookingResponse?.CheckInDate : null;
  const checkOut = isHotel ? data?.bookingResponse?.CheckOutDate : null;

  const getDateRange = () => {
    if (isHotel) {
      return `${formatDate(checkIn)} - ${formatDate(checkOut)}`;
    } else if (journeyTypeName === "OneWay") {
      return formatDate(from?.date);
    } else if (isCab) {
      return `${formatDate(data?.transportBookingData?.bookingDetails?.[0]?.departureDate)} - ${formatDate(data?.transportBookingData?.bookingDetails?.[0]?.returnDate)}`;
    } else if (isTrain) {
      return `${formatDate(data?.transportBookingData?.bookingDetails?.[0]?.departureDate)} `;
    } else if (isBus) {
      return `${formatDate(data?.transportBookingData?.bookingDetails?.[0]?.departureDate)} `;
    } else {
      return `${formatDate(from?.date)} - ${formatDate(to?.date)}`;
    }
  };

  // const routeLabel = isHotel
  //   ? `${data?.bookingResponse?.HotelName || "Hotel"}`
  //   : `${from?.city || data?.bookingdetails?.origin} - ${to?.city || data?.bookingdetails?.destination
  //   } (${journeyTypeName})${dayIndicator}`;
  const routeLabel = isHotel
    ? `${data?.bookingResponse?.HotelName || "Hotel"}`
    : isTrain
      ? `${from?.city || data?.transportBookingData?.booking?.origin} - ${to?.city || data?.transportBookingData?.booking?.destination} `
      : isBus
        ? `${from?.city || data?.transportBookingData?.booking?.origin} - ${to?.city || data?.transportBookingData?.booking?.destination} `
        : isCab
          ? `${from?.city || data?.transportBookingData?.booking?.origin} - ${to?.city || data?.transportBookingData?.booking?.destination} `
          : `${from?.city || data?.bookingdetails?.origin} - ${to?.city || data?.bookingdetails?.destination} (${journeyTypeName})${dayIndicator}`;

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "approved":
        return "bg-[#418C12]";
      case "pending":
        return "bg-[#C2A406]";
      case "declined":
        return "bg-[#E53944]";
      case "cancelled":
        return "bg-[#E53944]";
      case "quoted":
        return "bg-[#155EEF]";
      default:
        return "";
    }
  };

  const shouldShowSecondApprovalButtons = () => {
    // Add your specific conditions here
    // For example:

    const isAutoRejected = transportData?.booking?.autoRejected || false;
    const rejectionReason = transportData?.booking?.rejectionReason || null;
    const policyViolations =
      transportData?.booking?.policyViolationDetails?.violationMessages || [];

    // ✅ Handle auto-rejected bookings (highest priority)
    if (
      (isTrain || isBus || isCab) &&
      isAutoRejected &&
      bookingStatus === "rejected"
    ) {
      return (
        <div className="flex flex-col items-start p-3 bg-red-50 rounded-lg border border-red-200">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-red-600 text-lg">🚫</span>
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
                {policyViolations.map((violation, index) => (
                  <li key={index} className="text-xs text-gray-600">
                    {violation}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Additional Info */}
          <div className="text-xs text-gray-500 mt-2 italic">
            This booking was automatically rejected due to policy violations.
          </div>
        </div>
      );
    }

    // ✅ Handle manually rejected bookings (not auto-rejected)
    if (
      (isTrain || isBus || isCab) &&
      bookingStatus === "rejected" &&
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
    if ((isTrain || isBus || isCab) && !isQuoted) {
      return (
        <div className="flex flex-col items-center p-2">
          <div className="text-center">
            <div className="text-sm text-[#C2A406] font-medium mb-1">
              ⏳ Waiting for Quote
            </div>
            <div className="text-xs text-gray-600">
              QuGo is working on getting the best quote for this booking
            </div>
            <div className="text-xs text-gray-500 mt-1">
              Status: <span className="font-medium capitalize">{status}</span>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="flex gap-2">
        <button
          onClick={() => openConfirmationModal("approve")}
          className="w-1/2 bg-[#155EEF] p-2  text-[#FFFFFF] rounded-lg text-xs sm:text-sm font-bold mt-2"
        >
          APPROVE
        </button>
        <button
          onClick={() => openConfirmationModal("reject")}
          className="w-1/2 bg-[#FFFFFF] p-2  text-[#E53944] border border-[#E53944] rounded-lg text-xs sm:text-sm font-bold mt-2"
        >
          Reject
        </button>
      </div>
    );
  };

  // Format dates
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return `${date.getDate()}${getOrdinalSuffix(
      date.getDate(),
    )} ${date.toLocaleString("default", {
      month: "long",
    })}, ${date.getFullYear()}`;
  };

  const getOrdinalSuffix = (day) => {
    if (day > 3 && day < 21) return "th";
    switch (day % 10) {
      case 1:
        return "st";
      case 2:
        return "nd";
      case 3:
        return "rd";
      default:
        return "th";
    }
  };

  const handleFlightPayment = async (
    pgCode = null,
    payableAmount,
    walletDeduction,
  ) => {
    try {
      let bookingPaymentRef;
      const bookingPaymentRefs =
        data?.bookingResponse?.[0]?.data?.bookingPaymentRefId;
      const mobileNumber = getTabSpecificData("phoneNumber");
      const bookingId = data?.bookingId;
      const companyId = data?.companyId;
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
    pgCode = null,
    payableAmount,
    walletDeduction,
  ) => {
    try {
      const mobile = getTabSpecificData("phoneNumber");
      const bookingId = data?.bookingId;
      const companyId = data?.companyId;
      const totalAmount = data?.bookingdetails?.totalBookingAmount;
      const payload = {
        pgCode: pgCode,
        travelCategory: "1",
        walletAmount: walletDeduction,
        charges: 0,
        paymentCategory: "BOOKING",
        bookingId: bookingId,
        companyId: companyId,
        orderAmount: payableAmount,
        orderCurrency: "INR",
        customerDetails: {
          customerName: null,
          customerEmail: null,
          customerPhone: mobile,
        },
      };
      const response = await axios.post(`${config.GET_SESSION_ID}`, payload);
      if (response?.data?.status === "SUCCESS") {
        const session = response?.data?.data;
        const queryParams = {
          bookingId: bookingId,
        };
        await routeToPg(
          pgCode,
          session.paymentSessionId,
          queryParams,
          bookingId,
          1,
          "BOOKING",
          "",
          companyId,
        );
      }
    } catch (error) {
      console.log(error);
    }
  };

  const confirmHotelPayment = async (walletDeduction) => {
    try {
      const bookingId = data?.bookingId;
      const companyId = data?.companyId;
      const confirmReq = {
        bookingId: bookingId,
        paymentRefernceId: companyId,
        paymentStatus: "SUCCESS",
        paymentAmount: 0,
        pgCode: null,
        walletAmount: walletDeduction,
      };
      const resp = await confirmPaymentHotels(confirmReq);
      // if (resp) {
      router.push({
        pathname: "/corporate/auth/booking/hotels/confirmation",
        query: { bookingId: bookingId },
      });
    } catch (error) {
      console.log("Error confirming hotel payment", error);
      showToast("error", "Failed to confirm hotel payment.");
    }
  };

  const confirmFlightPayment = async (walletDeduction) => {
    try {
      const bookingId = data?.bookingId;
      const companyId = data?.companyId;
      const confirmReq = {
        bookingId: bookingId,
        paymentReferenceId: companyId,
        paymentStatus: "SUCCESS",
        paymentAmount: 0,
        pgCode: null,
        walletAmount: walletDeduction,
      };
      const resp = await confirmPaymentFlights(confirmReq);
      // if (resp) {
      router.push({
        pathname: "/corporate/auth/booking/flights/flightConfirm",
        query: { booking_id: bookingId },
      });
    } catch (error) {
      console.log("Error confirming flight payment", error);
      showToast("error", "Failed to confirm flight payment.");
    }
  };

  const handleProceedToPay = async () => {
    if (isWalletAllowed && walletBalance > 0) {
      // Open the wallet modal
      setIsWalletModalOpen(true);
    } else {
      // Proceed directly to payment
      setLoading(true);
      try {
        const pgResponse = await axios.get(config.GET_PAYMENT_GATEWAY);
        if (pgResponse?.data?.status === "SUCCESS") {
          const pgCode = pgResponse?.data?.data?.pgCode;
          if (data?.travelCategory === "1") {
            await handleHotelPayment(pgCode, totalAmount, 0);
          } else {
            await handleFlightPayment(pgCode, totalAmount, 0);
          }
        }
      } catch (error) {
        console.log("Error occurred in payment", error);
      } finally {
        setLoading(false);
      }
    }
  };

  const handlePaymentProcess = async (payableAmount, walletDeduction) => {
    setLoading(true);
    try {
      if (payableAmount > 0) {
        // Proceed to payment gateway
        const pgResponse = await axios.get(config.GET_PAYMENT_GATEWAY);
        if (pgResponse?.data?.status === "SUCCESS") {
          const pgCode = pgResponse?.data?.data?.pgCode;
          if (data?.travelCategory === "1") {
            await handleHotelPayment(pgCode, payableAmount, walletDeduction);
          } else {
            await handleFlightPayment(pgCode, payableAmount, walletDeduction);
          }
        }
      } else {
        // Payable amount is zero, confirm payment and redirect
        if (data?.travelCategory === "1") {
          await confirmHotelPayment(walletDeduction);
        } else {
          await confirmFlightPayment(walletDeduction);
        }
      }
    } catch (error) {
      console.log("Error occurred in payment", error);
      showToast("error", "Something went wrong, please try again later!");
    } finally {
      setLoading(false);
      setIsWalletModalOpen(false);
    }
  };

  const handleCancelRequest = async (reqData) => {
    if (status !== "Cancelled") {
      // setLoading(true);
      try {
        let url = `${config.CORPORATE.CANCEL_APPROVAL}?bookingId=${data?.bookingId}`;
        const payload = {
          // cancelledBy: userDetails?.userId, // Dynamic userId
        };

        if (reqData?.reason) {
          url += `&reason=${encodeURIComponent(reqData.reason)}`;
        }
        if (reqData?.description) {
          url += `&description=${encodeURIComponent(reqData.description)}`;
        }
        const response = await axios.post(url, payload);
        if (response?.data?.status === "SUCCESS") {
          showToast("success", "Approval Request cancelled successfully");
          setIsCancelRequestModalOpen(false);
          if (onActionComplete) onActionComplete();
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
    }
  };

  const handleApprove = async () => {
    setLoading(true);
    try {
      const approverId = getTabSpecificData("userID");
      const url = `${config.CORPORATE.UPDATE_APPROVAL_STATUS}?bookingId=${data?.bookingId}&status=Approved`;
      const response = await axios.post(url);
      if (response?.data?.status === "SUCCESS") {
        showToast("success", "Request approved successfully");
        if (onActionComplete) onActionComplete();
      }
    } catch (error) {
      console.error("Error approving request:", error);
      showToast("error", "Failed to approve request");
    } finally {
      setLoading(false);
      setIsConfirmationModalOpen(false);
    }
  };

  const handleReject = async () => {
    setLoading(true);
    try {
      const approverId = getTabSpecificData("userID");
      const url = `${config.CORPORATE.UPDATE_APPROVAL_STATUS}?bookingId=${data?.bookingId}&status=Declined`;
      const response = await axios.post(url);
      if (response?.data?.status === "SUCCESS") {
        showToast("success", "Request rejected successfully");
        if (onActionComplete) onActionComplete();
      }
    } catch (error) {
      console.error("Error rejecting request:", error);
      showToast("error", "Failed to reject request");
    } finally {
      setLoading(false);
      setIsConfirmationModalOpen(false);
    }
  };

  const showCancelRequestModel = () => {
    if (status !== "Cancelled") {
      setLoading(true);
      setIsCancelRequestModalOpen(true);
    }
  };

  const closeCancelRequestModel = () => {
    setIsCancelRequestModalOpen(false);
    setLoading(false);
  };

  const openConfirmationModal = (type) => {
    setConfirmationType(type);
    setIsConfirmationModalOpen(true);
  };

  return (
    <>
      <div className="bg-white w-full sm:w-1/3 rounded-lg">
        <div className="relative">
          <Image
            src={imageSrc || fallbackImage}
            alt={isHotel ? "Hotel" : "Flight"}
            className="p-2 w-full h-36 rounded-lg"
            width={1000}
            height={1000}
            onError={(e) => {
              e.target.onerror = null; // Prevent infinite fallback loop
              e.target.src = fallbackImage; // Set fallback image
            }}
          />
          {status && (
            <div
              className={`absolute -bottom-3 left-3 mb-2 ml-2 ${getStatusColor(
                status,
              )} p-1 px-10 text-[#FFFFFF] text-sm rounded-full`}
            >
              <span className="p-3 text-sm">{status}</span>
            </div>
          )}
        </div>
        <div className="mt-2 p-3 w-full">
          <div className="w-full flex flex-col justify-between h-full">
            <div
              className="text-[#030F0C] text-sm sm:text-lg font-semibold min-w-[200px] sm:min-w-min"
              style={{ minHeight: "50px", lineHeight: "1.2" }}
            >
              <span>
                <FontAwesomeIcon
                  // icon={!isHotel ? faPlane : faBed}
                  icon={
                    isHotel
                      ? faBed
                      : isTrain
                        ? faTrain
                        : isBus
                          ? faBus
                          : isCab
                            ? faCar
                            : faPlane
                  }
                  className={`h-4 w-6 ${
                    isFlight ? "transform -rotate-45" : ""
                  }`}
                />{" "}
              </span>
              {title}
            </div>
            <div className="text-[#171A19] text-sm font-normal py-[2px]">
              <span>
                <FontAwesomeIcon
                  icon={faCalendar}
                  className="h-4 w-4 text-gray-400 mr-2"
                />{" "}
              </span>
              {getDateRange()}
            </div>
            <div className="text-[#171A19] text-sm font-normal py-[2px]">
              <span>
                <FontAwesomeIcon
                  icon={
                    isHotel
                      ? faBed
                      : isTrain
                        ? faTrain
                        : isBus
                          ? faBus
                          : isCab
                            ? faCar
                            : faPlane
                  }
                  className="h-4 w-4 text-gray-400 mr-2"
                />{" "}
              </span>
              {routeLabel}
            </div>
            <div className="flex flex-col sm:flex-row justify-between">
              <div>
                <div className="text-[#171A19] text-sm font-normal py-[2px]">
                  <span>
                    <FontAwesomeIcon
                      icon={faUser}
                      className="h-4 w-4 text-gray-400 mr-2"
                    />{" "}
                  </span>
                  {data?.userName || primaryTraveler}
                  {travelers > 1 && +travelers - 1}
                </div>
                {isOutOfPolicy && (
                  <div className="text-red-600 text-xs font-medium py-[2px]">
                    <FontAwesomeIcon
                      icon={faCircleInfo}
                      color="red"
                      className="w-4 h-3 text-red-600 mr-3"
                    />
                    Out of Policy
                  </div>
                )}
              </div>
              <div className="flex sm:flex-col justify-between items-center">
                <div className="text-[#9D9D9D] text-xs font-medium py-[2px]">
                  Total Trip Cost
                </div>
                <div className="text-[#1C1C1C] text-md font-bold py-[2px]">
                  ₹ {formatPrice(totalCost)}
                </div>
              </div>
            </div>
            <div className="mt-3">
              {showProceedButton &&
                !isTrain &&
                !isBus &&
                !isCab &&
                status.toLowerCase().trim() === "approved" && (
                  <>
                    {data?.paymentStatus?.toLowerCase().trim() === "success" ||
                    data?.paymentStatus?.toLowerCase().trim() === "paid" ? (
                      // Display the "Paid" label if the payment status is "SUCCESS" or "PAID"
                      <div className="w-full bg-[#418C12] p-3 text-[#FFFFFF] rounded-lg text-xs md:text-base font-bold mt-2 text-center">
                        Paid | Rs{" "}
                        {formatPrice(data?.bookingdetails?.totalBookingAmount)}
                      </div>
                    ) : (
                      // userType === 1 ||
                      (isWalletAllowed || userType === 1) && (
                        // Show the "Proceed to Pay" button if the payment has not been completed
                        <button
                          onClick={handleProceedToPay}
                          className="w-full bg-[#155EEF] p-3 text-[#FFFFFF] rounded-lg text-xs md:text-base font-bold mt-2"
                        >
                          Proceed to Pay | Rs{" "}
                          {formatPrice(
                            data?.bookingdetails?.totalBookingAmount,
                          )}
                        </button>
                      )
                    )}
                  </>
                )}
              {showCancelButton &&
                status.toLowerCase().trim() !== "cancelled" &&
                status.toLowerCase().trim() !== "approved" &&
                status.toLowerCase().trim() !== "declined" && (
                  <button
                    onClick={showCancelRequestModel}
                    disabled={loading}
                    className="w-full bg-[#155EEF] p-3 text-[#FFFFFF] rounded-lg text-xs sm:text-base font-bold mt-2"
                  >
                    {loading ? (
                      <>
                        <div className="flex items-center gap-2">
                          <FontAwesomeIcon icon={faSpinner} spin />
                          <span>Processing...</span>
                        </div>
                      </>
                    ) : (
                      "Cancel Request"
                    )}
                  </button>
                )}
              {showApprovalButtons && (
                <>
                  {/* <div className="flex gap-2">
                  <button
                    onClick={() => openConfirmationModal("approve")}
                    className="w-1/2 bg-[#155EEF] p-2 text-[#FFFFFF] rounded-lg text-xs sm:text-sm font-bold mt-2"
                  >
                    APPROVE
                  </button>
                  <button
                    onClick={() => openConfirmationModal("reject")}
                    className="w-1/2 bg-[#FFFFFF] p-2 text-[#E53944] border-1 border-[#E53944] rounded-lg text-xs sm:text-sm font-bold mt-2"
                  >
                    Reject
                  </button>
                </div> */}
                  {shouldShowSecondApprovalButtons()}
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {isWalletModalOpen && (
        <WalletPaymentModal
          isOpen={isWalletModalOpen}
          onClose={() => setIsWalletModalOpen(false)}
          onProceed={handlePaymentProcess}
          totalAmount={totalAmount}
          travelCategory={data?.travelCategory}
          bookingId={data?.bookingId}
          companyId={data?.companyId}
        />
      )}

      {isCancelRequestModalOpen && (
        <RequestModal
          isOpen={isCancelRequestModalOpen}
          onClose={closeCancelRequestModel}
          title="Are you sure you want to cancel your Travel Request ?"
          subtitle="If you cancel your request, Your approver will be notified about the cancellation."
          showApproverDetails={false}
          showReasonInput={true}
          showDescriptionInput={false}
          isDescriptionRequired={false}
          onSubmit={handleCancelRequest}
          buttonConfig={{
            submit: "Cancel Request",
          }}
          loading={loading}
          cancelPopup={isCancelRequestModalOpen}
        />
      )}
      {isConfirmationModalOpen && (
        <Modal
          title={
            confirmationType === "approve"
              ? "Approve Travel Request?"
              : "Reject Travel Request?"
          }
          onClose={() => setIsConfirmationModalOpen(false)}
          actions={
            <>
              <button
                className="bg-gray-500 text-white p-2 px-4 rounded-lg hover:bg-gray-700 transition-colors duration-300"
                onClick={() => setIsConfirmationModalOpen(false)}
              >
                Cancel
              </button>
              <button
                className={`p-2 px-4 rounded-lg text-white transition-colors duration-300 ${
                  confirmationType === "approve"
                    ? "bg-[#155EEF]"
                    : "bg-red-600 hover:bg-red-800"
                }`}
                onClick={
                  confirmationType === "approve" ? handleApprove : handleReject
                }
                disabled={loading}
              >
                {loading ? (
                  <FontAwesomeIcon icon={faSpinner} spin className="mr-2" />
                ) : confirmationType === "approve" ? (
                  "Approve"
                ) : (
                  "Reject"
                )}
              </button>
            </>
          }
        >
          <p>
            {confirmationType === "approve"
              ? "Are you sure you want to approve this travel request? This action cannot be undone."
              : "Are you sure you want to reject this travel request? This action cannot be undone."}
          </p>
        </Modal>
      )}
    </>
  );
};

export default RequestCard;
