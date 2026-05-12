// // Alternative: Enhanced multi-user session storage
// const storeMultipleUsers = (userData, userType) => {
//   const storageKey = `savedUsers_${userType}`;
//   let savedUsers = {};

//   try {
//     const existing = getPersistentData(storageKey);
//     if (existing) {
//       const numbersArray = existing.split(",").map(Number);
//       const compressedUint8Array = new Uint8Array(numbersArray);
//       const decodedData = pako.inflate(compressedUint8Array, { to: "string" });
//       savedUsers = JSON.parse(decodedData);
//     }
//   } catch (error) {
//     console.error("Error reading saved users:", error);
//     savedUsers = {};
//   }

//   // Store user data with their ID as key
//   const userId =
//     userType === "corporate"
//       ? userData.userDetails?._id
//       : userData._id || userData.userId;

//   if (userId) {
//     savedUsers[userId] = {
//       userData: userData,
//       timestamp: Date.now(),
//       expiresAt: Date.now() + 7 * 24 * 60 * 60 * 1000, // 7 days
//     };

//     // Clean up expired users
//     Object.keys(savedUsers).forEach((id) => {
//       if (Date.now() > savedUsers[id].expiresAt) {
//         delete savedUsers[id];
//       }
//     });

//     const compressedData = pako.deflate(JSON.stringify(savedUsers));
//     setPersistentData(storageKey, compressedData);

//     // Also update the "most recent" pointer for this user type
//     storeLastActiveUser(userData, userType);
//   }
// };

// const removeSpecificUser = (userId, userType) => {
//   const storageKey = `savedUsers_${userType}`;
//   let savedUsers = {};

//   try {
//     const existing = getPersistentData(storageKey);
//     if (existing) {
//       const numbersArray = existing.split(",").map(Number);
//       const compressedUint8Array = new Uint8Array(numbersArray);
//       const decodedData = pako.inflate(compressedUint8Array, { to: "string" });
//       savedUsers = JSON.parse(decodedData);
//     }

//     // Remove the specific user
//     delete savedUsers[userId];

//     if (Object.keys(savedUsers).length === 0) {
//       // No users left, remove the storage
//       removePersistentData(storageKey);
//       if (userType === "corporate") {
//         clearLastActiveCorporateUser();
//       } else {
//         clearLastActiveQugoUser();
//       }
//     } else {
//       // Update storage with remaining users
//       const compressedData = pako.deflate(JSON.stringify(savedUsers));
//       setPersistentData(storageKey, compressedData);

//       // Update the "most recent" pointer to the most recently used remaining user
//       const remainingUsers = Object.values(savedUsers);
//       const mostRecent = remainingUsers.reduce((latest, current) =>
//         current.timestamp > latest.timestamp ? current : latest
//       );
//       storeLastActiveUser(mostRecent.userData, userType);
//     }

//     updateMostRecentUserPointer();
//   } catch (error) {
//     console.error("Error removing specific user:", error);
//   }
// };

// // Usage in logout:
// // Instead of clearLastActiveCorporateUser(), use:
// // removeSpecificUser(currentUserId, "corporate");

// // Multi-Tab User Detection System
// // Add this to your axios.js file

// // BroadcastChannel for cross-tab communication
// let tabRegistry = null;
// let heartbeatInterval = null;

// // Initialize tab registry system
// const initTabRegistry = () => {
//   if (typeof window === "undefined") return;

//   try {
//     // Use BroadcastChannel if available
//     if (window.BroadcastChannel) {
//       tabRegistry = new BroadcastChannel("user_tabs");

//       // Listen for messages from other tabs
//       tabRegistry.onmessage = (event) => {
//         handleTabMessage(event.data);
//       };
//     }

//     // Start heartbeat to maintain tab registry
//     startTabHeartbeat();

//     // Register current tab
//     registerCurrentTab();

//     // Clean up on page unload
//     window.addEventListener("beforeunload", () => {
//       unregisterCurrentTab();
//     });

//     // Clean up on visibility change (tab becomes hidden)
//     document.addEventListener("visibilitychange", () => {
//       if (document.visibilityState === "visible") {
//         registerCurrentTab();
//       }
//     });
//   } catch (error) {
//     console.error("Error initializing tab registry:", error);
//   }
// };

