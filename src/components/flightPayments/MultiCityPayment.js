import {
  faCaretDown,
  faCheck,
  faXmark,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Image from "next/image";
import { useState } from "react";
import style from "./MultiCityPayment.module.css";
import CommonHeader from "../flights/commonHeader/commonHeader";
import B2CHeader from "@/components/flights/B2cHeader/Header";
import FlightDetails from "../flights/flightDetails/flightDetails";
import Footer from "../footer/footer";
import Shareicon from "../shareicon/shareicon";

export default function MulticityConfirmation() {
  const [showTooltip, setShowTooltip] = useState(false);

  const handleToggleTooltip = () => {
    setShowTooltip((prevShowTooltip) => !prevShowTooltip);
  };

  if (bookingData?.ps_payment_status === "PENDING") {
    return (
      <>
        <div className={style.desktopBg}>
          <div>
            {/* <CommonHeader /> */}
            <B2CHeader/>
          </div>

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
                <span>
                  Rs{" "}
                  {formatPrice(
                    bookingData?.flightItinerary?.fare?.offeredFareRoundedOff
                  )}
                </span>
              </div>
              <div className={style.pendingBtnContainer}>
                <button className={style.holdBtn} onClick={redirectHome}>
                  Go to Home
                </button>
                <button className={style.proceedBtn} onClick={retryPayment}>
                  Retry
                </button>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <div className={style.desktopBg}>
        {/* <CommonHeader /> */}
        <B2CHeader/>

        <div className={style.successContent}>
          <div className={style.iconStatus}>
            <FontAwesomeIcon
              icon={
                bookingData?.ps_payment_status === "SUCCESS" &&
                bookingData?.oneWayBookingStatus === "SUCCESS"
                  ? faCheck
                  : faXmark
              }
              className={
                bookingData?.ps_payment_status === "SUCCESS" &&
                bookingData?.oneWayBookingStatus === "SUCCESS"
                  ? style.confirmIcon
                  : style.failedIcon
              }
            />
            <div className={style.successDetails}>
              {bookingData?.ps_payment_status === "SUCCESS" &&
              bookingData?.oneWayBookingStatus === "SUCCESS" ? (
                <>
                  <span className={style.successHead}>
                    {bookingData?.flightItinerary?.lcc ? "Booking" : "Reserve"}
                    Successful
                  </span>

                  <div className={style.successData}>
                    Booking details will be sent on your contact number
                    <span className={style.highlightData}>
                      {bookingData?.flightItinerary?.passengers?.[0]?.contactNo}
                    </span>
                    and email id
                    <span className={style.highlightData}>
                      {""}
                      {bookingData?.flightItinerary?.passengers?.[0]?.email}
                    </span>
                  </div>
                </>
              ) : (
                <div
                  style={{
                    display: "flex",
                    gap: "20%",
                    alignItems: "center",
                  }}
                >
                  <span className={style.successHead}>
                    {bookingData.flightItinerary.lcc ? "Booking" : "Reserve"}{" "}
                    {bookingData?.bookingStatus === "CANCELLED"
                      ? "Cancelled"
                      : "Failed"}
                  </span>
                </div>
              )}
              <div style={{ display: "flex", flexDirection: "column" }}>
                {bookingData?.ps_payment_status === "SUCCESS" &&
                  bookingData?.oneWayBookingStatus === "FAILED" &&
                  bookingData?.flightItinerary?.lcc && (
                    <>
                      <div
                        className={style.refundStatus}
                        onClick={() =>
                          handleRefundStatusClick(bookingData?.bookingId)
                        }
                        ref={popupRef}
                      >
                        CHECK REFUND STATUS
                      </div>
                    </>
                  )}
                {isRefundLoading ? (
                  <div className={style.popup}>
                    <div className={style.popupContent}>Loading...</div>
                  </div>
                ) : (
                  showPopup && (
                    <div className={style.popup}>
                      <div className={style.popupContent}>
                        {refundData.walletRefundAmount > 0 ||
                        refundData.refundAmount > 0 ? (
                          <div>
                            {refundData.walletRefundAmount > 0 && (
                              <div style={{ whiteSpace: "nowrap" }}>
                                Wallet Refund status:{" "}
                                <span className={style.success}>
                                  {refundData.walletRefundStatus}
                                </span>
                              </div>
                            )}
                            {refundData.walletRefundAmount > 0 && (
                              <div style={{ whiteSpace: "nowrap" }}>
                                Wallet Refund Amount:{" "}
                                <span className={style.success}>
                                  Rs.{" "}
                                  {formatPrice(refundData.walletRefundAmount)}
                                </span>
                              </div>
                            )}
                            <div style={{ whiteSpace: "nowrap" }}>
                              Payment Refund Status:{" "}
                              <span className={style.success}>
                                {refundData.refundStatus
                                  ? refundData.refundStatus
                                  : ""}
                              </span>
                            </div>
                            <div style={{ whiteSpace: "nowrap" }}>
                              Payment Refund Amount:{" "}
                              <span className={style.success}>
                                Rs.{" "}
                                {refundData.refundAmount
                                  ? formatPrice(refundData.refundAmount)
                                  : ""}
                              </span>
                            </div>
                          </div>
                        ) : (
                          <div className={style.success}>
                            Due to 100% cancellation charges, there will be no
                            refund.
                          </div>
                        )}
                      </div>
                    </div>
                  )
                )}
              </div>
            </div>
            {!profile &&
              bookingData?.ps_payment_status === "SUCCESS" &&
              bookingData?.oneWayBookingStatus === "SUCCESS" && (
                <button className={style.invoiceBtn}>Download Invoice</button>
              )}
            <div>
              <Shareicon />
            </div>
          </div>
          <div className={style.pnrDetails}>
            {bookingData?.ps_payment_status === "SUCCESS" &&
            bookingData?.oneWayBookingStatus === "SUCCESS" ? (
              <>
                <div className={style.pnrnumber}>
                  PNR :{" "}
                  <span style={{ fontWeight: "400" }}> {bookingData?.pnr}</span>
                </div>
                <div className={style.bookingdate}>
                  Booked on :{" "}
                  <span style={{ fontWeight: "400" }}>
                    {formatBookingDateTime(bookingData?.bookedDate)}
                  </span>
                </div>
                <div style={{ display: "flex", gap: "10%" }}>
                  <div>
                    Booking ID :{" "}
                    <span style={{ fontWeight: "400" }}>
                      {bookingData?.bookingId}
                    </span>
                  </div>
                  <div className={style.bookedDate1}>
                    Booked on :{" "}
                    <span style={{ fontWeight: "400" }}>
                      {formatBookingDateTime(bookingData?.bookedDate)}
                    </span>
                  </div>
                  <div className={style.pnrnumber1}>
                    PNR :{" "}
                    <span style={{ fontWeight: "400" }}>
                      {" "}
                      {bookingData?.pnr}
                    </span>
                  </div>
                </div>
              </>
            ) : (
              <>
                {bookingData?.bookingStatus === "CANCELLED" && (
                  <>
                    <div
                      style={{ display: "flex", gap: "4%", textWrap: "nowrap" }}
                    ></div>
                    <div className={style.refundDetails}>
                      Money will be credited shortly{" "}
                    </div>
                    <div>
                      Booking ID :{" "}
                      <span style={{ fontWeight: "400" }}>
                        {bookingData?.bookingId}
                      </span>
                    </div>
                  </>
                )}
              </>
            )}
          </div>

          {/* multicity cards */}
          <div className={style.detailsHeading}>Flight Details</div>

          <div className={style.flightDetailsCardContent}>
            <div className={style.airlinesLogoClass}>
              <div
                style={{
                  display: "flex",
                  flexDirection: "row",
                }}
              >
                <div className={style.logoplane}>
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
                    <span className={style.desktopClass1}>
                      {segment?.[0]?.airline?.airlineName}
                    </span>
                    <div
                      style={{
                        color: "#878786",
                        lineHeight: "1.5",
                        fontSize: "10px",
                      }}
                    >
                      <span className={style.desktopClass2}>
                        {segment?.[0]?.airline?.airlineCode}
                      </span>
                      -
                      <span className={style.desktopClass2}>
                        {segment?.[0]?.airline?.flightNumber}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* way and cabinclass hidden on booking failed */}
              {bookingData?.oneWayBookingStatus === "SUCCESS" && (
                <div className={style.desktopCardTop}>
                  <span className={style.desktopClass}>
                    {bookingData?.flightItinerary?.journeyTypeName}
                  </span>
                  <span className={style.desktopClass}>
                    {segment?.[0]?.cabinClassName}
                  </span>
                </div>
              )}
            </div>
            <div className={style.fromToTiming}>
              <div style={{ display: "flex", flexDirection: "column" }}>
                <span className={style.fromToTime}>
                  {formatTime(origin?.depTime)}
                </span>
                <span className={style.fromToCityName}>
                  {origin?.airport?.cityName}
                </span>
                {formatDate(origin?.depTime)}
              </div>
              <div className={style.btwLineContent}>
                <div className={style.dashLineText}>
                  {formatDuration(journeyDuration)}
                </div>
                <div className={style.dashLine}></div>
                <div className={style.dashLineText}>
                  {bookingData?.flightItinerary?.segments[0]?.stops} Stop
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
                  {destination?.airport?.cityName}
                </span>
                {formatDate(destination?.arrTime)}
              </div>
            </div>
            <div className={style.flightDetailsAirports}>
              <div style={{ width: "35%", color: "#878786" }}>
                {origin?.airport?.airportName}, {origin?.airport?.countryName}
                <br />
                <span style={{ color: "#028fa3" }}>
                  Terminal {origin?.airport?.terminal}
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
                {destination?.airport?.airportName},
                {destination?.airport?.countryName}
                <br />
                <span style={{ color: "#028fa3" }}>
                  Terminal {destination?.airport?.terminal}
                </span>
              </div>
            </div>
            {bookingData?.oneWayBookingStatus === "SUCCESS" && (
              <div
                className={style.detailsToggle}
                onClick={() =>
                  handleFlightDetailsClick(
                    0,
                    bookingData?.flightItinerary?.segments
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

          <div className={style.detailsHeading}>Price Details</div>
          <div className={style.priceRows}>
            <div className={style.desktopPriceHead}>Price Details</div>
            <div className={style.priceRow}>
              Traveler Fare
              <span>
                {formatPrice(
                  bookingData?.flightItinerary?.fare?.offeredFareRoundedOff
                )}
              </span>
            </div>
            <div className={style.priceRow}>
              Special service charges
              <span>
                {formatPrice(
                  bookingData?.flightItinerary?.fare?.ssrFare.toString()
                )}
              </span>
            </div>
            {bookingData?.walletAmount && (
              <div className={style.priceRow}>
                Wallet Amount Used
                <span>{formatPrice(bookingData?.walletAmount.toString())}</span>
              </div>
            )}
            {bookingData?.totalAmountPaid > 0 && (
              <div className={style.priceRow}>
                Amount Paid
                <span>
                  {formatPrice(bookingData?.totalAmountPaid?.toString())}
                </span>
              </div>
            )}
            <div className={style.priceRowHighlight}>
              Price
              <span>
                Rs{" "}
                {formatPrice(
                  bookingData?.flightItinerary?.fare?.totalAmountWithSSR
                )}
              </span>
            </div>
          </div>

          <div className={style.detailsHeading}>Traveler Details</div>
          <div className={style.travelerDetails}>
            <span className={style.desktopTraveler}>Traveler Details</span>
            <div className={style.desktopTravelerDetails}>
              <div style={{ display: "flex", gap: "2%", alignItems: "center" }}>
                <div className={style.travellerCount}>
                  {totalPassengerCount} Passengers | {adultCount} Adults |{" "}
                  {childCount} Children | {infantCount} Infants
                </div>
              </div>
              <FontAwesomeIcon
                icon={faCaretDown}
                onClick={handleToggleTooltip}
              />
            </div>
            {bookingData?.oneWayBookingStatus === "SUCCESS" && (
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
              )
            )}
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
