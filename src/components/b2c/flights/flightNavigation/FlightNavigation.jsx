import { useSelector, useDispatch } from "react-redux";
import "react-datepicker/dist/react-datepicker.css";
import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useRouter } from "next/router";
import style from "./../style.module.css";
import {
  faArrowRightArrowLeft,
  faLocationDot,
  faChevronDown,
  faXmark,
  faPlusCircle,
  faMinusCircle,
  faSpinner,
  faInfoCircle,
  faPlane,
  faPlaneDeparture,
} from "@fortawesome/free-solid-svg-icons";
import {
  faCalendarDays,
  faCircleUser,
} from "@fortawesome/free-regular-svg-icons";
import Calendar from "react-calendar";
import Select, { components } from "react-select";
import "react-calendar/dist/Calendar.css";
import useFlightsSearch from "@/utils/b2c/flights/b2csearch";
import {
  TRAVEL_CATEGORIES,
  FLIGHT_MAX_ADULT_SELECTION,
  FLIGHT_MIN_ADULT_SELECTION,
  CABIN_CLASS_OPTIONS,
} from "@/utils/constants";
import "react-toastify/dist/ReactToastify.css";
import showToast from "@/utils/toast";
import PortalTooltip from "@/components/corporate/Toolstip/Inpolicy/PortalTooltip";
import AsyncSelect from "react-select/async";
import { getTabSpecificData } from "@/utils/axios/axios";
import "tailwindcss/tailwind.css";
import FlightSearchProgressLoader from "@/components/corporate/Loaders/FlightSearchLoader";
export default function FlightNavigation({
  modalRef,
  updateFlights,
  toggleDropdown,
  searchReqData,
  isDropdownVisible,
  setParentLoader,
  setMulticityLoading,
  setIsDropdownVisible,
  multicityFlightsResponse,
  flightsResponse,
  option,
}) {
  const dispatch = useDispatch();
  const userDetails = useSelector((state) => state?.user?.userInfo);
  const maxAllowedTravelers = "9";
  const router = useRouter();
  const { activeTab } = router.query;
  const [activeWay, setActiveWay] = useState(1);
  const [isOpen, setIsOpen] = useState(false);
  const [isReturnOpen, setIsReturnOpen] = useState(false);
  const [departureDate, setDepartureDate] = useState(new Date());
  const [returnDate, setReturnDate] = useState(null);
  const calendarRef = useRef(null);
  const returnCalendarRef = useRef(null);
  const inputRef = useRef(null);
  const returnInputRef = useRef(null);
  const [pageLoading, setPageLoading] = useState({
    loading: false,
    progress: 0,
    message: "",
  });
  const [isHomePage, setIsHomePage] = useState(false);
  const [flightCount, setFlightCount] = useState(0);
  const [flights, setFlights] = useState([]);
  const [selectedCalendar, setSelectedCalendar] = useState(null);
  const [isButtonClicked, setIsButtonClicked] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [selectedResultFareType, setSelectedResultFareType] = useState("2");
  const {
    loading,
    searchFlight,
    search,
    handleFromDestinationChange,
    handleToDestinationChange,
    handleSelectDestination,
    matchingFromDestinations,
    matchingToDestinations,
    fromDestination,
    toDestination,
    fromCityCode,
    toCityCode,
    setFromCityCode,
    setToCityCode,
    setFromCity,
    setToCity,
    setFromDestination,
    setToDestination,
    fromCity,
    toCity,
    fetchFlightsWithRefId,
    setMultiCityDestinations,
    handleMultiCitySelectDestination,
    handleMultiCityDestinationChange,
    multiCityDestinations,

    removeCityPair,
    matchingMultiCityDestinations,
    defaultCityOptions,
    setDefaultCityOptions,
    searchDestinations,
    searchMultiCityDestinations,
    fetchDefaultCities,
  } = useFlightsSearch({ userDetails });

  const [childCount, setChildCount] = useState(0);
  const [infantsCount, setInfantsCount] = useState(0);
  const [infantError, setInfantError] = useState(false);
  const [adultsCount, setAdultsCount] = useState(1);
  const MAX_TOTAL_TRAVELERS = 9;
  const MAX_CHILDREN = 8;
  const MAX_INFANTS = 4;

  const [fromInputValue, setFromInputValue] = useState("");
  const [toInputValue, setToInputValue] = useState("");
  const [fromMultiInputValue, setFromMultiInputValue] = useState("");
  const [toMultiInputValue, setToMultiInputValue] = useState("");

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        countdropdownRef.current &&
        !countdropdownRef.current.contains(event.target)
      ) {
        setIsCountDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleIncrement = (type) => {
    if (
      type === "adults" &&
      adultsCount < FLIGHT_MAX_ADULT_SELECTION &&
      adultsCount + childCount < MAX_TOTAL_TRAVELERS
    ) {
      setAdultsCount(adultsCount + 1);
      if (infantsCount > adultsCount + 1) {
        setInfantsCount(adultsCount + 1);
        setInfantError(false);
      }
    } else if (
      type === "children" &&
      childCount < MAX_CHILDREN &&
      adultsCount + childCount < MAX_TOTAL_TRAVELERS
    ) {
      setChildCount(childCount + 1);
    } else if (
      type === "infants" &&
      infantsCount < MAX_INFANTS &&
      infantsCount < adultsCount &&
      (adultsCount > 0 || childCount > 0)
    ) {
      setInfantsCount(infantsCount + 1);
      setInfantError(false);
    } else if (type === "infants" && infantsCount >= adultsCount) {
      setInfantError(true);
      showToast(
        "info",
        "Number of infants should not exceed the number of adults"
      );
    }
  };

  const handleDecrement = (type) => {
    if (type === "adults" && adultsCount > FLIGHT_MIN_ADULT_SELECTION) {
      setAdultsCount(adultsCount - 1);
      if (infantsCount > adultsCount - 1) {
        setInfantsCount(adultsCount - 1);
        setInfantError(false);
      }
    } else if (type === "children" && childCount > 0) {
      setChildCount(childCount - 1);
    } else if (type === "infants" && infantsCount > 0) {
      setInfantsCount(infantsCount - 1);
      setInfantError(false);
    }
  };
  const toNumber = (value) => {
    if (Array.isArray(value)) {
      return Number(value[0]) || 0; // Take first element of array, convert to number
    }
    return Number(value) || 0; // Convert string or other value to number
  };
  const totalTravelers =
    toNumber(adultsCount) + toNumber(childCount) + toNumber(infantsCount);

  const [isMultiCityDropdownOpen, setIsMultiCityDropdownOpen] = useState({
    from: false,
    to: false,
  });

  const customMultiCityStyles = {
    control: (base) => ({
      ...base,
      height: isHomePage ? "4rem" : "3rem",
      width: "100%",
      paddingLeft: "2.5rem",
      borderRadius: "0.375rem",
      backgroundColor: "white",
      borderColor: "#cbd5e1",
      boxShadow: "none",
      fontSize: isHomePage ? "20px" : "14px",
      "&:hover": {
        borderColor: "#cbd5e1",
      },
      "&:focus-within": {
        boxShadow: "0 0 0 1px #0ea5e9",
        borderColor: "#0ea5e9",
      },
    }),
    placeholder: (base) => ({
      ...base,
      color: "#9ca3af",
      fontSize: isHomePage ? "20px" : "14px",
    }),
    singleValue: (base) => ({
      ...base,
      color: "#374151",
      fontWeight: 600,
      fontSize: isHomePage ? "20px" : "14px",
    }),
    input: (base) => ({
      ...base,
      padding: 0,
      margin: 0,
      fontSize: isHomePage ? "20px" : "14px",
    }),
    dropdownIndicator: (base) => ({
      ...base,
      display: "none",
    }),
    clearIndicator: (base) => ({
      ...base,
      color: "#9ca3af",
      "&:hover": {
        color: "#4b5563",
      },
      padding: "0.25rem",
    }),
    menu: (base) => ({
      ...base,
      marginTop: "0.25rem",
      border: "1px solid #cbd5e1",
      borderRadius: "0.375rem",
      boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
      zIndex: 20,
      width: window.innerWidth < 768 ? "200%" : "100%",
      backgroundColor: "white",
    }),
    menuList: (base) => ({
      ...base,
      maxHeight: "15rem",
      overflowY: "auto",
      padding: 0,
    }),
    option: (base, { isFocused }) => ({
      ...base,
      backgroundColor: isFocused ? "#f3f4f6" : "white",
      color: "black",
      padding: "0.5rem",
      cursor: "pointer",
      display: "flex",
      flexDirection: "column",
      fontSize: "14px",
    }),
  };

  const getValidValue = (value) => {
    if (!value || !value.value || !value.label) {
      console.warn(`Invalid value for option ${option}:`, value);
      return null;
    }
    return value;
  };

  const [isFlightDropdownOpen, setIsFlightDropdownOpen] = useState(false);

  const customFlightStyles = {
    control: (base) => ({
      ...base,
      height: isHomePage ? "4rem" : "3rem",
      width: "100%",
      paddingLeft: "2.5rem",
      borderRadius: "0.375rem",
      backgroundColor: "white",
      borderColor: "#cbd5e1",
      boxShadow: "none",
      fontSize: "16px",
      "&:hover": {
        borderColor: "#cbd5e1",
      },
      "&:focus-within": {
        boxShadow: "0 0 0 1px #0ea5e9",
        borderColor: "#0ea5e9",
      },
    }),
    placeholder: (base) => ({
      ...base,
      color: "#9ca3af",
      fontSize: window.innerWidth < 640 ? "12px" : "16px",
    }),
    singleValue: (base) => ({
      ...base,
      color: "#374151",
      fontWeight: 600,
      fontSize: window.innerWidth < 640 ? "11px" : "16px",
    }),
    input: (base) => ({
      ...base,
      padding: 0,
      margin: 0,
      fontSize: window.innerWidth < 640 ? "12px" : "16px",
    }),
    dropdownIndicator: (base) => ({
      ...base,
      display: "none",
    }),
    clearIndicator: (base) => ({
      ...base,
      color: "#9ca3af",
      "&:hover": {
        color: "#4b5563",
      },
      padding: "0.25rem",
    }),
    menu: (base) => ({
      ...base,
      marginTop: "0.25rem",
      border: "1px solid #cbd5e1",
      borderRadius: "0.375rem",
      boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
      zIndex: 12,
      width: "100%",
      backgroundColor: "white",
    }),
    menuList: (base) => ({
      ...base,
      maxHeight: "15rem",
      overflowY: "auto",
      padding: 0,
    }),
    option: (base, { isFocused }) => ({
      ...base,
      backgroundColor: isFocused ? "#f3f4f6" : "white",
      color: "black",
      padding: "0.5rem",
      cursor: "pointer",
      display: "flex",
      flexDirection: "column",
      fontSize: window.innerWidth < 640 ? "12px" : "14px",
    }),
  };

  // Log default options for debugging
  // console.log(
  //   "Fetched Default Cities:",
  //   defaultCityOptions.map((city) => ({
  //     label: city.label,
  //     airportName: city.airportName,
  //     countryname: city.countryname,
  //     airportCode: city.airportCode,
  //   }))
  // );
  const [isSearching, setIsSearching] = useState(false);
  const [selectedCabinClassOption, setSelectedCabinClassOption] = useState(
    CABIN_CLASS_OPTIONS[0]
  );

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showFlightSelectors, setShowFlightSelectors] = useState(false);

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isCountDropdownOpen, setIsCountDropdownOpen] = useState(false);

  const dropdownRef = useRef(null);
  const countdropdownRef = useRef(null);

  const backgroundColor = isHomePage
    ? "#f6f6f6"
    : isDropdownVisible
    ? "#f6f6f6"
    : "#FFFFFF";

  useEffect(() => {
    if (activeTab) {
      switch (activeTab.toLowerCase()) {
        case "oneway":
          setActiveWay(1);
          break;
        case "twoway":
          setActiveWay(2);
          break;
        case "multicity":
          setActiveWay(3);
          break;
        default:
          setActiveWay(1);
          break;
      }
    }
  }, [activeTab]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const isHomePage =
        window.location.pathname === "/" ||
        window.location.pathname === "/bookings";
      setIsHomePage(isHomePage);
    }
  }, [dispatch]);

  useEffect(() => {
    if (isOpen && calendarRef.current && inputRef.current) {
      const inputRect = inputRef.current.getBoundingClientRect();
      const calendarRect = calendarRef.current.getBoundingClientRect();
      const viewportWidth = window.innerWidth;

      // Calculate if calendar would overflow on right
      const overflowRight = inputRect.left + calendarRect.width > viewportWidth;

      if (overflowRight) {
        // Position calendar so it aligns with right edge of input
        calendarRef.current.style.left = `${
          inputRect.width - calendarRect.width
        }px`;
      } else {
        // Default position (left-aligned with input)
        calendarRef.current.style.left = "0";
      }
    }
  }, [isOpen]);

  // Position calendar within viewport
  useEffect(() => {
    if (isReturnOpen && returnCalendarRef.current && returnInputRef.current) {
      const inputRect = returnInputRef.current.getBoundingClientRect();
      const returnCalendarRect =
        returnCalendarRef.current.getBoundingClientRect();
      const viewportWidth = window.innerWidth;

      // Check if calendar would overflow on right side
      const overflowRight =
        inputRect.left + returnCalendarRect.width > viewportWidth;

      if (overflowRight) {
        // Position calendar so it aligns with right edge of input
        returnCalendarRef.current.style.left = `${
          inputRect.width - returnCalendarRect.width
        }px`;
        returnCalendarRef.current.style.right = "auto"; // Reset right
      } else {
        // Default position (left-aligned with input)
        returnCalendarRef.current.style.left = "0";
        returnCalendarRef.current.style.right = "auto"; // Reset right
      }

      // Check for small screens
      if (viewportWidth < 640) {
        // Tailwind's sm breakpoint is 640px
        returnCalendarRef.current.style.left = "auto"; // Reset left
        returnCalendarRef.current.style.right = "0"; // Align to the right
      }
    }
  }, [isReturnOpen]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        countdropdownRef.current &&
        !countdropdownRef.current.contains(event.target)
      ) {
        setIsCountDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Effect to manage pointer events on the body
  useEffect(() => {
    if (isButtonClicked) {
      document.body.style.pointerEvents = "none"; // Disable pointer events
    } else {
      document.body.style.pointerEvents = "auto"; // Enable pointer events
    }
    return () => {
      document.body.style.pointerEvents = "auto";
    };
  }, [isButtonClicked]);

  useEffect(() => {
    let encodedRequest = getTabSpecificData("flightRequest");
    setIsHomePage(
      window.location.pathname === "/" ||
        window.location.pathname === "/bookings"
    );

    const fetchData = async () => {
      try {
        const decodedRequest = JSON.parse(atob(encodedRequest));
        console.log("decodedRequest", decodedRequest);
        if (
          encodedRequest &&
          window.location.pathname !== "/bookings" &&
          window.location.pathname !== "/"
        ) {
          if (
            decodedRequest.searchReqData.journeyType === "1" ||
            decodedRequest.searchReqData.journeyType === "2"
          ) {
            setFromDestination(decodedRequest.selectedFromCity);
            setToDestination(decodedRequest.selectedToCity);
            setDepartureDate(
              new Date(
                decodedRequest.searchReqData.segments[0].preferredDepartureTime
              )
            );
            if (decodedRequest.searchReqData.journeyType === "2") {
              setReturnDate(
                new Date(
                  decodedRequest.searchReqData.segments[0].preferredArrivalTime
                )
              );
            }
            setAdultsCount(
              parseInt(decodedRequest?.searchReqData.adultCount || 1)
            );
            setChildCount(
              parseInt(decodedRequest.searchReqData.childCount || 0)
            );
            setInfantsCount(
              parseInt(decodedRequest.searchReqData.infantCount || 0)
            );
            setFromCityCode(decodedRequest.searchReqData.segments[0].origin);
            setToCityCode(decodedRequest.searchReqData.segments[0].destination);
            setFromCity(decodedRequest.fromCity);
            setToCity(decodedRequest.toCity);

            const updatedMultiCityDestinations = [
              {
                from: decodedRequest.selectedFromCity,
                to: decodedRequest.selectedToCity,
                toCity: decodedRequest.selectedToCity,
                fromCity: decodedRequest.selectedFromCity,
                toCityCode:
                  decodedRequest.searchReqData.segments[0].destination,
                fromCityCode: decodedRequest.searchReqData.segments[0].origin,
                departureDate: new Date(
                  decodedRequest.searchReqData.segments[0].preferredDepartureTime
                ),
              },
            ];
            setMultiCityDestinations(updatedMultiCityDestinations);
          } else if (decodedRequest.searchReqData.journeyType === "3") {
            const { multiCityDestinations } = decodedRequest;
            setFromDestination(multiCityDestinations[0].fromCity);
            setToDestination(multiCityDestinations[0].toCity);
            setDepartureDate(
              new Date(
                decodedRequest.searchReqData.segments[0].preferredDepartureTime
              )
            );
            setFromCityCode(decodedRequest.searchReqData.segments[0].origin);
            setToCityCode(decodedRequest.searchReqData.segments[0].destination);
            setFromCity(decodedRequest.fromCity);
            setToCity(decodedRequest.toCity);
            if (multiCityDestinations) {
              const updatedMultiCityDestinations = multiCityDestinations.map(
                (destination) => ({
                  ...destination,
                  departureDate: new Date(destination.departureDate),
                })
              );

              setMultiCityDestinations(updatedMultiCityDestinations);
              setFlightCount(multiCityDestinations.length);
            }
          }
          setAdultsCount(
            parseInt(decodedRequest?.searchReqData.adultCount || 1)
          );
          setChildCount(parseInt(decodedRequest.searchReqData.childCount || 0));
          setInfantsCount(
            parseInt(decodedRequest.searchReqData.infantCount || 0)
          );
          setSelectedCabinClassOption({
            value: decodedRequest.searchReqData.segments[0].flightCabinClass,
            label: decodedRequest.FlightCabinClassText,
          });
          setSelectedResultFareType(
            decodedRequest.searchReqData.resultFareType || ""
          );

          isDropdownVisible &&
            setActiveWay(
              decodedRequest.searchReqData.journeyType === "1"
                ? 1
                : decodedRequest.searchReqData.journeyType === "2"
                ? 2
                : 3
            );
        }
      } catch (error) {
        console.error("error", error);
      }
    };

    fetchData(); // Call the async function
  }, [multicityFlightsResponse, flightsResponse]);

  useEffect(() => {
    if (multiCityDestinations.length === 1) {
      multiCityDestinations.push({
        from: "",
        fromCity: "",
        fromCityCode: "",
        to: "",
        toCity: "",
        toCityCode: "",
        departureDate: multiCityDestinations[0]?.departureDate
          ? multiCityDestinations[0]?.departureDate
          : new Date(),
      });
    }
    setFlights(multiCityDestinations);
    setFlightCount(multiCityDestinations.length);
  }, [multiCityDestinations]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (calendarRef.current && !calendarRef.current.contains(event.target)) {
        setIsOpen(false);
      }
      if (
        returnCalendarRef.current &&
        !returnCalendarRef.current.contains(event.target)
      ) {
        setIsReturnOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    if (isOpen && calendarRef.current && inputRef.current) {
      const inputRect = inputRef.current.getBoundingClientRect();
      const calendarRect = calendarRef.current.getBoundingClientRect();
      const viewportWidth = window.innerWidth;

      // Calculate if calendar would overflow on right
      const overflowRight = inputRect.left + calendarRect.width > viewportWidth;

      if (overflowRight) {
        // Position calendar so it aligns with right edge of input
        calendarRef.current.style.left = `${
          inputRect.width - calendarRect.width
        }px`;
      } else {
        // Default position (left-aligned with input)
        calendarRef.current.style.left = "0";
      }
    }
  }, [isOpen]);

  // Position calendar within viewport
  useEffect(() => {
    if (isReturnOpen && returnCalendarRef.current && returnInputRef.current) {
      const inputRect = returnInputRef.current.getBoundingClientRect();
      const returnCalendarRect =
        returnCalendarRef.current.getBoundingClientRect();
      const viewportWidth = window.innerWidth;

      // Check if calendar would overflow on right side
      const overflowRight =
        inputRect.left + returnCalendarRect.width > viewportWidth;

      if (overflowRight) {
        // Position calendar so it aligns with right edge of input
        returnCalendarRef.current.style.left = `${
          inputRect.width - returnCalendarRect.width
        }px`;
        returnCalendarRef.current.style.right = "auto"; // Reset right
      } else {
        // Default position (left-aligned with input)
        returnCalendarRef.current.style.left = "0";
        returnCalendarRef.current.style.right = "auto"; // Reset right
      }

      // Check for small screens
      if (viewportWidth < 640) {
        // Tailwind's sm breakpoint is 640px
        returnCalendarRef.current.style.left = "auto"; // Reset left
        returnCalendarRef.current.style.right = "0"; // Align to the right
      }
    }
  }, [isReturnOpen]);

  const CabinClassOption = (props) => {
    const { data, isDisabled, innerProps, innerRef } = props;

    const [showTooltip, setShowTooltip] = useState(false);

    return (
      <PortalTooltip show={showTooltip && isDisabled} text="Out of policy!">
        <div
          onMouseEnter={() => {
            if (isDisabled) setShowTooltip(true);
          }}
          onMouseLeave={() => setShowTooltip(false)}
          ref={innerRef}
          {...innerProps}
          style={{
            cursor: isDisabled ? "not-allowed" : "pointer",
            // pointerEvents: isDisabled ? "none" : "auto",
            color: isDisabled ? "#999" : "#333", // Grey out if disabled
            padding: "8px 12px",
          }}
        >
          {data.label}
        </div>
      </PortalTooltip>
    );
  };

  const CustomValueContainer = ({
    children,
    getValue,
    innerRef,
    selectProps,
  }) => {
    const selectedOption = getValue()[0];

    // Detect if the device supports touch events
    const isTouchDevice =
      typeof window !== "undefined" &&
      ("ontouchstart" in window || navigator.maxTouchPoints > 0);

    const toggleMenu = (e) => {
      e.preventDefault();
      e.stopPropagation();

      // Toggle the menu state
      if (selectProps.menuIsOpen) {
        selectProps.onMenuClose?.();
      } else {
        selectProps.onMenuOpen?.();
      }
    };

    return (
      <div
        className={`w-full flex bg-[#f6f6f6] sm:bg-white rounded-xl items-center sm:h-full ${
          isHomePage ? "h-16" : "h-12"
        }`}
        onMouseDown={!isTouchDevice ? toggleMenu : undefined}
        onTouchStart={isTouchDevice ? toggleMenu : undefined}
        ref={innerRef}
      >
        <div className="flex items-center px-1 w-full">
          <span className="text-[#000000] text-xs sm:text-base ml-2 cursor-pointer">
            Cabin Class |
          </span>
          {selectedOption ? (
            <span className="ml-2 text-black text-xs sm:text-base mr-2 cursor-pointer">{` ${selectedOption.label}`}</span>
          ) : (
            <span className="ml-2 text-black text-xs sm:text-base">
              Select option
            </span>
          )}
          <FontAwesomeIcon
            icon={faChevronDown}
            color="gray"
            size="sm"
            className={selectProps.menuIsOpen ? "rotate-180" : ""}
          />
        </div>
      </div>
    );
  };

  const handleChange = (selectedOption) => {
    setSelectedCabinClassOption(selectedOption);
    setIsMenuOpen(false);
  };

  const increment = () => {
    if (maxAllowedTravelers > 1 && adultsCount < FLIGHT_MAX_ADULT_SELECTION) {
      dispatch(setAdultsCount(adultsCount + 1));
    }
  };

  const decrement = () => {
    if (adultsCount > FLIGHT_MIN_ADULT_SELECTION) {
      dispatch(setAdultsCount(adultsCount - 1));
    }
  };

  const handleSearch = async () => {
    if (setParentLoader) setParentLoader(true);
    setIsSearching(true);
    setIsButtonClicked(true);
    if (activeWay === 3 && setIsDropdownVisible) {
      setIsDropdownVisible(false);
    }
    try {
      const FlightCabinClassText = selectedCabinClassOption.label;

      let journeyType = activeWay.toString();
      const data = {
        selectedOptionCabinClass: selectedCabinClassOption.value ?? "2",
        adultsCount,
        childCount,
        infantsCount,
        // selectedTravelers: travelers,
        departureDate: new Date(departureDate.setHours(0, 0, 0, 0)),
        returnDate: new Date(returnDate?.setHours(0, 0, 0, 0)),
        journeyType,
        FlightCabinClassText,
        selectedResultFareType,
      };
      if (setMulticityLoading) setMulticityLoading(true);
      await search(data, updateFlights, setPageLoading);
    } catch (error) {
      console.log(error);
      setPageLoading({
        loading: false,
        progress: 0,
        message: "Error occurred",
      });
    } finally {
      if (setParentLoader) setParentLoader(false);
      setIsButtonClicked(false); // Reset state to enable clicks on the page
      setIsSearching(false);
    }
  };

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
    // logEvent(analytics, "fare_type", {
    //   faretype: fareType,
    // });
  };

  const handleMultiWayDates = (date) => {
    const updatedMultiCityDestinations = [...multiCityDestinations];
    updatedMultiCityDestinations[selectedCalendar].departureDate = date;

    const selectedIndexDepartureDate = date;

    // Check if the date is valid and not undefined
    if (selectedIndexDepartureDate) {
      // Iterate over the subsequent arrays starting from the index after multiCitySelectedIndex
      for (
        let i = selectedCalendar + 1;
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
    setIsOpen(false);
    setMultiCityDestinations(updatedMultiCityDestinations);
  };

  const handleDepartureSelect = useCallback(
    (date) => {
      setDepartureDate(date);
      if (activeWay === 2 && date >= returnDate) {
        const nextDay = new Date(date);
        nextDay.setDate(nextDay.getDate() + 1);
        setReturnDate(nextDay);
      }
      setIsOpen(false);
    },
    [returnDate, activeWay]
  );

  const handleReturnSelect = useCallback(
    (date) => {
      if (departureDate && date >= departureDate) {
        setReturnDate(date);
        setActiveWay(2);
        setIsReturnOpen(false);
      }
    },
    [departureDate]
  );

  // const tileDisabledDeparture = useCallback(({ date }) => {
  //   return date < new Date(new Date().setHours(0, 0, 0, 0));
  // }, []);

  // const tileDisabledReturn = useCallback(
  //   ({ date }) => {
  //     return !departureDate || date < departureDate;
  //   },
  //   [departureDate]
  // );

  // Updated tileDisabled function for departure calendar
  const tileDisabledDeparture = useCallback(({ date, view }) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // For month view - disable dates before today
    if (view === "month") {
      return date < today;
    }

    // For year view - disable years before current year
    if (view === "year") {
      return date.getFullYear() < today.getFullYear();
    }

    // For decade view - disable decades before current decade
    if (view === "decade") {
      return date.getFullYear() < today.getFullYear();
    }

    return false;
  }, []);

  // Updated tileDisabled function for return calendar
  const tileDisabledReturn = useCallback(
    ({ date, view }) => {
      if (!departureDate) return true;

      const departureDateObj = new Date(departureDate);
      departureDateObj.setHours(0, 0, 0, 0);

      // For month view - disable dates before departure date
      if (view === "month") {
        return date < departureDateObj;
      }

      // For year view - disable years before departure year
      if (view === "year") {
        return date.getFullYear() < departureDateObj.getFullYear();
      }

      // For decade view - disable decades before departure decade
      if (view === "decade") {
        return date.getFullYear() < departureDateObj.getFullYear();
      }

      return false;
    },
    [departureDate]
  );

  const formatDate = (date) => {
    return date
      ? date.toLocaleDateString("en-US", {
          year: "numeric",
          month: "short",
          day: "numeric",
        })
      : "Not selected";
  };

  const addDays = (date, days) => {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
  };

  // get screen size for mobile styling
  const useWindowSize = () => {
    const [windowSize, setWindowSize] = useState({
      width: window.innerWidth,
      height: window.innerHeight,
    });

    useEffect(() => {
      const handleResize = () => {
        setWindowSize({
          width: window.innerWidth,
          height: window.innerHeight,
        });
      };

      window.addEventListener("resize", handleResize);
      return () => window.removeEventListener("resize", handleResize);
    }, []);

    return windowSize;
  };

  const { width } = useWindowSize();

  const customStyles = {
    control: (provided, state) => ({
      ...provided,
      borderRadius: width < 640 ? "8px" : "9999px", // This makes the control rounded-full
      borderColor:
        width < 640 ? "white" : state.isFocused ? "custom-gray" : "custom-gray", // Change border color on focus
      boxShadow: state.isFocused ? "0 0 0 1px #3182ce" : "none", // Add box shadow on focus
      backgroundColor: "#ffffff",
      minWidth: "175px",
      fontSize: "8px",
      "@media (min-width: 640px)": {
        fontSize: "16px",
        minWidth: "200px", // 16px desktop
      },
    }),
    dropdownIndicator: () => ({
      display: "none",
    }),
    indicatorSeparator: () => ({
      display: "none",
    }),
    option: (provided, state) => ({
      ...provided,
      backgroundColor: state.isSelected
        ? "#028fa3"
        : state.isFocused
        ? "#028fa340"
        : null,
      color: state.isSelected ? "#ffffff" : "#28fa3",
    }),
    placeholder: (provided) => ({
      ...provided,
      color: "#000000", // Change placeholder color
    }),
  };

  // Function to determine if a tile should be disabled
  const tileDisabledMulticityDeparture = (
    { date, view },
    option,
    multiCityDestinations,
    earliestAllowedDate
  ) => {
    if (view !== "month") return false;
    const currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);

    // Disable past dates
    if (date < currentDate) {
      return true;
    }

    // For flights after the first one, check previous flight's date
    if (option > 0) {
      const prevFlightDate = new Date(
        multiCityDestinations[option - 1].departureDate
      );
      prevFlightDate.setHours(0, 0, 0, 0);

      // Create a date object for the day before the previous flight
      const dayBeforePrevFlight = new Date(prevFlightDate);
      dayBeforePrevFlight.setDate(dayBeforePrevFlight.getDate() - 1);

      // Disable dates that are before or equal to the day before previous flight date
      if (date <= dayBeforePrevFlight) {
        return true;
      }
    }

    return false;
  };

  return (
    <>
      <FlightSearchProgressLoader
        loading={isHomePage && pageLoading.loading}
        progress={pageLoading.progress}
        message={pageLoading.message}
      />
      <div className="flex flex-col">
        <div
          className={`flex-col sm:flex sm:flex-row gap-3  ${
            isHomePage ? "py-3" : "py-2"
          }`}
        >
          {/* oneway twoway multicity option ((activeWay)) */}
          <div className="flex gap-2 justify-between w-full sm:w-fit sm:justify-normal">
            <button
              className={`border text-xxs sm:text-base rounded-full flex items-center gap-1 sm:gap-2 custom-padding ${
                activeWay === 1
                  ? "border bg-[#028fa3] text-[#ffffff]"
                  : "border-0.33 border-custom-gray bg-white text-black"
              }`}
              onClick={() => {
                setActiveWay(1);
                setReturnDate(null);
              }}
            >
              {/* Radio button */}
              <span
                className={`border-[1px] w-3 h-3 sm:w-4 sm:h-4 rounded-full flex items-center justify-center ${
                  activeWay === 1
                    ? "border bg-white"
                    : "border-[#000000] bg-transparent"
                }`}
              >
                {activeWay === 1 && (
                  <svg
                    className="w-3 h-3 sm:w-5 sm:h-5 text-[#028fa3]"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M5 13l4 4L19 7"
                    ></path>
                  </svg>
                )}
              </span>
              One way
            </button>
            <button
              className={`border text-xxs sm:text-base rounded-full flex items-center gap-1 sm:gap-2 custom-padding ${
                activeWay === 2
                  ? "border bg-[#028fa3] text-[#ffffff]"
                  : "border-0.33 border-custom-gray bg-white text-black"
              }`}
              onClick={() => {
                setActiveWay(2);
                if (departureDate) {
                  setReturnDate(addDays(departureDate, 1));
                }
              }}
            >
              {/* Radio button */}
              <span
                className={`border-[1px] w-3 h-3 sm:w-4 sm:h-4 rounded-full flex items-center justify-center ${
                  activeWay === 2
                    ? "border bg-white"
                    : "border-[#000000] bg-transparent"
                }`}
              >
                {activeWay === 2 && (
                  <svg
                    className="w-3 h-3 sm:w-5 sm:h-5 text-[#028fa3]"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M5 13l4 4L19 7"
                    ></path>
                  </svg>
                )}
              </span>
              Two way
            </button>
            <button
              className={`border text-xxs sm:text-base rounded-full flex items-center gap-1 sm:gap-2 custom-padding ${
                activeWay === 3
                  ? "border bg-[#028fa3] text-[#ffffff]"
                  : "border-0.33 border-custom-gray bg-white text-black"
              }`}
              onClick={() => setActiveWay(3)}
            >
              {/* Radio button */}
              <span
                className={`border-[1px] w-3 h-3 sm:w-4 sm:h-4 rounded-full flex items-center justify-center ${
                  activeWay === 3
                    ? "border bg-white"
                    : "border-[#000000] bg-transparent"
                }`}
              >
                {activeWay === 3 && (
                  <svg
                    className="w-3 h-3 sm:w-5 sm:h-5 text-[#028fa3]"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M5 13l4 4L19 7"
                    ></path>
                  </svg>
                )}
              </span>
              Multi city
            </button>
          </div>

          {/* vertical border */}
          <div className="py-1 hidden sm:flex">
            <div className="border border-r-0"></div>
          </div>

          {/* economy class selector */}
          <div className="hidden relative sm:flex gap-1">
            <div ref={dropdownRef} className="hidden sm:block">
              <Select
                value={selectedCabinClassOption}
                onChange={handleChange}
                options={CABIN_CLASS_OPTIONS}
                placeholder="Cabin Class"
                className="rounded-full"
                styles={customStyles}
                components={{
                  // Control: CabinClassControl,
                  Option: CabinClassOption,
                  ValueContainer: CustomValueContainer,
                }}
                menuIsOpen={isMenuOpen} // Control dropdown visibility
                onMenuOpen={() => setIsMenuOpen(true)} // Open dropdown
                onMenuClose={() => setIsMenuOpen(false)} // Close dropdown
                // isOptionDisabled={isOptionDisabled}
              />
            </div>
          </div>

          <div
            className={`${
              isHomePage ? "bg-gray-100" : "bg-gray-200"
            } p-1.5 sm:p-3 rounded-full items-center ${style.companyMob} `}
          >
            <div className="flex sm:flex-row justify-between gap-1 sm:gap-2">
              <div
                className={`${
                  selectedResultFareType === "2" ? "relative" : ""
                } group border-r border-gray-300/50 pr-1.5 sm:pr-4 cursor-pointer inline-block last:border-r-0 relative`}
                onClick={() => handleFareToggle("2")}
              >
                <span
                  className={`flex items-center${
                    selectedResultFareType === "2"
                      ? "text-[#028fa3] font-bold"
                      : "text-gray-800"
                  } text-xxs sm:text-base`}
                >
                  Regular Fares
                </span>
              </div>

              <div className="relative group border-r border-gray-300/50 pr-1.5 sm:pr-4 cursor-pointer inline-block">
                <span
                  className={`text-xxs sm:text-base ${
                    selectedResultFareType === "5"
                      ? "text-[#028fa3] font-bold"
                      : "text-gray-800"
                  } flex items-center`}
                  onClick={() => handleFareToggle("5")}
                >
                  Senior
                </span>

                <div className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 bg-white border border-gray-200 shadow-lg text-[#028fa3] text-xs text-center rounded-md p-2 z-50 hidden group-hover:block whitespace-nowrap min-w-max">
                  <div className="text-left">
                    Applicable for only senior citizens above the age
                    <br />
                    of 60 years can avail of this special fare. It
                    <br />
                    is mandatory to present valid age proof at the airport.
                  </div>
                  <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-white"></div>
                </div>
              </div>

              <div className="relative group border-r border-gray-300/50 pr-1.5 sm:pr-4 inline-block cursor-pointer">
                <span
                  onClick={() => handleFareToggle("3")}
                  className={`text-xxs sm:text-base flex items-center ${
                    selectedResultFareType === "3"
                      ? "text-[#028fa3] font-bold"
                      : "text-gray-800"
                  }`}
                >
                  Student
                </span>
                <div className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 bg-white border border-gray-200 shadow-lg text-[#028fa3] text-xs text-center rounded-md p-2 z-50 hidden group-hover:block whitespace-nowrap min-w-max">
                  <div className="text-left">
                    Applicable for all students above the age of 12
                    <br />
                    years studying with a bonafide school/university.
                    <br />
                    Valid photo ID and educational institute ID card
                    <br />
                    need to be presented for verification at the airport.
                  </div>
                  <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-white"></div>
                </div>
              </div>

              <div className="relative group inline-block cursor-pointer">
                <span
                  onClick={() => handleFareToggle("4")}
                  className={`text-xxs sm:text-base flex items-center ${
                    selectedResultFareType === "4"
                      ? "text-[#028fa3] font-bold"
                      : "text-gray-800"
                  }`}
                >
                  Army Force
                </span>
                <div className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 bg-white border border-gray-200 shadow-lg text-[#028fa3] text-xs text-center rounded-md p-2 z-50 hidden group-hover:block whitespace-nowrap min-w-max">
                  <div className="text-left">
                    Applicable for all serving and retired Indian Armed
                    <br />
                    Forces and Paramilitary Forces personnel. Valid photo
                    <br />
                    ID and relevant military card need to be presented for
                    <br />
                    verification at the airport.
                  </div>
                  <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-white"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
        {activeWay !== 3 && (
          <div className="flex flex-col">
            <div className="flex flex-col sm:flex-row gap-3 py-2 min-w-full">
              {/* from and to destinations */}
              <div className="relative flex flex-col sm:flex-row items-center gap-2 w-full sm:w-6/12">
                <div
                  className={`w-full sm:w-1/2 ${isHomePage ? "h-16" : "h-12"}`}
                >
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none z-[11]">
                      <FontAwesomeIcon
                        icon={faPlane}
                        className="w-5 h-5 text-gray-500"
                      />
                    </div>
                    <AsyncSelect
                      cacheOptions
                      defaultOptions={defaultCityOptions}
                      loadOptions={(inputValue) =>
                        searchDestinations(inputValue, "from")
                      }
                      placeholder="From"
                      value={fromDestination}
                      inputValue={fromInputValue} // This preserves the typed text
                      onInputChange={(newValue, actionMeta) => {
                        console.log(
                          "onInputChange:",
                          newValue,
                          actionMeta.action
                        );

                        // ONLY update if it's actual user input, ignore blur and menu-close
                        if (actionMeta.action === "input-change") {
                          setFromInputValue(newValue);
                        }
                        // For other actions, keep the existing value (don't clear it)
                      }}
                      // onChange={(val) => handleSelectDestination("from", val)}
                      onChange={(val) => {
                        handleSelectDestination("from", val);
                        // Only clear if a value is selected
                        if (val) {
                          setFromInputValue("");
                        }
                      }}
                      // blurInputOnSelect={false}
                      // openMenuOnClick={false}
                      // tabSelectsValue={false}
                      // controlShouldRenderValue={true}
                      instanceId="flight-from"
                      isDisabled={loading}
                      isClearable
                      styles={customFlightStyles}
                      onMenuOpen={async () => {
                        if (fromInputValue.trim() !== "") {
                          const options = await searchDestinations(
                            fromInputValue,
                            "from"
                          );
                          setDefaultCityOptions(options);
                        }
                        setIsFlightDropdownOpen(true);
                      }}
                      // onMenuOpen={() => setIsFlightDropdownOpen(true)}
                      onMenuClose={() => setIsFlightDropdownOpen(false)}
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
                <div className="absolute left-[80%] sm:left-1/2 rotate-90 sm:rotate-180 sm:right-auto top-12 sm:top-auto transform -translate-x-1/2 z-10">
                  <div className="bg-white rounded-full p-1 shadow-md border border-gray-400 cursor-pointer">
                    <FontAwesomeIcon
                      icon={faArrowRightArrowLeft}
                      className="w-4 h-4 text-gray-500"
                      onClick={handleSwapDestinations}
                    />
                  </div>
                </div>

                <div
                  className={`w-full sm:w-1/2 ${isHomePage ? "h-16" : "h-12"}`}
                >
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none z-[11]">
                      <FontAwesomeIcon
                        icon={faPlane}
                        className="w-5 h-5 text-gray-500"
                      />
                    </div>
                    <AsyncSelect
                      cacheOptions
                      defaultOptions={defaultCityOptions}
                      loadOptions={(inputValue) =>
                        searchDestinations(inputValue, "to")
                      }
                      placeholder="To"
                      value={toDestination}
                      inputValue={toInputValue}
                      onInputChange={(newValue, actionMeta) => {
                        console.log(
                          "onInputChange:",
                          newValue,
                          actionMeta.action
                        );

                        // ONLY update if it's actual user input, ignore blur and menu-close
                        if (actionMeta.action === "input-change") {
                          setToInputValue(newValue);
                        }
                        // For other actions, keep the existing value (don't clear it)
                      }}
                      // onChange={(val) => handleSelectDestination("to", val)}
                      onChange={(val) => {
                        handleSelectDestination("to", val);
                        // Only clear if a value is selected
                        if (val) {
                          setToInputValue("");
                        }
                      }}
                      instanceId="flight-to"
                      isDisabled={loading}
                      isClearable
                      styles={customFlightStyles}
                      onMenuOpen={async () => {
                        if (toInputValue.trim() !== "") {
                          const options = await searchDestinations(
                            toInputValue,
                            "to"
                          );
                          setDefaultCityOptions(options);
                        }
                        setIsFlightDropdownOpen(true);
                      }}
                      // onMenuOpen={() => setIsFlightDropdownOpen(true)}
                      onMenuClose={() => setIsFlightDropdownOpen(false)}
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
              </div>

              {/* date selection */}
              <div className="w-full sm:w-4/12 flex gap-3">
                <div
                  className={`w-1/2 ${
                    isHomePage ? "h-16" : "h-12"
                  } self-center`}
                >
                  <div className="w-full h-full">
                    <div className="relative h-full">
                      <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                        <FontAwesomeIcon
                          icon={faCalendarDays}
                          className="w-3 h-3 sm:w-4 sm:h-4 text-gray-500"
                        />
                      </div>
                      <input
                        ref={inputRef}
                        value={departureDate ? formatDate(departureDate) : ""}
                        type="text"
                        readOnly
                        className={`w-full h-full ${
                          isHomePage
                            ? "bg-[#f6f6f6]"
                            : isDropdownVisible
                            ? "bg-[#f6f6f6]"
                            : "bg-white text-sm"
                        } pl-8 pr-4 py-2 text-[#000000] font-medium text-xs sm:text-base focus:bg-white rounded-xl placeholder-gray-500 cursor-pointer`}
                        placeholder="Departure"
                        onClick={() => setIsOpen(!isOpen)}
                      />
                      <div className="absolute inset-y-0 right-3 flex items-center pl-3 pointer-events-none">
                        <FontAwesomeIcon
                          icon={faChevronDown}
                          className="w-3 h-3 text-gray-500"
                        />
                      </div>
                      {isOpen && (
                        <div
                          ref={calendarRef}
                          className="absolute w-fit h-fit z-10 mt-1 bg-white shadow-lg rounded-lg"
                        >
                          <div className="w-full h-full">
                            <div className="w-full h-fit border bg-white p-3 flex gap-2 items-center rounded-xl !border-[#028fa3] ">
                              <FontAwesomeIcon
                                icon={faCalendarDays}
                                className="w-4 h-4 text-gray-500"
                              />
                              <div className="flex gap-2">
                                <div>{formatDate(departureDate)}</div>
                                {activeWay === 2 && (
                                  <div>{formatDate(returnDate)}</div>
                                )}
                              </div>
                            </div>
                            {/* calendar for desktop view */}
                            <div className="calendar-wrapper double-view hidden sm:block">
                              <Calendar
                                onChange={handleDepartureSelect}
                                value={departureDate}
                                showDoubleView={true}
                                tileDisabled={tileDisabledDeparture}
                                className="w-full"
                                next2Label={null}
                                prev2Label={null}
                              />
                            </div>
                            {/* calendar for mobile view */}
                            <div className="calendar-wrapper double-view mobile-calendar sm:hidden">
                              <Calendar
                                onChange={handleDepartureSelect}
                                value={departureDate}
                                showDoubleView={false}
                                tileDisabled={tileDisabledDeparture}
                                className="w-full"
                                next2Label={null}
                                prev2Label={null}
                              />
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                <div
                  className={`w-1/2 ${
                    isHomePage ? "h-16" : "h-12"
                  } self-center`}
                >
                  <div className="w-full h-full">
                    <div className="relative h-full">
                      <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                        <FontAwesomeIcon
                          icon={faCalendarDays}
                          className="w-3 h-3 sm:w-4 sm:h-4 text-gray-500"
                        />
                      </div>
                      <input
                        ref={returnInputRef}
                        type="text"
                        value={returnDate ? formatDate(returnDate) : ""}
                        readOnly
                        className={`w-full h-full ${
                          isHomePage
                            ? "bg-[#f6f6f6]"
                            : isDropdownVisible
                            ? "bg-[#f6f6f6]"
                            : "bg-white text-sm"
                        } pl-8 pr-4 py-2 text-[#000000] text-xs sm:text-base font-medium focus:bg-white rounded-xl placeholder-gray-500 cursor-pointer`}
                        placeholder="Return"
                        onClick={() => {
                          setIsReturnOpen(!isReturnOpen);
                          setIsOpen(false);
                        }}
                      />
                      <div className="absolute inset-y-0 right-3 flex items-center pl-3 pointer-events-none">
                        <FontAwesomeIcon
                          icon={faChevronDown}
                          className="w-3 h-3 text-gray-500"
                        />
                      </div>
                      {isReturnOpen && (
                        <div
                          ref={returnCalendarRef}
                          className="absolute w-fit h-fit z-10 mt-1 bg-white shadow-lg rounded-lg"
                        >
                          <div className="w-full h-full">
                            <div className="w-full h-fit border bg-white p-3 flex gap-2 items-center rounded-xl !border-[#028fa3] ">
                              <FontAwesomeIcon
                                icon={faCalendarDays}
                                className="w-4 h-4 text-gray-500"
                              />
                              <div className="flex gap-2">
                                <div> {formatDate(departureDate)}</div>
                                <div>{formatDate(returnDate)}</div>
                              </div>
                            </div>
                            <div className="calendar-wrapper double-view hidden sm:block">
                              <Calendar
                                onChange={handleReturnSelect}
                                value={returnDate}
                                showDoubleView={true}
                                tileDisabled={tileDisabledReturn}
                                className="w-full"
                                minDate={departureDate}
                                next2Label={null}
                                prev2Label={null}
                              />
                            </div>
                            <div className="calendar-wrapper double-view mobile-calendar sm:hidden">
                              <Calendar
                                onChange={handleReturnSelect}
                                value={returnDate}
                                showDoubleView={false}
                                tileDisabled={tileDisabledReturn}
                                className="w-full"
                                minDate={departureDate}
                                next2Label={null}
                                prev2Label={null}
                              />
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* no. of traveller selection */}
              <div className="flex sm:w-2/12 gap-3">
                {/* economy class selector */}
                <div className="flex relative sm:hidden gap-1">
                  <div ref={dropdownRef}>
                    <Select
                      value={selectedCabinClassOption}
                      onChange={handleChange}
                      options={CABIN_CLASS_OPTIONS}
                      placeholder="Cabin Class"
                      className="rounded-full"
                      styles={customStyles}
                      components={{ ValueContainer: CustomValueContainer }}
                      menuIsOpen={isMenuOpen} // Control dropdown visibility
                      onMenuOpen={() => setIsMenuOpen(true)} // Open dropdown
                      onMenuClose={() => setIsMenuOpen(false)} // Close dropdown
                    />
                  </div>
                </div>

                <div
                  className="relative w-full self-center"
                  ref={countdropdownRef}
                  onMouseEnter={() => setIsHovered(true)}
                  onMouseLeave={() => setIsHovered(false)}
                >
                  <div className="absolute inset-y-0 left-0 flex items-center pl-2 sm:pl-3 pointer-events-none">
                    <FontAwesomeIcon
                      icon={faCircleUser}
                      className="w-4 h-4 text-gray-500"
                    />
                  </div>

                  <div
                    onClick={() =>
                      maxAllowedTravelers > 1
                        ? setIsCountDropdownOpen(!isCountDropdownOpen)
                        : null
                    }
                    className={`flex items-center w-full h-16 sm:h-12 pl-7 sm:pl-10 rounded-lg border border-gray-300 bg-white ${
                      maxAllowedTravelers > 1
                        ? "cursor-pointer"
                        : "cursor-not-allowed"
                    }`}
                  >
                    <span className="text-gray-900 text-sm sm:text-base font-medium">
                      {totalTravelers}{" "}
                      {totalTravelers > 1 ? "Travellers" : "Traveller"}
                    </span>
                  </div>

                  {isCountDropdownOpen && (
                    <div className="absolute z-20 w-full mt-1 py-3 bg-white rounded-lg shadow-lg border border-gray-200">
                      {/* Adults Section */}
                      <div className="px-4 py-2">
                        <div className="flex flex-col justify-between items-center">
                          <div className="flex  items-center gap-2">
                            <span className="text-gray-900 font-medium">
                              Adults
                            </span>
                            <span className="text-gray-500 text-xs">
                              ({`>`}12 years)
                            </span>
                          </div>
                          <div className="flex items-center gap-4">
                            <button
                              onClick={() => handleDecrement("adults")}
                              className={`text-xl rounded-full hover:bg-gray-100 transition-colors ${
                                adultsCount <= FLIGHT_MIN_ADULT_SELECTION
                                  ? "text-gray-300"
                                  : "text-[#028fa3]"
                              }`}
                              disabled={
                                adultsCount <= FLIGHT_MIN_ADULT_SELECTION
                              }
                            >
                              <FontAwesomeIcon icon={faMinusCircle} size="lg" />
                            </button>
                            <span className="text-[#028fa3] text-sm min-w-[60px] text-center">
                              {adultsCount}{" "}
                              {adultsCount > 1 ? "Adults" : "Adult"}
                            </span>
                            <button
                              onClick={() => handleIncrement("adults")}
                              className={`text-xl rounded-full hover:bg-gray-100 transition-colors ${
                                adultsCount >= FLIGHT_MAX_ADULT_SELECTION ||
                                adultsCount + childCount >= MAX_TOTAL_TRAVELERS
                                  ? "text-gray-300"
                                  : "text-[#028fa3]"
                              }`}
                              disabled={
                                adultsCount >= FLIGHT_MAX_ADULT_SELECTION ||
                                adultsCount + childCount >= MAX_TOTAL_TRAVELERS
                              }
                            >
                              <FontAwesomeIcon icon={faPlusCircle} size="lg" />
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Children Section */}
                      <div className="px-4 py-2 border-t border-gray-200">
                        <div className="flex flex-col justify-between items-center">
                          <div className="flex items-center gap-2">
                            <span className="text-gray-900 font-medium">
                              Children
                            </span>
                            <span className="text-gray-500 text-xs">
                              (2 to 12 years)
                            </span>
                          </div>
                          <div className="flex items-center gap-4">
                            <button
                              onClick={() => handleDecrement("children")}
                              className={`text-xl rounded-full hover:bg-gray-100 transition-colors ${
                                childCount <= 0
                                  ? "text-gray-300"
                                  : "text-[#028fa3]"
                              }`}
                              disabled={childCount <= 0}
                            >
                              <FontAwesomeIcon icon={faMinusCircle} size="lg" />
                            </button>
                            <span className="text-[#028fa3] text-sm min-w-[60px] text-center">
                              {childCount}{" "}
                              {childCount > 1 ? "Children" : "Child"}
                            </span>
                            <button
                              onClick={() => handleIncrement("children")}
                              className={`text-xl rounded-full hover:bg-gray-100 transition-colors ${
                                childCount >= MAX_CHILDREN ||
                                adultsCount + childCount >= MAX_TOTAL_TRAVELERS
                                  ? "text-gray-300"
                                  : "text-[#028fa3]"
                              }`}
                              disabled={
                                childCount >= MAX_CHILDREN ||
                                adultsCount + childCount >= MAX_TOTAL_TRAVELERS
                              }
                            >
                              <FontAwesomeIcon icon={faPlusCircle} size="lg" />
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Infants Section */}
                      <div className="px-4 py-2 border-t border-gray-200">
                        <div className="flex flex-col justify-between items-center">
                          <div className="flex items-center gap-2">
                            <span className="text-gray-900 font-medium">
                              Infants
                            </span>
                            <span className="text-gray-500 text-xs">
                              ({`<`}2 years)
                            </span>
                          </div>
                          <div className="flex items-center gap-4">
                            <button
                              onClick={() => handleDecrement("infants")}
                              className={`text-xl rounded-full hover:bg-gray-100 transition-colors ${
                                infantsCount <= 0
                                  ? "text-gray-300"
                                  : "text-[#028fa3]"
                              }`}
                              disabled={infantsCount <= 0}
                            >
                              <FontAwesomeIcon icon={faMinusCircle} size="lg" />
                            </button>
                            <span className="text-[#028fa3] text-sm min-w-[60px] text-center">
                              {infantsCount}{" "}
                              {infantsCount > 1 ? "Infants" : "Infant"}
                            </span>
                            <button
                              onClick={() => handleIncrement("infants")}
                              className={`text-xl rounded-full hover:bg-gray-100 transition-colors ${
                                infantsCount >= MAX_INFANTS ||
                                infantsCount >= adultsCount ||
                                !(adultsCount > 0 || childCount > 0)
                                  ? "text-gray-300"
                                  : "text-[#028fa3]"
                              }`}
                              disabled={
                                infantsCount >= MAX_INFANTS ||
                                infantsCount >= adultsCount ||
                                !(adultsCount > 0 || childCount > 0)
                              }
                            >
                              <FontAwesomeIcon icon={faPlusCircle} size="lg" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {isHovered && maxAllowedTravelers <= 1 && (
                    <div className="absolute z-20 -bottom-10 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-sm px-4 py-2 rounded-lg shadow-lg">
                      <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 border-6 border-transparent border-b-gray-800" />
                      <div className="flex items-center space-x-2">
                        <FontAwesomeIcon
                          icon={faInfoCircle}
                          className="text-gray-300"
                        />
                        <span>Self-booking mode: Only you can be selected</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {!isHomePage && (
                <div className="hidden sm:block">
                  <button
                    className="bg-[#028FA326] text-[#028FA3] p-2 rounded-lg w-40 h-12 flex items-center justify-center"
                    onClick={handleSearch}
                  >
                    {loading ? (
                      <FontAwesomeIcon icon={faSpinner} spin />
                    ) : (
                      "Update Search"
                    )}
                  </button>
                </div>
              )}
            </div>

            {!isHomePage && (
              <div className="block sm:hidden">
                <button
                  className="bg-[#028FA326] text-[#028FA3] text-xs p-2 rounded-lg w-40 h-10 mt-2 m-auto flex items-center justify-center"
                  onClick={handleSearch}
                >
                  {loading ? (
                    <FontAwesomeIcon icon={faSpinner} spin />
                  ) : (
                    "Update Search"
                  )}
                </button>
              </div>
            )}
          </div>
        )}

        {/* multicity add flights */}
        {activeWay === 3 && (
          <>
            {isHomePage || isDropdownVisible === true ? (
              flights.map((flight, option) => {
                return (
                  <div
                    className="flex gap-2 sm:gap-3 py-2 min-w-full"
                    key={option}
                  >
                    {/* from and to destinations */}
                    <div className="relative flex items-center gap-2 w-9/12 sm:w-6/12">
                      <div
                        className={`w-1/2 ${
                          isHomePage ? "h-16 text-xl" : "h-12 text-sm"
                        }`}
                      >
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none z-[11]">
                            <FontAwesomeIcon
                              icon={faPlane}
                              className="w-5 h-5 text-gray-500"
                            />
                          </div>
                          <AsyncSelect
                            cacheOptions
                            defaultOptions={defaultCityOptions}
                            loadOptions={(inputValue) =>
                              searchMultiCityDestinations(
                                inputValue,
                                option,
                                "from"
                              )
                            }
                            placeholder="From"
                            value={getValidValue(
                              multiCityDestinations[option]?.from
                            )}
                            inputValue={fromMultiInputValue[option] || ""} // Get value for this specific option
                            onInputChange={(newValue, actionMeta) => {
                              console.log(
                                `onInputChange [${option}]:`,
                                newValue,
                                actionMeta.action
                              );

                              // ONLY update if it's actual user input, ignore blur and menu-close
                              if (actionMeta.action === "input-change") {
                                setFromMultiInputValue((prev) => ({
                                  ...prev,
                                  [option]: newValue, // Update only this option's value
                                }));
                              }
                            }}
                            // onChange={(val) =>
                            //   handleMultiCitySelectDestination(
                            //     option,
                            //     "from",
                            //     val
                            //   )
                            // }
                            onChange={(val) => {
                              handleMultiCitySelectDestination(
                                option,
                                "from",
                                val
                              );
                              if (val) {
                                // Clear only this option's input value
                                setFromMultiInputValue((prev) => ({
                                  ...prev,
                                  [option]: "",
                                }));
                              }
                            }}
                            instanceId={`multi-city-from-${option}`}
                            isDisabled={loading}
                            isClearable
                            styles={customMultiCityStyles}
                            // onMenuOpen={() =>
                            //   setIsMultiCityDropdownOpen((prev) => ({
                            //     ...prev,
                            //     from: true,
                            //   }))
                            // }
                            onMenuOpen={async () => {
                              const currentTypedValue =
                                fromMultiInputValue[option] || "";

                              if (currentTypedValue.trim() !== "") {
                                const options =
                                  await searchMultiCityDestinations(
                                    currentTypedValue,
                                    option,
                                    "from"
                                  );

                                // Store suggestions only for THIS row
                                setDefaultCityOptions(options);
                              }

                              setIsMultiCityDropdownOpen((prev) => ({
                                ...prev,
                                from: true,
                              }));
                            }}
                            onMenuClose={() =>
                              setIsMultiCityDropdownOpen((prev) => ({
                                ...prev,
                                from: false,
                              }))
                            }
                            formatOptionLabel={(option) => (
                              <div className="flex flex-col">
                                <div className="font-semibold text-xs sm:text-lg text-nowrap">
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

                      {/* To Input */}
                      <div
                        className={`w-1/2 ${
                          isHomePage ? "h-16 text-xl" : "h-12 text-sm"
                        }`}
                      >
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none z-[11]">
                            <FontAwesomeIcon
                              icon={faPlane}
                              randclassName="w-5 h-5 text-gray-500"
                            />
                          </div>
                          <AsyncSelect
                            cacheOptions
                            defaultOptions={defaultCityOptions}
                            loadOptions={(inputValue) =>
                              searchMultiCityDestinations(
                                inputValue,
                                option,
                                "to"
                              )
                            }
                            placeholder="To"
                            value={getValidValue(
                              multiCityDestinations[option]?.to
                            )}
                            inputValue={toMultiInputValue[option] || ""} // Get value for this specific option
                            onInputChange={(newValue, actionMeta) => {
                              console.log(
                                `onInputChange TO [${option}]:`,
                                newValue,
                                actionMeta.action
                              );

                              // ONLY update if it's actual user input
                              if (actionMeta.action === "input-change") {
                                setToMultiInputValue((prev) => ({
                                  ...prev,
                                  [option]: newValue, // Update only this option's value
                                }));
                              }
                            }}
                            onChange={(val) => {
                              handleMultiCitySelectDestination(
                                option,
                                "to",
                                val
                              );
                              if (val) {
                                // Clear only this option's input value
                                setToMultiInputValue((prev) => ({
                                  ...prev,
                                  [option]: "",
                                }));
                              }
                            }}
                            // onChange={(val) =>
                            //   handleMultiCitySelectDestination(
                            //     option,
                            //     "to",
                            //     val
                            //   )
                            // }
                            instanceId={`multi-city-to-${option}`}
                            isDisabled={loading}
                            isClearable
                            styles={customMultiCityStyles}
                            // onMenuOpen={() =>
                            //   setIsMultiCityDropdownOpen((prev) => ({
                            //     ...prev,
                            //     to: true,
                            //   }))
                            // }
                            onMenuClose={() =>
                              setIsMultiCityDropdownOpen((prev) => ({
                                ...prev,
                                to: false,
                              }))
                            }
                             onMenuOpen={async () => {
                              const currentTypedValue =
                                toMultiInputValue[option] || "";

                              if (currentTypedValue.trim() !== "") {
                                const options =
                                  await searchMultiCityDestinations(
                                    currentTypedValue,
                                    option,
                                    "to"
                                  );

                                // Store suggestions only for THIS row
                                setDefaultCityOptions(options);
                              }

                              setIsMultiCityDropdownOpen((prev) => ({
                                ...prev,
                                from: true,
                              }));
                            }}
                            formatOptionLabel={(option) => (
                              <div className="flex flex-col">
                                <div className="font-semibold text-xs sm:text-lg text-nowrap">
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
                    </div>

                    {/* date selection */}
                    <div
                      className={`w-3/12 sm:w-2/12 ${
                        isHomePage ? "h-16" : "h-12"
                      } self-center`}
                    >
                      <div className="w-full h-full">
                        <div className="relative h-full">
                          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                            <FontAwesomeIcon
                              icon={faCalendarDays}
                              className="w-3 h-3 text-gray-500"
                            />
                          </div>
                          <input
                            ref={inputRef}
                            value={formatDate(
                              multiCityDestinations[option]?.departureDate ||
                                new Date()
                            )}
                            type="text"
                            readOnly
                            className="w-full h-full text-[#000000] font-medium text-sm sm:text-base bg-[#f6f6f6] pl-8 pr-4 py-2 focus:bg-white rounded-xl placeholder-gray-500 cursor-pointer"
                            placeholder="Departure"
                            onClick={() => {
                              setSelectedCalendar(option);
                              setIsOpen(true);
                            }}
                          />
                          <div className="absolute inset-y-0 right-3 flex items-center pl-3 pointer-events-none">
                            <FontAwesomeIcon
                              icon={faChevronDown}
                              className="w-3 h-3 text-gray-500"
                            />
                          </div>
                          {isOpen && selectedCalendar === option && (
                            <div
                              ref={calendarRef}
                              className="absolute w-fit h-fit z-20 mt-1 bg-white shadow-lg rounded-lg right-0 sm:right-auto"
                            >
                              <div className="w-full h-full">
                                <div className="w-full h-fit border bg-white p-3 flex gap-2 items-center rounded-xl !border-[#028fa3] ">
                                  <FontAwesomeIcon
                                    icon={faCalendarDays}
                                    className="w-4 h-4 text-gray-500"
                                  />
                                  <div className="flex gap-2">
                                    <div>
                                      {formatDate(
                                        multiCityDestinations[option]
                                          .departureDate
                                      )}
                                    </div>
                                  </div>
                                </div>
                                <div className="hidden sm:block calendar-wrapper double-view">
                                  <Calendar
                                    onChange={handleMultiWayDates}
                                    value={formatDate(
                                      multiCityDestinations[option]
                                        .departureDate
                                    )}
                                    showDoubleView={true}
                                    tileDisabled={(params) =>
                                      tileDisabledMulticityDeparture(
                                        params,
                                        option,
                                        multiCityDestinations
                                        // earliestAllowedDate
                                      )
                                    }
                                    className="w-full"
                                    next2Label={null}
                                    prev2Label={null}
                                  />
                                </div>
                                <div className="block sm:hidden calendar-wrapper mobile-calendar double-view">
                                  <Calendar
                                    onChange={handleMultiWayDates}
                                    value={formatDate(
                                      multiCityDestinations[option]
                                        .departureDate
                                    )}
                                    showDoubleView={false}
                                    tileDisabled={(params) =>
                                      tileDisabledMulticityDeparture(
                                        params,
                                        option,
                                        multiCityDestinations
                                        // earliestAllowedDate
                                      )
                                    }
                                    className="w-full"
                                    next2Label={null}
                                    prev2Label={null}
                                  />
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* no. of traveler selection */}
                    {option == 0 && (
                      <div
                        className={`relative w-2/12 hidden sm:block ${
                          isHomePage ? "h-16" : "h-12"
                        } self-center`}
                        ref={countdropdownRef}
                        onMouseEnter={() => setIsHovered(true)}
                        onMouseLeave={() => setIsHovered(false)}
                      >
                        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                          <FontAwesomeIcon
                            icon={faCircleUser}
                            className="w-4 h-4 text-gray-500"
                          />
                        </div>

                        <div
                          onClick={() =>
                            maxAllowedTravelers > 1
                              ? setIsDropdownOpen(!isDropdownOpen)
                              : null
                          }
                          className={`flex items-center w-full h-12 pl-10 rounded-lg border border-gray-300 bg-white ${
                            maxAllowedTravelers > 1
                              ? "cursor-pointer"
                              : "cursor-not-allowed"
                          }`}
                        >
                          <span className="text-gray-900 text-base font-medium">
                            {totalTravelers}{" "}
                            {totalTravelers > 1 ? "Travellers" : "Traveller"}
                          </span>
                        </div>

                        {isDropdownOpen && (
                          <div className="absolute z-20 w-full mt-1 py-3 bg-white rounded-lg shadow-lg border border-gray-200">
                            {/* Adults Section */}
                            <div className="px-4 py-2">
                              <div className="flex flex-col justify-between items-center">
                                <div className="flex  items-center gap-2">
                                  <span className="text-gray-900 font-medium">
                                    Adults
                                  </span>
                                  <span className="text-gray-500 text-xs">
                                    ({`>`}12 years)
                                  </span>
                                </div>
                                <div className="flex items-center gap-4">
                                  <button
                                    onClick={() => handleDecrement("adults")}
                                    className={`text-xl rounded-full hover:bg-gray-100 transition-colors ${
                                      adultsCount <= FLIGHT_MIN_ADULT_SELECTION
                                        ? "text-gray-300"
                                        : "text-[#028fa3]"
                                    }`}
                                    disabled={
                                      adultsCount <= FLIGHT_MIN_ADULT_SELECTION
                                    }
                                  >
                                    <FontAwesomeIcon
                                      icon={faMinusCircle}
                                      size="lg"
                                    />
                                  </button>
                                  <span className="text-[#028fa3] text-sm min-w-[60px] text-center">
                                    {adultsCount}{" "}
                                    {adultsCount > 1 ? "Adults" : "Adult"}
                                  </span>
                                  <button
                                    onClick={() => handleIncrement("adults")}
                                    className={`text-xl rounded-full hover:bg-gray-100 transition-colors ${
                                      adultsCount >=
                                        FLIGHT_MAX_ADULT_SELECTION ||
                                      adultsCount + childCount >=
                                        MAX_TOTAL_TRAVELERS
                                        ? "text-gray-300"
                                        : "text-[#028fa3]"
                                    }`}
                                    disabled={
                                      adultsCount >=
                                        FLIGHT_MAX_ADULT_SELECTION ||
                                      adultsCount + childCount >=
                                        MAX_TOTAL_TRAVELERS
                                    }
                                  >
                                    <FontAwesomeIcon
                                      icon={faPlusCircle}
                                      size="lg"
                                    />
                                  </button>
                                </div>
                              </div>
                            </div>

                            {/* Children Section */}
                            <div className="px-4 py-2 border-t border-gray-200">
                              <div className="flex flex-col justify-between items-center">
                                <div className="flex items-center gap-2">
                                  <span className="text-gray-900 font-medium">
                                    Children
                                  </span>
                                  <span className="text-gray-500 text-xs">
                                    (2 to 12 years)
                                  </span>
                                </div>
                                <div className="flex items-center gap-4">
                                  <button
                                    onClick={() => handleDecrement("children")}
                                    className={`text-xl rounded-full hover:bg-gray-100 transition-colors ${
                                      childCount <= 0
                                        ? "text-gray-300"
                                        : "text-[#028fa3]"
                                    }`}
                                    disabled={childCount <= 0}
                                  >
                                    <FontAwesomeIcon
                                      icon={faMinusCircle}
                                      size="lg"
                                    />
                                  </button>
                                  <span className="text-[#028fa3] text-sm min-w-[60px] text-center">
                                    {childCount}{" "}
                                    {childCount > 1 ? "Children" : "Child"}
                                  </span>
                                  <button
                                    onClick={() => handleIncrement("children")}
                                    className={`text-xl rounded-full hover:bg-gray-100 transition-colors ${
                                      childCount >= MAX_CHILDREN ||
                                      adultsCount + childCount >=
                                        MAX_TOTAL_TRAVELERS
                                        ? "text-gray-300"
                                        : "text-[#028fa3]"
                                    }`}
                                    disabled={
                                      childCount >= MAX_CHILDREN ||
                                      adultsCount + childCount >=
                                        MAX_TOTAL_TRAVELERS
                                    }
                                  >
                                    <FontAwesomeIcon
                                      icon={faPlusCircle}
                                      size="lg"
                                    />
                                  </button>
                                </div>
                              </div>
                            </div>

                            {/* Infants Section */}
                            <div className="px-4 py-2 border-t border-gray-200">
                              <div className="flex flex-col justify-between items-center">
                                <div className="flex items-center gap-2">
                                  <span className="text-gray-900 font-medium">
                                    Infants
                                  </span>
                                  <span className="text-gray-500 text-xs">
                                    ({`<`}2 years)
                                  </span>
                                </div>
                                <div className="flex items-center gap-4">
                                  <button
                                    onClick={() => handleDecrement("infants")}
                                    className={`text-xl rounded-full hover:bg-gray-100 transition-colors ${
                                      infantsCount <= 0
                                        ? "text-gray-300"
                                        : "text-[#028fa3]"
                                    }`}
                                    disabled={infantsCount <= 0}
                                  >
                                    <FontAwesomeIcon
                                      icon={faMinusCircle}
                                      size="lg"
                                    />
                                  </button>
                                  <span className="text-[#028fa3] text-sm min-w-[60px] text-center">
                                    {infantsCount}{" "}
                                    {infantsCount > 1 ? "Infants" : "Infant"}
                                  </span>
                                  <button
                                    onClick={() => handleIncrement("infants")}
                                    className={`text-xl rounded-full hover:bg-gray-100 transition-colors ${
                                      infantsCount >= MAX_INFANTS ||
                                      infantsCount >= adultsCount ||
                                      !(adultsCount > 0 || childCount > 0)
                                        ? "text-gray-300"
                                        : "text-[#028fa3]"
                                    }`}
                                    disabled={
                                      infantsCount >= MAX_INFANTS ||
                                      infantsCount >= adultsCount ||
                                      !(adultsCount > 0 || childCount > 0)
                                    }
                                  >
                                    <FontAwesomeIcon
                                      icon={faPlusCircle}
                                      size="lg"
                                    />
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}

                        {isHovered && maxAllowedTravelers <= 1 && (
                          <div className="absolute z-20 -bottom-10 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-sm px-4 py-2 rounded-lg shadow-lg">
                            <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 border-6 border-transparent border-b-gray-800" />
                            <div className="flex items-center space-x-2">
                              <FontAwesomeIcon
                                icon={faInfoCircle}
                                className="text-gray-300"
                              />
                              <span>
                                Self-booking mode: Only you can be selected
                              </span>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                    {option == 0 &&
                      !isHomePage &&
                      isDropdownVisible === false && (
                        <div>
                          <button
                            className="bg-[#028FA326] text-[#028FA3] p-3 rounded-lg w-48 h-16 "
                            onClick={toggleDropdown}
                          >
                            Edit
                          </button>
                        </div>
                      )}
                    {option === flights.length - 1 && flights.length < 6 && (
                      <button
                        className="hidden w-2/12 bg-[#028FA3] text-white font-semibold sm:flex items-center justify-center rounded-lg text-sm"
                        onClick={handleAddFlight}
                      >
                        + Add Another Flight
                      </button>
                    )}

                    {flights.length > 1 && option > 1 && (
                      <button
                        className=" h-8 mt-2 w-8 bg-[#028FA30F] text-[#028FA3] font-semibold flex items-center justify-center rounded-lg"
                        onClick={() => handleRemoveFlight(flight.id, option)}
                      >
                        <FontAwesomeIcon icon={faXmark} />
                      </button>
                    )}
                  </div>
                );
              })
            ) : (
              <>
                <div className="flex gap-3 py-2 min-w-full">
                  <div className="relative flex items-center gap-2 w-5/12">
                    <div
                      className={`w-1/2 ${
                        isHomePage ? "h-16 text-xl" : "h-12 text-sm"
                      }`}
                    >
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                          <FontAwesomeIcon
                            icon={faLocationDot}
                            className="w-5 h-5 text-gray-500"
                          />
                        </div>
                        <div
                          className={`w-full h-full ${
                            isHomePage
                              ? "text-xl bg-[#f6f6f6]"
                              : "text-sm bg-white"
                          } pl-8 pr-4 py-2 focus:bg-white rounded-xl placeholder-gray-500 whitespace-nowrap overflow-hidden text-ellipsis`}
                        >
                          {multiCityDestinations[0].fromCity?.label ||
                            "Select Origin"}
                        </div>
                      </div>
                    </div>
                    <div
                      className={`w-1/2 ${
                        isHomePage ? "h-16 text-xl" : "h-12 text-sm"
                      }`}
                    >
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                          <FontAwesomeIcon
                            icon={faLocationDot}
                            className="w-5 h-5 text-gray-500"
                          />
                        </div>
                        <div
                          className={`w-full h-full ${
                            isHomePage
                              ? "text-xl bg-[#f6f6f6]"
                              : "text-sm bg-white"
                          } pl-8 pr-4 py-2 focus:bg-white rounded-xl placeholder-gray-500 whitespace-nowrap overflow-hidden text-ellipsis`}
                        >
                          {multiCityDestinations[
                            multiCityDestinations.length - 1
                          ]?.toCity?.label ||
                            multiCityDestinations[0]?.toCity?.label ||
                            "Select Destination"}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div
                    className={`w-3/12 ${
                      isHomePage ? "h-16" : "h-12"
                    } self-center flex justify-between items-baseline gap-2`}
                  >
                    <div className="relative w-1/2 bg-white flex gap-1 items-center pl-2 pr-4 py-2 rounded-xl">
                      <FontAwesomeIcon
                        icon={faCalendarDays}
                        className="w-3 h-3 text-gray-500"
                      />
                      <div className="text-sm">
                        {formatDate(multiCityDestinations[0].departureDate)}
                      </div>
                    </div>
                    <div className="relative w-1/2 bg-white flex gap-1 items-center pl-2 pr-4 py-2 rounded-xl">
                      <FontAwesomeIcon
                        icon={faCalendarDays}
                        className="w-3 h-3 text-gray-500"
                      />
                      <div className="text-sm">
                        {formatDate(
                          multiCityDestinations[
                            multiCityDestinations.length - 1
                          ].departureDate ||
                            multiCityDestinations[0].departureDate
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="w-2/12 py-2 bg-white flex gap-1 items-baseline h-fit  rounded-xl pl-3">
                    <FontAwesomeIcon
                      icon={faCircleUser}
                      className="w-3 h-3 border-gray-500"
                    />
                    <div className="text-sm">
                      {searchReqData?.corporateEmployees?.[0].label}
                      {searchReqData?.corporateEmployees?.length > 1 &&
                        `+${searchReqData?.corporateEmployees.length - 1}`}
                    </div>
                  </div>
                  <div className="w-2/12">
                    <button
                      className="bg-[#028FA326] text-[#028FA3] p-2 text-sm rounded-lg w-full"
                      onClick={toggleDropdown}
                    >
                      Edit
                    </button>
                  </div>
                </div>
              </>
            )}
          </>
        )}
        {(isHomePage || (isDropdownVisible === true && activeWay === 3)) && (
          <div className="flex flex-col">
            {/* count of travellers for mobile */}
            {activeWay === 3 && (
              <>
                <div className="flex gap-2 mt-2 sm:mt-0">
                  {/* economy class selector */}
                  <div className="flex relative sm:hidden gap-1">
                    <div ref={dropdownRef}>
                      <Select
                        value={selectedCabinClassOption}
                        onChange={handleChange}
                        options={CABIN_CLASS_OPTIONS}
                        placeholder="Cabin Class"
                        className="rounded-full"
                        styles={customStyles}
                        components={{ ValueContainer: CustomValueContainer }}
                        menuIsOpen={isMenuOpen} // Control dropdown visibility
                        onMenuOpen={() => setIsMenuOpen(true)} // Open dropdown
                        onMenuClose={() => setIsMenuOpen(false)} // Close dropdown
                      />
                    </div>
                  </div>
                  <div
                    className={`relative w-full sm:hidden ${
                      isHomePage ? "h-16" : "h-12"
                    } self-center`}
                    ref={countdropdownRef}
                    onMouseEnter={() => setIsHovered(true)} // Handle hover start
                    onMouseLeave={() => setIsHovered(false)}
                  >
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                      <FontAwesomeIcon
                        icon={faCircleUser}
                        className="w-4 h-4 text-gray-500"
                      />
                    </div>

                    <div
                      onClick={() =>
                        maxAllowedTravelers > 1
                          ? setIsCountDropdownOpen(!isDropdownOpen)
                          : null
                      }
                      className={`flex items-center w-full h-full pl-10 rounded-xl bg-[#f6f6f6] ${
                        isHomePage
                          ? "bg-[#f6f6f6]"
                          : isDropdownVisible
                          ? "bg-#f6f6f6"
                          : "bg-white"
                      } ${
                        maxAllowedTravelers > 1
                          ? "cursor-pointer"
                          : "cursor-not-allowed"
                      }`}
                    >
                      <span className="text-[#000000] font-medium text-base">
                        {adultsCount}{" "}
                        {adultsCount > 1 ? "Travellers" : "Traveller"}
                      </span>
                    </div>

                    {isHovered && maxAllowedTravelers <= 1 && (
                      <div
                        className={`absolute z-50 -bottom-12 left-[40%] -translate-x-1/2 w-max 
          transition-all duration-200 ease-in-out transform opacity-100 translate-y-0`}
                      >
                        <div className="relative bg-gray-800 text-white text-sm px-4 py-2 rounded-lg shadow-lg">
                          <div
                            className="absolute -top-2 left-1/2 -translate-x-1/2 w-0 h-0 
                        border-[6px] border-transparent border-b-gray-800"
                          ></div>
                          <div className="flex items-center space-x-2">
                            <FontAwesomeIcon
                              icon={faInfoCircle}
                              className="text-gray-300"
                            />
                            <span className="whitespace-nowrap font-medium">
                              Self-booking mode: Only you can be selected
                            </span>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Dropdown */}
                    {isCountDropdownOpen && (
                      <div className="absolute z-10 w-full mt-1 py-3 bg-white rounded-lg shadow-lg border border-gray-200">
                        <div className="flex items-center justify-center gap-4">
                          <button
                            onClick={decrement}
                            className={`text-xl rounded-full hover:bg-gray-100 transition-colors ${
                              adultsCount <= FLIGHT_MIN_ADULT_SELECTION
                                ? "text-gray-300"
                                : "text-[#028fa3]"
                            }`}
                            disabled={adultsCount <= FLIGHT_MIN_ADULT_SELECTION}
                          >
                            <FontAwesomeIcon icon={faMinusCircle} size={16} />
                          </button>

                          <span className="text-[#028fa3] text-sm min-w-[60px] text-center">
                            {adultsCount} {adultsCount > 1 ? "Adults" : "Adult"}
                          </span>

                          <button
                            onClick={increment}
                            className={`text-xl rounded-full hover:bg-gray-100 transition-colors ${
                              adultsCount >= FLIGHT_MAX_ADULT_SELECTION
                                ? "text-gray-300"
                                : "text-[#028fa3]"
                            }`}
                            disabled={adultsCount >= FLIGHT_MAX_ADULT_SELECTION}
                          >
                            <FontAwesomeIcon icon={faPlusCircle} size={16} />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}
            {/* add flight for mobile multicity */}
            <div className="sm:hidden flex w-full justify-center mt-2">
              {activeWay === 3 && (
                <>
                  {isHomePage || isDropdownVisible === true ? (
                    flights.map((flight, option) => {
                      return (
                        <div key={option}>
                          {option === flights.length - 1 &&
                            flights.length < 6 && (
                              <button
                                className="w-fit bg-[#028FA3] text-white px-2 py-2 text-nowrap font-semibold flex items-center justify-center rounded-lg text-sm"
                                onClick={handleAddFlight}
                              >
                                + Add Another Flight
                              </button>
                            )}
                        </div>
                      );
                    })
                  ) : (
                    <></>
                  )}
                </>
              )}
            </div>
            <div className="relative w-1/2 sm:w-1/4 m-auto top-[1.5rem] sm:top-[2.25rem]">
              <button
                type="submit"
                className="w-full h-12 sm:h-14 bg-[#028fa3] text-white rounded-full flex items-center justify-center"
                onClick={handleSearch}
              >
                {loading ? <FontAwesomeIcon icon={faSpinner} spin /> : "Search"}
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
