import { createSelector } from "@reduxjs/toolkit";

// ============================================
// Basic Selectors
// ============================================
export const selectCorporateUser = (state) => state?.user;
export const selectCorporateWallet = (state) =>
  state?.user?.userInfo?.loggedInDetails?.wallet;
export const selectCorporateIsLoggedIn = (state) => state?.user?.isLoggedIn;
export const selectCorporateUserInfo = (state) => state.user.userInfo;
export const selectCorporateHasCheckedAuth = (state) =>
  state.user.hasCheckedAuth;
export const selectCorporateTabId = (state) => state.user.tabId;

// ============================================
// Login Details Selector
// ============================================
export const selectCorporateLoginDetails = createSelector(
  [selectCorporateUserInfo],
  (userInfo) => userInfo?.loggedInDetails || null
);

// ============================================
// User Details Selectors
// ============================================
export const selectCorporateUserDetails = createSelector(
  [selectCorporateLoginDetails],
  (loginDetails) => loginDetails?.userDetails || null
);

export const selectCorporateUserId = createSelector(
  [selectCorporateUserDetails],
  (userDetails) => userDetails?._id || null
);

export const selectCorporateCompanyId = createSelector(
  [selectCorporateUserDetails],
  (userDetails) => userDetails?.companyId || null
);

// ============================================
// User Profile Computed Selectors
// ============================================
export const selectCorporateUserFullName = createSelector(
  [selectCorporateUserDetails],
  (userDetails) => {
    if (!userDetails) return "User";
    const firstName = userDetails.firstName || "";
    const lastName = userDetails.lastName || "";
    const fullNameTitle = `${
      userDetails.title || ""
    } ${firstName} ${lastName}`.trim();
    const fullName = `${firstName} ${lastName}`.trim();
    return fullName || "User";
  }
);

export const selectCorporateUserFirstName = createSelector(
  [selectCorporateUserDetails],
  (userDetails) => userDetails?.firstName || ""
);

export const selectCorporateUserLastName = createSelector(
  [selectCorporateUserDetails],
  (userDetails) => userDetails?.lastName || ""
);

export const selectCorporateUserTitle = createSelector(
  [selectCorporateUserDetails],
  (userDetails) => userDetails?.title || ""
);

export const selectCorporateUserEmail = createSelector(
  [selectCorporateUserDetails],
  (userDetails) => userDetails?.workEmail || ""
);

export const selectCorporateUserMobile = createSelector(
  [selectCorporateUserDetails],
  (userDetails) => userDetails?.mobile || ""
);

export const selectCorporateUserInitials = createSelector(
  [selectCorporateUserDetails],
  (userDetails) => {
    if (!userDetails) return "U";
    const firstName = userDetails.firstName || "";
    const lastName = userDetails.lastName || "";
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase() || "U";
  }
);

export const selectCorporateUserStatus = createSelector(
  [selectCorporateUserDetails],
  (userDetails) => userDetails?.status || "pending"
);

export const selectCorporateEmployeeId = createSelector(
  [selectCorporateUserDetails],
  (userDetails) => userDetails?.employeeId || ""
);

export const selectCorporateUserDepartmentId = createSelector(
  [selectCorporateUserDetails],
  (userDetails) => userDetails?.departmentId || null
);

export const selectCorporateUserDesignation = createSelector(
  [selectCorporateUserDetails],
  (userDetails) => userDetails?.designationId || null
);

export const selectCorporateUserRoleId = createSelector(
  [selectCorporateUserDetails],
  (userDetails) => userDetails?.roleId || null
);

export const selectCorporateUserLevelId = createSelector(
  [selectCorporateUserDetails],
  (userDetails) => userDetails?.levelId || null
);

export const selectCorporateUserBandId = createSelector(
  [selectCorporateUserDetails],
  (userDetails) => userDetails?.bandId || null
);

export const selectCorporateUserTypeId = createSelector(
  [selectCorporateUserDetails],
  (userDetails) => userDetails?.userTypeId || null
);

export const selectCorporateIsApprover = createSelector(
  [selectCorporateUserDetails],
  (userDetails) => userDetails?.isApprover || false
);

