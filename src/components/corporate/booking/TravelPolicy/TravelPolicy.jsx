import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBed,
  faPlaneUp,
  faXmark,
  faTrain,
  faBus,
  faCar
} from "@fortawesome/free-solid-svg-icons";
import { useState, useMemo, useEffect } from "react";
import { faCircleDown } from "@fortawesome/free-regular-svg-icons";
import Hotel from "./HotelTP";
import Flight from "./Flight";
import Train from "./TrainTravelPolicy";
import Bus from "./BusTravelPolicy";
import CarRental from "./CarRentalTravelPolicy";
import { TRAVEL_CATEGORIES } from "@/utils/constants";
import style from "./../styles.module.css";

export default function TravelPolicy({
  isOpen,
  onClose,
  initialPolicyTab = "flight",
  flightTravelers = [],
  hotelTravelers = [],
  trainTravelers = [],
  busTravelers = [],
  carRentalTravelers = [],
}) {
  const [selectedTravelerId, setSelectedTravelerId] = useState(null);
  const [activeTab, setActiveTab] = useState("flight");

  // Check if we have travelers for each travel type
  const hasFlights = flightTravelers?.length > 0;
  const hasHotels = hotelTravelers?.length > 0;
  const hasTrains = trainTravelers?.length > 0;
  const hasBuses = busTravelers?.length > 0;
  const hasCars = carRentalTravelers?.length > 0;

  // The travelers for the current tab
  let travelersForTab = useMemo(() => [], []);
  let travelCategory = TRAVEL_CATEGORIES.FLIGHTS; // default flights

  if (activeTab === "hotel") {
    travelersForTab = hotelTravelers;
    travelCategory = TRAVEL_CATEGORIES.HOTELS;
  } else if (activeTab === "train") {
    travelersForTab = trainTravelers;
    travelCategory = TRAVEL_CATEGORIES.TRAINS || "3";
  } else if (activeTab === "bus") {
    travelersForTab = busTravelers;
    travelCategory = TRAVEL_CATEGORIES.BUS || "4";
  } else if (activeTab === "car") {
    travelersForTab = carRentalTravelers;
    travelCategory = TRAVEL_CATEGORIES.CAR_RENTAL || "5";
  } else {
    travelersForTab = flightTravelers;
    travelCategory = TRAVEL_CATEGORIES.FLIGHTS;
  }

  useEffect(() => {
    if (isOpen) {
      setActiveTab(initialPolicyTab);
    }
  }, [isOpen, initialPolicyTab]);

  useEffect(() => {
    if (!travelersForTab.length) {
      // No travelers for this tab => clear selection
      setSelectedTravelerId(null);
      return;
    }
    const foundTraveler = travelersForTab.find(
      (t) => t.value === selectedTravelerId
    );
    if (!foundTraveler) {
      // The previously selected traveler doesn't exist here => fallback to first
      setSelectedTravelerId(travelersForTab[0].value);
    }
  }, [travelersForTab, selectedTravelerId]);

  // Manage which tabs are actually available
  let availableTabs = useMemo(() => [], []);
  if (hasFlights) availableTabs.push("flight");
  if (hasHotels) availableTabs.push("hotel");
  if (hasTrains) availableTabs.push("train");
  if (hasBuses) availableTabs.push("bus");
  if (hasCars) availableTabs.push("car");

  // If the user tries to open a tab we don't have => switch to a valid one
  useEffect(() => {
    if (!availableTabs.includes(activeTab)) {
      // e.g. activeTab="hotel" but we only have flight
      setActiveTab(availableTabs[0]); // fallback to the first valid tab
    }
  }, [availableTabs, activeTab]);

  useEffect(() => {
    const handleBodyScroll = () => {
      document.body.style.overflow = isOpen ? "hidden" : "auto";
    };

    handleBodyScroll();
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [isOpen]);

  // The currently selected traveler object
  const currentTraveler = travelersForTab.find(
    (t) => t.value === selectedTravelerId
  );

  // A helper to parse the policy for the current travel category
  function parsePolicyForCategory(travelerData, category) {
    if (!travelerData?.travelPolicyDetails?.length) return null;
    const policyConfig = travelerData.travelPolicyDetails[0].policyConfigData;
    if (!policyConfig) return null;
    return policyConfig.find((cfg) => cfg.travelCategory === category) || null;
  }

  // The actual policy object
  const policyObj = currentTraveler
    ? parsePolicyForCategory(currentTraveler.data, travelCategory)
    : null;

  if (!isOpen) return null;

  // If no travelers for any category => hide
  if (!hasFlights && !hasHotels && !hasTrains && !hasBuses && !hasCars) {
    return null; // Nothing to show
  }

  // If we have no travelers in the current tab => no need to show anything
  if (travelersForTab.length === 0) {
    // e.g. user only had flight travelers but clicked "Hotel" => empty
    return null;
  }

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999999999999]" onClick={onClose}>
        <div
          className={`bg-white w-full h-fit max-w-3xl mx-2 sm:mx-auto rounded-lg relative z-50 ${style.companyMob} ` }
          onClick={(e) => e.stopPropagation()}
        >
          <div className="p-0">
            <div className="text-xl font-semibold text-[#171A19] mb-1 flex justify-between">
              Travel Policy
              <span onClick={onClose}>
                <FontAwesomeIcon
                  icon={faXmark}
                  className="text-[#155EEF] text-sm bg-[#155EEF21] rounded-full p-1 cursor-pointer"
                />
              </span>
            </div>
            <div className="p-1">
              {/* Employee List */}
              <div className="flex space-x-4 overflow-x-auto">
                {travelersForTab.map((trav) => (
                  <div
                    key={trav.id}
                    className={`px-3 py-1 cursor-pointer rounded-2xl text-sm whitespace-nowrap ${trav.value === selectedTravelerId
                      ? "bg-[#155EEF] text-white font-semibold"
                      : "text-[#155EEF] font-medium border-1 border-[#155EEF50]"
                      }`}
                    onClick={() => setSelectedTravelerId(trav.value)}
                  >
                    {trav.label}
                  </div>
                ))}
              </div>

              {/* Selected Employee Details */}
              <div className="mt-2 p-2 rounded-lg bg-white">
                <div className="flex justify-between mt-2 overflow-x-auto">
                  <div className="flex">
                    {hasFlights && (
                      <button
                        className={`py-2 px-4 text-xs sm:text-base ${activeTab === "flight"
                          ? "border-b-2 border-[#155EEF] text-[#155EEF] font-bold"
                          : "text-gray-400"
                          } flex gap-2 items-center whitespace-nowrap`}
                        onClick={() => setActiveTab("flight")}
                      >
                        <FontAwesomeIcon icon={faPlaneUp} />
                        <span> Flights</span>
                      </button>
                    )}
                    {hasHotels && (
                      <button
                        className={`py-2 px-4 text-xs sm:text-base ${activeTab === "hotel"
                          ? "border-b-2 border-[#155EEF] text-[#155EEF] font-bold"
                          : "text-gray-400"
                          } flex gap-2 items-center whitespace-nowrap`}
                        onClick={() => setActiveTab("hotel")}
                      >
                        <FontAwesomeIcon icon={faBed} />
                        <span> Hotels</span>
                      </button>
                    )}
                    {hasTrains && (
                      <button
                        className={`py-2 px-4 text-xs sm:text-base ${activeTab === "train"
                          ? "border-b-2 border-[#155EEF] text-[#155EEF] font-bold"
                          : "text-gray-400"
                          } flex gap-2 items-center whitespace-nowrap`}
                        onClick={() => setActiveTab("train")}
                      >
                        <FontAwesomeIcon icon={faTrain} />
                        <span> Trains</span>
                      </button>
                    )}
                    {hasBuses && (
                      <button
                        className={`py-2 px-4 text-xs sm:text-base ${activeTab === "bus"
                          ? "border-b-2 border-[#155EEF] text-[#155EEF] font-bold"
                          : "text-gray-400"
                          } flex gap-2 items-center whitespace-nowrap`}
                        onClick={() => setActiveTab("bus")}
                      >
                        <FontAwesomeIcon icon={faBus} />
                        <span> Buses</span>
                      </button>
                    )}
                    {hasCars && (
                      <button
                        className={`py-2 px-4 text-xs sm:text-base ${activeTab === "car"
                          ? "border-b-2 border-[#155EEF] text-[#155EEF] font-bold"
                          : "text-gray-400"
                          } flex gap-2 items-center whitespace-nowrap`}
                        onClick={() => setActiveTab("car")}
                      >
                        <FontAwesomeIcon icon={faCar} />
                        <span> Cars</span>
                      </button>
                    )}
                  </div>
                  {/* <div className="flex">
                    <FontAwesomeIcon
                      icon={faCircleDown}
                      className="text-[#4A4A4A80] font-light py-2 px-1 text-sm"
                    />
                  </div> */}
                </div>

                {/* Tab Content */}
                <div className="mt-2">
                  {activeTab === "hotel" && <Hotel policyObj={policyObj} />}
                  {activeTab === "flight" && <Flight policyObj={policyObj} />}
                  {activeTab === "train" && <Train policyObj={policyObj} />}
                  {activeTab === "bus" && <Bus policyObj={policyObj} />}
                  {activeTab === "car" && <CarRental policyObj={policyObj} />}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}