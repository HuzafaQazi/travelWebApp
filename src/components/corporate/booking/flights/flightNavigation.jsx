import { useSelector, useDispatch } from "react-redux";
import "react-datepicker/dist/react-datepicker.css";
import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useRouter } from "next/router";
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
import LocationInput from "../../inputFields/locationInput";
import {
  faCalendarDays,
  faCircleUser,
} from "@fortawesome/free-regular-svg-icons";
import Calendar from "react-calendar";
import Select, { components } from "react-select";
import "react-calendar/dist/Calendar.css";
import useFlightsSearch from "@/utils/flights/search";
import SelectTravellers from "../../travellers/SelectTravellers";
import {
  setAdultsCount,
  setSelectedTravelers,
} from "@/store/slices/travellersSlice";
import {
  constructOutOfPolicyEmployees,
  findTravelersMissingApproval,
  getLowestMaxCabinClass,
  getMaxAllowedTravelers,
  getMinBookingWindow,
} from "@/utils/corporate/travelPolicy";
import {
  TRAVEL_CATEGORIES,
  FLIGHT_MAX_ADULT_SELECTION,
  FLIGHT_MIN_ADULT_SELECTION,
  CABIN_CLASS_OPTIONS,
} from "@/utils/constants";
import OutOfPolicy from "../../common/OutOfPolicy";
import showToast from "@/utils/toast";
import PortalTooltip from "@/components/corporate/Toolstip/Inpolicy/PortalTooltip";
import AsyncSelect from "react-select/async";
import { getTabSpecificData } from "@/utils/axios/axios";
import FlightSearchLoader from "../../Loaders/FlightSearchLoader";

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
  const { adultsCount, travelersByCategory } = useSelector(
    (state) => state.travellers
  );
  const userDetails = useSelector((state) => state?.user?.userInfo);
  const travelPolicy = userDetails?.loggedInDetails?.travelPolicy?.[0];
  const policyConfigData = travelPolicy?.policyConfigData || [];

  // if maxAllowedTravelers = 1 then self book else book for others
  const maxAllowedTravelers = getMaxAllowedTravelers(
    policyConfigData,
    TRAVEL_CATEGORIES.FLIGHTS
  );

  const selectedFlightTravelers = useMemo(
    () => travelersByCategory?.[TRAVEL_CATEGORIES.FLIGHTS] || [],
    [travelersByCategory]
  );

  const groupMinWindow = useMemo(() => {
    return getMinBookingWindow(
      selectedFlightTravelers,
      TRAVEL_CATEGORIES.FLIGHTS
    );
  }, [selectedFlightTravelers]);

  // Calculate earliest allowed booking date = today + groupMinWindow days
  const earliestAllowedDate = useMemo(() => {
    const dt = new Date();
    dt.setHours(0, 0, 0, 0);
    dt.setDate(dt.getDate() + groupMinWindow);
    return dt;
  }, [groupMinWindow]);

  const nextLowestRank = useMemo(() => {
    return getLowestMaxCabinClass(selectedFlightTravelers);
    // e.g. if nextLowestRank = 3 => "Business" is allowed,
    // so classes with id=1 or 2 (Economy, Premium) are also allowed
  }, [selectedFlightTravelers]);

  const outOfPolicyMap = useMemo(() => {
    const map = {};
    CABIN_CLASS_OPTIONS.forEach((cabin) => {
      const outOfPolicy = findTravelersMissingApproval(
        {
          corporateEmployees: selectedFlightTravelers,
          flightCabinClass: cabin.label, // e.g. "Economy", "Business"
        },
        TRAVEL_CATEGORIES.FLIGHTS
      );
      if (outOfPolicy) {
        map[cabin.value] = cabin.id > nextLowestRank;
      }
      // map[cabin.value] = outOfPolicy;
    });
    return map;
  }, [selectedFlightTravelers, nextLowestRank]);

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
  const [travelers, setTravelers] = useState([]);
  // const [pageLoading, setPageLoading] = useState(false);

  const [isSearching, setIsSearching] = useState(false); // NEW: Only for active searches

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

  const {
    loading,
    searchFlight,
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

  const [fromInputValue, setFromInputValue] = useState("");
  const [toInputValue, setToInputValue] = useState("");
  const [fromMultiInputValue, setFromMultiInputValue] = useState("");
  const [toMultiInputValue, setToMultiInputValue] = useState("");

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

  // Log default options and multiCityDestinations for debugging
  // console.log(
  //   `MultiCity[${option}] Default Cities:`,
  //   defaultCityOptions.map((city) => ({
  //     label: city.label,
  //     airportName: city.airportName,
  //     countryname: city.countryname,
  //     airportCode: city.airportCode,
  //   }))
  // );
  // console.log(`MultiCity[${option}] Destinations:`, multiCityDestinations[option]);

  // Validate AsyncSelect value
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
      fontSize: "16px",
    }),
    singleValue: (base) => ({
      ...base,
      color: "#374151",
      fontWeight: 600,
      fontSize: "16px",
    }),
    input: (base) => ({
      ...base,
      padding: 0,
      margin: 0,
      fontSize: "16px",
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
      fontSize: "14px",
    }),
  };

  // Log default options for debugging
  console.log(
    "Fetched Default Cities:",
    defaultCityOptions.map((city) => ({
      label: city.label,
      airportName: city.airportName,
      countryname: city.countryname,
      airportCode: city.airportCode,
    }))
  );

  const [selectedCabinClassOption, setSelectedCabinClassOption] = useState(
    CABIN_CLASS_OPTIONS[0]
  );
  const [isCabinOutOfPolicy, setIsCabinOutOfPolicy] = useState(false);

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
    // Set the active tab based on the query parameter
    if (activeTab) {
      switch (activeTab.toLowerCase()) {
        case "oneway":
          setActiveWay(1); // Set to 1 for oneWay
          break;
        case "twoway":
          setActiveWay(2); // Set to 2 for twoWay
          break;
        case "multicity":
          setActiveWay(3); // Set to 3 for multiCity
          break;
        default:
          setActiveWay(1); // Default to 1 (oneWay) if activeTab is invalid
          break;
      }
    }
  }, [activeTab]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const isHomePage =
        window.location.pathname === "/corporate/auth/booking" ||
        window.location.pathname === "/";
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

    // Cleanup function to reset pointer events
    return () => {
      document.body.style.pointerEvents = "auto";
    };
  }, [isButtonClicked]);

  useEffect(() => {
    let encodedRequest = getTabSpecificData("flightRequest");

    // Immediately set homepage state - don't wait
    setIsHomePage(
      window.location.pathname === "/corporate/auth/booking" ||
        window.location.pathname === "/"
    );

    // Early return for homepage - no processing needed
    if (
      !encodedRequest ||
      window.location.pathname === "/corporate/auth/booking" ||
      window.location.pathname === "/"
    ) {
      return;
    }

    // Show progress immediately
    // setPageLoading({
    //   loading: true,
    //   progress: 10,
    //   message: "Loading flight data...",
    // });

    // Process data asynchronously to avoid blocking UI
    const processFlightData = async () => {
      try {
        const decodedRequest = JSON.parse(atob(encodedRequest));

        // Use setTimeout to yield control back to main thread
        setTimeout(async () => {
          // BATCH 1: Process basic journey data (fast operations)
          // setPageLoading({
          //   loading: true,
          //   progress: 30,
          //   message: "Processing destinations...",
          // });

          if (
            decodedRequest.searchReqData.journeyType === "1" ||
            decodedRequest.searchReqData.journeyType === "2"
          ) {
            // Group related operations
            const segment = decodedRequest.searchReqData.segments[0];
            const journeyType = decodedRequest.searchReqData.journeyType;

            // Batch state updates using React 18's automatic batching
            setFromDestination(decodedRequest.selectedFromCity);
            setToDestination(decodedRequest.selectedToCity);
            setFromCityCode(segment.origin);
            setToCityCode(segment.destination);
            setFromCity(decodedRequest.fromCity);
            setToCity(decodedRequest.toCity);
            setDepartureDate(new Date(segment.preferredDepartureTime));

            if (journeyType === "2") {
              setReturnDate(new Date(segment.preferredArrivalTime));
            }

            // Multi-city setup
            setMultiCityDestinations([
              {
                from: decodedRequest.selectedFromCity,
                to: decodedRequest.selectedToCity,
                toCity: decodedRequest.selectedToCity,
                fromCity: decodedRequest.selectedFromCity,
                toCityCode: segment.destination,
                fromCityCode: segment.origin,
                departureDate: new Date(segment.preferredDepartureTime),
              },
            ]);

            setActiveWay(journeyType === "1" ? 1 : 2);
          } else if (decodedRequest.searchReqData.journeyType === "3") {
            // BATCH 2: Process multi-city data in next tick
            setTimeout(() => {
              // setPageLoading({
              //   loading: true,
              //   progress: 60,
              //   message: "Processing multi-city routes...",
              // });

              const { multiCityDestinations } = decodedRequest;
              const segment = decodedRequest.searchReqData.segments[0];

              setFromDestination(multiCityDestinations[0].fromCity);
              setToDestination(multiCityDestinations[0].toCity);
              setDepartureDate(new Date(segment.preferredDepartureTime));
              setFromCityCode(segment.origin);
              setToCityCode(segment.destination);
              setFromCity(decodedRequest.fromCity);
              setToCity(decodedRequest.toCity);
              setActiveWay(3);

              if (multiCityDestinations) {
                // Process multi-city destinations in chunks
                const processMultiCityAsync = async () => {
                  const CHUNK_SIZE = 3; // Process 3 destinations at a time
                  const results = [];

                  for (
                    let i = 0;
                    i < multiCityDestinations.length;
                    i += CHUNK_SIZE
                  ) {
                    const chunk = multiCityDestinations.slice(
                      i,
                      i + CHUNK_SIZE
                    );

                    // Process chunk
                    const processedChunk = chunk.map((destination) => ({
                      ...destination,
                      departureDate: new Date(destination.departureDate),
                    }));

                    results.push(...processedChunk);

                    // Update partial results immediately
                    setMultiCityDestinations([...results]);

                    // Update progress
                    const progress =
                      60 + (i / multiCityDestinations.length) * 20;
                    // setPageLoading({
                    //   loading: true,
                    //   progress,
                    //   message: `Processing route ${i + 1} of ${
                    //     multiCityDestinations.length
                    //   }...`,
                    // });

                    // Yield control to main thread between chunks
                    await new Promise((resolve) => setTimeout(resolve, 0));
                  }

                  setFlightCount(results.length);
                };

                processMultiCityAsync();
              }
            }, 0);
          }

          // BATCH 3: Process travelers and cabin class in next tick
          setTimeout(() => {
            // setPageLoading({
            //   loading: true,
            //   progress: 90,
            //   message: "Setting up travelers...",
            // });

            setTravelers(decodedRequest.corporateEmployees);

            // Batch Redux dispatches
            dispatch(
              setSelectedTravelers({
                travelers: decodedRequest?.corporateEmployees ?? [],
                category: "2",
              })
            );
            dispatch(
              setAdultsCount(
                parseInt(decodedRequest?.corporateEmployees?.length ?? 0)
              )
            );

            setSelectedCabinClassOption({
              value: decodedRequest.searchReqData.segments[0].flightCabinClass,
              label: decodedRequest.FlightCabinClassText,
            });

            const selectedContent =
              isDropdownVisible &&
              setActiveWay(
                decodedRequest.searchReqData.journeyType === "1"
                  ? 1
                  : decodedRequest.searchReqData.journeyType === "2"
                  ? 2
                  : 3
              );

            // Clear loading state
            // setTimeout(() => {
            //   setPageLoading({
            //     loading: false,
            //     progress: 100,
            //     message: "Complete!",
            //   });
            // }, 200);
          }, 10);
        }, 0); // First setTimeout - yields immediately
      } catch (error) {
        console.error("Error processing flight data:", error);
        // setPageLoading({
        //   loading: false,
        //   progress: 0,
        //   message: "Error loading data",
        // });
      }
    };

    // Use requestIdleCallback for better performance
    if (window.requestIdleCallback) {
      window.requestIdleCallback(processFlightData, { timeout: 2000 });
    } else {
      processFlightData(); // Fallback for older browsers
    }
  }, [multicityFlightsResponse, flightsResponse, dispatch]);

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

  useEffect(() => {
    // If the user has already picked a class, check if it’s above nextLowestRank
    if (selectedCabinClassOption?.id > nextLowestRank) {
      setIsCabinOutOfPolicy(true);
    } else {
      setIsCabinOutOfPolicy(false);
    }
  }, [selectedCabinClassOption, nextLowestRank]);

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

  const CabinClassControl = (props) => {
    const { data, isDisabled, innerProps, innerRef } = props;

    const [showTooltip, setShowTooltip] = useState(false);

    return (
      <PortalTooltip show={showTooltip && isDisabled} text="Out of policy!">
        <div
          onMouseEnter={() => {
            if (isDisabled) setShowTooltip(true);
          }}
          onMouseLeave={() => setShowTooltip(false)}
          style={{
            // if it's out-of-policy, disable pointer events:
            pointerEvents: isDisabled ? "none" : "auto",
            cursor: isDisabled ? "not-allowed" : "pointer",
          }}
        >
          <components.Control {...props}>{props.children}</components.Control>
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
    const isOutOfPolicySendApproval = outOfPolicyMap[selectedOption.value];
    if (isOutOfPolicySendApproval) {
      showToast("error", "This cabin class is out of policy");
      return;
    }
    setSelectedCabinClassOption(selectedOption);
    setIsMenuOpen(false);
  };

  const isOptionDisabled = (option) => {
    return outOfPolicyMap[option.value] === true;
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
    // 1) Enforce earliestAllowedDate for single/two‐way
    if (activeWay === 1 || activeWay === 2) {
      if (departureDate && departureDate < earliestAllowedDate) {
        showToast(
          "error",
          `Departure date is out of policy. You must book at least ${groupMinWindow} day(s) in advance.`
        );
        return;
      }
      if (activeWay === 2 && returnDate && returnDate < earliestAllowedDate) {
        showToast(
          "error",
          `Return date is out of policy. You must book at least ${groupMinWindow} day(s) in advance.`
        );
        return;
      }

      // If the departure date is after the return date => block or auto‐adjust as you do
      if (
        activeWay === 2 &&
        departureDate &&
        returnDate &&
        departureDate > returnDate
      ) {
        showToast(
          "error",
          "Return date cannot be before the departure date."
        );
        return;
      }
    }

    // 2) For multi‐city
    if (activeWay === 3) {
      for (let i = 0; i < multiCityDestinations.length; i++) {
        const seg = multiCityDestinations[i];
        if (!seg.departureDate) {
          showToast("error", `Please select a date for segment #${i + 1}.`);
          return;
        }
        // earliestAllowedDate check
        if (seg.departureDate < earliestAllowedDate) {
          showToast(
            "error",
            `Segment #${
              i + 1
            } date is out of policy. Must book at least ${groupMinWindow} day(s) in advance.`
          );
          return;
        }
        // Also ensure each segment is not before the previous segment
        if (i > 0) {
          const prevSeg = multiCityDestinations[i - 1];
          if (seg.departureDate < prevSeg.departureDate) {
            showToast(
              "error",
              `Segment #${i + 1} date cannot be earlier than segment #${i}.`
            );
            return;
          }
        }
      }
    }

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
        selectedTravelers: travelers,
        departureDate: new Date(departureDate.setHours(0, 0, 0, 0)),
        returnDate: new Date(returnDate?.setHours(0, 0, 0, 0)),
        journeyType,
        FlightCabinClassText,
      };
      if (setMulticityLoading) setMulticityLoading(true);
      await searchFlight(data, updateFlights, setPageLoading);
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

  const handleMultiWayDates = (date) => {
    if (date < earliestAllowedDate) {
      showToast(
        "error",
        `This date is out of policy. You must book at least ${groupMinWindow} day(s) in advance.`
      );
      return;
    }

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
      if (date < earliestAllowedDate) {
        showToast(
          "error",
          `This date is out of policy. You must book at least ${groupMinWindow} day(s) in advance.`
        );
        return;
      }
      setDepartureDate(date);
      if (activeWay === 2 && date >= returnDate) {
        const nextDay = new Date(date);
        nextDay.setDate(nextDay.getDate() + 1);
        setReturnDate(nextDay);
      }
      setIsOpen(false);
    },
    [returnDate, activeWay, earliestAllowedDate, groupMinWindow]
  );

  const handleReturnSelect = useCallback(
    (date) => {
      if (date < earliestAllowedDate) {
        showToast(
          "error",
          `This date is out of policy. You must book at least ${groupMinWindow} day(s) in advance.`
        );
        return;
      }
      if (departureDate && date >= departureDate) {
        setReturnDate(date);
        setActiveWay(2);
        setIsReturnOpen(false);
      }
    },
    [departureDate, groupMinWindow, earliestAllowedDate]
  );

  const tileDisabledDeparture = useCallback(({ date }) => {
    return date < new Date(new Date().setHours(0, 0, 0, 0));
  }, []);

  const tileDisabledReturn = useCallback(
    ({ date }) => {
      return !departureDate || date < departureDate;
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
      minWidth: "200px",
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
        ? "#155EEF"
        : state.isFocused
        ? "#155EEF40"
        : null,
      color: state.isSelected ? "#ffffff" : "#28fa3",
    }),
    placeholder: (provided) => ({
      ...provided,
      color: "#000000", // Change placeholder color
    }),
  };

  // Helper function to check if a date is before another date
  const isDateBefore = (date1, date2) => {
    return new Date(date1).getTime() < new Date(date2).getTime();
  };

  // Function to determine if a tile should be disabled
  const tileDisabledMulticityDeparture = (
    { date, view },
    option,
    multiCityDestinations,
    earliestAllowedDate
  ) => {
    if (view !== "month") return false;

    // if (date < earliestAllowedDate) {
    //   return true;
    // }

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

  // const customStyles = {
  //   control: (provided, state) => ({
  //     ...provided,
  //     borderRadius: "9999px", // This makes the control rounded-full
  //     borderColor: state.isFocused ? "custom-gray" : "custom-gray", // Change border color on focus
  //     boxShadow: state.isFocused ? "0 0 0 1px #3182ce" : "none", // Add box shadow on focus
  //     backgroundColor: "#ffffff",
  //     minWidth: "200px",
  //   }),
  //   dropdownIndicator: () => ({
  //     display: "none",
  //   }),
  //   indicatorSeparator: () => ({
  //     display: "none",
  //   }),
  //   option: (provided, state) => ({
  //     ...provided,
  //     backgroundColor: state.isSelected
  //       ? "#155EEF"
  //       : state.isFocused
  //       ? "#155EEF40"
  //       : null,
  //     color: state.isSelected ? "#ffffff" : "#28fa3",
  //   }),
  //   placeholder: (provided) => ({
  //     ...provided,
  //     color: "#000000", // Change placeholder color
  //   }),
  // };

  const outOfPolicyLabel = isCabinOutOfPolicy && (
    <OutOfPolicy
      outOfPolicyTravelers={constructOutOfPolicyEmployees(
        {
          corporateEmployees: selectedFlightTravelers || [],
          flightCabinClass: selectedCabinClassOption?.label,
        },
        TRAVEL_CATEGORIES.FLIGHTS
      )}
      badgeClassName="text-[#E53944] text-sm sm:text-xxs absolute text-nowrap font-medium items-center bg-[#FBE2E3] rounded-xl w-fit px-2 py-1 sm:py-0 hidden sm:flex gap-1"
    />
  );

  return (
    <>
      <FlightSearchLoader
        loading={isHomePage && pageLoading.loading}
        progress={pageLoading.progress}
        message={pageLoading.message}
      />
      <div className="flex flex-col">
        <div className={`flex gap-1 sm:gap-3 ${isHomePage ? "py-3" : "py-2"}`}>
          {/* oneway twoway multicity option ((activeWay)) */}
          <div className="flex gap-2 justify-between w-full sm:w-fit sm:justify-normal">
            <button
              className={`border text-xs sm:text-base rounded-full flex items-center gap-2 custom-padding ${
                activeWay === 1
                  ? "border bg-[#155EEF] text-[#ffffff]"
                  : "border-0.33 border-custom-gray bg-white text-black"
              }`}
              onClick={() => {
                setActiveWay(1);
                setReturnDate(null);
              }}
            >
              {/* Radio button */}
              <span
                className={`border-[1px] w-4 h-4 rounded-full flex items-center justify-center ${
                  activeWay === 1
                    ? "border bg-white"
                    : "border-[#000000] bg-transparent"
                }`}
              >
                {activeWay === 1 && (
                  <svg
                    className="w-5 h-5 text-[#155EEF]"
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
              className={`border text-xs sm:text-base rounded-full flex items-center gap-2 custom-padding ${
                activeWay === 2
                  ? "border bg-[#155EEF] text-[#ffffff]"
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
                className={`border-[1px] w-4 h-4 rounded-full flex items-center justify-center ${
                  activeWay === 2
                    ? "border bg-white"
                    : "border-[#000000] bg-transparent"
                }`}
              >
                {activeWay === 2 && (
                  <svg
                    className="w-5 h-5 text-[#155EEF]"
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
              className={`border text-xs sm:text-base rounded-full flex items-center gap-2 custom-padding ${
                activeWay === 3
                  ? "border bg-[#155EEF] text-[#ffffff]"
                  : "border-0.33 border-custom-gray bg-white text-black"
              }`}
              onClick={() => setActiveWay(3)}
            >
              {/* Radio button */}
              <span
                className={`border-[1px] w-4 h-4 rounded-full flex items-center justify-center ${
                  activeWay === 3
                    ? "border bg-white"
                    : "border-[#000000] bg-transparent"
                }`}
              >
                {activeWay === 3 && (
                  <svg
                    className="w-5 h-5 text-[#155EEF]"
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
                isOptionDisabled={isOptionDisabled}
              />
            </div>

            {outOfPolicyLabel}
          </div>
        </div>
        {activeWay !== 3 && (
          <div className="flex flex-col">
            <div className="flex flex-col sm:flex-row gap-3 py-2 min-w-full">
              {/* from and to destinations */}
              <div className="relative flex flex-col sm:flex-row items-center gap-2 w-full sm:w-6/12">
                {/* <div
                  className={`w-full sm:w-1/2 ${isHomePage ? "h-16" : "h-12"}`}
                >
                  <LocationInput
                    placeholder="From"
                    handleFromDestinationChange={handleFromDestinationChange}
                    handleToDestinationChange={handleToDestinationChange}
                    handleSelectDestination={handleSelectDestination}
                    matchingFromDestinations={matchingFromDestinations}
                    matchingToDestinations={matchingToDestinations}
                    fromDestination={fromDestination}
                    toDestination={toDestination}
                    onSelect={(selection) => {}}
                    activeWay={activeWay}
                    isHomePage={isHomePage}
                    isDropdownVisible={isDropdownVisible}
                  />
                </div> */}
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
                      // onChange={(val) => handleSelectDestination("from", val)}
                      instanceId="flight-from"
                      isDisabled={loading}
                      isClearable
                      styles={customFlightStyles}
                      // onMenuOpen={() => {
                      //   if (defaultCityOptions.length === 0) {
                      //     fetchDefaultCities();
                      //   }
                      //   setIsFlightDropdownOpen(true);
                      // }}
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
                  {/* <div className="text-red-500 text-xs mt-1">
                    {!fromDestination && "Please select a departure city"}
                  </div> */}
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
                {/* <div
                  className={`w-full sm:w-1/2 ${isHomePage ? "h-16" : "h-12"}`}
                >
                  <LocationInput
                    placeholder="To"
                    handleFromDestinationChange={handleFromDestinationChange}
                    handleToDestinationChange={handleToDestinationChange}
                    handleSelectDestination={handleSelectDestination}
                    matchingFromDestinations={matchingFromDestinations}
                    matchingToDestinations={matchingToDestinations}
                    fromDestination={fromDestination}
                    toDestination={toDestination}
                    activeWay={activeWay}
                    isHomePage={isHomePage}
                    isDropdownVisible={isDropdownVisible}
                  />
                </div> */}

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
                      // onChange={(val) => handleSelectDestination("to", val)}
                      instanceId="flight-to"
                      isDisabled={loading}
                      isClearable
                      styles={customFlightStyles}
                      // onMenuOpen={() => {
                      //   if (defaultCityOptions.length === 0) {
                      //     fetchDefaultCities();
                      //   }
                      //   setIsFlightDropdownOpen(true);
                      // }}
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
                  {/* <div className="text-red-500 text-xs mt-1">
                    {!toDestination && "Please select an arrival city"}
                  </div> */}
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
                          className="w-4 h-4 text-gray-500"
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
                        } pl-8 pr-4 py-2 text-[#000000] font-medium text-base focus:bg-white rounded-xl placeholder-gray-500 cursor-pointer`}
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
                            <div className="w-full h-fit border bg-white p-3 flex gap-2 items-center rounded-xl !border-[#155EEF] ">
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
                            <div className="calendar-wrapper double-view sm:hidden">
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
                          className="w-4 h-4 text-gray-500"
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
                        } pl-8 pr-4 py-2 text-[#000000] text-base font-medium focus:bg-white rounded-xl placeholder-gray-500 cursor-pointer`}
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
                            <div className="w-full h-fit border bg-white p-3 flex gap-2 items-center rounded-xl !border-[#155EEF] ">
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
                            <div className="calendar-wrapper double-view sm:hidden">
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
                  {isCabinOutOfPolicy && (
                    <OutOfPolicy
                      outOfPolicyTravelers={constructOutOfPolicyEmployees(
                        {
                          corporateEmployees: selectedFlightTravelers || [],
                          flightCabinClass: selectedCabinClassOption?.label,
                        },
                        TRAVEL_CATEGORIES.FLIGHTS
                      )}
                      badgeClassName="text-[#E53944] text-nowrap absolute top-[-20%] text-xxs font-medium items-center bg-[#FBE2E3] rounded-xl w-fit px-2 py-1 flex gap-1"
                    />
                  )}
                </div>
                <div
                  className={`relative w-full sm:w-full ${
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
                        ? setIsCountDropdownOpen(!isCountDropdownOpen)
                        : null
                    }
                    className={`flex items-center w-full h-full pl-10 rounded-xl bg-[#f6f6f6] ${
                      isHomePage
                        ? "bg-[#f6f6f6]"
                        : isDropdownVisible
                        ? "bg-[#f6f6f6]"
                        : "bg-white"
                    } ${
                      maxAllowedTravelers > 1
                        ? "cursor-pointer"
                        : "cursor-not-allowed"
                    }`}
                  >
                    <span className="text-[#000000] text-base font-medium">
                      {adultsCount}{" "}
                      {adultsCount > 1 ? "Travellers" : "Traveller"}
                    </span>
                  </div>

                  {isHovered && maxAllowedTravelers <= 1 && (
                    <div
                      className={`absolute z-50 -bottom-12 left-1/2 sm:left-[10%] -translate-x-1/2 w-max 
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
                              : "text-[#155EEF]"
                          }`}
                          disabled={adultsCount <= FLIGHT_MIN_ADULT_SELECTION}
                        >
                          <FontAwesomeIcon icon={faMinusCircle} size={16} />
                        </button>

                        <span className="text-[#155EEF] text-sm min-w-[60px] text-center">
                          {adultsCount} {adultsCount > 1 ? "Adults" : "Adult"}
                        </span>

                        <button
                          onClick={increment}
                          className={`text-xl rounded-full hover:bg-gray-100 transition-colors ${
                            adultsCount >= FLIGHT_MAX_ADULT_SELECTION
                              ? "text-gray-300"
                              : "text-[#155EEF]"
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

              {!isHomePage && (
                <div className="hidden sm:block">
                  <button
                    className="bg-[#155EEF26] text-[#155EEF] p-2 rounded-lg w-40 h-12 flex items-center justify-center"
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
            {/* travelers selection */}
            <div
              className={`w-full sm:w-2/12 h-18 ${
                maxAllowedTravelers === 1
                  ? "cursor-pointer"
                  : "cursor-not-allowed"
              }`}
            >
              <div className="w-full h-full">
                <div className="relative h-full">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <FontAwesomeIcon
                      icon={faCircleUser}
                      className="w-4 h-4 text-gray-500"
                    />
                  </div>
                  <div className="relative">
                    <SelectTravellers
                      initialSelectedTravelers={travelers}
                      onTravelerChange={setTravelers}
                      backgroundColor={backgroundColor}
                      adultsCount={adultsCount}
                      isHomePage={isHomePage}
                      maxAllowedTravelers={maxAllowedTravelers}
                      travelCategory={TRAVEL_CATEGORIES["FLIGHTS"]}
                      modalRef={modalRef}
                    />
                    <div
                      className={`absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400`}
                    >
                      {/* You can add an icon here if needed */}
                      <FontAwesomeIcon
                        icon={faCircleUser}
                        className={`w-4 h-4 ${
                          travelers?.length > 0
                            ? "text-[#155EEF]"
                            : "text-gray-400"
                        }`}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
            {!isHomePage && (
              <div className="block sm:hidden">
                <button
                  className="bg-[#155EEF26] text-[#155EEF] text-xs p-2 rounded-lg w-40 h-10 mt-2 m-auto flex items-center justify-center"
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
                // option=option+1;
                // console.log("flight  ", flight);
                return (
                  <div
                    className="flex gap-2 sm:gap-3 py-2 min-w-full"
                    key={option}
                  >
                    {/* from and to destinations */}
                    <div className="relative flex items-center gap-2 w-9/12 sm:w-6/12">
                      {/* <div
                        className={`w-1/2 ${isHomePage ? "h-16 text-xl" : "h-12 text-sm"
                          }`}
                      >
                        <LocationInput
                          placeholder="From"
                          handleFromDestinationChange={
                            handleFromDestinationChange
                          }
                          handleToDestinationChange={handleToDestinationChange}
                          handleSelectDestination={handleSelectDestination}
                          activeWay={activeWay}
                          multiCityIndex={option}
                          multiCityDestinations={multiCityDestinations}
                          handleMultiCityDestinationChange={
                            handleMultiCityDestinationChange
                          }
                          setMultiCityDestinations={setMultiCityDestinations}
                          handleMultiCitySelectDestination={
                            handleMultiCitySelectDestination
                          }
                          matchingMultiCityDestinations={
                            matchingMultiCityDestinations
                          }
                          isHomePage={isHomePage}
                          isDropdownVisible={isDropdownVisible} // Pass the prop here
                        />
                      </div>
                      <div
                        className={`w-1/2 ${isHomePage ? "h-16 text-xl" : "h-12 text-sm"
                          }`}
                      >
                        <LocationInput
                          placeholder="To"
                          handleFromDestinationChange={
                            handleFromDestinationChange
                          }
                          handleToDestinationChange={handleToDestinationChange}
                          handleSelectDestination={handleSelectDestination}
                          activeWay={activeWay}
                          multiCityIndex={option}
                          multiCityDestinations={multiCityDestinations}
                          handleMultiCityDestinationChange={
                            handleMultiCityDestinationChange
                          }
                          setMultiCityDestinations={setMultiCityDestinations}
                          handleMultiCitySelectDestination={
                            handleMultiCitySelectDestination
                          }
                          matchingMultiCityDestinations={
                            matchingMultiCityDestinations
                          }
                          isHomePage={isHomePage}
                          isDropdownVisible={isDropdownVisible} // Pass the prop here
                        />
                      </div> */}

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
                            // onChange={(val) =>
                            //   handleMultiCitySelectDestination(
                            //     option,
                            //     "from",
                            //     val
                            //   )
                            // }
                            instanceId={`multi-city-from-${option}`}
                            isDisabled={loading}
                            isClearable
                            styles={customMultiCityStyles}
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
                            // onMenuOpen={() =>
                            //   setIsMultiCityDropdownOpen((prev) => ({
                            //     ...prev,
                            //     from: true,
                            //   }))
                            // }
                            onMenuClose={() =>
                              setIsMultiCityDropdownOpen((prev) => ({
                                ...prev,
                                from: false,
                              }))
                            }
                            formatOptionLabel={(option) => (
                              <div className="flex flex-col">
                                <div className="font-semibold text-xs sm:text-lg   text-nowrap">
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
                        {/* <div className="text-red-500 text-xs mt-1">
                          {!multiCityDestinations[option]?.from && "Please select a departure city"}
                        </div> */}
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
                            formatOptionLabel={(option) => (
                              <div className="flex flex-col">
                                <div className="font-semibold text-xs sm:text-lg text-nowrap">
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
                        {/* <div className="text-red-500 text-xs mt-1">
                          {!multiCityDestinations[option]?.to && "Please select an arrival city"}
                        </div> */}
                      </div>
                    </div>

                    {/* date selection */}
                    <div
                      className={`w-4/12 sm:w-2/12 ${
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
                                <div className="w-full h-fit border bg-white p-3 flex gap-2 items-center rounded-xl !border-[#155EEF] ">
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
                                        multiCityDestinations,
                                        earliestAllowedDate
                                      )
                                    }
                                    className="w-full"
                                    next2Label={null}
                                    prev2Label={null}
                                  />
                                </div>
                                <div className="block sm:hidden calendar-wrapper double-view">
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
                                        multiCityDestinations,
                                        earliestAllowedDate
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
                              ? setIsDropdownOpen(!isDropdownOpen)
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
                        {isDropdownOpen && (
                          <div className="absolute z-10 w-full mt-1 py-3 bg-white rounded-lg shadow-lg border border-gray-200">
                            <div className="flex items-center justify-center gap-4">
                              <button
                                onClick={decrement}
                                className={`text-xl rounded-full hover:bg-gray-100 transition-colors ${
                                  adultsCount <= 1
                                    ? "text-gray-300"
                                    : "text-[#155EEF]"
                                }`}
                                disabled={adultsCount <= 1}
                              >
                                <FontAwesomeIcon
                                  icon={faMinusCircle}
                                  size={16}
                                />
                              </button>

                              <span className="text-[#155EEF] text-sm min-w-[60px] text-center">
                                {adultsCount}{" "}
                                {adultsCount > 1 ? "Adults" : "Adult"}
                              </span>

                              <button
                                onClick={increment}
                                className={`text-xl rounded-full hover:bg-gray-100 transition-colors ${
                                  adultsCount >= 9
                                    ? "text-gray-300"
                                    : "text-[#155EEF]"
                                }`}
                                disabled={adultsCount >= 9}
                              >
                                <FontAwesomeIcon
                                  icon={faPlusCircle}
                                  size={16}
                                />
                              </button>
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
                            className="bg-[#155EEF26] text-[#155EEF] p-3 rounded-lg w-48 h-16 "
                            onClick={toggleDropdown}
                          >
                            Edit
                          </button>
                        </div>
                      )}
                    {option === flights.length - 1 && flights.length < 6 && (
                      <button
                        className="hidden w-2/12 bg-[#155EEF0F] text-[#155EEF] font-semibold sm:flex items-center justify-center rounded-lg text-sm"
                        onClick={handleAddFlight}
                      >
                        + Add Another Flight
                      </button>
                    )}

                    {flights.length > 1 && option > 1 && (
                      <button
                        className=" h-8 mt-2 w-8 bg-[#155EEF0F] text-[#155EEF] font-semibold flex items-center justify-center rounded-lg"
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
                  {/* <div className={`w-1/4 ${isHomePage ? "h-16 text-xl" : "h-12 text-sm"}`}>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none z-[11]">
                        <FontAwesomeIcon icon={faPlane} className="w-5 h-5 text-gray-500" />
                      </div>
                      <AsyncSelect
                        cacheOptions
                        defaultOptions={defaultCityOptions}
                        loadOptions={(inputValue) => searchMultiCityDestinations(inputValue, option, "from")}
                        placeholder="From"
                        value={getValidValue(multiCityDestinations[option]?.from)}
                        onChange={(val) => handleMultiCitySelectDestination(option, "from", val)}
                        instanceId={`multi-city-from-${option}`}
                        isDisabled={loading}
                        isClearable
                        styles={customMultiCityStyles}
                        onMenuOpen={() => setIsMultiCityDropdownOpen((prev) => ({ ...prev, from: true }))}
                        onMenuClose={() => setIsMultiCityDropdownOpen((prev) => ({ ...prev, from: false }))}
                        formatOptionLabel={(option) => (
                          <div className="flex flex-col">
                            <div className="font-semibold text-nowrap">{option.label}</div>
                            <span className="text-sm text-gray-500 text-nowrap">
                              {option.airportName}, {option.countryname} ({option.airportCode})
                            </span>
                          </div>
                        )}
                        loadingMessage={() => <div className="p-2">Loading...</div>}
                        noOptionsMessage={({ inputValue }) =>
                          inputValue.length > 0 ? (
                            <div className="p-2 text-red-500 text-sm">No cities found</div>
                          ) : (
                            <div className="p-2 text-gray-500 text-sm">Type to search</div>
                          )
                        }
                      />
                    </div>

                  </div>


                  <div className={`w-1/4 ${isHomePage ? "h-16 text-xl" : "h-12 text-sm"}`}>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none z-[11]">
                        <FontAwesomeIcon icon={faPlane} randclassName="w-5 h-5 text-gray-500" />
                      </div>
                      <AsyncSelect
                        cacheOptions
                        defaultOptions={defaultCityOptions}
                        loadOptions={(inputValue) => searchMultiCityDestinations(inputValue, option, "to")}
                        placeholder="To"
                        value={getValidValue(multiCityDestinations[option]?.to)}
                        onChange={(val) => handleMultiCitySelectDestination(option, "to", val)}
                        instanceId={`multi-city-to-${option}`}
                        isDisabled={loading}
                        isClearable
                        styles={customMultiCityStyles}
                        onMenuOpen={() => setIsMultiCityDropdownOpen((prev) => ({ ...prev, to: true }))}
                        onMenuClose={() => setIsMultiCityDropdownOpen((prev) => ({ ...prev, to: false }))}
                        formatOptionLabel={(option) => (
                          <div className="flex flex-col">
                            <div className="font-semibold text-nowrap">{option.label}</div>
                            <span className="text-sm text-gray-500 text-nowrap">
                              {option.airportName}, {option.countryname} ({option.airportCode})
                            </span>
                          </div>
                        )}
                        loadingMessage={() => <div className="p-2">Loading...</div>}
                        noOptionsMessage={({ inputValue }) =>
                          inputValue.length > 0 ? (
                            <div className="p-2 text-red-500 text-sm">No cities found</div>
                          ) : (
                            <div className="p-2 text-gray-500 text-sm">Type to search</div>
                          )
                        }
                      />
                    </div>

                  </div> */}
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
                            multiCityDestinations[0].fromCity ||
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
                            multiCityDestinations[0]?.toCity ||
                            "Select Destination"}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* <div className="relative flex items-center gap-2 w-5/12">
                    <div
                      className={`w-1/2 ${isHomePage ? "h-16 text-xl" : "h-12 text-sm"
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
                          className={`w-full h-full ${isHomePage
                            ? "text-xl bg-[#f6f6f6]"
                            : "text-sm bg-white"
                            } pl-8 pr-4 py-2 focus:bg-white rounded-xl placeholder-gray-500 whitespace-nowrap overflow-hidden text-ellipsis`}
                        >
                          {multiCityDestinations[0].fromCity}
                        </div>
                      </div>
                    </div>
                    <div
                      className={`w-1/2 ${isHomePage ? "h-16 text-xl" : "h-12 text-sm"
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
                          className={`w-full h-full ${isHomePage
                            ? "text-xl bg-[#f6f6f6]"
                            : "text-sm bg-white"
                            } pl-8 pr-4 py-2 focus:bg-white rounded-xl placeholder-gray-500 whitespace-nowrap overflow-hidden text-ellipsis`}
                        >
                          {multiCityDestinations[
                            multiCityDestinations.length - 1
                          ].toCity || multiCityDestinations[0].toCity}
                        </div>
                      </div>
                    </div>
                  </div> */}
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
                      className="bg-[#155EEF26] text-[#155EEF] p-2 text-sm rounded-lg w-full"
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
            {activeWay === 3 && (
              <div>
                {/* travelers selection */}
                <div className="w-full sm:w-2/12 h-18">
                  <div className="w-full h-full">
                    <div className="relative h-full">
                      <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                        <FontAwesomeIcon
                          icon={faCircleUser}
                          className="w-4 h-4 text-gray-500"
                        />
                      </div>
                      <div className="relative">
                        <SelectTravellers
                          initialSelectedTravelers={travelers}
                          onTravelerChange={setTravelers}
                          backgroundColor={backgroundColor}
                          adultsCount={adultsCount}
                          isHomePage={isHomePage}
                          maxAllowedTravelers={maxAllowedTravelers}
                          travelCategory={TRAVEL_CATEGORIES["FLIGHTS"]}
                        />
                        <div className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400">
                          {/* You can add an icon here if needed */}
                          <FontAwesomeIcon
                            icon={faCircleUser}
                            className="w-4 h-4 text-gray-500"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
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

                    {isCabinOutOfPolicy && (
                      <OutOfPolicy
                        outOfPolicyTravelers={constructOutOfPolicyEmployees(
                          {
                            corporateEmployees: selectedFlightTravelers || [],
                            flightCabinClass: selectedCabinClassOption?.label,
                          },
                          TRAVEL_CATEGORIES.FLIGHTS
                        )}
                        badgeClassName="text-[#E53944] text-nowrap sm:-absolute top-[-20%] text-xxs font-medium items-center bg-[#FBE2E3] rounded-xl w-fit px-2 py-1 flex gap-1"
                      />
                    )}
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
                                : "text-[#155EEF]"
                            }`}
                            disabled={adultsCount <= FLIGHT_MIN_ADULT_SELECTION}
                          >
                            <FontAwesomeIcon icon={faMinusCircle} size={16} />
                          </button>

                          <span className="text-[#155EEF] text-sm min-w-[60px] text-center">
                            {adultsCount} {adultsCount > 1 ? "Adults" : "Adult"}
                          </span>

                          <button
                            onClick={increment}
                            className={`text-xl rounded-full hover:bg-gray-100 transition-colors ${
                              adultsCount >= FLIGHT_MAX_ADULT_SELECTION
                                ? "text-gray-300"
                                : "text-[#155EEF]"
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
                                className="w-fit bg-[#155EEF0F] text-[#155EEF] px-2 py-2 text-nowrap font-semibold flex items-center justify-center rounded-lg text-sm"
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
                className="w-full h-12 sm:h-14 bg-[#155EEF] text-white rounded-full flex items-center justify-center"
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