export const selectCorporateUserDateOfBirth = createSelector(
  [selectCorporateUserDetails],
  (userDetails) => userDetails?.dateOfBirth || null
);

export const selectCorporateUserPAN = createSelector(
  [selectCorporateUserDetails],
  (userDetails) => userDetails?.pan || ""
);

// ============================================
// User Location Selectors
// ============================================
export const selectCorporateUserCity = createSelector(
  [selectCorporateUserDetails],
  (userDetails) => userDetails?.city || ""
);

export const selectCorporateUserCityId = createSelector(
  [selectCorporateUserDetails],
  (userDetails) => userDetails?.cityId || null
);

export const selectCorporateUserCountry = createSelector(
  [selectCorporateUserDetails],
  (userDetails) => userDetails?.country || ""
);

export const selectCorporateUserCountryId = createSelector(
  [selectCorporateUserDetails],
  (userDetails) => userDetails?.countryId || null
);

export const selectCorporateUserAddress = createSelector(
  [selectCorporateUserDetails],
  (userDetails) => userDetails?.address || ""
);

// ============================================
// Travel Preferences Selectors
// ============================================
export const selectCorporateUserTravelPolicyId = createSelector(
  [selectCorporateUserDetails],
  (userDetails) => userDetails?.travelPolicyId || null
);

export const selectCorporateUserMealPreference = createSelector(
  [selectCorporateUserDetails],
  (userDetails) => userDetails?.mealPreference || ""
);

export const selectCorporateUserSeatPreference = createSelector(
  [selectCorporateUserDetails],
  (userDetails) => userDetails?.seatPreference || ""
);

export const selectCorporateUserAirlinePreference = createSelector(
  [selectCorporateUserDetails],
  (userDetails) => userDetails?.airlinePreference || ""
);

export const selectCorporateUserFlightClass = createSelector(
  [selectCorporateUserDetails],
  (userDetails) => userDetails?.flightClass || ""
);

export const selectCorporateUserRowPreference = createSelector(
  [selectCorporateUserDetails],
  (userDetails) => userDetails?.rowPreference || ""
);

export const selectCorporateUserHotelCategory = createSelector(
  [selectCorporateUserDetails],
  (userDetails) => userDetails?.hotelCategory || ""
);

export const selectCorporateUserRoomPreference = createSelector(
  [selectCorporateUserDetails],
  (userDetails) => userDetails?.roomPreference || ""
);

export const selectCorporateUserSmokingPreference = createSelector(
  [selectCorporateUserDetails],
  (userDetails) => userDetails?.smokingPreference || ""
);

// ============================================
// Passport Details Selectors
// ============================================
export const selectCorporateUserPassportNumber = createSelector(
  [selectCorporateUserDetails],
  (userDetails) => userDetails?.passportNumber || ""
);

export const selectCorporateUserPassportExpiry = createSelector(
  [selectCorporateUserDetails],
  (userDetails) => userDetails?.passportExpiry || null
);

export const selectCorporateUserPassportIssueDate = createSelector(
  [selectCorporateUserDetails],
  (userDetails) => userDetails?.passportIssueDate || null
);

export const selectCorporateUserPassportIssueCountryCode = createSelector(
  [selectCorporateUserDetails],
  (userDetails) => userDetails?.passportIssueCountryCode || ""
);

export const selectCorporateHasPassport = createSelector(
  [selectCorporateUserPassportNumber],
  (passportNumber) => !!passportNumber
);

// ============================================
// Company Details Selectors
// ============================================
export const selectCorporateCompanyDetails = createSelector(
  [selectCorporateLoginDetails],
  (loginDetails) => loginDetails?.companyDetails || null
);

export const selectCorporateCompanyName = createSelector(
  [selectCorporateCompanyDetails],
  (companyDetails) => companyDetails?.companyName || ""
);

export const selectCorporateCompanyGST = createSelector(
  [selectCorporateCompanyDetails],
  (companyDetails) => companyDetails?.gst || ""
);

export const selectCorporateCompanyPAN = createSelector(
  [selectCorporateCompanyDetails],
  (companyDetails) => companyDetails?.pan || ""
);

