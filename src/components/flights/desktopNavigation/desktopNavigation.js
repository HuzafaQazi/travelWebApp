import style from "./styles.module.css";
import { useEffect, useRef } from "react";
import { useState } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import AsyncSelectInput from "@/components/Select/AsyncSelectInput";
import AsyncSelect from "react-select/async";
import axios, { getTabSpecificData } from "@/utils/axios/axios";
import config from "@/config";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useRouter } from "next/router";
import {
  faTimes,
  faCaretDown,
  faUser,
  faRightLeft,
  faCalendarDays,
  faXmark,
  faPlaneDeparture,
} from "@fortawesome/free-solid-svg-icons";
import useFlightsSearch from "../../../../utils/flights/search";
import DesktopBannerTabs from "@/components/bannerTabs/DesktopBannerTabs";
import { logEvent } from "firebase/analytics";
import { analytics } from "../../../../utils/firebase";
import { useUserType } from "@/hooks/useUserType";
import { useSelector } from "react-redux";
import TravelerSelectDropdown from "@/components/corporate/travelerSelectDropdown/TravelerSelectDropdown";
import showToast from "@/utils/toast";

export default function DesktopNavigation({
  updateFlights,
  setPageLoading,
  defaultSelectedContent,
  isRedirect,
  searchButtonDisabled,
  setSearchButtonDisabled,
  selectedTravelers,
  setSelectedTravelers,
  handleTravelerChange,
  isSideSheetOpen = false,
}) {
  const {
    fromDestination,
    toDestination,
    fromCityCode,
    toCityCode,
    isFromDropdownOpen,
    isToDropdownOpen,
    setIsFromDropdownOpen,
    setIsToDropdownOpen,
    setFromDestination,
    setToDestination,
    loading,
    redirectionRoute,
    handleSelectDestination,
    search,
    fromDropdownRef,
    toDropdownRef,
    setRedirectionRoute,
    matchingFromDestinations,
    matchingToDestinations,
    selectedFromItemIndex,
    selectedToItemIndex,
    isFromSearchOpen,
    isToSearchOpen,
    // change for arrow nav in desk
    setSelectedFromItemIndex,
    setSelectedToItemIndex,
    // ends
    handleFromDestinationChange,
    handleToDestinationChange,
    setFromCityCode,
    setToCityCode,
    setFromCity,
    setToCity,
    fromCity,
    toCity,
    handleMultiCityDestinationChange,
    handleMultiCitySelectDestination,
    matchingMultiCityDestinations,
    multiCityDestinations,
    isMultiCitySearchOpen,
    selectedMultiCityItemIndex,
    multiCityCityCode,
    multiCityCity,
    setMultiCityDestinations,
    multiCityDropdownRefs,
    removeCityPair,
    defaultCityOptions,
    searchDestinations,
    searchMultiCityDestinations,
  } = useFlightsSearch();

  const [isMultiCityDropdownOpen, setIsMultiCityDropdownOpen] = useState({
    from: false,
    to: false,
  });
  const corporateUser = useUserType();

  // AsyncSelect state
  // const [defaultCityOptions, setDefaultCityOptions] = useState([]);
  const abortControllerRef = useRef({});
  // traveler number selector

  const [adultsCount, setAdultsCount] = useState(1);
  const [childCount, setChildCount] = useState(0);
  const [infantsCount, setInfantsCount] = useState(0);
  const [infantError, setInfantError] = useState(false);
  const total = adultsCount + childCount + infantsCount;
  const [travelerError, setTravelerError] = useState(false);
  const [isToastVisible, setIsToastVisible] = useState(false);

  const [isHomePage, setIsHomePage] = useState(false);

  // toggle for overlay of traveler selectors
  const [showOverlay, setShowOverlay] = useState(false);

  // toggle for overlay of cabin class
  const [showCabinClasses, setShowCabinClasses] = useState(false);

  const [isDepartureSelected, setIsDepartureSelected] = useState(false);
  // cabin class options

  const [selectedOptionCabinClass, setselectedOptionCabinClass] = useState("1");

  // calendar toggles
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [calendarPosition, setCalendarPosition] = useState({ top: 0, left: 0 });

  const [bottomSheetCalenderOpen, setBottomSheetCalenderOpen] = useState(false);
  const [selectedToggle, setSelectedToggle] = useState(null);
  const [departureDate, setDepartureDate] = useState(new Date());
  const [returnDate, setReturnDate] = useState(new Date(Date.now() + 86400000));

  const [selectedContent, setSelectedContent] = useState(
    defaultSelectedContent || "oneWay"
  );
  const [activeFare, setActiveFare] = useState("Regular Fares");
  const [selectedResultFareType, setSelectedResultFareType] = useState("2");
  const [flightCount, setFlightCount] = useState(0);
  const [flights, setFlights] = useState([]);
  const [showFlightSelectors, setShowFlightSelectors] = useState(false);
  const [routeLoading, setRouteLoading] = useState(false);
  const router = useRouter();
  const [activeLink, setActiveLink] = useState("flights");
  const [multiCitySelectedIndex, setMultiCitySelectedIndex] = useState(0);

  const calendarRef = useRef(null);
  const bottomSheetCalenderOpenRef = useRef(bottomSheetCalenderOpen);
  const [closeCalendarFlag, setCloseCalendarFlag] = useState(false);
  const userDetails = useSelector((state) => state?.user?.userInfo);

  // AsyncSelect custom styles
  const customStyles = {
    control: (base, state) => ({
      ...base,
      borderColor: state.isFocused ? "#3b82f6" : "#d1d5db",
      boxShadow: state.isFocused ? "0 0 0 1px #3b82f6" : "none",
      "&:hover": {
        borderColor: "#3b82f6",
      },
      fontSize: "0.875rem",
      padding: "8px 2px",
    }),
    option: (base, state) => ({
      ...base,
      backgroundColor: state.isFocused ? "#eff6ff" : "white",
      color: "#1f2937",
      fontSize: "0.875rem",
      cursor: "pointer",
    }),
    menu: (base) => ({
      ...base,
      zIndex: 9999,
    }),
    menuList: (base) => ({
      ...base,
      maxHeight: "300px",
      overflowY: "auto",
    }),
  };

  const getUserCountryCode = () => {
    let countryCode = null;
    const userLocation = getTabSpecificData("userLocation");

    if (userDetails) {
      countryCode = userDetails?.loggedInDetails?.userDetails?.countryCode;
      if (!countryCode && userLocation) {
        try {
          const parsedData = JSON.parse(userLocation);
          countryCode = parsedData?.country_code;
        } catch (error) {
          console.error("Error parsing userLocation:", error);
        }
      }
    } else if (userLocation) {
      try {
        const parsedData = JSON.parse(userLocation);
        countryCode = parsedData?.country_code;
      } catch (error) {
        console.error("Error parsing userLocation:", error);
      }
    }
    return countryCode || "IN";
  };

  // Load city options for AsyncSelect
  const loadCityOptions = async (inputValue, key = "default") => {
    try {
      if (abortControllerRef.current[key]) {
        abortControllerRef.current[key].abort();
      }
      const controller = new AbortController();
      abortControllerRef.current[key] = controller;
      const countryCode = getUserCountryCode();

      const response = await axios.get(
        `${
          config.FLIGHTS_CITY
        }?cityname=${inputValue.trim()}&countryCode=${countryCode}&length=10`,
        { signal: controller.signal }
      );

      if (response?.data?.status && Array.isArray(response.data.data)) {
        return response.data.data.map((city) => ({
          value: city.id || city._id,
          label: `${city.cityname} (${city.citycode}), ${city.countryname}`,
          airportName: city.airportName,
          airportCode: city.airportCode,
          countryname: city.countryname,
          cityData: city,
        }));
      }
      return [];
    } catch (error) {
      if (error.name !== "AbortError") {
        console.error(`Error loading cities for ${key}:`, error);
      }
      return [];
    }
  };

  // Cleanup abort controllers
  // useEffect(() => {
  //   return () => {
  //     Object.values(abortControllerRef.current).forEach((controller) => {
  //       try {
  //         if (controller && typeof controller.abort === "function") {
  //           controller.abort();
  //         }
  //       } catch (error) {
  //         console.error("Error aborting controller during cleanup:", error);
  //       }
  //     });
  //     abortControllerRef.current = {};
  //   };
  // }, []);

  // flights response
  useEffect(() => {
    if (window.location.pathname === "/") {
      return;
    }
    let encodedResponse = getTabSpecificData("flightRequest");
    if (window.location.pathname === "/flights/twoway/list") {
      encodedResponse = getTabSpecificData("twoWayFlightRequest");
    } else if (window.location.pathname === "/flights/multicity/list") {
      encodedResponse = getTabSpecificData("multiCityFlightRequest");
    }

    const fetchData = async () => {
      if (encodedResponse) {
        const decodedResponse = JSON.parse(atob(encodedResponse));
        if (
          decodedResponse.searchReqData.journeyType === "1" ||
          decodedResponse.searchReqData.journeyType === "2"
        ) {
          setFromDestination(decodedResponse.selectedFromCity);
          setToDestination(decodedResponse.selectedToCity);
          setDepartureDate(
            new Date(
              decodedResponse.searchReqData.segments[0].preferredDepartureTime
            )
          );
          // a changes
          if (decodedResponse.searchReqData.journeyType === "2") {
            setReturnDate(
              new Date(
                decodedResponse.searchReqData.segments[0].preferredArrivalTime
              )
            );
          }
          // aa
          setFromCityCode(decodedResponse.searchReqData.segments[0].origin);
          setToCityCode(decodedResponse.searchReqData.segments[0].destination);
          setFromCity(decodedResponse.fromCity);
          setToCity(decodedResponse.toCity);
          setMultiCityDestinations([
            {
              from: decodedResponse.selectedFromCity,
              to: decodedResponse.selectedToCity,
              fromCity: decodedResponse.fromCity,
              toCity: decodedResponse.toCity,
              fromCityCode:
                decodedResponse.searchReqData.segments[0].origin || "",
              toCityCode:
                decodedResponse.searchReqData.segments[0].destination || "",
              departureDate: new Date(
                decodedResponse.searchReqData.segments[0]
                  .preferredDepartureTime || new Date()
              ),
            },
          ]);
        } else if (decodedResponse.searchReqData.journeyType === "3") {
          const updatedMultiCityDestinations =
            decodedResponse.multiCityDestinations.map((destination, index) => {
              const fromLabel =
                typeof destination.from === "object" && destination.from?.label
                  ? destination.from.label
                  : destination.from || "";
              const toLabel =
                typeof destination.to === "object" && destination.to?.label
                  ? destination.to.label
                  : destination.to || "";
              return {
                from: destination.from
                  ? {
                      value: destination.fromCityCode || "",
                      label: fromLabel,
                      airportName: destination.fromCity || "",
                      airportCode: destination.fromCityCode || "",
                      countryname: fromLabel.split(", ")[1] || "",
                      cityData: {
                        cityname: destination.fromCity || "",
                        citycode: destination.fromCityCode || "",
                        countryname: fromLabel.split(", ")[1] || "",
                      },
                    }
                  : null,
                to: destination.to
                  ? {
                      value: destination.toCityCode || "",
                      label: toLabel,
                      airportName: destination.toCity || "",
                      airportCode: destination.toCityCode || "",
                      countryname: toLabel.split(", ")[1] || "",
                      cityData: {
                        cityname: destination.toCity || "",
                        citycode: destination.toCityCode || "",
                        countryname: toLabel.split(", ")[1] || "",
                      },
                    }
                  : null,
                fromCity: destination.fromCity || "",
                toCity: destination.toCity || "",
                fromCityCode: destination.fromCityCode || "",
                toCityCode: destination.toCityCode || "",
                departureDate: new Date(
                  destination.departureDate || new Date()
                ),
              };
            });
          setMultiCityDestinations(updatedMultiCityDestinations);
          setIsMultiCityDropdownOpen(
            updatedMultiCityDestinations.map(() => ({ from: false, to: false }))
          );
          const newFlights = updatedMultiCityDestinations
            .slice(0, updatedMultiCityDestinations.length - 1)
            .map((_, index) => ({
              id: Date.now() + index,
            }));
          setFlights(newFlights);
          setFlightCount(updatedMultiCityDestinations.length - 1);
          if (newFlights.length > 0) {
            setShowFlightSelectors(true);
          }
        }
        setSelectedContent(
          decodedResponse.searchReqData.journeyType === "1"
            ? "oneWay"
            : decodedResponse.searchReqData.journeyType === "2"
            ? "twoWay"
            : "multiWay"
        );
        setselectedOptionCabinClass(
          decodedResponse.searchReqData.segments[0].flightCabinClass
        );
        setAdultsCount(
          parseInt(decodedResponse.searchReqData.adultCount || 1, 10)
        );
        setChildCount(
          parseInt(decodedResponse.searchReqData.childCount || 0, 10)
        );
        setInfantsCount(
          parseInt(decodedResponse.searchReqData.infantCount || 0, 10)
        );
        setSelectedResultFareType(
          decodedResponse.searchReqData.resultFareType || ""
        );
        setRedirectionRoute("/");
        if (decodedResponse.corporateEmployees) {
          setSelectedTravelers(decodedResponse.corporateEmployees);
        }
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    // Check if running on the client
    if (typeof window !== "undefined") {
      setIsHomePage(window.location.pathname === "/");
    }
  }, []);

  useEffect(() => {
    const style = document.createElement("style");
    style.innerHTML = `
          .react-calendar__navigation__prev2-button,
          .react-calendar__navigation__next2-button {
            display: none !important;
          }
        `;
    document.head.appendChild(style);

    return () => {
      document.head.removeChild(style);
    };
  }, []);

  useEffect(() => {
    if (calendarRef.current && bottomSheetCalenderOpen) {
      const activeInput = document.querySelector(
        `#departure-input-${multiCitySelectedIndex}`
      );
      if (activeInput) {
        const inputRect = activeInput.getBoundingClientRect();
        calendarRef.current.style.top = `${
          inputRect.bottom + window.scrollY
        }px`;
        calendarRef.current.style.left = `${inputRect.left}px`;
        calendarRef.current.style.right = `320px`;
      }
    }
  }, [bottomSheetCalenderOpen, multiCitySelectedIndex]);

  useEffect(() => {
    if (total === 0) {
      setTravelerError(true);
      if (!isToastVisible) {
        showToast("info","Traveler count can't be zero");
        setIsToastVisible(true);

        // Reset the flag after a specific duration (e.g., 3 seconds)
        setTimeout(() => {
          setIsToastVisible(false);
        }, 6000);
      }
    } else {
      setTravelerError(false);
    }
  }, [total]);

  useEffect(() => {
    if (closeCalendarFlag) {
      toggleBottomSheetCalender();
      setCloseCalendarFlag(false);
    }
  }, [closeCalendarFlag]);

  const handleSwapDestinations = () => {
    const tempDestination = fromDestination;
    const tempFromCityCode = fromCityCode;
    const tempToCityCode = toCityCode;
    setFromCityCode(tempToCityCode);
    setToCityCode(tempFromCityCode);
    setFromDestination(toDestination);
    setToDestination(tempDestination);
    setFromCity(toCity);
    setToCity(fromCity);
  };

  const handleFareToggle = (fareType) => {
    setSelectedResultFareType(fareType);
    logEvent(analytics, "fare_type", {
      faretype: fareType,
    });
  };

  // multicity adding flights buttons
  const handleAddFlight = () => {
    setFlights((prevFlights) => [...prevFlights, { id: Date.now() }]);
    setFlightCount((prevCount) => prevCount + 1);
    setMultiCityDestinations((prevDestinations) => {
      const updatedDestinations = [
        ...prevDestinations.filter((dest) => dest !== undefined),
      ];
      const newIndex = flightCount;

      if (newIndex >= updatedDestinations.length) {
        updatedDestinations.push({
          from: "",
          fromCity: "",
          fromCityCode: "",
          to: "",
          toCity: "",
          toCityCode: "",
          departureDate:
            newIndex > 0 && updatedDestinations[newIndex - 1]?.departureDate
              ? updatedDestinations[newIndex - 1].departureDate
              : new Date(),
        });
      }
      return updatedDestinations;
    });

    setShowFlightSelectors(true);
  };

  const handleRemoveFlight = (id, index) => {
    setFlights((prevFlights) =>
      prevFlights.filter((flight) => flight.id !== id)
    );
    setFlightCount((prevCount) => prevCount - 1);
    removeCityPair(index);
  };

  const toggleOverlay = () => {
    setShowOverlay(!showOverlay);
  };

  const toggleCabinClasses = () => {
    setShowCabinClasses(!showCabinClasses);
  };

  const handleMultiWayDates = (date) => {
    const updatedMultiCityDestinations = [...multiCityDestinations];
    updatedMultiCityDestinations[multiCitySelectedIndex].departureDate = date;

    const selectedIndexDepartureDate = date;

    // Check if the date is valid and not undefined
    if (selectedIndexDepartureDate) {
      // Iterate over the subsequent arrays starting from the index after multiCitySelectedIndex
      for (
        let i = multiCitySelectedIndex + 1;
        i < updatedMultiCityDestinations.length;
        i++
      ) {
        const departureDate = updatedMultiCityDestinations[i]?.departureDate;
        // If the departure date is valid and greater than the selected index's departure date, update it
        if (departureDate && departureDate < selectedIndexDepartureDate) {
          updatedMultiCityDestinations[i].departureDate = new Date(
            selectedIndexDepartureDate
          );
        }
      }
    }

    setMultiCityDestinations(updatedMultiCityDestinations);
  };

  const handleDepartureDates = (date) => {
    setDepartureDate(date);
    if (date >= returnDate) {
      const nextDay = new Date(date);
      nextDay.setDate(nextDay.getDate() + 1);
      setReturnDate(nextDay);
    }
  };

  const handleCalendarChange = (date) => {
    if (selectedContent === "multiWay") {
      handleMultiWayDates(date);
      handleDepartureDates(date);
    } else {
      if (selectedToggle === "Departure") {
        handleDepartureDates(date);
        handleMultiWayDates(date);
        if (selectedContent === "twoWay") {
          setIsDepartureSelected(true); // Mark departure as selected
        }
      } else if (selectedToggle === "Return") {
        setReturnDate(date);
        if (date < departureDate) {
          const nextDay = new Date(departureDate);
          nextDay.setDate(nextDay.getDate() + 1);
          setReturnDate(nextDay);
          showToast("info","Return date cannot be lesser than departure date");
        }
      }
    }
    /* a change */
    if (bottomSheetCalenderOpenRef.current) {
      e.stopPropagation();
    } else {
      toggleBottomSheetCalender(selectedToggle);
    }
  };

  // date formatted

  const getFormattedDate = (date) => {
    const day = date.getDate();
    const month = date.toLocaleString("default", { month: "short" });
    const year = date.getFullYear().toString().slice(-2); // Take the last two digits of the year
    const fullyear = date.getFullYear();
    const frontdate = `${day} ${month}`;

    const options = {
      weekday: "long",
    };
    const weekday = new Intl.DateTimeFormat("en-US", options).format(date);

    const weekdayShort = weekday.substring(0, 3);

    return {
      date: `${day} ${month}, ${year}`,
      // day: weekday,
      fullyears: fullyear,
      fulldate: frontdate,
      smallweek: weekdayShort,
      dateNumber: day,
      months: month,
      weekdayShort: weekdayShort,
    };
  };

  const handleToggleClick = (toggle, index = null) => {
    return (event) => {
      if (selectedContent === "oneWay" && toggle === "Return") {
        setSelectedContent("twoWay");
      }
      toggleBottomSheetCalender(toggle);
      if (index !== null) {
        setMultiCitySelectedIndex(index);
      }
    };
  };

  const toggleBottomSheetCalender = (toggle) => {
    setBottomSheetCalenderOpen((prevState) => !prevState); /* a change */
    setSelectedToggle(toggle);
    bottomSheetCalenderOpenRef.current =
      !bottomSheetCalenderOpenRef.current; /* a change */
  };

  const handleNumberClick = (count) => {
    if (count === 0) return;
    if (count >= 0 && count <= 9 && count + childCount <= 9) {
      setAdultsCount(count);
      // Check if the infant count is greater than the adult count
      if (infantsCount > count) {
        setInfantsCount(count);
        // a changes
        setInfantError(false);
      }
    }
  };

  const handleChildNumberClick = (count) => {
    if (count >= 0 && count <= 8 && adultsCount + count <= 9) {
      setChildCount(count);
    }
  };

  const handleInfantNumberClick = (count) => {
    if (
      count >= 0 &&
      count <= 4 &&
      count <= adultsCount &&
      (adultsCount > 0 || childCount > 0)
    ) {
      setInfantsCount(count);
      setInfantError(false);
    } else {
      setInfantsCount(adultsCount);
      setInfantError(true);
      if (!isToastVisible) {
        showToast("info","Number of infants should not exceed the number of adult(s)");
        setIsToastVisible(true);

        // Reset the flag after a specific duration (e.g., 3 seconds)
        setTimeout(() => {
          setIsToastVisible(false);
        }, 6000);
      }
    }
  };

  const handleOptionChange = (value) => {
    setselectedOptionCabinClass(value);
    logEvent(analytics, "cabinclass", {
      type: value,
    });
  };

  const cabinClassOptions = [
    { value: "2", label: "Economy" },
    { value: "3", label: "Premium Economy" },
    { value: "4", label: "Business" },
    { value: "6", label: "First Class" },
  ];

  const handleSearch = (journeyType = "1") => {
    const FlightCabinClassText =
      selectedOptionCabinClass === "2"
        ? "Economy"
        : selectedOptionCabinClass === "3"
        ? "Premium Economy"
        : selectedOptionCabinClass === "4"
        ? "Business"
        : selectedOptionCabinClass === "6"
        ? "First Class"
        : "Economy";

    const modifiedMultiCityDestinations = multiCityDestinations.map(
      (destination) => ({
        ...destination,
        departureDate: destination.departureDate
          ? new Date(destination.departureDate.setHours(0, 0, 0, 0))
          : null,
      })
    );

    const data = {
      selectedOptionCabinClass,
      adultsCount,
      childCount,
      infantsCount,
      departureDate,
      returnDate,
      FlightCabinClassText,
      journeyType,
      selectedResultFareType,
      multiCityDestinations: modifiedMultiCityDestinations,
      isCorporateBooking: corporateUser,
      selectedTravelers,
    };

    logEvent(analytics, "flights_search", {
      cabinclass: selectedOptionCabinClass,
      journeytype: journeyType,
      faretype: selectedResultFareType,
      departureDate: departureDate,
      returnDate: returnDate,
      multiCityDestinations: modifiedMultiCityDestinations,
      isCorporateBooking: corporateUser,
      selectedTravelers: selectedTravelers,
    });

    data.departureDate.setHours(0, 0, 0, 0);
    data.returnDate?.setHours(0, 0, 0, 0);
    search(data, updateFlights, setPageLoading);
    if (setSearchButtonDisabled && journeyType === "2") {
      setSearchButtonDisabled(false);
    }
  };

  const minDate = new Date();
  const currentDate = new Date();
  const maxDate = new Date(currentDate);

  const isLeapYear = (year) => {
    return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
  };

  // Determine the number of days based on whether it's a leap year
  const daysToAdd = isLeapYear(currentDate.getFullYear()) ? 366 : 365;
  maxDate.setDate(currentDate.getDate() + daysToAdd);

  function getMaxDate(destinations) {
    let maxDate = new Date(currentDate);
    destinations.forEach((destination) => {
      const date = destination.departureDate;
      if (date > maxDate) {
        maxDate = new Date(date);
      }
    });
    return maxDate;
  }

  const handleSetSelectedContent = (way) => {
    setSelectedContent(way);
    if (way === "twoWay") {
      setReturnDate(new Date(departureDate.getTime() + 86400000));
    } else {
      setReturnDate(null);
    }
  };

  const handleMultiCityFromDestinationChange = (selectedOption, index) => {
    console.log("handleMultiCityFromDestinationChange:", {
      selectedOption,
      index,
    });
    handleMultiCitySelectDestination(index, "from", selectedOption);
  };

  const handleMultiCityToDestinationChange = (selectedOption, index) => {
    console.log("handleMultiCityToDestinationChange:", {
      selectedOption,
      index,
    });
    handleMultiCitySelectDestination(index, "to", selectedOption);
  };

  const getValidValue = (cityOption) => {
    if (!cityOption) {
      console.log("getValidValue: No city option provided, returning null");
      return null;
    }
    // If cityOption is already an object (from AsyncSelect), return it
    if (
      typeof cityOption === "object" &&
      cityOption.value &&
      cityOption.label
    ) {
      return cityOption;
    }
    // Otherwise, find matching option in defaultCityOptions
    const matchingOption = defaultCityOptions.find(
      (option) => option.label === cityOption
    );
    if (!matchingOption) {
      console.log(
        `getValidValue: No matching option found for "${cityOption}"`
      );
    }
    return matchingOption || null;
  };

  return (
    <>
      <div className={style.desktopNavigation}>
        <DesktopBannerTabs isRedirect={isRedirect} />
        <div
          className={`${style.allTogglesContainer} ${
            loading && style.disabled
          }`}
        >
          <div
            className={isHomePage ? style.waysSelectors : style.waysSelectors1}
          >
            <button
              onClick={() => handleSetSelectedContent("oneWay")}
              className={`${style.commonWayButtons} ${
                selectedContent === "oneWay" ? style.selected : ""
              }`}
            >
              One Way
            </button>
            <button
              onClick={() => handleSetSelectedContent("twoWay")}
              className={`${style.commonWayButtons} ${
                selectedContent === "twoWay" ? style.selected : ""
              }`}
            >
              Round Trip
            </button>
            {
              <button
                onClick={() => handleSetSelectedContent("multiWay")}
                className={`${style.commonWayButtons} ${
                  selectedContent === "multiWay" ? style.selected : ""
                }`}
              >
                Multi-city
              </button>
            }
          </div>

          {/* traveler and cabin class options */}
          <div
            className={isHomePage ? style.travelerClass : style.travelerClass1}
          >
            <button className={style.travelerBtn} onClick={toggleOverlay}>
              <div style={{ display: "flex", alignItems: "center", gap: "5%" }}>
                <FontAwesomeIcon icon={faUser} />
                <span>{total} Traveler</span>
              </div>
              <FontAwesomeIcon icon={faCaretDown} />
            </button>
            {showOverlay && (
              <>
                <div className={style.backdrop} onClick={toggleOverlay}></div>
                <div className={style.travelerOverlay}>
                  <div className={style.overlayHeads}>Adults</div>
                  <div className={style.overlayTexts}>
                    Search cannot have more than 9 adults
                  </div>
                  <div className={style.overlayAges}>(&gt;12years)</div>
                  <div className={style.adultCounts}>
                    {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((count) => (
                      <span
                        key={count}
                        className={
                          count === adultsCount
                            ? style.selectedNumber
                            : style.number
                        }
                        onClick={() => handleNumberClick(count)}
                      >
                        {count}
                      </span>
                    ))}
                  </div>

                  {!corporateUser && (
                    <div
                      className={style.childrenInfants}
                      style={{ flexDirection: "column" }}
                    >
                      <div className={style.childrenSelector}>
                        <div className={style.overlayHeads}>Children</div>
                        <div className={style.overlayAges}>(2 to 12 years)</div>
                        <div className={style.adultCounts}>
                          {[0, 1, 2, 3, 4, 5, 6, 7, 8].map((count) => (
                            <span
                              key={count}
                              className={
                                count === childCount
                                  ? style.selectedNumber
                                  : style.number
                              }
                              onClick={() => handleChildNumberClick(count)}
                            >
                              {count}
                            </span>
                          ))}
                        </div>
                      </div>
                      <div className={style.childrenSelector}>
                        <div className={style.overlayHeads}>Infants</div>
                        <div className={style.overlayAges}>(&lt;2years)</div>
                        <div
                          className={style.adultCounts}
                          style={{ justifyContent: "unset" }}
                        >
                          {[0, 1, 2, 3, 4].map((count) => (
                            <span
                              key={count}
                              className={
                                count === infantsCount
                                  ? style.selectedNumber
                                  : style.number
                              }
                              onClick={() => handleInfantNumberClick(count)}
                            >
                              {count}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </>
            )}
            <button className={style.travelerBtn} onClick={toggleCabinClasses}>
              <span>
                {"Cabin Class | "}
                {selectedOptionCabinClass === "2"
                  ? "Economy"
                  : selectedOptionCabinClass === "3"
                  ? "Premium Economy"
                  : selectedOptionCabinClass === "4"
                  ? "Business"
                  : selectedOptionCabinClass === "6"
                  ? "First Class"
                  : "Economy"}
              </span>
              <FontAwesomeIcon icon={faCaretDown} />
            </button>
            {showCabinClasses && (
              <>
                <div
                  className={style.backdrop}
                  onClick={toggleCabinClasses}
                ></div>
                <div className={style.classSelectors}>
                  <span>Select Travel Class</span>
                  <div
                    className={style.buttonGroup}
                    onClick={toggleCabinClasses}
                  >
                    {cabinClassOptions.map((option) => (
                      <button
                        key={option.value}
                        className={
                          selectedOptionCabinClass === option.value
                            ? style.selectedButton
                            : style.classButton
                        }
                        onClick={() => handleOptionChange(option.value)}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>

          {/* special fares toggles */}
          <div
            className={isHomePage ? style.specialFares : style.specialFares1}
          >
            <div
              className={`${style.fareToggle} ${
                selectedResultFareType === "2" ? style.activeFare : ""
              }`}
              onClick={() => handleFareToggle("2")}
            >
              Regular Fares
            </div>

            <div
              className={`${style.fareToggle} ${
                selectedResultFareType === "5" ? style.activeFare : ""
              }`}
              onClick={() => handleFareToggle("5")}
              // title="Applicable for only senior citizens above the age of 60 years can avail of this special fare. It is mandatory to present valid age proof at the airport."
            >
              Senior
              <div className={style.tooltipcontent}>
                Applicable for only senior citizens above the age <br />
                of 60 years can avail of this special fare. It
                <br />
                is mandatory to present valid age proof at the airport.
              </div>
            </div>

            <div
              className={`${style.fareToggle} ${
                selectedResultFareType === "3" ? style.activeFare : ""
              }`}
              onClick={() => handleFareToggle("3")}
            >
              Student
              <div className={style.tooltipcontent}>
                Applicable for all students above the age of 12 <br />
                years studying with a bonafide school/university.
                <br />
                Valid photo ID and educational institute ID card
                <br />
                need to be presented for verification at the airport.
              </div>
            </div>

            <div
              className={`${style.fareToggle} ${
                selectedResultFareType === "4" ? style.activeFare : ""
              }`}
              onClick={() => handleFareToggle("4")}
            >
              Army Force
              <div className={style.tooltipcontent}>
                Applicable for all serving and retired Indian Armed <br />
                Forces and Paramilitary Forces personnel. Valid photo
                <br />
                ID and relevant military card need to be presented for
                <br />
                verification at the airport.
                <br />
              </div>
            </div>
          </div>
        </div>

        {/* different ways content */}
        <div className={`${style.WaysContent} ${loading && style.disabled}`}>
          {selectedContent === "oneWay" && (
            <div className={style.selectors}>
              <div className={style.searchCross}>
                <span>From</span>
                <AsyncSelectInput
                  placeholder="Source City Name"
                  value={fromDestination}
                  onChange={handleFromDestinationChange}
                  loadOptions={(inputValue) =>
                    loadCityOptions(inputValue, "from")
                  }
                  instanceId="from-destination"
                  isDisabled={loading}
                  showIcon={false}
                  iconType="plane"
                  customFormatting={true}
                  labelField="label"
                  subtitleFields={["airportName", "countryname"]}
                  defaultOptions={defaultCityOptions}
                  styles={customStyles}
                />
              </div>
              <div
                className={style.searchCrossChange}
                onClick={handleSwapDestinations}
              >
                <FontAwesomeIcon icon={faRightLeft} />
              </div>
              <div className={style.searchCross}>
                <span>To</span>
                <AsyncSelectInput
                  placeholder="Destination City Name"
                  value={toDestination}
                  onChange={handleToDestinationChange}
                  loadOptions={(inputValue) =>
                    loadCityOptions(inputValue, "to")
                  }
                  instanceId="to-destination"
                  isDisabled={loading}
                  showIcon={false}
                  iconType="plane"
                  customFormatting={true}
                  labelField="label"
                  subtitleFields={["airportName", "countryname"]}
                  defaultOptions={defaultCityOptions}
                  styles={customStyles}
                />
              </div>
              <div className={style.searchDates}>
                <span>Travel Dates</span>
                <div className={style.inOutDates}>
                  <FontAwesomeIcon
                    icon={faCalendarDays}
                    className={style.calenderIcon}
                    onClick={handleToggleClick("Departure")}
                  />
                  <div
                    className={style.depDateDetails}
                    onClick={handleToggleClick("Departure")}
                  >
                    <span className={style.dateHighlight}>
                      {getFormattedDate(departureDate).dateNumber}{" "}
                    </span>
                    <span>{getFormattedDate(departureDate).months}</span>
                    <span>{getFormattedDate(departureDate).weekdayShort}</span>
                    <span>{getFormattedDate(departureDate).fullyears}</span>
                  </div>
                  <div
                    className={style.arrDateDetails}
                    // onClick={toggleBottomSheetCalender}
                    onClick={() => {
                      toggleBottomSheetCalender("Return");
                      setSelectedToggle("Return");
                    }}
                  >
                    <span style={{ cursor: "pointer" }}>+ Add Return Date</span>
                  </div>
                </div>
                <div className={style.calenderHolder}></div>
              </div>
              <button
                className={style.modifyBtn}
                onClick={() => (loading ? null : handleSearch("1"))}
              >
                {loading ? <div className={style.loadingSpinner} /> : "Search"}
              </button>
            </div>
          )}
          {selectedContent === "twoWay" && (
            <div className={style.selectors}>
              <div className={style.searchCross}>
                <span>From</span>
                <AsyncSelectInput
                  placeholder="Source City Name"
                  value={fromDestination}
                  onChange={handleFromDestinationChange}
                  loadOptions={(inputValue) =>
                    loadCityOptions(inputValue, "from")
                  }
                  instanceId="from-destination"
                  isDisabled={loading}
                  showIcon={false}
                  iconType="plane"
                  customFormatting={true}
                  labelField="label"
                  subtitleFields={["airportName", "countryname"]}
                  defaultOptions={defaultCityOptions}
                  styles={customStyles}
                />
              </div>
              <div
                className={style.searchCrossChange}
                onClick={handleSwapDestinations}
              >
                <FontAwesomeIcon icon={faRightLeft} />
              </div>
              <div className={style.searchCross}>
                <span>To</span>
                <AsyncSelectInput
                  placeholder="Destination City Name"
                  value={toDestination}
                  onChange={handleToDestinationChange}
                  loadOptions={(inputValue) =>
                    loadCityOptions(inputValue, "to")
                  }
                  instanceId="to-destination"
                  isDisabled={loading}
                  showIcon={false}
                  iconType="plane"
                  customFormatting={true}
                  labelField="label"
                  subtitleFields={["airportName", "countryname"]}
                  defaultOptions={defaultCityOptions}
                  styles={customStyles}
                />
              </div>
              <div className={style.searchDates}>
                <span>Travel Dates</span>
                <div className={style.inOutDates} style={{ width: "100%" }}>
                  <FontAwesomeIcon
                    icon={faCalendarDays}
                    className={style.calenderIcon}
                    onClick={handleToggleClick("Departure")}
                  />
                  <div
                    className={style.depDateDetails}
                    onClick={handleToggleClick("Departure")}
                  >
                    <span className={style.dateHighlight}>
                      {getFormattedDate(departureDate).dateNumber}
                    </span>
                    <span>{getFormattedDate(departureDate).months}</span>
                    <span>{getFormattedDate(departureDate).weekdayShort}</span>
                    <span>{getFormattedDate(departureDate).fullyears}</span>
                  </div>
                  <FontAwesomeIcon
                    icon={faCalendarDays}
                    className={style.calenderIcon}
                    onClick={handleToggleClick("Return")}
                  />
                  <div
                    className={style.depDateDetails}
                    style={{ border: "none" }}
                    onClick={handleToggleClick("Return")}
                  >
                    <span className={style.dateHighlight}>
                      {getFormattedDate(returnDate).dateNumber}
                    </span>
                    <span>{getFormattedDate(returnDate).months}</span>
                    <span>{getFormattedDate(returnDate).weekdayShort}</span>
                    <span>{getFormattedDate(returnDate).fullyears}</span>
                  </div>
                  <div className={style.calenderHolder}></div>
                </div>
              </div>
              <button
                className={style.modifyBtn}
                onClick={() => (loading ? null : handleSearch("2"))}
                disabled={searchButtonDisabled}
              >
                {loading ? <div className={style.loadingSpinner} /> : "Search"}
              </button>
            </div>
          )}
          {selectedContent === "multiWay" && (
            <div>
              <div className={style.selectors}>
                <div className={style.searchCross}>
                  <span>From</span>
                  <AsyncSelect
                    cacheOptions
                    defaultOptions={defaultCityOptions}
                    loadOptions={(inputValue) =>
                      searchMultiCityDestinations(inputValue, 0, "from")
                    }
                    placeholder="From"
                    value={getValidValue(multiCityDestinations[0]?.from)}
                    onChange={(selectedOption) =>
                      handleMultiCityFromDestinationChange(selectedOption, 0)
                    }
                    instanceId={`multi-city-from-0`}
                    isDisabled={loading || isSideSheetOpen}
                    isClearable
                    styles={customStyles}
                    onMenuOpen={() =>
                      setIsMultiCityDropdownOpen((prev) => ({
                        ...prev,
                        from: true,
                      }))
                    }
                    onMenuClose={() =>
                      setIsMultiCityDropdownOpen((prev) => ({
                        ...prev,
                        from: false,
                      }))
                    }
                    formatOptionLabel={(option) => (
                      <div className="flex flex-col">
                        <div className="font-semibold text-nowrap">
                          <FontAwesomeIcon
                            icon={faPlaneDeparture}
                            color="#028fa3"
                            size="xs"
                            className="mr-2"
                          />
                          {option.label}
                        </div>
                        <span className="text-sm text-gray-500 text-nowrap">
                          {option.airportName}, {option.countryname} (
                          {option.airportCode})
                        </span>
                      </div>
                    )}
                    loadingMessage={() => <div className="p-2">Loading...</div>}
                    noOptionsMessage={({ inputValue }) =>
                      inputValue.length > 0 ? (
                        <div className="p-2 text-red-500 text-sm">
                          No cities found
                        </div>
                      ) : (
                        <div className="p-2 text-gray-500 text-sm">
                          Type to search
                        </div>
                      )
                    }
                  />
                </div>
                <div className={style.searchCross}>
                  <span>To</span>
                  <AsyncSelect
                    cacheOptions
                    defaultOptions={defaultCityOptions}
                    loadOptions={(inputValue) =>
                      searchMultiCityDestinations(inputValue, 0, "to")
                    }
                    placeholder="To"
                    value={getValidValue(multiCityDestinations[0]?.to)}
                    onChange={(selectedOption) =>
                      handleMultiCityToDestinationChange(selectedOption, 0)
                    }
                    instanceId={`multi-city-to-0`}
                    isDisabled={loading || isSideSheetOpen}
                    isClearable
                    styles={customStyles}
                    onMenuOpen={() =>
                      setIsMultiCityDropdownOpen((prev) => ({
                        ...prev,
                        to: true,
                      }))
                    }
                    onMenuClose={() =>
                      setIsMultiCityDropdownOpen((prev) => ({
                        ...prev,
                        to: false,
                      }))
                    }
                    formatOptionLabel={(option) => (
                      <div className="flex flex-col">
                        <div className="font-semibold text-nowrap">
                          <FontAwesomeIcon
                            icon={faPlaneDeparture}
                            color="#028fa3"
                            size="xs"
                            className="mr-2"
                          />
                          {option.label}
                        </div>
                        <span className="text-sm text-gray-500 text-nowrap">
                          {option.airportName}, {option.countryname} (
                          {option.airportCode})
                        </span>
                      </div>
                    )}
                    loadingMessage={() => <div className="p-2">Loading...</div>}
                    noOptionsMessage={({ inputValue }) =>
                      inputValue.length > 0 ? (
                        <div className="p-2 text-red-500 text-sm">
                          No cities found
                        </div>
                      ) : (
                        <div className="p-2 text-gray-500 text-sm">
                          Type to search
                        </div>
                      )
                    }
                  />
                </div>
                <div className={style.searchDates} style={{ width: "18%" }}>
                  <span>Travel Dates</span>
                  <div
                    id={`departure-input-0`}
                    className={style.inOutDates}
                    style={{
                      width: "-webkit-fill-available",
                      padding: "6% 8%",
                    }}
                    onClick={handleToggleClick("Departure", 0)}
                  >
                    <FontAwesomeIcon
                      icon={faCalendarDays}
                      className={style.calenderIcon}
                    />
                    <div
                      className={style.depDateDetails}
                      style={{ borderRight: "none" }}
                    >
                      <span className={style.dateHighlight}>
                        {
                          getFormattedDate(
                            multiCityDestinations[0].departureDate
                          ).dateNumber
                        }{" "}
                      </span>
                      <span>
                        {
                          getFormattedDate(
                            multiCityDestinations[0].departureDate
                          ).months
                        }{" "}
                      </span>
                      <span>
                        {
                          getFormattedDate(
                            multiCityDestinations[0].departureDate
                          ).weekdayShort
                        }{" "}
                      </span>
                      <span>
                        {
                          getFormattedDate(
                            multiCityDestinations[0].departureDate
                          ).fullyears
                        }
                      </span>
                    </div>
                  </div>
                </div>
                {multiCityDestinations.length === 1 && (
                  <>
                    <button
                      className={style.addFLightsButton}
                      onClick={() => handleAddFlight()}
                    >
                      Add flight
                    </button>
                    <button
                      className={style.modifyBtn}
                      style={{ padding: "1% 5%" }}
                      onClick={() => (loading ? null : handleSearch("3"))}
                    >
                      {loading ? (
                        <div className={style.loadingSpinner} />
                      ) : (
                        "Search"
                      )}
                    </button>
                  </>
                )}
              </div>
              <div>
                {showFlightSelectors && (
                  <>
                    {flights.map((flight, flightIndex) => {
                      const updatedIndex = flightIndex + 1;
                      return (
                        <div
                          key={flight.id}
                          className={style.addedFlightSelector}
                        >
                          <div className={style.selectors}>
                            <div className={style.searchCross}>
                              <span>From</span>
                              <AsyncSelect
                                cacheOptions
                                defaultOptions={defaultCityOptions}
                                loadOptions={(inputValue) =>
                                  searchMultiCityDestinations(
                                    inputValue,
                                    updatedIndex,
                                    "from"
                                  )
                                }
                                placeholder="From"
                                value={getValidValue(
                                  multiCityDestinations[updatedIndex]?.from
                                )}
                                onChange={(selectedOption) =>
                                  handleMultiCityFromDestinationChange(
                                    selectedOption,
                                    updatedIndex
                                  )
                                }
                                instanceId={`multi-city-from-${updatedIndex}`}
                                isDisabled={loading || isSideSheetOpen}
                                isClearable
                                styles={customStyles}
                                onMenuOpen={() =>
                                  setIsMultiCityDropdownOpen((prev) => ({
                                    ...prev,
                                    from: true,
                                  }))
                                }
                                onMenuClose={() =>
                                  setIsMultiCityDropdownOpen((prev) => ({
                                    ...prev,
                                    from: false,
                                  }))
                                }
                                formatOptionLabel={(option) => (
                                  <div className="flex flex-col">
                                    <div className="font-semibold text-nowrap">
                                      <FontAwesomeIcon
                                        icon={faPlaneDeparture}
                                        color="#028fa3"
                                        size="xs"
                                        className="mr-2"
                                      />
                                      {option.label}
                                    </div>
                                    <span className="text-sm text-gray-500 text-nowrap">
                                      {option.airportName}, {option.countryname}{" "}
                                      ({option.airportCode})
                                    </span>
                                  </div>
                                )}
                                loadingMessage={() => (
                                  <div className="p-2">Loading...</div>
                                )}
                                noOptionsMessage={({ inputValue }) =>
                                  inputValue.length > 0 ? (
                                    <div className="p-2 text-red-500 text-sm">
                                      No cities found
                                    </div>
                                  ) : (
                                    <div className="p-2 text-gray-500 text-sm">
                                      Type to search
                                    </div>
                                  )
                                }
                              />
                            </div>
                            <div className={style.searchCross}>
                              <span>To</span>
                              <AsyncSelect
                                cacheOptions
                                defaultOptions={defaultCityOptions}
                                loadOptions={(inputValue) =>
                                  searchMultiCityDestinations(
                                    inputValue,
                                    updatedIndex,
                                    "to"
                                  )
                                }
                                placeholder="To"
                                value={getValidValue(
                                  multiCityDestinations[updatedIndex]?.to
                                )}
                                onChange={(selectedOption) =>
                                  handleMultiCityToDestinationChange(
                                    selectedOption,
                                    updatedIndex
                                  )
                                }
                                instanceId={`multi-city-to-${updatedIndex}`}
                                isDisabled={loading || isSideSheetOpen}
                                isClearable
                                styles={customStyles}
                                onMenuOpen={() =>
                                  setIsMultiCityDropdownOpen((prev) => ({
                                    ...prev,
                                    to: true,
                                  }))
                                }
                                onMenuClose={() =>
                                  setIsMultiCityDropdownOpen((prev) => ({
                                    ...prev,
                                    to: false,
                                  }))
                                }
                                formatOptionLabel={(option) => (
                                  <div className="flex flex-col">
                                    <div className="font-semibold text-nowrap">
                                      <FontAwesomeIcon
                                        icon={faPlaneDeparture}
                                        color="#028fa3"
                                        size="xs"
                                        className="mr-2"
                                      />
                                      {option.label}
                                    </div>
                                    <span className="text-sm text-gray-500 text-nowrap">
                                      {option.airportName}, {option.countryname}{" "}
                                      ({option.airportCode})
                                    </span>
                                  </div>
                                )}
                                loadingMessage={() => (
                                  <div className="p-2">Loading...</div>
                                )}
                                noOptionsMessage={({ inputValue }) =>
                                  inputValue.length > 0 ? (
                                    <div className="p-2 text-red-500 text-sm">
                                      No cities found
                                    </div>
                                  ) : (
                                    <div className="p-2 text-gray-500 text-sm">
                                      Type to search
                                    </div>
                                  )
                                }
                              />
                            </div>
                            <div
                              className={style.searchDates}
                              style={{ width: "18%" }}
                            >
                              <span>Travel Dates</span>
                              <div
                                id={`departure-input-${updatedIndex}`}
                                className={style.inOutDates}
                                style={{
                                  width: "-webkit-fill-available",
                                  padding: "6% 8%",
                                }}
                                onClick={handleToggleClick(
                                  "Departure",
                                  updatedIndex
                                )}
                              >
                                <FontAwesomeIcon
                                  icon={faCalendarDays}
                                  className={style.calenderIcon}
                                />
                                <div
                                  className={style.depDateDetails}
                                  style={{ borderRight: "none" }}
                                >
                                  <span className={style.dateHighlight}>
                                    {
                                      getFormattedDate(
                                        (
                                          multiCityDestinations[updatedIndex] ||
                                          multiCityDestinations[
                                            multiCityDestinations.length - 1
                                          ]
                                        ).departureDate
                                      ).fulldate
                                    }{" "}
                                  </span>
                                  <span>
                                    {
                                      getFormattedDate(
                                        (
                                          multiCityDestinations[updatedIndex] ||
                                          multiCityDestinations[
                                            multiCityDestinations.length - 1
                                          ]
                                        ).departureDate
                                      ).smallweek
                                    }{" "}
                                  </span>
                                  <span>
                                    {
                                      getFormattedDate(
                                        (
                                          multiCityDestinations[updatedIndex] ||
                                          multiCityDestinations[
                                            multiCityDestinations.length - 1
                                          ]
                                        ).departureDate
                                      ).fullyears
                                    }{" "}
                                  </span>
                                </div>
                              </div>
                            </div>
                            <div className={style.closeFlightsContainer}>
                              <FontAwesomeIcon
                                icon={faXmark}
                                style={{ color: "black" }}
                                className={style.closeAddedFlights}
                                onClick={() =>
                                  handleRemoveFlight(flight.id, updatedIndex)
                                }
                              />
                            </div>
                            {flightCount === updatedIndex &&
                              flightCount < 5 && (
                                <>
                                  <button
                                    className={style.addFlightBtn}
                                    onClick={() => handleAddFlight()}
                                  >
                                    Add Flight
                                  </button>
                                  <button
                                    className={style.modifyBtn}
                                    style={{ padding: "1% 5%" }}
                                    onClick={() =>
                                      loading ? null : handleSearch("3")
                                    }
                                  >
                                    {loading ? (
                                      <div className={style.loadingSpinner} />
                                    ) : (
                                      "Search"
                                    )}
                                  </button>
                                </>
                              )}
                            {flightCount === updatedIndex &&
                              flightCount === 5 && (
                                <button
                                  className={style.modifyBtn}
                                  style={{ padding: "1% 5%", marginLeft: "3%" }}
                                  onClick={() =>
                                    loading ? null : handleSearch("3")
                                  }
                                >
                                  {loading ? (
                                    <div className={style.loadingSpinner} />
                                  ) : (
                                    "Search"
                                  )}
                                </button>
                              )}
                          </div>
                        </div>
                      );
                    })}
                  </>
                )}
              </div>
            </div>
          )}
        </div>

        {corporateUser && (
          <div className={style.WaysContent1}>
            <TravelerSelectDropdown
              corporateUser={corporateUser}
              adultsCount={adultsCount}
              onTravelerChange={handleTravelerChange}
              initialSelectedTravelers={selectedTravelers}
            />
          </div>
        )}

        {/* bottomsheet for Calendar */}
        {bottomSheetCalenderOpen && (
          <>
            <div
              className={style.backdrop}
              onClick={toggleBottomSheetCalender}
            ></div>
            <div
              className={`${
                corporateUser && isHomePage
                  ? style.calendarContainer1
                  : style.calendarContainer
              }
                  ${
                    corporateUser && !isHomePage
                      ? style.calendarContainer2
                      : style.calendarContainer
                  }`}
              ref={calendarRef}
              style={{ position: "absolute" }}
            >
              <div className={style.depRetHead}>
                <div
                  className={`${style.depHead} ${
                    selectedToggle === "Departure" ? style.active : ""
                  }`}
                  onClick={setSelectedToggle.bind(this, "Departure")}
                >
                  Departure Date
                  <div className={style.depDateDetails}>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "5px",
                      }}
                    >
                      <FontAwesomeIcon
                        icon={faCalendarDays}
                        className={style.calenderIcon}
                      />
                      <span className={style.dateHighlight}>
                        {/* {departureDate.getDate()} */}
                        {
                          getFormattedDate(
                            selectedContent === "multiWay"
                              ? (
                                  multiCityDestinations[
                                    multiCitySelectedIndex
                                  ] ||
                                  multiCityDestinations[
                                    multiCityDestinations.length - 1
                                  ]
                                ).departureDate
                              : departureDate
                          ).date
                        }
                      </span>
                      <span>
                        {
                          getFormattedDate(
                            selectedContent === "multiWay"
                              ? (
                                  multiCityDestinations[
                                    multiCitySelectedIndex
                                  ] ||
                                  multiCityDestinations[
                                    multiCityDestinations.length - 1
                                  ]
                                ).departureDate
                              : departureDate
                          ).day
                        }
                      </span>
                    </div>
                  </div>
                </div>
                {selectedContent === "twoWay" ? (
                  <div
                    className={`${style.retHead} ${
                      selectedToggle === "Return" ? style.active : ""
                    }`}
                    onClick={setSelectedToggle.bind(this, "Return")}
                  >
                    Return Date
                    <div className={style.depDateDetails}>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "5px",
                        }}
                      >
                        <FontAwesomeIcon
                          icon={faCalendarDays}
                          className={style.calenderIcon}
                        />
                        <span className={style.dateHighlight}>
                          {returnDate.getDate()}
                        </span>
                        <span>
                          {returnDate.toLocaleString("default", {
                            month: "short",
                          })}
                        </span>
                        <span>{returnDate.getFullYear()}</span>
                      </div>
                    </div>
                  </div>
                ) : selectedContent !== "multiWay" ? (
                  <div
                    className={`${style.retHead} ${
                      selectedToggle === "Return" ? style.active : ""
                    }`}
                    onClick={setSelectedToggle.bind(this, "Return")}
                  >
                    {"+"} Add Return Date
                    <br />
                    <span
                      style={{ fontSize: "0.8vw" }}
                      className={style.saveMore}
                    >
                      Save more on two way trips!
                    </span>
                  </div>
                ) : null}
              </div>
              {/* calendars for dep and return */}
              <div className={style.calendars}>
                <div>
                  <Calendar
                    onChange={handleCalendarChange}
                    value={
                      selectedToggle === "Departure"
                        ? selectedContent === "multiWay"
                          ? multiCityDestinations[multiCitySelectedIndex] &&
                            multiCityDestinations[multiCitySelectedIndex]
                              .departureDate
                          : departureDate
                        : returnDate
                    }
                    onClickDay={(date) => {
                      handleToggleClick(selectedToggle)(date);
                      if (selectedContent === "multiWay") {
                        setCloseCalendarFlag(true);
                      } else if (selectedContent === "oneWay") {
                        setCloseCalendarFlag(true);
                      } else if (
                        selectedContent === "twoWay" &&
                        selectedToggle === "Return"
                      ) {
                        if (isDepartureSelected) {
                          setCloseCalendarFlag(true);
                          setIsDepartureSelected(false); 
                        }
                      }
                    }}
                    className={style.customCalendarFlights}
                    minDate={
                      selectedContent === "multiWay" &&
                      multiCitySelectedIndex !== 0
                        ? multiCityDestinations[multiCitySelectedIndex - 1] &&
                          multiCityDestinations[multiCitySelectedIndex - 1]
                            .departureDate
                        : currentDate
                    }
                    maxDate={maxDate}
                  />
                </div>
              </div>

              {/* cancel and done buttons */}
              <div className={style.endColumn}>
                <div className={style.totalDays}>
                  Total Number of Days :
                  <span style={{ color: "#028fa3" }}> 3 Days </span>
                </div>
                {/* {selectedContent !== "multiWay" && (
                  <div className={style.buttons}>
                    <button
                      className={style.doneBtn}
                      onClick={toggleBottomSheetCalender}
                    >
                      Done
                    </button>
                  </div>
                )} */}
              </div>
            </div>
          </>
        )}
      </div>
      {/* <Carousel/> */}
    </>
  );
}
