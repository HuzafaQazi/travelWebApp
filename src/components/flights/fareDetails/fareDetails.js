import { useEffect, useState } from "react";
import style from "./styles.module.css";
import { logEvent } from "firebase/analytics";
import { analytics } from "../../../../utils/firebase";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import FareRules from "./fareRules/FareRules";
import axios, { getTabSpecificData } from "@/utils/axios/axios";
import config from "@/config";
import showToast from "@/utils/toast";
import { faRegistered } from "@fortawesome/free-regular-svg-icons";

const FareDetails = ({
  onClose,
  handleTabClick,
  fareDetails,
  index,
  handleSelectButtonClick,
  selectButtonLoader,
  selectedButtonIndex,
  type,
  selectedFlight,
  setSelectedFlight,
  setCheckboxIndex,
  setIsClicked,
  destinationIndex,
  handleDivClick1,
  isInternational,
  qTraceId,
  setSelectedIndex,
}) => {
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [selectedFare, setSelectedFare] = useState(null);
  const [fareRuleData, setFareRuleData] = useState({});
  const [loadingFareRules, setLoadingFareRules] = useState(false);

  const closePopup = () => {
    setIsPopupOpen(false);
  };

  const handleSelectButtonClickParent = async (data, index) => {
    const updatedDetails = {
      fare: data,
      resultIndex: data.resultIndex,
    };
    await handleSelectButtonClick(updatedDetails, index);
    logEvent(analytics, "fare_select_button", {});
  };

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "visible";
    };
  }, []);

  const setSegmentData = async (data) => {
    if (type === "multicity") {
      const updatedData = {
        ...fareDetails,
        resultIndex: data.resultIndex,
        fare: {
          commission: data.commission,
          commissionTax: data.commissionTax,
          currency: data.currency,
          offeredFare: data.offeredFare,
          offeredFareRoundedOff: data.offeredFareRoundedOff,
          taxPercentage: data.taxPercentage,
          resultIndex: data.resultIndex,
        },
        segments: data.segments,
      };
      setSelectedFlight((prevDestinationData) => {
        const updatedDestinationData = [...prevDestinationData];
        updatedDestinationData[destinationIndex].selectedIndex = index;
        updatedDestinationData[destinationIndex].selectedFlight = updatedData;
        return updatedDestinationData;
      });
    } else if (type === "return") {
      const updatedData = {
        resultIndex: data.resultIndex,
        fare: {
          commission: data.commission,
          commissionTax: data.commissionTax,
          currency: data.currency,
          offeredFare: data.offeredFare,
          offeredFareRoundedOff: data.offeredFareRoundedOff,
          taxPercentage: data.taxPercentage,
        },
        segments: data.segments,
      };
      setSelectedFlight((prev) => ({ ...prev, ...updatedData }));
      setCheckboxIndex(index);
      setIsClicked(true);
    } else {
      const updatedData = {
        resultIndex: data.resultIndex,
        fare: {
          commission: data.commission,
          commissionTax: data.commissionTax,
          currency: data.currency,
          offeredFare: data.offeredFare,
          offeredFareRoundedOff: data.offeredFareRoundedOff,
          taxPercentage: data.taxPercentage,
        },
        segments: data.segments,
      };
      setSelectedFlight(updatedData);
      setCheckboxIndex(index);
      setIsClicked(true);
      if (type !== "multicity" && isInternational) {
        await handleDivClick1(updatedData, index);
      }
    }

    logEvent(analytics, "fare_select", {});
    onClose();
  };

  const renderSelectButtonContents = (option, updatedIndex) => {
    if (type === "oneway") {
      return (
        <button
          onClick={() => handleSelectButtonClickParent(option, updatedIndex)}
          className={style.FareDetailsSelectBtn}
          disabled={selectButtonLoader}
        >
          {selectButtonLoader && selectedButtonIndex === updatedIndex ? (
            <div className="loadingSpinner"></div>
          ) : (
            "Select"
          )}
        </button>
      );
    } else if (type === "return") {
      return (
        <button
          onClick={() => setSegmentData(option)}
          className={`${style.FareDetailsSelectBtn} ${
            selectedFlight?.resultIndex === option.resultIndex
              ? style.selectedbtn
              : ""
          }`}
          disabled={selectedFlight?.resultIndex === option.resultIndex}
        >
          {selectedFlight?.resultIndex === option.resultIndex
            ? "Selected"
            : "Select"}
        </button>
      );
    } else {
      return (
        <button
          onClick={() => setSegmentData(option)}
          className={`${style.FareDetailsSelectBtn} ${
            selectedFlight?.resultIndex === option.resultIndex
              ? style.selectedbtn
              : ""
          }`}
          disabled={selectedFlight?.resultIndex === option.resultIndex}
        >
          {selectedFlight?.resultIndex === option.resultIndex
            ? "Selected"
            : "Select"}
        </button>
      );
    }
  };

  const handleFareRuleClick = async (fare, index) => {
    const fareRuleId = `${index}-${fare.resultIndex}`;
    setSelectedFare((prev) => ({ ...prev, ...fare, fareRuleId }));
    setIsPopupOpen(true);
    if (fareRuleData[fareRuleId] && fareRuleData?.[fareRuleId]?.length > 0) {
      setIsPopupOpen(true);
    } else {
      setLoadingFareRules(true);
      try {
        const ipAddress = getTabSpecificData("userip");
        const payload = {
          qTraceId,
          fareRuleReqData: {
            endUserIp: typeof ipAddress == "undefined" ? null : ipAddress,
            resultIndex: fare.resultIndex,
          },
        };
        const response = await axios.post(
          `${config.FLIGHTS_SEARCH_FARERULE}`,
          payload
        );
        if (response?.data?.status === "SUCCESS") {
          const data = response?.data?.data;
          setFareRuleData((prev) => ({ ...prev, [fareRuleId]: data }));
          setIsPopupOpen(true); // Open the popup
        } else {
          showToast(
            "info",
            "Failed to fetch fare rule, please try again later"
          );
        }
      } catch (error) {
        console.error("Failed to fetch fare rules:", error);
      } finally {
        setLoadingFareRules(false);
      }
    }
  };

  return (
    <div>
      <div className={style.flightFareHeads}>
        <div className={style.flightFareDetailsHead}>
          <div className={style.flightFareDetailsActive}>
            <span>Fare Details</span>
          </div>
        </div>
        <div className={style.flightDetailsContainer}>
          <div className={style.fareDetailsContent}>
            <div className={style.fareDetailsHead}>
              <span className={style.fareTypes}>Fare Type</span>
              <span className={style.fareTypes}>Cabin Bag</span>
              <span className={style.fareTypes}>Check-in Bag</span>
              <span className={style.fareTypes}>Price</span>
              <span className={style.fareTypes}>Fare Rule</span>
              <span className={style.fareTypes}>Action</span>
            </div>
            {fareDetails?.fareClassification?.map((option, index) => {
              const updatedIndex = `${type}${index}`;
              return (
                <div key={index}>
                  <div className={style.cabinClassOptions}>
                    <div
                      className={style.cabinOption}
                      style={{
                        borderLeft: "5px solid #028fa3",
                        fontSize: "12px",
                      }}
                    >
                      {option?.fareClassification?.type}
                    </div>
                    <div
                      className={style.cabinOption}
                      style={{ fontSize: "12px" }}
                    >
                      {option.cabinBaggage}
                    </div>
                    <div
                      className={style.cabinOption}
                      style={{ fontSize: "12px" }}
                    >
                      {option.baggage}
                    </div>
                    <div
                      className={style.cabinOption}
                      style={{ fontSize: "12px" }}
                    >
                      Rs.
                      {option.offeredFareRoundedOff.toLocaleString("en-IN")}
                    </div>

                    {loadingFareRules &&
                    selectedFare?.fareRuleId ===
                      `${index}-${option.resultIndex}` ? (
                      <div
                        className={style.cabinOption}
                        onClick={() => handleFareRuleClick(option, index)}
                      >
                        <FontAwesomeIcon
                          icon={faRegistered}
                          className="cursor-pointer"
                          size="lg"
                        />
                      </div>
                    ) : (
                      <div
                        className={style.cabinOption}
                        onClick={() => handleFareRuleClick(option, index)}
                      >
                        <FontAwesomeIcon
                          icon={faRegistered}
                          className="cursor-pointer"
                          size="lg"
                        />
                      </div>
                    )}

                    <div className={style.cabinClassFacility}>
                      <div className={style.dateChangeFee}>
                        {renderSelectButtonContents(option, updatedIndex)}
                        <div>
                          {fareDetails?.segments[0]?.segment[0]?.seatsAvailable}
                          <span className="ml-1">Seats Left</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  {index < fareDetails.fareClassification.length - 1 && (
                    <hr className={style.horizontalRule} />
                  )}
                </div>
              );
            })}

            {isPopupOpen && (
              <div className="fixed inset-0 flex items-center justify-center z-[9999999]">
                <div className="absolute inset-0 bg-black opacity-50"></div>
                <FareRules
                  isOpen={isPopupOpen}
                  onClose={closePopup}
                  fareRules={fareRuleData[selectedFare?.fareRuleId]}
                  isLoading={loadingFareRules}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
export default FareDetails;
