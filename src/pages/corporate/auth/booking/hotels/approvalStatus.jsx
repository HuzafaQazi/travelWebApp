import { useState, useEffect, useCallback, useMemo } from "react";
import { useRouter } from "next/router";
import axios, { getTabSpecificData } from "@/utils/axios/axios";
import config from "@/config";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Header from "@/components/corporate/auth/Header";
import { faClock, faSpinner } from "@fortawesome/free-solid-svg-icons";
import RequestModal from "@/components/corporate/approvalRequest/request";
import Approver from "@/components/corporate/approvalRequest/ApproverDetails";
import Head from "next/head";
import showToast from "@/utils/toast";
import GSTDetails from "@/components/corporate/details/GSTDetails";
import TravellerDetails from "@/components/corporate/details/TravellerDetails";
import CancellationPolicy from "@/components/corporate/booking/hotels/CancellationPolicy";
import {
  ErrorMessage,
  NoDataMessage,
} from "@/components/corporate/errorStatus/StatusComponents";
import HotelReview from "@/components/corporate/booking/hotels/HotelReview";
import TravelReqestStatus from "@/components/corporate/common/TravelRequestStatus";
import ApprovalStatusSkeleton from "@/components/corporate/Loaders/Hotel/ApprovalStatusSkeleton";
import UseWalletBalanceButton from "@/components/wallet/walletButton/useWalletButton";
import { retryApiCall } from "@/utils/retryApi";
import { routeToPg } from "@/paymentGateways/pgRouting";
import { formatPrice } from "@/utils/common";
import { useWalletBalance } from "@/hooks/useWalletBalance";
import { confirmPaymentHotels } from "@/utils/walletApis";
import Footer2 from "@/components/corporate/footerCorporate/footerCorporate";
import { useSelector, useDispatch } from "react-redux";
import { setApprovalStatusNeedsRefresh } from "@/store/slices/approvalSlice";
import { transformTravelPolicy, checkIfRoomRefundable } from "@/utils/common";
import ProtectedRoute from "@/components/corporate/protectedRoute/ProtectedRoute";
import { getHotelEmployeeData } from "@/utils/corporate/travelPolicy";
import {
  HOTEL_BUDGET_DOMESTIC_ID,
  HOTEL_BUDGET_INTERNATIONAL_ID,
} from "@/utils/constants";
import { useUserPermissions } from "@/hooks/useUserPermissions";
import { selectCorporateCompanyId } from "@/store/selectors/corporateSelectors";

