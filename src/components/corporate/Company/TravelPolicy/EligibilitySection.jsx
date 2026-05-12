import React, { memo, useCallback } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCircleInfo, faUserGroup } from "@fortawesome/free-solid-svg-icons";
import Tooltip from "./Tooltip";
import style from "./style.module.css"

const EligibilitySection = ({
  title,
  description,
  eligibilityData = [],
  formData,
  travelCategory,
  onFormUpdate,
  validator,
}) => {
  const handleToggle = useCallback(
    (eligibilityId) => {
      // const numericId = Number(eligibilityId);
      const numericId = eligibilityId;

      // Find the current eligibility for the given travelCategory
      const currentEligibility =
        formData.policyConfigData.find(
          (config) => config.travelCategory === travelCategory
        )?.eligibility || [];

      const isSelected = currentEligibility.includes(numericId);

      // Update the eligibility list
      const updatedEligibility = isSelected
        ? currentEligibility.filter((id) => id !== numericId)
        : [...currentEligibility, numericId];

      // Call onFormUpdate with the updated data for the travelCategory
      onFormUpdate({
        travelCategory,
        eligibility: updatedEligibility,
      });
    },
    [formData, travelCategory, onFormUpdate]
  );

  // Get current eligibility for rendering
  const currentEligibility =
    formData.policyConfigData.find(
      (config) => config.travelCategory === travelCategory
    )?.eligibility || [];

  return (
    <div className={`border-b border-gray-300 ${style.companyMob} pt-3 pb-3`}>
      <div className="flex gap-3 items-center">
        <FontAwesomeIcon
          icon={faUserGroup}
          className="text-lg text-[#028fa3] bg-[#028FA312] p-2 rounded-full"
        />
        <div>
          <div className="text-[#171A19] font-semibold text-sm">{title}</div>
          <div className="text-[#000000] font-normal text-xs">
            {description}
          </div>
        </div>
      </div>

      <div className="mt-3 border-t border-[#4A4A4A0D] pt-2 flex flex-col gap-3 md:flex-row items-center justify-around">
        {eligibilityData?.map((item) => {
          // const numericId = Number(item.eligibilityId);
          const numericId = item.eligibilityId;
          const isChecked = currentEligibility.includes(numericId);
          const toolTipContent = item?.toolTip;

          return (
            <label
              key={item.eligibilityId}
              className="flex items-center gap-2 text-sm text-[#171A19] font-normal cursor-pointer"
            >
              <input
                type="checkbox"
                className="form-checkbox h-4 w-4 text-blue-500 border-gray-300 rounded focus:ring-blue-400 cursor-pointer"
                checked={isChecked}
                onChange={() => handleToggle(item.eligibilityId)}
              />
              <div className="flex flex-col">
                <div className="flex items-center relative">
                  <span className="text-[#171A19] text-sm">
                    {item.eligibility}
                  </span>
                  <div className="relative group">
                    <FontAwesomeIcon
                      icon={faCircleInfo}
                      className="text-[#028fa3] text-sm relative -top-2 ml-1 cursor-pointer"
                    />
                    <Tooltip content={toolTipContent} />
                  </div>
                </div>
                <span className="text-[#171A19] text-xs">
                  {item.description}
                </span>
              </div>
            </label>
          );
        })}
      </div>
      {/* <div className="text-red-500 text-xs mt-2">
        {validator.message(
          `eligibility-${travelCategory}`,
          currentEligibility.length > 0 ? "valid" : "",
          "required",
          {
            messages: { required: "At least one checkbox must be selected." },
          }
        )}
      </div> */}
    </div>
  );
};

const MemoizedEligibilitySection = memo(
  EligibilitySection,
  (prevProps, nextProps) => {
    const prevEligibility =
      prevProps.formData.policyConfigData.find(
        (config) => config.travelCategory === prevProps.travelCategory
      )?.eligibility || [];
    const nextEligibility =
      nextProps.formData.policyConfigData.find(
        (config) => config.travelCategory === nextProps.travelCategory
      )?.eligibility || [];

    return (
      prevProps.eligibilityData === nextProps.eligibilityData &&
      prevEligibility.length === nextEligibility.length &&
      prevEligibility.every((id) => nextEligibility.includes(id))
    );
  }
);

export default EligibilitySection;