// // Handle messages from other tabs
// const handleTabMessage = (data) => {
//   const { type, tabId, userInfo, timestamp } = data;

//   switch (type) {
//     case "TAB_REGISTER":
//     case "TAB_HEARTBEAT":
//       updateTabInRegistry(tabId, userInfo, timestamp);
//       break;
//     case "TAB_UNREGISTER":
//       removeTabFromRegistry(tabId);
//       break;
//     case "USER_LOGOUT":
//       // Another tab logged out, update registry
//       removeTabFromRegistry(tabId);
//       break;
//   }
// };

// // Broadcast message to other tabs
// const broadcastToTabs = (message) => {
//   if (tabRegistry) {
//     try {
//       tabRegistry.postMessage(message);
//     } catch (error) {
//       console.error("Error broadcasting to tabs:", error);
//     }
//   }
// };

// // Get current tab's user info
// const getCurrentTabUserInfo = () => {
//   const userType = getTabSpecificData("loggedInUserType");
//   const userID = getTabSpecificData("userID")?.replace(/"/g, "");

//   if (!userType || !userID) {
//     return null;
//   }

//   let userDetails = null;
//   if (userType === "corporate") {
//     const corporateUser = getCorporateLoggedInUserDetails();
//     userDetails = {
//       userId: corporateUser?.userId,
//       userType: "corporate",
//       companyId: corporateUser?.companyId,
//       firstName: corporateUser?.loggedInDetails?.userDetails?.firstName,
//       companyName: corporateUser?.loggedInDetails?.companyDetails?.companyName,
//     };
//   } else if (userType === "qugo") {
//     const qugoUser = getQugoLoggedInUserDetails();
//     userDetails = {
//       userId: qugoUser?.userId,
//       userType: "qugo",
//       firstName: qugoUser?.loggedInDetails?.firstName,
//     };
//   }

//   return userDetails;
// };

// // Register current tab in the registry
// const registerCurrentTab = () => {
//   const tabId = getTabId();
//   const userInfo = getCurrentTabUserInfo();
//   const timestamp = Date.now();

//   // Update local registry
//   updateTabInRegistry(tabId, userInfo, timestamp);

//   // Broadcast to other tabs
//   broadcastToTabs({
//     type: "TAB_REGISTER",
//     tabId,
//     userInfo,
//     timestamp,
//   });
// };

// // Unregister current tab
// const unregisterCurrentTab = () => {
//   const tabId = getTabId();

//   // Remove from local registry
//   removeTabFromRegistry(tabId);

//   // Broadcast to other tabs
//   broadcastToTabs({
//     type: "TAB_UNREGISTER",
//     tabId,
//   });

//   // Clean up heartbeat
//   if (heartbeatInterval) {
//     clearInterval(heartbeatInterval);
//     heartbeatInterval = null;
//   }
// };

// // Start heartbeat to keep tab alive in registry
// const startTabHeartbeat = () => {
//   // Send heartbeat every 30 seconds
//   heartbeatInterval = setInterval(() => {
//     const tabId = getTabId();
//     const userInfo = getCurrentTabUserInfo();
//     const timestamp = Date.now();

//     // Update local registry
//     updateTabInRegistry(tabId, userInfo, timestamp);

//     // Broadcast heartbeat
//     broadcastToTabs({
//       type: "TAB_HEARTBEAT",
//       tabId,
//       userInfo,
//       timestamp,
//     });

//     // Clean up stale tabs (older than 2 minutes)
//     cleanupStaleTabsFromRegistry();
//   }, 30000); // 30 seconds
// };

// // Update tab in localStorage registry
// const updateTabInRegistry = (tabId, userInfo, timestamp) => {
//   try {
//     const registryKey = "active_tabs_registry";
//     let registry = {};

//     const existingData = localStorage.getItem(registryKey);
//     if (existingData) {
//       registry = JSON.parse(existingData);
//     }

//     registry[tabId] = {
//       userInfo,
//       timestamp,
//       lastSeen: Date.now(),
//     };