export default function ApprovalStatus() {
  const router = useRouter();
  const dispatch = useDispatch();

  const {  bookingId } = router.query;
  const { walletBalance } = useWalletBalance();

  const needsRefresh = useSelector(
    (state) => state.approvals.approvalStatusNeedsRefresh[1]
  );
  const userDetails = useSelector((state) => state?.user?.userInfo);
  const isWalletAllowed =
    userDetails?.loggedInDetails?.configuration?.walletAllowed;
       const companyId = useSelector(selectCorporateCompanyId);

  const [approvalData, setApprovalData] = useState(null);
  const [pricingData, setPricingData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [proceedPaymentBtnLoader, setProceedPaymentBtnLoader] = useState(false);
  const [walletSelected, setWalletSelected] = useState(false);
  const [isApprovedCancelModalOpen, setIsApprovedCancelModalOpen] =
    useState(false);
      const { userType } = useUserPermissions();

  const fetchData = useCallback(async () => {
    if (companyId && bookingId) {
      try {
        setIsLoading(true);
        setErrorMessage("");

        const fetchApprovalData = async () => {
          return await axios.get(
            `${config.CORPORATE.GET_APPROVAL_STATUS}?companyId=${companyId}&bookingId=${bookingId}`
          );
        };
        // Use the retry logic to fetch approval data
        const approvalResponse = await retryApiCall(fetchApprovalData, 5, 2000); // Retry 5 times with 2-second delay

        if (approvalResponse?.data?.status === "SUCCESS") {
          const fetchedApprovalData = approvalResponse?.data?.data;

          // Transform approvalDetails
          const transformedApprovalDetails =
            fetchedApprovalData.approvalDetails.map((approvalDetail) => {
              return {
                value: approvalDetail.employeeUserId, // Employee User ID
                label: approvalDetail.employeeEmail, // Label is employee's email
                data: {
                  _id: approvalDetail.employeeUserId,
                  firstName: approvalDetail.employeeName,
                  workEmail: approvalDetail.employeeEmail, // Use employee email
                  approverUserDetails: approvalDetail?.approvers?.map(
                    (approver, i) => ({
                      _id: approver.approverId || i,
                      title: approver.title || "",
                      firstName: approver.firstName || "Unknown",
                      lastName: approver.lastName || "",
                      workEmail: approver.email,
                      approvalStatus: approver.approvalStatus || "Pending", // Approver's status
                    })
                  ),
                },
              };
            });

          // Extract passenger details from HotelRoomsDetails
          const hotelPassengers = [];
          const adultsPerRoom = [];
          const rooms = [];
          const cancellationPolicy = [];
          let totalRoomPrice = 0;
          let totalDiscount = 0;
          let totalTaxes = 0;
          let totalAmount = 0;
          let totalAdultCount = 0;
          fetchedApprovalData?.bookingdetails?.BookRoomDetails?.HotelRoomsDetails?.forEach(
            (room, index) => {
              room.HotelPassenger.forEach((passenger) => {
                hotelPassengers.push({
                  id: passenger.Id,
                  name: `${passenger.FirstName} ${passenger.LastName}`,
                  email: passenger.Email,
                  isOutOfPolicy: false,
                  travelPolicyDetails: (passenger.travelPolicy || []).map(
                    transformTravelPolicy
                  ),
                });
              });

              // Number of passengers in the room
              const roomPassengersCount = room?.HotelPassenger?.length || 0;
              adultsPerRoom[index] = roomPassengersCount;

              // Accumulate total adult count
              totalAdultCount += roomPassengersCount;

              // Collect room data
              rooms.push({
                roomTypeName: room.RoomTypeName,
                inclusion: room?.Inclusions?.map((inc) => inc.inclusion) || [],
              });

              // Cancellation Policy
              cancellationPolicy.push({
                roomName: room.RoomTypeName,
                cancellationPolicies:
                  room.CancellationPolicies?.map((policy) => ({
                    FromDate: policy.fromDate,
                    ToDate: policy.toDate,
                    ChargeType: policy.chargeType,
                    Currency: policy.currency,
                    Charge: policy.charge,
                  })) || [],
              });

              // Accumulate price data
              const price = room.Price;
              totalRoomPrice += price.qOfferedPriceWithoutTax || 0;
              totalDiscount += price.Discount || 0;
              totalTaxes += price.qCommissionTax || 0;
              totalAmount += price.qOfferedPriceRoundedOff || 0;
            }
          );

          // Calculate priceAfterDiscount
          const priceAfterDiscount = totalRoomPrice - totalDiscount;

          const updatedTotalAmount = priceAfterDiscount + totalTaxes;

          const priceBreakup = {
            totalRoomPrice,
            totalDiscount,
            priceAfterDiscount,
            totalTaxes,
            totalAmount,
          };

          // Extract searchData
          const checkInDateRange = new Date(
            fetchedApprovalData?.bookingdetails?.BookRoomDetails?.CheckInDate
          );
          const checkOutDateRange = new Date(
            fetchedApprovalData?.bookingdetails?.BookRoomDetails?.CheckOutDate
          );
          const noOfNights =
            fetchedApprovalData?.bookingdetails?.BookRoomDetails?.NoOfNights.toString();
          const noOfRooms =
            fetchedApprovalData?.bookingdetails?.BookRoomDetails?.NoOfRooms;

          const searchData = {
            checkInDateRange,
            checkOutDateRange,
            noOfNights,
            noOfRooms,
            adultsPerRoom,
          };

          // Extract hotel data
          const hotel = {
            hotelName:
              fetchedApprovalData?.bookingdetails?.BookRoomDetails?.HotelName,
            hotelAddress:
              `${fetchedApprovalData?.bookingdetails?.BookRoomDetails?.CityName},${fetchedApprovalData?.bookingdetails?.BookRoomDetails?.CountryName}` ||
              "Address not available",
            hotelStaticImageUrl:
              fetchedApprovalData?.bookingdetails?.HotelImageUrl || null,
            starRating:
              fetchedApprovalData?.bookingdetails?.BookRoomDetails?.Ratings ||
              0,
          };

          const hotelReview = { hotel, rooms, searchData, priceBreakup };

          const oldTotalPrice =
            fetchedApprovalData?.bookingdetails?.BookRoomDetails?.HotelRoomsDetails?.reduce(
              (total, room) =>
                total + (room.Price?.qOfferedPriceRoundedOff || 0),
              0
            );

          // Set the transformed data into state
          setApprovalData({
            ...fetchedApprovalData,
            transformedApprovalDetails,
            hotelPassengers,
            cancellationPolicy,
            hotelReview,
            totalAmount: oldTotalPrice,
          });

          // Check if the approval status is not cancelled or declined
          if (
            fetchedApprovalData.approvalStatus.toLowerCase().trim() !==
            "cancelled" &&
            fetchedApprovalData.approvalStatus.toLowerCase().trim() !==
            "declined"
          ) {
            // Call block room API
            try {
              const ipAddress = getTabSpecificData("userip");

              const blockRoomPayload = {
                BlockRoomDetails: {
                  HotelCode:
                    fetchedApprovalData?.bookingdetails?.BookRoomDetails
                      ?.HotelCode,
                  HotelName:
                    fetchedApprovalData?.bookingdetails?.BookRoomDetails
                      ?.HotelName,
                  GuestNationality:
                    fetchedApprovalData?.bookingdetails?.BookRoomDetails
                      ?.GuestNationality || "IN",
                  NoOfRooms:
                    fetchedApprovalData?.bookingdetails?.BookRoomDetails?.NoOfRooms?.toString(),
                  ClientReferenceNo: 0,
                  IsVoucherBooking:
                    fetchedApprovalData?.bookingdetails?.BookRoomDetails
                      ?.IsVoucherBooking,
                  CategoryId:
                    fetchedApprovalData?.bookingdetails?.BookRoomDetails
                      ?.CategoryId,

                  HotelRoomsDetails:
                    fetchedApprovalData?.bookingdetails?.BookRoomDetails?.HotelRoomsDetails?.map(
                      (room) => ({
                        RoomIndex: room?.RoomIndex,
                        RoomTypeCode: room?.RoomTypeCode,
                        RoomDescription:
                          room?.roomDescription || room?.RoomTypeName,
                        RoomTypeName: room?.RoomTypeName,
                        RatePlanCode: room?.RatePlanCode,
                        BedTypeCode: room?.BedTypeCode || null,
                        SmokingPreference: room?.SmokingPreference,
                        Supplements: room?.Supplements || null,
                        Price: {
                          CurrencyCode: room?.Price?.CurrencyCode,
                          RoomPrice: room?.Price?.RoomPrice,
                          Tax: room?.Price?.Tax,
                          ExtraGuestCharge: room?.Price?.ExtraGuestCharge,
                          ChildCharge: room?.Price?.ChildCharge,
                          OtherCharges: room?.Price?.OtherCharges,
                          Discount: room?.Price?.Discount,
                          PublishedPrice: room?.Price?.PublishedPrice,
                          PublishedPriceRoundedOff:
                            room?.Price?.PublishedPriceRoundedOff,
                          OfferedPrice: room?.Price?.OfferedPrice,
                          OfferedPriceRoundedOff:
                            room?.Price?.OfferedPriceRoundedOff,
                          AgentCommission: room?.Price?.AgentCommission,
                          AgentMarkUp: room?.Price?.AgentMarkUp,
                          ServiceTax: room?.Price?.ServiceTax,
                          TDS: room?.Price?.TDS,
                          TCS: room?.Price?.TCS,
                        },
                      })
                    ),
                },
                vendorcode: fetchedApprovalData?.bookingdetails?.vendorcode,
                cartId: fetchedApprovalData?.bookingdetails?.cartId || null,
                ipAddress:
                  fetchedApprovalData?.bookingdetails?.ipAddress ||
                  ipAddress ||
                  null,
                qTraceId: fetchedApprovalData?.bookingdetails?.qTraceId,
                paxCountDetails: [
                  {
                    AdultCount: totalAdultCount,
                    ChildCount: 0,
                    ChildAge: [],
                  },
                ],
              };

              const blockRoomResponse = await axios.post(
                `${config.BLOCK_ROOM}`,
                blockRoomPayload
              );

              if (blockRoomResponse?.data?.status === "SUCCESS") {
                const isPriceChanged =
                  blockRoomResponse?.data?.data?.BlockRoomResult
                    ?.IsPriceChanged;

                const newTotalPrice =
                  blockRoomResponse?.data?.data?.BlockRoomResult?.HotelRoomsDetails?.reduce(
                    (total, room) =>
                      total + (room.Price?.OfferedPriceRoundedOff || 0),
                    0
                  );

                if (isPriceChanged || newTotalPrice > oldTotalPrice) {
                  // Price increased, call cancel approval API
                  await handleCancelApproval({
                    companyId,
                    bookingId,
                    reason: "Price Increase",
                    description: `Hotel price increased from ${oldTotalPrice} to ${newTotalPrice}.`,
                    toastMessage: {
                      type: "error",
                      message: "Approval cancelled due to price increase.",
                    },
                  });

                  const priceDifference = newTotalPrice - oldTotalPrice;

                  // Update pricing data
                  setPricingData({
                    newTotalPrice,
                    oldTotalPrice,
                    priceDifference,
                  });
                }
              }
            } catch (blockRoomError) {
              console.error("Error in block room API:", blockRoomError);
            }
          }
        }

        setIsLoading(false);
      } catch (err) {
        console.log(err);
        setErrorMessage(
          "Something went wrong while fetching approval data. Please try again later."
        );
        setIsLoading(false);
      }
    }
  }, [companyId, bookingId]);

  // Fetch data when companyId or bookingId changes
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    if (needsRefresh) {
      fetchData();
      dispatch(
        setApprovalStatusNeedsRefresh({ travelCategory: 1, status: false })
      );
    }
  }, [needsRefresh, dispatch, fetchData]);

  useEffect(() => {
    const handleBodyScroll = () => {
      document.body.style.overflow = isCancelModalOpen ? "hidden" : "auto";
    };

    handleBodyScroll();
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [isCancelModalOpen]);

  // Function to open the modal
  const openCancelModal = () => {
    if (approvalData?.approvalStatus?.toLowerCase()?.trim() === "approved") {
      setIsApprovedCancelModalOpen(true);
    } else {
      setIsCancelModalOpen(true);
    }
  };

  const renderActionButton = () => {
    if (pricingData && pricingData?.priceDifference) {
      return (
        <button
          className="w-fit px-4 mt-5 flex flex-col items-center bg-[#155EEF] p-2 rounded-full text-white peer-checked:pointer-events-auto"
          type="button"
          onClick={() => setIsRequestModalOpen(true)}
        >
          <span>Request for Approval</span>
          <span className="text-xs font-light">
            Price increased by
            <span className="font-semibold">
              {" "}
              Rs {pricingData?.priceDifference || 0}
            </span>
            , you can resend the request!
          </span>
        </button>
      );
    } else if (
      approvalData?.approvalStatus?.toLowerCase()?.trim() === "approved" &&
      approvalData?.paymentStatus?.toLowerCase()?.trim() !== "success" &&
      (isWalletAllowed || userType === 1)
    ) {
      return (
        <button
          className="w-fit px-4 mt-5 flex flex-col items-center bg-[#155EEF] p-2 rounded-full text-white peer-checked:pointer-events-auto"
          type="button"
          onClick={handlePayment}
          disabled={proceedPaymentBtnLoader}
        >
          <div className="flex items-center gap-2">
            {proceedPaymentBtnLoader ? (
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
      );
    }
  };

  const handleCancelApproval = async (cancelData) => {
    const { companyId, bookingId, reason, description, toastMessage } =
      cancelData;
    try {
      let url = `${config.CORPORATE.CANCEL_APPROVAL}?bookingId=${bookingId}&companyId=${companyId}`;

      if (reason) {
        url += `&reason=${encodeURIComponent(reason)}`;
      }
      if (description) {
        url += `&description=${encodeURIComponent(description)}`;
      }
      const response = await axios.post(url);
      if (response?.data?.status === "SUCCESS") {
        showToast(toastMessage.type, toastMessage.message);
        // Optionally, update the local state or refetch data
        setApprovalData((prevData) => ({
          ...prevData,
          approvalStatus: "Cancelled",
        }));
      }
    } catch (error) {
      console.log(error);
      showToast(
        "error",
        error?.response?.data?.message || "Something went wrong"
      );
    }
  };

  const handleManualCancellation = async (data) => {
    await handleCancelApproval({
      companyId,
      bookingId,
      reason: data.reason,
      description: data.description,
      toastMessage: {
        type: "success",
        message: "Approval Request cancelled successfully",
      },
    });
    setIsCancelModalOpen(false);
  };

  const handlePayment = async () => {
    setProceedPaymentBtnLoader(true);
    try {
      const pgResponse = await axios.get(config.GET_PAYMENT_GATEWAY);

      if (pgResponse?.data?.status === "SUCCESS") {
        const mobile = getTabSpecificData("phoneNumber");
        const pgCode = pgResponse?.data?.data?.pgCode;
        const payable = calculateTotalPayable();
        if (payable > 0) {
          const payload = {
            pgCode: pgCode,
            travelCategory: approvalData?.travelCategory,
            walletAmount: Math.max(0,parseFloat(approvalData?.totalAmount - payable)),
            charges: 0,
            paymentCategory: "BOOKING",
            bookingId: approvalData?.bookingId,
            companyId: approvalData?.companyId,
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
              bookingId: approvalData?.bookingId,
            };
            await routeToPg(
              pgCode,
              session.paymentSessionId,
              queryParams,
              approvalData?.bookingId,
              1,
              "BOOKING",
              "",
              companyId
            );
          }
        } else {
          const confirmReq = {
            bookingId: approvalData?.bookingId,
            paymentRefernceId: approvalData?.companyId,
            paymentStatus: "SUCCESS",
            paymentAmount: payable,
            pgCode: pgCode,
            walletAmount: approvalData?.totalAmount - payable,
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
    } catch (error) {
      showToast("error", "Something went wrong, please try again later!");
      console.log(error);
    } finally {
      setProceedPaymentBtnLoader(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString + "Z");
    const formattedDate = date.toLocaleDateString("en-GB", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
      timeZone: "UTC",
    });
    const formattedTime = date.toLocaleTimeString("en-GB", {
      hour: "numeric",
      minute: "numeric",
      hour12: true,
      timeZone: "UTC",
    });

    return `${formattedDate} at ${formattedTime}`;
  };

  const formatDate1 = (dateString) => {
    // Parse the date and ensure it's valid
    if (!dateString || isNaN(new Date(dateString).getTime())) {
      return "Invalid Date"; // Fallback for invalid dates
    }

    const date = new Date(dateString);

    // Format the date with the weekday
    const formattedDate = date.toLocaleDateString("en-GB", {
      weekday: "long", // Include full weekday name
      day: "numeric", // Numeric day without leading zero
      month: "long", // Full month name
      year: "numeric", // Full year
      timeZone: "IST", // Ensure UTC time zone
    });

    // Format the time in 12-hour format
    const formattedTime = date.toLocaleTimeString("en-GB", {
      hour: "numeric", // Numeric hour
      minute: "2-digit", // Two-digit minutes
      hour12: true, // 12-hour format
      timeZone: "IST", // Ensure UTC time zone
    });

    // Combine date and time
    return `${formattedDate} at ${formattedTime}`;
  };

  const calculateTotalPayable = () => {
    let totalFare = approvalData?.totalAmount;
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

  const getWalletDeduction = () => {
    if (walletSelected && walletBalance) {
      if (walletBalance >= approvalData?.totalAmount) {
        return approvalData?.totalAmount;
      } else {
        return walletBalance;
      }
    }
    return 0;
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "confirmed":
      case "success":
        return "text-green-600";
      case "pending":
        return "text-yellow-600";
      case "cancelled":
      case "failed":
        return "text-red-600";
      default:
        return "text-gray-600";
    }
  };

  const sharedParams = useMemo(() => {
    if (!approvalData || !approvalData.bookingdetails) {
      return {
        corporateEmployees: [],
        hotelCategory: undefined,
        totalAmount: 0,
        regionId: null,
        isRefundable: undefined,
      };
    }
    const totalAmount = approvalData.totalAmount; // old total price
    const noOfRooms = approvalData.bookingdetails.BookRoomDetails.NoOfRooms;
    const hotelCategory = approvalData.bookingdetails.BookRoomDetails.Ratings; // star rating
    const isDomesticHotel = approvalData.bookingdetails.IsDomestic;
    const finalRegionId = isDomesticHotel
      ? HOTEL_BUDGET_DOMESTIC_ID
      : HOTEL_BUDGET_INTERNATIONAL_ID;

    const transformedRooms =
      approvalData.bookingdetails.BookRoomDetails.HotelRoomsDetails.map(
        (room) => {
          return {
            ...room,
            cancellationPolicies: room.CancellationPolicies
              ? room.CancellationPolicies.map((policy) => ({
                FromDate: policy.fromDate,
                ToDate: policy.toDate,
                ChargeType: policy.chargeType,
                Currency: policy.currency,
                Charge: policy.charge,
              }))
              : [],
            price: room.Price
              ? {
                CurrencyCode: room.Price.CurrencyCode,
                RoomPrice: room.Price.RoomPrice,
                AgentCommission: room.Price.AgentCommission,
                AgentMarkUp: room.Price.AgentMarkUp,
                ChildCharge: room.Price.ChildCharge,
                Discount: room.Price.Discount,
                ExtraGuestCharge: room.Price.ExtraGuestCharge,
                OfferedPrice: room.Price.OfferedPrice,
                OfferedPriceRoundedOff: room.Price.OfferedPriceRoundedOff,
                OtherCharges: room.Price.OtherCharges,
                PublishedPrice: room.Price.PublishedPrice,
                PublishedPriceRoundedOff: room.Price.PublishedPriceRoundedOff,
                ServiceTax: room.Price.ServiceTax,
                Tax: room.Price.Tax,
                TDS: room.Price.TDS,
                TCS: room.Price.TCS,
                qOfferedPrice: room.Price.qOfferedPrice,
                qOfferedPriceWithoutTax: room.Price.qOfferedPriceWithoutTax,
                qOfferedPriceRoundedOff: room.Price.qOfferedPriceRoundedOff,
                qCommission: room.Price.qCommission,
                qCommissionTax: room.Price.qCommissionTax,
              }
              : {},
          };
        }
      );

    // Now, determine if all rooms are refundable using your common function.
    const allRoomsRefundable = transformedRooms.every((room) =>
      checkIfRoomRefundable(room)
    );

    const transformedCorporateEmployees = approvalData.hotelPassengers.map(
      (passenger) => ({
        label: `${passenger.name}`, // Full name
        value: passenger.id, // Passenger ID
        data: { ...passenger }, // Full passenger object
      })
    );

    return {
      corporateEmployees: transformedCorporateEmployees,
      hotelCategory: hotelCategory || undefined,
      totalAmount: totalAmount / noOfRooms,
      regionId: finalRegionId,
      isRefundable: allRoomsRefundable,
    };
  }, [approvalData]);

  const refactoredCorporateEmployees = useMemo(() => {
    return getHotelEmployeeData(sharedParams);
  }, [sharedParams]);

  return (
    <ProtectedRoute>
      <Head>
        <title>Approval Status</title>
      </Head>

      <div className="border-b">
        <Header />
      </div>
      {isLoading ? (
        <ApprovalStatusSkeleton />
      ) : errorMessage ? (
        <ErrorMessage message={errorMessage} />
      ) : !approvalData ? (
        <NoDataMessage message="No approval data available" />
      ) : (
        <>
          {/* conditional approval status */}
          <div className="bg-[#E5E9EB] p-4 pt-8 pb-2 2xl:mx-[12%]">
            <div className="flex flex-col-reverse sm:flex-row gap-4 mt-2 sm:mt-4">
              <div className="w-full sm:w-3/4">
                <div className="hidden sm:block">
                  <TravelReqestStatus
                    approvalStatus={approvalData?.approvalStatus}
                    paymentStatus={approvalData?.paymentStatus
                      ?.toLowerCase()
                      ?.trim()}
                  />
                </div>
                {/* waiting time for approval */}

                <div className="bg-white p-4 rounded-lg mt-2 font-medium text-xxs sm:text-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-4">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                    <div className="flex items-center">
                      <FontAwesomeIcon icon={faClock} color="#7E0ED6" />
                      <span className="ml-2">Your travel is</span>
                    </div>


                    <div className="flex items-center">
                      <span className="text-gray-600">Requested on:</span>
                      <span className="ml-1 font-semibold">
                        {formatDate(
                          approvalData?.bookingdetails?.BookRoomDetails
                            ?.CreateDate
                        )}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center">
                    <span className="text-gray-600">Booking Status:</span>
                    <span
                      className={`ml-1 font-semibold ${getStatusColor(
                        approvalData?.bookingdetails?.BookRoomDetails
                          ?.BookingStatus
                      )}`}
                    >
                      {approvalData?.bookingdetails?.BookRoomDetails
                        ?.BookingStatus || "Pending"}
                    </span>
                  </div>
                </div>

                {/* approver details */}
                <Approver
                  parentClassName="bg-white p-4 mt-2 rounded-lg"
                  travellers={approvalData?.transformedApprovalDetails}
                  approvalStatus={approvalData?.approvalStatus}
                  travelReason={approvalData?.reasonForTravel}
                  cancelledOn={formatDate1(approvalData?.updatedAt)}
                />

                <TravellerDetails
                  // travellers={approvalData?.hotelPassengers}
                  travellers={refactoredCorporateEmployees}
                  travelCategory={approvalData?.travelCategory}
                />

                {/* GST details */}
                <div className="bg-white p-4 mt-2 rounded-lg">
                  <GSTDetails
                    companyName={approvalData?.companyDetails?.companyName}
                    gstNumber={approvalData?.companyDetails?.gst}
                    companyEmail={approvalData?.companyDetails?.gstEmail}
                    companyMobile={
                      approvalData?.companyDetails?.gstMobileNumber
                    }
                    companyAddress={approvalData?.companyDetails?.address}
                  />
                </div>

                {approvalData?.approvalStatus === "Approved" &&
                  approvalData?.paymentStatus?.toLowerCase()?.trim() !==
                  "success" &&
                  (isWalletAllowed || userType === 1) && (
                    <UseWalletBalanceButton
                      walletBalance={walletBalance}
                      checkwallet={checkwallet}
                      goToWalletDetails={goToWalletDetails}
                    />
                  )}

                <CancellationPolicy
                  roomData={approvalData.cancellationPolicy}
                />

                {renderActionButton()}

                {isRequestModalOpen && (
                  <RequestModal
                    isOpen={isRequestModalOpen}
                    onClose={() => setIsRequestModalOpen(false)}
                    title="Send Approval"
                    subtitle="You will get notification to continue booking once the request gets approved."
                    showApproverDetails={true}
                    showReasonInput={true}
                    travellers={approvalData.transformedApprovalDetails}
                    buttonConfig={{
                      cancel: "Close",
                      submit: "Send Approval Request",
                    }}
                  />
                )}

                {isCancelModalOpen && (
                  <RequestModal
                    isOpen={isCancelModalOpen}
                    onClose={() => setIsCancelModalOpen(false)}
                    title="Are you sure you want to cancel your Travel Request ?"
                    subtitle="If you cancel your request, Your approver will be notified about the cancellation."
                    showApproverDetails={false}
                    showReasonInput={true}
                    onSubmit={handleManualCancellation}
                    buttonConfig={{
                      submit: "Cancel Request",
                    }}
                    cancelPopup={isCancelModalOpen}
                  />
                )}

                {isApprovedCancelModalOpen && (
                  <RequestModal
                    isOpen={isApprovedCancelModalOpen}
                    onClose={() => setIsApprovedCancelModalOpen(false)}
                    title="Cancel Approved Request"
                    subtitle="This request has already been approved. Cancelling it will notify all approvers and might affect any arrangements made. Are you sure you want to proceed?"
                    showApproverDetails={false}
                    showReasonInput={false}
                    onSubmit={handleManualCancellation}
                    buttonConfig={{
                      cancel: "No, Keep Request",
                      submit: "Yes, Cancel Request",
                    }}
                    cancelPopup={true}
                  />
                )}
              </div>
              <div className="w-full sm:w-2/5">
                <div className="block sm:hidden">
                  <TravelReqestStatus
                    approvalStatus={approvalData?.approvalStatus}
                    paymentStatus={approvalData?.paymentStatus
                      ?.toLowerCase()
                      ?.trim()}
                  />
                </div>
                {approvalData?.approvalStatus !== "Cancelled" &&
                  approvalData?.approvalStatus !== "Declined" &&
                  approvalData?.paymentStatus !== "SUCCESS" &&
                  userDetails?.userId === approvalData?.userId && (
                    <div className="w-full">
                      <button
                        className="bg-[#155EEF] w-full text-white text-sm p-3 mt-2 sm:mt-5 rounded-lg"
                        onClick={openCancelModal}
                      >
                        Cancel Request
                      </button>
                    </div>
                  )}
                {approvalData?.approvalStatus === "Declined" && (
                  <div className="w-full">
                    <button
                      className="bg-[#155EEF] w-full text-white text-sm p-3 mt-5 rounded-lg"
                      onClick={() => router.push("/corporate/auth/booking")}
                    >
                      Go to Homepage
                    </button>
                  </div>
                )}
                <div className="bg-white p-2 mt-2 rounded-lg h-fit">
                  <HotelReview
                    hotel={approvalData?.hotelReview?.hotel}
                    rooms={approvalData?.hotelReview?.rooms}
                    searchData={approvalData?.hotelReview?.searchData}
                    priceBreakup={approvalData?.hotelReview?.priceBreakup}
                    updatedPrice={pricingData?.priceDifference}
                    walletDeduction={getWalletDeduction()}
                  />
                </div>
              </div>
            </div>
          </div>
        </>
      )}
      <Footer2 />
    </ProtectedRoute>
  );
}
