import { useMemo } from "react";
import { useState, useEffect, useRef } from "react";
import { useSelector } from "react-redux";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faClock, faSpinner } from "@fortawesome/free-solid-svg-icons";
import Header from "@/components/corporate/auth/Header";
import TicketReview from "@/components/expense/ticketReview";
import FareSummary from "@/components/expense/fareSummary";
import ApproverDetails from "@/components/expense/ApproverDetails";
import Seats from "@/components/expense/seats";
import Baggage from "@/components/expense/baggage";
import Meals from "@/components/expense/meals";
import axios, {
  getTabSpecificData,
  setTabSpecificData,
} from "@/utils/axios/axios";
import config from "@/config";
import { useRouter } from "next/router";
import TravelerDetailsForm from "@/components/expense/TravelerDetailsForm";
import useFormValidator from "@/hooks/useFormValidator";
import RequestModal from "@/components/expense/request";
import useLocalStorage from "@/hooks/useLocalStorage";
import Footer1 from "@/components/corporate/footerCorporate/footerCorporate";
import showToast from "@/utils/toast";
import GSTDetails from "@/components/expense/GSTDetails";
import FlightReviewSkeleton from "@/components/corporate/Loaders/Flight/FlightReviewSkeleton";
import SentRequestModal from "@/components/expense/sentRequest";
import Head from "next/head";
import {
  constructOutOfPolicyEmployees,
  getFlightEmployeeData,
  findTravelersMissingApproval,
} from "@/utils/corporate/travelPolicy";
import {
  TRAVEL_CATEGORIES,
  FLIGHT_BUDGET_INTERNATIONAL_ID,
  FLIGHT_BUDGET_DOMESTIC_ID,
} from "@/utils/constants";
import OutOfPolicy from "@/components/expense/OutOfPolicy";
import ProtectedRoute from "@/components/corporate/protectedRoute/ProtectedRoute";
import UseWalletBalanceButton from "@/components/wallet/walletButton/useWalletButton";
import { useWalletBalance } from "@/hooks/useWalletBalance";
import { getPaymentGateway, getPaymentSessionID } from "@/utils/bookingAPI";
import { routeToPg } from "@/paymentGateways/pgRouting";
import { confirmPaymentFlights } from "@/utils/walletApis";
import { formatPrice } from "@/utils/common";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import HotelReview from "@/components/expense/HotelReview";
import TravelInfoSection from "@/components/expense/travelinfo";
import TravelRequestStatus from "@/components/expense/TravelRequestStatus";
import TravelerDetails from "@/components/expense/travelerDetails";

