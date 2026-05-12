import "tailwindcss/tailwind.css";
import { useRouter } from "next/router";
import { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import {
  faEye,
  faEyeSlash,
  faSpinner,
  faCheckCircle,
  faPencil,
  faPhone,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import OtpInput from "react-otp-input";
import corpLogo from "../../../images/corporate/corpbg.png";
import Image from "next/image";
import useFormValidator from "@/hooks/useFormValidator";
import {
  corporateLogin,
  getTabId,
  setActiveUserType,
  storeLastActiveUserTokens,
  storeUserTypeTokens,
} from "@/utils/axios/axios";
import showToast from "@/utils/toast";
import Loader from "@/components/corporate/loader/Loader";
import Head from "next/head";
import { faEnvelope } from "@fortawesome/free-regular-svg-icons";
import { MODULE_ROUTES } from "@/utils/constants";
import config from "@/config";
import axios from "@/utils/axios/axios";
import TwoFactorAuth from "@/components/corporate/TwoFactorAuth/TwoFactorAuth";
import { loginUser } from "@/store/slices/userSlice";
import { initializeStore } from "@/store/initializeStore";

export default function Login() {
  const router = useRouter();

  const dispatch = useDispatch();

  const [password, setPassword] = useState("");
  const [type, setType] = useState("password");
  const [icon, setIcon] = useState(faEyeSlash);
  const [otp, setOtp] = useState("");
  const [emailOrMobile, setEmailOrMobile] = useState("");
  const [validationTrigger, setValidationTrigger] = useState(false);
  const [loginType, setLoginType] = useState("password");
  const [isOtpSuccess, setIsOtpSuccess] = useState(false);
  const [showResend, setShowResend] = useState(false);
  const [timer, setTimer] = useState(60);
  const [resendEmailOrMobile, setResendEmailOrMobile] = useState("");
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [companies, setCompanies] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);
  const [forceModal, setForceModal] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [show2FA, setShow2FA] = useState(false);
  const [twoFAData, setTwoFAData] = useState(null);

  useEffect(() => {
    let interval;
    if (showResend) {
      interval = setInterval(() => {
        setTimer((prevTimer) => (prevTimer > 0 ? prevTimer - 1 : 0));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [showResend]);

  useEffect(() => {
    if (timer === 0) {
      setShowResend(false);
    }
  }, [timer]);

  const debounce = (func, wait) => {
    let timeout;
    return (...args) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => func(...args), wait);
    };
  };

  // Check companies when emailOrMobile changes
  useEffect(() => {
    if (!emailOrMobile) {
      setSelectedCompany(null);
      setCompanies([]);
      return;
    }
    if (
      emailOrMobile &&
      (loginType === "password" || loginType === "otp") &&
      !showForgotPassword
    ) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      const mobileRegex = /^[6-9]\d{9}$/; // Indian mobile: starts with 6-9, total 10 digits

      // Check if input is valid email or mobile
      const isValidEmail = emailRegex.test(emailOrMobile);
      const isValidMobile = mobileRegex.test(emailOrMobile);

      // If neither valid email nor mobile, return early
      if (!isValidEmail && !isValidMobile) {
        setSelectedCompany(null);
        setCompanies([]);
        return;
      }

      const controller = new AbortController(); // Create AbortController
      const signal = controller.signal;
      const checkCompanies = async () => {
        // const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        // if (emailRegex.test(emailOrMobile)) {
        try {
          const response = await axios.post(
            config.CORPORATE.FORGOT_PASSWORD_CHECK_COMPANIES,
            { identifier: emailOrMobile },
            { signal },
          );
          if (response?.data?.status && response?.data?.data) {
            const companiesData = response.data.data;
            if (companiesData.length === 0) {
              showToast("error", "No user found with that email");
            } else if (companiesData.length === 1) {
              setSelectedCompany(companiesData[0]);
            } else {
              setCompanies(companiesData);
              setShowModal(true);
              setForceModal(true);
            }
          }
        } catch (err) {
          if (
            err.name === "AbortError" ||
            err.name === "CanceledError" ||
            err.code === "ERR_CANCELED"
          ) {
            console.log("Request aborted");
            return;
          } else {
            console.error(err);
            showToast(
              "error",
              err?.response?.data?.message || "Something went wrong",
            );
          }
        }
        // }
      };
      const debouncedCheckCompanies = debounce(checkCompanies, 500);

      debouncedCheckCompanies();

      return () => {
        controller.abort();
      };
    }
  }, [emailOrMobile, loginType, showForgotPassword]);

  // Custom messages and rules (if needed)
  const customMessages = {
    email: "This is not a valid email.",
    required: "This field is required.",
  };

  const customRules = {
    myCustomRule: {
      message: "The :attribute must start with a letter.",
      rule: (val, params, validator) =>
        validator.helpers.testRegex(val, /^[a-zA-Z].*$/),
      required: true,
    },
    emailOrMobile: {
      message: "Invalid email or mobile format",
      rule: (value) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const mobileRegex = /^[0-9]{10}$/;
        return emailRegex.test(value) || mobileRegex.test(value);
      },
    },
    password: {
      message: "Password is required",
      rule: (value) => {
        return loginType === "password" && value.length > 0;
      },
      required: loginType === "password",
    },
    forgotEmail: {
      message: "Please enter a valid email address.",
      rule: (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),
      required: true,
    },
  };

  const [validator, updateValidator] = useFormValidator(
    customMessages,
    customRules,
  );

  const updateRules = (type) => {
    const customRules = {
      emailOrMobile: {
        message: "Invalid email or mobile format",
        rule: (value) => {
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          const mobileRegex = /^[0-9]{10}$/;
          return emailRegex.test(value) || mobileRegex.test(value);
        },
      },
      password: {
        message: "Password is required",
        rule: (value) => {
          return type === "password" && value.length > 0;
        },
        required: type === "password",
      },
      forgotEmail: {
        message: "Please enter a valid email address.",
        rule: (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),
        required: true,
      },
    };
    updateValidator(customMessages, customRules);
  };

  useEffect(() => {
    updateRules(loginType);
  }, [loginType, showForgotPassword]);

  const handleToggle = () => {
    if (type === "password") {
      setIcon(faEye);
      setType("text");
    } else {
      setIcon(faEyeSlash);
      setType("password");
    }
  };

  const handleToggleForgotPassword = () => {
    setShowForgotPassword((prev) => !prev);
    setSelectedCompany(null);
  };

  const handleLoginType = (loginType) => {
    setLoginType(loginType);
    setSelectedCompany(null);
  };

  const handleEditOtpMobileNumber = () => {
    setIsOtpSuccess(false);
    setLoginType("otp");
    // setSelectedCompany(null);
  };

  const handleLogin = async (e = null, newOTP = null) => {
    if (e) e.preventDefault();
    setLoading(true);
    let updatedOtp = otp;
    if (newOTP) {
      updatedOtp = newOTP;
    }
    try {
      let payload = {};
      const isValid = validator.allValid();
      if (isValid) {
        if (loginType === "otp") {
          if (!selectedCompany && !showModal) {
            showToast(
              "error",
              "Please select a company or wait for company check",
            );
            setLoading(false);
            return;
          }
          payload = {
            loginId: emailOrMobile,
            otpType: !isOtpSuccess ? "New" : "valid",
            otpNumber: updatedOtp ? updatedOtp : "",
            loginType: "OTP",
            password: null,
            companyId: selectedCompany?.companyId,
          };
        } else if (loginType === "password") {
          if (!selectedCompany && !showModal) {
            showToast(
              "error",
              "Please select a company or wait for company check",
            );
            setLoading(false);
            return;
          }
          payload = {
            loginId: emailOrMobile,
            otpType: !isOtpSuccess ? "New" : "valid",
            otpNumber: updatedOtp ? updatedOtp : "",
            loginType: "password",
            password: password,
            companyId: selectedCompany?.companyId,
          };
        }
        const loginResponse = await corporateLogin(payload);

        // ✅ Check for 2FA requirement
        if (loginResponse && loginResponse.requires2FA) {
          console.log("2FA required, showing modal");
          setTwoFAData({
            userId: loginResponse.userId,
            companyId: loginResponse.companyId,
            email: loginResponse.email,
            mobile: loginResponse.mobile,
            availableMethods: loginResponse.availableMethods,
            defaultMethod: loginResponse.defaultMethod,
            maskedEmail: loginResponse.maskedEmail,
            maskedPhone: loginResponse.maskedPhone,
          });
          setShow2FA(true);
          setLoading(false);
          return;
        }

        // ✅ No 2FA required or already completed - proceed normally
        if (loginResponse && payload.otpType === "New" && loginType === "otp") {
          setIsOtpSuccess(true);
          setResendEmailOrMobile(payload.loginId);
        } else if (
          loginResponse &&
          (loginType === "otp" || loginType === "password")
        ) {
          try {
            console.log("🔄 Initializing store after login...");
            await initializeStore();
            console.log("✅ Store initialized successfully");
          } catch (error) {
            console.error("❌ Error initializing store after login:", error);
            // Continue even if initialization fails
          }
          const userData = loginResponse.rolesModulesAndPermissions || [];

          let firstModuleRoute = "/corporate/auth/booking";

          if (userData.length > 0) {
            // Sort them or just take userData[0]
            const firstModuleId = userData[0].moduleId;
            if (MODULE_ROUTES[firstModuleId]) {
              firstModuleRoute = MODULE_ROUTES[firstModuleId].route;
            }
          }
          await router.push(firstModuleRoute);
        }
      } else {
        // Show validation messages
        validator.showMessages();
        // Force an update to show the messages
        setValidationTrigger((prev) => !prev);
      }
    } catch (error) {
      console.log(error);
      showToast(
        "error",
        error?.response?.data?.message ||
          "something went wrong, please try again later",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    const isValid = validator.allValid();
    if (!isValid) {
      // Show validation messages
      validator.showMessages();
      // Force an update to show the messages
      setValidationTrigger((prev) => !prev);
      return;
    }
    setLoading(true);
    try {
      // Call your API to get companies for the given email
      const response = await axios.post(
        config.CORPORATE.FORGOT_PASSWORD_CHECK_COMPANIES,
        {
          identifier: forgotEmail,
        },
      );
      if (response?.data?.status && response?.data?.data) {
        const companiesData = response.data.data;
        if (companiesData.length === 0) {
          showToast("error", "No user found with that email");
        } else if (companiesData.length === 1) {
          // Only one company found: send reset link immediately
          await sendResetLink(forgotEmail, companiesData[0].companyId);
          setResetSuccess(true);
        } else {
          // Multiple companies found: show modal to select one.
          setCompanies(companiesData);
          setShowModal(true);
          setForceModal(true);
        }
      } else {
        showToast("error", "Something went wrong");
      }
    } catch (err) {
      console.error(err);
      showToast(
        "error",
        err?.response?.data?.message || "Something went wrong",
      );
    } finally {
      setLoading(false);
    }
  };

  // ✅ Handle 2FA success
  const handle2FASuccess = async (data) => {
    console.log("✅ 2FA verification successful:", data);

    try {
      // ✅ Extract tokens from 2FA response
      const accessToken = data.accessTokenData?.accessToken;
      const refreshToken = data.accessTokenData?.refreshToken;

      if (!accessToken || !refreshToken) {
        console.error("❌ Missing tokens in 2FA response");
        showToast("error", "Authentication failed. Please try again.");
        setShow2FA(false);
        setTwoFAData(null);
        return;
      }

      // ✅ Store corporate tokens (same as normal login)
      storeUserTypeTokens(accessToken, refreshToken, "corporate");

      // ✅ Store in localStorage for persistence
      storeLastActiveUserTokens(accessToken, refreshToken, "corporate");

      // ✅ Set as active user
      setActiveUserType("corporate");

      // ✅ Prepare Redux data
      const updatedData = {
        userId: data.userDetails._id,
        companyId: data.companyDetails._id,
        loggedInDetails: data,
        tabId: getTabId(),
        userType: "corporate",
      };

      // ✅ Update Redux store
      dispatch(loginUser(updatedData));

      console.log("✅ Tokens stored and Redux updated after 2FA");

      // ✅ Close 2FA modal
      setShow2FA(false);
      setTwoFAData(null);

      try {
        console.log("🔄 Initializing store after login...");
        await initializeStore();
        console.log("✅ Store initialized successfully");
      } catch (error) {
        console.error("❌ Error initializing store after login:", error);
        // Continue even if initialization fails
      }

      // ✅ Determine redirect route
      const userData = data.rolesModulesAndPermissions || [];
      let firstModuleRoute = "/corporate/auth/booking";

      if (userData.length > 0) {
        const firstModuleId = userData[0].moduleId;
        if (MODULE_ROUTES[firstModuleId]) {
          firstModuleRoute = MODULE_ROUTES[firstModuleId].route;
        }
      }

      // ✅ Redirect to appropriate page
      await router.push(firstModuleRoute);

      showToast("success", "Login successful!");
    } catch (error) {
      console.error("❌ Error handling 2FA success:", error);
      showToast("error", "Failed to complete login. Please try again.");
      setShow2FA(false);
      setTwoFAData(null);
    }
  };

  // ✅ Handle 2FA cancel
  const handle2FACancel = () => {
    setShow2FA(false);
    setTwoFAData(null);
    showToast("info", "Login cancelled. Please try again.");
  };

  // Handler to send reset link with email and selected companyId
  const sendResetLink = async (email, companyId) => {
    setLoading(true);
    try {
      const payload = { email, companyId };
      const response = await axios.post(
        config.CORPORATE.FORGOT_PASSWORD_RESET,
        payload,
      );
      if (response?.data && response?.data?.status) {
        showToast("success", "Password reset link sent to your email!");
      } else {
        showToast(
          "error",
          response?.data?.message || "Failed to send reset link",
        );
      }
    } catch (err) {
      showToast(
        "error",
        err?.response?.data?.message || "Something went wrong",
      );
    } finally {
      setLoading(false);
    }
  };

  // Handler when user selects a company from the modal
  const handleSelectCompany = async (company) => {
    // When a company is selected, hide the modal and send the reset link
    setSelectedCompany(company);
    setShowModal(false);
    setForceModal(false);
    if (showForgotPassword) {
      await sendResetLink(forgotEmail, company.companyId);
      setResetSuccess(true);
    }
  };

  // Prevent modal from closing unless a company is selected.
  const handleModalCloseAttempt = () => {
    if (forceModal) {
      showToast(
        "info",
        showForgotPassword
          ? "Please select a company to reset your password"
          : "Please select a company to login",
      );
      setShowModal(true);
    } else {
      setShowModal(false);
    }
  };

  const handleChangeCompany = () => {
    setShowModal(true);
    setForceModal(true);
  };

  const handleResendOTP = async () => {
    const isValid = validator.allValid();
    if (!isValid) {
      // Show validation messages
      validator.showMessages();
      // Force an update to show the messages
      setValidationTrigger((prev) => !prev);
      return;
    }
    try {
      const payload = {
        loginId: emailOrMobile,
        otpType: "resend",
        otpNumber: "",
        loginType: "OTP",
        // email: null,
        password: null,
      };

      const loginResponse = await corporateLogin(payload);
      if (loginResponse) {
        setResendEmailOrMobile(payload.loginId);
        setIsOtpSuccess(true);
        setShowResend(true);
        setOtp("");
        setTimer(60);
      }
    } catch (error) {
      console.log("Error in Resending OTP...", error);
      showToast(
        "error",
        error.response.data.message ||
          "something went wrong, please try again later",
      );
    }
  };

  const hanleOnSignup = async () => {
    setPageLoading(true);
    await router.push("/corporate/loginPage/Signup");
    setPageLoading(false);
  };

  const handleSetOtp = (otp) => {
    setOtp(otp);
    if (otp.length === 6) {
      handleLogin(null, otp);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      handleLogin(e);
    }
  };

  const redirectBooking = async () => {
    await router.push("/corporate");
  };

  return (
    <>
      <Head>
        <title>Login</title>
      </Head>
      {pageLoading ? (
        <Loader />
      ) : (
        <div className="bg-[#333] bg-gradie bg-custom-gradient">
          <div className="w-full h-screen flex flex-col sm:flex-row p-2 ">
            <div className="flex w-full sm:w-2/4 mt-[15%] sm:mt-0">
              <div className="hidden sm:flex items-start">
                <Image
                  onClick={redirectBooking}
                  src={corpLogo}
                  alt="Logo"
                  width={180}
                  className="cursor-pointer "
                />
              </div>
              <div className="flex flex-col justify-center items-center sm:items-start w-full sm:w-fit">
                <span className="text-lg font-light text-[#D5b300] mb-3">
                  WeynGo.Corporate for Business Travel
                </span>
                <span className="text-xl sm:text-4xl font-extralight text-white mb-1 sm:mb-2">
                  Easy . Quick . Managed
                </span>
                <span className="text-xl sm:text-4xl font-semibold  text-white ">
                  Corporate Travel
                </span>
              </div>
              <div className="hidden sm:flex justify-between w-fit sm:w-[50%] px-[10%] gap-2 sm:gap-0 sm:px-[15%] pb-2 absolute bottom-0">
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
            <div
              className={`w-full sm:w-2/5 h-fit bg-white rounded-sm sm:rounded-lg p-2 mx-0 sm:mx-4 pb-3 
             fixed bottom-0 left-0 sm:static sm:my-[8%] sm:block rounded-t-lg
             shadow-lg transform transition-transform duration-300 
             ${pageLoading ? "translate-y-full" : "translate-y-0"}`}
            >
              {
                // resetSuccess ? (
                //   <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-4">
                //     <h1 className="text-2xl font-bold mb-4">Success</h1>
                //     <p>Password reset link has been sent to your email.</p>
                //     <button
                //       onClick={() => router.push("/corporate/login")}
                //       className="mt-4 px-4 py-2 bg-blue-500 text-white rounded"
                //     >
                //       Back to Login
                //     </button>
                //   </div>
                // ) :
                showForgotPassword ? (
                  <div className="p-4">
                    <h2 className="text-2xl font-bold mb-4">Forgot Password</h2>
                    <div className="relative w-full h-10 mb-4">
                      <input
                        type="email"
                        name="forgotEmail"
                        value={forgotEmail}
                        onChange={(e) => setForgotEmail(e.target.value)}
                        placeholder="Enter the organization's email"
                        className="block px-2.5 pb-2.5 pt-2.5 w-full text-sm text-gray-900 bg-transparent rounded-lg border border-gray-300 focus:outline-none focus:ring-0 focus:border-[#028fa3]"
                      />

                      <label
                        htmlFor="forgotEmail"
                        className="absolute text-sm text-gray-500 duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-white px-2 peer-focus:text-[#028fa3] peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2"
                      >
                        Email<span className="text-red-500 ml-1">*</span>
                      </label>

                      <div className="text-red-500 text-xs mt-1">
                        {validator.message(
                          "forgotEmail",
                          forgotEmail,
                          "required|email|forgotEmail",
                        )}
                      </div>
                    </div>
                    <button
                      onClick={handleResetPassword}
                      className="w-full rounded-lg bg-[#028fa3] text-white p-2 mt-3"
                      disabled={loading}
                    >
                      {loading ? (
                        <FontAwesomeIcon icon={faSpinner} spin />
                      ) : (
                        "Reset Password"
                      )}
                    </button>
                    <div className="mt-4 text-center">
                      <button
                        onClick={handleToggleForgotPassword}
                        className="underline text-[#028fa3] text-sm"
                      >
                        Back to Login
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="p-4">
                      <span className="text-3xl font-bold">Log in</span>

                      {/* {!isOtpSuccess && ( */}
                      <div className="w-full mt-5">
                        <div className="relative w-full min-w-[50px] h-10">
                          <input
                            type="text"
                            id="emailOrMobile"
                            name="emailOrMobile"
                            className="block px-2.5 pb-2.5 pt-2.5 w-full text-base text-gray-900 bg-transparent rounded-lg border-1 border-gray-300 appearance-none dark:text-black dark:border-gray-600 dark:focus:border-[#028fa3] focus:outline-none focus:ring-0 focus:border-[#028fa3]-600 peer"
                            placeholder=" "
                            value={emailOrMobile}
                            onChange={(e) => setEmailOrMobile(e.target.value)}
                            onKeyDown={handleKeyDown}
                          />
                          <label
                            htmlFor="emailOrMobile"
                            className="absolute text-base text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-white dark:bg-gray-900 px-2 peer-focus:px-2 peer-focus:text-[#028fa3] peer-focus:dark:text-[#028fa3] peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto start-1"
                          >
                            Work Email/Mobile Number
                            <span className="text-red-500 absolute  right-[-5px] m-1 mt-0">
                              *
                            </span>
                          </label>
                          <div className="text-red-500 text-xs mt-1">
                            {validator.message(
                              "emailOrMobile",
                              emailOrMobile,
                              "required|emailOrMobile",
                            )}
                          </div>
                        </div>
                        {selectedCompany &&
                          (loginType === "password" || loginType === "otp") &&
                          companies.length > 1 && (
                            <div className="flex items-center mt-2 text-sm text-gray-600">
                              <span>
                                Company: {selectedCompany.companyName} (
                                {selectedCompany.companyGST})
                              </span>
                              <button
                                onClick={handleChangeCompany}
                                className="ml-2 p-1 text-gray-600 hover:text-gray-800 transition-colors duration-200 rounded-full hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                                aria-label="Change company"
                              >
                                <FontAwesomeIcon
                                  icon={faPencil}
                                  className="text-sm"
                                />
                              </button>
                            </div>
                          )}
                      </div>
                      {/* )} */}

                      {loginType === "otp" ? (
                        <>
                          {isOtpSuccess && (
                            <>
                              <div className="flex items-center mt-4 text-green-600">
                                <FontAwesomeIcon
                                  icon={faCheckCircle}
                                  className="mr-2"
                                />
                                <p className="text-sm">
                                  We have sent an OTP to your mobile
                                  number/email {resendEmailOrMobile}
                                  <button
                                    onClick={handleEditOtpMobileNumber}
                                    className="ml-2 p-1 text-gray-600 hover:text-gray-800 transition-colors duration-200 rounded-full hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                                    aria-label="Edit mobile number or email"
                                  >
                                    <FontAwesomeIcon
                                      icon={faPencil}
                                      className="text-sm"
                                    />
                                  </button>
                                </p>
                              </div>
                              <div className="mt-4">
                                <OtpInput
                                  value={otp}
                                  onChange={handleSetOtp}
                                  numInputs={6}
                                  renderSeparator={
                                    <span className="w-4 ml-3 mr-1"> - </span>
                                  }
                                  renderInput={(props, index) => (
                                    <input {...props} autoFocus={index === 0} />
                                  )}
                                  inputStyle={{
                                    border: "1px solid gray",
                                    borderRadius: "8px",
                                    width: "30px",
                                    height: "40px",
                                    fontSize: "12px",
                                    color: "#000",
                                    fontWeight: "400",
                                    caretColor: "blue",
                                  }}
                                  focusStyle={{
                                    border: "1px solid #CFD3DB",
                                    outline: "none",
                                  }}
                                />
                              </div>

                              {showResend ? (
                                <div className="flex flex-col items-center mt-4">
                                  <p className="text-sm text-red-600 mb-2">
                                    Resend OTP in {timer} seconds
                                  </p>
                                </div>
                              ) : (
                                <div className="flex flex-col items-center mt-4">
                                  <p className="text-sm text-gray-600 mb-2">
                                    Didn{"'"}t receive OTP?
                                  </p>
                                  <button
                                    className={`text-[#028fa3] hover:text-[#026e8a] hover:underline font-semibold focus:outline-none ${
                                      !emailOrMobile
                                        ? "opacity-50 cursor-not-allowed"
                                        : ""
                                    }`}
                                    onClick={handleResendOTP}
                                    disabled={!emailOrMobile}
                                  >
                                    Resend OTP
                                  </button>
                                </div>
                              )}
                            </>
                          )}

                          <div className="w-full flex font-normal text-[#030F0C] justify-center mt-4">
                            or
                          </div>

                          <div
                            className="w-full flex justify-center underline text-[#028fa3] text-xs font-normal mt-3 cursor-pointer hover:text-[#028fa3]"
                            onClick={() => handleLoginType("password")}
                          >
                            Login via Password
                          </div>
                        </>
                      ) : (
                        <>
                          <div>
                            <div className="w-full mt-4">
                              <div className="relative w-full min-w-[50px] h-10">
                                <input
                                  className="block px-2.5 pb-2.5 pt-2.5 w-full text-base text-gray-900 bg-transparent rounded-lg border-1 border-gray-300 appearance-none dark:text-black dark:border-gray-600 dark:focus:border-[#028fa3] focus:outline-none focus:ring-0 focus:border-[#028fa3]-600 peer"
                                  placeholder=" "
                                  type={type}
                                  id="password"
                                  name="password"
                                  value={password}
                                  onChange={(e) => setPassword(e.target.value)}
                                  onKeyDown={handleKeyDown}
                                  autoComplete="current-password"
                                />

                                <label
                                  for="password"
                                  className="absolute text-base text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-white dark:bg-gray-900 px-2 peer-focus:px-2 peer-focus:text-[#028fa3] peer-focus:dark:text-[#028fa3] peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto start-1"
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
                                    onClick={handleToggle}
                                  >
                                    <FontAwesomeIcon icon={icon} />
                                  </button>
                                </div>
                                <div className="text-red-500 text-xs mt-1">
                                  {loginType !== "otp" &&
                                    validator.message(
                                      "password",
                                      password,
                                      "required|password",
                                    )}
                                </div>
                              </div>
                            </div>
                          </div>
                          <div
                            className="w-full flex justify-center underline text-[#028fa3] text-xs font-normal mt-3 cursor-pointer hover:text-[#028fa3]"
                            onClick={() => handleLoginType("otp")}
                          >
                            Login via OTP
                          </div>
                        </>
                      )}
                    </div>

                    <button
                      onClick={handleLogin}
                      type="submit"
                      className="w-[50%] rounded-lg bg-[#028fa3] mx-[25%] text-white p-2 mt-3"
                      disabled={loading}
                    >
                      {loading ? (
                        <FontAwesomeIcon icon={faSpinner} spin />
                      ) : !isOtpSuccess ? (
                        "Login"
                      ) : (
                        "Verify"
                      )}
                    </button>

                    <button
                      onClick={hanleOnSignup}
                      className="w-[50%] underline text-gray-400 text-xs sm:text-base mx-[25%] mt-3 hover:text-[#028fa3]"
                    >
                      Don{"'"}t have an account? SIGNUP
                    </button>

                    <div className="w-full flex justify-center mt-3">
                      <button
                        onClick={handleToggleForgotPassword}
                        className="underline text-[#028fa3] text-sm"
                      >
                        Forgot Password?
                      </button>
                    </div>
                  </>
                )
              }

              {showModal && (
                <div
                  className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50"
                  onClick={handleModalCloseAttempt}
                >
                  <div
                    className="bg-white rounded-lg p-6 w-96 overflow-y-auto max-h-[400px]"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <h2 className="text-xl font-bold mb-4">
                      Select Your Company
                    </h2>
                    <p className="mb-4">
                      Your email is registered with multiple companies. Please
                      select one to{" "}
                      {showForgotPassword ? "reset your password" : "login"}.
                    </p>
                    <ul>
                      {companies.map((company) => (
                        <li key={company.companyId} className="mb-2 ">
                          <button
                            onClick={() => handleSelectCompany(company)}
                            className="w-full text-left px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded"
                          >
                            {company.companyName} ({company.companyGST})
                          </button>
                        </li>
                      ))}
                    </ul>
                    {/* No close button is provided, so the modal remains visible until a company is selected */}
                  </div>
                </div>
              )}

              <div className="flex sm:hidden w-full items-center justify-center mt-3">
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
                    <span className="text-black text-sm underline">
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
                    <span className="text-black text-sm underline">
                      +91 7411940701
                    </span>
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* ✅ 2FA Modal */}
          {show2FA && twoFAData && (
            <TwoFactorAuth
              userEmail={twoFAData.email}
              userPhone={twoFAData.mobile}
              userId={twoFAData.userId}
              companyId={twoFAData.companyId}
              availableMethods={twoFAData.availableMethods}
              defaultMethod={twoFAData.defaultMethod}
              maskedEmail={twoFAData.maskedEmail}
              maskedPhone={twoFAData.maskedPhone}
              onSuccess={handle2FASuccess}
              onCancel={handle2FACancel}
            />
          )}
        </div>
      )}
    </>
  );
}
