import React, { useState, useRef, useEffect, useMemo } from "react";
import AsyncSelectInput from "@/components/Select/AsyncSelectInput";
import Select from "react-select";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCalendarDays,
  faChevronDown,
  faTrash,
  faCircleUser,
  faSpinner,
  faInfoCircle,
  faPlusCircle,
  faMinusCircle,
  faExclamationTriangle,
} from "@fortawesome/free-solid-svg-icons";
import { Calendar } from "react-calendar";
import "react-calendar/dist/Calendar.css";
import { useSelector, useDispatch } from "react-redux";
import { useRouter } from "next/router";
import SelectTravellers from "../../travellers/SelectTravellers";
import {
  setSelectedTravelers as setSelectedTravelersRedux,
  setDefaultSelectionDone,
  setAdultsCountTrain
} from "@/store/slices/travellersSlice";
import {
  getTransportMaxAllowedTravelers,
  getMinBookingWindow,
  getTransportCategoryName,
  interpretTravelEligibility
} from "@/utils/corporate/travelPolicy";
import { TRAVEL_CATEGORIES, CAR_MIN_ADULT_SELECTION, CAR_MAX_ADULT_SELECTION } from "@/utils/constants";
import showToast from "@/utils/toast";
import useFormValidator from "@/hooks/useFormValidator";
import RequestModal from "@/components/corporate/approvalRequest/request";
import axios from "@/utils/axios/axios";
import config from "@/config";
import { getUserCountryCode } from "@/utils/common";

