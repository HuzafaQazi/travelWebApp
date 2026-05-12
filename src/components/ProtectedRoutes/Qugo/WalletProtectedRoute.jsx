import { useEffect, useReducer } from "react";
import { useSelector } from "react-redux";
import Loader from "@/components/corporate/loader/Loader";
import Unauthorized from "@/components/corporate/Unauthorized/Unauthorized";
import {
  selectCorporateIsAuthenticated,
  selectCorporateWalletAllowed,
  selectCorporateHasCheckedAuth,
} from "@/store/selectors/corporateSelectors";
import { selectIsLoggedIn } from "@/store/selectors/b2cSelectors";
import { getActiveUserType } from "@/utils/axios/axios";

// Define wallet auth states
const WALLET_AUTH_STATES = {
  INITIALIZING: "INITIALIZING",
  CHECKING: "CHECKING",
  AUTHORIZED: "AUTHORIZED",
  UNAUTHORIZED: "UNAUTHORIZED",
};

// Reducer for atomic state updates
const walletAuthReducer = (state, action) => {
  switch (action.type) {
    case "SET_INITIALIZING":
      return { status: WALLET_AUTH_STATES.INITIALIZING };
    case "SET_CHECKING":
      return { status: WALLET_AUTH_STATES.CHECKING };
    case "SET_AUTHORIZED":
      return { status: WALLET_AUTH_STATES.AUTHORIZED };
    case "SET_UNAUTHORIZED":
      return { status: WALLET_AUTH_STATES.UNAUTHORIZED };
    default:
      return state;
  }
};

const WalletProtectedRoute = ({ children }) => {
  // ✅ Use Redux selectors
  const hasCheckedAuth = useSelector(selectCorporateHasCheckedAuth);
  const corporateIsAuthenticated = useSelector(selectCorporateIsAuthenticated);
  const b2cIsAuthenticated = useSelector(selectIsLoggedIn);
  const walletAllowed = useSelector(selectCorporateWalletAllowed);
  const currentUserType = getActiveUserType(); // "corporate" or "qugo"

  // Use reducer for atomic state updates
  const [authState, dispatch] = useReducer(walletAuthReducer, {
    status: WALLET_AUTH_STATES.INITIALIZING,
  });

  useEffect(() => {
    const verifyUser = async () => {
      console.log(
        "WalletProtectedRoute: Starting wallet access verification..."
      );
      console.log(
        `WalletProtectedRoute: Redux state - hasCheckedAuth: ${hasCheckedAuth}, userType: ${currentUserType}`
      );
      console.log(
        `WalletProtectedRoute: Corporate authenticated: ${corporateIsAuthenticated}, B2C authenticated: ${b2cIsAuthenticated}`
      );

      // If we haven't checked auth yet, wait for StoreInitializer
      if (!hasCheckedAuth) {
        console.log(
          "WalletProtectedRoute: Waiting for auth check to complete..."
        );
        dispatch({ type: "SET_INITIALIZING" });
        return;
      }

      console.log(
        "WalletProtectedRoute: Auth check complete, proceeding with wallet verification..."
      );
      dispatch({ type: "SET_CHECKING" });

      // Check if any user is authenticated
      const isAnyUserAuthenticated =
        corporateIsAuthenticated || b2cIsAuthenticated;

      if (!isAnyUserAuthenticated) {
        console.log(
          "WalletProtectedRoute: No authenticated user - unauthorized"
        );
        dispatch({ type: "SET_UNAUTHORIZED" });
        return;
      }

      // Handle corporate user wallet access
      if (currentUserType === "corporate" && corporateIsAuthenticated) {
        console.log("WalletProtectedRoute: Corporate user detected");
        console.log(`WalletProtectedRoute: Wallet allowed: ${walletAllowed}`);

        if (walletAllowed) {
          console.log(
            "WalletProtectedRoute: Corporate user authorized for wallet"
          );
          dispatch({ type: "SET_AUTHORIZED" });
        } else {
          console.log(
            "WalletProtectedRoute: Corporate user not authorized for wallet"
          );
          dispatch({ type: "SET_UNAUTHORIZED" });
        }
        return;
      }

      // Handle Qugo/B2C user wallet access
      if (currentUserType === "qugo" && b2cIsAuthenticated) {
        console.log(
          "WalletProtectedRoute: Qugo user detected - allowing access"
        );
        dispatch({ type: "SET_AUTHORIZED" });
        return;
      }

      // Fallback: if we reached here, something went wrong
      console.log(
        "WalletProtectedRoute: Unexpected state - showing unauthorized"
      );
      dispatch({ type: "SET_UNAUTHORIZED" });
    };

    verifyUser();
  }, [
    hasCheckedAuth,
    corporateIsAuthenticated,
    b2cIsAuthenticated,
    walletAllowed,
    currentUserType,
  ]);

  // Handle different auth states
  switch (authState.status) {
    case WALLET_AUTH_STATES.INITIALIZING:
    case WALLET_AUTH_STATES.CHECKING:
      console.log(
        `WalletProtectedRoute: Showing loader - status: ${authState.status}`
      );
      return <Loader />;

    case WALLET_AUTH_STATES.UNAUTHORIZED:
      console.log("WalletProtectedRoute: Showing unauthorized");
      return <Unauthorized />;

    case WALLET_AUTH_STATES.AUTHORIZED:
      console.log(
        "WalletProtectedRoute: Rendering children - wallet access authorized"
      );
      return children;

    default:
      return <Loader />;
  }
};

export default WalletProtectedRoute;