//     localStorage.setItem(registryKey, JSON.stringify(registry));
//   } catch (error) {
//     console.error("Error updating tab registry:", error);
//   }
// };

// // Remove tab from registry
// const removeTabFromRegistry = (tabId) => {
//   try {
//     const registryKey = "active_tabs_registry";
//     const existingData = localStorage.getItem(registryKey);

//     if (existingData) {
//       const registry = JSON.parse(existingData);
//       delete registry[tabId];
//       localStorage.setItem(registryKey, JSON.stringify(registry));
//     }
//   } catch (error) {
//     console.error("Error removing tab from registry:", error);
//   }
// };

// // Clean up stale tabs from registry
// const cleanupStaleTabsFromRegistry = () => {
//   try {
//     const registryKey = "active_tabs_registry";
//     const existingData = localStorage.getItem(registryKey);

//     if (existingData) {
//       const registry = JSON.parse(existingData);
//       const now = Date.now();
//       const staleThreshold = 2 * 60 * 1000; // 2 minutes

//       Object.keys(registry).forEach((tabId) => {
//         if (now - registry[tabId].lastSeen > staleThreshold) {
//           delete registry[tabId];
//         }
//       });

//       localStorage.setItem(registryKey, JSON.stringify(registry));
//     }
//   } catch (error) {
//     console.error("Error cleaning up stale tabs:", error);
//   }
// };

// // Get all active tabs from registry
// const getActiveTabsFromRegistry = () => {
//   try {
//     const registryKey = "active_tabs_registry";
//     const existingData = localStorage.getItem(registryKey);

//     if (existingData) {
//       return JSON.parse(existingData);
//     }
//   } catch (error) {
//     console.error("Error reading tab registry:", error);
//   }

//   return {};
// };

// // Main function: Check for other active user tabs
// const checkForOtherActiveUserTabs = (currentUserType, currentUserId = null) => {
//   try {
//     const currentTabId = getTabId();
//     const registry = getActiveTabsFromRegistry();

//     // Get current user ID if not provided
//     if (!currentUserId) {
//       const currentUser = getCurrentTabUserInfo();
//       currentUserId = currentUser?.userId;
//     }

//     // Check all tabs except current one
//     for (const [tabId, tabData] of Object.entries(registry)) {
//       if (tabId === currentTabId) continue; // Skip current tab

//       const { userInfo } = tabData;

//       if (userInfo && userInfo.userId && userInfo.userType) {
//         // Check if there's a different user of the same type
//         if (
//           userInfo.userType === currentUserType &&
//           userInfo.userId !== currentUserId
//         ) {
//           console.log(
//             `Found other active tab with different ${currentUserType} user:`,
//             {
//               tabId,
//               userId: userInfo.userId,
//               currentUserId,
//             }
//           );
//           return true;
//         }

//         // Check if there's a user of different type
//         if (userInfo.userType !== currentUserType) {
//           console.log(`Found other active tab with different user type:`, {
//             tabId,
//             userType: userInfo.userType,
//             currentUserType,
//           });
//           return true;
//         }
//       }
//     }

//     return false;
//   } catch (error) {
//     console.error("Error checking for other active tabs:", error);
//     return false; // Default to false on error
//   }
// };

// // Enhanced function to get details about other active tabs
// const getOtherActiveUserTabs = (currentUserType, currentUserId = null) => {
//   try {
//     const currentTabId = getTabId();
//     const registry = getActiveTabsFromRegistry();
//     const otherTabs = [];

//     // Get current user ID if not provided
//     if (!currentUserId) {
//       const currentUser = getCurrentTabUserInfo();
//       currentUserId = currentUser?.userId;
//     }

//     // Check all tabs except current one
//     for (const [tabId, tabData] of Object.entries(registry)) {
//       if (tabId === currentTabId) continue;

//       const { userInfo, timestamp } = tabData;

//       if (userInfo && userInfo.userId && userInfo.userType) {
//         otherTabs.push({
//           tabId,
//           userType: userInfo.userType,
//           userId: userInfo.userId,
//           firstName: userInfo.firstName,
//           companyName: userInfo.companyName,
//           isDifferentUser:
//             userInfo.userType !== currentUserType ||
//             userInfo.userId !== currentUserId,
//           lastActive: new Date(timestamp).toLocaleString(),
//         });
//       }
//     }

