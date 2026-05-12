import { useMemo } from "react";
import { useState, useEffect, useRef } from "react";
import { useSelector } from "react-redux";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faInfoCircle, faSpinner } from "@fortawesome/free-solid-svg-icons";
import Header from "@/components/flights/B2cHeader/Header";
import TicketReview from "@/components/b2c/flights/ticketReview";
import FareSummary from "@/components/b2c/flights/fareSummary";
import Seats from "@/components/b2c/flights/mealsSeatsBaggage/seats";
import Baggage from "@/components/b2c/flights/mealsSeatsBaggage/baggage";
import Meals from "@/components/b2c/flights/mealsSeatsBaggage/meals";
import axios, {
  getTabSpecificData,
  setTabSpecificData,
} from "@/utils/axios/axios";
import config from "@/config";
import { useRouter } from "next/router";
import TravelerDetailsForm from "@/components/b2c/common/forms/TravelerDetailsForm";
import useFormValidator from "@/hooks/useFormValidator";
import Footer1 from "@/components/footer/footer";
import UseWalletBalanceButton from "@/components/wallet/walletButton/useWalletButton";
import FlightReviewSkeleton from "@/components/corporate/Loaders/Flight/FlightReviewSkeleton";
import { confirmPaymentFlights } from "@/utils/walletApis";
import Head from "next/head";
import { getPaymentGateway, getPaymentSessionID } from "@/utils/bookingAPI";
import { routeToPg } from "@/paymentGateways/pgRouting";
import { formatPrice } from "@/utils/common";
import { useLogin } from "@/store/context/LoginContext";
import showToast from "@/utils/toast";
import {
  selectIsLoggedIn,
  selectB2CWalletBalance,
} from "@/store/selectors/b2cSelectors";
import GoToTopButton from "@/components/gototopbutton/gototopbutton";
import DuplicateBookingModal from "@/components/common/flights/DuplicateBookingModal";

