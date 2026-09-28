import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import WebSocketService from "@/webSocketService/WebSocketService";
import Header from "@/components/corporate/auth/Header";
import Image from "next/image";
import correct from "@/images/corporate/Ok (1).png";
import cancel from "@/images/corporate/Cancel.png";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCircleDown } from "@fortawesome/free-regular-svg-icons";
import Head from "next/head";
import showToast from "@/utils/toast";
import GSTDetails from "@/components/corporate/details/GSTDetails";
import TravellerDetails from "@/components/corporate/details/TravellerDetails";
import CancellationPolicy from "@/components/corporate/booking/hotels/CancellationPolicy";
import {
  ErrorMessage,
  NoDataMessage,
} from "@/components/corporate/errorStatus/StatusComponents";
import axios, { getTabSpecificData } from "@/utils/axios/axios";
import config from "@/config";
import { savePaymentDetails } from "@/utils/profileAPI";
import Approver from "@/components/corporate/approvalRequest/ApproverDetails";
import HotelReview from "@/components/corporate/booking/hotels/HotelReview";
import HotelConfirmationSkeleton from "@/components/corporate/Loaders/Hotel/HotelConfirmationSkeleton";
import { formatPrice } from "@/utils/common";
import { routeToPg } from "@/paymentGateways/pgRouting";
import moment from "moment";
import Footer2 from "@/components/corporate/footerCorporate/footerCorporate";
import { useUserPermissions } from "@/hooks/useUserPermissions";
import ProtectedRoute from "@/components/corporate/protectedRoute/ProtectedRoute";
import { faSpinner } from "@fortawesome/free-solid-svg-icons";

