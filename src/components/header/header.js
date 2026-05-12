import Head from "next/head";
import "bootstrap/dist/css/bootstrap.css";
import style from "./styles.module.css";
import { useState, useEffect, useRef } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import Dropdown from "react-bootstrap/Dropdown";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import axios, { getTabSpecificData, setTabSpecificData } from "@/utils/axios/axios";
import config from "@/config";
import { faCalendarAlt, faTimes } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useRouter } from "next/router";
import useLocalStorage from "@/hooks/useLocalStorage";
import HeaderCommon from "../HeaderCommon/HeaderCommon";
import B2CHeader from "@/components/flights/B2cHeader/Header";
import MobileBannerTabs from "../bannerTabs/MobileBannerTabs";
import { logEvent } from "firebase/analytics";
import { analytics } from "../../../utils/firebase";
import { useUserType } from "@/hooks/useUserType";
import Header1 from "@/components/corporate/auth/Header";
import TravelerSelectDropdown from "@/components/corporate/travelerSelectDropdown/TravelerSelectDropdown";
import showToast from "@/utils/toast";

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

export default function Header(props) {
  const corporateUser = useUserType();

  const [selectedTravelers, setSelectedTravelers] = useState([]);

  const {
    mDestination,
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
  const [roomCount, setRoomCount] = useState([
    { adults: 2, children: 0, childAge: [] },
  ]);
  const [childCountDropdown, setChildCountDropdown] = useState("None");
  const [getCityId, setCityId] = useState("");
  const [destination, setDestination] = useState("");
  const [routeLoading, setRouteLoading] = useState(false);

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
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);


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

  const handleTravelerChange = (newTravelers) => {
    setSelectedTravelers(newTravelers);
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
      showToast("info","Check-in date cannot be greater than checkout date");
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
    let searchdata = JSON.parse(getTabSpecificData("searchData"));
    const searchRequest = JSON.parse(getTabSpecificData("searchRequest"));
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
    if (searchRequest.corporateEmployees) {
      setSelectedTravelers(searchRequest.corporateEmployees);
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
      showToast("info","Please select and search city or hotel.");
      if (buttonDisabled) {
        return; // Return early if button is disabled
      }
      setButtonDisabled(true);
      setTimeout(() => {
        setButtonDisabled(false);
      }, 6000); // Adjust the delay as needed
      return;
    }

    if (corporateUser) {
      const totalAdults = adults;
      if (selectedTravelers.length === 0) {
        showToast("info", "Please select travelers for your booking.");
        return;
      }
      if (selectedTravelers.length < totalAdults) {
        showToast(
          "info",
          "The number of selected travelers cannot be less than the number of adults."
        );
        return;
      }

      if (selectedTravelers.length > totalAdults) {
        showToast(
          "info",
          "The number of selected travelers cannot exceed the number of adults."
        );
        return;
      }

      if (totalAdults > 9 || selectedTravelers.length > 9) {
        showToast(
          "info",
          "The total number of adults and selected travelers cannot exceed 9."
        );
        return;
      }
    }

    if (new Date(checkinDate) > new Date(checkoutDate)) {
      showToast("info","Check-in date cannot be greater than checkout date");
      return;
    }
    if (
      new Date(checkinDate) < formatDateToDDMMYYYY(new Date()) ||
      new Date(checkoutDate) < formatDateToDDMMYYYY(new Date())
    ) {
      showToast("info","Check-In and Checkout Dates must be greater than current Date");
      return;
    }

    const noOfNights = calculateNoOfNights(checkinDate, checkoutDate);
    const formattedCheckinDate = convertToFormattedDate(checkinDate);
    const formattedCheckoutDate = convertToFormattedDate(checkoutDate);
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
    try {
      setLoading(true);
      setHotelsLoading(true);
      searchRoomCall(true);

      logEvent(analytics, "hotellist_search", {
        city_name: destination,
        city: getCityId,
      });
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
      if (corporateUser) {
        request.corporateEmployees = selectedTravelers;
      }
      const qTraceId = response?.qTraceId;
      if (qTraceId) {
        setTabSpecificData("searchRequest", JSON.stringify(request));
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
          hotelLocation || mDestination,
          noOfNights
        );
      } else {
        updateSearchData();
        const request = req;
        if (corporateUser) {
          request.corporateEmployees = selectedTravelers;
        }
        setTabSpecificData("searchRequest", JSON.stringify(request));
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
          hotelLocation || mDestination,
          noOfNights
        );
      }
    } catch (error) {
      const errorMessage =
        error?.response?.data?.error?.errormessage ||
        "Unable to fetch hotels, please try after some time";
      showToast("info",errorMessage);
      const request = req;
      if (corporateUser) {
        request.corporateEmployees = selectedTravelers;
      }
      setTabSpecificData("searchRequest", JSON.stringify(request));
      updateSearchData();
      // Clear selected rooms after successful search
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
        hotelLocation || mDestination,
        noOfNights
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
const justSelectedRef = useRef(false);
  const handleSelectDestination = (selectedDestination) => {
    justSelectedRef.current = true;
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
    setIsDropdownOpen(false);
  };

  const handleDestinationChange = (event) => {
    const value = event.target.value;
    setDestination(value);
    setCityId("");

    logEvent(analytics, "hotellist_city_search", {
      city: value,
      city_name: getCityId,
      destination: destination,
    });
  };

  useEffect(() => {
    setMatchingDestinations([]);

    // Use a timer to delay the API request by 1000 milliseconds (1 second)
    const timer = setTimeout(() => {

         if (justSelectedRef.current) {
      justSelectedRef.current = false; // reset
      return;
    }
      if (destination.length === 0) {
        // If the value is empty, set the status to "empty"
        setCityId("");
      } else if (destination.length >= 3) {
        axios
          .get(
            `${config.GET_SEARCH_DESTINATION_NAME}?name=${destination.trim()}`
          )
          .then((response) => {
            const data = response.data;
            setMatchingDestinations(data.data);
            setSelectedItemIndex(-1);
            setIsDropdownOpen(true);
          })
          .catch((error) => {
            console.error("Error fetching matching destinations:", error);
          });
      }  else {
      setIsDropdownOpen(false); // hide dropdown if less than 3 characters
    }
    }, 1000); // Delay of 1000 milliseconds (1 second)

    // Clear the timer when the effect re-runs, effectively resetting the delay
    return () => clearTimeout(timer);
  }, [destination]);

    useEffect(() => {
  setIsDropdownOpen(false);
}, []);

  const handleClearInput = () => {
    setDestination(""); // Clear the input field
  };

  const [activeLink, setActiveLink] = useState("hotels");

  return (
    <>
      <Head>
        <title>QuGo | Hotel Result</title>
      </Head>
      <div id={style.banner} className={style.topbanner}>
        <div className={style.headerCommonbg}></div>
        {/* HEADER FOR B2C */}
        {!corporateUser ? (
          <div className={style.headerCommons}>
            {/* <HeaderCommon /> */}
            <B2CHeader/>
          </div>
        ) : (
          <div
            style={{ backgroundColor: "#ffffff", height: "12vh" }}
            className={style.headerCommons}
          >
            <Header1 />
          </div>
        )}
        <div className={`container ${style.customContainer}`}>
          <MobileBannerTabs isRedirect={true} />
          <div className={style.navFlexContainer}>
            <div className={style.destinationContainer}>
              <div className={`form-group ${style.customformInput}`}>
                <label
                  htmlFor="checkinTime"
                  style={{ fontFamily: "Roboto", color: "#ffffff" }}
                >
                  City/Location
                </label>
                <div
                  style={{
                    position: "relative",
                    display: "inline-block",
                    width: "95%",
                  }}
                >
                  <input
                    type="text"
                    className={`form-control custom-placeholder ${style.inputDestination}`}
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
                    onFocus={() => setIsDropdownOpen(true)}
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
                        color: "#fff",
                        fontSize: "23px",
                      }}
                    >
                      <FontAwesomeIcon icon={faTimes} />
                    </span>
                  )}
                </div>

                { isDropdownOpen && matchingDestinations.length > 0 && (
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
                      cursor: "pointer",
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
            <div className={style.datesFlexdisplay}>
              <div className={style.checkindateContainer}>
                <div className={`form-group ${style.customformInputdates1}`}>
                  <label
                    htmlFor="checkinTime"
                    style={{ fontFamily: "Roboto", color: "#ffffff" }}
                  >
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
                            style={{ left: "93%" }}
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
              <div className={style.checkindateContainer}>
                <div className={`form-group ${style.customformInputdates2}`}>
                  <label
                    htmlFor="checkoutTime"
                    style={{ fontFamily: "Roboto", color: "#ffffff" }}
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
                            style={{ left: "93%" }}
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
            </div>
            <div className={style.guestnumContainer}>
              <div className={`form-group ${style.customformInput}`}>
                <label
                  htmlFor="guestNumber"
                  style={{ fontFamily: "Roboto", color: "#ffffff" }}
                >
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
                        // borderBottom: "0.1px solid white",
                        borderRadius: "0px",
                      }}
                    >
                      {rooms} {roomText}, {adults} {adultsText}
                      {!corporateUser && `, ${children} ${childrenText}`}
                    </Dropdown.Toggle>

                    <Dropdown.Menu style={{ width: "auto" }}>
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
                        <div className={style.dropdownRoomDetails} key={index}>
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
                          {!corporateUser && (
                            <div className="dropdown-item">
                              <label htmlFor="children">Children</label>
                              <select
                                className="form-control"
                                id="children"
                                value={room.children}
                                onChange={(e) => handleChildChange(e, index)}
                                style={{ padding: "10%" }}
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
                          )}
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
            <div className={style.mobileSearchButton}>
              <button
                type="button"
                className={`btn btn-primary ${style.searchButton}`}
                onClick={searchHotel}
                disabled={buttonDisabled || loading}
              >
                Search
              </button>
            </div>
            <div className={style.deskSearchButton}>
              <div
                className={`form-group ${style.customSearchButtonContainer}`}
              >
                <button
                  type="button"
                  className={`btn btn-primary ${style.searchButton}`}
                  onClick={searchHotel}
                  //  disabled={buttonDisabled}
                  disabled={buttonDisabled || loading}
                >
                  Search
                </button>
              </div>
            </div>
          </div>

          {corporateUser && (
            <div className={style.selectors} style={{ marginTop: "10px" }}>
              <TravelerSelectDropdown
                corporateUser={corporateUser}
                adultsCount={adults}
                onTravelerChange={handleTravelerChange}
                initialSelectedTravelers={selectedTravelers}
              />
            </div>
          )}
        </div>
      </div>
    </>
  );
}
