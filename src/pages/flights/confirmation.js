import style from "./confirmation.module.css";
import { useState, useEffect, useRef } from "react";
import Footer from "@/components/footer/footer";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCheck,
  faXmark,
  faArrowLeft,
  faTimesCircle,
  faSpinner,
} from "@fortawesome/free-solid-svg-icons";
import CommonHeader from "@/components/flights/commonHeader/commonHeader";
import B2CHeader from "@/components/flights/B2cHeader/Header";
import {
  getPaymentGateway,
  getPaymentSessionID,
} from "../../../utils/bookingAPI";
import { routeToPg } from "@/paymentGateways/pgRouting";
import Loader from "@/components/loader/loader";
import { toast } from "react-toastify";
import { useRouter } from "next/router";
import Link from "next/link";
import {
  flightBookingDetail,
  savePaymentDetails,
  generateCommonPDFInvoice,
  getRefundStatus,
} from "../../../utils/profileAPI";
import useLocalStorage from "@/hooks/useLocalStorage";
import { getTabSpecificData, setTabSpecificData } from "@/utils/axios/axios";
import TwowayConfirmation from "@/components/flightPayments/TwoWayPayment";
import Shareicon from "@/components/shareicon/shareicon";
import FlightDetails from "@/components/flights/flightDetails/flightDetails";
import Image from "next/image";
import { confirmPaymentFlights } from "../../../utils/walletApis";
import WebSocketService from "@/webSocketService/WebSocketService";
import { useUserType } from "@/hooks/useUserType";
import Header from "@/components/corporate/auth/Header";
import Footer1 from "@/components/corporate/footerCorporate/footerCorporate";
import { useWalletBalance } from "@/hooks/useWalletBalance";
import { faCircleDown } from "@fortawesome/free-regular-svg-icons";
import showToast from "@/utils/toast";
import axios from "@/utils/axios/axios";
import config from "@/config";

