import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCircleMinus, faShareNodes } from "@fortawesome/free-solid-svg-icons";
import { formatPrice } from "@/utils/common";
import style from "./style.module.css";
import showToast from "@/utils/toast";

const SideSheet = ({
  isOpen,
  onClose,
  flights,
  setShareData,
  journeyDetails,
  whatsAppShareLimit,
}) => {
  const [groupedFlights, setGroupedFlights] = useState([]);
  const [isSharing, setIsSharing] = useState(false);

  // Group flights based on journey type
  useEffect(() => {
    const journeyType = journeyDetails?.searchReqData?.journeyType;
    if (journeyType === "1") {
      // One-way: Keep flights separate
      setGroupedFlights(flights?.map((flight) => [flight]) || []);
    } else {
      // Two-way or Multi-city: Group flights by id
      const grouped = flights?.reduce((acc, flight) => {
        const existingGroup = acc.find((group) => group[0].id === flight.id);
        if (existingGroup) {
          existingGroup.push(flight);
        } else {
          acc.push([flight]);
        }
        return acc;
      }, []);
      setGroupedFlights(grouped || []);
    }
  }, [flights, journeyDetails]);

  if (!isOpen) return null;

  // ===== FLIGHT MANAGEMENT =====
  const handleRemoveFlight = (flightGroupToRemove) => {
    const updatedGroupedFlights = groupedFlights.filter(
      (group) => group !== flightGroupToRemove,
    );
    setGroupedFlights(updatedGroupedFlights);

    const updatedFlights = updatedGroupedFlights.flat();
    setShareData(updatedFlights);

    if (updatedFlights.length === 0) {
      onClose();
    }
  };

  const handleClearAll = () => {
    setGroupedFlights([]);
    setShareData([]);
  };

  // ===== GENERATE WHATSAPP MESSAGE =====
  const generateWhatsAppMessage = (flights) => {
    let message =
      "Hello, please find details with regards to your flight(s) query for:\n\n";

    const firstFlight = flights[0];
    const firstSegment = firstFlight.segments[0];
    const firstLeg = firstSegment.segment[0];
    const lastFlight = flights[flights.length - 1];
    const lastSegment = lastFlight.segments[0];
    const lastLeg = lastSegment.segment[lastSegment.segment.length - 1];

    const originCity = firstLeg.origin.airport.cityName;
    const destinationCity = lastLeg.destination.airport.cityName;

    message += `*${originCity} - ${destinationCity}*\n`;
    message += `${journeyDetails?.searchReqData?.adultCount} ${
      journeyDetails?.searchReqData?.adultCount > 1 ? "Adults" : "Adult"
    }\n`;
    message += `${journeyDetails?.searchReqData?.childCount} ${
      journeyDetails?.searchReqData?.childCount > 1 ? "Children" : "Child"
    }\n`;
    message += `${journeyDetails?.searchReqData?.infantCount} ${
      journeyDetails?.searchReqData?.infantCount > 1 ? "Infants" : "Infant"
    }\n`;
    message += `${firstLeg.cabinClassName || "Economy"}\n`;
    message += "-----------------------------------------------------------\n";

    flights.forEach((flight, index) => {
      const isReturn =
        index === 1 && journeyDetails.searchReqData.journeyType === "2";
      message += `${index + 1}. ${isReturn ? " RETURN :" : " ONWARD :"} ✈️ `;

      let airlineNames = new Set();
      let flightNumbers = [];

      flight.segments.forEach((segment) => {
        segment.segment.forEach((leg) => {
          airlineNames.add(leg.airline.airlineName);
          flightNumbers.push(
            `${leg.airline.airlineCode} - ${leg.airline.flightNumber}`,
          );
        });
      });

      const airlineNameString = Array.from(airlineNames).join(", ");
      const flightNumbersString = flightNumbers.join(",");

      message += `${airlineNameString} (${flightNumbersString}) : `;

      const viaCities = [];
      const layoverCities = [];

      flight.segments.forEach((segment) => {
        segment.segment.forEach((leg, legIndex) => {
          viaCities.push(
            `${leg.origin.airport.airportCode} (${leg.origin.airport.cityName})`,
          );

          // Add layover cities (excluding the first and last cities)
          if (legIndex > 0 && legIndex < segment.segment.length) {
            layoverCities.push(
              `${leg.origin.airport.cityName} (${leg.origin.airport.airportCode})`,
            );
          }
        });
      });

      const lastLegOfFlight =
        flight.segments[0].segment[flight.segments[0].segment.length - 1];

      viaCities.push(
        `${lastLegOfFlight.destination.airport.airportCode} (${lastLegOfFlight.destination.airport.cityName})`,
      );

      const routeString = viaCities.join(" - ");
      const layoverString =
        layoverCities.length > 0 ? ` (via ${layoverCities.join(", ")})` : "";

      message += `*${routeString}${layoverString}*\n`;

      const currentFirstLeg = flight.segments[0].segment[0];
      const departureTime = new Date(currentFirstLeg.origin.depTime);
      const arrivalTime = new Date(lastLegOfFlight.destination.arrTime);

      const departureTimeString = departureTime.toLocaleString("en-US", {
        weekday: "short",
        day: "2-digit",
        month: "short",
        year: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      });
      const arrivalTimeString = arrivalTime.toLocaleString("en-US", {
        weekday: "short",
        day: "2-digit",
        month: "short",
        year: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      });

      message += `Departure: *${departureTimeString}*\n`;
      message += `Arrival: *${arrivalTimeString}*\n`;

      const totalDuration = flight.segments[0].journeyDuration;
      const stops = flight.segments[0].stops;

      const hours = Math.floor(totalDuration / 60);
      const minutes = totalDuration % 60;
      const durationString = `${hours} h ${minutes} m`;

      message += `*${durationString} / ${stops} ${stops > 1 ? "stops" : "stop"}*\n`;

      const baggage =
        flight?.fare?.baggage || flight?.baggage || "Not specified";
      const cabinBaggage =
        flight?.fare?.cabinBaggage || flight?.cabinBaggage || "Not specified";

      const price = `Rs ${formatPrice(
        flight?.fare?.offeredFareRoundedOff || flight?.offeredFareRoundedOff,
      )}`;

      message += `*Baggage ${cabinBaggage} | ${baggage}*\n`;
      message += `*Price: ${price}*\n`;
      message +=
        "-----------------------------------------------------------\n";
    });

    message +=
      "Thank you for choosing *QUGO TRAVEL TECHNOLOGIES PRIVATE LIMITED*.\n";
    message += "In case of any support:\n";
    message += "☎️ Contact: 7204186969\n";
    message += "📧 Email: bookings@qugo.io\n";
    message +=
      "Airline ticket pricing is dynamic. Fares are valid as of now and might change at the time of issuance.";

    return message;
  };

  // ===== SHARE ON WHATSAPP WITH DESKTOP APP DETECTION =====
  const handleShare = async () => {
    if (groupedFlights.length === 0) {
      showToast("warning", "No flights to share!");
      return;
    }

    setIsSharing(true);

    try {
      const message = generateWhatsAppMessage(flights);
      const encodedMessage = encodeURIComponent(message);

      // Detect if mobile or desktop
      const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

      if (isMobile) {
        // ✅ MOBILE: Direct app open
        window.location.href = `whatsapp://send?text=${encodedMessage}`;
        setTimeout(() => setIsSharing(false), 1000);
      } else {
        // ✅ DESKTOP: Smart detection with fallback
        const whatsappAppUrl = `whatsapp://send?text=${encodedMessage}`;
        const whatsappWebUrl = `https://web.whatsapp.com/send?text=${encodedMessage}`;

        let appOpened = false;

        // Listen for visibility change (app opened = page hidden)
        const visibilityHandler = () => {
          if (document.hidden) {
            appOpened = true;
            document.removeEventListener("visibilitychange", visibilityHandler);
            setIsSharing(false);
          }
        };

        document.addEventListener("visibilitychange", visibilityHandler);

        // Try to open WhatsApp desktop app
        window.location.href = whatsappAppUrl;

        // After 2.5 seconds, if app didn't open, fallback to web
        setTimeout(() => {
          document.removeEventListener("visibilitychange", visibilityHandler);

          if (!appOpened) {
            console.log(
              "WhatsApp desktop app not detected, opening web version...",
            );
            window.open(whatsappWebUrl, "_blank");
          }

          setIsSharing(false);
        }, 2500);
      }
    } catch (error) {
      console.error("Error sharing:", error);
      alert("Failed to open WhatsApp. Please try again.");
      setIsSharing(false);
    }
  };

  // ===== HELPER FUNCTIONS =====
  const getJourneyTypeText = () => {
    const journeyType = journeyDetails?.searchReqData?.journeyType;
    const fromCity = journeyDetails?.fromCity;
    const toCity = journeyDetails?.toCity;

    switch (journeyType) {
      case "1":
        return `One way flights from ${fromCity} to ${toCity}`;
      case "2":
        return `Two way flight ${fromCity} to ${toCity} and back`;
      case "3": {
        const segments = journeyDetails?.searchReqData?.segments;
        const firstCity = segments[0].origin;
        const lastCity = segments[segments.length - 1].destination;
        return `Multi-city flights from ${firstCity} to ${lastCity}`;
      }
      default:
        return "Flight Details";
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const getDateDisplay = () => {
    const journeyType = journeyDetails?.searchReqData?.journeyType;
    if (journeyType === "2") {
      const departDate = formatDate(
        journeyDetails.searchReqData.segments[0].preferredDepartureTime,
      );
      const returnDate = formatDate(
        journeyDetails.searchReqData.segments[1]?.preferredDepartureTime,
      );
      return (
        <>
          Departure: <span className="font-semibold">{departDate}</span> |
          Return: <span className="font-semibold">{returnDate}</span>
        </>
      );
    } else if (journeyType === "3") {
      const firstDate = formatDate(
        journeyDetails.searchReqData.segments[0].preferredDepartureTime,
      );
      const lastDate = formatDate(
        journeyDetails.searchReqData.segments[
          journeyDetails.searchReqData.segments.length - 1
        ].preferredDepartureTime,
      );
      return (
        <>
          First Flight: <span className="font-semibold">{firstDate}</span> |
          Last Flight: <span className="font-semibold">{lastDate}</span>
        </>
      );
    }
    return (
      <>
        Departure:{" "}
        <span className="font-semibold">
          {formatDate(
            journeyDetails.searchReqData.segments[0].preferredDepartureTime,
          )}
        </span>
      </>
    );
  };

  const getCabinClassName = (cabinClass) => {
    const cabinClassMap = {
      1: "All",
      2: "Economy",
      3: "Premium Economy",
      4: "Business",
      5: "Premium Business",
      6: "First Class",
    };
    return cabinClassMap[cabinClass] || "Economy";
  };

  return createPortal(
    <>
      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-10 cursor-pointer"
          onClick={onClose}
        />
      )}

      {/* Side Sheet */}
      <div
        className={`fixed top-0 right-0 w-full md:w-[50%] h-full bg-white z-[99999] rounded-l-xl transition-transform ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="p-6 pb-4">
            <div className="flex justify-between items-start mb-4">
              <div className="flex-1">
                {journeyDetails?.searchReqData?.journeyType === "1" && (
                  <div className="text-lg font-bold mb-1">
                    Review WhatsApp Share Details ({groupedFlights.length}/
                    {whatsAppShareLimit})
                  </div>
                )}
                <div className="text-[#4a4a4a] text-xs font-normal">
                  Click share to forward flight details to your contacts via
                  WhatsApp
                </div>
              </div>
              <button
                onClick={onClose}
                className="text-2xl font-bold text-gray-500 hover:text-gray-700 ml-2 transition-colors"
              >
                &times;
              </button>
            </div>

            {/* Journey Details */}
            <div className="flex justify-between items-start">
              <div className="flex flex-col">
                <div className="font-bold text-lg text-[#000000]">
                  {getJourneyTypeText()}
                </div>
                <div className="font-normal text-xs text-gray-600 mt-1">
                  {getDateDisplay()} |{" "}
                  {getCabinClassName(
                    journeyDetails?.searchReqData?.segments?.[0]
                      ?.flightCabinClass,
                  )}{" "}
                  | {journeyDetails?.searchReqData?.adultCount}{" "}
                  {journeyDetails?.searchReqData?.adultCount > 1
                    ? "Adults"
                    : "Adult"}{" "}
                  | {journeyDetails?.searchReqData?.childCount}{" "}
                  {journeyDetails?.searchReqData?.childCount > 1
                    ? "children"
                    : "child"}
                  | {journeyDetails?.searchReqData?.infantCount}{" "}
                  {journeyDetails?.searchReqData?.infantCount > 1
                    ? "infants"
                    : "infant"}
                </div>
              </div>
              {journeyDetails?.searchReqData?.journeyType === "1" && (
                <button
                  onClick={handleClearAll}
                  className="text-sm text-blue-500 hover:text-blue-700 underline transition-colors"
                >
                  Clear all
                </button>
              )}
            </div>
          </div>

          {/* Flights List - Scrollable */}
          <div className={`flex-1 overflow-y-auto px-6 ${style.Notification}`}>
            <div className="space-y-4 bg-[#D9D9D940] p-2 rounded-lg">
              {groupedFlights.map((flightGroup, groupIndex) => (
                <div
                  key={groupIndex}
                  className="p-2 rounded-md bg-white shadow-sm"
                >
                  {flightGroup.map((flight, flightIndex) => {
                    const segments = flight.segments[0].segment;
                    const firstLeg = segments[0];
                    const lastLeg = segments[segments.length - 1];

                    const airlineName = firstLeg.airline.airlineName;
                    const airlineCode = `${firstLeg.airline.airlineCode} - ${firstLeg.airline.flightNumber}`;

                    const depAirportCode = firstLeg.origin.airport.airportCode;
                    const arrAirportCode =
                      lastLeg.destination.airport.airportCode;

                    const departureTime = new Date(firstLeg.origin.depTime);
                    const arrivalTime = new Date(lastLeg.destination.arrTime);

                    const totalDuration = flight.segments[0].journeyDuration;
                    const hours = Math.floor(totalDuration / 60);
                    const minutes = totalDuration % 60;
                    const durationString = `${hours}h ${minutes}m`;

                    const baggage = flight?.fare?.baggage || flight?.baggage;
                    const cabinBaggage =
                      flight?.fare?.cabinBaggage || flight?.cabinBaggage;
                    const price = `Rs ${formatPrice(
                      flight?.fare?.offeredFareRoundedOff ||
                        flight?.offeredFareRoundedOff,
                    )}`;
                    const seatsAvailable = firstLeg.seatsAvailable;

                    return (
                      <div
                        key={flightIndex}
                        className={flightIndex > 0 ? "mt-4 pt-4 border-t" : ""}
                      >
                        <div className="flex gap-2 sm:gap-5 items-center justify-between">
                          {/* Airline Info */}
                          <div className="flex items-center min-w-0">
                            <Image
                              src={firstLeg.airline.airlineLogoUrl}
                              alt={airlineName}
                              className="w-[20px] sm:w-[30px] h-fit flex-shrink-0"
                              width={30}
                              height={30}
                            />
                            <div className="flex flex-col ml-1 min-w-0">
                              <div className="font-semibold text-xxs sm:text-xs truncate">
                                {airlineName}
                              </div>
                              <div className="font-normal text-xxs sm:text-xs text-gray-600">
                                {airlineCode}
                              </div>
                            </div>
                          </div>

                          {/* Flight Times & Duration */}
                          <div className="flex flex-col flex-1">
                            <div className="flex items-center justify-between w-full space-x-3 sm:space-x-6">
                              {/* Departure */}
                              <div className="text-center">
                                <div className="font-semibold text-xxs sm:text-xs">
                                  {departureTime.toLocaleTimeString([], {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  })}
                                </div>
                                <div className="text-xxs sm:text-xs text-[#878786]">
                                  {depAirportCode}
                                </div>
                              </div>

                              {/* Duration */}
                              <div className="text-center flex-1">
                                <div className="text-xxs sm:text-xs text-gray-600">
                                  {durationString}
                                </div>
                                <div className="border-t-2 border-dotted border-gray-400 w-full my-1"></div>
                                <div className="text-xxs sm:text-xs text-gray-500">
                                  {flight.segments[0].stops}{" "}
                                  {flight.segments[0].stops > 1
                                    ? "Stops"
                                    : "Stop"}
                                </div>
                              </div>

                              {/* Arrival */}
                              <div className="text-center">
                                <div className="font-semibold text-xxs sm:text-sm">
                                  {arrivalTime.toLocaleTimeString([], {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  })}
                                </div>
                                <div className="text-xxs sm:text-sm text-[#878786]">
                                  {arrAirportCode}
                                </div>
                              </div>
                            </div>

                            {/* Baggage Info */}
                            <div className="flex items-center justify-center gap-2 w-full mt-2">
                              <span className="text-xxs sm:text-xs text-gray-600">
                                Baggage {cabinBaggage} | {baggage}
                              </span>
                            </div>
                          </div>

                          {/* Price */}
                          <div className="text-right min-w-[80px]">
                            <div className="font-normal text-xs text-gray-600">
                              Total Price
                            </div>
                            <div className="font-bold text-sm">{price}</div>
                            {seatsAvailable && (
                              <div className="text-[#FA5D04] text-xs font-normal mt-1 text-center">
                                {seatsAvailable} Seats Left
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}

                  {/* Remove Flight Group Button */}
                  {journeyDetails?.searchReqData?.journeyType === "1" && (
                    <div className="mt-2 text-right">
                      <button
                        onClick={() => handleRemoveFlight(flightGroup)}
                        className="text-[#028FA3] hover:text-[#026d7d] transition-colors"
                        title="Remove flight"
                      >
                        <FontAwesomeIcon icon={faCircleMinus} size="lg" />
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Footer - Share Button */}
          <div className="p-6 pt-4 border-t bg-white">
            <button
              onClick={handleShare}
              disabled={isSharing || groupedFlights.length === 0}
              className={`w-full py-3 rounded-xl font-semibold text-white transition-all flex items-center justify-center gap-2 ${
                isSharing || groupedFlights.length === 0
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-green-600 hover:bg-green-700 active:scale-95 shadow-md hover:shadow-lg"
              }`}
            >
              {isSharing ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Opening WhatsApp...
                </>
              ) : (
                <>
                  <FontAwesomeIcon icon={faShareNodes} />
                  Share on WhatsApp
                </>
              )}
            </button>
            <p className="text-center text-xs text-gray-500 mt-2">
              Select contacts from WhatsApp after clicking share
            </p>
          </div>
        </div>
      </div>
    </>,
    document.body,
  );
};

export default SideSheet;
