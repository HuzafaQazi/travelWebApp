// store/slices/userSlice.js
import { createSlice } from "@reduxjs/toolkit";

const userSlice = createSlice({
  name: "user",
  initialState: {
    isLoggedIn: null,
    userInfo: null,
    hasCheckedAuth: false,
    tabId: null,
  },
  reducers: {
    loginUser: (state, action) => {
      state.isLoggedIn = true;
      state.userInfo = action.payload;
      // state.tabId = action.payload.tabId;
    },
    logoutUser: (state) => {
      state.isLoggedIn = false;
      state.userInfo = null;
      state.tabId = null;
    },
    setHasCheckedAuth: (state, action) => {
      state.hasCheckedAuth = action.payload;
    },
    // New reducer to check if the current tab matches the Redux state
    validateTabSession: (state, action) => {
      const currentTabId = action.payload.tabId;
      // If the tab IDs don't match, clear the state (user switched tabs or logged in from different tab)
      if (state.tabId && state.tabId !== currentTabId) {
        state.isLoggedIn = false;
        state.userInfo = null;
        state.hasCheckedAuth = false;
        state.tabId = null;
      }
    },
  },
});

export const { loginUser, logoutUser, setHasCheckedAuth } = userSlice.actions;
export default userSlice.reducer;
