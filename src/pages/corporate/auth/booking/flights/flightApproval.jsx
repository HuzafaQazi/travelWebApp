import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/router";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Header from "@/components/corporate/auth/Header";
import TicketReview from "@/components/corporate/common/ticketReview";
import FareSummary from "@/components/corporate/common/fareSummary";
import ApproverDetails from "@/components/corporate/approvalRequest/ApproverDetails";
import TravelerDetails from "@/components/corporate/common/travelerDetails";
import GSTDetails from "@/components/corporate/details/GSTDetails";
import RequestModal from "@/components/corporate/approvalRequest/request";
import config from "@/config";
import axios, { getTabSpecificData } from "@/utils/axios/axios";
import Head from "next/head";
import Footer2 from "@/components/corporate/footerCorporate/footerCorporate";
import {
  faClock,
  faExclamationCircle,
  faInfoCircle,
  faSpinner,
} from "@fortawesome/free-solid-svg-icons";
import showToast from "@/utils/toast";

import { routeToPg } from "@/paymentGateways/pgRouting";
import UseWalletBalanceButton from "@/components/wallet/walletButton/useWalletButton";
import TravelReqestStatus from "@/components/corporate/common/TravelRequestStatus";
import { useWalletBalance } from "@/hooks/useWalletBalance";
import { getPaymentGateway, getPaymentSessionID } from "@/utils/bookingAPI";
import { formatPrice } from "@/utils/common";
import { confirmPaymentFlights } from "@/utils/walletApis";
import FlightApprovalSkeleton from "@/components/corporate/Loaders/Flight/FlightApprovalSkeleton";
import { useSelector, useDispatch } from "react-redux";
import { setApprovalStatusNeedsRefresh } from "@/store/slices/approvalSlice";
import { useUserPermissions } from "@/hooks/useUserPermissions";
import ProtectedRoute from "@/components/corporate/protectedRoute/ProtectedRoute";
import { selectCorporateCompanyId } from "@/store/selectors/corporateSelectors";

