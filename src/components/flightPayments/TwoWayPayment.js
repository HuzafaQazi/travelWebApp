import Footer from "@/components/footer/footer";
import Footer1 from "@/components/corporate/footerCorporate/footerCorporate";
import {
  faArrowLeft,
  faCheck,
  faXmark,
  faCircleDown,
  faSpinner,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import CommonHeader from "../flights/commonHeader/commonHeader";
import B2CHeader from "@/components/flights/B2cHeader/Header";
import FlightDetails from "../flights/flightDetails/flightDetails";
import Shareicon from "../shareicon/shareicon";
import style from "./TwoWayPayment.module.css";
import Image from "next/image";
import { useUserType } from "@/hooks/useUserType";
import Header from "../corporate/auth/Header";
export default function TwowayConfirmation({
  bookingData,
  redirectHome,
  retryPayment,
  fetchAndDownloadInvoice,
  formatBookingDateTime,
  formatTime,
  formatDate,
  formatDuration,
  formatPrice,
  isProfileRoute,
  handleRefundStatusClick,
  isRefundLoading,
  showPopup,
  refundIndex,
  popupRef,
  refundData,
  flightDetailsIsOpen,
  handleFlightDetailsClick,
  closeFlightDetails,
  fareQuoteData,
  paymentpopUp,
  fetchAndDownloadTicket,
  downloading,
  downloading1,
}) {
  const [isPaymentPopup, setIsPaymentPopup] = useState(false);

  const [showTooltip, setShowTooltip] = useState(false);
  const [swapStyle, setSwapStyle] = useState(false);
  const [ssrPassengerIndex, setssrPassengerIndex] = useState(0);
  const corporateUser = useUserType();

  const router = useRouter();
  useEffect(() => {
    const handlePopState = (event) => {
      window.location.href = "/";
    };

    window.addEventListener("popstate", handlePopState);
    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, []);
  const handleClose = () => {
    setIsPaymentPopup(false);
  };
  const handleContainerClick = (index) => {
    setSwapStyle(!swapStyle);
    setssrPassengerIndex(index);
  };
  const handlePopupClick = (e) => {
    e.stopPropagation();
  };
  const handlePaymentPopup = async (e) => {
    e.stopPropagation();
    if (!walletSelected)
      setAmountPayable(bookingData?.flightItinerary?.fare?.totalAmountWithSSR);
    setIsPaymentPopup(!isPaymentPopup);
  };
  const handleToggleTooltip = () => {
    setShowTooltip((prevShowTooltip) => !prevShowTooltip);
  };

  const successBookingData = Object.values(bookingData).filter(
    (booking) => booking.status === "SUCCESS" || booking.status === "FAILED"
  );

  const isInternational = bookingData.isInternational;

  let totalAmount, travelerFare, ssrFare;

  if (isInternational) {
    const firstBooking =
      successBookingData[0]?.data?.flightItinerary?.fare || {};
    totalAmount = firstBooking.totalAmountWithSSR || 0;
    travelerFare = firstBooking.offeredFareRoundedOff || 0;
    ssrFare = firstBooking.ssrFare || 0;
  } else {
    totalAmount = successBookingData.reduce((acc, data) => {
      return acc + (data?.data?.flightItinerary?.fare?.totalAmountWithSSR || 0);
    }, 0);

    travelerFare = successBookingData.reduce((acc, data) => {
      return (
        acc + (data?.data?.flightItinerary?.fare?.offeredFareRoundedOff || 0)
      );
    }, 0);

    ssrFare = successBookingData.reduce((acc, data) => {
      return acc + (data?.data?.flightItinerary?.fare?.ssrFare || 0);
    }, 0);
  }

  let walletAmount = bookingData[0]?.data?.walletAmount;

  let totalAmountPaid = bookingData[0]?.data?.totalAmountPaid;

  if (bookingData?.ps_payment_status === "PENDING") {
    return (
      <>
        <div className={style.desktopBg}>
          {!corporateUser ? (
            <div>
              {/* <CommonHeader /> */}
              <B2CHeader/>
            </div>
          ) : (
            <div style={{ backgroundColor: "#ffffff" }}>
              <Header />
            </div>
          )}

          <div className={style.paymentFailed}>
            <FontAwesomeIcon icon={faXmark} className={style.failedIcon} />
            Payment Failed
          </div>

          <div className={style.failedBg}>
            <div className={style.failedContent}>
              <div className={style.desktopPaymentFailed}>
                <FontAwesomeIcon icon={faXmark} className={style.failedIcon} />
                Payment Failed
              </div>
              <span
                style={{
                  color: "#878786",
                  width: "50%",
                  textAlign: "center",
                  marginBottom: "2%",
                }}
              >
                Error in payment process. Please try again
              </span>
              <div className={style.amountFailed}>
                Amount to be paid
                <span>Rs {formatPrice(travelerFare)}</span>
              </div>
              {paymentpopUp(totalAmount)}
            </div>
          </div>
        </div>
      </>
    );
  }

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
    bookingData?.[0]?.data?.flightItinerary?.segments?.[0]?.segment;

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
    bookingData?.[1]?.data?.flightItinerary?.segments?.[0]?.segment;

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
    bookingData?.[0]?.data?.flightItinerary?.segments?.[0]?.journeyDuration;
  const inJourneyDuration =
    bookingData?.[1]?.data?.flightItinerary?.segments?.[0]?.journeyDuration;

  return (
    <>
      <div className={style.aboveheader}>
        {!corporateUser ? (
          <div>
            {/* <CommonHeader /> */}
            <B2CHeader/>
          </div>
        ) : (
          <div style={{ backgroundColor: "#ffffff" }}>
            <Header />
          </div>
        )}

        <div className={style.successContent}>
          <>
            <div className={style.iconStatus}>
              <FontAwesomeIcon
                icon={
                  bookingData?.ps_payment_status === "SUCCESS" &&
                  bookingData?.[0]?.status === "SUCCESS"
                    ? faCheck
                    : faXmark
                }
                className={
                  bookingData?.ps_payment_status === "SUCCESS" &&
                  bookingData?.[0]?.status === "SUCCESS"
                    ? style.confirmIcon
                    : style.failedIcon
                }
              />
              <div className={style.successDetails}>
                {bookingData?.ps_payment_status === "SUCCESS" &&
                bookingData?.[0]?.status === "SUCCESS" ? (
                  <>
                    <span className={style.successHead}>
                      Booking Successful
                    </span>
                    {!isProfileRoute ? (
                      <div className={style.successData}>
                        Booking details will be sent on your contact number{" "}
                        <span className={style.highlightData}>
                          {
                            bookingData?.[0]?.data?.flightItinerary
                              ?.passengers?.[0]?.contactNo
                          }
                        </span>{" "}
                        and email id{" "}
                        <span className={style.highlightData}>
                          {""}
                          {
                            bookingData?.[0]?.data?.flightItinerary
                              ?.passengers?.[0]?.email
                          }
                        </span>
                      </div>
                    ) : (
                      <div className={style.detailsHeading1}>
                        Booking Details
                      </div>
                    )}
                  </>
                ) : (
                  <div
                    style={{
                      display: "flex",
                      gap: "5%",
                      alignItems: "flex-start",
                      flexDirection: "column",
                    }}
                  >
                    <span className={style.successHead}>
                      Booking{" "}
                      {bookingData?.[0]?.bookingStatus === "CANCELLED"
                        ? "Cancelled"
                        : "Failed"}
                    </span>
                    <div
                      style={{
                        display: "flex",
                        gap: "4%",
                        textWrap: "nowrap",
                      }}
                    ></div>
                    <span className={style.desktopRefund}>
                      Money will be credited shortly
                    </span>
                  </div>
                )}
              </div>
              {bookingData?.ps_payment_status === "SUCCESS" &&
                (bookingData?.[0]?.status === "SUCCESS" ||
                  bookingData?.[1]?.status === "SUCCESS" ||
                  bookingData?.[0]?.status === "FAILED" ||
                  bookingData?.[1]?.status === "FAILED") && (
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "flex-end",
                      alignItems: "center",
                      gap: "5px",
                      marginLeft: "18%",
                    }}
                  >
                    <button
                      className={style.invoiceBtn}
                      onClick={fetchAndDownloadInvoice}
                      disabled={downloading}
                    >
                      {downloading ? (
                        <>
                          <FontAwesomeIcon
                            icon={faSpinner}
                            spin
                            className="text-base"
                          />
                          Downloading
                        </>
                      ) : (
                        <>
                          <FontAwesomeIcon
                            icon={faCircleDown}
                            className="text-base"
                          />
                          Invoice
                        </>
                      )}
                    </button>
                    {(bookingData?.[0]?.status !== "FAILED" ||
                      bookingData?.[1]?.status !== "FAILED") && (
                      <button
                        className={style.invoiceBtn}
                        onClick={fetchAndDownloadTicket}
                        disabled={downloading1}
                      >
                        {downloading1 ? (
                          <>
                            <FontAwesomeIcon
                              icon={faSpinner}
                              spin
                              className="text-base"
                            />
                            Downloading
                          </>
                        ) : (
                          <>
                            <FontAwesomeIcon
                              icon={faCircleDown}
                              className="text-base"
                            />
                            Ticket
                          </>
                        )}
                      </button>
                    )}
                    <div>
                      <Shareicon />
                    </div>
                  </div>
                )}
            </div>
          </>
          <div className={style.pnrDetails}>
            {bookingData?.ps_payment_status === "SUCCESS" ? (
              <>
                <div style={{ display: "block", gap: "10%" }}>
                  <div>
                    Booking ID :{" "}
                    <span style={{ fontWeight: "400" }}>
                      {bookingData?.[0]?.data?.bookingId}
                    </span>
                  </div>

                  {/* a change */}
                  {bookingData?.[0]?.status === "SUCCESS" && (
                    <div>
                      Booked on :{" "}
                      <span style={{ fontWeight: "400" }}>
                        {formatBookingDateTime(
                          bookingData?.[0]?.data?.bookedDate
                        )}
                      </span>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                <div style={{ display: "flex", gap: "4%", textWrap: "nowrap" }}>
                  <div>
                    Booked on :{" "}
                    <span style={{ fontWeight: "400" }}>
                      {formatBookingDateTime(
                        bookingData?.[0]?.data?.bookedDate
                      )}
                    </span>
                  </div>
                </div>
                <div className={style.refundDetails}>
                  Money will be credited shortly{" "}
                </div>
              </>
            )}
          </div>

          <div className={style.flightDetailsCardContent}>
            <div className={style.airlinesLogoClass}>
              <div className={style.tk1}>
                <div className={style.abovedestopcard}>
                  Departure
                  {bookingData?.[0]?.status === "SUCCESS" && (
                    <div className={style.pnrNum}>
                      PNR : {bookingData?.[0]?.data.pnr}
                    </div>
                  )}
                </div>
              </div>
              {bookingData?.[0]?.status === "SUCCESS" && (
                <div className={style.desktopCardTop}>
                  <span className={style.desktopWay}>
                    {bookingData?.[0]?.data?.flightItinerary?.journeyTypeName}
                  </span>
                  <span className={style.desktopClass}>
                    {outboundSegment?.[0]?.cabinClassName}
                  </span>
                </div>
              )}
              <div
                style={{
                  textAlign: "right",
                  display: "flex",
                  flexDirection: "row",
                }}
              >
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
                    {outboundSegment?.[0]?.airline?.flightNumber}
                    {""} |{""} {outboundSegment?.[0]?.airline?.airlineCode}
                  </div>
                </div>
              </div>
            </div>
            <div className={style.fromToTiming}>
              <div style={{ display: "flex", flexDirection: "column" }}>
                <span className={style.fromToTime}>
                  {formatTime(outboundOrigin?.depTime)}
                </span>
                <span className={style.fromToCityName}>
                  {outboundOrigin?.airport?.cityName}
                </span>
                <span className={style.fromToDate}>
                  {formatDate(outboundOrigin?.depTime)}
                </span>
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
                  {outboundDestination?.airport?.cityName}
                </span>
                <span className={style.fromToDate}>
                  {formatDate(outboundDestination?.arrTime)}
                </span>
              </div>
            </div>
            <div className={style.flightDetailsAirports}>
              <div style={{ width: "35%", color: "#878786" }}>
                {outboundOrigin?.airport?.airportName},{" "}
                {outboundOrigin?.airport?.countryName}
                <br />
                <span style={{ color: "#155EEF" }}>
                  Terminal {outboundOrigin?.airport?.terminal}
                </span>
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
                <span style={{ color: "#155EEF" }}>
                  Terminal {outboundDestination?.airport?.terminal}
                </span>
              </div>
            </div>
            {bookingData?.[0]?.status === "SUCCESS" && (
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
            {bookingData?.ps_payment_status === "SUCCESS" &&
              bookingData?.[0]?.status === "FAILED" && (
                <>
                  <hr className={style.horizontalRule} />
                  <div
                    className={style.refundStatus}
                    onClick={() =>
                      handleRefundStatusClick(
                        bookingData?.[0]?.data?.bookingId,
                        0
                      )
                    }
                    ref={popupRef}
                  >
                    CHECK REFUND STATUS
                  </div>
                </>
              )}

            {isRefundLoading && refundIndex === 0 ? (
              <div className={style.popup}>
                <div className={style.popupContent}>Loading...</div>
              </div>
            ) : (
              refundIndex === 0 && (
                <div className={style.popup}>
                  <div className={style.popupContent}>
                    <div>
                      {refundData?.walletRefundAmount > 0 && (
                        <div style={{ whiteSpace: "nowrap" }}>
                          Wallet Refund status:{" "}
                          <span className={style.success}>
                            {refundData?.walletRefundStatus}
                          </span>
                        </div>
                      )}
                      {refundData?.walletRefundAmount > 0 && (
                        <div style={{ whiteSpace: "nowrap" }}>
                          Wallet Refund Amount:{" "}
                          <span className={style.success}>
                            Rs. {formatPrice(refundData?.walletRefundAmount)}
                          </span>
                        </div>
                      )}
                      {refundData?.refundAmount > 0 && (
                        <div style={{ whiteSpace: "nowrap" }}>
                          Payment Refund Status:{" "}
                          <span className={style.success}>
                            {refundData?.refundStatus
                              ? refundData?.refundStatus
                              : ""}
                          </span>
                        </div>
                      )}
                      {refundData?.refundAmount > 0 && (
                        <div style={{ whiteSpace: "nowrap" }}>
                          Payment Refund Amount:{" "}
                          <span className={style.success}>
                            Rs.{" "}
                            {refundData?.refundAmount
                              ? formatPrice(refundData?.refundAmount)
                              : ""}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )
            )}
          </div>

          {/* return card */}
          <>
            <div className={style.iconStatus}>
              <FontAwesomeIcon
                icon={
                  bookingData?.ps_payment_status === "SUCCESS" &&
                  bookingData?.[1]?.status === "SUCCESS"
                    ? faCheck
                    : faXmark
                }
                className={
                  bookingData?.ps_payment_status === "SUCCESS" &&
                  bookingData?.[1]?.status === "SUCCESS"
                    ? style.confirmIcon
                    : style.failedIcon
                }
              />
              <div className={style.successDetails}>
                {bookingData?.ps_payment_status === "SUCCESS" &&
                bookingData?.[1]?.status === "SUCCESS" ? (
                  <>
                    <span className={style.successHead}>
                      Booking Successful
                    </span>
                    {!isProfileRoute && (
                      <div className={style.successData}>
                        Booking details will be sent on your contact number{" "}
                        <span className={style.highlightData}>
                          {
                            bookingData?.[1]?.data?.flightItinerary
                              ?.passengers?.[0]?.contactNo
                          }
                        </span>{" "}
                        and email id{" "}
                        <span className={style.highlightData}>
                          {""}
                          {
                            bookingData?.[1]?.data?.flightItinerary
                              ?.passengers?.[0]?.email
                          }
                        </span>
                      </div>
                    )}
                  </>
                ) : (
                  <div
                    style={{
                      display: "flex",
                      gap: "5%",
                      alignItems: "flex-start",
                      flexDirection: "column",
                    }}
                  >
                    <span className={style.successHead}>
                      Booking{" "}
                      {bookingData?.[1]?.data?.bookingStatus === "CANCELLED"
                        ? "Cancelled"
                        : "Failed"}
                    </span>
                    <div
                      style={{
                        display: "flex",
                        gap: "4%",
                        textWrap: "nowrap",
                      }}
                    ></div>
                    <span className={style.desktopRefund}>
                      Money will be credited shortly
                    </span>
                  </div>
                )}
              </div>
            </div>
          </>
          <div className={style.pnrDetails}>
            {bookingData?.ps_payment_status === "SUCCESS" ? (
              <>
                <div style={{ display: "block", gap: "10%" }}>
                  <div>
                    Booking ID :{" "}
                    <span style={{ fontWeight: "400" }}>
                      {bookingData?.[1]?.data?.bookingId}
                    </span>
                  </div>
                  {bookingData?.[1]?.status === "SUCCESS" && (
                    <div>
                      Booked on :{" "}
                      <span style={{ fontWeight: "400" }}>
                        {formatBookingDateTime(
                          bookingData?.[1]?.data?.bookedDate
                        )}
                      </span>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                <div style={{ display: "flex", gap: "4%", textWrap: "nowrap" }}>
                  <div>
                    Booked on :{" "}
                    <span style={{ fontWeight: "400" }}>
                      {formatBookingDateTime(
                        bookingData?.[1]?.data?.bookedDate
                      )}
                    </span>
                  </div>
                </div>
                <div className={style.refundDetails}>
                  Money will be credited shortly{" "}
                </div>
              </>
            )}
          </div>

          <div className={style.flightDetailsCardContent}>
            <div className={style.airlinesLogoClass}>
              <div className={style.tk1}>
                <div className={style.abovedestopcard}>
                  Return
                  {bookingData?.[1]?.status === "SUCCESS" && (
                    <div className={style.pnrNum}>
                      {" "}
                      PNR : {bookingData?.[1]?.data.pnr}{" "}
                    </div>
                  )}
                </div>
              </div>

              {bookingData?.[1]?.status === "SUCCESS" && (
                <div className={style.desktopCardTop}>
                  <span className={style.desktopWay}>
                    {bookingData?.[1]?.data?.flightItinerary?.journeyTypeName}
                  </span>
                  <span className={style.desktopClass}>
                    {inboundSegment?.[0]?.cabinClassName}
                  </span>
                </div>
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
                    {inboundSegment?.[0]?.airline?.flightNumber}
                    {""} |{""} {inboundSegment?.[0]?.airline?.airlineCode}
                  </div>
                </div>
              </div>
            </div>
            <div className={style.fromToTiming}>
              <div style={{ display: "flex", flexDirection: "column" }}>
                <span className={style.fromToTime}>
                  {formatTime(inboundOrigin?.depTime)}
                </span>
                <span className={style.fromToCityName}>
                  {inboundOrigin?.airport?.cityName}
                </span>
                <span className={style.fromToDate}>
                  {formatDate(inboundOrigin?.depTime)}
                </span>
              </div>
              <div className={style.btwLineContent}>
                <div className={style.dashLineText}>
                  {formatDuration(inJourneyDuration)}
                </div>
                <div className={style.dashLine}></div>
                <div className={style.dashLineText}>
                  {
                    bookingData?.[1]?.data?.flightItinerary?.segments?.[0]
                      ?.stops
                  }{" "}
                  {bookingData?.[1]?.data?.flightItinerary?.segments?.[0]
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
                  {inboundDestination?.airport?.cityName}
                </span>
                <span className={style.fromToDate}>
                  {formatDate(inboundDestination?.arrTime)}
                </span>
              </div>
            </div>
            <div className={style.flightDetailsAirports}>
              <div style={{ width: "35%", color: "#878786" }}>
                {inboundOrigin?.airport?.airportName},{" "}
                {inboundOrigin?.airport?.countryName}
                <br />
                <span style={{ color: "#155EEF" }}>
                  Terminal {inboundOrigin?.airport?.terminal}
                </span>
              </div>
              <div
                style={{
                  alignSelf: "end",
                  color: "#878786",
                  width: "35%",
                  textAlign: "end",
                }}
              >
                {inboundDestination?.airport?.airportName},{" "}
                {inboundDestination?.airport?.countryName}
                <br />
                <span style={{ color: "#155EEF" }}>
                  Terminal {inboundDestination?.airport?.terminal}
                </span>
              </div>
            </div>
            {bookingData?.[1]?.status === "SUCCESS" && (
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
            {bookingData?.ps_payment_status === "SUCCESS" &&
              bookingData?.[1]?.status === "FAILED" && (
                <>
                  <hr className={style.horizontalRule} />
                  <div
                    className={style.refundStatus}
                    onClick={() =>
                      handleRefundStatusClick(
                        bookingData?.[1]?.data?.bookingId,
                        1
                      )
                    }
                    ref={popupRef}
                  >
                    CHECK REFUND STATUS
                  </div>
                </>
              )}
            {isRefundLoading && refundIndex === 1 ? (
              <div className={style.popup}>
                <div className={style.popupContent}>Loading...</div>
              </div>
            ) : (
              refundIndex === 1 && (
                <div className={style.popup}>
                  <div className={style.popupContent}>
                    <div>
                      {refundData?.walletRefundAmount > 0 && (
                        <div style={{ whiteSpace: "nowrap" }}>
                          Wallet Refund status:{" "}
                          <span className={style.success}>
                            {refundData.walletRefundStatus}
                          </span>
                        </div>
                      )}
                      {refundData?.walletRefundAmount > 0 && (
                        <div style={{ whiteSpace: "nowrap" }}>
                          Wallet Refund Amount:{" "}
                          <span className={style.success}>
                            Rs. {formatPrice(refundData?.walletRefundAmount)}
                          </span>
                        </div>
                      )}
                      {refundData?.refundAmount > 0 && (
                        <div style={{ whiteSpace: "nowrap" }}>
                          Payment Refund status:{" "}
                          <span className={style.success}>
                            {refundData?.refundStatus
                              ? refundData?.refundStatus
                              : ""}
                          </span>
                        </div>
                      )}
                      {refundData?.refundAmount > 0 && (
                        <div style={{ whiteSpace: "nowrap" }}>
                          Payment Refund Amount:{" "}
                          <span className={style.success}>
                            Rs.{" "}
                            {refundData?.refundAmount
                              ? formatPrice(refundData?.refundAmount)
                              : ""}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )
            )}
          </div>

          <div className={style.detailsHeading}>Price Details</div>
          <div className={style.priceRows}>
            <div className={style.desktopPriceHead}>Price Details</div>
            <div className={style.priceRow}>
              Traveler Fare
              <span>{formatPrice(travelerFare)}</span>
            </div>
            <div className={style.priceRow}>
              Special service charges
              <span>{formatPrice(ssrFare.toString() ?? "0")}</span>
            </div>
            {walletAmount > 0 && (
              <div className={style.priceRow}>
                Wallet Amount Used
                <span>{formatPrice(walletAmount.toString())}</span>
              </div>
            )}
            {totalAmountPaid > 0 && (
              <div className={style.priceRow}>
                Amount Paid By Other Modes
                <span>{formatPrice(totalAmountPaid?.toString())}</span>
              </div>
            )}
            <div className={style.priceRowHighlight}>
              Price
              <span>Rs {formatPrice(totalAmount)}</span>
            </div>
          </div>

          <div className={style.detailsHeading}>Traveler Details</div>
          <div className={style.travelerDetails}>
            <span className={style.desktopTraveler}>Traveler Details</span>
            {!corporateUser ? (
              <div className={style.desktopTravelerDetails}>
                <div
                  style={{ display: "flex", gap: "2%", alignItems: "center" }}
                >
                  {totalPassengerCount} Passengers | {adultCount} Adults |{" "}
                  {childCount} Children | {infantCount} Infants
                </div>
              </div>
            ) : (
              <div
                style={{ justifyContent: "flex-start" }}
                className={style.desktopTravelerDetails}
              >
                <div
                  style={{ display: "flex", gap: "2%", alignItems: "center" }}
                >
                  {totalPassengerCount} Traveler
                </div>
              </div>
            )}
            <div className={style.maincontainer}>
              <div
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
            ))}
          </div>

          {/* tooltip for traveler */}

          {showTooltip && (
            <>
              <div
                className={style.backdrop}
                onClick={handleToggleTooltip}
              ></div>
              <div className={style.tooltip}>
                <div className={style.tooltipHeads}>
                  <span>Passenger Name</span>
                  <span>Email</span>
                </div>
                {bookingData?.flightItinerary?.passengers.map(
                  (passenger, index) => (
                    <div className={style.nameEmail} key={index}>
                      <span>{`${passenger.firstName} ${passenger.lastName}`}</span>
                      <span>{passenger.email}</span>
                    </div>
                  )
                )}
              </div>
            </>
          )}
        </div>
      </div>
      {!corporateUser ? <Footer /> : <Footer1 />}
    </>
  );
}
