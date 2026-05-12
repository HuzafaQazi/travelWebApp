import { faInfoCircle } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useState, useEffect } from "react";
import {
  canSelectMealForEmployee,
  findCorporateEmployeeForTraveler,
} from "@/utils/corporate/travelPolicy";
import showToast from "@/utils/toast";

export default function Meals({
  mealDynamic,
  ssrResponse,
  travelers,
  setTravelers,
  travelerIndex,
  setTravelerIndex,
  handleSSRSelection,
  mealPrefs,
  corporateEmployees,
  isMealRequired = false,
}) {
  const [activeSegment, setActiveSegment] = useState(0);
  const [groupedData, setGroupedData] = useState({});
  const [hoveredMeal, setHoveredMeal] = useState(null);

  useEffect(() => {
    const groupedData = {};
    let meals =
      mealPrefs.length > 0
        ? mealPrefs
        : mealDynamic.length > 0
        ? mealDynamic
        : [];
    meals.forEach((item) => {
      item.forEach((mealDynamicItem) => {
        const key = `${mealDynamicItem.origin} - ${mealDynamicItem.destination}`;
        if (!groupedData[key]) {
          groupedData[key] = [];
        }
        groupedData[key].push(mealDynamicItem);
      });
    });
    setGroupedData(groupedData);
  }, [mealDynamic, mealPrefs]);

  // Check if the current meal is selected for the traveler
  const isSelected = (meal) => {
    let selected;
    if (mealDynamic.length > 0) {
      selected = travelers[travelerIndex].mealDynamic.some(
        (selected) =>
          selected.origin === meal.origin &&
          selected.destination === meal.destination &&
          selected.code === meal.code
      );
    } else if (mealPrefs.length > 0) {
      selected = travelers[travelerIndex].mealPreference.some(
        (selected) =>
          selected.origin === meal.origin &&
          selected.destination === meal.destination &&
          selected.code === meal.code
      );
    }
    return selected;
  };

  const getMealName = (index) => {
    // Get the current traveler
    if (activeMealOptions) {
      const traveler = travelers[index];
      let matchedMeal;
      if (mealDynamic.length > 0) {
        matchedMeal = traveler.mealDynamic.find(
          (selected) =>
            selected.origin === activeMealOptions[0].origin &&
            selected.destination === activeMealOptions[0].destination
        );
      } else if (mealPrefs.length > 0) {
        matchedMeal = traveler.mealPreference.find(
          (selected) =>
            selected.origin === activeMealOptions[0].origin &&
            selected.destination === activeMealOptions[0].destination
        );
      }
      return matchedMeal
        ? matchedMeal.airlineDescription.length > 10
          ? matchedMeal.airlineDescription.substring(0, 10) + "..."
          : matchedMeal.airlineDescription
        : "-";
    }
  };

  const handleMealClick = (e, mealObj, mealAllowed) => {
    e.preventDefault();

    // ✅ Override travel policy if meal is required
    if (!mealAllowed && !isMealRequired) return;

    // Check travel policy only if NOT required
    // 3) Check if SSR is allowed for the current traveler.
    if (!isMealRequired) {
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

      const mealPolicyAllowed = canSelectMealForEmployee(matchedEmp);
      if (!mealPolicyAllowed) {
        showToast("error", "Out of policy for meal selection.");
        return;
      }
    }

    // 4) If we’re here => meal can be selected
    handleSSRSelection("MEAL", mealObj);
  };

  const activeOriginDestination = Object.keys(groupedData)[activeSegment];

  const activeMealOptions = groupedData[activeOriginDestination];

  let mealAllowed = isMealRequired;

  if (!isMealRequired && travelers[travelerIndex]) {
    // Only check policy if NOT required
    const currentTraveler = travelers[travelerIndex];
    const matchedEmp = findCorporateEmployeeForTraveler(
      currentTraveler,
      corporateEmployees
    );
    mealAllowed = canSelectMealForEmployee(matchedEmp);
  }

  return (
    <>
      {/* flights selection */}
      <div>
        <div className="flex border-b overflow-x-scroll hide-scrollbar">
          {Object.keys(groupedData).map((key, index) => {
            const [origin, destination] = key.split(" - ");
            return (
              <button
                key={index}
                className={`${
                  activeSegment === index
                    ? "border-[#028fa3] text-[#028fa3]"
                    : "text-gray-900"
                } px-4 py-2 border-b`}
                onClick={() => setActiveSegment(index)}
              >
                {origin} - {destination}
              </button>
            );
          })}
        </div>

        {/* traveler selection */}
        <div className="flex flex-col mt-3 gap-1">
          {isMealRequired && (
            <div className="p-3 bg-red-50 border-l-4 border-red-500 rounded-md mb-2">
              <div className="flex items-center gap-2 text-sm text-red-800">
                <FontAwesomeIcon icon={faInfoCircle} />
                <span className="font-semibold">
                  Meal selection is mandatory for all travelers
                </span>
              </div>
              <p className="text-xs text-red-700 mt-1 ml-6">
                This requirement overrides travel policy restrictions
              </p>
            </div>
          )}
          {!mealAllowed && !isMealRequired && (
            <div className="text-[#E53944] text-sm font-medium items-center bg-[#FBE2E3] rounded-lg w-fit px-2 py-1 flex gap-1">
              <FontAwesomeIcon icon={faInfoCircle} />
              Out Of Policy (No meal SSR)
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
                    {getMealName(index)}
                  </div>
                </div>
              ))}
          </div>
        </div>
      </div>

      {/* meal selection */}
      <div className="w-full mt-3 pb-6">
        <div className="flex justify-between px-3">
          <span>Name</span>
          <span>Price</span>
          <span>Select</span>
        </div>
        {activeMealOptions &&
          activeMealOptions.map((mealItem, mealIndex) => {
            if (mealItem?.airlineDescription) {
              return (
                <div
                  key={mealIndex}
                  className={`
                    relative flex text-xs sm:text-base items-center justify-between
                    mt-3 p-2 border-[1px] border-[#028FA36E] rounded-md 
                    ${mealAllowed ? "cursor-pointer" : "cursor-not-allowed"}
                  `}
                  onMouseEnter={() => {
                    if (!mealAllowed) setHoveredMeal(mealItem);
                  }}
                  onMouseLeave={() => {
                    if (!mealAllowed) setHoveredMeal(null);
                  }}
                  onClick={(e) => handleMealClick(e, mealItem, mealAllowed)}
                >
                  <div className="w-2/6">{mealItem.airlineDescription}</div>
                  <div className="w-2/6 text-center">{mealItem.price}</div>
                  <div className="w-2/6 flex justify-end items-center gap-2">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        className="peer hidden"
                        name="radio-button"
                        checked={isSelected(mealItem)} // Check if this meal is selected
                        // onChange={() => handleSSRSelection("MEAL",mealItem)}
                        onClick={(e) => handleMealClick(e, mealItem)}
                      />
                      <span
                        className={`w-5 h-5 border border-black rounded-full cursor-pointer ${
                          isSelected(mealItem)
                            ? "bg-[#028fa3] border-[#028fa3]"
                            : ""
                        }`}
                      ></span>
                    </label>
                  </div>
                  {!mealAllowed && hoveredMeal === mealItem && (
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
            } else {
              return null;
            }
          })}
      </div>
    </>
  );
}
