import Head from "next/head";
import Image from "next/image";
import qugologo from "../../images/qugoLogo.png";
import "bootstrap/dist/css/bootstrap.css";
import style from "./styles.module.css";
import { useState, useEffect, useRef } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { Navbar, Nav, Container } from "react-bootstrap";
import Dropdown from "react-bootstrap/Dropdown";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import axios, { getTabSpecificData, setTabSpecificData } from "@/utils/axios/axios";
import config from "@/config";
import { getHotelSearchData } from "../../../utils/homepageAPI";
import { faCalendarAlt, faTimes } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import profileLogo from "../../images/profileLogo.png";
import { useRouter } from "next/router";
import useLocalStorage from "@/hooks/useLocalStorage";

const formatDateToDDMMYYYY = (date) => {
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0"); // Months are zero-based
  const year = date.getFullYear();

  return `${day}-${month}-${year}`;
};

const convertToDateObject = (ddMMyyyy) => {
  const parts = ddMMyyyy?.split("-");
  const day = parseInt(parts?.[0], 10);
  const month = parseInt(parts?.[1], 10) - 1; // Months are zero-based in Date object
  const year = parseInt(parts?.[2], 10);

  return new Date(year, month, day);
};

const addOneDayToDate = (dateString) => {
  const [day, month, year] = dateString.split("-");
  const dateObject = new Date(`${year}-${month}-${day}`);
  dateObject.setDate(dateObject.getDate() + 1);
  const updatedDay = dateObject.getDate().toString().padStart(2, "0");
  const updatedMonth = (dateObject.getMonth() + 1).toString().padStart(2, "0");
  const updatedYear = dateObject.getFullYear();
  const updatedDateString = `${updatedDay}-${updatedMonth}-${updatedYear}`;
  return updatedDateString;
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

export default function HeaderNew(props) {
  const [getAccessToken, setAccessToken] = useLocalStorage("accessToken");

  const {
    mDestination,
    cityId,
    countryCode,
    hotelCode,
    clearSelectedRooms,
    setHotelsLoading,
    clearAllFilters,
    searchRoomCall,
  } = props;

  const [checkinDate, setCheckinDate] = useState();
  const [checkoutDate, setCheckoutDate] = useState();
  const [searchDatas, setSearchData] = useState();

  const [rooms, setRooms] = useState(1);
  const [adults, setAdults] = useState(2);
  const [children, setChildren] = useState(0);
  const [roomText, setRoomText] = useState("Room");
  const [adultsText, setAdultsText] = useState("Adult");
  const [childrenText, setChildrenText] = useState("Child");
  const [age, setAge] = useState([]);
  const [roomCount, setRoomCount] = useState([
    { adults: 2, children: 0, childAge: [] },
  ]);
  const [childCountDropdown, setChildCountDropdown] = useState("None");
  const [getCityId, setCityId] = useState("");
  const [destination, setDestination] = useState("");
  const [getDestinationObj, setDestinationObj] = useState("");
  const [matchingDestinations, setMatchingDestinations] = useState([]);
  const [getCountryCode, setCountryCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [hotelLocation, setHotelLocation] = useState("");
  const [getHotelCode, setHotelCode] = useState("");
  const [getuserip, setuserip] = useLocalStorage("userip");
  const [buttonDisabled, setButtonDisabled] = useState(false);
  const [getUserDetails, setUserDetails] = useLocalStorage("userDetails");
  const [loadedUserName, setLoadedUserName] = useState("User");

  const router = useRouter();

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
    const date = formatDateToDDMMYYYY(new Date(selectedDate));
    // Make sure checkout date is not before checkin date
    if (date <= new Date(checkinDate)) {
      // Convert checkinDate back to Date object
      const checkinDateObj = new Date(checkinDate);
      // Add one day to checkinDate
      checkinDateObj.setDate(checkinDateObj.getDate() + 1);
      // Format the new checkout date back to "dd-MM-yyyy" format
      const newCheckoutDate = formatDateToDDMMYYYY(checkinDateObj);
      setCheckoutDate(newCheckoutDate);
      toast("Check-in date cannot be greater than checkout date");
    } else {
      setCheckoutDate(date);
    }
  };

  function updateSearchData() {
    let updatedData = searchDatas;
    updatedData.roomCountString = JSON.stringify(roomCount);
    setSearchData(updatedData);
    setTabSpecificData("searchData", JSON.stringify(updatedData));
  }

  useEffect(() => {
    const accessToken = getTabSpecificData("accessToken");
    if (!accessToken) {
      router.replace("/");
    }
    let searchdata = JSON.parse(getTabSpecificData("searchData"));
    setSearchData(searchdata);
    setCheckinDate(searchdata.checkInDate);
    setCheckoutDate(searchdata.checkoutDate);
    setDestination(searchdata.destination);
    setCityId(searchdata.getCityId);
    setCountryCode(searchdata.getCountryCode);
    setHotelCode(searchdata.getHotelCode);
    if (searchdata.roomCountString) {
      const dataArray = JSON.parse(searchdata.roomCountString);
      if (dataArray) {
        let totalAdults = 0;
        let totalChildren = 0;
        dataArray.forEach((room) => {
          totalAdults += room.adults;
          totalChildren += room.children;
        });
        setRooms(dataArray.length);
        setAdults(totalAdults);
        setChildren(totalChildren);
        setRoomCount(dataArray);
      }
    }
  }, []);

  useEffect(() => {
    const storedUserName = getTabSpecificData("userDetails");

    if (storedUserName) {
      setLoadedUserName(storedUserName);
    }
  }, []);

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

    if (childCountDropdown === "None") {
      const updatedRoomCountWithNoChildren = updatedRoomCount.map((room) => ({
        ...room,
        children: 0,
        childAge: [],
      }));
      setChildren(0);
      updatedRoomCount = updatedRoomCountWithNoChildren;
    }

    let totalAdults = updatedRoomCount.reduce(
      (total, room) => total + room.adults,
      0
    );

    setAdults(totalAdults);
    if (totalAdults > 1) {
      setAdultsText("Adults");
    } else {
      setAdultsText("Adult");
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

  const searchHotel = async () => {
    if (!getCityId) {
      toast("Please select and search city or hotel.");
      if (buttonDisabled) {
        return; // Return early if button is disabled
      }
      setButtonDisabled(true);
      setTimeout(() => {
        setButtonDisabled(false);
      }, 6000);
      return;
    }

    if (new Date(checkinDate) > new Date(checkoutDate)) {
      toast("Check-in date cannot be greater than checkout date");
      return;
    }
    if (
      new Date(checkinDate) < formatDateToDDMMYYYY(new Date()) ||
      new Date(checkoutDate) < formatDateToDDMMYYYY(new Date())
    ) {
      toast("Check-In and Checkout Dates must be greater than current Date");
      return;
    }

    try {
      setLoading(true);
      setHotelsLoading(true);
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
      const qTraceId = response?.qTraceId;
      if (qTraceId) {
        updateSearchData();
        // Clear selected rooms after successful search
        clearSelectedRooms();

        clearAllFilters();
        props.updateHotelList(
          response,
          checkinDate,
          checkoutDate,
          destination,
          getCityId,
          getCountryCode,
          JSON.stringify(roomCount),
          rooms,
          adults,
          children,
          hotelLocation || mDestination
        );
      } else {
        updateSearchData();
        clearSelectedRooms();

        clearAllFilters();
        props.updateHotelList(
          response,
          checkinDate,
          checkoutDate,
          destination,
          getCityId,
          getCountryCode,
          JSON.stringify(roomCount),
          rooms,
          adults,
          children,
          hotelLocation || mDestination
        );
      }
    } catch (error) {
      const errorMessage =
        error?.response?.data?.error?.errormessage ||
        "Unable to fetch hotels, please try after some time";
      toast(errorMessage);
      updateSearchData();
      clearSelectedRooms();

      clearAllFilters();

      const response = {
        hotelResults: [],
      };
      props.updateHotelList(
        response,
        checkinDate,
        checkoutDate,
        destination,
        getCityId,
        getCountryCode,
        JSON.stringify(roomCount),
        rooms,
        adults,
        children,
        hotelLocation || mDestination
      );
    } finally {
      setLoading(false);
      setHotelsLoading(false);
      searchRoomCall(false);
    }
  };

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

  const handleSelectDestination = (selectedDestination) => {
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

  const handleDestinationChange = (event) => {
    const value = event.target.value;
    setDestination(value);
    setCityId("");
  };

  useEffect(() => {
    setMatchingDestinations([]);
    if (destination) {
      if (destination.length === 0) {
        // If the value is empty, set the status to "empty"
        setCityId(""); // Clear the matching destinations dropdown
      } else if (destination.length >= 3) {
        axios
          .get(
            `${config.GET_SEARCH_DESTINATION_NAME}?name=${destination.trim()}`
          )
          .then((response) => {
            const data = response.data;
            setMatchingDestinations(data.data);
          })
          .catch((error) => {
            console.error("Error fetching matching destinations:", error);
          });
      }
    }
  }, [destination]);

  const goToProfile = () => {
    router.push("/profile");
  };

  const goToHome = () => {
    router.push("/");
  };

  const handleClearInput = () => {
    setDestination(""); // Clear the input field
  };

  return (
    <>
      <Head>
        <title>qugo | Hotel Result</title>
      </Head>
      <div id={style.banner} className={style.topbanner}>
        <header
          className="text-white pt-3"
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
                  onClick={goToHome}
                />
              </div>
              <div className="col-md-10 col-sm-6"></div>
              <div className="col-md-1 d-flex align-items-center justify-content-center">
                <div className={style.logindiv} onClick={goToProfile}>
                  <div>
                    <Image
                      className={style.profileLogo}
                      src={profileLogo}
                      alt="profile Logo"
                    />
                  </div>
                  <div className={style.logintext}>
                    Hey, {loadedUserName != "" ? loadedUserName : "User"}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </header>
        <header
          className="text-white py-3"
          style={{
            backgroundColor: "rgba(0, 42, 48, 0.80)",
            maxHeight: "100px",
          }}
        >
          <div className="container">
            <div className="row align-items-start align-items-end">
              <div className="col-md-1"></div>
              <div className="col-md-10">
                <div className="form-group"></div>
                <Navbar
                  style={{
                    // backgroundColor: "rgba(0, 42, 48, 0.80)",
                    borderBottom: "0.1px solid white",
                    maxHeight: "300px",
                  }}
                  variant="dark"
                  expand="md"
                >
                  <Container fluid className={style.navbarContainer}>
                    <Navbar.Toggle aria-controls="navbar-collapse" />
                    <Navbar.Collapse id="navbar-collapse">
                      <Nav className=" mr-auto">
                        <Nav.Link
                          className={`${style["navbar-link"]} ${style.HotelButton}`}
                          href="#"
                          style={{ fontFamily: "Roboto" }}
                        >
                          Hotels
                        </Nav.Link>
                      </Nav>
                    </Navbar.Collapse>
                  </Container>
                </Navbar>
              </div>
            </div>
            {/* <hr style={{ borderTop: '1px solid white' }} /> */}
          </div>
          <style jsx>{`
            @media (max-width: 768px) {
              .navbar-collapse.collapse {
                background-color: black;
                transform: translateX(0);
              }
            }
          `}</style>
        </header>
        <header
          className="text-white py-3"
          style={{
            backgroundColor: "rgba(0, 42, 48, 0.80)",
            maxHeight: "100px",
          }}
        >
          {/* <header className={style.headerBackground}> */}

          <div className="container">
            <div className="row align-items-start">
              <div className="col-md-1"></div>
              <div className="col-md-2">
                <div className="form-group">
                  <label htmlFor="checkinTime" style={{ fontFamily: "Roboto" }}>
                    City/Location
                  </label>
                  <div
                    style={{ position: "relative", display: "inline-block" }}
                  >
                    <input
                      type="text"
                      className="form-control custom-placeholder"
                      id="checkinTime"
                      autoComplete="off"
                      placeholder="Search City or Hotel Name"
                      value={destination}
                      onChange={handleDestinationChange}
                      style={{
                        background: "transparent",
                        color: "white",
                        border: "none",
                        borderBottom: "0.11px solid white",
                        borderRadius: "0px",
                        paddingLeft: "0px",
                      }}
                    />
                    {destination && (
                      <span
                        className="clear-icon"
                        onClick={handleClearInput}
                        style={{
                          position: "absolute",
                          right: "5px",
                          top: "20px",
                          transform: "translate(100%, -50%)",
                          cursor: "pointer",
                          color: "rgba(0, 0, 0, 0.6)",
                          fontSize: "23px",
                        }}
                      >
                        <FontAwesomeIcon icon={faTimes} />
                      </span>
                    )}
                  </div>

                  {matchingDestinations.length > 0 && (
                    <ul
                      ref={dropdownRef}
                      style={{
                        listStyleType: "none",
                        position: "relative",
                        top: "100%",
                        left: 0,
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
                      {matchingDestinations.map((destination) =>
                        destination.type === 1 ? (
                          <li
                            key={destination.id}
                            onClick={() => handleSelectDestination(destination)}
                            style={{
                              padding: "0.25rem",
                              cursor: "pointer",
                              color: "#000000",
                              ":hover": {
                                background: "#ff0000",
                              },
                            }}
                          >
                            {destination.title}, {destination.countryname}
                          </li>
                        ) : destination.type === 2 ? (
                          <li
                            key={destination.id}
                            onClick={() => handleSelectDestination(destination)}
                            style={{
                              padding: "0.25rem",
                              cursor: "pointer",
                              color: "#000000",
                              ":hover": {
                                background: "#ff0000",
                              },
                            }}
                          >
                            {destination.title}, {destination.cityname},{" "}
                            {destination.countryname}
                          </li>
                        ) : null
                      )}
                    </ul>
                  )}
                </div>
              </div>
              <div className="col-md-2 col-sm-6">
                <div className="form-group">
                  <label htmlFor="checkinTime" style={{ fontFamily: "Roboto" }}>
                    Check-in
                  </label>
                  {
                    <DatePicker
                      selected={
                        checkinDate &&
                        !isNaN(convertToDateObject(checkinDate)) &&
                        convertToDateObject(checkinDate)
                      }
                      dateFormat="dd-MM-yyyy"
                      onChange={handleCheckinChange}
                      minDate={new Date()}
                      showPopperArrow={false}
                      customInput={
                        <div className={style["date-picker-wrapper"]}>
                          <input
                            value={checkinDate}
                            onChange={(e) => e.preventDefault()}
                            type="text"
                            readOnly
                            className={`form-control`}
                            id="checkinTime"
                            style={{
                              background: "transparent",
                              color: "white",
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
                            onClick={() => checkinTimeRef.current?.click()} // Open the date picker when the icon is clicked
                          />
                        </div>
                      }
                    />
                  }
                  <style jsx>{`
                    /* Target the calendar icon */
                    // input[type="date"]::-webkit-calendar-picker-indicator {
                    //   filter: invert(1); /* Invert the color to white */
                    // }
                  `}</style>
                </div>
              </div>
              <div className="col-md-2 col-sm-6">
                <div className="form-group">
                  <label
                    htmlFor="checkoutTime"
                    style={{ fontFamily: "Roboto" }}
                  >
                    Check-out
                  </label>
                  {
                    <DatePicker
                      selected={
                        checkoutDate &&
                        !isNaN(convertToDateObject(checkoutDate)) &&
                        convertToDateObject(checkoutDate)
                      }
                      dateFormat="dd-MM-yyyy"
                      onChange={handleCheckoutChange}
                      minDate={
                        convertToDateObject(checkinDate)?.setDate(
                          convertToDateObject(checkinDate)?.getDate() + 1
                        ) || new Date()
                      }
                      maxDate={convertToDateObject(checkinDate)?.setDate(
                        convertToDateObject(checkinDate)?.getDate() + 30
                      )}
                      showPopperArrow={false}
                      customInput={
                        <div className={style["date-picker-wrapper"]}>
                          <input
                            value={checkoutDate}
                            onChange={(e) => e.preventDefault()}
                            type="text"
                            className={`form-control`}
                            id="checkoutTime"
                            style={{
                              background: "transparent",
                              color: "white",
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
                            onClick={() => checkoutTimeRef.current?.click()} // Open the date picker when the icon is clicked
                          />
                        </div>
                      }
                    />
                  }
                  <style jsx>{`
                    /* Target the calendar icon */
                    input[type="date"]::-webkit-calendar-picker-indicator {
                      filter: invert(1); /* Invert the color to white */
                    }
                  `}</style>
                </div>
              </div>
              <div className="col-md-2 col-sm-6">
                <div className="form-group">
                  <label htmlFor="guestNumber" style={{ fontFamily: "Roboto" }}>
                    Guests
                  </label>
                  <div
                    className={`col-xl-3  align-items-stretch`}
                    style={{
                      height: "100%",
                      marginBottom: "0px",
                      margin: "0px",
                      paddingLeft: "2px",
                    }}
                  >
                    <Dropdown>
                      <Dropdown.Toggle
                        variant="secondary"
                        id="dropdown-basic"
                        className={style.dropdown}
                        style={{
                          color: "white",
                          background: "transparent",
                          color: "white",
                          border: "none",
                          borderBottom: "0.1px solid white",
                          borderRadius: "0px",
                        }}
                      >
                        {/* {rooms} Rooms, {adults} Adults, {children} Children */}
                        {rooms} {roomText}, {adults} {adultsText}, {children}{" "}
                        {childrenText}
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
                              <label htmlFor="adults">Adults</label>
                              <select
                                className="form-control"
                                id="adults"
                                value={room.adults}
                                min="1"
                                onChange={(e) => handleAdultChange(e, index)}
                              >
                                {Array.from(
                                  {
                                    length:
                                      room.children <= 2
                                        ? 8
                                        : 10 - room.children < room.adults
                                        ? room.adults
                                        : 10 - room.children,
                                  },
                                  (_, i) => i + 1
                                ).map((option) => (
                                  <option key={option} value={option}>
                                    {option}
                                  </option>
                                ))}
                              </select>
                            </div>
                            <div className="dropdown-item">
                              <label htmlFor="children">Children</label>
                              <select
                                className="form-control"
                                id="children"
                                value={room.children}
                                onChange={(e) => handleChildChange(e, index)}
                              >
                                <option value="0">None</option>
                                {Array.from(
                                  {
                                    length:
                                      room.adults < 7
                                        ? 4
                                        : 10 - room.adults < room.children
                                        ? room.adults
                                        : 10 - room.adults,
                                  },
                                  (_, i) => i + 1
                                ).map((option) => (
                                  <option key={option} value={option}>
                                    {option}
                                  </option>
                                ))}
                              </select>
                            </div>
                            {room.children > 0 && (
                              <div className="dropdown-item">
                                <label>Age of Children</label>
                                {room.childAge.map((child, childIndex) => (
                                  <select
                                    key={childIndex}
                                    className="form-control"
                                    value={child}
                                    style={{
                                      marginBottom: "4px",
                                    }}
                                    onChange={(e) =>
                                      handleAgeChange(e, index, childIndex)
                                    }
                                  >
                                    {Array.from(
                                      { length: 12 },
                                      (_, i) => i + 1
                                    ).map((option) => (
                                      <option key={option} value={option}>
                                        {option}
                                      </option>
                                    ))}
                                  </select>
                                ))}
                              </div>
                            )}
                          </div>
                        ))}
                      </Dropdown.Menu>
                    </Dropdown>
                  </div>
                </div>
              </div>
              <div className="col-md-2 col-sm-6">
                <div className="form-group">
                  <label
                    htmlFor="cityDropdown"
                    className={style.searchAlignmentText}
                  >
                    AT
                  </label>
                  <button
                    type="button"
                    className={`btn btn-primary ${style.searchButton}`}
                    onClick={searchHotel}
                    disabled={buttonDisabled || loading}
                  >
                    Search
                  </button>
                </div>
              </div>
            </div>
          </div>
        </header>
      </div>
    </>
  );
}
