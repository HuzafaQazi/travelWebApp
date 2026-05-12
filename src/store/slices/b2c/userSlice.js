import { createSlice } from "@reduxjs/toolkit";

const b2cUserSlice = createSlice({
  name: "b2cUser",
  initialState: {
    profile: null,
    company: null,
    wallet: null,
    preferences: null,
    bookings: {
      data: [],
      totalCount: 0,
      currentPage: 1,
      hasMore: false,
    },
    recentSearches: [],
    savedTravelers: [],
    isLoading: false,
    error: null,
    hasCheckedAuth: false,
  },
  reducers: {
    // Profile Actions
    setB2CProfile: (state, action) => {
      state.profile = action.payload;
      state.error = null;
    },

    updateB2CProfile: (state, action) => {
      if (state.profile) {
        state.profile = {
          ...state.profile,
          ...action.payload,
        };
      }
    },

    // Company Actions
    setB2CCompany: (state, action) => {
      state.company = action.payload;
      state.error = null;
    },

    updateB2CCompany: (state, action) => {
      if (state.company) {
        state.company = {
          ...state.company,
          ...action.payload,
        };
      } else {
        state.company = action.payload;
      }
    },

    clearB2CCompany: (state) => {
      state.company = null;
    },

    // Wallet Actions
    setB2CWallet: (state, action) => {
      state.wallet = action.payload;
    },

    updateWalletBalance: (state, action) => {
      if (state.wallet) {
        state.wallet.balance = action.payload.balance;
        state.wallet.lastTransaction = action.payload.lastTransaction;
      }
    },

    // Preferences Actions
    setB2CPreferences: (state, action) => {
      state.preferences = action.payload;
    },

    updateB2CPreferences: (state, action) => {
      state.preferences = {
        ...state.preferences,
        ...action.payload,
      };
    },

    // Bookings Actions
    setB2CBookings: (state, action) => {
      state.bookings.data = action.payload.data || [];
      state.bookings.totalCount = action.payload.totalCount || 0;
      state.bookings.currentPage = action.payload.currentPage || 1;
      state.bookings.hasMore = action.payload.hasMore || false;
    },

    appendB2CBookings: (state, action) => {
      // For infinite scroll
      state.bookings.data = [
        ...state.bookings.data,
        ...(action.payload.data || []),
      ];
      state.bookings.totalCount =
        action.payload.totalCount || state.bookings.totalCount;
      state.bookings.currentPage =
        action.payload.currentPage || state.bookings.currentPage;
      state.bookings.hasMore = action.payload.hasMore || false;
    },

    updateSingleBooking: (state, action) => {
      const index = state.bookings.data.findIndex(
        (booking) => booking.bookingId === action.payload.bookingId
      );
      if (index !== -1) {
        state.bookings.data[index] = {
          ...state.bookings.data[index],
          ...action.payload,
        };
      }
    },

    // Recent Searches
    addRecentSearch: (state, action) => {
      // Add to beginning and limit to 10
      state.recentSearches = [
        action.payload,
        ...state.recentSearches.filter(
          (search) => JSON.stringify(search) !== JSON.stringify(action.payload)
        ),
      ].slice(0, 10);
    },

    clearRecentSearches: (state) => {
      state.recentSearches = [];
    },

    // Saved Travelers
    setSavedTravelers: (state, action) => {
      state.savedTravelers = action.payload;
    },

    addSavedTraveler: (state, action) => {
      state.savedTravelers.push(action.payload);
    },

    updateSavedTraveler: (state, action) => {
      const index = state.savedTravelers.findIndex(
        (traveler) => traveler.id === action.payload.id
      );
      if (index !== -1) {
        state.savedTravelers[index] = action.payload;
      }
    },

    removeSavedTraveler: (state, action) => {
      state.savedTravelers = state.savedTravelers.filter(
        (traveler) => traveler.id !== action.payload
      );
    },

    // Loading and Error States
    setB2CLoading: (state, action) => {
      state.isLoading = action.payload;
    },

    setB2CError: (state, action) => {
      state.error = action.payload;
      state.isLoading = false;
    },

    setB2CHasCheckedAuth: (state, action) => {
      state.hasCheckedAuth = action.payload;
    },

    // Clear all B2C data
    clearB2CData: (state) => {
      state.profile = null;
      state.company = null;
      state.wallet = null;
      state.preferences = null;
      state.bookings = {
        data: [],
        totalCount: 0,
        currentPage: 1,
        hasMore: false,
      };
      state.recentSearches = [];
      state.savedTravelers = [];
      state.isLoading = false;
      state.error = null;
      state.hasCheckedAuth = false;
    },
  },
});

export const {
  setB2CProfile,
  updateB2CProfile,
  setB2CCompany,
  updateB2CCompany,
  clearB2CCompany,
  setB2CWallet,
  updateWalletBalance,
  setB2CPreferences,
  updateB2CPreferences,
  setB2CBookings,
  appendB2CBookings,
  updateSingleBooking,
  addRecentSearch,
  clearRecentSearches,
  setSavedTravelers,
  addSavedTraveler,
  updateSavedTraveler,
  removeSavedTraveler,
  setB2CLoading,
  setB2CError,
  setB2CHasCheckedAuth,
  clearB2CData,
} = b2cUserSlice.actions;

export default b2cUserSlice.reducer;
