import React, { useState, useEffect, useCallback, useMemo } from "react";
import pako from "pako";

const AirportTransfer = () => {
  const [selectedCab, setSelectedCab] = useState(null);
  const [flightBooked, setFlightBooked] = useState(null);
  const [selectedOption, setSelectedOption] = useState("Yes");
  const [flightNumber, setFlightNumber] = useState("");
  const [arrivalTime, setArrivalTime] = useState("");
  const [bookingData, setBookingData] = useState(null);

  const cabOptions = useMemo(
    () => [
      { type: "Sedan", price: 250, icon: "🚗" },
      { type: "SUV", price: 400, icon: "🚙" },
      { type: "Luxury", price: 650, icon: "🚘" },
    ],
    []
  );

  // Memoize getCabPrice to avoid dependency issues in useEffect
  const getCabPrice = useCallback(() => {
    if (!selectedCab) return 0;
    const cab = cabOptions.find((c) => c.type === selectedCab);
    return cab ? cab.price : 0;
  }, [selectedCab, cabOptions]);

  // Load booking data and any saved cab details from session storage on mount
  useEffect(() => {
    try {
      const compressedData = sessionStorage.getItem("eventBookingData");
      if (compressedData) {
        const numbersArray = compressedData.split(",").map(Number);
        const compressedUint8Array = new Uint8Array(numbersArray);

        const encodedResponse = pako.inflate(compressedUint8Array, {
          to: "string",
        });
        const bookingDetails = JSON.parse(encodedResponse);
        setBookingData(bookingDetails);

        // Initialize cab data if it exists in storage
        const savedCab = sessionStorage.getItem("eventBookingCab");
        if (savedCab) {
          const cabData = JSON.parse(savedCab);
          setSelectedCab(cabData.cabType);
          setFlightBooked(cabData.flightBooked);
          setSelectedOption(cabData.needAssistance || "Yes");
          setFlightNumber(cabData.flightNumber || "");
          setArrivalTime(cabData.arrivalTime || "");
        }
      }
    } catch (error) {
      console.error("Error loading booking data:", error);
    }
  }, []);

  // Determine if the cab form is complete.
  // For flightBooked === "yes", flight number and arrival time must be provided.
  const cabCompleted =
    selectedCab &&
    flightBooked &&
    (flightBooked === "no" ||
      (flightBooked === "yes" && flightNumber.trim() && arrivalTime.trim()));

  // Save cab details whenever state changes if a cab is selected and flightBooked is answered
  useEffect(() => {
    if (selectedCab && flightBooked) {
      const cabData = {
        cabType: selectedCab,
        flightBooked,
        needAssistance: selectedOption,
        flightNumber,
        arrivalTime,
        price: getCabPrice(),
      };
      sessionStorage.setItem("eventBookingCab", JSON.stringify(cabData));

      // Update main booking data if available
      if (bookingData) {
        try {
          let addonPrice = 0;
          const savedAddons = sessionStorage.getItem("eventBookingAddons");
          if (savedAddons) {
            const addons = JSON.parse(savedAddons);
            addonPrice = addons.reduce(
              (total, addon) => total + addon.price,
              0
            );
          }

          const updatedBookingData = {
            ...bookingData,
            cabPrice: getCabPrice(),
            addonPrice,
            totalPrice: bookingData.price + addonPrice + getCabPrice(),
          };

          const compressedData = pako.deflate(
            JSON.stringify(updatedBookingData)
          );
          sessionStorage.setItem("eventBookingData", compressedData);

          const event = new CustomEvent("cabChanged", { detail: cabData });
          window.dispatchEvent(event);
        } catch (error) {
          console.error("Error updating booking data:", error);
        }
      }
    }
  }, [
    selectedCab,
    flightBooked,
    selectedOption,
    flightNumber,
    arrivalTime,
    bookingData,
    getCabPrice,
  ]);

  const removeCab = () => {
    setSelectedCab(null);
    setFlightBooked(null);
    setSelectedOption("");
    setFlightNumber("");
    setArrivalTime("");
    sessionStorage.removeItem("eventBookingCab");

    if (bookingData) {
      try {
        let addonPrice = 0;
        const savedAddons = sessionStorage.getItem("eventBookingAddons");
        if (savedAddons) {
          const addons = JSON.parse(savedAddons);
          addonPrice = addons.reduce((total, addon) => total + addon.price, 0);
        }

        const updatedBookingData = {
          ...bookingData,
          cabPrice: 0,
          addonPrice,
          totalPrice: bookingData.price + addonPrice,
        };

        const compressedData = pako.deflate(JSON.stringify(updatedBookingData));
        sessionStorage.setItem("eventBookingData", compressedData);

        const event = new CustomEvent("cabChanged", { detail: null });
        window.dispatchEvent(event);
      } catch (error) {
        console.error("Error updating booking data:", error);
      }
    }
  };

  return (
    <div className="max-w-3xl m-2 sm:m-0 p-6 bg-white shadow-lg rounded-lg mt-2">
      <div className="text-2xl font-semibold mb-1">Airport Transfer</div>

      {/* Cab Selection and Flight Details Form */}
      <div>
        <div className="text-lg font-semibold mb-1">1. Select Your Cab</div>
        <div className="grid grid-cols-3 gap-4">
          {cabOptions.map((cab) => (
            <label key={cab.type} className="cursor-pointer">
              <input
                type="radio"
                name="cabType"
                value={cab.type}
                checked={selectedCab === cab.type}
                onChange={() => setSelectedCab(cab.type)}
                className="hidden"
              />
              <div
                className={`p-4 border rounded-lg text-center ${
                  selectedCab === cab.type
                    ? "border-blue-500 bg-blue-100"
                    : "border-gray-300"
                }`}
              >
                <div className="text-2xl">{cab.icon}</div>
                <div className="font-medium">{cab.type}</div>
                <div className="text-sm text-gray-600">₹{cab.price}</div>
              </div>
            </label>
          ))}
        </div>

        <div className="text-lg font-semibold mt-6">
          2. Is your flight booked?
        </div>
        <div className="flex gap-4 mt-2">
          <div
            className={`px-4 py-2 rounded-lg cursor-pointer ${
              flightBooked === "yes" ? "bg-blue-500 text-white" : "bg-gray-200"
            }`}
            onClick={() => setFlightBooked("yes")}
          >
            Yes
          </div>
          <div
            className={`px-4 py-2 rounded-lg cursor-pointer ${
              flightBooked === "no" ? "bg-blue-500 text-white" : "bg-gray-200"
            }`}
            onClick={() => setFlightBooked("no")}
          >
            No
          </div>
        </div>

        {/* If flight is booked, show input fields for flight details */}
        {flightBooked === "yes" && (
          <div className="mt-4 p-4 border rounded-lg bg-white">
            <div className="font-semibold mb-2">Enter Flight Details</div>
            <div className="mb-2">
              <input
                type="text"
                placeholder="Flight Number"
                value={flightNumber}
                onChange={(e) => setFlightNumber(e.target.value)}
                className="w-full p-2 border rounded-md bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <input
                type="time"
                placeholder="Arrival Time"
                value={arrivalTime}
                onChange={(e) => setArrivalTime(e.target.value)}
                className="w-full p-2 border rounded-md bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        )}

        {flightBooked === "no" && (
          <div className="mt-4 p-4 border rounded-lg bg-white">
            <div className="font-semibold">
              Do you need assistance in booking?
            </div>
            <div className="mt-2 flex gap-4">
              <div
                className={`px-4 py-2 border rounded-lg cursor-pointer flex items-center gap-2 ${
                  selectedOption === "Yes"
                    ? "bg-blue-500 text-white border-blue-500"
                    : "bg-gray-100"
                }`}
                onClick={() => setSelectedOption("Yes")}
              >
                Yes
              </div>
              <div
                className={`px-4 py-2 border rounded-lg cursor-pointer flex items-center gap-2 ${
                  selectedOption === "No"
                    ? "bg-blue-500 text-white border-blue-500"
                    : "bg-gray-100"
                }`}
                onClick={() => setSelectedOption("No")}
              >
                No
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Final Cab Summary Card (only shown if form is complete) */}
      {cabCompleted && (
        <div className="mt-6 bg-blue-50 p-4 rounded-lg border border-blue-200">
          <div className="flex justify-between items-center">
            <div className="font-semibold">{selectedCab} Transfer Selected</div>
            <button
              onClick={removeCab}
              className="text-red-500 font-medium hover:text-red-700"
            >
              REMOVE
            </button>
          </div>
          <div className="mt-2">
            <p>Price: ₹{getCabPrice()}</p>
            {flightBooked === "yes" && (
              <div className="mt-2">
                <p>
                  Flight #: <span className="font-medium">{flightNumber}</span>
                </p>
                <p>
                  Arrival Time:{" "}
                  <span className="font-medium">{arrivalTime}</span>
                </p>
              </div>
            )}
            {flightBooked === "no" && selectedOption && (
              <p>Need booking assistance: {selectedOption}</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AirportTransfer;
