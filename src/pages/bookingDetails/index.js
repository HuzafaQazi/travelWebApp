import Footer from "@/components/footer/footer";
import style from "./styles.module.css";
// import line from "../../images/line.png";
import { useRouter } from "next/router";
import { useState, useEffect, useRef } from 'react';
import StarRating from "@/components/starRating";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCaretDown, faCircleDown, faTimesCircle } from "@fortawesome/free-solid-svg-icons";
import { faCaretRight } from "@fortawesome/free-solid-svg-icons";
import { getBookingDetails } from "../../../utils/bookingAPI";
import { sendChangeRequest, getRefundStatus } from "../../../utils/profileAPI";
import { generateInvoice } from "../../../utils/profileAPI";
import { getPaymentGateway, getPaymentSessionID } from "../../../utils/bookingAPI";
import { routeToPg } from "@/paymentGateways/pgRouting";
import TabTitle from "@/components/tabtitles/tabtitle";
import useLocalStorage from "@/hooks/useLocalStorage";
import AmenitiesList from "@/components/amenity/amenityitem";
import Link from "next/link";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { getWalletBalance } from "../../../utils/walletApis";
import CommonHeader from "@/components/flights/commonHeader/commonHeader";
import B2CHeader from "@/components/flights/B2cHeader/Header";
import { confirmPaymentHotels } from "../../../utils/walletApis";
import { getUserStatus } from "@/utils/userStatus";
import { useLogin } from "@/store/context/LoginContext";
import axios, { getTabSpecificData, handleLogout } from "@/utils/axios/axios";
import { useUserType } from "@/hooks/useUserType";
import Header from "@/components/corporate/auth/Header";
import Footer1 from "@/components/corporate/footerCorporate/footerCorporate";

import config from "@/config";
import showToast from "@/utils/toast";
import "tailwindcss/tailwind.css";



