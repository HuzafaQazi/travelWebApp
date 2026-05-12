import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { selectB2CCompany } from "@/store/selectors/b2cSelectors";
import { updateCompanyDetails } from "@/store/initializeB2CStore";
import style from "./styles.module.css";
import showToast from "@/utils/toast";

export default function CompanyDetailsForm() {
  const company = useSelector(selectB2CCompany);

  const [companyName, setCompanyName] = useState("");
  const [companyNameError, setCompanyNameError] = useState("");
  const [regNo, setRegNo] = useState("");
  const [regNoError, setregNoError] = useState("");
  const [brandName, setBrandName] = useState("");
  const [brandNameError, setBrandNameError] = useState("");
  const [companyAddress, setCompanyAddress] = useState("");
  const [companyAddressError, setCompanyAddressError] = useState("");
  const [PAN, setPAN] = useState("");
  const [PANError, setPANError] = useState("");
  const [gstNumber, setGstNumber] = useState("");
  const [gstNumberError, setGstNumberError] = useState("");
  const [companyEmail, setCompnayEmail] = useState("");
  const [companyEmailError, setCompanyEmailError] = useState("");
  const [companyMobile, setCompanyMobile] = useState("");
  const [companyMobileError, setCompanyMobileError] = useState("");
  const [isToastVisible, setIsToastVisible] = useState(false);

  // Validation Regex
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]$/;
  const gstRegex = /^\d{2}[A-Z]{5}\d{4}[A-Z]{1}[A-Z\d]{1}[Z]{1}[A-Z\d]{1}/;

  // Populate form from Redux
  useEffect(() => {
    if (company) {
      setCompanyName(company.companyName || "");
      setBrandName(company.brandName || "");
      setRegNo(company.companyRegistrationNumber || "");
      setCompanyMobile(company.companyMobileNumber || "");
      setCompanyAddress(company.companyAddress || "");
      setPAN(company.companyPAN || "");
      setGstNumber(company.companyGSTIN || "");
      setCompnayEmail(company.companyEmail || "");
    }
  }, [company]);

  const handleCompanyNameChange = (event) => {
    const value = event.target.value;
    setCompanyName(value);

    if (value.trim() === "") {
      setCompanyNameError("company name is required");
    }
    if (value.trim().length < 3 || value.trim().length > 50) {
      setCompanyNameError("Please enter a valid name");
    } else {
      setCompanyNameError("");
    }
  };

  const handleRegNoChange = (event) => {
    const value = event.target.value;
    setRegNo(value);

    if (value.trim() === "") {
      setregNoError("Registration Number is required");
    }
    if (value.trim().length < 21) {
      setregNoError("Please enter valid register number");
    } else {
      setregNoError("");
    }
  };

  const handleCompanyMobileChange = (event) => {
    const value = event.target.value;
    setCompanyMobile(value);

    if (value.trim() === "") {
      setCompanyMobileError("Mobile is required");
    }
    if (value.trim().length < 10) {
      setCompanyMobileError("Please enter valid mobile number");
    } else {
      setCompanyMobileError("");
    }
  };

  const handleBrandNameChange = (event) => {
    const value = event.target.value;
    setBrandName(value);

    if (value.trim() === "") {
      setBrandNameError("Brand name is required");
    }
    if (value.trim().length < 3 || value.trim().length > 50) {
      setBrandNameError("Please enter a valid name");
    } else {
      setBrandNameError("");
    }
  };

  const handleCompanyAddressChange = (event) => {
    const value = event.target.value;
    setCompanyAddress(value);

    if (value.trim() === "") {
      setCompanyAddressError("Company address is required");
    } else if (value.trim().length < 3 || value.trim().length > 50) {
      setCompanyAddressError("Please enter a valid address");
    } else {
      setCompanyAddressError("");
    }
  };

  const checkErrors = () => {
    let hasErrors = false;
    if (companyName.trim() === "") {
      hasErrors = true;
      setCompanyNameError("Company name is required ");
    }

    if (regNo.trim() === "") {
      hasErrors = true;
      setregNoError("Company Registration Number is required");
    }

    if (companyMobile.trim() === "") {
      hasErrors = true;
      setCompanyMobileError("company mobile number is required");
    }

    if (brandName.trim() === "") {
      hasErrors = true;
      setBrandNameError("Brand Name is required ");
    }

    if (companyAddress.trim() === "") {
      hasErrors = true;
      setCompanyAddressError("Company Address is required ");
    }

    if (PAN.trim() === "") {
      hasErrors = true;
      setPANError("PAN is required ");
    }

    if (gstNumber.trim() === "") {
      hasErrors = true;
      setGstNumberError("GST Invoice is required ");
    }

    if (companyEmail.trim() === "") {
      hasErrors = true;
      setCompanyEmailError("Email Id is required");
    }
    return hasErrors;
  };

  const handlePANChange = (event) => {
    const value = event.target.value;
    setPAN(value);

    if (!panRegex.test(value)) {
      setPANError("Please enter a valid PAN number");
    } else {
      setPANError("");
    }
  };

  const handleGstChange = (event) => {
    const value = event.target.value;
    setGstNumber(value);

    if (!gstRegex.test(value)) {
      setGstNumberError("Please enter a valid GST number");
    } else {
      setGstNumberError("");
    }
  };

  const handleCompanyEmailChange = (event) => {
    const value = event.target.value;
    setCompnayEmail(value);

    if (value.trim() === "") {
      setCompanyEmailError("Email id is required");
    }
    if (!emailRegex.test(value)) {
      setCompanyEmailError("Please enter a valid Email id");
    } else {
      setCompanyEmailError("");
    }
  };

  const handleCompnayDetailsSubmit = async (event) => {
    event.preventDefault();

    let hasError = checkErrors();
    if (!hasError) {
      try {
        const result = await updateCompanyDetails({
          companyName: companyName,
          brandName: brandName,
          companyRegistrationNumber: regNo,
          companyMobileNumber: companyMobile,
          companyAddress: companyAddress,
          companyPAN: PAN,
          companyGSTIN: gstNumber,
          companyEmail: companyEmail,
        });

        if (result.success) {
            showToast("success","updated successfully");
            
        } else {
          if (!isToastVisible) showToast("error", result.error || "Failed to update");
        }
      } catch (error) {
        console.error("Catch for update company", error);
      }
    }
  };

  return (
    <form onSubmit={handleCompnayDetailsSubmit}>
      <div className={style.nameDivide}>
        <div className={style.namediff}>
          <label
            htmlFor="companyName"
            className={`form-label ${style.textFieldTitle}`}
          >
            Company Name <span className={style.redAsterisk}>*</span>
          </label>
          <input
            type="text"
            className="form-control"
            id="companyName"
            onInput={(e) => {
              e.target.value = e.target.value.replace(
                /[^a-zA-Z0-9\s!@#$%^&*()\-_=+[{\]}\\|;:'",<.>/?]/g,
                ""
              );
            }}
            onChange={handleCompanyNameChange}
            value={companyName}
            maxLength={50}
          />
          {companyNameError && (
            <p className="text-danger">{companyNameError}</p>
          )}
        </div>
        <div className={style.namediff}>
          <label
            htmlFor="brandName"
            className={`form-label ${style.textFieldTitle}`}
          >
            Brand Name <span className={style.redAsterisk}>*</span>
          </label>
          <input
            type="text"
            className="form-control"
            id="brandName"
            onInput={(e) => {
              e.target.value = e.target.value.replace(
                /[^a-zA-Z0-9\s!@#$%^&*()\-_=+[{\]}\\|;:'",<.>/?]/g,
                ""
              );
            }}
            onChange={handleBrandNameChange}
            value={brandName}
            maxLength={50}
          />
          {brandNameError && <p className="text-danger">{brandNameError}</p>}
        </div>
      </div>
      <div className="mb-3">
        <label htmlFor="regNo" className={`form-label ${style.textFieldTitle}`}>
          Company Registration number{" "}
          <span className={style.redAsterisk}>*</span>
        </label>
        <input
          type="text"
          onInput={(e) => {
            e.target.value = e.target.value.replace(/[^a-zA-Z\d]+/g, "");
            e.target.value = e.target.value.toUpperCase();
          }}
          className="form-control"
          id="regNo"
          onChange={handleRegNoChange}
          value={regNo}
          maxLength={21}
        />
        {regNoError && <p className="text-danger">{regNoError}</p>}
      </div>
      <div className="mb-3">
        <label
          htmlFor="companyMobile"
          className={`form-label ${style.textFieldTitle}`}
        >
          Company Mobile Number <span className={style.redAsterisk}>*</span>
        </label>
        <input
          type="tel"
          inputMode="numeric"
          onInput={(e) => {
            const inputValue = e.target.value;
            if (/^[5-9][0-9]*$/.test(inputValue)) {
              e.target.value = inputValue;
            } else {
              e.target.value = "";
            }
          }}
          maxLength={10}
          className="form-control"
          id="companyMobile"
          onChange={handleCompanyMobileChange}
          value={companyMobile}
        />
        {companyMobileError && (
          <p className="text-danger">{companyMobileError}</p>
        )}
      </div>

      <div className="mb-3">
        <label
          htmlFor="address"
          className={`form-label ${style.textFieldTitle}`}
        >
          Address <span className={style.redAsterisk}>*</span>
        </label>
        <input
          type="tel"
          className="form-control"
          id="address"
          onChange={handleCompanyAddressChange}
          value={companyAddress}
          maxLength={200}
        />
        {companyAddressError && (
          <p className="text-danger">{companyAddressError}</p>
        )}
      </div>
      <div className={style.nameDivide}>
        <div className={style.namediff}>
          <label htmlFor="pan" className={`form-label ${style.textFieldTitle}`}>
            PAN <span className={style.redAsterisk}>*</span>
          </label>
          <input
            type="text"
            onInput={(e) => {
              e.target.value = e.target.value.replace(/[^a-zA-Z\d]+/g, "");
              e.target.value = e.target.value.toUpperCase();
            }}
            maxLength={10}
            className="form-control"
            id="pan"
            onChange={handlePANChange}
            value={PAN}
          />
          {PANError && <p className="text-danger">{PANError}</p>}
        </div>
        <div className={style.namediff}>
          <label
            htmlFor="gstin"
            className={`form-label ${style.textFieldTitle}`}
          >
            GSTIN <span className={style.redAsterisk}>*</span>
          </label>
          <input
            type="text"
            onInput={(e) => {
              e.target.value = e.target.value.replace(/[^a-zA-Z\d]+/g, "");
              e.target.value = e.target.value.toUpperCase();
            }}
            className="form-control"
            id="gstin"
            onChange={handleGstChange}
            maxLength={15}
            value={gstNumber}
          />
          {gstNumberError && <p className="text-danger">{gstNumberError}</p>}
        </div>
      </div>
      <div className="mb-3">
        <label
          htmlFor="companyemail"
          className={`form-label ${style.textFieldTitle}`}
        >
          Company Email Address <span className={style.redAsterisk}>*</span>
        </label>
        <input
          type="email"
          className="form-control"
          id="companyemail"
          onChange={handleCompanyEmailChange}
          value={companyEmail}
        />
        {companyEmailError && (
          <p className="text-danger">{companyEmailError}</p>
        )}
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
          onClick={handleCompnayDetailsSubmit}
        >
          Save
        </button>
      </div>
    </form>
  );
}
