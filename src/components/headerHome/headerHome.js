import Image from "next/image";
import "bootstrap/dist/css/bootstrap.css";
import style from "./styles.module.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSearch } from "@fortawesome/free-solid-svg-icons";
import qugologo from "../../images/qugoLogo.png";
import profileLogo from "../../images/profileLogo.png";
import { Button } from "react-bootstrap";
import { useEffect, useState, useRef } from "react";
import Popup from "reactjs-popup";
import Signin from "@/pages/login";
import props from "prop-types";
import { Modal } from "react-bootstrap";
import qugoLogo1 from "../../images/qugoLogo1.png";
import { Nav, Tab, Form } from "react-bootstrap";
import { useRouter } from "next/router";
import { getHotelSearchData } from "../../../utils/homepageAPI";
import Dropdown from "react-bootstrap/Dropdown";
import { fetchUserIp } from "../../../utils/fetchUserIP";
import config from "@/config";
import axios, { getTabSpecificData, setTabSpecificData } from "@/utils/axios/axios";
import useLocalStorage from "@/hooks/useLocalStorage";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { faCalendarAlt } from "@fortawesome/free-solid-svg-icons";
import TabTitle from "../tabtitles/tabtitle";
import showToast from "@/utils/toast";

const formatDateToDDMMYYYY = (date) => {
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0"); // Months are zero-based
  const year = date.getFullYear();

  return `${day}-${month}-${year}`;
};

const convertToDateObject = (ddMMyyyy) => {
  const parts = ddMMyyyy.split("-");
  const day = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10) - 1; // Months are zero-based in Date object
  const year = parseInt(parts[2], 10);

  return new Date(year, month, day);
};

const convertToFormattedDate = (dateString) => {
  const [day, month, year] = dateString.split("-");
  const formattedDate = `${day}/${month}/${year}`;
  return formattedDate;
};

const calculateNoOfNights = (checkin, checkout) => {
  const oneDay = 24 * 60 * 60 * 1000; // Number of milliseconds in a day
  const [checkinDay, checkinMonth, checkinYear] = checkin.split("-");
  const [checkoutDay, checkoutMonth, checkoutYear] = checkout.split("-");

  const checkInDate = new Date(checkinYear, checkinMonth - 1, checkinDay);
  const checkOutDate = new Date(checkoutYear, checkoutMonth - 1, checkoutDay);

  const timeDifference = checkOutDate.getTime() - checkInDate.getTime();
  const noOfNights = Math.ceil(timeDifference / oneDay).toString();
  return noOfNights;
};

const addOneDayToDate = (dateString) => {
  // Split the date string into day, month, and year parts
  const [day, month, year] = dateString.split("-");

  // Create a new Date object with the parsed day, month, and year
  const dateObject = new Date(`${year}-${month}-${day}`);

  // Add one day to the date object
  dateObject.setDate(dateObject.getDate() + 1);

  // Get the day, month, and year parts from the updated date object
  const updatedDay = dateObject.getDate().toString().padStart(2, "0");
  const updatedMonth = (dateObject.getMonth() + 1).toString().padStart(2, "0");
  const updatedYear = dateObject.getFullYear();

  // Format the updated date back to "dd-mm-yyyy" format
  const updatedDateString = `${updatedDay}-${updatedMonth}-${updatedYear}`;
  return updatedDateString;
};

