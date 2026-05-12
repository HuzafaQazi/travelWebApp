import React, { useState, useRef, useCallback } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faInfoCircle } from "@fortawesome/free-solid-svg-icons";

const OutOfPolicy = ({
  outOfPolicyTravelers = [],
  badgeClassName = "text-[#E53944] text-sm font-medium items-center bg-[#FBE2E3] rounded-lg w-fit px-2 py-1 flex gap-1 cursor-pointer",
}) => {
  const [tooltipState, setTooltipState] = useState({
    isOpen: false,
    position: "left-0",
  });
  const containerRef = useRef(null);
  const tooltipRef = useRef(null);

  const outOfPolicyCount = outOfPolicyTravelers.length;

  const calculatePosition = useCallback(() => {
    if (containerRef.current) {
      const containerRect = containerRef.current.getBoundingClientRect();
      const viewportWidth = window.innerWidth;
      const tooltipWidth = 288; // w-72 = 18rem = 288px

      // Check if tooltip would overflow on the right
      const wouldOverflow = containerRect.left + tooltipWidth > viewportWidth;
      return wouldOverflow ? "right-0" : "left-0";
    }
    return "left-0";
  }, []);

  const handleMouseEnter = () => {
    const position = calculatePosition();
    setTooltipState({ isOpen: true, position });
  };

  const handleMouseLeave = () => {
    setTooltipState({ isOpen: false, position: "left-0" });
  };

  if (outOfPolicyCount === 0) return null;

  return (
    <div
      className="relative inline-block"
      ref={containerRef}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div className={badgeClassName}>
        <FontAwesomeIcon icon={faInfoCircle} className="text-xxs md:text-sm" />
        <span className="text-xxxs md:text-xs text-nowrap">Out Of Policy</span>
      </div>
      {tooltipState.isOpen && (
        <div
          ref={tooltipRef}
          className={`absolute top-full text-left ${tooltipState.position} mt-1 p-3 w-72 bg-white border border-gray-200 shadow-lg rounded-md z-50 text-[#000000]`}
        >
          <div className="text-sm font-semibold mb-1">
            {outOfPolicyCount} traveler{outOfPolicyCount > 1 ? "s" : ""} out of
            policy
          </div>
          <ul className="list-disc list-inside space-y-1">
            {outOfPolicyTravelers.map((trav, tIdx) => (
              <li key={tIdx} className="text-xs">
                <span className="font-medium">{trav.name}</span>
                {Array.isArray(trav.reasons) && trav.reasons.length > 0 && (
                  <ul className="pl-4 list-disc mt-1">
                    {trav.reasons.map((reason, rIdx) => (
                      <li key={rIdx} className="text-gray-600">
                        {reason}
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default OutOfPolicy;
