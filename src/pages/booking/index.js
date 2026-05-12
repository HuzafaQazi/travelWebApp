import { Inter } from "next/font/google";
import "bootstrap/dist/css/bootstrap.css";
import Footer from "@/components/footer/footer";
import style from "./styles.module.css";
import { useState } from "react";
import Image from "next/image";
import Dropdown from "react-bootstrap/Dropdown";
import { useEffect } from "react";
import { initCashFree } from "@/paymentGateways/cashFree";
import {
  bookRoom, getPaymentSessionID
} from "../../../utils/bookingAPI";
import GuestCard from "@/components/guestCard/guestCard";
import { useRouter } from "next/router";
import useLocalStorage from "@/hooks/useLocalStorage";
import StarRating from "@/components/starRating";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSpinner } from "@fortawesome/free-solid-svg-icons";
import ProfileHeader from "@/components/profileheader/profileheader";
import { getTabSpecificData, setTabSpecificData } from "@/utils/axios/axios";

const inter = Inter({ subsets: ["latin"] });

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

export default function Booking() {
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
  const {
    qTraceId,
    rooms,
    adults,
    cartID,
    destination,
    checkinDate,
    checkoutDate,
    getCityId,
    getCountryCode,
    roomCountString,
    roomCountStringWithPax,
    totalCostRoom,
    totalRoomGSTAmount,
    reserveRoom,
  } = router.query;

  const daysOfWeek = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];



  const [guestCards, setGuestCards] = useState([]);
  const [updateFlag, setUpdateFlag] = useState(false);

  const [selectedHotel, setSelectedHotel] = useState([]);
  const [selectedRooms, setSelectedRooms] = useState([]);
  const [parsedRoomCountStringWithPax, setParsedRoomCountStringWithPax] =
    useState([]);
  const [loading, setLoading] = useState(false);
  const [hotelName, setHotelName] = useState("");
  const [hotelAddress, setHotelAddress] = useState("");
  const [hotelImage, setHotelImage] = useState("");
  const [queryData, setQueryData] = useState(null);

  useEffect(() => {
    // Check if the router.query data is available
    if (router.query) {
      // Access the query parameters and update the component state
      const {
        qTraceId,
        rooms,
        adults,
        cartID,
        destination,
        checkinDate,
        checkoutDate,
        getCityId,
        getCountryCode,
        roomCountString,
        roomCountStringWithPax,
        totalCostRoom,
        totalRoomGSTAmount,
        reserveRoom,
      } = router.query;

      setQueryData({
        qTraceId,
        rooms,
        adults,
        cartID,
        destination,
        checkinDate,
        checkoutDate,
        getCityId,
        getCountryCode,
        roomCountString,
        roomCountStringWithPax,
        totalCostRoom,
        totalRoomGSTAmount,
        reserveRoom,
      });
    }
  }, [router.query]);

  // Changing checkin date format to show in UI
  let formattedCheckinDate;
  let checkInDayOfWeek;
  let checkinDay;
  let checkinMonth;
  let checkinYear;
  if (queryData && queryData?.checkinDate) {
    // const [checkinDay, checkinMonth, checkinYear] =
    //   queryData?.checkinDate.split("-");
    checkinDay = queryData?.checkinDate.split("-")[0];
    checkinMonth = queryData?.checkinDate.split("-")[1];
    checkinYear = queryData?.checkinDate.split("-")[2];

    formattedCheckinDate = `${getDayWithSuffix(
      parseInt(checkinDay)
    )} ${new Date(checkinYear, checkinMonth - 1, checkinDay).toLocaleString(
      "default",
      { month: "long" }
    )}`;

    checkInDayOfWeek =
      daysOfWeek[new Date(checkinYear, checkinMonth - 1, checkinDay).getDay()];
  }

  // Changing checkin date format to show in UI
  let formattedCheckoutDate;
  let checkOutDayOfWeek;
  let checkoutDay;
  let checkoutMonth;
  let checkoutYear;
  if (queryData && queryData?.checkoutDate) {
    // const [checkoutDay, checkoutMonth, checkoutYear] = checkoutDate.split("-");
    checkoutDay = queryData?.checkoutDate.split("-")[0];
    checkoutMonth = queryData?.checkoutDate.split("-")[1];
    checkoutYear = queryData?.checkoutDate.split("-")[2];

    formattedCheckoutDate = `${getDayWithSuffix(
      parseInt(checkoutDay)
    )} ${new Date(checkoutYear, checkoutMonth - 1, checkoutDay).toLocaleString(
      "default",
      { month: "long" }
    )}`;

    checkOutDayOfWeek =
      daysOfWeek[
        new Date(checkoutYear, checkoutMonth - 1, checkoutDay).getDay()
      ];
  }
  let noOfNight;
  if (queryData?.checkoutDate || queryData?.checkinDate) {
    noOfNight = calculateNoOfNights(checkinDate, checkoutDate);
  }


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

  function concatenateRoomDescriptions(roomList) {
    let concatenatedDescriptions = "";

    for (const room of roomList) {
      concatenatedDescriptions += room.roomTypeName + " | ";
    }

    // Remove the trailing " | " from the last room description
    concatenatedDescriptions = concatenatedDescriptions.slice(0, -3);

    return concatenatedDescriptions;
  }

  function concatenateAmenities(roomList) {
    // let concatenatedAmenities = "";
    const uniqueAmenitiesSet = new Set();

    for (const room of roomList) {
      // concatenatedAmenities += room.amenities.join(", ") + " | ";
      room.amenities.forEach((amenity) => uniqueAmenitiesSet.add(amenity));
    }

    // Remove the trailing " | " from the last room description
    const concatenatedAmenities = Array.from(uniqueAmenitiesSet).join(", ");

    return concatenatedAmenities;
  }


  function setRoomPrice(roomList) {
    let totalRoomPrice = 0;
    let currencyCode = ""; // Variable to store the currency code

    for (const room of roomList) {
      const { price } = room;
      const {
        qOfferedPriceWithoutTax,
        currencyCode: roomCurrencyCode,
      } = price; // Destructure the currency code

      currencyCode = roomCurrencyCode; // Store the currency code for each room
      // const offeredPriceRoundedOff = Math.round(offeredPrice);
      const roomPrice = qOfferedPriceWithoutTax.toFixed(2);

      // room.price = {
      //   ...price,
      //   roomPrice,
      // };
      

      totalRoomPrice += roomPrice * 1;
    }

    return `${totalRoomPrice} ${currencyCode}`;
  }

  function addTaxableAmount(roomList) {
    let totalTaxableAmount = 0;
    let currencyCode = ""; // Variable to store the currency code

    for (const room of roomList) {
      const { price } = room;
      const { qCommissionTax, currencyCode: roomCurrencyCode } = price; // Destructure the GST and currency code

      currencyCode = roomCurrencyCode; // Store the currency code for each room
      totalTaxableAmount += qCommissionTax; // Access the taxableAmount inside GST object
    }
    const roundedTotal = totalTaxableAmount.toFixed(2); // Round off to two decimal places

    return `${roundedTotal} ${currencyCode}`;
  }

  function setTotalPrice(roomList) {
    let totalPrice = 0;
    let currencyCode = ""; // Variable to store the currency code

    for (const room of roomList) {
      const { price } = room;
      const { qOfferedPriceRoundedOff, currencyCode: roomCurrencyCode } = price; // Destructure the currency code

      currencyCode = roomCurrencyCode; // Store the currency code for each room
      // const offeredPriceRoundedOff = Math.round(offeredPrice);
      totalPrice += qOfferedPriceRoundedOff * 1;
    }

    return `${totalPrice} ${currencyCode}`;
  }
  // Function to be executed when the page is opened
  useEffect(() => {
    let selectedHotel = getTabSpecificData("selectedHotel");
    const parsedSelectedHotel = JSON.parse(selectedHotel);
    setSelectedHotel(parsedSelectedHotel);
    setHotelName(parsedSelectedHotel.hotelName);
    setHotelAddress(parsedSelectedHotel.hotelAddress);
    setHotelImage(parsedSelectedHotel.hotelImages);
    let selectedRooms = getTabSpecificData("selectedRooms");
    const parsedSelectedRooms = JSON.parse(selectedRooms);
    setSelectedRooms(parsedSelectedRooms);

    if (roomCountStringWithPax) {
      setParsedRoomCountStringWithPax(JSON.parse(roomCountStringWithPax));
    }

  }, []);

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

  const [leadTravellerTitle, setLeadTravellerTitle] = useState("Mr");
  const [getPhoneNumber, setPhoneNumber] = useLocalStorage("phoneNumber");



  const handlePaxDetailsChanged = (
    event,
    roomIndex,
    paxDetailsIndex,
    paxType,
    fieldName,
    titleValue
  ) => {
    const value = event.target.value;


    const updatedSelectedRooms = [...selectedRooms];

    if (paxType === 1) {
      // Update details for an adult
      if (fieldName === "firstName") {
        updatedSelectedRooms[roomIndex].adultsData[paxDetailsIndex].firstName =
          value;
      } else if (fieldName === "lastName") {
        updatedSelectedRooms[roomIndex].adultsData[paxDetailsIndex].lastName =
          value;
      } else if (fieldName === "title") {
        updatedSelectedRooms[roomIndex].adultsData[paxDetailsIndex].title =
          titleValue;
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
      // Update details for a child
      if (fieldName === "firstName") {
        updatedSelectedRooms[roomIndex].childData[paxDetailsIndex].firstName =
          value;
      } else if (fieldName === "lastName") {
        updatedSelectedRooms[roomIndex].childData[paxDetailsIndex].lastName =
          value;
      } else if (fieldName === "title") {
        updatedSelectedRooms[roomIndex].childData[paxDetailsIndex].title =
          titleValue;
      }
    }

    setSelectedRooms(updatedSelectedRooms);
  };



  const handleLeadTravellerEmailAndMobileNumberChanged = (
    event,
    roomIndex,
    fieldName
  ) => {
    const value = event.target.value;
    const updatedSelectedRooms = [...selectedRooms];

    if (fieldName === "email") {
      updatedSelectedRooms[roomIndex].adultsData[0].email = value;
    }
    if (fieldName === "mobileNumber") {
      updatedSelectedRooms[roomIndex].adultsData[0].mobileNumber = value;
    }
    setSelectedRooms(updatedSelectedRooms);
  };



  const DDMMYYTOYYMMDD = (inputDate) => {
    // Split the input date using "-"
    const parts = inputDate.split("-");

    // Reorder the parts to yyyy-mm-dd format
    const convertedDate = `${parts[2]}-${parts[1]}-${parts[0]}`;

    return convertedDate;
  };

  const handleContinueClick = async () => {
    try {
      setLoading(true);
      const formattedCheckinDate = DDMMYYTOYYMMDD(checkinDate);
      const formattedCheckoutDate = DDMMYYTOYYMMDD(checkoutDate);
      let bookResponse = await bookRoom(
        qTraceId,
        rooms,
        cartID,
        destination,
        formattedCheckinDate,
        formattedCheckoutDate,
        getCityId,
        getCountryCode,
        roomCountString,
        totalCostRoom,
        totalRoomGSTAmount,
        selectedHotel,
        selectedRooms,
        leadTravellerFirstName,
        leadTravellerLastName,
        leadTravellerEmail,
        leadTravellerMobileNo,
        reserveRoom
      );

      try {
        if (
          bookResponse !== null &&
          bookResponse?.data?.bookingId !== "" &&
          JSON.parse(reserveRoom) === false
        ) {
          setTabSpecificData("selectedRooms", JSON.stringify(selectedRooms));

          let getPaymeneSessionIDResp = await getPaymentSessionID(
            null,
            0,
            "BOOKING",
            bookResponse.data.data.bookingId,
            totalCostRoom,
          );


          if (
            getPaymeneSessionIDResp !== null &&
            getPaymeneSessionIDResp.data.data.paymentSessionId !== ""
          ) {

            initCashFree(
              getPaymeneSessionIDResp.data.data.paymentSessionId,
              router.query
            );
          }
        }
      } catch (error) {
        console.log("Error while calling book service", error);
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
        console.log("Data validated");
      }
    } catch (error) {
      console.log("Error occured while booking", error);
    } finally {
      setLoading(false);
    }
  };

 

  return (
    <>
      <div>
        {/* <HotelSearchShort /> */}
        <ProfileHeader />
        <div className={style.bookingDetailsContainer}>
          <div className={style.bookingProcessDetails}>
            <div className={style.bookingProcess}>Booking Process</div>
            {/*Booking Details Container 1 start */}
            <div className={style.bookingDetailsContainer1}>
              <div className={style.hotelDetails}>
                <p className={style.hotelName}>{hotelName}</p>
                <p className={style.hotelAddress}>{hotelAddress}</p>
                <StarRating rating={selectedHotel.starRating} />
                
              </div>
              <div className={style.downloadImageDiv}>
            
              </div>
              <div className={style.stayDetails}>
                <div className={style.stayDetailsData}>
                  <div className={style.checkInDetails}>
                    <p className={style.checkIn}>Check-In</p>
                    {formattedCheckinDate && (
                      <p className={style.checkInDate}>
                        {formattedCheckinDate},
                        <br /> {checkinYear}
                      </p>
                    )}
                    <p className={style.checkInTime}>{checkInDayOfWeek}</p>
                  </div>
                  <div className={style.stayDaysDetail}>
                    <p className={style.stayDays}>
                    {noOfNight} {noOfNight > 1 ? 'Days' : 'Day'}
                      </p>
                  </div>
                  <div className={style.checkOutDetails}>
                    <p className={style.checkOut}>Check-Out</p>
                    {formattedCheckoutDate && (
                      <p className={style.checkOutDate}>
                        {formattedCheckoutDate},
                        <br /> {checkoutYear}
                      </p>
                    )}
                    <p className={style.checkOutTime}>{checkOutDayOfWeek}</p>
                  </div>
                </div>
                <div className={style.roomDetailsData}>
                  <p>
                    {noOfNight} Nights | {rooms} Rooms | {adults} Adults
                  </p>
                </div>
              </div>
              <div className={style.hotelDetailsData}>
                <p className={style.hotelDetailsRoomSize}>
                  {concatenateRoomDescriptions(selectedRooms)}
                </p>
                <p className={style.hotelDetailsRoomIncludes}>
                  This room includes:
                </p>
                <p className={style.hotelDetailsRefundable}>Non-Refundable</p>
                <p className={style.hotelDetailsMeals}>No meals included </p>
                <p className={style.hotelDetailsBalcony}>
                  {concatenateAmenities(selectedRooms)}
                </p>
                <p className={style.hotelDetailsRoomArea}>Spacious Rooms</p>
              </div>
              <div className={style.priceDetails}>
                <p className={style.priceBrekup}>Price Breakup</p>
                <p className={style.perVillaPrice}>
                  Room Price :{setRoomPrice(selectedRooms)}
                </p>
             /
                <p className={style.taxes}>
                  Taxes : {addTaxableAmount(selectedRooms)}
                </p>
                <p className={style.totalAmountToBepaid}>
                  Total Amount to be paid : {setTotalPrice(selectedRooms)}
                </p>
              </div>
              <div className={style.hotelImage}>
                <Image
                  className={style.bengaluruImage}
                  src={hotelImage}
                  style={{ maxHeight: "220px" }}
                  width={"100"}
                  height={"220"}
                  objectFit="contain"
                  alt="Image not found"
                  sizes="100vw"
                />
              </div>
            </div>
            {/*Booking Details Container 1 end */}

            {/*Booking Details Container 2 start */}
            <div className={style.bookingDetailsContainer2}>
              <div className={style.userInfo}>
                <div className={style.bookingDetails}>
                  <p className={style.enterYourDetails}>Enter your details</p>
                  <p className={style.bookingConfirmationDetails}>
                    {/* Booking details will be sent on your contact number and
                    email. */}
                  </p>
                  <p className={style.roomInfo}>
                    {noOfNight} Nights | {rooms} Rooms | {adults} Adults
                  </p>
                </div>
                <div>
                  {selectedRooms.map((room, roomIndex) => (
                    <div key={roomIndex}>
                      <div className={style.roomNo}>Room {roomIndex + 1}</div>
                      {room.requireAllPaxDetails ? (
                        <>
                          <div className={style.userPhoneAndEmail}>
                            <div>
                              <div>
                                <p className={style.leadTravelerName}>
                                  Email *
                                </p>
                              </div>
                              <div className={style.userDetailsName}>
                                <input
                                  type="text"
                                  className={style.userName}
                                  onChange={(e) =>
                                    handleLeadTravellerEmailAndMobileNumberChanged(
                                      e,
                                      roomIndex,
                                      "email"
                                    )
                                  }
                                />
                              </div>
                              {leadTravellerEmailError && (
                                <p style={{ color: "red" }}>
                                  {leadTravellerEmailError}
                                </p>
                              )}
                            </div>
                            <div>
                              <div>
                                <p className={style.leadTravelerName}>
                                  Phone Number *
                                </p>
                              </div>
                              <div className={style.userDetailsName}>
                                <input
                                  type="text"
                                  className={style.userName}
                                  pattern="[0-9]{10}"
                                  onInput={(e) => {
                                    e.target.value = e.target.value.replace(
                                      /[^0-9]/g,
                                      ""
                                    ); // Replace non-numeric characters with empty string
                                  }}
                                  onChange={(e) =>
                                    handleLeadTravellerEmailAndMobileNumberChanged(
                                      e,
                                      roomIndex,
                                      "mobileNumber"
                                    )
                                  }
                                  maxLength={10}
                                />
                              </div>
                              {leadTravellerMobileNoError && (
                                <p style={{ color: "red" }}>
                                  {leadTravellerMobileNoError}
                                </p>
                              )}
                            </div>
                          </div>
                          {/* Loop through the number of adults */}
                          {room.adultsData &&
                            room.adultsData.map((adults, adultIndex) => (
                              <div key={adultIndex}>
                                <div className={style.paxType}>
                                  Adult {adultIndex + 1}
                                </div>
                                <div className={style.userDetails}>
                                  <div>
                                    <div>
                                      <p className={style.leadTravelerName}>
                                        First Name *
                                      </p>
                                    </div>
                                    <div className={style.userDetailsName}>
                                      <Dropdown className={style.dropDown}>
                                        <Dropdown.Toggle
                                          variant="success"
                                          id="dropdown-basic"
                                          className={style.toggleDropDown}
                                        >
                                          {adults.title}
                                        </Dropdown.Toggle>

                                        <Dropdown.Menu>
                                          <Dropdown.Item
                                            href="#/action-1"
                                            onClick={(e) =>
                                              handlePaxDetailsChanged(
                                                e,
                                                roomIndex,
                                                adultIndex,
                                                1,
                                                "title",
                                                "Mr"
                                              )
                                            }
                                          >
                                            Mr
                                          </Dropdown.Item>
                                          <Dropdown.Item
                                            href="#/action-2"
                                            onClick={(e) =>
                                              handlePaxDetailsChanged(
                                                e,
                                                roomIndex,
                                                adultIndex,
                                                1,
                                                "title",
                                                "Mrs"
                                              )
                                            }
                                          >
                                            Mrs
                                          </Dropdown.Item>
                                          <Dropdown.Item
                                            href="#/action-3"
                                            onClick={(e) =>
                                              handlePaxDetailsChanged(
                                                e,
                                                roomIndex,
                                                adultIndex,
                                                1,
                                                "title",
                                                "Miss"
                                              )
                                            }
                                          >
                                            Miss
                                          </Dropdown.Item>
                                        </Dropdown.Menu>
                                      </Dropdown>
                                      <input
                                        type="text"
                                        className={style.userName}
                                        onInput={(e) => {
                                          e.target.value =
                                            e.target.value.replace(
                                              /[^A-Za-z .]/g,
                                              ""
                                            ); // Replace characters other than alphabets, spaces, and periods with empty string
                                        }}
                                        value={adults && adults.firstName}
                                        maxLength={30}
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
                                    {leadTravellerFirstNameError &&
                                      leadTravellerFirstNameError[roomIndex] &&
                                      leadTravellerFirstNameError[roomIndex][
                                        adultIndex
                                      ] && (
                                        <p style={{ color: "red" }}>
                                          {
                                            leadTravellerFirstNameError[
                                              roomIndex
                                            ][adultIndex].error
                                          }
                                        </p>
                                      )}
                                  </div>
                                  <div>
                                    <div>
                                      <p className={style.leadTravelerName}>
                                        Last name *
                                      </p>
                                    </div>
                                    <div className={style.userDetailsName}>
                                      <input
                                        type="text"
                                        className={style.userName}
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
                                    {leadTravellerLastNameError && (
                                      <p style={{ color: "red" }}>
                                        {leadTravellerLastNameError}
                                      </p>
                                    )}
                                  </div>
                                </div>
                              </div>
                            ))}
                          {room.childData &&
                            room.childData.map((child, childIndex) => (
                              <div key={childIndex}>
                                <div className={style.paxType}>
                                  child {childIndex + 1}
                                </div>
                                <div className={style.userDetails}>
                                  <div>
                                    <div>
                                      <p className={style.leadTravelerName}>
                                        First Name *
                                      </p>
                                    </div>
                                    <div className={style.userDetailsName}>
                                      <Dropdown className={style.dropDown}>
                                        <Dropdown.Toggle
                                          variant="success"
                                          id="dropdown-basic"
                                          className={style.toggleDropDown}
                                        >
                                          {child.title}
                                        </Dropdown.Toggle>

                                        <Dropdown.Menu>
                                          <Dropdown.Item
                                            href="#/action-1"
                                            onClick={(e) =>
                                              handlePaxDetailsChanged(
                                                e,
                                                roomIndex,
                                                adultIndex,
                                                2,
                                                "title",
                                                "Mr"
                                              )
                                            }
                                          >
                                            Mr
                                          </Dropdown.Item>
                                          <Dropdown.Item
                                            href="#/action-2"
                                            onClick={(e) =>
                                              handlePaxDetailsChanged(
                                                e,
                                                roomIndex,
                                                adultIndex,
                                                2,
                                                "title",
                                                "Mrs"
                                              )
                                            }
                                          >
                                            Mrs
                                          </Dropdown.Item>
                                          <Dropdown.Item
                                            href="#/action-3"
                                            onClick={(e) =>
                                              handlePaxDetailsChanged(
                                                e,
                                                roomIndex,
                                                adultIndex,
                                                2,
                                                "title",
                                                "Miss"
                                              )
                                            }
                                          >
                                            Miss
                                          </Dropdown.Item>
                                        </Dropdown.Menu>
                                      </Dropdown>
                                      <input
                                        type="text"
                                        className={style.userName}
                                        onInput={(e) => {
                                          e.target.value =
                                            e.target.value.replace(
                                              /[^A-Za-z .]/g,
                                              ""
                                            ); // Replace characters other than alphabets, spaces, and periods with empty string
                                        }}
                                        value={child && child.firstName}
                                        maxLength={30}
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
                                    {leadTravellerFirstNameError &&
                                      leadTravellerFirstNameError[roomIndex] &&
                                      leadTravellerFirstNameError[roomIndex][
                                        childIndex
                                      ] && (
                                        <p style={{ color: "red" }}>
                                          {
                                            leadTravellerFirstNameError[
                                              roomIndex
                                            ][childIndex].error
                                          }
                                        </p>
                                      )}
                                  </div>
                                  <div>
                                    <div>
                                      <p className={style.leadTravelerName}>
                                        Last name *
                                      </p>
                                    </div>
                                    <div className={style.userDetailsName}>
                                      <input
                                        type="text"
                                        className={style.userName}
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
                                    {leadTravellerLastNameError && (
                                      <p style={{ color: "red" }}>
                                        {leadTravellerLastNameError}
                                      </p>
                                    )}
                                  </div>
                                </div>
                              </div>
                            ))}
                        </>
                      ) : (
                        <>
                          {/* Render individual guest details for each room */}
                          <div className={style.paxType}>Lead Guest</div>
                          <div className={style.userDetails}>
                            <div>
                              <div>
                                <p className={style.leadTravelerName}>
                                  First Name *
                                </p>
                              </div>
                              <div className={style.userDetailsName}>
                                <Dropdown className={style.dropDown}>
                                  <Dropdown.Toggle
                                    variant="success"
                                    id="dropdown-basic"
                                    className={style.toggleDropDown}
                                  >
                                    {room.adultsData &&
                                      room.adultsData[0].title}
                                  </Dropdown.Toggle>

                                  <Dropdown.Menu>
                                    <Dropdown.Item
                                      href="#/action-1"
                                      onClick={(e) =>
                                        handlePaxDetailsChanged(
                                          e,
                                          roomIndex,
                                          0,
                                          1,
                                          "title",
                                          "Mr"
                                        )
                                      }
                                    >
                                      Mr
                                    </Dropdown.Item>
                                    <Dropdown.Item
                                      href="#/action-2"
                                      onClick={(e) =>
                                        handlePaxDetailsChanged(
                                          e,
                                          roomIndex,
                                          0,
                                          1,
                                          "title",
                                          "Mrs"
                                        )
                                      }
                                    >
                                      Mrs
                                    </Dropdown.Item>
                                    <Dropdown.Item
                                      href="#/action-3"
                                      onClick={(e) =>
                                        handlePaxDetailsChanged(
                                          e,
                                          roomIndex,
                                          0,
                                          1,
                                          "title",
                                          "Miss"
                                        )
                                      }
                                    >
                                      Miss
                                    </Dropdown.Item>
                                  </Dropdown.Menu>
                                </Dropdown>
                                <input
                                  type="text"
                                  className={style.userName}
                                  onInput={(e) => {
                                    e.target.value = e.target.value.replace(
                                      /[^A-Za-z .]/g,
                                      ""
                                    ); // Replace characters other than alphabets, spaces, and periods with empty string
                                  }}
                                  value={
                                    room.adultsData &&
                                    room.adultsData[0].firstName
                                  }
                                  maxLength={30}
                                  onChange={(e) =>
                                    handlePaxDetailsChanged(
                                      e,
                                      roomIndex,
                                      0,
                                      1,
                                      "firstName"
                                    )
                                  }
                                />
                              </div>
                              {leadTravellerFirstNameError && (
                                <p style={{ color: "red" }}>
                                  {leadTravellerFirstNameError}
                                </p>
                              )}
                            </div>
                            <div>
                              <div>
                                <p className={style.leadTravelerName}>
                                  Last name *
                                </p>
                              </div>
                              <div className={style.userDetailsName}>
                                <input
                                  type="text"
                                  className={style.userName}
                                  value={
                                    room.adultsData &&
                                    room.adultsData[0].lastName
                                  }
                                  onChange={(e) =>
                                    handlePaxDetailsChanged(
                                      e,
                                      roomIndex,
                                      0,
                                      1,
                                      "lastName"
                                    )
                                  }
                                />
                              </div>
                              {leadTravellerLastNameError && (
                                <p style={{ color: "red" }}>
                                  {leadTravellerLastNameError}
                                </p>
                              )}
                            </div>
                          </div>
                          <div className={style.userPhoneAndEmail}>
                            <div>
                              <div>
                                <p className={style.leadTravelerName}>
                                  Email *
                                </p>
                              </div>
                              <div className={style.userDetailsName}>
                                <input
                                  type="text"
                                  className={style.userName}
                                  onChange={(e) =>
                                    handleLeadTravellerEmailAndMobileNumberChanged(
                                      e,
                                      roomIndex,
                                      "email"
                                    )
                                  }
                                />
                              </div>
                              {leadTravellerEmailError && (
                                <p style={{ color: "red" }}>
                                  {leadTravellerEmailError}
                                </p>
                              )}
                            </div>
                            <div>
                              <div>
                                <p className={style.leadTravelerName}>
                                  Phone Number *
                                </p>
                              </div>
                              <div className={style.userDetailsName}>
                                <input
                                  type="text"
                                  className={style.userName}
                                  pattern="[0-9]{10}"
                                  onInput={(e) => {
                                    e.target.value = e.target.value.replace(
                                      /[^0-9]/g,
                                      ""
                                    ); // Replace non-numeric characters with empty string
                                  }}
                                  onChange={(e) =>
                                    handleLeadTravellerEmailAndMobileNumberChanged(
                                      e,
                                      roomIndex,
                                      "mobileNumber"
                                    )
                                  }
                                  maxLength={10}
                                />
                              </div>
                              {leadTravellerMobileNoError && (
                                <p style={{ color: "red" }}>
                                  {leadTravellerMobileNoError}
                                </p>
                              )}
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  ))}
                </div>
                <div className={style.guestCardsContainer}>
                  {renderGuestCards()}
                </div>
                <div className={style.continueButoonDiv}>
                  <div
                    className={style.continueButoon}
                    onClick={handleContinueClick}
                  >
                    {loading ? (
                      <FontAwesomeIcon
                        className={style.buttonSpinner}
                        icon={faSpinner}
                        style={{
                          maxHeight: "18px",
                          maxWidth: "18px",
                        }}
                        spin
                      />
                    ) : (
                      "Continue"
                    )}
                  </div>
                </div>
              </div>
             
            </div>
            {/*Booking Details Container 2 end */}
          </div>
        </div>
        <Footer />
      </div>
    </>
  );
}
