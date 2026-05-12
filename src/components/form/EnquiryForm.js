import { useState, useRef } from "react";
import SimpleReactValidator from "simple-react-validator";

import styles from "./EnquiryForm.module.css";

export default function EnquiryForm({
  formData,
  setFormData,
  onSubmit,
  isLoading,
}) {
  const [, forceUpdate] = useState(0);
  const simpleValidator = useRef(
    new SimpleReactValidator({
      element: (message) => <div className="text-danger">{message}</div>,
      messages: {
        required: "This field is required.",
        email: "Invalid email format.",
        validMobile: "Invalid or incomplete Indian mobile number.",
      },
      validators: {
        validMobile: {
          message: "Invalid or incomplete Indian mobile number.",
          rule: (val, params, validator) => {
            const regex = /^[6789]\d{9}$/;
            return regex.test(val);
          },
        },
      },
    })
  );

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const currentDate = new Date().toISOString().split("T")[0];
  const handleChange1 = (e) => {
    const { name, value } = e.target;

    const cleanValue = value.replace(/[^0-9]/g, "");

    const intValue = parseInt(cleanValue, 10);

    if (!isNaN(intValue) && intValue > 0) {
      setFormData((prevData) => ({ ...prevData, [name]: intValue }));
    } else if (value === "") {
      setFormData((prevData) => ({ ...prevData, [name]: "" }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const formValid = simpleValidator.current.allValid();

    if (formValid) {
      onSubmit(formData);
      simpleValidator.current.hideMessages();
    } else {
      simpleValidator.current.showMessages();
      forceUpdate((prevState) => !prevState); // Toggle state to force a re-render
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className={styles.FormContent}>
        <div className={styles.formHead}>Fill your details</div>

        <div className={styles.formAbout}>
          This data will only be used by our team to contact you and no other
          purposes.
        </div>

        {/* Mobile Number */}

        <div className={styles.formRow}>
          <label className={styles.inputHead}>
            Mobile Number
            <span className={styles.requiredField}>*</span>
          </label>

          <div className={styles.formInput}>
            <input
              className={styles.inputPlace}
              type="text"
              placeholder="+91"
              style={{ width: "15%", marginRight: "2%" }}
              name="countryCode"
              value={formData.countryCode}
              onChange={handleChange}
              readOnly
            />

            <input
              maxLength={10}
              onInput={(e) => {
                const inputValue = e.target.value;
                if (/^[5-9][0-9]*$/.test(inputValue)) {
                  e.target.value = inputValue;
                } else {
                  e.target.value = "";
                }
              }}
              className={styles.inputPlace}
              type="text"
              placeholder="Enter your mobile number here"
              style={{ width: "calc(83% - 0px)" }}
              name="mobileNumber"
              value={formData.mobileNumber}
              onChange={handleChange}
            />
          </div>
          {simpleValidator.current.message(
            "mobileNumber",
            formData.mobileNumber,
            "required|numeric|min:10|max:10|validMobile"
          )}
        </div>

        {/* Name */}

        <div className={styles.formRow}>
          <label className={styles.inputHead}>
            Name
            <span className={styles.requiredField}>*</span>
          </label>

          <div className={styles.formInput}>
            <input
              className={styles.inputPlace}
              type="Enter your name here"
              placeholder="Name"
              style={{ width: "100%" }}
              name="name"
              value={formData.name}
              onChange={handleChange}
            />
          </div>
          {simpleValidator.current.message("name", formData.name, "required")}
        </div>

        {/* Email */}

        <div className={styles.formRow}>
          <label className={styles.inputHead}>
            Email
            <span className={styles.requiredField}>*</span>
          </label>

          <div className={styles.formInput}>
            <input
              className={styles.inputPlace}
              type="Enter your email address here"
              placeholder="Email"
              style={{ width: "100%" }}
              name="email"
              value={formData.email}
              onChange={handleChange}
            />
          </div>
          {simpleValidator.current.message(
            "email",
            formData.email,
            "required|email"
          )}
        </div>

        {/* Destination */}

        <div className={styles.formRow}>
          <label className={styles.inputHead}>
            Destination
            <span className={styles.requiredField}>*</span>
          </label>

          <div className={styles.formInput}>
            <input
              className={styles.inputPlace}
              type="text"
              placeholder="Enter your destination here"
              style={{ width: "100%" }}
              name="destination"
              value={formData.destination}
              onChange={handleChange}
            />
          </div>
          {simpleValidator.current.message(
            "destination",
            formData.destination,
            "required"
          )}
        </div>

        {/* Date of Travel & Guest Count */}

        <div className={`${styles.formRow} ${styles.formRowDivide}`}>
          <div
            className={styles.formColumn}
            style={{ width: "49%", marginRight: "3%" }}
          >
            <label className={styles.inputHead}>
              Date of Travel
              <span className={styles.requiredField}>*</span>
            </label>
            <input
              className={styles.inputPlace}
              type="date"
              placeholder="Enter date here"
              name="travelDate"
              value={formData.travelDate}
              onChange={handleChange}
              min={currentDate}
            />
            {simpleValidator.current.message(
              "travelDate",
              formData.travelDate, // Pass the checkinDate variable
              "required" // Validate as a required date
            )}
          </div>

          <div className={styles.formColumn} style={{ width: "48%" }}>
            <label className={styles.inputHead}>
              Guest Count
              <span className={styles.requiredField}>*</span>
            </label>

            <input
              className={styles.inputPlace}
              type="number"
              placeholder="Enter guest count"
              name="guestCount"
              value={formData.guestCount}
              onChange={handleChange1}
            />
            {simpleValidator.current.message(
              "guestCount",
              formData.guestCount,
              "required|numeric"
            )}
          </div>
        </div>

        {/* Message */}

        <div className={styles.formRow}>
          <label className={styles.inputHead}>
            Message
            <span className={styles.requiredField}>*</span>
          </label>

          <textarea
            name="message"
            value={formData.message}
            onChange={handleChange}
            rows="4"
            placeholder="Enter your message"
            style={{
              width: "100%",
              border: "none",
              background: "#F4F4F4",
              padding: "4%",
              fontSize: "12px",
            }}
          ></textarea>
          {simpleValidator.current.message(
            "message",
            formData.message,
            "required"
          )}
        </div>

        {/* Send Enquiry Button */}

        <div className={styles.centered}>
          {isLoading ? (
            <div className={styles.loader}></div>
          ) : (
            <button className={styles.sendEnquiryBtn}>Send Enquiry</button>
          )}
        </div>
      </div>
    </form>
  );
}
