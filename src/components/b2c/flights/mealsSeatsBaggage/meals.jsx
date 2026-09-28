import { useState, useEffect } from "react";

export default function Meals({
  mealDynamic,
  ssrResponse,
  travelers,
  setTravelers,
  travelerIndex,
  setTravelerIndex,
  handleSSRSelection,
  mealPrefs,
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
  // const isSelected = (meal) => {
  //   let selected;
  //   if (mealDynamic.length > 0) {
  //     selected = travelers[travelerIndex].mealDynamic.some(
  //       (selected) =>
  //         selected.origin === meal.origin &&
  //         selected.destination === meal.destination &&
  //         selected.code === meal.code
  //     );
  //   } else if (mealPrefs.length > 0) {
  //     selected = travelers[travelerIndex].mealPreference.some(
  //       (selected) =>
  //         selected.origin === meal.origin &&
  //         selected.destination === meal.destination &&
  //         selected.code === meal.code
  //     );
  //   }
  //   return selected;
  // };

  const isSelected = (meal) => {
    const segmentKey = `${meal.origin}-${meal.destination}`;

    const selectedMeals =
      mealDynamic.length > 0
        ? travelers[travelerIndex].mealDynamic
        : travelers[travelerIndex].mealPreference;

    return selectedMeals.some(
      (m) =>
        `${m.origin}-${m.destination}` === segmentKey && m.code === meal.code
    );
  };

  const getMealName = (index) => {
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

  const handleMealClick = (e, mealObj) => {
    e.preventDefault();
    handleSSRSelection("MEAL", mealObj);
  };

  const activeOriginDestination = Object.keys(groupedData)[activeSegment];
  const activeMealOptions = groupedData[activeOriginDestination];

  return (
    <>
      {/* flights selection */}
      <div>
        {isMealRequired && (
          <div className="mb-2 p-2 bg-yellow-50 border-l-4 border-yellow-400 text-sm">
            <strong>Required:</strong> Please select meals for all travelers
          </div>
        )}
        <div className="flex border-b overflow-x-scroll hide-scrollbar">
          {Object.keys(groupedData).map((key, index) => {
            const [origin, destination] = key.split(" - ");
            return (
              <button
                key={index}
                className={`${
                  activeSegment === index
                    ? "border-[#155EEF] text-[#155EEF]"
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
                    mt-3 p-2 border-[1px] border-[#155EEF6E] rounded-md 
                    cursor-pointer
                  `}
                  onClick={(e) => handleMealClick(e, mealItem)}
                >
                  <div className="w-2/6">{mealItem.airlineDescription}</div>
                  <div className="w-2/6 text-center">{mealItem.price}</div>
                  <div className="w-2/6 flex justify-end items-center gap-2">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        className="peer hidden"
                        // name="radio-button"
                        name="{`meal-${activeOriginDestination}`}"
                        checked={isSelected(mealItem)}
                        readOnly
                      />
                      <span
                        className={`w-5 h-5 border border-black rounded-full cursor-pointer ${
                          isSelected(mealItem)
                            ? "bg-[#155EEF] border-[#155EEF]"
                            : ""
                        }`}
                      ></span>
                    </label>
                  </div>
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
