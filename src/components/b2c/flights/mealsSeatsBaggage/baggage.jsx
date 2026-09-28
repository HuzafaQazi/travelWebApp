import { useState } from "react";
import showToast from "@/utils/toast";

export default function Baggage({
  baggageData,
  ssrResponse,
  travelers,
  setTravelers,
  travelerIndex,
  setTravelerIndex,
  handleSSRSelection,
}) {
  const [activeFlight, setActiveFlight] = useState(0);
  const [baggageSegment, setBaggageSegment] = useState(0);
  const [hoveredBaggage, setHoveredBaggage] = useState(null);

  if (!baggageData || baggageData.length === 0) {
    return <div>No flight data available.</div>;
  }

  // const isSelected = (baggage) => {
  //   return travelers[travelerIndex].baggage.some(
  //     (selected) =>
  //       selected.origin === baggage.origin &&
  //       selected.destination === baggage.destination &&
  //       selected.code === baggage.code
  //   );
  // };

  const isSelected = (baggage) => {
    const segmentKey = `${baggage.origin}-${baggage.destination}`;
    return travelers[travelerIndex].baggage.some(
      (b) =>
        `${b.origin}-${b.destination}` === segmentKey && b.code === baggage.code
    );
  };

  const getBaggageName = (index) => {
    if (baggageData) {
      const traveler = travelers[index];
      let activeBaggage = baggageData[activeFlight][baggageSegment];
      const matchedBaggage = traveler.baggage.find(
        (selected) =>
          selected.origin === activeBaggage[0].origin &&
          selected.destination === activeBaggage[0].destination
      );
      return matchedBaggage ? matchedBaggage.weight + " Kg" : "-";
    }
  };

  const handleBaggageClick = (baggageObj) => {
    handleSSRSelection("BAGGAGE", baggageObj);
  };

  return (
    <>
      {/* flights selection */}
      <div className="flex border-b overflow-x-scroll hide-scrollbar">
        {baggageData.map((item, index) => {
          return item.map((baggage, baggageIndex) => {
            return (
              <button
                key={index + "-" + baggageIndex}
                className={`${
                  activeFlight === index && baggageSegment === baggageIndex
                    ? "border-[#155EEF] text-[#155EEF]"
                    : "text-gray-900"
                } px-4 py-2 border-b`}
                onClick={() => {
                  setActiveFlight(index);
                  setBaggageSegment(baggageIndex);
                }}
              >
                {baggage[0].origin} - {baggage[0].destination}
              </button>
            );
          });
        })}
      </div>
      {/* traveler selection */}
      <div className="flex flex-col mt-3 gap-1">
        <div className="flex overflow-x-scroll hide-scrollbar gap-3 ">
          {travelers &&
            travelers.map((traveler, index) => (
              <div
                key={index}
                className={`flex rounded-md min-w-28 sm:min-w-36 flex-col gap-2 items-center p-2 ${
                  travelerIndex === index
                    ? "text-[#155EEF] border border-[#155EEF2B]"
                    : " border-[1px] border-[#0000000F] bg-custom-shadow1"
                }`}
                onClick={() => setTravelerIndex(index)}
              >
                <div className="text-xxs sm:text-sm">
                  {/* {traveler?.firstName} {traveler?.lastName} */}
                  {traveler?.firstName || traveler?.lastName
                    ? `${traveler?.firstName || ""} ${
                        traveler?.lastName || ""
                      }`.trim()
                    : `Passenger ${index + 1}`}
                </div>
                <div className="bg-[#155EEF0F] text-xxs sm:text-sm rounded-full p-1 px-3">
                  {getBaggageName(index)}
                </div>
              </div>
            ))}
        </div>
      </div>
      {/* baggage selection */}
      <div className="flex flex-col gap-2">
        {baggageData[activeFlight][baggageSegment].map(
          (baggageItem, baggageIndex) => {
            if (baggageItem.weight > 0)
              return (
                <div
                  key={baggageIndex}
                  className={`
                    relative border-b p-3 text-xs sm:text-base border-gray-300
                    flex justify-between 
                    cursor-pointer
                    hover:bg-[#155EEF0D] hover:border-l-[5px] hover:border-[#155EEF]
                  `}
                  onClick={() => handleBaggageClick(baggageItem)}
                >
                  <div>
                    {baggageItem.weight}kg - Rs.{baggageItem.price}
                  </div>
                  <div className="w-2/6 flex justify-end items-center gap-2">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        className="peer hidden"
                        // name="radio-button"
                        name={`baggage-${baggageItem.origin}-${baggageItem.destination}`}
                        checked={isSelected(baggageItem)}
                        readOnly
                        onClick={() => handleBaggageClick(baggageItem)}
                      />
                      <span
                        className={`w-5 h-5 border border-black rounded-full cursor-pointer ${
                          isSelected(baggageItem)
                            ? "bg-[#155EEF] border-[#155EEF]"
                            : ""
                        }`}
                      ></span>
                    </label>
                  </div>
                </div>
              );
            else return null;
          }
        )}
      </div>
    </>
  );
}
