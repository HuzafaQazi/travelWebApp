import { useState, useEffect, useRef, useCallback } from "react";
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
  faIndianRupeeSign,
  faMagnifyingGlass,
  faXmark,
} from "@fortawesome/free-solid-svg-icons";
import TravelPolicy from "@/components/corporate/booking/TravelPolicy/TravelPolicy";
import PolicyPopup from "@/components/corporate/booking/hotels/OutOfPolicy";
import useCorporateHotelSearch from "@/utils/corporate/hotels/search";
import axios ,{getTabSpecificData}from "@/utils/axios/axios";
import config from "@/config";
import Loader from "@/components/corporate/loader/Loader";
import LazyImage from "@/components/lazyImage/LazyImage";
import { useRouter } from "next/router";
import {
  ErrorMessage
} from "@/components/corporate/errorStatus/StatusComponents";
import useIndexedDBWithCompression from "@/utils/corporate/hotels/useIndexedDB";
import { formatPrice } from "@/utils/common";
import Footer from "@/components/corporate/footerCorporate/footerCorporate";
import { debounce } from "@/utils/debounce";
import Head from "next/head";
import HotelListingSkeleton from "@/components/corporate/Loaders/Hotel/HotelListingSkeleton";
import HotelDetailsSkeleton from "@/components/corporate/Loaders/Hotel/HotelDetailsSkeleton";
import noresult from "@/images/corporate/NoResultsFound.png";
import Image from "next/image";

