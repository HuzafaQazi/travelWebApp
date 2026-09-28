import { useState, useRef, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faXmarkCircle, faSpinner } from "@fortawesome/free-solid-svg-icons";

const FareRule = ({ isOpen, onClose, fareRules, isLoading }) => {
  const [activeTab, setActiveTab] = useState(0);
  const contentRef = useRef(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const [shouldShowButton, setShouldShowButton] = useState(false);
  const popupRef = useRef(null);

  useEffect(() => {
    setIsExpanded(false);

    // Use setTimeout to ensure DOM has updated
    const checkOverflow = () => {
      if (contentRef.current) {
        const element = contentRef.current;
        // Compare scrollHeight with clientHeight
        const hasOverflow = element.scrollHeight > element.clientHeight;
        setShouldShowButton(hasOverflow);
      }
    };

    // Small delay to ensure DOM is rendered
    const timer = setTimeout(checkOverflow, 0);

    return () => clearTimeout(timer);
  }, [activeTab, fareRules]);

  // useEffect(() => {
  //   const handleClickOutside = (event) => {
  //     if (popupRef.current && !popupRef.current.contains(event.target)) {
  //       onClose();
  //     }
  //   };

  //   document.addEventListener("mousedown", handleClickOutside);
  //   return () => document.removeEventListener("mousedown", handleClickOutside);
  // }, [onClose]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      // ✅ Don't close if clicking the fare toggle button
      const isFareToggleButton = event.target.closest(
        '[data-fare-toggle="true"]',
      );

      if (
        popupRef.current &&
        !popupRef.current.contains(event.target) &&
        !isFareToggleButton
      ) {
        onClose();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onClose]);

  if (!isOpen) return null;

  const formatFareRuleDetail = (detail = "") =>
    detail.replace(/\r\n/g, "<br />");

  return (
    <div
      ref={popupRef}
      className="right-0 mt-2 w-full bg-white border border-gray-200 rounded-lg shadow-xl"
    >
      {/* Header */}
      {/* <div className="flex justify-between items-center px-4 py-2 border-b">
        <span className="font-semibold text-gray-700">Fare Rules</span>
        <button onClick={onClose}>
          <FontAwesomeIcon icon={faXmarkCircle} />
        </button>
      </div> */}

      {/* Body */}
      <div className="max-h-[400px] overflow-y-auto p-4">
        {isLoading ? (
          <div className="flex justify-center py-10">
            <FontAwesomeIcon
              icon={faSpinner}
              spin
              className="text-xl text-[#155EEF]"
            />
          </div>
        ) : fareRules?.length === 0 ? (
          <p className="text-gray-500 text-center">
            No fare rule data available
          </p>
        ) : (
          <>
            {/* Tabs */}
            {fareRules?.length > 1 && (
              <div className="flex gap-4 mb-4">
                {fareRules.map((rule, index) => (
                  <button
                    key={index}
                    className={`text-sm font-medium ${
                      activeTab === index
                        ? "text-[#155EEF] border-b-2 border-[#155EEF]"
                        : "text-gray-400"
                    }`}
                    onClick={() => setActiveTab(index)}
                  >
                    {rule.origin} - {rule.destination}
                  </button>
                ))}
              </div>
            )}

            {/* Content */}
            {fareRules.map(
              (rule, index) =>
                activeTab === index && (
                  <div key={index} className="space-y-4">
                    {/* Fare Inclusions */}
                    {rule?.fareInclusions?.length > 0 && (
                      <div className="border border-gray-200 rounded-md p-3">
                        <div className="text-[#155EEF] font-medium mb-2">
                          Fare Inclusions / Benefits
                        </div>
                        <div className="grid grid-rows-2 sm:grid-cols-2 gap-2 text-xxs sm:text-sm text-gray-600">
                          {rule.fareInclusions.map((item, idx) => (
                            <div key={idx}>• {item}</div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Fare Exclusions (if available) */}
                    {rule?.fareExclusions?.length > 0 && (
                      <div className="border border-gray-200 rounded-md p-3">
                        <div className="text-red-500 font-medium mb-2">
                          Fare Exclusions
                        </div>
                        <div className="grid grid-rows-2 sm:grid-cols-2 gap-2 text-xxs sm:text-sm text-gray-600">
                          {rule.fareExclusions.map((item, idx) => (
                            <div key={idx}>• {item}</div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Fare Rule Details */}
                    <div className="border border-gray-200 rounded-md p-3">
                      <div className="text-[#155EEF] font-medium mb-1">
                        {rule.airline}: {rule.origin} - {rule.destination}
                      </div>

                      <div className="text-xs sm:text-sm text-gray-700 mb-2">
                        <strong>Fare Basis:</strong> {rule.fareBasisCode}
                      </div>

                      {/* <div
                        className="text-xxs sm:text-sm text-gray-600 whitespace-pre-wrap"
                        dangerouslySetInnerHTML={{
                          __html: formatFareRuleDetail(rule.fareRuleDetail),
                        }}
                      /> */}
                      <div className="relative">
                        <div
                          ref={contentRef}
                          className={`text-xxs sm:text-sm text-gray-600 whitespace-pre-wrap overflow-hidden transition-all duration-300 ${
                            !isExpanded ? "line-clamp-5" : ""
                          }`}
                          dangerouslySetInnerHTML={{
                            __html: formatFareRuleDetail(rule.fareRuleDetail),
                          }}
                        />

                        {/* Gradient fade effect when collapsed */}
                        {/* {!isExpanded && shouldShowButton && (
                          <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-white to-transparent pointer-events-none" />
                        )} */}

                        {/* View More/Less Button - only show if content overflows */}
                        {shouldShowButton && (
                          <button
                            onClick={() => setIsExpanded(!isExpanded)}
                            className="mt-2 text-[#155EEF] hover:text-[#026d7d] text-xs sm:text-sm font-semibold transition-colors"
                          >
                            {isExpanded ? "▲ View Less" : "▼ View More"}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ),
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default FareRule;
