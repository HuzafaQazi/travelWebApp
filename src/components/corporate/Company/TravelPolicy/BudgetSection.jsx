import React, { memo, useCallback } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCircleInfo,
  faIndianRupeeSign,
  faUserGroup,
} from "@fortawesome/free-solid-svg-icons";
import Tooltip from "./Tooltip";
import style from "./style.module.css"

const BudgetSection = ({
  title,
  description,
  budgets,
  formData,
  travelCategory,
  onFormUpdate,
  validator,
}) => {
  const handleChange = useCallback(
    (id, value) => {
      if (value !== "" && !/^\d*\.?\d*$/.test(value)) {
        return;
      }

      // Get current budget for the specified travelCategory
      const currentBudget =
        formData.policyConfigData.find(
          (config) => config.travelCategory === travelCategory
        )?.budget || [];

      // const numericValue = parseFloat(value) || 0; // Ensure the value is a number
      const numericValue = value === "" ? null : Number(value);
      const index = currentBudget.findIndex(
        (obj) => obj.regionalCategoryId === id
      );

      let updatedBudget;
      if (index >= 0) {
        // Update existing budget item
        updatedBudget = currentBudget.map((obj, idx) =>
          idx === index ? { ...obj, amount: numericValue } : obj
        );
      } else {
        // Add new budget item
        updatedBudget = [
          ...currentBudget,
          { regionalCategoryId: id, amount: numericValue },
        ];
      }

      // Trigger update using onFormUpdate
      onFormUpdate({
        travelCategory,
        budget: updatedBudget,
      });
    },
    [formData, travelCategory, onFormUpdate]
  );

  const getAmountForId = useCallback(
    (id) => {
      const currentBudget =
        formData.policyConfigData.find(
          (config) => config.travelCategory === travelCategory
        )?.budget || [];
      const foundObj = currentBudget.find((o) => o.regionalCategoryId === id);
      return foundObj ? foundObj.amount : "";
    },
    [formData, travelCategory]
  );

  return (
    <div className={`border-b border-gray-300 ${style.companyMob} pt-3 pb-3`}>
      <div className="flex justify-between">
        <div className="flex gap-3 items-center">
          <FontAwesomeIcon
            icon={faUserGroup}
            className="text-lg text-[#028fa3] bg-[#028FA312] p-2 rounded-full"
          />
          <div>
            <div className="text-[#171A19] font-semibold text-sm">{title}</div>
            <div className="text-[#171A19] font-normal text-xs">
              {description}
            </div>
          </div>
        </div>
      </div>

      <div className="mt-3 border-t border-[#4A4A4A0D] pt-3">
        <div className="flex items-center gap-3 w-full sm:w-4/6 ">
          {budgets?.map((item) => (
            <div
              className="flex flex-col gap-3 justify-center items-start w-1/2 mx-auto sm:w-1/3"
              key={item.regionalCategoryId}
            >

              <div className="flex items-center relative">
                <div className="text-[#171A19] text-xs font-semibold sm:text-lg text-left sm:font-normal">
                  {item.regionalCategoryName}
                </div>
                <div className="relative group">
                  <FontAwesomeIcon
                    icon={faCircleInfo}
                    className="text-[#028fa3] text-sm relative -top-3 ml-1 cursor-pointer"
                  />
                  <Tooltip content={item?.toolTip} />
                </div>
              </div>

              <div className="w-fit">
                <div className="relative w-full min-w-[100px] h-10">
                  <div className="absolute inset-y-0 left-2 flex items-center pointer-events-none">
                    <FontAwesomeIcon
                      icon={faIndianRupeeSign}
                      className="text-[#028FA3] text-sm"
                    />
                  </div>
                  <input
                    type="text"
                    className="block pl-5 px-2.5 pb-2.5 pt-2.5 w-full text-sm text-[#028FA3]  bg-transparent rounded-lg border-1 border-[#028fa3] appearance-none dark:text-black dark:border-[#028fa3] dark:focus:border-[#028fa3] focus:outline-none focus:ring-0 focus:border-[#028fa3]-600 peer"
                    value={getAmountForId(item.regionalCategoryId)}
                    onChange={(e) =>
                      handleChange(item.regionalCategoryId, e.target.value)
                    }
                    placeholder=" "
                  />
                  <label className="absolute text-sm text-[#028FA3] dark:text-[#028FA3] duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-white dark:bg-gray-900 px-2 peer-focus:px-2 peer-focus:text-[#028fa3] peer-focus:dark:text-[#028fa3] peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto start-1">
                    Amount
                  </label>
                  <div className="text-red-500 text-xxs mt-0"></div>
                  {/* <div className="text-red-500 text-xs mt-1">
                    {validator.message(
                      `budget-${item.regionalCategoryId}`,
                      getAmountForId(item.regionalCategoryId) ? "valid" : "",
                      "required"
                    )}
                  </div> */}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const MemoizedBudgetSection = memo(BudgetSection, (prevProps, nextProps) => {
  const prevBudget =
    prevProps.formData.policyConfigData.find(
      (config) => config.travelCategory === prevProps.travelCategory
    )?.budget || [];
  const nextBudget =
    nextProps.formData.policyConfigData.find(
      (config) => config.travelCategory === nextProps.travelCategory
    )?.budget || [];

  if (prevBudget.length !== nextBudget.length) {
    return false;
  }

  return prevBudget.every((prevItem, index) => {
    const nextItem = nextBudget[index];
    return (
      prevItem.regionalCategoryId === nextItem.regionalCategoryId &&
      prevItem.amount === nextItem.amount
    );
  });
});

MemoizedBudgetSection.displayName = "BudgetSection";

export default BudgetSection;
