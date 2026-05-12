import axios from "@/utils/axios/axios";
import config from "@/config";
import { store } from "@/store/store";

export async function sendChangeRequest(bookingId, remarks) {
  try {
    const configuration = {
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
    };

    const response = await axios.post(
      `${config.SEND_CHANGE_REQUEST}`,
      {
        bookingId: bookingId,
        remarks: remarks,
      },
      configuration
    );
    return response.data;
  } catch (error) {
    console.error("An error occurred while sending change request", error);
    return error;
    // throw error;
  }
}

export async function getChangeRequestStatus() {
  try {
    const configuration = {
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
    };

    const response = await axios.post(
      `${config.GET_CHANGE_REQUEST_STATUS}`,
      {
        getChangeReqStatusData: {
          BookingMode: 5,
          ChangeRequestId: 1824224,
          EndUserIp: "192.168.1.191",
        },
        vendorcode: "qtravel001",
      },
      configuration
    );
    return response.data;
  } catch (error) {
    console.error("An error occurred while sending chagen request", error);
    return error;
    // throw error;
  }
}

export async function createRefund() {
  try {
    console.log("Calling save payment details");
    const configuration = {
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
    };

    const response = await axios.post(
      `${config.CREATE_REFUND}`,
      {
        bookingId: "QT16893193211281b",
        amount: "5",
      },
      configuration
    );
    return response.data;
  } catch (error) {
    console.error("An error occurred while creating refund", error);
    return error;
    // throw error;
  }
}

export async function savePaymentDetails(bookingID, travelCategory) {
  const payload = {
    bookingId: bookingID,
  };

  if (travelCategory) {
    payload.travelCategory = travelCategory;
  } else {
    payload.travelCategory = "1";
  }

  try {
    console.log("Calling save payment details");
    const configuration = {
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
    };
    if (bookingID != null) {
      const response = await axios.post(
        `${config.SAVE_PAYMENT_DETAILS}`,
        payload,
        configuration
      );
      return response.data;
    } else {
      return null;
    }
  } catch (error) {
    console.error("An error occurred while saving payment details", error);
    return error;
    // throw error;
  }
}
export async function generateInvoice(bookingId) {
  try {
    console.log("Get generateinvoice pdf api called");
    const configuration = {
      headers: {
        "Content-Type": "application/pdf",
        "Access-Control-Allow-Origin": "*",
      },
    };

    const response = await axios.get(
      `${config.GET_BOOKING_INVOICE}?bookingId=${bookingId}&travelCategory=1`,
      {
        responseType: "arraybuffer",
      }
    );

    return response.data;
  } catch (error) {
    console.error("An error occurred while calling generateinvoice", error);
    return error;
  }
}

export async function generateCommonInvoice(payload) {
  try {
    const configuration = {
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
    };
    const response = await axios.post(
      `${config.GENERATE_INVOICE}`,
      payload,
      configuration
    );
    return response.data;
  } catch (error) {
    console.error("An error occurred while calling GENERATE_INVOICE", error);
    return error;
    // throw error;
  }
}

export async function generateCommonPDFInvoice(bookingId, travelCategory) {
  try {
    const configuration = {
      headers: {
        "Content-Type": "application/pdf",
        "Access-Control-Allow-Origin": "*",
      },
      responseType: "arraybuffer",
    };
    const response = await axios.get(
      `${config.GENERATE_PDF}?bookingId=${bookingId}&travelCategory=${travelCategory}`,
      {
        responseType: "arraybuffer",
      }
    );
    return response.data;
  } catch (error) {
    console.error("An error occurred while calling GENERATE_PDF", error);
    return error;
    // throw error;
  }
}

