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
  faCheck, faXmark,
  faTimesCircle
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import axios, { handleLogout } from '@/utils/axios/axios';
import { getTabSpecificData, setTabSpecificData, removeTabSpecificData } from "@/utils/axios/axios";
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
;

export default function FlightReserve() {
  const router = useRouter();
  const { setShowLoginButton } = useLogin();
  const { booking_id } = router.query;
  const { openFlightPricePopup } = useLogin();

  const [showTooltip, setShowTooltip] = useState(false);
  const [getuserip, setuserip] = useLocalStorage("userip");
  const [isToastVisible, setIsToastVisible] = useState(false);
  const [ssrPassengerIndex, setssrPassengerIndex] = useState(0);
  const [bookingData, setBookingData] = useState(null);
  const [reserveData, setReserveData] = useState(null);
  const [swapStyle, setSwapStyle] = useState(false);
  const [flightDetailsIsOpen, setFlightDetailsIsOpen] = useState(false);
  const [flightDetailsIndex, setFlightDetailsIndex] = useState(null);
  const [fareQuoteData, setFareQuoteData] = useState(null);
  const [isPaymentPopup, setIsPaymentPopup] = useState(false);
  const [getUserID, setUserID] = useLocalStorage("userID");
  const [walletBalance, setWalletBalance] = useState("");
  const [walletSelected, setWalletSelected] = useState(false);
  const [amountPayable, setAmountPayable] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const checkwallet = async (e) => {
    console.log("check wallet");
    if (walletSelected) {
      setWalletSelected(false);
      setAmountPayable(bookingData?.flightItinerary?.fare?.totalAmountWithSSR);
    } else {
      setWalletSelected(true);
      let payable = 0;
      if (bookingData?.flightItinerary?.fare?.totalAmountWithSSR > walletBalance) {
        payable = bookingData?.flightItinerary?.fare?.totalAmountWithSSR - walletBalance;
      }
      setAmountPayable(payable);
    }
    // console.log("bdfkjbfe: ",walletSelected); 
  };

  const handlePaymentPopup = async () => {
    const resp = await getWalletBalance(getTabSpecificData("userID"));
    setIsPaymentPopup(!isPaymentPopup);
    if (resp.status === "SUCCESS") {
      setWalletBalance(resp.data.balance);
    }
  }

  const handleClose = () => {
    setIsPaymentPopup(false);
  };

  const handleClickOutside = (event) => {
    if (event.target.closest(`.${style.popupContent}`) === null) {
      setIsPaymentPopup(false);
    }
  };

  useEffect(() => {
    if (isPaymentPopup) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
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
  const handleContainerClick = (index) => {
    setSwapStyle(!swapStyle);
    setssrPassengerIndex(index);
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
        setBookingData({
          ...flightBookingDetailResp.data[0].data,
          status: flightBookingDetailResp.data[0].status,
        });
        if (!walletSelected)
          setAmountPayable(flightBookingDetailResp.data[0].data.flightItinerary?.fare?.totalAmountWithSSR);

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

  function calculateTotalPrice(updatedPriceDetails) {
    if (selectedFlightsData && updatedPriceDetails) {
      const searchReqData = selectedFlightsData.flightsRequest.searchReqData;
      const adultPrice =
        searchReqData.adultCount * updatedPriceDetails.offeredFareRoundedOff;
      const childPrice =
        searchReqData.childCount * updatedPriceDetails.offeredFareRoundedOff;
      const totalFare = adultPrice + childPrice;

      return totalFare;
    }
  }

  const handleCancelReserveClick = async () => {
    try {

      const userId = getTabSpecificData("userID");
      const reponse = await getUserStatus(userId);

      if (reponse.data.status === 'inactive') {
        await handleLogout();
        return;
      }
      const storedUserIp = getTabSpecificData("userip");
      const bookingId = bookingData.bookingId;
      const pnr = bookingData.pnr;
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
      logEvent(analytics, 'mc_cancel_reservation', {
        bookingId: bookingId,
        pnr: pnr,
      })
    } catch (error) {
      console.log("Error calling Reserve API:", error);
      let errorMessage =
        error?.response?.data?.error?.errormessage ||
        "Something went wrong, please try after some time";

      if (
        error?.response?.data?.error?.errorMessage?.[0]?.data ===
        "Session timeout!!"
        // ||
        // error?.response?.data?.error?.errorMessage?.[0]?.data ===
        // "Fare Quote failed from the Supplier end. Please try again."
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
          router.push("/flights/oneway/list");
        }, 2000);
      }
      else if (
        error?.response?.Error?.ErrorMessage?.Error === "userId doesnot exists" || error?.response?.Error?.ErrorCode === '400'
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
    }
  };

  const handleProceedToPayClick = async () => {
    setIsLoading(true)
    try {
      const userId = getTabSpecificData("userID");
      const reponse = await getUserStatus(userId);

      if (reponse.data.status === 'inactive') {
        console.log('logout check');
        await handleLogout();
        return;
      }
      const bookingId = bookingData.bookingId;
      const bookingPaymentRefId = bookingData.bookingPaymentRefId;
      const totalAmount =
        bookingData?.flightItinerary?.fare?.totalAmountWithSSR;
      await handlePayment(totalAmount, bookingId, bookingPaymentRefId);
      logEvent(analytics, 'mcrv_proceed_to_pay', {
        bookingId: bookingId,
      })
    } catch (error) {
      console.error("Error calling API:", error);
      let errorMessage =
        error?.response?.data?.error?.errormessage ||
        "Something went wrong, please try after some time";
      // toast(errorMessage);

      if (
        error?.response?.data?.error?.errorMsg?.[0]?.data?.message ===
        "Session timeout!!"
        // ||
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
          router.push("/flights/oneway/list");
        }, 2000);
      }
      else if (
        error?.response?.Error?.ErrorMessage?.Error === "userId doesnot exists" || error?.response?.Error?.ErrorCode === '400'
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
      setIsLoading(true)
    }
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
          Math.max(0,totalAmount - parseFloat(amountPayable)),
          0,
          "BOOKING",
          bookingId,
          parseFloat(amountPayable),
          mobileNumber,
          pgRes.data.pgCode,
          2,
          bookingPaymentRef,
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
            queryParams, bookingId,
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
          bookingPaymentRefIds: [],
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

  const adultCount = parseInt(bookingData?.flightItinerary?.noOfadults);
  const childCount = parseInt(bookingData?.flightItinerary?.noOfchildren);
  const infantCount = parseInt(bookingData?.flightItinerary?.noOFinfants);

  const totalPassengerCount = adultCount + childCount + infantCount;

  return (
    <>
      <div className={style.desktopBg}>
        {/* <CommonHeader /> */}
        <B2CHeader/>

        <div className={style.successContent}>
          <div className={style.iconStatus}>
            <FontAwesomeIcon
              icon={
                bookingData?.status !== "SUCCESS" ||
                  bookingData?.bookingStatus === "EXPIRED"
                  ? faXmark
                  : faCheck
              }
              className={
                bookingData?.status !== "SUCCESS" ||
                  bookingData?.bookingStatus === "EXPIRED"
                  ? style.failedIcon
                  : style.confirmIcon
              }
            />
            <div className={style.successDetails}>
              <span className={style.successHead}>
                {bookingData?.bookingStatus === "EXPIRED"
                  ? "Reserve Expired"
                  : bookingData?.status === "SUCCESS"
                    ? "Reserved Successfully"
                    : bookingData?.status === "FAILED" &&
                      bookingData?.bookingStatus === "CANCELLED"
                      ? "Reserve Cancelled"
                      : "Reserve Failed"}
              </span>
              {bookingData?.status === "SUCCESS" &&
                bookingData?.bookingStatus !== "EXPIRED" && (
                  <div className={style.successData}>
                    Booking details will be sent on your contact number{" "}
                    <span className={style.highlightData}>
                      {bookingData?.flightItinerary?.passengers?.[0]?.contactNo}
                    </span>{" "}
                    and email id{" "}
                    <span className={style.highlightData}>
                      {bookingData?.flightItinerary?.passengers?.[0]?.email}
                    </span>
                  </div>
                )}
            </div>
          </div>
          {bookingData?.status === "SUCCESS" &&
            bookingData?.bookingStatus !== "EXPIRED" && (
              <div className={style.pnrDetails}>
                <div>
                  Reserved on :{" "}
                  <span style={{ fontWeight: "400" }}>
                    {formatBookingDateTime(bookingData?.reservedDate)}
                  </span>
                </div>
                <div style={{ display: "flex", gap: "4%" }}>
                  <div>
                    Booking ID :{" "}
                    <span style={{ fontWeight: "400" }}>
                      {bookingData?.bookingId}
                    </span>
                  </div>
                  <div>
                    PNR:{" "}
                    <span style={{ fontWeight: "400" }}>
                      {bookingData?.pnr}
                    </span>
                  </div>
                </div>
                <div>
                  Expires on :{" "}
                  <span style={{ fontWeight: "400" }}>
                    {formatBookingDateTime(
                      bookingData?.flightItinerary?.lastTicketDate
                    )}
                  </span>
                </div>
              </div>
            )}

          {/* <div className={style.detailsHeading}>Flight Details</div> */}

          {bookingData.flightItinerary.segments.map((segmentData, index) => {
            const segment = segmentData.segment;
            const origin = segment[0]?.origin;
            const destination = segment[segment.length - 1]?.destination;
            const journeyDuration = segmentData.journeyDuration;

            return (
              <div key={index} className={style.flightDetailsCardContent}>
                <div className={style.airlinesLogoClass}>
                  <div
                    style={{
                      textAlign: "right",
                      display: "flex",
                      flexDirection: "row",
                    }}
                  >
                    {segment?.[0]?.airline?.airlineLogoUrl ? (
                      <Image
                        src={segment?.[0]?.airline?.airlineLogoUrl}
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
                      {segment?.[0]?.airline?.airlineName}

                      <div
                        style={{
                          color: "#878786",
                          lineHeight: "1.5",
                          fontSize: "10px",
                        }}
                      >
                        {segment?.[0]?.airline?.flightNumber}
                        {""} |{""} {segment?.[0]?.airline?.airlineCode}
                      </div>
                    </div>
                  </div>
                  <span>{bookingData?.flightItinerary?.journeyTypeName}</span>
                  <span>{segment?.[0]?.cabinClassName}</span>
                </div>
                <div className={style.fromToTiming}>
                  <div style={{ display: "flex", flexDirection: "column" }}>
                    <span className={style.fromToTime}>
                      {" "}
                      {formatTime(origin?.depTime)}
                    </span>
                    <span className={style.fromToCityName}>
                      {origin?.airport?.cityName} ({origin?.airport?.cityCode})
                    </span>
                    {formatDate(origin?.depTime)}
                  </div>
                  <div className={style.btwLineContent}>
                    <div className={style.dashLineText}>
                      {formatDuration(journeyDuration)}
                    </div>
                    <div className={style.dashLine}></div>
                    <div className={style.dashLineText}>
                      {bookingData?.flightItinerary?.segments[index]?.stops} {bookingData?.flightItinerary?.segments[index]?.stops <= 1 ? 'Stop' : 'Stops'}
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
                      {formatTime(destination?.arrTime)}
                    </span>
                    <span className={style.fromToCityName}>
                      {destination?.airport?.cityName} (
                      {destination?.airport?.cityCode})
                    </span>
                    {formatDate(destination?.arrTime)}
                  </div>
                </div>
                <div className={style.flightDetailsAirports}>
                  <div style={{ width: "35%", color: "#878786" }}>
                    {origin?.airport?.airportName},{" "}
                    {origin?.airport?.countryName}
                    <br />
                    {origin?.airport?.terminal && (
                      <span style={{ color: "#028fa3" }}>
                        Terminal {origin?.airport?.terminal}
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
                    {destination?.airport?.airportName},
                    {destination?.airport?.countryName}
                    <br />
                    {destination?.airport?.terminal && (
                      <span style={{ color: "#028fa3" }}>
                        Terminal {destination?.airport?.terminal}
                      </span>
                    )}
                  </div>
                </div>
                {bookingData?.status === "SUCCESS" &&
                  bookingData?.bookingStatus !== "EXPIRED" && (
                    <div
                      className={style.detailsToggle}
                      onClick={() =>
                        handleFlightDetailsClick(index, [segmentData])
                      }
                    >
                      <span>Flight Details</span>
                    </div>
                  )}
                {flightDetailsIsOpen && flightDetailsIndex === index && (
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
            );
          })}

          {bookingData?.status === "SUCCESS" &&
            bookingData?.bookingStatus !== "EXPIRED" && (
              <>
                <div className={style.detailsHeading}>Price Details</div>
                <div className={style.priceRows}>
                  <div className={style.desktopPriceHead}>Price Details</div>
                  <div className={style.priceRow}>
                    Traveler Fare
                    <span>
                      {formatPrice(
                        bookingData?.flightItinerary?.fare
                          ?.offeredFareRoundedOff
                      )}
                    </span>
                  </div>
                  <div className={style.priceRow}>
                    Special service charges
                    <span>
                      {formatPrice(
                        bookingData?.flightItinerary?.fare?.ssrFare?.toString() ||
                        0
                      )}
                    </span>
                  </div>
                  {/* <div className={style.priceRow}>
              Baggage
              <span>0</span>
            </div> */}
                  <div className={style.priceRowHighlight}>
                    <div className={style.reserveBtn}>
                      Price
                      <span>
                        Rs{" "}
                        {formatPrice(
                          bookingData?.flightItinerary?.fare?.totalAmountWithSSR
                        )}
                      </span>
                    </div>
                    <div className={style.reserveBtnContainer}>
                      <button
                        className={style.cancelReserveBtn}
                        onClick={handleCancelReserveClick}
                      >
                        Cancel Reservation
                      </button>
                      <button
                        className={style.proceedBtn}
                        onClick={handlePaymentPopup}
                      >
                        Proceed to Pay
                      </button>
                      {isPaymentPopup && <div className={style.popupOverlay}>
                        <div className={style.popupContent}>
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
                              <span> Wallet Balance: Rs.</span>
                              <span className={style.balanceAmount}>{walletBalance}</span>
                              <Link
                                href={{
                                  pathname: '/walletDetails',
                                  query: {
                                    fromPage: typeof window !== 'undefined' ? window.location.pathname + `?booking_id=${booking_id}` : "/walletDetails",
                                  },
                                }}
                                as={`/walletDetails`}
                                className={{
                                  color: "blue",
                                  textdecoration: "underline"
                                }}
                                style={{ color: '#028fa3', textDecoration: 'underline' }}
                              >
                                Recharge now
                              </Link>
                            </div>
                          </div>
                          <button className={style.closeButton} onClick={handleProceedToPayClick} disabled={isLoading}>
                            {isLoading ? (
                              <div className={style.loadingSpinner}></div>
                            ) : (
                              !walletSelected || amountPayable > 0 ? `Proceed to Pay Rs. ${amountPayable}` : " Proceed to Book"
                            )}</button>
                        </div>
                      </div>}
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
                marginLeft: "2%",
              }}
              className={style.travelerNames}
            >
              {totalPassengerCount} Passengers | {adultCount} Adults |{" "}
              {childCount} Children | {infantCount} Infants
            </div>
            {bookingData?.segmentPassengerSsr && (
              <div className={style.maincontainer}>
                <div
                  className={style.segmentCities}
                >
                  {bookingData?.segmentPassengerSsr?.map((segment, index) => (
                    <button
                      key={index}
                      className={
                        index === ssrPassengerIndex ? style.ways1 : style.ways
                      }
                      onClick={() => handleContainerClick(index)}
                    >
                      {segment?.origin}-{segment?.destination}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {bookingData?.segmentPassengerSsr?.[ssrPassengerIndex]?.ssr.map(
              (ssrPassenger, index) => (
                <div key={index} className={style.passengersandseatdetails}>
                  <div key={index} className={style.passengerdetails}>
                    {
                      <span className={style.traveller}>
                        {index === 0 ? "Traveler" : ""}
                      </span>
                    }

                    <span>{`${ssrPassenger?.passengerName} `}</span>
                  </div>

                  {/* ticket number */}
                  <div className={style.passengerdetails}>
                    <span className={style.traveller}>
                      {index === 0 ? "Ticket No." : ""}
                    </span>
                    <span>{ssrPassenger?.ticketNumber ?? "NA"}</span>
                  </div>

                  {/* {seatselection} */}
                  <div className={style.passengerdetails}>
                    <span className={style.traveller}>
                      {index === 0 ? "Seats" : ""}
                    </span>
                    <span>{ssrPassenger?.seatNumber ?? "NA"}</span>
                  </div>

                  {/* {meals selection} */}
                  <div key={index} className={style.passengerdetails}>
                    <span className={style.traveller}>
                      {index === 0 ? "Meals" : ""}
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
              )
            )}
          </div>

          {/* tooltip for traveler */}

          {/* SideSheet  */}
        </div>
      </div>
      <Footer />
    </>
  );
}
