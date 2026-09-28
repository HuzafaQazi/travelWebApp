import style from "./Review.module.css";
import { useState, useEffect } from "react";
import Image from "next/image";
import useLocalStorage from "@/hooks/useLocalStorage";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCaretDown,
  faArrowLeft,
  faPencil,
} from "@fortawesome/free-solid-svg-icons";
import Footer from "@/components/footer/footer";
import { useRouter } from "next/router";
import Loader from "@/components/loader/loader";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  getTabSpecificData,
  setTabSpecificData,
  removeTabSpecificData,
} from "@/utils/axios/axios";
import { handleLogout } from "@/utils/axios/axios";
import { useLogin } from "@/store/context/LoginContext";
import FlightDetails from "@/components/flights/flightDetails/flightDetails";
import {
  callReserveAPI,
  callTicketAPI,
  formatDateWithDiv,
  formatDuration,
  formatPrice,
  formatTime,
  handlePayment,
} from "../../../../utils/flights/twoway/helper";
import CommonHeader from "@/components/flights/commonHeader/commonHeader";
import B2CHeader from "@/components/flights/B2cHeader/Header";
import { logEvent } from "firebase/analytics";
import { analytics } from "../../../../utils/firebase";
import { getUserStatus } from "@/utils/userStatus";
import { useUserType } from "@/hooks/useUserType";
import Header from "@/components/corporate/auth/Header";
import Footer1 from "@/components/corporate/footerCorporate/footerCorporate";
import { useWalletBalance } from "@/hooks/useWalletBalance";
import UseWalletBalanceButton from "@/components/wallet/walletButton/useWalletButton";
import FlightLoader from "@/components/loader/FlightLoader";
import GstDetails from "@/components/corporate/details/GSTDetails";

