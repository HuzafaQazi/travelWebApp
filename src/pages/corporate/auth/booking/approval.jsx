import { useMemo, useCallback, useEffect, useState, useRef } from "react";
import Image from "next/image";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faChevronRight,
  faSpinner,
  faMagnifyingGlass,
  faCaretDown,
  faArrowUp,
  faTimes,
  faTrain,
  faBus,
  faTaxi,
} from "@fortawesome/free-solid-svg-icons";
import takeOff from "@/images/corporate/takeOff.png";
import hotel from "@/images/corporate/Group 14481.png";
import Header from "@/components/corporate/auth/Header";
import axios, { getTabSpecificData } from "@/utils/axios/axios";
import config from "@/config";
import showToast from "@/utils/toast";
import { formatPrice } from "@/utils/common";
import { useRouter } from "next/router";
import RequestModal from "@/components/corporate/approvalRequest/request";
import Modal from "@/components/corporate/modal/Modal";
import ProtectedRoute from "@/components/corporate/protectedRoute/ProtectedRoute";
import { useUserPermissions } from "@/hooks/useUserPermissions";
import NoTrips from "@/components/corporate/noTrips/noTrips";
import { NoDataMessage } from "@/components/corporate/errorStatus/StatusComponents";
import { routeToPg } from "@/paymentGateways/pgRouting";
import { getPaymentSessionID } from "@/utils/bookingAPI";
import { useGlobalEvent } from "@/hooks/useGlobalEvent";
import { useSelector, useDispatch } from "react-redux";
import { setNeedsRefresh } from "@/store/slices/approvalSlice";
import WalletPaymentModal from "@/components/Modals/WalletPaymentModal";
import { useWalletBalance } from "@/hooks/useWalletBalance";
import {
  confirmPaymentHotels,
  confirmPaymentFlights,
} from "@/utils/walletApis";
import Head from "next/head";
import Footer2 from "@/components/corporate/footerCorporate/footerCorporate";
import style from "./style.module.css";

