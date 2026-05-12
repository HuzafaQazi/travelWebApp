import React, { useState, useEffect } from "react";
import Image from "next/image";
import "tailwindcss/tailwind.css";

// Room pricing data - should match the main component
const roomPricing = {
  "Deluxe King / Twin": {
    Single: { base: 5040, tax: 0, net: 5040 },
    Double: { base: 5600, tax: 0, net: 5600 },
    Triple: { base: 7280, tax: 0, net: 7280 },
  },
  Studio: {
    Single: { base: 5600, tax: 0, net: 5600 },
    Double: { base: 6160, tax: 0, net: 6160 },
  },
  "Elite King": {
    Single: { base: 10620, tax: 0, net: 10620 },
    Double: { base: 10620, tax: 0, net: 10620 },
    Triple: { base: 11682, tax: 0, net: 11682 },
  },
  "Elite Family": {
    Triple: { base: 12390, tax: 0, net: 12390 },
    "4 Pax": { base: 12390, tax: 0, net: 12390 },
  },
  Suite: {
    Triple: { base: 18880, tax: 0, net: 18880 },
    "4 Pax": { base: 18880, tax: 0, net: 18880 },
  },
};

// Early check-in and late check-out options
const EARLY_LATE_OPTIONS = [
  {
    id: 1,
    title: "Early Check-in",
    timing: "Before 6 AM",
    description: "Check in before 6 AM",
    priceType: "fullNight",
    image: "/img/event/early-checkin-before-6am.jpg",
  },
  {
    id: 2,
    title: "Early Check-in",
    timing: "6 AM to 11 AM",
    description: "Check in between 6 AM to 11 AM",
    priceType: "halfDay",
    image: "/img/event/early-checkin-6am-11am.jpg",
  },
  {
    id: 3,
    title: "Late Check-out",
    timing: "12 PM to 5 PM",
    description: "Check out between 12 PM to 5 PM",
    priceType: "halfDay",
    image: "/img/event/late-checkout-12pm-5pm.jpg",
  },
  {
    id: 4,
    title: "Late Check-out",
    timing: "5 PM to 7 PM",
    description: "Check out between 5 PM to 7 PM",
    priceType: "fullDay",
    image: "/img/event/late-checkout-5pm-7pm.jpg",
  },
];

export default function AccommodationOptions({
  onSelect,
  selectedOptions = [],
  roomCategory,
  occupancyType,
  isSharing = false,
}) {
  const [selected, setSelected] = useState(null); // For modal
  const [addedOptions, setAddedOptions] = useState(selectedOptions);

  // Update local state when parent updates selected options
  useEffect(() => {
    setAddedOptions(selectedOptions);
  }, [selectedOptions]);

  const calculatePrice = (option) => {
    const roomPrice = roomPricing[roomCategory]?.[occupancyType]?.net || 0;
    let price = 0;

    if (option.priceType === "fullNight" || option.priceType === "fullDay") {
      price = roomPrice;
    } else if (option.priceType === "halfDay") {
      price = Math.round(roomPrice / 2);
    }

    // Apply sharing room discount if applicable
    if (isSharing) {
      const occupants = {
        Double: 2,
        Triple: 3,
        "4 Pax": 4,
      };
      const numberOfOccupants = occupants[occupancyType] || 2;
      price = Math.round(price / numberOfOccupants);
    }

    return price;
  };

  const getPriceLabel = (option) => {
    if (option.priceType === "fullNight") return "Full Night Charges";
    if (option.priceType === "halfDay") return "Half Day Charges";
    if (option.priceType === "fullDay") return "Full Day Charges";
    return "";
  };

  const handleAdd = (option) => {
    const optionWithPrice = {
      ...option,
      price: calculatePrice(option),
      priceLabel: getPriceLabel(option),
    };
    const newOptions = [...addedOptions, optionWithPrice];
    setAddedOptions(newOptions);
    if (onSelect) {
      onSelect(newOptions);
    }
    setSelected(null); // Close modal after add
  };

  const handleRemove = (id) => {
    const newOptions = addedOptions.filter((opt) => opt.id !== id);
    setAddedOptions(newOptions);
    if (onSelect) {
      onSelect(newOptions);
    }
    setSelected(null); // Close modal after remove
  };

  const isAdded = (id) => {
    return addedOptions.some((opt) => opt.id === id);
  };

  return (
    <div className="p-6 bg-white m-2 sm:m-0 shadow-lg rounded-lg">
      <h2 className="text-2xl font-semibold mb-4">
        Early Check-in / Late Check-out Options
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {EARLY_LATE_OPTIONS.map((option) => {
          const price = calculatePrice(option);
          const priceLabel = getPriceLabel(option);

          return (
            <div
              key={option.id}
              className="bg-white shadow-md rounded-lg overflow-hidden"
            >
              <div className="p-4">
                <h3 className="text-lg font-bold">{option.title}</h3>
                <p className="text-gray-700">{option.timing}</p>
                <p className="text-sm text-gray-600 mt-1">{priceLabel}</p>
                <button
                  type="button"
                  onClick={() => setSelected(option)}
                  className="text-[#028fa3] font-semibold flex items-center mt-2"
                >
                  SEE DETAILS →
                </button>
                <p className="text-gray-800 font-bold mt-2">
                  ₹{price.toLocaleString("en-IN")}{" "}
                  <span className="text-gray-500">/room</span>
                </p>
                <button
                  type="button"
                  className={`border mt-3 px-4 py-2 w-full rounded-md ${
                    isAdded(option.id) ? "bg-red-500 text-white" : ""
                  }`}
                  onClick={() =>
                    isAdded(option.id)
                      ? handleRemove(option.id)
                      : setSelected(option)
                  }
                >
                  {isAdded(option.id) ? "REMOVE" : "ADD"}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal */}
      {selected && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center p-4 z-50">
          <div className="bg-white p-2 rounded-lg overflow-hidden max-w-3xl w-full">
            <div className="flex justify-end p-1">
              <button
                type="button"
                onClick={() => setSelected(null)}
                className="text-xl"
              >
                ✖
              </button>
            </div>
            <div className="flex flex-col md:flex-row">
              <div className="flex flex-col py-2 px-4 w-full">
                <div className="text-xl font-bold">{selected.title}</div>
                <div className="text-lg font-semibold text-gray-700">
                  {selected.timing}
                </div>
                <div className="text-gray-600 mb-4">{selected.description}</div>
                <div className="text-md text-gray-700 font-medium mb-2">
                  {getPriceLabel(selected)}
                </div>
                <div className="text-lg font-bold">
                  ₹{calculatePrice(selected).toLocaleString("en-IN")}{" "}
                  <span className="text-gray-500">/room</span>
                </div>
                {isSharing && (
                  <div className="text-sm text-gray-600 mt-1">
                    (Sharing room discount applied)
                  </div>
                )}
                {isAdded(selected.id) ? (
                  <button
                    type="button"
                    className="bg-red-500 text-white px-6 py-2 w-full mt-8 rounded-md"
                    onClick={() => handleRemove(selected.id)}
                  >
                    REMOVE
                  </button>
                ) : (
                  <button
                    type="button"
                    className="bg-[#028fa3] text-white px-6 py-2 w-full mt-8 rounded-md"
                    onClick={() => handleAdd(selected)}
                  >
                    ADD
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