export default function HotelListing({ onClose, hotelCode, vendorCode }) {
  const router = useRouter();
  // const { hotelCode, vendorCode } = router.query;
  const data = useCorporateHotelSearch();
  const { isDbInitialized, getSearchResults, getPreviewData } =
    useIndexedDBWithCompression();

  const [searchFilters, setSearchFilters] = useState(null);
  const [searchFiltersChecked, setSearchFiltersChecked] = useState(false);
  const [hotelNameSearchValue, setHotelNameSearchValue] = useState("");

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
  const [routerReady, setRouterReady] = useState(false);
  const [selectedRooms, setSelectedRooms] = useState([]);

  // Handler to update selectedRooms in the parent component
  const handleSelectedRoomsChange = (newSelectedRooms) => {
    setSelectedRooms(newSelectedRooms);
  };

  const popupRef = useRef(null);

  useEffect(() => {
    const updateSearchResults = async () => {
      const data = await getSearchResults();
      if (!searchResults) {
        setSearchResults(data?.results);
      }
      if (!searchRequest) {
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

  // Memoized callback for setting search results
  const updateSearchResults = useCallback(() => {
    try {
      if (data) {
        if (!searchResults) {
          setSearchResults(data?.searchResults);
        }
        if (!searchRequest) {
          setSearchRequest(data?.searchRequest);
        }
        if (!searchFilters) {
          if (data?.searchFilters) {
            const { priceRange, starRatings, amenities, policy } =
              data?.searchFilters;
            setSearchFilters(data?.searchFilters);
            setFilters((prevFilters) => ({
              ...prevFilters,
              priceRange: priceRange,
            }));
          }
        }
      }
    } catch (error) {
      console.error("Error updating search results:", error);
    }
  }, [data, searchResults, searchRequest, searchFilters]);

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

  const handleCloseBottomSheet = () => {
    setIsOpen(false);
  };

  const handleFilterChange = useCallback((newFilters) => {
    setFilters((prevFilters) => ({ ...prevFilters, ...newFilters }));
    setFiltersApplied(true);
  }, []);

  const debouncedFilterChange = useCallback(
    debounce((newFilters) => handleFilterChange(newFilters), 1000),
    [handleFilterChange]
  );

  const handleHotelNameSearchFilter = (e) => {
    const value = e.target.value;
    setHotelNameSearchValue(value);
    // setTimeout(() => handleFilterChange({ hotelSearchQuery: value }), 1000);
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

  // Handle View Details (opens new tab)
  const handleViewDetails = (hotel) => {
    sessionStorage.setItem("selectedHotelData", JSON.stringify(hotel));
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
            height: "150vh",
            backgroundColor: "#F9FAFB",
          }}
        >
          {/* Header Component */}
          <div
            style={{
              position: "fixed",
              top: 0,
              width: "100%",
              zIndex: 20,
              backgroundColor: "#FFFFFF",
              boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.1)",
              // height: "12vh",
            }}
            className="h-[12vh] 2xl:h-[8vh]"
          >
            <Header />
          </div>

          {/* List Navigation with fixed positioning */}
          <div
            style={{
              position: "fixed",
              // top: "4.5rem",
              width: "100%",
              zIndex: loading ? 0 : 10,
              backgroundColor: "#D9D9D930",
              backdropFilter: "blur(4px)",
              boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.05)",
            }}
            className="top-[4.5rem] 2xl:top-[5rem]"
          >
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
                marginTop: "12rem",
                overflow: "hidden",
                paddingBottom: "2rem",
                marginBottom: "4rem",
              }}
              className="2xl:mx-[12%]"
            >
              {/* ViewMore section */}
              <div
                style={{
                  width: "50%",
                  height: "calc(150vh - 17rem)",
                  padding: "1rem",
                  overflowY: "auto",
                  borderRight: "1px solid #E2E8F0",
                  backgroundColor: "#FFFFFF",
                  boxShadow: "inset 0px 2px 4px rgba(0, 0, 0, 0.05)",
                }}
                className={style.view}
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
                  width: "50%",
                  height: "calc(150vh - 17rem)",
                  padding: "1rem",
                  overflowY: "auto",
                  backgroundColor: "#FFFFFF",
                  boxShadow: "inset 0px 2px 4px rgba(0, 0, 0, 0.05)",
                }}
                className={style.view}
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
        <div className={`${selectedRooms.length > 0 ? "pb-16" : ""}`}>
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

  console.log(isLoading);


  return (
    <>
      <Head>
        <title>Hotel Listing</title>
      </Head>
      {initialLoading ? (
        <HotelListingSkeleton />
      ) : (
        <div className="flex flex-col h-screen">
          <div class="border-b bg-white fixed top-0 w-full z-10 h-[12vh] 2xl:h-[8vh]">
            <Header />
          </div>
          {/* Navigation of hotel listing */}
          <div
            className="bg-[#D9D9D930] backdrop-blur-sm fixed top-[4.5rem] 2xl:top-[5rem] w-full "
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
              <div className="2xl:mx-[12%]">
                <div className="flex-1 overflow-y-auto pt-[10rem]">
                  <div className="p-3 w-full flex gap-2">
                    <div
                      className={`py-2 p-2 ${isExpanded ? "w-2/6" : "w-1/6"
                        } pt-24`}
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
                      className={`transition-all duration-300 ${showRoomDetails ? "w-2/3" : "w-full"
                        } p-2`}
                    >
                      <div className="flex flex-col bg-[#FFFFFFF] p-2 rounded-lg">
                        <div className="flex justify-between">
                          <div className="text-lg text-[#030B09] font-semibold ml-2">
                            {searchResults?.hotelResults?.length} results found
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
                              {/* <button
                          className="underline text-[#155EEF] font-semibold ml-2"
                          onClick={handleOpenBottomSheet}
                        >
                          Travel Policy
                        </button> */}
                            </div>
                          </div>
                          {/* <button
                      className="flex w-auto h-[6vh] items-center text-[#FFFFFF] text-xs font-semibold px-3 rounded-full"
                      style={{
                        background:
                          "linear-gradient(95.77deg, #FF9C40 13%, #F5574D 79.44%)",
                      }}
                      onClick={handleOpenSideSheet}
                    >
                      <Image
                        src={iconSet}
                        alt="hotelimage"
                        className="w-[30px] h-fit"
                      />
                      <span className="whitespace-nowrap">
                        Employee Preferences
                      </span>
                    </button> */}
                          <EmployeePreferenceSideSheet
                            isOpen={isSideSheetOpen}
                            onClose={handleCloseSideSheet}
                          />
                        </div>

                        <div className="flex justify-between items-center">
                          <div className="bg-[#F2F3F399] w-fit p-2  mt-2 shadow-md py-2 rounded-lg">
                            <div className="flex gap-4">
                              {/* <span>Sort:</span> */}
                              <div
                                onClick={() => {
                                  if (filters.priceSort !== "lowHigh") {
                                    handleFilterChange({
                                      priceSort: "lowHigh",
                                    });
                                  }
                                }}
                                className={`p-2 rounded-full cursor-pointer transition-colors duration-300 ease-in-out ${filters.priceSort === "lowHigh"
                                  ? "text-[#155EEF] text-lg font-semibold pointer-events-none"
                                  : "text-[#878786] text-lg font-medium "
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
                                className={` p-2 rounded-full cursor-pointer transition-colors duration-300 ease-in-out ${filters.priceSort === "highLow"
                                  ? "text-[#155EEF] text-lg font-semibold pointer-events-none"
                                  : "text-[#878786] text-lg font-medium"
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

                          <div className="flex items-center justify-between ">
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
                            {/* Edit and Add Buttons */}
                          </div>
                        </div>

                        {loading ? (
                          <Loader />
                        ) : searchResults?.hotelResults?.length === 0 ? (

                          <div className="flex flex-col items-center justify-center h-screen">
                            <Image
                              src={noresult}
                              alt="hotelimage"
                              className="w-[500px] h-[400px]"
                            />
                            <div className="text-2xl font-semibold">No Hotels Found</div>
                          </div>
                        ) : (
                          <div className="bg-[#E5E9EB]  mt-3 rounded-lg shadow-md">
                            <div className=" m-2 rounded-lg  ">
                              {/* hotels cards */}
                              <div
                                className={style.mainContainer}
                              >
                                {searchResults?.hotelResults?.map(
                                  (hotel, index) => (
                                    <div
                                      key={hotel.hotelCode}
                                      className="bg-white p-2 flex m-2 rounded-lg"
                                    >
                                      <div className="flex items-center w-36 h-36 flex-shrink-0">
                                        <LazyImage
                                          src={
                                            hotel.hotelStaticImageUrl ||
                                            hotel.hotelImages
                                          }
                                          alt={hotel.hotelName}
                                          width={600}
                                          height={600}
                                          className="w-36 h-36 rounded-md"
                                          loading="lazy"
                                        />
                                      </div>
                                      <div className="flex justify-between w-full">
                                        <div className="w-5/6 flex flex-col justify-center border-r p-2">
                                          <div className="font-semibold">
                                            {hotel.hotelName}
                                          </div>
                                          <div className="flex items-center">
                                            {[...Array(5)].map((_, index) => (
                                              <svg
                                                key={index}
                                                className={`w-4 h-4 ms-1 ${index < hotel.starRating
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
                                          <div className="text-xs mt-6 font-semibold">
                                            {searchRequest?.selectedCity?.title}
                                            ,{" "}
                                            {
                                              searchRequest?.selectedCity
                                                ?.countryname
                                            }
                                            <button
                                              className="underline ml-2 text-[#155EEF]"
                                              onClick={() =>
                                                handleViewDetails(hotel)
                                              }
                                              disabled={
                                                selectedHotel?.hotelCode ===
                                                hotel.hotelCode &&
                                                viewMoreData?.loading
                                              }
                                            >
                                              View More
                                            </button>
                                          </div>
                                        </div>
                                        <div className="flex flex-col items-end w-fit p-2 pl-4">
                                          <div className="relative inline-block">
                                            {/* <div
                                    className="text-red-600 text-sm font-semibold"
                                    onClick={handleShowPopup}
                                  >
                                    <FontAwesomeIcon
                                      icon={faCircleInfo}
                                      color="red"
                                      className="text-red-600 mr-1"
                                    />
                                    Out of Policy
                                  </div> */}
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
                                            <span className="ml-1 text-lg font-semibold">
                                              {formatPrice(
                                                hotel.price
                                                  .offeredPriceRoundedOff
                                              )}
                                            </span>
                                          </div>
                                          <span className="text-xs font-medium">
                                            per room
                                          </span>
                                          <button
                                            className="bg-[#155EEF] w-full whitespace-nowrap mt-2 flex items-center justify-between text-white text-sm p-1.5 px-2 rounded-lg"
                                            onClick={() =>
                                              handleViewDetails(hotel)
                                            }
                                            disabled={
                                              selectedHotel?.hotelCode ===
                                              hotel.hotelCode &&
                                              viewRoomData?.loading
                                            }
                                          >
                                            View Rooms
                                            <FontAwesomeIcon
                                              icon={faAngleRight}
                                            />
                                          </button>
                                        </div>
                                      </div>
                                    </div>
                                  )
                                )}
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
                                // qTraceId={qTraceId}
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
              <Footer />
            </>
          )}

          {/* Bottom sheet */}
          {isOpen && (
            <TravelPolicy isOpen={isOpen} onClose={handleCloseBottomSheet} />
          )}
        </div>
      )}
    </>
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
