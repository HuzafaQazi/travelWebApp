import {
  faArrowLeft,
  faArrowRight,
  faChevronDown,
  faCircle,
  faLeftRight,
  faSliders,
  faArrowRightArrowLeft,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Image from "next/image";
import { useRouter } from "next/router";
import { useEffect, useRef, useState } from "react";
import style from "./List.module.css";
import CommonHeader from "@/components/flights/commonHeader/commonHeader";
import B2CHeader from "@/components/flights/B2cHeader/Header";
import DesktopNavigation from "@/components/flights/desktopNavigation/desktopNavigation";
import FareDetails from "@/components/flights/fareDetails/fareDetails";
import FiltersPop1 from "@/components/flights/filterspopTwoway/filtersPop";
import FlightDetails from "@/components/flights/flightDetails/flightDetails";
import NavigationModify from "@/components/flights/navigationModify/navigationModify";
import ResultNotFound from "@/components/flights/resultNotFound/resultNotFound";
import TwowaySideSheet from "@/components/flights/twowaySidesheet/twowaySidesheet";
import Footer from "@/components/footer/footer";
import Gototopbutton from "@/components/gototopbutton/gototopbutton";
import config from "@/config";
import { useLogin } from "@/store/context/LoginContext";
import axios from "@/utils/axios/axios";
import {
  getTabSpecificData,
  setTabSpecificData,
  removeTabSpecificData,
} from "@/utils/axios/axios";
import pako from "pako";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import loaderf from "../../../../public/img/flightload.gif";
import {
  calculateTotalDuration,
  extractFlights,
  extractInboundFlightsIfInternational,
  fetchGetQuote,
  fetchSSR,
  formatDateToDayMonth,
  formatDuration,
  formatPrice,
  formatTime,
  handleFlightDuration,
} from "../../../../utils/flights/twoway/helper";
import { analytics } from "../../../../utils/firebase";
import { logEvent } from "firebase/analytics";
import { useUserType } from "@/hooks/useUserType";
import Header from "@/components/corporate/auth/Header";
import Footer1 from "@/components/corporate/footerCorporate/footerCorporate";
import FlightLoader from "@/components/loader/FlightLoader";

export default function TwowayListing() {
  const router = useRouter();
  const corporateUser = useUserType();

  // for no reuslts found
  const { noResults } = router.query;

  console.log("🎯 Router Query Params: ", router.query);

  const { openFlightPricePopup } = useLogin();

  const [noResultsFlag, setNoResultsFlag] = useState(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const noResults = params.get("noResults");
      console.log("🎯 Initial URL check - noResults:", noResults);
      return noResults === "true";
    }
    return false;
  });

  const [isTwowaySideSheetOpen, setIsTwowaySideSheetOpen] = useState(false);
  const [searchButtonDisabled, setSearchButtonDisabled] = useState(false);

  const [showTooltip, setShowTooltip] = useState(false);
  const [showTooltip1, setShowTooltip1] = useState(false);
  const [isClicked, setIsClicked] = useState(false);
  const [isClicked1, setIsClicked1] = useState(false);
  const [flightsResponse, setFlightsResponse] = useState([]);
  const [flightsRequest, setFlightsRequest] = useState([]);
  const [inboundFlights, setInboundFlights] = useState(null);
  const [outboundFlights, setOutboundFlights] = useState(null);
  const [outboundCheckboxIndex, setOutboundCheckboxIndex] = useState(null);
  const [inboundCheckboxIndex, setInboundCheckboxIndex] = useState(null);
  const [selectedOutboundFlight, setSelectedOutboundFlight] = useState(null);
  const [selectedInboundFlight, setSelectedInboundFlight] = useState(null);
  const [outboundDetailsIndex, setOutboundDetailsIndex] = useState(null);
  const [outboundDetailsLoader, setOutboundDetailsLoader] = useState(false);
  const [inboundDetailsLoader, setInboundDetailsLoader] = useState(false);
  const [inboundDetailsIndex, setInboundDetailsIndex] = useState(null);
  const [outboundDetailsPopupOpen, setOutboundDetailsPopupOpen] =
    useState(false);
  const [inboundDetailsPopupOpen, setInboundDetailsPopupOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("");
  const [flightData, setflightData] = useState([]);
  const [selectButtonLoader, setSelectButtonLoader] = useState(false);
  const [rotatedIcons, setRotatedIcons] = useState([]);
  const [rotatedInboundIcons, setRotatedInboundIcons] = useState([]);

  const [showSortingOptions, setShowSortingOptions] = useState(false);
  const [showSortingOptions2, setShowSortingOptions2] = useState(false);

  const [isOutboundPopupOpen, setIsOutboundPopupOpen] = useState(false);
  const [isInboundPopupOpen, setIsInboundPopupOpen] = useState(false);
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [isToastVisible, setIsToastVisible] = useState(false);
  const [selectedOutboundFilters, setSelectedOutboundFilters] = useState({
    stops: [],
    airlines: [],
    layovers: [],
    destinations: [],
    arrivals: [],
    price: {},
    cabinClasses: [],
    carrier: [],
  });
  const [selectedInboundFilters, setSelectedInboundFilters] = useState({
    stops: [],
    airlines: [],
    layovers: [],
    destinations: [],
    arrivals: [],
    price: {},
    cabinClasses: [],
    carrier: [],
  });
  const [selectedDesktopFilters, setSelectedDesktopFilters] = useState({
    stops: [],
    airlines: [],
    layovers: [],
    destinations: [],
    arrivals: [],
    price: {},
    cabinClasses: [],
    carrier: [],
  });
  const [desktopFilteredData, setDesktopFilteredData] = useState(null);
  const [fareQuoteData, setFareQuoteData] = useState([]);
  const [activeButton, setActiveButton] = useState("fromTo");
  const [loading, setLoading] = useState(true);
  const [pageLoading, setPageLoading] = useState(false);
  const [sortingCriteria, setSortingCriteria] = useState({
    type: "outbound",
    criteria: "price",
    order: "asc",
  });
  const [tmpFlights, setTmpFlights] = useState({
    qTraceId: "",
    outbound: [],
    inbound: [],
  });
  const [selectedFlight, setSelectedFlight] = useState({
    type: "outbound",
    index: null,
    flights: [],
  });
  const [fareDetailsData, setFareDetailsData] = useState([]);
  const [type, setType] = useState("outbound");
  const [outboundResultIndex, setOutboundResultIndex] = useState(null);
  const [inboundFlightsLoader, setInboundFlightsLoader] = useState(false);
  const [selectedTravelers, setSelectedTravelers] = useState([]);

  const handleTravelerChange = (newTravelers) => {
    setSelectedTravelers(newTravelers);
  };

  const toggleOutboundPopup = () => {
    setIsOutboundPopupOpen((prevIsPopupOpen) => !prevIsPopupOpen);
    logEvent(analytics, "outbound_filters", {});
  };

  const toggleInboundPopup = () => {
    setIsInboundPopupOpen((prevIsPopupOpen) => !prevIsPopupOpen);
    logEvent(analytics, "inbound_filters", {});
  };

  // dropdown for modify section
  const [isDropdownVisible, setIsDropdownVisible] = useState(false);
  const dropdownRef = useRef(null);

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
    if (noResultsFlag) {
      setSelectedInboundFlight(null);
      setSelectedOutboundFlight(null);
    }
  }, [noResultsFlag]);

  console.log("🎯 No Results Flag:", noResultsFlag);

  const handleDivClick1 = async (
    flight,
    index,
    isSelected = true,
    filterInboundIndex = null
  ) => {
    try {
      if (flight) {
        // const isOutboundSelected =
        //   outboundCheckboxIndex === index && isClicked1;
        const isOutboundSelected = false;
        if (isOutboundSelected && isSelected) {
          // setSelectedOutboundFlight(null);
          // setOutboundCheckboxIndex(null);
          // setIsClicked1(false);
          if (
            flightsResponse?.flightJourney === "international" &&
            outboundCheckboxIndex !== index
          ) {
            setSelectedInboundFlight(null);
            setInboundCheckboxIndex(null);
            setIsClicked(false);
          }
        } else {
          if (outboundCheckboxIndex !== null || isSelected) {
            setSelectedOutboundFlight(flight);
            setOutboundCheckboxIndex(index);
            setIsClicked1(true);
            setOutboundResultIndex(flight.resultIndex);
          }
          if (flightsResponse?.flightJourney === "international") {
            if (outboundResultIndex !== flight.resultIndex || isSelected) {
              setInboundFlightsLoader(true);
              const flightSegmentRefId =
                flight?.segments?.[0]?.flightSegmentRefId;
              const inboundFlights = await extractInboundFlightsIfInternational(
                flightsResponse.qTraceId,
                flightSegmentRefId
              );
              if (inboundFlights && inboundFlights.flights.length > 0) {
                const selectedInboundFlight = inboundFlights?.flights?.[0];
                let inboundIndex = 0;
                if (filterInboundIndex !== null) {
                  inboundIndex = filterInboundIndex;
                }
                setInboundFlights((prev) => ({
                  // ...prev,
                  ...inboundFlights,
                }));
                setSelectedInboundFlight(selectedInboundFlight);
                setInboundCheckboxIndex(inboundIndex);
                setIsClicked(true);
                setInboundFlightsLoader(false);
                const outboundFlights = flightsResponse.flightsResults[0];

                const response = {
                  ...flightsResponse,
                  flightJourney: "international",
                  flightsResults: [outboundFlights, inboundFlights],
                };
                const compressedData = pako.deflate(JSON.stringify(response));
                setTabSpecificData("twoWayFlightResponse", compressedData);
              } else {
                setInboundFlights((prev) => ({ filterData: {}, flights: [] }));
              }
              setSelectedInboundFilters({
                stops: [],
                airlines: [],
                layovers: [],
                destinations: [],
                arrivals: [],
                price: {},
                cabinClasses: [],
                carrier: [],
              });
            }
          }
        }
      } else {
        // setInboundFlights((prev) => ({ filterData: {}, flights: [] }));
        // setSelectedOutboundFlight(null);
        // setSelectedInboundFlight(null);
      }
    } catch (error) {
      console.log(error);
    } finally {
      // setInboundFlightsLoader(false);
    }
  };
  // old code for selecting flights from outbound and inbound

  const handleDivClick = (
    flight,
    index,
    isSelected = true,
    filterOutboundIndex = null
  ) => {
    // check if the outbound flight is selected, if selected then unselect (domestic)
    // const isInboundSelected = inboundCheckboxIndex === index && isClicked;
    const isInboundSelected = false;
    if (isInboundSelected && isSelected) {
      // setSelectedInboundFlight(null);
      // setInboundCheckboxIndex(null);
      // setIsClicked(false);
    } else {
      setSelectedInboundFlight(flight);
      setInboundCheckboxIndex(index);
      setIsClicked(true);
    }
  };

  useEffect(() => {
    if (isTwowaySideSheetOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isTwowaySideSheetOpen]);

  const handleModifyClick = () => {
    setIsDropdownVisible(!isDropdownVisible);
    logEvent(analytics, "tw_modify_click", {});
  };

  const handleGoBack = () => {
    window.history.back();
  };

  const handleToggleTooltip = () => {
    setShowTooltip((prevShowTooltip) => !prevShowTooltip);
  };
  const handleToggleTooltip1 = () => {
    setShowTooltip1((prevShowTooltip) => !prevShowTooltip);
  };
  const filterResponseByOriginDestination = (response, origin, destination) => {
    return response.filter(
      (flight) => flight.origin === origin || flight.destination === destination
    );
  };

  const handleSelectButtonClick = async () => {
    setSearchButtonDisabled(true);
    setSelectButtonLoader(true);
    if (!selectedOutboundFlight) {
      if (!isToastVisible) {
        toast("Please select Departure flight");
        setIsToastVisible(true);

        // Reset the flag after a specific duration (e.g., 3 seconds)
        setTimeout(() => {
          setIsToastVisible(false);
        }, 6000);
      }
      setSelectButtonLoader(false);
      return;
    }
    if (!selectedInboundFlight) {
      if (!isToastVisible) {
        toast("Please select Return flight");
        setIsToastVisible(true);

        // Reset the flag after a specific duration (e.g., 3 seconds)
        setTimeout(() => {
          setIsToastVisible(false);
        }, 6000);
      }
      setSelectButtonLoader(false);
      return;
    }
    try {
      let outboundFlightResultIndex, inboundFlightResultIndex;
      if (flightsResponse.flightJourney === "international") {
        outboundFlightResultIndex = selectedInboundFlight.resultIndex;
        inboundFlightResultIndex = selectedInboundFlight.resultIndex;
      } else {
        outboundFlightResultIndex = selectedOutboundFlight.resultIndex;
        inboundFlightResultIndex = selectedInboundFlight.resultIndex;
      }
      const response = await fetchGetQuote(
        flightsResponse.qTraceId,
        outboundFlightResultIndex,
        inboundFlightResultIndex
      );
      const { outboundFlight, inboundFlight } = response;
      if (outboundFlight.isPriceChanged || inboundFlight.isPriceChanged) {
        let oldPrice, newPrice;
        if (flightsResponse?.flightJourney === "international") {
          oldPrice = selectedOutboundFlight.fare.offeredFareRoundedOff;
          newPrice = outboundFlight?.fare?.offeredFareRoundedOff;
        } else {
          oldPrice =
            selectedOutboundFlight.fare.offeredFareRoundedOff +
            selectedInboundFlight.fare.offeredFareRoundedOff;
          newPrice =
            outboundFlight?.fare?.offeredFareRoundedOff +
            inboundFlight?.fare?.offeredFareRoundedOff;
        }
        openFlightPricePopup(oldPrice, newPrice);
        logEvent(analytics, "price_change_detected", {
          oldPrice: oldPrice,
          newPrice: newPrice,
        });
      }
      let outboundFlightSSR,
        inboundFlightSSR = null;
      if (flightsResponse?.flightJourney === "international") {
        try {
          const ssrResponse = await fetchSSR(
            flightsResponse.qTraceId,
            selectedInboundFlight.resultIndex
          );

          const outSeatDynamicResponse =
            ssrResponse?.ssr?.ssrData?.seatDynamic[0];
          const inSeatDynamicResponse =
            ssrResponse?.ssr?.ssrData?.seatDynamic[1];

          const outboundBaggageResponse =
            ssrResponse?.ssr?.ssrData?.baggage?.[0];
          const inboundBaggageResponse =
            ssrResponse?.ssr?.ssrData?.baggage?.[1];

          outboundFlightSSR = {
            ...ssrResponse,
            ssr: {
              ...ssrResponse.ssr,
              ssrData: {
                ...ssrResponse.ssr.ssrData,
                ...(outSeatDynamicResponse && {
                  seatDynamic: [outSeatDynamicResponse],
                }),
                ...(outboundBaggageResponse && {
                  baggage: [outboundBaggageResponse],
                }),
              },
            },
          };
          inboundFlightSSR = {
            ...ssrResponse,
            ssr: {
              ...ssrResponse.ssr,
              ssrData: {
                ...ssrResponse.ssr.ssrData,
                ...(inSeatDynamicResponse && {
                  seatDynamic: [inSeatDynamicResponse],
                }),
                ...(inboundBaggageResponse && {
                  baggage: [inboundBaggageResponse],
                }),
              },
            },
          };

          if (ssrResponse.isLcc) {
            const response = ssrResponse?.ssr?.ssrData?.mealDynamic;
            const outboundOrigin =
              flightsRequest.searchReqData.segments[0].origin;
            const outboundDestination =
              flightsRequest.searchReqData.segments[0].destination;
            const outboundMealDynamic = filterResponseByOriginDestination(
              response,
              outboundOrigin,
              outboundDestination
            );
            outboundFlightSSR = {
              ...outboundFlightSSR,
              ssr: {
                ...outboundFlightSSR.ssr,
                ssrData: {
                  ...outboundFlightSSR.ssr.ssrData,
                  ...(outboundMealDynamic && {
                    mealDynamic: outboundMealDynamic,
                  }),
                },
              },
            };

            const inboundOrigin =
              flightsRequest.searchReqData.segments[1].origin;
            const inboundDestination =
              flightsRequest.searchReqData.segments[1].destination;
            const inboundMealDynamic = filterResponseByOriginDestination(
              response,
              inboundOrigin,
              inboundDestination
            );
            inboundFlightSSR = {
              ...inboundFlightSSR,
              ssr: {
                ...inboundFlightSSR.ssr,
                ssrData: {
                  ...inboundFlightSSR.ssr.ssrData,
                  ...(inboundMealDynamic && {
                    mealDynamic: inboundMealDynamic,
                  }),
                },
              },
            };
          }
          logEvent, (analytics, "tw_select_click", {});
        } catch (error) {
          console.log(error);
        }
      } else {
        try {
          outboundFlightSSR = await fetchSSR(
            flightsResponse.qTraceId,
            selectedOutboundFlight.resultIndex
          );
        } catch (error) {
          console.log(error);
        }
        try {
          inboundFlightSSR = await fetchSSR(
            flightsResponse.qTraceId,
            selectedInboundFlight.resultIndex
          );
        } catch (error) {
          console.log(error);
        }
      }
      const countryResponse = await axios.get(`${config.FLIGHTS_COUNTRY}`);
      const country = countryResponse?.data;

      const selectedFlightSection = getTabSpecificData("selectedFlightSection");
      if (selectedFlightSection) {
        removeTabSpecificData("selectedFlightSection");
      }

      setflightData({
        qTraceId: flightsResponse.qTraceId,
        outboundFlight: selectedOutboundFlight,
        inboundFlight: selectedInboundFlight,
        outboundFlightFareQuote: outboundFlight,
        inboundFlightFareQuote: inboundFlight,
        outboundFlightSSR: outboundFlightSSR,
        inboundFlightSSR: inboundFlightSSR,
        countryResponse: country.data.Countries,
        flightsRequest: flightsRequest,
      });
      setIsTwowaySideSheetOpen(true);
    } catch (error) {
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
            router.push("/flights/twoway/list");
          }, 2000);
          // return;// Redirect to a specific page
        } else if (
          error?.response?.data?.error?.errorMessage?.[0]?.data || error?.response?.error?.errorMessage?.[0]?.data ===
          "Fare Quote failed from the Supplier end. Please try again."
        ) {
          errorMessage = "Something went wrong, please select different flight";
          setTimeout(() => {
            router.push("/flights/twoway/list");
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

  const handleCloseTwowaySideSheet = () => {
    removeTabSpecificData("selectedFlightSection");
    // setOutboundCheckboxIndex(null);
    // setInboundCheckboxIndex(null);
    // setSelectedOutboundFlight(null);
    // setSelectedInboundFlight(null);
    setIsTwowaySideSheetOpen(false);
    setSearchButtonDisabled(false);
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Read everything from sessionStorage (may be null)
        const compressedData = getTabSpecificData("twoWayFlightResponse");
        const encodedRequest = getTabSpecificData("twoWayFlightRequest");
        const encodedSelectedFlight = getTabSpecificData("selectedFlightData");
        const selectedFlightSection = getTabSpecificData(
          "selectedFlightSection"
        );

        if (!(compressedData && encodedRequest)) {
          return router.replace("/");
        }
        // Only decode the two-way response if both response & request exist
        if (compressedData && encodedRequest) {
          // Inflate the saved response
          const numbersArray = compressedData.split(",").map(Number);
          const compressedUint8Array = new Uint8Array(numbersArray);
          const decodedString = pako.inflate(compressedUint8Array, {
            to: "string",
          });
          const decodedResponse = JSON.parse(decodedString);

          // Decode the saved request (base64)
          const decodedRequest = JSON.parse(atob(encodedRequest));

          // If it's a new qTraceId, apply it
          if (
            !flightsResponse ||
            flightsResponse.qTraceId !== decodedResponse.qTraceId
          ) {
            setFlightsResponse(decodedResponse);
            setFlightsRequest(decodedRequest);

            // Extract outbound/inbound flights
            const { outboundFlights, inboundFlights } = await extractFlights(
              decodedResponse
            );
            setOutboundFlights(outboundFlights);
            setInboundFlights(inboundFlights);
            setDesktopFilteredData(outboundFlights.filterData);

            // Auto-select the first flights
            if (
              outboundFlights.flights.length > 0 &&
              inboundFlights.flights.length > 0
            ) {
              setSelectedOutboundFlight(outboundFlights.flights[0]);
              setSelectedInboundFlight(inboundFlights.flights[0]);
              setOutboundCheckboxIndex(0);
              setInboundCheckboxIndex(0);
              setIsClicked(true);
              setIsClicked1(true);
            }

            // Re-compress if it’s international two-way
            if (decodedResponse.flightJourney === "international") {
              let response = {
                ...decodedResponse,
                flightsResults: [outboundFlights],
              };
              if (inboundFlights.flights.length > 0) {
                response.flightsResults.push(inboundFlights);
              }
              const reCompressed = pako.deflate(JSON.stringify(response));
              setTabSpecificData("twoWayFlightResponse", reCompressed);
            }
          }
        }

        // If a user has explicitly selected flights, restore that too
        if (encodedSelectedFlight && selectedFlightSection) {
          const decodedSelected = JSON.parse(
            decodeURIComponent(atob(encodedSelectedFlight))
          );
          setSelectedOutboundFlight(decodedSelected.outboundFlight);
          setSelectedInboundFlight(decodedSelected.inboundFlight);
          setflightData(decodedSelected);
          setIsTwowaySideSheetOpen(true);
        }
      } catch (err) {
        console.error("fetchData error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // useEffect(() => {
  //   const fetchData = async () => {
  //     try {
  //       const compressedData = getTabSpecificData("twoWayFlightResponse");

  //       const numbersArray = compressedData.split(",").map(Number);

  //       const compressedUint8Array = new Uint8Array(numbersArray);

  //       const encodedResponse = pako.inflate(compressedUint8Array, {
  //         to: "string",
  //       });

  //       const encodedRequest = getTabSpecificData("twoWayFlightRequest");

  //       const encodedSelectedFlightData =
  //         getTabSpecificData("selectedFlightData");

  //       const selectedFlightSection = getTabSpecificData(
  //         "selectedFlightSection"
  //       );
  //       if (encodedResponse && encodedRequest) {
  //         // Decode from base64
  //         const decodedResponse = JSON.parse(encodedResponse);
  //         const decodedRequest = JSON.parse(atob(encodedRequest));
  //         if (
  //           flightsResponse &&
  //           flightsResponse.qTraceId === decodedResponse.qTraceId
  //         ) {
  //           return;
  //         }
  //         setFlightsResponse(decodedResponse);
  //         setFlightsRequest(decodedRequest);

  //         const { outboundFlights, inboundFlights } = await extractFlights(
  //           decodedResponse
  //         );

  //         setOutboundFlights(outboundFlights);
  //         setInboundFlights(inboundFlights);
  //         setDesktopFilteredData(outboundFlights?.filterData);

  //         if (
  //           outboundFlights.flights.length > 0 &&
  //           inboundFlights.flights.length > 0
  //         ) {
  //           const selectedOutboundFlight = outboundFlights?.flights?.[0];
  //           const selectedInboundFlight = inboundFlights?.flights?.[0];
  //           setSelectedOutboundFlight(selectedOutboundFlight);
  //           setSelectedInboundFlight(selectedInboundFlight);
  //           setOutboundCheckboxIndex(0);
  //           setInboundCheckboxIndex(0);
  //           setIsClicked(true);
  //           setIsClicked1(true);
  //         }

  //         if (decodedResponse?.flightJourney === "international") {
  //           let response = {
  //             ...decodedResponse,
  //             flightJourney: "international",
  //             flightsResults: [outboundFlights],
  //           };
  //           if (inboundFlights && inboundFlights?.flights?.length > 0) {
  //             response = {
  //               ...decodedResponse,
  //               flightJourney: "international",
  //               flightsResults: [outboundFlights, inboundFlights],
  //             };
  //           }
  //           const compressedData = pako.deflate(JSON.stringify(response));
  //           setTabSpecificData("twoWayFlightResponse", compressedData);
  //         }
  //       }

  //       if (encodedSelectedFlightData && selectedFlightSection) {
  //         const decodedSelectedFlightData = JSON.parse(
  //           decodeURIComponent(atob(encodedSelectedFlightData))
  //         );
  //         setSelectedOutboundFlight(decodedSelectedFlightData.outboundFlight);
  //         setSelectedInboundFlight(decodedSelectedFlightData.inboundFlight);
  //         setflightData(decodedSelectedFlightData);
  //         setIsTwowaySideSheetOpen(true);
  //       }
  //     } catch (error) {
  //       console.log(error);
  //     }
  //   };

  //   fetchData();
  // }, []);

  async function updateFlightsResponse() {
    try {
      const compressedData = getTabSpecificData("twoWayFlightResponse");
      const numbersArray = compressedData.split(",").map(Number);

      const compressedUint8Array = new Uint8Array(numbersArray);

      const encodedResponse = pako.inflate(compressedUint8Array, {
        to: "string",
      });

      const encodedRequest = getTabSpecificData("twoWayFlightRequest");

      if (encodedResponse && encodedRequest) {
        // Decode from base64
        const decodedResponse = JSON.parse(encodedResponse);
        const decodedRequest = JSON.parse(atob(encodedRequest));
        setFlightsResponse(decodedResponse);
        setFlightsRequest(decodedRequest);

        const { outboundFlights, inboundFlights } = await extractFlights(
          decodedResponse
        );
        setOutboundFlights(outboundFlights);
        setInboundFlights(inboundFlights);
        setDesktopFilteredData(outboundFlights.filterData);
        setTmpFlights({
          qTraceId: decodedResponse.qTraceId,
          outbound: outboundFlights.flights,
          inbound: inboundFlights.flights,
        });
        setIsDropdownVisible(false);
        // Reset the selected flight after updating the response
        // setSelectedOutboundFlight(null);
        // setSelectedInboundFlight(null);
        // setOutboundCheckboxIndex(null);
        // setInboundCheckboxIndex(null);
        setSelectedOutboundFilters({
          stops: [],
          airlines: [],
          layovers: [],
          destinations: [],
          arrivals: [],
          price: {},
          cabinClasses: [],
          carrier: [],
        });
        setSelectedInboundFilters({
          stops: [],
          airlines: [],
          layovers: [],
          destinations: [],
          arrivals: [],
          price: {},
          cabinClasses: [],
          carrier: [],
        });
        setSelectedDesktopFilters({
          stops: [],
          airlines: [],
          layovers: [],
          destinations: [],
          arrivals: [],
          price: {},
          cabinClasses: [],
          carrier: [],
        });

        // select the first flight as default
        if (
          outboundFlights.flights.length > 0 &&
          inboundFlights.flights.length > 0
        ) {
          const selectedOutboundFlight = outboundFlights?.flights?.[0];
          const selectedInboundFlight = inboundFlights?.flights?.[0];
          setSelectedOutboundFlight(selectedOutboundFlight);
          setSelectedInboundFlight(selectedInboundFlight);
          setOutboundCheckboxIndex(0);
          setInboundCheckboxIndex(0);
          setIsClicked(true);
          setIsClicked1(true);
        }

        if (decodedResponse?.flightJourney === "international") {
          const response = {
            ...decodedResponse,
            flightJourney: "international",
            flightsResults: [outboundFlights, inboundFlights],
          };
          const compressedData = pako.deflate(JSON.stringify(response));
          setTabSpecificData("twoWayFlightResponse", compressedData);
        }
      }
    } catch (error) {
      console.log(error);
    }
  }

  // sorting function

  const handleClick = (id, criterion) => {
    setRotatedIcons((prevIcons) => {
      if (prevIcons.includes(id)) {
        const sortedResults = sortFlights(
          criterion,
          "asc",
          outboundFlights.flights,
          1
        );
        setOutboundFlights((prev) => ({ ...prev, flights: sortedResults }));
        return prevIcons.filter((iconId) => iconId !== id);
      } else {
        const sortedResults = sortFlights(
          criterion,
          "desc",
          outboundFlights.flights,
          2
        );
        setOutboundFlights((prev) => ({ ...prev, flights: sortedResults }));
        return [id];
      }
    });

    logEvent(analytics, "tw_sorting", {
      id: id,
      criterion: criterion,
      order: rotatedIcons.includes(id) ? "asc" : "desc",
    });
    setSortingCriteria((prev) => {
      return {
        ...prev,
        type: "outbound",
        criteria: criterion,
        order: rotatedIcons.includes(id) ? "asc" : "desc",
      };
    });
  };

  const handleInboundClick = (id, criterion) => {
    setRotatedInboundIcons((prevIcons) => {
      if (prevIcons.includes(id)) {
        const sortedResults = sortFlights(
          criterion,
          "asc",
          inboundFlights.flights,
          1
        );
        setInboundFlights((prev) => ({ ...prev, flights: sortedResults }));
        return prevIcons.filter((iconId) => iconId !== id);
      } else {
        const sortedResults = sortFlights(
          criterion,
          "desc",
          inboundFlights.flights,
          2
        );
        setInboundFlights((prev) => ({ ...prev, flights: sortedResults }));
        return [id];
      }
    });

    setSortingCriteria((prev) => {
      return {
        ...prev,
        type: "inbound",
        criteria: criterion,
        order: rotatedInboundIcons.includes(id) ? "asc" : "desc",
      };
    });
  };

  const sortFlights = (criterion, order, flights, type) => {
    let sortedFlights = [...flights];
    const sortedResults = sortedFlights.sort((a, b) => {
      switch (criterion) {
        case "price":
          const priceA = a.fare.offeredFareRoundedOff;
          const priceB = b.fare.offeredFareRoundedOff;
          return order === "asc" ? priceA - priceB : priceB - priceA;

        case "departure":
          const depTimeA = new Date(a.segments[0].segment[0].origin.depTime);
          const depTimeB = new Date(b.segments[0].segment[0].origin.depTime);
          return order === "asc" ? depTimeA - depTimeB : depTimeB - depTimeA;

        case "arrival":
          const arrTimeA = new Date(
            a.segments[0].segment[
              a.segments[0].segment.length - 1
            ].destination.arrTime
          );
          const arrTimeB = new Date(
            b.segments[0].segment[
              b.segments[0].segment.length - 1
            ].destination.arrTime
          );
          return order === "asc" ? arrTimeA - arrTimeB : arrTimeB - arrTimeA;

        case "duration":
          const durationA = a.segments[0].journeyDuration;
          const durationB = b.segments[0].journeyDuration;
          return order === "asc"
            ? durationA - durationB
            : durationB - durationA;

        default:
          return 0;
      }
    });

    return sortedResults;
    if (type === 1) {
      setOutboundFlights((prev) => ({ ...prev, flights: sortedResults }));
    } else {
      setInboundFlights((prev) => ({ ...prev, flights: sortedResults }));
    }
  };

  const areAnyFiltersDefined = (selectedFilters) => {
    const filters = Object.values(selectedFilters);
    for (const filter of filters) {
      if (Array.isArray(filter) && filter.length > 0) {
        return true;
      } else if (typeof filter === "object" && Object.keys(filter).length > 0) {
        return true;
      }
    }
    return false;
  };

  const findMatchingFlights = (filteredResult, flights) => {
    return flights.find(
      (flight) => flight.resultIndex === filteredResult.resultIndex
    );
  };

  const handleFlightResponse = (
    type,
    filteredResults,
    filterOutboundFlights,
    filterInboundFlights
  ) => {
    console.log(type);
    if (type === "outbound") {
      setOutboundFlights((prev) => ({ ...prev, flights: filteredResults }));
      if (flightsResponse?.flightJourney !== "domestic") {
        setInboundFlights((prev) => ({
          ...prev,
          flights: filterInboundFlights,
        }));
        const selectedInboundFlight = filterInboundFlights?.[0];
        setSelectedInboundFlight(selectedInboundFlight);
        setInboundCheckboxIndex(0);
        setIsClicked(true);
      }
    } else {
      setInboundFlights((prev) => ({ ...prev, flights: filteredResults }));
    }
  };

  const BottomSheetDetails = ({ isOpen, onClose, activeTab, index }) => {
    return (
      <div>
        {isOpen && (
          <div
            className={style.backdrop}
            onClick={() => onClose({ popupOpen: false, tab: null })}
          ></div>
        )}
        <div
          className={style.mainContainer}
          style={{
            display: isOpen ? "block" : "none",
            // position: "fixed",
            // width: "100%",
            // left: "0",
            // bottom: "0%",
            // height: "70%",
            // background: "#fff",
            // zIndex: "999999",
          }}
        >
          <button
            onClick={() => onClose({ popupOpen: false, tab: null })}
            className={style.backArrow}
          >
            <FontAwesomeIcon icon={faArrowLeft} />
          </button>
          {activeTab === "flightDetails" && isOpen && (
            <FlightDetails
              fareQuote={fareQuoteData}
              onClose={() => onClose({ popupOpen: false, tab: null })}
            />
          )}
          {activeTab === "fareDetails" && (
            <FareDetails
              onClose={() => onClose({ popupOpen: false, tab: null })}
              type={type}
              isInternational={
                flightsResponse?.flightJourney !== "domestic" ? true : false
              }
              fareDetails={fareDetailsData}
              selectedFlight={
                type === "outbound"
                  ? selectedOutboundFlight
                  : selectedInboundFlight
              }
              setSelectedFlight={
                type === "outbound"
                  ? setSelectedOutboundFlight
                  : setSelectedInboundFlight
              }
              setCheckboxIndex={
                type === "outbound"
                  ? setOutboundCheckboxIndex
                  : setInboundCheckboxIndex
              }
              setIsClicked={type === "outbound" ? setIsClicked1 : setIsClicked}
              index={index}
              handleDivClick1={handleDivClick1}
              qTraceId={flightsResponse.qTraceId}
            />
          )}
        </div>
      </div>
    );
  };

  const handleTabClick = async (tab, flight, index, type, event) => {
    event.stopPropagation();
    const setLoadingDetails = (loaderState, index) => {
      if (tab === "flightDetails") {
        if (type === "outbound") {
          setOutboundDetailsLoader(loaderState);
          setOutboundDetailsIndex(index);
        } else if (type === "inbound") {
          setInboundDetailsLoader(loaderState);
          setInboundDetailsIndex(index);
        }
      } else {
        if (type === "outbound") {
          setOutboundDetailsLoader(loaderState);
          setOutboundDetailsIndex(index);
        } else if (type === "inbound") {
          setInboundDetailsLoader(loaderState);
          setInboundDetailsIndex(index);
        }
      }
    };

    const setPopupAndData = (popupState, flightDetails) => {
      setActiveTab(tab);
      if (tab === "flightDetails") {
        if (type === "outbound") {
          setOutboundDetailsPopupOpen(popupState);
        } else if (type === "inbound") {
          setInboundDetailsPopupOpen(popupState);
        }
        setFareQuoteData(flightDetails);
      } else {
        setFareDetailsData(flightDetails);
        if (type === "outbound") {
          if (
            flightsResponse?.flightJourney !== "domestic" &&
            outboundCheckboxIndex === index
          ) {
            setFareDetailsData(inboundFlights.flights[inboundCheckboxIndex]);
          }
          setOutboundDetailsPopupOpen(popupState);
        } else if (type === "inbound") {
          setInboundDetailsPopupOpen(popupState);
        }

        setType(type);
      }
    };

    try {
      if (tab === "flightDetails") {
        setLoadingDetails(true, index);

        setPopupAndData(true, flight);
      } else if (tab === "fareDetails") {
        setLoadingDetails(true, index);
        setPopupAndData(true, flight);
      } else {
        setActiveTab(tab);
        setLoadingDetails(true, index);
        setPopupAndData(true, flight);
      }
    } catch (error) {
      console.log(error);
      let errorMessage =
        error?.response?.data?.error?.errorMessage[0]?.data ||
        "Something went wrong, please try after some time";
      if (
        error?.response?.data?.error?.errorMessage?.[0]?.data ===
        "Session timeout!!"
        // ||
        // error?.response?.data?.error?.errorMessage?.[0]?.data === "Fare Quote failed from the Supplier end. Please try again."
      ) {
        errorMessage =
          "Oops! Your session has expired. Please search Flights again.";
        setTimeout(() => {
          router.push("/flights/twoway/list"); // Redirect to a specific page
        }, 2000);
      } else if (
        error?.response?.data?.error?.errorMessage?.[0]?.data ===
        "Fare Quote failed from the Supplier end. Please try again."
      ) {
        errorMessage = "Something went wrong, please select different flight";
        setTimeout(() => {
          router.push("/flights/twoway/list");
        }, 2000);
      }
      if (!isToastVisible) {
        toast(errorMessage);
        setIsToastVisible(true);

        // Reset the flag after a specific duration (e.g., 3 seconds)
        setTimeout(() => {
          setIsToastVisible(false);
        }, 6000);
      }
    } finally {
      setLoadingDetails(false, index);
    }
  };

  const handleDesktopFilterData = (type) => {
    if (type === "outbound") {
      setDesktopFilteredData(outboundFlights?.filterData);
    } else if (type === "inbound") {
      setDesktopFilteredData(inboundFlights?.filterData);
    }
  };

  const showSelectedFlightInTop = (flights, selectedFlight) => {
    return flights.sort((a, b) => {
      if (a.resultIndex === selectedFlight?.resultIndex) return -1;
      if (b.resultIndex === selectedFlight?.resultIndex) return 1;
      return 0;
    });
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
        <div style={{ overflowX: "hidden" }}>
          {!corporateUser ? (
            // <CommonHeader />
            <B2CHeader/>
          ) : (
            <div style={{ backgroundColor: "#ffffff" }}>
              <Header />
            </div>
          )}

          {/* modify twoway flightlistiing */}

          <div className={style.desktopNavbar}>
            <DesktopNavigation
              updateFlights={updateFlightsResponse}
              defaultSelectedContent="twoWay"
              setPageLoading={setPageLoading}
              isRedirect={true}
              searchButtonDisabled={searchButtonDisabled}
              setSearchButtonDisabled={setSearchButtonDisabled}
              selectedTravelers={selectedTravelers}
              setSelectedTravelers={setSelectedTravelers}
              handleTravelerChange={handleTravelerChange}
            />
          </div>
          <div className={style.modifySection}>
            <div className={style.flightDetails}>
              <div>
                <FontAwesomeIcon icon={faArrowLeft} onClick={handleGoBack} />
              </div>
              <div>
                <div className={style.fromToDetails}>
                  {flightsRequest.fromCity}
                  <FontAwesomeIcon icon={faLeftRight} />
                  {flightsRequest.toCity}
                </div>
                <div className={style.dateclassDetails}>
                  {formatDateToDayMonth(
                    flightsRequest.searchReqData?.segments[0]
                      ?.preferredDepartureTime
                  )}
                  {" - "}
                  {formatDateToDayMonth(
                    flightsRequest.searchReqData?.segments[1]
                      ?.preferredDepartureTime
                  )}
                  <br />
                  <span>
                    {flightsRequest.searchReqData?.adultCount} Adult
                    {" | "}
                    {flightsRequest.searchReqData?.childCount} Child
                    {" | "}
                    {flightsRequest.searchReqData?.infantCount} Infant
                    {" | "}
                    {"Cabin Class - "}
                    {flightsRequest.FlightCabinClassText}
                  </span>
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
                    defaultSelectedContent="twoWay"
                    setPageLoading={setPageLoading}
                    isRedirect={true}
                    selectedTravelers={selectedTravelers}
                    setSelectedTravelers={setSelectedTravelers}
                    handleTravelerChange={handleTravelerChange}
                  // setIsSearching={setIsSearching}
                  // setIsDropdownVisible={setIsDropdownVisible}
                  />
                </div>
              </>
            )}
          </div>

          <div>
            {pageLoading || loading ? (
              // <Loader />
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
              <div
                className={`${style.completeContent} ${isInboundPopupOpen ? style.filterScroll : ""
                  } ${isOutboundPopupOpen ? style.filterScroll : ""} ${isDropdownVisible ? style.filterScroll : ""
                  }`}
              >
                <div className={style.filterContentContainer}>
                  <FiltersPop1
                    isOpen={true}
                    onClose={() => { }}
                    // filterData={desktopFilteredData}
                    // setFilterData={handleDesktopFilterData}
                    filterData={
                      activeButton === "fromTo"
                        ? outboundFlights?.filterData
                        : inboundFlights?.filterData
                    }
                    flightsResponse={flightsResponse}
                    setFlightsResponse={handleFlightResponse}
                    selectedFilters={
                      activeButton === "fromTo"
                        ? selectedOutboundFilters
                        : selectedInboundFilters
                    }
                    setSelectedFilters={
                      activeButton === "fromTo"
                        ? setSelectedOutboundFilters
                        : setSelectedInboundFilters
                    }
                    flightsRequest={flightsRequest}
                    activeButton={activeButton}
                    setActiveButton={setActiveButton}
                    type={"all"}
                    sortingCriteria={sortingCriteria}
                    setSortingCriteria={setSortingCriteria}
                    sortFlights={sortFlights}
                    setTmpFlights={setTmpFlights}
                    tmpFlights={tmpFlights}
                    selectedFlight={selectedFlight}
                    handleDivClick={handleDivClick}
                    handleDivClick1={handleDivClick1}
                    areAnyFiltersDefined={areAnyFiltersDefined}
                    outboundCheckboxIndex={outboundCheckboxIndex}
                    inboundCheckboxIndex={inboundCheckboxIndex}
                    dataToFilter={
                      activeButton === "fromTo"
                        ? outboundFlights?.flights
                        : inboundFlights?.flights
                    }
                    selectedFlightResponse={
                      activeButton === "fromTo"
                        ? selectedOutboundFlight
                        : selectedInboundFlight
                    }
                  />
                </div>

                <div className={style.rightContainer}>
                  {/* DESKTOP Departure and return filters button */}
                  <div className={style.filterBtnContainer}>
                    <div className={style.lefttoggles1}>
                      <div className={style.leftFilterBtn}>
                        <div>
                          <span className={style.filterBtnHead}>
                            Departure Flight
                          </span>
                          <div className={style.fromToCityNames}>
                            <span>{flightsRequest.fromCity}</span>
                            <FontAwesomeIcon icon={faArrowRight} />
                            <span>{flightsRequest.toCity}</span>
                          </div>
                        </div>
                        <div className={style.date}>
                          {formatDateToDayMonth(
                            flightsRequest.searchReqData?.segments[0]
                              ?.preferredDepartureTime
                          )}
                        </div>
                        <button className={style.depFilterBtn}>
                          <FontAwesomeIcon icon={faSliders} />
                          Filter
                        </button>
                      </div>
                      <div className={style.deplist}>
                        <button
                          className={`${style.toggle} ${rotatedIcons.includes("icon1")
                            ? style.activeButtons
                            : ""
                            }`}
                          onClick={() => handleClick("icon1", "price")}
                        >
                          <div style={{ display: "flex", gap: "0px" }}>
                            Price
                            <div className={style.iconcontainer1}>
                              <FontAwesomeIcon
                                icon={faChevronDown}
                                style={{ color: "#155EEF" }}
                                className={`${style.arrowDesktop} ${rotatedIcons.includes("icon1")
                                  ? style.rotated
                                  : ""
                                  }`}
                                id="icon1"
                              />
                            </div>
                          </div>
                        </button>

                        <button
                          className={`${style.toggle} ${rotatedIcons.includes("icon2")
                            ? style.activeButtons
                            : ""
                            }`}
                          onClick={() => handleClick("icon2", "departure")}
                        >
                          <div style={{ display: "flex", gap: "0px" }}>
                            Departure
                            <div className={style.iconcontainer1}>
                              <FontAwesomeIcon
                                icon={faChevronDown}
                                style={{ color: "#155EEF" }}
                                className={`${style.arrowDesktop} ${rotatedIcons.includes("icon2")
                                  ? style.rotated
                                  : ""
                                  }`}
                                id="icon2"
                              />
                            </div>
                          </div>
                        </button>
                        <button
                          className={`${style.toggle} ${rotatedIcons.includes("icon3")
                            ? style.activeButtons
                            : ""
                            }`}
                          onClick={() => handleClick("icon3", "arrival")}
                        >
                          <div style={{ display: "flex", gap: "0px" }}>
                            Arrival
                            <div className={style.iconcontainer1}>
                              <FontAwesomeIcon
                                icon={faChevronDown}
                                style={{ color: "#155EEF" }}
                                className={`${style.arrowDesktop} ${rotatedIcons.includes("icon3")
                                  ? style.rotated
                                  : ""
                                  }`}
                                id="icon3"
                              />
                            </div>
                          </div>
                        </button>
                        <button
                          className={`${style.toggle} ${rotatedIcons.includes("icon4")
                            ? style.activeButtons
                            : ""
                            }`}
                          onClick={() => handleClick("icon4", "duration")}
                        >
                          <div style={{ display: "flex", gap: "0px" }}>
                            Duration
                            <div className={style.iconcontainer1}>
                              <FontAwesomeIcon
                                icon={faChevronDown}
                                style={{ color: "#155EEF" }}
                                className={`${style.arrowDesktop} ${rotatedIcons.includes("icon4")
                                  ? style.rotated
                                  : ""
                                  }`}
                                id="icon4"
                              />
                            </div>
                          </div>
                        </button>
                      </div>
                    </div>

                    <div
                      className={style.lefttoggles1}
                      style={{ alignItems: "center" }}
                    >
                      <div className={style.rightFilterBtn}>
                        <div>
                          <span className={style.filterBtnHead}>
                            Return Flight
                          </span>
                          <div className={style.fromToCityNames}>
                            <span>{flightsRequest.toCity}</span>
                            <FontAwesomeIcon icon={faArrowRight} />
                            <span>{flightsRequest.fromCity}</span>
                          </div>
                        </div>
                        <div className={style.date}>
                          {formatDateToDayMonth(
                            flightsRequest.searchReqData?.segments[1]
                              ?.preferredDepartureTime
                          )}
                        </div>
                        <button className={style.retFilterBtn}>
                          <FontAwesomeIcon icon={faSliders} />
                          Filter
                        </button>
                      </div>
                      <div className={style.deplist}>
                        <button
                          className={`${style.toggle} ${rotatedInboundIcons.includes("inboundIcon1")
                            ? style.activeButtons
                            : ""
                            }`}
                          onClick={() =>
                            handleInboundClick("inboundIcon1", "price")
                          }
                        >
                          <div style={{ display: "flex", gap: "0px" }}>
                            Price
                            <div className={style.iconcontainer1}>
                              <FontAwesomeIcon
                                icon={faChevronDown}
                                style={{ color: "#155EEF" }}
                                className={`${style.arrowDesktop} ${rotatedInboundIcons.includes("inboundIcon1")
                                  ? style.rotated
                                  : ""
                                  }`}
                                id="inboundIcon1"
                              />
                            </div>
                          </div>
                        </button>

                        <button
                          className={`${style.toggle} ${rotatedInboundIcons.includes("inboundIcon2")
                            ? style.activeButtons
                            : ""
                            }`}
                          onClick={() =>
                            handleInboundClick("inboundIcon2", "departure")
                          }
                        >
                          <div style={{ display: "flex", gap: "0px" }}>
                            Departure
                            <div className={style.iconcontainer1}>
                              <FontAwesomeIcon
                                icon={faChevronDown}
                                style={{ color: "#155EEF" }}
                                className={`${style.arrowDesktop} ${rotatedInboundIcons.includes("inboundIcon2")
                                  ? style.rotated
                                  : ""
                                  }`}
                                id="inboundIcon2"
                              />
                            </div>
                          </div>
                        </button>

                        <button
                          className={`${style.toggle} ${rotatedInboundIcons.includes("inboundIcon3")
                            ? style.activeButtons
                            : ""
                            }`}
                          onClick={() =>
                            handleInboundClick("inboundIcon3", "arrival")
                          }
                        >
                          <div style={{ display: "flex", gap: "0px" }}>
                            Arrival
                            <div className={style.iconcontainer1}>
                              <FontAwesomeIcon
                                icon={faChevronDown}
                                style={{ color: "#155EEF" }}
                                className={`${style.arrowDesktop} ${rotatedInboundIcons.includes("inboundIcon3")
                                  ? style.rotated
                                  : ""
                                  }`}
                                id="inboundIcon3"
                              />
                            </div>
                          </div>
                        </button>

                        <button
                          className={`${style.toggle} ${rotatedInboundIcons.includes("inboundIcon4")
                            ? style.activeButtons
                            : ""
                            }`}
                          onClick={() =>
                            handleInboundClick("inboundIcon4", "duration")
                          }
                        >
                          <div style={{ display: "flex", gap: "0px" }}>
                            Duration
                            <div className={style.iconcontainer1}>
                              <FontAwesomeIcon
                                icon={faChevronDown}
                                style={{ color: "#155EEF" }}
                                className={`${style.arrowDesktop} ${rotatedInboundIcons.includes("inboundIcon4")
                                  ? style.rotated
                                  : ""
                                  }`}
                                id="inboundIcon4"
                              />
                            </div>
                          </div>
                        </button>
                      </div>
                    </div>
                  </div>
                  <div className={style.resultFound}>
                    <div>
                      Showing
                      <span className={style.textWithPadding}>
                        {outboundFlights?.flights?.length}
                      </span>
                      Results
                    </div>

                    <div className={style.results}>
                      Showing
                      <span className={style.textWithPadding}>
                        {inboundFlights?.flights?.length}
                      </span>
                      Results
                    </div>
                  </div>

                  {/* MOBILE Departure and return filters button */}
                  <div className={style.rightContainer1}>
                    <div className={style.filterBtnContainer}>
                      <div className={style.leftFilterBtn}>
                        <div>
                          <span className={style.filterBtnHead}>
                            Departure Flight
                          </span>
                          <div className={style.fromToCityNames}>
                            <span>{flightsRequest.fromCity}</span>
                            <FontAwesomeIcon icon={faArrowRight} />
                            <span>{flightsRequest.toCity}</span>
                          </div>
                        </div>
                      </div>
                      <div className={style.rightFilterBtn}>
                        <div>
                          <span className={style.filterBtnHead}>
                            Return Flight
                          </span>
                          <div className={style.fromToCityNames}>
                            <span>{flightsRequest.toCity}</span>
                            <FontAwesomeIcon icon={faArrowRight} />
                            <span>{flightsRequest.fromCity}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Mobile view toggle line*/}
                  <div className={style.allTogglesLine}>
                    <div className={style.leftToggles}>
                      <button
                        onClick={() =>
                          setShowSortingOptions(!showSortingOptions)
                        }
                        className={style.hiddenSortBtn}
                      >
                        Sort
                        <FontAwesomeIcon
                          icon={faArrowRightArrowLeft}
                          rotation={90}
                        />
                      </button>
                      {showSortingOptions && (
                        <>
                          <div
                            className={style.backdrop}
                            onClick={() => setShowSortingOptions(false)}
                          ></div>
                          <div className={style.hiddenSort}>
                            <button
                              className={`${style.toggle} ${rotatedIcons.includes("icon1")
                                ? style.activeButtons
                                : ""
                                }`}
                              onClick={() => {
                                handleClick("icon1", "price");
                                setShowSortingOptions(false);
                              }}
                            >
                              <div
                                style={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: "2px",
                                }}
                              >
                                Price
                                <FontAwesomeIcon
                                  icon={faChevronDown}
                                  style={{ color: "#155EEF" }}
                                  className={`${style.arrowDesktop} ${rotatedIcons.includes("icon1")
                                    ? style.rotated
                                    : ""
                                    }`}
                                  id="icon1"
                                />
                              </div>
                            </button>
                            <button
                              className={`${style.toggle} ${rotatedIcons.includes("icon2")
                                ? style.activeButtons
                                : ""
                                }`}
                              onClick={() => {
                                handleClick("icon2", "departure");
                                setShowSortingOptions(false);
                              }}
                            >
                              <div
                                style={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: "2px",
                                }}
                              >
                                Departure
                                <div className={style.iconcontainer1}>
                                  <FontAwesomeIcon
                                    icon={faChevronDown}
                                    style={{ color: "#155EEF" }}
                                    className={`${style.arrowDesktop} ${rotatedIcons.includes("icon2")
                                      ? style.rotated
                                      : ""
                                      }`}
                                    id="icon2"
                                  />
                                </div>
                              </div>
                            </button>
                            <button
                              className={`${style.toggle} ${rotatedIcons.includes("icon3")
                                ? style.activeButtons
                                : ""
                                }`}
                              onClick={() => {
                                handleClick("icon3", "arrival");
                                setShowSortingOptions(false);
                              }}
                            >
                              <div
                                style={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: "2px",
                                }}
                              >
                                Arrival
                                <div className={style.iconcontainer1}>
                                  <FontAwesomeIcon
                                    icon={faChevronDown}
                                    style={{ color: "#155EEF" }}
                                    className={`${style.arrowDesktop} ${rotatedIcons.includes("icon3")
                                      ? style.rotated
                                      : ""
                                      }`}
                                    id="icon3"
                                  />
                                </div>
                              </div>
                            </button>
                            <button
                              className={`${style.toggle} ${rotatedIcons.includes("icon4")
                                ? style.activeButtons
                                : ""
                                }`}
                              onClick={() => {
                                handleClick("icon4", "duration");
                                setShowSortingOptions(false);
                              }}
                            >
                              <div
                                style={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: "2px",
                                }}
                              >
                                Duration
                                <div className={style.iconcontainer1}>
                                  <FontAwesomeIcon
                                    icon={faChevronDown}
                                    style={{ color: "#155EEF" }}
                                    className={`${style.arrowDesktop} ${rotatedIcons.includes("icon4")
                                      ? style.rotated
                                      : ""
                                      }`}
                                    id="icon4"
                                  />
                                </div>
                              </div>
                            </button>
                          </div>
                        </>
                      )}
                      <>
                        <button
                          className={style.depFilterBtn}
                          onClick={toggleOutboundPopup}
                        >
                          <FontAwesomeIcon icon={faSliders} />
                          Filter
                        </button>
                        {isOutboundPopupOpen && (
                          <FiltersPop1
                            isOpen={isOutboundPopupOpen}
                            onClose={() => setIsOutboundPopupOpen(false)}
                            filterData={outboundFlights.filterData}
                            flightsResponse={flightsResponse}
                            // setFlightsResponse={setOutboundFlights}
                            setFlightsResponse={handleFlightResponse}
                            selectedFilters={selectedOutboundFilters}
                            setSelectedFilters={setSelectedOutboundFilters}
                            flightsRequest={flightsRequest}
                            type={"outbound"}
                            sortingCriteria={sortingCriteria}
                            setSortingCriteria={setSortingCriteria}
                            sortFlights={sortFlights}
                            setTmpFlights={setTmpFlights}
                            tmpFlights={tmpFlights}
                            selectedFlight={selectedFlight}
                            handleDivClick={handleDivClick}
                            handleDivClick1={handleDivClick1}
                            areAnyFiltersDefined={areAnyFiltersDefined}
                            outboundCheckboxIndex={outboundCheckboxIndex}
                            inboundCheckboxIndex={inboundCheckboxIndex}
                            dataToFilter={outboundFlights.flights}
                            selectedFlightResponse={selectedOutboundFlight}
                          />
                        )}
                      </>
                    </div>
                    <div
                      className={style.leftToggles}
                    //  style={{ backgroundColor: "#9747ff" }}
                    >
                      <button
                        onClick={() =>
                          setShowSortingOptions2(!showSortingOptions2)
                        }
                        className={style.hiddenSortBtn}
                      // style={{ backgroundColor: "#9747ff" }}
                      >
                        Sort
                        <FontAwesomeIcon
                          icon={faArrowRightArrowLeft}
                          rotation={90}
                        />
                      </button>
                      {showSortingOptions2 && (
                        <>
                          <div
                            className={style.backdrop}
                            onClick={() => setShowSortingOptions2(false)}
                          ></div>
                          <div className={style.hiddenSort1}>
                            <button
                              className={`${style.toggle} ${rotatedInboundIcons.includes("inboundIcon1")
                                ? style.activeButtons
                                : ""
                                }`}
                              onClick={() => {
                                handleInboundClick("inboundIcon1", "price");
                                setShowSortingOptions2(false);
                              }}
                            >
                              <div
                                style={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: "2px",
                                }}
                              >
                                Price
                                <FontAwesomeIcon
                                  icon={faChevronDown}
                                  style={{ color: "#155EEF" }}
                                  className={`${style.arrowDesktop} ${rotatedInboundIcons.includes("inboundIcon1")
                                    ? style.rotated
                                    : ""
                                    }`}
                                  id="inboundIcon1"
                                />
                              </div>
                            </button>
                            <button
                              className={`${style.toggle} ${rotatedInboundIcons.includes("inboundIcon2")
                                ? style.activeButtons
                                : ""
                                }`}
                              onClick={() => {
                                handleInboundClick("inboundIcon2", "departure");
                                setShowSortingOptions2(false);
                              }}
                            >
                              <div
                                style={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: "2px",
                                }}
                              >
                                Departure
                                <FontAwesomeIcon
                                  icon={faChevronDown}
                                  style={{ color: "#155EEF" }}
                                  className={`${style.arrowDesktop} ${rotatedInboundIcons.includes("inboundIcon2")
                                    ? style.rotated
                                    : ""
                                    }`}
                                  id="inboundIcon2"
                                />
                              </div>
                            </button>
                            <button
                              className={`${style.toggle} ${rotatedInboundIcons.includes("inboundIcon3")
                                ? style.activeButtons
                                : ""
                                }`}
                              onClick={() => {
                                handleInboundClick("inboundIcon3", "arrival");
                                setShowSortingOptions2(false);
                              }}
                            >
                              <div
                                style={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: "2px",
                                }}
                              >
                                Arrival
                                <FontAwesomeIcon
                                  icon={faChevronDown}
                                  style={{ color: "#155EEF" }}
                                  className={`${style.arrowDesktop} ${rotatedInboundIcons.includes("inboundIcon3")
                                    ? style.rotated
                                    : ""
                                    }`}
                                  id="inboundIcon3"
                                />
                              </div>
                            </button>
                            <button
                              className={`${style.toggle} ${rotatedInboundIcons.includes("inboundIcon4")
                                ? style.activeButtons
                                : ""
                                }`}
                              onClick={() => {
                                handleInboundClick("inboundIcon4", "duration");
                                setShowSortingOptions2(false);
                              }}
                            >
                              <div
                                style={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: "2px",
                                }}
                              >
                                Duration
                                <FontAwesomeIcon
                                  icon={faChevronDown}
                                  style={{ color: "#155EEF" }}
                                  className={`${style.arrowDesktop} ${rotatedInboundIcons.includes("inboundIcon4")
                                    ? style.rotated
                                    : ""
                                    }`}
                                  id="inboundIcon4"
                                />
                              </div>
                            </button>
                          </div>
                        </>
                      )}
                      <>
                        <button
                          className={style.retFilterBtn}
                          onClick={toggleInboundPopup}
                        >
                          <FontAwesomeIcon icon={faSliders} />
                          Filter
                        </button>
                        {isInboundPopupOpen && (
                          <FiltersPop1
                            isOpen={isInboundPopupOpen}
                            onClose={() => setIsInboundPopupOpen(false)}
                            filterData={inboundFlights.filterData}
                            flightsResponse={flightsResponse}
                            // setFlightsResponse={setInboundFlights}
                            setFlightsResponse={handleFlightResponse}
                            selectedFilters={selectedInboundFilters}
                            setSelectedFilters={setSelectedInboundFilters}
                            flightsRequest={flightsRequest}
                            type={"inbound"}
                            sortingCriteria={sortingCriteria}
                            setSortingCriteria={setSortingCriteria}
                            sortFlights={sortFlights}
                            setTmpFlights={setTmpFlights}
                            tmpFlights={tmpFlights}
                            selectedFlight={selectedFlight}
                            handleDivClick={handleDivClick}
                            handleDivClick1={handleDivClick1}
                            areAnyFiltersDefined={areAnyFiltersDefined}
                            outboundCheckboxIndex={outboundCheckboxIndex}
                            inboundCheckboxIndex={inboundCheckboxIndex}
                            dataToFilter={inboundFlights.flights}
                            selectedFlightResponse={selectedInboundFlight}
                          />
                        )}
                      </>
                    </div>
                  </div>

                  <div className={style.resultFound1}>
                    <div>
                      Showing
                      <span className={style.textWithPadding}>
                        {outboundFlights?.flights?.length}
                      </span>
                      Results
                    </div>

                    <div className={style.resuls}>
                      Showing
                      <span className={style.textWithPadding}>
                        {inboundFlights?.flights?.length}
                      </span>
                      Results
                    </div>
                  </div>

                  {/* divide page left and right with results */}
                  <div className={style.contentTickets}>
                    <div className={style.leftPartContent}>
                      {outboundFlights?.flights?.map((flight, index) => {
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

                        // Calculate overall seats
                        // const overallSeats = segments.reduce(
                        //   (acc, segment) => acc + segment.seatsAvailable,
                        //   0
                        // );
                        const overallSeats = segments[0].seatsAvailable;
                        const cabinClass =
                          flight.segments[0].segment[0].cabinClassName;

                        const numOfDays = handleFlightDuration(
                          origin.origin.depTime,
                          destination.destination.arrTime
                        );

                        return (
                          <div
                            key={index}
                            className={`${style.flightTicket} ${isClicked1 &&
                              (selectedOutboundFlight?.resultIndex ===
                                flight?.resultIndex ||
                                flight.fareClassification.some(
                                  (fare) =>
                                    fare.resultIndex ===
                                    selectedOutboundFlight?.resultIndex
                                ))
                              ? style.clicked1Mob
                              : ""
                              }`}
                            onClick={
                              activeTab !== "fareDetails"
                                ? () => handleDivClick1(flight, index)
                                : undefined
                            }
                          >
                            <div
                              style={{
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                              }}
                              className={style.imagecontainer}
                            >
                              <div>
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
                                        fontSize: "10px",
                                      }}
                                    >
                                      {origin.airline.airlineCode}-
                                      {origin.airline.flightNumber}
                                    </div>
                                  </div>
                                </div>
                              </div>
                              <div
                                style={{
                                  display: "flex",
                                  flexDirection: "column",
                                  lineHeight: "1.2",
                                }}
                                className={style.priceandperson}
                              >
                                <div className={style.rightpartTicket1}>
                                  <span className={style.FareDetails1}>
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
                                </div>
                                <span className={style.costFlight}>
                                  Rs{" "}
                                  {formatPrice(
                                    flight.fare.offeredFareRoundedOff
                                  )}
                                </span>
                                {/* <span className={style.perPerson}>Per person</span> */}
                              </div>
                              <input
                                className={`${style.mydiv} ${isClicked1 &&
                                  (selectedOutboundFlight?.resultIndex ===
                                    flight?.resultIndex ||
                                    flight.fareClassification.some(
                                      (fare) =>
                                        fare.resultIndex ===
                                        selectedOutboundFlight?.resultIndex
                                    ))
                                  ? style.clicked1
                                  : ""
                                  }`}
                                type="radio"
                                name="outboundSelection"
                                // value={/* assign a value to this radio button */}
                                // readOnly
                                onClick={(e) => {
                                  if (activeTab !== "fareDetails") {
                                    handleDivClick1(flight, index);
                                    e.stopPropagation();
                                  }
                                }}
                                checked={
                                  selectedOutboundFlight?.resultIndex ===
                                  flight?.resultIndex ||
                                  flight.fareClassification.some(
                                    (fare) =>
                                      fare.resultIndex ===
                                      selectedOutboundFlight?.resultIndex
                                  )
                                }
                              />
                            </div>
                            <div className={style.fromToTiming}>
                              <div className={style.Timing}>
                                <div
                                  style={{
                                    display: "flex",
                                    flexDirection: "column",
                                  }}
                                >
                                  <div className={style.timeBlock}>
                                    <span className={style.fromToTime}>
                                      {formatTime(origin.origin.depTime)}
                                    </span>
                                    {/* <span className={style.pm}>Pm</span> */}
                                  </div>

                                  <span className={style.fromToCityCode}>
                                    {origin.origin.airport.cityCode}
                                  </span>
                                </div>
                                <div className={style.btwLineContent}>
                                  <div className={style.toptiming}>
                                    <div className={style.dashLineText}>
                                      {formatDuration(journeyDuration)}
                                    </div>
                                    <div className={style.dashLineText2}>|</div>
                                    <div className={style.dashLineText1}>
                                      {flight.segments[0].stops}{" "}
                                      {flight.segments[0].stops <= 1
                                        ? "Stop"
                                        : "Stops"}
                                    </div>
                                  </div>
                                  <div className={style.dashLine}></div>
                                  <div className={style.bottomline}>
                                    <span className={style.weighttext}>
                                      {/* {flight.segments[0].segment[0].cabinBaggage}, */}
                                    </span>
                                    <span className={style.weighttext}>
                                      {/* {flight.segments[0].segment[0].baggage}, */}
                                    </span>
                                    <span className={style.refund}>
                                      {flight.isRefundable
                                        ? "Refundable"
                                        : "Non Refundable"}
                                    </span>
                                  </div>
                                  <div className={style.dashLineTextBottom}>
                                    {flight.segments[0].stops}{" "}
                                    {flight.segments[0].stops <= 1
                                      ? "Stop"
                                      : "Stops"}
                                  </div>
                                </div>
                                <div
                                  style={{
                                    display: "flex",
                                    flexDirection: "column",
                                  }}
                                >
                                  <div className={style.timeBlock}>
                                    <span className={style.fromToTime}>
                                      {formatTime(
                                        destination.destination.arrTime
                                      )}
                                    </span>
                                    {numOfDays > 0 && (
                                      <span className={style.addingdays}>
                                        (+{numOfDays}D)
                                      </span>
                                    )}

                                    {/* <span className={style.pm}>Pm</span> */}
                                  </div>

                                  <span className={style.fromToCityCode}>
                                    {destination.destination.airport.cityCode}
                                  </span>
                                </div>
                              </div>
                              <div className={style.middlepartTicket}>
                                <FontAwesomeIcon
                                  icon={faCircle}
                                  className={style.circleFlightTicket}
                                  style={{
                                    color: "rgba(229, 233, 235, 0.46)",
                                  }}
                                />
                                <div className={style.verticalRule}></div>
                                <FontAwesomeIcon
                                  icon={faCircle}
                                  className={style.circleFlightTicket}
                                  style={{
                                    color: "rgba(229, 233, 235, 0.46)",
                                  }}
                                />
                              </div>
                              <div className={style.rightpartTicket}>
                                <div style={{ position: "relative" }}>
                                  <span
                                    className={style.priceSize}
                                    style={{
                                      textWrap: "nowrap",
                                      cursor: "pointer",
                                      fontWeight: "550",
                                    }}
                                    onClick={handleToggleTooltip1}
                                  >
                                    Rs{" "}
                                    {formatPrice(
                                      flight.fare.offeredFareRoundedOff
                                    )}
                                  </span>
                                </div>
                                {/* <SideSheet isOpen={isSideSheetOpen} onClose={handleCloseSideSheet} /> */}
                                {!isNaN(overallSeats) && (
                                  <span className={style.seatsLeftDetails1}>
                                    {overallSeats} Seats Left
                                  </span>
                                )}
                              </div>
                            </div>
                            <div className={style.flightFareToggles}>
                              <div
                                style={{
                                  display: "flex",
                                  gap: "10px",
                                  color: "#155EEF",
                                  whiteSpace: "nowrap",
                                }}
                              >
                                <span
                                  style={{ textDecoration: "underline" }}
                                  className={style.flightDetails1}
                                  onClick={(event) =>
                                    handleTabClick(
                                      "flightDetails",
                                      flight,
                                      index,
                                      "outbound",
                                      event
                                    )
                                  }
                                >
                                  {outboundDetailsLoader &&
                                    outboundDetailsIndex === index
                                    ? "Loading..."
                                    : "Flight Details"}
                                </span>
                                {/* {flightsResponse?.flightJourney ===
                                "domestic" && ( */}
                                <div
                                  style={{
                                    marginLeft: "10px",
                                    textDecoration: "underline",
                                  }}
                                  className={style.fareDetails}
                                  onClick={(event) =>
                                    handleTabClick(
                                      "fareDetails",
                                      flight,
                                      index,
                                      "outbound",
                                      event
                                    )
                                  }
                                >
                                  More Fares
                                </div>
                                {outboundDetailsIndex === index && (
                                  <BottomSheetDetails
                                    isOpen={outboundDetailsPopupOpen}
                                    onClose={({ popupOpen, tab }) => {
                                      setOutboundDetailsPopupOpen(popupOpen);
                                      setActiveTab(tab);
                                    }}
                                    activeTab={activeTab}
                                    index={index}
                                  />
                                )}

                                {/* <div className={style.fareclass}>{cabinClass}</div> */}
                              </div>
                              {!isNaN(overallSeats) && (
                                <span className={style.seatsLeftDetails}>
                                  {overallSeats} Seats Left
                                </span>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                    <div className={style.rightPartContent}>
                      {inboundFlightsLoader &&
                        flightsResponse?.flightJourney === "international" && (
                          <div>Loading.....</div>
                        )}
                      {inboundFlights &&
                        inboundFlights?.flights?.map((flight, index) => {
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

                          // Calculate overall seats
                          // const overallSeats = segments.reduce(
                          //   (acc, segment) => acc + segment.seatsAvailable,
                          //   0
                          // );
                          const overallSeats = segments[0].seatsAvailable;
                          const cabinClass =
                            flight.segments[0].segment[0].cabinClassName;

                          const numOfDays = handleFlightDuration(
                            origin.origin.depTime,
                            destination.destination.arrTime
                          );

                          return (
                            <div
                              key={index}
                              className={`${style.flightTicket} ${isClicked &&
                                (selectedInboundFlight?.resultIndex ===
                                  flight?.resultIndex ||
                                  flight.fareClassification.some(
                                    (fare) =>
                                      fare.resultIndex ===
                                      selectedInboundFlight?.resultIndex
                                  ))
                                ? style.clickedMob
                                : ""
                                }`}
                              onClick={
                                activeTab !== "fareDetails"
                                  ? () => handleDivClick(flight, index)
                                  : undefined
                              }
                            >
                              <div
                                style={{
                                  display: "flex",
                                  justifyContent: "space-between",
                                  alignItems: "center",
                                }}
                              >
                                <div>
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
                                          fontSize: "10px",
                                        }}
                                      >
                                        {origin.airline.airlineCode}-
                                        {origin.airline.flightNumber}
                                      </div>
                                    </div>
                                  </div>
                                </div>
                                <div
                                  style={{
                                    display: "flex",
                                    flexDirection: "column",
                                    lineHeight: "1.2",
                                  }}
                                  className={style.priceandperson}
                                >
                                  <div className={style.rightpartTicket1}>
                                    <span className={style.FareDetails1}>
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
                                  </div>
                                  <span className={style.costFlight}>
                                    Rs{" "}
                                    {formatPrice(
                                      flight.fare.offeredFareRoundedOff
                                    )}
                                  </span>
                                  {/* <span className={style.perPerson}>Per person</span> */}
                                </div>
                                <input
                                  type="radio"
                                  name="inboundSelection"
                                  className={`${style.mydiv1} ${isClicked &&
                                    (selectedInboundFlight?.resultIndex ===
                                      flight?.resultIndex ||
                                      flight.fareClassification.some(
                                        (fare) =>
                                          fare.resultIndex ===
                                          selectedInboundFlight?.resultIndex
                                      ))
                                    ? style.clicked
                                    : ""
                                    }`}
                                  onClick={(e) => {
                                    if (activeTab !== "fareDetails") {
                                      handleDivClick(flight, index);
                                      e.stopPropagation();
                                    }
                                  }}
                                  checked={
                                    selectedInboundFlight?.resultIndex ===
                                    flight?.resultIndex ||
                                    flight.fareClassification.some(
                                      (fare) =>
                                        fare.resultIndex ===
                                        selectedInboundFlight?.resultIndex
                                    )
                                  }
                                />
                              </div>
                              <div className={style.fromToTiming}>
                                <div className={style.Timing}>
                                  <div
                                    style={{
                                      display: "flex",
                                      flexDirection: "column",
                                    }}
                                  >
                                    <div className={style.timeBlock}>
                                      <span className={style.fromToTime}>
                                        {formatTime(origin.origin.depTime)}
                                      </span>
                                      {/* <span className={style.pm}>Pm</span> */}
                                    </div>
                                    <span className={style.fromToCityCode}>
                                      {origin.origin.airport.cityCode}
                                    </span>
                                  </div>
                                  <div className={style.btwLineContent}>
                                    <div className={style.toptiming}>
                                      <div className={style.dashLineText}>
                                        {formatDuration(journeyDuration)}
                                      </div>
                                      <div className={style.dashLineText2}>
                                        |
                                      </div>
                                      <div className={style.dashLineText1}>
                                        {flight.segments[0].stops}{" "}
                                        {flight.segments[0].stops <= 1
                                          ? "Stop"
                                          : "Stops"}
                                      </div>
                                    </div>
                                    <div className={style.dashLine}></div>
                                    <div className={style.bottomline}>
                                      <span className={style.weighttext}>
                                        {/* {flight.segments[0].segment[0].cabinBaggage}, */}
                                      </span>
                                      <span className={style.weighttext}>
                                        {/* {flight.segments[0].segment[0].baggage}, */}
                                      </span>
                                      <span className={style.refund}>
                                        {flight.isRefundable
                                          ? "Refundable"
                                          : "Non Refundable"}
                                      </span>
                                    </div>
                                    <div className={style.dashLineTextBottom}>
                                      {flight.segments[0].stops}{" "}
                                      {flight.segments[0].stops <= 1
                                        ? "Stop"
                                        : "Stops"}
                                    </div>
                                  </div>
                                  <div
                                    style={{
                                      display: "flex",
                                      flexDirection: "column",
                                    }}
                                  >
                                    <div className={style.timeBlock}>
                                      <span className={style.fromToTime}>
                                        {formatTime(
                                          destination.destination.arrTime
                                        )}
                                      </span>
                                      {/* <span className={style.pm}>Pm</span> */}
                                      {numOfDays > 0 && (
                                        <span className={style.addingdays}>
                                          (+{numOfDays}D)
                                        </span>
                                      )}
                                    </div>
                                    <span className={style.fromToCityCode}>
                                      {" "}
                                      {destination.destination.airport.cityCode}
                                    </span>
                                  </div>
                                </div>
                                <div className={style.middlepartTicket}>
                                  <FontAwesomeIcon
                                    icon={faCircle}
                                    className={style.circleFlightTicket}
                                    style={{
                                      color: "rgba(229, 233, 235, 0.46)",
                                    }}
                                  />
                                  <div className={style.verticalRule}></div>
                                  <FontAwesomeIcon
                                    icon={faCircle}
                                    className={style.circleFlightTicket}
                                    style={{
                                      color: "rgba(229, 233, 235, 0.46)",
                                    }}
                                  />
                                </div>
                                <div className={style.rightpartTicket}>
                                  <div style={{ position: "relative" }}>
                                    <span
                                      className={style.priceSize}
                                      style={{
                                        textWrap: "nowrap",
                                        cursor: "pointer",
                                        fontWeight: "550",
                                      }}
                                      onClick={handleToggleTooltip}
                                    >
                                      Rs{" "}
                                      {formatPrice(
                                        flight.fare.offeredFareRoundedOff
                                      )}
                                    </span>
                                  </div>
                                  {/* <SideSheet isOpen={isSideSheetOpen} onClose={handleCloseSideSheet} /> */}
                                  {!isNaN(overallSeats) && (
                                    <span className={style.seatsLeftDetails1}>
                                      {overallSeats} Seats Left
                                    </span>
                                  )}
                                </div>
                              </div>
                              <div className={style.flightFareToggles}>
                                <div
                                  style={{
                                    display: "flex",
                                    gap: "10px",
                                    color: "#155EEF",
                                    whiteSpace: "nowrap",
                                  }}
                                >
                                  <span
                                    style={{ textDecoration: "underline" }}
                                    // onClick={() => handleTabClick('flightDetails')}
                                    className={style.flightDetails1}
                                    onClick={(event) =>
                                      handleTabClick(
                                        "flightDetails",
                                        flight,
                                        index,
                                        "inbound",
                                        event
                                      )
                                    }
                                  >
                                    {inboundDetailsLoader &&
                                      inboundDetailsIndex === index
                                      ? "Loading..."
                                      : "Flight Details"}
                                  </span>
                                  <div
                                    style={{
                                      marginLeft: "10px",
                                      textDecoration: "underline",
                                    }}
                                    className={style.fareDetails}
                                    onClick={(event) =>
                                      handleTabClick(
                                        "fareDetails",
                                        flight,
                                        index,
                                        "inbound",
                                        event
                                      )
                                    }
                                  >
                                    More Fares
                                  </div>
                                  {inboundDetailsIndex === index && (
                                    <BottomSheetDetails
                                      isOpen={inboundDetailsPopupOpen}
                                      onClose={({ popupOpen, tab }) => {
                                        setInboundDetailsPopupOpen(popupOpen);
                                        setActiveTab(tab);
                                      }}
                                      activeTab={activeTab}
                                      index={index}
                                    />
                                  )}
                                  {/* <div className={style.fareclass}>
                                {segments[0].cabinClassName}
                              </div> */}
                                </div>

                                {!isNaN(overallSeats) && (
                                  <span className={style.seatsLeftDetails}>
                                    {overallSeats} Seats Left
                                  </span>
                                )}
                              </div>
                            </div>
                          );
                        })}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {!pageLoading &&
            (selectedOutboundFlight || selectedInboundFlight) &&
            !noResultsFlag ? (
            <div
              className={style.fixedBottomDetails}
              style={{
                display:
                  isOutboundPopupOpen || isDropdownVisible || isInboundPopupOpen
                    ? "none"
                    : "flex",
              }}
            >
              {selectedOutboundFlight && (
                <div className={style.leftBottomDetails}>
                  <div className={style.bottomHead}>
                    Departure
                    <div className={style.destinationboxmain}>
                      <div className={style.destinationboxmain2}>
                        <div className={style.destinationbox}>
                          <div className={style.bottomSmallHead}>
                            {
                              selectedOutboundFlight.segments[0].segment[0]
                                .airline.airlineName
                            }{" "}
                            |{" "}
                            {
                              selectedOutboundFlight.segments[0].segment[0]
                                .airline.airlineCode
                            }
                          </div>

                          <div className={style.depBottomdetails}>
                            <div>
                              <span>
                                {
                                  selectedOutboundFlight.segments[0].segment[0]
                                    .origin.airport.airportCode
                                }
                              </span>
                              -
                              <span>
                                {
                                  selectedOutboundFlight.segments[0].segment[
                                    selectedOutboundFlight.segments[0].segment
                                      .length - 1
                                  ].destination.airport.airportCode
                                }
                              </span>
                            </div>
                          </div>
                        </div>
                        <div>
                          <span>
                            {formatTime(
                              selectedOutboundFlight.segments[0].segment[0]
                                .origin.depTime
                            )}
                          </span>
                          -
                          <span>
                            {formatTime(
                              selectedOutboundFlight.segments[0].segment[
                                selectedOutboundFlight.segments[0].segment
                                  .length - 1
                              ].destination.arrTime
                            )}
                          </span>
                          <br />
                          <span>
                            {formatDuration(
                              calculateTotalDuration(
                                selectedOutboundFlight.segments[0].segment
                              )
                            )}
                          </span>
                        </div>
                      </div>
                      <div>
                        {flightsResponse?.flightJourney === "domestic" && (
                          <div className={style.priceBottomDetails}>
                            Rs{" "}
                            {formatPrice(
                              selectedOutboundFlight.fare.offeredFareRoundedOff
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}
              {selectedInboundFlight && (
                <div className={style.middleBottomDetails}>
                  <div className={style.bottomHead}>
                    Return
                    <div className={style.destinationboxmain}>
                      <div className={style.destinationboxmain2}>
                        <div className={style.destinationbox}>
                          <div className={style.bottomSmallHead}>
                            {
                              selectedInboundFlight.segments[0].segment[0]
                                .airline.airlineName
                            }{" "}
                            |{" "}
                            {
                              selectedInboundFlight.segments[0].segment[0]
                                .airline.airlineCode
                            }
                          </div>

                          <div className={style.depBottomdetails}>
                            <div>
                              <span>
                                {
                                  selectedInboundFlight.segments[0].segment[0]
                                    .origin.airport.airportCode
                                }
                              </span>
                              -
                              <span>
                                {
                                  selectedInboundFlight.segments[0].segment[
                                    selectedInboundFlight.segments[0].segment
                                      .length - 1
                                  ].destination.airport.airportCode
                                }
                              </span>
                            </div>
                          </div>
                        </div>
                        <div>
                          <span>
                            {formatTime(
                              selectedInboundFlight.segments[0].segment[0]
                                .origin.depTime
                            )}
                          </span>
                          -
                          <span>
                            {formatTime(
                              selectedInboundFlight.segments[0].segment[
                                selectedInboundFlight.segments[0].segment
                                  .length - 1
                              ].destination.arrTime
                            )}
                          </span>
                          <br />
                          <span>
                            {formatDuration(
                              calculateTotalDuration(
                                selectedInboundFlight.segments[0].segment
                              )
                            )}
                          </span>
                        </div>
                      </div>
                      <div>
                        {flightsResponse?.flightJourney === "domestic" && (
                          <div className={style.priceBottomDetails}>
                            Rs{" "}
                            {formatPrice(
                              selectedInboundFlight.fare.offeredFareRoundedOff
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}
              <div className={style.rightBottomDetails}>
                <span className={style.totalHead}>Total Trip Amount</span>
                <span className={style.totalAmount}>
                  Rs{" "}
                  {formatPrice(
                    flightsResponse.flightJourney !== "international"
                      ? (selectedOutboundFlight?.fare?.offeredFareRoundedOff ||
                        0) +
                      (selectedInboundFlight?.fare?.offeredFareRoundedOff ||
                        0) || 0
                      : selectedInboundFlight?.fare?.offeredFareRoundedOff || 0
                  )}
                </span>
                <button
                  className={style.selectButton}
                  onClick={handleSelectButtonClick}
                >
                  {selectButtonLoader ? (
                    <div className="loadingSpinner"></div>
                  ) : (
                    "Select"
                  )}
                </button>
                {isTwowaySideSheetOpen && (
                  <TwowaySideSheet
                    isOpen={isTwowaySideSheetOpen}
                    onClose={handleCloseTwowaySideSheet}
                    flightData={flightData}
                    parentLoader={setSelectButtonLoader}
                  />
                )}
              </div>
            </div>
          ) : null}

          {isClicked || isClicked1 ? null : <Gototopbutton />}

          {!corporateUser ? (
            <div>
              {selectedOutboundFlight ||
                isDropdownVisible ||
                isInboundPopupOpen ||
                isOutboundPopupOpen ||
                isClicked ? null : (
                <Footer />
              )}
            </div>
          ) : (
            <div>
              {selectedOutboundFlight ||
                isDropdownVisible ||
                isInboundPopupOpen ||
                isOutboundPopupOpen ||
                isClicked ? null : (
                <Footer1 />
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
