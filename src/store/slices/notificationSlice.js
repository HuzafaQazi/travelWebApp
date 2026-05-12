import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "@/utils/axios/axios";
import config from "@/config";

const initialState = {
  count: 0, // notification count
  notifications: {
    approvals: [], // For requestType 4
    travelRequests: [], // For requestType 5
    tripReminders: [], // For trip reminders
  },
  needsRefresh: {
    approvals: false,
    travelRequests: false,
    tripReminders: false,
  },
  hasMoreApprovals: false,
  hasMoreTravelRequests: false,
  approvalsPage: 1,
  travelRequestsPage: 1,
  status: "idle",
  error: null,
};

// Async thunk to fetch notifications
export const fetchNotifications = createAsyncThunk(
  "notifications/fetchNotifications",
  async ({  requestType, pageNo = 1, pageSize = 10 }) => {
    const url = `${config.CORPORATE.GET_ALL_APPROVALS_LIST}?requestType=${requestType}&pageNo=${pageNo}&pageSize=${pageSize}`;
    const response = await axios.get(url);
    return {
      requestType,
      data: response.data.data,
      pageNo,
    };
  }
);

// Async thunk to fetch trip reminders
export const fetchTripReminders = createAsyncThunk(
  "notifications/fetchTripReminders",
  async ({ userId, pageNo = 0, pageSize = 10, sortBy = "id" }) => {
    const url = `${config.CORPORATE.FLIGHT_HOTEL_BOOKINGS}`;
    // Get the current date in local timezone
    const now = new Date();

    // Format the date as yyyy-mm-dd
    const formatDate = (date) => {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0"); // Months are zero-based
      const day = String(date.getDate()).padStart(2, "0");
      return `${year}-${month}-${day}`;
    };

    // Calculate `fromDate` (5 days prior to the current date)
    const fromDate = new Date(now);
    fromDate.setDate(now.getDate() + 5);

    const payload = {
      userId,
      pageNo,
      pageSize,
      travelCategories: ["1", "2"],
      bookingStatus: ["CONFIRMED"],
      toDate: formatDate(fromDate), // 5 days prior
      fromDate: formatDate(now), // Current date
      sortBy,
    };
    const response = await axios.post(url, payload);
    return {
      data: response.data,
      pageNo,
    };
  }
);

// Async thunk to mark all as read
export const markAllAsRead = createAsyncThunk(
  "notifications/markAllAsRead",
  async ({  bookingId = "All" }) => {
    const url = `${config.CORPORATE.NOTIFICATION_MARKREAD}?bookingIds=${bookingId}`;
    const response = await axios.post(url);
    return response.data;
  }
);

export const markAsRead = createAsyncThunk(
  "notifications/markAsRead",
  async ({  bookingId }) => {
    const url = `${config.CORPORATE.NOTIFICATION_MARKREAD}?bookingIds=${bookingId}`;
    const response = await axios.post(url);
    return { bookingId };
  }
);

const notificationSlice = createSlice({
  name: "notifications",
  initialState,
  reducers: {
    setNotifications: (state, action) => {
      state.count = action.payload;
    },
    resetNotifications: (state) => {
      state.notifications.approvals = [];
      state.notifications.travelRequests = [];
      state.hasMoreApprovals = false;
      state.hasMoreTravelRequests = false;
      state.approvalsPage = 1;
      state.travelRequestsPage = 1;
      state.count = 0;
    },
    setNeedsRefresh: (state, action) => {
      const { approvals, travelRequests, tripReminders } = action.payload;
      if (approvals !== undefined) state.needsRefresh.approvals = approvals;
      if (travelRequests !== undefined)
        state.needsRefresh.travelRequests = travelRequests;
      if (tripReminders !== undefined)
        state.needsRefresh.tripReminders = tripReminders;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchNotifications.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchNotifications.fulfilled, (state, action) => {
        const { requestType, data, pageNo } = action.payload;
        const notifications = data?.data?.response || [];
        const totalItems = data?.data?.count || 0;
        const hasMore = notifications.length === 10 && pageNo * 10 < totalItems;

        if (requestType === "4") {
          if (pageNo === 1) {
            // First page, reset data
            state.notifications.approvals = notifications;
          } else {
            // Append new data, avoiding duplicates
            const existingIds = new Set(
              state.notifications.approvals.map((item) => item.bookingId)
            );
            const newData = notifications.filter(
              (item) => !existingIds.has(item.bookingId)
            );
            state.notifications.approvals = [
              ...state.notifications.approvals,
              ...newData,
            ];
          }
          // state.notifications.approvals = [
          //   ...state.notifications.approvals,
          //   ...notifications,
          // ];
          state.hasMoreApprovals = hasMore;
          state.approvalsPage = pageNo;
          state.needsRefresh.approvals = false;
        } else if (requestType === "2") {
          if (pageNo === 1) {
            // First page, reset data
            state.notifications.travelRequests = notifications;
          } else {
            // Append new data, avoiding duplicates
            const existingIds = new Set(
              state.notifications.travelRequests.map((item) => item.bookingId)
            );
            const newData = notifications.filter(
              (item) => !existingIds.has(item.bookingId)
            );
            state.notifications.travelRequests = [
              ...state.notifications.travelRequests,
              ...newData,
            ];
          }
          // state.notifications.travelRequests = [
          //   ...state.notifications.travelRequests,
          //   ...notifications,
          // ];
          state.hasMoreTravelRequests = hasMore;
          state.travelRequestsPage = pageNo;
          state.needsRefresh.travelRequests = false;
        }

        state.status = "succeeded";
      })
      .addCase(fetchNotifications.rejected, (state, action) => {
        const requestType = action.meta.arg.requestType;
        if (requestType === "4") {
          state.notifications.approvals = [];
          state.hasMoreApprovals = false;
        } else if (requestType === "2") {
          state.notifications.travelRequests = [];
          state.hasMoreTravelRequests = false;
        }
        state.status = "failed";
        state.error = action.error.message;
      })
      .addCase(fetchTripReminders.fulfilled, (state, action) => {
        const { data } = action.payload;
        state.notifications.tripReminders = data?.data || [];
      })
      .addCase(markAllAsRead.fulfilled, (state) => {
        // Optionally, reset the notifications state
        state.notifications.approvals = [];
        state.notifications.travelRequests = [];
        state.hasMoreApprovals = false;
        state.hasMoreTravelRequests = false;
        state.approvalsPage = 1;
        state.travelRequestsPage = 1;
      })
      .addCase(markAsRead.fulfilled, (state, action) => {
        const { bookingId } = action.payload;

        // Update read status in approvals
        state.notifications.approvals = state.notifications.approvals.map(
          (notification) =>
            notification.bookingId === bookingId
              ? { ...notification, isRead: true }
              : notification
        );

        // Update read status in travel requests
        state.notifications.travelRequests =
          state.notifications.travelRequests.map((notification) =>
            notification.bookingId === bookingId
              ? { ...notification, isRead: true }
              : notification
          );

        // Update read status in trip reminders
        state.notifications.tripReminders =
          state.notifications.tripReminders.map((notification) =>
            notification.bookingId === bookingId
              ? { ...notification, isRead: true }
              : notification
          );

        // Decrement the total notification count if it's greater than 0
        if (state.count > 0) {
          state.count -= 1;
        }

        state.status = "succeeded";
      })
      .addCase(markAsRead.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message;
      });
  },
});

export const { resetNotifications, setNotifications, setNeedsRefresh } =
  notificationSlice.actions;

export default notificationSlice.reducer;
