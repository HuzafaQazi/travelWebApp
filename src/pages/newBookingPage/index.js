import "bootstrap/dist/css/bootstrap.css";
import Footer from "@/components/footer/footer";
import style from "./styles.module.css";
import { useState, useEffect } from "react";
import Image from "next/image";
import Dropdown from "react-bootstrap/Dropdown";
import TimePicker from "react-bootstrap-time-picker";
import { handleLogout } from "@/utils/axios/axios";
import pako from "pako";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import {
  bookRoom,
  getPaymentGateway,
  getPaymentSessionID,
  validateGst,
} from "../../../utils/bookingAPI";
import GuestCard from "@/components/guestCard/guestCard";
import { useRouter } from "next/router";
import { useSelector } from "react-redux";
import Router from "next/router";
import useLocalStorage from "@/hooks/useLocalStorage";
import {
  getTabSpecificData,
  setTabSpecificData,
  removeTabSpecificData,
} from "@/utils/axios/axios";
import StarRating from "@/components/starRating";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCaretDown } from "@fortawesome/free-solid-svg-icons";
import { faCaretRight } from "@fortawesome/free-solid-svg-icons";
import { faSpinner } from "@fortawesome/free-solid-svg-icons";
import Popup from "reactjs-popup";
import PriceChangedPopup from "@/components/pricechangedpopup/pricechangedpopup";
import props from "prop-types";
import { blockRequestForBlcokResponse } from "../../../utils/bookingAPI";
import { panVerification } from "../../../utils/verificationAPI";
import ReactHtmlParser from "html-react-parser";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import TabTitle from "@/components/tabtitles/tabtitle";
import Loader from "@/components/loader/loader";
import { routeToPg } from "@/paymentGateways/pgRouting";
import GoToTopButton from "@/components/gototopbutton/gototopbutton";
import Chaticon from "@/components/chaticon/chaticon";
import { analytics } from "../../../utils/firebase";
import { logEvent } from "firebase/analytics";
import CommonHeader from "@/components/flights/commonHeader/commonHeader";
import B2CHeader from "@/components/flights/B2cHeader/Header";
import { getUserStatus } from "@/utils/userStatus";
import { useLogin } from "@/store/context/LoginContext";
import { useUserType } from "@/hooks/useUserType";
import Header from "@/components/corporate/auth/Header";
import { useWalletBalance } from "@/hooks/useWalletBalance";
import Footer1 from "@/components/corporate/footerCorporate/footerCorporate";
import UseWalletBalanceButton from "@/components/wallet/walletButton/useWalletButton";

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

