import { createSlice, createAsyncThunk, createAction } from "@reduxjs/toolkit";
import axios from "@/utils/axios/axios";
import config from "@/config";
import { createAbortController } from "@/utils/common";

// (A) AsyncThunk: fetchEmployeesByIds => re-fetch specific employees by ID
export const fetchEmployeesByIds = createAsyncThunk(
  "travellers/fetchEmployeesByIds",
  async (employeeIds, { getState, rejectWithValue }) => {
    try {
      const userState = getState().user;
      const { companyId } = userState.userInfo || {};
      if (!companyId) {
        return [];
      }
      // multi-IDs filter
      const payload = {
        // companyId,
        filter: [
          {
            by: "DEPARTMENT",
            type: [],
            values: [],
          },
        ],
        id: employeeIds,
        searchKey: "",
        pageSize: 20,
        pageNo: 1,
      };
      const response = await axios.post(
        config.CORPORATE.EMPLOYEE_LIST,
        payload
      );
      if (response?.data?.status === "SUCCESS") {
        return response?.data?.data?.users?.map((trav) => ({
          value: trav._id,
          label: `${trav.firstName || ""} ${trav.lastName || ""}`,
          data: trav,
        }));
      }
      return [];
    } catch (error) {
      console.error("Error fetching employees by IDs:", error);
      return rejectWithValue(error.message);
    }
  }
);

// (B) Another thunk to refresh the entire fixedInitialOptions
export const refetchFixedInitialOptions = createAsyncThunk(
  "travellers/refetchFixedInitialOptions",
  async (_, { getState, rejectWithValue }) => {
    try {
      const userState = getState().user;
      const { companyId } = userState.userInfo || {};
      if (!companyId) {
        return [];
      }
      const payload = {
        // companyId,
        filter: [],
        searchKey: "",
        pageSize: 20,
        pageNo: 1,
      };
      const response = await axios.post(
        config.CORPORATE.EMPLOYEE_LIST,
        payload
      );
      if (response?.data?.status === "SUCCESS") {
        return response?.data?.data?.users?.map((trav) => ({
          value: trav._id,
          label: `${trav.firstName || ""} ${trav.lastName || ""}`,
          data: trav,
        }));
      }
      return [];
    } catch (error) {
      console.error("Error refetching fixedInitialOptions:", error);
      return rejectWithValue(error.message);
    }
  }
);

// (C) A simple action => setPolicyChanged
export const setPolicyChanged = createAction("travellers/setPolicyChanged");

// AsyncThunk to fetch employees
export const fetchEmployees = createAsyncThunk(
  "travellers/fetchEmployees",
  async (
    {
      searchKey = "",
      pageSize = 20,
      pageNo = 1,
      shouldCache = true,
      fetchFixedOptions = false,
    },
    { getState, rejectWithValue }
  ) => {
    try {
      const state = getState().travellers;
      const userState = getState().user;
      const { companyId } = userState.userInfo;

      if (fetchFixedOptions) {
        return state.fixedInitialOptions;
      }

      if (state.initialOptions.length > 0 && !searchKey && shouldCache) {
        return state.initialOptions;
      }
      const signal = createAbortController();
      const response = await axios.post(
        `${config.CORPORATE.EMPLOYEE_LIST}`,
        {
          // companyId,
          filter: [],
          searchKey,
          pageSize,
          pageNo,
        },
        { signal: signal }
      );

      if (response?.data?.status === "SUCCESS") {
        return response?.data?.data?.users?.map((traveler) => ({
          value: traveler._id,
          label: `${traveler.firstName || ""} ${traveler.lastName || ""}`,
          data: traveler,
        }));
      }
      return [];
    } catch (error) {
      console.error("Error fetching employees:", error);
      return rejectWithValue(error.message);
    }
  }
);

// AsyncThunk to initialize logged-in user as a traveler
export const initializeLoggedInUser = createAsyncThunk(
  "travellers/initializeLoggedInUser",
  async (
    { shouldCache = true } = {},
    { getState, dispatch, rejectWithValue }
  ) => {
    try {
      const state = getState().travellers;
      const userState = getState().user;
      const loggedInUser = userState.userInfo;

      if (shouldCache && state.loggedInTraveler) {
        return state.loggedInTraveler;
      }

      if (!loggedInUser || !loggedInUser.loggedInDetails) {
        return null;
      }

      const { companyId } = loggedInUser || {};
      const fullName = `${loggedInUser?.loggedInDetails?.userDetails?.firstName.toLowerCase()} ${loggedInUser?.loggedInDetails?.userDetails?.lastName.toLowerCase()}`;
      const employeeId = loggedInUser?.loggedInDetails?.userDetails?.employeeId;
      const searchValue = fullName ?? employeeId;

      if (!companyId || !searchValue.trim()) return null;

      const response = await axios.post(`${config.CORPORATE.EMPLOYEE_LIST}`, {
        // companyId,
        filter: [],
        searchKey: searchValue,
      });

      if (response?.data?.status === "SUCCESS") {
        const employeeOptions = response?.data?.data?.users?.map(
          (traveler) => ({
            value: traveler._id,
            label: `${traveler.firstName || ""} ${traveler.lastName || ""}`,
            data: traveler,
          })
        );

        const match = employeeOptions.find(
          (employee) => employee.value === loggedInUser.userId
        );

        return match || null;
      }
      return [];
    } catch (error) {
      console.error("Error initializing logged-in user:", error);
      return rejectWithValue(error.message);
    }
  }
);

