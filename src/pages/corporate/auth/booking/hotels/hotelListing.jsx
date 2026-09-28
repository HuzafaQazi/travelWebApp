import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Header from "@/components/corporate/auth/Header";
import ListNavigation from "@/components/corporate/booking/hotels/HotelNavigation";
import Filter from "@/components/corporate/booking/hotels/Filter";
import ViewRoom from "@/components/corporate/booking/hotels/ViewRoom";
import ViewMore from "@/components/corporate/booking/hotels/ViewMore";
import EmployeePreferenceSideSheet from "@/components/corporate/booking/hotels/EmployeePreference";
import style from "./style.module.css";
import {
  faAngleDown,
  faAngleRight,
  faAngleUp,
  faArrowLeft,
  faIndianRupeeSign,
  faInfoCircle,
  faMagnifyingGlass,
  faXmark,
} from "@fortawesome/free-solid-svg-icons";
import TravelPolicy from "@/components/corporate/booking/TravelPolicy/TravelPolicy";
import PolicyPopup from "@/components/corporate/booking/hotels/OutOfPolicy";
import useCorporateHotelSearch from "@/utils/corporate/hotels/search";
import axios,{getTabSpecificData} from "@/utils/axios/axios";
import config from "@/config";
import Loader from "@/components/corporate/loader/Loader";
import LazyImage from "@/components/lazyImage/LazyImage";
import { useRouter } from "next/router";
import { ErrorMessage } from "@/components/corporate/errorStatus/StatusComponents";
import useIndexedDBWithCompression from "@/utils/corporate/hotels/useIndexedDB";
import { formatPrice } from "@/utils/common";
import Footer from "@/components/corporate/footerCorporate/footerCorporate";
import { debounce } from "@/utils/debounce";
import Head from "next/head";
import HotelListingSkeleton from "@/components/corporate/Loaders/Hotel/HotelListingSkeleton";
import HotelDetailsSkeleton from "@/components/corporate/Loaders/Hotel/HotelDetailsSkeleton";
import noresult from "@/images/corporate/NoResultsFound.png";
import Image from "next/image";
import {
  setAdultsCount,
  setSelectedTravelers,
  setDefaultSelectionDone,
} from "@/store/slices/travellersSlice";
import ProtectedRoute from "@/components/corporate/protectedRoute/ProtectedRoute";
import OutOfPolicy from "@/components/corporate/common/OutOfPolicy";
import InPolicyTooltip from "@/components/corporate/booking/flights/outOfPolicyToolTip";
import {
  TRAVEL_CATEGORIES,
  HOTEL_INPOLICY_CONTENT,
  HOTEL_BUDGET_DOMESTIC_ID,
  HOTEL_BUDGET_INTERNATIONAL_ID,
} from "@/utils/constants";
import {
  constructOutOfPolicyEmployees,
  findTravelersMissingApproval,
  getMaxStarRatingAndBudget,
} from "@/utils/corporate/travelPolicy";

