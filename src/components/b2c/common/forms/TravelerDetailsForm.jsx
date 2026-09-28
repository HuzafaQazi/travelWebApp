import { useState, useEffect, useRef } from "react";
import { useSelector } from "react-redux";
import Select from "react-select";
import AsyncSelect from "react-select/async";
import axios from "@/utils/axios/axios";
import config from "@/config";
import { validateGst } from "@/utils/bookingAPI";
import { extractFlightSegmentsInfo, getCityByCountry } from "@/utils/common";
import MasterPassengerSelector from "../../MasterPassenger/MasterPassengerSelector/MasterPassengerSelector";
import SaveMasterPassengerModal from "../../MasterPassenger/SaveMasterPassengerModal/SaveMasterPassengerModal";
import { selectIsLoggedIn } from "@/store/selectors/b2cSelectors";
import showToast from "@/utils/toast";

const TravelerDetailsForm = ({
  travelCategory,
  travelerDetails,
  setTravelerDetails,
  travelDetailsData,
  scrollToFirstError = false,
  validator,
  updateValidator,
  onScrollHandled,
  flightData = null,
  setScrollToFirstError,
  setTravelDetailsData,
}) => {
  const isLoggedIn = useSelector(selectIsLoggedIn);

  const [titleOptions, setTitleOptions] = useState([]);
  const [countryOptions, setCountryOptions] = useState([]);
  const inputRefs = useRef({});
  const [focusedField, setFocusedField] = useState(null); // Track which field is focused
  const [isCorporateBooking, setIsCorporateBooking] = useState();
  const [showGuardianDetails, setShowGuardianDetails] = useState({});
  const [, forceUpdate] = useState(0);

  const [showMasterPassengerSelector, setShowMasterPassengerSelector] =
    useState(false);
  const [selectedTravelerForMaster, setSelectedTravelerForMaster] =
    useState(null);
  const [showSavePassengerModal, setShowSavePassengerModal] = useState(false);
  const [passengerToSave, setPassengerToSave] = useState(null);
  const [selectedMasterPassengers, setSelectedMasterPassengers] = useState({});

  // Define functions to handle focus and blur
  const handleFocus = (field) => setFocusedField(field);
  const handleBlur = () => setFocusedField(null);

  const mapPaxTypeToPassengerType = (paxType) => {
    const paxTypeMap = {
      1: "adult",
      2: "child",
      3: "infant",
    };
    return paxTypeMap[paxType] || "adult"; // default to adult if unknown
  };

  const updateTravelerDetailsWithPassengerType = (travelerDetails) => {
    return travelerDetails.map((traveler) => ({
      ...traveler,
      passengerType: mapPaxTypeToPassengerType(traveler.paxType),
    }));
  };

  console.log("the travelers data", travelerDetails);

  useEffect(() => {
    // First, update travelerDetails with passengerType
    const updatedTravelerDetails =
      updateTravelerDetailsWithPassengerType(travelerDetails);

    // Initialize showGuardianDetails for infants
    const initialGuardianDetails = {};
    console.log("travelerDetails traveler", updatedTravelerDetails);

    updatedTravelerDetails.forEach((traveler, travelerIndex) => {
      if (travelCategory === "flights" && traveler.passengerType === "infant") {
        initialGuardianDetails[travelerIndex] = !!traveler.guardianDetails;
      } else if (travelCategory === "hotel") {
        // If hotel category has nested structure, handle accordingly
        // traveler.forEach((roomTraveler, roomTravelerIndex) => {
        //   if (roomTraveler.passengerType === "infant") {
        //     initialGuardianDetails[`${travelerIndex}-${roomTravelerIndex}`] =
        //       !!roomTraveler.guardianDetails;
        //   }
        // });
      }
    });

    setShowGuardianDetails(initialGuardianDetails);
  }, [travelerDetails, travelCategory]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [titleResponse, countryResponse] = await Promise.all([
          axios.get(`${config.CORPORATE.USER_TITLES}`),
          axios.get(`${config.CORPORATE.COUNTRY}`),
        ]);
        if (titleResponse.data.status === "SUCCESS") {
          const titleOptions = titleResponse.data.data.map((title) => ({
            value: title.title,
            label: title.title,
          }));
          setTitleOptions(titleOptions);
        }
        if (countryResponse.data.status === "SUCCESS") {
          const countryOptions = countryResponse.data.data.map((country) => ({
            value: country._id,
            code: country.alpha2code,
            label: country.countryname,
            phoneCode: country.phonecode,
          }));
          setCountryOptions(countryOptions);
        }
      } catch (error) {
        console.log("Error fetching data:", error);
      }
    };

    fetchData();
  }, []);

  const handleCorporateBooking = async (e) => {
    const isChecked = e.target.checked;

    if (!isChecked) {
      // Define GST-related fields

      // Clear GST data from traveler/passenger details state

      updateValidator();
      // Force re-render to update validation state
      forceUpdate((n) => n + 1);
    }

    setIsCorporateBooking(!isCorporateBooking);
  };
  const handleScrollToFirstError = () => {
    const fieldsOrder = Object.keys(inputRefs.current);
    for (let i = 0; i < fieldsOrder.length; i++) {
      const fieldName = fieldsOrder[i];
      if (!validator.fieldValid(fieldName)) {
        const fieldRef = inputRefs.current[fieldName];
        if (fieldRef && fieldRef.scrollIntoView) {
          fieldRef.scrollIntoView({
            behavior: "smooth",
            block: "center",
          });
          fieldRef.focus();
          break;
        }
      }
    }
  };

  useEffect(() => {
    if (scrollToFirstError) {
      validator.showMessages();
      forceUpdate((n) => n + 1); // Force re-render
      if (!validator.allValid()) {
        handleScrollToFirstError();
      }
      // Reset scrollToFirstError in parent
      if (onScrollHandled) {
        onScrollHandled();
      }
    }
  }, [scrollToFirstError]);

  const handleTravelerInputChange = async (
    roomIndex,
    travelerIndex,
    field,
    value
  ) => {
    let updatedDetails = [...travelerDetails];

    if (!Array.isArray(updatedDetails)) {
      updatedDetails = [];
    }
    if (travelCategory === "hotel") {
      if (!updatedDetails[roomIndex]) {
        updatedDetails[roomIndex] = [];
      }
      if (!updatedDetails[roomIndex][travelerIndex]) {
        updatedDetails[roomIndex][travelerIndex] = {};
      }
    }

    switch (field) {
      case "firstName":
      case "lastName":
        const key = `${roomIndex}-${travelerIndex}`;
        const currentTraveler =
          travelCategory === "hotel"
            ? updatedDetails[roomIndex]?.[travelerIndex]
            : updatedDetails[travelerIndex];

        // Check if there's a selected master passenger
        if (currentTraveler?.selectedMasterId) {
          // Clear the selection
          if (travelCategory === "hotel") {
            delete updatedDetails[roomIndex][travelerIndex].selectedMasterId;
          } else {
            delete updatedDetails[travelerIndex].selectedMasterId;
          }

          setSelectedMasterPassengers((prev) => {
            const newSelections = { ...prev };
            delete newSelections[key];
            return newSelections;
          });
        }

        if (travelCategory === "hotel") {
          updatedDetails[roomIndex][travelerIndex][field] = value.replace(
            /\s{2,}/g,
            " "
          );
        } else {
          updatedDetails[travelerIndex][field] = value.replace(/\s{2,}/g, " ");
        }
        break;
      case "pan":
        if (travelCategory === "flights") {
          const isLCC = travelDetailsData?.fareQuoteResponse?.isLCC;
          const isPanRequired = isLCC
            ? travelDetailsData?.fareQuoteResponse?.isPanRequiredAtTicket
            : travelDetailsData?.fareQuoteResponse?.isPanRequiredAtBook;
          if (isPanRequired) {
            const updatedDetailsWithPan = updatedDetails.map((passenger) => ({
              ...passenger,
              [field]: value.toUpperCase(),
            }));
            updatedDetails = updatedDetailsWithPan;
          } else {
            updatedDetails[travelerIndex][field] = value.toUpperCase();
          }
        } else if (travelCategory === "hotel") {
          const { ValidationInfo } = travelDetailsData?.BlockRoomResult;
          const { ValidationAtConfirm, ValidationAtVoucher } = ValidationInfo;
          const isPANMandatory =
            ValidationAtConfirm.IsPANMandatory ||
            ValidationAtVoucher.IsPANMandatory;
          const noOfPANRequired =
            ValidationAtConfirm.NoOfPANRequired ||
            ValidationAtVoucher.NoOfPANRequired;
          const isSamePANForAllAllowed =
            ValidationAtConfirm.IsSamePANForAllAllowed ||
            ValidationAtVoucher.IsSamePANForAllAllowed;
          if (isPANMandatory) {
            if (isSamePANForAllAllowed) {
              // Update PAN for all travelers in the room
              updatedDetails[roomIndex].forEach((traveler) => {
                traveler.pan = value.toUpperCase();
              });
            } else if (noOfPANRequired > 0) {
              // Update PAN only for the current traveler
              updatedDetails[roomIndex][travelerIndex].pan =
                value.toUpperCase();
            }
          }
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

        const passengerType = updatedDetails[travelerIndex].passengerType;

        if (
          genderTitleMapping[passengerType] &&
          genderTitleMapping[passengerType][value]
        ) {
          updatedDetails[travelerIndex].title =
            genderTitleMapping[passengerType][value];
        }
        updatedDetails[travelerIndex][field] = value;
        break;
      case "addressLine1":
        if (travelCategory === "hotel") {
          updatedDetails[roomIndex] = updatedDetails[roomIndex].map(
            (passenger) => ({
              ...passenger,
              [field]: value,
            })
          );
        } else {
          updatedDetails = updatedDetails.map((passenger) => ({
            ...passenger,
            [field]: value,
          }));
        }
        break;
      case "email":
        if (travelCategory === "hotel") {
          updatedDetails[roomIndex] = updatedDetails[roomIndex].map(
            (passenger) => ({
              ...passenger,
              [field]: value,
            })
          );
        } else {
          updatedDetails = updatedDetails.map((passenger) => ({
            ...passenger,
            [field]: value,
          }));
        }
        break;
      case "contactNo":
      case "city":
        if (travelCategory === "hotel") {
          updatedDetails[roomIndex] = updatedDetails[roomIndex].map(
            (passenger) => ({
              ...passenger,
              [field]: value,
            })
          );
        } else {
          updatedDetails = updatedDetails.map((passenger) => ({
            ...passenger,
            [field]: value,
          }));
        }
        break;
      case "countryCode":
        if (travelCategory === "hotel") {
          updatedDetails[roomIndex] = updatedDetails[roomIndex].map(
            (passenger) => ({
              ...passenger,
              [field]: value ? value.code : "",
              nationality: value ? value.code : "",
              cellCountryCode: value ? value.phoneCode : "",
              countryName: { value: value?.value, label: value?.label },
            })
          );
        } else {
          updatedDetails = updatedDetails.map((passenger) => ({
            ...passenger,
            [field]: value ? value.code : "",
            nationality: value ? value.code : "",
            cellCountryCode: value ? value.phoneCode : "",
            countryName: { value: value?.code, label: value?.label },
          }));
        }
        break;
      case "guardianTitle":
        updatedDetails[travelerIndex].guardianDetails.title = value;
        break;
      case "guardianFirstName":
        updatedDetails[travelerIndex].guardianDetails.firstName = value;
        break;
      case "guardianLastName":
        updatedDetails[travelerIndex].guardianDetails.lastName = value;
        break;
      case "guardianPan":
        updatedDetails[travelerIndex].guardianDetails.pan = value.toUpperCase();
        break;
      case "passportNo":
        if (travelCategory === "hotel") {
          updatedDetails[roomIndex][travelerIndex][field] = value.toUpperCase();
        } else {
          updatedDetails[travelerIndex][field] = value.toUpperCase();
        }
        break;
      case "passportIssueDate":
        if (travelCategory === "hotel") {
          // updatedDetails[roomIndex][travelerIndex][field] = value.toUpperCase();
        } else {
          updatedDetails[travelerIndex][field] = value;
        }
        break;
      case "passportExpiry":
        if (travelCategory === "hotel") {
        } else {
          updatedDetails[travelerIndex][field] = value;
        }
        break;
      case "passportIssueCountryCode":
        if (travelCategory === "hotel") {
        } else {
          updatedDetails[travelerIndex][field] = value;
        }
        break;

      case "gstNumber":
        if (travelCategory === "hotel") {
          if (!updatedDetails[roomIndex]) {
            updatedDetails[roomIndex] = [];
          }
          if (!updatedDetails[roomIndex][travelerIndex]) {
            updatedDetails[roomIndex][travelerIndex] = {};
          }
          updatedDetails[roomIndex][travelerIndex][field] = value.toUpperCase();
        } else {
          if (!updatedDetails[travelerIndex]) {
            updatedDetails[travelerIndex] = {};
          }
          updatedDetails[travelerIndex][field] = value.toUpperCase();
        }

        // ✅ Only validate once we have 15 characters
        if (value.length === 15) {
          setTimeout(async () => {
            const regex =
              /\d{2}[A-Z]{5}\d{4}[A-Z]{1}[A-Z\d]{1}[Z]{1}[A-Z\d]{1}/;
            if (regex.test(value)) {
              try {
                const gst = await validateGst(value);

                setTravelerDetails((currentDetails) => {
                  const latestDetails = [...currentDetails];

                  if (travelCategory === "hotel") {
                    if (!latestDetails[roomIndex]) {
                      latestDetails[roomIndex] = [];
                    }
                    if (!latestDetails[roomIndex][travelerIndex]) {
                      latestDetails[roomIndex][travelerIndex] = {};
                    }
                    latestDetails[roomIndex][travelerIndex] = {
                      ...latestDetails[roomIndex][travelerIndex],
                      gstCompanyName:
                        gst.status === "SUCCESS" ? gst.data.companyName : "",
                      gstCompanyAddress:
                        gst.status === "SUCCESS" ? gst.data.companyAddress : "",
                    };
                  } else {
                    if (!latestDetails[travelerIndex]) {
                      latestDetails[travelerIndex] = {};
                    }
                    latestDetails[travelerIndex] = {
                      ...latestDetails[travelerIndex],
                      gstCompanyName:
                        gst.status === "SUCCESS" ? gst.data.companyName : "",
                      gstCompanyAddress:
                        gst.status === "SUCCESS" ? gst.data.companyAddress : "",
                    };
                  }

                  return latestDetails;
                });
              } catch (error) {
                console.error(error);
              }
            }
          }, 100);
        }
        break;

      case "gstCompanyName":
      case "gstCompanyAddress":
      case "gstCompanyEmail":
        if (travelCategory === "hotel") {
          updatedDetails[roomIndex][travelerIndex][field] = value;
        } else {
          // Ensure traveler exists for non-hotel categories
          if (!updatedDetails[travelerIndex]) {
            updatedDetails[travelerIndex] = {};
          }
          updatedDetails[travelerIndex][field] = value;
        }
        break;

      case "gstCompanyContactNumber":
        if (travelCategory === "hotel") {
          updatedDetails[roomIndex][travelerIndex][field] = value.replace(
            /[^0-9]/g,
            ""
          );
        } else {
          // Ensure traveler exists for non-hotel categories
          if (!updatedDetails[travelerIndex]) {
            updatedDetails[travelerIndex] = {};
          }
          updatedDetails[travelerIndex][field] = value.replace(/[^0-9]/g, "");
        }
        break;
      case "documentType":
        if (!updatedDetails[travelerIndex].documentList) {
          updatedDetails[travelerIndex].documentList = [];
        }
        if (!updatedDetails[travelerIndex].documentList[0]) {
          updatedDetails[travelerIndex].documentList[0] = {};
        }
        updatedDetails[travelerIndex].documentList[0].documentTypeId = value;
        break;
      case "documentId":
        if (!updatedDetails[travelerIndex].documentList) {
          updatedDetails[travelerIndex].documentList = [];
        }
        if (!updatedDetails[travelerIndex].documentList[0]) {
          updatedDetails[travelerIndex].documentList[0] = {};
        }
        updatedDetails[travelerIndex].documentList[0].documentNumber = value;
        break;
      case "infantCheckbox":
        setShowGuardianDetails(value);
        break;
      // old
      case "ffAirlineCode":
      case "ffNumber":
        const target =
          travelCategory === "hotel"
            ? updatedDetails[roomIndex][travelerIndex]
            : updatedDetails[travelerIndex];
        target[field] = value; // Update the current field
        // Get both field values
        const airCode = target.ffAirlineCode || "";
        const ffNum = target.ffNumber || "";
        // Clear existing validation errors
        delete target.ffAirlineCodeValidationError;
        delete target.ffNumberValidationError;
        // Set validation error on the missing field
        if (airCode && !ffNum) {
          target.ffNumberValidationError =
            "Frequent Flyer Number is required when Frequent Flyer Airline Code is provided.";
        } else if (ffNum && !airCode) {
          target.ffAirlineCodeValidationError =
            "Frequent Flyer Airline Code is required when Frequent Flyer Number is provided.";
        }
        break;
      case "frequentFlyerNumber":
        const { airlineCode, value: ffNumber } = value;

        if (travelCategory === "hotel") {
          const target = updatedDetails[roomIndex][travelerIndex];
          if (!target.frequentFlyerDetails) {
            target.frequentFlyerDetails = [];
          }
        } else {
          const target = updatedDetails[travelerIndex];
          if (!target.frequentFlyerDetails) {
            target.frequentFlyerDetails = [];
          }

          // Get all routes for this airline
          const { allRoutes } = extractFlightSegmentsInfo(flightData);
          const routesForThisAirline = allRoutes.filter(
            (route) => route.airlineCode === airlineCode
          );

          if (ffNumber.trim() === "") {
            // Remove all entries for this airline
            target.frequentFlyerDetails = target.frequentFlyerDetails.filter(
              (item) => item.airlineCode !== airlineCode
            );
          } else {
            // Remove existing entries for this airline first
            target.frequentFlyerDetails = target.frequentFlyerDetails.filter(
              (item) => item.airlineCode !== airlineCode
            );

            // Add entries for all routes using this airline
            routesForThisAirline.forEach((route) => {
              target.frequentFlyerDetails.push({
                routeId: route.routeId,
                origin: route.origin,
                destination: route.destination,
                airlineCode: route.airlineCode,
                airlineName: route.airlineName,
                segmentType: route.segmentType,
                frequentFlyerNumber: ffNumber,
              });
            });
          }
        }
        break;
      default:
        // Exclude GST fields from default handling since they have specific cases
        const gstFields = [
          "gstNumber",
          "gstCompanyName",
          "gstCompanyAddress",
          "gstCompanyEmail",
          "gstCompanyContactNumber",
        ];

        if (!gstFields.includes(field)) {
          if (travelCategory === "hotel") {
            if (!updatedDetails[roomIndex]) {
              updatedDetails[roomIndex] = [];
            }
            if (!updatedDetails[roomIndex][travelerIndex]) {
              updatedDetails[roomIndex][travelerIndex] = {};
            }
            updatedDetails[roomIndex][travelerIndex][field] = value;
          } else {
            if (!updatedDetails[travelerIndex]) {
              updatedDetails[travelerIndex] = {};
            }
            updatedDetails[travelerIndex][field] = value;
          }
        }
        break;
    }

    setTravelerDetails(updatedDetails);
  };

  // Add function to handle master passenger selection
  const handleSelectMasterPassenger = (
    roomIndex,
    travelerIndex,
    passengerType
  ) => {
    if (!isLoggedIn) {
      showToast("error", "Please login to use the saved passengers feature");
      return;
    }
    setSelectedTravelerForMaster({ roomIndex, travelerIndex, passengerType });
    setShowMasterPassengerSelector(true);
  };

  const handleMasterPassengerSelected = (masterPassenger) => {
    const { roomIndex, travelerIndex } = selectedTravelerForMaster;

    let updatedDetails = [...travelerDetails];

    // Determine which fields are visible/required
    const isPassportVisible = (() => {
      if (travelCategory === "hotel") {
        const { ValidationInfo } = travelDetailsData?.BlockRoomResult || {};
        const { ValidationAtConfirm, ValidationAtVoucher } =
          ValidationInfo || {};
        return (
          ValidationAtConfirm?.IsPassportMandatory ||
          ValidationAtVoucher?.IsPassportMandatory
        );
      } else {
        // For flights
        const hasInboundData =
          travelDetailsData?.inboundFlightFareQuote &&
          Object.keys(travelDetailsData.inboundFlightFareQuote).length > 0;

        const isPassportFullDetailRequiredAtBook =
          travelDetailsData?.fareQuoteResponse
            ?.isPassportFullDetailRequiredAtBook ||
          travelDetailsData?.outboundFlightFareQuote
            ?.isPassportFullDetailRequiredAtBook ||
          (hasInboundData &&
            travelDetailsData?.inboundFlightFareQuote
              ?.isPassportFullDetailRequiredAtBook);

        const isPassportRequiredAtTicket =
          travelDetailsData?.fareQuoteResponse?.isPassportRequiredAtTicket ||
          travelDetailsData?.outboundFlightFareQuote
            ?.isPassportRequiredAtTicket ||
          (hasInboundData &&
            travelDetailsData?.inboundFlightFareQuote
              ?.isPassportRequiredAtTicket);

        const isPassportRequiredAtBook =
          travelDetailsData?.fareQuoteResponse?.isPassportRequiredAtBook ||
          travelDetailsData?.outboundFlightFareQuote
            ?.isPassportRequiredAtBook ||
          (hasInboundData &&
            travelDetailsData?.inboundFlightFareQuote
              ?.isPassportRequiredAtBook);

        return (
          isPassportFullDetailRequiredAtBook ||
          isPassportRequiredAtTicket ||
          isPassportRequiredAtBook
        );
      }
    })();

    // ============================================
    // 🔥 Determine if this is lead passenger
    // ============================================
    const isLeadPassenger =
      (travelCategory === "hotel" && roomIndex === 0 && travelerIndex === 0) ||
      (travelCategory === "flights" && travelerIndex === 0);

    // ============================================
    // 🔥 Get lead passenger's contact details
    // ============================================
    let leadPassengerData = null;
    if (!isLeadPassenger) {
      if (travelCategory === "hotel") {
        leadPassengerData = updatedDetails[0]?.[0]; // First traveler in first room
      } else {
        leadPassengerData = updatedDetails[0]; // First traveler
      }
    }

    // Build passenger data based on visible fields
    const passengerData = {
      title: { label: masterPassenger.title, value: masterPassenger.title },
      firstName: masterPassenger.firstName,
      lastName: masterPassenger.lastName,
      gender: masterPassenger.gender,
      dateOfBirth: masterPassenger.dateOfBirth
        ? new Date(masterPassenger.dateOfBirth).toISOString().split("T")[0]
        : "",
    };

    // ============================================
    // 🔥 Handle contact details
    // ============================================
    if (isLeadPassenger) {
      // ✅ For LEAD passenger: Use master passenger's contact details
      passengerData.email = masterPassenger.email || "";
      passengerData.contactNo = masterPassenger.contactNo || "";
      passengerData.cellCountryCode = masterPassenger.cellCountryCode || "";
      passengerData.countryCode = masterPassenger.countryCode || "";
      passengerData.countryName = masterPassenger.countryName || null;
      passengerData.nationality = masterPassenger.nationality || "";
      passengerData.city = masterPassenger.city || null;
      passengerData.addressLine1 = masterPassenger.addressLine1 || "";
      passengerData.addressLine2 = masterPassenger.addressLine2 || "";
    } else if (leadPassengerData) {
      // ✅ For NON-LEAD passengers: Copy from lead passenger
      passengerData.email = leadPassengerData.email || "";
      passengerData.contactNo = leadPassengerData.contactNo || "";
      passengerData.cellCountryCode = leadPassengerData.cellCountryCode || "";
      passengerData.countryCode = leadPassengerData.countryCode || "";
      passengerData.countryName = leadPassengerData.countryName || null;
      passengerData.nationality = leadPassengerData.nationality || "";
      passengerData.city = leadPassengerData.city || null;
      passengerData.addressLine1 = leadPassengerData.addressLine1 || "";
      passengerData.addressLine2 = leadPassengerData.addressLine2 || "";
    }

    // ✅ Only add PAN if visible
    if (masterPassenger.pan) {
      passengerData.pan = masterPassenger.pan;
    }

    // ✅ Only add passport fields if passport is visible
    if (isPassportVisible) {
      if (masterPassenger.passportNo) {
        passengerData.passportNo = masterPassenger.passportNo;
      }
      if (masterPassenger.passportExpiry) {
        passengerData.passportExpiry = new Date(masterPassenger.passportExpiry)
          .toISOString()
          .split("T")[0];
      }
      if (masterPassenger.passportIssueDate) {
        passengerData.passportIssueDate = new Date(
          masterPassenger.passportIssueDate
        )
          .toISOString()
          .split("T")[0];
      }
      if (masterPassenger.passportIssueCountryCode) {
        passengerData.passportIssueCountryCode =
          masterPassenger.passportIssueCountryCode;
      }
    }

    // ✅ Only add guardian details for infants
    if (
      (travelCategory === "flights" &&
        updatedDetails[travelerIndex]?.passengerType === "infant") ||
      (travelCategory === "hotel" &&
        updatedDetails[roomIndex]?.[travelerIndex]?.type === "infant")
    ) {
      if (masterPassenger.guardianDetails) {
        passengerData.guardianDetails = masterPassenger.guardianDetails;
      }
    }

    // ✅ Only add frequent flyer for flights
    if (travelCategory === "flights" && masterPassenger.frequentFlyerDetails) {
      passengerData.frequentFlyerDetails =
        masterPassenger.frequentFlyerDetails || [];
    }

    // Apply passenger data
    if (travelCategory === "hotel") {
      updatedDetails[roomIndex][travelerIndex] = {
        ...updatedDetails[roomIndex][travelerIndex],
        ...passengerData,
        selectedMasterId: masterPassenger._id, // ✅ Track selection
      };
    } else {
      updatedDetails[travelerIndex] = {
        ...updatedDetails[travelerIndex],
        ...passengerData,
        selectedMasterId: masterPassenger._id, // ✅ Track selection
      };
    }

    // ============================================
    // ENSURE ALL PASSENGERS HAVE CONTACT DETAILS
    // ============================================
    if (travelCategory === "hotel") {
      // For hotels, ensure all passengers in all rooms have lead passenger's contact details
      const leadPassenger = updatedDetails[0]?.[0];
      if (leadPassenger) {
        updatedDetails = updatedDetails.map((room, roomIdx) =>
          room.map((traveler, travelerIdx) => {
            if (roomIdx === 0 && travelerIdx === 0) {
              // Lead passenger, return as is
              return traveler;
            }
            // Non-lead passengers: ensure they have contact details from lead
            return {
              ...traveler,
              email: leadPassenger.email || traveler.email || "",
              contactNo: leadPassenger.contactNo || traveler.contactNo || "",
              cellCountryCode:
                leadPassenger.cellCountryCode || traveler.cellCountryCode || "",
              countryCode:
                leadPassenger.countryCode || traveler.countryCode || "",
              countryName:
                leadPassenger.countryName || traveler.countryName || null,
              nationality:
                leadPassenger.nationality || traveler.nationality || "",
              city: leadPassenger.city || traveler.city || null,
              addressLine1:
                leadPassenger.addressLine1 || traveler.addressLine1 || "",
              addressLine2:
                leadPassenger.addressLine2 || traveler.addressLine2 || "",
            };
          })
        );
      }
    } else {
      // For flights, ensure all passengers have lead passenger's contact details
      const leadPassenger = updatedDetails[0];
      if (leadPassenger) {
        updatedDetails = updatedDetails.map((traveler, travelerIdx) => {
          if (travelerIdx === 0) {
            // Lead passenger, return as is
            return traveler;
          }
          // Non-lead passengers: ensure they have contact details from lead
          return {
            ...traveler,
            email: leadPassenger.email || traveler.email || "",
            contactNo: leadPassenger.contactNo || traveler.contactNo || "",
            cellCountryCode:
              leadPassenger.cellCountryCode || traveler.cellCountryCode || "",
            countryCode:
              leadPassenger.countryCode || traveler.countryCode || "",
            countryName:
              leadPassenger.countryName || traveler.countryName || null,
            nationality:
              leadPassenger.nationality || traveler.nationality || "",
            city: leadPassenger.city || traveler.city || null,
            addressLine1:
              leadPassenger.addressLine1 || traveler.addressLine1 || "",
            addressLine2:
              leadPassenger.addressLine2 || traveler.addressLine2 || "",
          };
        });
      }
    }

    setTravelerDetails(updatedDetails);

    // ✅ Track this selection
    const key = `${roomIndex}-${travelerIndex}`;
    setSelectedMasterPassengers((prev) => ({
      ...prev,
      [key]: masterPassenger._id,
    }));

    showToast("success", "Passenger details loaded successfully!");
  };

  // Add function to save passenger as master
  const handleSaveMasterPassenger = (
    roomIndex,
    travelerIndex,
    passengerType
  ) => {
    try {
      if (!isLoggedIn) {
        showToast(
          "error",
          "Please login to save passengers for future bookings"
        );
        return;
      }

      const isValid = validator.allValid();

      if (!isValid) {
        validator.showMessages();
        forceUpdate((n) => n + 1);
        setScrollToFirstError(true);
        setTravelDetailsData({ ...travelDetailsData });
        return;
      }

      let traveler;

      if (travelCategory === "hotel") {
        traveler = travelerDetails[roomIndex][travelerIndex];
      } else {
        traveler = travelerDetails[travelerIndex];
      }

      if (!traveler.firstName || !traveler.lastName) {
        showToast(
          "error",
          "Please fill in at least first name and last name before saving"
        );
        return;
      }

      console.log(traveler);
      console.log("passengerType", passengerType);

      setPassengerToSave({
        data: traveler,
        type: passengerType,
        category: travelCategory,
      });
      setShowSavePassengerModal(true);
    } catch (error) {
      console.log("error in save master passenger", error);
    }
  };

  const renderGuardianFields = (roomIndex, travelerIndex, traveler) => {
    if (traveler.passengerType !== "infant") return null;

    const guardianKey =
      travelCategory === "hotel"
        ? `${roomIndex}-${travelerIndex}`
        : travelerIndex;

    return (
      <div className="mt-4">
        <div className="flex items-center">
          <label
            htmlFor={`infantCheckbox-${roomIndex}-${travelerIndex}`}
            className="flex items-center cursor-pointer"
          >
            <input
              type="checkbox"
              id={`infantCheckbox-${roomIndex}-${travelerIndex}`}
              checked={showGuardianDetails[guardianKey] || false}
              className="w-4 h-4 text-[#155EEF] bg-gray-100 border-gray-300 rounded focus:ring-[#155EEF] focus:ring-2"
              onChange={(e) =>
                handleTravelerInputChange(
                  roomIndex,
                  travelerIndex,
                  "infantCheckbox",
                  e.target.checked
                )
              }
            />
            <span className="ml-2 text-sm text-gray-700">
              Add Guardian Details
            </span>
          </label>
        </div>

        {showGuardianDetails[guardianKey] && (
          <>
            <div className="text-lg text-[#171A19] font-semibold mt-4">
              Guardian Details
            </div>
            <div className="flex flex-col sm:flex-row gap-8 sm:gap-4 items-center mt-3">
              <div className="flex w-full gap-2 sm:gap-4">
                <div className="w-1/3">
                  <div
                    className={`relative w-full min-w-[50px] h-10 ${
                      focusedField ===
                      `guardianTitle-${roomIndex}-${travelerIndex}`
                        ? "z-50"
                        : "z-40"
                    }`}
                  >
                    <Select
                      ref={(el) =>
                        (inputRefs.current[
                          `guardianTitle-${roomIndex}-${travelerIndex}`
                        ] = el)
                      }
                      name={`guardianTitle-${roomIndex}-${travelerIndex}`}
                      cacheOptions
                      defaultOptions
                      placeholder=" "
                      value={
                        traveler.guardianDetails?.title
                          ? titleOptions.find(
                              (option) =>
                                option.value === traveler.guardianDetails.title
                            )
                          : null
                      }
                      onChange={(selectedOption) =>
                        handleTravelerInputChange(
                          roomIndex,
                          travelerIndex,
                          "guardianTitle",
                          selectedOption?.value || ""
                        )
                      }
                      options={titleOptions.filter((option) =>
                        ["Mr", "Ms", "Mrs"].includes(option.value)
                      )}
                      classNamePrefix="custom-select"
                      components={customComponents}
                      isSearchable
                      onFocus={() =>
                        handleFocus(
                          `guardianTitle-${roomIndex}-${travelerIndex}`
                        )
                      }
                      onBlur={handleBlur}
                      styles={{
                        control: (provided, state) => ({
                          ...provided,
                          backgroundColor: "transparent",
                          border: state.isFocused
                            ? "2px solid #155EEF"
                            : "1px solid #155EEF50",
                          boxShadow: "none",
                          borderRadius: "0.5rem",
                          padding: "0.28rem 0.3rem",
                          fontSize: "0.875rem",
                          cursor: "pointer",
                        }),
                        placeholder: (provided) => ({
                          ...provided,
                          color: "#6B7280",
                        }),
                        singleValue: (provided) => ({
                          ...provided,
                          color: "#111827",
                        }),
                        indicatorSeparator: () => ({
                          display: "none",
                        }),
                        dropdownIndicator: (provided) => ({
                          ...provided,
                          color: "#155EEF",
                        }),
                      }}
                    />
                    <label
                      htmlFor={`guardianTitle-${roomIndex}-${travelerIndex}`}
                      className="absolute text-sm text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-white dark:bg-gray-900 px-2 peer-focus:px-2 peer-focus:text-[#155EEF] peer-focus:dark:text-[#155EEF] peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto start-1"
                    >
                      Guardian Title <span className="text-red-500">*</span>
                    </label>
                    <div className="text-red-500 text-xs mt-1">
                      {validator.message(
                        `guardianTitle-${roomIndex}-${travelerIndex}`,
                        traveler.guardianDetails?.title,
                        showGuardianDetails[guardianKey] ? "required" : ""
                      )}
                    </div>
                  </div>
                </div>
                <div className="w-1/3">
                  <div className="relative w-full min-w-[50px] h-10">
                    <input
                      ref={(el) =>
                        (inputRefs.current[
                          `guardianFirstName-${roomIndex}-${travelerIndex}`
                        ] = el)
                      }
                      name={`guardianFirstName-${roomIndex}-${travelerIndex}`}
                      className="block cursor-pointer px-2.5 pb-2.5 pt-2.5 w-full text-sm text-gray-900 bg-transparent rounded-lg border-1 border-gray-300 appearance-none dark:text-black dark:border-[#155EEF30] border-1 dark:focus:border-[#155EEF] focus:outline-none focus:ring-0 focus:border-[#155EEF]-600 border-2 peer"
                      placeholder=" "
                      id={`guardianFirstName-${roomIndex}-${travelerIndex}`}
                      type="text"
                      value={traveler.guardianDetails?.firstName || ""}
                      onChange={(e) =>
                        handleTravelerInputChange(
                          roomIndex,
                          travelerIndex,
                          "guardianFirstName",
                          e.target.value.replace(/[^A-Za-z ]/g, "")
                        )
                      }
                      maxLength={33}
                      autoComplete="off"
                    />
                    <label
                      htmlFor={`guardianFirstName-${roomIndex}-${travelerIndex}`}
                      className="absolute text-sm text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-white dark:bg-gray-900 px-2 peer-focus:px-2 peer-focus:text-[#155EEF] peer-focus:dark:text-[#155EEF] peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto start-1"
                    >
                      Guardian First Name{" "}
                      <span className="text-red-500">*</span>
                    </label>
                    <div className="text-red-500 text-xs mt-1">
                      {validator.message(
                        `guardianFirstName-${roomIndex}-${travelerIndex}`,
                        traveler.guardianDetails?.firstName,
                        showGuardianDetails[guardianKey]
                          ? "required|min:1|max:33"
                          : ""
                      )}
                    </div>
                  </div>
                </div>
                <div className="w-1/3">
                  <div className="relative w-full min-w-[50px] h-10">
                    <input
                      ref={(el) =>
                        (inputRefs.current[
                          `guardianLastName-${roomIndex}-${travelerIndex}`
                        ] = el)
                      }
                      name={`guardianLastName-${roomIndex}-${travelerIndex}`}
                      className="block cursor-pointer px-2.5 pb-2.5 pt-2.5 w-full text-sm text-gray-900 bg-transparent rounded-lg border-1 border-gray-300 appearance-none dark:text-black dark:border-[#155EEF30] border-1 dark:focus:border-[#155EEF] focus:outline-none focus:ring-0 focus:border-[#155EEF]-600 border-2 peer"
                      placeholder=" "
                      id={`guardianLastName-${roomIndex}-${travelerIndex}`}
                      type="text"
                      value={traveler.guardianDetails?.lastName || ""}
                      onChange={(e) =>
                        handleTravelerInputChange(
                          roomIndex,
                          travelerIndex,
                          "guardianLastName",
                          e.target.value.replace(/[^A-Za-z ]/g, "")
                        )
                      }
                      maxLength={50}
                      autoComplete="off"
                    />
                    <label
                      htmlFor={`guardianLastName-${roomIndex}-${travelerIndex}`}
                      className="absolute text-sm text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-white dark:bg-gray-900 px-2 peer-focus:px-2 peer-focus:text-[#155EEF] peer-focus:dark:text-[#155EEF] peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto start-1"
                    >
                      Guardian Last Name <span className="text-red-500">*</span>
                    </label>
                    <div className="text-red-500 text-xs mt-1">
                      {validator.message(
                        `guardianLastName-${roomIndex}-${travelerIndex}`,
                        traveler.guardianDetails?.lastName,
                        showGuardianDetails[guardianKey]
                          ? "required|min:2|max:50"
                          : ""
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-8 sm:gap-4 items-center mt-3">
              <div className="flex w-full gap-2 sm:gap-4">
                <div className="w-1/3">
                  <div className="relative w-full min-w-[50px] h-10">
                    <input
                      ref={(el) =>
                        (inputRefs.current[
                          `guardianPan-${roomIndex}-${travelerIndex}`
                        ] = el)
                      }
                      name={`guardianPan-${roomIndex}-${travelerIndex}`}
                      className="block cursor-pointer px-2.5 pb-2.5 pt-2.5 w-full text-sm text-gray-900 bg-transparent rounded-lg border-1 border-gray-300 appearance-none dark:text-black dark:border-[#155EEF30] border-1 dark:focus:border-[#155EEF] focus:outline-none focus:ring-0 focus:border-[#155EEF]-600 border-2 peer"
                      placeholder=" "
                      id={`guardianPan-${roomIndex}-${travelerIndex}`}
                      type="text"
                      value={traveler.guardianDetails?.pan || ""}
                      onChange={(e) =>
                        handleTravelerInputChange(
                          roomIndex,
                          travelerIndex,
                          "guardianPan",
                          e.target.value
                        )
                      }
                      maxLength={10}
                      autoComplete="off"
                    />
                    <label
                      htmlFor={`guardianPan-${roomIndex}-${travelerIndex}`}
                      className="absolute text-sm text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-white dark:bg-gray-900 px-2 peer-focus:px-2 peer-focus:text-[#155EEF] peer-focus:dark:text-[#155EEF] peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto start-1"
                    >
                      Guardian PAN
                    </label>
                    <div className="text-red-500 text-xs mt-1">
                      {validator.message(
                        `guardianPan-${roomIndex}-${travelerIndex}`,
                        traveler.guardianDetails?.pan,
                        showGuardianDetails[guardianKey] ? "validPAN" : ""
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    );
  };

  const renderFrequentFlyerFields = (roomIndex, travelerIndex, traveler) => {
    if (travelCategory === "hotel") return null;

    const { uniqueAirlines, allRoutes } = extractFlightSegmentsInfo(flightData);

    if (!uniqueAirlines || uniqueAirlines.length === 0) return null;

    return (
      <div className="mt-2 w-full">
        <div className="text-lg text-[#171A19] font-semibold mb-3">
          Frequent Flyer Details
        </div>

        {uniqueAirlines.map((airline, index) => {
          // Find all routes for this airline
          const routesForAirline = allRoutes.filter(
            (route) => route.airlineCode === airline.airlineCode
          );

          // Get the frequent flyer number for this airline (should be same for all routes of same airline)
          const existingEntry = traveler?.frequentFlyerDetails?.find(
            (item) => item.airlineCode === airline.airlineCode
          );

          // Generate route display text
          const routeText =
            routesForAirline.length > 1
              ? `${routesForAirline[0].origin} ↔ ${routesForAirline[0].destination}` // Same airline both ways
              : `${routesForAirline[0].origin} → ${routesForAirline[0].destination}`; // One way only

          return (
            <div
              key={airline.airlineCode}
              className="flex flex-col sm:flex-row gap-3 sm:gap-2 items-center mb-3"
            >
              <div className="w-full sm:w-1/3">
                <div className="relative w-full min-w-[50px] h-10">
                  <input
                    className="block cursor-not-allowed px-2.5 pb-2.5 pt-2.5 w-full text-sm text-gray-900 bg-transparent rounded-lg border-1 border-gray-300 appearance-none dark:text-black dark:border-[#155EEF30] border-1 dark:focus:border-[#155EEF] focus:outline-none focus:ring-0 focus:border-[#155EEF]-600 border-2 peer"
                    placeholder=" "
                    id={`ffRoute-${roomIndex}-${travelerIndex}-${index}`}
                    type="text"
                    value={routeText}
                    readOnly
                  />
                  <label
                    htmlFor={`ffRoute-${roomIndex}-${travelerIndex}-${index}`}
                    className="absolute text-sm text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-white dark:bg-gray-900 px-2 peer-focus:px-2 peer-focus:text-[#155EEF] peer-focus:dark:text-[#155EEF] peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto start-1"
                  >
                    Route
                  </label>
                </div>
              </div>

              <div className="w-full sm:w-1/3">
                <div className="relative w-full min-w-[50px] h-10">
                  <input
                    className="block cursor-not-allowed px-2.5 pb-2.5 pt-2.5 w-full text-sm text-gray-900 bg-transparent rounded-lg border-1 border-gray-300 appearance-none dark:text-black dark:border-[#155EEF30] border-1 dark:focus:border-[#155EEF] focus:outline-none focus:ring-0 focus:border-[#155EEF]-600 border-2 peer"
                    placeholder=" "
                    id={`ffAirline-${roomIndex}-${travelerIndex}-${index}`}
                    type="text"
                    value={`${airline.airlineCode} - ${airline.airlineName}`}
                    readOnly
                  />
                  <label
                    htmlFor={`ffAirline-${roomIndex}-${travelerIndex}-${index}`}
                    className="absolute text-sm text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-white dark:bg-gray-900 px-2 peer-focus:px-2 peer-focus:text-[#155EEF] peer-focus:dark:text-[#155EEF] peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto start-1"
                  >
                    Airline
                  </label>
                </div>
              </div>

              <div className="w-full sm:w-1/3">
                <div className="relative w-full min-w-[50px] h-10">
                  <input
                    ref={(el) =>
                      (inputRefs.current[
                        `ffNumber-${roomIndex}-${travelerIndex}-${index}`
                      ] = el)
                    }
                    name={`ffNumber-${roomIndex}-${travelerIndex}-${index}`}
                    className="block cursor-pointer px-2.5 pb-2.5 pt-2.5 w-full text-sm text-gray-900 bg-transparent rounded-lg border-1 border-gray-300 appearance-none dark:text-black dark:border-[#155EEF30] border-1 dark:focus:border-[#155EEF] focus:outline-none focus:ring-0 focus:border-[#155EEF]-600 border-2 peer"
                    placeholder=" "
                    id={`ffNumber-${roomIndex}-${travelerIndex}-${index}`}
                    type="text"
                    value={existingEntry?.frequentFlyerNumber || ""}
                    onChange={(e) =>
                      handleTravelerInputChange(
                        roomIndex,
                        travelerIndex,
                        "frequentFlyerNumber",
                        {
                          airlineCode: airline.airlineCode,
                          value: e.target.value,
                        }
                      )
                    }
                    maxLength={20}
                    autoComplete="off"
                  />
                  <label
                    htmlFor={`ffNumber-${roomIndex}-${travelerIndex}-${index}`}
                    className="absolute text-xs text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-white dark:bg-gray-900 px-2 peer-focus:px-2 peer-focus:text-[#155EEF] peer-focus:dark:text-[#155EEF] peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto start-1"
                  >
                    Frequent Flyer Number
                  </label>
                  <div className="text-red-500 text-xs mt-1">
                    {validator.message(
                      `ffNumber-${roomIndex}-${travelerIndex}-${index}`,
                      existingEntry?.frequentFlyerNumber,
                      "min:5|max:20"
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  const renderPanFields = (roomIndex, travelerIndex, traveler, label) => {
    if (travelCategory === "flights") {
      const isLCC =
        travelDetailsData?.fareQuoteResponse?.isLCC ||
        travelDetailsData?.outboundFlightFareQuote?.isLCC ||
        travelDetailsData?.inboundFlightFareQuote?.isLCC;

      const isPanRequired = isLCC
        ? travelDetailsData?.fareQuoteResponse?.isPanRequiredAtTicket ||
          travelDetailsData?.outboundFlightFareQuote?.isPanRequiredAtTicket ||
          travelDetailsData?.inboundFlightFareQuote?.isPanRequiredAtTicket
        : travelDetailsData?.fareQuoteResponse?.isPanRequiredAtBook ||
          travelDetailsData?.outboundFlightFareQuote?.isPanRequiredAtBook ||
          travelDetailsData?.inboundFlightFareQuote?.isPanRequiredAtBook;

      return (
        <>
          {travelerIndex === 0 &&
            isPanRequired &&
            renderPanInput(roomIndex, travelerIndex, traveler, "PAN")}
        </>
      );
    } else if (travelCategory === "hotel") {
      const { ValidationInfo } = travelDetailsData?.BlockRoomResult;
      const { ValidationAtConfirm, ValidationAtVoucher } = ValidationInfo;
      const isPANMandatory =
        ValidationAtConfirm.IsPANMandatory ||
        ValidationAtVoucher.IsPANMandatory;
      const noOfPANRequired =
        ValidationAtConfirm.NoOfPANRequired ||
        ValidationAtVoucher.NoOfPANRequired;
      const isSamePANForAllAllowed =
        ValidationAtConfirm.IsSamePANForAllAllowed ||
        ValidationAtVoucher.IsSamePANForAllAllowed;

      if (isPANMandatory) {
        if (isSamePANForAllAllowed && travelerIndex === 0) {
          // Render PAN field only for the first traveler in the room
          return renderPanInput(
            roomIndex,
            travelerIndex,
            traveler,
            "PAN (Same for all in this room)"
          );
        } else if (noOfPANRequired > 0 && travelerIndex < noOfPANRequired) {
          // Render PAN field for the required number of travelers
          return renderPanInput(roomIndex, travelerIndex, traveler, "PAN");
        }
      }
      return null;
    }
  };

  const renderPanInput = (roomIndex, travelerIndex, traveler, label) => (
    <div className="flex gap-4 items-center mt-3">
      <div className="w-1/3">
        <div className="cursor-pointer relative w-full min-w-[50px] h-10">
          <input
            className="block px-2.5 pb-2.5 pt-2.5 w-full text-sm text-gray-900 bg-transparent cursor-pointer rounded-lg border-1 border-gray-300 appearance-none dark:text-black dark:border-[#155EEF30] border-1 dark:focus:border-[#155EEF] focus:outline-none focus:ring-0 focus:border-[#155EEF]-600 border-2 peer"
            placeholder=" "
            id={`pan-${roomIndex}-${travelerIndex}`}
            type="text"
            value={traveler?.pan}
            onChange={(e) =>
              handleTravelerInputChange(
                roomIndex,
                travelerIndex,
                "pan",
                e.target.value
              )
            }
            maxLength={10}
          />
          <label
            htmlFor={`pan-${roomIndex}-${travelerIndex}`}
            className="absolute text-sm text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-white dark:bg-gray-900 px-2 peer-focus:px-2 peer-focus:text-[#155EEF] peer-focus:dark:text-[#155EEF] peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto start-1"
          >
            {label}
            <span className="text-red-500">*</span>
          </label>
          <div className="text-red-500 text-xs mt-1">
            {validator.message(
              `pan-${roomIndex}-${travelerIndex}`,
              traveler?.pan,
              "required|validPAN"
            )}
          </div>
        </div>
      </div>
    </div>
  );

  const isPassportRequiredAtBook =
    travelDetailsData?.fareQuoteResponse?.isPassportRequiredAtBook ||
    travelDetailsData?.outboundFlightFareQuote?.isPassportRequiredAtBook ||
    travelDetailsData?.inboundFlightFareQuote?.isPassportRequiredAtBook;

  const renderPassportFields = (
    roomIndex,
    travelerIndex,
    traveler,
    inboundArrival
  ) => {
    if (travelCategory === "hotel") {
      const { ValidationInfo } = travelDetailsData?.BlockRoomResult;
      const { ValidationAtConfirm, ValidationAtVoucher } = ValidationInfo;
      const isPassportMandatory =
        ValidationAtConfirm.IsPassportMandatory ||
        ValidationAtVoucher.IsPassportMandatory;
      if (isPassportMandatory) {
        return renderPassportInputs(
          roomIndex,
          travelerIndex,
          traveler,
          true,
          false
        );
      }
      return null;
    } else {
      // Check if inbound exists and has data
      const hasInboundData =
        travelDetailsData?.inboundFlightFareQuote &&
        Object.keys(travelDetailsData.inboundFlightFareQuote).length > 0;

      // Determine isLCC - prioritize outbound if inbound doesn't exist
      const isLCC = hasInboundData
        ? travelDetailsData?.fareQuoteResponse?.isLCC ||
          travelDetailsData?.outboundFlightFareQuote?.isLCC ||
          travelDetailsData?.inboundFlightFareQuote?.isLCC
        : travelDetailsData?.fareQuoteResponse?.isLCC ||
          travelDetailsData?.outboundFlightFareQuote?.isLCC;

      console.log("the lcc value:", isLCC);
      console.log("hasInboundData:", hasInboundData);
      console.log("travelDetailsData:", travelDetailsData);

      // Check passport requirements
      const isPassportFullDetailRequiredAtBook =
        travelDetailsData?.fareQuoteResponse
          ?.isPassportFullDetailRequiredAtBook ||
        travelDetailsData?.outboundFlightFareQuote
          ?.isPassportFullDetailRequiredAtBook ||
        (hasInboundData &&
          travelDetailsData?.inboundFlightFareQuote
            ?.isPassportFullDetailRequiredAtBook);

      const isPassportRequiredAtTicket =
        travelDetailsData?.fareQuoteResponse?.isPassportRequiredAtTicket ||
        travelDetailsData?.outboundFlightFareQuote
          ?.isPassportRequiredAtTicket ||
        (hasInboundData &&
          travelDetailsData?.inboundFlightFareQuote
            ?.isPassportRequiredAtTicket);

      const isPassportRequiredAtBook =
        travelDetailsData?.fareQuoteResponse?.isPassportRequiredAtBook ||
        travelDetailsData?.outboundFlightFareQuote?.isPassportRequiredAtBook ||
        (hasInboundData &&
          travelDetailsData?.inboundFlightFareQuote?.isPassportRequiredAtBook);

      // Calculate inbound arrival time
      let inboundArrival;
      if (
        hasInboundData &&
        travelDetailsData?.inboundFlightFareQuote?.segments
      ) {
        const inboundSegments =
          travelDetailsData.inboundFlightFareQuote.segments;
        const lastSegment = inboundSegments[inboundSegments.length - 1];
        inboundArrival =
          lastSegment?.segment?.[lastSegment.segment.length - 1]?.destination
            ?.arrTime;
      } else if (travelDetailsData?.outboundFlightFareQuote?.segments) {
        const outboundSegments =
          travelDetailsData.outboundFlightFareQuote.segments;
        const lastSegment = outboundSegments[outboundSegments.length - 1];
        inboundArrival =
          lastSegment?.segment?.[lastSegment.segment.length - 1]?.destination
            ?.arrTime;
      }
      console.log(
        "the isPassportFullDetailRequiredAtBook",
        isPassportFullDetailRequiredAtBook
      );
      console.log("the is lcc:", isLCC);
      return (
        <>
          {isLCC ? (
            <>
              {isPassportFullDetailRequiredAtBook ? (
                <>
                  {renderPassportInputs(
                    roomIndex,
                    travelerIndex,
                    traveler,
                    true,
                    true,
                    inboundArrival
                  )}
                </>
              ) : isPassportRequiredAtTicket ? (
                <>
                  {renderPassportInputs(
                    roomIndex,
                    travelerIndex,
                    traveler,
                    false,
                    false,
                    inboundArrival
                  )}
                </>
              ) : null}
            </>
          ) : (
            <>
              {isPassportFullDetailRequiredAtBook ? (
                <>
                  {renderPassportInputs(
                    roomIndex,
                    travelerIndex,
                    traveler,
                    true,
                    true,
                    inboundArrival
                  )}
                </>
              ) : isPassportRequiredAtBook || isPassportRequiredAtTicket ? (
                /* Render only passport number and expiry date */
                <>
                  {renderPassportInputs(
                    roomIndex,
                    travelerIndex,
                    traveler,
                    true,
                    true,
                    inboundArrival
                  )}
                </>
              ) : null}
            </>
          )}
        </>
      );
    }
  };

  const renderGSTDetails = (
    roomIndex,
    travelerIndex,
    traveler,
    gstCompanyAddress
  ) => {
    const isGSTRequired = flightData?.fareQuoteResponse?.isGSTMandatory;

    const validateField = (fieldName, value, validationRule) => {
      // Only apply validation if corporate booking is enabled
      return validator.message(
        fieldName,
        value,
        isCorporateBooking ? validationRule : ""
      );
    };

    return (
      <>
        {/* Corporate Checkbox */}
        <div className="flex items-center mt-4">
          <label
            htmlFor={`corporate-${roomIndex}-${travelerIndex}`}
            className="flex items-center cursor-pointer"
          >
            <input
              type="checkbox"
              id={`corporate-${roomIndex}-${travelerIndex}`}
              checked={isCorporateBooking}
              className="w-4 h-4 text-[#155EEF] bg-gray-100 border-gray-300 rounded focus:ring-[#155EEF] focus:ring-2"
              onChange={handleCorporateBooking}
            />
            <span className="ml-2 text-sm text-gray-700">Add GST Details</span>
          </label>
        </div>

        {/* GST Details Section */}
        {isCorporateBooking && (
          <>
            <div className="text-lg text-[#171A19] font-semibold mt-4">
              Enter GST Details
            </div>

            {/* First Row - GST Number and Company Name */}
            <div className="flex flex-col sm:flex-row gap-8 sm:gap-4 items-center mt-3">
              <div className="flex w-full gap-2 sm:gap-4">
                {/* GST Number */}
                <div className="w-1/2">
                  <div className="relative w-full min-w-[50px] h-10">
                    <input
                      className="block px-2.5 pb-2.5 pt-2.5 w-full text-sm text-gray-900 bg-transparent rounded-lg border-1 border-gray-300 appearance-none dark:text-black dark:border-[#155EEF30] border-1 dark:focus:border-[#155EEF] focus:outline-none focus:ring-0 focus:border-[#155EEF]-600 border-2 peer"
                      placeholder=" "
                      id={`gstNumber-${roomIndex}-${travelerIndex}`}
                      name={`gstNumber-${roomIndex}-${travelerIndex}`}
                      type="text"
                      maxLength={15}
                      value={traveler?.gstNumber || ""}
                      onChange={(e) =>
                        handleTravelerInputChange(
                          roomIndex,
                          travelerIndex,
                          "gstNumber",
                          e.target.value
                        )
                      }
                    />
                    <label
                      htmlFor={`gstNumber-${roomIndex}-${travelerIndex}`}
                      className="absolute text-xs text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-white dark:bg-gray-900 px-2 peer-focus:px-2 peer-focus:text-[#155EEF] peer-focus:dark:text-[#155EEF] peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto start-1"
                    >
                      GST Number
                      <span className="text-red-500">*</span>
                    </label>
                    <div className="text-red-500 text-xs mt-1">
                      {validateField(
                        `gstNumber-${roomIndex}-${travelerIndex}`,
                        traveler?.gstNumber,
                        "required|validGST"
                      )}
                    </div>
                  </div>
                </div>

                {/* Company Name */}
                <div className="w-1/2">
                  <div className="relative w-full min-w-[50px] h-10">
                    <input
                      className="block px-2.5 pb-2.5 pt-2.5 w-full text-sm text-gray-900 bg-transparent rounded-lg border-1 border-gray-300 appearance-none dark:text-black dark:border-[#155EEF30] border-1 dark:focus:border-[#155EEF] focus:outline-none focus:ring-0 focus:border-[#155EEF]-600 border-2 peer"
                      placeholder=" "
                      id={`gstCompanyName-${roomIndex}-${travelerIndex}`}
                      name={`gstCompanyName-${roomIndex}-${travelerIndex}`}
                      type="text"
                      value={traveler?.gstCompanyName || ""}
                      onChange={(e) =>
                        handleTravelerInputChange(
                          roomIndex,
                          travelerIndex,
                          "gstCompanyName",
                          e.target.value
                        )
                      }
                    />
                    <label
                      htmlFor={`gstCompanyName-${roomIndex}-${travelerIndex}`}
                      className="absolute text-xs text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-white dark:bg-gray-900 px-2 peer-focus:px-2 peer-focus:text-[#155EEF] peer-focus:dark:text-[#155EEF] peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto start-1"
                    >
                      Company Name
                      <span className="text-red-500">*</span>
                    </label>
                    <div className="text-red-500 text-xs mt-1">
                      {validateField(
                        `gstCompanyName-${roomIndex}-${travelerIndex}`,
                        traveler?.gstCompanyName,
                        "required"
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Second Row - Company Mobile and Company Email */}
            <div className="flex flex-col sm:flex-row gap-8 sm:gap-4 items-center mt-4">
              <div className="flex w-full gap-2 sm:gap-4">
                {/* Company Mobile Number */}
                <div className="w-1/2">
                  <div className="relative w-full min-w-[50px] h-10">
                    <input
                      className="block px-2.5 pb-2.5 pt-2.5 w-full text-sm text-gray-900 bg-transparent rounded-lg border-1 border-gray-300 appearance-none dark:text-black dark:border-[#155EEF30] border-1 dark:focus:border-[#155EEF] focus:outline-none focus:ring-0 focus:border-[#155EEF]-600 border-2 peer"
                      placeholder=" "
                      id={`gstCompanyContactNumber-${roomIndex}-${travelerIndex}`}
                      name={`gstCompanyContactNumber-${roomIndex}-${travelerIndex}`}
                      type="text"
                      maxLength={15}
                      value={traveler?.gstCompanyContactNumber || ""}
                      onChange={(e) =>
                        handleTravelerInputChange(
                          roomIndex,
                          travelerIndex,
                          "gstCompanyContactNumber",
                          e.target.value.replace(/[^0-9]/g, "")
                        )
                      }
                    />
                    <label
                      htmlFor={`gstCompanyContactNumber-${roomIndex}-${travelerIndex}`}
                      className="absolute text-xs text-nowrap text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-white dark:bg-gray-900 px-2 peer-focus:px-2 peer-focus:text-[#155EEF] peer-focus:dark:text-[#155EEF] peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto start-1"
                    >
                      Company Mobile Number
                      <span className="text-red-500">*</span>
                    </label>
                    <div className="text-red-500 text-xs mt-1">
                      {validateField(
                        `gstCompanyContactNumber-${roomIndex}-${travelerIndex}`,
                        traveler?.gstCompanyContactNumber,
                        `required|${
                          traveler?.nationality === "IN"
                            ? "validMobile"
                            : "validMobile|min:7|max:15"
                          // : "validMobileIntl|min:7|max:15"
                        }`
                      )}
                    </div>
                  </div>
                </div>

                {/* Company Email */}
                <div className="w-1/2">
                  <div className="relative w-full min-w-[50px] h-10">
                    <input
                      className="block px-2.5 pb-2.5 pt-2.5 w-full text-sm text-gray-900 bg-transparent rounded-lg border-1 border-gray-300 appearance-none dark:text-black dark:border-[#155EEF30] border-1 dark:focus:border-[#155EEF] focus:outline-none focus:ring-0 focus:border-[#155EEF]-600 border-2 peer"
                      placeholder=" "
                      id={`gstCompanyEmail-${roomIndex}-${travelerIndex}`}
                      name={`gstCompanyEmail-${roomIndex}-${travelerIndex}`}
                      type="email"
                      value={traveler?.gstCompanyEmail || ""}
                      onChange={(e) =>
                        handleTravelerInputChange(
                          roomIndex,
                          travelerIndex,
                          "gstCompanyEmail",
                          e.target.value
                        )
                      }
                    />
                    <label
                      htmlFor={`gstCompanyEmail-${roomIndex}-${travelerIndex}`}
                      className="absolute text-xs text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-white dark:bg-gray-900 px-2 peer-focus:px-2 peer-focus:text-[#155EEF] peer-focus:dark:text-[#155EEF] peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto start-1"
                    >
                      Company Email
                      <span className="text-red-500">*</span>
                    </label>
                    <div className="text-red-500 text-xs mt-1">
                      {validateField(
                        `gstCompanyEmail-${roomIndex}-${travelerIndex}`,
                        traveler?.gstCompanyEmail,
                        "required|email"
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Third Row - Company Address (Full Width) */}
            <div className="flex flex-col sm:flex-row gap-8 sm:gap-4 items-center mt-4">
              <div className="w-full">
                <div className="relative w-full min-w-[50px] h-10">
                  <input
                    className="block px-2.5 pb-2.5 pt-2.5 w-full text-sm text-gray-900 bg-transparent rounded-lg border-1 border-gray-300 appearance-none dark:text-black dark:border-[#155EEF30] border-1 dark:focus:border-[#155EEF] focus:outline-none focus:ring-0 focus:border-[#155EEF]-600 border-2 peer"
                    placeholder=" "
                    id={`gstCompanyAddress-${roomIndex}-${travelerIndex}`}
                    name={`gstCompanyAddress-${roomIndex}-${travelerIndex}`}
                    type="text"
                    value={traveler?.gstCompanyAddress || ""}
                    onChange={(e) =>
                      handleTravelerInputChange(
                        roomIndex,
                        travelerIndex,
                        "gstCompanyAddress",
                        e.target.value
                      )
                    }
                  />
                  <label
                    htmlFor={`gstCompanyAddress-${roomIndex}-${travelerIndex}`}
                    className="absolute text-xs text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-white dark:bg-gray-900 px-2 peer-focus:px-2 peer-focus:text-[#155EEF] peer-focus:dark:text-[#155EEF] peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto start-1"
                  >
                    Company Address
                    <span className="text-red-500">*</span>
                  </label>
                  <div className="text-red-500 text-xs mt-1">
                    {isCorporateBooking &&
                      validateField(
                        `gstCompanyAddress-${roomIndex}-${travelerIndex}`,
                        traveler?.gstCompanyAddress,
                        "required"
                      )}
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </>
    );
  };

  const renderPassportIssueCountry = (
    passportIssueCountryCode,
    roomIndex,
    travelerIndex
  ) => {
    const selectedOption = countryOptions.find(
      (option) => option.value === passportIssueCountryCode
    );

    if (selectedOption)
      handleTravelerInputChange(
        roomIndex,
        travelerIndex,
        "passportIssueCountryCode",
        selectedOption
      );
    return selectedOption;
  };

  const renderPassportInputs = (
    roomIndex,
    travelerIndex,
    traveler,
    isPassportIssueDate,
    isPassportIssueCountry,
    inboundArrival
  ) => {
    return (
      <>
        <div className="text-lg text-[#171A19] font-semibold mt-3">
          Passport details
        </div>

        <div className="flex flex-col sm:flex-row gap-8 sm:gap-4 items-center mt-3">
          <div className="flex w-full gap-2 sm:gap-4">
            <div className="w-1/2 sm:w-1/2">
              <div className="relative w-full min-w-[50px] h-10">
                <input
                  className="block px-2.5 pb-2.5 pt-2.5 w-full text-sm text-gray-900 bg-transparent rounded-lg border-1 border-gray-300 appearance-none dark:text-black dark:border-[#155EEF30] border-1 dark:focus:border-[#155EEF] focus:outline-none focus:ring-0 focus:border-[#155EEF]-600 border-2 peer"
                  placeholder=" "
                  id={`passportNo-${roomIndex}-${travelerIndex}`}
                  name={`passportNo-${roomIndex}-${travelerIndex}`}
                  type="text"
                  maxLength={15}
                  value={traveler?.passportNo}
                  onChange={(e) =>
                    handleTravelerInputChange(
                      roomIndex,
                      travelerIndex,
                      "passportNo",
                      e.target.value
                    )
                  }
                />
                <label
                  htmlFor={`passportNo-${roomIndex}-${travelerIndex}`}
                  className="absolute text-xs text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-white dark:bg-gray-900 px-2 peer-focus:px-2 peer-focus:text-[#155EEF] peer-focus:dark:text-[#155EEF] peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto start-1"
                >
                  Passport number
                  <span className="text-red-500">*</span>
                </label>
                <div className="text-red-500 text-xs mt-1">
                  {validator.message(
                    `passportNo-${roomIndex}-${travelerIndex}`,
                    traveler?.passportNo,
                    "required|validPassportNumber"
                  )}
                </div>
              </div>
            </div>
            <div className="w-1/2 sm:w-1/2">
              <div className="relative w-full min-w-[50px] h-10">
                <input
                  className="block px-2.5 pb-2.5 pt-2.5 w-full text-sm text-gray-900 bg-transparent rounded-lg border-1 border-gray-300 appearance-none dark:text-black dark:border-[#155EEF30] border-1 dark:focus:border-[#155EEF] focus:outline-none focus:ring-0 focus:border-[#155EEF]-600 border-2 peer"
                  placeholder=" "
                  id={`passportExpiry-${roomIndex}-${travelerIndex}`}
                  name={`passportExpiry-${roomIndex}-${travelerIndex}`}
                  type="date"
                  value={traveler?.passportExpiry}
                  onChange={(e) =>
                    handleTravelerInputChange(
                      roomIndex,
                      travelerIndex,
                      "passportExpiry",
                      e.target.value
                    )
                  }
                  min="1900-01-01"
                  max="2100-12-31"
                />
                <label
                  htmlFor={`passportExpiry-${roomIndex}-${travelerIndex}`}
                  className="absolute text-xs text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-white dark:bg-gray-900 px-2 peer-focus:px-2 peer-focus:text-[#155EEF] peer-focus:dark:text-[#155EEF] peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto start-1"
                >
                  Passport expiry date
                  <span className="text-red-500">*</span>
                </label>
                <div className="text-red-500 text-xs mt-1">
                  {validator.message(
                    `passportExpiry-${roomIndex}-${travelerIndex}`,
                    traveler?.passportExpiry,
                    `required${
                      isPassportIssueDate
                        ? `|passportArrivalDateComparison:${traveler?.passportIssueDate}`
                        : ""
                    }${
                      travelCategory === "hotel"
                        ? ""
                        : `|passportArrivalComparison:${inboundArrival}`
                    }`
                  )}
                </div>
              </div>
            </div>
          </div>
          {(isPassportIssueCountry || isPassportIssueDate) && (
            <div className="flex w-full gap-2">
              {isPassportIssueCountry && (
                <div className="w-1/2 sm:w-1/2">
                  <div className="relative w-full min-w-[50px] h-10">
                    <Select
                      id={`passportIssueCountry-${roomIndex}-${travelerIndex}`}
                      name={`passportIssueCountry-${roomIndex}-${travelerIndex}`}
                      cacheOptions
                      defaultOptions
                      placeholder=" "
                      classNamePrefix="custom-select"
                      components={customComponents}
                      options={countryOptions}
                      value={
                        traveler?.passportIssueCountryCode?.label
                          ? traveler?.passportIssueCountryCode
                          : renderPassportIssueCountry(
                              traveler?.passportIssueCountryCode,
                              roomIndex,
                              travelerIndex
                            )
                      }
                      onChange={(selectedOption) =>
                        handleTravelerInputChange(
                          roomIndex,
                          travelerIndex,
                          "passportIssueCountryCode",
                          selectedOption
                        )
                      }
                      isSearchable
                      styles={{
                        control: (provided, state) => ({
                          ...provided,
                          backgroundColor: "transparent",
                          border: state.isFocused
                            ? "2px solid #155EEF" // Border color when focused
                            : "1px solid #155EEF50", // Default border color
                          boxShadow: "none",
                          borderRadius: "0.5rem", // Match input field's border radius
                          padding: "0.28rem 0.3rem", // Padding to align with the input's padding
                          fontSize: "0.875rem", // Match input field's font size
                        }),
                        placeholder: (provided) => ({
                          ...provided,
                          color: "#6B7280", // Text color for placeholder
                        }),
                        singleValue: (provided) => ({
                          ...provided,
                          color: "#111827", // Text color when selected
                        }),
                        indicatorSeparator: () => ({
                          display: "none", // Remove the separator between the select and dropdown arrow
                        }),
                        dropdownIndicator: (provided) => ({
                          ...provided,
                          color: "#155EEF", // Dropdown arrow color
                        }),
                        menu: (provided) => ({
                          ...provided,
                          zIndex: 1000, // Ensure dropdown is above other content
                        }),
                      }}
                    />
                    <label
                      htmlFor={`passportIssueCountry-${roomIndex}-${travelerIndex}`}
                      className="absolute text-xs text-nowrap text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-white dark:bg-gray-900 px-2 peer-focus:px-2 peer-focus:text-[#155EEF] peer-focus:dark:text-[#155EEF] peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto start-1"
                    >
                      Passport Issuing Country
                      <span className="text-red-500">*</span>
                    </label>
                    <div className="text-red-500 text-xs mt-1">
                      {isPassportIssueCountry &&
                        validator.message(
                          `passportIssueCountry-${roomIndex}-${travelerIndex}`,
                          traveler?.passportIssueCountryCode,
                          "required"
                        )}
                    </div>
                  </div>
                </div>
              )}
              {isPassportIssueDate && (
                <div className="w-1/2 sm:w-1/2">
                  <div className="relative w-full min-w-[50px] h-10">
                    <input
                      className="block px-2.5 pb-2.5 pt-2.5 w-full text-sm text-gray-900 bg-transparent rounded-lg border-1 border-gray-300 appearance-none dark:text-black dark:border-[#155EEF30] border-1 dark:focus:border-[#155EEF] focus:outline-none focus:ring-0 focus:border-[#155EEF]-600 border-2 peer"
                      placeholder=" "
                      id={`passportIssueDate-${roomIndex}-${travelerIndex}`}
                      name={`passportIssueDate-${roomIndex}-${travelerIndex}`}
                      type="date"
                      value={traveler?.passportIssueDate}
                      onChange={(e) =>
                        handleTravelerInputChange(
                          roomIndex,
                          travelerIndex,
                          "passportIssueDate",
                          e.target.value
                        )
                      }
                      min="1900-01-01"
                      max="2100-12-31"
                    />
                    <label
                      htmlFor={`passportIssueDate-${roomIndex}-${travelerIndex}`}
                      className="absolute text-xs text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-white dark:bg-gray-900 px-2 peer-focus:px-2 peer-focus:text-[#155EEF] peer-focus:dark:text-[#155EEF] peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto start-1"
                    >
                      Passport issue date
                      <span className="text-red-500">*</span>
                    </label>
                    <div className="text-red-500 text-xs mt-1">
                      {isPassportIssueDate &&
                        validator.message(
                          `passportIssueDate-${roomIndex}-${travelerIndex}`,
                          traveler?.passportIssueDate,
                          "required|validIssueDate"
                        )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </>
    );
  };

  const loadOptions = async (inputValue, roomIndex, travelerIndex) => {
    try {
      const countryCode =
        travelCategory === "hotel"
          ? travelerDetails?.[roomIndex]?.[travelerIndex]?.countryCode
          : travelerDetails?.[travelerIndex]?.countryCode;
      console.log("roomIndex", roomIndex);
      if (inputValue) {
        const cities = await getCityByCountry(inputValue, countryCode);
        const options = cities.map((city) => ({
          value: city.id,
          label: city.cityname,
        }));
        return options;
      } else {
        return [];
      }
    } catch (error) {
      return [];
    }
  };

  const customComponents = {
    IndicatorSeparator: () => null,
    DropdownIndicator: (props) => (
      <div className="px-2 text-[#155EEF]">
        <svg
          width="12"
          height="8"
          viewBox="0 0 12 8"
          fill="none"
          style={{
            transform: props.selectProps.menuIsOpen
              ? "rotate(180deg)"
              : "rotate(0deg)",
            transition: "transform 0.2s ease",
          }}
        >
          <path
            d="M1 1.5L6 6.5L11 1.5"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
    ),
  };

  const isValidInput = (inputValue) => {
    const regex = /^[a-zA-Z\s]*$/;
    return regex.test(inputValue);
  };

  let adultCounter = 1;
  let childCounter = 1;
  let infantCounter = 1;

  console.log("traveler details", travelerDetails);
  return (
    <div className="bg-white p-4 rounded-lg mt-2">
      <div className="flex flex-col">
        <span className="text-lg text-[#171A19] font-semibold">
          Travelers Details
        </span>
      </div>
      {/* traveler tabs */}
      {travelCategory === "flights" ? (
        travelerDetails.map((traveler, travelerIndex) => {
          let label = "";

          if (traveler.paxType === "1") {
            label = `Adult ${adultCounter}`;
            adultCounter++;
          } else if (traveler.paxType === "2") {
            label = `Child ${childCounter}`;
            childCounter++;
          } else if (traveler.paxType === "3") {
            label = `Infant ${infantCounter}`;
            infantCounter++;
          }

          const isDobRequired =
            isPassportRequiredAtBook ||
            traveler.paxType === "2" ||
            traveler.paxType === "3";

          return (
            <div
              key={`traveler-0-${travelerIndex}`}
              className={`py-4 ${
                travelerIndex < travelerDetails.length - 1 &&
                "border-b border-[#171A1930]"
              }`}
            >
              <div className="flex items-center gap-2 justify-between mb-3">
                <div className="w-fit p-2 rounded-xl text-[#155EEF] bg-[#155EEF0D] font-medium text-base">
                  {label}
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      handleSelectMasterPassenger(
                        0,
                        travelerIndex,
                        traveler.passengerType || "adult"
                      )
                    }
                    className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors flex items-center gap-1.5 ${
                      isLoggedIn
                        ? "text-cyan-600 bg-cyan-50 hover:bg-cyan-100 cursor-pointer"
                        : "text-gray-400 bg-gray-100 cursor-not-allowed"
                    }`}
                    title={
                      !isLoggedIn
                        ? "Login to use this feature"
                        : "Load saved passenger"
                    }
                  >
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4"
                      />
                    </svg>
                    Load Saved
                    {!isLoggedIn && <i className="bi bi-lock-fill text-xs"></i>}
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      handleSaveMasterPassenger(
                        0,
                        travelerIndex,
                        traveler.passengerType || "adult"
                      )
                    }
                    className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors flex items-center gap-1.5 ${
                      isLoggedIn
                        ? "text-green-600 bg-green-50 hover:bg-green-100 cursor-pointer"
                        : "text-gray-400 bg-gray-100 cursor-not-allowed"
                    }`}
                    title={
                      !isLoggedIn
                        ? "Login to use this feature"
                        : "Save passenger for future"
                    }
                  >
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4"
                      />
                    </svg>
                    Save
                    {!isLoggedIn && <i className="bi bi-lock-fill text-xs"></i>}
                  </button>
                </div>
              </div>

              <div className="flex gap-2 sm:gap-4 items-center mt-3">
                <div className="w-[35%] sm:w-1/5">
                  <div
                    className={`relative w-full min-w-[50px] h-10 ${
                      focusedField === "title" ? "z-50" : "z-40"
                    }`}
                  >
                    <Select
                      ref={(el) =>
                        (inputRefs.current[`title-0-${travelerIndex}`] = el)
                      }
                      name={`title-0-${travelerIndex}`}
                      cacheOptions
                      defaultOptions
                      placeholder=" "
                      value={traveler.title}
                      onChange={(selectedOption) =>
                        handleTravelerInputChange(
                          0,
                          travelerIndex,
                          "title",
                          selectedOption
                        )
                      }
                      options={titleOptions}
                      classNamePrefix="custom-select"
                      components={customComponents}
                      isSearchable
                      onFocus={() => handleFocus("title")}
                      onBlur={handleBlur}
                      styles={{
                        control: (provided, state) => ({
                          ...provided,
                          backgroundColor: "transparent",
                          border: state.isFocused
                            ? "2px solid #155EEF"
                            : "1px solid #155EEF50",
                          boxShadow: "none",
                          borderRadius: "0.5rem",
                          padding: "0.28rem 0.3rem",
                          fontSize: "0.875rem",
                          cursor: "pointer",
                        }),
                        placeholder: (provided) => ({
                          ...provided,
                          color: "#6B7280",
                        }),
                        singleValue: (provided) => ({
                          ...provided,
                          color: "#111827",
                        }),
                        indicatorSeparator: () => ({
                          display: "none",
                        }),
                        dropdownIndicator: (provided) => ({
                          ...provided,
                          color: "#155EEF",
                        }),
                      }}
                    />

                    <label
                      htmlFor="gender"
                      className="absolute text-sm text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-white dark:bg-gray-900 px-2 peer-focus:px-2 peer-focus:text-[#155EEF] peer-focus:dark:text-[#155EEF] peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto start-1"
                    >
                      Title <span className="text-red-500">*</span>
                    </label>
                    <div className="text-red-500 text-xs mt-1">
                      {validator.message(
                        `title-0-${travelerIndex}`,
                        traveler.title?.value,
                        "required"
                      )}
                    </div>
                  </div>
                </div>
                <div className="w-1/2">
                  <div className="relative w-full min-w-[50px] h-10">
                    <input
                      ref={(el) =>
                        (inputRefs.current[`firstName-0-${travelerIndex}`] = el)
                      }
                      name={`firstName-0-${travelerIndex}`}
                      className="block cursor-pointer px-2.5 pb-2.5 pt-2.5 w-full text-sm text-gray-900 bg-transparent rounded-lg border-1 border-gray-300 appearance-none dark:text-black dark:border-[#155EEF30] border-1 dark:focus:border-[#155EEF] focus:outline-none focus:ring-0 focus:border-[#155EEF]-600 border-2 peer"
                      placeholder=" "
                      id={`firstname-0-${travelerIndex}`}
                      type="text"
                      value={traveler.firstName}
                      onChange={(e) =>
                        handleTravelerInputChange(
                          0,
                          travelerIndex,
                          "firstName",
                          e.target.value.replace(/[^A-Za-z ]/g, "")
                        )
                      }
                      maxLength={33}
                      autoComplete="off"
                    />
                    <label
                      htmlFor={`firstname-0-${travelerIndex}`}
                      className="absolute text-sm text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-white dark:bg-gray-900 px-2 peer-focus:px-2 peer-focus:text-[#155EEF] peer-focus:dark:text-[#155EEF] peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto start-1"
                    >
                      First Name <span className="text-red-500">*</span>
                    </label>
                    <div className="text-red-500 text-xs mt-1">
                      {validator.message(
                        `firstName-0-${travelerIndex}`,
                        traveler.firstName,
                        "required|min:1|max:33"
                      )}
                    </div>
                  </div>
                </div>

                <div className="w-1/2">
                  <div className="relative w-full min-w-[50px] h-10 ">
                    <input
                      ref={(el) =>
                        (inputRefs.current[`lastName-0-${travelerIndex}`] = el)
                      }
                      name={`lastName-0-${travelerIndex}`}
                      className="block cursor-pointer  px-2.5 pb-2.5 pt-2.5 w-full text-sm text-gray-900 bg-transparent rounded-lg border-1 border-gray-300 appearance-none dark:text-black dark:border-[#155EEF30] border-1 dark:focus:border-[#155EEF] focus:outline-none focus:ring-0 focus:border-[#155EEF]-600 border-2 peer"
                      placeholder=" "
                      id={`lastname-0-${travelerIndex}`}
                      type="text"
                      value={traveler.lastName}
                      onChange={(e) =>
                        handleTravelerInputChange(
                          0,
                          travelerIndex,
                          "lastName",
                          e.target.value.replace(/[^A-Za-z ]/g, "")
                        )
                      }
                      maxLength={50}
                      autoComplete="off"
                    />
                    <label
                      htmlFor={`lastname-0-${travelerIndex}`}
                      className="absolute text-sm text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-white dark:bg-gray-900 px-2 peer-focus:px-2 peer-focus:text-[#155EEF] peer-focus:dark:text-[#155EEF] peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto start-1"
                    >
                      Last Name <span className="text-red-500">*</span>
                    </label>
                    <div className="text-red-500 text-xs mt-1">
                      {validator.message(
                        `lastname-0-${travelerIndex}`,
                        traveler.lastName,
                        "required|min:2|max:50"
                      )}
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex gap-2 sm:gap-4 items-center mt-5">
                {/* Email Field */}
                {travelerIndex === 0 && (
                  <div className="w-1/2">
                    <div className="relative w-full min-w-[50px] h-10">
                      <input
                        ref={(el) =>
                          (inputRefs.current[`email-0-${travelerIndex}`] = el)
                        }
                        name={`email-0-${travelerIndex}`}
                        className="block cursor-pointer px-2.5 pb-2.5 pt-2.5 w-full text-sm text-gray-900 bg-transparent rounded-lg border-1 border-gray-300 appearance-none dark:text-black dark:border-[#155EEF30] border-1 dark:focus:border-[#155EEF] focus:outline-none focus:ring-0 focus:border-[#155EEF]-600 border-2 peer"
                        placeholder=" "
                        id={`email-0-${travelerIndex}`}
                        type="email"
                        value={traveler.email}
                        onChange={(e) =>
                          handleTravelerInputChange(
                            0,
                            travelerIndex,
                            "email",
                            e.target.value
                          )
                        }
                        autoComplete="email"
                      />
                      <label
                        htmlFor={`email-0-${travelerIndex}`}
                        className="absolute text-sm text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-white dark:bg-gray-900 px-2 peer-focus:px-2 peer-focus:text-[#155EEF] peer-focus:dark:text-[#155EEF] peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto start-1"
                      >
                        Email <span className="text-red-500">*</span>
                      </label>
                      <div className="text-red-500 text-xs mt-1">
                        {validator.message(
                          `email-0-${travelerIndex}`,
                          traveler.email,
                          "required|email"
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Date of Birth Field */}
                <div className="w-1/2">
                  <div className="relative w-full min-w-[50px] h-10">
                    <input
                      ref={(el) =>
                        (inputRefs.current[`dateOfBirth-0-${travelerIndex}`] =
                          el)
                      }
                      name={`dateOfBirth-0-${travelerIndex}`}
                      className="block cursor-pointer px-2.5 pb-2.5 pt-2.5 w-full text-sm text-gray-900 bg-transparent rounded-lg border-1 border-gray-300 appearance-none dark:text-black dark:border-[#155EEF30] border-1 dark:focus:border-[#155EEF] focus:outline-none focus:ring-0 focus:border-[#155EEF]-600 border-2 peer"
                      placeholder=" "
                      id={`dateOfBirth-0-${travelerIndex}`}
                      type="date"
                      value={traveler.dateOfBirth || ""}
                      onChange={(e) =>
                        handleTravelerInputChange(
                          0,
                          travelerIndex,
                          "dateOfBirth",
                          e.target.value
                        )
                      }
                      max={new Date().toISOString().split("T")[0]}
                      autoComplete="bday"
                    />
                    <label
                      htmlFor={`dateOfBirth-0-${travelerIndex}`}
                      className="absolute text-sm text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-white dark:bg-gray-900 px-2 peer-focus:px-2 peer-focus:text-[#155EEF] peer-focus:dark:text-[#155EEF] peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto start-1"
                    >
                      Date of Birth
                      {isDobRequired && <span className="text-red-500">*</span>}
                    </label>
                    <div className="text-red-500 text-xs mt-1">
                      {isDobRequired &&
                        validator.message(
                          `dateOfBirth-0-${travelerIndex}`,
                          traveler.dateOfBirth,
                          "required"
                        )}
                    </div>
                  </div>
                </div>
              </div>

              {renderPanFields(0, travelerIndex, traveler, "PAN")}
              {renderPassportFields(
                0,
                travelerIndex,
                traveler
                // inboundArrival
              )}
              {travelerIndex === 0 && (
                <div>
                  <div className="flex gap-2 sm:gap-4 items-center mt-5">
                    <div className="w-1/2 sm:w-1/3">
                      <div
                        className={`relative w-full min-w-[50px] h-10 ${
                          focusedField === "country" ? "z-50" : "z-40"
                        }`}
                      >
                        <Select
                          ref={(el) =>
                            (inputRefs.current[`country-0-${travelerIndex}`] =
                              el)
                          }
                          name={`country-0-${travelerIndex}`}
                          cacheOptions
                          defaultOptions
                          placeholder=" "
                          id={`country-0-${travelerIndex}`}
                          classNamePrefix="custom-select"
                          components={customComponents}
                          isSearchable
                          onFocus={() => handleFocus("country")}
                          onBlur={handleBlur}
                          value={traveler.countryName}
                          onChange={(selectedOption) =>
                            handleTravelerInputChange(
                              0,
                              travelerIndex,
                              "countryCode",
                              selectedOption
                            )
                          }
                          options={countryOptions}
                          styles={{
                            control: (provided, state) => ({
                              ...provided,
                              backgroundColor: "transparent",
                              border: state.isFocused
                                ? "2px solid #155EEF"
                                : "1px solid #155EEF50",
                              boxShadow: "none",
                              borderRadius: "0.5rem",
                              padding: "0.28rem 0.3rem",
                              fontSize: "0.875rem",
                              cursor: "pointer",
                            }),
                            placeholder: (provided) => ({
                              ...provided,
                              color: "#6B7280",
                            }),
                            singleValue: (provided) => ({
                              ...provided,
                              color: "#111827",
                            }),
                            indicatorSeparator: () => ({
                              display: "none",
                            }),
                            dropdownIndicator: (provided) => ({
                              ...provided,
                              color: "#155EEF",
                            }),
                          }}
                        />
                        <label
                          htmlFor={`country-0-${travelerIndex}`}
                          className="absolute text-sm text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-white dark:bg-gray-900 px-2 peer-focus:px-2 peer-focus:text-[#155EEF] peer-focus:dark:text-[#155EEF] peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto start-1"
                        >
                          Country <span className="text-red-500">*</span>
                        </label>
                        <div className="text-red-500 text-xs mt-1">
                          {validator.message(
                            `country-0-${travelerIndex}`,
                            traveler.countryName?.value,
                            "required"
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="w-1/2 sm:w-1/3">
                      <div className="relative w-full min-w-[50px] z-50 h-10">
                        <AsyncSelect
                          ref={(el) =>
                            (inputRefs.current[`city-0-${travelerIndex}`] = el)
                          }
                          name={`city-0-${travelerIndex}`}
                          cacheOptions
                          defaultOptions
                          placeholder=" "
                          id={`city-0-${travelerIndex}`}
                          classNamePrefix="custom-select"
                          components={customComponents}
                          isSearchable
                          loadOptions={(inputValue) =>
                            loadOptions(inputValue, 0, travelerIndex)
                          }
                          value={traveler.city}
                          onChange={(selectedOption) =>
                            handleTravelerInputChange(
                              0,
                              travelerIndex,
                              "city",
                              selectedOption
                            )
                          }
                          styles={{
                            control: (provided, state) => ({
                              ...provided,
                              backgroundColor: "transparent",
                              border: state.isFocused
                                ? "2px solid #155EEF"
                                : "1px solid #155EEF50",
                              boxShadow: "none",
                              borderRadius: "0.5rem",
                              padding: "0.28rem 0.3rem",
                              fontSize: "0.875rem",
                              cursor: "pointer",
                            }),
                            placeholder: (provided) => ({
                              ...provided,
                              color: "#6B7280",
                            }),
                            singleValue: (provided) => ({
                              ...provided,
                              color: "#111827",
                            }),
                            indicatorSeparator: () => ({
                              display: "none",
                            }),
                            dropdownIndicator: (provided) => ({
                              ...provided,
                              color: "#155EEF",
                            }),
                          }}
                        />
                        <label
                          htmlFor={`city-0-${travelerIndex}`}
                          className="absolute text-sm text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-white dark:bg-gray-900 px-2 peer-focus:px-2 peer-focus:text-[#155EEF] peer-focus:dark:text-[#155EEF] peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto start-1"
                        >
                          City <span className="text-red-500">*</span>
                        </label>

                        <div className="text-red-500 text-xs mt-1">
                          {validator.message(
                            `city-0-${travelerIndex}`,
                            traveler.city?.value,
                            "required"
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="hidden sm:flex space-x-2 w-1/3">
                      <div className="w-[80%]">
                        <div className="relative w-full min-w-[50px] h-10">
                          <input
                            ref={(el) =>
                              (inputRefs.current[`contact-0-${travelerIndex}`] =
                                el)
                            }
                            name={`contact-0-${travelerIndex}`}
                            className="block cursor-pointer px-2.5 pb-2.5 pt-2.5 w-full text-sm text-gray-900 bg-transparent rounded-lg border-1 border-gray-300 appearance-none dark:text-black dark:border-[#155EEF30] border-1 dark:focus:border-[#155EEF] focus:outline-none focus:ring-0 focus:border-[#155EEF]-600 border-2 peer"
                            placeholder=" "
                            id={`contact-0-${travelerIndex}`}
                            type="text"
                            value={traveler.contactNo}
                            maxLength={10}
                            onChange={(e) =>
                              handleTravelerInputChange(
                                0,
                                travelerIndex,
                                "contactNo",
                                e.target.value.replace(/[^0-9]/g, "")
                              )
                            }
                            autoComplete="off"
                          />
                          <label
                            htmlFor={`contact-0-${travelerIndex}`}
                            className="absolute text-sm text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-4 scale-75 top-2 z-9 origin-[0] bg-white dark:bg-gray-900 px-2 peer-focus:px-2 peer-focus:text-[#155EEF] peer-focus:dark:text-[#155EEF] peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto start-1"
                          >
                            Contact number{" "}
                            <span className="text-red-500">*</span>
                          </label>
                          <div className="text-red-500 text-xs mt-1">
                            {validator.message(
                              `contact-0-${travelerIndex}`,
                              traveler.contactNo,
                              `required|${
                                traveler.nationality === "IN"
                                  ? "validMobile"
                                  : "validMobileIntl|min:10|max:10"
                              }`
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="sm:hidden space-x-2 mt-5 w-full">
                    <div className="w-[100%]">
                      <div className="relative w-full min-w-[50px] h-10">
                        <input
                          ref={(el) =>
                            (inputRefs.current[`contact-0-${travelerIndex}`] =
                              el)
                          }
                          name={`contact-0-${travelerIndex}`}
                          className="block cursor-pointer px-2.5 pb-2.5 pt-2.5 w-full text-sm text-gray-900 bg-transparent rounded-lg border-1 border-gray-300 appearance-none dark:text-black dark:border-[#155EEF30] border-1 dark:focus:border-[#155EEF] focus:outline-none focus:ring-0 focus:border-[#155EEF]-600 border-2 peer"
                          placeholder=" "
                          id={`contact-0-${travelerIndex}`}
                          type="text"
                          value={traveler.contactNo}
                          maxLength={10}
                          onChange={(e) =>
                            handleTravelerInputChange(
                              0,
                              travelerIndex,
                              "contactNo",
                              e.target.value.replace(/[^0-9]/g, "")
                            )
                          }
                          autoComplete="off"
                        />
                        <label
                          htmlFor={`contact-0-${travelerIndex}`}
                          className="absolute text-sm text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-4 scale-75 top-2 z-9 origin-[0] bg-white dark:bg-gray-900 px-2 peer-focus:px-2 peer-focus:text-[#155EEF] peer-focus:dark:text-[#155EEF] peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto start-1"
                        >
                          Contact number <span className="text-red-500">*</span>
                        </label>
                        <div className="text-red-500 text-xs mt-1">
                          {validator.message(
                            `contact-0-${travelerIndex}`,
                            traveler.contactNo,
                            `required|${
                              traveler.nationality === "IN"
                                ? "validMobile"
                                : "validMobileIntl|min:10|max:10"
                            }`
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div>
                    <div className="flex flex-col sm:flex-row gap-2 items-center mt-5">
                      <div className="w-full sm:w-1/2">
                        <div className="relative w-full min-w-[50px] h-10">
                          <input
                            ref={(el) =>
                              (inputRefs.current[
                                `address1-0-${travelerIndex}`
                              ] = el)
                            }
                            name={`address1-0-${travelerIndex}`}
                            className="block cursor-pointer px-2.5 pb-2.5 pt-2.5 w-full text-sm text-gray-900 bg-transparent rounded-lg border-1 border-gray-300 appearance-none dark:text-black dark:border-[#155EEF30] border-1 dark:focus:border-[#155EEF] focus:outline-none focus:ring-0 focus:border-[#155EEF]-600 border-2 peer"
                            placeholder=" "
                            id={`address1-0-${travelerIndex}`}
                            type="text"
                            value={traveler.addressLine1 || null}
                            onChange={(e) =>
                              handleTravelerInputChange(
                                0,
                                travelerIndex,
                                "addressLine1",
                                e.target.value
                              )
                            }
                            maxLength={255}
                            autoComplete="off"
                          />
                          <label
                            htmlFor={`address1-0-${travelerIndex}`}
                            className="absolute text-sm text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-white dark:bg-gray-900 px-2 peer-focus:px-2 peer-focus:text-[#155EEF] peer-focus:dark:text-[#155EEF] peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto start-1"
                          >
                            Address 1
                            {/* <span className="text-red-500">*</span> */}
                          </label>
                          <div className="text-red-500 text-xs mt-1">
                            {/* {validator.message(
                              `address1-0-${travelerIndex}`,
                              traveler.addressLine1,
                              "required|min:3|max:255"
                            )} */}
                          </div>
                        </div>
                      </div>

                      <div className="w-full sm:w-1/2">
                        <div className="relative w-full min-w-[50px] h-10">
                          <input
                            className="block cursor-pointer px-2.5 pb-2.5 pt-2.5 w-full text-sm text-gray-900 bg-transparent rounded-lg border-1 border-gray-300 appearance-none dark:text-black dark:border-[#155EEF30] border-1 dark:focus:border-[#155EEF] focus:outline-none focus:ring-0 focus:border-[#155EEF]-600 border-2 peer"
                            placeholder=" "
                            id={`address2-0-${travelerIndex}`}
                            type="text"
                            value={traveler.addressLine2}
                            onChange={(e) =>
                              handleTravelerInputChange(
                                0,
                                travelerIndex,
                                "addressLine2",
                                e.target.value
                              )
                            }
                            maxLength={255}
                            autoComplete="off"
                          />
                          <label
                            htmlFor={`address2-0-${travelerIndex}`}
                            className="absolute text-sm text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-white dark:bg-gray-900 px-2 peer-focus:px-2 peer-focus:text-[#155EEF] peer-focus:dark:text-[#155EEF] peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto start-1"
                          >
                            Address 2
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {renderGuardianFields(0, travelerIndex, traveler)}

              <div className="flex flex-col sm:flex-row gap-2 items-center mt-3">
                {renderFrequentFlyerFields(0, travelerIndex, traveler)}
              </div>

              <div className="block">
                {travelerIndex === 0 &&
                  renderGSTDetails(
                    0,
                    travelerIndex,
                    traveler,
                    traveler.gstCompanyAddress
                  )}
              </div>
            </div>
          );
        })
      ) : (
        <div>
          {" "}
          {travelerDetails.length > 0 && travelCategory !== "flights" ? (
            <div>
              {travelerDetails.map((roomTravelers, roomIndex) => (
                <div key={`room-${roomIndex}`} className="mb-6">
                  {/* Room Header */}
                  <div className="w-fit px-3 py-1 mb-3 rounded-xl font-semibold text-[#155EEF] bg-[#155EEF0D] text-lg">
                    {`Room ${roomIndex + 1}`}
                  </div>
                  {roomTravelers.map((traveler, travelerIdx) => {
                    // Determine traveler label dynamically
                    let label = "";
                    if (traveler.type === "adult") {
                      label = `Adult ${traveler.occupantIndex + 1}`;
                    } else if (traveler.type === "child") {
                      label = `Child ${traveler.occupantIndex + 1}${
                        traveler.age ? ` (${traveler.age} yrs)` : ""
                      }`;
                    } else if (traveler.type === "infant") {
                      label = `Infant ${traveler.occupantIndex + 1}`;
                    }
                    return (
                      <div
                        key={`traveler-${roomIndex}-${travelerIdx}`}
                        className={`py-4 ${
                          travelerIdx < roomTravelers.length - 1 &&
                          "border-b border-[#171A1930]"
                        }`}
                      >
                        <div className="flex items-center gap-2 justify-between mb-2">
                          <div className="w-fit p-2 rounded-xl text-[#155EEF] bg-[#155EEF0D] font-medium text-base">
                            {label}
                          </div>
                          <div className="flex gap-2">
                            <button
                              type="button"
                              onClick={() =>
                                handleSelectMasterPassenger(
                                  roomIndex,
                                  travelerIdx,
                                  traveler.type
                                )
                              }
                              className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors flex items-center gap-1.5 ${
                                isLoggedIn
                                  ? "text-cyan-600 bg-cyan-50 hover:bg-cyan-100 cursor-pointer"
                                  : "text-gray-400 bg-gray-100 cursor-not-allowed"
                              }`}
                              title={
                                !isLoggedIn
                                  ? "Login to use this feature"
                                  : "Load saved passenger"
                              }
                            >
                              <svg
                                className="w-4 h-4"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4"
                                />
                              </svg>
                              Load Saved
                              {!isLoggedIn && (
                                <i className="bi bi-lock-fill text-xs"></i>
                              )}
                            </button>
                            <button
                              type="button"
                              onClick={() =>
                                handleSaveMasterPassenger(
                                  roomIndex,
                                  travelerIdx,
                                  traveler.type
                                )
                              }
                              className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors flex items-center gap-1.5 ${
                                isLoggedIn
                                  ? "text-green-600 bg-green-50 hover:bg-green-100 cursor-pointer"
                                  : "text-gray-400 bg-gray-100 cursor-not-allowed"
                              }`}
                              title={
                                !isLoggedIn
                                  ? "Login to use this feature"
                                  : "Save passenger for future"
                              }
                            >
                              <svg
                                className="w-4 h-4"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4"
                                />
                              </svg>
                              Save
                              {!isLoggedIn && (
                                <i className="bi bi-lock-fill text-xs"></i>
                              )}
                            </button>
                          </div>
                        </div>

                        {/* Title Field */}
                        <div className="flex gap-2 sm:gap-4 items-center mt-3">
                          <div className="w-[35%] sm:w-1/5">
                            <div
                              className={`relative w-full min-w-[50px] h-10 ${
                                focusedField === "title" ? "z-50" : "z-40"
                              }`}
                            >
                              <Select
                                ref={(el) =>
                                  (inputRefs.current[
                                    `title-${roomIndex}-${travelerIdx}`
                                  ] = el)
                                }
                                name={`title-${roomIndex}-${travelerIdx}`}
                                cacheOptions
                                defaultOptions
                                placeholder=" "
                                value={traveler.title}
                                onChange={(selectedOption) =>
                                  handleTravelerInputChange(
                                    roomIndex,
                                    travelerIdx,
                                    "title",
                                    selectedOption
                                  )
                                }
                                options={titleOptions}
                                classNamePrefix="custom-select"
                                components={customComponents}
                                isSearchable
                                onFocus={() => handleFocus("title")}
                                onBlur={handleBlur}
                                styles={{
                                  control: (provided, state) => ({
                                    ...provided,
                                    backgroundColor: "transparent",
                                    border: state.isFocused
                                      ? "2px solid #155EEF"
                                      : "1px solid #155EEF50",
                                    boxShadow: "none",
                                    borderRadius: "0.5rem",
                                    padding: "0.28rem 0.3rem",
                                    fontSize: "0.875rem",
                                    cursor: "pointer",
                                  }),
                                  placeholder: (provided) => ({
                                    ...provided,
                                    color: "#6B7280",
                                  }),
                                  singleValue: (provided) => ({
                                    ...provided,
                                    color: "#111827",
                                  }),
                                  indicatorSeparator: () => ({
                                    display: "none",
                                  }),
                                  dropdownIndicator: (provided) => ({
                                    ...provided,
                                    color: "#155EEF",
                                  }),
                                }}
                              />
                              <label
                                htmlFor={`title-${roomIndex}-${travelerIdx}`}
                                className="absolute text-sm text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-white dark:bg-gray-900 px-2 peer-focus:px-2 peer-focus:text-[#155EEF] peer-focus:dark:text-[#155EEF] peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto start-1"
                              >
                                Title <span className="text-red-500">*</span>
                              </label>
                              <div className="text-red-500 text-xs mt-1">
                                {validator.message(
                                  `title-${roomIndex}-${travelerIdx}`,
                                  traveler.title,
                                  "required"
                                )}
                              </div>
                            </div>
                          </div>

                          {/* First Name Field */}
                          <div className="w-1/2">
                            <div className="relative w-full min-w-[50px] h-10">
                              <input
                                ref={(el) =>
                                  (inputRefs.current[
                                    `firstName-${roomIndex}-${travelerIdx}`
                                  ] = el)
                                }
                                name={`firstName-${roomIndex}-${travelerIdx}`}
                                className="block cursor-pointer px-2.5 pb-2.5 pt-2.5 w-full text-sm text-gray-900 bg-transparent rounded-lg border-1 border-gray-300 appearance-none dark:text-black dark:border-[#155EEF30] border-1 dark:focus:border-[#155EEF] focus:outline-none focus:ring-0 focus:border-[#155EEF]-600 border-2 peer"
                                placeholder=" "
                                id={`firstname-${roomIndex}-${travelerIdx}`}
                                type="text"
                                value={traveler.firstName}
                                onChange={(e) =>
                                  handleTravelerInputChange(
                                    roomIndex,
                                    travelerIdx,
                                    "firstName",
                                    e.target.value.replace(/[^A-Za-z ]/g, "")
                                  )
                                }
                                maxLength={33}
                                autoComplete="off"
                              />
                              <label
                                htmlFor={`firstname-${roomIndex}-${travelerIdx}`}
                                className="absolute text-sm text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-white dark:bg-gray-900 px-2 peer-focus:px-2 peer-focus:text-[#155EEF] peer-focus:dark:text-[#155EEF] peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto start-1"
                              >
                                First Name{" "}
                                <span className="text-red-500">*</span>
                              </label>
                              <div className="text-red-500 text-xs mt-1">
                                {validator.message(
                                  `firstName-${roomIndex}-${travelerIdx}`,
                                  traveler.firstName,
                                  "required|min:1|max:33"
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Last Name Field */}
                          <div className="w-1/2">
                            <div className="relative w-full min-w-[50px] h-10">
                              <input
                                ref={(el) =>
                                  (inputRefs.current[
                                    `lastName-${roomIndex}-${travelerIdx}`
                                  ] = el)
                                }
                                name={`lastName-${roomIndex}-${travelerIdx}`}
                                className="block cursor-pointer px-2.5 pb-2.5 pt-2.5 w-full text-sm text-gray-900 bg-transparent rounded-lg border-1 border-gray-300 appearance-none dark:text-black dark:border-[#155EEF30] border-1 dark:focus:border-[#155EEF] focus:outline-none focus:ring-0 focus:border-[#155EEF]-600 border-2 peer"
                                placeholder=" "
                                id={`lastname-${roomIndex}-${travelerIdx}`}
                                type="text"
                                value={traveler.lastName}
                                onChange={(e) =>
                                  handleTravelerInputChange(
                                    roomIndex,
                                    travelerIdx,
                                    "lastName",
                                    e.target.value.replace(/[^A-Za-z ]/g, "")
                                  )
                                }
                                maxLength={50}
                                autoComplete="off"
                              />
                              <label
                                htmlFor={`lastname-${roomIndex}-${travelerIdx}`}
                                className="absolute text-sm text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-white dark:bg-gray-900 px-2 peer-focus:px-2 peer-focus:text-[#155EEF] peer-focus:dark:text-[#155EEF] peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto start-1"
                              >
                                Last Name{" "}
                                <span className="text-red-500">*</span>
                              </label>
                              <div className="text-red-500 text-xs mt-1">
                                {validator.message(
                                  `lastName-${roomIndex}-${travelerIdx}`,
                                  traveler.lastName,
                                  "required|min:2|max:50"
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Child's Age Field (visible only for children) */}
                          {traveler.type === "child" && (
                            <div className="w-1/5">
                              <div className="relative w-full min-w-[50px] h-10">
                                <input
                                  name={`age-${roomIndex}-${travelerIdx}`}
                                  className="block cursor-pointer px-2.5 pb-2.5 pt-2.5 w-full text-sm text-gray-900 bg-transparent rounded-lg border-1 border-gray-300 appearance-none dark:text-black dark:border-[#155EEF30] border-1 dark:focus:border-[#155EEF] focus:outline-none focus:ring-0 focus:border-[#155EEF]-600 border-2 peer"
                                  placeholder=" "
                                  id={`age-${roomIndex}-${travelerIdx}`}
                                  type="number"
                                  value={traveler.age ?? ""}
                                  disabled
                                />
                                <label
                                  htmlFor={`age-${roomIndex}-${travelerIdx}`}
                                  className="absolute text-sm text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-white dark:bg-gray-900 px-2 peer-focus:px-2 peer-focus:text-[#155EEF] peer-focus:dark:text-[#155EEF] peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto start-1"
                                >
                                  Age
                                </label>
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Email Field (only for first traveler in first room) */}
                        {roomIndex === 0 && travelerIdx === 0 && (
                          <div className="flex gap-2 sm:gap-4 items-center mt-3">
                            <div className="w-1/2">
                              <div className="relative w-full min-w-[50px] h-10">
                                <input
                                  ref={(el) =>
                                    (inputRefs.current[
                                      `email-${roomIndex}-${travelerIdx}`
                                    ] = el)
                                  }
                                  name={`email-${roomIndex}-${travelerIdx}`}
                                  className="block cursor-pointer px-2.5 pb-2.5 pt-2.5 w-full text-sm text-gray-900 bg-transparent rounded-lg border-1 border-gray-300 appearance-none dark:text-black dark:border-[#155EEF30] border-1 dark:focus:border-[#155EEF] focus:outline-none focus:ring-0 focus:border-[#155EEF]-600 border-2 peer"
                                  placeholder=" "
                                  id={`email-${roomIndex}-${travelerIdx}`}
                                  type="email"
                                  value={traveler.email}
                                  onChange={(e) =>
                                    handleTravelerInputChange(
                                      roomIndex,
                                      travelerIdx,
                                      "email",
                                      e.target.value
                                    )
                                  }
                                  autoComplete="email"
                                />
                                <label
                                  htmlFor={`email-${roomIndex}-${travelerIdx}`}
                                  className="absolute text-sm text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-white dark:bg-gray-900 px-2 peer-focus:px-2 peer-focus:text-[#155EEF] peer-focus:dark:text-[#155EEF] peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto start-1"
                                >
                                  Email <span className="text-red-500">*</span>
                                </label>
                                <div className="text-red-500 text-xs mt-1">
                                  {validator.message(
                                    `email-${roomIndex}-${travelerIdx}`,
                                    traveler.email,
                                    "required|email"
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Date of Birth Field */}
                        <div className="flex gap-2 sm:gap-4 items-center mt-3">
                          <div className="w-1/2">
                            <div className="relative w-full min-w-[50px] h-10">
                              <input
                                ref={(el) =>
                                  (inputRefs.current[
                                    `dateOfBirth-${roomIndex}-${travelerIdx}`
                                  ] = el)
                                }
                                name={`dateOfBirth-${roomIndex}-${travelerIdx}`}
                                className="block cursor-pointer px-2.5 pb-2.5 pt-2.5 w-full text-sm text-gray-900 bg-transparent rounded-lg border-1 border-gray-300 appearance-none dark:text-black dark:border-[#155EEF30] border-1 dark:focus:border-[#155EEF] focus:outline-none focus:ring-0 focus:border-[#155EEF]-600 border-2 peer"
                                placeholder=" "
                                id={`dateOfBirth-${roomIndex}-${travelerIdx}`}
                                type="date"
                                value={traveler.dateOfBirth}
                                onChange={(e) =>
                                  handleTravelerInputChange(
                                    roomIndex,
                                    travelerIdx,
                                    "dateOfBirth",
                                    e.target.value
                                  )
                                }
                                max={new Date().toISOString().split("T")[0]}
                                autoComplete="bday"
                              />
                              <label
                                htmlFor={`dateOfBirth-${roomIndex}-${travelerIdx}`}
                                className="absolute text-sm text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-white dark:bg-gray-900 px-2 peer-focus:px-2 peer-focus:text-[#155EEF] peer-focus:dark:text-[#155EEF] peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto start-1"
                              >
                                Date of Birth{" "}
                                <span className="text-red-500">*</span>
                              </label>
                              <div className="text-red-500 text-xs mt-1">
                                {validator.message(
                                  `dateOfBirth-${roomIndex}-${travelerIdx}`,
                                  traveler.dateOfBirth,
                                  "required"
                                )}
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Passport Fields */}
                        {renderPassportFields(roomIndex, travelerIdx, traveler)}

                        {/* PAN Fields */}
                        {renderPanFields(
                          roomIndex,
                          travelerIdx,
                          traveler,
                          "PAN"
                        )}

                        {/* Country and City Fields & contact no. fields */}
                        {roomIndex === 0 && travelerIdx === 0 && (
                          <div className="flex gap-2 sm:gap-4 items-center mt-5">
                            <div className="w-1/2 sm:w-1/3">
                              <div
                                className={`relative w-full min-w-[50px] h-10 ${
                                  focusedField === "country" ? "z-50" : "z-40"
                                }`}
                              >
                                <Select
                                  ref={(el) =>
                                    (inputRefs.current[
                                      `country-${roomIndex}-${travelerIdx}`
                                    ] = el)
                                  }
                                  name={`country-${roomIndex}-${travelerIdx}`}
                                  cacheOptions
                                  defaultOptions
                                  placeholder=" "
                                  id={`country-${roomIndex}-${travelerIdx}`}
                                  classNamePrefix="custom-select"
                                  components={customComponents}
                                  isSearchable
                                  onFocus={() => handleFocus("country")}
                                  onBlur={handleBlur}
                                  value={traveler.countryName}
                                  onChange={(selectedOption) =>
                                    handleTravelerInputChange(
                                      roomIndex,
                                      travelerIdx,
                                      "countryCode",
                                      selectedOption
                                    )
                                  }
                                  options={countryOptions}
                                  styles={{
                                    control: (provided, state) => ({
                                      ...provided,
                                      backgroundColor: "transparent",
                                      border: state.isFocused
                                        ? "2px solid #155EEF"
                                        : "1px solid #155EEF50",
                                      boxShadow: "none",
                                      borderRadius: "0.5rem",
                                      padding: "0.28rem 0.3rem",
                                      fontSize: "0.875rem",
                                      cursor: "pointer",
                                    }),
                                    placeholder: (provided) => ({
                                      ...provided,
                                      color: "#6B7280",
                                    }),
                                    singleValue: (provided) => ({
                                      ...provided,
                                      color: "#111827",
                                    }),
                                    indicatorSeparator: () => ({
                                      display: "none",
                                    }),
                                    dropdownIndicator: (provided) => ({
                                      ...provided,
                                      color: "#155EEF",
                                    }),
                                  }}
                                />
                                <label
                                  htmlFor={`country-${roomIndex}-${travelerIdx}`}
                                  className="absolute text-sm text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-white dark:bg-gray-900 px-2 peer-focus:px-2 peer-focus:text-[#155EEF] peer-focus:dark:text-[#155EEF] peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto start-1"
                                >
                                  Country{" "}
                                  <span className="text-red-500">*</span>
                                </label>
                                <div className="text-red-500 text-xs mt-1">
                                  {validator.message(
                                    `country-${roomIndex}-${travelerIdx}`,
                                    traveler.countryName?.value,
                                    "required"
                                  )}
                                </div>
                              </div>
                            </div>

                            <div className="w-1/2 sm:w-1/3">
                              <div className="relative w-full min-w-[50px] z-50 h-10">
                                <AsyncSelect
                                  ref={(el) =>
                                    (inputRefs.current[
                                      `city-${roomIndex}-${travelerIdx}`
                                    ] = el)
                                  }
                                  name={`city-${roomIndex}-${travelerIdx}`}
                                  cacheOptions
                                  defaultOptions
                                  placeholder=" "
                                  id={`city-${roomIndex}-${travelerIdx}`}
                                  classNamePrefix="custom-select"
                                  components={customComponents}
                                  isSearchable
                                  loadOptions={(inputValue) =>
                                    loadOptions(
                                      inputValue,
                                      roomIndex,
                                      travelerIdx
                                    )
                                  }
                                  value={traveler.city}
                                  onChange={(selectedOption) =>
                                    handleTravelerInputChange(
                                      roomIndex,
                                      travelerIdx,
                                      "city",
                                      selectedOption
                                    )
                                  }
                                  styles={{
                                    control: (provided, state) => ({
                                      ...provided,
                                      backgroundColor: "transparent",
                                      border: state.isFocused
                                        ? "2px solid #155EEF"
                                        : "1px solid #155EEF50",
                                      boxShadow: "none",
                                      borderRadius: "0.5rem",
                                      padding: "0.28rem 0.3rem",
                                      fontSize: "0.875rem",
                                      cursor: "pointer",
                                    }),
                                    placeholder: (provided) => ({
                                      ...provided,
                                      color: "#6B7280",
                                    }),
                                    singleValue: (provided) => ({
                                      ...provided,
                                      color: "#111827",
                                    }),
                                    indicatorSeparator: () => ({
                                      display: "none",
                                    }),
                                    dropdownIndicator: (provided) => ({
                                      ...provided,
                                      color: "#155EEF",
                                    }),
                                  }}
                                />
                                <label
                                  htmlFor={`city-${roomIndex}-${travelerIdx}`}
                                  className="absolute text-sm text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-white dark:bg-gray-900 px-2 peer-focus:px-2 peer-focus:text-[#155EEF] peer-focus:dark:text-[#155EEF] peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto start-1"
                                >
                                  City <span className="text-red-500">*</span>
                                </label>
                                <div className="text-red-500 text-xs mt-1">
                                  {validator.message(
                                    `city-${roomIndex}-${travelerIdx}`,
                                    traveler.city?.value,
                                    "required"
                                  )}
                                </div>
                              </div>
                            </div>

                            {/* Contact Number Field for desktop */}
                            <div className="hidden sm:flex space-x-2 w-1/3">
                              <div className="w-[80%]">
                                <div className="relative w-full min-w-[50px] h-10">
                                  <input
                                    ref={(el) =>
                                      (inputRefs.current[
                                        `contact-${roomIndex}-${travelerIdx}`
                                      ] = el)
                                    }
                                    name={`contact-${roomIndex}-${travelerIdx}`}
                                    className="block cursor-pointer px-2.5 pb-2.5 pt-2.5 w-full text-sm text-gray-900 bg-transparent rounded-lg border-1 border-gray-300 appearance-none dark:text-black dark:border-[#155EEF30] border-1 dark:focus:border-[#155EEF] focus:outline-none focus:ring-0 focus:border-[#155EEF]-600 border-2 peer"
                                    placeholder=" "
                                    id={`contact-${roomIndex}-${travelerIdx}`}
                                    type="text"
                                    value={traveler.contactNo}
                                    maxLength={10}
                                    onChange={(e) =>
                                      handleTravelerInputChange(
                                        roomIndex,
                                        travelerIdx,
                                        "contactNo",
                                        e.target.value.replace(/[^0-9]/g, "")
                                      )
                                    }
                                    autoComplete="off"
                                  />
                                  <label
                                    htmlFor={`contact-${roomIndex}-${travelerIdx}`}
                                    className="absolute text-sm text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-4 scale-75 top-2 z-9 origin-[0] bg-white dark:bg-gray-900 px-2 peer-focus:px-2 peer-focus:text-[#155EEF] peer-focus:dark:text-[#155EEF] peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto start-1"
                                  >
                                    Contact number{" "}
                                    <span className="text-red-500">*</span>
                                  </label>
                                  <div className="text-red-500 text-xs mt-1">
                                    {validator.message(
                                      `contact-${roomIndex}-${travelerIdx}`,
                                      traveler.contactNo,
                                      `required|${
                                        traveler.nationality === "IN"
                                          ? "validMobile"
                                          : "validMobileIntl|min:10|max:10"
                                      }`
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Address Fields */}
                        {roomIndex === 0 && travelerIdx === 0 && (
                          <div className="flex flex-col sm:flex-row gap-2 items-center mt-5">
                            <div className="w-full sm:w-1/2">
                              <div className="relative w-full min-w-[50px] h-10">
                                <input
                                  ref={(el) =>
                                    (inputRefs.current[
                                      `address1-${roomIndex}-${travelerIdx}`
                                    ] = el)
                                  }
                                  name={`address1-${roomIndex}-${travelerIdx}`}
                                  className="block cursor-pointer px-2.5 pb-2.5 pt-2.5 w-full text-sm text-gray-900 bg-transparent rounded-lg border-1 border-gray-300 appearance-none dark:text-black dark:border-[#155EEF30] border-1 dark:focus:border-[#155EEF] focus:outline-none focus:ring-0 focus:border-[#155EEF]-600 border-2 peer"
                                  placeholder=" "
                                  id={`address1-${roomIndex}-${travelerIdx}`}
                                  type="text"
                                  value={traveler.addressLine1}
                                  onChange={(e) =>
                                    handleTravelerInputChange(
                                      roomIndex,
                                      travelerIdx,
                                      "addressLine1",
                                      e.target.value
                                    )
                                  }
                                  maxLength={255}
                                  autoComplete="off"
                                />
                                <label
                                  htmlFor={`address1-${roomIndex}-${travelerIdx}`}
                                  className="absolute text-sm text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-white dark:bg-gray-900 px-2 peer-focus:px-2 peer-focus:text-[#155EEF] peer-focus:dark:text-[#155EEF] peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto start-1"
                                >
                                  Address 1{" "}
                                  <span className="text-red-500">*</span>
                                </label>
                                <div className="text-red-500 text-xs mt-1">
                                  {validator.message(
                                    `address1-${roomIndex}-${travelerIdx}`,
                                    traveler.addressLine1,
                                    "required|min:3|max:255"
                                  )}
                                </div>
                              </div>
                            </div>
                            <div className="w-full sm:w-1/2">
                              <div className="relative w-full min-w-[50px] h-10">
                                <input
                                  className="block cursor-pointer px-2.5 pb-2.5 pt-2.5 w-full text-sm text-gray-900 bg-transparent rounded-lg border-1 border-gray-300 appearance-none dark:text-black dark:border-[#155EEF30] border-1 dark:focus:border-[#155EEF] focus:outline-none focus:ring-0 focus:border-[#155EEF]-600 border-2 peer"
                                  placeholder=" "
                                  id={`address2-${roomIndex}-${travelerIdx}`}
                                  type="text"
                                  value={traveler.addressLine2}
                                  onChange={(e) =>
                                    handleTravelerInputChange(
                                      roomIndex,
                                      travelerIdx,
                                      "addressLine2",
                                      e.target.value
                                    )
                                  }
                                  maxLength={255}
                                  autoComplete="off"
                                />
                                <label
                                  htmlFor={`address2-${roomIndex}-${travelerIdx}`}
                                  className="absolute text-sm text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-white dark:bg-gray-900 px-2 peer-focus:px-2 peer-focus:text-[#155EEF] peer-focus:dark:text-[#155EEF] peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto start-1"
                                >
                                  Address 2
                                </label>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Guardian Fields */}
                        {/* {renderGuardianFields(roomIndex, travelerIdx, traveler)} */}

                        {/* Frequent Flyer Fields */}
                        {/* <div className="flex flex-col sm:flex-row gap-2 items-center mt-3">
                          {renderFrequentFlyerFields(
                            roomIndex,
                            travelerIdx,
                            traveler
                          )}
                        </div> */}

                        {/* GST Details (only for first traveler in first room) */}
                        {/* {roomIndex === 0 &&
                          travelerIdx === 0 &&
                          renderGSTDetails(
                            roomIndex,
                            travelerIdx,
                            traveler,
                            traveler.gstCompanyAddress
                          )} */}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          ) : null}
        </div>
      )}

      {isLoggedIn &&
        showMasterPassengerSelector &&
        selectedTravelerForMaster && (
          <MasterPassengerSelector
            passengerType={selectedTravelerForMaster.passengerType}
            travelCategory={travelCategory}
            onSelect={handleMasterPassengerSelected}
            onClose={() => {
              setShowMasterPassengerSelector(false);
              setSelectedTravelerForMaster(null);
            }}
            selectedMasterIds={Object.values(selectedMasterPassengers)}
          />
        )}

      {isLoggedIn && showSavePassengerModal && passengerToSave && (
        <SaveMasterPassengerModal
          passengerData={passengerToSave.data}
          passengerType={passengerToSave.type}
          travelCategory={passengerToSave.category}
          onClose={() => {
            setShowSavePassengerModal(false);
            setPassengerToSave(null);
          }}
          onSaved={() => {
            showToast("success", "Passenger saved successfully!");
            setShowSavePassengerModal(false);
            setPassengerToSave(null);
          }}
        />
      )}
    </div>
  );
};

export default TravelerDetailsForm;
