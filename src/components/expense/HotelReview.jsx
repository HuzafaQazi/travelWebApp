import { useState, useEffect } from "react";
import Image from "next/image";
import moment from "moment";
import fallbackImage from "@/images/Group 14468.png";

// Utility Function (Temporary)
const formatPrice = (price) =>
  Number(price).toLocaleString("en-IN", { minimumFractionDigits: 2 });

const HotelReview = () => {
  // ---------------------- STATIC SAMPLE DATA ---------------------- //
  const hotel = {
    hotelName: "Taj MG Road Bengaluru",
    hotelAddress: "41/3 Mahatma Gandhi Rd, Bangalore",
    hotelStaticImageUrl:
      "https://dynamic-media-cdn.tripadvisor.com/media/photo-o/1b/8f/5f/47/taj-mg-road-bengaluru.jpg?w=700&h=-1&s=1",
    starRating: 5,
  };

  const rooms = [
    {
      roomTypeName: "Deluxe Room King Bed",
      inclusion: ["Breakfast Included", "Free Wi-Fi", "Free Cancellation"],
    },
    {
      roomTypeName: "Luxury City View Room",
      inclusion: ["Breakfast Included"],
    },
  ];

  const searchData = {
    checkInDateRange: "2025-01-15",
    checkOutDateRange: "2025-01-18",
    noOfNights: "3",
    noOfRooms: 2,
    roomDetails: [
      { adults: 2, children: 1 },
      { adults: 2, children: 0 },
    ],
  };

  const priceBreakup = {
    totalRoomPrice: 18500,
    totalTaxes: 3200,
    totalAmount: 21700,
  };

  const walletDeduction = 500;
  const updatedPrice = 0;
  const otherPaymentMode = 0;
  const currentPage = "";

  // ---------------------------------------------------------------- //

  const [imageSrc, setImageSrc] = useState(
    hotel.hotelStaticImageUrl || hotel.hotelImages
  );

  const { checkInDateRange, checkOutDateRange, noOfNights } = searchData;

  const [isReviewPage, setIsReviewPage] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setIsReviewPage(window.location.pathname === "/bookings/hotels/review");
    }
  }, []);

  const getFormattedDate = (date) => {
    const day = moment(date).format("DD");
    const month = moment(date).format("MMMM");
    const year = moment(date).format("YYYY");

    const suffix = (day) => {
      if (day.endsWith("11") || day.endsWith("12") || day.endsWith("13"))
        return "th";
      if (day.endsWith("1")) return "st";
      if (day.endsWith("2")) return "nd";
      if (day.endsWith("3")) return "rd";
      return "th";
    };

    return `${day}${suffix(day)} ${month}, ${year}`;
  };

  const checkInDate = getFormattedDate(checkInDateRange);
  const checkOutDate = getFormattedDate(checkOutDateRange);
  const noOfDays = parseInt(noOfNights) + 1;
  const stayDuration = `${noOfDays} Days | ${noOfNights} Nights`;

  const adultsPerRoom = searchData.roomDetails.map((room) => room.adults);
  const totalAdults = adultsPerRoom.reduce((total, adults) => total + adults, 0);

  const childrenPerRoom = searchData.roomDetails.map((room) => room.children);
  const totalChildren = childrenPerRoom.reduce(
    (total, children) => total + children,
    0
  );

  const stayDetails = `${searchData.noOfNights} ${
    searchData.noOfNights === "1" ? "Night" : "Nights"
  } | ${searchData.noOfRooms} ${
    searchData.noOfRooms === 1 ? "Room" : "Rooms"
  } | ${totalAdults} ${
    totalAdults === 1 ? "Adult" : "Adults"
  }${totalChildren > 0 ? ` | ${totalChildren} Children` : ""}`;

  const totalPayable = priceBreakup.totalAmount - walletDeduction;

  return (
    <>
      {/* IMAGE */}
      <div className="w-full h-48 md:h-[300px]">
        <Image
          src={imageSrc}
          alt={hotel.hotelName}
          layout="responsive"
          objectFit="cover"
          className="rounded-lg !h-48 sm:!h-[300px]"
          height={1000}
          width={1000}
          onError={() => setImageSrc(fallbackImage)}
        />
      </div>

      <div className="flex flex-col">
        {/* Hotel Name + Address */}
        <span className="text-base sm:text-xl font-semibold">
          {hotel.hotelName}
        </span>
        <span className="text-xs sm:text-sm font-medium">{hotel.hotelAddress}</span>

        {/* Star Rating */}
        <div className="flex items-center mt-2 pb-2 border-b">
          {[...Array(5)].map((_, index) => (
            <svg
              key={index}
              className={`w-4 h-4 ms-1 ${
                index < hotel.starRating ? "text-yellow-300" : "text-gray-300"
              }`}
              fill="currentColor"
              viewBox="0 0 22 20"
            >
              <path d="M20.924 7.625a1.523...Z" />
            </svg>
          ))}
        </div>

        {/* Check-in / Checkout */}
        <div className="border-b border-t p-2 px-0">
          <div className="relative flex items-center">
            <div className="text-left">
              <span className="block font-medium text-[#028FA3]">Check-in</span>
              <span className="block font-semibold">{checkInDate}</span>
            </div>

            <div className="relative flex-1 text-center">
              <span className="absolute top-0 text-xs text-[#028FA3]">
                {stayDuration}
              </span>
              <hr className="border-dashed border-black mx-2 w-full h-1" />
            </div>

            <div className="text-right">
              <span className="block font-medium text-[#028FA3]">Check-out</span>
              <span className="block font-semibold">{checkOutDate}</span>
            </div>
          </div>
        </div>

        {/* ROOM DETAILS */}
        <div className="mt-3">
          {rooms.map((room, index) => (
            <div key={index} className="mt-3">
              <span className="text-sm font-medium">{room.roomTypeName}</span>
              {index === 0 && (
                <span className="text-gray-600 text-xs">{stayDetails}</span>
              )}

              {/* Amenities */}
              {room.inclusion.length > 0 ? (
                <>
                  <span className="block mt-2 font-medium text-xs">
                    This room includes:
                  </span>
                  <span className="text-xs text-gray-600">
                    {room.inclusion.join(" | ")}
                  </span>
                </>
              ) : (
                <span className="text-red-500 text-xs">No meals included</span>
              )}
            </div>
          ))}

          {/* PRICE SECTION */}
          {/* <div className="mt-4 border-b pb-2">
            <h4 className="text-[#028fa3] font-semibold text-lg">
              Price Breakup
            </h4>

            <div className="flex justify-between text-sm mt-2">
              <span>Room Price</span>
              <span>₹ {formatPrice(priceBreakup.totalRoomPrice)}</span>
            </div>

            <div className="flex justify-between text-sm mt-2">
              <span>Taxes</span>
              <span>₹ {formatPrice(priceBreakup.totalTaxes)}</span>
            </div>

            <div className="flex justify-between font-semibold text-sm mt-2">
              <span>Total Amount</span>
              <span>₹ {formatPrice(priceBreakup.totalAmount)}</span>
            </div>

            {walletDeduction > 0 && (
              <div className="flex justify-between text-sm mt-2 text-red-500">
                <span>Wallet Used</span>
                <span>- ₹ {formatPrice(walletDeduction)}</span>
              </div>
            )}
          </div> */}

          {/* Final Price */}
          {/* <div className="mt-2 flex justify-between">
            <span className="text-lg font-semibold">Total Payable</span>
            <span className="text-lg font-semibold text-[#028fa3]">
              ₹ {formatPrice(totalPayable)}
            </span>
          </div> */}
        </div>
      </div>
    </>
  );
};

export default HotelReview;
