import React from "react";
import { formatPrice } from "@/utils/common";

const BookingSummary = ({
  bookingData,
  priceBreakdown,
  onAccommodationRemove,
  onSubmit,
  loading,
  selectedRoomCombination, // New prop to receive the selected room combination
}) => {
  const handlePayment = async () => {
    await onSubmit();
  };

  const handleRemoveAccommodation = (accommodationId) => {
    if (onAccommodationRemove) {
      onAccommodationRemove(accommodationId);
    }
  };

  if (!bookingData || !priceBreakdown) {
    return null;
  }

  // Parse dates for check-in/checkout display
  const getCheckInDate = () => {
    if (bookingData.checkinDates === "4-6") {
      return new Date("2025-07-04");
    } else if (bookingData.checkinDates === "5-6") {
      return new Date("2025-07-05");
    }
    return new Date("2025-07-04");
  };

  const checkInDate = getCheckInDate();
  const checkOutDate = new Date("2025-07-06");
  const nights = bookingData.checkinDates === "4-6" ? 2 : 1;
  const memberCount = bookingData.familyMembers;

  // Format date display to match original
  const formatDate = (dateInput) => {
    const istDate = new Date(dateInput).toLocaleString("en-US", {
      timeZone: "Asia/Kolkata",
    });

    const date = new Date(istDate);

    const months = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];
    const weekdays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

    return {
      day: date.getDate().toString(),
      month: months[date.getMonth()],
      weekday: weekdays[date.getDay()],
    };
  };

  const checkin = formatDate(checkInDate);
  const checkout = formatDate(checkOutDate);
  const roomName = bookingData.roomCategory || "Room";
  const basePrice = priceBreakdown.roomCharges;

  // Calculate subtotal excluding convenience fee
  const subtotal =
    (priceBreakdown.roomCharges || 0) +
    (priceBreakdown.dinnerCharges || 0) +
    (priceBreakdown.eventCharges || 0) +
    (priceBreakdown.accommodationCharges || 0) +
    (priceBreakdown.transportationCharges || 0);

  // Grand total includes convenience fee
  const convenienceFee = priceBreakdown.convenienceFee || 0;
  const grandTotal = subtotal + convenienceFee;

  // Check if there's a multi-room combination selected
  const hasRoomCombination =
    bookingData.attendingWith === "Family" &&
    parseInt(bookingData.roomsRequired) > 1 &&
    selectedRoomCombination &&
    selectedRoomCombination.rooms &&
    selectedRoomCombination.rooms.length > 1;

  return (
    <div className="w-full lg:max-w-md xl:max-w-lg 2xl:max-w-xl bg-white p-6 rounded-lg h-fit shadow-md border">
      <div className="text-center text-lg font-bold">Booking Summary</div>

      {bookingData.radissonStay === "Yes" && (
        <div className="flex justify-between items-center mt-4">
          <div className="text-center">
            <div className="text-sm font-semibold">Check-in</div>
            <div className="text-xl font-bold">
              {checkin.day} {checkin.month}
            </div>
            <div className="text-sm text-gray-500">
              {checkin.weekday} | 11:00 am
            </div>
          </div>
          <div className="text-sm text-gray-500">
            {nights} {nights === 1 ? "night" : "nights"}
          </div>
          <div className="text-sm text-gray-500">
            {" "}
            {bookingData.attendingWith === "Family"
              ? bookingData.familyMembers || 1
              : 1}{" "}
            {bookingData.attendingWith === "Family"
              ? (bookingData.familyMembers || 1) === 1
                ? "Participant"
                : "Participants"
              : "Participant"}
          </div>
          <div className="text-center">
            <div className="text-sm font-semibold">Check-out</div>
            <div className="text-xl font-bold">
              {checkout.day} {checkout.month}
            </div>
            <div className="text-sm text-gray-500">
              {checkout.weekday} | 12:00 pm
            </div>
          </div>
        </div>
      )}

      {bookingData.radissonStay !== "Yes" && (
        <div className="flex justify-center items-center mt-4">
          <div className="text-center">
            {bookingData.memberCount}{" "}
            {Number(bookingData.memberCount) === 1
              ? "participant"
              : "participants"}
          </div>
        </div>
      )}

      <div className="mt-4 border-t pt-4">
        {bookingData.radissonStay === "Yes" && (
          <>
            {/* If a multi-room combination is selected, show all rooms */}
            {hasRoomCombination ? (
              <div className="mb-2">
                <div className="font-medium mb-2">Room Combination:</div>
                {selectedRoomCombination.rooms.map((room, index) => (
                  <div key={index} className="bg-gray-200 p-2 rounded mb-2">
                    <div className="flex justify-between">
                      <div>
                        Room {index + 1}: {room.category} ({room.occupancyType})
                      </div>
                    </div>
                    <div className="text-right font-semibold whitespace-nowrap">
                      INR {formatPrice(room.price)}
                    </div>
                  </div>
                ))}
                <div className="bg-gray-100 p-2 rounded">
                  <div className="flex justify-between">
                    <div className="font-medium">Total Per Night:</div>
                    <div className="font-semibold">
                      INR {formatPrice(selectedRoomCombination.totalPrice)}
                    </div>
                  </div>
                  <div className="flex justify-between text-sm text-gray-600">
                    <div>For {nights} nights:</div>
                    <div>
                      INR{" "}
                      {formatPrice(selectedRoomCombination.totalPrice * nights)}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              // Single room display
              bookingData.roomCategory && (
                <div className="bg-gray-200 p-2 rounded">
                  <div className="flex justify-between mb-2">
                    <div className="font-medium">
                      Room Type: {roomName} ({bookingData.occupancyType})
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="text-gray-700">Price per night:</div>
                    <div className="font-semibold">
                      INR {formatPrice(basePrice / nights)}
                    </div>
                  </div>
                  <div className="flex justify-between items-center mt-1">
                    <div className="text-gray-700">
                      Total for {nights} {nights === 1 ? "night" : "nights"}:
                    </div>
                    <div className="font-semibold">
                      INR {formatPrice(basePrice)}
                    </div>
                  </div>
                </div>
              )
            )}
          </>
        )}

        {bookingData.accommodationOptions &&
          bookingData.accommodationOptions.map((addon) => (
            <div key={addon.id} className="bg-gray-200 p-2 rounded mt-2">
              <div className="flex justify-between">
                <div>{addon.title}</div>
                <div
                  className="text-red-600 font-bold cursor-pointer"
                  onClick={() => handleRemoveAccommodation(addon.id)}
                >
                  REMOVE
                </div>
              </div>
              <div className="text-right font-semibold">
                INR {addon.price.toFixed(2)}
              </div>
            </div>
          ))}

        {/* Event Registration */}
        {priceBreakdown.eventCharges > 0 && (
          <div className="bg-gray-200 p-2 rounded mt-2">
            <div className="flex justify-between">
              <div>Event Registration</div>
              <div className="text-gray-500 font-medium"></div>
            </div>
            <div className="text-right font-semibold">
              INR {formatPrice(priceBreakdown.eventCharges.toFixed(2))}
            </div>
          </div>
        )}

        {/* Dinner Charges */}
        {priceBreakdown.dinnerCharges > 0 && (
          <div className="bg-gray-200 p-2 rounded mt-2">
            <div className="flex justify-between">
              <div>Cocktail Dinner</div>
              <div className="text-gray-500 font-medium"></div>
            </div>
            <div className="text-right font-semibold">
              INR {formatPrice(priceBreakdown.dinnerCharges.toFixed(2))}
            </div>
          </div>
        )}

        {/* Transportation */}
        {priceBreakdown.transportationCharges > 0 && bookingData.cabType && (
          <div className="bg-gray-200 p-2 rounded mt-2">
            <div className="flex justify-between">
              <div>{bookingData.cabType} Airport Transfer</div>
              <div className="text-gray-500 font-medium">
                (Managed in transfer section)
              </div>
            </div>
            <div className="text-right font-semibold">
              INR {formatPrice(priceBreakdown.transportationCharges.toFixed(2))}
            </div>
          </div>
        )}
      </div>

      <div className="mt-4 border-t pt-4">
        <div className="flex justify-between font-semibold">
          <div>Subtotal</div>
          <div>INR {formatPrice(subtotal.toFixed(2))}</div>
        </div>
        <div className="flex justify-between text-gray-700">
          <div>Estimated additional fees</div>
          <div>INR 0.00</div>
        </div>
        <div className="flex justify-between text-gray-700">
          <div>Payment Gateway Charges:</div>
          <span>
            INR {formatPrice(priceBreakdown.convenienceFee?.toFixed(2))}
          </span>
        </div>
      </div>

      <div className="mt-4 text-lg font-bold flex justify-between">
        <div>Total price</div>
        <div>INR {formatPrice(grandTotal.toFixed(2))}</div>
      </div>

      <div className="mt-4">
        <button
          onClick={handlePayment}
          disabled={loading}
          className={`w-full bg-[#028fa3] text-white py-2 rounded text-lg font-semibold ${
            loading ? "opacity-70 cursor-not-allowed" : ""
          }`}
        >
          {loading ? "PROCESSING..." : "CONTINUE BOOKING"}
        </button>
      </div>
    </div>
  );
};

export default BookingSummary;
