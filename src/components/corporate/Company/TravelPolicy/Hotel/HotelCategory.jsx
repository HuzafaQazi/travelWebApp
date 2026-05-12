import React, { memo, useCallback } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCircleInfo, faUserGroup } from "@fortawesome/free-solid-svg-icons";
import Tooltip from "../Tooltip";

const StarRating = memo(
  ({ maxRating = 5, selectedRatings = [], onSelect, minRating = 3 }) => {
    const ratings = Array.from(
      { length: maxRating - minRating + 1 },
      (_, i) => i + minRating
    );

    return (
      <div className="flex flex-col gap-2">
        <div className="text-[#171A19] text-sm font-semibold">Star Ratings</div>
        <div className="flex space-x-4 p-2 border rounded-lg text-sm">
          {ratings.map((rating) => (
            <div
              key={rating}
              className={`flex items-center space-x-1 cursor-pointer ${
                selectedRatings.includes(rating)
                  ? "text-[#028fa3]"
                  : "text-gray-400"
              }`}
              onClick={() => onSelect(rating)}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill={
                  selectedRatings.includes(rating) ? "currentColor" : "none"
                }
                viewBox="0 0 24 24"
                stroke="currentColor"
                className="w-5 h-5"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 17.75l-6.4 3.79 1.22-7.09-5.15-5.02 7.13-1.04L12 2.25l3.2 6.34 7.14 1.04-5.16 5.02 1.23 7.09-6.41-3.79z"
                />
              </svg>
              <span
                className={
                  selectedRatings.includes(rating)
                    ? "text-[#028fa3]"
                    : "text-gray-500"
                }
              >
                {rating}
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  }
);

StarRating.displayName = "StarRating";

const HotelCategorySection = ({
  hotelCategoryData,
  formData,
  travelCategory,
  onFormUpdate,
  validator,
}) => {
  const currentConfig =
    formData?.policyConfigData?.find(
      (config) => config.travelCategory === travelCategory
    ) || {};

  const starRatingsObj = hotelCategoryData?.subvalues?.find(
    (sv) => sv.subvalue === "Star Ratings"
  );
  const refundableObj = hotelCategoryData?.subvalues?.find(
    (sv) => sv.subvalue === "Refundable"
  );
  const filtersObj = hotelCategoryData?.subvalues?.find(
    (sv) => sv.subvalue === "Filters"
  );

  const minRating = Math.min(
    ...(starRatingsObj?.data?.map((r) => Number(r.value)) || [3])
  );
  const maxRating = Math.max(
    ...(starRatingsObj?.data?.map((r) => Number(r.value)) || [5])
  );

  const handleStarSelect = useCallback(
    (value) => {
      const selectedRatings = currentConfig.hotelCategory || [];
      const isSelected = selectedRatings.includes(value);

      onFormUpdate({
        travelCategory,
        hotelCategory: isSelected
          ? selectedRatings.filter((id) => id !== value)
          : [...selectedRatings, value],
      });
    },
    [currentConfig.hotelCategory, travelCategory, onFormUpdate]
  );

  const handleRefundableToggle = useCallback(() => {
    const refundableId = refundableObj?.data?.[0]?.id || null;

    onFormUpdate({
      travelCategory,
      refundable:
        currentConfig.refundable === refundableId ? null : refundableId,
    });
  }, [refundableObj, currentConfig.refundable, travelCategory, onFormUpdate]);

  const handleFilterToggle = useCallback(
    (filterId) => {
      const selectedFilters = currentConfig.filters || [];
      const isSelected = selectedFilters.includes(filterId);

      onFormUpdate({
        travelCategory,
        filters: isSelected
          ? selectedFilters.filter((id) => id !== filterId)
          : [...selectedFilters, filterId],
      });
    },
    [currentConfig.filters, travelCategory, onFormUpdate]
  );

  const selectedRatings = currentConfig?.hotelCategory || [];
  const selectedFilters = currentConfig?.filters || [];
  const isRefundable = currentConfig?.refundable;

  return (
    <div className="p-3 border-b border-gray-300">
      <div className="flex justify-between">
        <div className="flex gap-3 items-center">
          <FontAwesomeIcon
            icon={faUserGroup}
            className="text-lg text-[#028fa3] bg-[#028FA312] p-2 rounded-full"
          />
          <div>
            <div className="text-[#171A19] font-semibold text-sm">
              {hotelCategoryData?.value}
            </div>
            <div className="text-[#000000] font-normal text-xs">
              {hotelCategoryData?.description}
            </div>
          </div>
        </div>
      </div>

      <div className="mt-3 border-t border-[#4A4A4A0D] pt-3 flex flex-col gap-4">
        {starRatingsObj && (
          <div>
            <StarRating
              maxRating={maxRating}
              minRating={minRating}
              selectedRatings={selectedRatings}
              onSelect={handleStarSelect}
            />
            {/* <div className="text-red-500 text-xs mt-1">
              {validator.message(
                "starRatings",
                selectedRatings.length > 0 ? "valid" : "",
                "required",
                {
                  messages: {
                    required: "At least one star rating is required.",
                  },
                }
              )}
            </div> */}
          </div>
        )}

        {refundableObj && (
          <div>
            <label className="inline-flex items-center gap-2 text-sm text-[#171A19] font-normal cursor-pointer">
              <input
                type="checkbox"
                className="form-checkbox h-4 w-4 text-[#028fa3] border-gray-300 rounded focus:ring-[#028fa3]"
                checked={isRefundable}
                onChange={handleRefundableToggle}
              />
              <div className="flex flex-col">
                <div className="flex items-center relative">
                  <span className="text-[#171A19] text-sm">
                    {refundableObj.subvalue}
                  </span>
                  <div className="relative group">
                    <FontAwesomeIcon
                      icon={faCircleInfo}
                      className="text-[#028fa3] text-sm relative -top-2 ml-1"
                    />
                    <Tooltip content={refundableObj?.toolTip} />
                  </div>
                </div>
                {refundableObj.description && (
                  <span className="text-[#171A19] text-xs">
                    {refundableObj.description}
                  </span>
                )}
              </div>
            </label>
          </div>
        )}

        {/* {filtersObj && (
          <div className="flex flex-col gap-2">
            <span className="text-[#171A19] text-sm font-semibold">
              {filtersObj.subvalue}
            </span>
            <div className="flex flex-wrap gap-4">
              {filtersObj.data?.map((f) => (
                <label
                  key={f.filterId}
                  className="flex items-center gap-2 text-sm text-[#171A19] font-normal cursor-pointer"
                >
                  <input
                    type="checkbox"
                    className="form-checkbox h-4 w-4 text-[#028fa3] border-gray-300 rounded focus:ring-[#028fa3]"
                    checked={selectedFilters.includes(f.filterId)}
                    onChange={() => handleFilterToggle(f.filterId)}
                  />
                  <div className="flex flex-col">
                    <div className="flex items-center relative">
                      <span className="text-[#171A19] text-xs sm:text-sm">
                        {f.filterName}
                      </span>
                    </div>
                    {f.description && (
                      <span className="text-[#171A19] text-xxs sm:text-xs">
                        {f.description}
                      </span>
                    )}
                  </div>
                </label>
              ))}
            </div>
            <div className="text-red-500 text-xs mt-1">
              {validator.message(
                "filters",
                selectedFilters.length > 0 ? "valid" : "",
                "required",
                { messages: { required: "At least one filter is required." } }
              )}
            </div>
          </div>
        )} */}
      </div>
    </div>
  );
};

const MemoizedHotelCategorySection = memo(
  HotelCategorySection,
  (prevProps, nextProps) => {
    // Compare hotelCategoryData
    if (prevProps.hotelCategoryData !== nextProps.hotelCategoryData) {
      return false;
    }

    // Extract the relevant configurations based on travelCategory
    const prevConfig = prevProps.formData?.policyConfigData?.find(
      (config) => config.travelCategory === prevProps.travelCategory
    );
    const nextConfig = nextProps.formData?.policyConfigData?.find(
      (config) => config.travelCategory === nextProps.travelCategory
    );

    // Compare the configurations
    if (!prevConfig || !nextConfig) {
      return false;
    }

    // Compare hotelCategory (star ratings)
    if (
      JSON.stringify(prevConfig.hotelCategory || []) !==
      JSON.stringify(nextConfig.hotelCategory || [])
    ) {
      return false;
    }

    // Compare filters
    if (
      JSON.stringify(prevConfig.filters || []) !==
      JSON.stringify(nextConfig.filters || [])
    ) {
      return false;
    }

    // Compare refundable
    if (prevConfig.isRefundable !== nextConfig.isRefundable) {
      return false;
    }

    return true;
  }
);

MemoizedHotelCategorySection.displayName = "HotelCategorySection";

export default HotelCategorySection;
