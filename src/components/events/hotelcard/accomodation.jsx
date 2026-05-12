import React, { useState, useEffect } from "react";
import Image from "next/image";
import "tailwindcss/tailwind.css";
import pako from "pako";

const accommodations = [
  {
    id: 1,
    title: "Early check-in at noon",
    description:
      "Enjoy the convenience of an early check-in to your room at noon.",
    price: 3920.0,
    image: "/img/event/image (1).jpg",
  },
  {
    id: 2,
    title: "2 pm late check-out",
    description: "Stay longer with a 2 pm late check-out option for your room.",
    price: 3920.0,
    image: "/img/event/image (2).jpg",
  },
];

export default function AccommodationOptions() {
  const [selected, setSelected] = useState(null);
  const [addedAccommodations, setAddedAccommodations] = useState([]);
  const [bookingData, setBookingData] = useState(null);

  // Load booking data from session storage
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

        // Initialize addedAccommodations if it exists in storage
        const savedAddons = sessionStorage.getItem("eventBookingAddons");
        if (savedAddons) {
          setAddedAccommodations(JSON.parse(savedAddons));
        }
      }
    } catch (error) {
      console.error("Error loading booking data:", error);
    }
  }, []);

  // Save addons to session storage whenever it changes
  useEffect(() => {
    if (addedAccommodations.length > 0) {
      sessionStorage.setItem(
        "eventBookingAddons",
        JSON.stringify(addedAccommodations)
      );

      // Update the total price in the main booking data
      if (bookingData) {
        const addonTotalPrice = addedAccommodations.reduce(
          (total, addon) => total + addon.price,
          0
        );

        try {
          const updatedBookingData = {
            ...bookingData,
            addonPrice: addonTotalPrice,
            totalPrice: bookingData.price + addonTotalPrice,
          };

          const compressedData = pako.deflate(
            JSON.stringify(updatedBookingData)
          );
          sessionStorage.setItem("eventBookingData", compressedData);
        } catch (error) {
          console.error("Error updating booking data:", error);
        }
      }
    } else {
      sessionStorage.removeItem("eventBookingAddons");

      // Remove addon price from main booking data
      if (bookingData) {
        try {
          const updatedBookingData = {
            ...bookingData,
            addonPrice: 0,
            totalPrice: bookingData.price,
          };

          const compressedData = pako.deflate(
            JSON.stringify(updatedBookingData)
          );
          sessionStorage.setItem("eventBookingData", compressedData);
        } catch (error) {
          console.error("Error updating booking data:", error);
        }
      }
    }

    // Dispatch an event to notify other components
    const event = new CustomEvent("addonsChanged", {
      detail: addedAccommodations,
    });
    window.dispatchEvent(event);
  }, [addedAccommodations, bookingData]);

  const handleAddAccommodation = (acc) => {
    if (!addedAccommodations.some((item) => item.id === acc.id)) {
      setAddedAccommodations([...addedAccommodations, acc]);
    }
  };

  const handleRemoveAccommodation = (accId) => {
    setAddedAccommodations(
      addedAccommodations.filter((item) => item.id !== accId)
    );
    setSelected(null);
  };

  return (
    <div className="p-6 bg-white m-2 sm:m-0 shadow-lg rounded-lg">
      <h2 className="text-2xl font-semibold mb-4">Accommodation options</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {accommodations.map((acc) => {
          const isAdded = addedAccommodations.some(
            (item) => item.id === acc.id
          );
          return (
            <div
              key={acc.id}
              className="bg-white shadow-md rounded-lg overflow-hidden"
            >
              <Image
                src={acc.image}
                alt={acc.title}
                width={100}
                height={100}
                className="w-full sm:w-64 h-52 object-cover"
              />
              <div className="p-4">
                <h3 className="text-lg font-bold">{acc.title}</h3>
                <button
                  onClick={() => setSelected(acc)}
                  className="text-[#028fa3] font-semibold flex items-center mt-2"
                >
                  SEE DETAILS →
                </button>
                <p className="text-gray-800 font-bold mt-2">
                  INR {acc.price.toFixed(2)}{" "}
                  <span className="text-gray-500">/room</span>
                </p>
                <button
                  className={`border mt-3 px-4 py-2 w-full rounded-md ${
                    isAdded ? "bg-red-500 text-white" : ""
                  }`}
                  onClick={() => {
                    if (isAdded) {
                      handleRemoveAccommodation(acc.id);
                    } else {
                      handleAddAccommodation(acc);
                    }
                  }}
                >
                  {isAdded ? "REMOVE" : "ADD"}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal Popup */}
      {selected && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center p-4 z-50">
          <div className="bg-white p-2 rounded-lg overflow-hidden max-w-3xl w-full">
            <div className="flex justify-end p-1">
              <button onClick={() => setSelected(null)} className="text-xl">
                ✖
              </button>
            </div>
            <div className="flex flex-col md:flex-row">
              <Image
                src={selected.image}
                width={100}
                height={100}
                alt={selected.title}
                className="w-full md:w-1/2 h-64 rounded-lg m-1 object-cover"
              />
              <div className="flex flex-col py-2 px-4 w-full">
                <div className="text-xl font-bold">{selected.title}</div>
                <div className="text-gray-600 mb-4">{selected.description}</div>
                <div className="text-lg font-bold">
                  INR {selected.price.toFixed(2)}{" "}
                  <span className="text-gray-500">/room</span>
                </div>
                {addedAccommodations.some((item) => item.id === selected.id) ? (
                  <button
                    className="bg-red-500 text-white px-6 py-2 w-full items-end mt-12 rounded-md"
                    onClick={() => handleRemoveAccommodation(selected.id)}
                  >
                    REMOVE
                  </button>
                ) : (
                  <button
                    className="bg-[#028fa3] text-white px-6 py-2 w-full items-end mt-12 rounded-md"
                    onClick={() => {
                      handleAddAccommodation(selected);
                      setSelected(null);
                    }}
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
