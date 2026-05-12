import { useState, useRef, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faXmarkCircle,
  faSuitcase,
  faExclamationTriangle,
  faInfoCircle,
  faDollarSign,
  faClock,
  faSpinner,
} from "@fortawesome/free-solid-svg-icons";
import style from "./style.module.css";

const FareRule = ({ isOpen, onClose, fareRules, isLoading }) => {
  const [activeTab, setActiveTab] = useState(0);
  const popupRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (popupRef.current && !popupRef.current.contains(event.target)) {
        onClose(); // Close the popup
      }
    };

    if (isOpen && !isLoading) {
      // Only add the event listener if the popup is open and not loading
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      // Cleanup the event listener on unmount or when conditions change
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, isLoading, onClose]);

  if (!isOpen) return null;

  // Function to replace all instances of \r\n with <br> tags
  const formatFareRuleDetail = (detail) => {
    return detail.replace(/\r\n/g, "<br />");
  };

  const getIconForTitle = (title) => {
    const lowercaseTitle = title.toLowerCase();
    if (lowercaseTitle.includes("baggage")) return faSuitcase;
    if (
      lowercaseTitle.includes("penalty") ||
      lowercaseTitle.includes("fee") ||
      lowercaseTitle.includes("cancel")
    )
      return faExclamationTriangle;
    if (lowercaseTitle.includes("fare")) return faDollarSign;
    if (lowercaseTitle.includes("time") || lowercaseTitle.includes("date"))
      return faClock;
    return faInfoCircle;
  };

  return (
    <>
      <div className="fixed inset-0 bg-gray-300 bg-opacity-2 flex items-center justify-center z-[9999999999]">
        <div
          className="bg-white w-full h-fit max-w-2xl p-6 rounded-lg relative z-[9999999999999]"
          ref={popupRef}
        >
          {isLoading ? (
            <></>
          ) : (
            <button
              className="absolute top-2 right-6 text-gray-400 hover:text-gray-600 mb-2"
              onClick={onClose}
            >
              <FontAwesomeIcon icon={faXmarkCircle} className="text-lg" />
            </button>
          )}

          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <FontAwesomeIcon
                icon={faSpinner}
                spin
                className="text-2xl text-[#028FA3]"
              />
            </div>
          ) : fareRules?.length === 0 ? (
            <>
              <div className="flex items-center justify-center h-full bg-gray-100">
                <div className="text-center p-8 bg-white rounded-lg shadow-md max-w-md w-full m-[10%]">
                  <div className="text-blue-500 text-5xl mb-4">
                    <FontAwesomeIcon icon={faInfoCircle} />
                  </div>
                  <h2 className="text-2xl font-bold text-blue-600 mb-2">
                    No Data
                  </h2>
                  <p className="text-gray-600">No fare rule data available</p>
                </div>
              </div>
            </>
          ) : (
            <>
              <div>
                {fareRules?.length > 1 && (
                  <div className="flex gap-5 mb-1">
                    {fareRules.map((rule, index) => (
                      <button
                        key={index}
                        className={`text-lg font-semibold cursor-pointer ${
                          activeTab === index
                            ? "text-[#028FA3] border-b-2 border-[#028FA3]"
                            : "text-[#878786]"
                        }`}
                        onClick={() => setActiveTab(index)}
                      >
                        {rule.origin} - {rule.destination}
                      </button>
                    ))}
                  </div>
                )}

                <div className={style.mainContainer}>
                  {fareRules?.map((rule, index) =>
                    activeTab === index ? (
                      <div key={index} className="block w-full mb-4">
                        {rule?.fareInclusions?.length > 0 && (
                          <>
                            <div className="bg-gray-100 p-3 rounded-md mb-3">
                              <div className="text-base text-[#828282] font-semibold">
                                Fare Inclusions/ Benefits
                              </div>
                            </div>

                            <div className="p-3 border border-[#82828250] rounded-md mb-4">
                              <div className="border-b border-[#82828250] pb-2 mb-2">
                                <div className="text-[#028FA3] text-base font-medium">
                                  {rule.airline}: {rule.origin} -{" "}
                                  {rule.destination}
                                </div>
                              </div>

                              <div className="grid grid-cols-2 gap-3 text-sm text-gray-700">
                                {rule.fareInclusions.map((inclusion, idx) => (
                                  <div
                                    key={idx}
                                    className="text-[#828282] text-sm font-normal"
                                  >
                                    {inclusion}
                                  </div>
                                ))}
                              </div>
                            </div>
                          </>
                        )}

                        <div className="p-3 w-full border border-[#82828250] rounded-md">
                          <div className="text-[#028FA3] text-base font-medium mb-2">
                            {rule.airline}: {rule.origin} - {rule.destination}
                          </div>
                          <div className="text-base text-[#828282] font-semibold mb-2">
                            The FareBasisCode is:{" "}
                            <span className="font-medium">
                              {rule.fareBasisCode}
                            </span>
                          </div>
                          <div
                            className="text-sm text-[#828282] whitespace-pre-wrap"
                            dangerouslySetInnerHTML={{
                              __html: formatFareRuleDetail(rule.fareRuleDetail),
                            }}
                          />
                        </div>
                      </div>
                    ) : null
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default FareRule;
