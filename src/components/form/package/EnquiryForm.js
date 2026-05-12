import { useState, useRef, useEffect } from "react";
import SimpleReactValidator from "simple-react-validator";
import styles from "./EnquiryForm.module.css";
import useLocalStorage from "@/hooks/useLocalStorage";
import { useRouter } from "next/router";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCalendarDays } from "@fortawesome/free-solid-svg-icons";
import Link from "next/link";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { useUserType } from "@/hooks/useUserType";
import { useWalletBalance } from "@/hooks/useWalletBalance";
import TravelerSelectDropdown from "@/components/corporate/travelerSelectDropdown/TravelerSelectDropdown";
import { setTabSpecificData } from "@/utils/axios/axios";

export default function EnquiryForm({
  formData,
  setFormData,
  onSubmit,
  isLoading,
  checkinDate,
  setCheckinDate,
  packagePaymentFlag,
  price,
  offerPrice,
  offerPercentage,
  form_offer_contents,
  package_payment_flag,
  handleTravelerChange,
  selectedTravelers,
  isAuthRequired = true,
}) {
  const { walletBalance } = useWalletBalance();
  const [, forceUpdate] = useState(0);
  const [checkoutDate, setCheckoutDate] = useState("");
  const [totalPrice, setTotalPrice] = useState(0);
  const corporateUser = useUserType();
  const checkinDatepickerRef = useRef(null);
  const checkoutDatepickerRef = useRef(null);
  const [walletSelected, setWalletSelected] = useState(false);
  const [getUserID, setUserID] = useLocalStorage("userID");
  const [getFormData, setPackagesFormData] = useLocalStorage("formData");
  const [amountPayable, setAmountPayable] = useState();
  const router = useRouter();
  const [startDate, setStartDate] = useState(null);

  const datePickerRef = useRef(null);
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

  const handleIconClick = () => {
    datePickerRef.current.setFocus();
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "name") {
      const regex = /^[A-Za-z][A-Za-z\s]*$/;

      if (regex.test(value)) {
        setFormData({ ...formData, [name]: value });
        setTabSpecificData({ ...formData, [name]: value });
      } else {
        console.log("Invalid input: Only alphabets and spaces are allowed.");
      }
    } else {
      setFormData({ ...formData, [name]: value });
      setTabSpecificData({ ...formData, [name]: value });
    }
  };
  const formatDate = (dateString) => {
    let date = new Date(dateString);
    let year = date.getFullYear();
    let month = (date.getMonth() + 1).toString().padStart(2, "0"); // Months are zero-based
    let day = date.getDate().toString().padStart(2, "0");

    // Format the date as YYYY-MM-DD
    let formattedDate = `${year}-${month}-${day}`;
    return formattedDate;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const formValid = simpleValidator.current.allValid();
    if (formValid) {
      onSubmit({
        ...formData,
        travelDate: formatDate(startDate),
        price: (formData?.travellers || 1) * price,
        discount_percentage: offerPercentage,
        discount_price: offerPrice
          ? parseFloat(
              (formData?.travellers || 1) * price -
                parseFloat((formData?.travellers || 1) * offerPrice).toFixed(2)
            ).toFixed(2)
          : 0,
        total_price: parseFloat(totalPrice).toFixed(2),
        amount_payable: parseFloat(amountPayable).toFixed(2),
        wallet_amount_used: walletSelected
          ? walletBalance < parseFloat(amountPayable).toFixed(2)
            ? walletBalance
            : parseFloat(totalPrice).toFixed(2) -
              parseFloat(amountPayable).toFixed(2)
          : 0,
      });
      // Clear validation messages and reset validation state
      simpleValidator.current.hideMessages();
    } else {
      simpleValidator.current.showMessages();
      forceUpdate((prevState) => !prevState); // Toggle state to force a re-render
    }
  };

  const handleDateChange = (selectedDates, dateStr, instance) => {
    const parseDate = (str, format) => {
      const parts = str.split("-");
      let day, month, year;
      if (format === "d-m-Y") {
        [day, month, year] = parts.map((part) => parseInt(part, 10));
      } else if (format === "Y-m-d") {
        [year, month, day] = parts.map((part) => parseInt(part, 10));
      }
      return new Date(year, month - 1, day); // Month is 0-based in JavaScript Date object
    };

    const formatDate = (date, format) => {
      const pad = (num) => num.toString().padStart(2, "0");
      const day = pad(date.getDate());
      const month = pad(date.getMonth() + 1); // Month is 0-based
      const year = date.getFullYear();
      if (format === "d-m-Y") {
        return `${day}-${month}-${year}`;
      } else if (format === "Y-m-d") {
        return `${year}-${month}-${day}`;
      }
    };

    const date = parseDate(dateStr, "d-m-Y");
    const formattedDate = formatDate(date, "Y-m-d");

    if (instance.element.id === "checkin") {
      setCheckinDate(formattedDate);
    } else if (instance.element.id === "checkout") {
      setCheckoutDate(formattedDate);
    }
  };

  const initDatePicker = (inputId) => {
    // checkinDatepickerRef.current = flatpickr(`#${inputId}`, {
    //   onClose: handleDateChange,
    //   dateFormat: "d-m-Y",
    //   minDate: "today",
    //   // onReady: function () {
    //   //   datepickerRef.current = this;
    //   // },
    // });
  };

  // Initialize date picker on component mount or appropriate lifecycle event
  useEffect(() => {
    setStartDate(formData?.travelDate || null);
    initDatePicker("checkin");
  }, []);

  // Function to reset validation messages
  const resetValidationMessages = () => {
    simpleValidator.current.hideMessages();
  };

  const checkwallet = async (e) => {
    if (walletSelected) {
      setWalletSelected(false);
      setAmountPayable(totalPrice);
    } else {
      setWalletSelected(true);
      let payable = 0;
      if (totalPrice > walletBalance) {
        payable = totalPrice - walletBalance;
      }
      setAmountPayable(payable);
    }
  };
  const goToWalletDetails = () => {
    router.push("/walletDetails");
  };

  useEffect(() => {
    initDatePicker("checkin");
    return () => {
      if (checkinDatepickerRef.current) {
        checkinDatepickerRef.current.destroy();
      }
      resetValidationMessages();
    };
  }, []);

  useEffect(() => {
    const guestCount = parseInt(formData?.guestCount, 10) || 1; // Parse guest count to an integer

    const basePrice = offerPrice ? offerPrice : price;

    const calculatedTotalPrice = guestCount * basePrice;

    setTotalPrice(calculatedTotalPrice);
    if (walletSelected) {
      let payable = 0;
      if (calculatedTotalPrice > walletBalance) {
        payable = calculatedTotalPrice - walletBalance;
      }
      setAmountPayable(payable);
    } else {
      setAmountPayable(calculatedTotalPrice);
    }
    setFormData({ ...formData, travellers: guestCount });
    setTabSpecificData({ ...formData, travellers: guestCount });
  }, [formData?.guestCount, offerPrice, price]);

  useEffect(() => {
    setFormData({ ...formData, travelDate: formatDate(startDate) });
    setTabSpecificData({ ...formData, travelDate: formatDate(startDate) });
  }, [startDate]);

  let pakageContent = (
    <>
      <div className={styles["underline-input"]}>
        <textarea
          className={styles["inputBasic"]}
          name="message"
          placeholder="Message"
          value={formData?.message}
          onChange={handleChange}
          tabIndex="1"
        ></textarea>
        {!packagePaymentFlag &&
          simpleValidator.current.message(
            "message",
            formData?.message,
            "required"
          )}
      </div>
      <ul>
        <li>We assure the privacy of your contact data.</li>
        <li>
          This data will only be used by our team to contact you and no other
          purposes.
        </li>
      </ul>
      <div className={styles.centered}>
        {isLoading ? (
          <div className={styles.loader}></div>
        ) : (
          <button className={styles.sendEnquiryBtn}>Send Enquiry</button>
        )}
      </div>
    </>
  );
  if (packagePaymentFlag) {
    pakageContent = (
      <div className={styles.makePayment}>
        <div className={styles.pricedetails}>Price Details</div>
        <div className={styles.paymentDetails}>
          <div className={styles.leftDetails}>
            <div className={styles.priceFirst}>
              Price({formData?.travellers || 1}*{price})
            </div>
            {offerPercentage && (
              <div className={styles.priceFirst}>Offer %</div>
            )}
            {offerPrice && (
              <div className={styles.priceFirst}>Price after Discount</div>
            )}
            <div className={styles.priceFirst}>Pax ( No. of traveller)</div>
            <div className={styles.priceFirst}>Total Amount</div>
          </div>
          <div className={styles.rightDetails}>
            <div className={styles.priceFirst}>
              Rs.{(formData?.travellers || 1) * price}
            </div>
            {offerPercentage && (
              <div className={styles.priceFirst}>{offerPercentage}%</div>
            )}
            {offerPrice && (
              <div className={styles.priceFirst}>
                Rs.
                {parseFloat((formData?.travellers || 1) * offerPrice).toFixed(
                  2
                )}
              </div>
            )}
            <div className={styles.priceFirst}>{formData?.travellers || 1}</div>
            <div className={styles.priceFirst}>
              Rs {parseFloat(totalPrice).toFixed(2)}
            </div>
          </div>
        </div>
        {/* {!corporateUser ? ( */}
        <div className={styles.walletSection}>
          <div>
            {walletBalance > 0 && (
              <input
                type="checkbox"
                id="useWallet"
                name="useWallet"
                onChange={checkwallet}
              />
            )}
            {walletBalance > 0 && (
              <label htmlFor="useWallet" className={styles.useWalletLabel}>
                Use wallet Balance
              </label>
            )}
          </div>
          <div>
            <div className={styles.walletBalance}>
              <div className={styles.balanceText}>
                Wallet Balance: Rs {walletBalance}
              </div>
              <div className={styles.recharge}>
                <Link
                  href={{
                    pathname: "/walletDetails",
                    query: {
                      fromPage:
                        typeof window !== "undefined"
                          ? window.location.pathname
                          : "/walletDetails",
                    },
                  }}
                  as={`/walletDetails`}
                >
                  Recharge now
                </Link>
              </div>
            </div>
          </div>
        </div>
        {/* ) : (
          <></>
        )} */}
        <div className={styles.totalPriceDetails}>
          <div className={styles.amountTotal}>Amount to be paid:</div>
          <div className={styles.amountTotal}>
            Rs {parseFloat(amountPayable).toFixed(2)}
          </div>
        </div>
        <div className={styles.makePaymentBtn}>
          <button className={styles.buttonWithSpinner} disabled={isLoading}>
            {" "}
            {isLoading ? (
              <div className={styles.loadingSpinner}></div>
            ) : amountPayable === 0 ? (
              " Book Package"
            ) : (
              `Proceed to Pay Rs. ${amountPayable}`
            )}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles["book-form"]}>
      {!package_payment_flag ? (
        form_offer_contents && (
          <h6 className={styles.formHead}>
            {form_offer_contents.title} - {form_offer_contents.country_name},{" "}
            {form_offer_contents.city_name}: Get{" "}
            {form_offer_contents.offer_percentage}% off!
          </h6>
        )
      ) : (
        <h6 className={styles.formHead}>Enter traveller details</h6>
      )}
      <form className={styles.formMain} onSubmit={handleSubmit}>
        {corporateUser && (
          <div className={styles.WaysContent1}>
            <TravelerSelectDropdown
              corporateUser={corporateUser}
              adultsCount={formData?.guestCount}
              onTravelerChange={handleTravelerChange}
              initialSelectedTravelers={selectedTravelers}
            />
          </div>
        )}
        <div className={styles["underline-input"]}>
          <input
            className={styles["inputBasic"]}
            type="text"
            name="name"
            placeholder="Name *"
            value={formData?.name}
            onChange={handleChange}
            tabIndex="1"
            maxLength={30}
          />
          {simpleValidator.current.message("name", formData?.name, "required")}
        </div>
        <div className={styles["underline-input"]}>
          <input
            className={styles["inputBasic"]}
            type="email"
            name="email"
            placeholder="Email *"
            value={formData?.email}
            onChange={handleChange}
            tabIndex="1"
          />
          {simpleValidator.current.message(
            "email",
            formData?.email,
            "required|email"
          )}
        </div>
        <div className={styles["underline-input"]}>
          <input
            className={styles["inputBasic"]}
            type="text"
            name="destination"
            placeholder="Destination"
            value={formData?.destination}
            onChange={handleChange}
            tabIndex="1"
          />
          {simpleValidator.current.message(
            "destination",
            formData?.destination,
            "required"
          )}
        </div>
        <div className={styles["input-row"]}>
          <div
            className={`${styles["underline-input"]} ${styles["short-width"]}`}
          >
            <input
              className={styles["inputBasic"]}
              type="text"
              name="countryCode"
              placeholder="+91"
              value={formData?.countryCode}
              tabIndex="1"
              readOnly
              style={{ color: "#028fa3" }}
            />
          </div>
          <div className={styles["underline-input"]}>
            <input
              className={styles["inputBasic"]}
              type="text"
              name="mobileNumber"
              placeholder="Phone"
              value={formData?.mobileNumber}
              onChange={handleChange}
              tabIndex="1"
              maxLength={10}
            />

            {simpleValidator.current.message(
              "mobileNumber",
              formData?.mobileNumber,
              "required|numeric|min:10|max:10|validMobile"
            )}
          </div>
        </div>
        <div className={styles["input-row"]}>
          <div className={styles["input-container"]}>
            <div
              className="date-picker"
              style={{ borderBottom: "1px solid rgba(0, 0, 0, 0.21)" }}
            >
              <DatePicker
                ref={datePickerRef}
                type="date"
                selected={startDate}
                value={formData?.travelDate}
                onChange={(date) => setStartDate(date)}
                dateFormat="dd/MM/yyyy"
                placeholderText="dd/mm/yyyy"
                showMonthDropdown
                showYearDropdown
                dropdownMode="select"
                minDate={new Date()}
              />
              <span
                className={styles["calendar-icon"]}
                onClick={handleIconClick}
              >
                <FontAwesomeIcon icon={faCalendarDays} />
              </span>
              <style jsx global>{`
                .react-datepicker__navigation--next {
                  display: none;
                }
                .react-datepicker__navigation--previous {
                  display: none;
                }
              `}</style>
            </div>
          </div>
          <div className={styles["input-container"]}>
            <input
              className={`${styles["inputBasic"]} ${styles["guestcountAlign"]}`}
              type="number"
              placeholder="Guest Count"
              name="guestCount"
              value={formData?.guestCount}
              min={1}
              onChange={handleChange}
            />
            {simpleValidator.current.message(
              "guestCount",
              formData?.guestCount,
              "required|numeric"
            )}
          </div>
        </div>
        {pakageContent}
      </form>
    </div>
  );
}
