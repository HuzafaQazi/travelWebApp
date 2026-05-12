import React from "react";
import { useState, useEffect, useRef } from "react";
import { useSelector } from "react-redux";
import Image from "next/image";
import style from "./styles.module.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faAngleDown,
  faAngleUp,
  faArrowLeft,
  faPlus,
  faSquareXmark,
} from "@fortawesome/free-solid-svg-icons";
import SimpleReactValidator from "simple-react-validator";
import Select from "react-select";
import AsyncSelect from "react-select/async";
import axios from "@/utils/axios/axios";
import { getTabSpecificData, setTabSpecificData } from "@/utils/axios/axios";
import config from "@/config";
import { useRouter } from "next/router";
import AddMealsSelection from "@/components/flights/addmealselection/addmeal";
import "react-datepicker/dist/react-datepicker.css";
import { validateGst } from "../../../../utils/bookingAPI";
import SeatMap from "../seatMap/seatMap";

import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { logEvent } from "firebase/analytics";
import { analytics } from "../../../../utils/firebase";
import { useUserType } from "@/hooks/useUserType";
import showToast from "@/utils/toast";

const SideSheet = ({
  isOpen,
  onClose,
  flightData,
  isFlightDetailsOpen,
  parentLoader,
}) => {
  const userDetails = useSelector((state) => state?.user?.userInfo);

  const numberOfAdults = flightData?.flightsRequest?.searchReqData?.adultCount;
  const numberOfChildrens =
    flightData?.flightsRequest?.searchReqData?.childCount;
  const numberOfInfants =
    flightData?.flightsRequest?.searchReqData?.infantCount;

  const router = useRouter();
  const corporateUser = useUserType();

  const [isDetailsVisible, setDetailsVisible] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [isMealsVisible, setIsMealsVisible] = useState(false);
  const [showGuardianDetails, setShowGuardianDetails] = useState(false);
  const [isGstRequired, setIsGstRequired] = useState(false);
  const [selectedCity, setSelectedCity] = useState(null);
  const [selectedCountry, setSelectedCountry] = useState(null);
  const [passportIssueCountry, setPassportIssueCountry] = useState(null);
  const [selectedBaggage, setSelectedBaggage] = useState(null);
  const [isFontBold, setIsFontBold] = useState(false);
  const [selectedSection, setSelectedSection] = useState("details");
  const [isCorporateBooking, setIsCorporateBooking] = useState();
  const [selectedMeals, setSelectedMeals] = useState([]);
  const [mealQuantities, setMealQuantities] = useState({});
  const [mealPrice, setMealPrice] = useState(0);
  const [totalSelectedQuantity, setTotalSelectedQuantity] = useState(0);
  const [selected, setSelected] = useState(false);
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [isPopupOpen1, setIsPopupOpen1] = useState(false);
  const [selectedWeight, setSelectedWeight] = useState(null);
  const [isActive, setIsActive] = useState(false);
  const [baggageIndex, setBaggageIndex] = useState(null);
  const [mealIndex, setMealIndex] = useState(null);
  const [isSeatOpen, setIsSeatOpen] = useState(false);
  const [seatIndex, setSeatIndex] = useState(null);
  const [seatSegmentIndex, setSeatSegmentIndex] = useState(null);
  const [seatsData, setSeatsData] = useState(null);
  const [seatStopsData, setSeatStopsData] = useState(null);
  const [ssrDestinationsData, setSsrDestinationsData] = useState([]);
  const [ssrDestinationIndex, setSsrDestinationIndex] = useState(0);
  const [mealData, setMealData] = useState(null);
  const [mealSegment, setMealSegment] = useState(null);
  const [segmentIndex, setSegmentIndex] = useState(null);

  const passengerTypes = Array.from({ length: numberOfAdults }, (_, index) => ({
    label: `Adult ${index + 1}`,
    type: "adult",
  }))
    .concat(
      Array.from({ length: numberOfChildrens }, (_, index) => ({
        label: `Child ${index + 1}`,
        type: "child",
      }))
    )
    .concat(
      Array.from({ length: numberOfInfants }, (_, index) => ({
        label: `Infant ${index + 1}`,
        type: "infant",
      }))
    );

  const [passengerDetails, setPassengerDetails] = useState(() => {
    const details = passengerTypes.map((passengerType, i) => ({
      title: "",
      passengerType: passengerType.type,
      firstName: "",
      lastName: "",
      paxType: "1",
      dateOfBirth: "",
      gender: "",
      pan: null,
      passportNo: null,
      passportExpiry: null,
      passportIssueDate: null,
      passportIssueCountryCode: null,
      addressLine1: "",
      addressLine2: "",
      city: "",
      countryCode: "",
      cellCountryCode: "",
      countryName: "India",
      contactNo: null,
      nationality: "IN",
      email: null,
      isLeadPax: i === 0 ? true : false,
      ffAirlineCode: "",
      ffNumber: "",
      gstCompanyAddress: corporateUser
        ? userDetails?.loggedInDetails?.companyDetails?.gst === "null"
          ? ""
          : userDetails?.loggedInDetails?.companyDetails?.address
        : "",
      gstCompanyContactNumber: corporateUser
        ? userDetails?.loggedInDetails?.companyDetails?.gst === "null"
          ? ""
          : userDetails?.loggedInDetails?.companyDetails?.gstMobileNumber
        : "",
      gstCompanyName: corporateUser
        ? userDetails?.loggedInDetails?.companyDetails?.gst === "null"
          ? ""
          : userDetails?.loggedInDetails?.companyDetails?.companyName
        : "",
      gstNumber: corporateUser
        ? userDetails?.loggedInDetails?.companyDetails?.gst === "null"
          ? ""
          : userDetails?.loggedInDetails?.companyDetails?.gst
        : "",
      gstCompanyEmail: corporateUser
        ? userDetails?.loggedInDetails?.companyDetails?.gst === "null"
          ? ""
          : userDetails?.loggedInDetails?.companyDetails?.gstEmail
        : "",
      baggage: [],
      mealPreference: [],
      mealDynamic: [],
      seatDynamic: [],
      guardianDetails: {},
      documentList: null,
    }));
    return details;
  });

  const [, forceUpdate] = useState(0);

  useEffect(() => {
    const encodedPassengerDetails = ("passengerDetails");
    const selectedFlightSection = getTabSpecificData("selectedFlightSection");

    // Decode and set passenger details and selected section
    if (selectedFlightSection && encodedPassengerDetails) {
      const decodedPassengerDetails = JSON.parse(atob(encodedPassengerDetails));
      setPassengerDetails(decodedPassengerDetails);
      setSelectedSection(selectedFlightSection);
    } else if (corporateUser) {
      // Handle corporate user-specific data
      const encodedRequest = getTabSpecificData("flightRequest");
      const decodedRequest = JSON.parse(atob(encodedRequest));

      const corporateuserDetails = userDetails;
      if (corporateuserDetails) {
        const { loggedInDetails } = corporateuserDetails;
        const companyDetails = loggedInDetails?.companyDetails;
        if (decodedRequest?.corporateEmployees?.length > 0) {
          const details = decodedRequest?.corporateEmployees?.map(
            (employee, i) => {
              const passengerType = employee.data || {};
              let passportNo,
                passportExpiry,
                passportIssueDate,
                passportIssueCountryCode;

              // Check the conditions from renderPassportFields and set the values accordingly
              if (
                flightData?.fareQuoteResponse?.isLCC &&
                flightData?.fareQuoteResponse
                  ?.isPassportFullDetailRequiredAtBook
              ) {
                passportNo =
                  passengerType?.passportNumber?.toUpperCase() || null;
                passportExpiry = passengerType?.passportExpiry || null;
                passportIssueDate = passengerType?.passportIssueDate || null;
                passportIssueCountryCode =
                  passengerType?.passportIssueCountryCode || null;
              } else if (
                flightData?.fareQuoteResponse?.isLCC &&
                flightData?.fareQuoteResponse?.isPassportRequiredAtTicket
              ) {
                passportNo =
                  passengerType?.passportNumber?.toUpperCase() || null;
                passportExpiry = passengerType?.passportExpiry || null;
                passportIssueDate = null;
                passportIssueCountryCode = null;
              } else if (
                !flightData?.fareQuoteResponse?.isLCC &&
                flightData?.fareQuoteResponse
                  ?.isPassportFullDetailRequiredAtBook
              ) {
                passportNo =
                  passengerType?.passportNumber?.toUpperCase() || null;
                passportExpiry = passengerType?.passportExpiry || null;
                passportIssueDate = passengerType?.passportIssueDate || null;
                passportIssueCountryCode =
                  passengerType?.passportIssueCountryCode || null;
              } else if (
                !flightData?.fareQuoteResponse?.isLCC &&
                (flightData?.fareQuoteResponse?.isPassportRequiredAtBook ||
                  flightData?.fareQuoteResponse?.isPassportRequiredAtTicket)
              ) {
                passportNo =
                  passengerType?.passportNumber?.toUpperCase() || null;
                passportExpiry = passengerType?.passportExpiry || null;
                passportIssueDate = null;
                passportIssueCountryCode = null;
              } else {
                passportNo = null;
                passportExpiry = null;
                passportIssueDate = null;
                passportIssueCountryCode = null;
              }

              return {
                title:
                  { value: passengerType.title, label: passengerType.title } ||
                  "",
                passengerType: "adult",
                firstName: passengerType.firstName || "",
                lastName: passengerType.lastName || "",
                paxType: "1",
                dateOfBirth: passengerType?.dateOfBirth || "",
                gender:
                  passengerType?.title?.toLowerCase() === "mr" ? "1" : "2",
                pan: null,
                passportNo,
                passportExpiry,
                passportIssueDate,
                passportIssueCountryCode,
                addressLine1: companyDetails.address || "",
                addressLine2: "",
                city:
                  {
                    value: companyDetails?.cityDetails?.cityname,
                    label: companyDetails?.cityDetails?.cityname,
                  } || "",
                countryCode: companyDetails?.countryDetails?.alpha2code || "",
                cellCountryCode:
                  companyDetails?.countryDetails?.phonecode || "",
                countryName:
                  {
                    value: companyDetails?.countryDetails?.alpha2code,
                    label: companyDetails?.countryDetails?.countryname,
                  } || "India",
                contactNo: passengerType.mobile || null,
                nationality: companyDetails?.countryDetails?.alpha2code || "IN",
                email: passengerType.workEmail || null,
                isLeadPax: i === 0,
                ffAirlineCode: "",
                ffNumber: "",
                gstCompanyAddress: corporateUser
                  ? companyDetails?.gst === "null"
                    ? ""
                    : companyDetails?.address
                  : "",
                gstCompanyContactNumber: corporateUser
                  ? companyDetails?.gst === "null"
                    ? ""
                    : companyDetails?.gstMobileNumber
                  : "",
                gstCompanyName: corporateUser
                  ? companyDetails?.gst === "null"
                    ? ""
                    : companyDetails?.companyName
                  : "",
                gstNumber: corporateUser
                  ? companyDetails?.gst === "null"
                    ? ""
                    : companyDetails?.gst
                  : "",
                gstCompanyEmail: corporateUser
                  ? companyDetails?.gst === "null"
                    ? ""
                    : companyDetails?.gstEmail
                  : "",
                baggage: [],
                mealPreference: [],
                mealDynamic: [],
                seatDynamic: [],
                guardianDetails: {},
                documentList: null,
                companyId: passengerType.companyId || "",
              };
            }
          );

          setPassengerDetails(details);
        }
      }
    }
  }, [corporateUser, userDetails]);

  const toggleDetails = () => {
    setDetailsVisible(!isDetailsVisible);
  };

  const toggleMeals = () => {
    setIsMealsVisible(!isMealsVisible);
    setIsFontBold(!isFontBold);
  };

  const handleChangeSection = (section) => {
    setSelectedSection(section);
  };

  const handleClosePopup = () => {
    setIsPopupOpen(false);
  };

  const countryOptions = flightData.countryResponse.map((country) => ({
    value: country.alpha2code,
    label: country.countryname,
    phoneCode: country.phonecode,
  }));

  let titleOptions = [
    { value: "Mrs", label: "Mrs" },
    { value: "Miss", label: "Miss" },
  ];

  const guardianTitleOptions = [
    { value: "Mr", label: "Mr" },
    { value: "Mrs", label: "Mrs" },
    { value: "Miss", label: "Miss" },
  ];

  const fetchCities = async (inputValue, index) => {
    try {
      const { data } = await axios.get(
        `${config.FLIGHTS_CITY_BY_COUNTRY}?countrycode=${
          passengerDetails[index].countryCode
        }&cityname=${inputValue.trim()}`
      );
      const cities = data.data.map((city) => ({
        value: city.citycode,
        label: city.cityname,
      }));
      return cities;
    } catch (error) {
      console.log("Error fetching cities:", error);
      return [];
    }
  };

  const loadOptions = async (inputValue, index) => {
    if (inputValue) {
      const options = await fetchCities(inputValue, index);
      return options;
    }
    return [];
  };

  const handleBaggageOpen = (index) => {
    setBaggageIndex(index);
  };
  const uniqueMealDynamic = () => {
    const mealDynamic = flightData?.ssrResponse?.ssr?.ssrData?.mealDynamic;

    const isLCC = flightData?.fareQuoteResponse?.isLCC;

    const uniqueMeals = mealDynamic
      ?.filter((meal) => {
        // Only filter out price = 0 for LCC flights
        if (isLCC) {
          return meal.price > 0;
        }
        return true; // Include all meals for non-LCC flights
      })
      ?.reduce((unique, meal) => {
        const key = meal.origin + "-" + meal.destination;
        if (!unique[key]) {
          unique[key] = meal;
        }
        return unique;
      }, {});
    return Object.values(uniqueMeals);
  };

  const renderMealData = (origin, destination, index) => {
    const mealDynamic = flightData?.ssrResponse?.ssr?.ssrData?.mealDynamic;
    const isLCC = flightData?.fareQuoteResponse?.isLCC;
    const mealData = mealDynamic.filter((meal) => {
      return (
        meal.origin === origin &&
        meal.destination === destination &&
        (!isLCC || meal.price > 0)
      );
    });
    setMealData(mealData);
    setSegmentIndex(index);
  };

  const handleMealOpen = (index) => {
    setMealIndex(index);
    if (
      flightData?.fareQuoteResponse?.isLCC &&
      flightData?.ssrResponse?.ssr?.ssrData?.mealDynamic
    ) {
      const uniqueMeals = uniqueMealDynamic();
      setMealSegment(uniqueMeals);
      if (uniqueMeals.length > 0) {
        const mealDynamic = flightData?.ssrResponse?.ssr?.ssrData?.mealDynamic;
        const mealData = mealDynamic.filter((meal) => {
          return (
            meal.origin === uniqueMeals[0].origin &&
            meal.destination === uniqueMeals[0].destination &&
            meal.price > 0
          );
        });
        setMealData(mealData);
        setSegmentIndex(0);
      }
    } else {
      setMealSegment(null);
      const mealsArray = flightData?.ssrResponse?.ssr?.meal || [];
      const mealData =
        mealsArray.length > 0 &&
        mealsArray.map((meal, mealIndex) => {
          return {
            ...meal,
            description: meal.airlineDescription || meal.description,
            price: meal.price || 0,
            resultIndex: flightData?.outboundFlightFareQuote?.resultIndex,
          };
        });
      setMealData(mealData);
    }
  };

  const currentDate = new Date().toISOString().split("T")[0];

  const handlePassengerInputChange = async (index, field, value) => {
    let updatedDetails = [...passengerDetails];
    switch (field) {
      case "firstName":
        updatedDetails[index][field] = value.replace(/\s{2,}/g, " ");
        break;
      case "lastName":
        updatedDetails[index][field] = value.replace(/\s{2,}/g, " ");
        break;
      case "baggage":
        const updatedValue = { ...value, resultIndex: flightData.resultIndex };
        updatedDetails[index][field] = [updatedValue];
        setBaggageIndex(null);
        break;
      case "removeBaggage":
        updatedDetails[index].baggage = [];
        break;
      case "meals":
        if (flightData.ssrResponse.isLcc) {
          const updatedMealValue = {
            ...value,
            resultIndex: flightData.resultIndex,
          };

          updatedDetails[index].mealDynamic[segmentIndex] = updatedMealValue;
        } else {
          const updatedMealValue = {
            ...value,
            resultIndex: flightData.resultIndex,
          };

          updatedDetails[index].mealPreference = [updatedMealValue];
        }
        setMealIndex(null);
        break;
      case "removeMeals":
        if (flightData.ssrResponse.isLcc) {
          updatedDetails[index].mealDynamic.splice(segmentIndex, 1);
        } else {
          updatedDetails[index].mealPreference = [];
        }
        break;
      case "seat":
        if (!updatedDetails[index].seatDynamic[ssrDestinationIndex]) {
          updatedDetails[index].seatDynamic[ssrDestinationIndex] = {};
        }
        if (
          !updatedDetails[index].seatDynamic[ssrDestinationIndex][
            seatSegmentIndex[ssrDestinationIndex]
          ]
        ) {
          updatedDetails[index].seatDynamic[ssrDestinationIndex][
            seatSegmentIndex[ssrDestinationIndex]
          ] = {};
        }
        if (Object.keys(value).length > 0) {
          updatedDetails[index].seatDynamic[ssrDestinationIndex][
            seatSegmentIndex[ssrDestinationIndex]
          ] = value;
        } else {
          delete updatedDetails[index].seatDynamic[ssrDestinationIndex][
            seatSegmentIndex[ssrDestinationIndex]
          ];
        }
        break;
      case "removeSeat":
        updatedDetails[index].seatDynamic[ssrDestinationIndex].splice(
          seatSegmentIndex[ssrDestinationIndex],
          1
        );
        break;
      case "pan":
        const isLCC = flightData?.fareQuoteResponse?.isLCC;
        const isPanRequired = isLCC
          ? flightData?.fareQuoteResponse?.isPanRequiredAtTicket
          : flightData?.fareQuoteResponse?.isPanRequiredAtBook;
        if (isPanRequired) {
          const updatedDetailsWithPan = updatedDetails.map((passenger) => ({
            ...passenger,
            [field]: value.toUpperCase(),
          }));
          updatedDetails = updatedDetailsWithPan;
        } else {
          updatedDetails[index][field] = value.toUpperCase();
        }
        break;
      case "gender":
        const genderTitleMapping = {
          adult: {
            1: "Mr",
          },
          child: {
            1: "Mr",
            2: "Miss",
          },
          infant: {
            1: "Mstr",
            2: "Miss",
          },
        };

        const passengerType = updatedDetails[index].passengerType;

        if (
          genderTitleMapping[passengerType] &&
          genderTitleMapping[passengerType][value]
        ) {
          updatedDetails[index].title =
            genderTitleMapping[passengerType][value];
        }
        updatedDetails[index][field] = value;
        break;
      case "addressLine1":
        const updatedDetailsWithAddress = updatedDetails.map((passenger) => ({
          ...passenger,
          [field]: value,
        }));
        updatedDetails = updatedDetailsWithAddress;
        break;
      case "email":
        const updatedDetailsWithEmail = updatedDetails.map((passenger) => ({
          ...passenger,
          [field]: value,
        }));
        updatedDetails = updatedDetailsWithEmail;
        break;
      case "contactNo":
        const updatedDetailsWithContactNo = updatedDetails.map((passenger) => ({
          ...passenger,
          [field]: value,
        }));
        updatedDetails = updatedDetailsWithContactNo;
        break;
      case "city":
        const updatedDetailsWithCity = updatedDetails.map((passenger) => ({
          ...passenger,
          [field]: value,
        }));
        updatedDetails = updatedDetailsWithCity;
        break;
      case "countryCode":
        const updatedDetailsWithCountry = updatedDetails.map((passenger) => ({
          ...passenger,
          [field]: value ? value.value : "",
          nationality: value ? value.value : "",
          cellCountryCode: value ? value.phoneCode : "",
          countryName: { value: value?.value, label: value?.label },
        }));
        updatedDetails = updatedDetailsWithCountry;
        break;
      case "guardianTitle":
        updatedDetails[index].guardianDetails.title = value;
        break;
      case "guardianFirstName":
        updatedDetails[index].guardianDetails.firstName = value;
        break;
      case "guardianLastName":
        updatedDetails[index].guardianDetails.lastName = value;
        break;
      case "guardianPan":
        updatedDetails[index].guardianDetails.pan = value.toUpperCase();
        break;
      case "passportNo":
        updatedDetails[index][field] = value.toUpperCase();
        break;
      case "gstNumber":
        updatedDetails[index][field] = value.toUpperCase();
        setTimeout(async () => {
          const regex = /\d{2}[A-Z]{5}\d{4}[A-Z]{1}[A-Z\d]{1}[Z]{1}[A-Z\d]{1}/;
          if (regex.test(value)) {
            try {
              const gst = await validateGst(value);
              if (gst.status === "SUCCESS") {
                const gstCompanyName = gst.data.companyName;
                const gstCompanyAddress = gst.data.companyAddress;
                updatedDetails[index].gstCompanyName = gstCompanyName;
                updatedDetails[index].gstCompanyAddress = gstCompanyAddress;
              } else {
                updatedDetails[index].gstCompanyName = "";
                updatedDetails[index].gstCompanyAddress = "";
              }
            } catch (error) {
              updatedDetails[index].gstCompanyName = "";
              updatedDetails[index].gstCompanyAddress = "";
              console.log(error);
            }
          }
          setPassengerDetails(updatedDetails);
        }, 100);

        break;
      case "documentType":
        if (!updatedDetails[index].documentList) {
          updatedDetails[index].documentList = [];
        }
        if (!updatedDetails[index].documentList[0]) {
          updatedDetails[index].documentList[0] = {};
        }
        updatedDetails[index].documentList[0].documentTypeId = value;
        break;
      case "documentId":
        if (!updatedDetails[index].documentList) {
          updatedDetails[index].documentList = [];
        }
        if (!updatedDetails[index].documentList[0]) {
          updatedDetails[index].documentList[0] = {};
        }
        updatedDetails[index].documentList[0].documentNumber = value;
        break;
      case "infantCheckbox":
        setShowGuardianDetails(value);
        break;
      default:
        updatedDetails[index][field] = value;
        break;
    }

    const updatedDetailsWithPaxType = updatedDetails.map((passenger) => {
      let paxType;
      switch (passenger.passengerType) {
        case "adult":
          paxType = "1";
          break;
        case "child":
          paxType = "2";
          break;
        case "infant":
          paxType = "3";
          break;
        default:
          paxType = "1";
      }

      return {
        ...passenger,
        paxType,
      };
    });
    setPassengerDetails(updatedDetailsWithPaxType);
  };

  const simpleValidator = useRef(
    new SimpleReactValidator({
      element: (message) => (
        <div className="text-danger" style={{ fontSize: "10px" }}>
          {message}
        </div>
      ),
      messages: {
        required: "This field is required.",
        email: "Invalid email format.",
        validMobile: "Invalid or incomplete Indian mobile number.",
        alpha: "Should contain only alphabets.",
        validGST: "GST Number does not match the format",
        validPAN: "PAN Number does not match the format",
        // passportExpiry: "Passport expiry date should be greater than today's date.",
        // validPassportNumberRepeating: "Passport Number Cannot be repeated"
        // Add custom messages for other validation rules as needed.
      },
      validators: {
        validMobile: {
          // Define the custom validation function for a valid Indian mobile number.
          message: "Invalid or incomplete Indian mobile number.",
          rule: (val, params, validator) => {
            // The regular expression to match a 10-digit Indian mobile number.
            const regex = /^[6789]\d{9}$/;
            return regex.test(val);
          },
        },
        validMobileIntl: {
          // Define the custom validation function for a valid Indian mobile number.
          message: "Invalid or incomplete mobile number.",
          rule: (val, params, validator) => {
            // The regular expression to match a 10-digit Indian mobile number.
            const regex = /^[0-9]{1,20}$/;
            return regex.test(val);
          },
        },
        validIssueDate: {
          message:
            "Passport issue date should not be greater than today's date.",
          rule: (val, params, validator) => {
            const issueDate = new Date(val);
            const today = new Date();
            return issueDate <= today;
          },
        },
        passportIssueComparison: {
          message:
            "Passport issue date should not be greater than today's date.",
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
            const arrivalDate = new Date(params[1]);
            const expiryDate = new Date(val);
            return expiryDate > issueDate;
          },
        },
        passportArrivalDateComparison: {
          message: "Passport expiry date should be greater than arrival date.",
          rule: (val, params, validator) => {
            const arrivalDateString = params[1];
            const arrivalDate = new Date(
              arrivalDateString?.replace(/-/g, "/").slice(0, 10)
            );
            const expiryDate = new Date(val);
            return expiryDate > arrivalDate;
          },
        },
        passportArrivalComparison: {
          message: "Passport expiry date should be greater than arrival date.",
          rule: (val, params, validator) => {
            const arrivalDateString = params[0];
            const arrivalDate = new Date(
              arrivalDateString?.replace(/-/g, "/").slice(0, 10)
            );
            const expiryDate = new Date(val);
            const arrivalDateStringFormatted = arrivalDate
              .toISOString()
              .slice(0, 10);
            return expiryDate > arrivalDate;
          },
        },
        validExpiryDate: {
          message: "Expiry date should be greater than issue date.",
          rule: (val, params, validator) => {
            const todayDate = new Date();
            const expiryDate = new Date(val);
            return todayDate < expiryDate;
          },
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
            const regex =
              /\d{2}[A-Z]{5}\d{4}[A-Z]{1}[A-Z\d]{1}[Z]{1}[A-Z\d]{1}/;
            return regex.test(val);
          },
        },
        validPassportNumber: {
          message: "Passport Number does not match the format",
          rule: (val, params, validator) => {
            const regex = /^[A-Za-z0-9]{3,30}$/;
            return regex.test(val);
          },
        },
        dobValidation: {
          message:
            flightData.flightsRequest.searchReqData.resultFareType === "5"
              ? "Invalid date of birth for the selected passenger type. (Age Should be > 60)"
              : "Invalid date of birth for the selected passenger type.",
          rule: (val, params, validator) => {
            const resultFareType =
              flightData.flightsRequest.searchReqData.resultFareType;

            let currentDate = new Date(
              flightData.flightsRequest.searchReqData.segments[0].preferredDepartureTime
            );
            const selectedDate = new Date(val);
            const passengerType = params[0];
            currentDate.setHours(0, 0, 0, 0);
            selectedDate.setHours(0, 0, 0, 0);
            let minDate, maxDate;
            if (resultFareType === "5") {
              minDate = new Date(
                currentDate.getFullYear() - 60,
                currentDate.getMonth(),
                currentDate.getDate()
              );
              return selectedDate < minDate;
            } else {
              if (passengerType === "adult") {
                minDate = new Date(
                  currentDate.getFullYear() - 12,
                  currentDate.getMonth(),
                  currentDate.getDate()
                );
                minDate.setHours(0, 0, 0, 0);
                return selectedDate < minDate;
              } else if (passengerType === "child") {
                minDate = new Date(
                  currentDate.getFullYear() - 12,
                  currentDate.getMonth(),
                  currentDate.getDate()
                );
                maxDate = new Date(
                  currentDate.getFullYear() - 2,
                  currentDate.getMonth(),
                  currentDate.getDate()
                );
                return selectedDate >= minDate && selectedDate <= maxDate;
              } else if (passengerType === "infant") {
                maxDate = new Date(
                  currentDate.getFullYear() - 2,
                  currentDate.getMonth(),
                  currentDate.getDate()
                );
                maxDate.setHours(0, 0, 0, 0);
                return selectedDate > maxDate;
              }
            }
          },
        },
      },
    })
  );

  const checkPassportRepeating = (passengerList) => {
    const passportNumbers = new Set();

    for (const passenger of passengerList) {
      const passportNo = passenger.passportNo;
      if (passportNumbers.has(passportNo)) {
        // Passport number is repeating
        return true;
      }
      if (passportNo != null) passportNumbers.add(passportNo);
    }

    // No repeating passport numbers
    return false;
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

  const getFormattedDate = (dateString) => {
    const date = new Date(dateString);
    const options = {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric",
    };
    return date.toLocaleDateString("en-US", options);
  };

  const handleMealSelection = (meals, type, totalMealPrice) => {
    const updatedDetails = [...passengerDetails];
    if (meals.length === 0) {
      updatedDetails.forEach((passenger, index) => {
        updatedDetails[index].mealPreference = [];
        updatedDetails[index].mealDynamic = [];
        return;
      });
    }
    if (type === 1) {
      meals.forEach((meal, index) => {
        const mealDynamic = {
          resultIndex: meal.resultIndex,
          airlineCode: meal.airlineCode,
          flightNumber: meal.flightNumber,
          wayType: meal.wayType,
          code: meal.code,
          description: meal.description,
          airlineDescription: meal.airlineDescription,
          quantity: meal.quantity,
          currency: meal.currency,
          price: meal.price,
          origin: meal.origin,
          destination: meal.destination,
        };

        if (meals.length === 1) {
          for (let i = 0; i < meal.quantity; i++) {
            updatedDetails[index].mealDynamic.push(mealDynamic);
          }
        } else if (meals.length > 1) {
          updatedDetails[index].mealDynamic.push(mealDynamic);
        }
      });
    } else if (type === 2) {
      meals.forEach((meal, index) => {
        const mealPreference = {
          resultIndex: meal.resultIndex,
          code: meal.code,
          description: meal.description,
        };

        if (meals.length === 1) {
          for (let i = 0; i < meal.quantity; i++) {
            updatedDetails[index].mealPreference.push(mealPreference);
          }
        } else if (meals.length > 1) {
          updatedDetails[index].mealPreference.push(mealPreference);
        }
      });
    }
    setPassengerDetails(updatedDetails);
  };

  const handleSubmit = () => {
    setIsLoading(true);
    parentLoader(true);
    try {
      let updatedPassengerDetails = [...passengerDetails];
      if (isCorporateBooking) {
        updatedPassengerDetails = updatedPassengerDetails.map((passenger) => ({
          ...passenger,
          gstCompanyAddress: updatedPassengerDetails[0].gstCompanyAddress,
          gstCompanyContactNumber:
            updatedPassengerDetails[0].gstCompanyContactNumber,
          gstCompanyName: updatedPassengerDetails[0].gstCompanyName,
          gstNumber: updatedPassengerDetails[0].gstNumber,
          gstCompanyEmail: updatedPassengerDetails[0].gstCompanyEmail,
        }));
      }
      const passportRepeating = checkPassportRepeating(updatedPassengerDetails);
      const baggagePrice = updatedPassengerDetails.reduce(
        (total, passenger) =>
          total +
          passenger.baggage.reduce(
            (baggageTotal, baggage) => baggageTotal + baggage.price,
            0
          ),
        0
      );
      const mealPrice = updatedPassengerDetails.reduce((total, passenger) => {
        let passengerMealPrice = 0;

        if (flightData?.ssrResponse?.isLcc) {
          passengerMealPrice = passenger.mealDynamic.reduce(
            (mealTotal, meal) => mealTotal + meal.price,
            0
          );
        } else {
          passengerMealPrice = passenger.mealPreference.reduce(
            (mealTotal, meal) => mealTotal + meal.price,
            0
          );
        }
        return total + passengerMealPrice;
      }, 0);

      const seatPrice = updatedPassengerDetails.reduce((total, passenger) => {
        return (
          total +
          passenger.seatDynamic.reduce((seatTotal, seatArray) => {
            return (
              seatTotal +
              Object.values(seatArray).reduce((innerTotal, seat) => {
                // Check if seat.price is defined and is a valid number
                if (seat.price && !isNaN(seat.price)) {
                  return innerTotal + seat.price;
                } else {
                  // If seat.price is not defined or not a valid number, return innerTotal unchanged
                  return innerTotal;
                }
              }, 0)
            );
          }, 0)
        );
      }, 0);

      const updatedFlightData = {
        ...flightData,
        mealPrice,
        baggagePrice,
        seatPrice,
      };
      const formValid = simpleValidator.current.allValid();
      if (passportRepeating) {
        showToast("info","passport number cannot be same");
      }
      if (formValid && !passportRepeating) {
        // const flightData = btoa(JSON.stringify(updatedFlightData));
        const flightData = btoa(
          encodeURIComponent(JSON.stringify(updatedFlightData))
        );
        const passengerDetails = btoa(JSON.stringify(updatedPassengerDetails));
        setTabSpecificData("selectedFlightData", flightData);
        setTabSpecificData("passengerDetails", passengerDetails);
        router.push("/flights/oneway/review");
        simpleValidator.current.hideMessages();
      } else {
        setIsLoading(false);
        parentLoader(false);
        simpleValidator.current.showMessages();
        forceUpdate((prevState) => !prevState); // Toggle state to force a re-render
      }
      logEvent(analytics, "ow_proceed_to_book", {});
    } catch (error) {
      parentLoader(false);
      console.log(error);
    } finally {
      // setIsLoading(false);
    }
  };

  const getFareTypeDescription = (fareType) => {
    switch (fareType) {
      case "3":
        return "student";
      case "4":
        return "armed force";
      case "5":
        return "senior citizen";
      default:
        return "verification";
    }
  };

  const calculateAge = (dob) => {
    // Split the date into year, month, and day
    const dobArray = dob.split("-").map(Number);
    const dobYear = dobArray[0];
    const dobMonth = dobArray[1];
    const dobDay = dobArray[2];

    // Get the current date
    const currentDate = new Date();

    // Calculate the age
    let age = currentDate.getFullYear() - dobYear;
    const currentMonth = currentDate.getMonth() + 1; // Month is zero-indexed
    const currentDay = currentDate.getDate();
    return age;
  };

  const uniqueSeatDynamicStops = () => {
    const seatDynamic = flightData?.ssrResponse?.ssr?.ssrData?.seatDynamic;
    if (!seatDynamic) return [];

    let flattenedSeats = [];

    seatDynamic.forEach((seat) => {
      seat.segmentSeat.forEach((segment) => {
        segment.rowSeats.forEach((row) => {
          flattenedSeats.push(...row.seats);
        });
      });
    });

    // Filter out objects where seatNo is null
    flattenedSeats = flattenedSeats.filter((seat) => seat.seatNo !== null);

    // Deduplicate based on origin and destination
    const uniqueSeats = {};
    flattenedSeats.forEach((seat) => {
      const key = seat.origin + "-" + seat.destination;
      if (!uniqueSeats[key]) {
        uniqueSeats[key] = seat;
      }
    });

    return Object.values(uniqueSeats);
  };

  const flattenedSeatDynamic = () => {
    const seatDynamic = flightData?.ssrResponse?.ssr?.ssrData?.seatDynamic;
    if (!seatDynamic) return [];

    let flattenedSeats = [];

    seatDynamic.forEach((seat) => {
      seat.segmentSeat.forEach((segment) => {
        segment.rowSeats.forEach((row) => {
          // Filter out seats with null seat number
          const filteredSeats = row.seats.filter(
            (seat) => seat.seatNo !== null
          );
          flattenedSeats.push(filteredSeats);
        });
      });
    });

    // Remove rows with empty seat arrays
    flattenedSeats = flattenedSeats.filter((seats) => seats.length > 0);

    const flattenedSeatsWithIndex = flattenedSeats.map((seats, index) => ({
      seats: seats.map((seat) => ({
        ...seat,
        resultIndex: flightData?.fareQuoteResponse?.resultIndex,
      })),
    }));

    return flattenedSeatsWithIndex;

    // return flattenedSeats.map((seats) => ({ seats }));
  };

  const handleSeatsOpen = (index) => {
    setSeatIndex(index);
    setSelectedSection("seatmap");
    const uniqueSeatsStop = uniqueSeatDynamicStops();
    setIsSeatOpen(true);
    setSeatStopsData({ [ssrDestinationIndex]: uniqueSeatsStop });
    // setSeatStopsData(uniqueSeatsStop);
    if (uniqueSeatsStop.length > 0) {
      const seatDynamic = seatsData
        ? seatsData[ssrDestinationIndex]
        : flattenedSeatDynamic();
      setSeatsData({
        [ssrDestinationIndex]: seatDynamic,
      });

      setSeatSegmentIndex({
        [ssrDestinationIndex]: seatSegmentIndex?.[ssrDestinationIndex] || 0,
      });
    }
  };

  const renderSelectedSeatText = (passenger, index) => {
    let result;
    if (
      passenger.seatDynamic?.[ssrDestinationIndex]?.[
        seatSegmentIndex?.[ssrDestinationIndex] || 0
      ] &&
      passenger.seatDynamic?.[ssrDestinationIndex]?.[
        seatSegmentIndex?.[ssrDestinationIndex] || 0
      ]?.code
    ) {
      result = `${
        passenger.seatDynamic?.[ssrDestinationIndex][
          seatSegmentIndex?.[ssrDestinationIndex] || 0
        ]?.code
      }, ${
        passenger.seatDynamic?.[ssrDestinationIndex][
          seatSegmentIndex?.[ssrDestinationIndex] || 0
        ]?.price || 0
      }`;
    } else {
      result = "Select Seat";
    }
    return result;
  };

  if (
    !flightData?.fareQuoteResponse?.segments ||
    flightData?.fareQuoteResponse?.segments.length === 0 ||
    !flightData?.fareQuoteResponse?.segments[0].segment ||
    flightData?.fareQuoteResponse?.segments[0].segment.length === 0
  ) {
    // Handle the case where data is not available
    return;
  }

  const segment = flightData?.fareQuoteResponse?.segments[0]?.segment;

  // If there is only one result inside the segment, consider it as both origin and destination
  const origin =
    segment?.length === 1 ? segment[0]?.origin : segment[0]?.origin;
  const destination =
    segment?.length === 1
      ? segment[0]?.destination
      : segment[segment.length - 1].destination;

  const renderPassportFields = (passenger, index) => {
    return (
      <>
        {flightData?.fareQuoteResponse?.isLCC ? (
          <>
            {flightData?.fareQuoteResponse
              ?.isPassportFullDetailRequiredAtBook ? (
              <>
                <div className={style.formInputRow}>
                  <div className={style.desktopPassport}>
                    <span className={style.inputHeads}>
                      Passport number<span className={style.redstar}>*</span>
                    </span>
                    <input
                      type="text"
                      placeholder="Enter passport number"
                      className={style.singleInputO}
                      value={passenger.passportNo}
                      onChange={(e) =>
                        handlePassengerInputChange(
                          index,
                          "passportNo",
                          e.target.value
                        )
                      }
                      maxLength={15}
                    />
                    {flightData?.fareQuoteResponse?.isLCC &&
                      flightData?.fareQuoteResponse
                        ?.isPassportFullDetailRequiredAtBook &&
                      simpleValidator.current.message(
                        "passportNo",
                        passenger.passportNo,
                        "required|validPassportNumber"
                      )}
                  </div>
                  <div className={style.desktopPassport}>
                    <span className={style.inputHeads}>
                      Passport issue date
                      <span className={style.redstar}>*</span>
                    </span>
                    <input
                      type="date"
                      placeholder="Passport issue date"
                      className={style.singleInputO}
                      value={passenger.passportIssueDate}
                      onChange={(e) =>
                        handlePassengerInputChange(
                          index,
                          "passportIssueDate",
                          e.target.value
                        )
                      }
                    />
                    {flightData?.fareQuoteResponse?.isLCC &&
                      flightData?.fareQuoteResponse
                        ?.isPassportFullDetailRequiredAtBook &&
                      simpleValidator.current.message(
                        "passportIssueDate",
                        passenger.passportIssueDate,
                        `required|validIssueDate`
                      )}
                  </div>
                  <div className={style.desktopPassport}>
                    <span className={style.inputHeads}>
                      Passport expiry date
                      <span className={style.redstar}>*</span>
                    </span>
                    <input
                      type="date"
                      placeholder="Passport expiry date"
                      className={style.singleInputO}
                      value={passenger.passportExpiry}
                      min={currentDate}
                      onChange={(e) =>
                        handlePassengerInputChange(
                          index,
                          "passportExpiry",
                          e.target.value
                        )
                      }
                      max="9999-12-31"
                    />
                  </div>
                </div>

                <div className={style.formInputRow}>
                  <div className={style.leftPartInput}>
                    <span className={style.inputHeads}>
                      Passport Issuing Country
                      <span className={style.redstar}>*</span>
                    </span>
                    <div>
                      <Select
                        isClearable
                        value={passenger.passportIssueCountryCode}
                        onChange={(selectedOption) =>
                          handlePassengerInputChange(
                            index,
                            "passportIssueCountryCode",
                            selectedOption
                          )
                        }
                        options={countryOptions}
                        placeholder="Choose Your Country"
                      />
                      {flightData?.fareQuoteResponse?.isLCC &&
                        flightData?.fareQuoteResponse
                          ?.isPassportFullDetailRequiredAtBook &&
                        simpleValidator.current.message(
                          "passportIssueCountryCode",
                          passenger.passportIssueCountryCode,
                          "required"
                        )}
                    </div>
                  </div>
                </div>
              </>
            ) : flightData?.fareQuoteResponse?.isPassportRequiredAtTicket ? (
              <>
                <div className={style.formInputRow}>
                  <div className={style.desktopPassport}>
                    <span className={style.inputHeads}>
                      Passport number<span className={style.redstar}>*</span>
                    </span>
                    <input
                      type="text"
                      placeholder="Enter passport number"
                      className={style.singleInputO}
                      value={passenger.passportNo}
                      onChange={(e) =>
                        handlePassengerInputChange(
                          index,
                          "passportNo",
                          e.target.value
                        )
                      }
                      maxLength={15}
                    />
                    {flightData?.fareQuoteResponse?.isLCC &&
                      flightData?.fareQuoteResponse
                        ?.isPassportRequiredAtTicket &&
                      simpleValidator.current.message(
                        "passportNo",
                        passenger.passportNo,
                        "required|validPassportNumber"
                      )}
                  </div>
                  <div className={style.desktopPassport}>
                    <span className={style.inputHeads}>
                      Passport expiry date
                      <span className={style.redstar}>*</span>
                    </span>
                    <input
                      type="date"
                      placeholder="Passport expiry date"
                      className={style.singleInputO}
                      value={passenger.passportExpiry}
                      min={currentDate}
                      onChange={(e) =>
                        handlePassengerInputChange(
                          index,
                          "passportExpiry",
                          e.target.value
                        )
                      }
                      max="9999-12-31"
                    />
                    {flightData?.fareQuoteResponse?.isLCC &&
                      flightData?.fareQuoteResponse
                        ?.isPassportRequiredAtTicket &&
                      simpleValidator.current.message(
                        "passportExpiry",
                        passenger.passportExpiry,
                        `required|passportArrivalComparison:${destination?.arrTime}`
                      )}
                  </div>
                </div>
              </>
            ) : null}
          </>
        ) : (
          <>
            {flightData?.fareQuoteResponse
              ?.isPassportFullDetailRequiredAtBook ? (
              <>
                <div className={style.formInputRow}>
                  <div className={style.desktopPassport}>
                    <span className={style.inputHeads}>
                      Passport number
                      <span className={style.redstar}>*</span>
                    </span>
                    <input
                      type="text"
                      placeholder="Enter passport number"
                      className={style.singleInputO}
                      value={passenger.passportNo}
                      onChange={(e) =>
                        handlePassengerInputChange(
                          index,
                          "passportNo",
                          e.target.value
                        )
                      }
                      maxLength={15}
                    />
                    {!flightData?.fareQuoteResponse?.isLCC &&
                      flightData?.fareQuoteResponse
                        ?.isPassportFullDetailRequiredAtBook &&
                      simpleValidator.current.message(
                        "passportNo",
                        passenger.passportNo,
                        "required|validPassportNumber"
                      )}
                  </div>
                  <div className={style.desktopPassport}>
                    <span className={style.inputHeads}>
                      Passport issue date
                      <span className={style.redstar}>*</span>
                    </span>
                    <input
                      type="date"
                      placeholder="Passport issue date"
                      className={style.singleInputO}
                      value={passenger.passportIssueDate}
                      onChange={(e) =>
                        handlePassengerInputChange(
                          index,
                          "passportIssueDate",
                          e.target.value
                        )
                      }
                    />
                    {!flightData?.fareQuoteResponse?.isLCC &&
                      flightData?.fareQuoteResponse
                        ?.isPassportFullDetailRequiredAtBook &&
                      simpleValidator.current.message(
                        "passportIssueDate",
                        passenger.passportIssueDate,
                        `required`
                      )}
                  </div>
                  <div className={style.desktopPassport}>
                    <span className={style.inputHeads}>
                      Passport expiry date
                      <span className={style.redstar}>*</span>
                    </span>
                    <input
                      type="date"
                      placeholder="Passport expiry date"
                      className={style.singleInputO}
                      value={passenger.passportExpiry}
                      min={currentDate}
                      onChange={(e) =>
                        handlePassengerInputChange(
                          index,
                          "passportExpiry",
                          e.target.value
                        )
                      }
                      max="9999-12-31"
                    />
                  </div>
                </div>

                <div className={style.formInputRow}>
                  <div className={style.leftPartInput}>
                    <span className={style.inputHeads}>
                      Passport Issuing Country
                      <span className={style.redstar}>*</span>
                    </span>
                    <div>
                      <Select
                        isClearable
                        value={passenger.passportIssueCountryCode}
                        onChange={(selectedOption) =>
                          handlePassengerInputChange(
                            index,
                            "passportIssueCountryCode",
                            selectedOption
                          )
                        }
                        options={countryOptions}
                        placeholder="Choose Your Country"
                      />
                      {!flightData?.fareQuoteResponse?.isLCC &&
                        flightData?.fareQuoteResponse
                          ?.isPassportFullDetailRequiredAtBook &&
                        simpleValidator.current.message(
                          "passportIssueCountryCode",
                          passenger.passportIssueCountryCode,
                          "required"
                        )}
                    </div>
                  </div>
                </div>
              </>
            ) : flightData?.fareQuoteResponse?.isPassportRequiredAtBook ||
              flightData?.fareQuoteResponse?.isPassportRequiredAtTicket ? (
              <>
                <div className={style.formInputRow}>
                  <div className={style.rightPartInput}>
                    <span className={style.inputHeads}>
                      Passport number <span style={{ color: "red" }}>*</span>
                    </span>
                    <input
                      type="text"
                      placeholder="Enter passport number"
                      className={style.singleInput}
                      value={passenger.passportNo}
                      onChange={(e) =>
                        handlePassengerInputChange(
                          index,
                          "passportNo",
                          e.target.value
                        )
                      }
                      maxLength={15}
                    />
                    {!flightData?.fareQuoteResponse?.isLCC &&
                      (flightData?.fareQuoteResponse
                        ?.isPassportRequiredAtBook ||
                        flightData?.fareQuoteResponse
                          ?.isPassportRequiredAtTicket) &&
                      simpleValidator.current.message(
                        "passportNo",
                        passenger.passportNo,
                        "required|validPassportNumber"
                      )}
                  </div>
                  <div className={style.rightPartInput}>
                    <span className={style.inputHeads}>
                      Passport expiry date{" "}
                      <span style={{ color: "red" }}>*</span>
                    </span>
                    <input
                      type="date"
                      placeholder="Passport expiry date"
                      className={style.singleInput}
                      value={passenger.passportExpiry}
                      min={currentDate}
                      onChange={(e) =>
                        handlePassengerInputChange(
                          index,
                          "passportExpiry",
                          e.target.value
                        )
                      }
                      max="9999-12-31"
                    />
                  </div>
                </div>
              </>
            ) : null}
          </>
        )}
      </>
    );
  };

  const renderPanFields = (passenger, index) => {
    const isLCC = flightData?.fareQuoteResponse?.isLCC;
    const isPanRequiredAtBook =
      flightData?.fareQuoteResponse?.isPanRequiredAtBook;
    const isPanRequiredAtTicket =
      flightData?.fareQuoteResponse?.isPanRequiredAtTicket;
    const isPanRequired = isLCC
      ? flightData?.fareQuoteResponse?.isPanRequiredAtTicket
      : flightData?.fareQuoteResponse?.isPanRequiredAtBook;

    return (
      <>
        {index === 0 &&
          isPanRequired &&
          passenger.passengerType !== "child" && (
            <div className={style.formInputRow}>
              <div className={style.leftPartInput}>
                <span className={style.inputHeads}>
                  Pan Card Number <span style={{ color: "red" }}>*</span>
                </span>
                <div>
                  <input
                    type="text"
                    placeholder="Enter your pan card number"
                    className={style.singleInput}
                    value={passenger.pan}
                    onChange={(e) =>
                      handlePassengerInputChange(index, "pan", e.target.value)
                    }
                    maxLength={10}
                  />
                  {index === 0 &&
                    isPanRequired &&
                    simpleValidator.current.message(
                      "pan",
                      passenger.pan,
                      "required|validPAN"
                    )}
                </div>
              </div>
            </div>
          )}
      </>
    );
  };

  const renderGuardianDetails = (passenger, index) => {
    const isLCC = flightData?.fareQuoteResponse?.isLCC;
    const isPanRequired = isLCC
      ? flightData?.fareQuoteResponse?.isPanRequiredAtTicket
      : flightData?.fareQuoteResponse?.isPanRequiredAtBook;
    const isAdult = passengerDetails.some(
      (data) => data.passengerType === "adult"
    );

    return (
      <>
        {isPanRequired && !isAdult && passenger.passengerType === "child" ? (
          <>
            <div className={style.contactDetailsHead}>
              <div
                style={{
                  color: "rgba(135, 135, 134, 1)",
                  marginBottom: "0%",
                }}
              >
                Guardian Details
              </div>
            </div>

            <div className={style.formInputRow}>
              <div className={style.leftPartInput}>
                <div style={{ display: "flex", gap: "14%" }}>
                  <span className={style.inputHeads}>
                    Title<span className={style.redstar}>*</span>
                  </span>
                  <span className={style.inputHeads}>
                    First Name<span className={style.redstar}>*</span>
                  </span>
                </div>
                <div style={{ display: "flex" }}>
                  <Select
                    isClearable
                    options={guardianTitleOptions}
                    value={passenger.guardianDetails?.title}
                    onChange={(selectedOption) =>
                      handlePassengerInputChange(
                        index,
                        "guardianTitle",
                        selectedOption
                      )
                    }
                    placeholder="Title"
                    className={style.place}
                    styles={customStyles}
                  />
                  {isPanRequired &&
                    passenger.passengerType === "child" &&
                    simpleValidator.current.message(
                      "guardianTitle",
                      passenger?.guardianDetails?.title,
                      "required"
                    )}
                  <input
                    type="text"
                    placeholder="Enter Your First Name"
                    value={passenger.guardianDetails?.firstName}
                    onChange={(e) =>
                      handlePassengerInputChange(
                        index,
                        "guardianFirstName",
                        e.target.value.replace(/[^A-Za-z ]/g, "")
                      )
                    }
                    className={style.bigInput}
                    maxLength={33}
                  />
                  {isPanRequired &&
                    passenger.passengerType === "child" &&
                    simpleValidator.current.message(
                      "guardianFirstName",
                      passenger.guardianDetails?.firstName,
                      "required|alpha_space|min:2|max:33"
                    )}
                </div>
              </div>
              <div className={style.rightPartInput}>
                <span className={style.inputHeads}>
                  Last Name<span className={style.redstar}>*</span>
                </span>
                <div>
                  <input
                    type="text"
                    placeholder="Enter Your Last Name"
                    className={style.singleInput}
                    value={passenger?.guardianDetails?.lastName}
                    onChange={(e) =>
                      handlePassengerInputChange(
                        index,
                        "guardianLastName",
                        e.target.value.replace(/[^A-Za-z ]/g, "")
                      )
                    }
                    maxLength={100}
                  />
                  {isPanRequired &&
                    passenger.passengerType === "child" &&
                    simpleValidator.current.message(
                      "guardianLastName",
                      passenger?.guardianDetails?.lastName,
                      "required|alpha_space|min:2|max:100"
                    )}
                </div>
              </div>
            </div>

            <div className={style.formInputRow}>
              <div className={style.leftPartInput}>
                <span className={style.inputHeads}>
                  Pan Card Number<span className={style.redstar}>*</span>
                </span>
                <div>
                  <input
                    type="text"
                    placeholder="Enter your pan card number"
                    className={style.singleInput}
                    value={passenger?.guardianDetails?.pan}
                    onChange={(e) =>
                      handlePassengerInputChange(
                        index,
                        "guardianPan",
                        e.target.value
                      )
                    }
                    maxLength={10}
                  />
                  {isPanRequired &&
                    passenger.passengerType === "child" &&
                    simpleValidator.current.message(
                      "guardianPan",
                      passenger?.guardianDetails?.pan,
                      "required|validPAN"
                    )}
                </div>
              </div>
            </div>
          </>
        ) : null}
      </>
    );
  };

  const handleCorporateBooking = async (e) => {
    const isChecked = e.target.checked;

    if (!isChecked) {
      // Define GST-related fields
      const gstFields = [
        "gstNumber",
        "gstCompanyName",
        "gstCompanyAddress",
        "gstCompanyEmail",
        "gstCompanyContactNumber",
      ];

      // Clear GST validation state completely
      gstFields.forEach((field) => {
        // Remove the field from validator's internal state
        delete simpleValidator.current.fields[field];
        // Remove from visible fields array
        const index = simpleValidator.current.visibleFields.indexOf(field);
        if (index > -1) {
          simpleValidator.current.visibleFields.splice(index, 1);
        }
        // Clear any existing error messages
        if (simpleValidator.current.errorMessages) {
          delete simpleValidator.current.errorMessages[field];
        }
        if (simpleValidator.current.messageObjects) {
          delete simpleValidator.current.messageObjects[field];
        }
      });

      // Reset the form valid state by removing GST fields from validation
      simpleValidator.current.formValid = Object.keys(
        simpleValidator.current.fields
      )
        .filter((field) => !gstFields.includes(field))
        .every((field) => !simpleValidator.current.fields[field]?.message);

      forceUpdate((prevState) => !prevState);
    }

    setIsCorporateBooking(!isCorporateBooking);
  };

  const renderGSTDetails = () => {
    const isGSTRequired = flightData?.fareQuoteResponse?.isGSTMandatory;
    let index = 0;

    const validateField = (fieldName, value, validationRule) => {
      // Only apply validation if corporate booking is enabled
      return simpleValidator.current.message(
        fieldName,
        value,
        isCorporateBooking ? validationRule : ""
      );
    };

    return (
      <>
        {!corporateUser && (
          <div className={style["corporate-checkbox"]}>
            <label htmlFor="below12">
              <input
                type="checkbox"
                id="below12"
                value={isCorporateBooking}
                className={style["check-box"]}
                onChange={handleCorporateBooking}
                // disabled={isGSTRequired}
              />
              Add GST Details
            </label>
          </div>
        )}
        {isCorporateBooking && (
          <>
            <div className={style.gstBoxCheck}>Enter GST Details</div>
            <div className={style.gstInputs}>
              <div className={style.formInputRow}>
                <div className={style.leftPartInput}>
                  <div className={style.inputHeads}>
                    GST Number<span className={style.redstar}>*</span>
                  </div>
                  <div>
                    <input
                      type="text"
                      placeholder="Enter GST Number"
                      className={style.singleInput}
                      value={passengerDetails[0].gstNumber}
                      onChange={(e) =>
                        handlePassengerInputChange(
                          index,
                          "gstNumber",
                          e.target.value
                        )
                      }
                      maxLength={15}
                    />
                    {index === 0 &&
                      validateField(
                        "gstNumber",
                        passengerDetails[0].gstNumber,
                        `required|validGST`
                      )}
                  </div>
                </div>
                <div className={style.rightPartInput}>
                  <div className={style.inputHeads}>
                    Company Name
                    <span className={style.redstar}>*</span>
                  </div>
                  <div>
                    <input
                      type="text"
                      placeholder="Enter Company Name"
                      className={style.singleInput}
                      value={passengerDetails[0].gstCompanyName}
                      onChange={(e) =>
                        handlePassengerInputChange(
                          index,
                          "gstCompanyName",
                          e.target.value
                        )
                      }
                    />
                    {index === 0 &&
                      validateField(
                        "gstCompanyName",
                        passengerDetails[0].gstCompanyName,
                        "required"
                      )}
                  </div>
                </div>
              </div>

              <div className={style.formInputRow}>
                <div className={style.leftPartInput}>
                  <div className={style.inputHeads}>
                    Company Mobile Number{" "}
                    <span className={style.redstar}>*</span>
                  </div>
                  <div>
                    <input
                      type="text"
                      placeholder="Company mobile"
                      className={style.bigInput}
                      value={passengerDetails[0].gstCompanyContactNumber}
                      onChange={(e) =>
                        handlePassengerInputChange(
                          index,
                          "gstCompanyContactNumber",
                          e.target.value.replace(/[^0-9]/g, "")
                        )
                      }
                      maxLength={15}
                    />
                    {index === 0 &&
                      validateField(
                        "gstCompanyContactNumber",
                        passengerDetails[0].gstCompanyContactNumber,
                        `required|${
                          passengerDetails[0].nationality === "IN"
                            ? "validMobile"
                            : "validMobileIntl|min:7|max:15"
                        }`
                      )}
                  </div>
                </div>
                <div className={style.rightPartInput}>
                  <div className={style.inputHeads}>
                    Company Email
                    <span className={style.redstar}>*</span>
                  </div>
                  <div>
                    <input
                      type="email"
                      placeholder="Company email address"
                      className={style.singleInput}
                      value={passengerDetails[0].gstCompanyEmail}
                      onChange={(e) =>
                        handlePassengerInputChange(
                          index,
                          "gstCompanyEmail",
                          e.target.value
                        )
                      }
                    />
                    {index === 0 &&
                      validateField(
                        "gstCompanyEmail",
                        passengerDetails[0].gstCompanyEmail,
                        "required|email"
                      )}
                  </div>
                </div>
              </div>

              <div className={style.formInputFull}>
                <div className={style.inputHeads}>
                  Company Address
                  <span className={style.redstar}>*</span>
                </div>
                <div>
                  <input
                    type="email"
                    placeholder="Enter Company Address"
                    className={style.singleInput}
                    value={passengerDetails[0].gstCompanyAddress}
                    onChange={(e) =>
                      handlePassengerInputChange(
                        index,
                        "gstCompanyAddress",
                        e.target.value
                      )
                    }
                  />
                  {index === 0 &&
                    isCorporateBooking &&
                    simpleValidator.current.message(
                      "gstCompanyAddress",
                      passengerDetails[0].gstCompanyAddress,
                      "required"
                    )}
                </div>
              </div>
            </div>
          </>
        )}
      </>
    );
  };

  const renderDocumentType = (passenger, index) => {
    const resultFareType =
      flightData.flightsRequest.searchReqData.resultFareType;
    if (
      resultFareType === "3" || // StudentFare
      resultFareType === "4" || // ArmedForce
      (resultFareType === "5" && // SeniorCitizen and age >= 60
        calculateAge(passenger.dateOfBirth) > 60)
    ) {
      return (
        <div className={style.verficationmaincontainer}>
          <div className={style.verficationdetails}>
            <span className={style.verificationcode}>Verification</span>
            <span className={style.studentverification}>
              This is for your {getFareTypeDescription(resultFareType)}{" "}
              verification.
            </span>
          </div>
          <div className={style.formInputRow}>
            <div className={style.leftPartInput}>
              <span className={style.inputHeads}>
                Document type <span style={{ color: "red" }}>*</span>
              </span>
              <div>
                <input
                  type="text"
                  placeholder={
                    resultFareType === "3"
                      ? "Eg. Student ID Card"
                      : resultFareType === "4"
                      ? "Eg. Employee ID Card"
                      : resultFareType === "5"
                      ? "Eg. Aadhar Card"
                      : ""
                  }
                  className={style.singleInput}
                  style={{ height: "33px" }}
                  value={passenger?.documentList?.[0]?.documentTypeId}
                  onChange={(e) =>
                    handlePassengerInputChange(
                      index,
                      "documentType",
                      e.target.value
                    )
                  }
                />
              </div>
            </div>
            <div className={style.rightPartInput}>
              <span className={style.inputHeads}>
                Document ID <span style={{ color: "red" }}>*</span>
              </span>
              <div>
                <input
                  type="text"
                  placeholder="Eg: BHF7676"
                  className={style.singleInput}
                  style={{ height: "33px" }}
                  value={passenger?.documentList?.[0]?.documentNumber}
                  onChange={(e) =>
                    handlePassengerInputChange(
                      index,
                      "documentId",
                      e.target.value
                    )
                  }
                />
              </div>
            </div>
          </div>
        </div>
      );
    } else {
      return null; // Don't render anything if not eligible
    }
  };

  const duration = segment?.reduce(
    (totalDuration, segment) => totalDuration + segment.duration,
    0
  );

  const journeyDuration =
    flightData?.fareQuoteResponse?.segments[0]?.journeyDuration;

  const customStyles = {
    control: (provided) => ({
      ...provided,
      minHeight: "30px",
      padding: "0 5px",
    }),
    valueContainer: (provided) => ({
      ...provided,
      padding: "0 0px",
    }),
    input: (provided) => ({
      ...provided,
      margin: "0px",
      padding: "0px",
    }),
    placeholder: (provided) => ({
      ...provided,
      margin: "0px",
    }),
    singleValue: (provided) => ({
      ...provided,
      margin: "0px",
    }),
    dropdownIndicator: (provided) => ({
      ...provided,
      padding: "0px",
    }),
    clearIndicator: (provided) => ({
      ...provided,
      padding: "0px",
    }),
    menu: (provided) => ({
      ...provided,
      zIndex: 9999,
    }),
  };

  const mealsArray =
    flightData?.ssrResponse?.ssr?.ssrData?.mealDynamic ||
    flightData?.ssrResponse?.ssr?.meal ||
    [];

  return (
    <>
      <div className={style.backdrop} onClick={onClose}></div>
      <div className={`${style.sideSheet} ${isOpen ? style.open : ""}`}>
        <div className={style.fixedHead}>
          {selectedSection === "details" && (
            <div className={style.fixedHead1}>
              <button onClick={onClose} className={style.closeButton}>
                <FontAwesomeIcon icon={faArrowLeft} />
              </button>
              <div
                className={`${style.headOptions} ${
                  selectedSection === "details" ? style.boldFont : ""
                }`}
                onClick={() => handleChangeSection("details")}
              >
                Add Details
              </div>
            </div>
          )}
          <div
            className={`${style.headOptions} ${
              selectedSection === "seats" ? style.boldFont : ""
            }`}
          >
            {/* Add Seats */}
          </div>
        </div>

        {/* {isMealsVisible} */}
        {selectedSection === "meals" && (
          <AddMealsSelection
            ssrResponse={flightData.ssrResponse}
            resultIndex={flightData.fareQuoteResponse.resultIndex}
            flightsRequest={flightData.flightsRequest}
            adultPrice={
              flightData.fareQuoteResponse?.fare?.offeredFareRoundedOff
            }
            originCode={origin?.airport?.cityCode}
            destinationCode={destination?.airport?.cityCode}
            handleMealSelection={handleMealSelection}
            selectedMeals={selectedMeals}
            setSelectedMeals={setSelectedMeals}
            mealQuantities={mealQuantities}
            setMealQuantities={setMealQuantities}
            mealPrice={mealPrice}
            setMealPrice={setMealPrice}
            totalSelectedQuantity={totalSelectedQuantity}
            setTotalSelectedQuantity={setTotalSelectedQuantity}
            setSelectedSection={setSelectedSection}
          />
        )}
        {selectedSection === "details" && (
          <div className={style.scrollContent}>
            <div style={{ background: "rgba(229, 233, 235, 0.46)" }}>
              <div
                className={style.reviewDetailsContainer}
                onClick={toggleDetails}
              >
                Review Details
                <FontAwesomeIcon
                  className={style.front1}
                  icon={isDetailsVisible ? faAngleDown : faAngleUp}
                />
                {/* Add Meals Section */}
              </div>
              {isDetailsVisible && (
                <div className={style.fromToTiming}>
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "row",
                      justifyContent: "space-between",
                      textWrap: "nowrap",
                    }}
                  >
                    <div
                      className={style.imageofflight}
                      style={{
                        display: "flex",
                        flexDirection: "row",
                        marginRight: "3%",
                        textWrap: "nowrap",
                      }}
                    >
                      <span>
                        <Image
                          src={segment[0]?.airline.airlineLogoUrl}
                          alt="logo"
                          width={30}
                          height={30}
                        />
                      </span>
                      <div style={{ display: "flex", flexDirection: "column" }}>
                        <span
                          style={{
                            marginLeft: "5px",
                            lineHeight: "1",
                          }}
                        >
                          {segment[0]?.airline?.airlineName}
                        </span>
                        <span
                          style={{
                            color: "#878786",
                            lineHeight: "1.5",
                            fontSize: "10px",
                            marginLeft: "5px",
                          }}
                        >
                          {segment[0]?.airline?.airlineCode}-
                          {segment[0]?.airline?.flightNumber}
                        </span>
                      </div>
                    </div>

                    <div className={style.Economy}>
                      {
                        flightData?.fareQuoteResponse?.segments[0]?.segment[0]
                          .cabinClassName
                      }
                    </div>
                    <div className={style.rightpartTicket1}>
                      <span className={style.FareDetails1}>
                        {" "}
                        {flightData?.fareQuoteResponse?.resultFareType}
                      </span>
                    </div>
                  </div>

                  <div className={style.fromToTiming1}>
                    <div style={{ display: "flex", flexDirection: "column" }}>
                      <span className={style.fromToTime}>
                        {formatTime(origin?.depTime)}
                      </span>
                      <span className={style.fromToCityName}>
                        {origin?.airport?.cityName}
                      </span>
                      <div className={style.fromToDate}>
                        {getFormattedDate(origin?.depTime)}
                      </div>
                    </div>
                    <div className={style.btwLineContent}>
                      <div className={style.dashLineText}>
                        {formatDuration(journeyDuration)}
                      </div>
                      <div className={style.dashLine}></div>
                      <div className={style.dashLineText}>
                        {flightData?.fareQuoteResponse?.segments[0]?.stops}{" "}
                        Stops
                      </div>
                    </div>
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        textAlign: "end",
                        textWrap: "nowrap",
                      }}
                    >
                      <span className={style.fromToTime}>
                        {formatTime(destination?.arrTime)}
                      </span>
                      <span className={style.fromToCityName}>
                        {destination?.airport?.cityName}
                      </span>
                      <div className={style.fromToDate}>
                        {getFormattedDate(destination?.arrTime)}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className={style.headSearch}>
              Traveler Details
              {!corporateUser ? (
                <span className={style.headSmallSearch}>
                  {numberOfAdults} Adults | {numberOfChildrens} Children |{" "}
                  {numberOfInfants} Infants{" "}
                </span>
              ) : (
                <span className={style.headSmallSearch}>
                  {numberOfAdults} Traveler
                </span>
              )}
            </div>

            <div className={style.guestDetailsHead}>
              <span style={{ marginRight: "8%", color: "#028fa3" }}>
                Guest Details
              </span>
              <hr className={style.horizontalRule} />
            </div>
            {passengerDetails.map((passenger, index) => (
              <React.Fragment key={index}>
                <div className={style.passengerList}>
                  <div className={style.passengerBtn}>
                    {passengerTypes[index].label}
                  </div>
                </div>

                {index === 0 && (
                  <div className={style.contactDetailsHead}>
                    <div
                      style={{
                        color: "rgba(135, 135, 134, 1)",
                        marginBottom: "0%",
                      }}
                    >
                      Contact Details
                    </div>
                    <span className={style.sendDetails}>
                      We will only use your phone number or email address to
                      provide you a confirmation of your flight.
                    </span>
                  </div>
                )}

                <div className={style.formInputs}>
                  <div className={style.formInputRow}>
                    {index === 0 && (
                      <div className={style.leftPartInput}>
                        <span className={style.inputHeads}>
                          Mobile Number <span className={style.redstar}>*</span>
                        </span>
                        <div>
                          <input
                            placeholder={
                              passenger.cellCountryCode
                                ? passenger.cellCountryCode
                                : "+91"
                            }
                            className={style.shortInput}
                            value={
                              passenger.cellCountryCode
                                ? passenger.cellCountryCode
                                : "+91"
                            }
                            readOnly
                          />
                          <input
                            placeholder="Enter your mobile no"
                            className={style.bigInput}
                            value={passenger.contactNo}
                            onChange={(e) =>
                              handlePassengerInputChange(
                                index,
                                "contactNo",
                                e.target.value.replace(/[^0-9]/g, "")
                              )
                            }
                            maxLength={15}
                            type="tel"
                          />
                          {index === 0 &&
                            simpleValidator.current.message(
                              "contactNo",
                              passenger.contactNo,
                              `required|${
                                passenger.nationality === "IN"
                                  ? "validMobile"
                                  : "validMobileIntl|min:7|max:15"
                              }`
                            )}
                        </div>
                      </div>
                    )}
                    {index === 0 && (
                      <div className={style.rightPartInput}>
                        <span className={style.inputHeads}>
                          Email <span className={style.redstar}>*</span>
                        </span>
                        <div>
                          <input
                            type="email"
                            placeholder="Enter your email address"
                            className={style.singleInput}
                            value={passenger.email}
                            onChange={(e) =>
                              handlePassengerInputChange(
                                index,
                                "email",
                                e.target.value
                              )
                            }
                          />
                          {index === 0 &&
                            simpleValidator.current.message(
                              "email",
                              passenger.email,
                              "required|email"
                            )}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className={style.formInputRow}>
                    <div className={style.leftPartInput}>
                      <div
                        style={{
                          display: "flex",
                          gap: "5px",
                          height: "-webkit-fill-available",
                        }}
                      >
                        <div
                          style={{ display: "flex", flexDirection: "column" }}
                        >
                          {passenger.gender === "2" &&
                            passenger.passengerType === "adult" && (
                              <span className={style.inputHeads}>Title</span>
                            )}
                          <div>
                            {passenger.gender === "2" &&
                              passenger.passengerType === "adult" && (
                                <Select
                                  value={passenger.title}
                                  onChange={(selectedOption) =>
                                    handlePassengerInputChange(
                                      index,
                                      "title",
                                      selectedOption
                                    )
                                  }
                                  options={titleOptions}
                                  placeholder="Title"
                                  className={style.place}
                                  styles={customStyles}
                                />
                              )}
                            {passenger.gender === "2" &&
                              passenger.passengerType === "adult" &&
                              simpleValidator.current.message(
                                "title",
                                passenger.title,
                                "required"
                              )}
                          </div>
                        </div>
                        <div
                          style={{
                            display: "flex",
                            flexDirection: "column",
                            justifyContent: "space-between",
                          }}
                          className={style.firstAlign}
                        >
                          <span className={style.inputHeads1}>
                            First Name <span className={style.redstar}>*</span>
                          </span>
                          <div>
                            <input
                              type="text"
                              placeholder="Enter your first name"
                              className={`${style.firstInput} ${style.singleInput}`}
                              value={passenger.firstName}
                              onChange={(e) =>
                                handlePassengerInputChange(
                                  index,
                                  "firstName",
                                  e.target.value.replace(/[^A-Za-z ]/g, "")
                                )
                              }
                              maxLength={33}
                            />
                            {simpleValidator.current.message(
                              "firstName",
                              passenger.firstName,
                              "required|alpha_space|min:2|max:33"
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className={style.rightPartInput}>
                      <span className={style.inputHeads}>
                        Last Name <span className={style.redstar}>*</span>
                      </span>
                      <div>
                        <input
                          type="text"
                          placeholder="Enter your last name"
                          className={style.singleInput}
                          value={passenger.lastName}
                          onChange={(e) =>
                            handlePassengerInputChange(
                              index,
                              "lastName",
                              e.target.value.replace(/[^A-Za-z ]/g, "")
                            )
                          }
                          maxLength={100}
                        />
                        {simpleValidator.current.message(
                          "lastName",
                          passenger.lastName,
                          "required|alpha_space|min:2|max:100"
                        )}
                      </div>
                    </div>
                  </div>

                  <div className={style.formInputRow}>
                    <div className={style.leftPartInput}>
                      <span className={style.inputHeads}>
                        Date of Birth <span className={style.redstar}>*</span>
                      </span>
                      <div>
                        <input
                          type="date"
                          placeholder="Enter your Date of Birth"
                          className={style.singleInput}
                          placeholderText="dd/mm/yyyy"
                          value={passenger.dateOfBirth}
                          onChange={(e) =>
                            handlePassengerInputChange(
                              index,
                              "dateOfBirth",
                              e.target.value
                            )
                          }
                          max={new Date().toISOString().split("T")[0]}
                        />

                        {simpleValidator.current.message(
                          "dateOfBirth",
                          passenger.dateOfBirth,
                          `${"required|"}dobValidation:${
                            passenger.passengerType
                          }`
                        )}
                      </div>
                    </div>
                    <div className={style.rightPartInput}>
                      <span className={style.inputHeads}>
                        Gender <span className={style.redstar}>*</span>
                      </span>
                      <div
                        className={style.checkboxContainer}
                        style={{ display: "flex", gap: "10px" }}
                      >
                        <div className={style.checkboxDisplay}>
                          <input
                            type="radio"
                            className={style.checkboxDesktop}
                            name={`gender-${index}`}
                            value="1"
                            checked={passenger.gender === "1"}
                            onChange={(e) =>
                              handlePassengerInputChange(
                                index,
                                "gender",
                                e.target.value
                              )
                            }
                          />
                          Male
                        </div>
                        <div className={style.checkboxDisplay}>
                          <input
                            type="radio"
                            className={style.checkboxDesktop}
                            name={`gender-${index}`}
                            value="2"
                            checked={passenger.gender === "2"}
                            onChange={(e) =>
                              handlePassengerInputChange(
                                index,
                                "gender",
                                e.target.value
                              )
                            }
                          />
                          Female
                        </div>
                      </div>
                      {simpleValidator.current.message(
                        "gender",
                        passenger.gender,
                        "required"
                      )}
                    </div>
                  </div>

                  {renderPanFields(passenger, index)}

                  {renderGuardianDetails(passenger, index)}

                  {flightData?.fareQuoteResponse
                    ?.isPassportFullDetailRequiredAtBook ||
                    flightData?.fareQuoteResponse?.isPassportRequiredAtBook ||
                    (flightData?.fareQuoteResponse
                      ?.isPassportRequiredAtTicket && (
                      <div className={style.contactDetailsHead}>
                        <div
                          style={{
                            color: "rgba(135, 135, 134, 1)",
                            marginBottom: "0%",
                          }}
                        >
                          Passport Details
                        </div>
                      </div>
                    ))}

                  {renderPassportFields(passenger, index)}
                  <div className={style.Forminput}>
                    {passenger.passengerType !== "infant" &&
                      flightData?.ssrResponse?.ssr?.ssrData?.baggage?.[0]
                        ?.length > 0 && (
                        <>
                          <div
                            className={style.leftPart}
                            onClick={() => handleBaggageOpen(index)}
                          >
                            {!passenger.baggage.length > 0 ? (
                              <>
                                <span>
                                  <FontAwesomeIcon
                                    icon={faPlus}
                                    style={{
                                      color: "#878786",
                                      fontSize: "13px",
                                    }}
                                  />
                                </span>
                                <span className={style.baggages}>
                                  Select Baggage
                                </span>
                              </>
                            ) : (
                              <>
                                <span className={style.baggages}>
                                  {`${passenger.baggage[0].weight}kg, ${passenger.baggage[0].price} ${passenger.baggage[0].currency}`}
                                </span>
                              </>
                            )}
                          </div>
                          {passenger.baggage.length > 0 && (
                            <span
                              style={{ display: "flex", alignItems: "center" }}
                            >
                              <FontAwesomeIcon
                                icon={faSquareXmark}
                                className={style.pointer}
                                style={{
                                  backgroundColor: "white",
                                  color: "#028FA3",
                                  fontSize: "20px",
                                }}
                                onClick={() =>
                                  handlePassengerInputChange(
                                    index,
                                    "removeBaggage",
                                    []
                                  )
                                }
                              />
                            </span>
                          )}
                        </>
                      )}

                    {mealsArray.length > 0 && (
                      <div
                        className={style.leftPart}
                        onClick={() => handleMealOpen(index)}
                      >
                        <span>
                          <FontAwesomeIcon
                            icon={faPlus}
                            style={{ color: "#878786", fontSize: "13px" }}
                          />
                        </span>
                        <span className={style.baggages}>
                          {passenger.mealPreference.length > 0 ||
                          passenger.mealDynamic?.[segmentIndex]
                            ? `${
                                passenger.mealPreference?.[0]?.description ||
                                passenger.mealDynamic?.[segmentIndex]
                                  ?.airlineDescription ||
                                passenger.mealDynamic?.[segmentIndex]
                                  ?.description
                              }, ${
                                passenger.mealPreference?.[0]?.price ||
                                passenger.mealDynamic?.[segmentIndex]?.price ||
                                0
                              }`
                            : "Select Meals"}
                        </span>
                      </div>
                    )}

                    {(passenger.mealPreference.length > 0 ||
                      passenger.mealDynamic.length > 0) && (
                      <span style={{ display: "flex", alignItems: "center" }}>
                        <FontAwesomeIcon
                          icon={faSquareXmark}
                          className={style.pointer}
                          style={{
                            backgroundColor: "white",
                            color: "#028FA3",
                            fontSize: "20px",
                          }}
                          onClick={() =>
                            handlePassengerInputChange(index, "removeMeals", [])
                          }
                        />
                      </span>
                    )}

                    {passenger.passengerType !== "infant" &&
                      flightData?.ssrResponse?.ssr?.ssrData?.seatDynamic &&
                      flightData?.ssrResponse?.ssr?.ssrData?.seatDynamic
                        ?.length > 0 && (
                        <div
                          className={style.leftPart}
                          onClick={() => handleSeatsOpen(index)}
                        >
                          <span>
                            <FontAwesomeIcon
                              icon={faPlus}
                              style={{ color: "#878786", fontSize: "13px" }}
                            />
                          </span>
                          <span className={style.baggages}>
                            {renderSelectedSeatText(passenger, index)}
                          </span>
                        </div>
                      )}
                  </div>

                  {baggageIndex === index && (
                    <>
                      <div
                        className={style.backdrop}
                        onClick={() => setBaggageIndex(null)}
                      >
                        {" "}
                      </div>
                      <div className={style.popupcontainer}>
                        <div className={style.selectedBaggage}>
                          <span className={style.select1}>Select Baggage</span>
                          <span className={style.closeButton}>
                            <FontAwesomeIcon
                              icon={faSquareXmark}
                              className={style.pointer}
                              style={{
                                backgroundColor: "white",
                                color: "#028FA3",
                              }}
                              onClick={() => setBaggageIndex(null)}
                            />
                          </span>
                        </div>
                        <div className={style.maincontainer}>
                          <div className={style.wayscontainer}>
                            <span className={style.ways}>
                              {origin?.airport?.cityCode} -
                              {destination?.airport?.cityCode}
                            </span>
                          </div>
                          <div className={style.weigths}>
                            {flightData?.ssrResponse?.ssr?.ssrData?.baggage?.[0]
                              ?.filter(
                                (baggageOption) =>
                                  !flightData?.fareQuoteResponse?.isLCC ||
                                  baggageOption.price > 0
                              )
                              ?.map((baggageOption, baggageIndex) => (
                                <div
                                  key={baggageIndex}
                                  onClick={() =>
                                    handlePassengerInputChange(
                                      index,
                                      "baggage",
                                      baggageOption
                                    )
                                  }
                                  className={`${style.totalweight} ${
                                    passenger.baggage.some(
                                      (segment) =>
                                        segment.code === baggageOption.code
                                    )
                                      ? style.ssrSelected
                                      : ""
                                  }`}
                                >
                                  {`${baggageOption.weight}kg, ${baggageOption.price} ${baggageOption.currency}`}
                                </div>
                              ))}
                          </div>
                        </div>
                      </div>
                    </>
                  )}

                  {mealIndex === index && (
                    <>
                      <div
                        className={style.backdrop}
                        onClick={() => setMealIndex(null)}
                      ></div>
                      <div className={style.popupcontainer}>
                        <div className={style.selectedBaggage}>
                          <span className={style.select1}>Add Meal</span>
                          <span>
                            <FontAwesomeIcon
                              icon={faSquareXmark}
                              className={style.pointer}
                              style={{
                                backgroundColor: "white",
                                color: "#028FA3",
                              }}
                              onClick={() => setMealIndex(null)}
                            />
                          </span>
                        </div>
                        <div className={style.wayscontainer}>
                          <span className={style.ways}>
                            {origin?.airport?.cityCode} -
                            {destination?.airport?.cityCode}
                          </span>
                        </div>
                        {mealSegment && mealSegment.length > 1 && (
                          <div
                            className={style.scrollNone}
                            style={{
                              display: "flex",
                              width: "95%",
                              marginLeft: "2%",
                              overflowX: "scroll",
                            }}
                          >
                            {mealSegment &&
                              mealSegment.map((segment, index) => (
                                <div
                                  key={`${segment.code}${index}`}
                                  className={`${style.wayscontainer1}`}
                                  onClick={() =>
                                    renderMealData(
                                      segment.origin,
                                      segment.destination,
                                      index
                                    )
                                  }
                                >
                                  <span
                                    className={`${style.ways1} ${
                                      segmentIndex === index
                                        ? style.mealActive
                                        : ""
                                    }`}
                                  >
                                    {segment.origin}-{segment.destination}
                                  </span>
                                </div>
                              ))}
                          </div>
                        )}
                        <div className={style.scrolling}>
                          {mealData &&
                            mealData.map((meal, mealIndex) => (
                              <div
                                key={`${meal.code}${mealIndex}`}
                                onClick={() =>
                                  handlePassengerInputChange(
                                    index,
                                    "meals",
                                    meal
                                  )
                                }
                                className={style.wrapper}
                              >
                                <div
                                  className={`${style.menucontainer} ${
                                    passenger.mealPreference.some(
                                      (segment) => segment.code === meal.code
                                    ) ||
                                    passenger.mealDynamic?.[segmentIndex]
                                      ?.code === meal.code
                                      ? style.ssrSelected
                                      : ""
                                  }`}
                                >
                                  <span>
                                    {meal.airlineDescription ||
                                      meal.description}
                                  </span>
                                  <span>{meal.price || 0}.Rs</span>
                                </div>
                              </div>
                            ))}
                        </div>
                      </div>
                    </>
                  )}

                  {index === 0 && (
                    <div className={style.formInputRow}>
                      <div className={style.leftPartInput}>
                        <span className={style.inputHeads}>
                          Address 1 <span className={style.redstar}>*</span>
                        </span>
                        <div>
                          <input
                            type="text"
                            placeholder="Address 1"
                            className={style.singleInput}
                            // style={{ height: "33px" }}
                            value={passenger.addressLine1}
                            onChange={(e) =>
                              handlePassengerInputChange(
                                index,
                                "addressLine1",
                                e.target.value
                              )
                            }
                          />
                          {index === 0 &&
                            simpleValidator.current.message(
                              "addressLine1",
                              passenger.addressLine1,
                              "required|min:3|max:255"
                            )}
                        </div>
                      </div>
                      <div className={style.rightPartInput}>
                        <span className={style.inputHeads}>Address 2</span>
                        <div>
                          <input
                            type="text"
                            placeholder="Address 2"
                            className={style.singleInput}
                            // style={{ height: "33px" }}
                            value={passenger.addressLine2}
                            onChange={(e) =>
                              handlePassengerInputChange(
                                index,
                                "addressLine2",
                                e.target.value
                              )
                            }
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  <div className={style.formInputRow}>
                    {index === 0 && (
                      <div className={style.leftPartInput}>
                        <span className={style.inputHeads}>
                          Country <span className={style.redstar}>*</span>
                        </span>
                        <div>
                          <Select
                            isClearable
                            value={passenger.countryName}
                            onChange={(selectedOption) =>
                              handlePassengerInputChange(
                                index,
                                "countryCode",
                                selectedOption
                              )
                            }
                            options={countryOptions}
                            placeholder="Choose Your Country"
                            className={style.city}
                          />
                          {index === 0 &&
                            simpleValidator.current.message(
                              "countryCode",
                              passenger.countryCode,
                              "required"
                            )}
                        </div>
                      </div>
                    )}
                    {index === 0 && (
                      <div className={style.rightPartInput}>
                        <span className={style.inputHeads}>
                          City <span className={style.redstar}>*</span>
                        </span>
                        <div>
                          <AsyncSelect
                            isClearable
                            cacheOptions
                            defaultOptions
                            placeholder="Search or Select City"
                            className={style.city}
                            isSearchable
                            loadOptions={(inputValue) =>
                              loadOptions(inputValue, index)
                            }
                            value={passenger.city}
                            onChange={(selectedOption) =>
                              handlePassengerInputChange(
                                index,
                                "city",
                                selectedOption
                              )
                            }
                          />
                          {index === 0 &&
                            simpleValidator.current.message(
                              "city",
                              passenger.city,
                              "required"
                            )}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* {long} */}
                  {renderDocumentType(passenger, index)}
                </div>
              </React.Fragment>
            ))}

            {renderGSTDetails()}

            <div className={style.addProceedBtn}>
              <div
                className={style.proceedBtn}
                onClick={handleSubmit}
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className={style.loadingSpinner} />
                ) : (
                  "Proceed to Book"
                )}
              </div>
            </div>
          </div>
        )}
        {selectedSection === "seatmap" && (
          <SeatMap
            passenger={passengerDetails}
            passengerIndex={seatIndex}
            seatsData={seatsData}
            seatStopsData={seatStopsData}
            seatStopsIndex={seatSegmentIndex}
            setSeatStopsIndex={setSeatSegmentIndex}
            handlePassengerInputChange={handlePassengerInputChange}
            handleSeatMapClose={() => setSelectedSection("details")}
            setSeatsData={setSeatsData}
            ssrDestinationsData={ssrDestinationsData}
            ssrDestinationIndex={ssrDestinationIndex}
            setSsrDestinationIndex={setSsrDestinationIndex}
            type="oneway"
          />
        )}
      </div>
    </>
  );
};
export default SideSheet;
