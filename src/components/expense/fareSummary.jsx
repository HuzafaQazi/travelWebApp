import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faInfoCircle } from "@fortawesome/free-solid-svg-icons";

export default function FareSummary() {
  // -------------------- 🔹 MOCK STATIC DATA -------------------- //
  const fareDetails = [
    { offeredFareRoundedOff: 5200, ssrFare: 300 },
    { offeredFareRoundedOff: 5200, ssrFare: 300 },
  ];

  const bookingSummary = {
    adults: 2,

    hotelFare: 4500,
    flightFare: 9500,
    cabFare: 1600,
    trainFare: 1200,
    busFare: 900,

    discount: 1000, // optional
  };

  const outOfPolicyTravelers = [
    {
      name: "John Doe",
      reasons: ["Exceeded allowed fare limit", "Preferred flight class upgrade"],
    },
  ];

  // Tooltip (optional)
  const [isTooltipOpen, setIsTooltipOpen] = useState(false);

  // ---------------------- 🔹 Calculations ---------------------- //

  const totalOffered = fareDetails.reduce(
    (sum, item) => sum + item.offeredFareRoundedOff,
    0
  );

  const offeredPerAdult = totalOffered / bookingSummary.adults;

  const totalSsrFare = fareDetails.reduce(
    (sum, item) => sum + (item.ssrFare || 0),
    0
  );

  const travelCost =
    bookingSummary.hotelFare +
    bookingSummary.flightFare +
    bookingSummary.cabFare +
    bookingSummary.trainFare +
    bookingSummary.busFare;

  const grandTotal = travelCost + totalSsrFare - bookingSummary.discount;

  // ---------------------- 🔹 Formatter ---------------------- //
  const formatPrice = (price) =>
    Number(price).toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

  return (
    <div className="border rounded-md p-4 space-y-2 bg-white">
      {/* HEADER */}
      <div className="flex items-center gap-2">
        <span className="font-bold text-base">Fare Summary</span>

        {outOfPolicyTravelers.length > 0 && (
          <span className="text-red-600 bg-red-100 px-2 py-1 text-xs rounded-md">
            Out of Policy
          </span>
        )}

        <FontAwesomeIcon
          icon={faInfoCircle}
          className="text-gray-500 cursor-pointer"
          onClick={() => setIsTooltipOpen(!isTooltipOpen)}
        />
      </div>

      {isTooltipOpen && (
        <div className="text-xs text-gray-600 bg-gray-100 p-2 rounded">
          Out-of-policy conditions detected for certain travelers.
        </div>
      )}

      {/* Breakdown */}
      <div className="text-sm space-y-1 pt-2">
        <div className="flex justify-between">
          <span>Adults {bookingSummary.adults} × ₹ {offeredPerAdult.toFixed(2)}</span>
          <span>₹ {formatPrice(totalOffered)}</span>
        </div>

        <div className="flex justify-between">
          <span>Special Services (SSR)</span>
          <span>₹ {formatPrice(totalSsrFare)}</span>
        </div>

        <div className="border-b my-2"></div>

        {/* Travel type pricing list */}

        <div className="flex justify-between">
          <span>Hotel Fare</span>
          <span>₹ {formatPrice(bookingSummary.hotelFare)}</span>
        </div>

        <div className="flex justify-between">
          <span>Flight Fare</span>
          <span>₹ {formatPrice(bookingSummary.flightFare)}</span>
        </div>

        <div className="flex justify-between">
          <span>Train Fare</span>
          <span>₹ {formatPrice(bookingSummary.trainFare)}</span>
        </div>

        <div className="flex justify-between">
          <span>Bus Fare</span>
          <span>₹ {formatPrice(bookingSummary.busFare)}</span>
        </div>

        <div className="flex justify-between">
          <span>Cab Fare</span>
          <span>₹ {formatPrice(bookingSummary.cabFare)}</span>
        </div>

        {bookingSummary.discount > 0 && (
          <div className="flex justify-between text-red-500 font-medium">
            <span>Discount</span>
            <span>- ₹ {formatPrice(bookingSummary.discount)}</span>
          </div>
        )}
      </div>

      {/* FINAL TOTAL */}
      <div className="mt-3 bg-[#028FA30F] p-3 rounded flex justify-between items-center text-[#028fa3] font-bold text-lg">
        <span>Total Payable</span>
        <span>₹ {formatPrice(grandTotal)}</span>
      </div>
    </div>
  );
}
