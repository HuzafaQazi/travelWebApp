import Footer from "@/components/footer/footer";
import style from "./styles.module.css";

import { useRouter } from "next/router";
import { useEffect, useState } from 'react';

import {
  generateCommonPDFInvoice
} from "../../../utils/profileAPI";
import { getTabSpecificData, setTabSpecificData } from "@/utils/axios/axios";
import CommonHeader from "@/components/flights/commonHeader/commonHeader";
import B2CHeader from "@/components/flights/B2cHeader/Header";
import Loader from "@/components/loader/loader";
import useLocalStorage from "@/hooks/useLocalStorage";
import { faPlaneUp } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { flightBookingDetail } from "../../../utils/profileAPI";
import showToast from "@/utils/toast";
export default function BookingDetails(props) {
  const router = useRouter();
  const { bookingId } = router.query;

  const [bookingData, setBookingData] = useState(null);
  const [ssrPassengerIndex, setssrPassengerIndex] = useState(0);
  const [getuserip, setuserip] = useLocalStorage("userip");
  const [loading, setLoading] = useState(true);
  const [swapStyle, setSwapStyle] = useState(false);


  const segment = bookingData?.flightItinerary?.segments?.segment;

  // If there is only one result inside the segment, consider it as both origin and destination
  const origin =
    segment?.length === 1 ? segment?.[0]?.origin : segment?.[0]?.origin;
  const destination =
    segment?.length === 1
      ? segment?.[0]?.destination
      : segment?.[segment?.length - 1].destination;

  // Calculate total duration for all segments
  const duration = segment?.reduce(
    (totalDuration, segment) => totalDuration + segment.duration,
    0
  );

  const formatTime = (isoTimeString) => {
    const date = new Date(isoTimeString);
    const hours = date.getHours().toString().padStart(2, "0");
    const minutes = date.getMinutes().toString().padStart(2, "0");
    return `${hours}:${minutes}`;
  };

  const formatDuration = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;

    const hoursText = hours > 0 ? `${hours} hr` : "";
    const minutesText = remainingMinutes > 0 ? ` ${remainingMinutes} mins` : "";

    return `${hoursText}${minutesText}`;
  };

  const handleContainerClick = (index) => {
    setssrPassengerIndex(index);
    setSwapStyle(!swapStyle);
  }

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

  const formatPrice = (price) => {
    if (price) {
      return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    }
  };


  useEffect(() => {
    console.log("Before API call...");
    const getflightDetails = async () => {
      try {
        const storedUserIp = getTabSpecificData("userip");
        // const bookingId = "QTF170685821753507";
        setLoading(true);


        const flightBookingDetailResp = await flightBookingDetail({
          getBookingDetailsReq: {
            endUserIp: storedUserIp=="undefined"?null:storedUserIp,
            bookingId: bookingId,
          },
        });
        setBookingData({
          ...flightBookingDetailResp.data[0].data,

        });


        setLoading(false);


     

        if (flightBookingDetailResp.data && flightBookingDetailResp.data.length > 0) {
          setBookingData(flightBookingDetailResp.data[0].data);

        } else {

          console.error("Unexpected API response format");
        }
      } catch (error) {

        console.error("Error fetching flight booking details:", error);
        setLoading(false);
      }
    };


    getflightDetails();
  }, [bookingId]);


  if (loading) {
    return <Loader />; // Show loader while data is being fetched
  }
  // setBookingStatus(flightBookingDetailResp.data[0].data.bookingStatus);
  const adultCount = parseInt(bookingData?.flightItinerary?.noOfadults);
  const childCount = parseInt(bookingData?.flightItinerary?.noOfchildren);
  const infantCount = parseInt(bookingData?.flightItinerary?.noOFinfants);

  const totalPassengerCount = adultCount + childCount + infantCount;


  const fetchAndDownloadInvoice = async () => {
    try {
      const invoiceData = await generateCommonPDFInvoice(bookingId, 2);
      const pdfData = invoiceData; // Binary PDF data
      if (pdfData && pdfData.byteLength > 0) {
        const blob = new Blob([pdfData], { type: "application/pdf" });

        // Trigger download
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = "INV_" + bookingId + ".pdf";
        link.click();

        return URL.revokeObjectURL(link.href);
      }
      // if (!isToastVisible) {
        showToast("info","something went wrong!");
      //   setIsToastVisible(true);

      //   // Reset the flag after a specific duration (e.g., 3 seconds)
      //   setTimeout(() => {
      //     setIsToastVisible(false);
      //   }, 6000);
      // }
      return;
    } catch (error) {
      console.error("Error fetching invoice data:", error);
    }
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



  return (
    <>
      <div className={style.desktopBg}>
        {/* <CommonHeader /> */}
        <B2CHeader/>

        <div className={style.successContent}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <div className={style.detailsHeading1}>Booking Details</div>

            <button
              className={style.invoiceBtn}
              onClick={fetchAndDownloadInvoice}
            >
              Download Invoice
            </button>
          </div>

          <div className={style.pnrDetails}>
            PNR :{" "}
            <span style={{ fontWeight: "400" }}> {bookingData?.pnr}</span>
          </div>

          <div className={style.pnrDetails}>
            Booking ID :{" "}
            <span style={{ fontWeight: "400" }}>
              {bookingData?.bookingId}
            </span>
          </div>
          <div className={style.pnrDetails}>
            Booked on :{" "}
            <span style={{ fontWeight: "400" }}>
              {formatBookingDateTime(bookingData?.bookedDate)}
            </span>
          </div>
          <div className={style.flightDetailsCardContent}>
            <div className={style.airlinesLogoClass}>
              <div className={style.logo}>
                <FontAwesomeIcon
                  icon={faPlaneUp}
                  color="#028fa3"
                />
                <span className={style.desktopClass1}>{segment?.[0]?.airline?.airlineName}</span>
                <div>
                  <span className={style.desktopClass1}>{segment?.[0]?.airline?.airlineCode}{" "}|</span>
                  <span className={style.desktopClass1}>{segment?.[0]?.airline?.flightNumber}</span>
                </div>
              </div>
              <div className={style.desktopCardTop}>
                <span className={style.desktopWay}>{bookingData?.flightItinerary?.journeyTypeName}</span>
                <span className={style.desktopClass}>{segment?.[0]?.cabinClassName}</span>
              </div>
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
                  {formatDuration(duration)}
                </div>
                <div className={style.dashLine}></div>
                <div className={style.dashLineText}>
                  {bookingData?.flightItinerary?.segments?.stops} Stop
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
                {destination?.airport?.airportName},{" "}
                {destination?.airport?.countryName}
                <br />
                <span style={{ color: "#028fa3" }}>
                  Terminal {destination?.airport?.terminal}
                </span>
              </div>
            </div>
            {bookingData?.ps_payment_status === "FAILED" && (
              <>
                <hr className={style.horizontalRule} />

                <div className={style.refundStatus}>
                  REFUND STATUS :{" "}
                  <span style={{ fontWeight: "500" }}>Processing</span>
                </div>
              </>
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
              <span>{formatPrice(bookingData?.flightItinerary?.fare?.ssrFare.toString())}</span>
            </div>
            {/* <div className={style.priceRow}>
              Baggage
              <span>0</span>
            </div> */}
            {bookingData?.walletAmount && <div className={style.priceRow}>
              Wallet Amount Used
              <span>
                {formatPrice(
                  bookingData?.walletAmount.toString()
                )}
              </span>
            </div>}
            {bookingData?.totalAmountPaid > 0 && <div className={style.priceRow}>
              Amount Paid
              <span>
                {formatPrice(
                  bookingData?.totalAmountPaid?.toString()
                )}
              </span>
            </div>}
            <div className={style.priceRowHighlight}>
              Price
              <span>
                Rs{" "}
                {formatPrice(
                  bookingData?.flightItinerary?.fare?.offeredFareRoundedOff
                )}
              </span>
            </div>
          </div>

          <div className={style.detailsHeading}>Traveler Details</div>
          <div className={style.travelerDetails}>
            <span className={style.desktopTraveler}>Traveler Details</span>
            <div className={style.desktopTravelerDetails}>
              <div style={{ display: "flex", gap: "2%", alignItems: "center" }}>
                <div className={style.travellerCount}>{totalPassengerCount} Passengers | {adultCount} Adults | {childCount} Children | {infantCount} Infants</div>
              </div>
            </div>
            <div className={style.maincontainer}>


              <div
              >
                {bookingData?.segmentPassengerSsr.map(
                  (segment, index) => (
                    <button
                      key={index}
                      className={index === ssrPassengerIndex ? style.ways1 : style.ways}
                      onClick={() => handleContainerClick(index)}
                    >
                      {segment?.origin}-
                      {segment?.destination}
                    </button>
                  )
                )}
              </div>
            </div>

            {bookingData?.segmentPassengerSsr[ssrPassengerIndex]?.ssr.map(
              (ssrPassenger, index) => (
                <div key={index} className={style.passengersandseatdetails}>

                  <div key={index} className={style.passengerdetails}>
                    {<span className={style.traveller}>{index === 0 ? "Traveler" : ''}</span>}
                    {/* <span>{travellerName} </span> */}

                    <span>{`${ssrPassenger?.passengerName} `}</span>
                  </div>


                  {/* ticket number */}
                  <div className={style.passengerdetails}>
                    <span className={style.traveller}>{index === 0 ? "Ticket Number" : ''}</span>
                    <span>{ssrPassenger?.ticketNumber ?? "NA"}</span>
                  </div>

                  {/* {seatselection} */}
                  <div className={style.passengerdetails}>
                    <span className={style.traveller}>{index === 0 ? "Seat details" : ''}</span>
                    <span>{ssrPassenger?.seatNumber ?? "NA"}</span>
                  </div>

                  {/* {meals selection} */}
                  <div key={index} className={style.passengerdetails}>
                    <span className={style.traveller}>{index === 0 ? "Meal details" : ""}</span>
                    {/* <span>6A </span> */}
                    {ssrPassenger?.mealName ? (
                      <span className={style.mealselection}>{`${ssrPassenger?.mealName}`}</span>
                    ) : (
                      <span className={style.mealselection1}>NA</span>
                    )}
                  </div>

                  {/* {baggage selection} */}
                  <div className={style.passengerdetails}>
                    <span className={style.traveller}>{index === 0 ? "Cabin Baggage" : ""}</span>
                    <span>{ssrPassenger?.cabbinBaggage ?? "NA"}</span>
                  </div>
                  <div className={style.passengerdetails}>
                    <span className={style.traveller}>{index === 0 ? "Check-In Baggage" : ""}</span>
                    <span>{ssrPassenger?.baggage ?? "NA"}</span>
                  </div>
                  <div className={style.passengerdetails}>
                    <span className={style.traveller}>{index === 0 ? "Extra Baggage" : ""}</span>
                    <span>{ssrPassenger?.otherBaggage ?? "NA"}</span>
                  </div>
                </div>
              )
            )}
          </div>
        </div>
        <Footer />
      </div>
    </>
  );
}
