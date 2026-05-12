import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBus, faCalendarAlt, faMoneyBillWave, faInfoCircle } from "@fortawesome/free-solid-svg-icons";
import { useRouter } from "next/router";

const BusCard = ({ booking, onClose }) => {
  const router = useRouter();

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

  const routeToBookingDetails = async () => {
    if (booking?.BookingStatus !== "FAILED") {
      router.push({
        pathname: "/corporate/auth/booking/carbustrain/BookingDetails",
        query: { bookingId: booking?.bookingId },
      });
      onClose();
    }
  };

  console.log("BusCard Booking:", booking);

  const origin = booking?.origin || "N/A";
  const destination = booking?.destination || "N/A";
  const travelDate = booking?.travelDate;
  const reasonForTravel = booking?.reasonForTravel || "N/A";
  const bookingId = booking?.bookingId || "N/A";
  const totalAmount = typeof booking?.totalAmount === "number" ? booking.totalAmount : 0;
  const taxAmount = typeof booking?.taxAmount === "number" ? booking.taxAmount : 0;
  const netAmount = typeof booking?.netAmount === "number" ? booking.netAmount : 0;
  const bookingStatus = booking?.bookingStatus || "N/A";
  const paymentStatus = booking?.paymentStatus || "N/A";
  const passengerName =
    booking?.passengerDetails?.[0]?.name ||
    (booking?.userInfo?.firstName && booking?.userInfo?.lastName
      ? `${booking.userInfo.firstName} ${booking.userInfo.lastName}`
      : "N/A");
  const passengerEmail = booking?.passengerDetails?.[0]?.email || "N/A";
  const quoteDetails = booking?.journeyDetails?.[0]?.quoteDetails;
  const createdAt = booking?.createdAt;

  return (
    <div
      onClick={routeToBookingDetails}
      className="relative bg-white rounded-xl shadow-lg p-2 mb-6 border-l-4 border-[#028fa3] hover:shadow-xl transition-all duration-300 transform hover:scale-[1.01] cursor-pointer"
    >
      {/* Header Section */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <FontAwesomeIcon icon={faBus} className="w-7 h-7 text-[#028fa3] mr-3" />
          <h3 className="text-xl font-semibold text-gray-800">
            {origin} to {destination}
          </h3>
        </div>
        <span
          className={`px-4 py-1.5 rounded-full text-sm font-medium shadow-sm ${
            bookingStatus === "quoted"
              ? "bg-yellow-100 text-yellow-800"
              : "bg-green-100 text-green-800"
          }`}
        >
          {bookingStatus !== "N/A"
            ? bookingStatus.charAt(0).toUpperCase() + bookingStatus.slice(1)
            : "N/A"}
        </span>
      </div>

      {/* Journey and Amount Details */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-gray-700">
        {/* Journey Details */}
        <div className="space-y-3">
          <p className="flex items-center text-sm">
            <FontAwesomeIcon icon={faCalendarAlt} className="w-5 h-5 text-[#028fa3] mr-2" />
            <span className="font-semibold">Travel Date:</span>
            <span className="ml-2">
              {travelDate ? `${formatDate(travelDate)} at ${formatTime(travelDate)}` : "N/A"}
            </span>
          </p>
          <p className="text-sm">
            <span className="font-semibold">Reason for Travel:</span>
            <span className="ml-2">{reasonForTravel}</span>
          </p>
          <p className="text-sm">
            <span className="font-semibold">Booking ID:</span>
            <span className="ml-2">{bookingId}</span>
          </p>
        </div>

        {/* Amount Details */}
        <div className="space-y-3 bg-gray-50 p-4 rounded-lg">
          <p className="flex items-center text-sm">
            <FontAwesomeIcon icon={faMoneyBillWave} className="w-5 h-5 text-[#028fa3] mr-2" />
            <span className="font-semibold">Total Amount:</span>
            <span className="ml-2">₹{totalAmount.toLocaleString()}</span>
          </p>
          <p className="text-sm">
            <span className="font-semibold">Tax Amount:</span>
            <span className="ml-2">₹{taxAmount.toLocaleString()}</span>
          </p>
          <p className="text-sm">
            <span className="font-semibold">Net Amount:</span>
            <span className="ml-2 font-bold text-[#028fa3]">
              ₹{netAmount.toLocaleString()}
            </span>
          </p>
        </div>
      </div>

      {/* Passenger and Quote Details */}
      <div className="mt-4 border-t border-gray-200 pt-4 text-sm text-gray-700">
        <p className="flex items-center">
          <svg
            className="w-5 h-5 text-[#028fa3] mr-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
            />
          </svg>
          <span className="font-semibold">Passenger:</span>
          <span className="ml-2">{passengerName} ({passengerEmail})</span>
        </p>
        {quoteDetails && (
          <p className="mt-2 flex items-center">
            <FontAwesomeIcon icon={faInfoCircle} className="w-5 h-5 text-[#028fa3] mr-2" />
            <span className="font-semibold">Quote Details:</span>
            <span className="ml-2">{quoteDetails}</span>
          </p>
        )}
      </div>

      {/* Booking and Payment Status */}
      <div className="mt-4 border-t border-gray-200 pt-4 flex flex-col sm:flex-row sm:justify-between text-sm text-gray-700">
        <p className="mb-2 sm:mb-0">
          <span className="font-semibold">Payment Status:</span>
          <span
            className={`ml-2 font-medium ${
              paymentStatus === "pending" ? "text-red-600" : "text-green-600"
            }`}
          >
            {paymentStatus !== "N/A"
              ? paymentStatus.charAt(0).toUpperCase() + paymentStatus.slice(1)
              : "N/A"}
          </span>
        </p>
        <p>
          <span className="font-semibold">Booked On:</span>
          <span className="ml-2">{formatDate(createdAt)}</span>
        </p>
      </div>
    </div>
  );
};

export default BusCard;