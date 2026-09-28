import axios,{getTabSpecificData,setTabSpecificData} from "@/utils/axios/axios";
import config from "@/config";
import { getPaymentGateway, getPaymentSessionID } from "../../bookingAPI";
import { routeToPg } from "@/paymentGateways/pgRouting";
import { createAbortController } from "@/utils/common";

export async function extractFlights(flightsResultsData) {
  const { flightsResults } = flightsResultsData;
  let outboundFlights = [];
  let inboundFlights = [];
  if (flightsResultsData?.flightJourney === "international") {
    const firstFlights = flightsResults[0];

    outboundFlights = flightsResults[0];
    const firstFlightSegmentRefId =
      firstFlights?.flights?.[0]?.segments?.[0]?.flightSegmentRefId;
    try {
      const response = await axios.get(`${config.FLIGHTS_INBOUND_DATA}`, {
        params: {
          qTraceId: flightsResultsData.qTraceId,
          flightSegmentRefId: firstFlightSegmentRefId,
        },
      });
      const data = response.data;
      inboundFlights = data.data;
    } catch (error) {
      console.log(error);
    }
  } else if (flightsResultsData?.flightJourney === "domestic") {
    outboundFlights = flightsResults[0];
    inboundFlights = flightsResults[1];
  }
  return { outboundFlights, inboundFlights };
}

export const fetchGetQuote = async (
  qTraceId,
  outboundResultIndex,
  inboundResultIndex
) => {
  let outboundFlight = {};
  let inboundFlight = {};

  let resultIndex = outboundResultIndex;
  if (outboundResultIndex !== inboundResultIndex) {
    resultIndex = `${outboundResultIndex},${inboundResultIndex}`;
  }
  try {
    const userip = getTabSpecificData("userip");
    const payload = {
      qTraceId: qTraceId,
      userType: "b2b",
      fareQuoteReqData: {
        endUserIp: userip == "undefined" ? null : userip,
        resultIndex,
      },
    };
    const { data } = await axios.post(
      `${config.FLIGHTS_SEARCH_FAREQUOTE}`,
      payload
    );

    const response = data?.data;

    // Check if all statuses are "SUCCESS"
    const allSuccess = response.every(
      (response) => response.status === "SUCCESS"
    );
    if (!allSuccess) {
      throw {
        response: {
          data: {
            error: {
              errorMessage: [
                {
                  data: "Fare Quote failed from the Supplier end. Please try again.",
                },
              ],
            },
          },
        },
      };

      // throw new Error(
      //   "Failed to fetch data: status is not SUCCESS for all responses"
      // );
    }

    if (response.length === 1) {
      outboundFlight = {
        ...response?.[0]?.data,
        segments: [response?.[0]?.data?.segments[0]],
      };
      inboundFlight = {
        ...response?.[0]?.data,
        segments: [response?.[0]?.data?.segments[1]],
      };
      // const flightSegmentRefId =
      //   response?.[0]?.data?.segments?.[0]?.flightSegmentRefId;
      // const response1 = await axios.get(`${config.FLIGHTS_INBOUND_DATA}`, {
      //   params: {
      //     qTraceId,
      //     flightSegmentRefId,
      //   },
      // });
      // const data = response1.data;
      // inboundFlight = data.data;
    } else if (response.length === 2) {
      outboundFlight = response?.[0]?.data;
      inboundFlight = response?.[1]?.data;
    }
    return { outboundFlight, inboundFlight, response };
  } catch (error) {
    console.log(error);
    throw error;
  }
};

export const fetchSSR = async (qTraceId, resultIndex) => {
  try {
    const userip = getTabSpecificData("userip");
    const payload = {
      qTraceId: qTraceId,
      ssrReqModel: {
        endUserIp: userip == "undefined" ? null : userip,
        resultIndex,
      },
    };
    const { data } = await axios.post(`${config.FLIGHTS_BOOKING_SSR}`, payload);
    const response = data?.data;
    return response;
  } catch (error) {
    console.log(error);
    throw error;
  }
};

export const callTicketWithoutPassportAPI = async (
  qTraceId,
  bookingId,
  pnr
) => {
  try {
    const userip = getTabSpecificData("userip");
    const payload = {
      qTraceId,
      ticketReqModel: {
        endUserIp: userip == "undefined" ? null : userip,
        bookingId,
        pnr,
      },
    };
    const response = await axios.post(
      `${config.FLIGHTS_BOOKING_NONLCC_TICKET_WITHOUT_PASSPORT}`,
      payload
    );
    console.log(response);
    return response;
  } catch (error) {
    console.log("Error calling Ticket with Passport API:", error);
    // Propagate the error
    throw error;
  }
};

export const callTicketAPI = async (
  qTraceId,
  outboundResultIndex,
  inboundResultIndex,
  requestPayload
) => {
  try {
    const resultIndex =
      outboundResultIndex === inboundResultIndex
        ? outboundResultIndex
        : `${outboundResultIndex},${inboundResultIndex}`;

    const companyId = requestPayload?.companyId;
    if (companyId) {
      delete requestPayload.companyId;
    }

    const userip = getTabSpecificData("userip") || null;
    const userId = getTabSpecificData("userID");
    const userName = getTabSpecificData("userDetails");

    const payload = {
      qTraceId,
      userId,
      userName,
      ticketReqModel: {
        ...requestPayload,
        endUserIp: userip !== "undefined" ? userip : null,
        resultIndex,
      },
      ...(companyId && { companyId }),
    };

    const response = await axios.post(
      `${config.FLIGHTS_BOOKING_LCC_TICKET}`,
      payload
    );

    console.log(response);
    return response;
  } catch (error) {
    console.error("Error calling Ticket API:", error);
    throw error;
  }
};

