// import { useState, useEffect, useCallback, useRef } from "react";
// import axios from "@/utils/axios/axios";
// import config from "@/config";
// import { useLogin } from "@/store/context/LoginContext";
// import useIndexedDBWithCompression from "./useIndexedDB";
// import showToast from "@/utils/toast";
// import { useRouter } from "next/router";
// import { logEvent } from "firebase/analytics";
// import { analytics } from "@/utils/firebase";
// import { useSelector, useDispatch } from "react-redux";
// import { setAdultsCountHotel } from "@/store/slices/travellersSlice";
// import {
//   HOTEL_MAX_ADULT_SELECTION,
//   HOTEL_MIN_ADULT_SELECTION,
//   HOTEL_MAX_ROOM_SELECTION,
//   TRAVEL_CATEGORIES,
// } from "@/utils/constants";

// const useCorporateHotelSearch = () => {
//   const dispatch = useDispatch();

//   const { travelersByCategory, adultsCountHotel } = useSelector(
//     (state) => state.travellers
//   );
//   const userDetails = useSelector((state) => state?.user?.userInfo);

//   const router = useRouter();
//   const { openPopup } = useLogin();

//   const { saveSearchResults, getSearchResults } = useIndexedDBWithCompression();

//   const [inputValue, setInputValue] = useState("");
//   const [suggestions, setSuggestions] = useState([]);
//   const [isLoading, setIsLoading] = useState(false);
//   const [error, setError] = useState(null);
//   const [selectedRooms, setSelectedRooms] = useState(1);
//   const [searchResults, setSearchResults] = useState(null);
//   const [searchRequest, setSearchRequest] = useState(null);
//   const [searchFilters, setSearchFilters] = useState(null);
//   const [selectedCity, setSelectedCity] = useState(null);
//   const [selectedTravelers, setSelectedTravelers] = useState([]);
//   const [adultsPerRoom, setAdultsPerRoom] = useState([1]); // Start with one room and one adult

//   const [dateRange, setDateRange] = useState([null, null]);
//   // const [checkInDate, checkOutDate,setCheckOutDate] = dateRange;
//   const checkInDate = dateRange[0];
//   const checkOutDate = dateRange[1];

//   const [dataLoading, setDataLoading] = useState(true);

//   const abortControllerRef = useRef(null);

//   const setCheckOutDate = (newCheckOutDate) => {
//     setDateRange([checkInDate, newCheckOutDate]);
//   };

//   const setCheckInDate = (newCheckInDate) => {
//     setDateRange([newCheckInDate, checkOutDate]);
//   };

//   const fetchSuggestions = useCallback(async (query) => {
//     if (abortControllerRef.current) {
//       abortControllerRef.current.abort();
//     }

//     abortControllerRef.current = new AbortController();

//     setIsLoading(true);
//     setError(null);
//     try {
//       let countryCode = null;
//       const userLocation = localStorage.getItem("userLocation");

//       // Check if the user is logged in
//       if (userDetails) {
//         countryCode =
//           userDetails?.loggedInDetails?.companyDetails?.countryDetails
//             ?.alpha2code;

//         // If the user is logged in but `countryCode` is not available, fallback to `userLocation`
//         if (!countryCode && userLocation) {
//           const parsedData = JSON.parse(userLocation);
//           countryCode = parsedData?.country_code;
//         }
//       } else if (userLocation) {
//         // If the user is not logged in, use the `userLocation`
//         const parsedData = JSON.parse(userLocation);
//         countryCode = parsedData?.country_code;
//       }
//       const response = await axios.get(
//         `${config.GET_SEARCH_DESTINATION_NAME}?name=${query}&countryCode=${countryCode}`,
//         {
//           signal: abortControllerRef.current.signal,
//         }
//       );
//       setSuggestions(response?.data?.data);
//     } catch (err) {
//       if (err.name === "CanceledError") {
//         console.log("Request canceled:", err.message);
//       } else {
//         setError("An error occurred while fetching suggestions.");
//       }
//     } finally {
//       setIsLoading(false);
//     }
//   }, []);

//   useEffect(() => {
//     if (inputValue.length > 0 && !selectedCity) {
//       fetchSuggestions(inputValue);
//     } else {
//       setSuggestions([]);
//     }

