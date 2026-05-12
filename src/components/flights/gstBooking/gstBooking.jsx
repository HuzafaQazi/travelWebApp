import { useUserType } from "@/hooks/useUserType";
import { useSelector } from "react-redux";
import style from "./styles.module.css";
import { useState, useEffect } from "react";
import { validateGst } from "@/utils/bookingAPI";

const GstBooking = ({ gstDetails, setGSTDetails }) => {
  const userDetails = useSelector((state) => state?.user?.userInfo);

  const [isCorporateBooking, setIsCorporateBooking] = useState();
  const [companyName, setCompanyName] = useState();
  const [companyNameError, setCompanyNameError] = useState();
  const [companyMobileError, setCompanyMobileError] = useState();
  const [companyMobile, setCompanyMobile] = useState();
  const [companyGstError, setCompanyGstError] = useState();
  const [companyGst, setCompanyGst] = useState();
  const [companyEmailError, setCompanyEmailError] = useState();
  const [companyEmail, setCompanyEmail] = useState();
  const [companyAddressError, setCompanyAddressError] = useState();
  const [companyAddress, setCompanyAddress] = useState();
  const [companyPincode, setCompanyPincode] = useState();
  const corporateUser = useUserType();

  useEffect(() => {
    let gstDetails;
    if (corporateUser && userDetails) {
      gstDetails = {
        gstCompanyAddress:
          userDetails?.loggedInDetails?.companyDetails?.address,
        gstCompanyContactNumber: "",
        gstCompanyName:
          userDetails?.loggedInDetails?.companyDetails?.companyName,
        gstNumber: userDetails?.loggedInDetails?.companyDetails?.gst,
        gstCompanyEmail: "",
      };
    } else {
      gstDetails = {
        gstCompanyAddress: "",
        gstCompanyContactNumber: "",
        gstCompanyName: "",
        gstNumber: "",
        gstCompanyEmail: "",
      };
    }
  }, [corporateUser, userDetails]);

  const verifyGst = async (gstNumber) => {
    const response = await validateGst(gstNumber);
    if (response.status === "SUCCESS") {
      setGSTDetails((prev) => ({
        ...prev,
        gstCompanyAddress: response.data.companyAddress,
      }));
      setCompanyAddress(response.data.companyAddress);
      setCompanyName(response.data.companyName);
      setCompanyPincode(response.data.companyPincode);
    }
  };

  const handleCompanyDetailsChanged = (event, titleValue) => {
    const value = event?.target?.value;
    let error = "";
    switch (titleValue) {
      case "GST":
        setCompanyGst(value);
        error = validateField(value, titleValue);
        if (error != null && error != "") {
          setCompanyName("");
          setCompanyAddress("");
          setCompanyGstError(error);
        } else {
          verifyGst(value);
        }
        break;
      case "mobileNumber":
        setCompanyMobile(value);
        error = validateField(value, titleValue);
        setCompanyMobileError(error);
        break;
      case "email":
        setCompanyEmail(value);
        error = validateField(value, titleValue);
        setCompanyEmailError(error);
        break;
      default:
        break;
    }
  };

  const validateField = (value, fieldName) => {
    if (fieldName === "email" && !isValidEmail(value)) {
      return "Please enter a valid email address.";
    }
    if (fieldName === "mobileNumber" && !isValidPhoneNumber(value)) {
      return "Please enter a valid phone number.";
    }

    if (fieldName === "GST" && !isValidGst(value)) {
      return "Please enter a valid Gst Number.";
    }

    return "";
  };

  const isValidGst = (number) => {
    const gstRegex = /^\d{2}[A-Z]{5}\d{4}[A-Z]{1}[1-9A-Z]{1}[Z]{1}[A-Z\d]{1}$/;
    return gstRegex.test(number);
  };

  const isValidEmail = (email) => {
    // Add your email validation logic here
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const isValidPhoneNumber = (phoneNumber) => {
    // Add your phone number validation logic here
    return /^[5-9]\d{9}$/.test(phoneNumber);
  };

  const handleCorporateBooking = async () => {
    setIsCorporateBooking(!isCorporateBooking);
  };

  return (
    <>
      <div>
        {!corporateUser && (
          <div className={style["corporate-checkbox"]}>
            <label htmlFor="below12">
              <input
                type="checkbox"
                id="below12"
                value={isCorporateBooking}
                className={style["check-box"]}
                onChange={handleCorporateBooking}
              />
              GST Booking
            </label>
          </div>
        )}
        <br />
        {isCorporateBooking ? (
          <div>
            <div className={style["form-row"]}>
              <div className={style["form-input"]}>
                <div className={style["input-heading"]}>
                  GST Number <span className={style["required"]}>*</span>
                </div>
                <div className={style["input-wrapper"]}>
                  <input
                    type="text"
                    placeholder="GST Number"
                    onInput={(e) => {
                      e.target.value = e.target.value.replace(
                        /[^a-zA-Z\d]+/g,
                        ""
                      ); // Replace non-numeric characters with empty string
                      e.target.value = e.target.value.toUpperCase();
                    }}
                    maxLength={15}
                    value={companyGst}
                    onChange={(e) => handleCompanyDetailsChanged(e, "GST")}
                  />
                </div>
                <p className={style.textDanger}>{companyGstError}</p>
              </div>

              <div className={style["form-input"]}>
                <div className={style["input-heading"]}>
                  Company Name <span className={style["required"]}>*</span>
                </div>
                <div className={style["input-wrapper"]}>
                  <input
                    type="text"
                    placeholder="Company Name"
                    value={companyName}
                    onInput={(e) => {
                      e.target.value = e.target.value.replace(
                        /[^a-zA-Z\s]/g,
                        ""
                      ); // Replace non-numeric characters with empty string
                    }}
                    onChange={(e) => handleCompanyDetailsChanged(e, "Name")}
                  />
                </div>
                <p className="text-danger">{companyNameError}</p>
              </div>
              <div className={style["form-input"]}>
                <div className={style["input-heading"]}>
                  Company Address <span className={style["required"]}>*</span>
                </div>
                <div className={style["input-wrapper"]}>
                  <input
                    type="text"
                    placeholder="Company Address"
                    onInput={(e) => {
                      e.target.value = e.target.value.replace(
                        /[^a-zA-Z\s]/g,
                        ""
                      ); // Replace non-numeric characters with empty string
                    }}
                    value={companyAddress}
                    onChange={(e) => handleCompanyDetailsChanged(e, "Address")}
                  />
                </div>
                <p className={style.textDanger}>{companyAddressError}</p>
              </div>
            </div>

            <div className={style["form-row2"]}>
              <div className={style["form-input2"]}>
                <div className={style["input-heading"]}>
                  Company Mobile Number{" "}
                  <span className={style["required"]}>*</span>
                </div>
                <div className={style["input-wrapper"]}>
                  <input
                    type="tel"
                    inputMode="numeric" // Set input mode to "numeric" to show a numeric keyboard on mobile devices
                    pattern="[0-9]*"
                    onInput={(e) => {
                      e.target.value = e.target.value.replace(/[^0-9]/g, ""); // Replace non-numeric characters with empty string
                    }}
                    value={companyMobile}
                    maxLength={10}
                    placeholder="Company Mobile"
                    onChange={(e) =>
                      handleCompanyDetailsChanged(e, "mobileNumber")
                    }
                  />
                </div>
                <p className={style.textDanger}>{companyMobileError}</p>
              </div>

              <div className={style["form-input2"]}>
                <div className={style["input-heading"]}>
                  Company Email <span className={style["required"]}>*</span>
                </div>
                <div className={style["input-wrapper"]}>
                  <input
                    type="email"
                    placeholder="Company Email"
                    value={companyEmail}
                    onChange={(e) => handleCompanyDetailsChanged(e, "email")}
                  />
                </div>
                <p className={style.textDanger}>{companyEmailError}</p>
              </div>
            </div>
          </div>
        ) : (
          <></>
        )}
      </div>
    </>
  );
};

export default GstBooking;
