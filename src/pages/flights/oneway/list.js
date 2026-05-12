import CommonHeader from "@/components/flights/commonHeader/commonHeader";
import B2CHeader from "@/components/flights/B2cHeader/Header";
import DesktopNavigation from "@/components/flights/desktopNavigation/desktopNavigation";
import FareDetails from "@/components/flights/fareDetails/fareDetails";
import FiltersPop from "@/components/flights/filtersPopup/filtersPopup";
import FlightDetails from "@/components/flights/flightDetails/flightDetails";
import NavigationModify from "@/components/flights/navigationModify/navigationModify";
import ResultNotFound from "@/components/flights/resultNotFound/resultNotFound";
import SideSheet from "@/components/flights/sidesheetFlights/sidesheetFlights";
import Footer from "@/components/footer/footer";
import Gototopbutton from "@/components/gototopbutton/gototopbutton";
import config from "@/config";
import useLocalStorage from "@/hooks/useLocalStorage";
import { useLogin } from "@/store/context/LoginContext";
import {
  faArrowLeft,
  faChevronDown,
  faSliders,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import axios from "@/utils/axios/axios";
import {
  getTabSpecificData,
  setTabSpecificData,
  removeTabSpecificData,
} from "@/utils/axios/axios";
import "bootstrap/dist/css/bootstrap.min.css";
import Image from "next/image";
import { useRouter } from "next/router";
import pako from "pako";
import { useEffect, useRef, useState } from "react";
import "react-calendar/dist/Calendar.css";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import loaderf from "../../../../public/img/flightload.gif";
import style from "./List.module.css";
import { logEvent } from "firebase/analytics";
import { analytics } from "../../../../utils/firebase";
import { useUserType } from "@/hooks/useUserType";
import Header from "@/components/corporate/auth/Header";
import Footer1 from "@/components/corporate/footerCorporate/footerCorporate";
import FlightLoader from "@/components/loader/FlightLoader";

export default function FlightsListing() {
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
  const [routeLoading, setRouteLoading] = useState(false);
  const [activeLink, setActiveLink] = useState("flights");
  const [flightsResponse, setFlightsResponse] = useState([]);
  const [flightsRequest, setFlightsRequest] = useState([]);
  const [fareQuoteData, setFareQuoteData] = useState([]);
  const [fareDetailsData, setFareDetailsData] = useState([]);
  const [selectButtonLoader, setSelectButtonLoader] = useState(false);
  const [selectedButtonIndex, setSelectedButtonIndex] = useState(null);
  const [flightDetailsLoader, setFlightDetailsLoader] = useState(false);
  const [flightDetailsIndex, setFlightDetailsIndex] = useState(null);
  const [fareDetailsLoader, setFareDetailsLoader] = useState(false);
  const [fareDetailsIndex, setFareDetailsIndex] = useState(null);
  const [rotatedIcons, setRotatedIcons] = useState([]);
  const [isToastVisible, setIsToastVisible] = useState(false);
  const [pageLoading, setPageLoading] = useState(false);
  const [loading, setLoading] = useState(true);
  // flight details and fare price bottomsheets
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("flightDetails");

  const [selectedFilters, setSelectedFilters] = useState({
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
  const [sortingCriteria, setSortingCriteria] = useState({
    criteria: "price",
    order: "asc",
  });

  const [getuserip, setuserip] = useLocalStorage("userip");

  const [selectedTravelers, setSelectedTravelers] = useState([]);

  const router = useRouter();

  // for no reuslts found
  const { noResults } = router.query;

  // dropdown for modify section
  const [isDropdownVisible, setIsDropdownVisible] = useState(false);
  const dropdownRef = useRef(null);

  const handleTravelerChange = (newTravelers) => {
    setSelectedTravelers(newTravelers);
  };

  const handleModifyClick = () => {
    setIsDropdownVisible(!isDropdownVisible);
    logEvent(analytics, "modify_click", {});
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

  const fetchGetQuote = async (qTraceId, resultIndex, oldPrice) => {
    try {
      const storedUserIp = getTabSpecificData("userip");
      const payload = {
        qTraceId: qTraceId,
        userType: "b2b",
        fareQuoteReqData: {
          endUserIp: storedUserIp == "undefined" ? null : storedUserIp,
          resultIndex: resultIndex,
        },
      };
      const { data } = await axios.post(
        `${config.FLIGHTS_SEARCH_FAREQUOTE}`,
        payload
      );
      const response = data?.data[0].data;
      if (response.isPriceChanged) {
        // setPriceDetails(response.fare);
        const newPrice = response.fare.offeredFareRoundedOff;
        openFlightPricePopup(oldPrice, newPrice);
      }
      return response;
    } catch (error) {
      console.log(error);
      throw error;
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const compressedData = getTabSpecificData("flightResponse");
        const encodedRequest = getTabSpecificData("flightRequest");
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
            // Decode from base64
            const decodedResponse = JSON.parse(encodedResponse);
            const decodedRequest = JSON.parse(atob(encodedRequest));
            setFlightsResponse(decodedResponse);
            setFlightsRequest(decodedRequest);

            // Use the decoded values as needed
          }
        }

        if (encodedSelectedFlightData && selectedFlightSection) {
          // const decodedSelectedFlightData = JSON.parse(
          //   atob(encodedSelectedFlightData)
          // );
          const decodedSelectedFlightData = JSON.parse(
            decodeURIComponent(atob(encodedSelectedFlightData))
          );
          if (
            decodedSelectedFlightData.selectedButtonIndex ||
            decodedSelectedFlightData.selectedButtonIndex === 0
          ) {
            setflightData(decodedSelectedFlightData);
            setSelectedButtonIndex(
              decodedSelectedFlightData.selectedButtonIndex
            );
            setIsSideSheetOpen(true);
          }
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

  // calender dropdown
  const [bottomSheetCalenderOpen, setBottomSheetCalenderOpen] = useState(false);
  const [selectedToggle, setSelectedToggle] = useState(null);
  const toggleBottomSheetCalender = (toggle) => {
    setBottomSheetCalenderOpen(!bottomSheetCalenderOpen);
    setSelectedToggle(toggle);
  };

  const [isBottomSheetOpen, setBottomSheetOpen] = useState(false);

  const handleBottomSheetToggle = () => {
    setBottomSheetOpen(!isBottomSheetOpen);
    logEvent(analytics, "flights_filters_click", {});
  };

  const formatPrice = (price) => {
    return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };

  const formatTime = (isoTimeString) => {
    const date = new Date(isoTimeString);
    const hours = date.getHours().toString().padStart(2, "0");
    const minutes = date.getMinutes().toString().padStart(2, "0");
    return `${hours}:${minutes}`;
  };

  // Format duration in the format "1 hr 30 mins"
  const formatDuration = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;

    const hoursText = hours > 0 ? `${hours} hr` : "";
    const minutesText = remainingMinutes > 0 ? ` ${remainingMinutes} mins` : "";

    return `${hoursText}${minutesText}`;
  };

  const formatDateToDayMonth = (inputDate) => {
    const date = new Date(inputDate);
    const day = date.getDate();
    const month = date.toLocaleString("default", { month: "long" });
    const year = date.getFullYear();

    const suffix = (day) => {
      if (day >= 11 && day <= 13) {
        return "th";
      }
      switch (day % 10) {
        case 1:
          return "st";
        case 2:
          return "nd";
        case 3:
          return "rd";
        default:
          return "th";
      }
    };

    const formattedDate = `${day}${suffix(day)} ${month} ${year}`;
    return formattedDate;
  };

  // flight duration calculation
  const handleFlightDuration = (departureTime, arrivalTime) => {
    const departureDate = new Date(departureTime);
    const arrivalDate = new Date(arrivalTime);

    // Get the start of the departure day
    const departureDayStart = new Date(
      departureDate.getFullYear(),
      departureDate.getMonth(),
      departureDate.getDate()
    );

    // Get the start of the arrival day
    const arrivalDayStart = new Date(
      arrivalDate.getFullYear(),
      arrivalDate.getMonth(),
      arrivalDate.getDate()
    );

    // Calculate the difference in days
    const timeDifference =
      arrivalDayStart.getTime() - departureDayStart.getTime();
    const daysDifference = timeDifference / (1000 * 3600 * 24);
    return Math.ceil(daysDifference);
  };

  // update flights response and request
  const updateFlightsResponse = () => {
    try {
      const compressedData = getTabSpecificData("flightResponse");
      const numbersArray = compressedData.split(",").map(Number);

      const compressedUint8Array = new Uint8Array(numbersArray);

      const encodedResponse = pako.inflate(compressedUint8Array, {
        to: "string",
      });

      const encodedRequest = getTabSpecificData("flightRequest");

      if (encodedResponse && encodedRequest) {
        // Decode from base64
        const decodedResponse = JSON.parse(encodedResponse);
        const decodedRequest = JSON.parse(atob(encodedRequest));
        setFlightsResponse(decodedResponse);
        setFlightsRequest(decodedRequest);
        setIsDropdownVisible(false);
        setSelectedFilters({
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
      }
    } catch (error) {
      console.log(error);
    }
  };

  // bottomsheet for flight details and fare prices
  const BottomSheetDetails = ({ isOpen, onClose, activeTab, flights }) => {
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
              fareDetails={fareDetailsData}
              index={flightDetailsIndex}
              onClose={onClose}
              handleTabClick={handleTabClick}
              handleSelectButtonClick={handleSelectButtonClick}
              selectButtonLoader={selectButtonLoader}
              selectedButtonIndex={selectedButtonIndex}
              qTraceId={flightsResponse.qTraceId}
              type="oneway"
            />
          )}
        </div>
      </div>
    );
  };

  const handleTabClick = async (tab, flight, index) => {
    if (tab === "flightDetails") {
      setFlightDetailsLoader(true);
      setFlightDetailsIndex(index);
      try {
        // const response = await fetchGetQuote(
        //   flightsResponse.qTraceId,
        //   flight.resultIndex,
        //   flight.fare.offeredFareRoundedOff
        // );
        // setFareQuoteData(response);
        setFareQuoteData(flight);
        setActiveTab(tab);
        setIsOpen(true);
      } catch (error) {
        console.log(error);
        let errorMessage =
          error?.response?.data?.error?.errorMessage[0]?.data ||
          "Something went wrong, please try after some time";
        // toast(errorMessage);
        if (
          error?.response?.data?.error?.errorMessage?.[0]?.data ===
          "Session timeout!!"
          //  ||
          // error?.response?.data?.error?.errorMessage?.[0]?.data ===
          // "Fare Quote failed from the Supplier end. Please try again."
        ) {
          errorMessage =
            "Oops! Your session has expired. Please search Flights again.";
          setTimeout(() => {
            router.push("/flights/oneway/list"); // Redirect to a specific page
          }, 2000);
        } else if (
          error?.response?.data?.error?.errorMessage?.[0]?.data ||
          error?.response?.error?.errorMessage?.[0]?.data ===
            "Fare Quote failed from the Supplier end. Please try again."
        ) {
          errorMessage = "Something went wrong, please select different flight";
          setTimeout(() => {
            router.push("/flights/oneway/list");
          }, 2000);
        }
        if (!isToastVisible) {
          // toast("Oops! your session is expired. Please search Flights again.");
          toast(errorMessage);
          setIsToastVisible(true);

          // Reset the flag after a specific duration (e.g., 3 seconds)
          setTimeout(() => {
            setIsToastVisible(false);
          }, 6000);
        }
      } finally {
        setFlightDetailsLoader(false);
      }
    } else if (tab === "fareDetails") {
      setFareDetailsData(flight);
      setFareDetailsLoader(true);
      setFareDetailsIndex(index);
      setActiveTab(tab);
      setIsOpen(true);
      setFareDetailsLoader(false);
    } else {
      setActiveTab(tab);
      setIsOpen(true);
    }
  };

  const handleCloseBottomSheet = () => {
    setIsOpen(false);
    setIsFareDetailsOpen(false);
  };

  const [isSideSheetOpen, setIsSideSheetOpen] = useState(false);
  const [flightData, setflightData] = useState([]);
  const [isFareDetailsOpen, setIsFareDetailsOpen] = useState(false);

  // Function to close fare details
  const handleCloseFareDetails = () => {
    setIsFareDetailsOpen(false);
  };

  useEffect(() => {
    if (isFareDetailsOpen) {
      // Disable scrolling on the body when fare details are open
      document.body.style.overflow = "hidden";
    } else {
      // Enable scrolling on the body when fare details are closed
      document.body.style.overflow = "unset";
    }

    // Cleanup effect
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isFareDetailsOpen]);

  useEffect(() => {
    if (isSideSheetOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    // Clean up the effect
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isSideSheetOpen]);

  const [loadingSelect, setLoadingSelect] = useState(false);

  const handleSelectButtonClick = async (flight, index) => {
    setSelectButtonLoader(true);
    setSelectedButtonIndex(index);
    setLoadingSelect(true);
    try {
      const storedUserIp = getTabSpecificData("userip");

      const response = await fetchGetQuote(
        flightsResponse.qTraceId,
        flight.resultIndex,
        flight.fare.offeredFareRoundedOff
      );

      const ssrpayload = {
        qTraceId: flightsResponse.qTraceId,
        ssrReqModel: {
          endUserIp: storedUserIp == "undefined" ? null : storedUserIp,
          resultIndex: flight.resultIndex,
        },
      };
      let response1;
      try {
        const ssrResponse = await axios.post(
          `${config.FLIGHTS_BOOKING_SSR}`,
          ssrpayload
        );
        response1 = ssrResponse?.data;
      } catch (error) {
        setflightData((prev) => ({
          ...prev,
          ssrResponse: null,
        }));
      }

      const countryResponse = await axios.get(`${config.FLIGHTS_COUNTRY}`);
      const response2 = countryResponse?.data;

      const selectedFlightSection = getTabSpecificData("selectedFlightSection");
      if (selectedFlightSection) {
        removeTabSpecificData("selectedFlightSection");
      }

      setflightData({
        ...flight,
        qTraceId: flightsResponse.qTraceId,
        fareQuoteResponse: response,
        ssrResponse: response1?.data || null,
        countryResponse: response2.data.Countries,
        flightsRequest: flightsRequest,
        selectedButtonIndex: index,
      });
      setIsSideSheetOpen(true);
      setIsOpen(false);
      logEvent(analytics, "ow_flight_select", {});
    } catch (error) {
      console.log(error);
      let errorMessage =
        error?.response?.data?.error?.errorMsg ||
        error?.response?.data?.error?.errorMessage?.[0]?.data ||
        "Something went wrong, please try after some time";
      // toast(errorMessage);
      if (
        error?.response?.data?.error?.errorMessage?.[0]?.data ===
        "Session timeout!!"
        // ||
        // error?.response?.data?.error?.errorMessage?.[0]?.data ===
        // "Fare Quote failed from the Supplier end. Please try again."
      ) {
        errorMessage =
          "Oops! Your session has expired. Please search Flights again.";
        setTimeout(() => {
          router.push("/flights/oneway/list"); // Redirect to a specific page
        }, 2000);
      } else if (
        error?.response?.data?.error?.errorMessage?.[0]?.data ===
        "Fare Quote failed from the Supplier end. Please try again."
      ) {
        errorMessage = "Something went wrong, please select different flight";
        setTimeout(() => {
          router.push("/flights/oneway/list");
        }, 2000);
      }
      if (!isToastVisible) {
        toast(errorMessage);
        // toast(error?.response?.data?.error?.errorMessage?.[0]?.data);
        setIsToastVisible(true);

        // Reset the flag after a specific duration (e.g., 3 seconds)
        setTimeout(() => {
          setIsToastVisible(false);
        }, 6000);
      }
    } finally {
      setSelectButtonLoader(false);
      setLoadingSelect(false);
    }
  };

  const handleCloseSideSheet = () => {
    removeTabSpecificData("selectedFlightSection");
    setIsSideSheetOpen(false);
  };

  //  sidesheet for fare rules

  const [isSideSheetRulesOpen, setIsSideSheetRulesOpen] = useState(false);

  const handleGoBack = () => {
    window.history.back();
  };

  const handleClick = (id, criterion) => {
    setRotatedIcons((prevIcons) => {
      if (prevIcons.includes(id)) {
        return prevIcons.filter((iconId) => iconId !== id);
      } else {
        return [id];
      }
    });
    setSortingCriteria((prev) => {
      return {
        ...prev,
        criteria: criterion,
        order: rotatedIcons.includes(id) ? "asc" : "desc",
      };
    });
    logEvent(analytics, "ow_sorting", {
      id: id,
      criterion: criterion,
      order: rotatedIcons.includes(id) ? "asc" : "desc",
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
          // const durationA = a.segments[0].segment.reduce(
          //   (total, segment) => total + segment.duration,
          //   0
          // );
          // const durationB = b.segments[0].segment.reduce(
          //   (total, segment) => total + segment.duration,
          //   0
          // );
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

    logEvent(analytics, "sort_flights", {
      type: criterion,
      order: order,
    });

    return sortedResults;
  };

  if (loading) {
    return <FlightLoader isContentRequired={false} />;
  }

  return (
    <>
      {selectButtonLoader && <FlightLoader isContentRequired={false} />}
      <div
        className={`${style.flightListingPage} ${
          selectButtonLoader ? style.loading : ""
        }`}
      >
        {/* header flightslisting */}
        {!corporateUser ? (
          // <CommonHeader />
          <B2CHeader />
        ) : (
          <div style={{ backgroundColor: "#ffffff" }}>
            <Header />
          </div>
        )}
        <div className={style.completeWithFooter}>
          {/* modify flightslisting info */}
          <div className={style.modifySection}>
            <div className={style.flightDetails}>
              <div onClick={handleGoBack}>
                <FontAwesomeIcon icon={faArrowLeft} />
              </div>
              <div>
                <div className={style.sidedate}>
                  <div className={style.fromToDetails}>
                    {flightsRequest.fromCity}
                    {"-"}
                    {flightsRequest.toCity}
                  </div>
                  <div className={style.dateclassDetails}>
                    {formatDateToDayMonth(
                      flightsRequest.searchReqData?.segments[0]
                        ?.preferredDepartureTime
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

          <div className={style.desktopNavbar}>
            <DesktopNavigation
              updateFlights={updateFlightsResponse}
              setPageLoading={setPageLoading}
              isRedirect={true}
              selectedTravelers={selectedTravelers}
              setSelectedTravelers={setSelectedTravelers}
              handleTravelerChange={handleTravelerChange}
            />
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
                className={`${style.completeContent} ${
                  isBottomSheetOpen ? style.bottomSheetOpen : ""
                } ${isDropdownVisible ? style.bottomSheetOpen : ""}`}
              >
                {/* filters */}
                <div className={style.filterContentContainer}>
                  {
                    <FiltersPop
                      isOpen={true}
                      onClose={() => {}}
                      filterData={flightsResponse.flightsResults[0].filterData}
                      flightsResponse={flightsResponse.flightsResults}
                      setFlightsResponse={setFlightsResponse}
                      selectedFilters={selectedDesktopFilters}
                      setSelectedFilters={setSelectedDesktopFilters}
                      flightsRequest={flightsRequest}
                      type="all"
                      sortingCriteria={sortingCriteria}
                      sortFlights={sortFlights}
                    />
                  }
                </div>

                {/* toggles and tickets */}
                <div className={style.desktopContentAlign}>
                  <div className={style.desktopTogglesLine}>
                    <div className={style.selectedCityDetails}>
                      <div>
                        <span>
                          {flightsRequest.fromCity}-{flightsRequest.toCity}
                        </span>
                      </div>
                      <div className={style.otherDetails}>
                        <span>
                          {" "}
                          {formatDateToDayMonth(
                            flightsRequest?.searchReqData?.segments[0]
                              ?.preferredDepartureTime
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
                        disabled={loadingSelect}
                      >
                        <FontAwesomeIcon icon={faSliders} />
                        Filters
                      </button>
                      <button
                        className={`${style.toggleButtons} ${
                          rotatedIcons.includes("icon1")
                            ? style.activeButtons
                            : ""
                        }`}
                        onClick={() => handleClick("icon1", "price")}
                      >
                        {" "}
                        Price
                        <FontAwesomeIcon
                          icon={faChevronDown}
                          className={`${style.arrowDesktop} ${
                            rotatedIcons.includes("icon1") ? style.rotated : ""
                          }`}
                          id="icon1"
                        />
                      </button>
                      <button
                        className={`${style.toggleButtons} ${
                          rotatedIcons.includes("icon2")
                            ? style.activeButtons
                            : ""
                        }`}
                        onClick={() => handleClick("icon2", "departure")}
                      >
                        Departure
                        <FontAwesomeIcon
                          icon={faChevronDown}
                          className={`${style.arrowDesktop} ${
                            rotatedIcons.includes("icon2") ? style.rotated : ""
                          }`}
                          id="icon2"
                        />
                      </button>
                      <button
                        className={`${style.toggleButtons} ${
                          rotatedIcons.includes("icon3")
                            ? style.activeButtons
                            : ""
                        }`}
                        onClick={() => handleClick("icon3", "arrival")}
                      >
                        Arrival
                        <FontAwesomeIcon
                          icon={faChevronDown}
                          className={`${style.arrowDesktop} ${
                            rotatedIcons.includes("icon3") ? style.rotated : ""
                          }`}
                          id="icon3"
                        />
                      </button>
                      <button
                        className={`${style.toggleButtons} ${
                          rotatedIcons.includes("icon4")
                            ? style.activeButtons
                            : ""
                        }`}
                        onClick={() => handleClick("icon4", "duration")}
                      >
                        Duration
                        <FontAwesomeIcon
                          icon={faChevronDown}
                          className={`${style.arrowDesktop} ${
                            rotatedIcons.includes("icon4") ? style.rotated : ""
                          }`}
                          id="icon4"
                        />
                      </button>
                    </div>
                  </div>
                  {isBottomSheetOpen && (
                    <FiltersPop
                      isOpen={isBottomSheetOpen}
                      onClose={handleBottomSheetToggle}
                      filterData={flightsResponse.flightsResults[0].filterData}
                      flightsResponse={flightsResponse.flightsResults}
                      setFlightsResponse={setFlightsResponse}
                      selectedFilters={selectedFilters}
                      setSelectedFilters={setSelectedFilters}
                      flightsRequest={flightsRequest}
                      type="mobile"
                      sortingCriteria={sortingCriteria}
                      sortFlights={sortFlights}
                    />
                  )}
                  <div className={style.resultsDetails}>
                    {flightsResponse?.flightsResults?.[0]?.flights?.length > 0
                      ? `${flightsResponse?.flightsResults?.[0]?.flights?.length} Results Found`
                      : "No Results Found"}
                  </div>
                  {flightsResponse?.qTraceId && (
                    <div className={style.flightsContainer}>
                      {flightsResponse?.flightsResults[0].flights.map(
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
                            <div className={style.flightTicket} key={index}>
                              <div className={style.airlineDetails}>
                                <div className={style.logoAirline2}>
                                  {/* {origin.airline.airlineLogoUrl} */}
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
                                      {destination.destination.airport.cityCode}
                                    </span>
                                  </div>
                                </div>
                                <div className={style.fareDetailsButton}>
                                  <div className={style.flightFareToggles}>
                                    <span
                                      style={{ textDecoration: "underline" }}
                                      onClick={() =>
                                        handleTabClick(
                                          "flightDetails",
                                          flight,
                                          index
                                        )
                                      }
                                    >
                                      {flightDetailsLoader &&
                                      flightDetailsIndex === index
                                        ? "Loading..."
                                        : "Flight Details"}
                                    </span>
                                    <span
                                      style={{
                                        marginLeft: "10px",
                                        textDecoration: "underline",
                                      }}
                                      onClick={() =>
                                        handleTabClick(
                                          "fareDetails",
                                          flight,
                                          index
                                        )
                                      }
                                    >
                                      {fareDetailsLoader &&
                                      fareDetailsIndex === index
                                        ? "Loading..."
                                        : "More Fares"}
                                    </span>
                                    {(flightDetailsIndex === index ||
                                      fareDetailsIndex === index) && (
                                      <BottomSheetDetails
                                        isOpen={isOpen}
                                        onClose={handleCloseBottomSheet}
                                        activeTab={activeTab}
                                        flights={
                                          flightsResponse?.flightsResults[0]
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
                                    handleSelectButtonClick(flight, index)
                                  }
                                  className={style.airlineSelectBtn}
                                  disabled={selectButtonLoader}
                                >
                                  {selectButtonLoader &&
                                  selectedButtonIndex === index ? (
                                    <div className="loadingSpinner"></div>
                                  ) : (
                                    "Select"
                                  )}
                                </button>
                                {isSideSheetOpen &&
                                  (selectedButtonIndex === index ||
                                    selectedButtonIndex ===
                                      `oneway${index}`) && (
                                    <SideSheet
                                      isOpen={isSideSheetOpen}
                                      onClose={handleCloseSideSheet}
                                      flightData={flightData}
                                      handleCloseFareDetails={
                                        handleCloseFareDetails
                                      }
                                      parentLoader={setSelectButtonLoader}
                                    />
                                  )}
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
          {/* )} */}
        </div>
        {/* {isDropdownVisible || isBottomSheetOpen ? null : <Chaticon />} */}
        <Gototopbutton />
        {/* <Footer /> */}
        {!corporateUser ? (
          <div>{isBottomSheetOpen ? null : <Footer />}</div>
        ) : (
          <div>{isBottomSheetOpen ? null : <Footer1 />}</div>
        )}
      </div>
    </>
  );
}