export default function Confirmation() {
  const router = useRouter();
  const { userType } = useUserPermissions();
  const { bookingId, profile } = router.query;

  const [bookingData, setBookingData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [isRefundModalOpen, setIsRefundModalOpen] = useState(false);
  const [refundDetails, setRefundDetails] = useState(null);
  const [downloading, setDownloading] = useState(false);
  const [downloading1, setDownloading1] = useState(false);

  useEffect(() => {
    const webSocketService = new WebSocketService();
    let isSocketTriggered = false;
    let hasDataLoaded = false;
    let isInitialFetchCompleted = false;

    const fetchBookingDetails = async () => {
      if (!bookingId) return;

      try {
        if (!isInitialFetchCompleted) setIsLoading(true);
        setErrorMessage("");

        // First API call: Fetch booking details
        try {
          const response = await axios.post(
            `${config.GET_BOOKING_DETAILS}?bookingId=${bookingId}`
          );
          if (response?.data?.status === "SUCCESS") {
            const hotelPassengers = [];
            const cancellationPolicies = [];
            const responseData = response?.data?.data;

            // Transform approvalDetails
            const transformedApprovalDetails =
              responseData.BookingMasterData?.ApproverDetails?.map(
                (approvalDetail) => {
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
                }
              );

            responseData?.GetBookingDetailResult?.HotelRoomsDetails?.forEach(
              (room) => {
                room.HotelPassenger.forEach((passenger, index) => {
                  hotelPassengers.push({
                    id: passenger?.Id || index,
                    name: `${passenger?.FirstName} ${passenger?.LastName}`,
                    mobile: passenger?.Phoneno,
                    email: passenger?.Email,
                    isOutOfPolicy: false,
                  });
                });
                cancellationPolicies.push({
                  roomName: room.RoomTypeName,
                  cancellationPolicies: room.CancellationPolicies,
                });
              }
            );

            const hotelData = extractHotelData(responseData);
            console.log(hotelData);

            setBookingData({
              ...responseData,
              hotelPassengers,
              cancellationPolicies,
              hotelReview: hotelData,
              transformedApprovalDetails,
              ps_payment_status:
                responseData?.BookingMasterData?.PaymentStatus?.toLowerCase().trim(),
              booking_status:
                responseData?.BookingMasterData?.BookingStatus?.toLowerCase().trim(),
            });

            hasDataLoaded = true;
            setIsLoading(false);
          } else {
            throw new Error("Failed to fetch booking details");
          }
        } catch (err) {
          console.log(err);
          if (profile || (isInitialFetchCompleted && !isSocketTriggered)) {
            throw new Error("Failed to fetch booking details");
          }
        }

        // Second API call: Fetch payment status
        try {
          if (!profile) await savePaymentDetails(bookingId, "1");
        } catch (err) {
          console.error("Failed to fetch payment status:", err);
          //   throw new Error("Failed to fetch payment status");
        }
      } catch (err) {
        if (profile || (isSocketTriggered && !hasDataLoaded)) {
          setErrorMessage(err.message || "Unable to fetch booking details.");
          setIsLoading(false);
        }
      } finally {
        isInitialFetchCompleted = true;
        if (profile || isSocketTriggered) {
          setIsLoading(false);
        }
        // setIsLoading(false);
      }
    };

    const setupWebSocket = () => {
      try {
        const topic = `/topic/${bookingId}`;
        const callback = (message) => {
          console.log("WebSocket Message:", message);
          isSocketTriggered = true;
          fetchBookingDetails(); // Refresh data on WebSocket message
        };

        // Ensure connection is established before subscribing
        webSocketService.connect(topic, callback, {
          onConnectSuccess: () => {
            setIsLoading(false);
            console.log("WebSocket connection established");
          },
          onConnectError: (error) => {
            console.error("WebSocket connection failed:", error);
          },
        });
      } catch (error) {
        console.error("WebSocket setup error:", error);
      }
    };

    if (bookingId) {
      fetchBookingDetails();
      if (!profile) setupWebSocket();
    }

    return () => {
      webSocketService.disconnect(); // Cleanup WebSocket on unmount
    };
  }, [bookingId, profile]);

  const extractHotelData = (responseData) => {
    const hotel = responseData?.GetBookingDetailResult;
    const roomsDetails = hotel?.HotelRoomsDetails || [];

    // Extracting room name and cancellation policies
    const rooms = roomsDetails?.map((room) => {
      return {
        roomTypeName: room.RoomTypeName,
        cancellationPolicies:
          room.CancellationPolicies?.map((policy) => ({
            Charge: policy.Charge,
            Currency: policy.Currency,
            FromDate: policy.FromDate,
            ToDate: policy.ToDate,
            ChargeType: policy.ChargeType,
          })) || [],
        inclusion: room.Inclusion || [],
      };
    });

    // Hotel data object
    const hotels = {
      hotelStaticImageUrl:
        hotel?.HotelImageUrl || hotel?.HotelStaticImageUrl || "",
      // hotelName: hotel?.HotelName || "Hotel Name Not Available",
      hotelName:
        responseData?.BookingMasterData?.HotelName ||
        "Hotel Name Not Available",
      hotelAddress: `${hotel?.AddressLine1 || ""} ${hotel?.AddressLine2 || ""}`,
      starRating: hotel?.StarRating || 0,
    };

    // Search data (you may adapt this based on your needs)
    const searchData = {
      checkInDateRange: new Date(responseData?.BookingMasterData?.CheckInDate),
      checkOutDateRange: new Date(
        responseData?.BookingMasterData?.CheckOutDate
      ),
      noOfNights: moment(hotel?.CheckOutDate).diff(
        moment(hotel?.CheckInDate),
        "days"
      ),
      noOfRooms: hotel?.NoOfRooms,
      adultsPerRoom: roomsDetails?.map((room) => room?.AdultCount),
    };

    // Price breakup (you can enhance this further)
    const priceBreakup = {
      totalRoomPrice: roomsDetails?.reduce(
        (sum, room) => sum + room.Price.qOfferedPriceWithoutTax,
        0
      ),
      totalDiscount: roomsDetails?.reduce(
        (sum, room) => sum + room.Price.Discount,
        0
      ),
      totalTaxes: roomsDetails?.reduce(
        (sum, room) => sum + room.Price.qCommissionTax,
        0
      ),
      totalAmount: roomsDetails?.reduce(
        (sum, room) => sum + room.Price.qOfferedPriceRoundedOff,
        0
      ),
    };

    return {
      hotel: hotels,
      rooms,
      searchData,
      priceBreakup,
    };
  };

  const formatBookingDate = (bookingDate) => {
    // Parse the date string
    const date = new Date(bookingDate);

    // Format day and month to be two digits
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0"); // Months are zero-based
    const year = date.getFullYear();

    // Format hours and minutes
    let hours = date.getHours();
    const minutes = String(date.getMinutes()).padStart(2, "0");

    // Determine AM/PM and convert hours to 12-hour format
    const ampm = hours >= 12 ? "pm" : "am";
    hours = hours % 12;
    hours = hours ? String(hours).padStart(2, "0") : "12"; // the hour '0' should be '12'

    // Return the formatted date
    return `${day}/${month}/${year} | ${hours}:${minutes} ${ampm}`;
  };

  const redirectHome = async () => {
    setIsLoading(true);
    await router.push("/corporate");
    setIsLoading(false);
  };

  const downloadInvoice = async () => {
    try {
      setDownloading(true);
      const response = await axios.get(`${config.GET_BOOKING_INVOICE}`, {
        params: { bookingId, travelCategory: 1 },
        responseType: "blob",
      });
      if (response && response.data instanceof Blob && response.data.size > 0) {
        let fileName = "INV_" + bookingId + ".pdf";

        const blob = new Blob([response?.data], {
          type: "application/pdf",
        });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.style.display = "none";
        a.href = url;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        return;
      }
      showToast("error", `File corrupted or no data found`);
    } catch (error) {
      console.log(error);
      showToast("error", "Something went wrong while downloading Invoice.");
    }
    finally {
      setDownloading(false); // End downloading, regardless of success or failure
    }
  };
  const downloadTicket = async () => {
    try {
      setDownloading1(true);
      const response = await axios.get(`${config.DOWNLOAD_TICKET}`, {
        params: { bookingId, travelCategory: 1 },
        responseType: "blob",
      });
      if (response && response.data instanceof Blob && response.data.size > 0) {
        let fileName = "HOTEL_VOUCHER_" + bookingId + ".pdf";

        const blob = new Blob([response?.data], {
          type: "application/pdf",
        });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.style.display = "none";
        a.href = url;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        return;
      }
      showToast("error", `File corrupted or no data found`);
    } catch (error) {
      console.log(error);
      showToast("error", "Something went wrong while downloading Ticket.");
    }
    finally {
      setDownloading1(false); // End downloading, regardless of success or failure
    }
  };

  const retryPayment = async () => {
    try {
      const mobile = getTabSpecificData("phoneNumber");
      const companyId = bookingData?.companyId;
      const totalAmount = bookingData?.BookingMasterData?.PaidAmount;
      const pgResponse = await axios.get(config.GET_PAYMENT_GATEWAY);
      if (pgResponse?.data?.status === "SUCCESS") {
        const pgCode = pgResponse?.data?.data?.pgCode;
        const payload = {
          pgCode: pgCode,
          travelCategory: "1",
          walletAmount: 0,
          charges: 0,
          paymentCategory: "BOOKING",
          bookingId: bookingId,
          companyId: companyId,
          orderAmount: totalAmount || 100,
          orderCurrency: "INR",
          customerDetails: {
            customerName: null,
            customerEmail: null,
            customerPhone: mobile,
          },
        };
        const response = await axios.post(`${config.GET_SESSION_ID}`, payload);
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
            1,
            "BOOKING",
            "",
            companyId
          );
        }
      }
    } catch (error) {
      console.error(error);
      showToast("error", "Something went wrong, please try again later");
    }
  };

  const handleRefundStatus = () => {
    const refundData = {
      refundAmount: bookingData?.BookingMasterData?.RefundAmount,
      walletAmount: bookingData?.BookingMasterData?.WalletRefundAmount,
      walletStatus: bookingData?.BookingMasterData?.WalletRefundStatus,
      paymentRefundAmount: bookingData?.BookingMasterData?.PaidRefundAmount,
    };

    if (refundData) {
      setRefundDetails(refundData);
      setIsRefundModalOpen(true);
    } else {
      showToast("error", "No refund details available.");
    }
  };

  const closeRefundModal = () => {
    setIsRefundModalOpen(false);
  };

  console.log(bookingData);

  return (
    <ProtectedRoute>
      <Head>
        <title>Hotel Booking Confirmation</title>
      </Head>
      <div className="border-b">
        <Header />
      </div>
      {isLoading ? (
        <HotelConfirmationSkeleton />
      ) : errorMessage ? (
        <ErrorMessage message={errorMessage} />
      ) : !bookingData ? (
        <NoDataMessage message="No booking data available" />
      ) : bookingData.ps_payment_status !== "success" ? (
        <>
          <div className="flex gap-2 py-2">
            <Image src={cancel} alt="ok" className="w-[50px] h-[50px]" />
            <div className="flex flex-col ">
              <div className="text-[#171A19] font-medium text-xl">
                Payment Failed
              </div>
            </div>
          </div>

          <div className="bg-white p-4 mt-2 rounded-lg">
            <div className="text-[#171A19CC] font-semibold text-lg">
              Error in payment process. Please try again
            </div>
            <div className="flex gap-[100px] py-4">
              <div className="text-[#155EEF] font-semibold text-base">
                Amount to be paid
              </div>
              <div className="text-[#155EEF] font-semibold text-base">
                ₹ {formatPrice(bookingData?.BookingMasterData?.PaidAmount)}
              </div>
            </div>

            <div className="flex w-1/3 gap-10">
              <button
                onClick={redirectHome}
                className="border-1 border-[#155EEF] w-full text-[#155EEF] text-sm p-3 rounded-lg"
              >
                Homepage
              </button>

              <button
                onClick={retryPayment}
                className="bg-[#155EEF] w-full text-white text-sm p-3 mt-5 rounded-lg"
              >
                Retry
              </button>
            </div>
          </div>
        </>
      ) : (
        <>
          <div className="bg-[#E5E9EB] p-4 pt-8 pb-52 2xl:mx-[12%]">
            <div className="flex flex-col-reverse sm:flex-row gap-4 mt-2">
              <div className="w-full sm:w-3/4">
                <div className="hidden sm:flex gap-2 items-center">
                  <Image
                    src={
                      bookingData.booking_status === "confirmed"
                        ? correct
                        : cancel
                    }
                    alt="ok"
                    className="w-[50px] h-[50px]"
                  />
                  <div className="flex flex-col">
                    <div className="text-[#171A19] font-medium text-xl">
                      {bookingData.booking_status === "confirmed"
                        ? "Booking Successful"
                        : "Booking Failed : "}
                      {bookingData.booking_status !== "confirmed" && (
                        <span className="text-[#E53944]">
                          Money will be credited shortly{" "}
                        </span>
                      )}
                    </div>
                    {bookingData.booking_status === "confirmed" && (
                      <div className="text-[#171A19B2] text-sm font-medium">
                        Booking details will be sent on the contact number{" "}
                        <span className="text-[#030F0C] font-semibold">
                          + 91 {bookingData?.hotelPassengers?.[0]?.mobile}
                        </span>{" "}
                        and email id{" "}
                        <span className="text-[#030F0C] font-semibold">
                          {bookingData?.hotelPassengers?.[0]?.email}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
                {bookingData.booking_status === "confirmed" && (
                  <div className="bg-white p-4 mt-2 rounded-lg">
                    <div className="text-[#171A19] font-semibold text-xl">
                      Booking details
                    </div>
                    <div className="flex justify-between items-center">
                      <div className="text-[#171A19] font-normal text-base">
                        Booking ID :{" "}
                        <span className="text-[#155EEF] font-semibold text-base">
                          {bookingId}
                        </span>
                      </div>
                      <div className="text-[#171A19] font-normal text-base">
                        Booked on :{" "}
                        <span className="text-[#155EEF] font-semibold text-base">
                          {formatBookingDate(
                            bookingData?.BookingMasterData?.BookedOn
                          )}
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {/* approver details */}

                <Approver
                  parentClassName="bg-white p-4 mt-2 rounded-lg"
                  travellers={bookingData?.transformedApprovalDetails}
                />

                <TravellerDetails travellers={bookingData?.hotelPassengers} />
                <div className="bg-white p-4 mt-2 rounded-lg">
                  <GSTDetails
                    companyName={
                      bookingData?.BookingMasterData?.CompanyGstDetails
                        ?.companyName
                    }
                    gstNumber={
                      bookingData?.BookingMasterData?.CompanyGstDetails
                        ?.companyGst
                    }
                    companyEmail={
                      bookingData?.BookingMasterData?.CompanyGstDetails
                        ?.companyEmail
                    }
                    companyMobile={
                      bookingData?.BookingMasterData?.CompanyGstDetails
                        ?.companyMobile
                    }
                    companyAddress={
                      bookingData?.BookingMasterData?.CompanyGstDetails
                        ?.companyAddress
                    }
                  />
                </div>

                <CancellationPolicy
                  roomData={bookingData?.cancellationPolicies}
                />
              </div>
              <div className="w-full sm:w-2/5">
                <div className="flex sm:hidden gap-2 items-center">
                  <Image
                    src={
                      bookingData.booking_status === "confirmed"
                        ? correct
                        : cancel
                    }
                    alt="ok"
                    className="w-[30px] sm:w-[50px] h-[30px] sm:h-[50px]"
                  />
                  <div className="flex flex-col">
                    <div className="text-[#171A19] font-medium text-base sm:text-xl">
                      {bookingData.booking_status === "confirmed"
                        ? "Booking Successful"
                        : "Booking Failed : "}
                      {bookingData.booking_status !== "confirmed" && (
                        <span className="text-[#E53944]">
                          Money will be credited shortly{" "}
                        </span>
                      )}
                    </div>
                    {bookingData.booking_status === "confirmed" && (
                      <div className="text-[#171A19B2] text-sm font-medium">
                        Booking details will be sent on the contact number{" "}
                        <span className="text-[#030F0C] font-semibold">
                          + 91 {bookingData?.hotelPassengers?.[0]?.mobile}
                        </span>{" "}
                        and email id{" "}
                        <span className="text-[#030F0C] font-semibold">
                          {bookingData?.hotelPassengers?.[0]?.email}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex justify-center gap-3 mt-3 sm:mt-0">
                  {bookingData?.ps_payment_status === "success" &&
                    userType === 1 && (
                      <button
                        onClick={downloadInvoice}
                        disabled={downloading}
                        className="bg-[#155EEF] w-1/2 text-white text-xs sm:text-base font-medium h-10 sm:h-16 rounded-lg"
                      >
                        {downloading ? (
                          <>
                            <FontAwesomeIcon icon={faSpinner} spin className="text-xs sm:text-base" />
                            Downloading
                          </>
                        ) : (
                          <>
                            <FontAwesomeIcon icon={faCircleDown} className="text-xs sm:text-base" />
                            Invoice
                          </>
                        )}
                      </button>
                    )}
                  {bookingData?.booking_status !== "confirmed" && (
                    <button
                      onClick={handleRefundStatus}
                      className="bg-[#155EEF] w-1/2 text-white text-xs sm:text-base font-medium h-10 sm:h-16 rounded-lg"
                    >
                      <FontAwesomeIcon
                        icon={faCircleDown}
                        className="text-xs sm:text-base"
                      />{" "}
                      Refund status
                    </button>
                  )}

                  {bookingData.booking_status === "confirmed" && (
                    <button
                      onClick={downloadTicket}
                      disabled={downloading1}
                      className="bg-[#155EEF] w-1/2 text-white text-base font-medium h-10 sm:h-16 rounded-lg"
                    >
                      {/* <FontAwesomeIcon
                        icon={faCircleDown}
                        className="text-base"
                      />{" "}
                      Voucher */}
                      {downloading1 ? (
                        <>
                          <FontAwesomeIcon icon={faSpinner} spin className="text-base" />
                          Downloading
                        </>
                      ) : (
                        <>
                          <FontAwesomeIcon icon={faCircleDown} className="text-base" />
                          Voucher
                        </>
                      )}
                    </button>
                  )}
                </div>
                <div className="bg-white p-2 mt-2 rounded-lg h-fit">
                  <HotelReview
                    currentPage="confirm"
                    hotel={bookingData?.hotelReview?.hotel}
                    rooms={bookingData?.hotelReview?.rooms}
                    searchData={bookingData?.hotelReview?.searchData}
                    priceBreakup={bookingData?.hotelReview?.priceBreakup}
                    walletDeduction={
                      bookingData?.BookingMasterData?.WalletAmount
                    }
                    otherPaymentMode={
                      bookingData?.BookingMasterData?.PaidAmount
                    }
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Refund Modal */}
          {isRefundModalOpen && refundDetails && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
              <div className="bg-white rounded-lg w-1/3 p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-lg font-semibold">Refund Status</h2>
                  <button
                    onClick={closeRefundModal}
                    className="text-gray-600 text-xl"
                  >
                    ✕
                  </button>
                </div>
                <div>
                  {refundDetails.walletAmount > 0 && (
                    <>
                      <p className="text-sm mb-2">
                        <strong>Wallet Refund Status:</strong>{" "}
                        {refundDetails.walletStatus || "N/A"}
                      </p>
                      <p className="text-sm mb-2">
                        <strong>Wallet Refund Amount:</strong> ₹
                        {formatPrice(refundDetails.walletAmount) || 0}
                      </p>
                    </>
                  )}
                  {refundDetails.paymentRefundAmount && (
                    <>
                      <p className="text-sm mb-2">
                        <strong>Payment Refund Status:</strong>{" "}
                        {"SUCCESS" || "N/A"}
                      </p>
                      <p className="text-sm mb-2">
                        <strong>Payment Refund Amount:</strong> ₹
                        {formatPrice(refundDetails.paymentRefundAmount) || 0}
                      </p>
                    </>
                  )}
                </div>
                <div className="mt-4 flex justify-end">
                  <button
                    onClick={closeRefundModal}
                    className="bg-[#155EEF] text-white p-2 px-4 rounded-lg"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          )}
        </>
      )}
      <Footer2 />
    </ProtectedRoute>
  );
}