const CarRentalSection = ({
  showDelete = false,
  onDelete,
  pickUpDate,
  dropOffDate,
  setPickUpDate,
  setDropOffDate,
  isPickUpCalendarOpen,
  setIsPickUpCalendarOpen,
  isDropOffCalendarOpen,
  setIsDropOffCalendarOpen,
  pickUpCalendarRef,
  dropOffCalendarRef,
  carType,
  setCarType,
  carTypeOptions,
  pickUpLocation,
  setPickUpLocation,
  dropOffLocation,
  setDropOffLocation,
  description,
  setDescription,
  minBookingWindow,
  validator,
  loading,
  defaultLocationOptions,
  index,
  showValidationErrors,
  sameLocationError,
  validateLocations,
  loadLocationOptions,
  abortControllerRef
}) => {
  const today = new Date();
  const oneYearFromNow = new Date(
    today.getFullYear() + 1,
    today.getMonth(),
    today.getDate()
  );

  const earliestAllowedDate = new Date();
  earliestAllowedDate.setHours(0, 0, 0, 0);
  earliestAllowedDate.setDate(earliestAllowedDate.getDate() + minBookingWindow);

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

  const handlePickUpDateChange = (date) => {
    const normalizedDate =
      date instanceof Date ? new Date(date.setHours(12, 0, 0, 0)) : null;

    if (normalizedDate < earliestAllowedDate) {
      showToast(
        "error",
        `This date is out of policy. You must book at least ${minBookingWindow} day(s) in advance.`
      );
      return;
    }

    if (normalizedDate) {
      setPickUpDate(normalizedDate);
      if (!dropOffDate || dropOffDate <= normalizedDate) {
        const nextDay = new Date(normalizedDate);
        nextDay.setDate(nextDay.getDate() + 1);
        setDropOffDate(nextDay);
      }
      setIsPickUpCalendarOpen(false);
    }
  };

  const handleDropOffDateChange = (date) => {
    const normalizedDate =
      date instanceof Date ? new Date(date.setHours(12, 0, 0, 0)) : null;

    if (normalizedDate < earliestAllowedDate) {
      showToast(
        "error",
        `This date is out of policy. You must book at least ${minBookingWindow} day(s) in advance.`
      );
      return;
    }

    if (normalizedDate) {
      if (pickUpDate && normalizedDate <= pickUpDate) {
        const nextDay = new Date(pickUpDate);
        nextDay.setDate(nextDay.getDate() + 1);
        setDropOffDate(nextDay);
      } else {
        setDropOffDate(normalizedDate);
      }
      setIsDropOffCalendarOpen(false);
    }
  };

  const tileDisabledForDropOff = ({ date }) => {
    if (!pickUpDate) return false;
    return date <= pickUpDate;
  };

  const handlePickUpLocationChange = (value) => {
    setPickUpLocation(value);
    if (value && dropOffLocation) {
      validateLocations(value, dropOffLocation, index);
    }
  };

  const handleDropOffLocationChange = (value) => {
    setDropOffLocation(value);
    if (value && pickUpLocation) {
      validateLocations(pickUpLocation, value, index);
    }
  };

  const displayPickUp = pickUpDate ? formatDate(pickUpDate) : "Pick-up Date";
  const displayDropOff = dropOffDate ? formatDate(dropOffDate) : "Drop-off Date";

  const customStyles = {
    control: (provided) => ({
      ...provided,
      backgroundColor: "#f6f6f6",
      border: showValidationErrors && !carType ? "1px solid #ef4444" : "none",
      borderRadius: "0.75rem",
      height: "3rem",
      boxShadow: "none",
      "&:hover": {
        border: showValidationErrors && !carType ? "1px solid #ef4444" : "none",
      },
    }),
    placeholder: (provided) => ({
      ...provided,
      color: "#6b7280",
      fontSize: "1rem",
      fontWeight: "500",
    }),
    singleValue: (provided) => ({
      ...provided,
      color: "#000000",
      fontSize: "1rem",
      fontWeight: "500",
    }),
    dropdownIndicator: (provided) => ({
      ...provided,
      color: "#6b7280",
    }),
    menu: (provided) => ({
      ...provided,
      zIndex: 20,
    }),
  };

  return (
    <div className="relative">
      <div className="flex flex-col sm:flex-row gap-3 py-2 min-w-full">
        <div className="relative flex flex-col sm:flex-row items-center gap-2 w-full sm:w-6/12">
          <div className="w-full sm:w-1/2">
            <div className="h-12">
              <AsyncSelectInput
                placeholder="Pick-up Location"
                value={pickUpLocation}
                onChange={handlePickUpLocationChange}
                loadOptions={(inputValue) =>
                  loadLocationOptions(inputValue, `carPickUp_${index}`)
                }
                instanceId={`car-pickup-${index}`}
                isDisabled={loading}
                showIcon={true}
                iconType="car"
                customFormatting={true}
                labelField="label"
                subtitleFields={["city", "state", "countryname"]}
                formatSubtitle={(option) =>
                  `${option.city || ""}, ${option.state || ""}, ${option.countryname || ""}`
                }
                defaultOptions={defaultLocationOptions}
                error={showValidationErrors && !pickUpLocation}
              />
            </div>
            <div className="text-red-500 text-xs mt-1">
              {validator.message("pickUpLocation", pickUpLocation, "required")}
            </div>
          </div>
          <div className="w-full sm:w-1/2">
            <div className="h-12">
              <AsyncSelectInput
                placeholder="Drop-off Location"
                value={dropOffLocation}
                onChange={handleDropOffLocationChange}
                loadOptions={(inputValue) =>
                  loadLocationOptions(inputValue, `carDropOff_${index}`)
                }
                instanceId={`car-dropoff-${index}`}
                isDisabled={loading}
                showIcon={true}
                iconType="car"
                customFormatting={true}
                labelField="label"
                subtitleFields={["city", "state", "countryname"]}
                formatSubtitle={(option) =>
                  `${option.city || ""}, ${option.state || ""}, ${option.countryname || ""}`
                }
                defaultOptions={defaultLocationOptions}
                error={showValidationErrors && !dropOffLocation}
              />
            </div>
            <div className="text-red-500 text-xs mt-1">
              {validator.message("dropOffLocation", dropOffLocation, "required")}
            </div>
          </div>
        </div>

        <div className="w-full sm:w-5/12 flex gap-3">
          <div className="w-1/2 h-12 self-center">
            <div className="relative h-full">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <FontAwesomeIcon
                  icon={faCalendarDays}
                  className="w-4 h-4 text-gray-500"
                />
              </div>
              <input
                value={displayPickUp}
                type="text"
                readOnly
                className={`w-full h-12 cursor-pointer bg-[#f6f6f6] pl-8 pr-4 py-2 text-[#000000] font-medium text-base rounded-xl placeholder-gray-500 ${showValidationErrors && !pickUpDate ? 'border-red-500 border' : ''}`}
                placeholder="Pick-up Date"
                onClick={() => setIsPickUpCalendarOpen(true)}
              />
              <div className="absolute inset-y-0 right-3 flex items-center pl-3 pointer-events-none">
                <FontAwesomeIcon
                  icon={faChevronDown}
                  className="w-3 h-3 text-gray-500"
                />
              </div>
              {isPickUpCalendarOpen && (
                <div
                  ref={pickUpCalendarRef}
                  className="absolute w-fit h-fit z-10 mt-1 bg-white shadow-lg rounded-lg"
                >
                  <div className="w-full h-full">
                    <div className="w-full h-fit border p-3 flex gap-2 items-center justify-between rounded-xl !border-[#155EEF]">
                      <div className="text-[#171A19CC] text-base">
                        {pickUpDate && dropOffDate
                          ? `Total Number of ${Math.ceil(
                            (dropOffDate - pickUpDate) /
                            (1000 * 60 * 60 * 24)
                          ) === 1
                            ? "Day: 1 Day"
                            : `Days: ${Math.ceil(
                              (dropOffDate - pickUpDate) /
                              (1000 * 60 * 60 * 24)
                            )} Days`
                          }`
                          : "Select Pick-up and Drop-off Dates"}
                      </div>
                    </div>
                    <div className="calendar-wrapper double-view hidden sm:block">
                      <Calendar
                        onChange={handlePickUpDateChange}
                        value={pickUpDate}
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
                        onChange={handlePickUpDateChange}
                        value={pickUpDate}
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
          <div className="w-1/2 h-12 self-center">
            <div className="relative h-full">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <FontAwesomeIcon
                  icon={faCalendarDays}
                  className="w-4 h-4 text-gray-500"
                />
              </div>
              <input
                value={displayDropOff}
                type="text"
                readOnly
                className={`w-full h-12 cursor-pointer bg-[#f6f6f6] pl-8 pr-4 py-2 text-[#000000] font-medium text-base rounded-xl placeholder-gray-500 ${showValidationErrors && !dropOffDate ? 'border-red-500 border' : ''}`}
                placeholder="Drop-off Date"
                onClick={() => setIsDropOffCalendarOpen(true)}
              />
              <div className="absolute inset-y-0 right-3 flex items-center pl-3 pointer-events-none">
                <FontAwesomeIcon
                  icon={faChevronDown}
                  className="w-3 h-3 text-gray-500"
                />
              </div>
              {isDropOffCalendarOpen && (
                <div
                  ref={dropOffCalendarRef}
                  className="absolute right-0 sm:right-auto w-fit h-fit z-10 mt-1 bg-white shadow-lg rounded-lg"
                >
                  <div className="w-full h-full">
                    <div className="w-full h-fit border p-3 flex gap-2 items-center justify-between rounded-xl !border-[#155EEF]">
                      <div className="text-[#171A19CC] text-base">
                        {pickUpDate && dropOffDate
                          ? `Total Number of ${Math.ceil(
                            (dropOffDate - pickUpDate) /
                            (1000 * 60 * 60 * 24)
                          ) === 1
                            ? "Day: 1 Day"
                            : `Days: ${Math.ceil(
                              (dropOffDate - pickUpDate) /
                              (1000 * 60 * 60 * 24)
                            )} Days`
                          }`
                          : "Select Pick-up and Drop-off Dates"}
                      </div>
                    </div>
                    <div className="calendar-wrapper double-view hidden sm:block">
                      <Calendar
                        onChange={handleDropOffDateChange}
                        value={dropOffDate}
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
                              tileDisabledForDropOff({ date })
                            );
                          }
                          return tileDisabledForDropOff({ date });
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
                        onChange={handleDropOffDateChange}
                        value={dropOffDate}
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
                              tileDisabledForDropOff({ date })
                            );
                          }
                          return tileDisabledForDropOff({ date });
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
        {showDelete && (
          <div className="py-3">
            <button
              className="text-red-500 text-sm font-medium cursor-pointer flex items-center gap-1"
              onClick={onDelete}
            >
              <FontAwesomeIcon icon={faTrash} className="w-4 h-4" />
              Delete
            </button>
          </div>
        )}
      </div>

      <div className="flex flex-col sm:flex-row gap-3 py-2 min-w-full">
        <div className="w-full sm:w-4/12 ">
          <div className="relative h-12">
            <Select
              options={carTypeOptions}
              value={carType}
              onChange={setCarType}
              placeholder="Car Type"
              styles={customStyles}
              isDisabled={loading}
            />
            <div className="text-red-500 text-xs mt-1">
              {validator.message("carType", carType, "required")}
            </div>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 w-full">
          <div className="w-full sm:w-4/12">
            <textarea
              className="w-full h-12 bg-[#f6f6f6] pl-4 pr-4 py-2 text-[#000000] font-medium text-base rounded-xl placeholder-gray-500 resize-none overflow-y-auto focus:outline-none focus:ring-2 focus:ring-[#155EEF]"
              placeholder="Description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
        </div>


      </div>

      {sameLocationError && (
        <div className="text-amber-600 text-xs font-medium flex items-center mt-1 mb-2">
          <FontAwesomeIcon icon={faExclamationTriangle} className="mr-1" />
          Pick-up and drop-off locations cannot be the same
        </div>
      )}

      {/* {showDelete && (
        <div className="py-3">
          <button
            className="text-red-500 text-sm font-medium cursor-pointer flex items-center gap-1"
            onClick={onDelete}
          >
            <FontAwesomeIcon icon={faTrash} className="w-4 h-4" />
            Delete
          </button>
        </div>
      )} */}
    </div>
  );
};