export default function TwowayReview() {
  const router = useRouter();
  const corporateUser = useUserType();
  const { walletBalance } = useWalletBalance();
  const { openPopup, accessToken } = useLogin();

  const [isSideSheetOpen, setSideSheetOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoading1, setIsLoading1] = useState(false);
  const [selectedFlightsData, setSelectedFlightsData] = useState(null);
  const [passengerDetails, setPassengerDetails] = useState(null);
  const [priceDetails, setPriceDetails] = useState({});
  const [activeTab, setActiveTab] = useState("");
  const [isOutboundFlightOpen, setIsOutboundFlightOpen] = useState(false);
  const [isInboundFlightOpen, setIsInboundFlightOpen] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const [outboundFareQuoteData, setOutboundFareQuoteData] = useState(null);
  const [inboundFareQuoteData, setInboundFareQuoteData] = useState(null);
  const [isToastVisible, setIsToastVisible] = useState(false);
  const [walletSelected, setWalletSelected] = useState(false);
  const [getUserID, setUserID] = useLocalStorage("userID");

  const [isOutboundFlightDetailLoading, setIsOutboundFlightDetailLoading] =
    useState(false);
  const [isInboundFlightDetailLoading, setIsInboundFlightDetailLoading] =
    useState(false);
  const [corporateCompanyId, setCorporateCompanyId] = useState(null);

  useEffect(() => {
    const encodedResponse = getTabSpecificData("selectedFlightData");
    const encodedResponse1 = getTabSpecificData("passengerDetails");

    const fetchData = async () => {
      if (!(encodedResponse && encodedResponse1)) {
        return router.replace("/");
      }
      if (encodedResponse && encodedResponse1) {
        // Decode from base64
        const decodedResponse = JSON.parse(
          decodeURIComponent(atob(encodedResponse))
        );
        const decodedResponse1 = JSON.parse(
          decodeURIComponent(atob(encodedResponse1))
        );
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
              passportExpiry,
              passportIssueDate,
              passportIssueCountryCode,
              passengerType,
              dateOfBirth,
              inboundBaggage,
              inboundMealPreference,
              inboundMealDynamic,
              seatDynamic,
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
            const refactoredBaggage = [...baggage, ...inboundBaggage];
            const refactoredMealPreference = [
              ...mealPreference,
              ...inboundMealPreference,
            ];
            const refactoredMealDynamic = [
              ...mealDynamic,
              ...inboundMealDynamic,
            ];
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
              ...(refactoredBaggage.length > 0 && {
                baggage: refactoredBaggage,
              }),
              ...(refactoredMealPreference.length > 0 && {
                mealPreference: refactoredMealPreference,
              }),
              ...(refactoredMealDynamic.length > 0 && {
                mealDynamic: refactoredMealDynamic,
              }),
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

        const obj1 = decodedResponse.outboundFlightFareQuote.fare;
        const obj2 = decodedResponse.inboundFlightFareQuote.fare;
        const mealPrice = decodedResponse.mealPrice;
        const baggagePrice = decodedResponse.baggagePrice;
        const seatPrice = decodedResponse.seatPrice;
        const ssrPriceTotal = mealPrice + baggagePrice + seatPrice;

        let finalTaxPercentage = obj1.taxPercentage;
        let priceDetails = {
          currency: obj1.currency,
          offeredFare: obj1.offeredFare,
          offeredFareRoundedOff: obj1.offeredFareRoundedOff,
          commission: obj1.commission.toFixed(2),
          commissionTax: parseFloat(obj1.commissionTax.toFixed(2)),
          taxPercentage: finalTaxPercentage,
          ssrPriceTotal,
        };
        if (
          decodedResponse.outboundFlightFareQuote.resultIndex !==
          decodedResponse.inboundFlightFareQuote.resultIndex
        ) {
          finalTaxPercentage = (obj1.taxPercentage + obj2.taxPercentage) / 2;
          priceDetails = {
            currency: obj1.currency,
            offeredFare: obj1.offeredFare + obj2.offeredFare,
            offeredFareRoundedOff:
              obj1.offeredFareRoundedOff + obj2.offeredFareRoundedOff,
            commission: (obj1.commission + obj2.commission).toFixed(2),
            commissionTax: parseFloat(
              (obj1.commissionTax + obj2.commissionTax).toFixed(2)
            ),
            taxPercentage: finalTaxPercentage,
            ssrPriceTotal,
          };
        }

        setSelectedFlightsData(decodedResponse);
        setPassengerDetails(refactoredPassengerDetails);
        setPriceDetails(priceDetails);

        // Use the decoded values as needed
      }
    };

    fetchData();
  }, []);

  const checkwallet = async (e) => {
    setWalletSelected(!walletSelected);
    if (walletSelected) {
      calculateTotalPayable();
    }
    // console.log("bdfkjbfe: ",walletSelected);
  };

  const goToWalletDetails = () => {
    setIsLoading(true);
    router.push({
      pathname: "/walletDetails",
      query: {
        fromPage:
          typeof window !== "undefined"
            ? window.location.pathname
            : "/walletDetails",
      },
    });
    setIsLoading(false);
  };

  const handleGoBack = (section) => {
    setIsLoading(true);
    setTabSpecificData("selectedFlightSection", section);
    window.history.back();
    setIsLoading(false);
  };

  const handleToggleTooltip = () => {
    setShowTooltip((prevShowTooltip) => !prevShowTooltip);
  };
  useEffect(() => {
    if (showTooltip) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [showTooltip]);

  const handleTabClickOutbound = async (tab) => {
    if (tab === "outboundFlight") {
      setIsOutboundFlightDetailLoading(true);
      try {
        const outboundFlight = selectedFlightsData.outboundFlight;

        setOutboundFareQuoteData(outboundFlight);
        setActiveTab(tab);
        setIsOutboundFlightOpen(true);
      } catch (error) {
        let errorMessage =
          error?.response?.data?.error?.errorMessage[0].data ||
          "Something went wrong, please try after some time";
        if (
          error?.response?.data?.error?.errorMessage?.[0]?.data ===
          "Session timeout!!"
          //  ||
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
        }
        if (!isToastVisible) {
          toast(errorMessage);
          setIsToastVisible(true);

          // Reset the flag after a specific duration (e.g., 3 seconds)
          setTimeout(() => {
            setIsToastVisible(false);
          }, 6000);
        }
      } finally {
        setIsOutboundFlightDetailLoading(false);
      }
    } else {
      setActiveTab(tab);
      setIsOpen(true);
    }
  };

  const handleTabClickInbound = async (tab) => {
    if (tab === "inboundFlight") {
      setIsInboundFlightDetailLoading(true);
      try {
        const inboundFlight = selectedFlightsData.inboundFlight;
        setInboundFareQuoteData(inboundFlight);
        setActiveTab(tab);
        setIsInboundFlightOpen(true);
      } catch (error) {
        let errorMessage =
          error?.response?.data?.error?.errorMessage[0].data ||
          "Something went wrong, please try after some time";
        if (
          error?.response?.data?.error?.errorMessage?.[0]?.data ===
          "Session timeout!!"
          //  ||
          //   error?.response?.data?.error?.errorMessage?.[0]?.data === "Fare Quote failed from the Supplier end. Please try again."
        ) {
          console.log(
            "oops: ",
            error?.response?.data?.error?.errorMsg?.[0]?.data?.message
          );
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
        }
        if (!isToastVisible) {
          toast(errorMessage);
          setIsToastVisible(true);

          // Reset the flag after a specific duration (e.g., 3 seconds)
          setTimeout(() => {
            setIsToastVisible(false);
          }, 6000);
        }
      } finally {
        setIsInboundFlightDetailLoading(false);
      }
    } else {
      setActiveTab(tab);
      setIsOpen(true);
    }
  };

  const handleCloseOutboundFlightBottomSheet = () => {
    setIsOutboundFlightOpen(false);
  };

  const handleCloseInboundFlightBottomSheet = () => {
    setIsInboundFlightOpen(false);
  };

  if (!selectedFlightsData) {
    return <Loader />;
  }

  function calculateTotalPrice(updatedPriceDetails) {
    if (selectedFlightsData && updatedPriceDetails) {
      const searchReqData = selectedFlightsData.flightsRequest.searchReqData;
      // const adultPrice =
      //   searchReqData.adultCount * updatedPriceDetails.offeredFareRoundedOff;
      // const childPrice =
      //   searchReqData.childCount * updatedPriceDetails.offeredFareRoundedOff;
      const adultPrice = updatedPriceDetails.offeredFareRoundedOff;
      const mealPrice = selectedFlightsData.mealPrice;
      const baggagePrice = selectedFlightsData.baggagePrice;
      const seatPrice = selectedFlightsData.seatPrice;
      const totalFare = adultPrice + mealPrice + baggagePrice + seatPrice;

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
    setIsLoading(true);
    // setIsClicked(true);
    try {
      const userId = getTabSpecificData("userID");
      const reponse = await getUserStatus(userId);

      if (reponse.data.status === "inactive") {
        console.log("logout check");
        await handleLogout();
        return;
      }
      const totalAmount = calculateTotalPrice(priceDetails);
      const totalPayable = calculateTotalPayable();
      let fare = {
        ...priceDetails,
        totalAmount: totalAmount,
        // walletCreditApplied: totalAmount - totalPayable,
        walletCreditApplied: Math.max(0, totalAmount - totalPayable),
        totalPayable: totalPayable,
      };

      // console.log("fare",fare);
      // console.log("walletCreditApplied",walletCreditApplied)
      // return

      const qTraceId = selectedFlightsData.qTraceId;
      const outboundResultIndex =
        selectedFlightsData.outboundFlightFareQuote.resultIndex;
      const inboundResultIndex =
        selectedFlightsData.inboundFlightFareQuote.resultIndex;
      const payload = {
        preferredCurrency: priceDetails.currency,
        agentReferenceNo: "sonam1234567890",
        passengers: passengerDetails,
        fare,
      };
      if (corporateUser) {
        payload.companyId = corporateCompanyId;
      }

      const ticketResponse = await callTicketAPI(
        qTraceId,
        outboundResultIndex,
        inboundResultIndex,
        payload
      );
      const bookingId = ticketResponse.data.data.bookingId;
      const bookingPaymentRefId =
        ticketResponse.data.data.bookingDetails[0].bookingPaymentRefId;
      if (fare.totalPayable > 0) {
        await handlePayment(
          fare,
          bookingId,
          bookingPaymentRefId,
          corporateCompanyId
        );
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
        "Something went wrong, please try after some time";

      if (
        error?.response?.data?.error?.errorMsg?.[0]?.data?.message ||
        error?.response?.data?.error?.errormessage === "Session timeout!!" ||
        "session expired"
        // || error?.response?.data?.error?.errorMessage?.[0]?.data ===
        //   "Fare Quote failed from the Supplier end. Please try again."
      ) {
        console.log(
          "oops: ",
          error?.response?.data?.error?.errorMsg?.[0]?.data?.message
        );
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
        toast(errorMessage);
        setIsToastVisible(true);

        // Reset the flag after a specific duration (e.g., 3 seconds)
        setTimeout(() => {
          setIsToastVisible(false);
        }, 6000);
      }
    }
    setIsLoading(false);
  };

  const outboundSegment =
    selectedFlightsData?.outboundFlightFareQuote?.segments?.[0]?.segment;
  let outboundOrigin, outboundDestination, outboundDuration;
  if (outboundSegment) {
    // If there is only one result inside the segment, consider it as both origin and destination
    outboundOrigin =
      outboundSegment?.length === 1
        ? outboundSegment?.[0]?.origin
        : outboundSegment?.[0]?.origin;
    outboundDestination =
      outboundSegment?.length === 1
        ? outboundSegment?.[0]?.destination
        : outboundSegment[outboundSegment.length - 1].destination;

    // Calculate total duration for all segments
    outboundDuration = outboundSegment?.reduce(
      (totalDuration, segment) => totalDuration + segment.duration,
      0
    );
  }

  const inboundSegment =
    selectedFlightsData?.inboundFlightFareQuote?.segments?.[0]?.segment;

  let inboundOrigin, inboundDestination, inboundDuration;
  if (inboundSegment) {
    // If there is only one result inside the segment, consider it as both origin and destination
    inboundOrigin =
      inboundSegment?.length === 1
        ? inboundSegment?.[0]?.origin
        : inboundSegment?.[0]?.origin;
    inboundDestination =
      inboundSegment?.length === 1
        ? inboundSegment?.[0]?.destination
        : inboundSegment[inboundSegment.length - 1].destination;

    // Calculate total duration for all segments
    inboundDuration = inboundSegment?.reduce(
      (totalDuration, segment) => totalDuration + segment.duration,
      0
    );
  }

  const outJourneyDuration =
    selectedFlightsData?.outboundFlightFareQuote?.segments?.[0]
      ?.journeyDuration;
  const inJourneyDuration =
    selectedFlightsData?.inboundFlightFareQuote?.segments?.[0]?.journeyDuration;

  return (
    <>
      {(isLoading || isLoading1) && <FlightLoader isContentRequired={false} />}
      <div className={style.aboveheader}>
        {!corporateUser ? (
          // <CommonHeader />
          <B2CHeader/>
        ) : (
          <div style={{ backgroundColor: "#ffffff" }}>
            <Header />
          </div>
        )}

        <div className={style.reviewBooking}>
          <div className={style.reviewHeading}>
            <div style={{ display: "flex", alignItems: "center", gap: "5%" }}>
              <FontAwesomeIcon
                icon={faArrowLeft}
                style={{ color: "#155EEF", cursor: "pointer" }}
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
        {/* <hr className={style.horzontailne}></hr> */}
        <div
          className={`${style.detailsContainer} ${(isLoading || isLoading1) && style.disabled
            }`}
        >
          <div className={style.editdetails}>
            <div className={style.detailsHeading}>Flight Details</div>
            <div
              className={style.travelsdetails}
              onClick={() => handleGoBack("details")}
            >
              <span>
                <span style={{ color: "#155EEF" }} className={style.pencile}>
                  <FontAwesomeIcon icon={faPencil} />
                </span>
              </span>
              <span className={style.editicon}>Edit Travel Details </span>
            </div>
          </div>
          {/* departure flight details */}
          <div className={style.maincontent}>
            <div className={style.ticketDetails}>
              <div className={style.fromToTiming}>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "row",
                    justifyContent: "space-between",
                  }}
                >
                  <div className={style.depRetDetails}>Departure Flight</div>

                  <div className={style.Economy}>
                    {outboundSegment?.[0]?.cabinClassName}
                  </div>
                  <div className={style.rightpartTicket1}>
                    <span className={style.FareDetails1}>
                      {" "}
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
                <div
                  style={{
                    textAlign: "right",
                    display: "flex",
                    flexDirection: "row",
                    marginBottom: "7px",
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
                    {outboundSegment?.[0]?.airline?.airlineName}
                    <div
                      style={{
                        color: "#878786",
                        lineHeight: "1.5",
                        fontSize: "10px",
                        textAlign: "left",
                      }}
                    >
                      {outboundSegment?.[0]?.airline?.airlineCode} -{" "}
                      {outboundSegment?.[0]?.airline?.flightNumber}
                    </div>
                  </div>
                </div>
                <div className={style.fromToTimingMain}>
                  <div style={{ display: "flex", flexDirection: "column" }}>
                    <span className={style.fromToTime}>
                      {formatTime(outboundOrigin?.depTime)}
                    </span>
                    <span className={style.fromToCityName}>
                      {outboundOrigin?.airport?.cityName} (
                      {outboundOrigin?.airport?.cityCode})
                    </span>
                    {formatDateWithDiv(outboundOrigin?.depTime, style)}
                  </div>
                  <div className={style.btwLineContent}>
                    <div className={style.dashLineText}>
                      {formatDuration(outJourneyDuration)}
                    </div>
                    <div className={style.dashLine}></div>
                    <div className={style.dashLineText}>
                      {
                        selectedFlightsData?.outboundFlightFareQuote
                          ?.segments?.[0]?.stops
                      }{" "}
                      {selectedFlightsData?.outboundFlightFareQuote
                        ?.segments?.[0]?.stops <= 1
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
                      {formatTime(outboundDestination?.arrTime)}
                    </span>
                    <span className={style.fromToCityName}>
                      {outboundDestination?.airport?.cityName} (
                      {outboundDestination?.airport?.cityCode})
                    </span>
                    {formatDateWithDiv(outboundDestination?.arrTime, style)}
                  </div>
                </div>
              </div>

              <div className={style.pricedetails}>
                <span
                  className={style.detailsToggle}
                  onClick={() => handleTabClickOutbound("outboundFlight")}
                >
                  {isOutboundFlightDetailLoading
                    ? "Loading..."
                    : "Flight Details"}
                </span>
                <span className={style.pricelist}>
                  Rs{" "}
                  {formatPrice(
                    selectedFlightsData.outboundFlight.fare
                      .offeredFareRoundedOff
                  )}
                </span>
              </div>
              {isOutboundFlightOpen && (
                <div>
                  <div
                    className={style.backdrop}
                    onClick={handleCloseOutboundFlightBottomSheet}
                  ></div>
                  <div
                    className={style.mainContainer}
                    style={{
                      display: isOutboundFlightOpen ? "block" : "none",
                    }}
                  >
                    <button
                      onClick={handleCloseOutboundFlightBottomSheet}
                      className={style.backArrow}
                    >
                      <FontAwesomeIcon icon={faArrowLeft} />
                    </button>
                    {activeTab === "outboundFlight" && (
                      <FlightDetails
                        onClose={handleCloseOutboundFlightBottomSheet}
                        handleTabClick={handleTabClickOutbound}
                        fareQuote={outboundFareQuoteData}
                      />
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* return flight details */}

            <div className={style.ticketDetails}>
              <div className={style.fromToTiming}>
                {/* <div className={style.depRetDetails}>Return Flight</div> */}
                <div
                  style={{
                    display: "flex",
                    flexDirection: "row",
                    justifyContent: "space-between",
                  }}
                >
                  <div className={style.depRetDetails}>Return Flight</div>
                  <div className={style.Economy}>
                    {inboundSegment[0].cabinClassName}
                  </div>
                  <div className={style.rightpartTicket1}>
                    <span className={style.FareDetails1}>
                      {" "}
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

                <div
                  style={{
                    display: "flex",
                    flexDirection: "row",
                    marginBottom: "7px",
                  }}
                >
                  {/* <FontAwesomeIcon icon={faPlaneUp} /> */}
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
                      // marginLeft: '5px',
                      color: "#878786",
                      lineHeight: "1",
                      fontSize: "14px",
                      marginLeft: "5px",
                    }}
                  >
                    {inboundSegment?.[0]?.airline?.airlineName}
                    <div
                      style={{
                        color: "#878786",
                        lineHeight: "1.5",
                        fontSize: "10px",
                        textAlign: "left",
                        // marginLeft:'5px',
                      }}
                    >
                      {inboundSegment?.[0]?.airline?.airlineCode} -{" "}
                      {inboundSegment?.[0]?.airline?.flightNumber}
                    </div>
                  </div>
                </div>
                <div className={style.fromToTimingMain}>
                  <div style={{ display: "flex", flexDirection: "column" }}>
                    <span className={style.fromToTime}>
                      {formatTime(inboundOrigin?.depTime)}
                    </span>
                    <span className={style.fromToCityName}>
                      {inboundOrigin?.airport?.cityName} (
                      {inboundOrigin?.airport?.cityCode})
                    </span>
                    {formatDateWithDiv(inboundOrigin?.depTime, style)}
                  </div>
                  <div className={style.btwLineContent}>
                    <div className={style.dashLineText}>
                      {formatDuration(inJourneyDuration)}
                    </div>
                    <div className={style.dashLine}></div>
                    <div className={style.dashLineText}>
                      {
                        selectedFlightsData?.inboundFlightFareQuote
                          ?.segments?.[0]?.stops
                      }{" "}
                      {selectedFlightsData?.inboundFlightFareQuote
                        ?.segments?.[0]?.stops <= 1
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
                      {formatTime(inboundDestination?.arrTime)}
                    </span>
                    <span className={style.fromToCityName}>
                      {inboundDestination?.airport?.cityName} (
                      {inboundDestination?.airport?.cityCode})
                    </span>
                    {formatDateWithDiv(inboundDestination?.arrTime, style)}
                  </div>
                </div>
              </div>

              <div className={style.pricedetails}>
                <span
                  className={style.detailsToggle}
                  onClick={() => handleTabClickInbound("inboundFlight")}
                >
                  {isInboundFlightDetailLoading
                    ? "Loading..."
                    : "Flight Details"}
                </span>
                <span className={style.pricelist}>
                  Rs{" "}
                  {formatPrice(
                    selectedFlightsData.inboundFlight.fare.offeredFareRoundedOff
                  )}
                </span>
              </div>
              {isInboundFlightOpen && (
                <div>
                  <div
                    className={style.backdrop}
                    onClick={handleCloseInboundFlightBottomSheet}
                  ></div>
                  <div
                    className={style.mainContainer}
                    style={{
                      display: isInboundFlightOpen ? "block" : "none",
                    }}
                  >
                    <button
                      onClick={handleCloseInboundFlightBottomSheet}
                      className={style.backArrow}
                    >
                      <FontAwesomeIcon icon={faArrowLeft} />
                    </button>
                    {activeTab === "inboundFlight" && (
                      <FlightDetails
                        onClose={handleCloseInboundFlightBottomSheet}
                        handleTabClick={handleTabClickInbound}
                        fareQuote={inboundFareQuoteData}
                      />
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
          <div className={style.detailsHeading}>Price Details</div>
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
          <div className={style.maincontainerbox}>
            <div className={style.traveleditoption}>
              <span className={style.details}>Traveler Details </span>
              {!corporateUser ? (
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
                    Infants
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

            {(selectedFlightsData.inboundFlightSSR ||
              selectedFlightsData.outboundFlightSSR) && (
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
                      Meal/Baggage/seat Details{" "}
                    </span>
                  </div>
                </div>
              )}
          </div>

          <div className={style.holdProceedBtn}>
            <button
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
            </button>
          </div>
        </div>
      </div>
      {!corporateUser ? <Footer /> : <Footer1 />}
    </>
  );
}
