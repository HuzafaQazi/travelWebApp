import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import style from "./styles.module.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Header from "@/components/flights/B2cHeader/Header";
import {
  faArrowLeft,
  faBars,
  faChevronDown,
  faChevronLeft,
  faChevronRight,
  faRightLong,
  faSliders,
  faSpinner,
} from "@fortawesome/free-solid-svg-icons";
import FlightNavigation from "@/components/b2c/flights/flightNavigation/FlightNavigation";
import pako from "pako";
import OneWayList from "@/components/b2c/flights/onewaylist";
import Filters from "@/components/b2c/flights/filter";
import WhatsAppSideSheet from "@/components/b2c/flights/sideSheet";
import useFlightsSearch from "@/utils/b2c/flights/b2csearch";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  FLIGHT_BUDGET_INTERNATIONAL_ID,
  FLIGHT_BUDGET_DOMESTIC_ID,
} from "@/utils/constants";
import useLocalStorage from "@/hooks/useLocalStorage";
import axios, {
  getTabSpecificData,
  removeTabSpecificData,
  setTabSpecificData,
} from "@/utils/axios/axios";
import config from "@/config";
import { useRouter } from "next/router";
import Footer2 from "@/components/footer/footer";
import { faWhatsapp } from "@fortawesome/free-brands-svg-icons";
import FlightListingSkeleton from "@/components/corporate/Loaders/Flight/FlightListingSkeleton";
import NoFlights from "@/components/corporate/booking/flights/noFlights";
import { WHATSAPP_SHARE_LIMIT } from "@/utils/constants";
import Head from "next/head";
import { useLogin } from "@/store/context/LoginContext";
import showToast from "@/utils/toast";
import FilterNoResultsMessage from "@/components/corporate/booking/flights/FilterNoResultsMessage";
import FlightSearchErrorMessage from "@/components/corporate/booking/flights/FlightSearchError";
import GoToTopButton from "@/components/gototopbutton/gototopbutton";
export default function FlightListing() {
  const { fetchFlightsWithRefId } = useFlightsSearch();

  const apiCallTracker = useRef(new Set());
  const { openFlightPricePopup } = useLogin();
    const footerRef = useRef(null);
  const [isFooterNear, setIsFooterNear] = useState(false);
  const [rotatedIcons, setRotatedIcons] = useState([[], []]);
  const [flightsResponse, setFlightsResponse] = useState();
  const [decodedResponse, setDecodedResponse] = useState();
  const [flightsRequest, setFlightsRequest] = useState([]);
  const [multicityFlightsResponse, setMulticityFlightsResponse] = useState([]);
  const [multicityResponse, setMulticityResponse] = useState([]);
  const [activeSegment, setActiveSegment] = useState(0);
  const [filterData, setFilterData] = useState([]);
  const [selectedFilterIndex, setSelectedFilterIndex] = useState();
  const [isDropdownVisible, setIsDropdownVisible] = useState(false);
  const dropdownRef = useRef(null);
  const modalRef = useRef(null); // Ref for the modal
  const [flightsSelected, setflightsSelected] = useState([]);
  const [totalAmount, setTotalAmount] = useState();
  const [multicityLoading, setMulticityLoading] = useState(false);
  const [loaderIndex, setLoaderIndex] = useState();
  const [selectedDesktopFilters, setSelectedDesktopFilters] = useState([
    [
      {
        stops: [],
        airlines: [],
        layovers: [],
        destinations: [],
        arrivals: [],
        price: {},
        cabinClasses: [],
        carrier: [],
        refund: {},
        departureTime: [],
        arrivalTime: [],
        duration: {},
      },
    ],
  ]);
  const [isOpen, setIsOpen] = useState(false);
  const [sortingCriteria, setSortingCriteria] = useState();
  const [isOpenSideSheet, setIsOpenSideSheet] = useState(false);
  const [shareData, setShareData] = useState([]);
  const [searchBtnLoader, setSearchBtnLoader] = useState(false);
  const router = useRouter();
  const [proceedBtnLoader, setProceedBtnLoader] = useState(false);
  const scrollRef = useRef(null);
  const [showScrollButtons, setShowScrollButtons] = useState(false);
  const { noResults } = router.query;
  const [isBookingLoading, setIsBookingLoading] = useState(false);
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("departure");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isSearchFailed, setIsSearchFailed] = useState(false);
  const [hasValidData, setHasValidData] = useState(true);
  const [dataError, setDataError] = useState(null);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [searchError, setSearchError] = useState(null);
  const [showTooltip, setShowTooltip] = useState(false);
  const [showLayoverTooltip, setShowLayoverTooltip] = useState(false);

  const [segmentSelectedIndices, setSegmentSelectedIndices] = useState({
    0: 0, // First segment (departure)
    1: 0, // Second segment (return)
  });

  const [viewPriceFlightIndexes, setViewPriceFlightIndexes] = useState({
    0: null, // For departure segment
    1: null, // For return segment
    // Add more segments for multicity if needed
  });



  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsFooterNear(entry.isIntersecting);
      },
         {
      root: null,
      rootMargin: "250px 0px 0px 0px", // ✅ Trigger 200px BEFORE footer enters viewport
      threshold: 0,
    },
    );

      const currentRef = footerRef.current;
  if (currentRef) observer.observe(currentRef);

  return () => {
    if (currentRef) observer.unobserve(currentRef); // ✅ Cleaner cleanup
  };
  }, []);

  //   const navRef = useRef(null);
  // const [navHeight, setNavHeight] = useState(0);

  // useEffect(() => {
  //   const updateHeight = () => {
  //     if (navRef.current) {
  //       setNavHeight(navRef.current.offsetHeight);
  //     }
  //   };

  //   updateHeight();

  //   // update on resize too
  //   window.addEventListener("resize", updateHeight);

  //   return () => window.removeEventListener("resize", updateHeight);
  // }, [isDropdownVisible]);

  const desktopNavRef = useRef(null);
  const mobileNavRef = useRef(null);

  const [stickyTop, setStickyTop] = useState(0);

  useEffect(() => {
    const updateHeight = () => {
      const desktopHeight = desktopNavRef.current?.offsetHeight || 0;
      const mobileHeight = mobileNavRef.current?.offsetHeight || 0;

      // whichever is visible
      setStickyTop(desktopHeight || mobileHeight);
    };

    updateHeight();

    const observer = new ResizeObserver(updateHeight);

    if (desktopNavRef.current) observer.observe(desktopNavRef.current);
    if (mobileNavRef.current) observer.observe(mobileNavRef.current);

    window.addEventListener("resize", updateHeight);

    return () => {
      observer.disconnect();
      window.removeEventListener("resize", updateHeight);
    };
  }, []);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };
  const handleViewPriceToggle = useCallback((wayindex, flightIndex) => {
    setViewPriceFlightIndexes((prev) => ({
      ...prev,
      [wayindex]: prev[wayindex] === flightIndex ? null : flightIndex,
    }));
  }, []);

  useEffect(() => {
    if (isOpenSideSheet) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "visible";
    }

    return () => {
      document.body.style.overflow = "visible";
    };
  }, [isOpenSideSheet]);

  useEffect(() => {
    if (isDropdownVisible) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "visible";
    }

    // Cleanup function to remove the class when the component unmounts
    return () => {
      document.body.style.overflow = "hidden";
    };
  }, [isDropdownVisible]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "visible";
    }

    // Cleanup function to remove the class when the component unmounts
    return () => {
      document.body.style.overflow = "hidden";
    };
  }, [isOpen]);

  useEffect(() => {
    if (isFiltersOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "visible";
    }

    // Cleanup function to remove the class when the component unmounts
    return () => {
      document.body.style.overflow = "hidden";
    };
  }, [isFiltersOpen]);
  // Function to toggle dropdown visibility
  const toggleDropdown = () => {
    setIsDropdownVisible(!isDropdownVisible);
  };

  const handleDropdownClick = () => {
    // Check if filters are open and close them if they are
    if (isFiltersOpen) {
      setIsFiltersOpen(false);
    } else if (isDropdownVisible) {
      toggleDropdown();
    }
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      // Check if the dropdown or modal is open
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target) && // Click outside dropdown
        modalRef.current &&
        !modalRef.current.contains(event.target) // Click outside modal
      ) {
        setIsDropdownVisible(false); // Close dropdown if clicked outside both
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const formatDuration = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;

    const hoursText = hours > 0 ? `${hours} hr` : "";
    const minutesText = remainingMinutes > 0 ? ` ${remainingMinutes} mins` : "";

    return `${hoursText}${minutesText}`;
  };

  const formatDate = (isoTimeString) => {
    const date = new Date(isoTimeString);

    const monthName = date.toLocaleString("default", { month: "short" });
    const day = date.getDate();
    return `${day} ${monthName.toUpperCase()}`;
  };

  const formatTime = (isoTimeString) => {
    const date = new Date(isoTimeString);
    const hours = date.getHours().toString().padStart(2, "0");
    const minutes = date.getMinutes().toString().padStart(2, "0");
    return `${hours}:${minutes}`;
  };

  const formatPrice = (price) => {
    if (!price && price !== 0) return "0"; // Handle undefined/null cases
    const priceStr = price.toString();
    const [integerPart, decimalPart] = priceStr.split(".");

    const lastThreeDigits = integerPart.slice(-3);
    const otherDigits = integerPart.slice(0, -3);

    const formattedIntegerPart =
      otherDigits.replace(/\B(?=(\d{2})+(?!\d))/g, ",") +
      (otherDigits.length > 0 ? "," : "") +
      lastThreeDigits;
    return decimalPart
      ? `${formattedIntegerPart}.${decimalPart}`
      : formattedIntegerPart;
  };

  const handleOpenSideSheet = () => {
    setIsOpenSideSheet(true);
  };

  const handleCloseSideSheet = () => {
    setIsOpenSideSheet(false);
  };

  const handleSelectButtonClick = async (
    flight,
    index,
    segmentIndex,
    wayindex,
  ) => {
    // Prevent double clicks
    if (isBookingLoading) return;

    let bookingStarted = false;
    try {
      // ONEWAY or (MULTI-CITY but only one selected so far)
      const journeyType = flightsRequest?.searchReqData?.journeyType;

      if (
        journeyType === "1" ||
        (journeyType === "3" && flightsSelected.length === 1)
      ) {
        // prepare SSR payload (endUserIp may be undefined)
        const storedUserIp = getTabSpecificData("userip");
        const ssrpayload = {
          qTraceId: flightsResponse.qTraceId,
          ssrReqModel: {
            endUserIp: storedUserIp === "undefined" ? null : storedUserIp,
            resultIndex: flight.resultIndex,
          },
        };

        // mark loading
        setIsBookingLoading(true);
        bookingStarted = true;

        // Concurrent calls: fareQuote + SSR (SSR is fire-and-forget in background)
        const fareQuotePromise = fetchGetQuote(
          flightsResponse.qTraceId,
          [flight.resultIndex],
          [flight.fare.offeredFareRoundedOff],
        );

        // Wait only for fare quote
        await Promise.all([fareQuotePromise]);

        // success -> navigate to review
        setIsBookingLoading(false);
        bookingStarted = false;
        router.push("/bookings/review");
        return;
      }

      // MULTI-CITY selection (journeyType === "3")
      if (journeyType === "3") {
        const flights = [...flightsSelected];
        const multiCityData = [...multicityFlightsResponse];

        // Put selected flight in current segment
        flights[segmentIndex] = flight;

        // Build segmentRef progressively and fetch future segments as needed
        let segmentRef = "";
        for (let i = 0; i < flights.length; i++) {
          if (i <= segmentIndex) {
            // already selected or current; take first segment ref if available
            segmentRef += flights[i]?.segments?.[0]?.flightSegmentRefId ?? "";
          } else {
            // need to fetch flights for remaining segments using current segmentRef
            try {
              const data = await fetchFlightsWithRefId(
                multicityFlightsResponse[i],
                segmentRef,
                "3",
              );
              if (!data) {
                throw new Error("Failed to fetch multi-city segment data");
              }

              multiCityData[i] = data;
              const nextFlight = data?.flightsResults?.[0]?.flights?.[0];
              flights[i] = nextFlight ?? flights[i];
              segmentRef += nextFlight?.segments?.[0]?.flightSegmentRefId ?? "";
            } catch (err) {
              console.error(`Error fetching multi-city segment ${i}:`, err);
              showToast(
                "error",
                "Failed to load multi-city flight segment. Please try again.",
              );
              // Keep UI consistent: don't partially update state on failure
              return;
            }
          }
        }

        // all segments fetched successfully
        setflightsSelected(flights);
        setMulticityFlightsResponse(multiCityData);
        const compressedData = pako.deflate(JSON.stringify(multiCityData));
        setTabSpecificData("multicityFlights", compressedData);
        setMulticityResponse(multiCityData);
        return;
      }

      // ROUND-TRIP INTERNATIONAL special handling
      if (
        journeyType === "2" &&
        flightsResponse?.flightJourney === "international"
      ) {
        // if selecting the first leg, fetch the paired leg by segmentRef
        if (wayindex === 0) {
          const segmentRefId = flight?.segments?.[0]?.flightSegmentRefId;
          try {
            const response = await fetchFlightsWithRefId(
              flightsResponse,
              segmentRefId,
              "2",
            );
            if (!response) {
              throw new Error("Failed to fetch return leg");
            }
            setFlightsResponse(response);
            setflightsSelected([
              flight,
              response?.flightsResults?.[1]?.flights?.[0],
            ]);
          } catch (err) {
            console.error("Error fetching paired international leg:", err);
            showToast(
              "error",
              "Failed to fetch paired flight. Please try again.",
            );
            return;
          }
          return;
        } else {
          // selecting the return leg, just replace
          const flightSelected = [...flightsSelected];
          flightSelected[wayindex] = flight;
          setflightsSelected(flightSelected);
          return;
        }
      }

      // Default: update flightsSelected for other cases
      {
        const flightSelected = [...flightsSelected];
        flightSelected[wayindex] = flight;
        setflightsSelected(flightSelected);
        return;
      }
    } catch (error) {
      console.error("handleSelectButtonClick error:", error);

      // Existing error extraction logic (keeps your original messages)
      let errorMessage =
        error?.response?.data?.error?.errorMsg ||
        error?.response?.data?.error?.errorMessage?.[0]?.data ||
        "Something went wrong, please try after some time";

      if (
        error?.response?.data?.error?.errorMessage?.[0]?.data ===
        "Session timeout!!"
      ) {
        errorMessage =
          "Oops! Your session has expired. Please search Flights again.";
        const shouldRedirectHome = window.location.pathname === "/";
        setTimeout(() => {
          router.push(shouldRedirectHome ? "/" : "/bookings/flightlisting");
        }, 2000);
      } else if (
        error?.response?.data?.error?.errorMessage?.[0]?.data ===
        "Fare Quote failed from the Supplier end. Please try again."
      ) {
        errorMessage = "Something went wrong, please select a different flight";
        setTimeout(() => {
          router.replace("/bookings/flightlisting");
        }, 2000);
      }

      showToast("error", errorMessage);
    } finally {
      // ensure loader cleared
      if (bookingStarted) setIsBookingLoading(false);
      setLoaderIndex();
    }
  };

  const handleSelectButtonClickBAK = async (
    flight,
    index,
    segmentIndex,
    wayindex,
  ) => {
    if (isBookingLoading) return;
    if (
      flightsRequest?.searchReqData?.journeyType === "1" ||
      (flightsRequest?.searchReqData?.journeyType === "3" &&
        flightsSelected.length === 1)
    ) {
      try {
        const storedUserIp = getTabSpecificData("userip");
        const ssrpayload = {
          qTraceId: flightsResponse.qTraceId,
          ssrReqModel: {
            endUserIp: storedUserIp === "undefined" ? null : storedUserIp,
            resultIndex: flight.resultIndex,
          },
        };
        setIsBookingLoading(true);

        // Concurrently fetch quote, SSR, and country data
        const [fareQuoteResponse] = await Promise.all([
          fetchGetQuote(
            flightsResponse.qTraceId,
            [flight.resultIndex],
            [flight.fare.offeredFareRoundedOff],
          ),
          // axios
          //   .post(`${config.FLIGHTS_BOOKING_SSR}`, ssrpayload)
          //   .catch((error) => {
          //     console.error("Error fetching SSR:", error);
          //     return null;
          //   }),
        ]);
        setIsBookingLoading(false);
        router.push("/bookings/review");
      } catch (error) {
        console.error(error);
        setIsBookingLoading(false);
        setLoaderIndex();
        let errorMessage =
          error?.response?.data?.error?.errorMsg ||
          error?.response?.data?.error?.errorMessage?.[0]?.data ||
          "Something went wrong, please try after some time";

        if (
          error?.response?.data?.error?.errorMessage?.[0]?.data ===
          "Session timeout!!"
        ) {
          errorMessage =
            "Oops! Your session has expired. Please search Flights again.";
          // router.push("/"); // Redirect to home
          const shouldRedirectHome = window.location.pathname === "/";
          setTimeout(() => {
            router.push(shouldRedirectHome ? "/" : "/bookings/flightlisting");
          }, 2000);
        } else if (
          error?.response?.data?.error?.errorMessage?.[0]?.data ===
          "Fare Quote failed from the Supplier end. Please try again."
        ) {
          errorMessage =
            "Something went wrong, please select a different flight";
          setTimeout(() => {
            router.replace("/bookings/flightlisting");
          }, 2000);
        }
        showToast("error", errorMessage);
      } finally {
        setIsBookingLoading(false);
        setLoaderIndex();
      }
    } else if (flightsRequest?.searchReqData?.journeyType === "3") {
      let flights = [...flightsSelected];
      console.log("flights is multiCityData", multicityResponse);
      let multiCityData = [...multicityFlightsResponse];
      flights[segmentIndex] = flight;

      let segmentRef = "";
      for (let i = 0; i < flights.length; i++) {
        if (i <= segmentIndex) {
          segmentRef += flights[i]?.segments?.[0]?.flightSegmentRefId;
        } else {
          const data = await fetchFlightsWithRefId(
            multicityFlightsResponse[i],
            segmentRef,
            "3",
          );
          multiCityData[i] = data;
          //console.log("data is ",data?.flightsResults[0]?.flights?.[0]);
          flights[i] = data?.flightsResults[0]?.flights?.[0];
          segmentRef +=
            data?.flightsResults[0]?.flights?.[0]?.segments?.[0]
              ?.flightSegmentRefId;
        }
      }
      console.log("flights is setflightsSelected", multiCityData);
      setflightsSelected(flights);
      setMulticityFlightsResponse(multiCityData);
      const compressedData = pako.deflate(JSON.stringify(multiCityData));
      setTabSpecificData("multicityFlights", compressedData);
      setMulticityResponse(multiCityData);
    } else if (
      flightsRequest?.searchReqData?.journeyType === "2" &&
      flightsResponse?.flightJourney === "international"
    ) {
      if (wayindex === 0) {
        const segmentRefId = flight?.segments?.[0]?.flightSegmentRefId;
        const response = await fetchFlightsWithRefId(
          flightsResponse,
          segmentRefId,
          "2",
        );

        setFlightsResponse(response);
        setflightsSelected([
          flight,
          response?.flightsResults?.[1]?.flights?.[0],
        ]);
      } else {
        let flightSelected = [...flightsSelected];
        flightSelected[wayindex] = flight;
        setflightsSelected(flightSelected);
      }
    } else {
      let flightSelected = [...flightsSelected];
      flightSelected[wayindex] = flight;
      setflightsSelected(flightSelected);
    }
  };

  const handleSegmentChange = (index) => {
    setFlightsResponse(multicityFlightsResponse[index]);
    setFilterData([
      multicityFlightsResponse[index].flightsResults[0].filterData,
    ]);
    let updateFilter = [...selectedDesktopFilters];

    setActiveSegment(index);
  };

  // useEffect(() => {
  //   let amount = 0;
  //   if (flightsSelected && flightsSelected.length > 0) {
  //     if (flightsResponse?.flightJourney === "domestic") {
  //       amount = flightsSelected.reduce(
  //         (acc, flight) => acc + flight?.fare?.offeredFareRoundedOff,
  //         0
  //       );
  //     } else {
  //       amount =
  //         flightsSelected[flightsSelected.length - 1]?.fare
  //           ?.offeredFareRoundedOff;
  //     }
  //     setTotalAmount(amount);
  //   }
  // }, [flightsSelected]);

  useEffect(() => {
    if (!flightsSelected?.length) return;

    const calculateTotalAmount = () => {
      const isDomestic = flightsResponse?.flightJourney === "domestic";

      if (isDomestic) {
        return flightsSelected.reduce(
          (acc, flight) => acc + (flight?.fare?.offeredFareRoundedOff || 0),
          0,
        );
      } else {
        const lastFlight = flightsSelected[flightsSelected.length - 1];
        return lastFlight?.fare?.offeredFareRoundedOff || 0;
      }
    };

    setTotalAmount(calculateTotalAmount());
  }, [flightsSelected, flightsResponse?.flightJourney]);

  // const updateFlightsResponse = () => {
  //   setSearchBtnLoader(true);
  //   setIsDropdownVisible(false);
  //   try {
  //     const compressedData = getTabSpecificData("flightResponse");
  //     const numbersArray = compressedData.split(",").map(Number);

  //     const compressedUint8Array = new Uint8Array(numbersArray);

  //     const encodedResponse = pako.inflate(compressedUint8Array, {
  //       to: "string",
  //     });

  //     const encodedRequest = getTabSpecificData("flightRequest");

  //     if (encodedResponse && encodedRequest) {
  //       const decodedResponse = JSON.parse(encodedResponse);
  //       const decodedRequest = JSON.parse(atob(encodedRequest));
  //       setFlightsResponse(decodedResponse);
  //       setDecodedResponse(decodedResponse);
  //       setFlightsRequest(decodedRequest);

  //       setflightsSelected([]);
  //       setMulticityFlightsResponse([]);
  //       setShareData([]);

  //       if (decodedResponse.flightsResults.length === 2) {
  //         setflightsSelected([
  //           decodedResponse.flightsResults[0].flights[0],
  //           decodedResponse.flightsResults[1].flights[0],
  //         ]);
  //       }

  //       decodedResponse.flightsResults.length == 2
  //         ? setFilterData([
  //             decodedResponse.flightsResults[0].filterData,
  //             decodedResponse.flightsResults[1].filterData,
  //           ])
  //         : setFilterData([decodedResponse.flightsResults[0].filterData]);

  //       decodedResponse.flightsResults.length == 2
  //         ? setSortingCriteria([
  //             {
  //               criteria: "price",
  //               order: "asc",
  //             },
  //             {
  //               criteria: "price",
  //               order: "asc",
  //             },
  //           ])
  //         : setSortingCriteria([
  //             {
  //               criteria: "price",
  //               order: "asc",
  //             },
  //           ]);
  //       decodedResponse.flightsResults.length == 2
  //         ? setSelectedDesktopFilters([
  //             [
  //               {
  //                 stops: [],
  //                 airlines: [],
  //                 layovers: [],
  //                 destinations: [],
  //                 arrivals: [],
  //                 price: {},
  //                 cabinClasses: [],
  //                 carrier: [],
  //                 refund: {},
  //                 departureTime: [],
  //                 arrivalTime: [],
  //                 duration: {},
  //               },
  //             ],
  //             [
  //               {
  //                 stops: [],
  //                 airlines: [],
  //                 layovers: [],
  //                 destinations: [],
  //                 arrivals: [],
  //                 price: {},
  //                 cabinClasses: [],
  //                 carrier: [],
  //                 refund: {},
  //                 departureTime: [],
  //                 arrivalTime: [],
  //                 duration: {},
  //               },
  //             ],
  //           ])
  //         : setSelectedDesktopFilters([
  //             [
  //               {
  //                 stops: [],
  //                 airlines: [],
  //                 layovers: [],
  //                 destinations: [],
  //                 arrivals: [],
  //                 price: {},
  //                 cabinClasses: [],
  //                 carrier: [],
  //                 refund: {},
  //                 departureTime: [],
  //                 arrivalTime: [],
  //                 duration: {},
  //               },
  //             ],
  //           ]);
  //       if (decodedRequest?.searchReqData?.journeyType === "1")
  //         setflightsSelected([]);
  //       if (decodedRequest.searchReqData.journeyType == "3") {
  //         const compressedmulticityData =
  //           getTabSpecificData("multicityFlights");
  //         if (compressedmulticityData) {
  //           const numbersmulticityArray = compressedmulticityData
  //             .split(",")
  //             .map(Number);
  //           const compressedmulticityUint8Array = new Uint8Array(
  //             numbersmulticityArray
  //           );
  //           const multicityEncodedResponse = pako.inflate(
  //             compressedmulticityUint8Array,
  //             {
  //               to: "string",
  //             }
  //           );

  //           if (
  //             multicityEncodedResponse &&
  //             decodedRequest?.searchReqData?.journeyType === "3"
  //           ) {
  //             const multicityDecodedResponse = JSON.parse(
  //               multicityEncodedResponse
  //             );
  //             setActiveSegment(0);
  //             setMulticityFlightsResponse(multicityDecodedResponse);
  //             setMulticityResponse(multicityDecodedResponse);
  //             let flightsSeletedList = [];
  //             for (let i = 0; i < multicityDecodedResponse.length; i++) {
  //               flightsSeletedList.push(
  //                 multicityDecodedResponse[i].flightsResults[0].flights[0]
  //               );
  //             }
  //             setflightsSelected(flightsSeletedList);
  //             let filters = [];
  //             let prevFilters = [...selectedDesktopFilters];
  //             for (let i = 0; i < multicityDecodedResponse.length; i++) {
  //               filters.push({
  //                 stops: [],
  //                 airlines: [],
  //                 layovers: [],
  //                 destinations: [],
  //                 arrivals: [],
  //                 price: {},
  //                 cabinClasses: [],
  //                 carrier: [],
  //                 refund: {},
  //                 departureTime: [],
  //                 arrivalTime: [],
  //                 duration: {},
  //               });
  //             }
  //             prevFilters[0] = filters;
  //             setSelectedDesktopFilters(prevFilters);
  //           }
  //         }
  //       }
  //     }
  //   } catch (error) {
  //     ////console.log(error);
  //   } finally {
  //     setSearchBtnLoader(false);
  //   }
  // };

  const updateFlightsResponse = async (result) => {
    console.log("updateFlightsResponse called with:", result);
    if (result?.success) {
      setSearchBtnLoader(true);
      setIsDropdownVisible(false);
      setSearchError(null);
      setIsSearchFailed(false);

      // Reset API call tracker
      apiCallTracker.current = new Set();

      try {
        const compressedData = getTabSpecificData("flightResponse");
        const numbersArray = compressedData.split(",").map(Number);
        const compressedUint8Array = new Uint8Array(numbersArray);
        const encodedResponse = pako.inflate(compressedUint8Array, {
          to: "string",
        });
        const encodedRequest = getTabSpecificData("flightRequest");

        if (encodedResponse && encodedRequest) {
          const decodedResponse = JSON.parse(encodedResponse);
          const decodedRequest = JSON.parse(atob(encodedRequest));

          // Set core response data
          setFlightsResponse(decodedResponse);
          setDecodedResponse(decodedResponse);
          setFlightsRequest(decodedRequest);

          // Reset all selection states
          setflightsSelected([]);
          setMulticityFlightsResponse([]);
          setShareData([]);

          // Reset view price opened toggle
          setViewPriceFlightIndexes({
            0: null, // For departure segment
            1: null, // For return segment
          });

          // Handle different journey types
          const journeyType = decodedRequest?.searchReqData?.journeyType;

          if (journeyType === "2") {
            // Round-trip flights: Reset all states
            setSegmentSelectedIndices({ 0: 0, 1: 0 });
            setActiveTab("departure");
            setSelectedIndex(0);

            // Set initial selected flights
            if (decodedResponse.flightsResults.length === 2) {
              setflightsSelected([
                decodedResponse.flightsResults[0].flights[0],
                decodedResponse.flightsResults[1].flights[0],
              ]);
            }

            // For international flights, fetch return flights with refId
            if (decodedResponse?.flightJourney === "international") {
              const firstFlightRefId =
                decodedResponse.flightsResults[0]?.flights[0]?.segments?.[0]
                  ?.flightSegmentRefId;

              if (firstFlightRefId) {
                const response = await fetchFlightsWithRefId(
                  decodedResponse,
                  firstFlightRefId,
                  "2",
                );
                setFlightsResponse(response);
                setflightsSelected([
                  decodedResponse.flightsResults[0].flights[0],
                  response?.flightsResults?.[1]?.flights?.[0],
                ]);
              }
            }
          } else if (journeyType === "1") {
            // One-way flights: Reset states
            setflightsSelected([]);
            setSelectedIndex(0);
          } else if (journeyType === "3") {
            // Multi-city flights: Reset all states
            setActiveSegment(0);

            const compressedMulticityData =
              getTabSpecificData("multicityFlights");
            if (compressedMulticityData) {
              const numbersMulticityArray = compressedMulticityData
                .split(",")
                .map(Number);
              const compressedMulticityUint8Array = new Uint8Array(
                numbersMulticityArray,
              );
              const multicityEncodedResponse = pako.inflate(
                compressedMulticityUint8Array,
                { to: "string" },
              );

              if (multicityEncodedResponse) {
                const multicityDecodedResponse = JSON.parse(
                  multicityEncodedResponse,
                );
                setMulticityFlightsResponse(multicityDecodedResponse);
                setMulticityResponse(multicityDecodedResponse);

                // Set first flight from each segment
                let flightsSelectedList = [];
                for (let i = 0; i < multicityDecodedResponse.length; i++) {
                  flightsSelectedList.push(
                    multicityDecodedResponse[i].flightsResults[0].flights[0],
                  );
                }
                setflightsSelected(flightsSelectedList);

                // Reset filters for each segment
                let filters = [];
                for (let i = 0; i < multicityDecodedResponse.length; i++) {
                  filters.push({
                    stops: [],
                    airlines: [],
                    layovers: [],
                    destinations: [],
                    arrivals: [],
                    price: {},
                    cabinClasses: [],
                    carrier: [],
                    refund: {},
                    departureTime: [],
                    arrivalTime: [],
                    duration: {},
                    // inPolicyOnly: false,
                  });
                }
                setSelectedDesktopFilters([filters]);
              }
            }
          }

          // Reset filter data
          if (decodedResponse.flightsResults.length === 2) {
            setFilterData([
              decodedResponse.flightsResults[0].filterData,
              decodedResponse.flightsResults[1].filterData,
            ]);
          } else {
            setFilterData([decodedResponse.flightsResults[0].filterData]);
          }

          // Reset sorting criteria
          const defaultSortCriteria = { criteria: "price", order: "asc" };
          if (decodedResponse.flightsResults.length === 2) {
            setSortingCriteria([defaultSortCriteria, defaultSortCriteria]);
          } else {
            setSortingCriteria([defaultSortCriteria]);
          }

          // Reset desktop filters
          const defaultFilter = {
            stops: [],
            airlines: [],
            layovers: [],
            destinations: [],
            arrivals: [],
            price: {},
            cabinClasses: [],
            carrier: [],
            refund: {},
            departureTime: [],
            arrivalTime: [],
            duration: {},
            // inPolicyOnly: false,
          };

          if (
            decodedResponse.flightsResults.length === 2 &&
            journeyType !== "3"
          ) {
            setSelectedDesktopFilters([[defaultFilter], [defaultFilter]]);
          } else if (journeyType !== "3") {
            setSelectedDesktopFilters([[defaultFilter]]);
          }

          // Reset any other UI states
          setRotatedIcons([[], []]);
          setSelectedFilterIndex(undefined);
          setIsFiltersOpen(false);
        }
      } catch (error) {
        console.error("Error updating flights response:", error);
      } finally {
        setSearchBtnLoader(false);
      }
    } else {
      // Handle failed search
      setSearchBtnLoader(false);
      setSearchError({
        title: "Search Failed",
        message:
          result?.error ||
          "Unable to find flights. Please modify your search criteria and try again.",
      });
      setIsSearchFailed(true);

      // Clear old flight data to prevent showing stale results
      setFlightsResponse(null);
      setDecodedResponse(null);
      setflightsSelected([]);
      setMulticityFlightsResponse([]);
      setShareData([]);
    }
  };

  // useEffect(() => {
  //   const fetchData = async () => {
  //     try {
  //       const compressedData = getTabSpecificData("flightResponse");
  //       const numbersArray = compressedData.split(",").map(Number);

  //       const compressedUint8Array = new Uint8Array(numbersArray);

  //       const encodedResponse = pako.inflate(compressedUint8Array, {
  //         to: "string",
  //       });
  //       // console.log("encodedResponse", encodedResponse);
  //       const encodedRequest = getTabSpecificData("flightRequest");

  //       const encodedSelectedFlightData = getTabSpecificData(
  //         "selectedFlightDataCorporate"
  //       );

  //       const selectedFlightSection = getTabSpecificData(
  //         "selectedFlightSection"
  //       );
  //       const compressedmulticityData = getTabSpecificData("multicityFlights");

  //       if (encodedResponse && encodedRequest) {
  //         // Decode from base64
  //         const decodedResponse = JSON.parse(encodedResponse);
  //         const decodedRequest = JSON.parse(atob(encodedRequest));

  //         setFlightsResponse(decodedResponse);
  //         setDecodedResponse(decodedResponse);
  //         setFlightsRequest(decodedRequest);
  //         decodedResponse.flightsResults.length == 2
  //           ? setFilterData([
  //               decodedResponse.flightsResults[0].filterData,
  //               decodedResponse.flightsResults[1].filterData,
  //             ])
  //           : setFilterData([decodedResponse.flightsResults[0].filterData]);
  //         decodedResponse.flightsResults.length == 2
  //           ? setSortingCriteria([
  //               {
  //                 criteria: "price",
  //                 order: "asc",
  //               },
  //               {
  //                 criteria: "price",
  //                 order: "asc",
  //               },
  //             ])
  //           : setSortingCriteria([
  //               {
  //                 criteria: "price",
  //                 order: "asc",
  //               },
  //             ]);
  //         if (decodedResponse.flightsResults.length == 2) {
  //           setflightsSelected([
  //             decodedResponse.flightsResults[0].flights[0],
  //             decodedResponse.flightsResults[1].flights[0],
  //           ]);
  //         }
  //         decodedResponse.flightsResults.length == 2
  //           ? setSelectedDesktopFilters([
  //               [
  //                 {
  //                   stops: [],
  //                   airlines: [],
  //                   layovers: [],
  //                   destinations: [],
  //                   arrivals: [],
  //                   price: {},
  //                   cabinClasses: [],
  //                   carrier: [],
  //                   refund: {},
  //                   departureTime: [],
  //                   arrivalTime: [],
  //                   duration: {},
  //                 },
  //               ],
  //               [
  //                 {
  //                   stops: [],
  //                   airlines: [],
  //                   layovers: [],
  //                   destinations: [],
  //                   arrivals: [],
  //                   price: {},
  //                   cabinClasses: [],
  //                   carrier: [],
  //                   refund: {},
  //                   departureTime: [],
  //                   arrivalTime: [],
  //                   duration: {},
  //                 },
  //               ],
  //             ])
  //           : setSelectedDesktopFilters([
  //               [
  //                 {
  //                   stops: [],
  //                   airlines: [],
  //                   layovers: [],
  //                   destinations: [],
  //                   arrivals: [],
  //                   price: {},
  //                   cabinClasses: [],
  //                   carrier: [],
  //                   refund: {},
  //                   departureTime: [],
  //                   arrivalTime: [],
  //                   duration: {},
  //                 },
  //               ],
  //             ]);

  //         if (compressedmulticityData) {
  //           const numbersmulticityArray = compressedmulticityData
  //             .split(",")
  //             .map(Number);
  //           const compressedmulticityUint8Array = new Uint8Array(
  //             numbersmulticityArray
  //           );
  //           const multicityEncodedResponse = pako.inflate(
  //             compressedmulticityUint8Array,
  //             {
  //               to: "string",
  //             }
  //           );
  //           if (decodedRequest?.searchReqData?.journeyType === "1")
  //             setflightsSelected([]);
  //           if (
  //             multicityEncodedResponse &&
  //             decodedRequest?.searchReqData?.journeyType === "3"
  //           ) {
  //             const multicityDecodedResponse = JSON.parse(
  //               multicityEncodedResponse
  //             );
  //             setMulticityFlightsResponse(multicityDecodedResponse);
  //             setMulticityResponse(multicityDecodedResponse);
  //             let flightsSeletedList = [];
  //             for (let i = 0; i < multicityDecodedResponse.length; i++) {
  //               flightsSeletedList.push(
  //                 multicityDecodedResponse[i].flightsResults[0].flights[0]
  //               );
  //             }
  //             setflightsSelected(flightsSeletedList);
  //             let filters = [];
  //             let prevFilters = [...selectedDesktopFilters];
  //             for (let i = 0; i < multicityDecodedResponse.length; i++) {
  //               filters.push({
  //                 stops: [],
  //                 airlines: [],
  //                 layovers: [],
  //                 destinations: [],
  //                 arrivals: [],
  //                 price: {},
  //                 cabinClasses: [],
  //                 carrier: [],
  //                 refund: {},
  //                 departureTime: [],
  //                 arrivalTime: [],
  //                 duration: {},
  //               });
  //             }
  //             prevFilters[0] = filters;
  //             setSelectedDesktopFilters(prevFilters);
  //           }
  //         }
  //       }
  //     } catch (error) {
  //       console.log(error);
  //     }
  //   };

  //   fetchData();
  // }, []);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoadingData(true);
      try {
        const compressedData = getTabSpecificData("flightResponse");
        const encodedRequest = getTabSpecificData("flightRequest");

        // Validate required data exists
        if (!compressedData || !encodedRequest) {
          setHasValidData(false);
          setDataError({
            title: "No Flight Data Found",
            message:
              "It looks like you accessed this page directly. Please search for flights first.",
            actionText: "Search Flights",
            actionUrl: "/",
          });
          setIsLoadingData(false);
          return;
        }

        // Validate data format
        if (
          typeof compressedData !== "string" ||
          !compressedData.includes(",")
        ) {
          setHasValidData(false);
          setDataError({
            title: "Invalid Flight Data",
            message:
              "Flight data appears to be corrupted. Please search for flights again.",
            actionText: "New Search",
            actionUrl: "/",
          });
          setIsLoadingData(false);
          return;
        }

        const numbersArray = compressedData.split(",").map(Number);

        // Validate numbers array
        if (numbersArray.some(isNaN)) {
          throw new Error("Invalid compressed data format");
        }

        const compressedUint8Array = new Uint8Array(numbersArray);

        const encodedResponse = pako.inflate(compressedUint8Array, {
          to: "string",
        });

        // Validate decoded response
        if (!encodedResponse) {
          throw new Error("Failed to decompress flight data");
        }

        const compressedmulticityData = getTabSpecificData("multicityFlights");

        // Decode from base64
        const decodedResponse = JSON.parse(encodedResponse);
        const decodedRequest = JSON.parse(atob(encodedRequest));

        // Validate decoded data structure
        if (
          !decodedResponse.flightsResults ||
          !Array.isArray(decodedResponse.flightsResults)
        ) {
          throw new Error("Invalid flight response structure");
        }

        if (!decodedRequest.searchReqData) {
          throw new Error("Invalid flight request structure");
        }

        // All validations passed, set the data
        setFlightsResponse(decodedResponse);
        setDecodedResponse(decodedResponse);
        setFlightsRequest(decodedRequest);

        // Set filter data based on results length
        decodedResponse.flightsResults.length == 2
          ? setFilterData([
              decodedResponse.flightsResults[0].filterData,
              decodedResponse.flightsResults[1].filterData,
            ])
          : setFilterData([decodedResponse.flightsResults[0].filterData]);

        // Set sorting criteria
        decodedResponse.flightsResults.length == 2
          ? setSortingCriteria([
              {
                criteria: "price",
                order: "asc",
              },
              {
                criteria: "price",
                order: "asc",
              },
            ])
          : setSortingCriteria([
              {
                criteria: "price",
                order: "asc",
              },
            ]);

        // Set selected flights for round trip
        if (decodedResponse.flightsResults.length == 2) {
          setflightsSelected([
            decodedResponse.flightsResults[0].flights[0],
            decodedResponse.flightsResults[1].flights[0],
          ]);
        }

        // Set desktop filters
        decodedResponse.flightsResults.length == 2
          ? setSelectedDesktopFilters([
              [
                {
                  stops: [],
                  airlines: [],
                  layovers: [],
                  destinations: [],
                  arrivals: [],
                  price: {},
                  cabinClasses: [],
                  carrier: [],
                  refund: {},
                  departureTime: [],
                  arrivalTime: [],
                  duration: {},
                  // inPolicyOnly: false,
                },
              ],
              [
                {
                  stops: [],
                  airlines: [],
                  layovers: [],
                  destinations: [],
                  arrivals: [],
                  price: {},
                  cabinClasses: [],
                  carrier: [],
                  refund: {},
                  departureTime: [],
                  arrivalTime: [],
                  duration: {},
                  // inPolicyOnly: false,
                },
              ],
            ])
          : setSelectedDesktopFilters([
              [
                {
                  stops: [],
                  airlines: [],
                  layovers: [],
                  destinations: [],
                  arrivals: [],
                  price: {},
                  cabinClasses: [],
                  carrier: [],
                  refund: {},
                  departureTime: [],
                  arrivalTime: [],
                  duration: {},
                  // inPolicyOnly: false,
                },
              ],
            ]);

        // Handle multicity data if exists
        if (compressedmulticityData) {
          try {
            const numbersmulticityArray = compressedmulticityData
              .split(",")
              .map(Number);

            // Validate multicity numbers array
            if (numbersmulticityArray.some(isNaN)) {
              console.warn("Invalid multicity compressed data format");
            } else {
              const compressedmulticityUint8Array = new Uint8Array(
                numbersmulticityArray,
              );
              const multicityEncodedResponse = pako.inflate(
                compressedmulticityUint8Array,
                {
                  to: "string",
                },
              );

              if (decodedRequest?.searchReqData?.journeyType === "1") {
                setflightsSelected([]);
              }

              if (
                multicityEncodedResponse &&
                decodedRequest?.searchReqData?.journeyType === "3"
              ) {
                const multicityDecodedResponse = JSON.parse(
                  multicityEncodedResponse,
                );

                // Validate multicity response structure
                if (Array.isArray(multicityDecodedResponse)) {
                  setMulticityFlightsResponse(multicityDecodedResponse);
                  setMulticityResponse(multicityDecodedResponse);

                  let flightsSeletedList = [];
                  for (let i = 0; i < multicityDecodedResponse.length; i++) {
                    if (
                      multicityDecodedResponse[i]?.flightsResults?.[0]
                        ?.flights?.[0]
                    ) {
                      flightsSeletedList.push(
                        multicityDecodedResponse[i].flightsResults[0]
                          .flights[0],
                      );
                    }
                  }
                  setflightsSelected(flightsSeletedList);

                  let filters = [];
                  let prevFilters = [...selectedDesktopFilters];
                  for (let i = 0; i < multicityDecodedResponse.length; i++) {
                    filters.push({
                      stops: [],
                      airlines: [],
                      layovers: [],
                      destinations: [],
                      arrivals: [],
                      price: {},
                      cabinClasses: [],
                      carrier: [],
                      refund: {},
                      departureTime: [],
                      arrivalTime: [],
                      duration: {},
                      // inPolicyOnly: false,
                    });
                  }
                  prevFilters[0] = filters;
                  setSelectedDesktopFilters(prevFilters);
                } else {
                  console.warn("Invalid multicity response structure");
                }
              }
            }
          } catch (multicityError) {
            console.warn("Error processing multicity data:", multicityError);
            // Don't fail the whole page for multicity data issues
          }
        }

        // If we reach here, everything loaded successfully
        setHasValidData(true);
        setDataError(null);
      } catch (error) {
        console.error("Error loading flight data:", error);
        setHasValidData(false);

        // Determine error type and set appropriate message
        let errorMessage = {
          title: "Failed to Load Flight Data",
          message: "There was an error loading your flight search results.",
          actionText: "Search Again",
          actionUrl: "/",
        };

        if (error.message.includes("JSON")) {
          errorMessage = {
            title: "Corrupted Flight Data",
            message:
              "The flight data appears to be corrupted. Please search for flights again.",
            actionText: "New Search",
            actionUrl: "/",
          };
        } else if (error.message.includes("decompress")) {
          errorMessage = {
            title: "Data Decompression Failed",
            message:
              "Unable to process flight data. This might be due to expired session data.",
            actionText: "Search Again",
            actionUrl: "/",
          };
        }

        setDataError(errorMessage);
      } finally {
        setIsLoadingData(false);
      }
    };

    fetchData();
  }, []);
  const scroll = (direction) => {
    if (scrollRef.current) {
      const scrollAmount = direction === "left" ? -200 : 200; // Adjust scroll amount as needed
      scrollRef.current.scrollBy({
        left: scrollAmount,
        behavior: "smooth",
      });
    }
  };

  useEffect(() => {
    const checkOverflow = () => {
      if (scrollRef.current) {
        const isOverflowing =
          scrollRef.current.scrollWidth > scrollRef.current.clientWidth;
        setShowScrollButtons(isOverflowing);
      }
    };

    checkOverflow(); // Check on mount
    window.addEventListener("resize", checkOverflow); // Check on resize

    return () => {
      window.removeEventListener("resize", checkOverflow); // Cleanup
    };
  }, [flightsSelected]); // Re-check when flightsSelected changes
  const areFiltersApplied = (filters, segmentIndex = 0) => {
    if (!filters || !filters[segmentIndex]) return false;

    const filterSet = filters[segmentIndex][0]; // Get the filter object for the segment

    return (
      filterSet.stops?.length > 0 ||
      filterSet.airlines?.length > 0 ||
      filterSet.layovers?.length > 0 ||
      filterSet.destinations?.length > 0 ||
      filterSet.arrivals?.length > 0 ||
      Object.keys(filterSet.price || {}).length > 0 ||
      filterSet.cabinClasses?.length > 0 ||
      filterSet.carrier?.length > 0 ||
      Object.keys(filterSet.refund || {}).length > 0 ||
      filterSet.departureTime?.length > 0 ||
      filterSet.arrivalTime?.length > 0 ||
      Object.keys(filterSet.duration || {}).length > 0
      //  ||
      // filterSet.inPolicyOnly === true
    );
  };
  const handleFlightDuration = (departureTime, arrivalTime) => {
    const departureDate = new Date(departureTime);
    const arrivalDate = new Date(arrivalTime);

    // Get the start of the departure day
    const departureDayStart = new Date(
      departureDate.getFullYear(),
      departureDate.getMonth(),
      departureDate.getDate(),
    );

    // Get the start of the arrival day
    const arrivalDayStart = new Date(
      arrivalDate.getFullYear(),
      arrivalDate.getMonth(),
      arrivalDate.getDate(),
    );

    // Calculate the difference in days
    const timeDifference =
      arrivalDayStart.getTime() - departureDayStart.getTime();
    const daysDifference = timeDifference / (1000 * 3600 * 24);
    return Math.ceil(daysDifference);
  };

  const regionId = useMemo(() => {
    const journeyType = flightsRequest?.searchReqData?.journeyType;

    // MULTI-CITY
    if (journeyType === "3") {
      if (Array.isArray(flightsResponse?.isDomestic)) {
        const isCurrentSegmentDomestic =
          flightsResponse.isDomestic[activeSegment];
        return !isCurrentSegmentDomestic
          ? FLIGHT_BUDGET_INTERNATIONAL_ID
          : FLIGHT_BUDGET_DOMESTIC_ID;
      }
      return FLIGHT_BUDGET_INTERNATIONAL_ID;
    }

    // ROUND-TRIP / TWO-WAY → use flightJourney
    if (journeyType === "2") {
      const isInternational =
        flightsResponse?.flightJourney === "international";
      return isInternational
        ? FLIGHT_BUDGET_INTERNATIONAL_ID
        : FLIGHT_BUDGET_DOMESTIC_ID;
    }

    // ONE-WAY → use isDomestic
    return !flightsResponse?.isDomestic
      ? FLIGHT_BUDGET_INTERNATIONAL_ID
      : FLIGHT_BUDGET_DOMESTIC_ID;
  }, [
    flightsResponse?.isDomestic,
    flightsResponse?.flightJourney,
    activeSegment,
    flightsRequest?.searchReqData?.journeyType,
  ]);

  const handleProceedError = (error) => {
    let errorMessage =
      error?.response?.data?.error?.errorMsg ||
      error?.response?.data?.error?.errorMessage?.[0]?.data ||
      "Something went wrong, please try after some time";

    if (
      error?.response?.data?.error?.errorMessage?.[0]?.data ===
      "Session timeout!!"
    ) {
      errorMessage =
        "Oops! Your session has expired. Please search Flights again.";
      const shouldRedirectHome = window.location.pathname === "/";
      setTimeout(() => {
        router.push(shouldRedirectHome ? "/" : "/bookings/flightlisting");
      }, 2000);
    } else if (
      error?.response?.data?.error?.errorMessage?.[0]?.data ===
      "Fare Quote failed from the Supplier end. Please try again."
    ) {
      errorMessage = "Something went wrong, please select a different flight";
      setTimeout(() => {
        router.replace("/bookings/flightlisting");
      }, 2000);
    }

    showToast("error", errorMessage);
  };

  // const handleProceed = async () => {
  //   try {
  //     removeTabSpecificData("selectedFlightDataCorporate");
  //     setProceedBtnLoader(true);
  //     const storedUserIp = getTabSpecificData("userip");

  //     let resultIndex = [];
  //     // const ssrpayload = {
  //     //   qTraceId: flightsResponse.qTraceId,
  //     //   ssrReqModel: {
  //     //     endUserIp: storedUserIp === "undefined" ? null : storedUserIp,
  //     //     resultIndex: flight.resultIndex,
  //     //   },
  //     // };
  //     if (
  //       flightsRequest?.searchReqData?.journeyType === "2" &&
  //       flightsResponse?.flightJourney !== "international"
  //     ) {
  //       resultIndex = [
  //         flightsSelected[0].resultIndex,
  //         flightsSelected[1].resultIndex,
  //       ];
  //     } else {
  //       resultIndex = [flightsSelected[flightsSelected.length - 1].resultIndex];
  //     }
  //     // Concurrently fetch quote, SSR, and country data
  //     const [fareQuoteResponse] = await Promise.all([
  //       fetchGetQuote(flightsResponse.qTraceId, resultIndex, [
  //         flightsSelected[0].fare.offeredFareRoundedOff,
  //       ]),
  //     ]);
  //   } catch (error) {
  //     console.error(error);

  //     let errorMessage =
  //       error?.response?.data?.error?.errorMsg ||
  //       error?.response?.data?.error?.errorMessage?.[0]?.data ||
  //       "Something went wrong, please try after some time";

  //     if (
  //       error?.response?.data?.error?.errorMessage?.[0]?.data ===
  //       "Session timeout!!"
  //     ) {
  //       errorMessage =
  //         "Oops! Your session has expired. Please search Flights again.";
  //       const shouldRedirectHome = window.location.pathname === "/";
  //       setTimeout(() => {
  //         router.push(shouldRedirectHome ? "/" : "/bookings/flightlisting");
  //       }, 2000);
  //       // router.push("/"); // Redirect to home
  //     } else if (
  //       error?.response?.data?.error?.errorMessage?.[0]?.data ===
  //       "Fare Quote failed from the Supplier end. Please try again."
  //     ) {
  //       errorMessage = "Something went wrong, please select a different flight";
  //       router.replace("/bookings/flightlisting");
  //     }

  //     // if (!isToastVisible) {
  //     toast(errorMessage);
  //     //   setIsToastVisible(true);
  //     //   setTimeout(() => setIsToastVisible(false), 6000);
  //     // }
  //   } finally {
  //     setProceedBtnLoader(false);
  //   }
  // };

  const handleProceed = async () => {
    // Quick validation
    const journeyType = flightsRequest?.searchReqData?.journeyType;
    const validFlights = flightsSelected.filter(
      (flight) => flight && flight.segments,
    );

    const requiredFlights =
      journeyType === "1"
        ? 1
        : journeyType === "2"
          ? 2
          : flightsRequest?.searchReqData?.segments?.length || 0;

    if (validFlights.length < requiredFlights) {
      const messages = {
        1: "Please select a flight to proceed.",
        2: "Please select both departure and return flights to proceed.",
        3: `Please select flights for all ${requiredFlights} segments to proceed.`,
      };
      showToast(
        "error",
        messages[journeyType] ||
          "Please select all required flights to proceed.",
      );
      return;
    }

    try {
      removeTabSpecificData("selectedFlightDataCorporate");
      setProceedBtnLoader(true);

      // Build data based on journey type
      const isInternational =
        flightsResponse?.flightJourney === "international";
      let resultIndexes, fareValues;

      if (journeyType === "2" && !isInternational) {
        // Domestic round-trip
        resultIndexes = [
          flightsSelected[0].resultIndex,
          flightsSelected[1].resultIndex,
        ];
        fareValues = [
          flightsSelected[0].fare.offeredFareRoundedOff,
          flightsSelected[1].fare.offeredFareRoundedOff,
        ];
      }
      //  else if (journeyType === "3") {
      //   // Multi-city
      //   resultIndexes = validFlights.map((flight) => flight.resultIndex);
      //   fareValues = validFlights.map(
      //     (flight) => flight.fare.offeredFareRoundedOff
      //   );
      // }
      else {
        // One-way or international round-trip
        const lastFlight = flightsSelected[flightsSelected.length - 1];
        resultIndexes = [lastFlight.resultIndex];
        fareValues = [lastFlight.fare.offeredFareRoundedOff];
      }

      await Promise.all([
        fetchGetQuote(flightsResponse.qTraceId, resultIndexes, fareValues),
      ]);
    } catch (error) {
      console.error(error);
      handleProceedError(error);
    } finally {
      setProceedBtnLoader(false);
    }
  };

  const fetchGetQuote = async (qTraceId, resultIndexes, oldPrices) => {
    try {
      const storedUserIp = getTabSpecificData("userip");
      ////console.log("storedUserIp is", storedUserIp);
      const payload = {
        qTraceId: qTraceId,
        userType: "b2c",
        fareQuoteReqData: {
          endUserIp: storedUserIp == "undefined" ? null : storedUserIp,
          resultIndex:
            resultIndexes.length == 2
              ? resultIndexes[0] + "," + resultIndexes[1]
              : resultIndexes[0],
        },
      };
      const { data } = await axios.post(
        `${config.FLIGHTS_SEARCH_FAREQUOTE}`,
        payload,
      );

      const updatedData = data?.data;

      for (let i = 0; i < updatedData.length; i++) {
        if (updatedData[i].status === "FAILED") {
          showToast(
            "error",
            `please select different ${(i = 0
              ? "Departure"
              : "Arrival")} flight`,
          );
          return;
        }
      }

      // 3) Summation logic
      const oldTotal = oldPrices.reduce((acc, price) => acc + price, 0);
      let newTotal = 0;
      let isAnyPriceChanged = false;
      for (let i = 0; i < updatedData?.length; i++) {
        if (
          updatedData?.[i]?.status === "SUCCESS" &&
          updatedData?.[i]?.data?.isPriceChanged
        ) {
          isAnyPriceChanged = true;
          newTotal += updatedData?.[i]?.data?.fare?.offeredFareRoundedOff; // or data[i].newPrice
        } else {
          // if not changed, keep old
          newTotal += oldPrices[i];
        }
      }

      // 4) If there's a difference => call your popup once
      if (isAnyPriceChanged && newTotal !== oldTotal) {
        openFlightPricePopup(oldTotal, newTotal);
      }

      let ssrpayload = [
        axios
          .post(`${config.FLIGHTS_BOOKING_SSR}`, {
            qTraceId: flightsResponse.qTraceId,
            ssrReqModel: {
              endUserIp: storedUserIp === "undefined" ? null : storedUserIp,
              resultIndex: resultIndexes[0],
            },
          })
          .catch((error) => {
            console.error("Error fetching SSR:", error);
            return null;
          }),
      ];
      if (resultIndexes.length == 2) {
        ssrpayload.push(
          axios
            .post(`${config.FLIGHTS_BOOKING_SSR}`, {
              qTraceId: flightsResponse.qTraceId,
              ssrReqModel: {
                endUserIp: storedUserIp === "undefined" ? null : storedUserIp,
                resultIndex: resultIndexes[1],
              },
            })
            .catch((error) => {
              console.error("Error fetching SSR:", error);
              return null;
            }),
        );
      }
      const [ssrOutBound, ssrInBound] = await Promise.all([...ssrpayload]);
      let ssrList = ssrInBound
        ? [ssrOutBound, ssrInBound]
        : ssrOutBound
          ? [ssrOutBound]
          : [];
      let flightData = {
        fareQuote: data,
        ssrData: ssrList,
        // countryData:countryData,
        qTraceId: qTraceId,
        adults: flightsRequest?.searchReqData?.adultCount,
        child: flightsRequest?.searchReqData?.childCount,
        infant: flightsRequest?.searchReqData?.infantCount,
        journeyType: flightsRequest?.searchReqData?.journeyType,
        resultIndexes: resultIndexes,
        request: flightsRequest,
        isInternationalFlight: !flightsResponse?.isDomestic,
      };
      setTabSpecificData(
        "selectedFlightDataCorporate",
        JSON.stringify(flightData),
      );
      removeTabSpecificData("reviewDataCorporate");
      router.push("/bookings/review");
      // return data;
    } catch (error) {
      console.log(error);
      throw error;
    }
  };

  const handleClick = (id, criterion, index) => {
    // Create a new copy of rotatedIcons
    let updatedIcons = [...rotatedIcons];

    // Update the selected icon for the current index
    updatedIcons[index] = updatedIcons[index].includes(id) ? [] : [id];

    // Update the state for selected index and rotated icons
    setSelectedFilterIndex(index);
    setRotatedIcons(updatedIcons);

    // Create a new copy of sortingCriteria
    let updatedSortingCriteria = [...sortingCriteria];

    // Update the sorting criteria for the current index
    updatedSortingCriteria[index] = {
      criteria: criterion,
      order: updatedIcons[index].includes(id) ? "desc" : "asc",
    };

    // Update the sorting criteria state
    setSortingCriteria(updatedSortingCriteria);
  };

  const sortFlights = (flights) => {
    const sortedFlights = [...flights];
    if (sortingCriteria) {
      const flightsSorted = sortedFlights.map((sortFlights, index) => {
        const sortedResults = sortFlights.flights.sort((a, b) => {
          const order = sortingCriteria?.[index]?.order;

          switch (sortingCriteria?.[index]?.criteria) {
            case "price":
              const priceA = a.fare.offeredFareRoundedOff;
              const priceB = b.fare.offeredFareRoundedOff;
              return order === "asc" ? priceA - priceB : priceB - priceA;

            case "duration":
              const durationA = a.segments[0].journeyDuration;
              const durationB = b.segments[0].journeyDuration;
              return order === "asc"
                ? durationA - durationB
                : durationB - durationA;

            case "arrival":
              const arrivalA = new Date(
                a.segments[0].segment[a.segments[0].segment.length - 1]
                  .destination.arrTime,
              );
              const arrivalB = new Date(
                b.segments[0].segment[b.segments[0].segment.length - 1]
                  .destination.arrTime,
              );
              return order === "asc"
                ? arrivalA - arrivalB
                : arrivalB - arrivalA;

            case "departure":
              const departureA = new Date(
                a.segments[0].segment[0].origin.depTime,
              );
              const departureB = new Date(
                b.segments[0].segment[0].origin.depTime,
              );
              return order === "asc"
                ? departureA - departureB
                : departureB - departureA;

            default:
              return 0;
          }
        });

        return {
          ...sortFlights,
          flights: sortedResults,
        };
      });

      return flightsSorted;
    }
  };

  const isInsufficientLayover = useMemo(() => {
    if (
      flightsRequest?.searchReqData?.journeyType !== "2" ||
      flightsSelected.length < 2
    )
      return false;

    const outbound = flightsSelected?.[0];
    const inbound = flightsSelected?.[1];
    console.log("outbounddddd", outbound);
    console.log("innnnnnnnbounddddd", inbound);

    if (
      !outbound?.segments?.[0]?.segment?.length ||
      !inbound?.segments?.[0]?.segment?.length
    ) {
      console.warn("Invalid flight segments for layover calculation");
      return false;
    }

    try {
      const outboundLastSegment =
        outbound.segments[0].segment[outbound.segments[0].segment.length - 1];
      const inboundFirstSegment = inbound.segments[0].segment[0];

      // Extract arrival and departure times
      const outboundArrivalTime = new Date(
        outboundLastSegment?.destination?.arrTime,
      );
      const inboundDepartureTime = new Date(
        inboundFirstSegment?.origin?.depTime,
      );

      console.log("outboundArrivalTime", outboundArrivalTime);
      console.log("inboundDepartureTime", inboundDepartureTime);

      if (isNaN(outboundArrivalTime) || isNaN(inboundDepartureTime)) {
        console.warn("Invalid date format for layover calculation");
        return false;
      }

      // Calculate time difference in hours
      const diffMs = inboundDepartureTime - outboundArrivalTime;
      const diffHours = diffMs / (1000 * 60 * 60);

      // Check if layover is insufficient (less than or equal to 2 hours)
      return diffHours <= 2;
    } catch (error) {
      console.error("Error calculating layover time:", error);
      return false;
    }
  }, [flightsSelected, flightsRequest]);

  const LayoverTooltip = () => (
    <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-gray-800 text-white text-sm rounded-md shadow-lg px-4 py-7 z-[1000]">
      The layover time between the arrival of the outbound flight and the
      departure of the return flight must be more than 2 hours.
    </div>
  );

  const ErrorMessage = ({ error }) => (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
        <div className="mb-6">
          <svg
            className="mx-auto h-12 w-12 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0112 15c-2.485 0-4.773-.748-6.491-2.03m2.448-8.954A7.962 7.962 0 0112 3c2.485 0 4.773.748 6.491 2.03M15 11.172a4 4 0 00-5.656 0"
            />
          </svg>
        </div>

        <h3 className="text-lg font-medium text-gray-900 mb-2">
          {error.title}
        </h3>

        <p className="text-gray-600 mb-6">{error.message}</p>

        <button
          onClick={() => router.push(error.actionUrl)}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
        >
          {error.actionText}
        </button>
      </div>
    </div>
  );

  if (isLoadingData) {
    return <FlightListingSkeleton />;
  }

  // 2. Invalid or missing storage data
  if (!hasValidData && dataError) {
    return <ErrorMessage error={dataError} />;
  }

  const currentSegmentIndex =
    flightsRequest?.searchReqData?.journeyType === "2"
      ? selectedIndex
      : activeSegment;

  // Check if filters are applied for this segment
  const hasFiltersApplied = areFiltersApplied(
    selectedDesktopFilters,
    currentSegmentIndex,
  );

  return (
    <>
      <Head>
        <title>Flight Listing</title>
      </Head>
      <div>
        <GoToTopButton />
        {(isDropdownVisible || isFiltersOpen) && (
          <div
            onClick={
              isDropdownVisible || isFiltersOpen ? handleDropdownClick : null
            }
            className="fixed inset-0 bg-black opacity-40 z-[9999999] cursor-pointer"
          ></div>
        )}
        <div className="border-b w-full z-10 bg-white">
          <Header />
        </div>
        {!isDropdownVisible && (
          <div className="hidden sm:block py-1 pb-2 px-4 bg-[#D9D9D940] bg-blur backdrop-blur-md sticky top-0 w-full z-30">
            <FlightNavigation
              updateFlights={updateFlightsResponse}
              toggleDropdown={toggleDropdown}
              isDropdownVisible={isDropdownVisible}
              setIsDropdownVisible={setIsDropdownVisible}
              searchReqData={flightsRequest}
              setParentLoader={setSearchBtnLoader}
              multicityFlightsResponse={multicityFlightsResponse}
              flightsResponse={flightsResponse}
            />
          </div>
        )}
        {/* modify section for mobile in listing */}
        <div
          ref={mobileNavRef}
          className="flex justify-between items-center sm:hidden px-3 py-3 sticky top-0 z-[99999] w-full bg-[#f6f6f6] shadow-md bg-gradient-to-r from-[#16A2B6] via-[#16A2B6] to-[#041E22]"
        >
          <div className="flex items-center gap-2">
            <div>
              <FontAwesomeIcon
                icon={faArrowLeft}
                size="lg"
                className="text-white"
                onClick={() => window.history.back()}
              />
            </div>

            {flightsResponse &&
              flightsResponse.flightsResults.map((flightMap, wayindex) => {
                if (flightsRequest?.searchReqData?.journeyType === "2") {
                  if (
                    (activeTab === "departure" && wayindex !== 0) ||
                    (activeTab === "return" && wayindex !== 1) ||
                    flightsRequest?.searchReqData?.journeyType !== "2"
                  ) {
                    return null;
                  }
                }
                const getFlightInfoFromRequest = (segmentIndex) => {
                  const journeyType =
                    flightsRequest?.searchReqData?.journeyType;

                  if (journeyType === "3") {
                    // Multi-city: get from multiCityDestinations array
                    const segment =
                      flightsRequest?.multiCityDestinations?.[segmentIndex];
                    if (!segment) {
                      return {
                        originCity: "",
                        destinationCity: "",
                      };
                    }

                    return {
                      originCity: segment.from?.label || segment.fromCity || "",
                      destinationCity:
                        segment.to?.label || segment.toCity || "",
                    };
                  } else if (journeyType === "2") {
                    // Round-trip: for departure use from->to, for return use to->from
                    if (segmentIndex === 0) {
                      // Departure segment
                      return {
                        originCity:
                          flightsRequest?.selectedFromCity?.label ||
                          flightsRequest?.fromCity ||
                          "",
                        destinationCity:
                          flightsRequest?.selectedToCity?.label ||
                          flightsRequest?.toCity ||
                          "",
                      };
                    } else {
                      // Return segment (reverse the cities)
                      return {
                        originCity:
                          flightsRequest?.selectedToCity?.label ||
                          flightsRequest?.toCity ||
                          "",
                        destinationCity:
                          flightsRequest?.selectedFromCity?.label ||
                          flightsRequest?.fromCity ||
                          "",
                      };
                    }
                  } else {
                    // One-way: use from->to
                    return {
                      originCity:
                        flightsRequest?.selectedFromCity?.label ||
                        flightsRequest?.fromCity ||
                        "",
                      destinationCity:
                        flightsRequest?.selectedToCity?.label ||
                        flightsRequest?.toCity ||
                        "",
                    };
                  }
                };

                const flightInfo = getFlightInfoFromRequest(
                  flightsRequest?.searchReqData?.journeyType === "3"
                    ? activeSegment
                    : wayindex,
                );
                const originCity = flightInfo.originCity;
                const destinationCity = flightInfo.destinationCity;

                return (
                  <div className="flex flex-col w-full" key={wayindex}>
                    <span className="text-sm sm:text-xl text-white text-nowrap font-bold">
                      {flightMap?.flights?.length > 0
                        ? `${flightMap?.flights?.length} Results Found`
                        : "No Results Found"}
                    </span>
                    <div className="flex gap-2 items-center text-xs max-w-full flex-wrap sm:text-sm text-white text-opacity-80 font-semibold">
                      {originCity}-{destinationCity} |{" "}
                      {formatDate(
                        flightsRequest?.searchReqData?.journeyType === "3"
                          ? flightsRequest?.searchReqData?.segments?.[
                              activeSegment
                            ]?.preferredDepartureTime
                          : flightsRequest?.searchReqData?.segments?.[wayindex]
                              ?.preferredDepartureTime,
                      )}{" "}
                      | {flightsRequest?.searchReqData?.adultCount}{" "}
                      {flightsRequest?.searchReqData?.adultCount > 1
                        ? "Adults"
                        : "Adult"}{" "}
                      | {flightsRequest?.searchReqData?.childCount}{" "}
                      {flightsRequest?.searchReqData?.childCount > 1
                        ? "children"
                        : "child"}
                      | {flightsRequest?.searchReqData?.infantCount}{" "}
                      {flightsRequest?.searchReqData?.infantCount > 1
                        ? "infants"
                        : "infant"}
                    </div>
                  </div>
                );
              })}
          </div>
          <div className="text-[#155EEF] bg-white rounded-md">
            <button
              onClick={() => setIsDropdownVisible(true)}
              className="p-2 text-sm px-4"
            >
              Modify
            </button>
          </div>
        </div>
        {/* Dropdown in OneWayList MOBILE VIEW */}
        {isDropdownVisible && (
          <div
            ref={dropdownRef}
            className="fixed top-[0rem] left-0 right-0 bg-white shadow-lg transition-all duration-300 h-fit z-[99999999] "
          >
            {/* Your dropdown content goes here */}
            <div className={style.mainContainer}>
              <div className="p-2 sm:p-5">
                <FlightNavigation
                  modalRef={modalRef}
                  updateFlights={updateFlightsResponse}
                  searchReqData={flightsRequest}
                  isDropdownVisible={isDropdownVisible}
                  toggleDropdown={toggleDropdown}
                  setIsDropdownVisible={setIsDropdownVisible}
                  setMulticityLoading={setMulticityLoading}
                  setParentLoader={setSearchBtnLoader}
                  multicityFlightsResponse={multicityFlightsResponse}
                />
              </div>
            </div>
          </div>
        )}
        {searchBtnLoader ? (
          <div className="mt-[0rem]">
            <FlightListingSkeleton />
          </div>
        ) : // ) : noResults ? (
        //   <div className="mt-[-4rem]">
        //     <NoFlights />
        //   </div>
        noResults ? (
          <div className="mt-[-4rem]">
            <NoFlights />
          </div>
        ) : isSearchFailed && searchError ? (
          <FlightSearchErrorMessage
            error={searchError}
            onNewSearch={() => {
              setIsSearchFailed(false);
              setSearchError(null);
            }}
          />
        ) : (
          <div className="px-2 py-2 2xl:mx-[8%]">
            <div className={`flex gap-3 justify-between`}>
              <div className="hidden sm:grid w-3/12 rounded-lg">
                <div className="block">
                  <div
                    className="sticky  backdrop-blur-md top-[140px]"
                    // style={{ top: `${stickyTop}px` }}
                  >
                    <Filters
                      isOpen={true}
                      onClose={() => {}}
                      filterData={filterData}
                      flightsResponse={flightsResponse.flightsResults}
                      setFlightsResponse={setFlightsResponse}
                      setMulticityFlightsResponse={setMulticityFlightsResponse}
                      multicityFlightsResponse={multicityFlightsResponse}
                      filterIndex={activeSegment}
                      activeSegment={activeSegment}
                      selectedFilters={selectedDesktopFilters}
                      setSelectedFilters={setSelectedDesktopFilters}
                      flightsSelected={flightsSelected}
                      setFlightsSelected={setflightsSelected}
                      flightsRequest={flightsRequest}
                      type="all"
                      sortingCriteria={sortingCriteria}
                      sortFlights={sortFlights}
                      response={flightsResponse}
                      activeTab={activeTab} // Add this prop
                      handleTabChange={handleTabChange}
                      selectedIndex={selectedIndex}
                      setSelectedIndex={setSelectedIndex}
                      setflightsSelected={setflightsSelected}
                      isInternationalFlight={
                        regionId === FLIGHT_BUDGET_INTERNATIONAL_ID
                      }
                      fetchFlightsWithRefId={fetchFlightsWithRefId}
                      setMulticityResponse={setMulticityResponse}
                      setFilterData={setFilterData}
                      isFooterNear={isFooterNear}
                    />
                  </div>
                </div>
              </div>
              {isFiltersOpen && (
                <div className="block fixed bottom-0 left-0 pb-3 h-[70vh] sm:hidden w-full bg-white z-[999999999999999] rounded-lg">
                  <Filters
                    isOpen={true}
                    onClose={() => {}}
                    filterData={filterData}
                    flightsResponse={flightsResponse.flightsResults}
                    setFlightsResponse={setFlightsResponse}
                    setMulticityFlightsResponse={setMulticityFlightsResponse}
                    multicityFlightsResponse={multicityFlightsResponse}
                    filterIndex={activeSegment}
                    activeSegment={activeSegment}
                    selectedFilters={selectedDesktopFilters}
                    setSelectedFilters={setSelectedDesktopFilters}
                    flightsSelected={flightsSelected}
                    setFlightsSelected={setflightsSelected}
                    flightsRequest={flightsRequest}
                    type="all"
                    sortingCriteria={sortingCriteria}
                    sortFlights={sortFlights}
                    response={flightsResponse}
                    activeTab={activeTab} // Add this prop
                    handleTabChange={handleTabChange}
                    selectedIndex={selectedIndex}
                    setSelectedIndex={setSelectedIndex}
                    isInternationalFlight={
                      regionId === FLIGHT_BUDGET_INTERNATIONAL_ID
                    }
                    fetchFlightsWithRefId={fetchFlightsWithRefId}
                    setMulticityResponse={setMulticityResponse}
                    setFilterData={setFilterData}
                  />
                </div>
              )}

              <div className="w-full sm:w-9/12">
                <div className="flex items-center gap-3 max-w-screen overflow-x-scroll hide-scrollbar">
                  {flightsRequest?.searchReqData?.journeyType === "3" &&
                    flightsRequest?.multiCityDestinations?.map(
                      (segment, index) => {
                        const originCity =
                          segment.from?.label || segment.fromCity || "";
                        const destinationCity =
                          segment.to?.label || segment.toCity || "";

                        return (
                          <div
                            key={index}
                            className={`flex text-xs sm:text-base items-center p-2 rounded-md gap-1 peer cursor-pointer ${
                              activeSegment === index
                                ? "bg-[#155EEF] text-white"
                                : "text-[#155EEF] border-[1px] border-[#155EEF]"
                            }`}
                            onClick={() => handleSegmentChange(index)}
                          >
                            <div>{originCity}</div>
                            <FontAwesomeIcon icon={faRightLong} />
                            <div>{destinationCity}</div>
                          </div>
                        );
                      },
                    )}
                </div>
                {/* twoway toggles */}
                {flightsRequest?.searchReqData?.journeyType === "2" && (
                  <div className="flex gap-2">
                    <button
                      className={`px-4 text-xs py-2 w-1/2 rounded-md transition-colors ${
                        activeTab === "departure"
                          ? "bg-[#155EEF] text-white"
                          : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                      }`}
                      onClick={() => {
                        handleTabChange("departure");
                        setSelectedIndex(0);
                      }}
                    >
                      {flightsRequest?.selectedFromCity?.label ||
                        flightsRequest?.fromCity ||
                        ""}
                      {" - "}
                      {flightsRequest?.selectedToCity?.label ||
                        flightsRequest?.toCity ||
                        ""}
                    </button>

                    <button
                      className={`px-4 text-xs py-2 w-1/2 rounded-md transition-colors ${
                        activeTab === "return"
                          ? "bg-[#155EEF] text-white"
                          : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                      }`}
                      onClick={() => {
                        handleTabChange("return");
                        setSelectedIndex(1);
                      }}
                    >
                      {flightsRequest?.selectedToCity?.label ||
                        flightsRequest?.toCity ||
                        ""}
                      {" - "}
                      {flightsRequest?.selectedFromCity?.label ||
                        flightsRequest?.fromCity ||
                        ""}
                    </button>
                  </div>
                )}
                {/* twoway toggles */}

                <div className="hidden sm:flex gap-5 mt-2 items-center justify-between">
                  {flightsResponse.flightsResults.map((flightMap, wayindex) => {
                    if (flightsRequest?.searchReqData?.journeyType === "2") {
                      // Added the tab condition check here
                      if (
                        (activeTab === "departure" && wayindex !== 0) ||
                        (activeTab === "return" && wayindex !== 1)
                        // ||
                        // flightsRequest?.searchReqData?.journeyType !== "2"
                      ) {
                        return null;
                      }
                    }
                    // Second check: For multi-city, only show header for active segment
                    // if (
                    //   flightsRequest?.searchReqData?.journeyType === "3"
                    // ) {
                    //   if (wayindex !== activeSegment) {
                    //     return null;
                    //   }
                    // }
                    // Third check: For one-way, only show first segment
                    if (flightsRequest?.searchReqData?.journeyType === "1") {
                      if (wayindex !== 0) {
                        return null;
                      }
                    }

                    const getFlightInfoFromRequest = (segmentIndex) => {
                      const journeyType =
                        flightsRequest?.searchReqData?.journeyType;

                      if (journeyType === "3") {
                        // Multi-city: get from multiCityDestinations array
                        const segment =
                          flightsRequest?.multiCityDestinations?.[segmentIndex];
                        if (!segment) {
                          return {
                            originCity: "",
                            destinationCity: "",
                          };
                        }

                        return {
                          originCity:
                            segment.from?.label || segment.fromCity || "",
                          destinationCity:
                            segment.to?.label || segment.toCity || "",
                        };
                      } else if (journeyType === "2") {
                        // Round-trip: for departure use from->to, for return use to->from
                        if (segmentIndex === 0) {
                          // Departure segment
                          return {
                            originCity:
                              flightsRequest?.selectedFromCity?.label ||
                              flightsRequest?.fromCity ||
                              "",
                            destinationCity:
                              flightsRequest?.selectedToCity?.label ||
                              flightsRequest?.toCity ||
                              "",
                          };
                        } else {
                          // Return segment (reverse the cities)
                          return {
                            originCity:
                              flightsRequest?.selectedToCity?.label ||
                              flightsRequest?.toCity ||
                              "",
                            destinationCity:
                              flightsRequest?.selectedFromCity?.label ||
                              flightsRequest?.fromCity ||
                              "",
                          };
                        }
                      } else {
                        // One-way: use from->to
                        return {
                          originCity:
                            flightsRequest?.selectedFromCity?.label ||
                            flightsRequest?.fromCity ||
                            "",
                          destinationCity:
                            flightsRequest?.selectedToCity?.label ||
                            flightsRequest?.toCity ||
                            "",
                        };
                      }
                    };

                    const flightInfo = getFlightInfoFromRequest(
                      flightsRequest?.searchReqData?.journeyType === "3"
                        ? activeSegment
                        : wayindex,
                    );
                    const originCity = flightInfo.originCity;
                    const destinationCity = flightInfo.destinationCity;

                    return (
                      <div
                        className="flex justify-between w-full"
                        key={wayindex}
                      >
                        <div className="flex flex-col">
                          <span className="text-sm sm:text-xl font-bold">
                            {flightMap?.flights?.length > 0
                              ? `${flightMap?.flights?.length} Results Found`
                              : "No Results Found"}
                          </span>
                          <div className="flex gap-2 items-center justify-between text-xs text-nowrap sm:text-sm text-[#171A19] text-opacity-80 font-semibold">
                            {originCity}-{destinationCity} |{" "}
                            {formatDate(
                              flightsRequest?.searchReqData?.journeyType === "3"
                                ? flightsRequest?.searchReqData?.segments?.[
                                    activeSegment
                                  ]?.preferredDepartureTime
                                : flightsRequest?.searchReqData?.segments?.[
                                    wayindex
                                  ]?.preferredDepartureTime,
                            )}{" "}
                            | {flightsRequest?.searchReqData?.adultCount}{" "}
                            {flightsRequest?.searchReqData?.adultCount > 1
                              ? "Adults"
                              : "Adult"}
                            | {flightsRequest?.searchReqData?.childCount}{" "}
                            {flightsRequest?.searchReqData?.childCount > 1
                              ? "children"
                              : "child"}
                            | {flightsRequest?.searchReqData?.infantCount}{" "}
                            {flightsRequest?.searchReqData?.infantCount > 1
                              ? "infants"
                              : "infant"}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* sorting options */}
                {/* <div className="sticky top-[90px] sm:top-[140px] z-30  backdrop-blur-md"> */}
                <div
                  className="sticky  backdrop-blur-md top-[85px] sm:top-[140px] z-[9]"
                  // style={{ top: `${stickyTop}px` }}
                >
                  <div className="flex justify-between gap-2">
                    {flightsResponse.flightsResults.map((flightMap, index) => {
                      // if (flightMap?.flights?.length > 0)
                      //   if (
                      //     flightsRequest?.searchReqData?.journeyType === "2"
                      //   ) {
                      //     // Added the tab condition check here
                      //     if (
                      //       (activeTab === "departure" && index !== 0) ||
                      //       (activeTab === "return" && index !== 1) ||
                      //       flightsRequest?.searchReqData?.journeyType !== "2"
                      //     ) {
                      //       return null;
                      //     }
                      //   }
                      // First check: Only process segments with flights
                      if (!flightMap?.flights?.length) {
                        return null;
                      }

                      // Second check: For round-trip, only show buttons for the active tab
                      if (flightsRequest?.searchReqData?.journeyType === "2") {
                        if (
                          (activeTab === "departure" && index !== 0) ||
                          (activeTab === "return" && index !== 1)
                        ) {
                          return null;
                        }
                      }
                      // Third check: For multi-city, only show buttons for active segment
                      // if (flightsRequest?.searchReqData?.journeyType === "3") {
                      //   if (index !== activeSegment) {
                      //     return null;
                      //   }
                      // }

                      return (
                        <div
                          className="bg-[#F2F3F399] p-2 pt-2 pb-2 mt-2 rounded-full flex justify-between min-w-1/2 w-full "
                          key={index}
                        >
                          {/* button for filters in mobile ui */}
                          <button
                            className={`${style.toggleButtons} ${
                              style.hiddenFilter
                            } ${hasFiltersApplied ? style.activeButtons : ""}`}
                            onClick={() => setIsFiltersOpen(!isFiltersOpen)}
                          >
                            {" "}
                            Filters
                            <FontAwesomeIcon
                              icon={faSliders}
                              className={`${style.arrowDesktop} ${
                                hasFiltersApplied ? style.rotated : ""
                              }`}
                              id="icon1"
                            />
                          </button>
                          <button
                            className={`${style.toggleButtons} ${
                              rotatedIcons[index].includes("icon2")
                                ? style.activeButtons
                                : ""
                            }`}
                            onClick={() => handleClick("icon2", "price", index)}
                          >
                            {" "}
                            Price
                            <FontAwesomeIcon
                              icon={faChevronDown}
                              className={`${style.arrowDesktop} ${
                                rotatedIcons[index].includes("icon2")
                                  ? style.rotated
                                  : ""
                              }`}
                              id="icon2"
                            />
                          </button>
                          <button
                            className={`${style.toggleButtons} ${
                              rotatedIcons[index].includes("icon3")
                                ? style.activeButtons
                                : ""
                            }`}
                            onClick={() =>
                              handleClick("icon3", "departure", index)
                            }
                          >
                            Departure
                            <FontAwesomeIcon
                              icon={faChevronDown}
                              className={`${style.arrowDesktop} ${
                                rotatedIcons[index].includes("icon3")
                                  ? style.rotated
                                  : ""
                              }`}
                              id="icon3"
                            />
                          </button>
                          <button
                            className={`${style.toggleButtons} ${
                              rotatedIcons[index].includes("icon4")
                                ? style.activeButtons
                                : ""
                            }`}
                            onClick={() =>
                              handleClick("icon4", "arrival", index)
                            }
                          >
                            Arrival
                            <FontAwesomeIcon
                              icon={faChevronDown}
                              className={`${style.arrowDesktop} ${
                                rotatedIcons[index].includes("icon4")
                                  ? style.rotated
                                  : ""
                              }`}
                              id="icon4"
                            />
                          </button>
                          <button
                            className={`${style.toggleButtons} ${
                              rotatedIcons[index].includes("icon5")
                                ? style.activeButtons
                                : ""
                            }`}
                            onClick={() =>
                              handleClick("icon5", "duration", index)
                            }
                          >
                            Duration
                            <FontAwesomeIcon
                              icon={faChevronDown}
                              className={`${style.arrowDesktop} ${
                                rotatedIcons[index].includes("icon5")
                                  ? style.rotated
                                  : ""
                              }`}
                              id="icon5"
                            />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
                <div className="p-2 mt-1 rounded-lg">
                  {flightsResponse.flightsResults[0].flights.length > 0 ||
                  flightsRequest?.searchReqData?.journeyType === "2" ? (
                    <div className="flex gap-0 w-full">
                      {flightsResponse.flightsResults.map(
                        (flightMap, wayindex) => {
                          // Added the tab condition check here
                          if (
                            flightsRequest?.searchReqData?.journeyType === "2"
                          ) {
                            if (
                              (activeTab === "departure" && wayindex !== 0) ||
                              (activeTab === "return" && wayindex !== 1) ||
                              flightsRequest?.searchReqData?.journeyType !== "2"
                            ) {
                              return null;
                            }
                          }

                          const hasNoResults = flightMap?.flights?.length === 0;

                          // Show filter message only if filters are applied and no results
                          if (hasNoResults) {
                            return (
                              <div key={wayindex} className="w-full">
                                {hasFiltersApplied && (
                                  <FilterNoResultsMessage
                                    onOpenFilters={() => setIsFiltersOpen(true)}
                                  />
                                )}
                              </div>
                            );
                          }

                          return (
                            <div
                              className={
                                flightsRequest?.searchReqData?.journeyType ===
                                "2"
                                  ? style.oneway
                                  : style.oneway1
                              }
                              key={wayindex}
                            >
                              <div
                                className="flex flex-col w-full h-full"
                                key={wayindex}
                              >
                                <OneWayList
                                  setFlightsResponse={setFlightsResponse}
                                  flightsSelected={flightsSelected}
                                  setflightsSelected={setflightsSelected}
                                  fetchFlightsWithRefId={fetchFlightsWithRefId}
                                  wayindex={wayindex}
                                  flightsResponse={flightsResponse}
                                  flightsRequest={flightsRequest}
                                  flightMap={flightMap}
                                  updateFlights={updateFlightsResponse}
                                  journeyType={
                                    flightsRequest?.searchReqData?.journeyType
                                  }
                                  handleSelectButtonClick={
                                    handleSelectButtonClick
                                  }
                                  multiCitySelectedResultIndex={
                                    flightsSelected[activeSegment]?.resultIndex
                                  }
                                  activeSegment={activeSegment}
                                  searchReqData={flightsRequest}
                                  shareData={shareData}
                                  setShareData={setShareData}
                                  isBookingLoading={isBookingLoading}
                                  loaderIndex={loaderIndex}
                                  setLoaderIndex={setLoaderIndex}
                                  whatsAppShareLimit={WHATSAPP_SHARE_LIMIT}
                                  selectedIndex={
                                    segmentSelectedIndices[wayindex] || 0
                                  }
                                  setSelectedIndex={(index) =>
                                    setSegmentSelectedIndices((prev) => ({
                                      ...prev,
                                      [wayindex]: index,
                                    }))
                                  }
                                  apiCallTracker={apiCallTracker}
                                  viewPriceFlightIndex={
                                    viewPriceFlightIndexes[wayindex]
                                  }
                                  onViewPriceToggle={(flightIndex) =>
                                    handleViewPriceToggle(wayindex, flightIndex)
                                  }
                                />
                              </div>
                            </div>
                          );
                        },
                      )}
                    </div>
                  ) : (
                    flightsRequest?.searchReqData?.journeyType !== "2" && (
                      // <div>
                      //   <NoFlights />
                      // </div>
                      <div>
                        {areFiltersApplied(
                          selectedDesktopFilters,
                          activeSegment,
                        ) ? (
                          <FilterNoResultsMessage
                            onOpenFilters={() => setIsFiltersOpen(true)}
                          />
                        ) : (
                          // <NoFlights />
                          <FilterNoResultsMessage
                            onOpenFilters={() => setIsFiltersOpen(true)}
                          />
                        )}
                      </div>
                    )
                  )}
                </div>
              </div>
            </div>
            {flightsRequest?.searchReqData?.journeyType !== "1" &&
              flightsSelected.filter((flight) => flight && flight.segments)
                .length > 1 &&
              !isOpenSideSheet && (
                <div className="fixed w-full flex gap-2 sm:gap-0 flex-col sm:flex-row justify-between bottom-0 left-0 py-2 sm:py-4 p-4 z-[999999] bg-[#f6f6f6] shadow-md bg-gradient-to-r from-[#16A2B6] via-[#16A2B6] to-[#041E22]">
                  <div className="relative flex w-full sm:w-4/6">
                    <div
                      className="flex px-2 w-full justify-start overflow-x-scroll hide-scrollbar"
                      ref={scrollRef}
                    >
                      {flightsSelected
                        .filter((flight) => flight && flight.segments) // Filter out null/invalid flights
                        .map((flight, index) => {
                          if (flight && flight.segments) {
                            ////console.log("flight ",flight);
                            const segments = flight.segments[0].segment;
                            const origin = segments[0];
                            const destination =
                              segments.length > 1
                                ? segments[segments.length - 1]
                                : segments[0];
                            const journeyDuration =
                              flight.segments[0]?.journeyDuration;
                            const originCity =
                              flight?.segments?.[0]?.segment[0].origin.airport
                                .cityCode;
                            const destinationCity =
                              flight?.segments?.[0]?.segment[
                                flight?.segments?.[0]?.segment?.length - 1
                              ].destination.airport.cityCode;
                            const numOfDays = handleFlightDuration(
                              origin.origin.depTime,
                              destination.destination.arrTime,
                            );
                            const isLastItem =
                              index === flightsSelected.length - 1;
                            const flightNumber =
                              flight?.segments?.[0]?.segment[0]?.airline
                                ?.airlineCode +
                              "-" +
                              flight?.segments?.[0]?.segment[0]?.airline
                                ?.flightNumber;

                            return flightsRequest?.searchReqData
                              ?.journeyType === "2" &&
                              flightsResponse?.flightJourney === "domestic" ? (
                              <div
                                className={`text-white ${
                                  !isLastItem ? "border-r-[1px]" : ""
                                } mr-2 border-dashed pr-5 min-w-fit`}
                                key={index}
                              >
                                <div className="text-base font-semibold">
                                  Rs.{" "}
                                  {formatPrice(
                                    flight.fare.offeredFareRoundedOff,
                                  )}{" "}
                                  | {flightNumber}
                                </div>
                                <div className="flex text-xs gap-1 font-light">
                                  <div>
                                    {originCity} - {destinationCity} :{" "}
                                  </div>
                                  <div>{formatTime(origin.origin.depTime)}</div>
                                  -
                                  <div>
                                    {formatTime(
                                      destination.destination.arrTime,
                                    )}
                                    {numOfDays > 0 && (
                                      <span class="text-[9px] text-[#FFFFFF]">
                                        (+{numOfDays}D)
                                      </span>
                                    )}
                                  </div>
                                  |<div>{formatDuration(journeyDuration)}</div>
                                </div>
                              </div>
                            ) : (
                              <div
                                className={`text-white ${
                                  !isLastItem ? "border-r-[1px]" : ""
                                } mr-2 border-dashed pr-5 min-w-fit`}
                                key={index}
                              >
                                <div className="text-sm font-semibold">
                                  <div>
                                    {originCity} - {destinationCity} :{" "}
                                    {formatTime(origin.origin.depTime)}-
                                    {formatTime(
                                      destination.destination.arrTime,
                                    )}
                                    {numOfDays > 0 && (
                                      <span class="text-[9px] text-[#FFFFFF]">
                                        (+{numOfDays}D)
                                      </span>
                                    )}
                                  </div>
                                  <div className="flex text-xs gap-1 font-light">
                                    {flightNumber} |{" "}
                                    {formatDuration(journeyDuration)}
                                  </div>
                                  {/* |<div>{formatDuration(journeyDuration)}</div> */}
                                </div>
                              </div>
                            );
                          }
                        })}
                      {showScrollButtons && (
                        <>
                          <button
                            className="absolute left-[-1rem] top-1/2 transform -translate-y-1/2 bg-gray-400 text-white w-6 h-6 rounded-full"
                            onClick={() => scroll("left")}
                          >
                            <FontAwesomeIcon icon={faChevronLeft} size="xs" />
                          </button>
                          <button
                            className="absolute right-[-1rem] top-1/2 transform -translate-y-1/2 bg-gray-400 text-white w-6 h-6 rounded-full"
                            onClick={() => scroll("right")}
                          >
                            <FontAwesomeIcon icon={faChevronRight} size="xs" />
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                  <div className="flex justify-end px-2">
                    <div className="w-full flex px-2 gap-3 items-center justify-center">
                      <div className="text-white rounded-md px-2 min-w-fit sticky right-0 text-nowrap">
                        <div className="text-sm sm:text-base font-extrabold">
                          Rs. {formatPrice(totalAmount)}
                        </div>
                        <div className="flex text-xs gap-1 font-extrabold text-nowrap">
                          Total Trip Amount
                        </div>
                      </div>
                    </div>
                    <div className="w-full flex gap-3 items-center justify-center">
                      <button
                        className="w-fit p-2 px-4 bg-white text-xs sm:text-base text-[#16A2B6] flex items-center rounded-md"
                        onClick={handleOpenSideSheet}
                      >
                        <span>
                          <FontAwesomeIcon
                            icon={faWhatsapp}
                            className="mr-2 text-green-500"
                          />
                        </span>
                        Share
                      </button>
                      <div
                        className="relative"
                        onMouseEnter={() => {
                          // if (isOutOfPolicySendApproval) setShowTooltip(true);
                          if (isInsufficientLayover)
                            setShowLayoverTooltip(true);
                        }}
                        onMouseLeave={() => {
                          setShowTooltip(false);
                          setShowLayoverTooltip(false);
                        }}
                      >
                        <button
                          className={`w-full p-2 px-4 bg-white text-xs sm:text-base text-[#16A2B6] rounded-md flex items-center justify-center`}
                          onClick={handleProceed}
                          disabled={isInsufficientLayover}
                        >
                          {proceedBtnLoader ? (
                            <FontAwesomeIcon icon={faSpinner} spin />
                          ) : (
                            "Proceed"
                          )}
                        </button>
                        {/* {isOutOfPolicySendApproval && showTooltip && (
                                         <InPolicyTooltip />
                                       )} */}
                        {isInsufficientLayover && showLayoverTooltip && (
                          <LayoverTooltip />
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}
          </div>
        )}
      </div>

      {isOpenSideSheet && (
        <WhatsAppSideSheet
          isOpen={isOpenSideSheet}
          onClose={handleCloseSideSheet}
          flights={flightsSelected}
          setShareData={setflightsSelected}
          journeyDetails={flightsRequest}
          setParentSideSheet={setIsOpenSideSheet}
        />
      )}

      <div ref={footerRef}>
        <Footer2 />
      </div>
      {/* < Footer2  /> */}
    </>
  );
}
