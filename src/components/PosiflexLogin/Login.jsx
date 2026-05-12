import "tailwindcss/tailwind.css";
import Image from "next/image";
import Posiflex from "../../../public/img/posiflex big.png";
import styles from "./style.module.css";
import belowimage from "../../../public/img/Isolation_Mode (5).png";
import belowimage1 from "../../../public/img/Isolation_Mode (6).png";
import { useLogin } from "@/store/context/LoginContext";
import initFirebaseMessaging from "../../../utils/notifications/initFirebaseMessaging";

import { useState, useEffect, useRef } from "react";
import SimpleReactValidator from "simple-react-validator";
import axios, { getTabSpecificData, setTabSpecificData } from "@/utils/axios/axios";
import config from "@/config";
import { useRouter } from "next/router";
import { toast } from "react-toastify";
import "react-datepicker/dist/react-datepicker.css";
import { useDropzone } from "react-dropzone";
import "react-time-picker/dist/TimePicker.css";
import "react-clock/dist/Clock.css";
import showToast from "@/utils/toast";

const LoginModal = ({ isOpen, onClose }) => {
  const { updateEventUserDetails, openPopup } = useLogin();
  const router = useRouter();

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

  let phoneNumber;
  if (typeof sessionStorage !== "undefined") {
    phoneNumber = getTabSpecificData("phoneNumber");
  }

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

  const simpleValidator = useRef(
    new SimpleReactValidator({
      element: (message) => (
        <div className={styles.validationMessage}>{message}</div>
      ),
      messages: {
        required: "This field is required.",
        email: "Invalid email format.",
        validMobile: "Invalid or incomplete mobile number.",
        alpha: "Should contain only alphabets.",
        alpha_space: "Should contain only alphabets.",
        validEmail: "Invalid email format.",
      },
      validators: {
        validMobile: {
          message: "Invalid or incomplete mobile number.",
          rule: (val, params, validator) => {
            const regex = /^[6789]\d{9}$/;
            return regex.test(val);
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
      },
    })
  );

  if (!isOpen) return null;

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
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

  const removeFile = (field, index) => {
    if (field === "ticket") {
      setUploadedFiles((prevState) => ({
        ...prevState,
        ticket: prevState.ticket.filter((_, i) => i !== index),
      }));
    } else {
      setUploadedFiles({
        ...uploadedFiles,
        [field]: null,
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const userId = getTabSpecificData("userID");
    const accessToken = getTabSpecificData("accessToken");
    if (!accessToken || !userId) {
      // User ID is not available, show login modal
      openPopup();
      return;
    }

    setIsLoading(true);
    try {
      const formatDate = (date) => {
        return date ? new Date(date).toISOString().split("T")[0] : "";
      };
      const payload = new FormData();
      payload.append("user_id", userId);
      payload.append("full_name", formData.fullName);
      payload.append("address", formData.address);
      payload.append("email", formData.email);
      payload.append("mobile", formData.phoneNumber || phoneNumber);
      payload.append("date_of_birth", formatDate(formData.dob));
      payload.append(
        "wedding_anniversary",
        formatDate(formData.weddingAnniversary)
      );
      payload.append("is_bus_pickup_required", formData.busServicePickup);
      payload.append("is_bus_drop_required", formData.busServiceDrop);
      payload.append("flight_arrival_time", formData.flightArrivalTime);

      uploadedFiles.ticket.forEach((file) => {
        payload.append("ticket", file);
      });

      if (uploadedFiles.aadhaar) {
        payload.append("aadhaar", uploadedFiles.aadhaar);
      }

      if (uploadedFiles.pan) {
        payload.append("pan", uploadedFiles.pan);
      }

      // payload.append("ticket", uploadedFiles.ticket);
      // payload.append("aadhar", uploadedFiles.aadhaar);
      // payload.append("pan", uploadedFiles.pan);

      const formValid = simpleValidator.current.allValid();
      if (formValid) {
        const response = await axios.post(
          `${config.EVENTS_REGISTRATION}`,
          payload,
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          }
        );
        if (response.data.status) {
          showToast("info","Registered successfully");
          setTabSpecificData("eventRegistered", true);
          updateEventUserDetails(response.data.data);
          await initFirebaseMessaging();
          await router.push("/CIT-95");
          onClose();
        }
        // Clear validation messages and reset validation state
        simpleValidator.current.hideMessages();
      } else {
        setIsLoading(false);
        simpleValidator.current.showMessages();
        forceUpdate((prevState) => !prevState); // Toggle state to force a re-render
      }
    } catch (error) {
      console.log(error);
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
      const { errors } = simpleValidator.current;
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

  const handleTimeChange = (time) => {
    setFormData({
      ...formData,
      flightArrivalTime: time,
    });
  };

  if (!isOpen) return null;

  return (
    <>
      <div style={{ position: "absolute", zIndex: "999" }}>
        {/* <div className="relative top-20 flex mx-auto w-2/3 h-3/4 shadow-lg rounded-md"> */}
        <div className={styles.maincontainer}>
          <div className={styles.imageBackground}>
            <div onClick={onClose} className={styles.crossmark1}>
              &times;
            </div>
            <div className={styles.overlay}>
              <Image
                className={styles.posiflexLogo}
                src={Posiflex}
                alt="qugoLogo"
              />
              {/* <div className={styles.text}>Welcome to Partner’s Meet !</div> */}
              <div className={styles.text1}>Converge 2024</div>
              <div className={styles.text3}>
                Date:{" "}
                <span className={styles.text2}>22nd - 24th July, 2024</span>{" "}
              </div>
              <div className={styles.text3}>
                Venue:{" "}
                <span className={styles.text2}>
                  Aamby Valley City, Lonavala
                </span>
              </div>
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
                  />
                  {simpleValidator.current.message(
                    "fullName",
                    formData.fullName,
                    "required|alpha_space|min:3|max:60"
                  )}
                </div>

                <div className={styles.bottomcontainer}>
                  <div className={styles.left}>
                    <div className={styles.formGroup}>
                      <label className={styles.label}>Email Id </label>
                      <input
                        type="text"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        className={styles.input1}
                      />
                      {simpleValidator.current.message(
                        "email",
                        formData.email,
                        "validEmail"
                      )}
                    </div>
                  </div>
                  <div className={styles.right}>
                    <div className={styles.formGroup}>
                      <label className={styles.label}>Phone Number *</label>
                      <input
                        type="text"
                        name="phoneNumber"
                        value={formData.phoneNumber || phoneNumber}
                        onChange={handleInputChange}
                        className={styles.input1}
                        autoComplete="off"
                      />
                      {simpleValidator.current.message(
                        "phoneNumber",
                        formData.phoneNumber || phoneNumber,
                        "required|validMobile"
                      )}
                    </div>
                  </div>
                </div>

                <div className={styles.bottomcontainerUp}></div>
                <button type="submit" className={styles.registerButton}>
                  {isLoading ? "Registering..." : "Register"}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default LoginModal;
