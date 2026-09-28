import { faWhatsapp } from "@fortawesome/free-brands-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React, { useState } from "react";
import Share from "./Share";
import { faSpinner } from "@fortawesome/free-solid-svg-icons";
import OutOfPolicy from "../../common/OutOfPolicy";
import { constructOutOfPolicyEmployees } from "@/utils/corporate/travelPolicy";
import { TRAVEL_CATEGORIES } from "@/utils/constants";
import InPolicyTooltip from "./outOfPolicyToolTip";
import FareRule from "@/components/flights/fareDetails/fareRules/ViewFareRules";

export default function ViewPrices({
  fareDetails,
  index,
  handleSelectButtonClick,
  selectButtonLoader,
  selectedButtonIndex,
  setSelectedButtonIndex,
  journeyType,
  selectedFlight,
  setSelectedFlight,
  setCheckboxIndex,
  setIsClicked,
  destinationIndex,
  handleDivClick1,
  isInternational,
  qTraceId,
  setSelectedIndex,
  shareData,
  handleShareClick,
  flightsSelected,
  isPopupOpen,
  setIsPopupOpen,
  selectedFare,
  setSelectedFare,
  loadingFareRules,
  setLoadingFareRules,
  handleFareRuleClick,
  closePopup,
  activeSegment,
  whatsAppShareLimit,
  checkOutOfPolicyForFlight,
  flightsRequest,
  regionId,
  findTravelersMissingApproval,
  onFlightSelection,
  fareRuleData,
  flight,
}) {
  const [hoveredIndex, setHoveredIndex] = useState(null);
  const [bookBtnLoader, setBookBtnLoader] = useState(false);
  const [hoveredButtonIndex, setHoveredButtonIndex] = useState(null);

  const handleSelectButtonClickParent = async (data, updatedIndex) => {
    setBookBtnLoader(true);
    setSelectedButtonIndex(updatedIndex);
    const updatedDetails = {
      fare: data,
      resultIndex: data.resultIndex,
    };
    await handleSelectButtonClick(updatedDetails, updatedIndex);
    setSelectedButtonIndex(null);
    setBookBtnLoader(false);
  };

  const setSegmentData = async (data) => {
    if (journeyType === "3") {
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

      // Call parent function with multi-city specific data structure
      if (onFlightSelection) {
        onFlightSelection({
          type: "multicity",
          activeSegment: activeSegment,
          selectedIndex: index,
          selectedFlight: updatedData,
        });
      }
    } else if (journeyType === "2") {
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

      // Call parent function for round-trip
      if (onFlightSelection) {
        onFlightSelection({
          type: "roundtrip",
          segmentIndex: destinationIndex,
          flightData: updatedData,
          mainFlightIndex: index,
        });
      }
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

      // Call parent function for one-way
      if (onFlightSelection) {
        onFlightSelection({
          type: "oneway",
          flightData: updatedData,
          mainFlightIndex: index,
          parentFlightResultIndex: fareDetails.resultIndex,
        });
      }
      setCheckboxIndex(index);
      setIsClicked(true);
      if (journeyType !== "3" && isInternational) {
        await handleDivClick1(updatedData, index);
      }
    }
  };

  const isFareSelected = (option) => {
    if (journeyType === "2") {
      return (
        flightsSelected[destinationIndex]?.resultIndex === option.resultIndex
      );
    } else if (journeyType === "3") {
      return flightsSelected?.resultIndex === option.resultIndex;
    } else {
      // One-way
      return flightsSelected?.[0]?.resultIndex === option.resultIndex;
    }
  };

  const renderSelectButtonContents = (
    option,
    updatedIndex,
    isOutOfPolicySendApproval,
  ) => {
    if (journeyType === "1") {
      return (
        <>
          <div
            className="relative"
            onMouseEnter={() => setHoveredButtonIndex(updatedIndex)}
            onMouseLeave={() => setHoveredButtonIndex(null)}
          >
            <button
              onClick={() =>
                handleSelectButtonClickParent(option, updatedIndex)
              }
              className={`text-[#155EEF] border-1  border-[#155EEF] rounded-lg px-1 py-1 text-xxxs sm:text-sm hover:bg-[#155EEF] hover:text-white transition w-[65px] sm:w-[90px] ${
                isOutOfPolicySendApproval && "cursor-not-allowed opacity-70"
              }`}
              disabled={bookBtnLoader || isOutOfPolicySendApproval}
            >
              {bookBtnLoader && selectedButtonIndex === updatedIndex ? (
                <div className="w-22">
                  <FontAwesomeIcon icon={faSpinner} spin />
                </div>
              ) : (
                "BOOK NOW"
              )}
            </button>

            {isOutOfPolicySendApproval &&
              hoveredButtonIndex === updatedIndex && <InPolicyTooltip />}
          </div>
        </>
      );
    } else if (journeyType === "2") {
      return (
        <>
          <div
            className="relative"
            onMouseEnter={() => setHoveredButtonIndex(updatedIndex)}
            onMouseLeave={() => setHoveredButtonIndex(null)}
          >
            <button
              onClick={() => setSegmentData(option)}
              className={`text-[#155EEF] border border-[#155EEF] rounded-lg px-3 py-1 text-sm hover:bg-[#155EEF] hover:text-white transition ${
                flightsSelected[destinationIndex]?.resultIndex ===
                option.resultIndex
                  ? "bg-[#155EEF] text-white"
                  : ""
              } ${
                isOutOfPolicySendApproval && "cursor-not-allowed opacity-70"
              }`}
              disabled={
                flightsSelected[destinationIndex]?.resultIndex ===
                  option.resultIndex || isOutOfPolicySendApproval
              }
            >
              {flightsSelected[destinationIndex]?.resultIndex ===
              option.resultIndex
                ? "Selected"
                : "Select"}
            </button>
            {isOutOfPolicySendApproval &&
              hoveredButtonIndex === updatedIndex && <InPolicyTooltip />}
          </div>
        </>
      );
    } else {
      return (
        <>
          <div
            className="relative"
            onMouseEnter={() => setHoveredButtonIndex(updatedIndex)}
            onMouseLeave={() => setHoveredButtonIndex(null)}
          >
            <button
              onClick={() => setSegmentData(option)}
              className={`text-[#155EEF] border border-[#155EEF] rounded-lg px-3 py-1 text-sm hover:bg-[#155EEF] hover:text-white transition ${
                flightsSelected?.resultIndex === option.resultIndex
                  ? "bg-[#155EEF] text-white"
                  : ""
              } ${
                isOutOfPolicySendApproval && "cursor-not-allowed opacity-70"
              }`}
              disabled={
                flightsSelected?.resultIndex === option.resultIndex ||
                isOutOfPolicySendApproval
              }
            >
              {flightsSelected?.resultIndex === option.resultIndex
                ? "Selected"
                : "Select"}
            </button>
            {isOutOfPolicySendApproval &&
              hoveredButtonIndex === updatedIndex && <InPolicyTooltip />}
          </div>
        </>
      );
    }
  };

  return (
    <>
      <div className="w-full">
        <div
          // className="grid grid-cols-[1fr_1.5fr_1.2fr_1.2fr_2fr] gap-2 bg-gray-100 mt-2 px-3 p-2 font-bold text-sm text-gray-600 -mx-2"
          className={`grid gap-2 bg-gray-100 mt-2 px-3 p-2 font-bold  text-gray-600 -mx-2 ${
            journeyType === "2"
              ? "grid-cols-5 text-xs" // Styling for oneway
              : "grid-cols-[1fr_1fr_1fr_1fr_2fr] text-xxxs sm:text-sm" // Styling for roundtrip (example)
          }`}
        >
          <div>FARES</div>
          <div>FARE RULES</div>
          <div>CHECK-IN</div>
          <div>CABIN BAG</div>
          {/* <div>MEAL & SEAT</div> */}
          <div></div>
        </div>

        {fareDetails?.fareClassification?.map((fare, index) => {
          const updatedResultIndex = `${index}-${fare.resultIndex}`;
          const segments = fare.segments[0].segment;
          const overallSeats = segments[0].seatsAvailable;

          const fareData = { fare };
          const outOfPolicy = checkOutOfPolicyForFlight(fareData);
          const isOutOfPolicy = outOfPolicy.length > 0;

          const isOutOfPolicySendApproval = findTravelersMissingApproval(
            {
              corporateEmployees: flightsRequest?.corporateEmployees || [],
              totalAmount: fare.offeredFareRoundedOff,
              regionId: regionId,
              flightCabinClass: flightsRequest?.FlightCabinClassText,
            },
            TRAVEL_CATEGORIES.FLIGHTS,
          );

          const isSelected = isFareSelected(fare);

          return (
            <React.Fragment key={index}>
              <div
                key={index}
                // className="grid grid-cols-[1fr_1.5fr_1.2fr_1.2fr_2fr] gap-2 items-center p-1 border-b text-sm text-gray-700"
                className={`grid gap-2 items-center p-1 border-b text-xxxs sm:text-sm text-gray-700 ${
                  journeyType === "2"
                    ? "grid-cols-5" // For one-way journey
                    : "grid-cols-[1fr_1fr_1fr_1fr_2fr]" // For round-trip or other types
                } ${isSelected ? "bg-[#155EEF08] border-[#155EEF]" : ""}`}
              >
                {/* Fare Type */}
                <div>
                  <div className="font-bold">
                    {fare?.fareClassification?.type}
                  </div>
                  {/* {fare.description && <div className="text-xs text-gray-500">{fare.description}</div>} */}
                  {journeyType === "1" && (
                    <div className="relative inline-block">
                      <button
                        className="flex items-center gap-2 border-1 border-green-500 bg-[#f0fdf4] rounded-md px-2 py-1"
                        onClick={() => handleShareClick(fare)}
                        onMouseEnter={() => setHoveredIndex(index)}
                        onMouseLeave={() => setHoveredIndex(null)}
                      >
                        <span className="text-green-600 flex items-center">
                          <FontAwesomeIcon icon={faWhatsapp} />
                          <span className="ml-1 text-xxxs sm:text-xs">
                            Share
                          </span>
                        </span>
                        <input
                          type="checkbox"
                          className="form-checkbox h-3 w-3 text-blue-500 rounded-md"
                          checked={shareData.some(
                            (f) => f.resultIndex === fare.resultIndex,
                          )}
                          disabled={
                            shareData.length >= whatsAppShareLimit &&
                            !shareData.some(
                              (f) => f.resultIndex === fare.resultIndex,
                            )
                          }
                        />
                      </button>

                      {hoveredIndex === index && <Share />}
                    </div>
                  )}
                </div>

                {/* Fare Rules */}
                {/* <div>
                <button
                  className="text-[#155EEF] hover:underline"
                  onClick={() =>
                    !(
                      loadingFareRules &&
                      selectedFare?.fareRuleId === updatedResultIndex
                    ) && handleFareRuleClick(fare, index)
                  }
                >
                  {loadingFareRules &&
                  selectedFare?.fareRuleId === updatedResultIndex
                    ? "Loading...."
                    : "Fare Rules"}
                </button>
              </div> */}

                <div>
                  <button
                    className="text-[#155EEF] hover:underline"
                    data-fare-toggle="true"
                    onClick={(e) => {
                      e.stopPropagation(); // ✅ Add this
                      if (
                        !(
                          loadingFareRules &&
                          selectedFare?.fareRuleId === updatedResultIndex
                        )
                      ) {
                        handleFareRuleClick(fare, index);
                      }
                    }}
                  >
                    {isPopupOpen &&
                    selectedFare?.fareRuleId === updatedResultIndex
                      ? "Hide Fare Rules"
                      : loadingFareRules &&
                          selectedFare?.fareRuleId === updatedResultIndex
                        ? "Loading..."
                        : "View Fare Rules"}
                  </button>
                </div>

                {/* Check-In */}
                <div>{fare.baggage}</div>

                {/* Cabin Bag */}
                <div>{fare.cabinBaggage}</div>

                {/* Price & Select Button */}
                <div
                  className={`gap-3 items-center justify-end mr-0 sm:mr-4 text-right${
                    journeyType === "2" ? "flex-col" : " flex" // For roundtrip or other types, use different spacing
                  }`}
                >
                  {/* {isOutOfPolicy && (
                  <OutOfPolicy
                    outOfPolicyTravelers={outOfPolicy}
                    badgeClassName="text-[#E53944] text-sm font-semibold items-center flex gap-1"
                  />
                )} */}
                  <div className="font-bold text-xxxs sm:text-sm mt-0 sm:mt-2 text-nowrap">
                    Rs. {fare.offeredFareRoundedOff.toLocaleString("en-IN")}
                  </div>
                  <div
                    //  className="flex flex-col"
                    className={` ${
                      journeyType === "2" ? "" : "flex flex-col" // For roundtrip or other types, use different spacing
                    }`}
                  >
                    {isOutOfPolicy && (
                      <OutOfPolicy
                        outOfPolicyTravelers={outOfPolicy}
                        badgeClassName="text-[#E53944] text-sm font-semibold items-center flex gap-1"
                      />
                    )}
                    {renderSelectButtonContents(
                      fare,
                      index,
                      isOutOfPolicySendApproval,
                    )}
                    {!isNaN(overallSeats) && (
                      <div className="text-[#FA5D04] text-xxxs sm:text-xs font-normal mt-1 text-end mr-0 sm:mr-4 text-nowrap">
                        {overallSeats} Seats Left
                      </div>
                    )}
                  </div>
                </div>
              </div>
              {isPopupOpen &&
                selectedFare?.fareRuleId === updatedResultIndex && (
                  <div className="col-span-full px-2 -mt-1">
                    <FareRule
                      isOpen={isPopupOpen}
                      onClose={closePopup}
                      fareRules={fareRuleData[selectedFare?.fareRuleId]}
                      isLoading={loadingFareRules}
                    />
                  </div>
                )}
            </React.Fragment>
          );
        })}
      </div>
    </>
  );
}
