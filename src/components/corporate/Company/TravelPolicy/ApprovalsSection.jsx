import React, { memo, useCallback } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPlane,
  faBed,
  faCircleInfo,
} from "@fortawesome/free-solid-svg-icons";
import Tooltip from "./Tooltip";
import style from "./style.module.css"

const ApprovalsSection = ({
  icon,
  title = "Approvals",
  description = "",
  approvalsData = [],
  formData,
  travelCategory,
  onFormUpdate,
}) => {
  const handleToggle = useCallback(
    (configId) => {
      const currentConfig =
        formData.policyConfigData.find(
          (config) => config.travelCategory === travelCategory
        ) || {};
      const existing = currentConfig.approvalConfiguration || [];
      const foundIndex = existing.findIndex(
        (item) => Number(item.approvalConfigId) === Number(configId)
      );

      let updatedArray;
      if (foundIndex >= 0) {
        updatedArray = [
          ...existing.slice(0, foundIndex),
          ...existing.slice(foundIndex + 1),
        ];
      } else {
        updatedArray = [...existing, { approvalConfigId: Number(configId) }];
      }

      onFormUpdate({
        travelCategory,
        approvalConfiguration: updatedArray,
      });
    },
    [formData, travelCategory, onFormUpdate]
  );

  const isApproved = useCallback(
    (configId) => {
      const currentConfig =
        formData.policyConfigData.find(
          (config) => config.travelCategory === travelCategory
        ) || {};
      const arr = currentConfig.approvalConfiguration || [];
      return arr.some(
        (obj) => Number(obj.approvalConfigId) === Number(configId)
      );
    },
    [formData, travelCategory]
  );

  return (
    <div className={`${style.compInner}`}>
      <div className="flex items-center gap-3 mb-2">
        <FontAwesomeIcon
          icon={icon === "flight" ? faPlane : faBed}
          className={`text-lg text-[#028fa3] bg-[#028FA312] p-2 rounded-full ${
            icon === "flight" ? "transform -rotate-90" : ""
          }`}
        />
        <div>
          <div className="text-sm font-semibold text-[#171A19]">{title}</div>
          <div className="text-xs text-black">{description}</div>
        </div>
      </div>

      <div className="border-t border-gray-200 pt-3 flex flex-col gap-3">
        {approvalsData.map((conf) => {
          const configIdNum = Number(conf.approvalConfigId);
          const isOn = isApproved(configIdNum);

          return (
            <div
              key={conf.approvalConfigId}
              className="flex justify-between items-center"
            >
              <div className="flex items-center relative">
                <div className="text-sm text-[#171A19] font-normal pr-1">
                  {conf.approvalConfigName}
                </div>
                <div className="relative group">
                  <FontAwesomeIcon
                    icon={faCircleInfo}
                    className="text-[#028fa3] text-sm relative -top-3 ml-1 cursor-pointer"
                  />
                  <Tooltip content={conf?.toolTip} />
                </div>
              </div>

              <label className="inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  className="sr-only peer"
                  checked={isOn}
                  onChange={() => handleToggle(configIdNum)}
                />
                <div className="relative w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-[#E5E1E2] peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#028fa3]"></div>
              </label>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const MemoizedApprovalsSection = memo(
  ApprovalsSection,
  (prevProps, nextProps) => {
    // Compare basic props
    if (
      prevProps.icon !== nextProps.icon ||
      prevProps.title !== nextProps.title ||
      prevProps.description !== nextProps.description ||
      prevProps.approvalsData !== nextProps.approvalsData
    ) {
      return false;
    }

    // Compare approval configurations inside policyConfigData
    const prevConfig =
      prevProps.formData.policyConfigData.find(
        (config) => config.travelCategory === prevProps.travelCategory
      )?.approvalConfiguration || [];
    const nextConfig =
      nextProps.formData.policyConfigData.find(
        (config) => config.travelCategory === nextProps.travelCategory
      )?.approvalConfiguration || [];

    if (prevConfig.length !== nextConfig.length) {
      return false;
    }

    // Deep compare approval configuration arrays
    return prevConfig.every((prevItem, index) => {
      const nextItem = nextConfig[index];
      return (
        Number(prevItem.approvalConfigId) === Number(nextItem.approvalConfigId)
      );
    });
  }
);

MemoizedApprovalsSection.displayName = "ApprovalsSection";

export default ApprovalsSection;
