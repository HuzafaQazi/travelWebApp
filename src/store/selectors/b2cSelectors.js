import { createSelector } from "@reduxjs/toolkit";

// ============================================
// Basic Selectors
// ============================================
export const selectB2CUser = (state) => state.b2cUser;
export const selectB2CProfile = (state) => state.b2cUser.profile;
export const selectB2CCompany = (state) => state.b2cUser.company;
export const selectB2CWallet = (state) => state.b2cUser.wallet;
export const selectB2CPreferences = (state) => state.b2cUser.preferences;
export const selectB2CBookings = (state) => state.b2cUser.bookings;
export const selectB2CRecentSearches = (state) => state.b2cUser.recentSearches;
export const selectB2CSavedTravelers = (state) => state.b2cUser.savedTravelers;
export const selectB2CIsLoading = (state) => state.b2cUser.isLoading;
export const selectB2CError = (state) => state.b2cUser.error;
export const selectB2CHasCheckedAuth = (state) =>
  state.b2cUser?.hasCheckedAuth || false;

// ============================================
// Profile Computed Selectors
// ============================================

export const selectB2CUserId = createSelector(
  [selectB2CProfile],
  (profile) => profile?.id || null
);

export const selectB2CUserFullName = createSelector(
  [selectB2CProfile],
  (profile) => {
    if (!profile) return "User";
    return (
      profile.fullName ||
      `${profile.firstName} ${profile.lastName}`.trim() ||
      "User"
    );
  }
);

export const selectB2CUserInitials = createSelector(
  [selectB2CProfile],
  (profile) => {
    if (!profile) return "U";
    const firstName = profile.firstName || "";
    const lastName = profile.lastName || "";
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase() || "U";
  }
);

export const selectB2CIsEmailVerified = createSelector(
  [selectB2CProfile],
  (profile) => profile?.isEmailVerified || false
);

export const selectB2CIsMobileVerified = createSelector(
  [selectB2CProfile],
  (profile) => profile?.isMobileVerified || false
);

export const selectB2CUserFirstName = createSelector(
  [selectB2CProfile],
  (profile) => profile?.firstName || ""
);

export const selectB2CUserLastName = createSelector(
  [selectB2CProfile],
  (profile) => profile?.lastName || ""
);

export const selectB2CUserEmail = createSelector(
  [selectB2CProfile],
  (profile) => profile?.email || ""
);

export const selectB2CUserMobile = createSelector(
  [selectB2CProfile],
  (profile) => profile?.mobile || ""
);

export const selectB2CUserStatus = createSelector(
  [selectB2CProfile],
  (profile) => profile?.status || "pending"
);

// Add this selector to check if profile is complete
export const selectIsProfileIncomplete = createSelector(
  [selectB2CProfile],
  (profile) => {
    if (!profile) return false; // No profile loaded yet

    // Check if any required field is missing
    const hasFirstName =
      profile.firstName && profile.firstName.trim().length > 0;
    const hasLastName = profile.lastName && profile.lastName.trim().length > 0;
    const hasEmail = profile.email && profile.email.trim().length > 0;

    // Profile is incomplete if any required field is missing
    return !hasFirstName || !hasLastName || !hasEmail;
  }
);

// ============================================
// Company Computed Selectors
// ============================================
export const selectHasCompanyDetails = createSelector(
  [selectB2CCompany],
  (company) => {
    if (!company) return false;
    // Check if at least one company field has a value
    return !!(
      company.companyName ||
      company.companyBrandName ||
      company.companyRegistrationNumber ||
      company.companyMobileNumber ||
      company.companyAddress ||
      company.companyPAN ||
      company.companyGSTIN ||
      company.companyEmail
    );
  }
);

export const selectCompanyName = createSelector(
  [selectB2CCompany],
  (company) => company?.companyName || ""
);

export const selectBrandName = createSelector(
  [selectB2CCompany],
  (company) => company?.companyBrandName || ""
);

export const selectCompanyEmail = createSelector(
  [selectB2CCompany],
  (company) => company?.companyEmail || ""
);

export const selectCompanyMobile = createSelector(
  [selectB2CCompany],
  (company) => company?.companyMobileNumber || ""
);

export const selectCompanyGSTIN = createSelector(
  [selectB2CCompany],
  (company) => company?.companyGSTIN || ""
);

export const selectCompanyPAN = createSelector(
  [selectB2CCompany],
  (company) => company?.companyPAN || ""
);

export const selectIsCompanyComplete = createSelector(
  [selectB2CCompany],
  (company) => {
    if (!company) return false;
    // Check if all mandatory company fields are filled
    return !!(
      company.companyName &&
      company.companyBrandName &&
      company.companyRegistrationNumber &&
      company.companyMobileNumber &&
      company.companyAddress &&
      company.companyPAN &&
      company.companyGSTIN &&
      company.companyEmail
    );
  }
);