//     return () => {
//       if (abortControllerRef.current) {
//         abortControllerRef.current.abort();
//       }
//     };
//   }, [inputValue, fetchSuggestions, selectedCity]);

//   const loadPreviousResults = useCallback(async () => {
//     try {
//       const results = await getSearchResults();
//       if (results) {
//         setSearchResults(results.results);
//         setSearchRequest(results.params);
//         setSearchFilters(results.filters);
//       } else {
//         setSearchResults(null);
//         setSearchRequest(null);
//         setSearchFilters(null);
//       }
//     } catch (error) {
//       console.error("Error loading previous results:", error);
//     } finally {
//       setDataLoading(false);
//     }
//   }, [getSearchResults]);

//   useEffect(() => {
//     loadPreviousResults();
//   }, [loadPreviousResults]);

//   const handleInputChange = (value) => {
//     setInputValue(value);
//     setSelectedCity(null);
//   };

//   const handleCitySelect = (city) => {
//     setSelectedCity(city);
//     setInputValue("");
//     setSuggestions([]);
//   };

//   const handleClearCity = () => {
//     setSelectedCity(null);
//     setInputValue("");
//   };

//   const incrementRoomCount = () => {
//     if (selectedRooms < HOTEL_MAX_ROOM_SELECTION) {
//       // New room count
//       const newRoomCount = selectedRooms + 1;

//       // Build a new "adults" array with the same values
//       //   plus default=1 for the newly added room:
//       const newAdultsArray = Array.from(
//         { length: newRoomCount },
//         (_, i) => adultsPerRoom[i] || 1
//       );

//       // Update local state
//       setSelectedRooms(newRoomCount);
//       setAdultsPerRoom(newAdultsArray);

//       // Also update Redux
//       dispatch(setAdultsCountHotel(newAdultsArray));
//     }
//   };

//   const decrementRoomCount = () => {
//     if (selectedRooms > 1) {
//       // New room count
//       const newRoomCount = selectedRooms - 1;

//       // Build a new "adults" array for the reduced number of rooms:
//       const newAdultsArray = Array.from(
//         { length: newRoomCount },
//         (_, i) => adultsPerRoom[i] || 1
//       );

//       setSelectedRooms(newRoomCount);
//       setAdultsPerRoom(newAdultsArray);
//       dispatch(setAdultsCountHotel(newAdultsArray));
//     }
//   };

//   const incrementAdults = (index) => {
//     const count = adultsPerRoom.map((adults, i) =>
//       i === index && adults < HOTEL_MAX_ADULT_SELECTION ? adults + 1 : adults
//     );
//     setAdultsPerRoom(count);
//     dispatch(setAdultsCountHotel(count));
//   };

//   const decrementAdults = (index) => {
//     const count = adultsPerRoom.map((adults, i) =>
//       i === index && adults > HOTEL_MIN_ADULT_SELECTION ? adults - 1 : adults
//     );
//     setAdultsPerRoom(count);
//     dispatch(setAdultsCountHotel(count));
//   };

//   const handleTravelerChange = (newTravelers) => {
//     setSelectedTravelers(newTravelers);
//   };

//   const convertToFormattedDate = (dateString) => {
//     const date = new Date(dateString);
//     const day = String(date.getDate()).padStart(2, "0");
//     const month = String(date.getMonth() + 1).padStart(2, "0"); // Months are zero-indexed
//     const year = date.getFullYear();

//     return `${day}/${month}/${year}`;
//   };

//   const performSearch = async () => {
//     const updatedSelectedTraveler =
//       selectedTravelers.length > 0
//         ? selectedTravelers
//         : travelersByCategory[TRAVEL_CATEGORIES.HOTELS] || [];

//     const accessToken = localStorage.getItem("accessToken")?.replace(/"/g, "");

//     let ipAddress = localStorage.getItem("userip")?.replace(/"/g, "");
//     if (ipAddress === "undefined" || !ipAddress) {
//       const userLocation = localStorage.getItem("userLocation");
//       if (userLocation) {
//         try {
//           const parsedLocation = JSON.parse(userLocation);
//           ipAddress = parsedLocation?.ip || null;
//         } catch (error) {
//           console.error("Error parsing userLocation:", error);
//           ipAddress = null;
//         }
//       } else {
//         ipAddress = null;
//       }
//     }
//     if (!accessToken) {
//       logEvent(analytics, "search_without_login", {
//         isCorporate: true,
//         city: getCityId,
//         destination: destination,
//       });
//       openPopup();
//       return;
//     }
//     // const totalAdults = adultsPerRoom.reduce(
//     //   (total, adults) => total + adults,
//     //   0
//     // );
//     const totalAdults = adultsCountHotel.reduce(
//       (total, adults) => total + adults,
//       0
//     );

