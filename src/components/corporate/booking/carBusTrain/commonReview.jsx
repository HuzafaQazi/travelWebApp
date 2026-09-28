import { useState, useEffect } from "react";
import Image from "next/image";
import moment from "moment";
import { formatPrice } from "@/utils/common";
import fallbackImage from "@/images/Group 14468.png";

const CommonReview = () => {
  return (
    <>
      <div className="w-full h-48 md:h-[300px]">
        <Image
        //   src={imageSrc}
        //   alt={hotel.hotelName}
          layout="responsive"
          objectFit="cover"
          className="rounded-lg !h-48 sm:!h-[300px]"
          height={1000}
          width={1000}
          onError={() => setImageSrc(fallbackImage)}
        />
      </div>
      <div className="flex flex-col">
        <span className="text-base sm:text-xl font-semibold">
          {hotel.hotelName}
        </span>
        <span className="text-xs sm:text-sm font-medium">
          {hotel.hotelAddress || "Address not available"}
        </span>
        <div className="flex items-center mt-2 pb-2 border-b">
          {[...Array(5)].map((_, index) => (
            <svg
              key={index}
              className={`w-4 h-4 ms-1 ${
                index < hotel.starRating
                  ? "text-yellow-300"
                  : "text-gray-300 dark:text-gray-500"
              }`}
              aria-hidden="true"
              xmlns="http://www.w3.org/2000/svg"
              fill="currentColor"
              viewBox="0 0 22 20"
            >
              <path d="M20.924 7.625a1.523 1.523 0 0 0-1.238-1.044l-5.051-.734-2.259-4.577a1.534 1.534 0 0 0-2.752 0L7.365 5.847l-5.051.734A1.535 1.535 0 0 0 1.463 9.2l3.656 3.563-.863 5.031a1.532 1.532 0 0 0 2.226 1.616L11 17.033l4.518 2.375a1.534 1.534 0 0 0 2.226-1.617l-.863-5.03L20.537 9.2a1.523 1.523 0 0 0 .387-1.575Z" />
            </svg>
          ))}
        </div>
        {/* checkin and checkout details */}
        <div className="border-b border-t p-2 px-0">
          <div className="relative flex items-center">
            <div className="text-left ">
              <span className="block font-medium text-sm sm:text-base text-[#155EEF]">
                Check-in
              </span>
              <span className="block font-semibold text-xs sm:text-sm text-[#171A19]">
                {checkInDate}
              </span>
            </div>
            <div className="relative flex items-center justify-center flex-1">
              <span
                className={`absolute px-2 font-normal text-xxs sm:text-xs text-[#155EEF]  ${
                  isReviewPage ? "-top-0" : "-top-0 sm:-top-2"
                } 2xl:-top-2 transform -translate-y-1/2`}
              >
                {stayDuration}
              </span>
              <hr className="border-dashed border-black-300 mx-2 w-full h-1" />
            </div>
            <div className="text-right ">
              <span className="block font-medium text-sm sm:text-base text-[#155EEF]">
                Check-out
              </span>
              <span className="block font-semibold text-xs sm:text-sm text-[#171A19]">
                {checkOutDate}
              </span>
            </div>
          </div>
        </div>
        <div></div>
        {/* room details */}
        <div className="mt-3">
          {rooms.map((room, index) => (
            <>
              <div
                key={index}
                className={`flex flex-col ${index !== 0 ? "mt-4" : ""}`}
              >
                <span className="text-sm sm:text-base font-medium text-[#4a4a4a]">
                  {room.roomTypeName}
                </span>
                {index === 0 && (
                  <span className="text-[rgba(74,_74,_74,_0.7)] text-sm">
                    {stayDetails}
                  </span>
                )}
              </div>
              {/* hotel amenities */}
              <div className="mt-2">
                {room.inclusion.length > 0 ? (
                  <>
                    <span className="font-medium">This room includes:</span>
                    <div className="text-[#4a4a4a] text-xs flex flex-col">
                      <div>
                        <span>{room.inclusion.join(" | ")}</span>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="text-red-400 ml-1">No meals included </div>
                )}
              </div>
            </>
          ))}

          {/* price breakup */}
          <div className="mt-3 border-b pb-2">
            <span className="text-[#155EEF] font-semibold text-lg">
              Price Breakup
            </span>
            <div className="flex justify-between text-[#4A4A4A] text-sm mt-2">
              <span>Room Price</span>
              <span>
                ₹ {formatPrice(priceBreakup.totalRoomPrice.toFixed(2))}
              </span>
            </div>
            <div className="flex justify-between text-[#4A4A4A] text-sm mt-2">
              <span>Taxes</span>
              <span>₹ {formatPrice(priceBreakup.totalTaxes.toFixed(2))}</span>
            </div>
            <div className="flex justify-between text-[#4A4A4A] font-medium text-sm mt-2">
              <span>Total Amount</span>
              <span>₹ {formatPrice(priceBreakup.totalAmount.toFixed(2))}</span>
            </div>
            {walletDeduction > 0 && (
              <div className="flex justify-between text-[#4A4A4A] text-sm mt-2">
                <span>Wallet Amount Used</span>
                <span>- ₹ {formatPrice(walletDeduction.toFixed(2))}</span>
              </div>
            )}
            {otherPaymentMode > 0 && (
              <div className="flex justify-between text-[#4A4A4A] text-sm mt-2">
                <span>Paid using other modes</span>
                <span>- ₹ {formatPrice(otherPaymentMode.toFixed(2))}</span>
              </div>
            )}
          </div>
          {currentPage === "confirm" ? (
            <div className="mt-2 flex justify-between">
              <span className="text-lg font-semibold">Total Paid</span>
              <span className="text-lg font-semibold text-[#155EEF]">
                ₹ {formatPrice(priceBreakup.totalAmount.toFixed(2))}
              </span>
            </div>
          ) : (
            <div className="mt-2 flex justify-between">
              <span className="text-lg font-semibold">Total Payable</span>
              <span className="text-lg font-semibold text-[#155EEF]">
                ₹ {formatPrice(totalPayable.toFixed(2))}
              </span>
            </div>
          )}

          {updatedPrice > 0 && (
            <div className="flex justify-end">
              <div className="text-[rgb(217,40,40)] text-xs font-medium bg-[#E729291A] rounded-lg p-2">
                Priced increased by Rs {formatPrice(updatedPrice)} !
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default CommonReview;