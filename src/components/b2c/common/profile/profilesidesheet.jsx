import React from "react";
import style from "./styles.module.css";
import "bootstrap/dist/css/bootstrap.css";
import { useState, useEffect, useRef } from "react";
import profile from "@/images/profile.png";
import briefcase from "@/images/briefcase.png";
import flight from "@/images/flight.png";
import hotel from "@/images/hotel.png";
import packages from "@/images/package.png";
import logoutIcon from "@/images/logoutIcon.png";
import Image from "next/image";
import { Collapse } from "react-bootstrap";
import { Nav, Tab } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCaretDown,
  faCaretRight,
  faTrash,
} from "@fortawesome/free-solid-svg-icons";
import axios, {
  handleLogout,
  setTabSpecificData,
  getTabSpecificData,
} from "@/utils/axios/axios";
import config from "@/config";
import MyBookingListItem from "@/components/mybookinglistitem/mybookinglistitem";
import MyBookingListItem1 from "@/components/flightBookingList/mybookinglistitem";
import {
  getBookingList,
  getPackagesBookingList,
  getFlightBookingList,
} from "@/utils/profileAPI";
import { useRouter } from "next/router";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import TabTitle from "@/components/tabtitles/tabtitle";
import BookingList from "@/components/packages/bookings/bookinglist";
import { useLogin } from "@/store/context/LoginContext";
import Loader from "@/components/loader/loader";
import deleteUserAccount from "@/utils/deleteUserAccount";
import { useUserType } from "@/hooks/useUserType";
import { useWalletBalance } from "@/hooks/useWalletBalance";
import FlightLoader from "@/components/loader/FlightLoader";
import showToast from "@/utils/toast";

