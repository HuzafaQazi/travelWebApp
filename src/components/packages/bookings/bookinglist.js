import "bootstrap/dist/css/bootstrap.css";
import style from "./styles.module.css";
import "reactjs-popup/dist/index.css";
import { redirectPackageDetail } from "../../../../utils/pageredirection";
import { useRouter } from "next/router";
import { logEvent } from "firebase/analytics";
import { analytics } from "../../../../utils/firebase";
import axios, { getTabSpecificData,setTabSpecificData } from "@/utils/axios/axios";

export default function BookingList({ booking, type ,onClose}) {
  const router = useRouter();

  function formatDate(inputDate) {
    const date = new Date(inputDate);

    const months = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];

    const ordinals = ["th", "st", "nd", "rd"];

    const day = date.getDate();
    const month = months[date.getMonth()];
    const year = date.getFullYear();

    const dayOrdinal =
      day % 10 <= 3 && (day < 10 || day > 20)
        ? ordinals[day % 10]
        : ordinals[0];

    return `${day}${dayOrdinal} ${month}, ${year}`;
  }

  function isBookingCompleted(bookingDate) {
    const currentDate = new Date();
    currentDate.setUTCHours(0, 0, 0, 0); // Set the time to midnight (00:00:00)
    const bookingDateObject = new Date(bookingDate);
    return currentDate > bookingDateObject;
  }

  const redirectToBookingDetail = () => {
    const url = `/packages/bookingdetail?booking_id=${booking.booking_id}`;
    router.push(url);
    onClose()
  };

  function getStatusText() {
    if (type === "all") {
      return booking.payment_status === 1 ? (
        isBookingCompleted(booking.date_of_travel) ? (
          <div onClick={redirectToBookingDetail}>COMPLETED</div>
        ) : (
          <div onClick={redirectToBookingDetail}>CONFIRMED</div>
        )
      ) : booking.payment_status === 2 ? (
        "FAILED"
      ) : (
        "PENDING"
      );
    } else if (type === "completed") {
      return isBookingCompleted(booking.date_of_travel) ? (
        <div onClick={redirectToBookingDetail}>COMPLETED</div>
      ) : (
        "PENDING"
      );
    } else if (type === "confirmed") {
      return booking.payment_status === 1 ? (
        <div onClick={redirectToBookingDetail}>CONFIRMED</div>
      ) : (
        <>
          <div onClick={redirectToBookingDetail}>PENDING</div>
          <div>Retry Payment</div>
        </>
      );
    } else {
      return "UNKNOWN";
    }
  }

  const handleRedirect = (id, title, country_name) => {
    const encodedPayload = btoa(JSON.stringify(booking));

    setTabSpecificData("packageBookingDetail", encodedPayload);

    const url = redirectPackageDetail(id, title, country_name);
    router.push(url);
    logEvent(analytics, "profile_package_redirect", {
      id,
      title,
      country_name,
    });
  };

  return (
    <div
      className={style.bookinglistitem}
      onClick={booking.payment_status !== 0 ? redirectToBookingDetail : null}
    >
      <div className={style.roombrief}>
        <div className={style.bold}>{booking.package_ref.title}</div>
        <div className={style.date}>{formatDate(booking.createdAt)}</div>
        <div className={style.customername}>
          {"BookingId : "}
          {booking.booking_id}|{"Passenger : "}
          {booking.user_name}
        </div>
        <hr className={style.customHr} />
        <div className={style}>
          <div className={style.arrangeButtons}>
            <div className={style.amountPaid}>
              Amount paid: Rs.{booking.total_price}
            </div>
          </div>
        </div>
      </div>

      <div className={style.bookingstatus}>
        <button
          className={
            booking.payment_status !== 1
              ? style.cancelledButton
              : style.completedButton
          }
          disabled={
            booking.payment_status !== 1 && booking.payment_status !== 0
          }
        >
          {getStatusText()}
        </button>
        {booking.payment_status === 0 && (
          <div
            className={style.retryPayment}
            onClick={() =>
              handleRedirect(
                booking.package_id,
                booking.package_ref.title,
                booking.package_ref.countryname
              )
            }
          >
            Retry Payment
          </div>
        )}
      </div>
    </div>
  );
}
