import "tailwindcss/tailwind.css";
import { useState, useEffect, useMemo } from "react";
import { useSelector, useDispatch } from "react-redux";
import Image from "next/image";
import corpLogo from "../../../images/corporate/corpbg.png";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faEnvelope,
  faPhone,
  faSpinner,
  faChevronDown,
} from "@fortawesome/free-solid-svg-icons";
import Head from "next/head";
import Select from "react-select";
import AsyncSelect from "react-select/async";
import { components } from "react-select";
import { getCityByCountry } from "@/utils/common";
import showToast from "@/utils/toast";
import axios, { getTabId } from "@/utils/axios/axios";
import config from "@/config";
import { useRouter } from "next/router";
import useFormValidator from "@/hooks/useFormValidator";
import Loader from "@/components/corporate/loader/Loader";
import { ErrorMessage } from "@/components/corporate/errorStatus/StatusComponents";
import { loginUser } from "@/store/slices/userSlice";

export default function Verification() {
  const router = useRouter();

  const dispatch = useDispatch();

  const userDetails = useSelector((state) => state?.user?.userInfo);

  const [localUserId, setLocalUserId] = useState(null);
  const [localCompanyId, setLocalCompanyId] = useState(null);

  const [titleOptions, setTitleOptions] = useState([]);
  const [countryOptions, setCountryOptions] = useState([]);
  const [departmentOptions, setDepartmentOptions] = useState([]);
  const [userInfo, setUserInfo] = useState(null);
  const [tmpSelectedCountry, setTmpSelectedCountry] = useState(null);
  const [loading, setLoading] = useState(true);
  const [buttonLoading, setButtonLoading] = useState(false);
  const [redirecting, setRedirecting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const [hasFetched, setHasFetched] = useState(false);

  const customMessages = {
    email: "This is not a valid email.",
    required: "This field is required.",
  };

  const customRules = {
    validMobile: {
      message: "This is not a valid mobile number.",
      rule: (val, params, validator) => {
        const regex = /^[6-9]\d{9}$/;
        return regex.test(val) && val !== "0000000000";
      },
      required: true,
    },
    validEmail: {
      message: "This is not a valid email.",
      rule: (val, params, validator) => {
        const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return regex.test(val);
      },
      required: true,
    },
    validFirstName: {
      message: "The :attribute should contain only letters.",
      rule: (val, params, validator) => {
        const regex = /^[a-zA-Z\s]*$/;
        return regex.test(val);
      },
      required: true,
    },
    validLastName: {
      message: "The :attribute should contain only letters.",
      rule: (val, params, validator) => {
        const regex = /^[a-zA-Z\s]*$/;
        return regex.test(val);
      },
      required: true,
    },
    validEmployeeID: {
      message:
        "Employee ID must be 2 to 15 characters long and can contain alphanumeric and special characters.",
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
    validPassportIssueDate: {
      message: "Passport issue date should not be greater than today's date.",
      rule: (val, params, validator) => {
        const issueDate = new Date(val);
        const today = new Date();
        return issueDate <= today;
      },
    },
    validPassportExpiryDate: {
      message: "Passport issue date should be less than expiry date.",
      rule: (val, params, validator) => {
        const issueDate = new Date(params[0]);
        const arrivalDate = new Date(params[1]);
        const expiryDate = new Date(val);
        return expiryDate > issueDate;
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

  const [validator] = useFormValidator(customMessages, customRules);

  useEffect(() => {
    if (userDetails?.userId && userDetails?.companyId) {
      setLocalUserId(userDetails.userId);
      setLocalCompanyId(userDetails.companyId);
    }
  }, [userDetails?.userId, userDetails?.companyId]);

  useEffect(() => {
    // if (!localUserId || !localCompanyId) {
    //   return;
    // }
    if (hasFetched) {
      // we already fetched => skip
      return;
    }

    const fetchInitialData = async () => {
      try {
        setLoading(true);
        setErrorMessage("");

        const userId = localUserId;
        const companyId = localCompanyId;

        const [
          titleResponse,
          countryResponse,
          userResponse,
          departmentResponse,
        ] = await Promise.all([
          axios.get(`${config.CORPORATE.USER_TITLES}`),
          axios.get(`${config.CORPORATE.COUNTRY}`),
          axios.get(`${config.CORPORATE.USER_DETAILS}`),
          axios.get(
            // `${config.CORPORATE.DEPARTMENT_LIST}?companyId=${companyId}`
             `${config.CORPORATE.DEPARTMENT_LIST}`
          ),
        ]);

        console.log("the response is ",userResponse)
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

        if (departmentResponse.data.status === "SUCCESS") {
          const { departments } = departmentResponse.data.data;

          const departmentOptions = departments.map((department) => ({
            value: department.departmentId,
            label: department.departmentName,
          }));
          setDepartmentOptions(departmentOptions);
        }

        if (userResponse?.data?.statuscode === 200) {
          setUserInfo(userResponse?.data?.data?.userDetails);
          console.log("user info",userInfo)
        } else {
          // If there's no user data
          setErrorMessage("No user data found");
        }
      } catch (error) {
        console.log("Error fetching data:", error);
        setErrorMessage("Could not fetch user details");
      } finally {
        setHasFetched(true);
        setLoading(false);
      }
    };

    fetchInitialData();
  }, [localUserId, localCompanyId, hasFetched]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUserInfo((prevDetails) => ({
      ...prevDetails,
      [name]: value,
    }));
  };


  const handleSelectChange = (name, selectedOption) => {
    if (name === "countryId") {
      setTmpSelectedCountry(selectedOption); // Store the full option object
      setUserInfo((prevDetails) => ({
        ...prevDetails,
        countryId: selectedOption?.value || null,
        country: selectedOption?.label || null,
        // Clear city when country changes
        cityId: null,
        city: null,
      }));
    } else if (name === "cityId") {
      setUserInfo((prevDetails) => ({
        ...prevDetails,
        cityId: selectedOption?.value || null,
        city: selectedOption?.label || null,
      }));
    } else if (name === "passportIssueCountryCode") {
      setUserInfo((prevDetails) => ({
        ...prevDetails,
        passportIssueCountryCode: selectedOption?.code || null,
      }));
    } else {
      setUserInfo((prevDetails) => ({
        ...prevDetails,
        [name]: selectedOption?.value || null,
      }));
    }
  };

  const loadOptions = async (inputValue) => {
    try {
      const countryCode = tmpSelectedCountry?.code || userInfo?.countryCode;
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

  const handleSaveAndContinue = async () => {
    try {
      const isValid = validator.allValid();
      if (!isValid) {
        validator.showMessages();
        setUserInfo({ ...userInfo });
        return;
      }

      setButtonLoading(true);

      const filteredUserDetails = {
        id: userInfo._id,
        firstName: userInfo.firstName,
        lastName: userInfo.lastName,
        employeeId: userInfo.employeeId,
        workEmail: userInfo.workEmail,
        passportNo: userInfo.passportNumber,
        passportIssueDate: userInfo.passportIssueDate || null,
        passportExpiry: userInfo.passportExpiry || null,
        dateOfBirth: userInfo.dateOfBirth || null,
        address: userInfo.address || null,
        cityId: userInfo.cityId,
        countryId: userInfo.countryId,
        mobile: userInfo.mobile,
        title: userInfo.title,
        departmentId: userInfo.departmentId || null,
        passportIssueCountryCode: userInfo.passportIssueCountryCode || null,
        status: userInfo.status,
      };

      const response = await axios.post(
        `${config.CORPORATE.USER_UPDATE}`,
        filteredUserDetails
      );
      if (response?.data?.status === "SUCCESS") {
        dispatch(
          loginUser({
            userId: userDetails?._id,
            companyId: userDetails?.companyId,
            loggedInDetails: {
              userDetails: {
                ...userDetails?.loggedInDetails?.userDetails,
                ...userInfo,
              },
              companyDetails: userDetails?.companyDetails,
              configuration: userDetails?.configuration,
              rolesModulesAndPermissions:
                userDetails?.rolesModulesAndPermissions,
              travelPolicy: userDetails?.travelPolicy,
              accessTokenData: userDetails?.accessTokenData,
            },
            tabId: getTabId(),
          })
        );
        showToast("success", "User updated successfully!");
        await router.push("/corporate/auth/booking");
      } else {
        showToast("error", "Failed to update user");
      }
    } catch (error) {
      showToast(
        "error",
        error?.response?.data?.message ?? "Error updating user details"
      );
      console.error("Error updating user details:", error);
    } finally {
      setButtonLoading(false);
    }
  };

  const handleContinue = async () => {
    try {
      setRedirecting(true);
      await router.push("/corporate/auth/booking");
    } catch (error) {
      console.error("Error redirecting:", error);
    } finally {
      setRedirecting(false);
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
    DropdownIndicator: () => null,
    DropdownIndicator,
  };

  return (
    <>
      <Head>
        <title>Account Verification</title>
      </Head>
      {loading ? (
        <Loader />
      ) : errorMessage ? (
        <ErrorMessage message={errorMessage} />
      ) : (
        <div className="bg-[#333] bg-gradie bg-custom-gradient w-full h-fit sm:h-screen">
          <div className="w-full h-full flex sm:flex-row flex-col p-2">
            <div className="flex w-full sm:w-2/4">
              <div className="hidden sm:flex items-start">
                <Image
                  //   onClick={redirectBooking}
                  src={corpLogo}
                  alt="Logo"
                  width={180}
                  className="cursor-pointer h-10"
                />
              </div>
              <div className="flex flex-col justify-center w-full sm:-ml-[10%] ">
                <span className="text-lg font-light text-[#D5b300] mb-3">
                  QuGo.Corporate for Business Travel
                </span>
                <span className="text-xl sm:text-4xl font-extralight text-white mb-1 sm:mb-2">
                  Easy . Quick . Managed
                </span>
                <span className="text-xl sm:text-4xl font-semibold  text-white ">
                  Corporate Travel
                </span>
              </div>
              <div className="hidden sm:flex  items-end justify-between w-[40%] px-[10%] pb-2 absolute bottom-0">
                {/* Email Section */}
                <div className="flex gap-1 items-center">
                  <a
                    href="mailto:info@qugo.io"
                    className="flex gap-1 items-center"
                  >
                    <FontAwesomeIcon
                      icon={faEnvelope}
                      color="#028fa3"
                      fontSize={10}
                      className="p-1 bg-white rounded-full"
                    />
                    <span className="text-white text-sm underline">
                      info@qugo.io
                    </span>
                  </a>
                </div>

                {/* Phone Section */}
                <div className="flex gap-1 items-center">
                  <a
                    href="tel:+917411940701"
                    className="flex gap-1 items-center"
                  >
                    <FontAwesomeIcon
                      icon={faPhone}
                      color="#028fa3"
                      fontSize={10}
                      className="p-1 bg-white rounded-full"
                    />
                    <span className="text-white text-sm underline">
                      +91 7411940701
                    </span>
                  </a>
                </div>
              </div>
            </div>

            <div className="w-full sm:w-2/3 bg-white rounded-lg p-4 my-auto h-fit">
              <div className=" flex flex-col justify-between mx-0 sm:mx-4 mt-1">
                <span className="text-xl text-[#000000] font-bold">
                  Confirm your account details using your Aadhaar information.
                </span>
                <span className="text-sm text-[#028fa3]">
                  Your details can be updated anytime in the profile section.
                </span>

                <div className="flex flex-col gap-4 mt-3 ">
                  {/* <div className="text-lg text-[#000000] font-semibold ">General Details</div> */}

                  <div className="flex gap-2 mt-1 justify-between">
                    <div className="w-1/3">
                      <div className="relative w-full h-10">
                        <Select
                          isClearable={true}
                          id="title"
                          name="title"
                          options={titleOptions}
                          placeholder="Title"
                          value={titleOptions.find(
                            (option) => option.value === userInfo?.title
                          )}
                          onChange={(option) =>
                            handleSelectChange("title", option)
                          }
                          className="text-sm z-40"
                          components={{
                            ...customComponents,
                            ClearIndicator: () => null, // Removes the cross icon
                          }}
                          onKeyDown={(event) => {
                            if (event.key === "Backspace" && !userInfo?.title) {
                              handleSelectChange("title", null); // Clears the value
                            }
                          }}
                        />
                        <label
                          htmlFor="title"
                          className="absolute text-sm text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-4 scale-75 top-2 z-50 origin-[0] bg-white dark:bg-gray-900 px-2 peer-focus:px-2 peer-focus:text-[#028fa3] peer-focus:dark:text-[#028fa3] peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto start-1"
                        >
                          Title
                          <span className="text-red-500 absolute right-[-5px] m-1 mt-0">
                            *
                          </span>
                        </label>
                        <div className="text-red-500 text-xxs mt-1">
                          {validator.message(
                            "title",
                            userInfo?.title,
                            "required"
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="w-1/2">
                      <div className="relative w-full min-w-[50px] h-10">
                        <input
                          type="text"
                          id="firstName"
                          name="firstName"
                          className="block px-2.5 pb-2.5 pt-2.5 w-full text-sm text-gray-900 bg-transparent rounded-lg border-1 border-gray-300 appearance-none dark:text-black dark:border-gray-300 dark:focus:border-[#028fa3] focus:outline-none focus:ring-0 focus:border-[#028fa3]-600 peer"
                          placeholder=" "
                          value={userInfo?.firstName}
                          onChange={handleInputChange}
                          maxLength={30}
                        />
                        <label
                          htmlFor="firstName"
                          className="absolute text-sm text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-white dark:bg-gray-900 px-2 peer-focus:px-2 peer-focus:text-[#028fa3] peer-focus:dark:text-[#028fa3] peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto start-1"
                        >
                          First Name
                          <span className="text-red-500 absolute  right-[-5px] m-1 mt-0">
                            *
                          </span>
                        </label>
                        <div className="text-red-500 text-xxs mt-0">
                          {validator.message(
                            "firstName",
                            userInfo?.firstName,
                            "required|validFirstName|alpha_space|min:1|max:30"
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="w-1/2">
                      <div className="relative w-full min-w-[50px] h-10">
                        <input
                          type="text"
                          id="lastName"
                          name="lastName"
                          className="block px-2.5 pb-2.5 pt-2.5 w-full text-sm text-gray-900 bg-transparent rounded-lg border-1 border-gray-300 appearance-none dark:text-black dark:border-gray-300 dark:focus:border-[#028fa3] focus:outline-none focus:ring-0 focus:border-[#028fa3]-600 peer"
                          placeholder=" "
                          value={userInfo?.lastName}
                          onChange={handleInputChange}
                          maxLength={30}
                        />
                        <label
                          htmlFor="lastName"
                          className="absolute text-sm text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-white dark:bg-gray-900 px-2 peer-focus:px-2 peer-focus:text-[#028fa3] peer-focus:dark:text-[#028fa3] peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto start-1"
                        >
                          Last Name
                          <span className="text-red-500 absolute  right-[-5px] m-1 mt-0">
                            *
                          </span>
                        </label>
                        <div className="text-red-500 text-xxs mt-1">
                          {validator.message(
                            "lastName",
                            userInfo?.lastName,
                            "required|validLastName|alpha_space|min:2|max:30"
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2 mt-1 justify-between">
                    <div className="w-1/2">
                      <div className="relative w-full min-w-[50px] h-10">
                        <input
                          type="text"
                          id="employeeId"
                          name="employeeId"
                          className="block px-2.5 pb-2.5 pt-2.5 w-full text-sm text-gray-900 bg-transparent rounded-lg border-1 border-gray-300 appearance-none dark:text-black dark:border-gray-300 dark:focus:border-[#028fa3] focus:outline-none focus:ring-0 focus:border-[#028fa3]-600 peer"
                          placeholder=" "
                          value={userInfo?.employeeId}
                          //   onChange={handleInputChange}
                          readOnly
                        />
                        <label
                          htmlFor="employeeId"
                          className="absolute text-sm text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-white dark:bg-gray-900 px-2 peer-focus:px-2 peer-focus:text-[#028fa3] peer-focus:dark:text-[#028fa3] peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto start-1"
                        >
                          Employee ID
                          <span className="text-red-500 absolute  right-[-5px] m-1 mt-0">
                            *
                          </span>
                        </label>
                        <div className="text-red-500 text-xxs mt-0">
                          {validator.message(
                            "employeeId",
                            userInfo?.employeeId,
                            "required"
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="hidden sm:block w-1/2">
                      <div className="relative w-full min-w-[50px] h-10">
                        <input
                          type="text"
                          id="address"
                          name="address"
                          className="block px-2.5 pb-2.5 pt-2.5 w-full text-sm text-gray-900 bg-transparent rounded-lg border-1 border-gray-300 appearance-none dark:text-black dark:border-gray-300 dark:focus:border-[#028fa3] focus:outline-none focus:ring-0 focus:border-[#028fa3]-600 peer"
                          placeholder=" "
                          value={userInfo?.address}
                          onChange={handleInputChange}
                        />
                        <label
                          htmlFor="address"
                          className="absolute text-sm text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-white dark:bg-gray-900 px-2 peer-focus:px-2 peer-focus:text-[#028fa3] peer-focus:dark:text-[#028fa3] peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto start-1"
                        >
                          Address
                          <span className="text-red-500 absolute  right-[-5px] m-1 mt-0">
                            *
                          </span>
                        </label>
                        <div className="text-red-500 text-xxs mt-1">
                          {validator.message(
                            "address",
                            userInfo?.address,
                            "required"
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="w-1/2">
                      <div className="relative w-full min-w-[50px] h-10">
                        <input
                          type="text"
                          id="workEmail"
                          name="workEmail"
                          className="block px-2.5 pb-2.5 pt-2.5 w-full text-sm text-gray-900 bg-transparent rounded-lg border-1 border-gray-300 appearance-none dark:text-black dark:border-gray-300 dark:focus:border-[#028fa3] focus:outline-none focus:ring-0 focus:border-[#028fa3]-600 peer"
                          placeholder=" "
                          value={userInfo?.workEmail}
                          onChange={handleInputChange}
                        />
                        <label
                          htmlFor="workEmail"
                          className="absolute text-sm text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-white dark:bg-gray-900 px-2 peer-focus:px-2 peer-focus:text-[#028fa3] peer-focus:dark:text-[#028fa3] peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto start-1"
                        >
                          Email
                          <span className="text-red-500 absolute  right-[-5px] m-1 mt-0">
                            *
                          </span>
                        </label>
                        <div className="text-red-500 text-xxs mt-1">
                          {validator.message(
                            "workEmail",
                            userInfo?.workEmail,
                            "required|validEmail"
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* address row for mob ui */}
                  <div className="flex sm:hidden gap-2 mt-1 justify-between">
                    <div className="w-full">
                      <div className="relative w-full min-w-[50px] h-10">
                        <input
                          type="text"
                          id="address"
                          name="address"
                          className="block px-2.5 pb-2.5 pt-2.5 w-full text-sm text-gray-900 bg-transparent rounded-lg border-1 border-gray-300 appearance-none dark:text-black dark:border-gray-300 dark:focus:border-[#028fa3] focus:outline-none focus:ring-0 focus:border-[#028fa3]-600 peer"
                          placeholder=" "
                          value={userInfo?.address}
                          onChange={handleInputChange}
                        />
                        <label
                          htmlFor="address"
                          className="absolute text-sm text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-white dark:bg-gray-900 px-2 peer-focus:px-2 peer-focus:text-[#028fa3] peer-focus:dark:text-[#028fa3] peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto start-1"
                        >
                          Address
                          <span className="text-red-500 absolute  right-[-5px] m-1 mt-0">
                            *
                          </span>
                        </label>
                        <div className="text-red-500 text-xxs mt-1">
                          {validator.message(
                            "address",
                            userInfo?.address,
                            "required"
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* mobile and department row for mob ui */}
                  <div className="flex sm:hidden gap-2 mt-1 justify-between">
                    <div className="w-1/2">
                      <div className="relative w-full min-w-[50px] h-10">
                        <input
                          type="tel"
                          id="mobile"
                          name="mobile"
                          className="block px-2.5 pb-2.5 pt-2.5 w-full text-sm text-gray-900 bg-transparent rounded-lg border-1 border-gray-300 appearance-none dark:text-black dark:border-gray-300 dark:focus:border-[#028fa3] focus:outline-none focus:ring-0 focus:border-[#028fa3]-600 peer"
                          placeholder=" "
                          value={userInfo?.mobile}
                          onChange={handleInputChange}
                        />
                        <label
                          htmlFor="mobile"
                          className="absolute text-sm text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-white dark:bg-gray-900 px-2 peer-focus:px-2 peer-focus:text-[#028fa3] peer-focus:dark:text-[#028fa3] peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto start-1"
                        >
                          Mobile Number
                          <span className="text-red-500 absolute  right-[-5px] m-1 mt-0">
                            *
                          </span>
                        </label>
                        <div className="text-red-500 text-xxs mt-1">
                          {validator.message(
                            "mobile",
                            userInfo?.mobile,
                            "required|validMobile|min:10|max:10"
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="w-1/2">
                      <div className="relative w-full h-10">
                        <Select
                          isDisabled
                          id="department"
                          name="department"
                          options={departmentOptions}
                          placeholder=""
                          value={departmentOptions.find(
                            (option) => option.value === userInfo?.departmentId
                          )}
                          className="text-sm z-40"
                          components={{
                            ...customComponents,
                            ClearIndicator: () => null, // Removes the cross icon
                          }}
                        />
                        <label
                          htmlFor="department"
                          className="absolute text-sm text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-4 scale-75 top-2 z-50 origin-[0] bg-white dark:bg-gray-900 px-2 peer-focus:px-2 peer-focus:text-[#028fa3] peer-focus:dark:text-[#028fa3] peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto start-1"
                        >
                          Department
                        </label>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2 mt-1 justify-between">
                    <div className="hidden sm:block w-1/2">
                      <div className="relative w-full min-w-[50px] h-10">
                        <input
                          type="tel"
                          id="mobile"
                          name="mobile"
                          className="block px-2.5 pb-2.5 pt-2.5 w-full text-sm text-gray-900 bg-transparent rounded-lg border-1 border-gray-300 appearance-none dark:text-black dark:border-gray-300 dark:focus:border-[#028fa3] focus:outline-none focus:ring-0 focus:border-[#028fa3]-600 peer"
                          placeholder=" "
                          value={userInfo?.mobile}
                          onChange={handleInputChange}
                        />
                        <label
                          htmlFor="mobile"
                          className="absolute text-sm text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-white dark:bg-gray-900 px-2 peer-focus:px-2 peer-focus:text-[#028fa3] peer-focus:dark:text-[#028fa3] peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto start-1"
                        >
                          Mobile Number
                          <span className="text-red-500 absolute  right-[-5px] m-1 mt-0">
                            *
                          </span>
                        </label>
                        <div className="text-red-500 text-xxs mt-1">
                          {validator.message(
                            "mobile",
                            userInfo?.mobile,
                            "required|validMobile|min:10|max:10"
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="hidden sm:block w-1/2">
                      <div className="relative w-full h-10">
                        <Select
                          isDisabled
                          id="department"
                          name="department"
                          options={departmentOptions}
                          placeholder=""
                          value={departmentOptions.find(
                            (option) => option.value === userInfo?.departmentId
                          )}
                          className="text-sm z-40"
                          components={{
                            ...customComponents,
                            ClearIndicator: () => null, // Removes the cross icon
                          }}
                        />
                        <label
                          htmlFor="department"
                          className="absolute text-sm text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-4 scale-75 top-2 z-50 origin-[0] bg-white dark:bg-gray-900 px-2 peer-focus:px-2 peer-focus:text-[#028fa3] peer-focus:dark:text-[#028fa3] peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto start-1"
                        >
                          Department
                        </label>
                      </div>
                    </div>

                    <div className="w-1/2">
                      <div className="relative w-full min-w-[50px] h-10">
                        <input
                          type="date"
                          id="dateOfBirth"
                          name="dateOfBirth"
                          className="block px-2.5 pb-2.5 pt-2.5 w-full text-sm text-gray-900 bg-transparent rounded-lg border-1 border-gray-300 appearance-none dark:text-black dark:border-gray-300 dark:focus:border-[#028fa3] focus:outline-none focus:ring-0 focus:border-[#028fa3]-600 peer"
                          placeholder=" "
                          value={userInfo?.dateOfBirth}
                          onChange={handleInputChange}
                          max={new Date().toISOString().split("T")[0]}
                        />
                        <label
                          htmlFor="dateOfBirth"
                          className="absolute text-sm text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-white dark:bg-gray-900 px-2 peer-focus:px-2 peer-focus:text-[#028fa3] peer-focus:dark:text-[#028fa3] peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto start-1"
                        >
                          Date of Birth
                          <span className="text-red-500 absolute  right-[-5px] m-1 mt-0">
                            *
                          </span>
                        </label>
                        <div className="text-red-500 text-xxs mt-1">
                          {validator.message(
                            "dateOfBirth",
                            userInfo?.dateOfBirth,
                            "required|dobValidation"
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="block sm:hidden w-1/2">
                      <div className="relative w-full min-w-[50px] h-10">
                        <input
                          type="text"
                          id="passportNumber"
                          name="passportNumber"
                          className="block px-2.5 pb-2.5 pt-2.5 w-full text-sm text-gray-900 bg-transparent rounded-lg border-1 border-gray-300 appearance-none dark:text-black dark:border-gray-300 dark:focus:border-[#028fa3] focus:outline-none focus:ring-0 focus:border-[#028fa3]-600 peer"
                          placeholder=" "
                          value={userInfo?.passportNumber}
                          onChange={handleInputChange}
                        />
                        <label
                          htmlFor="passportNumber"
                          className="absolute text-sm text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-white dark:bg-gray-900 px-2 peer-focus:px-2 peer-focus:text-[#028fa3] peer-focus:dark:text-[#028fa3] peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto start-1"
                        >
                          Passport Number
                        </label>
                        <div className="text-red-500 text-xxs mt-1">
                          {validator.message(
                            "passportNumber",
                            userInfo?.passportNumber,
                            "validPassportNumber"
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2 mt-1 justify-between">
                    <div className="hidden sm:block w-1/2">
                      <div className="relative w-full min-w-[50px] h-10">
                        <input
                          type="text"
                          id="passportNumber"
                          name="passportNumber"
                          className="block px-2.5 pb-2.5 pt-2.5 w-full text-sm text-gray-900 bg-transparent rounded-lg border-1 border-gray-300 appearance-none dark:text-black dark:border-gray-300 dark:focus:border-[#028fa3] focus:outline-none focus:ring-0 focus:border-[#028fa3]-600 peer"
                          placeholder=" "
                          value={userInfo?.passportNumber}
                          onChange={handleInputChange}
                        />
                        <label
                          htmlFor="passportNumber"
                          className="absolute text-sm text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-white dark:bg-gray-900 px-2 peer-focus:px-2 peer-focus:text-[#028fa3] peer-focus:dark:text-[#028fa3] peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto start-1"
                        >
                          Passport Number
                        </label>
                        <div className="text-red-500 text-xxs mt-1">
                          {validator.message(
                            "passportNumber",
                            userInfo?.passportNumber,
                            "validPassportNumber"
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="w-1/2">
                      <div className="relative w-full min-w-[50px] h-10">
                        <input
                          type="date"
                          id="passportIssueDate"
                          name="passportIssueDate"
                          className="block px-2.5 pb-2.5 pt-2.5 w-full text-sm text-gray-900 bg-transparent rounded-lg border-1 border-gray-300 appearance-none dark:text-black dark:border-gray-300 dark:focus:border-[#028fa3] focus:outline-none focus:ring-0 focus:border-[#028fa3]-600 peer"
                          placeholder=" "
                          value={userInfo?.passportIssueDate}
                          onChange={handleInputChange}
                          max={new Date().toISOString().split("T")[0]}
                        />
                        <label
                          htmlFor="passportIssueDate"
                          className="absolute text-sm text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-white dark:bg-gray-900 px-2 peer-focus:px-2 peer-focus:text-[#028fa3] peer-focus:dark:text-[#028fa3] peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto start-1"
                        >
                          Passport Issue Date
                        </label>
                        <div className="text-red-500 text-xxs mt-0">
                          {validator.message(
                            "passportIssueDate",
                            userInfo?.passportIssueDate,
                            "validPassportIssueDate"
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="w-1/2">
                      <div className="relative w-full min-w-[50px] h-10">
                        <input
                          type="date"
                          id="passportExpiry"
                          name="passportExpiry"
                          className="block px-2.5 pb-2.5 pt-2.5 w-full text-sm text-gray-900 bg-transparent rounded-lg border-1 border-gray-300 appearance-none dark:text-black dark:border-gray-300 dark:focus:border-[#028fa3] focus:outline-none focus:ring-0 focus:border-[#028fa3]-600 peer"
                          placeholder=" "
                          value={userInfo?.passportExpiry}
                          onChange={handleInputChange}
                          max={new Date().toISOString().split("T")[0]}
                        />
                        <label
                          htmlFor="passportExpiry"
                          className="absolute text-sm text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-white dark:bg-gray-900 px-2 peer-focus:px-2 peer-focus:text-[#028fa3] peer-focus:dark:text-[#028fa3] peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto start-1"
                        >
                          Passport Expiry Date
                        </label>
                        <div className="text-red-500 text-xxs mt-1">
                          {validator.message(
                            "passportExpiry",
                            userInfo?.passportExpiry,
                            `validPassportExpiryDate:${userInfo?.passportIssueDate}`
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2 mt-1 justify-between">
                    <div className="w-1/2">
                      <div className="relative w-full h-10">
                        <Select
                          isClearable
                          id="countryId"
                          name="countryId"
                          options={countryOptions}
                          placeholder="Country"
                          value={
                            userInfo?.countryId && {
                              value: userInfo?.countryId,
                              label: userInfo?.country,
                            }
                          }
                          onChange={(option) =>
                            handleSelectChange("countryId", option)
                          }
                          className="text-sm z-20"
                          components={{
                            ...customComponents,
                            ClearIndicator: () => null, // Removes the cross icon
                          }}
                        />
                        <label
                          htmlFor="countryId"
                          className="absolute text-sm text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-4 scale-75 top-2 z-30 origin-[0] bg-white dark:bg-gray-900 px-2 peer-focus:px-2 peer-focus:text-[#028fa3] peer-focus:dark:text-[#028fa3] peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto start-1"
                        >
                          Country
                          <span className="text-red-500 absolute  right-[-5px] m-1 mt-0">
                            *
                          </span>
                        </label>
                        <div className="text-red-500 text-xxs mt-1">
                          {validator.message(
                            "countryId",
                            userInfo?.countryId && {
                              value: userInfo?.countryId,
                              label: userInfo?.country,
                            },
                            "required"
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="w-1/2">
                      <div className="relative w-full h-10">
                        <AsyncSelect
                          isClearable
                          cacheOptions
                          defaultOptions
                          placeholder="City"
                          className="text-sm z-20"
                          components={{
                            ...customComponents,
                            ClearIndicator: () => null, // Removes the cross icon
                          }}
                          isSearchable
                          loadOptions={(inputValue) => loadOptions(inputValue)}
                          value={
                            userInfo?.cityId && {
                              value: userInfo?.cityId,
                              label: userInfo?.city,
                            }
                          }
                          onChange={(option) =>
                            handleSelectChange("cityId", option)
                          }
                        />
                        <label
                          htmlFor="city"
                          className="absolute text-sm text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-4 scale-75 top-2 z-30 origin-[0] bg-white dark:bg-gray-900 px-2 peer-focus:px-2 peer-focus:text-[#028fa3] peer-focus:dark:text-[#028fa3] peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto start-1"
                        >
                          City
                          <span className="text-red-500 absolute  right-[-5px] m-1 mt-0">
                            *
                          </span>
                        </label>
                        <div className="text-red-500 text-xxs mt-1">
                          {validator.message(
                            "cityId",
                            userInfo?.cityId && {
                              value: userInfo?.cityId,
                              label: userInfo?.city,
                            },
                            "required"
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-center mt-4">
                    <button
                      className="w-1/2 bg-[#028fa3] text-white p-2 rounded-lg"
                      onClick={() => handleSaveAndContinue()}
                      disabled={buttonLoading}
                    >
                      {buttonLoading ? (
                        <FontAwesomeIcon icon={faSpinner} spin />
                      ) : (
                        "Save and Continue"
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
