import { useSelector } from "react-redux";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUser } from "@fortawesome/free-regular-svg-icons";
import {
  faCircleXmark,
  faSuitcaseRolling,
  faCaretDown,
  faCity,
  faSignOutAlt,
  faSpinner,
} from "@fortawesome/free-solid-svg-icons";
import { createPortal } from "react-dom";
import { useState, useEffect, useRef } from "react";
import GeneralDetails from "./profilecomps/GeneralDetails";
import Flights from "./profilecomps/flights/Flights";
import Hotels from "./profilecomps/hotels/Hotels";
import Trains from "./profilecomps/Trains/TrainCard";
import Bus from "./profilecomps/Bus/Bus";
import Cab from "./profilecomps/Cab/Cab";
import Trips from "./profilecomps/Trips";
import TravelApprovals from "./profilecomps/TravelApprovals";
import CompanyDetails from "./profilecomps/CompanyDetails";
import {
  getFlightBookingList,
  getBookingList,
  getTrainBookingList,
  getBusBookingList,
  getCabBookingList,
} from "@/utils/profileAPI";
import { useUserType } from "@/hooks/useUserType";
import axios, { handleLogout, getTabSpecificData } from "@/utils/axios/axios";
import config from "@/config";
import useFormValidator from "@/hooks/useFormValidator";
import { useUserPermissions } from "@/hooks/useUserPermissions";
import {
  selectCorporateIsAuthenticated,
  selectCorporateUserFullName,
  selectCorporateUserId,
} from "@/store/selectors/corporateSelectors";

