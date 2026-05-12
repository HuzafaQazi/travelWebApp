import style from "./styles.module.css";
import Header from "../../components/header/header";
import Footer from "@/components/footer/footer";
import HotelListItem from "@/components/hotellistitem/hotellistitem";
import { faSearch, faTimes } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import config from "@/config";
import { useEffect } from "react";
import axios from "@/utils/axios/axios";
import {
  getTabSpecificData,
  setTabSpecificData,
  removeTabSpecificData,
} from "@/utils/axios/axios";
import { useRouter } from "next/router";
import { useState, useRef } from "react";
import { useSelector } from "react-redux";
import useLocalStorage from "@/hooks/useLocalStorage";
import { blockRequest } from "../../../utils/bookingAPI";
import { v4 as uuidv4 } from "uuid";
import { toast } from "react-toastify";
import StarRatings from "react-star-ratings";
import "react-toastify/dist/ReactToastify.css";
import GoToTopButton from "@/components/gototopbutton/gototopbutton";
import Loader from "@/components/loader/loader";
import Chaticon from "@/components/chaticon/chaticon";
import { CloseButton } from "react-bootstrap";
import { logEvent } from "firebase/analytics";
import { analytics } from "../../../utils/firebase";
import { useUserType } from "@/hooks/useUserType";
import pako from "pako";
import Footer1 from "@/components/corporate/footerCorporate/footerCorporate";


const calculateNoOfNights = (checkin, checkout) => {
  const oneDay = 24 * 60 * 60 * 1000; // Number of milliseconds in a day
  const [checkinDay, checkinMonth, checkinYear] = checkin.split("-");
  const [checkoutDay, checkoutMonth, checkoutYear] = checkout.split("-");

  const checkInDate = new Date(checkinYear, checkinMonth - 1, checkinDay);
  const checkOutDate = new Date(checkoutYear, checkoutMonth - 1, checkoutDay);

  const timeDifference = checkOutDate.getTime() - checkInDate.getTime();
  const noOfNights = Math.ceil(timeDifference / oneDay).toString();
  return noOfNights;
};