export default function FlightConfirmation() {
  const router = useRouter();
  const corporateUser = useUserType();
  const { booking_id, profile } = router.query;

  const [showTooltip, setShowTooltip] = useState(false);
  const [swapStyle, setSwapStyle] = useState(false);
  const [bookingData, setBookingData] = useState(null);
  const [refundData, setRefundData] = useState(null);
  const [ssrPassengerIndex, setssrPassengerIndex] = useState(0);
  const [getuserip, setuserip] = useLocalStorage("userip");
  const [isToastVisible, setIsToastVisible] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [isRefundLoading, setIsRefundLoading] = useState(false);
  const [refundIndex, setRefundIndex] = useState(null);
  const [flightDetailsIsOpen, setFlightDetailsIsOpen] = useState(false);
  const [flightDetailsIndex, setFlightDetailsIndex] = useState(null);
  const [fareQuoteData, setFareQuoteData] = useState(null);
  const [isPaymentPopup, setIsPaymentPopup] = useState(false);
  const [getUserID, setUserID] = useLocalStorage("userID");
  // const [walletBalance, setWalletBalance] = useState("");
  const [walletSelected, setWalletSelected] = useState(false);
  const [amountPayable, setAmountPayable] = useState();
  const [totalAmountPaid, setTotalAmountPaid] = useState();
  const [bookingId, setBookingId] = useState(booking_id);
  const [walletRefundAmount, setWalletRefundAmount] = useState();
  const [walletRefundStatus, setWalletRefundStatus] = useState();
  const popupRef = useRef(null);
  const { walletBalance, fetchBalance } = useWalletBalance();

  // New state variables for improved loading and error handling
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [downloading, setDownloading] = useState(false);
  const [downloading1, setDownloading1] = useState(false);

  useEffect(() => {
    // Push the current page onto the history stack again.
    // window.history.pushState(null, null, window.location.href);

    const handlePopState = (event) => {
      console.log("Back button was pressed.");

      window.location.href = "/";
    };

    window.addEventListener("popstate", handlePopState);

    // Cleanup the event listener when the component unmounts.
    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, []);

  useEffect(() => {
    const webSocketService = new WebSocketService();
    let isSocketTriggered = false;
    let hasDataLoaded = false;
    let isInitialFetchCompleted = false;

    const fetchFlightBookingDetails = async () => {
      if (!booking_id) return;

      try {
        if (!isInitialFetchCompleted) setIsLoading(true);
        setErrorMessage("");

        // First API call: Fetch flight booking details
        try {
          let storedUserIp = getTabSpecificData("userip");

          const bookingPayload = {
            getBookingDetailsReq: {
              endUserIp: storedUserIp == "undefined" ? null : storedUserIp,
              bookingId: booking_id,
            },
          };

          const flightBookingDetailResp = await flightBookingDetail(
            bookingPayload
          );

          console.log("Flight API response:", flightBookingDetailResp);

          if (flightBookingDetailResp && flightBookingDetailResp.data) {
            // Check if booking is still pending
            const isBookingPending =
              flightBookingDetailResp.data[0]?.data?.bookingStatus ===
              "Pending";
            const paymentStatus =
              flightBookingDetailResp.data[0]?.data?.paymentStatus;

            // If coming from profile OR booking is not pending OR payment has failed, we can process and display the data
            // Don't wait for WebSocket if payment has failed (even if booking status is pending)
            if (
              profile ||
              !isBookingPending ||
              (isBookingPending && paymentStatus === "PENDING")
            ) {
              hasDataLoaded = true;

              // Process booking data
              if (
                flightBookingDetailResp.data[0].data?.bookingStatus !==
                "Pending" &&
                flightBookingDetailResp.data[0].data?.bookingStatus !==
                "Reserved"
              ) {
                let refundAmount =
                  flightBookingDetailResp?.data?.[0]?.data?.refundAmount ||
                  flightBookingDetailResp?.data?.[1]?.data?.refundAmount;
                let walletAmount =
                  flightBookingDetailResp?.data?.[0]?.data?.walletAmount ||
                  flightBookingDetailResp?.data[1]?.data?.walletAmount;

                setTotalAmountPaid(
                  flightBookingDetailResp.data?.[0]?.data?.totalAmountPaid
                );
                setWalletRefundAmount(
                  walletAmount > refundAmount ? refundAmount : walletAmount
                );
                setWalletRefundStatus(
                  flightBookingDetailResp?.data?.[0]?.data?.refundStatus ||
                  flightBookingDetailResp?.data?.[1]?.data?.refundStatus
                );
              }

              let bookingData = flightBookingDetailResp.data[0].data;
              if (
                flightBookingDetailResp?.data?.[0]?.data?.flightItinerary
                  ?.journeyTypeName === "Return"
              ) {
                if (
                  !flightBookingDetailResp?.data?.[0]?.data?.flightItinerary
                    ?.domestic
                ) {
                  bookingData = [
                    {
                      data: {
                        ...flightBookingDetailResp.data[0].data,
                        flightItinerary: {
                          ...flightBookingDetailResp.data[0].data
                            .flightItinerary,
                          segments: [
                            flightBookingDetailResp.data[0].data.flightItinerary
                              .segments[0],
                          ],
                        },
                      },
                      status: flightBookingDetailResp.data[0].status,
                    },
                    {
                      data: {
                        ...flightBookingDetailResp.data[0].data,
                        flightItinerary: {
                          ...flightBookingDetailResp.data[0].data
                            .flightItinerary,
                          segments: [
                            flightBookingDetailResp.data[0].data.flightItinerary
                              .segments[1],
                          ],
                        },
                      },
                      status: flightBookingDetailResp.data[0].status,
                    },
                  ];
                } else {
                  bookingData = flightBookingDetailResp.data;
                }
              }

              const journeyTypeName =
                flightBookingDetailResp?.data?.[0]?.data?.flightItinerary
                  ?.journeyTypeName;

              const journeyTypeCode =
                flightBookingDetailResp?.data?.[0]?.data?.flightItinerary
                  ?.journeyTypeCode;

              const isInternational =
                !flightBookingDetailResp?.data?.[0]?.data?.flightItinerary
                  ?.domestic;

              setBookingData({
                ...bookingData,
                oneWayBookingStatus: flightBookingDetailResp.data[0].status,
                bookingStatus:
                  flightBookingDetailResp.data[0].data?.bookingStatus,
                ps_payment_status:
                  flightBookingDetailResp?.data?.[0]?.data?.paymentStatus,
                type:
                  journeyTypeName === "Return"
                    ? "twoway"
                    : journeyTypeCode === "3"
                      ? "multicity"
                      : "oneway",
                isInternational: isInternational,
              });

              setIsLoading(false);
            } else {
              // Booking is still pending, payment hasn't failed, and not from profile - keep loading, wait for socket
              console.log(
                "Booking is pending and payment is still processing, waiting for WebSocket update..."
              );
            }
          } else {
            throw new Error("Failed to fetch flight booking details");
          }
        } catch (err) {
          console.error("Flight booking details error:", err);
          if (profile || (isInitialFetchCompleted && !isSocketTriggered)) {
            throw new Error("Failed to fetch flight booking details");
          }
        }

        // Second API call: Fetch additional payment/booking status if needed
        try {
          if (!profile) {
            const paymentDetailResp = await savePaymentDetails(booking_id, "2");
          }
        } catch (err) {
          console.error("Failed to fetch additional flight data:", err);
        }
      } catch (err) {
        if (profile || (isSocketTriggered && !hasDataLoaded)) {
          setErrorMessage(
            err.message || "Unable to fetch flight booking details."
          );
          setIsLoading(false);
        }
      } finally {
        isInitialFetchCompleted = true;
        if (profile || isSocketTriggered || hasDataLoaded) {
          // Only stop loading if we have processed the data or it's from profile
          if (hasDataLoaded || profile) {
            setIsLoading(false);
          }
        }
      }
    };
    const setupWebSocket = () => {
      try {
        const topic = `/topic/${booking_id}`;
        const callback = (message, context) => {
          console.log("Flight WebSocket Message:", message);
          isSocketTriggered = true;
          fetchFlightBookingDetails(); // Refresh data on WebSocket message
        };

        // Ensure connection is established before subscribing
        webSocketService.connect(topic, callback, {
          onConnectSuccess: () => {
            console.log("Flight WebSocket connection established");
          },
          onConnectError: (error) => {
            console.error("Flight WebSocket connection failed:", error);
            // If WebSocket fails and we don't have data loaded, stop loading after some time
            setTimeout(() => {
              if (!hasDataLoaded && !profile) {
                setIsLoading(false);
              }
            }, 10000); // 10 seconds timeout
          },
        });
      } catch (error) {
        console.error("Flight WebSocket setup error:", error);
      }
    };

    if (booking_id) {
      fetchFlightBookingDetails();
      if (!profile) setupWebSocket();
    }

    return () => {
      console.log("Flight socket disconnected");
      webSocketService.disconnect();
    };
  }, [booking_id, profile]);

  // useEffect(() => {
  //   const webSocketService = new WebSocketService();
  //   if (booking_id) getBookingDetailsCall(booking_id);

  //   const topic = `/topic/${booking_id}`;

  //   const callback = (message, context) => {
  //     if (booking_id) getBookingDetailsCall(booking_id);
  //   };

  //   webSocketService.connect(topic, callback, {});

  //   return () => {
  //     console.log("socket disconnected");
  //     webSocketService.disconnect();
  //   };
  // }, [booking_id]);

  useEffect(() => {
    if (isPaymentPopup) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isPaymentPopup]);

  useEffect(() => {
    setBookingData(bookingData);
  }, [bookingData]);

  const handleClose = () => {
    setIsPaymentPopup(false);
  };

  useEffect(() => {
    if (isPaymentPopup) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "visible";
    }

    return () => {
      document.body.style.overflow = "visible";
    };
  }, [isPaymentPopup]);

  const handleClickOutside = (event) => {
    if (popupRef.current && !popupRef.current.contains(event.target)) {
      setShowPopup(false);
    }
    if (event.target.closest(`.${style.popupContent}`) === null) {
      setIsPaymentPopup(false);
    }
  };

  const handleToggleTooltip = () => {
    setShowTooltip((prevShowTooltip) => !prevShowTooltip);
  };

  useEffect(() => {
    window.addEventListener("click", handleClickOutside);

    return () => {
      window.removeEventListener("click", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    const callPaymentDetail = async () => {
      try {
        let pnr;
        let paymentDetailResp = { data: {} };
        if (!profile || profile === undefined) {
          paymentDetailResp = await savePaymentDetails(booking_id, "2");
          pnr = paymentDetailResp.data.pnr;
        } else if (profile) {
          paymentDetailResp.data.payment_status = "SUCCESS";
        }
      } catch (error) {
        console.log(error);
      }
    };
    if (booking_id) {
      callPaymentDetail();
    }
  }, [booking_id]);

  // const getBookingDetailsCall = async (bookingId) => {
  //   try {
  //     let storedUserIp = getTabSpecificData("userip");

  //     const bookingPayload = {
  //       getBookingDetailsReq: {
  //         endUserIp: storedUserIp == "undefined" ? null : storedUserIp,
  //         // pnr: pnr,
  //         bookingId: bookingId,
  //       },
  //     };
  //     const flightBookingDetailResp = await flightBookingDetail(bookingPayload);
  //     if (
  //       flightBookingDetailResp.data[0].data?.bookingStatus !== "Pending" &&
  //       flightBookingDetailResp.data[0].data?.bookingStatus !== "Reserved"
  //     ) {
  //       let refundAmount =
  //         flightBookingDetailResp?.data?.[0]?.data?.refundAmount ||
  //         flightBookingDetailResp?.data?.[1]?.data?.refundAmount;
  //       let walletAmount =
  //         flightBookingDetailResp?.data?.[0]?.data?.walletAmount ||
  //         flightBookingDetailResp?.data[1]?.data?.walletAmount;

  //       setTotalAmountPaid(
  //         flightBookingDetailResp.data?.[0]?.data?.totalAmountPaid
  //       );
  //       setWalletRefundAmount(
  //         walletAmount > refundAmount ? refundAmount : walletAmount
  //       );
  //       setWalletRefundStatus(
  //         flightBookingDetailResp?.data?.[0]?.data?.refundStatus ||
  //           flightBookingDetailResp?.data?.[1]?.data?.refundStatus
  //       );
  //     }
  //     let bookingData = flightBookingDetailResp.data[0].data;
  //     if (
  //       flightBookingDetailResp?.data?.[0]?.data?.flightItinerary
  //         ?.journeyTypeName === "Return"
  //     ) {
  //       if (
  //         !flightBookingDetailResp?.data?.[0]?.data?.flightItinerary?.domestic
  //       ) {
  //         bookingData = [
  //           {
  //             data: {
  //               ...flightBookingDetailResp.data[0].data,
  //               flightItinerary: {
  //                 ...flightBookingDetailResp.data[0].data.flightItinerary,
  //                 segments: [
  //                   flightBookingDetailResp.data[0].data.flightItinerary
  //                     .segments[0],
  //                 ],
  //               },
  //             },
  //             status: flightBookingDetailResp.data[0].status,
  //           },
  //           {
  //             data: {
  //               ...flightBookingDetailResp.data[0].data,
  //               flightItinerary: {
  //                 ...flightBookingDetailResp.data[0].data.flightItinerary,
  //                 segments: [
  //                   flightBookingDetailResp.data[0].data.flightItinerary
  //                     .segments[1],
  //                 ],
  //               },
  //             },
  //             status: flightBookingDetailResp.data[0].status,
  //           },
  //         ];
  //       } else {
  //         bookingData = flightBookingDetailResp.data;
  //       }
  //     }

  //     const journeyTypeName =
  //       flightBookingDetailResp?.data?.[0]?.data?.flightItinerary
  //         ?.journeyTypeName;

  //     const journeyTypeCode =
  //       flightBookingDetailResp?.data?.[0]?.data?.flightItinerary
  //         ?.journeyTypeCode;

  //     const isInternational =
  //       !flightBookingDetailResp?.data?.[0]?.data?.flightItinerary?.domestic;

  //     setBookingData({
  //       ...bookingData,
  //       oneWayBookingStatus: flightBookingDetailResp.data[0].status,
  //       bookingStatus: flightBookingDetailResp.data[0].data?.bookingStatus,
  //       ps_payment_status:
  //         flightBookingDetailResp?.data?.[0]?.data?.paymentStatus,
  //       type:
  //         journeyTypeName === "Return"
  //           ? "twoway"
  //           : journeyTypeCode === "3"
  //           ? "multicity"
  //           : "oneway",
  //       isInternational: isInternational,
  //     });
  //   } catch (error) {
  //     console.log(error);
  //   }
  // };

  const formatPrice = (price) => {
    if (price) {
      return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    }
  };

  const handleContainerClick = (index) => {
    setssrPassengerIndex(index);
    setSwapStyle(!swapStyle);
  };

  function formatBookingDateTime(inputDateTime) {
    if (inputDateTime) {
      const optionsDate = {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      };

      const optionsTime = {
        hour: "numeric",
        minute: "numeric",
        hour12: true,
      };

      const datePart = new Date(inputDateTime).toLocaleString(
        "en-US",
        optionsDate
      );
      const timePart = new Date(inputDateTime).toLocaleString(
        "en-US",
        optionsTime
      );

      return `${datePart} | ${timePart}`;
    }
  }

  const redirectHome = () => {
    router.push("/");
  };

  const retryPayment = async (totalAmount = null) => {
    let total_price = bookingData?.flightItinerary?.fare?.totalAmountWithSSR;

    if (totalAmount >= 0) {
      total_price = totalAmount;
    }
    // console.log("totalAmount - amountPayable ",total_price ," ", bookingData[1].data?.bookingPaymentRefId );
    try {
      if (booking_id) {
        const bookingId = booking_id;
        let bookingPaymentRef;
        const mobileNumber = getTabSpecificData("phoneNumber");
        // const walletAmount = total_price - amountPayable;
        const walletAmount = Math.max(0, parseFloat(total_price - amountPayable));
        //  bookingPaymentRef= bookingData?.bookingPaymentRefId;
        if (bookingData?.bookingPaymentRefId) {
          bookingPaymentRef = {
            bookingPaymentRefIds: [bookingData?.bookingPaymentRefId],
            isWeb: true,
          };
        } else {
          bookingPaymentRef = {
            bookingPaymentRefIds: [
              bookingData[0]?.data?.bookingPaymentRefId,
              bookingData[1]?.data?.bookingPaymentRefId,
            ],
            isWeb: true,
          };
        }
        const pgRes = await getPaymentGateway();
        if (pgRes.status === "SUCCESS") {
          if (amountPayable > 0) {
            let getPaymeneSessionIDResp = await getPaymentSessionID(
              null,
              Math.max(0,walletAmount),
              0,
              "BOOKING",
              bookingId,
              amountPayable,
              mobileNumber,
              pgRes.data.pgCode,
              2,
              bookingPaymentRef
            );
            if (
              getPaymeneSessionIDResp !== null &&
              getPaymeneSessionIDResp.data.data.paymentSessionId !== ""
            ) {
              const queryParams = {
                booking_id: bookingId,
              };
              routeToPg(
                pgRes.data.pgCode,
                getPaymeneSessionIDResp.data.data.paymentSessionId,
                queryParams,
                bookingId,
                2,
                "BOOKING"
              );
            }
          } else {
            let confirmReq = {
              bookingId: bookingId,
              paymentRefernceId: getTabSpecificData("userID"),
              paymentStatus: "SUCCESS",
              paymentAmount: amountPayable,
              pgCode: pgRes.data.pgCode,
              bookingPaymentRefIds: bookingPaymentRef.bookingPaymentRefIds,
              walletAmount: walletAmount,
            };
            const resp = await confirmPaymentFlights(confirmReq);
            if (resp) {
              router.push({
                pathname: "/flights/confirmation",
                query: { booking_id: bookingId, profile: false },
              });
            }
          }
        }
      }
    } catch (error) {
      console.log(error);
      if (!isToastVisible) {
        toast("Something went wrong");
        setIsToastVisible(true);

        // Reset the flag after a specific duration (e.g., 3 seconds)
        setTimeout(() => {
          setIsToastVisible(false);
        }, 6000);
      }
    }
  };

  const fetchAndDownloadInvoice = async () => {
    try {
      setDownloading(true);
      const invoiceData = await generateCommonPDFInvoice(booking_id, 2);
      const pdfData = invoiceData; // Binary PDF data
      if (pdfData && pdfData.byteLength > 0) {
        const blob = new Blob([pdfData], { type: "application/pdf" });

        // Trigger download
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = "INV_" + booking_id + ".pdf";
        link.click();

        return URL.revokeObjectURL(link.href);
      }

      return;
    } catch (error) {
      console.error("Error fetching invoice data:", error);
      if (!isToastVisible) {
        toast("something went wrong!");
        setIsToastVisible(true);

        // Reset the flag after a specific duration (e.g., 3 seconds)
        setTimeout(() => {
          setIsToastVisible(false);
        }, 6000);
      }
    } finally {
      setDownloading(false);
    }
  };

  const fetchAndDownloadTicket = async () => {
    const normalizeBookingData = (data) => {
      if (data.type === "oneway" || data.type === "multicity") {
        return [
          {
            pnr: data.pnr,
            bookingId: data.bookingId,
            isReturn: false,
            isInternational: data.isInternational,
          },
        ];
      } else if (data.type === "twoway") {
        return [
          {
            pnr: data[0].data.pnr,
            bookingId: data[0].data.bookingId,
            isReturn: false,
            isInternational: data.isInternational,
          },
          {
            pnr: data[1].data.pnr,
            bookingId: data[1].data.bookingId,
            isReturn: true,
            isInternational: data.isInternational,
          },
        ];
      }
      return [];
    };

    const downloadTicket = async (
      pnr,
      bookingId,
      isReturn,
      isInternational
    ) => {
      try {
        const response = await axios.get(`${config.DOWNLOAD_TICKET}`, {
          params: { pnr, bookingId, travelCategory: 2 },
          responseType: "blob",
        });
        if (
          response &&
          response.data instanceof Blob &&
          response.data.size > 0
        ) {
          const contentDisposition = response.headers["content-disposition"];
          const tripType = isReturn ? "return" : "departure";
          let fileName = isInternational
            ? `E-Ticket_${bookingId}.pdf`
            : `E-Ticket_${bookingId}_${isReturn ? "return" : "departure"}.pdf`;
          // let fileName = `E-Ticket_${bookingId}_${tripType}.pdf`;
          // let fileName = `E-Ticket_${pnr}.pdf`; // Default name
          if (contentDisposition) {
            const fileNameMatch = contentDisposition.match(/filename="?(.+)"?/);
            if (fileNameMatch.length > 1) {
              fileName = fileNameMatch[1];
            }
          }

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
        showToast("error", `Error downloading ticket for PNR ${pnr}:`);
        console.error(`Error downloading ticket for PNR ${pnr}:`, error);
        // You might want to show an error message to the user here
      }
    };

    try {
      setDownloading1(true);
      const normalizedData = normalizeBookingData(bookingData);
      // const uniqueBookings = Array.from(
      //   new Set(normalizedData.map(JSON.stringify)),
      //   JSON.parse
      // );
      // Filter by unique PNRs while keeping the first occurrence of each PNR
      const uniqueBookings = Array.from(
        new Map(
          normalizedData.map((booking) => [booking.pnr, booking])
        ).values()
      );

      for (const booking of uniqueBookings) {
        if (booking.pnr !== null) {
          await downloadTicket(
            booking.pnr,
            booking.bookingId,
            booking.isReturn,
            booking.isInternational
          );
        }
      }
    } catch (error) {
      console.error("Error in fetching and downloading ticket", error);
      showToast("error", `Error downloading ticket`);
    } finally {
      setDownloading1(false);
    }
  };

  const handleRefundStatusClick = async (booking_id, index = null) => {
    try {
      setIsRefundLoading(true);
      if (index !== null) {
        setRefundIndex((prevIndex) => (prevIndex === index ? null : index));
      }

      let refundResponse = {
        status: "SUCCESS",
        data: {
          walletRefundAmount: walletRefundAmount,
          walletRefundStatus: walletRefundStatus,
        },
      };
      if (totalAmountPaid > 0) {
        let refundPgRes = await getRefundStatus(booking_id);
        if (refundPgRes !== null && refundPgRes?.status == "SUCCESS") {
          setShowPopup((prevShowPopup) => !prevShowPopup); // new code
          if (refundPgRes?.data?.refundAmount) {
            const data = {
              walletRefundAmount: walletRefundAmount,
              walletRefundStatus: walletRefundStatus,
              refundAmount: refundPgRes?.data?.refundAmount,
              refundStatus: refundPgRes?.data?.refundStatus,
            };
            setRefundData(data);
          } else {
            setRefundData(refundResponse.data);
          }
        } else {
          if (!isToastVisible) {
            toast("Failed to fetch refund status. Please Try again");
            setIsToastVisible(true);

            // Reset the flag after a specific duration (e.g., 3 seconds)
            setTimeout(() => {
              setIsToastVisible(false);
            }, 6000);
          }
        }
      } else {
        setShowPopup((prevShowPopup) => !prevShowPopup);
        setRefundData(refundResponse.data);
      }
    } catch (error) {
      toast("Failed to cancel your booking");
    } finally {
      setIsRefundLoading(false);
    }
  };

  const formatTime = (isoTimeString) => {
    const date = new Date(isoTimeString);
    const hours = date.getHours().toString().padStart(2, "0");
    const minutes = date.getMinutes().toString().padStart(2, "0");
    return `${hours}:${minutes}`;
  };

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
        <span style={{ color: "#028fa3" }}>
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

  const handlePopupClick = (e) => {
    e.stopPropagation();
  };

  const checkwallet = async (e, totalPrice = null) => {
    let totalAmount;
    if (!totalPrice || totalPrice == null)
      totalAmount = bookingData?.flightItinerary?.fare?.totalAmountWithSSR;
    else totalAmount = totalPrice;
    e.stopPropagation();

    if (walletSelected) {
      setWalletSelected(false);
      setAmountPayable(totalAmount);
    } else {
      setWalletSelected(true);
      let payable = 0;
      if (totalAmount > walletBalance) {
        payable = totalAmount - walletBalance;
      }

      setAmountPayable(payable);
    }
  };
  const goToWalletDetails = () => {
    router.push("/walletDetails");
  };

  const handlePaymentPopup = async (e, totalAmount = null) => {
    e.stopPropagation();

    if (!walletSelected) {
      if (!totalAmount || totalAmount == null)
        setAmountPayable(
          bookingData?.flightItinerary?.fare?.totalAmountWithSSR
        );
      else setAmountPayable(totalAmount);
    }
    setIsPaymentPopup(!isPaymentPopup);
  };

  const handleFlightDetailsClick = (index, flightDetails) => {
    const updatedFlightData = {
      segments: flightDetails,
    };
    setFlightDetailsIsOpen(true);
    setFlightDetailsIndex(index);
    setFareQuoteData(updatedFlightData);
  };

  const closeFlightDetails = (index) => {
    setFlightDetailsIsOpen(false);
    setFlightDetailsIndex((prev) => prev === index && null);
  };

  const paymentpopUp = (totalAmount = null) => {
    return (
      <div className={style.pendingBtnContainer}>
        <button className={style.holdBtn} onClick={redirectHome}>
          Go to Home
        </button>
        <button
          className={style.proceedBtn}
          onClick={(e) => handlePaymentPopup(e, totalAmount)}
        >
          Retry
        </button>
        {
          isPaymentPopup && (
            //  && walletBalance > 0 && (
            <div className={style.popupOverlay}>
              <div onClick={handlePopupClick} className={style.popupContent}>
                <div>
                  {" "}
                  <FontAwesomeIcon
                    icon={faTimesCircle}
                    className={style.closeIcon}
                    onClick={handleClose}
                  />
                </div>
                <div className={style.walletSection}>
                  <div>
                    <input
                      type="checkbox"
                      id="useWallet"
                      name="useWallet"
                      onChange={(e) => checkwallet(e, totalAmount)}
                    />
                    <label htmlFor="useWallet" className={style.useWalletLabel}>
                      Use wallet payment
                    </label>
                  </div>
                  <div className={style.walletBalance}>
                    <span>Wallet Balance: Rs.</span>
                    <span className={style.balanceAmount}>{walletBalance}</span>
                    <Link
                      href={{
                        pathname: "/walletDetails",
                        query: {
                          fromPage:
                            typeof window !== "undefined"
                              ? window.location.pathname +
                              `?booking_id=${bookingId}&profile=${false}`
                              : "/walletDetails",
                        },
                      }}
                      as={`/walletDetails`}
                      style={{
                        color: "#028fa3",
                        textDecoration: "underline",
                      }}
                    >
                      Recharge now
                    </Link>
                  </div>
                </div>
                <button
                  className={style.closeButton}
                  onClick={() => retryPayment(totalAmount)}
                >
                  {!walletSelected || amountPayable > 0
                    ? `Proceed to Pay Rs. ${amountPayable}`
                    : " Proceed to Book"}
                </button>
              </div>
            </div>
          )
          // )
        }
      </div>
    );
  };

  if (!bookingData) {
    return <Loader />;
  }

  // Loading state - show skeleton/loader
  if (isLoading) {
    return <Loader />;
  }

  if (bookingData.type === "twoway") {
    return (
      <TwowayConfirmation
        bookingData={bookingData}
        redirectHome={redirectHome}
        retryPayment={retryPayment}
        fetchAndDownloadInvoice={fetchAndDownloadInvoice}
        formatBookingDateTime={formatBookingDateTime}
        formatTime={formatTime}
        formatDate={formatDate}
        formatDuration={formatDuration}
        formatPrice={formatPrice}
        isProfileRoute={profile}
        handleRefundStatusClick={handleRefundStatusClick}
        isRefundLoading={isRefundLoading}
        showPopup={showPopup}
        refundIndex={refundIndex}
        popupRef={popupRef}
        refundData={refundData}
        flightDetailsIsOpen={flightDetailsIsOpen}
        handleFlightDetailsClick={handleFlightDetailsClick}
        closeFlightDetails={closeFlightDetails}
        fareQuoteData={fareQuoteData}
        paymentpopUp={paymentpopUp}
        fetchAndDownloadTicket={fetchAndDownloadTicket}
        downloading={downloading}
        downloading1={downloading1}
      />
    );
  }

  if (bookingData?.ps_payment_status === "PENDING") {
    return (
      <>
        <div className={style.desktopBg}>
          {!corporateUser ? (
            <div>
              {/* <CommonHeader /> */}
              <B2CHeader/>
            </div>
          ) : (
            <div style={{ backgroundColor: "#ffffff" }}>
              <Header />
            </div>
          )}

          <div className={style.paymentFailed}>
            <FontAwesomeIcon icon={faXmark} className={style.failedIcon} />
            Payment Failed
          </div>

          <div className={style.failedBg}>
            <div className={style.failedContent}>
              {/* <div className={style.desktopPaymentFailed}>
                <FontAwesomeIcon icon={faXmark} className={style.failedIcon} />
                Payment Failed
              </div> */}
              <span
                className={style.failedContent1}
                style={{
                  color: "#878786",
                  width: "50%",
                  textAlign: "center",
                  marginBottom: "2%",
                }}
              >
                Error in payment process. Please try again
              </span>
              <div className={style.amountFailed}>
                Amount to be paid
                <span>
                  Rs{" "}
                  {formatPrice(
                    bookingData?.flightItinerary?.fare?.totalAmountWithSSR
                  )}
                </span>
              </div>
              {paymentpopUp()}
            </div>
          </div>
        </div>
      </>
    );
  }

  const adultCount = parseInt(bookingData?.flightItinerary?.noOfadults);
  const childCount = parseInt(bookingData?.flightItinerary?.noOfchildren);
  const infantCount = parseInt(bookingData?.flightItinerary?.noOFinfants);

  const totalPassengerCount = adultCount + childCount + infantCount;
  const segment = bookingData?.flightItinerary?.segments[0]?.segment;

  // If there is only one result inside the segment, consider it as both origin and destination
  const origin =
    segment?.length === 1 ? segment?.[0]?.origin : segment?.[0]?.origin;
  const destination =
    segment?.length === 1
      ? segment?.[0]?.destination
      : segment?.[segment?.length - 1].destination;

  // Calculate total duration for all segments
  const duration = segment?.reduce(
    (totalDuration, segment) => totalDuration + segment.duration,
    0
  );

  const journeyDuration =
    bookingData?.flightItinerary?.segments[0]?.journeyDuration;

  return (
    <>
      <div className={style.desktopBg}>
        {!corporateUser ? (
          <div>
            {/* <CommonHeader /> */}
            <B2CHeader/>
          </div>
        ) : (
          <div style={{ backgroundColor: "#ffffff" }}>
            <Header />
          </div>
        )}

        <div className={style.successContent}>
          <>
            <div className={style.iconStatus}>
              <FontAwesomeIcon
                icon={
                  bookingData?.ps_payment_status === "SUCCESS" &&
                    bookingData?.oneWayBookingStatus === "SUCCESS"
                    ? faCheck
                    : faXmark
                }
                className={
                  bookingData?.ps_payment_status === "SUCCESS" &&
                    bookingData?.oneWayBookingStatus === "SUCCESS"
                    ? style.confirmIcon
                    : style.failedIcon
                }
              />
              <div className={style.successDetails}>
                {bookingData?.ps_payment_status === "SUCCESS" &&
                  bookingData?.oneWayBookingStatus === "SUCCESS" ? (
                  <>
                    <span className={style.successHead}>
                      Booking Successful
                      {!profile ? (
                        <div className={style.successData}>
                          Booking details will be sent on your contact number
                          <span className={style.highlightData}>
                            {
                              bookingData?.flightItinerary?.passengers?.[0]
                                ?.contactNo
                            }
                          </span>{" "}
                          and email id
                          <span className={style.highlightData}>
                            {""}
                            {
                              bookingData?.flightItinerary?.passengers?.[0]
                                ?.email
                            }
                          </span>
                        </div>
                      ) : (
                        <div className={style.detailsHeading1}>
                          Booking Details
                        </div>
                      )}
                    </span>
                  </>
                ) : (
                  <div
                    style={{
                      display: "flex",
                      gap: "20%",
                      alignItems: "center",
                    }}
                  >
                    <span className={style.successHead}>
                      Booking{" "}
                      {bookingData?.bookingStatus === "CANCELLED"
                        ? "Cancelled"
                        : "Failed"}
                    </span>
                  </div>
                )}
              </div>
              <div className={style.buttonAlign}>
                {((bookingData?.ps_payment_status === "SUCCESS" &&
                  bookingData?.oneWayBookingStatus === "SUCCESS") ||
                  bookingData?.oneWayBookingStatus === "FAILED") && (
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "flex-end",
                        alignItems: "center",
                        gap: "5px",
                        // marginRight: "15px",
                      }}
                    >
                      <button
                        className={style.invoiceBtn}
                        onClick={fetchAndDownloadInvoice}
                        disabled={downloading}
                      >
                        {downloading ? (
                          <>
                            <FontAwesomeIcon icon={faSpinner} spin />
                            <span>Downloading</span>
                          </>
                        ) : (
                          <>
                            <FontAwesomeIcon icon={faCircleDown} />
                            <span>Invoice</span>
                          </>
                        )}
                      </button>
                      {bookingData?.oneWayBookingStatus !== "FAILED" && (
                        <button
                          className={style.ticketBtn}
                          onClick={fetchAndDownloadTicket}
                          disabled={downloading1}
                        >
                          {downloading1 ? (
                            <>
                              <FontAwesomeIcon icon={faSpinner} spin />
                              <span>Downloading</span>
                            </>
                          ) : (
                            <>
                              <FontAwesomeIcon icon={faCircleDown} />
                              <span>Ticket</span>
                            </>
                          )}
                        </button>
                      )}
                      <div>
                        <Shareicon />
                      </div>
                    </div>
                  )}

                {bookingData?.ps_payment_status === "SUCCESS" &&
                  bookingData?.oneWayBookingStatus === "FAILED" && (
                    <>
                      <div
                        className={style.refundStatus}
                        onClick={() =>
                          handleRefundStatusClick(bookingData?.bookingId)
                        }
                        ref={popupRef}
                      >
                        CHECK REFUND STATUS
                        {/* <span style={{ fontWeight: "500" }}>Processing</span> */}
                      </div>
                    </>
                  )}
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    width: "fit-content",
                    fontSize: "8px",
                  }}
                >
                  {isRefundLoading ? (
                    <div className={style.popup}>
                      <div className={style.popupContent}>Loading...</div>
                    </div>
                  ) : (
                    showPopup && (
                      <div className={style.popup}>
                        <div className={style.popupContent}>
                          {/* {refundData.refundAmount > 0 ? ( */}
                          <div>
                            {refundData.walletRefundAmount > 0 && (
                              <div>
                                Wallet Refund status:{" "}
                                <span className={style.success}>
                                  {refundData.walletRefundStatus}
                                </span>
                              </div>
                            )}
                            {refundData.walletRefundAmount > 0 && (
                              <div>
                                Wallet Refund Amount:{" "}
                                <span className={style.success}>
                                  {refundData.walletRefundAmount}
                                </span>
                              </div>
                            )}
                            {refundData.refundAmount > 0 && (
                              <div>
                                Payment Refund Status:{" "}
                                <span className={style.success}>
                                  {refundData.refundStatus}
                                </span>
                              </div>
                            )}
                            {refundData.refundAmount && (
                              <div>
                                Payment Refund Amount:{" "}
                                <span className={style.success}>
                                  Rs. {formatPrice(refundData.refundAmount)}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    )
                  )}
                </div>
              </div>
            </div>
          </>
          <div className={style.pnrDetails}>
            {bookingData?.ps_payment_status === "SUCCESS" &&
              bookingData?.oneWayBookingStatus === "SUCCESS" ? (
              <>
                <div className={style.pnrnumber}>
                  PNR :{" "}
                  <span style={{ fontWeight: "400" }}> {bookingData?.pnr}</span>
                </div>
                <div className={style.bookingdate}>
                  Booked on :{" "}
                  <span style={{ fontWeight: "400" }}>
                    {formatBookingDateTime(bookingData?.bookedDate)}
                  </span>
                </div>
                <div style={{ display: "flex", gap: "10%" }}>
                  <div>
                    Booking ID :{" "}
                    <span style={{ fontWeight: "400" }}>
                      {bookingData?.bookingId}
                    </span>
                  </div>
                  <div className={style.bookedDate1}>
                    Booked on :{" "}
                    <span style={{ fontWeight: "400" }}>
                      {formatBookingDateTime(bookingData?.bookedDate)}
                    </span>
                  </div>
                  <div className={style.pnrnumber1}>
                    PNR :{" "}
                    <span style={{ fontWeight: "400" }}>
                      {" "}
                      {bookingData?.pnr}
                    </span>
                  </div>
                </div>
              </>
            ) : (
              <>
                {(bookingData?.bookingStatus === "CANCELLED" ||
                  bookingData?.bookingStatus === "FAILED") && (
                    <>
                      <div
                        style={{ display: "flex", gap: "4%", textWrap: "nowrap" }}
                      ></div>
                      <div className={style.refundDetails}>
                        Money will be credited shortly{" "}
                      </div>
                      <div>
                        Booking ID :{" "}
                        <span style={{ fontWeight: "400" }}>
                          {bookingData?.bookingId}
                        </span>
                      </div>
                    </>
                  )}
              </>
            )}
          </div>

          <div className={style.detailsHeading}>Flight Details</div>

          {bookingData.type === "oneway" ? (
            <div className={style.flightDetailsCardContent}>
              <div className={style.airlinesLogoClass}>
                {/* <Image
                className={style.airlinesLogo}
                src={airlinesLogo}
                alt="airlines logo"
              /> */}
                <div
                  style={{
                    display: "flex",
                    flexDirection: "row",
                  }}
                >
                  <div className={style.logoplane}>
                    {segment?.[0]?.airline?.airlineLogoUrl ? (
                      <Image
                        src={segment?.[0]?.airline?.airlineLogoUrl}
                        alt="logo"
                        width={30}
                        height={30}
                      />
                    ) : (
                      <Image src="default_logo_url" alt="Default Logo" />
                    )}
                    <div
                      style={{
                        marginLeft: "5px",
                        color: "#878786",
                        lineHeight: "1",
                        fontSize: "14px",
                      }}
                    >
                      <span className={style.desktopClass1}>
                        {segment?.[0]?.airline?.airlineName}
                      </span>
                      <div
                        style={{
                          color: "#878786",
                          lineHeight: "1.5",
                          fontSize: "10px",
                        }}
                      >
                        <span className={style.desktopClass2}>
                          {segment?.[0]?.airline?.airlineCode}
                        </span>
                        -
                        <span className={style.desktopClass2}>
                          {segment?.[0]?.airline?.flightNumber}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* way and cabinclass hidden on booking failed */}
                {bookingData?.oneWayBookingStatus === "SUCCESS" && (
                  <div className={style.desktopCardTop}>
                    <span className={style.desktopClass}>
                      {bookingData?.flightItinerary?.journeyTypeName}
                    </span>
                    <span className={style.desktopClass}>
                      {segment?.[0]?.cabinClassName}
                    </span>
                  </div>
                )}
              </div>
              {/* <div className={style.flightDetailsCardDate}>Fri, July 16th, 23</div> */}
              <div className={style.fromToTiming}>
                <div style={{ display: "flex", flexDirection: "column" }}>
                  <span className={style.fromToTime}>
                    {formatTime(origin?.depTime)}
                  </span>
                  <span className={style.fromToCityName}>
                    {origin?.airport?.cityName}
                  </span>
                  {formatDate(origin?.depTime)}
                </div>
                <div className={style.btwLineContent}>
                  <div className={style.dashLineText}>
                    {formatDuration(journeyDuration)}
                  </div>
                  <div className={style.dashLine}></div>
                  <div className={style.dashLineText}>
                    {bookingData?.flightItinerary?.segments[0]?.stops}{" "}
                    {bookingData?.flightItinerary?.segments[0]?.stops <= 1
                      ? "Stop"
                      : "Stops"}
                  </div>
                </div>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    textAlign: "end",
                  }}
                >
                  <span className={style.fromToTime}>
                    {formatTime(destination?.arrTime)}
                  </span>
                  <span className={style.fromToCityName}>
                    {destination?.airport?.cityName}
                  </span>
                  {formatDate(destination?.arrTime)}
                </div>
              </div>
              <div className={style.flightDetailsAirports}>
                <div style={{ width: "35%", color: "#878786" }}>
                  {origin?.airport?.airportName}, {origin?.airport?.countryName}
                  <br />
                  <span style={{ color: "#028fa3" }}>
                    Terminal {origin?.airport?.terminal}
                  </span>
                </div>
                <div
                  style={{
                    alignSelf: "end",
                    color: "#878786",
                    width: "35%",
                    textAlign: "end",
                  }}
                >
                  {destination?.airport?.airportName},
                  {destination?.airport?.countryName}
                  <br />
                  <span style={{ color: "#028fa3" }}>
                    Terminal {destination?.airport?.terminal}
                  </span>
                </div>
              </div>
              {bookingData?.oneWayBookingStatus === "SUCCESS" && (
                <div
                  className={style.detailsToggle}
                  onClick={() =>
                    handleFlightDetailsClick(
                      0,
                      bookingData?.flightItinerary?.segments
                    )
                  }
                >
                  <span>Flight Details</span>
                </div>
              )}
              {flightDetailsIsOpen && (
                <div>
                  <div
                    className={style.backdrop}
                    onClick={closeFlightDetails}
                  ></div>
                  <div
                    className={style.mainContainer}
                    style={{
                      display: flightDetailsIsOpen ? "block" : "none",
                    }}
                  >
                    <button
                      onClick={closeFlightDetails}
                      className={style.backArrow}
                    >
                      <FontAwesomeIcon icon={faArrowLeft} />
                    </button>
                    <FlightDetails
                      onClose={closeFlightDetails}
                      fareQuote={fareQuoteData}
                    />
                  </div>
                </div>
              )}
            </div>
          ) : (
            bookingData.flightItinerary.segments.map((segmentData, index) => {
              const segment = segmentData.segment;
              const origin = segment[0]?.origin;
              const destination = segment[segment.length - 1]?.destination;
              const journeyDuration = segmentData.journeyDuration;

              return (
                <div key={index} className={style.flightDetailsCardContent}>
                  <div className={style.airlinesLogoClass}>
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "row",
                      }}
                    >
                      <div className={style.logoplane}>
                        {segment?.[0]?.airline?.airlineLogoUrl ? (
                          <Image
                            src={segment?.[0]?.airline?.airlineLogoUrl}
                            alt="logo"
                            width={30}
                            height={30}
                          />
                        ) : (
                          <Image src="default_logo_url" alt="Default Logo" />
                        )}
                        <div
                          style={{
                            color: "#878786",
                            lineHeight: "1",
                            fontSize: "14px",
                          }}
                        >
                          <span className={style.desktopClass1}>
                            {segment?.[0]?.airline?.airlineName}
                          </span>
                          <div
                            style={{
                              color: "#878786",
                              lineHeight: "1.5",
                              fontSize: "10px",
                            }}
                          >
                            <div
                              style={{
                                color: "#878786",
                                lineHeight: "1.5",
                                fontSize: "14px",
                              }}
                            >
                              <span className={style.desktopClass2}>
                                {segment?.[0]?.airline?.airlineCode}
                              </span>
                              <span className={style.desktopClass2}>
                                {segment?.[0]?.airline?.flightNumber}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* way and cabinclass hidden on booking failed */}

                    <div className={style.desktopCardTop}>
                      <span className={style.desktopClass}>
                        {bookingData?.flightItinerary?.journeyTypeName}
                      </span>
                      <span className={style.desktopClass}>
                        {segment?.[0]?.cabinClassName}
                      </span>
                    </div>
                    {/* )} */}
                  </div>
                  <div className={style.fromToTiming}>
                    <div style={{ display: "flex", flexDirection: "column" }}>
                      <span className={style.fromToTime}>
                        {formatTime(origin?.depTime)}
                      </span>
                      <span className={style.fromToCityName}>
                        {origin?.airport?.cityName}
                      </span>
                      {formatDate(origin?.depTime)}
                    </div>
                    <div className={style.btwLineContent}>
                      <div className={style.dashLineText}>
                        {formatDuration(journeyDuration)}
                      </div>
                      <div className={style.dashLine}></div>
                      <div className={style.dashLineText}>
                        {bookingData?.flightItinerary?.segments[index]?.stops}{" "}
                        {bookingData?.flightItinerary?.segments[index]?.stops <=
                          1
                          ? "Stop"
                          : "Stops"}
                      </div>
                    </div>
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        textAlign: "end",
                      }}
                    >
                      <span className={style.fromToTime}>
                        {formatTime(destination?.arrTime)}
                      </span>
                      <span className={style.fromToCityName}>
                        {destination?.airport?.cityName}
                      </span>
                      {formatDate(destination?.arrTime)}
                    </div>
                  </div>
                  <div className={style.flightDetailsAirports}>
                    <div style={{ width: "35%", color: "#878786" }}>
                      {origin?.airport?.airportName},{" "}
                      {origin?.airport?.countryName}
                      <br />
                      <span style={{ color: "#028fa3" }}>
                        Terminal {origin?.airport?.terminal}
                      </span>
                    </div>
                    <div
                      style={{
                        alignSelf: "end",
                        color: "#878786",
                        width: "35%",
                        textAlign: "end",
                      }}
                    >
                      {destination?.airport?.airportName},
                      {destination?.airport?.countryName}
                      <br />
                      <span style={{ color: "#028fa3" }}>
                        Terminal {destination?.airport?.terminal}
                      </span>
                    </div>
                  </div>
                  {bookingData?.oneWayBookingStatus === "SUCCESS" && (
                    <div
                      className={style.detailsToggle}
                      onClick={() =>
                        handleFlightDetailsClick(index, [segmentData])
                      }
                    >
                      <span>Flight Details</span>
                    </div>
                  )}
                  {flightDetailsIsOpen && flightDetailsIndex === index && (
                    <div>
                      <div
                        className={style.backdrop}
                        onClick={closeFlightDetails}
                      ></div>
                      <div
                        className={style.mainContainer}
                        style={{
                          display: flightDetailsIsOpen ? "block" : "none",
                        }}
                      >
                        <button
                          onClick={closeFlightDetails}
                          className={style.backArrow}
                        >
                          <FontAwesomeIcon icon={faArrowLeft} />
                        </button>
                        <FlightDetails
                          onClose={closeFlightDetails}
                          fareQuote={fareQuoteData}
                        />
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}

          <div className={style.detailsHeading}>Price Details</div>
          <div className={style.priceRows}>
            <div className={style.desktopPriceHead}>Price Details</div>
            <div className={style.priceRow}>
              Traveler Fare
              <span>
                {formatPrice(
                  bookingData?.flightItinerary?.fare?.offeredFareRoundedOff
                )}
              </span>
            </div>
            <div className={style.priceRow}>
              Special service charges
              <span>
                {formatPrice(
                  bookingData?.flightItinerary?.fare?.ssrFare.toString()
                )}
              </span>
            </div>
            {/* {bookingData?.walletAmount > 0 && ( */}
            <div className={style.priceRow}>
              Wallet Amount Used
              <span>{formatPrice(bookingData?.walletAmount.toString())}</span>
            </div>
            {/* )} */}
            {/* {bookingData?.totalAmountPaid > 0 && ( */}
            <div className={style.priceRow}>
              Amount Paid By Other Modes
              <span>
                {formatPrice(bookingData?.totalAmountPaid?.toString())}
              </span>
            </div>
            <div className={style.priceRowHighlight}>
              Price
              <span>
                Rs{" "}
                {formatPrice(
                  bookingData?.flightItinerary?.fare?.totalAmountWithSSR
                )}
              </span>
            </div>
          </div>

          <div className={style.detailsHeading}>Traveler Details</div>
          <div className={style.travelerDetails} onClick={handleToggleTooltip}>
            <span className={style.desktopTraveler}>Traveler Details</span>
            {!corporateUser ? (
              <div className={style.desktopTravelerDetails}>
                <div
                  style={{ display: "flex", gap: "2%", alignItems: "center" }}
                >
                  <div className={style.travellerCount}>
                    {totalPassengerCount} Passengers | {adultCount} Adults |{" "}
                    {childCount} Children | {infantCount} Infants
                  </div>
                </div>
              </div>
            ) : (
              <div
                style={{ justifyContent: "flex-start" }}
                className={style.desktopTravelerDetails}
              >
                <div
                  style={{ display: "flex", gap: "2%", alignItems: "center" }}
                >
                  <div className={style.travellerCount}>
                    {totalPassengerCount} Traveler
                    {/* | {adultCount} Adults |{" "}
                  {childCount} Children | {infantCount} Infants */}
                  </div>
                </div>
              </div>
            )}

            {bookingData?.oneWayBookingStatus === "SUCCESS" && (
              <div className={style.maincontainer}>
                <div
                  // className={
                  //   swapStyle ? style.waysContainer1 : style.waysContainer
                  // }
                  style={{
                    width: "100%",
                    display: "flex",
                    gap: "2%",
                    overflowX: "scroll",
                    scrollbarWidth: "none",
                  }}
                >
                  {bookingData?.segmentPassengerSsr?.map((segment, index) => (
                    <button
                      key={index}
                      className={
                        index === ssrPassengerIndex ? style.ways1 : style.ways
                      }
                      onClick={() => handleContainerClick(index)}
                    >
                      {segment?.origin}-{segment?.destination}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {bookingData?.segmentPassengerSsr?.[ssrPassengerIndex]?.ssr.map(
              (ssrPassenger, index) => (
                <div key={index} className={style.passengersandseatdetails}>
                  <div key={index} className={style.passengerdetails}>
                    {
                      <span className={style.traveller}>
                        {index === 0 ? "Traveler" : ""}
                      </span>
                    }
                    {/* <span>{travellerName} </span> */}

                    <span
                      style={{ wordWrap: "break-word", whiteSpace: "normal" }}
                    >{`${ssrPassenger?.passengerName} `}</span>
                  </div>

                  {/* ticket number */}
                  <div className={style.passengerdetails}>
                    <span className={style.traveller}>
                      {index === 0 ? "Ticket Number" : ""}
                    </span>
                    <span>{ssrPassenger?.ticketNumber ?? "NA"}</span>
                  </div>

                  {/* {seatselection} */}
                  <div className={style.passengerdetails}>
                    <span className={style.traveller}>
                      {index === 0 ? "Seat details" : ""}
                    </span>
                    <span>{ssrPassenger?.seatNumber ?? "NA"}</span>
                  </div>

                  {/* {meals selection} */}
                  <div key={index} className={style.passengerdetails}>
                    <span className={style.traveller}>
                      {index === 0 ? "Meal details" : ""}
                    </span>
                    {/* <span>6A </span> */}
                    {ssrPassenger?.mealName ? (
                      <span
                        className={style.mealselection}
                      >{`${ssrPassenger?.mealName}`}</span>
                    ) : (
                      <span className={style.mealselection1}>NA</span>
                    )}
                  </div>

                  {/* {baggage selection} */}
                  <div className={style.passengerdetails}>
                    <span className={style.traveller}>
                      {index === 0 ? "Cabin Baggage" : ""}
                    </span>
                    <span>{ssrPassenger?.cabbinBaggage ?? "NA"}</span>
                  </div>
                  <div className={style.passengerdetails}>
                    <span className={style.traveller}>
                      {index === 0 ? "Check-In Baggage" : ""}
                    </span>
                    <span>{ssrPassenger?.baggage ?? "NA"}</span>
                  </div>
                  <div className={style.passengerdetails}>
                    <span className={style.traveller}>
                      {index === 0 ? "Extra Baggage" : ""}
                    </span>
                    <span>{ssrPassenger?.otherBaggage ?? "NA"}</span>
                  </div>
                </div>
              )
            )}
          </div>

          {/* tooltip for traveler */}
        </div>
      </div>
      {!corporateUser ? <Footer /> : <Footer1 />}
    </>
  );
}
