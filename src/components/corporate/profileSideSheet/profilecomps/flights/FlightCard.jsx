import Image from "next/image";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/router";
import { getRefundStatus } from "@/utils/profileAPI";
import { toast } from "react-toastify";
import showToast from "@/utils/toast";

const FlightCard = ({ flight, onClose }) => {
  const [totalAmount, setTotalAmount] = useState();
  const router = useRouter();
  const [isRefundLoading, setIsRefundLoading] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const popupRef = useRef(null);
  const [refundData, setRefundData] = useState(null);

  useEffect(() => {
    calculateTotalPrice();
  }, []);

  const handleRefundStatusClick = async () => {
    try {
      setIsRefundLoading(true);
      let refundResponse = {
        status: "SUCCESS",
        data: {
          walletRefundAmount: flight?.bookingDetails[0]?.walletAmount,
          walletRefundStatus: flight?.bookingDetails[0]?.walletRefundStatus,
        },
      };
      if (flight?.bookingDetails[0]?.paidAmount > 0) {
        refundResponse = await getRefundStatus(flight.bookingId);
      }
      if (refundResponse !== null && refundResponse.status == "SUCCESS") {
        if (refundResponse.data.refundAmount) {
          const data = {
            walletRefundAmount: flight?.bookingDetails[0]?.walletAmount,
            walletRefundStatus: flight?.bookingDetails[0]?.walletRefundStatus,
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
    } finally {
      setIsRefundLoading(false);
    }
  };
  const calculateTotalPrice = () => {
    const totalAmount = (flight?.bookingDetails || []).reduce(
      (acc, detail) => {
        const isFailed = detail.bookingStatus === "FAILED";
        return {
          total: acc.total + (isFailed ? 0 : parseFloat(detail.totalAmount)),
          failedTotal: acc.failedTotal + parseFloat(detail.totalAmount),
          failedCount: acc.failedCount + (isFailed ? 1 : 0),
        };
      },
      { total: 0, failedTotal: 0, failedCount: 0 }
    );

    const allFailed =
      flight?.bookingDetails?.length === totalAmount?.failedCount;

    const finalTotalAmount = allFailed
      ? totalAmount.failedTotal
      : totalAmount.total;

    setTotalAmount(finalTotalAmount);
  };

  const formatPrice = (price) => {
    if (price) {
      return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    }
  };

  const formatTime = (isoTimeString) => {
    const date = new Date(isoTimeString);
    const hours = date.getHours().toString().padStart(2, "0");
    const minutes = date.getMinutes().toString().padStart(2, "0");
    return `${hours}:${minutes}`;
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const options = {
      weekday: "short",
      month: "long",
      day: "numeric",
      year: "numeric",
    };
    const formattedDate = date.toLocaleDateString("en-US", options);

    // Extracting day, month, and year
    const day = formattedDate.split(",")[0];
    const month = formattedDate.split(" ")[1];
    const dateDay = date.getDate();
    const year = date.getFullYear();

    return (
      <div style={{ color: "#028fa3" }}>
        {day},{" "}
        <span style={{ color: "#028fa3" }}>
          {month} {dateDay}
          {dateDay % 10 === 1 && dateDay !== 11
            ? "st"
            : dateDay % 10 === 2 && dateDay !== 12
            ? "nd"
            : dateDay % 10 === 3 && dateDay !== 13
            ? "rd"
            : "th"}
        </span>
        , {year}
      </div>
    );
  };

  const routeToBookingDetails = () => {
    if (flight.bookingStatus !== "FAILED") {
      router.push({
        pathname: "/corporate/auth/booking/flights/flightConfirm",
        query: { booking_id: flight.bookingId, profile: true },
      });
      onClose();
    }
  };

  const handleClickOutside = (event) => {
    if (popupRef.current && !popupRef.current.contains(event.target)) {
      setShowPopup(false);
    }
  };

  useEffect(() => {
    // Add event listener for clicks
    document.addEventListener("mousedown", handleClickOutside);

    // Cleanup the event listener on component unmount
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const getStatusColor = (status) => {
    switch (status) {
      case "CONFIRMED":
        return "text-green-600";
      case "COMPLETED":
        return "text-blue-600";
      case "CANCELLED":
      case "FAILED":
        return "text-red-600";
      default:
        return "text-gray-600";
    }
  };

  return (
    <>
      <div
        className="border-1 border-[#028FA350] p-3 rounded-2xl cursor-pointer"
        style={{
          boxShadow: "0px 4px 4px 0px #169CB00D, 0px -2px 4px 0px #169CB00D",
        }}
        onClick={flight.bookingStatus !== "FAILED" ? routeToBookingDetails : ""}
      >
        <div className="flex flex-col mb-0" key={flight.bookingId}>
          <div className="flex justify-between">
            <div className="text-xs sm:text-sm text-[#028FA3] font-normal mt-0 sm:mt-2">
              {" "}
              {flight?.bookingDetails?.[0]?.journeyType} |{" "}
              {flight?.bookingDetails?.[0]?.fareType}
            </div>
            <div
              className={`text-xs sm:text-sm font-medium ${getStatusColor(
                flight.bookingStatus
              )}`}
            >
              {flight.bookingStatus}
            </div>
            {/* <div className='flex items-end justify-end'>
                            <FontAwesomeIcon icon={faShareNodes} className="text-[#028FA3] text-lg" />
                        </div> */}
          </div>
          {flight?.bookingDetails?.map((detail, index) => (
            <div key={index} className="mb-2">
              <div className="flex gap-2 my-1">
                <div>
                  {detail.airlineLogoUrl ? (
                    <Image
                      src={detail.airlineLogoUrl}
                      alt="logo"
                      width={30}
                      height={30}
                      className="w-5 h-5 sm:w-8 sm:h-8"
                    />
                  ) : (
                    <Image src="default_logo_url" alt="Default Logo" />
                  )}
                </div>
                <div className="text-xxs font-normal">
                  <div> {detail.airlineName}</div>
                  <div>
                    {detail.airlineCode}-{detail.flightNumber}
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <div className="text-xs text-[#030F0C80] font-medium">
                  Booking ID: {flight.bookingId} | PNR: {detail.pnr}
                </div>
                {/* <div className="text-sm text-[#028FA3] font-normal mt-2"><span className='font-semibold'>16:20</span>, Jan 24 | One way | Economy</div> */}
                <div className="text-lg text-[#443C38] font-medium flex justify-between">
                  <div className="flex flex-col items-start">
                    {detail.depTime && (
                      <span className="text-xs font-normal">
                        {formatTime(detail.depTime)}
                      </span>
                    )}
                    <span>
                      {detail.origin}({detail.originCode})
                    </span>
                    {detail.depTime && (
                      <span className="text-xs font-normal">
                        {formatDate(detail.depTime)}
                      </span>
                    )}
                  </div>

                  {/* <div>-</div> */}
                  <div className="flex flex-col items-end">
                    {detail.arrivalTime && (
                      <span className="text-xs font-normal">
                        {formatTime(detail.arrivalTime)}
                      </span>
                    )}
                    <span>
                      {detail.destination}({detail.destinationCode})
                    </span>
                    {detail.arrivalTime && (
                      <span className="text-xs font-normal">
                        {formatDate(detail.arrivalTime)}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="text-sm text-gray-700 flex justify-between items-center">
          <span className="text-[#028FA3] text-lg font-medium">
            Amount paid
          </span>
          <span className="text-[#028FA3] text-xl font-medium">
            Rs. {formatPrice(totalAmount)}
          </span>
        </div>
        <div className="flex flex-col items-end">
          {(flight.bookingStatus === "FAILED" ||
            flight.bookingStatus === "PARTIAL_SUCCESS") && (
            <div
              className="text-base underline text-green-700 flex justify-end items-center"
              onClick={handleRefundStatusClick}
            >
              Refund status
            </div>
          )}
          <div className="flex flex-col w-fit relative">
            {isRefundLoading ? (
              <div className="ml-0 w-fit text-xs">
                <div className="relative bg-white p-[10px] rounded-md w-[300px] text-center font-xs">
                  Loading...
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
                        <div>
                          Wallet Refund status:{" "}
                          <span className="">
                            {refundData.walletRefundStatus}
                          </span>
                        </div>
                      )}
                      {refundData?.walletRefundAmount > 0 && (
                        <div>
                          Wallet Refund Amount:{" "}
                          <span className="">
                            {refundData.walletRefundAmount}
                          </span>
                        </div>
                      )}
                      {refundData?.refundAmount > 0 && (
                        <div>
                          Payment Refund Status:{" "}
                          <span className="">{refundData.refundStatus}</span>
                        </div>
                      )}
                      {refundData?.refundAmount && (
                        <div>
                          Payment Refund Amount:{" "}
                          <span className="">
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
      </div>
    </>
  );
};

export default FlightCard;
