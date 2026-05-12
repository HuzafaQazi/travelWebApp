// components/corporate/ProtectedRoute/ProtectedRoute.js

import { useRouter } from "next/router";
import { useEffect, useReducer, useRef } from "react";
import { useSelector } from "react-redux";
import Loader from "@/components/corporate/loader/Loader";
import Unauthorized from "@/components/corporate/Unauthorized/Unauthorized";
import { MODULE_ROUTES } from "@/utils/constants";
import {
  selectCorporateIsAuthenticated,
  selectCorporateHasCheckedAuth,
  selectCorporateUserTypeId,
  selectCorporateRolesModulesAndPermissions,
  selectCorporateUserInfo,
} from "@/store/selectors/corporateSelectors";

// Define auth states
const AUTH_STATES = {
  INITIALIZING: "INITIALIZING",
  CHECKING: "CHECKING",
  REDIRECTING: "REDIRECTING", // ✅ NEW - User is being redirected
  AUTHORIZED: "AUTHORIZED",
  UNAUTHORIZED: "UNAUTHORIZED",
};

// Reducer for atomic state updates
const authReducer = (state, action) => {
  switch (action.type) {
    case "SET_INITIALIZING":
      return { status: AUTH_STATES.INITIALIZING };
    case "SET_CHECKING":
      return { status: AUTH_STATES.CHECKING };
    case "SET_REDIRECTING":
      return { status: AUTH_STATES.REDIRECTING };
    case "SET_AUTHORIZED":
      return { status: AUTH_STATES.AUTHORIZED };
    case "SET_UNAUTHORIZED":
      return { status: AUTH_STATES.UNAUTHORIZED };
    default:
      return state;
  }
};

const ProtectedRoute = ({ children }) => {
  const router = useRouter();

  // ✅ Use Redux selectors
  const isAuthenticated = useSelector(selectCorporateIsAuthenticated);
  const hasCheckedAuth = useSelector(selectCorporateHasCheckedAuth);
  const userTypeId = useSelector(selectCorporateUserTypeId);
  const rolesModulesAndPermissions = useSelector(
    selectCorporateRolesModulesAndPermissions
  );
  const userInfo = useSelector(selectCorporateUserInfo);

  // Use reducer for atomic state updates
  const [authState, dispatch] = useReducer(authReducer, {
    status: AUTH_STATES.INITIALIZING,
  });

  // ✅ Track if we're currently redirecting
  const isRedirecting = useRef(false);

  useEffect(() => {
    const verifyUser = async () => {
      console.log("ProtectedRoute: Starting user verification...");
      console.log(
        `ProtectedRoute: Redux state - isAuthenticated: ${isAuthenticated}, hasCheckedAuth: ${hasCheckedAuth}`
      );

      // If we haven't checked auth yet, wait for StoreInitializer
      if (!hasCheckedAuth) {
        console.log("ProtectedRoute: Waiting for auth check to complete...");
        dispatch({ type: "SET_INITIALIZING" });
        return;
      }

      console.log(
        "ProtectedRoute: Auth check complete, proceeding with verification..."
      );

      // Set checking state to prevent flash
      dispatch({ type: "SET_CHECKING" });

      // Check if user is authenticated
      if (!isAuthenticated) {
        console.log("ProtectedRoute: User not authenticated");

        // Allow access to login page
        if (router.pathname === "/corporate") {
          console.log(
            "ProtectedRoute: On corporate login page, allowing access"
          );
          dispatch({ type: "SET_AUTHORIZED" });
        } else {
          // ✅ Set redirecting state before redirect
          console.log("ProtectedRoute: Setting redirecting state");
          dispatch({ type: "SET_REDIRECTING" });
          isRedirecting.current = true;

          console.log("ProtectedRoute: Redirecting to corporate login");
          await router.push("/corporate");
        }
        return;
      }

      console.log(
        "ProtectedRoute: User authenticated, checking permissions..."
      );

      // Check if user is Super Admin (userTypeId = 1)
      const isSuperAdmin = userTypeId === 1;

      console.log(
        `ProtectedRoute: User type ID: ${userTypeId}, Is Super Admin: ${isSuperAdmin}`
      );

      // Super Admin has access to all routes regardless of module permissions
      if (isSuperAdmin) {
        console.log(
          "ProtectedRoute: Super Admin detected - granting full access"
        );
        dispatch({ type: "SET_AUTHORIZED" });
        return;
      }

      const modulesArray = rolesModulesAndPermissions || [];

      // If rolesModulesAndPermissions is null or empty => allow all routes
      if (!modulesArray || modulesArray.length === 0) {
        console.log("ProtectedRoute: No module restrictions, allowing access");
        dispatch({ type: "SET_AUTHORIZED" });
        return;
      }

      const userModules = modulesArray.map((rm) => parseInt(rm.moduleId, 10));
      console.log("ProtectedRoute: User modules:", userModules);

      // Find which moduleId corresponds to the current route
      let neededModuleId = null;
      const currentPath = router.pathname;
      console.log("ProtectedRoute: Current path:", currentPath);

      // Search in MODULE_ROUTES
      for (const [moduleId, routeInfo] of Object.entries(MODULE_ROUTES)) {
        if (routeInfo.route === currentPath) {
          neededModuleId = parseInt(moduleId, 10);
          break;
        }

        // Check if current path is a nested route
        if (
          routeInfo.nestedRoutes?.some(
            (route) => currentPath.startsWith(route) || currentPath === route
          )
        ) {
          neededModuleId = parseInt(moduleId, 10);
          break;
        }
      }

      console.log("ProtectedRoute: Needed module ID:", neededModuleId);

      // If route not found in MODULE_ROUTES => no module check
      // If found => user must have that moduleId
      let moduleAuthorized = true;
      if (neededModuleId) {
        moduleAuthorized = userModules.includes(neededModuleId);
      }

      console.log("ProtectedRoute: Module authorized:", moduleAuthorized);

      // Atomic state update based on authorization result
      dispatch({
        type: moduleAuthorized ? "SET_AUTHORIZED" : "SET_UNAUTHORIZED",
      });
    };

    verifyUser();
  }, [
    isAuthenticated,
    hasCheckedAuth,
    userTypeId,
    rolesModulesAndPermissions,
    router.pathname,
  ]);

  // ✅ Listen to route changes to reset redirecting flag
  useEffect(() => {
    const handleRouteChangeComplete = () => {
      if (isRedirecting.current) {
        console.log("ProtectedRoute: Redirect completed");
        isRedirecting.current = false;
      }
    };

    router.events.on("routeChangeComplete", handleRouteChangeComplete);
    router.events.on("routeChangeError", handleRouteChangeComplete);

    return () => {
      router.events.off("routeChangeComplete", handleRouteChangeComplete);
      router.events.off("routeChangeError", handleRouteChangeComplete);
    };
  }, [router]);

  // Handle different auth states
  switch (authState.status) {
    case AUTH_STATES.INITIALIZING:
    case AUTH_STATES.CHECKING:
    case AUTH_STATES.REDIRECTING: // ✅ Show loader during redirect
      console.log(
        `ProtectedRoute: Showing loader - status: ${authState.status}`
      );
      return <Loader />;

    case AUTH_STATES.UNAUTHORIZED:
      console.log("ProtectedRoute: Showing unauthorized");
      return <Unauthorized />;

    case AUTH_STATES.AUTHORIZED:
      console.log("ProtectedRoute: Rendering children - user authorized");
      return children;

    default:
      return <Loader />;
  }
};

export default ProtectedRoute;
