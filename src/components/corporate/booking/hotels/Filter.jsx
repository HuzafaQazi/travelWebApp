import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faChevronRight,
  faChevronDown,
} from "@fortawesome/free-solid-svg-icons";
import ReactSlider from "react-slider";
import Rating from "react-rating-stars-component";
import style from "./style.module.css"
const Filter = ({
  isExpanded,
  toggleExpanded,
  filters,
  onFilterChange,
  dynamicFilters,
}) => {
  const handlePriceRangeChange = (newValues) => {
    onFilterChange({ priceRange: newValues });
  };

  const handleStarRatingChange = (rating) => {
    const newStarRating = filters.starRating.includes(rating)
      ? filters.starRating.filter((r) => r !== rating)
      : [...filters.starRating, rating];
    onFilterChange({ starRating: newStarRating });
  };

  const handleRoomPreferenceChange = (preference) => {
    onFilterChange({
      roomPreference: {
        ...filters.roomPreference,
        [preference]: !filters.roomPreference[preference],
      },
    });
  };

  const handleAmenityChange = (amenity) => {
    const newAmenities = filters.amenities.includes(amenity)
      ? filters.amenities.filter((a) => a !== amenity)
      : [...filters.amenities, amenity];
    onFilterChange({ amenities: newAmenities });
  };

  const handleInPolicyChange = () => {
    onFilterChange({ inPolicyOnly: !filters.inPolicyOnly });
  };

  return (
    // <div className={style.Filters}>
    <div
      className={`bg-[#030b090d] p-3 px-2 rounded-lg transition-all duration-300 ${style.Filters} ${
        isExpanded ? "w-full" : "w-[100%]"
      }`}
    >
      <div
        className="flex justify-between items-center cursor-pointer"
        onClick={toggleExpanded}
      >
        <span className="text-xl font-medium text-[#030B09]">Filters</span>
        <FontAwesomeIcon
          icon={isExpanded ? faChevronDown : faChevronRight}
          className="text-gray-600"
        />
      </div>
      {isExpanded && (
        <div>
          {/* {dynamicFilters?.policy && ( */}
          <div className="bg-white p-2 rounded-lg mt-2">
            <span className="text-[#171A19] text-base font-medium">
              Hotel Policy
            </span>
            <div className="mt-3">
              <label className="inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  className="sr-only peer"
                  checked={filters.inPolicyOnly}
                  onChange={handleInPolicyChange}
                />
                <div className="relative w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-[#E5E1E2] peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#155EEF]"></div>
                <span className="ms-3 text-[#171A19CC] font-normal text-base">
                  In policy options only
                </span>
              </label>
            </div>
          </div>
          {/* )} */}

          {/* <div className="bg-white p-3 pb-4 rounded-lg mt-3">
            <span className="text-[#171A19] text-base font-medium">
              Room Preference
            </span>
            <div className="mt-3">
              {["breakfast", "lunch", "dinner"].map((meal) => (
                <div
                  key={meal}
                  className="flex items-center justify-between mt-2"
                >
                  <label className="block font-medium text-sm text-[#171A19CC]">
                    {meal.charAt(0).toUpperCase() + meal.slice(1)} Included
                  </label>
                  <input
                    type="checkbox"
                    className="form-checkbox h-5 w-5 text-[#155EEF] cursor-pointer"
                    checked={filters.roomPreference[meal]}
                    onChange={() => handleRoomPreferenceChange(meal)}
                  />
                </div>
             ))}
            </div>
          </div> */}
          {dynamicFilters?.priceRange &&
            dynamicFilters?.priceRange?.length === 2 && (
              <div className="bg-white pt-2 px-3 pb-4 rounded-lg mt-3">
                <span className="text-[#171A19] text-base font-medium">
                  Price per night
                </span>
                <div>
                  <ReactSlider
                    className="w-full h-2 cursor-pointer"
                    min={dynamicFilters?.priceRange?.[0]}
                    max={dynamicFilters?.priceRange?.[1]}
                    value={filters.priceRange}
                    onChange={handlePriceRangeChange}
                    minDistance={1000}
                    pearling
                    withTracks={true}
                    renderTrack={(props, state) => {
                      const isLeft = state.index === 0; // Before the first thumb
                      const isRight = state.index === 2; // After the second thumb
                      const isMiddle = state.index === 1; // Between the thumbs

                      return (
                        <div
                          {...props}
                          className={`h-1 mt-[5px] mx-1 ${
                            isLeft || isRight ? "bg-gray-300" : "bg-[#155EEF]"
                          }`}
                        />
                      );
                    }}
                    renderThumb={(props) => (
                      <div
                        {...props}
                        className="bg-[#155EEF] h-4 w-4 rounded-full cursor-pointer focus:outline-none"
                      />
                    )}
                  />
                  <div className="flex justify-between mt-2 text-gray-600 text-sm">
                    <span className="text-[#171A19CC] text-sm font-medium">
                      Rs.{filters.priceRange[0].toLocaleString()}
                    </span>
                    <span className="text-[#171A19CC] text-sm font-medium">
                      Rs.{filters.priceRange[1].toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            )}

          {dynamicFilters?.starRatings &&
            dynamicFilters?.starRatings?.length > 0 && (
              <div className="bg-white px-3 pt-2 pb-3 rounded-lg mt-3">
                <span className="text-[#171A19] text-base font-medium">
                  Star Rating
                </span>
                <div>
                  {dynamicFilters?.starRatings.map((rating) => (
                    <div
                      key={rating}
                      className="flex items-center justify-between gap-8"
                    >
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 flex items-center justify-center border-2 border-[#155EEF] text-[#171A19] rounded-full text-center font-semibold text-sm">
                          {rating}
                        </div>
                        <Rating
                          count={5}
                          value={rating}
                          size={24}
                          edit={false}
                          activeColor="#DB884C"
                        />
                      </div>
                      <input
                        type="checkbox"
                        checked={filters.starRating.includes(rating)}
                        onChange={() => handleStarRatingChange(rating)}
                        className="form-checkbox h-5 w-5 text-[#155EEF] cursor-pointer"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}
        </div>
      )}
    </div>
    // </div>
  );
};

export default Filter;