//     return otherTabs;
//   } catch (error) {
//     console.error("Error getting other active tabs:", error);
//     return [];
//   }
// };

// // Call this when user logs out to notify other tabs
// const notifyTabsOfLogout = () => {
//   const tabId = getTabId();

//   broadcastToTabs({
//     type: "USER_LOGOUT",
//     tabId,
//   });

//   unregisterCurrentTab();
// };

// // Initialize the system when the module loads
// if (typeof window !== "undefined") {
//   // Initialize after a short delay to ensure DOM is ready
//   setTimeout(initTabRegistry, 100);
// }

// // Export the functions
// export {
//   checkForOtherActiveUserTabs,
//   getOtherActiveUserTabs,
//   notifyTabsOfLogout,
//   registerCurrentTab,
//   unregisterCurrentTab,
//   initTabRegistry,
// };

// // Updated handleLogout function with tab detection
// export const handleLogout = async (clearPersistent = false) => {
//   logEvent(analytics, "logout_click", {});
//   try {
//     const currentUserType = getTabSpecificData("loggedInUserType");
//     const currentUser =
//       currentUserType === "corporate"
//         ? getCorporateLoggedInUserDetails()
//         : getQugoLoggedInUserDetails();
//     const currentUserId = currentUser?.userId;

//     // Clear persistent data if explicitly requested (e.g., user clicked logout)
//     if (clearPersistent && currentUserId) {
//       console.log(
//         `Checking for other active tabs before clearing persistent data for ${currentUserType} user ${currentUserId}`
//       );

//       // Check if there are other tabs with different users
//       const hasOtherActiveTabs = checkForOtherActiveUserTabs(
//         currentUserType,
//         currentUserId
//       );

//       if (hasOtherActiveTabs) {
//         const otherTabs = getOtherActiveUserTabs(
//           currentUserType,
//           currentUserId
//         );
//         console.log("Other active tabs detected:", otherTabs);
//         console.log(
//           "Preserving persistent data to protect other active sessions"
//         );

//         // Don't clear persistent data since other users are active
//         // But still log out this specific tab
//       } else {
//         console.log(
//           "No other active tabs detected, safe to clear persistent data"
//         );

//         // Safe to clear persistent data for this user type
//         if (currentUserType === "corporate") {
//           // Double-check that we're clearing the right user
//           const persistentUser = getLastActiveCorporateUser();
//           if (
//             persistentUser &&
//             persistentUser.userData.userDetails?._id === currentUserId
//           ) {
//             clearLastActiveCorporateUser();
//             console.log(
//               "Cleared persistent corporate data for user:",
//               currentUserId
//             );
//           }
//         } else if (currentUserType === "qugo") {
//           const persistentUser = getLastActiveQugoUser();
//           if (persistentUser && persistentUser.userData._id === currentUserId) {
//             clearLastActiveQugoUser();
//             console.log(
//               "Cleared persistent qugo data for user:",
//               currentUserId
//             );
//           }
//         }

//         // Update the general "most recent" pointer
//         updateMostRecentUserPointer();
//       }
//     }

//     // Notify other tabs about this logout
//     notifyTabsOfLogout();

//     // Clear tab-specific data (this only affects current tab)
//     removeTabSpecificData("userID");
//     removeTabSpecificData("userId");
//     removeTabSpecificData("phoneNumber");
//     removeTabSpecificData("userEmail");
//     removeTabSpecificData("userDetails");
//     removeTabSpecificData("accessToken");
//     removeTabSpecificData("loggedInUserType");

//     if (currentUserType === "corporate") {
//       removeTabSpecificData("corporateUserDetails");
//       const tabId = getTabId();
//       Cookies.remove(`corporateUserDetails_${tabId}`);
//       store.dispatch(logoutUser());
//       store.dispatch(resetTravelersState());
//       await Router.push("/corporate");
//     } else {
//       removeTabSpecificData("qugoUserDetails");
//       await Router.push("/");
//     }

