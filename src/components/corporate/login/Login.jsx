import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import "tailwindcss/tailwind.css";
import loginPop from "@/images/corporate/loginpop.png";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faEnvelope,
  faPhone,
  faXmark,
  faEye,
  faEyeSlash,
  faCheckCircle,
  faSpinner,
  faPencil,
} from "@fortawesome/free-solid-svg-icons";
import OtpInput from "react-otp-input";
import useFormValidator from "@/hooks/useFormValidator";
import { corporateLogin } from "@/utils/axios/axios";
import showToast from "@/utils/toast";
import { useRouter } from "next/router";

const LoginModal = ({ isOpen, onClose, onSignup }) => {
  const router = useRouter();
  const popupRef = useRef(null);
  const [isOtp, setIsOtp] = useState(false);
  const [password, setPassword] = useState("");
  const [type, setType] = useState("password");
  const [icon, setIcon] = useState(faEyeSlash);

  const [otp, setOtp] = useState("");
  const [emailOrMobile, setEmailOrMobile] = useState("");
  const [validationTrigger, setValidationTrigger] = useState(false);
  const [loginType, setLoginType] = useState("password");
  const [isOtpSuccess, setIsOtpSuccess] = useState(false);
  const [showResend, setShowResend] = useState(false);
  const [timer, setTimer] = useState(30);
  const [resendEmailOrMobile, setResendEmailOrMobile] = useState("");
  const [loading, setLoading] = useState(false);

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

  // stop and resume scrolling on opening and closing of popup
  useEffect(() => {
    const handleBodyScroll = () => {
      document.body.style.overflow = isOpen ? "hidden" : "auto";
    };

    handleBodyScroll();
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [isOpen]);

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
        console.log(value);
        return loginType === "password" && value.length > 0;
      },
      required: loginType === "password",
    },
  };

  const [validator, updateValidator] = useFormValidator(
    customMessages,
    customRules
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
    };
    updateValidator(customMessages, customRules);
  };

  useEffect(() => {
    updateRules(loginType);
  }, [loginType]);

  const handleOtpToggle = () => {
    setIsOtp(!isOtp);
  };

  const handleToggle = () => {
    if (type === "password") {
      setIcon(faEye);
      setType("text");
    } else {
      setIcon(faEyeSlash);
      setType("password");
    }
  };

  const handleLoginType = (loginType) => {
    setLoginType(loginType);
  };

  const handleEditOtpMobileNumber = () => {
    setIsOtpSuccess(false);
    setLoginType("otp");
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
          payload = {
            loginId: emailOrMobile,
            otpType: !isOtpSuccess ? "New" : "valid",
            otpNumber: updatedOtp ? updatedOtp : "",
            loginType: "OTP",
            password: null,
          };
        } else if (loginType === "password") {
          payload = {
            loginId: emailOrMobile,
            otpType: !isOtpSuccess ? "New" : "valid",
            otpNumber: updatedOtp ? updatedOtp : "",
            loginType: "password",
            password: password,
          };
        }
        const loginResponse = await corporateLogin(payload);
        if (loginResponse && payload.otpType === "New" && loginType === "otp") {
          setIsOtpSuccess(true);
          setResendEmailOrMobile(payload.loginId);
        } else if (
          loginResponse &&
          (loginType === "otp" || loginType === "password")
        ) {
          await router.push("/corporate/auth/booking");
          onClose();
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
          "something went wrong, please try again later"
      );
    } finally {
      setLoading(false);
    }
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
        setTimer(30);
      }
    } catch (error) {
      console.log("Error in Resending OTP...", error);
      showToast(
        "error",
        error.response.data.message ||
          "something went wrong, please try again later"
      );
    }
  };

  const hanleOnSignup = () => {
    onClose();
    onSignup();
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

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-gray-600  bg-opacity-50 overflow-y-auto h-screen w-screen z-50">
        <div
          className="relative top-20 flex mx-auto w-2/3 h-3/4 shadow-lg rounded-md bg-white"
          ref={popupRef}
        >
          <div className="w-1/2 h-full">
            <Image
              src={loginPop}
              alt="loginpop image"
              className="w-full h-full rounded-md"
            />
            <div className="flex justify-between w-1/2 px-20 pb-2 absolute bottom-0">
              <div className="flex gap-1 items-center">
                <FontAwesomeIcon
                  icon={faEnvelope}
                  color="#028fa3"
                  fontSize={10}
                  className="p-1 bg-white rounded-full"
                />
                <span className="text-white text-sm">info@qugo.io</span>
              </div>
              <div className="flex gap-1 items-center">
                <FontAwesomeIcon
                  icon={faPhone}
                  color="#028fa3"
                  fontSize={10}
                  className="p-1 bg-white rounded-full"
                />
                <span className="text-white text-sm">+91 7411940701</span>
              </div>
            </div>
          </div>
          <div className="w-1/2 h-full p-3">
            <div className="w-full flex justify-end">
              <button
                className="p-0.5 px-2 bg-gray-400 rounded-full"
                onClick={onClose}
              >
                <FontAwesomeIcon icon={faXmark} color="#ffffff" />
              </button>
            </div>
            <div className="px-4">
              <span className="text-3xl font-bold">Log in</span>
              {!isOtpSuccess && (
                <div className="w-full mt-5">
                  <div className="relative w-full min-w-[50px] h-10">
                    <input
                      type="text"
                      id="emailOrMobile"
                      name="emailOrMobile"
                      className="block px-2.5 pb-2.5 pt-2.5 w-full text-sm text-gray-900 bg-transparent rounded-lg border-1 border-gray-300 appearance-none dark:text-black dark:border-gray-600 dark:focus:border-[#028fa3] focus:outline-none focus:ring-0 focus:border-[#028fa3]-600 peer"
                      placeholder=" "
                      value={emailOrMobile}
                      onChange={(e) => setEmailOrMobile(e.target.value)}
                      onKeyDown={handleKeyDown}
                    />
                    <label
                      htmlFor="emailOrMobile"
                      className="absolute text-sm text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-white dark:bg-gray-900 px-2 peer-focus:px-2 peer-focus:text-[#028fa3] peer-focus:dark:text-[#028fa3] peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto start-1"
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
                        "required|emailOrMobile"
                      )}
                    </div>
                  </div>
                </div>
              )}

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
                          We have sent an OTP to your mobile number/email{" "}
                          {resendEmailOrMobile}
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

                  <button
                    className="w-full flex justify-center mt-4 underline text-[#028fa3] text-xs"
                    onClick={() => handleLoginType("password")}
                  >
                    Login via Password
                  </button>
                </>
              ) : (
                <>
                  <div className="w-full mt-4">
                    <div className="relative w-full min-w-[50px] h-10">
                      <input
                        id="password"
                        className="block px-2.5 pb-2.5 pt-2.5 w-full text-sm text-gray-900 bg-transparent rounded-lg border-1 border-gray-300 appearance-none dark:text-black dark:border-gray-600 dark:focus:border-[#028fa3] focus:outline-none focus:ring-0 focus:border-[#028fa3]-600 peer"
                        placeholder=" "
                        type={type}
                        name="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        onKeyDown={handleKeyDown}
                        autoComplete="current-password"
                      />

                      <label
                        htmlFor="password"
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
                            "required|password"
                          )}
                      </div>
                    </div>
                  </div>

                  <div className="w-full flex justify-center mt-4">OR</div>
                </>
              )}

              <button
                onClick={handleLogin}
                type="submit"
                className="w-full rounded-lg bg-[#028fa3] text-white p-2 mt-3"
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
                className="w-full underline text-gray-400 mt-3 hover:text-[#028fa3]"
              >
                Don{"'"}t have a account? SIGNUP
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default LoginModal;
