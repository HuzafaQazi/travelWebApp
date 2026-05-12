import { useState } from "react";

/**
 * FareSummary component
 *
 * @param {Object[]} fareDetails - array of fare items, each containing offeredFareRoundedOff, ssrFare, etc.
 * @param {number}   adults      - total number of adult travelers
 * @param {number}   child    - total number of child travelers
 * @param {number}   infants     - total number of infant travelers
 * @param {Function} setSsrFare  - callback to update SSR fare in parent
 * @param {Function} setTotalAmount - callback to update total fare amount in parent
 * @param {Object[]} travelers   - array of traveler objects
 * @param {Object[]} outOfPolicyTravelers - optional: array of travelers out of policy
 *                 Each traveler object can look like:
 *                 {
 *                   name: "John Doe",
 *                   reasons: ["Cabin class exceeded limit", "Budget exceeded"]
 *                 }
 *
 */
export default function FareSummary({
  fareDetails,
  adults,
  child,
  infants,
  setSsrFare,
  setTotalAmount,
  travelers,
}) {
  // Local state to show/hide the tooltip
  const [isTooltipOpen, setIsTooltipOpen] = useState(false);

  console.log("the travelers are", travelers);
  // 1) Calculate total fare for all travelers
  const totalOffered = fareDetails.reduce(
    (sum, item) => sum + (item.offeredFareRoundedOff || 0),
    0
  );
  const totalTravelers = (adults || 0) + (child || 0) + (infants || 0); // Total number of travelers
  const offeredPerTraveler = totalTravelers ? totalOffered / totalTravelers : 0;

  // 2) SSR fare
  const ssrFare = fareDetails?.[0]?.ssrFare ?? 0;

  // 3) Final total fare
  const totalFare = totalOffered + ssrFare;

  // Bubble up to parent
  if (typeof setSsrFare === "function") {
    setSsrFare(ssrFare);
  }
  if (typeof setTotalAmount === "function") {
    setTotalAmount(totalFare);
  }

  // Format price for readability
  const formatPrice = (price) => {
    const priceStr = price.toFixed(2).toString();
    const [integerPart, decimalPart] = priceStr.split(".");
    const lastThree = integerPart.slice(-3);
    const rest = integerPart.slice(0, -3);

    const formatted =
      rest.replace(/\B(?=(\d{2})+(?!\d))/g, ",") +
      (rest ? "," : "") +
      lastThree;

    return decimalPart ? `${formatted}.${decimalPart}` : formatted;
  };
  return (
    <div>
      {/* Title row + potential OOP badge */}
      <div className="flex gap-2 items-center">
        <div className="font-bold">Fare summary</div>
      </div>

      {/* Fare Breakdown */}
      <div className="p-2 flex w-full justify-between mt-2 text-xs sm:text-sm font-medium text-[#000000]">
        <div>
          Travelers {totalTravelers} x {offeredPerTraveler.toFixed(2)}
        </div>
        <div>Rs. {formatPrice(totalOffered)}</div>
      </div>

      <div className="p-2 flex w-full justify-between mt-0 text-xs sm:text-sm font-medium text-[#000000]">
        <div>Special Services</div>
        <div>Rs. {formatPrice(ssrFare)}</div>
      </div>

      <div className="p-2 py-3 flex w-full justify-between mt-1 rounded-md text-base sm:text-lg bg-[#028FA30F] text-[#028fa3]">
        <div className="font-semibold">Price</div>
        <div>Rs. {formatPrice(totalFare)}</div>
      </div>
    </div>
  );
}