export default function HeaderHome({ searchRoomCall }) {
  const [isOpen, setIsOpen] = useState(false);
  const [showLoginButton, setShowLoginButton] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const router = useRouter();
  const [destination, setDestination] = useState("");
  const [getDestinationObj, setDestinationObj] = useState("");
  const [matchingDestinations, setMatchingDestinations] = useState([]);
  const [getCityId, setCityId] = useState("");
  const [getCountryCode, setCountryCode] = useState("");
  const [getHotelCode, setHotelCode] = useState("");
  const [title, setTitle] = useState("Home");
  const [checkinDate, setCheckinDate] = useState(
    formatDateToDDMMYYYY(new Date())
  );
  const [selectedItemIndex, setSelectedItemIndex] = useState(-1);

  const today = new Date();
  today.setDate(today.getDate() + 1); // Add one day to the current date
  const [checkoutDate, setCheckoutDate] = useState(() => {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    return formatDateToDDMMYYYY(tomorrow);
  });
  const [checkoutMinDate, setCheckoutMinDate] = useState(checkoutDate);
  const [rooms, setRooms] = useState(1);
  const [adults, setAdults] = useState(2);
  const [roomText, setRoomText] = useState("Room");
  const [adultsText, setAdultsText] = useState("Adult");
  const [childrenText, setChildrenText] = useState("Child");
  const [children, setChildren] = useState(0);
  const [age, setAge] = useState([]);
  const [roomCount, setRoomCount] = useState([
    { adults: 2, children: 0, childAge: [] },
  ]);
  const [hotelLocation, setHotelLocation] = useState("");
  const [getuserip, setuserip] = useLocalStorage("userip");
  const [getAccessToken, setAccessToken] = useLocalStorage("accessToken");
  const [storedAccessToken, setStoredAccessToken] = useState("");
  const [divDisabled, setdivDisabled] = useState(false);
  const [getUserDetails, setUserDetails] = useLocalStorage("userDetails");
  const [loadedUserName, setLoadedUserName] = useState("");

  const checkinTimeRef = useRef(null);
  const checkoutTimeRef = useRef(null);

  useEffect(() => {
    setRoomText(rooms === 1 ? "Room" : "Rooms");
  }, [rooms]);

  useEffect(() => {
    setAdultsText(adults === 1 ? "Adult" : "Adults");
  }, [adults]);

  useEffect(() => {
    if (children === 0 || children === 1) {
      setChildrenText("Child");
    } else {
      setChildrenText("Children");
    }
  }, [children]);

  const handleDestinationChange = (event) => {
    const value = event.target.value;
    setDestination(value);
    setCityId("");
  };

  useEffect(() => {
    setMatchingDestinations([]);
    if (destination.length === 0) {
      // If the value is empty, set the status to "empty"
      setCityId(""); // Clear the matching destinations dropdown
    } else if (destination.length >= 3) {
      axios
        .get(`${config.GET_SEARCH_DESTINATION_NAME}?name=${destination.trim()}`)
        .then((response) => {
          const data = response.data;
          setMatchingDestinations(data.data);
          setSelectedItemIndex(-1);
        })
        .catch((error) => {
          console.error("Error fetching matching destinations:", error);
        });
    }
  }, [destination]);

  const dropdownRef = useRef(null);

  useEffect(() => {
    document.addEventListener("click", handleDocumentClick);

    return () => {
      document.removeEventListener("click", handleDocumentClick);
    };
  }, []);

  const handleDocumentClick = (event) => {
    if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
      setMatchingDestinations([]);
    }
  };

  const handleSelectDestination = async (selectedDestination) => {
    if (selectedDestination.type === 1) {
      setDestination(
        selectedDestination.cityname + ", " + selectedDestination.countryname
      );
    } else if (selectedDestination.type === 2) {
      setDestination(
        selectedDestination.title +
          ", " +
          selectedDestination.cityname +
          ", " +
          selectedDestination.countryname
      );
    }
    setHotelLocation(
      selectedDestination.cityname + ", " + selectedDestination.countryname
    );
    setDestinationObj(JSON.stringify(selectedDestination));
    setCityId(selectedDestination.cityid);
    setCountryCode(selectedDestination.countryalpha2code);
    setHotelCode(selectedDestination.hotelcode);
    setMatchingDestinations([]); // Clear the matching destinations dropdown
  };

  const goToProfile = () => {
    router.push("/profile");
  };

  const saveSearchData = (qTraceId) => {
    setTabSpecificData(
      "searchData",
      JSON.stringify({
        adults: adults,
        children: children,
        rooms: rooms,
        checkInDate: checkinDate,
        checkoutDate: checkoutDate,
        roomCountString: JSON.stringify(roomCount),
        qTraceId: qTraceId,
        destination: destination,
        getCityId: getCityId,
        getCountryCode: getCountryCode,
        getHotelCode: getHotelCode,
        hotelLocation: hotelLocation,
      })
    );
  };

  const goToHotelList = (qTraceId) => {
    saveSearchData(qTraceId);
    const roomCountString = JSON.stringify(roomCount);
    router.push({
      pathname: "/hotellist",
    });
  };
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const storedUserName = getTabSpecificData("userDetails");

    if (storedUserName) {
      setLoadedUserName(storedUserName);
    }
  }, []);

  const openPopup = () => {
    setIsOpen(true);
  };

  const closePopup = (showLoginButton) => {
    setIsOpen(false);
    setShowLoginButton(showLoginButton);
  };

  const openModal = () => {
    setShowModal(true);
  };

  const handleCheckinChange = (selectedDate) => {
    const formattedSelectedDate = formatDateToDDMMYYYY(new Date(selectedDate));
    setCheckinDate(formattedSelectedDate);

    const [selectedDay, selectedMonth, selectedYear] =
      formattedSelectedDate.split("-");
    const [checkoutDay, checkoutMonth, checkoutYear] = checkoutDate.split("-");

    const selectedDateObj = new Date(
      selectedYear,
      selectedMonth - 1,
      selectedDay
    );
    const checkoutDateObj = new Date(
      checkoutYear,
      checkoutMonth - 1,
      checkoutDay
    );

    if (checkoutDateObj <= selectedDateObj) {
      const updatedCheckoutDateObj = new Date(selectedDateObj);
      updatedCheckoutDateObj.setDate(updatedCheckoutDateObj.getDate() + 1);

      const updatedCheckoutDate = formatDateToDDMMYYYY(updatedCheckoutDateObj);
      setCheckoutDate(updatedCheckoutDate);
    }
  };

  const handleCheckoutChange = (selectedDate) => {
    const formattedSelectedDate = formatDateToDDMMYYYY(new Date(selectedDate));
    setCheckoutDate(formattedSelectedDate);

    const [selectedDay, selectedMonth, selectedYear] =
      formattedSelectedDate.split("-");
    const [checkinDay, checkinMonth, checkinYear] = checkinDate.split("-");

    const selectedDateObj = new Date(
      selectedYear,
      selectedMonth - 1,
      selectedDay
    );
    const checkinDateObj = new Date(checkinYear, checkinMonth - 1, checkinDay);

    if (checkinDateObj >= selectedDateObj) {
      const updatedCheckoutDateObj = new Date(selectedDateObj);
      updatedCheckoutDateObj.setDate(updatedCheckoutDateObj.getDate() + 1);

      const updatedCheckoutDate = formatDateToDDMMYYYY(updatedCheckoutDateObj);
      setCheckoutDate(updatedCheckoutDate);
    }
  };

  function getDayOfWeek(dateString) {
    if (!dateString) return ""; // Return an empty string if dateString is falsy

    const [day, month, year] = dateString.split("-").map(Number);

    // Check if day, month, and year are valid numbers
    if (isNaN(day) || isNaN(month) || isNaN(year)) return "";

    const date = new Date(year, month - 1, day); // Month is 0-based in JavaScript Date constructor
    if (isNaN(date)) return ""; // Return an empty string if date is not a valid date

    const daysOfWeek = [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ];
    const dayOfWeek = date.getDay();
    return daysOfWeek[dayOfWeek];
  }

  const search = async () => {
    let accessToken = getTabSpecificData("accessToken");
    // let accessToken = 1;
    if (!accessToken) {
      openPopup();
      return;
    }

    if (!getCityId) {
      showToast("info","Please select and search city or hotel.");
      if (divDisabled) {
        return; // Return early if button is disabled
      }

      // Disable the button
      setdivDisabled(true);

      // Rest of your logic

      // Enable the button after a specific delay (e.g., 3 seconds)
      setTimeout(() => {
        setdivDisabled(false);
      }, 6000); // Adjust the delay as needed
      return;
    }

    if (new Date(checkinDate) > new Date(checkoutDate)) {
      showToast("info","Check-in date cannot be greater than checkout date");
      return;
    }

    if (
      convertToDateObject(checkinDate) <
      convertToDateObject(formatDateToDDMMYYYY(new Date()))
    ) {
      showToast("info","Check-In and Checkout Dates must be greater than current Date");
      return;
    }

    try {
      setLoading(true);
      searchRoomCall(true);
      const formattedCheckinDate = convertToFormattedDate(checkinDate);
      const formattedCheckoutDate = convertToFormattedDate(checkoutDate);
      const noOfNights = calculateNoOfNights(checkinDate, checkoutDate);
      const storedUserIp = getTabSpecificData("userip");
      const req = {
        checkInDate: formattedCheckinDate,
        noOfNights: noOfNights,
        countryCode: getCountryCode,
        cityId: getCityId,
        hotelCode: getHotelCode,
        preferredCurrency: "INR",
        guestNationality: "IN",
        noOfRooms: rooms,
        maxRating: 5,
        minRating: 1,
        isNearBySearchAllowed: false,
        ipaddress: storedUserIp == "undefined" ? null : storedUserIp,
        isislandhopper: "false",
        radius: "",
        latitude: "",
        longitude: "",
        roomGuests: roomCount.map((roomCount) => ({
          noOfAdults: roomCount.adults,
          noOfChild: roomCount.children,
          childAge: roomCount.childAge,
        })),
      };
      const configuration = {
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      };

      const { data } = await axios.post(
        `${config.GET_HOTEL_SEARCH_DATA}`,
        req,
        configuration
      );

      const response = data?.data?.response;
      const request = data?.data?.request;
      const qTraceId = response?.qTraceId;
      if (qTraceId) {
        setTabSpecificData("hotelList", JSON.stringify(response));
        setTabSpecificData("selectedCity", getDestinationObj);
        setTabSpecificData("searchRequest", JSON.stringify(request));

        goToHotelList(
          qTraceId,
          rooms,
          destination,
          checkinDate,
          checkoutDate,
          getCityId
        );
        setLoading(false);
      }
    } catch (error) {
      const errorMessage =
        error?.response?.data?.error?.errormessage ||
        "Unable to fetch hotels, please try after some time";
      showToast("info",errorMessage);
      setLoading(false);
    } finally {
      setLoading(false);
      searchRoomCall(false);
    }
  };

  const handleRoomChange = (event) => {
    const newRoomCount = parseInt(event.target.value);
    setRooms(newRoomCount);

    let updatedRoomCount = [...roomCount];

    if (newRoomCount > updatedRoomCount.length) {
      for (let i = updatedRoomCount.length; i < newRoomCount; i++) {
        updatedRoomCount.push({ adults: 2, children: 0, childAge: [] });
      }
    } else if (newRoomCount < updatedRoomCount.length) {
      updatedRoomCount = updatedRoomCount.slice(0, newRoomCount);
    }

    let totalAdults = updatedRoomCount.reduce(
      (total, room) => total + room.adults,
      0
    );

    setAdults(totalAdults);
    if (totalAdults > 1) {
      setAdultsText("Adults");
    } else {
      setAdultsText("Adult"); // Update adultsText when there's only 1 adult
    }

    setRoomCount(updatedRoomCount);
  };

  const handleAdultChange = (event, index) => {
    const newAdultsValue = parseInt(event.target.value);
    setRoomCount((prevRoomCount) => {
      const updatedRoomCount = [...prevRoomCount];
      updatedRoomCount[index] = {
        ...updatedRoomCount[index],
        adults: newAdultsValue,
      };

      let totalAdults = updatedRoomCount.reduce(
        (total, room) => total + room.adults,
        0
      );

      setAdults(totalAdults);
      if (totalAdults > 1) {
        setAdultsText("Adults");
      }

      return updatedRoomCount;
    });
  };

  const handleChildChange = (event, index) => {
    const roomDetails = [...roomCount];
    roomDetails[index].children = parseInt(event.target.value);
    const childAge = [];
    for (let i = 0; i < event.target.value; i++) {
      childAge.push(1);
    }
    roomDetails[index].childAge = childAge;
    let totalChildren = 0;
    roomDetails.forEach((room) => {
      totalChildren += parseInt(room.children);
    });
    setChildren(totalChildren);
    if (totalChildren > 1) {
      setChildrenText("children");
    }
    setRoomCount(roomDetails);
  };

  const handleAgeChange = (e, roomIndex, childIndex) => {
    const updatedRoomCount = [...roomCount];
    updatedRoomCount[roomIndex].childAge[childIndex] = parseInt(e.target.value);
    setRoomCount(updatedRoomCount);
  };

  //Called when page loads
  useEffect(() => {
    let accessToken = getTabSpecificData("accessToken");
    if (!accessToken) {
      openPopup();
      return;
    }
    const fetchData = async () => {
      try {
        let userip = await fetchUserIp();
      } catch (error) {
        console.error("Error fetching user's IP:", error);
      }
    };

    fetchData();
    setStoredAccessToken(accessToken);
    if (accessToken) {
      setShowLoginButton(false);
    }
  }, []);

  //keyup and keydown in destination auto suggestion

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (matchingDestinations.length > 0) {
        if (event.key === "ArrowDown") {
          setSelectedItemIndex((prevIndex) =>
            prevIndex < matchingDestinations.length - 1
              ? prevIndex + 1
              : prevIndex
          );
        } else if (event.key === "ArrowUp") {
          event.preventDefault();
          if (selectedItemIndex > 0) {
            setSelectedItemIndex((prevIndex) =>
              prevIndex > 0 ? prevIndex - 1 : matchingDestinations.length - 1
            );
          } else {
            setSelectedItemIndex(-1);
          }
        } else if (event.key === "Enter" && selectedItemIndex !== -1) {
          handleSelectDestination(matchingDestinations[selectedItemIndex]);
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [selectedItemIndex, matchingDestinations]);
  return (
    <>
      <TabTitle title={title}></TabTitle>
      <div
        className={`${style.blurContainer} ${
          isOpen ? style.blurBackground : ""
        }`}
      >
        <div className={style.hotelSearchMainDiv}>
          <div className={style.container}>
            <div
              id={style.banner}
              className={`${style.topbanner} ${style.topbanner}`}
            >
              <header
                className="text-white py-3"
                style={{
                  backgroundColor: "rgba(0, 42, 48, 0.80)",
                  maxHeight: "100px",
                }}
              >
                <div className="container">
                  <div className="row align-items-center align-items-end">
                    <div className="col-md-1">
                      <Image
                        className={style.qugoLogo}
                        src={qugologo}
                        alt="Qugo Logo"
                      />
                    </div>
                    <div className="col-md-10 col-sm-6"></div>
                    <div className="col-md-1 d-flex align-items-center justify-content-center">
                      {showLoginButton ? (
                        <Button
                          className={style.loginbutton}
                          onClick={openPopup}
                        >
                          Login
                        </Button>
                      ) : (
                        <div className={style.logindiv} onClick={goToProfile}>
                          <div>
                            <Image
                              className={style.profileLogo}
                              src={profileLogo}
                              alt="profile Logo"
                            />
                          </div>
                          <div className={style.logintext}>
                            Hey,{" "}
                            {loadedUserName != ""
                              ? `${loadedUserName}`
                              : "User"}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </header>
              <div className={style.travelTextTop}>Travel for people is</div>
              <div className={style.travelTextBottom}>Passion</div>

              {/* This is the login popup/dialog */}
              <Popup
                open={isOpen}
                style={{ zIndex: 100000 }}
                overlayStyle={{ background: "transparent" }}
                contentStyle={{
                  width: "65%",
                  height: "590px",
                  backgroundColor: "white",
                }}
                onClose={closePopup}
                modal
                closeOnDocumentClick
                lockScroll // Disable scrolling when popup is open
              >
                <div>
                  <Signin closePopup={closePopup} {...props} />
                </div>
              </Popup>

              {/* This is the profile modal/dialog */}
              <Modal show={showModal} onHide={() => setShowModal(false)}>
                <Modal.Header /*closeButton*/ className={style.modalheader}>
                  {/* <Modal.Title >Login Modal</Modal.Title> */}
                  <div className={style.modalheaderimagediv}>
                    <Image
                      src={qugoLogo1}
                      className={style.modalheaderlogo}
                      alt="Unable to load Qugo logo"
                    />
                  </div>
                  <div>Offers</div>
                  <div className={style.modaltitle}>Hey, User</div>
                </Modal.Header>
                <Modal.Body
                  className="rounded"
                  style={{ backgroundColor: "#155EEF", padding: "40px" }}
                >
                  <div
                    style={{
                      backgroundColor: "white",
                      borderRadius: "10px",
                      padding: "20px",
                    }}
                  >
                    <Tab.Container defaultActiveKey="profile">
                      <Nav variant="tabs" fill>
                        <Nav.Item>
                          <Nav.Link
                            eventKey="profile"
                            className={style.customnavlink}
                          >
                            Profile Details
                          </Nav.Link>
                        </Nav.Item>
                        <Nav.Item>
                          <Nav.Link
                            eventKey="company"
                            className={style.customnavlink}
                          >
                            Company Details
                          </Nav.Link>
                        </Nav.Item>
                      </Nav>
                      <Tab.Content>
                        <Tab.Pane eventKey="profile">
                          {/* Profile Details Elements */}
                          <div className="text-center mt-4">
                            <div
                              style={{
                                width: "120px",
                                height: "120px",
                                borderRadius: "50%",
                                background: "lightblue",
                                margin: "auto",
                              }}
                            ></div>
                          </div>

                          <div className="mb-3">
                            <label htmlFor="firstName" className="form-label">
                              First Name:
                            </label>
                            <input
                              type="text"
                              className="form-control"
                              id="firstName"
                            />
                          </div>
                          <div className="mb-3">
                            <label htmlFor="lastName" className="form-label">
                              Last Name:
                            </label>
                            <input
                              type="text"
                              className="form-control"
                              id="lastName"
                            />
                          </div>
                          <div className="mb-3">
                            <label
                              htmlFor="mobileNumber"
                              className="form-label"
                            >
                              Mobile Number:
                            </label>
                            <input
                              type="tel"
                              className="form-control"
                              id="mobileNumber"
                            />
                          </div>
                          <div className="mb-3">
                            <label htmlFor="email" className="form-label">
                              Email Address:
                            </label>
                            <input
                              type="email"
                              className="form-control"
                              id="email"
                            />
                          </div>

                          <div className="text-center mt-4">
                            <button
                              className="btn btn-primary btn-rounded"
                              style={{
                                borderRadius: "50px",
                                backgroundColor: "#155EEF",
                                border: "none",
                                paddingLeft: "24px",
                                paddingRight: "24px",
                              }}
                              onClick={() => setShowModal(false)}
                            >
                              Save
                            </button>
                          </div>
                        </Tab.Pane>
                        <Tab.Pane eventKey="company">
                          {/* Company Details Elements */}
                          <Form>
                            <Form.Group controlId="companyName">
                              <Form.Label>Company Name</Form.Label>
                              <Form.Control type="text" />
                            </Form.Group>
                            <Form.Group controlId="companyAddress">
                              <Form.Label>Company Address</Form.Label>
                              <Form.Control type="text" />
                            </Form.Group>
                            {/* Add more company details elements */}
                          </Form>
                        </Tab.Pane>
                      </Tab.Content>
                    </Tab.Container>

                    {/* ... modal content ... */}
                  </div>
                </Modal.Body>
              </Modal>
            </div>
          </div>
          <div className={`${style.container} ${style.search}`}>
            <div id="hotelSearch" className="hotelSearch">
              <div className={`container ${style.searchButtons}`}>
                <button
                  className={`${style.searchButton} ${style.searchHotelButton}`}
                >
                  Hotels
                </button>
              </div>
              <div className="container">
                <div className="row">
                  <div className="col-lg-12  align-items-stretch">
                    <div className={style.searchHotels}>
                      <div className="container">
                        <div className={`row ${style.tableRow}`}>
                          <div
                            className={`col-xl-3  align-items-stretch ${style.citySearch}`}
                          >
                            <div className="icon-box mt-4 mt-xl-0">
                              <i className="bx bx-cube-alt"></i>
                              <p className={style.searchHeadingFont}>
                                City/Location
                              </p>
                              <input
                                type="text"
                                className="form-control"
                                id="destination"
                                style={{
                                  background: "transparent",
                                  color: "black",
                                  border: "1px solid grey",
                                  fontWeight: "bold",
                                }}
                                autoComplete="off"
                                placeholder="Search City or Hotel Name"
                                value={destination}
                                onChange={handleDestinationChange}
                              />
                              {matchingDestinations.length > 0 && (
                                <ul
                                  ref={dropdownRef}
                                  style={{
                                    listStyleType: "none",
                                    position: "absolute",
                                    top: "80%",
                                    // left: 0%,
                                    background: "#fff",
                                    zIndex: 1,
                                    border: "1px solid #ccc",
                                    padding: "0.5rem",
                                    borderRadius: "4px",
                                    boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
                                    // cursor: 'pointer'
                                  }}
                                  className={`${style.scrollableDropdown}`}
                                >
                                  {matchingDestinations.map(
                                    (destination, index) =>
                                      destination.type === 1 ? (
                                        <li
                                          key={destination.id}
                                          onClick={() =>
                                            handleSelectDestination(destination)
                                          }
                                          style={{
                                            padding: "0.25rem",
                                            cursor: "pointer",
                                            ":hover": {
                                              background: "#ff0000",
                                            },
                                            color: "#000000",
                                            background:
                                              index === selectedItemIndex
                                                ? "lightgray"
                                                : "transparent", // Blue background for the selected item
                                          }}
                                        >
                                          {destination.title},{" "}
                                          {destination.countryname}
                                        </li>
                                      ) : destination.type === 2 ? (
                                        <li
                                          key={destination.id}
                                          onClick={() =>
                                            handleSelectDestination(destination)
                                          }
                                          style={{
                                            padding: "0.25rem",
                                            cursor: "pointer",
                                            ":hover": {
                                              background: "#ff0000",
                                            },
                                            color: "#000000",
                                            background:
                                              index === selectedItemIndex
                                                ? "lightgray"
                                                : "transparent", // Blue background for the selected item
                                          }}
                                        >
                                          {destination.title},{" "}
                                          {destination.cityname},{" "}
                                          {destination.countryname}
                                        </li>
                                      ) : null
                                  )}
                                </ul>
                              )}
                            </div>
                          </div>
                          <div
                            className={`col-xl-4 align-items-stretch ${style.citySearch}`}
                          >
                            <div className="row">
                              <div className="col-xl-6  align-items-stretch">
                                <div className="icon-box mt-2 mt-xl-0">
                                  <i className="bx bx-cube-alt"></i>
                                  <p className={style.searchHeadingFont}>
                                    CHECK-IN
                                  </p>
                                  <DatePicker
                                    selected={convertToDateObject(checkinDate)}
                                    dateFormat="dd-MM-yyyy"
                                    onChange={handleCheckinChange}
                                    minDate={new Date()}
                                    showPopperArrow={false}
                                    customInput={
                                      <div
                                        className={style["date-picker-wrapper"]}
                                      >
                                        <input
                                          value={checkinDate}
                                          readOnly
                                          onChange={(e) => e.preventDefault()}
                                          type="text"
                                          className={`form-control`}
                                          id="checkinTime"
                                          style={{
                                            background: "transparent",
                                            color: "black",
                                            border: "none",
                                            borderBottom: "0.11px solid white",
                                            borderRadius: "0px",
                                            paddingLeft: "0px",
                                            fontWeight: "bold",
                                            cursor: "pointer",
                                            width: "100%",
                                          }}
                                        />
                                        <FontAwesomeIcon
                                          icon={faCalendarAlt}
                                          className={style["calendar-icon"]}
                                          onClick={() =>
                                            checkinTimeRef.current?.click()
                                          } // Open the date picker when the icon is clicked
                                        />
                                      </div>
                                    }
                                  />
                                  <p className={style.searchDay}>
                                    {getDayOfWeek(checkinDate)}
                                  </p>
                                </div>
                              </div>
                              <div className="col-xl-6  align-items-stretch">
                                <div className="icon-box mt-2 mt-xl-0">
                                  <i className="bx bx-cube-alt"></i>
                                  <p className={style.searchHeadingFont}>
                                    CHECK-OUT
                                  </p>
                                  <DatePicker
                                    selected={convertToDateObject(checkoutDate)}
                                    dateFormat="dd-MM-yyyy"
                                    onChange={handleCheckoutChange}
                                    minDate={
                                      convertToDateObject(checkinDate)?.setDate(
                                        convertToDateObject(
                                          checkinDate
                                        )?.getDate() + 1
                                      ) || new Date()
                                    }
                                    maxDate={convertToDateObject(
                                      checkinDate
                                    )?.setDate(
                                      convertToDateObject(
                                        checkinDate
                                      )?.getDate() + 30
                                    )}
                                    showPopperArrow={false}
                                    customInput={
                                      <div
                                        className={style["date-picker-wrapper"]}
                                      >
                                        <input
                                          value={checkoutDate}
                                          onChange={(e) => e.preventDefault()}
                                          type="text"
                                          readOnly
                                          className={`form-control`}
                                          id="checkoutTime"
                                          style={{
                                            background: "transparent",
                                            color: "black",
                                            border: "none",
                                            borderBottom: "0.11px solid white",
                                            borderRadius: "0px",
                                            paddingLeft: "0px",
                                            fontWeight: "bold",
                                            cursor: "pointer",
                                            width: "100%",
                                          }}
                                        />
                                        <FontAwesomeIcon
                                          icon={faCalendarAlt}
                                          className={style["calendar-icon"]}
                                          onClick={() =>
                                            checkoutTimeRef.current?.click()
                                          } // Open the date picker when the icon is clicked
                                        />
                                      </div>
                                    }
                                  />
                                  <p className={style.searchDay}>
                                    {getDayOfWeek(checkoutDate)}
                                  </p>
                                </div>
                              </div>
                            </div>
                          </div>
                          <div className={`col-xl-3  align-items-stretch`}>
                            <div className="icon-box mt-4 mt-xl-0">
                              <i className="bx bx-cube-alt"></i>
                              <p className={style.searchHeadingFont}>
                                ROOMS & GUESTS
                              </p>
                              {/* <RoomGuestDropdown/> */}
                              <div className={`col-xl-3  align-items-stretch`}>
                                <div className="icon-box mt-4 mt-xl-0">
                                  <i className="bx bx-cube-alt"></i>
                                  <Dropdown>
                                    <Dropdown.Toggle
                                      variant="secondary"
                                      id="dropdown-basic"
                                      className={style.dropdown}
                                    >
                                      {rooms} {roomText}, {adults} {adultsText},{" "}
                                      {children} {childrenText}
                                    </Dropdown.Toggle>

                                    <Dropdown.Menu>
                                      <div className={style.dropdownRooms}>
                                        <div className="dropdown-item">
                                          <label htmlFor="rooms">Rooms</label>
                                          <select
                                            className="form-control"
                                            id="rooms"
                                            value={rooms}
                                            onChange={handleRoomChange}
                                            min="1"
                                          >
                                            <option value="1">1</option>
                                            <option value="2">2</option>
                                            <option value="3">3</option>
                                            <option value="4">4</option>
                                            <option value="5">5</option>
                                            <option value="6">6</option>
                                          </select>
                                        </div>
                                      </div>

                                      {roomCount.map((room, index) => (
                                        <div
                                          className={style.dropdownRoomDetails}
                                          key={index}
                                        >
                                          <div className="dropdown-item">
                                            <label htmlFor="adults">
                                              Adults
                                            </label>
                                            <select
                                              className="form-control"
                                              id="adults"
                                              value={room.adults}
                                              min="1"
                                              onChange={(e) =>
                                                handleAdultChange(e, index)
                                              }
                                            >
                                              {Array.from(
                                                {
                                                  length:
                                                    room.children <= 2
                                                      ? 8
                                                      : 10 - room.children <
                                                        room.adults
                                                      ? room.adults
                                                      : 10 - room.children,
                                                },
                                                (_, i) => i + 1
                                              ).map((option) => (
                                                <option
                                                  key={option}
                                                  value={option}
                                                >
                                                  {option}
                                                </option>
                                              ))}
                                            </select>
                                          </div>
                                          <div className="dropdown-item">
                                            <label htmlFor="children">
                                              Children
                                            </label>
                                            <select
                                              className="form-control"
                                              id="children"
                                              value={room.children}
                                              onChange={(e) =>
                                                handleChildChange(e, index)
                                              }
                                            >
                                              <option value="0">None</option>
                                              {Array.from(
                                                {
                                                  length:
                                                    room.adults < 7
                                                      ? 4
                                                      : 10 - room.adults <
                                                        room.children
                                                      ? room.adults
                                                      : 10 - room.adults,
                                                },
                                                (_, i) => i + 1
                                              ).map((option) => (
                                                <option
                                                  key={option}
                                                  value={option}
                                                >
                                                  {option}
                                                </option>
                                              ))}
                                            </select>
                                          </div>
                                          {room.children > 0 && (
                                            <div className="dropdown-item">
                                              <label>Age of Children</label>
                                              {room.childAge.map(
                                                (child, childIndex) => (
                                                  <select
                                                    key={childIndex}
                                                    className="form-control"
                                                    value={child}
                                                    style={{
                                                      marginBottom: "4px",
                                                    }}
                                                    onChange={(e) =>
                                                      handleAgeChange(
                                                        e,
                                                        index,
                                                        childIndex
                                                      )
                                                    }
                                                  >
                                                    {Array.from(
                                                      { length: 12 },
                                                      (_, i) => i + 1
                                                    ).map((option) => (
                                                      <option
                                                        key={option}
                                                        value={option}
                                                      >
                                                        {option}
                                                      </option>
                                                    ))}
                                                  </select>
                                                )
                                              )}
                                            </div>
                                          )}
                                        </div>
                                      ))}
                                    </Dropdown.Menu>
                                  </Dropdown>
                                </div>
                              </div>
                            </div>
                          </div>
                          <div
                            className={`col-xl-2  align-items-stretch ${style.citySearch}`}
                          >
                            <div
                              className={`icon-box mt-4 mt-xl-0 ${
                                style.searchIconContainer
                              } ${loading || divDisabled ? "disabled" : ""}`}
                              onClick={loading || divDisabled ? null : search}
                            >
                              <FontAwesomeIcon
                                className={style.hotelSearchIcon}
                                icon={faSearch}
                                // spin={loading}
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