function sanitizeAndRenderHTML(inputString) {
  // Remove special characters like "//" and "///"
  const sanitizedString = inputString.replace(/\/\/+|[" ]*\|[" ]*/g, "");

  const finalSanitizedString = sanitizedString.replace(/"/g, "");

  const stripsHtml = finalSanitizedString
    .replace(/<\/?[^>]+(>|$)/g, "")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");

  // Render HTML tags using ReactHtmlParser
  return ReactHtmlParser(stripsHtml);
}

export default function Booking() {
  const userDetails = useSelector((state) => state?.user?.userInfo);

  // const router = useRouter();
  const { openPopup, accessToken } = useLogin();
  const corporateUser = useUserType();
  const { walletBalance } = useWalletBalance();

  function getDayWithSuffix(day) {
    if (day >= 11 && day <= 13) {
      return day + "th";
    } else {
      switch (day % 10) {
        case 1:
          return day + "st";
        case 2:
          return day + "nd";
        case 3:
          return day + "rd";
        default:
          return day + "th";
      }
    }
  }

  const router = useRouter();

  const daysOfWeek = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];

  // dropdown for flights
  const OptionDropdown = (props) => {
    const { travelType } = props;
    const [showDropdown, setShowDropdown] = useState(false);

    const toggleDropdown = () => {
      setShowDropdown(!showDropdown);
    };

    return (
      <Dropdown show={showDropdown} onToggle={toggleDropdown}>
        <Dropdown.Toggle
          variant="secondary"
          id="dropdown-basic"
          className={style["dropdown-icon"]}
        >
          {travelType === "arrival"
            ? blockResponse &&
              blockResponse?.data?.BlockRoomResult?.arrivalTransport &&
              blockResponse?.data?.BlockRoomResult?.arrivalTransport
                ?.arrivalTransportType
              ? blockResponse?.data?.BlockRoomResult?.arrivalTransport
                  ?.arrivalTransportType
              : "Flight"
            : travelType === "departure"
            ? blockResponse &&
              blockResponse?.data?.BlockRoomResult?.departureTransport &&
              blockResponse?.data?.BlockRoomResult?.departureTransport
                ?.departureTransportType
              ? blockResponse?.data?.BlockRoomResult?.departureTransport
                  ?.departureTransportType
              : "Flight"
            : null}
        </Dropdown.Toggle>
        <Dropdown.Menu>
          <Dropdown.Item
            onClick={(e) =>
              arrivalDepartureDetails(e, travelType, "type", "Flight")
            }
          >
            Flight
          </Dropdown.Item>
          <Dropdown.Item
            onClick={(e) =>
              arrivalDepartureDetails(e, travelType, "type", "Surface")
            }
          >
            Surface
          </Dropdown.Item>
        </Dropdown.Menu>
      </Dropdown>
    );
  };

  // dropdown for title
  const TitleDropdown = (props) => {
    const { paxDetails, roomIndex, paxDetailsIndex, paxType, fieldName } =
      props;
    const [selectedTitle, setSelectedTitle] = useState(null);
    const [showDropdown, setShowDropdown] = useState(false);

    const handleTitleSelect = (title) => {
      setSelectedTitle(title);
      setShowDropdown(false);
    };

    const toggleDropdown = () => {
      setShowDropdown(!showDropdown);
    };

    return (
      <Dropdown show={showDropdown} onToggle={toggleDropdown}>
        <Dropdown.Toggle
          variant="secondary"
          id="dropdown-basic"
          className={style["dropdown-icon"]}
        >
          {fieldName == "guardianTitle"
            ? paxDetails.guardianDetails.title
            : paxDetails.title}
        </Dropdown.Toggle>
        <Dropdown.Menu>
          <Dropdown.Item
            onClick={(e) =>
              handlePaxDetailsChanged(
                e,
                roomIndex,
                paxDetailsIndex,
                paxType,
                fieldName,
                "Mr"
              )
            }
          >
            Mr
          </Dropdown.Item>
          <Dropdown.Item
            onClick={(e) =>
              handlePaxDetailsChanged(
                e,
                roomIndex,
                paxDetailsIndex,
                paxType,
                fieldName,
                "Ms"
              )
            }
          >
            Ms
          </Dropdown.Item>
          {paxType !== 2 && (
            <Dropdown.Item
              onClick={(e) =>
                handlePaxDetailsChanged(
                  e,
                  roomIndex,
                  paxDetailsIndex,
                  paxType,
                  fieldName,
                  "Mrs"
                )
              }
            >
              Mrs
            </Dropdown.Item>
          )}
        </Dropdown.Menu>
      </Dropdown>
    );
  };

  // timepicker
  const TimePickerDiv = (props) => {
    const { travelType } = props;

    return (
      <div className="time-picker-container">
        <TimePicker
          className={style["form-control"]}
          value={
            travelType === "arrival"
              ? blockResponse &&
                blockResponse?.data?.BlockRoomResult?.arrivalTransport &&
                blockResponse?.data?.BlockRoomResult?.arrivalTransport?.time
              : travelType === "departure"
              ? blockResponse &&
                blockResponse?.data?.BlockRoomResult?.departureTransport &&
                blockResponse?.data?.BlockRoomResult?.departureTransport?.time
              : null
          }
          onChange={(time) =>
            arrivalDepartureDetails("", travelType, "time", time)
          }
          step={15}
        />
      </div>
    );
  };

  const [guestCards, setGuestCards] = useState([]);
  const [updateFlag, setUpdateFlag] = useState(false);
  const [errors, setErrors] = useState([]);
  const [packageFareError, setPackageFareError] = useState({});
  const [selectedHotel, setSelectedHotel] = useState([]);
  const [selectedRooms, setSelectedRooms] = useState([]);
  const [blockResponse, setBlockResponse] = useState([]);
  const [roomCountString, setRoomCountString] = useState([]);
  const [hotelPolicyDetails, setHotelPolicyDetails] = useState("");
  const [loading, setLoading] = useState(false);
  const [hotelName, setHotelName] = useState("");
  const [hotelAddress, setHotelAddress] = useState("");
  const [hotelImage, setHotelImage] = useState("");
  const [showContent, setShowContent] = useState(false);
  const [showHotelPolicyContent, setShowHotelPolicyContent] = useState(false);
  const [pansReq, setPansReq] = useState();
  const [apiData, setApiData] = useState(null);
  const [confirmation, setConfirmation] = useState(false);
  const [isProceeded, setProceeded] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [totalAmount, setTotalAmount] = useState(0);
  const [currencyCode, setCurrencyCode] = useState("");
  const [getPhoneNumber, setPhoneNumber] = useLocalStorage("phoneNumber");
  const [qTraceId, setQTraceId] = useState("");
  const [cartID, setCartID] = useState("");
  const [rooms, setRooms] = useState("");
  const [adults, setAdults] = useState("");
  const [children, setChildren] = useState("");
  const [checkinDate, setCheckinDate] = useState("");
  const [checkoutDate, setCheckoutDate] = useState("");
  const [getCityId, setCityId] = useState("");
  const [getCountryCode, setCountryCode] = useState("");
  const [totalCostRoom, setTotalCostRoom] = useState("");
  const [reserveRoom, setReserveRoom] = useState("");
  const [isPackageFare, setIsPackageFare] = useState("");
  const [isPackageDetailsMandatory, setIsPackageFareDetailsMandatory] =
    useState();
  const [buttonClicked, setButtonClicked] = useState(false);
  const [getUserID, setUserID] = useLocalStorage("userID");
  const [uiLoading, setUiLoading] = useState(false);
  const [getBookingId, setBookingId] = useLocalStorage("bookingId");
  const [getReserveBooking, setReserveBooking] =
    useLocalStorage("reserveBooking");
  const [isCorporateBooking, setIsCorporateBooking] = useState();
  const [companyName, setCompanyName] = useState();
  const [companyNameError, setCompanyNameError] = useState();
  const [companyMobileError, setCompanyMobileError] = useState();
  const [companyMobile, setCompanyMobile] = useState();
  const [companyGstError, setCompanyGstError] = useState();
  const [companyGst, setCompanyGst] = useState();
  const [companyEmailError, setCompanyEmailError] = useState();
  const [companyEmail, setCompanyEmail] = useState();
  const [companyAddressError, setCompanyAddressError] = useState();
  const [companyAddress, setCompanyAddress] = useState();
  const [companyPincode, setCompanyPincode] = useState();
  const [walletSelected, setWalletSelected] = useState(false);

  useEffect(() => {
    const handlePopState = (event) => {
      router.push("/hotellist?activeTab=hotels");
    };
    window.onpopstate = handlePopState;
    return () => {
      window.onpopstate = null;
    };
  }, [router]);

  useEffect(() => {
    calculateTotalPayable();
    console.log("here in useeffect");
  }, [walletSelected]);

  const checkwallet = async (e) => {
    setWalletSelected(!walletSelected);
    if (walletSelected) {
      // calculateTotalPayable();
    }
  };
  const goToWalletDetails = () => {
    router.push({
      pathname: "/walletDetails",
      query: {
        fromPage:
          typeof window !== "undefined"
            ? window.location.pathname
            : "/walletDetails",
      },
    });
  };

  useEffect(() => {
    const fetchCartFromLocalStorage = async () => {
      try {
        const compressedCartData = getTabSpecificData("qugoCartData");

        if (!compressedCartData) {
          console.error("No cart data found in localStorage.");
          return router.replace("/");
        }

        const numbersArray = compressedCartData.split(",").map(Number);
        const compressedUint8Array = new Uint8Array(numbersArray);

        // Decompress the cart data
        const decompressedData = pako.inflate(compressedUint8Array, {
          to: "string",
        });
        const data = JSON.parse(decompressedData);

        setQTraceId(data.traceId);
        setCartID(data.cartId);
        setRooms(data.cartHotelDetails.noOfRooms);
        setAdults(data.cartHotelDetails.noOfAdults);
        setChildren(data.cartHotelDetails.noOfChilds);
        setCheckinDate(data.cartHotelDetails.checkInDate);
        setCheckoutDate(data.cartHotelDetails.checkOutDate);
        setCityId(data.cartHotelDetails.cityId);
        setCountryCode(data.cartHotelDetails.countryCode);
        setTotalCostRoom(Math.round(data.cartHotelDetails.totalBookingAmount));
        setReserveRoom(data.cartHotelDetails.isVoucherBooking);
        setIsPackageFare(data.cartHotelDetails.isPackageFare);
        setApiData(data);
        setLoading(true);
        setUiLoading(false);
      } catch (error) {
        console.error("Error fetching cart data from localStorage:", error);
        setLoading(false);
      }
    };

    fetchCartFromLocalStorage();
  }, []);

  let formattedCheckinDate;
  let checkInDayOfWeek;
  let checkinDay;
  let checkinMonth;
  let checkinYear;
  // const [checkinDay, checkinMonth, checkinYear] =
  //   queryData?.checkinDate.split("-");
  checkinDay = checkinDate.split("-")[0];
  checkinMonth = checkinDate.split("-")[1];
  checkinYear = checkinDate.split("-")[2];

  formattedCheckinDate = `${getDayWithSuffix(parseInt(checkinDay))} ${new Date(
    checkinYear,
    checkinMonth - 1,
    checkinDay
  ).toLocaleString("default", { month: "long" })}`;

  checkInDayOfWeek =
    daysOfWeek[new Date(checkinYear, checkinMonth - 1, checkinDay).getDay()];

  // Changing checkin date format to show in UI
  let formattedCheckoutDate;
  let checkOutDayOfWeek;
  let checkoutDay;
  let checkoutMonth;
  let checkoutYear;
  // const [checkoutDay, checkoutMonth, checkoutYear] = checkoutDate.split("-");
  checkoutDay = checkoutDate.split("-")[0];
  checkoutMonth = checkoutDate.split("-")[1];
  checkoutYear = checkoutDate.split("-")[2];

  formattedCheckoutDate = `${getDayWithSuffix(
    parseInt(checkoutDay)
  )} ${new Date(checkoutYear, checkoutMonth - 1, checkoutDay).toLocaleString(
    "default",
    { month: "long" }
  )}`;

  checkOutDayOfWeek =
    daysOfWeek[new Date(checkoutYear, checkoutMonth - 1, checkoutDay).getDay()];
  let noOfNight;
  noOfNight = calculateNoOfNights(checkinDate, checkoutDate);

  const toggleContent = () => {
    setShowContent(!showContent);
  };

  const hotelPolicyToggleContent = () => {
    setShowHotelPolicyContent(!showHotelPolicyContent);
  };

  const handleAddGuest = () => {
    setGuestCards([
      ...guestCards,
      { id: Date.now(), firstName: "", lastName: "" },
    ]);
  };

  function calculateTotalPayable() {
    // const totalFare=calculateTotalPrice(priceDetails);
    // setAmountPayable(totalFare);

    if (walletSelected && walletBalance) {
      // const payable= walletBalance-totalFare;
      if (walletBalance > totalCostRoom) {
        // setAmountPayable(0);
        return 0;
      } else {
        // setAmountPayable(totalFare-walletBalance);
        return totalCostRoom - walletBalance;
      }
      // setAmountPayable(payable);
    }
    return totalCostRoom;
  }

  const [scrollPosition, setScrollPosition] = useState(0);

  const handleDeleteGuest = (id) => {
    const updatedCards = guestCards.filter((card) => card.id !== id);
    setGuestCards(updatedCards);
  };

  const handleGuestChange = (id, firstName, lastName) => {
    const updatedCards = guestCards.map((card) => {
      if (card.id === id) {
        return { ...card, firstName, lastName };
      }
      return card;
    });
    setGuestCards(updatedCards);
  };

  const getGuestNames = () => {
    const guestNames = guestCards.map((guest) => {
      return `${guest.firstName} ${guest.lastName}`;
    });
    return guestNames;
  };

  const renderGuestCards = () => {
    return guestCards.map((card, index) => (
      <GuestCard
        key={card.id} // Use the unique identifier as the key
        id={card.id}
        firstName={card.firstName}
        lastName={card.lastName}
        onDelete={() => handleDeleteGuest(card.id)}
        onChange={(firstName, lastName) =>
          handleGuestChange(card.id, firstName, lastName)
        }
        updateFlag={updateFlag}
      />
    ));
  };

  function concatenateRoomDescriptions(room) {
    let concatenatedDescriptions = "";

    concatenatedDescriptions += room.roomTypeName;

    // Remove the trailing " | " from the last room description
    // concatenatedDescriptions = concatenatedDescriptions.slice(0, -3);

    return concatenatedDescriptions;
  }

  function concatenateAmenities(room) {
    // let concatenatedAmenities = "";
    const uniqueAmenitiesSet = new Set();

    // concatenatedAmenities += room.amenities.join(", ") + " | ";
    room.amenities.forEach((amenity) => uniqueAmenitiesSet.add(amenity));

    // Remove the trailing " | " from the last room description
    const concatenatedAmenities = Array.from(uniqueAmenitiesSet).join(", ");

    return concatenatedAmenities;
  }

  function setRoomPrice(roomList) {
    let totalRoomPrice = 0;
    let currencyCode = ""; // Variable to store the currency code

    for (const room of roomList) {
      const { Price } = room;
      const { qOfferedPriceWithoutTax, CurrencyCode: roomCurrencyCode } = Price; // Destructure the currency code

      currencyCode = roomCurrencyCode; // Store the currency code for each room
      // const offeredPriceRoundedOff = Math.round(offeredPrice);
      const roomPrice = qOfferedPriceWithoutTax.toFixed(2);

      totalRoomPrice += roomPrice * 1;
    }

    return `${totalRoomPrice} ${currencyCode}`;
  }

  function addTaxableAmount(roomList) {
    let totalTaxableAmount = 0;
    let currencyCode = ""; // Variable to store the currency code

    for (const room of roomList) {
      const { Price } = room;
      const { qCommissionTax, CurrencyCode: roomCurrencyCode } = Price; // Destructure the GST and currency code

      currencyCode = roomCurrencyCode; // Store the currency code for each room
      totalTaxableAmount += qCommissionTax; // Access the taxableAmount inside GST object
    }
    const roundedTotal = totalTaxableAmount.toFixed(2); // Round off to two decimal places

    return `${roundedTotal} ${currencyCode}`;
  }

  const convertToDateObject = (ddMMyyyy) => {
    if (ddMMyyyy) {
      const parts =
        ddMMyyyy != null
          ? ddMMyyyy.split("-")
          : formatDateToDDMMYYYY(new Date()).split("-");
      const day = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10) - 1; // Months are zero-based in Date object
      const year = parseInt(parts[2], 10);

      return new Date(year, month, day);
    }
  };

  const formatDateToDDMMYYYY = (date) => {
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0"); // Months are zero-based
    const year = date.getFullYear();

    return `${day}-${month}-${year}`;
  };

  function setTotalPrice(roomList) {
    let totalPrice = 0;
    let currencyCode = ""; // Variable to store the currency code

    for (const room of roomList) {
      const { Price } = room;
      const { qOfferedPriceRoundedOff, CurrencyCode: roomCurrencyCode } = Price; // Destructure the currency code

      currencyCode = roomCurrencyCode; // Store the currency code for each room
      // const offeredPriceRoundedOff = Math.round(offeredPrice);
      totalPrice += qOfferedPriceRoundedOff * 1;
    }

    return `${totalPrice} ${currencyCode}`;
  }

  useEffect(() => {
    let totalPrice = 0;
    let newCurrencyCode = "";

    if (
      blockResponse?.data?.BlockRoomResult?.HotelRoomsDetails &&
      Array.isArray(blockResponse.data.BlockRoomResult.HotelRoomsDetails)
    ) {
      for (const room of blockResponse?.data?.BlockRoomResult
        ?.HotelRoomsDetails) {
        const { Price } = room;
        const { qOfferedPriceRoundedOff, CurrencyCode: roomCurrencyCode } =
          Price;

        newCurrencyCode = roomCurrencyCode;
        totalPrice += qOfferedPriceRoundedOff * 1;
      }
    } else {
      console.error("HotelRoomsDetails is undefined or not iterable");
    }

    setTotalAmount(totalPrice);
    setCurrencyCode(newCurrencyCode);
  }, [blockResponse?.data?.BlockRoomResult?.HotelRoomsDetails]);

  // Function to be executed when the page is opened
  useEffect(() => {
    const fetchData = () => {
      try {
        let selectedHotel = getTabSpecificData("selectedHotel");
        const parsedSelectedHotel = JSON.parse(selectedHotel);
        if (!selectedHotel) {
          return router.replace("/");
        }
        setSelectedHotel(parsedSelectedHotel);
        setHotelName(parsedSelectedHotel.hotelName);
        setHotelAddress(parsedSelectedHotel.hotelAddress);
        setHotelImage(parsedSelectedHotel.hotelStaticImageUrl);
        if (!parsedSelectedHotel.hotelStaticImageUrl) {
          setHotelImage(parsedSelectedHotel.hotelImages);
        }
        let selectedRoom = getTabSpecificData("selectedRooms");
        const parsedSelectedRooms = JSON.parse(selectedRoom);

        setSelectedRooms(parsedSelectedRooms);
        let blockResponse = getTabSpecificData("blockRoomResponse");

        const parsedBlockResponse = JSON.parse(blockResponse);
        setIsPackageFareDetailsMandatory(
          parsedBlockResponse.data.BlockRoomResult.IsPackageDetailsMandatory
        );
        setBlockResponse(parsedBlockResponse);
        let roomCountStringData = getTabSpecificData("roomCountString");

        const parsedRoomCountString = JSON.parse(roomCountStringData);
        setRoomCountString(parsedRoomCountString);
        const hotelPolicy =
          parsedBlockResponse?.data?.BlockRoomResult?.HotelPolicyDetail;
        setHotelPolicyDetails(hotelPolicy);
        setShowContent(true);
        setShowHotelPolicyContent(true);
        setPansReq(
          parsedBlockResponse.data.BlockRoomResult.ValidationInfo
            .ValidationAtConfirm.NoOfPANRequired
        );
        setIsOpen(
          parsedBlockResponse.data.BlockRoomResult.IsPriceChanged ||
            parsedBlockResponse.data.BlockRoomResult.IsHotelPolicyChanged ||
            parsedBlockResponse.data.BlockRoomResult.IsCancellationPolicyChanged
        );

        const newErrors = parsedSelectedRooms.map((room, index) => {
          console.log("in useeffect");
          const roomErrors = {
            adultsData: [],
            childrenData: [],
          };

          roomErrors.adultsData = room.adultsData.map((adults, personIndex) => {
            const errorsForAdult = {};
            errorsForAdult.guardianDetails = {};
            return errorsForAdult;
          });

          if (room.childData != null) {
            roomErrors.childrenData = room.childData.map(
              (child, personIndex) => {
                const errorsForchild = {};
                errorsForchild.guardianDetails = {};
                return errorsForchild;
              }
            );
          }

          return roomErrors;
        });
        setErrors(newErrors);
      } catch (error) {
        console.log(error);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    // Check if the user is corporate and set the values accordingly
    if (corporateUser) {
      const searchRequest = JSON.parse(getTabSpecificData("searchRequest"));
      const corporateEmployees = searchRequest.corporateEmployees || [];

      // Set values into the form of selectedRoom adults automatically
      setSelectedRooms((prevSelectedRooms) =>
        prevSelectedRooms.map((room, roomIndex) => ({
          ...room,
          adultsData: room.adultsData.map((adult, adultIndex) => ({
            ...adult,
            title: corporateEmployees[adultIndex]?.data?.title || adult.title,
            firstName:
              corporateEmployees[adultIndex]?.data?.firstName ||
              adult.firstName,
            lastName:
              corporateEmployees[adultIndex]?.data?.lastName || adult.lastName,
            email:
              corporateEmployees[adultIndex]?.data?.workEmail || adult.email,
            mobileNumber:
              corporateEmployees[adultIndex]?.data?.mobile ||
              adult.mobileNumber,
          })),
        }))
      );
    }
  }, [corporateUser]);

  const [leadTravellerFirstName, setLeadTravellerFirstName] = useState([[]]);
  const [leadTravellerFirstNameError, setLeadTravellerFirstNameError] =
    useState([[]]);

  const [leadTravellerLastName, setLeadTravellerLastName] = useState("");
  const [leadTravellerLastNameError, setLeadTravellerLastNameError] =
    useState("");

  const [leadTravellerMobileNo, setLeadTravellerMobileNo] = useState("");
  const [leadTravellerMobileNoError, setLeadTravellerMobileNoError] =
    useState("");

  const [leadTravellerEmail, setLeadTravellerEmail] = useState("");
  const [leadTravellerEmailError, setLeadTravellerEmailError] = useState("");

  const handleCompanyDetailsChanged = (event, titleValue) => {
    const value = event?.target?.value;
    let error = "";
    switch (titleValue) {
      case "GST":
        setCompanyGst(value);
        error = validateField(value, titleValue);
        if (error != null && error != "") {
          setCompanyName("");
          setCompanyAddress("");
          setCompanyGstError(error);
        } else {
          verifyGst(value);
        }
        break;
      case "mobileNumber":
        setCompanyMobile(value);
        error = validateField(value, titleValue);
        setCompanyMobileError(error);
        break;
      case "email":
        setCompanyEmail(value);
        error = validateField(value, titleValue);
        setCompanyEmailError(error);
        break;
      default:
        break;
    }
  };

  const handlePaxDetailsChanged = (
    event,
    roomIndex,
    paxDetailsIndex,
    paxType,
    fieldName,
    titleValue
  ) => {
    const value = event?.target?.value;

    const updatedSelectedRooms = [...selectedRooms];
    // handleContinuetoPayClick();

    if (paxType === 1) {
      console.log("errors object: ", JSON.stringify(errors));
      // Update details for an adult
      switch (fieldName) {
        case "firstName":
          updatedSelectedRooms[roomIndex].adultsData[
            paxDetailsIndex
          ].firstName = value;
          errors[roomIndex].adultsData[paxDetailsIndex].firstName =
            validateField(value, "firstName");
          break;
        case "middleName":
          updatedSelectedRooms[roomIndex].adultsData[
            paxDetailsIndex
          ].middleName = value;
          break;
        case "lastName":
          updatedSelectedRooms[roomIndex].adultsData[paxDetailsIndex].lastName =
            value;
          errors[roomIndex].adultsData[paxDetailsIndex].lastName =
            validateField(value, "lastName");
          break;
        case "title":
          updatedSelectedRooms[roomIndex].adultsData[paxDetailsIndex].title =
            titleValue;
          break;
        case "email":
          updatedSelectedRooms[roomIndex].adultsData[paxDetailsIndex].email =
            value;
          errors[roomIndex].adultsData[paxDetailsIndex].email =
            paxDetailsIndex == 0 || value != ""
              ? validateField(value, "email")
              : "";
          break;
        case "mobileNumber":
          updatedSelectedRooms[roomIndex].adultsData[
            paxDetailsIndex
          ].mobileNumber = value;
          errors[roomIndex].adultsData[paxDetailsIndex].mobileNumber =
            paxDetailsIndex == 0 || value != ""
              ? validateField(value, "mobileNumber")
              : "";
          break;
        case "PAN":
          if (
            value !==
            updatedSelectedRooms[roomIndex].adultsData[paxDetailsIndex].PAN
          ) {
            updatedSelectedRooms[roomIndex].adultsData[
              paxDetailsIndex
            ].isPANValid = false;
          }
          updatedSelectedRooms[roomIndex].adultsData[paxDetailsIndex].PAN =
            value;
          errors[roomIndex].adultsData[paxDetailsIndex].PAN =
            paxDetailsIndex == 0 || value != ""
              ? validateField(value, "PAN")
              : "";
          errors[roomIndex]["adultsData"][paxDetailsIndex]["panValidated"] = "";
          break;
        case "passportNumber":
          updatedSelectedRooms[roomIndex].adultsData[
            paxDetailsIndex
          ].passportNumber = value;
          errors[roomIndex].adultsData[paxDetailsIndex].passportNumber =
            validateField(value, "passportNumber");
          break;
        case "passportIssueDate":
          const issueDate = formatDateToDDMMYYYY(new Date(event));
          updatedSelectedRooms[roomIndex].adultsData[
            paxDetailsIndex
          ].passportIssueDate = issueDate;
          errors[roomIndex].adultsData[paxDetailsIndex].passportIssueDate =
            validateField(event, "passportIssueDate");
          break;
        case "passportExpDate":
          const expDate = formatDateToDDMMYYYY(new Date(event));
          updatedSelectedRooms[roomIndex].adultsData[
            paxDetailsIndex
          ].passportExpDate = expDate;
          errors[roomIndex].adultsData[paxDetailsIndex].passportExpDate =
            validateField(event, "passportExpDate");
          break;
        case "guardianTitle":
          updatedSelectedRooms[roomIndex].adultsData[
            paxDetailsIndex
          ].guardianDetails.title = titleValue;
          break;
        case "guardianFirstName":
          updatedSelectedRooms[roomIndex].adultsData[
            paxDetailsIndex
          ].guardianDetails.firstName = value;
          errors[roomIndex].adultsData[
            paxDetailsIndex
          ].guardianDetails.firstName = validateField(value, "firstName");
          break;
        case "guardianMiddleName":
          updatedSelectedRooms[roomIndex].adultsData[
            paxDetailsIndex
          ].guardianDetails.middleName = value;
          errors[roomIndex].adultsData[
            paxDetailsIndex
          ].guardianDetails.middleName = validateField(value, "middleName");
          break;
        case "guardianLastName":
          updatedSelectedRooms[roomIndex].adultsData[
            paxDetailsIndex
          ].guardianDetails.lastName = value;
          errors[roomIndex].adultsData[
            paxDetailsIndex
          ].guardianDetails.lastName = validateField(value, "lastName");
          break;
        case "guardianPANNumber":
          if (
            value !==
            updatedSelectedRooms[roomIndex].adultsData[paxDetailsIndex]
              .guardianDetails.PAN
          ) {
            updatedSelectedRooms[roomIndex].adultsData[
              paxDetailsIndex
            ].guardianDetails.isPANValid = false;
          }
          updatedSelectedRooms[roomIndex].adultsData[
            paxDetailsIndex
          ].guardianDetails.PAN = value;
          errors[roomIndex].adultsData[paxDetailsIndex].guardianDetails.PAN =
            validateField(value, "PAN");
          errors[roomIndex]["adultsData"][paxDetailsIndex]["guardianDetails"][
            "panValidated"
          ] = "";
          break;
        default:
          break;
      }
      if (paxDetailsIndex === 0) {
        updatedSelectedRooms[roomIndex].adultsData[
          paxDetailsIndex
        ].leadPassanger = true;
      } else {
        updatedSelectedRooms[roomIndex].adultsData[
          paxDetailsIndex
        ].leadPassanger = false;
      }
    } else if (paxType === 2) {
      switch (fieldName) {
        case "firstName":
          updatedSelectedRooms[roomIndex].childData[paxDetailsIndex].firstName =
            value;
          errors[roomIndex].childrenData[paxDetailsIndex].firstName =
            validateField(value, "firstName");
          break;
        case "middleName":
          updatedSelectedRooms[roomIndex].childData[
            paxDetailsIndex
          ].middleName = value;
          break;
        case "lastName":
          updatedSelectedRooms[roomIndex].childData[paxDetailsIndex].lastName =
            value;
          errors[roomIndex].childrenData[paxDetailsIndex].lastName =
            validateField(value, "lastName");
          break;
        case "title":
          updatedSelectedRooms[roomIndex].childData[paxDetailsIndex].title =
            titleValue;
          break;
        case "email":
          updatedSelectedRooms[roomIndex].childData[paxDetailsIndex].email =
            value;
          errors[roomIndex].childrenData[paxDetailsIndex].email =
            value != "" ? validateField(value, "email") : "";
          break;
        case "age":
          updatedSelectedRooms[roomIndex].childData[paxDetailsIndex].age =
            value;
          break;
        case "mobileNumber":
          updatedSelectedRooms[roomIndex].childData[
            paxDetailsIndex
          ].mobileNumber = value;
          errors[roomIndex].childrenData[paxDetailsIndex].mobileNumber =
            value != "" ? validateField(value, "mobileNumber") : "";
          break;
        case "PAN":
          if (
            value !==
            updatedSelectedRooms[roomIndex].childData[paxDetailsIndex].PAN
          ) {
            updatedSelectedRooms[roomIndex].childData[
              paxDetailsIndex
            ].isPANValid = false;
          }
          updatedSelectedRooms[roomIndex].childData[paxDetailsIndex].PAN =
            value;
          errors[roomIndex].childrenData[paxDetailsIndex].PAN =
            value != "" ? validateField(value, "PAN") : "";
          errors[roomIndex]["childrenData"][paxDetailsIndex]["panValidated"] =
            "";
          break;
        case "passportNumber":
          updatedSelectedRooms[roomIndex].childData[
            paxDetailsIndex
          ].passportNumber = value;
          errors[roomIndex].childrenData[paxDetailsIndex].passportNumber =
            validateField(value, "passportNumber");
          break;
        case "passportIssueDate":
          const issueDate = formatDateToDDMMYYYY(new Date(event));
          updatedSelectedRooms[roomIndex].childData[
            paxDetailsIndex
          ].passportIssueDate = issueDate;
          errors[roomIndex].childrenData[paxDetailsIndex].passportIssueDate =
            validateField(event, "passportIssueDate");
          break;
        case "passportExpDate":
          const expDate = formatDateToDDMMYYYY(new Date(event));
          updatedSelectedRooms[roomIndex].childData[
            paxDetailsIndex
          ].passportExpDate = expDate;
          errors[roomIndex].childrenData[paxDetailsIndex].passportExpDate =
            validateField(event, "passportExpDate");
          break;
        case "guardianTitle":
          updatedSelectedRooms[roomIndex].childData[
            paxDetailsIndex
          ].guardianDetails.title = value;
          break;
        case "guardianFirstName":
          updatedSelectedRooms[roomIndex].childData[
            paxDetailsIndex
          ].guardianDetails.firstName = value;
          errors[roomIndex].childrenData[
            paxDetailsIndex
          ].guardianDetails.firstName = validateField(value, "firstName");
          break;
        case "guardianMiddleName":
          updatedSelectedRooms[roomIndex].childData[
            paxDetailsIndex
          ].guardianDetails.middleName = value;
          break;
        case "guardianLastName":
          updatedSelectedRooms[roomIndex].childData[
            paxDetailsIndex
          ].guardianDetails.lastName = value;
          errors[roomIndex].childrenData[
            paxDetailsIndex
          ].guardianDetails.lastName = validateField(value, "lastName");
          break;
        case "guardianPANNumber":
          if (
            value !==
            updatedSelectedRooms[roomIndex].childData[paxDetailsIndex]
              .guardianDetails.PAN
          ) {
            updatedSelectedRooms[roomIndex].childData[
              paxDetailsIndex
            ].guardianDetails.isPANValid = false;
          }
          updatedSelectedRooms[roomIndex].childData[
            paxDetailsIndex
          ].guardianDetails.PAN = value;
          errors[roomIndex].childrenData[paxDetailsIndex].guardianDetails.PAN =
            validateField(value, "PAN");
          errors[roomIndex]["childrenData"][paxDetailsIndex]["guardianDetails"][
            "panValidated"
          ] = "";
          break;
        default:
          break;
      }
    }

    setSelectedRooms(updatedSelectedRooms);
    setTabSpecificData("selectedRooms", JSON.stringify(selectedRooms));
  };

  const verifyGst = async (gstNumber) => {
    const response = await validateGst(gstNumber);

    if (response.status === "SUCCESS") {
      setCompanyAddress(response.data.companyAddress);
      setCompanyName(response.data.companyName);
      setCompanyPincode(response.data.companyPincode);
    }
  };

  const handlePANValidation = async (
    event,
    roomIndex,
    paxDetailsIndex,
    paxType,
    paxValue
  ) => {
    const updatedSelectedRooms = [...selectedRooms];
    const updatedErrors = [...errors];
    if (paxType === "1") {
      if (paxValue === "adultPANValidation") {
        const name =
          updatedSelectedRooms[roomIndex]?.adultsData[paxDetailsIndex]
            ?.firstName +
          " " +
          updatedSelectedRooms[roomIndex]?.adultsData[paxDetailsIndex]
            ?.middleName +
          " " +
          updatedSelectedRooms[roomIndex]?.adultsData[paxDetailsIndex]
            ?.lastName;
        const pan =
          updatedSelectedRooms[roomIndex]?.adultsData[paxDetailsIndex]?.PAN ??
          "";
        const response = await panVerification(name, pan);
        if (response) {
          if (response?.data?.Valid) {
            updatedSelectedRooms[roomIndex].adultsData[
              paxDetailsIndex
            ].isPANValid = true;
            if (
              updatedErrors[roomIndex] &&
              updatedErrors[roomIndex].adultsData &&
              updatedErrors[roomIndex].adultsData[paxDetailsIndex] &&
              updatedErrors[roomIndex].adultsData[paxDetailsIndex][
                "panValidated"
              ]
            ) {
              updatedErrors[roomIndex].adultsData[paxDetailsIndex][
                "panValidated"
              ] = "";
            }
          } else {
            if (!updatedErrors[roomIndex]) {
              updatedErrors[roomIndex] = {};
            }
            if (!updatedErrors[roomIndex]["adultsData"]) {
              updatedErrors[roomIndex]["adultsData"] = [];
            }
            if (!updatedErrors[roomIndex]["adultsData"][paxDetailsIndex]) {
              updatedErrors[roomIndex]["adultsData"][paxDetailsIndex] = {};
            }
            updatedErrors[roomIndex]["adultsData"][paxDetailsIndex][
              "panValidated"
            ] = "Invalid PAN";
          }
        }
      } else if (paxValue === "GuardianPANValidation") {
        const name =
          updatedSelectedRooms[roomIndex].adultsData[paxDetailsIndex]
            .guardianDetails.firstName +
          " " +
          updatedSelectedRooms[roomIndex].adultsData[paxDetailsIndex]
            .guardianDetails.lastName;
        const pan =
          updatedSelectedRooms[roomIndex]?.adultsData[paxDetailsIndex]
            ?.guardianDetails?.PAN ?? "";
        const response = await panVerification(name, pan);
        if (response) {
          if (response.data.Valid) {
            updatedSelectedRooms[roomIndex].adultsData[
              paxDetailsIndex
            ].guardianDetails.isPANValid = true;
            if (
              updatedErrors[roomIndex] &&
              updatedErrors[roomIndex].adultsData &&
              updatedErrors[roomIndex].adultsData[paxDetailsIndex] &&
              updatedErrors[roomIndex].adultsData[paxDetailsIndex]
                .guardianDetails &&
              updatedErrors[roomIndex].adultsData[paxDetailsIndex]
                .guardianDetails["panValidated"]
            ) {
              updatedErrors[roomIndex].adultsData[
                paxDetailsIndex
              ].guardianDetails["panValidated"] = "";
            }
          } else {
            if (!updatedErrors[roomIndex]) {
              updatedErrors[roomIndex] = {};
            }
            if (!updatedErrors[roomIndex]["adultsData"]) {
              updatedErrors[roomIndex]["adultsData"] = [];
            }
            if (!updatedErrors[roomIndex]["adultsData"][paxDetailsIndex]) {
              updatedErrors[roomIndex]["adultsData"][paxDetailsIndex] = {};
            }
            if (
              !updatedErrors[roomIndex]["adultsData"][paxDetailsIndex][
                "guardianDetails"
              ]
            ) {
              updatedErrors[roomIndex]["adultsData"][paxDetailsIndex][
                "guardianDetails"
              ] = {};
            }
            updatedErrors[roomIndex]["adultsData"][paxDetailsIndex][
              "guardianDetails"
            ]["panValidated"] = "Invalid PAN";
          }
        }
      }
    } else if (paxType === "2") {
      if (paxValue === "ChildPANValidation") {
        const name =
          updatedSelectedRooms[roomIndex].childrenData[paxDetailsIndex]
            .firstName +
          " " +
          updatedSelectedRooms[roomIndex].childrenData[paxDetailsIndex]
            .lastName;
        const pan =
          updatedSelectedRooms[roomIndex]?.childrenData[paxDetailsIndex]?.PAN ??
          "";
        const response = await panVerification(name, pan);
        if (response) {
          if (response.data.Valid) {
            updatedSelectedRooms[roomIndex].childrenData[
              paxDetailsIndex
            ].isPANValid = true;
            if (
              updatedErrors[roomIndex] &&
              updatedErrors[roomIndex].childrenData &&
              updatedErrors[roomIndex].childrenData[paxDetailsIndex] &&
              updatedErrors[roomIndex].childrenData[paxDetailsIndex][
                "panValidated"
              ]
            ) {
              updatedErrors[roomIndex].childrenData[paxDetailsIndex][
                "panValidated"
              ] = "";
            }
          } else {
            if (!updatedErrors[roomIndex]) {
              updatedErrors[roomIndex] = {};
            }

            if (!updatedErrors[roomIndex]["childrenData"]) {
              updatedErrors[roomIndex]["childrenData"] = [];
            }

            if (!updatedErrors[roomIndex]["childrenData"][paxDetailsIndex]) {
              updatedErrors[roomIndex]["childrenData"][paxDetailsIndex] = {};
            }
            updatedErrors[roomIndex]["childrenData"][paxDetailsIndex][
              "panValidated"
            ] = "Invalid PAN";
          }
        }
      } else if (paxValue === "GuardianPANValidation") {
        const name =
          updatedSelectedRooms[roomIndex].childrenData[paxDetailsIndex]
            .guardianDetails.firstName +
          " " +
          updatedSelectedRooms[roomIndex].childrenData[paxDetailsIndex]
            .guardianDetails.lastName;
        const pan =
          updatedSelectedRooms[roomIndex]?.childrenData[paxDetailsIndex]
            ?.guardianDetails?.PAN ?? "";
        const response = await panVerification(name, pan);
        if (response) {
          if (response.data.Valid) {
            updatedSelectedRooms[roomIndex].childrenData[
              paxDetailsIndex
            ].guardianDetails.isPANValid = true;
            if (
              updatedErrors[roomIndex] &&
              updatedErrors[roomIndex].childrenData &&
              updatedErrors[roomIndex].childrenData[paxDetailsIndex] &&
              updatedErrors[roomIndex].childrenData[paxDetailsIndex]
                .guardianDetails &&
              updatedErrors[roomIndex].childrenData[paxDetailsIndex]
                .guardianDetails["panValidated"]
            ) {
              updatedErrors[roomIndex].childrenData[
                paxDetailsIndex
              ].guardianDetails["panValidated"] = "";
            }
          } else {
            if (!updatedErrors[roomIndex]) {
              updatedErrors[roomIndex] = {};
            }

            if (!updatedErrors[roomIndex]["childrenData"]) {
              updatedErrors[roomIndex]["childrenData"] = [];
            }

            if (!updatedErrors[roomIndex]["childrenData"][paxDetailsIndex]) {
              updatedErrors[roomIndex]["childrenData"][paxDetailsIndex] = {};
            }
            if (
              !updatedErrors[roomIndex]["childrenData"][paxDetailsIndex][
                "guardianDetails"
              ]
            ) {
              updatedErrors[roomIndex]["childrenData"][paxDetailsIndex][
                "guardianDetails"
              ] = {};
            }
            updatedErrors[roomIndex]["childrenData"][paxDetailsIndex][
              "guardianDetails"
            ]["panValidated"] = "Invalid PAN";
          }
        }
      }
    }
    setSelectedRooms(updatedSelectedRooms);
    setErrors(updatedErrors);
  };

  const handleConfirmationChanged = (event) => {
    const value = event.target.checked;
    setConfirmation(value);
  };
  const handleProceedChanged = (event) => {
    const value = event.target.checked;
    setProceeded(value);
  };

  const DDMMYYTOYYMMDD = (inputDate) => {
    // Split the input date using "-"

    const parts = inputDate.split("-");

    // Reorder the parts to yyyy-mm-dd format
    const convertedDate = `${parts[2]}-${parts[1]}-${parts[0]}`;

    return convertedDate;
  };

  const validateField = (value, fieldName) => {
    if (
      fieldName === "firstName" &&
      (!isValidName(value.trim()) ||
        value.trim() === "" ||
        value.trim().length < 3)
    ) {
      return "First Name is required.";
    }
    if (
      fieldName === "lastName" &&
      (!isValidName(value.trim()) ||
        value.trim() === "" ||
        value.trim().length < 2)
    ) {
      return "Last Name is required.";
    }
    if (fieldName === "email" && !isValidEmail(value)) {
      return "Please enter a valid email address.";
    }
    if (fieldName === "mobileNumber" && !isValidPhoneNumber(value)) {
      return "Please enter a valid phone number.";
    }
    if (fieldName === "PAN" && !isValidPAN(value)) {
      return "Please enter a valid PAN number.";
    }
    if (
      fieldName === "passportNumber" &&
      (!isValidPassportNumber(value) || value == null)
    ) {
      return "Please enter a valid passport number.";
    }
    if (fieldName === "passportIssueDate" && value == null) {
      return "Please enter a passport issue date.";
    }
    if (fieldName === "passportExpDate" && value == null) {
      return "Please enter a passport expiry date.";
    }
    if (fieldName === "GST" && !isValidGst(value)) {
      return "Please enter a valid Gst Number.";
    }
    return "";
  };

  const isValidName = (name) => {
    const trimmedName = name.replace(/\s+$/, "");
    return /^[A-Za-z\s]+$/.test(trimmedName);
  };
  const isValidGst = (number) => {
    const gstRegex = /^\d{2}[A-Z]{5}\d{4}[A-Z]{1}[1-9A-Z]{1}[Z]{1}[A-Z\d]{1}$/;
    return gstRegex.test(number);
  };

  const isValidEmail = (email) => {
    // Add your email validation logic here
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const isValidPhoneNumber = (phoneNumber) => {
    // Add your phone number validation logic here
    return /^[5-9]\d{9}$/.test(phoneNumber);
  };

  const isValidPAN = (pan) => {
    // Add your PAN validation logic here
    return /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(pan);
  };

  const isValidPassportNumber = (passportNumber) => {
    return /^[A-Za-z0-9]{3,30}$/.test(passportNumber);
  };

  const handleContinuetoPayClick = async () => {
    if (!accessToken) {
      openPopup();
      return;
    }
    setButtonClicked(true);
    logEvent(analytics, "continue_to_pay_clicked", {
      isCorporateBooking: isCorporateBooking,
    });

    const userId = getTabSpecificData("userID");
    const reponse = await getUserStatus(userId);

    if (reponse.data.status === "inactive") {
      console.log("logout check");
      await handleLogout();
      return;
    }
    if (blockResponse?.data?.BlockRoomResult?.IsPackageFare) {
      let isPackageFareError = {};
      let arrivalTransportError = {
        transportInfoIdError: null,
        dateError: null,
      };
      let depatureTransportError = {
        transportInfoIdError: null,
        dateError: null,
      };

      if (
        !blockResponse?.data?.BlockRoomResult?.arrivalTransport?.transportInfoId
      ) {
        arrivalTransportError.transportInfoIdError =
          "Please enter the transport id.";
      }
      if (!blockResponse?.data?.BlockRoomResult?.arrivalTransport?.date) {
        arrivalTransportError.dateError = "Please select arrival date.";
      }
      if (
        !blockResponse?.data?.BlockRoomResult?.departureTransport
          ?.transportInfoId
      ) {
        depatureTransportError.transportInfoIdError =
          "Please enter the transport id.";
      }
      if (!blockResponse?.data?.BlockRoomResult?.departureTransport?.date) {
        depatureTransportError.dateError = "Please select departure date.";
      }

      isPackageFareError.arrivalTransportError = arrivalTransportError;
      isPackageFareError.depatureTransportError = depatureTransportError;
      console.log("is packagefare errors =>", isPackageFareError);
      setPackageFareError(isPackageFareError);
      console.log("is Packagefare error =>", packageFareError);
    }

    let paxPanList = [];
    let paxPassportList = [];
    let panToAssign = "";
    let hasCompanyDetails = false;
    const updatedSelectedRooms = [...selectedRooms];
    if (isCorporateBooking) {
      setCompanyGstError(validateField(companyGst, "GST"));
      setCompanyMobileError(validateField(companyMobile, "mobileNumber"));
      setCompanyEmailError(validateField(companyEmail, "email"));
      if (
        companyEmailError === "" &&
        companyGstError === "" &&
        companyMobileError === ""
      ) {
        hasCompanyDetails = true;
      }
    }
    const newErrors = selectedRooms.map((room, index) => {
      const roomErrors = {
        adultsData: [],
        childrenData: [],
      };

      roomErrors.adultsData = room.adultsData.map((adults, personIndex) => {
        const errorsForAdult = {};

        errorsForAdult.firstName = validateField(adults.firstName, "firstName");
        errorsForAdult.lastName = validateField(adults.lastName, "lastName");
        console.log("errors for lastname: ", errorsForAdult.lastName);
        if (personIndex == 0) {
          errorsForAdult.email = validateField(adults.email, "email");
          errorsForAdult.mobileNumber = validateField(
            adults.mobileNumber,
            "mobileNumber"
          );
        } else if (adults.email !== null && adults.email.trim() !== "") {
          errorsForAdult.email = validateField(adults.email, "email");
        } else if (adults.mobileNumber !== null && adults.mobileNumber !== "") {
          errorsForAdult.mobileNumber = validateField(
            adults.mobileNumber,
            "mobileNumber"
          );
        }

        if (
          blockResponse?.data?.BlockRoomResult?.HotelRoomsDetails[index]
            ?.PaxPanValidation?.Adults[personIndex]?.panmandatory == true
        ) {
          errorsForAdult.PAN = validateField(adults.PAN, "PAN");
          paxPanList = [...paxPanList, adults.PAN];
          if (panToAssign !== "") {
            panToAssign = adults.PAN;
          }
          // }
        } else {
          if (
            blockResponse?.data?.BlockRoomResult?.HotelRoomsDetails[index]
              ?.PaxPanValidation?.Adults[personIndex]?.isleadPanAllowed
          ) {
            if (
              blockResponse.data.BlockRoomResult.HotelRoomsDetails[index]
                .PaxPanValidation.SamePanForAllRooms == true
            ) {
              if (
                updatedSelectedRooms[index].adultsData[0].PAN !== null &&
                updatedSelectedRooms[index].adultsData[0].PAN !== ""
              ) {
                updatedSelectedRooms[index].adultsData[personIndex].PAN =
                  updatedSelectedRooms[index].adultsData[0].PAN;
              } else {
                updatedSelectedRooms[index].adultsData[personIndex].PAN =
                  updatedSelectedRooms[0].adultsData[0].PAN;
              }
            } else {
              if (
                updatedSelectedRooms[index].adultsData[0].PAN !== null &&
                updatedSelectedRooms[index].adultsData[0].PAN !== ""
              ) {
                updatedSelectedRooms[index].adultsData[personIndex].PAN =
                  panToAssign;
              } else {
                updatedSelectedRooms[index].adultsData[personIndex].PAN =
                  updatedSelectedRooms[index].adultsData[0].PAN;
              }
            }
          }
        }
        if (
          blockResponse?.data?.BlockRoomResult?.HotelRoomsDetails[index]
            ?.IsPassportMandatory
        ) {
          errorsForAdult.passportNumber = validateField(
            adults.passportNumber,
            "passportNumber"
          );
          errorsForAdult.passportIssueDate = validateField(
            adults.passportIssueDate,
            "passportIssueDate"
          );
          errorsForAdult.passportExpDate = validateField(
            adults.passportExpDate,
            "passportExpDate"
          );
          paxPassportList = [...paxPassportList, adults.passportNumber];
        }

        return errorsForAdult;
      });

      if (room.childData != null) {
        roomErrors.childrenData = room.childData.map((child, personIndex) => {
          const errorsForchild = {};

          if (
            !child.firstName ||
            !child.lastName ||
            !child.email ||
            !child.mobileNumber ||
            !child.PAN ||
            !child.passportNumber
          ) {
            errorsForchild.firstName = validateField(
              child.firstName,
              "firstName"
            );
            errorsForchild.lastName = validateField(child.lastName, "lastName");
            if (
              blockResponse?.data?.BlockRoomResult?.HotelRoomsDetails[index]
                ?.PaxPanValidation?.Children[personIndex]?.panmandatory == true
            ) {
              // if (pansReq > selectedRooms.length) {
              errorsForchild.PAN = validateField(child.PAN, "PAN");
              if (!child.isPANAvailable) {
                paxPanList = [...paxPanList, child.PAN];
              }
              // }
            } else {
              if (
                blockResponse?.data?.BlockRoomResult?.HotelRoomsDetails[index]
                  ?.PaxPanValidation?.Children[personIndex]?.isleadPanAllowed
              ) {
                if (
                  blockResponse.data.BlockRoomResult.HotelRoomsDetails[index]
                    .PaxPanValidation.SamePanForAllRooms == true
                ) {
                  if (
                    updatedSelectedRooms[index].adultsData[0].PAN !== null &&
                    updatedSelectedRooms[index].adultsData[0].PAN !== ""
                  ) {
                    updatedSelectedRooms[index].childData[personIndex].PAN =
                      updatedSelectedRooms[index].adultsData[0].PAN;
                  } else {
                    updatedSelectedRooms[index].childData[personIndex].PAN =
                      updatedSelectedRooms[0].adultsData[0].PAN;
                  }
                } else {
                  if (
                    updatedSelectedRooms[index].adultsData[0].PAN !== null &&
                    updatedSelectedRooms[index].adultsData[0].PAN !== ""
                  ) {
                    updatedSelectedRooms[index].childData[personIndex].PAN =
                      panToAssign;
                  } else {
                    updatedSelectedRooms[index].childData[personIndex].PAN =
                      updatedSelectedRooms[index].adultsData[0].PAN;
                  }
                }
              }
            }
            if (
              blockResponse?.data?.BlockRoomResult?.HotelRoomsDetails[index]
                ?.IsPassportMandatory
            ) {
              errorsForchild.passportNumber = validateField(
                child.passportNumber,
                "passportNumber"
              );
              errorsForchild.passportIssueDate = validateField(
                child.passportIssueDate,
                "passportIssueDate"
              );
              errorsForchild.passportExpDate = validateField(
                child.passportExpDate,
                "passportExpDate"
              );
              paxPassportList = [...paxPassportList, child.passportNumber];
            }
          }

          // //console.log("errormsg: ",errors[index].childrenData[childIndex].guardianDetails['lastName']);
          return errorsForchild;
        });
      }

      return roomErrors;
    });
    setErrors(newErrors);
    let hasErrors = false;
    let uniquePan = true;
    let uniquePassport = true;
    if (paxPanList.length > 0) {
      uniquePan = validateUniqueField(paxPanList);
    }

    if (paxPassportList.length > 0) {
      uniquePassport = validateUniqueField(paxPassportList);
    }

    if (!hasCompanyDetails && isCorporateBooking) {
      hasErrors = true;
      toast("Please fill company details");
    }

    if (uniquePan) {
      console.log("check errors: ", JSON.stringify(newErrors));
      newErrors.map((error, index) => {
        error.adultsData.forEach((adult) => {
          if (Object.values(adult).some((value) => value !== "")) {
            hasErrors = true;
          }
        });

        error.childrenData.forEach((child) => {
          if (Object.values(child).some((value) => value !== "")) {
            hasErrors = true;
          }
        });
      });
    } else {
      hasErrors = true;
      toast("same pan is not allowed");
    }

    if (!uniquePassport) {
      hasErrors = true;
      toast("same passport is not allowed");
    }

    console.log("haserrors: ", hasErrors);

    console.log("check errors: ", JSON.stringify(newErrors));

    if (!hasErrors) {
      await handleBlockRoomCall();
    } else {
      setTimeout(() => {
        setButtonClicked(false);
      }, 500); // Adjust the delay as needed
      return;
    }
  };

  const handleBlockRoomCall = async () => {
    const blockRoomResponse = await blcokRoomApiCall(blockResponse);

    if (blockRoomResponse?.status === "SUCCESS") {
      if (blockRoomResponse?.data?.BlockRoomResult?.IsPriceChanged) {
        setIsOpen(blockRoomResponse?.data?.BlockRoomResult?.IsPriceChanged);
        setButtonClicked(false);
      } else {
        await handleContinueClick();
      }
    } else {
      if (blockRoomResponse?.response?.data?.error?.ErrorCode === "1003") {
        toast(
          // blockRoomResponse?.error?.ErrorMsg ||
          //   "Something went wrong, please try again later"
          "Oops! your session is expired. Please search hotels again.",
          {
            autoClose: 2000, // Duration of the toast message (2 seconds)
          }
        );

        setTimeout(() => {
          router.push({
            pathname: "/",
          });
        }, 2000);
        setButtonClicked(false);
      }
    }
  };

  const validateUniqueField = (list) => {
    const set = new Set();

    for (const item of list) {
      if (item != null) {
        if (set.has(item)) {
          return false; // Duplicate found
        }
        set.add(item);
      }
    }
    return true;
  };

  const handleContinueClick = async () => {
    try {
      setLoading(true);
      const formattedCheckinDate = DDMMYYTOYYMMDD(checkinDate);
      const formattedCheckoutDate = DDMMYYTOYYMMDD(checkoutDate);

      let companyDetails = {
        CompanyName: companyName,
        CompanyEmail: companyEmail,
        CompanyMobile: companyMobile,
        CompanyGst: companyGst,
        CompanyAddress: companyAddress,
        CompanyPincode: companyPincode,
      };
      let totalPayable = calculateTotalPayable();
      let walletAmount = walletSelected
        ? walletBalance <= totalCostRoom
          ? walletBalance
          : totalCostRoom - totalPayable
        : 0;
      let companyId = null;
      if (corporateUser) {
        companyId = userDetails?.companyId;
      }
      let bookResponse = await bookRoom(
        qTraceId,
        rooms,
        cartID,
        formattedCheckinDate,
        formattedCheckoutDate,
        getCityId,
        getCountryCode,
        totalCostRoom,
        selectedHotel,
        selectedRooms,
        reserveRoom,
        isPackageFare,
        blockResponse,
        isCorporateBooking,
        companyDetails,
        walletAmount,
        totalPayable,
        companyId
      );
      setButtonClicked(false);
      // console.log("book response", bookResponse.response.data.error.ErrorCode);
      try {
        if (bookResponse?.response?.data?.error?.ErrorCode == 1055) {
          toast("Duplicate booking's are not allowed for same user.");
        } else if (
          bookResponse != null &&
          bookResponse?.data?.data?.bookingId
        ) {
          setTabSpecificData("bookingId", bookResponse?.data?.data?.bookingId);
          setTabSpecificData("reserveBooking", reserveRoom.toString());
          const queryParams = {
            rooms: rooms,
            bookingId: bookResponse.data.data.bookingId,
            reservebooking: reserveRoom,
            adults: adults,
            checkinDate: checkinDate,
            checkoutDate: checkoutDate,
            // Add any additional fields you want here
          };

          if (reserveRoom === "true") {
            console.log("here1");

            await Router.push({
              pathname: "/confirmationbooking",
              // query: queryParams,
            });
          } else if (reserveRoom === "false") {
            if (totalPayable > 0) {
              setTabSpecificData(
                "selectedRooms",
                JSON.stringify(selectedRooms)
              );
              //console.log("bookingid is", bookResponse.data.data.bookingId);
              const data = await getPaymentGateway();

              if (data.status === "SUCCESS") {
                const phoneNumber = getTabSpecificData("phoneNumber");
                let getPaymeneSessionIDResp = await getPaymentSessionID(
                  null,
                  Math.max(0,totalCostRoom - totalPayable),
                  0,
                  "BOOKING",
                  bookResponse.data.data.bookingId,
                  totalPayable,
                  phoneNumber,
                  data.data.pgCode
                );

                const reservebooking = false;

                if (
                  getPaymeneSessionIDResp !== null &&
                  getPaymeneSessionIDResp.data.data.paymentSessionId !== ""
                ) {
                  routeToPg(
                    data.data.pgCode,
                    getPaymeneSessionIDResp.data.data.paymentSessionId,
                    queryParams,
                    bookResponse.data.data.bookingId,
                    1,
                    "BOOKING"
                  );
                  // //console.log("Get guest names ",getGuestNames());
                }
              }
            } else {
              console.log("");
              await router.push({
                pathname: "/confirmationbooking",
                // query: queryParams,
              });
            }
          }
        } else {
          toast(bookResponse?.response?.data?.error?.ErrorMsg);
        }
      } catch (error) {
        //console.log("Error while calling book service", error);
      }
      if (leadTravellerFirstName === "") {
        setLeadTravellerFirstNameError("First name cannot be empty");
        return;
      }
      if (leadTravellerLastName === "") {
        setLeadTravellerLastNameError("Last name cannot be empty");
        return;
      }
      if (leadTravellerEmail === "") {
        setLeadTravellerEmailError("Lead Traveller email cannot be empty");
        return;
      }
      if (leadTravellerMobileNo.length < 10) {
        setLeadTravellerMobileNoError("Please enter 10 digit mobile number");
        return;
      }
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      const isValidEmail = emailRegex.test(leadTravellerEmail);
      if (!isValidEmail) {
        setLeadTravellerEmailError("Please enter a valid email address");
        return;
      } else {
        //console.log("Data validated");
      }
    } catch (error) {
      console.log("Error occured while booking", error);
    } finally {
      setLoading(false);
    }
  };
  const handleCorporateBooking = async () => {
    setIsCorporateBooking(!isCorporateBooking);
  };
  const handlePANCheckboxChange = async (
    event,
    roomIndex,
    paxDetailsIndex,
    paxType
  ) => {
    const value = event.target.checked;

    const updatedSelectedRooms = [...selectedRooms];
    if (paxType === "1") {
      updatedSelectedRooms[roomIndex].adultsData[
        paxDetailsIndex
      ].isPANAvailable = value;
      if (value === true) {
        updatedSelectedRooms[roomIndex].adultsData[
          paxDetailsIndex
        ].guardianDetails.title =
          updatedSelectedRooms[roomIndex].adultsData[0].title;

        updatedSelectedRooms[roomIndex].adultsData[
          paxDetailsIndex
        ].guardianDetails.firstName =
          updatedSelectedRooms[roomIndex].adultsData[0].firstName;

        updatedSelectedRooms[roomIndex].adultsData[
          paxDetailsIndex
        ].guardianDetails.lastName =
          updatedSelectedRooms[roomIndex].adultsData[0].lastName;

        updatedSelectedRooms[roomIndex].adultsData[
          paxDetailsIndex
        ].guardianDetails.PAN =
          updatedSelectedRooms[roomIndex].adultsData[0].PAN;
      }
    }
    if (paxType === "2") {
      updatedSelectedRooms[roomIndex].childData[
        paxDetailsIndex
      ].isPANAvailable = value;

      if (value === true) {
        updatedSelectedRooms[roomIndex].childData[
          paxDetailsIndex
        ].guardianDetails.title =
          updatedSelectedRooms[roomIndex].adultsData[0].title;

        updatedSelectedRooms[roomIndex].childData[
          paxDetailsIndex
        ].guardianDetails.firstName =
          updatedSelectedRooms[roomIndex].adultsData[0].firstName;

        updatedSelectedRooms[roomIndex].childData[
          paxDetailsIndex
        ].guardianDetails.lastName =
          updatedSelectedRooms[roomIndex].adultsData[0].lastName;

        updatedSelectedRooms[roomIndex].childData[
          paxDetailsIndex
        ].guardianDetails.PAN =
          updatedSelectedRooms[roomIndex].adultsData[0].PAN;
      }
    }

    setSelectedRooms(updatedSelectedRooms);
  };

  const closePopup = () => {
    setIsOpen(false);
  };

  function convertDateFormat(inputDate) {
    // Split the input date string into an array containing year, month, and day
    const [day, month, year] = inputDate.split("-");
    // Rearrange the parts to form the new date string in dd-mm-yyyy format
    const outputDate = `${day}/${month}/${year}`;
    return outputDate;
  }

  const goToHome = () => {
    router.push("/");
  };

  const blcokRoomApiCall = async (blockResponse) => {
    const blockResp = await blockRequestForBlcokResponse(
      qTraceId,
      cartID,
      selectedHotel,
      blockResponse.data.BlockRoomResult.HotelRoomsDetails,
      rooms,
      convertDateFormat(checkinDate),
      getCityId,
      reserveRoom, // Reserve is false as we are booking directly
      selectedRooms,
      roomCountString,
      blockResponse
    );
    if (blockResp.status === "SUCCESS") {
      setBlockResponse(blockResp);
      setTabSpecificData("blockRoomResponse", JSON.stringify(blockResp));
    }
    return blockResp;
  };

  const arrivalDepartureDetails = async (
    event,
    travelType,
    fieldName,
    selectedValue
  ) => {
    const value = event?.target?.value;

    const updatedBlockResponse = { ...blockResponse };
    if (travelType === "arrival") {
      if (!updatedBlockResponse.data.BlockRoomResult.arrivalTransport) {
        updatedBlockResponse.data.BlockRoomResult.arrivalTransport = {};
      }
      switch (fieldName) {
        case "type":
          updatedBlockResponse.data.BlockRoomResult.arrivalTransport.arrivalTransportType =
            selectedValue;
          break;
        case "infoId":
          updatedBlockResponse.data.BlockRoomResult.arrivalTransport.transportInfoId =
            value;
          break;
        case "time":
          updatedBlockResponse.data.BlockRoomResult.arrivalTransport.time =
            selectedValue;
          break;
        case "date":
          const date = formatDateToDDMMYYYY(event);
          updatedBlockResponse.data.BlockRoomResult.arrivalTransport.date =
            date;
          break;
        default:
          break;
      }
    } else if (travelType === "departure") {
      if (!updatedBlockResponse.data.BlockRoomResult.departureTransport) {
        updatedBlockResponse.data.BlockRoomResult.departureTransport = {};
      }
      switch (fieldName) {
        case "type":
          updatedBlockResponse.data.BlockRoomResult.departureTransport.departureTransportType =
            selectedValue;
          break;
        case "infoId":
          updatedBlockResponse.data.BlockRoomResult.departureTransport.transportInfoId =
            value;
          break;
        case "time":
          updatedBlockResponse.data.BlockRoomResult.departureTransport.time =
            selectedValue;
          break;
        case "date":
          const date = formatDateToDDMMYYYY(event);
          updatedBlockResponse.data.BlockRoomResult.departureTransport.date =
            date;
          break;
        default:
          break;
      }
    }
    setBlockResponse(updatedBlockResponse);
    setShowContent(true);
    setPansReq(
      updatedBlockResponse.data.BlockRoomResult.ValidationInfo
        .ValidationAtConfirm.NoOfPANRequired
    );
    setTabSpecificData("blockRoomResponse", JSON.stringify(blockResponse));
  };

  return (
    <>
      <GoToTopButton />
      <Chaticon />
      {!uiLoading ? (
        <>
          <ToastContainer></ToastContainer>
          <TabTitle title={"Booking process"}></TabTitle>
          <Popup
            open={isOpen}
            style={{ zIndex: 100000 }}
            overlayStyle={{ background: "transparent" }}
            contentStyle={{
              width: "80%",
              height:
                blockResponse &&
                blockResponse?.data?.BlockRoomResult?.IsPriceChanged
                  ? "300px"
                  : "250px",
              backgroundColor: "white",
              boxShadow: "1px 0.5px 1px 1px gray",
              maxWidth: "400px", // maximum width for larger screens
              // maxHeight: "80vh",
            }}
            onClose={closePopup}
            modal
            closeOnDocumentClick={false}

            // lockScroll // Disable scrolling when popup is open
          >
            <div>
              <PriceChangedPopup
                blockResponse={blockResponse}
                selectedRooms={selectedRooms}
                bookRoomApiCall={blcokRoomApiCall}
                closePopup={closePopup}
                {...props}
              />
            </div>
          </Popup>
          <div
            className={`${style.blurContainer} ${
              isOpen ? style.blurBackground : ""
            }`}
          >
            {/* <HotelSearchShort /> */}
            {!corporateUser ? (
              // <CommonHeader />
              <B2CHeader/>
            ) : (
              <div style={{ backgroundColor: "#ffffff" }}>
                <Header />
              </div>
            )}
            <div className={style["booking-page"]}>
              <div className={style["booking-head"]}>
                <h1>Booking Process</h1>
              </div>
              <div className={style["container"]}>
                <div className={style["left-container"]}>
                  <div className={style["guest-details"]}>
                    <div className={style["details-head"]}>
                      <h2 className={style.guestdetailhead}>Guest details</h2>
                      <h5 className={style.guestroomsdetails}>
                        {noOfNight} {noOfNight > 1 ? "Nights" : "Night"} |{" "}
                        {rooms === "1" ? "1 Room" : `${rooms} Rooms`} |{" "}
                        {parseInt(adults) + parseInt(children)}{" "}
                        {parseInt(adults) + parseInt(children) === 1
                          ? "Guest"
                          : "Guests"}
                      </h5>
                    </div>
                    <div className={style["travel-details"]}>
                      {isPackageFare === "true" &&
                        isPackageDetailsMandatory && (
                          <>
                            <div className={style["heading"]}>
                              Travel details
                            </div>
                            <div className={style["input-container"]}>
                              <div className={style["input-section"]}>
                                <div className={style["input-heading"]}>
                                  Arrival Type
                                </div>
                                <div className={style["input-wrapper"]}>
                                  <OptionDropdown travelType={"arrival"} />
                                </div>
                              </div>
                              <div className={style["input-section"]}>
                                <div className={style["input-heading"]}>
                                  Transport ID{" "}
                                  <span className={style["required"]}>*</span>
                                </div>
                                <div className={style["input-wrapper"]}>
                                  <input
                                    type="text"
                                    placeholder="Transport ID"
                                    value={
                                      blockResponse?.data?.BlockRoomResult
                                        ?.arrivalTransport?.transportInfoId
                                    }
                                    onChange={(e) =>
                                      arrivalDepartureDetails(
                                        e,
                                        "arrival",
                                        "infoId"
                                      )
                                    }
                                  />
                                </div>
                                {packageFareError &&
                                  packageFareError.arrivalTransportError &&
                                  packageFareError.arrivalTransportError
                                    .transportInfoIdError && (
                                    <p className="text-danger">
                                      {
                                        packageFareError.arrivalTransportError
                                          .transportInfoIdError
                                      }
                                    </p>
                                  )}
                              </div>
                              <div className={style["input-section"]}>
                                <div className={style["input-heading"]}>
                                  Time
                                </div>
                                <div className={style["input-wrapper"]}>
                                  <TimePickerDiv travelType={"arrival"} />
                                </div>
                              </div>
                              <div className={style["input-section"]}>
                                <div className={style["input-heading"]}>
                                  Date{" "}
                                  <span className={style["required"]}>*</span>
                                </div>
                                <DatePicker
                                  selected={
                                    blockResponse?.data?.BlockRoomResult
                                      ?.arrivalTransport?.date != null
                                      ? convertToDateObject(
                                          blockResponse?.data?.BlockRoomResult
                                            ?.arrivalTransport?.date
                                        )
                                      : new Date()
                                  }
                                  dateFormat="yyyy-MM-dd"
                                  showPopperArrow={false}
                                  showMonthDropdown
                                  showYearDropdown
                                  dropdownMode="select"
                                  maxDate={convertToDateObject(
                                    checkinDate
                                  )?.setDate(
                                    convertToDateObject(checkinDate)?.getDate()
                                  )}
                                  onChange={(e) =>
                                    arrivalDepartureDetails(
                                      e,
                                      "arrival",
                                      "date"
                                    )
                                  }
                                  customInput={
                                    <div className={style["input-wrapper"]}>
                                      <input
                                        type="text"
                                        readOnly
                                        value={
                                          blockResponse?.data?.BlockRoomResult
                                            ?.arrivalTransport?.date
                                        }
                                        placeholder="DD/MM/YY"
                                        onChange={(e) => e.preventDefault()}
                                      />
                                      <div
                                        className={style["icon"]}
                                        id="calendarIcon"
                                      >
                                        <i
                                          className={
                                            style["far fa-calendar-alt"]
                                          }
                                        ></i>
                                      </div>
                                    </div>
                                  }
                                />
                                {packageFareError &&
                                  packageFareError.arrivalTransportError &&
                                  packageFareError.arrivalTransportError
                                    .dateError && (
                                    <p className="text-danger">
                                      {
                                        packageFareError.arrivalTransportError
                                          .dateError
                                      }
                                    </p>
                                  )}
                              </div>
                            </div>

                            <div className={style["input-container"]}>
                              <div className={style["input-section"]}>
                                <div className={style["input-heading"]}>
                                  Departure Type
                                </div>
                                <div className={style["input-wrapper"]}>
                                  <OptionDropdown travelType={"departure"} />
                                </div>
                              </div>
                              <div className={style["input-section"]}>
                                <div className={style["input-heading"]}>
                                  Transport ID{" "}
                                  <span className={style["required"]}>*</span>
                                </div>
                                <div className={style["input-wrapper"]}>
                                  <input
                                    type="text"
                                    placeholder="Transport ID"
                                    value={
                                      blockResponse?.data?.BlockRoomResult
                                        ?.departureTransport?.transportInfoId
                                    }
                                    onChange={(e) =>
                                      arrivalDepartureDetails(
                                        e,
                                        "departure",
                                        "infoId"
                                      )
                                    }
                                  />
                                </div>
                                {packageFareError &&
                                  packageFareError.depatureTransportError &&
                                  packageFareError.depatureTransportError
                                    .transportInfoIdError && (
                                    <p className="text-danger">
                                      {
                                        packageFareError.depatureTransportError
                                          .transportInfoIdError
                                      }
                                    </p>
                                  )}
                              </div>
                              <div className={style["input-section"]}>
                                <div className={style["input-heading"]}>
                                  Time
                                </div>
                                <div className={style["input-wrapper"]}>
                                  <TimePickerDiv travelType={"departure"} />
                                </div>
                              </div>
                              <div className={style["input-section"]}>
                                <div className={style["input-heading"]}>
                                  Date{" "}
                                  <span className={style["required"]}>*</span>
                                </div>
                                <DatePicker
                                  selected={
                                    blockResponse?.data?.BlockRoomResult
                                      ?.departureTransport?.date != null
                                      ? convertToDateObject(
                                          blockResponse?.data?.BlockRoomResult
                                            ?.departureTransport?.date
                                        )
                                      : convertToDateObject(
                                          checkinDate
                                        )?.setDate(
                                          convertToDateObject(
                                            checkinDate
                                          )?.getDate()
                                        )
                                  }
                                  dateFormat="yyyy-MM-dd"
                                  showPopperArrow={false}
                                  showMonthDropdown
                                  showYearDropdown
                                  dropdownMode="select"
                                  minDate={convertToDateObject(
                                    checkinDate
                                  )?.setDate(
                                    convertToDateObject(checkinDate)?.getDate()
                                  )}
                                  onChange={(e) =>
                                    arrivalDepartureDetails(
                                      e,
                                      "departure",
                                      "date"
                                    )
                                  }
                                  customInput={
                                    <div className={style["input-wrapper"]}>
                                      <input
                                        type="text"
                                        readOnly
                                        value={
                                          blockResponse?.data?.BlockRoomResult
                                            ?.departureTransport?.date
                                        }
                                        placeholder="DD/MM/YY"
                                        onChange={(e) => e.preventDefault()}
                                      />
                                    </div>
                                  }
                                />
                                {packageFareError &&
                                  packageFareError.depatureTransportError &&
                                  packageFareError.depatureTransportError
                                    .dateError && (
                                    <p className="text-danger">
                                      {
                                        packageFareError.depatureTransportError
                                          .dateError
                                      }
                                    </p>
                                  )}
                              </div>
                            </div>
                          </>
                        )}

                      <div>
                        {!corporateUser && (
                          <div className={style["corporate-checkbox"]}>
                            <label htmlFor="below12">
                              <input
                                type="checkbox"
                                id="below12"
                                value={isCorporateBooking}
                                className={style["check-box"]}
                                onChange={handleCorporateBooking}
                              />
                              Corporate Booking
                            </label>
                          </div>
                        )}
                        <br />
                        {isCorporateBooking ? (
                          <div>
                            <div className={style["form-row"]}>
                              <div className={style["form-input"]}>
                                <div className={style["input-heading"]}>
                                  GST Number{" "}
                                  <span className={style["required"]}>*</span>
                                </div>
                                <div className={style["input-wrapper"]}>
                                  <input
                                    type="text"
                                    placeholder="GST Number"
                                    onInput={(e) => {
                                      e.target.value = e.target.value.replace(
                                        /[^a-zA-Z\d]+/g,
                                        ""
                                      ); // Replace non-numeric characters with empty string
                                      e.target.value =
                                        e.target.value.toUpperCase();
                                    }}
                                    maxLength={15}
                                    value={companyGst}
                                    onChange={(e) =>
                                      handleCompanyDetailsChanged(e, "GST")
                                    }
                                  />
                                </div>
                                <p className={style.textDanger}>
                                  {companyGstError}
                                </p>
                              </div>

                              <div className={style["form-input"]}>
                                <div className={style["input-heading"]}>
                                  Company Name{" "}
                                  <span className={style["required"]}>*</span>
                                </div>
                                <div className={style["input-wrapper"]}>
                                  <input
                                    type="text"
                                    placeholder="Company Name"
                                    value={companyName}
                                    onInput={(e) => {
                                      e.target.value = e.target.value.replace(
                                        /[^a-zA-Z\s]/g,
                                        ""
                                      ); // Replace non-numeric characters with empty string
                                    }}
                                    onChange={(e) =>
                                      handleCompanyDetailsChanged(e, "Name")
                                    }
                                  />
                                </div>
                                <p className="text-danger">
                                  {companyNameError}
                                </p>
                              </div>
                              <div className={style["form-input"]}>
                                <div className={style["input-heading"]}>
                                  Company Address{" "}
                                  <span className={style["required"]}>*</span>
                                </div>
                                <div className={style["input-wrapper"]}>
                                  <input
                                    type="text"
                                    placeholder="Company Address"
                                    onInput={(e) => {
                                      e.target.value = e.target.value.replace(
                                        /[^a-zA-Z\s]/g,
                                        ""
                                      ); // Replace non-numeric characters with empty string
                                    }}
                                    value={companyAddress}
                                    onChange={(e) =>
                                      handleCompanyDetailsChanged(e, "Address")
                                    }
                                  />
                                </div>
                                <p className={style.textDanger}>
                                  {companyAddressError}
                                </p>
                              </div>
                            </div>

                            <div className={style["form-row2"]}>
                              <div className={style["form-input2"]}>
                                <div className={style["input-heading"]}>
                                  Company Mobile Number{" "}
                                  <span className={style["required"]}>*</span>
                                </div>
                                <div className={style["input-wrapper"]}>
                                  <input
                                    type="tel"
                                    inputMode="numeric" // Set input mode to "numeric" to show a numeric keyboard on mobile devices
                                    pattern="[0-9]*"
                                    onInput={(e) => {
                                      e.target.value = e.target.value.replace(
                                        /[^0-9]/g,
                                        ""
                                      ); // Replace non-numeric characters with empty string
                                    }}
                                    value={companyMobile}
                                    maxLength={10}
                                    placeholder="Company Mobile"
                                    onChange={(e) =>
                                      handleCompanyDetailsChanged(
                                        e,
                                        "mobileNumber"
                                      )
                                    }
                                  />
                                </div>
                                <p className={style.textDanger}>
                                  {companyMobileError}
                                </p>
                              </div>

                              <div className={style["form-input2"]}>
                                <div className={style["input-heading"]}>
                                  Company Email{" "}
                                  <span className={style["required"]}>*</span>
                                </div>
                                <div className={style["input-wrapper"]}>
                                  <input
                                    type="email"
                                    placeholder="Company Email"
                                    value={companyEmail}
                                    onChange={(e) =>
                                      handleCompanyDetailsChanged(e, "email")
                                    }
                                  />
                                </div>
                                <p className={style.textDanger}>
                                  {companyEmailError}
                                </p>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <></>
                        )}
                      </div>
                      {selectedRooms.map((room, roomIndex) => (
                        <>
                          <div className={style["rooms"]}>
                            <br />
                            <div className={style["rooms-details"]}>
                              Room {roomIndex + 1}
                            </div>
                            {room.requireAllPaxDetails ||
                            !room.requireAllPaxDetails ? (
                              <div>
                                {room.adultsData &&
                                  room.adultsData.map((adults, adultIndex) => (
                                    <div key={adultIndex}>
                                      <br />
                                      <div className={style["adult-details"]}>
                                        Adult {adultIndex + 1}
                                      </div>

                                      <div>
                                        <div className={style["form-row"]}>
                                          <div className={style["form-input"]}>
                                            <div
                                              className={style["input-heading"]}
                                            >
                                              Title{" "}
                                              <span
                                                className={style["required"]}
                                              >
                                                *
                                              </span>
                                            </div>
                                            <div
                                              className={
                                                style["input-wrapper title"]
                                              }
                                            >
                                              <TitleDropdown
                                                paxDetails={adults}
                                                roomIndex={roomIndex}
                                                paxDetailsIndex={adultIndex}
                                                paxType={1}
                                                fieldName={"title"}
                                              />
                                            </div>
                                          </div>
                                          <div className={style["form-input"]}>
                                            <div
                                              className={style["input-heading"]}
                                            >
                                              First Name{" "}
                                              <span
                                                className={style["required"]}
                                              >
                                                *
                                              </span>
                                            </div>
                                            <div
                                              className={style["input-wrapper"]}
                                            >
                                              <input
                                                type="text"
                                                placeholder="First Name"
                                                onInput={(e) => {
                                                  e.target.value =
                                                    e.target.value.replace(
                                                      /[^a-zA-Z\s]/g,
                                                      ""
                                                    ); // Replace non-numeric characters with empty string
                                                }}
                                                maxLength={25}
                                                value={adults.firstName}
                                                onChange={(e) =>
                                                  handlePaxDetailsChanged(
                                                    e,
                                                    roomIndex,
                                                    adultIndex,
                                                    1,
                                                    "firstName"
                                                  )
                                                }
                                              />
                                            </div>
                                            {errors[roomIndex] &&
                                              errors[roomIndex].adultsData[
                                                adultIndex
                                              ] &&
                                              errors[roomIndex].adultsData[
                                                adultIndex
                                              ]["firstName"] && (
                                                <p className={style.textDanger}>
                                                  {
                                                    errors[roomIndex]
                                                      .adultsData[adultIndex][
                                                      "firstName"
                                                    ]
                                                  }
                                                </p>
                                              )}
                                          </div>
                                          <div className={style["form-input"]}>
                                            <div
                                              className={style["input-heading"]}
                                            >
                                              Middle Name
                                            </div>
                                            <div
                                              className={style["input-wrapper"]}
                                            >
                                              <input
                                                type="text"
                                                placeholder="Middle Name"
                                                value={adults.middleName}
                                                onInput={(e) => {
                                                  e.target.value =
                                                    e.target.value.replace(
                                                      /[^a-zA-Z\s]/g,
                                                      ""
                                                    ); // Replace non-numeric characters with empty string
                                                }}
                                                maxLength={30}
                                                onChange={(e) =>
                                                  handlePaxDetailsChanged(
                                                    e,
                                                    roomIndex,
                                                    adultIndex,
                                                    1,
                                                    "middleName"
                                                  )
                                                }
                                              />
                                            </div>
                                          </div>
                                          <div className={style["form-input"]}>
                                            <div
                                              className={style["input-heading"]}
                                            >
                                              Last Name{" "}
                                              <span
                                                className={style["required"]}
                                              >
                                                *
                                              </span>
                                            </div>
                                            <div
                                              className={style["input-wrapper"]}
                                            >
                                              <input
                                                type="text"
                                                placeholder="Last Name"
                                                onInput={(e) => {
                                                  e.target.value =
                                                    e.target.value.replace(
                                                      /[^a-zA-Z\s]/g,
                                                      ""
                                                    ); // Replace non-numeric characters with empty string
                                                }}
                                                maxLength={30}
                                                value={adults.lastName}
                                                onChange={(e) =>
                                                  handlePaxDetailsChanged(
                                                    e,
                                                    roomIndex,
                                                    adultIndex,
                                                    1,
                                                    "lastName"
                                                  )
                                                }
                                              />
                                            </div>
                                            {errors[roomIndex] &&
                                              errors[roomIndex].adultsData[
                                                adultIndex
                                              ] &&
                                              errors[roomIndex].adultsData[
                                                adultIndex
                                              ]["lastName"] && (
                                                <p className={style.textDanger}>
                                                  {
                                                    errors[roomIndex]
                                                      .adultsData[adultIndex][
                                                      "lastName"
                                                    ]
                                                  }
                                                </p>
                                              )}
                                          </div>
                                        </div>

                                        <div className={style["form-row2"]}>
                                          {adultIndex == 0 ? (
                                            <div
                                              className={style["form-input2"]}
                                            >
                                              <div
                                                className={
                                                  style["input-heading"]
                                                }
                                              >
                                                Mobile number{" "}
                                                {adultIndex === 0 ? (
                                                  <span
                                                    className={
                                                      style["required"]
                                                    }
                                                  >
                                                    *
                                                  </span>
                                                ) : (
                                                  <></>
                                                )}
                                              </div>
                                              <div
                                                className={
                                                  style["input-wrapper"]
                                                }
                                              >
                                                <input
                                                  type="tel"
                                                  inputMode="numeric" // Set input mode to "numeric" to show a numeric keyboard on mobile devices
                                                  pattern="[0-9]*"
                                                  onInput={(e) => {
                                                    e.target.value =
                                                      e.target.value.replace(
                                                        /[^0-9]/g,
                                                        ""
                                                      ); // Replace non-numeric characters with empty string
                                                  }}
                                                  value={adults.mobileNumber}
                                                  maxLength={10}
                                                  placeholder="Mobile number"
                                                  onChange={(e) =>
                                                    handlePaxDetailsChanged(
                                                      e,
                                                      roomIndex,
                                                      adultIndex,
                                                      1,
                                                      "mobileNumber"
                                                    )
                                                  }
                                                />
                                              </div>
                                              {errors[roomIndex] &&
                                                errors[roomIndex].adultsData[
                                                  adultIndex
                                                ] &&
                                                errors[roomIndex].adultsData[
                                                  adultIndex
                                                ]["mobileNumber"] && (
                                                  <p
                                                    className={style.textDanger}
                                                  >
                                                    {
                                                      errors[roomIndex]
                                                        .adultsData[adultIndex][
                                                        "mobileNumber"
                                                      ]
                                                    }
                                                  </p>
                                                )}
                                            </div>
                                          ) : (
                                            <></>
                                          )}
                                          {adultIndex == 0 ? (
                                            <div
                                              className={style["form-input2"]}
                                            >
                                              <div
                                                className={
                                                  style["input-heading"]
                                                }
                                              >
                                                Email{" "}
                                                {adultIndex === 0 ? (
                                                  <span
                                                    className={
                                                      style["required"]
                                                    }
                                                  >
                                                    *
                                                  </span>
                                                ) : (
                                                  <></>
                                                )}
                                              </div>
                                              <div
                                                className={
                                                  style["input-wrapper"]
                                                }
                                              >
                                                <input
                                                  type="email"
                                                  placeholder="Email"
                                                  value={adults.email}
                                                  onChange={(e) =>
                                                    handlePaxDetailsChanged(
                                                      e,
                                                      roomIndex,
                                                      adultIndex,
                                                      1,
                                                      "email"
                                                    )
                                                  }
                                                />
                                              </div>
                                              {errors[roomIndex] &&
                                                errors[roomIndex].adultsData[
                                                  adultIndex
                                                ] &&
                                                errors[roomIndex].adultsData[
                                                  adultIndex
                                                ]["email"] && (
                                                  <p
                                                    className={style.textDanger}
                                                  >
                                                    {
                                                      errors[roomIndex]
                                                        .adultsData[adultIndex][
                                                        "email"
                                                      ]
                                                    }
                                                  </p>
                                                )}
                                            </div>
                                          ) : (
                                            <></>
                                          )}
                                          {blockResponse?.data?.BlockRoomResult
                                            ?.HotelRoomsDetails[roomIndex]
                                            ?.PaxPanValidation?.Adults[
                                            adultIndex
                                          ]?.panmandatory ? (
                                            <div
                                              className={style["form-input2"]}
                                            >
                                              <div
                                                className={
                                                  style["input-heading"]
                                                }
                                              >
                                                PAN Card Number{" "}
                                                <span
                                                  className={style["required"]}
                                                >
                                                  *
                                                </span>
                                              </div>
                                              <div
                                                className={
                                                  style["input-wrapper"]
                                                }
                                              >
                                                {/* {!adults.isPANAvailable ? ( */}
                                                <input
                                                  type="text"
                                                  placeholder="PAN Card Number"
                                                  value={adults.PAN}
                                                  onInput={(e) => {
                                                    e.target.value =
                                                      e.target.value.replace(
                                                        /[^a-zA-Z\d]+/g,
                                                        ""
                                                      ); // Replace non-numeric characters with empty string
                                                    e.target.value =
                                                      e.target.value.toUpperCase();
                                                  }}
                                                  maxLength={10}
                                                  onChange={(e) =>
                                                    handlePaxDetailsChanged(
                                                      e,
                                                      roomIndex,
                                                      adultIndex,
                                                      1,
                                                      "PAN"
                                                    )
                                                  }
                                                />
                                              </div>
                                              {errors[roomIndex] &&
                                                errors[roomIndex].adultsData &&
                                                errors[roomIndex].adultsData[
                                                  adultIndex
                                                ]["PAN"] && (
                                                  <p
                                                    className={style.textDanger}
                                                  >
                                                    {
                                                      errors[roomIndex]
                                                        .adultsData[adultIndex][
                                                        "PAN"
                                                      ]
                                                    }
                                                  </p>
                                                )}
                                              {errors[roomIndex] &&
                                                errors[roomIndex].adultsData &&
                                                errors[roomIndex].adultsData[
                                                  adultIndex
                                                ]["panValidated"] && (
                                                  <p
                                                    className={style.textDanger}
                                                  >
                                                    {
                                                      errors[roomIndex]
                                                        .adultsData[adultIndex][
                                                        "panValidated"
                                                      ]
                                                    }
                                                  </p>
                                                )}
                                            </div>
                                          ) : null}
                                          {blockResponse?.data?.BlockRoomResult
                                            ?.HotelRoomsDetails[roomIndex]
                                            ?.PaxPanValidation?.Adults[
                                            adultIndex
                                          ]?.panmandatory &&
                                          !adults?.isPANValid ? (
                                            <div
                                              className={style["from-valid"]}
                                              onClick={(e) =>
                                                /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(
                                                  adults.PAN
                                                ) &&
                                                handlePANValidation(
                                                  e,
                                                  roomIndex,
                                                  adultIndex,
                                                  "1",
                                                  "adultPANValidation"
                                                )
                                              }
                                            >
                                              <div
                                                className={`${
                                                  style["valid-button"]
                                                } ${
                                                  !/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(
                                                    adults.PAN
                                                  )
                                                    ? style[
                                                        "validate-button-disabled"
                                                      ]
                                                    : ""
                                                }`}
                                                disabled={
                                                  !/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(
                                                    adults.PAN
                                                  )
                                                }
                                              >
                                                Validate
                                              </div>
                                            </div>
                                          ) : blockResponse?.data
                                              ?.BlockRoomResult
                                              ?.HotelRoomsDetails[roomIndex]
                                              ?.PaxPanValidation?.Adults[
                                              adultIndex
                                            ]?.panmandatory ? (
                                            <div
                                              className={style["from-valid"]}
                                            >
                                              <div
                                                className={
                                                  style["validated-button"]
                                                }
                                              >
                                                &#10004;
                                              </div>
                                            </div>
                                          ) : (
                                            <></>
                                          )}
                                        </div>
                                      </div>

                                      {blockResponse?.data?.BlockRoomResult
                                        ?.HotelRoomsDetails[roomIndex]
                                        ?.IsPassportMandatory && (
                                        <>
                                          <hr className={style["thin-hr"]} />
                                          <div>
                                            <div
                                              className={
                                                style["heading passport-head"]
                                              }
                                            >
                                              Passport details{" "}
                                            </div>
                                            <div className={style["form-row2"]}>
                                              <div
                                                className={style["form-input2"]}
                                              >
                                                <div
                                                  className={
                                                    style["input-heading"]
                                                  }
                                                >
                                                  Passport number{" "}
                                                  <span
                                                    className={
                                                      style["required"]
                                                    }
                                                  >
                                                    *
                                                  </span>
                                                </div>
                                                <div
                                                  className={
                                                    style["input-wrapper"]
                                                  }
                                                >
                                                  <input
                                                    type="text"
                                                    placeholder="Passport number"
                                                    value={
                                                      adults.passportNumber
                                                    }
                                                    onChange={(e) =>
                                                      handlePaxDetailsChanged(
                                                        e,
                                                        roomIndex,
                                                        adultIndex,
                                                        1,
                                                        "passportNumber"
                                                      )
                                                    }
                                                  />
                                                </div>
                                                {errors[roomIndex] &&
                                                  errors[roomIndex].adultsData[
                                                    adultIndex
                                                  ] &&
                                                  errors[roomIndex].adultsData[
                                                    adultIndex
                                                  ]["passportNumber"] && (
                                                    <p
                                                      className={
                                                        style.textDanger
                                                      }
                                                    >
                                                      {
                                                        errors[roomIndex]
                                                          .adultsData[
                                                          adultIndex
                                                        ]["passportNumber"]
                                                      }
                                                    </p>
                                                  )}
                                              </div>
                                              <div
                                                className={style["form-input2"]}
                                              >
                                                <div
                                                  className={
                                                    style["input-heading"]
                                                  }
                                                >
                                                  Passport Issue Date{" "}
                                                  <span
                                                    className={
                                                      style["required"]
                                                    }
                                                  >
                                                    *
                                                  </span>
                                                </div>
                                                <DatePicker
                                                  selected={convertToDateObject(
                                                    adults?.passportIssueDate
                                                  )}
                                                  dateFormat="yyyy-MM-dd"
                                                  showPopperArrow={false}
                                                  showMonthDropdown
                                                  showYearDropdown
                                                  dropdownMode="select"
                                                  maxDate={new Date()}
                                                  onChange={(e) =>
                                                    handlePaxDetailsChanged(
                                                      e,
                                                      roomIndex,
                                                      adultIndex,
                                                      1,
                                                      "passportIssueDate"
                                                    )
                                                  }
                                                  customInput={
                                                    <div
                                                      className={
                                                        style["input-wrapper"]
                                                      }
                                                    >
                                                      <input
                                                        type="text"
                                                        readOnly
                                                        placeholder="DD/MM/YY"
                                                        value={
                                                          adults?.passportIssueDate
                                                        }
                                                        onChange={(e) =>
                                                          e.preventDefault()
                                                        }
                                                      />
                                                      <div
                                                        className={
                                                          style["icon"]
                                                        }
                                                        id="calendarIcon"
                                                      >
                                                        <i
                                                          className={
                                                            style[
                                                              "far fa-calendar-alt"
                                                            ]
                                                          }
                                                        ></i>
                                                      </div>
                                                    </div>
                                                  }
                                                />
                                                {errors[roomIndex] &&
                                                  errors[roomIndex].adultsData[
                                                    adultIndex
                                                  ] &&
                                                  errors[roomIndex].adultsData[
                                                    adultIndex
                                                  ]["passportIssueDate"] && (
                                                    <p
                                                      className={
                                                        style.textDanger
                                                      }
                                                    >
                                                      {
                                                        errors[roomIndex]
                                                          .adultsData[
                                                          adultIndex
                                                        ]["passportIssueDate"]
                                                      }
                                                    </p>
                                                  )}
                                              </div>
                                              <div
                                                className={style["form-input2"]}
                                              >
                                                <div
                                                  className={
                                                    style["input-heading"]
                                                  }
                                                >
                                                  Passport Exp Date{" "}
                                                  <span
                                                    className={
                                                      style["required"]
                                                    }
                                                  >
                                                    *
                                                  </span>
                                                </div>
                                                <DatePicker
                                                  selected={convertToDateObject(
                                                    adults?.passportExpDate !=
                                                      null
                                                      ? adults?.passportExpDate
                                                      : checkinDate
                                                  )}
                                                  dateFormat="yyyy-MM-dd"
                                                  showPopperArrow={false}
                                                  showMonthDropdown
                                                  showYearDropdown
                                                  dropdownMode="select"
                                                  minDate={convertToDateObject(
                                                    checkinDate
                                                  )?.setDate(
                                                    convertToDateObject(
                                                      checkinDate
                                                    )?.getDate() + 1
                                                  )}
                                                  onChange={(e) =>
                                                    handlePaxDetailsChanged(
                                                      e,
                                                      roomIndex,
                                                      adultIndex,
                                                      1,
                                                      "passportExpDate"
                                                    )
                                                  }
                                                  customInput={
                                                    <div
                                                      className={
                                                        style["input-wrapper"]
                                                      }
                                                    >
                                                      <input
                                                        value={
                                                          adults?.passportExpDate
                                                        }
                                                        type="text"
                                                        readOnly
                                                        placeholder="DD/MM/YY"
                                                        onChange={(e) =>
                                                          e.preventDefault()
                                                        }
                                                      />
                                                      <div
                                                        className={
                                                          style["icon"]
                                                        }
                                                        id="calendarIcon"
                                                      >
                                                        <i
                                                          className={
                                                            style[
                                                              "far fa-calendar-alt"
                                                            ]
                                                          }
                                                        ></i>
                                                      </div>
                                                    </div>
                                                  }
                                                />
                                                {errors[roomIndex] &&
                                                  errors[roomIndex].adultsData[
                                                    adultIndex
                                                  ] &&
                                                  errors[roomIndex].adultsData[
                                                    adultIndex
                                                  ]["passportExpDate"] && (
                                                    <p
                                                      className={
                                                        style.textDanger
                                                      }
                                                    >
                                                      {
                                                        errors[roomIndex]
                                                          .adultsData[
                                                          adultIndex
                                                        ]["passportExpDate"]
                                                      }
                                                    </p>
                                                  )}
                                              </div>
                                            </div>
                                          </div>
                                        </>
                                      )}
                                    </div>
                                  ))}

                                {room.childData &&
                                  room.childData.map((child, childIndex) => (
                                    <div key={childIndex}>
                                      <br />
                                      <div className={style["child-button"]}>
                                        <div>Child {childIndex + 1}</div>
                                      </div>

                                      <div className={style["form-row"]}>
                                        <div className={style["form-input"]}>
                                          <div
                                            className={style["input-heading"]}
                                          >
                                            Title{" "}
                                            <span className={style["required"]}>
                                              *
                                            </span>
                                          </div>
                                          <div
                                            className={
                                              style["input-wrapper title"]
                                            }
                                          >
                                            <TitleDropdown
                                              paxDetails={child}
                                              roomIndex={roomIndex}
                                              paxDetailsIndex={childIndex}
                                              paxType={2}
                                              fieldName={"title"}
                                            />
                                          </div>
                                        </div>
                                        <div className={style["form-input"]}>
                                          <div
                                            className={style["input-heading"]}
                                          >
                                            First Name{" "}
                                            <span className={style["required"]}>
                                              *
                                            </span>
                                          </div>
                                          <div
                                            className={style["input-wrapper"]}
                                          >
                                            <input
                                              type="text"
                                              placeholder="First Name"
                                              onInput={(e) => {
                                                e.target.value =
                                                  e.target.value.replace(
                                                    /[^a-zA-Z\s]/g,
                                                    ""
                                                  ); // Replace non-numeric characters with empty string
                                              }}
                                              maxLength={25}
                                              value={child.firstName ?? ""}
                                              onChange={(e) =>
                                                handlePaxDetailsChanged(
                                                  e,
                                                  roomIndex,
                                                  childIndex,
                                                  2,
                                                  "firstName"
                                                )
                                              }
                                            />
                                          </div>
                                          {errors[roomIndex] &&
                                            errors[roomIndex].childrenData[
                                              childIndex
                                            ] &&
                                            errors[roomIndex].childrenData[
                                              childIndex
                                            ]["firstName"] && (
                                              <p className={style.textDanger}>
                                                {
                                                  errors[roomIndex]
                                                    .childrenData[childIndex][
                                                    "firstName"
                                                  ]
                                                }
                                              </p>
                                            )}
                                        </div>
                                        <div className={style["form-input"]}>
                                          <div
                                            className={style["input-heading"]}
                                          >
                                            Middle Name
                                          </div>
                                          <div
                                            className={style["input-wrapper"]}
                                          >
                                            <input
                                              type="text"
                                              placeholder="Middle Name"
                                              value={child.middleName ?? ""}
                                              onInput={(e) => {
                                                e.target.value =
                                                  e.target.value.replace(
                                                    /[^a-zA-Z\s]/g,
                                                    ""
                                                  ); // Replace non-numeric characters with empty string
                                              }}
                                              maxLength={30}
                                              onChange={(e) =>
                                                handlePaxDetailsChanged(
                                                  e,
                                                  roomIndex,
                                                  childIndex,
                                                  2,
                                                  "middleName"
                                                )
                                              }
                                            />
                                          </div>
                                        </div>
                                        <div className={style["form-input"]}>
                                          <div
                                            className={style["input-heading"]}
                                          >
                                            Last Name{" "}
                                            <span className={style["required"]}>
                                              *
                                            </span>
                                          </div>
                                          <div
                                            className={style["input-wrapper"]}
                                          >
                                            <input
                                              type="text"
                                              placeholder="Last Name"
                                              onInput={(e) => {
                                                e.target.value =
                                                  e.target.value.replace(
                                                    /[^a-zA-Z\s]/g,
                                                    ""
                                                  ); // Replace non-numeric characters with empty string
                                              }}
                                              maxLength={30}
                                              value={child.lastName ?? ""}
                                              onChange={(e) =>
                                                handlePaxDetailsChanged(
                                                  e,
                                                  roomIndex,
                                                  childIndex,
                                                  2,
                                                  "lastName"
                                                )
                                              }
                                            />
                                          </div>
                                          {errors[roomIndex] &&
                                            errors[roomIndex].childrenData[
                                              childIndex
                                            ] &&
                                            errors[roomIndex].childrenData[
                                              childIndex
                                            ]["lastName"] && (
                                              <p className={style.textDanger}>
                                                {
                                                  errors[roomIndex]
                                                    .childrenData[childIndex][
                                                    "lastName"
                                                  ]
                                                }
                                              </p>
                                            )}
                                        </div>
                                      </div>

                                      <div className={style["form-row2"]}>
                                        {blockResponse?.data?.BlockRoomResult
                                          ?.HotelRoomsDetails[roomIndex]
                                          ?.PaxPanValidation?.Children[
                                          childIndex
                                        ]?.panmandatory ? (
                                          <div className={style["form-input2"]}>
                                            <div
                                              className={style["input-heading"]}
                                            >
                                              PAN Card Number{" "}
                                              <span
                                                className={style["required"]}
                                              >
                                                *
                                              </span>
                                            </div>
                                            <div
                                              className={style["input-wrapper"]}
                                            >
                                              {/* {!child.isPANAvailable ? ( */}
                                              <input
                                                type="text"
                                                placeholder="PAN Card Number"
                                                value={child.PAN ?? ""}
                                                maxLength={10}
                                                onInput={(e) => {
                                                  e.target.value =
                                                    e.target.value.replace(
                                                      /[^a-zA-Z\d]+/g,
                                                      ""
                                                    ); // Replace non-numeric characters with empty string
                                                  e.target.value =
                                                    e.target.value.toUpperCase();
                                                }}
                                                onChange={(e) =>
                                                  handlePaxDetailsChanged(
                                                    e,
                                                    roomIndex,
                                                    childIndex,
                                                    2,
                                                    "PAN"
                                                  )
                                                }
                                              />
                                              {/* ) : (
                                            <input
                                              type="text"
                                              placeholder="PAN Card Number"
                                              disabled
                                            />
                                          )} */}
                                            </div>
                                            {errors[roomIndex] &&
                                              errors[roomIndex].childrenData[
                                                childIndex
                                              ] &&
                                              errors[roomIndex].childrenData[
                                                childIndex
                                              ]["PAN"] && (
                                                <p className={style.textDanger}>
                                                  {
                                                    errors[roomIndex]
                                                      .childrenData[childIndex][
                                                      "PAN"
                                                    ]
                                                  }
                                                </p>
                                              )}
                                            {errors[roomIndex] &&
                                              errors[roomIndex].childrenData[
                                                childIndex
                                              ] &&
                                              errors[roomIndex].childrenData[
                                                childIndex
                                              ]["panValidated"] && (
                                                <p className={style.textDanger}>
                                                  {
                                                    errors[roomIndex]
                                                      .childrenData[childIndex][
                                                      "panValidated"
                                                    ]
                                                  }
                                                </p>
                                              )}
                                          </div>
                                        ) : null}
                                        {!child?.isPANValid &&
                                        blockResponse?.data?.BlockRoomResult
                                          ?.HotelRoomsDetails[roomIndex]
                                          ?.PaxPanValidation?.Children[
                                          childIndex
                                        ]?.panmandatory ? (
                                          <div
                                            className={style["from-valid"]}
                                            onClick={(e) =>
                                              /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(
                                                child.PAN
                                              ) &&
                                              handlePANValidation(
                                                e,
                                                roomIndex,
                                                childIndex,
                                                "2",
                                                "ChildPANValidation"
                                              )
                                            }
                                          >
                                            <div
                                              className={`${
                                                style["valid-button"]
                                              } ${
                                                !/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(
                                                  child.PAN
                                                )
                                                  ? style[
                                                      "validate-button-disabled"
                                                    ]
                                                  : ""
                                              }`}
                                              disabled={
                                                !/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(
                                                  child.PAN
                                                )
                                              }
                                            >
                                              Validate
                                            </div>
                                          </div>
                                        ) : blockResponse?.data?.BlockRoomResult
                                            ?.HotelRoomsDetails[roomIndex]
                                            ?.PaxPanValidation?.Children[
                                            childIndex
                                          ]?.panmandatory ? (
                                          <div className={style["from-valid"]}>
                                            <div
                                              className={
                                                style["validated-button"]
                                              }
                                            >
                                              &#10004;
                                            </div>
                                          </div>
                                        ) : (
                                          <></>
                                        )}
                                      </div>

                                      <div className={style["child-filde"]}>
                                        <div className={style["child-age"]}>
                                          <div
                                            className={style["child-age-lable"]}
                                          >
                                            Age of child: {child.age}{" "}
                                            {child.age > 1 ? "yrs" : "yr"}
                                          </div>
                                        </div>
                                        {blockResponse?.data?.BlockRoomResult
                                          ?.HotelRoomsDetails[roomIndex]
                                          ?.PaxPanValidation?.Children[
                                          childIndex
                                        ]?.panmandatory && (
                                          <div
                                            className={
                                              style["child-pan-checkbox"]
                                            }
                                          >
                                            <label htmlFor="below12">
                                              <input
                                                type="checkbox"
                                                id="below12"
                                                className={style["check-box"]}
                                                onChange={(e) => {
                                                  handlePANCheckboxChange(
                                                    e,
                                                    roomIndex,
                                                    childIndex,
                                                    "2"
                                                  );
                                                }}
                                              />
                                              Select if PAN CARD is not
                                              available
                                            </label>
                                          </div>
                                        )}
                                      </div>
                                      {blockResponse?.data?.BlockRoomResult
                                        ?.HotelRoomsDetails[roomIndex]
                                        ?.IsPassportMandatory && (
                                        <>
                                          <hr className={style["thin-hr"]} />
                                          <div>
                                            <div
                                              className={
                                                style["heading passport-head"]
                                              }
                                            >
                                              Passport details{" "}
                                            </div>
                                            <div className={style["form-row2"]}>
                                              <div
                                                className={style["form-input2"]}
                                              >
                                                <div
                                                  className={
                                                    style["input-heading"]
                                                  }
                                                >
                                                  Passport number{" "}
                                                  <span
                                                    className={
                                                      style["required"]
                                                    }
                                                  >
                                                    *
                                                  </span>
                                                </div>
                                                <div
                                                  className={
                                                    style["input-wrapper"]
                                                  }
                                                >
                                                  <input
                                                    type="email"
                                                    placeholder="Passport number"
                                                    value={child.passportNumber}
                                                    onChange={(e) =>
                                                      handlePaxDetailsChanged(
                                                        e,
                                                        roomIndex,
                                                        childIndex,
                                                        2,
                                                        "passportNumber"
                                                      )
                                                    }
                                                  />
                                                </div>
                                                {errors[roomIndex] &&
                                                  errors[roomIndex]
                                                    .childrenData[childIndex] &&
                                                  errors[roomIndex]
                                                    .childrenData[childIndex][
                                                    "passportNumber"
                                                  ] && (
                                                    <p
                                                      className={
                                                        style.textDanger
                                                      }
                                                    >
                                                      {
                                                        errors[roomIndex]
                                                          .childrenData[
                                                          childIndex
                                                        ]["passportNumber"]
                                                      }
                                                    </p>
                                                  )}
                                              </div>
                                              <div
                                                className={style["form-input2"]}
                                              >
                                                <div
                                                  className={
                                                    style["input-heading"]
                                                  }
                                                >
                                                  Passport Issue Date{" "}
                                                  <span
                                                    className={
                                                      style["required"]
                                                    }
                                                  >
                                                    *
                                                  </span>
                                                </div>
                                                <DatePicker
                                                  selected={convertToDateObject(
                                                    child?.passportIssueDate
                                                  )}
                                                  dateFormat="yyyy-MM-dd"
                                                  showPopperArrow={false}
                                                  showMonthDropdown
                                                  showYearDropdown
                                                  dropdownMode="select"
                                                  maxDate={new Date()}
                                                  onChange={(e) =>
                                                    handlePaxDetailsChanged(
                                                      e,
                                                      roomIndex,
                                                      childIndex,
                                                      2,
                                                      "passportIssueDate"
                                                    )
                                                  }
                                                  customInput={
                                                    <div
                                                      className={
                                                        style["input-wrapper"]
                                                      }
                                                    >
                                                      <input
                                                        type="text"
                                                        placeholder="DD/MM/YY"
                                                        readOnly
                                                        value={
                                                          child?.passportIssueDate
                                                        }
                                                        onChange={(e) =>
                                                          e.preventDefault()
                                                        }
                                                      />
                                                      <div
                                                        className={
                                                          style["icon"]
                                                        }
                                                        id="calendarIcon"
                                                      >
                                                        <i
                                                          className={
                                                            style[
                                                              "far fa-calendar-alt"
                                                            ]
                                                          }
                                                        ></i>
                                                      </div>
                                                    </div>
                                                  }
                                                />
                                                {errors[roomIndex] &&
                                                  errors[roomIndex]
                                                    .childrenData[childIndex] &&
                                                  errors[roomIndex]
                                                    .childrenData[childIndex][
                                                    "passportIssueDate"
                                                  ] && (
                                                    <p
                                                      className={
                                                        style.textDanger
                                                      }
                                                    >
                                                      {
                                                        errors[roomIndex]
                                                          .childrenData[
                                                          childIndex
                                                        ]["passportIssueDate"]
                                                      }
                                                    </p>
                                                  )}
                                              </div>
                                              <div
                                                className={style["form-input2"]}
                                              >
                                                <div
                                                  className={
                                                    style["input-heading"]
                                                  }
                                                >
                                                  Passport Exp Date{" "}
                                                  <span
                                                    className={
                                                      style["required"]
                                                    }
                                                  >
                                                    *
                                                  </span>
                                                </div>
                                                <DatePicker
                                                  selected={convertToDateObject(
                                                    child?.passportExpDate !=
                                                      null
                                                      ? child?.passportExpDate
                                                      : checkinDate
                                                  )}
                                                  dateFormat="yyyy-MM-dd"
                                                  showPopperArrow={false}
                                                  showMonthDropdown
                                                  showYearDropdown
                                                  dropdownMode="select"
                                                  minDate={convertToDateObject(
                                                    checkinDate
                                                  )?.setDate(
                                                    convertToDateObject(
                                                      checkinDate
                                                    )?.getDate() + 1
                                                  )}
                                                  onChange={(e) =>
                                                    handlePaxDetailsChanged(
                                                      e,
                                                      roomIndex,
                                                      childIndex,
                                                      2,
                                                      "passportExpDate"
                                                    )
                                                  }
                                                  customInput={
                                                    <div
                                                      className={
                                                        style["input-wrapper"]
                                                      }
                                                    >
                                                      <input
                                                        value={
                                                          child?.passportExpDate
                                                        }
                                                        type="text"
                                                        readOnly
                                                        placeholder="DD/MM/YY"
                                                        onChange={(e) =>
                                                          e.preventDefault()
                                                        }
                                                      />
                                                      <div
                                                        className={
                                                          style["icon"]
                                                        }
                                                        id="calendarIcon"
                                                      >
                                                        <i
                                                          className={
                                                            style[
                                                              "far fa-calendar-alt"
                                                            ]
                                                          }
                                                        ></i>
                                                      </div>
                                                    </div>
                                                  }
                                                />
                                                {errors[roomIndex] &&
                                                  errors[roomIndex]
                                                    .childrenData[childIndex] &&
                                                  errors[roomIndex]
                                                    .childrenData[childIndex][
                                                    "passportExpDate"
                                                  ] && (
                                                    <p
                                                      className={
                                                        style.textDanger
                                                      }
                                                    >
                                                      {
                                                        errors[roomIndex]
                                                          .childrenData[
                                                          childIndex
                                                        ]["passportExpDate"]
                                                      }
                                                    </p>
                                                  )}
                                              </div>
                                            </div>
                                          </div>
                                        </>
                                      )}
                                    </div>
                                  ))}
                              </div>
                            ) : (
                              <div>
                                {room.adultsData &&
                                  room.adultsData.map((adults, adultIndex) => (
                                    <div key={adultIndex}>
                                      <br />
                                      <div className={style["adult-details"]}>
                                        Adult {adultIndex + 1}
                                      </div>

                                      <div>
                                        <div className={style["form-row"]}>
                                          <div className={style["form-input"]}>
                                            <div
                                              className={style["input-heading"]}
                                            >
                                              Title{" "}
                                              <span
                                                className={style["required"]}
                                              >
                                                *
                                              </span>
                                            </div>
                                            <div
                                              className={
                                                style["input-wrapper title"]
                                              }
                                            >
                                              <TitleDropdown
                                                paxDetails={adults}
                                                roomIndex={roomIndex}
                                                paxDetailsIndex={adultIndex}
                                                paxType={1}
                                                fieldName={"title"}
                                              />
                                            </div>
                                          </div>
                                          <div className={style["form-input"]}>
                                            <div
                                              className={style["input-heading"]}
                                            >
                                              First Name{" "}
                                              <span
                                                className={style["required"]}
                                              >
                                                *
                                              </span>
                                            </div>
                                            <div
                                              className={style["input-wrapper"]}
                                            >
                                              <input
                                                type="text"
                                                placeholder="First Name"
                                                onInput={(e) => {
                                                  e.target.value =
                                                    e.target.value.replace(
                                                      /[^a-zA-Z\s]/g,
                                                      ""
                                                    ); // Replace non-numeric characters with empty string
                                                }}
                                                maxLength={25}
                                                onChange={(e) =>
                                                  handlePaxDetailsChanged(
                                                    e,
                                                    roomIndex,
                                                    adultIndex,
                                                    1,
                                                    "firstName"
                                                  )
                                                }
                                              />
                                            </div>
                                          </div>
                                          <div className={style["form-input"]}>
                                            <div
                                              className={style["input-heading"]}
                                            >
                                              Middle Name
                                            </div>
                                            <div
                                              className={style["input-wrapper"]}
                                            >
                                              <input
                                                type="text"
                                                placeholder="Middle Name"
                                                onInput={(e) => {
                                                  e.target.value =
                                                    e.target.value.replace(
                                                      /[^a-zA-Z\s]/g,
                                                      ""
                                                    ); // Replace non-numeric characters with empty string
                                                }}
                                                maxLength={30}
                                                onChange={(e) =>
                                                  handlePaxDetailsChanged(
                                                    e,
                                                    roomIndex,
                                                    adultIndex,
                                                    1,
                                                    "middleName"
                                                  )
                                                }
                                              />
                                            </div>
                                          </div>
                                          <div className={style["form-input"]}>
                                            <div
                                              className={style["input-heading"]}
                                            >
                                              Last Name
                                            </div>
                                            <div
                                              className={style["input-wrapper"]}
                                            >
                                              <input
                                                type="text"
                                                placeholder="Last Name"
                                                onInput={(e) => {
                                                  e.target.value =
                                                    e.target.value.replace(
                                                      /[^a-zA-Z\s]/g,
                                                      ""
                                                    ); // Replace non-numeric characters with empty string
                                                }}
                                                maxLength={30}
                                                onChange={(e) =>
                                                  handlePaxDetailsChanged(
                                                    e,
                                                    roomIndex,
                                                    adultIndex,
                                                    1,
                                                    "lastName"
                                                  )
                                                }
                                              />
                                            </div>
                                          </div>
                                        </div>

                                        <div className={style["form-row2"]}>
                                          {blockResponse.data.BlockRoomResult
                                            .ValidationInfo.ValidationAtConfirm
                                            .IsPANMandatory ||
                                          blockResponse.data.BlockRoomResult
                                            .ValidationInfo.ValidationAtVoucher
                                            .IsPANMandatory ? (
                                            <div
                                              className={style["form-input2"]}
                                            >
                                              <div
                                                className={
                                                  style["input-heading"]
                                                }
                                              >
                                                PAN Card Number{" "}
                                                <span
                                                  className={style["required"]}
                                                >
                                                  *
                                                </span>
                                              </div>
                                              <div
                                                className={
                                                  style["input-wrapper"]
                                                }
                                              ></div>
                                            </div>
                                          ) : null}
                                        </div>
                                      </div>

                                      {blockResponse.data.BlockRoomResult
                                        .ValidationInfo.ValidationAtConfirm
                                        .IsPassportMandatory ||
                                        (blockResponse.data.BlockRoomResult
                                          .ValidationInfo.ValidationAtVoucher
                                          .IsPassportMandatory && (
                                          <>
                                            <hr className={style["thin-hr"]} />
                                            <div>
                                              <div
                                                className={
                                                  style["heading passport-head"]
                                                }
                                              >
                                                Passport details{" "}
                                              </div>
                                              <div
                                                className={style["form-row2"]}
                                              >
                                                <div
                                                  className={
                                                    style["form-input2"]
                                                  }
                                                >
                                                  <div
                                                    className={
                                                      style["input-heading"]
                                                    }
                                                  >
                                                    Passport number
                                                  </div>
                                                  <div
                                                    className={
                                                      style["input-wrapper"]
                                                    }
                                                  >
                                                    <input
                                                      type="text"
                                                      placeholder="Passport number"
                                                      onChange={(e) =>
                                                        handlePaxDetailsChanged(
                                                          e,
                                                          roomIndex,
                                                          adultIndex,
                                                          1,
                                                          "passportNumber"
                                                        )
                                                      }
                                                    />
                                                  </div>
                                                </div>
                                                <div
                                                  className={
                                                    style["form-input2"]
                                                  }
                                                >
                                                  <div
                                                    className={
                                                      style["input-heading"]
                                                    }
                                                  >
                                                    Date
                                                  </div>
                                                  <div
                                                    className={
                                                      style["input-wrapper"]
                                                    }
                                                  >
                                                    <input
                                                      type="date"
                                                      placeholder="DD/MM/YY"
                                                      onChange={(e) =>
                                                        handlePaxDetailsChanged(
                                                          e,
                                                          roomIndex,
                                                          adultIndex,
                                                          1,
                                                          "passportIssueDate"
                                                        )
                                                      }
                                                    />
                                                    <div
                                                      className={style["icon"]}
                                                      id="calendarIcon"
                                                    >
                                                      <i
                                                        className={
                                                          style[
                                                            "far fa-calendar-alt"
                                                          ]
                                                        }
                                                      ></i>
                                                    </div>
                                                  </div>
                                                </div>
                                                <div
                                                  className={
                                                    style["form-input2"]
                                                  }
                                                >
                                                  <div
                                                    className={
                                                      style["input-heading"]
                                                    }
                                                  >
                                                    Date
                                                  </div>
                                                  <div
                                                    className={
                                                      style["input-wrapper"]
                                                    }
                                                  >
                                                    <input
                                                      type="date"
                                                      placeholder="DD/MM/YY"
                                                      onChange={(e) =>
                                                        handlePaxDetailsChanged(
                                                          e,
                                                          roomIndex,
                                                          adultIndex,
                                                          1,
                                                          "passportExpDate"
                                                        )
                                                      }
                                                    />
                                                    <div
                                                      className={style["icon"]}
                                                      id="calendarIcon"
                                                    >
                                                      <i
                                                        className={
                                                          style[
                                                            "far fa-calendar-alt"
                                                          ]
                                                        }
                                                      ></i>
                                                    </div>
                                                  </div>
                                                </div>
                                              </div>
                                            </div>
                                          </>
                                        ))}
                                    </div>
                                  ))}
                              </div>
                            )}
                          </div>
                        </>
                      ))}
                      <br />
                    </div>
                  </div>

                  {reserveRoom !== "true" && (
                    <UseWalletBalanceButton
                      walletBalance={walletBalance}
                      checkwallet={checkwallet}
                      goToWalletDetails={goToWalletDetails}
                    />
                  )}

                  <div
                    className={`${style["hotel-policy"]}`}
                    onClick={hotelPolicyToggleContent}
                  >
                    <div
                      className={style["horizontal-div"]}
                      id="dropdownButton"
                    >
                      <div className={style["hotelpolicyheader-div"]}>
                        <div className={style["hotelpolicy-heading"]}>
                          Hotel Policy
                        </div>
                        <div className={style["dropdown-icon unhide-cancel"]}>
                          <FontAwesomeIcon
                            icon={
                              showHotelPolicyContent
                                ? faCaretDown
                                : faCaretRight
                            }
                          />
                        </div>
                      </div>
                      {showHotelPolicyContent && (
                        <div className={style["hotelPolicyContent-div"]}>
                          {sanitizeAndRenderHTML(hotelPolicyDetails)}
                        </div>
                      )}
                    </div>
                  </div>
                  <div
                    className={`${style["cancel-policy"]}`}
                    onClick={toggleContent}
                  >
                    <div
                      className={style["horizontal-div"]}
                      id="dropdownButton"
                    >
                      <div className={style["cancellationpolicyheader-div"]}>
                        <div className={style["cancel-heading"]}>
                          Cancellation Policy
                        </div>
                        <div className={style["dropdown-icon unhide-cancel"]}>
                          <FontAwesomeIcon
                            icon={showContent ? faCaretDown : faCaretRight}
                          />
                        </div>
                      </div>

                      {showContent && (
                        <div className={style["cancellationPolicyContent-div"]}>
                          {blockResponse.data.BlockRoomResult.HotelRoomsDetails.map(
                            (room, roomIndex) => (
                              <>
                                <div className={style["room-description"]}>
                                  <div>
                                    Room {roomIndex + 1} : {room.RoomTypeName}
                                  </div>
                                </div>
                                {new Date() <
                                  new Date(
                                    room?.CancellationPolicies[0]?.FromDate
                                  ) && (
                                  <div style={{ color: "#155EEF" }}>
                                    Free cancellation Before{" "}
                                    {new Date(
                                      room?.CancellationPolicies[0]?.FromDate
                                    ).toLocaleDateString("en-GB", {
                                      day: "numeric",
                                      month: "short",
                                      year: "numeric",
                                    })}
                                  </div>
                                )}
                                <div>
                                  <div>
                                    <div className={style["column"]}>
                                      <div className={style["column-heading"]}>
                                        Cancellation from
                                      </div>
                                    </div>
                                    <div className={style["column"]}>
                                      <div className={style["column-heading"]}>
                                        Cancellation to
                                      </div>
                                    </div>
                                    <div className={style["column"]}>
                                      <div className={style["column-heading"]}>
                                        Cancellation charges
                                      </div>
                                    </div>
                                  </div>
                                  {room.CancellationPolicies.map(
                                    (cancelPolicy, cancelIndex) => (
                                      <div key={cancelIndex}>
                                        <div className={style["column-info"]}>
                                          <div className={style["info-row"]}>
                                            {new Date(
                                              cancelPolicy.FromDate
                                            ).toLocaleDateString("en-GB", {
                                              day: "numeric",
                                              month: "short",
                                              year: "numeric",
                                            })}
                                          </div>
                                        </div>
                                        <div className={style["column-info"]}>
                                          <div className={style["info-row"]}>
                                            {new Date(
                                              cancelPolicy.ToDate
                                            ).toLocaleDateString("en-GB", {
                                              day: "numeric",
                                              month: "short",
                                              year: "numeric",
                                            })}
                                          </div>
                                        </div>
                                        {cancelPolicy.ChargeType === 1 ? (
                                          <div className={style["column-info"]}>
                                            <div className={style["info-row"]}>
                                              {cancelPolicy.Charge}{" "}
                                              {cancelPolicy.Currency}
                                            </div>
                                          </div>
                                        ) : cancelPolicy.ChargeType === 2 ? (
                                          <div className={style["column-info"]}>
                                            <div className={style["info-row"]}>
                                              {cancelPolicy.Charge}%
                                            </div>
                                          </div>
                                        ) : cancelPolicy.ChargeType === 3 ? (
                                          <div className={style["column-info"]}>
                                            <div className={style["info-row"]}>
                                              {cancelPolicy.Charge} Nights
                                            </div>
                                          </div>
                                        ) : null}
                                      </div>
                                    )
                                  )}
                                </div>
                              </>
                            )
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className={style["confirmation-checkbox"]}>
                    <input
                      type="checkbox"
                      id="confirmationCheckbox"
                      className={style["check-box"]}
                      value={confirmation}
                      onChange={(e) => handleConfirmationChanged(e)}
                    />
                    <label htmlFor="confirmationCheckbox">
                      I confirm that all information is, to my knowledge, true.{" "}
                    </label>
                  </div>
                  <div className={style["confirmation-checkbox"]}>
                    <input
                      type="checkbox"
                      id="agreementCheckbox"
                      value={isProceeded}
                      className={style["check-box"]}
                      onChange={(e) => handleProceedChanged(e)}
                    />
                    <label htmlFor="agreementCheckbox">
                      By proceeding with this booking, I agree to QuGo’s&nbsp;
                      <span className={style["color-text"]}>
                        <a
                          target="_blank"
                          href="bookingtermsandconditions"
                          className={style["nounderline-text"]}
                        >
                          Terms of use
                        </a>
                        &nbsp;
                      </span>
                      and&nbsp;
                      <span className={style["color-text"]}>
                        <a
                          target="_blank"
                          href="bookingprivacypolicy"
                          className={style["nounderline-text"]}
                        >
                          Privacy Policy
                        </a>
                      </span>
                      .
                    </label>
                  </div>

                  <div className={style["button-container"]}>
                    <button
                      className={style["rectangle-button"]}
                      onClick={
                        buttonClicked ? null : () => handleContinuetoPayClick()
                      }
                      disabled={!confirmation || !isProceeded ? true : false}
                    >
                      {buttonClicked ? (
                        <FontAwesomeIcon
                          className={style.buttonSpinner}
                          icon={faSpinner}
                          style={{
                            maxHeight: "18px",
                            maxWidth: "18px",
                          }}
                          spin
                        />
                      ) : reserveRoom === "true" ? (
                        "Confirm Reservation"
                      ) : calculateTotalPayable() === 0 ? (
                        "Continue to book"
                      ) : (
                        `Continue to Pay Rs. ${calculateTotalPayable()}`
                      )}
                    </button>
                  </div>
                </div>
                <div className={style["right-container"]}>
                  <div className={style["right-container1"]}>
                    <div className={style["booking-card"]}>
                      <Image
                        className={style.bengaluruImage}
                        src={hotelImage || ""}
                        style={{ maxHeight: "220px" }}
                        width={400}
                        height={400}
                        objectFit="contain"
                        alt="Image not found"
                        sizes="100vw"
                      />
                    </div>

                    <div className={style["hotel-head"]}>
                      <div className={style["hotel-heading"]}>{hotelName}</div>
                      <div className={style["description"]}>{hotelAddress}</div>
                      <StarRating rating={selectedHotel.starRating} />
                    </div>

                    <hr className={style["thin-hr"]} />

                    <div className={style["booking-details"]}>
                      <div className={style["left-column"]}>
                        <div className={style["heading"]}>CHECK-IN</div>
                        <div className={style["date"]}>
                          {formattedCheckinDate},
                          <br /> {checkinYear}
                        </div>
                        <div className={style["time"]}>{checkInDayOfWeek}</div>
                      </div>
                      <div className={style["right-column"]}>
                        <div className={style["heading"]}>CHECK-OUT</div>
                        <div className={style["date"]}>
                          {formattedCheckoutDate},
                          <br /> {checkoutYear}
                        </div>
                        <div className={style["time"]}>{checkOutDayOfWeek}</div>
                      </div>
                      <div className={style["connector"]}></div>
                      <div className={style["above-line"]}>
                        {noOfNight} {noOfNight > 1 ? "Nights" : "Night"}
                      </div>
                    </div>

                    <hr className={style["thin-hr"]} />

                    <div className={style["details-div"]}>
                      <div className={style["sub-text"]}>
                        {noOfNight} {noOfNight > 1 ? "Nights" : "Night"} |{" "}
                        {rooms === "1" ? "1 Room" : `${rooms} Rooms`} |{" "}
                        {parseInt(adults) + parseInt(children)}{" "}
                        {parseInt(adults) + parseInt(children) === 1
                          ? "Guest"
                          : "Guests"}
                      </div>
                    </div>

                    {selectedRooms.map((room, index) => (
                      <>
                        <div className={style["room-details"]}>
                          <div className={style["room-heading"]}>
                            <h2 className={style["heading"]}>
                              {concatenateRoomDescriptions(room)}
                            </h2>
                            <i
                              className={style["pencil-icon fas fa-pencil-alt"]}
                            ></i>
                          </div>
                        </div>

                        <div className={style["details-div"]}>
                          <div className={style["sub-text"]}></div>
                          <div className={style["label1"]}>
                            This room includes :
                          </div>

                          <div className={style["label3"]}>
                            {concatenateAmenities(room)}
                          </div>
                        </div>

                        <hr className={style["thin-hr"]} />
                      </>
                    ))}

                    <div className={style["hotel-overview"]}>
                      <div className={style["bottom-heading"]}>
                        Price Details
                      </div>
                    </div>

                    <div className={style["price-details"]}>
                      <div className={style["price-head"]}>Price Breakup</div>
                      <div className={style["columns"]}>
                        <div className={style["column5 left-column5"]}>
                          <div className={style["row"]}>Room Price : </div>
                          <div className={style["row"]}>Taxes : </div>
                          <div className={style["row"]}>Total Amount : </div>
                          <div className={style["row"]}>Wallet Amount : </div>
                          <div className={style.row1}>
                            Total Amount to be paid :
                          </div>
                        </div>
                        <div
                          className={`${style.column5} ${style.rightColumn5}`}
                        >
                          <div className={style["row"]}>
                            {blockResponse &&
                              blockResponse.data &&
                              blockResponse.data.BlockRoomResult &&
                              setRoomPrice(
                                blockResponse.data.BlockRoomResult
                                  .HotelRoomsDetails
                              )}
                          </div>
                          <div className={style["row"]}>
                            {blockResponse &&
                              blockResponse.data &&
                              blockResponse.data.BlockRoomResult &&
                              addTaxableAmount(
                                blockResponse.data.BlockRoomResult
                                  .HotelRoomsDetails
                              )}
                          </div>
                          <div className={`${style["row"]}`}>
                            {totalAmount} {currencyCode}
                          </div>
                          <div className={`${style["row"]}`}>
                            -
                            {walletSelected
                              ? totalAmount - calculateTotalPayable()
                              : 0}{" "}
                            {currencyCode}
                          </div>
                          <div className={`${style["row1"]} ${style["row"]}`}>
                            {calculateTotalPayable()} {currencyCode}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            {!corporateUser ? <Footer /> : <Footer1 />}
          </div>
        </>
      ) : (
        <>
          <Loader />
        </>
      )}
    </>
  );
}
