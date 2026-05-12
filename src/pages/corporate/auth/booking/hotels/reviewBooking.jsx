import { useState, useEffect, useMemo } from "react";
import { useSelector } from "react-redux";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSpinner } from "@fortawesome/free-solid-svg-icons";
import Header from "@/components/corporate/auth/Header";
import RequestModal from "@/components/corporate/approvalRequest/request";
import Approver from "@/components/corporate/approvalRequest/ApproverDetails";
import useIndexedDBWithCompression from "@/utils/corporate/hotels/useIndexedDB";
import HotelReview from "@/components/corporate/booking/hotels/HotelReview";
import TravelerDetailsForm from "@/components/corporate/forms/TravelerDetailsForm";
import ContactDetails from "@/components/corporate/forms/ContactDetails";
import useFormValidator from "@/hooks/useFormValidator";
import Head from "next/head";
import showToast from "@/utils/toast";
import SentRequestModal from "@/components/corporate/approvalRequest/sentRequest";
import axios, { getTabSpecificData } from "@/utils/axios/axios";
import config from "@/config";
import { useRouter } from "next/router";
import Footer2 from "@/components/corporate/footerCorporate/footerCorporate";
import CancellationPolicy from "@/components/corporate/booking/hotels/CancellationPolicy";
import GSTDetails from "@/components/corporate/details/GSTDetails";
import ReviewBookingSkeleton from "@/components/corporate/Loaders/Hotel/ReviewBookingSkeleton";
import ProtectedRoute from "@/components/corporate/protectedRoute/ProtectedRoute";
import OutOfPolicy from "@/components/corporate/common/OutOfPolicy";
import UseWalletBalanceButton from "@/components/wallet/walletButton/useWalletButton";
import { useWalletBalance } from "@/hooks/useWalletBalance";
import {
  TRAVEL_CATEGORIES,
  HOTEL_BUDGET_DOMESTIC_ID,
  HOTEL_BUDGET_INTERNATIONAL_ID,
} from "@/utils/constants";
import {
  constructOutOfPolicyEmployees,
  findTravelersMissingApproval,
  getHotelEmployeeData,
} from "@/utils/corporate/travelPolicy";
import { formatPrice } from "@/utils/common";
import { routeToPg } from "@/paymentGateways/pgRouting";

