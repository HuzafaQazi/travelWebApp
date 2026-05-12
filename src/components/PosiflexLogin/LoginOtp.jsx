import "tailwindcss/tailwind.css";
import Image from "next/image";
import Posiflex from "../../../public/img/posiflex big.png";
import styles from "./style.module.css";
import belowimage from "../../../public/img/Isolation_Mode (5).png";
import belowimage1 from "../../../public/img/Isolation_Mode (6).png";
import { useLogin } from "@/store/context/LoginContext";
import initFirebaseMessaging from "../../../utils/notifications/initFirebaseMessaging";
import { useState, useEffect, useRef, useMemo } from "react";
import axios, {
  getTabSpecificData,
  removeTabSpecificData,
  setTabSpecificData,
} from "@/utils/axios/axios";
import config from "@/config";
import { useRouter } from "next/router";
import { toast } from "react-toastify";
import "react-datepicker/dist/react-datepicker.css";
import { useDropzone } from "react-dropzone";
import { getUserDetailsByID } from "@/utils/profileAPI";
import useLocalStorage from "@/hooks/useLocalStorage";
import { format } from "date-fns";
import pako from "pako";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEdit } from "@fortawesome/free-solid-svg-icons";
import useFormValidator from "@/hooks/useFormValidator";
import showToast from "@/utils/toast";