const Profile = ({ isOpen, onClose }) => {
  const userFullName = useSelector(selectCorporateUserFullName);

  const userId = useSelector(selectCorporateUserId);

  const { userType } = useUserPermissions();

  const [activeTab, setActiveTab] = useState(1);
  const [showBookingOptions, setShowBookingOptions] = useState(false);
  const [activeSubTab, setActiveSubTab] = useState("Flights");
  const [activeFlightTabStatus, setActiveFlightTabStatus] = useState("all");
  const [activeHotelTabStatus, setActiveHotelTabStatus] = useState("all");
  const [activeTrainTabStatus, setActiveTrainTabStatus] = useState("approved");
  const [activeBusTabStatus, setActiveBusTabStatus] = useState("approved");
  const [activeCabTabStatus, setActiveCabTabStatus] = useState("approved");
  const corporateUser = useUserType();
  const [flightBookings, setFlightBookings] = useState(["all"]);
  const [hotelBookings, setHotelBookings] = useState(["all"]);
  const [trainBookings, setTrainBookings] = useState(["all"]);
  const [busBookings, setBusBookings] = useState(["all"]);
  const [cabBookings, setCabBookings] = useState(["all"]);
  const [loading, setLoading] = useState(true);
  const [shouldFetch, setShouldFetch] = useState(true);
  const [titleOptions, setTitleOptions] = useState([]);
  const [countryOptions, setCountryOptions] = useState([]);
  const [userDetails, setUserDetails] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");
  console.log("the user details", userDetails);

  const [trainPage, setTrainPage] = useState(1);
  const [trainHasMore, setTrainHasMore] = useState(true);
  const [trainLoading, setTrainLoading] = useState(false);

  const [busPage, setBusPage] = useState(1);
  const [busHasMore, setBusHasMore] = useState(true);
  const [busLoading, setBusLoading] = useState(false);

  const [cabPage, setCabPage] = useState(1);
  const [cabHasMore, setCabHasMore] = useState(true);
  const [cabLoading, setCabLoading] = useState(false);

  const isInitialRender = useRef(true);
  const isInitialRenderTabs = useRef(true);
  const prevTabRef = useRef(activeTab);
  const prevSubTabRef = useRef(activeSubTab);
  const prevFlightStatusRef = useRef(activeFlightTabStatus);
  const prevHotelStatusRef = useRef(activeHotelTabStatus);
  const prevTrainStatusRef = useRef(activeTrainTabStatus);
  const prevBusStatusRef = useRef(activeBusTabStatus);
  const prevCabStatusRef = useRef(activeCabTabStatus);
  const [counts, setCounts] = useState({
    all: 0,
    quoted: 0,
    confirmed: 0,
    cancelled: 0,
  });

  const customMessages = {
    email: "This is not a valid email.",
    required: "This field is required.",
  };

  const customRules = {
    validMobile: {
      message: "This is not a valid mobile number.",
      rule: (val, params, validator) => {
        const regex = /^[6-9]\d{9}$/;
        return regex.test(val) && val !== "0000000000";
      },
      required: true,
    },
    validEmail: {
      message: "This is not a valid email.",
      rule: (val, params, validator) => {
        const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return regex.test(val);
      },
      required: true,
    },
    validFirstName: {
      message: "The :attribute should contain only letters.",
      rule: (val, params, validator) => {
        const regex = /^[a-zA-Z\s]*$/;
        return regex.test(val);
      },
      required: true,
    },
    validLastName: {
      message: "The :attribute should contain only letters.",
      rule: (val, params, validator) => {
        const regex = /^[a-zA-Z\s]*$/;
        return regex.test(val);
      },
      required: true,
    },
    validPassportNumber: {
      message: "Passport Number does not match the format",
      rule: (val, params, validator) => {
        const regex = /^[A-Za-z0-9]{3,30}$/;
        return regex.test(val);
      },
    },
    validPassportIssueDate: {
      message: "Passport issue date should not be greater than today's date.",
      rule: (val, params, validator) => {
        const issueDate = new Date(val);
        const today = new Date();
        return issueDate <= today;
      },
    },
    validPassportExpiryDate: {
      message: "Passport issue date should be less than expiry date.",
      rule: (val, params, validator) => {
        const issueDate = new Date(params[0]);
        const arrivalDate = new Date(params[1]);
        const expiryDate = new Date(val);
        return expiryDate > issueDate;
      },
    },
    dobValidation: {
      message: "Date of birth should indicate an age greater than 12 years.",
      rule: (val, params, validator) => {
        const selectedDate = new Date(val);
        const currentDate = new Date();

        // Calculate the date 12 years ago
        const minDate = new Date(
          currentDate.getFullYear() - 12,
          currentDate.getMonth(),
          currentDate.getDate()
        );

        return selectedDate <= minDate;
      },
    },
  };

  const [validator] = useFormValidator(customMessages, customRules);

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        setLoading(true);
        const [titleResponse, countryResponse] = await Promise.all([
          axios.get(`${config.CORPORATE.USER_TITLES}`),
          axios.get(`${config.CORPORATE.COUNTRY}`),
        ]);
        if (titleResponse.data.status === "SUCCESS") {
          const titleOptions = titleResponse.data.data.map((title) => ({
            value: title.title,
            label: title.title,
          }));
          setTitleOptions(titleOptions);
        }
        if (countryResponse.data.status === "SUCCESS") {
          const countryOptions = countryResponse.data.data.map((country) => ({
            value: country._id,
            code: country.alpha2code,
            label: country.countryname,
            phoneCode: country.phonecode,
          }));
          setCountryOptions(countryOptions);
        }
      } catch (error) {
        console.log("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };
    if (isInitialRender.current) {
      isInitialRender.current = false;
      fetchInitialData();
    }
  }, []);

  // useEffect(() => {
  //   const fetchTabData = async () => {
  //     setLoading(true);

  //     try {
  //       switch (activeTab) {
  //         case 1:
  //           const response = await axios.get(
  //             `${config.CORPORATE.USER_DETAILS}`
  //           );
  //           if (response?.data?.status === true && response?.data?.data) {
  //             setUserDetails(response?.data?.data);
  //           } else {
  //             setErrorMessage("Failed to fetch user details");
  //           }
  //           break;

  //         case 2:
  //           // UNCHANGED: Flights functionality remains the same
  //           if (activeSubTab === "Flights") {
  //             const flightData = await getFlightBookingList(
  //               // userId,
  //               activeFlightTabStatus || "all",
  //               corporateUser
  //             );
  //             setFlightBookings(flightData.data);
  //           }
  //           // UNCHANGED: Hotels functionality remains the same
  //           else if (activeSubTab === "Hotels") {
  //             const hotelData = await getBookingList(
  //               userId,
  //               activeHotelTabStatus || "all",
  //               corporateUser
  //             );
  //             setHotelBookings(hotelData.data);
  //           }
  //           // OPTIMIZED: Trains - Load all data once
  //           else if (activeSubTab === "Trains") {
  //             // Reset pagination when switching to Trains
  //             setTrainPage(1);
  //             setTrainBookings([]);
  //             setTrainHasMore(true);

  //             const trainData = await getTrainBookingList(
  //               "all", // Always fetch all trains initially
  //               1,
  //               50 // Load more data initially to reduce API calls
  //             );
  //             if (trainData.data?.bookings) {
  //               setTrainBookings(trainData.data.bookings);
  //               setTrainHasMore(trainData.data.hasNextPage);
  //               // Set count only for "all" tab
  //               setCounts((prev) => ({
  //                 ...prev,
  //                 all: trainData.data.totalCount,
  //               }));
  //             } else {
  //               setTrainBookings([]);
  //               setTrainHasMore(false);
  //             }
  //           }
  //           // OPTIMIZED: Bus - Load all data once
  //           else if (activeSubTab === "Bus") {
  //             // Reset pagination for Bus
  //             setBusPage(1);
  //             setBusBookings([]);
  //             setBusHasMore(true);

  //             const busData = await getBusBookingList(
  //               "all", // Always fetch all bus bookings initially
  //               1,
  //               50 // Load more data initially to reduce API calls
  //             );
  //             if (busData.data?.bookings) {
  //               setBusBookings(busData.data.bookings);
  //               setBusHasMore(busData.data.hasNextPage);
  //               // Set count only for "all" tab
  //               setCounts((prev) => ({
  //                 ...prev,
  //                 all: busData.data.totalCount,
  //               }));
  //             } else {
  //               setBusBookings([]);
  //               setBusHasMore(false);
  //             }
  //           }
  //           // OPTIMIZED: Cab - Load all data once
  //           else if (activeSubTab === "Cab") {
  //             // Reset pagination for Cab
  //             setCabPage(1);
  //             setCabBookings([]);
  //             setCabHasMore(true);

  //             const cabData = await getCabBookingList(
  //               "all", // Always fetch all cab bookings initially
  //               1,
  //               50 // Load more data initially to reduce API calls
  //             );
  //             if (cabData.data?.bookings) {
  //               setCabBookings(cabData.data.bookings);
  //               setCabHasMore(cabData.data.hasNextPage);
  //               // Set count only for "all" tab
  //               setCounts((prev) => ({
  //                 ...prev,
  //                 all: cabData.data.totalCount,
  //               }));
  //             } else {
  //               setCabBookings([]);
  //               setCabHasMore(false);
  //             }
  //           }
  //           break;

  //         default:
  //           break;
  //       }
  //     } catch (error) {
  //       setErrorMessage("Error fetching tab data");
  //       console.error("Error fetching tab data:", error);
  //     } finally {
  //       setLoading(false);
  //     }
  //   };

  //   if (isInitialRenderTabs.current) {
  //     isInitialRenderTabs.current = false;
  //     fetchTabData();
  //     return;
  //   }

  //   if (activeTab === 2) {
  //     // For Flights and Hotels: fetch on tab status change (unchanged behavior)
  //     if (activeSubTab === "Flights") {
  //       fetchTabData();
  //     } else if (activeSubTab === "Hotels") {
  //       fetchTabData();
  //     }
  //     // For Trains/Bus/Cab: fetch only when subtab changes, not when status tabs change
  //     else if (
  //       activeSubTab === "Trains" ||
  //       activeSubTab === "Bus" ||
  //       activeSubTab === "Cab"
  //     ) {
  //       if (prevSubTabRef.current !== activeSubTab) {
  //         fetchTabData();
  //       }
  //     }
  //   } else {
  //     if (prevTabRef.current !== activeTab) {
  //       fetchTabData();
  //     }
  //   }

  //   prevTabRef.current = activeTab;
  //   prevSubTabRef.current = activeSubTab;
  // }, [
  //   activeTab,
  //   activeSubTab,
  //   activeFlightTabStatus,
  //   activeHotelTabStatus,
  //   corporateUser,
  // ]);

  useEffect(() => {
    const fetchTabData = async () => {
      setLoading(true);

      try {
        switch (activeTab) {
          case 1:
            const response = await axios.get(
              `${config.CORPORATE.USER_DETAILS}`
            );
            if (response?.data?.status === true && response?.data?.data) {
              setUserDetails(response?.data?.data);
            } else {
              setErrorMessage("Failed to fetch user details");
            }
            break;

          case 2:
            // Flights - API call on status change
            if (activeSubTab === "Flights") {
              const flightData = await getFlightBookingList(
                activeFlightTabStatus || "all",
                corporateUser
              );
              setFlightBookings(flightData.data);
            }
            // Hotels - API call on status change
            else if (activeSubTab === "Hotels") {
              const hotelData = await getBookingList(
                userId,
                activeHotelTabStatus || "all",
                corporateUser
              );
              setHotelBookings(hotelData.data);
            }
            // UPDATED: Trains - API call on status change (like Flights)
            else if (activeSubTab === "Trains") {
              // Reset pagination when status changes
              setTrainPage(1);
              setTrainBookings([]);
              setTrainHasMore(true);

              const trainData = await getTrainBookingList(
                activeTrainTabStatus || "all", // ✅ Use active status instead of "all"
                1,
                20 // Load per page
              );
              if (trainData.data?.bookings) {
                setTrainBookings(trainData.data.bookings);
                setTrainHasMore(trainData.data.hasNextPage);
              } else {
                setTrainBookings([]);
                setTrainHasMore(false);
              }
            }
            // Bus - API call on status change
            else if (activeSubTab === "Bus") {
              setBusPage(1);
              setBusBookings([]);
              setBusHasMore(true);

              const busData = await getBusBookingList(
                activeBusTabStatus || "all", // ✅ Use active status
                1,
                20
              );
              if (busData.data?.bookings) {
                setBusBookings(busData.data.bookings);
                setBusHasMore(busData.data.hasNextPage);
              } else {
                setBusBookings([]);
                setBusHasMore(false);
              }
            }
            // Cab - API call on status change
            else if (activeSubTab === "Cab") {
              setCabPage(1);
              setCabBookings([]);
              setCabHasMore(true);

              const cabData = await getCabBookingList(
                activeCabTabStatus || "all", // ✅ Use active status
                1,
                20
              );
              if (cabData.data?.bookings) {
                setCabBookings(cabData.data.bookings);
                setCabHasMore(cabData.data.hasNextPage);
              } else {
                setCabBookings([]);
                setCabHasMore(false);
              }
            }
            break;

          default:
            break;
        }
      } catch (error) {
        setErrorMessage("Error fetching tab data");
        console.error("Error fetching tab data:", error);
      } finally {
        setLoading(false);
      }
    };

    if (isInitialRenderTabs.current) {
      isInitialRenderTabs.current = false;
      fetchTabData();
      return;
    }

    if (activeTab === 2) {
      // For all subtabs: fetch on tab status change
      if (
        activeSubTab === "Flights" ||
        activeSubTab === "Hotels" ||
        activeSubTab === "Trains" ||
        activeSubTab === "Bus" ||
        activeSubTab === "Cab"
      ) {
        // Only fetch if subtab changed OR status changed
        if (
          prevSubTabRef.current !== activeSubTab ||
          prevFlightStatusRef.current !== activeFlightTabStatus ||
          prevHotelStatusRef.current !== activeHotelTabStatus ||
          prevTrainStatusRef.current !== activeTrainTabStatus ||
          prevBusStatusRef.current !== activeBusTabStatus ||
          prevCabStatusRef.current !== activeCabTabStatus
        ) {
          fetchTabData();
        }
      }
    } else {
      if (prevTabRef.current !== activeTab) {
        fetchTabData();
      }
    }


     if (activeTab === 2) {
      // For Flights and Hotels: fetch on tab status change (unchanged behavior)
      if (activeSubTab === "Flights") {
        fetchTabData();
      } else if (activeSubTab === "Hotels") {
        fetchTabData();
      }
      // For Trains/Bus/Cab: fetch only when subtab changes, not when status tabs change
      else if (
        activeSubTab === "Trains" ||
        activeSubTab === "Bus" ||
        activeSubTab === "Cab"
      ) {
        if (prevSubTabRef.current !== activeSubTab) {
          fetchTabData();
        }
      }
    } else {
      if (prevTabRef.current !== activeTab) {
        fetchTabData();
      }
    }

    // Update all refs
    prevTabRef.current = activeTab;
    prevSubTabRef.current = activeSubTab;
    prevFlightStatusRef.current = activeFlightTabStatus;
    prevHotelStatusRef.current = activeHotelTabStatus;
    prevTrainStatusRef.current = activeTrainTabStatus;
    prevBusStatusRef.current = activeBusTabStatus;
    prevCabStatusRef.current = activeCabTabStatus;
  }, [
    activeTab,
    activeSubTab,
    activeFlightTabStatus,
    activeHotelTabStatus,
    activeTrainTabStatus, // ✅ Re-added
    activeBusTabStatus, // ✅ Re-added
    activeCabTabStatus, // ✅ Re-added
    corporateUser,
  ]);

  // Updated loadMore functions - only load more from "all" status
  const loadMoreTrains = async () => {
    if (!trainHasMore || trainLoading) return;

    setTrainLoading(true);
    const nextPage = trainPage + 1;
    try {
      const trainData = await getTrainBookingList(
        activeTrainTabStatus || "all", // Always load more from "all" status
        nextPage,
        20 // Load more data per page to reduce API calls
      );
      if (trainData.data?.bookings) {
        setTrainBookings((prev) => [...prev, ...trainData.data.bookings]);

        setTrainHasMore(trainData.data.hasNextPage);
        setTrainPage(nextPage);
      } else {
        setTrainHasMore(false);
      }
    } catch (error) {
      console.error("Error loading more train bookings:", error);
      setErrorMessage("Error loading more train bookings");
    } finally {
      setTrainLoading(false);
    }
  };

  const loadMoreBuses = async () => {
    if (!busHasMore || busLoading) return;

    setBusLoading(true);
    const nextPage = busPage + 1;
    try {
      const busData = await getBusBookingList(
        activeBusTabStatus || "all", // Always load more from "all" status
        nextPage,
        50 // Load more data per page to reduce API calls
      );
      if (busData.data?.bookings) {
        setBusBookings((prev) => [...prev, ...busData.data.bookings]);

        setBusHasMore(busData.data.hasNextPage);
        setBusPage(nextPage);
      } else {
        setBusHasMore(false);
      }
    } catch (error) {
      console.error("Error loading more bus bookings:", error);
      setErrorMessage("Error loading more bus bookings");
    } finally {
      setBusLoading(false);
    }
  };

  const loadMoreCabs = async () => {
    if (!cabHasMore || cabLoading) return;

    setCabLoading(true);
    const nextPage = cabPage + 1;
    try {
      const cabData = await getCabBookingList(
        activeCabTabStatus || "all", // Always load more from "all" status
        nextPage,
        50 // Load more data per page to reduce API calls
      );
      if (cabData.data?.bookings) {
        setCabBookings((prev) => [...prev, ...cabData.data.bookings]);
        setCabPage(nextPage);
        setCabHasMore(cabData.data.hasNextPage);
      } else {
        setCabHasMore(false);
      }
    } catch (error) {
      console.error("Error loading more cab bookings:", error);
      setErrorMessage("Error loading more cab bookings");
    } finally {
      setCabLoading(false);
    }
  };
  const handleUserDetailsUpdate = (updatedDetails) => {
    setUserDetails(updatedDetails);
  };

  const handleMyBookingsClick = () => {
    setActiveTab(2);
    setShowBookingOptions(activeSubTab);
  };

  const handleProfileLogout = async () => {
    setLoading(true);
    await handleLogout();
    setLoading(false);
  };

  return createPortal(
    <>
      {isOpen && (
        <div
          className="fixed inset-0  bg-black/50  z-[99999999] cursor-pointer"
          onClick={onClose}
        ></div>
      )}
      <div
        className={`fixed top-0 right-0 h-full w-[100%] sm:w-[70%] 2xl:w-[55%] bg-white z-50 transition-transform duration-300 ease-in-out ${
          isOpen
            ? "transform translate-x-0"
            : "transform translate-x-full rounded-tl-md rounded-bl-md"
        }`}
        style={{ zIndex: "999999999" }}
      >
        <div className="flex items-center justify-between px-4 py-2">
          <div className="text-[#030F0C] text-xs sm:text-lg font-medium">
            {userFullName}
          </div>
          <button
            onClick={onClose}
            className="text-gray-600 hover:text-gray-900"
          >
            <FontAwesomeIcon icon={faCircleXmark} className="text-[#878786]" />
          </button>
        </div>

        <div className="flex sm:flex-row flex-col h-[calc(100%-60px)]">
          <div className="flex text-xs sm:text-base flex-col w-full sm:w-[22%] 2xl:w-[18%] p-4 justify-between">
            <div className="hidden sm:flex flex-col gap-3 ">
              <div
                className={`${
                  activeTab === 1
                    ? "text-[#443C38] font-semibold border-r-2 border-[#028FA3] -mr-7"
                    : "text-[#87878699] font-normal"
                } flex gap-2 items-center cursor-pointer`}
                onClick={() => setActiveTab(1)}
              >
                <FontAwesomeIcon icon={faUser} />
                User info
              </div>
              <div
                className={`${
                  activeTab === 2
                    ? "text-[#443C38] font-semibold"
                    : "text-[#87878699] font-normal"
                } flex gap-2 items-center cursor-pointer`}
                onClick={handleMyBookingsClick}
              >
                <FontAwesomeIcon icon={faSuitcaseRolling} />
                My bookings
                <FontAwesomeIcon icon={faCaretDown} />
              </div>
              {showBookingOptions && activeTab === 2 && (
                <div className="pl-8 mt-0 flex flex-col gap-2 text-[#87878699]">
                  <div
                    className={`cursor-pointer ${
                      activeSubTab === "Flights" && activeTab === 2
                        ? "font-semibold text-[#443C38] border-r-2 border-[#028FA3] -mr-7"
                        : ""
                    }`}
                    onClick={() => {
                      setActiveSubTab("Flights");
                    }}
                  >
                    Flights
                  </div>
                  <div
                    className={`cursor-pointer ${
                      activeSubTab === "Hotels" && activeTab === 2
                        ? "font-semibold text-[#443C38] border-r-2 border-[#028FA3] -mr-7"
                        : ""
                    }`}
                    onClick={() => {
                      setActiveSubTab("Hotels");
                    }}
                  >
                    Hotels
                  </div>
                  <div
                    className={`cursor-pointer ${
                      activeSubTab === "Trains" && activeTab === 2
                        ? "font-semibold text-[#443C38] border-r-2 border-[#028FA3] -mr-7"
                        : ""
                    }`}
                    onClick={() => {
                      setActiveSubTab("Trains");
                    }}
                  >
                    Trains
                  </div>

                  <div
                    className={`cursor-pointer ${
                      activeSubTab === "Bus" && activeTab === 2
                        ? "font-semibold text-[#443C38] border-r-2 border-[#028FA3] -mr-7"
                        : ""
                    }`}
                    onClick={() => {
                      setActiveSubTab("Bus");
                    }}
                  >
                    Bus
                  </div>

                  <div
                    className={`cursor-pointer ${
                      activeSubTab === "Cab" && activeTab === 2
                        ? "font-semibold text-[#443C38] border-r-2 border-[#028FA3] -mr-7"
                        : ""
                    }`}
                    onClick={() => {
                      setActiveSubTab("Cab");
                    }}
                  >
                    Cab
                  </div>
                </div>
              )}

              {userType === 1 && (
                <div
                  className={`${
                    activeTab === 4
                      ? "text-[#443C38] font-semibold border-r-2 border-[#028FA3] -mr-7"
                      : "text-[#87878699] font-normal"
                  } flex gap-2 items-center cursor-pointer`}
                  onClick={() => setActiveTab(4)}
                >
                  <FontAwesomeIcon icon={faCity} />
                  Company KYC
                </div>
              )}
            </div>

            {/* nav in profile for mob ui */}
            <div className="flex flex-col gap-3 sm:hidden">
              <div className="flex sm:hidden flex-row gap-3 justify-around ">
                <div
                  className={`${
                    activeTab === 1
                      ? "text-[#443C38] font-semibold"
                      : "text-[#87878699] font-normal"
                  } flex gap-2 items-center cursor-pointer`}
                  onClick={() => setActiveTab(1)}
                >
                  <FontAwesomeIcon icon={faUser} />
                  User info
                </div>
                <div className="flex flex-col relative">
                  <div
                    className={`${
                      activeTab === 2
                        ? "text-[#443C38] font-semibold"
                        : "text-[#87878699] font-normal"
                    } flex gap-2 items-center cursor-pointer`}
                    onClick={handleMyBookingsClick}
                  >
                    <FontAwesomeIcon icon={faSuitcaseRolling} />
                    My bookings
                    <FontAwesomeIcon icon={faCaretDown} />
                  </div>
                  {showBookingOptions && activeTab === 2 && (
                    <div className="sm:pl-8 mt-0 flex items-center absolute top-6 gap-3 text-[#87878699] max-w-[80px] overflow-x-auto">
                      <div
                        className={`cursor-pointer ${
                          activeSubTab === "Flights" && activeTab === 2
                            ? "font-semibold text-[#443C38] text-base"
                            : "text-sm"
                        }`}
                        onClick={() => {
                          setActiveSubTab("Flights");
                        }}
                      >
                        Flights
                      </div>
                      <div
                        className={`cursor-pointer ${
                          activeSubTab === "Hotels" && activeTab === 2
                            ? "font-semibold text-[#443C38] text-base"
                            : "text-sm"
                        }`}
                        onClick={() => {
                          setActiveSubTab("Hotels");
                        }}
                      >
                        Hotels
                      </div>

                      <div
                        className={`cursor-pointer ${
                          activeSubTab === "Trains" && activeTab === 2
                            ? "font-semibold text-[#443C38] border-r-2 border-[#028FA3] -mr-7"
                            : ""
                        }`}
                        onClick={() => {
                          setActiveSubTab("Trains");
                        }}
                      >
                        Trains
                      </div>

                      <div
                        className={`cursor-pointer ${
                          activeSubTab === "Bus" && activeTab === 2
                            ? "font-semibold text-[#443C38] border-r-2 border-[#028FA3] -mr-7"
                            : ""
                        }`}
                        onClick={() => {
                          setActiveSubTab("Bus");
                        }}
                      >
                        Bus
                      </div>

                      <div
                        className={`cursor-pointer ${
                          activeSubTab === "Cab" && activeTab === 2
                            ? "font-semibold text-[#443C38] border-r-2 border-[#028FA3] -mr-7"
                            : ""
                        }`}
                        onClick={() => {
                          setActiveSubTab("Cab");
                        }}
                      >
                        Cab
                      </div>
                    </div>
                  )}
                </div>

                {userType === 1 && (
                  <div
                    className={`${
                      activeTab === 4
                        ? "text-[#443C38] font-semibold"
                        : "text-[#87878699] font-normal"
                    } flex gap-2 items-center cursor-pointer`}
                    onClick={() => setActiveTab(4)}
                  >
                    <FontAwesomeIcon icon={faCity} />
                    Company KYC
                  </div>
                )}
              </div>
              {/* <div
                className="flex gap-2 items-center cursor-pointer text-[#FF4D4D] hover:text-[#FF3333] transition-colors duration-200"
                onClick={handleProfileLogout}
              >
                <FontAwesomeIcon icon={faSignOutAlt} />
                <span className="font-medium text-base">Logout</span>
              </div> */}
            </div>

            {/* Logout section at bottom */}
            <div className="mt-auto hidden sm:block">
              <div className="border-t border-[#87878633] my-4"></div>
              <div
                className="flex gap-2 items-center cursor-pointer text-[#FF4D4D] hover:text-[#FF3333] transition-colors duration-200"
                onClick={handleProfileLogout}
              >
                <FontAwesomeIcon icon={faSignOutAlt} />
                <span className="font-medium">Logout</span>
              </div>
            </div>
          </div>

          <div className="border-r-2 border-[#87878633] m-[2px]"></div>

          {loading ? (
            <FontAwesomeIcon
              icon={faSpinner}
              spin
              className="w-[5%] h-full m-auto"
              color="#028FA3"
            />
          ) : (
            <div className="flex flex-col w-full mt-2 sm:mt-0 sm:w-[80%] px-2 py-2 sm:p-4 pb-0">
              {activeTab === 1 && (
                <GeneralDetails
                  userDetails={userDetails?.userDetails}
                  companyDetails={userDetails?.companyDetails}
                  titleOptions={titleOptions}
                  countryOptions={countryOptions}
                  validator={validator}
                  onUpdate={handleUserDetailsUpdate}
                  close={onClose}
                />
              )}

              {activeSubTab === "Flights" && activeTab === 2 && (
                <Flights
                  booking={flightBookings}
                  activeTab={activeFlightTabStatus}
                  setActiveTab={setActiveFlightTabStatus}
                  onClose={onClose}
                />
              )}

              {activeSubTab === "Trips" && activeTab === 2 && <Trips />}

              {activeSubTab === "Hotels" && activeTab === 2 && (
                <Hotels
                  bookings={hotelBookings}
                  activeTab={activeHotelTabStatus}
                  setActiveTab={setActiveHotelTabStatus}
                  onClose={onClose}
                />
              )}

              {activeSubTab === "Trains" && activeTab === 2 && (
                <Trains
                  booking={trainBookings}
                  counts={counts}
                  activeTab={activeTrainTabStatus}
                  setActiveTab={setActiveTrainTabStatus}
                  onClose={onClose}
                  loadMore={async () => {
                    await loadMoreTrains();
                  }}
                  hasMore={trainHasMore}
                  loading={trainLoading}
                />
              )}
              {activeSubTab === "Bus" && activeTab === 2 && (
                <Bus
                  booking={busBookings}
                  activeTab={activeBusTabStatus}
                  counts={counts}
                  setActiveTab={setActiveBusTabStatus}
                  onClose={onClose}
                  loadMore={async () => {
                    await loadMoreBuses();
                  }}
                  hasMore={busHasMore}
                  loading={busLoading}
                />
              )}

              {activeSubTab === "Cab" && activeTab === 2 && (
                <Cab
                  booking={cabBookings}
                  counts={counts}
                  activeTab={activeCabTabStatus}
                  setActiveTab={setActiveCabTabStatus}
                  onClose={onClose}
                  loadMore={async () => {
                    await loadMoreCabs();
                  }}
                  hasMore={cabHasMore}
                  loading={cabLoading}
                />
              )}

              {activeTab === 3 && <TravelApprovals />}

              {activeTab === 4 && <CompanyDetails userDetails={userDetails} />}
            </div>
          )}
        </div>
      </div>
    </>,
    document.body
  );
};

export default Profile;
