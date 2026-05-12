import { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPencilAlt, faChevronDown } from "@fortawesome/free-solid-svg-icons";
import Select from "react-select";
import AsyncSelect from "react-select/async";
import { getCityByCountry } from "@/utils/common";
import axios from "@/utils/axios/axios";
import showToast from "@/utils/toast";
import config from "@/config";
import style from "../profilecomps/styles.module.css";
import { components } from "react-select";
import { useSelector, useDispatch } from "react-redux";
import { loginUser } from "@/store/slices/userSlice";
import { enable2FA, disable2FA } from "@/utils/twoFactorAPI";

const GeneralDetails = ({
  userDetails: initialUserDetails,
  companyDetails,
  titleOptions,
  countryOptions,
  validator,
  onUpdate,
  close,
}) => {
  const dispatch = useDispatch();

  const userDetailsRedux = useSelector((state) => state?.user?.userInfo);

  const [tmpSelectedCountry, setTmpSelectedCountry] = useState(null);
  const [userDetails, setUserDetails] = useState(initialUserDetails);

  // ✅ 2FA states
  const [is2FAEnabled, setIs2FAEnabled] = useState(false);
  const [twoFactorMethod, setTwoFactorMethod] = useState("email");
  const [isSaving2FA, setIsSaving2FA] = useState(false);
  const [availableMethods, setAvailableMethods] = useState([]);

  useEffect(() => {
    setUserDetails(initialUserDetails);

    // ✅ Initialize 2FA state from userDetails
    if (initialUserDetails) {
      setIs2FAEnabled(initialUserDetails.twoFactorEnabled || false);
      setTwoFactorMethod(initialUserDetails.twoFactorMethod || "email");

      // Determine available methods based on user's contact info
      const methods = [];
      if (initialUserDetails.workEmail) methods.push("email");
      if (initialUserDetails.mobile) methods.push("phone");
      setAvailableMethods(methods);
    }
  }, [initialUserDetails]);

  // ✅ Handle 2FA toggle
  const handleToggle2FA = async () => {
    setIsSaving2FA(true);
    try {
      if (is2FAEnabled) {
        // Disable 2FA
        const result = await disable2FA();
        if (result.success) {
          setIs2FAEnabled(false);
          showToast("success", "Two-factor authentication disabled");

          // Update user details in state
          setUserDetails((prev) => ({
            ...prev,
            twoFactorEnabled: false,
          }));

          // Update Redux store
          dispatch(
            loginUser({
              userId: userDetailsRedux?.userId,
              companyId: userDetailsRedux?.companyId,
              loggedInDetails: {
                userDetails: {
                  ...userDetailsRedux?.loggedInDetails?.userDetails,
                  twoFactorEnabled: false,
                },
                companyDetails:
                  userDetailsRedux?.loggedInDetails?.companyDetails,
                configuration: userDetailsRedux?.loggedInDetails?.configuration,
                rolesModulesAndPermissions:
                  userDetailsRedux?.loggedInDetails?.rolesModulesAndPermissions,
                travelPolicy: userDetailsRedux?.loggedInDetails?.travelPolicy,
                wallet: userDetailsRedux?.loggedInDetails?.wallet,
              },
            }),
          );
        } else {
          showToast("error", result.message || "Failed to disable 2FA");
        }
      } else {
        // Enable 2FA
        const result = await enable2FA(twoFactorMethod);
        if (result.success) {
          setIs2FAEnabled(true);
          showToast("success", "Two-factor authentication enabled");

          // Update user details in state
          setUserDetails((prev) => ({
            ...prev,
            twoFactorEnabled: true,
            twoFactorMethod: twoFactorMethod,
          }));

          // Update Redux store
          dispatch(
            loginUser({
              userId: userDetailsRedux?.userId,
              companyId: userDetailsRedux?.companyId,
              loggedInDetails: {
                userDetails: {
                  ...userDetailsRedux?.loggedInDetails?.userDetails,
                  twoFactorEnabled: true,
                  twoFactorMethod: twoFactorMethod,
                },
                companyDetails:
                  userDetailsRedux?.loggedInDetails?.companyDetails,
                configuration: userDetailsRedux?.loggedInDetails?.configuration,
                rolesModulesAndPermissions:
                  userDetailsRedux?.loggedInDetails?.rolesModulesAndPermissions,
                travelPolicy: userDetailsRedux?.loggedInDetails?.travelPolicy,
                wallet: userDetailsRedux?.loggedInDetails?.wallet,
              },
            }),
          );
        } else {
          showToast("error", result.message || "Failed to enable 2FA");
        }
      }
    } catch (error) {
      showToast("error", "Failed to update 2FA settings");
      console.error("2FA toggle error:", error);
    } finally {
      setIsSaving2FA(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUserDetails((prevDetails) => ({
      ...prevDetails,
      [name]: value,
    }));
  };

  const handleSelectChange = (name, selectedOption) => {
    if (name === "countryId") {
      setTmpSelectedCountry(selectedOption);
      setUserDetails((prevDetails) => ({
        ...prevDetails,
        countryId: selectedOption?.value || null,
        country: selectedOption?.label || null,
        cityId: null,
        city: null,
      }));
    } else if (name === "cityId") {
      setUserDetails((prevDetails) => ({
        ...prevDetails,
        cityId: selectedOption?.value || null,
        city: selectedOption?.label || null,
      }));
    } else if (name === "passportIssueCountryCode") {
      setUserDetails((prevDetails) => ({
        ...prevDetails,
        passportIssueCountryCode: selectedOption?.code || null,
      }));
    } else {
      setUserDetails((prevDetails) => ({
        ...prevDetails,
        [name]: selectedOption?.value || null,
      }));
    }
  };

  const loadOptions = async (inputValue) => {
    try {
      const countryCode = tmpSelectedCountry?.code || userDetails?.countryCode;
      if (inputValue) {
        const cities = await getCityByCountry(inputValue, countryCode);
        const options = cities.map((city) => ({
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

  const handleSubmit = async () => {
    try {
      const isValid = validator.allValid();
      if (!isValid) {
        validator.showMessages();
        setUserDetails({ ...userDetails });
        return;
      }

      const filteredUserDetails = {
        id: userDetails._id,
        firstName: userDetails.firstName,
        lastName: userDetails.lastName,
        employeeId: userDetails.employeeId,
        workEmail: userDetails.workEmail,
        passportNo: userDetails.passportNumber,
        passportIssueDate: userDetails.passportIssueDate || null,
        passportExpiry: userDetails.passportExpiry || null,
        dateOfBirth: userDetails.dateOfBirth || null,
        address: userDetails.address || null,
        cityId: userDetails.cityId,
        countryId: userDetails.countryId,
        mobile: userDetails.mobile,
        title: userDetails.title,
        departmentId: userDetails.departmentId || null,
        passportIssueCountryCode: userDetails.passportIssueCountryCode || null,
        status: userDetails.status,
      };

      const response = await axios.post(
        `${config.CORPORATE.USER_UPDATE}`,
        filteredUserDetails,
      );
      if (response?.data?.status === "SUCCESS") {
        dispatch(
          loginUser({
            userId: userDetailsRedux?.userId,
            companyId: userDetailsRedux?.companyId,
            loggedInDetails: {
              userDetails: {
                ...userDetailsRedux?.loggedInDetails?.userDetails,
                ...userDetails,
              },
              companyDetails: userDetailsRedux?.loggedInDetails?.companyDetails,
              configuration: userDetailsRedux?.loggedInDetails?.configuration,
              rolesModulesAndPermissions:
                userDetailsRedux?.loggedInDetails?.rolesModulesAndPermissions,
              travelPolicy: userDetailsRedux?.loggedInDetails?.travelPolicy,
              wallet: userDetailsRedux?.loggedInDetails?.wallet,
            },
          }),
        );
        showToast("success", "User updated successfully!");
        close();
        return;
      }
      showToast("error", "Failed to update user");
    } catch (error) {
      showToast(
        "error",
        error?.response?.data?.message ?? "Error updating user details",
      );
      console.error("Error updating user details:", error);
    }
  };

  const DropdownIndicator = (props) => {
    return (
      <components.DropdownIndicator {...props}>
        <FontAwesomeIcon icon={faChevronDown} className="text-gray-500" />
      </components.DropdownIndicator>
    );
  };
  const customComponents = {
    IndicatorSeparator: () => null,
    ClearIndicator: () => null,
    DropdownIndicator,
  };

  return (
    <>
      <div className={style.Profile}>
        <div className="font-semibold text-[#030F0C] text-lg">
          General Details
        </div>

        <div className="flex justify-center items-center">
          <div className="relative">
            <div className="w-20 h-20 rounded-full bg-[#87878614] text-[#878786] flex items-center justify-center">
              <div className="text-[#878786] font-medium text-lg">
                {userDetails?.firstName?.charAt(0)}
                {userDetails?.lastName?.charAt(0)}
              </div>
            </div>
            <div className="absolute bottom-[-1px] right-[-8px] transform -translate-x-1/2 w-6 h-6 rounded-full bg-[#028FA3] flex items-center justify-center cursor-pointer">
              <FontAwesomeIcon
                icon={faPencilAlt}
                className="text-[#FFFFFF] text-xs cursor-pointer"
              />
            </div>
          </div>
        </div>

        <div className="flex space-x-4 mt-3">
          <div className="w-1/6">
            <label htmlFor="title" className="block text-xs text-[#878786]">
              Title
              <span className="text-red-500 m-1 mt-0">*</span>
            </label>
            <Select
              isClearable={true}
              id="title"
              name="title"
              placeholder="Mr."
              className="text-xs sm:text-sm z-20"
              value={
                userDetails?.title && {
                  value: userDetails?.title,
                  label: userDetails?.title,
                }
              }
              onChange={(option) => handleSelectChange("title", option)}
              options={titleOptions}
              components={customComponents}
              styles={{
                control: (provided) => ({
                  ...provided,
                  backgroundColor: "#87878614",
                  border: "none",
                  boxShadow: "none",
                  cursor: "pointer",
                }),
              }}
            />
            <div className="text-red-500 text-xxs mt-1">
              {validator.message("title", userDetails?.title, "required")}
            </div>
          </div>
          <div className="w-2/5">
            <label
              htmlFor="first-name"
              className="block text-xs text-[#878786]"
            >
              First Name
              <span className="text-red-500 m-1 mt-0">*</span>
            </label>
            <input
              id="first-name"
              name="firstName"
              type="text"
              value={userDetails?.firstName}
              onChange={handleInputChange}
              placeholder="First Name"
              className="w-full p-2 text-xs sm:text-base border-none bg-[#87878614] cursor-pointer rounded"
              maxLength={33}
            />
            <div className="text-red-500 text-xs mt-0">
              {validator.message(
                "firstName",
                userDetails?.firstName,
                "required|validFirstName|alpha_space|min:3|max:30",
              )}
            </div>
          </div>
          <div className="w-2/5">
            <label htmlFor="last-name" className="block text-xs text-[#878786]">
              Last Name
              <span className="text-red-500 m-1 mt-0">*</span>
            </label>
            <input
              id="last-name"
              name="lastName"
              type="text"
              value={userDetails?.lastName}
              onChange={handleInputChange}
              placeholder="Last Name"
              className="w-full p-2 text-xs sm:text-base border-none bg-[#87878614] cursor-pointer rounded"
              maxLength={50}
            />
            <div className="text-red-500 text-xs mt-1">
              {validator.message(
                "lastName",
                userDetails?.lastName,
                "required|validLastName|alpha_space|min:2|max:30",
              )}
            </div>
          </div>
        </div>

        <div className="flex space-x-4 mt-3">
          <div className="w-1/2">
            <label
              htmlFor="work-email"
              className="block text-xs text-[#878786]"
            >
              Work Email
              <span className="text-red-500 m-1 mt-0">*</span>
            </label>
            <input
              id="work-email"
              name="workEmail"
              value={userDetails?.workEmail}
              onChange={handleInputChange}
              type="email"
              placeholder="Work Email"
              className="w-full p-2 border-none text-xs sm:text-base bg-[#87878614] cursor-pointer rounded"
            />
            <div className="text-red-500 text-xs mt-1">
              {validator.message(
                "workEmail",
                userDetails?.workEmail,
                "required|validEmail",
              )}
            </div>
          </div>
          <div className="w-1/2">
            <label
              htmlFor="mobile-number"
              className="block text-xs text-[#878786]"
            >
              Mobile Number
              <span className="text-red-500 m-1 mt-0">*</span>
            </label>
            <div className="flex space-x-2">
              <input
                id="country-code"
                type="text"
                placeholder="+91"
                defaultValue={"+91"}
                className="w-1/6 p-2 border-none text-xs sm:text-base bg-[#87878614] text-[#878786] cursor-pointer rounded"
                readOnly
              />
              <input
                id="mobile-number"
                type="text"
                name="mobile"
                value={userDetails?.mobile}
                onChange={handleInputChange}
                placeholder="Mobile Number"
                className="w-5/6 p-2 border-none text-xs sm:text-base bg-[#87878614] rounded cursor-pointer"
              />
            </div>

            <div className="text-red-500 text-xs mt-1">
              {validator.message(
                "mobile",
                userDetails?.mobile,
                "required|validMobile|min:10|max:10",
              )}
            </div>
          </div>
        </div>

        <div className="flex space-x-4 mt-3 ">
          <div className="w-2/4">
            <label htmlFor="country" className="block text-xs text-[#878786]">
              Country
              <span className="text-red-500 m-1 mt-0">*</span>
            </label>
            <Select
              isClearable
              id="countryId"
              name="countryId"
              value={
                userDetails?.countryId && {
                  value: userDetails?.countryId,
                  label: userDetails?.country,
                }
              }
              options={countryOptions}
              onChange={(option) => handleSelectChange("countryId", option)}
              placeholder="Select Country"
              className="text-xs sm:text-sm z-50 w-full"
              components={customComponents}
              styles={{
                control: (provided) => ({
                  ...provided,
                  backgroundColor: "#87878614",
                  border: "none",
                  cursor: "pointer",
                }),
              }}
            />
            <div className="text-red-500 text-xs mt-1">
              {validator.message(
                "countryId",
                userDetails?.countryId && {
                  value: userDetails?.countryId,
                  label: userDetails?.country,
                },
                "required",
              )}
            </div>
          </div>
          <div className="w-2/4">
            <label htmlFor="city" className="block text-xs text-[#878786]">
              City
              <span className="text-red-500 m-1 mt-0">*</span>
            </label>
            <AsyncSelect
              isClearable
              name="cityId"
              cacheOptions
              defaultOptions
              placeholder="Select City"
              className="text-xs sm:text-sm z-20 w-full "
              components={customComponents}
              isSearchable
              loadOptions={(inputValue) => loadOptions(inputValue)}
              value={
                userDetails?.cityId && {
                  value: userDetails?.cityId,
                  label: userDetails?.city,
                }
              }
              onChange={(option) => handleSelectChange("cityId", option)}
              styles={{
                control: (provided) => ({
                  ...provided,
                  backgroundColor: "#87878614",
                  border: "none",
                  cursor: "pointer",
                }),
              }}
            />
            <div className="text-red-500 text-xs mt-1">
              {validator.message(
                "cityId",
                userDetails?.cityId && {
                  value: userDetails?.cityId,
                  label: userDetails?.city,
                },
                "required",
              )}
            </div>
          </div>
        </div>

        <div className="flex space-x-4 mt-3">
          <div className="w-1/2">
            <label htmlFor="DOB" className="block text-xs text-[#878786]">
              DOB
              <span className="text-red-500 m-1 mt-0">*</span>
            </label>
            <input
              id="dob"
              name="dateOfBirth"
              value={userDetails?.dateOfBirth}
              onChange={handleInputChange}
              max={new Date().toISOString().split("T")[0]}
              type="date"
              placeholder="Date of Birth"
              className="w-full p-2 text-xs sm:text-base border-none bg-[#87878614] rounded"
            />
            <div className="text-red-500 text-xs mt-1">
              {validator.message(
                "dateOfBirth",
                userDetails?.dateOfBirth,
                "required|dobValidation",
              )}
            </div>
          </div>
          <div className="w-1/2">
            <label htmlFor="address" className="block text-xs text-[#878786]">
              Address
              <span className="text-red-500 m-1 mt-0">*</span>
            </label>
            <input
              id="address"
              name="address"
              value={userDetails?.address}
              onChange={handleInputChange}
              type="text"
              placeholder="Address"
              className="w-full p-2 text-xs sm:text-base border-none bg-[#87878614] cursor-pointer rounded"
            />
            <div className="text-red-500 text-xs mt-1">
              {validator.message("address", userDetails?.address, "required")}
            </div>
          </div>
        </div>

        <div className="mt-4 text-xl font-medium">Travel Details</div>

        <div className="flex space-x-4 mt-3">
          <div className="w-2/6">
            <label
              htmlFor="passport-number"
              className="block text-xs text-[#878786]"
            >
              Passport Number
            </label>
            <input
              id="passport-number"
              type="text"
              name="passportNumber"
              value={userDetails?.passportNumber}
              onChange={handleInputChange}
              placeholder="Passport Number"
              className="w-full p-2 text-xs sm:text-base border-none bg-[#87878614] rounded"
            />
            <div className="text-red-500 text-xs mt-1">
              {validator.message(
                "passportNumber",
                userDetails?.passportNumber,
                "validPassportNumber",
              )}
            </div>
          </div>
          <div className="w-2/6">
            <label
              htmlFor="passport-issue-date"
              className="block text-xs text-[#878786]"
            >
              Passport Issue Date
            </label>
            <input
              id="passport-issue-date"
              type="date"
              name="passportIssueDate"
              value={userDetails?.passportIssueDate}
              onChange={handleInputChange}
              max={new Date().toISOString().split("T")[0]}
              className="w-full p-2 text-xs sm:text-base border-none bg-[#87878614] rounded"
            />
            <div className="text-red-500 text-xs mt-1">
              {validator.message(
                "passportIssueDate",
                userDetails?.passportIssueDate,
                "validPassportIssueDate",
              )}
            </div>
          </div>
          <div className="w-2/6">
            <label
              htmlFor="passport-expiry-date"
              className="block text-xs text-[#878786]"
            >
              Passport Expiry Date
            </label>
            <input
              id="passport-expiry-date"
              type="date"
              name="passportExpiry"
              value={userDetails?.passportExpiry}
              onChange={handleInputChange}
              max={new Date().toISOString().split("T")[0]}
              className="w-full p-2 text-xs sm:text-base border-none bg-[#87878614] rounded"
            />
            <div className="text-red-500 text-xs mt-1">
              {validator.message(
                "passportExpiry",
                userDetails?.passportExpiry,
                `validPassportExpiryDate:${userDetails?.passportIssueDate}`,
              )}
            </div>
          </div>
        </div>

        <div className="flex space-x-4 mt-3">
          <div className="w-1/2">
            <label
              htmlFor="passport_issue_country"
              className="block text-xs text-[#878786]"
            >
              Passport Issue Country
            </label>
            <Select
              isClearable
              id="passport_issue_country"
              name="passportIssueCountryCode"
              value={
                userDetails?.passportIssueCountryCode &&
                countryOptions.find(
                  (option) =>
                    option.code === userDetails.passportIssueCountryCode,
                )
              }
              options={countryOptions}
              onChange={(option) =>
                handleSelectChange("passportIssueCountryCode", option)
              }
              placeholder="Select Country"
              className="text-xs sm:text-sm z-20 w-full"
              components={customComponents}
              styles={{
                control: (provided) => ({
                  ...provided,
                  backgroundColor: "#87878614",
                  border: "none",
                }),
              }}
            />
          </div>
        </div>

        <div className="mt-4 text-xl font-semibold mb-2">Account Details</div>

        <div className=" text-[#878786] text-base font-medium mt-2 mb-2">
          Company Name :{" "}
          <span className="text-sm font-semibold ">
            {companyDetails?.companyName}
          </span>
        </div>
        {userDetails?.approverDetails?.length > 0 && (
          <div className=" text-[#878786] text-base font-medium mt-2 mb-2">
            Approver Name :{" "}
            {userDetails?.approverDetails?.map((approver, index) => (
              <span key={approver._id} className="text-sm font-semibold">
                {approver.firstName} {approver.lastName}
                {index < userDetails.approverDetails.length - 1 && ", "}
              </span>
            ))}
          </div>
        )}

        {userDetails?.employeeId && (
          <div className=" text-[#878786] text-base font-medium mt-2 mb-2">
            Employee Id :{" "}
            <span className="text-sm font-semibold ">
              {userDetails?.employeeId}
            </span>
          </div>
        )}
        {userDetails?.roleName && (
          <div className=" text-[#878786] text-base font-medium mt-2 mb-2">
            Role :{" "}
            <span className="text-sm font-semibold ">
              {userDetails?.roleName}
            </span>
          </div>
        )}
        {userDetails?.levelName && (
          <div className=" text-[#878786] text-base font-medium mt-2 mb-2">
            Level :{" "}
            <span className="text-sm font-semibold ">
              {userDetails?.levelName}
            </span>
          </div>
        )}
        {userDetails?.bandName && (
          <div className=" text-[#878786] text-base font-medium mt-2 mb-2">
            Band :{" "}
            <span className="text-sm font-semibold ">
              {userDetails?.bandName}
            </span>
          </div>
        )}
        {userDetails?.designationName && (
          <div className=" text-[#878786] text-base font-medium mt-2 mb-2">
            Designation :{" "}
            <span className="text-sm font-semibold ">
              {userDetails?.designationName}
            </span>
          </div>
        )}

        {/* ✅ 2FA Section */}
        <div className="mt-4 text-xl font-semibold mb-3">Security Settings</div>

        <div className="bg-[#87878614] rounded-lg p-4 mb-4">
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-sm font-medium text-[#030F0C]">
                Two-Factor Authentication
              </p>
              <p className="text-xs text-[#878786] mt-1">
                Add an extra layer of security to your account
              </p>
            </div>

            <button
              onClick={handleToggle2FA}
              disabled={isSaving2FA}
              className={`
                relative inline-flex h-6 w-11 items-center rounded-full transition-colors
                ${is2FAEnabled ? "bg-[#028FA3]" : "bg-gray-300"}
                ${
                  isSaving2FA
                    ? "opacity-50 cursor-not-allowed"
                    : "cursor-pointer"
                }
              `}
            >
              <span
                className={`
                  inline-block h-4 w-4 transform rounded-full bg-white transition-transform
                  ${is2FAEnabled ? "translate-x-6" : "translate-x-1"}
                `}
              />
            </button>
          </div>

          {/* {!is2FAEnabled && availableMethods.length > 1 && (
            <div className="mt-3 pt-3 border-t border-[#87878633]">
              <label className="block text-xs font-medium text-[#878786] mb-2">
                Preferred verification method
              </label>
              <Select
                value={{
                  value: twoFactorMethod,
                  label:
                    twoFactorMethod === "email"
                      ? "Email"
                      : twoFactorMethod === "phone"
                        ? "Phone"
                        : "Both Email and Phone",
                }}
                onChange={(option) => setTwoFactorMethod(option.value)}
                options={[
                  ...(availableMethods.includes("email")
                    ? [{ value: "email", label: "Email" }]
                    : []),
                  ...(availableMethods.includes("phone")
                    ? [{ value: "phone", label: "Phone" }]
                    : []),
                  ...(availableMethods.length > 1
                    ? [{ value: "both", label: "Both Email and Phone" }]
                    : []),
                ]}
                className="text-xs sm:text-sm"
                components={customComponents}
                styles={{
                  control: (provided) => ({
                    ...provided,
                    backgroundColor: "#FFFFFF",
                    border: "1px solid #E5E7EB",
                    boxShadow: "none",
                    cursor: "pointer",
                  }),
                }}
              />
            </div>
          )} */}

          {/* {is2FAEnabled && (
            <div className="mt-3 pt-3 border-t border-[#87878633]">
              <p className="text-xs text-[#878786]">
                Current method:{" "}
                <span className="font-semibold text-[#028FA3]">
                  {userDetails?.twoFactorMethod === "email"
                    ? "Email"
                    : userDetails?.twoFactorMethod === "phone"
                      ? "Phone"
                      : "Both Email and Phone"}
                </span>
              </p>
            </div>
          )} */}
        </div>

        <div className="mt-4">
          <button
            onClick={handleSubmit}
            className="bg-[#028FA3] hover:bg-[#027a8c] text-white px-6 py-2 rounded transition-colors"
          >
            Update Details
          </button>
        </div>
      </div>
    </>
  );
};

export default GeneralDetails;
