import React, { useState, useEffect, useRef } from "react";
import { useSelector } from "react-redux";
import Image from "next/image";
import addDep from "../../../images/addDep.png";
import "tailwindcss/tailwind.css";
import config from "@/config";
import showToast from "@/utils/toast";
import axios from "@/utils/axios/axios";
import useFormValidator from "@/hooks/useFormValidator";

const AddDepartment = ({ isVisible, onClose, fetchList }) => {
  const userDetails = useSelector((state) => state?.user?.userInfo);

  const popupRef = useRef(null);

  const [selectedDepartments, setSelectedDepartments] = useState([]);
  const [inputValue, setInputValue] = useState("");
  const [suggestionList, setSuggestionList] = useState([]);
  const [isSuggestionLoading, setIsSuggestionLoading] = useState(true);
  const [validationTrigger, setValidationTrigger] = useState(false);

  useEffect(() => {
    const fetchSuggestionList = async () => {
      try {
        const response = await axios.get(
          `${config.CORPORATE.DEPARTMENT_ADD_SUGGESTION_LIST}`
        );
        if (response.data.status === "SUCCESS") {
          setSuggestionList(response.data.data.departments);
        }
      } catch (error) {
        console.log("Error fetching suggestion list:", error);
      } finally {
        setIsSuggestionLoading(false);
      }
    };

    if (isVisible) {
      fetchSuggestionList();
    }
  }, [isVisible]);

  const customMessages = {
    required: "This field is required.",
  };

  const customRules = {
    myCustomRule: {
      message: "The :attribute must start with a letter.",
      rule: (val, params, validator) =>
        validator.helpers.testRegex(val, /^[a-zA-Z].*$/),
      required: true,
    },
  };

  const handleClickOutside = (event) => {
    if (popupRef.current && !popupRef.current.contains(event.target)) {
      onClose(); // Close the popup
    }
  };

  useEffect(() => {
    if (onClose) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [onClose]);

  const [validator, updateValidator] = useFormValidator(
    customMessages,
    customRules
  );

  if (!isVisible) return null;

  const toggleDepartment = (department) => {
    setSelectedDepartments((prevSelected) => {
      if (prevSelected.includes(department)) {
        return prevSelected.filter((dep) => dep !== department);
      } else {
        return [...prevSelected, department];
      }
    });
  };

  const handleInputChange = (e) => {
    setInputValue(e.target.value);
  };

  const handleInputKeyPress = (e) => {
    if (
      e.key === "Enter" &&
      inputValue.trim() &&
      !selectedDepartments.includes(inputValue.trim())
    ) {
      setSelectedDepartments((prevSelected) => [
        ...prevSelected,
        inputValue.trim(),
      ]);
      setInputValue("");
    }
  };

  const removeDepartment = (department) => {
    setSelectedDepartments((prevSelected) =>
      prevSelected.filter((dep) => dep !== department)
    );
  };

  const handleSubmit = async () => {
    try {
      if (selectedDepartments.length === 0) {
        validator.showMessages();
        setValidationTrigger((prev) => !prev);
        return;
      }
      const { userId, companyId, loggedInDetails } = userDetails;
      const createdBy = `${loggedInDetails?.userDetails?.firstName} ${loggedInDetails?.userDetails?.lastName}`;
      const modifiedBy = `${loggedInDetails?.userDetails?.firstName} ${loggedInDetails?.userDetails?.lastName}`;
      const payload = selectedDepartments.map((departmentName) => ({
        // companyId,
        departmentName,
        // status: "active",
        // createdBy: userId,
        // modifiedBy: userId,
      }));

      const response = await axios.post(
        `${config.CORPORATE.DEPARTMENT_ADD}`,
        payload
      );
      if (response.data.status === "SUCCESS") {
        showToast("success", "Departments created successfully");
        onClose();
        setSelectedDepartments([]);
        await fetchList(1);
      }
    } catch (error) {
      console.error("Error:", error);
      showToast(
        "error",
        error.response?.data?.message ||
          "Something went wrong, please try again later"
      );
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 cursor-pointer">
      <div
        className="relative top-10 ml-2 mr-2 sm:!mx-auto p-5 pt-2 px-3 border w-[95%] sm:!w-2/4 shadow-lg rounded-md bg-white"
        ref={popupRef}
      >
        <div className="flex justify-end">
          <button
            type="button"
            className="text-[#ffffff] hover:text-gray-700 bg-[#878786] p-0 px-2 rounded-full"
            onClick={onClose}
          >
            ×
          </button>
        </div>
        <div className="flex m-auto sm:w-2/3 items-center">
          <Image src={addDep} alt="Add Department" width={150} />
          <div className="w-full flex flex-col items-center justify-center">
            <span className="font-bold text-sm sm:text-base ">Add Department</span>
            
          </div>
        </div>
        <div className="border-b mt-6"></div>
        <div className="w-full mt-5">
          <div className="font-bold text-xs sm:text-sm mb-1">Type and press enter to select the department </div>
          <div className="relative w-full min-w-[50px] h-10">
            <input
              className="block px-2.5 pb-2.5 pt-2.5 w-full text-sm text-gray-900 bg-transparent rounded-lg border-1 border-gray-300 appearance-none dark:text-black dark:border-gray-300 dark:focus:border-[#028fa3] focus:outline-none focus:ring-0 focus:border-[#028fa3]-600 peer"
              placeholder=" "
              value={inputValue}
              onChange={handleInputChange}
              onKeyPress={handleInputKeyPress}
              id="department"
              name="department"
              maxLength={30}
            />
            <label
              htmlFor="department"
              className="absolute text-sm text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-white dark:bg-gray-900 px-2 peer-focus:px-2 peer-focus:text-[#028fa3] peer-focus:dark:text-[#028fa3] peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto start-1"
            >
              Name of the Department
            </label>
            <div className="text-red-500 text-xs mt-1">
              {selectedDepartments.length === 0 &&
                validator.message("department", inputValue, "required")}
            </div>
          </div>
        </div>
        <div className="mt-3 h-48 border-b">
          <span className="text-sm sm:text-base font-medium">
            Choose department and create in bulk
          </span>
          <div className="mt-2">
            {isSuggestionLoading ? (
              <p>Loading suggestions...</p>
            ) : (
              suggestionList.map((department) => (
                <div
                  key={department._id}
                  className="inline-flex items-center rounded-full px-2 bg-gray-100 ml-2 mb-2"
                >
                  <label
                    className="relative flex items-center p-1 rounded-full cursor-pointer"
                    htmlFor={department._id}
                  >
                    <input
                      type="checkbox"
                      className={`before:content[''] peer relative h-2.5 w-2.5 cursor-pointer appearance-none rounded-md border border-gray-500 transition-all before:absolute before:block before:h-12 before:w-12 before:-translate-y-2/4 before:-translate-x-2/4 before:rounded-full before:bg-blue-gray-500 before:opacity-0 before:transition-opacity checked:border-transparent checked:bg-[#028fa3]`}
                      id={department._id}
                      checked={selectedDepartments.includes(
                        department.departmentName
                      )}
                      onChange={() =>
                        toggleDepartment(department.departmentName)
                      }
                    />
                  </label>
                  <label
                    className="mt-px text-sm font-light text-gray-700 cursor-pointer select-none"
                    htmlFor={department._id}
                  >
                    {department.departmentName}
                  </label>
                </div>
              ))
            )}
          </div>
        </div>
        <div className="flex flex-wrap mt-2">
          {selectedDepartments.map((department) => (
            <div
              key={department}
              className="flex items-center text-[#028fa3] rounded-full px-3 py-1 bg-custom-light-blue mr-2 mb-2"
            >
              <span className="text-sm">{department}</span>
              <button
                type="button"
                className="ml-2 text-xs p-0 px-1 text-[#ffffff] rounded-full hover:text-gray-700 bg-[#028fa3]"
                onClick={() => removeDepartment(department)}
              >
                ×
              </button>
            </div>
          ))}
        </div>
        <div className="text-center">
          <div className="mt-2 sm:px-7 py-3 flex justify-center gap-4">
            <button
              type="button"
              className="inline-flex justify-center w-fit rounded-md border border-gray-300 px-4 py-2 text-xs sm:text-base font-medium text-gray-500"
              onClick={onClose}
            >
              Cancel
            </button>
            <button
              type="button"
              className="inline-flex justify-center w-fit rounded-md border border-transparent px-4 py-2 bg-[#028fa3] text-xs sm:text-base font-medium text-white"
              onClick={handleSubmit}
            >
              Create Department
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddDepartment;
