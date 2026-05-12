import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import Select from "react-select";
import AsyncSelect from "react-select/async";
import axios from "@/utils/axios/axios";
import config from "@/config";
import {
  createMasterPassenger,
  updateMasterPassenger,
} from "@/utils/masterPassengerAPI";
import { getCityByCountry } from "@/utils/common";
import showToast from "@/utils/toast";
import {
  selectB2CUserEmail,
  selectB2CUserMobile,
} from "@/store/selectors/b2cSelectors";

export default function MasterPassengerForm({
  passenger,
  onClose,
  onSaved,
  limits,
  counts,
  canAdd,
  remaining,
}) {
  const userEmail = useSelector(selectB2CUserEmail);
  const userMobile = useSelector(selectB2CUserMobile);

  const isEditMode = !!passenger;

  const [formData, setFormData] = useState({
    passengerType: "adult",
    travelCategory: "both",
    title: "",
    firstName: "",
    lastName: "",
    gender: "",
    dateOfBirth: "",
    email: "",
    contactNo: "",
    cellCountryCode: "+91",
    countryCode: "",
    countryName: { value: "", label: "" },
    nationality: "",
    city: { value: "", label: "" },
    addressLine1: "",
    addressLine2: "",
    pan: "",
    passportNo: "",
    passportExpiry: "",
    passportIssueDate: "",
    passportIssueCountryCode: { value: "", label: "", code: "" },
    guardianDetails: {
      title: "",
      firstName: "",
      lastName: "",
      pan: "",
    },
  });

  const [errors, setErrors] = useState({});
  const [isSaving, setIsSaving] = useState(false);
  const [titleOptions, setTitleOptions] = useState([]);
  const [countryOptions, setCountryOptions] = useState([]);
  const [focusedField, setFocusedField] = useState(null);

  // Passport scanning states
  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [scanStatus, setScanStatus] = useState("");
  const [passportWarnings, setPassportWarnings] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [titleResponse, countryResponse] = await Promise.all([
          axios.get(`${config.CORPORATE.USER_TITLES}`),
          axios.get(`${config.CORPORATE.COUNTRY}`),
        ]);

        if (titleResponse.data.status === "SUCCESS") {
          const titleOpts = titleResponse.data.data.map((title) => ({
            value: title.title,
            label: title.title,
          }));
          setTitleOptions(titleOpts);
        }

        if (countryResponse.data.status === "SUCCESS") {
          const countryOpts = countryResponse.data.data.map((country) => ({
            value: country._id,
            code: country.alpha2code,
            label: country.countryname,
            phoneCode: country.phonecode,
          }));
          setCountryOptions(countryOpts);
        }
      } catch (error) {
        console.log("Error fetching data:", error);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    if (passenger) {
      setFormData({
        passengerType: passenger.passengerType || "adult",
        travelCategory: passenger.travelCategory || "both",
        title: passenger.title || "",
        firstName: passenger.firstName || "",
        lastName: passenger.lastName || "",
        gender: passenger.gender || "",
        dateOfBirth: passenger.dateOfBirth
          ? new Date(passenger.dateOfBirth).toISOString().split("T")[0]
          : "",
        email: passenger.email || "",
        contactNo: passenger.contactNo || "",
        cellCountryCode: passenger.cellCountryCode || "+91",
        countryCode: passenger.countryCode || "",
        countryName: passenger.countryName || { value: "", label: "" },
        nationality: passenger.nationality || "",
        city: passenger.city || { value: "", label: "" },
        addressLine1: passenger.addressLine1 || "",
        addressLine2: passenger.addressLine2 || "",
        pan: passenger.pan || "",
        passportNo: passenger.passportNo || "",
        passportExpiry: passenger.passportExpiry
          ? new Date(passenger.passportExpiry).toISOString().split("T")[0]
          : "",
        passportIssueDate: passenger.passportIssueDate
          ? new Date(passenger.passportIssueDate).toISOString().split("T")[0]
          : "",
        passportIssueCountryCode: passenger.passportIssueCountryCode || {
          value: "",
          label: "",
          code: "",
        },
        guardianDetails: passenger.guardianDetails || {
          title: "",
          firstName: "",
          lastName: "",
          pan: "",
        },
      });
    }
  }, [passenger]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const handleCountryChange = (selectedOption) => {
    if (selectedOption) {
      setFormData((prev) => ({
        ...prev,
        countryCode: selectedOption.code,
        countryName: {
          value: selectedOption.value,
          label: selectedOption.label,
        },
        nationality: selectedOption.code,
        cellCountryCode: selectedOption.phoneCode,
        city: { value: "", label: "" },
      }));
      if (errors.country) {
        setErrors((prev) => ({ ...prev, country: "" }));
      }
    }
  };

  const handleCityChange = (selectedOption) => {
    if (selectedOption) {
      setFormData((prev) => ({
        ...prev,
        city: {
          value: selectedOption.value,
          label: selectedOption.label,
        },
      }));
      if (errors.city) {
        setErrors((prev) => ({ ...prev, city: "" }));
      }
    }
  };

  const handlePassportCountryChange = (selectedOption) => {
    if (selectedOption) {
      setFormData((prev) => ({
        ...prev,
        passportIssueCountryCode: {
          value: selectedOption.value,
          label: selectedOption.label,
          code: selectedOption.code,
        },
      }));
      if (errors.passportIssueCountry) {
        setErrors((prev) => ({ ...prev, passportIssueCountry: "" }));
      }
    }
  };

  const handleGuardianChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      guardianDetails: {
        ...prev.guardianDetails,
        [name]: value,
      },
    }));
  };

  const loadCityOptions = async (inputValue) => {
    try {
      if (inputValue && formData.countryCode) {
        const cities = await getCityByCountry(inputValue, formData.countryCode);
        const options = cities.map((city) => ({
          value: city.id,
          label: city.cityname,
        }));
        return options;
      } else {
        return [];
      }
    } catch (error) {
      console.error("Error loading cities:", error);
      return [];
    }
  };

  /**
   * Handle passport file selection and upload
   */
  const handlePassportScan = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    const validTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    if (!validTypes.includes(file.type)) {
      showToast("error", "Please upload a valid image file (JPEG, PNG, WEBP)");
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      showToast("error", "File size should not exceed 10MB");
      return;
    }

    setIsScanning(true);
    setScanProgress(0);
    setScanStatus("Uploading passport image...");
    setPassportWarnings([]);

    try {
      // Create FormData
      const formData = new FormData();
      formData.append("passport", file);

      // Simulate progress for upload
      setScanProgress(20);
      setScanStatus("Processing with AI...");

      // Call API to extract passport data
      const response = await axios.post(
        `${config.EXTRACT_PASSPORT}`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
          onUploadProgress: (progressEvent) => {
            const percentCompleted = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total,
            );
            setScanProgress(Math.min(percentCompleted, 40));
          },
        },
      );

      setScanProgress(60);
      setScanStatus("Extracting data...");

      if (response.data.status && response.data.data) {
        setScanProgress(80);
        setScanStatus("Filling form...");

        await fillFormWithExtractedData(response.data.data);

        setScanProgress(100);
        setScanStatus("Completed!");

        // Show warnings if any
        if (
          response.data.data.warnings &&
          response.data.data.warnings.length > 0
        ) {
          setPassportWarnings(response.data.data.warnings);
          showToast(
            "warning",
            `Passport scanned with warnings. Please review.`,
          );
        } else {
          showToast("success", "Passport data extracted successfully!");
        }

        // Clear progress after 2 seconds
        setTimeout(() => {
          setIsScanning(false);
          setScanProgress(0);
          setScanStatus("");
        }, 2000);
      } else {
        throw new Error(response.data.message || "Failed to extract data");
      }
    } catch (error) {
      console.error("Passport scan error:", error);
      showToast(
        "error",
        error.response?.data?.message ||
          "Failed to scan passport. Please try again.",
      );
      setIsScanning(false);
      setScanProgress(0);
      setScanStatus("");
    }

    // Reset file input
    event.target.value = "";
  };

  /**
   * Fill form with extracted passport data
   */
  const fillFormWithExtractedData = async (data) => {
    const { extractedData, resolvedData } = data;

    // Split firstName if it contains full name
    let firstName = extractedData.firstName || "";
    let lastName = extractedData.lastName || "";

    // If firstName contains spaces, split it
    if (firstName.includes(" ") && !lastName) {
      const nameParts = firstName.trim().split(" ");
      if (nameParts.length > 1) {
        lastName = nameParts.pop();
        firstName = nameParts.join(" ");
      }
    }

    // Prepare updated form data
    const updatedFormData = {
      ...formData,
      // Title from resolved data (derived from gender if not extracted)
      title: resolvedData?.title?.title || formData.title,
      // Names
      firstName: firstName,
      lastName: lastName,
      email: userEmail || formData.email,
      contactNo: userMobile || formData.contactNo,
      // Gender
      gender: extractedData.gender || formData.gender,
      // Date of Birth
      dateOfBirth: extractedData.dateOfBirth || formData.dateOfBirth,
      // Passport Details
      passportNo: extractedData.passportNo || formData.passportNo,
      passportExpiry: extractedData.passportExpiry || formData.passportExpiry,
      passportIssueDate:
        extractedData.passportIssueDate || formData.passportIssueDate,
    };

    // Handle nationality country
    if (resolvedData?.nationalityCountry) {
      const country = resolvedData.nationalityCountry;
      updatedFormData.countryCode = country.alpha2code;
      updatedFormData.nationality = country.alpha2code;
      updatedFormData.countryName = {
        value: country._id,
        label: country.countryname,
      };
      updatedFormData.cellCountryCode = country.phonecode;
    }

    // Handle passport issue country
    if (resolvedData?.issueCountry) {
      const issueCountry = resolvedData.issueCountry;
      updatedFormData.passportIssueCountryCode = {
        value: issueCountry._id,
        label: issueCountry.countryname,
        code: issueCountry.alpha2code,
      };
    }

    // Handle address
    if (extractedData.address) {
      updatedFormData.addressLine1 = extractedData.address;
    }

    // Handle city (needs to be done after country is set)
    if (resolvedData?.birthPlace && resolvedData?.nationalityCountry) {
      const birthPlace = resolvedData.birthPlace;
      updatedFormData.city = {
        value: birthPlace.id,
        label: birthPlace.cityname,
      };
    }

    setFormData(updatedFormData);
  };

  const customComponents = {
    IndicatorSeparator: () => null,
    DropdownIndicator: (props) => (
      <div className="px-2 text-[#028FA3]">
        <svg
          width="12"
          height="8"
          viewBox="0 0 12 8"
          fill="none"
          style={{
            transform: props.selectProps.menuIsOpen
              ? "rotate(180deg)"
              : "rotate(0deg)",
            transition: "transform 0.2s ease",
          }}
        >
          <path
            d="M1 1.5L6 6.5L11 1.5"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
    ),
  };

  const handleFocus = (field) => setFocusedField(field);
  const handleBlur = () => setFocusedField(null);

  const validateForm = () => {
    const newErrors = {};

    // Basic validation
    if (!formData.title) newErrors.title = "Title is required";
    if (!formData.firstName || formData.firstName.length < 1)
      newErrors.firstName = "First name is required (min 1 character)";
    if (!formData.lastName || formData.lastName.length < 2)
      newErrors.lastName = "Last name is required (min 2 characters)";

    // Email validation - MANDATORY
    if (!formData.email) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Invalid email format";
    }

    // Contact number validation - MANDATORY
    if (!formData.contactNo) {
      newErrors.contactNo = "Contact number is required";
    } else if (!/^\d{10}$/.test(formData.contactNo)) {
      newErrors.contactNo = "Contact number must be 10 digits";
    }

    // Country validation - MANDATORY
    if (!formData.countryName.value) {
      newErrors.country = "Country is required";
    }

    // City validation - MANDATORY
    if (!formData.city.value) {
      newErrors.city = "City is required";
    }

    // Address validation - MANDATORY
    if (!formData.addressLine1 || formData.addressLine1.trim().length < 3) {
      newErrors.addressLine1 = "Address is required (min 3 characters)";
    }

    // Passport validation - MANDATORY
    if (!formData.passportNo) {
      newErrors.passportNo = "Passport number is required";
    }

    if (!formData.passportIssueDate) {
      newErrors.passportIssueDate = "Passport issue date is required";
    }

    if (!formData.passportExpiry) {
      newErrors.passportExpiry = "Passport expiry date is required";
    }

    if (!formData.passportIssueCountryCode.value) {
      newErrors.passportIssueCountry = "Passport issue country is required";
    }

    // PAN validation (optional but format check if provided)
    if (formData.pan && !/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(formData.pan)) {
      newErrors.pan = "Invalid PAN format";
    }

    // Validate guardian details for infants
    if (formData.passengerType === "infant") {
      if (!formData.guardianDetails.title)
        newErrors.guardianTitle = "Guardian title is required for infants";
      if (!formData.guardianDetails.firstName)
        newErrors.guardianFirstName =
          "Guardian first name is required for infants";
      if (!formData.guardianDetails.lastName)
        newErrors.guardianLastName =
          "Guardian last name is required for infants";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      showToast("error", "Please fix the errors in the form");
      return;
    }

    setIsSaving(true);

    try {
      let result;
      if (isEditMode) {
        result = await updateMasterPassenger(passenger._id, formData);
      } else {
        result = await createMasterPassenger(formData);
      }

      if (result.success) {
        showToast(
          "success",
          isEditMode
            ? "Passenger updated successfully"
            : "Passenger saved successfully",
        );
        if (onSaved) onSaved();
      } else {
        showToast("error", result.message);
      }
    } catch (error) {
      showToast("error", "Failed to save passenger");
    } finally {
      setIsSaving(false);
    }
  };

  const getCategoryWarning = (category) => {
    if (isEditMode && passenger?.travelCategory === category) {
      return null;
    }

    switch (category) {
      case "flights":
        if (!canAdd?.canAddFlight) {
          return `Flight passenger limit reached (${counts?.effectiveFlightCount}/${limits?.maxFlightPassengersLimit})`;
        }
        break;
      case "hotel":
        if (!canAdd?.canAddHotel) {
          return `Hotel passenger limit reached (${counts?.effectiveHotelCount}/${limits?.maxHotelPassengersLimit})`;
        }
        break;
      case "both":
        if (!canAdd?.canAddBoth) {
          return "Cannot add passenger for both categories. One or more limits reached.";
        }
        break;
    }
    return null;
  };

  const selectStyles = {
    control: (provided, state) => ({
      ...provided,
      backgroundColor: "transparent",
      border: state.isFocused ? "2px solid #028FA3" : "1px solid #dee2e6",
      boxShadow: "none",
      borderRadius: "0.375rem",
      padding: "0.175rem 0.3rem",
      fontSize: "1rem",
      cursor: "pointer",
      "&:hover": {
        borderColor: "#028FA3",
      },
    }),
    placeholder: (provided) => ({
      ...provided,
      color: "#6c757d",
    }),
    singleValue: (provided) => ({
      ...provided,
      color: "#212529",
    }),
    menu: (provided) => ({
      ...provided,
      zIndex: 1050,
    }),
  };

  return (
    <div style={{ maxHeight: "calc(100vh - 200px)", overflowY: "auto" }}>
      {/* Header */}
      <div
        className="sticky-top bg-white pb-3 mb-3"
        style={{ top: 0, zIndex: 10, borderBottom: "2px solid #f0f0f0" }}
      >
        <div className="d-flex justify-content-between align-items-center">
          <h4 className="mb-0 fw-bold text-dark">
            {isEditMode ? "Edit Passenger" : "Add New Passenger"}
          </h4>
          <button
            type="button"
            className="btn btn-outline-secondary btn-sm"
            onClick={onClose}
          >
            <i className="bi bi-arrow-left me-2"></i>
            Back to List
          </button>
        </div>
      </div>

      {/* Passport Scan Section */}
      <div className="card mb-4 shadow-sm border-info">
        <div className="card-body bg-info bg-opacity-10">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h5 className="card-title mb-0 text-info">
              <i className="bi bi-passport me-2"></i>
              Quick Fill with Passport Scan
            </h5>
            <label
              htmlFor="passportScanInput"
              className="btn btn-info btn-sm"
              style={{ cursor: "pointer" }}
            >
              {isScanning ? (
                <>
                  <span
                    className="spinner-border spinner-border-sm me-2"
                    role="status"
                    aria-hidden="true"
                  ></span>
                  Scanning...
                </>
              ) : (
                <>
                  <i className="bi bi-camera-fill me-2"></i>
                  Scan Passport
                </>
              )}
            </label>
            <input
              type="file"
              id="passportScanInput"
              accept="image/*"
              onChange={handlePassportScan}
              style={{ display: "none" }}
              disabled={isScanning}
            />
          </div>

          {/* Progress Bar */}
          {isScanning && (
            <div className="mb-3">
              <div className="d-flex justify-content-between align-items-center mb-2">
                <small className="text-muted fw-semibold">{scanStatus}</small>
                <small className="text-muted fw-semibold">
                  {scanProgress}%
                </small>
              </div>
              <div className="progress" style={{ height: "8px" }}>
                <div
                  className="progress-bar progress-bar-striped progress-bar-animated bg-info"
                  role="progressbar"
                  style={{ width: `${scanProgress}%` }}
                  aria-valuenow={scanProgress}
                  aria-valuemin="0"
                  aria-valuemax="100"
                ></div>
              </div>
            </div>
          )}

          {/* Warnings */}
          {passportWarnings.length > 0 && (
            <div className="alert alert-warning mb-0 py-2">
              <div className="d-flex align-items-start">
                <i className="bi bi-exclamation-triangle-fill me-2 mt-1"></i>
                <div>
                  <strong>Please review:</strong>
                  <ul className="mb-0 mt-1 ps-3">
                    {passportWarnings.map((warning, index) => (
                      <li key={index}>
                        <small>{warning}</small>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}

          {!isScanning && passportWarnings.length === 0 && (
            <p className="text-muted small mb-0">
              <i className="bi bi-info-circle me-1"></i>
              Upload a clear photo of your passport to auto-fill the form.
              Supports JPG, PNG, WEBP (max 10MB).
            </p>
          )}
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        {/* Passenger Type and Category */}
        <div className="card mb-4 shadow-sm">
          <div className="card-body">
            <h5 className="card-title mb-3 text-primary">
              <i className="bi bi-person-badge me-2"></i>
              Passenger Classification
            </h5>
            <div className="row g-3">
              <div className="col-md-6">
                <label className="form-label fw-semibold">
                  Passenger Type <span className="text-danger">*</span>
                </label>
                <select
                  name="passengerType"
                  value={formData.passengerType}
                  onChange={handleChange}
                  className="form-select"
                >
                  <option value="adult">Adult</option>
                  <option value="child">Child</option>
                  <option value="infant">Infant</option>
                </select>
              </div>
              <div className="col-md-6">
                <label className="form-label fw-semibold">
                  Travel Category <span className="text-danger">*</span>
                </label>
                <select
                  name="travelCategory"
                  value={formData.travelCategory}
                  onChange={handleChange}
                  className="form-select"
                >
                  <option value="both">
                    Both Flights & Hotels
                    {!isEditMode &&
                      remaining?.flightRemaining !== undefined &&
                      ` (${Math.min(
                        remaining.flightRemaining,
                        remaining.hotelRemaining,
                      )} slots)`}
                  </option>
                  <option value="flights">
                    Flights Only
                    {!isEditMode &&
                      remaining?.flightRemaining !== undefined &&
                      ` (${remaining.flightRemaining} slots)`}
                  </option>
                  <option value="hotel">
                    Hotels Only
                    {!isEditMode &&
                      remaining?.hotelRemaining !== undefined &&
                      ` (${remaining.hotelRemaining} slots)`}
                  </option>
                </select>

                {!isEditMode && getCategoryWarning(formData.travelCategory) && (
                  <div
                    className="alert alert-warning mt-2 mb-0 d-flex align-items-center py-2"
                    role="alert"
                  >
                    <i className="bi bi-exclamation-triangle-fill me-2"></i>
                    <small>{getCategoryWarning(formData.travelCategory)}</small>
                  </div>
                )}

                {!isEditMode &&
                  !getCategoryWarning(formData.travelCategory) &&
                  remaining && (
                    <small className="text-muted mt-1 d-block">
                      {formData.travelCategory === "flights" &&
                        `${remaining.flightRemaining} flight slot(s) remaining`}
                      {formData.travelCategory === "hotel" &&
                        `${remaining.hotelRemaining} hotel slot(s) remaining`}
                      {formData.travelCategory === "both" &&
                        `Available: ${remaining.flightRemaining} flight, ${remaining.hotelRemaining} hotel`}
                    </small>
                  )}
              </div>
            </div>
          </div>
        </div>

        {/* Basic Information */}
        <div className="card mb-4 shadow-sm">
          <div className="card-body">
            <h5 className="card-title mb-3 text-primary">
              <i className="bi bi-person-fill me-2"></i>
              Basic Information
            </h5>
            <div className="row g-3">
              <div className="col-md-4">
                <label className="form-label fw-semibold">
                  Title <span className="text-danger">*</span>
                </label>
                <div
                  style={{
                    position: "relative",
                    zIndex: focusedField === "title" ? 50 : 10,
                  }}
                >
                  <Select
                    name="title"
                    placeholder="Select Title"
                    value={
                      formData.title
                        ? titleOptions.find(
                            (opt) => opt.value === formData.title,
                          )
                        : null
                    }
                    onChange={(selectedOption) => {
                      handleChange({
                        target: {
                          name: "title",
                          value: selectedOption?.value || "",
                        },
                      });
                    }}
                    options={titleOptions}
                    classNamePrefix="custom-select"
                    components={customComponents}
                    isSearchable
                    onFocus={() => handleFocus("title")}
                    onBlur={handleBlur}
                    styles={selectStyles}
                  />
                </div>
                {errors.title && (
                  <div className="text-danger small mt-1">{errors.title}</div>
                )}
              </div>
              <div className="col-md-4">
                <label className="form-label fw-semibold">
                  First Name <span className="text-danger">*</span>
                </label>
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  onInput={(e) => {
                    e.target.value = e.target.value.replace(/[^A-Za-z ]/g, "");
                  }}
                  maxLength={33}
                  className={`form-control ${
                    errors.firstName ? "is-invalid" : ""
                  }`}
                  placeholder="Enter first name"
                />
                {errors.firstName && (
                  <div className="invalid-feedback">{errors.firstName}</div>
                )}
              </div>
              <div className="col-md-4">
                <label className="form-label fw-semibold">
                  Last Name <span className="text-danger">*</span>
                </label>
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  onInput={(e) => {
                    e.target.value = e.target.value.replace(/[^A-Za-z ]/g, "");
                  }}
                  maxLength={50}
                  className={`form-control ${
                    errors.lastName ? "is-invalid" : ""
                  }`}
                  placeholder="Enter last name"
                />
                {errors.lastName && (
                  <div className="invalid-feedback">{errors.lastName}</div>
                )}
              </div>
            </div>

            <div className="row g-3 mt-2">
              <div className="col-md-6">
                <label className="form-label fw-semibold">Date of Birth</label>
                <input
                  type="date"
                  name="dateOfBirth"
                  value={formData.dateOfBirth}
                  onChange={handleChange}
                  max={new Date().toISOString().split("T")[0]}
                  className="form-control"
                />
              </div>
              <div className="col-md-6">
                <label className="form-label fw-semibold">Gender</label>
                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  className="form-select"
                >
                  <option value="">Select Gender</option>
                  <option value="1">Male</option>
                  <option value="2">Female</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Contact Information */}
        <div className="card mb-4 shadow-sm">
          <div className="card-body">
            <h5 className="card-title mb-3 text-primary">
              <i className="bi bi-envelope-fill me-2"></i>
              Contact Information
            </h5>
            <div className="row g-3">
              <div className="col-md-6">
                <label className="form-label fw-semibold">
                  Email <span className="text-danger">*</span>
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={`form-control ${errors.email ? "is-invalid" : ""}`}
                  placeholder="example@email.com"
                />
                {errors.email && (
                  <div className="invalid-feedback">{errors.email}</div>
                )}
              </div>
              <div className="col-md-6">
                <label className="form-label fw-semibold">
                  Contact Number <span className="text-danger">*</span>
                </label>
                <input
                  type="tel"
                  name="contactNo"
                  value={formData.contactNo}
                  onChange={handleChange}
                  onInput={(e) => {
                    e.target.value = e.target.value.replace(/[^0-9]/g, "");
                  }}
                  maxLength={10}
                  className={`form-control ${
                    errors.contactNo ? "is-invalid" : ""
                  }`}
                  placeholder="10-digit mobile number"
                />
                {errors.contactNo && (
                  <div className="invalid-feedback">{errors.contactNo}</div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Address Information */}
        <div className="card mb-4 shadow-sm">
          <div className="card-body">
            <h5 className="card-title mb-3 text-primary">
              <i className="bi bi-geo-alt-fill me-2"></i>
              Address Information
            </h5>
            <div className="row g-3">
              <div className="col-md-6">
                <label className="form-label fw-semibold">
                  Country <span className="text-danger">*</span>
                </label>
                <div
                  style={{
                    position: "relative",
                    zIndex: focusedField === "country" ? 50 : 10,
                  }}
                >
                  <Select
                    name="country"
                    placeholder="Select Country"
                    value={
                      formData.countryName.value ? formData.countryName : null
                    }
                    onChange={handleCountryChange}
                    options={countryOptions}
                    classNamePrefix="custom-select"
                    components={customComponents}
                    isSearchable
                    onFocus={() => handleFocus("country")}
                    onBlur={handleBlur}
                    styles={selectStyles}
                  />
                </div>
                {errors.country && (
                  <div className="text-danger small mt-1">{errors.country}</div>
                )}
              </div>
              <div className="col-md-6">
                <label className="form-label fw-semibold">
                  City <span className="text-danger">*</span>
                </label>
                <div
                  style={{
                    position: "relative",
                    zIndex: focusedField === "city" ? 50 : 10,
                  }}
                >
                  <AsyncSelect
                    name="city"
                    placeholder={
                      formData.countryCode
                        ? "Search City"
                        : "Select country first"
                    }
                    value={formData.city.value ? formData.city : null}
                    onChange={handleCityChange}
                    loadOptions={loadCityOptions}
                    classNamePrefix="custom-select"
                    components={customComponents}
                    isSearchable
                    isDisabled={!formData.countryCode}
                    onFocus={() => handleFocus("city")}
                    onBlur={handleBlur}
                    cacheOptions
                    defaultOptions
                    styles={selectStyles}
                  />
                </div>
                {errors.city && (
                  <div className="text-danger small mt-1">{errors.city}</div>
                )}
              </div>
            </div>

            <div className="row g-3 mt-2">
              <div className="col-12">
                <label className="form-label fw-semibold">
                  Address Line 1 <span className="text-danger">*</span>
                </label>
                <input
                  type="text"
                  name="addressLine1"
                  value={formData.addressLine1}
                  onChange={handleChange}
                  className={`form-control ${
                    errors.addressLine1 ? "is-invalid" : ""
                  }`}
                  placeholder="Street address, P.O. box, company name"
                />
                {errors.addressLine1 && (
                  <div className="invalid-feedback">{errors.addressLine1}</div>
                )}
              </div>
            </div>

            <div className="row g-3 mt-2">
              <div className="col-12">
                <label className="form-label fw-semibold">Address Line 2</label>
                <input
                  type="text"
                  name="addressLine2"
                  value={formData.addressLine2}
                  onChange={handleChange}
                  className="form-control"
                  placeholder="Apartment, suite, unit, building, floor, etc."
                />
              </div>
            </div>

            <div className="row g-3 mt-2">
              <div className="col-md-6">
                <label className="form-label fw-semibold">Nationality</label>
                <select
                  name="nationality"
                  value={formData.nationality}
                  onChange={handleChange}
                  className="form-select"
                >
                  <option value="">Select Nationality</option>
                  {countryOptions.map((country) => (
                    <option key={country.code} value={country.code}>
                      {country.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="col-md-6">
                <label className="form-label fw-semibold">PAN</label>
                <input
                  type="text"
                  name="pan"
                  value={formData.pan}
                  onChange={handleChange}
                  onInput={(e) => {
                    e.target.value = e.target.value.toUpperCase();
                  }}
                  maxLength={10}
                  placeholder="ABCDE1234F"
                  className={`form-control ${errors.pan ? "is-invalid" : ""}`}
                />
                {errors.pan && (
                  <div className="invalid-feedback">{errors.pan}</div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Passport Details */}
        <div className="card mb-4 shadow-sm border-primary">
          <div className="card-body">
            <h5 className="card-title mb-3 text-primary">
              <i className="bi bi-passport me-2"></i>
              Passport Details <span className="text-danger">*</span>
            </h5>
            <div className="row g-3">
              <div className="col-md-6">
                <label className="form-label fw-semibold">
                  Passport Number <span className="text-danger">*</span>
                </label>
                <input
                  type="text"
                  name="passportNo"
                  value={formData.passportNo}
                  onChange={handleChange}
                  onInput={(e) => {
                    e.target.value = e.target.value.toUpperCase();
                  }}
                  maxLength={15}
                  className={`form-control ${
                    errors.passportNo ? "is-invalid" : ""
                  }`}
                  placeholder="Enter passport number"
                />
                {errors.passportNo && (
                  <div className="invalid-feedback">{errors.passportNo}</div>
                )}
              </div>
              <div className="col-md-6">
                <label className="form-label fw-semibold">
                  Passport Issue Country <span className="text-danger">*</span>
                </label>
                <div
                  style={{
                    position: "relative",
                    zIndex: focusedField === "passportCountry" ? 50 : 10,
                  }}
                >
                  <Select
                    name="passportIssueCountryCode"
                    placeholder="Select Country"
                    value={
                      formData.passportIssueCountryCode.value
                        ? formData.passportIssueCountryCode
                        : null
                    }
                    onChange={handlePassportCountryChange}
                    options={countryOptions}
                    classNamePrefix="custom-select"
                    components={customComponents}
                    isSearchable
                    onFocus={() => handleFocus("passportCountry")}
                    onBlur={handleBlur}
                    styles={selectStyles}
                  />
                </div>
                {errors.passportIssueCountry && (
                  <div className="text-danger small mt-1">
                    {errors.passportIssueCountry}
                  </div>
                )}
              </div>
            </div>

            <div className="row g-3 mt-2">
              <div className="col-md-6">
                <label className="form-label fw-semibold">
                  Passport Issue Date <span className="text-danger">*</span>
                </label>
                <input
                  type="date"
                  name="passportIssueDate"
                  value={formData.passportIssueDate}
                  onChange={handleChange}
                  className={`form-control ${
                    errors.passportIssueDate ? "is-invalid" : ""
                  }`}
                />
                {errors.passportIssueDate && (
                  <div className="invalid-feedback">
                    {errors.passportIssueDate}
                  </div>
                )}
              </div>
              <div className="col-md-6">
                <label className="form-label fw-semibold">
                  Passport Expiry Date <span className="text-danger">*</span>
                </label>
                <input
                  type="date"
                  name="passportExpiry"
                  value={formData.passportExpiry}
                  onChange={handleChange}
                  className={`form-control ${
                    errors.passportExpiry ? "is-invalid" : ""
                  }`}
                />
                {errors.passportExpiry && (
                  <div className="invalid-feedback">
                    {errors.passportExpiry}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Guardian Details (for Infants) */}
        {formData.passengerType === "infant" && (
          <div className="card mb-4 shadow-sm border-warning">
            <div className="card-body bg-warning bg-opacity-10">
              <h5 className="card-title mb-3 text-warning">
                <i className="bi bi-person-hearts me-2"></i>
                Guardian Details{" "}
                <span className="text-danger">(Required for Infants)</span>
              </h5>
              <div className="row g-3">
                <div className="col-md-3">
                  <label className="form-label fw-semibold">
                    Title <span className="text-danger">*</span>
                  </label>
                  <select
                    name="title"
                    value={formData.guardianDetails.title}
                    onChange={handleGuardianChange}
                    className={`form-select ${
                      errors.guardianTitle ? "is-invalid" : ""
                    }`}
                  >
                    <option value="">Select</option>
                    <option value="Mr">Mr</option>
                    <option value="Mrs">Mrs</option>
                    <option value="Ms">Ms</option>
                  </select>
                  {errors.guardianTitle && (
                    <div className="invalid-feedback">
                      {errors.guardianTitle}
                    </div>
                  )}
                </div>
                <div className="col-md-3">
                  <label className="form-label fw-semibold">
                    First Name <span className="text-danger">*</span>
                  </label>
                  <input
                    type="text"
                    name="firstName"
                    value={formData.guardianDetails.firstName}
                    onChange={handleGuardianChange}
                    onInput={(e) => {
                      e.target.value = e.target.value.replace(
                        /[^A-Za-z ]/g,
                        "",
                      );
                    }}
                    maxLength={33}
                    className={`form-control ${
                      errors.guardianFirstName ? "is-invalid" : ""
                    }`}
                    placeholder="Guardian first name"
                  />
                  {errors.guardianFirstName && (
                    <div className="invalid-feedback">
                      {errors.guardianFirstName}
                    </div>
                  )}
                </div>
                <div className="col-md-3">
                  <label className="form-label fw-semibold">
                    Last Name <span className="text-danger">*</span>
                  </label>
                  <input
                    type="text"
                    name="lastName"
                    value={formData.guardianDetails.lastName}
                    onChange={handleGuardianChange}
                    onInput={(e) => {
                      e.target.value = e.target.value.replace(
                        /[^A-Za-z ]/g,
                        "",
                      );
                    }}
                    maxLength={50}
                    className={`form-control ${
                      errors.guardianLastName ? "is-invalid" : ""
                    }`}
                    placeholder="Guardian last name"
                  />
                  {errors.guardianLastName && (
                    <div className="invalid-feedback">
                      {errors.guardianLastName}
                    </div>
                  )}
                </div>
                <div className="col-md-3">
                  <label className="form-label fw-semibold">
                    PAN (Optional)
                  </label>
                  <input
                    type="text"
                    name="pan"
                    value={formData.guardianDetails.pan}
                    onChange={handleGuardianChange}
                    onInput={(e) => {
                      e.target.value = e.target.value.toUpperCase();
                    }}
                    maxLength={10}
                    placeholder="ABCDE1234F"
                    className="form-control"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div
          className="sticky-bottom bg-white pt-3 pb-3 mt-4 text-center"
          style={{ bottom: 0, zIndex: 10, borderTop: "2px solid #f0f0f0" }}
        >
          <button
            type="submit"
            className="btn btn-lg px-5 me-3"
            style={{
              backgroundColor: "#028FA3",
              color: "white",
              border: "none",
              borderRadius: "50px",
            }}
            disabled={isSaving}
          >
            {isSaving ? (
              <>
                <span
                  className="spinner-border spinner-border-sm me-2"
                  role="status"
                  aria-hidden="true"
                ></span>
                Saving...
              </>
            ) : (
              <>
                <i className="bi bi-save me-2"></i>
                {isEditMode ? "Update Passenger" : "Save Passenger"}
              </>
            )}
          </button>
          <button
            type="button"
            className="btn btn-secondary btn-lg px-5"
            style={{ borderRadius: "50px" }}
            onClick={onClose}
            disabled={isSaving}
          >
            <i className="bi bi-x-circle me-2"></i>
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
