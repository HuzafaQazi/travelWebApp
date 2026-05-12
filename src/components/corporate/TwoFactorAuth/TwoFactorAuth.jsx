import { useState, useEffect, useRef } from "react";
import showToast from "@/utils/toast";
import { sendOTP, verifyOTP } from "@/utils/twoFactorAPI";

const TwoFactorAuth = ({
  userEmail,
  userPhone,
  userId,
  companyId,
  availableMethods = ["email"],
  defaultMethod = "email",
  maskedEmail = null,
  maskedPhone = null,
  onSuccess,
  onCancel,
}) => {
  // Determine which methods are actually available
  const hasEmail = availableMethods.includes("email");
  const hasPhone = availableMethods.includes("phone");

  const [selectedMethod, setSelectedMethod] = useState(defaultMethod);
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSendingOTP, setIsSendingOTP] = useState(false);
  const [otpSent, setOtpSent] = useState(true);
  const [timer, setTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);

  // ✅ Track masked contacts for each method
  const [maskedContacts, setMaskedContacts] = useState({
    email: maskedEmail,
    phone: maskedPhone,
  });

  // Refs for OTP inputs
  const inputRefs = useRef([]);

  // Timer countdown
  useEffect(() => {
    if (timer > 0) {
      const interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);

      return () => clearInterval(interval);
    } else if (timer === 0 && otpSent) {
      setCanResend(true);
    }
  }, [timer, otpSent]);

  // ✅ Handle method change - only when timer is 0
  const handleMethodChange = async (method) => {
    if (timer > 0 || isSendingOTP) {
      showToast(
        "info",
        "Please wait until the timer expires to switch methods"
      );
      return;
    }

    setSelectedMethod(method);
    setOtp(["", "", "", "", "", ""]);
    setCanResend(false);

    // ✅ Immediately send OTP for new method
    await handleSendOTP(method);
  };

  // Handle send OTP
  const handleSendOTP = async (method = selectedMethod) => {
    setIsSendingOTP(true);
    setOtpSent(false);
    setTimer(0);

    try {
      const result = await sendOTP(method, userId, companyId);

      if (result.success) {
        const maskedContact =
          method === "email"
            ? result.data?.maskedEmail
            : result.data?.maskedPhone;

        // ✅ Update masked contacts BEFORE showing toast
        setMaskedContacts((prev) => ({
          ...prev,
          [method]: maskedContact,
        }));

        showToast(
          "success",
          `Verification code sent to ${maskedContact || method}`
        );
        setOtpSent(true);
        setTimer(60);
        setCanResend(false);
      } else {
        showToast("error", result.message);
        setOtpSent(true); // Set to true to show resend option
      }
    } catch (error) {
      showToast("error", "Failed to send verification code");
      console.error("Send OTP error:", error);
      setOtpSent(true);
    } finally {
      setIsSendingOTP(false);
    }
  };

  // Handle resend OTP
  const handleResendOTP = async () => {
    setOtp(["", "", "", "", "", ""]);
    inputRefs.current[0]?.focus();

    await handleSendOTP();
  };

  // Handle OTP input change
  const handleOtpChange = (index, value) => {
    if (value && !/^\d$/.test(value)) {
      return;
    }

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  // Handle backspace
  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  // Handle paste
  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text/plain").trim();

    if (/^\d{6}$/.test(pastedData)) {
      const newOtp = pastedData.split("");
      setOtp(newOtp);
      inputRefs.current[5]?.focus();
    }
  };

  // Handle verify OTP
  const handleVerifyOTP = async () => {
    const otpCode = otp.join("");

    if (otpCode.length !== 6) {
      showToast("error", "Please enter complete 6-digit code");
      return;
    }

    setIsLoading(true);

    try {
      const result = await verifyOTP(
        otpCode,
        selectedMethod,
        userId,
        companyId
      );

      if (result.success) {
        showToast("success", "Verification successful!");
        onSuccess(result.data);
      } else {
        showToast("error", result.message);
        setOtp(["", "", "", "", "", ""]);
        inputRefs.current[0]?.focus();
      }
    } catch (error) {
      showToast("error", "Verification failed");
      console.error("Verify OTP error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // ✅ Get display text for selected method
  const getDisplayText = () => {
    // Show loading state while sending OTP for this method
    if (isSendingOTP) {
      return "Sending code...";
    }

    const maskedContact = maskedContacts[selectedMethod];

    // If we have the masked contact, show it
    if (maskedContact) {
      return maskedContact;
    }

    // Otherwise show generic text
    return selectedMethod === "email" ? "your email" : "your phone";
  };

  return (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-cyan-500 to-cyan-600 p-3">
          <h2 className="text-xl sm:text-2xl font-bold text-white">
            Two-Factor Authentication
          </h2>
          <p className="text-cyan-100 text-xs sm:text-sm mt-1">
            Enter the verification code to continue
          </p>
        </div>

        {/* Body */}
        <div className="p-2 sm:h-[500px] h-[400px] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-transparent">
          {/* Method Selection (only if both email and phone available) */}
          {hasEmail && hasPhone && (
            <div className="mb-6">
              <p className="text-xs sm:text-sm font-medium text-gray-700 mb-3">
                Send verification code to:
              </p>
              <div className="grid grid-cols-2 gap-2 sm:gap-3">
                <button
                  onClick={() => handleMethodChange("email")}
                  disabled={isSendingOTP || timer > 0}
                  className={`
                    flex items-center justify-center px-3 sm:px-4 py-2 sm:py-3 rounded-lg border-2 transition-all text-sm sm:text-base
                    ${
                      selectedMethod === "email"
                        ? "border-cyan-500 bg-cyan-50 text-cyan-700"
                        : "border-gray-200 text-gray-600 hover:border-gray-300"
                    }
                    disabled:opacity-50 disabled:cursor-not-allowed
                  `}
                  title={
                    timer > 0
                      ? "Wait until timer expires to switch methods"
                      : ""
                  }
                >
                  <svg
                    className="w-4 h-4 sm:w-5 sm:h-5 mr-1 sm:mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                    />
                  </svg>
                  Email
                </button>
                <button
                  onClick={() => handleMethodChange("phone")}
                  disabled={isSendingOTP || timer > 0}
                  className={`
                    flex items-center justify-center px-3 sm:px-4 py-2 sm:py-3 rounded-lg border-2 transition-all text-sm sm:text-base
                    ${
                      selectedMethod === "phone"
                        ? "border-cyan-500 bg-cyan-50 text-cyan-700"
                        : "border-gray-200 text-gray-600 hover:border-gray-300"
                    }
                    disabled:opacity-50 disabled:cursor-not-allowed
                  `}
                  title={
                    timer > 0
                      ? "Wait until timer expires to switch methods"
                      : ""
                  }
                >
                  <svg
                    className="w-4 h-4 sm:w-5 sm:h-5 mr-1 sm:mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                    />
                  </svg>
                  Phone
                </button>
              </div>
              {timer > 0 && (
                <p className="text-xs text-gray-500 mt-2 text-center">
                  You can switch methods after the timer expires
                </p>
              )}
            </div>
          )}

          {/* Masked Contact Display */}
          <div className="mb-6 text-center">
            <p className="text-xs sm:text-sm text-gray-600 mb-2">
              {isSendingOTP
                ? "Sending verification code to"
                : "Verification code sent to"}
            </p>
            <p className="text-base sm:text-lg font-semibold text-gray-800 break-all px-2 min-h-[28px] flex items-center justify-center">
              {isSendingOTP ? (
                <span className="flex items-center text-cyan-600">
                  <svg
                    className="animate-spin h-5 w-5 mr-2"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Sending...
                </span>
              ) : (
                getDisplayText()
              )}
            </p>
          </div>

          {/* OTP Input */}
          <div className="mb-6">
            <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-3">
              Enter 6-digit code
            </label>
            <div
              className="flex justify-center gap-1.5 sm:gap-2"
              onPaste={handlePaste}
            >
              {otp.map((digit, index) => (
                <input
                  key={index}
                  ref={(el) => (inputRefs.current[index] = el)}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleOtpChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  className="w-10 h-12 sm:w-12 sm:h-14 text-center text-xl sm:text-2xl font-bold border-2 border-gray-300 rounded-lg focus:border-cyan-500 focus:ring-2 focus:ring-cyan-200 outline-none transition-all"
                  disabled={isLoading || isSendingOTP}
                />
              ))}
            </div>
          </div>

          {/* Resend Timer */}
          <div className="text-center mb-6">
            {!canResend && timer > 0 ? (
              <p className="text-xs sm:text-sm text-gray-600">
                Resend code in{" "}
                <span className="font-semibold text-cyan-600">{timer}s</span>
              </p>
            ) : (
              <button
                onClick={handleResendOTP}
                disabled={isSendingOTP || !canResend}
                className="text-xs sm:text-sm font-medium text-cyan-600 hover:text-cyan-700 disabled:text-gray-400 disabled:cursor-not-allowed"
              >
                {isSendingOTP ? "Sending..." : "Resend Code"}
              </button>
            )}
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            <button
              onClick={handleVerifyOTP}
              disabled={isLoading || isSendingOTP || otp.join("").length !== 6}
              className="w-full bg-gradient-to-r from-cyan-500 to-cyan-600 text-white font-semibold py-2.5 sm:py-3 rounded-lg hover:from-cyan-600 hover:to-cyan-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg text-sm sm:text-base"
            >
              {isLoading ? (
                <span className="flex items-center justify-center">
                  <svg
                    className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Verifying...
                </span>
              ) : (
                "Verify Code"
              )}
            </button>

            <button
              onClick={onCancel}
              disabled={isLoading || isSendingOTP}
              className="w-full bg-gray-100 text-gray-700 font-semibold py-2.5 sm:py-3 rounded-lg hover:bg-gray-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
            >
              Cancel
            </button>
          </div>

          {/* Help Text */}
          <div className="mt-6 p-3 sm:p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-start">
              <svg
                className="w-4 h-4 sm:w-5 sm:h-5 text-blue-500 mr-2 mt-0.5 flex-shrink-0"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                  clipRule="evenodd"
                />
              </svg>
              <p className="text-xs text-blue-700">
                Didn{"'"}t receive the code? Check your spam folder or try
                resending after the timer expires.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TwoFactorAuth;
