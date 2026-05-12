import "bootstrap/dist/css/bootstrap.css";
import style from "./styles.module.css";
import "reactjs-popup/dist/index.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faClock } from "@fortawesome/free-solid-svg-icons";
import {
  getPaymentSessionID,
  getPaymentGateway,
} from "../../../utils/bookingAPI";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/router";
import { sendChangeRequest, getRefundStatus } from "../../../utils/profileAPI";
import useLocalStorage from "@/hooks/useLocalStorage";
import { generateInvoice } from "../../../utils/profileAPI";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { routeToPg } from "@/paymentGateways/pgRouting";
import { logEvent } from "firebase/analytics";
import { analytics } from "../../../utils/firebase";
import { getWalletBalance } from "../../../utils/walletApis";
import { confirmPaymentHotels } from "../../../utils/walletApis";
import Link from "next/link";
import { useLogin } from "@/store/context/LoginContext";
import { getUserStatus } from "@/utils/userStatus";
import { getTabSpecificData, handleLogout, setTabSpecificData } from "@/utils/axios/axios";

// import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTimesCircle } from "@fortawesome/free-solid-svg-icons";
export default function MyBookingListItem({ booking, type }) {
  const router = useRouter();
  const { setShowLoginButton } = useLogin();
  const [bookingStatus, setBookingStatus] = useState(booking.BookingStatus);
  const [isLoading, setIsLoading] = useState(false);
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

  const [isToastVisible, setIsToastVisible] = useState(false);
  const completePayment = async (e) => {
    e.stopPropagation();
    setIsLoading(true);
    const userId = getTabSpecificData("userID");
    const reponse = await getUserStatus(userId);

    if (reponse.data.status === "inactive") {
      await handleLogout();
      return;
    }
    const data = await getPaymentGateway();
    setTabSpecificData("bookingId",booking.BookingId);
    setTabSpecificData("reserveBooking",booking.BookRoomDetails?.IsVoucherBooking);
    if (data.status === "SUCCESS") {
      if (amountPayable > 0) {
        const phoneNumber = getTabSpecificData("phoneNumber");
        let getPaymeneSessionIDResp = await getPaymentSessionID(
          null,
          walletSelected
            ? booking.BookRoomDetails?.TotalBookingAmount - amountPayable
            : 0,
          0,
          "BOOKING",
          booking.BookingId,
          amountPayable,
          phoneNumber,
          data.data.pgCode
        );
        if (
          getPaymeneSessionIDResp !== null &&
          getPaymeneSessionIDResp.data.data.paymentSessionId !== ""
        ) {
          routeToPg(
            data.data.pgCode,
            getPaymeneSessionIDResp.data.data.paymentSessionId,
            {},
            booking.BookingId,
            1,
            "BOOKING"
          );
        }
        logEvent(analytics, "profile_hotel_proceed_to_pay", {
          mobile: phoneNumber,
        });
      } else {
        let confirmReq = {
          bookingId: booking.BookingId,
          paymentRefernceId: getTabSpecificData("userID"),
          paymentStatus: "SUCCESS",
          paymentAmount: amountPayable,
          pgCode: data.data.pgCode,
          walletAmount:
            booking.BookRoomDetails?.TotalBookingAmount - amountPayable,
        };
        const resp = await confirmPaymentHotels(confirmReq);
        if (resp) {
          router.push("/confirmationbooking");
        }
      }
      setIsLoading(false);
    }
  };
  const cancelBooking = async (e) => {
    e.stopPropagation();
    try {
      setPopupVisible(false);
      setShowCancellationPolicy(false);

      let cancelResponse = await sendChangeRequest(
        booking.BookingId,
        "no remarks"
      );
      if (
        cancelResponse !== null &&
        cancelResponse.data.data.HotelChangeRequestResult.ResponseStatus == 1
      ) {
        setBookingStatus("Cancelled");
        toast("Booking cancelled successfully");
      } else {
        toast("Failed to cancel your booking");
      }
      logEvent(analytics, "profile_hotel_cancel_booking", {});
    } catch (error) {
      toast("Failed to cancel your booking");
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

  const handlePaymentPopup = async (e) => {
    e.stopPropagation();
    const resp = await getWalletBalance(getTabSpecificData("userID"));

    if (resp.status === "SUCCESS") {
      setWalletBalance(resp.data.balance);
    }
    setIsPaymentPopup(!isPaymentPopup);
  };
  const handlePopupClick = (e) => {
    e.stopPropagation();
  };
  const handleRefundStatusClick = async (e) => {
    e.stopPropagation();

    if (booking.RefundAmount > 0 || booking.walletRefundAmount > 0) {
      if (booking.WalletRefundStatus === "SUCCESS") {
        setWalletRefundAmount(booking.WalletRefundAmount);
        setWalletRefundStatus(booking.WalletRefundStatus);
      }

      let refundResponse = {
        status: "SUCCESS",
      };
      try {
        if (booking.PaidRefundAmount > 0) {
          refundResponse = await getRefundStatus(booking.BookingId);
        }
        if (refundResponse !== null && refundResponse.status == "SUCCESS") {
          e.preventDefault();
          const rect = e.target.getBoundingClientRect();
          setPopupPosition({ top: rect.bottom, left: rect.left });
          setShowPopup((prevShowPopup) => !prevShowPopup);
          setrefundAmount(refundResponse?.data?.refundAmount);
          setRefundStatus(refundResponse?.data?.refundStatus);
        } else {
          if (!isToastVisible) {
            toast("Failed to fetch refund status. Please Try again");
            setIsToastVisible(true);
            setTimeout(() => {
              setIsToastVisible(false);
            }, 6000);
          }
        }
        logEvent(analytics, "hotel_refund_status");
      } catch (error) {
        console.log("errror: ", error);
      }
    } else {
      e.preventDefault();
      const rect = e.target.getBoundingClientRect();
      setPopupPosition({ top: rect.bottom, left: rect.left });
      setShowPopup((prevShowPopup) => !prevShowPopup);
      setrefundAmount("123");
      setRefundStatus("2133");
    }
  };

  const [popupPosition, setPopupPosition] = useState({ top: 0, left: 0 });
  const [refundStatus, setRefundStatus] = useState("Pending");
  const [refundAmount, setrefundAmount] = useState("");
  const [walletRefundAmount, setWalletRefundAmount] = useState("");
  const [walletRefundStatus, setWalletRefundStatus] = useState("");

  const [showPopup, setShowPopup] = useState(false);
  const checkInDate = new Date(booking.BookRoomDetails?.CheckInDate);
  const day = checkInDate.getDate();
  const month = checkInDate.toLocaleString("default", { month: "long" });
  const formattedCheckinDate = `${getDayWithSuffix(day)} ${month}`;

  const checkOutDate = new Date(booking.BookRoomDetails?.CheckOutDate);
  const checkoutDay = checkOutDate.getDate();
  const checkoutMonth = checkOutDate.toLocaleString("default", {
    month: "long",
  });
  const formattedCheckoutDate = `${getDayWithSuffix(
    checkoutDay
  )} ${checkoutMonth}`;
  const [getUserID, setUserID] = useLocalStorage("userID");
  const [popupVisible, setPopupVisible] = useState(false);
  const [showCancellationPolicy, setShowCancellationPolicy] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [getEmail, setEmail] = useLocalStorage("email");
  const [getAccessToken, setAccessToken] = useLocalStorage("accessToken");
  const [getPhoneNumber, setPhoneNumber] = useLocalStorage("phoneNumber");
  const [getBookingId, setBookingId] = useLocalStorage("bookingId");
  const [getReserveBooking, setReserveBooking] =
    useLocalStorage("reserveBooking");
  const [roomCancellationPolicy, setRoomCancellationPolicy] = useState([]);
  const cancellationPolicy = {
    freeCancellation: 'Free Cancellation till "18th August, 2023 1:59 PM"',
    noRefund: 'No refund, if cancelled after "18th August, 2023 2:00 PM"',
    dateData: "Your dynamic date data here", // Get this from your backend
    feeData: "Your dynamic fee data here", // Get this from your backend
  };
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [useWalletBalance, setUseWalletBalance] = useState(false);
  const [walletBalance, setWalletBalance] = useState("");
  const [walletSelected, setWalletSelected] = useState(false);
  const [amountPayable, setAmountPayable] = useState();
  const [isPaymentPopup, setIsPaymentPopup] = useState(false);
  const [totalAmount, setTotalAmount] = useState();

  const togglePopup = () => {
    setPopupVisible(!popupVisible);
  };

  const handleAgreeCheckbox = () => {
    setAgreed(!agreed);
  };

  const handleClose = () => {
    setIsPaymentPopup(false);
  };

  const popupRef = useRef(null);
  const popupRef2 = useRef(null);

  const handleClickOutside = (event) => {
    if (popupRef.current && !popupRef.current.contains(event.target)) {
      setPopupVisible(false);
      setShowCancellationPolicy(false);
    }
    if (popupRef2.current && !popupRef2.current.contains(event.target)) {
      setShowPopup(false);
    }
  };
  useEffect(() => {
    setTotalAmount(parseFloat(booking.BookRoomDetails?.TotalBookingAmount));
    if (!walletSelected)
      setAmountPayable(parseFloat(booking.BookRoomDetails?.TotalBookingAmount));
  }, []);
  booking.BookRoomDetails?.TotalBookingAmount;
  useEffect(() => {
    const currentDate = new Date();
    const targetDate = new Date("2023-08-30T00:00:00");
    window.addEventListener("click", handleClickOutside);

    return () => {
      window.removeEventListener("click", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    const bookingData = booking.BookRoomDetails?.RoomCancellationPolicies;
    const groupedData = {};

    bookingData?.forEach((item) => {
      if (!groupedData[item.roomIndex]) {
        groupedData[item.roomIndex] = [];
      }

      groupedData[item.roomIndex].push(item);
    });

    const twoDArray = Object.values(groupedData);
    setRoomCancellationPolicy(twoDArray);
  }, []);

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

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const day = date.getDate();
    const month = date.toLocaleString("default", { month: "short" });
    const year = date.getFullYear();
    let hours =
      date.getHours() < 10 ? `0${date.getHours() % 12}` : date.getHours() % 12;
    hours == "00" ? (hours = "12") : hours;
    const minutes = String(date.getMinutes()).padStart(2, "0");
    const ampm = date.getHours() >= 12 ? "PM" : "AM";
    const formattedDate = `${getDayWithSuffix(
      day
    )} ${month} ${year}, ${hours}:${minutes} ${ampm}`;
    return formattedDate;
  };

  const routeToBookingDetails = async () => {
    router.push({
      pathname: "/bookingDetails",
      query: { bookingId: booking.BookingId },
    });
  };

  if (bookingStatus === "Reserved" || bookingStatus == "Expired") {
    return (
      <>
        <div
          className={style.bookingitem}
          onClick={bookingStatus !== "FAILED" ? routeToBookingDetails : ""}
        >
          <div className={style.bookinglistitem}>
            <div className={style.roombrief}>
              <div className={style.bold}>
                {booking.BookRoomDetails?.HotelName}
              </div>
              <div className={style.address}>
                {booking.BookRoomDetails?.AddressLine1}
              </div>
              <div className={style.date}>
                {formattedCheckinDate}, {checkInDate.getFullYear()} -{" "}
                {formattedCheckoutDate}, {checkOutDate.getFullYear()}
              </div>
              <div className={style.customername}>
                {"BookingId : "}
                {booking.BookingId}
                {" | PNR : "}
                {booking.VendorBookingId} |
                {parseInt(booking.BookRoomDetails?.NoOfRooms) === 1
                  ? "1 Room"
                  : `${booking.BookRoomDetails?.NoOfRooms} Rooms`}
                {" | Passenger : "}
                {booking.LeadPassenger}
              </div>
            </div>
            <div>
              <button
                className={
                  bookingStatus == "Cancelled" ||
                  bookingStatus == "FAILED" ||
                  bookingStatus == "Expired"
                    ? style.cancelledButton
                    : style.completedButto
                }
                disabled
              >
                {bookingStatus}
              </button>
              <div className={style.container}>
                {(bookingStatus === "Cancelled" ||
                  bookingStatus === "FAILED") &&
                (booking.PaymentStatus == "SUCCESS" ||
                  booking.walletPaymentStatus == "SUCCESS") ? (
                  <div
                    className={style.refundstatus}
                    onClick={handleRefundStatusClick}
                    ref={popupRef}
                  >
                    Refund status
                  </div>
                ) : (
                  <></>
                )}

                {showPopup && (
                  <div className={style.popup}>
                    <div className={style.popupContent}>
                      {booking.walletRefundAmount > 0 ||
                      booking.RefundAmount > 0 ? (
                        <div>
                          {walletRefundAmount > 0 && (
                            <div>
                              Wallet Refund status:{" "}
                              <span className={style.success}>
                                {walletRefundStatus}
                              </span>
                            </div>
                          )}
                          {walletRefundAmount > 0 && (
                            <div>
                              Wallet Refund Amount:{" "}
                              <span className={style.success}>
                                Rs. {walletRefundAmount}
                              </span>
                            </div>
                          )}
                          {refundAmount > 0 && (
                            <div>
                              Payment Refund Status:{" "}
                              <span className={style.success}>
                                {refundStatus}
                              </span>
                            </div>
                          )}
                          {refundAmount > 0 && (
                            <div>
                              Payment Refund Amount:{" "}
                              <span className={style.success}>
                                Rs. {refundAmount}
                              </span>
                            </div>
                          )}
                        </div>
                      ) : (
                        <></>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
            <div className={style.profilePopup} ref={popupRef}>
              <div className={style.Popupicon} onClick={togglePopup}></div>
              {showCancellationPolicy &&
                (console.log(
                  "no of rooms: ",
                  booking.BookRoomDetails?.NoOfRooms
                ),
                (
                  <div className={style.cancellationPopup}>
                    <h2>Cancellation Policy</h2>
                    {roomCancellationPolicy.map((policy, index) => (
                      <div key={index}>
                        <h5>
                          Room {index + 1}:{" "}
                          {policy[0].roomTypeName != null
                            ? policy[0].roomTypeName
                            : ""}
                        </h5>
                        <div className={style.feeTable} key={index}>
                          <div className={style.feeColumn}>
                            <h5>Date</h5>
                            {policy.map((details, i) => (
                              <p key={i}>
                                From {formatDate(details.fromDate)} To{" "}
                                {formatDate(details.toDate)}
                              </p>
                            ))}
                          </div>
                          <div className={style.feeColumn}>
                            <h5>Fee</h5>
                            {policy.map((details, i) => (
                              <p key={i}>
                                {details.chargeType == 1
                                  ? `Rs. ${details.charge}`
                                  : details.chargeType == 2
                                  ? `${details.charge}%`
                                  : ""}
                              </p>
                            ))}
                          </div>
                        </div>
                      </div>
                    ))}
                    {booking.BookRoomDetails != null &&
                    booking.BookRoomDetails?.CheckInDate != null &&
                    new Date(booking.BookRoomDetails?.CheckInDate) >=
                      new Date() ? (
                      <label className={style.checkboxLabel}>
                        <input
                          type="checkbox"
                          checked={agreed}
                          onChange={handleAgreeCheckbox}
                          onClick={(e) => e.stopPropagation()}
                        />
                        I agree with terms and conditions
                      </label>
                    ) : (
                      <></>
                    )}
                    {booking.BookRoomDetails != null &&
                    booking.BookRoomDetails?.CheckInDate != null &&
                    new Date(booking.BookRoomDetails?.CheckInDate) >=
                      new Date() ? (
                      <button
                        className={style["cancelButton"]}
                        disabled={!agreed}
                        onClick={agreed ? cancelBooking : ""}
                      >
                        Cancel Booking
                      </button>
                    ) : (
                      <></>
                    )}
                  </div>
                ))}
            </div>
          </div>
          <hr className={style.customHr} />
          <div className={style.reserveOption}>
            <div className={style.amountExpiry}>
              <div className={style.amountToBePaid}>
                Amount to be paid: Rs.
                {booking.BookRoomDetails?.TotalBookingAmount}
              </div>
              <div className={style.expiryDetails}>
                <FontAwesomeIcon icon={faClock} className={style.clockIcon} />
                <div>
                  {new Date(booking.BookRoomDetails?.LastVoucherDate) <
                  new Date()
                    ? "Unfortunately, your reservation has expired on "
                    : "Expires on "}{" "}
                  {formatDate(booking.BookRoomDetails?.LastVoucherDate)}
                </div>
              </div>
            </div>
            {new Date(booking.BookRoomDetails?.LastVoucherDate) < new Date() ? (
              <></>
            ) : (
              <div className={style.buttonRow}>
                <button
                  className={style.cancelOption}
                  onClick={cancelBooking}
                  ref={popupRef}
                >
                  Cancel Reservation
                </button>
                <button
                  className={style.payButton}
                  onClick={handlePaymentPopup}
                >
                  Proceed to Pay
                </button>

                {isPaymentPopup && (
                  <div className={style.popupOverlay}>
                    <div
                      onClick={handlePopupClick}
                      className={style.popupContent}
                    >
                      <div>
                        {" "}
                        <FontAwesomeIcon
                          icon={faTimesCircle}
                          className={style.closeIcon}
                          onClick={handleClose}
                        />
                      </div>

                      <div className={style.walletSection}>
                        <div>
                          {walletBalance > 0 && (
                            <input
                              type="checkbox"
                              id="useWallet"
                              name="useWallet"
                              onChange={checkwallet}
                            />
                          )}
                          {walletBalance > 0 && (
                            <label
                              htmlFor="useWallet"
                              className={style.useWalletLabel}
                            >
                              Use wallet payment
                            </label>
                          )}
                        </div>
                        <div className={style.walletBalance}>
                          <span>Wallet Balance: Rs.</span>
                          <span className={style.balanceAmount}>
                            {walletBalance}
                          </span>
                          <Link
                            href={{
                              pathname: "/walletDetails",
                              query: {
                                fromPage:
                                  typeof window !== "undefined"
                                    ? window.location.pathname +
                                      `?bookingId=${booking.bookingId}`
                                    : "/walletDetails",
                              },
                            }}
                            as={`/walletDetails`}
                          >
                            Recharge now
                          </Link>
                        </div>
                      </div>
                      <button
                        className={style.closeButton}
                        onClick={completePayment}
                        disabled={isLoading}
                      >
                        {isLoading ? (
                          <div className={style.loadingSpinner}></div>
                        ) : !walletSelected || amountPayable > 0 ? (
                          `Proceed to Pay Rs. ${amountPayable}`
                        ) : (
                          " Proceed to Book"
                        )}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </>
    );
  } else if (bookingStatus === "Pending" || bookingStatus === "PENDING") {
    return null;
  } else {
    return booking.BookingStatus === bookingStatus ||
      (booking.BookingStatus !== bookingStatus && type === "all") ? (
      <div
        className={style.bookinglistitem}
        onClick={bookingStatus !== "FAILED" ? routeToBookingDetails : null}
      >
        <div className={style.roombrief}>
          <div className={style.bold}>{booking.BookRoomDetails?.HotelName}</div>
          <div className={style.address}>
            {booking.BookRoomDetails?.AddressLine1}
          </div>
          <div className={style.date}>
            {formattedCheckinDate}, {checkInDate.getFullYear()} -{" "}
            {formattedCheckoutDate}, {checkOutDate.getFullYear()}
          </div>
          <div className={style.customername}>
            {"BookingId : "}
            {booking.BookingId}
            {bookingStatus !== "FAILED"
              ? " | PNR : " + booking.VendorBookingId
              : ""}{" "}
            |
            {parseInt(booking.BookRoomDetails?.NoOfRooms) === 1
              ? "1 Room"
              : `${booking.BookRoomDetails?.NoOfRooms} Rooms`}
            {" | Passenger : "}
            {booking.LeadPassenger}
          </div>
          <hr className={style.customHr} />
          <div className={style}>
            <div className={style}>
              <div className={style.amountPaid}>
                Amount paid: Rs.{booking.BookRoomDetails?.TotalBookingAmount}
              </div>
            </div>
          </div>
        </div>

        <div className={style.bookingstatus}>
          <button
            className={
              bookingStatus == "Cancelled" ||
              bookingStatus == "FAILED" ||
              bookingStatus == "Expired"
                ? style.cancelledButton
                : style.completedButton
            }
            disabled
          >
            {bookingStatus}
          </button>
          <div className={style.container}>
            {booking.PaymentStatus === "SUCCESS" &&
            (bookingStatus === "Cancelled" || bookingStatus === "FAILED") ? (
              <div
                className={style.refundstatus}
                onClick={handleRefundStatusClick}
                ref={popupRef2}
              >
                Refund status
              </div>
            ) : (
              <></>
            )}

            {showPopup && (
              <div className={style.popup}>
                <div className={style.popupContent}>
                  {/* Your popup content goes here */}
                  {booking.walletRefundAmount > 0 ||
                  booking.RefundAmount > 0 ? (
                    <div>
                      {walletRefundAmount > 0 && (
                        <div>
                          Wallet Refund status:{" "}
                          <span className={style.success}>
                            {walletRefundStatus}
                          </span>
                        </div>
                      )}
                      {walletRefundAmount > 0 && (
                        <div>
                          Wallet Refund Amount:{" "}
                          <span className={style.success}>
                            Rs. {walletRefundAmount}
                          </span>
                        </div>
                      )}
                      {refundAmount > 0 && (
                        <div>
                          Payment Refund Status:{" "}
                          <span className={style.success}>{refundStatus}</span>
                        </div>
                      )}
                      {refundAmount > 0 && (
                        <div>
                          Payment Refund Amount:{" "}
                          <span className={style.success}>
                            Rs. {refundAmount}
                          </span>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className={style.success}>
                      Due to 100% cancellation charges, there will be no refund.
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className={style.profilePopup} ref={popupRef}>
          {showCancellationPolicy &&
            (console.log("no of rooms: ", booking.BookRoomDetails?.NoOfRooms),
            (
              <div className={style.cancellationPopup}>
                <h2>Cancellation Policy</h2>
                {roomCancellationPolicy.map((policy, index) => (
                  <div key={index}>
                    <h5>
                      Room {index + 1}:{" "}
                      {policy[0].roomTypeName != null
                        ? policy[0].roomTypeName
                        : ""}
                    </h5>

                    <div className={style.feeTable} key={index}>
                      <div className={style.feeColumn}>
                        <h5>Date</h5>
                        {policy.map((details, i) => (
                          <p key={i}>
                            From {formatDate(details.fromDate)} To{" "}
                            {formatDate(details.toDate)}
                          </p>
                        ))}
                      </div>
                      <div className={style.feeColumns}>
                        <h5>Fee</h5>
                        {policy.map((details, i) => (
                          <p key={i}>
                            {details.chargeType == 1
                              ? `Rs. ${details.charge}`
                              : details.chargeType == 2
                              ? `${details.charge}%`
                              : details.chargeType == 3
                              ? `${details.charge} Nights`
                              : ""}
                          </p>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
                {booking.BookRoomDetails != null &&
                booking.BookRoomDetails?.CheckInDate != null &&
                new Date(booking.BookRoomDetails?.CheckInDate) >= new Date() ? (
                  <label className={style.checkboxLabel}>
                    <input
                      type="checkbox"
                      checked={agreed}
                      onChange={handleAgreeCheckbox}
                    />
                    I agree with terms and conditions
                  </label>
                ) : (
                  <></>
                )}
                {booking.BookRoomDetails != null &&
                booking.BookRoomDetails?.CheckInDate != null &&
                new Date(booking.BookRoomDetails?.CheckInDate) >= new Date() ? (
                  <button
                    className={style["cancelButton"]}
                    disabled={!agreed}
                    onClick={agreed ? cancelBooking : ""}
                  >
                    Cancel Booking
                  </button>
                ) : (
                  <></>
                )}
              </div>
            ))}
        </div>
      </div>
    ) : (
      <></>
    );
  }
}
