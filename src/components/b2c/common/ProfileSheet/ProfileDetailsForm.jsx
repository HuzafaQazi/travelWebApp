import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { selectB2CProfile } from "@/store/selectors/b2cSelectors";
import { updateUserProfile } from "@/store/initializeB2CStore";
import style from "./styles.module.css";
import showToast from "@/utils/toast";

export default function ProfileDetailsForm({ isCompletionMode = false }) {
  const profile = useSelector(selectB2CProfile);

  const [firstName, setFirstName] = useState("");
  const [firstNameError, setFirstNameError] = useState("");
  const [lastName, setLastName] = useState("");
  const [lastNameError, setLastNameError] = useState("");
  const [mobile, setMobile] = useState("");
  const [mobileError, setMobileError] = useState("");
  const [emailID, setEmailID] = useState("");
  const [emailError, setEmailError] = useState("");
  const [isToastVisible, setIsToastVisible] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Validation Regex
  const nameRegex = /^[A-Za-z\s-]+$/;
  const mobileNumberRegex = /^\d{10}$/;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  // Populate form from Redux
  useEffect(() => {
    if (profile) {
      setFirstName(profile.firstName || "");
      setLastName(profile.lastName || "");
      setMobile(profile.mobile || "");
      setEmailID(profile.email || "");
    }
  }, [profile]);

  const handleFirstNameChange = (event) => {
    const value = event.target.value;
    setFirstName(value);

    // Validate the first name length
    if (value.trim().length < 3 || value.trim().length > 30) {
      setFirstNameError("Please enter a valid name");
    } else if (!nameRegex.test(value)) {
      setFirstNameError("Please enter a valid name");
    } else {
      setFirstNameError("");
    }
  };

  const handleLastNameChange = (event) => {
    const value = event.target.value;
    setLastName(value);

    // Validate the last name length
    if (value.trim().length < 1 || value.trim().length > 30) {
      setLastNameError("Please enter a valid name");
    } else if (!nameRegex.test(value)) {
      setLastNameError("Please enter a valid name");
    } else {
      setLastNameError("");
    }
  };

  const handleMobileNumberChange = (event) => {
    const value = event.target.value;
    setMobile(value);

    if (value.trim() === "") {
      setMobileError("Mobile Number is required");
    }
    if (!mobileNumberRegex.test(value)) {
      setMobileError("Please enter a valid Mobile Number");
    } else {
      setMobileError("");
    }
  };

  const handleEmailChange = (event) => {
    const value = event.target.value;
    setEmailID(value);

    if (!emailRegex.test(value)) {
      setEmailError("Please enter a valid Email id");
    } else {
      setEmailError("");
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    // Initialize error variables
    let firstNameError = "";
    let lastNameError = "";
    let mobileError = "";
    let emailError = "";

    // Validate each field and set error messages
    if (firstName.trim() === "") {
      firstNameError = "First name is required ";
    }

    if (lastName.trim() === "") {
      lastNameError = "Last name is required ";
    }

    if (mobile.trim() === "") {
      mobileError = "Mobile number is required ";
    }

    if (emailID.trim() === "") {
      emailError = "Email ID is required ";
    }

    // Update state with error messages
    setFirstNameError(firstNameError);
    setLastNameError(lastNameError);
    setMobileError(mobileError);
    setEmailError(emailError);

    // Check if there are any errors
    if (firstNameError || lastNameError || mobileError || emailError) {
      return;
    }

    setIsSaving(true);

    // Use Redux sync function to update
    try {
      const result = await updateUserProfile({
        firstName: firstName,
        lastName: lastName,
        mobile: mobile,
        email: emailID,
      });

      if (result.success) {
        showToast(
          "success",
          isCompletionMode
            ? "Profile completed successfully! 🎉"
            : "Profile updated successfully"
        );
      } else {
        if (!isToastVisible) {
          showToast("error", result.error || "Failed to update profile");
        }
      }
    } catch (error) {
      if (!isToastVisible) showToast("error", "Error updating profile");
      console.error("Catch for update user", error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {isCompletionMode && (
        <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-6">
          <p className="text-sm text-blue-700">
            Please fill in all required fields marked with{" "}
            <span className="text-red-500 font-bold">*</span>
          </p>
        </div>
      )}
      <div className={style.nameDivide}>
        <div className={style.namediff}>
          <label
            htmlFor="firstName"
            className={`form-label ${style.textFieldTitle}`}
          >
            First Name <span className={style.redAsterisk}>*</span>
          </label>
          <input
            type="text"
            className="form-control"
            id="firstName"
            value={firstName}
            onChange={handleFirstNameChange}
            onInput={(e) => {
              e.target.value = e.target.value.replace(/[^A-Za-z\s]/g, "");
            }}
            maxLength={30}
          />
          {firstNameError && <p className="text-danger">{firstNameError}</p>}
        </div>

        <div className={style.namediff}>
          <label
            htmlFor="lastName"
            className={`form-label ${style.textFieldTitle}`}
          >
            Last Name <span className={style.redAsterisk}>*</span>
          </label>
          <input
            type="text"
            className="form-control"
            id="lastName"
            onChange={handleLastNameChange}
            value={lastName}
            onInput={(e) => {
              e.target.value = e.target.value.replace(/[^A-Za-z\s]/g, "");
            }}
            maxLength={30}
          />
          {lastNameError && <p className="text-danger">{lastNameError}</p>}
        </div>
      </div>
      <div className="mb-3">
        <label
          htmlFor="mobileNumber"
          className={`form-label ${style.textFieldTitle}`}
        >
          Mobile Number <span className={style.redAsterisk}>*</span>
        </label>
        <input
          type="tel"
          className="form-control"
          id="mobileNumber"
          onChange={handleMobileNumberChange}
          value={mobile}
          onInput={(e) => {
            e.target.value = e.target.value.replace(/[^0-9]/g, "");
          }}
          maxLength={10}
          readOnly
        />
        {mobileError && <p className="text-danger">{mobileError}</p>}
      </div>
      <div className="mb-3">
        <label htmlFor="email" className={`form-label ${style.textFieldTitle}`}>
          Email Address <span className={style.redAsterisk}>*</span>
        </label>
        <input
          type="email"
          className="form-control"
          id="email"
          onChange={handleEmailChange}
          value={emailID}
        />
        {emailError && <p className="text-danger">{emailError}</p>}
      </div>

      <div className="text-center mt-4">
        <button
          className="btn btn-primary btn-rounded"
          style={{
            borderRadius: "50px",
            backgroundColor: "#028FA3",
            border: "none",
            paddingLeft: "48px",
            paddingRight: "48px",
            paddingTop: "18px",
            paddingBottom: "18px",
            boxShadow: "5px 5px 10px 2px rgba(0,0,0,.2)",
          }}
          type="submit"
          onClick={handleSubmit}
          disabled={isSaving}
        >
          {isSaving
            ? "Saving..."
            : isCompletionMode
            ? "Complete Profile"
            : "Save"}
        </button>
      </div>
    </form>
  );
}
