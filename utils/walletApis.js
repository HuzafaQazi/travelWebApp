import axios from "@/utils/axios/axios";
import config from "@/config";

export async function getTransactions(page = 1, limit = 10) {
  try {
    console.log(config);
    const configuration = {
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": " *",
      },
    };

    const response = await axios.get(
      `${config.GET_WALLET_TRANSACTIONS}?page=${page}&limit=${limit}`,
      configuration
    );
    return response.data;
  } catch (error) {
    console.error("An error occurred while sending change request", error);
    return error;
    // throw error;
  }
}

export async function getWalletBalance(userId) {
  try {
    const configuration = {
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": " *",
      },
    };

    const response = await axios.get(
      `${config.GET_WALLET_BALANCE}?userId=${userId}`,
      configuration
    );
    return response.data;
  } catch (error) {
    console.error("An error occurred while sending change request", error);
    return error;
    // throw error;
  }
}

export async function confirmPaymentHotels(body) {
  try {
    console.log(config);
    const configuration = {
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": " *",
      },
    };

    const response = await axios.post(
      `${config.CONFIRM_WALLET_PAYMENT_HOTELS}`,
      body,
      configuration
    );
    return response.data;
  } catch (error) {
    console.error("An error occurred while sending change request", error);
    return error;
    // throw error;
  }
}

export async function confirmPaymentFlights(body) {
  try {
    console.log(config);
    const configuration = {
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": " *",
      },
    };

    const response = await axios.post(
      `${config.CONFIRM_WALLET_PAYMENT_FLIGHTS}`,
      body,
      configuration
    );
    console.log("response", response);
    return response.data;
  } catch (error) {
    console.error("An error occurred while sending change request", error);
    return error;
    // throw error;
  }
}

export async function confirmPaymentPackages(body) {
  try {
    console.log(config);
    const configuration = {
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": " *",
      },
    };

    const response = await axios.post(
      `${config.CONFIRM_WALLET_PAYMENT_PACKAGES}`,
      body,
      configuration
    );
    return response.data;
  } catch (error) {
    console.error("An error occurred while sending change request", error);
    return error;
    // throw error;
  }
}