export default function ProfileSheet({ isOpen, onClose }) {
  const { isPosiflexLoginModalVisible, setAccessToken, setShowLoginButton } =
    useLogin();
  const corporateUser = useUserType();
  const { walletBalance } = useWalletBalance();

  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isMyHotelBookingOpen, setIsMyHotelBookingOpen] = useState(false);
  const [isMyFlightBookingOpen, setIsMyFlightBookingOpen] = useState(false);
  const [isMyPackageBookingOpen, setIsMyPackageBookingOpen] = useState(false);

  // Image selection data
  const [showWarning, setShowWarning] = useState(false);
  const [allBookings, setAllBookings] = useState([]);
  const [reservedBookings, setReservedBookings] = useState([]);
  const [completedBookings, setCompletedBookings] = useState([]);
  const [confirmedBookings, setConfirmedBookings] = useState([]);
  const [cancelledBookings, setCancelledBookings] = useState([]);
  const [packagesBookingData, setPackagesBookingData] = useState([]);
  const [allBooking, setAllBooking] = useState([]);
  const [reservedBooking, setReservedBooking] = useState([]);
  const [completedBooking, setCompletedBooking] = useState([]);
  const [confirmedBooking, setConfirmedBooking] = useState([]);
  const [cancelledBooking, setCancelledBooking] = useState([]);

  const [loading, setLoading] = useState(false);
  const [parentLoader, setParentLoader] = useState(false);

  const router = useRouter();

  // User details
  const [firstName, setFirstName] = useState("");
  const [firstNameError, setFirstNameError] = useState("");
  const [lastName, setLastName] = useState("");
  const [lastNameError, setLastNameError] = useState("");
  const [mobile, setMobile] = useState("");
  const [mobileError, setMobileError] = useState("");
  const [emailID, setEmailID] = useState("");
  const [emailError, setEmailError] = useState("");

  // Company Details
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

  // Validation Regex
  const nameRegex = /^[A-Za-z\s-]+$/;
  const mobileNumberRegex = /^\d{10}$/;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]$/;
  const gstRegex = /^\d{2}[A-Z]{5}\d{4}[A-Z]{1}[A-Z\d]{1}[Z]{1}[A-Z\d]{1}/;

  const [accessToken, setAccessTokenValue] = useState("");
  const [phoneNumber, setPhoneNumberValue] = useState("");
  const [email, setEmailValue] = useState("");
  const [userID, setUserIDValue] = useState("");
  const [isToastVisible, setIsToastVisible] = useState(false);

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

    // if (value.trim() === "") {
    //   setEmailError("Email id is required");
    // }
    if (!emailRegex.test(value)) {
      setEmailError("Please enter a valid Email id");
    } else {
      setEmailError("");
    }
  };

  const handleTabChange = (eventKey) => {
    getBookingData(eventKey);
  };

  const handleTab1Change = (eventKey) => {
    getFlightBookingData(eventKey);
  };

  const handlePackageTabChange = (eventKey) => {
    getPackagesBookedData(eventKey);
  };

  const handleProfileTabChange = (eventKey) => {
    switch (eventKey) {
      case "profile":
        getUserDetailsByID();
        break;
      case "company":
        getCompanyDetailsByID();
        break;
      default:
        break;
    }
  };

  // async function saveUserDetails(firstName) {
  //   setUserDetails(firstName);
  // }

  const handleSubmit = (event) => {
    event.preventDefault();

    // Initialize error variables
    let firstNameError = "";
    let lastNameError = "";
    let mobileError = "";
    let emailError = "";

    // Validate each field and set error messages
    if (firstName.trim() === "") {
      firstNameError = "First name is required ";
      // return;
    }

    if (lastName.trim() === "") {
      lastNameError = "Last name is required ";
      // return;
    }

    if (mobile.trim() === "") {
      mobileError = "Mobile number is required ";
      // return;
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
      // There are validation errors, do not proceed with submission
      return;
    }

    // If no errors, proceed to submit the form or update the user
    updateUser();
  };

  const handleCompanyNameChange = (event) => {
    const value = event.target.value;
    setCompanyName(value);

    // Validate the first name
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

    // Validate the first name
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

    // Validate the first name
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

    // Validate the first name
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

    // Validate the first name
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
      // return;
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
      // return;
    }

    if (companyAddress.trim() === "") {
      hasErrors = true;
      setCompanyAddressError("Company Address is required ");
      // return;
    }

    if (PAN.trim() === "") {
      hasErrors = true;
      setPANError("PAN is required ");
      // return;
    }

    if (gstNumber.trim() === "") {
      hasErrors = true;
      setGstNumberError("GST Invoice is required ");
      // return;
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

    // Validate the first name
    // if (value.trim() === "") {
    //   setPANError("PAN is required");
    // }
    if (!panRegex.test(value)) {
      setPANError("Please enter a valid PAN number");
    } else {
      setPANError("");
    }
  };

  const handleDeleteUser1 = async () => {
    setShowWarning(true);
  };

  const handleConfirmDelete = async () => {
    await deleteUserAccount(getTabSpecificData("userID"));
    showToast("success","User account deleted successfully!");
    setTimeout(() => {
      handleProfileLogout();
    }, 1000);
    setShowWarning(false);
  };

  const handleCancelDelete = () => {
    setShowWarning(false);
  };

  useEffect(() => {
    if (showWarning) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "visible";
    }

    return () => {
      document.body.style.overflow = "visible";
    };
  }, [showWarning]);

  const handleGstChange = (event) => {
    const value = event.target.value;
    setGstNumber(value);

    // Validate the first name
    // if (value.trim() === "") {
    //   setGstNumberError("GST Invoice is required");
    // }
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

  const handleCompnayDetailsSubmit = (event) => {
    event.preventDefault();

    let hasError = checkErrors();
    // Validate the first name before submitting
    if (!hasError) {
      updateCompnayDetails();
    }
  };

  useEffect(() => {
    const storedAccessToken = getTabSpecificData("accessToken");
    const storedPhoneNumber = getTabSpecificData("phoneNumber");
    const storedEmail = getTabSpecificData("email");
    const userID = getTabSpecificData("userID");

    setUserIDValue(userID);

    setAccessTokenValue(storedAccessToken);
    setPhoneNumberValue(storedPhoneNumber);
    setEmailValue(storedEmail);
    setUserIDValue(userID);
  }, []);

  // Function to be executed when the page is opened
  useEffect(() => {
    const fetchData = () => {
      const storedAccessToken = getTabSpecificData("accessToken");
      const storedPhoneNumber = getTabSpecificData("phoneNumber");
      const storedEmail = getTabSpecificData("email");
      const userID = getTabSpecificData("userID");
      setAccessTokenValue(storedAccessToken);
      setPhoneNumberValue(storedPhoneNumber);
      setEmailValue(storedEmail);
      setUserIDValue(userID);
      if (!userID) {
        return router.replace("/");
      }
      if (userID) {
        // getBookingList();
        // const bookingListResp = await getBookingList(userID);
      } else {
      }
    };
    fetchData();
  }, []);

  const getBookingData = async (status) => {
    // if (allBookings?.length === 0) {
    try {
      setLoading(true);
      const bookingListResp = await getBookingList(
        userID,
        status,
        corporateUser
      );

      await updateBookingList(status, bookingListResp.data);
    } catch (error) {
      console.log("Error occurred", error);
    } finally {
      setLoading(false);
    }
  };

  const getFlightBookingData = async (status) => {
    try {
      setLoading(true);
      const bookingListResp = await getFlightBookingList(
        userID,
        status,
        corporateUser
      );

      await updateFlightBookingList(status, bookingListResp.data);
    } catch (error) {
      console.error("Error occurred while fetching booking data", error);
    } finally {
      setLoading(false);
    }
  };

  const getPackagesBookedData = async (type) => {
    const userID = getTabSpecificData("userID");
    try {
      setLoading(true);
      const bookingListResp = await getPackagesBookingList(userID, type);
      if (bookingListResp.status) {
        setPackagesBookingData(bookingListResp.data);
      }
    } catch (error) {
      console.log("Error occurred", error);
    } finally {
      setLoading(false);
    }
  };

  const updateBookingList = async (status, bookings) => {
    switch (status) {
      case "all":
        setAllBookings(bookings);
        break;
      case "Reserved":
        setReservedBookings(bookings);
        break;
      case "Confirmed":
        setConfirmedBookings(bookings);
        break;
      case "Cancelled":
        setCancelledBookings(bookings);
        break;
      case "Completed":
        setCompletedBookings(bookings);
        break;
    }
  };

  const updateFlightBookingList = async (status, bookings) => {
    switch (status) {
      case "all":
        setAllBooking(bookings);
        break;
      case "Reserved":
        setReservedBooking(bookings);
        break;
      case "Confirmed":
        setConfirmedBooking(bookings);
        break;
      case "Cancelled":
        setCancelledBooking(bookings);
        break;
      case "Completed":
        setCompletedBooking(bookings);
        break;
    }
  };

  const handleProfileLogout = async () => {
    await handleLogout();
    setAccessToken(null);
    setShowLoginButton(true);
  };

  async function getUserDetailsByID() {
    const data = {
      id: getTabSpecificData("userID"),
    };
    try {
      const configuration = {
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
        params: {
          id: getTabSpecificData("userID"),
        },
      };
      const response = await axios
        .get(`${config.GET_USER_BY_ID}`, configuration)
        .then();

      if (response.status === 200 && response.data.status === "SUCCESS") {
        // closePopup(); // Close the popup when the response is successful
        // setShowOTP(true);

        populateUserDetails(
          response.data.data.firstName,
          response.data.data.lastName,
          response.data.data.mobile,
          response.data.data.email
        );
      } else {
        // toast(`Error ${response.data}`);
      }
    } catch (error) {
      console.error("Went into catch for get user details by id", error);
    }
  }

  async function getCompanyDetailsByID() {
    try {
      const configu = {
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
        params: {
          id: userID,
        },
      };
      const response = await axios
        .get(
          `${config.GET_COMPANY_DETAILS_BY_ID}`,
          // {
          //   "id":"64941b7326fbbf2b9eb5bcd7"
          // },
          configu
        )
        .then();

      if (
        response.status === 200 &&
        response.data.status === "SUCCESS" &&
        response.data.data?.name
      ) {
        // closePopup(); // Close the popup when the response is successful
        // setShowOTP(true);

        populateCompanyDetails(
          response.data.data.name,
          response.data.data.brandName,
          response.data.data.address,
          response.data.data.pan,
          response.data.data.gst,
          response.data.data.email,
          response.data.data.mobile,
          response.data.data.regNo
        );
      } else {
        // toast(`Error ${response.data}`);
      }
    } catch (error) {
      console.error("Went into catch", error);
    }
  }

  function populateUserDetails(firstName, lastName, mobile, email) {
    setFirstName(firstName);
    setLastName(lastName);
    setMobile(mobile);
    setEmailID(email);
  }

  function populateCompanyDetails(
    name,
    brandName,
    address,
    pan,
    gst,
    email,
    mobile,
    regNo
  ) {
    setCompanyName(name);
    setBrandName(brandName);
    setCompanyAddress(address);
    setPAN(pan);
    setGstNumber(gst);
    setCompnayEmail(email);
    setCompanyMobile(mobile);
    setRegNo(regNo);
  }

  async function updateUser() {
    try {
      const configu = {
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      };
      const reqObj = {
        _id: userID,
        mobile: mobile,
        email: emailID,
        firstName: firstName,
        userId: userID,
        middleName: "",
        lastName: lastName,
        age: "",
        gender: "",
        dateOfBirth: "",
        profileImage: "",
        userTypeId: "",
        userRoleId: "",
        userPermissionId: "",
        addressLine1: "",
        addressLine2: "",
        pincode: "",
        billingAddressLine1: "",
        billingAddressLine2: "",
        billingAddressPincode: "",
        PAN: "",
        status: "active",
      };

      const response = await axios
        .put(`${config.UPDATE_USER_DETAILS}`, reqObj, configu)
        .then();

      if (response.status === 200 && response.data.status === "SUCCESS") {
        setTabSpecificData("userDetails", firstName);
        // toast("updated successfully");
          showToast("success","updated successfully");
          

        // closePopup(); // Close the popup when the response is successful
        setShowOTP(true);
      } else {
        // toast(`Error ${response.data}`);
      }
    } catch (error) {
      if (!isToastVisible) showToast("error",error);
      console.error("Catch for update user", error);
      // toast(`Error ${error}`);
      // setErrorMsg(error);
    }
  }

  async function updateCompnayDetails() {
    const url = `${config.REGISTER_COMPANY}`;
    try {
      const config = {
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      };
      const data = {
        name: companyName,
        userId: userID,
        brandName: brandName,
        pan: PAN,
        gst: gstNumber,
        logo: "",
        regNo: regNo,
        address: companyAddress,
        billingAddress: companyAddress,
        pin: "",
        mobile: companyMobile,
        email: companyEmail,
      };

      const response = await axios.post(url, data, config).then();

      if (response.status === 200 && response.data.status === "SUCCESS") {
        // closePopup(); // Close the popup when the response is successful
        // setShowOTP(true);
          showToast("success","updated successfully");
         
      } else {
        if (!isToastVisible) showToast("error",`Error ${response.data}`);
      }
    } catch (error) {
      console.error("Catch for update company", error);
      // toast(error.response.data.message);
      // setErrorMsg(error);
    }
  }
  return (
    <>
      {/* Overlay */}
      <div
        className={`fixed inset-0 bg-black/40 z-[999999999999] transition-opacity duration-300 ${
          isOpen ? "opacity-100 visible" : "opacity-0 invisible"
        }`}
        onClick={onClose}
      />

      {/* Right Drawer */}
      <div
        className={`fixed top-0 right-0 h-screen w-full sm:w-[75%] bg-white z-[9999999999999] shadow-lg transform transition-transform duration-300 ease-in-out 
        ${isOpen ? "translate-x-0" : "translate-x-full"}`}
      >
        {/* Header */}
        <div className="flex justify-end items-end border-b px-2 bg-[#028fa3]">
          <button
            onClick={onClose}
            className="text-white hover:text-black text-2xl"
          >
            ×
          </button>
        </div>

        {/* Body (your full Profile.jsx goes here) */}
        <div className="p-0 overflow-y-auto h-full">
          {/* Here goes all your Profile.js logic & UI */}
          <div className="p-0">
            <div className={style.bluebgcontainer1}>
              {parentLoader && <FlightLoader isContentRequired={false} />}
              <TabTitle title={"Profile"}>
                {/* Header for B2B */}
                {/* <Header /> */}
                <div className={style.bluebgcontainer}>
                  {/* Profile container */}
                  {!corporateUser && (
                    <div
                      className={style.listtile}
                      onClick={() => {
                        setIsProfileOpen(!isProfileOpen);
                        getUserDetailsByID();
                      }}
                      aria-controls="example-collapse-text"
                      aria-expanded={isProfileOpen}
                    >
                      <Image
                        className={style.listtileicon}
                        src={profile}
                        alt="Unable to load list tile icon"
                      ></Image>
                      {/* <FontAwesomeIcon icon={faUser} color="white" size="50px"/> */}
                      <div className={style.listtilecontent}>
                        <div className={style.listtiletitle}>
                          Profile{" "}
                          {/* <span
                style={{
                  fontSize: "20px",
                  marginLeft: "8px",
                }}
              >
                &#9660;
              </span>{" "} */}
                          <FontAwesomeIcon
                            icon={isProfileOpen ? faCaretDown : faCaretRight}
                            color="white"
                            style={{ fontSize: "20px", marginLeft: "8px" }}
                          />{" "}
                        </div>
                        <div className={style.listtiledescription1}>
                          Manage your login details
                        </div>
                      </div>
                    </div>
                  )}
                  <Collapse in={isProfileOpen}>
                    <div className={isProfileOpen ? "visible" : "hidden"}>
                      <div
                        className={style.rounded}
                        style={{
                          backgroundColor: "#028FA3",
                          padding: "40px",
                          width: "900px",
                        }}
                      >
                        <div
                          style={{
                            backgroundColor: "white",
                            borderRadius: "10px",
                            padding: "20px",
                          }}
                        >
                          <div
                            style={{
                              width: "120px",
                              height: "120px",
                              borderRadius: "50%",
                              background: "lightblue",
                              margin: "auto",
                              marginBottom: "24px",
                            }}
                          ></div>

                          <Tab.Container
                            defaultActiveKey="profile"
                            onSelect={handleProfileTabChange}
                          >
                            <Nav variant="tabs" fill>
                              <Nav.Item>
                                <Nav.Link
                                  eventKey="profile"
                                  className={style.customnavlinkTop}
                                >
                                  Profile Details
                                </Nav.Link>
                              </Nav.Item>
                              <Nav.Item>
                                <Nav.Link
                                  eventKey="company"
                                  className={style.customnavlinkTop}
                                >
                                  Company Details
                                </Nav.Link>
                              </Nav.Item>
                            </Nav>
                            <Tab.Content>
                              <Tab.Pane eventKey="profile">
                                {/* Profile Details Elements */}

                                <form onSubmit={handleSubmit}>
                                  <div className={style.nameDivide}>
                                    <div className={style.namediff}>
                                      <label
                                        htmlFor="firstName"
                                        className={`form-label ${style.textFieldTitle}`}
                                      >
                                        First Name{" "}
                                        <span className={style.redAsterisk}>
                                          *
                                        </span>
                                      </label>
                                      <input
                                        type="text"
                                        className="form-control"
                                        id="firstName"
                                        value={firstName}
                                        onChange={handleFirstNameChange}
                                        onInput={(e) => {
                                          e.target.value =
                                            e.target.value.replace(
                                              /[^A-Za-z\s]/g,
                                              ""
                                            ); // Replace non-alphabetical characters and spaces with empty string
                                        }}
                                        maxLength={30}
                                      />
                                      {firstNameError && (
                                        <p className="text-danger">
                                          {firstNameError}
                                        </p>
                                      )}
                                    </div>

                                    <div className={style.namediff}>
                                      <label
                                        htmlFor="lastName"
                                        className={`form-label ${style.textFieldTitle}`}
                                      >
                                        Last Name{" "}
                                        <span className={style.redAsterisk}>
                                          *
                                        </span>
                                      </label>
                                      <input
                                        type="text"
                                        className="form-control"
                                        id="lastName"
                                        onChange={handleLastNameChange}
                                        value={lastName}
                                        onInput={(e) => {
                                          e.target.value =
                                            e.target.value.replace(
                                              /[^A-Za-z\s]/g,
                                              ""
                                            ); // Replace non-alphabetical characters and spaces with empty string
                                        }}
                                        maxLength={30}
                                      />
                                      {lastNameError && (
                                        <p className="text-danger">
                                          {lastNameError}
                                        </p>
                                      )}
                                    </div>
                                  </div>
                                  <div className="mb-3">
                                    <label
                                      htmlFor="mobileNumber"
                                      className={`form-label ${style.textFieldTitle}`}
                                    >
                                      Mobile Number{" "}
                                      <span className={style.redAsterisk}>
                                        *
                                      </span>
                                    </label>
                                    <input
                                      type="tel"
                                      className="form-control"
                                      id="mobileNumber"
                                      onChange={handleMobileNumberChange}
                                      value={mobile}
                                      // pattern="[0-9]{10}"
                                      onInput={(e) => {
                                        e.target.value = e.target.value.replace(
                                          /[^0-9]/g,
                                          ""
                                        ); // Replace non-numeric characters with empty string
                                      }}
                                      maxLength={10}
                                      readOnly
                                    />
                                    {mobileError && (
                                      <p className="text-danger">
                                        {mobileError}
                                      </p>
                                    )}
                                  </div>
                                  <div className="mb-3">
                                    <label
                                      htmlFor="email"
                                      className={`form-label ${style.textFieldTitle}`}
                                    >
                                      Email Address{" "}
                                      <span className={style.redAsterisk}>
                                        *
                                      </span>
                                    </label>
                                    <input
                                      type="email"
                                      className="form-control"
                                      id="email"
                                      onChange={handleEmailChange}
                                      value={emailID}
                                    />
                                    {emailError && (
                                      <p className="text-danger">
                                        {emailError}
                                      </p>
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
                                        boxShadow:
                                          "5px 5px 10px 2px rgba(0,0,0,.2)",
                                      }}
                                      type="submit"
                                      onClick={handleSubmit}
                                    >
                                      Save
                                    </button>
                                  </div>
                                </form>
                              </Tab.Pane>
                              <Tab.Pane eventKey="company">
                                {/* Company Details Elements */}
                                <div className="text-center mt-4"></div>
                                <form onSubmit={handleCompnayDetailsSubmit}>
                                  <div className={style.nameDivide}>
                                    <div className={style.namediff}>
                                      <label
                                        htmlFor="companyName"
                                        className={`form-label ${style.textFieldTitle}`}
                                      >
                                        Company Name{" "}
                                        <span className={style.redAsterisk}>
                                          *
                                        </span>
                                      </label>
                                      <input
                                        type="text"
                                        className="form-control"
                                        id="companyName"
                                        onInput={(e) => {
                                          e.target.value =
                                            e.target.value.replace(
                                              /[^a-zA-Z0-9\s!@#$%^&*()\-_=+[{\]}\\|;:'",<.>/?]/g,
                                              ""
                                            ); // Replace non-numeric characters with empty string
                                        }}
                                        onChange={handleCompanyNameChange}
                                        value={companyName}
                                        maxLength={50}
                                      />
                                      {companyNameError && (
                                        <p className="text-danger">
                                          {companyNameError}
                                        </p>
                                      )}
                                    </div>
                                    <div className={style.namediff}>
                                      <label
                                        htmlFor="brandName"
                                        className={`form-label ${style.textFieldTitle}`}
                                      >
                                        Brand Name{" "}
                                        <span className={style.redAsterisk}>
                                          *
                                        </span>
                                      </label>
                                      <input
                                        type="text"
                                        className="form-control"
                                        id="brandName"
                                        onInput={(e) => {
                                          e.target.value =
                                            e.target.value.replace(
                                              /[^a-zA-Z0-9\s!@#$%^&*()\-_=+[{\]}\\|;:'",<.>/?]/g,
                                              ""
                                            ); // Replace non-numeric characters with empty string
                                        }}
                                        onChange={handleBrandNameChange}
                                        value={brandName}
                                        maxLength={50}
                                      />
                                      {brandNameError && (
                                        <p className="text-danger">
                                          {brandNameError}
                                        </p>
                                      )}
                                    </div>
                                  </div>
                                  <div className="mb-3">
                                    <label
                                      htmlFor="regNo"
                                      className={`form-label ${style.textFieldTitle}`}
                                    >
                                      Company Registration number{" "}
                                      <span className={style.redAsterisk}>
                                        *
                                      </span>
                                    </label>
                                    <input
                                      type="text"
                                      onInput={(e) => {
                                        e.target.value = e.target.value.replace(
                                          /[^a-zA-Z\d]+/g,
                                          ""
                                        ); // Replace non-numeric characters with empty string
                                        e.target.value =
                                          e.target.value.toUpperCase();
                                      }}
                                      className="form-control"
                                      id="regNo"
                                      onChange={handleRegNoChange}
                                      value={regNo}
                                      maxLength={21}
                                    />
                                    {regNoError && (
                                      <p className="text-danger">
                                        {regNoError}
                                      </p>
                                    )}
                                  </div>
                                  <div className="mb-3">
                                    <label
                                      htmlFor="companyMobile"
                                      className={`form-label ${style.textFieldTitle}`}
                                    >
                                      Company Mobile Number{" "}
                                      <span className={style.redAsterisk}>
                                        *
                                      </span>
                                    </label>
                                    <input
                                      type="tel"
                                      inputMode="numeric" // Set input mode to "numeric" to show a numeric keyboard on mobile devices
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
                                      <p className="text-danger">
                                        {companyMobileError}
                                      </p>
                                    )}
                                  </div>

                                  <div className="mb-3">
                                    <label
                                      htmlFor="address"
                                      className={`form-label ${style.textFieldTitle}`}
                                    >
                                      Address{" "}
                                      <span className={style.redAsterisk}>
                                        *
                                      </span>
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
                                      <p className="text-danger">
                                        {companyAddressError}
                                      </p>
                                    )}
                                  </div>
                                  <div className={style.nameDivide}>
                                    <div className={style.namediff}>
                                      <label
                                        htmlFor="pan"
                                        className={`form-label ${style.textFieldTitle}`}
                                      >
                                        PAN{" "}
                                        <span className={style.redAsterisk}>
                                          *
                                        </span>
                                      </label>
                                      <input
                                        type="text"
                                        onInput={(e) => {
                                          e.target.value =
                                            e.target.value.replace(
                                              /[^a-zA-Z\d]+/g,
                                              ""
                                            ); // Replace non-numeric characters with empty string
                                          e.target.value =
                                            e.target.value.toUpperCase();
                                        }}
                                        maxLength={10}
                                        className="form-control"
                                        id="pan"
                                        onChange={handlePANChange}
                                        value={PAN}
                                      />
                                      {PANError && (
                                        <p className="text-danger">
                                          {PANError}
                                        </p>
                                      )}
                                    </div>
                                    <div className={style.namediff}>
                                      <label
                                        htmlFor="gstin"
                                        className={`form-label ${style.textFieldTitle}`}
                                      >
                                        GSTIN{" "}
                                        <span className={style.redAsterisk}>
                                          *
                                        </span>
                                      </label>
                                      <input
                                        type="text"
                                        onInput={(e) => {
                                          e.target.value =
                                            e.target.value.replace(
                                              /[^a-zA-Z\d]+/g,
                                              ""
                                            ); // Replace non-numeric characters with empty string
                                          e.target.value =
                                            e.target.value.toUpperCase();
                                        }}
                                        className="form-control"
                                        id="gstin"
                                        onChange={handleGstChange}
                                        maxLength={15}
                                        value={gstNumber}
                                      />
                                      {gstNumberError && (
                                        <p className="text-danger">
                                          {gstNumberError}
                                        </p>
                                      )}
                                    </div>
                                  </div>
                                  <div className="mb-3">
                                    <label
                                      htmlFor="companyemail"
                                      className={`form-label ${style.textFieldTitle}`}
                                    >
                                      Company Email Address{" "}
                                      <span className={style.redAsterisk}>
                                        *
                                      </span>
                                    </label>
                                    <input
                                      type="email"
                                      className="form-control"
                                      id="companyemail"
                                      onChange={handleCompanyEmailChange}
                                      value={companyEmail}
                                    />
                                    {companyEmailError && (
                                      <p className="text-danger">
                                        {companyEmailError}
                                      </p>
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
                                        boxShadow:
                                          "5px 5px 10px 2px rgba(0,0,0,.2)",
                                      }}
                                      onClick={handleCompnayDetailsSubmit}
                                    >
                                      Save
                                    </button>
                                  </div>
                                </form>
                              </Tab.Pane>
                            </Tab.Content>
                          </Tab.Container>
                        </div>
                      </div>
                    </div>
                  </Collapse>

                  {/* Booking container */}
                  <div
                    className={style.listtile}
                    alt="Unable to load list tile icon"
                  >
                    <Image
                      className={style.listtileicon}
                      src={briefcase}
                      alt="Unabel to load list tile icon"
                    ></Image>
                    <div className={style.listtilecontent}>
                      <div className={style.listtiletitle}>My Booking </div>
                      <div className={style.listtiledescription1}>
                        Check the status of your booking
                        <div
                          className={style.listtilechild}
                          alt="Unable to load list tile icon"
                          onClick={() => {
                            setIsMyFlightBookingOpen(!isMyFlightBookingOpen);
                            getFlightBookingData("all");
                          }}
                          aria-controls="example-collapse-text"
                          aria-expanded={isMyFlightBookingOpen}
                        >
                          <Image
                            className={style.listtileicon}
                            src={flight}
                            alt="Unabel to load list tile icon"
                          ></Image>
                          <div className={style.listtiletitlechild}>
                            Flight
                            <FontAwesomeIcon
                              icon={
                                isMyFlightBookingOpen
                                  ? faCaretDown
                                  : faCaretRight
                              }
                              color="white"
                              style={{ fontSize: "20px", marginLeft: "8px" }}
                            />
                          </div>
                        </div>
                        <Collapse in={isMyFlightBookingOpen}>
                          <div
                            className={
                              isMyFlightBookingOpen ? "visible" : "hidden"
                            }
                          >
                            <div
                              className={style.roundedTw}
                              style={{
                                backgroundColor: "#028FA3",
                                padding: "40px",
                                width: "120%",
                              }}
                            >
                              <div
                                style={{
                                  backgroundColor: "white",
                                  borderRadius: "10px",
                                  padding: "20px",
                                }}
                              >
                                <Tab.Container
                                  defaultActiveKey="all"
                                  onSelect={handleTab1Change}
                                >
                                  {/* <Tab.Container defaultActiveKey="all" > */}
                                  <Nav
                                    variant="tabs"
                                    fill
                                    className={style.customNav}
                                  >
                                    <Nav.Item>
                                      <Nav.Link
                                        eventKey="all"
                                        className={style.customnavlink}
                                      >
                                        All
                                      </Nav.Link>
                                    </Nav.Item>

                                    <Nav.Item>
                                      <Nav.Link
                                        eventKey="Confirmed"
                                        className={style.customnavlink}
                                      >
                                        UPCOMING FLIGHTS
                                      </Nav.Link>
                                    </Nav.Item>

                                    <Nav.Item>
                                      <Nav.Link
                                        eventKey="Cancelled"
                                        className={style.customnavlink}
                                      >
                                        CANCELLED
                                      </Nav.Link>
                                    </Nav.Item>
                                    <Nav.Item>
                                      <Nav.Link
                                        eventKey="Completed"
                                        className={style.customnavlink}
                                      >
                                        COMPLETED
                                      </Nav.Link>
                                    </Nav.Item>
                                  </Nav>
                                  <Tab.Content>
                                    <Tab.Pane eventKey="all">
                                      {loading ? (
                                        <Loader />
                                      ) : (
                                        <div
                                          className={style.myHotelDropdownTab}
                                        >
                                          {allBooking?.length > 0 ? (
                                            <div
                                              className={
                                                style.myBookingListContainer
                                              }
                                            >
                                              {allBooking
                                                .slice()
                                                .map((booking) => (
                                                  <MyBookingListItem1
                                                    key={booking.id}
                                                    booking={booking}
                                                    type="all"
                                                    walletBalance={
                                                      walletBalance
                                                    }
                                                    setParentLoader={
                                                      setParentLoader
                                                    }
                                                    onClose={onClose}
                                                  />
                                                ))}
                                            </div>
                                          ) : (
                                            <div>
                                              <div
                                                className={style.noBookingText}
                                              >
                                                <p>
                                                  You currently have no recent
                                                  bookings
                                                </p>
                                              </div>
                                            </div>
                                          )}
                                        </div>
                                      )}
                                    </Tab.Pane>
                                    <Tab.Pane eventKey="Confirmed">
                                      {loading ? (
                                        <Loader />
                                      ) : (
                                        <div>
                                          {confirmedBooking != null &&
                                          confirmedBooking.length > 0 ? (
                                            <div
                                              className={
                                                style.myBookingListContainer
                                              }
                                            >
                                              {confirmedBooking
                                                .slice()
                                                .map((booking) => (
                                                  <MyBookingListItem1
                                                    key={booking.id}
                                                    booking={booking}
                                                    type="Confirmed"
                                                    walletBalance={
                                                      walletBalance
                                                    }
                                                    setParentLoader={
                                                      setParentLoader
                                                    }
                                                  />
                                                ))}
                                            </div>
                                          ) : (
                                            <div>
                                              <div
                                                className={style.noBookingText}
                                              >
                                                <p>
                                                  You currently have no Upcoming
                                                  flight bookings
                                                </p>
                                              </div>
                                            </div>
                                          )}
                                        </div>
                                      )}
                                    </Tab.Pane>
                                    <Tab.Pane eventKey="Reserved">
                                      {/* Reserved Details Elements */}
                                      {loading ? (
                                        <Loader />
                                      ) : (
                                        <div>
                                          {reservedBooking != null &&
                                          reservedBooking.length > 0 ? (
                                            <div
                                              className={
                                                style.myBookingListContainer
                                              }
                                            >
                                              {reservedBooking
                                                .slice()
                                                .map((booking) => (
                                                  <MyBookingListItem1
                                                    key={booking.id}
                                                    booking={booking}
                                                    type="Reserved"
                                                    walletBalance={
                                                      walletBalance
                                                    }
                                                    setParentLoader={
                                                      setParentLoader
                                                    }
                                                  />
                                                ))}
                                            </div>
                                          ) : (
                                            <div>
                                              <div
                                                className={style.noBookingText}
                                              >
                                                <p>
                                                  You currently have no Reserved
                                                  bookings
                                                </p>
                                              </div>
                                            </div>
                                          )}
                                        </div>
                                      )}
                                    </Tab.Pane>
                                    <Tab.Pane eventKey="Completed">
                                      {loading ? (
                                        <Loader />
                                      ) : (
                                        <div>
                                          {completedBooking != null &&
                                          completedBooking.length > 0 ? (
                                            <div
                                              className={
                                                style.myBookingListContainer
                                              }
                                            >
                                              {completedBooking.map(
                                                (booking) => (
                                                  <MyBookingListItem1
                                                    key={booking.id}
                                                    booking={booking}
                                                    type="Completed"
                                                    walletBalance={
                                                      walletBalance
                                                    }
                                                    setParentLoader={
                                                      setParentLoader
                                                    }
                                                  />
                                                )
                                              )}
                                            </div>
                                          ) : (
                                            <div>
                                              <div
                                                className={style.noBookingText}
                                              >
                                                <p>
                                                  You currently have no
                                                  Completed bookings
                                                </p>
                                              </div>
                                            </div>
                                          )}
                                        </div>
                                      )}
                                    </Tab.Pane>
                                    <Tab.Pane eventKey="Cancelled">
                                      {loading ? (
                                        <Loader />
                                      ) : (
                                        <div>
                                          {cancelledBooking != null &&
                                          cancelledBooking.length > 0 ? (
                                            <div
                                              className={
                                                style.myBookingListContainer
                                              }
                                            >
                                              {cancelledBooking.map(
                                                (booking) => (
                                                  <MyBookingListItem1
                                                    key={booking.id}
                                                    booking={booking}
                                                    type="Cancelled"
                                                    walletBalance={
                                                      walletBalance
                                                    }
                                                    setParentLoader={
                                                      setParentLoader
                                                    }
                                                  />
                                                )
                                              )}
                                            </div>
                                          ) : (
                                            <div>
                                              <div
                                                className={style.noBookingText}
                                              >
                                                <p>
                                                  You currently have no
                                                  cancelled bookings
                                                </p>
                                              </div>
                                            </div>
                                          )}
                                        </div>
                                      )}
                                    </Tab.Pane>
                                  </Tab.Content>
                                </Tab.Container>
                              </div>
                            </div>
                          </div>
                        </Collapse>
                      </div>
                      <div
                        className={style.listtilechild}
                        alt="Unable to load list tile icon"
                        // onClick={() => setIsMyHotelBookingOpen(!isMyHotelBookingOpen)}
                        onClick={() => {
                          setIsMyHotelBookingOpen(!isMyHotelBookingOpen);
                          getBookingData("all");
                        }}
                        aria-controls="example-collapse-text"
                        aria-expanded={isMyHotelBookingOpen}
                      >
                        <Image
                          className={style.listtileicon}
                          src={hotel}
                          alt="Unabel to load list tile icon"
                        ></Image>
                        <div className={style.listtiletitlechild}>
                          Hotel
                          <FontAwesomeIcon
                            icon={
                              isMyHotelBookingOpen ? faCaretDown : faCaretRight
                            }
                            color="white"
                            style={{ fontSize: "20px", marginLeft: "8px" }}
                          />
                        </div>
                      </div>
                      <Collapse in={isMyHotelBookingOpen}>
                        <div
                          className={
                            isMyHotelBookingOpen ? "visible" : "hidden"
                          }
                        >
                          <div
                            className={style.roundedTwo}
                            style={{
                              backgroundColor: "#028FA3",
                              padding: "40px",
                              width: "120%",
                            }}
                          >
                            <div
                              className={style.borderradius}
                              style={{
                                backgroundColor: "white",
                                borderRadius: "10px",
                                // padding: "20px",
                              }}
                            >
                              <Tab.Container
                                defaultActiveKey="all"
                                onSelect={handleTabChange}
                              >
                                {/* <Tab.Container defaultActiveKey="all" > */}
                                <Nav variant="tabs" fill>
                                  <Nav.Item>
                                    <Nav.Link
                                      eventKey="all"
                                      className={style.customnavlink}
                                    >
                                      All
                                    </Nav.Link>
                                  </Nav.Item>
                                  <Nav.Item>
                                    <Nav.Link
                                      eventKey="Reserved"
                                      className={style.customnavlink}
                                    >
                                      RESERVED
                                    </Nav.Link>
                                  </Nav.Item>
                                  <Nav.Item>
                                    <Nav.Link
                                      eventKey="Confirmed"
                                      className={style.customnavlink}
                                    >
                                      CONFIRMED
                                    </Nav.Link>
                                  </Nav.Item>
                                  <Nav.Item>
                                    <Nav.Link
                                      eventKey="Cancelled"
                                      className={style.customnavlink}
                                    >
                                      CANCELLED
                                    </Nav.Link>
                                  </Nav.Item>
                                  <Nav.Item>
                                    <Nav.Link
                                      eventKey="Completed"
                                      className={style.customnavlink}
                                    >
                                      COMPLETED
                                    </Nav.Link>
                                  </Nav.Item>
                                </Nav>
                                <Tab.Content>
                                  <Tab.Pane eventKey="all">
                                    {/* Profile Details Elements */}
                                    {loading ? (
                                      <Loader />
                                    ) : (
                                      <div className={style.myHotelDropdownTab}>
                                        {allBookings?.length > 0 ? (
                                          <div
                                            className={
                                              style.myBookingListContainer
                                            }
                                          >
                                            {allBookings.map((booking) => (
                                              <MyBookingListItem
                                                key={booking.id}
                                                booking={booking}
                                                type="all"
                                              />
                                            ))}
                                          </div>
                                        ) : (
                                          <div>
                                            <div
                                              className={style.noBookingText}
                                            >
                                              <p>
                                                You currently have no recent
                                                bookings
                                              </p>
                                            </div>
                                          </div>
                                        )}
                                      </div>
                                    )}
                                  </Tab.Pane>
                                  <Tab.Pane eventKey="Reserved">
                                    {/* Reserved Details Elements */}
                                    {loading ? (
                                      <Loader />
                                    ) : (
                                      <div>
                                        {reservedBookings != null &&
                                        reservedBookings.length > 0 ? (
                                          <div
                                            className={
                                              style.myBookingListContainer
                                            }
                                          >
                                            {reservedBookings.map((booking) => (
                                              <MyBookingListItem
                                                key={booking.id}
                                                booking={booking}
                                                type="Reserved"
                                              />
                                            ))}
                                          </div>
                                        ) : (
                                          <div>
                                            <div
                                              className={style.noBookingText}
                                            >
                                              <p>
                                                You currently have no reserved
                                                bookings
                                              </p>
                                            </div>
                                          </div>
                                        )}
                                      </div>
                                    )}
                                  </Tab.Pane>
                                  <Tab.Pane eventKey="Confirmed">
                                    {/* Completed Hotel list */}
                                    {loading ? (
                                      <Loader />
                                    ) : (
                                      <div>
                                        {confirmedBookings != null &&
                                        confirmedBookings.length > 0 ? (
                                          <div
                                            className={
                                              style.myBookingListContainer
                                            }
                                          >
                                            {confirmedBookings.map(
                                              (booking) => (
                                                <MyBookingListItem
                                                  key={booking.id}
                                                  booking={booking}
                                                  type="Confirmed"
                                                />
                                              )
                                            )}
                                          </div>
                                        ) : (
                                          <div>
                                            <div
                                              className={style.noBookingText}
                                            >
                                              <p>
                                                You currently have no confirmed
                                                bookings
                                              </p>
                                            </div>
                                          </div>
                                        )}
                                      </div>
                                    )}
                                  </Tab.Pane>
                                  <Tab.Pane eventKey="Cancelled">
                                    {/* Cancelled Hotel list */}
                                    {loading ? (
                                      <Loader />
                                    ) : (
                                      <div>
                                        {cancelledBookings != null &&
                                        cancelledBookings.length > 0 ? (
                                          <div
                                            className={
                                              style.myBookingListContainer
                                            }
                                          >
                                            {cancelledBookings.map(
                                              (booking) => (
                                                <MyBookingListItem
                                                  key={booking.id}
                                                  booking={booking}
                                                  type="Cancelled"
                                                />
                                              )
                                            )}
                                          </div>
                                        ) : (
                                          <div>
                                            <div
                                              className={style.noBookingText}
                                            >
                                              <p>
                                                You currently have no cancelled
                                                bookings
                                              </p>
                                            </div>
                                          </div>
                                        )}
                                      </div>
                                    )}
                                  </Tab.Pane>
                                  <Tab.Pane eventKey="Completed">
                                    {/* Completed Hotel list */}
                                    {loading ? (
                                      <Loader />
                                    ) : (
                                      <div>
                                        {completedBookings != null &&
                                        completedBookings.length > 0 ? (
                                          <div
                                            className={
                                              style.myBookingListContainer
                                            }
                                          >
                                            {completedBookings.map(
                                              (booking) => (
                                                <MyBookingListItem
                                                  key={booking.id}
                                                  booking={booking}
                                                  type="Completed"
                                                />
                                              )
                                            )}
                                          </div>
                                        ) : (
                                          <div>
                                            <div
                                              className={style.noBookingText}
                                            >
                                              <p>
                                                You currently have no confirmed
                                                bookings
                                              </p>
                                            </div>
                                          </div>
                                        )}
                                      </div>
                                    )}
                                  </Tab.Pane>
                                </Tab.Content>
                              </Tab.Container>
                            </div>
                          </div>
                        </div>
                      </Collapse>

                      {/* {flights profile} */}

                      {/* {packages profile} */}
                      <div
                        className={style.listtilechild}
                        alt="Unable to load list tile icon"
                        // onClick={() => setIsMyHotelBookingOpen(!isMyHotelBookingOpen)}
                        onClick={() => {
                          setIsMyPackageBookingOpen(!isMyPackageBookingOpen);
                          getPackagesBookedData(1);
                        }}
                      >
                        <Image
                          className={style.listtileicon}
                          src={packages}
                          alt="Unable to load list tile icon"
                        ></Image>
                        <div className={style.listtiletitlechild}>
                          Packages
                          <FontAwesomeIcon
                            icon={
                              isMyPackageBookingOpen
                                ? faCaretDown
                                : faCaretRight
                            }
                            color="white"
                            style={{ fontSize: "20px", marginLeft: "8px" }}
                          />
                        </div>
                      </div>
                      <Collapse in={isMyPackageBookingOpen}>
                        <div
                          className={
                            isMyPackageBookingOpen ? "visible" : "hidden"
                          }
                        >
                          <div
                            className={style.roundedTw}
                            style={{
                              backgroundColor: "#028FA3",
                              padding: "40px",
                              width: "120%",
                            }}
                          >
                            <div
                              style={{
                                backgroundColor: "white",
                                borderRadius: "10px",
                                padding: "20px",
                              }}
                            >
                              <Tab.Container
                                defaultActiveKey="1"
                                onSelect={handlePackageTabChange}
                              >
                                {/* <Tab.Container defaultActiveKey="all" > */}
                                <Nav
                                  variant="tabs"
                                  fill
                                  className={style.customNav}
                                >
                                  <Nav.Item>
                                    <Nav.Link
                                      eventKey="1"
                                      className={style.customnavlink}
                                    >
                                      All
                                    </Nav.Link>
                                  </Nav.Item>
                                  <Nav.Item>
                                    <Nav.Link
                                      eventKey="2"
                                      className={style.customnavlink}
                                    >
                                      CONFIRMED
                                    </Nav.Link>
                                  </Nav.Item>
                                  <Nav.Item>
                                    <Nav.Link
                                      eventKey="3"
                                      className={style.customnavlink}
                                    >
                                      COMPLETED
                                    </Nav.Link>
                                  </Nav.Item>
                                </Nav>
                                <Tab.Content>
                                  <Tab.Pane eventKey="1">
                                    {/* Profile Details Elements */}
                                    {loading ? (
                                      <Loader />
                                    ) : (
                                      <div className={style.myHotelDropdownTab}>
                                        {packagesBookingData?.length > 0 ? (
                                          <div
                                            className={
                                              style.myBookingListContainer
                                            }
                                          >
                                            {packagesBookingData.map(
                                              (booking) => (
                                                <BookingList
                                                  key={booking.id}
                                                  booking={booking}
                                                  type="all"
                                                  onClose={onClose}
                                                />
                                              )
                                            )}
                                          </div>
                                        ) : (
                                          <div>
                                            <div
                                              className={style.noBookingText}
                                            >
                                              <p>
                                                You currently have no recents
                                                bookings
                                              </p>
                                            </div>
                                          </div>
                                        )}
                                      </div>
                                    )}
                                  </Tab.Pane>
                                  <Tab.Pane eventKey="2">
                                    {/* confirmed Hotel list */}
                                    {loading ? (
                                      <Loader />
                                    ) : (
                                      <div>
                                        {packagesBookingData.length > 0 ? (
                                          <div
                                            className={
                                              style.myBookingListContainer
                                            }
                                          >
                                            {packagesBookingData.map(
                                              (booking) => (
                                                <BookingList
                                                  key={booking.id}
                                                  booking={booking}
                                                  type="confirmed"
                                                />
                                              )
                                            )}
                                          </div>
                                        ) : (
                                          <div>
                                            <div
                                              className={style.noBookingText}
                                            >
                                              <p>
                                                You currently have no confirmed
                                                bookings
                                              </p>
                                            </div>
                                          </div>
                                        )}
                                      </div>
                                    )}
                                  </Tab.Pane>
                                  <Tab.Pane eventKey="3">
                                    {/* Completed Hotel list */}
                                    {loading ? (
                                      <Loader />
                                    ) : (
                                      <div>
                                        {packagesBookingData.length > 0 ? (
                                          <div
                                            className={
                                              style.myBookingListContainer
                                            }
                                          >
                                            {packagesBookingData.map(
                                              (booking) => (
                                                <BookingList
                                                  key={booking.id}
                                                  booking={booking}
                                                  type="completed"
                                                />
                                              )
                                            )}
                                          </div>
                                        ) : (
                                          <div>
                                            <div
                                              className={style.noBookingText}
                                            >
                                              <p>
                                                You currently have no completed
                                                bookings
                                              </p>
                                            </div>
                                          </div>
                                        )}
                                      </div>
                                    )}
                                  </Tab.Pane>
                                </Tab.Content>
                              </Tab.Container>
                            </div>
                          </div>
                        </div>
                      </Collapse>
                    </div>
                  </div>
                  {!corporateUser && (
                    <div
                      style={{
                        display: "flex",
                        marginLeft: "14px",
                        cursor: "pointer",
                        width: "32%",
                      }}
                      onClick={handleDeleteUser1}
                    >
                      <FontAwesomeIcon
                        icon={faTrash}
                        color="white"
                        className={style.listtileicon1}
                      />
                      <div className={style.listtilecontent}>
                        <div className={style.listtiletitle}>
                          Delete Account{" "}
                        </div>
                      </div>
                    </div>
                  )}

                  {showWarning && (
                    <div className={style.popupOverlay}>
                      <div className={style.popupContent}>
                        {walletBalance > 0 && (
                          <div className={style.walletText1}>
                            Your wallet Balance{" "}
                            <span className={style.walletText}>
                              Rs.{walletBalance}
                            </span>{" "}
                          </div>
                        )}

                        <div className={style.walletText1}>
                          {" "}
                          Are you sure still you want to delete your account?
                        </div>
                        <div className={style.buttonContainer}>
                          <button
                            className={`${style.button} ${style.delete}`}
                            onClick={handleConfirmDelete}
                          >
                            Yes
                          </button>
                          <button
                            className={`${style.button} ${style.cancel}`}
                            onClick={handleCancelDelete}
                          >
                            No
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Logout Button */}
                  <div
                    className={style.logoutButton}
                    onClick={handleProfileLogout}
                  >
                    <Image
                      className={style.logoutIcon}
                      src={logoutIcon}
                      alt="Unable to load list tile icon"
                    ></Image>
                    <div className={style.verticalLine}></div>
                    Logout
                  </div>
                </div>
              </TabTitle>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
