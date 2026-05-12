import { configureStore } from "@reduxjs/toolkit";
import { createWrapper } from "next-redux-wrapper";
import notificationReducer from "./slices/notificationSlice";
import approvalReducer from "./slices/approvalSlice";
import userReducer from "./slices/userSlice";
import travellersReducer from "./slices/travellersSlice";
import b2cUserReducer from "./slices/b2c/userSlice";

const makeStore = () =>
  configureStore({
    reducer: {
      notifications: notificationReducer,
      approvals: approvalReducer,
      user: userReducer,
      travellers: travellersReducer,
      b2cUser: b2cUserReducer,
      // Add other reducers here
    },
    devTools: process.env.NODE_ENV !== "production",
  });

export const store = makeStore();
export const wrapper = createWrapper(makeStore);
