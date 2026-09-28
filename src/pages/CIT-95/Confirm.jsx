import { useEffect, useState } from "react";
import "tailwindcss/tailwind.css";
import { useRouter } from "next/router";
import Head from "next/head";
import HeaderCommon from "@/components/HeaderCommon/HeaderCommon";
import B2CHeader from "@/components/flights/B2cHeader/Header";
import axios from "@/utils/axios/axios";
import config from "@/config";
import WebSocketService from "@/webSocketService/WebSocketService";
import TermsAndConditions from "../../components/events/registercomps/policy/TermsAndConditions";
import CancellationPolicy from "../../components/events/registercomps/policy/CancellationPolicy";
import HotelPolicy from "../../components/events/registercomps/policy/HotelPolicy";

const BookingConfirmation = () => {
  const router = useRouter();
  const { bookingId, profile } = router.query;
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [webSocketService, setWebSocketService] = useState(null);
  const [webSocketConnected, setWebSocketConnected] = useState(false);

  // Function to fetch booking details
  const fetchBookingDetails = async (id) => {
    try {
      setLoading(true);

      const response = await axios.get(`${config.EVENTS_BOOKING_DETAIL}/${id}`);

      if (response?.data?.status) {
        sessionStorage.removeItem("eventBookingData");
        sessionStorage.removeItem("eventBookingCab");
        sessionStorage.removeItem("eventBookingAddons");
        setBooking(response?.data?.data);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Initialize WebSocket connection
  useEffect(() => {
    // Wait for bookingId to be available (needed for topic)
    if (!bookingId) return;

    // Initialize WebSocket service
    const wsService = new WebSocketService();
    setWebSocketService(wsService);

    const topic = `/topic/${bookingId}`;

    // Callback for WebSocket messages
    const handleWebSocketMessage = (message) => {
      console.log("Received WebSocket message:", message);

      // Check if message is related to payment status update
      if (bookingId) {
        console.log("Payment status updated, refetching booking details");
        fetchBookingDetails(bookingId);
      }
    };

    // WebSocket connection options
    const wsOptions = {
      onConnectSuccess: () => {
        console.log("WebSocket connected successfully");
        setWebSocketConnected(true);
      },
      onConnectError: (error) => {
        console.error("WebSocket connection error:", error);
        setWebSocketConnected(false);
      },
    };

    // Connect to WebSocket
    wsService.connect(topic, handleWebSocketMessage, wsOptions);

    // Cleanup on unmount
    return () => {
      if (wsService) {
        wsService.disconnect();
      }
    };
  }, [bookingId]);

  // Fetch booking details when bookingId is available
  useEffect(() => {
    // If profile exists in query params or bookingId is available, fetch details
    if (profile || router.isReady) {
      fetchBookingDetails(bookingId);
    }
  }, [bookingId, profile, router.isReady]);

  // Show loader while waiting for bookingId (needed for WebSocket topic)
  if (!router.isReady || !bookingId) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading booking information...</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Fetching booking details...</p>
          {!webSocketConnected && (
            <p className="text-sm text-gray-500 mt-2">
              Connecting for real-time updates...
            </p>
          )}
        </div>
      </div>
    );
  }

  if (error || !booking) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md w-full text-center">
          <h2 className="text-xl font-semibold text-red-700 mb-2">Error</h2>
          <p className="text-red-600">{error || "Booking not found"}</p>
          <button
            onClick={() => router.push("/")}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
          >
            Return Home
          </button>
        </div>
      </div>
    );
  }

  // Get status badge color
  const getStatusColor = (status) => {
    switch (status) {
      case "success":
        return "bg-green-100 text-green-800 border-green-200";
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "failed":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  // Format check-in/out dates based on the string format
  const getEventDates = () => {
    if (!booking.stayDetails?.checkinDates)
      return { checkIn: "", checkOut: "" };

    const dates = booking.stayDetails.checkinDates;
    if (dates === "4-6") {
      return {
        checkIn: "4th July 2025, 2:00 PM",
        checkOut: "6th July 2025, 12:00 PM",
        nights: 2,
      };
    } else if (dates === "5-6") {
      return {
        checkIn: "5th July 2025, 2:00 PM",
        checkOut: "6th July 2025, 12:00 PM",
        nights: 1,
      };
    }
    return { checkIn: "", checkOut: "", nights: 0 };
  };

  const eventDates = getEventDates();

  // Check if transportation exists and has meaningful data
  const hasTransportation =
    booking.transportation?.airportTransfer ||
    booking.transportation?.flightBookingAssistance;

  // Check if accommodation options exist
  const hasAccommodationOptions =
    booking.stayDetails?.accommodationOptions?.length > 0;

  // Get event participation details
  const getEventParticipation = () => {
    const eventDay = booking.eventDetails?.eventDays?.selectedDay;
    if (!eventDay) return null;

    const eventDescriptions = {
      4: "4th July Event",
      5: "5th July Event",
      "4and5": "4th & 5th July Events",
      "5only": "5th July Event Only",
      6: "6th July Farewell Event",
    };

    return eventDescriptions[eventDay] || eventDay;
  };

  // Calculate if room price was discounted for sharing
  const isSharing =
    booking.stayDetails?.attendingWith === "Individual" &&
    booking.stayDetails?.individualRoomType === "Sharing room";

  // Check if booking has room combinations
  const hasRoomCombination =
    booking.stayDetails?.roomCombination &&
    Array.isArray(booking.stayDetails.roomCombination) &&
    booking.stayDetails.roomCombination.length > 1;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      <Head>
        <title>
          {booking.paymentStatus === "success"
            ? "Registration Confirmation"
            : "Payment Status"}{" "}
          | {booking.bookingId}
        </title>
        <meta
          name="description"
          content="Event registration confirmation details"
        />
      </Head>

      {/* <HeaderCommon /> */}
      <B2CHeader/>

      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white shadow-2xl rounded-2xl overflow-hidden">
          {/* Hero Section */}
          <div className="relative bg-gradient-to-r from-blue-600 to-blue-700 px-8 py-12">
            <div className="max-w-2xl">
              <div className=" flex-col sm:flex">
                <div>
                  <h1 className="text-2xl sm:text-4xl font-bold text-white mb-4">
                    {booking.paymentStatus === "success"
                      ? "Registration Confirmed!"
                      : booking.paymentStatus === "pending"
                      ? "Payment Processing"
                      : "Payment Failed"}
                  </h1>
                  <p className="text-lg sm:text-xl text-blue-100">
                    CIT-95 Pearl Jubilee Alumni Meet
                  </p>
                </div>
                <div className="sm:absolute sm:right-8 sm:top-8 bg-white/10 p-4 rounded-xl">
                  <p className="text-xs font-semibold text-blue-100 uppercase tracking-wide">
                    Registration ID
                  </p>
                  <p className="text-2xl font-bold text-white mt-1">
                    {booking.bookingId}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-4 mt-6">
                <span
                  className={`px-4 py-2 rounded-lg ${getStatusColor(
                    booking.paymentStatus
                  )}`}
                >
                  Payment {booking.paymentStatus.toUpperCase()}
                </span>
                {booking.paymentStatus === "pending" && (
                  <div className="bg-red-100 border border-red-200 p-2 rounded-lg">
                    <p className="text-red-700 text-sm">
                      ⚠️ Your payment will be refunded within 5-7 business days
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 p-4">
            {/* Left Column */}
            <div className="lg:col-span-2 space-y-8">
              {/* Personal Information */}
              <div className="bg-gray-50 rounded-xl p-4 shadow-sm">
                <div className="flex items-center mb-6">
                  <div className="bg-blue-100 p-3 rounded-lg">
                    <svg
                      className="w-6 h-6 text-blue-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                      />
                    </svg>
                  </div>
                  <h2 className="ml-4 text-2xl font-bold text-gray-900">
                    Personal Information
                  </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 bg-white rounded-lg border border-gray-200">
                    <p className="text-sm text-gray-600 mb-1">Full Name</p>
                    <p className="font-semibold text-gray-900">
                      {booking.personalInfo.fullName}
                    </p>
                  </div>
                  <div className="p-4 bg-white rounded-lg border border-gray-200">
                    <p className="text-sm text-gray-600 mb-1">Email</p>
                    <p className="font-semibold text-gray-900">
                      {booking.personalInfo.email}
                    </p>
                  </div>
                  <div className="p-4 bg-white rounded-lg border border-gray-200">
                    <p className="text-sm text-gray-600 mb-1">Phone</p>
                    <p className="font-semibold text-gray-900">
                      {booking.personalInfo.phone}
                    </p>
                  </div>
                  <div className="p-4 bg-white rounded-lg border border-gray-200">
                    <p className="text-sm text-gray-600 mb-1">Branch</p>
                    <p className="font-semibold text-gray-900">
                      {booking.personalInfo.branch}
                    </p>
                  </div>
                  {booking.personalInfo.city && (
                    <div className="p-4 bg-white rounded-lg border border-gray-200">
                      <p className="text-sm text-gray-600 mb-1">City</p>
                      <p className="font-semibold text-gray-900">
                        {booking.personalInfo.city}
                      </p>
                    </div>
                  )}
                  {booking.personalInfo.gender && (
                    <div className="p-4 bg-white rounded-lg border border-gray-200">
                      <p className="text-sm text-gray-600 mb-1">Gender</p>
                      <p className="font-semibold text-gray-900">
                        {booking.personalInfo.gender}
                      </p>
                    </div>
                  )}
                  {booking.personalInfo.tshirtSize && (
                    <div className="p-4 bg-white rounded-lg border border-gray-200">
                      <p className="text-sm text-gray-600 mb-1">T-shirt Size</p>
                      <p className="font-semibold text-gray-900">
                        {booking.personalInfo.tshirtSize}
                        {booking.personalInfo.gender === "Male" &&
                          booking.personalInfo.tshirtSize !== "XXL" &&
                          ` (${
                            booking.personalInfo.tshirtSize === "S"
                              ? "38"
                              : booking.personalInfo.tshirtSize === "M"
                              ? "40"
                              : booking.personalInfo.tshirtSize === "L"
                              ? "42"
                              : booking.personalInfo.tshirtSize === "XL"
                              ? "44"
                              : "46"
                          })`}
                        {booking.personalInfo.gender === "Male" &&
                          booking.personalInfo.tshirtSize === "XXL" &&
                          " (46)"}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Stay Details - Only show if staying at hotel */}
              {booking.stayDetails && (
                <div className="bg-gray-50 rounded-xl p-4 shadow-sm">
                  <div className="flex items-center mb-6">
                    <div className="bg-blue-100 p-3 rounded-lg">
                      <svg
                        className="w-6 h-6 text-blue-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                        />
                      </svg>
                    </div>
                    <h2 className="ml-4 text-2xl font-bold text-gray-900">
                      Accommodation Details
                    </h2>
                  </div>

                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="p-4 bg-white rounded-lg border border-gray-200">
                        <p className="text-sm text-gray-600 mb-1">Property</p>
                        <p className="font-semibold text-gray-900">
                          O by TAMARA Coimbatore
                        </p>
                      </div>
                      <div className="p-4 bg-white rounded-lg border border-gray-200">
                        <p className="text-sm text-gray-600 mb-1">
                          Room Category
                        </p>
                        <p className="font-semibold text-gray-900">
                          {booking.stayDetails.roomCategory}
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="p-4 bg-white rounded-lg border border-gray-200">
                        <p className="text-sm text-gray-600 mb-1">Check-in</p>
                        <p className="font-semibold text-gray-900">
                          {eventDates.checkIn}
                        </p>
                      </div>
                      <div className="p-4 bg-white rounded-lg border border-gray-200">
                        <p className="text-sm text-gray-600 mb-1">Check-out</p>
                        <p className="font-semibold text-gray-900">
                          {eventDates.checkOut}
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="p-4 bg-white rounded-lg border border-gray-200">
                        <p className="text-sm text-gray-600 mb-1">Occupancy</p>
                        <p className="font-semibold text-gray-900">
                          {booking.stayDetails.occupancyType}
                        </p>
                      </div>
                      <div className="p-4 bg-white rounded-lg border border-gray-200">
                        <p className="text-sm text-gray-600 mb-1">Rooms</p>
                        <p className="font-semibold text-gray-900">
                          {booking.stayDetails.roomsRequired}
                        </p>
                      </div>
                      <div className="p-4 bg-white rounded-lg border border-gray-200">
                        <p className="text-sm text-gray-600 mb-1">
                          Attending As
                        </p>
                        <p className="font-semibold text-gray-900">
                          {booking.stayDetails.attendingWith}
                          {booking.stayDetails.attendingWith === "Individual" &&
                            booking.stayDetails.individualRoomType && (
                              <span className="text-sm text-gray-600 block">
                                ({booking.stayDetails.individualRoomType})
                              </span>
                            )}
                        </p>
                      </div>
                    </div>

                    {/* Show family members if attending with family */}
                    {booking.stayDetails.attendingWith === "Family" &&
                      booking.stayDetails.familyMembers && (
                        <div className="p-4 bg-white rounded-lg border border-gray-200">
                          <p className="text-sm text-gray-600 mb-1">
                            Family Members
                          </p>
                          <p className="font-semibold text-gray-900">
                            {booking.stayDetails.familyMembers}
                          </p>
                        </div>
                      )}

                    {/* Show sharing room friend's name if provided */}
                    {booking.stayDetails.attendingWith === "Individual" &&
                      booking.stayDetails.individualRoomType ===
                        "Sharing room" &&
                      booking.stayDetails.sharingRemarks && (
                        <div className="p-4 bg-white rounded-lg border border-gray-200">
                          <p className="text-sm text-gray-600 mb-1">
                            Sharing Room With
                          </p>
                          <p className="font-semibold text-gray-900">
                            {booking.stayDetails.sharingRemarks}
                          </p>
                        </div>
                      )}

                    {/* Show sharing room discount info if applicable */}
                    {isSharing && (
                      <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                        <p className="text-sm text-blue-700">
                          <svg
                            className="w-4 h-4 inline mr-1"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                              clipRule="evenodd"
                            />
                          </svg>
                          Room sharing discount applied (50% off regular room
                          rate)
                        </p>
                      </div>
                    )}

                    {/* Room Combination - Show if multiple rooms booked */}
                    {hasRoomCombination && (
                      <div className="mt-4">
                        <h3 className="font-semibold text-gray-800 mb-3">
                          Room Combination
                        </h3>
                        <div className="space-y-3">
                          {booking.stayDetails.roomCombination.map(
                            (room, index) => (
                              <div
                                key={index}
                                className="p-4 bg-white rounded-lg border border-gray-200 flex justify-between"
                              >
                                <div>
                                  <p className="font-medium text-gray-900">
                                    Room {index + 1}: {room.category}
                                  </p>
                                  <p className="text-sm text-gray-600">
                                    Occupancy: {room.occupancyType}
                                  </p>
                                </div>
                                <span className="font-semibold text-blue-600">
                                  ₹{room.price}
                                </span>
                              </div>
                            )
                          )}
                          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200 flex justify-between">
                            <div>
                              <p className="font-medium text-blue-800">
                                Total per night
                              </p>
                            </div>
                            <span className="font-semibold text-blue-800">
                              ₹
                              {booking.stayDetails.roomCombination.reduce(
                                (sum, room) => sum + room.price,
                                0
                              )}
                            </span>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Accommodation Options if any */}
                    {hasAccommodationOptions && (
                      <div className="mt-6">
                        <h3 className="font-semibold text-gray-800 mb-3">
                          Additional Services
                        </h3>
                        <div className="space-y-3">
                          {booking.stayDetails.accommodationOptions.map(
                            (option, index) => (
                              <div
                                key={index}
                                className="p-4 bg-white rounded-lg border border-gray-200 flex justify-between"
                              >
                                <div>
                                  <p className="font-medium text-gray-900">
                                    {option.title}
                                  </p>
                                  <p className="text-sm text-gray-600">
                                    {option.description}
                                  </p>
                                </div>
                                <span className="font-semibold text-blue-600">
                                  + ₹{option.price}
                                </span>
                              </div>
                            )
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Event Details */}
              <div className="bg-gray-50 rounded-xl p-4 shadow-sm">
                <div className="flex items-center mb-6">
                  <div className="bg-blue-100 p-3 rounded-lg">
                    <svg
                      className="w-6 h-6 text-blue-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                  </div>
                  <h2 className="ml-4 text-2xl font-bold text-gray-900">
                    Event Participation
                  </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {getEventParticipation() && (
                    <div className="p-4 bg-white rounded-lg border border-gray-200">
                      <p className="text-sm text-gray-600 mb-1">Attending</p>
                      <p className="font-semibold text-gray-900">
                        {getEventParticipation()}
                      </p>
                    </div>
                  )}
                  {booking.eventDetails.memberCount && (
                    <div className="p-4 bg-white rounded-lg border border-gray-200">
                      <p className="text-sm text-gray-600 mb-1">
                        Number of Attendees
                      </p>
                      <p className="font-semibold text-gray-900">
                        {booking.eventDetails.memberCount}
                      </p>
                    </div>
                  )}
                  {!getEventParticipation() && !booking.stayDetails && (
                    <div className="p-4 bg-white rounded-lg border border-gray-200 col-span-2">
                      <p className="text-gray-600">
                        No specific event day selected
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Right Column */}
            <div className="lg:col-span-1 space-y-8">
              {/* Transportation - Show if any transport option is selected */}
              {hasTransportation && (
                <div className="bg-gray-50 rounded-xl p-6 shadow-sm">
                  <div className="flex items-center mb-6">
                    <div className="bg-blue-100 p-3 rounded-lg">
                      <svg
                        className="w-6 h-6 text-blue-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"
                        />
                      </svg>
                    </div>
                    <h2 className="ml-4 text-2xl font-bold text-gray-900">
                      Transportation
                    </h2>
                  </div>

                  <div className="space-y-4">
                    {booking.transportation.airportTransfer && (
                      <div className="p-4 bg-white rounded-lg border border-gray-200">
                        <p className="text-sm text-gray-600 mb-1">
                          Airport Transfer
                        </p>
                        <p className="font-semibold text-gray-900">
                          {booking.transportation.cabType ||
                            "Yes - Cab type not selected"}
                        </p>
                        {booking.transportation.flightNumber && (
                          <p className="text-sm text-gray-600 mt-2">
                            Flight: {booking.transportation.flightNumber}
                          </p>
                        )}
                        {booking.transportation.arrivalAirport && (
                          <p className="text-sm text-gray-600">
                            Airport: {booking.transportation.arrivalAirport}
                          </p>
                        )}
                      </div>
                    )}
                    {booking.transportation.flightBookingAssistance && (
                      <div className="p-4 bg-white rounded-lg border border-gray-200">
                        <p className="text-sm text-gray-600 mb-1">
                          Flight Booking Assistance
                        </p>
                        <p className="font-semibold text-gray-900">Requested</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Special Requests */}
              {booking.specialRequests && (
                <div className="bg-gray-50 rounded-xl p-6 shadow-sm">
                  <div className="flex items-center mb-4">
                    <div className="bg-blue-100 p-3 rounded-lg">
                      <svg
                        className="w-6 h-6 text-blue-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                        />
                      </svg>
                    </div>
                    <h2 className="ml-4 text-xl font-bold text-gray-900">
                      Special Requests
                    </h2>
                  </div>
                  <p className="text-gray-700">{booking.specialRequests}</p>
                </div>
              )}

              {/* Pricing Card */}
              <div className="bg-gray-50 rounded-xl p-6 shadow-sm">
                <div className="flex items-center mb-6">
                  <div className="bg-blue-100 p-3 rounded-lg">
                    <svg
                      className="w-6 h-6 text-blue-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"
                      />
                    </svg>
                  </div>
                  <h2 className="ml-4 text-2xl font-bold text-gray-900">
                    Payment Summary
                  </h2>
                </div>

                <div className="space-y-4">
                  {booking.pricing.roomCharges > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">
                        Room Charges ({eventDates.nights} nights)
                        {isSharing && (
                          <span className="text-xs block text-blue-600">
                            50% sharing discount applied
                          </span>
                        )}
                      </span>
                      <span>₹{booking.pricing.roomCharges.toFixed(2)}</span>
                    </div>
                  )}
                  {booking.pricing.dinnerCharges > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Cocktail Dinner</span>
                      <span>₹{booking.pricing.dinnerCharges.toFixed(2)}</span>
                    </div>
                  )}
                  {booking.pricing.eventCharges > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Event Registration</span>
                      <span>₹{booking.pricing.eventCharges.toFixed(2)}</span>
                    </div>
                  )}
                  {booking.pricing.accommodationCharges > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Additional Services</span>
                      <span>
                        ₹{booking.pricing.accommodationCharges.toFixed(2)}
                      </span>
                    </div>
                  )}
                  {booking.pricing.transportationCharges > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Transportation</span>
                      <span>
                        ₹{booking.pricing.transportationCharges.toFixed(2)}
                      </span>
                    </div>
                  )}
                  {booking.pricing.convenienceFee > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Convenience Fee</span>
                      <span>₹{booking.pricing.convenienceFee.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="pt-4 mt-3 border-t border-gray-300">
                    <div className="flex justify-between font-semibold text-lg">
                      <span>
                        Total{" "}
                        {booking.paymentStatus === "success"
                          ? "Paid"
                          : "Amount"}
                      </span>
                      <span
                        className={`${
                          booking.paymentStatus === "success"
                            ? "text-blue-600"
                            : "text-red-600"
                        }`}
                      >
                        ₹{booking.pricing.totalPrice.toFixed(2)}
                      </span>
                    </div>
                    {booking.paymentStatus === "success" ? (
                      <p className="text-right text-sm text-green-600 mt-1">
                        <svg
                          className="w-4 h-4 inline mr-1"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                        Payment Successful
                      </p>
                    ) : (
                      <p className="text-right text-sm text-red-600 mt-1">
                        <svg
                          className="w-4 h-4 inline mr-1"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                          />
                        </svg>
                        Payment Failed{" "}
                        {booking.paymentStatus === "pending" &&
                          " – Refund Initiated"}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="m-4">
            <TermsAndConditions />
            <div id="hotel-policy">
              <HotelPolicy />
            </div>
            <div id="cancellation-policy">
              <CancellationPolicy />
            </div>
          </div>

          {/* Footer CTA */}
          <div className="border-t bg-gray-50">
            <div className="max-w-4xl mx-auto px-8 py-12">
              {booking.paymentStatus === "success" ? (
                <>
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">
                    Ready for the Alumni Meet?
                  </h3>
                  <p className="text-gray-600 mb-8">
                    We{"'"}ve sent all details to your email. For any queries,
                    <br />
                    please contact the organizing committee.
                  </p>
                  <div className="flex flex-col sm:flex-row justify-center gap-4">
                    <button
                      onClick={() => window.print()}
                      className="px-6 py-3 bg-white border-2 border-blue-600 text-blue-600 rounded-xl hover:bg-blue-50 transition-all flex items-center justify-center"
                    >
                      <svg
                        className="w-5 h-5 mr-2"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"
                        />
                      </svg>
                      Download Confirmation
                    </button>
                    <button
                      onClick={() => router.push("/")}
                      className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all flex items-center justify-center"
                    >
                      Return to Homepage
                      <svg
                        className="w-5 h-5 ml-2"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M17 8l4 4m0 0l-4 4m4-4H3"
                        />
                      </svg>
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <h3 className="text-2xl font-bold text-red-700 mb-4">
                    Payment Not Completed
                  </h3>
                  <p className="text-gray-600 mb-8">
                    We{"'"}re unable to confirm your registration. Please check
                    your payment details or contact support.
                  </p>
                  <div className="flex flex-col sm:flex-row justify-center gap-4">
                    <button
                      onClick={() => router.push("/alumni/register")}
                      className="px-6 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-all"
                    >
                      Retry Payment
                    </button>
                    <button
                      onClick={() => router.push("/contact-support")}
                      className="px-6 py-3 bg-white border-2 border-red-600 text-red-600 rounded-xl hover:bg-red-50"
                    >
                      Contact Support
                    </button>
                  </div>
                </>
              )}
              <p className="mt-8 text-sm text-gray-500 text-center">
                © {new Date().getFullYear()} CIT-95 Pearl Jubilee Alumni Meet.
                Powered by WeynGo MICE.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingConfirmation;