export const selectCorporateCompanyAddress = createSelector(
  [selectCorporateCompanyDetails],
  (companyDetails) => companyDetails?.address || ""
);

export const selectCorporateCompanyPincode = createSelector(
  [selectCorporateCompanyDetails],
  (companyDetails) => companyDetails?.pincode || ""
);

export const selectCorporateCompanyStatus = createSelector(
  [selectCorporateCompanyDetails],
  (companyDetails) => companyDetails?.status || ""
);

export const selectCorporateCompanyGSTMobile = createSelector(
  [selectCorporateCompanyDetails],
  (companyDetails) => companyDetails?.gstMobileNumber || ""
);

export const selectCorporateCompanyGSTEmail = createSelector(
  [selectCorporateCompanyDetails],
  (companyDetails) => companyDetails?.gstEmail || ""
);

export const selectCorporateCompanyAllowedDomains = createSelector(
  [selectCorporateCompanyDetails],
  (companyDetails) => companyDetails?.allowedDomains || []
);

export const selectCorporateCompanyIsApprover = createSelector(
  [selectCorporateCompanyDetails],
  (companyDetails) => companyDetails?.isApprover || false
);

// ============================================
// Company Location Details Selectors
// ============================================
export const selectCorporateCompanyCityDetails = createSelector(
  [selectCorporateCompanyDetails],
  (companyDetails) => companyDetails?.cityDetails || null
);

export const selectCorporateCompanyCityName = createSelector(
  [selectCorporateCompanyCityDetails],
  (cityDetails) => cityDetails?.cityname || ""
);

export const selectCorporateCompanyState = createSelector(
  [selectCorporateCompanyCityDetails],
  (cityDetails) => cityDetails?.state || ""
);

export const selectCorporateCompanyCountryDetails = createSelector(
  [selectCorporateCompanyDetails],
  (companyDetails) => companyDetails?.countryDetails || null
);

export const selectCorporateCompanyCountryName = createSelector(
  [selectCorporateCompanyCountryDetails],
  (countryDetails) => countryDetails?.countryname || ""
);

export const selectCorporateCompanyPhoneCode = createSelector(
  [selectCorporateCompanyCountryDetails],
  (countryDetails) => countryDetails?.phonecode || ""
);

// ============================================
// Wallet Computed Selectors
// ============================================
export const selectCorporateWalletBalance = createSelector(
  [selectCorporateWallet],
  (wallet) => wallet?.balance || 0
);

export const selectCorporateWalletLastTransaction = createSelector(
  [selectCorporateWallet],
  (wallet) => wallet?.lastTransaction || null
);

export const selectHasSufficientBalance = (minAmount) =>
  createSelector(
    [selectCorporateWalletBalance],
    (balance) => balance >= minAmount
  );

// ============================================
// Expense Sync Selectors
// ============================================
export const selectCorporateExpenseSyncStatus = createSelector(
  [selectCorporateCompanyDetails],
  (companyDetails) => companyDetails?.expenseSyncStatus || null
);

export const selectCorporateIsSyncedWithExpense = createSelector(
  [selectCorporateCompanyDetails],
  (companyDetails) => companyDetails?.isSyncedWithExpense || false
);

export const selectCorporateLastSyncAttempt = createSelector(
  [selectCorporateCompanyDetails],
  (companyDetails) => companyDetails?.lastSyncAttempt || null
);

export const selectCorporateSyncError = createSelector(
  [selectCorporateCompanyDetails],
  (companyDetails) => companyDetails?.syncError || null
);

// ============================================
// Access Token Selectors
// ============================================
export const selectCorporateAccessTokenData = createSelector(
  [selectCorporateLoginDetails],
  (loginDetails) => loginDetails?.accessTokenData || null
);

export const selectCorporateAccessToken = createSelector(
  [selectCorporateAccessTokenData],
  (accessTokenData) => accessTokenData?.accessToken || null
);

export const selectCorporateRefreshToken = createSelector(
  [selectCorporateAccessTokenData],
  (accessTokenData) => accessTokenData?.refreshToken || null
);

