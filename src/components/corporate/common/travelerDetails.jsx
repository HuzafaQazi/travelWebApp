import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCaretDown,
  faCaretUp,
  faInfoCircle,
} from "@fortawesome/free-solid-svg-icons";
import { useState } from "react";
import OutOfPolicyBadge from "./OutOfPolicyBadge";
import { getOutOfPolicyReasons } from "@/utils/corporate/travelPolicy";
import {
  TRAVEL_CATEGORIES,
  HOTEL_BUDGET_DOMESTIC_ID,
  HOTEL_BUDGET_INTERNATIONAL_ID,
} from "@/utils/constants";
import { transformTravelPolicy } from "@/utils/common";

export default function TravelerDetails({
  bookingDetails,
  cabinClassName,
  infantCount,
  adultCount,
  childCount,
  totalPassengerCount,
}) {
  const [ssrPassengerIndex, setssrPassengerIndex] = useState(0);
  const [swapStyle, setSwapStyle] = useState(false);
  const [isOpen, setIsOpen] = useState(true);

  const handleContainerClick = (index) => {
    setSwapStyle(!swapStyle);
    setssrPassengerIndex(index);
  };

  return (
    <>
      <div
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between"
      >
        <div className="font-medium">Traveler Details</div>
        <FontAwesomeIcon
          icon={isOpen ? faCaretUp : faCaretDown}
          color="#155EEF"
          className="cursor-pointer"
        />
      </div>
      {isOpen && (
        <>
          {/* different segments */}
          <div className="flex gap-2 overflow-x-auto whitespace-nowrap pb-2 scrollbar-thin scrollbar-thumb-rounded scrollbar-thumb-[#155EEF]/50 mt-1 sm:mt-4">
            {bookingDetails ? (
              bookingDetails[0]?.data?.segmentPassengerSsr?.map(
                (segment, index) => (
                  <button
                    key={index}
                    className={
                      index === ssrPassengerIndex
                        ? "text-white bg-[#155EEF] text-xs sm:text-sm p-2 px-3 rounded-md"
                        : "text-[#155EEF] border-[1px] border-[#155EEF] p-2 px-3 text-xs rounded-md sm:text-sm"
                    }
                    onClick={() => handleContainerClick(index)}
                  >
                    {segment?.origin}-{segment?.destination}
                  </button>
                )
              )
            ) : (
              <></>
            )}
          </div>

          {/* traveler details review */}
          <div className="mt-3">
            {bookingDetails &&
              bookingDetails[0]?.data.segmentPassengerSsr?.[ssrPassengerIndex]
                ?.ssr.length > 0 && (
                <div className="grid grid-cols-[2fr_1fr_1fr_1fr_1fr_1fr_1fr] gap-2 text-center border-b pb-2 font-semibold text-sm p-2 px-2">
                  <div className="text-xxxs sm:text-sm">Passenger Name</div>
                  <div className="text-xxxs sm:text-sm ">Ticket Number</div>
                  <div className="text-xxxs sm:text-sm ">Seat Number</div>
                  <div className="text-xxxs sm:text-sm">Cabin Baggage</div>
                  <div className="text-xxxs sm:text-sm">Checkin Baggage</div>
                  <div className="text-xxxs sm:text-sm">Other Baggage</div>
                  <div className="text-xxxs sm:text-sm">Meal</div>
                </div>
              )}
            <div className="flex flex-col gap-2 mt-3">
              {bookingDetails ? (
                bookingDetails[0]?.data.segmentPassengerSsr?.[
                  ssrPassengerIndex
                ]?.ssr.map((ssrPassenger, index) => {
                  const finalRegionId = bookingDetails[0]?.data?.isDomestic
                    ? HOTEL_BUDGET_DOMESTIC_ID
                    : HOTEL_BUDGET_INTERNATIONAL_ID;

                  const budget =
                    bookingDetails[0]?.data.segmentPassengerSsr?.[
                      ssrPassengerIndex
                    ]?.fare?.offeredFareRoundedOff /
                      bookingDetails[0]?.data.segmentPassengerSsr?.[
                        ssrPassengerIndex
                      ]?.ssr.length || 1;

                  const dataParams = {
                    id: index + 1,
                    name: ssrPassenger?.passengerName,
                    email: ssrPassenger?.passengerEmail,
                    travelPolicyDetails: (ssrPassenger?.travelPolicy || []).map(
                      transformTravelPolicy
                    ),
                    usedCabinClass: cabinClassName,
                    usedBudget: budget,
                    regionId: finalRegionId,
                  };
                  const outOfPolicyReasons = getOutOfPolicyReasons(
                    dataParams,
                    TRAVEL_CATEGORIES.FLIGHTS
                  );
                  const travelerName = ssrPassenger?.passengerName;

                  return (
                    <div
                      key={index}
                      className={`grid grid-cols-[2fr_1fr_1fr_1fr_1fr_1fr_1fr] p-2 text-center items-center gap-2 px-2 ${
                        index !==
                        bookingDetails[0]?.data.segmentPassengerSsr?.[
                          ssrPassengerIndex
                        ]?.ssr.length -
                          1
                          ? "border-b pb-2"
                          : ""
                      }`}
                    >
                      <div className="flex flex-col items-center !w-min sm:min-w-[200px]">
                        <OutOfPolicyBadge
                          reasons={outOfPolicyReasons}
                          travelerName={travelerName}
                          showTravelerNameInTooltip={false}
                        />
                        <div className="text-xxxs sm:text-sm text-[#155EEF] whitespace-nowrap overflow-hidden text-ellipsis">
                          {ssrPassenger?.passengerName ?? "-"}
                        </div>
                        <div className="text-xxxs sm:text-xs  text-gray-500 whitespace-nowrap overflow-hidden text-ellipsis">
                          {ssrPassenger?.passengerEmail ?? "-"}
                        </div>
                      </div>
                      <div className="text-xxxs sm:text-xs">
                        <span>{ssrPassenger?.ticketNumber ?? "-"}</span>
                      </div>
                      {/* seats */}
                      <div className="text-xxxs sm:text-xs">
                        <span>{ssrPassenger?.seatNumber ?? "-"}</span>
                      </div>
                      {/* baggage */}
                      <div className="text-xxxs sm:text-xs">
                        <span>{ssrPassenger?.cabbinBaggage ?? "-"}</span>
                      </div>
                      <div className="text-xxxs sm:text-xs">
                        {ssrPassenger?.baggage ?? "-"}{" "}
                      </div>
                      <div className="text-xxxs sm:text-xs">
                        {ssrPassenger?.otherBaggage ?? "-"}
                      </div>
                      {/* meals */}
                      <div className="text-xxxs sm:text-xs">
                        {ssrPassenger?.mealName ? (
                          <span>{`${ssrPassenger?.mealName}`}</span>
                        ) : (
                          <span>-</span>
                        )}
                      </div>
                    </div>
                  );
                })
              ) : (
                <></>
              )}
            </div>
          </div>
        </>
      )}
    </>
  );
}