export const selectCompanyCompletionPercentage = createSelector(
  [selectB2CCompany],
  (company) => {
    if (!company) return 0;

    const fields = [
      company.companyName,
      company.companyBrandName,
      company.companyRegistrationNumber,
      company.companyMobileNumber,
      company.companyAddress,
      company.companyPAN,
      company.companyGSTIN,
      company.companyEmail,
    ];

    const filledFields = fields.filter((field) => field && field.trim()).length;
    return Math.round((filledFields / fields.length) * 100);
  }
);

// ============================================
// Wallet Computed Selectors
// ============================================
export const selectB2CWalletBalance = createSelector(
  [selectB2CWallet],
  (wallet) => wallet?.balance || 0
);

export const selectB2CWalletLastTransaction = createSelector(
  [selectB2CWallet],
  (wallet) => wallet?.lastTransaction || null
);

export const selectHasSufficientBalance = (minAmount) =>
  createSelector([selectB2CWalletBalance], (balance) => balance >= minAmount);

// ============================================
// Bookings Computed Selectors
// ============================================
export const selectB2CBookingsCount = createSelector(
  [selectB2CBookings],
  (bookings) => bookings?.totalCount || 0
);

export const selectB2CUpcomingBookings = createSelector(
  [selectB2CBookings],
  (bookings) => {
    if (!bookings?.data) return [];

    const now = new Date();
    return bookings.data.filter((booking) => {
      const departureDate = new Date(booking.departureDate);
      return departureDate > now && booking.bookingStatus === "CONFIRMED";
    });
  }
);

export const selectB2CPastBookings = createSelector(
  [selectB2CBookings],
  (bookings) => {
    if (!bookings?.data) return [];

    const now = new Date();
    return bookings.data.filter((booking) => {
      const departureDate = new Date(booking.departureDate);
      return departureDate <= now;
    });
  }
);

export const selectB2CCancelledBookings = createSelector(
  [selectB2CBookings],
  (bookings) => {
    if (!bookings?.data) return [];
    return bookings.data.filter(
      (booking) => booking.bookingStatus === "CANCELLED"
    );
  }
);

export const selectB2CBookingsStats = createSelector(
  [
    selectB2CUpcomingBookings,
    selectB2CPastBookings,
    selectB2CCancelledBookings,
  ],
  (upcoming, past, cancelled) => ({
    upcoming: upcoming.length,
    past: past.length,
    cancelled: cancelled.length,
    total: upcoming.length + past.length + cancelled.length,
  })
);

// ============================================
// Profile Completion Selectors
// ============================================
export const selectProfileCompletionPercentage = createSelector(
  [selectB2CProfile],
  (profile) => {
    if (!profile) return 0;

    const fields = [
      profile.firstName,
      profile.lastName,
      profile.email,
      profile.mobile,
      profile.age,
      profile.gender,
      profile.dateOfBirth,
      profile.addressLine1,
      profile.pincode,
      profile.PAN,
    ];

    const filledFields = fields.filter((field) => field).length;
    return Math.round((filledFields / fields.length) * 100);
  }
);

export const selectIsProfileComplete = createSelector(
  [selectB2CProfile],
  (profile) => {
    if (!profile) return false;
    // Check mandatory fields
    return !!(
      profile.firstName &&
      profile.lastName &&
      profile.email &&
      profile.mobile &&
      profile.isEmailVerified &&
      profile.isMobileVerified
    );
  }
);

export const selectOverallAccountCompletion = createSelector(
  [selectProfileCompletionPercentage, selectCompanyCompletionPercentage],
  (profileCompletion, companyCompletion) => {
    // Average of both completions
    return Math.round((profileCompletion + companyCompletion) / 2);
  }
);

// ============================================
// Combined User Data Selector
// ============================================
export const selectCompleteUserData = createSelector(
  [selectB2CProfile, selectB2CCompany, selectB2CWallet],
  (profile, company, wallet) => ({
    profile,
    company,
    wallet,
    hasProfile: !!profile,
    hasCompany: !!company,
    hasWallet: !!wallet,
  })
);

// ============================================
// Verification Status Selector
// ============================================
export const selectVerificationStatus = createSelector(
  [selectB2CProfile],
  (profile) => ({
    email: profile?.isEmailVerified || false,
    mobile: profile?.isMobileVerified || false,
    allVerified:
      (profile?.isEmailVerified || false) &&
      (profile?.isMobileVerified || false),
  })
);

// ============================================
// Recent Searches Selectors
// ============================================
export const selectRecentSearchesCount = createSelector(
  [selectB2CRecentSearches],
  (searches) => searches?.length || 0
);

export const selectHasRecentSearches = createSelector(
  [selectB2CRecentSearches],
  (searches) => searches && searches.length > 0
);

// ============================================
// Saved Travelers Selectors
// ============================================
export const selectSavedTravelersCount = createSelector(
  [selectB2CSavedTravelers],
  (travelers) => travelers?.length || 0
);

export const selectHasSavedTravelers = createSelector(
  [selectB2CSavedTravelers],
  (travelers) => travelers && travelers.length > 0
);

export const selectIsLoggedIn = createSelector(
  [selectB2CProfile],
  (profile) => {
    if (!profile) return false;
    const id = profile.id ?? profile._id ?? profile.userId ?? null;
    return !!id;
  }
);