export const selectCorporateTokenType = createSelector(
  [selectCorporateAccessTokenData],
  (accessTokenData) => accessTokenData?.type || "Bearer"
);

export const selectCorporateTokenExpiresAt = createSelector(
  [selectCorporateAccessTokenData],
  (accessTokenData) => accessTokenData?.expiresAt || null
);

export const selectCorporateSessionId = createSelector(
  [selectCorporateAccessTokenData],
  (accessTokenData) => accessTokenData?.sessionId || null
);

// ============================================
// Configuration Selectors
// ============================================
export const selectCorporateConfiguration = createSelector(
  [selectCorporateLoginDetails],
  (loginDetails) => loginDetails?.configuration || null
);

export const selectCorporateWalletAllowed = createSelector(
  [selectCorporateConfiguration],
  (configuration) => configuration?.walletAllowed || false
);

// ============================================
// Travel Policy Selectors
// ============================================
export const selectCorporateTravelPolicies = createSelector(
  [selectCorporateLoginDetails],
  (loginDetails) => loginDetails?.travelPolicy || []
);

export const selectCorporateActiveTravelPolicy = createSelector(
  [selectCorporateTravelPolicies],
  (travelPolicies) => {
    if (!travelPolicies || travelPolicies.length === 0) return null;
    // Return the first active policy or the global policy
    return (
      travelPolicies.find(
        (policy) => policy.isGlobal && policy.status === "active"
      ) ||
      travelPolicies.find((policy) => policy.status === "active") ||
      travelPolicies[0]
    );
  }
);

export const selectCorporateTravelPolicyId = createSelector(
  [selectCorporateActiveTravelPolicy],
  (policy) => policy?._id || null
);

export const selectCorporateTravelPolicyName = createSelector(
  [selectCorporateActiveTravelPolicy],
  (policy) => policy?.travelPolicyName || ""
);

export const selectCorporateIsGlobalPolicy = createSelector(
  [selectCorporateActiveTravelPolicy],
  (policy) => policy?.isGlobal || false
);

export const selectCorporatePolicyConfigData = createSelector(
  [selectCorporateActiveTravelPolicy],
  (policy) => policy?.policyConfigData || []
);

// ============================================
// Travel Policy by Category Selectors
// ============================================
export const selectCorporateFlightPolicy = createSelector(
  [selectCorporatePolicyConfigData],
  (policyConfigData) => {
    return (
      policyConfigData.find((config) => config.travelCategory === "2") || null
    );
  }
);

export const selectCorporateHotelPolicy = createSelector(
  [selectCorporatePolicyConfigData],
  (policyConfigData) => {
    return (
      policyConfigData.find((config) => config.travelCategory === "1") || null
    );
  }
);

export const selectCorporateCabPolicy = createSelector(
  [selectCorporatePolicyConfigData],
  (policyConfigData) => {
    return (
      policyConfigData.find((config) => config.travelCategory === "3") || null
    );
  }
);

export const selectCorporateTrainPolicy = createSelector(
  [selectCorporatePolicyConfigData],
  (policyConfigData) => {
    return (
      policyConfigData.find((config) => config.travelCategory === "4") || null
    );
  }
);

export const selectCorporateBusPolicy = createSelector(
  [selectCorporatePolicyConfigData],
  (policyConfigData) => {
    return (
      policyConfigData.find((config) => config.travelCategory === "5") || null
    );
  }
);

// ============================================
// Flight Policy Details
// ============================================
export const selectCorporateFlightBudget = createSelector(
  [selectCorporateFlightPolicy],
  (flightPolicy) => flightPolicy?.budget || []
);

export const selectCorporateDomesticFlightBudget = createSelector(
  [selectCorporateFlightBudget],
  (budgets) => {
    const domesticBudget = budgets.find((b) => b.regionalCategoryId === "1");
    return domesticBudget?.amount || 0;
  }
);

export const selectCorporateInternationalFlightBudget = createSelector(
  [selectCorporateFlightBudget],
  (budgets) => {
    const internationalBudget = budgets.find(
      (b) => b.regionalCategoryId === "2"
    );
    return internationalBudget?.amount || 0;
  }
);

