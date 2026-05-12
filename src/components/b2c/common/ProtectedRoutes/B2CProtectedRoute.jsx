import { useRouter } from "next/router";
import { useEffect, useReducer, useRef } from "react";
import { useSelector } from "react-redux";
import Loader from "@/components/corporate/loader/Loader";
import B2CUnauthorized from "../Unauthorized/Unauthorized";
import {
  selectIsLoggedIn as selectB2CIsAuthenticated,
  selectB2CUserId,
  selectB2CHasCheckedAuth,
} from "@/store/selectors/b2cSelectors";

// Define auth states
const AUTH_STATES = {
  INITIALIZING: "INITIALIZING",
  CHECKING: "CHECKING",
  REDIRECTING: "REDIRECTING",
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

const B2CProtectedRoute = ({ children }) => {
  const router = useRouter();

  // ✅ Use Redux selectors
  const isAuthenticated = useSelector(selectB2CIsAuthenticated);
  const hasCheckedAuth = useSelector(selectB2CHasCheckedAuth);
  const userId = useSelector(selectB2CUserId);

  // Use reducer for atomic state updates
  const [authState, dispatch] = useReducer(authReducer, {
    status: AUTH_STATES.INITIALIZING,
  });

  // ✅ Track if we're currently redirecting
  const isRedirecting = useRef(false);

  useEffect(() => {
    const verifyUser = async () => {
      console.log("B2CProtectedRoute: Starting user verification...");
      console.log(
        `B2CProtectedRoute: Redux state - isAuthenticated: ${isAuthenticated}, hasCheckedAuth: ${hasCheckedAuth}`
      );

      console.log(
        `B2CProtectedRoute: UserId: ${userId}, Current Path: ${router.pathname}`
      );

      // If we haven't checked auth yet, wait for StoreInitializer
      if (!hasCheckedAuth) {
        console.log("B2CProtectedRoute: Waiting for auth check to complete...");
        dispatch({ type: "SET_INITIALIZING" });
        return;
      }

      console.log(
        "B2CProtectedRoute:Loading complete, proceeding with verification..."
      );

      // Set checking state to prevent flash
      dispatch({ type: "SET_CHECKING" });

      // Check if user is authenticated
      if (!isAuthenticated || !userId) {
        console.log("B2CProtectedRoute: User not authenticated");

        // ✅ Set redirecting state before redirect
        console.log("B2CProtectedRoute: Setting redirecting state");
        dispatch({ type: "SET_REDIRECTING" });
        isRedirecting.current = true;

        console.log("B2CProtectedRoute: Redirecting to home");
        await router.push("/");
        return;
      }

      console.log("B2CProtectedRoute: User authenticated, granting access...");

      // ✅ B2C users have access to all routes once authenticated (no module checks)
      dispatch({ type: "SET_AUTHORIZED" });
    };

    verifyUser();
  }, [isAuthenticated, hasCheckedAuth, userId, router.pathname]);

  // ✅ Listen to route changes to reset redirecting flag
  useEffect(() => {
    const handleRouteChangeComplete = () => {
      if (isRedirecting.current) {
        console.log("B2CProtectedRoute: Redirect completed");
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
        `B2CProtectedRoute: Showing loader - status: ${authState.status}`
      );
      return <Loader />;

    case AUTH_STATES.UNAUTHORIZED:
      console.log(
        "B2CProtectedRoute: User unauthorized, showing loader while redirecting"
      );
      return <B2CUnauthorized />;

    case AUTH_STATES.AUTHORIZED:
      console.log("B2CProtectedRoute: Rendering children - user authorized");
      return children;

    default:
      return <Loader />;
  }
};

export default B2CProtectedRoute;
