import { faInfoCircle } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useState } from "react";
import OutOfPolicy from "./OutOfPolicy";

/**
 * FareSummary component
 *
 * @param {Object[]} fareDetails - array of fare items, each containing offeredFareRoundedOff, ssrFare, etc.
 * @param {number}   adults      - total number of adult travelers
 * @param {Function} setSsrFare  - callback to update SSR fare in parent
 * @param {Function} setTotalAmount - callback to update total fare amount in parent
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
  setSsrFare,
  setTotalAmount,
  outOfPolicyTravelers = [],
}) {
  // Local state to show/hide the tooltip
  const [isTooltipOpen, setIsTooltipOpen] = useState(false);

  // 1) Calculate all adult fare
  const totalOffered = fareDetails.reduce(
    (sum, item) => sum + (item.offeredFareRoundedOff || 0),
    0
  );
  const offeredPerAdult = adults ? totalOffered / adults : 0;

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

  // Number of out-of-policy travelers
  const outOfPolicyCount = outOfPolicyTravelers.length;

  return (
    <div>
      {/* Title row + potential OOP badge */}
      <div className="flex gap-2 items-center">
        <div className="font-bold">Fare summary</div>

        <OutOfPolicy
          outOfPolicyTravelers={outOfPolicyTravelers}
          badgeClassName="text-[#E53944] text-sm font-medium items-center bg-[#FBE2E3] rounded-lg w-fit px-2 py-1 flex gap-1 cursor-pointer"
        />
      </div>

      {/* Fare Breakdown */}
      <div className="p-2 flex w-full justify-between mt-2 text-xs sm:text-sm font-medium text-[#000000]">
        <div>
          Adults {adults} x {offeredPerAdult.toFixed(2)}
        </div>
        <div>Rs. {formatPrice(totalOffered)}</div>
      </div>

      <div className="p-2 flex w-full justify-between mt-0 text-xs sm:text-sm font-medium text-[#000000]">
        <div>Special Services</div>
        <div>Rs. {formatPrice(ssrFare)}</div>
      </div>

      <div className="p-2 py-3 flex w-full justify-between mt-1 rounded-md text-base sm:text-lg bg-[#155EEF0F] text-[#155EEF]">
        <div className="font-semibold">Price</div>
        <div>Rs. {formatPrice(totalFare)}</div>
      </div>
    </div>
  );
}