export const selectCorporateAllowedCabinClasses = createSelector(
  [selectCorporateFlightPolicy],
  (flightPolicy) => flightPolicy?.cabinClass || []
);

export const selectCorporateFlightSSRTypes = createSelector(
  [selectCorporateFlightPolicy],
  (flightPolicy) => flightPolicy?.ssrTypes || []
);

export const selectCorporateFlightDateChangeAllowed = createSelector(
  [selectCorporateFlightPolicy],
  (flightPolicy) => flightPolicy?.dateChangeAllowed || false
);

export const selectCorporateFlightBookingWindow = createSelector(
  [selectCorporateFlightPolicy],
  (flightPolicy) => flightPolicy?.bookingWindow || null
);

// ============================================
// Hotel Policy Details
// ============================================
export const selectCorporateHotelBudget = createSelector(
  [selectCorporateHotelPolicy],
  (hotelPolicy) => hotelPolicy?.budget || []
);

export const selectCorporateDomesticHotelBudget = createSelector(
  [selectCorporateHotelBudget],
  (budgets) => {
    const domesticBudget = budgets.find((b) => b.regionalCategoryId === "1");
    return domesticBudget?.amount || 0;
  }
);

export const selectCorporateInternationalHotelBudget = createSelector(
  [selectCorporateHotelBudget],
  (budgets) => {
    const internationalBudget = budgets.find(
      (b) => b.regionalCategoryId === "2"
    );
    return internationalBudget?.amount || 0;
  }
);

export const selectCorporateAllowedHotelCategories = createSelector(
  [selectCorporateHotelPolicy],
  (hotelPolicy) => hotelPolicy?.hotelCategory || []
);

export const selectCorporateHotelRefundable = createSelector(
  [selectCorporateHotelPolicy],
  (hotelPolicy) => hotelPolicy?.refundable || null
);

export const selectCorporateHotelDateChangeAllowed = createSelector(
  [selectCorporateHotelPolicy],
  (hotelPolicy) => hotelPolicy?.dateChangeAllowed || false
);

export const selectCorporateHotelBookingWindow = createSelector(
  [selectCorporateHotelPolicy],
  (hotelPolicy) => hotelPolicy?.bookingWindow || null
);

// ============================================
// Cab Policy Details
// ============================================
export const selectCorporateCabBudget = createSelector(
  [selectCorporateCabPolicy],
  (cabPolicy) => cabPolicy?.budget || 0
);

// ============================================
// Approval Configuration Selectors
// ============================================
export const selectCorporateFlightApprovalConfig = createSelector(
  [selectCorporateFlightPolicy],
  (flightPolicy) => flightPolicy?.approvalConfiguration || []
);

export const selectCorporateHotelApprovalConfig = createSelector(
  [selectCorporateHotelPolicy],
  (hotelPolicy) => hotelPolicy?.approvalConfiguration || []
);

// ============================================
// Roles, Modules & Permissions Selectors
// ============================================
export const selectCorporateRolesModulesAndPermissions = createSelector(
  [selectCorporateLoginDetails],
  (loginDetails) => loginDetails?.rolesModulesAndPermissions || []
);

export const selectCorporateModules = createSelector(
  [selectCorporateRolesModulesAndPermissions],
  (rolesModules) => rolesModules || []
);

export const selectCorporateModuleNames = createSelector(
  [selectCorporateModules],
  (modules) => modules.map((module) => module.moduleName)
);

export const selectCorporateAllPermissions = createSelector(
  [selectCorporateModules],
  (modules) => {
    const allPermissions = [];
    modules.forEach((module) => {
      if (module.permissions && Array.isArray(module.permissions)) {
        module.permissions.forEach((permission) => {
          allPermissions.push({
            ...permission,
            moduleName: module.moduleName,
            moduleId: module.moduleId,
          });
        });
      }
    });
    return allPermissions;
  }
);

export const selectCorporatePermissionNames = createSelector(
  [selectCorporateAllPermissions],
  (permissions) => permissions.map((permission) => permission.permissionName)
);

// Check if user has specific module access
export const selectCorporateHasModule = (moduleName) =>
  createSelector([selectCorporateModuleNames], (moduleNames) => {
    return moduleNames.includes(moduleName);
  });

