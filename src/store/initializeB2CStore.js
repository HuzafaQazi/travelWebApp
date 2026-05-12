import axios, { setActiveUserType } from "@/utils/axios/axios";
import config from "@/config";
import { store } from "@/store/store";
import {
  setB2CProfile,
  setB2CWallet,
  setB2CCompany,
  setB2CBookings,
  setB2CLoading,
  setB2CError,
  clearB2CData,
} from "@/store/slices/b2c/userSlice";

export async function syncB2CUserData(options = {}) {
  const {
    fetchProfile = true,
    fetchBookings = true,
    fetchPreferences = true,
    fetchTravelers = true,
    fetchWallet = true,
    showLoading = true,
    bookingsPageSize = 10,
  } = options;

  try {
    console.log("🎯 Starting B2C user data sync...");

    if (showLoading) {
      store.dispatch(setB2CLoading(true));
    }

    // ============================================
    // Fetch Profile (includes userId)
    // ============================================
    let userData = null;
    let userId = null;

    if (fetchProfile) {
      const profileResponse = await axios.get(`${config.GET_USER_PROFILE}`);

      if (
        profileResponse?.data?.status === true &&
        profileResponse?.data?.data
      ) {
        const responseData = profileResponse.data.data;
        const userInfo = responseData.user || responseData;

        userId = userInfo.id || userInfo._id;

        userData = {
          id: userId,
          userId: userId,
          firstName: userInfo.firstName || "",
          middleName: userInfo.middleName || "",
          lastName: userInfo.lastName || "",
          fullName: userInfo.fullName || "User",
          email: userInfo.email || "",
          mobile: userInfo.mobile || "",
          isEmailVerified: userInfo.isEmailVerified || false,
          isMobileVerified: userInfo.isMobileVerified || false,
          wallet: userInfo.wallet || {},
          company: userInfo.company || null,
        };
        let companyData = null;
        // Extract company data if present
        if (userInfo.company) {
          companyData = {
            companyName: userInfo.company.companyName || "",
            brandName: userInfo.company.companyBrandName || "",
            companyRegistrationNumber:
              userInfo.company.companyRegistrationNumber || "",
            companyMobileNumber: userInfo.company.companyMobileNumber || "",
            companyAddress: userInfo.company.companyAddress || "",
            companyPAN: userInfo.company.companyPAN || "",
            companyGSTIN: userInfo.company.companyGSTIN || "",
            companyEmail: userInfo.company.companyEmail || "",
          };
        }

        console.log(`✅ B2C profile loaded for user: ${userId}`);

        // Store in Redux
        store.dispatch(setB2CProfile(userData));

        if (companyData) {
          store.dispatch(setB2CCompany(companyData));
          console.log("✅ Company details loaded");
        }

        if (userInfo.wallet) {
          store.dispatch(setB2CWallet(userInfo.wallet));
        }
      }
    }

    // If we don't have userId from profile, can't fetch other data
    if (!userId) {
      throw new Error("Could not get userId from profile");
    }

    // ============================================
    // Fetch Bookings
    // ============================================
    // if (fetchBookings) {
    //   try {
    //     const bookingsResponse = await axios.get(
    //       `${config.GET_BOOKING_LIST}?userId=${userId}&bookingStatus=all&pageNo=1&pageSize=${bookingsPageSize}&enablePagination=true`
    //     );

    //     if (bookingsResponse?.data?.status === "SUCCESS") {
    //       const bookingsData = bookingsResponse.data.data;

    //       store.dispatch(
    //         setB2CBookings({
    //           data: bookingsData.data || [],
    //           totalCount: bookingsData.totalCount || 0,
    //           currentPage: bookingsData.currentPage || 1,
    //           hasMore: bookingsData.hasNext || false,
    //         })
    //       );

    //       console.log(`✅ Loaded ${bookingsData.data?.length || 0} bookings`);
    //     }
    //   } catch (error) {
    //     console.warn("⚠️ Could not load bookings:", error.message);
    //   }
    // }

    if (showLoading) {
      store.dispatch(setB2CLoading(false));
    }

    console.log("🎉 B2C data sync completed!");

    return { success: true };
  } catch (error) {
    console.error("❌ Error syncing B2C user data:", error);

    if (showLoading) {
      store.dispatch(setB2CLoading(false));
    }

    store.dispatch(setB2CError(error.message));

    // if (error?.response?.status === 401) {
    //   const { handleLogout } = await import("@/utils/axios/axios");
    //   await handleLogout(true, "token_expired");
    // }

    return { success: false, error: error.message };
  }
}

export async function initializeB2CStore() {
  return await syncB2CUserData({
    fetchProfile: true,
    fetchBookings: true,
    fetchPreferences: true,
    fetchTravelers: true,
    fetchWallet: true,
    showLoading: true,
    bookingsPageSize: 10,
  });
}

/**
 * Update user profile (personal details only)
 */
export async function updateUserProfile(profileData) {
  try {
    console.log("📝 Updating user profile...");

    const response = await axios.put(
      `${config.UPDATE_USER_PROFILE}`,
      profileData
    );

    if (response?.data?.status === true) {
      // Sync the updated data
      await syncB2CUserData({
        fetchProfile: true,
        fetchBookings: false,
        showLoading: false,
      });

      console.log("✅ Profile updated successfully");
      return { success: true, data: response.data.data };
    }

    return { success: false, error: "Failed to update profile" };
  } catch (error) {
    console.error("❌ Error updating profile:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Update company details only
 */
export async function updateCompanyDetails(companyData) {
  try {
    console.log("🏢 Updating company details...");

    const response = await axios.put(
      `${config.UPDATE_COMPANY_DETAILS}`,
      companyData
    );

    if (response?.data?.status === true) {
      // Update Redux store with new company data
      store.dispatch(setB2CCompany(companyData));

      console.log("✅ Company details updated successfully");
      return { success: true, data: response.data.data };
    }

    return { success: false, error: "Failed to update company details" };
  } catch (error) {
    console.error("❌ Error updating company details:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Refresh only profile data
 */
export async function refreshProfile() {
  return await syncB2CUserData({
    fetchProfile: true,
    fetchBookings: false,
    fetchPreferences: false,
    fetchTravelers: false,
    fetchWallet: false,
    showLoading: false,
  });
}

export function clearB2CStore() {
  store.dispatch(clearB2CData());
}
