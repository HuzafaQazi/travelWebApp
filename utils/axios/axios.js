import axios from "axios";
import config from "@/config";
import pako from "pako";
import Router from "next/router";
import { logEvent } from "firebase/analytics";
import { analytics } from "../firebase";
import { store } from "@/store/store";
import { loginUser, logoutUser } from "@/store/slices/userSlice";
import { resetTravelersState } from "@/store/slices/travellersSlice";
import showToast from "@/utils/toast";
import {
  setB2CProfile,
  setB2CWallet,
  setB2CCompany,
  setB2CLoading,
} from "@/store/slices/b2c/userSlice";
import { setNotifications } from "@/store/slices/notificationSlice";
import { setApprovals } from "@/store/slices/approvalSlice";

const axiosInstance = axios.create({
  baseURL: `${config.BASE_URL}`,
});

// Refresh token state management
let isRefreshing = false;
let failedQueue = [];
let refreshAttempts = new Map(); // Track attempts per request

const MAX_REFRESH_ATTEMPTS = 3;

// Helper to process failed queue
const processQueue = (error, token = null) => {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) {
      reject(error);
    } else {
      resolve(token);
    }
  });

  failedQueue = [];
};

// Generate unique request ID
const generateRequestId = () => {
  return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

// Copy static methods from the original axios
// Object.assign(axiosInstance, axios);

// Generate unique tab ID for this session
const generateTabId = () => {
  return `tab_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

// Get or create tab ID
const getTabId = () => {
  if (typeof window === "undefined") {
    return null;
  }
  let tabId = sessionStorage.getItem("tabId");
  if (!tabId) {
    tabId = generateTabId();
    sessionStorage.setItem("tabId", tabId);
  }
  return tabId;
};

// Helper functions for different storage types
const getTabSpecificKey = (key) => {
  const tabId = getTabId();
  return `${key}_${tabId}`;
};

const setTabSpecificData = (key, value) => {
  const tabSpecificKey = getTabSpecificKey(key);
  sessionStorage.setItem(tabSpecificKey, value);
};

const getTabSpecificData = (key) => {
  if (typeof window === "undefined") {
    return null;
  }
  const tabSpecificKey = getTabSpecificKey(key);
  return sessionStorage.getItem(tabSpecificKey);
};

const removeTabSpecificData = (key) => {
  const tabSpecificKey = getTabSpecificKey(key);
  sessionStorage.removeItem(tabSpecificKey);
};

// Create a separate axios instance for refresh token calls (no interceptors)
const refreshAxiosInstance = axios.create({
  baseURL: `${config.BASE_URL}`,
  timeout: 10000, // 10 second timeout
});
// Refresh token function
const refreshToken = async () => {
  const activeType = getActiveUserType();

  if (!activeType) {
    throw new Error("No active user type found");
  }

  // Get tokens for active user type
  const tokens = getUserTypeTokens(activeType);

  if (!tokens.refreshToken) {
    throw new Error(`No refresh token found for ${activeType}`);
  }

  try {
    console.log(`🔄 Refreshing ${activeType} token...`);

    // ✅ Map user type to refresh endpoint (add new types here)
    const endpointMap = {
      corporate: config.CORPORATE.REFRESH_TOKEN,
      qugo: config.REFRESH_TOKEN,
      // expense: config.EXPENSE.REFRESH_TOKEN, // Add when available
    };

    const endpoint = endpointMap[activeType];

    if (!endpoint) {
      throw new Error(
        `No refresh endpoint configured for user type: ${activeType}`,
      );
    }

    // Make refresh token request without interceptors to avoid infinite loop
    const refreshResponse = await refreshAxiosInstance.post(endpoint, {
      refreshToken: tokens.refreshToken,
    });

    let newAccessToken, newRefreshToken;

    if (activeType === "corporate") {
      // Corporate format
      if (refreshResponse.data?.status === true && refreshResponse.data?.data) {
        const newTokenData = refreshResponse.data.data;
        newAccessToken = newTokenData?.accessToken;
        newRefreshToken = newTokenData?.refreshToken || tokens.refreshToken;
      }
    } else if (activeType === "qugo" || activeType === "expense") {
      // Qugo/Expense format (similar)
      if (refreshResponse.data?.status === true && refreshResponse.data?.data) {
        const newTokenData = refreshResponse.data.data;
        newAccessToken = newTokenData.accessToken;
        newRefreshToken = newTokenData.refreshToken || tokens.refreshToken;
      }
    }

    if (!newAccessToken) {
      throw new Error(`Token refresh failed for ${activeType}`);
    }

    // ✅ Update tokens for active user type only
    storeUserTypeTokens(newAccessToken, newRefreshToken, activeType);
    storeLastActiveUserTokens(newAccessToken, newRefreshToken, activeType);

    console.log(`✅ ${activeType} token refreshed successfully`);
    return newAccessToken;
  } catch (error) {
    console.error(`❌ Token refresh error for ${activeType}:`, error);

    // Check if it's a 401 error from refresh token API (session not found)
    if (error?.response?.status === 401) {
      // Clear tokens for this user type only
      clearUserTypeTokens(activeType);
      clearPersistentTokens(activeType);
      throw new Error("REFRESH_TOKEN_INVALID");
    }
    throw error;
  }
};

// Persistent storage functions (localStorage)
const setPersistentData = (key, value) => {
  localStorage.setItem(key, value);
};

const getPersistentData = (key) => {
  return localStorage.getItem(key);
};

const removePersistentData = (key) => {
  localStorage.removeItem(key);
};

/**
 * Get all available saved user types from localStorage
 * @returns {Array} Array of { type, hasTokens, lastActive }
 */
const getAvailableUsers = () => {
  const availableUsers = [];

  // Get all localStorage keys
  const allKeys = Object.keys(localStorage);

  // Filter keys that start with 'lastActive_'
  const userTypeKeys = allKeys.filter((key) => key.startsWith("lastActive_"));

  // Extract user types and check validity
  userTypeKeys.forEach((key) => {
    const userType = key.replace("lastActive_", "");
    const tokens = getLastActiveUserTokens(userType);

    if (tokens) {
      availableUsers.push({
        type: userType,
        hasTokens: true,
        lastActive: new Date(tokens.timestamp).toLocaleString(),
        timestamp: tokens.timestamp,
      });
    }
  });

  // Sort by most recent first
  return availableUsers.sort((a, b) => b.timestamp - a.timestamp);
};

const clearLastActiveUser = () => {
  removePersistentData("lastActiveUser");
  removePersistentData("lastActiveCorporateUser");
  removePersistentData("lastActiveQugoUser");
};

const clearLastActiveCorporateUser = () => {
  removePersistentData("lastActiveCorporateUser");
};

const clearLastActiveQugoUser = () => {
  removePersistentData("lastActiveQugoUser");
};

// Check if current tab has active session
const hasActiveTabSession = () => {
  const activeUserType = getActiveUserType();

  if (!activeUserType) {
    // No active user type set
    return false;
  }

  // Check if this user type has tokens in session storage
  const tokens = getUserTypeTokens(activeUserType);

  // Session is active if we have both access and refresh tokens
  return Boolean(tokens.accessToken && tokens.refreshToken);
};

/**
 * Restore session for new tab (restore last active user)
 */
const restoreSessionForNewTab = async (preferredUserType = null) => {
  // If tab already has active session, don't restore
  if (hasAnyActiveSession()) {
    console.log("✅ Tab already has active session(s)");
    return null;
  }

  console.log("🔍 Attempting session restoration...");

  // Get available saved users from localStorage
  const availableUsers = getAvailableUsers();

  if (availableUsers.length === 0) {
    console.log("❌ No saved users found");
    return null;
  }

  console.log(`👥 Found ${availableUsers.length} saved user(s)`);

  // If preferred user type specified, try that first
  if (preferredUserType) {
    const preferredUser = availableUsers.find(
      (u) => u.type === preferredUserType,
    );
    if (preferredUser) {
      return await restoreSpecificUserType(preferredUserType);
    } else {
      // ✅ CRITICAL FIX: If preferred type specified but not found, return null
      // Don't fall back to other user types when URL explicitly suggests a specific type
      console.log(
        `❌ Preferred user type '${preferredUserType}' not found in saved users`,
      );
      console.log(
        `📋 Available user types: ${availableUsers
          .map((u) => u.type)
          .join(", ")}`,
      );
      return null;
    }
  }

  // Otherwise, restore most recent user (only when no preference specified)
  const mostRecentUser = availableUsers[0];
  return await restoreSpecificUserType(mostRecentUser.type);
};

/**
 * Restore specific user type
 */
const restoreSpecificUserType = async (userType) => {
  console.log(`🔄 Restoring ${userType} session...`);

  try {
    let tokensSource = "unknown";
    // ✅ PRIORITY 1: Check if tokens already exist in session storage
    let tokens = getUserTypeTokens(userType);

    if (tokens.accessToken && tokens.refreshToken) {
      console.log(
        `✅ Found ${userType} tokens in session storage, using existing session`,
      );
      // Tokens already in session storage, just set as active
      setActiveUserType(userType);
    } else {
      // ✅ PRIORITY 2: Get tokens from localStorage (persistent storage)
      console.log(
        `🔍 No tokens in session storage, checking localStorage for ${userType}...`,
      );

      tokens = getLastActiveUserTokens(userType);

      if (!tokens || !tokens.accessToken) {
        console.log(`❌ No tokens found in localStorage for ${userType}`);
        clearPersistentTokens(userType);
        return null;
      }

      console.log(
        `✅ Found ${userType} tokens in localStorage, restoring to session...`,
      );

      tokensSource = "localStorage";

      // Store tokens in session storage for this tab
      storeUserTypeTokens(tokens.accessToken, tokens.refreshToken, userType);
      setActiveUserType(userType);

      console.log(`✅ Tokens restored to session storage for ${userType}`);
    }

    // Verify session by fetching profile
    let profileData;
    if (userType === "corporate") {
      const response = await axiosInstance.get(
        `${config.CORPORATE.USER_DETAILS}`,
      );
      if (response?.data?.status === true && response?.data?.data) {
        profileData = response.data.data;

        const updatedData = {
          userId: profileData.userDetails._id,
          companyId: profileData.companyDetails._id,
          loggedInDetails: profileData,
          tabId: getTabId(),
          userType: "corporate",
        };
        // Store in Redux
        store.dispatch(loginUser(updatedData));

        // Fetch notifications and approvals
        try {
          const approvalsResponse = await axiosInstance.get(
            `${config.CORPORATE.GET_ALL_APPROVALS_LIST}?requestType=1&pageNo=0&pageSize=1`,
          );

          const notificationCount =
            approvalsResponse?.data?.data?.notificationCount || 0;
          store.dispatch(setNotifications(notificationCount));

          const approvalCount =
            approvalsResponse?.data?.data?.approvalCount || 0;
          store.dispatch(setApprovals({ count: approvalCount, data: [] }));

          console.log("✅ Corporate store initialization completed");
        } catch (error) {
          console.error("Error fetching notifications and approvals:", error);
          store.dispatch(setNotifications(0));
          store.dispatch(setApprovals({ count: 0, data: [] }));
        }
      }
    } else if (userType === "qugo") {
      const response = await axiosInstance.get(`${config.GET_USER_PROFILE}`);
      if (response?.data?.status === true && response?.data?.data) {
        const profile = response?.data?.data?.user;
        profileData = {
          id: profile.id || profile._id,
          userId: profile.id || profile._id,
          firstName: profile.firstName || "",
          middleName: profile.middleName || "",
          lastName: profile.lastName || "",
          fullName: profile.fullName || "User",
          email: profile.email,
          mobile: profile.mobile,
          isEmailVerified: profile.isEmailVerified || false,
          isMobileVerified: profile.isMobileVerified || false,
          wallet: profile.wallet,
          company: profile.company,
        };

        // Store in Redux
        store.dispatch(setB2CProfile(profileData));
        if (profileData.wallet) {
          store.dispatch(setB2CWallet(profileData.wallet));
        }
        if (profileData.company) {
          store.dispatch(setB2CCompany(profileData.company));
        }
      }
    }

    if (profileData) {
      console.log(
        `✅ ${userType} session verified and restored (from ${tokensSource})`,
      );

      // This ensures the session remains available for future tabs/restarts
      console.log(
        `💾 Updating persistent storage for ${userType} with fresh timestamp`,
      );

      // ✅ Read current tokens — the axios interceptor may have silently
      // rotated them during the profile API call above. Using the original
      // `tokens` variable would write the already-rotated T1_refresh back
      // to localStorage, breaking the next cold-start restoration.
      const currentTokens = getUserTypeTokens(userType);
      const latestAccessToken = currentTokens.accessToken ?? tokens.accessToken;
      const latestRefreshToken =
        currentTokens.refreshToken ?? tokens.refreshToken;

      storeLastActiveUserTokens(
        latestAccessToken,
        latestRefreshToken,
        userType,
      );

      console.log(
        `✅ Persistent storage updated for ${userType} with fresh timestamp`,
      );

      return { userType, profileData };
    } else {
      console.log(`❌ ${userType} session verification failed`);
      clearUserTypeTokens(userType);
      clearPersistentTokens(userType);
      setActiveUserType(null);
      return null;
    }
  } catch (error) {
    console.error(`❌ Error restoring ${userType} session:`, error);
    clearUserTypeTokens(userType);
    clearPersistentTokens(userType);
    setActiveUserType(null);
    return null;
  }
};

/**
 * Store tokens for any user type dynamically
 * @param {string} accessToken - Access token
 * @param {string} refreshToken - Refresh token
 * @param {string} userType - User type (corporate, qugo, expense, etc.)
 */
const storeUserTypeTokens = (accessToken, refreshToken, userType) => {
  if (!userType) {
    console.error("❌ Cannot store tokens without userType");
    return;
  }

  console.log(`💾 Storing ${userType} session tokens`);

  // ✅ Dynamic keys based on userType
  setTabSpecificData(`${userType}_accessToken`, accessToken);
  setTabSpecificData(`${userType}_refreshToken`, refreshToken);
};

/**
 * Get tokens for any user type dynamically
 * @param {string} userType - User type (corporate, qugo, expense, etc.)
 * @returns {Object} { accessToken, refreshToken }
 */
const getUserTypeTokens = (userType) => {
  if (!userType) {
    return { accessToken: null, refreshToken: null };
  }

  return {
    accessToken: getTabSpecificData(`${userType}_accessToken`),
    refreshToken: getTabSpecificData(`${userType}_refreshToken`),
  };
};

/**
 * Clear tokens for any user type dynamically
 * @param {string} userType - User type to clear
 */
const clearUserTypeTokens = (userType) => {
  if (!userType) return;

  console.log(`🧹 Clearing ${userType} session tokens`);

  removeTabSpecificData(`${userType}_accessToken`);
  removeTabSpecificData(`${userType}_refreshToken`);
};

/**
 * Get currently active user type
 * @returns {string|null} Current active user type
 */
const getActiveUserType = () => {
  return getTabSpecificData("activeUserType");
};

/**
 * Set active user type
 * @param {string} userType - User type to set as active
 */
const setActiveUserType = (userType) => {
  if (!userType) {
    console.error("❌ Cannot set empty userType as active");
    return;
  }

  console.log(`🔄 Setting active user type to: ${userType}`);
  setTabSpecificData("activeUserType", userType);
};

/**
 * Get current active user's tokens
 * @returns {Object} { accessToken, refreshToken }
 */
const getActiveUserTokens = () => {
  const activeType = getActiveUserType();
  if (!activeType) {
    return { accessToken: null, refreshToken: null };
  }

  return getUserTypeTokens(activeType);
};

/**
 * Check if specific user type has active session
 * @param {string} userType - User type to check
 * @returns {boolean}
 */
const hasUserTypeSession = (userType) => {
  if (!userType) return false;

  const tokens = getUserTypeTokens(userType);
  return Boolean(tokens.accessToken);
};

/**
 * Get all user types that have active sessions
 * @returns {string[]} Array of user types with active sessions
 */
const getLoggedInUserTypes = () => {
  // Get all keys from session storage
  const allKeys = Object.keys(sessionStorage);

  // Filter keys that end with '_accessToken'
  const tokenKeys = allKeys.filter((key) => key.endsWith("_accessToken"));

  // Extract user types from keys
  const userTypes = tokenKeys.map((key) => {
    return key.replace("_accessToken", "");
  });

  // Verify each has both access and refresh tokens
  return userTypes.filter((type) => {
    const tokens = getUserTypeTokens(type);
    return tokens.accessToken && tokens.refreshToken;
  });
};

/**
 * Check if any user is logged in
 * @returns {boolean}
 */
const hasAnyActiveSession = () => {
  return getLoggedInUserTypes().length > 0;
};

/**
 * Store tokens in localStorage for session restoration (any user type)
 * @param {string} accessToken
 * @param {string} refreshToken
 * @param {string} userType
 */
const storeLastActiveUserTokens = (accessToken, refreshToken, userType) => {
  if (!userType) {
    console.error("❌ Cannot store persistent tokens without userType");
    return;
  }

  const tokenData = {
    accessToken,
    refreshToken,
    timestamp: Date.now(),
    expiresAt: Date.now() + 7 * 24 * 60 * 60 * 1000, // 7 days
  };

  console.log(`💾 Storing ${userType} tokens in localStorage`);

  const compressedData = pako.deflate(JSON.stringify(tokenData));

  // ✅ Dynamic key based on userType
  setPersistentData(`lastActive_${userType}`, compressedData);
};

/**
 * Get tokens from localStorage for any user type
 * @param {string} userType
 * @returns {Object|null} { accessToken, refreshToken, timestamp, expiresAt }
 */
const getLastActiveUserTokens = (userType) => {
  if (!userType) return null;

  try {
    const compressedData = getPersistentData(`lastActive_${userType}`);
    if (!compressedData) return null;

    const numbersArray = compressedData.split(",").map(Number);
    const compressedUint8Array = new Uint8Array(numbersArray);
    const decodedData = pako.inflate(compressedUint8Array, { to: "string" });
    const tokenData = JSON.parse(decodedData);

    // Check if expired
    // if (Date.now() > tokenData.expiresAt) {
    //   removePersistentData(`lastActive_${userType}`);
    //   return null;
    // }

    return tokenData;
  } catch (error) {
    console.error(`Error retrieving ${userType} tokens:`, error);
    removePersistentData(`lastActive_${userType}`);
    return null;
  }
};

/**
 * Clear persistent tokens for any user type
 * @param {string} userType
 */
const clearPersistentTokens = (userType) => {
  if (!userType) return;

  console.log(`🧹 Clearing persistent tokens for ${userType}`);
  removePersistentData(`lastActive_${userType}`);
};

/**
 * Get token for current active user (used by axios interceptor)
 * @returns {string|null}
 */
const getToken = () => {
  if (typeof window === "undefined") return null;

  const activeType = getActiveUserType();
  if (!activeType) {
    console.log("⚠️ No active user type");
    return null;
  }

  const tokens = getUserTypeTokens(activeType);
  return tokens.accessToken?.replace(/"/g, "");
};

/**
 * Get current active user type (used by axios interceptor)
 * @returns {string|null}
 */
const getUserType = () => {
  if (typeof window === "undefined") return null;

  return getActiveUserType()?.replace(/"/g, "");
};

const addAuthHeaders = (config, context = null) => {
  const token = getToken(context);
  const userType = getUserType();

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  if (userType) {
    config.headers["X-User-Type"] = userType;
  }
  return config;
};

export const handleActivate = async (payload) => {
  try {
    const response = await axiosInstance.post(
      `${config.CORPORATE.ACTIVATE_EMPLOYEE}`,
      payload,
    );
    if (response.data?.status === "SUCCESS") {
      const loginData = response.data.data;

      const accessToken = loginData.accessTokenData?.accessToken;
      const refreshToken = loginData.accessTokenData?.refreshToken;

      if (!accessToken || !refreshToken) {
        throw new Error("Invalid login response - missing tokens");
      }

      // ✅ Store corporate tokens (doesn't affect qugo tokens)
      storeUserTypeTokens(accessToken, refreshToken, "corporate");

      // ✅ Store in localStorage for persistence
      storeLastActiveUserTokens(accessToken, refreshToken, "corporate");

      // ✅ Set as active user
      setActiveUserType("corporate");

      const updatedData = {
        userId: loginData.userDetails._id,
        companyId: loginData.companyDetails._id,
        loggedInDetails: loginData,
        tabId: getTabId(),
        userType: "corporate",
      };

      store.dispatch(loginUser(updatedData));

      return true;
    }
    return false;
  } catch (error) {
    if (error?.response?.data?.message === "User is already Active") {
      return "USER_ACTIVE";
    } else if (error?.response?.data?.message === "User not found.") {
      return "USER_NOT_FOUND";
    }
    console.log("error ", error);
    throw error;
  }
};

// API call for server-side logout (fire and forget)
const callLogoutAPI = async (userType) => {
  try {
    let logoutEndpoint;

    if (userType === "corporate") {
      logoutEndpoint = config.CORPORATE.LOGOUT;
    } else if (userType === "qugo") {
      logoutEndpoint = config.LOGOUT;
    }

    if (logoutEndpoint) {
      console.log(`Calling logout API for ${userType} user`);

      // Use a separate axios instance without interceptors to avoid issues
      const logoutAxios = axios.create({
        baseURL: config.BASE_URL,
        timeout: 5000, // 5 second timeout
      });

      // Get tokens for this user type
      const tokens = getUserTypeTokens(userType);
      if (tokens.accessToken) {
        logoutAxios.defaults.headers.common["Authorization"] =
          `Bearer ${tokens.accessToken}`;
        logoutAxios.defaults.headers.common["X-User-Type"] = userType;
      }

      await logoutAxios.post(logoutEndpoint);

      console.log(`Logout API call successful for ${userType} user`);
    }
  } catch (error) {
    // Don't throw error - this is fire and forget
    console.warn(`⚠️ Logout API call failed for ${userType}:`, error.message);
  }
};

/**
 * Logout specific user type or all users
 */
export const handleLogout = async (options = {}) => {
  const {
    userType = null, // "corporate" | "qugo" | null (null = logout active user)
    logoutAll = false, // If true, logout all users
    clearPersistent = true,
    forceGlobalLogout = false, // ✅ Force global logout (for security scenarios)
    reason = null,
  } = options;

  logEvent(analytics, "logout_click", {});

  try {
    // Determine which user(s) to logout
    let usersToLogout = [];

    if (logoutAll) {
      usersToLogout = getLoggedInUserTypes();
      console.log("🔴 Logging out all users:", usersToLogout);
    } else if (userType) {
      usersToLogout = [userType];
      console.log(`🔴 Logging out ${userType} user`);
    } else {
      const activeType = getActiveUserType();
      if (activeType) {
        usersToLogout = [activeType];
        console.log(`🔴 Logging out active user: ${activeType}`);
      }
    }

    if (usersToLogout.length === 0) {
      console.log("⚠️ No users to logout");
      return;
    }

    // Show appropriate message
    if (reason === "token_expired") {
      showToast("warning", "Your session has expired. Please log in again.");
    } else if (reason === "refresh_failed") {
      showToast(
        "error",
        "Unable to refresh your session. Please log in again.",
      );
    } else if (!reason) {
      showToast("success", "You have been logged out successfully.");
    }

    const currentPath =
      typeof window !== "undefined" ? window.location.pathname : "";
    const isOnCorporateRoute = currentPath.includes("/corporate");

    console.log(
      `🌐 Current route: ${currentPath}, Is corporate route: ${isOnCorporateRoute}`,
    );

    // Logout each user
    for (const type of usersToLogout) {
      console.log(`🔴 Processing logout for ${type}...`);

      // ✅ SMART LOGOUT DECISION - Compare tokens
      let shouldCallLogoutAPI = forceGlobalLogout;

      if (!forceGlobalLogout) {
        // Get current session token
        const sessionTokens = getUserTypeTokens(type);

        // Get persistent storage token
        const persistentTokens = getLastActiveUserTokens(type);

        if (sessionTokens.accessToken && persistentTokens?.accessToken) {
          // Compare tokens
          const isSameToken =
            sessionTokens.accessToken === persistentTokens.accessToken;

          if (isSameToken) {
            console.log(
              `💾 ${type}: Session token matches persistent token - OTHER TABS MAY BE USING IT`,
            );
            console.log(
              `📱 Skipping logout API call to preserve session for other tabs`,
            );
            shouldCallLogoutAPI = false;
          } else {
            console.log(
              `🔄 ${type}: Session token differs from persistent token - UNIQUE SESSION`,
            );
            console.log(
              `🌍 Calling logout API to invalidate this unique session`,
            );
            shouldCallLogoutAPI = true;
          }
        } else if (sessionTokens.accessToken && !persistentTokens) {
          console.log(`⚠️ ${type}: No persistent token found - UNIQUE SESSION`);
          console.log(`🌍 Calling logout API to invalidate session`);
          shouldCallLogoutAPI = true;
        } else {
          console.log(`ℹ️ ${type}: No valid tokens to compare`);
          shouldCallLogoutAPI = false;
        }
      } else {
        console.log(`🔒 Force global logout enabled - calling logout API`);
      }

      // Call logout API if needed
      if (shouldCallLogoutAPI) {
        console.log(`🌐 Calling backend logout API for ${type}`);
        callLogoutAPI(type).catch((err) => {
          console.warn(`Logout API failed for ${type}:`, err);
        });
      } else {
        console.log(
          `📱 Skipping backend logout API for ${type} (local logout only)`,
        );
      }

      // Clear Redux state
      if (type === "corporate") {
        store.dispatch(logoutUser());
        store.dispatch(resetTravelersState());
      } else if (type === "qugo") {
        const { clearB2CStore } = await import("@/store/initializeB2CStore");
        clearB2CStore();
        // Dispatch custom event for Qugo logout
        if (typeof window !== "undefined") {
          window.dispatchEvent(new CustomEvent("qugoLogout"));
        }
      }

      // Clear session tokens
      clearUserTypeTokens(type);

      // Clear persistent tokens if requested
      if (clearPersistent) {
        clearPersistentTokens(type);
      }
    }

    // Clear active user type
    removeTabSpecificData("activeUserType");

    // Clear refresh attempt tracking
    refreshAttempts.clear();
    isRefreshing = false;
    failedQueue = [];

    // If logging out all or current active user, redirect
    const remainingUsers = getLoggedInUserTypes();

    if (remainingUsers.length === 0) {
      // No users left - redirect based on current route context
      if (isOnCorporateRoute) {
        console.log("📍 No users remaining, redirecting to corporate login");
        await Router.push("/corporate");
      } else {
        console.log("📍 No users remaining, redirecting to home");
        await Router.push("/");
      }
    } else if (usersToLogout.includes(getActiveUserType())) {
      // Active user logged out, switch to remaining user
      const nextUser = remainingUsers[0];
      console.log(`📍 Switching to remaining user: ${nextUser}`);

      // ✅ If user explicitly logged out from a specific route, stay on that route's login
      // Otherwise, switch to the remaining user's route
      if (isOnCorporateRoute && usersToLogout.includes("corporate")) {
        // Logged out from corporate route, stay on corporate login
        console.log("📍 Staying on corporate route after logout");
        await Router.push("/corporate");
      } else if (!isOnCorporateRoute && usersToLogout.includes("qugo")) {
        // Logged out from qugo route, stay on qugo home
        console.log("📍 Staying on qugo route after logout");
        await Router.push("/");
      } else {
        // Switch to remaining user's route
        if (nextUser === "corporate") {
          setActiveUserType("corporate");
          await Router.push("/corporate");
        } else {
          setActiveUserType("qugo");
          await Router.push("/");
        }
      }
    }

    console.log("✅ Logout successful");
  } catch (error) {
    console.log("❌ Logout failed:", error);
  }
};

export const corporateSignUp = async (data, headers = {}) => {
  try {
    const response = await axiosInstance.post(
      `${config.CORPORATE.SIGNUP}`,
      data,
      { headers },
    );
    if (response.data.status === "SUCCESS") {
      const loginData = response.data.data;

      const accessToken = loginData.accessTokenData?.accessToken;
      const refreshToken = loginData.accessTokenData?.refreshToken;

      if (!accessToken || !refreshToken) {
        throw new Error("Invalid login response - missing tokens");
      }

      // ✅ Store corporate tokens (doesn't affect qugo tokens)
      storeUserTypeTokens(accessToken, refreshToken, "corporate");

      // ✅ Store in localStorage for persistence
      storeLastActiveUserTokens(accessToken, refreshToken, "corporate");

      // ✅ Set as active user
      setActiveUserType("corporate");

      const updatedData = {
        userId: loginData.userDetails._id,
        companyId: loginData.companyDetails._id,
        loggedInDetails: loginData,
        tabId: getTabId(),
        userType: "corporate",
      };
      store.dispatch(loginUser(updatedData));

      console.log("✅ Corporate signup successful");

      return response.data.data;
    }
    return false;
  } catch (error) {
    console.error("Signup failed:", error);
    throw error;
  }
};

export const corporateLogin = async (credentials) => {
  try {
    const response = await axiosInstance.post(
      `${config.CORPORATE.LOGIN}`,
      credentials,
    );

    // ✅ Check for 2FA requirement
    if (
      response.data.status === true &&
      response.data.data?.twoFactorRequired === true
    ) {
      console.log("🔐 2FA required for login");
      return {
        requires2FA: true,
        userId: response.data.data.userId,
        companyId: response.data.data.companyId,
        email: response.data.data.email,
        mobile: response.data.data.mobile,
        availableMethods: response.data.data.availableMethods,
        defaultMethod: response.data.data.defaultMethod,
        maskedEmail: response.data.data.maskedEmail,
        maskedPhone: response.data.data.maskedPhone,
      };
    }

    // ✅ Handle OTP sent response (when otpType is "New")
    if (
      response.data.status === true &&
      response.data.data?.status === "OTP Sent"
    ) {
      console.log("📧 OTP sent successfully");
      return {
        otpSent: true,
        expiresIn: response.data.data.expiresIn,
        message: response.data.data.message,
      };
    }

    // ✅ Normal login response
    if (response.data.status === true && response?.data?.data) {
      const loginData = response.data.data;

      const accessToken = loginData.accessTokenData?.accessToken;
      const refreshToken = loginData.accessTokenData?.refreshToken;

      if (!accessToken || !refreshToken) {
        throw new Error("Invalid login response - missing tokens");
      }

      // ✅ Store corporate tokens (doesn't affect qugo tokens)
      storeUserTypeTokens(accessToken, refreshToken, "corporate");

      // ✅ Store in localStorage for persistence
      storeLastActiveUserTokens(accessToken, refreshToken, "corporate");

      // ✅ Set as active user
      setActiveUserType("corporate");

      const updatedData = {
        userId: loginData.userDetails._id,
        companyId: loginData.companyDetails._id,
        loggedInDetails: loginData,
        tabId: getTabId(),
        userType: "corporate",
      };
      store.dispatch(loginUser(updatedData));

      console.log("✅ Corporate login successful");

      return response.data.data;
    }
    return false;
  } catch (error) {
    console.error("Login failed:", error);
    throw error;
  }
};

/**
 * Qugo Login - Store tokens without affecting corporate session
 */
export const qugoLogin = async (credentials) => {
  try {
    console.log("🔐 Qugo login attempt...");

    const response = await axiosInstance.post(
      `${config.REGISTER_USER}`,
      credentials,
    );

    if (response.data.status === true && response.data.data) {
      const loginData = response.data.data;

      const accessToken = loginData.accessToken;
      const refreshToken = loginData.refreshToken;

      if (!accessToken || !refreshToken) {
        throw new Error("Invalid login response - missing tokens");
      }

      // ✅ Store qugo tokens (doesn't affect corporate tokens)
      storeUserTypeTokens(accessToken, refreshToken, "qugo");

      // ✅ Store in localStorage for persistence
      storeLastActiveUserTokens(accessToken, refreshToken, "qugo");

      // ✅ Set as active user
      setActiveUserType("qugo");

      // Transform user data
      const userData = {
        id: loginData.user.id,
        userId: loginData.user.id,
        firstName: loginData.user.firstName || "",
        middleName: loginData.user.middleName || "",
        lastName: loginData.user.lastName || "",
        fullName: loginData.user.fullName || "User",
        email: loginData.user.email,
        mobile: loginData.user.mobile,
        isEmailVerified: loginData.user.isEmailVerified || false,
        isMobileVerified: loginData.user.isMobileVerified || false,
        wallet: loginData.user.wallet,
        company: loginData.user.company || null,
      };

      // ✅ Store qugo data in Redux
      store.dispatch(setB2CProfile(userData));
      if (userData.wallet) {
        store.dispatch(setB2CWallet(userData.wallet));
      }
      if (userData.company) {
        store.dispatch(setB2CCompany(userData.company));
      }

      console.log("✅ Qugo login successful");
      return userData;
    }

    return false;
  } catch (error) {
    console.error("❌ Qugo login failed:", error);
    throw error;
  }
};

export const fetchAndUpdateUserDetails = async () => {
  try {
    const response = await axiosInstance.get(
      `${config.CORPORATE.USER_DETAILS}`,
    );

    if (response?.data?.status === "SUCCESS") {
      const userData = response?.data?.data;

      const {
        companyDetails,
        travelPolicy,
        configuration,
        rolesModulesAndPermissions,
        accessTokenData,
        ...cleanUserData
      } = userData;

      // const refactoredLoginDetails = {
      //   userDetails: cleanUserData,
      //   companyDetails: companyDetails,
      //   configuration: configuration,
      //   rolesModulesAndPermissions: rolesModulesAndPermissions,
      //   travelPolicy: travelPolicy,
      //   accessTokenData: accessTokenData,
      // };

      // Update Redux store with latest user info
      store.dispatch(
        loginUser({
          userId: userData?.userDetails?._id,
          companyId: userData?.userDetails?.companyId,
          loggedInDetails: userData,
          tabId: getTabId(),
          userType: "corporate",
        }),
      );

      return userData;
    }
    return null;
  } catch (error) {
    console.error("Error fetching user details:", error);
    if (
      error?.response?.status === 404 ||
      error?.response?.status === 401 ||
      error?.response?.status === 400
    ) {
      // User not found or deleted
      handleLogout();
    }
    return null;
  }
};

// Export all helper functions
export {
  getTabId,
  setTabSpecificData,
  getTabSpecificData,
  removeTabSpecificData,
  restoreSessionForNewTab,
  hasActiveTabSession,
  clearLastActiveUser,
  clearLastActiveCorporateUser,
  clearLastActiveQugoUser,
  getAvailableUsers,
  setActiveUserType,
  getActiveUserType,
  storeUserTypeTokens,
  storeLastActiveUserTokens,
};

axiosInstance.interceptors.request.use(
  async (config) => {
    // Add unique request ID for tracking
    config._requestId = generateRequestId();
    config = addAuthHeaders(config);
    return config;
  },
  (error) => {
    if (typeof window !== "undefined") {
      return Promise.reject(error);
    }
  },
);

axiosInstance.interceptors.response.use(
  (response) => {
    // Reset refresh attempts on successful response
    if (response.config._requestId) {
      refreshAttempts.delete(response.config._requestId);
    }
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    if (
      error?.response?.status === 401 &&
      originalRequest &&
      !originalRequest._retry
    ) {
      const requestId = originalRequest._requestId;

      // Initialize or increment attempt counter for this request
      const currentAttempts = refreshAttempts.get(requestId) || 0;

      if (currentAttempts >= MAX_REFRESH_ATTEMPTS) {
        console.log(
          `Max refresh attempts (${MAX_REFRESH_ATTEMPTS}) reached for request ${requestId}`,
        );
        refreshAttempts.delete(requestId);

        // Show user-friendly message and logout
        if (typeof window !== "undefined") {
          await handleLogout({
            clearPersistent: true, // Clear localStorage
            forceGlobalLogout: true, // ✅ Force API call
            reason: "refresh_failed",
          });
        }
        return Promise.reject(error);
      }

      // Increment attempt counter
      refreshAttempts.set(requestId, currentAttempts + 1);
      originalRequest._retry = true;

      if (isRefreshing) {
        // If refresh is in progress, queue this request
        console.log(
          `Queueing request ${requestId} (attempt ${currentAttempts + 1})`,
        );
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return axiosInstance(originalRequest);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }

      isRefreshing = true;
      console.log(
        `Starting token refresh for request ${requestId} (attempt ${
          currentAttempts + 1
        })`,
      );

      try {
        const newToken = await refreshToken();

        // Update authorization header
        originalRequest.headers.Authorization = `Bearer ${newToken}`;

        // Process queued requests
        processQueue(null, newToken);

        isRefreshing = false;

        // Retry original request
        return axiosInstance(originalRequest);
      } catch (refreshError) {
        console.error("Token refresh failed:", refreshError);

        // Process queued requests with error
        processQueue(refreshError, null);
        isRefreshing = false;

        // Get current attempts BEFORE deleting
        const currentRefreshAttempts = refreshAttempts.get(requestId) || 0;

        // Clear attempt counter for this request
        refreshAttempts.delete(requestId);

        // Check if refresh token was invalid (401 error)
        if (refreshError.message === "REFRESH_TOKEN_INVALID") {
          console.log("Refresh token invalid, logging out user");
          if (typeof window !== "undefined") {
            await handleLogout({
              clearPersistent: true, // Clear localStorage
              forceGlobalLogout: true, // ✅ Force API call
              reason: "token_expired",
            });
          }
          return Promise.reject(new Error("Session expired"));
        }

        // For other errors (network, timeout, server errors)
        // Check if this was the final attempt
        console.log(`Current refresh attempts: ${currentRefreshAttempts}`);
        if (currentRefreshAttempts >= MAX_REFRESH_ATTEMPTS) {
          console.log("Max refresh attempts reached, logging out user");
          if (typeof window !== "undefined") {
            await handleLogout({
              clearPersistent: true, // Clear localStorage
              forceGlobalLogout: true, // ✅ Force API call
              reason: "refresh_failed",
            });
          }
          return Promise.reject(new Error("Unable to refresh session"));
        }

        console.log("Refresh failed due to network or other error");
        return Promise.reject(refreshError);
      }
    }

    // For non-401 errors, clean up attempt tracking
    if (originalRequest?._requestId) {
      refreshAttempts.delete(originalRequest._requestId);
    }

    return Promise.reject(error);
  },
);

export default axiosInstance;
