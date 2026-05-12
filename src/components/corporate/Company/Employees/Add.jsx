import { useEffect, useState, useRef } from "react";
import Image from "next/image";
import addDep from "@/images/addDep.png";
import "tailwindcss/tailwind.css";
import Select from "react-select";
import AsyncSelect from "react-select/async";
import showToast from "@/utils/toast";
import axios from "@/utils/axios/axios";
import { useSelector } from "react-redux";
import useFormValidator from "@/hooks/useFormValidator";
import config from "@/config";
import { getCityByCountry, getCountry } from "@/utils/common";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSpinner } from "@fortawesome/free-solid-svg-icons";
import {
  transformRoles,
  transformLevels,
  transformBands,
  transformDesignations,
} from "@/utils/common";

const EmployeeAdd = ({
  isEmpVisible,
  onClose,
  fetchList,
  activeTab,
  searchKey,
  generateFilterObjectForEmployee,
  selectedEmployeeFilterDepartments,
  selectedStatus,
  selectedRole,
  selectedLevel,
  selectedBand,
  selectedDesignation,
  paginationData,
}) => {
  const userDetails = useSelector((state) => state?.user?.userInfo);

  const popupRef = useRef(null);
  const isInitialRender = useRef(true); // Track the initial render

  const [departments, setDepartments] = useState([]);
  const [titleOptions, setTitleOptions] = useState([]);
  const [countryOptions, setCountryOptions] = useState([]);
  const [approverOptions, setApproverOptions] = useState([]);

  const initialFormData = {
    title: "",
    firstName: "",
    lastName: "",
    employeeId: "",
    workEmail: "",
    contactNumber: "",
    companyName: "",
    department: null,
    role: null,
    level: null,
    band: null,
    designation: null,
    city: null,
    country: null,
    passportNo: null,
    passportIssueDate: null,
    passportExpiry: null,
    dateOfBirth: null,
    address: null,
    passportIssueCountryCode: null,
    approvers: [],
    isApprover: false,
  };
  const [formData, setFormData] = useState(initialFormData);
  const [loading, setLoading] = useState(false);

  const [menuOpenedForRole, setMenuOpenedForRole] = useState(false);
  const [menuOpenedForLevel, setMenuOpenedForLevel] = useState(false);
  const [menuOpenedForBand, setMenuOpenedForBand] = useState(false);
  const [menuOpenedForDesignation, setMenuOpenedForDesignation] =
    useState(false);

  const [roles, setRoles] = useState([]);
  const [levels, setLevels] = useState([]);
  const [bands, setBands] = useState([]);
  const [designations, setDesignations] = useState([]);

  const [roleLoading, setRoleLoading] = useState(false);
  const [levelLoading, setLevelLoading] = useState(false);
  const [bandLoading, setBandLoading] = useState(false);
  const [designationLoading, setDesignationLoading] = useState(false);

  const customMessages = {
    required: "This field is required.",
    validMobile: "Invalid or incomplete mobile number.",
    validEmail: "Invalid email format.",
  };

  const customRules = {
    myCustomRule: {
      message: "The :attribute must start with a letter.",
      rule: (val, params, validator) =>
        validator.helpers.testRegex(val, /^[a-zA-Z].*$/),
      required: true,
    },
    validMobile: {
      // Define the custom validation function for a valid mobile number.
      message: "Invalid or incomplete mobile number.",
      rule: (val, params, validator) => {
        // The regular expression to match a 10-digit mobile number.
        const regex = /^[6789]\d{9}$/;
        return regex.test(val);
      },
    },
    validEmail: {
      message: "Invalid email format.",
      rule: (val, params, validator) => {
        const regex =
          /^[a-zA-Z0-9]+((\.[a-zA-Z0-9]+)|(_[a-zA-Z0-9]+)|(-[a-zA-Z0-9]+)|(\+[a-zA-Z0-9]+))*@[a-zA-Z0-9-]+(\.[a-zA-Z]{2,})+$/;
        return regex.test(val);
      },
    },
    validEmployeeID: {
      message: "Employee ID must be 2 to 15 alphanumeric characters long",
      rule: (val, params, validator) => {
        const regex =
          /^[a-zA-Z0-9!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?`~]{2,15}$/;
        return regex.test(val);
      },
    },
    validPassportNumber: {
      message: "Passport Number does not match the format",
      rule: (val, params, validator) => {
        const regex = /^[A-Za-z0-9]{3,30}$/;
        return regex.test(val);
      },
    },
    validExpiryDate: {
      message: "Date should be greater than today's date.",
      rule: (val, params, validator) => {
        const issueDate = new Date(val);
        const today = new Date();
        return issueDate > today;
      },
    },
    validIssueDate: {
      message: "Date should not be greater than today's date.",
      rule: (val, params, validator) => {
        const issueDate = new Date(val);
        const today = new Date();
        return issueDate <= today;
      },
    },
    dobValidation: {
      message: "Date of birth should indicate an age greater than 12 years.",
      rule: (val, params, validator) => {
        const selectedDate = new Date(val);
        const currentDate = new Date();

        // Calculate the date 12 years ago
        const minDate = new Date(
          currentDate.getFullYear() - 12,
          currentDate.getMonth(),
          currentDate.getDate()
        );

        return selectedDate <= minDate;
      },
    },
  };

  const [validator, updateValidator] = useFormValidator(
    customMessages,
    customRules
  );

  const today = new Date().toISOString().split("T")[0];

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (userDetails) {
          const { companyId, loggedInDetails } = userDetails;

          const [
            departmentResponse,
            titleResponse,
            countryResponse,
            approverResponse,
          ] = await Promise.all([
            axios.get(
              // `${config.CORPORATE.DEPARTMENT_LIST}?companyId=${companyId}`
              `${config.CORPORATE.DEPARTMENT_LIST}`
            ),
            axios.get(`${config.CORPORATE.USER_TITLES}`),
            getCountry(),
            axios.post(`${config.CORPORATE.EMPLOYEE_LIST}`, {
              // companyId,
              filter: [],
              status: "Active",
              isApprover: true,
            }),
          ]);
          if (departmentResponse.data.status === "SUCCESS") {
            const departmentOptions =
              departmentResponse.data.data.departments.map((department) => ({
                value: department.departmentId,
                label: department.departmentName,
              }));
            setDepartments(departmentOptions);
          }
          if (titleResponse.data.status === "SUCCESS") {
            const titleOptions = titleResponse.data.data.map((title) => ({
              value: title.title,
              label: title.title,
            }));
            setTitleOptions(titleOptions);
          }
          if (countryResponse.length > 0) {
            const countryOptions = countryResponse.map((country) => ({
              value: country._id,
              code: country.alpha2code,
              label: country.countryname,
              phoneCode: country.phonecode,
            }));
            setCountryOptions(countryOptions);
          }
          if (approverResponse.data.status === "SUCCESS") {
            const approverOptions = approverResponse.data?.data?.users?.map(
              (approver) => ({
                value: approver._id,
                label: `${approver.firstName || ""} ${approver.lastName || ""}`,
                data: approver,
              })
            );
            setApproverOptions(approverOptions);
          }

          setFormData((prev) => ({
            ...prev,
            companyName: loggedInDetails.companyDetails.companyName,
          }));
        } else {
          showToast("error", "No user details found.");
        }
      } catch (error) {
        console.error("Error fetching DEPARTMENT_LIST:", error);
      }
    };

    if (isEmpVisible && isInitialRender.current) {
      isInitialRender.current = false;
      fetchData();
    }
  }, [isEmpVisible, userDetails]);

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

  useEffect(() => {
    const handleBodyScroll = () => {
      document.body.style.overflow = popupRef ? "hidden" : "auto";
    };

    handleBodyScroll();
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [popupRef]);

  const handleChange = (e) => {
    const { name, value } = e.target
      ? e.target
      : { name: e.name, value: e.value };
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleClickOutside = (event) => {
    if (popupRef.current && !popupRef.current.contains(event.target)) {
      const isClearIndicatorClick =
        event.target.closest(".react-select__clear-indicator") ||
        event.target.tagName === "svg" ||
        event.target.tagName === "path" ||
        event.target.closest(".react-select__clear-indicator svg");

      if (!isClearIndicatorClick) {
        onClose(); // Close the popup if the click is outside and not on the clear indicator
      }
    }
  };

  const fetchDropdownData = async (type, searchKey = "") => {
    if (!userDetails) return [];
    const { companyId } = userDetails;

    const endpoints = {
      role: config.CORPORATE.ROLE_LIST,
      level: config.CORPORATE.LEVEL_LIST,
      band: config.CORPORATE.BAND_LIST,
      designation: config.CORPORATE.DESIGNATION_LIST,
    };

    const transformers = {
      role: transformRoles,
      level: transformLevels,
      band: transformBands,
      designation: transformDesignations,
    };

    try {
      const payload = {
        // companyId,
        searchKey,
        pageNo: 1,
        pageSize: 10,
      };
      const response = await axios.post(endpoints[type], payload);
      if (response.data?.status === "SUCCESS") {
        return transformers[type](response.data.data);
      } else {
        showToast("error", `Failed to fetch ${type}`);
        return [];
      }
    } catch (error) {
      console.error(`Error fetching ${type}:`, error);
      showToast("error", "Error fetching data. Try again later.");
      return [];
    }
  };

  const handleDropdownOpen = async (type) => {
    switch (type) {
      case "role":
        if (!menuOpenedForRole) {
          setRoleLoading(true);
          setMenuOpenedForRole(true);
          if (roles.length === 0) {
            const data = await fetchDropdownData("role");
            setRoles(data);
          }
          setRoleLoading(false);
        }
        break;
      case "level":
        if (!menuOpenedForLevel) {
          setLevelLoading(true);
          setMenuOpenedForLevel(true);
          if (levels.length === 0) {
            const data = await fetchDropdownData("level");
            setLevels(data);
          }
          setLevelLoading(false);
        }
        break;
      case "band":
        if (!menuOpenedForBand) {
          setBandLoading(true);
          setMenuOpenedForBand(true);
          if (bands.length === 0) {
            const data = await fetchDropdownData("band");
            setBands(data);
          }
          setBandLoading(false);
        }
        break;
      case "designation":
        if (!menuOpenedForDesignation) {
          setDesignationLoading(true);
          setMenuOpenedForDesignation(true);
          if (designations.length === 0) {
            const data = await fetchDropdownData("designation");
            setDesignations(data);
          }
          setDesignationLoading(false);
        }
        break;
      default:
        break;
    }
  };

  const loadDropdownOptions = (type) => async (inputValue) => {
    return await fetchDropdownData(type, inputValue);
  };

  const handleSubmit = async () => {
    if (validator.allValid()) {
      setLoading(true);
      try {
        const { companyId } = userDetails;

        // Convert approvers array to a comma-separated string
        const approverId = formData.approvers.join(",") || null;
        const payload = {
          ...formData,
          mobile: formData.contactNumber,
          departmentId: formData.department,
          countryId: formData.country?.value || null,
          cityId: formData.city?.value || null,
          // companyId,
          userRoleId: null,
          roleId: formData.role?.value || null,
          levelId: formData.level?.value || null,
          bandId: formData.band?.value || null,
          designationId: formData.designation?.value || null,
          approverId,
          firstName: formData.firstName.trim(), // Trim firstName
          lastName: formData.lastName.trim(),
        };
        delete payload.contactNumber;
        delete payload.department;
        delete payload.country;
        delete payload.city;
        delete payload.approvers;
        delete payload.role;
        delete payload.level;
        delete payload.band;
        delete payload.designation;
        const response = await axios.post(
          `${config.CORPORATE.EMPLOYEE_ADD}`,
          payload
        );
        if (response.data.status === "SUCCESS") {
          showToast("success", "Employee created successfully");
          setFormData(initialFormData); // Reset form to initial state
          validator.hideMessages(); // Hide validation messages
          onClose();
          const filterObject = generateFilterObjectForEmployee(
            selectedEmployeeFilterDepartments
          );

          const additionalFilters = {
            status: selectedStatus,
            roleId: selectedRole,
            levelId: selectedLevel,
            bandId: selectedBand,
            designationId: selectedDesignation,
          };

          await fetchList(
            activeTab,
            searchKey,
            [filterObject],
            additionalFilters,
            paginationData
          );
        }
      } catch (error) {
        console.error("Error submitting form:", error);
        showToast(
          "error",
          error.response.data.message ||
          "something went wrong, please try again later"
        );
      } finally {
        setLoading(false); // Reset loading state
      }
    } else {
      validator.showMessages();
      // Force a re-render to show validation messages
      setFormData({ ...formData });
    }
  };

  const handleSelectChange = (option, name) => {
    if (name === "approvers") {
      setFormData((prevState) => ({
        ...prevState,
        approvers: option ? option.map((opt) => opt.value) : [], // Save approver IDs as an array
      }));
    } else {
      setFormData((prevState) => ({
        ...prevState,
        [name]: option ? option.value : "",
      }));
    }
  };

  const handleDropdownChange = (name, value) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleClose = () => {
    setFormData(initialFormData); // Reset form when closing
    onClose();
  };

  const loadOptions = async (inputValue) => {
    try {
      if (inputValue) {
        const cities = await getCityByCountry(
          inputValue,
          formData.country?.code
        );
        const options = cities.map((city) => ({
          // value: city.citycode,
          value: city.id,
          label: city.cityname,
        }));
        return options;
      } else {
        return [];
      }
    } catch (error) {
      return [];
    }
  };

  // removing down arrow from select dropdown of title
  const customComponents = {
    IndicatorSeparator: () => null,
    DropdownIndicator: () => null,
  };

  if (!isEmpVisible) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-auto w-auto z-50 cursor-pointer">
      <div
        className="relative top-10 ml-2 mr-2 sm:mx-auto p-5 pt-2 px-3 border w-[95%] sm:w-2/4 shadow-lg rounded-md bg-white"
        ref={popupRef}
      >
        <div className="flex justify-end">
          <button
            type="button"
            className="text-[#ffffff] hover:text-gray-700 bg-[#878786]  pl-1 pr-1 sm:px-2 rounded-full"
            onClick={handleClose}
          >
            ×
          </button>
        </div>
        <div className="flex m-auto w-[90%] sm:w-4/5 gap-2 items-center">
          <Image src={addDep} alt="Add Department" width={150} />
          <div className="w-full flex flex-col sm:items-center justify-center">
            <span className="font-bold text-sm sm:text-base">Add Employee</span>
            <span className="font-light text-xs sm:text-sm">
              The employee{"'"}s email will receive the invitation link.
            </span>
          </div>
        </div>
        <div className="border-b mt-2"></div>

        <div className="flex flex-col gap-10 pb-4 pt-4 border-b">
          <div className="flex gap-3">
            <div className="w-1/5">
              <div className="relative w-full h-10">
                <Select
                  isClearable
                  id="title"
                  name="title"
                  options={titleOptions}
                  placeholder="Title"
                  value={titleOptions.find(
                    (option) => option.value === formData.title
                  )}
                  onChange={(option) => handleSelectChange(option, "title")}
                  className="text-sm z-20 bg-[#87878614]"
                  components={customComponents}
                />
                <label
                  for="title"
                  className="absolute text-sm text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-4 scale-75 top-2 z-30 origin-[0] bg-white dark:bg-gray-900 px-2 peer-focus:px-2 peer-focus:text-[#028fa3] peer-focus:dark:text-[#028fa3] peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto start-1"
                >
                  Title
                  <span className="text-red-500 absolute right-[-5px] m-1 mt-0">
                    *
                  </span>
                </label>
                <div className="text-red-500 text-xs mt-1">
                  {validator.message("title", formData.title, "required")}
                </div>
              </div>
            </div>
            <div className="w-1/3">
              <div className="relative w-full min-w-[50px] h-10">
                <input
                  name="firstName"
                  id="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  className="peer w-full h-full bg-transparent text-blue-gray-700 font-sans font-normal outline outline-0 focus:outline-0 disabled:bg-blue-gray-50 disabled:border-0 transition-all placeholder-shown:border placeholder-shown:border-blue-gray-200 placeholder-shown:border-t-blue-gray-200 border focus:border-2 border-t-transparent focus:border-t-transparent text-sm px-3 py-2.5 rounded-[7px] border-blue-gray-200 focus:border-gray-900"
                  placeholder=" "
                  maxLength={33}
                />
                <label
                  htmlFor="firstName"
                  className="absolute text-xs sm:text-sm text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-white dark:bg-gray-900 px-2 peer-focus:px-2 peer-focus:text-[#028fa3] peer-focus:dark:text-[#028fa3] peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto start-1"
                >
                  First Name
                  <span className="text-red-500 absolute  right-[-5px] m-1 mt-0">
                    *
                  </span>
                </label>
                <div className="text-red-500 text-xs mt-1">
                  {validator.message(
                    "firstName",
                    formData.firstName.trim(),
                    "required|alpha_space|min:1|max:33"
                  )}
                </div>
              </div>
            </div>
            <div className="w-1/3">
              <div className="relative w-full min-w-[50px] h-10">
                <input
                  name="lastName"
                  id="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  className="peer w-full h-full bg-transparent text-blue-gray-700 font-sans font-normal outline outline-0 focus:outline-0 disabled:bg-blue-gray-50 disabled:border-0 transition-all placeholder-shown:border placeholder-shown:border-blue-gray-200 placeholder-shown:border-t-blue-gray-200 border focus:border-2 border-t-transparent focus:border-t-transparent text-sm px-3 py-2.5 rounded-[7px] border-blue-gray-200 focus:border-gray-900"
                  placeholder=" "
                  maxLength={50}
                />
                <label
                  htmlFor="lastName"
                  className="absolute text-xs sm:text-sm text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-white dark:bg-gray-900 px-2 peer-focus:px-2 peer-focus:text-[#028fa3] peer-focus:dark:text-[#028fa3] peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto start-1"
                >
                  Last Name
                  <span className="text-red-500 absolute  right-[-5px] m-1 mt-0">
                    *
                  </span>
                </label>
                <div className="text-red-500 text-xs mt-1">
                  {validator.message(
                    "lastName",
                    formData.lastName.trim(),
                    "required|alpha_space|min:2|max:100"
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            <div className="w-1/3">
              <div className="relative w-full min-w-[50px] h-10">
                <input
                  id="employeeId"
                  name="employeeId"
                  value={formData.employeeId}
                  onChange={handleChange}
                  className="peer w-full h-full bg-transparent text-blue-gray-700 font-sans font-normal outline outline-0 focus:outline-0 disabled:bg-blue-gray-50 disabled:border-0 transition-all placeholder-shown:border placeholder-shown:border-blue-gray-200 placeholder-shown:border-t-blue-gray-200 border focus:border-2 border-t-transparent focus:border-t-transparent text-sm px-3 py-2.5 rounded-[7px] border-blue-gray-200 focus:border-gray-900"
                  placeholder=" "
                  maxLength={15}
                />
                <label
                  htmlFor="employeeId"
                  className="absolute text-xs sm:text-sm text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-white dark:bg-gray-900 px-2 peer-focus:px-2 peer-focus:text-[#028fa3] peer-focus:dark:text-[#028fa3] peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto start-1"
                >
                  Employee ID
                  <span className="text-red-500 absolute  right-[-5px] m-1 mt-0">
                    *
                  </span>
                </label>
                <div className="text-red-500 text-xs mt-1">
                  {validator.message(
                    "employeeId",
                    formData.employeeId,
                    "required|validEmployeeID"
                  )}
                </div>
              </div>
            </div>
            <div className="w-1/3">
              <div className="relative w-full min-w-[50px] h-10">
                <input
                  id="workEmail"
                  name="workEmail"
                  value={formData.workEmail}
                  onChange={handleChange}
                  className="peer w-full h-full bg-transparent text-blue-gray-700 font-sans font-normal outline outline-0 focus:outline-0 disabled:bg-blue-gray-50 disabled:border-0 transition-all placeholder-shown:border placeholder-shown:border-blue-gray-200 placeholder-shown:border-t-blue-gray-200 border focus:border-2 border-t-transparent focus:border-t-transparent text-sm px-3 py-2.5 rounded-[7px] border-blue-gray-200 focus:border-gray-900"
                  placeholder=" "
                  maxLength={50}
                />
                <label
                  htmlFor="workEmail"
                  className="absolute text-xs sm:text-sm text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-white dark:bg-gray-900 px-2 peer-focus:px-2 peer-focus:text-[#028fa3] peer-focus:dark:text-[#028fa3] peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto start-1"
                >
                  Work Email
                  <span className="text-red-500 absolute  right-[-5px] m-1 mt-0">
                    *
                  </span>
                </label>
                <div className="text-red-500 text-xs mt-1">
                  {validator.message(
                    "workEmail",
                    formData.workEmail,
                    "required|validEmail"
                  )}
                </div>
              </div>
            </div>
            <div className="w-1/3">
              <div className="relative w-full min-w-[50px] h-10">
                <input
                  name="contactNumber"
                  id="contactNumber"
                  value={formData.contactNumber}
                  onChange={handleChange}
                  className="peer w-full h-full bg-transparent text-blue-gray-700 font-sans font-normal outline outline-0 focus:outline-0 disabled:bg-blue-gray-50 disabled:border-0 transition-all placeholder-shown:border placeholder-shown:border-blue-gray-200 placeholder-shown:border-t-blue-gray-200 border focus:border-2 border-t-transparent focus:border-t-transparent text-sm px-3 py-2.5 rounded-[7px] border-blue-gray-200 focus:border-gray-900"
                  placeholder=" "
                  maxLength={10}
                />
                <label
                  htmlFor="contactNumber"
                  className="absolute text-xs sm:text-sm text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-white dark:bg-gray-900 px-2 peer-focus:px-2 peer-focus:text-[#028fa3] peer-focus:dark:text-[#028fa3] peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto start-1"
                >
                  Contact Number
                  <span className="text-red-500 absolute  right-[-5px] m-1 mt-0">
                    *
                  </span>
                </label>
                <div className="text-red-500 text-xs mt-1">
                  {validator.message(
                    "contactNumber",
                    formData.contactNumber,
                    "required|validMobile"
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="flex gap-3 mt-2">
            <div className="w-1/2">
              <div className="relative w-full min-w-[50px] h-10">
                <input
                  name="companyName"
                  id="companyName"
                  value={formData.companyName}
                  onChange={handleChange}
                  className="peer w-full h-full bg-transparent text-blue-gray-700 font-sans font-normal outline outline-0 focus:outline-0 disabled:bg-blue-gray-50 disabled:border-0 transition-all placeholder-shown:border placeholder-shown:border-blue-gray-200 placeholder-shown:border-t-blue-gray-200 border focus:border-2 border-t-transparent focus:border-t-transparent text-sm px-3 py-2.5 rounded-[7px] border-blue-gray-200 focus:border-gray-900"
                  placeholder=" "
                  readOnly
                />
                <label
                  htmlFor="companyName"
                  className="absolute text-xs sm:text-sm text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-white dark:bg-gray-900 px-2 peer-focus:px-2 peer-focus:text-[#028fa3] peer-focus:dark:text-[#028fa3] peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto start-1"
                >
                  Company Name
                  <span className="text-red-500 absolute  right-[-5px] m-1 mt-0">
                    *
                  </span>
                </label>
                <div className="text-red-500 text-xs mt-1">
                  {validator.message(
                    "companyName",
                    formData.companyName,
                    "required|min:3|max:50"
                  )}
                </div>
              </div>
            </div>

            <div className="w-1/2">
              <div className="relative w-full h-10 focus-within:z-50">
                <Select
                  isClearable
                  id="department"
                  name="department"
                  options={departments}
                  placeholder="Select Department"
                  value={departments.find(
                    (option) => option.value === formData.title
                  )}
                  onChange={(option) =>
                    handleChange({
                      name: "department",
                      value: option ? option.value : "",
                    })
                  }
                  className="text-xs sm:text-sm text-gray-500 z-40 focus:z-50"
                  components={customComponents}
                />

                <label
                  for="department"
                  className="absolute text-xs sm:text-sm text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-4 scale-75 top-2 z-50 origin-[0] bg-white dark:bg-gray-900 px-2 peer-focus:px-2 peer-focus:text-[#028fa3] peer-focus:dark:text-[#028fa3] peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto start-1"
                >
                  Department
                </label>
                <div className="text-red-500 text-xs mt-1"></div>
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            <div className="w-1/2">
              <div className="relative w-full h-10 z-30 focus-within:z-50">
                <AsyncSelect
                  isClearable
                  isSearchable
                  cacheOptions
                  defaultOptions={menuOpenedForRole ? roles : []}
                  loadOptions={loadDropdownOptions("role")}
                  onMenuOpen={() => handleDropdownOpen("role")}
                  onChange={(value) => handleDropdownChange("role", value)}
                  value={formData.role}
                  id="role"
                  name="role"
                  placeholder="Select Role"
                  className="text-xs sm:text-sm text-gray-500 z-30 focus:z-50"
                  components={customComponents}
                  isLoading={roleLoading}
                />

                <label
                  for="role"
                  className="absolute text-xs sm:text-sm text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-4 scale-75 top-2 z-50 origin-[0] bg-white dark:bg-gray-900 px-2 peer-focus:px-2 peer-focus:text-[#028fa3] peer-focus:dark:text-[#028fa3] peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto start-1"
                >
                  Role
                  {/* <span className="text-red-500 absolute right-[-5px] m-1 mt-0">
                    *
                  </span> */}
                </label>
                {/* <div className="text-red-500 text-xs mt-1">
                  {validator.message("role", formData.role, "required")}
                </div> */}
              </div>
            </div>
            <div className="w-1/2">
              <div className="relative w-full h-10 z-30 focus-within:z-50">
                <AsyncSelect
                  isClearable
                  isSearchable
                  cacheOptions
                  defaultOptions={menuOpenedForLevel ? levels : []}
                  loadOptions={loadDropdownOptions("level")}
                  onMenuOpen={() => handleDropdownOpen("level")}
                  onChange={(value) => handleDropdownChange("level", value)}
                  value={formData.level}
                  id="level"
                  name="level"
                  placeholder="Select level"
                  className="text-xs sm:text-sm text-gray-500 z-30 focus:z-50"
                  components={customComponents}
                  isLoading={levelLoading}
                />

                <label
                  for="level"
                  className="absolute text-xs sm:text-sm text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-4 scale-75 top-2 z-50 origin-[0] bg-white dark:bg-gray-900 px-2 peer-focus:px-2 peer-focus:text-[#028fa3] peer-focus:dark:text-[#028fa3] peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto start-1"
                >
                  Level
                  {/* <span className="text-red-500 absolute right-[-5px] m-1 mt-0">
                    *
                  </span> */}
                </label>
                {/* <div className="text-red-500 text-xs mt-1">
                  {validator.message("level", formData.level, "required")}
                </div> */}
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            <div className="w-1/2">
              <div className="relative w-full h-10 z-30 focus-within:z-50">
                <AsyncSelect
                  isClearable
                  isSearchable
                  cacheOptions
                  defaultOptions={menuOpenedForBand ? bands : []}
                  loadOptions={loadDropdownOptions("band")}
                  onMenuOpen={() => handleDropdownOpen("band")}
                  onChange={(value) => handleDropdownChange("band", value)}
                  value={formData.band}
                  id="band"
                  name="band"
                  placeholder="Select Band"
                  className="text-xs sm:text-sm text-gray-500 z-30 focus:z-50"
                  components={customComponents}
                  isLoading={bandLoading}
                />

                <label
                  for="band"
                  className="absolute text-xs sm:text-sm text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-4 scale-75 top-2 z-50 origin-[0] bg-white dark:bg-gray-900 px-2 peer-focus:px-2 peer-focus:text-[#028fa3] peer-focus:dark:text-[#028fa3] peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto start-1"
                >
                  Band
                  {/* <span className="text-red-500 absolute right-[-5px] m-1 mt-0">
                    *
                  </span> */}
                </label>
                {/* <div className="text-red-500 text-xs mt-1">
                  {validator.message("band", formData.band, "required")}
                </div> */}
              </div>
            </div>
            <div className="w-1/2">
              <div className="relative w-full h-10 z-30 focus-within:z-50">
                <AsyncSelect
                  isClearable
                  isSearchable
                  cacheOptions
                  defaultOptions={menuOpenedForDesignation ? designations : []}
                  loadOptions={loadDropdownOptions("designation")}
                  onMenuOpen={() => handleDropdownOpen("designation")}
                  onChange={(value) =>
                    handleDropdownChange("designation", value)
                  }
                  value={formData.designation}
                  id="designation"
                  name="designation"
                  placeholder="Select Designation"
                  className="text-xs sm:text-sm text-gray-500 z-30 focus:z-50"
                  components={customComponents}
                  isLoading={designationLoading}
                />

                <label
                  for="designation"
                  className="absolute text-xs sm:text-sm text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-4 scale-75 top-2 z-50 origin-[0] bg-white dark:bg-gray-900 px-2 peer-focus:px-2 peer-focus:text-[#028fa3] peer-focus:dark:text-[#028fa3] peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto start-1"
                >
                  Designation
                  {/* <span className="text-red-500 absolute right-[-5px] m-1 mt-0">
                    *
                  </span> */}
                </label>
                {/* <div className="text-red-500 text-xs mt-1">
                  {validator.message(
                    "designation",
                    formData.designation,
                    "required"
                  )}
                </div> */}
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            <div className="w-1/2">
              <div className="relative w-full min-w-[50px] h-10">
                <input
                  id="dateOfBirth"
                  name="dateOfBirth"
                  type="date"
                  value={formData.dateOfBirth}
                  onChange={handleChange}
                  className="peer w-full h-full bg-transparent text-blue-gray-700 font-sans font-normal outline outline-0 focus:outline-0 disabled:bg-blue-gray-50 disabled:border-0 transition-all placeholder-shown:border placeholder-shown:border-blue-gray-200 placeholder-shown:border-t-blue-gray-200 border focus:border-2 border-t-transparent focus:border-t-transparent text-sm px-3 py-2.5 rounded-[7px] border-blue-gray-200 focus:border-gray-900"
                  placeholder=" "
                  max={today}
                />
                <label
                  htmlFor="dateOfBirth"
                  className="absolute text-xs sm:text-sm text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-white dark:bg-gray-900 px-2 peer-focus:px-2 peer-focus:text-[#028fa3] peer-focus:dark:text-[#028fa3] peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto start-1"
                >
                  Date of Birth
                  <span className="text-red-500 absolute  right-[-5px] m-1 mt-0">
                    *
                  </span>
                </label>
                <div className="text-red-500 text-xs mt-1">
                  {validator.message(
                    "department",
                    formData.dateOfBirth,
                    "required|dobValidation"
                  )}
                </div>
              </div>
            </div>
            <div className="w-1/2">
              <div className="relative w-full min-w-[50px] h-10">
                <input
                  id="address"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  className="peer w-full h-full bg-transparent text-blue-gray-700 font-sans font-normal outline outline-0 focus:outline-0 disabled:bg-blue-gray-50 disabled:border-0 transition-all placeholder-shown:border placeholder-shown:border-blue-gray-200 placeholder-shown:border-t-blue-gray-200 border focus:border-2 border-t-transparent focus:border-t-transparent text-sm px-3 py-2.5 rounded-[7px] border-blue-gray-200 focus:border-gray-900"
                  placeholder=" "
                  maxLength={100}
                />
                <label
                  htmlFor="address"
                  className="absolute text-xs sm:text-sm text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-white dark:bg-gray-900 px-2 peer-focus:px-2 peer-focus:text-[#028fa3] peer-focus:dark:text-[#028fa3] peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto start-1"
                >
                  Address
                  <span className="text-red-500 absolute  right-[-5px] m-1 mt-0">
                    *
                  </span>
                </label>
                <div className="text-red-500 text-xs mt-1">
                  {validator.message("address", formData.address, "required")}
                </div>
              </div>
            </div>
          </div>

          <div className="flex space-x-4 mt-2">
            <div className="relative w-full min-w-[50px] h-10">
              <input
                id="passport-number"
                type="text"
                name="passportNo"
                value={formData.passportNo}
                onChange={handleChange}
                maxLength={15}
                placeholder="Passport Number"
                className="peer w-full h-full bg-transparent text-blue-gray-700 font-sans font-normal outline outline-0 focus:outline-0 disabled:bg-blue-gray-50 disabled:border-0 transition-all placeholder-shown:border placeholder-shown:border-blue-gray-200 placeholder-shown:border-t-blue-gray-200 border focus:border-2 border-t-transparent focus:border-t-transparent text-sm px-3 py-2.5 rounded-[7px] border-blue-gray-200 focus:border-gray-900"
              />
              <label
                htmlFor="passport-number"
                className="absolute text-xs sm:text-sm text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-white dark:bg-gray-900 px-2 peer-focus:px-2 peer-focus:text-[#028fa3] peer-focus:dark:text-[#028fa3] peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto start-1"
              >
                Passport Number
              </label>
              <div className="text-red-500 text-xs mt-1">
                {validator.message(
                  "passportNo",
                  formData.passportNo,
                  "validPassportNumber"
                )}
              </div>
            </div>
            <div className="relative w-full min-w-[50px] h-10">
              <input
                id="passport-issue-date"
                type="date"
                name="passportIssueDate"
                value={formData.passportIssueDate}
                onChange={handleChange}
                max="9999-12-31"
                className="peer w-full h-full bg-transparent text-blue-gray-700 font-sans font-normal outline outline-0 focus:outline-0 disabled:bg-blue-gray-50 disabled:border-0 transition-all placeholder-shown:border placeholder-shown:border-blue-gray-200 placeholder-shown:border-t-blue-gray-200 border focus:border-2 border-t-transparent focus:border-t-transparent text-sm px-3 py-2.5 rounded-[7px] border-blue-gray-200 focus:border-gray-900"
              />
              <label
                htmlFor="passport-issue-date"
                className="absolute text-xs sm:text-sm text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-white dark:bg-gray-900 px-2 peer-focus:px-2 peer-focus:text-[#028fa3] peer-focus:dark:text-[#028fa3] peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto start-1"
              >
                Passport Issue Date
              </label>
              <div className="text-red-500 text-xs mt-1">
                {validator.message(
                  "passportIssueDate",
                  formData.passportIssueDate,
                  "validIssueDate"
                )}
              </div>
            </div>
            <div className="relative w-full min-w-[50px] h-10">
              <input
                id="passport-expiry-date"
                type="date"
                name="passportExpiry"
                value={formData.passportExpiry}
                onChange={handleChange}
                max="9999-12-31"
                className="peer w-full h-full bg-transparent text-blue-gray-700 font-sans font-normal outline outline-0 focus:outline-0 disabled:bg-blue-gray-50 disabled:border-0 transition-all placeholder-shown:border placeholder-shown:border-blue-gray-200 placeholder-shown:border-t-blue-gray-200 border focus:border-2 border-t-transparent focus:border-t-transparent text-sm px-3 py-2.5 rounded-[7px] border-blue-gray-200 focus:border-gray-900"
              />
              <label
                htmlFor="passport-expiry-date"
                className="absolute text-xs sm:text-sm text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-white dark:bg-gray-900 px-2 peer-focus:px-2 peer-focus:text-[#028fa3] peer-focus:dark:text-[#028fa3] peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto start-1"
              >
                Passport Expiry Date
              </label>
              <div className="text-red-500 text-xs mt-1">
                {validator.message(
                  "passportExpiry",
                  formData.passportExpiry,
                  "validExpiryDate"
                )}
              </div>
            </div>
          </div>
          <div className="flex gap-2 mt-2 justify-between">
            <div className="w-1/2">
              <div className="relative w-full z-40 h-10">
                <Select
                  isClearable
                  id="country"
                  name="country"
                  options={countryOptions}
                  placeholder="Search or select country"
                  value={countryOptions.find(
                    (option) => option.value === formData.country?.value
                  )}
                  onChange={(option) =>
                    handleChange({
                      name: "country",
                      value: option ? option : "",
                    })
                  }
                  className="text-xs sm:text-sm z-20"
                  components={customComponents}
                  styles={{
                    placeholder: (provided) => ({
                      ...provided,
                      fontWeight: 450, // Adjust the font weight as needed (e.g., 300, 400, etc.)
                      color: "#878786", // Optional: Change placeholder color if needed
                    }),
                  }}
                />
                <label
                  for="country"
                  className="absolute text-xs sm:text-sm text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-4 scale-75 top-2 z-30 origin-[0] bg-white dark:bg-gray-900 px-2 peer-focus:px-2 peer-focus:text-[#028fa3] peer-focus:dark:text-[#028fa3] peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto start-1"
                >
                  Country
                </label>
                <div className="text-red-500 text-xxs mt-1"></div>
              </div>
            </div>

            <div className="w-1/2">
              <div className="relative w-full h-10">
                <AsyncSelect
                  isClearable
                  cacheOptions
                  defaultOptions
                  placeholder="Search or select city"
                  className="text-xs sm:text-sm text-gray-900 z-20"
                  components={customComponents}
                  isSearchable
                  loadOptions={(inputValue) => loadOptions(inputValue)}
                  value={formData.city}
                  onChange={(option) =>
                    handleChange({
                      name: "city",
                      value: option,
                    })
                  }
                  styles={{
                    placeholder: (provided) => ({
                      ...provided,
                      fontWeight: 450, // Adjust the font weight as needed (e.g., 300, 400, etc.)
                      color: "#878786", // Optional: Change placeholder color if needed
                    }),
                  }}
                />
                <label
                  for="city"
                  className="absolute text-xs sm:text-sm text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-4 scale-75 top-2 z-30 origin-[0] bg-white dark:bg-gray-900 px-2 peer-focus:px-2 peer-focus:text-[#028fa3] peer-focus:dark:text-[#028fa3] peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto start-1"
                >
                  City
                </label>
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            <div className="w-1/2">
              <div className="relative w-full h-10">
                <Select
                  isMulti
                  isClearable
                  id="approvers"
                  name="approvers"
                  cacheOptions
                  defaultOptions
                  placeholder="Search by Employee Name or id"
                  className="text-xs sm:text-sm text-gray-900 z-20"
                  components={customComponents}
                  isSearchable
                  options={approverOptions}
                  value={approverOptions.filter((opt) =>
                    formData?.approvers?.includes(opt.value)
                  )}
                  onChange={(option) => handleSelectChange(option, "approvers")}
                  filterOption={(option, inputValue) => {
                    const { label, data } = option;
                    return (
                      label.toLowerCase().includes(inputValue.toLowerCase()) ||
                      data?.data?.employeeId
                        ?.toLowerCase()
                        ?.includes(inputValue.toLowerCase())
                    );
                  }}
                  styles={{
                    placeholder: (provided) => ({
                      ...provided,
                      fontWeight: 450, // Adjust the font weight as needed (e.g., 300, 400, etc.)
                      color: "#878786", // Optional: Change placeholder color if needed
                    }),
                  }}
                />
                <label
                  for="approvers"
                  className="absolute text-sm text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-4 scale-75 top-2 z-30 origin-[0] bg-white dark:bg-gray-900 px-2 peer-focus:px-2 peer-focus:text-[#028fa3] peer-focus:dark:text-[#028fa3] peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto start-1"
                >
                  Approver
                </label>
              </div>
            </div>

            <div className="bg-white p-2 rounded-lg mt-0">
              <div className="mt-0">
                <label className="inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={formData.isApprover}
                    onChange={(event) =>
                      setFormData((prev) => ({
                        ...prev,
                        isApprover: event.target.checked,
                      }))
                    }
                  />
                  <div className="relative w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-[#E5E1E2] peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-400"></div>
                  <span className="ml-3 text-[#171A19CC] font-normal text-sm sm:text-base">
                    Is Approver
                  </span>
                </label>
              </div>
            </div>
          </div>
        </div>

        <div className="text-center">
          <div className="mt-2 sm:px-7 py-3 flex justify-center gap-4">
            <button
              type="button"
              className="inline-flex justify-center w-fit rounded-md border border-gray-300 px-4 py-2 sm:text-base font-medium text-gray-500 shadow-sm text-xs"
              onClick={handleClose}
            >
              Cancel
            </button>
            <button
              type="button"
              className="inline-flex justify-center w-48 rounded-md border border-transparent px-4 py-2 bg-[#028fa3] sm:text-base font-medium text-white shadow-sm text-xs"
              onClick={handleSubmit}
              disabled={loading}
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <FontAwesomeIcon icon={faSpinner} spin />
                </div>
              ) : (
                "Add Employee"
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmployeeAdd;
