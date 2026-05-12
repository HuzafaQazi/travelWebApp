import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faClock } from "@fortawesome/free-regular-svg-icons";
import { useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import {
  faArrowLeft,
  faInfoCircle,
  faSpinner,
} from "@fortawesome/free-solid-svg-icons";
import axios, { getTabSpecificData } from "@/utils/axios/axios";
import Image from "next/image";
import FareDetails from "@/components/flights/fareDetails/fareDetails";
import FlightDetails from "@/components/flights/flightDetails/flightDetails";

import "react-toastify/dist/ReactToastify.css";
import config from "@/config";
import { useRouter } from "next/router";
import ViewPrice from "../flights/viewprices";
import BottomSheet from "./bottomSheet";
import { faWhatsapp } from "@fortawesome/free-brands-svg-icons";
import Share from "./Share";
import FareRule from "@/components/flights/fareDetails/fareRules/ViewFareRules";
import { TRAVEL_CATEGORIES } from "@/utils/constants";
import {
  constructOutOfPolicyEmployees,
  findTravelersMissingApproval,
} from "@/utils/corporate/travelPolicy";
import OutOfPolicy from "../../common/OutOfPolicy";
import InPolicyTooltip from "./outOfPolicyToolTip";
import showToast from "@/utils/toast";

export default function OneWayList({
  flightsResponse,
  flightsRequest,
  updateFlights,
  wayindex,
  flightMap,
  journeyType,
  setflightsSelected,
  flightsSelected,
  fetchFlightsWithRefId,
  setFlightsResponse,
  handleSelectButtonClick,
  multiCitySelectedResultIndex,
  activeSegment,
  searchReqData,
  shareData,
  setShareData,
  isBookingLoading,
  loaderIndex,
  setLoaderIndex,
  whatsAppShareLimit,
  regionId,
  selectedIndex,
  setSelectedIndex,
  apiCallTracker,
  viewPriceFlightIndex,
  onViewPriceToggle,
}) {
  const router = useRouter();

  const { travelersByCategory } = useSelector((state) => state.travellers);

  const selectedFlightTravelers = useMemo(
    () => travelersByCategory?.[TRAVEL_CATEGORIES.FLIGHTS] || [],
    [travelersByCategory],
  );

  const [flightDetailsLoader, setFlightDetailsLoader] = useState(false);
  const [flightDetailsIndex, setFlightDetailsIndex] = useState(null);
  const [fareDetailsLoader, setFareDetailsLoader] = useState(false);
  const [fareDetailsIndex, setFareDetailsIndex] = useState(null);
  const [fareQuoteData, setFareQuoteData] = useState([]);
  const [fareDetailsData, setFareDetailsData] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("flightDetails");
  const [isFareDetailsOpen, setIsFareDetailsOpen] = useState(false);
  const [selectedButtonIndex, setSelectedButtonIndex] = useState(null);

  const [selectedFlight, setSelectedFlight] = useState(null);
  const [isClicked, setIsClicked] = useState(false);
  const [isOpenB, setIsOpenB] = useState(false);
  const [hoveredIndex, setHoveredIndex] = useState(null);
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [selectedFare, setSelectedFare] = useState(null);
  const [fareRuleData, setFareRuleData] = useState({});
  const [loadingFareRules, setLoadingFareRules] = useState(false);
  const [selectButtonLoader, setSelectButtonLoader] = useState(false);
  const [hoveredButtonIndex, setHoveredButtonIndex] = useState(null);

  // const handleFareRuleClick = async (fare, index) => {
  //   const fareRuleId = `${index}-${fare.resultIndex}`;
  //   setSelectedFare({ ...fare, fareRuleId });
  //   setIsPopupOpen(true); // Open the popup immediately
  //   setLoadingFareRules(true); // Set loading state

  //   // Check if fare rules are already fetched for this fareRuleId
  //   if (fareRuleData[fareRuleId] && fareRuleData?.[fareRuleId]?.length > 0) {
  //     setLoadingFareRules(false);
  //   } else {
  //     // setLoadingFareRules(true);
  //     try {
  //       const ipAddress = getTabSpecificData("userip");
  //       const payload = {
  //         qTraceId: flightsResponse.qTraceId,
  //         fareRuleReqData: {
  //           endUserIp: typeof ipAddress === "undefined" ? null : ipAddress,
  //           resultIndex: fare.resultIndex,
  //         },
  //       };
  //       const response = await axios.post(
  //         `${config.FLIGHTS_SEARCH_FARERULE}`,
  //         payload,
  //       );
  //       if (response?.data?.status === "SUCCESS") {
  //         const data = response?.data?.data;
  //         setFareRuleData((prev) => ({ ...prev, [fareRuleId]: data }));
  //         // setIsPopupOpen(true); // Open the popup
  //       } else {
  //         showToast(
  //           "error",
  //           "Failed to fetch fare rule, please try again later",
  //         );
  //       }
  //     } catch (error) {
  //       console.error("Failed to fetch fare rules:", error);
  //     } finally {
  //       setLoadingFareRules(false);
  //     }
  //   }
  // };

  // const closePopup = () => {
  //   setIsPopupOpen(false);
  // };

  const closeFareRules = () => {
    console.log("closeFareRules called");
    setIsPopupOpen(false);
    setSelectedFare(null);
  };

  const handleFareRuleClick = async (fare, index) => {
    const fareRuleId = `${index}-${fare.resultIndex}`;

    console.log("Button clicked!", {
      fareRuleId,
      isPopupOpen,
      selectedFareId: selectedFare?.fareRuleId,
      shouldClose: isPopupOpen && selectedFare?.fareRuleId === fareRuleId,
    });

    // ✅ HIDE: If same fare is open → CLOSE
    if (isPopupOpen && selectedFare?.fareRuleId === fareRuleId) {
      console.log("Closing popup...");
      closeFareRules();
      return;
    }

    // ✅ OPEN
    setSelectedFare({ ...fare, fareRuleId });
    setIsPopupOpen(true);
    setLoadingFareRules(true);

    // ✅ Already fetched → no API call
    if (fareRuleData[fareRuleId]?.length > 0) {
      setLoadingFareRules(false);
      return;
    }

    try {
      const ipAddress = getTabSpecificData("userip");
      const payload = {
        qTraceId: flightsResponse.qTraceId,
        fareRuleReqData: {
          endUserIp: ipAddress ?? null,
          resultIndex: fare.resultIndex,
        },
      };

      const response = await axios.post(
        config.FLIGHTS_SEARCH_FARERULE,
        payload,
      );

      if (response?.data?.status === "SUCCESS") {
        setFareRuleData((prev) => ({
          ...prev,
          [fareRuleId]: response.data.data,
        }));
      } else {
        showToast("info", "Failed to fetch fare rule");
      }
    } catch (error) {
      console.error("Failed to fetch fare rules:", error);
    } finally {
      setLoadingFareRules(false);
    }
  };

  const closePopup = () => {
    setIsPopupOpen(false);
  };

  // useEffect(() => {
  //   if (isPopupOpen) {
  //     document.body.style.overflow = "hidden";
  //   } else {
  //     document.body.style.overflow = "visible";
  //   }

  //   return () => {
  //     document.body.style.overflow = "visible";
  //   };
  // }, [isPopupOpen]);

  const handleShareClick = (selectedFlight) => {
    setIsOpenB(true);
    setShareData((prevShareData) => {
      const isAlreadySelected = prevShareData.some(
        (flight) => flight.resultIndex === selectedFlight.resultIndex,
      );
      if (isAlreadySelected) {
        // Remove the flight if already selected
        return prevShareData.filter(
          (flight) => flight.resultIndex !== selectedFlight.resultIndex,
        );
      } else {
        // Add the flight if less than 5 flights are selected
        if (prevShareData.length < whatsAppShareLimit) {
          return [...prevShareData, selectedFlight];
        }
        // If 5 flights are already selected, just return the current state
        return prevShareData;
      }
    });
  };

  const handleClose = () => {
    setIsOpenB(false);
  };

  // Toggle the expanded state
  const handleToggle = (selectedFlight, index) => {
    onViewPriceToggle(index);
  };

  const handleFlightDuration = (departureTime, arrivalTime) => {
    const departureDate = new Date(departureTime);
    const arrivalDate = new Date(arrivalTime);

    // Get the start of the departure day
    const departureDayStart = new Date(
      departureDate.getFullYear(),
      departureDate.getMonth(),
      departureDate.getDate(),
    );

    // Get the start of the arrival day
    const arrivalDayStart = new Date(
      arrivalDate.getFullYear(),
      arrivalDate.getMonth(),
      arrivalDate.getDate(),
    );

    // Calculate the difference in days
    const timeDifference =
      arrivalDayStart.getTime() - departureDayStart.getTime();
    const daysDifference = timeDifference / (1000 * 3600 * 24);
    return Math.ceil(daysDifference);
  };

  useEffect(() => {
    if (isFareDetailsOpen) {
      // Disable scrolling on the body when fare details are open
      document.body.style.overflow = "hidden";
    } else {
      // Enable scrolling on the body when fare details are closed
      document.body.style.overflow = "unset";
    }

    // Cleanup effect
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isFareDetailsOpen]);

  const formatTime = (isoTimeString) => {
    const date = new Date(isoTimeString);
    const hours = date.getHours().toString().padStart(2, "0");
    const minutes = date.getMinutes().toString().padStart(2, "0");
    return `${hours}:${minutes}`;
  };

  const formatPrice = (price) => {
    const priceStr = price?.toString();
    const [integerPart, decimalPart] = priceStr?.split(".");

    const lastThreeDigits = integerPart.slice(-3);
    const otherDigits = integerPart.slice(0, -3);

    const formattedIntegerPart =
      otherDigits.replace(/\B(?=(\d{2})+(?!\d))/g, ",") +
      (otherDigits.length > 0 ? "," : "") +
      lastThreeDigits;
    return decimalPart
      ? `${formattedIntegerPart}.${decimalPart}`
      : formattedIntegerPart;
  };

  const handleSelectionOLD = (index, activeWay) => {
    if (journeyType === "2") {
      console.log("handleSelection", index);
      setSelectedIndex(index);
      // Create a unique key for this specific call
      const callKey = `${wayindex}-${index}`;

      // Check if we've already made the API call for this selection
      if (!apiCallTracker.current.has(callKey)) {
        // First time - make the API call and track it
        console.log("First time call for", callKey, "- making API call");
        handleSelectButtonClick(flightMap.flights[index], index, 0, wayindex);
        apiCallTracker.current.add(callKey);
      } else {
        // Subsequent call - only update local state
        console.log("Subsequent call for", callKey, "- skipping API call");
      }
    }
  };

  const handleSelection = (index, activeWay) => {
    if (journeyType === "2") {
      console.log("handleSelection", index);
      setSelectedIndex(index);
      handleSelectButtonClick(flightMap.flights[index], index, 0, wayindex);
    }
  };

  // useEffect(() => {
  //   if (wayindex === 1 && selectedIndex > flightMap.flights.length) {
  //     setSelectedIndex(0);
  //     let flightSelected = [...flightsSelected];
  //     flightSelected[wayindex] = flightMap.flights[0];
  //     setflightsSelected(flightSelected);
  //   }
  // }, [flightsSelected, wayindex]);

  // useEffect(() => {
  //   if (
  //     journeyType !== "1" &&
  //     !(journeyType === "3" && flightsSelected.length === 1)
  //   ) {
  //     handleSelection(selectedIndex);
  //   }
  // }, [selectedIndex]);

  // useEffect(() => {
  //   let flightSelected = [...flightsSelected];
  //   flightSelected[wayindex] =
  //     selectedFlight ?? flightMap.flights[selectedIndex];
  //   if (
  //     flightSelected &&
  //     flightSelected?.length > 0 &&
  //     flightSelected?.[0]?.resultIndex
  //   ) {
  //     setflightsSelected(flightSelected);
  //   }
  // }, [selectedFlight]);

  // Update flight selection in ViewPrice to directly update parent state
  const handleFlightSelectionFromViewPrice = (selectionData) => {
    let updatedFlightsSelected = [...flightsSelected];

    console.log("ViewPrice selection data:", selectionData);

    if (selectionData.type === "multicity") {
      updatedFlightsSelected[selectionData.activeSegment] =
        selectionData.selectedFlight;
      // Update selectedIndex to match the main flight index
      setSelectedIndex(selectionData.selectedIndex);
    } else if (selectionData.type === "roundtrip") {
      updatedFlightsSelected[selectionData.segmentIndex] =
        selectionData.flightData;
      // Use the provided main flight index
      if (selectionData.mainFlightIndex !== undefined) {
        setSelectedIndex(selectionData.mainFlightIndex);
      }
    } else {
      // Handle one-way - the most important case for ViewPrice highlighting
      updatedFlightsSelected[0] = selectionData.flightData;

      // Set the selectedIndex to the main flight index so the entire div gets highlighted
      if (selectionData.mainFlightIndex !== undefined) {
        setSelectedIndex(selectionData.mainFlightIndex);
        console.log("Setting selectedIndex to:", selectionData.mainFlightIndex);
      } else {
        // Fallback: find the main flight index based on parent flight result index
        const mainFlightIndex = flightMap.flights.findIndex((flight) => {
          // Check if this is the parent flight that contains the selected fare
          return (
            flight.resultIndex === selectionData.parentFlightResultIndex ||
            flight.fareClassification?.some(
              (fare) =>
                fare.resultIndex === selectionData.flightData.resultIndex,
            )
          );
        });
        if (mainFlightIndex !== -1) {
          setSelectedIndex(mainFlightIndex);
          console.log("Fallback: Setting selectedIndex to:", mainFlightIndex);
        }
      }
    }

    setflightsSelected(updatedFlightsSelected);
    console.log("Updated flights selected:", updatedFlightsSelected);
    console.log("Updated selectedIndex for highlighting:", selectedIndex);
  };

  const formatDuration = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;

    const hoursText = hours > 0 ? `${hours} hr` : "";
    const minutesText = remainingMinutes > 0 ? ` ${remainingMinutes} mins` : "";

    return `${hoursText}${minutesText}`;
  };

  const handleCloseBottomSheet = () => {
    setIsOpen(false);
    setIsFareDetailsOpen(false);
  };

  const BottomSheetDetails = ({ isOpen, onClose, activeTab, flights }) => {
    return (
      <div>
        {isOpen && (
          <div
            className="fixed inset-0 w-full h-full bg-black/20 z-[998] cursor-pointer"
            onClick={onClose}
          ></div>
        )}
        <div
          className="fixed block rounded-l-xl z-[99999999999999] bg-white h-[70%] sm:h-full w-full sm:w-1/2 right-0 sm:right-0 left-0 sm:left-1/2 bottom-0 sm:top-0 overflow-y-scroll sm:overflow-auto"
          style={{
            display: isOpen ? "block" : "none",
          }}
        >
          <button
            onClick={onClose}
            className="bg-white  text-[#028fa3] text-lg ml-2"
          >
            <FontAwesomeIcon icon={faArrowLeft} />
          </button>
          {activeTab === "flightDetails" && isOpen && (
            <FlightDetails fareQuote={fareQuoteData} onClose={onClose} />
          )}
          {activeTab === "fareDetails" && isOpen && (
            <FareDetails
              fareDetails={fareDetailsData}
              index={fareDetailsIndex}
              onClose={onClose}
              handleTabClick={handleTabClick}
              handleSelectButtonClick={handleSelectButtonClick}
              selectButtonLoader={selectButtonLoader}
              selectedButtonIndex={selectedButtonIndex}
              type={
                journeyType === "1"
                  ? "oneway"
                  : journeyType === "2"
                    ? "return"
                    : "multicity"
              }
              selectedIndex={selectedIndex}
              setSelectedIndex={setSelectedIndex}
              isInternational={
                flightsResponse?.flightJourney !== "domestic" ? true : false
              }
              selectedFlight={selectedFlight}
              setSelectedFlight={setSelectedFlight}
              setCheckboxIndex={setSelectedIndex}
              setIsClicked={setIsClicked}
              // handleDivClick1={handleDivClick1}
            />
          )}
        </div>
      </div>
    );
  };

  const handleTabClick = async (tab, flight, index) => {
    if (tab === "flightDetails") {
      setFlightDetailsLoader(true);
      setFlightDetailsIndex(index);
      try {
        setFareQuoteData(flight);
        setActiveTab(tab);
        setIsOpen(true);
      } catch (error) {
        let errorMessage =
          error?.response?.data?.error?.errorMessage[0]?.data ||
          "Something went wrong, please try after some time";
        if (
          error?.response?.data?.error?.errorMessage?.[0]?.data ===
          "Session timeout!!"
        ) {
          errorMessage =
            "Oops! Your session has expired. Please search Flights again.";
          setTimeout(() => {
            router.push("/"); // Redirect to a specific page
          }, 2000);
        } else if (
          error?.response?.data?.error?.errorMessage?.[0]?.data ===
          "Fare Quote failed from the Supplier end. Please try again."
        ) {
          errorMessage = "Something went wrong, please select different flight";
          setTimeout(() => {
            router.push("/flights/oneway/list");
          }, 2000);
        }

        showToast("error", errorMessage);
      } finally {
        setFlightDetailsLoader(false);
      }
    } else if (tab === "fareDetails") {
      setFareDetailsData(flight);
      setFareDetailsLoader(true);
      setFareDetailsIndex(index);
      setActiveTab(tab);
      setIsOpen(true);
      setFareDetailsLoader(false);
    } else {
      setActiveTab(tab);
      setIsOpen(true);
    }
  };

  const checkOutOfPolicyForFlight = (flight, isOutOfPolicySendApproval) => {
    // Build the object that "constructOutOfPolicyEmployees" expects
    const dataForPolicy = {
      totalAmount: flight.fare.offeredFareRoundedOff, // cost of this flight
      regionId: regionId, // domestic/international region ID
      // flightCabinClass: flightsRequest?.FlightCabinClassText,
      corporateEmployees: selectedFlightTravelers,
      showApprovalReason: isOutOfPolicySendApproval ? true : false,
    };

    // If you want 'split' logic (cost-per-head):
    const outOfPolicyList = constructOutOfPolicyEmployees(
      dataForPolicy,
      TRAVEL_CATEGORIES.FLIGHTS,
      { budgetCheckMethod: "split" },
    );

    // If you wanted the "collective" approach, do:
    // const outOfPolicyList = constructOutOfPolicyEmployees(
    //   dataForPolicy,
    //   TRAVEL_CATEGORIES.FLIGHTS,
    //   { budgetCheckMethod: "collective" }
    // );

    return outOfPolicyList;
  };

  const isFlightSelected = (flight, index) => {
    if (journeyType === "2") {
      return (
        flightsSelected?.[wayindex]?.resultIndex === flight?.resultIndex ||
        flight.fareClassification?.some(
          (fare) => fare.resultIndex === flightsSelected?.[0]?.resultIndex,
        )
      );
    }

    // For all journey types, check if any fare from this flight is selected
    if (flightsSelected?.[0]?.resultIndex) {
      // Check if the main flight itself is selected
      if (flight.resultIndex === flightsSelected[0].resultIndex) {
        return true;
      }

      // Check if any fare classification from this flight matches the selected fare
      const isFareSelected = flight.fareClassification?.some(
        (fare) => fare.resultIndex === flightsSelected[0].resultIndex,
      );

      if (isFareSelected) {
        return true;
      }
    }

    // For multicity, also check if this specific flight is selected
    if (journeyType === "3" && flightsSelected?.length > 0) {
      return flightsSelected.some(
        (selected) =>
          selected?.resultIndex === flight.resultIndex ||
          flight.fareClassification?.some(
            (fare) => fare.resultIndex === selected?.resultIndex,
          ),
      );
    }

    return false;
  };

  return (
    <>
      {flightMap.flights.map((flight, index) => {
        const segments = flight.segments[0].segment;
        const origin = segments[0];
        const destination =
          segments.length > 1 ? segments[segments.length - 1] : segments[0];
        const journeyDuration = flight.segments[0]?.journeyDuration;
        const overallSeats = segments[0].seatsAvailable;

        const filteredFareClassification = flight.fareClassification.filter(
          (fare) => fare.resultIndex !== flight.resultIndex,
        );

        const filteredFareDetails = {
          ...flight,
          fareClassification: filteredFareClassification,
        };
        const numOfDays = handleFlightDuration(
          origin.origin.depTime,
          destination.destination.arrTime,
        );

        const isOutOfPolicySendApproval = findTravelersMissingApproval(
          {
            corporateEmployees: flightsRequest?.corporateEmployees || [],
            totalAmount: flight.fare.offeredFareRoundedOff,
            regionId: regionId,
            flightCabinClass: flightsRequest?.FlightCabinClassText,
          },
          TRAVEL_CATEGORIES.FLIGHTS,
        );

        const outOfPolicy = checkOutOfPolicyForFlight(
          flight,
          isOutOfPolicySendApproval,
        );
        const isOutOfPolicy = outOfPolicy.length > 0;

        const isSelected = isFlightSelected(flight, index);

        return (
          <div
            key={`${wayindex}+${index}`}
            className={`p-2 py-3 pb-2 pt-3 mb-3 flex flex-col border-1 rounded-lg w-full cursor-pointer transition-all duration-200 ${
              isSelected && journeyType !== "1"
                ? "border-[#028fa3] shadow-lg bg-[#028fa308]"
                : "border-[#028fa350] shadow-md hover:shadow-lg"
            }`} // style={{ boxShadow: "4px 4px 4px 4px rgba(22, 155, 176, 0.05)" }}
          >
            {/* twoway flight ui */}
            {flightsResponse.flightsResults.length === 2 && (
              <div className="flex justify-between pl-2 pr-0 mb-2">
                <div className="hidden sm:flex gap-2 items-center w-1/6"></div>
                <div className="flex sm:hidden gap-2 items-center w-1/6">
                  <Image
                    src={origin.airline.airlineLogoUrl}
                    alt="hotelimage"
                    className="w-[30px] h-fit"
                    width={30}
                    height={30}
                  />
                  <div className="flex flex-col">
                    <span className="text-xs font-semibold break-words">
                      {origin.airline.airlineName}
                    </span>
                    <span className="text-xxs font-semibold text-[#878786] text-nowrap">
                      {origin.airline.airlineCode}-{origin.airline.flightNumber}
                    </span>
                  </div>
                </div>
                {/* price details MOBILE VIEW*/}
                <div className="flex sm:hidden flex-col">
                  {isOutOfPolicy && (
                    <OutOfPolicy
                      outOfPolicyTravelers={outOfPolicy}
                      badgeClassName="text-[#E53944] text-sm font-semibold items-center flex gap-1"
                    />
                  )}
                  {journeyType === "2" && (
                    <div
                      className="relative"
                      onMouseEnter={() => setHoveredButtonIndex(index)}
                      onMouseLeave={() => setHoveredButtonIndex(null)}
                    >
                      <button
                        onClick={() =>
                          !isOutOfPolicySendApproval
                            ? handleSelection(index, index)
                            : null
                        }
                        className={`text-[#028fa3] border border-[#028fa3] rounded-lg px-3 py-1 text-sm hover:bg-[#028fa3] hover:text-white transition
                       
                      ${
                        flightsSelected?.[wayindex]?.resultIndex ===
                        flight?.resultIndex
                          ? "bg-[#028fa3] text-white"
                          : ""
                      }
                      ${
                        isOutOfPolicySendApproval
                          ? "cursor-not-allowed opacity-70"
                          : "hover:bg-[#027a8c] cursor-pointer"
                      } 
                      `}
                        disabled={isOutOfPolicySendApproval}
                      >
                        {flightsSelected?.[wayindex]?.resultIndex ===
                        flight?.resultIndex
                          ? "Selected"
                          : "Select"}
                      </button>
                      {isOutOfPolicySendApproval &&
                        hoveredButtonIndex === index && <InPolicyTooltip />}
                    </div>
                  )}
                  <span className="text-base font-semibold text-end">
                    Rs.{formatPrice(flight?.fare?.offeredFareRoundedOff)}
                  </span>
                  {!isNaN(overallSeats) &&
                    flightsResponse?.flightsResults?.length === 2 && (
                      <span className="text-xs text-[#FA5D04] font-medium text-end">
                        {overallSeats} Seats Left
                      </span>
                    )}
                </div>
              </div>
            )}
            {/* mobile logo line */}
            <div className="flex justify-between sm:hidden">
              {flightsResponse?.flightsResults?.length === 1 && (
                <div className="flex gap-2 items-center w-1/6">
                  <Image
                    src={origin.airline.airlineLogoUrl}
                    alt="hotelimage"
                    className="w-[30px] h-fit"
                    width={30}
                    height={30}
                  />
                  <div className="flex flex-col">
                    <span className="text-xxs break-words font-semibold">
                      {origin.airline.airlineName}
                    </span>
                    <span className="text-xxxs font-semibold text-[#878786]">
                      {origin.airline.airlineCode}-{origin.airline.flightNumber}
                    </span>
                  </div>
                </div>
              )}

              {flightsResponse.flightsResults.length !== 2 && (
                <span className={`text-sm font-semibold `}>
                  Rs.{formatPrice(flight.fare.offeredFareRoundedOff)}
                </span>
              )}
            </div>
            <div
              className={`flex justify-between gap-2 sm:gap-0 w-full ${
                journeyType === "2" ? "items-end" : "items-center"
              }`}
            >
              {/* airline logo */}
              {flightsResponse.flightsResults.length === 2 && (
                <div className="hidden sm:flex gap-2 items-center w-1/6">
                  <Image
                    src={origin.airline.airlineLogoUrl}
                    alt="hotelimage"
                    className="w-[30px] h-fit"
                    width={30}
                    height={30}
                  />
                  <div className="flex flex-col">
                    <span className="text-xs font-semibold break-words">
                      {origin.airline.airlineName}
                    </span>
                    <span className="text-xxs font-semibold text-[#878786] text-nowrap">
                      {origin.airline.airlineCode}-{origin.airline.flightNumber}
                    </span>
                  </div>
                </div>
              )}
              {flightsResponse.flightsResults.length === 1 && (
                <div className="hidden sm:flex gap-2 items-center w-1/6">
                  <Image
                    src={origin.airline.airlineLogoUrl}
                    alt="hotelimage"
                    className="w-[30px] h-fit"
                    width={30}
                    height={30}
                  />
                  <div className="flex flex-col">
                    <span className="text-xs font-semibold break-words">
                      {origin.airline.airlineName}
                    </span>
                    <span className="text-xxs font-semibold text-[#878786]">
                      {origin.airline.airlineCode}-{origin.airline.flightNumber}
                    </span>
                  </div>
                </div>
              )}
              {/* flight time and details */}
              <div className="flex gap-0 sm:gap-8 w-full justify-between sm:justify-center">
                <div className="w-fit sm:w-2/6 flex flex-col items-start justify-center">
                  <span className="text-xs sm:text-lg leading-[1] font-semibold">
                    {formatTime(origin.origin.depTime)}
                  </span>
                  <span className="hidden sm:block text-xs text-[#868687]">
                    {origin.origin.airport.airportName} (
                    {origin.origin.airport.cityCode})
                  </span>
                  <span className="text-xxs sm:hidden text-[#868687]">
                    {origin.origin.airport.cityCode}
                  </span>
                </div>
                <div className="w-3/6 flex flex-col items-center justify-center pt-0 sm:pt-4">
                  <div className="text-center text-xxxs mb-1 text-[#171A1966]">
                    <FontAwesomeIcon icon={faClock} />
                    <span className="ml-1 text-xxxs sm:text-xs font-medium">
                      {formatDuration(journeyDuration)}
                    </span>{" "}
                    |
                    <span className="ml-1 text-xxxs sm:text-xs font-medium">
                      {flight.segments[0].stops}{" "}
                      {flight.segments[0].stops <= 1 ? "Stop" : "Stops"}
                    </span>
                  </div>
                  <div className="w-full h-1 border-t border-dashed border-[#868687]" />
                  <div className="text-center text-xxxs text-[#171A1966]">
                    {flight.fare.baggage && flight.fare.cabinBaggage && (
                      <>
                        <span className="ml-1 text-xxxs sm:text-xs font-medium">
                          {flight.fare.cabinBaggage}, {flight.fare.baggage}
                        </span>{" "}
                        |
                      </>
                    )}
                    <span className="ml-1 cursor-pointer font-medium text-xxxs sm:text-xs">
                      {flight.isRefundable ? "REFUNDABLE" : "NON REFUNDABLE"}
                      {""}
                    </span>
                  </div>
                </div>
                <div className="w-fit sm:w-2/6 flex flex-col items-start sm:items-end justify-center">
                  <div className="relative inline-flex items-baseline">
                    <span className="text-xs sm:text-lg font-semibold leading-[1]">
                      {formatTime(destination.destination.arrTime)}
                    </span>
                    {numOfDays > 0 && (
                      <span class="text-xxxs sm:text-[11px] text-[#878786] ml-0.5 relative top-[-8px]">
                        (+{numOfDays}D)
                      </span>
                    )}
                  </div>
                  <span className="hidden sm:block text-xs text-[#868687] text-right">
                    {destination.destination.airport.airportName}(
                    {destination.destination.airport.cityCode})
                  </span>
                  <span className="text-xxs sm:hidden text-[#868687]">
                    {destination.destination.airport.cityCode}
                  </span>
                </div>
              </div>

              {flightsResponse.flightsResults.length === 2 && (
                <div className="hidden sm:flex flex-col">
                  {isOutOfPolicy && (
                    <OutOfPolicy
                      outOfPolicyTravelers={outOfPolicy}
                      badgeClassName="text-[#E53944] text-sm font-semibold items-center flex gap-1"
                    />
                  )}
                  {journeyType === "2" && (
                    <div
                      className="relative"
                      onMouseEnter={() => setHoveredButtonIndex(index)}
                      onMouseLeave={() => setHoveredButtonIndex(null)}
                    >
                      <button
                        onClick={() =>
                          !isOutOfPolicySendApproval
                            ? handleSelection(index, index)
                            : null
                        }
                        className={`text-[#028fa3] border border-[#028fa3] rounded-lg px-3 py-1 text-sm hover:bg-[#028fa3] hover:text-white transition
                     
                    ${
                      flightsSelected?.[wayindex]?.resultIndex ===
                      flight.resultIndex
                        ? "bg-[#028fa3] text-white"
                        : ""
                    }
                    ${
                      isOutOfPolicySendApproval
                        ? "cursor-not-allowed opacity-70"
                        : "hover:bg-[#027a8c] cursor-pointer"
                    } 
                    `}
                        disabled={isOutOfPolicySendApproval}
                      >
                        {flightsSelected?.[wayindex]?.resultIndex ===
                        flight.resultIndex
                          ? "Selected"
                          : "Select"}
                      </button>
                      {isOutOfPolicySendApproval &&
                        hoveredButtonIndex === index && <InPolicyTooltip />}
                    </div>
                  )}
                  <span className="text-base font-semibold text-end">
                    Rs.{formatPrice(flight.fare.offeredFareRoundedOff)}
                  </span>
                  {!isNaN(overallSeats) &&
                    flightsResponse.flightsResults.length === 2 && (
                      <span className="text-xs text-[#FA5D04] font-medium text-end">
                        {overallSeats} Seats Left
                      </span>
                    )}
                </div>
              )}

              {/* select button */}
              {(journeyType === "1" ||
                (journeyType === "3" && multiCitySelectedResultIndex)) && (
                <div className="flex w-1/5 sm:w-1/5 flex-col items-center justify-center overflow-visible">
                  {isOutOfPolicy && (
                    <OutOfPolicy
                      outOfPolicyTravelers={outOfPolicy}
                      badgeClassName="text-[#E53944] text-sm font-semibold items-center flex gap-1"
                    />
                  )}
                  <span className="hidden sm:block text-base font-semibold">
                    Rs.{formatPrice(flight.fare.offeredFareRoundedOff)}
                  </span>
                  <div
                    className="relative"
                    onMouseEnter={() => setHoveredButtonIndex(index)}
                    onMouseLeave={() => setHoveredButtonIndex(null)}
                  >
                    <button
                      className={`bg-[#028fa3] text-white text-nowrap text-xxs sm:text-sm p-2 rounded-lg min-w-16 sm:min-w-20 flex items-center justify-center ${
                        isOutOfPolicySendApproval
                          ? "cursor-not-allowed opacity-70"
                          : "hover:bg-[#027a8c] cursor-pointer"
                      }`}
                      onClick={(e) => {
                        e.preventDefault();
                        if (
                          isBookingLoading === false &&
                          !isOutOfPolicySendApproval
                        ) {
                          setLoaderIndex(index);
                          handleSelectButtonClick(flight, index, activeSegment);
                        }
                      }}
                      disabled={isOutOfPolicySendApproval}
                    >
                      {journeyType === "3" &&
                      flightsSelected.length > 1 &&
                      multiCitySelectedResultIndex &&
                      multiCitySelectedResultIndex === flight.resultIndex ? (
                        "Selected"
                      ) : journeyType === "1" ||
                        (journeyType === "3" &&
                          flightsSelected.length === 1) ? (
                        <>
                          {isBookingLoading === true &&
                          loaderIndex === index ? (
                            <FontAwesomeIcon icon={faSpinner} spin />
                          ) : (
                            "BOOK NOW"
                          )}
                        </>
                      ) : (
                        "Select"
                      )}
                    </button>

                    {isOutOfPolicySendApproval &&
                      hoveredButtonIndex === index && <InPolicyTooltip />}
                  </div>
                  {!isNaN(overallSeats) && (
                    <span className="text-xxxs sm:text-xs text-[#FA5D04] mt-2 font-medium">
                      {overallSeats} Seats Left
                    </span>
                  )}
                </div>
              )}
            </div>
            {
              <div
                className={`flex ${
                  journeyType !== "2" ? "justify-between" : "justify-end"
                }`}
              >
                {journeyType === "1" && (
                  <div className="relative inline-block">
                    <button
                      className={`flex items-center gap-2 border-2 ${
                        shareData.length >= whatsAppShareLimit &&
                        !shareData.some(
                          (f) => f.resultIndex === flight.resultIndex,
                        )
                          ? "border-gray-300 bg-gray-100 cursor-not-allowed"
                          : "border-green-300 bg-[#f0fdf4]"
                      } rounded-md px-2 py-1`}
                      onClick={() => {
                        if (
                          shareData.length < whatsAppShareLimit ||
                          shareData.some(
                            (f) => f.resultIndex === flight.resultIndex,
                          )
                        ) {
                          handleShareClick(flight, index);
                        }
                      }}
                      onMouseEnter={() => setHoveredIndex(index)}
                      onMouseLeave={() => setHoveredIndex(null)}
                      disabled={
                        shareData.length >= whatsAppShareLimit &&
                        !shareData.some(
                          (f) => f.resultIndex === flight.resultIndex,
                        )
                      }
                    >
                      <span className="text-[#0f9d58] font-semibold flex items-center">
                        <FontAwesomeIcon icon={faWhatsapp} />
                        <span className="ml-1 text-xxs sm:text-xs">Share</span>
                      </span>
                      <input
                        type="checkbox"
                        className="form-checkbox h-3 w-3 text-blue-500 rounded-md cursor-pointer"
                        checked={shareData.some(
                          (f) => f.resultIndex === flight.resultIndex,
                        )}
                        disabled={
                          shareData.length >= whatsAppShareLimit &&
                          !shareData.some(
                            (f) => f.resultIndex === flight.resultIndex,
                          )
                        }
                      />
                    </button>
                    {hoveredIndex === index && <Share />}
                  </div>
                )}
                <div>
                  {filteredFareClassification.length > 0 && (
                    <button
                      className={`font-base text-xxs sm:text-sm text-[#028fa3] px-2 py-1  mt-1 border-1  border-[#028fa3] rounded-lg ${
                        journeyType === "1" ? "mr-0 sm:mr-6" : "mr-0"
                      }`}
                      onClick={() => handleToggle(flight, index)}
                    >
                      {" "}
                      {viewPriceFlightIndex === index
                        ? "Hide Fares"
                        : "View Fares"}
                    </button>
                  )}
                </div>
              </div>
            }
            <div className="flex items-center gap-5 mt-2 text-[#028fa3] text-xxs sm:text-xs font-light">
              <button
                className="font-medium text-[#000000]"
                // onClick={() => handleTabClick("fareDetails", flight, index)}
              >
                {segments[0].cabinClassName} |{" "}
                {flight.fare.fareClassification?.type}
              </button>
              <button
                className="font-medium hover:underline"
                onClick={() => handleTabClick("flightDetails", flight, index)}
              >
                Flight Details
              </button>
              {/* <button
                className="text-[#028fa3] font-medium hover:underline"
                onClick={() =>
                  !(
                    loadingFareRules &&
                    selectedFare?.fareRuleId ===
                      `${index}-${flight.fare.resultIndex}`
                  ) && handleFareRuleClick(flight.fare, index)
                }
              >
                {loadingFareRules &&
                selectedFare?.fareRuleId ===
                  `${index}-${flight.fare.resultIndex}`
                  ? "View Fare Rules"
                  : "View Fare Rules"}
              </button> */}
              <button
                className="text-[#028fa3] font-medium hover:underline"
                data-fare-toggle="true"
                // onClick={() => handleFareRuleClick(flight.fare, index)}
                onClick={(e) => {
                  e.stopPropagation(); // ✅ Prevent click from reaching document listener
                  handleFareRuleClick(flight.fare, index);
                }}
              >
                {isPopupOpen &&
                selectedFare?.fareRuleId ===
                  `${index}-${flight.fare.resultIndex}`
                  ? "Hide Fare Rules"
                  : loadingFareRules &&
                      selectedFare?.fareRuleId ===
                        `${index}-${flight.fare.resultIndex}`
                    ? "Loading..."
                    : "View Fare Rules"}
              </button>
              {/* Fare Rules Popup */}

              {(flightDetailsIndex === index || fareDetailsIndex === index) && (
                <BottomSheetDetails
                  isOpen={isOpen}
                  onClose={handleCloseBottomSheet}
                  activeTab={activeTab}
                  flights={flightsResponse?.flightsResults[0].flights}
                />
              )}
            </div>

            {isPopupOpen &&
              selectedFare?.fareRuleId ===
                `${index}-${flight.fare.resultIndex}` && (
                <FareRule
                  isOpen={isPopupOpen}
                  onClose={closeFareRules}
                  fareRules={fareRuleData[selectedFare?.fareRuleId]}
                  isLoading={loadingFareRules}
                />
              )}

            {viewPriceFlightIndex === index &&
              filteredFareDetails?.fareClassification?.length > 0 && (
                <>
                  <ViewPrice
                    fareDetails={filteredFareDetails}
                    index={index}
                    qTraceId={flightsResponse.qTraceId}
                    isInternational={
                      flightsResponse?.flightJourney !== "domestic"
                    }
                    handleSelectButtonClick={handleSelectButtonClick}
                    selectButtonLoader={selectButtonLoader}
                    selectedButtonIndex={selectedButtonIndex}
                    setSelectedButtonIndex={setSelectedButtonIndex}
                    journeyType={journeyType}
                    selectedFlight={selectedFlight}
                    flightsSelected={flightsSelected}
                    setSelectedFlight={setSelectedFlight}
                    setCheckboxIndex={setSelectedIndex}
                    setIsClicked={setIsClicked}
                    destinationIndex={wayindex}
                    setSelectedIndex={setSelectedIndex}
                    shareData={shareData}
                    handleShareClick={handleShareClick}
                    setIsPopupOpen={setIsPopupOpen}
                    selectedFare={selectedFare}
                    setSelectedFare={setSelectedFare}
                    loadingFareRules={loadingFareRules}
                    setLoadingFareRules={setLoadingFareRules}
                    handleFareRuleClick={handleFareRuleClick}
                    closePopup={closePopup}
                    activeSegment={activeSegment}
                    whatsAppShareLimit={whatsAppShareLimit}
                    checkOutOfPolicyForFlight={checkOutOfPolicyForFlight}
                    flightsRequest={flightsRequest}
                    regionId={regionId}
                    findTravelersMissingApproval={findTravelersMissingApproval}
                    onFlightSelection={handleFlightSelectionFromViewPrice}
                    isPopupOpen={isPopupOpen}
                    fareRuleData={fareRuleData}
                    flight={flight}
                  />
                </>
              )}
          </div>
        );
      })}

      {/* {isPopupOpen && (
        <div className="fixed inset-0 flex items-center justify-center z-[9999999]">
          <div className="absolute inset-0 bg-black opacity-50"></div>
          <FareRule
            isOpen={isPopupOpen}
            onClose={closePopup}
            fareRules={fareRuleData[selectedFare?.fareRuleId]}
            isLoading={loadingFareRules}
          />
        </div>
      )} */}

      {shareData.length > 0 && (
        <BottomSheet
          isOpen={isOpenB}
          onClose={handleClose}
          data={shareData}
          setShareData={setShareData}
          journeyDetails={searchReqData}
          setParentSideSheet={setIsOpenB}
          whatsAppShareLimit={whatsAppShareLimit}
        />
      )}
    </>
  );
}
