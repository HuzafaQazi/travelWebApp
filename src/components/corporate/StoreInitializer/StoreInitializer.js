import { useEffect, useRef, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useRouter } from "next/router";
import { initializeStore } from "@/store/initializeStore";
import { initializeB2CStore } from "@/store/initializeB2CStore";
import { setHasCheckedAuth } from "@/store/slices/userSlice";
import { setB2CHasCheckedAuth } from "@/store/slices/b2c/userSlice";
import {
  getActiveUserType,
  restoreSessionForNewTab,
  hasActiveTabSession,
  getAvailableUsers,
  storeUserTypeTokens,
  storeLastActiveUserTokens,
  setActiveUserType,
} from "@/utils/axios/axios";

const StoreInitializer = () => {
  const dispatch = useDispatch();
  const router = useRouter();

  // Redux state
  const isLoggedIn = useSelector((state) => state?.user?.isLoggedIn);
  const hasCheckedAuth = useSelector((state) => state?.user?.hasCheckedAuth);
  const userType = useSelector((state) => state?.user?.userInfo?.userType);

  // Local state for initialization control
  const [isInitializing, setIsInitializing] = useState(false);
  const [shouldReinitialize, setShouldReinitialize] = useState(false);
  const initAttempted = useRef(false);
  const currentPath = useRef(router.pathname);

  // Main initialization logic
  const initializeSession = async () => {
    if (isInitializing) {
      console.log("⏳ Initialization already in progress, skipping...");
      return;
    }

    setIsInitializing(true);
    initAttempted.current = true;

    try {
      console.log("🔄 Starting session initialization...");

      // ── Payment return: bootstrap auth from URL tokens (WhatsApp Qugo users) ──
      // After gateway payment, the agent service embeds auth_token + refresh_token in
      // the returnUrl so the user lands authenticated even without an existing session.
      if (typeof window !== "undefined") {
        const urlParams = new URLSearchParams(window.location.search);
        const urlAuthToken = urlParams.get("auth_token");
        const urlRefreshToken = urlParams.get("refresh_token");
        if (urlAuthToken) {
          console.log("🔑 Found auth tokens in URL — bootstrapping qugo session (payment return)");
          storeUserTypeTokens(urlAuthToken, urlRefreshToken || urlAuthToken, "qugo");
          storeLastActiveUserTokens(urlAuthToken, urlRefreshToken || urlAuthToken, "qugo");
          setActiveUserType("qugo");
          // Remove tokens from URL to avoid them appearing in browser history / shares
          const cleanUrl = new URL(window.location.href);
          cleanUrl.searchParams.delete("auth_token");
          cleanUrl.searchParams.delete("refresh_token");
          window.history.replaceState({}, "", cleanUrl.toString());
        }
      }

      // ✅ Check if tab already has active session
      const hasSession = hasActiveTabSession();

      if (hasSession) {
        const activeType = getActiveUserType();
        console.log(`✅ Tab already has active ${activeType} session`);

        // Session exists, just initialize the store with existing tokens
        try {
          if (activeType === "corporate") {
            console.log(
              "🏢 Initializing corporate store with existing session..."
            );
            await initializeStore();
            console.log("✅ Corporate store initialized");
          } else if (activeType === "qugo") {
            console.log("🛍️ Initializing B2C store with existing session...");
            await initializeB2CStore();
            console.log("✅ B2C store initialized");
          }
        } catch (error) {
          console.log(`ℹ️ Error initializing store: ${error.message}`);
        }
      } else {
        // ✅ No active session in tab, try to restore from localStorage
        console.log("🔍 No active session in tab, attempting restoration...");

        // Check for available users
        const availableUsers = getAvailableUsers();

        if (availableUsers.length === 0) {
          console.log("❌ No saved users found");
        } else {
          console.log(`👥 Found ${availableUsers.length} saved user(s)`);

          // Determine preferred user type based on URL
          const urlBasedUserType = router.pathname.includes("/corporate")
            ? "corporate"
            : "qugo";

          console.log(`🌐 URL suggests ${urlBasedUserType} user type`);

          // ✅ Use restoreSessionForNewTab - it handles everything
          const restoredSession = await restoreSessionForNewTab(
            urlBasedUserType
          );

          if (restoredSession) {
            console.log(
              `🎉 Session restored successfully for ${restoredSession.userType} user`
            );
          } else {
            console.log(`❌ No ${urlBasedUserType} session found`);

            // The user is on a specific route (corporate/qugo) so they should stay logged out
            // if that specific user type doesn't exist
            console.log(`ℹ️ User needs to log in as ${urlBasedUserType} user`);

            // If restoration failed but we have available users, try the most recent one
            // if (availableUsers.length > 0) {
            //   console.log("🔄 Trying most recent user...");
            //   const mostRecentUser = availableUsers[0];
            //   const fallbackSession = await restoreSessionForNewTab(
            //     mostRecentUser.type
            //   );

            //   if (fallbackSession) {
            //     console.log(
            //       `🎉 Fallback restoration successful for ${fallbackSession.userType}`
            //     );
            //   } else {
            //     console.log("❌ Fallback restoration also failed");
            //   }
            // }
          }
        }
      }

      // Mark auth check as complete
      dispatch(setHasCheckedAuth(true));
      dispatch(setB2CHasCheckedAuth(true));
    } catch (error) {
      console.error("❌ Error during initialization:", error);
      dispatch(setHasCheckedAuth(true));
      dispatch(setB2CHasCheckedAuth(true));
    } finally {
      setIsInitializing(false);
      setShouldReinitialize(false);
    }
  };

  // Listen for user type switch events
  useEffect(() => {
    const handleUserTypeChanged = () => {
      console.log("🔄 User type change event detected, reinitializing...");

      // Reset flags to trigger reinitialization
      dispatch(setHasCheckedAuth(false));
      dispatch(setB2CHasCheckedAuth(false));
      initAttempted.current = false;
      setShouldReinitialize(true);
    };

    window.addEventListener("userTypeChanged", handleUserTypeChanged);

    return () => {
      window.removeEventListener("userTypeChanged", handleUserTypeChanged);
    };
  }, [dispatch]);

  // Initial mount initialization
  useEffect(() => {
    // Skip if already initialized or currently initializing
    if (hasCheckedAuth || isInitializing || initAttempted.current) {
      return;
    }

    initializeSession();
  }, [hasCheckedAuth, isInitializing]);

  // Handle reinitialization after user type switch
  useEffect(() => {
    if (shouldReinitialize && !hasCheckedAuth && !isInitializing) {
      console.log("🔄 Triggering reinitialization after user type switch...");
      initializeSession();
    }
  }, [shouldReinitialize, hasCheckedAuth, isInitializing]);

  // Handle route changes (only for explicit corporate/qugo routes)
  useEffect(() => {
    const newPath = router.pathname;
    const pathChanged = currentPath.current !== newPath;

    if (pathChanged) {
      const oldIsCorporateRoute = currentPath.current.includes("/corporate");
      const newIsCorporateRoute = newPath.includes("/corporate");

      // Only reset if switching between explicit corporate and non-corporate routes
      // Don't reset for shared routes like /walletDetails
      if (oldIsCorporateRoute !== newIsCorporateRoute) {
        const oldUserType = oldIsCorporateRoute ? "corporate" : "qugo";
        const newUserType = newIsCorporateRoute ? "corporate" : "qugo";

        console.log(`🔄 Route changed from ${oldUserType} to ${newUserType}`);
        dispatch(setHasCheckedAuth(false));
        dispatch(setB2CHasCheckedAuth(false));
        initAttempted.current = false;
      }

      currentPath.current = newPath;
    }
  }, [router.pathname, dispatch]);

  // Validate user type matches route (only for explicit corporate routes)
  useEffect(() => {
    if (!isLoggedIn || !userType || isInitializing) return;

    // Only validate for explicit corporate routes
    const isCorporateRoute = router.pathname.includes("/corporate");

    if (isCorporateRoute && userType !== "corporate") {
      console.log(
        `⚠️ Corporate route but user type is ${userType}, reinitializing...`
      );

      // Re-initialize to get correct user type
      dispatch(setHasCheckedAuth(false));
      initAttempted.current = false;
    }
  }, [isLoggedIn, userType, router.pathname, dispatch, isInitializing]);

  return null;
};

export default StoreInitializer;
