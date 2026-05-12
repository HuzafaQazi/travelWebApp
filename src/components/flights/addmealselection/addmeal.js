import { useState } from "react";
import style from "./styles.module.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faAngleDown,
  faAngleUp,
  faPlus,
  faMinus,
} from "@fortawesome/free-solid-svg-icons";
import SideSHeetFlight from "@/components/flights/sidesheetFlights/sidesheetFlights";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import showToast from "@/utils/toast";
const SideSheet = ({
  isOpen,
  onClose,
  ssrResponse,
  resultIndex,
  flightsRequest,
  adultPrice,
  originCode,
  destinationCode,
  handleMealSelection,
  selectedMeals,
  setSelectedMeals,
  mealQuantities,
  setMealQuantities,
  mealPrice,
  setMealPrice,
  totalSelectedQuantity,
  setTotalSelectedQuantity,
  setSelectedSection,
}) => {
  const adultCount = parseInt(flightsRequest.searchReqData.adultCount, 10);
  const childCount = parseInt(flightsRequest.searchReqData.childCount, 10);
  const infantCount = parseInt(flightsRequest.searchReqData.infantCount, 10);
  const totalCount = adultCount + childCount + infantCount;
  const overallAdultCount = adultCount + childCount + infantCount;

  const [isDetailsVisible, setDetailsVisible] = useState(true);
  const [count, setCount] = useState(0);
  const [isAddDetailsVisible, setAddDetailsVisible] = useState(false);
  const [isToastVisible, setIsToastVisible] = useState(false);

  const toggleDetails = () => {
    setDetailsVisible(!isDetailsVisible);
  };
  const handleIncrement = (meal, index) => {
    const currentQuantity = mealQuantities[index] || 0;
    if (totalSelectedQuantity < totalCount) {
      setMealQuantities((prevQuantities) => ({
        ...prevQuantities,
        [index]: currentQuantity + 1,
      }));
      updateSelectedMeals(meal, currentQuantity + 1);
      setTotalSelectedQuantity((prev) => prev + 1);
    } else {
      if (!isToastVisible) {
        showToast("info",
          "You have reached the maximum number of meals per passengers for this flight."
        );
        setIsToastVisible(true);

        // Reset the flag after a specific duration (e.g., 3 seconds)
        setTimeout(() => {
          setIsToastVisible(false);
        }, 6000);
      }
      return;
    }
  };

  const handleDecrement = (meal, index) => {
    const currentQuantity = mealQuantities[index] || 0;
    if (currentQuantity > 0 && totalSelectedQuantity > 0) {
      setMealQuantities((prevQuantities) => ({
        ...prevQuantities,
        [index]: currentQuantity - 1,
      }));
      updateSelectedMeals(meal, currentQuantity - 1);
      setTotalSelectedQuantity((prev) => prev - 1);
    }
  };

  const updateSelectedMeals = (meal, quantity) => {
    if (ssrResponse.isLcc) {
      const selectedMeal = {
        resultIndex: resultIndex,
        airlineCode: meal.airlineCode,
        flightNumber: meal.flightNumber,
        wayType: meal.wayType,
        code: meal.code,
        description: meal.description,
        airlineDescription: meal.airlineDescription,
        quantity: meal.quantity,
        currency: meal.currency,
        price: meal.price,
        origin: meal.origin,
        destination: meal.destination,
      };
      const existingIndex = selectedMeals.findIndex(
        (m) => m.code === meal.code
      );
      let updatedMeals;
      if (existingIndex !== -1) {
        updatedMeals = [...selectedMeals];
        updatedMeals[existingIndex].quantity = quantity;
        if (updatedMeals[existingIndex].quantity === 0) {
          updatedMeals.splice(existingIndex, 1);
        }
      } else {
        updatedMeals = [...selectedMeals, selectedMeal];
      }
      const totalMealPrice = updatedMeals.reduce(
        (total, meal) => total + meal.price * meal.quantity,
        0
      );
      setMealPrice(totalMealPrice);
      setSelectedMeals(updatedMeals);
      handleMealSelection(updatedMeals, 1, totalMealPrice);
    } else {
      const selectedMeal = {
        resultIndex: resultIndex,
        code: meal.code,
        description: meal.description,
        quantity,
      };

      const existingIndex = selectedMeals.findIndex(
        (m) => m.code === meal.code
      );
      let updatedMeals;
      if (existingIndex !== -1) {
        updatedMeals = [...selectedMeals];
        updatedMeals[existingIndex].quantity = quantity;
        if (updatedMeals[existingIndex].quantity === 0) {
          updatedMeals.splice(existingIndex, 1);
        }
      } else {
        updatedMeals = [...selectedMeals, selectedMeal];
      }
      const totalMealPrice = 0;
      setMealPrice(totalMealPrice);
      setSelectedMeals(updatedMeals);
      handleMealSelection(updatedMeals, 2, totalMealPrice);
    }
  };

  const handleSubmit = () => {
    setSelectedSection("details");
  };

  const formatPrice = (price) => {
    return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };

  const mealsArray =
    ssrResponse?.ssr?.ssrData?.mealDynamic || ssrResponse?.ssr?.meal || [];

  return (
    <>
      <div className={`${style.sideSheet} ${isOpen ? style.open : ""}`}>
        <div className={style.scrollContent}>
          <div>
            <div
              className={style.reviewDetailsContainer}
              onClick={toggleDetails}
            >
              Price details
              <FontAwesomeIcon
                className={style.front1}
                icon={isDetailsVisible ? faAngleDown : faAngleUp}
              />
            </div>
            {isDetailsVisible && (
              <div
                className={style.wholecontainer}
                style={{ backgroundColor: " rgba(229, 233, 235, 0.46)" }}
              >
                <div className={style.maincontainer}>
                  <div className={style.wayscontainer}>
                    <span className={style.ways}>
                      {originCode} - {destinationCode}
                    </span>
                    <span className={style.travelerdetails}>
                      {overallAdultCount} Traveler{" "}
                    </span>
                  </div>
                </div>
                {/* {price details} */}
                <div className={style.priceRows}>
                  <div className={style.priceRow}>
                    Adult
                    <span>Rs {formatPrice(adultPrice)}</span>
                  </div>
                  <div className={style.priceRow}>
                    Meals
                    <span>Rs {formatPrice(mealPrice)} </span>
                  </div>
                  <div className={style.priceRow1}>
                    Amount to be paid
                    <span>Rs {formatPrice(adultPrice + mealPrice)} </span>
                  </div>
                </div>
              </div>
            )}
            {/* {food meals added 1} */}
            <div className={style.mealscontainer}>
              <span className={style.Foodmainue}>Name </span>
              <span className={style.Foodmainue}>Quantity</span>
              <span className={style.Foodmainue}>Price</span>
            </div>
            {mealsArray.map((meal, index) => (
              <div className={style.wrapper} key={meal.code}>
                <div className={style.menucontainer}>
                  <span className={style.desert1}>
                    {meal.description || meal.airlineDescription}
                  </span>

                  <div className={style.counterContainer}>
                    <button
                      onClick={() => handleDecrement(meal, index)}
                      className={style.button}
                    >
                      <FontAwesomeIcon icon={faMinus} />
                    </button>
                    <span className={style.count}>
                      {mealQuantities[index] || 0}
                    </span>
                    <button
                      onClick={() => handleIncrement(meal, index)}
                      className={style.button}
                    >
                      <FontAwesomeIcon icon={faPlus} />
                    </button>
                  </div>
                  <span className={style.costruppes}>
                    ₹
                    {meal.price
                      ? (meal.price * (mealQuantities[index] || 1)).toFixed(2)
                      : 0}
                  </span>
                </div>
              </div>
            ))}

            <div className={style.addProceedBtn}>
              <div className={style.proceedBtn} onClick={handleSubmit}>
                Continue
              </div>
            </div>
          </div>
        </div>
      </div>
      {isAddDetailsVisible && <SideSHeetFlight />}
    </>
  );
};

export default SideSheet;
