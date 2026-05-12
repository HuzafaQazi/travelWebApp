import Image from "next/image";
import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { toast } from "react-toastify";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEdit } from "@fortawesome/free-solid-svg-icons";
import { getAnalytics, logEvent } from "firebase/analytics";
import OTPInput from "react-otp-input";
import "react-toastify/dist/ReactToastify.css";

import style from "./styles.module.css";
import bagimage from "../../../public/img/bagPackageDetailsPage.png";
import config from "@/config";
import { app, analytics } from "../../../utils/firebase";
import { useLogin } from "@/store/context/LoginContext";
import axios, { qugoLogin } from "@/utils/axios/axios";
import showToast from "@/utils/toast";

export default function Signin({ closePopup }) {
  const router = useRouter();
  const { setAccessToken } = useLogin();

  // Form state
  const [mobileNumber, setMobileNumber] = useState("");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [isInternational, setIsInternational] = useState(false);

  // UI state
  const [showOTP, setShowOTP] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // Loading states
  const [isLoading, setIsLoading] = useState(false);
  const [isVerifyingLoading, setIsVerifyingLoading] = useState(false);
  const [isResendLoading, setIsResendLoading] = useState(false);

  // Button states
  const [buttonDisabled, setButtonDisabled] = useState(false);
  const [resendDisabled, setResendDisabled] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);

  // ============================================
  // AUTO-SUBMIT OTP WHEN 6 DIGITS ENTERED
  // ============================================
  useEffect(() => {
    if (otp.length === 6 && !isVerifyingLoading && !buttonDisabled) {
      // Small delay to allow user to see the last digit
      const timer = setTimeout(() => {
        handleVerifyOTP();
      }, 300);

      return () => clearTimeout(timer);
    }
  }, [otp]);

  // ============================================
  // TIMER EFFECT
  // ============================================
  useEffect(() => {
    if (resendTimer > 0) {
      const interval = setInterval(() => {
        setResendTimer((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(interval);
    } else {
      setResendDisabled(false);
    }
  }, [resendTimer]);

  // ============================================
  // VALIDATION
  // ============================================
  const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const validateForm = () => {
    setErrorMsg("");

    if (!isInternational) {
      // Domestic users - mobile only
      if (mobileNumber.length < 10) {
        setErrorMsg("Please enter 10 digit mobile number");
        logEvent(analytics, "invalid_mobile_number", {});
        return false;
      }
    } else {
      // International users - mobile + email
      if (mobileNumber.trim() === "") {
        setErrorMsg("Please enter your mobile number");
        return false;
      }
      if (email.trim() === "") {
        setErrorMsg("Please enter your email address");
        return false;
      }
      if (!validateEmail(email)) {
        setErrorMsg("Please enter a valid email address");
        return false;
      }
    }

    return true;
  };

  // ============================================
  // LOGIN - REQUEST OTP
  // ============================================
  const handleLogin = async () => {
    if (buttonDisabled) return;

    setButtonDisabled(true);
    setIsLoading(true);
    setOtp("");

    if (!validateForm()) {
      setIsLoading(false);
      setButtonDisabled(false);
      return;
    }

    try {
      logEvent(analytics, "login_button_click", { isInternational });

      const requestBody = isInternational
        ? {
            mobile: mobileNumber,
            email: email,
            isInternational: true,
            otpType: "new",
            otpNumber: "",
          }
        : email.trim()
        ? {
            mobile: mobileNumber,
            email: email,
            otpType: "new",
            otpNumber: "",
          }
        : {
            mobile: mobileNumber,
            otpType: "new",
            otpNumber: "",
          };

      const response = await axios.post(config.REGISTER_USER, requestBody);

      if (response.data.statuscode === 200 && response.data.status) {
        setShowOTP(true);
        showToast("success","OTP sent successfully!");
      } else {
        setErrorMsg(response.data.message || "Failed to send OTP");
        showToast("error",response.data.message || "Failed to send OTP");
      }
    } catch (error) {
      console.error("Login error:", error);
      const errorMessage =
        error?.response?.data?.message || "Failed to send OTP";
      setErrorMsg(errorMessage);
      showToast("error",errorMessage);
    } finally {
      setIsLoading(false);
      setTimeout(() => setButtonDisabled(false), 3000);
    }
  };

  // ============================================
  // RESEND OTP
  // ============================================
  const handleResendOTP = async () => {
    if (resendDisabled) return;

    setIsResendLoading(true);
    setResendDisabled(true);

    try {
      const requestBody = isInternational
        ? {
            mobile: mobileNumber,
            email: email,
            isInternational: true,
            otpType: "resend",
            otpNumber: "",
          }
        : email.trim()
        ? {
            mobile: mobileNumber,
            email: email,
            otpType: "resend",
            otpNumber: "",
          }
        : {
            mobile: mobileNumber,
            otpType: "resend",
            otpNumber: "",
          };

      const response = await axios.post(config.REGISTER_USER, requestBody);

      if (response.data.statuscode === 200 && response.data.status) {
        setOtp("");
        setResendTimer(60);
        showToast("success","OTP has been resent successfully!");

        logEvent(analytics, "resend_otp_click", {
          mobileNumber,
          isInternational,
          success: true,
        });
      } else {
        setErrorMsg(response.data.message || "Failed to resend OTP");
        showToast("error",response.data.message || "Failed to resend OTP");
        setResendDisabled(false);
      }
    } catch (error) {
      console.error("Resend OTP error:", error);
      const errorMessage =
        error?.response?.data?.message || "Failed to resend OTP";
     showToast("error",errorMessage);
      setResendDisabled(false);
    } finally {
      setIsResendLoading(false);
    }
  };

  // ============================================
  // VERIFY OTP & LOGIN
  // ============================================
  const handleVerifyOTP = async () => {
    if (buttonDisabled || isVerifyingLoading) return;

    logEvent(analytics, "verify_click", { isInternational });

    if (otp.length < 6) {
      showToast("error","Please enter 6 digit OTP");
      return;
    }

    setButtonDisabled(true);
    setIsVerifyingLoading(true);

    try {
      const requestBody = isInternational
        ? {
            mobile: mobileNumber,
            email: email,
            isInternational: true,
            otpType: "valid",
            otpNumber: otp,
          }
        : email.trim()
        ? {
            mobile: mobileNumber,
            email: email,
            otpType: "valid",
            otpNumber: otp,
          }
        : {
            mobile: mobileNumber,
            otpType: "valid",
            otpNumber: otp,
          };

      // ✅ Use new qugoLogin function
      const userData = await qugoLogin(requestBody);

      if (userData) {
        // Update context
        setAccessToken(userData.accessToken);

        // Trigger FCM Custom Firebase
        window.dispatchEvent(new CustomEvent("userTypeChanged"));

        // Show success message
        showToast("success", `Welcome back, ${userData.firstName || "User"}!`);

        // Close popup
        closePopup(false);

        // Redirect if needed
        const redirectUrl = router.query.redirect;
        if (redirectUrl) {
          router.push(redirectUrl);
        }
      } else {
        throw new Error("Invalid OTP");
      }
    } catch (error) {
      console.error("Verify OTP error:", error);
      const errorMessage =
        error?.response?.data?.message || "Invalid OTP. Please try again.";
      showToast("error", errorMessage);

      logEvent(analytics, "invalid_otp", { isInternational });

      // Clear OTP on error so user can try again
      setOtp("");
    } finally {
      setIsVerifyingLoading(false);
      setTimeout(() => setButtonDisabled(false), 3000);
    }
  };

  // ============================================
  // KEYBOARD HANDLERS
  // ============================================
  const handleKeyPressLogin = (e) => {
    if (e.key === "Enter") {
      handleLogin();
    }
  };

  const handleKeyPressVerify = (e) => {
    if (e.key === "Enter" && otp.length === 6) {
      handleVerifyOTP();
    }
  };

  // ============================================
  // UI HANDLERS
  // ============================================
  const toggleInternationalUser = () => {
    setIsInternational(!isInternational);
    setErrorMsg("");
    setMobileNumber("");
    setEmail("");
  };

  const showLoginPage = () => {
    setShowOTP(false);
    setOtp("");
    setErrorMsg("");
  };

  // ============================================
  // HANDLE OTP CHANGE
  // ============================================
  const handleOTPChange = (value) => {
    // Only allow numeric characters
    const sanitized = value.replace(/\D/g, "").slice(0, 6);
    setOtp(sanitized);
  };

  // ============================================
  // RENDER
  // ============================================
  return (
    <div className={style.divblock}>
      {/* Image Section */}
      <div className={style.imagediv}>
        <Image
          className={style.bagImage}
          src={bagimage}
          alt="Travel illustration"
          width={200}
          height={350}
        />
      </div>

      {/* Login/OTP Section */}
      <div className={style.logindiv}>
        <div className={style.logincontent}>
          {showOTP ? (
            // ============================================
            // OTP VERIFICATION SCREEN
            // ============================================
            <div className={style.mobileverificationdiv}>
              <p className={style.title}>OTP Verification</p>

              <p
                className={style.titledescription}
                onClick={showLoginPage}
                style={{ cursor: "pointer" }}
              >
                {isInternational
                  ? `We have sent an OTP to your email ${email}`
                  : `We have sent an OTP on your mobile +91 ${mobileNumber}`}{" "}
                <FontAwesomeIcon
                  icon={faEdit}
                  className={style.editIcon}
                  onClick={showLoginPage}
                />
              </p>

              <p className={style.otptext}>One Time Password (OTP)</p>

              <OTPInput
                value={otp}
                onChange={handleOTPChange}
                numInputs={6}
                inputStyle={{ border: "none", borderBottom: "1px solid #000" }}
                renderSeparator={
                  <span className={style.otpSeparator}>
                    {"\u00A0\u00A0\u00A0\u00A0"}
                  </span>
                }
                renderInput={(props, index) => (
                  <input
                    className={style.otpInput}
                    {...props}
                    autoFocus={index === 0}
                    onKeyUp={handleKeyPressVerify}
                    disabled={isVerifyingLoading}
                  />
                )}
                containerStyle={{
                  display: "flex",
                  justifyContent: "flex-start",
                  marginTop: "10px",
                }}
                inputType="tel"
              />

              {/* Show verifying indicator when auto-submitting */}
              {isVerifyingLoading && (
                <p
                  className={style.verifyingText}
                  style={{
                    marginTop: "10px",
                    color: "#028fa3",
                    fontSize: "14px",
                  }}
                >
                  Verifying OTP...
                </p>
              )}

              <p className={style.resendotp}>
                Didn&apos;t receive the OTP?{" "}
                {resendTimer > 0 ? (
                  <span className={style.resendTimer}>
                    Resend in {resendTimer}s
                  </span>
                ) : (
                  <span
                    className="title-description"
                    style={{
                      color: resendDisabled ? "#aaa" : "rgba(2, 143, 163, 1)",
                      cursor: resendDisabled ? "default" : "pointer",
                      userSelect: "none",
                    }}
                    onClick={resendDisabled ? null : handleResendOTP}
                  >
                    {isResendLoading ? (
                      <div className={style.loadingSpinner} />
                    ) : (
                      "Resend OTP"
                    )}
                  </span>
                )}
              </p>

              <button
                className={style.loginbutton1}
                onClick={handleVerifyOTP}
                disabled={
                  buttonDisabled || otp.length < 6 || isVerifyingLoading
                }
              >
                {isVerifyingLoading ? (
                  <div className={style.loadingSpinner} />
                ) : (
                  "Verify"
                )}
              </button>
            </div>
          ) : (
            // ============================================
            // LOGIN SCREEN
            // ============================================
            <div>
              <p className={style.title}>Login</p>
              <p className={style.titledescription}>
                Access Your Travel Solutions, Anytime, Anywhere with Qugo!
              </p>

              {!isInternational ? (
                // Domestic Login
                <>
                  <input
                    className={style.logininput}
                    type="tel"
                    placeholder="Enter Mobile No."
                    inputMode="numeric"
                    pattern="[0-9]*"
                    value={mobileNumber}
                    onChange={(e) => setMobileNumber(e.target.value)}
                    onInput={(e) => {
                      e.target.value = e.target.value.replace(/[^0-9]/g, "");
                    }}
                    maxLength={10}
                    style={{ marginTop: "50%", marginBottom: "2%" }}
                    onKeyUp={handleKeyPressLogin}
                  />

                  <div
                    className={style.internationalOption}
                    onClick={toggleInternationalUser}
                  >
                    <p className={style.internationalText}>
                      Or for international users
                    </p>
                  </div>
                </>
              ) : (
                // International Login
                <>
                  <div
                    className={style.internationalFields}
                    style={{ marginTop: "30%" }}
                  >
                    <input
                      className={style.logininput}
                      type="email"
                      placeholder="Enter Email Address"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      onKeyUp={handleKeyPressLogin}
                      style={{ marginBottom: "15px" }}
                    />

                    <input
                      className={style.logininput}
                      type="tel"
                      placeholder="Enter Mobile No."
                      value={mobileNumber}
                      onChange={(e) => setMobileNumber(e.target.value)}
                      onKeyUp={handleKeyPressLogin}
                      style={{ marginBottom: "10px" }}
                    />

                    <p className={style.otpNote}>
                      Note: You will receive your OTP via email
                    </p>

                    <div
                      className={style.internationalOption}
                      onClick={toggleInternationalUser}
                    >
                      <p className={style.internationalText}>
                        Back to domestic login
                      </p>
                    </div>
                  </div>
                </>
              )}

              {errorMsg && <p className={style.errortext}>{errorMsg}</p>}

              <button
                className={style.loginbutton}
                onClick={handleLogin}
                disabled={buttonDisabled}
              >
                {isLoading ? (
                  <div className={style.loadingSpinner} />
                ) : (
                  "Request OTP"
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
