import { useEffect, useRef, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useRouter } from "next/router";
import { initializeStore } from "@/store/initializeStore";
import { initializeB2CStore } from "@/store/initializeB2CStore";
import { setHasCheckedAuth } from "@/store/slices/userSlice";
import { getActiveUserType } from "@/utils/axios/axios";

const StoreInitializer = () => {
  const dispatch = useDispatch();
  const router = useRouter();

  // Redux state
  const isLoggedIn = useSelector((state) => state?.user?.isLoggedIn);
  const hasCheckedAuth = useSelector((state) => state?.user?.hasCheckedAuth);
  const userType = useSelector((state) => state?.user?.userType);

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

      // ✅ PRIORITY 1: Check for active session in storage
      const activeUserTypeFromStorage = getActiveUserType();

      // Determine expected user type from URL
      const urlBasedUserType = router.pathname.includes("/corporate")
        ? "corporate"
        : "qugo";

      // ✅ Determine which user type to initialize
      // Priority: Storage  > URL
      const targetUserType = activeUserTypeFromStorage || urlBasedUserType;

      console.log(`🔍 User type detection:`);
      console.log(`   - From storage: ${activeUserTypeFromStorage}`);
      console.log(`   - From URL: ${urlBasedUserType}`);
      console.log(`   - Target: ${targetUserType}`);

      // Attempt to initialize appropriate store
      try {
        if (targetUserType === "corporate") {
          console.log("🏢 Attempting corporate store initialization...");
          await initializeStore();
          console.log("✅ Corporate session restored");
        } else {
          console.log("🛍️ Attempting B2C store initialization...");
          await initializeB2CStore();
          console.log("✅ B2C session restored");
        }
      } catch (error) {
        // No active session or session invalid - this is normal
        console.log(`ℹ️ No active session for ${targetUserType} user`);
      }

      // Mark auth check as complete
      dispatch(setHasCheckedAuth(true));
    } catch (error) {
      console.error("❌ Error during initialization:", error);
      dispatch(setHasCheckedAuth(true));
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
