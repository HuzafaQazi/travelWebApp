import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faEye,
  faEyeSlash,
  faSpinner,
} from "@fortawesome/free-solid-svg-icons";
import { useEffect, useState } from "react";
import pako from "pako";
import { handleActivate, storeUserDetails } from "@/utils/axios/axios";
import showToast from "@/utils/toast";
import { useRouter } from "next/router";
import useFormValidator from "@/hooks/useFormValidator";
import config from "@/config";
import axios from "@/utils/axios/axios";
import { initializeStore } from "@/store/initializeStore";

const ActivateModal = ({ encodedData, isOpen, onClose, onSignup }) => {
  const router = useRouter();

  const [icon, setIcon] = useState(faEyeSlash);
  const [type, setType] = useState("password");

  const [icon1, setIcon1] = useState(faEyeSlash);
  const [type1, setType1] = useState("password");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [employeeData, setEmployeeData] = useState(null);
  const [validationTrigger, setValidationTrigger] = useState(false);
  const [loading, setLoading] = useState(false);

  const customMessages = {
    required: "This field is required.",
    in: "Password does not match.",
  };

  const customRules = {};

  const [validator] = useFormValidator(customMessages, customRules);

  useEffect(() => {
    if (encodedData) {
      const binaryString = atob(
        encodedData.replace(/_/g, "/").replace(/-/g, "+"),
      ); // Base64 decode
      const byteArray = Uint8Array.from(binaryString, (char) =>
        char.charCodeAt(0),
      );
      const decompressed = pako.inflate(byteArray, { to: "string" });

      const data = JSON.parse(decompressed);
      console.log("decoded data ", data);
      setEmployeeData(data);
    }
  }, [encodedData]);

  const handleToggle = () => {
    if (type === "password") {
      setIcon(faEye);
      setType("text");
    } else {
      setIcon(faEyeSlash);
      setType("password");
    }
  };

  const handlePasswordActivate = async () => {
    try {
      const isValid = validator.allValid();
      if (!isValid) {
        validator.showMessages();
        // Force an update to show the messages
        setValidationTrigger((prev) => !prev);
        return;
      }

      setLoading(true);

      const payload = {
        loginId: employeeData?.email,
        employeeId: employeeData?.empId,
        loginType: "password",
        password: password,
        confirmPassword: confirmPassword,
        otpType: "new",
        otpNumber: "",
      };
      const response = await handleActivate(payload);
      console.log("activateresponse ", response);
      if (response === "USER_ACTIVE") {
        showToast("success", "User is already active, redirecting to login");
        await router.push("/corporate/loginPage/Login");
      } else if (response === "USER_NOT_FOUND") {
        showToast("error", "User not found, please login again");
        await router.push("/corporate");
      } else {
        await router.push("/corporate/loginPage/Verification");
      }
    } catch (error) {
      console.error("error activating account", error);
      showToast(
        "error",
        error?.response?.data?.Error?.ErrorMessage?.Error ??
          "Something went wrong",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPasswordActivate = async () => {
    try {
      const isValid = validator.allValid();
      if (!isValid) {
        validator.showMessages();
        setValidationTrigger((prev) => !prev);
        return;
      }
      setLoading(true);
      const payload = {
        token: employeeData?.resetToken,
        password: password,
        confirmPassword: confirmPassword,
      };
      const response = await axios.post(
        config.CORPORATE.FORGOT_PASSWORD_CONFIRM,
        payload,
      );
      console.log("forgot password response", response);
      if (response?.data && response?.data?.status === true) {
        showToast("success", "Password set successfully, please login");
        // try {
        //   console.log("🔄 Initializing store after login...");
        //   await initializeStore();
        //   console.log("✅ Store initialized successfully");
        // } catch (error) {
        //   console.error("❌ Error initializing store after login:", error);
        //   // Continue even if initialization fails
        // }
        await router.push("/corporate/loginPage/Login");
      } else {
        showToast("error", "Failed to set password");
      }
    } catch (error) {
      console.error("Error in handleForgotPasswordActivate", error);
      showToast(
        "error",
        error?.response?.data?.message || "Something went wrong",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleToggle1 = () => {
    if (type1 === "password") {
      setIcon1(faEye);
      setType1("text");
    } else {
      setIcon1(faEyeSlash);
      setType1("password");
    }
  };

  useEffect(() => {
    const handleBodyScroll = () => {
      document.body.style.overflow = encodedData ? "hidden" : "auto";
    };

    handleBodyScroll();
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [encodedData]);

  if (!encodedData) return null;

  return (
    <>
      <div className="w-full h-full p-3">
        <div
          className={
            employeeData?.resetToken
              ? "text-[#171A19] font-bold text-2xl"
              : "text-[#171A19] font-semibold text-xl"
          }
        >
          {employeeData?.resetToken
            ? "Reset Your Qugo Corporate Password"
            : "Activate your Qugo Corporate account"}
        </div>
        <div className="text-[#028FA3] font-semibold text-base">
          {employeeData?.email}
        </div>

        <div>
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
                // onKeyDown={handleKeyDown}
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

              <div className="text-red-500 text-xxs mt-1">
                {validator.message(
                  "password",
                  password,
                  "required|min:6|max:30",
                )}
              </div>
            </div>
          </div>
          <div className="w-full mt-4">
            <div className="relative w-full min-w-[50px] h-10">
              <input
                id="confirmpassword"
                className="block px-2.5 pb-2.5 pt-2.5 w-full text-sm text-gray-900 bg-transparent rounded-lg border-1 border-gray-300 appearance-none dark:text-black dark:border-gray-600 dark:focus:border-[#028fa3] focus:outline-none focus:ring-0 focus:border-[#028fa3]-600 peer"
                placeholder=" "
                type={type1}
                name="confirmpassword"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                // onKeyDown={handleKeyDown}
                autoComplete="current-password"
              />

              <label
                htmlFor="confirmpassword"
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
                  onClick={handleToggle1}
                >
                  <FontAwesomeIcon icon={icon1} />
                </button>
              </div>

              <div className="text-red-500 text-xxs mt-1">
                {validator.message(
                  "confirmPassword",
                  confirmPassword,
                  `required|in:${password}`,
                )}
              </div>
            </div>
          </div>
          <button
            type="submit"
            className="w-full rounded-lg bg-[#028fa3] text-white p-2 mt-8"
            onClick={
              employeeData?.resetToken
                ? handleForgotPasswordActivate
                : handlePasswordActivate
            }
          >
            {loading ? (
              <FontAwesomeIcon icon={faSpinner} className="animate-spin" />
            ) : employeeData?.resetToken ? (
              "Reset Password"
            ) : (
              "Continue"
            )}
          </button>
        </div>
      </div>
    </>
  );
};

export default ActivateModal;
