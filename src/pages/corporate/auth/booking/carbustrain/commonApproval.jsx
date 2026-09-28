import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/router";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Header from "@/components/corporate/auth/Header";
import ApproverDetails from "@/components/corporate/approvalRequest/ApproverDetails";
import TravelerDetails from "@/components/corporate/common/travelerDetails";
import GSTDetails from "@/components/corporate/details/GSTDetails";
import RequestModal from "@/components/corporate/approvalRequest/request";
import config from "@/config";
import axios from "@/utils/axios/axios";
import Head from "next/head";
import Footer2 from "@/components/corporate/footerCorporate/footerCorporate";
import {
  faCar,
  faClock,
  faExclamationCircle,
  faInfoCircle,
  faMapMarkedAlt,
  faMoneyBillWave,
  faSpinner,
} from "@fortawesome/free-solid-svg-icons";
import showToast from "@/utils/toast";
import TravelReqestStatus from "@/components/corporate/common/TravelRequestStatus";
import { useWalletBalance } from "@/hooks/useWalletBalance";
import { formatPrice } from "@/utils/common";
import { useSelector, useDispatch } from "react-redux";
import { setApprovalStatusNeedsRefresh } from "@/store/slices/approvalSlice";
import { useUserPermissions } from "@/hooks/useUserPermissions";
import ProtectedRoute from "@/components/corporate/protectedRoute/ProtectedRoute";
 
