import { useState, useEffect, useRef } from "react";
import { useSelector } from "react-redux";
import {
  faUser,
  faPencil,
  faChevronDown,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import style from "./Edit.module.css";

import Select, { components } from "react-select";
import AsyncSelect from "react-select/async";
import axios from "@/utils/axios/axios";
import config from "@/config";
import { getCityByCountry } from "@/utils/common";
import showToast from "@/utils/toast";
import { createPortal } from "react-dom";
import {
  transformRoles,
  transformLevels,
  transformBands,
  transformDesignations,
} from "@/utils/common";

const EmployeeEdit = ({
  selectedRow,
  departmentData,
  isOpen,
  setIsOpen,
  validator,
  isLoading,
  selectedEmployeeFilterDepartments,
  generateFilterObjectForEmployee,
  fetchDataPerSection,
  employeeSearchQuery,
  selectedStatus,
  selectedRole,
  selectedLevel,
  selectedBand,
  selectedDesignation,
  paginationData,
  activeTab: parentActiveTab,
}) => {
  const userDetails = useSelector((state) => state?.user?.userInfo);

  const isInitialRender = useRef(true);

  const initialFormData = {
    title: null,
    firstName: null,
    lastName: null,
    employeeId: null,
    workEmail: null,
    mobileNumber: null,
    passportNo: null,
    passportIssueDate: null,
    passportExpiry: null,
    city: null,
    country: null,
    dateOfBirth: null,
    address: null,
    department: null,
    role: null,
    level: null,
    band: null,
    designation: null,
    passportIssueCountryCode: null,
    approvers: [],
    isApprover: false,
    status: null,
  };

  const [formData, setFormData] = useState(initialFormData);
  const [activeTab, setActiveTab] = useState(1);
  const [titleOptions, setTitleOptions] = useState([]);
  const [countryOptions, setCountryOptions] = useState([]);
  const [departmentOptions, setDepartmentOptions] = useState([]);
  const [approverOptions, setApproverOptions] = useState([]);

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

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (userDetails) {
          const { companyId } = userDetails;
          const [titleResponse, countryResponse, approverResponse] =
            await Promise.all([
              axios.get(`${config.CORPORATE.USER_TITLES}`),
              axios.get(`${config.CORPORATE.COUNTRY}`),
              await axios.post(`${config.CORPORATE.EMPLOYEE_LIST}`, {
                // companyId,
                filter: [],
                status: "Active",
                isApprover: true,
              }),
            ]);
          if (titleResponse.data.status === "SUCCESS") {
            const titleOptions = titleResponse.data.data.map((title) => ({
              value: title.title,
              label: title.title,
            }));
            setTitleOptions(titleOptions);
          }
          if (countryResponse.data.status === "SUCCESS") {
            const countryOptions = countryResponse.data.data.map((country) => ({
              value: country._id,
              code: country.alpha2code,
              label: country.countryname,
              phoneCode: country.phonecode,
            }));
            setCountryOptions(countryOptions);
          }
          if (departmentData) {
            const { count, departments } = departmentData;

            const departmentOptions = departments.map((department) => ({
              value: department.departmentId,
              label: department.departmentName,
            }));
            setDepartmentOptions(departmentOptions);
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
        } else {
          showToast("error", "No user details found.");
        }
      } catch (error) {
        console.log("Error fetching data:", error);
      }
    };

    if (isInitialRender.current) {
      isInitialRender.current = false;
      fetchData();
    }
  }, [userDetails, departmentData]);

  useEffect(() => {
    if (selectedRow) {
      setFormData((prev) => ({
        ...prev,
        id: selectedRow._id || null,
        selectedRowIndex: selectedRow.SelectedRowIndex || 0,
        userTypeId: selectedRow.userTypeId || 0,
        title: selectedRow.title || null,
        firstName: selectedRow.firstName || null,
        lastName: selectedRow.lastName || null,
        employeeId: selectedRow.employeeId || null,
        workEmail: selectedRow.workEmail || null,
        mobileNumber: selectedRow.mobile || null,
        address: selectedRow.address || null,
        dateOfBirth: selectedRow.dateOfBirth || null,
        passportNo: selectedRow.passportNumber || null,
        isApprover: selectedRow.isApprover || false,
        status: selectedRow.status || false,
        passportIssueDate: selectedRow.passportIssueDate
          ? selectedRow.passportIssueDate.split("T")[0]
          : null,
        passportExpiry: selectedRow.passportExpiry
          ? selectedRow.passportExpiry.split("T")[0]
          : null,
        city: { value: selectedRow.cityId, label: selectedRow.city } || null,
        department: selectedRow.departmentId || null,
        country:
          {
            value: selectedRow.countryId,
            label: selectedRow.country,
            code: selectedRow.alpha2code,
          } || null,
        approvers: selectedRow.approverUserDetails
          ? selectedRow.approverUserDetails.map((approver) =>
              approver._id.trim()
            )
          : [],
        role:
          selectedRow?.roleDetails?.userRoleId &&
          selectedRow?.roleDetails?.userRoleName
            ? {
                value: selectedRow?.roleDetails?.userRoleId,
                label: selectedRow?.roleDetails?.userRoleName,
              }
            : null,
        level:
          selectedRow?.levelDetails?.levelId && selectedRow?.levelDetails?.level
            ? {
                value: selectedRow?.levelDetails?.levelId,
                label: selectedRow?.levelDetails?.level,
              }
            : null,
        band:
          selectedRow?.bandDetails?.bandId && selectedRow?.bandDetails?.band
            ? {
                value: selectedRow?.bandDetails?.bandId,
                label: selectedRow?.bandDetails?.band,
              }
            : null,
        designation:
          selectedRow?.designationDetails?.designationId &&
          selectedRow?.designationDetails?.designation
            ? {
                value: selectedRow?.designationDetails?.designationId,
                label: selectedRow?.designationDetails?.designation,
              }
            : null,
      }));
    }
  }, [selectedRow]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }

    // Clean up on component unmount
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target
      ? e.target
      : { name: e.name, value: e.value };
    setFormData((prev) => ({ ...prev, [name]: value }));
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

  const handleEditCompany = async () => {
    if (validator.allValid()) {
      try {
        const formattedPassportIssueDate = formData.passportIssueDate
          ? `${formData.passportIssueDate}T00:00:00`
          : null;
        const approverId = formData.approvers.join(",") || null;
        const payload = {
          ...formData,
          id: formData.id,
          approverId: approverId,
          passportIssueDate: formData.passportIssueDate,
          mobile: formData.mobileNumber,
          departmentId: formData.department,
          countryId: formData.country?.value || null,
          cityId: formData.city?.value || null,
          roleId: formData.role?.value || null,
          levelId: formData.level?.value || null,
          bandId: formData.band?.value || null,
          designationId: formData.designation?.value || null,
          status: formData.status,
          firstName: formData.firstName.trim(), // Trim firstName
          lastName: formData.lastName.trim(),
        };
        const selectedRowData = payload;
        delete payload.mobileNumber;
        delete payload.nationality;
        delete payload.department;
        delete payload.country;
        delete payload.city;
        delete payload.selectedRowIndex;
        delete payload.userTypeId;
        delete selectedRowData.selectedRowIndex;
        delete payload.approvers;
        delete payload.role;
        delete payload.level;
        delete payload.band;
        delete payload.designation;

        const response = await axios.post(
          `${config.CORPORATE.EMPLOYEE_EDIT}`,
          payload
        );
        if (response.data.status === "SUCCESS") {
          showToast("success", "Employee updated successfully");

          setFormData(initialFormData); // Reset form to initial state
          validator.hideMessages(); // Hide validation messages
          setIsOpen(false);
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
          await fetchDataPerSection(
            parentActiveTab,
            employeeSearchQuery,
            [filterObject],
            additionalFilters,
            paginationData
          );
        }
      } catch (error) {
        console.error("Error submitting form:", error);
        showToast(
          "error",
          error?.response?.data?.message ||
            "something went wrong, please try again later"
        );
      }
    } else {
      validator.showMessages();
      // Force a re-render to show validation messages
      setFormData({ ...formData });
    }
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

  const fetchDropdownData = async (type, searchKey = "") => {
    try {
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
    } catch (error) {
      console.error("error occured:", error);
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

  const handleDropdownChange = (name, value) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const DropdownIndicator = (props) => {
    return (
      <components.DropdownIndicator {...props}>
        <FontAwesomeIcon icon={faChevronDown} className="text-gray-500" />
      </components.DropdownIndicator>
    );
  };

  // removing down arrow from select dropdown of title
  const customComponents = {
    IndicatorSeparator: () => null,
    DropdownIndicator: () => null,
    DropdownIndicator,
  };

  const today = new Date().toISOString().split("T")[0];

  return createPortal(
    <>
      <div
        className={`${style.overlay} ${isOpen ? style.open : ""}`}
        onClick={() => setIsOpen(false)}
      ></div>
      <div className={`${style.sideSheet} ${isOpen ? style.open : ""}`}>
        <div className="flex justify-end">
          <button
            className={style.closeButton}
            onClick={() => setIsOpen(false)}
          >
            X
          </button>
        </div>
        {selectedRow && (
          <div className={style.sideSheetContent}>
            <div className="flex items-center">
              {/* image edit */}
              <div className="relative">
                <div className="w-20 h-20 rounded-full bg-[#87878614] text-[#878786] flex items-center justify-center">
                  <FontAwesomeIcon
                    icon={faUser}
                    className="text-[#878786] text-lg cursor-pointer"
                  />
                </div>
                <div className="absolute bottom-[-1px] right-[-8px]  transform -translate-x-1/2 w-6 h-6 rounded-full bg-[#028FA3] flex items-center justify-center cursor-pointer">
                  <FontAwesomeIcon
                    icon={faPencil}
                    className="text-[#FFFFFF] text-xs cursor-pointer"
                  />
                </div>
              </div>
              {/* name details */}
              <div className="flex flex-col">
                <div className="text-xl text-[#171A19] font-medium ml-3">
                  {selectedRow.firstName} {selectedRow.lastName}
                </div>
                <div className="font-light">{selectedRow.roleName}</div>
              </div>
            </div>
            {/* toggles for info edit */}
            <div className="mt-4 flex items-center justify-start space-x-4 border-b border-[#878786] dark:border-gray-700">
              <button
                className={`${
                  activeTab === 1
                    ? "border-b-2 border-[#028fa3] text-[#028fa3] font-extrabold"
                    : "border-transparent text-gray-500 hover:border-[#028fa3] hover:text-[#028fa3]"
                } py-2 px-4 font-medium text-xs`}
                onClick={() => setActiveTab(1)}
              >
                Edit Details
              </button>
            </div>

            {/* tab content */}

            {activeTab === 1 && (
              <div className="mt-4">
                <div className="text-xl text-[#171A19] font-medium">
                  General Details
                </div>
                <div className="flex space-x-4 mt-2">
                  <div className="w-1/5">
                    <label htmlFor="title" className="block text-xs">
                      Title
                      <span className="text-red-500 m-1 mt-0">*</span>
                    </label>
                    <Select
                      isClearable
                      id="title"
                      name="title"
                      options={titleOptions}
                      placeholder="Mr."
                      value={titleOptions.find(
                        (option) => option.value === formData.title
                      )}
                      onChange={(option) => handleSelectChange(option, "title")}
                      className="text-sm z-20 "
                      components={{
                        ...customComponents,
                        ClearIndicator: () => null, // Removes the cross icon
                      }}
                      styles={{
                        control: (provided) => ({
                          ...provided,
                          backgroundColor: "#87878614",
                          border: "none",
                          boxShadow: "none",
                        }),
                      }}
                    />
                    <div className="text-red-500 text-xs mt-1">
                      {validator.message("title", formData.title, "required")}
                    </div>
                  </div>
                  <div className="w-2/5">
                    <label htmlFor="first-name" className="block text-xs">
                      First Name
                      <span className="text-red-500 m-1 mt-0">*</span>
                    </label>
                    <input
                      id="first-name"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleChange}
                      type="text"
                      placeholder="First Name"
                      className="w-full p-2 border-none bg-[#87878614] rounded"
                      maxLength={33}
                    />
                    <div className="text-red-500 text-xs mt-1">
                      {validator.message(
                        "firstName",
                        formData.firstName,
                        "required|alpha_space|min:1|max:33"
                      )}
                    </div>
                  </div>
                  <div className="w-2/5">
                    <label htmlFor="last-name" className="block text-xs">
                      Last Name
                      <span className="text-red-500 m-1 mt-0">*</span>
                    </label>
                    <input
                      id="last-name"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleChange}
                      type="text"
                      placeholder="Last Name"
                      className="w-full p-2 border-none bg-[#87878614] rounded"
                      maxLength={50}
                    />
                    <div className="text-red-500 text-xs mt-1">
                      {validator.message(
                        "lastName",
                        formData.lastName,
                        "required|alpha_space|min:2|max:100"
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex space-x-4 mt-2">
                  <div className="w-1/2">
                    <label htmlFor="employeeId" className="block text-xs">
                      Employee ID
                      <span className="text-red-500 m-1 mt-0">*</span>
                    </label>
                    <input
                      id="employeeId"
                      name="employeeId"
                      value={formData.employeeId}
                      onChange={handleChange}
                      type="text"
                      placeholder="Employee ID"
                      className="w-full p-2 border-none bg-[#87878614] rounded"
                    />
                    <div className="text-red-500 text-xs mt-1">
                      {validator.message(
                        "employeeId",
                        formData.employeeId,
                        "required"
                      )}
                    </div>
                  </div>
                  <div className="w-1/2">
                    <label htmlFor="address" className="block text-xs">
                      Address
                      <span className="text-red-500 m-1 mt-0">*</span>
                    </label>
                    <div className="flex space-x-2">
                      <input
                        id="address"
                        type="text"
                        name="address"
                        value={formData.address}
                        onChange={handleChange}
                        placeholder="Address"
                        className="w-full p-2 border-none bg-[#87878614] rounded"
                      />
                    </div>

                    <div className="text-red-500 text-xs mt-1">
                      {" "}
                      {validator.message(
                        "address",
                        formData.address,
                        "required"
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex space-x-4 mt-2">
                  <div className="w-1/2">
                    <label htmlFor="work-email" className="block text-xs">
                      Work Email
                      <span className="text-red-500 m-1 mt-0">*</span>
                    </label>
                    <input
                      id="work-email"
                      name="workEmail"
                      value={formData.workEmail}
                      onChange={handleChange}
                      type="email"
                      placeholder="Work Email"
                      className="w-full p-2 border-none bg-[#87878614] rounded"
                    />
                    <div className="text-red-500 text-xs mt-1">
                      {validator.message(
                        "workEmail",
                        formData.workEmail,
                        "required|validEmail"
                      )}
                    </div>
                  </div>
                  <div className="w-1/2">
                    <label htmlFor="mobile-number" className="block text-xs">
                      Mobile Number
                      <span className="text-red-500 m-1 mt-0">*</span>
                    </label>
                    <div className="flex space-x-2">
                      <input
                        id="country-code"
                        type="text"
                        placeholder="+91"
                        defaultValue={"+91"}
                        className="w-1/4 p-2 border-none bg-[#87878614] rounded"
                        readOnly
                      />
                      <input
                        id="mobile-number"
                        type="text"
                        name="mobileNumber"
                        value={formData.mobileNumber}
                        onChange={handleChange}
                        placeholder="Mobile Number"
                        className="w-3/4 p-2 border-none bg-[#87878614] rounded"
                      />
                    </div>

                    <div className="text-red-500 text-xs mt-1">
                      {validator.message(
                        "mobileNumber",
                        formData.mobileNumber,
                        "required|validMobile"
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex space-x-4 mt-2">
                  <div className="w-1/2 z-30 focus-within:z-50">
                    <label htmlFor="department" className="block text-xs">
                      Department
                    </label>
                    <Select
                      isClearable
                      id="department"
                      name="department"
                      options={departmentOptions}
                      placeholder="Select Department"
                      value={departmentOptions.find(
                        (option) => option.value === formData.department
                      )}
                      onChange={(option) =>
                        handleChange({
                          name: "department",
                          value: option ? option.value : "",
                        })
                      }
                      className="text-sm text-gray-500 z-30 focus:z-50"
                      components={{
                        ...customComponents,
                        ClearIndicator: () => null, // Removes the cross icon
                      }}
                      isLoading={isLoading} // Show loading indicator while fetching data
                    />
                    <div className="text-red-500 text-xs mt-1"></div>
                  </div>
                  <div className="w-1/2">
                    <label htmlFor="dateOfBirth" className="block text-xs">
                      Date of birth
                      <span className="text-red-500 m-1 mt-0">*</span>
                    </label>
                    <input
                      id="dateOfBirth"
                      type="date"
                      name="dateOfBirth"
                      value={formData.dateOfBirth}
                      onChange={handleChange}
                      className="w-full p-2 border-none bg-[#87878614] rounded"
                      max={today}
                    />
                    <div className="text-red-500 text-xs mt-1">
                      {validator.message(
                        "department",
                        formData.dateOfBirth,
                        "required|dobValidation"
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex space-x-4 mt-2">
                  <div className="w-1/2 z-30 focus-within:z-50">
                    <label htmlFor="role" className="block text-xs">
                      Role
                    </label>
                    {formData.userTypeId === 1 ? (
                      <div className="text-sm text-gray-500 p-2 border rounded">
                        {formData.role?.label || "No role selected"}
                      </div>
                    ) : (
                      <AsyncSelect
                        isClearable
                        isSearchable
                        cacheOptions
                        defaultOptions={menuOpenedForRole ? roles : []}
                        loadOptions={loadDropdownOptions("role")}
                        onMenuOpen={() => handleDropdownOpen("role")}
                        onChange={(value) =>
                          handleDropdownChange("role", value)
                        }
                        value={formData.role}
                        id="role"
                        name="role"
                        placeholder="Select Role"
                        className="text-sm text-gray-500 z-30 focus:z-50"
                        components={{
                          ...customComponents,
                          ClearIndicator: () => null,
                        }}
                        isLoading={roleLoading}
                      />
                    )}
                    <div className="text-red-500 text-xs mt-1"></div>
                  </div>

                  <div className="w-1/2 z-30 focus-within:z-50">
                    <label htmlFor="level" className="block text-xs">
                      Level
                    </label>
                    <AsyncSelect
                      isClearable
                      isSearchable
                      cacheOptions
                      defaultOptions={menuOpenedForLevel ? levels : []}
                      loadOptions={loadDropdownOptions("level")}
                      onMenuOpen={() => handleDropdownOpen("level")}
                      onChange={(value) => handleDropdownChange("level", value)}
                      value={formData.level}
                      id="role"
                      name="role"
                      placeholder="Select Level"
                      className="text-sm text-gray-500 z-30 focus:z-50"
                      components={{
                        ...customComponents,
                        ClearIndicator: () => null, // Removes the cross icon
                      }}
                      isLoading={levelLoading}
                    />
                    <div className="text-red-500 text-xs mt-1"></div>
                  </div>
                </div>

                <div className="flex space-x-4 mt-2">
                  <div className="w-1/2 z-30 focus-within:z-50">
                    <label htmlFor="band" className="block text-xs">
                      Band
                    </label>
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
                      className="text-sm text-gray-500 z-30 focus:z-50"
                      components={{
                        ...customComponents,
                        ClearIndicator: () => null, // Removes the cross icon
                      }}
                      isLoading={bandLoading}
                    />
                    <div className="text-red-500 text-xs mt-1"></div>
                  </div>

                  <div className="w-1/2 z-30 focus-within:z-50">
                    <label htmlFor="designation" className="block text-xs">
                      Designation
                    </label>
                    <AsyncSelect
                      isClearable
                      isSearchable
                      cacheOptions
                      defaultOptions={
                        menuOpenedForDesignation ? designations : []
                      }
                      loadOptions={loadDropdownOptions("designation")}
                      onMenuOpen={() => handleDropdownOpen("designation")}
                      onChange={(value) =>
                        handleDropdownChange("designation", value)
                      }
                      value={formData.designation}
                      id="designation"
                      name="designation"
                      placeholder="Select Designation"
                      className="text-sm text-gray-500 z-30 focus:z-50"
                      components={{
                        ...customComponents,
                        ClearIndicator: () => null, // Removes the cross icon
                      }}
                      isLoading={designationLoading}
                    />
                    <div className="text-red-500 text-xs mt-1"></div>
                  </div>
                </div>

                <div className="flex space-x-4 mt-2">
                  <div className="w-1/2">
                    <label htmlFor="Approver" className="block text-xs">
                      Approver
                    </label>
                    <Select
                      isMulti
                      isClearable
                      id="approvers"
                      name="approvers"
                      options={approverOptions}
                      placeholder="Search by approver Name "
                      value={approverOptions.filter((opt) =>
                        formData?.approvers?.includes(opt.value)
                      )}
                      onChange={(option) =>
                        handleSelectChange(option, "approvers")
                      }
                      filterOption={(option, inputValue) => {
                        const { label, data } = option;
                        return (
                          label
                            .toLowerCase()
                            .includes(inputValue.toLowerCase()) ||
                          data?.data?.employeeId
                            ?.toLowerCase()
                            ?.includes(inputValue.toLowerCase())
                        );
                      }}
                      className="text-sm z-30 w-full "
                      components={{
                        ...customComponents,
                        ClearIndicator: () => null, // Removes the cross icon
                      }}
                      styles={{
                        control: (provided) => ({
                          ...provided,
                          backgroundColor: "#87878614",
                          border: "none",
                        }),
                      }}
                    />
                  </div>

                  <div className="bg-white p-2 rounded-lg mt-3">
                    <div className="mt-0">
                      <label className="inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          className="sr-only peer"
                          checked={formData.isApprover}
                          disabled={
                            formData.userTypeId === 1 && formData.isApprover
                          }
                          onChange={(event) => {
                            if (
                              !(
                                formData.userTypeId === 1 && formData.isApprover
                              )
                            ) {
                              // Prevent changing if admin & already true
                              setFormData((prev) => ({
                                ...prev,
                                isApprover: event.target.checked,
                              }));
                            }
                          }}
                        />
                        <div className="relative w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-[#E5E1E2] peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-400"></div>
                        <span className="ms-3 text-[#171A19CC] font-normal text-base">
                          Is Approver
                        </span>
                      </label>
                    </div>
                  </div>
                </div>
                <div className="mt-4 text-xl font-medium">Travel Details</div>
                <div className="flex space-x-4 mt-2">
                  <div className="w-2/5">
                    <label htmlFor="passport-number" className="block text-xs">
                      Passport Number
                    </label>
                    <input
                      id="passport-number"
                      type="text"
                      name="passportNo"
                      value={formData.passportNo ?? ""}
                      onChange={handleChange}
                      placeholder="Passport Number"
                      className="w-full p-2 border-none bg-[#87878614] rounded"
                    />
                    <div className="text-red-500 text-xs mt-1">
                      {validator.message(
                        "passportNo",
                        formData.passportNo,
                        "validPassportNumber"
                      )}
                    </div>
                  </div>
                  <div className="w-3/10">
                    <label
                      htmlFor="passport-issue-date"
                      className="block text-xs"
                    >
                      Passport Issue Date
                    </label>
                    <input
                      id="passport-issue-date"
                      type="date"
                      name="passportIssueDate"
                      value={formData.passportIssueDate}
                      onChange={handleChange}
                      className="w-full p-2 border-none bg-[#87878614] rounded"
                    />
                    <div className="text-red-500 text-xs mt-1">
                      {validator.message(
                        "passportIssueDate",
                        formData.passportIssueDate,
                        "validIssueDate"
                      )}
                    </div>
                  </div>
                  <div className="w-3/10">
                    <label
                      htmlFor="passport-expiry-date"
                      className="block text-xs"
                    >
                      Passport Expiry Date
                    </label>
                    <input
                      id="passport-expiry-date"
                      type="date"
                      name="passportExpiry"
                      value={formData.passportExpiry}
                      onChange={handleChange}
                      className="w-full p-2 border-none bg-[#87878614] rounded"
                    />
                    <div className="text-red-500 text-xs mt-1">
                      {validator.message(
                        "passportExpiry",
                        formData.passportExpiry,
                        "validExpiryDate"
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex space-x-4 mt-2">
                  <div className="w-2/5">
                    <label htmlFor="country" className="block text-xs">
                      Country
                    </label>
                    <Select
                      isClearable
                      id="country"
                      name="country"
                      options={countryOptions}
                      placeholder="Select Country"
                      value={countryOptions.find(
                        (option) => option.label === formData.country?.label
                      )}
                      onChange={(option) =>
                        handleChange({
                          name: "country",
                          value: option ? option : "",
                        })
                      }
                      className="text-sm z-20 w-full"
                      components={{
                        ...customComponents,
                        ClearIndicator: () => null, // Removes the cross icon
                      }}
                      styles={{
                        control: (provided) => ({
                          ...provided,
                          backgroundColor: "#87878614",
                          border: "none",
                        }),
                      }}
                    />
                    <div className="text-red-500 text-xs mt-1">
                      {validator.message(
                        "country",
                        formData.country,
                        "required"
                      )}
                    </div>
                  </div>
                  <div className="w-2/5">
                    <label htmlFor="city" className="block text-xs">
                      City
                    </label>
                    <AsyncSelect
                      isClearable
                      cacheOptions
                      defaultOptions
                      placeholder="Select City"
                      className="text-sm z-20 w-full "
                      components={{
                        ...customComponents,
                        ClearIndicator: () => null, // Removes the cross icon
                      }}
                      isSearchable
                      loadOptions={(inputValue) => loadOptions(inputValue)}
                      value={formData.city?.value && formData.city}
                      onChange={(option) =>
                        handleChange({
                          name: "city",
                          value: option,
                        })
                      }
                      styles={{
                        control: (provided) => ({
                          ...provided,
                          backgroundColor: "#87878614",
                          border: "none",
                        }),
                      }}
                    />
                    <div className="text-red-500 text-xs mt-1">
                      {validator.message("city", formData.city, "required")}
                    </div>
                  </div>
                </div>

                <div className="mt-4 text-xl font-medium mb-2">
                  Account Details
                </div>
                {selectedRow?.companyName && (
                  <div className="text-base text-sm font-medium mt-2 mb-2">
                    Company Name : {selectedRow.companyName}
                  </div>
                )}
                {selectedRow?.roleDetails?.userRoleName && (
                  <div className="text-base text-sm font-medium mt-2 mb-2">
                    Role : {selectedRow?.roleDetails?.userRoleName}
                  </div>
                )}
                {selectedRow?.departmentName && (
                  <div className="text-base text-sm font-medium mt-2 mb-2">
                    Department : {selectedRow.departmentName}
                  </div>
                )}
                {selectedRow?.designationDetails?.designation && (
                  <div className="text-base text-sm font-medium mt-2 mb-2">
                    Designation : {selectedRow?.designationDetails?.designation}
                  </div>
                )}
                {selectedRow?.levelDetails?.level && (
                  <div className="text-base text-sm font-medium mt-2 mb-2">
                    Level : {selectedRow?.levelDetails?.level}
                  </div>
                )}
                {selectedRow?.bandDetails?.band && (
                  <div className="text-base text-sm font-medium mt-2 mb-2">
                    Band : {selectedRow?.bandDetails?.band}
                  </div>
                )}
              </div>
            )}
            {activeTab === 2 && (
              <div className="mt-4">
                <div className="text-xl mb-2">Allow Admin Access Controls</div>
                <div className="flex items-center justify-between border-b mb-2">
                  <span>Booking</span>
                  <div>
                    <label className="inline-flex items-center me-5 cursor-pointer">
                      <input
                        type="checkbox"
                        value=""
                        className="sr-only peer"
                      />
                      <div className="relative w-11 h-6 bg-gray-200 rounded-full peer dark:bg-gray-300 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#028fa3]"></div>
                    </label>
                  </div>
                </div>
                <div className="flex items-center justify-between border-b mb-2">
                  <span>Travel Management</span>
                  <div>
                    <label className="inline-flex items-center me-5 cursor-pointer">
                      <input
                        type="checkbox"
                        value=""
                        className="sr-only peer"
                      />
                      <div className="relative w-11 h-6 bg-gray-200 rounded-full peer dark:bg-gray-300 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#028fa3]"></div>
                    </label>
                  </div>
                </div>
                <div className="flex items-center justify-between border-b mb-2">
                  <span>Configuration</span>
                  <div>
                    <label className="inline-flex items-center me-5 cursor-pointer">
                      <input
                        type="checkbox"
                        value=""
                        className="sr-only peer"
                      />
                      <div className="relative w-11 h-6 bg-gray-200 rounded-full peer dark:bg-gray-300 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#028fa3]"></div>
                    </label>
                  </div>
                </div>
                <div className="flex items-center justify-between border-b mb-2">
                  <span>Company Setup</span>
                  <div>
                    <label className="inline-flex items-center me-5 cursor-pointer">
                      <input
                        type="checkbox"
                        value=""
                        className="sr-only peer"
                      />
                      <div className="relative w-11 h-6 bg-gray-200 rounded-full peer dark:bg-gray-300 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#028fa3]"></div>
                    </label>
                  </div>
                </div>
                <div className="flex items-center justify-between border-b mb-2">
                  <span>Dashboard</span>
                  <div>
                    <label className="inline-flex items-center me-5 cursor-pointer">
                      <input
                        type="checkbox"
                        value=""
                        className="sr-only peer"
                      />
                      <div className="relative w-11 h-6 bg-gray-200 rounded-full peer dark:bg-gray-300 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#028fa3]"></div>
                    </label>
                  </div>
                </div>
                <div className="text-xl mb-2 mt-2">Allow Permissions</div>
                <div className="flex items-center justify-between border-b mb-2">
                  <span>Edit</span>
                  <div>
                    <label className="inline-flex items-center me-5 cursor-pointer">
                      <input
                        type="checkbox"
                        value=""
                        className="sr-only peer"
                      />
                      <div className="relative w-11 h-6 bg-gray-200 rounded-full peer dark:bg-gray-300 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#028fa3]"></div>
                    </label>
                  </div>
                </div>
                <div className="flex items-center justify-between border-b mb-2">
                  <span>View</span>
                  <div>
                    <label className="inline-flex items-center me-5 cursor-pointer">
                      <input
                        type="checkbox"
                        value=""
                        className="sr-only peer"
                      />
                      <div className="relative w-11 h-6 bg-gray-200 rounded-full peer dark:bg-gray-300 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#028fa3]"></div>
                    </label>
                  </div>
                </div>
                <div className="flex items-center justify-between border-b mb-2">
                  <span>Delete</span>
                  <div>
                    <label className="inline-flex items-center me-5 cursor-pointer">
                      <input
                        type="checkbox"
                        value=""
                        className="sr-only peer"
                      />
                      <div className="relative w-11 h-6 bg-gray-200 rounded-full peer dark:bg-gray-300 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#028fa3]"></div>
                    </label>
                  </div>
                </div>
              </div>
            )}
            {activeTab === 3 && <div></div>}
            {activeTab === 4 && <div></div>}

            <button
              onClick={handleEditCompany}
              type="submit"
              className="mt-4 p-2 bg-blue-500 text-white rounded"
            >
              Submit
            </button>
          </div>
        )}
      </div>
    </>,
    document.body
  );
};

export default EmployeeEdit;
