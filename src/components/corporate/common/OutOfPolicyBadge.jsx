// OutOfPolicyBadge.jsx
import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faInfoCircle } from "@fortawesome/free-solid-svg-icons";

/**
 * OutOfPolicyBadge - Renders a pill + tooltip if out-of-policy reasons exist
 *
 * @param {string[]} reasons - array of out-of-policy reason strings
 * @param {boolean} showTravelerNameInTooltip - if we also want to show the name
 * @param {string} travelerName - optional name (only used if showTravelerNameInTooltip = true)
 */
export default function OutOfPolicyBadge({
  reasons,
  showTravelerNameInTooltip,
  travelerName,
}) {
  if (!reasons?.length) return null;

  return (
    <div className="relative group inline-block">
      <div className="text-[#E53944] text-xxxs sm:text-xxs font-medium bg-[#FBE2E3] rounded-lg w-fit px-2 py-1 flex gap-1 items-center group-hover:cursor-pointer">
        <FontAwesomeIcon icon={faInfoCircle} />
        <span>Out Of Policy</span>
      </div>

      {/* Tooltip on hover */}
      <div
        className="hidden group-hover:block absolute left-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg p-3 w-64 z-50"
        style={{ whiteSpace: "pre-wrap" }}
      >
        {showTravelerNameInTooltip && travelerName ? (
          <div className="font-semibold mb-1">{travelerName}</div>
        ) : null}
        <div className="space-y-2">
          {reasons.map((reason, index) => (
            <div key={index} className="flex items-start text-sm text-gray-600">
              <span className="text-[#E53944] mr-2">•</span>
              <span>{reason}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
