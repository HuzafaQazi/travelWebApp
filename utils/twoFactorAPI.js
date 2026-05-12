import axios from "@/utils/axios/axios";
import config from "@/config";

/**
 * Send OTP to email or phone
 */
export const sendOTP = async (method, userId, companyId) => {
  try {
    const response = await axios.post(config.CORPORATE.SEND_2FA_OTP, {
      userId: userId,
      companyId: companyId,
      method: method,
    });

    if (response.data.status === true) {
      return {
        success: true,
        message: response.data.message || `OTP sent to ${method}`,
        data: response.data.data,
      };
    }

    return {
      success: false,
      message: response.data.message || "Failed to send OTP",
    };
  } catch (error) {
    console.error(`Error sending OTP via ${method}:`, error);
    return {
      success: false,
      message: error.response?.data?.message || "Failed to send OTP",
    };
  }
};

/**
 * Verify OTP
 */
export const verifyOTP = async (otp, method, userId, companyId) => {
  try {
    const response = await axios.post(config.CORPORATE.VERIFY_2FA_OTP, {
      userId: userId,
      companyId: companyId,
      otp: otp,
      method: method,
    });

    if (response.data.status === true) {
      return {
        success: true,
        message: response.data.message || "OTP verified successfully",
        data: response.data.data,
      };
    }

    return {
      success: false,
      message: response.data.message || "Invalid OTP",
    };
  } catch (error) {
    console.error("Error verifying OTP:", error);
    return {
      success: false,
      message: error.response?.data?.message || "Failed to verify OTP",
    };
  }
};

/**
 * Enable 2FA
 */
export const enable2FA = async (method) => {
  try {
    const response = await axios.post(config.CORPORATE.ENABLE_2FA, {
      method: method,
    });

    if (response.data.status === true) {
      return {
        success: true,
        message: response.data.message || "2FA enabled successfully",
      };
    }

    return {
      success: false,
      message: response.data.message || "Failed to enable 2FA",
    };
  } catch (error) {
    console.error("Error enabling 2FA:", error);
    return {
      success: false,
      message: error.response?.data?.message || "Failed to enable 2FA",
    };
  }
};

/**
 * Disable 2FA
 */
export const disable2FA = async () => {
  try {
    const response = await axios.post(config.CORPORATE.DISABLE_2FA);

    if (response.data.status === true) {
      return {
        success: true,
        message: response.data.message || "2FA disabled successfully",
      };
    }

    return {
      success: false,
      message: response.data.message || "Failed to disable 2FA",
    };
  } catch (error) {
    console.error("Error disabling 2FA:", error);
    return {
      success: false,
      message: error.response?.data?.message || "Failed to disable 2FA",
    };
  }
};

/**
 * Get 2FA status
 */
export const get2FAStatus = async () => {
  try {
    const response = await axios.get(config.CORPORATE.GET_2FA_STATUS);

    if (response.data.status === true) {
      return {
        success: true,
        data: response.data.data,
      };
    }

    return {
      success: false,
      message: response.data.message || "Failed to get 2FA status",
    };
  } catch (error) {
    console.error("Error getting 2FA status:", error);
    return {
      success: false,
      message: error.response?.data?.message || "Failed to get 2FA status",
    };
  }
};
