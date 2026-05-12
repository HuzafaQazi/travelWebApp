// slices/approvalSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "@/utils/axios/axios";
import config from "@/config";

const initialState = {
  count: 0,
  data: [],
  loading: false,
  approvalsData: {},
  counts: {},
  needsRefresh: false, // global refresh page when approval comes to admin
  approvalStatusNeedsRefresh: {
    1: false, // Hotels
    2: false, // Flights
  }, // particular approval status page refresh
  status: "idle", // 'idle' | 'loading' | 'succeeded' | 'failed'
  error: null,
};

// Async thunk to fetch approvals
export const fetchApprovals = createAsyncThunk(
  "approvals/fetchApprovals",
  async () => {
    const response = await axios.get(
      `${config.CORPORATE.GET_ALL_APPROVALS_LIST}`
    );
    return response.data.data;
  }
);

export const fetchApprovalsData = createAsyncThunk(
  "approvals/fetchApprovalsData",
  async ({
    // userId,
    requestType,
    approvalStatus,
    pageNo = 1,
    pageSize = 3,
    sortBy = "desc",
  }) => {
    let url = `${config.CORPORATE.GET_ALL_APPROVALS_LIST}?requestType=${requestType}&pageNo=${pageNo}&pageSize=${pageSize}&sortBy=${sortBy}`;
    if (approvalStatus) {
      url += `&approvalStatus=${approvalStatus}`;
    }
    const response = await axios.get(url);
    return {
      requestType,
      data: response.data.data,
    };
  }
);

export const approvalSlice = createSlice({
  name: "approvals",
  initialState,
  reducers: {
    incrementApprovalCount: (state) => {
      state.count += 1;
    },
    addApproval: (state, action) => {
      state.data.push(action.payload);
      state.count += 1;
    },
    setApprovals: (state, action) => {
      state.count = action.payload.count;
      state.data = action.payload.data;
    },
    setNeedsRefresh: (state, action) => {
      state.needsRefresh = action.payload;
    },
    setApprovalStatusNeedsRefresh: (state, action) => {
      const { travelCategory, status } = action.payload;
      state.approvalStatusNeedsRefresh[travelCategory] = status;
    },
    resetApprovalCount: (state) => {
      state.count = 0;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchApprovals.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchApprovals.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.approvals = action.payload;
        state.count = action.payload.length;
      })
      .addCase(fetchApprovals.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message;
      })
      .addCase(fetchApprovalsData.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchApprovalsData.fulfilled, (state, action) => {
        const { requestType, data } = action.payload;
        state.approvalsData[requestType] = data;
        // Update counts for each request type
        state.loading = false;
        state.counts[requestType] = data?.data?.count || 0;
      })
      .addCase(fetchApprovalsData.rejected, (state, action) => {
        const requestType = action.meta.arg.requestType;
        state.approvalsData[requestType] = [];
        state.loading = false;
        state.error = action.error.message;
      });
  },
});

export const {
  incrementApprovalCount,
  addApproval,
  resetApprovalCount,
  setApprovals,
  setNeedsRefresh,
  setApprovalStatusNeedsRefresh,
} = approvalSlice.actions;

export default approvalSlice.reducer;