export default function ReviewBooking() {
  const userDetails = useSelector((state) => state?.user?.userInfo);
  const isWalletAllowed =
    userDetails?.loggedInDetails?.configuration?.walletAllowed;

  const { walletBalance } = useWalletBalance();

  const router = useRouter();

  const { getPreviewData } = useIndexedDBWithCompression();

  const [previewData, setPreviewData] = useState(null);
  const [travelDetailsData, setTravelDetailsData] = useState(null);
  const [proceedToggle, setProceedToggle] = useState(false);
  const [isRequestSent, setIsRequestSent] = useState(false);
  const [priceBreakup, setPriceBreakup] = useState(null);
  const [scrollToFirstError, setScrollToFirstError] = useState(false);
  const [cancellationPolicies, setCancellationPolicies] = useState([]);
  const [validationTrigger, setValidationTrigger] = useState(false);
  const [gstDetails, setGstDetails] = useState(null);
  const [walletSelected, setWalletSelected] = useState(false);
  const [isBookingLoading, setIsBookingLoading] = useState(false);
  const [showApproverReason, setShowApproverReason] = useState(false);

  const [travelerDetails, setTravelerDetails] = useState([
    [
      {
        title: "",
        firstName: "",
        lastName: "",
        email: null,
        contactNo: null,
        isLeadPax: false,
      },
    ],
  ]);

  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);

  useEffect(() => {
    if (isRequestModalOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "visible";
    }

    return () => {
      document.body.style.overflow = "visible";
    };
  }, [isRequestModalOpen]);

  // Custom messages and rules (if needed)
  const customMessages = {
    email: "This is not a valid email.",
    required: "This field is required.",
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
    validPassportNumber: {
      message: "Passport Number does not match the format",
      rule: (val, params, validator) => {
        const regex = /^[A-Za-z0-9]{3,30}$/;
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
    passportDateComparison: {
      message: "Passport issue date should be less than expiry date.",
      rule: (val, params, validator) => {
        const issueDate = new Date(params[0]);
        const arrivalDate = new Date(params[1]);
        const expiryDate = new Date(val);
        return expiryDate > issueDate;
      },
    },
  };

  const [validator, updateValidator] = useFormValidator(
    customMessages,
    customRules
  );

  useEffect(() => {
    const fetchPreviewData = async () => {
      const data = await getPreviewData();
      if (data) {
        // console.log(data);
        const cityName = data?.searchRequest?.selectedCity?.cityname;
        const countryName = data?.searchRequest?.selectedCity?.countryname;
        setPreviewData({
          ...data,
          hotel: { ...data.hotel, hotelAddress: `${cityName},${countryName}` },
        });
        setTravelDetailsData({
          ...data.blockRoom,
          totalTravelers: data.searchRequest.adultsPerRoom,
        });

        const totalRoomPrice = data.rooms.reduce((total, room) => {
          return total + room.price.qOfferedPriceWithoutTax;
        }, 0);

        const totalDiscount = data.rooms.reduce((total, room) => {
          return total + (room.price.discount || 0);
        }, 0);

        const priceAfterDiscount = totalRoomPrice - totalDiscount;
        const totalTaxes = data.rooms.reduce((total, room) => {
          return total + (room.price.qCommissionTax || 0);
        }, 0);

        // const totalAmount = priceAfterDiscount + totalTaxes;
        const totalAmount = data.rooms.reduce((total, room) => {
          return total + room.price.qOfferedPriceRoundedOff;
        }, 0);

        const priceBreakup = {
          totalRoomPrice,
          totalDiscount,
          priceAfterDiscount,
          totalTaxes,
          totalAmount,
        };
        setPriceBreakup(priceBreakup);

        if (userDetails) {
          const { loggedInDetails } = userDetails;
          const companyName = loggedInDetails?.companyDetails?.companyName;
          const companyGst = loggedInDetails?.companyDetails?.gst;
          const gstEmail = loggedInDetails?.companyDetails?.gstEmail;
          const gstMobileNumber =
            loggedInDetails?.companyDetails?.gstMobileNumber;
          const address = loggedInDetails?.companyDetails?.address;
          setGstDetails({
            companyName,
            companyGst,
            gstEmail,
            gstMobileNumber,
            address,
          });
        }

        // Extract room and cancellation policy information
        const roomPolicies = data.rooms.map((room) => ({
          roomName: room.roomTypeName,
          cancellationPolicies: room.cancellationPolicies.map((policy) => ({
            FromDate: policy.FromDate,
            ToDate: policy.ToDate,
            ChargeType: policy.ChargeType,
            Currency: policy.Currency,
            Charge: policy.Charge,
          })),
        }));

        setCancellationPolicies(roomPolicies);

        // Initialize travelerDetails based on adultsPerRoom
        if (data.searchRequest && data.searchRequest.adultsPerRoom) {
          let travelerIndex = 0;
          const initialTravelerDetails = data.searchRequest.adultsPerRoom.map(
            (adultsCount, roomIndex) => {
              return Array(adultsCount)
                .fill()
                .map(() => {
                  const selectedTraveler =
                    data.searchRequest.selectedTravelers[travelerIndex];
                  const passengerType = selectedTraveler?.data || {};

                  travelerIndex++; // Move to the next traveler

                  return {
                    title: passengerType.title
                      ? {
                        value: passengerType.title,
                        label: passengerType.title,
                      }
                      : null,
                    firstName: passengerType.firstName || "",
                    lastName: passengerType.lastName || "",
                    contactNo: passengerType.mobile || null,
                    email: passengerType.workEmail || null,
                    isLeadPax: roomIndex === 0 && travelerIndex === 1, // First traveler in the first room
                    pan: "",
                    passportNo:
                      passengerType?.passportNumber?.toUpperCase() || null,
                    passportExpiry: passengerType?.passportExpiry || null,
                    passportIssueDate: passengerType?.passportIssueDate || null,
                    addressLine1: passengerType.address || "",
                    addressLine2: "",
                    city:
                      {
                        value: passengerType?.cityDetails?.cityname,
                        label: passengerType?.cityDetails?.cityname,
                      } || "",
                    countryCode:
                      passengerType?.countryDetails?.alpha2code || "",
                    cellCountryCode:
                      passengerType?.countryDetails?.phonecode || "",
                    countryName:
                      {
                        value: passengerType?.countryDetails?.alpha2code,
                        label: passengerType?.countryDetails?.countryname,
                      } || "India",
                    nationality:
                      passengerType?.countryDetails?.alpha2code || "IN",
                  };
                });
            }
          );

          // Prioritize logged-in user
          const prioritizedDetails = initialTravelerDetails.map(
            (roomTravelers) => {
              if (userDetails) {
                const { loggedInDetails } = userDetails;
                const loggedInIndex = roomTravelers.findIndex(
                  (traveler) =>
                    traveler.firstName ===
                    loggedInDetails?.userDetails?.firstName &&
                    traveler.lastName ===
                    loggedInDetails?.userDetails?.lastName &&
                    traveler.email === loggedInDetails?.userDetails?.workEmail
                );

                if (loggedInIndex > 0) {
                  const loggedInTraveler = roomTravelers.splice(
                    loggedInIndex,
                    1
                  )[0];
                  roomTravelers.unshift(loggedInTraveler); // Move logged-in user to the first position
                }
              }
              return roomTravelers;
            }
          );

          setTravelerDetails(prioritizedDetails);
        }
      }
    };
    fetchPreviewData();
  }, [getPreviewData, userDetails]);

  const checkIfRoomRefundable = (room) => {
    if (!room?.cancellationPolicies?.length) {
      return false; // no policy => assume non-refundable
    }

    const now = new Date();

    // We'll check the total room price
    const totalRoomCost = room.price?.qOfferedPriceRoundedOff || 0;

    // If we find *any* window with penalty less than the full cost (or <100%):
    for (const policy of room.cancellationPolicies) {
      // Check if this policy window starts in the future
      const policyStart = new Date(policy.FromDate);
      if (policyStart > now) {
        // Now interpret the charge
        if (policy.ChargeType === 2) {
          // charge is a percentage
          if (policy.Charge < 100) {
            // means user doesn't lose 100% => partially refundable
            return true;
          }
        } else if (policy.ChargeType === 1) {
          // charge is a direct currency value
          // if it's less than total cost => partial refund => consider refundable
          if (policy.Charge < totalRoomCost) {
            return true;
          }
        }
      }
    }
    return false;
  };

  const allSelectedRoomsAreRefundable = useMemo(() => {
    // If no rooms, return false
    if (!previewData?.rooms?.length) return false;

    return previewData.rooms.every((room) => checkIfRoomRefundable(room));
  }, [previewData?.rooms]);

  const regionId = previewData?.hotel?.isDomesticHotel
    ? HOTEL_BUDGET_DOMESTIC_ID
    : HOTEL_BUDGET_INTERNATIONAL_ID;

  const sharedParams = useMemo(() => {
    if (
      !priceBreakup?.totalAmount ||
      !previewData?.hotel?.starRating ||
      !previewData?.searchRequest?.selectedTravelers
    ) {
      return {
        corporateEmployees: [],
        hotelCategory: undefined,
        totalAmount: 0,
        regionId: null,
        isRefundable: undefined,
      };
    }

    return {
      corporateEmployees: previewData.searchRequest.selectedTravelers || [],
      hotelCategory: previewData.hotel.starRating || undefined,
      totalAmount:
        priceBreakup?.totalAmount / previewData?.searchRequest?.noOfRooms,
      regionId: regionId,
      isRefundable: allSelectedRoomsAreRefundable,
    };
  }, [
    priceBreakup?.totalAmount,
    previewData?.hotel?.starRating,
    previewData?.searchRequest?.selectedTravelers,
    previewData?.searchRequest?.noOfRooms,
    regionId,
    allSelectedRoomsAreRefundable,
  ]);

  const refactoredCorporateEmployees = useMemo(() => {
    return getHotelEmployeeData(sharedParams);
  }, [sharedParams]);

  const outOfPolicyTravelers = useMemo(() => {
    const updatedSharedParams = {
      ...sharedParams,
      showApprovalReason: showApproverReason,
    };
    return constructOutOfPolicyEmployees(
      updatedSharedParams,
      TRAVEL_CATEGORIES.HOTELS
    );
  }, [sharedParams, showApproverReason]);

  const isOutOfPolicySendApproval = useMemo(() => {
    return findTravelersMissingApproval(sharedParams, TRAVEL_CATEGORIES.HOTELS);
  }, [sharedParams]);

  const employeesNeedingApproval = useMemo(() => {
    if (!previewData?.searchRequest?.selectedTravelers) return [];
    return previewData?.searchRequest?.selectedTravelers?.filter(
      (emp) => emp.data?.isApprovalRequired
    );
  }, [previewData?.searchRequest?.selectedTravelers]);

  function formatDateToISO(inputDateString) {
    if (inputDateString) {
      const date = new Date(inputDateString);
      return date.toISOString().split("T")[0] + "T00:00:00";
    }
    return null;
  }

  function combineDateAndTime(dateString, timeInSeconds) {
    const [day, month, year] = dateString.split("-");
    const hours = String(Math.floor(timeInSeconds / 3600)).padStart(2, "0");
    const minutes = String(Math.floor((timeInSeconds % 3600) / 60)).padStart(
      2,
      "0"
    );
    const seconds = String(timeInSeconds % 60).padStart(2, "0");
    let formattedDateTime;
    if (timeInSeconds) {
      formattedDateTime = `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;
    } else {
      formattedDateTime = `${year}-${month}-${day}T00:00:00`;
    }

    return formattedDateTime;
  }

  const convertToBookRoomPayload = (previewData) => {
    const { hotel, rooms, searchRequest, blockRoom } = previewData;
    const selectedRoom = rooms[0];

    let qCommissionSum = 0;
    let qCommissionTaxSum = 0;

    rooms.forEach((room) => {
      qCommissionSum += room.price.qCommission;
      qCommissionTaxSum += room.price.qCommissionTax;
    });

    const totalCostRoom = priceBreakup?.totalAmount;
    const totalPayable = priceBreakup?.totalAmount;
    const cityName = searchRequest?.selectedCity?.cityname;
    const countryName = searchRequest?.selectedCity?.countryname;
    const ratings = hotel?.starRating;

    const ipAddress = getTabSpecificData("userip");
    const userId = getTabSpecificData("userID");

    let companyId = null;
    if (userDetails) {
      companyId = userDetails?.companyId;
    }

    const gstDetails = userDetails?.loggedInDetails?.companyDetails?.gst;
    const isCorporateBooking = gstDetails !== null || gstDetails !== "";

    const companyDetails = isCorporateBooking
      ? {
        CompanyName:
          userDetails?.loggedInDetails?.companyDetails?.companyName || "",
        CompanyEmail:
          userDetails?.loggedInDetails?.companyDetails?.gstEmail || "",
        CompanyMobile:
          userDetails?.loggedInDetails?.companyDetails?.gstMobileNumber || "",
        CompanyGst: gstDetails || "",
        CompanyAddress:
          userDetails?.loggedInDetails?.companyDetails?.address || "",
        CompanyPincode:
          userDetails?.loggedInDetails?.companyDetails?.pincode || "",
      }
      : {
        CompanyName: "",
        CompanyEmail: "",
        CompanyMobile: "",
        CompanyGst: "",
        CompanyAddress: "",
        CompanyPincode: "",
      };

    const data = {
      BookRoomDetails: {
        HotelCode: hotel.hotelCode,
        CategoryId: selectedRoom.supplierCategoryId,
        HotelName: blockRoom.BlockRoomResult.HotelName,
        GuestNationality: "IN",
        NoOfRooms: searchRequest.noOfRooms,
        IsVoucherBooking: "true",
        IsPackageFare: blockRoom.BlockRoomResult.IsPackageFare,
        CheckInDate: searchRequest.checkInDateRange.split("T")[0],
        CheckOutDate: searchRequest.checkOutDateRange.split("T")[0],
        CountryCode: searchRequest.selectedCity.countrycode,
        CityId: searchRequest.selectedCity.cityid,
        TotalBookingAmount: totalCostRoom,
        TotalGstAmount: qCommissionTaxSum,
        WalletCreditApplied: 0,
        TotalPayable: totalPayable,
        IsCoorporateBooking: false,
        CompantDetails: null,
        TotalCommissionAmount: qCommissionSum,
        hotelImageUrl: hotel?.hotelStaticImageUrl || hotel?.hotelImages || null,
        cityName: cityName || null,
        countryName: countryName || null,
        ratings: ratings || null,
        IsCoorporateBooking: isCorporateBooking,
        CompantDetails: companyDetails,
        HotelRoomsDetails: rooms.map((room, index) => ({
          RoomIndex: room.roomIndex,
          RoomTypeCode: room.roomTypeCode,
          RoomTypeName: room.roomTypeName,
          RatePlanCode: room.ratePlanCode,
          BedTypeCode: null,
          SmokingPreference: room.smokingPreference,
          Supplements: null,
          Price: {
            CurrencyCode: room.price.currencyCode,
            RoomPrice: room.price.roomPrice,
            Tax: room.price.tax,
            ExtraGuestCharge: room.price.extraGuestCharge,
            ChildCharge: room.price.childCharge,
            OtherCharges: room.price.otherCharges,
            Discount: room.price.discount,
            PublishedPrice: room.price.publishedPrice,
            PublishedPriceRoundedOff: room.price.publishedPriceRoundedOff,
            OfferedPrice: room.price.offeredPrice,
            OfferedPriceRoundedOff: room.price.offeredPriceRoundedOff,
            qOfferedPrice: room.price.qOfferedPrice,
            qOfferedPriceWithoutTax: room.price.qOfferedPriceWithoutTax,
            qOfferedPriceRoundedOff: room.price.qOfferedPriceRoundedOff,
            qCommission: room.price.qCommission,
            qCommissionTax: room.price.qCommissionTax,
            AgentCommission: room.price.agentCommission,
            AgentMarkUp: room.price.agentMarkUp,
            ServiceTax: room.price.serviceTax,
            TDS: room.price.TDS,
            TCS: room.price.TCS,
          },
          HotelPassenger: travelerDetails[index].map((traveler, i) => ({
            Title: traveler.title?.value || null,
            FirstName: traveler.firstName.trim(),
            MiddleName: "",
            LastName: traveler.lastName.trim(),
            Phoneno: traveler.contactNo || null,
            Email: traveler.email || null,
            PaxType: "1",
            LeadPassenger: i === 0,
            //   Age: calculateAge(traveler.data.dateOfBirth),
            Age: "0",
            PassportNo: traveler.passportNo || null,
            PassportIssueDate: formatDateToISO(traveler?.passportIssueDate),
            PassportExpDate: formatDateToISO(traveler?.passportExpiry),
            PAN: traveler.pan || null,
          })),
        })),
      },
      vendorcode: hotel.vendorCode,
      cartId: null,
      qTraceId: blockRoom.qTraceId,
      companyId: companyId,
      isDomestic: hotel?.isDomesticHotel,
      ipAddress: typeof ipAddress === "undefined" ? null : ipAddress,
    };

    return data;
  };

  const handleScrollHandled = () => {
    setScrollToFirstError(false);
  };

  const calculateTotalPayable = () => {
    let totalFare = priceBreakup?.totalAmount;
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

  const handleHoverStart = () => {
    if (isOutOfPolicySendApproval) {
      setShowApproverReason(true);
    }
  };

  const handleHoverEnd = () => {
    setShowApproverReason(false);
  };

  // Function to open the modal
  const handleApproverSubmit = async () => {
    try {
      const isValid = validator.allValid();
      if (!isValid) {
        validator.showMessages();
        // Force an update to show the messages
        setValidationTrigger((prev) => !prev);
        setScrollToFirstError(true);
        return;
      }
      setIsRequestModalOpen(true);
    } catch (error) {
      console.error(error);
      showToast("error", "Something went wrong, please try again later!");
    }
  };

  const handleSendApproval = async (selectedReason) => {
    const convertDateToISO = (dateStr) => {
      const [day, month, year] = dateStr.split("/").map(Number);
      const date = new Date(year, month - 1, day, 12, 8, 0); // Adjusting the time to "12:08:00"
      return date.toISOString();
    };

    // setIsRequestModalOpen(false);
    try {
      const bookRoomPayload = convertToBookRoomPayload(previewData);
      const response = await axios.post(`${config.BOOK_ROOM}`, bookRoomPayload);
      console.log("the booking id is ",response,response?.data?.data?.bookingId)
      if (response?.data?.status === "SUCCESS") {
        const bookingId = response?.data?.data?.bookingId;
        const userId = getTabSpecificData("userID");

        let companyId = null;
        let userName = null;
        if (userDetails) {
          const { loggedInDetails } = userDetails;
          companyId = userDetails?.companyId;
          userName = `${loggedInDetails?.userDetails?.firstName} ${loggedInDetails?.userDetails?.lastName}`;
        }

        const travelDate = new Date().toISOString();

        const convertedCheckInDate = convertDateToISO(
          previewData?.searchRequest?.checkInDate
        );
       

        const approvalPayload = {
          // companyId: companyId,
          // userId: userId,
          // userName: userName,
          travelCategory: TRAVEL_CATEGORIES.HOTELS,
          bookingId: bookingId,
          // createdBy: userId,
          // modifiedBy: userId,
          policyData: outOfPolicyTravelers,
          bookingdetails: {
            destination:
              previewData?.searchRequest?.selectedCity?.countryalpha3code,
            travelDate: travelDate,
            reasonForTravel: selectedReason.reason,
            qtraceId: previewData?.blockRoom?.qTraceId,
            hotelCode: previewData?.hotel?.hotelCode,
            totalBookingAmount: priceBreakup?.totalAmount,
            passengerDetails:
              previewData?.searchRequest?.selectedTravelers?.map(
                (traveler, i) => ({
                  employeeUserId: traveler.data._id,
                  email: traveler.data.workEmail || null,
                })
              ),
          },
          // status: "Active",
        };

         console.log("the approval payload",approvalPayload)
        const approvalResponse = await axios.post(
          `${config.CORPORATE.SEND_APPROVAL}`,
          approvalPayload
        );
        if (approvalResponse?.data?.status === "SUCCESS") {
          setIsRequestSent(true);
          setTimeout(
            async () =>
              await router.push(
                `/corporate/auth/booking/hotels/approvalStatus?bookingId=${bookingId}`
              ),
            1000
          );
        }
      } else {
        showToast(
          "error",
          "Failed to book the room, Please contact the Qugo support"
        );
      }
    } catch (error) {
      console.error(error);

      // Extract the custom message from the error response
      let errorMessage =
        error?.response?.data?.message ||
        "Something went wrong, please try again later!";

      // if (
      //   error?.response?.data?.message ===
      //   "Booking already initiated with the same qtrceid"
      // ) {
      //   errorMessage =
      //     "Oops! Your session has expired. Please search Hotels again.";
      //   setTimeout(() => {
      //     router.push("/corporate/auth/booking"); // Redirect to a specific page
      //   }, 2000);
      // }

      // Display the message in the toast
      showToast("error", errorMessage);
    }
  };

  // Function to close the modal
  const closeModal = () => {
    setIsRequestModalOpen(false);
  };

  const handleProceedToggle = () => {
    setProceedToggle((prev) => !prev);
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
      const pgResponse = await axios.get(config.GET_PAYMENT_GATEWAY);

      if (pgResponse?.data?.status === "SUCCESS") {
        const bookRoomPayload = convertToBookRoomPayload(previewData);
        const response = await axios.post(
          `${config.BOOK_ROOM}`,
          bookRoomPayload
        );
        if (response?.data?.status === "SUCCESS") {
          const { companyId } = userDetails;
          const bookingId = response?.data?.data?.bookingId;

          const mobile = getTabSpecificData("phoneNumber");
          const pgCode = pgResponse?.data?.data?.pgCode;
          const payable = calculateTotalPayable();
          if (payable > 0) {
            const payload = {
              pgCode: pgCode,
              travelCategory: TRAVEL_CATEGORIES.HOTELS,
              walletAmount: parseFloat(priceBreakup?.totalAmount - payable),
              charges: 0,
              paymentCategory: "BOOKING",
              bookingId: bookingId,
              companyId: companyId,
              orderAmount: parseFloat(payable),
              orderCurrency: "INR",
              customerDetails: {
                customerName: null,
                customerEmail: null,
                customerPhone: mobile,
              },
            };
            const response = await axios.post(
              `${config.GET_SESSION_ID}`,
              payload
            );
            if (response?.data?.status === "SUCCESS") {
              const session = response?.data?.data;
              const queryParams = {
                bookingId: bookingId,
              };
              await routeToPg(
                pgCode,
                session.paymentSessionId,
                queryParams,
                bookingId,
                TRAVEL_CATEGORIES.HOTELS,
                "BOOKING",
                "",
                companyId
              );
            }
          } else {
            const confirmReq = {
              bookingId: approvalData?.bookingId,
              paymentRefernceId: companyId,
              paymentStatus: "SUCCESS",
              paymentAmount: payable,
              pgCode: pgCode,
              walletAmount: priceBreakup?.totalAmount - payable,
            };
            const resp = await confirmPaymentHotels(confirmReq);
            // if (resp) {
            router.push({
              pathname: "/corporate/auth/booking/hotels/confirmation",
              query: { bookingId: approvalData?.bookingId },
            });
            // }
          }
        }
      }
    } catch (error) {
      showToast("error", "Something went wrong, please try again later!");
      console.log(error);
    } finally {
      setIsBookingLoading(false);
    }
  };

  const renderActionButton = () => {
    if (!allEmployeesNoApproval) {
      return (
        <div className="mt-8">
          <button
            className={`w-full sm:w-1/4 bg-[#028fa3] p-2 rounded-full text-white ${(isOutOfPolicySendApproval || !proceedToggle) &&
              "opacity-50 cursor-not-allowed"
              }`}
            onClick={!isOutOfPolicySendApproval ? handleApproverSubmit : null}
            disabled={!proceedToggle || isOutOfPolicySendApproval}
          >
            Request for Approval
          </button>
          {outOfPolicyTravelers && (
            <div onMouseEnter={handleHoverStart} onMouseLeave={handleHoverEnd}>
              <OutOfPolicy outOfPolicyTravelers={outOfPolicyTravelers} />
            </div>
          )}
        </div>
      );
    } else if (allEmployeesNoApproval && isWalletAllowed) {
      return (
        <div className="mt-4 w-full pb-10">
          <button
            className={`w-fit px-4 mt-5 flex flex-col items-center bg-[#028fa3] p-2 rounded-full text-white peer-checked:pointer-events-auto ${(isOutOfPolicySendApproval || !proceedToggle) &&
              "opacity-50 cursor-not-allowed"
              }`}
            type="button"
            onClick={!isOutOfPolicySendApproval ? initiatePayment : null}
            disabled={
              isBookingLoading || !proceedToggle || isOutOfPolicySendApproval
            }
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
          {outOfPolicyTravelers && (
            <div onMouseEnter={handleHoverStart} onMouseLeave={handleHoverEnd}>
              <OutOfPolicy outOfPolicyTravelers={outOfPolicyTravelers} />
            </div>
          )}
        </div>
      );
    }
  };

  if (!previewData) {
    return <ReviewBookingSkeleton />;
  }

  const allEmployeesNoApproval = employeesNeedingApproval.length === 0;

  return (
    <ProtectedRoute>
      <Head>
        <title>Review Booking</title>
      </Head>
      <div class="border-b">
        <Header />
      </div>
      <div className="bg-[#E5E9EB] px-3 sm:p-4 pb-2 2xl:mx-[12%]">
        <span className="text-xl sm:text-2xl font-semibold sm:font-medium text-[#171A19]">
          Review Booking to send for approval
        </span>
        <div className="flex flex-col-reverse sm:flex-row gap-4 mt-4">
          <div className="w-full sm:w-3/4">
            <Approver
              travellers={refactoredCorporateEmployees}
              travelCategory={TRAVEL_CATEGORIES.HOTELS}
              parentClassName="bg-white p-4 rounded-lg"
            />
            <TravelerDetailsForm
              travelCategory="hotel"
              travelerDetails={travelerDetails}
              setTravelerDetails={setTravelerDetails}
              travelDetailsData={travelDetailsData}
              scrollToFirstError={scrollToFirstError}
              validator={validator}
              updateValidator={() =>
                updateValidator(customMessages, customRules, true)
              }
              onScrollHandled={handleScrollHandled}
            />

            <div className="bg-white p-4 rounded-lg mt-2">
              <ContactDetails
                email={travelerDetails?.[0]?.[0]?.email || ""}
                mobile={travelerDetails?.[0]?.[0]?.contactNo || ""}
              />
            </div>

            {/* GST details */}
            <div className="bg-white p-4 rounded-lg mt-2">
              <GSTDetails
                companyName={gstDetails?.companyName}
                gstNumber={gstDetails?.companyGst}
                companyEmail={gstDetails?.gstEmail}
                companyMobile={gstDetails?.gstMobileNumber}
                companyAddress={gstDetails?.address}
              />
            </div>

            <CancellationPolicy roomData={cancellationPolicies} />

            {allEmployeesNoApproval && isWalletAllowed && (
              <UseWalletBalanceButton
                walletBalance={walletBalance}
                checkwallet={checkwallet}
                goToWalletDetails={goToWalletDetails}
              />
            )}

            <div className="p-4 mt-2">
              <div class="flex items-center">
                <input
                  id="link-checkbox"
                  type="checkbox"
                  onClick={handleProceedToggle}
                  checked={proceedToggle}
                  value=""
                  class="w-4 h-4 cursor-pointer text-[#028fa3] bg-gray-900 border-gray-300 rounded focus:ring-[#028fa3] dark:focus:ring-[#028fa3] dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                />
                <label
                  for="link-checkbox"
                  class="ms-2 text-sm font-medium text-gray-900 dark:text-black cursor-pointer"
                >
                  By proceeding with this booking, I agree to Qugo&apos;s{" "}
                  <a
                    target="_blank"
                    href="/bookingtermsandconditions"
                    class="text-[#028fa3] underline"
                  >
                    Terms of use{" "}
                  </a>
                  and
                  <a
                    target="_blank"
                    href="/bookingprivacypolicy"
                    class="text-[#028fa3] underline"
                  >
                    {" "}
                    Privacy Policy
                  </a>
                  .{" "}
                </label>
              </div>

              {renderActionButton()}
            </div>
          </div>
          <div className="w-full sm:w-2/5 bg-white p-2 rounded-lg h-fit">
            <HotelReview
              hotel={previewData.hotel}
              rooms={previewData.rooms}
              searchData={previewData.searchRequest}
              priceBreakup={priceBreakup}
            />
          </div>

          {/* modal for request for approval */}
          {isRequestModalOpen && (
            <RequestModal
              isOpen={isRequestModalOpen}
              onClose={closeModal}
              title="Send Approval"
              subtitle="You will get notification to continue booking once the request gets approved."
              showApproverDetails={true}
              showReasonInput={true}
              onSubmit={handleSendApproval}
              travellers={previewData.searchRequest.selectedTravelers}
              buttonConfig={{
                cancel: "Close",
                submit: "Send Approval Request",
              }}
            />
          )}
          {/* modal for request for approval */}
          {isRequestSent && (
            <SentRequestModal
              isSentRequest={isRequestSent}
              onClose={() => setIsRequestSent(false)}
            />
          )}
        </div>
      </div>
      <Footer2 />
    </ProtectedRoute>
  );
}