export default function HomePage() {
  const userDetails = useSelector((state) => state?.user?.userInfo);

  const router = useRouter();
  const corporateUser = useUserType();

  const [hotels, setHotels] = useState([]);
  const [cartID, setCartID] = useState("");
  const [requestedNumberOfRooms, setRequestedNumberOfRooms] = useState(1);
  const [selectedRooms, setSelectedRooms] = useState([]);
  const [selectedHotel, setSelectedHotel] = useState("");
  const [totalCostRoom, setTotalCostRoom] = useState(0);
  const [totalRoomGSTAmount, setTotalRoomGSTAmount] = useState(0);
  const [totalCommissionAmount, setTotalCommissionAmount] = useState(0);
  const [totalNumberOfAdults, setTotalNumberOfAdults] = useState(0);
  const [totalNumberOfGuests, setTotalNumberOfGuests] = useState(0);
  const [totalNumberOfDays, setTotalNumberOfDays] = useState(0);
  const [getStoredCartID, setStoredCartID] = useLocalStorage("cartID");
  const [getAccessToken, setAccessToken] = useLocalStorage("accessToken");
  const [getuserip, setuserip] = useLocalStorage("userip");
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [hotelsLoading, setHotelsLoading] = useState(false);
  const [reserveButtonLoading, setReserveButtonLoading] = useState(false);
  const [allowedCombinations, setAllowedCombinations] = useState([]);
  const [isReserveAllowed, setisReserveAllowed] = useState();
  const [getUserID, setUserID] = useLocalStorage("userID");
  const [openHotelCode, setOpenHotelCode] = useState(null);
  const [destinationhotelLocation, setDestinationhotelLocation] = useState("");
  const [divDisabled, setDivDisabled] = useState(true);
  const [qTraceId, setQTraceID] = useState();
  const [adults, setAdults] = useState();
  const [children, setChildren] = useState();
  const [rooms, setRooms] = useState();
  const [destination, setDestination] = useState();
  const [checkinDate, setCheckinDate] = useState();
  const [checkoutDate, setCheckoutDate] = useState();
  const [getCityId, setCityId] = useState();
  const [getCountryCode, setCountryCode] = useState();
  const [getHotelCode, setHotelCode] = useState();
  const [roomCountString, setRoomCountString] = useState();
  const [hotelLocation, setHotelLocation] = useState();
  const [noOfNights, setNoOfNights] = useState("");
  const [hotelSearchData, setHotelSearchData] = useState();
  const [starFilter, setStarFilter] = useState([]);
  const [priceFilterMobile, setPriceFilterMobile] = useState();
  const [applyFilter, setApplyFilter] = useState();

  const [roomPreference, setRoomPreference] = useState({
    breakfast: false,
    lunch: false,
    dinner: false,
  });
  const [priceFilter, setPriceFilter] = useState(null); // 'lowHigh' or 'highLow'
  const [starFilters, setStarFilters] = useState([]);
  const [hotelSearchQuery, setHotelSearchQuery] = useState("");
  const [searchCall, setSearchCall] = useState(false);
  const [starDimension, setStarDimension] = useState("20px");

  const initialLoadRef = useRef(true);

  useEffect(() => {
    const handleResize = () => {
      const newStarDimension = window.innerWidth < 768 ? "15px" : "20px";
      setStarDimension(newStarDimension);
    };

    // Add event listener to handle window resize
    window.addEventListener("resize", handleResize);

    // Initial setting based on window width
    const initialStarDimension = window.innerWidth < 768 ? "15px" : "20px";
    setStarDimension(initialStarDimension);

    // Clean up the event listener when the component is unmounted
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  // Function to fetch filtered results from the API using selected filters
  const fetchFilteredResults = async () => {
    try {
      if (initialLoadRef.current) {
        initialLoadRef.current = false; // Update initial load status
        return; // Do not fetch on initial load
      }
      if (!qTraceId) return;

      setHotelsLoading(true);

      //${config.GET_HOTEL_FILTER}
      // http://localhost:3030/qtravels/searchService/api/v1.0/hotels/filterHotels
      const response = await axios.post(
        `${config.GET_HOTEL_FILTER}`,
        {
          roomPreference,
          priceFilter: priceFilterMobile ?? priceFilter,
          starFilters: starFilter.length > 0 ? starFilter : starFilters,
          hotelSearchQuery,
          qTraceId,
        },
        {
          "Content-Type": "application/json",
        }
      );

      const data = await response.data;
      const result = data.data;

      const updatedHotels = result.map((hotelData) => {
        return {
          hotelCode: hotelData.hotelCode,
          hotelName: hotelData.hotelName,
          vendorCode: hotelData.vendorCode,
          hotelDescription: hotelData.hotelDescription,
          starRating: hotelData.starRating,
          hotelImages: hotelData.hotelImages,
          hotelStaticImageUrl: hotelData?.hotelStaticImageUrl,
          hotelAddress: hotelData.hotelAddress,
          price: {
            currencyCode: hotelData.price.currencyCode,
            roomPrice: hotelData.price.roomPrice,
            tax: hotelData.price.tax,
            extraGuestCharge: hotelData.price.extraGuestCharge,
            childCharge: hotelData.price.childCharge,
            otherCharges: hotelData.price.otherCharges,
            discount: hotelData.price.discount,
            publishedPrice: hotelData.price.publishedPrice,
            publishedPriceRoundedOff: hotelData.price.publishedPriceRoundedOff,
            offeredPrice: hotelData.price.offeredPrice,
            offeredPriceRoundedOff: hotelData.price.offeredPriceRoundedOff,
            qOfferedPriceRoundedOff: hotelData.price.qOfferedPriceRoundedOff,
            agentCommission: hotelData.price.agentCommission,
            agentMarkUp: hotelData.price.agentMarkUp,
            serviceTax: hotelData.price.serviceTax,
            TCS: hotelData.price.TCS,
            TDS: hotelData.price.TDS,
            serviceCharge: hotelData.price.serviceCharge,
            totalGstAmount: hotelData.price.totalGstAmount,
            GST: {
              CGSTAmount: hotelData.price.GST.CGSTAmount,
              CGSTRate: hotelData.price.GST.CGSTRate,
              cessAmount: hotelData.price.GST.cessAmount,
              cessRate: hotelData.price.GST.cessRate,
              IGSTAmount: hotelData.price.GST.IGSTAmount,
              IGSTRate: hotelData.price.GST.IGSTRate,
              SGSTAmount: hotelData.price.GST.SGSTAmount,
              SGSTRate: hotelData.price.GST.SGSTRate,
              taxableAmount: hotelData.price.GST.taxableAmount,
            },
          },
        };
      });
      setHotels(updatedHotels);
      // setFilteredHotels(data); // Update filtered results in state
    } catch (error) {
      console.log("error ", error);
      console.error(error);
    } finally {
      setHotelsLoading(false);
    }
  };

  // Apply filters and fetch results whenever filters change
  useEffect(() => {
    if (roomPreference || priceFilter || starFilters || applyFilter) {
      fetchFilteredResults();
    }
  }, [roomPreference, priceFilter, starFilters, applyFilter]);

  useEffect(() => {
    if (hotelSearchQuery.length === 0 || hotelSearchQuery.length >= 3) {
      fetchFilteredResults();
    }
  }, [hotelSearchQuery]);

  // Function to handle room preference checkbox changes
  const handleRoomPreferenceChange = (type) => {
    setRoomPreference((prev) => ({
      ...prev,
      [type]: !prev[type],
    }));
  };

  // Function to handle price filter selection
  const handlePriceFilterChange = (filter) => {
    // setPriceFilter(filter);
    logEvent(analytics, "price_filter_change", {
      filter: filter,
    });

    setPriceFilter((prevFilter) => (prevFilter === filter ? null : filter));
  };

  const handlePriceFilterChangeMobile = (filter) => {
    // setPriceFilter(filter);

    logEvent(analytics, "price_filter_change_mobile", {
      filter: filter,
    });

    setPriceFilterMobile((prevFilter) =>
      prevFilter === filter ? null : filter
    );
  };

  // Function to handle star filter selection
  const handleStarFilterChange = (star) => {
    logEvent(analytics, "star_filter_change", {
      star: star,
    });
    if (starFilters.includes(star)) {
      setStarFilters(starFilters.filter((s) => s !== star));
    } else {
      setStarFilters([...starFilters, star]);
    }
  };

  const handleStarFilterChangeMobile = (star) => {
    logEvent(analytics, "star_filter_change", {
      star: star,
    });
    if (starFilter.includes(star)) {
      setStarFilter(starFilter.filter((s) => s !== star));
    } else {
      setStarFilter([...starFilter, star]);
    }
  };

  const handleSearchInputChange = (event) => {
    const searchText = event.target.value;
    setHotelSearchQuery(searchText);
  };

  const handleClearSearch = () => {
    setHotelSearchQuery("");
  };

  // const [selectedHotel, setselectedHotel] = useState(0);

  useEffect(() => {
    calculateTotalCost();
  }, [selectedRooms]);

  useEffect(() => {
    // Check if the selectedRooms array is empty
    if (selectedRooms.length === 0) {
      setSelectedHotel("");
      setAllowedCombinations([]); //Setting allowed room combinations to empty
    }
  }, [selectedRooms]);

  useEffect(() => {
    const roomsInt = parseInt(rooms, 10);
    setRequestedNumberOfRooms(roomsInt);
  }, [rooms]);

  useEffect(() => {
    setDestinationhotelLocation(hotelLocation);
  }, [hotelLocation]);

  useEffect(() => {
    if (checkinDate && checkoutDate) {
      const noOfDays = calculateNoOfNights(checkinDate, checkoutDate);
      setTotalNumberOfDays(noOfDays);
    }
    if (roomCountString) {
      const dataArray = JSON.parse(roomCountString);
      if (dataArray) {
        let totalAdults = getTotalAdults(dataArray);
        let totalChildren = getTotalChildren(dataArray);
        setTotalNumberOfAdults(totalAdults);
        setTotalNumberOfGuests(totalAdults + totalChildren);
      }
    }
  }, [checkinDate, checkoutDate, roomCountString]);

  const calculateTotalCost = () => {
    const totalCost = selectedRooms.reduce(
      (accumulator, room) => accumulator + room.price.qOfferedPrice,
      0
    );
    setTotalCostRoom(totalCost.toFixed(0));
    const totalRoomGSTAmount = selectedRooms.reduce(
      (accumulator, room) => accumulator + room.price.totalGstAmount,
      0
    );
    setTotalRoomGSTAmount(totalRoomGSTAmount);
    const totalCommissionAmount = selectedRooms.reduce(
      (accumulator, room) => accumulator + room.price.qCommission,
      0
    );
    setTotalCommissionAmount(totalCommissionAmount);
    return {
      totalCostRoom: totalCost.toFixed(0),
      totalRoomGSTAmount,
      totalCommissionAmount,
    };
  };

  const handleSelectNow = async (
    selectedRoom,
    hotel,
    roomCombinationsArray,
    isReserveAllowed
  ) => {
    setisReserveAllowed(isReserveAllowed);
    if (selectedHotel === "" || selectedHotel === null) {
      setSelectedHotel("");
      setSelectedHotel(hotel);
    }
    if (
      selectedHotel === "" ||
      selectedHotel === null ||
      selectedHotel.hotelCode === hotel.hotelCode
    ) {
      const updatedRooms = selectedRooms;
      updatedRooms.push(selectedRoom);
      setSelectedRooms(updatedRooms);
      setDivDisabled(false);
    } else {
      if (!isToastVisible) {
        // Check if toast is not already visible

        toast("You have already selected rooms from a different hotel", {
          onClose: () => {
            // toast.dismiss();
            isToastVisible = false; // Reset the flag when the toast is closed
          },
          position: "top-right",
          autoClose: 1000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: "light",
        });
        isToastVisible = true; // Set the flag to indicate that a toast is now visible
      }
    }
    const calculatePrice = calculateTotalCost();
    let companyId = null;
    if (corporateUser) {
      companyId = userDetails?.companyId;
      setisReserveAllowed(false);
    }
  };

  const handleRemoveRoom = (index) => {
    // Create a copy of the selectedRooms state
    const updatedSelectedRooms = [...selectedRooms];
    // Remove the room at the specified index
    updatedSelectedRooms.splice(index, 1);
    // Update the state with the updatedSelectedRooms
    setSelectedRooms(updatedSelectedRooms);

    if (updatedSelectedRooms.length == 0) {
      setisReserveAllowed(false);
    }

    logEvent(analytics, "room_removed", {
      removedIndex: index,
      remainingRooms: updatedSelectedRooms.length,
    });
  };

  function convertDateFormat(inputDate) {
    // Split the input date string into an array containing year, month, and day
    const [day, month, year] = inputDate.split("-");
    // Rearrange the parts to form the new date string in dd-mm-yyyy format
    const outputDate = `${day}/${month}/${year}`;
    return outputDate;
  }

  function convertDateFormatToMonthDate(inputDate) {
    const parts = inputDate?.split("-");
    const months = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];

    // Ensure the date has three parts (day, month, year)
    if (parts.length === 3) {
      const day = parseInt(parts[0], 10);
      const monthIndex = parseInt(parts[1], 10) - 1; // Months are zero-based
      const year = parts[2].length === 4 ? parseInt(parts[2], 10) : null;

      if (!isNaN(day) && !isNaN(monthIndex) && !isNaN(year)) {
        // Check if the day is within a valid range
        if (day > 0 && day <= 31) {
          // Check if the month index is within a valid range
          if (monthIndex >= 0 && monthIndex < 12) {
            // Format the date as 'dd Mon'
            const formattedDate = `${day} ${months[monthIndex]}`;
            return formattedDate;
          }
        }
      }
    }

    // Return null for invalid input
    return null;
  }

  useEffect(() => {
    const handlePopState = (event) => {
      router.push("/");
    };
    window.onpopstate = handlePopState;
    return () => {
      window.onpopstate = null;
    };
  }, [router]);

  const goToHome = () => {
    router.push("/");
  };

  let isToastVisible = false; // Flag to track if a toast message is already visible

  const handleBook = async (reserveRoom) => {
    try {
      if (
        selectedRooms.length !== 0 &&
        selectedRooms.length === requestedNumberOfRooms
      ) {
        setLoading(true);
        const storedUserIp = getTabSpecificData("userip");

        const configuration = {
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
          },
        };
        const payload = {
          BlockRoomDetails: {
            HotelCode: selectedHotel.hotelCode,
            HotelName: selectedHotel.hotelName,
            GuestNationality: "IN",
            NoOfRooms: rooms.toString(),
            ClientReferenceNo: 0,
            IsVoucherBooking: true,
            CategoryId: selectedRooms[0].supplierCategoryId,
            HotelRoomsDetails: selectedRooms.map((room) => ({
              RoomIndex: room.roomIndex,
              RoomTypeCode: room.roomTypeCode,
              RoomDescription: room.roomDescription,
              RoomTypeName: room.roomTypeName,
              RatePlanCode: room.ratePlanCode,
              BedTypeCode: null,
              SmokingPreference: room.smokingPreference,
              Supplements: null,
              Price: {
                CurrencyCode: room.price.currencyCode,
                RoomPrice: room.price.roomPrice,
                Tax: room.price.tax,
                ExtraGuestCharge: room.price.extraGuestCharge,
                ChildCharge: room.price.childCharge,
                OtherCharges: room.price.otherCharges,
                Discount: room.price.discount,
                PublishedPrice: room.price.publishedPrice,
                PublishedPriceRoundedOff: room.price.publishedPriceRoundedOff,
                OfferedPrice: room.price.offeredPrice,
                OfferedPriceRoundedOff: room.price.offeredPriceRoundedOff,
                qOfferedPriceRoundedOff: room.price.qOfferedPriceRoundedOff,
                AgentCommission: room.price.agentCommission,
                AgentMarkUp: room.price.agentMarkUp,
                ServiceTax: room.price.serviceTax,
                TDS: room.price.TDS,
                TCS: room.price.TCS,
              },
            })),
          },
          vendorcode: selectedHotel.vendorCode,
          cartId: cartID,
          ipAddress: storedUserIp == "undefined" ? null : storedUserIp,
          qTraceId: qTraceId,
          paxCountDetails: JSON.parse(roomCountString),
        };

        const { data } = await axios.post(
          `${config.BLOCK_ROOM}`,
          payload,
          configuration
        );

        const response = data.data;
        if (response?.BlockRoomResult.AvailabilityType === "Confirm") {
          if (data.status === "SUCCESS") {
            const calculatePrice = calculateTotalCost();
            const cartData = {
              id: null,
              cartId: `cart_${new Date().toISOString()}`,
              userId: getTabSpecificData("userID") || null,
              endUserIp: getTabSpecificData("userip") ?? null,
              traceId: qTraceId,
              bookingStatus: "Pending",
              status: "Active",
              createdDate: null,
              modifiedDate: null,
              cartHotelDetails: {
                hotelIndex: "1",
                hotelCode: selectedHotel.hotelCode,
                hotelName: selectedHotel.hotelName,
                guestNationality: "IN",
                noOfRooms: rooms,
                isVoucherBooking: "false",
                isPackageFare:
                  response?.BlockRoomResult?.IsPackageFare?.toString() ??
                  "false",
                checkInDate: checkinDate,
                checkOutDate: checkoutDate,
                noOfGuests: totalNumberOfGuests,
                noOfNights: totalNumberOfDays,
                noOfAdults: adults,
                noOfChilds: children,
                totalBookingAmount: calculatePrice.totalCostRoom,
                totalGstAmount: calculatePrice.totalRoomGSTAmount,
                totalCommissionAmount: calculatePrice.totalCommissionAmount,
                countryCode: "IN",
                cityId: getCityId,
                cartHotelRoomDetails: selectedRooms.map((room) => ({
                  roomIndex: room.roomIndex,
                  roomTypeCode: room.roomTypeCode,
                  roomTypeName: room.roomTypeName,
                  ratePlanCode: room.ratePlanCode,
                  bedTypeCode: null,
                  smokingPreference: room.smokingPreference,
                  amenities: room.amenities[0],
                  cartHotelRoomPriceDetails: {
                    currencyCode: "INR",
                    roomPrice: room.price.roomPrice,
                    tax: room.price.tax,
                    extraGuestCharge: room.price.extraGuestCharge,
                    childCharge: room.price.childCharge,
                    otherCharges: room.price.otherCharges,
                    discount: room.price.discount,
                    publishedPrice: room.price.publishedPrice,
                    publishedPriceRoundedOff:
                      room.price.publishedPriceRoundedOff,
                    offeredPrice: room.price.offeredPrice,
                    offeredPriceRoundedOff: room.price.offeredPriceRoundedOff,
                    qOfferedPrice: room.price.qOfferedPrice,
                    qOfferedPriceWithoutTax: room.price.qOfferedPriceWithoutTax,
                    qOfferedPriceRoundedOff: room.price.qOfferedPriceRoundedOff,
                    qCommission: room.price.qCommission,
                    qCommissionTax: room.price.qCommissionTax,
                    agentCommission: room.price.agentCommission,
                    agentMarkUp: room.price.agentMarkUp,
                    tds: room.price.TDS,
                    serviceTax: room.price.serviceTax,
                  },
                  cartHotelRoomGuestDetails: null,
                })),
              },
            };

            const compressedCartData = pako.deflate(JSON.stringify(cartData), {
              to: "string",
            });
            setTabSpecificData("qugoCartData", compressedCartData);

            let roomCountStringWithPax = JSON.parse(roomCountString);
            for (const [
              index,
              hotelRoomResult,
            ] of response.BlockRoomResult.HotelRoomsDetails.entries()) {
              roomCountStringWithPax[index]["requireAllPaxDetails"] =
                hotelRoomResult.RequireAllPaxDetails;
              const selectedRoomDetails = [...selectedRooms];
              selectedRoomDetails[index].requireAllPaxDetails =
                hotelRoomResult.RequireAllPaxDetails;
              const adultsData = [];
              const childData = [];
              if (hotelRoomResult.RequireAllPaxDetails) {
                if (roomCountStringWithPax[index].adults > 0) {
                  {
                    Array.from(
                      { length: roomCountStringWithPax[index].adults },
                      (v, i) => i
                    ).map(() => {
                      adultsData.push({
                        firstName: "",
                        middleName: "",
                        lastName: "",
                        title: "Mr",
                        paxType: 1,
                        email: null,
                        mobileNumber: null,
                        age: "0",
                        passportNumber: null,
                        passportIssueDate: null,
                        passportExpDate: null,
                        PAN: null,
                        isPANAvailable: false,
                        isPANValid: false,
                        guardianDetails: {
                          title: "Mr",
                          firstName: "",
                          middleName: "",
                          lastName: "",
                          PAN: null,
                          isPANValid: false,
                        },
                      });
                    });
                  }
                  selectedRoomDetails[index].adultsData = adultsData;
                }
                if (roomCountStringWithPax[index].children > 0) {
                  {
                    Array.from(
                      { length: roomCountStringWithPax[index].children },
                      (v, i) => i
                    ).map((value, childindex) => {
                      childData.push({
                        firstName: "",
                        middleName: "",
                        lastName: "",
                        title: "Mr",
                        paxType: 2,
                        email: null,
                        mobileNumber: null,
                        age: roomCountStringWithPax[index].childAge[childindex],
                        passportNumber: null,
                        passportIssueDate: null,
                        passportExpDate: null,
                        PAN: null,
                        isPANAvailable: false,
                        isPANValid: false,
                        guardianDetails: {
                          title: "Mr",
                          firstName: "",
                          middleName: "",
                          lastName: "",
                          PAN: null,
                          isPANValid: false,
                        },
                      });
                    });
                  }
                  selectedRoomDetails[index].childData = childData;
                }
              } else {
                adultsData.push({
                  firstName: "",
                  middleName: "",
                  lastName: "",
                  title: "Mr",
                  paxType: 1,
                  email: null,
                  mobileNumber: null,
                  age: "0",
                  passportNumber: null,
                  passportIssueDate: null,
                  passportExpDate: null,
                  PAN: null,
                  isPANAvailable: false,
                  isPANValid: false,
                  guardianDetails: {
                    title: "Mr",
                    firstName: "",
                    middleName: "",
                    lastName: "",
                    PAN: null,
                    isPANValid: false,
                  },
                });
                selectedRoomDetails[index].adultsData = adultsData;
              }
              setSelectedRooms(selectedRoomDetails);
            }

            roomCountStringWithPax = JSON.stringify(roomCountStringWithPax);
            setTabSpecificData("selectedHotel", JSON.stringify(selectedHotel));
            setTabSpecificData("selectedRooms", JSON.stringify(selectedRooms));
            setTabSpecificData("blockRoomResponse", JSON.stringify(data));
            setTabSpecificData(
              "roomCountString",
              JSON.stringify(roomCountString)
            );
            const isPackageFare = response.BlockRoomResult.IsPackageFare;

            router.push({
              pathname: "/newBookingPage",
              query: {
                activeTab: "hotels",
              },
            });
            logEvent(analytics, "room_booked", {
              hotelCode: selectedHotel.hotelCode,
              rooms: selectedRooms.length,
            });
          } else {
          }
        } else {
          toast("Hotel is not available now");
          setSelectedRooms([]);
        }
        // setDivDisabled(false);
      } else {
        toast("Please select specified rooms");
        if (divDisabled) {
          return; // Return early if button is disabled
        }

        // Disable the button
        setDivDisabled(true);

        // Rest of your logic

        // Enable the button after a specific delay (e.g., 3 seconds)
        setTimeout(() => {
          setDivDisabled(false);
        }, 6000); // Adjust the delay as needed
        return;
      }
    } catch (error) {
      if (error?.response?.data?.status == "FAILED") {
        if (error?.response?.data?.error?.ErrorCode == "1003") {
          toast.info(
            error?.response?.data?.error?.ErrorMsg ||
              "Something went wrong, please try again later",
            {
              autoClose: 2000, // Duration of the toast message (2 seconds)
            }
          );
          // toast.info(
          //   "Service timeout, Redirecting to search page, please search again",
          //   {
          //     autoClose: 2000, // Duration of the toast message (2 seconds)
          //   }
          // );
          setTimeout(() => {
            //   // Perform the redirect here
            goToHome();
          }, 2000);
        } else {
          toast("Something went wrong, please try again later");
        }
      }
    } finally {
      setLoading(false);
    }
  };

  const handleReserve = async (reserveRoom) => {
    try {
      if (
        selectedRooms.length !== 0 &&
        selectedRooms.length === requestedNumberOfRooms
      ) {
        setReserveButtonLoading(true);
        const blockResp = await blockRequest(
          qTraceId,
          cartID,
          selectedHotel,
          selectedRooms,
          rooms,
          convertDateFormat(checkinDate),
          getCityId,
          false, //Send this key true if reserve is clicked
          roomCountString
        );
        if (blockResp.data.BlockRoomResult.AvailabilityType === "Confirm") {
          if (blockResp.status === "SUCCESS") {
            const calculatePrice = calculateTotalCost();
            const cartData = {
              id: null,
              cartId: `cart_${new Date().toISOString()}`,
              userId: getTabSpecificData("userID") || null,
              endUserIp: getTabSpecificData("userip") ?? null,
              traceId: qTraceId,
              bookingStatus: "Pending",
              status: "Active",
              createdDate: null,
              modifiedDate: null,
              cartHotelDetails: {
                hotelIndex: "1",
                hotelCode: selectedHotel.hotelCode,
                hotelName: selectedHotel.hotelName,
                guestNationality: "IN",
                noOfRooms: rooms,
                isVoucherBooking: "true",
                isPackageFare:
                  blockResp?.data?.BlockRoomResult?.IsPackageFare?.toString() ??
                  "false",
                checkInDate: checkinDate,
                checkOutDate: checkoutDate,
                noOfGuests: totalNumberOfGuests,
                noOfNights: totalNumberOfDays,
                noOfAdults: adults,
                noOfChilds: children,
                totalBookingAmount: calculatePrice.totalCostRoom,
                totalGstAmount: calculatePrice.totalRoomGSTAmount,
                totalCommissionAmount: calculatePrice.totalCommissionAmount,
                countryCode: "IN",
                cityId: getCityId,
                cartHotelRoomDetails: selectedRooms.map((room) => ({
                  roomIndex: room.roomIndex,
                  roomTypeCode: room.roomTypeCode,
                  roomTypeName: room.roomTypeName,
                  ratePlanCode: room.ratePlanCode,
                  bedTypeCode: null,
                  smokingPreference: room.smokingPreference,
                  amenities: room.amenities[0],
                  cartHotelRoomPriceDetails: {
                    currencyCode: "INR",
                    roomPrice: room.price.roomPrice,
                    tax: room.price.tax,
                    extraGuestCharge: room.price.extraGuestCharge,
                    childCharge: room.price.childCharge,
                    otherCharges: room.price.otherCharges,
                    discount: room.price.discount,
                    publishedPrice: room.price.publishedPrice,
                    publishedPriceRoundedOff:
                      room.price.publishedPriceRoundedOff,
                    offeredPrice: room.price.offeredPrice,
                    offeredPriceRoundedOff: room.price.offeredPriceRoundedOff,
                    qOfferedPrice: room.price.qOfferedPrice,
                    qOfferedPriceWithoutTax: room.price.qOfferedPriceWithoutTax,
                    qOfferedPriceRoundedOff: room.price.qOfferedPriceRoundedOff,
                    qCommission: room.price.qCommission,
                    qCommissionTax: room.price.qCommissionTax,
                    agentCommission: room.price.agentCommission,
                    agentMarkUp: room.price.agentMarkUp,
                    tds: room.price.TDS,
                    serviceTax: room.price.serviceTax,
                  },
                  cartHotelRoomGuestDetails: null,
                })),
              },
            };

            const compressedCartData = pako.deflate(JSON.stringify(cartData), {
              to: "string",
            });
            setTabSpecificData("qugoCartData", compressedCartData);

            let roomCountStringWithPax = JSON.parse(roomCountString);

            for (const [
              index,
              hotelRoomResult,
            ] of blockResp.data.BlockRoomResult.HotelRoomsDetails.entries()) {
              roomCountStringWithPax[index]["requireAllPaxDetails"] =
                hotelRoomResult.RequireAllPaxDetails;
              const selectedRoomDetails = [...selectedRooms];
              selectedRoomDetails[index].requireAllPaxDetails =
                hotelRoomResult.RequireAllPaxDetails;
              const adultsData = [];
              let childData = [];
              if (hotelRoomResult.RequireAllPaxDetails) {
                if (roomCountStringWithPax[index].adults > 0) {
                  {
                    Array.from(
                      { length: roomCountStringWithPax[index].adults },
                      (v, i) => i
                    ).map(() => {
                      adultsData.push({
                        firstName: "",
                        middleName: "",
                        lastName: "",
                        title: "Mr",
                        paxType: 1,
                        email: null,
                        mobileNumber: null,
                        age: "0",
                        passportNumber: null,
                        passportIssueDate: null,
                        passportExpDate: null,
                        PAN: null,
                        isPANAvailable: false,
                        isPANValid: false,
                        guardianDetails: {
                          title: "Mr",
                          firstName: "",
                          middleName: "",
                          lastName: "",
                          PAN: null,
                          isPANValid: false,
                        },
                      });
                    });
                  }
                  selectedRoomDetails[index].adultsData = adultsData;
                }
                if (roomCountStringWithPax[index].children > 0) {
                  {
                    Array.from(
                      { length: roomCountStringWithPax[index].children },
                      (v, i) => i
                    ).map((value, childindex) => {
                      const data = {
                        firstName: "",
                        middleName: "",
                        lastName: "",
                        title: "Mr",
                        paxType: 2,
                        email: null,
                        mobileNumber: null,
                        age: roomCountStringWithPax[index].childAge[childindex],
                        passportNumber: null,
                        passportIssueDate: null,
                        passportExpDate: null,
                        PAN: null,
                        isPANAvailable: false,
                        isPANValid: false,
                        guardianDetails: {
                          title: "Mr",
                          firstName: "",
                          middleName: "",
                          lastName: "",
                          PAN: null,
                          isPANValid: false,
                        },
                      };
                      childData = [...childData, data];
                    });
                  }
                  selectedRoomDetails[index].childData = childData;
                }
              } else {
                adultsData.push({
                  firstName: "",
                  middleName: "",
                  lastName: "",
                  title: "Mr",
                  paxType: 1,
                  email: null,
                  mobileNumber: null,
                  age: "0",
                  passportNumber: null,
                  passportIssueDate: null,
                  passportExpDate: null,
                  PAN: null,
                  isPANAvailable: false,
                  isPANValid: false,
                  guardianDetails: {
                    title: "Mr",
                    firstName: "",
                    middleName: "",
                    lastName: "",
                    PAN: null,
                    isPANValid: false,
                  },
                });
                selectedRoomDetails[index].adultsData = adultsData;
              }
              setSelectedRooms(selectedRoomDetails);
            }

            roomCountStringWithPax = JSON.stringify(roomCountStringWithPax);
            setTabSpecificData("selectedHotel", JSON.stringify(selectedHotel));
            setTabSpecificData("selectedRooms", JSON.stringify(selectedRooms));

            logEvent(analytics, "room_reserved", {
              hotelCode: selectedHotel.hotelCode,
              rooms: selectedRooms.length,
            });

            // localStorage.setItem("blockRoomResponse", JSON.stringify(data));
            // const isPackageFare = response.BlockRoomResult.IsPackageFare;

            setTabSpecificData("blockRoomResponse", JSON.stringify(blockResp));
            setTabSpecificData(
              "roomCountString",
              JSON.stringify(roomCountString)
            );
            const isPackageFare = blockResp.data.BlockRoomResult.IsPackageFare;
            router.push({
              pathname: "/newBookingPage",
              query: {
                activeTab: "hotels",
              },
            });
          }
        } else {
          toast("Hotel is not available now");
          setSelectedRooms([]);
        }
      } else {
        toast("Please select specified rooms");
      }
    } catch (error) {
      if (error?.response?.data?.status == "FAILED") {
        console.log("inside error failed");
        if (error?.response?.data?.error?.ErrorCode == "1003") {
          toast.info(
            error?.response?.data?.error?.ErrorMsg ||
              "Something went wrong, please try again later",
            {
              autoClose: 2000, // Duration of the toast message (2 seconds)
            }
          );
          setTimeout(() => {
            //   // Perform the redirect here
            goToHome();
          }, 2000);
        } else {
          toast("Something went wrong, please try again later");
        }
      }
      // console.log("Error occurred while calling block request", error);
    } finally {
      setReserveButtonLoading(false);
    }
  };

  function getTotalAdults(data) {
    return data.reduce((totalAdults, item) => totalAdults + item.adults, 0);
  }

  function getTotalChildren(data) {
    return data.reduce(
      (totalChildren, item) => totalChildren + item.children,
      0
    );
  }

  useEffect(() => {
    const fetchData = () => {
      try {
        const newCartID = uuidv4();

        const searchDataStringFormat = getTabSpecificData("searchData");
        const searchData = JSON.parse(searchDataStringFormat);

        if (!searchData) {
          router.replace("/");
        }
        setQTraceID(searchData.qTraceId);
        setAdults(searchData.adults);
        setChildren(searchData.children);
        setRooms(searchData.rooms);
        setDestination(searchData.destination);
        setCheckinDate(searchData.checkInDate);
        setCheckoutDate(searchData.checkoutDate);
        setCityId(searchData.getCityId);
        setCountryCode(searchData.getCountryCode);
        setHotelCode(searchData.getHotelCode);
        setHotelLocation(searchData.hotelLocation);
        setRoomCountString(searchData.roomCountString);
        setNoOfNights(searchData.noOfNights);
        setHotelSearchData(searchData);

        if (roomCountString) {
          const dataArray = JSON.parse(roomCountString);
          if (dataArray) {
            let totalAdults = getTotalAdults(dataArray);
            let totalChildren = getTotalChildren(dataArray);
            setTotalNumberOfAdults(totalAdults);
            setTotalNumberOfGuests(totalAdults + totalChildren);
          }
        }

        const roomsInt = parseInt(rooms, 10);
        setRequestedNumberOfRooms(roomsInt);

        if (checkinDate && checkoutDate) {
          const noOfDays = calculateNoOfNights(checkinDate, checkoutDate);
          setTotalNumberOfDays(noOfDays);
        }

        let hotelList = getTabSpecificData("hotelList");
        const parsedHotelList = JSON.parse(hotelList);

        const hotelResults = parsedHotelList.hotelResults;

        setTabSpecificData("cartID", newCartID);
        setCartID(newCartID);
        let updatedHotels = hotelResults.map((hotelData) => {
          return {
            hotelCode: hotelData.hotelCode,
            hotelName: hotelData.hotelName,
            vendorCode: hotelData.vendorCode,
            hotelDescription: hotelData.hotelDescription,
            starRating: hotelData.starRating,
            hotelImages: hotelData.hotelImages,
            hotelStaticImageUrl: hotelData?.hotelStaticImageUrl,
            hotelAddress: hotelData.hotelAddress,
            price: {
              currencyCode: hotelData?.price?.currencyCode,
              roomPrice: hotelData?.price?.roomPrice,
              tax: hotelData?.price?.tax,
              extraGuestCharge: hotelData?.price?.extraGuestCharge,
              childCharge: hotelData?.price?.childCharge,
              otherCharges: hotelData?.price?.otherCharges,
              discount: hotelData?.price?.discount,
              publishedPrice: hotelData?.price?.publishedPrice,
              publishedPriceRoundedOff:
                hotelData?.price?.publishedPriceRoundedOff,
              offeredPrice: hotelData?.price?.offeredPrice,
              offeredPriceRoundedOff: hotelData?.price?.offeredPriceRoundedOff,
              qOfferedPriceRoundedOff:
                hotelData?.price?.qOfferedPriceRoundedOff,
              agentCommission: hotelData?.price?.agentCommission,
              agentMarkUp: hotelData?.price?.agentMarkUp,
              serviceTax: hotelData?.price?.serviceTax,
              TCS: hotelData?.price?.TCS,
              TDS: hotelData?.price?.TDS,
              serviceCharge: hotelData?.price?.serviceCharge,
              totalGstAmount: hotelData?.price?.totalGstAmount,
              GST: {
                CGSTAmount: hotelData?.price?.GST?.CGSTAmount,
                CGSTRate: hotelData?.price?.GST?.CGSTRate,
                cessAmount: hotelData?.price?.GST?.cessAmount,
                cessRate: hotelData?.price?.GST?.cessRate,
                IGSTAmount: hotelData?.price?.GST?.IGSTAmount,
                IGSTRate: hotelData?.price?.GST?.IGSTRate,
                SGSTAmount: hotelData?.price?.GST?.SGSTAmount,
                SGSTRate: hotelData?.price?.GST?.SGSTRate,
                taxableAmount: hotelData?.price?.GST?.taxableAmount,
              },
            },
          };
        });

        setHotels(updatedHotels);
      } catch (error) {
        console.log("error", error);
      } finally {
        setPageLoading(false);
      }
    };
    fetchData();
  }, []);

  const setSearchData = (searchData) => {
    setQTraceID(searchData.qTraceId);
    setAdults(searchData.adults);
    setChildren(searchData.children);
    setRooms(searchData.rooms);
    setDestination(searchData.destination);
    setCheckinDate(searchData.checkInDate);
    setCheckoutDate(searchData.checkoutDate);
    setCityId(searchData.getCityId);
    setCountryCode(searchData.getCountryCode);
    setHotelCode(searchData.getHotelCode);
    setHotelLocation(searchData.hotelLocation);
    setRoomCountString(searchData.roomCountString);
    setNoOfNights(searchData.noOfNights);
    setHotelSearchData(searchData);
  };

  const updateHotelList = (
    response,
    checkinDate,
    checkoutDate,
    destination,
    getCityId,
    getCountryCode,
    roomCountString,
    rooms,
    adults,
    children,
    hotelLocation,
    noOfNights
  ) => {
    let hotelResults = response?.hotelResults;
    setQTraceID(response?.qTraceId);
    let updatedHotels = hotelResults.map((hotelData) => {
      return {
        hotelCode: hotelData.hotelCode,
        hotelName: hotelData.hotelName,
        vendorCode: hotelData.vendorCode,
        hotelDescription: hotelData.hotelDescription,
        starRating: hotelData.starRating,
        hotelImages: hotelData.hotelImages,
        hotelStaticImageUrl: hotelData?.hotelStaticImageUrl,
        hotelAddress: hotelData.hotelAddress || hotelLocation,
        price: {
          currencyCode: hotelData.price.currencyCode,
          roomPrice: hotelData.price.roomPrice,
          tax: hotelData.price.tax,
          extraGuestCharge: hotelData.price.extraGuestCharge,
          childCharge: hotelData.price.childCharge,
          otherCharges: hotelData.price.otherCharges,
          discount: hotelData.price.discount,
          publishedPrice: hotelData.price.publishedPrice,
          publishedPriceRoundedOff: hotelData.price.publishedPriceRoundedOff,
          offeredPrice: hotelData.price.offeredPrice,
          offeredPriceRoundedOff: hotelData.price.offeredPriceRoundedOff,
          qOfferedPriceRoundedOff: hotelData.price.qOfferedPriceRoundedOff,
          agentCommission: hotelData.price.agentCommission,
          agentMarkUp: hotelData.price.agentMarkUp,
          serviceTax: hotelData.price.serviceTax,
          TCS: hotelData.price.TCS,
          TDS: hotelData.price.TDS,
          serviceCharge: hotelData.price.serviceCharge,
          totalGstAmount: hotelData.price.totalGstAmount,
          GST: {
            CGSTAmount: hotelData.price.GST.CGSTAmount,
            CGSTRate: hotelData.price.GST.CGSTRate,
            cessAmount: hotelData.price.GST.cessAmount,
            cessRate: hotelData.price.GST.cessRate,
            IGSTAmount: hotelData.price.GST.IGSTAmount,
            IGSTRate: hotelData.price.GST.IGSTRate,
            SGSTAmount: hotelData.price.GST.SGSTAmount,
            SGSTRate: hotelData.price.GST.SGSTRate,
            taxableAmount: hotelData.price.GST.taxableAmount,
          },
        },
      };
    });
    const searchData = {
      ...hotelSearchData,
      adults: adults,
      children: children,
      rooms: rooms,
      checkInDate: checkinDate,
      checkoutDate: checkoutDate,
      roomCountString: roomCountString,
      qTraceId: response?.qTraceId,
      destination: destination,
      getCityId: getCityId,
      getCountryCode: getCountryCode,
      hotelLocation: hotelLocation,
      noOfNights: noOfNights,
    };
    setTabSpecificData("searchData", JSON.stringify(searchData));
    setSearchData(searchData);

    setHotels(updatedHotels);
  };

  const searchRoomCall = (value) => {
    setSearchCall(value);
  };

  const clearAllFilters = () => {
    logEvent(analytics, "clear_all_filters");
    if (
      Object.values(roomPreference).some(Boolean) ||
      priceFilter !== null ||
      starFilters.length > 0
    ) {
      setRoomPreference({
        breakfast: false,
        lunch: false,
        dinner: false,
      });
      setPriceFilter(null);
      setStarFilters([]);
    }
  };
  const applyAllFilters = () => {
    if (starFilter || priceFilterMobile) setApplyFilter(!applyFilter);
    setFilterCardVisibility(false);
  };

  const [isFilterCardVisible, setFilterCardVisibility] = useState(false);
  const mobFilterBtnRef = useRef(null);
  const mobhotelfiltercardRef = useRef(null);

  const handleFilterBtnClick = () => {
    setFilterCardVisibility(!isFilterCardVisible);
  };

  const handleOutsideClick = (event) => {
    if (
      mobhotelfiltercardRef.current &&
      !mobhotelfiltercardRef.current.contains(event.target) &&
      mobFilterBtnRef.current &&
      !mobFilterBtnRef.current.contains(event.target)
    ) {
      setFilterCardVisibility(false);
    }
  };

  useEffect(() => {
    document.addEventListener("click", handleOutsideClick);

    return () => {
      document.removeEventListener("click", handleOutsideClick);
    };
  }, []);

  console.log("pageLoading", pageLoading);
  console.log("hotelSearchData", hotelSearchData);
  return (
    <>
      {pageLoading ? (
        <div>...loading</div>
      ) : (
        hotelSearchData?.qTraceId && (
          <>
            <div className={style.gotopbtn}>
              <GoToTopButton />
            </div>
            <Chaticon />
            <div>
              {(searchCall || loading || reserveButtonLoading) && <Loader />}
              <Header
                mDestination={destination}
                mCheckinDate={checkinDate}
                mCheckoutDate={checkoutDate}
                updateHotelList={updateHotelList}
                roomCountString={roomCountString}
                cityId={getCityId}
                countryCode={getCountryCode}
                hotelCode={getHotelCode}
                clearSelectedRooms={() => setSelectedRooms([])}
                setHotelsLoading={setHotelsLoading}
                clearAllFilters={clearAllFilters}
                searchRoomCall={searchRoomCall}
              />
              {/* <HeaderHome /> */}
              <div className={style.hotellistsearchbar}>
                <div className={style.topresultstext}>
                  Top Results
                  <div className={style.abovetopDetails}>
                    <span className={style.belowTopDetails}>
                      {destination} |{" "}
                      {checkinDate && convertDateFormatToMonthDate(checkinDate)}{" "}
                      -{" "}
                      {checkoutDate &&
                        convertDateFormatToMonthDate(checkoutDate)}{" "}
                      | {noOfNights} Nights |{" "}
                      {adults && <span>{adults} Adults</span>}{" "}
                      {children > 0 && <span>{children} Kid</span>}
                    </span>
                  </div>
                </div>
                <div className={style.searchfield}>
                  <input
                    className={style.searchbar}
                    type="text"
                    placeholder="Search the hotel, location"
                    value={hotelSearchQuery}
                    onInput={handleSearchInputChange}
                  />
                  {hotelSearchQuery.length > 0 && (
                    <div
                      onClick={handleClearSearch}
                      className={style.clearButton}
                    >
                      <FontAwesomeIcon icon={faTimes} />
                    </div>
                  )}
                  <div className={style.searchAlign}>
                    <FontAwesomeIcon
                      className={style.searchIcon}
                      icon={faSearch}
                    />
                  </div>
                </div>
                <div
                  className={style.mobFilterBtn}
                  ref={mobFilterBtnRef}
                  onClick={handleFilterBtnClick}
                >
                  Filters
                </div>
              </div>
              <div className={style.hotelandfilterdiv}>
                {isFilterCardVisible && (
                  <>
                    <div
                      className={style.backdrop}
                      onClick={handleFilterBtnClick}
                    ></div>
                    <div
                      className={style.mobhotelfiltercard}
                      ref={mobhotelfiltercardRef}
                    >
                      <div className={style.filtertext}>
                        Filters for your best search
                        <div
                          className={style.filtercardCloseBtn}
                          onClick={handleFilterBtnClick}
                        >
                          <CloseButton />
                        </div>
                      </div>
                      <div
                        className={`${style.whitecard} ${style.whitecardbgdiff}`}
                      >
                        <div className={style.cardtitle}> Price </div>
                        <div className={style.flexcenterdiv}>
                          <div
                            className={`${style.greybgroundedbutton} ${
                              priceFilterMobile === "lowHigh" &&
                              style.selectedFilter
                            }`}
                            onClick={() =>
                              handlePriceFilterChangeMobile("lowHigh")
                            }
                          >
                            {" "}
                            Low - High
                          </div>
                          <div
                            className={`${style.greybgroundedbutton} ${
                              priceFilterMobile === "highLow" &&
                              style.selectedFilter
                            }`}
                            onClick={() =>
                              handlePriceFilterChangeMobile("highLow")
                            }
                          >
                            {" "}
                            High - Low
                          </div>
                        </div>
                      </div>

                      <div
                        className={`${style.whitecard} ${style.whitecardbgdiff}`}
                      >
                        <div className={style.cardtitle}> Star </div>
                        {[1, 2, 3, 4, 5].map((star) => (
                          <div
                            key={star}
                            className={`${style.filterRatingContainer} ${style.pointerCursor}`}
                            onClick={() => handleStarFilterChangeMobile(star)}
                          >
                            <div className={style.starRating}>
                              <StarRatings
                                rating={star}
                                starRatedColor="#FFA432"
                                starEmptyColor="#cccccc"
                                starDimension={starDimension}
                                starSpacing="2px"
                                numberOfStars={star}
                                className={style.pointerCursor}
                              />
                              <div className={style.starCheckboxContainer}>
                                <input
                                  type="checkbox"
                                  className={style.starCheckbox}
                                  checked={starFilter.includes(star)}
                                  onChange={() =>
                                    handleStarFilterChangeMobile(star)
                                  }
                                />
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "center",
                          gap: "10px",
                        }}
                      >
                        <div
                          className={style.clearFiltersButton}
                          onClick={clearAllFilters}
                        >
                          Clear All Filters
                        </div>

                        <div
                          className={style.clearFiltersButton}
                          onClick={applyAllFilters}
                        >
                          Apply Filters
                        </div>
                      </div>
                      <div className={style.spacing}></div>
                    </div>
                  </>
                )}
                <div className={style.hotelfiltercard}>
                  <div className={style.filtertext}>
                    Filters for your best search
                  </div>

                  <div className={style.whitecard}>
                    <div className={style.cardtitle}> Price </div>
                    <div className={style.flexcenterdiv}>
                      <div
                        className={`${style.greybgroundedbutton} ${
                          priceFilter === "lowHigh" && style.selectedFilter
                        }`}
                        onClick={() => handlePriceFilterChange("lowHigh")}
                      >
                        {" "}
                        Low - High
                      </div>
                      <div
                        className={`${style.greybgroundedbutton} ${
                          priceFilter === "highLow" && style.selectedFilter
                        }`}
                        onClick={() => handlePriceFilterChange("highLow")}
                      >
                        {" "}
                        High - Low
                      </div>
                    </div>
                  </div>

                  <div className={style.whitecard}>
                    <div className={style.cardtitle}> Star </div>
                    {[1, 2, 3, 4, 5].map((star) => (
                      <div
                        key={star}
                        className={`${style.filterRatingContainer} ${style.pointerCursor}`}
                        onClick={() => handleStarFilterChange(star)}
                      >
                        <div className={style.starRating}>
                          <StarRatings
                            rating={star}
                            starRatedColor="#FFA432"
                            starEmptyColor="#cccccc"
                            starDimension={starDimension}
                            starSpacing="2px"
                            numberOfStars={star}
                            className={style.pointerCursor}
                          />
                          <div className={style.starCheckboxContainer}>
                            <input
                              type="checkbox"
                              className={style.starCheckbox}
                              checked={starFilters.includes(star)}
                              onChange={() => handleStarFilterChange(star)}
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div
                    className={style.clearFiltersButton}
                    onClick={clearAllFilters}
                  >
                    Clear All Filters
                  </div>
                  <div className={style.spacing}></div>
                </div>
                <div className={style.hotellistcard}>
                  <div>
                    {hotelsLoading ? (
                      <div className={style.loaderContainer}>
                        <svg
                          className={style.loader}
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 100 100"
                          preserveAspectRatio="xMidYMid"
                        >
                          <circle
                            cx="50"
                            cy="50"
                            fill="none"
                            strokeWidth="10"
                            r="35"
                            stroke="rgba(2, 143, 163, 1)"
                            strokeDasharray="164.93361431346415 56.97787143782138"
                          >
                            <animateTransform
                              attributeName="transform"
                              type="rotate"
                              repeatCount="indefinite"
                              dur="0.78125s"
                              values="0 50 50;360 50 50"
                              keyTimes="0;1"
                            />
                          </circle>
                        </svg>
                      </div>
                    ) : hotels.length === 0 ? (
                      <div className={style.centeredFlexContainer}>
                        <div className={style.noResults}>No results found.</div>
                      </div>
                    ) : (
                      hotels.map((hotel) => (
                        <HotelListItem
                          key={hotel.hotelCode}
                          hotel={hotel}
                          // qTraceId={getQTraceID}
                          qTraceId={qTraceId}
                          // requestedRooms={rooms}
                          requestedRooms={selectedRooms}
                          checkinDate={checkinDate}
                          cityID={getCityId}
                          onBookRoom={handleSelectNow}
                          destination={destination}
                          selectedHotelCode={selectedHotel.hotelCode}
                          hotelLocation={destinationhotelLocation}
                          openHotelCode={openHotelCode}
                          setOpenHotelCode={setOpenHotelCode}
                        />
                      ))
                    )}
                  </div>
                </div>
                <div className={style.hotelselectioncard}>
                  <div
                    className={`${style.whitecard} ${
                      selectedRooms.length === 0 ? style.disabled : ""
                    }`}
                  >
                    {selectedRooms.length > 0 && (
                      <div>
                        <div className={style.cardtitle}>Selected Rooms</div>

                        <div className={style.mobroomNamePrice}>
                          {selectedRooms.map((room, index) => (
                            <div className={style.elevatedCard} key={index}>
                              <div
                                className={style.crossContainer}
                                onClick={() => handleRemoveRoom(false)}
                              >
                                <span className={style.crossButton}>
                                  &times;
                                </span>
                              </div>
                              {room.roomTypeName}
                            </div>
                          ))}
                          <div className={style.mobTotalPrice}>
                            {" "}
                            <strong>Rs.{totalCostRoom}</strong>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                  <div
                    className={`${style.whitecard} ${style.mobnightsbtnAlign}`}
                  >
                    <divn className={`${style.billtext} ${style.mobPriceHide}`}>
                      {" "}
                      Total amount to be paid:{" "}
                      <strong>Rs.{totalCostRoom}</strong>
                    </divn>
                    <divn className={style.billtext}>
                      {" "}
                      <span className={style.mobhideNights}>
                        {" "}
                        Total number of{" "}
                      </span>{" "}
                      Nights: {totalNumberOfDays}
                    </divn>
                    <divn className={style.billtext}>
                      {" "}
                      <span className={style.mobhideNights}>
                        {" "}
                        Total number of
                      </span>{" "}
                      Guests: {totalNumberOfGuests}
                    </divn>
                    <divn className={style.mobBookButton}>
                      <div
                        // className={style.solidbutton}
                        // onClick={() => handleBook(false)}
                        className={`${style.solidbutton} ${
                          divDisabled ? style.disabledButton : ""
                        }`}
                        // onClick={divDisabled ? null : () => handleBook(false)}
                        onClick={
                          loading || divDisabled
                            ? null
                            : () => handleBook(false)
                        }
                      >
                        {" "}
                        {"Book"}
                      </div>
                      {isReserveAllowed ? (
                        <div
                          className={style.outlinedButton}
                          // onClick={() => handleReserve(true)}
                          // onClick={divDisabled ? null : () => handleReserve(true)}
                          onClick={
                            reserveButtonLoading
                              ? null
                              : () => handleReserve(true)
                          }
                        >
                          {" "}
                          {"Reserve"}
                        </div>
                      ) : (
                        <div></div>
                      )}
                    </divn>
                  </div>
                  <div className={style.mobHideButton}>
                    <div
                      // className={style.solidbutton}
                      // onClick={() => handleBook(false)}
                      className={`${style.solidbutton} ${
                        divDisabled ? style.disabledButton : ""
                      }`}
                      // onClick={divDisabled ? null : () => handleBook(false)}
                      onClick={
                        loading || divDisabled ? null : () => handleBook(false)
                      }
                    >
                      {" "}
                      {"Book"}
                    </div>
                    {isReserveAllowed ? (
                      <div
                        className={style.outlinedButton}
                        // onClick={() => handleReserve(true)}
                        // onClick={divDisabled ? null : () => handleReserve(true)}
                        onClick={
                          reserveButtonLoading
                            ? null
                            : () => handleReserve(true)
                        }
                      >
                        {" "}
                        {"Reserve"}
                      </div>
                    ) : (
                      <div></div>
                    )}
                  </div>
                </div>
              </div>
              {!corporateUser ? <Footer /> : <Footer1 />}
            </div>
          </>
        )
      )}
    </>
  );
}