//     if (!selectedCity?.cityid) {
//       showToast("info", "Please Select City or Hotel from the list");
//       return;
//     }

//     if (checkInDate && checkOutDate) {
//       const now = new Date();
//       now.setHours(0, 0, 0, 0);
//       const checkIn = new Date(checkInDate);
//       checkIn.setHours(0, 0, 0, 0);
//       const checkOut = new Date(checkOutDate);
//       checkOut.setHours(0, 0, 0, 0);

//       if (checkIn.getTime() === checkOut.getTime()) {
//         showToast("info", "Checkin and Checkout dates cannot be same.");
//         return;
//       }

//       if (checkIn > checkOut) {
//         showToast(
//           "info",
//           "Check-in date cannot be greater than check-out date."
//         );
//         return;
//       }

//       if (checkIn < now || checkOut < now) {
//         showToast(
//           "info",
//           "Check-in and check-out dates must be greater than the current date."
//         );
//         return;
//       }
//     }

//     if (updatedSelectedTraveler.length === 0) {
//       showToast("info", "Please select travelers for your booking.");
//       return;
//     }
//     if (updatedSelectedTraveler.length < totalAdults) {
//       showToast(
//         "info",
//         "The number of selected travelers cannot be less than the number of adults."
//       );
//       return;
//     }

//     if (updatedSelectedTraveler.length > totalAdults) {
//       showToast(
//         "info",
//         "The number of selected travelers cannot exceed the number of adults."
//       );
//       return;
//     }

//     if (totalAdults > 9 || updatedSelectedTraveler.length > 9) {
//       showToast(
//         "info",
//         "The total number of adults and selected travelers cannot exceed 9."
//       );
//       return;
//     }

//     if (selectedRooms < 1 || selectedRooms > 6) {
//       showToast("info", "The number of rooms must be between 1 and 6.");
//       return;
//     }

//     if (adultsCountHotel.some((adults) => adults < 1 || adults > 9)) {
//       showToast("info", "Each room must have between 1 and 9 adults.");
//       return;
//     }

//     // Calculate the total number of adults and children for the rooms
//     const roomCount = Array.from({ length: selectedRooms }).map((_, index) => ({
//       adults: adultsCountHotel[index] || 1,
//       children: 0,
//       childAge: [],
//     }));

//     const formattedCheckinDate = checkInDate
//       ? convertToFormattedDate(checkInDate)
//       : null;

//     const validCheckInDate =
//       typeof checkInDate === "string" ? new Date(checkInDate) : checkInDate;
//     const validCheckOutDate =
//       typeof checkOutDate === "string" ? new Date(checkOutDate) : checkOutDate;

//     // Construct the request payload
//     const payload = {
//       checkInDate: formattedCheckinDate,
//       noOfNights:
//         checkInDate && checkOutDate
//           ? Math.round(
//               (validCheckOutDate - validCheckInDate) / (1000 * 60 * 60 * 24)
//             ).toString()
//           : "0",
//       countryCode: selectedCity ? selectedCity.countryalpha2code : null,
//       cityId: selectedCity ? selectedCity.cityid : null,
//       hotelCode: selectedCity ? selectedCity.hotelcode : "",
//       preferredCurrency: "INR",
//       guestNationality: "IN",
//       noOfRooms: selectedRooms,
//       maxRating: 5,
//       minRating: 1,
//       isNearBySearchAllowed: false,
//       ipaddress: ipAddress,
//       isislandhopper: "false",
//       radius: "",
//       latitude: "",
//       longitude: "",
//       roomGuests: roomCount.map((room) => ({
//         noOfAdults: room.adults,
//         noOfChild: room.children,
//         childAge: room.childAge,
//       })),
//     };

//     // Check IndexedDB for cached results
//     // const cachedResults = await getSearchResults(payload);
//     // if (cachedResults) {
//     //   setSearchResults(cachedResults);
//     //   return;
//     // }

