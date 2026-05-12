import { useState, useEffect, useRef, useMemo } from "react";
import axios, {
  getTabSpecificData,
  setTabSpecificData,
  removeTabSpecificData,
} from "@/utils/axios/axios";
import useLocalStorage from "@/hooks/useLocalStorage";
import { useLogin } from "@/store/context/LoginContext";
import config from "@/config";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useRouter } from "next/router";
import pako from "pako";
import { analytics } from "@/utils/firebase";
import { logEvent } from "firebase/analytics";
import showToast from "@/utils/toast";
import { useSelector } from "react-redux";
import { TRAVEL_CATEGORIES } from "@/utils/constants";

const useFlightsSearch = () => {
  const router = useRouter();

  const { travelersByCategory, adultsCount } = useSelector(
    (state) => state.travellers
  );

  const userDetails = useSelector((state) => state?.user?.userInfo);

  const fromDropdownRef = useRef(null);
  const toDropdownRef = useRef(null);
  const multiCityDropdownRefs = useRef(
    Array.from({ length: 6 }, () => ({ from: null, to: null }))
  );

  const { openPopup } = useLogin();

  const [loading, setLoading] = useState(false);
  const [redirectionRoute, setRedirectionRoute] = useState(""); // this is required to avoid multiple search calls
  const [getAccessToken, setAccessToken] = useLocalStorage("accessToken");
  const [getuserip, setuserip] = useLocalStorage("userip");

  const [fromDestination, setFromDestination] = useState("");
  const [toDestination, setToDestination] = useState("");
  const [matchingFromDestinations, setMatchingFromDestinations] = useState([]);
  const [matchingToDestinations, setMatchingToDestinations] = useState([]);
  const [selectedFromItemIndex, setSelectedFromItemIndex] = useState(-1);
  const [selectedToItemIndex, setSelectedToItemIndex] = useState(-1);
  const [isFromDropdownOpen, setIsFromDropdownOpen] = useState(false);
  const [isToDropdownOpen, setIsToDropdownOpen] = useState(false);
  const [isFromSearchOpen, setIsFromSearchOpen] = useState(false);
  const [isToSearchOpen, setIsToSearchOpen] = useState(false);
  const [fromCityCode, setFromCityCode] = useState(null);
  const [toCityCode, setToCityCode] = useState(null);
  const [fromCity, setFromCity] = useState(null);
  const [toCity, setToCity] = useState(null);
  const [isToastVisible, setIsToastVisible] = useState(false);
  const [defaultCityOptions, setDefaultCityOptions] = useState([]);
  const [multiCityDestinations, setMultiCityDestinations] = useState([
    {
      from: "",
      to: "",
      toCity: "",
      fromCity: "",
      toCityCode: "",
      fromCityCode: "",
      departureDate: new Date(),
    },
  ]);
  const [isMultiCityDropdownOpen, setIsMultiCityDropdownOpen] = useState([
    { from: false, to: false },
  ]);
  const [isMultiCitySearchOpen, setIsMultiCitySearchOpen] = useState([
    { from: false, to: false },
  ]);
  const [selectedMultiCityItemIndex, setSelectedMultiCityItemIndex] = useState([
    { from: -1, to: -1 },
  ]);
  const [multiCityCityCode, setMultiCityCityCode] = useState([
    { from: null, to: null },
  ]);
  const [multiCityCity, setMultiCityCity] = useState([
    { from: null, to: null },
  ]);
  const [matchingMultiCityDestinations, setMatchingMultiCityDestinations] =
    useState([{ from: [], to: [] }]);

  const storedLocation =
    typeof window !== "undefined" ? getTabSpecificData("userLocation") : null;
  const parsedLocation = storedLocation ? JSON.parse(storedLocation) : null;

  const userHomeCountryCode = useMemo(() => {
    console.log("=== Calculating userHomeCountryCode ===");
    console.log("userDetails:", userDetails);

    // Method 1: From userDetails (multiple paths)
    if (userDetails?.loggedInDetails?.userDetails?.countryCode) {
      console.log(
        "Found from userDetails.countryCode:",
        userDetails.loggedInDetails.userDetails.countryCode
      );
      return userDetails.loggedInDetails.userDetails.countryCode;
    }

    if (
      userDetails?.loggedInDetails?.userDetails?.countryDetails?.countryCode
    ) {
      console.log(
        "Found from countryDetails:",
        userDetails.loggedInDetails.userDetails.countryDetails.countryCode
      );
      return userDetails.loggedInDetails.userDetails.countryDetails.countryCode;
    }

    if (userDetails?.loggedInDetails?.companyDetails?.countryCode) {
      console.log(
        "Found from companyDetails:",
        userDetails.loggedInDetails.companyDetails.countryCode
      );
      return userDetails.loggedInDetails.companyDetails.countryCode;
    }

    // Method 2: From stored location
    if (typeof window !== "undefined") {
      try {
        const storedLocation = getTabSpecificData("userLocation");
        console.log("storedLocation:", storedLocation);

        if (
          storedLocation &&
          storedLocation !== "undefined" &&
          storedLocation !== "null"
        ) {
          const parsedLocation = JSON.parse(storedLocation);
          console.log("parsedLocation:", parsedLocation);

          if (parsedLocation?.country_code) {
            console.log(
              "Found from stored location:",
              parsedLocation.country_code
            );
            return parsedLocation.country_code;
          }
        }
      } catch (error) {
        console.error("Error parsing stored location:", error);
      }
    }

    console.log("No country code found, returning null");
    return null;
  }, [userDetails]); // Re-calculate when userDetails changes

  // Determine if flight is domestic or international
  // const isDomesticFlight = useMemo(() => {
  //   console.log("=== Calculating isDomesticFlight ===");
  //   console.log("userHomeCountryCode:", userHomeCountryCode);
  //   console.log("fromDestination cityData:", fromDestination?.cityData);
  //   console.log(
  //     "fromDestination cityData:   13",
  //     fromDestination?.cityData?.countrycode
  //   );
  //   console.log("toDestination cityData:", toDestination?.cityData);

  //   // Early return if no user home country
  //   if (!userHomeCountryCode) {
  //     console.log("No userHomeCountryCode available");
  //     return false;
  //   }

  //   // For regular flights (one-way or round-trip)
  //   const fromCountryCode = fromDestination?.cityData?.countrycode;
  //   const toCountryCode = toDestination?.cityData?.countrycode;

  //   if (fromCountryCode && toCountryCode) {
  //     const userCountryUpper = userHomeCountryCode.toUpperCase();
  //     const fromCountryUpper = fromCountryCode.toUpperCase();
  //     const toCountryUpper = toCountryCode.toUpperCase();

  //     const isDomestic =
  //       userCountryUpper === fromCountryUpper &&
  //       userCountryUpper === toCountryUpper &&
  //       fromCountryUpper === toCountryUpper;

  //     console.log("Regular flight analysis:", {
  //       userCountryUpper,
  //       fromCountryUpper,
  //       toCountryUpper,
  //       isDomestic,
  //     });

  //     return isDomestic;
  //   }

  //   // For multi-city flights
  //   if (multiCityDestinations && multiCityDestinations.length > 0) {
  //     console.log("Analyzing multi-city destinations:", multiCityDestinations);

  //     const allDomestic = multiCityDestinations.every((destination, index) => {
  //       const fromCountryCode = destination.from?.cityData?.countrycode;
  //       const toCountryCode = destination.to?.cityData?.countrycode;

  //       console.log(`Multi-city segment ${index}:`, {
  //         from: destination.from?.label,
  //         to: destination.to?.label,
  //         fromCountryCode,
  //         toCountryCode,
  //       });

  //       if (!fromCountryCode || !toCountryCode) {
  //         console.log(`Missing country codes for segment ${index}`);
  //         return false;
  //       }

  //       const userCountryUpper = userHomeCountryCode.toUpperCase();
  //       const fromCountryUpper = fromCountryCode.toUpperCase();
  //       const toCountryUpper = toCountryCode.toUpperCase();

  //       const segmentDomestic =
  //         userCountryUpper === fromCountryUpper &&
  //         userCountryUpper === toCountryUpper &&
  //         fromCountryUpper === toCountryUpper;

  //       console.log(`Segment ${index} domestic check:`, segmentDomestic);
  //       return segmentDomestic;
  //     });

  //     console.log("All multi-city segments domestic:", allDomestic);
  //     return allDomestic;
  //   }

  //   console.log("No valid flight data available");
  //   return false;
  // }, [
  //   userHomeCountryCode,
  //   fromDestination?.cityData?.countryCode,
  //   toDestination?.cityData?.countryCode,
  //   multiCityDestinations,
  // ]);

  // // Flight journey type based on domestic/international classification
  // const flightJourneyType = useMemo(() => {
  //   const journeyType = isDomesticFlight ? "domestic" : "international";
  //   console.log(
  //     "Final flight journey type:",
  //     journeyType,
  //     "isDomesticFlight:",
  //     isDomesticFlight
  //   );
  //   return journeyType;
  // }, [isDomesticFlight]);

  useEffect(() => {
    const fetchDefaultCities = async () => {
      try {
        setLoading(true);
        const countryCode = getUserCountryCode();
        const response = await axios.get(
          `${config.FLIGHTS_CITY}?length=10&countryCode=${countryCode || "IN"}`
        );
        if (
          response?.data?.status === "SUCCESS" &&
          Array.isArray(response.data.data)
        ) {
          const formattedOptions = response.data.data.map((city) => ({
            value: city.id || city._id || city.cityCode,
            label: city.cityName || "",
            airportName: city.airportName || "",
            airportCode: city.airportCode || city.cityCode || "",
            countryname: city.countryName || "",
            cityData: city,
          }));
          setDefaultCityOptions(formattedOptions);
          console.log("Default cities fetched:", formattedOptions);
        }
      } catch (error) {
        console.error("Error fetching default cities:", error);
        setDefaultCityOptions([]);
      } finally {
        setLoading(false);
      }
    };

    fetchDefaultCities();
  }, []);

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
  // const searchDestinations = async (
  //   destination,
  //   setMatchingDestinations,
  //   setIsDropdownOpen,
  //   setIsSearchOpen,
  //   abortController
  // ) => {
  //   try {
  //     const userLocation = localStorage.getItem("userLocation");
  //     let countryCode = null;
  //     // Check if the user is logged in
  //     if (userDetails) {
  //       countryCode = userDetails?.loggedInDetails?.userDetails?.countryCode;

  //       // If the user is logged in but `countryCode` is not available, fallback to `userLocation`
  //       if (!countryCode && userLocation) {
  //         const parsedData = JSON.parse(userLocation);
  //         countryCode = parsedData?.country_code;
  //       }
  //     } else if (userLocation) {
  //       // If the user is not logged in, use the `userLocation`
  //       const parsedData = JSON.parse(userLocation);
  //       countryCode = parsedData?.country_code;
  //     }
  //     const response = await axios.get(
  //       `${
  //         config.FLIGHTS_CITY
  //       }?cityname=${destination.trim()}&countryCode=${countryCode}`,
  //       { signal: abortController.signal }
  //     );
  //     const data = response.data;
  //     setMatchingDestinations(data.data);
  //     setIsDropdownOpen(true);
  //     setIsSearchOpen(true);
  //     abortController.abort();
  //   } catch (error) {
  //     console.error("Error fetching matching destinations:", error);
  //     setMatchingDestinations([]);
  //   }
  // };

  const searchDestinations = async (inputValue, key = "default") => {
    try {
      if (key === "from") {
        abortControllers.current[0].from.abort();
        abortControllers.current[0].from = new AbortController();
      } else if (key === "to") {
        abortControllers.current[0].to.abort();
        abortControllers.current[0].to = new AbortController();
      }

      const controller =
        key === "from"
          ? abortControllers.current[0].from
          : abortControllers.current[0].to;
      const countryCode = getUserCountryCode();

      if (!inputValue.trim()) {
        return defaultCityOptions;
      }

      const response = await axios.get(
        `${
          config.FLIGHTS_CITY
        }?cityname=${inputValue.trim()}&countryCode=${countryCode}&length=10`,
        { signal: controller.signal }
      );

      if (
        response?.data?.status === "SUCCESS" &&
        Array.isArray(response.data.data)
      ) {
        return response.data.data.map((city) => ({
          value: city.id || city._id || city.cityCode,
          label: city.cityName || "",
          airportName: city.airportName || "",
          airportCode: city.airportCode || city.cityCode || "",
          countryname: city.countryName || "",
          countryCode: city.countryCode || city.countryCode || "",
          cityData: city,
        }));
      }
      return [];
    } catch (error) {
      if (error.name !== "AbortError") {
        console.error("Error fetching destinations:", error);
      }
      return [];
    }
  };
  const abortControllerFrom = useRef(new AbortController());
  const abortControllerTo = useRef(new AbortController());
  // old code of handleFromDestinationChange
  // const handleFromDestinationChange = (event) => {
  //   const value = event.target.value;
  //   console.log("value: ", value);
  //   setFromDestination(value);
  //   setFromCityCode("");
  //   setRedirectionRoute("");
  //   abortControllerFrom.current.abort();
  //   abortControllerFrom.current = new AbortController();
  //   if (value.trim().length >= 1) {
  //     searchDestinations(
  //       value,
  //       setMatchingFromDestinations,
  //       setIsFromDropdownOpen,
  //       setIsFromSearchOpen,
  //       abortControllerFrom.current
  //     );
  //     setSelectedFromItemIndex(-1);
  //     logEvent(analytics, "from_destination", {
  //       fromCityname: value,
  //     });
  //   }
  // };

  // new code for handleFromDestinationChange
  const handleFromDestinationChange = (option) => {
    if (!option) {
      setFromDestination(null);
      setFromCityCode("");
      setFromCity("");
      setRedirectionRoute("");
      abortControllerFrom.current.abort();
      abortControllerFrom.current = new AbortController();
      setMatchingFromDestinations([]);
      setIsFromDropdownOpen(false);
      setSelectedFromItemIndex(-1);
      return;
    }

    // For AsyncSelect, we don't trigger a search on input change since options are loaded by loadCityOptions
    // Instead, we update the state with the selected option
    setFromDestination(option);
    setFromCityCode(option.cityData.citycode);
    setFromCity(`${option.cityData.cityname}, ${option.cityData.countryname}`);
    setRedirectionRoute("");
    logEvent(analytics, "from_destination", {
      fromCityname: option.label,
    });
  };

  // old code for handleToDestinationChange
  // const handleToDestinationChange = (event) => {
  //   const value = event.target.value;
  //   setToDestination(value);
  //   setToCityCode("");
  //   setRedirectionRoute("");
  //   abortControllerTo.current.abort();
  //   abortControllerTo.current = new AbortController();
  //   if (value.trim().length >= 1) {
  //     searchDestinations(
  //       value,
  //       setMatchingToDestinations,
  //       setIsToDropdownOpen,
  //       setIsToSearchOpen,
  //       abortControllerTo.current
  //     );
  //     setSelectedToItemIndex(-1);
  //     logEvent(analytics, "to_destination", {
  //       toCityname: value,
  //     });
  //   }
  // };

  // new code for handleToDestinationChange
  const handleToDestinationChange = (option) => {
    // Handle clearing the selection
    if (!option) {
      setToDestination(null);
      setToCityCode("");
      setToCity("");
      setRedirectionRoute("");
      abortControllerTo.current.abort();
      abortControllerTo.current = new AbortController();
      setMatchingToDestinations([]);
      setIsToDropdownOpen(false);
      setSelectedToItemIndex(-1);
      return;
    }

    // Update states with selected option
    setToDestination(option);
    setToCityCode(option.cityData.citycode);
    setToCity(`${option.cityData.cityname}, ${option.cityData.countryname}`);
    setRedirectionRoute("");
    logEvent(analytics, "to_destination", {
      toCityname: option.label,
    });
  };

  // const searchMultiCityDestinations = async (
  //   destination,
  //   setMatchingDestinations,
  //   setIsDropdownOpen,
  //   setIsSearchOpen,
  //   abortController,
  //   index,
  //   destinationType
  // ) => {
  //   try {
  //     // Cancel any previous request
  //     abortController[index] = abortController[index] || {};
  //     abortController?.[index]?.[destinationType]?.abort();

  //     // Create a new abort controller for the current request
  //     const newAbortController = new AbortController();
  //     abortController[index][destinationType] = newAbortController;
  //     const userLocation = localStorage.getItem("userLocation");
  //     let countryCode = null;
  //     // Check if the user is logged in
  //     if (userDetails) {
  //       countryCode = userDetails?.loggedInDetails?.userDetails?.countryCode;

  //       // If the user is logged in but `countryCode` is not available, fallback to `userLocation`
  //       if (!countryCode && userLocation) {
  //         const parsedData = JSON.parse(userLocation);
  //         countryCode = parsedData?.country_code;
  //       }
  //     } else if (userLocation) {
  //       // If the user is not logged in, use the `userLocation`
  //       const parsedData = JSON.parse(userLocation);
  //       countryCode = parsedData?.country_code;
  //     }
  //     const response = await axios.get(
  //       `${
  //         config.FLIGHTS_CITY
  //       }?cityname=${destination.trim()}&countryCode=${countryCode}`,
  //       { signal: newAbortController.signal }
  //     );
  //     const data = response.data;
  //     setMatchingDestinations((prevDestinations) => {
  //       const updatedDestinations = [...prevDestinations];
  //       updatedDestinations[index] = updatedDestinations[index] || {};
  //       updatedDestinations[index][destinationType] = data.data;
  //       return updatedDestinations;
  //     });
  //     setIsDropdownOpen((prevDropdowns) => {
  //       const updatedDropdowns = [...prevDropdowns];
  //       updatedDropdowns[index] = updatedDropdowns[index] || {};
  //       updatedDropdowns[index][destinationType] = true;
  //       return updatedDropdowns;
  //     });
  //     setIsSearchOpen((prevSearches) => {
  //       const updatedSearches = [...prevSearches];
  //       updatedSearches[index] = updatedSearches[index] || {};
  //       updatedSearches[index][destinationType] = true;
  //       return updatedSearches;
  //     });
  //     // abortController[index][destinationType].abort();
  //   } catch (error) {
  //     console.error("Error fetching matching destinations:", error);
  //     console.log("Error fetching matching destinations:", error);
  //     setMatchingDestinations((prevDestinations) => {
  //       const updatedDestinations = [...prevDestinations];
  //       updatedDestinations[index] = updatedDestinations[index] || {};
  //       updatedDestinations[index][destinationType] = [];
  //       return updatedDestinations;
  //     });
  //     setIsSearchOpen((prevSearches) => {
  //       const updatedSearches = [...prevSearches];
  //       updatedSearches[index] = updatedSearches[index] || {};
  //       updatedSearches[index][destinationType] = true;
  //       return updatedSearches;
  //     });
  //   }
  // };

  const searchMultiCityDestinations = async (
    destination,
    index,
    destinationType
  ) => {
    try {
      console.log(
        "Searching multi-city destinations for:",
        destination,
        "at index:",
        index,
        "for type:",
        destinationType
      );
      // Cancel any previous request
      abortControllers.current[index] = abortControllers.current[index] || {};
      abortControllers.current[index][destinationType]?.abort();
      abortControllers.current[index][destinationType] = new AbortController();

      const countryCode = getUserCountryCode();

      if (!destination.trim()) {
        return defaultCityOptions;
      }

      const response = await axios.get(
        `${
          config.FLIGHTS_CITY
        }?cityname=${destination.trim()}&countryCode=${countryCode}&length=10`,
        { signal: abortControllers.current[index][destinationType].signal }
      );

      if (
        response?.data?.status === "SUCCESS" &&
        Array.isArray(response.data.data)
      ) {
        return response.data.data.map((city) => ({
          value: city.id || city._id || city.cityCode,
          label: city.cityName || "",
          airportName: city.airportName || "",
          airportCode: city.airportCode || city.cityCode || "",
          countryname: city.countryName || "",
          countryCode: city.countryCode || city.countryCode || "",
          cityData: city,
        }));
      }
      return [];
    } catch (error) {
      if (error.name !== "AbortError") {
        console.error("Error fetching multi-city destinations:", error);
      }
      return [];
    }
  };

  const abortControllers = useRef([
    { from: new AbortController(), to: new AbortController() },
  ]);
  const handleMultiCityDestinationChange = async (
    event,
    index,
    destinationType
  ) => {
    console.log("destinationType: ", destinationType);
    const value = event.target.value;
    setMultiCityDestinations((prevDestinations) => {
      const updatedDestinations = [...prevDestinations];
      updatedDestinations[index] = updatedDestinations[index] || {};
      updatedDestinations[index][destinationType] = value;
      // if (!updatedDestinations[index].departureDate) {
      //   updatedDestinations[index].departureDate = new Date();
      // }
      if (!updatedDestinations[index].departureDate) {
        // If index-1 exists and has a departure date, use it; otherwise, set it to a new date
        if (index > 0 && updatedDestinations[index - 1]?.departureDate) {
          updatedDestinations[index].departureDate =
            updatedDestinations[index - 1].departureDate;
        } else {
          updatedDestinations[index].departureDate = new Date();
        }
      }
      return updatedDestinations;
    });

    // Check if the value is long enough to trigger a search
    if (value.trim().length >= 1) {
      const matchingDestinations = setMatchingMultiCityDestinations;
      const isDropdownOpen = setIsMultiCityDropdownOpen;
      const isSearchOpen = setIsMultiCitySearchOpen;

      // abortControllers.current[index][destinationType].abort();
      // abortControllers.current[index][destinationType] = new AbortController();

      await searchMultiCityDestinations(
        value,
        matchingDestinations,
        isDropdownOpen,
        isSearchOpen,
        abortControllers.current,
        index,
        destinationType
      );
    }
  };

  // useEffect(() => {
  //   const dropdownRefs = multiCityDropdownRefs.current;

  //   const handleKeyDown = (e, index, type) => {
  //     const selectedItemIndex = selectedMultiCityItemIndex[index][type];
  //     const matchingDestinations = matchingMultiCityDestinations[index][type];

  //     if (
  //       e.key === "ArrowDown" &&
  //       selectedItemIndex < matchingDestinations.length - 1
  //     ) {
  //       setSelectedMultiCityItemIndex((prevIndexes) => {
  //         const updatedIndexes = [...prevIndexes];
  //         updatedIndexes[index][type] += 1;
  //         return updatedIndexes;
  //       });
  //     } else if (e.key === "ArrowUp" && selectedItemIndex > 0) {
  //       setSelectedMultiCityItemIndex((prevIndexes) => {
  //         const updatedIndexes = [...prevIndexes];
  //         updatedIndexes[index][type] -= 1;
  //         return updatedIndexes;
  //       });
  //     } else if (e.key === "Enter" && selectedItemIndex >= 0) {
  //       handleMultiCitySelectDestination(
  //         matchingDestinations[selectedItemIndex],
  //         type,
  //         index
  //       );
  //     }
  //   };

  //   const handleClickOutside = (e, index, type) => {
  //     const dropdownRef = dropdownRefs[index][type];
  //     if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
  //       setIsMultiCityDropdownOpen((prevOpen) => {
  //         const updatedOpen = [...prevOpen];
  //         updatedOpen[index][type] = false;
  //         console.log(updatedOpen)
  //         return updatedOpen;
  //       });
  //     }
  //   };

  //   const addEventListeners = (index, type) => {
  //     document.addEventListener("keydown", (e) =>
  //       handleKeyDown(e, index, type)
  //     );
  //     document.addEventListener("click", (e) =>
  //       handleClickOutside(e, index, type)
  //     );
  //   };

  //   const removeEventListeners = (index, type) => {
  //     document.removeEventListener("keydown", (e) =>
  //       handleKeyDown(e, index, type)
  //     );
  //     document.removeEventListener("click", (e) =>
  //       handleClickOutside(e, index, type)
  //     );
  //   };

  //   dropdownRefs.forEach((ref, index) => {
  //     addEventListeners(index, "from");
  //     addEventListeners(index, "to");
  //   });

  //   return () => {
  //     dropdownRefs.forEach((ref, index) => {
  //       removeEventListeners(index, "from");
  //       removeEventListeners(index, "to");
  //     });
  //   };
  // }, [selectedMultiCityItemIndex, matchingMultiCityDestinations]);

  // const handleMultiCitySelectDestination = async (
  //   selectedDestination,
  //   destinationType,
  //   index
  // ) => {
  //   const isMobileView = window.innerWidth <= 768;
  //   const destinationText = `${selectedDestination?.cityname}(${selectedDestination?.citycode}), ${selectedDestination?.countryname}`;
  //   const url = "/flights/multicity/list";

  //   // Update the selected destination in oneway and twoway
  //   handleSelectDestination(selectedDestination, destinationType, false);

  //   if (destinationType === "from") {
  //     setMultiCityDestinations((prevDestinations) => {
  //       const updatedDestinations = [...prevDestinations];
  //       updatedDestinations[index] = updatedDestinations[index] || {};
  //       // updatedDestinations[index].from = destinationText;
  //       if (isMobileView) {
  //         updatedDestinations[index].from = selectedDestination.citycode;
  //       } else {
  //         updatedDestinations[index].from = destinationText;
  //       }
  //       updatedDestinations[index].fromCity = selectedDestination.cityname;
  //       updatedDestinations[index].fromCityCode = selectedDestination.citycode;
  //       return updatedDestinations;
  //     });
  //     setSelectedMultiCityItemIndex((prevIndexes) => {
  //       const updatedIndexes = [...prevIndexes];
  //       updatedIndexes[index] = updatedIndexes[index] || {};
  //       updatedIndexes[index].from = -1;
  //       return updatedIndexes;
  //     });
  //     setIsMultiCityDropdownOpen((prevOpen) => {
  //       const updatedOpen = [...prevOpen];
  //       updatedOpen[index] = updatedOpen[index] || {};
  //       updatedOpen[index].from = false;
  //       return updatedOpen;
  //     });
  //     setIsMultiCitySearchOpen((prevSearches) => {
  //       const updatedSearches = [...prevSearches];
  //       updatedSearches[index] = updatedSearches[index] || {};
  //       updatedSearches[index][destinationType] = false;
  //       return updatedSearches;
  //     });
  //     setMultiCityCityCode((prevCityCodes) => {
  //       const updatedCityCodes = [...prevCityCodes];
  //       updatedCityCodes[index] = updatedCityCodes[index] || {};
  //       updatedCityCodes[index].from = selectedDestination.citycode;
  //       return updatedCityCodes;
  //     });
  //     setMultiCityCity((prevCities) => {
  //       const updatedCities = [...prevCities];
  //       updatedCities[index] = updatedCities[index] || {};
  //       updatedCities[index].from = selectedDestination.cityname;
  //       return updatedCities;
  //     });
  //   } else if (destinationType === "to") {
  //     setMultiCityDestinations((prevDestinations) => {
  //       const updatedDestinations = [...prevDestinations];
  //       updatedDestinations[index] = updatedDestinations[index] || {};
  //       // updatedDestinations[index].to = destinationText;
  //       // Set different format based on device view
  //       if (isMobileView) {
  //         updatedDestinations[index].to = selectedDestination.citycode;
  //       } else {
  //         updatedDestinations[index].to = destinationText;
  //       }
  //       updatedDestinations[index].toCity = selectedDestination.cityname;
  //       updatedDestinations[index].toCityCode = selectedDestination.citycode;
  //       return updatedDestinations;
  //     });
  //     setSelectedMultiCityItemIndex((prevIndexes) => {
  //       const updatedIndexes = [...prevIndexes];
  //       updatedIndexes[index] = updatedIndexes[index] || {};
  //       updatedIndexes[index].to = -1;
  //       return updatedIndexes;
  //     });
  //     setIsMultiCityDropdownOpen((prevOpen) => {
  //       const updatedOpen = [...prevOpen];
  //       updatedOpen[index] = updatedOpen[index] || {};
  //       updatedOpen[index].to = false;
  //       return updatedOpen;
  //     });
  //     setIsMultiCitySearchOpen((prevSearches) => {
  //       const updatedSearches = [...prevSearches];
  //       updatedSearches[index] = updatedSearches[index] || {};
  //       updatedSearches[index][destinationType] = false;
  //       return updatedSearches;
  //     });
  //     setMultiCityCityCode((prevCityCodes) => {
  //       const updatedCityCodes = [...prevCityCodes];
  //       updatedCityCodes[index] = updatedCityCodes[index] || {};
  //       updatedCityCodes[index].to = selectedDestination.citycode;
  //       return updatedCityCodes;
  //     });
  //     setMultiCityCity((prevCities) => {
  //       const updatedCities = [...prevCities];
  //       updatedCities[index] = updatedCities[index] || {};
  //       updatedCities[index].to = selectedDestination.cityname;
  //       return updatedCities;
  //     });
  //   }

  //   setRedirectionRoute(url);
  //   setMatchingMultiCityDestinations((prevDestinations) => {
  //     const updatedDestinations = [...prevDestinations];
  //     updatedDestinations[index] = updatedDestinations[index] || {};
  //     updatedDestinations[index][destinationType] = [];
  //     return updatedDestinations;
  //   });
  // };
  const handleSelectDestination = (field, value) => {
    if (!value) {
      if (field === "from") {
        setFromDestination(null);
        setFromCityCode("");
        setFromCity("");
      } else {
        setToDestination(null);
        setToCityCode("");
        setToCity("");
      }
      setRedirectionRoute("");
      return;
    }

    if (
      field === "from" &&
      toDestination &&
      value.value === toDestination.value
    ) {
      showToast("error", "Departure and arrival locations cannot be the same");
      return;
    }
    if (
      field === "to" &&
      fromDestination &&
      value.value === fromDestination.value
    ) {
      showToast("error", "Departure and arrival locations cannot be the same");
      return;
    }

    if (field === "from") {
      setFromDestination(value);
      setFromCityCode(value.airportCode || "");
      setFromCity(value.label);
      logEvent(analytics, "from_destination_selected", {
        fromCityname: value.label,
      });
    } else {
      setToDestination(value);
      setToCityCode(value.airportCode || "");
      setToCity(value.label);
      logEvent(analytics, "to_destination_selected", {
        toCityname: value.label,
      });
    }
    setRedirectionRoute("");
  };

  const handleMultiCitySelectDestination = (index, destinationType, value) => {
    console.log(
      `handleMultiCitySelectDestination: index=${index}, destinationType=${destinationType}, value=`,
      value
    );

    if (!value) {
      setMultiCityDestinations((prev) => {
        const updated = [...prev];
        updated[index] = {
          ...updated[index],
          [destinationType]: null,
          [`${destinationType}City`]: "",
          [`${destinationType}CityCode`]: "",
        };
        console.log("Updated multiCityDestinations:", updated);
        return updated;
      });
      setMultiCityCityCode((prev) => {
        const updated = [...prev];
        updated[index] = { ...updated[index], [destinationType]: "" };
        return updated;
      });
      setMultiCityCity((prev) => {
        const updated = [...prev];
        updated[index] = { ...updated[index], [destinationType]: "" };
        return updated;
      });
      setRedirectionRoute("");
      return;
    }

    // Validate option object
    if (!value.value || !value.label) {
      console.error("Invalid option object:", value);
      showToast("error", "Invalid destination selected");
      return;
    }

    const otherDestination =
      destinationType === "from"
        ? multiCityDestinations[index]?.to
        : multiCityDestinations[index]?.from;
    if (otherDestination && value.value === otherDestination.value) {
      showToast("error", "Departure and arrival locations cannot be the same");
      return;
    }

    setMultiCityDestinations((prev) => {
      const updated = [...prev];
      updated[index] = {
        ...updated[index],
        [destinationType]: value,
        [`${destinationType}City`]: value.label,
        [`${destinationType}CityCode`]: value.airportCode,
        departureDate:
          updated[index]?.departureDate ||
          (index > 0 && updated[index - 1]?.departureDate) ||
          new Date(),
      };
      console.log("Updated multiCityDestinations:", updated);
      return updated;
    });

    setMultiCityCityCode((prev) => {
      const updated = [...prev];
      updated[index] = {
        ...updated[index],
        [destinationType]: value.airportCode,
      };
      return updated;
    });

    setMultiCityCity((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [destinationType]: value.label };
      return updated;
    });

    setRedirectionRoute("/flights/multicity/list");
    logEvent(analytics, `multi_city_${destinationType}_selected`, {
      cityname: value.label,
      index,
    });
  };

  // const searchFlight = async () => {};
  // const fetchFlightsWithRefId = async () => {};
  // const removeCityPair = (index) => {
  //   setMultiCityDestinations((prev) => prev.filter((_, i) => i !== index));
  //   setMultiCityCityCode((prev) => prev.filter((_, i) => i !== index));
  //   setMultiCityCity((prev) => prev.filter((_, i) => i !== index));
  //   abortControllers.current = abortControllers.current.filter((_, i) => i !== index);
  // };

  const removeCityPair = (index) => {
    const updatedDestinations = [...multiCityDestinations];
    updatedDestinations.splice(index, 1);
    setMultiCityDestinations(updatedDestinations);

    const updatedDropdownOpen = [...isMultiCityDropdownOpen];
    updatedDropdownOpen.splice(index, 1);
    setIsMultiCityDropdownOpen(updatedDropdownOpen);

    const updatedMatchingDestinations = [...matchingMultiCityDestinations];
    updatedMatchingDestinations.splice(index, 1);
    setMatchingMultiCityDestinations(updatedMatchingDestinations);

    const updatedSelectedIndexes = [...selectedMultiCityItemIndex];
    updatedSelectedIndexes.splice(index, 1);
    setSelectedMultiCityItemIndex(updatedSelectedIndexes);
  };

  // useEffect(() => {
  //   return () => {
  //     if (abortControllerFrom.current) {
  //       abortControllerFrom.current.abort(); // Cancel request when component unmounts
  //     }
  //     if (abortControllerTo.current) {
  //       abortControllerTo.current.abort(); // Cancel request when component unmounts
  //     }
  //   };
  // }, [redirectionRoute]);

  // useEffect(() => {
  //   const searchDestinations = (
  //     destination,
  //     setMatchingDestinations,
  //     setIsDropdownOpen,
  //     setIsSearchOpen
  //   ) => {
  //     axios
  //       .get(`${config.FLIGHTS_CITY}?cityname=${destination.trim()}`)
  //       .then((response) => {
  //         const data = response.data;
  //         setMatchingDestinations(data.data);
  //         setIsDropdownOpen(true);
  //         setIsSearchOpen(true);
  //       })
  //       .catch((error) => {
  //         console.error("Error fetching matching destinations:", error);
  //         setMatchingDestinations([]);
  //       });
  //   };

  //   let timerFrom;
  //   let timerTo;

  //   clearTimeout(timerFrom);
  //   clearTimeout(timerTo);

  //   timerFrom = setTimeout(() => {
  //     if (
  //       fromDestination &&
  //       fromDestination.length >= 3 &&
  //       redirectionRoute === ""
  //     ) {
  //       searchDestinations(
  //         fromDestination,
  //         setMatchingFromDestinations,
  //         setIsFromDropdownOpen,
  //         setIsFromSearchOpen
  //       );
  //       setSelectedFromItemIndex(-1);
  //     }
  //   }, 1000);

  //   timerTo = setTimeout(() => {
  //     if (
  //       toDestination &&
  //       toDestination.length >= 3 &&
  //       redirectionRoute === ""
  //     ) {
  //       console.log(redirectionRoute);
  //       searchDestinations(
  //         toDestination,
  //         setMatchingToDestinations,
  //         setIsToDropdownOpen,
  //         setIsToSearchOpen
  //       );
  //       setSelectedToItemIndex(-1);
  //     }
  //   }, 1000);

  //   return () => {
  //     clearTimeout(timerFrom);
  //     clearTimeout(timerTo);
  //   };
  // }, [fromDestination, toDestination, redirectionRoute]);

  useEffect(() => {
    const handleKeyDownFrom = (e) => {
      if (
        e.key === "ArrowDown" &&
        selectedFromItemIndex < matchingFromDestinations.length - 1
      ) {
        setSelectedFromItemIndex(selectedFromItemIndex + 1);
      } else if (e.key === "ArrowUp" && selectedFromItemIndex > 0) {
        setSelectedFromItemIndex(selectedFromItemIndex - 1);
      } else if (e.key === "Enter" && selectedFromItemIndex >= 0) {
        handleSelectDestination(
          matchingFromDestinations[selectedFromItemIndex],
          "from"
        );
      } else if (e.key === "Tab") {
        // Close dropdown and clear input if no city is selected
        if (!fromCityCode) {
          setFromDestination("");
          setIsFromDropdownOpen(false);
        }
      }
    };

    const handleClickOutsideFrom = (e) => {
      if (
        fromDropdownRef.current &&
        !fromDropdownRef.current.contains(e.target)
      ) {
        setIsFromDropdownOpen(false);
      }
    };

    document.addEventListener("keydown", handleKeyDownFrom);
    document.addEventListener("click", handleClickOutsideFrom);

    return () => {
      document.removeEventListener("keydown", handleKeyDownFrom);
      document.removeEventListener("click", handleClickOutsideFrom);
    };
  }, [selectedFromItemIndex, matchingFromDestinations, fromCityCode]);

  useEffect(() => {
    const handleKeyDownTo = (e) => {
      if (
        e.key === "ArrowDown" &&
        selectedToItemIndex < matchingToDestinations.length - 1
      ) {
        setSelectedToItemIndex(selectedToItemIndex + 1);
      } else if (e.key === "ArrowUp" && selectedToItemIndex > 0) {
        setSelectedToItemIndex(selectedToItemIndex - 1);
      } else if (e.key === "Enter" && selectedToItemIndex >= 0) {
        handleSelectDestination(
          matchingToDestinations[selectedToItemIndex],
          "to"
        );
      } else if (e.key === "Tab") {
        // Close dropdown and clear input if no city is selected
        if (!toCityCode) {
          setToDestination("");
          setIsToDropdownOpen(false);
        }
      }
    };

    const handleClickOutsideTo = (e) => {
      if (toDropdownRef.current && !toDropdownRef.current.contains(e.target)) {
        setIsToDropdownOpen(false);
      }
    };

    document.addEventListener("keydown", handleKeyDownTo);
    document.addEventListener("click", handleClickOutsideTo);

    return () => {
      document.removeEventListener("keydown", handleKeyDownTo);
      document.removeEventListener("click", handleClickOutsideTo);
    };
  }, [selectedToItemIndex, matchingToDestinations, toCityCode]);

  // const handleSelectDestination = async (
  //   selectedDestination,
  //   destinationType,
  //   isNotMultiCity = true
  // ) => {
  //   const destinationText = `${selectedDestination?.cityname}(${selectedDestination?.citycode}), ${selectedDestination?.countryname}`;
  //   const url = "/flights/oneway/list";

  //   if (isNotMultiCity) {
  //     handleMultiCitySelectDestination(selectedDestination, destinationType, 0);
  //   }

  //   if (destinationType === "from") {
  //     setFromDestination(destinationText);
  //     // Assuming you have a corresponding state variable like selectedFromItemIndex
  //     setSelectedFromItemIndex(-1);
  //     setIsFromDropdownOpen(false);
  //     setFromCityCode(selectedDestination.citycode);
  //     setFromCity(selectedDestination.cityname);
  //   } else if (destinationType === "to") {
  //     setToDestination(destinationText);
  //     // Assuming you have a corresponding state variable like selectedToItemIndex
  //     setSelectedToItemIndex(-1);
  //     setIsToDropdownOpen(false);
  //     setToCityCode(selectedDestination.citycode);
  //     setToCity(selectedDestination.cityname);
  //   }

  //   setRedirectionRoute(url);
  //   setMatchingFromDestinations([]); // Clear matching destinations for "From"
  //   setMatchingToDestinations([]); // Clear matching destinations for "To"
  // };

  // const handleSelectDestination = (field, value) => {
  //   if (!value) {
  //     if (field === "from") {
  //       setFromDestination(null);
  //       setFromCityCode("");
  //       setFromCity("");
  //     } else {
  //       setToDestination(null);
  //       setToCityCode("");
  //       setToCity("");
  //     }
  //     setRedirectionRoute("");
  //     return;
  //   }

  //   if (field === "from" && toDestination && value.value === toDestination.value) {
  //     showToast("error", "Departure and arrival locations cannot be the same");
  //     return;
  //   }
  //   if (field === "to" && fromDestination && value.value === fromDestination.value) {
  //     showToast("error", "Departure and arrival locations cannot be the same");
  //     return;
  //   }

  //   if (field === "from") {
  //     setFromDestination(value);
  //     setFromCityCode(value.airportCode || "");
  //     setFromCity(value.label);
  //     setIsFromDropdownOpen(false);
  //     setIsFromSearchOpen(false);
  //     setSelectedFromItemIndex(-1);
  //     logEvent(analytics, "from_destination_selected", { fromCityname: value.label });
  //   } else {
  //     setToDestination(value);
  //     setToCityCode(value.airportCode || "");
  //     setToCity(value.label);
  //     setIsToDropdownOpen(false);
  //     setIsToSearchOpen(false);
  //     setSelectedToItemIndex(-1);
  //     logEvent(analytics, "to_destination_selected", { toCityname: value.label });
  //   }
  //   setRedirectionRoute("");
  // };
  const compressDataAsync = (data) => {
    return new Promise((resolve) => {
      // Use setTimeout to avoid blocking the main thread
      setTimeout(() => {
        try {
          const compressed = pako.deflate(JSON.stringify(data));
          resolve(compressed);
        } catch (error) {
          console.error("Compression error:", error);
          resolve(pako.deflate(JSON.stringify(data))); // Fallback
        }
      }, 0);
    });
  };

  const encodeRequestAsync = (data) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        try {
          resolve(btoa(JSON.stringify(data)));
        } catch (error) {
          console.error("Encoding error:", error);
          resolve(btoa(JSON.stringify(data))); // Fallback
        }
      }, 0);
    });
  };

  // 2. PROGRESS MANAGER CLASS
  // =========================
  class SearchProgressManager {
    constructor(updateCallback) {
      this.updateCallback = updateCallback;
      this.progress = 0;
    }

    update(progress, message) {
      this.progress = Math.min(Math.max(progress, 0), 100);
      if (this.updateCallback) {
        this.updateCallback({
          loading: true,
          progress: this.progress,
          message: message || "Processing...",
        });
      }
    }

    complete() {
      this.update(100, "Complete!");
      setTimeout(() => {
        if (this.updateCallback) {
          this.updateCallback({
            loading: false,
            progress: 100,
            message: "Complete!",
          });
        }
      }, 300);
    }

    error() {
      if (this.updateCallback) {
        this.updateCallback({
          loading: false,
          progress: 0,
          message: "Error occurred",
        });
      }
    }
  }

  const search = async (data, updateFlights, setPageLoading) => {
    const progressManager = new SearchProgressManager(setPageLoading);
    let multiCitySegments = [];
    const isCorporateBooking = data.isCorporateBooking;
    let selectedTravelers;
    const moment = require("moment");
    progressManager.update(5, "Initializing search...");
    if (isCorporateBooking) {
      selectedTravelers = data.selectedTravelers || [];
      const totalAdults = data.adultsCount;
      if (selectedTravelers.length === 0) {
        showToast("info", "Please select travelers for your booking.");
        progressManager.error();
        return;
      }
      if (selectedTravelers.length < totalAdults) {
        showToast(
          "info",
          "The number of selected travelers cannot be less than the number of adults."
        );
        progressManager.error();
        return;
      }

      if (selectedTravelers.length > totalAdults) {
        showToast(
          "info",
          "The number of selected travelers cannot exceed the number of adults."
        );
        progressManager.error();
        return;
      }

      if (totalAdults > 9 || selectedTravelers.length > 9) {
        showToast(
          "info",
          "The total number of adults and selected travelers cannot exceed 9."
        );
        progressManager.error();
        return;
      }
    }

    if (data.journeyType === "1" || data.journeyType === "2") {
      if (!fromDestination) {
        showToast("info", "Please select 'From' destination");
        progressManager.error();
        return;
      }
      if (!toDestination) {
        showToast("info", "Please select 'To' destination");
        progressManager.error();
        return;
      }
      if (fromDestination === toDestination) {
        showToast(
          "info",
          "Please select different 'From' and 'To' destinations"
        );
        progressManager.error();
        return;
      }
      if (!fromCityCode) {
        showToast("info", "Please select 'From' destination from the dropdown");
        progressManager.error();
        return;
      }
      if (!toCityCode) {
        showToast("info", "Please select 'To' destination from the dropdown");
        progressManager.error();
        return;
      }
    } else if (data.journeyType === "3") {
      for (let i = 0; i < multiCityDestinations.length; i++) {
        const destination = multiCityDestinations[i];
        if (!destination.from) {
          showToast(
            "info",
            `Please select 'From' destinations for city pair ${i + 1}`
          );
          progressManager.error();
          return;
        }
        if (!destination.to) {
          showToast(
            "info",
            `Please select 'To' destinations for city pair ${i + 1}`
          );
          progressManager.error();
          return;
        }
        if (destination.from === destination.to) {
          showToast(
            "info",
            `Please select different 'From' and 'To' destinations for city pair ${
              i + 1
            }`
          );
          progressManager.error();
          return;
        }
        if (!destination?.fromCityCode) {
          showToast(
            "info",
            `Please select 'From' destination from the dropdown for city pair ${
              i + 1
            }`
          );
          progressManager.error();
          return;
        }
        if (!destination?.toCityCode) {
          showToast(
            "info",
            `Please select 'To' destination from the dropdown for city pair ${
              i + 1
            }`
          );
          progressManager.error();
          return;
        }

        const normalizeToMidnight = (date) => {
          // date can be Date object or ISO string — moment handles both
          return moment(date).format("YYYY-MM-DD") + "T00:00:00";
        };

        multiCitySegments.push({
          origin: destination.fromCityCode,
          destination: destination.toCityCode,
          flightCabinClass: data.selectedOptionCabinClass,
          preferredDepartureTime: normalizeToMidnight(
            destination.departureDate.toISOString()
          ),
          // preferredDepartureTime: moment(
          //   destination.departureDate.toISOString()
          // ).format("YYYY-MM-DDTHH:mm:ss"),
        });
      }
    }
    const totalPassengers = data.adultsCount + data.childCount;
    const maxAdults = 9;
    const maxChildren = 8;
    const maxInfants = 4;
    progressManager.update(10, "Preparing search parameters...");
    if (totalPassengers > maxAdults + maxChildren) {
      showToast(
        "info",
        "Total number of passengers (Adults + Children) should not exceed 9"
      );
      progressManager.error();
      return;
    }

    if (data.infantsCount > data.adultsCount) {
      showToast(
        "info",
        "Number of infants should not exceed the number of adults"
      );
      progressManager.error();
      return;
    }

    if (data.childCount > maxChildren) {
      showToast("info", `Maximum Child Selection is ${maxChildren}`);
      progressManager.error();
      return;
    }

    if (data.adultsCount > maxAdults) {
      showToast("info", `Maximum Adult Selection is ${maxAdults}`);
      progressManager.error();
      return;
    }

    if (data.infantsCount > maxInfants) {
      showToast("info", `Maximum Infant Selection is ${maxInfants}`);
      progressManager.error();
      return;
    }

    const storedUserIp = getTabSpecificData("userip");
    const userId = getTabSpecificData("userID");
    const FlightCabinClassText = data.FlightCabinClassText;

    const getCurrentUserCountryCode = () => {
      console.log("=== Getting current user country code in searchFlight ===");

      if (userDetails?.loggedInDetails?.userDetails?.countryCode) {
        console.log(
          "Found from userDetails.countryCode:",
          userDetails.loggedInDetails.userDetails.countryCode
        );
        return userDetails.loggedInDetails.userDetails.countryCode;
      }

      if (
        userDetails?.loggedInDetails?.userDetails?.countryDetails?.countryCode
      ) {
        console.log(
          "Found from countryDetails:",
          userDetails.loggedInDetails.userDetails.countryDetails.countryCode
        );
        return userDetails.loggedInDetails.userDetails.countryDetails
          .countryCode;
      }

      if (userDetails?.loggedInDetails?.companyDetails?.countryCode) {
        console.log(
          "Found from companyDetails:",
          userDetails.loggedInDetails.companyDetails.countryCode
        );
        return userDetails.loggedInDetails.companyDetails.countryCode;
      }

      if (typeof window !== "undefined") {
        try {
          const storedLocation = getTabSpecificData("userLocation");
          console.log("storedLocation:", storedLocation);

          if (
            storedLocation &&
            storedLocation !== "undefined" &&
            storedLocation !== "null"
          ) {
            const parsedLocation = JSON.parse(storedLocation);
            console.log("parsedLocation:", parsedLocation);

            if (parsedLocation?.country_code) {
              console.log(
                "Found from stored location:",
                parsedLocation.country_code
              );
              return parsedLocation.country_code;
            }
          }
        } catch (error) {
          console.error("Error parsing stored location:", error);
        }
      }

      console.log("No country code found, returning null");
      return null;
    };

    const calculateCurrentIsDomestic = () => {
      console.log("=== Calculating isDomestic segment-wise ===");
      const currentUserCountryCode = getCurrentUserCountryCode()?.toUpperCase();
      if (!currentUserCountryCode) {
        console.log("No user country code found, defaulting to false");
        return false;
      }

      const checkSegmentDomestic = (fromCode, toCode) => {
        if (!fromCode || !toCode) return false;
        const from = fromCode.toUpperCase();
        const to = toCode.toUpperCase();
        return from === currentUserCountryCode && to === currentUserCountryCode;
      };

      if (["1", "2"].includes(data.journeyType)) {
        const isDom = checkSegmentDomestic(
          fromDestination?.cityData?.countrycode,
          toDestination?.cityData?.countrycode
        );
        console.log("Single/Round-trip is domestic?", isDom);
        return isDom;
      }

      if (data.journeyType === "3" && Array.isArray(multiCityDestinations)) {
        return multiCityDestinations.map((seg, idx) => {
          const dom = checkSegmentDomestic(
            seg.from?.cityData?.countrycode,
            seg.to?.cityData?.countrycode
          );
          console.log(`Segment ${idx} domestic?`, dom);
          return dom;
        });
      }

      console.log("Flight type not recognized, defaulting to false");
      return false;
    };

    const currentIsDomestic = calculateCurrentIsDomestic();
    const currentFlightJourneyType = Array.isArray(currentIsDomestic)
      ? currentIsDomestic.map((isDom) => (isDom ? "domestic" : "international"))
      : currentIsDomestic
      ? "domestic"
      : "international";

    console.log("=== CURRENT VALUES IN SEARCH FLIGHT ===");
    console.log("currentIsDomestic:", currentIsDomestic);
    console.log("currentFlightJourneyType:", currentFlightJourneyType);
    console.log("=== END CURRENT VALUES ===");

    let payload;
    let redirectUrl;
    let flightResponse, flightRequest;
    if (
      data.journeyType === "1" ||
      (data.journeyType === "3" && multiCityDestinations.length === 1)
    ) {
      const updatedFromCityCode =
        data.journeyType === "1"
          ? fromCityCode
          : multiCityDestinations[0].fromCityCode;
      const updatedToCityCode =
        data.journeyType === "1"
          ? toCityCode
          : multiCityDestinations[0].toCityCode;
      const departureDate =
        data.journeyType === "1"
          ? data.departureDate
          : multiCityDestinations[0].departureDate;
      payload = {
        userType: "b2c",
        // userId: userId,
        searchReqData: {
          endUserIp: storedUserIp == "undefined" ? null : storedUserIp,
          adultCount: data.adultsCount.toString(),
          childCount: data.childCount.toString(),
          infantCount: data.infantsCount.toString(),
          directFlight: "false",
          oneStopFlight: "false",
          journeyType: "1",
          resultFareType: data.selectedResultFareType,
          preferredAirlines: null,
          segments: [
            {
              origin: updatedFromCityCode,
              destination: updatedToCityCode,
              flightCabinClass: data.selectedOptionCabinClass,
              preferredDepartureTime: moment(
                departureDate.toISOString()
              ).format("YYYY-MM-DDTHH:mm:ss"),
              // preferredArrivalTime: moment(data.returnDate.toISOString()).format('YYYY-MM-DDTHH:mm:ss'),
            },
          ],
          sources: null,
        },
      };
      const getTabName = (journeyType) => {
        switch (journeyType) {
          case "1":
            return "oneway";
          case "2":
            return "twoway";
          case "3":
            return "multicity";
          default:
            return "oneway";
        }
      };
      redirectUrl = `/bookings/flightlisting?activeTab=${getTabName(
        data.journeyType
      )}`;
      flightResponse = "flightResponse";
      flightRequest = "flightRequest";
    } else if (data.journeyType === "2") {
      payload = {
        userType: "b2c",
        // userId: userId,
        searchReqData: {
          endUserIp: storedUserIp == "undefined" ? null : storedUserIp,
          adultCount: data.adultsCount.toString(),
          childCount: data.childCount.toString(),
          infantCount: data.infantsCount.toString(),
          directFlight: "false",
          oneStopFlight: "false",
          journeyType: data.journeyType,
          resultFareType: data.selectedResultFareType,
          preferredAirlines: null,
          segments: [
            {
              origin: fromCityCode,
              destination: toCityCode,
              flightCabinClass: data.selectedOptionCabinClass,
              preferredDepartureTime: moment(
                data.departureDate.toISOString()
              ).format("YYYY-MM-DDTHH:mm:ss"),
              preferredArrivalTime: moment(
                data.returnDate.toISOString()
              ).format("YYYY-MM-DDTHH:mm:ss"),
            },
            {
              origin: toCityCode,
              destination: fromCityCode,
              flightCabinClass: data.selectedOptionCabinClass,
              preferredDepartureTime: moment(
                data.returnDate.toISOString()
              ).format("YYYY-MM-DDTHH:mm:ss"),
            },
          ],
          sources: null,
        },
      };
      const getTabName = (journeyType) => {
        switch (journeyType) {
          case "1":
            return "oneway";
          case "2":
            return "twoway";
          case "3":
            return "multicity";
          default:
            return "oneway";
        }
      };
      redirectUrl = `/bookings/flightlisting?activeTab=${getTabName(
        data.journeyType
      )}`;
      flightResponse = "twoWayFlightResponse";
      flightRequest = "twoWayFlightRequest";
    } else if (data.journeyType === "3") {
      payload = {
        userType: "b2c",
        // userId: userId,
        searchReqData: {
          endUserIp: storedUserIp == "undefined" ? null : storedUserIp,
          adultCount: data.adultsCount.toString(),
          childCount: data.childCount.toString(),
          infantCount: data.infantsCount.toString(),
          directFlight: "false",
          oneStopFlight: "false",
          journeyType: data.journeyType,
          resultFareType: data.selectedResultFareType,
          preferredAirlines: null,
          segments: multiCitySegments,
          sources: null,
        },
      };
      console.log("Multi-city payload:", payload);
      const getTabName = (journeyType) => {
        switch (journeyType) {
          case "1":
            return "oneway";
          case "2":
            return "twoway";
          case "3":
            return "multicity";
          default:
            return "oneway";
        }
      };
      redirectUrl = `/bookings/flightlisting?activeTab=${getTabName(
        data.journeyType
      )}`;
      flightResponse = "multiCityFlightResponse";
      flightRequest = "multiCityFlightRequest";
    }

    setLoading(true);

    progressManager.update(20, "Contacting flight providers...");

    try {
      const { data } = await axios.post(`${config.FLIGHTS_SEARCH}`, payload);
      const response = data?.data;
      const request = payload;
      const journeyType = request.searchReqData.journeyType;
      const qTraceId = response?.qTraceId;
      if (qTraceId) {
        progressManager.update(70, "Preparing flight results...");
        console.log("response", response);
        console.log("search response length", response.flightsResults.length);
        if (
          journeyType === "1" ||
          journeyType === "2" ||
          (journeyType === "3" && multiCityDestinations.length === 1)
        ) {
          const updatedFromCity =
            journeyType !== "3" ? fromCity : multiCityDestinations[0].fromCity;
          const updatedToCity =
            journeyType !== "3" ? toCity : multiCityDestinations[0].toCity;
          const updatedFromDestination =
            journeyType !== "3"
              ? fromDestination
              : multiCityDestinations[0].from;
          const updatedToDestination =
            journeyType !== "3" ? toDestination : multiCityDestinations[0].to;
          request.fromCity = updatedFromCity;
          request.toCity = updatedToCity;
          request.selectedFromCity = updatedFromDestination;
          request.selectedToCity = updatedToDestination;
          if (journeyType === "3") {
            request.multiCityDestinations = multiCityDestinations;
          }
        } else if (journeyType === "3") {
          request.multiCityDestinations = multiCityDestinations;
        }
        request.FlightCabinClassText = FlightCabinClassText;
        if (isCorporateBooking) {
          request.corporateEmployees = selectedTravelers;
        }
        // const encodedResponse = btoa(JSON.stringify(response));
        // const encodedRequest = btoa(JSON.stringify(request));

        // const Uint8Array = new TextEncoder().encode(JSON.stringify(response));
        // const encodedData = btoa(compressedData);
        // response.flightJourney = flightJourneyType;
        // response.isDomestic = isDomesticFlight;
        response.flightJourney =
          response.flightsResults.length === 1 ? "international" : "domestic";
        response.flightJourneyType = currentFlightJourneyType;
        response.isDomestic = currentIsDomestic;
        progressManager.update(80, "Compressing flight data...");
        const compressedData = pako.deflate(JSON.stringify(response));
        const encodedRequest = btoa(JSON.stringify(request));
        setTabSpecificData("flightResponse", compressedData);
        setTabSpecificData("flightRequest", encodedRequest);
        progressManager.update(90, "Finalizing results...");
        if (journeyType === "2" && response.flightsResults.length === 1) {
          try {
            const firstFlights = response.flightsResults[0];
            const firstFlightSegmentRefId =
              firstFlights?.flights?.[0]?.segments?.[0]?.flightSegmentRefId;
            await fetchFlightsWithRefId(
              response,
              firstFlightSegmentRefId,
              journeyType
            );
          } catch (error) {
            console.error("Error processing return flights:", error);
          }
        } else if (journeyType === "3") {
          progressManager.update(65, "Processing multi-city segments...");
          try {
            let multicityFlights = [response];
            let segmentRef = "";
            for (let i = 1; i < request?.multiCityDestinations?.length; i++) {
              progressManager.update(
                65 + (i * 15) / request.multiCityDestinations.length,
                `Processing segment ${i + 1} of ${
                  request.multiCityDestinations.length
                }...`
              );
              segmentRef +=
                multicityFlights[i - 1]?.flightsResults[0]?.flights?.[0]
                  ?.segments?.[0]?.flightSegmentRefId;
              try {
                const data = await fetchFlightsWithRefId(
                  response,
                  segmentRef,
                  journeyType
                );
                multicityFlights.push(data);
              } catch (error) {
                console.error(`Error fetching multicity segment ${i}:`, error);
                multicityFlights.push({
                  flightsResults: [],
                  error: `Failed to load segment ${i + 1}`,
                  qTraceId: response.qTraceId,
                });
              }
            }
            progressManager.update(80, "Compressing multi-city data...");
            const compressedData = pako.deflate(
              JSON.stringify(multicityFlights)
            );
            setTabSpecificData("multicityFlights", compressedData);
            console.log("multicityFlights ", multicityFlights);
          } catch (error) {
            console.error("Error processing multicity flights:", error);
          }
        }
        const selectedFlightSection = getTabSpecificData(
          "selectedFlightSection"
        );
        if (selectedFlightSection) {
          removeTabSpecificData("selectedFlightSection");
        }
        progressManager.update(95, "Redirecting...");
        const updatedUrl = `${redirectUrl}`;
        await router.push(updatedUrl);
        if (updateFlights) {
          updateFlights({ success: true });
        }
        progressManager.complete();
      }
    } catch (error) {
      console.log(error);
      let errorMessage =
        error?.response?.data?.error?.errorMessage ||
        "There are no flights on this sector, please try again!";
      // toast(error?.response?.data?.error?.errorMessage);

      // a changes commented below
      // switch (errorMessage) {
      //   case "Specific error message 1":
      //     toast("Error message 1");
      //     break;
      //   case "Specific error message 2":
      //     toast("Error message 2");
      //     break;
      //   case "Another specific error message":
      //     toast("Another specific error message");
      //     break;
      //   default:
      //     toast("Default error message"); // Display a default error message if no specific match found
      //     break;
      // }
      if (
        error?.response?.data?.error?.errorMessage?.[0]?.data ===
        "Session timeout!!"
        // ||
        //   error?.response?.data?.error?.errorMessage?.[0]?.data === "Fare Quote failed from the Supplier end. Please try again."
      ) {
        errorMessage =
          "Oops! Your session has expired. Please search Flights again.";
        router.push("/"); // Redirect to a specific page
      } else if (
        error?.response?.data?.error?.errorMessage?.[0]?.data ===
        "Fare Quote failed from the Supplier end. Please try again."
      ) {
        errorMessage = "Something went wrong, please select different flight";
        router.push(
          `/bookings/flightlisting?activeTab=${getTabName(data.journeyType)}`
        );
      } else if (
        error?.response?.data?.error?.errorMessage ===
        'The "PreferredDepartureTime" must be greater than or equal to today.'
      ) {
        errorMessage =
          "The Departure date must be greater than or equal to today ";
        // router.push("/flights/oneway/list");
      } else if (
        error?.response?.data?.error?.errorMessage === "No result Found"
      ) {
        errorMessage = "No Flights found";
        // router.push("/flights/oneway/list");
      } else if (
        error?.response?.data?.error?.errorMessage ===
        "You are not authorized to access TBO-API"
      ) {
        errorMessage = "No Flights found";
        // router.push("/flights/oneway/list");
      } else if (error?.response?.data?.error?.errorCode === "303") {
        errorMessage = "Please try after sometime";
        // router.push("/flights/oneway/list");
      }
      showToast("error", errorMessage);
      // toast(" Please search Flights again");

      const request = payload;
      if (
        data.journeyType === "1" ||
        data.journeyType === "2" ||
        (data.journeyType === "3" && multiCityDestinations.length === 1)
      ) {
        const updatedFromCity =
          data.journeyType !== "3"
            ? fromCity
            : multiCityDestinations[0].fromCity;
        const updatedToCity =
          data.journeyType !== "3" ? toCity : multiCityDestinations[0].toCity;
        const updatedFromDestination =
          data.journeyType !== "3"
            ? fromDestination
            : multiCityDestinations[0].from;
        const updatedToDestination =
          data.journeyType !== "3"
            ? toDestination
            : multiCityDestinations[0].to;
        request.fromCity = updatedFromCity;
        request.toCity = updatedToCity;
        request.selectedFromCity = updatedFromDestination;
        request.selectedToCity = updatedToDestination;
      } else if (data.journeyType === "3") {
        request.multiCityDestinations = multiCityDestinations;
      }
      if (isCorporateBooking) {
        request.corporateEmployees = selectedTravelers;
      }
      request.FlightCabinClassText = FlightCabinClassText;
      const encodedRequest = btoa(JSON.stringify(request));
      setTabSpecificData("flightRequest", encodedRequest);
      if (updateFlights) {
        updateFlights({
          success: false,
          error: errorMessage,
        });
      }
      if (errorMessage === "No Flights found") {
        if (router.asPath === "/bookings/flightlisting") {
          await router.push(
            `/bookings/flightlisting?activeTab=${getTabName(
              data.journeyType
            )}?noResults=true`
          );
        }
      }
      progressManager.error();
    } finally {
      setLoading(false);
      if (setPageLoading) {
        setTimeout(() => {
          setPageLoading({
            loading: false,
            progress: 100,
            message: "Complete!",
          });
        }, 500);
      }
    }
  };
  //corporate search
  const searchFlight = async (data, updateFlights, setPageLoading) => {
    let multiCitySegments = [];
    let accessToken = getTabSpecificData("accessToken");
    let selectedTravelers;
    const moment = require("moment");
    if (!accessToken) {
      openPopup();
      return;
    }
    selectedTravelers =
      (data?.selectedTravelers.length > 0
        ? data?.selectedTravelers
        : travelersByCategory[TRAVEL_CATEGORIES.FLIGHTS]) || [];

    const totalAdults = adultsCount;

    if (selectedTravelers.length === 0) {
      showToast("info", "Please select travelers for your booking.");
      return;
    }

    if (selectedTravelers.length < totalAdults) {
      showToast(
        "info",
        "The number of selected travelers cannot be less than the number of adults."
      );
      return;
    }

    if (selectedTravelers.length > totalAdults) {
      showToast(
        "info",
        "The number of selected travelers cannot exceed the number of adults."
      );
      return;
    }

    if (data.journeyType === "1" || data.journeyType === "2") {
      if (!fromDestination) {
        showToast("info", "Please select 'From' destination");
        return;
      }
      if (!toDestination) {
        showToast("info", "Please select 'To' destination");
        return;
      }
      if (fromDestination === toDestination) {
        showToast(
          "info",
          "Please select different 'From' and 'To' destinations"
        );
        return;
      }
      if (!fromCityCode) {
        showToast("info", "Please select 'From' destination from the dropdown");
        return;
      }
      if (!toCityCode) {
        showToast("info", "Please select 'To' destination from the dropdown");
        return;
      }
    }
    const totalPassengers = totalAdults;
    const maxAdults = 9;
    if (totalPassengers > maxAdults) {
      showToast("info", `Maximum Adult Selection is ${maxAdults}`);
      return;
    }

    const storedUserIp = getTabSpecificData("userip");
    const userId = getTabSpecificData("userID");
    const FlightCabinClassText = data.FlightCabinClassText;

    const getCurrentUserCountryCode = () => {
      console.log("=== Getting current user country code in searchFlight ===");

      // Method 1: From userDetails (multiple paths)
      if (userDetails?.loggedInDetails?.userDetails?.countryCode) {
        console.log(
          "Found from userDetails.countryCode:",
          userDetails.loggedInDetails.userDetails.countryCode
        );
        return userDetails.loggedInDetails.userDetails.countryCode;
      }

      if (
        userDetails?.loggedInDetails?.userDetails?.countryDetails?.countryCode
      ) {
        console.log(
          "Found from countryDetails:",
          userDetails.loggedInDetails.userDetails.countryDetails.countryCode
        );
        return userDetails.loggedInDetails.userDetails.countryDetails
          .countryCode;
      }

      if (userDetails?.loggedInDetails?.companyDetails?.countryCode) {
        console.log(
          "Found from companyDetails:",
          userDetails.loggedInDetails.companyDetails.countryCode
        );
        return userDetails.loggedInDetails.companyDetails.countryCode;
      }

      // Method 2: From stored location
      if (typeof window !== "undefined") {
        try {
          const storedLocation = getTabSpecificData("userLocation");
          console.log("storedLocation:", storedLocation);

          if (
            storedLocation &&
            storedLocation !== "undefined" &&
            storedLocation !== "null"
          ) {
            const parsedLocation = JSON.parse(storedLocation);
            console.log("parsedLocation:", parsedLocation);

            if (parsedLocation?.country_code) {
              console.log(
                "Found from stored location:",
                parsedLocation.country_code
              );
              return parsedLocation.country_code;
            }
          }
        } catch (error) {
          console.error("Error parsing stored location:", error);
        }
      }

      console.log("No country code found, returning null");
      return null;
    };

    const calculateCurrentIsDomestic = () => {
      console.log("=== Calculating isDomestic segment-wise ===");
      const currentUserCountryCode = getCurrentUserCountryCode()?.toUpperCase();
      if (!currentUserCountryCode) {
        console.log("No user country code found, defaulting to false");
        return false; // Return false for single/round-trip, empty array for multi-city
      }

      const checkSegmentDomestic = (fromCode, toCode) => {
        if (!fromCode || !toCode) return false;
        const from = fromCode.toUpperCase();
        const to = toCode.toUpperCase();
        return from === currentUserCountryCode && to === currentUserCountryCode;
      };

      // Single or round-trip (journeyType 1 or 2)
      if (["1", "2"].includes(data.journeyType)) {
        const isDom = checkSegmentDomestic(
          fromDestination?.cityData?.countrycode,
          toDestination?.cityData?.countrycode
        );
        console.log("Single/Round-trip is domestic?", isDom);
        return isDom;
      }

      // Multi-city routes
      if (data.journeyType === "3" && Array.isArray(multiCityDestinations)) {
        return multiCityDestinations.map((seg, idx) => {
          const dom = checkSegmentDomestic(
            seg.from?.cityData?.countrycode,
            seg.to?.cityData?.countrycode
          );
          console.log(`Segment ${idx} domestic?`, dom);
          return dom;
        });
      }

      console.log("Flight type not recognized, defaulting to false");
      return false;
    };

    // Calculate isDomestic (boolean for journeyType 1/2, array for journeyType 3)
    const currentIsDomestic = calculateCurrentIsDomestic();

    // Determine flightJourneyType (string for journeyType 1/2, array for journeyType 3)
    const currentFlightJourneyType = Array.isArray(currentIsDomestic)
      ? currentIsDomestic.map((isDom) => (isDom ? "domestic" : "international"))
      : currentIsDomestic
      ? "domestic"
      : "international";

    console.log("=== CURRENT VALUES IN SEARCH FLIGHT ===");
    console.log("currentIsDomestic:", currentIsDomestic);
    console.log("currentFlightJourneyType:", currentFlightJourneyType);
    console.log("=== END CURRENT VALUES ===");
    let payload;
    let redirectUrl;
    let flightResponse, flightRequest;
    const updatedFromCityCode =
      data.journeyType === "1"
        ? fromCityCode
        : multiCityDestinations[0].fromCityCode;
    const updatedToCityCode =
      data.journeyType === "1"
        ? toCityCode
        : multiCityDestinations[0].toCityCode;
    const departureDate =
      data.journeyType === "1"
        ? data.departureDate
        : multiCityDestinations[0].departureDate;
    let segments;
    if (data.journeyType === "1") {
      segments = [
        {
          origin: updatedFromCityCode,
          destination: updatedToCityCode,
          flightCabinClass: data.selectedOptionCabinClass,
          preferredDepartureTime: moment(departureDate.toISOString()).format(
            "YYYY-MM-DDTHH:mm:ss"
          ),
          // preferredArrivalTime: moment(data.returnDate.toISOString()).format('YYYY-MM-DDTHH:mm:ss'),
        },
      ];
    } else if (data.journeyType === "2") {
      segments = [
        {
          origin: fromCityCode,
          destination: toCityCode,
          flightCabinClass: data.selectedOptionCabinClass,
          preferredDepartureTime: moment(
            data.departureDate.toISOString()
          ).format("YYYY-MM-DDTHH:mm:ss"),
          preferredArrivalTime: moment(data.returnDate.toISOString()).format(
            "YYYY-MM-DDTHH:mm:ss"
          ),
        },
        {
          origin: toCityCode,
          destination: fromCityCode,
          flightCabinClass: data.selectedOptionCabinClass,
          preferredDepartureTime: moment(data.returnDate.toISOString()).format(
            "YYYY-MM-DDTHH:mm:ss"
          ),
        },
      ];
    } else {
      let multiCitySegments = [];
      for (let i = 0; i < multiCityDestinations.length; i++) {
        const destination = multiCityDestinations[i];
        if (!destination.from) {
          showToast(
            "info",
            `Please select 'From' destinations for city pair ${i + 1}`
          );
          return;
        }
        if (!destination.to) {
          showToast(
            "info",
            `Please select 'To' destinations for city pair ${i + 1}`
          );
          return;
        }
        if (destination.from === destination.to) {
          showToast(
            "info",
            `Please select different 'From' and 'To' destinations for city pair ${
              i + 1
            }`
          );
          return;
        }
        if (!destination?.fromCityCode) {
          showToast(
            "info",
            `Please select 'From' destination from the dropdown for city pair ${
              i + 1
            }`
          );
          return;
        }
        if (!destination?.toCityCode) {
          showToast(
            "info",
            `Please select 'To' destination from the dropdown for city pair ${
              i + 1
            }`
          );
          return;
        }
        multiCitySegments.push({
          origin: destination.fromCityCode,
          destination: destination.toCityCode,
          flightCabinClass: data.selectedOptionCabinClass,
          preferredDepartureTime: moment(
            destination.departureDate.toISOString()
          )
            .set({ hour: 0, minute: 0, second: 0 })
            .format("YYYY-MM-DDTHH:mm:ss"),
        });
      }
      segments = multiCitySegments;
    }
    payload = {
      userType: "b2b",
      // userId: userId,
      searchReqData: {
        endUserIp: storedUserIp == "undefined" ? null : storedUserIp,
        adultCount: totalAdults.toString(),
        childCount: "0",
        infantCount: "0",
        directFlight: "false",
        oneStopFlight: "false",
        journeyType: data.journeyType,
        resultFareType: "2",
        preferredAirlines: null,
        segments: segments,
        sources: null,
      },
    };
    // Determine the tab name based on journeyType
    const getTabName = (journeyType) => {
      switch (journeyType) {
        case "1":
          return "oneway";
        case "2":
          return "twoway";
        case "3":
          return "multicity";
        default:
          return "oneway";
      }
    };
    redirectUrl = `/corporate/auth/booking/flights/flightListing?activeTab=${getTabName(
      data.journeyType
    )}`;
    flightResponse = "flightResponse";
    flightRequest = "flightRequest";

    setLoading(true);
    console.log("redirectUrl", redirectUrl);
    if (setPageLoading) {
      setPageLoading(true);
    }
    try {
      const { data } = await axios.post(`${config.FLIGHTS_SEARCH}`, payload);
      let response = data?.data;
      const request = payload;
      const journeyType = request.searchReqData.journeyType;
      const qTraceId = response?.qTraceId;
      if (qTraceId) {
        if (
          journeyType === "1" ||
          journeyType === "2" ||
          (journeyType === "3" && multiCityDestinations.length === 1)
        ) {
          const updatedFromCity =
            journeyType !== "3" ? fromCity : multiCityDestinations[0].fromCity;
          const updatedToCity =
            journeyType !== "3" ? toCity : multiCityDestinations[0].toCity;

          const updatedFromDestination =
            journeyType !== "3"
              ? fromDestination
              : multiCityDestinations[0].from;
          const updatedToDestination =
            journeyType !== "3" ? toDestination : multiCityDestinations[0].to;

          request.fromCity = updatedFromCity;
          request.toCity = updatedToCity;
          request.selectedFromCity = updatedFromDestination;
          request.selectedToCity = updatedToDestination;
          if (journeyType === "3") {
            request.multiCityDestinations = multiCityDestinations;
          }
        } else if (journeyType === "3") {
          request.multiCityDestinations = multiCityDestinations;
        }
        request.FlightCabinClassText = FlightCabinClassText;
        // if (isCorporateBooking) {
        request.corporateEmployees = selectedTravelers;
        // }
        // const encodedResponse = btoa(JSON.stringify(response));
        // const encodedRequest = btoa(JSON.stringify(request));

        // const Uint8Array = new TextEncoder().encode(JSON.stringify(response));
        // const encodedData = btoa(compressedData);
        // response.flightJourney =
        //   response.flightsResults.length === 1 ? "international" : "domestic";
        response.flightJourney = currentFlightJourneyType;
        response.isDomestic = currentIsDomestic;

        const compressedData = pako.deflate(JSON.stringify(response));
        const encodedRequest = btoa(JSON.stringify(request));
        setTabSpecificData(flightResponse, compressedData);
        setTabSpecificData("flightRequest", encodedRequest);
        if (journeyType === "2" && response.flightsResults.length === 1) {
          const firstFlights = response.flightsResults[0];
          const firstFlightSegmentRefId =
            firstFlights?.flights?.[0]?.segments?.[0]?.flightSegmentRefId;
          await fetchFlightsWithRefId(
            response,
            firstFlightSegmentRefId,
            journeyType
          );
        } else if (journeyType === "3") {
          let multicityFlights = [response];
          let segmentRef = "";
          for (let i = 1; i < request?.multiCityDestinations?.length; i++) {
            segmentRef +=
              multicityFlights[i - 1]?.flightsResults[0]?.flights?.[0]
                ?.segments?.[0]?.flightSegmentRefId;
            const data = await fetchFlightsWithRefId(
              response,
              segmentRef,
              journeyType
            );
            multicityFlights.push(data);
          }
          const compressedData = pako.deflate(JSON.stringify(multicityFlights));
          setTabSpecificData("multicityFlights", compressedData);
          console.log("multicityFlights ", multicityFlights);
        }
        const selectedFlightSection = getTabSpecificData(
          "selectedFlightSection"
        );
        if (selectedFlightSection) {
          removeTabSpecificData("selectedFlightSection");
        }
        const updatedUrl = `${redirectUrl}`;

        await router.push(updatedUrl);
        if (updateFlights) {
          updateFlights();
        }
      }
    } catch (error) {
      console.error("error ", error);
      let errorMessage =
        error?.response?.data?.error?.errorMessage ||
        "There are no flights on this sector, please try again!";
      if (
        error?.response?.data?.error?.errorMessage?.[0]?.data ===
        "Session timeout!!"
        // ||
        //   error?.response?.data?.error?.errorMessage?.[0]?.data === "Fare Quote failed from the Supplier end. Please try again."
      ) {
        errorMessage =
          "Oops! Your session has expired. Please search Flights again.";
        const shouldRedirectHome = window.location.pathname === redirectUrl;
        setTimeout(() => {
          router.push(shouldRedirectHome ? redirectUrl : "/");
        }, 2000); // Redirect to a specific page
      } else if (
        error?.response?.data?.error?.errorMessage?.[0]?.data ===
        "Fare Quote failed from the Supplier end. Please try again."
      ) {
        errorMessage = "Something went wrong, please select different flight";
        // router.push("/flights/oneway/list");
      } else if (
        error?.response?.data?.error?.errorMessage ===
        'The "PreferredDepartureTime" must be greater than or equal to today.'
      ) {
        errorMessage =
          "The Departure date must be greater than or equal to today ";
        // router.push("/flights/oneway/list");
      } else if (
        error?.response?.data?.error?.errorMessage === "No result Found"
      ) {
        errorMessage = "No Flights found";
        // router.push("/flights/oneway/list");
      } else if (
        error?.response?.data?.error?.errorMessage ===
        "You are not authorized to access TBO-API"
      ) {
        errorMessage = "No Flights found";
        // router.push("/flights/oneway/list");
      } else if (error?.response?.data?.error?.errorCode === "303") {
        errorMessage = "Please try after sometime";
        // router.push("/flights/oneway/list");
      }
      showToast("error", errorMessage);
      // toast(" Please search Flights again");
      const listingPage =
        data.journeyType === "1"
          ? "oneway"
          : data.journeyType === "2"
          ? "twoway"
          : "multicity";
      const request = payload;
      if (
        data.journeyType === "1" ||
        data.journeyType === "2" ||
        (data.journeyType === "3" && multiCityDestinations.length === 1)
      ) {
        const updatedFromCity =
          data.journeyType !== "3"
            ? fromCity
            : multiCityDestinations[0].fromCity;
        const updatedToCity =
          data.journeyType !== "3" ? toCity : multiCityDestinations[0].toCity;
        const updatedFromDestination =
          data.journeyType !== "3"
            ? fromDestination
            : multiCityDestinations[0].from;
        const updatedToDestination =
          data.journeyType !== "3"
            ? toDestination
            : multiCityDestinations[0].to;
        request.fromCity = updatedFromCity;
        request.toCity = updatedToCity;
        request.selectedFromCity = updatedFromDestination;
        request.selectedToCity = updatedToDestination;
      } else if (data.journeyType === "3") {
        request.multiCityDestinations = multiCityDestinations;
      }
      request.corporateEmployees = selectedTravelers;
      request.FlightCabinClassText = FlightCabinClassText;
      const encodedRequest = btoa(JSON.stringify(request));
      setTabSpecificData(flightRequest, encodedRequest);
      if (updateFlights) {
        updateFlights();
      }
      if (errorMessage === "No Flights found") {
        if (router.asPath === "/corporate/auth/booking/flights/flightListing") {
          await router.push(
            `/corporate/auth/booking/flights/flightListing?noResults=true`
          );
        }
      }
    } finally {
      setLoading(false);
      if (setPageLoading) {
        setPageLoading(false);
      }
    }
  };

  const fetchFlightsWithRefId = async (
    response,
    flightSegmentsRefId,
    journeyType
  ) => {
    try {
      const resp = await axios.get(`${config.FLIGHTS_INBOUND_DATA}`, {
        params: {
          qTraceId: response.qTraceId,
          flightSegmentRefId: flightSegmentsRefId,
        },
      });
      const data = resp.data;
      if (journeyType === "2") {
        if (response.flightsResults.length > 1) {
          response.flightsResults[1] = data.data;
        } else {
          response.flightsResults.push(data.data);
        }

        const compressedData = pako.deflate(JSON.stringify(response));
        setTabSpecificData("flightResponse", compressedData);
        return response;
      } else {
        let updatedResponse = {
          ...response,
          flightsResults: [data.data],
        };
        return updatedResponse;
      }
    } catch (error) {
      console.log(error);
    }
  };

  return {
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
    fromDestination,
    toDestination,
    matchingFromDestinations,
    matchingToDestinations,
    selectedFromItemIndex,
    selectedToItemIndex,
    // ayush's change for arrow nav in desk
    setSelectedFromItemIndex,
    setSelectedToItemIndex,
    fetchFlightsWithRefId,
    // ends
    isFromDropdownOpen,
    isToDropdownOpen,
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
    // multiCity
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
    searchFlight,
    fetchFlightsWithRefId,
    defaultCityOptions,
    setDefaultCityOptions,
    searchDestinations,
    searchMultiCityDestinations,
    multiCityCityCode,
    setMultiCityCityCode,
    multiCityCity,
    setMultiCityCity,
    // isDomesticFlight,
    // flightJourneyType,
    // userHomeCountryCode,
    // fetchDefaultCities
    // ends
  };
};

export default useFlightsSearch;
