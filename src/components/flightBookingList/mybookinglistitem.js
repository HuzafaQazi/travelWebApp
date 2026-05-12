import "bootstrap/dist/css/bootstrap.css";
import style from "./styles.module.css";
import "reactjs-popup/dist/index.css";
import Link from "next/link";

import { getRefundStatus } from "../../../utils/profileAPI";
import { useEffect, useState, useRef } from "react";
import useLocalStorage from "@/hooks/useLocalStorage";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTimesCircle } from "@fortawesome/free-solid-svg-icons";
import { useRouter } from "next/router";
import axios, { handleLogout, getTabSpecificData } from "@/utils/axios/axios";
import config from "@/config";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { routeToPg } from "@/paymentGateways/pgRouting";
import { confirmPaymentFlights } from "../../../utils/walletApis";
import {
  getPaymentGateway,
  getPaymentSessionID,
} from "../../../utils/bookingAPI";
import Image from "next/image";
import { analytics } from "../../../utils/firebase";
import { logEvent } from "firebase/analytics";
import { getUserStatus } from "@/utils/userStatus";
import { useLogin } from "@/store/context/LoginContext";
import showToast from "@/utils/toast";
export default function MyBookingListItem1({
  walletBalance,
  booking,
  type,
  setParentLoader,
  onClose,
}) {
  const router = useRouter();
  const { setShowLoginButton } = useLogin();
  const [refundData, setRefundData] = useState(null);
  const [isRefundLoading, setIsRefundLoading] = useState(false);
  const [refundIndex, setRefundIndex] = useState(null);
  const [isToastVisible, setIsToastVisible] = useState(false);
  const [isPaymentPopup, setIsPaymentPopup] = useState(false);
  const [getUserID, setUserID] = useLocalStorage("userID");
  const [walletSelected, setWalletSelected] = useState(false);
  const [amountPayable, setAmountPayable] = useState();
  const [totalAmount, setTotalAmount] = useState();
  const [pgCharges, setPgCharges] = useState();
  const [isLoading, setIsLoading] = useState(false);
  const [getuserip, setuserip] = useLocalStorage("userip");
  const adultCount = parseInt(booking?.bookingDetails[0]?.noOfadults);
  const childCount = parseInt(booking?.bookingDetails[0]?.noOfchildren);
  const infantCount = parseInt(booking?.bookingDetails[0]?.noOFinfants);

  const totalPassengerCount = adultCount + childCount + infantCount;

  const formatPrice = (price) => {
    if (price) {
      return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    }
  };

  const formatTime = (isoTimeString) => {
    const date = new Date(isoTimeString);
    const hours = date.getHours().toString().padStart(2, "0");
    const minutes = date.getMinutes().toString().padStart(2, "0");
    return `${hours}:${minutes}`;
  };

  useEffect(() => {
    calculateTotalPrice();
  }, []);

  useEffect(() => {
    setWalletSelected(walletSelected);
  }, [walletSelected]);

  const calculateTotalPrice = () => {
    const totalAmount = (booking?.bookingDetails || []).reduce(
      (acc, detail) => {
        const isFailed = detail.bookingStatus === "FAILED";
        return {
          total: acc.total + (isFailed ? 0 : parseFloat(detail.totalAmount)),
          failedTotal: acc.failedTotal + parseFloat(detail.totalAmount),
          failedCount: acc.failedCount + (isFailed ? 1 : 0),
        };
      },
      { total: 0, failedTotal: 0, failedCount: 0 }
    );

    const allFailed =
      booking?.bookingDetails.length === totalAmount.failedCount;

    const finalTotalAmount = allFailed
      ? totalAmount.failedTotal
      : totalAmount.total;
    setTotalAmount(finalTotalAmount);
    if (!walletSelected) setAmountPayable(finalTotalAmount);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const options = {
      weekday: "short",
      month: "long",
      day: "numeric",
      year: "numeric",
    };
    const formattedDate = date.toLocaleDateString("en-US", options);

    // Extracting day, month, and year
    const day = formattedDate.split(",")[0];
    const month = formattedDate.split(" ")[1];
    const dateDay = date.getDate();
    const year = date.getFullYear();

    return (
      <div className={style.fromToDate}>
        {day},{" "}
        <span style={{ color: "#028fa3" }}>
          {month} {dateDay}
          {dateDay % 10 === 1 && dateDay !== 11
            ? "st"
            : dateDay % 10 === 2 && dateDay !== 12
            ? "nd"
            : dateDay % 10 === 3 && dateDay !== 13
            ? "rd"
            : "th"}
        </span>
        , {year}
      </div>
    );
  };

  function formatBookingDateTime(inputDateTime) {
    if (inputDateTime) {
      const optionsDate = {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      };

      const optionsTime = {
        hour: "numeric",
        minute: "numeric",
        hour12: true,
      };

      const datePart = new Date(inputDateTime).toLocaleString(
        "en-US",
        optionsDate
      );
      const timePart = new Date(inputDateTime).toLocaleString(
        "en-US",
        optionsTime
      );

      return `${datePart} | ${timePart}`;
    }
  }

  const [showPopup, setShowPopup] = useState(false);

  const popupRef = useRef(null);
  const popupRef2 = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (popupRef.current && !popupRef.current.contains(event.target)) {
        setShowPopup(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [popupRef]);

  useEffect(() => {
    if (isPaymentPopup) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isPaymentPopup]);
  const handleClickOutside = (event) => {
    if (event.target.closest(`.${style.popupContent}`) === null) {
      setIsPaymentPopup(false);
    }
  };

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

  const handleRefundStatusClick = async (booking_id, index = null) => {
    try {
      setIsRefundLoading(true);
      if (index !== null) {
        setRefundIndex(index);
      }
      let refundResponse = {
        status: "SUCCESS",
        data: {
          walletRefundAmount: booking?.bookingDetails[0]?.walletAmount,
          walletRefundStatus: booking?.bookingDetails[0]?.walletRefundStatus,
        },
      };
      if (booking?.bookingDetails[0]?.paidAmount > 0) {
        refundResponse = await getRefundStatus(booking_id);
      }
      if (refundResponse !== null && refundResponse.status == "SUCCESS") {
        if (refundResponse.data.refundAmount) {
          const data = {
            walletRefundAmount: booking?.bookingDetails[0]?.walletAmount,
            walletRefundStatus: booking?.bookingDetails[0]?.walletRefundStatus,
            refundAmount: refundResponse?.data?.refundAmount,
            refundStatus: refundResponse?.data?.refundStatus,
          };
          setRefundData(data);
        } else {
          setRefundData(refundResponse.data);
        }

        setShowPopup((prevShowPopup) => !prevShowPopup);
        logEvent(analytics, "flight_refund_status");
      } else {
       
          showToast("error","Failed to fetch refund status. Please Try again");

      }
    } catch (error) {
      showToast("error","Failed to cancel your booking");
    } finally {
      setIsRefundLoading(false);
    }
  };

  const routeToBookingDetails = async () => {
    router.push({
      pathname: "/bookings/confirmation",
      query: { booking_id: booking.bookingId, profile: true },
    });
    onClose();
  };

  const routeToBookingDetails1 = async () => {
    router.push({
      pathname: "/flights/twoway/reserve",
      query: { booking_id: booking.bookingId },
    });
  };

  const routeToBookingDetails2 = async () => {
    router.push({
      pathname: "/flights/oneway/reserve",
      query: { booking_id: booking.bookingId },
    });
  };

  const routeToBookingDetails3 = async () => {
    router.push({
      pathname: "/flights/multicity/reserve",
      query: { booking_id: booking.bookingId },
    });
  };

  const handleClose = () => {
    setIsPaymentPopup(false);
  };
  const handleCancelReserveClick = async (bookingId, pnr) => {
    if (bookingId && pnr) {
      try {
        setParentLoader(true);
        const userId = getTabSpecificData("userID");
        const reponse = await getUserStatus(userId);

        if (reponse.data.status === "inactive") {
          await handleLogout();
          return;
        }
        const storedUserIp = getTabSpecificData("userip");
        const payload = {
          releasePNRReqModel: {
            endUserIp: storedUserIp == "undefined" ? null : storedUserIp,
            bookingId,
            pnr,
          },
        };
        const { data } = await axios.post(
          `${config.FLIGHTS_BOOKING_RELEASE_PNR}`,
          payload
        );
        if (data.status === "SUCCESS") {
          showToast("success","Reservation cancelled successfully");
        }
        logEvent(analytics, "profile_flight_cancel");
        setParentLoader(false);
      } catch (error) {
        console.log("Error calling Reserve API:", error);
        let errorMessage =
          error?.response?.data?.error?.errormessage ||
          "Something went wrong, please try after some time";
        if (
          error?.response?.Error?.ErrorMessage?.Error ===
            "userId doesnot exists" ||
          error?.response?.Error?.ErrorCode === "400"
        ) {
          await handleLogout();
        }
        showToast("error",errorMessage);
        setParentLoader(false);
      }
    }
  };
  const handlePopupClick = (e) => {
    e.stopPropagation();
  };

  const handleProceedToPayClick = async (
    bookingId,
    totalAmount,
    bookingPaymentRefId
  ) => {
    setIsLoading(true);
    setParentLoader(true);
    try {
      const userId = getTabSpecificData("userID");
      const reponse = await getUserStatus(userId);

      if (reponse.data.status === "inactive") {
        await handleLogout();
        return;
      }
      await handlePayment(totalAmount, bookingId, bookingPaymentRefId);
      logEvent(analytics, "profile_flight_payment", {
        bookingId: bookingId,
      });
    } catch (error) {
      console.error("Error calling API:", error);
      let errorMessage =
        error?.response?.data?.error?.errormessage ||
        "Something went wrong, please try after some time";
      if (
        error?.response?.Error?.ErrorMessage?.Error ===
          "userId doesnot exists" ||
        error?.response?.Error?.ErrorCode === "400"
      ) {
        await handleLogout();
      }
      showToast("info",errorMessage);
    }
    setIsLoading(false);
    setParentLoader(false);
  };

  const handlePaymentPopup = async (e) => {
    e.stopPropagation();
    setAmountPayable(totalAmount);
    setIsPaymentPopup(!isPaymentPopup);
  };

  const getMinLastTicketDate = () => {
    const date1 = new Date(booking?.bookingDetails[0]?.lastTicketDate);
    const date2 = new Date(booking?.bookingDetails[1]?.lastTicketDate);

    if (date1 < date2) {
      return date1;
    } else {
      return date2;
    }
  };

  const minLastTicketDate = getMinLastTicketDate();

  const handlePayment = async (totalAmount, bookingId, bookingPaymentRefId) => {
    let bookingPaymentRef = bookingPaymentRefId;
    if (bookingPaymentRefId) {
      bookingPaymentRef = {
        bookingPaymentRefIds: [bookingPaymentRefId],
        isWeb: true,
      };
    }
    const mobileNumber = getTabSpecificData("phoneNumber");

    const pgRes = await getPaymentGateway();
    if (pgRes.status === "SUCCESS") {
      if (amountPayable > 0) {
        const getPaymentSessionIDResp = await getPaymentSessionID(
          null,
          Math.max(0, totalAmount - amountPayable),
          0,
          "BOOKING",
          bookingId,
          parseFloat(amountPayable),
          mobileNumber,
          pgRes.data.pgCode,
          2,
          bookingPaymentRef
        );

        if (
          getPaymentSessionIDResp !== null &&
          getPaymentSessionIDResp.data.data.paymentSessionId !== ""
        ) {
          const queryParams = {
            booking_id: bookingId,
          };
          routeToPg(
            pgRes.data.pgCode,
            getPaymentSessionIDResp.data.data.paymentSessionId,
            queryParams,
            bookingId,
            2,
            "BOOKING"
          );
        }
      } else {
        let confirmReq = {
          bookingId: bookingId,
          paymentRefernceId: getTabSpecificData("userID"),
          paymentStatus: "SUCCESS",
          paymentAmount: amountPayable,
          pgCode: pgRes.data.pgCode,
          bookingPaymentRefIds: [bookingPaymentRefId],
          walletAmount: totalAmount - amountPayable,
        };
        const resp = await confirmPaymentFlights(confirmReq);
        if (resp) {
          router.push({
            pathname: "/flights/confirmation",
            query: { booking_id: bookingId, profile: false },
          });
        }
      }
    }
  };

  const checkwallet = async (e) => {
    e.stopPropagation();
    if (walletSelected) {
      setWalletSelected(false);
      setAmountPayable(totalAmount);
    } else {
      setWalletSelected(true);
      let payable = 0;
      if (totalAmount > walletBalance) {
        payable = totalAmount - walletBalance;
      }
      setAmountPayable(payable);
    }
  };

  if (booking.bookingStatus === "PENDING") {
    return null;
  }
  // else if (booking.bookingStatus === "RESERVED") {
  //   return (
  //     <div
  //       className={style.bookingitem}
  //       onClick={() => {
  //         if (booking?.bookingDetails[0]?.journeyType === "Return") {
  //           routeToBookingDetails1();
  //         } else if (booking?.bookingDetails[0]?.journeyType === "OneWay") {
  //           routeToBookingDetails2();
  //         } else if (booking?.bookingDetails[0]?.journeyType === "Multi Stop") {
  //           routeToBookingDetails3();
  //         } else {
  //           console.error("Unknown journey type");
  //         }
  //       }}
  //     >
  //       <div className={style.bookinglistitem}>
  //         <div className={style.roombrief}>
  //           <div className={style.container}>
  //             {booking?.bookingDetails[0]?.lastTicketDate && (
  //               <div className={style.expiryDate}>
  //                 Expires on{" "}
  //                 {formatBookingDateTime(
  //                   booking?.bookingDetails[0]?.lastTicketDate
  //                 )}
  //               </div>
  //             )}
  //           </div>
  //           <div className={style.date}>
  //             <div className={style.rightpart}>
  //               <div className={style.rectangularBox}>
  //                 {booking?.bookingDetails[0]?.journeyType}
  //               </div>
  //               <div className={style.rectangularBox}>
  //                 {booking?.bookingDetails[0]?.fareType}
  //               </div>
  //             </div>
  //           </div>
  //           <div className={style.travellerCount2}>
  //             <div>
  //               {booking?.bookingDetails.map((detail, index) => (
  //                 <>
  //                   <div key={index} className={style.fromtocity}>
  //                     <div style={{ display: "flex", flexDirection: "column" }}>
  //                       <div className={style.airline}>
  //                         {detail.airlineLogoUrl ? (
  //                           <Image
  //                             src={detail.airlineLogoUrl}
  //                             alt="logo"
  //                             width={30}
  //                             height={30}
  //                           />
  //                         ) : (
  //                           <img src="default_logo_url" alt="Default Logo" />
  //                         )}
  //                         <div className={style.airlineName}>
  //                           <div> {detail.airlineName}</div>
  //                           <div className={style.airlineName1}>
  //                             {detail.airlineCode}-{detail.flightNumber}
  //                           </div>
  //                         </div>
  //                       </div>
  //                       <div className={style.travellerCount}>
  //                         {"BookingId : "}
  //                         {booking?.bookingId}
  //                       </div>
  //                       {detail.bookingStatus !== "FAILED" && (
  //                         <div className={style.pnr}>PNR : {detail.pnr}</div>
  //                       )}
  //                       {detail.depTime && (
  //                         <span className={style.fromToTime}>
  //                           {formatTime(detail.depTime)}
  //                         </span>
  //                       )}
  //                       <span className={style.cityName}>
  //                         {detail.origin}({detail.originCode})
  //                       </span>
  //                       {detail.depTime && (
  //                         <span className={style.fromToTime}>
  //                           {formatDate(detail.depTime)}
  //                         </span>
  //                       )}
  //                     </div>

  //                     <div
  //                       // className={style.fromToTime1}
  //                       className={`${
  //                         detail.bookingStatus === "FAILED"
  //                           ? style.fromToTime2
  //                           : style.fromToTime1
  //                       }`}
  //                       style={{
  //                         display: "flex",
  //                         flexDirection: "column",
  //                         textAlign: "right",
  //                         justifyContent: "flex-end",
  //                         // marginTop: "5%",
  //                       }}
  //                     >
  //                       {detail.arrivalTime && (
  //                         <span className={style.fromToTime}>
  //                           {formatTime(detail.arrivalTime)}
  //                         </span>
  //                       )}
  //                       <span className={style.cityName}>
  //                         {detail.destination}({detail.destinationCode})
  //                       </span>
  //                       {detail.arrivalTime && (
  //                         <span className={style.fromToTime}>
  //                           {formatDate(detail.arrivalTime)}
  //                         </span>
  //                       )}
  //                     </div>
  //                   </div>
  //                   <button
  //                     className={
  //                       detail.bookingStatus == "Cancelled" ||
  //                       detail.bookingStatus == "FAILED" ||
  //                       detail.bookingStatus == "EXPIRED" ||
  //                       detail.bookingStatus == "CANCELLED"
  //                         ? style.cancelledButton
  //                         : style.completedButto
  //                     }
  //                     disabled
  //                   >
  //                     {detail.bookingStatus}
  //                   </button>
  //                 </>
  //               ))}
  //             </div>
  //             <div className={style.travellerCount1}>
  //               <div className={style.travellerCount}>
  //                 {totalPassengerCount} Passengers | {adultCount} Adults |{" "}
  //                 {childCount} Children | {infantCount} Infants
  //               </div>
  //             </div>
  //           </div>
  //           <hr className={style.customHr} />
  //           {booking.bookingDetails.length > 0 && (
  //             <div className={style}>
  //               <div className={style.amountPaid}>
  //                 <span className={style.ruppess}> Amount </span>
  //                 {booking?.bookingStatus !== "FAILED" && (
  //                   <>
  //                     {booking?.bookingDetails.map((detail, index) => (
  //                       <span key={index} className={style.ruppess}></span>
  //                     ))}
  //                     <span className={style.ruppess}>
  //                       Rs {formatPrice(totalAmount)}
  //                     </span>
  //                   </>
  //                 )}
  //               </div>

  //               <div className={style.buttonRow}>
  //                 {booking.bookingStatus !== "CANCELLED" && (
  //                   <>
  //                     <button
  //                       className={style.cancelOption}
  //                       onClick={() =>
  //                         handleCancelReserveClick(
  //                           booking?.bookingId,
  //                           booking?.bookingDetails?.[0]?.pnr
  //                         )
  //                       }
  //                     >
  //                       Cancel Reservation
  //                     </button>
  //                     <button
  //                       className={style.payButton}
  //                       onClick={handlePaymentPopup}
  //                     >
  //                       Proceed to Pay
  //                     </button>
  //                     {isPaymentPopup && walletBalance > 0 && (
  //                       <div className={style.popupOverlay}>
  //                         <div
  //                           onClick={handlePopupClick}
  //                           className={style.popupContent}
  //                         >
  //                           <div>
  //                             {" "}
  //                             <FontAwesomeIcon
  //                               icon={faTimesCircle}
  //                               className={style.closeIcon}
  //                               onClick={handleClose}
  //                             />
  //                           </div>
  //                           <div className={style.walletSection}>
  //                             <div>
  //                               <input
  //                                 type="checkbox"
  //                                 id="useWallet"
  //                                 name="useWallet"
  //                                 onChange={checkwallet}
  //                               />
  //                               <label
  //                                 htmlFor="useWallet"
  //                                 className={style.useWalletLabel}
  //                               >
  //                                 Use wallet payment
  //                               </label>
  //                             </div>
  //                             <div className={style.walletBalance}>
  //                               <span>Wallet Balance: Rs.</span>
  //                               <span className={style.balanceAmount}>
  //                                 {walletBalance}
  //                               </span>
  //                               <Link
  //                                 href={{
  //                                   pathname: "/walletDetails",
  //                                   query: {
  //                                     fromPage:
  //                                       typeof window !== "undefined"
  //                                         ? window?.location?.pathname +
  //                                           `?booking_id=${
  //                                             booking.bookingId
  //                                           }&profile=${true}`
  //                                         : "/walletDetails",
  //                                   },
  //                                 }}
  //                                 as={`/walletDetails`}
  //                               >
  //                                 Recharge now
  //                               </Link>
  //                             </div>
  //                           </div>
  //                           <button
  //                             className={style.closeButton}
  //                             onClick={() =>
  //                               handleProceedToPayClick(
  //                                 booking?.bookingId,
  //                                 totalAmount,
  //                                 booking?.bookingDetails?.[0]
  //                                   ?.bookingPaymentRefId
  //                               )
  //                             }
  //                             disabled={isLoading}
  //                           >
  //                             {isLoading ? (
  //                               <div className={style.loadingSpinner}></div>
  //                             ) : !walletSelected || amountPayable > 0 ? (
  //                               `Proceed to Pay Rs. ${amountPayable}`
  //                             ) : (
  //                               " Proceed to Book"
  //                             )}
  //                           </button>
  //                         </div>
  //                       </div>
  //                     )}
  //                   </>
  //                 )}
  //               </div>
  //             </div>
  //           )}
  //         </div>
  //       </div>
  //     </div>
  //   );
  // }
  else if (
    booking.bookingStatus === "CONFIRMED" ||
    booking.bookingStatus === "COMPLETED" ||
    booking.bookingStatus === "PARTIALLY_SUCCESS" ||
    booking?.bookingDetails[0]?.bookingStatus === "CANCELLED" ||
    booking?.bookingDetails[0]?.bookingStatus === "EXPIRED" ||
    booking?.bookingDetails[0]?.bookingStatus === "COMPLETED" ||
    booking?.bookingDetails[0]?.bookingStatus === "FAILED" ||
    booking.bookingStatus === "COMPLETED"
  ) {
    return (
      <div
        className={style.bookingitem}
        onClick={
          booking.bookingStatus !== "FAILED" ? routeToBookingDetails : ""
        }
      >
        <div className={style.bookinglistitem}>
          <div className={style.roombrief}>
            <div className={style.date}>
              <div className={style.rightpart}>
                <div className={style.rectangularBox}>
                  {booking?.bookingDetails[0]?.journeyType}
                </div>
                <div className={style.rectangularBox}>
                  {booking?.bookingDetails[0]?.fareType}
                </div>
              </div>
            </div>
            <div>
              {booking?.bookingDetails.map((detail, index) => (
                <div
                  key={index}
                  className={style.fromtocity}
                  style={{ flexDirection: "column" }}
                >
                  <div className={style.fromtocity}>
                    <div style={{ display: "flex", flexDirection: "column" }}>
                      <div className={style.airline}>
                        {detail.airlineLogoUrl ? (
                          <Image
                            src={detail.airlineLogoUrl}
                            alt="logo"
                            width={30}
                            height={30}
                          />
                        ) : (
                          <img src="default_logo_url" alt="Default Logo" />
                        )}
                        <div className={style.airlineName}>
                          <div> {detail.airlineName}</div>
                          <div className={style.airlineName1}>
                            {detail.airlineCode}-{detail.flightNumber}
                          </div>
                        </div>
                      </div>
                      <div className={style.travellerCount}>
                        {"BookingId : "}
                        {booking?.bookingId}
                      </div>
                      {detail.bookingStatus !== "FAILED" && (
                        <div className={style.pnr}>PNR : {detail.pnr}</div>
                      )}
                      {detail.depTime && (
                        <span className={style.fromToTime}>
                          {formatTime(detail.depTime)}
                        </span>
                      )}
                      <span className={style.cityName}>
                        {detail.origin}({detail.originCode})
                      </span>
                      {detail.depTime && (
                        <span className={style.fromToTime}>
                          {formatDate(detail.depTime)}
                        </span>
                      )}
                    </div>

                    <div
                      className={`${
                        detail.bookingStatus === "FAILED"
                          ? style.fromToTime2
                          : style.fromToTime1
                      }`}
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        textAlign: "right",
                        // marginTop: "5%",
                      }}
                    >
                      {detail.arrivalTime && (
                        <span className={style.fromToTime}>
                          {formatTime(detail.arrivalTime)}
                        </span>
                      )}
                      <span className={style.cityName}>
                        {detail.destination}({detail.destinationCode})
                      </span>
                      {detail.arrivalTime && (
                        <span className={style.fromToTime}>
                          {formatDate(detail.arrivalTime)}
                        </span>
                      )}
                    </div>
                  </div>

                  <div style={{ display: "flex", flexDirection: "block" }}>
                    <div key={index} className={style.container}>
                      {(detail.bookingStatus === "Cancelled" ||
                        detail.bookingStatus === "FAILED") &&
                      booking?.paymentStatus == "SUCCESS" ? (
                        <div
                          className={style.refundstatus}
                          onClick={() =>
                            handleRefundStatusClick(booking?.bookingId, index)
                          }
                        >
                          Refund status
                        </div>
                      ) : (
                        <></>
                      )}

                      {isRefundLoading && refundIndex === index ? (
                        <div className={style.popup}>
                          <div className={style.popupContent}>Loading...</div>
                        </div>
                      ) : (
                        showPopup &&
                        refundIndex === index && (
                          <div className={style.popup}>
                            <div className={style.popupContent}>
                              {refundData.walletRefundAmount > 0 ||
                              refundData.refundAmount > 0 ? (
                                <div>
                                  {refundData.walletRefundAmount > 0 && (
                                    <div
                                      style={{
                                        whiteSpace: "nowrap",
                                        color: "gray",
                                      }}
                                    >
                                      Wallet Refund status:{" "}
                                      <span className={style.success}>
                                        {refundData.walletRefundStatus}
                                      </span>
                                    </div>
                                  )}
                                  {refundData.walletRefundAmount > 0 && (
                                    <div
                                      style={{
                                        whiteSpace: "nowrap",
                                        color: "gray",
                                      }}
                                    >
                                      Wallet Refund Amount:{" "}
                                      <span className={style.success}>
                                        Rs.{" "}
                                        {formatPrice(
                                          refundData.walletRefundAmount
                                        )}
                                      </span>
                                    </div>
                                  )}
                                  {refundData.refundAmount > 0 && (
                                    <div
                                      style={{
                                        whiteSpace: "nowrap",
                                        color: "gray",
                                      }}
                                    >
                                      Payment Refund Status:{" "}
                                      <span className={style.success}>
                                        {refundData.refundStatus
                                          ? refundData.refundStatus
                                          : ""}
                                      </span>
                                    </div>
                                  )}
                                  {refundData.refundAmount > 0 && (
                                    <div
                                      style={{
                                        whiteSpace: "nowrap",
                                        color: "gray",
                                      }}
                                    >
                                      Payment Refund Amount:{" "}
                                      <span className={style.success}>
                                        Rs.{" "}
                                        {refundData.refundAmount
                                          ? formatPrice(refundData.refundAmount)
                                          : ""}
                                      </span>
                                    </div>
                                  )}
                                </div>
                              ) : (
                                <div className={style.success}>
                                  Due to 100% cancellation charges, there will
                                  be no refund.
                                </div>
                              )}
                            </div>
                          </div>
                        )
                      )}
                    </div>
                    {/* ))} */}
                    <button
                      className={
                        detail.bookingStatus == "CANCELLED" ||
                        detail.bookingStatus == "FAILED" ||
                        detail.bookingStatus == "EXPIRED"
                          ? style.cancelledButton
                          : style.completedButto
                      }
                      disabled
                    >
                      {/* {detail.bookingStatus} */}
                      {detail.journeyType === "Multi Stop" ||
                      booking?.bookingDetails[0]?.journeyType === "Multi Stop"
                        ? booking?.bookingStatus
                        : detail?.bookingStatus}
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className={style.travellerCount1}>
              <div className={style.travellerCount2}>
                <div className={style.travellerCount}>
                  {totalPassengerCount} Passengers | {adultCount} Adults |{" "}
                  {childCount} Children | {infantCount} Infants
                </div>
              </div>
            </div>
            <hr className={style.customHr} />
            <div className={style}>
              <div className={style.amountPaid}>
                <span className={style.ruppess}>Amount</span>
                {booking?.bookingDetails.map((detail, index) => (
                  <span key={index} className={style.ruppess}></span>
                ))}
                <span className={style.ruppess}>
                  Rs {formatPrice(totalAmount)}
                </span>
              </div>

              {booking?.bookingDetails[0]?.bookingStatus === "FAILED" && (
                <div className={style.amountPaid}>
                  <span className={style.ruppess}>Refund Amount</span>
                  <span className={style.ruppess}>
                    Rs {formatPrice(booking?.refundAmount?.toFixed(0))}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }
}
