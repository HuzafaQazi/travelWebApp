import { useEffect, useState } from "react";
import style from "./Reserve.module.css";
import CommonHeader from "@/components/flights/commonHeader/commonHeader";
import B2CHeader from "@/components/flights/B2cHeader/Header";
import FlightDetails from "@/components/flights/flightDetails/flightDetails";
import Footer from "@/components/footer/footer";
import Loader from "@/components/loader/loader";
import config from "@/config";
import useLocalStorage from "@/hooks/useLocalStorage";
import { routeToPg } from "@/paymentGateways/pgRouting";
import { useLogin } from "@/store/context/LoginContext";
import {
  faArrowLeft,
  faCheck,
  faXmark,
  faTimesCircle,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import axios, { handleLogout } from "@/utils/axios/axios";
import { getTabSpecificData } from "@/utils/axios/axios";
import { useRouter } from "next/router";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  getPaymentGateway,
  getPaymentSessionID,
} from "../../../../utils/bookingAPI";
import { flightBookingDetail } from "../../../../utils/profileAPI";
import Image from "next/image";
import { logEvent } from "firebase/analytics";
import { analytics } from "../../../../utils/firebase";
import { getWalletBalance } from "../../../../utils/walletApis";
import { confirmPaymentFlights } from "../../../../utils/walletApis";
import Link from "next/link";
import { getUserStatus } from "@/utils/userStatus";
export default function FlightReserve() {
  const router = useRouter();
  const { booking_id } = router.query;
  const { setShowLoginButton } = useLogin();
  const { openFlightPricePopup } = useLogin();

  const [showTooltip, setShowTooltip] = useState(false);
  const [selectedFlightsData, setSelectedFlightsData] = useState(null);

  const [ssrPassengerIndex, setssrPassengerIndex] = useState(0);
  const [getuserip, setuserip] = useLocalStorage("userip");
  const [isToastVisible, setIsToastVisible] = useState(false);
  const [bookingData, setBookingData] = useState(null);
  const [reserveData, setReserveData] = useState(null);
  const [flightDetailsIsOpen, setFlightDetailsIsOpen] = useState(false);
  const [flightDetailsIndex, setFlightDetailsIndex] = useState(null);
  const [fareQuoteData, setFareQuoteData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoading1, setIsLoading1] = useState(false);
  const [swapStyle, setSwapStyle] = useState(false);
  const [isPaymentPopup, setIsPaymentPopup] = useState(false);
  const [getUserID, setUserID] = useLocalStorage("userID");
  const [walletBalance, setWalletBalance] = useState("");
  const [amountPayable, setamountPayable] = useState("");
  const [walletSelected, setWalletSelected] = useState(false);

  const handleClickOutside = (event) => {
    if (event.target.closest(`.${style.popupContent}`) === null) {
      setIsPaymentPopup(false);
    }
  };
  const handleClose = () => {
    setIsPaymentPopup(false);
  };

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
  useEffect(() => {
    const handleBrowserBack = () => {
      window.location.href = "/";
    };

    window.addEventListener("popstate", handleBrowserBack);

    return () => {
      window.removeEventListener("popstate", handleBrowserBack);
    };
  }, []);

  const checkwallet = async (e) => {
    console.log("check wallet");
    if (walletSelected) {
      setWalletSelected(false);
      setamountPayable(totalAmount);
    } else {
      setWalletSelected(true);
      let payable = 0;
      if (totalAmount > walletBalance) {
        payable = totalAmount - walletBalance;
      }
      // amountPayable = payable;
      setamountPayable(payable);
    }
  };

  const handlePaymentPopup = async () => {
    const resp = await getWalletBalance(getTabSpecificData("userID"));
    setamountPayable(totalAmount);
    setWalletSelected(false);
    setIsPaymentPopup(!isPaymentPopup);
    if (resp.status === "SUCCESS") {
      setWalletBalance(resp.data.balance);
    }
  };

  useEffect(() => {
    const encodedResponse = getTabSpecificData("selectedFlightData");

    const fetchData = async () => {
      let bookingId, pnr;
      if (encodedResponse || booking_id) {
        if (!booking_id) {
          // Decode from base64
          const decodedResponse = JSON.parse(atob(encodedResponse));

          pnr = decodedResponse.reserveResponse.bookingDetails[0].pnr;
          bookingId = decodedResponse.reserveResponse.bookingId;
          setReserveData(decodedResponse.reserveResponse);
        } else {
          bookingId = booking_id;
        }
        const storedUserIp = getTabSpecificData("userip");

        const bookingPayload = {
          getBookingDetailsReq: {
            endUserIp: storedUserIp == "undefined" ? null : storedUserIp,
            pnr,
            bookingId,
          },
        };
        const flightBookingDetailResp = await flightBookingDetail(
          bookingPayload
        );
        let response = flightBookingDetailResp.data;
        let flightWay = "domestic";
        if (flightBookingDetailResp.data.length === 1) {
          response = [
            {
              data: {
                ...flightBookingDetailResp.data[0].data,
                flightItinerary: {
                  ...flightBookingDetailResp.data[0].data.flightItinerary,
                  segments: [
                    flightBookingDetailResp.data[0].data.flightItinerary
                      .segments[0],
                  ],
                },
              },
              status: flightBookingDetailResp.data[0].status,
            },
            {
              data: {
                ...flightBookingDetailResp.data[0].data,
                flightItinerary: {
                  ...flightBookingDetailResp.data[0].data.flightItinerary,
                  segments: [
                    flightBookingDetailResp.data[0].data.flightItinerary
                      .segments[1],
                  ],
                },
              },
              status: flightBookingDetailResp.data[0].status,
            },
          ];
          flightWay = "international";
        }

        setBookingData({ ...response, flightWay });
      }
    };
    if (booking_id) {
      fetchData(); // Call the async function
    }
  }, [booking_id]);

  const formatTime = (isoTimeString) => {
    const date = new Date(isoTimeString);
    const hours = date.getHours().toString().padStart(2, "0");
    const minutes = date.getMinutes().toString().padStart(2, "0");
    return `${hours}:${minutes}`;
  };

  const handleContainerClick = (index) => {
    setssrPassengerIndex(index);
    setSwapStyle(!swapStyle);
  };

  // Format duration in the format "1 hr 30 mins"
  const formatDuration = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;

    const hoursText = hours > 0 ? `${hours} hr` : "";
    const minutesText = remainingMinutes > 0 ? ` ${remainingMinutes} mins` : "";

    return `${hoursText}${minutesText}`;
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

  const formatPrice = (price) => {
    return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };

  if (!bookingData) {
    return <Loader />;
  }

  const successBookingData = Object.values(bookingData).filter(
    (booking) => booking.status === "SUCCESS"
  );

  let totalAmount = 0;
  let travelerFare = 0;
  let ssrFare = 0;

  if (bookingData.flightWay === "international") {
    const data = successBookingData[0]?.data?.flightItinerary?.fare;
    totalAmount = data?.totalAmountWithSSR || 0;
    travelerFare = data?.offeredFareRoundedOff || 0;
    ssrFare = data?.ssrFare || 0;
  } else {
    totalAmount = successBookingData.reduce((acc, data) => {
      return acc + data?.data?.flightItinerary?.fare?.totalAmountWithSSR || 0;
    }, 0);

    travelerFare = successBookingData.reduce((acc, data) => {
      return (
        acc + data?.data?.flightItinerary?.fare?.offeredFareRoundedOff || 0
      );
    }, 0);

    ssrFare = successBookingData.reduce((acc, data) => {
      return acc + data?.data?.flightItinerary?.fare?.ssrFare || 0;
    }, 0);
    // setamountPayable(totalAmount);
  }
  // let amountPayable = totalAmount;
  // setAmountPayable(totalAmount);

  const handleCancelReserveClick = async () => {
    setIsLoading1(true);
    try {
      const userId = getTabSpecificData("userID");
      const reponse = await getUserStatus(userId);

      if (reponse.data.status === "inactive") {
        console.log("logout check");
        await handleLogout();
        return;
      }
      // let bookingId, pnr;
      // if (bookingData?.[0]?.status === "SUCCESS") {
      //   bookingId = bookingData?.[0]?.data?.bookingId;
      //   pnr = bookingData?.[0]?.data?.pnr;
      // } else if (bookingData?.[1]?.status === "SUCCESS") {
      //   bookingId = bookingData?.[1]?.data?.bookingId;
      //   pnr = bookingData?.[1]?.data?.pnr;
      // }

      const bookingId =
        bookingData?.[0]?.data?.bookingId || bookingData?.[1]?.data?.bookingId;
      const pnr = bookingData?.[0]?.data?.pnr || bookingData?.[1]?.data?.pnr;
      if (bookingId && pnr) {
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
          if (!isToastVisible) {
            toast("Reservation cancelled successfully");
            setIsToastVisible(true);

            // Reset the flag after a specific duration (e.g., 3 seconds)
            setTimeout(() => {
              setIsToastVisible(false);
            }, 6000);
          }
          router.push("/");
        }
      }
      logEvent(analytics, "tw_cancel_reservation", {
        bookingId: bookingId,
        pnr: pnr,
      });
    } catch (error) {
      console.log("Error calling Reserve API:", error);
      let errorMessage =
        error?.response?.data?.error?.errormessage ||
        "Something went wrong, please try after some time";
      if (
        error?.response?.data?.error?.errorMessage?.[0]?.data ===
        "Session timeout!!"
        // ||
        //   error?.response?.data?.error?.errorMessage?.[0]?.data === "Fare Quote failed from the Supplier end. Please try again."
      ) {
        errorMessage =
          "Oops! Your session has expired. Please search Flights again.";
        setTimeout(() => {
          router.push("/"); // Redirect to a specific page
        }, 2000);
      } else if (
        error?.response?.data?.error?.errorMessage?.[0]?.data ===
        "Fare Quote failed from the Supplier end. Please try again."
      ) {
        errorMessage = "Something went wrong, please select different flight";
        setTimeout(() => {
          router.push("/flights/twoway/list");
        }, 2000);
      } else if (
        error?.response?.Error?.ErrorMessage?.Error ===
          "userId doesnot exists" ||
        error?.response?.Error?.ErrorCode === "400"
      ) {
        await handleLogout();
      }
      if (!isToastVisible) {
        toast(errorMessage);
        setIsToastVisible(true);

        // Reset the flag after a specific duration (e.g., 3 seconds)
        setTimeout(() => {
          setIsToastVisible(false);
        }, 6000);
      }
      setIsLoading1(false);
    }
  };

  const handleProceedToPayClick = async () => {
    const bookingId =
      bookingData?.[0]?.data?.bookingId || bookingData?.[1]?.data?.bookingId;
    setIsLoading(true);

    try {
      const userId = getTabSpecificData("userID");
      const reponse = await getUserStatus(userId);

      if (reponse.data.status === "inactive") {
        console.log("logout check");
        await handleLogout();
        return;
      }
      const pnr = bookingData?.[0]?.data?.pnr || bookingData?.[1]?.data?.pnr;
      const bookingPaymentRefId =
        bookingData?.[0]?.data?.bookingPaymentRefId ||
        bookingData?.[1]?.data?.bookingPaymentRefId;
      await handlePayment(totalAmount, bookingId, bookingPaymentRefId);
      logEvent(analytics, "twrv_proceed_to_pay", {
        bookingId: bookingId,
      });
    } catch (error) {
      console.error("Error calling API:", error);
      let errorMessage =
        error?.response?.data?.error?.errormessage ||
        "Something went wrong, please try after some time";
      // toast(errorMessage);
      if (
        error?.response?.data?.error?.errorMsg?.[0]?.data?.message ===
          "Session timeout!!" ||
        "session expired"
        //  ||
        // error?.response?.data?.error?.errorMessage?.[0]?.data ===
        // "Fare Quote failed from the Supplier end. Please try again."
      ) {
        errorMessage =
          "Oops! Your session has expired. Please search Flights again.";
        setTimeout(() => {
          router.push("/"); // Redirect to a specific page
        }, 2000);
      } else if (
        error?.response?.data?.error?.errorMsg?.[0]?.data?.message ===
        "Fare Quote failed from the Supplier end. Please try again."
      ) {
        errorMessage = "Something went wrong, please select different flight";
        setTimeout(() => {
          router.push("/flights/twoway/list");
        }, 2000);
      } else if (
        error?.response?.Error?.ErrorMessage?.Error ===
          "userId doesnot exists" ||
        error?.response?.Error?.ErrorCode === "400"
      ) {
        await handleLogout();
      }
      if (!isToastVisible) {
        // toast("Oops! your session is expired. Please search Flights again.");
        toast(errorMessage);
        setIsToastVisible(true);

        // Reset the flag after a specific duration (e.g., 3 seconds)
        setTimeout(() => {
          // router.push("/flights");
          setIsToastVisible(false);
        }, 6000);
      }
    }
    setIsLoading(false);
    setIsPaymentPopup(false);
  };

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
          totalAmount - amountPayable,
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

  const handleFlightDetailsClick = (index, flightDetails) => {
    const updatedFlightData = {
      segments: flightDetails,
    };
    setFlightDetailsIsOpen(true);
    setFlightDetailsIndex(index);
    setFareQuoteData(updatedFlightData);
  };

  const closeFlightDetails = (index) => {
    setFlightDetailsIsOpen(false);
    setFlightDetailsIndex((prev) => prev === index && null);
  };

  const adultCount = parseInt(
    bookingData?.[0]?.data?.flightItinerary?.noOfadults
  );
  const childCount = parseInt(
    bookingData?.[0]?.data?.flightItinerary?.noOfchildren
  );
  const infantCount = parseInt(
    bookingData?.[0]?.data?.flightItinerary?.noOFinfants
  );

  const totalPassengerCount = adultCount + childCount + infantCount;

  const outboundSegment =
    bookingData?.[0]?.data?.flightItinerary?.segments[0]?.segment;

  // If there is only one result inside the segment, consider it as both origin and destination
  let outboundOrigin, outboundDestination, outboundDuration;
  if (outboundSegment) {
    outboundOrigin =
      outboundSegment?.length === 1
        ? outboundSegment?.[0]?.origin
        : outboundSegment?.[0]?.origin;
    outboundDestination =
      outboundSegment?.length === 1
        ? outboundSegment?.[0]?.destination
        : outboundSegment[outboundSegment?.length - 1].destination;

    // Calculate total duration for all segments
    outboundDuration = outboundSegment?.reduce(
      (totalDuration, segment) => totalDuration + segment.duration,
      0
    );
  }

  const inboundSegment =
    bookingData?.[1]?.data?.flightItinerary?.segments[0]?.segment;

  // If there is only one result inside the segment, consider it as both origin and destination
  let inboundOrigin, inboundDestination, inboundDuration;
  if (inboundSegment) {
    inboundOrigin =
      inboundSegment?.length === 1
        ? inboundSegment?.[0]?.origin
        : inboundSegment?.[0]?.origin;
    inboundDestination =
      inboundSegment?.length === 1
        ? inboundSegment?.[0]?.destination
        : inboundSegment[inboundSegment?.length - 1].destination;

    // Calculate total duration for all segments
    inboundDuration = inboundSegment?.reduce(
      (totalDuration, segment) => totalDuration + segment.duration,
      0
    );
  }

  const outJourneyDuration =
    bookingData?.[0]?.data?.flightItinerary?.segments[0]?.journeyDuration;
  const inJourneyDuration =
    bookingData?.[1]?.data?.flightItinerary?.segments[0]?.journeyDuration;

  const getMinLastTicketDate = () => {
    const date1 = new Date(
      bookingData[0]?.data?.flightItinerary?.lastTicketDate
    );
    const date2 = new Date(
      bookingData[1]?.data?.flightItinerary?.lastTicketDate
    );

    if (date1 < date2) {
      return date1;
    } else {
      return date2;
    }
  };

  const minLastTicketDate = getMinLastTicketDate();

  return (
    <>
      <div className={style.desktopBg}>
        {/* <CommonHeader /> */}
        <B2CHeader />
        <div className={style.successContent}>
          <div className={style.iconStatus}>
            <FontAwesomeIcon
              icon={
                bookingData?.[0]?.status !== "SUCCESS" ||
                bookingData?.[0]?.data?.bookingStatus === "EXPIRED"
                  ? faXmark
                  : faCheck
              }
              className={
                bookingData?.[0]?.status !== "SUCCESS" ||
                bookingData?.[0]?.data?.bookingStatus === "EXPIRED"
                  ? style.failedIcon
                  : style.confirmIcon
              }
            />
            <div className={style.successDetails}>
              <span className={style.successHead}>
                {bookingData?.[0]?.data?.bookingStatus === "EXPIRED"
                  ? "Reserve Expired"
                  : bookingData?.[0]?.status === "SUCCESS"
                  ? "Reserved Successfully"
                  : bookingData?.[0]?.status === "FAILED" &&
                    bookingData?.[0]?.data?.bookingStatus === "CANCELLED"
                  ? "Reserve Cancelled"
                  : "Reserve Failed"}
              </span>
              {bookingData?.[0]?.status === "SUCCESS" &&
                bookingData?.[0]?.data?.bookingStatus !== "EXPIRED" && (
                  <div className={style.successData}>
                    Booking details will be sent on your contact number{" "}
                    <span className={style.highlightData}>
                      {
                        bookingData?.[0]?.data?.flightItinerary?.passengers?.[0]
                          ?.contactNo
                      }
                    </span>{" "}
                    and email id{" "}
                    <span className={style.highlightData}>
                      {
                        bookingData?.[0]?.data?.flightItinerary?.passengers?.[0]
                          ?.email
                      }
                    </span>
                  </div>
                )}
            </div>
          </div>
          {bookingData?.[0]?.status === "SUCCESS" &&
            bookingData?.[0]?.data?.bookingStatus !== "EXPIRED" && (
              <div className={style.pnrDetails}>
                <div style={{ display: "block", gap: "4%" }}>
                  <div>
                    Booking ID :{" "}
                    <span style={{ fontWeight: "400" }}>
                      {bookingData?.[0]?.data?.bookingId}
                    </span>
                  </div>
                  <div>
                    Reserved on :{" "}
                    <span style={{ fontWeight: "400" }}>
                      {formatBookingDateTime(
                        bookingData?.[0]?.data?.reservedDate
                      )}
                    </span>
                  </div>
                </div>
                <div>
                  Expires on:{" "}
                  <span style={{ fontWeight: "400" }}>
                    {formatBookingDateTime(minLastTicketDate)}
                    {/* {formatBookingDateTime(bookingData?.[1]?.data?.flightItinerary?.lastTicketDate)} */}
                  </span>
                </div>
              </div>
            )}

          {/* outbound flight */}
          <div className={style.flightDetailsCardContent}>
            <div className={style.airlinesLogoClass}>
              <div className={style.tk1}>
                <div className={style.abovedestopcard}>
                  Departure
                  {bookingData?.[0]?.status === "SUCCESS" &&
                    bookingData?.[0]?.data?.bookingStatus !== "EXPIRED" && (
                      <div className={style.pnrNum}>
                        PNR : {bookingData?.[0]?.data.pnr}
                      </div>
                    )}
                </div>
              </div>

              {/* conditional visibility on reserve success  */}
              {bookingData?.[0]?.status === "SUCCESS" &&
                bookingData?.[0]?.data?.bookingStatus !== "EXPIRED" && (
                  <>
                    <span className={style.desktopWay}>
                      {outboundSegment?.[0]?.cabinClassName}
                    </span>
                    <span className={style.desktopWay}>
                      {bookingData?.[0]?.data?.flightItinerary?.journeyTypeName}
                    </span>
                  </>
                )}

              {/* airline details */}
              <div
                style={{
                  textAlign: "right",
                  display: "flex",
                  flexDirection: "row",
                }}
              >
                {/* <FontAwesomeIcon icon={faPlaneUp} /> */}
                {outboundSegment?.[0]?.airline?.airlineLogoUrl ? (
                  <Image
                    src={outboundSegment?.[0]?.airline?.airlineLogoUrl}
                    alt="logo"
                    width={30}
                    height={30}
                  />
                ) : (
                  <Image src="default_logo_url" alt="Default Logo" />
                )}
                <div
                  style={{
                    marginLeft: "5px",
                    color: "#878786",
                    lineHeight: "1",
                    fontSize: "14px",
                  }}
                >
                  {outboundSegment?.[0]?.airline?.airlineName}
                  <div
                    style={{
                      color: "#878786",
                      lineHeight: "1.5",
                      fontSize: "10px",
                    }}
                  >
                    {outboundSegment?.[0]?.airline?.flightNumber} -{" "}
                    {outboundSegment?.[0]?.airline?.airlineCode}
                  </div>
                </div>
              </div>
            </div>
            {/* <div className={style.flightDetailsCardDate}>Fri, July 16th, 23</div> */}
            <div className={style.fromToTiming}>
              <div style={{ display: "flex", flexDirection: "column" }}>
                <span className={style.fromToTime}>
                  {formatTime(outboundOrigin?.depTime)}
                </span>
                <span className={style.fromToCityName}>
                  {outboundOrigin?.airport?.cityName} (
                  {outboundOrigin?.airport?.cityCode})
                </span>
                {formatDate(outboundOrigin?.depTime)}
              </div>
              <div className={style.btwLineContent}>
                <div className={style.dashLineText}>
                  {formatDuration(outJourneyDuration)}
                </div>
                <div className={style.dashLine}></div>
                <div className={style.dashLineText}>
                  {bookingData?.[0]?.data?.flightItinerary?.segments[0]?.stops}{" "}
                  {bookingData?.[0]?.data?.flightItinerary?.segments[0]
                    ?.stops <= 1
                    ? "Stop"
                    : "Stops"}
                </div>
              </div>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  textAlign: "end",
                }}
              >
                <span className={style.fromToTime}>
                  {formatTime(outboundDestination?.arrTime)}
                </span>
                <span className={style.fromToCityName}>
                  {outboundDestination?.airport?.cityName} (
                  {outboundDestination?.airport?.cityCode})
                </span>
                {formatDate(outboundDestination?.arrTime)}
              </div>
            </div>
            <div className={style.flightDetailsAirports}>
              <div style={{ width: "35%", color: "#878786" }}>
                {outboundOrigin?.airport?.airportName},
                {outboundOrigin?.airport?.countryName}
                <br />
                {outboundOrigin?.airport?.terminal && (
                  <span style={{ color: "#028fa3" }}>
                    Terminal {outboundOrigin?.airport?.terminal}
                  </span>
                )}
              </div>
              <div
                style={{
                  alignSelf: "end",
                  color: "#878786",
                  width: "35%",
                  textAlign: "end",
                }}
              >
                {outboundDestination?.airport?.airportName},
                {outboundDestination?.airport?.countryName}
                <br />
                {outboundDestination?.airport?.terminal && (
                  <span style={{ color: "#028fa3" }}>
                    Terminal {outboundDestination?.airport?.terminal}
                  </span>
                )}
              </div>
            </div>
            {bookingData?.[0]?.status === "SUCCESS" &&
              bookingData?.[0]?.data?.bookingStatus !== "EXPIRED" && (
                <div
                  className={style.detailsToggle}
                  onClick={() =>
                    handleFlightDetailsClick(
                      0,
                      bookingData?.[0]?.data?.flightItinerary?.segments
                    )
                  }
                >
                  <span>Flight Details</span>
                </div>
              )}
            {flightDetailsIsOpen && (
              <div>
                <div
                  className={style.backdrop}
                  onClick={closeFlightDetails}
                ></div>
                <div
                  className={style.mainContainer}
                  style={{
                    display: flightDetailsIsOpen ? "block" : "none",
                  }}
                >
                  <button
                    onClick={closeFlightDetails}
                    className={style.backArrow}
                  >
                    <FontAwesomeIcon icon={faArrowLeft} />
                  </button>
                  <FlightDetails
                    onClose={closeFlightDetails}
                    fareQuote={fareQuoteData}
                  />
                </div>
              </div>
            )}
          </div>
          {/* outbound flight ends */}

          <div className={style.iconStatus}>
            <FontAwesomeIcon
              icon={
                bookingData?.[1]?.status !== "SUCCESS" ||
                bookingData?.[1]?.data?.bookingStatus === "EXPIRED"
                  ? faXmark
                  : faCheck
              }
              className={
                bookingData?.[1]?.status !== "SUCCESS" ||
                bookingData?.[1]?.data?.bookingStatus === "EXPIRED"
                  ? style.failedIcon
                  : style.confirmIcon
              }
            />
            <div className={style.successDetails}>
              <span className={style.successHead}>
                {bookingData?.[1]?.data?.bookingStatus === "EXPIRED"
                  ? "Reserve Expired"
                  : bookingData?.[1]?.status === "SUCCESS"
                  ? "Reserved Successfully"
                  : bookingData?.[1]?.status === "FAILED" &&
                    bookingData?.[1]?.data?.bookingStatus === "CANCELLED"
                  ? "Reserve Cancelled"
                  : "Reserve Failed"}
              </span>
              {bookingData?.[1]?.status === "SUCCESS" &&
                bookingData?.[1]?.data?.bookingStatus !== "EXPIRED" && (
                  <div className={style.successData}>
                    Booking details will be sent on your contact number{" "}
                    <span className={style.highlightData}>
                      {
                        bookingData?.[1]?.data?.flightItinerary?.passengers?.[0]
                          ?.contactNo
                      }
                    </span>{" "}
                    and email id{" "}
                    <span className={style.highlightData}>
                      {
                        bookingData?.[1]?.data?.flightItinerary?.passengers?.[0]
                          ?.email
                      }
                    </span>
                  </div>
                )}
            </div>
          </div>
          {bookingData?.[1]?.status === "SUCCESS" &&
            bookingData?.[1]?.data?.bookingStatus !== "EXPIRED" && (
              <div className={style.pnrDetails}>
                <div style={{ display: "block", gap: "4%" }}>
                  <div>
                    Booking ID :{" "}
                    <span style={{ fontWeight: "400" }}>
                      {bookingData?.[1]?.data?.bookingId}
                    </span>
                  </div>
                  <div>
                    Reserved on :{" "}
                    <span style={{ fontWeight: "400" }}>
                      {formatBookingDateTime(
                        bookingData?.[1]?.data?.reservedDate
                      )}
                    </span>
                  </div>
                </div>
                <div>
                  Expires on:{" "}
                  <span style={{ fontWeight: "400" }}>
                    {formatBookingDateTime(minLastTicketDate)}
                  </span>
                </div>
              </div>
            )}

          {/* inbound Flight */}
          <div className={style.flightDetailsCardContent}>
            <div className={style.airlinesLogoClass}>
              <div className={style.tk1}>
                <div className={style.abovedestopcard}>
                  Return
                  {bookingData?.[1]?.status === "SUCCESS" &&
                    bookingData?.[1]?.data?.bookingStatus !== "EXPIRED" && (
                      <div className={style.pnrNum}>
                        {" "}
                        PNR : {bookingData?.[1]?.data.pnr}{" "}
                      </div>
                    )}
                </div>
              </div>

              {bookingData?.[1]?.status === "SUCCESS" &&
                bookingData?.[1]?.data?.bookingStatus !== "EXPIRED" && (
                  <>
                    <span className={style.desktopWay}>
                      {inboundSegment?.[0]?.cabinClassName}
                    </span>
                    <span className={style.desktopWay}>
                      {bookingData?.[1]?.data?.flightItinerary?.journeyTypeName}
                    </span>
                  </>
                )}

              <div
                style={{
                  textAlign: "right",
                  display: "flex",
                  flexDirection: "row",
                }}
              >
                {inboundSegment?.[0]?.airline?.airlineLogoUrl ? (
                  <Image
                    src={inboundSegment?.[0]?.airline?.airlineLogoUrl}
                    alt="logo"
                    width={30}
                    height={30}
                  />
                ) : (
                  <img src="default_logo_url" alt="Default Logo" />
                )}
                <div
                  style={{
                    marginLeft: "5px",
                    color: "#878786",
                    lineHeight: "1",
                    fontSize: "14px",
                  }}
                >
                  {inboundSegment?.[0]?.airline?.airlineName}

                  <div
                    style={{
                      color: "#878786",
                      lineHeight: "1.5",
                      fontSize: "10px",
                    }}
                  >
                    {inboundSegment?.[0]?.airline?.flightNumber} -{" "}
                    {inboundSegment?.[0]?.airline?.airlineCode}
                  </div>
                </div>
              </div>
            </div>
            {/* <div className={style.flightDetailsCardDate}>Fri, July 16th, 23</div> */}
            <div className={style.fromToTiming}>
              <div style={{ display: "flex", flexDirection: "column" }}>
                <span className={style.fromToTime}>
                  {formatTime(inboundOrigin?.depTime)}
                </span>
                <span className={style.fromToCityName}>
                  {inboundOrigin?.airport?.cityName} (
                  {inboundOrigin?.airport?.cityCode})
                </span>
                {formatDate(inboundOrigin?.depTime)}
              </div>
              <div className={style.btwLineContent}>
                <div className={style.dashLineText}>
                  {formatDuration(inJourneyDuration)}
                </div>
                <div className={style.dashLine}></div>
                <div className={style.dashLineText}>
                  {bookingData?.[1]?.data?.flightItinerary?.segments[0]?.stops}{" "}
                  {bookingData?.[1]?.data?.flightItinerary?.segments[0]
                    ?.stops <= 1
                    ? "Stop"
                    : "Stops"}
                </div>
              </div>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  textAlign: "end",
                }}
              >
                <span className={style.fromToTime}>
                  {formatTime(inboundDestination?.arrTime)}
                </span>
                <span className={style.fromToCityName}>
                  {inboundDestination?.airport?.cityName} (
                  {inboundDestination?.airport?.cityCode})
                </span>
                {formatDate(inboundDestination?.arrTime)}
              </div>
            </div>
            <div className={style.flightDetailsAirports}>
              <div style={{ width: "35%", color: "#878786" }}>
                {inboundOrigin?.airport?.airportName},
                {inboundOrigin?.airport?.countryName}
                <br />
                {inboundOrigin?.airport?.terminal && (
                  <span style={{ color: "#028fa3" }}>
                    Terminal {inboundOrigin?.airport?.terminal}
                  </span>
                )}
              </div>
              <div
                style={{
                  alignSelf: "end",
                  color: "#878786",
                  width: "35%",
                  textAlign: "end",
                }}
              >
                {inboundDestination?.airport?.airportName},
                {inboundDestination?.airport?.countryName}
                <br />
                {inboundDestination?.airport?.terminal && (
                  <span style={{ color: "#028fa3" }}>
                    Terminal {inboundDestination?.airport?.terminal}
                  </span>
                )}
              </div>
            </div>
            {bookingData?.[1]?.status === "SUCCESS" &&
              bookingData?.[1]?.data?.bookingStatus !== "EXPIRED" && (
                <div
                  className={style.detailsToggle}
                  onClick={() =>
                    handleFlightDetailsClick(
                      1,
                      bookingData?.[1]?.data?.flightItinerary?.segments
                    )
                  }
                >
                  <span>Flight Details</span>
                </div>
              )}
          </div>
          {/* inbound Flight ends */}

          {(bookingData?.[0]?.status === "SUCCESS" ||
            bookingData?.[1]?.status === "SUCCESS") &&
            (bookingData?.[0]?.data?.bookingStatus !== "EXPIRED" ||
              bookingData?.[1]?.data?.bookingStatus !== "EXPIRED") && (
              <>
                <div className={style.detailsHeading}>Price Details</div>
                <div className={style.priceRows}>
                  <div className={style.desktopPriceHead}>Price Details</div>
                  <div className={style.priceRow}>
                    Traveler Fare
                    <span>{formatPrice(travelerFare)}</span>
                  </div>
                  <div className={style.priceRow}>
                    Special service charges
                    <span>{formatPrice(ssrFare?.toString() ?? "0")}</span>
                  </div>
                  <div className={style.priceRowHighlight}>
                    <div className={style.reserveBtn}>
                      Price
                      <span>Rs {formatPrice(totalAmount)}</span>
                    </div>
                    <div className={style.reserveBtnContainer}>
                      <button
                        className={style.cancelReserveBtn}
                        onClick={handleCancelReserveClick}
                        disabled={isLoading}
                      >
                        {isLoading1 ? (
                          <div className={style.loadingSpinner}></div>
                        ) : (
                          "Cancel Reservation"
                        )}
                      </button>
                      <button
                        className={style.proceedBtn}
                        onClick={handlePaymentPopup}
                      >
                        Proceed to Pay
                      </button>
                      {isPaymentPopup && (
                        <div className={style.popupOverlay}>
                          <div className={style.popupContent}>
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
                                <div
                                  style={{
                                    display: "flex",
                                    flexDirection: "row",
                                  }}
                                >
                                  <span style={{ textWrap: "nowrap" }}>
                                    Wallet Balance: Rs.
                                  </span>
                                  <span className={style.balanceAmount}>
                                    {walletBalance}
                                  </span>
                                </div>
                                <Link
                                  href={{
                                    pathname: "/walletDetails",
                                    query: {
                                      fromPage:
                                        typeof window !== "undefined"
                                          ? window.location.pathname +
                                            `?booking_id=${booking_id}`
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
                              onClick={handleProceedToPayClick}
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
                  </div>
                </div>
              </>
            )}

          <div className={style.detailsHeading}>Traveler Details</div>
          <div className={style.travelerDetails}>
            <span className={style.desktopTraveler}>Traveler Details</span>
            <div
              style={{
                display: "flex",
                gap: "2%",
                alignItems: "center",
                paddingLeft: "3%",
              }}
              className={style.travelerNames}
            >
              {/* <FontAwesomeIcon icon={faPenToSquare} style={{ color: '#028fa3' }} onClick={handleIconClick} /> */}
              {totalPassengerCount} Passengers | {adultCount} Adults |{" "}
              {childCount} Children | {infantCount} Infants
            </div>
            {/* <FontAwesomeIcon icon={faCaretDown} onClick={handleToggleTooltip} /> */}
            {bookingData[0]?.data.segmentPassengerSsr && (
              <div className={style.maincontainer}>
                <div
                  // className={
                  //   swapStyle ? style.waysContainer1 : style.waysContainer
                  // }
                  style={{
                    width: "100%",
                    display: "flex",
                    gap: "2%",
                    overflowX: "scroll",
                    scrollbarWidth: "none",
                  }}
                >
                  {bookingData?.[0]?.data?.segmentPassengerSsr?.map(
                    (segment, index) => (
                      <button
                        key={index}
                        className={
                          index === ssrPassengerIndex ? style.ways1 : style.ways
                        }
                        onClick={() => handleContainerClick(index)}
                      >
                        {segment?.origin}-{segment?.destination}
                      </button>
                    )
                  )}
                </div>
              </div>
            )}

            {bookingData[0]?.data.segmentPassengerSsr?.[
              ssrPassengerIndex
            ]?.ssr.map((ssrPassenger, index) => (
              <div key={index} className={style.passengersandseatdetails}>
                <div key={index} className={style.passengerdetails}>
                  {
                    <span className={style.traveller}>
                      {index === 0 ? "Traveler" : ""}
                    </span>
                  }
                  {/* <span>{travellerName} </span> */}

                  <span>{`${ssrPassenger?.passengerName} `}</span>
                </div>

                {/* ticket number */}
                <div className={style.passengerdetails}>
                  <span className={style.traveller}>
                    {index === 0 ? "Ticket Number" : ""}
                  </span>
                  <span>{ssrPassenger?.ticketNumber ?? "NA"}</span>
                </div>

                {/* {seatselection} */}
                <div className={style.passengerdetails}>
                  <span className={style.traveller}>
                    {index === 0 ? "Seat details" : ""}
                  </span>
                  <span>{ssrPassenger?.seatNumber ?? "NA"}</span>
                </div>

                {/* {meals selection} */}
                <div key={index} className={style.passengerdetails}>
                  <span className={style.traveller}>
                    {index === 0 ? "Meal details" : ""}
                  </span>
                  {/* <span>6A </span> */}
                  {ssrPassenger?.mealName ? (
                    <span
                      className={style.mealselection}
                    >{`${ssrPassenger?.mealName}`}</span>
                  ) : (
                    <span className={style.mealselection1}>NA</span>
                  )}
                </div>

                {/* {baggage selection} */}
                <div className={style.passengerdetails}>
                  <span className={style.traveller}>
                    {index === 0 ? "Cabin Baggage" : ""}
                  </span>
                  <span>{ssrPassenger?.cabbinBaggage ?? "NA"}</span>
                </div>
                <div className={style.passengerdetails}>
                  <span className={style.traveller}>
                    {index === 0 ? "Check-In Baggage" : ""}
                  </span>
                  <span>{ssrPassenger?.baggage ?? "NA"}</span>
                </div>
                <div className={style.passengerdetails}>
                  <span className={style.traveller}>
                    {index === 0 ? "Extra Baggage" : ""}
                  </span>
                  <span>{ssrPassenger?.otherBaggage ?? "NA"}</span>
                </div>
              </div>
            ))}
          </div>

          {/* tooltip for traveler */}

          {/* SideSheet  */}
        </div>
      </div>
      <Footer />
    </>
  );
}
