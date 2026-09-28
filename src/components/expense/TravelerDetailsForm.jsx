import { useState, useEffect, useRef } from "react";
import Select from "react-select";
import AsyncSelect from "react-select/async";
import axios from "@/utils/axios/axios";
import config from "@/config";
import { extractFlightSegmentsInfo, getCityByCountry } from "@/utils/common";

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
}) => {
  const [titleOptions, setTitleOptions] = useState([]);
  const [countryOptions, setCountryOptions] = useState([]);
  const inputRefs = useRef({});
  const [focusedField, setFocusedField] = useState(null); // Track which field is focused

  // Define functions to handle focus and blur
  const handleFocus = (field) => setFocusedField(field);
  const handleBlur = () => setFocusedField(null);

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
      setTravelerDetails([...travelerDetails]); // Force re-render
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
        const updatedDetailsWithEmail = updatedDetails.map((passenger) => ({
          ...passenger,
          [field]: value,
        }));
        updatedDetails = updatedDetailsWithEmail;
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
        updatedDetails[travelerIndex][field] = value.toUpperCase();
        setTimeout(async () => {
          const regex = /\d{2}[A-Z]{5}\d{4}[A-Z]{1}[A-Z\d]{1}[Z]{1}[A-Z\d]{1}/;
          if (regex.test(value)) {
            try {
              const gst = await validateGst(value);
              if (gst.status === "SUCCESS") {
                const gstCompanyName = gst.data.companyName;
                const gstCompanyAddress = gst.data.companyAddress;
                updatedDetails[travelerIndex].gstCompanyName = gstCompanyName;
                updatedDetails[travelerIndex].gstCompanyAddress =
                  gstCompanyAddress;
              } else {
                updatedDetails[travelerIndex].gstCompanyName = "";
                updatedDetails[travelerIndex].gstCompanyAddress = "";
              }
            } catch (error) {
              updatedDetails[travelerIndex].gstCompanyName = "";
              updatedDetails[travelerIndex].gstCompanyAddress = "";
              console.log(error);
            }
          }
          setTravelerDetails(updatedDetails);
        }, 100);

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
          const routesForThisAirline = allRoutes.filter(route => route.airlineCode === airlineCode);

          if (ffNumber.trim() === '') {
            // Remove all entries for this airline
            target.frequentFlyerDetails = target.frequentFlyerDetails.filter(
              item => item.airlineCode !== airlineCode
            );
          } else {
            // Remove existing entries for this airline first
            target.frequentFlyerDetails = target.frequentFlyerDetails.filter(
              item => item.airlineCode !== airlineCode
            );

            // Add entries for all routes using this airline
            routesForThisAirline.forEach(route => {
              target.frequentFlyerDetails.push({
                routeId: route.routeId,
                origin: route.origin,
                destination: route.destination,
                airlineCode: route.airlineCode,
                airlineName: route.airlineName,
                segmentType: route.segmentType,
                frequentFlyerNumber: ffNumber
              });
            });
          }
        }
        break;
      default:
        if (travelCategory === "hotel") {
          updatedDetails[roomIndex][travelerIndex][field] = value;
        } else {
          updatedDetails[travelerIndex][field] = value;
        }
        break;
    }
    setTravelerDetails(updatedDetails);
    // if (updateValidator) {
    //   updateValidator();
    // }
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
          const routesForAirline = allRoutes.filter(route => route.airlineCode === airline.airlineCode);

          // Get the frequent flyer number for this airline (should be same for all routes of same airline)
          const existingEntry = traveler?.frequentFlyerDetails?.find(
            item => item.airlineCode === airline.airlineCode
          );

          // Generate route display text
          const routeText = routesForAirline.length > 1
            ? `${routesForAirline[0].origin} ↔ ${routesForAirline[0].destination}` // Same airline both ways
            : `${routesForAirline[0].origin} → ${routesForAirline[0].destination}`; // One way only

          return (
            <div key={airline.airlineCode} className="flex flex-col sm:flex-row gap-3 sm:gap-2 items-center mb-3">
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
                      (inputRefs.current[`ffNumber-${roomIndex}-${travelerIndex}-${index}`] = el)
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
                          value: e.target.value
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

  const renderPanFields = (roomIndex, travelerIndex, traveler) => {
    if (travelCategory === "flight") {
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

  const renderPassportFields = (roomIndex, travelerIndex, traveler) => {
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
      const isLCC =
        travelDetailsData?.fareQuoteResponse?.isLCC ||
        travelDetailsData?.outboundFlightFareQuote?.isLCC ||
        travelDetailsData?.inboundFlightFareQuote?.isLCC;
      const isPassportFullDetailRequiredAtBook =
        travelDetailsData?.fareQuoteResponse
          ?.isPassportFullDetailRequiredAtBook ||
        travelDetailsData?.outboundFlightFareQuote
          ?.isPassportFullDetailRequiredAtBook ||
        travelDetailsData?.inboundFlightFareQuote
          ?.isPassportFullDetailRequiredAtBook;
      const isPassportRequiredAtTicket =
        travelDetailsData?.fareQuoteResponse?.isPassportRequiredAtTicket ||
        travelDetailsData?.outboundFlightFareQuote
          ?.isPassportRequiredAtTicket ||
        travelDetailsData?.inboundFlightFareQuote?.isPassportRequiredAtTicket;
      const isPassportRequiredAtBook =
        travelDetailsData?.fareQuoteResponse?.isPassportRequiredAtBook ||
        travelDetailsData?.outboundFlightFareQuote?.isPassportRequiredAtBook ||
        travelDetailsData?.inboundFlightFareQuote?.isPassportRequiredAtBook;

      let inboundArrival;
      if (travelDetailsData?.inboundFlightFareQuote.isLCC !== undefined) {
        inboundArrival =
          travelDetailsData?.inboundFlightFareQuote.segments[0].segment[
            travelDetailsData?.inboundFlightFareQuote.segments[0].segment
              .length - 1
          ].destination.arrTime;
      } else {
        const segment = travelDetailsData?.outboundFlightFareQuote.segments;

        inboundArrival =
          segment[segment.length - 1].segment[
            segment[segment.length - 1].segment.length - 1
          ].destination.arrTime;
      }
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
            <div className="w-1/2 sm:w-1/3">
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
            <div className="w-1/2 sm:w-1/3">
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
                    `required${isPassportIssueDate
                      ? `|passportArrivalDateComparison:${traveler?.passportIssueDate}`
                      : ""
                    }${travelCategory === "hotel"
                      ? ""
                      : `|passportArrivalComparison:${inboundArrival}`
                    }`
                  )}
                </div>
              </div>
            </div>
          </div>
          {isPassportIssueCountry ||
            (isPassportIssueDate && (
              <div className="flex w-full gap-2">
                {isPassportIssueCountry && (
                  <div className="w-1/2 sm:w-1/3">
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
                  <div className="w-1/2 sm:w-1/3">
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
            ))}
        </div>
      </>
    );
  };

  const loadOptions = async (inputValue, roomIndex, travelerIndex) => {
    try {
      const countryCode =
        travelerDetails?.[roomIndex]?.[travelerIndex]?.countryCode ||
        travelerDetails?.[travelerIndex]?.countryCode;
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

  return (
    <div className="bg-white p-4 rounded-lg mt-2">
      <div className="flex flex-col">
        <span className="text-lg text-[#171A19] font-semibold">
          Travelers Details
        </span>
      </div>
      {/* traveler tabs */}
      {travelDetailsData?.totalTravelers.length > 0 &&
        travelDetailsData?.totalTravelers.map((adultsCount, roomIndex) => (
          <div key={`room-${roomIndex}`} className="mt-0">
            {travelCategory === "hotel" && (
              <div className="w-fit p-2 rounded-xl text-[#155EEF] bg-[#155EEF0D] font-medium text-base">
                {`Room ${roomIndex + 1}`}
              </div>
            )}
            {[...Array(adultsCount)].map((_, travelerIndex) => (
              <div
                key={`traveler-${roomIndex}-${travelerIndex}`}
                className={`py-4 ${travelerIndex < adultsCount - 1 &&
                  "border-b border-[#171A1930]"
                  }`}
              >
                <div className="w-fit p-2 rounded-xl text-[#155EEF] bg-[#155EEF0D] font-medium text-base">
                  {`Adult ${travelerIndex + 1}`}
                </div>

                <div className="flex gap-2 sm:gap-4 items-center mt-3">
                  <div className="w-[35%] sm:w-1/5">
                    <div
                      className={`relative w-full min-w-[50px] h-10 ${focusedField === "title" ? "z-50" : "z-40"
                        }`}
                    >
                      <Select
                        ref={(el) =>
                        (inputRefs.current[
                          `title-${roomIndex}-${travelerIndex}`
                        ] = el)
                        }
                        name={`title-${roomIndex}-${travelerIndex}`}
                        // isClearable
                        cacheOptions
                        defaultOptions
                        placeholder=" "
                        value={
                          travelerDetails?.[roomIndex]?.[travelerIndex]
                            ?.title ||
                          travelerDetails?.[travelerIndex]?.title ||
                          ""
                        }
                        onChange={(selectedOption) =>
                          handleTravelerInputChange(
                            roomIndex,
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
                        // isDisabled={true}
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
                            fontSize: "0.875rem",
                            cursor: "pointer", // Match input field's font size
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
                          `title-${roomIndex}-${travelerIndex}`,
                          travelerDetails?.[roomIndex]?.[travelerIndex]
                            ?.title || travelerDetails?.[travelerIndex]?.title,
                          "required"
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="w-1/2">
                    <div className="relative w-full min-w-[50px] h-10">
                      <input
                        ref={(el) =>
                        (inputRefs.current[
                          `firstName-${roomIndex}-${travelerIndex}`
                        ] = el)
                        }
                        name={`firstName-${roomIndex}-${travelerIndex}`}
                        className="block cursor-pointer px-2.5 pb-2.5 pt-2.5 w-full text-sm text-gray-900 bg-transparent rounded-lg border-1 border-gray-300 appearance-none dark:text-black dark:border-[#155EEF30] border-1 dark:focus:border-[#155EEF] focus:outline-none focus:ring-0 focus:border-[#155EEF]-600 border-2 peer"
                        placeholder=" "
                        id={`firstname-${roomIndex}-${travelerIndex}`}
                        type="text"
                        value={
                          travelerDetails?.[roomIndex]?.[travelerIndex]
                            ?.firstName ||
                          travelerDetails?.[travelerIndex]?.firstName ||
                          ""
                        }
                        onChange={(e) =>
                          handleTravelerInputChange(
                            roomIndex,
                            travelerIndex,
                            "firstName",
                            e.target.value.replace(/[^A-Za-z ]/g, "")
                          )
                        }
                        maxLength={33}
                        // readOnly={true}
                        autoComplete="off"
                      />
                      <label
                        htmlFor={`firstname-${roomIndex}-${travelerIndex}`}
                        className="absolute text-sm text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-white dark:bg-gray-900 px-2 peer-focus:px-2 peer-focus:text-[#155EEF] peer-focus:dark:text-[#155EEF] peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto start-1"
                      >
                        First Name <span className="text-red-500">*</span>
                      </label>
                      <div className="text-red-500 text-xs mt-1">
                        {validator.message(
                          `firstName-${roomIndex}-${travelerIndex}`,
                          travelerDetails?.[roomIndex]?.[travelerIndex]
                            ?.firstName ||
                          travelerDetails?.[travelerIndex]?.firstName,
                          "required|min:1|max:33"
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="w-1/2">
                    <div className="relative w-full min-w-[50px] h-10 ">
                      <input
                        ref={(el) =>
                        (inputRefs.current[
                          `lastName-${roomIndex}-${travelerIndex}`
                        ] = el)
                        }
                        name={`lastName-${roomIndex}-${travelerIndex}`}
                        className="block cursor-pointer  px-2.5 pb-2.5 pt-2.5 w-full text-sm text-gray-900 bg-transparent rounded-lg border-1 border-gray-300 appearance-none dark:text-black dark:border-[#155EEF30] border-1 dark:focus:border-[#155EEF] focus:outline-none focus:ring-0 focus:border-[#155EEF]-600 border-2 peer"
                        placeholder=" "
                        id={`lastname-${roomIndex}-${travelerIndex}`}
                        type="text"
                        value={
                          travelerDetails?.[roomIndex]?.[travelerIndex]
                            ?.lastName ||
                          travelerDetails?.[travelerIndex]?.lastName ||
                          ""
                        }
                        onChange={(e) =>
                          handleTravelerInputChange(
                            roomIndex,
                            travelerIndex,
                            "lastName",
                            e.target.value.replace(/[^A-Za-z ]/g, "")
                          )
                        }
                        maxLength={50}
                        autoComplete="off"
                      // readOnly={true}
                      />
                      <label
                        htmlFor={`lastname-${roomIndex}-${travelerIndex}`}
                        className="absolute text-sm text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-white dark:bg-gray-900 px-2 peer-focus:px-2 peer-focus:text-[#155EEF] peer-focus:dark:text-[#155EEF] peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto start-1"
                      >
                        Last Name <span className="text-red-500">*</span>
                      </label>
                      <div className="text-red-500 text-xs mt-1">
                        {validator.message(
                          `lastname-${roomIndex}-${travelerIndex}`,
                          travelerDetails?.[roomIndex]?.[travelerIndex]
                            ?.lastName ||
                          travelerDetails?.[travelerIndex]?.lastName,
                          "required|min:2|max:50"
                        )}
                      </div>
                    </div>
                  </div>
                </div>
                {renderPanFields(
                  roomIndex,
                  travelerIndex,
                  travelerDetails?.[roomIndex]?.[travelerIndex]
                )}
                {renderPassportFields(
                  roomIndex,
                  travelerIndex,
                  travelerDetails?.[roomIndex]?.[travelerIndex] ||
                  travelerDetails?.[travelerIndex]
                )}
                {roomIndex === 0 && travelerIndex === 0 && (
                  <div>
                    <div className="flex gap-2 sm:gap-4 items-center mt-5">
                      <div className="w-1/2 sm:w-1/3">
                        <div
                          className={`relative w-full min-w-[50px] h-10 ${focusedField === "country" ? "z-50" : "z-40"
                            }`}
                        >
                          <Select
                            ref={(el) =>
                            (inputRefs.current[
                              `country-${roomIndex}-${travelerIndex}`
                            ] = el)
                            }
                            name={`country-${roomIndex}-${travelerIndex}`}
                            // isClearable
                            cacheOptions
                            defaultOptions
                            placeholder=" "
                            id={`country-${roomIndex}-${travelerIndex}`}
                            classNamePrefix="custom-select"
                            components={customComponents}
                            // isDisabled={true}
                            isSearchable
                            onFocus={() => handleFocus("country")}
                            onBlur={handleBlur}
                            value={
                              ((travelerDetails?.[roomIndex]?.[travelerIndex]
                                ?.countryName?.value ||
                                travelerDetails?.[travelerIndex]?.countryName
                                  ?.value) &&
                                travelerDetails?.[roomIndex]?.[travelerIndex]
                                  ?.countryName) ||
                              travelerDetails?.[travelerIndex]?.countryName
                            }
                            onChange={(selectedOption) =>
                              handleTravelerInputChange(
                                roomIndex,
                                travelerIndex,
                                "countryCode",
                                selectedOption
                              )
                            }
                            options={countryOptions}
                            filterOption={(option, inputValue) => {
                              // Only allow options that match the input value
                              return (
                                isValidInput(inputValue) &&
                                option.label
                                  .toLowerCase()
                                  .includes(inputValue.toLowerCase())
                              );
                            }}
                            onInputChange={(inputValue) => {
                              // Only allow valid input
                              if (!isValidInput(inputValue)) {
                                // You can show a toast or a message here if needed
                                return "";
                              }
                              return inputValue; // Return the valid input
                            }}
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
                                cursor: "pointer",
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
                            }}
                          />
                          <label
                            htmlFor={`country-${roomIndex}-${travelerIndex}`}
                            className="absolute text-sm text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-white dark:bg-gray-900 px-2 peer-focus:px-2 peer-focus:text-[#155EEF] peer-focus:dark:text-[#155EEF] peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto start-1"
                          >
                            Country <span className="text-red-500">*</span>
                          </label>
                          <div className="text-red-500 text-xs mt-1">
                            {validator.message(
                              `country-${roomIndex}-${travelerIndex}`,
                              travelerDetails?.[roomIndex]?.[travelerIndex]
                                ?.countryName?.value ||
                              travelerDetails?.[travelerIndex]?.countryName
                                ?.value,
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
                              `city-${roomIndex}-${travelerIndex}`
                            ] = el)
                            }
                            name={`city-${roomIndex}-${travelerIndex}`}
                            // isClearable
                            cacheOptions
                            defaultOptions
                            placeholder=" "
                            id={`city-${roomIndex}-${travelerIndex}`}
                            classNamePrefix="custom-select"
                            components={customComponents}
                            // isDisabled={true}
                            isSearchable
                            loadOptions={(inputValue) =>
                              loadOptions(inputValue, roomIndex, travelerIndex)
                            }
                            value={
                              ((travelerDetails?.[roomIndex]?.[travelerIndex]
                                ?.city?.value ||
                                travelerDetails?.[travelerIndex]?.city
                                  ?.value) &&
                                travelerDetails?.[roomIndex]?.[travelerIndex]
                                  ?.city) ||
                              travelerDetails?.[travelerIndex]?.city
                            }
                            onChange={(selectedOption) =>
                              handleTravelerInputChange(
                                roomIndex,
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
                                  ? "2px solid #155EEF" // Border color when focused
                                  : "1px solid #155EEF50", // Default border color
                                boxShadow: "none",
                                borderRadius: "0.5rem", // Match input field's border radius
                                padding: "0.28rem 0.3rem", // Padding to align with the input's padding
                                fontSize: "0.875rem", // Match input field's font size
                                cursor: "pointer",
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
                            }}
                          />
                          <label
                            htmlFor={`city-${roomIndex}-${travelerIndex}`}
                            className="absolute text-sm text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-white dark:bg-gray-900 px-2 peer-focus:px-2 peer-focus:text-[#155EEF] peer-focus:dark:text-[#155EEF] peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto start-1"
                          >
                            City <span className="text-red-500">*</span>
                          </label>

                          <div className="text-red-500 text-xs mt-1">
                            {validator.message(
                              `city-${roomIndex}-${travelerIndex}`,
                              travelerDetails?.[roomIndex]?.[travelerIndex]
                                ?.city?.value ||
                              travelerDetails?.[travelerIndex]?.city?.value,
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
                              (inputRefs.current[
                                `contact-${roomIndex}-${travelerIndex}`
                              ] = el)
                              }
                              name={`contact-${roomIndex}-${travelerIndex}`}
                              className="block cursor-pointer px-2.5 pb-2.5 pt-2.5 w-full text-sm text-gray-900 bg-transparent rounded-lg border-1 border-gray-300 appearance-none dark:text-black dark:border-[#155EEF30] border-1 dark:focus:border-[#155EEF] focus:outline-none focus:ring-0 focus:border-[#155EEF]-600 border-2 peer"
                              placeholder=" "
                              id={`contact-${roomIndex}-${travelerIndex}`}
                              type="text"
                              value={
                                travelerDetails?.[roomIndex]?.[travelerIndex]
                                  ?.contactNo ||
                                travelerDetails?.[travelerIndex]?.contactNo ||
                                ""
                              }
                              maxLength={10}
                              onChange={(e) =>
                                handleTravelerInputChange(
                                  roomIndex,
                                  travelerIndex,
                                  "contactNo",
                                  e.target.value.replace(/[^0-9]/g, "")
                                )
                              }
                              // readOnly={true}
                              autoComplete="off"
                            />
                            <label
                              htmlFor={`contact-${roomIndex}-${travelerIndex}`}
                              className="absolute text-sm text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-4 scale-75 top-2 z-9 origin-[0] bg-white dark:bg-gray-900 px-2 peer-focus:px-2 peer-focus:text-[#155EEF] peer-focus:dark:text-[#155EEF] peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto start-1"
                            >
                              Contact number{" "}
                              <span className="text-red-500">*</span>
                            </label>
                            <div className="text-red-500 text-xs mt-1">
                              {validator.message(
                                `contact-${roomIndex}-${travelerIndex}`,
                                travelerDetails?.[roomIndex]?.[travelerIndex]
                                  ?.contactNo ||
                                travelerDetails?.[travelerIndex]?.contactNo,
                                `required|${travelerDetails?.[roomIndex]?.[travelerIndex]
                                  ?.nationality ||
                                  travelerDetails?.[travelerIndex]
                                    ?.nationality === "IN"
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
                            (inputRefs.current[
                              `contact-${roomIndex}-${travelerIndex}`
                            ] = el)
                            }
                            name={`contact-${roomIndex}-${travelerIndex}`}
                            className="block cursor-pointer px-2.5 pb-2.5 pt-2.5 w-full text-sm text-gray-900 bg-transparent rounded-lg border-1 border-gray-300 appearance-none dark:text-black dark:border-[#155EEF30] border-1 dark:focus:border-[#155EEF] focus:outline-none focus:ring-0 focus:border-[#155EEF]-600 border-2 peer"
                            placeholder=" "
                            id={`contact-${roomIndex}-${travelerIndex}`}
                            type="text"
                            value={
                              travelerDetails?.[roomIndex]?.[travelerIndex]
                                ?.contactNo ||
                              travelerDetails?.[travelerIndex]?.contactNo ||
                              ""
                            }
                            maxLength={10}
                            onChange={(e) =>
                              handleTravelerInputChange(
                                roomIndex,
                                travelerIndex,
                                "contactNo",
                                e.target.value.replace(/[^0-9]/g, "")
                              )
                            }
                            autoComplete="off"
                          />
                          <label
                            htmlFor={`contact-${roomIndex}-${travelerIndex}`}
                            className="absolute text-sm text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-4 scale-75 top-2 z-9 origin-[0] bg-white dark:bg-gray-900 px-2 peer-focus:px-2 peer-focus:text-[#155EEF] peer-focus:dark:text-[#155EEF] peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto start-1"
                          >
                            Contact number{" "}
                            <span className="text-red-500">*</span>
                          </label>
                          <div className="text-red-500 text-xs mt-1">
                            {validator.message(
                              `contact-${roomIndex}-${travelerIndex}`,
                              travelerDetails?.[roomIndex]?.[travelerIndex]
                                ?.contactNo ||
                              travelerDetails?.[travelerIndex]?.contactNo,
                              `required|${travelerDetails?.[roomIndex]?.[travelerIndex]
                                ?.nationality ||
                                travelerDetails?.[travelerIndex]
                                  ?.nationality === "IN"
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
                                `address1-${roomIndex}-${travelerIndex}`
                              ] = el)
                              }
                              name={`address1-${roomIndex}-${travelerIndex}`}
                              className="block cursor-pointer px-2.5 pb-2.5 pt-2.5 w-full text-sm text-gray-900 bg-transparent rounded-lg border-1 border-gray-300 appearance-none dark:text-black dark:border-[#155EEF30] border-1 dark:focus:border-[#155EEF] focus:outline-none focus:ring-0 focus:border-[#155EEF]-600 border-2 peer"
                              placeholder=" "
                              id={`address1-${roomIndex}-${travelerIndex}`}
                              type="text"
                              value={
                                travelerDetails?.[roomIndex]?.[travelerIndex]
                                  ?.addressLine1 ||
                                travelerDetails?.[travelerIndex]
                                  ?.addressLine1 ||
                                ""
                              }
                              onChange={(e) =>
                                handleTravelerInputChange(
                                  roomIndex,
                                  travelerIndex,
                                  "addressLine1",
                                  e.target.value
                                )
                              }
                              maxLength={255}
                              autoComplete="off"
                            />
                            <label
                              htmlFor={`address1-${roomIndex}-${travelerIndex}`}
                              className="absolute text-sm text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-white dark:bg-gray-900 px-2 peer-focus:px-2 peer-focus:text-[#155EEF] peer-focus:dark:text-[#155EEF] peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto start-1"
                            >
                              Address 1 <span className="text-red-500">*</span>
                            </label>
                            <div className="text-red-500 text-xs mt-1">
                              {validator.message(
                                `address1-${roomIndex}-${travelerIndex}`,
                                travelerDetails?.[roomIndex]?.[travelerIndex]
                                  ?.addressLine1 ||
                                travelerDetails?.[travelerIndex]
                                  ?.addressLine1,
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
                              id={`address2-${roomIndex}-${travelerIndex}`}
                              type="text"
                              value={
                                travelerDetails?.[roomIndex]?.[travelerIndex]
                                  ?.addressLine2 ||
                                travelerDetails?.[travelerIndex]
                                  ?.addressLine2 ||
                                ""
                              }
                              onChange={(e) =>
                                handleTravelerInputChange(
                                  roomIndex,
                                  travelerIndex,
                                  "addressLine2",
                                  e.target.value
                                )
                              }
                              maxLength={255}
                              autoComplete="off"
                            />
                            <label
                              htmlFor={`address2-${roomIndex}-${travelerIndex}`}
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

                <div className="flex flex-col sm:flex-row gap-2 items-center mt-3">
                  {/* {travelCategory !== "hotel" && (
                    <>
                      <div className="w-full sm:w-1/2 ">
                        <div className="relative w-full min-w-[50px] h-10 ">
                          <input
                            ref={(el) =>
                            (inputRefs.current[
                              `ffAirlineCode-${roomIndex}-${travelerIndex}`
                            ] = el)
                            }
                            name={`ffAirlineCode-${roomIndex}-${travelerIndex}`}
                            className="block cursor-pointer px-2.5 pb-2.5 pt-2.5 w-full text-sm text-gray-900 bg-transparent rounded-lg border-1 border-gray-300 appearance-none dark:text-black dark:border-[#155EEF30] border-1 dark:focus:border-[#155EEF] focus:outline-none focus:ring-0 focus:border-[#155EEF]-600 border-2 peer"
                            placeholder=" "
                            id={`ffAirlineCode-${roomIndex}-${travelerIndex}`}
                            type="text"
                            value={
                              travelerDetails?.[roomIndex]?.[travelerIndex]
                                ?.ffAirlineCode ||
                              travelerDetails?.[travelerIndex]?.ffAirlineCode ||
                              ""
                            }
                            onChange={(e) =>
                              handleTravelerInputChange(
                                roomIndex,
                                travelerIndex,
                                "ffAirlineCode",
                                e.target.value
                              )
                            }
                            // maxLength={5} // Airline codes are usually 2-3 letters, so max 5 allows flexibility
                            autoComplete="off"
                          />
                          <label
                            htmlFor={`ffAirlineCode-${roomIndex}-${travelerIndex}`}
                            className="absolute text-sm text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-white dark:bg-gray-900 px-2 peer-focus:px-2 peer-focus:text-[#155EEF] peer-focus:dark:text-[#155EEF] peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto start-1"
                          >
                            Frequent Flyer Airline Code
                          </label>
                          <div className="text-red-500 text-xs mt-1">
                            {travelerDetails?.[roomIndex]?.[travelerIndex]
                              ?.ffAirlineCodeValidationError ||
                              travelerDetails?.[travelerIndex]
                                ?.ffAirlineCodeValidationError ||
                              validator.message(
                                `ffAirlineCode-${roomIndex}-${travelerIndex}`,
                                travelerDetails?.[roomIndex]?.[travelerIndex]
                                  ?.ffAirlineCode ||
                                travelerDetails?.[travelerIndex]
                                  ?.ffAirlineCode,
                                "min:2"
                              )}
                          </div>
                        </div>
                      </div>
                      <div className="w-full sm:w-1/2 ">
                        <div className="relative w-full min-w-[50px] h-10">
                          <input
                            ref={(el) =>
                            (inputRefs.current[
                              `ffNumber-${roomIndex}-${travelerIndex}`
                            ] = el)
                            }
                            name={`ffNumber-${roomIndex}-${travelerIndex}`}
                            className="block cursor-pointer px-2.5 pb-2.5 pt-2.5 w-full text-sm text-gray-900 bg-transparent rounded-lg border-1 border-gray-300 appearance-none dark:text-black dark:border-[#155EEF30] border-1 dark:focus:border-[#155EEF] focus:outline-none focus:ring-0 focus:border-[#155EEF]-600 border-2 peer"
                            placeholder=" "
                            id={`ffNumber-${roomIndex}-${travelerIndex}`}
                            type="text"
                            value={
                              travelerDetails?.[roomIndex]?.[travelerIndex]
                                ?.ffNumber ||
                              travelerDetails?.[travelerIndex]?.ffNumber ||
                              ""
                            }
                            onChange={(e) =>
                              handleTravelerInputChange(
                                roomIndex,
                                travelerIndex,
                                "ffNumber",
                                e.target.value
                              )
                            }
                            maxLength={20}
                            autoComplete="off"
                          />
                          <label
                            htmlFor={`ffNumber-${roomIndex}-${travelerIndex}`}
                            className="absolute text-sm text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-white dark:bg-gray-900 px-2 peer-focus:px-2 peer-focus:text-[#155EEF] peer-focus:dark:text-[#155EEF] peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto start-1"
                          >
                            Frequent Flyer Number
                          </label>
                          <div className="text-red-500 text-xs mt-1">
                            {travelerDetails?.[roomIndex]?.[travelerIndex]
                              ?.ffNumberValidationError ||
                              travelerDetails?.[travelerIndex]
                                ?.ffNumberValidationError ||
                              validator.message(
                                `ffNumber-${roomIndex}-${travelerIndex}`,
                                travelerDetails?.[roomIndex]?.[travelerIndex]
                                  ?.ffNumber ||
                                travelerDetails?.[travelerIndex]?.ffNumber,
                                "min:5|max:20"
                              )}
                          </div>
                        </div>
                      </div>
                    </>
                  )} */}


                  {renderFrequentFlyerFields(
                    roomIndex,
                    travelerIndex,
                    travelerDetails?.[roomIndex]?.[travelerIndex] ||
                    travelerDetails?.[travelerIndex]
                  )}
                </div>
              </div>
            ))}
          </div>
        ))}
    </div>
  );
};

export default TravelerDetailsForm;