export default function Review() {
  const userDetails = useSelector((state) => state?.user?.userInfo);
  const isWalletAllowed =
    userDetails?.loggedInDetails?.configuration?.walletAllowed;

  const { walletBalance } = useWalletBalance();

  const router = useRouter();

  const [proceedToggle, setProceedToggle] = useState(false);
  const [activeButton, setActiveButton] = useState("Seats");
  const [selectedRooms, setSelectedRooms] = useState(1);
  const [ssrResponse, setSsrResponse] = useState();

  const [fareDetails, setFareDetails] = useState([]);
  const [adults, setAdults] = useState();
  const [fareQuoteSegments, setFareQuoteSegments] = useState();
  const [flightData, setFlightData] = useState();
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
  const [isRequestSent, setIsRequestSent] = useState(false);
  const [flightsRequest, setFlightsRequest] = useState([]);
  const [seatDynamic, setSeatDynamic] = useState([]);
  const [mealDynamic, setMealDynamic] = useState(false);
  const [mealPrefs, setMealPrefs] = useState();
  const [baggageData, setBaggageData] = useState(false);
  const [travelerIndex, setTravelerIndex] = useState(0);
  const [travelers, setTravelers] = useState([]);
  const [getuserip, setuserip] = useLocalStorage("userip");
  const [travelDetailsData, setTravelDetailsData] = useState();
  const [totalAmount, setTotalAmount] = useState(0);
  const [ssrFare, setSsrFare] = useState(0);
  const [passportRequired, setPassportRequired] = useState(false);
  const [activeStep, setActiveStep] = useState(1);
  const [validationTrigger, setValidationTrigger] = useState(false);
  const [scrollToFirstError, setScrollToFirstError] = useState(false);
  const [walletSelected, setWalletSelected] = useState(false);
  const [isBookingLoading, setIsBookingLoading] = useState(false);

  const reviewDetailsRef = useRef(null);
  const travelerDetailsRef = useRef(null);
  const selectAddonsRef = useRef(null);
  const sendForApprovalRef = useRef(null);

  const sections = useMemo(
    () => [
      { ref: reviewDetailsRef, step: 1 },
      { ref: travelerDetailsRef, step: 2 },
      { ref: selectAddonsRef, step: 3 },
      { ref: sendForApprovalRef, step: 4 },
    ],
    [reviewDetailsRef, travelerDetailsRef, selectAddonsRef, sendForApprovalRef]
  );

  const employeesNeedingApproval = useMemo(() => {
    if (!flightsRequest?.corporateEmployees) return [];
    return flightsRequest?.corporateEmployees?.filter(
      (emp) => emp.data?.isApprovalRequired
    );
  }, [flightsRequest]);

  useEffect(() => {
    // Helper function to get the most visible section
    const getMostVisibleSection = () => {
      const viewportHeight = window.innerHeight;
      let maxVisibleSection = null;
      let maxVisibleArea = 0;

      sections.forEach(({ ref, step }) => {
        if (ref.current) {
          const rect = ref.current.getBoundingClientRect();

          // Calculate how much of the section is visible
          const visibleHeight =
            Math.min(rect.bottom, viewportHeight) - Math.max(rect.top, 0);
          const visibleArea = Math.max(0, visibleHeight) / rect.height;

          if (visibleArea > maxVisibleArea) {
            maxVisibleArea = visibleArea;
            maxVisibleSection = step;
          }

          // Special handling for elements at the very top of the page
          if (rect.top <= 0 && rect.bottom > 0) {
            maxVisibleSection = step;
          }
        }
      });

      return maxVisibleSection;
    };

    const handleScroll = () => {
      const visibleSection = getMostVisibleSection();
      if (visibleSection) {
        setActiveStep(visibleSection);
      }
    };

    // Add scroll listener
    window.addEventListener("scroll", handleScroll, { passive: true });

    // Initial check
    handleScroll();

    return () => window.removeEventListener("scroll", handleScroll);
  }, [sections]);

  const allTravelersCount = flightsRequest?.corporateEmployees?.length || 1;

  const sharedParams = useMemo(() => {
    if (!flightsRequest || !fareDetails || !flightData) {
      return {
        corporateEmployees: [],
        flightCabinClass: undefined,
        totalAmount: 0,
        regionId: FLIGHT_BUDGET_DOMESTIC_ID, // Default to domestic
      };
    }

    const segmentObjects = fareDetails.map((fDetail, idx) => {
      const totalForAll = fDetail.offeredFareRoundedOff || 0;
      const costPerTraveler = totalForAll / allTravelersCount;

      // get origin/destination from flightData.fareQuote.data[idx].data.segments
      const segs = flightData.fareQuote.data[idx].data.segments;
      const originCityCode = segs[0].segment[0].origin.airport.cityCode;
      const lastLeg = segs[segs.length - 1];
      const destCityCode =
        lastLeg.segment[lastLeg.segment.length - 1].destination.airport
          .cityCode;

      return {
        cost: costPerTraveler,
        origin: originCityCode,
        destination: destCityCode,
      };
    });

    return {
      corporateEmployees: flightsRequest?.corporateEmployees || [],
      flightCabinClass: flightsRequest?.FlightCabinClassText || undefined,
      totalAmount: segmentObjects,
      regionId: flightData?.isInternationalFlight
        ? FLIGHT_BUDGET_INTERNATIONAL_ID
        : FLIGHT_BUDGET_DOMESTIC_ID,
    };
  }, [flightsRequest, fareDetails, flightData, allTravelersCount]);

  const refactoredCorporateEmployees = useMemo(() => {
    return getFlightEmployeeData(sharedParams);
  }, [sharedParams]);

  const outOfPolicyTravelers = useMemo(() => {
    return constructOutOfPolicyEmployees(
      sharedParams,
      TRAVEL_CATEGORIES.FLIGHTS
    );
  }, [sharedParams]);

  const isOutOfPolicySendApproval = useMemo(() => {
    return findTravelersMissingApproval(
      sharedParams?.corporateEmployees,
      TRAVEL_CATEGORIES.FLIGHTS
    );
  }, [sharedParams]);

  const outOfPolicyApprovalTravelers = useMemo(() => {
    const approvalData = {
      corporateEmployees: sharedParams.corporateEmployees,
      showApprovalReason: true,
    };
    return constructOutOfPolicyEmployees(
      approvalData,
      TRAVEL_CATEGORIES.FLIGHTS
    );
  }, [sharedParams]);

  const scrollToSection = (ref, step) => {
    const offset = 80; // Adjust based on your header height
    const elementPosition = ref.current.getBoundingClientRect().top;
    const offsetPosition = elementPosition + window.pageYOffset - offset;

    window.scrollTo({
      top: offsetPosition,
      behavior: "smooth",
    });
    setActiveStep(step);
  };

  const handleScrollHandled = () => {
    setScrollToFirstError(false);
  };
  console.log("wallert select", walletSelected, walletBalance);

  const calculateTotalPayable = () => {
    let totalFare = totalAmount;
    if (walletSelected && walletBalance) {
      if (walletBalance > totalFare) {
        return 0;
      } else {
        return totalFare - walletBalance;
      }
    }
    return totalFare;
  };

  const checkwallet = async () => {
    setWalletSelected((prev) => !prev);
    if (walletSelected) {
      calculateTotalPayable();
    }
  };

  const goToWalletDetails = async () => {
    router.push({
      pathname: "/walletDetails",
      query: {
        fromPage:
          typeof window !== "undefined"
            ? window.location.pathname + window.location.search
            : "/walletDetails",
      },
    });
  };

  const handleApproverSubmit = async () => {
    try {
      const isValid = validator.allValid();

      if (!isValid) {
        validator.showMessages();
        setValidationTrigger((prev) => !prev);
        setScrollToFirstError(true);
        setTravelDetailsData({ ...travelDetailsData });
        return;
      }
      setIsRequestModalOpen(true);
    } catch (error) {
      console.error(error);
      showToast("error", "Something went wrong, please try again later!");
    }
  };

  const bookTicketApi = async () => {
    try {
      const filterMealPrefs = (mealPreferences) => {
        return mealPreferences.map((meal) => {
          // Create a shallow copy of the meal to avoid mutating the original object
          let filteredMeal = { ...meal };

          // Remove the specified fields
          delete filteredMeal.origin;
          delete filteredMeal.destination;
          delete filteredMeal.airlineDescription;

          return filteredMeal;
        });
      };
      let companyId = null;
      let userName = null;
      if (userDetails) {
        const { loggedInDetails } = userDetails;
        companyId = userDetails?.companyId;
        userName = `${loggedInDetails?.userDetails?.firstName || ""}${
          loggedInDetails?.userDetails?.lastName || ""
        }`;
      }

      const storedUserIp = getTabSpecificData("userip");

      const totalPayable = calculateTotalPayable();

      let resultIndex =
        flightData.resultIndexes.length > 1
          ? flightData.resultIndexes[0] + "," + flightData.resultIndexes[1]
          : flightData.resultIndexes[0];

      console.log("the traveler", travelers);

      let passengers = travelers.map((passenger) => {
        // Convert new frequent flyer structure to API format if needed
        const frequentFlyerForAPI =
          passenger?.frequentFlyerDetails?.length > 0
            ? {
                // Option 1: Send the first entry (for backward compatibility)
                ffAirlineCode:
                  passenger.frequentFlyerDetails[0]?.airlineCode || "",
                ffNumber:
                  passenger.frequentFlyerDetails[0]?.frequentFlyerNumber || "",
                // Option 2: Send all details
                frequentFlyerDetails: passenger.frequentFlyerDetails,
              }
            : {
                ffAirlineCode: "",
                ffNumber: "",
                frequentFlyerDetails: [],
              };

        return {
          ...passenger,
          title: passenger?.title?.value || "",
          city: passenger?.city?.label,
          countryName: passenger?.countryName?.label || null,
          seatDynamic:
            passenger?.seatDynamic.length > 0 ? passenger?.seatDynamic : null,
          baggage: passenger?.baggage.length > 0 ? passenger?.baggage : null,
          mealDynamic:
            passenger.mealDynamic.length > 0 ? passenger.mealDynamic : null,
          mealPreference:
            passenger.mealPreference.length > 0
              ? filterMealPrefs(passenger.mealPreference)
              : null,
          dateOfBirth:
            new Date(passenger?.dateOfBirth)
              .toISOString()
              .replace(/\.\d{3}Z$/, "") || null,
          passportExpiry:
            passportRequired && passenger?.passportExpiry
              ? new Date(passenger?.passportExpiry)
                  .toISOString()
                  .replace(/\.\d{3}Z$/, "") || null
              : null,
          passportIssueDate:
            passportRequired && passenger?.passportIssueDate
              ? new Date(passenger?.passportIssueDate)
                  .toISOString()
                  .replace(/\.\d{3}Z$/, "") || null
              : null,
          gstCompanyAddress: userDetails?.loggedInDetails?.companyDetails?.gst
            ? userDetails?.loggedInDetails?.companyDetails?.address
            : "",
          gstCompanyContactNumber: userDetails?.loggedInDetails?.companyDetails
            ?.gst
            ? userDetails?.loggedInDetails?.companyDetails?.gstMobileNumber ||
              ""
            : "",
          gstCompanyName: userDetails?.loggedInDetails?.companyDetails?.gst
            ? userDetails?.loggedInDetails?.companyDetails?.companyName
            : "",
          gstNumber: userDetails?.loggedInDetails?.companyDetails?.gst || "",
          gstCompanyEmail: userDetails?.loggedInDetails?.companyDetails?.gst
            ? userDetails?.loggedInDetails?.companyDetails?.gstEmail || ""
            : "",
          documentList: null,
          passportIssueCountryCode: passportRequired
            ? passenger?.passportIssueCountryCode?.code || null
            : null,
          ...frequentFlyerForAPI,
        };
      });

      let ticketPayload = {
        ticketReqModel: {
          preferredCurrency: "INR",
          resultIndex: resultIndex,
          agentReferenceNo: "sonam1234567890",

          fare: {
            currency: "INR",
            offeredFare:
              fareDetails.length > 1
                ? fareDetails[0].offeredFare + fareDetails[1].offeredFare
                : fareDetails[0].offeredFare,
            offeredFareRoundedOff:
              fareDetails.length > 1
                ? fareDetails[0].offeredFareRoundedOff +
                  fareDetails[1].offeredFareRoundedOff
                : fareDetails[0].offeredFareRoundedOff,
            commission:
              fareDetails.length > 1
                ? fareDetails[0].commission + fareDetails[1].commission
                : fareDetails[0].commission,
            commissionTax: fareDetails[0].commissionTax,
            taxPercentage: fareDetails[0].taxPercentage,
            totalAmount: totalAmount,
            walletCreditApplied: 0,
            totalPayable: totalPayable,
            ssrPriceTotal: 0,
          },
          passengers: passengers,
          endUserIp: storedUserIp == "undefined" ? null : storedUserIp,
        },
        qTraceId: flightData.qTraceId,
        companyId: companyId,
        userId: flightsRequest.userId,
        userName: userName,
      };
      const response = await axios.post(
        `${config.FLIGHTS_BOOKING_LCC_TICKET}`,
        ticketPayload
      );
      return response;
    } catch (error) {
      console.error("Error in bookTicketApi:", error);
      const errorMessage =
        error.response?.data?.message || // This will pick "Country code cannot be blank"
        error.message || // Fallback to error.message
        "An error occurred while booking the ticket."; // Default message
      showToast("error", errorMessage);
      throw error;
    }
  };

  const handleSendApproval = async (data) => {
    try {
      let companyId = null;
      let userName = null;
      if (userDetails) {
        const { loggedInDetails } = userDetails;
        companyId = userDetails?.companyId;
        userName = `${loggedInDetails?.userDetails?.firstName || ""} ${
          loggedInDetails?.userDetails?.lastName || ""
        }`;
      }

      // Only employees who require approval
      const employeesToApprove = employeesNeedingApproval.map((traveler) => ({
        employeeUserId: traveler.data._id,
        email: traveler.data.workEmail || null,
      }));

      const segments = flightsRequest?.searchReqData?.segments;
      const origin = segments[0].origin;
      const destination =
        flightData?.journeyType === "3"
          ? segments[segments.length - 1].destination
          : segments[0].destination;
      const travelDate = new Date().toISOString();
      let resultIndex =
        flightData.resultIndexes.length > 1
          ? flightData.resultIndexes[0] + "," + flightData.resultIndexes[1]
          : flightData.resultIndexes[0];

      const response = await bookTicketApi();
      //console.log("ticket response", response.data);
      if (response.data.status === "SUCCESS") {
        const approvalPayload = {
          companyId: companyId,
          userId: flightsRequest.userId,
          userName: userName,
          travelCategory: TRAVEL_CATEGORIES.FLIGHTS,
          bookingId: response.data.data.bookingId,
          createdBy: flightsRequest.userId,
          modifiedBy: flightsRequest.userId,
          policyData: outOfPolicyTravelers,
          bookingdetails: {
            origin: origin,
            destination: destination,
            travelDate: travelDate,
            reasonForTravel: data?.reason || null,
            qtraceId: flightData.qTraceId,
            resultIndex: resultIndex,
            totalBookingAmount: totalAmount,
            passengerDetails: flightsRequest?.corporateEmployees?.map(
              (traveler, i) => ({
                employeeUserId: traveler.data._id,
                email: traveler.data.workEmail || null,
              })
            ),
          },
          status: "Active",
        };
        const approvalResponse = await axios.post(
          `${config.CORPORATE.SEND_APPROVAL}`,
          approvalPayload
        );
        if (approvalResponse?.data?.status === "SUCCESS") {
          setIsRequestSent(true);
          setTimeout(
            async () =>
              await router.push(
                `/corporate/auth/booking/flights/flightApproval?companyId=${companyId}&bookingId=${approvalPayload.bookingId}`
              ),
            1000
          );
        }
      }
    } catch (error) {
      console.error("Error sending approval request:", error);
      if (error.response) {
        console.error("Error response:", error.response.data);
        console.error("Error status:", error.response.status);
        console.error("Error headers:", error.response.headers);
      } else {
        console.error("Error message:", error.message);
      }
    }
  };

  const closeModal = () => {
    setIsRequestModalOpen(false);
  };

  const prioritizeLoggedInUser = (passengerDetails, userDetails) => {
    if (userDetails) {
      const { loggedInDetails } = userDetails;
      const loggedInIndex = passengerDetails.findIndex(
        (traveler) =>
          traveler.firstName === loggedInDetails?.userDetails?.firstName &&
          traveler.lastName === loggedInDetails?.userDetails?.lastName &&
          traveler.email === loggedInDetails?.userDetails?.workEmail
      );

      if (loggedInIndex > 0) {
        const [loggedInTraveler] = passengerDetails.splice(loggedInIndex, 1);
        passengerDetails.unshift(loggedInTraveler);
      }
    }
    return passengerDetails;
  };

  const mapEmployeesToPassengers = (
    employees,
    userDetails,
    passportRequired
  ) => {
    if (!employees || employees.length === 0) return [];

    // Get primary traveler details (first employee)
    const primaryEmployee = employees[0];
    const primaryData = primaryEmployee?.data || {};

    const primaryCountryDetails = primaryData.countryDetails;
    const primaryCityDetails = primaryData.cityDetails;
    const primaryAddress = primaryData.address || "";
    const primaryCellCountryCode = primaryData.cellCountryCode || "+91";

    return employees.map((employee, index) => {
      const {
        title,
        firstName,
        lastName,
        mobile,
        workEmail,
        dateOfBirth,
        cellCountryCode,
        address,
        countryDetails,
        cityDetails,
        passportNumber,
        passportExpiry,
        passportIssueDate,
        passportIssueCountryCode,
        ffNumber,
        ffAirlineCode,
      } = employee.data;

      // Use employee's details if available, otherwise use primary/fallback
      const finalCountryDetails =
        countryDetails &&
        countryDetails?.countryname &&
        countryDetails?.alpha2code
          ? countryDetails
          : primaryCountryDetails;

      const finalCityDetails =
        cityDetails && cityDetails?.cityname ? cityDetails : primaryCityDetails;

      const finalCellCountryCode = cellCountryCode || primaryCellCountryCode;

      return {
        title: { value: title, label: title },
        firstName,
        lastName,
        paxType: "1",
        dateOfBirth: dateOfBirth ? new Date(dateOfBirth).toISOString() : null,
        gender: title === "Mr" ? "1" : "2",
        passportNo: passportRequired ? passportNumber || "" : null,
        cellCountryCode: finalCellCountryCode,
        passportExpiry: passportRequired ? passportExpiry : null,
        passportIssueDate: passportRequired ? passportIssueDate : null,
        passportIssueCountryCode: passportRequired
          ? passportIssueCountryCode
          : null,
        addressLine1: address || primaryAddress,
        addressLine2: "",
        city: {
          value: finalCityDetails?.cityname,
          label: finalCityDetails?.cityname,
        },
        countryCode: finalCountryDetails?.alpha2code,
        countryName: {
          value: finalCountryDetails?.countryname,
          label: finalCountryDetails?.countryname,
        },
        nationality: finalCountryDetails?.alpha2code,
        contactNo: mobile,
        email: workEmail,
        isLeadPax: index === 0,
        ffAirlineCode: ffAirlineCode,
        ffNumber: ffNumber,
        frequentFlyerDetails: [],
        gstCompanyAddress: "",
        gstCompanyContactNumber: "",
        gstCompanyName: "",
        gstNumber: "",
        gstCompanyEmail: "",
        seatDynamic: [],
        mealDynamic: [],
        mealPreference: [],
        baggage: [],
      };
    });
  };

  const extractPassportRequirements = (flightData) => {
    const isPassportFullDetailRequiredAtBook =
      flightData?.fareQuote?.data?.[0]?.data
        ?.isPassportFullDetailRequiredAtBook ||
      flightData?.fareQuote?.data?.[1]?.data
        ?.isPassportFullDetailRequiredAtBook;
    const isPassportRequiredAtTicket =
      flightData?.fareQuote?.data?.[0]?.data?.isPassportRequiredAtTicket ||
      flightData?.fareQuote?.data?.[1]?.data?.isPassportRequiredAtTicket;
    const isPassportRequiredAtBook =
      flightData?.fareQuote?.data?.[0]?.data?.isPassportRequiredAtBook ||
      flightData?.fareQuote?.data?.[1]?.data?.isPassportRequiredAtBook;

    return (
      isPassportRequiredAtTicket ||
      isPassportFullDetailRequiredAtBook ||
      isPassportRequiredAtBook
    );
  };

  const processSSRData = (flightData) => {
    let seats = [];
    let mealDynamic = [];
    let meals = [];
    let baggages = [];

    flightData.ssrData.forEach((ssrItem, index) => {
      const ssr = ssrItem?.data;
      if (ssr?.status === "SUCCESS") {
        if (ssr.data?.isLcc) {
          if (ssr.data?.ssr?.ssrData?.seatDynamic?.length) {
            seats.push(ssr.data.ssr.ssrData.seatDynamic);
          }
          if (ssr.data?.ssr?.ssrData?.mealDynamic?.length) {
            mealDynamic.push(ssr.data.ssr.ssrData.mealDynamic);
          }
          if (ssr.data?.ssr?.ssrData?.baggage?.length) {
            baggages.push(ssr.data.ssr.ssrData.baggage);
          }
        } else {
          if (ssr.data?.ssr?.seatDynamic?.length) {
            seats = ssr.data.ssr.seatDynamic;
          }
          if (ssr.data?.ssr?.meal?.length) {
            const segmentMeal = ssr.data.ssr.meal.map((meal) => {
              const segments = flightData.fareQuote.data[index].data.segments;
              meal.origin = segments[0].segment[0].origin.airport.cityCode;
              meal.destination =
                segments[segments.length - 1].segment[
                  segments[segments.length - 1].segment.length - 1
                ].destination.airport.cityCode;
              meal.price = 0;
              meal.airlineDescription = meal.description;
              return meal;
            });
            meals.push(segmentMeal);
          }
        }
      }
    });

    return { seats, mealDynamic, meals, baggages };
  };

  useEffect(() => {
    const travelerData = JSON.parse(getTabSpecificData("reviewDataCorporate"));
    const encodedFlightData = getTabSpecificData("selectedFlightDataCorporate");
    const flightData = encodedFlightData ? JSON.parse(encodedFlightData) : null;
    const flightsRequest = flightData?.request;
    let employees = [];
    let updatedTravelDetails = { ...travelDetailsData };

    if (flightsRequest) {
      employees = flightsRequest?.corporateEmployees;
      setFlightsRequest(flightsRequest);
    }

    const passportRequired = extractPassportRequirements(flightData);
    setPassportRequired(passportRequired);

    if (!travelerData || travelerData.length === 0) {
      const passengerDetails = mapEmployeesToPassengers(
        employees,
        userDetails,
        passportRequired
      );
      const prioritizedDetails = prioritizeLoggedInUser(
        passengerDetails,
        userDetails
      );
      updatedTravelDetails.totalTravelers = [prioritizedDetails.length];
      setTravelers(prioritizedDetails);
    } else {
      const prioritizedDetails = prioritizeLoggedInUser(
        travelerData,
        userDetails
      );
      updatedTravelDetails.totalTravelers = [prioritizedDetails.length];
      setTravelers(prioritizedDetails);
    }

    if (flightData) {
      setAdults(flightData.adults);
      setFlightData(flightData);
      setSsrResponse(flightData.ssrData);

      const { seats, mealDynamic, meals, baggages } =
        processSSRData(flightData);

      if (seats.length === 0) {
        setActiveButton(
          meals.length === 0 && mealDynamic.length === 0 ? "Baggage" : "Meals"
        );
      }

      setSeatDynamic(seats);
      setMealDynamic(mealDynamic);
      setBaggageData(baggages);
      setMealPrefs(meals);

      const segments =
        flightData.fareQuote.data.length > 1
          ? [
              flightData.fareQuote.data[0].data,
              flightData.fareQuote.data[1].data,
            ]
          : [flightData.fareQuote.data[0].data];

      setFareQuoteSegments(segments);

      const fares = flightData?.fareQuote?.data?.map((item) => ({
        ...item.data.fare,
        ssrFare: 0,
      }));

      updatedTravelDetails = {
        ...updatedTravelDetails,
        outboundFlightFareQuote: flightData.fareQuote.data[0].data,
        inboundFlightFareQuote:
          flightData.fareQuote.data.length > 1
            ? flightData.fareQuote.data[1].data
            : {},
      };

      setFareDetails(fares);
    }
    setTravelDetailsData(updatedTravelDetails);
  }, [userDetails]);

  console.log("travelDetailsData findddd", travelDetailsData);

  useEffect(() => {
    if (isRequestModalOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [isRequestModalOpen]);

  const customMessages = {
    email: "This is not a valid email.",
    required: "This field is required.",
    in: "Password does not match.",
    min: "This field must be at least :min characters.",
    max: "This field must be no more than :max characters.",
  };

  const customRules = {
    companyName: {
      message: "The company name should only contain letters and spaces.",
      rule: (val, params, validator) => {
        const regex = /^[a-zA-Z\s]+$/;
        return regex.test(val);
      },
      required: true,
    },
    validMobile: {
      message: "This is not a valid mobile number.",
      rule: (val, params, validator) => {
        const regex = /^[6-9]\d{9}$/;
        return regex.test(val) && val !== "0000000000";
      },
      required: true,
    },
    validEmail: {
      message: "This is not a valid email.",
      rule: (val, params, validator) => {
        const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return regex.test(val);
      },
      required: true,
    },
    validFirstName: {
      message: "The :attribute should contain only letters.",
      rule: (val, params, validator) => {
        const regex = /^[a-zA-Z\s]*$/;
        return regex.test(val);
      },
      required: true,
    },
    validLastName: {
      message: "The :attribute should contain only letters.",
      rule: (val, params, validator) => {
        const regex = /^[a-zA-Z\s]*$/;
        return regex.test(val);
      },
      required: true,
    },
    validPAN: {
      message: "PAN Number does not match the format",
      rule: (val, params, validator) => {
        const regex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
        return regex.test(val);
      },
    },
    validGST: {
      message: "GST Number does not match the format",
      rule: (val, params, validator) => {
        const regex = /\d{2}[A-Z]{5}\d{4}[A-Z]{1}[A-Z\d]{1}[Z]{1}[A-Z\d]{1}/;
        return regex.test(val);
      },
    },
    validIssueDate: {
      message: "Passport issue date should not be greater than today's date.",
      rule: (val, params, validator) => {
        const issueDate = new Date(val);
        //console.log("issuess date", issueDate);
        const today = new Date();
        //console.log("todays date", today);
        return issueDate <= today;
      },
    },
    passportIssueComparison: {
      message: "Passport issue date should not be greater than today's date.",
      rule: (val, params, validator) => {
        const issueDate = new Date(val);
        const today = new Date();
        //console.log("todays date", today);
        return issueDate <= today;
      },
    },
    passportDateComparison: {
      message: "Passport issue date should be less than expiry date.",
      rule: (val, params, validator) => {
        const issueDate = new Date(params[0]);
        console.log("issue date", issueDate);
        // const arrivalDate = new Date(params[1]);
        const expiryDate = new Date(val);
        return expiryDate > issueDate;
      },
    },
    passportArrivalDateComparison: {
      message: "Passport expiry date should be greater than arrival date.",
      rule: (val, params, validator) => {
        console.log("params", params);
        const arrivalDateString = params[0];
        if (arrivalDateString !== "") {
          const arrivalDate = new Date(
            arrivalDateString.replace(/-/g, "/").slice(0, 10)
          );
          //console.log(typeof params[0]);
          const expiryDate = new Date(val);
          return expiryDate > arrivalDate;
        } else {
          return true;
        }
      },
    },
    passportArrivalComparison: {
      message: "Passport expiry date should be greater than arrival date.",
      rule: (val, params, validator) => {
        const arrivalDateString = params[0];
        const arrivalDate = new Date(
          arrivalDateString.replace(/-/g, "/").slice(0, 10)
        );
        //console.log(typeof params[0]);
        const expiryDate = new Date(val);
        const arrivalDateStringFormatted = arrivalDate
          .toISOString()
          .slice(0, 10);
        return expiryDate > arrivalDate;
      },
    },
    validPassportNumber: {
      message: "Passport Number does not match the format",
      rule: (val, params, validator) => {
        const regex = /^[A-Za-z0-9]{3,30}$/;
        return regex.test(val);
      },
    },
  };

  const [validator, updateValidator] = useFormValidator(
    customMessages,
    customRules
  );

  const handleSSRSelection = (ssrType, data) => {
    switch (ssrType) {
      case "SEAT":
        updateSeats(data);

        return;

      case "MEAL":
        updateMeals(data);
        // calculateSsrFare();
        return;

      case "BAGGAGE":
        updateBaggage(data);
        // calculateSsrFare();
        return;
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0"); // Months are zero-indexed
    const year = date.getFullYear();

    let hours = date.getHours();
    const minutes = String(date.getMinutes()).padStart(2, "0");
    const ampm = hours >= 12 ? "PM" : "AM";
    hours = hours % 12 || 12; // Convert to 12-hour format and handle midnight (0 becomes 12)

    // Format the date and time

    return `${day}-${month}-${year} ${hours}:${minutes} ${ampm}`;
  };

  useEffect(() => {
    let ssrFare = 0;
    if (travelers && travelers.length > 0) {
      //console.log("travelers ", travelers);
      travelers.map((traveler) => {
        const seatsFare = traveler.seatDynamic.reduce(
          (sum, item) => sum + item.price,
          0
        );
        const mealsFare = traveler.mealDynamic.reduce(
          (sum, item) => sum + item.price,
          0
        );
        const baggageFare = traveler.baggage.reduce(
          (sum, item) => sum + item.price,
          0
        );
        ssrFare += seatsFare + mealsFare + baggageFare;
      });
      setFareDetails((prevFareDetails) => {
        const updatedFareDetails = [...prevFareDetails];
        updatedFareDetails[0].ssrFare = ssrFare;
        return updatedFareDetails;
      });
      setTabSpecificData("reviewDataCorporate", JSON.stringify(travelers));
    }
  }, [travelers]);

  const updateSeats = (seat) => {
    //console.log("updateSeats ");
    setTravelers((prevTravelers) => {
      // Create a copy of the travelers array
      //console.log("prevTravelers ", prevTravelers);
      const updatedTravelers = [...prevTravelers];
      // Get the specific traveler
      const selectedTraveler = { ...updatedTravelers[travelerIndex] };
      let updatedSeatDynamic = [...selectedTraveler.seatDynamic];
      if (updatedSeatDynamic.length === 0) {
        updatedSeatDynamic.push(seat);
      }
      selectedTraveler?.seatDynamic?.map((s, index) => {
        if (s.origin === seat.origin && s.destination === seat.destination) {
          if (updatedSeatDynamic[index]?.code === seat?.code) {
            updatedSeatDynamic.splice(index, 1);
          } else {
            // Replace the seat at the found index
            updatedSeatDynamic[index] = seat;
          }
        } else {
          updatedSeatDynamic.push(seat);
        }
      });
      //console.log("updatedSeatDynamic ", updatedSeatDynamic);
      selectedTraveler.seatDynamic = updatedSeatDynamic;
      updatedTravelers[travelerIndex] = selectedTraveler;
      return updatedTravelers;
    });
    // calculateSsrFare();
  };

  const updateBaggage = (baggage) => {
    //console.log("updateSeats ");
    setTravelers((prevTravelers) => {
      // Create a copy of the travelers array
      const updatedTravelers = [...prevTravelers];
      // Get the specific traveler
      const selectedTraveler = { ...updatedTravelers[travelerIndex] };
      let updatedBaggage = [...selectedTraveler.baggage];
      if (updatedBaggage.length === 0) {
        updatedBaggage.push(baggage);
      }
      selectedTraveler?.baggage?.map((s, index) => {
        if (
          s.origin === baggage.origin &&
          s.destination === baggage.destination
        ) {
          if (updatedBaggage[index]?.code === baggage?.code) {
            // Remove the seat at the found index
            updatedBaggage.splice(index, 1);
          } else {
            // Replace the seat at the found index
            updatedBaggage[index] = baggage;
          }
        } else {
          updatedBaggage.push(baggage);
        }
      });
      //console.log("updatedBaggage ", updatedBaggage);
      selectedTraveler.baggage = updatedBaggage;
      updatedTravelers[travelerIndex] = selectedTraveler;
      return updatedTravelers;
    });
  };

  const updateMeals = (meal) => {
    //console.log("updateSeats ");
    setTravelers((prevTravelers) => {
      // Create a copy of the travelers array
      const updatedTravelers = [...prevTravelers];
      // Get the specific traveler

      const selectedTraveler = { ...updatedTravelers[travelerIndex] };
      // //console.log("selectedTraveler ",selectedTraveler)
      let updatedMealDynamic = [...selectedTraveler.mealDynamic];
      let updatedMealPrefs = [...selectedTraveler.mealPreference];

      if (mealDynamic.length > 0) {
        if (updatedMealDynamic.length === 0) {
          updatedMealDynamic.push(meal);
        }
        selectedTraveler.mealDynamic.map((m, index) => {
          if (m.origin === meal.origin && m.destination === meal.destination) {
            if (updatedMealDynamic[index]?.code === meal?.code) {
              updatedMealDynamic.splice(index, 1);
            } else {
              // Replace the seat at the found index
              updatedMealDynamic[index] = meal;
            }
          } else {
            updatedMealDynamic.push(meal);
          }
        });

        selectedTraveler.mealDynamic = updatedMealDynamic;
      } else if (mealPrefs.length > 0) {
        if (updatedMealPrefs.length === 0) {
          updatedMealPrefs.push(meal);
        }
        selectedTraveler.mealPreference.map((m, index) => {
          if (m.origin === meal.origin && m.destination === meal.destination) {
            if (updatedMealPrefs[index]?.code === meal?.code) {
              // Remove the seat at the found index
              updatedMealPrefs.splice(index, 1);
            } else {
              // Replace the seat at the found index
              updatedMealPrefs[index] = meal;
            }
          } else {
            updatedMealPrefs.push(meal);
          }
        });

        selectedTraveler.mealPreference = updatedMealPrefs;
      }
      updatedTravelers[travelerIndex] = selectedTraveler;
      return updatedTravelers;
    });
  };

  const initiatePayment = async () => {
    try {
      const isValid = validator.allValid();
      if (!isValid) {
        validator.showMessages();
        setValidationTrigger((prev) => !prev);
        setScrollToFirstError(true);
        setTravelDetailsData({ ...travelDetailsData });
        return;
      }

      setIsBookingLoading(true);

      const response = await bookTicketApi();

      if (response.data.status === "SUCCESS") {
        const bookingId = response?.data?.data?.bookingId;
        const { companyId } = userDetails;
        const bookingPaymentRef = {
          bookingPaymentRefIds: [
            response?.data?.data?.bookingDetails?.[0]?.bookingPaymentRefId,
          ],
          isWeb: true,
        };

        const mobileNumber = getTabSpecificData("phoneNumber");
        const pgRes = await getPaymentGateway();

        if (pgRes.status === "SUCCESS") {
          let payable = calculateTotalPayable();
          if (payable > 0) {
            const redirectUrl = null;
            const walletAmount = Math.max(0, parseFloat(totalAmount - payable));
            const charges = 0;
            const paymentCategory = "BOOKING";
            const amount = parseFloat(payable);
            const pgCode = pgRes.data.pgCode;
            const travelCategory = TRAVEL_CATEGORIES.FLIGHTS;
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
              companyId
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
                "BOOKING",
                "",
                companyId
              );
            }
          } else {
            let confirmReq = {
              bookingId: bookingId,
              paymentRefernceId: companyId,
              paymentStatus: "SUCCESS",
              paymentAmount: payable,
              pgCode: pgRes.data.pgCode,
              bookingPaymentRefIds: [],
              walletAmount: totalAmount - payable,
            };
            await confirmPaymentFlights(confirmReq);
            router.push({
              pathname: "/corporate/auth/booking/flights/flightConfirm",
              query: { booking_id: bookingId },
            });
          }
        }
      }
    } catch (error) {
      console.error("Error in payment:", error);
    } finally {
      setIsBookingLoading(false);
    }
  };

  const renderActionButton = () => {
    if (!allEmployeesNoApproval) {
      return (
        <div className="mt-4 w-full pb-10" ref={sendForApprovalRef}>
          <button
            className={`bg-[#028fa3] text-white text-sm rounded-full p-2 px-4 w-fit ${
              isOutOfPolicySendApproval && "cursor-not-allowed"
            }`}
            onClick={!isOutOfPolicySendApproval ? handleApproverSubmit : null}
            disabled={proceedToggle || isOutOfPolicySendApproval}
          >
            Request for Approval
          </button>
          {isOutOfPolicySendApproval && (
            <OutOfPolicy outOfPolicyTravelers={outOfPolicyApprovalTravelers} />
          )}
        </div>
      );
    } else if (allEmployeesNoApproval && isWalletAllowed) {
      return (
        <div className="mt-4 w-full pb-10" ref={sendForApprovalRef}>
          <button
            className={`w-fit px-4 mt-5 flex flex-col items-center bg-[#028fa3] p-2 rounded-full text-white peer-checked:pointer-events-auto ${
              isOutOfPolicySendApproval && "opacity-50 cursor-not-allowed"
            }`}
            type="button"
            onClick={!isOutOfPolicySendApproval ? initiatePayment : null}
            disabled={isBookingLoading || isOutOfPolicySendApproval}
          >
            <div className="flex items-center gap-2">
              {isBookingLoading ? (
                <>
                  <FontAwesomeIcon icon={faSpinner} spin />
                  <span>Processing...</span>
                </>
              ) : (
                <>
                  <span>
                    {calculateTotalPayable() === 0
                      ? "Proceed to book"
                      : `Proceed to pay | Rs. ${formatPrice(
                          calculateTotalPayable()
                        )}`}
                  </span>
                </>
              )}
            </div>
          </button>
        </div>
      );
    }
  };

  // if (!flightData) {
  //   return <FlightReviewSkeleton />;
  // }

  const allEmployeesNoApproval = employeesNeedingApproval.length === 0;

  return (
    // <ProtectedRoute>
    <>
      <Head>
        <title>Approval </title>
      </Head>
      <div className="flex flex-col h-fit">
        <div className="border-b w-full bg-white z-9999999999999">
          <Header />
        </div>

        {/* divided sections of page */}
        {/* <div className="bg-white w-full h-14 mt-2 sticky top-0 left-0 z-[999] flex justify-center">
          <div className="flex items-center justify-center mx-2 sm:mx-0 space-x-1 sm:space-x-5">
            <div
              className={`flex flex-col sm:flex-row justify-center items-center space-x-2 cursor-pointer ${
                activeStep === 1 ? "text-[#028fa3]" : "text-gray-700"
              }`}
              onClick={() => scrollToSection(reviewDetailsRef, 1)}
            >
              <div
                className={`rounded-full w-5 h-5 flex items-center justify-center text-white font-bold text-xxxs sm:text-xs ${
                  activeStep === 1 ? "bg-[#028fa3]" : "bg-gray-400"
                }`}
              >
                1
              </div>
              <div className="font-medium ml-0 text-center text-xxxs sm:text-base">
                Review Details
              </div>
            </div>
      
            <div className="w-5 sm:w-12 h-[1px] bg-gray-300 mx-2 sm:mx-4" />
            <div
              className={`flex flex-col sm:flex-row items-center space-x-2 cursor-pointer ${
                activeStep === 2 ? "text-[#028fa3]" : "text-gray-700"
              }`}
              onClick={() => scrollToSection(travelerDetailsRef, 2)}
            >
              <div
                className={`rounded-full w-5 h-5 flex items-center justify-center text-white font-bold text-xxxs sm:text-xs ${
                  activeStep === 2 ? "bg-[#028fa3]" : "bg-gray-400"
                }`}
              >
                2
              </div>
              <div className="font-medium ml-0 text-center text-xxxs sm:text-base">
                Traveler Details
              </div>
            </div>
    
            <div className="w-5 sm:w-12 h-[1px] bg-gray-300 mx-2 sm:mx-4" />
            {ssrResponse &&
              ssrResponse.length > 0 &&
              (seatDynamic.length > 0 ||
                mealDynamic.length > 0 ||
                mealPrefs.length > 0 ||
                baggageData.length > 0) && (
                <>
                  <div
                    className={`flex flex-col sm:flex-row items-center space-x-2 cursor-pointer ${
                      activeStep === 3 ? "text-[#028fa3]" : "text-gray-700"
                    }`}
                    onClick={() => scrollToSection(selectAddonsRef, 3)}
                  >
                    <div
                      className={`rounded-full w-5 h-5 flex items-center justify-center text-white font-bold text-xxxs sm:text-xs ${
                        activeStep === 3 ? "bg-[#028fa3]" : "bg-gray-400"
                      }`}
                    >
                      3
                    </div>
                    <div className="font-medium ml-0 text-center text-xxxs sm:text-base">
                      Select Add-ons
                    </div>
                  </div>
                
                  <div className="w-5 sm:w-12 h-[1px] bg-gray-300 mx-2 sm:mx-4" />
                </>
              )}
            <div
              className={`flex flex-col sm:flex-row items-center space-x-2 cursor-pointer ${
                activeStep === 4 ? "text-[#028fa3]" : "text-gray-700"
              }`}
              onClick={() => scrollToSection(sendForApprovalRef, 4)}
            >
              <div
                className={`rounded-full w-5 h-5 flex items-center justify-center text-white font-bold text-xxxs sm:text-xs ${
                  activeStep === 4 ? "bg-[#028fa3]" : "bg-gray-400"
                }`}
              >
                {ssrResponse &&
                ssrResponse.length > 0 &&
                (seatDynamic.length > 0 ||
                  mealDynamic.length > 0 ||
                  mealPrefs.length > 0 ||
                  baggageData.length > 0)
                  ? "4"
                  : "3"}
              </div>
              <div className="font-medium ml-0 text-center text-xxxs sm:text-base">
                {allEmployeesNoApproval && isWalletAllowed
                  ? "Proceed to pay"
                  : !allEmployeesNoApproval && "Send for approval"}
              </div>
            </div>
          </div>
        </div> */}

        {/* review section */}
        <div className="bg-[#E5E9EB] h-full flex flex-row gap-3 flex-1 pt-3 px-3 2xl:mx-[12%]">
          <div className="w-full sm:w-4/6  overflow-y-scroll-hide mt-2">
            <div className="flex gap-2">
              <TravelRequestStatus
              // approvalStatus={approvalData?.approvalStatus}
              // paymentStatus={approvalData?.paymentStatus
              //   ?.toLowerCase()
              //   ?.trim()}
              />
              {/* <div className="block sm:hidden">
                    {approvalData?.approvalStatus !== "Cancelled" &&
                      approvalData?.approvalStatus !== "Declined" &&
                      approvalData?.paymentStatus !== "SUCCESS" &&
                      userDetails?.userId === approvalData?.userId && (
                        <div className="w-full">
                          <button
                            className="bg-[#028fa3] w-full text-white text-xxs sm:text-sm py-1 p-3 rounded-lg"
                            onClick={openCancelModal}
                          >
                            Cancel Request
                          </button>
                        </div>
                      )}
                    {approvalData?.approvalStatus === "Declined" && (
                      <div className="w-full">
                        <button
                          className="bg-[#028fa3] w-full text-white text-sm p-3 mt-5 rounded-lg"
                          onClick={() => router.push("/")}
                        >
                          Go to Homepage
                        </button>
                      </div>
                    )}
                  </div> */}
            </div>
            {/* waiting time for approval */}
            <div className="bg-white p-4 rounded-lg my-1 font-medium text-xxs sm:text-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-4">
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                <div className="flex items-center">
                  <FontAwesomeIcon icon={faClock} color="#7E0ED6" />
                  <span className="ml-2">Your travel is</span>
                </div>

                <div className="flex items-center">
                  <span className="text-gray-600">Requested on:</span>
                  <span className="ml-1 font-semibold">
                    {/* {formatDate(
                          approvalData?.bookingdetails?.[0]?.data?.createdDate
                        )} */}
                  </span>
                </div>
              </div>
              <div className="flex items-center">
                <span className="text-gray-600">Booking Status:</span>
                {/* <span
                      className={`ml-1 font-semibold ${getStatusColor(
                        approvalData?.bookingdetails?.[0]?.data?.bookingStatus
                      )}`}
                    >
                      {approvalData?.bookingdetails?.[0]?.data
                        ?.bookingStatus || "Pending"}
                    </span> */}
              </div>
            </div>
            {/* approver section */}
            <div ref={reviewDetailsRef}>
              <div>
                <ApproverDetails
                  travellers={refactoredCorporateEmployees}
                  travelCategory={TRAVEL_CATEGORIES.FLIGHTS}
                  parentClassName="bg-white p-4 rounded-lg"
                />
              </div>
              {/* flight details section */}
              <div className="bg-white rounded-md w-full h-fit p-4 mt-2">
                <div className="text-lg text-[#171A19] font-semibold ">
                  Flight information
                </div>
                {/* {fareQuoteSegments && ( */}
                <TicketReview
                  flightDetails={fareQuoteSegments}
                  journeyType={flightData?.journeyType}
                />
                <TravelInfoSection />
                {/* )} */}

                <div className="bg-white rounded-md w-full h-fit  mt-2 flex flex-col gap-2">
                  <TravelerDetails
                  // bookingDetails={approvalData?.bookingdetails}
                  // cabinClassName={cabinClassName}
                  />
                </div>
              </div>
            </div>
            {/* traveler details form section */}
            {/* <div ref={travelerDetailsRef}>
              {travelDetailsData && travelers && (
                <TravelerDetailsForm
                  travelCategory="flights"
                  travelerDetails={travelers}
                  setTravelerDetails={setTravelers}
                  travelDetailsData={travelDetailsData}
                  scrollToFirstError={scrollToFirstError}
                  validator={validator}
                  updateValidator={() =>
                    updateValidator(customMessages, customRules, true)
                  }
                  onScrollHandled={handleScrollHandled}
                  flightData={flightData}
                />
              )}
            </div> */}
            {/* contact details */}
            {/* <div className="bg-white rounded-md w-full h-fit p-4 mt-2 flex flex-col sm:flex-row items-start sm:items-center gap-3">
              <div className="w-full sm:w-2/6 flex flex-col justify-between">
                <div className="text-lg text-[#171A19] font-semibold">
                  Contact Details
                </div>
                <div className="text-xs font-medium leading-[15px]">
                  Your ticket will be sent to this email address
                </div>
              </div>
              <div className="w-full sm:w-4/6 flex flex-col sm:flex-row items-center gap-3">
                <div className="w-full sm:w-1/2">
                  <div className="relative w-full min-w-[50px] h-10">
                    <input
                      type="text"
                      id="workEmail"
                      name="workEmail"
                      className="block px-2.5 pb-2.5 pt-2.5 w-full text-sm text-gray-900 bg-transparent rounded-lg border-1 border-gray-300 appearance-none dark:text-black dark:border-gray-300 dark:focus:border-[#028fa3] focus:outline-none focus:ring-0 focus:border-[#028fa3]-600 peer"
                      placeholder=" "
                      value={
                        travelers && travelers.length > 0
                          ? travelers[0]?.email
                          : ""
                      }
                      //   onChange={handleChange}
                      maxLength={60}
                      autoComplete="off"
                    />
                    <label
                      for="workEmail"
                      className="absolute text-sm text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-white dark:bg-gray-900 px-2 peer-focus:px-2 peer-focus:text-[#028fa3] peer-focus:dark:text-[#028fa3] peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto start-1"
                    >
                      Work Email
                      <span className="text-red-500 absolute  right-[-5px] m-1 mt-0">
                        *
                      </span>
                    </label>
                  </div>
                </div>
                <div className="w-full sm:w-1/2">
                  <div className="relative w-full min-w-[50px] h-10">
                    <input
                      type="tel"
                      id="mobile"
                      name="mobile"
                      className="block px-2.5 pb-2.5 pt-2.5 w-full text-sm text-gray-900 bg-transparent rounded-lg border-1 border-gray-300 appearance-none dark:text-black dark:border-gray-300 dark:focus:border-[#028fa3] focus:outline-none focus:ring-0 focus:border-[#028fa3]-600 peer"
                      placeholder=" "
                      value={
                        travelers && travelers.length > 0
                          ? travelers[0]?.contactNo
                          : ""
                      }
                      //   onChange={handleChange}
                      maxLength={10}
                      autoComplete="off"
                    />
                    <label
                      for="mobile"
                      className="absolute text-sm text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-4 scale-75 top-2 z-9 origin-[0] bg-white dark:bg-gray-900 px-2 peer-focus:px-2 peer-focus:text-[#028fa3] peer-focus:dark:text-[#028fa3] peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto start-1"
                    >
                      Mobile Number
                      <span className="text-red-500 absolute  right-[-5px] m-1 mt-0">
                        *
                      </span>
                    </label>
                  </div>
                </div>
              </div>
            </div> */}
            {/* seats/meals/baggage section */}
            {/* {ssrResponse &&
              ssrResponse.length > 0 &&
              (seatDynamic.length > 0 ||
                mealDynamic.length > 0 ||
                mealPrefs.length > 0 ||
                baggageData.length > 0) && (
                <div
                  className="bg-white rounded-md w-full h-fit p-4 mt-2"
                  ref={selectAddonsRef}
                >
                  <div className="flex flex-col">
                    <span className="text-md font-medium">
                      Add Seats, Meals & Baggage
                    </span>
                    <span className="text-xs">
                      Select the Add-ons for {travelers.length} traveler
                      {travelers.length !== 1 ? "s" : ""} for{" "}
                      {flightsRequest?.fromCity} to {flightsRequest?.toCity}
                    </span>
                  </div>
                
                  <div className="p-2 mt-4 bg-[#028FA317] flex justify-between w-full">
                    {seatDynamic.length > 0 && (
                      <button
                        className={`${
                          activeButton === "Seats"
                            ? "bg-[#028fa3] text-white"
                            : "text-[#028fa3]"
                        } px-4 py-2 rounded w-2/6`}
                        onClick={() => setActiveButton("Seats")}
                      >
                        Seats
                      </button>
                    )}
                    {(mealDynamic.length > 0 || mealPrefs.length > 0) && (
                      <button
                        className={`${
                          activeButton === "Meals"
                            ? "bg-[#028fa3] text-white"
                            : "text-[#028fa3]"
                        } px-4 py-2 rounded w-2/6`}
                        onClick={() => setActiveButton("Meals")}
                      >
                        Meals
                      </button>
                    )}
                    {baggageData.length > 0 && (
                      <button
                        className={`${
                          activeButton === "Baggage"
                            ? "bg-[#028fa3] text-white"
                            : "text-[#028fa3]"
                        } px-4 py-2 rounded w-2/6`}
                        onClick={() => setActiveButton("Baggage")}
                      >
                        Baggage
                      </button>
                    )}
                  </div>
                  {activeButton === "Seats" &&
                    seatDynamic.length > 0 &&
                    travelers &&
                    travelers.length > 0 && (
                      <Seats
                        seatDynamic={seatDynamic}
                        ssr={ssrResponse}
                        flightsRequest={flightsRequest}
                        setTravelers={setTravelers}
                        travelers={travelers}
                        travelerIndex={travelerIndex}
                        setTravelerIndex={setTravelerIndex}
                        handleSSRSelection={handleSSRSelection}
                        corporateEmployees={flightsRequest?.corporateEmployees}
                      />
                    )}
                  {activeButton === "Meals" &&
                    (mealDynamic.length > 0 || mealPrefs.length > 0) &&
                    travelers &&
                    travelers.length > 0 && (
                      <Meals
                        mealDynamic={mealDynamic}
                        mealPrefs={mealPrefs}
                        ssrResponse={ssrResponse}
                        flightsRequest={flightsRequest}
                        setTravelers={setTravelers}
                        travelers={travelers}
                        travelerIndex={travelerIndex}
                        setTravelerIndex={setTravelerIndex}
                        handleSSRSelection={handleSSRSelection}
                        corporateEmployees={flightsRequest?.corporateEmployees}
                      />
                    )}
                  {activeButton === "Baggage" &&
                    baggageData.length > 0 &&
                    travelers &&
                    travelers.length > 0 && (
                      <>
                        <Baggage
                          baggageData={baggageData}
                          ssrResponse={ssrResponse}
                          flightsRequest={flightsRequest}
                          setTravelers={setTravelers}
                          travelers={travelers}
                          travelerIndex={travelerIndex}
                          setTravelerIndex={setTravelerIndex}
                          handleSSRSelection={handleSSRSelection}
                          corporateEmployees={
                            flightsRequest?.corporateEmployees
                          }
                        />
                      </>
                    )}
                </div>
              )} */}

            {/* fare details for mobile */}
            {fareDetails.length > 0 && (
              <div className="sm:hidden w-full sm:w-2/6 bg-white p-3 h-fit rounded-md mt-2">
                <FareSummary
                  fareDetails={fareDetails}
                  adults={adults}
                  setSsrFare={setSsrFare}
                  setTotalAmount={setTotalAmount}
                />
              </div>
            )}
            {/* GST details */}
            <div className="border-[1px] border-[#028FA32E] shadow-[6px_6px_30px_0px_#7D99B40D] rounded-md my-2 p-3 bg-white">
              <GSTDetails
                companyName={
                  userDetails?.loggedInDetails?.companyDetails?.companyName
                }
                gstNumber={userDetails?.loggedInDetails?.companyDetails?.gst}
                companyEmail={
                  userDetails?.loggedInDetails?.companyDetails?.gstEmail
                }
                companyMobile={
                  userDetails?.loggedInDetails?.companyDetails?.gstMobileNumber
                }
                companyAddress={
                  userDetails?.loggedInDetails?.companyDetails?.address
                }
              />
            </div>

            {allEmployeesNoApproval && isWalletAllowed && (
              <UseWalletBalanceButton
                walletBalance={walletBalance}
                checkwallet={checkwallet}
                goToWalletDetails={goToWalletDetails}
              />
            )}

            {/* request approval button */}
            {renderActionButton()}
          </div>
          {/* {fareDetails.length > 0 && ( */}
          <div className="hidden sm:block w-full sm:w-2/6 bg-white p-3 h-fit rounded-md my-2">
            <FareSummary
            // fareDetails={fareDetails}
            // adults={adults}
            // setSsrFare={setSsrFare}
            // setTotalAmount={setTotalAmount}
            // outOfPolicyTravelers={outOfPolicyTravelers}
            />
            <div className="w-full  bg-white p-2 rounded-lg h-fit">
              <HotelReview
              // hotel={previewData.hotel}
              // rooms={previewData.rooms}
              // searchData={previewData.searchRequest}
              // priceBreakup={priceBreakup}
              />
            </div>
          </div>
          {/* )} */}

          {isRequestModalOpen && (
            <RequestModal
              isOpen={isRequestModalOpen}
              title="Send Approval"
              subtitle="You will get notification to continue booking once the request gets approved."
              showApproverDetails={true}
              showReasonInput={true}
              onClose={closeModal}
              onSubmit={handleSendApproval}
              travellers={flightsRequest.corporateEmployees}
              buttonConfig={{
                cancel: "Close",
                submit: "Send Approval Request",
              }}
            />
          )}

          {isRequestSent && (
            <SentRequestModal
              isSentRequest={isRequestSent}
              onClose={() => setIsRequestSent(false)}
              isFlight={true}
            />
          )}
        </div>
      </div>
      <div className="relative z-[9]">
        <Footer1 />
      </div>
    </>
    // </ProtectedRoute>
  );
}