// export async function getRefundStatus() {
//   try {
//     console.log("Calling get refund status");
//     const configuration = {
//       headers: {
//         "Content-Type": "application/json",
//         "Access-Control-Allow-Origin": "*",
//       },
//     };
//     const response = await axios.post(
//       `${config.SAVE_PAYMENT_DETAILS}`,
//       {
//         pgCode: "CAS001",
//         bookingId: "QT16893160466974b"
//       },
//       configuration
//     );
//     return response.data;
//   } catch (error) {
//     console.error("An error occurred while calling get refund status", error);
//     return error;
//   }
// }

export async function getUserDetailsByID(userID) {
  console.log(`Get user details by id called, url is ${config.GET_USER_BY_ID}`);
  try {
    const configuration = {
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
      params: {
        id: userID,
      },
    };
    const response = await axios
      .get(`${config.GET_USER_BY_ID}`, configuration)
      .then();
    console.log(
      `The get user details by id response is ${JSON.stringify(response.data)}`
    );
    if (response.status === 200 && response.data.status === "SUCCESS") {
      // closePopup(); // Close the popup when the response is successful
      // setShowOTP(true);
      console.log("Success ", response);
      return response.data;
    } else {
      console.log("Went into else", response.data);
      // toast(`Error ${response.data}`);
    }
  } catch (error) {
    console.error("Went into catch for get user details by id", error);
  }
}

export async function getBookingList(userID, status, isCorporateUser = false) {
  try {
    console.log("Calling get booking List");
    const configuration = {
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
      params: {
        userId: userID,
        bookingStatus: status,
        pageNo: null,
        pageSize: null,
        sortBy: null,
      },
    };

    if (isCorporateUser) {
      const state = store.getState();
      const userInfo = state?.user?.userInfo;
      const { companyId } = userInfo;
      configuration.params.companyId = companyId;
    }

    const response = await axios.get(
      `${config.GET_BOOKING_LIST}`,
      configuration
    );
    return response.data;
  } catch (error) {
    console.error("An error occurred while calling get booking list", error);
    return error;
  }
}

export async function getTrainBookingList(status, page = 1, limit = 5) {
  try {
    console.log("Calling get train booking list", { status, page, limit });

    const configuration = {
      params: {
        status,
        page: page, // Pass the page number
        limit: limit, // Pass the limit (e.g., 5 bookings per page)
        fromDate: null,
        toDate: null,
        travelCategory: "3", // Fixed for train bookings
      },
    };

    const response = await axios.get(
      `${config.CORPORATE.GET_TRAIN_BOOKING_LIST}`,
      configuration
    );
    console.log("The train bookings are", response.data);
    return response.data;
  } catch (error) {
    console.error(
      "An error occurred while calling get train booking list",
      error
    );
    return error;
  }
}

export async function getBusBookingList(status, page = 1, limit = 5) {
  try {
    console.log("Calling get bus booking list", {
      status,
      page,
      limit,
    });

    const configuration = {
      params: {
        status,
        page: page, // Pass the page number
        limit: limit, // Pass the limit (e.g., 5 bookings per page)
        fromDate: null,
        toDate: null,
        travelCategory: "4", // Fixed for bus bookings
      },
    };

    const response = await axios.get(
      `${config.CORPORATE.GET_TRAIN_BOOKING_LIST}`, // Corrected endpoint (assuming config has GET_BUS_BOOKING_LIST)
      configuration
    );
    console.log("The bus bookings are", response.data);
    return response.data;
  } catch (error) {
    console.error(
      "An error occurred while calling get bus booking list",
      error
    );
    return error;
  }
}

export async function getCabBookingList(status, page = 1, limit = 5) {
  try {
    console.log("Calling get cab booking list", {
      status,
      page,
      limit,
    });

    const configuration = {
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
      params: {
        status,
        page: page, // Pass the page number
        limit: limit, // Pass the limit (e.g., 5 bookings per page)
        fromDate: null,
        toDate: null,
        travelCategory: "5", // Fixed for cab bookings
      },
    };

    const response = await axios.get(
      `${config.CORPORATE.GET_TRAIN_BOOKING_LIST}`, // Corrected endpoint (assuming config has GET_CAB_BOOKING_LIST)
      configuration
    );
    console.log("The cab bookings are", response.data);
    return response.data;
  } catch (error) {
    console.error(
      "An error occurred while calling get cab booking list",
      error
    );
    return error;
  }
}

