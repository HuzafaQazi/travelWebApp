import style from "./Review.module.css";
import { useState, useEffect } from "react";
import Image from "next/image";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCaretDown,
  faArrowLeft,
  faPencil,
} from "@fortawesome/free-solid-svg-icons";
import FlightDetails from "@/components/flights/flightDetails/flightDetails";
import FareDetails from "@/components/flights/fareDetails/fareDetails";
import useLocalStorage from "@/hooks/useLocalStorage";
import axios, { handleLogout } from "@/utils/axios/axios";
import {
  getTabSpecificData,
  setTabSpecificData,
  removeTabSpecificData,
} from "@/utils/axios/axios";
import config from "@/config";
import { useLogin } from "@/store/context/LoginContext";
import CommonHeader from "@/components/flights/commonHeader/commonHeader";
import B2CHeader from "@/components/flights/B2cHeader/Header";
import { useRouter } from "next/router";
import Loader from "@/components/loader/loader";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  getPaymentGateway,
  getPaymentSessionID,
} from "../../../../utils/bookingAPI";
import { routeToPg } from "@/paymentGateways/pgRouting";
import Footer from "@/components/footer/footer";
import { logEvent } from "firebase/analytics";
import { analytics } from "../../../../utils/firebase";
import { getUserStatus } from "@/utils/userStatus";
import { useUserType } from "@/hooks/useUserType";
import Header from "@/components/corporate/auth/Header";
import Footer1 from "@/components/corporate/footerCorporate/footerCorporate";
import { useWalletBalance } from "@/hooks/useWalletBalance";
import FlightLoader from "@/components/loader/FlightLoader";
import UseWalletBalanceButton from "@/components/wallet/walletButton/useWalletButton";
import GstDetails from "@/components/corporate/details/GSTDetails";

