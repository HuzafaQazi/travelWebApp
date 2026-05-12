import { faInfoCircle } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useState } from "react";
import {
  canSelectBaggageForEmployee,
  findCorporateEmployeeForTraveler,
} from "@/utils/corporate/travelPolicy";
import showToast from "@/utils/toast";

export default function Baggage({
  baggageData,
  ssrResponse,
  travelers,
  setTravelers,
  travelerIndex,
  setTravelerIndex,
  handleSSRSelection,
  corporateEmployees,
}) {
  const [activeFlight, setActiveFlight] = useState(0);
  const [baggageSegment, setBaggageSegment] = useState(0);
  const [hoveredBaggage, setHoveredBaggage] = useState(null);

  if (!baggageData || baggageData.length === 0) {
    return <div>No flight data available.</div>;
  }

  const isSelected = (baggage) => {
    return travelers[travelerIndex].baggage.some(
      (selected) =>
        selected.origin === baggage.origin &&
        selected.destination === baggage.destination &&
        selected.code === baggage.code
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

      // If a match is found, return the selected seat's code, otherwise return "-"
      return matchedBaggage ? matchedBaggage.weight + " Kg" : "-";
      // return "Pasta";
    }
  };

  const handleBaggageClick = (baggageObj, baggageAllowed) => {
    if (!baggageAllowed) return;

    // 3) Check if SSR is allowed for the current traveler.
    const currentTraveler = travelers[travelerIndex];
    // find matching corporateEmployee
    const matchedEmp = findCorporateEmployeeForTraveler(
      currentTraveler,
      corporateEmployees
    );

    if (!matchedEmp) {
      showToast("error", "No matching employee. Possibly out of policy.");
      return;
    }

    const seatAllowed = canSelectBaggageForEmployee(matchedEmp);
    if (!seatAllowed) {
      showToast("error", "Out of policy for baggage selection.");
      return;
    }

    // 4) If we’re here => baggage can be selected
    handleSSRSelection("BAGGAGE", baggageObj);
  };

  let baggageAllowed = false;
  if (travelers[travelerIndex]) {
    const currentTraveler = travelers[travelerIndex];
    const matchedEmp = findCorporateEmployeeForTraveler(
      currentTraveler,
      corporateEmployees
    );
    baggageAllowed = canSelectBaggageForEmployee(matchedEmp);
  }

  return (
    <>
      {/* flights selection */}
      <div className="flex border-b overflow-x-scroll hide-scrollbar">
        {baggageData.map((item, index) => {
          return item.map((baggage, baggageIndex) => {
            return (
              <button
                key={index}
                className={`${
                  activeFlight === index && baggageSegment === baggageIndex
                    ? "border-[#028fa3] text-[#028fa3]"
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
        {!baggageAllowed && (
          <div className="text-[#E53944] text-sm font-medium items-center bg-[#FBE2E3] rounded-lg w-fit px-2 py-1 flex gap-1">
            <FontAwesomeIcon icon={faInfoCircle} />
            Out Of Policy (No baggage SSR)
          </div>
        )}

        <div className="flex overflow-x-scroll hide-scrollbar gap-3 ">
          {travelers &&
            travelers.map((traveler, index) => (
              <div
                key={index}
                className={`flex rounded-md min-w-28 sm:min-w-36 flex-col gap-2 items-center p-2 ${
                  travelerIndex === index
                    ? "text-[#028fa3] border border-[#028FA32B]"
                    : " border-[1px] border-[#0000000F] bg-custom-shadow1"
                }`}
                onClick={() => setTravelerIndex(index)}
              >
                <div className="text-xxs sm:text-sm">
                  {traveler?.firstName} {traveler?.lastName}
                </div>
                <div className="bg-[#028FA30F] text-xxs sm:text-sm rounded-full p-1 px-3">
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
                    ${baggageAllowed ? "cursor-pointer" : "cursor-not-allowed"}
                    hover:bg-[#028FA30D] hover:border-l-[5px] hover:border-[#028fa3]
                  `}
                  onMouseEnter={() => {
                    if (!baggageAllowed) setHoveredBaggage(baggageItem);
                  }}
                  onMouseLeave={() => {
                    if (!baggageAllowed) setHoveredBaggage(null);
                  }}
                  onClick={() =>
                    handleBaggageClick(baggageItem, baggageAllowed)
                  }
                >
                  <div>
                    {baggageItem.weight}kg - Rs.{baggageItem.price}
                  </div>
                  <div className="w-2/6 flex justify-end items-center gap-2">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        className="peer hidden"
                        name="radio-button"
                        checked={isSelected(baggageItem)}
                        onClick={() =>
                          handleBaggageClick(baggageItem, baggageAllowed)
                        }
                      />
                      <span
                        className={`w-5 h-5 border border-black rounded-full ${
                          baggageAllowed
                            ? "cursor-pointer"
                            : "cursor-not-allowed"
                        } ${
                          isSelected(baggageItem)
                            ? "bg-[#028fa3] border-[#028fa3]"
                            : ""
                        }`}
                      ></span>
                    </label>
                  </div>
                  {!baggageAllowed && hoveredBaggage === baggageItem && (
                    <div
                      className="
                        absolute z-50 top-[-2rem] left-1/2 -translate-x-1/2
                        w-max px-2 py-1 text-xs bg-gray-800 text-white rounded-md
                      "
                    >
                      Out of Policy
                      <div
                        className="
                          absolute w-0 h-0 left-1/2 -translate-x-1/2
                          border-[6px] border-transparent border-t-gray-800
                          bottom-[-12px]
                        "
                      />
                    </div>
                  )}
                </div>
              );
          }
        )}
      </div>
    </>
  );
}
