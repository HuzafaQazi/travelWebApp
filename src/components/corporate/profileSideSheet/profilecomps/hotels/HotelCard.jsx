import { useRouter } from "next/router";
import Image from "next/image";
import { formatPrice } from "@/utils/common";
import { useState, useEffect, useRef } from "react";
import { getRefundStatus } from "@/utils/profileAPI";
import { toast } from "react-toastify";
import { faSpinner } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import showToast from "@/utils/toast";

const HotelCard = ({ hotel, onClose }) => {
  const router = useRouter();
  const [isRefundLoading, setIsRefundLoading] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const popupRef = useRef(null);
  const [refundData, setRefundData] = useState(null);

  function getDayWithSuffix(day) {
    if (day >= 11 && day <= 13) {
      return day + "th";
    }
    switch (day % 10) {
      case 1:
        return day + "st";
      case 2:
        return day + "nd";
      case 3:
        return day + "rd";
      default:
        return day + "th";
    }
  }

  const checkInDate = new Date(hotel.BookRoomDetails?.CheckInDate);
  const day = checkInDate.getDate();
  const month = checkInDate.toLocaleString("default", { month: "long" });
  const formattedCheckinDate = `${getDayWithSuffix(day)} ${month}`;

  const checkOutDate = new Date(hotel.BookRoomDetails?.CheckOutDate);
  const checkoutDay = checkOutDate.getDate();
  const checkoutMonth = checkOutDate.toLocaleString("default", {
    month: "long",
  });
  const formattedCheckoutDate = `${getDayWithSuffix(
    checkoutDay
  )} ${checkoutMonth}`;

  const routeToBookingDetails = async () => {
    if (hotel?.BookingStatus !== "FAILED") {
      router.push({
        pathname: "/corporate/auth/booking/hotels/confirmation",
        query: { bookingId: hotel.BookingId, profile: true },
      });
      onClose();
    }
  };
  useEffect(() => {
    const handleBodyScroll = () => {
      document.body.style.overflow = popupRef ? "hidden" : "auto";
    };

    handleBodyScroll();
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [popupRef]);

  const handleRefundStatusClick = async () => {
    try {
      setIsRefundLoading(true);
      let refundResponse = {
        status: "SUCCESS",
        data: {
          walletRefundAmount: hotel?.walletAmount,
          walletRefundStatus: hotel?.walletRefundStatus,
        },
      };
      if (hotel?.PaidAmount > 0) {
        refundResponse = await getRefundStatus(hotel.BookingId);
      }
      if (refundResponse !== null && refundResponse.status == "SUCCESS") {
        if (refundResponse.data.refundAmount) {
          const data = {
            walletRefundAmount: hotel?.walletAmount,
            walletRefundStatus: hotel?.walletRefundStatus,
            refundAmount: refundResponse?.data?.refundAmount,
            refundStatus: refundResponse?.data?.refundStatus,
          };
          setRefundData(data);
        } else {
          setRefundData(refundResponse.data);
        }

        setShowPopup((prevShowPopup) => !prevShowPopup);
      } else {
        
        showToast("error", "Failed to fetch refund status. Please Try again");
      }
    } catch (error) {
      // toast("Failed to cancel your booking");
    } finally {
      setIsRefundLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "confirmed":
        return "text-green-600";
      case "completed":
        return "text-blue-600";
      case "cancelled":
      case "failed":
        return "text-red-600";
      case "pending":
        return "text-orange-500";
      default:
        return "text-gray-600";
    }
  };

  return (
    <div className="flex flex-col gap-3 mt-3">
      <div
        className="border-1 border-[#028FA350] p-3 rounded-2xl cursor-pointer"
        style={{
          boxShadow: "0px 4px 4px 0px #169CB00D, 0px -2px 4px 0px #169CB00D",
        }}
        onClick={routeToBookingDetails}
      >
        <div className="flex mb-2">
          <div className="w-1/3 mr-4">
            <Image
              src={hotel.HotelImageUrl || "/api/placeholder/300/200"}
              alt={hotel.BookRoomDetails?.HotelName || "Hotel"}
              width={300}
              height={200}
              className="rounded-lg object-cover w-48 h-full sm:h-36"
            />
          </div>
          <div className="flex flex-col w-2/3">
            <div className="flex flex-col gap-1">
              <div className="flex justify-between items-center">
                <div className="text-[#443C38] text-lg font-medium">
                  {hotel.BookRoomDetails?.HotelName}
                </div>
                <div
                  className={`text-sm font-medium ${getStatusColor(
                    hotel.BookingStatus
                  )}`}
                >
                  {hotel?.BookingStatus?.toUpperCase()}
                </div>
              </div>
              <div className="text-base text-[#030F0C80] font-normal">
                {formattedCheckinDate}, {checkInDate.getFullYear()} -{" "}
                {formattedCheckoutDate}, {checkOutDate.getFullYear()} Booking
                ID: {hotel.BookingId}
              </div>
              <div className="text-base text-[#030F0C80] font-normal">
                PNR: {hotel.VendorBookingId} |{" "}
                {parseInt(hotel.BookRoomDetails?.NumberOfGuests) === 1
                  ? "1 Guest"
                  : `${hotel.BookRoomDetails?.NumberOfGuests} Guests`}{" "}
                |{" "}
                {parseInt(hotel.BookRoomDetails?.NoOfRooms) === 1
                  ? "1 Room"
                  : `${hotel.BookRoomDetails?.NoOfRooms} Rooms`}
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-[#028FA3] text-lg font-medium">
            Amount paid
          </span>
          <span className="text-[#028FA3] text-xl font-medium">
            Rs. {formatPrice(hotel?.BookRoomDetails?.TotalBookingAmount)}
          </span>
        </div>
        {hotel.BookingStatus === "FAILED" && (
          <div className="flex flex-col items-end">
            <div
              className="text-base underline text-green-700 flex justify-end items-center"
              onClick={handleRefundStatusClick}
            >
              Refund status
            </div>
            <div className="flex flex-col w-fit relative">
              {isRefundLoading ? (
                <div className="ml-0 w-fit text-xs">
                  <div className="relative bg-white p-[10px] rounded-md w-[300px] text-center font-xs">
                    <FontAwesomeIcon
                      icon={faSpinner}
                      className="text-[#028fa3]"
                      spin
                    />
                  </div>
                </div>
              ) : (
                showPopup && (
                  <div
                    ref={popupRef}
                    className="ml-0 w-fit text-xs absolute right-[5%] border-[1px] border-gray-300 rounded-md"
                  >
                    <div className="relative bg-white p-[10px] rounded-md w-[300px] text-center font-xs">
                      <div>
                        {refundData?.walletRefundAmount > 0 && (
                          <div className="text-sm font-medium">
                            Wallet Refund status:{" "}
                            <span className="text-sm">
                              {refundData.walletRefundStatus}
                            </span>
                          </div>
                        )}
                        {refundData?.walletRefundAmount > 0 && (
                          <div className="text-sm font-medium ">
                            Wallet Refund Amount:{" "}
                            <span className="text-sm">
                              {refundData.walletRefundAmount}
                            </span>
                          </div>
                        )}
                        {refundData?.refundAmount > 0 && (
                          <div className="text-sm font-medium">
                            Payment Refund Status:{" "}
                            <span className="text-sm">
                              {refundData.refundStatus}
                            </span>
                          </div>
                        )}
                        {refundData?.refundAmount && (
                          <div className="text-sm font-medium">
                            Payment Refund Amount:{" "}
                            <span className="text-sm">
                              Rs. {formatPrice(refundData.refundAmount)}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default HotelCard;