export default function FlightReview() {
  const corporateUser = useUserType();
  const router = useRouter();

  const { openFlightPricePopup, openPopup, accessToken } = useLogin();
  const { walletBalance } = useWalletBalance();

  const [loading, setLoading] = useState(false);
  const [getUserID, setUserID] = useLocalStorage("userID");
  const [selectedFlightsData, setSelectedFlightsData] = useState(null);
  const [passengerDetails, setPassengerDetails] = useState(null);
  const [priceDetails, setPriceDetails] = useState({});
  const [fareQuoteData, setFareQuoteData] = useState([]);
  const [getuserip, setuserip] = useLocalStorage("userip");
  const [isLoading, setIsLoading] = useState(false);
  const [isLoading1, setIsLoading1] = useState(false);
  const [isToastVisible, setIsToastVisible] = useState(false);
  const [walletSelected, setWalletSelected] = useState(false);
  const [corporateCompanyId, setCorporateCompanyId] = useState(null);

  const handleGoBack = (section) => {
    setTabSpecificData("selectedFlightSection", section);
    window.history.back();
  };

  const [showTooltip, setShowTooltip] = useState(false);

  const handleToggleTooltip = () => {
    // document.body.style.overflow = 'hidden';
    setShowTooltip((prevShowTooltip) => !prevShowTooltip);

    if (!showTooltip) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
  };
  // bottomsheet for flight details
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("flightDetails");

  const checkwallet = async () => {
    setWalletSelected(!walletSelected);
    if (walletSelected) {
      calculateTotalPayable();
    }
    // console.log("bdfkjbfe: ",walletSelected);
  };
  const goToWalletDetails = async () => {
    router.push({
      pathname: "/walletDetails",
      query: {
        fromPage:
          typeof window !== "undefined"
            ? window.location.pathname
            : "/walletDetails",
      },
    });
  };

  useEffect(() => {
    const encodedResponse = getTabSpecificData("selectedFlightData");
    const encodedResponse1 = getTabSpecificData("passengerDetails");

    const fetchData = async () => {
      if (!(encodedResponse && encodedResponse1)) {
        return router.replace("/");
      }
      if (encodedResponse && encodedResponse1) {
        // Decode from base64
        // const decodedResponse = JSON.parse(atob(encodedResponse));
        const decodedResponse = JSON.parse(
          decodeURIComponent(atob(encodedResponse))
        );

        const decodedResponse1 = JSON.parse(atob(encodedResponse1));
        const refactoredPassengerDetails = decodedResponse1.map(
          (passenger, i) => {
            const {
              title,
              city,
              countryName,
              firstName,
              lastName,
              baggage,
              mealPreference,
              mealDynamic,
              seatDynamic,
              passportExpiry,
              passportIssueDate,
              passportIssueCountryCode,
              passengerType,
              dateOfBirth,
              guardianDetails,
              companyId,
              ...rest
            } = passenger;

            if (i === 0) {
              if (companyId) {
                setCorporateCompanyId(companyId);
              }
            }
            const refactoredPassportExpiry = passportExpiry
              ? new Date(passportExpiry).toISOString().slice(0, 19)
              : null;
            const refactoredDateOfBirth = dateOfBirth
              ? new Date(dateOfBirth).toISOString().slice(0, 19)
              : null;
            const refactoredPassportIssueDate = passportIssueDate
              ? new Date(passportIssueDate).toISOString().slice(0, 19)
              : null;
            const refactoredGuardianDetails =
              guardianDetails && Object.keys(guardianDetails).length !== 0
                ? {
                  ...guardianDetails,
                  title: guardianDetails.title.value,
                }
                : null;
            const refactoredSeatDynamic = seatDynamic.flatMap(Object.values);

            const refactoredPassenger = {
              ...rest,
              title: title.value ? title.value : title,
              city: city.value,
              countryName: countryName.label,
              firstName: firstName.trim(),
              lastName: lastName.trim(),
              passportExpiry: refactoredPassportExpiry,
              dateOfBirth: refactoredDateOfBirth,
              passportIssueDate: refactoredPassportIssueDate,
              passportIssueCountryCode: passportIssueCountryCode?.value
                ? passportIssueCountryCode.value
                : null,
              ...(baggage.length > 0 && { baggage }),
              ...(mealPreference.length > 0 && { mealPreference }),
              ...(mealDynamic.length > 0 && { mealDynamic }),
              ...(refactoredSeatDynamic.length > 0 && {
                seatDynamic: refactoredSeatDynamic,
              }),
              guardianDetails: refactoredGuardianDetails,
              // ...(refactoredGuardianDetails && {
              //   guardianDetails: refactoredGuardianDetails,
              // }),
            };
            return refactoredPassenger;
          }
        );

        const mealPrice = decodedResponse.mealPrice;
        const baggagePrice = decodedResponse.baggagePrice;
        const seatPrice = decodedResponse.seatPrice;
        const ssrPriceTotal = mealPrice + baggagePrice + seatPrice;
        const fare = {
          ...decodedResponse.fareQuoteResponse.fare,
          ssrPriceTotal,
        };
        setSelectedFlightsData(decodedResponse);
        setPassengerDetails(refactoredPassengerDetails);
        setPriceDetails(fare);

        // Use the decoded values as needed
      }
    };

    fetchData(); // Call the async function
  }, []);

  const handleTabClick = async (tab) => {
    if (tab === "flightDetails") {
      try {
        const response = selectedFlightsData.fareQuoteResponse;
        setFareQuoteData(response);
        setActiveTab(tab);
        setIsOpen(true);
      } catch (error) {
        let errorMessage =
          error?.response?.data?.error?.errorMessage[0].data ||
          "Something went wrong, please try after some time";
        // toast(errorMessage);

        if (
          error?.response?.data?.error?.errorMessage?.[0]?.data ===
          "Session timeout!!"
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
          error?.response?.data?.error?.errorMessage?.[0]?.data ===
          "Fare Quote failed from the Supplier end. Please try again."
        ) {
          errorMessage = "Something went wrong, please select different flight";
          setTimeout(() => {
            router.push("/flights/oneway/list");
          }, 2000);
        }
        if (!isToastVisible) {
          toast(errorMessage);
          // toast("Oops! your session is expired. Please search Flights again.");
          setIsToastVisible(true);

          // Reset the flag after a specific duration (e.g., 3 seconds)
          setTimeout(() => {
            setIsToastVisible(false);
          }, 6000);
        }
      }
    } else {
      setActiveTab(tab);
      setIsOpen(true);
    }
  };

  const handleCloseBottomSheet = () => {
    setIsOpen(false);
    // document.body.style.overflow = 'auto';
  };

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
        <span style={{ color: "#155EEF" }}>
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
    return 0;
  };

  if (!selectedFlightsData) {
    return <Loader />;
  }

  function calculateTotalPrice(updatedPriceDetails) {
    if (selectedFlightsData && updatedPriceDetails) {
      const searchReqData = selectedFlightsData.flightsRequest.searchReqData;
      const adultPrice = updatedPriceDetails.offeredFareRoundedOff;
      const mealPrice = selectedFlightsData.mealPrice;
      const baggagePrice = selectedFlightsData.baggagePrice;
      const seatPrice = selectedFlightsData.seatPrice;
      const totalFare = adultPrice + mealPrice + baggagePrice + seatPrice;
      console.log(
        "walletSelected: ",
        walletSelected,
        " ",
        walletBalance,
        " ",
        totalFare
      );

      return totalFare;
    }
  }
  function calculateTotalPayable() {
    const totalFare = calculateTotalPrice(priceDetails);
    // setAmountPayable(totalFare);
    if (walletSelected && walletBalance) {
      console.log("here in cal");
      // const payable= walletBalance-totalFare;
      if (walletBalance > totalFare) {
        // setAmountPayable(0);
        return 0;
      } else {
        // setAmountPayable(totalFare-walletBalance);
        return totalFare - walletBalance;
      }
      // setAmountPayable(payable);
    }
    return totalFare;
  }

  const handleProceedToPayClick = async () => {
    if (!accessToken) {
      openPopup();
      return;
    }
    // setIsClicked(true);
    setIsLoading(true);
    try {
      const userId = getTabSpecificData("userID");
      const reponse = await getUserStatus(userId);

      if (reponse.data.status === "inactive") {
        await handleLogout();
        return;
      }
      const totalAmount = calculateTotalPrice(priceDetails);
      const totalPayable = calculateTotalPayable();
      let fare = {
        ...priceDetails,
        totalAmount: totalAmount,
        walletCreditApplied: Math.max(0,totalAmount - totalPayable),
        totalPayable: totalPayable,
      };
      const ticketResponse = await callTicketAPI(fare);

      const bookingId = ticketResponse.data.data.bookingId;
      const bookingPaymentRefId =
        ticketResponse?.data?.data?.bookingDetails?.[0]?.bookingPaymentRefId;
      if (fare.totalPayable > 0) {
        await handlePayment(fare, bookingId, bookingPaymentRefId);
      } else {
        router.push({
          pathname: "/flights/confirmation",
          query: { booking_id: bookingId, profile: false },
        });
      }
    } catch (error) {
      console.error("Error calling API:", error);
      let errorMessage =
        error?.response?.data?.error?.errormessage ||
        error?.response?.data?.error?.errorMessage?.[0]?.data ||
        "Something went wrong, please try after some time";

      if (
        error?.response?.data?.error?.errorMsg?.[0]?.data?.message ===
        "Session timeout!!" ||
        "session expired"
        // ||
        // error?.response?.data?.error?.errorMessage?.[0]?.data === "Fare Quote failed from the Supplier end. Please try again."
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
          // router.push("/flights");
          setIsToastVisible(false);
        }, 2000);
      }
    }
    setIsLoading(false);
  };

  const handlePayment = async (fare, bookingId, bookingPaymentRefId) => {
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
      const redirectUrl = null;
      const walletAmount = Math.max(0, parseFloat(fare.totalAmount - fare.totalPayable));
      // console.log(walletAmount,"wallet ammount")
      // const walletAmount = parseFloat(fare.totalAmount - fare.totalPayable);
      const charges = 0;
      const paymentCategory = "BOOKING";
      const amount = parseFloat(fare.totalPayable);
      const pgCode = pgRes.data.pgCode;
      const travelCategory = 2;
      const getPaymentSessionIDResp = await getPaymentSessionID(
        redirectUrl,
        walletAmount,
        charges,
        paymentCategory,
        bookingId,
        amount,
        mobileNumber,
        pgCode,
        travelCategory,
        bookingPaymentRef,
        corporateCompanyId
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
    }
  };

  const callTicketAPI = async (fare) => {
    try {
      const storedUserIp = getTabSpecificData("userip");
      const userId = getTabSpecificData("userID");
      const userName = getTabSpecificData("userDetails");
      const payload = {
        qTraceId: selectedFlightsData.qTraceId,
        userId: userId,
        userName: userName,
        ticketReqModel: {
          preferredCurrency: priceDetails.currency,
          agentReferenceNo: "sonam1234567890",
          endUserIp: storedUserIp == "undefined" ? null : storedUserIp,
          resultIndex: selectedFlightsData.resultIndex,
          passengers: passengerDetails,
          fare,
        },
      };
      if (corporateUser) {
        payload.companyId = corporateCompanyId;
      }
      const response = await axios.post(
        `${config.FLIGHTS_BOOKING_LCC_TICKET}`,
        payload
      );

      return response;
    } catch (error) {
      console.log("Error calling Ticket API:", error);
      // Propagate the error
      throw error;
    }
  };

  const segment = selectedFlightsData?.fareQuoteResponse?.segments[0]?.segment;

  // If there is only one result inside the segment, consider it as both origin and destination
  const origin =
    segment?.length === 1 ? segment[0]?.origin : segment[0]?.origin;
  const destination =
    segment?.length === 1
      ? segment[0]?.destination
      : segment[segment.length - 1].destination;

  // Calculate total duration for all segments
  const duration = segment?.reduce(
    (totalDuration, segment) => totalDuration + segment.duration,
    0
  );

  const journeyDuration =
    selectedFlightsData.segments?.[0]?.journeyDuration || 0;

  return (
    <>
      {(isLoading || isLoading1) && <FlightLoader isContentRequired={false} />}
      <div className={style.desktopBg}>
        {!corporateUser ? (
          // <CommonHeader />
          <B2CHeader/>
        ) : (
          <div style={{ backgroundColor: "#ffffff" }}>
            <Header />
          </div>
        )}
        {loading && <Loader />}

        {/* review heading */}
        <div className={style.reviewBooking}>
          <div className={style.reviewHeading}>
            <div style={{ display: "flex", alignItems: "center", gap: "5%" }}>
              <FontAwesomeIcon
                icon={faArrowLeft}
                style={{ color: "#155EEF" }}
                className={style.arrowBack}
                onClick={() => handleGoBack("details")}
              />
              <div style={{ display: "flex", flexDirection: "column" }}>
                <span className={style.reviewHead}>Review Booking</span>
                <span className={style.belowReviewHead}>
                  Before paying, check the details
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* desktop review page navigation */}
        <div className={style.navToggles}></div>

        {/* review page content */}
        <div
          className={`${style.detailsContainer} ${(isLoading || isLoading1) && style.disabled
            }`}
        >
          <div className={style.editdetails}>
            <div className={style.detailsHeading}>Flight Details</div>
            <div
              className={style.travelsdetails}
            // onClick={() => handleGoBack("details")}
            >
              <span>
                <span style={{ color: "#155EEF" }} className={style.pencile}>
                  <FontAwesomeIcon icon={faPencil} />
                </span>
              </span>
              <span
                className={style.editicon}
                onClick={() => handleGoBack("details")}
              >
                Edit Travel Details{" "}
              </span>
            </div>
          </div>
          <div className={style.ticketDetails}>
            <div className={style.fromToTiming}>
              <div
                style={{
                  display: "flex",
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "center",
                  paddingBottom: "1%",
                }}
              >
                {/* <div className={style.depRetDetails}>Departure Flight</div> */}
                <div
                  style={{
                    textAlign: "right",
                    display: "flex",
                    flexDirection: "row",
                    marginBottom: "7px",
                  }}
                >
                  {/* <FontAwesomeIcon icon={faPlaneUp} /> */}
                  {segment?.[0]?.airline?.airlineLogoUrl ? (
                    <Image
                      src={segment?.[0]?.airline?.airlineLogoUrl}
                      alt="logo"
                      width={30}
                      height={30}
                    />
                  ) : (
                    <img src="default_logo_url" alt="Default Logo" />
                  )}
                  <div
                    style={{
                      // marginLeft: '5px',
                      color: "#878786",
                      lineHeight: "1",
                      fontSize: "14px",
                      marginLeft: "5px",
                    }}
                  >
                    {segment?.[0]?.airline?.airlineName}
                    <div
                      style={{
                        color: "#878786",
                        lineHeight: "1.5",
                        fontSize: "10px",
                        textAlign: "left",
                      }}
                    >
                      {segment?.[0]?.airline?.airlineCode} -{" "}
                      {segment?.[0]?.airline?.flightNumber}
                    </div>
                  </div>
                </div>
                <div className={style.Economy}>{segment[0].cabinClassName}</div>
                <div className={style.rightpartTicket1}>
                  <span className={style.FareDetails1}>
                    {selectedFlightsData.flightsRequest?.searchReqData
                      ?.resultFareType === "2" && "Regular Fares"}
                    {selectedFlightsData.flightsRequest?.searchReqData
                      ?.resultFareType === "5" && "Senior Citizen"}
                    {selectedFlightsData.flightsRequest?.searchReqData
                      ?.resultFareType === "3" && "Student"}
                    {selectedFlightsData.flightsRequest?.searchReqData
                      ?.resultFareType === "4" && "Armed Forces"}
                  </span>
                </div>
              </div>
              <div className={style.fromToTiming1}>
                <div style={{ display: "flex", flexDirection: "column" }}>
                  <span className={style.fromToTime}>
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
                    {selectedFlightsData?.fareQuoteResponse?.segments[0]?.stops}{" "}
                    {selectedFlightsData?.fareQuoteResponse?.segments[0]
                      ?.stops <= 1
                      ? "Stop"
                      : "Stops"}
                  </div>
                </div>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "flex-end",
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

              <div
                className={style.detailsToggle}
                onClick={() => handleTabClick("flightDetails")}
              >
                <span>Flight Details</span>
              </div>
              {isOpen && (
                <div>
                  <div
                    className={style.backdrop}
                    onClick={handleCloseBottomSheet}
                  ></div>
                  <div
                    className={style.mainContainer}
                    style={{
                      display: isOpen ? "block" : "none",
                    }}
                  >
                    <button
                      onClick={handleCloseBottomSheet}
                      className={style.backArrow}
                    >
                      <FontAwesomeIcon icon={faArrowLeft} />
                    </button>
                    {activeTab === "flightDetails" && (
                      <FlightDetails
                        onClose={handleCloseBottomSheet}
                        handleTabClick={handleTabClick}
                        fareQuote={fareQuoteData}
                      />
                    )}
                    {activeTab === "fareDetails" && (
                      <FareDetails
                        onClose={handleCloseBottomSheet}
                        handleTabClick={handleTabClick}
                      />
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className={style.detailsHeading1}>Price Details</div>
            <div className={style.priceRows}>
              <div className={style.priceRow}>
                Traveler Price
                <span>{formatPrice(priceDetails.offeredFareRoundedOff)}</span>
              </div>
              {(selectedFlightsData.mealPrice ||
                selectedFlightsData.mealPrice === 0) && (
                  <div className={style.priceRow}>
                    Meals
                    <span>{formatPrice(selectedFlightsData.mealPrice)}</span>
                  </div>
                )}
              {(selectedFlightsData.baggagePrice ||
                selectedFlightsData.baggagePrice === 0) && (
                  <div className={style.priceRow}>
                    Baggage
                    <span>{formatPrice(selectedFlightsData.baggagePrice)}</span>
                  </div>
                )}
              {(selectedFlightsData.seatPrice ||
                selectedFlightsData.seatPrice === 0) && (
                  <div className={style.priceRow}>
                    Seat
                    <span>{formatPrice(selectedFlightsData.seatPrice)}</span>
                  </div>
                )}
              <div className={style.priceRowHighlight}>
                Total Price
                <span>Rs {formatPrice(calculateTotalPrice(priceDetails))}</span>
              </div>
            </div>
            {accessToken && (
              <UseWalletBalanceButton
                walletBalance={walletBalance}
                checkwallet={checkwallet}
                goToWalletDetails={goToWalletDetails}
              />
            )}
            <GstDetails companyDetails={passengerDetails[0]} />
            {/* {travelerDetails,mealsdetails,seatdetails,baggagedetails} */}
            <div className={style.maincontainerbox}>
              <div className={style.traveleditoption}>
                <span className={style.details}>Traveler Details </span>
                {!corporateUser ? (
                  <div
                    className={style.passengerdetail}
                    // ref={passengerDetailRef}
                    onClick={handleToggleTooltip}
                  >
                    <span
                      style={{ color: "#155EEF", cursor: "pointer" }}
                      className={style.pencile}
                    >
                      {/* <FontAwesomeIcon icon={faPencil} /> */}
                    </span>
                    <span className={style.totalpassenger}>
                      {parseInt(
                        selectedFlightsData.flightsRequest.searchReqData
                          .adultCount,
                        10
                      ) +
                        parseInt(
                          selectedFlightsData.flightsRequest.searchReqData
                            .childCount,
                          10
                        ) +
                        parseInt(
                          selectedFlightsData.flightsRequest.searchReqData
                            .infantCount,
                          10
                        )}{" "}
                      Passengers |{" "}
                      {
                        selectedFlightsData.flightsRequest.searchReqData
                          .adultCount
                      }{" "}
                      Adults |{" "}
                      {
                        selectedFlightsData.flightsRequest.searchReqData
                          .childCount
                      }{" "}
                      Children |{" "}
                      {
                        selectedFlightsData.flightsRequest.searchReqData
                          .infantCount
                      }{" "}
                      Infant{" "}
                    </span>
                    <span style={{ color: "#155EEF" }}>
                      {" "}
                      <FontAwesomeIcon icon={faCaretDown} />
                    </span>
                  </div>
                ) : (
                  <div
                    className={style.passengerdetail}
                    onClick={handleToggleTooltip}
                  >
                    <span
                      style={{ color: "#155EEF", cursor: "pointer" }}
                      className={style.pencile}
                    >
                      {/* <FontAwesomeIcon icon={faPencil} /> */}
                    </span>
                    <span className={style.totalpassenger}>
                      {parseInt(
                        selectedFlightsData.flightsRequest.searchReqData
                          .adultCount,
                        10
                      ) +
                        parseInt(
                          selectedFlightsData.flightsRequest.searchReqData
                            .childCount,
                          10
                        ) +
                        parseInt(
                          selectedFlightsData.flightsRequest.searchReqData
                            .infantCount,
                          10
                        )}{" "}
                      Traveler
                    </span>
                    <span style={{ color: "#155EEF" }}>
                      {" "}
                      <FontAwesomeIcon icon={faCaretDown} />
                    </span>
                  </div>
                )}

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
                        <span>Email Address</span>
                      </div>
                      {passengerDetails.map((passenger, index) => (
                        <div key={index} className={style.nameEmail}>
                          <span>{`${passenger.firstName} ${passenger.lastName}`}</span>
                          <span>{passenger.email}</span>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>

              {selectedFlightsData.ssrResponse && (
                <div className={style.traveleditoption1}>
                  <span className={style.details}>
                    Meal/Baggage/Seat Details{" "}
                  </span>
                  <div
                    className={style.passengerdetail1}
                    onClick={() => handleGoBack("details")}
                  >
                    <span
                      style={{ color: "#155EEF", cursor: "pointer" }}
                      className={style.pencile}
                    >
                      <FontAwesomeIcon icon={faPencil} />
                    </span>
                    <span className={style.totalpassenger}>
                      Meal/Baggage/Seat Details{" "}
                    </span>
                  </div>
                </div>
              )}
            </div>

            <div className={style.holdProceedBtn}>
              <div
                className={style.proceedBtn}
                onClick={handleProceedToPayClick}
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className={style.loadingSpinner} />
                ) : calculateTotalPayable() === 0 ? (
                  "Proceed to book"
                ) : (
                  `Proceed to pay Rs. ${formatPrice(calculateTotalPayable())}`
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      {!corporateUser ? <Footer /> : <Footer1 />}
    </>
  );
}