export default function CommonApproval() {
  const router = useRouter();
  const dispatch = useDispatch();
  const { companyId, bookingId } = router.query;
  const { walletBalance } = useWalletBalance();
  const { userType } = useUserPermissions();
  const userDetails = useSelector((state) => state?.user?.userInfo);
  const isWalletAllowed =
    userDetails?.loggedInDetails?.configuration?.walletAllowed;
  const needsRefresh = useSelector(
    (state) => state.approvals.approvalStatusNeedsRefresh[3]
  );
 
  const [approvalData, setApprovalData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isBookingLoading, setIsBookingLoading] = useState(false);
  const [totalAmount, setTotalAmount] = useState(0);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [walletSelected, setWalletSelected] = useState(false);
 
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
    if ( bookingId) {
      try {
        setIsLoading(true);
        setErrorMessage("");
        const approvalResponse = await axios.get(
          `${config.CORPORATE.GET_APPROVAL_STATUS}?bookingId=${bookingId}`
        );
 
        if (approvalResponse?.data?.status === "SUCCESS") {
          const fetchedApprovalData = approvalResponse?.data?.data;
          const transformedApprovalDetails =
            fetchedApprovalData.approvalDetails.map((approvalDetail) => ({
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
                    approvalStatus: approver.approvalStatus || "Pending",
                  })
                ),
              },
            }));
 
          const totalAmount =
            fetchedApprovalData?.transportBookingData?.booking?.totalAmount ||
            0;
          setTotalAmount(totalAmount);
 
          setApprovalData({
            ...fetchedApprovalData,
            transformedApprovalDetails,
          });
        }
        setIsLoading(false);
      } catch (err) {
        console.error(err);
        setErrorMessage(
          "Something went wrong while fetching approval data. Please try again later."
        );
        setIsLoading(false);
      }
    }
  }, [ bookingId]);
 
  useEffect(() => {
    fetchData();
  }, [fetchData]);
 
  useEffect(() => {
    if (needsRefresh) {
      fetchData();
      dispatch(
        setApprovalStatusNeedsRefresh({ travelCategory: 3, status: false })
      );
    }
  }, [needsRefresh, dispatch, fetchData]);
 
  useEffect(() => {
    const handleBackButton = () => {
      router.push("/corporate/auth/booking");
    };
    window.addEventListener("popstate", handleBackButton);
    return () => {
      window.removeEventListener("popstate", handleBackButton);
    };
  }, [router]);
 
  const handleManualCancellation = (data) => {
    handleCancelApproval({
      companyId,
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

      const payload = {
        // cancelledBy: userDetails?.userId,
      };
      if (reason) url += `&reason=${encodeURIComponent(reason)}`;
      if (description) url += `&description=${encodeURIComponent(description)}`;
      const response = await axios.post(url, payload, { timeout: 10000 });
      if (response?.data?.status === "SUCCESS") {
        showToast(toastMessage.type, toastMessage.message);
        setApprovalData((prevData) => ({
          ...prevData,
          approvalStatus: "Cancelled",
          cancelledDate: response?.data?.data?.cancelledDate,
        }));
        setIsCancelModalOpen(false);
      }
    } catch (error) {
      console.error(error);
      showToast(
        "error",
        error?.response?.data?.message || "Something went wrong"
      );
    }
  };
 
  const formatDate = (dateString) => {
    if (!dateString || isNaN(new Date(dateString).getTime())) return "N/A";
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    let hours = date.getHours();
    const minutes = String(date.getMinutes()).padStart(2, "0");
    const ampm = hours >= 12 ? "PM" : "AM";
    hours = hours % 12 || 12;
    return `${day}-${month}-${year} ${hours}:${minutes} ${ampm}`;
  };
 
  const formatDate1 = (dateString) => {
    if (!dateString || isNaN(new Date(dateString).getTime()))
      return "Invalid Date";
    const date = new Date(dateString);
    const formattedDate = date.toLocaleDateString("en-GB", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
      timeZone: "Asia/Kolkata",
    });
    const formattedTime = date.toLocaleTimeString("en-GB", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
      timeZone: "Asia/Kolkata",
    });
    return `${formattedDate} at ${formattedTime}`;
  };
 
  const getTransportType = () => {
    switch (approvalData?.travelCategory) {
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
 
  const calculateTotalPayable = () => {
    let totalFare = totalAmount;
    if (walletSelected && walletBalance) {
      return walletBalance > totalFare ? 0 : totalFare - walletBalance;
    }
    return totalFare;
  };
 
  const checkWallet = () => {
    setWalletSelected(!walletSelected);
  };
 
  const goToWalletDetails = () => {
    router.push({
      pathname: "/walletDetails",
      query: { fromPage: window.location.pathname + window.location.search },
    });
  };
 
  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "confirmed":
      case "success":
        return "text-green-600";
      case "pending":
      case "quoted":
        return "text-yellow-600";
      case "cancelled":
      case "failed":
        return "text-red-600";
      default:
        return "text-gray-600";
    }
  };
 
  console.log("data static", approvalData);
 
  const openCancelModal = () => setIsCancelModalOpen(true);
 
  // const renderTransportDetails = () => {
  //   const transportData =
  //     approvalData?.bookingdetails?.journeys?.[0] ||
  //     approvalData?.transportBookingData?.bookingDetails?.[0];
  //   const booking =
  //     approvalData?.bookingdetails?.booking ||
  //     approvalData?.transportBookingData?.booking;
 
  //   if (!transportData || !booking) {
  //     return (
  //       <div className="text-red-600 text-center">
  //         No transport information available
  //       </div>
  //     );
  //   }
 
  //   const isCab = approvalData?.travelCategory === "5";
 
  //   return (
  //     <div className="bg-white rounded-md w-full h-fit p-4 mt-2 shadow-sm">
  //       <div className="font-medium text-lg mb-2">
  //         Transport Information ({getTransportType()})
  //       </div>
  //       <div className="flex flex-col md:flex-row gap-4">
  //         {/* Left: Cab-specific details */}
  //         {isCab && (
  //           <div className="w-full md:w-1/3 border border-gray-200 rounded-md p-3">
  //             <div className="flex items-center gap-2 mb-2">
  //               <FontAwesomeIcon icon={faCar} className="text-[#155EEF]" />
  //               <span className="font-semibold">Cab Details</span>
  //             </div>
  //             <div className="text-sm">
  //               <div className="flex justify-between py-1">
  //                 <span>Cab Type:</span>
  //                 <span className="font-medium">
  //                   {transportData.cabType?.name || "Standard"}
  //                 </span>
  //               </div>
  //               <div className="flex justify-between py-1">
  //                 <span>Driver Required:</span>
  //                 <span className="font-medium">
  //                   {transportData.driverRequired ? "Yes" : "No"}
  //                 </span>
  //               </div>
  //             </div>
  //           </div>
  //         )}
  //         {/* Right: Travel details */}
  //         <div className="w-full md:w-2/3">
  //           <div className="flex flex-col gap-2 text-sm">
  //             <div className="flex items-center gap-2">
  //               <FontAwesomeIcon
  //                 icon={faMapMarkedAlt}
  //                 className="text-[#155EEF]"
  //               />
  //               <span className="font-semibold">Route</span>
  //             </div>
  //             <div className="flex justify-between">
  //               <div>
  //                 <span className="text-gray-600">From:</span>
  //                 <span className="font-medium ml-1">
  //                   {transportData.fromCity?.name || booking.origin || "N/A"}
  //                 </span>
  //               </div>
  //               <div>
  //                 <span className="text-gray-600">To:</span>
  //                 <span className="font-medium ml-1">
  //                   {transportData.toCity?.name || booking.destination || "N/A"}
  //                 </span>
  //               </div>
  //             </div>
  //             <div className="flex items-center gap-2 mt-2">
  //               <FontAwesomeIcon icon={faClock} className="text-[#155EEF]" />
  //               <span className="font-semibold">Travel Details</span>
  //             </div>
  //             <div>
  //               <span className="text-gray-600">Departure:</span>
  //               <span className="font-medium ml-1">
  //                 {formatDate(
  //                   transportData.departureDate || booking.travelDate
  //                 )}
  //               </span>
  //             </div>
  //             <div>
  //               <span className="text-gray-600">Booking Status:</span>
  //               <span
  //                 className={`font-medium ml-1 ${getStatusColor(
  //                   booking.bookingStatus
  //                 )}`}
  //               >
  //                 {booking.bookingStatus || "N/A"}
  //               </span>
  //             </div>
  //           </div>
  //         </div>
  //       </div>
  //     </div>
  //   );
  // };
 

  const renderTransportDetails = () => {
  const journeys = approvalData?.bookingdetails?.journeys || [];
  const booking =
    approvalData?.bookingdetails?.booking ||
    approvalData?.transportBookingData?.booking;

  if (!journeys.length || !booking) {
    return (
      <div className="text-red-600 text-center">
        No transport information available
      </div>
    );
  }

  const isCab = approvalData?.travelCategory === "5";

  return (
    <div className="bg-white rounded-md w-full h-fit p-4 mt-2 shadow-sm">
      <div className="font-medium text-lg mb-2">
        Transport Information ({getTransportType()})
      </div>

      {/* Booking Status - Common for all journeys */}
      {/* <div className="mb-4 p-3 bg-gray-50 rounded-md">
        <div className="flex justify-between items-center">
          <span className="text-gray-600">Booking ID:</span>
          <span className="font-medium">{booking.bookingId || "N/A"}</span>
        </div>
        <div className="flex justify-between items-center mt-2">
          <span className="text-gray-600">Overall Status:</span>
          <span
            className={`font-medium ${getStatusColor(
              booking.bookingStatus
            )}`}
          >
            {booking.bookingStatus || "N/A"}
          </span>
        </div>
      </div> */}

      {/* Journey Details - Loop through all journeys */}
      <div className="space-y-4">
        {journeys.map((journey, index) => (
          <div
            key={journey._id || index}
            className="border border-gray-200 rounded-md p-4"
          >
            {/* Journey Header */}
            <div className="flex items-center justify-between mb-3 pb-2 border-b">
              <h3 className="font-semibold text-base">
                Journey {index + 1} {journeys.length > 1 ? `of ${journeys.length}` : ''}
              </h3>
              {journey.status && (
                <span className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded">
                  {journey.status}
                </span>
              )}
            </div>

            <div className="flex flex-col md:flex-row gap-4">
              {/* Left: Cab-specific details (if applicable) */}
              {isCab && journey.cabType && (
                <div className="w-full md:w-1/3 border border-gray-200 rounded-md p-3 bg-gray-50">
                  <div className="flex items-center gap-2 mb-2">
                    <FontAwesomeIcon icon={faCar} className="text-[#155EEF]" />
                    <span className="font-semibold">Cab Details</span>
                  </div>
                  <div className="text-sm">
                    <div className="flex justify-between py-1">
                      <span>Cab Type:</span>
                      <span className="font-medium">
                        {journey.cabType?.name || "Standard"}
                      </span>
                    </div>
                    {journey.driverRequired !== undefined && (
                      <div className="flex justify-between py-1">
                        <span>Driver Required:</span>
                        <span className="font-medium">
                          {journey.driverRequired ? "Yes" : "No"}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Right: Travel details */}
              <div className={`w-full ${isCab && journey.cabType ? 'md:w-2/3' : ''}`}>
                <div className="flex flex-col gap-3 text-sm">
                  {/* Route */}
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <FontAwesomeIcon
                        icon={faMapMarkedAlt}
                        className="text-[#155EEF]"
                      />
                      <span className="font-semibold">Route</span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pl-7">
                      <div>
                        <span className="text-gray-600">From:</span>
                        <div className="font-medium">
                          {journey.fromCity?.name || "N/A"}
                        </div>
                        {journey.fromCity?.stateName && (
                          <div className="text-xs text-gray-500">
                            {journey.fromCity.stateName}, {journey.fromCity.countryName}
                          </div>
                        )}
                      </div>
                      <div>
                        <span className="text-gray-600">To:</span>
                        <div className="font-medium">
                          {journey.toCity?.name || "N/A"}
                        </div>
                        {journey.toCity?.stateName && (
                          <div className="text-xs text-gray-500">
                            {journey.toCity.stateName}, {journey.toCity.countryName}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Departure Date */}
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <FontAwesomeIcon icon={faClock} className="text-[#155EEF]" />
                      <span className="font-semibold">Travel Details</span>
                    </div>
                    <div className="pl-7">
                      <span className="text-gray-600">Departure:</span>
                      <span className="font-medium ml-2">
                        {formatDate(journey.departureDate)}
                      </span>
                    </div>
                  </div>

                  {/* Amount Details (if available) */}
                  {(journey.quoteAmount > 0 || journey.journeyAmount > 0) && (
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <FontAwesomeIcon
                          icon={faMoneyBillWave}
                          className="text-[#155EEF]"
                        />
                        <span className="font-semibold">Amount Details</span>
                      </div>
                      <div className="pl-7 space-y-1">
                        {journey.journeyAmount > 0 && (
                          <div className="flex justify-between">
                            <span className="text-gray-600">Journey Amount:</span>
                            <span className="font-medium">
                              ₹{journey.journeyAmount.toLocaleString()}
                            </span>
                          </div>
                        )}
                        {journey.journeyTax > 0 && (
                          <div className="flex justify-between">
                            <span className="text-gray-600">Tax:</span>
                            <span className="font-medium">
                              ₹{journey.journeyTax.toLocaleString()}
                            </span>
                          </div>
                        )}
                        {journey.quoteAmount > 0 && (
                          <div className="flex justify-between">
                            <span className="text-gray-600">Quote Amount:</span>
                            <span className="font-medium text-[#155EEF]">
                              ₹{journey.quoteAmount.toLocaleString()}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Additional Info */}
                  {(journey.description || journey.additionalInstructions) && (
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <FontAwesomeIcon
                          icon={faInfoCircle}
                          className="text-[#155EEF]"
                        />
                        <span className="font-semibold">Additional Information</span>
                      </div>
                      <div className="pl-7 space-y-1">
                        {journey.description && (
                          <div>
                            <span className="text-gray-600">Description:</span>
                            <p className="text-sm mt-1">{journey.description}</p>
                          </div>
                        )}
                        {journey.additionalInstructions && (
                          <div>
                            <span className="text-gray-600">Instructions:</span>
                            <p className="text-sm mt-1">
                              {journey.additionalInstructions}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Total Summary (if multiple journeys) */}
      {journeys.length > 1 && (
        <div className="mt-4 p-3 bg-blue-50 rounded-md border border-blue-200">
          <div className="flex justify-between items-center">
            <span className="font-semibold">Total Journeys:</span>
            <span className="font-bold text-lg">{journeys.length}</span>
          </div>
          {journeys.some(j => j.quoteAmount > 0) && (
            <div className="flex justify-between items-center mt-2">
              <span className="font-semibold">Total Quote Amount:</span>
              <span className="font-bold text-lg text-[#155EEF]">
                ₹{journeys.reduce((sum, j) => sum + (j.quoteAmount || 0), 0).toLocaleString()}
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
  return (
    <ProtectedRoute>
      <Head>
        <title>Transport Approval Status</title>
      </Head>
      <div className="border-b">
        <Header />
      </div>
      {isLoading ? (
        <div className="flex justify-center items-center h-screen">
          <FontAwesomeIcon icon={faSpinner} spin size="2x" color="#155EEF" />
        </div>
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
                      <button
                        className="bg-[#155EEF] w-full text-white text-xxs sm:text-sm py-1 p-3 rounded-lg"
                        onClick={openCancelModal}
                      >
                        Cancel Request
                      </button>
                    )}
                  {approvalData?.approvalStatus === "Declined" && (
                    <button
                      className="bg-[#155EEF] w-full text-white text-sm p-3 mt-5 rounded-lg"
                      onClick={() => router.push("/")}
                    >
                      Go to Homepage
                    </button>
                  )}
                </div>
              </div>
              <div className="bg-white p-4 rounded-lg mt-2 font-medium text-xxs sm:text-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-4">
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                  <div className="flex items-center">
                    <FontAwesomeIcon icon={faClock} color="#7E0ED6" />
                    <span className="ml-2">Your travel is</span>
                  </div>
                  <div className="flex items-center">
                    <span className="text-gray-600">Requested on:</span>
                    <span className="ml-1 font-semibold">
                      {formatDate(approvalData.createdAt)}
                    </span>
                  </div>
                </div>
                <div className="flex items-center">
                  <span className="text-gray-600">Booking Status:</span>
                  <span
                    className={`ml-1 font-semibold ${getStatusColor(
                      approvalData?.transportBookingData?.booking?.bookingStatus
                    )}`}
                  >
                    {approvalData?.transportBookingData?.booking
                      ?.bookingStatus || "Pending"}
                  </span>
                </div>
              </div>
              <ApproverDetails
                parentClassName="bg-white p-4 mt-3 rounded-lg"
                travellers={approvalData.transformedApprovalDetails}
                approvalStatus={approvalData.approvalStatus}
                travelReason={approvalData.reasonForTravel}
                cancelledOn={formatDate1(approvalData?.updatedAt)}
              />
              {renderTransportDetails()}
              <div className="bg-white rounded-md w-full h-fit p-4 mt-2 flex flex-col gap-2">
                <div className="font-medium text-lg mb-2">Traveler Details</div>
                {approvalData?.bookingdetails?.passengers?.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-[#155EEF]">
                        <tr>
                          <th className="px-4 py-2 text-left text-xs font-semibold text-white uppercase tracking-wider">
                            Traveler Name
                          </th>
                          <th className="px-4 py-2 text-left text-xs font-semibold text-white uppercase tracking-wider">
                            Email
                          </th>
                          {/* <th className="px-4 py-2 text-left text-xs font-semibold text-white uppercase tracking-wider">
                            Age
                          </th>
                          <th className="px-4 py-2 text-left text-xs font-semibold text-white uppercase tracking-wider">
                            Gender
                          </th>
                          <th className="px-4 py-2 text-left text-xs font-semibold text-white uppercase tracking-wider">
                            Phone
                          </th> */}
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {approvalData.bookingdetails.passengers.map(
                          (passenger, index) => (
                            <tr
                              key={passenger._id}
                              className={
                                index % 2 === 0 ? "bg-gray-50" : "bg-white"
                              }
                            >
                              <td className="px-4 py-2 text-sm text-gray-900">
                                {passenger.name ||
                                  approvalData.userName ||
                                  "N/A"}
                              </td>
                              <td className="px-4 py-2 text-sm text-gray-900">
                                {passenger.email || "N/A"}
                              </td>
                              {/* <td className="px-4 py-2 text-sm text-gray-900">
                                {passenger.age ?? "N/A"}
                              </td>
                              <td className="px-4 py-2 text-sm text-gray-900">
                                {passenger.gender || "N/A"}
                              </td>
                              <td className="px-4 py-2 text-sm text-gray-900">
                                {passenger.phone || "N/A"}
                              </td> */}
                            </tr>
                          )
                        )}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-red-600 text-center">
                    No traveler information available
                  </div>
                )}
              </div>
              <div className="border-[1px] border-[#155EEF2E] shadow-[6px_6px_30px_0px_#7D99B40D] rounded-md mt-2 p-3 bg-white">
                <GSTDetails
                  companyName={approvalData?.companyDetails?.companyName}
                  gstNumber={approvalData?.companyDetails?.gst}
                  companyEmail={approvalData?.companyDetails?.gstEmail}
                  companyMobile={approvalData?.companyDetails?.gstMobileNumber}
                  companyAddress={approvalData?.companyDetails?.address}
                />
              </div>
              {isCancelModalOpen && (
                <RequestModal
                  isOpen={isCancelModalOpen}
                  onClose={() => setIsCancelModalOpen(false)}
                  title="Are you sure you want to cancel your Travel Request?"
                  subtitle="If you cancel your request, Your approver will be notified about the cancellation."
                  showApproverDetails={false}
                  showReasonInput={true}
                  onSubmit={handleManualCancellation}
                  buttonConfig={{ submit: "Cancel Request" }}
                  cancelPopup={isCancelModalOpen}
                />
              )}
            </div>
            <div className="w-2/6 hidden sm:block">
              {approvalData?.approvalStatus !== "Cancelled" &&
                approvalData?.approvalStatus !== "Declined" &&
                approvalData?.paymentStatus !== "SUCCESS" &&
                userDetails?.userId === approvalData?.userId && (
                  <button
                    className="bg-[#155EEF] w-full text-white text-sm p-3 mt-5 rounded-lg"
                    onClick={openCancelModal}
                  >
                    Cancel Request
                  </button>
                )}
              {approvalData?.approvalStatus === "Declined" && (
                <button
                  className="bg-[#155EEF] w-full text-white text-sm p-3 mt-5 rounded-lg"
                  onClick={() => router.push("/")}
                >
                  Go to Homepage
                </button>
              )}
              <div className="w-full mt-4 bg-white p-3 h-fit rounded-md">
                {/* Title row + potential OOP badge */}
                <div className="flex gap-2 items-center">
                  <div className="font-bold">Fare Summary</div>
                  {(!approvalData?.inPolicy ||
                    approvalData?.bookingdetails?.booking
                      ?.policyViolationDetails?.violationMessages?.length >
                      0) && (
                    <span className="text-[#E53944] text-sm font-medium items-center bg-[#FBE2E3] rounded-lg w-fit px-2 py-1 flex gap-1 cursor-pointer">
                      Out of Policy
                    </span>
                  )}
                </div>
 
                {/* Fare Breakdown */}
                <div className="p-2 flex w-full justify-between mt-2 text-xs sm:text-sm font-medium text-[#000000]">
                  <div>
                    {/* Adults {adults} x {(totalAmount / adults).toFixed(2)} */}
                    Fare
                  </div>
                  <div>Rs. {formatPrice(approvalData?.bookingdetails?.booking?.totalAmount)}</div>
                </div>
 
                <div className="p-2 flex w-full justify-between mt-0 text-xs sm:text-sm font-medium text-[#000000]">
                  <div>Taxes</div>
                  {/* <div>Rs. {formatPrice(taxAmount)}</div> */}
                  <div>Rs. {formatPrice(approvalData?.bookingdetails?.booking?.taxAmount)}</div>
                </div>
 
                <div className="p-2 flex w-full justify-between mt-0 text-xs sm:text-sm font-medium text-[#000000]">
                  {/* <div>Special Services</div> */}
                  {/* <div>Rs. {formatPrice(ssrFare)}</div> */}
                </div>
 
                <div className="p-2 py-3 flex w-full justify-between mt-1 rounded-md text-base sm:text-lg bg-[#155EEF0F] text-[#155EEF]">
                  <div className="font-semibold">Total Price</div>
                  {/* <div>Rs. {formatPrice(totalFare)}</div> */}
                  <div>{formatPrice(approvalData?.bookingdetails?.booking?.netAmount)}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      <Footer2 />
    </ProtectedRoute>
  );
}