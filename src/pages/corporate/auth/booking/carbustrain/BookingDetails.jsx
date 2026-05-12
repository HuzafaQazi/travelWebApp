import React, { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faTrain,
  faBus,
  faTaxi,
  faCalendarAlt,
  faMoneyBillWave,
  faInfoCircle,
  faUser,
  faRoute,
  faExclamationCircle,
  faDownload,
  faSpinner,
} from "@fortawesome/free-solid-svg-icons";
import "tailwindcss/tailwind.css";
import { useRouter } from "next/router";
import { getTransportBookingDetails } from "@/utils/profileAPI";
import Header from "@/components/corporate/auth/Header";
import Footer2 from "@/components/corporate/footerCorporate/footerCorporate";
import ProtectedRoute from "@/components/corporate/protectedRoute/ProtectedRoute";
import Head from "next/head";
import showToast from "@/utils/toast";
import axios, { getTabSpecificData } from "@/utils/axios/axios";
import config from "@/config";
import { useUserPermissions } from "@/hooks/useUserPermissions";
 
const transportMap = {
  3: {
    name: "Train",
    icon: faTrain,
  },
  4: {
    name: "Bus",
    icon: faBus,
  },
  5: {
    name: "Cab/Taxi",
    icon: faTaxi,
  },
};
const TrainBookingDetailsPage = ({ isCorporateUser = false }) => {
  const router = useRouter();
  const { bookingId } = router.query;
  const [bookingData, setBookingData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isInvoiceLoading, setIsInvoiceLoading] = useState(false);
  const [isTicketLoading, setIsTicketLoading] = useState(false);
 const { userType } = useUserPermissions();
  useEffect(() => {
    const fetchBookingDetails = async () => {
      if (!bookingId) {
        console.log("Booking ID is not available yet, waiting...");
        return;
      }
 
      console.log("Fetching booking details for bookingId:", bookingId);
      setLoading(true);
      try {
        const response = await getTransportBookingDetails(
          bookingId,
          isCorporateUser
        );
        console.log("API Response:", response);
        if (response.status) {
          setBookingData(response.data);
        } else {
          setError(response.message);
        }
      } catch (err) {
        setError("Failed to fetch booking details");
        console.error("Error fetching booking details:", err);
      } finally {
        setLoading(false);
      }
    };
 
    fetchBookingDetails();
  }, [bookingId, isCorporateUser]);
 
  const downloadFile = async (type) => {
    try {
      const setLoading =
        type === "invoice" ? setIsInvoiceLoading : setIsTicketLoading;
      setLoading(true);
      const apiUrl = `${config.CORPORATE.TRANSPORT_INVOICE}/${bookingId}?type=${type}`;
      console.log(`Attempting to download ${type} from:`, apiUrl);
      console.log("Booking ID:", bookingId);
 
      const token = getTabSpecificData("token"); // Adjust key if needed
      const response = await axios.get(apiUrl, {
        responseType: "blob",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
 
      console.log("Download API response status:", response.status);
 
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `${type}_${bookingId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
 
      showToast(
        "success",
        `${
          type.charAt(0).toUpperCase() + type.slice(1)
        } downloaded successfully`
      );
    } catch (error) {
      console.error(`Error downloading ${type}:`, error);
      if (error.response) {
        console.error("Response status:", error.response.status);
        console.error("Response data:", error.response.data);
      }
      showToast("error", `Failed to download ${type}. Please try again.`);
    } finally {
      const setLoading =
        type === "invoice" ? setIsInvoiceLoading : setIsTicketLoading;
      setLoading(false);
    }
  };
 
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "N/A";
    return date.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };
 
  const formatTime = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "N/A";
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };
 
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-[#028fa3] border-solid mx-auto mb-4"></div>
          <p className="text-lg text-gray-600 font-medium">
            Loading booking details...
          </p>
        </div>
      </div>
    );
  }
 
  if (error || !bookingData?.booking) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="text-center">
          <p className="text-xl text-red-500 font-semibold mb-4">
            {error || "No booking details found"}
          </p>
          <button
            onClick={() => router.back()}
            className="px-6 py-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors duration-300 shadow-md"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }
 
  console.log("response of booking data", bookingData);
  const booking = bookingData.booking;
  const passengers = bookingData.passengers || [];
  const journeys = bookingData.journeys || [];
  const quoteDetails = booking.quoteDetails || {};
  const policyViolations =
    booking.policyViolationDetails?.violationMessages || [];
 
  const travelCategory = booking.travelCategory || 3;
  const transport = transportMap[travelCategory] || transportMap[3];
 
  const origin = booking.origin || "N/A";
  const destination = booking.destination || "N/A";
  const travelDate = booking.travelDate;
  const reasonForTravel = booking.reasonForTravel || "N/A";
  const bookingIdDisplay = booking.bookingId || "N/A";
  const totalAmount =
    typeof booking.totalAmount === "number" ? booking.totalAmount : 0;
  const taxAmount =
    typeof booking.taxAmount === "number" ? booking.taxAmount : 0;
  const netAmount =
    typeof booking.netAmount === "number" ? booking.netAmount : 0;
  const convenienceFee =
    typeof booking.convenienceFee === "number" ? booking.convenienceFee : 0;
  const serviceTax =
    typeof booking.serviceTax === "number" ? booking.serviceTax : 0;
  const cgst = typeof booking.cgst === "number" ? booking.cgst : 0;
  const sgst = typeof booking.sgst === "number" ? booking.sgst : 0;
  const igst = typeof booking.igst === "number" ? booking.igst : 0;
  const totalGst = typeof booking.totalGst === "number" ? booking.totalGst : 0;
  const bookingStatus = booking.bookingStatus || "N/A";
  const paymentStatus = booking.paymentStatus || "N/A";
  const userName = booking.userName || "N/A";
  const createdAt = booking.createdAt;
  const updatedAt = booking.updatedAt;
  const status = booking.status || "N/A";
  const autoRejected =
    booking.autoRejected !== undefined ? booking.autoRejected : false;
 
  return (
    <ProtectedRoute>
      <Head>
        <title>Transport Booking Details</title>
      </Head>
      <div className="border-b">
        <Header />
      </div>
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 py-10 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          {/* Header with Back Button */}
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 flex items-center">
              <FontAwesomeIcon
                icon={transport.icon}
                className="w-8 h-8 text-[#028fa3] mr-3"
              />
              {transport.name} Booking Details
            </h2>
 
            <div className="flex flex-col sm:flex-row gap-2">
              {bookingStatus === "booked" && booking.invoiceUrl && userType === 1 && (
                <button
                  className="px-6 py-2 bg-[#028fa3] text-white rounded-full hover:bg-[#027a8c] transition-colors duration-300 shadow-md flex items-center"
                  onClick={() => downloadFile("invoice")}
                  disabled={isInvoiceLoading}
                >
                  {isInvoiceLoading ? (
                    <FontAwesomeIcon
                      icon={faSpinner}
                      spin
                      className="w-5 h-5 mr-2"
                    />
                  ) : (
                    <FontAwesomeIcon
                      icon={faDownload}
                      className="w-5 h-5 mr-2"
                    />
                  )}
                  Download Invoice
                </button>
              )}
              {bookingStatus === "booked" && booking.ticketUrl && (
                <button
                  className="px-6 py-2 bg-[#028fa3] text-white rounded-full hover:bg-[#027a8c] transition-colors duration-300 shadow-md flex items-center"
                  onClick={() => downloadFile("ticket")}
                  disabled={isTicketLoading}
                >
                  {isTicketLoading ? (
                    <FontAwesomeIcon
                      icon={faSpinner}
                      spin
                      className="w-5 h-5 mr-2"
                    />
                  ) : (
                    <FontAwesomeIcon
                      icon={faDownload}
                      className="w-5 h-5 mr-2"
                    />
                  )}
                  Download Ticket
                </button>
              )}
              <button
                onClick={() => router.back()}
                className="px-6 py-2 bg-[#028fa3] text-white rounded-full hover:bg-[#027a8c] transition-colors duration-300 shadow-md flex items-center"
              >
                <svg
                  className="w-5 h-5 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
                Go Back
              </button>
            </div>
          </div>
 
          {/* Main Booking Card */}
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-8 border-l-4 border-[#028fa3] transition-transform transform hover:scale-[1.01] duration-300">
            {/* Header Section */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center">
                <FontAwesomeIcon
                  icon={transport.icon}
                  className="w-7 h-7 text-[#028fa3] mr-3"
                />
                <h3 className="text-2xl font-semibold text-gray-800">
                  {origin} to {destination}
                </h3>
              </div>
              <span
                className={`px-4 py-1.5 rounded-full text-sm font-medium shadow-sm ${
                  bookingStatus === "quoted"
                    ? "bg-yellow-100 text-yellow-800"
                    : bookingStatus === "pending"
                    ? "bg-red-100 text-red-800"
                    : "bg-green-100 text-green-800"
                }`}
              >
                {bookingStatus !== "N/A"
                  ? bookingStatus.charAt(0).toUpperCase() +
                    bookingStatus.slice(1)
                  : "N/A"}
              </span>
            </div>
 
            {/* Journey and Amount Details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-gray-700">
              {/* Journey Details */}
              <div className="space-y-3">
                <p className="flex items-center text-sm">
                  <FontAwesomeIcon
                    icon={faCalendarAlt}
                    className="w-5 h-5 text-[#028fa3] mr-2"
                  />
                  <span className="font-semibold">Travel Date:</span>
                  <span className="ml-2">
                    {travelDate
                      ? `${formatDate(travelDate)} at ${formatTime(travelDate)}`
                      : "N/A"}
                  </span>
                </p>
                <p className="text-sm">
                  <span className="font-semibold">Reason for Travel:</span>
                  <span className="ml-2">{reasonForTravel}</span>
                </p>
                <p className="text-sm">
                  <span className="font-semibold">Booking ID:</span>
                  <span className="ml-2">{bookingIdDisplay}</span>
                </p>
                <p className="text-sm">
                  <span className="font-semibold">User Name:</span>
                  <span className="ml-2">{userName}</span>
                </p>
                <p className="text-sm">
                  <span className="font-semibold">Status:</span>
                  <span className="ml-2">{status}</span>
                </p>
                <p className="text-sm">
                  <span className="font-semibold">Auto Rejected:</span>
                  <span className="ml-2">{autoRejected ? "Yes" : "No"}</span>
                </p>
              </div>
 
              {/* Amount Details */}
              <div className="space-y-3 bg-gray-50 p-4 rounded-lg">
                <p className="flex items-center text-sm">
                  <FontAwesomeIcon
                    icon={faMoneyBillWave}
                    className="w-5 h-5 text-[#028fa3] mr-2"
                  />
                  <span className="font-semibold">Total Amount:</span>
                  <span className="ml-2">₹{totalAmount.toLocaleString()}</span>
                </p>
                <p className="text-sm">
                  <span className="font-semibold">Tax Amount:</span>
                  <span className="ml-2">₹{taxAmount.toLocaleString()}</span>
                </p>
                <p className="text-sm">
                  <span className="font-semibold">Convenience Fee:</span>
                  <span className="ml-2">
                    ₹{convenienceFee.toLocaleString()}
                  </span>
                </p>
                <p className="text-sm">
                  <span className="font-semibold">Service Tax:</span>
                  <span className="ml-2">₹{serviceTax.toLocaleString()}</span>
                </p>
                <p className="text-sm">
                  <span className="font-semibold">CGST:</span>
                  <span className="ml-2">₹{cgst.toLocaleString()}</span>
                </p>
                <p className="text-sm">
                  <span className="font-semibold">SGST:</span>
                  <span className="ml-2">₹{sgst.toLocaleString()}</span>
                </p>
                <p className="text-sm">
                  <span className="font-semibold">IGST:</span>
                  <span className="ml-2">₹{igst.toLocaleString()}</span>
                </p>
                <p className="text-sm">
                  <span className="font-semibold">Total GST:</span>
                  <span className="ml-2">₹{totalGst.toLocaleString()}</span>
                </p>
                <p className="text-sm">
                  <span className="font-semibold">Net Amount:</span>
                  <span className="ml-2 font-bold text-[#028fa3]">
                    ₹{netAmount.toLocaleString()}
                  </span>
                </p>
              </div>
            </div>
 
            {/* Quote Details */}
            {quoteDetails && (
              <div className="mt-6 border-t border-gray-200 pt-4">
                <h4 className="text-lg font-semibold text-gray-800 flex items-center mb-3">
                  <FontAwesomeIcon
                    icon={faInfoCircle}
                    className="w-5 h-5 text-[#028fa3] mr-2"
                  />
                  Quote Details
                </h4>
                <div className="text-sm text-gray-700 space-y-2">
                  <p>
                    <span className="font-semibold">Amount:</span>
                    <span className="ml-2">
                      ₹
                      {typeof quoteDetails.amount === "number"
                        ? quoteDetails.amount.toLocaleString()
                        : "N/A"}
                    </span>
                  </p>
                  <p>
                    <span className="font-semibold">Details:</span>
                    <span className="ml-2">
                      {quoteDetails.details || "N/A"}
                    </span>
                  </p>
                  <p>
                    <span className="font-semibold">Quoted At:</span>
                    <span className="ml-2">
                      {formatDate(quoteDetails.quotedAt)}{" "}
                      {formatTime(quoteDetails.quotedAt)}
                    </span>
                  </p>
                </div>
              </div>
            )}
 
            {/* Policy Violation Details */}
            {policyViolations.length > 0 && (
              <div className="mt-6 border-t border-gray-200 pt-4">
                <h4 className="text-lg font-semibold text-gray-800 flex items-center mb-3">
                  <FontAwesomeIcon
                    icon={faExclamationCircle}
                    className="w-5 h-5 text-red-500 mr-2"
                  />
                  Policy Violations
                </h4>
                <div className="text-sm text-red-600 space-y-2">
                  {policyViolations.map((msg, index) => (
                    <p key={index} className="flex items-center">
                      <span className="mr-2">•</span> {msg}
                    </p>
                  ))}
                </div>
              </div>
            )}
 
            {/* Booking and Payment Status */}
            <div className="mt-6 border-t border-gray-200 pt-4 flex flex-col sm:flex-row sm:justify-between text-sm text-gray-700">
              <p className="mb-2 sm:mb-0">
                <span className="font-semibold">Payment Status:</span>
                <span
                  className={`ml-2 font-medium ${
                    paymentStatus === "pending"
                      ? "text-red-600"
                      : "text-green-600"
                  }`}
                >
                  {paymentStatus !== "N/A"
                    ? paymentStatus.charAt(0).toUpperCase() +
                      paymentStatus.slice(1)
                    : "N/A"}
                </span>
              </p>
              <div className="space-y-1">
                <p>
                  <span className="font-semibold">Booked On:</span>
                  <span className="ml-2">
                    {formatDate(createdAt)} {formatTime(createdAt)}
                  </span>
                </p>
                <p>
                  <span className="font-semibold">Last Updated:</span>
                  <span className="ml-2">
                    {formatDate(updatedAt)} {formatTime(updatedAt)}
                  </span>
                </p>
              </div>
            </div>
          </div>
 
          {/* Passengers Section */}
          {passengers.length > 0 && (
            <div className="mt-8">
              <h4 className="text-xl font-semibold text-gray-800 flex items-center mb-4">
                <FontAwesomeIcon
                  icon={faUser}
                  className="w-6 h-6 text-[#028fa3] mr-3"
                />
                Passengers
              </h4>
              <div className="space-y-4">
                {passengers.map((passenger, index) => (
                  <div
                    key={passenger._id || index}
                    className="bg-white rounded-xl shadow-md p-5 border-l-4 border-[#028fa3] transition-transform transform hover:scale-[1.01] duration-300"
                  >
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-gray-700">
                      <div className="space-y-2">
                        <p>
                          <span className="font-semibold">Name:</span>
                          <span className="ml-2">
                            {passenger.name || "N/A"}
                          </span>
                        </p>
                        <p>
                          <span className="font-semibold">Email:</span>
                          <span className="ml-2">
                            {passenger.email || "N/A"}
                          </span>
                        </p>
                        <p>
                          <span className="font-semibold">Phone:</span>
                          <span className="ml-2">
                            {passenger.phone || "N/A"}
                          </span>
                        </p>
                      </div>
                      <div className="space-y-2">
                        <p>
                          <span className="font-semibold">Age:</span>
                          <span className="ml-2">{passenger.age || "N/A"}</span>
                        </p>
                        <p>
                          <span className="font-semibold">Gender:</span>
                          <span className="ml-2">
                            {passenger.gender || "N/A"}
                          </span>
                        </p>
                        <p>
                          <span className="font-semibold">Status:</span>
                          <span className="ml-2">
                            {passenger.status || "N/A"}
                          </span>
                        </p>
                      </div>
                    </div>
                    <div className="mt-3 pt-3 border-t border-gray-200 text-sm text-gray-700">
                      <p>
                        <span className="font-semibold">Created At:</span>
                        <span className="ml-2">
                          {formatDate(passenger.createdAt)}{" "}
                          {formatTime(passenger.createdAt)}
                        </span>
                      </p>
                      <p>
                        <span className="font-semibold">Updated At:</span>
                        <span className="ml-2">
                          {formatDate(passenger.updatedAt)}{" "}
                          {formatTime(passenger.updatedAt)}
                        </span>
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
 
          {/* Journeys Section */}
          {journeys.length > 0 && (
            <div className="mt-8">
              <h4 className="text-xl font-semibold text-gray-800 flex items-center mb-4">
                <FontAwesomeIcon
                  icon={faRoute}
                  className="w-6 h-6 text-[#028fa3] mr-3"
                />
                Journeys
              </h4>
              <div className="space-y-4">
                {journeys.map((journey, index) => (
                  <div
                    key={journey._id || index}
                    className="bg-white rounded-xl shadow-md p-5 border-l-4 border-[#028fa3] transition-transform transform hover:scale-[1.01] duration-300"
                  >
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-gray-700">
                      <div className="space-y-2">
                        <p>
                          <span className="font-semibold">From:</span>
                          <span className="ml-2">
                            {journey.fromCity?.name || "N/A"} (
                            {journey.fromCity?.stateName || "N/A"},{" "}
                            {journey.fromCity?.countryName || "N/A"})
                          </span>
                        </p>
                        <p>
                          <span className="font-semibold">To:</span>
                          <span className="ml-2">
                            {journey.toCity?.name || "N/A"} (
                            {journey.toCity?.stateName || "N/A"},{" "}
                            {journey.toCity?.countryName || "N/A"})
                          </span>
                        </p>
                        <p>
                          <span className="font-semibold">Departure Date:</span>
                          <span className="ml-2">
                            {formatDate(journey.departureDate)}{" "}
                            {formatTime(journey.departureDate)}
                          </span>
                        </p>
                        <p>
                          <span className="font-semibold">Journey Amount:</span>
                          <span className="ml-2">
                            ₹
                            {typeof journey.journeyAmount === "number"
                              ? journey.journeyAmount.toLocaleString()
                              : "N/A"}
                          </span>
                        </p>
                        <p>
                          <span className="font-semibold">Journey Tax:</span>
                          <span className="ml-2">
                            ₹
                            {typeof journey.journeyTax === "number"
                              ? journey.journeyTax.toLocaleString()
                              : "N/A"}
                          </span>
                        </p>
                      </div>
                      <div className="space-y-2">
                        <p>
                          <span className="font-semibold">Quote Amount:</span>
                          <span className="ml-2">
                            ₹
                            {typeof journey.quoteAmount === "number"
                              ? journey.quoteAmount.toLocaleString()
                              : "N/A"}
                          </span>
                        </p>
                        <p>
                          <span className="font-semibold">Quote Details:</span>
                          <span className="ml-2">
                            {journey.quoteDetails || "N/A"}
                          </span>
                        </p>
                        <p>
                          <span className="font-semibold">Quoted At:</span>
                          <span className="ml-2">
                            {formatDate(journey.quotedAt)}{" "}
                            {formatTime(journey.quotedAt)}
                          </span>
                        </p>
                        <p>
                          <span className="font-semibold">Description:</span>
                          <span className="ml-2">
                            {journey.description || "N/A"}
                          </span>
                        </p>
                        <p>
                          <span className="font-semibold">
                            Additional Instructions:
                          </span>
                          <span className="ml-2">
                            {journey.additionalInstructions || "N/A"}
                          </span>
                        </p>
                      </div>
                    </div>
                    <div className="mt-3 pt-3 border-t border-gray-200 text-sm text-gray-700">
                      <p>
                        <span className="font-semibold">Status:</span>
                        <span className="ml-2">{journey.status || "N/A"}</span>
                      </p>
                      <p>
                        <span className="font-semibold">Created At:</span>
                        <span className="ml-2">
                          {formatDate(journey.createdAt)}{" "}
                          {formatTime(journey.createdAt)}
                        </span>
                      </p>
                      <p>
                        <span className="font-semibold">Updated At:</span>
                        <span className="ml-2">
                          {formatDate(journey.updatedAt)}{" "}
                          {formatTime(journey.updatedAt)}
                        </span>
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
      <Footer2 />
    </ProtectedRoute>
  );
};
 
export default TrainBookingDetailsPage;