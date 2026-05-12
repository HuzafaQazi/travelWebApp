import axios, { getTabId, setActiveUserType } from "@/utils/axios/axios";
import config from "@/config";
import { store } from "@/store/store";
import { setNotifications } from "@/store/slices/notificationSlice";
import { setApprovals } from "@/store/slices/approvalSlice";
import { loginUser } from "@/store/slices/userSlice";

export async function initializeStore() {
  try {
    console.log("🏢 Starting corporate store initialization...");

    // Fetch user profile (includes userId)
    const response = await axios.get(`${config.CORPORATE.USER_DETAILS}`);

    if (response?.data?.status === true && response?.data?.data) {
      const userData = response.data.data;
      const userId = userData.userDetails._id;

      console.log(`✅ Corporate profile loaded for user: ${userId}`);

      // ✅ Store user data in Redux
      const updatedData = {
        userId: userData.userDetails._id,
        companyId: userData.companyDetails._id,
        loggedInDetails: userData,
        tabId: getTabId(),
        userType: "corporate",
      };
      setActiveUserType("corporate");
      store.dispatch(loginUser(updatedData));

      // Fetch notifications and approvals
      try {
        const approvalsResponse = await axios.get(
          `${config.CORPORATE.GET_ALL_APPROVALS_LIST}?requestType=1&pageNo=0&pageSize=1`
        );

        const notificationCount =
          approvalsResponse?.data?.data?.notificationCount || 0;
        store.dispatch(setNotifications(notificationCount));

        const approvalCount = approvalsResponse?.data?.data?.approvalCount || 0;
        store.dispatch(setApprovals({ count: approvalCount, data: [] }));

        console.log("✅ Corporate store initialization completed");
      } catch (error) {
        console.error("Error fetching notifications and approvals:", error);
        store.dispatch(setNotifications(0));
        store.dispatch(setApprovals({ count: 0, data: [] }));
      }
    }
  } catch (error) {
    console.error("❌ Error initializing corporate store:", error);
    store.dispatch(setNotifications(0));
    store.dispatch(setApprovals({ count: 0, data: [] }));
    throw error;
  }
}
