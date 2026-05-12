import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { useSelector, useDispatch } from "react-redux";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faLocationDot,
  faCalendarDays,
  faCircleUser,
  faChevronDown,
  faPlus,
  faMinus,
  faTimes,
  faSpinner,
  faCity,
  faBed,
} from "@fortawesome/free-solid-svg-icons";
import { Calendar } from "react-calendar";
import "react-calendar/dist/Calendar.css";
import useCorporateHotelSearch from "@/utils/corporate/hotels/search";
import SelectTravellers from "../../travellers/SelectTravellers";
import useIndexedDBWithCompression from "../../../../../utils/corporate/hotels/useIndexedDB";
import {
  setAdultsCountHotel,
  setSelectedTravelers as setSelectedTravelersRedux,
  setDefaultSelectionDone,
} from "@/store/slices/travellersSlice";
import {
  getMaxAllowedTravelers,
  getMinBookingWindow,
} from "@/utils/corporate/travelPolicy";
import { TRAVEL_CATEGORIES } from "@/utils/constants";
import showToast from "@/utils/toast";
import AsyncSelect from "react-select/async";

export default function ListNavigation({
  setSearchResults,
  setSearchRequest,
  setSearchFilters,
  setParentLoader,
  isDetailView,
  setIsDropdownVisible,
}) {
  const {
    inputValue,
    setInputValue,
    suggestions,
    isLoading,
    error,
    selectedRooms,
    setSelectedRooms,
    handleInputChange,
    incrementRoomCount,
    decrementRoomCount,
    selectedCity,
    setSelectedCity,
    handleCitySelect,
    handleClearCity,
    selectedTravelers,
    loadHotelOptions,
    defaultHotelOptions,
    setDefaultHotelOptions,
    dataLoading,
    handleTravelerChange,
    setSelectedTravelers,
    incrementAdults,
    decrementAdults,
    setAdultsPerRoom,
    adultsPerRoom,
    checkInDate,
    checkOutDate,
    dateRange,
    setDateRange,
    performSearch,
    searchResults,
    searchRequest,
    searchFilters,
    setCheckOutDate,
    setCheckInDate,
  } = useCorporateHotelSearch({ defaultLimit: 10 });

  const dispatch = useDispatch();
  const [fromInputValue, setFromInputValue] = useState("");

  const { adultsCountHotel, travelersByCategory } = useSelector(
    (state) => state.travellers
  );

  const userDetails = useSelector((state) => state?.user?.userInfo);
  const travelPolicy = userDetails?.loggedInDetails?.travelPolicy?.[0];
  const policyConfigData = travelPolicy?.policyConfigData || [];

  const maxAllowedTravelers = getMaxAllowedTravelers(
    policyConfigData,
    TRAVEL_CATEGORIES.HOTELS
  );

  const selectedFlightTravelers = useMemo(
    () => travelersByCategory?.[TRAVEL_CATEGORIES.HOTELS] || [],
    [travelersByCategory]
  );

  const groupMinWindow = useMemo(() => {
    return getMinBookingWindow(
      selectedFlightTravelers,
      TRAVEL_CATEGORIES.HOTELS
    );
  }, [selectedFlightTravelers]);

  // Calculate earliest allowed booking date = today + groupMinWindow days
  const earliestAllowedDate = useMemo(() => {
    const dt = new Date();
    dt.setHours(0, 0, 0, 0);
    dt.setDate(dt.getDate() + groupMinWindow);
    return dt;
  }, [groupMinWindow]);

  const { getSearchResults, isDbInitialized } = useIndexedDBWithCompression();

  const [isHomePage, setIsHomePage] = useState(false);
  const [cityDropdown, setCityDropdown] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [isCheckoutCalendarOpen, setIsCheckoutCalendarOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showNoDataMessage, setShowNoDataMessage] = useState(false);
  const [isSelectMenuOpen, setIsSelectMenuOpen] = useState(false);
  const calendarRef = useRef(null);
  const calendarRef1 = useRef(null);
  const inputRef = useRef(null);
  const suggestionsRef = useRef(null);
  const roomDropdownRef = useRef(null);

  const updateSearchResults = useCallback(
    (results) => {
      if (setSearchResults !== undefined) {
        setSearchResults(results ?? null);
      }
    },
    [setSearchResults]
  );

  const updateSearchRequest = useCallback(
    (request) => {
      if (setSearchRequest !== undefined) {
        setSearchRequest(request ?? null);
      }
    },
    [setSearchRequest]
  );

  const updateSearchFilters = useCallback(
    (filters) => {
      if (setSearchFilters !== undefined) {
        setSearchFilters(filters ?? null);
      }
    },
    [setSearchFilters]
  );

  const updateSearch = async () => {
    const searchData = await getSearchResults();
    updateSearchResults(searchData?.results ?? null);
    updateSearchRequest(searchData?.params ?? null);
    updateSearchFilters(searchData?.filters ?? null);
  };

  useEffect(() => {
    if (
      !isDetailView &&
      window.location.pathname === "/corporate/auth/booking"
    ) {
      // dispatch(setAdultsCountHotel([1]));
      return;
    }
    // if (!isDetailView) return;
    const fetchSearchSearch = async () => {
      try {
        if (!isDbInitialized) return;
        const searchData = await getSearchResults();
        if (searchData) {
          // setSelectedCity(searchData?.params?.selectedCity);
          setSelectedTravelers(searchData?.params?.selectedTravelers);
          dispatch(
            setSelectedTravelersRedux({
              travelers: searchData?.params?.selectedTravelers ?? [],
              category: TRAVEL_CATEGORIES.HOTELS,
            })
          );
          dispatch(
            setDefaultSelectionDone(
              searchData?.params?.selectedTravelers?.length > 0
            )
          );
          setSelectedRooms(searchData?.params?.noOfRooms);
          setAdultsPerRoom(searchData?.params?.adultsPerRoom);
          dispatch(setAdultsCountHotel(searchData?.params?.adultsPerRoom));
          const checkInDate =
            typeof searchData?.params?.checkInDateRange === "string"
              ? new Date(searchData.params.checkInDateRange)
              : searchData?.params?.checkInDateRange;

          const checkOutDate =
            typeof searchData?.params?.checkOutDateRange === "string"
              ? new Date(searchData.params.checkOutDateRange)
              : searchData?.params?.checkOutDateRange;

          setDateRange([checkInDate, checkOutDate]);
        }
      } catch (error) {
        console.log("error initializing search:", error);
      }
    };

    fetchSearchSearch();
  }, [isDbInitialized, isDetailView]);

  useEffect(() => {
    // Check if running on the client
    if (typeof window !== "undefined") {
      const isHomePage =
        window.location.pathname === "/corporate/auth/booking" ||
        window.location.pathname === "/";
      setIsHomePage(isHomePage);
      // if (!isHomePage) dispatch(setHasFetchedOnHome(false));
    }
  }, [dispatch]);

  useEffect(() => {
    // Initialize check-in and check-out dates
    if (isHomePage) {
      const today = new Date();
      const tomorrow = new Date(today);
      tomorrow.setDate(today.getDate() + 1);

      // Set the initial check-in and check-out dates
      if (!checkInDate && !checkOutDate) {
        setDateRange([today, tomorrow]);
      }
    }
  }, [checkInDate, checkOutDate, setDateRange, isHomePage]);

  // useEffect(() => {
  //   // Update the adultsPerRoom array based on the number of rooms
  //   setAdultsPerRoom(
  //     Array.from({ length: selectedRooms }, (_, i) => adultsPerRoom[i] || 1)
  //   );
  //   dispatch(
  //     setAdultsCountHotel(
  //       Array.from(
  //         { length: selectedRooms },
  //         (_, i) => adultsCountHotel[i] || 1
  //       )
  //     )
  //   );
  // }, [selectedRooms, dispatch, setAdultsPerRoom]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        inputRef.current &&
        !inputRef.current.contains(event.target) &&
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target)
      ) {
        setCityDropdown(false);
      }
      if (calendarRef.current && !calendarRef.current.contains(event.target)) {
        setIsCalendarOpen(false);
      }
      if (
        roomDropdownRef.current &&
        !roomDropdownRef.current.contains(event.target)
      ) {
        setDropdownOpen(false);
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
        inputRef.current &&
        !inputRef.current.contains(event.target) &&
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target)
      ) {
        setCityDropdown(false);
      }
      if (
        calendarRef1.current &&
        !calendarRef1.current.contains(event.target)
      ) {
        setIsCheckoutCalendarOpen(false);
      }
      if (
        roomDropdownRef.current &&
        !roomDropdownRef.current.contains(event.target)
      ) {
        setDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    // Reset focused index when suggestions change
    setFocusedIndex(-1);
  }, [suggestions]);

  useEffect(() => {
    if (!isLoading && inputValue && suggestions.length === 0) {
      const timeout = setTimeout(() => {
        setShowNoDataMessage(true);
      }, 1000); // Show message after 1 second

      return () => clearTimeout(timeout); // Clear timeout if conditions change
    } else {
      setShowNoDataMessage(false);
    }
  }, [isLoading, inputValue, suggestions]);

  const handleKeyDown = (e) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setFocusedIndex((prevIndex) => (prevIndex + 1) % suggestions.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setFocusedIndex(
        (prevIndex) => (prevIndex - 1 + suggestions.length) % suggestions.length
      );
    } else if (e.key === "Enter" && focusedIndex !== -1) {
      handleCitySelect(suggestions[focusedIndex]);
      setCityDropdown(false);
      inputRef.current.blur();
    }
  };

  const toggleDropdown = () => {
    setDropdownOpen(!dropdownOpen);
  };

  const getBackgroundColor = () => {
    return isHomePage ? "bg-[#f6f6f6]" : "bg-white"; // Change colors as needed
  };

  const formatDate = (date) => {
    const updatedDate = typeof date === "string" ? new Date(date) : date;
    return updatedDate
      ? updatedDate.toLocaleDateString("en-US", {
          year: "numeric",
          month: "short",
          day: "numeric",
        })
      : "Not selected";
  };

  const handleCheckInDateChange = (date) => {
    const normalizedDate =
      date instanceof Date ? new Date(date.setHours(12, 0, 0, 0)) : null;

    if (normalizedDate < earliestAllowedDate) {
      showToast(
        "error",
        `This date is out of policy. You must book at least ${groupMinWindow} day(s) in advance.`
      );
      return;
    }

    if (normalizedDate) {
      setCheckInDate(normalizedDate);
      // If checkout date is less than checkin date + 1 day, update it
      if (!checkOutDate || checkOutDate <= normalizedDate) {
        const nextDay = new Date(normalizedDate);
        nextDay.setDate(nextDay.getDate() + 1);
        setCheckOutDate(nextDay);
        setDateRange([normalizedDate, nextDay]);
      } else {
        setDateRange([normalizedDate, checkOutDate]);
      }
      // setDateRange([normalizedDate, checkOutDate]);
      setIsCalendarOpen(false);
    }
  };

  const handleCheckOutDateChange = (date) => {
    // Ensure the input is a Date object
    const normalizedDate =
      date instanceof Date ? new Date(date.setHours(12, 0, 0, 0)) : null;

    if (normalizedDate < earliestAllowedDate) {
      showToast(
        "error",
        `This date is out of policy. You must book at least ${groupMinWindow} day(s) in advance.`
      );
      return;
    }

    if (normalizedDate) {
      if (checkInDate && normalizedDate <= checkInDate) {
        // If selected checkout date is before or equal to checkin date,
        // set checkout to checkin + 1 day
        const nextDay = new Date(checkInDate);
        nextDay.setDate(nextDay.getDate() + 1);
        setCheckOutDate(nextDay);
        setDateRange([checkInDate, nextDay]);
      } else {
        setCheckOutDate(normalizedDate);
        setDateRange([checkInDate, normalizedDate]);
      }

      // setCheckOutDate(normalizedDate);
      // setDateRange([checkInDate, normalizedDate]);
      setIsCheckoutCalendarOpen(false); // Close the calendar after selecting the date
    }
  };

  const tileDisabledForCheckout = ({ date }) => {
    if (!checkInDate) return false;
    return date <= checkInDate;
  };

  //   const handleSearch = async () => {
  //     try {
  //       if (
  //         checkInDate < earliestAllowedDate ||
  //         checkOutDate < earliestAllowedDate
  //       ) {
  //         showToast(
  //           "warning",
  //           `This date is out of policy. You must book at least ${groupMinWindow} day(s) in advance.`
  //         );
  //         return;
  //       }

  //       setLoading(true);
  //       if (setParentLoader) setParentLoader(true);
  //       await performSearch();
  //       await updateSearch();
  //  setIsDropdownVisible(false);
  //       if (setParentLoader) setParentLoader(false);
  //     } catch (error) {
  //       console.error(error);
  //     } finally {
  //       setLoading(false);
  //       // setIsDropdownVisible(false);
  //       // isDetailView(false);
  //     }
  //   };

  const [localIsDropdownVisible, setLocalIsDropdownVisible] = useState(false);

  const validator = {
    message: (selected) => {
      if (!selected) return "Please select a city or hotel.";
      return "";
    },
  };

  const handleSearch = async () => {
    try {
      console.log("Starting search, props:", { setIsDropdownVisible });
      if (
        checkInDate &&
        checkOutDate &&
        (new Date(checkInDate) < earliestAllowedDate ||
          new Date(checkOutDate) < earliestAllowedDate)
      ) {
        showToast(
          "error",
          `This date is out of policy. You must book at least ${groupMinWindow} day(s) in advance.`
        );
        return;
      }

      setLoading(true);
      if (setParentLoader) setParentLoader(true);
      const results = await performSearch(
        setSearchResults,
        setSearchRequest,
        setSearchFilters
      );
      console.log("Search results:", results);
      if (results && updateSearch) {
        await updateSearch(results);
      }
      if (typeof setIsDropdownVisible === "function") {
        setIsDropdownVisible(false);
      } else {
        setLocalIsDropdownVisible(false);
        console.warn(
          "setIsDropdownVisible is not a function, using local state"
        );
      }
    } catch (error) {
      console.error("Search error:", error);
      showToast("error", error.message || "Search failed. Please try again.");
    } finally {
      setLoading(false);
      if (setParentLoader) setParentLoader(false);
    }
  };

  const customStyles = {
    control: (base) => ({
      ...base,
      height: "62px",
      width: "100%",
      paddingLeft: "2.5rem",
      paddingRight: "2.5rem",
      borderRadius: "0.5rem",
      backgroundColor: selectedCity ? "white" : "#f9fafb",
      borderColor: "#d1d5db",
      boxShadow: "none",
      fontSize: "16px",
      "&:hover": {
        borderColor: "#d1d5db",
      },
      "&:focus-within": {
        backgroundColor: "white",
        boxShadow: "0 0 0 1px #028fa3",
        borderColor: "#028fa3",
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
      border: "1px solid #d1d5db",
      borderRadius: "0.375rem",
      boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
      zIndex: 10,
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
      backgroundColor: isFocused ? "#e5e7eb" : "white",
      color: "black",
      padding: "0.5rem",
      cursor: "pointer",
      display: "flex",
      flexDirection: "column",
      fontSize: "14px",
    }),
  };
  const handleSelectedCityClick = () => {
    if (selectedCity) {
      setInputValue(
        selectedCity.type === 1 ? selectedCity.title : selectedCity.title
      );
      setSelectedCity(null);
      setCityDropdown(true);
      // Focus the input after a short delay to ensure proper rendering
      setTimeout(() => {
        inputRef.current?.focus();
      }, 0);
    }
  };

  const displayCheckIn = checkInDate ? formatDate(checkInDate) : "Check-In";
  const displayCheckOut = checkOutDate ? formatDate(checkOutDate) : "Check-Out";
  const backgroundColor = isHomePage ? "#f6f6f6" : "#FFFFFF";
  const today = new Date();
  const oneYearFromNow = new Date(
    today.getFullYear() + 1,
    today.getMonth(),
    today.getDate()
  );

  return (
    <>
      <div className="flex flex-col sm:flex-row font-semibold px-3 py-3 items-center gap-2 sm:gap-3 w-full">
        <div
          className={`h-16 ${
            isHomePage ? "w-full sm:w-3/12" : "w-full sm:w-3/12"
          }`}
        >
          <div className="w-full h-full">
            {/* <div className="relative h-full">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <FontAwesomeIcon
                  icon={faLocationDot}
                  className="w-4 h-4 text-gray-500"
                />
              </div>
              <input
                ref={inputRef}
                type="text"
                className={`w-full h-full ${getBackgroundColor()} pl-8 pr-10 py-2 focus:bg-white rounded-lg placeholder-gray-500`}
                placeholder={
                  !inputValue && !selectedCity
                    ? "Search by city/hotel name"
                    : ""
                }
                value={inputValue}
                onChange={(e) => handleInputChange(e.target.value)}
                onFocus={() => setCityDropdown(true)}
                onKeyDown={handleKeyDown}
                disabled={loading}
              />
              {cityDropdown && (
                <div
                  ref={suggestionsRef}
                  className="absolute mt-1 bg-white border border-gray-300 rounded-md shadow-lg z-10 max-h-60 overflow-y-auto w-fit"
                >
                  {isLoading && <div className="p-2">Loading...</div>}
                  {error && <div className="p-2 text-red-500">{error}</div>}
                  {suggestions.length > 0
                    ? suggestions.map((destination, index) => (
                        <div
                          key={index}
                          className={`p-2 hover:bg-gray-100 cursor-pointer flex flex-col ${
                            index === focusedIndex ? "bg-gray-200" : ""
                          }`}
                          onClick={() => handleCitySelect(destination)}
                        >
                          {destination.type === 1 ? (
                            <>
                              <div>
                                <FontAwesomeIcon
                                  icon={faCity}
                                  size="sm"
                                  color="#028fa3"
                                />
                                <span className="font-semibold ml-2 text-nowrap">
                                  {destination.title} (
                                  {destination.countryalpha2code})
                                </span>
                              </div>
                              <span className="text-sm text-gray-500 text-nowrap">
                                {destination.title}, {destination.countryname}
                              </span>
                            </>
                          ) : destination.type === 2 ? (
                            <>
                              <div className="text-nowrap">
                                <FontAwesomeIcon
                                  icon={faBed}
                                  size="sm"
                                  color="#028fa3"
                                />
                                <span className="font-semibold ml-2 text-nowrap">
                                  {destination.title}
                                </span>
                              </div>
                              <span className="text-sm text-gray-500 text-nowrap">
                                {destination.cityname},{" "}
                                {destination.countryname}
                              </span>
                            </>
                          ) : null}
                        </div>
                      ))
                    : showNoDataMessage && (
                        <div className="p-2 text-red-500 text-sm">
                          No data found
                        </div>
                      )}
                </div>
              )}
              {selectedCity && (
                <div
                  onClick={handleSelectedCityClick}
                  className="absolute top-0 left-0 w-full h-full flex items-center justify-between pl-8 pr-4 py-2"
                >
                  <span className="font-semibold text-gray-700 truncate">
                    {selectedCity.type === 1
                      ? `${selectedCity.title} (${selectedCity.countryalpha2code})`
                      : selectedCity.title}
                  </span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation(); // Prevent the parent onClick from firing
                      handleClearCity();
                    }}
                    className="text-gray-500 hover:text-gray-700 focus:outline-none"
                  >
                    <FontAwesomeIcon icon={faTimes} className="w-3 h-3" />
                  </button>
                </div>
              )}
            </div> */}

            <div className="space-y-1 relative ">
              <div className="relative h-full">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none z-[11]">
                  <FontAwesomeIcon
                    icon={faLocationDot}
                    className="w-5 h-5 text-gray-500"
                  />
                </div>
                <AsyncSelect
                  cacheOptions
                  defaultOptions={defaultHotelOptions}
                  loadOptions={loadHotelOptions}
                  placeholder="Search by city/hotel name"
                  value={selectedCity}
                  inputValue={fromInputValue} // This preserves the typed text
                  onInputChange={(newValue, actionMeta) => {
                    console.log("onInputChange:", newValue, actionMeta.action);

                    // ONLY update if it's actual user input, ignore blur and menu-close
                    if (actionMeta.action === "input-change") {
                      setFromInputValue(newValue);
                    }
                    // For other actions, keep the existing value (don't clear it)
                  }}
                  // onChange={(val) => handleSelectDestination("from", val)}
                  onChange={(val) => {
                    handleCitySelect(val);
                    // Only clear if a value is selected
                    if (val) {
                      setFromInputValue("");
                    }
                  }}
                  // onChange={(val) => handleCitySelect(val)}
                  instanceId="hotel-location-search"
                  isDisabled={loading || dataLoading}
                  isClearable
                  styles={customStyles}
                  // onMenuOpen={() =>
                  //   typeof setIsDropdownVisible === "function"
                  //     ? setIsDropdownVisible(true)
                  //     : setLocalIsDropdownVisible(true)
                  // }
                  // onMenuClose={() =>
                  //   typeof setIsDropdownVisible === "function"
                  //     ? setIsDropdownVisible(false)
                  //     : setLocalIsDropdownVisible(false)
                  // }
                    onMenuOpen={async () => {
                    if (fromInputValue.trim() !== "") {
                      const options = await loadHotelOptions(fromInputValue);
                      setDefaultHotelOptions(options);
                    }
                  }}
                  // onMenuOpen={() => setIsSelectMenuOpen(true)} // Control AsyncSelect menu
                  onMenuClose={() => setIsSelectMenuOpen(false)}
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
                              {option.label}
                            </span>
                          </div>
                          <span className="text-sm text-gray-500 text-nowrap">
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
                              {option.label}
                            </span>
                          </div>
                          <span className="text-sm text-gray-500 text-nowrap">
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
              {/* <div className="text-red-500 text-xs mt-1">
                {validator.message(selectedCity)}
              </div> */}
            </div>

            {/* Debug: Display Fetched Destinations */}
            {/* {defaultHotelOptions.length > 0 && (
              <div className="mt-4 p-2 bg-gray-100 rounded-lg">
                <p className="text-sm font-medium text-gray-700">
                  Fetched Destinations (First {defaultHotelOptions.length}):
                </p>
                <ul className="list-disc pl-5 text-sm text-gray-600">
                  {defaultHotelOptions.map((option, index) => (
                    <li key={index}>
                      {option.label} ({option.isCity ? "City" : "Hotel"}, {option.cityname}, {option.countryname})
                    </li>
                  ))}
                </ul>
              </div>
            )} */}
          </div>
        </div>
        <div className="flex gap-3 w-full sm:w-4/12">
          <div className="w-1/2 h-16">
            <div className="w-full h-full">
              <div className="relative h-full">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <FontAwesomeIcon
                    icon={faCalendarDays}
                    className="w-4 h-3.5 text-gray-500"
                  />
                </div>
                <input
                  value={displayCheckIn}
                  type="text"
                  readOnly
                  className={`w-full h-full cursor-pointer ${getBackgroundColor()} pl-8 pr-4 py-2 focus:bg-white rounded-lg placeholder-gray-500`}
                  placeholder="Check-In"
                  onClick={() => setIsCalendarOpen(true)}
                  disabled={loading}
                />
                <div className="absolute inset-y-0 right-3 flex items-center pl-3 pointer-events-none">
                  <FontAwesomeIcon
                    icon={faChevronDown}
                    className="w-3 h-3 text-gray-500"
                  />
                </div>

                {isCalendarOpen && (
                  <div
                    ref={calendarRef}
                    className="absolute w-fit h-fit z-10 mt-1 bg-white shadow-lg rounded-lg"
                  >
                    <div className="w-full h-full">
                      <div className="w-full h-fit border p-3 flex gap-2 items-center justify-between rounded-xl !border-[#028fa3]">
                        <div className="text-[#171A19CC] text-base">
                          {checkInDate && checkOutDate
                            ? `Total Number of ${
                                Math.ceil(
                                  (checkOutDate - checkInDate) /
                                    (1000 * 60 * 60 * 24)
                                ) === 1
                                  ? "Night: 1 Night"
                                  : `Nights: ${Math.ceil(
                                      (checkOutDate - checkInDate) /
                                        (1000 * 60 * 60 * 24)
                                    )} Nights`
                              }`
                            : "Select Check-In and Check-Out Dates"}
                        </div>
                      </div>
                      <div className="calendar-wrapper double-view hidden sm:block">
                        <Calendar
                          onChange={handleCheckInDateChange}
                          // value={dateRange}
                          value={checkInDate}
                          showDoubleView={true}
                          selectRange={false}
                          className="double-view-calendar"
                          minDate={today}
                          next2Label={null}
                          prev2Label={null}
                          maxDate={oneYearFromNow}
                          tileContent={({ date, view, activeStartDate }) => {
                            // Only apply this for "month" view
                            if (view === "month") {
                              const monthInView = activeStartDate.getMonth(); // Month currently displayed on this side of the calendar
                              if (date.getMonth() !== monthInView) {
                                // Leave these dates as completely empty (not selectable, no content)
                                return null;
                              }
                            }
                            return null;
                          }}
                          tileDisabled={({ date, view, activeStartDate }) => {
                            if (view === "month") {
                              const monthInView = activeStartDate.getMonth();
                              // Disable tiles that do not belong to the current month in view
                              return date.getMonth() !== monthInView;
                            }
                            return false;
                          }}
                          navigationLabel={({ date, view }) => {
                            if (view === "month") {
                              return (
                                <span className="custom-calendar-label">
                                  {date.toLocaleString("default", {
                                    month: "long",
                                    year: "numeric",
                                  })}
                                </span>
                              );
                            }
                          }}
                        />
                      </div>
                      <div className="calendar-wrapper double-view sm:hidden">
                        <Calendar
                          onChange={handleCheckInDateChange}
                          // value={dateRange}
                          value={checkInDate}
                          showDoubleView={false}
                          selectRange={false}
                          className="double-view-calendar"
                          minDate={today}
                          next2Label={null}
                          prev2Label={null}
                          maxDate={oneYearFromNow}
                          tileContent={({ date, view, activeStartDate }) => {
                            // Only apply this for "month" view
                            if (view === "month") {
                              const monthInView = activeStartDate.getMonth(); // Month currently displayed on this side of the calendar
                              if (date.getMonth() !== monthInView) {
                                // Leave these dates as completely empty (not selectable, no content)
                                return null;
                              }
                            }
                            return null;
                          }}
                          tileDisabled={({ date, view, activeStartDate }) => {
                            if (view === "month") {
                              const monthInView = activeStartDate.getMonth();
                              // Disable tiles that do not belong to the current month in view
                              return date.getMonth() !== monthInView;
                            }
                            return false;
                          }}
                          navigationLabel={({ date, view }) => {
                            if (view === "month") {
                              return (
                                <span className="custom-calendar-label">
                                  {date.toLocaleString("default", {
                                    month: "long",
                                    year: "numeric",
                                  })}
                                </span>
                              );
                            }
                          }}
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
          <div className="w-1/2 h-16">
            <div className="w-full h-full">
              <div className="relative h-full">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <FontAwesomeIcon
                    icon={faCalendarDays}
                    className="w-4 h-3.5 text-gray-500"
                  />
                </div>
                <input
                  value={displayCheckOut}
                  type="text"
                  readOnly
                  className={`w-full h-full cursor-pointer  ${getBackgroundColor()} pl-8 pr-4 py-2 focus:bg-white rounded-lg placeholder-gray-500`}
                  placeholder="Check-Out"
                  onClick={() => setIsCheckoutCalendarOpen(true)}
                  disabled={loading}
                />
                <div className="absolute inset-y-0 right-3 flex items-center pl-3 pointer-events-none">
                  <FontAwesomeIcon
                    icon={faChevronDown}
                    className="w-3 h-3 text-gray-500"
                  />
                </div>

                {isCheckoutCalendarOpen && (
                  <div
                    ref={calendarRef1}
                    className="absolute right-0 sm:right-auto w-fit h-fit z-10 mt-1 bg-white shadow-lg rounded-lg"
                  >
                    <div className="w-full h-full">
                      <div className="w-full h-fit border p-3 flex gap-2 items-center justify-between rounded-xl !border-[#028fa3]">
                        <div className="text-[#171A19CC] text-base">
                          {checkInDate && checkOutDate
                            ? `Total Number of ${
                                Math.ceil(
                                  (checkOutDate - checkInDate) /
                                    (1000 * 60 * 60 * 24)
                                ) === 1
                                  ? "Night: 1 Night"
                                  : `Nights: ${Math.ceil(
                                      (checkOutDate - checkInDate) /
                                        (1000 * 60 * 60 * 24)
                                    )} Nights`
                              }`
                            : "Select Check-In and Check-Out Dates"}
                        </div>
                      </div>
                      <div className="calendar-wrapper double-view hidden sm:block">
                        <Calendar
                          onChange={handleCheckOutDateChange}
                          // value={dateRange}
                          value={checkOutDate}
                          selectRange={false}
                          showDoubleView={true}
                          className="w-full"
                          minDate={today}
                          next2Label={null}
                          prev2Label={null}
                          maxDate={oneYearFromNow}
                          tileContent={({ date, view, activeStartDate }) => {
                            // Only apply this for "month" view
                            if (view === "month") {
                              const monthInView = activeStartDate.getMonth(); // Month currently displayed on this side of the calendar
                              if (date.getMonth() !== monthInView) {
                                // Leave these dates as completely empty (not selectable, no content)
                                return null;
                              }
                            }
                            return null;
                          }}
                          tileDisabled={({ date, view, activeStartDate }) => {
                            if (view === "month") {
                              const monthInView = activeStartDate.getMonth();
                              // Disable tiles that do not belong to the current month in view
                              return (
                                date.getMonth() !== monthInView ||
                                tileDisabledForCheckout({ date })
                              );
                            }
                            return tileDisabledForCheckout({ date });
                          }}
                          navigationLabel={({ date, view }) => {
                            if (view === "month") {
                              return (
                                <span className="custom-calendar-label">
                                  {date.toLocaleString("default", {
                                    month: "long",
                                    year: "numeric",
                                  })}
                                </span>
                              );
                            }
                          }}
                        />
                      </div>
                      <div className="calendar-wrapper double-view sm:hidden">
                        <Calendar
                          onChange={handleCheckOutDateChange}
                          // value={dateRange}
                          value={checkOutDate}
                          selectRange={false}
                          showDoubleView={false}
                          className="w-full"
                          minDate={today}
                          next2Label={null}
                          prev2Label={null}
                          maxDate={oneYearFromNow}
                          tileContent={({ date, view, activeStartDate }) => {
                            // Only apply this for "month" view
                            if (view === "month") {
                              const monthInView = activeStartDate.getMonth(); // Month currently displayed on this side of the calendar
                              if (date.getMonth() !== monthInView) {
                                // Leave these dates as completely empty (not selectable, no content)
                                return null;
                              }
                            }
                            return null;
                          }}
                          tileDisabled={({ date, view, activeStartDate }) => {
                            if (view === "month") {
                              const monthInView = activeStartDate.getMonth();
                              // Disable tiles that do not belong to the current month in view
                              return (
                                date.getMonth() !== monthInView ||
                                tileDisabledForCheckout({ date })
                              );
                            }
                            return tileDisabledForCheckout({ date });
                          }}
                          navigationLabel={({ date, view }) => {
                            if (view === "month") {
                              return (
                                <span className="custom-calendar-label">
                                  {date.toLocaleString("default", {
                                    month: "long",
                                    year: "numeric",
                                  })}
                                </span>
                              );
                            }
                          }}
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="w-full sm:w-2/12 h-16">
          <div className="w-full h-full">
            <div className="relative h-full">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <FontAwesomeIcon
                  icon={faCircleUser}
                  className="w-4 h-4 text-gray-500"
                />
              </div>
              <input
                type="text"
                className={`w-full h-full ${
                  maxAllowedTravelers > 1
                    ? "cursor-pointer"
                    : "cursor-not-allowed"
                }  ${getBackgroundColor()} pl-8 pr-4 py-2 focus:bg-white rounded-lg placeholder-gray-500`}
                value={`${selectedRooms} ${
                  selectedRooms > 1 ? "Rooms" : "Room"
                }, ${adultsCountHotel.reduce(
                  (total, adults) => total + adults,
                  0
                )} ${
                  adultsCountHotel.reduce(
                    (total, adults) => total + adults,
                    0
                  ) > 1
                    ? "Adults"
                    : "Adult"
                }`}
                onClick={maxAllowedTravelers > 1 ? toggleDropdown : null}
                disabled={loading || maxAllowedTravelers === 1}
              />
              <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-gray-400">
                <FontAwesomeIcon
                  icon={faChevronDown}
                  className="w-3 h-3 text-gray-500"
                />
              </div>
              {dropdownOpen && (
                <div
                  ref={roomDropdownRef}
                  className="absolute z-10 w-full bg-white border rounded-lg shadow-lg mt-1 mr-5"
                >
                  <div className="flex items-center justify-between px-2 py-2 border-b border-gray-200">
                    <span className="text-xs font-semibold">
                      {selectedRooms} {selectedRooms > 1 ? "Rooms" : "Room"}
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        className="p-1 border rounded-full text-gray-600 flex items-center justify-center hover:border-[#028FA3] hover:text-[#028FA3] active:border-[#028FA3] active:text-[#028FA3]"
                        onClick={decrementRoomCount}
                        disabled={selectedRooms <= 1}
                      >
                        <FontAwesomeIcon icon={faMinus} />
                      </button>
                      <span className="text-sm font-semibold">
                        {selectedRooms}
                      </span>
                      <button
                        className="p-1 border rounded-full text-gray-600 flex items-center justify-center hover:border-[#028FA3] hover:text-[#028FA3] active:border-[#028FA3] active:text-[#028FA3]"
                        onClick={incrementRoomCount}
                      >
                        <FontAwesomeIcon icon={faPlus} />
                      </button>
                    </div>
                  </div>
                  {Array.from({ length: selectedRooms }).map((_, index) => (
                    <div
                      key={index}
                      className="px-2 py-2 border-t border-gray-200"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold">
                          {`Adults in Room ${index + 1}`}
                        </span>
                        <div className="flex items-center gap-2">
                          <button
                            className="p-1 border rounded-full text-gray-600 flex items-center justify-center hover:border-[#028FA3] hover:text-[#028FA3] active:border-[#028FA3] active:text-[#028FA3] cursor-pointer"
                            onClick={() => decrementAdults(index)}
                            disabled={adultsCountHotel[index] <= 1}
                          >
                            <FontAwesomeIcon icon={faMinus} />
                          </button>
                          <span className="text-sm font-semibold">
                            {adultsCountHotel[index]}
                          </span>
                          <button
                            className="p-1 border rounded-full text-gray-600 flex items-center justify-center hover:border-[#028FA3] hover:text-[#028FA3] active:border-[#028FA3] active:text-[#028FA3]"
                            onClick={() => incrementAdults(index)}
                            disabled={adultsCountHotel[index] >= 8}
                          >
                            <FontAwesomeIcon icon={faPlus} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
        {/* <div> */}
        <div className="w-full sm:w-2/12 h-16">
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
                  adultsCount={adultsCountHotel.reduce(
                    (total, adults) => total + adults,
                    0
                  )}
                  onTravelerChange={handleTravelerChange}
                  initialSelectedTravelers={selectedTravelers}
                  backgroundColor={backgroundColor}
                  travelCategory={TRAVEL_CATEGORIES.HOTELS}
                  isHomePage={isHomePage}
                  maxAllowedTravelers={maxAllowedTravelers}
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
        {/* </div> */}

        {loading && <div className="fixed inset-0  opacity-50 z-40"></div>}

        {!isHomePage && (
          <div className="w-full sm:w-2/12">
            <button
              onClick={handleSearch}
              disabled={loading}
              className="bg-[#028FA326] text-[#028FA3] p-3 rounded-lg w-full h-16 "
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

      {isHomePage && (
        <div className="relative top-0 sm:top-10 w-2/4 sm:w-1/4 m-auto">
          <button
            type="submit"
            onClick={handleSearch}
            className="w-full h-12 bg-[#028fa3] text-white rounded-full"
            disabled={loading}
          >
            {loading ? <FontAwesomeIcon icon={faSpinner} spin /> : "Search"}
          </button>
        </div>
      )}
    </>
  );
}