//     console.log("Logout successful");
//   } catch (error) {
//     console.log("Logout failed:", error);
//   }
// };

// // Helper function to update the "most recent" user pointer
// const updateMostRecentUserPointer = () => {
//   const corporateUser = getLastActiveCorporateUser();
//   const qugoUser = getLastActiveQugoUser();

//   // Determine which user should be the "most recent" now
//   let mostRecentUser = null;

//   if (corporateUser && qugoUser) {
//     // Both exist, use the one with more recent timestamp
//     mostRecentUser =
//       corporateUser.timestamp > qugoUser.timestamp ? corporateUser : qugoUser;
//   } else if (corporateUser) {
//     mostRecentUser = corporateUser;
//   } else if (qugoUser) {
//     mostRecentUser = qugoUser;
//   }

//   if (mostRecentUser) {
//     const compressedData = pako.deflate(JSON.stringify(mostRecentUser));
//     setPersistentData("lastActiveUser", compressedData);
//   } else {
//     // No users left, clear the general pointer
//     removePersistentData("lastActiveUser");
//   }
// };

// // Updated storeUserDetails to register tab when user logs in
// export const storeUserDetails = (data) => {
//   const compressedData = pako.deflate(JSON.stringify(data));
//   setTabSpecificData("corporateUserDetails", compressedData);
//   setTabSpecificData("loggedInUserType", "corporate");

//   // Store as last active user for persistence
//   storeLastActiveUser(data, "corporate");

//   // Set tab-specific session data
//   setTabSpecificData("accessToken", `"${data.accessTokenData.accessToken}"`);
//   setTabSpecificData("phoneNumber", `"${data.userDetails.mobile}"`);
//   setTabSpecificData("userID", `"${data.userDetails._id}"`);
//   setTabSpecificData("userId", `"${data.userDetails._id}"`);
//   setTabSpecificData("userDetails", `"${data.userDetails.firstName}"`);

//   const tabId = getTabId();

//   // Store user details in Redux
//   const updatedData = {
//     userId: data.userDetails._id,
//     companyId: data.companyDetails._id,
//     loggedInDetails: data,
//     tabId: tabId,
//   };
//   store.dispatch(loginUser(updatedData));

//   // Register this tab with the new user info
//   registerCurrentTab();
// };

// // Updated storeQugoUserDetails to register tab when user logs in
// export const storeQugoUserDetails = (data) => {
//   const compressedData = pako.deflate(JSON.stringify(data));
//   setTabSpecificData("qugoUserDetails", compressedData);
//   setTabSpecificData("loggedInUserType", "qugo");

//   // Store as last active user for persistence
//   storeLastActiveUser(data, "qugo");

//   // Set tab-specific session data
//   setTabSpecificData("accessToken", `"${data.accessToken}"`);
//   setTabSpecificData("phoneNumber", `"${data.mobile}"`);
//   setTabSpecificData("userID", `"${data._id}"`);
//   setTabSpecificData("userId", `"${data._id}"`);
//   setTabSpecificData("userDetails", `"${data.firstName}"`);

//   // Register this tab with the new user info
//   registerCurrentTab();
// };

// // Add this to your StoreInitializer component to initialize tab tracking
// // Add this useEffect in your StoreInitializer component:

// /*
// useEffect(() => {
//   // Initialize tab registry system
//   initTabRegistry();
  
//   // Register current tab when component mounts
//   registerCurrentTab();
  
//   return () => {
//     // Clean up when component unmounts
//     unregisterCurrentTab();
//   };
// }, []);
// */

// // Utility function to check active tabs (for debugging/admin purposes)
// export const getActiveTabsInfo = () => {
//   const currentTabId = getTabId();
//   const currentUser = getCurrentTabUserInfo();
//   const otherTabs = getOtherActiveUserTabs(
//     currentUser?.userType,
//     currentUser?.userId
//   );

//   return {
//     currentTab: {
//       tabId: currentTabId,
//       userInfo: currentUser,
//     },
//     otherTabs: otherTabs,
//     totalActiveTabs: otherTabs.length + 1,
//   };
// };
