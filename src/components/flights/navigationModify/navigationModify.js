import { useEffect, useRef } from "react";
import { useState } from "react";
import styles from "./styles.module.css";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import AsyncSelectInput from "@/components/Select/AsyncSelectInput";
import AsyncSelect from "react-select/async";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faTimes,
  faSquareXmark,
  faMinus,
  faPlus,
  faCaretDown,
  faArrowRightArrowLeft,
  faPlaneDeparture,
  faXmark,
} from "@fortawesome/free-solid-svg-icons";
import "react-toastify/dist/ReactToastify.css";
import { useRouter } from "next/router";
import axios, { getTabSpecificData } from "@/utils/axios/axios";
import useFlightsSearch from "../../../../utils/flights/search";
import { toast } from "react-toastify";
import MobileBannerTabs from "@/components/bannerTabs/MobileBannerTabs";
import { logEvent } from "firebase/analytics";
import { analytics } from "../../../../utils/firebase";
import { useUserType } from "@/hooks/useUserType";
import { useSelector } from "react-redux";
import config from "@/config";
import showToast from "@/utils/toast";

const NavigationModify = ({
  updateFlights,
  defaultSelectedContent,
  setPageLoading,
  isRedirect,
  searchButtonDisabled,
  setSearchButtonDisabled,
  selectedTravelers,
  setSelectedTravelers,
  handleTravelerChange,
}) => {
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
    isMultiCityDropdownOpen,
    isMultiCitySearchOpen,
    selectedMultiCityItemIndex,
    multiCityCityCode,
    multiCityCity,
    setIsMultiCityDropdownOpen,
    setMultiCityDestinations,
    multiCityDropdownRefs,
    removeCityPair,
    defaultCityOptions,
    searchDestinations,
    setDefaultCityOptions,
    searchMultiCityDestinations,
  } = useFlightsSearch();

  const searchCrossRef = useRef(null);
  const [selectedContent, setSelectedContent] = useState(
    defaultSelectedContent || "oneWay"
  );
  const [selectedResultFareType, setSelectedResultFareType] = useState("2");
  const [flightCount, setFlightCount] = useState(0);
  const [flights, setFlights] = useState([]);
  const [showFlightSelectors, setShowFlightSelectors] = useState(false);
  const [bottomSheetFlightsVisible, setBottomSheetFlightsVisible] =
    useState(false);
  const bottomSheetFlightsRef = useRef(null);
  const [routeLoading, setRouteLoading] = useState(false);
  const router = useRouter();
  const [activeLink, setActiveLink] = useState("flights");
  const [multiCitySelectedIndex, setMultiCitySelectedIndex] = useState(0);


  const [isHomePage, setIsHomePage] = useState(false);
  const userDetails = useSelector((state) => state?.user?.userInfo);

  const customStyles = {
    control: (provided) => ({
      ...provided,
      background: "transparent",
      border: "none",
      borderBottom: "0.11px solid white",
      borderRadius: 0,
      boxShadow: "none",
      color: "#ffffff",
      fontWeight: "bold",
      fontSize: "13px",
      padding: 0,
      marginRight: "0", // Optional; remove if causing issues
      cursor: "pointer",
      width: "100%", // Full width of parent container
      maxWidth: "100%", // Prevent overflow
      minWidth: "0", // Allow shrinking if needed
      boxSizing: "border-box", // Include padding/border in width
    }),
    input: (provided) => ({
      ...provided,
      color: "#ffffff",
      width: "100%", // Ensure input stays within control
      maxWidth: "100%", // Prevent input from expanding
      minWidth: "0",
      boxSizing: "border-box",
    }),
    valueContainer: (provided) => ({
      ...provided,
      width: "100%",
      maxWidth: "100%",
      overflow: "hidden", // Prevent text from overflowing
      boxSizing: "border-box",
    }),
    placeholder: (provided) => ({
      ...provided,
      color: "#ffffff",
      fontSize: "13px",
      fontWeight: "normal",
    }),
    menu: (provided) => ({
      ...provided,
      background: "#fff",
      border: "1px solid #ccc",
      borderRadius: "4px",
      boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
      width: "300px", // Force override with !important
      minWidth: "100%", // Ensure minimum width matches parent
      maxWidth: "none", // Remove any max-width constraints
      left: "0", // Align with input
      zIndex: 1000,
      marginTop: "2px",
      position: "absolute",
      transform: "none",
      display: "block",
    }),
    menuPortal: (provided) => ({
      ...provided,
      zIndex: 1000, // Ensure portal has high z-index
    }),
    option: (provided, state) => ({
      ...provided,
      color: "#000000",
      background:
        state.isSelected || state.isFocused ? "lightgray" : "transparent",
      padding: "0.25rem",
      cursor: "pointer",
      "&:hover": {
        background: "#f9f9f9",
      },
    }),
    singleValue: (provided) => ({
      ...provided,
      color: "#ffffff",
      fontWeight: "bold",
      overflow: "hidden", // Prevent long text from expanding
      textOverflow: "ellipsis", // Truncate long text
      whiteSpace: "nowrap", // Keep text on one line
    }),
    dropdownIndicator: () => ({
      display: "none",
    }),
    clearIndicator: () => ({
      display: "none",
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

  // Load default city options
  useEffect(() => {
    const fetchDefaultCities = async () => {
      try {
        const response = await axios.get(`${config.FLIGHTS_CITY}?length=10`);
        if (
          response?.data?.status === "SUCCESS" &&
          Array.isArray(response.data.data)
        ) {
          const formattedOptions = response.data.data.map((city) => ({
            value: city.id || city._id,
            label: `${city.cityname} (${city.citycode}), ${city.countryname}`,
            airportName: city.airportName,
            airportCode: city.airportCode,
            countryname: city.countryname,
            cityData: city,
          }));
          setDefaultCityOptions(formattedOptions);
        }
      } catch (error) {
        console.error("Error fetching default cities:", error);
      }
    };
    fetchDefaultCities();
  }, []);

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

  useEffect(() => {
    if (typeof window !== "undefined") {
      setIsHomePage(window.location.pathname === "/");
    }
  }, []);
  // useEffect(() => {
  //   setPageLoading(loading);
  // }, [loading]);

  // swapping flights destinations

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
        // Decode from base64
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
          if (decodedResponse.searchReqData.journeyType === "2") {
            setReturnDate(
              new Date(
                decodedResponse.searchReqData.segments[0].preferredArrivalTime
              )
            );
          }

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
      }
    };

    fetchData(); // Call the async function
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        bottomSheetFlightsRef.current &&
        !bottomSheetFlightsRef.current.contains(event.target)
      ) {
        setBottomSheetFlightsVisible(false);
      }
    };

    document.addEventListener("click", handleClickOutside);

    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, [bottomSheetFlightsRef]);

  useEffect(() => {
    const handleResize = () => {
      multiCityDestinations.forEach((_, index) => {
        const inputRefFrom = multiCityDropdownRefs.current[index]?.from;
        const inputRefTo = multiCityDropdownRefs.current[index]?.to;

        if (inputRefFrom) {
          const dropdownFrom = inputRefFrom.nextElementSibling;
          if (dropdownFrom) {
            const { top, height } = inputRefFrom.getBoundingClientRect();
            dropdownFrom.style.top = `${window.scrollY + top + height}px`;
          }
        }

        if (inputRefTo) {
          const dropdownTo = inputRefTo.nextElementSibling;
          if (dropdownTo) {
            const { top, height } = inputRefTo.getBoundingClientRect();
            dropdownTo.style.top = `${window.scrollY + top + height}px`;
          }
        }
      });
    };

    handleResize(); // Initial position update
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [multiCityDestinations]);

  const toggleBottomSheetFlights = (e) => {
    e.stopPropagation();
    setBottomSheetFlightsVisible(!bottomSheetFlightsVisible);
  };

  // multicity adding flights buttons

  // multicity adding flights buttons
  const handleAddFlight = () => {
    setFlights((prevFlights) => [...prevFlights, { id: Date.now() }]);
    setFlightCount((prevFlightCount) => {
      const newFlightCount = prevFlightCount + 1;
      setMultiCityDestinations((prevDestinations) => {
        const updatedDestinations = [...prevDestinations];
        updatedDestinations[newFlightCount] = {
          from: null,
          fromCity: "",
          fromCityCode: "",
          to: null,
          toCity: "",
          toCityCode: "",
          departureDate:
            newFlightCount > 0 &&
            updatedDestinations[newFlightCount - 1]?.departureDate
              ? new Date(updatedDestinations[newFlightCount - 1].departureDate)
              : new Date(),
        };
        return updatedDestinations;
      });
      setIsMultiCityDropdownOpen((prev) => {
        // Ensure prev is an array; if not, initialize it
        const prevArray = Array.isArray(prev) ? prev : [];
        const updatedDropdowns = [...prevArray];
        updatedDropdowns[newFlightCount] = { from: false, to: false };
        return updatedDropdowns;
      });
      return newFlightCount;
    });
    setShowFlightSelectors(true);
    logEvent(analytics, "add_flights", {});
  };

  const handleRemoveFlight = (id, index) => {
    setFlights((prevFlights) =>
      prevFlights.filter((flight) => flight.id !== id)
    );
    setFlightCount((prevCount) => prevCount - 1);
    removeCityPair(index);
  };

  // cabin class options

  const [selectedOptionCabinClass, setselectedOptionCabinClass] = useState("1");

  const handleOptionChange = (value) => {
    setselectedOptionCabinClass(value);
  };

  // traveler selection for flights

  const [adultsCount, setAdultsCount] = useState(1);
  const [childCount, setChildCount] = useState(0);
  const [infantsCount, setInfantsCount] = useState(0);
  // a changes
  const [infantError, setInfantError] = useState(false);
  const total = adultsCount + childCount + infantsCount;
  const [travelerError, setTravelerError] = useState(false);
  const [isToastVisible, setIsToastVisible] = useState(false);

  const decreaseAdults = () => {
    if (adultsCount > 0) {
      setAdultsCount((prevCount) => prevCount - 1);
      if (infantsCount > adultsCount - 1) {
        setInfantsCount(adultsCount - 1);
      }
    }
  };

  const increaseAdults = () => {
    if (adultsCount + childCount < 9) {
      setAdultsCount((prevCount) => prevCount + 1);
    } else {
      if (adultsCount >= 9 && !isToastVisible) {
        showToast("info","Adult can't be more than 9");
        setIsToastVisible(true);

        // Reset the flag after a specific duration (e.g., 3 seconds)
        setTimeout(() => {
          setIsToastVisible(false);
        }, 6000);
      }
    }
  };

  const decreaseChild = () => {
    if (childCount > 0) {
      setChildCount((prevCount) => prevCount - 1);
    }
  };

  const increaseChild = () => {
    if (adultsCount + childCount < 9 && childCount + 1 <= 8) {
      setChildCount((prevCount) => prevCount + 1);
    } else {
      if (childCount >= 8 && !isToastVisible) {
        showToast("info","Children can't be more than 8");
        setIsToastVisible(true);

        // Reset the flag after a specific duration (e.g., 3 seconds)
        setTimeout(() => {
          setIsToastVisible(false);
        }, 6000);
      }
    }
  };

  const decreaseInfants = () => {
    if (infantsCount > 0) {
      setInfantsCount((prevCount) => prevCount - 1);
    }
  };

  const increaseInfants = () => {
    if (
      infantsCount + 1 <= 4 &&
      infantsCount + 1 <= adultsCount &&
      (adultsCount > 0 || childCount > 0)
    ) {
      setInfantsCount((prevCount) => prevCount + 1);
    } else {
      if (infantsCount + 1 > 4) {
        if (!isToastVisible) {
          showToast("info","Infants can't be more than 4");
          setIsToastVisible(true);
          // Reset the flag after a specific duration (e.g., 3 seconds)
          setTimeout(() => {
            setIsToastVisible(false);
          }, 6000);
        }
      } else {
        if (!isToastVisible) {
          showToast("info","Number of infants should not exceed the number of adult(s)");
          setIsToastVisible(true);
          // Reset the flag after a specific duration (e.g., 3 seconds)
          setTimeout(() => {
            setIsToastVisible(false);
          }, 6000);
        }
      }
    }
  };

  // a changes
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

  // calender dropdown
  const [bottomSheetCalenderOpen, setBottomSheetCalenderOpen] = useState(false);
  const [selectedToggle, setSelectedToggle] = useState(null);
  const [departureDate, setDepartureDate] = useState(new Date());
  const [returnDate, setReturnDate] = useState(new Date(Date.now() + 86400000));

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
  };

  //   date formatted

  const getFormattedDate = (date) => {
    if (date) {
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
        day: weekday,
        fullyears: fullyear,
        fulldate: frontdate,
        smallweek: weekdayShort,
      };
    }
  };

  //   highlighted date

  const handleToggleClick = (toggle, index = null) => {
    return () => {
      if (selectedContent === "oneWay" && toggle === "Return") {
        setSelectedContent("twoWay");
        setReturnDate(new Date(departureDate.getTime() + 86400000));
      }
      toggleBottomSheetCalender(toggle);
      if (index !== null) {
        setMultiCitySelectedIndex(index);
      }
    };
  };

  const toggleBottomSheetCalender = (toggle) => {
    setBottomSheetCalenderOpen(!bottomSheetCalenderOpen);
    setSelectedToggle(toggle);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (bottomSheetCalenderOpen && event.target.id === "backdrop") {
        toggleBottomSheetCalender(); // Close the calendar
      }
    };

    document.addEventListener("click", handleClickOutside);

    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, [bottomSheetCalenderOpen]);

  const handleSearch = async (journeyType = "1") => {
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
    };

    logEvent(analytics, "mobile_flights_search", {
      cabinclass: selectedOptionCabinClass,
      journeytype: journeyType,
      faretype: selectedResultFareType,
      departureDate: departureDate,
      returnDate: returnDate,
      multiCityDestinations: modifiedMultiCityDestinations,
    });

    data.departureDate.setHours(0, 0, 0, 0);
    data.returnDate?.setHours(0, 0, 0, 0);
    await search(data, updateFlights, setPageLoading);
  };

  const isLeapYear = (year) => {
    return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
  };

  const minDate = new Date();
  const currentDate = new Date();
  const maxDate = new Date(currentDate);

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

  // lock background scroll

  useEffect(() => {
    if (bottomSheetFlightsVisible) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
  }, [bottomSheetFlightsVisible]);

  useEffect(() => {
    if (bottomSheetCalenderOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
  }, [bottomSheetCalenderOpen]);

  const handleSetSelectedContent = (way) => {
    setSelectedContent(way);
    if (way === "twoWay") {
      setReturnDate(new Date(departureDate.getTime() + 86400000));
    } else {
      setReturnDate(null);
    }
  };

  const handleResultFareType = (fareType) => {
    setSelectedResultFareType(fareType);
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

  const [isFlightDropdownOpen, setIsFlightDropdownOpen] = useState(false);

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
      <div className={styles.box}>
        <div className={styles.navbox}>
          <MobileBannerTabs />

          <div
            className={`${styles.waysSelectors} ${loading && styles.disabled}`}
          >
            <button
              onClick={() => handleSetSelectedContent("oneWay")}
              className={`${styles.commonWayButtons} ${
                selectedContent === "oneWay" ? styles.selected : ""
              }`}
            >
              One Way
            </button>
            <button
              onClick={() => handleSetSelectedContent("twoWay")}
              className={`${styles.commonWayButtons} ${
                selectedContent === "twoWay" ? styles.selected : ""
              }`}
            >
              Round Trip
            </button>
            {
              <button
                onClick={() => handleSetSelectedContent("multiWay")}
                className={`${styles.commonWayButtons} ${
                  selectedContent === "multiWay" ? styles.selected : ""
                }`}
              >
                Multi-city
              </button>
            }
          </div>
          {selectedContent === "oneWay" && (
            <div
              className={`${styles.selectors} ${loading && styles.disabled}`}
            >
              <div className={`${styles.selector} ${styles.selector1}`}>
                <div className={styles.searchCross}>
                  <AsyncSelect
                    cacheOptions
                    defaultOptions={defaultCityOptions}
                    loadOptions={(inputValue) =>
                      searchDestinations(inputValue, "from")
                    }
                    placeholder="From"
                    value={fromDestination}
                    onChange={(val) => handleSelectDestination("from", val)}
                    instanceId="flight-from"
                    isDisabled={loading}
                    isClearable
                    styles={customStyles}
                    // onMenuOpen={() => {
                    //   if (defaultCityOptions.length === 0) {
                    //     fetchDefaultCities();
                    //   }
                    //   setIsFlightDropdownOpen(true);
                    // }}
                    onMenuOpen={() => setIsFlightDropdownOpen(true)}
                    onMenuClose={() => setIsFlightDropdownOpen(false)}
                    formatOptionLabel={(option) => (
                      <div className="flex flex-col">
                        <div className="font-semibold text-nowrap">
                          <FontAwesomeIcon
                            icon={faPlaneDeparture}
                            color="#155EEF"
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
              </div>

              {/* interchange toggle */}
              <div className={styles.swapIcon} onClick={handleSwapDestinations}>
                <FontAwesomeIcon
                  className={styles.interIcon}
                  icon={faArrowRightArrowLeft}
                />
              </div>

              <div className={`${styles.selector} ${styles.selector1}`}>
                <div className={styles.searchCross}>
                  <AsyncSelect
                    cacheOptions
                    defaultOptions={defaultCityOptions}
                    loadOptions={(inputValue) =>
                      searchDestinations(inputValue, "to")
                    }
                    placeholder="To"
                    value={toDestination}
                    onChange={(val) => handleSelectDestination("to", val)}
                    instanceId="flight-to"
                    isDisabled={loading}
                    isClearable
                    styles={customStyles}
                    // onMenuOpen={() => {
                    //   if (defaultCityOptions.length === 0) {
                    //     fetchDefaultCities();
                    //   }
                    //   setIsFlightDropdownOpen(true);
                    // }}
                    onMenuOpen={() => setIsFlightDropdownOpen(true)}
                    onMenuClose={() => setIsFlightDropdownOpen(false)}
                    formatOptionLabel={(option) => (
                      <div className="flex flex-col">
                        <div className="font-semibold text-nowrap">
                          <FontAwesomeIcon
                            icon={faPlaneDeparture}
                            color="#155EEF"
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
              </div>
              <div className={styles.datesRow}>
                <div
                  className={`${styles.selector} ${styles.selector2}`}
                  onClick={handleToggleClick("Departure")}
                >
                  <div>
                    <h5 className={styles.heading}>Departure Date</h5>
                    <div>
                      <span className={styles.bigFrontDate}>
                        {getFormattedDate(departureDate).fulldate}{" "}
                      </span>
                      <span style={{ color: "white" }}>
                        {getFormattedDate(departureDate).smallweek}{" "}
                      </span>
                      <span style={{ color: "white" }}>{", "}</span>
                      <span style={{ fontWeight: "300", color: "white" }}>
                        {getFormattedDate(departureDate).fullyears}{" "}
                      </span>
                    </div>
                  </div>
                </div>
                <div
                  className={`${styles.selector} ${styles.selector2}`}
                  onClick={handleToggleClick("Return")}
                >
                  <div>
                    <h5 className={styles.heading}>{"+"} Add Return Date</h5>
                    <div>
                      <span style={{ color: "#fff", fontSize: "2.8vw" }}>
                        Save more on two way trips!
                      </span>
                      <span className={styles.bigFrontDate}>
                        {/* {getFormattedDate(returnDate).fulldate}{" "} */}
                      </span>
                      <span>
                        {/* {getFormattedDate(returnDate).smallweek} */}
                      </span>
                      {/* {", "} */}
                      <span style={{ fontWeight: "300" }}>
                        {/* {getFormattedDate(returnDate).fullyears}{" "} */}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className={`${styles.selector} ${styles.selector4}`}>
                <h5 className={styles.heading}>Traveller & Class</h5>
                <div
                  className={styles.dividedropdown}
                  onClick={(e) => toggleBottomSheetFlights(e)}
                >
                  {/* {adultsCount} Adults {childCount} Children {infantsCount}{" "}
                  Infants |  */}
                  {adultsCount <= 1
                    ? `${adultsCount} Adult`
                    : `${adultsCount} Adults`}{" "}
                  {childCount <= 1
                    ? `${childCount} Child`
                    : `${childCount} Children`}{" "}
                  {infantsCount <= 1
                    ? `${infantsCount} Infant`
                    : `${infantsCount} Infants`}{" "}
                  | {"Cabin Class - "}
                  {selectedOptionCabinClass === "2"
                    ? "Economy"
                    : selectedOptionCabinClass === "3"
                    ? "Premium Economy"
                    : selectedOptionCabinClass === "4"
                    ? "Business"
                    : selectedOptionCabinClass === "6"
                    ? "First Class"
                    : selectedOptionCabinClass === "5"
                    ? "Premium Business"
                    : "Economy"}
                  <FontAwesomeIcon icon={faCaretDown} />
                </div>
              </div>
              {/* changed for oneway only */}
              <div className={styles.fareOptions}>
                <div
                  className={`${styles.fareSelectOption} ${
                    selectedResultFareType === "2" && styles.activeOption
                  }`}
                  onClick={() => handleResultFareType("2")}
                >
                  Regular Fares
                </div>
                <div
                  className={`${styles.fareSelectOption} ${
                    selectedResultFareType === "5" && styles.activeOption
                  }`}
                  onClick={() => handleResultFareType("5")}
                >
                  Senior Citizen
                  <div className={styles.tooltipcontent}>
                    Applicable for only senior citizens above the age of 60
                    years can avail of this special fare.It is mandatory to
                    present valid age proof at the airport.
                  </div>
                </div>
                <div
                  className={`${styles.fareSelectOption} ${
                    selectedResultFareType === "3" && styles.activeOption
                  }`}
                  onClick={() => handleResultFareType("3")}
                >
                  Student
                  <div
                    className={styles.tooltipcontent}
                    style={{ width: "450%" }}
                  >
                    Applicable for all students above the age of 12 years with a
                    bonafide school/university. Valid photo ID and educational
                    institute ID card need to be presented for verification at
                    the airport.
                  </div>
                </div>
                <div
                  className={`${styles.fareSelectOption} ${
                    selectedResultFareType === "4" && styles.activeOption
                  }`}
                  onClick={() => handleResultFareType("4")}
                >
                  Armed Forces
                  <div className={styles.tooltipcontent1}>
                    Applicable for all serving and retired Indian Armed Forces
                    and Paramilitary Forces personnel. Valid photo ID and
                    relevant military card need to be presented for verification
                    at the airport.
                  </div>
                </div>
              </div>
              <button
                className={styles.mobsearchButton}
                onClick={() => (loading ? null : handleSearch("1"))}
              >
                {loading ? <div className={styles.loadingSpinner} /> : "Search"}
              </button>
            </div>
          )}

          {selectedContent === "twoWay" && (
            <div
              className={`${styles.selectors} ${loading && styles.disabled}`}
            >
              <div className={`${styles.selector} ${styles.selector1}`}>
                <div className={styles.searchCross}>
                  <AsyncSelect
                    cacheOptions
                    defaultOptions={defaultCityOptions}
                    loadOptions={(inputValue) =>
                      searchDestinations(inputValue, "from")
                    }
                    placeholder="From"
                    value={fromDestination}
                    onChange={(val) => handleSelectDestination("from", val)}
                    instanceId="flight-from"
                    isDisabled={loading}
                    isClearable
                    styles={customStyles}
                    // onMenuOpen={() => {
                    //   if (defaultCityOptions.length === 0) {
                    //     fetchDefaultCities();
                    //   }
                    //   setIsFlightDropdownOpen(true);
                    // }}
                    onMenuOpen={() => setIsFlightDropdownOpen(true)}
                    onMenuClose={() => setIsFlightDropdownOpen(false)}
                    formatOptionLabel={(option) => (
                      <div className="flex flex-col">
                        <div className="font-semibold text-nowrap">
                          <FontAwesomeIcon
                            icon={faPlaneDeparture}
                            color="#155EEF"
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
              </div>
              {/* interchange toggle */}
              <div className={styles.swapIcon} onClick={handleSwapDestinations}>
                <FontAwesomeIcon
                  className={styles.interIcon}
                  icon={faArrowRightArrowLeft}
                />
              </div>
              <div className={`${styles.selector} ${styles.selector1}`}>
                <div className={styles.searchCross}>
                  <AsyncSelect
                    cacheOptions
                    defaultOptions={defaultCityOptions}
                    loadOptions={(inputValue) =>
                      searchDestinations(inputValue, "to")
                    }
                    placeholder="To"
                    value={toDestination}
                    onChange={(val) => handleSelectDestination("to", val)}
                    instanceId="flight-to"
                    isDisabled={loading}
                    isClearable
                    styles={customStyles}
                    // onMenuOpen={() => {
                    //   if (defaultCityOptions.length === 0) {
                    //     fetchDefaultCities();
                    //   }
                    //   setIsFlightDropdownOpen(true);
                    // }}
                    onMenuOpen={() => setIsFlightDropdownOpen(true)}
                    onMenuClose={() => setIsFlightDropdownOpen(false)}
                    formatOptionLabel={(option) => (
                      <div className="flex flex-col">
                        <div className="font-semibold text-nowrap">
                          <FontAwesomeIcon
                            icon={faPlaneDeparture}
                            color="#155EEF"
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
              </div>
              <div className={styles.datesRow}>
                <div
                  className={`${styles.selector} ${styles.selector2}`}
                  onClick={handleToggleClick("Departure")}
                >
                  <div>
                    <h5 className={styles.heading}>Departure Date</h5>
                    <div>
                      <span className={styles.bigFrontDate}>
                        {getFormattedDate(departureDate).fulldate}{" "}
                      </span>
                      <span style={{ color: "white" }}>
                        {getFormattedDate(departureDate).smallweek}{" "}
                      </span>
                      <span style={{ color: "white" }}>{", "}</span>
                      <span style={{ fontWeight: "300", color: "white" }}>
                        {getFormattedDate(departureDate).fullyears}{" "}
                      </span>
                    </div>
                  </div>
                </div>
                <div
                  className={`${styles.selector} ${styles.selector2}`}
                  onClick={handleToggleClick("Return")}
                >
                  <div>
                    <h5 className={styles.heading}>Return Date</h5>
                    <div>
                      <span className={styles.bigFrontDate}>
                        {getFormattedDate(returnDate).fulldate}{" "}
                      </span>
                      <span style={{ fontWeight: "300", color: "white" }}>
                        {getFormattedDate(returnDate).smallweek}
                      </span>
                      <span style={{ fontWeight: "300", color: "white" }}>
                        {", "}
                      </span>
                      <span style={{ fontWeight: "300", color: "white" }}>
                        {getFormattedDate(returnDate).fullyears}{" "}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              <div className={`${styles.selector} ${styles.selector4twoWay}`}>
                <h5 className={styles.heading}>Traveller & Class</h5>
                <div
                  className={styles.dividedropdown}
                  onClick={(e) => toggleBottomSheetFlights(e)}
                >
                  {/* {adultsCount} Adults {childCount} Children {infantsCount}{" "}
                  Infants  */}
                  {adultsCount <= 1
                    ? `${adultsCount} Adult`
                    : `${adultsCount} Adults`}{" "}
                  {childCount <= 1
                    ? `${childCount} Child`
                    : `${childCount} Children`}{" "}
                  {infantsCount <= 1
                    ? `${infantsCount} Infant`
                    : `${infantsCount} Infants`}{" "}
                  | {"Cabin Class - "}
                  {selectedOptionCabinClass === "1"
                    ? "All"
                    : selectedOptionCabinClass === "2"
                    ? "Economy"
                    : selectedOptionCabinClass === "3"
                    ? "Premium Economy"
                    : selectedOptionCabinClass === "4"
                    ? "Business"
                    : selectedOptionCabinClass === "5"
                    ? "Premium Business"
                    : "First Class"}
                  <FontAwesomeIcon icon={faCaretDown} />
                </div>
              </div>
              <div className={styles.fareOptions}>
                <div
                  className={`${styles.fareSelectOption} ${
                    selectedResultFareType === "2" && styles.activeOption
                  }`}
                  onClick={() => handleResultFareType("2")}
                >
                  Regular Fares
                </div>
                <div
                  className={`${styles.fareSelectOption} ${
                    selectedResultFareType === "5" && styles.activeOption
                  }`}
                  onClick={() => handleResultFareType("5")}
                >
                  Senior Citizen
                  <div className={styles.tooltipcontent}>
                    Applicable for only senior citizens above the age of 60
                    years can avail of this special fare.It is mandatory to
                    present valid age proof at the airport.
                  </div>
                </div>
                <div
                  className={`${styles.fareSelectOption} ${
                    selectedResultFareType === "3" && styles.activeOption
                  }`}
                  onClick={() => handleResultFareType("3")}
                >
                  Student
                  <div
                    className={styles.tooltipcontent}
                    style={{ width: "450%" }}
                  >
                    Applicable for all students above the age of 12 years with a
                    bonafide school/university. Valid photo ID and educational
                    institute ID card need to be presented for verification at
                    the airport.
                  </div>
                </div>
                <div
                  className={`${styles.fareSelectOption} ${
                    selectedResultFareType === "4" && styles.activeOption
                  }`}
                  onClick={() => handleResultFareType("4")}
                >
                  Armed Forces
                  <div className={styles.tooltipcontent1}>
                    Applicable for all serving and retired Indian Armed Forces
                    and Paramilitary Forces personnel. Valid photo ID and
                    relevant military card need to be presented for verification
                    at the airport.
                  </div>
                </div>
              </div>

              <button
                className={styles.mobsearchButton}
                onClick={() => (loading ? null : handleSearch("2"))}
              >
                {loading ? <div className={styles.loadingSpinner} /> : "Search"}
              </button>
            </div>
          )}

          {selectedContent === "multiWay" && (
            <div
              className={
                isHomePage ? styles.multiContentNav : styles.multiContentNav1
              }
            >
              <div className={styles.multiSelectorAdd}>
                <div className={`${styles.selectors} ${styles.selectorsMulti}`}>
                  <div className={`${styles.selector} ${styles.selectorMulti}`}>
                    {/* <h5 className={styles.heading}>From</h5> */}
                    <div className={styles.searchCross}>
                      <AsyncSelect
                        cacheOptions
                        defaultOptions={defaultCityOptions}
                        loadOptions={(inputValue) =>
                          searchMultiCityDestinations(inputValue, 0, "from")
                        }
                        placeholder="From"
                        value={getValidValue(multiCityDestinations[0]?.from)}
                        onChange={(selectedOption) =>
                          handleMultiCityFromDestinationChange(
                            selectedOption,
                            0
                          )
                        }
                        instanceId={`multi-city-from-0`}
                        isDisabled={loading}
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
                          <div className="flex items-start flex-col">
                            <div className="font-semibold text-nowrap">
                              <FontAwesomeIcon
                                icon={faPlaneDeparture}
                                color="#155EEF"
                                size="xs"
                                className="mr-2"
                              />
                              {option.label}
                            </div>
                            <span className="text-sm text-black text-nowrap">
                              {option.airportName}, {option.countryname} (
                              {option.airportCode})
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
                  </div>
                  <div className={`${styles.selector} ${styles.selectorMulti}`}>
                    {/* <h5 className={styles.heading}>To</h5> */}
                    <div className={styles.searchCross}>
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
                        isDisabled={loading}
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
                          <div className="flex items-start flex-col">
                            <div className="font-semibold text-nowrap">
                              <FontAwesomeIcon
                                icon={faPlaneDeparture}
                                color="#155EEF"
                                size="xs"
                                className="mr-2"
                              />
                              {option.label}
                            </div>
                            <span className="text-sm text-black text-nowrap">
                              {option.airportName}, {option.countryname} (
                              {option.airportCode})
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
                  </div>
                  <div
                    className={`${styles.selector} ${styles.selector2}`}
                    onClick={handleToggleClick("Departure", 0)}
                  >
                    <div style={{ textWrap: "nowrap" }}>
                      {/* <h5 className={styles.heading}>Departure Date</h5> */}
                      <div>
                        <span className={styles.bigFrontDate}>
                          {
                            getFormattedDate(
                              multiCityDestinations[0].departureDate
                            ).fulldate
                          }{" "}
                        </span>
                        <span style={{ fontSize: "10px", color: "white" }}>
                          {
                            getFormattedDate(
                              multiCityDestinations[0].departureDate
                            ).smallweek
                          }{" "}
                        </span>
                        <span
                          style={{
                            fontSize: "3vw",
                            fontWeight: "300",
                            color: "white",
                          }}
                        >
                          {
                            getFormattedDate(
                              multiCityDestinations[0].departureDate
                            ).fullyears
                          }{" "}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              {showFlightSelectors && (
                <>
                  {flights.map((flight, flightIndex) => {
                    const updatedIndex = flightIndex + 1;
                    return (
                      <div
                        key={flight.id}
                        className={styles.multiSelectorAddFlight}
                        style={{ position: "relative", width: "100%" }}
                      >
                        <div
                          className={`${styles.selectors} ${styles.selectorsMulti}`}
                        >
                          <div
                            className={`${styles.selector} ${styles.selectorMulti}`}
                          >
                            <div className={styles.searchCross}>
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
                                isDisabled={loading}
                                isClearable
                                styles={customStyles}
                                onMenuOpen={() =>
                                  setIsMultiCityDropdownOpen((prev) => {
                                    const updatedDropdowns = [...prev];
                                    updatedDropdowns[updatedIndex] =
                                      updatedDropdowns[updatedIndex] || {};
                                    updatedDropdowns[updatedIndex].from = true;
                                    return updatedDropdowns;
                                  })
                                }
                                onMenuClose={() =>
                                  setIsMultiCityDropdownOpen((prev) => {
                                    const updatedDropdowns = [...prev];
                                    updatedDropdowns[updatedIndex] =
                                      updatedDropdowns[updatedIndex] || {};
                                    updatedDropdowns[updatedIndex].from = false;
                                    return updatedDropdowns;
                                  })
                                }
                                formatOptionLabel={(option) => (
                                  <div className="flex items-start flex-col">
                                    <div className="font-semibold text-nowrap">
                                      <FontAwesomeIcon
                                        icon={faPlaneDeparture}
                                        color="#155EEF"
                                        size="xs"
                                        className="mr-2"
                                      />
                                      {option.label}
                                    </div>
                                    <span className="text-sm text-black text-nowrap">
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
                          </div>
                          <div
                            className={`${styles.selector} ${styles.selectorMulti}`}
                          >
                            {/* <h5 className={styles.heading}>To</h5> */}
                            <div className={styles.searchCross}>
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
                                isDisabled={loading}
                                isClearable
                                styles={customStyles}
                                onMenuOpen={() =>
                                  setIsMultiCityDropdownOpen((prev) => {
                                    const updatedDropdowns = [...prev];
                                    updatedDropdowns[updatedIndex] =
                                      updatedDropdowns[updatedIndex] || {};
                                    updatedDropdowns[updatedIndex].to = true;
                                    return updatedDropdowns;
                                  })
                                }
                                onMenuClose={() =>
                                  setIsMultiCityDropdownOpen((prev) => {
                                    const updatedDropdowns = [...prev];
                                    updatedDropdowns[updatedIndex] =
                                      updatedDropdowns[updatedIndex] || {};
                                    updatedDropdowns[updatedIndex].to = false;
                                    return updatedDropdowns;
                                  })
                                }
                                formatOptionLabel={(option) => (
                                  <div className="flex items-start flex-col">
                                    <div className="font-semibold text-nowrap">
                                      <FontAwesomeIcon
                                        icon={faPlaneDeparture}
                                        color="#155EEF"
                                        size="xs"
                                        className="mr-2"
                                      />
                                      {option.label}
                                    </div>
                                    <span className="text-sm text-black text-nowrap">
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
                          </div>
                          <div
                            className={`${styles.selector} ${styles.selector2}`}
                            onClick={handleToggleClick(
                              "Departure",
                              updatedIndex
                            )}
                          >
                            <div style={{ textWrap: "nowrap" }}>
                              <div>
                                <span className={styles.bigFrontDate}>
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
                                <span
                                  style={{ fontSize: "3vw", color: "white" }}
                                >
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
                                {", "}
                                <span
                                  style={{
                                    fontSize: "3vw",
                                    fontWeight: "300",
                                    color: "white",
                                  }}
                                >
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
                          <button
                            onClick={() =>
                              handleRemoveFlight(flight.id, updatedIndex)
                            }
                            className={styles.closeAddedFlight}
                          >
                            <FontAwesomeIcon icon={faXmark} />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </>
              )}
              <div className={`${styles.selector} ${styles.selector4Multi}`}>
                <h5 className={styles.heading}>Traveller & Class</h5>
                <div
                  className={styles.dividedropdown}
                  onClick={(e) => toggleBottomSheetFlights(e)}
                >
                  {adultsCount <= 1
                    ? `${adultsCount} Adult`
                    : `${adultsCount} Adults`}{" "}
                  {childCount <= 1
                    ? `${childCount} Child`
                    : `${childCount} Children`}{" "}
                  {infantsCount <= 1
                    ? `${infantsCount} Infant`
                    : `${infantsCount} Infants`}{" "}
                  | {"Cabin Class - "}
                  {selectedOptionCabinClass === "1"
                    ? "All"
                    : selectedOptionCabinClass === "2"
                    ? "Economy"
                    : selectedOptionCabinClass === "3"
                    ? "Premium Economy"
                    : selectedOptionCabinClass === "4"
                    ? "Business"
                    : selectedOptionCabinClass === "5"
                    ? "Premium Business"
                    : "First Class"}
                  <FontAwesomeIcon icon={faCaretDown} />
                </div>
              </div>
              <div className={styles.fareOptions}>
                <div
                  className={`${styles.fareSelectOption} ${
                    selectedResultFareType === "2" && styles.activeOption
                  }`}
                  onClick={() => handleResultFareType("2")}
                >
                  Regular Fares
                </div>
                <div
                  className={`${styles.fareSelectOption} ${
                    selectedResultFareType === "5" && styles.activeOption
                  }`}
                  onClick={() => handleResultFareType("5")}
                >
                  Senior Citizen
                  <div className={styles.tooltipcontent}>
                    Applicable for only senior citizens above the age of 60
                    years can avail of this special fare.It is mandatory to
                    present valid age proof at the airport.
                  </div>
                </div>
                <div
                  className={`${styles.fareSelectOption} ${
                    selectedResultFareType === "3" && styles.activeOption
                  }`}
                  onClick={() => handleResultFareType("3")}
                >
                  Student
                  <div
                    className={styles.tooltipcontent}
                    style={{ width: "450%" }}
                  >
                    Applicable for all students above the age of 12 years with a
                    bonafide school/university. Valid photo ID and educational
                    institute ID card need to be presented for verification at
                    the airport.
                  </div>
                </div>
                <div
                  className={`${styles.fareSelectOption} ${
                    selectedResultFareType === "4" && styles.activeOption
                  }`}
                  onClick={() => handleResultFareType("4")}
                >
                  Armed Forces
                  <div className={styles.tooltipcontent1}>
                    Applicable for all serving and retired Indian Armed Forces
                    and Paramilitary Forces personnel. Valid photo ID and
                    relevant military card need to be presented for verification
                    at the airport.
                  </div>
                </div>
              </div>
              {flightCount < 5 && (
                <button
                  className={styles.addFLightsButton}
                  onClick={() => handleAddFlight()}
                >
                  +{" "}
                  <span style={{ textDecoration: "underline" }}>
                    Add up to 6 flights
                  </span>
                </button>
              )}
              <button
                className={styles.mobsearchButtonMulti}
                onClick={() => (loading ? null : handleSearch("3"))}
              >
                {loading ? <div className={styles.loadingSpinner} /> : "Search"}
              </button>
            </div>
          )}
        </div>

        {/* bottomsheet for calender */}
        {bottomSheetCalenderOpen && (
          <>
            <div
              id="backdrop"
              className={styles.backdrop}
              onClick={toggleBottomSheetCalender}
            ></div>
            <div
              className={`${styles.bottomSheetCalender} ${
                bottomSheetCalenderOpen ? styles.open : ""
              }`}
            >
              <div className={styles.calenderHeader}>
                <h2
                  className={styles.calenderHeading}
                  style={{
                    color: "#155EEF",
                    height: "fit-content",
                  }}
                >
                  Calendar
                </h2>
                <button
                  onClick={toggleBottomSheetCalender}
                  className={styles.closeCalenderPop}
                >
                  &times;
                </button>
              </div>
              <div className={styles.selectInOutDates}>
                <div
                  className={`${styles.depDateSelect} ${
                    selectedToggle === "Departure" ? styles.active : ""
                  }`}
                  onClick={setSelectedToggle.bind(this, "Departure")}
                >
                  Departure <br />
                  <span className={styles.dateHighlight}>
                    {
                      getFormattedDate(
                        selectedContent === "multiWay"
                          ? (
                              multiCityDestinations[multiCitySelectedIndex] ||
                              multiCityDestinations[
                                multiCityDestinations.length - 1
                              ]
                            ).departureDate
                          : departureDate
                      ).date
                    }
                  </span>{" "}
                  <br />
                  <span>
                    {
                      getFormattedDate(
                        selectedContent === "multiWay"
                          ? (
                              multiCityDestinations[multiCitySelectedIndex] ||
                              multiCityDestinations[
                                multiCityDestinations.length - 1
                              ]
                            ).departureDate
                          : departureDate
                      ).day
                    }
                  </span>
                </div>
                {selectedContent === "twoWay" ? (
                  <div
                    className={`${styles.depDateSelect} ${
                      selectedToggle === "Return" ? styles.active : ""
                    }`}
                    onClick={setSelectedToggle.bind(this, "Return")}
                  >
                    Return <br />
                    <span className={styles.dateHighlight}>
                      {getFormattedDate(returnDate).date}
                    </span>{" "}
                    <br />
                    <span>{getFormattedDate(departureDate).day}</span>
                  </div>
                ) : selectedContent !== "multiWay" ? (
                  <div
                    className={`${styles.depDateSelect} ${
                      selectedToggle === "Return" ? styles.active : ""
                    }`}
                    onClick={setSelectedToggle.bind(this, "Return")}
                  >
                    {"+"} Add Return Date <br />
                    <span style={{ fontSize: "12px" }}>
                      Save more on two way trips!
                    </span>
                  </div>
                ) : null}
              </div>
              <hr style={{ color: "#155EEF" }} />

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
                onClickDay={handleToggleClick(selectedToggle)}
                className={styles.customCalendarFlights}
                minDate={
                  selectedContent === "multiWay" && multiCitySelectedIndex !== 0
                    ? multiCityDestinations[multiCitySelectedIndex - 1] &&
                      multiCityDestinations[multiCitySelectedIndex - 1]
                        .departureDate
                    : currentDate
                }
                maxDate={maxDate}
              />
              <hr style={{ color: "#155EEF" }} />
            </div>
          </>
        )}
        {bottomSheetFlightsVisible && (
          <>
            <div
              className={styles.backdrop}
              onClick={toggleBottomSheetFlights}
            ></div>
            <div
              className={styles.bottomSheetContainer}
              style={{
                height: bottomSheetFlightsVisible ? "fit-content" : "0",
                display: bottomSheetFlightsVisible ? "block" : "none",
                position: bottomSheetFlightsVisible ? "fixed" : "unset",
              }}
              ref={bottomSheetFlightsRef}
            >
              <div className={styles.bottomSheetFlightsContent}>
                <div className={styles.travelersHeadPopup}>
                  Traveler & Class
                  <FontAwesomeIcon
                    icon={faSquareXmark}
                    className={styles.closeTravelerPopIcon}
                    onClick={toggleBottomSheetFlights}
                  />
                </div>
                <div className={styles.smallHeadPop}>
                  Add number of traveler
                </div>
                <div className={styles.toggleGuests}>
                  <div className={styles.toggleHead}>
                    Adults
                    <span className={styles.addGuide}>(&gt;12 years)</span>
                  </div>
                  <div className={styles.toggleButton}>
                    <button
                      className={styles.plusButton}
                      onClick={decreaseAdults}
                    >
                      <FontAwesomeIcon
                        icon={faMinus}
                        style={{ color: " #155EEF" }}
                      />
                    </button>
                    <span className={styles.numInsideToggle} id="counterAdults">
                      {adultsCount}
                    </span>
                    <button
                      className={styles.plusButton}
                      onClick={increaseAdults}
                    >
                      <FontAwesomeIcon
                        icon={faPlus}
                        style={{ color: " #155EEF" }}
                      />
                    </button>
                  </div>
                </div>
                <div className={styles.toggleGuests}>
                  <div className={styles.toggleHead}>
                    Child
                    <span className={styles.addGuide}>(2 to 12 years)</span>
                  </div>
                  <div className={styles.toggleButton}>
                    <button
                      className={styles.plusButton}
                      onClick={decreaseChild}
                    >
                      <FontAwesomeIcon
                        icon={faMinus}
                        style={{ color: " #155EEF" }}
                      />
                    </button>
                    <span className={styles.numInsideToggle} id="counterChild">
                      {childCount}
                    </span>
                    <button
                      className={styles.plusButton}
                      onClick={increaseChild}
                    >
                      <FontAwesomeIcon
                        icon={faPlus}
                        style={{ color: " #155EEF" }}
                      />
                    </button>
                  </div>
                </div>
                <div className={styles.toggleGuests}>
                  <div className={styles.toggleHead}>
                    Infants
                    <span className={styles.addGuide}>
                      (3 days to &lt; 2 years)
                    </span>
                  </div>
                  <div className={styles.toggleButton}>
                    <button
                      className={styles.plusButton}
                      onClick={decreaseInfants}
                    >
                      <FontAwesomeIcon
                        icon={faMinus}
                        style={{ color: " #155EEF" }}
                      />
                    </button>
                    <span
                      className={styles.numInsideToggle}
                      id="counterInfants"
                    >
                      {infantsCount}
                    </span>
                    <button
                      className={styles.plusButton}
                      onClick={increaseInfants}
                    >
                      <FontAwesomeIcon
                        icon={faPlus}
                        style={{ color: " #155EEF" }}
                      />
                    </button>
                  </div>
                </div>

                <hr />

                <div className={styles.smallHeadPop}>Select Cabin Class</div>
                <div className={styles.cabinClassOptions}>
                  <div>
                    <input
                      type="radio"
                      id="all"
                      name="cabinClass"
                      value="1"
                      checked={selectedOptionCabinClass === "1"}
                      onChange={() => handleOptionChange("1")}
                    />
                    <label className={styles.cabinClassLabel} htmlFor="all">
                      All
                    </label>
                  </div>

                  <div>
                    <input
                      type="radio"
                      id="economy"
                      name="cabinClass"
                      value="2"
                      checked={selectedOptionCabinClass === "2"}
                      onChange={() => handleOptionChange("2")}
                    />
                    <label className={styles.cabinClassLabel} htmlFor="economy">
                      Economy
                    </label>
                  </div>

                  <div>
                    <input
                      type="radio"
                      id="premiumEconomy"
                      name="cabinClass"
                      value="3"
                      checked={selectedOptionCabinClass === "3"}
                      onChange={() => handleOptionChange("3")}
                    />
                    <label
                      className={styles.cabinClassLabel}
                      htmlFor="premiumEconomy"
                    >
                      Premium Economy
                    </label>
                  </div>

                  <div>
                    <input
                      type="radio"
                      id="business"
                      name="cabinClass"
                      value="4"
                      checked={selectedOptionCabinClass === "4"}
                      onChange={() => handleOptionChange("4")}
                    />
                    <label
                      className={styles.cabinClassLabel}
                      htmlFor="business"
                    >
                      Business
                    </label>
                  </div>

                  <div>
                    <input
                      type="radio"
                      id="Premium Business"
                      name="cabinClass"
                      value="5"
                      checked={selectedOptionCabinClass === "5"}
                      onChange={() => handleOptionChange("5")}
                    />
                    <label
                      className={styles.cabinClassLabel}
                      htmlFor="Premium Business"
                    >
                      Premium Business
                    </label>
                  </div>

                  <div>
                    <input
                      type="radio"
                      id="firstClass"
                      name="cabinClass"
                      value="6"
                      checked={selectedOptionCabinClass === "6"}
                      onChange={() => handleOptionChange("6")}
                    />
                    <label
                      className={styles.cabinClassLabel}
                      htmlFor="firstClass"
                    >
                      First Class
                    </label>
                  </div>
                </div>
                <div className={styles.doneButton}>
                  <button
                    onClick={toggleBottomSheetFlights}
                    className={styles.doneButtonStyle}
                  >
                    Done
                  </button>
                </div>
              </div>
            </div>
          </>
        )}
        {/* bottomsheet for travelers and cabin class ends*/}
      </div>
    </>
  );
};
export default NavigationModify;