const TripCard = ({
  trip,
  requestType,
  onTripUpdated,
  walletBalance,
  userType,
}) => {
  const router = useRouter();

  const userDetails = useSelector((state) => state?.user?.userInfo);
  const isWalletAllowed =
    userDetails?.loggedInDetails?.configuration?.walletAllowed;

  const [isCancelRequestModalOpen, setIsCancelRequestModalOpen] =
    useState(false);
  const [isConfirmationModalOpen, setIsConfirmationModalOpen] = useState(false);
  const [confirmationType, setConfirmationType] = useState(null);
  const [loading, setLoading] = useState(false);
  const [pageLoader, setPageLoader] = useState(false);
  const [isWalletModalOpen, setIsWalletModalOpen] = useState(false);
  const [totalAmount, setTotalAmount] = useState(
    Number(trip?.bookingdetails?.totalBookingAmount) || 0
  );

  // Determine trip type and get appropriate icon
  const isHotel = trip?.travelCategory === "1";
  const isTransport = ["3", "4", "5"].includes(trip?.travelCategory);

  const getTransportIcon = () => {
    switch (trip?.travelCategory) {
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

  const getTransportName = () => {
    switch (trip?.travelCategory) {
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

  const icon = isTransport ? null : isHotel ? hotel : takeOff;
  const transportIcon = isTransport ? getTransportIcon() : null;

  // Get transport booking details
  const transportData = trip?.transportBookingData;
  const bookingStatus = transportData?.booking?.bookingStatus || "pending";
  const isQuoted = bookingStatus === "quoted";

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const days = [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ];
    const months = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];

    return {
      formattedDate: `${date.getDate()}${getOrdinalSuffix(date.getDate())} ${
        months[date.getMonth()]
      }, ${date.getFullYear().toString().substr(-2)}`,
      dayOfWeek: days[date.getDay()],
      time: date
        .toLocaleTimeString("en-US", {
          hour: "numeric",
          minute: "2-digit",
          hour12: true,
        })
        .toLowerCase(),
    };
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

  useEffect(() => {
    const handleBodyScroll = () => {
      document.body.style.overflow = isCancelRequestModalOpen
        ? "hidden"
        : "auto";
    };

    handleBodyScroll();
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [isCancelRequestModalOpen]);

  // Get transport journey details
  const getTransportDetails = () => {
    if (!isTransport || !transportData?.bookingDetails) {
      return { from: null, to: null, journeyInfo: null };
    }

    const journeys = transportData.bookingDetails;
    const firstJourney = journeys[0];

    if (!firstJourney) {
      return { from: null, to: null, journeyInfo: null };
    }

    const fromCity =
      firstJourney.fromCity?.name || firstJourney.fromCity?.city || "Unknown";
    const toCity =
      firstJourney.toCity?.name || firstJourney.toCity?.city || "Unknown";

    return {
      from: {
        city: fromCity,
        ...formatDate(firstJourney.departureDate),
      },
      to: {
        city: toCity,
        // For transport, we might not have arrival time, so we'll use departure date + some indication
        ...formatDate(firstJourney.departureDate),
      },
      journeyInfo: {
        journeyCount: journeys.length,
        totalAmount: transportData.booking?.totalAmount || 0,
        cabType: trip?.travelCategory === "5" ? firstJourney.cabType : null,
        driverRequired:
          trip?.travelCategory === "5" ? firstJourney.driverRequired : false,
      },
    };
  };

  const getFlightDetails = () => {
    if (!trip?.bookingResponse || !Array.isArray(trip?.bookingResponse)) {
      return { from: null, to: null, duration: null };
    }

    let firstFlight = null;
    let lastFlight = null;

    // Get journeyTypeName from the correct path in the response
    const journeyTypeName =
      trip?.bookingResponse?.[0]?.data?.flightItinerary?.journeyTypeName ||
      "OneWay";

    // Handle multiple booking responses (round trip)
    if (trip?.bookingResponse?.length > 1) {
      const firstSegment =
        trip.bookingResponse[0]?.data?.flightItinerary?.segments?.[0];
      firstFlight = firstSegment?.segment?.[0];

      const lastBookingSegments =
        trip?.bookingResponse?.[trip?.bookingResponse?.length - 1]?.data
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
        (arrivalDate - departureDate) / (1000 * 60 * 60 * 24)
      );

      // Define the day indicator (e.g., +1D, +2D, etc.)
      const dayIndicator = dayDifference > 0 ? ` +${dayDifference}D` : "";

      return {
        from: firstFlight
          ? {
              code: firstFlight?.origin?.airport?.airportCode,
              city: firstFlight?.origin?.airport?.cityName,
              ...formatDate(firstFlight?.origin?.depTime),
            }
          : null,
        to: lastFlight
          ? {
              code: lastFlight?.destination?.airport?.airportCode,
              city: lastFlight?.destination?.airport?.cityName,
              ...formatDate(lastFlight?.destination?.arrTime),
            }
          : null,
        duration: `${Math.floor(duration / 60)}h ${duration % 60}m`,
        hasLayovers: trip?.bookingResponse?.some((booking) =>
          booking?.data?.flightItinerary?.segments?.some(
            (segment) => segment?.segment?.length > 1
          )
        ),
        journeyTypeName,
        dayIndicator,
      };
    } else {
      const segments =
        trip?.bookingResponse?.[0]?.data?.flightItinerary?.segments;
      if (segments && segments.length > 0) {
        firstFlight = segments[0]?.segment[0];
        const lastSegment = segments[segments.length - 1];
        lastFlight = lastSegment?.segment[lastSegment?.segment.length - 1];

        const duration = segments.reduce((acc, segment) => {
          const segmentDuration = Number(segment?.journeyDuration) || 0;
          return acc + segmentDuration;
        }, 0);

        // Calculate the date difference between departure and arrival
        const departureDate = new Date(firstFlight?.origin?.depTime);
        const arrivalDate = new Date(lastFlight?.destination?.arrTime);
        const dayDifference = Math.floor(
          (arrivalDate - departureDate) / (1000 * 60 * 60 * 24)
        );

        // Define the day indicator (e.g., +1D, +2D, etc.)
        const dayIndicator = dayDifference > 0 ? ` (+${dayDifference}D)` : "";

        return {
          from: firstFlight
            ? {
                code: firstFlight?.origin?.airport?.airportCode,
                city: firstFlight?.origin?.airport?.cityName,
                ...formatDate(firstFlight?.origin?.depTime),
              }
            : null,
          to: lastFlight
            ? {
                code: lastFlight?.destination?.airport?.airportCode,
                city: lastFlight?.destination?.airport?.cityName,
                ...formatDate(lastFlight?.destination?.arrTime),
              }
            : null,
          duration: `${Math.floor(duration / 60)}h ${duration % 60}m`,
          hasLayovers: segments?.some(
            (segment) => segment?.segment?.length > 1
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

  // Get details based on trip type
  const tripDetails = isTransport ? getTransportDetails() : getFlightDetails();
  const {
    from,
    to,
    duration,
    hasLayovers,
    journeyTypeName,
    dayIndicator,
    journeyInfo,
  } = tripDetails;

  const title = isHotel
    ? `Stay at ${trip?.bookingResponse?.HotelName || "Hotel"},${
        trip?.bookingResponse?.CityName || "NA"
      }`
    : isTransport
    ? `${getTransportName()} from ${from?.city || "Unknown"} to ${
        to?.city || "Unknown"
      }`
    : `Flight from ${from?.city || trip?.bookingdetails?.origin} to ${
        to?.city || trip?.bookingdetails?.destination
      }`;

  const formatDate1 = (dateString) => {
    // Parse the date and ensure it's valid
    if (!dateString || isNaN(new Date(dateString).getTime())) {
      return "Invalid Date"; // Fallback for invalid dates
    }

    const date = new Date(dateString);

    // Format the date with the weekday
    const formattedDate = date.toLocaleDateString("en-GB", {
      weekday: "long", // Include full weekday name
      day: "numeric", // Numeric day without leading zero
      month: "long", // Full month name
      year: "numeric", // Full year
      timeZone: "Asia/Kolkata", // Correct IANA time zone identifier
    });

    // Format the time in 12-hour format
    const formattedTime = date.toLocaleTimeString("en-GB", {
      hour: "numeric", // Numeric hour
      minute: "2-digit", // Two-digit minutes
      hour12: true, // 12-hour format
      timeZone: "Asia/Kolkata", // Correct IANA time zone identifier
    });

    // Combine date and time
    return `${formattedDate} at ${formattedTime}`;
  };

  const requestedDate = isHotel
    ? trip?.bookingResponse?.CreateDate
    : isTransport
    ? transportData?.booking?.createdAt
    : trip?.bookingResponse?.[0]?.data?.createdDate;

  const status = trip?.approvalStatus || "Pending";

  // Assuming isOutOfPolicy is a field in your trip data
  const isOutOfPolicy = trip?.isOutOfPolicy || false;

  const totalBookingAmount =
    Number(trip?.bookingdetails?.totalBookingAmount) ||
    (isTransport ? Number(journeyInfo?.totalAmount) : 0) ||
    0;
  const totalCost =
    totalBookingAmount % 1 === 0
      ? totalBookingAmount.toFixed(0)
      : totalBookingAmount.toFixed(2);

  const travelers = trip?.bookingdetails?.passengerDetails?.length || 0;

  const primaryTraveler =
    trip?.bookingdetails?.passengerDetails?.[0]?.email || "N/A";

  const MAX_VISIBLE_APPROVERS = 4;

  const approvers =
    trip?.bookingdetails?.passengerDetails?.flatMap((passenger) =>
      passenger?.approvers
        ? passenger?.approvers?.map((approver) => approver?.email)
        : []
    ) || [];

  const visibleApprovers = approvers.slice(0, MAX_VISIBLE_APPROVERS);
  const remainingApprovers = approvers.slice(MAX_VISIBLE_APPROVERS);
  const [showEmails, setShowEmails] = useState(false);
  const [showApprovers, setShowApprovers] = useState(false);

  // Extract all emails except the first (primary traveler)
  const passengerEmails = trip?.bookingdetails?.passengerDetails
    ?.slice(1) // Skip the primary traveler
    .map((passenger) => passenger.email)
    .filter(Boolean);

  const checkIn = isHotel
    ? trip?.bookingResponse?.CheckInDate
    : isTransport
    ? from?.formattedDate
    : null;
  const checkOut = isHotel
    ? trip?.bookingResponse?.CheckOutDate
    : isTransport
    ? to?.formattedDate
    : null;

  const durationLabel = isHotel
    ? `${trip?.bookingResponse?.NoOfNights + 1 || 1} Days | ${
        trip?.bookingResponse?.NoOfNights || 1
      } Nights`
    : isTransport
    ? `${getTransportName()}${
        journeyInfo?.journeyCount > 1
          ? ` | ${journeyInfo?.journeyCount} journeys`
          : ""
      }`
    : `${journeyTypeName} | ${duration}${dayIndicator}${
        hasLayovers ? " (Layover)" : ""
      }`;

  const renderHeader = () => {
    if (requestType === 1) {
      return (
        <div className="font-medium text-xs sm:text-xl text-[#171A19] px-2">
          <span className="font-bold">{trip?.userName}</span> requested for the
          booking <span className="font-bold">{title}</span>
        </div>
      );
    } else {
      return (
        <div className="font-medium text-xs sm:text-xl text-[#171A19] px-2">
          <span className="font-bold">{title}</span>
        </div>
      );
    }
  };

  const handleFlightPayment = async (
    pgCode = null,
    payableAmount,
    walletDeduction
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
        null
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
          companyId
        );
      }
    } catch (error) {
      console.log(error);
    }
  };

  const handleHotelPayment = async (
    pgCode = null,
    payableAmount,
    walletDeduction
  ) => {
    try {
      const mobile = getTabSpecificData("phoneNumber");
      const bookingId = trip?.bookingId;
      const companyId = trip?.companyId;
      const totalAmount = trip?.bookingdetails?.totalBookingAmount;
      const payload = {
        pgCode: pgCode,
        travelCategory: "1",
        walletAmount: Math.max(0, walletDeduction),
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
          companyId
        );
      }
    } catch (error) {
      console.log(error);
    }
  };

  const confirmHotelPayment = async (walletDeduction) => {
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
          if (trip?.travelCategory === "1") {
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
        // Payment gateway
        const pgResponse = await axios.get(config.GET_PAYMENT_GATEWAY);
        if (pgResponse?.data?.status === "SUCCESS") {
          const pgCode = pgResponse?.data?.data?.pgCode;
          if (trip?.travelCategory === "1") {
            await handleHotelPayment(pgCode, payableAmount, walletDeduction);
          } else {
            await handleFlightPayment(pgCode, payableAmount, walletDeduction);
          }
        }
      } else {
        // Payable amount is zero, confirm payment and redirect
        if (trip?.travelCategory === "1") {
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

  const handleCancelRequest = async (data) => {
    if (status !== "Cancelled") {
      try {
        let url = `${config.CORPORATE.CANCEL_APPROVAL}?bookingId=${trip?.bookingId}`;

        const payload = {
          // cancelledBy: userDetails?.userId,
        };
        if (data?.reason) {
          url += `&reason=${encodeURIComponent(data.reason)}`;
        }
        if (data?.description) {
          url += `&description=${encodeURIComponent(data.description)}`;
        }
        const response = await axios.post(url, payload, { timeout: 10000 });
        if (response?.data?.status === "SUCCESS") {
          showToast("success", "Approval Request cancelled successfully");
          setIsCancelRequestModalOpen(false);
        }
      } catch (error) {
        console.log(error);
        showToast(
          "error",
          error?.response?.data?.message || "Something went wrong"
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
      const url = `${config.CORPORATE.UPDATE_APPROVAL_STATUS}?bookingId=${trip?.bookingId}&status=Approved`;
      const response = await axios.post(url);
      if (response?.data?.status === "SUCCESS") {
        showToast("success", "Request approved successfully");
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
      const url = `${config.CORPORATE.UPDATE_APPROVAL_STATUS}?bookingId=${trip?.bookingId}&status=Declined`;
      const response = await axios.post(url);
      if (response?.data?.status === "SUCCESS") {
        showToast("success", "Request rejected successfully");
      }
    } catch (error) {
      console.error("Error rejecting request:", error);
      showToast("error", "Failed to reject request");
    } finally {
      setLoading(false);
      setIsConfirmationModalOpen(false);
    }
  };

  const openConfirmationModal = (type) => {
    setConfirmationType(type);
    setIsConfirmationModalOpen(true);
  };

  // const handleViewRequest = async () => {

  //   setPageLoader(true);
  //   try {
  //     let url;
  //     if (trip.travelCategory === "1") {
  //       url = `/corporate/auth/booking/hotels/approvalStatus?companyId=${trip?.companyId}&bookingId=${trip?.bookingId}`;
  //     } else if (isTransport) {
  //       // Add transport-specific view URL
  //       url = `/corporate/auth/booking/transport/approvalStatus?companyId=${trip?.companyId}&bookingId=${trip?.bookingId}`;
  //     } else {
  //       url = `/corporate/auth/booking/flights/flightApproval?companyId=${trip?.companyId}&bookingId=${trip?.bookingId}`;
  //     }
  //     await router.push(url);
  //   } catch (error) {
  //     console.log(error);
  //   } finally {
  //     setPageLoader(false);
  //   }
  // };
  const handleViewRequest = async () => {
    setPageLoader(true);
    try {
      let url;
      if (trip.travelCategory === "1") {
        url = `/corporate/auth/booking/hotels/approvalStatus?bookingId=${trip?.bookingId}`;
      } else if (isTransport) {
        // Add transport-specific view URL
        url = `/corporate/auth/booking/carbustrain/commonApproval?bookingId=${trip?.bookingId}`;
      } else {
        url = `/corporate/auth/booking/flights/flightApproval?bookingId=${trip?.bookingId}`;
      }
      await router.push(url);
    } catch (error) {
      console.log(error);
    } finally {
      setPageLoader(false);
    }
  };

  const renderButtons = () => {
    const isPaid =
      trip?.paymentStatus === "PAID" || trip?.paymentStatus === "SUCCESS";

    const shouldShowPayButton = userType === 1;

    if (requestType === 1 && status === "Approved") {
      return isPaid ? (
        <div className="flex flex-col-reverse sm:flex-row mt-2 items-center gap-2">
          <span className="bg-[#418C12] text-white px-4 py-1 rounded-full text-sm">
            Paid
          </span>
          <span className="text-[#418C12] font-medium">
            Rs {formatPrice(totalCost)}
          </span>
        </div>
      ) : (
        // shouldShowPayButton ||
        !isTransport && (isWalletAllowed || shouldShowPayButton) && (
          <button
            onClick={handleProceedToPay}
            className="w-fit px-4 mt-1 flex flex-col items-center bg-[#155EEF] p-2 rounded-full text-white text-xxs sm:text-base"
          >
            <div>
              <span>Proceed to pay | </span>
              <span>Rs {formatPrice(totalCost)}</span>
            </div>
          </button>
        )
      );
    } else if (
      requestType === 2 &&
      status !== "Cancelled" &&
      status !== "Declined"
    ) {
      if (isPaid) {
        return (
          <div className="flex flex-col-reverse sm:flex-row items-center gap-2">
            <span className="bg-[#418C12] text-white px-4 py-2 rounded-full text-sm">
              Paid
            </span>
            <span className="text-[#418C12] font-medium">
              Rs {formatPrice(totalCost)}
            </span>
          </div>
        );
      }
      if (
        status === "Approved" &&
        !isTransport &&
        (isWalletAllowed || shouldShowPayButton)
      ) {
        return (
          <button
            onClick={handleProceedToPay}
            disabled={loading}
            className="w-fit px-4 flex flex-col items-center bg-[#155EEF] p-2 rounded-full text-white text-base"
          >
            {loading ? (
              <>
                <div className="flex items-center gap-2">
                  <FontAwesomeIcon icon={faSpinner} spin />
                  <span>Processing...</span>
                </div>
              </>
            ) : (
              <div className="text-xxs sm:text-base">
                <span>Proceed to Pay | </span>
                <span>Rs {formatPrice(totalCost)}</span>
              </div>
            )}
          </button>
        );
      }
      if (status !== "Approved") {
        return (
          <button
            onClick={showCancelRequestModel}
            disabled={loading}
            className="w-fit px-4 flex flex-col items-center bg-[#155EEF] p-2 rounded-full text-white text-base"
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
        );
      }
    } else if (requestType === 3) {
      const isAutoRejected = transportData?.booking?.autoRejected || false;
      const rejectionReason = transportData?.booking?.rejectionReason || null;
      const policyViolations =
        transportData?.booking?.policyViolationDetails?.violationMessages || [];

      // ✅ Handle auto-rejected bookings (highest priority)
      if (isTransport && isAutoRejected && bookingStatus === "rejected") {
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
      if (isTransport && bookingStatus === "rejected" && !isAutoRejected) {
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

      // ✅ Show "Waiting for Quote" only for non-rejected, non-quoted bookings
      if (isTransport && !isQuoted && bookingStatus !== "rejected") {
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
                Status:{" "}
                <span className="font-medium capitalize">{bookingStatus}</span>
              </div>
            </div>
          </div>
        );
      }

      return (
        <div className="flex gap-2">
          <button
            onClick={() => openConfirmationModal("reject")}
            className="w-1/2 bg-[#FFFFFF] p-2 px-4 text-[#E53944] border border-[#E53944] rounded-full text-xs font-normal mt-1"
          >
            Reject
          </button>
          <button
            onClick={() => openConfirmationModal("approve")}
            className="w-1/2 bg-[#155EEF] p-2 px-4 text-[#FFFFFF] rounded-full text-xs font-normal mt-1"
          >
            APPROVE
          </button>
        </div>
      );
    }
  };

  return (
    <>
      {pageLoader ? (
        <></>
      ) : (
        <div className="border-[0.5px] border-[#155EEF50] m-2 p-3 rounded-2xl hover:border-[#155EEF] shadow-[0px_4px_4px_0px_#00000040] relative">
          {requestType === 2 && (
            <div className="absolute top-[-20px]">
              <button
                className={`text-[#FFFFFF] text-xs font-medium p-2 px-4 rounded-full ${
                  status === "Approved"
                    ? "bg-[#418C12]"
                    : status === "Pending"
                    ? "bg-[#C2A406]"
                    : "bg-[#E53944]"
                }`}
              >
                {status}
              </button>
            </div>
          )}
          <div className=" flex-col sm:flex sm:flex-row justify-between">
            <div className="flex items-center">
              {isTransport ? (
                <FontAwesomeIcon
                  icon={transportIcon}
                  className="w-[30px] h-[30px] text-[#155EEF]"
                />
              ) : (
                <Image
                  src={icon}
                  className="w-[30px] h-[30px]"
                  alt={isHotel ? "Hotel" : "Flight"}
                />
              )}
              {renderHeader()}
              {isOutOfPolicy && (
                <button
                  className={`text-[#FFFFFF] text-xs p-2 px-4 rounded-full ${
                    !isOutOfPolicy ? "bg-[#418C12]" : "bg-[#E53944]"
                  }`}
                >
                  {isOutOfPolicy ? "Out-of-Policy" : "In-Policy"}
                </button>
              )}
              {isTransport && (
                <span className="bg-[#E8F4FD] text-[#155EEF] text-xs font-medium px-3 py-1 rounded-full ml-2">
                  {getTransportName()}
                </span>
              )}
            </div>
            <div className="flex gap-3 mt-2 sm:mt-0 justify-between items-center">
              {requestType === 1 && status === "Approved" && (
                <button className="text-[#418C12] text-xxs sm:text-sm font-medium bg-[#EAF0E6] p-2 rounded-full">
                  APPROVED
                </button>
              )}
              {requestType === 1 && status === "Declined" && (
                <button className="text-[#fff] text-xxs sm:text-sm font-sm bg-[#E53944] p-2 rounded-full">
                  DECLINED
                </button>
              )}
              {requestType === 1 && status === "Cancelled" && (
                <button className="text-[#fff] text-xxs sm:text-sm font-medium bg-[#E53944] p-2 rounded-full">
                  CANCELLED
                </button>
              )}
              {requestType === 1 && status === "Pending" && (
                <button className="text-[#fff] text-xxs sm:text-sm font-medium bg-[#C2A406] p-2 rounded-full">
                  PENDING
                </button>
              )}
              <div
                className="text-[#155EEF] ml-auto text-xs sm:text-sm font-medium px-1 cursor-pointer"
                onClick={handleViewRequest}
              >
                View request
                <span>
                  <FontAwesomeIcon
                    icon={faChevronRight}
                    className="text-xs ml-2"
                  />
                </span>
              </div>
            </div>
          </div>
          {/* Card Content */}
          <div className="flex flex-col sm:flex-row">
            {/* Left Side */}
            <div className="p-2 px-0 w-[100%] sm:w-[40%]">
              <div className="flex items-center">
                <div className="text-left">
                  <span className="block bg-[#D9D9D961] font-medium text-xxs sm:text-xs text-[#171A19] rounded-full w-fit p-2 px-3 mb-2">
                    {isHotel ? "Check-in" : isTransport ? "From" : "From"}
                  </span>
                  {!isHotel && !isTransport && (
                    <span className="block font-semibold text-xs sm:text-base text-[#171A19]">
                      {from?.code}
                    </span>
                  )}
                  <span className="block font-semibold text-xs sm:text-base text-[#171A19]">
                    {isHotel
                      ? `${formatDate(checkIn).formattedDate}`
                      : isTransport
                      ? `${from?.city}`
                      : `${from?.formattedDate}`}
                  </span>
                  <span className="block text-xxs sm:text-xs font-normal text-[#171A19]">
                    {isHotel
                      ? ""
                      : isTransport
                      ? `${from?.formattedDate}`
                      : `${from?.dayOfWeek}, ${from?.time}`}
                  </span>
                </div>
                <div className="relative flex items-center justify-center flex-1">
                  <span className="absolute px-1 font-normal text-xxs sm:text-xs text-[#155EEF] top-1 transform -translate-y-1/2">
                    {durationLabel}
                  </span>
                  <hr className="border-dashed border-black-300 mx-2 mt-4 w-full h-1" />
                </div>
                <div className="text-right">
                  <span className="block bg-[#D9D9D961] font-medium text-xxs sm:text-xs text-[#171A19] rounded-full w-fit p-2 px-3 mb-2 ml-auto">
                    {isHotel ? "Check-out" : isTransport ? "To" : "To"}
                  </span>
                  {!isHotel && !isTransport && (
                    <span className="block font-semibold text-xs sm:text-base text-[#171A19]">
                      {to?.code}
                    </span>
                  )}
                  <span className="block font-semibold text-xs sm:text-base text-[#171A19]">
                    {isHotel
                      ? `${formatDate(checkOut).formattedDate}`
                      : isTransport
                      ? `${to?.city}`
                      : `${to?.formattedDate}`}
                  </span>
                  <span className="block text-xs font-normal text-[#171A19]">
                    {isHotel
                      ? ""
                      : isTransport
                      ? `${to?.formattedDate}`
                      : `${to?.dayOfWeek}, ${to?.time}`}
                  </span>
                </div>
              </div>
            </div>
            {/* Divider */}
            <div className="hidden sm:block border-l-2 border-solid border-[#D9D9D9] h-[100px] mt-2 mx-3"></div>
            {/* Right Side */}
            <div className="p-2 px-0 w-[100%] sm:w-[60%]">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between">
                <div className="flex flex-col sm:w-[60%]">
                  <div className="bg-[#D9D9D961] font-normal text-xs text-[#171A19] rounded-full w-fit p-2 px-4 mb-2">
                    {!isHotel ? "Travelers" : "Guest Count"}{" "}
                    <span className="font-semibold">({travelers})</span>
                  </div>
                  {/* Transport-specific info */}
                  {isTransport && journeyInfo?.cabType && (
                    <div className="mb-2">
                      <div className="text-xs text-[#171A19] font-semibold">
                        Cab Type:{" "}
                        <span className="font-normal">
                          {journeyInfo?.cabType?.name || "Standard"}
                        </span>
                      </div>
                      {journeyInfo?.driverRequired && (
                        <div className="text-xs text-[#171A19] font-semibold">
                          <span className="font-normal">Driver Required</span>
                        </div>
                      )}
                    </div>
                  )}
                  <div className="flex items-center">
                    <div className="flex flex-col">
                      <div className="flex gap-1 items-center">
                        <div className="text-[#171A19] text-sm font-semibold">
                          Primary traveler - {primaryTraveler}
                        </div>
                        <div
                          className="relative w-fit"
                          onMouseEnter={() => setShowEmails(true)}
                          onMouseLeave={() => setShowEmails(false)}
                        >
                          {travelers > 1 && (
                            <div className="text-xs text-[#155EEF] font-medium  w-fit cursor-pointer">
                              +{travelers - 1} travelers
                            </div>
                          )}

                          {showEmails && passengerEmails?.length > 0 && (
                            <div className="absolute top-full -left-20 sm:left-0 mt-1 p-2 bg-white border rounded shadow-lg text-sm z-10">
                              <ul className="list-none p-0 m-0">
                                {passengerEmails.map((email, index) => (
                                  <li key={index} className="p-0 m-0">
                                    {email}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="relative w-fit">
                        {approvers.length > 0 && (
                          <div className="text-xs text-[#171A19] font-semibold">
                            Approver:{" "}
                            <span className="font-normal">
                              {visibleApprovers.join(", ")}
                            </span>
                            {remainingApprovers.length > 0 && (
                              <span
                                className="text-[#000000] font-normal cursor-pointer ml-1 relative"
                                onMouseEnter={() => setShowApprovers(true)}
                                onMouseLeave={() => setShowApprovers(false)}
                              >
                                <span className="text-[#155EEF] ">
                                  {" "}
                                  +{remainingApprovers.length} approvers
                                </span>
                                {showApprovers && (
                                  <div className="absolute top-full left-0 mt-1 p-2 bg-white border rounded shadow-lg text-sm z-10">
                                    <ul className="list-none p-0 m-0">
                                      {remainingApprovers.map(
                                        (email, index) => (
                                          <li key={index} className="p-0 m-0">
                                            {email}
                                          </li>
                                        )
                                      )}
                                    </ul>
                                  </div>
                                )}
                              </span>
                            )}
                          </div>
                        )}
                      </div>

                      <div className="text-[#000000] text-xs sm:text-sm mt-1">
                        <span className="font-semibold">Requested on : </span>
                        {formatDate1(requestedDate)}
                      </div>
                      {/* Transport booking status */}
                      {isTransport && (
                        <div className="text-[#000000] text-xs sm:text-sm mt-1">
                          <span className="font-semibold">
                            Booking Status :{" "}
                          </span>
                          <span
                            className={`capitalize ${
                              bookingStatus === "quoted"
                                ? "text-green-600"
                                : bookingStatus === "pending"
                                ? "text-yellow-600"
                                : "text-gray-600"
                            }`}
                          >
                            {bookingStatus}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex justify-between items-center  sm:flex-col gap-1">
                  <div className="text-xxs  sm:text:base text-[#000000] font-semibold">
                    Booking ID : {trip?.bookingId}
                  </div>
                  <div
                    className={`${
                      requestType !== 1
                        ? "flex flex-col justify-between mt-3"
                        : ""
                    }`}
                  >
                    {!(
                      requestType === 1 ||
                      (requestType === 2 && status === "Approved")
                    ) && (
                      <div className="text-[#1C1C1C] flex sm:flex-row items-center flex-col text-sm sm:text-base font-normal">
                        Total Trip Cost:{" "}
                        <span className="font-semibold">
                          Rs {formatPrice(totalCost)}
                        </span>
                      </div>
                    )}
                    {renderButtons()}
                  </div>
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
              travelCategory={trip?.travelCategory}
              bookingId={trip?.bookingId}
              companyId={trip?.companyId}
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
              onSubmit={handleCancelRequest}
              buttonConfig={{
                submit: "Cancel Request",
              }}
              loading={loading}
              cancelPopup={true}
            />
          )}
          {isConfirmationModalOpen && (
            <Modal
              title={
                <div className="text-sm sm:text-base">
                  {confirmationType === "approve"
                    ? "Approve Travel Request?"
                    : "Reject Travel Request?"}
                </div>
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
                      confirmationType === "approve"
                        ? handleApprove
                        : handleReject
                    }
                    disabled={loading}
                  >
                    {loading ? (
                      <FontAwesomeIcon
                        icon={faSpinner}
                        spin
                        className="text-white"
                      />
                    ) : confirmationType === "approve" ? (
                      "Approve"
                    ) : (
                      "Reject"
                    )}
                  </button>
                </>
              }
            >
              <p className="text-xs sm:text-sm">
                {confirmationType === "approve"
                  ? "Are you sure you want to approve this travel request? This action cannot be undone."
                  : "Are you sure you want to reject this travel request? This action cannot be undone."}
              </p>
            </Modal>
          )}
        </div>
      )}
    </>
  );
};

const Trips = () => {
  const router = useRouter();
  const { walletBalance } = useWalletBalance();

  const { requestType } = router.query;
  const { addEventListener } = useGlobalEvent("LANDING_PAGE_VIEW_URL");
  const { userType, isApprover, isAdminApprover } = useUserPermissions();
  const dispatch = useDispatch();
  const needsRefresh = useSelector((state) => state.approvals.needsRefresh);
  const approvalCount = useSelector((state) => state?.approvals?.count);
  // State for infinite scroll
  const [activeTab, setActiveTab] = useState(null);
  const [tripsData, setTripsData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [pageNumber, setPageNumber] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [paginationLoading, setPaginationLoading] = useState(false);
  const [showScrollTopButton, setShowScrollTopButton] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [travelCategory, setTravelCategory] = useState(null);
  const [selectedOption, setSelectedOption] = useState("All");
  const [isTravelOpen, setIsTravelOpen] = useState(false);
  const [isStatusOpen, setIsStatusOpen] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState("All");
  // const [approvalCount, setApprovalCount] = useState(0);
  const PAGE_SIZE = 10;

  const statusRef = useRef(null);
  const travelRef = useRef(null);

  const toggleDropdown = () => setIsTravelOpen(!isTravelOpen);

  const toggleStatusDropdown = () => {
    setIsStatusOpen((prev) => !prev);
  };

  const handleStatusSelect = (status) => {
    setSelectedStatus(status);
    setIsStatusOpen(false); // Close the dropdown after selection
    setPageNumber(1);
  };

  const handleOptionSelect = (option) => {
    setSelectedOption(option);
    const categoryMap = {
      Flight: 2,
      Hotel: 1,
      Train: 3,
      Bus: 4,
      "Cab/Taxi": 5,
    };
    setTravelCategory(categoryMap[option] || null);
    setIsTravelOpen(false);
    setPageNumber(1);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (statusRef.current && !statusRef.current.contains(event.target)) {
        setIsStatusOpen(false);
      }
      if (travelRef.current && !travelRef.current.contains(event.target)) {
        setIsTravelOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchQuery(value);
  };

  const handleClearSearch = () => {
    setSearchQuery("");
  };

  // Refs for infinite scroll
  const observer = useRef();
  const lastTripElementRef = useCallback(
    (node) => {
      if (loading) return;

      if (observer.current) {
        observer.current.disconnect();
      }

      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMore) {
          setPageNumber((prevPage) => prevPage + 1);
        }
      });

      if (node) {
        observer.current.observe(node);
      }
    },
    [loading, hasMore]
  );

  // Function to handle scrolling to the top
  const handleScrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  // Listen to scroll events
  useEffect(() => {
    const handleScroll = () => {
      // Show the button after scrolling down 400px
      if (window.scrollY > 400) {
        setShowScrollTopButton(true);
      } else {
        setShowScrollTopButton(false);
      }
    };

    // Add scroll event listener
    window.addEventListener("scroll", handleScroll);

    // Cleanup function
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  useEffect(() => {
    if (needsRefresh) {
      fetchTrips(true); // Re-fetch data
      dispatch(setNeedsRefresh(false)); // Reset needsRefresh
    }
  }, [needsRefresh]);

  const tabData = useMemo(
    () => [
      {
        id: 1,
        requestType: 1,
        title: "Booking Requests",
        subtitle: "Requested by All to Book",
      },
      {
        id: 2,
        requestType: 2,
        title: "Your Travel Requests",
        subtitle: "You have requested for approval",
      },
      {
        id: 3,
        requestType: 3,
        title: "For you to Approve",
        subtitle: "Travel requests require your approval",
      },
    ],
    []
  );

  const getFilteredTabs = () => {
    if (userType) {
      if (userType === 1 && isAdminApprover) {
        return tabData;
      } else if (userType === 1) {
        return tabData.filter((tab) => tab.id === 1 || tab.id === 2);
      } else if (userType === 2 && isApprover) {
        return tabData.filter((tab) => tab.id === 2 || tab.id === 3);
      } else if (userType === 2) {
        return tabData.filter((tab) => tab.id === 2);
      }
    }
    return [];
  };

  useEffect(() => {
    const filteredTabs = getFilteredTabs();
    const validRequestTypes = filteredTabs.map((tab) => tab.requestType);
    if (requestType && validRequestTypes.includes(Number(requestType))) {
      setActiveTab(Number(requestType));
    } else {
      if (filteredTabs.length > 0 && activeTab === null) {
        const initialRequestType = filteredTabs[0].requestType;
        setActiveTab(initialRequestType);
      }
    }
    if (requestType) {
      router.replace(
        {
          pathname: "/corporate/auth/booking/approval",
        },
        undefined,
        { shallow: true } // Prevent full page reload
      );
    }
  }, [requestType, userType, isApprover, tabData]);

  const fetchTrips = async (isInitialFetch = false) => {
    if (activeTab === null) return;

    if (isInitialFetch) {
      setLoading(true);
      setPageNumber(1);
      setTripsData([]);
    } else {
      setPaginationLoading(true);
    }

    try {
      const userId = getTabSpecificData("userID");
      const params = {
        // userId,
        requestType: activeTab,
        pageNo: pageNumber,
        pageSize: PAGE_SIZE,
        sortBy: "desc",
      };
      if (searchQuery.trim()) {
        params.searchQuery = searchQuery.trim();
      }
      if (travelCategory) {
        params.travelCategory = travelCategory;
      }
      if (selectedStatus !== "All") {
        params.approvalStatus = selectedStatus;
      }

      const response = await axios.get(
        `${config.CORPORATE.GET_ALL_APPROVALS_LIST}`,
        { params }
      );

      const newTrips = response?.data?.data?.data?.response || [];
      const totalItems = response?.data?.data?.data?.count || 0;
      // const approvalCount = response?.data?.data?.approvalCount || 0;
      // setApprovalCount(approvalCount);

      setTotalCount(totalItems);
      setTripsData((prev) =>
        isInitialFetch ? newTrips : [...prev, ...newTrips]
      );
      setHasMore(
        newTrips.length === PAGE_SIZE && pageNumber * PAGE_SIZE < totalItems
      );
    } catch (error) {
      console.error("Error fetching trips:", error);
      if (isInitialFetch) {
        setTripsData([]);
      }
      // setApprovalCount(0);
    } finally {
      setLoading(false);
      setPaginationLoading(false);
    }
  };

  // Handle initial fetch and tab changes
  useEffect(() => {
    fetchTrips(true);
  }, [activeTab, refreshTrigger]);

  // Handle pagination
  useEffect(() => {
    if (pageNumber > 1) {
      fetchTrips(false);
    }
  }, [pageNumber]);

  // Debounce search functionality
  useEffect(() => {
    const handler = setTimeout(() => {
      setPageNumber(1);
      fetchTrips(true);
    }, 500);

    return () => {
      clearTimeout(handler);
    };
  }, [searchQuery]);

  useEffect(() => {
    setPageNumber(1);
    fetchTrips(true);
  }, [travelCategory, selectedStatus]);

  const handleTripUpdated = () => {
    setRefreshTrigger((prev) => prev + 1);
  };

  const handleTabChange = (newTab) => {
    setActiveTab(newTab);
    setPageNumber(1);
    setHasMore(true);
  };

  return (
    <ProtectedRoute>
      <Head>
        <title>Approvals</title>
      </Head>
      <div className="border-b">
        <Header userType={userType} />
      </div>
      {/* Scroll-to-Top Button */}
      {showScrollTopButton && (
        <button
          onClick={handleScrollToTop}
          className="fixed bottom-8 right-8 z-50 bg-gradient-to-r from-[#155EEF] to-[#00b4d8] text-white p-3 rounded-full shadow-md hover:shadow-lg transition duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#155EEF]"
          aria-label="Scroll to top"
        >
          <FontAwesomeIcon icon={faArrowUp} size="2x" />
        </button>
      )}
      {getFilteredTabs().length == 0 ? (
        <NoDataMessage message="No approval data available" />
      ) : (
        <div className={`bg-[#E5E9EB] pt-8 ${style.companyMob}`}>
          <div className="bg-white rounded-lg mt-2 pb-2">
            <div className="flex justify-between  sm:!flex-col">
              <div className="p-3 sm:p-4 text-[#030F0C] text-xl font-semibold">
                Trips
              </div>
              <div className="px-3 py-1 sm:px-3">
                <div className="relative w-fit">
                  <button className=" absolute top-4 left-2 h-5 w-5 text-gray-600 rounded-lg hover:text-[#155EEF] transition-colors duration-300 transform hover:scale-110">
                    <FontAwesomeIcon
                      icon={faMagnifyingGlass}
                      className="text-[#878786]"
                    />
                  </button>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={handleSearchChange}
                    className="h-12 sm:h-14 w-[200px] sm:w-64 font-normal text-xxs sm:text-xs text-[#000000] pl-12 pr-5 rounded-lg shadow-[0px_4px_4px_0px_rgba(22,156,176,0.14)] focus:shadow-xl focus:outline-none transition-shadow duration-300 ease-in-out cursor-pointer"
                    placeholder="Search by Name or Email Id"
                  />
                  {searchQuery && (
                    <button
                      className="absolute top-4 right-2 h-5 w-5 text-gray-600 rounded-lg hover:text-[#155EEF] transition-colors duration-300 transform hover:scale-110"
                      onClick={handleClearSearch}
                    >
                      <FontAwesomeIcon
                        icon={faTimes}
                        className="text-[#878786]"
                      />
                    </button>
                  )}
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row mt-3 items-center justify-between ml-2 mr-2  sm:mx-4  space-x-4 border-b border-[#d5d5d5] dark:border-gray-400">
              <div className="flex">
                {getFilteredTabs().map((tab) => (
                  <button
                    key={tab.id}
                    className={`${
                      activeTab === tab.requestType
                        ? "border-b-2 border-[#155EEF] text-[#155EEF]"
                        : "border-transparent text-gray-500 hover:border-[#155EEF] hover:text-[#155EEF] font-normal"
                    }  ${style.compInner}   text-medium`}
                    onClick={() => handleTabChange(tab.requestType)}
                  >
                    <div className="relative flex items-start">
                      <div className="flex flex-col">
                        <span className="text-xs font-semibold sm:text-lg sm:font-medium">
                          {tab.title}
                        </span>
                        <span className="text-xxs font-medium sm:text-xs sm:font-base">
                          {tab.subtitle}
                        </span>
                      </div>

                      {tab.id === 3 && approvalCount > 0 && (
                        <span className="-ml-3 -mt-3 sm:-mt-1 sm:-ml-7 bg-red-600 text-white text-xxs font-semibold px-1 rounded-full">
                          +{approvalCount}
                        </span>
                      )}
                    </div>
                  </button>
                ))}
              </div>
              <div className="flex space-x-4 mt-4 sm:mt-0 mb-1 justify-end ">
                {(activeTab === 1 || activeTab === 2) && (
                  <div className="relative w-fit sm:w-48" ref={statusRef}>
                    <div
                      className="w-fit sm:w-48 h-fit sm:h-14 border-1 border-[#155EEF40] rounded-full px-4 py-2 flex items-center justify-between cursor-pointer"
                      onClick={toggleStatusDropdown}
                    >
                      <span className="text-[#878786] font-normal text-nowrap text-xs sm:text-sm">
                        <span className="font-semibold">Status: </span>
                        {selectedStatus}
                      </span>
                      <FontAwesomeIcon
                        icon={faCaretDown}
                        className="text-gray-500 ml-2"
                      />
                    </div>

                    {isStatusOpen && (
                      <div className="absolute z-50 mt-1 w-full bg-white border border-[#155EEF40] rounded-lg shadow-lg">
                        {[
                          "All",
                          "Approved",
                          "Declined",
                          "Cancelled",
                          "Pending",
                        ].map((status) => (
                          <div
                            key={status}
                            className={`px-4 py-2 cursor-pointer ${
                              selectedStatus === status
                                ? "text-[#155EEF] font-bold"
                                : "text-gray-500"
                            }`}
                            onClick={() => handleStatusSelect(status)}
                          >
                            {status}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                <div className="relative w-fit sm:w-48" ref={travelRef}>
                  <div
                    className="w-fit sm:w-48 h-fit sm:h-14 border-1 border-[#155EEF40] rounded-full px-4 py-2 flex items-center justify-between cursor-pointer"
                    onClick={toggleDropdown}
                  >
                    <span className="text-[#878786] font-normal text-nowrap text-xs sm:text-sm">
                      <span className="font-semibold">Travel type:</span>{" "}
                      {selectedOption}
                    </span>
                    <FontAwesomeIcon
                      icon={faCaretDown}
                      className="text-gray-500 ml-2"
                    />
                  </div>

                  {isTravelOpen && (
                    <div className="absolute z-50 mt-1 w-full bg-white border border-[#155EEF40] rounded-lg shadow-lg">
                      {[
                        "All",
                        "Flight",
                        "Hotel",
                        "Train",
                        "Bus",
                        "Cab/Taxi",
                      ].map((option) => (
                        <div
                          key={option}
                          className={`px-4 py-2 cursor-pointer ${
                            selectedOption === option
                              ? "text-[#155EEF] font-bold"
                              : "text-gray-500"
                          }`}
                          onClick={() => handleOptionSelect(option)}
                        >
                          {option}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
            <div className={`${style.companyMob} pt-7 mt-2`}>
              {loading && pageNumber === 1 ? (
                <div className="flex justify-center items-center h-32">
                  <FontAwesomeIcon
                    icon={faSpinner}
                    spin
                    size="2x"
                    color="#155EEF"
                  />
                </div>
              ) : tripsData.length > 0 ? (
                <div className={`flex flex-col gap-3 ${style.companyMob}`}>
                  {tripsData.map((trip, index) => {
                    if (tripsData.length === index + 1) {
                      return (
                        <div key={trip._id} ref={lastTripElementRef}>
                          <TripCard
                            trip={trip}
                            requestType={activeTab}
                            onTripUpdated={handleTripUpdated}
                            walletBalance={walletBalance}
                            userType={userType}
                          />
                        </div>
                      );
                    } else {
                      return (
                        <TripCard
                          key={trip._id}
                          trip={trip}
                          requestType={activeTab}
                          onTripUpdated={handleTripUpdated}
                          walletBalance={walletBalance}
                          userType={userType}
                        />
                      );
                    }
                  })}
                  {paginationLoading && hasMore && (
                    <div className="flex justify-center py-4">
                      <FontAwesomeIcon icon={faSpinner} spin />
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center text-gray-500">
                  <span className=" text-xl sm:text-3xl">No Trips Found!</span>
                  <NoTrips />
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      <div>
        <Footer2 />
      </div>
    </ProtectedRoute>
  );
};

export default Trips;
