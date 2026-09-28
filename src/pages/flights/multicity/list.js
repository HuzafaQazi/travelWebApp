import GoToTopButton from "@/components/gototopbutton/gototopbutton";
import Footer from "@/components/footer/footer";
import DesktopNavigation from "@/components/flights/desktopNavigation/desktopNavigation";
import FareDetails from "@/components/flights/fareDetails/fareDetails";
import FlightDetails from "@/components/flights/flightDetails/flightDetails";
import MulticitySideSheet from "@/components/flights/multicitySidesheet/multicitySidesheet";
import {
  faArrowLeft,
  faArrowRight,
  faSliders,
  faChevronDown,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import "bootstrap/dist/css/bootstrap.min.css";
import Image from "next/image";
import { useRouter } from "next/router";
import { useEffect, useRef, useState } from "react";
import "react-calendar/dist/Calendar.css";
import style from "./List.module.css";
import CommonHeader from "@/components/flights/commonHeader/commonHeader";
import B2CHeader from "@/components/flights/B2cHeader/Header";
import ResultNotFound from "@/components/flights/resultNotFound/resultNotFound";
import NavigationModify from "@/components/flights/navigationModify/navigationModify";
import loaderf from "../../../../public/img/flightload.gif";
import FiltersPop from "@/components/flights/filtersPopup/filtersPopup";
import {
  extractInboundFlightsIfInternational,
  fetchSSR,
  formatDateToDayMonth,
  formatDuration,
  formatPrice,
  formatTime,
  handleFlightDuration,
} from "../../../../utils/flights/twoway/helper";

import axios from "@/utils/axios/axios";
import config from "@/config";
import {
  getTabSpecificData,
  setTabSpecificData,
  removeTabSpecificData,
} from "@/utils/axios/axios";
import { fetchGetQuote } from "../../../../utils/flights/multicity/helpers";
import pako from "pako";

import { useLogin } from "@/store/context/LoginContext";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Link from "next/link";
import { logEvent } from "firebase/analytics";
import { analytics } from "../../../../utils/firebase";
import { useUserType } from "@/hooks/useUserType";
import Header from "@/components/corporate/auth/Header";
import Footer1 from "@/components/corporate/footerCorporate/footerCorporate";
import FlightLoader from "@/components/loader/FlightLoader";

export default function MulticityListing() {
  const [noResultsFlag, setNoResultsFlag] = useState(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const noResults = params.get("noResults");
      console.log("🎯 Initial URL check - noResults:", noResults);
      return noResults === "true";
    }
    return false;
  });
  const { openFlightPricePopup } = useLogin();
  const corporateUser = useUserType();
  const router = useRouter();
  const { noResults } = router.query;
  const [loading, setLoading] = useState(true);
  const [pageLoading, setPageLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("flightDetails");
  const [allDestinationsData, setAllDestinationsData] = useState([]);
  const [destinationData, setDestinationData] = useState([]);
  const [flightsRequest, setFlightsRequest] = useState([]);
  const [flightsResponse, setFlightsResponse] = useState([]);
  const [destinationIndex, setDestinationIndex] = useState(0);
  const [selectedDestinations, setSelectedDestinations] = useState([]);
  const [fareQuoteData, setFareQuoteData] = useState([]);
  const [fareDetailsData, setFareDetailsData] = useState([]);
  const [flightData, setflightData] = useState([]);
  const [selectedFilters, setSelectedFilters] = useState([
    {
      stops: [],
      airlines: [],
      layovers: [],
      destinations: [],
      arrivals: [],
      price: {},
      cabinClasses: [],
      carrier: [],
    },
  ]);
  const [sortingCriteria, setSortingCriteria] = useState([
    {
      criteria: "price",
      order: "asc",
    },
  ]);
  const [selectButtonLoader, setSelectButtonLoader] = useState(false);
  const [searchButtonDisabled, setSearchButtonDisabled] = useState(false);
  const [isToastVisible, setIsToastVisible] = useState(false);

  const [rotatedIcons, setRotatedIcons] = useState([]);
  const [destinationDetailsIndex, setDestinationDetailsIndex] = useState(0);
  const [selectedTravelers, setSelectedTravelers] = useState([]);
  const [isDropdownVisible, setIsDropdownVisible] = useState(false);
  const dropdownRef = useRef(null);
  const [bottomSheetCalenderOpen, setBottomSheetCalenderOpen] = useState(false);
  const [selectedToggle, setSelectedToggle] = useState(null);
  const [isBottomSheetOpen, setBottomSheetOpen] = useState(false);
  const [hoveredTimeBox, setHoveredTimeBox] = useState(null);
  const [value, setValue] = useState(50);
  const [showTooltip, setShowTooltip] = useState(false);
  const [isSideSheetRulesOpen, setIsSideSheetRulesOpen] = useState(false);
  const [isMulticitySideSheetOpen, setIsMulticitySideSheetOpen] =
    useState(false);
  const [activeIndex, setActiveIndex] = useState(0);

  const handleTravelerChange = (newTravelers) => {
    setSelectedTravelers(newTravelers);
  };

  const handleModifyClick = () => {
    setIsDropdownVisible(!isDropdownVisible);
    logEvent(analytics, "mc_modify_click", {});
  };

  const handleClickOutside = (event) => {
    if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
      setIsDropdownVisible(false);
    }
  };

  useEffect(() => {
    const getQueryParams = () => {
      // Method 1: From router.query (preferred when available)
      if (router.isReady && Object.keys(router.query).length > 0) {
        console.log("✅ Got query from router:", router.query);
        return router.query;
      }

      // Method 2: Parse from asPath (fallback)
      if (router.asPath && router.asPath.includes("?")) {
        const urlParams = new URLSearchParams(router.asPath.split("?")[1]);
        const query = {};
        for (const [key, value] of urlParams.entries()) {
          query[key] = value;
        }
        console.log("✅ Got query from asPath:", query);
        return query;
      }

      // Method 3: From window.location (client-side fallback)
      if (typeof window !== "undefined" && window.location.search) {
        const urlParams = new URLSearchParams(window.location.search);
        const query = {};
        for (const [key, value] of urlParams.entries()) {
          query[key] = value;
        }
        console.log("✅ Got query from window.location:", query);
        return query;
      }

      return {};
    };

    const query = getQueryParams();
    const { noResults, activeTab } = query;

    console.log("🎯 Final query params:", { noResults, activeTab });

    if (noResults) {
      setNoResultsFlag(noResults === "true" || noResults === "1");
    } else {
      setNoResultsFlag(false);
    }
  }, [router.isReady, router.query, router.asPath]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const compressedData = getTabSpecificData("multiCityFlightResponse");
        const encodedRequest = getTabSpecificData("multiCityFlightRequest");
        const encodedSelectedFlightData =
          getTabSpecificData("selectedFlightData");
        const selectedFlightSection = getTabSpecificData(
          "selectedFlightSection"
        );

        if (!(compressedData && encodedRequest)) {
          return router.replace("/");
        }

        if (compressedData && encodedRequest) {
          const numbersArray = compressedData.split(",").map(Number);
          const compressedUint8Array = new Uint8Array(numbersArray);
          const encodedResponse = pako.inflate(compressedUint8Array, {
            to: "string",
          });

          if (encodedResponse && encodedRequest) {
            const decodedResponse = JSON.parse(encodedResponse);
            const decodedRequest = JSON.parse(atob(encodedRequest));

            console.log(flightsResponse.qTraceId);
            console.log(decodedResponse);

            if (
              flightsResponse &&
              flightsResponse.qTraceId === decodedResponse.qTraceId
            ) {
              return;
            }

            setFlightsResponse(decodedResponse);
            setFlightsRequest(decodedRequest);
            setAllDestinationsData([...decodedResponse.flightsResults]);
            //   setDestinationData([...decodedResponse.flightsResults]);
            setDestinationData((prevDestinations) => {
              const updatedDestinations = [...prevDestinations];

              if (!updatedDestinations[0]) {
                updatedDestinations[0] = {};
              }
              updatedDestinations[0].filterData =
                decodedResponse.flightsResults[0].filterData;
              updatedDestinations[0].flights =
                decodedResponse.flightsResults[0].flights;
              updatedDestinations[0].selectedIndex = 0;
              updatedDestinations[0].selectedFlight =
                decodedResponse.flightsResults[0].flights[0];
              return updatedDestinations;
            });
            setSelectedDestinations([
              decodedResponse.flightsResults[0].flights[0],
            ]);

            let flightSegmentRefId =
              decodedResponse?.flightsResults?.[0]?.flights?.[0]?.segments?.[0]
                ?.flightSegmentRefId;
            const qTraceId = decodedResponse.qTraceId;
            for (
              let i = 0;
              i < decodedRequest.multiCityDestinations.length - 1;
              i++
            ) {
              const newIndex = i + 1;
              const nextSegmentData =
                await extractInboundFlightsIfInternational(
                  qTraceId,
                  flightSegmentRefId
                );
              if (nextSegmentData?.flights?.length > 0) {
                setAllDestinationsData((prevDestinations) => {
                  const updatedDestinations = [...prevDestinations];

                  if (!updatedDestinations[newIndex]) {
                    updatedDestinations[newIndex] = {};
                  }
                  updatedDestinations[newIndex] = nextSegmentData;
                  return updatedDestinations;
                });

                setDestinationData((prevDestinations) => {
                  const updatedDestinations = [...prevDestinations];

                  if (!updatedDestinations[newIndex]) {
                    updatedDestinations[newIndex] = {};
                  }

                  updatedDestinations[newIndex].filterData =
                    nextSegmentData.filterData;
                  updatedDestinations[newIndex].flights =
                    nextSegmentData.flights;
                  updatedDestinations[newIndex].selectedIndex = 0;
                  updatedDestinations[newIndex].selectedFlight =
                    nextSegmentData.flights[0];
                  return updatedDestinations;
                });

                flightSegmentRefId +=
                  nextSegmentData.flights[0].segments[0].flightSegmentRefId;
              }
            }
          }
        }

        if (encodedSelectedFlightData && selectedFlightSection) {
          // const decodedSelectedFlightData = JSON.parse(
          //   atob(encodedSelectedFlightData)
          // );
          const decodedSelectedFlightData = JSON.parse(
            decodeURIComponent(atob(encodedSelectedFlightData))
          );
          setflightData(decodedSelectedFlightData);
          setIsMulticitySideSheetOpen(true);
        }
      } catch (error) {
        console.log(error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const toggleBottomSheetCalender = (toggle) => {
    setBottomSheetCalenderOpen(!bottomSheetCalenderOpen);
    setSelectedToggle(toggle);
  };

  const handleToggleClick = (toggle) => {
    return () => toggleBottomSheetCalender(toggle);
  };

  const handleBottomSheetToggle = () => {
    setBottomSheetOpen(!isBottomSheetOpen);
    logEvent(analytics, "mc_filters_click", {});
  };

  const BottomSheetDetails = ({ isOpen, onClose, activeTab, index }) => {
    return (
      <div>
        {isOpen && <div className={style.backdrop} onClick={onClose}></div>}
        <div
          className={style.mainContainer}
          style={{
            display: isOpen ? "block" : "none",
          }}
        >
          <button onClick={onClose} className={style.backArrow}>
            <FontAwesomeIcon icon={faArrowLeft} />
          </button>
          {activeTab === "flightDetails" && isOpen && (
            <FlightDetails fareQuote={fareQuoteData} onClose={onClose} />
          )}
          {activeTab === "fareDetails" && isOpen && (
            <FareDetails
              onClose={onClose}
              fareDetails={fareDetailsData}
              index={index}
              destinationIndex={destinationIndex}
              setSelectedFlight={setDestinationData}
              selectedFlight={destinationData[destinationIndex].selectedFlight}
              qTraceId={flightsResponse.qTraceId}
              type="multicity"
            />
          )}
        </div>
      </div>
    );
  };

  const handleTabClick = (tab, flight, index, event) => {
    setDestinationDetailsIndex(index);
    setActiveTab(tab);
    setIsOpen(true);
    if (tab === "flightDetails") {
      setFareQuoteData(flight);
    } else if (tab === "fareDetails") {
      setFareDetailsData(flight);
    }
  };

  const handleCloseBottomSheet = () => {
    setIsOpen(false);
  };

  useEffect(() => {
    if (isBottomSheetOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isBottomSheetOpen]);

  useEffect(() => {
    if (isDropdownVisible) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isDropdownVisible]);

  const handleToggleTooltip = () => {
    setShowTooltip((prevShowTooltip) => !prevShowTooltip);
  };

  const handleButtonClick = (index) => {
    setDestinationIndex(index);

    const updatedSelectedFilters = [...selectedFilters];
    if (!updatedSelectedFilters[index]) {
      updatedSelectedFilters[index] = selectedFilters[0];
    }
    setSelectedFilters(updatedSelectedFilters);

    const updatedRotatedIcons = [...rotatedIcons];
    if (!updatedRotatedIcons[index]) {
      updatedRotatedIcons[index] = [];
    }
    setRotatedIcons(updatedRotatedIcons);

    const updatedSortingCriteria = [...sortingCriteria];
    if (!updatedSortingCriteria[index]) {
      updatedSortingCriteria[index] = sortingCriteria[0];
    }
    setSortingCriteria(updatedSortingCriteria);
  };

  useEffect(() => {
    if (isMulticitySideSheetOpen) {
      // Get current scroll position
      const scrollY = window.scrollY;

      // Lock the body scroll
      document.body.style.position = "fixed";
      document.body.style.top = `-${scrollY}px`;
      document.body.style.left = "0";
      document.body.style.right = "0";
      document.body.style.overflow = "hidden";

      // Store scroll position for later restoration
      document.body.setAttribute("data-scroll-lock", scrollY.toString());
    } else {
      // Get stored scroll position
      const scrollY = document.body.getAttribute("data-scroll-lock");

      // Restore body styles
      document.body.style.position = "";
      document.body.style.top = "";
      document.body.style.left = "";
      document.body.style.right = "";
      document.body.style.overflow = "";

      // Restore scroll position
      if (scrollY) {
        window.scrollTo(0, parseInt(scrollY));
        document.body.removeAttribute("data-scroll-lock");
      }
    }

    // Cleanup function
    return () => {
      const scrollY = document.body.getAttribute("data-scroll-lock");

      document.body.style.position = "";
      document.body.style.top = "";
      document.body.style.left = "";
      document.body.style.right = "";
      document.body.style.overflow = "";

      if (scrollY) {
        window.scrollTo(0, parseInt(scrollY));
        document.body.removeAttribute("data-scroll-lock");
      }
    };
  }, [isMulticitySideSheetOpen]);

  const handleSelectButtonClick = async (flight, index) => {
    try {
      // setIsMulticitySideSheetOpen(true);

      const updatedDestinationData = [...destinationData];
      updatedDestinationData[destinationIndex].selectedIndex = index;
      updatedDestinationData[destinationIndex].selectedFlight = flight;
      setDestinationData(updatedDestinationData);

      // Initialize flightSegmentRefId
      let flightSegmentRefId = "";

      // Concatenate flightSegmentRefId with previous segment IDs
      for (let i = 0; i < destinationIndex; i++) {
        flightSegmentRefId +=
          updatedDestinationData[i].selectedFlight.segments?.[0]
            ?.flightSegmentRefId || "";
      }

      if (
        destinationIndex !==
        flightsRequest.multiCityDestinations.length - 1
      ) {
        flightSegmentRefId += flight.segments?.[0]?.flightSegmentRefId;
        const qTraceId = flightsResponse.qTraceId;

        for (
          let i = destinationIndex;
          i < flightsRequest.multiCityDestinations.length - 1;
          i++
        ) {
          const newIndex = i + 1;
          const nextSegmentData = await extractInboundFlightsIfInternational(
            qTraceId,
            flightSegmentRefId
          );
          if (nextSegmentData?.flights?.length > 0) {
            setAllDestinationsData((prevDestinations) => {
              const updatedDestinations = [...prevDestinations];

              if (!updatedDestinations[newIndex]) {
                updatedDestinations[newIndex] = {};
              }
              updatedDestinations[newIndex] = nextSegmentData;
              return updatedDestinations;
            });

            setDestinationData((prevDestinations) => {
              const updatedDestinations = [...prevDestinations];

              if (!updatedDestinations[newIndex]) {
                updatedDestinations[newIndex] = {};
              }

              updatedDestinations[newIndex].filterData =
                nextSegmentData.filterData;
              updatedDestinations[newIndex].flights = nextSegmentData.flights;
              updatedDestinations[newIndex].selectedIndex = 0;
              updatedDestinations[newIndex].selectedFlight =
                nextSegmentData.flights[0];
              return updatedDestinations;
            });

            flightSegmentRefId +=
              nextSegmentData.flights[0].segments[0].flightSegmentRefId;
          }
        }
      }
      logEvent(analytics, "mc_flight_select", {});
    } catch (error) {
      console.log(error);
    }
  };

  const handleCloseMulticitySideSheet = () => {
    setIsMulticitySideSheetOpen(false);
    setSearchButtonDisabled(false);
  };

  const handleClick = (id, criterion) => {
    setRotatedIcons((prevIcons) => {
      const updatedIcons = [...prevIcons];
      if (prevIcons[destinationIndex] === id) {
        updatedIcons[destinationIndex] = null;
      } else {
        updatedIcons[destinationIndex] = id;
      }
      return updatedIcons;
    });

    setSortingCriteria((prevCriteria) => {
      const updatedCriteria = [...prevCriteria];
      const order =
        rotatedIcons[destinationIndex] &&
          rotatedIcons[destinationIndex].includes(id)
          ? "asc"
          : "desc";
      updatedCriteria[destinationIndex] = {
        criteria: criterion,
        order: order,
      };

      logEvent(analytics, "mc_sorting", {
        id: id,
        criterion: criterion,
        order: order,
      });
      return updatedCriteria;
    });
  };

  const sortFlights = (criterion, order, flights) => {
    // const sortedFlights = [...flightsResponse.flightsResults[0].flights];
    const sortedFlights = [...flights];
    const sortedResults = sortedFlights.sort((a, b) => {
      switch (criterion) {
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
            a.segments[0].segment[
              a.segments[0].segment.length - 1
            ].destination.arrTime
          );
          const arrivalB = new Date(
            b.segments[0].segment[
              b.segments[0].segment.length - 1
            ].destination.arrTime
          );
          return order === "asc" ? arrivalA - arrivalB : arrivalB - arrivalA;

        case "departure":
          const departureA = new Date(a.segments[0].segment[0].origin.depTime);
          const departureB = new Date(b.segments[0].segment[0].origin.depTime);
          return order === "asc"
            ? departureA - departureB
            : departureB - departureA;

        default:
          return 0;
      }
    });

    return sortedResults;
  };

  const updateFlightsResponse = async () => {
    try {
      setDestinationData([]);
      setDestinationIndex(0);

      const compressedData = getTabSpecificData("multiCityFlightResponse");
      const numbersArray = compressedData.split(",").map(Number);
      const compressedUint8Array = new Uint8Array(numbersArray);
      const encodedResponse = pako.inflate(compressedUint8Array, {
        to: "string",
      });

      const encodedRequest = getTabSpecificData("multiCityFlightRequest");

      if (encodedResponse && encodedRequest) {
        const decodedResponse = JSON.parse(encodedResponse);
        const decodedRequest = JSON.parse(atob(encodedRequest));

        setFlightsResponse(decodedResponse);
        setFlightsRequest(decodedRequest);
        setAllDestinationsData([...decodedResponse.flightsResults]);

        const initialDestination = {
          filterData: decodedResponse.flightsResults[0].filterData,
          flights: decodedResponse.flightsResults[0].flights,
          selectedIndex: 0,
          selectedFlight: decodedResponse.flightsResults[0].flights[0],
        };

        setDestinationData([initialDestination]);
        setSelectedDestinations([decodedResponse.flightsResults[0].flights[0]]);

        const qTraceId = decodedResponse.qTraceId;
        let flightSegmentRefId =
          decodedResponse?.flightsResults?.[0]?.flights?.[0]?.segments?.[0]
            ?.flightSegmentRefId;

        for (
          let i = 0;
          i < decodedRequest.multiCityDestinations.length - 1;
          i++
        ) {
          const nextSegmentData = await extractInboundFlightsIfInternational(
            qTraceId,
            flightSegmentRefId
          );

          if (nextSegmentData?.flights?.length > 0) {
            flightSegmentRefId +=
              nextSegmentData.flights[0].segments[0].flightSegmentRefId;

            const updatedDestination = {
              filterData: nextSegmentData.filterData,
              flights: nextSegmentData.flights,
              selectedIndex: 0,
              selectedFlight: nextSegmentData.flights[0],
            };

            setAllDestinationsData((prevDestinations) => [
              ...prevDestinations,
              nextSegmentData,
            ]);

            setDestinationData((prevDestinations) => [
              ...prevDestinations,
              updatedDestination,
            ]);
          }
        }

        setIsDropdownVisible(false);
        setSelectedFilters([
          {
            stops: [],
            airlines: [],
            layovers: [],
            destinations: [],
            arrivals: [],
            price: {},
            cabinClasses: [],
            carrier: [],
          },
        ]);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const handleProceed = async () => {
    setSearchButtonDisabled(true);
    setSelectButtonLoader(true);
    try {
      if (
        destinationData.length !== flightsRequest.multiCityDestinations.length
      ) {
        return toast("Select all the destinations");
      }
      const updatedDestinationData =
        destinationData[destinationData.length - 1].selectedFlight;

      const resultIndex = updatedDestinationData.resultIndex;
      const qTraceId = flightsResponse.qTraceId;

      const response = await fetchGetQuote(qTraceId, resultIndex);

      const fareQuoteResponse = response.data;
      if (fareQuoteResponse.isPriceChanged) {
        const oldPrice = updatedDestinationData.fare.offeredFareRoundedOff;
        const newPrice = fareQuoteResponse.fare.offeredFareRoundedOff;
        openFlightPricePopup(oldPrice, newPrice);
      }

      let response1;
      try {
        const ssrResponse = await fetchSSR(qTraceId, resultIndex);
        response1 = ssrResponse?.data;
      } catch (error) {
        setflightData((prev) => ({
          ...prev,
          ssrResponse: null,
        }));
      }

      const countryResponse = await axios.get(`${config.FLIGHTS_COUNTRY}`);
      const country = countryResponse?.data;

      const selectedFlightSection = getTabSpecificData("selectedFlightSection");
      if (selectedFlightSection) {
        removeTabSpecificData("selectedFlightSection");
      }

      setflightData({
        ...updatedDestinationData,
        qTraceId: flightsResponse.qTraceId,
        fareQuoteResponse: fareQuoteResponse,
        ssrResponse: response1?.data || null,
        countryResponse: country.data.Countries,
        flightsRequest: flightsRequest,
      });

      setIsMulticitySideSheetOpen(true);
      logEvent(analytics, "mc_proceed_click", {});
    } catch (error) {
      console.log(error);
      console.log(error);
      let errorMessage =
        error?.response?.data?.error?.errorMsg ||
        error?.response?.data?.error?.errorMessage?.[0]?.data ||
        "Something went wrong, please try after some time";
      if (!isToastVisible) {
        if (
          error?.response?.data?.error?.errorMessage?.[0]?.data ===
          "Session timeout!!"
          //  || error?.response?.data?.error?.errorMessage?.[0]?.data ===
          // "Fare Quote failed from the Supplier end. Please try again."
        ) {
          errorMessage =
            "Oops! Your session has expired. Please search Flights again.";
          setTimeout(() => {
            router.push("/flights/multicity/list");
          }, 2000);
          // return;// Redirect to a specific page
        } else if (
          error?.response?.data?.error?.errorMessage?.[0]?.data || error?.response?.error?.errorMessage?.[0]?.data ===
          "Fare Quote failed from the Supplier end. Please try again."
        ) {
          errorMessage = "Something went wrong, please select different flight";
          setTimeout(() => {
            router.push("/flights/multicity/list");
          }, 2000);
          setSearchButtonDisabled(false);
        }
        // toast("Oops! your session is expired. Please search Flights again.");
        toast(errorMessage);
        setIsToastVisible(true);

        // Reset the flag after a specific duration (e.g., 3 seconds)
        setTimeout(() => {
          setIsToastVisible(false);
        }, 6000);
      }
    } finally {
      setSelectButtonLoader(false);
      setSearchButtonDisabled(false);
    }
  };

  const handleSetSelectedFilters = (newFilters, destinationIndex) => {
    if (newFilters) {
      const updatedSelectedFilters = [...selectedFilters];
      updatedSelectedFilters[destinationIndex] = newFilters;
      setSelectedFilters(updatedSelectedFilters);
    }
  };

  if (loading) {
    return <FlightLoader isContentRequired={false} />;
  }

  return (
    <>
      {selectButtonLoader && <FlightLoader isContentRequired={false} />}
      <div
        className={`${style.flightListingPage} ${selectButtonLoader ? style.loading : ""
          }`}
      >
        {/* header flightslisting */}
        {!corporateUser ? (
          // <CommonHeader />
          <B2CHeader/>
        ) : (
          <div style={{ backgroundColor: "#ffffff" }}>
            <Header />
          </div>
        )}
        <div className={style.completeWithFooter}>
          {/* modify flightslisting info */}
          <div className={style.modifySection}>
            <div className={style.flightDetails}>
              <div>
                <Link href="/flights">
                  <FontAwesomeIcon icon={faArrowLeft} />
                </Link>
              </div>
              <div>
                <div className={style.sidedate}>
                  <div className={style.fromToDetails}>
                    {
                      flightsRequest.multiCityDestinations?.[destinationIndex]
                        ?.fromCity
                    }
                    {"-"}
                    {
                      flightsRequest.multiCityDestinations?.[destinationIndex]
                        ?.toCity
                    }
                  </div>
                  <div className={style.dateclassDetails}>
                    {formatDateToDayMonth(
                      flightsRequest.multiCityDestinations?.[destinationIndex]
                        ?.departureDate
                    )}{" "}
                  </div>
                </div>
                <div className={style.dateclassDetails}>
                  <div style={{ textWrap: "nowrap" }}>
                    {flightsRequest?.searchReqData?.adultCount} Adults |{" "}
                    {flightsRequest?.searchReqData?.childCount} Children |{" "}
                    {flightsRequest?.searchReqData?.infantCount} Infants |{" "}
                  </div>
                  {"Cabin Class - "}
                  {flightsRequest.FlightCabinClassText}
                </div>
              </div>
            </div>
            <div className={style.modifyButtonContainer}>
              <button
                className={style.modifyButton}
                onClick={handleModifyClick}
              >
                Modify
              </button>
            </div>
            {isDropdownVisible && (
              <>
                <div
                  className={style.backdrop}
                  onClick={handleModifyClick}
                ></div>
                <div className={style.dropdownModify}>
                  <NavigationModify
                    updateFlights={updateFlightsResponse}
                    defaultSelectedContent="multiWay"
                    setPageLoading={setPageLoading}
                    isRedirect={true}
                    selectedTravelers={selectedTravelers}
                    setSelectedTravelers={setSelectedTravelers}
                    handleTravelerChange={handleTravelerChange}
                  />
                </div>
              </>
            )}
          </div>

          {/* desktop navigation */}
          <div className={style.desktopNavbar} >
            <DesktopNavigation
              updateFlights={updateFlightsResponse}
              defaultSelectedContent="multiWay"
              setPageLoading={setPageLoading}
              isRedirect={true}
              selectedTravelers={selectedTravelers}
              setSearchButtonDisabled={setSearchButtonDisabled}
              setSelectedTravelers={setSelectedTravelers}
              handleTravelerChange={handleTravelerChange}
              isSideSheetOpen={isMulticitySideSheetOpen}
            />
          </div>

          {/* desktop complete content  */}
          <div>
            {pageLoading || loading ? (
              <div className={style.flightLoad}>
                <Image
                  src={loaderf}
                  alt="Loading..."
                  className={style.planeLoader}
                />
                <div className={style.loaderText}>
                  Buckle up!
                  <br />
                  <span className={style.loaderText1}>
                    {" "}
                    Jet-setting deals are coming!
                  </span>
                </div>
              </div>
            ) : !flightsResponse?.qTraceId || !flightsRequest ? (
              <FlightLoader isContentRequired={false} />
            ) : noResultsFlag ? (
              <div>
                <ResultNotFound />
              </div>
            ) : (
              <div className={style.completeContent}>
                {/* filters */}
                <div className={style.filterContentContainer}>
                  <FiltersPop
                    isOpen={true}
                    onClose={() => { }}
                    filterData={destinationData?.[destinationIndex]?.filterData}
                    flightsResponse={
                      allDestinationsData?.[destinationIndex]?.flights
                    }
                    flightsRequest={flightsRequest}
                    selectedFilters={selectedFilters[destinationIndex]}
                    setSelectedFilters={setSelectedFilters}
                    // setSelectedFilters={(newFilters) =>
                    //   handleSetSelectedFilters(newFilters, destinationIndex)
                    // }
                    wayType="multicity"
                    type="all"
                    destinationIndex={destinationIndex}
                    originalData={allDestinationsData}
                    sortingCriteria={sortingCriteria[destinationIndex]}
                    sortFlights={sortFlights}
                    setFlightsResponse={async (newValue) => {
                      if (newValue) {
                        const updatedDestinationData = [...destinationData];
                        let updatedSelectedFlight =
                          updatedDestinationData[destinationIndex]
                            .selectedFlight;
                        let updatedSelectedIndex =
                          updatedDestinationData[destinationIndex]
                            .selectedIndex;
                        updatedDestinationData[destinationIndex].flights =
                          newValue;
                        if (
                          newValue.length !==
                          allDestinationsData?.[destinationIndex]?.flights
                            ?.length
                        ) {
                          updatedSelectedFlight = newValue[0];
                          updatedSelectedIndex = 0;
                        }
                        updatedDestinationData[
                          destinationIndex
                        ].selectedFlight = updatedSelectedFlight;
                        updatedDestinationData[destinationIndex].selectedIndex =
                          updatedSelectedIndex;
                        setDestinationData(updatedDestinationData);

                        await handleSelectButtonClick(
                          updatedSelectedFlight,
                          updatedSelectedIndex
                        );
                      }
                    }}
                  />
                </div>
                <div className={style.desktopContentAlign}>
                  {/* multicity flights selectors scrollable */}

                  <div className={style.multicityToggles}>
                    {flightsRequest?.multiCityDestinations?.map(
                      (destination, index) => (
                        <div
                          key={index}
                          className={`${style.multiBtn} ${destinationIndex === index
                            ? style.selectedMultiBtn
                            : ""
                            }`}
                          onClick={() => handleButtonClick(index)}
                        >
                          <span> {destination.fromCity} </span>
                          <FontAwesomeIcon icon={faArrowRight} />
                          <span> {destination.toCity} </span>
                        </div>
                      )
                    )}
                  </div>
                  <div className={style.desktopTogglesLine}>
                    <div className={style.selectedCityDetails}>
                      <div>
                        <span>
                          {
                            flightsRequest?.multiCityDestinations?.[
                              destinationIndex
                            ]?.fromCity
                          }
                          -
                          {
                            flightsRequest?.multiCityDestinations?.[
                              destinationIndex
                            ]?.toCity
                          }
                        </span>
                      </div>
                      <div className={style.otherDetails}>
                        <span>
                          {" "}
                          {formatDateToDayMonth(
                            flightsRequest?.multiCityDestinations?.[
                              destinationIndex
                            ]?.departureDate
                          )}{" "}
                        </span>
                        |
                        {!corporateUser ? (
                          <>
                            <span>
                              {" "}
                              {
                                flightsRequest?.searchReqData?.adultCount
                              } Adult{" "}
                            </span>
                            |{" "}
                            <span>
                              {flightsRequest?.searchReqData?.childCount}{" "}
                              Children{" "}
                            </span>
                            |{" "}
                            <span>
                              {flightsRequest?.searchReqData?.infantCount}{" "}
                              Infants
                            </span>{" "}
                            |{" "}
                          </>
                        ) : (
                          <>
                            <span>
                              {" "}
                              {flightsRequest?.searchReqData?.adultCount}{" "}
                              Traveler{" "}
                            </span>
                            |{" "}
                          </>
                        )}
                        <span>
                          {" Cabin Class - "}{" "}
                          {flightsRequest.FlightCabinClassText}{" "}
                        </span>
                      </div>
                    </div>
                    <div className={style.allTogglesLine}>
                      <button
                        className={`${style.toggleButtons} ${style.desktopFilterHide}`}
                        onClick={handleBottomSheetToggle}
                      //   disabled={loadingSelect}
                      >
                        <FontAwesomeIcon icon={faSliders} />
                        Filters
                      </button>
                      <button
                        className={`${style.toggleButtons} ${rotatedIcons[destinationIndex] &&
                          rotatedIcons?.[destinationIndex]?.includes("icon1")
                          ? style.activeButtons
                          : ""
                          }`}
                        onClick={() => handleClick("icon1", "price")}
                      >
                        {" "}
                        Price
                        <FontAwesomeIcon
                          icon={faChevronDown}
                          className={`${style.arrowDesktop} ${rotatedIcons[destinationIndex] &&
                            rotatedIcons[destinationIndex].includes("icon1")
                            ? style.rotated
                            : ""
                            }`}
                          id="icon1"
                        />
                      </button>
                      <button
                        className={`${style.toggleButtons} ${rotatedIcons[destinationIndex] &&
                          rotatedIcons[destinationIndex].includes("icon2")
                          ? style.activeButtons
                          : ""
                          }`}
                        onClick={() => handleClick("icon2", "departure")}
                      >
                        Departure
                        <FontAwesomeIcon
                          icon={faChevronDown}
                          className={`${style.arrowDesktop} ${rotatedIcons[destinationIndex] &&
                            rotatedIcons[destinationIndex].includes("icon2")
                            ? style.rotated
                            : ""
                            }`}
                          id="icon2"
                        />
                      </button>
                      <button
                        className={`${style.toggleButtons} ${rotatedIcons[destinationIndex] &&
                          rotatedIcons[destinationIndex].includes("icon3")
                          ? style.activeButtons
                          : ""
                          }`}
                        onClick={() => handleClick("icon3", "arrival")}
                      >
                        Arrival
                        <FontAwesomeIcon
                          icon={faChevronDown}
                          className={`${style.arrowDesktop} ${rotatedIcons[destinationIndex] &&
                            rotatedIcons[destinationIndex].includes("icon3")
                            ? style.rotated
                            : ""
                            }`}
                          id="icon3"
                        />
                      </button>
                      <button
                        className={`${style.toggleButtons} ${rotatedIcons[destinationIndex] &&
                          rotatedIcons[destinationIndex].includes("icon4")
                          ? style.activeButtons
                          : ""
                          }`}
                        onClick={() => handleClick("icon4", "duration")}
                      >
                        Duration
                        <FontAwesomeIcon
                          icon={faChevronDown}
                          className={`${style.arrowDesktop} ${rotatedIcons[destinationIndex] &&
                            rotatedIcons[destinationIndex].includes("icon4")
                            ? style.rotated
                            : ""
                            }`}
                          id="icon4"
                        />
                      </button>
                    </div>
                  </div>

                  {/* bottomsheet filters */}
                  {isBottomSheetOpen && (
                    <FiltersPop
                      isOpen={isBottomSheetOpen}
                      onClose={handleBottomSheetToggle}
                      filterData={
                        destinationData?.[destinationIndex]?.filterData
                      }
                      flightsResponse={
                        allDestinationsData?.[destinationIndex]?.flights
                      }
                      flightsRequest={flightsRequest}
                      selectedFilters={selectedFilters[destinationIndex]}
                      setSelectedFilters={setSelectedFilters}
                      wayType="multicity"
                      type="mobile"
                      destinationIndex={destinationIndex}
                      originalData={allDestinationsData}
                      sortingCriteria={sortingCriteria[destinationIndex]}
                      sortFlights={sortFlights}
                      setFlightsResponse={(newValue) => {
                        console.log(newValue);
                        const updatedDestinationData = [...destinationData];
                        updatedDestinationData[destinationIndex].flights =
                          newValue;
                        setDestinationData(updatedDestinationData);
                      }}
                    />
                  )}

                  <div className={style.resultsDetails}>
                    {destinationData?.[destinationIndex]?.flights?.length > 0
                      ? `${destinationData?.[destinationIndex]?.flights?.length} Results Found`
                      : "No Results Found"}
                  </div>

                  {destinationData?.[destinationIndex] &&
                    destinationData?.[destinationIndex].flights.length > 0 && (
                      <div className={style.flightsContainer}>
                        {destinationData?.[destinationIndex].flights.map(
                          (flight, index) => {
                            const segments = flight.segments[0].segment;
                            // Consider the first object as the origin and the last as the destination
                            const origin = segments[0];
                            const destination =
                              segments.length > 1
                                ? segments[segments.length - 1]
                                : segments[0];

                            // Calculate overall duration
                            const overallDuration = segments.reduce(
                              (acc, segment) => acc + segment.duration,
                              0
                            );

                            const journeyDuration =
                              flight.segments[0]?.journeyDuration;
                            const overallSeats = segments[0].seatsAvailable;
                            const numOfDays = handleFlightDuration(
                              origin.origin.depTime,
                              destination.destination.arrTime
                            );

                            return (
                              <div
                                className={`${style.flightTicket} ${destinationData?.[destinationIndex]
                                  ?.selectedFlight?.resultIndex ===
                                  flight?.resultIndex
                                  ? style.highlighted
                                  : ""
                                  }`}
                                key={index}
                                onClick={() =>
                                  destinationData?.[destinationIndex]
                                    ?.selectedFlight?.resultIndex !==
                                  flight?.resultIndex &&
                                  handleSelectButtonClick(flight, index)
                                }
                              >
                                {/* <div className={style.flightTicket} key={index}> */}
                                <div className={style.airlineDetails}>
                                  <div className={style.logoAirline2}>
                                    <Image
                                      src={origin.airline.airlineLogoUrl}
                                      alt="logo"
                                      width={30}
                                      height={30}
                                    />
                                    <div>
                                      <span className={style.airline}>
                                        {origin.airline.airlineName}
                                      </span>
                                      <div
                                        style={{
                                          color: "#878786",
                                          lineHeight: "1",
                                          fontSize: "10px",
                                        }}
                                      >
                                        {origin.airline.airlineCode}-
                                        {origin.airline.flightNumber}
                                      </div>
                                    </div>
                                  </div>
                                </div>
                                <div className={style.leftpartTicket}>
                                  <div className={style.desktopstyle}>
                                    <div
                                      style={{
                                        display: "flex",
                                        justifyContent: "space-between",
                                        alignItems: "center",
                                      }}
                                    >
                                      <div className={style.logoAirline}>
                                        <Image
                                          src={origin.airline.airlineLogoUrl}
                                          alt="logo"
                                          width={25}
                                          height={25}
                                        />
                                        <div>
                                          <span className={style.airline}>
                                            {origin.airline.airlineName}
                                          </span>
                                          <div
                                            style={{
                                              color: "#878786",
                                              lineHeight: "1",
                                              fontSize: "12px",
                                            }}
                                          >
                                            {origin.airline.airlineCode}-
                                            {origin.airline.flightNumber}
                                          </div>
                                        </div>
                                      </div>
                                      <span className={style.Economy}>
                                        {segments[0].cabinClassName}
                                      </span>
                                    </div>
                                  </div>
                                  <div className={style.mobilestyle}>
                                    <span className={style.Economy}>
                                      {segments[0].cabinClassName}
                                    </span>
                                  </div>
                                  <div className={style.fromToTiming}>
                                    <div
                                      style={{
                                        display: "flex",
                                        flexDirection: "column",
                                      }}
                                    >
                                      <span className={style.fromToTime}>
                                        {formatTime(origin.origin.depTime)}
                                      </span>
                                      <span className={style.fromToCityCode}>
                                        {origin.origin.airport.cityCode}
                                      </span>
                                    </div>
                                    <div className={style.btwLineContent}>
                                      <div className={style.dashLineText}>
                                        {formatDuration(journeyDuration)} |{" "}
                                        {flight.segments[0].stops}{" "}
                                        {flight.segments[0].stops <= 1
                                          ? "Stop"
                                          : "Stops"}
                                      </div>
                                      <div className={style.dashLine}></div>
                                      <div className={style.dashLineText}>
                                        {/* 7Kg, 15Kg */}
                                        {flight.isRefundable
                                          ? "REFUNDABLE"
                                          : "NON REFUNDABLE"}
                                        {""}
                                      </div>
                                    </div>
                                    <div
                                      style={{
                                        display: "flex",
                                        flexDirection: "column",
                                      }}
                                      className={style.rightmoving}
                                    >
                                      <span className={style.fromToTime}>
                                        {formatTime(
                                          destination.destination.arrTime
                                        )}
                                        {numOfDays > 0 && (
                                          <span className={style.addingdays}>
                                            (+{numOfDays}D)
                                          </span>
                                        )}
                                      </span>

                                      <span className={style.fromToCityCode}>
                                        {
                                          destination.destination.airport
                                            .cityCode
                                        }
                                      </span>
                                    </div>
                                  </div>
                                  <div
                                    className={style.fareDetailsButton}
                                  // onClick={handleFareDetailsClick}
                                  >
                                    <div className={style.flightFareToggles}>
                                      <span
                                        style={{ textDecoration: "underline" }}
                                        onClick={(event) =>
                                          handleTabClick(
                                            "flightDetails",
                                            flight,
                                            index,
                                            event
                                          )
                                        }
                                      >
                                        Flight Details
                                      </span>
                                      <span
                                        style={{
                                          marginLeft: "10px",
                                          textDecoration: "underline",
                                        }}
                                        onClick={(event) =>
                                          handleTabClick(
                                            "fareDetails",
                                            flight,
                                            index,
                                            event
                                          )
                                        }
                                      >
                                        Fare Details
                                      </span>
                                      {destinationDetailsIndex === index && (
                                        <BottomSheetDetails
                                          isOpen={isOpen}
                                          index={index}
                                          onClose={handleCloseBottomSheet}
                                          activeTab={activeTab}
                                          flights={
                                            destinationData?.[destinationIndex]
                                              .flights
                                          }
                                        />
                                      )}
                                    </div>
                                  </div>
                                </div>
                                <div className={style.middlepartTicket}>
                                  <div className={style.verticalline}></div>
                                </div>
                                <div className={style.rightpartTicket}>
                                  <div className={style.rightpartTicket1}>
                                    <span
                                      className={style.FareDetails1}
                                    // style={{ color: "#155EEF" }}
                                    >
                                      {/* faretype */}
                                      {flightsRequest?.searchReqData
                                        ?.resultFareType === "2" &&
                                        "Regular Fares"}
                                      {flightsRequest?.searchReqData
                                        ?.resultFareType === "5" &&
                                        "Senior Citizen"}
                                      {flightsRequest?.searchReqData
                                        ?.resultFareType === "3" && "Student"}
                                      {flightsRequest?.searchReqData
                                        ?.resultFareType === "4" &&
                                        "Armed Forces"}
                                    </span>
                                    {/* <span style={{backgroundColor:"transparent"}} ><FontAwesomeIcon icon={faCircleInfo} /></span> */}
                                  </div>
                                  <div style={{ position: "relative" }}>
                                    <span
                                      style={{
                                        textWrap: "nowrap",
                                        cursor: "pointer",
                                        fontWeight: "550",
                                        fontSize: "14px",
                                      }}
                                      // onClick={() => handleToggleTooltip(index)}
                                      className={style.priceFonts}
                                    >
                                      Rs{" "}
                                      {formatPrice(
                                        flight.fare.offeredFareRoundedOff
                                      )}
                                    </span>
                                  </div>

                                  <button
                                    onClick={() =>
                                      destinationData?.[destinationIndex]
                                        ?.selectedFlight?.resultIndex !==
                                      flight?.resultIndex &&
                                      handleSelectButtonClick(flight, index)
                                    }
                                    className={style.airlineSelectBtn}
                                    disabled={
                                      destinationData?.[destinationIndex]
                                        ?.selectedFlight?.resultIndex ===
                                      flight?.resultIndex
                                    }
                                  >
                                    {destinationData?.[destinationIndex]
                                      ?.selectedFlight?.resultIndex ===
                                      flight?.resultIndex
                                      ? "Selected"
                                      : "Select"}
                                  </button>
                                  {!isNaN(overallSeats) && (
                                    <span className={style.seatsLeftDetails}>
                                      {overallSeats} Seats Left
                                    </span>
                                  )}
                                </div>
                              </div>
                            );
                          }
                        )}
                      </div>
                    )}
                </div>
              </div>
            )}
          </div>

          {/* fixed bottom content */}
          {!pageLoading ? (
            <div
              className={style.fixedBottomDetails}
              style={{
                display: noResultsFlag ? "none" : "flex",
              }}
            >
              <div className={style.scrollFlights}>
                <div className={style.carouselFlights}>
                  {destinationData.map((destination, index) => (
                    <>
                      {destination?.selectedFlight && (
                        <div
                          key={index}
                          className={`${style.flightPrice} ${destinationIndex === index ? style.activeFlight : ""
                            }`}
                          onClick={() => handleButtonClick(index)}
                        >
                          <div
                            className={`${style.cityCodes} ${destinationIndex === index
                              ? style.activeCityCodes
                              : ""
                              }`}
                          >
                            <span>
                              {
                                destination?.selectedFlight?.segments?.[0]
                                  ?.segment?.[0]?.origin?.airport?.airportCode
                              }{" "}
                            </span>
                            -
                            <span>
                              {" "}
                              {
                                destination?.selectedFlight?.segments?.[0]
                                  ?.segment?.[
                                  destination?.selectedFlight?.segments?.[0]
                                    ?.segment?.length - 1
                                ]?.destination?.airport?.airportCode
                              }
                            </span>
                          </div>
                          <div className={style.timeCodes}>
                            <span>
                              {formatTime(
                                destination?.selectedFlight?.segments?.[0]
                                  ?.segment?.[0]?.origin?.depTime
                              )}
                            </span>
                            -
                            <span>
                              {formatTime(
                                destination?.selectedFlight?.segments?.[0]
                                  ?.segment?.[
                                  destination?.selectedFlight?.segments?.[0]
                                    ?.segment?.length - 1
                                ]?.destination?.arrTime
                              )}
                            </span>
                          </div>
                        </div>
                      )}
                    </>
                  ))}
                </div>
              </div>
              <div className={style.fixedPriceBox}>
                <div className={style.fixedPriceBox1}>
                  <span className={style.totalHead}>Total Amount</span>
                  <span className={style.totalAmount}>
                    Rs{" "}
                    {formatPrice(
                      destinationData?.[destinationData?.length - 1]
                        ?.selectedFlight?.fare?.offeredFareRoundedOff
                    )}
                  </span>
                </div>
                <button
                  className={style.selectButton}
                  onClick={handleProceed}
                // disabled={selectButtonLoader}
                >
                  {selectButtonLoader ? (
                    <div className="loadingSpinner"></div>
                  ) : (
                    "Proceed"
                  )}
                </button>
                {isMulticitySideSheetOpen && (
                  <MulticitySideSheet
                    isOpen={isMulticitySideSheetOpen}
                    onClose={handleCloseMulticitySideSheet}
                    flightData={flightData}
                    parentLoader={setSelectButtonLoader}
                  />
                )}
              </div>
            </div>
          ) : null}
        </div>

        {/* {isDropdownVisible || isBottomSheetOpen ? null : <Chaticon />} */}
        {isBottomSheetOpen || isDropdownVisible ? null : <GoToTopButton />}
        {!corporateUser ? (
          <div>{isBottomSheetOpen || noResultsFlag ? null : <Footer />}</div>
        ) : (
          <div>{isBottomSheetOpen || noResultsFlag ? null : <Footer1 />}</div>
        )}
      </div>
    </>
  );
}
