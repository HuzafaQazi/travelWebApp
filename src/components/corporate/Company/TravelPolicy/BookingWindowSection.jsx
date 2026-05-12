import React, { memo, useCallback, useMemo } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlane, faBed, faCircleInfo } from "@fortawesome/free-solid-svg-icons";
import Tooltip from "./Tooltip";
import style from "./style.module.css"

const BookingWindowSection = ({
  icon,
  title = "Booking Window",
  description = "",
  formData,
  travelCategory,
  onFormUpdate,
  subvalues = [],
  validator,
}) => {
  // Memoize the current configuration based on formData and travelCategory
  const currentConfig = useMemo(
    () =>
      formData?.policyConfigData?.find(
        (config) => config.travelCategory === travelCategory
      ) || {},
    [formData.policyConfigData, travelCategory]
  );

  const handleDateChange = useCallback(
    (value) => {
      onFormUpdate({
        travelCategory,
        bookingWindow: value,
      });
    },
    [travelCategory, onFormUpdate]
  );

  return (
    <div className={`border-b border-gray-300 ${style.compInner}`}>
      <div className="flex justify-between">
        <div className="flex gap-3 items-center">
          <FontAwesomeIcon
            icon={icon === "flight" ? faPlane : faBed}
            className={`text-lg text-[#028fa3] bg-[#028FA312] p-2 rounded-full ${icon === "flight" ? "transform -rotate-90" : ""
              }`}
          />
          <div>
            <div className="text-[#171A19] font-semibold text-sm">{title}</div>
            <div className="text-[#000000] font-normal text-xs">
              {description}
            </div>
          </div>
        </div>
      </div>

      <div className="mt-3 border-t border-[#4A4A4A0D]">
        <div className="flex items-center gap-3 w-1/2 py-5">
          {subvalues.map((subvalue) => {
            const fieldName = subvalue.subvalue.toLowerCase(); // Use subvalue as field name (e.g., 'from', 'to')
            const fieldValue = currentConfig?.bookingWindow || "";

            return (
              <div
                key={subvalue.subvalue}
                className="flex flex-col gap-3 justify-center items-start mx-auto"
              >

                <div className="flex gap-2 items-center">
                  <div className="flex items-center relative">
                    <div className="w-fit">
                      <div className="relative w-full min-w-[100px] h-10">
                        <input
                          type={
                            subvalue.inputType === "calendar"
                              ? "date"
                              : subvalue.inputType
                          }
                          id={fieldName}
                          name={fieldName}
                          value={fieldValue}
                          onChange={(e) => handleDateChange(e.target.value)}
                          className="block px-2.5 pb-2.5 pt-2.5 w-full text-sm text-[#028FA3] bg-transparent rounded-lg border-1 border-[#028fa3] appearance-none dark:text-[#028fa3] dark:border-[#028fa3] dark:focus:border-[#028fa3] focus:outline-none focus:ring-0 focus:border-[#028fa3]-600 peer"
                          placeholder=""
                        />
                        <label
                          htmlFor={fieldName}
                          className="absolute text-sm text-[#028FA3] dark:text-[#028FA3] duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-white dark:bg-gray-900 px-2 peer-focus:px-2 peer-focus:text-[#028fa3] peer-focus:dark:text-[#028fa3] peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto start-1"
                        >
                          {/* {subvalue.subvalue} */}
                        </label>
                        <div className="text-red-500 text-xxs mt-0"></div>
                        {/* <div className="text-red-500 text-xs mt-1">
                      {validator.message(fieldName, fieldValue, "required")}
                    </div> */}
                      </div>
                    </div>
                    <div className="relative group -top-4">
                      <FontAwesomeIcon
                        icon={faCircleInfo}
                        className="text-[#028fa3] text-sm relative -top-3 ml-1 cursor-pointer"
                      />
                      <Tooltip content={subvalue?.toolTip} />
                    </div>
                  </div>
                  <div className="text-[#028fa3] text-sm font-medium">days</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

const MemoizedBookingWindowSection = memo(
  BookingWindowSection,
  (prevProps, nextProps) => {
    // Compare basic props
    if (
      prevProps.icon !== nextProps.icon ||
      prevProps.title !== nextProps.title ||
      prevProps.description !== nextProps.description
    ) {
      return false;
    }

    // Compare booking window for the specific travelCategory
    const prevConfig = prevProps.formData.policyConfigData.find(
      (config) => config.travelCategory === prevProps.travelCategory
    );
    const nextConfig = nextProps.formData.policyConfigData.find(
      (config) => config.travelCategory === nextProps.travelCategory
    );

    const prevFrom = prevConfig?.bookingWindow?.from;
    const prevTo = prevConfig?.bookingWindow?.to;
    const nextFrom = nextConfig?.bookingWindow?.from;
    const nextTo = nextConfig?.bookingWindow?.to;

    return prevFrom === nextFrom && prevTo === nextTo;
  }
);

MemoizedBookingWindowSection.displayName = "BookingWindowSection";

export default BookingWindowSection;