//     // If no cached results, make the API call
//     try {
//       const results = await axios.post(
//         `${config.GET_HOTEL_SEARCH_DATA}`,
//         payload
//       );
//       const response = results?.data?.data?.response;
//       const request = results?.data?.data?.request;
//       const filters = results?.data?.data?.filters;
//       request.selectedTravelers = updatedSelectedTraveler;
//       request.selectedCity = selectedCity;
//       request.adultsPerRoom = adultsCountHotel;
//       request.checkInDateRange = checkInDate;
//       request.checkOutDateRange = checkOutDate;
//       setSearchResults(response);
//       setSearchRequest(request);
//       setSearchFilters(filters);

//       // Save the results to IndexedDB
//       saveSearchResults(request, response, filters);

//       const targetUrl = "/corporate/auth/booking/hotels/hotelListing";

//       if (router.asPath !== targetUrl) {
//         await router.push(targetUrl);
//       }

//       // await router.push("/corporate/auth/booking/hotels/hotelListing");

//       // if (
//       //   window.location.pathname !==
//       //   "/corporate/auth/booking/hotels/hotelListing"
//       // ) {
//       //   await router.push("/corporate/auth/booking/hotels/hotelListing");
//       // }
//     } catch (error) {
//       console.error("Error fetching hotel lists:", error);

//       // showToast(
//       //   "error",
//       //   "An error occurred while fetching hotel lists. Please try again with different city/hotel name."
//       // );
//       let errorMessage =
//         error?.response?.data?.message ||
//         "Something went wrong, please try again later!";
//       if (
//         error?.response?.data?.message ===
//         "We are unable to process HotelSearch request. Please try again or contact our helpdesk."
//         //  ||
//         // error?.response?.data?.error?.errorMessage?.[0]?.data ===
//         // "Fare Quote failed from the Supplier end. Please try again."
//       ) {
//         errorMessage =
//           "We are unable to process HotelSearch request.Please try again later.";
//       } else if (
//         error?.response?.data?.message === "No Result Found"
//         //  ||
//         // error?.response?.data?.error?.errorMessage?.[0]?.data ===
//         // "Fare Quote failed from the Supplier end. Please try again."
//       ) {
//         errorMessage = "No Hotels Found. Please search again.";
//       }

//       // Display the message in the toast
//       showToast("error", errorMessage);
//       const request = {
//         ...payload,
//         selectedTravelers: updatedSelectedTraveler,
//         selectedCity,
//         adultsPerRoom,
//         checkInDateRange: checkInDate,
//         checkOutDateRange: checkOutDate,
//       };

//       setSearchResults(null);
//       setSearchRequest(request);
//       setSearchFilters(null);

//       saveSearchResults(request, null, null);
//     }
//   };

//   return {
//     inputValue,
//     setInputValue,
//     suggestions,
//     isLoading,
//     error,
//     selectedRooms,
//     setSelectedRooms,
//     handleInputChange,
//     incrementRoomCount,
//     decrementRoomCount,
//     searchResults,
//     performSearch,
//     selectedCity,
//     setSelectedCity,
//     handleCitySelect,
//     handleClearCity,
//     selectedTravelers,
//     setSelectedTravelers,
//     handleTravelerChange,
//     incrementAdults,
//     decrementAdults,
//     setAdultsPerRoom,
//     adultsPerRoom,
//     convertToFormattedDate,
//     checkInDate,
//     checkOutDate,
//     setCheckOutDate,
//     setCheckInDate,
//     dateRange,
//     setDateRange,
//     searchRequest,
//     searchFilters,
//     dataLoading,
//   };
// };

// export default useCorporateHotelSearch;

import { useState, useEffect, useCallback, useRef } from "react";
import axios, { getTabSpecificData } from "@/utils/axios/axios";
import config from "@/config";
import { useLogin } from "@/store/context/LoginContext";
import useIndexedDBWithCompression from "./useIndexedDB";
import showToast from "@/utils/toast";
import { useRouter } from "next/router";
import { logEvent } from "firebase/analytics";
import { analytics } from "@/utils/firebase";
import { useSelector, useDispatch } from "react-redux";
import { setAdultsCountHotel } from "@/store/slices/travellersSlice";
import {
  HOTEL_MAX_ADULT_SELECTION,
  HOTEL_MIN_ADULT_SELECTION,
  HOTEL_MAX_ROOM_SELECTION,
  TRAVEL_CATEGORIES,
} from "@/utils/constants";