export default function FlightApproval() {
  const router = useRouter();
  const dispatch = useDispatch();
  const {  bookingId } = router.query;
  const [approvalData, setApprovalData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isBookingLoading, setIsBookingLoading] = useState(false);
  const [ssrFare, setSsrFare] = useState(0);
  const [totalAmount, setTotalAmount] = useState(0);
  const [journeyTypeName, setJourneyTypeName] = useState(null);
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [fareDetails, setFareDetails] = useState([]);
  const [bookingPaymentRefs, setBookingPaymentRef] = useState([]);
  const [adults, setAdults] = useState();
  const [fareQuoteSegments, setFareQuoteSegments] = useState();
  const [walletSelected, setWalletSelected] = useState(false);
  const { walletBalance } = useWalletBalance();
  const { userType } = useUserPermissions();

  const needsRefresh = useSelector(
    (state) => state.approvals.approvalStatusNeedsRefresh[2]
  );

   const companyId = useSelector(selectCorporateCompanyId);

  const userDetails = useSelector((state) => state?.user?.userInfo);

  const isWalletAllowed =
    userDetails?.loggedInDetails?.configuration?.walletAllowed;

  useEffect(() => {
    const handleBodyScroll = () => {
      document.body.style.overflow = isCancelModalOpen ? "hidden" : "auto";
    };

    handleBodyScroll();
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [isCancelModalOpen]);

  const fetchData = useCallback(async () => {
    if (bookingId) {
      try {
        setIsLoading(true);
        setErrorMessage("");
        // Fetch approval data
        const approvalResponse = await axios.get(
          `${config.CORPORATE.GET_APPROVAL_STATUS}?bookingId=${bookingId}`
        );

        if (approvalResponse?.data?.status === "SUCCESS") {
          const fetchedApprovalData = approvalResponse?.data?.data;
          // Transform approvalDetails
          const transformedApprovalDetails =
            fetchedApprovalData.approvalDetails.map((approvalDetail) => {
              return {
                value: approvalDetail.employeeUserId, // Employee User ID
                label: approvalDetail.employeeEmail, // Label is employee's email
                data: {
                  _id: approvalDetail.employeeUserId,
                  firstName: approvalDetail.employeeName,
                  workEmail: approvalDetail.employeeEmail, // Use employee email
                  approverUserDetails: approvalDetail?.approvers?.map(
                    (approver, i) => ({
                      _id: approver.approverId || i,
                      title: approver.title || "",
                      firstName: approver.firstName || "Unknown",
                      lastName: approver.lastName || "",
                      workEmail: approver.email,
                      approvalStatus: approver.approvalStatus || "Pending", // Approver's status
                    })
                  ),
                },
              };
            });

          // Extract passenger details from FlightDetails
          const travelers = [];
          let fare = [];
          let segments = [];
          let refs = [];
          fetchedApprovalData?.bookingdetails.map((booking) => {
            setJourneyTypeName(booking.data.flightItinerary.journeyTypeName);
            fare.push(booking.data.flightItinerary.fare);
            segments.push(booking.data.flightItinerary);
            refs.push(booking.data.bookingPaymentRefId);
          });
          setFareDetails(fare);
          setFareQuoteSegments(segments);
          setAdults(1);
          setBookingPaymentRef(refs);
          setApprovalData({
            ...fetchedApprovalData,
            transformedApprovalDetails,
            travelers,
          });
        }

        setIsLoading(false);
      } catch (err) {
        console.log(err);
        setErrorMessage(
          "Something went wrong while fetching approval data. Please try again later."
        );
        setIsLoading(false);
      }
    }
  }, [bookingId]);

  // Fetch data when companyId or bookingId changes

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    if (needsRefresh) {
      fetchData();
      dispatch(
        setApprovalStatusNeedsRefresh({ travelCategory: 2, status: false })
      );
    }
  }, [needsRefresh, dispatch, fetchData]);

  useEffect(() => {
    const handleBackButton = () => {
      router.push("/corporate/auth/booking"); // Redirect instead of going back
    };

    window.addEventListener("popstate", handleBackButton);

    return () => {
      window.removeEventListener("popstate", handleBackButton);
    };
  }, []);

  const initiatePayment = async () => {
    setIsBookingLoading(true);
    let bookingPaymentRef;
    if (bookingPaymentRefs) {
      bookingPaymentRef = {
        bookingPaymentRefIds: bookingPaymentRefs,
        isWeb: true,
      };
    }
    const mobileNumber = getTabSpecificData("phoneNumber");
    const pgRes = await getPaymentGateway();

    if (pgRes.status === "SUCCESS") {
      let payable = calculateTotalPayable();
      if (payable > 0) {
        const redirectUrl = null;
        // const walletAmount = parseFloat(totalAmount - payable);
        const walletAmount = Math.max(0, parseFloat(totalAmount - payable));
        const charges = 0;
        const paymentCategory = "BOOKING";
        const amount = parseFloat(payable);
        const pgCode = pgRes.data.pgCode;
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
            pgRes.data.pgCode,
            getPaymentSessionIDResp.data.data.paymentSessionId,
            queryParams,
            bookingId,
            2,
            "BOOKING",
            "",
            companyId
          );
        }
      } else {
        let confirmReq = {
          bookingId: bookingId,
          paymentRefernceId: companyId,
          paymentStatus: "SUCCESS",
          paymentAmount: payable,
          pgCode: pgRes.data.pgCode,
          bookingPaymentRefIds: [],
          walletAmount: totalAmount - payable,
        };
        const resp = await confirmPaymentFlights(confirmReq);
        // if (resp) {
        router.push({
          pathname: "/corporate/auth/booking/flights/flightConfirm",
          query: { booking_id: bookingId },
        });
        // }
      }
    }
    setIsBookingLoading(false);
  };

  const handleManualCancellation = (data) => {
    handleCancelApproval({
      // companyId,
      bookingId,
      reason: data.reason,
      description: data.description,
      toastMessage: {
        type: "success",
        message: "Approval Request cancelled successfully",
      },
    });
  };
  const handleCancelApproval = async (cancelData) => {
    const { companyId, bookingId, reason, description, toastMessage } =
      cancelData;
    try {
      let url = `${config.CORPORATE.CANCEL_APPROVAL}?bookingId=${bookingId}`;

      if (reason) {
        url += `&reason=${encodeURIComponent(reason)}`;
      }
      if (description) {
        url += `&description=${encodeURIComponent(description)}`;
      }
      const response = await axios.post(url);
      if (response?.data?.status === "SUCCESS") {
        showToast(toastMessage.type, toastMessage.message);
        // Optionally, update the local state or refetch data
        setApprovalData((prevData) => ({
          ...prevData,
          approvalStatus: "Cancelled",
          cancelledDate: response?.data?.data?.cancelledDate,
        }));
        setIsCancelModalOpen(false);
      }
    } catch (error) {
      console.log(error);
      showToast(
        "error",
        error?.response?.data?.message || "Something went wrong"
      );
    }
  };
  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0"); // Months are zero-indexed
    const year = date.getFullYear();

    let hours = date.getHours();
    const minutes = String(date.getMinutes()).padStart(2, "0");
    const ampm = hours >= 12 ? "PM" : "AM";
    hours = hours % 12 || 12; // Convert to 12-hour format and handle midnight (0 becomes 12)

    // Format the date and time

    return `${day}-${month}-${year} ${hours}:${minutes} ${ampm}`;
  };

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
      timeZone: "Asia/Kolkata", // Ensure UTC time zone
    });

    // Format the time in 12-hour format
    const formattedTime = date.toLocaleTimeString("en-GB", {
      hour: "numeric", // Numeric hour
      minute: "2-digit", // Two-digit minutes
      hour12: true, // 12-hour format
      timeZone: "Asia/Kolkata", // Ensure UTC time zone
    });

    // Combine date and time
    return `${formattedDate} at ${formattedTime}`;
  };

  const renderActionButton = () => {
    return (
      <button
        className="w-fit min-w-32 px-4 mt-5 flex flex-col items-center bg-[#028fa3] p-2 rounded-full text-white peer-checked:pointer-events-auto"
        type="button"
        onClick={initiatePayment}
        disabled={isBookingLoading}
      >
        <div className="">
          {isBookingLoading ? (
            <FontAwesomeIcon icon={faSpinner} spin />
          ) : (
            <span>
              {calculateTotalPayable() === 0
                ? "Proceed to book"
                : `Proceed to pay | Rs. ${formatPrice(
                    calculateTotalPayable()
                  )}`}
            </span>
          )}
        </div>
      </button>
    );
  };
  const openCancelModal = () => {
    setIsCancelModalOpen(true);
  };

  const calculateTotalPayable = () => {
    let totalFare = totalAmount;
    if (walletSelected && walletBalance) {
      if (walletBalance > totalFare) {
        return 0;
      } else {
        return totalFare - walletBalance;
      }
    }
    return totalFare;
  };

  const checkwallet = async () => {
    setWalletSelected(!walletSelected);
    if (walletSelected) {
      calculateTotalPayable();
    }
  };

  const goToWalletDetails = async () => {
    router.push({
      pathname: "/walletDetails",
      query: {
        fromPage:
          typeof window !== "undefined"
            ? window.location.pathname + window.location.search
            : "/walletDetails",
      },
    });
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "confirmed":
      case "success":
        return "text-green-600";
      case "pending":
        return "text-yellow-600";
      case "cancelled":
      case "failed":
        return "text-red-600";
      default:
        return "text-gray-600";
    }
  };

  const cabinClassName =
    fareQuoteSegments?.[0]?.segments?.[0]?.segment?.[0]?.cabinClassName;

  return (
    <ProtectedRoute>
      <Head>
        <title>Approval Status</title>
      </Head>
      {/* complete page */}

      <div className="border-b">
        <Header />
      </div>
      {isLoading ? (
        <FlightApprovalSkeleton />
      ) : errorMessage || !approvalData ? (
        <div className="flex items-center justify-center h-screen bg-gray-100">
          <div className="text-center p-8 bg-white rounded-lg shadow-md max-w-md w-full">
            {errorMessage ? (
              <>
                <div className="text-red-500 text-5xl mb-4">
                  <FontAwesomeIcon icon={faExclamationCircle} />
                </div>
                <h2 className="text-2xl font-bold text-red-600 mb-2">Error</h2>
                <p className="text-gray-600">{errorMessage}</p>
              </>
            ) : (
              <>
                <div className="text-blue-500 text-5xl mb-4">
                  <FontAwesomeIcon icon={faInfoCircle} />
                </div>
                <h2 className="text-2xl font-bold text-blue-600 mb-2">
                  No Data
                </h2>
                <p className="text-gray-600">No approval data available</p>
              </>
            )}
          </div>
        </div>
      ) : (
        <>
          {/* conditional approval status */}
          <div className="bg-[#E5E9EB] p-4 pt-8 pb-52 2xl:mx-[12%]">
            <div className="flex gap-4 mt-2">
              <div className="w-full sm:w-3/4">
                <div className="flex gap-2">
                  <TravelReqestStatus
                    approvalStatus={approvalData?.approvalStatus}
                    paymentStatus={approvalData?.paymentStatus
                      ?.toLowerCase()
                      ?.trim()}
                  />
                  <div className="block sm:hidden">
                    {approvalData?.approvalStatus !== "Cancelled" &&
                      approvalData?.approvalStatus !== "Declined" &&
                      approvalData?.paymentStatus !== "SUCCESS" &&
                      userDetails?.userId === approvalData?.userId && (
                        <div className="w-full">
                          <button
                            className="bg-[#028fa3] w-full text-white text-xxs sm:text-sm py-1 p-3 rounded-lg"
                            onClick={openCancelModal}
                          >
                            Cancel Request
                          </button>
                        </div>
                      )}
                    {approvalData?.approvalStatus === "Declined" && (
                      <div className="w-full">
                        <button
                          className="bg-[#028fa3] w-full text-white text-sm p-3 mt-5 rounded-lg"
                          onClick={() => router.push("/")}
                        >
                          Go to Homepage
                        </button>
                      </div>
                    )}
                  </div>
                </div>
                {/* waiting time for approval */}
                <div className="bg-white p-4 rounded-lg mt-2 font-medium text-xxs sm:text-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-4">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                    <div className="flex items-center">
                      <FontAwesomeIcon icon={faClock} color="#7E0ED6" />
                      <span className="ml-2">Your travel is</span>
                    </div>

                    <div className="flex items-center">
                      <span className="text-gray-600">Requested on:</span>
                      <span className="ml-1 font-semibold">
                        {formatDate(
                          approvalData?.bookingdetails?.[0]?.data?.createdDate
                        )}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <span className="text-gray-600">Booking Status:</span>
                    <span
                      className={`ml-1 font-semibold ${getStatusColor(
                        approvalData?.bookingdetails?.[0]?.data?.bookingStatus
                      )}`}
                    >
                      {approvalData?.bookingdetails?.[0]?.data?.bookingStatus ||
                        "Pending"}
                    </span>
                  </div>
                </div>
                {/* approver details */}
                <ApproverDetails
                  parentClassName="bg-white p-4 mt-3 rounded-lg"
                  travellers={approvalData.transformedApprovalDetails}
                  approvalStatus={approvalData.approvalStatus}
                  travelReason={approvalData.reasonForTravel}
                  cancelledOn={formatDate1(approvalData?.updatedAt)}
                />

                {/* flight details section */}
                <div className="bg-white rounded-md w-full h-fit p-4 mt-2">
                  <div className="font-medium">Flight information</div>
                  <TicketReview
                    flightDetails={fareQuoteSegments}
                    journeyTypeName={journeyTypeName}
                  />
                </div>

                {/* traveler details form section */}
                <div className="bg-white rounded-md w-full h-fit p-4 mt-2 flex flex-col gap-2">
                  <TravelerDetails
                    bookingDetails={approvalData?.bookingdetails}
                    cabinClassName={cabinClassName}
                  />
                </div>

                {/* GST details */}
                <div className="border-[1px] border-[#028FA32E] shadow-[6px_6px_30px_0px_#7D99B40D] rounded-md mt-2 p-3 bg-white">
                  <GSTDetails
                    companyName={approvalData?.companyDetails?.companyName}
                    gstNumber={approvalData?.companyDetails?.gst}
                    companyEmail={approvalData?.companyDetails?.gstEmail}
                    companyMobile={
                      approvalData?.companyDetails?.gstMobileNumber
                    }
                    companyAddress={approvalData?.companyDetails?.address}
                  />
                </div>
                {approvalData?.approvalStatus === "Approved" &&
                  approvalData?.paymentStatus !== "SUCCESS" &&
                  (isWalletAllowed || userType === 1) && (
                    <UseWalletBalanceButton
                      walletBalance={walletBalance}
                      checkwallet={checkwallet}
                      goToWalletDetails={goToWalletDetails}
                    />
                  )}

                <div className="block sm:hidden">
                  {fareDetails.length > 0 && (
                    <div className="w-full mt-2 bg-white p-3 h-fit rounded-md">
                      <FareSummary
                        fareDetails={fareDetails}
                        adults={adults}
                        setSsrFare={setSsrFare}
                        setTotalAmount={setTotalAmount}
                      />
                    </div>
                  )}
                </div>

                {approvalData?.approvalStatus === "Approved" &&
                  approvalData?.paymentStatus !== "SUCCESS" &&
                  (isWalletAllowed || userType === 1) &&
                  renderActionButton()}

                {isRequestModalOpen && (
                  <RequestModal
                    isOpen={isRequestModalOpen}
                    onClose={() => setIsRequestModalOpen(false)}
                    title="Send Approval"
                    subtitle="You will get notification to continue booking once the request gets approved."
                    showApproverDetails={true}
                    showReasonInput={true}
                    travellers={approvalData.transformedApprovalDetails}
                    buttonConfig={{
                      cancel: "Close",
                      submit: "Send Approval Request",
                    }}
                  />
                )}

                {isCancelModalOpen && (
                  <RequestModal
                    isOpen={isCancelModalOpen}
                    onClose={() => setIsCancelModalOpen(false)}
                    title="Are you sure you want to cancel your Travel Request ?"
                    subtitle="If you cancel your request, Your approver will be notified about the cancellation."
                    showApproverDetails={false}
                    showReasonInput={true}
                    onSubmit={handleManualCancellation}
                    buttonConfig={{
                      submit: "Cancel Request",
                    }}
                    cancelPopup={isCancelModalOpen}
                  />
                )}
              </div>
              <div className="w-2/6 hidden sm:block">
                <div className="hidden sm:block">
                  {approvalData?.approvalStatus !== "Cancelled" &&
                    approvalData?.approvalStatus !== "Declined" &&
                    approvalData?.paymentStatus !== "SUCCESS" &&
                    userDetails?.userId === approvalData?.userId && (
                      <div className="w-full">
                        <button
                          className="bg-[#028fa3] w-full text-white text-sm p-3 mt-5 rounded-lg"
                          onClick={openCancelModal}
                        >
                          Cancel Request
                        </button>
                      </div>
                    )}
                  {approvalData?.approvalStatus === "Declined" && (
                    <div className="w-full">
                      <button
                        className="bg-[#028fa3] w-full text-white text-sm p-3 mt-5 rounded-lg"
                        onClick={() => router.push("/")}
                      >
                        Go to Homepage
                      </button>
                    </div>
                  )}
                </div>
                {fareDetails.length > 0 && (
                  <div className="w-full mt-4 bg-white p-3 h-fit rounded-md">
                    <FareSummary
                      fareDetails={fareDetails}
                      adults={adults}
                      setSsrFare={setSsrFare}
                      setTotalAmount={setTotalAmount}
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        </>
      )}
      <Footer2 />
    </ProtectedRoute>
  );
}