export default function HotelListing({ onClose, hotelCode, vendorCode }) {
  const dispatch = useDispatch();
  const router = useRouter();
  // const { hotelCode, vendorCode } = router.query;

  const userDetails = useSelector((state) => state?.user?.userInfo);

  const storedLocation =
    typeof window !== "undefined" ? getTabSpecificData("userLocation") : null;
  const parsedLocation = storedLocation ? JSON.parse(storedLocation) : null;

  const userHomeCountryCode =
    userDetails?.loggedInDetails?.userDetails?.countryCode ||
    userDetails?.loggedInDetails?.userDetails?.countryDetails?.countryCode ||
    userDetails?.loggedInDetails?.companyDetails?.countryCode ||
    parsedLocation?.country_code;

  const data = useCorporateHotelSearch();

  const { isDbInitialized, getSearchResults, getPreviewData } =
    useIndexedDBWithCompression();

  const [searchFilters, setSearchFilters] = useState(null);
  const [searchFiltersChecked, setSearchFiltersChecked] = useState(false);
  const [hotelNameSearchValue, setHotelNameSearchValue] = useState("");
  const [showGoToTop, setShowGoToTop] = useState(false);

  const [filters, setFilters] = useState({
    hotelSearchQuery: "",
    priceSort: "lowHigh",
    priceRange: [
      searchFilters?.priceRange?.[0] || 0,
      searchFilters?.priceRange?.[1] || 0,
    ],
    starRating: [],
    roomPreference: {
      breakfast: false,
      lunch: false,
      dinner: false,
    },
    inPolicyOnly: false,
    amenities: [],
  });

  const [isOpen, setIsOpen] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [isExpanded, setIsExpanded] = useState(true);
  const [showRoomDetails, setShowRoomDetails] = useState(false);
  const [showViewMore, setShowViewMore] = useState(false);
  const [showViewRoom, setShowViewRoom] = useState(false);
  const [isSideSheetOpen, setIsSideSheetOpen] = useState(false);
  const [selectedHotel, setSelectedHotel] = useState(null);
  const [viewMoreData, setViewMoreData] = useState(null);
  const [viewRoomData, setViewRoomData] = useState(null);
  const [searchResults, setSearchResults] = useState(null);
  const [searchRequest, setSearchRequest] = useState(null);
  const [loading, setLoading] = useState(false);
  const [resultsLoading, setResultsLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [filtersApplied, setFiltersApplied] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [newTabLoading, setNewTabLoading] = useState(true);
  const [selectedRooms, setSelectedRooms] = useState([]);
  const [isDropdownVisible, setIsDropdownVisible] = useState(false);
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const [hoveredButtonIndex, setHoveredButtonIndex] = useState(null);
  const [hoveredButtonIndexViewMore, setHoveredButtonIndexViewMore] =
    useState(null);
  // Infinite Scroll State
  const [visibleHotels, setVisibleHotels] = useState([]);
  const [hasMore, setHasMore] = useState(true);

  const ITEMS_PER_PAGE = 20;

  const popupRef = useRef(null);

  // Handler to update selectedRooms in the parent component
  const handleSelectedRoomsChange = (newSelectedRooms) => {
    setSelectedRooms(newSelectedRooms);
  };

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const handleDropdownClick = () => {
    // Check if filters are open and close them if they are
    if (isFiltersOpen) {
      setIsFiltersOpen(false);
    } else if (isDropdownVisible) {
      setIsDropdownVisible(!isDropdownVisible);
    }
  };

  // Track scroll position
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 300) {
        setShowGoToTop(true);
      } else {
        setShowGoToTop(false);
      }
    };

    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  useEffect(() => {
    const updateSearchResults = async () => {
      const data = await getSearchResults();
      if (!searchResults) {
        setSearchResults(data?.results);
      }
      if (!searchRequest) {
        dispatch(setSelectedTravelers(data?.params?.selectedTravelers ?? []));
        dispatch(
          setDefaultSelectionDone(data?.params?.selectedTravelers?.length > 0)
        );
        dispatch(
          setAdultsCount(
            data?.params?.adultsPerRoom.reduce(
              (total, adults) => total + adults,
              0
            )
          )
        );
        setSearchRequest(data?.params);
      }
      if (!searchFilters) {
        if (data?.filters) {
          const { priceRange, starRatings, amenities, policy } = data?.filters;
          setSearchFilters(data?.filters);
          setFilters((prevFilters) => ({
            ...prevFilters,
            priceRange: priceRange,
          }));
        }
      }
    };
    updateSearchResults();
  }, [isDbInitialized]);

  // Initialize visibleHotels when searchResults change
  useEffect(() => {
    if (searchResults?.hotelResults) {
      setVisibleHotels(searchResults.hotelResults.slice(0, ITEMS_PER_PAGE));
      setHasMore(searchResults.hotelResults.length > ITEMS_PER_PAGE);
    }
  }, [searchResults]);

  // Load more hotels when user scrolls near bottom
  const loadMoreHotels = useCallback(() => {
    const currentLength = visibleHotels.length;
    const isMore = currentLength < searchResults.hotelResults.length;
    const nextResults = isMore
      ? searchResults.hotelResults.slice(
          currentLength,
          currentLength + ITEMS_PER_PAGE
        )
      : [];
    setVisibleHotels((prevHotels) => [...prevHotels, ...nextResults]);
    setHasMore(
      searchResults.hotelResults.length >
        visibleHotels.length + nextResults.length
    );
  }, [visibleHotels, searchResults]);

  // Observer for infinite scrolling
  const observer = useRef();
  const lastHotelElementRef = useCallback(
    (node) => {
      if (loading) return;
      if (observer.current) observer.current.disconnect();
      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMore) {
          loadMoreHotels();
        }
      });
      if (node) observer.current.observe(node);
    },
    [loading, hasMore, loadMoreHotels]
  );

  useEffect(() => {
    const initializeFilters = () => {
      if (searchFilters) {
        setFilters((prevFilters) => ({
          ...prevFilters,
          priceRange: searchFilters.priceRange,
        }));
      }
      // Mark that we've checked for searchFilters, regardless of whether they exist
      setSearchFiltersChecked(true);
      setInitialLoading(false);
    };

    // Add a small delay to allow other data to load
    const timeoutId = setTimeout(initializeFilters, 100);

    // Cleanup timeout if component unmounts
    return () => clearTimeout(timeoutId);
  }, [searchFilters]);

  useEffect(() => {
    // If we have search results but no filters after a certain time, stop loading
    const handleMissingFilters = () => {
      if (searchResults && !searchFilters && !searchFiltersChecked) {
        setSearchFiltersChecked(true);
        setInitialLoading(false);
      }
    };

    const timeoutId = setTimeout(handleMissingFilters, 3000); // 3 second timeout

    return () => clearTimeout(timeoutId);
  }, [searchResults, searchFilters, searchFiltersChecked]);

  // New useEffect to fetch data when hotelCode is present
  useEffect(() => {
    if (hotelCode && vendorCode && searchResults) {
      // We're in the new tab
      setNewTabLoading(true);
      setErrorMessage("");

      const fetchData = async () => {
        try {
          const ipAddress = getTabSpecificData("userip");
          const payload = {
            qTraceId: searchResults?.qTraceId,
            ipaddress: typeof ipAddress == "undefined" ? null : ipAddress,
            hotelCode: hotelCode,
            vendorcode: vendorCode,
          };

          // Fetch ViewRoom data
          const [viewRoomResponse, viewMoreResponse] = await Promise.all([
            axios.post(`${config.GET_HOTEL_ROOMS}`, payload),
            axios.post(`${config.GET_HOTEL_INFO}`, payload),
          ]);

          setViewRoomData(viewRoomResponse?.data?.data || null);
          setViewMoreData(viewMoreResponse?.data?.data?.hotelInfo || null);

          const storedHotelData = sessionStorage.getItem("selectedHotelData");
          if (storedHotelData) {
            const hotelData = JSON.parse(storedHotelData);
            setSelectedHotel(hotelData);
          } else {
            const data = await getPreviewData();
            if (data?.hotel) {
              setSelectedHotel(data?.hotel);
            }
          }
        } catch (error) {
          if (error.name !== "AbortError" && error.name !== "CanceledError") {
            setErrorMessage("No data found");
          }
          console.error("Error fetching data:", error);
        } finally {
          setNewTabLoading(false);
        }
      };

      fetchData();
    }
  }, [hotelCode, vendorCode, searchResults]);

  const abortControllerRef = useRef(null);

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

  const isDomesticHotel = useMemo(() => {
    if (!searchRequest?.countryCode || !userHomeCountryCode) return false;
    return (
      userHomeCountryCode.toUpperCase() ===
      searchRequest.countryCode.toUpperCase()
    );
  }, [searchRequest?.countryCode, userHomeCountryCode]);

  const createAbortController = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort(); // Cancel previous request
    }
    const abortController = new AbortController();
    abortControllerRef.current = abortController;
    return abortController.signal;
  };

  const handleShowPopup = () => {
    setShowPopup(true);
  };

  const handleClosePopup = () => {
    setShowPopup(false);
  };

  const handleOpenSideSheet = () => {
    setIsSideSheetOpen(true);
  };

  const handleCloseSideSheet = () => {
    setIsSideSheetOpen(false);
  };

  const handleClickOutside = (event) => {
    // If using a CSS module, import styles and use styles.popupContent
    if (event.target.closest(".popupContent") === null) {
      setShowPopup(false);
      if (onClose) onClose(); // Optionally call onClose to notify parent
    }
  };

  useEffect(() => {
    if (showPopup) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showPopup]);

  const handleCloseViewRoom = () => {
    setShowViewRoom(false);
    setIsExpanded(true);
  };

  const handleCloseViewMore = () => {
    setShowViewMore(false);
    setIsExpanded(true);
  };

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };
  const handleOpenBottomSheet = () => {
    setIsOpen(true);
  };

  const handleCloseBottomSheet = () => {
    setIsOpen(false);
  };

  const handleFilterChange = useCallback((newFilters) => {
    setFilters((prevFilters) => ({ ...prevFilters, ...newFilters }));
    setFiltersApplied(true);
  }, []);

  const debouncedFilterChange = useMemo(
    () => debounce((newFilters) => handleFilterChange(newFilters), 1000),
    [handleFilterChange]
  );

  // const debouncedFilterChange = useCallback(
  //   debounce((newFilters) => handleFilterChange(newFilters), 1000),
  //   [handleFilterChange]
  // );

  const handleHotelNameSearchFilter = (e) => {
    const value = e.target.value;
    setHotelNameSearchValue(value);
    debouncedFilterChange({ hotelSearchQuery: value });
  };

  const clearHotelSearchValue = () => {
    setHotelNameSearchValue("");
    handleFilterChange({
      hotelSearchQuery: "",
    });
  };

  const debouncedApplyFilters = useCallback(
    debounce(async () => {
      if (!filtersApplied) return;

      let travelPolicy = null;
      if (filters.inPolicyOnly) {
        const { maxStarRating, maxBudget } = getMaxStarRatingAndBudget(
          searchRequest?.selectedTravelers,
          regionId
        );
        travelPolicy = {
          maxStarRating,
          maxBudget,
        };
      }

      const signal = createAbortController();

      setLoading(true);
      try {
        const response = await axios.post(
          `${config.GET_HOTEL_FILTER}`,
          {
            qTraceId: searchResults?.qTraceId,
            hotelSearchQuery: filters.hotelSearchQuery,
            priceFilter: filters.priceSort,
            priceRange: filters.priceRange,
            roomPreference: filters.roomPreference,
            starFilters: filters.starRating,
            inPolicyOnly: filters.inPolicyOnly,
            travelPolicy,
          },
          { signal }
        );
        setSearchResults((prevResults) => ({
          ...prevResults,
          hotelResults: response.data.data,
        }));
      } catch (error) {
        console.error("Error applying filters:", error);
      } finally {
        setLoading(false);
        setFiltersApplied(false);
      }
    }, 500), // Debounce delay of 500 milliseconds
    [filters, filtersApplied]
  );

  useEffect(() => {
    if (searchResults && filtersApplied) {
      debouncedApplyFilters();
    }

    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [filters, debouncedApplyFilters, filtersApplied]);

  const formatDate = (dateString) => {
    if (dateString) {
      const date = new Date(dateString);
      return new Intl.DateTimeFormat("en-GB", {
        day: "2-digit",
        month: "short",
      }).format(date);
    }
  };

  const regionId = isDomesticHotel
    ? HOTEL_BUDGET_DOMESTIC_ID
    : HOTEL_BUDGET_INTERNATIONAL_ID;

  const checkOutOfPolicyForHotel = (hotel) => {
    const dataForPolicy = {
      totalAmount:
        hotel.price.qOfferedPriceRoundedOff / searchRequest?.noOfRooms,
      hotelCategory: hotel.starRating,
      regionId: regionId, // domestic/international region ID
      corporateEmployees: searchRequest?.selectedTravelers,
      showApprovalReason: false,
    };

    // If you want 'split' logic (cost-per-head):
    const outOfPolicyList = constructOutOfPolicyEmployees(
      dataForPolicy,
      TRAVEL_CATEGORIES.HOTELS,
      { budgetCheckMethod: "split" }
    );

    return outOfPolicyList;
  };

  // Handle View Details (opens new tab)
  const handleViewDetails = (hotel) => {
    const hotelData = { ...hotel, isDomesticHotel };
    sessionStorage.setItem("selectedHotelData", JSON.stringify(hotelData));
    // Get the current page URL
    const currentUrl = window.location.href.split("?")[0]; // Remove any existing query parameters

    // Construct the URL with the new query parameters
    const url = `${currentUrl}?hotelCode=${hotel.hotelCode}&vendorCode=${hotel.vendorCode}`;

    // Open the new URL in a new tab
    window.open(url, "_blank");
  };

  if (hotelCode) {
    return (
      <>
        <Head>
          <title>Hotel Details</title>
        </Head>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            backgroundColor: "#F9FAFB",
          }}
          className="sm:h-[140vh]"
        >
          {/* Header Component */}
          <div className="border-b w-full z-10 bg-white">
            <Header />
          </div>

          {/* List Navigation with fixed positioning */}
          <div className="hidden sm:block py-1 pb-2 px-4 bg-[#D9D9D940] bg-blur backdrop-blur-md sticky top-0 w-full z-10">
            <ListNavigation
              setSearchResults={setSearchResults}
              setSearchRequest={setSearchRequest}
              setSearchFilters={setSearchFilters}
              setParentLoader={setResultsLoading}
              isDetailView={true}
            />
          </div>

          {/* Container for ViewRoom and ViewMore sections */}
          {newTabLoading ? (
            <HotelDetailsSkeleton />
          ) : resultsLoading ? (
            <HotelListingSkeleton />
          ) : errorMessage ? (
            <ErrorMessage message={errorMessage || "No data found"} />
          ) : (
            <div
              style={{
                display: "flex",
                flex: 1,
                marginTop: "1rem",
                overflow: "hidden",
                // paddingBottom: "2rem",
                // marginBottom: "4rem",
              }}
              className="2xl:mx-[12%] flex-col-reverse sm:flex-row"
            >
              {/* ViewMore section */}
              {/* <div className="2xl:mx-[12%]"> */}
              <div
                style={{
                  padding: "1rem",
                  overflowY: "auto",
                  borderRight: "1px solid #E2E8F0",
                  backgroundColor: "#FFFFFF",
                  boxShadow: "inset 0px 2px 4px rgba(0, 0, 0, 0.05)",
                }}
                className={`${style.view} w-full sm:w-1/2 h-[100vh]`}
              >
                {viewMoreData ? (
                  <div
                    style={{
                      padding: "1rem",
                      backgroundColor: "#FFFFFF",
                      boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.1)",
                      borderRadius: "8px",
                    }}
                  >
                    <ViewMore data={viewMoreData} />
                  </div>
                ) : (
                  <div
                    style={{
                      color: "#718096",
                      textAlign: "center",
                      padding: "1rem",
                    }}
                  >
                    No data found for View More
                  </div>
                )}
              </div>

              {/* ViewRoom section */}
              <div
                style={{
                  padding: "1rem",
                  overflowY: "auto",
                  backgroundColor: "#FFFFFF",
                  boxShadow: "inset 0px 2px 4px rgba(0, 0, 0, 0.05)",
                  // scrollbarWidth: "thin",
                  // scrollbarColor: "#A0AEC0 #EDF2F7",
                }}
                className={`${style.view} w-full sm:w-1/2 h-[100vh]`}
              >
                {viewRoomData ? (
                  <div
                    style={{
                      padding: "1rem",
                      backgroundColor: "#FFFFFF",
                      boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.1)",
                      borderRadius: "8px",
                    }}
                  >
                    <ViewRoom
                      data={viewRoomData}
                      maxRooms={searchRequest?.noOfRooms}
                      selectedHotel={selectedHotel}
                      searchRequest={searchRequest}
                      onSelectedRoomsChange={handleSelectedRoomsChange}
                    />
                  </div>
                ) : (
                  <div
                    style={{
                      color: "#718096",
                      textAlign: "center",
                      padding: "1rem",
                    }}
                  >
                    No data found for View Room
                  </div>
                )}
              </div>
              {/* </div> */}
            </div>
          )}
        </div>
        <div className={`${selectedRooms.length > 0 ? "pb-6" : ""}`}>
          <Footer />
        </div>
      </>
    );
  }

  const shouldShowViewMore =
    showViewMore && viewMoreData[selectedHotel?.hotelCode];
  const shouldShowViewRoom =
    showViewRoom && viewRoomData[selectedHotel?.hotelCode];

  const cityName = searchRequest?.selectedCity?.title || "N/A";
  const checkInDate = formatDate(searchRequest?.checkInDateRange);
  const checkOutDate = formatDate(searchRequest?.checkOutDateRange);
  const nights = searchRequest?.noOfNights || "N/A";

  const isLoading = initialLoading && !searchFiltersChecked;

  const headerHeight = 12; // Assuming the header height is 12rem
  const navigationHeight = 4.5; // Assuming the navigation height is 4.5rem
  const totalFixedHeight = headerHeight + navigationHeight; // Total fixed height

  return (
    <ProtectedRoute>
      <Head>
        <title>Hotel Listing</title>
      </Head>
      {/* Go to Top Button */}
      {showGoToTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-8 right-8 bg-[#155EEF] text-white p-2 rounded-full shadow-lg hover:bg-[#027890] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#155EEF] transition-transform transform hover:scale-105 z-50"
          aria-label="Go to top"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
            className="w-6 h-6"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M5 10l7-7m0 0l7 7m-7-7v18"
            />
          </svg>
        </button>
      )}
      {initialLoading ? (
        <HotelListingSkeleton />
      ) : (
        <div className="flex flex-col min-h-screen">
          {(isDropdownVisible || isFiltersOpen) && (
            <div
              onClick={
                isDropdownVisible || isFiltersOpen ? handleDropdownClick : null
              }
              className="fixed inset-0 bg-black opacity-40 z-[9999999] cursor-pointer"
            ></div>
          )}
          <div className="border-b bg-white w-full z-10">
            <Header />
          </div>
          {/* Navigation of hotel listing */}
          <div
            className="hidden sm:block bg-[#D9D9D930] backdrop-blur-sm sticky top-0 w-full "
            style={{
              zIndex: loading || initialLoading ? 0 : 10, // Change z-index dynamically based on isLoading
            }}
          >
            <ListNavigation
              setSearchResults={setSearchResults}
              setSearchRequest={setSearchRequest}
              setSearchFilters={setSearchFilters}
              setParentLoader={setResultsLoading}
              isDetailView={false}
            />
          </div>

          {isDropdownVisible && (
            <div
              // ref={dropdownRef}
              className="fixed top-[0rem] left-0 right-0 bg-[#E5E9EB] shadow-lg transition-all duration-300 h-fit z-[99999999] "
            >
              <ListNavigation
                setSearchResults={setSearchResults}
                setSearchRequest={setSearchRequest}
                setSearchFilters={setSearchFilters}
                setParentLoader={setResultsLoading}
                isDetailView={false}
                setIsDropdownVisible={setIsDropdownVisible}
              />
            </div>
          )}

          {/* modify section for mob ui */}
          <div className="flex justify-between items-center sm:hidden px-3 py-3 sticky top-0 z-1 sm:z-[99999] w-full bg-[#f6f6f6] shadow-md bg-gradient-to-r from-[#16A2B6] via-[#16A2B6] to-[#041E22]">
            <div className="flex items-center gap-2">
              <div>
                <FontAwesomeIcon
                  icon={faArrowLeft}
                  size="lg"
                  className="text-white"
                />
              </div>
              <div className="flex flex-col w-full">
                <span className="text-sm sm:text-xl text-white text-nowrap font-bold">
                  {searchResults?.hotelResults?.length} Results Found
                </span>
                <div className="flex gap-2 items-center text-xxs max-w-full flex-wrap  sm:text-sm text-white text-opacity-80 font-semibold">
                  {cityName} | {checkInDate} {" - "} {checkOutDate} |{" "}
                  {searchRequest?.adultsPerRoom?.reduce(
                    (total, adults) => total + adults,
                    0
                  )}{" "}
                  {searchRequest?.adultsPerRoom?.reduce(
                    (total, adults) => total + adults,
                    0
                  ) > 1
                    ? "Adults"
                    : "Adult"}
                </div>
              </div>
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

          {/* top results with search input */}
          {resultsLoading ? (
            <HotelListingSkeleton />
          ) : !searchResults ? (
            <div className="flex flex-col items-center justify-center h-screen">
              <Image
                src={noresult}
                alt="hotelimage"
                className="w-[500px] h-[400px]"
              />
              <div className="text-2xl font-semibold">No Hotels Found</div>
            </div>
          ) : (
            <>
              <div>
                <div
                  className="flex flex-1 pt-0 px-0 gap-2 2xl:mx-[12%]"
                  // style={{ minHeight: `calc(110vh - ${totalFixedHeight}rem)` }}
                >
                  <div className="p-0 sm:p-3 pt-0 sm:pt-3 w-full flex flex-col md:flex-row gap-2">
                    <div
                      className={`hidden sm:block py-2 p-2 pb-5 ${
                        isExpanded ? "md:w-2/6" : "md:w-1/6"
                      }`}
                      style={{
                        position: "sticky",
                        top: `6rem`,
                        height: `calc(140vh - ${totalFixedHeight}rem)`,
                        // overflowY: "auto",
                      }}
                    >
                      <Filter
                        isExpanded={isExpanded}
                        toggleExpanded={toggleExpanded}
                        filters={filters}
                        onFilterChange={handleFilterChange}
                        dynamicFilters={searchFilters}
                      />
                    </div>
                    <div
                      className={`transition-all duration-300 ${
                        showRoomDetails ? "md:w-2/3" : "md:w-full"
                      } p-2`}
                    >
                      <div className="flex flex-col bg-[#FFFFFFF] p-2 rounded-lg">
                        <div className="flex flex-col w-full md:flex-row justify-between">
                          <div className="hidden sm:block text-lg text-[#030B09] font-semibold ml-2">
                            {searchResults?.hotelResults?.length} results found
                            <div className="flex justify-between w-full">
                              <div className="text-[#171A19] text-xs font-semibold">
                                {cityName} | {checkInDate} - {checkOutDate} |
                                {nights}{" "}
                                {Number(nights) === 1 ? "Night" : "Nights"} |{" "}
                                {searchRequest?.adultsPerRoom?.reduce(
                                  (total, adults) => total + adults,
                                  0
                                )}{" "}
                                {searchRequest?.adultsPerRoom?.reduce(
                                  (total, adults) => total + adults,
                                  0
                                ) > 1
                                  ? "Adults"
                                  : "Adult"}
                              </div>
                            </div>
                          </div>
                          {searchRequest?.selectedTravelers?.length > 0 && (
                            <div
                              className="text-[#155EEF] text-sm font-semibold underline cursor-pointer"
                              onClick={handleOpenBottomSheet}
                            >
                              Travel Policy
                            </div>
                          )}
                          <EmployeePreferenceSideSheet
                            isOpen={isSideSheetOpen}
                            onClose={handleCloseSideSheet}
                          />
                        </div>

                        <div className="flex flex-col md:flex-row justify-between items-center">
                          <div className="bg-[#F2F3F399] w-full md:w-fit p-2 mt-0 sm:mt-2 shadow-md py-2 rounded-lg">
                            <div className="flex justify-center sm:justify-start gap-4">
                              <div
                                onClick={() => {
                                  if (filters.priceSort !== "lowHigh") {
                                    handleFilterChange({
                                      priceSort: "lowHigh",
                                    });
                                  }
                                }}
                                className={`p-2 rounded-full cursor-pointer transition-colors duration-300 ease-in-out ${
                                  filters.priceSort === "lowHigh"
                                    ? "text-[#155EEF] text-xs sm:text-lg font-semibold pointer-events-none"
                                    : "text-[#878786] text-xs sm:text-lg font-medium "
                                }`}
                              >
                                Low to High{" "}
                                <FontAwesomeIcon
                                  icon={faAngleDown}
                                  className="text-sm"
                                />
                              </div>
                              <div
                                onClick={() => {
                                  if (filters.priceSort !== "highLow") {
                                    handleFilterChange({
                                      priceSort: "highLow",
                                    });
                                  }
                                }}
                                className={` p-2 rounded-full cursor-pointer transition-colors duration-300 ease-in-out ${
                                  filters.priceSort === "highLow"
                                    ? "text-[#155EEF] text-xs sm:text-lg font-semibold pointer-events-none"
                                    : "text-[#878786] text-xs sm:text-lg font-medium"
                                }`}
                              >
                                High to Low{" "}
                                <FontAwesomeIcon
                                  icon={faAngleUp}
                                  className="text-sm"
                                />
                              </div>
                            </div>
                          </div>

                          <div className="flex w-full sm:w-fit items-center justify-between mt-2 md:mt-0">
                            <button
                              onClick={() => setIsFiltersOpen(!isFiltersOpen)}
                              className="flex sm:hidden items-center justify-center border-[#155EEF] text-[#155EEF] bg-white border-1 rounded-full text-sm px-4 py-2"
                            >
                              Filter
                            </button>
                            <div className="relative">
                              <input
                                type="text"
                                className="h-14 w-full font-normal text-sm pl-4 pr-8 rounded-lg shadow-[0px_4px_4px_0px_rgba(22,156,176,0.14)] focus:shadow-xl focus:outline-none transition-shadow duration-300 ease-in-out"
                                placeholder="Search by hotel name"
                                value={hotelNameSearchValue}
                                onChange={handleHotelNameSearchFilter}
                              />
                              <div className="absolute right-0 top-0 h-full flex items-center pr-4">
                                {hotelNameSearchValue && (
                                  <button
                                    onClick={clearHotelSearchValue}
                                    className="mr-2 text-gray-400 hover:text-gray-600 transition-colors duration-300"
                                  >
                                    <FontAwesomeIcon icon={faXmark} />
                                  </button>
                                )}
                                <FontAwesomeIcon
                                  icon={faMagnifyingGlass}
                                  className="text-gray-400"
                                />
                              </div>
                              <button className=" absolute top-4 right-4 h-5 w-5 text-gray-600 rounded-lg hover:text-[#155EEF] transition-colors duration-300 transform hover:scale-110">
                                <FontAwesomeIcon
                                  icon={faMagnifyingGlass}
                                  className="text-[#878786]"
                                />
                              </button>
                            </div>
                          </div>
                        </div>

                        {isFiltersOpen && (
                          <div className="block fixed bottom-0 left-0 pb-3 h-fit sm:hidden w-full bg-white z-[999999999999999] rounded-lg">
                            <Filter
                              isExpanded={isExpanded}
                              toggleExpanded={toggleExpanded}
                              filters={filters}
                              onFilterChange={handleFilterChange}
                              dynamicFilters={searchFilters}
                            />
                          </div>
                        )}

                        {loading ? (
                          <Loader />
                        ) : visibleHotels.length === 0 ? (
                          <div className="flex flex-col items-center justify-center h-screen">
                            <Image
                              src={noresult}
                              alt="hotelimage"
                              className="w-[500px] h-[400px]"
                            />
                            <div className="text-2xl font-semibold">
                              No Hotels Found
                            </div>
                          </div>
                        ) : (
                          <div className="bg-[#E5E9EB]  mt-3 rounded-lg shadow-md">
                            <div className=" m-2 rounded-lg  ">
                              <div className={style.mainContainer}>
                                {visibleHotels.map((hotel, index) => {
                                  const outOfPolicy =
                                    checkOutOfPolicyForHotel(hotel);
                                  const isOutOfPolicy = outOfPolicy.length > 0;

                                  const isOutOfPolicySendApproval =
                                    findTravelersMissingApproval(
                                      {
                                        corporateEmployees:
                                          searchRequest?.selectedTravelers ||
                                          [],
                                        totalAmount:
                                          hotel.price.qOfferedPriceRoundedOff /
                                          searchRequest?.noOfRooms,
                                        regionId: regionId,
                                        hotelCategory: hotel.starRating,
                                      },
                                      TRAVEL_CATEGORIES.HOTELS
                                    );

                                  if (visibleHotels.length === index + 1) {
                                    return (
                                      <div
                                        key={hotel.hotelCode}
                                        ref={lastHotelElementRef}
                                        className="bg-white p-2 flex m-2 rounded-lg"
                                      >
                                        <div className="flex items-center w-20 sm:w-36 h-20 sm:h-36 flex-shrink-0">
                                          <LazyImage
                                            src={
                                              hotel.hotelStaticImageUrl ||
                                              hotel.hotelImages
                                            }
                                            alt={hotel.hotelName}
                                            width={600}
                                            height={600}
                                            className="rounded-md w-20 sm:w-36 h-20 sm:h-36"
                                            loading="lazy"
                                          />
                                        </div>
                                        <div className="flex justify-between w-full">
                                          <div className="w-5/6 flex flex-col justify-center border-r p-2">
                                            <div className="font-semibold text-sm sm:text-base">
                                              {hotel.hotelName}
                                            </div>
                                            <div className="flex items-center">
                                              {[...Array(5)].map((_, index) => (
                                                <svg
                                                  key={index}
                                                  className={`w-4 h-4 ms-1 ${
                                                    index < hotel.starRating
                                                      ? "text-[#DB884C]"
                                                      : "text-gray-300 dark:text-gray-500"
                                                  }`}
                                                  aria-hidden="true"
                                                  xmlns="http://www.w3.org/2000/svg"
                                                  fill="currentColor"
                                                  viewBox="0 0 22 20"
                                                >
                                                  <path d="M20.924 7.625a1.523 1.523 0 0 0-1.238-1.044l-5.051-.734-2.259-4.577a1.534 1.534 0 0 0-2.752 0L7.365 5.847l-5.051.734A1.535 1.535 0 0 0 1.463 9.2l3.656 3.563-.863 5.031a1.532 1.532 0 0 0 2.226 1.616L11 17.033l4.518 2.375a1.534 1.534 0 0 0 2.226-1.617l-.863-5.03L20.537 9.2a1.523 1.523 0 0 0 .387-1.575Z" />
                                                </svg>
                                              ))}
                                            </div>
                                            <div
                                              className="text-xs mt-6 font-semibold relative"
                                              onMouseEnter={() =>
                                                setHoveredButtonIndexViewMore(
                                                  index
                                                )
                                              }
                                              onMouseLeave={() =>
                                                setHoveredButtonIndexViewMore(
                                                  null
                                                )
                                              }
                                            >
                                              {
                                                searchRequest?.selectedCity
                                                  ?.title
                                              }
                                              ,{" "}
                                              {
                                                searchRequest?.selectedCity
                                                  ?.countryname
                                              }
                                              <button
                                                className={`underline ml-2 text-[#155EEF] ${
                                                  isOutOfPolicySendApproval
                                                    ? "cursor-not-allowed opacity-70"
                                                    : "hover:bg-[#027a8c] cursor-pointer"
                                                } `}
                                                onClick={() =>
                                                  !isOutOfPolicySendApproval
                                                    ? handleViewDetails(hotel)
                                                    : null
                                                }
                                                disabled={
                                                  isOutOfPolicySendApproval
                                                }
                                              >
                                                View More
                                              </button>
                                              {isOutOfPolicySendApproval &&
                                                hoveredButtonIndexViewMore ===
                                                  index && (
                                                  <InPolicyTooltip
                                                    content={
                                                      HOTEL_INPOLICY_CONTENT
                                                    }
                                                  />
                                                )}
                                            </div>
                                          </div>
                                          <div className="flex flex-col items-end w-fit p-2 pl-4">
                                            <div className="relative inline-block">
                                              {isOutOfPolicy && (
                                                <OutOfPolicy
                                                  outOfPolicyTravelers={
                                                    outOfPolicy
                                                  }
                                                  badgeClassName="text-[#E53944] text-sm font-semibold items-center flex gap-1"
                                                />
                                              )}
                                              {showPopup && (
                                                <div className="absolute left-[-550px] top-[50px] transform w-[600px] ">
                                                  <PolicyPopup
                                                    onClose={handleClosePopup}
                                                  />
                                                </div>
                                              )}
                                            </div>
                                            <div className="font-medium h-fit">
                                              <FontAwesomeIcon
                                                icon={faIndianRupeeSign}
                                              />
                                              <span className="ml-1 text-xs sm:text-lg font-semibold">
                                                {formatPrice(
                                                  hotel.price
                                                    .qOfferedPriceRoundedOff
                                                )}
                                              </span>
                                            </div>
                                            <span className="text-xxs sm:text-xs font-medium">
                                              Offered price
                                            </span>
                                            <div
                                              className="relative"
                                              onMouseEnter={() =>
                                                setHoveredButtonIndex(index)
                                              }
                                              onMouseLeave={() =>
                                                setHoveredButtonIndex(null)
                                              }
                                            >
                                              <button
                                                className={`bg-[#155EEF] w-full whitespace-nowrap mt-2 flex items-center justify-between text-white text-xxs sm:text-sm p-1.5 px-2 rounded-lg  ${
                                                  isOutOfPolicySendApproval
                                                    ? "cursor-not-allowed opacity-70"
                                                    : "hover:bg-[#027a8c] cursor-pointer"
                                                } 
                                             `}
                                                onClick={() =>
                                                  !isOutOfPolicySendApproval
                                                    ? handleViewDetails(hotel)
                                                    : null
                                                }
                                                disabled={
                                                  (selectedHotel?.hotelCode ===
                                                    hotel.hotelCode &&
                                                    viewRoomData?.loading) ||
                                                  isOutOfPolicySendApproval
                                                }
                                              >
                                                View Rooms
                                                <FontAwesomeIcon
                                                  icon={faAngleRight}
                                                />
                                              </button>
                                              {isOutOfPolicySendApproval &&
                                                hoveredButtonIndex ===
                                                  index && (
                                                  <InPolicyTooltip
                                                    content={
                                                      HOTEL_INPOLICY_CONTENT
                                                    }
                                                  />
                                                )}
                                            </div>
                                          </div>
                                        </div>
                                      </div>
                                    );
                                  } else {
                                    return (
                                      <div
                                        key={hotel.hotelCode}
                                        className="bg-white p-2 flex my-2 rounded-lg"
                                      >
                                        <div className="flex items-center w-20 sm:w-36 sm:h-36 flex-shrink-0">
                                          <LazyImage
                                            src={
                                              hotel.hotelStaticImageUrl ||
                                              hotel.hotelImages
                                            }
                                            alt={hotel.hotelName}
                                            width={600}
                                            height={600}
                                            className="w-20 sm:w-36 h-20 sm:h-36 rounded-md"
                                            loading="lazy"
                                          />
                                        </div>
                                        <div className="flex justify-between w-full">
                                          <div className="w-4/5 sm:w-5/6 flex flex-col justify-center border-r p-2">
                                            <div className="font-semibold text-sm sm:text-base">
                                              {hotel.hotelName}
                                            </div>
                                            <div className="flex items-center">
                                              {[...Array(5)].map((_, index) => (
                                                <svg
                                                  key={index}
                                                  className={`w-4 h-4 ms-1 ${
                                                    index < hotel.starRating
                                                      ? "text-[#DB884C]"
                                                      : "text-gray-300 dark:text-gray-500"
                                                  }`}
                                                  aria-hidden="true"
                                                  xmlns="http://www.w3.org/2000/svg"
                                                  fill="currentColor"
                                                  viewBox="0 0 22 20"
                                                >
                                                  <path d="M20.924 7.625a1.523 1.523 0 0 0-1.238-1.044l-5.051-.734-2.259-4.577a1.534 1.534 0 0 0-2.752 0L7.365 5.847l-5.051.734A1.535 1.535 0 0 0 1.463 9.2l3.656 3.563-.863 5.031a1.532 1.532 0 0 0 2.226 1.616L11 17.033l4.518 2.375a1.534 1.534 0 0 0 2.226-1.617l-.863-5.03L20.537 9.2a1.523 1.523 0 0 0 .387-1.575Z" />
                                                </svg>
                                              ))}
                                            </div>
                                            <div className="flex flex-col sm:flex-row sm:items-center">
                                              <div className="text-sm mt-2 sm:mt-6 ">
                                                {
                                                  searchRequest?.selectedCity
                                                    ?.title
                                                }
                                                ,{" "}
                                                {
                                                  searchRequest?.selectedCity
                                                    ?.countryname
                                                }
                                              </div>
                                              <div
                                                className="text-xs mt-2 sm:mt-6 font-semibold relative"
                                                onMouseEnter={() =>
                                                  setHoveredButtonIndexViewMore(
                                                    index
                                                  )
                                                }
                                                onMouseLeave={() =>
                                                  setHoveredButtonIndexViewMore(
                                                    null
                                                  )
                                                }
                                              >
                                                <button
                                                  className={`underline sm:ml-2 text-[#155EEF] ${
                                                    isOutOfPolicySendApproval
                                                      ? "cursor-not-allowed opacity-70"
                                                      : " cursor-pointer"
                                                  } `}
                                                  onClick={() =>
                                                    !isOutOfPolicySendApproval
                                                      ? handleViewDetails(hotel)
                                                      : null
                                                  }
                                                  disabled={
                                                    isOutOfPolicySendApproval
                                                  }
                                                >
                                                  View More
                                                </button>
                                                {isOutOfPolicySendApproval &&
                                                  hoveredButtonIndexViewMore ===
                                                    index && (
                                                    <InPolicyTooltip
                                                      content={
                                                        HOTEL_INPOLICY_CONTENT
                                                      }
                                                    />
                                                  )}
                                              </div>
                                            </div>
                                          </div>
                                          <div className="flex flex-col items-end w-fit p-2 sm:pl-4">
                                            <div className="relative inline-block">
                                              {/* <div
                                                className="text-red-600 text-xs"
                                                onClick={handleShowPopup}
                                              >
                                                <FontAwesomeIcon
                                                  icon={faInfoCircle}
                                                />{" "}
                                                Out Of Policy
                                              </div> */}
                                              {isOutOfPolicy && (
                                                <OutOfPolicy
                                                  outOfPolicyTravelers={
                                                    outOfPolicy
                                                  }
                                                  badgeClassName="text-[#E53944] text-sm font-semibold items-center flex gap-1"
                                                />
                                              )}
                                              {showPopup && (
                                                <div className="absolute left-[-550px] top-[50px] transform w-[600px] ">
                                                  <PolicyPopup
                                                    onClose={handleClosePopup}
                                                  />
                                                </div>
                                              )}
                                            </div>
                                            <div className="font-medium h-fit">
                                              <FontAwesomeIcon
                                                icon={faIndianRupeeSign}
                                              />
                                              <span className="ml-1 text-xs sm:text-lg font-semibold">
                                                {formatPrice(
                                                  hotel.price
                                                    .qOfferedPriceRoundedOff
                                                )}
                                              </span>
                                            </div>
                                            <span className="text-xxs sm:text-xs font-medium">
                                              Offered price
                                            </span>
                                            <div
                                              className="relative"
                                              onMouseEnter={() =>
                                                setHoveredButtonIndex(index)
                                              }
                                              onMouseLeave={() =>
                                                setHoveredButtonIndex(null)
                                              }
                                            >
                                              <button
                                                className={`bg-[#155EEF] w-full text-wrap sm:whitespace-nowrap mt-2 flex items-center justify-between text-white text-xxs sm:text-sm p-1.5 px-2 rounded-lg  ${
                                                  isOutOfPolicySendApproval
                                                    ? "cursor-not-allowed opacity-70"
                                                    : "hover:bg-[#027a8c] cursor-pointer"
                                                } 
                                             `}
                                                onClick={() =>
                                                  !isOutOfPolicySendApproval
                                                    ? handleViewDetails(hotel)
                                                    : null
                                                }
                                                disabled={
                                                  (selectedHotel?.hotelCode ===
                                                    hotel.hotelCode &&
                                                    viewRoomData?.loading) ||
                                                  isOutOfPolicySendApproval
                                                }
                                              >
                                                View Rooms
                                                <FontAwesomeIcon
                                                  icon={faAngleRight}
                                                />
                                              </button>
                                              {isOutOfPolicySendApproval &&
                                                hoveredButtonIndex ===
                                                  index && (
                                                  <InPolicyTooltip
                                                    content={
                                                      HOTEL_INPOLICY_CONTENT
                                                    }
                                                  />
                                                )}
                                            </div>
                                          </div>
                                        </div>
                                      </div>
                                    );
                                  }
                                })}
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {(shouldShowViewMore || shouldShowViewRoom) && (
                      <>
                        {loading ? (
                          <>
                            {handleCloseViewMore()}
                            {handleCloseViewRoom()}
                            {setIsExpanded(false)}
                          </>
                        ) : (
                          <div
                            ref={popupRef}
                            className="w-[90%] p-2 bg-[#030b090d] transition-all duration-300 rounded-lg h-full"
                          >
                            <div className="bg-white p-3 m-1 rounded-md">
                              {shouldShowViewMore && (
                                <ViewMore
                                  onClose={handleCloseViewMore}
                                  data={viewMoreData[selectedHotel.hotelCode]}
                                />
                              )}
                              {shouldShowViewRoom && (
                                <ViewRoom
                                  onClose={handleCloseViewRoom}
                                  data={viewRoomData[selectedHotel.hotelCode]}
                                  maxRooms={searchRequest.noOfRooms}
                                  selectedHotel={selectedHotel}
                                  searchRequest={searchRequest}
                                />
                              )}
                            </div>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </div>
              </div>
              {visibleHotels.length === searchResults?.hotelResults?.length && (
                <Footer />
              )}{" "}
            </>
          )}

          {/* Bottom sheet */}
          {isOpen && (
            <TravelPolicy
              isOpen={isOpen}
              onClose={handleCloseBottomSheet}
              hotelTravelers={searchRequest?.selectedTravelers}
            />
          )}
        </div>
      )}
    </ProtectedRoute>
  );
}

export async function getServerSideProps(context) {
  const { hotelCode, vendorCode } = context.query;

  return {
    props: {
      hotelCode: hotelCode || null,
      vendorCode: vendorCode || null,
    },
  };
}
