import React, { useState, useEffect } from "react";
import pako from "pako";
import axios, { getTabSpecificData } from "@/utils/axios/axios";
import config from "@/config";
import { routeToPg } from "@/paymentGateways/pgRouting";
import showToast from "@/utils/toast";

const BookingSummary = () => {
  const [bookingData, setBookingData] = useState(null);
  const [addedAccommodations, setAddedAccommodations] = useState([]);
  const [cabData, setCabData] = useState(null);
  const [totalPrice, setTotalPrice] = useState(0);
  const [taxAmount, setTaxAmount] = useState(0);
  const [grandTotal, setGrandTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [roomAvailability, setRoomAvailability] = useState(null);

  // Load booking data from session storage
  useEffect(() => {
    loadBookingData();

    // Listen for changes in addons or cab selections
    window.addEventListener("addonsChanged", loadBookingData);
    window.addEventListener("cabChanged", loadBookingData);

    return () => {
      window.removeEventListener("addonsChanged", loadBookingData);
      window.removeEventListener("cabChanged", loadBookingData);
    };
  }, []);

  const loadBookingData = () => {
    try {
      // Load main booking data
      const compressedData = sessionStorage.getItem("eventBookingData");
      if (compressedData) {
        const numbersArray = compressedData.split(",").map(Number);
        const compressedUint8Array = new Uint8Array(numbersArray);

        const encodedResponse = pako.inflate(compressedUint8Array, {
          to: "string",
        });

        const bookingDetails = JSON.parse(encodedResponse);
        setBookingData(bookingDetails);

        // Calculate base price
        let basePrice = bookingDetails.price || 0;

        // Load addons
        const savedAddons = sessionStorage.getItem("eventBookingAddons");
        if (savedAddons) {
          const addons = JSON.parse(savedAddons);
          setAddedAccommodations(addons);
        } else {
          setAddedAccommodations([]);
        }

        // Load cab data
        const savedCab = sessionStorage.getItem("eventBookingCab");
        if (savedCab) {
          const cab = JSON.parse(savedCab);
          setCabData(cab);
        } else {
          setCabData(null);
        }

        // Calculate total price
        const addonPrice = addedAccommodations.reduce(
          (total, addon) => total + addon.price,
          0
        );
        const cabPrice = cabData ? cabData.price : 0;
        const subtotal = basePrice + addonPrice + cabPrice;
        setTotalPrice(subtotal);

        // Calculate tax (18%)
        // const tax = subtotal * 0.18;
        const tax = 0;
        setTaxAmount(tax);

        // Calculate grand total
        setGrandTotal(subtotal + tax);
      }
    } catch (error) {
      console.error("Error loading booking data:", error);
    }
  };

  useEffect(() => {
    if (bookingData) {
      const basePrice = bookingData.price || 0;
      const addonPrice = addedAccommodations.reduce(
        (total, addon) => total + (addon.price || 0),
        0
      );
      const cabPrice = cabData ? cabData.price || 0 : 0;
      const subtotal = basePrice + addonPrice + cabPrice;
      setTotalPrice(subtotal);
      const tax = 0; // Adjust if tax calculation is needed
      setTaxAmount(tax);
      setGrandTotal(subtotal + tax);
    }
  }, [bookingData, addedAccommodations, cabData]);

  const fetchRoomAvailability = async (roomType) => {
    try {
      const response = await axios.get(
        `${config.EVENTS_ROOM_AVAILS}/${roomType}`
      );
      if (response?.data?.status) {
        setRoomAvailability(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching room availability:", error);
    }
  };

  useEffect(() => {
    if (bookingData && bookingData.roomType) {
      fetchRoomAvailability(bookingData.roomType);
    }
  }, [bookingData]);

  // Function to format date
  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return {
      day: date.getDate().toString().padStart(2, "0"),
      month: date.toLocaleString("default", { month: "short" }),
      weekday: date.toLocaleString("default", { weekday: "short" }),
    };
  };

  console.log(bookingData);

  const checkRoomAvailability = async () => {
    if (!bookingData || !bookingData.roomType) {
      showToast("info", "Room type information is missing.");
      return false;
    }

    try {
      // Refresh availability before checking
      const response = await axios.get(
        `${config.EVENTS_ROOM_AVAILS}/${bookingData.roomType}`
      );

      if (response?.data?.status) {
        const availability = response.data.data;
        setRoomAvailability(availability);

        if (availability.availableRooms === 0) {
          showToast("error", `No rooms available`);
          return false;
        }

        // Check if there are enough rooms available
        const requestedRooms = bookingData?.numberOfRooms || 1;
        if (availability.availableRooms < requestedRooms) {
          showToast(
            "info",
            `Only ${availability.availableRooms} ${bookingData.roomType} rooms available. Please adjust your booking.`
          );
          return false;
        }
        return true;
      }
      return false;
    } catch (error) {
      console.error("Error checking room availability:", error);
      showToast(
        "error",
        "Could not verify room availability. Please try again."
      );
      return false;
    }
  };

  const handleContinueBooking = async () => {
    setIsLoading(true);

    const userId = getTabSpecificData("userID");
    const eventId = getTabSpecificData("event_id");

    try {
      const isAvailable = await checkRoomAvailability();
      if (!isAvailable) {
        setIsLoading(false);
        return;
      }
      const orderData = {
        eventId,
        userId,
        booking: {
          ...bookingData,
          nights:
            bookingData.checkinDate && bookingData.checkoutDate
              ? Math.ceil(
                  (new Date(bookingData.checkoutDate) -
                    new Date(bookingData.checkinDate)) /
                    (1000 * 60 * 60 * 24)
                )
              : 0,
        },
        // Addons information
        addons: addedAccommodations,
        // Cab details
        transportation: cabData,
        // Pricing breakdown
        pricing: {
          basePrice: bookingData.price || 0,
          addonPrice: addedAccommodations.reduce(
            (total, addon) => total + addon.price,
            0
          ),
          cabPrice: cabData ? cabData.price : 0,
          taxAmount: taxAmount,
          totalPrice: grandTotal,
        },
      };

      const orderResponse = await axios.post(
        `${config.EVENTS_CREATE_ORDER}`,
        orderData
      );

      if (orderResponse?.data?.status) {
        const bookingId = orderResponse?.data?.data?.bookingId;

        const pgResponse = await axios.get(config.GET_PAYMENT_GATEWAY);

        if (pgResponse?.data?.status === "SUCCESS") {
          const pgCode = pgResponse?.data?.data?.pgCode;
          const mobile = getTabSpecificData("phoneNumber");

          const payload = {
            pgCode: pgCode,
            redirectUrl: `${config.WEB_BASE_URL}Posiflex/Confirm?bookingId=${bookingId}`,
            travelCategory: 4,
            walletAmount: 0,
            charges: 0,
            paymentCategory: "BOOKING",
            bookingId: bookingId,
            orderAmount: parseFloat(grandTotal),
            orderCurrency: "INR",
            customerDetails: {
              customerName: null,
              customerEmail: null,
              customerPhone: mobile,
            },
          };
          const response = await axios.post(
            `${config.GET_SESSION_ID}`,
            payload
          );
          if (response?.data?.status === "SUCCESS") {
            const session = response?.data?.data;
            const queryParams = {
              bookingId: bookingId,
            };
            await routeToPg(
              pgCode,
              session.paymentSessionId,
              queryParams,
              bookingId,
              4,
              "BOOKING",
              "",
              "",
              {
                customReturnPath: "Posiflex/Confirm",
                customQueryParams: {
                  bookingId: bookingId,
                },
              }
            );
          }
        }
      }
    } catch (error) {
      console.error("Error creating order:", error);
      showToast(
        "error",
        "There was an error processing your booking. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveAddon = (addonId) => {
    const updatedAddons = addedAccommodations.filter(
      (addon) => addon.id !== addonId
    );
    sessionStorage.setItem("eventBookingAddons", JSON.stringify(updatedAddons));
    setAddedAccommodations(updatedAddons);

    // Update the total price in the main booking data
    if (bookingData) {
      try {
        const addonPrice = updatedAddons.reduce(
          (total, addon) => total + addon.price,
          0
        );
        const cabPrice = cabData ? cabData.price : 0;

        const updatedBookingData = {
          ...bookingData,
          addonPrice: addonPrice,
          totalPrice: bookingData.price + addonPrice + cabPrice,
        };

        const compressedData = pako.deflate(JSON.stringify(updatedBookingData));
        sessionStorage.setItem("eventBookingData", compressedData);

        // Reload booking data
        loadBookingData();

        // Dispatch an event to notify other components
        const event = new CustomEvent("addonsChanged", {
          detail: updatedAddons,
        });
        window.dispatchEvent(event);
      } catch (error) {
        console.error("Error updating booking data:", error);
      }
    }
  };

  if (!bookingData) {
    return (
      <div className="max-w-md mx-auto bg-white p-4 rounded-lg h-fit shadow-md border">
        Loading...
      </div>
    );
  }

  const checkin = formatDate(bookingData.checkinDate);
  const checkout = formatDate(bookingData.checkoutDate);

  // Calculate nights between checkin and checkout
  const nights =
    bookingData.checkinDate && bookingData.checkoutDate
      ? Math.ceil(
          (new Date(bookingData.checkoutDate) -
            new Date(bookingData.checkinDate)) /
            (1000 * 60 * 60 * 24)
        )
      : 0;

  return (
    <div className="max-w-full sm:max-w-md mx-[2%] sm:mx-[0%] bg-white p-4 rounded-lg h-fit shadow-md border">
      <div className="text-center text-lg font-bold">Booking Summary</div>

      <div className="flex justify-between items-center mt-4">
        <div className="text-center">
          <div className="text-sm font-semibold">Check-in</div>
          <div className="text-xl font-bold">
            {checkin.day} {checkin.month}
          </div>
          <div className="text-sm text-gray-500">{checkin.weekday} | 14:00</div>
        </div>
        <div className="text-sm text-gray-500">{nights} nights</div>
        <div className="text-center">
          <div className="text-sm font-semibold">Check-out</div>
          <div className="text-xl font-bold">
            {checkout.day} {checkout.month}
          </div>
          <div className="text-sm text-gray-500">
            {checkout.weekday} | 12:00
          </div>
        </div>
      </div>

      <div className="mt-4 border-t pt-4">
        <div className="font-bold">{bookingData.roomName || "Room"}</div>
        {roomAvailability && roomAvailability.availableRooms > 0 && (
          <div
            className={`text-sm ${
              roomAvailability.availableRooms > 0
                ? "text-green-600"
                : "text-orange-600"
            } font-semibold`}
          >
            {roomAvailability.availableRooms} available
          </div>
        )}
        <div className="flex justify-between text-gray-700">
          <div>INR {bookingData.price?.toFixed(2) || "0.00"}</div>
        </div>

        {addedAccommodations.map((addon) => (
          <div key={addon.id} className="bg-gray-200 p-2 rounded mt-2">
            <div className="flex justify-between">
              <div>{addon.title}</div>
              <div
                className="text-red-600 font-bold cursor-pointer"
                onClick={() => handleRemoveAddon(addon.id)}
              >
                REMOVE
              </div>
            </div>
            <div className="text-right font-semibold">
              INR {addon.price.toFixed(2)}
            </div>
          </div>
        ))}

        {cabData && (
          <div className="bg-gray-200 p-2 rounded mt-2">
            <div className="flex justify-between">
              <div>{cabData.cabType} Airport Transfer</div>
              <div className="text-gray-500 font-medium">
                (Managed in transfer section)
              </div>
            </div>
            <div className="text-right font-semibold">
              INR {cabData.price.toFixed(2)}
            </div>
          </div>
        )}
      </div>

      <div className="mt-4 border-t pt-4">
        <div className="flex justify-between font-semibold">
          <div>Subtotal</div>
          <div>INR {totalPrice.toFixed(2)}</div>
        </div>
        {/* <div className="flex justify-between text-gray-700">
          <div>Estimated taxes (18%)</div>
          <div>INR {taxAmount.toFixed(2)}</div>
        </div> */}
        <div className="flex justify-between text-gray-700">
          <div>Estimated additional fees</div>
          <div>INR 0.00</div>
        </div>
      </div>

      <div className="mt-4 text-lg font-bold flex justify-between">
        <div>Total price</div>
        <div>INR {grandTotal.toFixed(2)}</div>
      </div>

      {roomAvailability && roomAvailability?.availableRooms === 0 && (
        <div className="mt-2 text-red-600 text-center font-semibold">
          Sorry, no {bookingData.roomType} rooms available for this period.
        </div>
      )}

      <div className="mt-4">
        <button
          className={`w-full bg-[#028fa3] text-white py-2 rounded text-lg font-semibold ${
            isLoading ||
            (roomAvailability && roomAvailability?.availableRooms === 0)
              ? "opacity-70 cursor-not-allowed"
              : ""
          }`}
          onClick={handleContinueBooking}
          disabled={isLoading}
        >
          {isLoading ? "PROCESSING..." : "CONTINUE BOOKING"}
        </button>
      </div>
    </div>
  );
};

export default BookingSummary;