export const handlePayment = async (
  fare,
  bookingId,
  bookingPaymentRefId,
  companyId = null
) => {
  let bookingPaymentRef = bookingPaymentRefId;
  if (bookingPaymentRefId) {
    bookingPaymentRef = {
      bookingPaymentRefIds: [bookingPaymentRefId],
      isWeb: true,
    };
  }
  const mobileNumber = getTabSpecificData("phoneNumber");
  const pgRes = await getPaymentGateway();

  if (pgRes.status === "SUCCESS") {
    const redirectUrl = null;
    const walletAmount = Math.max(0,parseFloat(fare.totalAmount - fare.totalPayable));
    const charges = 0;
    const paymentCategory = "BOOKING";
    const amount = parseFloat(fare.totalPayable);
    const pgCode = pgRes.data.pgCode;
    const travelCategory = 2;
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
        "BOOKING"
      );
    }
  }
};

export const callReserveAPI = async (
  qTraceId,
  outboundResultIndex,
  inboundResultIndex,
  requestPayload
) => {
  try {
    const resultIndex =
      outboundResultIndex === inboundResultIndex
        ? outboundResultIndex
        : `${outboundResultIndex},${inboundResultIndex}`;

    const companyId = requestPayload?.companyId;
    if (companyId) {
      delete requestPayload.companyId;
    }
    const userip = getTabSpecificData("userip");
    const userId = getTabSpecificData("userID");
    const userName = getTabSpecificData("userDetails");
    const payload = {
      qTraceId,
      userId,
      userName,
      reserveReqModel: {
        ...requestPayload,
        endUserIp: userip == "undefined" ? null : userip,
        resultIndex,
      },
      ...(companyId && { companyId }),
    };
    const response = await axios.post(
      `${config.FLIGHTS_BOOKING_RESERVE}`,
      payload
    );
    console.log(response);
    return response;
  } catch (error) {
    console.log("Error calling Reserve API:", error);
    // Propagate the error
    throw error;
  }
};

export const formatDateToDayMonth = (inputDate) => {
  const date = new Date(inputDate);
  const day = date.getDate();
  const month = date.toLocaleString("default", { month: "long" });
  const year = date.getFullYear();

  const suffix = (day) => {
    if (day >= 11 && day <= 13) {
      return "th";
    }
    switch (day % 10) {
      case 1:
        return "st";
      case 2:
        return "nd";
      case 3:
        return "rd";
      default:
        return "th";
    }
  };

  const formattedDate = `${day}${suffix(day)} ${month} ${year}`;
  return formattedDate;
};

// Format duration in the format "1 hr 30 mins"
export const formatDuration = (minutes) => {
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;

  const hoursText = hours > 0 ? `${hours} hr` : "";
  const minutesText = remainingMinutes > 0 ? ` ${remainingMinutes} mins` : "";

  return `${hoursText}${minutesText}`;
};

export const formatPrice = (price) => {
  if (price) {
    return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  }
  return 0;
};

export const formatTime = (isoTimeString) => {
  const date = new Date(isoTimeString);
  const hours = date.getHours().toString().padStart(2, "0");
  const minutes = date.getMinutes().toString().padStart(2, "0");
  return `${hours}:${minutes}`;
};

export const formatTimeToAMPM = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
};

export const formatDateWithDiv = (dateString, style) => {
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
      <span style={{ color: "#155EEF" }}>
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

export const calculateTotalDuration = (segments) => {
  const totalDuration = segments.reduce(
    (acc, segment) => acc + segment.duration,
    0
  );
  return totalDuration;
};

export const handleFlightDuration = (departureTime, arrivalTime) => {
  const departureDate = new Date(departureTime);
  const arrivalDate = new Date(arrivalTime);

  // Get the start of the departure day
  const departureDayStart = new Date(
    departureDate.getFullYear(),
    departureDate.getMonth(),
    departureDate.getDate()
  );

  // Get the start of the arrival day
  const arrivalDayStart = new Date(
    arrivalDate.getFullYear(),
    arrivalDate.getMonth(),
    arrivalDate.getDate()
  );

  // Calculate the difference in days
  const timeDifference =
    arrivalDayStart.getTime() - departureDayStart.getTime();
  const daysDifference = timeDifference / (1000 * 3600 * 24);
  return Math.ceil(daysDifference);

  if (daysDifference === 0) {
    // If the arrival date is on the same day, return 0 days
    return 0;
  } else {
    // If the arrival date is on the next day or later, return the number of days
    return Math.ceil(daysDifference);
  }
};

export const extractInboundFlightsIfInternational = async (
  qTraceId,
  flightSegmentRefId
) => {
  try {
    const signal = createAbortController();

    const response = await axios.get(`${config.FLIGHTS_INBOUND_DATA}`, {
      params: {
        qTraceId,
        flightSegmentRefId,
      },
      signal: signal,
    });
    const data = response.data;
    const inboundFlights = data.data;
    return inboundFlights;
  } catch (error) {
    console.log(error);
  }
};