export default function Review() {
  const userDetails = useSelector((state) => state?.user?.userInfo);
  const isLoggedIn = useSelector(selectIsLoggedIn);
  const walletBalance = useSelector(selectB2CWalletBalance);

  const router = useRouter();

  const { openFlightPricePopup, openPopup } = useLogin();
  const [proceedToggle, setProceedToggle] = useState(false);
  const [activeButton, setActiveButton] = useState("Seats");
  const [ssrResponse, setSsrResponse] = useState();
  const [fareDetails, setFareDetails] = useState([]);
  const [adults, setAdults] = useState();
  const [fareQuoteSegments, setFareQuoteSegments] = useState();
  const [flightData, setFlightData] = useState();
  const [flightsRequest, setFlightsRequest] = useState([]);
  const [seatDynamic, setSeatDynamic] = useState([]);
  const [mealDynamic, setMealDynamic] = useState(false);
  const [mealPrefs, setMealPrefs] = useState();
  const [baggageData, setBaggageData] = useState(false);
  const [travelerIndex, setTravelerIndex] = useState(0);
  const [travelers, setTravelers] = useState([]);
  const [travelDetailsData, setTravelDetailsData] = useState();
  const [totalAmount, setTotalAmount] = useState(0);
  const [ssrFare, setSsrFare] = useState(0);
  const [passportRequired, setPassportRequired] = useState(false);
  const [activeStep, setActiveStep] = useState(1);
  const [validationTrigger, setValidationTrigger] = useState(false);
  const [scrollToFirstError, setScrollToFirstError] = useState(false);
  const [isBookingLoading, setIsBookingLoading] = useState(false);
  const [walletSelected, setWalletSelected] = useState(false);
  const [isMealRequired, setIsMealRequired] = useState(false);
  const [isSeatRequired, setIsSeatRequired] = useState(false);
  const [showDuplicateModal, setShowDuplicateModal] = useState(false);
  const [duplicatePassengers, setDuplicatePassengers] = useState([]);

  const reviewDetailsRef = useRef(null);
  const travelerDetailsRef = useRef(null);
  const selectAddonsRef = useRef(null);
  const proceedToPayRef = useRef(null);

  const sections = useMemo(
    () => [
      { ref: reviewDetailsRef, step: 1 },
      { ref: travelerDetailsRef, step: 2 },
      { ref: selectAddonsRef, step: 3 },
      { ref: proceedToPayRef, step: 4 },
    ],
    [reviewDetailsRef, travelerDetailsRef, selectAddonsRef, proceedToPayRef],
  );

  const toNumber = (value) => {
    if (Array.isArray(value)) {
      return Number(value[0]) || 0;
    }
    return Number(value) || 0;
  };

  // Extract counts
  const numberOfAdults = toNumber(
    flightData?.request?.searchReqData?.adultCount,
  );
  const numberOfChildrens = toNumber(
    flightData?.request?.searchReqData?.childCount,
  );
  const numberOfInfants = toNumber(
    flightData?.request?.searchReqData?.infantCount,
  );
  const allTravelersCount =
    numberOfAdults + numberOfChildrens + numberOfInfants;

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

  useEffect(() => {
    const getMostVisibleSection = () => {
      const viewportHeight = window.innerHeight;
      let maxVisibleSection = null;
      let maxVisibleArea = 0;

      sections.forEach(({ ref, step }) => {
        if (ref.current) {
          const rect = ref.current.getBoundingClientRect();
          const visibleHeight =
            Math.min(rect.bottom, viewportHeight) - Math.max(rect.top, 0);
          const visibleArea = Math.max(0, visibleHeight) / rect.height;

          if (visibleArea > maxVisibleArea) {
            maxVisibleArea = visibleArea;
            maxVisibleSection = step;
          }
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
    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();

    return () => window.removeEventListener("scroll", handleScroll);
  }, [sections]);

  const scrollToSection = (ref, step) => {
    const offset = 80;
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

  const initiatePayment = async (bypassDuplicate = false) => {
    if (!isLoggedIn) {
      openPopup();
      return;
    }
    try {
      const isValid = validator.allValid();

      if (!isValid) {
        validator.showMessages();
        setValidationTrigger((prev) => !prev);
        setScrollToFirstError(true);
        setTravelDetailsData({ ...travelDetailsData });
        return;
      }

      // ✅ Validate SSR selection (Seats & Meals)
      const ssrErrors = validateSSRSelection();

      if (ssrErrors.length > 0) {
        console.error("SSR Validation Errors:", ssrErrors);

        // Group errors by type
        const seatErrors = ssrErrors.filter((e) => e.type === "SEAT");
        const mealErrors = ssrErrors.filter((e) => e.type === "MEAL");

        // Show toast messages
        if (seatErrors.length > 0) {
          showToast("error", `Seat selection required for all travelers`, {
            position: "top-right",
            autoClose: 5000,
          });

          // Scroll to seats section
          if (selectAddonsRef.current) {
            setActiveButton("Seats");
            scrollToSection(selectAddonsRef, 3);
          }
        }

        if (mealErrors.length > 0) {
          showToast("error", `Meal selection required for all travelers`, {
            position: "top-right",
            autoClose: 5000,
          });

          // If no seat errors, scroll to meals
          if (seatErrors.length === 0 && selectAddonsRef.current) {
            setActiveButton("Meals");
            scrollToSection(selectAddonsRef, 3);
          }
        }

        // Show detailed error message
        const errorMessage = ssrErrors.map((e) => e.message).join("\n");
        showToast("error", errorMessage, {
          position: "top-center",
          autoClose: 8000,
          style: { whiteSpace: "pre-line" },
        });

        return;
      }

      setIsBookingLoading(true);

      let response;
      try {
        response = await bookTicketApi(bypassDuplicate);
      } catch (apiError) {
        // ─── Handle 409 Duplicate Booking ───────────────────────────────────
        if (
          apiError?.response?.status === 409 &&
          apiError?.response?.data?.errorCode === "DUPLICATE_BOOKING"
        ) {
          const dupData = apiError.response.data.data;
          setDuplicatePassengers(dupData?.duplicatePassengers || []);
          setShowDuplicateModal(true);
          return; // wait for user confirmation
        }

        // ─── Handle same-name passenger error ────────────────────────────────
        if (apiError?.response?.data?.errorCode === "SAME_NAME_PASSENGER") {
          showToast(
            "error",
            apiError.response.data.message ||
              "Duplicate passenger name detected.",
            {
              position: "top-center",
              autoClose: 8000,
            },
          );
          return;
        }
        throw apiError; // re-throw unrelated errors
      } finally {
        setIsBookingLoading(false);
      }

      if (response?.data?.status === "SUCCESS") {
        const bookingId = response?.data?.data?.bookingId;
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
            const travelCategory = "2"; // Adjusted constant
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
              // Removed companyId
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
                "",
                {
                  customReturnPath: "bookings/confirmation",
                  customQueryParams: {
                    booking_id: bookingId,
                  },
                },
                // Removed companyId
              );
            }
          } else {
            let confirmReq = {
              bookingId: bookingId,
              paymentRefernceId: bookingId,
              paymentStatus: "SUCCESS",
              paymentAmount: payable,
              pgCode: pgRes.data.pgCode,
              bookingPaymentRefIds: [],
              walletAmount: totalAmount - payable,
            };
            await confirmPaymentFlights(confirmReq);
            router.push({
              pathname: "/bookings/confirmation",
              query: { booking_id: bookingId },
            });
            // toast("Payment amount is zero.");
          }
        }
      }
    } catch (error) {
      console.error("Error in payment:", error);
    } finally {
      setIsBookingLoading(false);
    }
  };

  const mapPassengersToEmpty = (passportRequired) => {
    const passengerTypes = [
      ...Array.from({ length: numberOfAdults }, (_, i) => ({
        label: `Adult ${i + 1}`,
        type: "adult",
        paxType: "1",
        isLeadPax: i === 0, // first adult is lead pax
      })),
      ...Array.from({ length: numberOfChildrens }, (_, i) => ({
        label: `Child ${i + 1}`,
        type: "child",
        paxType: "2",
        isLeadPax: false,
      })),
      ...Array.from({ length: numberOfInfants }, (_, i) => ({
        label: `Infant ${i + 1}`,
        type: "infant",
        paxType: "3",
        isLeadPax: false,
      })),
    ];

    const passengerDetails = passengerTypes.map((p) => ({
      title: { value: "", label: "" },
      firstName: "",
      lastName: "",
      paxType: p.paxType,
      dateOfBirth: null,
      gender: "",
      passportNo: passportRequired ? "" : null,
      passportExpiry: passportRequired ? null : null,
      passportIssueDate: passportRequired ? null : null,
      passportIssueCountryCode: passportRequired ? null : null,
      addressLine1: "",
      addressLine2: "",
      city: { value: "", label: "" },
      countryCode: "",
      countryName: { value: "", label: "" },
      nationality: "",
      cellCountryCode: "+91",
      contactNo: "",
      email: "",
      isLeadPax: p.isLeadPax,
      ffAirlineCode: "",
      ffNumber: "",
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
      documentList: null,
    }));

    return passengerDetails;
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
    const travelerData = JSON.parse(getTabSpecificData("passengerDetails"));
    const encodedFlightData = getTabSpecificData("selectedFlightDataCorporate");
    const flightData = encodedFlightData ? JSON.parse(encodedFlightData) : null;
    const flightsRequest = flightData?.request;
    let updatedTravelDetails = { ...travelDetailsData };
    const storedTraceId = getTabSpecificData("qTraceId");
    const isNewSearch =
      !storedTraceId || storedTraceId !== flightData?.qTraceId;

    if (flightsRequest) {
      setFlightsRequest(flightsRequest);
    }

    const passportRequired = extractPassportRequirements(flightData);
    setPassportRequired(passportRequired);

    if (isNewSearch || !travelerData || travelerData.length === 0) {
      setTabSpecificData("passengerDetails", JSON.stringify([]));
      const passengerDetails = mapPassengersToEmpty(passportRequired);

      updatedTravelDetails.totalTravelers = Array.from(
        { length: allTravelersCount },
        (_, i) => i + 1,
      );
      setTravelers(passengerDetails);
      // Store new qTraceId to track this search
      setTabSpecificData("qTraceId", flightData?.qTraceId || "");
    }
    // else {

    //   updatedTravelDetails.totalTravelers = Array.from(
    //     { length: allTravelersCount },
    //     (_, i) => i + 1
    //   );
    //   setTravelers(travelerData);
    //   // setSeatDynamic();
    //   // setMealDynamic();
    //   // setBaggageData();
    //   // setMealPrefs();
    //   // setSsrResponse();
    //   console.log("the travelerr fcvcvb",travelerData);
    // }
    else {
      updatedTravelDetails.totalTravelers = Array.from(
        { length: allTravelersCount },
        (_, i) => i + 1,
      );

      // Clear SSR data from travelers when setting new travelers
      const cleanedTravelerData = travelerData.map((traveler) => ({
        ...traveler,
        seatDynamic: [],
        mealDynamic: [],
        baggage: [],
        mealPreference: [],
      }));

      setTravelers(cleanedTravelerData);

      // Clear all SSR states
      setSeatDynamic([]);
      setMealDynamic([]);
      setBaggageData([]);
      setMealPrefs([]);

      console.log("the travelerr fcvcvb", cleanedTravelerData);
    }

    if (flightData) {
      setAdults(numberOfAdults);
      setFlightData(flightData);
      setSsrResponse(flightData.ssrData);

      // ✅ Extract SSR requirements from fare quote
      const extractSSRRequirements = (fareQuoteData) => {
        let mealRequired = false;
        let seatRequired = false;

        fareQuoteData.forEach((fareQuote) => {
          if (fareQuote?.data?.isMealRequired) {
            mealRequired = true;
          }
          if (fareQuote?.data?.isSeatRequired) {
            seatRequired = true;
          }
        });

        return { mealRequired, seatRequired };
      };

      const { mealRequired, seatRequired } = extractSSRRequirements(
        flightData.fareQuote.data,
      );

      setIsMealRequired(mealRequired);
      setIsSeatRequired(seatRequired);

      console.log("SSR Requirements:", {
        isMealRequired: mealRequired,
        isSeatRequired: seatRequired,
      });

      const { seats, mealDynamic, meals, baggages } =
        processSSRData(flightData);

      if (seats.length === 0) {
        setActiveButton(
          meals.length === 0 && mealDynamic.length === 0 ? "Baggage" : "Meals",
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
  }, [
    // userDetails,
    numberOfAdults,
    numberOfChildrens,
    numberOfInfants,
    allTravelersCount,
  ]);

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
    validMobileIntl: {
      message: "Invalid or incomplete mobile number.",
      rule: (val, params, validator) => {
        const regex = /^[0-9]{1,20}$/;
        return regex.test(val);
      },
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
        const today = new Date();
        return issueDate <= today;
      },
    },
    passportIssueComparison: {
      message: "Passport issue date should not be greater than today's date.",
      rule: (val, params, validator) => {
        const issueDate = new Date(val);
        const today = new Date();
        return issueDate <= today;
      },
    },
    passportDateComparison: {
      message: "Passport issue date should be less than expiry date.",
      rule: (val, params, validator) => {
        const issueDate = new Date(params[0]);
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
            arrivalDateString.replace(/-/g, "/").slice(0, 10),
          );
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
          arrivalDateString.replace(/-/g, "/").slice(0, 10),
        );
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
    customRules,
  );

  const handleSSRSelection = (ssrType, data) => {
    switch (ssrType) {
      case "SEAT":
        updateSeats(data);
        return;

      case "MEAL":
        updateMeals(data);
        return;

      case "BAGGAGE":
        updateBaggage(data);
        return;
    }
  };

  useEffect(() => {
    let ssrFare = 0;
    if (travelers && travelers.length > 0) {
      travelers.map((traveler) => {
        const seatsFare = traveler.seatDynamic.reduce(
          (sum, item) => sum + item.price,
          0,
        );
        const mealsFare = traveler.mealDynamic.reduce(
          (sum, item) => sum + item.price,
          0,
        );
        const baggageFare = traveler.baggage.reduce(
          (sum, item) => sum + item.price,
          0,
        );
        ssrFare += seatsFare + mealsFare + baggageFare;
      });
      setFareDetails((prevFareDetails) => {
        const updatedFareDetails = [...prevFareDetails];
        if (updatedFareDetails.length > 0) {
          updatedFareDetails[0].ssrFare = ssrFare;
        }
        return updatedFareDetails;
      });
      setTabSpecificData("passengerDetails", JSON.stringify(travelers)); // Changed key
    }
  }, [travelers]);

  // const updateSeats = (seat) => {
  //   setTravelers((prevTravelers) => {
  //     const updatedTravelers = [...prevTravelers];
  //     const selectedTraveler = { ...updatedTravelers[travelerIndex] };
  //     let updatedSeatDynamic = [...selectedTraveler.seatDynamic];
  //     if (updatedSeatDynamic.length === 0) {
  //       updatedSeatDynamic.push(seat);
  //     }
  //     selectedTraveler?.seatDynamic?.map((s, index) => {
  //       if (s.origin === seat.origin && s.destination === seat.destination) {
  //         if (updatedSeatDynamic[index]?.code === seat?.code) {
  //           updatedSeatDynamic.splice(index, 1);
  //         } else {
  //           updatedSeatDynamic[index] = seat;
  //         }
  //       } else {
  //         updatedSeatDynamic.push(seat);
  //       }
  //     });
  //     selectedTraveler.seatDynamic = updatedSeatDynamic;
  //     updatedTravelers[travelerIndex] = selectedTraveler;
  //     return updatedTravelers;
  //   });
  // };

  const updateSeats = (seat) => {
    setTravelers((prevTravelers) =>
      prevTravelers.map((traveler, index) => {
        if (index !== travelerIndex) return traveler;

        const currentSegmentKey = `${seat.origin}-${seat.destination}`;

        const existingIndex = traveler.seatDynamic.findIndex(
          (s) => `${s.origin}-${s.destination}` === currentSegmentKey,
        );

        // 🟢 CASE 1: Same seat clicked again → REMOVE
        if (
          existingIndex !== -1 &&
          traveler.seatDynamic[existingIndex].code === seat.code
        ) {
          return {
            ...traveler,
            seatDynamic: traveler.seatDynamic.filter(
              (_, i) => i !== existingIndex,
            ),
          };
        }

        // 🟡 CASE 2: Same segment, different seat → REPLACE
        if (existingIndex !== -1) {
          const updated = [...traveler.seatDynamic];
          updated[existingIndex] = seat;
          return {
            ...traveler,
            seatDynamic: updated,
          };
        }

        // 🔵 CASE 3: New segment → ADD
        return {
          ...traveler,
          seatDynamic: [...traveler.seatDynamic, seat],
        };
      }),
    );
  };

  // const updateBaggage = (baggage) => {
  //   setTravelers((prevTravelers) => {
  //     const updatedTravelers = [...prevTravelers];
  //     const selectedTraveler = { ...updatedTravelers[travelerIndex] };
  //     let updatedBaggage = [...selectedTraveler.baggage];
  //     if (updatedBaggage.length === 0) {
  //       updatedBaggage.push(baggage);
  //     }
  //     selectedTraveler?.baggage?.map((s, index) => {
  //       if (
  //         s.origin === baggage.origin &&
  //         s.destination === baggage.destination
  //       ) {
  //         if (updatedBaggage[index]?.code === baggage?.code) {
  //           updatedBaggage.splice(index, 1);
  //         } else {
  //           updatedBaggage[index] = baggage;
  //         }
  //       } else {
  //         updatedBaggage.push(baggage);
  //       }
  //     });
  //     selectedTraveler.baggage = updatedBaggage;
  //     updatedTravelers[travelerIndex] = selectedTraveler;
  //     return updatedTravelers;
  //   });
  // };

  // const updateMeals = (meal) => {
  //   setTravelers((prevTravelers) => {
  //     const updatedTravelers = [...prevTravelers];
  //     const selectedTraveler = { ...updatedTravelers[travelerIndex] };
  //     let updatedMealDynamic = [...selectedTraveler.mealDynamic];
  //     let updatedMealPrefs = [...selectedTraveler.mealPreference];

  //     if (mealDynamic.length > 0) {
  //       if (updatedMealDynamic.length === 0) {
  //         updatedMealDynamic.push(meal);
  //       }
  //       selectedTraveler.mealDynamic.map((m, index) => {
  //         if (m.origin === meal.origin && m.destination === meal.destination) {
  //           if (updatedMealDynamic[index]?.code === meal?.code) {
  //             updatedMealDynamic.splice(index, 1);
  //           } else {
  //             updatedMealDynamic[index] = meal;
  //           }
  //         } else {
  //           updatedMealDynamic.push(meal);
  //         }
  //       });

  //       selectedTraveler.mealDynamic = updatedMealDynamic;
  //     } else if (mealPrefs.length > 0) {
  //       if (updatedMealPrefs.length === 0) {
  //         updatedMealPrefs.push(meal);
  //       }
  //       selectedTraveler.mealPreference.map((m, index) => {
  //         if (m.origin === meal.origin && m.destination === meal.destination) {
  //           if (updatedMealPrefs[index]?.code === meal?.code) {
  //             updatedMealPrefs.splice(index, 1);
  //           } else {
  //             updatedMealPrefs[index] = meal;
  //           }
  //         } else {
  //           updatedMealPrefs.push(meal);
  //         }
  //       });

  //       selectedTraveler.mealPreference = updatedMealPrefs;
  //     }
  //     updatedTravelers[travelerIndex] = selectedTraveler;
  //     return updatedTravelers;
  //   });
  // };

  const updateBaggage = (baggage) => {
    setTravelers((prevTravelers) =>
      prevTravelers.map((traveler, index) => {
        if (index !== travelerIndex) return traveler;

        const segmentKey = `${baggage.origin}-${baggage.destination}`;
        const existingIndex = traveler.baggage.findIndex(
          (b) => `${b.origin}-${b.destination}` === segmentKey,
        );

        // 🟢 CASE 1: Same baggage clicked → REMOVE
        if (
          existingIndex !== -1 &&
          traveler.baggage[existingIndex].code === baggage.code
        ) {
          return {
            ...traveler,
            baggage: traveler.baggage.filter((_, i) => i !== existingIndex),
          };
        }

        // 🟡 CASE 2: Same segment → REPLACE
        if (existingIndex !== -1) {
          const updated = [...traveler.baggage];
          updated[existingIndex] = baggage;
          return {
            ...traveler,
            baggage: updated,
          };
        }

        // 🔵 CASE 3: New segment → ADD
        return {
          ...traveler,
          baggage: [...traveler.baggage, baggage],
        };
      }),
    );
  };

  const updateMeals = (meal) => {
    setTravelers((prevTravelers) =>
      prevTravelers.map((traveler, index) => {
        if (index !== travelerIndex) return traveler;

        const segmentKey = `${meal.origin}-${meal.destination}`;

        const isDynamic = mealDynamic.length > 0;
        const currentMeals = isDynamic
          ? traveler.mealDynamic
          : traveler.mealPreference;

        const existingIndex = currentMeals.findIndex(
          (m) => `${m.origin}-${m.destination}` === segmentKey,
        );

        // 🔴 CASE 1: same meal clicked → REMOVE
        if (
          existingIndex !== -1 &&
          currentMeals[existingIndex].code === meal.code
        ) {
          const updated = currentMeals.filter((_, i) => i !== existingIndex);

          return {
            ...traveler,
            ...(isDynamic
              ? { mealDynamic: updated }
              : { mealPreference: updated }),
          };
        }

        // 🟡 CASE 2: same segment → REPLACE
        if (existingIndex !== -1) {
          const updated = [...currentMeals];
          updated[existingIndex] = meal;

          return {
            ...traveler,
            ...(isDynamic
              ? { mealDynamic: updated }
              : { mealPreference: updated }),
          };
        }

        // 🟢 CASE 3: new segment → ADD
        return {
          ...traveler,
          ...(isDynamic
            ? { mealDynamic: [...currentMeals, meal] }
            : { mealPreference: [...currentMeals, meal] }),
        };
      }),
    );
  };

  const validateSSRSelection = () => {
    const errors = [];

    // Get unique segments from fare quote
    const getUniqueSegments = () => {
      const segments = new Set();

      fareQuoteSegments?.forEach((fareQuote) => {
        fareQuote.segments?.forEach((segmentList) => {
          const firstSegment = segmentList.segment[0];
          const lastSegment =
            segmentList.segment[segmentList.segment.length - 1];

          const segmentKey = `${firstSegment.origin.airport.cityCode}-${lastSegment.destination.airport.cityCode}`;
          segments.add(segmentKey);
        });
      });

      return Array.from(segments);
    };

    const uniqueSegments = getUniqueSegments();
    console.log("Unique segments for validation:", uniqueSegments);

    // ✅ Validate Seat Selection
    if (isSeatRequired && seatDynamic.length > 0) {
      travelers.forEach((traveler, index) => {
        // Skip infants - they don't need seats
        if (traveler.paxType === "3") {
          return;
        }

        const travelerName = `${traveler.firstName || "Traveler"} ${
          traveler.lastName || index + 1
        }`;

        // Check if traveler has selected seats for all segments
        const selectedSegments = new Set(
          traveler.seatDynamic.map(
            (seat) => `${seat.origin}-${seat.destination}`,
          ),
        );

        const missingSegments = uniqueSegments.filter(
          (segment) => !selectedSegments.has(segment),
        );

        if (missingSegments.length > 0) {
          errors.push({
            type: "SEAT",
            traveler: travelerName,
            message: `Please select a seat for ${travelerName} on ${missingSegments.join(
              ", ",
            )}`,
          });
        }
      });
    }

    // ✅ Validate Meal Selection
    if (isMealRequired && (mealDynamic.length > 0 || mealPrefs.length > 0)) {
      travelers.forEach((traveler, index) => {
        const travelerName = `${traveler.firstName || "Traveler"} ${
          traveler.lastName || index + 1
        }`;

        // Check which meal type is available
        const hasMealDynamic = mealDynamic.length > 0;
        const hasMealPrefs = mealPrefs.length > 0;

        let selectedSegments;
        if (hasMealDynamic) {
          selectedSegments = new Set(
            traveler.mealDynamic.map(
              (meal) => `${meal.origin}-${meal.destination}`,
            ),
          );
        } else if (hasMealPrefs) {
          selectedSegments = new Set(
            traveler.mealPreference.map(
              (meal) => `${meal.origin}-${meal.destination}`,
            ),
          );
        }

        const missingSegments = uniqueSegments.filter(
          (segment) => !selectedSegments.has(segment),
        );

        if (missingSegments.length > 0) {
          errors.push({
            type: "MEAL",
            traveler: travelerName,
            message: `Please select a meal for ${travelerName} on ${missingSegments.join(
              ", ",
            )}`,
          });
        }
      });
    }

    return errors;
  };

  const bookTicketApi = async (bypassDuplicate = false) => {
    try {
      const filterMealPrefs = (mealPreferences) => {
        return mealPreferences.map((meal) => {
          let filteredMeal = { ...meal };
          delete filteredMeal.origin;
          delete filteredMeal.destination;
          delete filteredMeal.airlineDescription;
          return filteredMeal;
        });
      };
      const storedUserIp = getTabSpecificData("userip");

      const totalPayable = calculateTotalPayable();

      let resultIndex =
        flightData.resultIndexes.length > 1
          ? flightData.resultIndexes[0] + "," + flightData.resultIndexes[1]
          : flightData.resultIndexes[0];

      let passengers = travelers.map((passenger) => {
        const frequentFlyerForAPI =
          passenger?.frequentFlyerDetails?.length > 0
            ? {
                ffAirlineCode:
                  passenger.frequentFlyerDetails[0]?.airlineCode || "",
                ffNumber:
                  passenger.frequentFlyerDetails[0]?.frequentFlyerNumber || "",
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
          gender: passenger?.title?.value.toLowerCase() === "mr" ? "1" : "2",
          countryName: passenger?.countryName?.label || null,
          email: passenger?.email || null,
          seatDynamic:
            passenger?.seatDynamic.length > 0 ? passenger?.seatDynamic : null,
          baggage: passenger?.baggage.length > 0 ? passenger?.baggage : null,
          mealDynamic:
            passenger.mealDynamic.length > 0 ? passenger.mealDynamic : null,
          mealPreference:
            passenger.mealPreference.length > 0
              ? filterMealPrefs(passenger.mealPreference)
              : null,
          // dateOfBirth:
          //   new Date(passenger?.dateOfBirth)
          //     .toISOString()
          //     .replace(/\.\d{3}Z$/, "") || null,
          dateOfBirth: passenger?.dateOfBirth
            ? new Date(passenger.dateOfBirth)
                .toISOString()
                .replace(/\.\d{3}Z$/, "")
            : null, // or "" depending on your requirement
          addressLine1:
            passenger.addressLine1 ||
            `${passenger?.city?.label || ""}, ${
              passenger?.countryName?.label || ""
            }`,
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
          gstCompanyAddress: passenger?.gstCompanyAddress || "",
          gstCompanyContactNumber: passenger?.gstCompanyContactNumber || "",
          gstCompanyName: passenger?.gstCompanyName || "",
          gstNumber: passenger?.gstNumber || "",
          gstCompanyEmail: passenger?.gstCompanyEmail || "",
          documentList: null,
          passportIssueCountryCode: passportRequired
            ? passenger?.passportIssueCountryCode?.code || null
            : null,
          ...frequentFlyerForAPI,
        };
      });

      let ticketPayload = {
        bypassDuplicateCheck: bypassDuplicate,
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
      };
      console.log("the passenger details are", passengers);
      const response = await axios.post(
        `${config.FLIGHTS_BOOKING_LCC_TICKET}`,
        ticketPayload,
      );
      return response;
    } catch (error) {
      console.error("Error in bookTicketApi:", error);
      const errorMessage =
        error.response?.data?.error?.errorMsg ||
        error.response?.data?.message ||
        error.message ||
        "An error occurred while booking the ticket.";
      showToast("error", errorMessage);
      throw error;
    }
  };

  if (!flightData) {
    return <FlightReviewSkeleton />;
  }

  return (
    <>
      <Head>
        <title>Review Booking</title>
      </Head>
      <div className="flex flex-col h-fit">
        <GoToTopButton />
        <div className="border-b w-full bg-white z-9999999999999">
          <Header />
        </div>

        {/* divided sections of page */}
        <div className="bg-white w-full h-14 mt-2 sticky top-0 left-0 z-[999] flex justify-center">
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
            {/* Divider Line */}
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
            {/* Divider Line */}
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
                  {/* Divider Line */}
                  <div className="w-5 sm:w-12 h-[1px] bg-gray-300 mx-2 sm:mx-4" />
                </>
              )}
            <div
              className={`flex flex-col sm:flex-row items-center space-x-2 cursor-pointer ${
                activeStep === 4 ? "text-[#028fa3]" : "text-gray-700"
              }`}
              onClick={() => scrollToSection(proceedToPayRef, 4)}
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
                Proceed to pay
              </div>
            </div>
          </div>
        </div>

        {/* review section */}
        <div className="bg-[#E5E9EB] h-full flex flex-row gap-3 flex-1 pt-3 px-3 2xl:mx-[12%]">
          <div className="w-full sm:w-4/6 overflow-y-scroll-hide mt-2">
            <div ref={reviewDetailsRef}>
              {/* flight details section */}
              <div className="bg-white rounded-md w-full h-fit p-4 mt-2">
                <div className="text-lg text-[#171A19] font-semibold ">
                  Flight information
                </div>
                {fareQuoteSegments && (
                  <TicketReview
                    flightDetails={fareQuoteSegments}
                    journeyType={flightData?.journeyType}
                  />
                )}
              </div>
            </div>
            {/* traveler details form section */}
            <div ref={travelerDetailsRef}>
              {travelDetailsData && travelers && (
                <TravelerDetailsForm
                  travelCategory="flights"
                  travelerDetails={travelers}
                  setTravelerDetails={setTravelers}
                  travelDetailsData={travelDetailsData}
                  scrollToFirstError={scrollToFirstError}
                  setScrollToFirstError={setScrollToFirstError}
                  setTravelDetailsData={setTravelDetailsData}
                  validator={validator}
                  updateValidator={() =>
                    updateValidator(customMessages, customRules, true)
                  }
                  onScrollHandled={handleScrollHandled}
                  flightData={flightData}
                />
              )}
            </div>

            {ssrResponse &&
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
                      {(isSeatRequired || isMealRequired) && (
                        <span className="text-red-500 ml-2 text-sm">
                          * Required
                        </span>
                      )}
                    </span>
                    <span className="text-xs">
                      Select the Add-ons for {allTravelersCount} traveler
                      {allTravelersCount > 1 ? "s" : ""} for{" "}
                      {flightsRequest?.fromCity} to {flightsRequest?.toCity}
                    </span>

                    {/* ✅ Show requirement indicators */}
                    {(isSeatRequired || isMealRequired) && (
                      <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded-md">
                        <div className="flex items-center gap-2 text-sm text-yellow-800">
                          <FontAwesomeIcon icon={faInfoCircle} />
                          <span>
                            {isSeatRequired &&
                              isMealRequired &&
                              "Seat and meal selection is mandatory for this booking"}
                            {isSeatRequired &&
                              !isMealRequired &&
                              "Seat selection is mandatory for this booking"}
                            {!isSeatRequired &&
                              isMealRequired &&
                              "Meal selection is mandatory for this booking"}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                  {/* seats/meals/baggage button */}
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
                        {isSeatRequired && (
                          <span className="absolute top-1 right-1 text-red-500">
                            *
                          </span>
                        )}
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
                        {isMealRequired && (
                          <span className="absolute top-1 right-1 text-red-500">
                            *
                          </span>
                        )}
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
                        isSeatRequired={isSeatRequired}
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
                        isMealRequired={isMealRequired}
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
                        />
                      </>
                    )}
                </div>
              )}

            {/* fare details for mobile */}
            {fareDetails.length > 0 && (
              <div className="sm:hidden w-full sm:w-2/6 bg-white p-3 h-fit rounded-md mt-2">
                <FareSummary
                  fareDetails={fareDetails}
                  adults={numberOfAdults}
                  child={numberOfChildrens}
                  infants={numberOfInfants}
                  travelers={allTravelersCount}
                  setSsrFare={setSsrFare}
                  setTotalAmount={setTotalAmount}
                />
              </div>
            )}

            {isLoggedIn && (
              <UseWalletBalanceButton
                walletBalance={walletBalance}
                checkwallet={checkwallet}
                goToWalletDetails={goToWalletDetails}
              />
            )}
            {/* proceed button */}
            <div className="mt-4 w-full pb-10" ref={proceedToPayRef}>
              <button
                className={`bg-[#028fa3] text-white text-sm rounded-full p-2 px-4 w-fit`}
                onClick={() => initiatePayment(false)}
                disabled={proceedToggle || isBookingLoading}
              >
                {isBookingLoading ? (
                  <>
                    <FontAwesomeIcon icon={faSpinner} spin />
                    <span>Processing...</span>
                  </>
                ) : (
                  <span>
                    {calculateTotalPayable() === 0
                      ? "Proceed to book"
                      : `Proceed to pay | Rs. ${formatPrice(
                          calculateTotalPayable(),
                        )}`}
                  </span>
                )}
              </button>
            </div>
          </div>
          {fareDetails.length > 0 && (
            <div className="hidden sm:block w-full sm:w-2/6 bg-white p-3 h-fit rounded-md mt-2">
              <FareSummary
                fareDetails={fareDetails}
                adults={numberOfAdults}
                travelers={allTravelersCount}
                child={numberOfChildrens}
                infants={numberOfInfants}
                setSsrFare={setSsrFare}
                setTotalAmount={setTotalAmount}
              />
            </div>
          )}
        </div>
      </div>
      <div className="relative z-[9]">
        <Footer1 />
      </div>

      {showDuplicateModal && (
        <DuplicateBookingModal
          passengers={duplicatePassengers}
          onConfirm={() => {
            setShowDuplicateModal(false);
            initiatePayment(true); // bypass = true
          }}
          onCancel={() => setShowDuplicateModal(false)}
        />
      )}
    </>
  );
}
