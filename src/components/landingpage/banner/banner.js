import { useEffect, useRef, useCallback } from "react";
import { useState } from "react";
import styles from "./styles.module.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBed, faCity, faTimes } from "@fortawesome/free-solid-svg-icons";
import axios, {
  getTabSpecificData,
  setTabSpecificData,
} from "@/utils/axios/axios";
import config from "@/config";
import AsyncSelect from "react-select/async";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { faCalendarAlt } from "@fortawesome/free-solid-svg-icons";
import Dropdown from "react-bootstrap/Dropdown";
import useLocalStorage from "@/hooks/useLocalStorage";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useRouter } from "next/router";
import { useLogin } from "@/store/context/LoginContext";
import MobileBannerTabs from "@/components/bannerTabs/MobileBannerTabs";
import { logEvent } from "firebase/analytics";
import { analytics } from "../../../../utils/firebase";
import { useUserType } from "@/hooks/useUserType";
import TravelerSelectDropdown from "@/components/corporate/travelerSelectDropdown/TravelerSelectDropdown";
import showToast from "@/utils/toast";
import useCorporateHotelSearch from "@/utils/corporate/hotels/search";

export default function Banner({
  setPageLoading,
  selectedTravelers,
  handleTravelerChange,
}) {
  const { suggestions, defaultHotelOptions, loadHotelOptions } =
    useCorporateHotelSearch({ defaultLimit: 10 });
  const { openPopup } = useLogin();
  const corporateUser = useUserType();

  const formatDateToDDMMYYYY = (date) => {
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0"); // Months are zero-based
    const year = date.getFullYear();

    return `${day}-${month}-${year}`;
  };
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [windowWidth, setWindowWidth] = useState(0);
  const [destination, setDestination] = useState("");
  const [selectedCity, setSelectedCity] = useState(null);
  const [matchingDestinations, setMatchingDestinations] = useState([]);
  const [getCityId, setCityId] = useState("");
  const [selectedItemIndex, setSelectedItemIndex] = useState(-1);
  const [hotelLocation, setHotelLocation] = useState("");
  const [getDestinationObj, setDestinationObj] = useState("");
  const [getCountryCode, setCountryCode] = useState("");
  const [getHotelCode, setHotelCode] = useState("");
  const [checkinDate, setCheckinDate] = useState(
    formatDateToDDMMYYYY(new Date())
  );
  const [checkoutDate, setCheckoutDate] = useState(() => {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    return formatDateToDDMMYYYY(tomorrow);
  });
  const [rooms, setRooms] = useState(1);
  const [adults, setAdults] = useState(2);
  const [roomText, setRoomText] = useState("Room");
  const [adultsText, setAdultsText] = useState("Adult");
  const [childrenText, setChildrenText] = useState("Child");
  const [children, setChildren] = useState(0);
  const [roomCount, setRoomCount] = useState([
    { adults: 2, children: 0, childAge: [] },
  ]);
  const [loading, setLoading] = useState(false);
  const [divDisabled, setdivDisabled] = useState(false);
  const [getAccessToken, setAccessToken] = useLocalStorage("accessToken");
  const [getuserip, setuserip] = useLocalStorage("userip");
  const router = useRouter();
  const checkinTimeRef = useRef(null);
  const checkoutTimeRef = useRef(null);
  const inputRef = useRef(null);
  const dropdownRef = useRef(null);

  const loadPreviousResults = useCallback(async () => {
    try {
      const results = getTabSpecificData("searchData");
      if (results) {
        const parsedResults = JSON.parse(results);
        setCheckinDate(
          parsedResults.checkInDate || formatDateToDDMMYYYY(new Date())
        );
        setCheckoutDate(
          parsedResults.checkoutDate ||
          formatDateToDDMMYYYY(
            new Date(new Date().setDate(new Date().getDate() + 1))
          )
        );
        setRooms(parsedResults.rooms || 1);
        setAdults(parsedResults.adults || 2);
        setRoomCount(
          JSON.parse(parsedResults.roomCountString) || [
            { adults: 2, children: 0, childAge: [] },
          ]
        );
        setCityId(parsedResults.getCityId || "");
        setCountryCode(parsedResults.getCountryCode || "");
        setHotelCode(parsedResults.getHotelCode || "");
        setDestination(parsedResults.destination || "");

        if (parsedResults.selectedCity) {
          const prevCity = JSON.parse(parsedResults.selectedCity);
          const isCity = prevCity.type === 1;
          const isHotel = prevCity.type === 2;
          const locationObj = {
            value: isCity ? prevCity.cityid : prevCity.hotelcode,
            label: isCity
              ? `${prevCity.cityname} (${prevCity.countryalpha2code})`
              : `${prevCity.title}, ${prevCity.cityname}, ${prevCity.countryname}`,
            type: prevCity.type,
            cityname: prevCity.cityname || prevCity.title,
            hotelname: isHotel ? prevCity.title : "",
            state: prevCity.state,
            countryname: prevCity.countryname,
            cityId: prevCity.cityid,
            countryalpha2code: prevCity.countryalpha2code,
            hotelcode: isHotel ? prevCity.hotelcode : "",
            isCity,
            isHotel,
            originalData: prevCity,
          };
          setSelectedCity(locationObj);
          setDestinationObj(JSON.stringify(locationObj));
        }
      }
    } catch (error) {
      console.error("Error loading previous results:", error);
    }
  }, []);

  useEffect(() => {
    loadPreviousResults();
  }, [loadPreviousResults]);

  const customStyles = {
    container: (base) => ({
      ...base,
      width: "100%",
      minWidth: "100%",
      maxWidth: "100%",
      boxSizing: "border-box",
      position: "relative",
    }),
    control: (base) => ({
      ...base,
      height: "45px",
      width: "100%",
      minWidth: "100%",
      maxWidth: "100%",
      borderRadius: "8px",
      backgroundColor: windowWidth <= 768 ? "transparent" : "white",
      border: "none",
      boxShadow: "none",
      fontSize: "14px",
      fontWeight: "500",
      color: windowWidth <= 768 ? "white" : "#028fa3",
      paddingLeft: "0.1rem",
      "&:hover": {
        borderColor: "#d1d5db",
      },
      "&:focus-within": {
        backgroundColor: windowWidth <= 768 ? "transparent" : "white",
        boxShadow: windowWidth <= 768 ? "none" : "0 0 0 1px #028fa3",
        borderColor: windowWidth <= 768 ? "transparent" : "#028fa3",
      },
    }),
    placeholder: (base) => ({
      ...base,
      color: windowWidth <= 768 ? "white" : "#9ca3af",
      fontSize: "14px",
    }),
    singleValue: (base) => ({
      ...base,
      color: windowWidth <= 768 ? "white" : "#028fa3",
      fontWeight: 500,
      fontSize: "14px",
      width: "100%",
    }),
    input: (base) => ({
      ...base,
      padding: 0,
      margin: 0,
      fontSize: "14px",
      color: windowWidth <= 768 ? "white" : "#028fa3",
      width: "100% !important",
      minWidth: "100% !important",
      maxWidth: "100% !important",
    }),
    dropdownIndicator: (base) => ({
      ...base,
      display: "none",
    }),
    clearIndicator: (base) => ({
      ...base,
      color: windowWidth <= 768 ? "white" : "#9ca3af",
      "&:hover": {
        color: windowWidth <= 768 ? "rgba(255, 255, 255, 0.8)" : "#4b5563",
      },
      padding: "0.25rem",
    }),
    menu: (base) => ({
      ...base,
      marginTop: "0.25rem",
      border: "1px solid #ccc",
      borderRadius: "4px",
      boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
      zIndex: 99999,
      width: "100%",
      backgroundColor: "white",
    }),
    menuList: (base) => ({
      ...base,
      maxHeight: "15rem",
      overflowY: "auto",
      padding: "0.5rem",
    }),
    option: (base, { isFocused }) => ({
      ...base,
      backgroundColor: isFocused ? "lightgray" : "white",
      color: "black",
      padding: "0.25rem",
      cursor: "pointer",
      display: "flex",
      flexDirection: "column",
      fontSize: "14px",
    }),
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (
        e.key === "ArrowDown" &&
        selectedItemIndex < matchingDestinations.length - 1
      ) {
        setSelectedItemIndex(selectedItemIndex + 1);
      } else if (e.key === "ArrowUp" && selectedItemIndex > 0) {
        setSelectedItemIndex(selectedItemIndex - 1);
      } else if (e.key === "Enter" && selectedItemIndex >= 0) {
        handleSelectDestination(matchingDestinations[selectedItemIndex]);
      }
    };

    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("click", handleClickOutside);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("click", handleClickOutside);
    };
  }, [selectedItemIndex, matchingDestinations]);

  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };
    setWindowWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

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

  const convertToDateObject = (ddMMyyyy) => {
    const parts = ddMMyyyy.split("-");
    const day = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1; // Months are zero-based in Date object
    const year = parseInt(parts[2], 10);

    return new Date(year, month, day);
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

  const handleCitySelect = (selectedOption) => {
    if (!selectedOption) {
      setDestination("");
      setCityId("");
      setDestinationObj("");
      setCountryCode("");
      setHotelCode("");
      setSelectedCity(null);
      return;
    }

    setSelectedCity(selectedOption);
    setDestination(selectedOption.label);
    setCityId(selectedOption.cityId);
    setDestinationObj(JSON.stringify(selectedOption));
    setCountryCode(selectedOption.originalData.countryalpha2code);
    setHotelCode(selectedOption.hotelcode || "");
    setIsDropdownOpen(false);

    logEvent(analytics, "city_select", {
      city: selectedOption.cityId,
      destination: selectedOption.label,
    });
  };

  const justSelectedRef = useRef(false);
  const handleDestinationChange = (event) => {
    const value = event.target.value;
    setDestination(value);
    setCityId("");

    logEvent(analytics, "city_search", {
      city: value,
      destination: destination,
    });
  };

  useEffect(() => {
    if (justSelectedRef.current) {
      justSelectedRef.current = false; // reset for next time
      return; // skip the fetch logic
    }
    const timer = setTimeout(() => {
      if (destination.length < 3) {
        setMatchingDestinations([]);
        setIsDropdownOpen(false);
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
      }
    }, 1000); // Delay of 1000 milliseconds (1 second)
    return () => clearTimeout(timer);
  }, [destination]);

  const handleSelectDestination = async (selectedDestination) => {
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

  const search = async () => {
    let accessToken = getTabSpecificData("accessToken");
    let userIp = getTabSpecificData("userip");
    // let accessToken = 1;
    if (!accessToken) {
      logEvent(analytics, "search_without_login", {
        city: getCityId,
        destination: destination,
      });
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

    if (!getCityId) {
      toast("Please select and search city or hotel.");
      if (divDisabled) {
        return; // Return early if button is disabled
      }
      setdivDisabled(true);
      setTimeout(() => {
        setdivDisabled(false);
      }, 6000); // Adjust the delay as needed
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
      if (setPageLoading) {
        setPageLoading(true);
      }
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
      if (corporateUser) {
        request.corporateEmployees = selectedTravelers;
      }
      const qTraceId = response?.qTraceId;
      if (qTraceId) {
        setTabSpecificData("hotelList", JSON.stringify(response));
        setTabSpecificData("selectedCity", getDestinationObj);
        setTabSpecificData("searchRequest", JSON.stringify(request));

        await goToHotelList(qTraceId, noOfNights);
        setLoading(false);
        logEvent(analytics, "search_after_login", {
          city: getCityId,
          destination: destination,
        });
      }
    } catch (error) {
      const errorMessage =
        error?.response?.data?.error?.errormessage ||
        "Unable to fetch hotels, please try after some time";
      toast(errorMessage);
      setLoading(false);
    } finally {
      setLoading(false);
      if (setPageLoading) {
        setPageLoading(false);
      }
    }
  };

  const saveSearchData = (qTraceId, noOfNights) => {
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
        noOfNights: noOfNights,
      })
    );
  };

  const goToHotelList = async (qTraceId, noOfNights) => {
    saveSearchData(qTraceId, noOfNights);
    await router.push({
      pathname: "/hotellist",
      query: {
        activeTab: "hotels",
      },
    });
  };

  const handleClearDestination = () => {
    setDestination("");
    // Clear the selected destination or perform any other necessary logic
  };

  return (
    <>
      <div className={styles.box}>
        <div className={styles.navbox}>
          <MobileBannerTabs />
          <div className={styles.selectors}>
            <div className={`${styles.selector} ${styles.selector1}`}>
              <h5 className={`${styles.heading} ${styles.heading1}`}>
                {" "}
                City/Hotel{" "}
              </h5>
              <div className={styles.searchCross}>
                <AsyncSelect
                  cacheOptions
                  defaultOptions={defaultHotelOptions}
                  loadOptions={loadHotelOptions}
                  placeholder="Search City or Hotel"
                  value={selectedCity}
                  onChange={handleCitySelect}
                  instanceId="hotel-location-search"
                  isDisabled={loading}
                  isClearable
                  styles={customStyles}
                  formatOptionLabel={(option) => (
                    <div className="flex flex-col">
                      {option.type === 1 ? (
                        <>
                          <div className="text-nowrap">
                            <FontAwesomeIcon
                              icon={faCity}
                              size="sm"
                              color="#028fa3"
                            />
                            <span className="font-semibold ml-2 text-nowrap">
                              {option.cityname} ({option.countryalpha2code})
                            </span>
                          </div>
                          <span className="text-sm text-gray-500 font-medium text-nowrap">
                            {option.cityname}, {option.countryname}
                          </span>
                        </>
                      ) : option.type === 2 ? (
                        <>
                          <div className="text-nowrap">
                            <FontAwesomeIcon
                              icon={faBed}
                              size="sm"
                              color="#028fa3"
                            />
                            <span className="font-semibold ml-2 text-nowrap">
                              {option.hotelname}
                            </span>
                          </div>
                          <span className="text-sm text-gray-500 font-medium text-nowrap">
                            {option.cityname}, {option.countryname}
                          </span>
                        </>
                      ) : null}
                    </div>
                  )}
                  loadingMessage={() => <div className="p-2">Loading...</div>}
                  noOptionsMessage={({ inputValue }) =>
                    inputValue.length > 0 ? (
                      <div className="p-2 text-red-500 text-sm">
                        No data found
                      </div>
                    ) : (
                      <div className="p-2 text-gray-500 text-sm">
                        Type to search
                      </div>
                    )
                  }
                />
              </div>
            </div>
            <div className={styles.datesRow}>
              <div className={`${styles.selector} ${styles.selector2}`}>
                <h5 className={styles.heading}>Check-In</h5>
                <DatePicker
                  selected={convertToDateObject(checkinDate)}
                  dateFormat="dd-MM-yyyy"
                  onChange={handleCheckinChange}
                  minDate={new Date()}
                  showPopperArrow={false}
                  popperClassName={styles.customLeftPopper}
                  customInput={
                    <div className={styles["date-picker-wrapper"]}>
                      <input
                        value={checkinDate}
                        readOnly
                        onChange={(e) => e.preventDefault()}
                        type="text"
                        className={`${styles.formControl} ${styles.dateEntry}`}
                        id="checkinTime"
                        style={{
                          background: "white",
                          color: "#028fa3",
                          border: "none",
                          borderBottom: "0.11px solid white",
                          borderRadius: "8px",
                          paddingLeft: "8px",
                          fontWeight: "500",
                          cursor: "pointer",
                          width: "100%",
                          outline: "none",
                          padding: "5% 3%",
                        }}
                      />
                      <FontAwesomeIcon
                        icon={faCalendarAlt}
                        className={styles["calendar-icon"]}
                        onClick={() => checkinTimeRef.current?.click()} // Open the date picker when the icon is clicked
                      />
                    </div>
                  }
                />
              </div>
              <div className={`${styles.selector} ${styles.selector2}`}>
                <h5 className={styles.heading}>Check-Out</h5>
                <DatePicker
                  selected={convertToDateObject(checkoutDate)}
                  dateFormat="dd-MM-yyyy"
                  onChange={handleCheckoutChange}
                  popperClassName={styles.customRightPopper}
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
                    <div className={styles["date-picker-wrapper"]}>
                      <input
                        value={checkoutDate}
                        onChange={(e) => e.preventDefault()}
                        type="text"
                        readOnly
                        className={`${styles.formControl} ${styles.dateEntry}`}
                        id="checkoutTime"
                        style={{
                          background: "white",
                          color: "#028fa3",
                          border: "none",
                          borderBottom: "0.11px solid white",
                          borderRadius: "8px",
                          paddingLeft: "8px",
                          fontWeight: "500",
                          cursor: "pointer",
                          width: "100%",
                          outline: "none",
                          padding: "5% 3%",
                        }}
                      />
                      <FontAwesomeIcon
                        icon={faCalendarAlt}
                        className={styles["calendar-icon"]}
                        onClick={() => checkoutTimeRef.current?.click()} // Open the date picker when the icon is clicked
                      />
                    </div>
                  }
                />
              </div>
            </div>
            <div className={`${styles.selector} ${styles.selector4}`}>
              <h5 className={styles.heading}>Room & Guests</h5>
              <div className={styles.dividedropdown}>
                <Dropdown
                  className={styles.dropdownButtonMain}
                  style={{ width: "-webkit-fill-available" }}
                >
                  <Dropdown.Toggle
                    style={{
                      background: "white",
                      fontSize: "14px",
                      width: "100%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      border: "none",
                      color: "#028fa3",
                      fontWeight: "500",
                      borderRadius: "4px",
                    }}
                    variant="secondary"
                    id="dropdown-basic"
                    className={`${styles.dropdown} ${styles.dropRooms}`}
                  >
                    {rooms} {roomText}, {adults} {adultsText}
                    {!corporateUser && `, ${children} ${childrenText}`}
                  </Dropdown.Toggle>

                  <Dropdown.Menu
                    className={styles.guestsSelector}
                    style={{
                      height: "200px",
                      overflow: "scroll",
                      marginLeft: "-3px",
                    }}
                  >
                    <div className={styles.dropdownRooms}>
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

                    {roomCount.map(
                      (room, index) => (
                        console.log(
                          "roomcount: ,",
                          room.children <= 2
                            ? 8
                            : 10 - (room.adults + room.children)
                        ),
                        (
                          <div
                            className={styles.dropdownRoomDetails}
                            key={index}
                          >
                            <div className="dropdown-item">
                              <label htmlFor="adults">Adults</label>
                              {/* <label htmlFor="adults">
                                              {adults === '1' ? 'Adult' : 'Adults'}
                                            </label> */}
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
                                  style={{ padding: "5px" }}
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
                        )
                      )
                    )}
                  </Dropdown.Menu>
                </Dropdown>
              </div>
            </div>
            {/* button mobile starts */}
            <button
              className={styles.mobsearchButton}
              onClick={loading || divDisabled ? null : search}
            >
              {loading ? <div className={styles.loadingSpinner} /> : "Search"}
            </button>
            {/* button mobile ends */}
          </div>
          {corporateUser && (
            <div className={styles.selectors1} style={{ marginTop: "10px" }}>
              <TravelerSelectDropdown
                corporateUser={corporateUser}
                adultsCount={adults}
                onTravelerChange={handleTravelerChange}
                initialSelectedTravelers={selectedTravelers}
              />
            </div>
          )}
          <button
            className={styles.searchButton}
            onClick={loading || divDisabled ? null : search}
          >
            {loading ? <div className={styles.loadingSpinner} /> : "Search"}
          </button>
        </div>
      </div>
    </>
  );
}