// Check if user has specific permission
export const selectCorporateHasPermission = (permissionName) =>
  createSelector([selectCorporatePermissionNames], (permissionNames) => {
    return permissionNames.includes(permissionName);
  });

// Get module by name
export const selectCorporateModuleByName = (moduleName) =>
  createSelector([selectCorporateModules], (modules) => {
    return modules.find((module) => module.moduleName === moduleName) || null;
  });

// Check if user has "All Permissions"
export const selectCorporateHasAllPermissions = createSelector(
  [selectCorporatePermissionNames],
  (permissionNames) => {
    return permissionNames.includes("All Permissions");
  }
);

// ============================================
// Authentication Status Selectors
// ============================================
export const selectCorporateIsAuthenticated = createSelector(
  [selectCorporateIsLoggedIn, selectCorporateUserId],
  (isLoggedIn, userId) => {
    return isLoggedIn === true && !!userId;
  }
);

export const selectCorporateAuthStatus = createSelector(
  [
    selectCorporateIsLoggedIn,
    selectCorporateHasCheckedAuth,
    selectCorporateUserId,
  ],
  (isLoggedIn, hasCheckedAuth, userId) => ({
    isLoggedIn: isLoggedIn === true,
    hasCheckedAuth,
    hasUserId: !!userId,
    isReady: hasCheckedAuth && isLoggedIn !== null,
  })
);

// ============================================
// Complete User Data Selector
// ============================================
export const selectCorporateCompleteUserData = createSelector(
  [
    selectCorporateUserDetails,
    selectCorporateCompanyDetails,
    selectCorporateActiveTravelPolicy,
    selectCorporateConfiguration,
    selectCorporateRolesModulesAndPermissions,
  ],
  (userDetails, companyDetails, travelPolicy, configuration, rolesModules) => ({
    userDetails,
    companyDetails,
    travelPolicy,
    configuration,
    rolesModules,
    hasUserDetails: !!userDetails,
    hasCompanyDetails: !!companyDetails,
    hasTravelPolicy: !!travelPolicy,
    hasConfiguration: !!configuration,
    hasRolesModules: rolesModules && rolesModules.length > 0,
  })
);

// ============================================
// Profile Completion Selectors
// ============================================
export const selectCorporateProfileCompletionPercentage = createSelector(
  [selectCorporateUserDetails],
  (userDetails) => {
    if (!userDetails) return 0;

    const fields = [
      userDetails.firstName,
      userDetails.lastName,
      userDetails.workEmail,
      userDetails.mobile,
      userDetails.employeeId,
      userDetails.departmentId,
      userDetails.designation,
      userDetails.dateOfBirth,
      userDetails.address,
      userDetails.pan,
    ];

    const filledFields = fields.filter(
      (field) => field && String(field).trim()
    ).length;
    return Math.round((filledFields / fields.length) * 100);
  }
);

export const selectCorporateIsProfileComplete = createSelector(
  [selectCorporateUserDetails],
  (userDetails) => {
    if (!userDetails) return false;
    return !!(
      userDetails.firstName &&
      userDetails.lastName &&
      userDetails.workEmail &&
      userDetails.mobile
    );
  }
);

// ============================================
// Helper Selectors
// ============================================
export const selectCorporateHasTravelPolicy = createSelector(
  [selectCorporateActiveTravelPolicy],
  (policy) => !!policy
);

export const selectCorporateCanBookFlights = createSelector(
  [selectCorporateFlightPolicy, selectCorporateHasModule],
  (flightPolicy, hasModule) => {
    return !!flightPolicy && hasModule("Booking");
  }
);

export const selectCorporateCanBookHotels = createSelector(
  [selectCorporateHotelPolicy, selectCorporateHasModule],
  (hotelPolicy, hasModule) => {
    return !!hotelPolicy && hasModule("Booking");
  }
);

export const selectCorporateCanBookCabs = createSelector(
  [selectCorporateCabPolicy, selectCorporateHasModule],
  (cabPolicy, hasModule) => {
    return !!cabPolicy && hasModule("Booking");
  }
);
