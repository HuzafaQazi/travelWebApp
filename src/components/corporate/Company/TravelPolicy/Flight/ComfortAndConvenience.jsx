import React, { memo, useCallback, useState ,useEffect} from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCircleInfo, faUserGroup } from "@fortawesome/free-solid-svg-icons";
import Tooltip from ".././Tooltip";
import style from ".././style.module.css"

const ComfortAndConvenienceSection = ({
  comfortData,
  formData,
  travelCategory,
  onFormUpdate,
  validator,
}) => {
  const classObj = comfortData.subvalues.find((sv) => sv.subvalue === "Class");
  const addOnObj = comfortData.subvalues.find(
    (sv) => sv.subvalue === "Add-ons"
  );

  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const updateMedia = () => setIsMobile(window.innerWidth < 640);
    updateMedia(); // Initial check
    window.addEventListener("resize", updateMedia);
    return () => window.removeEventListener("resize", updateMedia);
  }, []);

  const handleClassToggle = useCallback(
    (cabinClassId) => {
      const numericId = Number(cabinClassId);

      const currentCabinClass =
        formData.policyConfigData.find(
          (config) => config.travelCategory === travelCategory
        )?.cabinClass || [];

      const isSelected = currentCabinClass.includes(numericId);
      const updatedCabinClass = isSelected
        ? currentCabinClass.filter((id) => id !== numericId)
        : [...currentCabinClass, numericId];

      onFormUpdate({
        travelCategory,
        cabinClass: updatedCabinClass,
      });
    },
    [formData, travelCategory, onFormUpdate]
  );

  const handleAddOnToggle = useCallback(
    (ssrTypeId) => {
      const numericId = Number(ssrTypeId);

      const currentSsrTypes =
        formData.policyConfigData.find(
          (config) => config.travelCategory === travelCategory
        )?.ssrTypes || [];

      const isSelected = currentSsrTypes.includes(numericId);
      const updatedSsrTypes = isSelected
        ? currentSsrTypes.filter((id) => id !== numericId)
        : [...currentSsrTypes, numericId];

      onFormUpdate({
        travelCategory,
        ssrTypes: updatedSsrTypes,
      });
    },
    [formData, travelCategory, onFormUpdate]
  );

  if (!comfortData) return null;

  return (
    <div className={` border-b border-gray-300 ${style.compInner}`}>
      <div className="flex justify-between">
        <div className="flex gap-3 items-center">
          <FontAwesomeIcon
            icon={faUserGroup}
            className="text-lg text-[#028fa3] bg-[#028FA312] p-2 rounded-full"
          />
          <div>
            <div className="text-[#171A19] font-semibold text-sm">
              {comfortData.value || "Comfort and Convenience"}
            </div>
            <div className="text-[#000000] font-normal text-xs">
              {comfortData.description || ""}
            </div>
          </div>
        </div>
      </div>

      <div className="mt-3 border-t border-[#4A4A4A0D]">
        <div className="flex flex-col gap-2">
          {classObj && (
            <div className="p-1">
              <div className="text-[#171A19] text-base font-semibold sm:pl-24">
                {classObj.subvalue}
              </div>
              <div className="flex flex-wrap  items-center gap-2 sm:gap-3 py-2">
                {classObj.data.map((cls, index) => {
                  const numericId = Number(cls.cabinClassId);
                  const isChecked = (
                    formData.policyConfigData.find(
                      (config) => config.travelCategory === travelCategory
                    )?.cabinClass || []
                  ).includes(numericId);

                  return (
                    <>
                      <div
                        key={`classObj-${index}`}
                        className="flex w-[44%] sm:w-[22%] items-center justify-center"
                      >
                        <label className="flex items-center gap-2 text-xs sm:text-sm text-[#028fa3] border-1 border-[#028fa380] p-3 rounded-full font-medium">
                          <input
                            type="checkbox"
                            className="form-checkbox h-4 w-4 text-[#028fa3] border-1 border-[#028fa3] rounded focus:ring-[#028fa3] checked:bg-[#028fa3] checked:border-[#028fa3]"
                            checked={isChecked}
                            onChange={() => handleClassToggle(cls.cabinClassId)}
                          />
                          <span>{cls.cabinClass}</span>
                        </label>
                      </div>
                      {index < classObj.data.length - 1 &&  (!isMobile || index !== 1) && (
                        <div className="h-20 border-l border-[#4A4A4A4D] "></div>
                      )}
                    </>
                  );
                })}
              </div>
              {/* <div className="text-red-500 text-xs mt-1">
                {validator.message(
                  "classCheckbox",
                  formData.policyConfigData.find(
                    (config) => config.travelCategory === travelCategory
                  )?.cabinClass.length > 0
                    ? "valid"
                    : "",
                  "required",
                  {
                    messages: {
                      required: "At least one checkbox must be selected.",
                    },
                  }
                )}
              </div> */}
            </div>
          )}

          {addOnObj && (
            <div className="flex flex-col border-t border-[#4A4A4A4D] p-1">
              <div className="text-[#171A19] text-base font-semibold sm:pl-24">
                {addOnObj.subvalue}
              </div>
              <div className="flex flex-wrap  items-center gap-2  sm:gap-3 pt-1">
                {addOnObj.data.map((addon, index) => {
                  const numericId = Number(addon.ssrTypeId);
                  const isChecked = (
                    formData.policyConfigData.find(
                      (config) => config.travelCategory === travelCategory
                    )?.ssrTypes || []
                  ).includes(numericId);

                  return (
                    <>
                      <div
                        key={`addOnObj-${index}`}
                        className="flex w-[44%] sm:w-[30%] items-center justify-center"
                      >
                        <label className="flex items-center gap-2 text-sm text-[#171A19] font-normal">
                          <input
                            type="checkbox"
                            className="form-checkbox h-4 w-4 text-blue-500 border-gray-300 rounded focus:ring-blue-400"
                            checked={isChecked}
                            onChange={() => handleAddOnToggle(addon.ssrTypeId)}
                          />
                          <div className="flex flex-col">
                            <div className="flex items-center relative">
                              <span className="text-[#171A19] text-sm">
                                {addon.ssrType}
                              </span>
                              <div className="relative group">
                                <FontAwesomeIcon
                                  icon={faCircleInfo}
                                  className="text-[#028fa3] text-sm relative -top-2 ml-1 cursor-pointer"
                                />
                                <Tooltip content={addon.toolTip} />
                              </div>
                            </div>
                            {addon.description && (
                              <span className="text-[#171A19] text-xs">
                                {addon.description}
                              </span>
                            )}
                          </div>
                        </label>
                      </div>
                      {index < addOnObj.data.length - 1 && (!isMobile || index !== 1) && (
                        <div className="h-20 border-l border-[#4A4A4A4D] "></div>
                      )}
                    </>
                  );
                })}
              </div>
              {/* <div className="text-red-500 text-xs mt-1">
                {validator.message(
                  "addonsCheckbox",
                  formData.policyConfigData.find(
                    (config) => config.travelCategory === travelCategory
                  )?.ssrTypes.length > 0
                    ? "valid"
                    : "",
                  "required",
                  {
                    messages: {
                      required: "At least one checkbox must be selected.",
                    },
                  }
                )}
              </div> */}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const MemoizedComfortAndConvenienceSection = memo(
  ComfortAndConvenienceSection,
  (prevProps, nextProps) => {
    const prevConfig = prevProps.formData.policyConfigData.find(
      (config) => config.travelCategory === prevProps.travelCategory
    );
    const nextConfig = nextProps.formData.policyConfigData.find(
      (config) => config.travelCategory === nextProps.travelCategory
    );

    // Compare cabinClass and ssrTypes
    return (
      prevProps.comfortData === nextProps.comfortData &&
      JSON.stringify(prevConfig?.cabinClass) ===
        JSON.stringify(nextConfig?.cabinClass) &&
      JSON.stringify(prevConfig?.ssrTypes) ===
        JSON.stringify(nextConfig?.ssrTypes)
    );
  }
);

MemoizedComfortAndConvenienceSection.displayName =
  "ComfortAndConvenienceSection";

export default ComfortAndConvenienceSection;