export default function BookingDetails(props) {
  const corporateUser = useUserType();
  const router = useRouter();

  const { bookingId } = router.query;

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

  const [hotelRooms, setHotelRooms] = useState([]);

  const [bookingDetail, setBookingDetails] = useState();
  // const [responseStatus, setResponseStatus] = useState([]);
  const [paymentStatus, setPaymentStatus] = useState("");
  const [walletPaymentStatus, setWalletPaymentStatus] = useState("");
  const [invoiceData, setInvoiceData] = useState("");
  const [invoiceNumber, setInvoiceNumber] = useState("");

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
  const [getReserveBooking, setReserveBooking] = useLocalStorage("reserveBooking");

  const [reservebooking, setReserveBookingData] = useState();
  const [rooms, setRooms] = useState();
  const [guest, setGuest] = useState();
  const [checkinDate, setCheckinDate] = useState();
  const [checkoutDate, setCheckoutDate] = useState();
  const [showContent, setShowContent] = useState(true);
  const [isProceeded, setProceeded] = useState(false);
  const [hotelBookingStatus, setHotelBookingStatus] = useState();
  const [showPopup, setShowPopup] = useState(false);
  const [popupPosition, setPopupPosition] = useState({ top: 0, left: 0 });
  const [refundStatus, setRefundStatus] = useState('Pending');
  const [refundAmount, setrefundAmount] = useState();
  const [walletRefundAmount, setWalletRefundAmount] = useState("");
  const [walletRefundStatus, setWalletRefundStatus] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isLoading1, setIsLoading1] = useState(false);
  const [walletBalance, setWalletBalance] = useState("");
  const [walletSelected, setWalletSelected] = useState(false);
  const [amountPayable, setAmountPayable] = useState();
  const [isPaymentPopup, setIsPaymentPopup] = useState(false);
  const [isToastVisible, setIsToastVisible] = useState(false);
  const [getPhoneNumber, setUserPhoneNumber] = useLocalStorage("phoneNumber");
  const [getUserID, setUserID] = useLocalStorage("userID");
  const popupRef = useRef(null);

  // const totalGuestsCount = parseInt(queryData.adults) + parseInt(queryData.children);
  const handleClickOutside = (event) => {
    if (popupRef.current && !popupRef.current.contains(event.target)) {
 
      setShowPopup(false);

    }
  };
  const handlePaymentPopup = async (e) => {
    e.stopPropagation();
    setAmountPayable(bookingDetail.data.BookingMasterData.TotalBookingAmount);
    const resp = await getWalletBalance(getTabSpecificData("userID"));

    if (resp.status === "SUCCESS") {
      setWalletBalance(resp.data.balance);
    }
    setIsPaymentPopup(!isPaymentPopup);
  }


  const handleClose = () => {
    setIsPaymentPopup(false);
  };

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
    const reserveBooking = getTabSpecificData("reserveBooking");
    setReserveBookingData(reserveBooking);
    if (typeof window !== "undefined") {
      const storedBookingStatus = getTabSpecificData("bookingStatus") || "";

      setResponseStatus(storedBookingStatus);
    }
    window.addEventListener('click', handleClickOutside);

    return () => {
      window.removeEventListener('click', handleClickOutside);
    };
  }, []);

  useEffect(() => {

    if (bookingId != undefined) {

      getBookingDetailsCall(bookingId);
    }
  }, [bookingId]);

  useEffect(() => {

  }, [walletSelected]);

  useEffect(() => {
    if (isPaymentPopup) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "visible";
    }

    return () => {
      document.body.style.overflow = "visible";
    };
  }, [isPaymentPopup]);

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
  const toggleContent = () => {
    setShowContent(!showContent);
  };
  const checkwallet = async (e) => {

    e.stopPropagation();
    if (walletSelected) {
      setWalletSelected(false);
      setAmountPayable(bookingDetail.data.BookingMasterData.TotalBookingAmount);
    } else {
      setWalletSelected(true);
      let payable = 0;
      if (bookingDetail.data.BookingMasterData.TotalBookingAmount > walletBalance) {
        payable = bookingDetail.data.BookingMasterData.TotalBookingAmount - walletBalance;
      }
      setAmountPayable(payable);

    }

  };
  const completePayment = async (e) => {
    setIsLoading1(true)

    e.stopPropagation();
    const userId = getTabSpecificData("userID");
    const reponse = await getUserStatus(userId);


    if (reponse.data.status === 'inactive') {

      await handleLogout();
      return;
    }
    const data = await getPaymentGateway();

    if (data.status === "SUCCESS") {
      if (amountPayable > 0) {
        const phoneNumber = getTabSpecificData("phoneNumber");
        let getPaymeneSessionIDResp = await getPaymentSessionID(
          null,
          Math.max(0,bookingDetail.data.BookingMasterData.TotalBookingAmount - amountPayable),
          0,
          "BOOKING",
          bookingId,
          amountPayable,
          phoneNumber,
          data.data.pgCode,
        );

        if (getPaymeneSessionIDResp !== null && getPaymeneSessionIDResp.data.data.paymentSessionId !== "") {
          routeToPg(data.data.pgCode, getPaymeneSessionIDResp.data.data.paymentSessionId, {}, bookingId,
            1,
            "BOOKING");
        }
      } else {
        let confirmReq = {
          bookingId: bookingId,
          paymentRefernceId: getTabSpecificData("userID"),
          paymentStatus: "SUCCESS",
          paymentAmount: amountPayable,
          pgCode: data.data.pgCode,
          walletAmount: bookingDetail.data.BookingMasterData.TotalBookingAmount - amountPayable
        };
        const resp = await confirmPaymentHotels(confirmReq);
        if (resp) {
          router.push(
            "/confirmationbooking"
            // query: queryParams,
          );
        }
      }
    }
    setIsLoading1(false)
  };

  const handleRefundStatusClick = async (e) => {


    if (bookingDetail?.data?.BookingMasterData?.RefundAmount > 0) {

      try {
        let refundResponse = {
          status: "SUCCESS"
        };
        if (bookingDetail?.data?.BookingMasterData?.PaidRefundAmount > 0) {
          refundResponse = await getRefundStatus(bookingId);
        }

        if (
          refundResponse !== null && refundResponse?.status == 'SUCCESS'
          // refundResponse.data.HotelChangeRequestResult.ResponseStatus == 1
        ) {
          e.preventDefault();
          const rect = e.target.getBoundingClientRect();
          setPopupPosition({ top: rect.bottom, left: rect.left });
          // setShowPopup(true);
          setShowPopup((prevShowPopup) => !prevShowPopup);
          if (refundResponse?.data?.refundAmount) {
            setrefundAmount(refundResponse.data.refundAmount);
            setRefundStatus(refundResponse.data.refundStatus);
          }
        }
        else {
          if (!isToastVisible) {
            if (bookingDetail?.data?.BookingMasterData?.PaidAmount > 0) {
              toast("Failed to fetch refund status. Please Try again");
              setIsToastVisible(true);
            }

            // Reset the flag after a specific duration (e.g., 3 seconds)
            setTimeout(() => {
              setIsToastVisible(false);
            }, 6000);
          }

        }

      }
      catch (error) {
       
        toast("Failed to fetch refund status");
      }
    } else {
      e.preventDefault();
      const rect = e.target.getBoundingClientRect();
      setPopupPosition({ top: rect.bottom, left: rect.left });

      setShowPopup((prevShowPopup) => !prevShowPopup);
    }
  };


  const getBookingDetailsCall = async (bookingId) => {
    try {
      const bookingDetailsResp = await getBookingDetails(bookingId);
      if (bookingDetailsResp.status == "SUCCESS") {
        setBookingDetails(bookingDetailsResp);
        
        setRooms(bookingDetailsResp?.data?.BookingMasterData?.NoOfRooms);
        setGuest(bookingDetailsResp?.data?.BookingMasterData?.NumberOfGuests);
        setPaymentStatus(bookingDetailsResp?.data?.BookingMasterData?.PaymentStatus);
        setWalletPaymentStatus(bookingDetailsResp?.data?.BookingMasterData?.walletPaymentStatus);
        setCheckinDate(bookingDetailsResp?.data?.BookingMasterData?.CheckInDate);
        setCheckoutDate(bookingDetailsResp?.data?.BookingMasterData?.CheckOutDate);
        setHotelBookingStatus(bookingDetailsResp?.data?.BookingMasterData?.BookingStatus);
        const status = bookingDetailsResp.message;
     
        setResponseStatus(status);
        setInvoiceNumber(bookingDetailsResp?.data?.BookingMasterData?.InvoiceNo);

        const hotelname = bookingDetailsResp.data.GetBookingDetailResult.HotelName;
        setHotelName(hotelname);
        const address = bookingDetailsResp.data.GetBookingDetailResult.AddressLine1;
        setHotelAddress(address);
        setHotelRooms(bookingDetailsResp.data.GetBookingDetailResult.HotelRoomsDetails);
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
        setWalletRefundStatus(bookingDetailsResp.data.BookingMasterData.WalletRefundStatus);
        setWalletRefundAmount(bookingDetailsResp.data.BookingMasterData.WalletRefundAmount),
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
        if (!walletSelected)
          setAmountPayable(bookingDetailsResp.data.BookingMasterData.TotalBookingAmount);
      }
    } catch (error) {
      console.error("Error making API call:", error);
    }
  };


  const handlePopupClick = (e) => {
    e.stopPropagation();
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

  const cancelBooking = async (e) => {
    if (isLoading) return;
    setIsLoading(true);
    try {
      // setPopupVisible(false);
      // setShowCancellationPolicy(false);
      // sendChangeRequest(props.booking.BookingId, 'no remarks');
      e.stopPropagation();
      let cancelResponse = await sendChangeRequest(bookingId, 'no remarks');
      if (
        cancelResponse !== null &&
        cancelResponse.data.data.HotelChangeRequestResult.ResponseStatus == 1
      ) {
        getBookingDetailsCall(bookingId);
        setHotelBookingStatus("Cancelled");
        toast("Booking cancelled successfully");
        // window.location.reload();
      }
      else {

        // window.location.reload();
        toast("Failed to cancel your booking");
      }

    }
    catch (error) {
      // window.location.reload();
      console.log("here2: ", error);
      toast("Failed to cancel your booking");
    }
    finally {
      setIsLoading(false); // Reset loading state after the process is done
    }
  };
  function addOfferedPriceRoundedOff(roomList) {
    let totalOfferedPriceRoundedOff = 0;
    let currencyCode = ""; // Variable to store the currency code

    for (const room of roomList) {
      const { price } = room;
      const { offeredPrice, currencyCode: roomCurrencyCode } = price; // Destructure the currency code

      currencyCode = roomCurrencyCode; // Store the currency code for each room
      const offeredPriceRoundedOff = Math.round(offeredPrice);

      room.price = {
        ...price,
        offeredPriceRoundedOff,
      };

      totalOfferedPriceRoundedOff += offeredPriceRoundedOff;
    }

    return `${totalOfferedPriceRoundedOff} ${currencyCode}`;
  }

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
      <>
        <TabTitle title={"Booking Confirmation"}></TabTitle>
        {/* <HotelSearchShort /> */}
        <div className={style.bookingDetailsContainer}>
          <div className={style.bookingProcessDetails}>
            <div className={style["details-head"]}>
              <div
                className={style.bookingProcess}
                style={{ color: "Black" }}
              >
                Booking Details
              </div>
              {paymentStatus != "FAILED" &&
                hotelBookingStatus === "Reserved" ? (
                <p style={{ color: "red" }}>
                  Note: Your Reservation {new Date(bookingDetail?.data?.GetBookingDetailResult
                    ?.LastVoucherDate) > new Date() ? "Expires" : "Expired"} on{" "}
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
                hotelBookingStatus === "Reserved" ? (
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
                      hotelBookingStatus
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
                        {checkinYear}
                      </p>
                      <p className={style.checkInTime}>{checkInDayOfWeek}</p>
                    </div>
                    <div className={style.stayDaysDetail}>
                      <p className={style.stayDays}>
                        {noOfNight} {noOfNight > 1 ? "Nights" : "Night"}
                      </p>
                      <hr className={style.thinhr} />
                    </div>
                    <div className={style.checkOutDetails}>
                      <p className={style.checkOut}>Check-Out</p>
                      <p className={style.checkOutDate}>
                        {formattedCheckoutDate},
                        {checkoutYear}
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
                      {hotelBookingStatus == 'Confirmed' ? (
                        <a  className="bg-[#028fa3] w-fit text-white text-xs md:text-base font-medium py-1 px-2 rounded-lg"  href="#" onClick={fetchAndDownloadInvoice}>
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

                    {hotelBookingStatus === "Reserved" && <p className={style.totalAmountToBepaid}>
                      Total Amount To Be Paid : {price} {currency}
                    </p>}
                    {hotelBookingStatus !== "Reserved" && <p className={style.totalAmountToBepaid}>
                      Total Booking Amount :
                      {price} {currency}
                    </p>}
                    {walletAmount > 0 && hotelBookingStatus !== "Reserved" && <p className={style.totalAmountToBepaid}>
                      Wallet Amount Paid :
                      {walletAmount} {currency}
                    </p>}
                    {hotelBookingStatus !== "Reserved" && <p className={style.totalAmountToBepaid}>
                      Total Amount Paid :
                      {totalAmountPaid} {currency}
                    </p>}
                    <div className={style.container}>
                      {(hotelBookingStatus === 'Cancelled' || hotelBookingStatus === 'FAILED') && (paymentStatus == 'SUCCESS' || walletPaymentStatus == "SUCCESS") ? (
                        (<div className={style.refundstatus} onClick={handleRefundStatusClick} ref={popupRef}>
                          Refund status
                        </div>)) : <></>}

                      {showPopup && (
                        <div className={style.popup}>
                          <div className={style.popupContent}>
                            {/* Your popup content goes here */}
                            {(walletRefundAmount > 0 || refundAmount > 0) ? (<div>
                              {walletRefundAmount > 0 && <div>Wallet Refund status:{' '}
                                <span className={style.success}>
                                  {walletRefundStatus}
                                </span>
                              </div>}
                              {walletRefundAmount > 0 && <div>Wallet Refund Amount:{' '}
                                <span className={style.success}>
                                  Rs. {walletRefundAmount}
                                </span>
                              </div>}
                              {refundAmount > 0 && <div>Refund status:{' '}
                                <span className={style.success}>
                                  {refundStatus}
                                </span>
                              </div>}
                              {refundAmount > 0 && <div>Refund Amount:{' '}
                                <span className={style.success}>
                                  Rs. {refundAmount}
                                </span>
                              </div>}
                            </div>) :
                              <div className={style.success}>
                                Due to 100% cancellation charges, there will be no refund.
                              </div>
                            }
                          </div>
                        </div>
                      )}</div>
                    {(new Date(bookingDetail?.data?.GetBookingDetailResult
                      ?.LastVoucherDate) > new Date() && hotelBookingStatus === 'Reserved') ? (<button className={style.cancelOption} onClick={cancelBooking}>Cancel Reservation</button>) : <></>}
                    {(new Date(bookingDetail?.data?.GetBookingDetailResult
                      ?.LastVoucherDate) > new Date() && hotelBookingStatus === 'Reserved') ? (<button className={style.payButton} onClick={handlePaymentPopup}>Proceed to Pay</button>) : <></>}
                    {isPaymentPopup && <div className={style.popupOverlay}>
                      <div onClick={handlePopupClick} className={style.popupContent}>
                        <div> <FontAwesomeIcon
                          icon={faTimesCircle}
                          className={style.closeIcon}
                          onClick={handleClose}
                        /></div>
                        <div className={style.walletSection}>
                          <div>
                            {walletBalance > 0 && <input type="checkbox" id="useWallet" name="useWallet" onChange={checkwallet} />}
                            {walletBalance > 0 && <label htmlFor="useWallet" className={style.useWalletLabel} >
                              Use wallet payment
                            </label>}
                          </div>
                          <div className={style.walletBalance}>
                            <span>Wallet Balance: Rs.</span>
                            <span className={style.balanceAmount}>{walletBalance}</span>
                            <Link
                              href={{
                                pathname: '/walletDetails',
                                query: {
                                  fromPage: typeof window !== 'undefined' ? window.location.pathname + `?bookingId=${bookingId}` : "/walletDetails",
                                },
                              }}
                              as={`/walletDetails`}
                            >
                              Recharge now
                            </Link>
                          </div>
                        </div>
                        <button className={style.closeButton} onClick={completePayment}
                          disabled={isLoading1}>{isLoading1 ? (
                            <div className={style.loadingSpinner}></div>
                          ) : (
                            !walletSelected || amountPayable > 0 ? `Proceed to Pay Rs. ${amountPayable}` : " Proceed to Book"
                          )}</button>
                      </div>
                    </div>}
                  </div>
                </div>
              </div>
            </div>
            {bookingDetail != undefined ? (<div className={style.bookingDetailsContainer1}>
              {hotelRooms.map((room, index) => (
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
            </div>) : <></>}

            <div
              className={`${style["cancel-policy"]}`}
              onClick={toggleContent}
            >
              <div className={style["horizontal-div"]} id="dropdownButton">
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
                    {hotelRooms.map(
                      (room, roomIndex) => (
                        <>
                          <div className={style["room-description"]}>
                            <div>
                              Room {roomIndex + 1} : {room.RoomTypeName}
                            </div>
                          </div>
                          {new Date() < new Date(room?.CancellationPolicies[0]?.FromDate) && <div style={{ color: "#028fa3" }}>Free cancellation Before {new Date(
                            room?.CancellationPolicies[0]?.FromDate).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric", })}</div>}
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
                    {(hotelBookingStatus !== 'Cancelled' && hotelBookingStatus !== 'FAILED' && hotelBookingStatus !== 'Reserved' && (new Date(checkinDate) >= new Date())) ? (<div className={style.subscribeButton}>
                      <button onClick={cancelBooking} disabled={isLoading}>{isLoading ? 'Cancelling...' : 'Cancel Booking'}</button>
                    </div>) : <></>}
                  </div>
                )}
              </div>
            </div>


          </div>
        </div>
      </>
      {!corporateUser ? (
        <Footer />
      ) : (
        <Footer1 />
      )}
    </div>
  );
}