const CarNavigation = () => {
  const {
    travelersByCategory,
    adultsCountTrain,
    initialOptions,
    loggedInTraveler,
    status
  } = useSelector((state) => state.travellers);

  const today = new Date();
  const [carRentals, setCarRentals] = useState([
    {
      id: 0,
      pickUpLocation: null,
      dropOffLocation: null,
      pickUpDate: today,
      dropOffDate: null,
      description: "",
      carType: null
    }
  ]);
  const [isPickUpCalendarOpen, setIsPickUpCalendarOpen] = useState(false);
  const [isDropOffCalendarOpen, setIsDropOffCalendarOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isHomePage, setIsHomePage] = useState(false);
  const [travelerDropdownOpen, setTravelerDropdownOpen] = useState(false);
  const [isCountDropdownOpen, setIsCountDropdownOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isDropdownVisible, setIsDropdownVisible] = useState(false);
  const [validationTrigger, setValidationTrigger] = useState(false);
  const [showValidationErrors, setShowValidationErrors] = useState(false);
  const [defaultLocationOptions, setDefaultLocationOptions] = useState([]);
  const [carTypeOptions, setCarTypeOptions] = useState([]);
  const [travelPolicyEligibility, setTravelPolicyEligibility] = useState({ selfBook: false, canBookForOthers: false });
  const [sameLocationErrors, setSameLocationErrors] = useState({});
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
  const [isRequestSent, setIsRequestSent] = useState(false);

  const abortControllerRef = useRef({});
  const pickUpCalendarRef = useRef(null);
  const dropOffCalendarRef = useRef(null);
  const travelerDropdownRef = useRef(null);
  const countDropdownRef = useRef(null);
  const dispatch = useDispatch();
  const router = useRouter();

  const userDetails = useSelector((state) => state?.user?.userInfo);
  const travelPolicy = userDetails?.loggedInDetails?.travelPolicy?.[0];
  const policyConfigData = useMemo(
    () => travelPolicy?.policyConfigData,
    [travelPolicy]
  );

  const maxAllowedTravelers = useMemo(() => {
    if (policyConfigData) {
      return getTransportMaxAllowedTravelers(policyConfigData, TRAVEL_CATEGORIES.CAR_RENTAL);
    }
    return CAR_MAX_ADULT_SELECTION;
  }, [policyConfigData]);

  useEffect(() => {
    if (policyConfigData) {
      const eligibility = interpretTravelEligibility(policyConfigData, TRAVEL_CATEGORIES.CAR_RENTAL);
      setTravelPolicyEligibility(eligibility);
    }
  }, [policyConfigData]);

  const categoryName = getTransportCategoryName(TRAVEL_CATEGORIES.CAR_RENTAL);

  const selectedCarTravelers = useMemo(
    () => travelersByCategory?.[TRAVEL_CATEGORIES.CAR_RENTAL || "5"] || [],
    [travelersByCategory]
  );

  const groupMinWindow = useMemo(() => {
    if (selectedCarTravelers.length > 0) {
      return getMinBookingWindow(
        selectedCarTravelers,
        TRAVEL_CATEGORIES.CAR_RENTAL
      );
    }
    return 0;
  }, [selectedCarTravelers]);

  const customMessages = {
    required: "This field is required.",
  };

  const customRules = {};

  const [validator] = useFormValidator(customMessages, customRules);

  const resetForm = () => {
    setCarRentals([
      {
        id: 0,
        pickUpLocation: null,
        dropOffLocation: null,
        pickUpDate: today,
        dropOffDate: null,
        description: "",
        carType: null
      }
    ]);
    setSameLocationErrors({});
    setShowValidationErrors(false);
    validator.hideMessages();
  };

  const closeModal = () => {
    setIsRequestModalOpen(false);
  };

  const loadLocationOptions = async (inputValue, key = "default") => {
    try {
      if (abortControllerRef.current[key]) {
        try {
          if (typeof abortControllerRef.current[key].abort === "function") {
            abortControllerRef.current[key].abort();
          }
        } catch (error) {
          console.error("Error aborting previous request:", error);
        }
      }

      const controller = new AbortController();
      abortControllerRef.current[key] = controller;

      const countryCode = getUserCountryCode(userDetails);
      const path = config.CITY_BY_COUNTRY_CODE.replace(
        ":countryCode",
        countryCode
      );
      const url = `${path}?search=${inputValue}&limit=10`;

      const response = await axios.get(url, { signal: controller.signal });

      if (response?.data?.status && Array.isArray(response.data.data)) {
        return response.data.data.map((location) => ({
          value: location.id || location._id || location.locationCode,
          label: location.name || location.locationName,
          city: location.name,
          state: location.stateName,
          countryname: location.countryName,
          originalData: location,
        }));
      }
      return [];
    } catch (error) {
      if (error.name !== "AbortError") {
        console.error(`Error loading locations for ${key}:`, error);
      }
      return [];
    }
  };

  useEffect(() => {
    const fetchMasterData = async () => {
      try {
        setLoading(true);
        const countryCode = getUserCountryCode(userDetails);

        const [carTypesResponse, locationsResponse] = await Promise.all([
          axios.get(config.CORPORATE.CAR_TYPE),
          axios.get(
            `${config.CITY_BY_COUNTRY_CODE.replace(
              ":countryCode",
              countryCode
            )}?limit=10`
          ),
        ]);

        if (
          carTypesResponse?.data?.status &&
          Array.isArray(carTypesResponse.data.data)
        ) {
          const formattedCarTypes = carTypesResponse.data.data.map(
            (carType) => ({
              value: carType._id,
              label: carType.name,
              code: carType.code,
              description: carType.description,
              capacity: carType.capacity,
              icon: carType.icon,
              originalData: carType,
            })
          );
          setCarTypeOptions(formattedCarTypes);
        }

        if (
          locationsResponse?.data?.status &&
          Array.isArray(locationsResponse.data.data)
        ) {
          const formattedLocations = locationsResponse.data.data.map(
            (item) => ({
              value: item.id || item._id || item.locationCode,
              label: item.name || item.locationName,
              locationCode: item.locationCode,
              city: item.name,
              state: item.stateName,
              countryname: item.countryName,
              iconType: "car",
              originalData: item,
            })
          );
          setDefaultLocationOptions(formattedLocations);
        }
      } catch (error) {
        console.error("Error fetching master data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchMasterData();
  }, [userDetails]);

  const validateLocations = (pickUpLocation, dropOffLocation, index) => {
    if (pickUpLocation && dropOffLocation && pickUpLocation.value === dropOffLocation.value) {
      setSameLocationErrors(prev => ({ ...prev, [index]: true }));
      return false;
    } else {
      setSameLocationErrors(prev => ({ ...prev, [index]: false }));
      return true;
    }
  };

  const validateAllRentals = () => {
    let isValid = true;
    carRentals.forEach((rental, index) => {
      if (rental.pickUpLocation && rental.dropOffLocation) {
        const rentalValid = validateLocations(rental.pickUpLocation, rental.dropOffLocation, index);
        if (!rentalValid) isValid = false;
      }
    });
    return isValid;
  };

  const increment = () => {
    const effectiveMax = maxAllowedTravelers;

    if (adultsCountTrain < effectiveMax) {
      dispatch(setAdultsCountTrain(adultsCountTrain + 1));

      if (adultsCountTrain + 1 === maxAllowedTravelers) {
        showToast("error", `Maximum policy limit of ${maxAllowedTravelers} travelers reached for ${categoryName} travel.`);
      }
    }
  };

  const decrement = () => {
    if (adultsCountTrain > 1) {
      if (adultsCountTrain > selectedCarTravelers.length) {
        dispatch(setAdultsCountTrain(adultsCountTrain - 1));
      } else {
        showToast("error", "Please remove travelers first before decreasing count");
      }
    }
  };

  const handleTravelerChange = (updatedTravelers) => {
    if (updatedTravelers.length > adultsCountTrain) {
      dispatch(setAdultsCountTrain(updatedTravelers.length));
    }

    dispatch(
      setSelectedTravelersRedux({
        travelers: updatedTravelers,
        category: TRAVEL_CATEGORIES.CAR_RENTAL,
      })
    );
    dispatch(
      setDefaultSelectionDone(updatedTravelers.length > 0)
    );
  };

  const handleAddCarRental = () => {
    validator.hideMessages();
    setShowValidationErrors(false);

    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    setCarRentals([
      ...carRentals,
      {
        id: carRentals.length,
        pickUpLocation: null,
        dropOffLocation: null,
        pickUpDate: today,
        dropOffDate: tomorrow,
        description: "",
        carType: null
      }
    ]);
  };

  const handleDeleteCarRental = (index) => {
    const updatedRentals = carRentals.filter((_, i) => i !== index);
    setCarRentals(updatedRentals);

    const updatedErrors = { ...sameLocationErrors };
    delete updatedErrors[index];
    setSameLocationErrors(updatedErrors);
  };

  const handleFieldChange = (index, field, value) => {
    const updatedRentals = [...carRentals];
    updatedRentals[index] = { ...updatedRentals[index], [field]: value };
    setCarRentals(updatedRentals);
  };

  const handlePickUpDateChange = (index, date) => {
    const updatedRentals = [...carRentals];
    updatedRentals[index] = { ...updatedRentals[index], pickUpDate: date };
    setCarRentals(updatedRentals);
  };

  const handleDropOffDateChange = (index, date) => {
    const updatedRentals = [...carRentals];
    updatedRentals[index] = { ...updatedRentals[index], dropOffDate: date };
    setCarRentals(updatedRentals);
  };

  const handleRequestApproval = () => {
    const isValid = validator.allValid();
    if (!isValid) {
      validator.showMessages();
      setShowValidationErrors(true);
      setValidationTrigger((prev) => !prev);
      return;
    }

    const hasSameLocationErrors = Object.values(sameLocationErrors).some(val => val === true);

    if (hasSameLocationErrors) {
      showToast("error", "Pick-up and drop-off locations cannot be the same");
      return;
    }

    const invalidRentals = carRentals.filter(rental =>
      !rental.pickUpLocation || !rental.dropOffLocation || !rental.pickUpDate || !rental.dropOffDate || !rental.carType
    );

    if (invalidRentals.length > 0) {
      showToast("error", "Please fill in all required fields for all car rentals");
      return;
    }

    if (!validateAllRentals()) {
      showToast("error", "Pick-up and drop-off locations cannot be the same");
      return;
    }

    if (!selectedCarTravelers.length) {
      showToast("error", "Please select at least one traveler");
      return;
    }

    setIsRequestModalOpen(true);
  };

  const handleSendApproval = async (data) => {
    try {
      setLoading(true);

      let companyId = null;
      let userName = null;
      if (userDetails) {
        const { loggedInDetails } = userDetails;
        companyId = userDetails?.companyId;
        userName = `${loggedInDetails?.userDetails?.firstName || ""} ${loggedInDetails?.userDetails?.lastName || ""}`;
      }

      const origin = carRentals[0].pickUpLocation?.label || "";
      const destination = carRentals[0].dropOffLocation?.label || "";
      const travelDate = carRentals[0].pickUpDate.toISOString();

      const approvalPayload = {
        // companyId: companyId,
        // userId: userDetails?.userId,
        // userName: userName,
        travelCategory: TRAVEL_CATEGORIES.CAR_RENTAL,
        // createdBy: userDetails?.userId,
        // modifiedBy: userDetails?.userId,
        bookingdetails: {
          origin: origin,
          destination: destination,
          travelDate: travelDate,
          reasonForTravel: data?.reason || null,
          totalBookingAmount: 0,
          passengerDetails: selectedCarTravelers.map(traveler => ({
            employeeUserId: traveler.data?._id,
            email: traveler.data?.workEmail || null,
          })),
          journeys: carRentals.map(rental => ({
            fromCity: rental.pickUpLocation,
            toCity: rental.dropOffLocation,
            departureDate: rental.pickUpDate.toISOString(),
            returnDate: rental.dropOffDate.toISOString(),
            description: rental.description,
            carType: rental.carType?.originalData
          }))
        },
        // status: "Active",
      };

      const response = await axios.post(`${config.CORPORATE.SEND_APPROVAL_TRAIN_BUS_CAR}`, approvalPayload);

      if (response.data.status) {
        setTimeout(() => {
          closeModal();
          setLoading(false);
          setIsRequestSent(true);
          showToast("success", "Car rental request has been submitted for approval");
          resetForm();
          const bookingId = response.data.data.approvalRequest.bookingId || "";

          console.log("the booking is ", response.data.data.approvalRequest.bookingId)
          router.push(`/corporate/auth/booking/carbustrain/commonApproval?bookingId=${bookingId}`);
        }, 1500);
      } else {
        throw new Error(response.data.message || "Failed to submit request");
      }
    } catch (error) {
      console.error("Error sending car rental approval request:", error);
      setLoading(false);
      closeModal();
      const errorMessage = error.response?.data?.message || error.message || "Failed to submit request. Please try again.";
      showToast("error", errorMessage);
    }
  };

  useEffect(() => {
    if (maxAllowedTravelers === 1 && adultsCountTrain !== 1) {
      dispatch(setAdultsCountTrain(1));
      showToast("info", `Self-booking enabled for ${categoryName} travel. Traveler count set to 1.`);
    }

    if (maxAllowedTravelers < adultsCountTrain) {
      dispatch(setAdultsCountTrain(maxAllowedTravelers));
      showToast("info", `Traveler count adjusted to policy maximum of ${maxAllowedTravelers} for ${categoryName} travel.`);
    }

    if (selectedCarTravelers.length > adultsCountTrain) {
      const trimmedTravelers = selectedCarTravelers.slice(0, adultsCountTrain);
      dispatch(
        setSelectedTravelersRedux({
          travelers: trimmedTravelers,
          category: TRAVEL_CATEGORIES.CAR_RENTAL,
        })
      );
    }
  }, [adultsCountTrain, maxAllowedTravelers, selectedCarTravelers, dispatch, categoryName]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (pickUpCalendarRef.current && !pickUpCalendarRef.current.contains(event.target)) {
        setIsPickUpCalendarOpen(false);
      }
      if (dropOffCalendarRef.current && !dropOffCalendarRef.current.contains(event.target)) {
        setIsDropOffCalendarOpen(false);
      }
      if (travelerDropdownRef.current && !travelerDropdownRef.current.contains(event.target)) {
        setTravelerDropdownOpen(false);
      }
      if (countDropdownRef.current && !countDropdownRef.current.contains(event.target)) {
        setIsCountDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const isHomePage =
        window.location.pathname === "/corporate/auth/booking" ||
        window.location.pathname === "/";
      setIsHomePage(isHomePage);
    }
  }, []);

  const getBackgroundColor = () => {
    return isHomePage ? "bg-[#f6f6f6]" : "bg-white";
  };

  const backgroundColor = isHomePage ? "#f6f6f6" : "#FFFFFF";

  useEffect(() => {
    return () => {
      Object.values(abortControllerRef.current).forEach((controller) => {
        if (controller && typeof controller.abort === "function") {
          try {
            controller.abort();
          } catch (error) {
            console.error("Error aborting request:", error);
          }
        }
      });
    };
  }, []);

  return (
    <div className="flex flex-col">
      {isRequestSent && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-4 flex items-center animate-fade-in-down">
          <FontAwesomeIcon icon={faInfoCircle} className="text-green-500 mr-2" />
          <span>Your car rental request has been submitted successfully!</span>
        </div>
      )}

      {carRentals.map((rental, index) => (
        <div key={rental.id} className="mb-4 relative">
          <CarRentalSection
            showDelete={index > 0}
            onDelete={() => handleDeleteCarRental(index)}
            pickUpDate={rental.pickUpDate}
            dropOffDate={rental.dropOffDate}
            setPickUpDate={(date) => handlePickUpDateChange(index, date)}
            setDropOffDate={(date) => handleDropOffDateChange(index, date)}
            isPickUpCalendarOpen={isPickUpCalendarOpen && index === carRentals.length - 1}
            setIsPickUpCalendarOpen={setIsPickUpCalendarOpen}
            isDropOffCalendarOpen={isDropOffCalendarOpen && index === carRentals.length - 1}
            setIsDropOffCalendarOpen={setIsDropOffCalendarOpen}
            pickUpCalendarRef={pickUpCalendarRef}
            dropOffCalendarRef={dropOffCalendarRef}
            carType={rental.carType}
            setCarType={(value) => handleFieldChange(index, "carType", value)}
            carTypeOptions={carTypeOptions}
            pickUpLocation={rental.pickUpLocation}
            setPickUpLocation={(value) => handleFieldChange(index, "pickUpLocation", value)}
            dropOffLocation={rental.dropOffLocation}
            setDropOffLocation={(value) => handleFieldChange(index, "dropOffLocation", value)}
            description={rental.description}
            setDescription={(value) => handleFieldChange(index, "description", value)}
            minBookingWindow={groupMinWindow}
            validator={validator}
            loading={loading}
            defaultLocationOptions={defaultLocationOptions}
            index={index}
            showValidationErrors={showValidationErrors}
            sameLocationError={sameLocationErrors[index]}
            validateLocations={validateLocations}
            loadLocationOptions={loadLocationOptions}
            abortControllerRef={abortControllerRef}
          />
        </div>
      ))}

      <div className="flex justify-start py-2">
        <button
          className="text-[#155EEF] text-sm font-medium underline cursor-pointer hover:text-[#027a8c] transition-colors flex items-center"
          onClick={handleAddCarRental}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="8" x2="12" y2="16"></line>
            <line x1="8" y1="12" x2="16" y2="12"></line>
          </svg>
          Add Car
        </button>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 py-4 mb-4">
        <div className="w-full sm:w-3/12">
          <div className="h-12">
            <div className="w-full h-full relative" ref={countDropdownRef}>
              <div
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
                onClick={() =>
                  maxAllowedTravelers > 1
                    ? setIsCountDropdownOpen(!isCountDropdownOpen)
                    : null
                }
                className={`flex items-center w-full h-full pl-10 rounded-xl ${isHomePage
                  ? "bg-[#f6f6f6]"
                  : isDropdownVisible
                    ? "bg-[#f6f6f6]"
                    : "bg-white"
                  } ${maxAllowedTravelers > 1
                    ? "cursor-pointer"
                    : "cursor-not-allowed"
                  } ${showValidationErrors && !selectedCarTravelers.length ? 'border border-red-500' : ''}`}
              >
                <span className="text-[#000000] text-base font-medium">
                  {adultsCountTrain}{" "}
                  {adultsCountTrain > 1 ? "Travellers" : "Traveller"}
                </span>
              </div>

              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <FontAwesomeIcon
                  icon={faCircleUser}
                  className="w-4 h-4 text-gray-500"
                />
              </div>

              {isHovered && (
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
                        {maxAllowedTravelers <= 1 ? (
                          <span>Self-booking mode: Only you can be selected</span>
                        ) : (
                          <span>Maximum {maxAllowedTravelers} travelers allowed for {categoryName} travel</span>
                        )}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {isCountDropdownOpen && (
                <div className="absolute z-10 w-full mt-1 py-3 bg-white rounded-lg shadow-lg border border-gray-200">
                  <div className="flex items-center justify-center gap-4">
                    <button
                      onClick={decrement}
                      className={`text-xl rounded-full hover:bg-gray-100 transition-colors ${adultsCountTrain <= CAR_MIN_ADULT_SELECTION
                        ? "text-gray-300"
                        : "text-[#155EEF]"
                        }`}
                      disabled={adultsCountTrain <= CAR_MIN_ADULT_SELECTION}
                    >
                      <FontAwesomeIcon icon={faMinusCircle} size={16} />
                    </button>

                    <span className="text-[#155EEF] text-sm min-w-[60px] text-center">
                      {adultsCountTrain} {adultsCountTrain > 1 ? "Adults" : "Adult"}
                    </span>

                    <button
                      onClick={increment}
                      className={`text-xl rounded-full hover:bg-gray-100 transition-colors ${adultsCountTrain >= maxAllowedTravelers
                        ? "text-gray-300"
                        : "text-[#155EEF]"
                        }`}
                      disabled={adultsCountTrain >= maxAllowedTravelers}
                    >
                      <FontAwesomeIcon icon={faPlusCircle} size={16} />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="w-full sm:w-6/12">
          <div className="h-12">
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
                    adultsCount={adultsCountTrain}
                    onTravelerChange={handleTravelerChange}
                    initialSelectedTravelers={selectedCarTravelers}
                    backgroundColor={backgroundColor}
                    travelCategory={TRAVEL_CATEGORIES.CAR_RENTAL}
                    isHomePage={isHomePage}
                    maxAllowedTravelers={maxAllowedTravelers}
                    error={showValidationErrors && !selectedCarTravelers.length}
                  />
                  <div className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400">
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
      </div>

      <div className="w-full sm:w-4/12 mx-auto mt-4">
        <button
          onClick={handleRequestApproval}
          disabled={loading}
          className={`${loading ? "bg-gray-400 cursor-not-allowed" : "bg-[#155EEF] hover:bg-[#027a8c]"
            } text-white p-3 rounded-lg w-full h-12 transition-colors duration-200 relative overflow-hidden`}
        >
          {loading ? (
            <div className="flex items-center justify-center">
              <FontAwesomeIcon icon={faSpinner} spin className="mr-2" />
              Processing...
            </div>
          ) : (
            <>
              <span className="absolute inset-0 overflow-hidden flex items-center justify-center transition-all duration-300 ease-out bg-[#027a8c] transform translate-y-full group-hover:translate-y-0"></span>
              <span className="relative z-10">Request for Approval</span>
            </>
          )}
        </button>
      </div>

      {showValidationErrors && selectedCarTravelers.length === 0 && (
        <div className="text-center mt-2 text-red-500 text-sm">
          Please select at least one traveler to proceed
        </div>
      )}

      {isRequestModalOpen && (
        <RequestModal
          isOpen={isRequestModalOpen}
          title="Send Approval"
          subtitle="You will get notification to continue booking once the request gets approved."
          showApproverDetails={true}
          showReasonInput={true}
          onClose={closeModal}
          onSubmit={handleSendApproval}
          travellers={selectedCarTravelers}
          buttonConfig={{
            cancel: "Close",
            submit: "Send Approval Request",
          }}
        />
      )}
    </div>
  );
};

export default CarNavigation;