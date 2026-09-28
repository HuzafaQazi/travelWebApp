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
import useCorporateHotelSearch from "@/utils/b2c/hotels/search";

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
    roomDetails,
    setRoomDetails,
    incrementChildren,
    decrementChildren,
    handleChildChange,
    handleAgeChange,
  } = useCorporateHotelSearch({ defaultLimit: 10 });

  const dispatch = useDispatch();
  const [fromInputValue, setFromInputValue] = useState("");

  const userDetails = useSelector((state) => state?.user?.userInfo);
  const travelPolicy = userDetails?.loggedInDetails?.travelPolicy?.[0];
  const policyConfigData = travelPolicy?.policyConfigData || [];

  const maxAllowedTravelers = getMaxAllowedTravelers(
    policyConfigData,
    TRAVEL_CATEGORIES.HOTELS
  );

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
  const [localIsDropdownVisible, setLocalIsDropdownVisible] = useState(false);
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
      // window.location.pathname === "/corporate/auth/booking" &&
      window.location.pathname === "/bookings"
    ) {
      return;
    }
    const fetchSearchSearch = async () => {
      try {
        if (!isDbInitialized) return;
        const searchData = await getSearchResults();
        if (searchData) {
          console.log("the search data is", searchData);
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
          setRoomDetails(
            searchData?.params?.roomDetails || [
              { adults: 2, children: 0, childAge: [] },
            ]
          );
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
    if (typeof window !== "undefined") {
      const isHomePage =
        window.location.pathname === "/corporate/auth/booking" ||
        window.location.pathname === "/" ||
        window.location.pathname === "/bookings";
      setIsHomePage(isHomePage);
    }
  }, []);

  useEffect(() => {
    if (isHomePage) {
      const today = new Date();
      const tomorrow = new Date(today);
      tomorrow.setDate(today.getDate() + 1);

      if (!checkInDate && !checkOutDate) {
        setDateRange([today, tomorrow]);
      }
    }
  }, [checkInDate, checkOutDate, setDateRange, isHomePage]);

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
    setFocusedIndex(-1);
  }, [suggestions]);

  useEffect(() => {
    if (!isLoading && inputValue && suggestions.length === 0) {
      const timeout = setTimeout(() => {
        setShowNoDataMessage(true);
      }, 1000);
      return () => clearTimeout(timeout);
    } else {
      setShowNoDataMessage(false);
    }
  }, [isLoading, inputValue, suggestions]);

  const toggleDropdown = () => {
    setDropdownOpen(!dropdownOpen);
  };

  const getBackgroundColor = () => {
    return isHomePage ? "bg-[#f6f6f6]" : "bg-white";
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

    if (normalizedDate) {
      setCheckInDate(normalizedDate);
      if (!checkOutDate || checkOutDate <= normalizedDate) {
        const nextDay = new Date(normalizedDate);
        nextDay.setDate(nextDay.getDate() + 1);
        setCheckOutDate(nextDay);
        setDateRange([normalizedDate, nextDay]);
      } else {
        setDateRange([normalizedDate, checkOutDate]);
      }
      setIsCalendarOpen(false);
    }
  };

  const handleCheckOutDateChange = (date) => {
    const normalizedDate =
      date instanceof Date ? new Date(date.setHours(12, 0, 0, 0)) : null;

    if (normalizedDate) {
      if (checkInDate && normalizedDate <= checkInDate) {
        const nextDay = new Date(checkInDate);
        nextDay.setDate(nextDay.getDate() + 1);
        setCheckOutDate(nextDay);
        setDateRange([checkInDate, nextDay]);
      } else {
        setCheckOutDate(normalizedDate);
        setDateRange([checkInDate, normalizedDate]);
      }
      setIsCheckoutCalendarOpen(false);
    }
  };

  const tileDisabledForCheckout = ({ date }) => {
    if (!checkInDate) return false;
    return date <= checkInDate;
  };

  const handleSearch = async () => {
    try {
      setLoading(true);
      if (setParentLoader) setParentLoader(true);
      const results = await performSearch(
        setSearchResults,
        setSearchRequest,
        setSearchFilters
      );
      if (results && updateSearch) {
        await updateSearch();
      }
      if (typeof setIsDropdownVisible === "function") {
        setIsDropdownVisible(false);
      } else {
        setLocalIsDropdownVisible(false);
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
        boxShadow: "0 0 0 1px #155EEF",
        borderColor: "#155EEF",
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

  const displayCheckIn = checkInDate ? formatDate(checkInDate) : "Check-In";
  const displayCheckOut = checkOutDate ? formatDate(checkOutDate) : "Check-Out";
  const backgroundColor = isHomePage ? "#f6f6f6" : "#FFFFFF";
  const today = new Date();
  const oneYearFromNow = new Date(
    today.getFullYear() + 1,
    today.getMonth(),
    today.getDate()
  );

  const totalAdults = roomDetails.reduce(
    (total, room) => total + room.adults,
    0
  );
  const totalChildren = roomDetails.reduce(
    (total, room) => total + room.children,
    0
  );

  return (
    <>
      <div className="flex flex-col sm:flex-row font-semibold px-3 py-3 items-center gap-2 sm:gap-3 w-full">
        <div
          className={`h-16 ${
            isHomePage ? "w-full sm:w-4/12" : "w-full sm:w-3/12"
          }`}
        >
          <div className="w-full h-full">
            <div className="space-y-1 relative">
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
                              color="#155EEF"
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
                              color="#155EEF"
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
            </div>
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
                      <div className="w-full h-fit border p-3 flex gap-2 items-center justify-between rounded-xl !border-[#155EEF]">
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
                          value={checkInDate}
                          showDoubleView={true}
                          selectRange={false}
                          className="double-view-calendar"
                          minDate={today}
                          next2Label={null}
                          prev2Label={null}
                          maxDate={oneYearFromNow}
                          tileContent={({ date, view, activeStartDate }) => {
                            if (view === "month") {
                              const monthInView = activeStartDate.getMonth();
                              if (date.getMonth() !== monthInView) {
                                return null;
                              }
                            }
                            return null;
                          }}
                          tileDisabled={({ date, view, activeStartDate }) => {
                            if (view === "month") {
                              const monthInView = activeStartDate.getMonth();
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
                          value={checkInDate}
                          showDoubleView={false}
                          selectRange={false}
                          className="double-view-calendar"
                          minDate={today}
                          next2Label={null}
                          prev2Label={null}
                          maxDate={oneYearFromNow}
                          tileContent={({ date, view, activeStartDate }) => {
                            if (view === "month") {
                              const monthInView = activeStartDate.getMonth();
                              if (date.getMonth() !== monthInView) {
                                return null;
                              }
                            }
                            return null;
                          }}
                          tileDisabled={({ date, view, activeStartDate }) => {
                            if (view === "month") {
                              const monthInView = activeStartDate.getMonth();
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
                  className={`w-full h-full cursor-pointer ${getBackgroundColor()} pl-8 pr-4 py-2 focus:bg-white rounded-lg placeholder-gray-500`}
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
                      <div className="w-full h-fit border p-3 flex gap-2 items-center justify-between rounded-xl !border-[#155EEF]">
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
                          value={checkOutDate}
                          selectRange={false}
                          showDoubleView={true}
                          className="w-full"
                          minDate={today}
                          next2Label={null}
                          prev2Label={null}
                          maxDate={oneYearFromNow}
                          tileContent={({ date, view, activeStartDate }) => {
                            if (view === "month") {
                              const monthInView = activeStartDate.getMonth();
                              if (date.getMonth() !== monthInView) {
                                return null;
                              }
                            }
                            return null;
                          }}
                          tileDisabled={({ date, view, activeStartDate }) => {
                            if (view === "month") {
                              const monthInView = activeStartDate.getMonth();
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
                          value={checkOutDate}
                          selectRange={false}
                          showDoubleView={false}
                          className="w-full"
                          minDate={today}
                          next2Label={null}
                          prev2Label={null}
                          maxDate={oneYearFromNow}
                          tileContent={({ date, view, activeStartDate }) => {
                            if (view === "month") {
                              const monthInView = activeStartDate.getMonth();
                              if (date.getMonth() !== monthInView) {
                                return null;
                              }
                            }
                            return null;
                          }}
                          tileDisabled={({ date, view, activeStartDate }) => {
                            if (view === "month") {
                              const monthInView = activeStartDate.getMonth();
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
        <div className="w-full sm:w-3/12 h-16">
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
                } ${getBackgroundColor()} pl-8 pr-4 py-2 focus:bg-white rounded-lg placeholder-gray-500`}
                value={`${selectedRooms} ${
                  selectedRooms > 1 ? "Rooms" : "Room"
                }, ${totalAdults} ${
                  totalAdults > 1 ? "Adults" : "Adult"
                }, ${totalChildren} ${
                  totalChildren > 1 ? "Children" : "Child"
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
                        className="p-1 border rounded-full text-gray-600 flex items-center justify-center hover:border-[#155EEF] hover:text-[#155EEF] active:border-[#155EEF] active:text-[#155EEF]"
                        onClick={decrementRoomCount}
                        disabled={selectedRooms <= 1}
                      >
                        <FontAwesomeIcon icon={faMinus} />
                      </button>
                      <span className="text-sm font-semibold">
                        {selectedRooms}
                      </span>
                      <button
                        className="p-1 border rounded-full text-gray-600 flex items-center justify-center hover:border-[#155EEF] hover:text-[#155EEF] active:border-[#155EEF] active:text-[#155EEF]"
                        onClick={incrementRoomCount}
                      >
                        <FontAwesomeIcon icon={faPlus} />
                      </button>
                    </div>
                  </div>
                  {roomDetails.map((room, index) => (
                    <div
                      key={index}
                      className="px-2 py-2 border-t border-gray-200"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold">
                          {`Room ${index + 1}`}
                        </span>
                      </div>
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-xs font-semibold">Adults</span>
                        <div className="flex items-center gap-2">
                          <button
                            className="p-1 border rounded-full text-gray-600 flex items-center justify-center hover:border-[#155EEF] hover:text-[#155EEF] active:border-[#155EEF] active:text-[#155EEF]"
                            onClick={() => decrementAdults(index)}
                            disabled={room.adults <= 1}
                          >
                            <FontAwesomeIcon icon={faMinus} />
                          </button>
                          <span className="text-sm font-semibold">
                            {room.adults}
                          </span>
                          <button
                            className="p-1 border rounded-full text-gray-600 flex items-center justify-center hover:border-[#155EEF] hover:text-[#155EEF] active:border-[#155EEF] active:text-[#155EEF]"
                            onClick={() => incrementAdults(index)}
                            disabled={room.adults >= 8}
                          >
                            <FontAwesomeIcon icon={faPlus} />
                          </button>
                        </div>
                      </div>
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-xs font-semibold">Children</span>
                        <div className="flex items-center gap-2">
                          <button
                            className="p-1 border rounded-full text-gray-600 flex items-center justify-center hover:border-[#155EEF] hover:text-[#155EEF] active:border-[#155EEF] active:text-[#155EEF]"
                            onClick={() => decrementChildren(index)}
                            disabled={room.children <= 0}
                          >
                            <FontAwesomeIcon icon={faMinus} />
                          </button>
                          <span className="text-sm font-semibold">
                            {room.children}
                          </span>
                          <button
                            className="p-1 border rounded-full text-gray-600 flex items-center justify-center hover:border-[#155EEF] hover:text-[#155EEF] active:border-[#155EEF] active:text-[#155EEF]"
                            onClick={() => incrementChildren(index)}
                            disabled={room.children >= 4}
                          >
                            <FontAwesomeIcon icon={faPlus} />
                          </button>
                        </div>
                      </div>
                      {room.children > 0 && (
                        <div className="mt-2">
                          <span className="text-xs font-semibold">
                            Age of Children
                          </span>
                          {room.childAge.map((age, childIndex) => (
                            <select
                              key={childIndex}
                              className="form-control mt-1 w-full"
                              value={age}
                              onChange={(e) =>
                                handleAgeChange(e, index, childIndex)
                              }
                            >
                              {Array.from({ length: 12 }, (_, i) => i + 1).map(
                                (option) => (
                                  <option key={option} value={option}>
                                    {option}
                                  </option>
                                )
                              )}
                            </select>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {loading && <div className="fixed inset-0 opacity-50 z-40"></div>}

        {!isHomePage && (
          <div className="w-full sm:w-2/12">
            <button
              onClick={handleSearch}
              disabled={loading}
              className="bg-[#155EEF15] text-[#155EEF] font-semibold p-3 rounded-lg w-full h-16 hover:bg-[#155EEF25] transition-colors"
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
            className="w-full h-12 bg-gradient-to-r from-[#155EEF] to-[#6D28D9] text-white font-semibold rounded-full flex items-center justify-center shadow-lg hover:shadow-xl hover:opacity-95 transition-all text-base sm:text-lg"
            disabled={loading}
          >
            {loading ? <FontAwesomeIcon icon={faSpinner} spin /> : "Search Hotels"}
          </button>
        </div>
      )}
    </>
  );
}
