import React, { memo, useCallback } from "react";

const TravelPolicyNameInput = ({
  formData,
  onFormUpdate,
  validator,
  placeholder,
  isReadOnly,
}) => {
  const handleNameChange = useCallback(
    (e) => {
      if (isReadOnly) return;
      const newValue = e.target.value;
      const updatedData = {
        travelPolicyName: newValue,
      };
      onFormUpdate(updatedData);
    },
    [onFormUpdate, isReadOnly]
  );


  return (
    <div className="w-[90%] sm:w-1/3">
      <div className="relative w-full min-w-[50px] h-10">
        <input
          type="text"
          id="editname"
          name="editname"
          value={formData?.travelPolicyName || ""}
          onChange={handleNameChange}
          className="block px-2.5 pb-2.5 pt-2.5 w-full text-sm text-gray-900 bg-transparent rounded-lg border-1 border-gray-300 appearance-none dark:text-black dark:border-gray-300 dark:focus:border-[#028fa3] focus:outline-none focus:ring-0 focus:border-[#028fa3]-600 peer"
          placeholder=" "
          readOnly={isReadOnly}
        />
        <label
          htmlFor="editname"
          className="absolute text-sm text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-white dark:bg-gray-900 px-2 peer-focus:px-2 peer-focus:text-[#028fa3] peer-focus:dark:text-[#028fa3] peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto start-1"
        >
          Travel policy name
          <span className="text-red-500 absolute right-[-5px] m-1 mt-0">*</span>
        </label>
        <div className="text-red-500 text-xs mt-1">
          {validator.message(
            "editname",
            formData?.travelPolicyName,
            "required"
          )}
        </div>
        <div className="text-red-500 text-xxs mt-0"></div>
      </div>
    </div>
  );
};

const MemoizedTravelPolicyNameInput = memo(
  TravelPolicyNameInput,
  (prevProps, nextProps) => {
    console.log(
      prevProps.formData?.travelPolicyName ===
      nextProps.formData?.travelPolicyName &&
      prevProps.validator === nextProps.validator
    );
    return (
      prevProps.formData?.travelPolicyName ===
      nextProps.formData?.travelPolicyName &&
      prevProps.validator === nextProps.validator
    );
  }
);

export default TravelPolicyNameInput;
