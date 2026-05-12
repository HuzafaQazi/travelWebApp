import React, { useState, useRef, useEffect, useMemo } from "react";
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
import { TRAVEL_CATEGORIES, TRAIN_MIN_ADULT_SELECTION, TRAIN_MAX_ADULT_SELECTION } from "@/utils/constants";
import showToast from "@/utils/toast";
import useFormValidator from "@/hooks/useFormValidator";
import AsyncSelectInput from "@/components/Select/AsyncSelectInput";
import RequestModal from "@/components/corporate/approvalRequest/request";
import axios from "@/utils/axios/axios";
import config from "@/config";
import { getUserCountryCode } from "@/utils/common";

const TrainJourneySection = ({
  showDelete = false,
  onDelete,
  departureDate,
  setDepartureDate,
  isDepartureCalendarOpen,
  setIsDepartureCalendarOpen,
  departureCalendarRef,
  departFrom,
  setDepartFrom,
  arriveAt,
  setArriveAt,
  description,
  setDescription,
  minBookingWindow,
  validator,
  loading,
  defaultLocationOptions,
  loadStationOptions,
  abortControllerRef,
  index,
  showValidationErrors,
  sameLocationError,
  validateLocations
}) => {
  const today = new Date();
  const oneYearFromNow = new Date(
    today.getFullYear() + 1,
    today.getMonth(),
    today.getDate()
  );

  // Calculate earliest allowed booking date based on policy
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

  const handleDepartureDateChange = (date) => {
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
      setDepartureDate(normalizedDate);
      setIsDepartureCalendarOpen(false);
    }
  };

  const handleDepartFromChange = (value) => {
    setDepartFrom(value);
    if (value && arriveAt) {
      validateLocations(value, arriveAt, index);
    }
  };

  const handleArriveAtChange = (value) => {
    setArriveAt(value);
    if (value && departFrom) {
      validateLocations(departFrom, value, index);
    }
  };

  const displayDeparture = departureDate ? formatDate(departureDate) : "Departure Date";

  return (
    <div className="relative">
      <div className="flex flex-col sm:flex-row gap-3 py-2 min-w-full">
        <div className="relative flex flex-col sm:flex-row items-center gap-2 w-full sm:w-6/12">
          <div className="w-full sm:w-1/2">
            <div className="h-12">
              <AsyncSelectInput
                placeholder="Depart From"
                value={departFrom}
                onChange={handleDepartFromChange}
                loadOptions={(inputValue) =>
                  loadStationOptions(inputValue, `trainFrom_${index}`)
                }
                instanceId={`train-from-${index}`}
                isDisabled={loading}
                showIcon={true}
                iconType="train"
                customFormatting={true}
                labelField="label"
                subtitleFields={["city", "state", "countryname"]}
                formatSubtitle={(option) =>
                  `${option.city || ""}, ${option.state || ""}, ${option.countryname || ""
                  }`
                }
                defaultOptions={defaultLocationOptions}
                error={showValidationErrors && !departFrom}
              />
            </div>
            <div className="text-red-500 text-xs mt-1">
              {validator.message(
                "departFrom",
                departFrom,
                "required"
              )}
            </div>
          </div>
          <div className="w-full sm:w-1/2">
            <div className="h-12">
              <AsyncSelectInput
                placeholder="Arrive At"
                value={arriveAt}
                onChange={handleArriveAtChange}
                loadOptions={(inputValue) =>
                  loadStationOptions(inputValue, `trainTo_${index}`)
                }
                instanceId={`train-to-${index}`}
                isDisabled={loading}
                showIcon={true}
                iconType="train"
                customFormatting={true}
                labelField="label"
                subtitleFields={["city", "state", "countryname"]}
                formatSubtitle={(option) =>
                  `${option.city || ""}, ${option.state || ""}, ${option.countryname || ""
                  }`
                }
                defaultOptions={defaultLocationOptions}
                error={showValidationErrors && !arriveAt}
              />
            </div>
            <div className="text-red-500 text-xs mt-1">
              {validator.message(
                "arriveAt",
                arriveAt,
                "required"
              )}
            </div>
          </div>
        </div>

        <div className="w-full sm:w-3/12">
          <div className="relative h-full">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <FontAwesomeIcon
                icon={faCalendarDays}
                className="w-4 h-4 text-gray-500"
              />
            </div>
            <input
              value={displayDeparture}
              type="text"
              readOnly
              className={`w-full h-12 cursor-pointer bg-[#f6f6f6] pl-8 pr-4 py-2 text-[#000000] font-medium text-base rounded-xl placeholder-gray-500 ${showValidationErrors && !departureDate ? 'border-red-500 border' : ''}`}
              placeholder="Departure Date"
              onClick={() => setIsDepartureCalendarOpen(true)}
            />
            <div className="absolute inset-y-0 right-3 flex items-center pl-3 pointer-events-none">
              <FontAwesomeIcon
                icon={faChevronDown}
                className="w-3 h-3 text-gray-500"
              />
            </div>
            {isDepartureCalendarOpen && (
              <div
                ref={departureCalendarRef}
                className="absolute w-fit h-fit z-10 mt-1 bg-white shadow-lg rounded-lg"
              >
                <div className="w-full h-full">
                  <div className="w-full h-fit border p-3 flex gap-2 items-center justify-between rounded-xl !border-[#028fa3]">
                    <div className="text-[#171A19CC] text-base">
                      Select Departure Date
                    </div>
                  </div>
                  <div className="calendar-wrapper double-view hidden sm:block">
                    <Calendar
                      onChange={handleDepartureDateChange}
                      value={departureDate}
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
                      onChange={handleDepartureDateChange}
                      value={departureDate}
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

        <div className={`w-full ${showDelete ? "sm:w-3/12" : "sm:w-4/12"} h-12`}>
          <textarea
            className="w-full h-full bg-[#f6f6f6] pl-4 pr-4 py-2 text-[#000000] font-medium text-base rounded-xl placeholder-gray-500 resize-none overflow-y-auto focus:outline-none focus:ring-2 focus:ring-[#028fa3]"
            placeholder="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>


        {showDelete && (
          <div className="py-2">
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

      {/* Same location error message */}
      {sameLocationError && (
        <div className="text-amber-600 text-xs font-medium flex items-center mt-1 mb-2">
          <FontAwesomeIcon icon={faExclamationTriangle} className="mr-1" />
          Departure and arrival locations cannot be the same
        </div>
      )}


    </div>
  );
};

export default function TrainNavigation() {
  // Get travelers state from Redux
  const {
    travelersByCategory,
    adultsCountTrain,
    initialOptions,
    loggedInTraveler,
    status
  } = useSelector((state) => state.travellers);

  // Initialize with today's date as default
  const today = new Date();
  const [trainJourneys, setTrainJourneys] = useState([
    { id: 0, departFrom: null, arriveAt: null, departureDate: today, description: "" }
  ]);
  const [isDepartureCalendarOpen, setIsDepartureCalendarOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isHomePage, setIsHomePage] = useState(false);
  const [travelerDropdownOpen, setTravelerDropdownOpen] = useState(false);
  const [isCountDropdownOpen, setIsCountDropdownOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isDropdownVisible, setIsDropdownVisible] = useState(false);
  const [validationTrigger, setValidationTrigger] = useState(false);
  const [showValidationErrors, setShowValidationErrors] = useState(false);
  const [defaultLocationOptions, setDefaultLocationOptions] = useState([]);
  const [travelPolicyEligibility, setTravelPolicyEligibility] = useState({ selfBook: false, canBookForOthers: false });
  const [sameLocationErrors, setSameLocationErrors] = useState({});
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
  const [isRequestSent, setIsRequestSent] = useState(false);

  // Create a ref to store abort controllers for API requests
  const abortControllerRef = useRef({});

  const departureCalendarRef = useRef(null);
  const travelerDropdownRef = useRef(null);
  const countDropdownRef = useRef(null);
  const dispatch = useDispatch();
  const router = useRouter();

  // Get user details and travel policy from Redux
  const userDetails = useSelector((state) => state?.user?.userInfo);
  const travelPolicy = userDetails?.loggedInDetails?.travelPolicy?.[0];
  const policyConfigData = useMemo(
    () => travelPolicy?.policyConfigData,
    [travelPolicy]
  );

  // Get policy-related limits
  const maxAllowedTravelers = useMemo(() => {
    if (policyConfigData) {
      return getTransportMaxAllowedTravelers(policyConfigData, TRAVEL_CATEGORIES.TRAINS);
    }
    return TRAIN_MAX_ADULT_SELECTION;
  }, [policyConfigData]);

  // Get travel policy eligibility
  useEffect(() => {
    if (policyConfigData) {
      const eligibility = interpretTravelEligibility(policyConfigData, TRAVEL_CATEGORIES.TRAINS);
      setTravelPolicyEligibility(eligibility);
    }
  }, [policyConfigData]);

  const categoryName = getTransportCategoryName(TRAVEL_CATEGORIES.TRAINS);

  const selectedTrainTravelers = useMemo(
    () => travelersByCategory?.[TRAVEL_CATEGORIES.TRAINS || "3"] || [],
    [travelersByCategory]
  );

  const groupMinWindow = useMemo(() => {
    if (selectedTrainTravelers.length > 0) {
      return getMinBookingWindow(
        selectedTrainTravelers,
        TRAVEL_CATEGORIES.TRAINS
      );
    }
    return 0; // Default value if no travelers selected
  }, [selectedTrainTravelers]);

  const customMessages = {
    required: "This field is required.",
  };

  const customRules = {};

  const [validator] = useFormValidator(customMessages, customRules);

  const resetForm = () => {
    setTrainJourneys([
      { id: 0, departFrom: null, arriveAt: null, departureDate: today, description: "" }
    ]);
    setSameLocationErrors({});
    setShowValidationErrors(false);
    validator.hideMessages();
  };

  const closeModal = () => {
    setIsRequestModalOpen(false);
  };

  // Fetch initial default train station options when component mounts
  useEffect(() => {
    const fetchDefaultLocations = async () => {
      try {
        setLoading(true);
        const countryCode = getUserCountryCode(userDetails); // e.g. "IN"
        // interpolate the path param…
        const path = config.CITY_BY_COUNTRY_CODE.replace(
          ":countryCode",
          countryCode
        );
        // …then add your query string
        const url = `${path}?limit=10`;

        const response = await axios.get(url);
        if (response?.data?.status && Array.isArray(response.data.data)) {
          const formattedOptions = response.data.data.map((item) => ({
            value: item.id || item._id || item.locationCode,
            label: item.name || item.locationName,
            city: item.name,
            state: item.stateName,
            countryname: item.countryName,
            originalData: item,
          }));
          setDefaultLocationOptions(formattedOptions);
        }
      } catch (error) {
        console.error("Error fetching default locations:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDefaultLocations();
  }, [userDetails]);

  // Function to validate whether departure and arrival locations are the same
  const validateLocations = (departFrom, arriveAt, index) => {
    if (departFrom && arriveAt && departFrom.value === arriveAt.value) {
      setSameLocationErrors(prev => ({ ...prev, [index]: true }));
      return false;
    } else {
      setSameLocationErrors(prev => ({ ...prev, [index]: false }));
      return true;
    }
  };

  // Validate all journeys for same location errors
  const validateAllJourneys = () => {
    let isValid = true;
    trainJourneys.forEach((journey, index) => {
      if (journey.departFrom && journey.arriveAt) {
        const journeyValid = validateLocations(journey.departFrom, journey.arriveAt, index);
        if (!journeyValid) isValid = false;
      }
    });
    return isValid;
  };

  // Function to load station options for AsyncSelect
  const loadStationOptions = async (inputValue, key = "default") => {
    try {
      // Cancel previous request for this key if exists
      if (abortControllerRef.current[key]) {
        try {
          // Safely abort the previous request
          if (typeof abortControllerRef.current[key].abort === "function") {
            abortControllerRef.current[key].abort();
          }
        } catch (error) {
          console.error("Error aborting previous request:", error);
        }
      }

      // Create new abort controller directly
      const controller = new AbortController();
      abortControllerRef.current[key] = controller;

      const countryCode = getUserCountryCode(userDetails); // e.g. "IN"

      const path = config.CITY_BY_COUNTRY_CODE.replace(
        ":countryCode",
        countryCode
      );
      // …then add your query string
      const url = `${path}?search=${inputValue}&limit=10`;

      const response = await axios.get(url, { signal: controller.signal });

      // Process API response
      if (response?.data?.status && Array.isArray(response.data.data)) {
        return response.data.data.map((station) => ({
          value: station.id || station._id || station.stationId,
          label: station.name || station.locationName,
          city: station.name,
          state: station.stateName,
          countryname: station.countryName,
          originalData: station,
        }));
      }
      return [];
    } catch (error) {
      if (error.name !== "AbortError") {
        console.error(`Error loading stations for ${key}:`, error);
      }
      return [];
    }
  };

  // Functions to increment and decrement adult count
  const increment = () => {
    // Calculate the effective maximum using the transport-specific function
    const effectiveMax = maxAllowedTravelers;

    if (adultsCountTrain < effectiveMax) {
      dispatch(setAdultsCountTrain(adultsCountTrain + 1));

      // If we're at policy limit, show informative toast
      if (adultsCountTrain + 1 === maxAllowedTravelers) {
        showToast("info", `Maximum policy limit of ${maxAllowedTravelers} travelers reached for ${categoryName} travel.`);
      }
    }
  };

  const decrement = () => {
    if (adultsCountTrain > 1) { // Always minimum of 1
      // Don't allow reducing below the number of selected travelers
      if (adultsCountTrain > selectedTrainTravelers.length) {
        dispatch(setAdultsCountTrain(adultsCountTrain - 1));
      } else {
        showToast("error", "Please remove travelers first before decreasing count");
      }
    }
  };

  // Handle traveler selection
  const handleTravelerChange = (updatedTravelers) => {
    // If selected travelers exceed adultsCountTrain, update the count
    if (updatedTravelers.length > adultsCountTrain) {
      dispatch(setAdultsCountTrain(updatedTravelers.length));
    }

    dispatch(
      setSelectedTravelersRedux({
        travelers: updatedTravelers,
        category: TRAVEL_CATEGORIES.TRAINS,
      })
    );
    dispatch(
      setDefaultSelectionDone(updatedTravelers.length > 0)
    );
  };

  const handleAddTrainJourney = () => {
    // Don't trigger validation messages when adding a new journey
    validator.hideMessages();
    setShowValidationErrors(false);

    setTrainJourneys([
      ...trainJourneys,
      { id: trainJourneys.length, departFrom: null, arriveAt: null, departureDate: today, description: "" }
    ]);
  };

  const handleDeleteTrainJourney = (index) => {
    const updatedJourneys = trainJourneys.filter((_, i) => i !== index);
    setTrainJourneys(updatedJourneys);

    // Also remove any same location errors for this index
    const updatedErrors = { ...sameLocationErrors };
    delete updatedErrors[index];
    setSameLocationErrors(updatedErrors);
  };

  const handleFieldChange = (index, field, value) => {
    const updatedJourneys = [...trainJourneys];
    updatedJourneys[index] = { ...updatedJourneys[index], [field]: value };
    setTrainJourneys(updatedJourneys);
  };

  const handleDepartureDateChange = (index, date) => {
    const updatedJourneys = [...trainJourneys];
    updatedJourneys[index] = { ...updatedJourneys[index], departureDate: date };
    setTrainJourneys(updatedJourneys);
  };

  const handleRequestApproval = () => {
    // Run generic validator
    const isValid = validator.allValid();
    if (!isValid) {
      validator.showMessages();
      // Show validation messages
      setShowValidationErrors(true);
      setValidationTrigger((prev) => !prev);
      return;
    }

    // Check if there are any same location errors
    const hasSameLocationErrors = Object.values(sameLocationErrors).some(val => val === true);

    if (hasSameLocationErrors) {
      showToast("error", "Departure and arrival locations cannot be the same");
      return;
    }

    // Validate train journeys
    const invalidJourneys = trainJourneys.filter(journey =>
      !journey.departFrom || !journey.arriveAt || !journey.departureDate
    );

    if (invalidJourneys.length > 0) {
      showToast("error", "Please fill in all required fields for all train journeys");
      return;
    }

    // Check for same locations once more before submission
    if (!validateAllJourneys()) {
      showToast("error", "Departure and arrival locations cannot be the same");
      return;
    }

    // Validate travelers
    if (!selectedTrainTravelers.length) {
      showToast("error", "Please select at least one traveler");
      return;
    }

    // Open the request modal
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

      // Prepare the origin/destination from the first journey
      const origin = trainJourneys[0].departFrom?.label || "";
      const destination = trainJourneys[0].arriveAt?.label || "";
      const travelDate = trainJourneys[0].departureDate.toISOString();

      // Create API request payload
      const approvalPayload = {
        // companyId: companyId,
        // userId: userDetails?.userId,
        // userName: userName,
        travelCategory: TRAVEL_CATEGORIES.TRAINS,
        // createdBy: userDetails?.userId,
        // modifiedBy: userDetails?.userId,
        bookingdetails: {
          origin: origin,
          destination: destination,
          travelDate: travelDate,
          reasonForTravel: data?.reason || null,
          totalBookingAmount: 0, // This will be determined later
          passengerDetails: selectedTrainTravelers.map(traveler => ({
            employeeUserId: traveler.data?._id,
            email: traveler.data?.workEmail || null,
          })),
          journeys: trainJourneys.map(journey => ({
            fromCity: journey.departFrom,
            toCity: journey.arriveAt,
            departureDate: journey.departureDate.toISOString(),
            description: journey.description
          }))
        },
        // status: "Active",
      };

      console.log(approvalPayload);

      // Mock API call for now - replace with your actual API endpoint

      const response = await axios.post(`${config.CORPORATE.SEND_APPROVAL_TRAIN_BUS_CAR}`, approvalPayload);
      if (response.data.status) {
        setTimeout(() => {
          closeModal();
          setLoading(false);
          setIsRequestSent(true);
          showToast("success", "Train booking request has been submitted for approval");
          resetForm();

          const bookingId = response.data.data.approvalRequest.bookingId || "";

          console.log("the booking is ", response.data.data.approvalRequest.bookingId)
          router.push(`/corporate/auth/booking/carbustrain/commonApproval?bookingId=${bookingId}`);
        }, 1500);
      }


    } catch (error) {
      console.error("Error sending train approval request:", error);
      setLoading(false);
      closeModal();
      showToast("error", "Failed to submit request. Please try again.");
    }
  };

  // Handle adultsCountTrain updates based on transport-specific policy maximum
  useEffect(() => {
    // If policy only allows self-booking (max=1), force adultsCountTrain to 1
    if (maxAllowedTravelers === 1 && adultsCountTrain !== 1) {
      dispatch(setAdultsCountTrain(1));
      showToast("info", `Self-booking enabled for ${categoryName} travel. Traveler count set to 1.`);
    }

    // If we have a policy-based maximum and the current adultsCountTrain exceeds it
    if (maxAllowedTravelers < adultsCountTrain) {
      dispatch(setAdultsCountTrain(maxAllowedTravelers));
      showToast("info", `Traveler count adjusted to policy maximum of ${maxAllowedTravelers} for ${categoryName} travel.`);
    }

    // Ensure selected travelers don't exceed adultsCountTrain
    if (selectedTrainTravelers.length > adultsCountTrain) {
      const trimmedTravelers = selectedTrainTravelers.slice(0, adultsCountTrain);
      dispatch(
        setSelectedTravelersRedux({
          travelers: trimmedTravelers,
          category: TRAVEL_CATEGORIES.TRAINS, // Category 3 for trains
        })
      );
    }
  }, [adultsCountTrain, maxAllowedTravelers, selectedTrainTravelers, dispatch, categoryName]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (departureCalendarRef.current && !departureCalendarRef.current.contains(event.target)) {
        setIsDepartureCalendarOpen(false);
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
    // Check if running on the client
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

  // Cleanup abort controllers on unmount
  useEffect(() => {
    return () => {
      // Cancel all pending requests when component unmounts
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
          <span>Your train booking request has been submitted successfully!</span>
        </div>
      )}

      {/* Train Journeys */}
      {trainJourneys.map((journey, index) => (
        <div key={journey.id} className="mb-4 relative">
          <TrainJourneySection
            showDelete={index > 0}
            onDelete={() => handleDeleteTrainJourney(index)}
            departureDate={journey.departureDate}
            setDepartureDate={(date) => handleDepartureDateChange(index, date)}
            isDepartureCalendarOpen={isDepartureCalendarOpen && index === trainJourneys.length - 1}
            setIsDepartureCalendarOpen={setIsDepartureCalendarOpen}
            departureCalendarRef={departureCalendarRef}
            departFrom={journey.departFrom}
            setDepartFrom={(value) => handleFieldChange(index, "departFrom", value)}
            arriveAt={journey.arriveAt}
            setArriveAt={(value) => handleFieldChange(index, "arriveAt", value)}
            description={journey.description}
            setDescription={(value) => handleFieldChange(index, "description", value)}
            minBookingWindow={groupMinWindow}
            validator={validator}
            loading={loading}
            defaultLocationOptions={defaultLocationOptions}
            loadStationOptions={loadStationOptions}
            abortControllerRef={abortControllerRef}
            index={index}
            showValidationErrors={showValidationErrors}
            sameLocationError={sameLocationErrors[index]}
            validateLocations={validateLocations}
          />
        </div>
      ))}

      {/* Add Train Button */}
      <div className="flex justify-start py-2">
        <button
          className="text-[#028fa3] text-sm font-medium underline cursor-pointer hover:text-[#027a8c] transition-colors flex items-center"
          onClick={handleAddTrainJourney}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="8" x2="12" y2="16"></line>
            <line x1="8" y1="12" x2="16" y2="12"></line>
          </svg>
          Add Train
        </button>
      </div>

      {/* Travelers Section */}
      <div className="flex flex-col sm:flex-row gap-3 py-4 mb-4">
        {/* Number of Travelers Dropdown */}
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
                  } ${showValidationErrors && !selectedTrainTravelers.length ? 'border border-red-500' : ''}`}
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

              {/* Dropdown */}
              {isCountDropdownOpen && (
                <div className="absolute z-10 w-full mt-1 py-3 bg-white rounded-lg shadow-lg border border-gray-200">
                  <div className="flex items-center justify-center gap-4">
                    <button
                      onClick={decrement}
                      className={`text-xl rounded-full hover:bg-gray-100 transition-colors ${adultsCountTrain <= TRAIN_MIN_ADULT_SELECTION
                        ? "text-gray-300"
                        : "text-[#028fa3]"
                        }`}
                      disabled={adultsCountTrain <= TRAIN_MIN_ADULT_SELECTION}
                    >
                      <FontAwesomeIcon icon={faMinusCircle} size={16} />
                    </button>

                    <span className="text-[#028fa3] text-sm min-w-[60px] text-center">
                      {adultsCountTrain} {adultsCountTrain > 1 ? "Adults" : "Adult"}
                    </span>

                    <button
                      onClick={increment}
                      className={`text-xl rounded-full hover:bg-gray-100 transition-colors ${adultsCountTrain >= maxAllowedTravelers
                        ? "text-gray-300"
                        : "text-[#028fa3]"
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

        {/* Traveler Selection */}
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
                    initialSelectedTravelers={selectedTrainTravelers}
                    backgroundColor={backgroundColor}
                    travelCategory={TRAVEL_CATEGORIES.TRAINS}
                    isHomePage={isHomePage}
                    maxAllowedTravelers={maxAllowedTravelers}
                    error={showValidationErrors && !selectedTrainTravelers.length}
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

      {/* Request Approval Button */}
      <div className="w-full sm:w-4/12 mx-auto mt-4">
        <button
          onClick={handleRequestApproval}
          disabled={loading}
          className={`${loading ? "bg-gray-400 cursor-not-allowed" : "bg-[#028fa3] hover:bg-[#027a8c]"
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

      {/* No Travelers Selected Warning */}
      {showValidationErrors && selectedTrainTravelers.length === 0 && (
        <div className="text-center mt-2 text-red-500 text-sm">
          Please select at least one traveler to proceed
        </div>
      )}

      {/* Request Modal */}
      {isRequestModalOpen && (
        <RequestModal
          isOpen={isRequestModalOpen}
          title="Send Approval"
          subtitle="You will get notification to continue booking once the request gets approved."
          showApproverDetails={true}
          showReasonInput={true}
          onClose={closeModal}
          onSubmit={handleSendApproval}
          travellers={selectedTrainTravelers}
          buttonConfig={{
            cancel: "Close",
            submit: "Send Approval Request",
          }}
        />
      )}
    </div>
  );
}