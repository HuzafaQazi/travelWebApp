import { useState, useEffect, useCallback, useRef } from "react";
import axios, { getTabSpecificData } from "@/utils/axios/axios";
import config from "@/config";
import { useLogin } from "@/store/context/LoginContext";
import useIndexedDBWithCompression from "@/utils/corporate/hotels/useIndexedDB";
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
  const [roomDetails, setRoomDetails] = useState([{ adults: 2, children: 0, childAge: [] }]);
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
    return options;
  };

  useEffect(() => {
    const fetchDefaultHotels = async () => {
      try {
        setIsLoading(true);
        const countryCode = getUserCountryCode();
        const response = await axios.get(
          `${config.GET_SEARCH_DESTINATION_NAME}?countryCode=${countryCode}&limit=${defaultLimit}`
        );

        if (response?.data?.status && Array.isArray(response.data.data)) {
          const formattedOptions = formatOptions(response.data.data);
          setDefaultHotelOptions(formattedOptions);
          if (formattedOptions.length === 0) {
            showToast("warning", "No default destinations found.");
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
        setDataLoading(false);
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
        setRoomDetails(results.params?.roomDetails || [{ adults: 2, children: 0, childAge: [] }]);
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

  // const incrementRoomCount = () => {
  //   if (selectedRooms < HOTEL_MAX_ROOM_SELECTION) {
  //     const newRoomCount = selectedRooms + 1;
  //     setSelectedRooms(newRoomCount);
  //     setRoomDetails((prev) => [
  //       ...prev,
  //       { adults: 2, children: 0, childAge: [] },
  //     ]);
  //   }
  // };

  // const decrementRoomCount = () => {
  //   if (selectedRooms > 1) {
  //     const newRoomCount = selectedRooms - 1;
  //     setSelectedRooms(newRoomCount);
  //     setRoomDetails((prev) => prev.slice(0, newRoomCount));
  //   }
  // };

  // const incrementAdults = (index) => {
  //   setRoomDetails((prev) =>
  //     prev.map((room, i) =>
  //       i === index && room.adults < HOTEL_MAX_ADULT_SELECTION
  //         ? { ...room, adults: room.adults + 1 }
  //         : room
  //     )
  //   );
  // };

  // const decrementAdults = (index) => {
  //   setRoomDetails((prev) =>
  //     prev.map((room, i) =>
  //       i === index && room.adults > HOTEL_MIN_ADULT_SELECTION
  //         ? { ...room, adults: room.adults - 1 }
  //         : room
  //     )
  //   );
  // };

  // const incrementChildren = (index) => {
  //   setRoomDetails((prev) =>
  //     prev.map((room, i) =>
  //       i === index && room.children < 4
  //         ? {
  //             ...room,
  //             children: room.children + 1,
  //             childAge: [...room.childAge, 1],
  //           }
  //         : room
  //     )
  //   );
  // };

  // const decrementChildren = (index) => {
  //   setRoomDetails((prev) =>
  //     prev.map((room, i) =>
  //       i === index && room.children > 0
  //         ? {
  //             ...room,
  //             children: room.children - 1,
  //             childAge: room.childAge.slice(0, -1),
  //           }
  //         : room
  //     )
  //   );
  // };

  // const handleChildChange = (e, index) => {
  //   const newChildren = parseInt(e.target.value);
  //   setRoomDetails((prev) => {
  //     const currentRoom = prev[index];
  //     const diff = newChildren - currentRoom.children;
  //     const newChildAge = [...currentRoom.childAge];
  //     if (diff > 0) {
  //       for (let i = 0; i < diff; i++) {
  //         newChildAge.push(1);
  //       }
  //     } else if (diff < 0) {
  //       newChildAge.splice(newChildren);
  //     }
  //     return prev.map((room, i) =>
  //       i === index ? { ...room, children: newChildren, childAge: newChildAge } : room
  //     );
  //   });
  // };

  // const handleAgeChange = (e, roomIndex, childIndex) => {
  //   const newAge = parseInt(e.target.value);
  //   setRoomDetails((prev) =>
  //     prev.map((room, i) =>
  //       i === roomIndex
  //         ? {
  //             ...room,
  //             childAge: room.childAge.map((age, j) =>
  //               j === childIndex ? newAge : age
  //             ),
  //           }
  //         : room
  //     )
  //   );
  // };

  const incrementRoomCount = () => {
  if (selectedRooms < HOTEL_MAX_ROOM_SELECTION) {
    const newRoomCount = selectedRooms + 1;
    setSelectedRooms(newRoomCount);
    setRoomDetails((prev) => [
      ...prev,
      { adults: 2, children: 0, childAge: [] },
    ]);
  }
};

const decrementRoomCount = () => {
  if (selectedRooms > 1) {
    const newRoomCount = selectedRooms - 1;
    setSelectedRooms(newRoomCount);
    setRoomDetails((prev) => prev.slice(0, newRoomCount));
  }
};

const incrementAdults = (index) => {
  setRoomDetails((prev) =>
    prev.map((room, i) =>
      i === index && room.adults < HOTEL_MAX_ADULT_SELECTION
        ? { ...room, adults: room.adults + 1 }
        : room
    )
  );
};

const decrementAdults = (index) => {
  setRoomDetails((prev) =>
    prev.map((room, i) =>
      i === index && room.adults > HOTEL_MIN_ADULT_SELECTION
        ? { ...room, adults: room.adults - 1 }
        : room
    )
  );
};

const incrementChildren = (index) => {
  setRoomDetails((prev) =>
    prev.map((room, i) => {
      if (i === index && room.children < 4) {
        const newTotal = room.adults + (room.children + 1);
        if (newTotal <= 10) {
          return {
            ...room,
            children: room.children + 1,
            childAge: [...room.childAge, 1],
          };
        }
      }
      return room;
    })
  );
};

const decrementChildren = (index) => {
  setRoomDetails((prev) =>
    prev.map((room, i) =>
      i === index && room.children > 0
        ? {
            ...room,
            children: room.children - 1,
            childAge: room.childAge.slice(0, -1),
          }
        : room
    )
  );
};

const handleChildChange = (e, index) => {
  const newChildren = parseInt(e.target.value);
  setRoomDetails((prev) => {
    const currentRoom = prev[index];
    const diff = newChildren - currentRoom.children;
    const newChildAge = [...currentRoom.childAge];
    const maxChildrenAllowed = 10 - currentRoom.adults;

    if (diff > 0) {
      const additionalChildren = Math.min(diff, maxChildrenAllowed - currentRoom.children);
      for (let i = 0; i < additionalChildren; i++) {
        newChildAge.push(1);
      }
    } else if (diff < 0) {
      newChildAge.splice(newChildren); // Trim childAge to match newChildren
    }

    return prev.map((room, i) =>
      i === index
        ? {
            ...room,
            children: Math.min(newChildren, maxChildrenAllowed), // Cap at max allowed
            childAge: newChildAge,
          }
        : room
    );
  });
};

const handleAgeChange = (e, roomIndex, childIndex) => {
  const newAge = parseInt(e.target.value);
  setRoomDetails((prev) =>
    prev.map((room, i) =>
      i === roomIndex
        ? {
            ...room,
            childAge: room.childAge.map((age, j) =>
              j === childIndex ? newAge : age
            ),
          }
        : room
    )
  );
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
    // const updatedSelectedTraveler =
    //   selectedTravelers.length > 0
    //     ? selectedTravelers
    //     : travelersByCategory[TRAVEL_CATEGORIES.HOTELS] || [];

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

    // if (!accessToken) {
    //   logEvent(analytics, "search_without_login", {
    //     isCorporate: true,
    //     city: selectedCity?.cityId,
    //     destination: selectedCity?.label,
    //   });
    //   openPopup();
    // }

    const totalAdults = roomDetails.reduce((total, room) => total + room.adults, 0);
    const totalChildren = roomDetails.reduce((total, room) => total + room.children, 0);

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

    // if (updatedSelectedTraveler.length === 0) {
    //   showToast("info", "Please select travelers for your booking.");
    //   throw new Error("No travelers selected");
    // }

    // if (updatedSelectedTraveler.length < totalAdults + totalChildren) {
    //   showToast("info", "Selected travelers cannot be less than total occupants.");
    //   throw new Error("Insufficient travelers");
    // }

    // if (updatedSelectedTraveler.length > totalAdults + totalChildren) {
    //   showToast("info", "Selected travelers cannot exceed total occupants.");
    //   throw new Error("Excess travelers");
    // }

    if (totalAdults + totalChildren > 9) {
      showToast("info", "Total adults and children cannot exceed 9.");
      throw new Error("Too many travelers");
    }

    if (selectedRooms < 1 || selectedRooms > 6) {
      showToast("info", "Number of rooms must be between 1 and 6.");
      throw new Error("Invalid room count");
    }

    if (roomDetails.some((room) => room.adults < 1 || room.adults > 9)) {
      showToast("info", "Each room must have 1 to 9 adults.");
      throw new Error("Invalid adults per room");
    }

    if (roomDetails.some((room) => room.children > 4)) {
      showToast("info", "Each room cannot have more than 4 children.");
      throw new Error("Too many children per room");
    }

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
      roomGuests: roomDetails.map((room) => ({
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

      // request.selectedTravelers = updatedSelectedTraveler;
      request.selectedCity = selectedCity?.originalData;
      request.roomDetails = roomDetails;
      request.checkInDateRange = checkInDate;
      request.checkOutDateRange = checkOutDate;

      setSearchResults(response);
      setSearchRequest(request);
      setSearchFilters(filters);

      if (setSearchResultsExternal) setSearchResultsExternal(response);
      if (setSearchRequestExternal) setSearchRequestExternal(request);
      if (setSearchFiltersExternal) setSearchFiltersExternal(filters);

      await saveSearchResults(request, response, filters);

      const targetUrl = "/bookings/hotels/hotellisting";
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
        // selectedTravelers: updatedSelectedTraveler,
        selectedCity: selectedCity?.originalData,
        roomDetails,
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

  const handleTravelerChange = (newTravelers) => {
    setSelectedTravelers(newTravelers);
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
    roomDetails,
    setRoomDetails,
    incrementChildren,
    decrementChildren,
    handleChildChange,
    handleAgeChange,
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