const useCorporateHotelSearch = ({ defaultLimit = 10 } = {}) => {
  const dispatch = useDispatch();
  const router = useRouter();
  const { openPopup } = useLogin();
  const { saveSearchResults, getSearchResults } = useIndexedDBWithCompression();

  const { travelersByCategory, adultsCountHotel } = useSelector(
    (state) => state.travellers
  );
  const userDetails = useSelector((state) => state?.user?.userInfo);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedRooms, setSelectedRooms] = useState(1);
  const [searchResults, setSearchResults] = useState(null);
  const [searchRequest, setSearchRequest] = useState(null);
  const [searchFilters, setSearchFilters] = useState(null);
  const [selectedCity, setSelectedCity] = useState(null);
  const [selectedTravelers, setSelectedTravelers] = useState([]);
  const [adultsPerRoom, setAdultsPerRoom] = useState([1]);
  const [defaultHotelOptions, setDefaultHotelOptions] = useState([]);
  const [dataLoading, setDataLoading] = useState(true);

  const [dateRange, setDateRange] = useState([null, null]);
  const checkInDate = dateRange[0];
  const checkOutDate = dateRange[1];

  const abortControllerRef = useRef({});

  const setCheckOutDate = (newCheckOutDate) => {
    setDateRange([checkInDate, newCheckOutDate]);
  };

  const setCheckInDate = (newCheckInDate) => {
    setDateRange([newCheckInDate, checkOutDate]);
  };

  const getUserCountryCode = () => {
    let countryCode = null;
    const userLocation = getTabSpecificData("userLocation");

    if (userDetails) {
      countryCode =
        userDetails?.loggedInDetails?.companyDetails?.countryDetails
          ?.alpha2code;
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

  const formatOptions = (data) => {
    const options = data
      // .slice(0, defaultLimit)
      .map((item) => {
        const isCity = item.type === 1;
        const isHotel = item.type === 2;
        return {
          value: isCity ? item.cityid : item.hotelcode,
          label: isCity
            ? `${item.title} (${item.countryalpha2code})`
            : item.title,
          type: item.type,
          cityname: item.cityname || item.title,
          hotelname: isHotel ? item.title : "",
          state: item.state,
          countryname: item.countryname,
          cityId: item.cityid,
          countryalpha2code: item.countryalpha2code || "",
          hotelcode: isHotel ? item.hotelcode : "",
          isCity,
          isHotel,
          originalData: item,
        };
      });
    console.log(
      "Formatted Destinations (First 10):",
      options.map((opt) => ({
        label: opt.label,
        type: opt.isCity ? "City" : "Hotel",
        cityname: opt.cityname,
        countryname: opt.countryname,
      }))
    );
    return options;
  };

  useEffect(() => {
    const fetchDefaultHotels = async () => {
      try {
        setIsLoading(true);
        const countryCode = getUserCountryCode();
        console.log(
          "Fetching default destinations with countryCode:",
          countryCode
        );
        const response = await axios.get(
          `${config.GET_SEARCH_DESTINATION_NAME}?countryCode=${countryCode}&limit=${defaultLimit}`
        );
        console.log("Default destinations API response:", response.data);

        if (response?.data?.status && Array.isArray(response.data.data)) {
          const formattedOptions = formatOptions(response.data.data);
          setDefaultHotelOptions(formattedOptions);
          if (formattedOptions.length === 0) {
            showToast("warning", "No default destinations found.");
          } else {
            console.log(
              `Successfully fetched ${formattedOptions.length} destinations.`
            );
          }
        } else {
          setDefaultHotelOptions([]);
          showToast("warning", "No default destinations found.");
        }
      } catch (error) {
        console.error("Error fetching default destinations:", error);
        setError("Failed to load default options.");
        setDefaultHotelOptions([]);
        showToast("error", "Failed to load default destinations.");
      } finally {
        setIsLoading(false);
        setDataLoading(false); // Ensure dropdown is enabled after fetch
      }
    };

    fetchDefaultHotels();
  }, [defaultLimit]);

  // const loadHotelOptions = async (inputValue, callback) => {
  //   try {
  //     if (!inputValue) {
  //       callback(defaultHotelOptions);
  //       return;
  //     }

  //     if (abortControllerRef.current["hotelSearch"]) {
  //       abortControllerRef.current["hotelSearch"].abort();
  //     }

  //     const controller = new AbortController();
  //     abortControllerRef.current["hotelSearch"] = controller;

  //     setIsLoading(true);
  //     setError(null);

  //     const countryCode = getUserCountryCode();
  //     // const response = await axios.get(
  //     //   `${config.GET_SEARCH_DESTINATION_NAME}?name=${inputValue}&countryCode=${countryCode}&limit=${defaultLimit}`,
  //     //   { signal: controller.signal }
  //     // );
  //     const response = await axios.get(
  //       `${config.GET_SEARCH_DESTINATION_NAME}?name=${inputValue}&countryCode=${countryCode}`,
  //       { signal: controller.signal }
  //     );

  //     if (response?.data?.status && Array.isArray(response.data.data)) {
  //       const formattedOptions = formatOptions(response.data.data);
  //       callback(formattedOptions);
  //     } else {
  //       callback([]);
  //     }
  //   } catch (error) {
  //     if (error.name !== "AbortError") {
  //       console.error("Error loading hotels:", error);
  //       setError("Failed to load suggestions.");
  //       callback([]);
  //     }
  //   } finally {
  //     setIsLoading(false);
  //   }
  // };


    const loadHotelOptions = async (inputValue) => {
    try {
      if (!inputValue) {
        return defaultHotelOptions;
      }
  
      if (abortControllerRef.current["hotelSearch"]) {
        abortControllerRef.current["hotelSearch"].abort();
      }
  
      const controller = new AbortController();
      abortControllerRef.current["hotelSearch"] = controller;
  
      setIsLoading(true);
      setError(null);
  
      const countryCode = getUserCountryCode();
      const response = await axios.get(
        `${config.GET_SEARCH_DESTINATION_NAME}?name=${inputValue}&countryCode=${countryCode}`,
        { signal: controller.signal }
      );
  
      if (response?.data?.status && Array.isArray(response.data.data)) {
        return formatOptions(response.data.data);
      } else {
        return [];
      }
    } catch (error) {
      if (error.name !== "AbortError") {
        console.error("Error loading hotels:", error);
        setError("Failed to load suggestions.");
      }
      return [];
    } finally {
      setIsLoading(false);
    }
  };
  const loadPreviousResults = useCallback(async () => {
    try {
      const results = await getSearchResults();
      if (results) {
        setSearchResults(results.results);
        setSearchRequest(results.params);
        setSearchFilters(results.filters);

        if (results.params?.selectedCity) {
          const { selectedCity: prevCity } = results.params;
          const isCity = prevCity.type === 1;
          const isHotel = prevCity.type === 2;
          const locationObj = {
            value: isCity ? prevCity.cityid : prevCity.hotelcode,
            label: isCity
              ? `${prevCity.title} (${prevCity.countryalpha2code})`
              : prevCity.title,
            type: prevCity.type,
            cityname: prevCity.cityname || prevCity.title,
            hotelname: isHotel ? prevCity.title : "",
            state: prevCity.state,
            countryname: prevCity.countryname,
            cityId: prevCity.cityid,
            hotelcode: isHotel ? prevCity.hotelcode : "",
            isCity,
            isHotel,
            originalData: prevCity,
          };
          setSelectedCity(locationObj);
        }
      }
    } catch (error) {
      console.error("Error loading previous results:", error);
    } finally {
      setDataLoading(false);
    }
  }, [getSearchResults]);

  useEffect(() => {
    loadPreviousResults();
  }, [loadPreviousResults]);

  const handleCitySelect = (option) => {
    setSelectedCity(option);
  };

  const handleClearCity = () => {
    setSelectedCity(null);
  };

  const incrementRoomCount = () => {
    if (selectedRooms < HOTEL_MAX_ROOM_SELECTION) {
      const newRoomCount = selectedRooms + 1;
      const newAdultsArray = Array.from(
        { length: newRoomCount },
        (_, i) => adultsPerRoom[i] || 1
      );
      setSelectedRooms(newRoomCount);
      setAdultsPerRoom(newAdultsArray);
      dispatch(setAdultsCountHotel(newAdultsArray));
    }
  };

  const decrementRoomCount = () => {
    if (selectedRooms > 1) {
      const newRoomCount = selectedRooms - 1;
      const newAdultsArray = Array.from(
        { length: newRoomCount },
        (_, i) => adultsPerRoom[i] || 1
      );
      setSelectedRooms(newRoomCount);
      setAdultsPerRoom(newAdultsArray);
      dispatch(setAdultsCountHotel(newAdultsArray));
    }
  };

  const incrementAdults = (index) => {
    const count = adultsPerRoom.map((adults, i) =>
      i === index && adults < HOTEL_MAX_ADULT_SELECTION ? adults + 1 : adults
    );
    setAdultsPerRoom(count);
    dispatch(setAdultsCountHotel(count));
  };

  const decrementAdults = (index) => {
    const count = adultsPerRoom.map((adults, i) =>
      i === index && adults > HOTEL_MIN_ADULT_SELECTION ? adults - 1 : adults
    );
    setAdultsPerRoom(count);
    dispatch(setAdultsCountHotel(count));
  };

  const handleTravelerChange = (newTravelers) => {
    setSelectedTravelers(newTravelers);
  };

  const convertToFormattedDate = (dateString) => {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const performSearch = async (
    setSearchResultsExternal,
    setSearchRequestExternal,
    setSearchFiltersExternal
  ) => {
    const updatedSelectedTraveler =
      selectedTravelers.length > 0
        ? selectedTravelers
        : travelersByCategory[TRAVEL_CATEGORIES.HOTELS] || [];

    const accessToken = getTabSpecificData("accessToken")?.replace(/"/g, "");
    let ipAddress = getTabSpecificData("userip")?.replace(/"/g, "");
    if (ipAddress === "undefined" || !ipAddress) {
      const userLocation = getTabSpecificData("userLocation");
      if (userLocation) {
        try {
          const parsedData = JSON.parse(userLocation);
          ipAddress = parsedData?.ip || null;
        } catch (error) {
          console.error("Error parsing userLocation:", error);
          ipAddress = null;
        }
      }
    }

    if (!accessToken) {
      logEvent(analytics, "search_without_login", {
        isCorporate: true,
        city: selectedCity?.cityId,
        destination: selectedCity?.label,
      });
      openPopup();
      // throw new Error("User not logged in");
    }

    const totalAdults = adultsCountHotel.reduce(
      (total, adults) => total + adults,
      0
    );

    if (!selectedCity?.cityId && !selectedCity?.hotelcode) {
      showToast("info", "Please select a city or hotel from the list");
      throw new Error("No city or hotel selected");
    }

    if (!checkInDate || !checkOutDate) {
      showToast("info", "Please select check-in and check-out dates");
      throw new Error("Invalid dates");
    }

    const now = new Date();
    now.setHours(0, 0, 0, 0);
    const checkIn = new Date(checkInDate);
    checkIn.setHours(0, 0, 0, 0);
    const checkOut = new Date(checkOutDate);
    checkOut.setHours(0, 0, 0, 0);

    if (checkIn.getTime() === checkOut.getTime()) {
      showToast("info", "Check-in and check-out dates cannot be the same.");
      throw new Error("Same check-in and check-out dates");
    }

    if (checkIn > checkOut) {
      showToast("info", "Check-in date cannot be later than check-out date.");
      throw new Error("Invalid date range");
    }

    if (checkIn < now || checkOut < now) {
      showToast("info", "Dates must be in the future.");
      throw new Error("Past dates selected");
    }

    if (updatedSelectedTraveler.length === 0) {
      showToast("info", "Please select travelers for your booking.");
      throw new Error("No travelers selected");
    }

    if (updatedSelectedTraveler.length < totalAdults) {
      showToast("info", "Selected travelers cannot be less than adults.");
      throw new Error("Insufficient travelers");
    }

    if (updatedSelectedTraveler.length > totalAdults) {
      showToast("info", "Selected travelers cannot exceed adults.");
      throw new Error("Excess travelers");
    }

    if (totalAdults > 9 || updatedSelectedTraveler.length > 9) {
      showToast("info", "Total adults and travelers cannot exceed 9.");
      throw new Error("Too many travelers");
    }

    if (selectedRooms < 1 || selectedRooms > 6) {
      showToast("info", "Number of rooms must be between 1 and 6.");
      throw new Error("Invalid room count");
    }

    if (adultsCountHotel.some((adults) => adults < 1 || adults > 9)) {
      showToast("info", "Each room must have 1 to 9 adults.");
      throw new Error("Invalid adults per room");
    }

    const roomCount = Array.from({ length: selectedRooms }).map((_, index) => ({
      adults: adultsCountHotel[index] || 1,
      children: 0,
      childAge: [],
    }));

    const formattedCheckinDate = convertToFormattedDate(checkInDate);
    const validCheckInDate = new Date(checkInDate);
    const validCheckOutDate = new Date(checkOutDate);

    const payload = {
      checkInDate: formattedCheckinDate,
      noOfNights: Math.round(
        (validCheckOutDate - validCheckInDate) / (1000 * 60 * 60 * 24)
      ).toString(),
      countryCode: selectedCity?.originalData?.countryalpha2code || null,
      cityId: selectedCity?.cityId || null,
      hotelCode: selectedCity?.hotelcode || "",
      preferredCurrency: "INR",
      guestNationality: "IN",
      noOfRooms: selectedRooms,
      maxRating: 5,
      minRating: 1,
      isNearBySearchAllowed: false,
      ipaddress: ipAddress,
      isislandhopper: "false",
      radius: "",
      latitude: "",
      longitude: "",
      roomGuests: roomCount.map((room) => ({
        noOfAdults: room.adults,
        noOfChild: room.children,
        childAge: room.childAge,
      })),
    };

    try {
      const results = await axios.post(
        `${config.GET_HOTEL_SEARCH_DATA}`,
        payload
      );
      const response = results?.data?.data?.response;
      const request = results?.data?.data?.request;
      const filters = results?.data?.data?.filters;

      if (!response || response.length === 0) {
        showToast("info", "No hotels found for the selected criteria.");
        throw new Error("No results found");
      }

      request.selectedTravelers = updatedSelectedTraveler;
      request.selectedCity = selectedCity?.originalData;
      request.adultsPerRoom = adultsPerRoom;
      request.checkInDateRange = checkInDate;
      request.checkOutDateRange = checkOutDate;

      setSearchResults(response);
      setSearchRequest(request);
      setSearchFilters(filters);

      if (setSearchResultsExternal) setSearchResultsExternal(response);
      if (setSearchRequestExternal) setSearchRequestExternal(request);
      if (setSearchFiltersExternal) setSearchFiltersExternal(filters);

      await saveSearchResults(request, response, filters);

      const targetUrl = "/corporate/auth/booking/hotels/hotelListing";
      if (router.asPath !== targetUrl) {
        await router.push(targetUrl);
      }

      return response;
    } catch (error) {
      console.error("Error fetching hotel lists:", error);
      let errorMessage =
        error?.response?.data?.message ||
        "Something went wrong, please try again later!";
      if (
        error?.response?.data?.message ===
        "We are unable to process HotelSearch request. Please try again or contact our helpdesk."
      ) {
        errorMessage =
          "We are unable to process HotelSearch request. Please try again later.";
      } else if (error?.response?.data?.message === "No Result Found") {
        errorMessage = "No Hotels Found. Please search again.";
      }
      showToast("error", errorMessage);
      const request = {
        ...payload,
        selectedTravelers: updatedSelectedTraveler,
        selectedCity: selectedCity?.originalData,
        adultsPerRoom,
        checkInDateRange: checkInDate,
        checkOutDateRange: checkOutDate,
      };
      setSearchResults(null);
      setSearchRequest(request);
      setSearchFilters(null);
      await saveSearchResults(request, null, null);
      throw error;
    }
  };

  return {
    isLoading,
    error,
    selectedRooms,
    setSelectedRooms,
    incrementRoomCount,
    decrementRoomCount,
    searchResults,
    performSearch,
    selectedCity,
    setSelectedCity,
    handleCitySelect,
    handleClearCity,
    selectedTravelers,
    setSelectedTravelers,
    handleTravelerChange,
    incrementAdults,
    decrementAdults,
    setAdultsPerRoom,
    adultsPerRoom,
    convertToFormattedDate,
    checkInDate,
    checkOutDate,
    setCheckOutDate,
    setCheckInDate,
    dateRange,
    setDateRange,
    searchRequest,
    searchFilters,
    dataLoading,
    loadHotelOptions,
    defaultHotelOptions,
    setDefaultHotelOptions
  };
};

export default useCorporateHotelSearch;
