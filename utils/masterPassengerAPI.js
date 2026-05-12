import axios from "@/utils/axios/axios";
import config from "@/config";

// helper to build URLs from config.json templates
const buildUrl = (template, params = {}) => {
  let url = template;
  Object.keys(params).forEach((key) => {
    url = url.replace(`{${key}}`, params[key]);
  });
  return url;
};

/**
 * Create a new master passenger
 */
export const createMasterPassenger = async (passengerData) => {
  try {
    const response = await axios.post(config.MASTER_PASSENGERS, passengerData);

    if (response.data.status) {
      return {
        success: true,
        data: response.data.data,
        message: response.data.message,
      };
    }

    return {
      success: false,
      message: response.data.message || "Failed to create passenger",
    };
  } catch (error) {
    return {
      success: false,
      message:
        error.response?.data?.message || "Failed to create master passenger",
    };
  }
};

/**
 * Get all master passengers with optional filters
 */
export const getMasterPassengers = async (filters = {}) => {
  try {
    const params = new URLSearchParams();

    if (filters.passengerType)
      params.append("passengerType", filters.passengerType);
    if (filters.travelCategory)
      params.append("travelCategory", filters.travelCategory);

    const url = params.toString()
      ? `${config.MASTER_PASSENGERS}?${params.toString()}`
      : config.MASTER_PASSENGERS;

    const response = await axios.get(url);

    if (response.data.status) {
      return {
        success: true,
        data: response.data.data.passengers || [],
        limits: response.data.data.limits || {},
        counts: response.data.data.counts || {},
        canAdd: response.data.data.canAdd || {},
        remaining: response.data.data.remaining || {},
      };
    }

    return {
      success: false,
      message: response.data.message || "Failed to fetch passengers",
    };
  } catch (error) {
    return {
      success: false,
      message:
        error.response?.data?.message || "Failed to fetch master passengers",
      data: [],
    };
  }
};

/**
 * Get a single master passenger by ID
 */
export const getMasterPassengerById = async (id) => {
  try {
    const url = buildUrl(config.MASTER_PASSENGERS_BY_ID, { id });

    const response = await axios.get(url);

    return {
      success: response.data.status === true,
      message: response.data.message,
      data: response.data.data,
    };
  } catch (error) {
    return {
      success: false,
      message:
        error.response?.data?.message || "Failed to fetch master passenger",
    };
  }
};

/**
 * Update a master passenger
 */
export const updateMasterPassenger = async (id, updateData) => {
  try {
    const url = buildUrl(config.MASTER_PASSENGERS_BY_ID, { id });

    const response = await axios.put(url, updateData);

    if (response.data.status) {
      return {
        success: true,
        data: response.data.data,
        message: response.data.message,
      };
    }

    return {
      success: false,
      message: response.data.message || "Failed to update passenger",
    };
  } catch (error) {
    return {
      success: false,
      message:
        error.response?.data?.message || "Failed to update master passenger",
    };
  }
};

/**
 * Delete a master passenger
 */
export const deleteMasterPassenger = async (id) => {
  try {
    const url = buildUrl(config.MASTER_PASSENGERS_BY_ID, { id });

    const response = await axios.delete(url);

    if (response.data.status) {
      return {
        success: true,
        message: response.data.message,
      };
    }

    return {
      success: false,
      message: response.data.message || "Failed to delete passenger",
    };
  } catch (error) {
    return {
      success: false,
      message:
        error.response?.data?.message || "Failed to delete master passenger",
    };
  }
};

/**
 * Increment usage count
 */
export const incrementMasterPassengerUsage = async (id) => {
  try {
    const url = buildUrl(config.MASTER_PASSENGERS_USE, { id });

    await axios.post(url);
  } catch (error) {
    console.error("Failed to increment usage:", error);
  }
};
