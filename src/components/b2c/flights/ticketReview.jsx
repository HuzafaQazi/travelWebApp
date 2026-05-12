import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faClock, faArrowLeft } from "@fortawesome/free-solid-svg-icons";
import Image from "next/image";
import { useState } from "react";
import FlightDetails from "@/components/flights/flightDetails/flightDetails";
import FareDetails from "@/components/flights/fareDetails/fareDetails";
import showToast from "@/utils/toast";
export default function TicketReview({ flightDetails, journeyTypeName }) {
  const formatDuration = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;

    const hoursText = hours > 0 ? `${hours} hr` : "";
    const minutesText = remainingMinutes > 0 ? ` ${remainingMinutes} mins` : "";

    return `${hoursText}${minutesText}`;
  };

  const [flightDetailsLoader, setFlightDetailsLoader] = useState(false);
  const [fareQuoteData, setFareQuoteData] = useState([]);
  const [flightDetailsIndex, setFlightDetailsIndex] = useState(null);
  const [fareDetailsLoader, setFareDetailsLoader] = useState(false);
  const [fareDetailsIndex, setFareDetailsIndex] = useState(null);
  const [fareDetailsData, setFareDetailsData] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("flightDetails");
  const [isFareDetailsOpen, setIsFareDetailsOpen] = useState(false);

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

  const handleCloseBottomSheet = () => {
    setIsOpen(false);
    setIsFareDetailsOpen(false);
  };

  const BottomSheetDetails = ({ isOpen, onClose, activeTab, flights }) => {
    return (
      <div>
        {isOpen && (
          <div
            className="fixed inset-0 w-full h-full bg-black/20 z-[9999999999999999] cursor-pointer"
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

  const handleFlightDuration = (departureTime, arrivalTime) => {
    const departureDate = new Date(departureTime);
    const arrivalDate = new Date(arrivalTime);

    // Get the start of the departure day
    const departureDayStart = new Date(
      departureDate.getFullYear(),
      departureDate.getMonth(),
      departureDate.getDate()
    );

    // Get the start of the arrival day
    const arrivalDayStart = new Date(
      arrivalDate.getFullYear(),
      arrivalDate.getMonth(),
      arrivalDate.getDate()
    );

    // Calculate the difference in days
    const timeDifference =
      arrivalDayStart.getTime() - departureDayStart.getTime();
    const daysDifference = timeDifference / (1000 * 3600 * 24);
    return Math.ceil(daysDifference);
  };

  return (
    <>
      {/* ticket review */}
      {flightDetails.map((flight, index) => {
        return flight?.segments?.map((segment, segmentIndex) => {
          const numOfDays = handleFlightDuration(
            segment.segment[0].origin.depTime,
            segment.segment[segment.segment.length - 1].destination.arrTime
          );

          return (
            <div
              key={`${index}-${segmentIndex}`}
              className="border-[1px] border-[#028FA354] mt-2 rounded-lg p-3 pb-4 bg-white"
            >
              {/* airlines and ways/class */}
              <div className="flex justify-between w-full">
                <div className="flex gap-2 items-center">
                  <div className="w-4 sm:w-8 h-4 sm:h-8 rounded-full overflow-hidden">
                    <Image
                      src={segment.segment[0].airline.airlineLogoUrl} // Ensure 'airline' is a valid image URL
                      alt="airline"
                      height={50}
                      width={50}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex items-center font-semibold text-xxxs sm:text-xxs text-[#000000] font-light">
                    <div>{segment?.segment[0]?.airline.airlineName}</div>,
                    <div>
                      {segment?.segment[0]?.airline.airlineCode}{" "}
                      {segment?.segment[0]?.airline.flightNumber}
                    </div>{" "}
                    {/* Adjust airline and flight details dynamically */}
                  </div>
                </div>
                <div className="text-xxxs sm:text-xs text-[#171A19] font-light flex gap-2">
                  <div className="border-[1px] border-[#028FA375] px-3 py-1 rounded-lg font-medium text-[#868687] flex justify-center items-center">
                    {segment?.segment[0]?.journeyTypeName || journeyTypeName}
                  </div>
                  <div className="border-[1px] border-[#028FA375] px-3 py-1 rounded-md font-medium text-[#868687] flex justify-center items-center">
                    {segment?.segment[0]?.cabinClassName}
                  </div>
                </div>
              </div>

              {/* flight date details */}
              <div className="flex justify-between text-xxxs sm:text-xs mt-3 font-semibold">
                <div>
                  {new Date(
                    segment.segment[0].origin.depTime
                  ).toLocaleDateString([], {
                    weekday: "short",
                    month: "short",
                    day: "2-digit",
                    year: "numeric",
                  })}
                </div>{" "}
                {/* Dynamically adjust this */}
                <div>
                  {new Date(
                    segment.segment[
                      segment.segment.length - 1
                    ].destination.arrTime
                  ).toLocaleDateString([], {
                    weekday: "short",
                    month: "short",
                    day: "2-digit",
                    year: "numeric",
                  })}
                </div>{" "}
                {/* Dynamically adjust this */}
              </div>

              {/* flight time details */}
              <div className="w-full flex justify-between items-center">
                <div className="min-w-1/12 w-fit text-base sm:text-xl font-semibold">
                  {new Date(
                    segment.segment[0].origin.depTime
                  ).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </div>
                <div className="w-8/12 flex flex-col items-center justify-start">
                  <div className="text-center text-xxxs sm:text-xs font-medium mb-1 text-[#171A1990]">
                    <FontAwesomeIcon icon={faClock} />
                    <span className="ml-1 font-semibold">
                      {formatDuration(
                        flight.segments[segmentIndex].journeyDuration
                      )}
                    </span>{" "}
                    |
                    <span className="ml-1 font-semibold">
                      {segment.stops} Stop
                    </span>
                  </div>
                  <div className="w-full h-1 border-t border-dashed border-[#868687]" />
                  <div className="text-center text-xxxs sm:text-xs font-medium text-[#868687]">
                    <span>
                      {flight.isRefundable ? "Refundable" : "Non-Refundable"} |{" "}
                      {segment.segment[0].cabinBaggage},
                      {segment.segment[0].baggage}
                    </span>
                  </div>
                </div>
                <div className="min-w-1/12 w-fit text-end text-base sm:text-xl font-semibold">
                  {new Date(
                    segment.segment[
                      segment.segment.length - 1
                    ].destination.arrTime
                  ).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                  {numOfDays > 0 && (
                    <span class="text-[9px] text-[#878786]">
                      (+{numOfDays}D)
                    </span>
                  )}
                </div>
              </div>

              {/* airport details */}
              <div className="w-full flex justify-between mt-1">
                <div>
                  <div className="text-[#028fa3] text-sm sm:text-lg font-semibold">
                    {segment.segment[0].origin.airport.airportCode}
                  </div>
                  <div className="text-xxxs sm:text-xs font-medium text-[#868687] leading-[14px] sm:leading-[5px]">
                    {segment.segment[0].origin.airport.airportName}
                  </div>
                </div>
                <div className="text-end">
                  <div className="text-[#028fa3] text-sm sm:text-lg font-semibold">
                    {
                      segment.segment[segment.segment.length - 1].destination
                        .airport.airportCode
                    }
                  </div>
                  <div className="text-xxxs sm:text-xs font-medium text-[#868687] leading-[5px]">
                    {
                      segment.segment[segment.segment.length - 1].destination
                        .airport.airportName
                    }
                  </div>
                </div>
              </div>

              <button
                className="font-medium underline text-sm hover:underline text-[#028fa3]"
                onClick={() => handleTabClick("flightDetails", flight, index)}
              >
                Flight Details
              </button>

              {(flightDetailsIndex === index || fareDetailsIndex === index) && (
                <BottomSheetDetails
                  isOpen={isOpen}
                  onClose={handleCloseBottomSheet}
                  activeTab={activeTab}
                  // flights={flightsResponse?.flightsResults[0].flights}
                />
              )}
            </div>
          );
        });
      })}
    </>
  );
}
