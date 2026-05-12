import Footer from "@/components/footer/footer";
import style from "./styles.module.css";
import showToast from "@/utils/toast";
import axios from "@/utils/axios/axios";
import { getTabSpecificData, setTabSpecificData } from "@/utils/axios/axios";
import config from "@/config";
import { useEffect } from "react";
import { useRouter } from "next/router";
import { useState } from "react";
import StarRating from "@/components/starRating";
import { getBookingDetails } from "../../../utils/bookingAPI";
import { savePaymentDetails } from "../../../utils/profileAPI";
import { generateInvoice } from "../../../utils/profileAPI";
import TabTitle from "@/components/tabtitles/tabtitle";
import useLocalStorage from "@/hooks/useLocalStorage";
import AmenitiesList from "@/components/amenity/amenityitem";
import Link from "next/link";
import WebSocketService from '../../webSocketService/WebSocketService';
import CommonHeader from "@/components/flights/commonHeader/commonHeader";
import B2CHeader from "@/components/flights/B2cHeader/Header";
import { useUserType } from "@/hooks/useUserType";
import Header from "@/components/corporate/auth/Header";
import Footer1 from "@/components/corporate/footerCorporate/footerCorporate";
import "tailwindcss/tailwind.css";
import { faCircleDown } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

export default function BookingConfirmation() {
  const router = useRouter();
  const corporateUser = useUserType();

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
  const daysOfWeek = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];
  const [hotelName, setHotelName] = useState("");
  const [hotelAddress, setHotelAddress] = useState("");
  const [bookingDetail, setBookingDetails] = useState("");
  // const [responseStatus, setResponseStatus] = useState([]);
  const [paymentStatus, setPaymentStatus] = useState("");
  const [elapsedTime, setElapsedTime] = useState(0);
  const [invoiceData, setInvoiceData] = useState("");

  const [fullName, setFullName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [amenities, setAmenities] = useState("");
  const [starRating, setStarRating] = useState("");
  const [roomDescription, setRoomDescription] = useState("");
  const [price, setPrice] = useState("");
  const [walletAmount, setWalletAmount] = useState("");
  const [totalAmountPaid, setTotalAmountPaid] = useState("");
  const [tax, setTax] = useState("");
  const [currency, setCurrency] = useState("");
  const [totalAmount, setTotalAmount] = useState("");
  const [getBookingId, setBookingId] = useLocalStorage("bookingId");
  const [getReserveBooking, setReserveBooking] = useLocalStorage("reserveBooking");
  const [bookingId, setBookingIdData] = useState();
  const [reservebooking, setReserveBookingData] = useState();
  const [rooms, setRooms] = useState();
  const [guest, setGuest] = useState();
  const [checkinDate, setCheckinDate] = useState();
  const [checkoutDate, setCheckoutDate] = useState();
  const [failedReason, setFailedReason] = useState();


  // const totalGuestsCount = parseInt(queryData.adults) + parseInt(queryData.children);

  const calculateNoOfNights = (checkin, checkout) => {

    const oneDay = 24 * 60 * 60 * 1000; // Number of milliseconds in a day
    const [checkinYear, checkinMonth, checkinDay] = checkin.split("-");
    const [checkoutYear, checkoutMonth, checkoutDay] = checkout.split("-");

    const checkInDate = new Date(checkinYear, checkinMonth - 1, checkinDay);
    const checkOutDate = new Date(checkoutYear, checkoutMonth - 1, checkoutDay);

    const timeDifference = checkOutDate.getTime() - checkInDate.getTime();
    const noOfNights = Math.ceil(timeDifference / oneDay).toString();
    return noOfNights;
  };

  const [responseStatus, setResponseStatus] = useState(() => {
    if (typeof window !== "undefined") {
      // Initialize with the value from localStorage if available, else empty string.
      return getTabSpecificData("bookingStatus") || "";
    }
    return "";
  });

  useEffect(() => {
    const bookingId = getTabSpecificData("bookingId");
    const reserveBooking = getTabSpecificData("reserveBooking");
    setBookingIdData(bookingId);
    setReserveBookingData(reserveBooking);
    if (typeof window !== "undefined") {
      const storedBookingStatus = getTabSpecificData("bookingStatus") || "";

      setResponseStatus(storedBookingStatus);
    }
  }, []);

  useEffect(() => {
    const webSocketService = new WebSocketService();
    getBookingDetailsCall(bookingId);

    const topic = `/topic/${bookingId}`;

    const callback = (message, context) => {
   
      getBookingDetailsCall(bookingId);
    };

    webSocketService.connect(topic, callback, {});

    return () => {
      webSocketService.disconnect();
    };
  }, [bookingId]);

  useEffect(() => {
    if (reservebooking === "false") {
      savePaymentDetailsApiCall(bookingId);
    } else {
      setPaymentStatus("SUCCESS");
    }
  }, [reservebooking]);

  // Changing checkin date format to show in UI
  let formattedCheckinDate;
  let checkInDayOfWeek;
  let checkinDay;
  let checkinMonth;
  let checkinYear;
  if (checkinDate) {
    checkinDay = checkinDate.split("-")[2];
    checkinMonth = checkinDate.split("-")[1];
    checkinYear = checkinDate.split("-")[0];

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
  if (checkoutDate) {
    checkoutDay = checkoutDate.split("-")[2];
    checkoutMonth = checkoutDate.split("-")[1];
    checkoutYear = checkoutDate.split("-")[0];

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
  if (checkoutDate || checkinDate) {
    noOfNight = calculateNoOfNights(checkinDate, checkoutDate);
  }

  const API_CALL_INTERVAL = 4000; // 1 second
  const MAX_WAIT_TIME = 30000;

  useEffect(() => {
    window.history.pushState(null, null, location.href);
    window.onpopstate = function () {
      window.history.go(1);
    };

    return () => {
      window.onpopstate = null;
    };
  }, []);

  const foramtDate = (dateString) => {
    const date = new Date(dateString);
    const day = date.getDate();
    const month = date.toLocaleString("default", { month: "short" });
    const year = date.getFullYear();
    let hours =
      date.getHours() < 10 ? `0${date.getHours() % 12}` : date.getHours() % 12;
    hours == "00" ? (hours = "12") : (hours = hours);
    const minutes = String(date.getMinutes()).padStart(2, "0");
    const ampm = date.getHours() >= 12 ? "PM" : "AM";
    const formattedDate = `${getDayWithSuffix(
      day
    )} ${month} ${year}, ${hours}:${minutes} ${ampm}`;
    return formattedDate;
  };


  const getBookingDetailsCall = async (bookingId) => {
    try {
      const bookingDetailsResp = await getBookingDetails(bookingId);
     

      setBookingDetails(bookingDetailsResp);
      setRooms(bookingDetailsResp?.data?.BookingMasterData?.NoOfRooms);
      setGuest(bookingDetailsResp?.data?.BookingMasterData?.NumberOfGuests);
      setCheckinDate(bookingDetailsResp?.data?.BookingMasterData?.CheckInDate);
      setCheckoutDate(bookingDetailsResp?.data?.BookingMasterData?.CheckOutDate);
      const status = bookingDetailsResp.message;

      setResponseStatus(status);
      let errorMsg = bookingDetailsResp?.error?.ErrorMsg;
      if (errorMsg === "Agency do not have enough balance.") {
        // Do nothing or explicitly set to null to ensure no message is displayed
        errorMsg = null; // or an empty string if required
      }

      if (errorMsg) {
        setFailedReason(errorMsg); // Only set failed reason if there's an error message
      } else {
        setFailedReason(""); // Optionally clear the message if it's empty
      }
      // setFailedReason(errorMsg);
     
      const hotelname = bookingDetailsResp.data.GetBookingDetailResult.HotelName;
      setHotelName(hotelname);
      const address = bookingDetailsResp.data.GetBookingDetailResult.AddressLine1;
      setHotelAddress(address);
      const firstName = bookingDetailsResp.data.GetBookingDetailResult.HotelRoomsDetails[0].HotelPassenger[0].FirstName;
      const lastName = bookingDetailsResp.data.GetBookingDetailResult.HotelRoomsDetails[0].HotelPassenger[0].LastName;
      const middleName = bookingDetailsResp.data.GetBookingDetailResult.HotelRoomsDetails[0].HotelPassenger[0].MiddleName;
      const fullName = [firstName, middleName, lastName].filter(Boolean).join(" ");
      setFullName(fullName);
      const phoneNumber = bookingDetailsResp.data.GetBookingDetailResult.HotelRoomsDetails[0].HotelPassenger[0].Phoneno;
      setPhoneNumber(phoneNumber);
      const amenities = bookingDetailsResp.data.GetBookingDetailResult.HotelRoomsDetails[0].Amenities[0];
      setAmenities(amenities);
      const starRating = bookingDetailsResp.data.GetBookingDetailResult.StarRating;
      setStarRating(starRating);
      const roomDescription = bookingDetailsResp.data.GetBookingDetailResult.HotelRoomsDetails[0].RoomDescription;
      setRoomDescription(roomDescription);
      
      const price = bookingDetailsResp.data.BookingMasterData.TotalBookingAmount;
      setPrice(price);
      setWalletAmount(bookingDetailsResp.data.BookingMasterData.WalletAmount);
      setTotalAmountPaid(bookingDetailsResp.data.BookingMasterData.PaidAmount);
      const tax = bookingDetailsResp.data.BookingMasterData.TotalGstAmount;
      const formattedTax = parseFloat(tax).toFixed(2);
      setTax(formattedTax);
      const parsedPrice = parseFloat(price);
      const totalAmount = parsedPrice - parseFloat(formattedTax);
   
      const currencycode = bookingDetailsResp.data.GetBookingDetailResult.HotelRoomsDetails[0].Price.CurrencyCode;
      setCurrency(currencycode);
      
      const roundedTotalAmount = Math.round(totalAmount);
      setTotalAmount(roundedTotalAmount);
      if (bookingDetail?.data?.BookingMasterData?.
        BookingStatus !== "Reserved")
        setReserveBookingData("false");
      if (bookingDetailsResp.data.BookingMasterData.WalletPaymentStatus === "SUCCESS" || bookingDetailsResp.data.BookingMasterData.paymentStatus === "SUCCESS")
        setPaymentStatus("SUCCESS");
      if (
        status !== "SUCCESS" &&
        status !== "FAILED" &&
        status !== "Failed" &&
        elapsedTime < MAX_WAIT_TIME
      ) {
        setTimeout(makeApiCall, API_CALL_INTERVAL);
      }
    } catch (error) {
      console.error("Error making API call:", error);
    }
  };

  const savePaymentDetailsApiCall = async (bookingId) => {
    try {
      const savePaymentDetailsRes = await savePaymentDetails(bookingId);
      setPaymentStatus(savePaymentDetailsRes.data.payment_status);
    } catch (error) {
      console.error("Error making API call:", error);
    }
  };

  // Function to handle room preference checkbox changes
  const fetchAndDownloadInvoice = async () => {
    try {
      const invoiceData = await generateInvoice(bookingId);
      const pdfData = invoiceData; // Binary PDF data

      const blob = new Blob([pdfData], { type: "application/pdf" });

      // Trigger download
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = "INV_" + bookingId + ".pdf";
      link.click();

      URL.revokeObjectURL(link.href);
    } catch (error) {
      console.error("Error fetching invoice data:", error);
    }
  };


  const downloadTicket = async () => {
    try {
      const response = await axios.get(`${config.DOWNLOAD_TICKET}`, {
        params: { bookingId, travelCategory: 1 },
        responseType: "blob",
      });
      if (response && response.data instanceof Blob && response.data.size > 0) {
        let fileName = "HOTEL_VOUCHER_" + bookingId + ".pdf";

        const blob = new Blob([response?.data], {
          type: "application/pdf",
        });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.style.display = "none";
        a.href = url;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        return;
      }
      showToast("error", `File corrupted or no data found`);
    } catch (error) {
      console.log(error);
      showToast("error", "Something went wrong while downloading Ticket.");
    }
  };

  return (
    <div>
      {!corporateUser ? (
        // <CommonHeader />
        <B2CHeader/>
      ) : (
        <div style={{ backgroundColor: "#ffffff" }}>
          <Header />
        </div>
      )}

      {responseStatus === "SUCCESS" ? (
        <>
          <TabTitle title={"Booking Confirmation"}></TabTitle>
          {/* <HotelSearchShort /> */}
          <div className={style.bookingDetailsContainer}>
            <div className={style.bookingProcessDetails}>
              <div className={style["details-head"]}>
                <div
                  className={style.bookingProcess}
                  style={{ color: "Green" }}
                >
                  Booking Success
                </div>
                <p>
                  Booking details will be sent on your contact number and email.
                </p>
                {paymentStatus != "FAILED" &&
                  bookingDetail?.data?.BookingMasterData?.
                    BookingStatus === "Reserved" ? (
                  <p style={{ color: "red" }}>
                    Note: Your Reservation Expires on{" "}
                    {foramtDate(
                      bookingDetail?.data?.GetBookingDetailResult
                        ?.LastVoucherDate
                    )}
                    . Please make payment before{" "}
                    {foramtDate(
                      bookingDetail?.data?.GetBookingDetailResult
                        ?.LastVoucherDate
                    )}
                    .
                  </p>
                ) : (
                  <></>
                )}
                {paymentStatus === "FAILED" &&
                  bookingDetail?.data?.BookingMasterData?.
                    BookingStatus === "Reserved" ? (
                  <p style={{ color: "red" }}>
                    Note: Payment Failed. please make payment before{" "}
                    {foramtDate(
                      bookingDetail?.data?.GetBookingDetailResult
                        ?.LastVoucherDate
                    )}{" "}
                    to confirm your booking.
                  </p>
                ) : (
                  <></>
                )}
              </div>
              {/*Booking Confirmation Container 1 start */}
              <div className={style.bookingDetailsContainer1}>
                <div>
                  <div>
                    <div className={style.bookingDetails}>Booking Details</div>
                  </div>
                  <div>
                    <div className={style.bookingStatusText}>
                      Booking Status :{" "}
                      {
                        bookingDetail?.data?.BookingMasterData?.
                          BookingStatus
                      }
                    </div>
                    <div className={style.qTravelBookingId}>
                      Booking Id : {bookingId}
                    </div>
                    <div className={style.bookingId}>
                      PNR :{" "}
                      {bookingDetail?.data?.GetBookingDetailResult?.BookingId}
                    </div>
                  </div>
                </div>
                <div>
                  <div>
                    <div className={style.guestDetails}>Lead Guest Details</div>
                  </div>
                  <div>
                    <div className={style.guestFirstName}>
                      Name :{fullName}

                    </div>
                    <div className={style.guestMobileNumber}>
                      Mobile Number :{phoneNumber}

                    </div>
                  </div>
                </div>
              </div>

              <div className={style.bookingDetailsContainer1}>
                <div>
                  <div className={style.hotelDetails}>
                    <p className={style.hotelName}>{hotelName}</p>
                    <p className={style.hotelAddress}>{hotelAddress}</p>
                    <StarRating rating={starRating} />
                  </div>
                  <div className={style.stayDetails}>
                    <div className={style.stayDetailsData}>
                      <div className={style.checkInDetails}>
                        <p className={style.checkIn}>Check-In</p>
                        <p className={style.checkInDate}>
                          {formattedCheckinDate},
                          <br /> {checkinYear}
                        </p>
                        <p className={style.checkInTime}>{checkInDayOfWeek}</p>
                      </div>
                      <div className={style.stayDaysDetail}>
                        <p className={style.stayDays}>
                          {noOfNight} {noOfNight > 1 ? "Nights" : "Night"}
                        </p>
                      </div>
                      <div className={style.checkOutDetails}>
                        <p className={style.checkOut}>Check-Out</p>
                        <p className={style.checkOutDate}>
                          {formattedCheckoutDate},
                          <br /> {checkoutYear}
                        </p>
                        <p className={style.checkOutTime}>
                          {checkOutDayOfWeek}
                        </p>
                      </div>
                    </div>
                    <div className={style.roomDetailsData}>
                      <p>
                        {noOfNight} {noOfNight > 1 ? "Nights" : "Night"} |{" "}
                        {rooms && rooms === "1"
                          ? "1 Room"
                          : `${rooms && rooms} Rooms`}{" "}
                        | {guest} {guest > 1 ? "Guests" : "Guest"}
                      </p>
                    </div>
                  </div>
                </div>
                <div>
                  <div>
                    <div className={style.guestDetails}></div>
                    <div className="flex justify-end gap-2">
                      {bookingDetail?.data?.BookingMasterData?.
                        BookingStatus ===
                        "Confirmed" && (
                          <div className="bg-[#028fa3] cursor-pointer w-fit text-white text-xs md:text-base font-medium py-1 px-2 rounded-lg"
                            onClick={downloadTicket}>
                            <FontAwesomeIcon
                              icon={faCircleDown}
                              className="text-xs md:text-base"
                            />{" "}Voucher</div>)}
                      <div className={style.downloadImageDiv}>
                        {paymentStatus != "FAILED" &&
                          bookingDetail?.data?.BookingMasterData?.
                            BookingStatus !== "Reserved" ? (
                          <a className="bg-[#028fa3] w-fit text-white text-xs md:text-base font-medium py-1 px-2 rounded-lg" href="#" onClick={fetchAndDownloadInvoice}>
                            <FontAwesomeIcon
                              icon={faCircleDown}
                              className="text-xs md:text-base"
                            />{" "}invoice
                          </a>
                        ) : (
                          <></>
                        )}
                        {invoiceData && (
                          <div>
                            <iframe
                              src={URL.createObjectURL(
                                new Blob([invoiceData], {
                                  type: "application/pdf",
                                })
                              )}
                              width="100%"
                              height="500px"
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  <div>
                    <div className={style.priceDetails}>
                      <p className={style.priceBrekup}>Price Breakup</p>
                      <p className={style.perVillaPrice}>
                        Room Price : {totalAmount} {currency}
                      </p>
                      <p className={style.taxes}>
                        Taxes :{tax} {currency}
                      </p>
                      {bookingDetail?.data?.BookingMasterData?.
                        BookingStatus === "Reserved" && <p className={style.totalAmountToBepaid}>
                          Total Amount To Be Paid : {price} {currency}
                        </p>}
                      {bookingDetail?.data?.BookingMasterData?.
                        BookingStatus !== "Reserved" && <p className={style.totalAmountToBepaid}>
                          Total Booking Amount :
                          {Number(price)?.toLocaleString()} {currency}
                        </p>}
                      {walletAmount > 0 && bookingDetail?.data?.BookingMasterData?.
                        BookingStatus !== "Reserved" && <p className={style.totalAmountToBepaid}>
                          Wallet Amount Paid :
                          {Number(walletAmount)?.toLocaleString()} {currency}
                        </p>}
                      {bookingDetail?.data?.BookingMasterData?.
                        BookingStatus !== "Reserved" && <p className={style.totalAmountToBepaid}>
                          Total Amount Paid :
                          {Number(totalAmountPaid)?.toLocaleString()} {currency}
                        </p>}
                    </div>
                  </div>
                </div>
              </div>

              <div className={style.bookingDetailsContainer1}>
                {bookingDetail.data.GetBookingDetailResult.HotelRoomsDetails.map((room, index) => (
                  <div className={style.hotelDetailsData} key={index}>
                    <p className={style.hotelDetailsRoomSize}>
                      {/* {room.roomTypeName} */}
                      {roomDescription}
                    </p>
                    <p className={style.hotelDetailsRoomIncludes}>
                      This room includes:
                    </p>
                    <div>
                      {/* Use the AmenitiesList component */}
                      <AmenitiesList amenities={room.Amenity} />
                    </div>
                  </div>
                ))}
              </div>

            </div>
          </div>

        </>
      ) : responseStatus === "FAILED" || responseStatus === "Failed" ? (
        // } else if (paymentStatus === "FAILED" || responseStatus === "FAILED") {
        <>

          <div className={style.bookingDetailsContainer}>
            <div className={style.bookingProcessDetails}>
              <div className={style.bookingProcess} style={{ color: "red" }}>
                Booking Failed
              </div>
              <div className={style.bookingDetailsContainer1}>
                <div>
                  <div>
                    <div className={style.failedbookingDetails}>
                      {failedReason}
                    </div>
                  </div>
                  <div>
                    <div className={style.failedbookingDetails}>
                      We apologize, but your booking could not be processed
                    </div>
                  </div>

                  <div>
                    <div className={style.bookingStatusText1}>
                      Booking Status: {responseStatus}
                    </div>
                    <div className={style.qTravelBookingId1}>
                      QUGO Booking Id: {bookingId}
                    </div>
                    <div className={style.bookingId}>
                      <p >
                        For support, Contact us on{" "}
                        <a href="tel:+917204186969">+917204186969</a> or{" "}
                        <a href="mailto:info@qugo.io">info@qugo.io</a>
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      ) : (paymentStatus === "FAILED" && responseStatus !== "" && responseStatus !== "SUCCESS") ? (
        <>
          <div className={style.paymentFailed}>
            <div>
              <div className={style.paymentMessage}>
                Oops ! your last payment was failed. Please click on Retry Payment
                button to try again.
              </div>
              <div className={style.paymentFailedButton}>
                <Link className={style.retryButtonLink} href={"/newBookingPage"}><div className={style.retryButton}>Retry Payment</div></Link>
              </div>
              <div className={style.goToHomeLink}><Link className={style.goToHomeLinkTab} href={"/"}>Go To Home</Link></div>
            </div>
          </div>
        </>
      ) : (
        <>
          <div className={style.bookingConfiramtionWaiting}>
            <div>
              <div className={style.waiting}>Waiting</div>
              <div className={style.waitingConfiramtin}>
                {" "}
                for booking confirmation from the Hotel
              </div>
            </div>
          </div>
        </>
      )}
      {!corporateUser ? (
        <Footer />
      ) : (
        <Footer1 />
      )}
    </div>
  );
}