export async function getTransportBookingDetails(
  bookingId,
  isCorporateUser = false
) {
  try {
    console.log("Calling get transport booking details");
    const configuration = {
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
    };

    if (isCorporateUser) {
      const state = store.getState();
      const userInfo = state?.user?.userInfo;
      const { companyId } = userInfo || {};
      if (companyId) {
        configuration.params = { companyId };
      } else {
        console.warn("No companyId found in userInfo for corporate user");
      }
    }

    // Validate config.GET_TRANSPORT_BOOKING_DETAILS
    if (!config.CORPORATE.GET_TRANSPORT_BOOKING_DETAILS) {
      throw new Error("GET_TRANSPORT_BOOKING_DETAILS is not defined in config");
    }

    const response = await axios.get(
      `${config.CORPORATE.GET_TRANSPORT_BOOKING_DETAILS}/${bookingId}`,
      configuration
    );
    console.log("Transport booking details response:", response.data);

    // Return a consistent structure
    return {
      status: response.data?.status || false,
      statuscode: response.data?.statuscode || 200,
      message:
        response.data?.message || "Transport booking fetched successfully",
      data: response.data?.data || {
        booking: null,
        passengers: [],
        journeys: [],
      },
    };
  } catch (error) {
    console.error(
      "An error occurred while calling get transport booking details",
      error
    );
    return {
      status: false,
      statuscode: error.response?.status || 500,
      message:
        error.message ||
        "An error occurred while fetching transport booking details",
      data: {
        booking: null,
        passengers: [],
        journeys: [],
      },
    };
  }
}

export async function getPackagesBookingList(userID, type) {
  try {
    console.log("Calling get booking List");
    const configuration = {
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
    };
    const response = await axios.get(
      `${config.PACKAGE_BOOKED_DETAILS}/${userID}/${type}`,
      configuration
    );
    return response.data;
  } catch (error) {
    console.error("An error occurred while calling get booking list", error);
    return error;
  }
}

export async function getRefundStatus(bookingId) {
  try {
    const configuration = {
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
    };

    const response = await axios.post(
      `${config.GET_REFUND_STATUS}`,
      {
        bookingId: bookingId,
      },
      configuration
    );
    return response.data;
  } catch (error) {
    console.error("An error occurred while sending change request", error);
    return error;
    // throw error;
  }
}

export async function packageBookingDetail(bookingId) {
  try {
    const configuration = {
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
    };

    const response = await axios.get(
      `${config.PACKAGE_SUCCESS_DETAIL}/${bookingId}`,
      configuration
    );
    return response.data;
  } catch (error) {
    console.error("An error occurred while sending change request", error);
    return error;
    // throw error;
  }
}

export async function getFlightBookingList(
  // userID,
  status,
  isCorporateUser = false
) {
  try {
    console.log("Calling get flight booking List");
    const configuration = {
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
      params: {
        // userId: userID,
        bookingStatus: status,
        pageNo: null,
        pageSize: null,
        sortBy: null,
      },
    };

    if (isCorporateUser) {
      const state = store.getState();
      const userInfo = state?.user?.userInfo;
      const { companyId } = userInfo;
      // configuration.params.companyId = companyId;
    }

    const response = await axios.get(
      `${config.FLIGHTS_BOOKING_LIST}`,
      configuration
    );
    return response.data;
  } catch (error) {
    console.error("An error occurred while calling get booking list", error);
    return error;
  }
}

export async function flightBookingDetail(payload) {
  try {
    const configuration = {
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
    };

    const response = await axios.post(
      `${config.FLIGHTS_BOOKING_DETAIL}`,
      payload,
      configuration
    );
    return response.data;
  } catch (error) {
    // throw error;
    return error;
  }
}