export const resetTravelersState = createAction("travellers/resetState");
export const resetPolicyChanged = createAction("travellers/resetPolicyChanged");

const travellersSlice = createSlice({
  name: "travellers",
  initialState: {
    loggedInTraveler: null,
    travelersByCategory: {
      1: [], // Hotels
      2: [], // Flights
      3: [], // Trains
      4: [], // Bus
      5: [], // Car Rental
    },
    selectedTravelers: [],
    initialOptions: [],
    fixedInitialOptions: [],
    adultsCount: 1, // For flights
    adultsCountHotel: [1], // For hotels
    adultsCountTrain: 1, // For trains
    adultsCountBus: 1, // For buses
    adultsCountCar: 1, // For car rentals
    defaultSelectionDone: false,
    hasFetchedOnHome: false,
    status: "idle", // For tracking loading state
    error: null, // For handling errors
    policyChanged: false,
    showPolicyModal: false,
  },
  reducers: {
    setSelectedTravelers(state, action) {
      const { travelers, category, resetUserForAll = false } = action.payload;
      state.selectedTravelers = travelers || [];

      if (resetUserForAll) {
        for (const catKey of Object.keys(state.travelersByCategory)) {
          state.travelersByCategory[catKey] = travelers;
        }
      }

      if (category) {
        if (!state.travelersByCategory[category]) {
          state.travelersByCategory[category] = [];
        }
        state.travelersByCategory[category] = travelers;
      }
    },
    setAdultsCount(state, action) {
      state.adultsCount = action.payload;
    },
    setAdultsCountHotel(state, action) {
      state.adultsCountHotel = action.payload;
    },
    setAdultsCountTrain(state, action) {
      state.adultsCountTrain = action.payload;
    },
    setAdultsCountBus(state, action) {
      state.adultsCountBus = action.payload;
    },
    setAdultsCountCar(state, action) {
      state.adultsCountCar = action.payload;
    },
    setDefaultSelectionDone(state, action) {
      state.defaultSelectionDone = action.payload;
    },
    setHasFetchedOnHome(state, action) {
      state.hasFetchedOnHome = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchEmployees.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchEmployees.fulfilled, (state, action) => {
        state.status = "succeeded";
        if (state.fixedInitialOptions.length === 0) {
          state.fixedInitialOptions = action.payload;
        }
        state.initialOptions = action.payload;
      })
      .addCase(fetchEmployees.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })
      .addCase(initializeLoggedInUser.fulfilled, (state, action) => {
        const foundUser = action.payload; // the traveler object or null
        if (foundUser) {
          state.loggedInTraveler = foundUser;
        }
        if (foundUser) {
          for (const catKey of Object.keys(state.travelersByCategory)) {
            if (state.travelersByCategory[catKey].length === 0) {
              state.travelersByCategory[catKey] = [foundUser];
            }
          }
        }

        if (
          state.selectedTravelers.length === 0 &&
          !state.defaultSelectionDone
        ) {
          state.selectedTravelers = [foundUser] || [];
        }
        state.defaultSelectionDone = true;
      })
      .addCase(setPolicyChanged, (state, action) => {
        state.policyChanged = true;
        state.showPolicyModal = true; // or always do a redirect
      })
      .addCase(resetPolicyChanged, (state, action) => {
        state.policyChanged = false;
        state.showPolicyModal = false;
      })

      // fetchEmployeesByIds => merges new data into selectedTravelers
      .addCase(fetchEmployeesByIds.fulfilled, (state, action) => {
        const updatedArray = action.payload; // new data
        if (!updatedArray?.length) return;

        // Update selectedTravelers
        state.selectedTravelers = state.selectedTravelers.map((oldT) => {
          const found = updatedArray.find((u) => u.value === oldT.value);
          return found || oldT;
        });

        // Update each travelersByCategory
        for (const catKey of Object.keys(state.travelersByCategory)) {
          const oldArr = state.travelersByCategory[catKey];
          const newArr = oldArr.map((oldT) => {
            const found = updatedArray.find((u) => u.value === oldT.value);
            return found || oldT;
          });
          state.travelersByCategory[catKey] = newArr;
        }
      })
      .addCase(refetchFixedInitialOptions.fulfilled, (state, action) => {
        // Replace or merge new data
        state.fixedInitialOptions = action.payload;
        // Optionally also update initialOptions
        state.initialOptions = action.payload;
      })
      .addCase(resetTravelersState, (state) => {
        state.loggedInTraveler = null;
        state.travelersByCategory = { 1: [], 2: [], 3: [], 4: [], 5: [] };
        state.selectedTravelers = [];
        state.initialOptions = [];
        state.fixedInitialOptions = [];
        state.adultsCount = 1;
        state.adultsCountHotel = [1];
        state.adultsCountTrain = 1;
        state.adultsCountBus = 1;
        state.adultsCountCar = 1;
        state.status = "idle";
        state.error = null;
        state.defaultSelectionDone = false;
        state.hasFetchedOnHome = false;
        state.policyChanged = false;
        state.showPolicyModal = false;
      });
  },
});

export const {
  setSelectedTravelers,
  setAdultsCount,
  setAdultsCountHotel,
  setAdultsCountTrain,
  setAdultsCountBus,
  setAdultsCountCar,
  setDefaultSelectionDone,
  setHasFetchedOnHome,
} = travellersSlice.actions;
export default travellersSlice.reducer;
