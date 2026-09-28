import { useState, useEffect, useMemo } from "react";
import { useSelector } from "react-redux";
import Image from "next/image";
import takeOff from "../../../images/corporate/takeOff.png";
import hotel from "../../../images/corporate/Group 14481.png";
import takeOff1 from "../../../images/corporate/logo 1 1.png";
import hotel1 from "../../../images/corporate/Group 14481 (1).png";
import HotelNavigation from "../booking/hotels/HotelNavigation";
import TravelPolicy from "@/components/corporate/booking/TravelPolicy/TravelPolicy";
import FlightNavigation from "./flights/flightNavigation";
import CarNavigation from "./carBusTrain/carNavigation";
import BusNavigation from "./carBusTrain/busNavigation";
import TrainNavigation from "./carBusTrain/trainNavigation";
import { TRAVEL_CATEGORIES } from "@/utils/constants";
import { faBus, faCar, faTrainTram } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

export default function Navigation() {
  const { travelersByCategory } = useSelector((state) => state.travellers);

  // For flights
  const selectedFlightTravelers = useMemo(
    () => travelersByCategory?.[TRAVEL_CATEGORIES.FLIGHTS] || [],
    [travelersByCategory]
  );

  // For hotels
  const selectedHotelTravelers = useMemo(
    () => travelersByCategory?.[TRAVEL_CATEGORIES.HOTELS] || [],
    [travelersByCategory]
  );

  // For trains
  const selectedTrainTravelers = useMemo(
    () => travelersByCategory?.[TRAVEL_CATEGORIES.TRAINS || "3"] || [],
    [travelersByCategory]
  );

  // For buses
  const selectedBusTravelers = useMemo(
    () => travelersByCategory?.[TRAVEL_CATEGORIES.BUS || "4"] || [],
    [travelersByCategory]
  );

  // For car rentals
  const selectedCarTravelers = useMemo(
    () => travelersByCategory?.[TRAVEL_CATEGORIES.CAR_RENTAL || "5"] || [],
    [travelersByCategory]
  );

  // Check if we have travelers for each category
  const hasFlights = selectedFlightTravelers.length > 0;
  const hasHotels = selectedHotelTravelers.length > 0;
  const hasTrains = selectedTrainTravelers.length > 0;
  const hasBuses = selectedBusTravelers.length > 0;
  const hasCars = selectedCarTravelers.length > 0;

  // Determine if any policy should be shown
  const hasAnyPolicy =
    hasFlights || hasHotels || hasTrains || hasBuses || hasCars;

  const [activeTab, setActiveTab] = useState(1);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "visible";
    }

    return () => {
      document.body.style.overflow = "visible";
    };
  }, [isOpen]);

  const handleCloseBottomSheet = () => {
    setIsOpen(false);
  };

  return (
    <>
      <div className="bg-[#ffffff] w-5/5 p-2 px-8 mb-0 sm:mb-14 mx-auto rounded-none sm:rounded-xl">
        <div className="flex justify-between gap-3 border-b border-[grey]">
          <div className="flex max-w-full overflow-x-auto">
            <button
              className={`${
                activeTab === 1
                  ? "border-b-2 border-[#155EEF] text-[#155EEF] font-bold"
                  : "text-[#1C1C1C]"
              } px-3 py-2 flex gap-2 items-center text-sm sm:text-base`}
              onClick={() => setActiveTab(1)}
            >
              {activeTab === 1 ? (
                <Image
                  src={takeOff}
                  alt="Flight Icon"
                  className="w-7 sm:w-10 h-7 sm:h-10"
                />
              ) : (
                <Image
                  src={takeOff1}
                  alt="Flight Icon"
                  className="w-7 sm:w-10 h-7 sm:h-10"
                />
              )}

              <span> Flights</span>
            </button>
            <button
              className={`${
                activeTab === 2
                  ? "border-b-2 border-[#155EEF] text-[#155EEF] font-bold"
                  : "text-[#1C1C1C]"
              } px-3 py-2 flex gap-2 items-center text-sm sm:text-base`}
              onClick={() => setActiveTab(2)}
            >
              {activeTab === 2 ? (
                <Image
                  src={hotel}
                  alt="Hotel Icon"
                  className="w-7 sm:w-10 h-7 sm:h-10"
                />
              ) : (
                <Image
                  src={hotel1}
                  alt="Hotel Icon"
                  className="w-7 sm:w-10 h-7 sm:h-10"
                />
              )}
              <span> Hotels</span>
            </button>

            <button
              className={`${
                activeTab === 3
                  ? "border-b-2 border-[#155EEF] text-[#155EEF] font-bold"
                  : "text-[#1C1C1C]"
              } px-3 py-2 flex gap-2 items-center text-sm sm:text-base`}
              onClick={() => setActiveTab(3)}
            >
              <FontAwesomeIcon
                icon={faTrainTram}
                className="w-5 sm:w-10 h-5 sm:h-7"
              />
              <span> Train</span>
            </button>

            <button
              className={`${
                activeTab === 4
                  ? "border-b-2 border-[#155EEF] text-[#155EEF] font-bold"
                  : "text-[#1C1C1C]"
              } px-3 py-2 flex gap-2 items-center text-sm sm:text-base`}
              onClick={() => setActiveTab(4)}
            >
              <FontAwesomeIcon
                icon={faBus}
                className="w-5 sm:w-10 h-5 sm:h-7"
              />
              <span> Bus</span>
            </button>
            <button
              className={`${
                activeTab === 5
                  ? "border-b-2 border-[#155EEF] text-[#155EEF] font-bold"
                  : "text-[#1C1C1C]"
              } px-3 py-2 flex gap-2 items-center text-sm sm:text-base`}
              onClick={() => setActiveTab(5)}
            >
              <FontAwesomeIcon
                icon={faCar}
                className="w-5 sm:w-10 h-5 sm:h-7"
              />
              <span> Cars</span>
            </button>
          </div>

          {hasAnyPolicy && (
            <button
              className="underline text-[#155EEF] items-end text-xs sm:text-base font-semibold mr-4"
              onClick={() => setIsOpen(true)}
            >
              Travel Policy{" "}
            </button>
          )}
        </div>

        {/* flight navigation*/}
        {activeTab === 1 && <FlightNavigation isDropdownVisible={false} />}
        {/* hotel navigation */}
        {activeTab === 2 && <HotelNavigation />}
        {activeTab === 3 && <TrainNavigation />}
        {activeTab === 4 && <BusNavigation />}
        {activeTab === 5 && <CarNavigation />}
        {isOpen && (
          <TravelPolicy
            isOpen={isOpen}
            onClose={handleCloseBottomSheet}
            initialPolicyTab={
              activeTab === 1
                ? "flight"
                : activeTab === 2
                ? "hotel"
                : activeTab === 3
                ? "train"
                : activeTab === 4
                ? "bus"
                : "car"
            }
            flightTravelers={selectedFlightTravelers}
            hotelTravelers={selectedHotelTravelers}
            trainTravelers={selectedTrainTravelers}
            busTravelers={selectedBusTravelers}
            carRentalTravelers={selectedCarTravelers}
          />
        )}
      </div>
    </>
  );
}
