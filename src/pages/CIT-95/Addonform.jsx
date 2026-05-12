import React, { useEffect, useState } from "react";
import "tailwindcss/tailwind.css";
import HotelCard from "../../components/events/hotelcard/hotelcard";
import AccommodationOptions from "../../components/events/hotelcard/accomodation";
import HeaderCommon from "@/components/HeaderCommon/HeaderCommon";
import B2CHeader from "@/components/flights/B2cHeader/Header";
import Payment from "../../components/events/hotelcard/payment";
import Cabs from "../../components/events/hotelcard/cab";
import style from "./style.module.css";
import { useRouter } from "next/router";
import pako from "pako";

export default function Addonform() {
  const [bookingData, setBookingData] = useState(null);
  const router = useRouter();

  useEffect(() => {
    // Check if booking data exists in session storage
    try {
      const compressedData = sessionStorage.getItem("eventBookingData");
      if (!compressedData) {
        // Redirect to previous page if no booking data
        router.push("/Posiflex/eventForm");
        return;
      }

      const numbersArray = compressedData.split(",").map(Number);
      const compressedUint8Array = new Uint8Array(numbersArray);

      const encodedResponse = pako.inflate(compressedUint8Array, {
        to: "string",
      });

      const bookingDetails = JSON.parse(encodedResponse);

      setBookingData(bookingDetails);
    } catch (error) {
      console.error("Error loading booking data:", error);
      router.push("/Posiflex/eventForm");
    }
  }, [router]);

  if (!bookingData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading booking details...</div>
      </div>
    );
  }
  return (
    <>
      <div>
        <div className="w-full bg-[#027A8C] h-[9vh] sm:h-[11vh]">
          {/* <HeaderCommon /> */}
          <B2CHeader/>
        </div>
        <div className="flex flex-col sm:flex-row  mt-2">
          <HotelCard />
          <div className="flex flex-col sm:flex-row  gap-2">
            <div>
              <AccommodationOptions />
              <Cabs />
            </div>
            <Payment />
          </div>
        </div>
      </div>
    </>
  );
}