const LoginOtpModal = ({ isOpen, onClose, getEventRegisteredDetails }) => {
  const { updateEventUserDetails, openPopup } = useLogin();
  const router = useRouter();

  const [getPhoneNumber, setPhoneNumber] = useLocalStorage("phoneNumber");
  const [getAccessToken, setAccessToken] = useLocalStorage("accessToken");
  const [getUserID, setUserID] = useLocalStorage("userID");
  const [getUserDetails, setUserDetails] = useLocalStorage("userDetails");

  const [currentIndex, setCurrentIndex] = useState(0);
  const [activeEvent, setActiveEvent] = useState(null);
  const [isLoadingEvent, setIsLoadingEvent] = useState(true);
  const [isInternational, setIsInternational] = useState(false);

  const {
    getRootProps: getTicketRootProps,
    getInputProps: getTicketInputProps,
  } = useDropzone({
    onDrop: (acceptedFiles) => onDrop(acceptedFiles, "ticket"),
    onDropRejected: (rejectedFiles) => onDropRejected(rejectedFiles, "ticket"),
    accept: {
      "image/*": [".jpeg", ".png", ".heic"],
      "application/pdf": [".pdf"],
    },
    multiple: true,
    maxFiles: 5,
    maxSize: 10485760, // 10 MB
  });

  const {
    getRootProps: getAadhaarRootProps,
    getInputProps: getAadhaarInputProps,
  } = useDropzone({
    onDrop: (acceptedFiles) => onDrop(acceptedFiles, "aadhaar"),
    onDropRejected: (rejectedFiles) => onDropRejected(rejectedFiles, "aadhaar"),
    accept: {
      "image/*": [".jpeg", ".png", ".heic"],
      "application/pdf": [".pdf"],
    },
    multiple: false,
    maxSize: 10485760, // 10 MB
  });

  const { getRootProps: getPanRootProps, getInputProps: getPanInputProps } =
    useDropzone({
      onDrop: (acceptedFiles) => onDrop(acceptedFiles, "pan"),
      onDropRejected: (rejectedFiles) => onDropRejected(rejectedFiles, "pan"),
      accept: {
        "image/*": [".jpeg", ".png", ".heic"],
        "application/pdf": [".pdf"],
      },
      multiple: false,
      maxSize: 10485760, // 10 MB
    });

  const [, forceUpdate] = useState(0);
  const [otp, setOTP] = useState(Array(6).fill(""));
  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [isResendOtpDisabled, setIsResendOtpDisabled] = useState(true);
  const [resendTimer, setResendTimer] = useState(0);
  const [showResendTimer, setShowResendTimer] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    address: "",
    email: "",
    dob: "",
    phoneNumber: "",
    weddingAnniversary: "",
    busServicePickup: false,
    busServiceDrop: false,
    flightArrivalTime: "",
  });

  // Save original form data when OTP is sent to allow for comparison if edited
  const [originalContactInfo, setOriginalContactInfo] = useState({
    email: "",
    phoneNumber: "",
  });

  const [uploadedFiles, setUploadedFiles] = useState({
    ticket: [],
    aadhaar: null,
    pan: null,
  });

  const [dropzoneErrors, setDropzoneErrors] = useState({
    ticket: "",
    aadhaar: "",
    pan: "",
  });

  // Function to check if a mobile number is Indian
  const isIndianMobile = (mobileNum) => {
    if (!mobileNum) return false;
    // Indian mobile numbers start with 6, 7, 8, or 9 and are 10 digits long
    const indianMobileRegex = /^[6-9]\d{9}$/;
    return indianMobileRegex.test(mobileNum);
  };

  // Function to determine if user is international
  const checkIfInternational = () => {
    const mobile = formData.phoneNumber || "";

    // First check if it's a valid Indian mobile number
    const isIndian = isIndianMobile(mobile);

    // If it's an Indian mobile, they're always domestic
    if (isIndian) {
      return false;
    }

    // If mobile is not Indian format and email is provided, they're international
    const hasEmail = formData.email && formData.email.trim() !== "";
    return hasEmail;
  };

  // Update form data from localStorage when component mounts
  useEffect(() => {
    if (isOpen) {
      // Get stored values
      const storedEmail = getTabSpecificData("userEmail") || "";
      const storedPhoneNumber = getTabSpecificData("phoneNumber") || "";

      // Update form data if any values exist
      if (storedEmail || storedPhoneNumber) {
        const updatedFormData = {
          ...formData,
          email: storedEmail || formData.email,
          phoneNumber: storedPhoneNumber || formData.phoneNumber,
        };

        setFormData(updatedFormData);

        // Determine if international based on stored values
        const isIndian = isIndianMobile(storedPhoneNumber);
        setIsInternational(!isIndian && !!storedEmail);
      }
    }
  }, [isOpen]);

  // Fetch active event when modal opens
  useEffect(() => {
    if (isOpen) {
      fetchActiveEvent();
    }
  }, [isOpen]);

  useEffect(() => {
    let interval;
    if (showResendTimer && resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer((prevTime) => prevTime - 1);
      }, 1000);
    } else if (resendTimer === 0) {
      setShowResendTimer(false);
      setIsResendOtpDisabled(false);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [showResendTimer, resendTimer]);

  // Update international status when email or phone changes
  useEffect(() => {
    const isIndian = isIndianMobile(formData.phoneNumber);
    const hasEmail = formData.email && formData.email.trim() !== "";
    setIsInternational(!isIndian && hasEmail);
  }, [formData.email, formData.phoneNumber]);

  // Fetch active event data
  const fetchActiveEvent = async () => {
    setIsLoadingEvent(true);
    try {
      const response = await axios.get(`${config.EVENTS_ACTIVE_EVENT}`);
      if (response.data.status) {
        setActiveEvent(response.data.data);
      } else {
        showToast("info", "Failed to fetch event details");
      }
    } catch (error) {
      console.error("Error fetching active event:", error);
      showToast("info", "Error fetching event details");
    } finally {
      setIsLoadingEvent(false);
    }
  };

  // Format date for display
  const formatEventDate = (fromDate, toDate) => {
    if (!fromDate || !toDate) return "";

    const start = new Date(fromDate);
    const end = new Date(toDate);

    return `${format(start, "do")} - ${format(end, "do MMMM, yyyy")}`;
  };

  useEffect(() => {
    const storedFullName = getTabSpecificData("userDetails");
    const storedEmail = getTabSpecificData("email");
    const storedPhoneNumber = getTabSpecificData("phoneNumber");
    if (storedFullName || storedEmail || storedPhoneNumber) {
      setFormData({
        ...formData,
        fullName: storedFullName || "",
        email: storedEmail || "",
        phoneNumber: storedPhoneNumber || "",
      });
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "visible";
    }

    return () => {
      document.body.style.overflow = "visible";
    };
  }, [isOpen]);

  // Add this useEffect to automatically verify when OTP is complete
  useEffect(() => {
    const otpString = otp.join("");
    if (otpString.length === 6 && otpString.match(/^\d{6}$/)) {
      // Add a small delay to ensure state is updated
      const timeoutId = setTimeout(async () => {
        try {
          await handleVerifyOtp(otpString);
        } catch (error) {
          console.error("Error verifying OTP:", error);
          showToast("info", "Failed to verify OTP. Please try again.");
        }
      }, 100);

      return () => clearTimeout(timeoutId);
    }
  }, [otp]);

  const customMessages = useMemo(
    () => ({
      required: "This field is required.",
      email: "Invalid email format.",
      validMobile: "Invalid or incomplete mobile number.",
      validPhone: "Please enter a valid phone number with at least 7 digits.",
      alpha: "Should contain only alphabets.",
      alpha_space: "Should contain only alphabets.",
      validEmail: "Invalid email format.",
    }),
    [], // no dependencies → only created once
  );

  const customRules = useMemo(
    () => ({
      validMobile: {
        // Define the custom validation function for a valid Indian mobile number.
        message:
          "Please enter a valid 10-digit Indian mobile number starting with 6, 7, 8, or 9.",
        rule: (val, params, validator) => {
          // The regular expression to match a 10-digit Indian mobile number.
          const regex = /^[6789]\d{9}$/;
          return regex.test(val);
        },
      },
      validPhone: {
        // Validation for any phone number (using only digits now)
        message: "Please enter a valid phone number with at least 7 digits.",
        rule: (val, params, validator) => {
          // Check if it contains only digits and has at least 7 digits
          return /^\d+$/.test(val) && val.length >= 7 && val.length <= 15;
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
      alpha_space: {
        message: "Should contain only alphabets.",
        rule: (val, params, validator) => {
          return validator.helpers.testRegex(val, /^[A-Za-z\s]+$/);
        },
      },
      validFileTypes: {
        message: "Invalid file type. Only PNG, JPEG, or PDF are allowed.",
        rule: (val, params, validator) => {
          const allowedExtensions = [
            "apng",
            "avif",
            "gif",
            "jfif",
            "pjpeg",
            "pjp",
            "svg",
            "webp",
            "jpeg",
            "jpg",
            "png",
            "pdf",
            "heic",
          ];
          const extension = val.name.split(".").pop().toLowerCase();
          return allowedExtensions.includes(extension);
        },
      },
      maxFiles: {
        message: "You can upload a maximum of 5 files.",
        rule: (val, params, validator) => {
          return val.length <= 5;
        },
      },
      maxFileSize: {
        message: "Each file should not exceed 10MB.",
        rule: (val, params, validator) => {
          const isFileWithinLimit = (file) => file.size <= 10 * 1024 * 1024;

          if (Array.isArray(val)) {
            // If val is an array, check each file
            return val.every(isFileWithinLimit);
          } else if (val && typeof val.size === "number") {
            // If val is a single file object
            return isFileWithinLimit(val);
          }

          // If val is neither an array nor a file object, consider it valid
          return true;
        },
      },
    }),
    [],
  );

  const [simpleValidator, updateValidator] = useFormValidator(
    customMessages,
    customRules,
  );

  // useEffect(() => {
  //   if (formData.phoneNumber && !isIndianMobile(formData.phoneNumber)) {
  //     updateValidator(customMessages, customRules);
  //   }
  // }, [formData.phoneNumber, customMessages, customRules, updateValidator]);

  if (!isOpen) return null;

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (name === "fullName") {
      // Regex to allow only alphabets and spaces
      const regex = /^[a-zA-Z\s]*$/;

      if (!regex.test(value)) {
        return; // Exit if the value contains non-alphabet characters
      }
    } else if (name === "phoneNumber") {
      // Only allow digits for all mobile numbers
      const regex = /^\d*$/;
      if (!regex.test(value)) {
        return; // Exit if the value contains non-digit characters
      }
    }

    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleDateChange = (name, date) => {
    setFormData({
      ...formData,
      [name]: date,
    });
  };

  const onDrop = (acceptedFiles, field) => {
    if (field === "ticket") {
      setUploadedFiles((prevState) => ({
        ...prevState,
        // ticket: [...prevState.ticket, ...acceptedFiles],
        ticket: acceptedFiles,
      }));
      setDropzoneErrors({ ...dropzoneErrors, ticket: "" });
    } else {
      setUploadedFiles({
        ...uploadedFiles,
        [field]: acceptedFiles[0],
      });
    }
    setDropzoneErrors({ ...dropzoneErrors, [field]: "" });
  };

  const handleSubmit = async (e = null) => {
    if (e) e.preventDefault();
    const formValid = simpleValidator.allValid();
    console.log(simpleValidator.getErrorMessages());
    if (!formValid) {
      simpleValidator.showMessages();
      forceUpdate((prevState) => !prevState);
      return;
    }
    const userId = getTabSpecificData("userID");
    const accessToken = getTabSpecificData("accessToken");

    if (!activeEvent?._id) {
      showToast("info", "No active event found. Please try again later.");
      return;
    }

    // Check if mobile number is valid based on user type
    const isIndian = isIndianMobile(formData.phoneNumber);

    // For non-Indian mobile numbers, email is required
    if (!isIndian && (!formData.email || formData.email.trim() === "")) {
      showToast("info", "Email is required for international users");
      return;
    }

    // Validate Indian mobile numbers
    if (isIndian && !isIndianMobile(formData.phoneNumber)) {
      showToast("info", "Please enter a valid Indian mobile number");
      return;
    }

    // Validate international mobile numbers
    if (!isIndian && formData.phoneNumber.length < 7) {
      showToast(
        "info",
        "Please enter a valid phone number with at least 7 digits",
      );
      return;
    }

    setIsLoading(true);
    try {
      const formatDate = (date) => {
        return date ? new Date(date).toISOString().split("T")[0] : "";
      };
      const payload = new FormData();
      payload.append("user_id", userId);
      payload.append("event_id", activeEvent?._id);
      payload.append("full_name", formData.fullName);
      payload.append("address", formData.address);
      payload.append("email", formData.email || "");
      payload.append("mobile", formData.phoneNumber);
      payload.append("date_of_birth", formatDate(formData.dob));
      payload.append(
        "wedding_anniversary",
        formatDate(formData.weddingAnniversary),
      );
      payload.append("is_bus_pickup_required", formData.busServicePickup);
      payload.append("is_bus_drop_required", formData.busServiceDrop);
      payload.append("flight_arrival_time", formData.flightArrivalTime);
      payload.append("is_international", !isIndian);

      uploadedFiles.ticket.forEach((file) => {
        payload.append("ticket", file);
      });

      if (uploadedFiles.aadhaar) {
        payload.append("aadhaar", uploadedFiles.aadhaar);
      }

      if (uploadedFiles.pan) {
        payload.append("pan", uploadedFiles.pan);
      }

      const accessToken = getTabSpecificData("accessToken")?.replace(/"/g, "");
      if (accessToken) {
        const response = await axios.post(
          `${config.EVENTS_REGISTRATION}`,
          payload,
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          },
        );
        if (response.data.status) {
          showToast("info", "Registered successfully");
          setTabSpecificData("event_id", activeEvent._id);
          updateEventUserDetails(response.data.data);
          await initFirebaseMessaging();
          onClose();

          // trigger FCM Custom Firebase
          window.dispatchEvent(new CustomEvent("userTypeChanged"));
          await router.push("/CIT-95");
        }
      } else {
        await handleSendOtp(null, "New");
      }
      simpleValidator.hideMessages();
    } catch (error) {
      console.log(error);
      if (error?.response?.status === 404) {
        // Handle 404 error
        removeTabSpecificData("userID");
        removeTabSpecificData("accessToken");
        await handleSubmit();
      } else {
        showToast(
          "info",
          error?.response?.data?.message ||
            "Registration failed. Please try again.",
        );
      }
    } finally {
      setIsLoading(false);
    }
  };

  const onDropRejected = (rejectedFiles, field) => {
    const maxSize = 10 * 1024 * 1024; // 10 MB
    const maxFiles = 5;

    const errorMessages = {
      maxFiles: `You can upload a maximum of ${maxFiles} files.`,
      maxFileSize: `Each file should not exceed ${maxSize / (1024 * 1024)}MB.`,
    };

    const errors = rejectedFiles.reduce((acc, file) => {
      const { errors } = simpleValidator;
      let errorMessage = "";
      if (!errors.maxFiles && rejectedFiles.length > maxFiles) {
        errorMessage = errorMessages.maxFiles;
      } else if (!errors.maxFileSize && file.size > maxSize) {
        errorMessage = errorMessages.maxFileSize;
      } else {
        errorMessage = errors[0];
      }

      return {
        ...acc,
        [field]: errorMessage,
      };
    }, {});

    setDropzoneErrors((prevState) => ({
      ...prevState,
      ...errors,
    }));

    setTimeout(() => {
      setDropzoneErrors((prevState) => ({
        ...prevState,
        [field]: "",
      }));
    }, 5000);
  };

  // const handleKeyDown = async (event, index) => {
  //   const { key, keyCode } = event;

  //   if (key === "Backspace") {
  //     event.preventDefault();
  //     document.getElementById(`otp-input-${index + 1}`).value = "";
  //     if (index !== 0) {
  //       const updatedOTP = [...otp];
  //       updatedOTP[index - 1] = "";
  //       setOTP(updatedOTP);
  //       document.getElementById(`otp-input-${index}`).focus();
  //     }
  //   } else if (keyCode >= 48 && keyCode <= 57) {
  //     event.preventDefault();
  //     const updatedOTP = [...otp];
  //     updatedOTP[index] = key;
  //     setOTP(updatedOTP);
  //     document.getElementById(`otp-input-${index + 1}`).value = key;
  //     if (index < 5) {
  //       document.getElementById(`otp-input-${index + 2}`).focus();
  //     } else if (index === 5) {
  //       const finalOTP = updatedOTP.join("");
  //       console.log("Final OTP:", finalOTP);
  //       await handleVerifyOtp(finalOTP);
  //     }
  //   }
  // };

  const handleKeyDown = async (event, index) => {
    const { key, keyCode } = event;

    if (key === "Backspace") {
      event.preventDefault();
      document.getElementById(`otp-input-${index + 1}`).value = "";
      if (index !== 0) {
        const updatedOTP = [...otp];
        updatedOTP[index - 1] = "";
        setOTP(updatedOTP);
        document.getElementById(`otp-input-${index}`).focus();
      }
    } else if (
      // More comprehensive number key detection
      (key >= "0" && key <= "9") ||
      (keyCode >= 48 && keyCode <= 57) || // Regular number keys
      (keyCode >= 96 && keyCode <= 105) // Numpad keys
    ) {
      event.preventDefault();
      const digit =
        key >= "0" && key <= "9"
          ? key
          : String.fromCharCode(keyCode >= 96 ? keyCode - 48 : keyCode);
      const updatedOTP = [...otp];
      updatedOTP[index] = digit;
      setOTP(updatedOTP);
      document.getElementById(`otp-input-${index + 1}`).value = digit;

      if (index < 5) {
        document.getElementById(`otp-input-${index + 2}`).focus();
      }
    }
  };

  // Modified input onChange handler
  const handleOtpInputChange = (event, index) => {
    const value = event.target.value;
    if (value.match(/^\d?$/)) {
      // Only allow single digits
      const updatedOTP = [...otp];
      updatedOTP[index] = value;
      setOTP(updatedOTP);

      // Auto-focus next input
      if (value && index < 5) {
        document.getElementById(`otp-input-${index + 2}`).focus();
      }
    }
  };

  // Function to go back to contact form from OTP screen
  const handleEditContact = () => {
    setOtpSent(false);
    setOTP(Array(6).fill(""));
    setIsResendOtpDisabled(false);
    setShowResendTimer(false);
    setResendTimer(0);
  };

  const handleSendOtp = async (event = null, otpType = "New") => {
    if (event) event.preventDefault();

    // Validate both phone number and email based on user type
    const mobile = formData.phoneNumber || "";
    const email = formData.email || "";
    const isIndian = isIndianMobile(mobile);

    // Validate based on user type
    if (!isIndian && (!email || email.trim() === "")) {
      showToast("info", "Email is required for international users");
      return;
    }

    if (isIndian && mobile.length !== 10) {
      showToast("info", "Please enter a valid 10-digit Indian mobile number");
      return;
    }

    if (!isIndian && mobile.length < 7) {
      showToast(
        "info",
        "Please enter a valid phone number with at least 7 digits",
      );
      return;
    }

    // Create payload based on whether user is international
    const payload = !isIndian
      ? {
          mobile: mobile,
          email: email,
          isInternational: true,
          otpType: otpType,
          otpNumber: "",
        }
      : {
          mobile: mobile,
          otpType: otpType,
          otpNumber: "",
        };

    // Save original contact info when sending new OTP
    if (otpType === "New") {
      setOriginalContactInfo({
        email: email,
        phoneNumber: mobile,
      });

      // Update international flag based on precise validation
      setIsInternational(!isIndian);
    }

    try {
      const response = await axios.post(`${config.REGISTER_USER}`, payload);
      if (response.status === 200 && response.data.status === "SUCCESS") {
        // Reset otp field input
        if (otpType === "resend") {
          Array(6)
            .fill("")
            .map((_, index) => {
              return (document.getElementById(`otp-input-${index + 1}`).value =
                "");
            });
        }

        setOtpSent(true);

        if (otpType === "resend") {
          setIsResendOtpDisabled(true);
          // Start the resend timer
          setResendTimer(60);
          setShowResendTimer(true);
        }

        setTimeout(() => {
          if (document.getElementById(`otp-input-1`))
            document.getElementById(`otp-input-1`).focus();
        }, 500);
        setTimeout(() => setIsResendOtpDisabled(false), 60000); // Enable resend after 60 seconds

        const otpDestination =
          !isIndian && email ? "your email address" : "your mobile number";

        showToast("info", `OTP sent successfully to ${otpDestination}`);
      } else {
        showToast("info", response.data.message || "Failed to send OTP");
      }
    } catch (error) {
      console.error(error);
      showToast("info", error?.response?.data?.message || "Failed to send OTP");
    }
  };

  // const handlePaste = async (event) => {
  //   event.preventDefault();
  //   const paste = event.clipboardData.getData("text");
  //   const sanitizedText = paste.replace(/\D/g, "").slice(0, 6);
  //   const newOtp = Array(6).fill("");

  //   sanitizedText.split("").forEach((char, index) => {
  //     newOtp[index] = char;
  //     document.getElementById(`otp-input-${index + 1}`).value = char;
  //   });

  //   setOTP(newOtp);

  //   // Focus the last filled input or the next empty one
  //   const lastFilledIndex = sanitizedText.length;
  //   if (lastFilledIndex < 6) {
  //     document.getElementById(`otp-input-${lastFilledIndex + 1}`).focus();
  //   } else {
  //     document.getElementById(`otp-input-6`).focus();
  //   }

  //   // If a complete 6-digit OTP was pasted, verify it
  //   if (sanitizedText.length === 6) {
  //     try {
  //       await handleVerifyOtp(sanitizedText);
  //     } catch (error) {
  //       console.error("Error verifying OTP:", error);
  //       toast.error("Failed to verify OTP. Please try again.");
  //     }
  //   }
  // };

  const handlePaste = async (event) => {
    event.preventDefault();
    const paste = event.clipboardData.getData("text");
    const sanitizedText = paste.replace(/\D/g, "").slice(0, 6);
    const newOtp = Array(6).fill("");

    sanitizedText.split("").forEach((char, index) => {
      newOtp[index] = char;
      document.getElementById(`otp-input-${index + 1}`).value = char;
    });

    setOTP(newOtp);

    // Focus the last filled input or the next empty one
    const lastFilledIndex = sanitizedText.length;
    if (lastFilledIndex < 6) {
      document.getElementById(`otp-input-${lastFilledIndex + 1}`).focus();
    } else {
      document.getElementById(`otp-input-6`).focus();
    }

    // The useEffect will handle verification automatically when OTP state updates
  };

  const handleVerifyOtp = async (otp = "") => {
    const mobile = formData.phoneNumber || "";
    const email = formData.email || "";
    const isIndian = isIndianMobile(mobile);

    // Create payload based on whether user is domestic or international
    const payload = !isIndian
      ? {
          mobile: mobile,
          email: email,
          isInternational: true,
          otpType: "valid",
          otpNumber: otp,
        }
      : {
          mobile: mobile,
          otpType: "valid",
          otpNumber: otp,
        };

    try {
      setIsLoading(true);
      const response = await axios.post(`${config.REGISTER_USER}`, payload);
      if (response.status === 200 && response.data.status === "SUCCESS") {
        setTabSpecificData("accessToken", response.data.data.accessToken);
        setTabSpecificData("phoneNumber", mobile);
        setTabSpecificData("userID", response.data.data.userId);

        // Save email if provided for non-Indian mobile numbers
        if (!isIndian && email && email.trim() !== "") {
          setTabSpecificData("userEmail", email);
        }

        const userDetails = await saveUserDetails(response.data.data.userId);
        const userData = {
          ...userDetails,
          accessToken: response.data.data.accessToken,
        };
        // const compressedData = pako.deflate(JSON.stringify(userData));
        // localStorage.setItem("qugoUserDetails", compressedData);

        // storeQugoUserDetails(userData);
        setOtpVerified(true);
        await handleSubmit();
        onClose();
      } else {
        showToast("info", response.data.message || "Invalid OTP");
      }
    } catch (error) {
      console.error(error);
      showToast("info", "OTP is not valid");
    } finally {
      setIsLoading(false);
    }
  };

  async function saveUserDetails(userID) {
    try {
      const userdetails = await getUserDetailsByID(userID);
      setTabSpecificData("userDetails", userdetails.data.firstName);
      return userdetails.data;
    } catch (error) {
      console.error("Error making API call:", error);
      throw error;
    }
  }

  // Check if contact info has changed - if yes, we should show "Request New OTP" instead of "Resend"
  const hasContactInfoChanged = () => {
    return (
      formData.email !== originalContactInfo.email ||
      formData.phoneNumber !== originalContactInfo.phoneNumber
    );
  };

  return (
    <>
      <div style={{ position: "absolute", zIndex: "999" }}>
        <div className={styles.maincontainer}>
          <div className={styles.imageBackground}>
            <div onClick={onClose} className={styles.crossmark1}>
              &times;
            </div>

            <div className="absolute top-[16%] left-1/2 sm:top-1/2 sm:left-[23%] text-white text-sm sm:text-3xl font-medium -translate-x-1/2 -translate-y-1/2 z-[9999] flex flex-col items-center justify-center w-fit">
              {isLoadingEvent ? (
                <div className="text-center mb-1">Loading event details...</div>
              ) : activeEvent ? (
                <>
                  <div className="text-center underline mb-1">
                    {/* {activeEvent.eventName} */}Registration Page
                  </div>
                  <div className="text-center mb-1">
                    {/* {activeEvent.eventName} */} CIT-95 PEARL JUBILEE ALUMINI
                    MEET
                  </div>
                  <div className="text-center mb-1">
                    {/* Date: <span>{formatEventDate(activeEvent.fromDate, activeEvent.toDate)}</span> */}
                    Event Dates: 4th July – 6th July 2025
                  </div>
                  <div className="text-center">
                    {/* Location: <span>{activeEvent.location}</span> */}
                    Location: Coimbatore
                  </div>
                </>
              ) : (
                <div className="text-center">No active event found</div>
              )}
            </div>
            <Image
              className={styles.belowimage}
              src={belowimage}
              alt="qugoLogo"
            />

            <Image
              className={styles.belowimage1}
              src={belowimage1}
              alt="qugoLogo"
            />
          </div>

          <div className={styles.background}>
            <div onClick={onClose} className={styles.crossmark}>
              &times;
            </div>
            <div className="text-center">
              <div className={styles.regisText}>Registration</div>
              {activeEvent ? (
                <form
                  onSubmit={handleSubmit}
                  className={styles.formContainer}
                  autoComplete="off"
                >
                  <div className={styles.formGroup}>
                    <label className={styles.label}>Full Name *</label>
                    <input
                      type="text"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleInputChange}
                      className={styles.input}
                      pattern="[a-zA-Z\s]*"
                      disabled={otpSent && !hasContactInfoChanged()}
                    />
                    <div className="text-red-500 text-xs mt-1">
                      {simpleValidator.message(
                        "fullName",
                        formData.fullName,
                        "required|alpha_space|min:3|max:60",
                      )}
                    </div>
                  </div>

                  <div className={styles.formGroup}>
                    <label className={styles.label}>
                      Email ID{" "}
                      {!isIndianMobile(formData.phoneNumber) ? "*" : ""}
                      <span className={styles.userTypeNote}>
                        {!isIndianMobile(formData.phoneNumber)
                          ? " (Required for international users)"
                          : " (Optional for domestic users)"}
                      </span>
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className={styles.input}
                      disabled={otpSent && !hasContactInfoChanged()}
                    />
                    <div className="text-red-500 text-xs mt-1">
                      {formData.phoneNumber &&
                      !isIndianMobile(formData.phoneNumber)
                        ? simpleValidator.message(
                            "email",
                            formData.email,
                            "required|email",
                          )
                        : formData.email
                          ? simpleValidator.message(
                              "email",
                              formData.email,
                              "email",
                            )
                          : simpleValidator.message(
                              "email",
                              "VALID",
                              "required",
                            )}
                    </div>
                  </div>

                  <div className={styles.formGroup}>
                    <label className={styles.label}>Phone Number *</label>
                    <input
                      type="text"
                      name="phoneNumber"
                      value={formData.phoneNumber}
                      onChange={handleInputChange}
                      className={styles.input1}
                      autoComplete="off"
                      disabled={otpSent && !hasContactInfoChanged()}
                      placeholder={
                        isIndianMobile(formData.phoneNumber)
                          ? "e.g. 9876543210"
                          : "e.g. 12345678901"
                      }
                      inputMode="numeric"
                      pattern="\d*"
                      // maxLength={isIndianMobile(formData.phoneNumber) ? 10 : 15}
                    />
                    <div className="text-red-500 text-xs mt-1">
                      {!isIndianMobile(formData.phoneNumber)
                        ? simpleValidator.message(
                            "phoneNumber",
                            formData.phoneNumber,
                            "required|validPhone",
                          )
                        : simpleValidator.message(
                            "phoneNumber",
                            formData.phoneNumber,
                            "required|validMobile",
                          )}
                    </div>
                  </div>

                  <div className={styles.userTypeInfoBox}>
                    <p className={styles.userTypeInfoText}>
                      NOTE:- Other than Indian mobile numbers Email id is
                      Mandatory for registration. (International User will get
                      the OTP on mail ID)
                      {/* {isIndianMobile(formData.phoneNumber || phoneNumber)
                        ? ' You are registering as a domestic user.'
                        : ' You will be registered as an international user.'} */}
                    </p>
                  </div>

                  {otpSent && (
                    <div style={{ color: "white" }}>
                      <h1 className="text-xl sm:text-2xl font-bold mt-4">
                        OTP Verification
                      </h1>
                      <div className="flex flex-col mt-2">
                        <span>
                          {!isIndianMobile(formData.phoneNumber) &&
                          formData.email
                            ? "Enter the OTP sent to your email"
                            : "Enter the OTP sent to your mobile number"}
                        </span>
                      </div>

                      <div id="otp" className={styles.otpContainer}>
                        {Array(6)
                          .fill("")
                          .map((_, index) => (
                            <input
                              key={index}
                              className="m-2 border h-10 w-10 text-center form-control rounded"
                              type="tel"
                              id={`otp-input-${index + 1}`}
                              maxLength={1}
                              value={otp[index]}
                              onKeyDown={(event) => handleKeyDown(event, index)}
                              onPaste={handlePaste}
                              // onChange={(event) => {
                              //   const updatedOTP = [...otp];
                              //   updatedOTP[index] = event.target.value;
                              //   setOTP(updatedOTP);
                              // }}
                              onChange={(event) =>
                                handleOtpInputChange(event, index)
                              }
                              inputMode="numeric"
                              pattern="\d*"
                            />
                          ))}
                      </div>

                      <div className="flex justify-center text-center mt-2 space-x-4">
                        {hasContactInfoChanged() ? (
                          // If contact info changed, show request new OTP button
                          <button
                            className="flex items-center text-blue-600 hover:text-blue-800 cursor-pointer"
                            onClick={(e) => handleSendOtp(e, "New")}
                            type="button"
                          >
                            <span className="font-bold">Request New OTP</span>
                          </button>
                        ) : showResendTimer ? (
                          <div className="text-gray-400">
                            Resend OTP in{" "}
                            <span className="font-bold">{resendTimer}</span>{" "}
                            seconds
                          </div>
                        ) : (
                          <button
                            className="flex items-center text-blue-600 hover:text-blue-800 cursor-pointer"
                            onClick={(e) => handleSendOtp(e, "resend")}
                            disabled={isResendOtpDisabled}
                            type="button"
                          >
                            <span className="font-bold">Resend OTP</span>
                          </button>
                        )}

                        {/* Edit button */}
                        <button
                          className="flex items-center text-green-600 hover:text-green-800 cursor-pointer"
                          onClick={handleEditContact}
                          type="button"
                        >
                          <FontAwesomeIcon icon={faEdit} className="mr-1" />
                          <span className="font-bold">Edit Contact</span>
                        </button>
                      </div>
                    </div>
                  )}

                  {!otpSent && (
                    <button type="submit" className={styles.registerButton}>
                      {isLoading ? "Registering..." : "Register"}
                    </button>
                  )}
                </form>
              ) : (
                <div className="text-white text-center p-8">
                  {isLoadingEvent
                    ? "Loading event details..."
                    : "No active event found. Please try again later."}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default LoginOtpModal;
