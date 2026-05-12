import "tailwindcss/tailwind.css";
import { useState, useEffect } from "react";
import Image from "next/image";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faEnvelope,
  faPhone,
  faEye,
  faEyeSlash,
  faSpinner,
  faChevronDown,
} from "@fortawesome/free-solid-svg-icons";
import Select from "react-select";
import AsyncSelect from "react-select/async";
import useFormValidator from "@/hooks/useFormValidator";
import axios, { corporateSignUp } from "@/utils/axios/axios";
import showToast from "@/utils/toast";
import { getCityByCountry, getCountry } from "@/utils/common";
import Loader from "@/components/corporate/loader/Loader";
import config from "@/config";
import { useRouter } from "next/router";
import corpLogo from "../../../images/corporate/corpbg.png";
import Head from "next/head";
import { components } from "react-select";
import { MODULE_ROUTES } from "@/utils/constants";

export default function Signup() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [formSubmit, setFormSubmit] = useState(false);
  const [showGSTRelatedFields, setShowGSTRelatedFields] = useState(false);
  const [activeTab, setActiveTab] = useState(1);
  const [titleOptions, setTitleOptions] = useState([]);
  const [countryOptions, setCountryOptions] = useState([]);
  const [identificationIdOptions, setIdentificationIdOptions] = useState([]);
  const [pageLoading, setPageLoading] = useState(false);

  const [validationTrigger, setValidationTrigger] = useState(false);
  const [passwordVisible, setPasswordVisible] = useState([false, false]);
  const [confirmPasswordVisible, setConfirmPasswordVisible] = useState([
    false,
    false,
  ]);

  const [otp, setOtp] = useState("");

  const [imageData, setImageData] = useState({
    panFileName: "",
    gstFileName: "",
    panFile: null,
    gstFile: null,
  });

  const handleFileChange = (e, field) => {
    const file = e.target.files[0];
    if (file) {
      setImageData((prev) => ({
        ...prev,
        [`${field}Name`]: file.name,
        [field]: file,
      }));
    }
  };

  const removeFile = (field) => {
    setImageData((prev) => ({
      ...prev,
      [`${field}Name`]: "",
      [field]: null,
    }));
  };

  const initialAdminFormData = {
    city: null,
    country: null,
    title: "Mr",
    firstName: "",
    lastName: "",
    companyName: "",
    companyAddress: "",
    workEmail: "",
    mobile: "",
    gst: null,
    gstMobileNumber: null,
    gstEmail: null,
    size: null,
    pan: "",
    identificationTypeId: null,
    identificationNumber: null,
    password: "",
    confirmPassword: "",
  };

  const initialEmployeeFormData = {
    title: "",
    firstName: "",
    lastName: "",
    workEmail: "",
    mobileNumber: "",
    companyName: "",
    companyPan: "",
    password: "",
    confirmPassword: "",
  };

  const [formData, setFormData] = useState(initialAdminFormData);

  const [employeeFormData, setEmployeeFormData] = useState(
    initialEmployeeFormData
  );

  const [userTypes, setUserTypes] = useState([]);
  const [userType, setUserType] = useState({});

  // Custom messages and rules (if needed)
  const customMessages = {
    email: "This is not a valid email.",
    required: "This field is required.",
    in: "Password does not match.",
  };

  const customRules = {
    myCustomRule: {
      message: "The :attribute must start with a letter.",
      rule: (val, params, validator) =>
        validator.helpers.testRegex(val, /^[a-zA-Z].*$/),
      required: true,
    },
    companyName: {
      message: "The company name should only contain letters and spaces.",
      rule: (val, params, validator) => {
        const regex = /^[a-zA-Z\s]+$/;
        return regex.test(val);
      },
      required: true,
    },
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
    validPAN: {
      message: "PAN Number does not match the format",
      rule: (val, params, validator) => {
        const regex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
        return regex.test(val);
      },
    },
    validGST: {
      message: "GST Number does not match the format",
      rule: (val, params, validator) => {
        const regex = /\d{2}[A-Z]{5}\d{4}[A-Z]{1}[A-Z\d]{1}[Z]{1}[A-Z\d]{1}/;
        return regex.test(val);
      },
    },
  };

  const [validator, updateValidator] = useFormValidator(
    customMessages,
    customRules
  );

  // Custom messages and rules (if needed) for employee
  const employeeCustomMessages = {
    email: "This is not a valid email.",
    required: "This field is required.",
    in: "Password does not match.",
  };

  const employeeCustomRules = {
    myCustomRule: {
      message: "The :attribute must start with a letter.",
      rule: (val, params, validator) =>
        validator.helpers.testRegex(val, /^[a-zA-Z].*$/),
      required: true,
    },
  };

  const [empValidator, getEmpValidator] = useFormValidator(
    employeeCustomMessages,
    employeeCustomRules
  );

  useEffect(() => {
    const fetchData = async () => {
      try {
        const titleResponse = await axios.get(
          `${config.CORPORATE.USER_TITLES}`
        );
        const titleOptions = titleResponse.data.data.map((title) => ({
          value: title.title,
          label: title.title,
        }));
        setTitleOptions(titleOptions);

        const identificationIdResponse = await axios.get(
          `${config.CORPORATE.IDENTIFICATION_OPTIONS}`
        );

        const identificationIdOptions = identificationIdResponse.data.data.map(
          (identification) => ({
            value: identification.identificationTypeId,
            label: identification.identificationType,
          })
        );

        setIdentificationIdOptions(identificationIdOptions);

        const userTypesResponse = await axios.get(
          `${config.CORPORATE.LOGIN_USER_TYPES}`
        );
        const filteredUserTypes = userTypesResponse.data.data.corporateuserTypes
          .filter((type) => {
            const normalizedUserTypeName = type.userTypeName
              .toLowerCase()
              .replace(/\s+/g, "");
            return ["admin", "employee"].includes(normalizedUserTypeName);
          })
          .map((type) => {
            // Transform the userTypeName to a standardized format
            const transformedUserTypeName = type.userTypeName
              .toLowerCase()
              .replace(/\s+/g, "")
              .replace(/^(.)/, (match, p1) => p1.toUpperCase());

            return {
              ...type,
              userTypeName: transformedUserTypeName,
            };
          });

        const uniqueUserTypes = filteredUserTypes.reduce((acc, current) => {
          const duplicate = acc.find(
            (item) => item.userTypeName === current.userTypeName
          );
          if (!duplicate) {
            return [...acc, current];
          }
          return acc;
        }, []);

        setUserTypes(uniqueUserTypes);
        if (filteredUserTypes.length > 0) {
          const initialType = filteredUserTypes[0].userTypeName
            .toLowerCase()
            .replace(/\s+/g, "");
          setUserType(filteredUserTypes[0]);
        }

        const countryResponse = await getCountry();
        const countryOptions = countryResponse.map((country) => ({
          value: country._id,
          label: country.countryname,
          code: country.alpha2code,
          phoneCode: country.phonecode,
        }));
        setCountryOptions(countryOptions);
      } catch (error) {
        console.error("Error fetching titles:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    const activeUserType = userTypes.find(
      (type) => type.userTypeId === String(activeTab)
    );
    if (activeUserType) {
      const transformedUserTypeName = activeUserType.userTypeName
        .toLowerCase()
        .replace(/\s+/g, "")
        .replace(/^(.)/, (match, p1) => p1.toUpperCase());

      setUserType({
        ...activeUserType,
        userTypeName: transformedUserTypeName,
      });
    }
  }, [activeTab, userTypes]);

  const handleChange = async (e) => {
    const updatedSetForm =
      userType.userTypeName === "Admin" ? setFormData : setEmployeeFormData;
    const { name, value } = e.target
      ? e.target
      : { name: e.name, value: e.value };
    let processedValue =
      name === "gst" || name === "pan" ? value.toUpperCase() : value;

    if (
      ["identificationNumber", "identificationTypeId"].includes(name) &&
      !processedValue
    ) {
      processedValue = null;
      setShowGSTRelatedFields(false);
      updateValidator(customMessages, customRules, true);
    }

    if (name === "size" || name === "mobile") {
      if (!Number(processedValue) && processedValue !== "") return;
      if (name === "size" && (processedValue < 0 || processedValue.length > 10))
        return;
    }
    if (["firstName", "lastName", "companyName"].includes(name)) {
      const alphaRegex = /^[a-zA-Z\s]*$/;
      if (!alphaRegex.test(processedValue) || processedValue.startsWith(" "))
        return;
    }

    updatedSetForm((prevData) => ({ ...prevData, [name]: processedValue }));

    // Only fetch gst for gst dropdown
    if (
      name === "identificationNumber" &&
      formData.identificationTypeId === "1"
    ) {
      // Delay the GST validation and further state updates
      setTimeout(async () => {
        const regex = /\d{2}[A-Z]{5}\d{4}[A-Z]{1}[A-Z\d]{1}[Z]{1}[A-Z\d]{1}/;
        if (regex.test(processedValue)) {
          try {
            const gstData = await axios.post(
              `${config.VERIFY_GST}?gstin=${processedValue}`
            );
            if (gstData.data.status === "SUCCESS") {
              setShowGSTRelatedFields(true);
              updatedSetForm((prevData) => ({
                ...prevData,
                companyName: gstData.data.data.companyName,
                companyAddress: gstData.data.data.companyAddress,
                gst: processedValue,
              }));
            } else {
              updatedSetForm((prevData) => ({
                ...prevData,
                companyName: "",
                companyAddress: "",
                gst: processedValue,
              }));
            }
          } catch (error) {
            updatedSetForm((prevData) => ({
              ...prevData,
              companyName: "",
              companyAddress: "",
              gst: processedValue,
            }));
            console.log(error);
          }
        }
      }, 100);
    }
  };

  const submitForm = async (e) => {
    setFormSubmit(true);
    try {
      e.preventDefault();
      const updatedValidator =
        userType.userTypeName === "Admin" ? validator : empValidator;
      const setForm =
        userType.userTypeName === "Admin" ? setFormData : setEmployeeFormData;
      const formDataToSubmit =
        userType.userTypeName === "Admin" ? formData : employeeFormData;
      const formDataToReset =
        userType.userTypeName === "Admin"
          ? initialAdminFormData
          : initialEmployeeFormData;

      if (updatedValidator.allValid()) {
        // Form is valid, submit the form
        let updatedForm = {
          ...formDataToSubmit,
          userTypeId: Number(userType.userTypeId),
          size: Number(formDataToSubmit.size),
        };
        if (formDataToSubmit.city) {
          updatedForm.cityId = formDataToSubmit?.city?.value || null;
        }
        if (formDataToSubmit.country) {
          updatedForm.countryId = formDataToSubmit?.country?.value || null;
        }

        // Remove confirmPassword field if it exists
        delete updatedForm.confirmPassword;
        delete updatedForm.city;
        delete updatedForm.country;

        if (userType.userTypeName === "Admin") {
          const formData = new FormData();
          // Append all fields to FormData
          Object.keys(updatedForm).forEach((key) => {
            formData.append(key, updatedForm[key]);
          });

          // Append files if they exist
          if (imageData.panFile) formData.append("panFile", imageData.panFile);
          if (imageData.gstFile) formData.append("gstFile", imageData.gstFile);

          updatedForm = formData;
        }

        const headers = {
          headers: {
            "Content-Type":
              userType.userTypeName === "Admin"
                ? "multipart/form-data"
                : "application/json",
          },
        };

        const signupResponse = await corporateSignUp(updatedForm, headers);
        if (signupResponse) {
          const userData = signupResponse.rolesModulesAndPermissions || [];

          let firstModuleRoute = "/corporate/auth/booking";

          if (userData.length > 0) {
            // Sort them or just take userData[0]
            const firstModuleId = userData[0].moduleId;
            if (MODULE_ROUTES[firstModuleId]) {
              firstModuleRoute = MODULE_ROUTES[firstModuleId].route;
            }
          }
          await router.push(firstModuleRoute);
          // window.dispatchEvent(new CustomEvent("userTypeChanged"));
          // Clear the form data
          setForm(formDataToReset);
        } else {
          updatedValidator.hideMessages();
        }
      } else {
        // Show validation messages
        updatedValidator.showMessages();
        if (userType.userTypeName === "Admin") {
          empValidator.hideMessages();
        } else {
          validator.hideMessages();
        }
        // Force an update to show the messages
        setValidationTrigger((prev) => !prev);
      }
    } catch (error) {
      console.log(error);
      showToast(
        "error",
        error?.response?.data?.message ||
        "something went wrong, please try again later"
      );
    } finally {
      setFormSubmit(false);
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

  const handleOnLogin = async () => {
    setPageLoading(true);
    await router.push("/corporate/loginPage/Login");
    setPageLoading(false);
  };

  // removing down arrow from select dropdown of title
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

  const redirectBooking = async () => {
    await router.push("/corporate");
  };

  return (
    <>
      <Head>
        <title>Signup</title>
      </Head>
      {loading || pageLoading ? (
        <Loader />
      ) : (
        <div className="bg-[#333] bg-gradie bg-custom-gradient w-full h-full">
          <div className="w-full h-fit sm:h-screen flex flex-col sm:flex-row p-2 ">
            <div className="flex w-full sm:w-2/4">
              <div className="hidden sm:flex items-start">
                <Image
                  onClick={redirectBooking}
                  src={corpLogo}
                  alt="Logo"
                  width={180}
                  className="cursor-pointer h-10"
                />
              </div>
              <div className="flex flex-col justify-center w-full ml-0 sm:-ml-[10%] items-center sm:items-start">
                <span className="text-lg font-light text-[#D5b300] mb-3">
                  QuGo.Corporate for Business Travel
                </span>
                <span className="text-xl sm:text-4xl font-extralight text-white  mb-2">
                  Easy . Quick . Managed
                </span>
                <span className="text-xl sm:text-4xl font-semibold  text-white ">
                  Corporate Travel
                </span>
              </div>
              <div className="hidden sm:flex  items-end justify-between w-fit sm:w-[40%] px-[10%] pb-2 absolute bottom-0">
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

            <div className="w-full sm:w-2/3 bg-white rounded-lg p-2 h-[100%]">
              <div className=" flex justify-between items-center mx-4 mt-1">
                <span className="text-lg sm:text-3xl font-medium">Create Account</span>
                <div className="flex justify-center items-center space-x-4">
                  {userTypes.map((type) => (
                    <button
                      key={type.userTypeId}
                      className={`${activeTab === Number(type.userTypeId)
                        ? "bg-[#028fa3] text-white rounded-lg"
                        : "border border-[#028fa3] text-gray-500 shadow-[0_4px_6px_-1px_rgba(0,0,0,0.1),0_2px_4px_-1px_rgba(0,0,0,0.06)]"
                        } py-2 px-4 font-medium text-sm rounded-lg`}
                      onClick={() => setActiveTab(Number(type.userTypeId))}
                    >
                      {type.userTypeName}
                    </button>
                  ))}
                </div>
              </div>

              <div className="px-4 p-2 w-fit h-fit">
                {userType.userTypeName === "Admin" && (
                  <div className="flex flex-col gap-3 ">
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
                              (option) => option.value === formData.title
                            )}
                            onChange={(option) =>
                              handleChange({
                                name: "title",
                                value: option ? option.value : "",
                              })
                            }
                            className="text-sm z-40"
                            components={{
                              ...customComponents,
                              ClearIndicator: () => null, // Removes the cross icon
                            }}
                            onKeyDown={(event) => {
                              if (
                                event.key === "Backspace" &&
                                !formData.title
                              ) {
                                handleChange({ name: "title", value: "" }); // Clears the value
                              }
                            }}
                          />
                          <label
                            for="title"
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
                              formData.title,
                              "required"
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="w-2/3 sm:w-1/2">
                        <div className="relative w-full min-w-[50px] h-10">
                          <input
                            type="text"
                            id="firstName"
                            name="firstName"
                            className="block px-2.5 pb-2.5 pt-2.5 w-full text-sm text-gray-900 bg-transparent rounded-lg border-1 border-gray-300 appearance-none dark:text-black dark:border-gray-300 dark:focus:border-[#028fa3] focus:outline-none focus:ring-0 focus:border-[#028fa3]-600 peer"
                            placeholder=" "
                            value={formData.firstName}
                            onChange={handleChange}
                            maxLength={30}
                          />
                          <label
                            for="firstName"
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
                              formData.firstName,
                              "required|validFirstName|alpha_space|min:1|max:30"
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="hidden sm:block w-1/2">
                        <div className="relative w-full min-w-[50px] h-10">
                          <input
                            type="text"
                            id="lastName"
                            name="lastName"
                            className="block px-2.5 pb-2.5 pt-2.5 w-full text-sm text-gray-900 bg-transparent rounded-lg border-1 border-gray-300 appearance-none dark:text-black dark:border-gray-300 dark:focus:border-[#028fa3] focus:outline-none focus:ring-0 focus:border-[#028fa3]-600 peer"
                            placeholder=" "
                            value={formData.lastName}
                            onChange={handleChange}
                            maxLength={30}
                          />
                          <label
                            for="lastName"
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
                              formData.lastName,
                              "required|validLastName|alpha_space|min:2|max:30"
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="w-1/2 hidden sm:block">
                        <div className="relative w-full min-w-[50px] h-10">
                          <input
                            type="tel"
                            id="mobile"
                            name="mobile"
                            className="block px-2.5 pb-2.5 pt-2.5 w-full text-sm text-gray-900 bg-transparent rounded-lg border-1 border-gray-300 appearance-none dark:text-black dark:border-gray-300 dark:focus:border-[#028fa3] focus:outline-none focus:ring-0 focus:border-[#028fa3]-600 peer"
                            placeholder=" "
                            value={formData.mobile}
                            onChange={handleChange}
                            maxLength={10}
                          />
                          <label
                            for="mobile"
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
                              formData.mobile,
                              "required|validMobile|min:10|max:10"
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* mobile and email for web */}
                    <div className="flex sm:hidden gap-2 mt-1 justify-between">
                      <div className="block sm:hidden w-1/2">
                        <div className="relative w-full min-w-[50px] h-10">
                          <input
                            type="text"
                            id="lastName"
                            name="lastName"
                            className="block px-2.5 pb-2.5 pt-2.5 w-full text-sm text-gray-900 bg-transparent rounded-lg border-1 border-gray-300 appearance-none dark:text-black dark:border-gray-300 dark:focus:border-[#028fa3] focus:outline-none focus:ring-0 focus:border-[#028fa3]-600 peer"
                            placeholder=" "
                            value={formData.lastName}
                            onChange={handleChange}
                            maxLength={30}
                          />
                          <label
                            for="lastName"
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
                              formData.lastName,
                              "required|validLastName|alpha_space|min:2|max:30"
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="w-1/2">
                        <div className="relative w-full min-w-[50px] h-10">
                          <input
                            type="tel"
                            id="mobile"
                            name="mobile"
                            className="block px-2.5 pb-2.5 pt-2.5 w-full text-sm text-gray-900 bg-transparent rounded-lg border-1 border-gray-300 appearance-none dark:text-black dark:border-gray-300 dark:focus:border-[#028fa3] focus:outline-none focus:ring-0 focus:border-[#028fa3]-600 peer"
                            placeholder=" "
                            value={formData.mobile}
                            onChange={handleChange}
                            maxLength={10}
                          />
                          <label
                            for="mobile"
                            className="absolute text-xxs sm:text-sm text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-white dark:bg-gray-900 px-2 peer-focus:px-2 peer-focus:text-[#028fa3] peer-focus:dark:text-[#028fa3] peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto start-1"
                          >
                            Mobile Number
                            <span className="text-red-500 absolute  right-[-5px] m-1 mt-0">
                              *
                            </span>
                          </label>
                          <div className="text-red-500 text-xxs mt-1">
                            {validator.message(
                              "mobile",
                              formData.mobile,
                              "required|validMobile|min:10|max:10"
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="w-1/2 hidden sm:block">
                        <div className="relative w-full min-w-[50px] h-10">
                          <input
                            type="text"
                            id="workEmail"
                            name="workEmail"
                            className="block px-2.5 pb-2.5 pt-2.5 w-full text-sm text-gray-900 bg-transparent rounded-lg border-1 border-gray-300 appearance-none dark:text-black dark:border-gray-300 dark:focus:border-[#028fa3] focus:outline-none focus:ring-0 focus:border-[#028fa3]-600 peer"
                            placeholder=" "
                            value={formData.workEmail}
                            onChange={handleChange}
                            maxLength={60}
                          />
                          <label
                            for="workEmail"
                            className="absolute text-sm text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-white dark:bg-gray-900 px-2 peer-focus:px-2 peer-focus:text-[#028fa3] peer-focus:dark:text-[#028fa3] peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto start-1"
                          >
                            Work Email
                            <span className="text-red-500 absolute  right-[-5px] m-1 mt-0">
                              *
                            </span>
                          </label>
                          <div className="text-red-500 text-xxs mt-1">
                            {validator.message(
                              "workEmail",
                              formData.workEmail,
                              "required|validEmail"
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* email for mobile */}
                    <div className="flex sm:hidden gap-2 mt-1 justify-between">
                      <div className="w-full">
                        <div className="relative w-full min-w-[50px] h-10">
                          <input
                            type="text"
                            id="workEmail"
                            name="workEmail"
                            className="block px-2.5 pb-2.5 pt-2.5 w-full text-sm text-gray-900 bg-transparent rounded-lg border-1 border-gray-300 appearance-none dark:text-black dark:border-gray-300 dark:focus:border-[#028fa3] focus:outline-none focus:ring-0 focus:border-[#028fa3]-600 peer"
                            placeholder=" "
                            value={formData.workEmail}
                            onChange={handleChange}
                            maxLength={60}
                          />
                          <label
                            for="workEmail"
                            className="absolute text-sm text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-white dark:bg-gray-900 px-2 peer-focus:px-2 peer-focus:text-[#028fa3] peer-focus:dark:text-[#028fa3] peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto start-1"
                          >
                            Work Email
                            <span className="text-red-500 absolute  right-[-5px] m-1 mt-0">
                              *
                            </span>
                          </label>
                          <div className="text-red-500 text-xxs mt-1">
                            {validator.message(
                              "workEmail",
                              formData.workEmail,
                              "required|validEmail"
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-2 mt-4 justify-between">
                      <div className="w-1/2 hidden sm:block">
                        <div className="relative w-full min-w-[50px] h-10">
                          <input
                            type="text"
                            id="workEmail"
                            name="workEmail"
                            className="block px-2.5 pb-2.5 pt-2.5 w-full text-sm text-gray-900 bg-transparent rounded-lg border-1 border-gray-300 appearance-none dark:text-black dark:border-gray-300 dark:focus:border-[#028fa3] focus:outline-none focus:ring-0 focus:border-[#028fa3]-600 peer"
                            placeholder=" "
                            value={formData.workEmail}
                            onChange={handleChange}
                            maxLength={60}
                          />
                          <label
                            for="workEmail"
                            className="absolute text-sm text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-white dark:bg-gray-900 px-2 peer-focus:px-2 peer-focus:text-[#028fa3] peer-focus:dark:text-[#028fa3] peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto start-1"
                          >
                            Work Email
                            <span className="text-red-500 absolute  right-[-5px] m-1 mt-0">
                              *
                            </span>
                          </label>
                          <div className="text-red-500 text-xxs mt-1">
                            {validator.message(
                              "workEmail",
                              formData.workEmail,
                              "required|validEmail"
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="w-full sm:w-1/2">
                        <div className="relative w-full h-10">
                          <Select
                            isClearable
                            id="identificationTypeId"
                            name="identificationTypeId"
                            options={identificationIdOptions}
                            placeholder="Select ID Type"
                            value={identificationIdOptions.find(
                              (option) =>
                                option.value === formData.identificationTypeId
                            )}
                            onChange={(option) =>
                              handleChange({
                                name: "identificationTypeId",
                                value: option ? option.value : "",
                              })
                            }
                            className="text-sm z-20"
                            components={{
                              ...customComponents,
                              ClearIndicator: () => null, // Removes the cross icon
                            }}
                            onKeyDown={(event) => {
                              if (
                                event.key === "Backspace" &&
                                !formData.identificationTypeId
                              ) {
                                handleChange({ name: "title", value: "" }); // Clears the value
                              }
                            }}
                          />
                          <label
                            htmlFor="identificationTypeId"
                            className="absolute text-sm text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-4 scale-75 top-2 z-30 origin-[0] bg-white dark:bg-gray-900 px-2 peer-focus:px-2 peer-focus:text-[#028fa3] peer-focus:dark:text-[#028fa3] peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto start-1"
                          >
                            Identification ID
                          </label>
                        </div>
                      </div>

                      <div className="w-1/2 hidden sm:block">
                        <div className="relative w-full min-w-[50px] h-10">
                          <input
                            name="identificationNumber"
                            id="identificationNumber"
                            className="block px-2.5 pb-2.5 pt-2.5 w-full text-sm text-gray-900 bg-transparent rounded-lg border-1 border-gray-300 appearance-none dark:text-black dark:border-gray-300 dark:focus:border-[#028fa3] focus:outline-none focus:ring-0 focus:border-[#028fa3]-600 peer"
                            placeholder=" "
                            value={formData.identificationNumber}
                            onChange={handleChange}
                          />
                          <label
                            for="identificationNumber"
                            className="absolute text-sm text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-white dark:bg-gray-900 px-2 peer-focus:px-2 peer-focus:text-[#028fa3] peer-focus:dark:text-[#028fa3] peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto start-1"
                          >
                            Identification Number
                          </label>
                        </div>
                      </div>
                    </div>

                    <div className="flex sm:hidden gap-2 mt-1 justify-between">
                      <div className="w-full">
                        <div className="relative w-full min-w-[50px] h-10">
                          <input
                            name="identificationNumber"
                            id="identificationNumber"
                            className="block px-2.5 pb-2.5 pt-2.5 w-full text-sm text-gray-900 bg-transparent rounded-lg border-1 border-gray-300 appearance-none dark:text-black dark:border-gray-300 dark:focus:border-[#028fa3] focus:outline-none focus:ring-0 focus:border-[#028fa3]-600 peer"
                            placeholder=" "
                            value={formData.identificationNumber}
                            onChange={handleChange}
                          />
                          <label
                            for="identificationNumber"
                            className="absolute text-sm text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-white dark:bg-gray-900 px-2 peer-focus:px-2 peer-focus:text-[#028fa3] peer-focus:dark:text-[#028fa3] peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto start-1"
                          >
                            Identification Number
                          </label>
                        </div>
                      </div>
                    </div>

                    <div className="flex sm:hidden gap-2 mt-2 sm:mt-4 justify-between">
                      <div className="relative w-full min-w-[50px] h-10">
                        <input
                          type="text"
                          id="companyName"
                          name="companyName"
                          className="block px-2.5 pb-2.5 pt-2.5 w-full text-sm text-gray-900 bg-transparent rounded-lg border-1 border-gray-300 appearance-none dark:text-black dark:border-gray-300 dark:focus:border-[#028fa3] focus:outline-none focus:ring-0 focus:border-[#028fa3]-600 peer"
                          placeholder=" "
                          value={formData.companyName}
                          onChange={handleChange}
                          maxLength={50}
                        />
                        <label
                          for="companyName"
                          className="absolute text-sm text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-white dark:bg-gray-900 px-2 peer-focus:px-2 peer-focus:text-[#028fa3] peer-focus:dark:text-[#028fa3] peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto start-1"
                        >
                          Company Name
                          <span className="text-red-500 absolute  right-[-5px] m-1 mt-0">
                            *
                          </span>
                        </label>
                        <div className="text-red-500 text-xxs mt-1">
                          {validator.message(
                            "companyName",
                            formData.companyName,
                            "required|min:3|max:50"
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-2 mt-2 sm:mt-4 justify-between">
                      {/* <div className="w-1/2"> */}
                      <div className="hidden sm:block relative w-full min-w-[50px] h-10">
                        <input
                          type="text"
                          id="companyName"
                          name="companyName"
                          className="block px-2.5 pb-2.5 pt-2.5 w-full text-sm text-gray-900 bg-transparent rounded-lg border-1 border-gray-300 appearance-none dark:text-black dark:border-gray-300 dark:focus:border-[#028fa3] focus:outline-none focus:ring-0 focus:border-[#028fa3]-600 peer"
                          placeholder=" "
                          value={formData.companyName}
                          onChange={handleChange}
                          maxLength={50}
                        />
                        <label
                          for="companyName"
                          className="absolute text-sm text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-white dark:bg-gray-900 px-2 peer-focus:px-2 peer-focus:text-[#028fa3] peer-focus:dark:text-[#028fa3] peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto start-1"
                        >
                          Company Name
                          <span className="text-red-500 absolute  right-[-5px] m-1 mt-0">
                            *
                          </span>
                        </label>
                        <div className="text-red-500 text-xxs mt-1">
                          {validator.message(
                            "companyName",
                            formData.companyName,
                            "required|min:3|max:50"
                          )}
                        </div>
                      </div>
                      {/* </div> */}

                      {/* <div className="w-1/2"> */}
                      <div className="relative w-full min-w-[50px] h-10">
                        <input
                          type="text"
                          id="size"
                          name="size"
                          className="block px-2.5 pb-2.5 pt-2.5 w-full text-sm text-gray-900 bg-transparent rounded-lg border-1 border-gray-300 appearance-none dark:text-black dark:border-gray-300 dark:focus:border-[#028fa3] focus:outline-none focus:ring-0 focus:border-[#028fa3]-600 peer"
                          placeholder=" "
                          value={formData.size}
                          onChange={handleChange}
                          maxLength={10}
                        />
                        <label
                          for="size"
                          className="absolute text-sm text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-white dark:bg-gray-900 px-2 peer-focus:px-2 peer-focus:text-[#028fa3] peer-focus:dark:text-[#028fa3] peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto start-1"
                        >
                          Company Size
                        </label>
                      </div>
                      {/* </div> */}
                      <div className="block relative w-full min-w-[50px] h-10">
                        <input
                          type="text"
                          id="pan"
                          name="pan"
                          className="block px-2.5 pb-2.5 pt-2.5 w-full text-sm text-gray-900 bg-transparent rounded-lg border-1 border-gray-300 appearance-none dark:text-black dark:border-gray-300 dark:focus:border-[#028fa3] focus:outline-none focus:ring-0 focus:border-[#028fa3]-600 peer"
                          placeholder=" "
                          value={formData.pan}
                          onChange={handleChange}
                          maxLength={10}
                        />
                        <label
                          for="pan"
                          className="absolute text-sm text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-white dark:bg-gray-900 px-2 peer-focus:px-2 peer-focus:text-[#028fa3] peer-focus:dark:text-[#028fa3] peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto start-1"
                        >
                          Company PAN
                          <span className="text-red-500 absolute  right-[-5px] m-1 mt-0">
                            *
                          </span>
                        </label>
                        <div className="text-red-500 text-xxs mt-1">
                          {validator.message(
                            "pan",
                            formData.pan,
                            "required|validPAN"
                          )}
                        </div>
                      </div>
                    </div>

                    {/* company pan and pan upload for mob ui */}
                    <div className="flex sm:hidden gap-2 mt-4 justify-between">
                      <div className="hidden sm:block relative w-full min-w-[50px] h-10">
                        <input
                          type="text"
                          id="pan"
                          name="pan"
                          className="block px-2.5 pb-2.5 pt-2.5 w-full text-sm text-gray-900 bg-transparent rounded-lg border-1 border-gray-300 appearance-none dark:text-black dark:border-gray-300 dark:focus:border-[#028fa3] focus:outline-none focus:ring-0 focus:border-[#028fa3]-600 peer"
                          placeholder=" "
                          value={formData.pan}
                          onChange={handleChange}
                          maxLength={10}
                        />
                        <label
                          for="pan"
                          className="absolute text-sm text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-white dark:bg-gray-900 px-2 peer-focus:px-2 peer-focus:text-[#028fa3] peer-focus:dark:text-[#028fa3] peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto start-1"
                        >
                          Company PAN
                          <span className="text-red-500 absolute  right-[-5px] m-1 mt-0">
                            *
                          </span>
                        </label>
                        <div className="text-red-500 text-xxs mt-1">
                          {validator.message(
                            "pan",
                            formData.pan,
                            "required|validPAN"
                          )}
                        </div>
                      </div>
                      <div className="relative w-full min-w-[50px] h-10">
                        <input
                          type="file"
                          id="panFile"
                          name="panFile"
                          className="hidden" // Hide the actual file input
                          accept=".pdf,.jpg,.jpeg,.png" // Specify accepted file types
                          onChange={(e) => handleFileChange(e, "panFile")} // PAN specific function
                        />
                        <label
                          htmlFor="panFile"
                          className="block px-2.5 pb-2.5 pt-2.5 w-full text-sm text-gray-900 bg-transparent rounded-lg border-1 border-gray-300 appearance-none dark:text-black dark:border-gray-300 dark:focus:border-[#028fa3] focus:outline-none focus:ring-0 focus:border-[#028fa3]-600 peer cursor-pointer"
                        >
                          <span className="block w-full text-sm text-gray-500 truncate">
                            {imageData.panFileName || "Upload PAN Document"}
                          </span>
                        </label>
                        {imageData.panFileName && (
                          <span
                            className="absolute right-2 top-2 cursor-pointer text-red-500"
                            onClick={() => removeFile("panFile")}
                          >
                            &times; {/* Cross icon for removing file */}
                          </span>
                        )}
                        <label
                          htmlFor="panFile"
                          className="absolute text-sm text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-white dark:bg-gray-900 px-2 peer-focus:px-2 peer-focus:text-[#028fa3] peer-focus:dark:text-[#028fa3] peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4"
                        >
                          PAN Upload
                          <span className="text-red-500 absolute right-[-5px] m-1 mt-0">
                            *
                          </span>
                        </label>
                        <div className="text-red-500 text-xxs mt-1">
                          {validator.message(
                            "panFile",
                            imageData.panFileName,
                            "required"
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col sm:hidden gap-0 mt-4 justify-between">
                      <div className="relative w-full min-w-[50px] h-10">
                        <input
                          type="text"
                          id="address"
                          name="companyAddress"
                          className="block px-2.5 pb-2.5 pt-2.5 w-full text-sm text-gray-900 bg-transparent rounded-lg border-1 border-gray-300 appearance-none dark:text-black dark:border-gray-300 dark:focus:border-[#028fa3] focus:outline-none focus:ring-0 focus:border-[#028fa3]-600 peer"
                          placeholder=" "
                          value={formData.companyAddress}
                          onChange={handleChange}
                        />
                        <label
                          for="address"
                          className="absolute text-sm text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-white dark:bg-gray-900 px-2 peer-focus:px-2 peer-focus:text-[#028fa3] peer-focus:dark:text-[#028fa3] peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto start-1"
                        >
                          Company Address
                          <span className="text-red-500 absolute  right-[-5px] m-1 mt-0">
                            *
                          </span>
                        </label>
                        <div className="text-red-500 text-xxs mt-1">
                          {validator.message(
                            "address",
                            formData.companyAddress,
                            "required"
                          )}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        {formData.identificationTypeId === "1" &&
                          showGSTRelatedFields && (
                            <>
                              <div className="relative w-full min-w-[50px] h-10 mt-5">
                                <input
                                  type="text"
                                  id="gstEmail"
                                  name="gstEmail"
                                  className="block px-2.5 pb-2.5 pt-2.5 w-full text-sm text-gray-900 bg-transparent rounded-lg border-1 border-gray-300 appearance-none dark:text-black dark:border-gray-300 dark:focus:border-[#028fa3] focus:outline-none focus:ring-0 focus:border-[#028fa3]-600 peer"
                                  placeholder=" "
                                  value={formData.gstEmail}
                                  onChange={handleChange}
                                />
                                <label
                                  for="gstEmail"
                                  className="absolute text-sm text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-white dark:bg-gray-900 px-2 peer-focus:px-2 peer-focus:text-[#028fa3] peer-focus:dark:text-[#028fa3] peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto start-1"
                                >
                                  GST Email
                                  <span className="text-red-500 absolute  right-[-5px] m-1 mt-0">
                                    *
                                  </span>
                                </label>
                                <div className="text-red-500 text-xxs mt-1">
                                  {formData.identificationTypeId === "1" &&
                                    showGSTRelatedFields &&
                                    validator.message(
                                      "gstEmail",
                                      formData.gstEmail,
                                      "required|validEmail"
                                    )}
                                </div>
                              </div>

                              <div className="relative w-full min-w-[50px] h-10 mt-5">
                                <input
                                  type="text"
                                  id="gstMobileNumber"
                                  name="gstMobileNumber"
                                  className="block px-2.5 pb-2.5 pt-2.5 w-full text-sm text-gray-900 bg-transparent rounded-lg border-1 border-gray-300 appearance-none dark:text-black dark:border-gray-300 dark:focus:border-[#028fa3] focus:outline-none focus:ring-0 focus:border-[#028fa3]-600 peer"
                                  placeholder=" "
                                  value={formData.gstMobileNumber}
                                  onChange={handleChange}
                                />
                                <label
                                  for="gstMobileNumber"
                                  className="absolute text-sm text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-white dark:bg-gray-900 px-2 peer-focus:px-2 peer-focus:text-[#028fa3] peer-focus:dark:text-[#028fa3] peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto start-1"
                                >
                                   GST Mobile
                                  <span className="text-red-500 absolute  right-[-5px] m-1 mt-0">
                                    *
                                  </span>
                                </label>
                                <div className="text-red-500 text-xxs mt-1">
                                  {formData.identificationTypeId === "1" &&
                                    showGSTRelatedFields &&
                                    validator.message(
                                      "gstMobileNumber",
                                      formData.gstMobileNumber,
                                      "required|validMobile|min:10|max:10"
                                    )}
                                </div>
                              </div>
                            </>
                          )}
                      </div>
                    </div>

                    <div className="hidden sm:flex gap-2 mt-4 sm:justify-between ">
                      <div className="hidden sm:block relative w-full min-w-[50px] h-10">
                        <input
                          type="text"
                          id="address"
                          name="companyAddress"
                          className="block px-2.5 pb-2.5 pt-2.5 w-full text-sm text-gray-900 bg-transparent rounded-lg border-1 border-gray-300 appearance-none dark:text-black dark:border-gray-300 dark:focus:border-[#028fa3] focus:outline-none focus:ring-0 focus:border-[#028fa3]-600 peer"
                          placeholder=" "
                          value={formData.companyAddress}
                          onChange={handleChange}
                        />
                        <label
                          for="address"
                          className="absolute text-sm text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-white dark:bg-gray-900 px-2 peer-focus:px-2 peer-focus:text-[#028fa3] peer-focus:dark:text-[#028fa3] peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto start-1"
                        >
                          Company Address
                          <span className="text-red-500 absolute  right-[-5px] m-1 mt-0">
                            *
                          </span>
                        </label>
                        <div className="text-red-500 text-xxs mt-1">
                          {validator.message(
                            "address",
                            formData.companyAddress,
                            "required"
                          )}
                        </div>
                      </div>

                      {formData.identificationTypeId === "1" &&
                        showGSTRelatedFields && (
                          <>
                            <div className="relative w-full min-w-[50px] h-10">
                              <input
                                type="text"
                                id="gstEmail"
                                name="gstEmail"
                                className="block px-2.5 pb-2.5 pt-2.5 w-full text-sm text-gray-900 bg-transparent rounded-lg border-1 border-gray-300 appearance-none dark:text-black dark:border-gray-300 dark:focus:border-[#028fa3] focus:outline-none focus:ring-0 focus:border-[#028fa3]-600 peer"
                                placeholder=" "
                                value={formData.gstEmail}
                                onChange={handleChange}
                              />
                              <label
                                for="gstEmail"
                                className="absolute text-sm text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-white dark:bg-gray-900 px-2 peer-focus:px-2 peer-focus:text-[#028fa3] peer-focus:dark:text-[#028fa3] peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto start-1"
                              >
                                GST Email
                                <span className="text-red-500 absolute  right-[-5px] m-1 mt-0">
                                  *
                                </span>
                              </label>
                              <div className="text-red-500 text-xxs mt-1">
                                {formData.identificationTypeId === "1" &&
                                  showGSTRelatedFields &&
                                  validator.message(
                                    "gstEmail",
                                    formData.gstEmail,
                                    "required|validEmail"
                                  )}
                              </div>
                            </div>

                            <div className="relative w-full min-w-[50px] h-10">
                              <input
                                type="text"
                                id="gstMobileNumber"
                                name="gstMobileNumber"
                                className="block px-2.5 pb-2.5 pt-2.5 w-full text-sm text-gray-900 bg-transparent rounded-lg border-1 border-gray-300 appearance-none dark:text-black dark:border-gray-300 dark:focus:border-[#028fa3] focus:outline-none focus:ring-0 focus:border-[#028fa3]-600 peer"
                                placeholder=" "
                                value={formData.gstMobileNumber}
                                onChange={handleChange}
                              />
                              <label
                                for="gstMobileNumber"
                                className="absolute text-sm text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-white dark:bg-gray-900 px-2 peer-focus:px-2 peer-focus:text-[#028fa3] peer-focus:dark:text-[#028fa3] peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto start-1"
                              >
                                Company GST Mobile
                                <span className="text-red-500 absolute  right-[-5px] m-1 mt-0">
                                  *
                                </span>
                              </label>
                              <div className="text-red-500 text-xxs mt-1">
                                {formData.identificationTypeId === "1" &&
                                  showGSTRelatedFields &&
                                  validator.message(
                                    "gstMobileNumber",
                                    formData.gstMobileNumber,
                                    "required|validMobile|min:10|max:10"
                                  )}
                              </div>
                            </div>
                          </>
                        )}
                    </div>


                    {/* GST Upload */}
                    {formData.identificationTypeId === "1" &&
                      showGSTRelatedFields && (
                        <div className="flex sm:hidden gap-2 mt-4 justify-between">
                          <div className="relative w-full min-w-[50px] h-10">
                            <input
                              type="file"
                              id="gstFile"
                              name="gstFile"
                              className="hidden" // Hide the actual file input
                              accept=".pdf,.jpg,.jpeg,.png" // Specify accepted file types
                              onChange={(e) => handleFileChange(e, "gstFile")} // GST specific function
                            />
                            <label
                              htmlFor="gstFile"
                              className="block px-2.5 pb-2.5 pt-2.5 w-full text-sm text-gray-900 bg-transparent rounded-lg border-1 border-gray-300 appearance-none dark:text-black dark:border-gray-300 dark:focus:border-[#028fa3] focus:outline-none focus:ring-0 focus:border-[#028fa3]-600 peer cursor-pointer"
                            >
                              <span className="block w-full text-sm text-gray-500 truncate">
                                {imageData.gstFileName || "Upload GST Document"}
                              </span>
                            </label>
                            {imageData.gstFileName && (
                              <span
                                className="absolute right-2 top-2 cursor-pointer text-red-500"
                                onClick={() => removeFile("gstFile")}
                              >
                                &times; {/* Cross icon for removing file */}
                              </span>
                            )}
                            <label
                              htmlFor="gstFile"
                              className="absolute text-sm text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-white dark:bg-gray-900 px-2 peer-focus:px-2 peer-focus:text-[#028fa3] peer-focus:dark:text-[#028fa3] peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4"
                            >
                              GST Upload
                              <span className="text-red-500 absolute right-[-5px] m-1 mt-0">
                                *
                              </span>
                            </label>
                            <div className="text-red-500 text-xxs mt-1">
                              {formData.identificationTypeId === "1" &&
                                showGSTRelatedFields &&
                                validator.message(
                                  "gstFile",
                                  imageData.gstFileName,
                                  "required"
                                )}
                            </div>
                          </div>
                        </div>
                      )}


                    <div className="flex gap-2 mt-4 justify-between">
                      {/* PAN Upload */}
                      <div className="hidden sm:block relative w-full min-w-[50px] h-10">
                        <input
                          type="file"
                          id="panFile"
                          name="panFile"
                          className="hidden" // Hide the actual file input
                          accept=".pdf,.jpg,.jpeg,.png" // Specify accepted file types
                          onChange={(e) => handleFileChange(e, "panFile")} // PAN specific function
                        />
                        <label
                          htmlFor="panFile"
                          className="block px-2.5 pb-2.5 pt-2.5 w-full text-sm text-gray-900 bg-transparent rounded-lg border-1 border-gray-300 appearance-none dark:text-black dark:border-gray-300 dark:focus:border-[#028fa3] focus:outline-none focus:ring-0 focus:border-[#028fa3]-600 peer cursor-pointer"
                        >
                          <span className="block w-full text-sm text-gray-500 truncate">
                            {imageData.panFileName || "Upload PAN Document"}
                          </span>
                        </label>
                        {imageData.panFileName && (
                          <span
                            className="absolute right-2 top-2 cursor-pointer text-red-500"
                            onClick={() => removeFile("panFile")}
                          >
                            &times; {/* Cross icon for removing file */}
                          </span>
                        )}
                        <label
                          htmlFor="panFile"
                          className="absolute text-sm text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-white dark:bg-gray-900 px-2 peer-focus:px-2 peer-focus:text-[#028fa3] peer-focus:dark:text-[#028fa3] peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4"
                        >
                          PAN Upload
                          <span className="text-red-500 absolute right-[-5px] m-1 mt-0">
                            *
                          </span>
                        </label>
                        <div className="text-red-500 text-xxs mt-1">
                          {validator.message(
                            "panFile",
                            imageData.panFileName,
                            "required"
                          )}
                        </div>
                      </div>

                      {/* GST Upload */}
                      {formData.identificationTypeId === "1" &&
                        showGSTRelatedFields && (
                          <div className="relative hidden sm:block w-full min-w-[50px] h-10">
                            <input
                              type="file"
                              id="gstFile"
                              name="gstFile"
                              className="hidden" // Hide the actual file input
                              accept=".pdf,.jpg,.jpeg,.png" // Specify accepted file types
                              onChange={(e) => handleFileChange(e, "gstFile")} // GST specific function
                            />
                            <label
                              htmlFor="gstFile"
                              className="block px-2.5 pb-2.5 pt-2.5 w-full text-sm text-gray-900 bg-transparent rounded-lg border-1 border-gray-300 appearance-none dark:text-black dark:border-gray-300 dark:focus:border-[#028fa3] focus:outline-none focus:ring-0 focus:border-[#028fa3]-600 peer cursor-pointer"
                            >
                              <span className="block w-full text-sm text-gray-500 truncate">
                                {imageData.gstFileName || "Upload GST Document"}
                              </span>
                            </label>
                            {imageData.gstFileName && (
                              <span
                                className="absolute right-2 top-2 cursor-pointer text-red-500"
                                onClick={() => removeFile("gstFile")}
                              >
                                &times; {/* Cross icon for removing file */}
                              </span>
                            )}
                            <label
                              htmlFor="gstFile"
                              className="absolute text-sm text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-white dark:bg-gray-900 px-2 peer-focus:px-2 peer-focus:text-[#028fa3] peer-focus:dark:text-[#028fa3] peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4"
                            >
                              GST Upload
                              <span className="text-red-500 absolute right-[-5px] m-1 mt-0">
                                *
                              </span>
                            </label>
                            <div className="text-red-500 text-xxs mt-1">
                              {formData.identificationTypeId === "1" &&
                                showGSTRelatedFields &&
                                validator.message(
                                  "gstFile",
                                  imageData.gstFileName,
                                  "required"
                                )}
                            </div>
                          </div>
                        )}
                      <div className="relative w-1/2 sm:w-full h-10">
                        <Select
                          isClearable
                          id="country"
                          name="country"
                          options={countryOptions}
                          placeholder="Country"
                          value={countryOptions.find(
                            (option) => option.value === formData.country?.value
                          )}
                          onChange={(option) =>
                            handleChange({
                              name: "country",
                              value: option ? option : "",
                            })
                          }
                          className="text-sm z-20"
                          components={{
                            ...customComponents,
                            ClearIndicator: () => null, // Removes the cross icon
                          }}
                        />
                        <label
                          for="country"
                          className="absolute text-sm text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-4 scale-75 top-2 z-30 origin-[0] bg-white dark:bg-gray-900 px-2 peer-focus:px-2 peer-focus:text-[#028fa3] peer-focus:dark:text-[#028fa3] peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto start-1"
                        >
                          Country
                          <span className="text-red-500 absolute  right-[-5px] m-1 mt-0">
                            *
                          </span>
                        </label>
                        <div className="text-red-500 text-xxs mt-1">
                          {validator.message(
                            "country",
                            formData.country,
                            "required"
                          )}
                        </div>
                      </div>
                      <div className="block sm:hidden w-1/2">
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
                            loadOptions={(inputValue) =>
                              loadOptions(inputValue)
                            }
                            value={formData.city}
                            onChange={(option) =>
                              handleChange({
                                name: "city",
                                value: option,
                              })
                            }
                          />
                          <label
                            for="city"
                            className="absolute text-sm text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-4 scale-75 top-2 z-30 origin-[0] bg-white dark:bg-gray-900 px-2 peer-focus:px-2 peer-focus:text-[#028fa3] peer-focus:dark:text-[#028fa3] peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto start-1"
                          >
                            City
                            <span className="text-red-500 absolute  right-[-5px] m-1 mt-0">
                              *
                            </span>
                          </label>
                          <div className="text-red-500 text-xxs mt-1">
                            {validator.message(
                              "city",
                              formData.city,
                              "required"
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-2 mt-4 justify-between mb-2">
                      <div className="hidden sm:block w-1/2">
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
                            loadOptions={(inputValue) =>
                              loadOptions(inputValue)
                            }
                            value={formData.city}
                            onChange={(option) =>
                              handleChange({
                                name: "city",
                                value: option,
                              })
                            }
                          />
                          <label
                            for="city"
                            className="absolute text-sm text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-4 scale-75 top-2 z-30 origin-[0] bg-white dark:bg-gray-900 px-2 peer-focus:px-2 peer-focus:text-[#028fa3] peer-focus:dark:text-[#028fa3] peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto start-1"
                          >
                            City
                            <span className="text-red-500 absolute  right-[-5px] m-1 mt-0">
                              *
                            </span>
                          </label>
                          <div className="text-red-500 text-xxs mt-1">
                            {validator.message(
                              "city",
                              formData.city,
                              "required"
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="w-1/2">
                        <div className="relative w-full min-w-[50px] h-10">
                          <input
                            type={passwordVisible[0] ? "text" : "password"}
                            id="password"
                            name="password"
                            className="block px-2.5 pb-2.5 pt-2.5 w-full text-sm text-gray-900 bg-transparent rounded-lg border-1 border-gray-300 appearance-none dark:text-black dark:border-gray-300 dark:focus:border-[#028fa3] focus:outline-none focus:ring-0 focus:border-[#028fa3]-600 peer"
                            placeholder=" "
                            value={formData.password}
                            onChange={handleChange}
                            autoComplete="current-password"
                          />

                          <label
                            for="password"
                            className="absolute text-xs sm:text-sm text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-white dark:bg-gray-900 px-2 peer-focus:px-2 peer-focus:text-[#028fa3] peer-focus:dark:text-[#028fa3] peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto start-1"
                          >
                            Password
                            <span className="text-red-500 absolute  right-[-5px] m-1 mt-0">
                              *
                            </span>
                          </label>
                          <div className="absolute top-1/2 right-3 transform -translate-y-1/2">
                            <button
                              type="button"
                              className="text-gray-500 hover:text-gray-700"
                              onClick={() => {
                                const updatedPassword = [...passwordVisible];
                                updatedPassword[0] = !updatedPassword[0];
                                setPasswordVisible(updatedPassword);
                              }}
                            >
                              <FontAwesomeIcon
                                icon={!passwordVisible[0] ? faEyeSlash : faEye}
                              />
                            </button>
                          </div>
                          <div className="text-red-500 text-xxs mt-1">
                            {validator.message(
                              "password",
                              formData.password,
                              "required|min:6|max:30"
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="w-1/2">
                        <div className="relative w-full min-w-[50px] h-10">
                          <input
                            type={
                              confirmPasswordVisible[0] ? "text" : "password"
                            }
                            id="confirmPassword"
                            name="confirmPassword"
                            className="block px-2.5 pb-2.5 pt-2.5 w-full text-sm text-gray-900 bg-transparent rounded-lg border-1 border-gray-300 appearance-none dark:text-black dark:border-gray-300 dark:focus:border-[#028fa3] focus:outline-none focus:ring-0 focus:border-[#028fa3]-600 peer"
                            placeholder=" "
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            autoComplete="current-password"
                          />

                          <label
                            for="confirmPassword"
                            className="absolute text-xxs sm:text-sm text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-white dark:bg-gray-900 px-2 peer-focus:px-2 peer-focus:text-[#028fa3] peer-focus:dark:text-[#028fa3] peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto start-1"
                          >
                            Confirm <br className="block sm:hidden"/> Password
                            <span className="text-red-500 absolute  right-[-5px] m-1 mt-0">
                              *
                            </span>
                          </label>
                          <div className="absolute top-1/2 right-3 transform -translate-y-1/2">
                            <button
                              type="button"
                              className="text-gray-500 hover:text-gray-700"
                              onClick={() => {
                                const updatedPassword = [
                                  ...confirmPasswordVisible,
                                ];
                                updatedPassword[0] = !updatedPassword[0];
                                setConfirmPasswordVisible(updatedPassword);
                              }}
                            >
                              <FontAwesomeIcon
                                icon={
                                  !confirmPasswordVisible[0]
                                    ? faEyeSlash
                                    : faEye
                                }
                              />
                            </button>
                          </div>
                          <div className="text-red-500 text-xxs mt-1">
                            {validator.message(
                              "confirmPassword",
                              formData.confirmPassword,
                              `required|in:${formData.password}`
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {userType.userTypeName === "Employee" && (
                  <div className="flex flex-col gap-3 mb-3">
                    {/* title name */}
                    <div className="flex gap-2 mt-4 justify-between">
                      <div className="w-1/4">
                        <div className="relative w-full h-10">
                          <Select
                            isClearable
                            id="title"
                            name="title"
                            options={titleOptions}
                            placeholder="Title"
                            value={employeeFormData.title}
                            onChange={handleChange}
                            className="text-sm z-20"
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
                          <div className="text-red-500 text-xxs mt-1">
                            {empValidator.message(
                              "title",
                              employeeFormData.title,
                              "required"
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="w-1/2">
                        <div className="relative w-full min-w-[50px] h-10">
                          <input
                            id="firstName"
                            name="firstName"
                            type="text"
                            className="block px-2.5 pb-2.5 pt-2.5 w-full text-sm text-gray-900 bg-transparent rounded-lg border-1 border-gray-300 appearance-none dark:text-black dark:border-gray-300 dark:focus:border-[#028fa3] focus:outline-none focus:ring-0 focus:border-[#028fa3]-600 peer"
                            placeholder=" "
                            value={employeeFormData.firstName}
                            onChange={handleChange}
                          />
                          <label
                            for="firstName"
                            className="absolute text-sm text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-white dark:bg-gray-900 px-2 peer-focus:px-2 peer-focus:text-[#028fa3] peer-focus:dark:text-[#028fa3] peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto start-1"
                          >
                            First Name
                            <span className="text-red-500 absolute  right-[-5px] m-1 mt-0">
                              *
                            </span>
                          </label>
                          <div className="text-red-500 text-xxs mt-1">
                            {empValidator.message(
                              "firstName",
                              employeeFormData.firstName,
                              "required"
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="w-1/2">
                        <div className="relative w-full min-w-[50px] h-10">
                          <input
                            id="lastName"
                            name="lastName"
                            type="text"
                            className="block px-2.5 pb-2.5 pt-2.5 w-full text-sm text-gray-900 bg-transparent rounded-lg border-1 border-gray-300 appearance-none dark:text-black dark:border-gray-300 dark:focus:border-[#028fa3] focus:outline-none focus:ring-0 focus:border-[#028fa3]-600 peer"
                            placeholder=" "
                            value={employeeFormData.lastName}
                            onChange={handleChange}
                          />
                          <label
                            for="lastName"
                            className="absolute text-sm text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-white dark:bg-gray-900 px-2 peer-focus:px-2 peer-focus:text-[#028fa3] peer-focus:dark:text-[#028fa3] peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto start-1"
                          >
                            Last Name
                            <span className="text-red-500 absolute  right-[-5px] m-1 mt-0">
                              *
                            </span>
                          </label>
                          <div className="text-red-500 text-xxs mt-1">
                            {empValidator.message(
                              "lastName",
                              employeeFormData.lastName,
                              "required"
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* work email and mobile */}
                    <div className="flex gap-2 mt-4 justify-between">
                      <div className="w-1/2">
                        <div className="relative w-full min-w-[50px] h-10">
                          <input
                            id="workEmail"
                            name="workEmail"
                            type="text"
                            className="block px-2.5 pb-2.5 pt-2.5 w-full text-sm text-gray-900 bg-transparent rounded-lg border-1 border-gray-300 appearance-none dark:text-black dark:border-gray-300 dark:focus:border-[#028fa3] focus:outline-none focus:ring-0 focus:border-[#028fa3]-600 peer"
                            placeholder=" "
                            value={employeeFormData.workEmail}
                            onChange={handleChange}
                          />
                          <label
                            for="workEmail"
                            className="absolute text-sm text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-white dark:bg-gray-900 px-2 peer-focus:px-2 peer-focus:text-[#028fa3] peer-focus:dark:text-[#028fa3] peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto start-1"
                          >
                            Work Email
                            <span className="text-red-500 absolute  right-[-5px] m-1 mt-0">
                              *
                            </span>
                          </label>
                          <div className="text-red-500 text-xxs mt-1">
                            {empValidator.message(
                              "workEmail",
                              employeeFormData.workEmail,
                              "required"
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="w-1/2">
                        <div className="relative w-full min-w-[50px] h-10">
                          <input
                            id="mobileNumber"
                            name="mobileNumber"
                            type="tel"
                            className="block px-2.5 pb-2.5 pt-2.5 w-full text-sm text-gray-900 bg-transparent rounded-lg border-1 border-gray-300 appearance-none dark:text-black dark:border-gray-300 dark:focus:border-[#028fa3] focus:outline-none focus:ring-0 focus:border-[#028fa3]-600 peer"
                            placeholder=" "
                            value={employeeFormData.mobileNumber}
                            onChange={handleChange}
                          />
                          <label
                            for="mobileNumber"
                            className="absolute text-sm text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-white dark:bg-gray-900 px-2 peer-focus:px-2 peer-focus:text-[#028fa3] peer-focus:dark:text-[#028fa3] peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto start-1"
                          >
                            Mobile Number
                            <span className="text-red-500 absolute  right-[-5px] m-1 mt-0">
                              *
                            </span>
                          </label>
                          <div className="text-red-500 text-xxs mt-1">
                            {empValidator.message(
                              "mobileNumber",
                              employeeFormData.mobileNumber,
                              "required"
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* company name and pan */}
                    <div className="flex gap-2 mt-4 justify-between">
                      <div className="w-1/2">
                        <div className="relative w-full min-w-[50px] h-10">
                          <input
                            id="companyName"
                            name="companyName"
                            type="text"
                            className="block px-2.5 pb-2.5 pt-2.5 w-full text-sm text-gray-900 bg-transparent rounded-lg border-1 border-gray-300 appearance-none dark:text-black dark:border-gray-300 dark:focus:border-[#028fa3] focus:outline-none focus:ring-0 focus:border-[#028fa3]-600 peer"
                            placeholder=" "
                            value={employeeFormData.companyName}
                            onChange={handleChange}
                          />
                          <label
                            for="companyName"
                            className="absolute text-sm text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-white dark:bg-gray-900 px-2 peer-focus:px-2 peer-focus:text-[#028fa3] peer-focus:dark:text-[#028fa3] peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto start-1"
                          >
                            Company Name
                            <span className="text-red-500 absolute  right-[-5px] m-1 mt-0">
                              *
                            </span>
                          </label>
                          <div className="text-red-500 text-xxs mt-1">
                            {empValidator.message(
                              "companyName",
                              employeeFormData.companyName,
                              "required"
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="w-1/2">
                        <div className="relative w-full min-w-[50px] h-10">
                          <input
                            id="companyPan"
                            name="companyPan"
                            type="text"
                            className="block px-2.5 pb-2.5 pt-2.5 w-full text-sm text-gray-900 bg-transparent rounded-lg border-1 border-gray-300 appearance-none dark:text-black dark:border-gray-300 dark:focus:border-[#028fa3] focus:outline-none focus:ring-0 focus:border-[#028fa3]-600 peer"
                            placeholder=" "
                            value={employeeFormData.companyPan}
                            onChange={handleChange}
                          />
                          <label
                            for="companyPan"
                            className="absolute text-sm text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-white dark:bg-gray-900 px-2 peer-focus:px-2 peer-focus:text-[#028fa3] peer-focus:dark:text-[#028fa3] peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto start-1"
                          >
                            Company PAN Card
                          </label>
                          <div className="text-red-500 text-xxs mt-1">
                            {empValidator.message(
                              "companyPan",
                              employeeFormData.companyPan,
                              "required"
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* password input */}
                    <div className="flex gap-2 mt-4 justify-between">
                      <div className="w-full">
                        <div className="relative w-full min-w-[50px] h-10">
                          <input
                            type={passwordVisible[1] ? "text" : "password"}
                            id="password"
                            name="password"
                            className="block px-2.5 pb-2.5 pt-2.5 w-full text-sm text-gray-900 bg-transparent rounded-lg border-1 border-gray-300 appearance-none dark:text-black dark:border-gray-300 dark:focus:border-[#028fa3] focus:outline-none focus:ring-0 focus:border-[#028fa3]-600 peer"
                            placeholder=" "
                            value={employeeFormData.password}
                            onChange={handleChange}
                            autoComplete="current-password"
                          />

                          <label
                            for="password"
                            className="absolute text-sm text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-white dark:bg-gray-900 px-2 peer-focus:px-2 peer-focus:text-[#028fa3] peer-focus:dark:text-[#028fa3] peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto start-1"
                          >
                            Password
                            <span className="text-red-500 absolute  right-[-5px] m-1 mt-0">
                              *
                            </span>
                          </label>
                          <div className="absolute top-1/2 right-3 transform -translate-y-1/2">
                            <button
                              type="button"
                              className="text-gray-500 hover:text-gray-700"
                              onClick={() => {
                                const updatedPassword = [...passwordVisible];
                                updatedPassword[1] = !updatedPassword[1];
                                setPasswordVisible(updatedPassword);
                              }}
                            >
                              <FontAwesomeIcon
                                icon={!passwordVisible[1] ? faEyeSlash : faEye}
                              />
                            </button>
                          </div>
                          <div className="text-red-500 text-xxs mt-1">
                            {empValidator.message(
                              "password",
                              employeeFormData.password,
                              "required|min:6"
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="w-full">
                        <div className="relative w-full min-w-[50px] h-10">
                          <input
                            type={
                              confirmPasswordVisible[1] ? "text" : "password"
                            }
                            id="confirmPassword"
                            name="confirmPassword"
                            className="block px-2.5 pb-2.5 pt-2.5 w-full text-sm text-gray-900 bg-transparent rounded-lg border-1 border-gray-300 appearance-none dark:text-black dark:border-gray-300 dark:focus:border-[#028fa3] focus:outline-none focus:ring-0 focus:border-[#028fa3]-600 peer"
                            placeholder=" "
                            value={employeeFormData.confirmPassword}
                            onChange={handleChange}
                            autoComplete="current-password"
                          />

                          <label
                            for="confirmPassword"
                            className="absolute text-sm text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-white dark:bg-gray-900 px-2 peer-focus:px-2 peer-focus:text-[#028fa3] peer-focus:dark:text-[#028fa3] peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto start-1"
                          >
                            Confirm Password
                            <span className="text-red-500 absolute  right-[-5px] m-1 mt-0">
                              *
                            </span>
                          </label>
                          <div className="absolute top-1/2 right-3 transform -translate-y-1/2">
                            <button
                              type="button"
                              className="text-gray-500 hover:text-gray-700"
                              onClick={() => {
                                const updatedPassword = [
                                  ...confirmPasswordVisible,
                                ];
                                updatedPassword[1] = !updatedPassword[1];
                                setConfirmPasswordVisible(updatedPassword);
                              }}
                            >
                              <FontAwesomeIcon
                                icon={
                                  !confirmPasswordVisible[1]
                                    ? faEyeSlash
                                    : faEye
                                }
                              />
                            </button>
                          </div>
                          <div className="text-red-500 text-xxs mt-1">
                            {empValidator.message(
                              "confirmPassword",
                              employeeFormData.confirmPassword,
                              `required|in:${employeeFormData.password}`
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                <button
                  type="submit"
                  onClick={submitForm}
                  className="w-[50%] rounded-lg bg-[#028fa3] text-white mx-[25%] p-2 mt-4"
                  disabled={formSubmit}
                >
                  {formSubmit ? (
                    <FontAwesomeIcon icon={faSpinner} spin />
                  ) : (
                    "Sign Up"
                  )}
                </button>

                <button
                  onClick={handleOnLogin}
                  className="w-full underline text-gray-400 mt-2 hover:text-[#028fa3]"
                >
                  Already have a account? Login
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
