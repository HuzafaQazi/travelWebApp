import "@/styles/globals.css";
import { useEffect } from "react";
import Head from "next/head";
import "firebase/analytics";
import { app } from "../../utils/firebase";
import { getAnalytics } from "firebase/analytics";
import { logEvent } from "firebase/analytics";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "bootstrap/dist/css/bootstrap.min.css";
import "@fortawesome/fontawesome-svg-core/styles.css";
import "@fortawesome/fontawesome-free/css/all.min.css";
import { LoginProvider } from "@/store/context/LoginContext";
import WebSocketInitializer from "@/components/corporate/WebSocket/WebSocketInitializer";
import NotificationInitializer from "@/components/NotificationInitializer/NotificationInitializer";
import StoreInitializer from "@/components/corporate/StoreInitializer/StoreInitializer";
import NavigationLoader from "@/components/corporate/NavigationLoader/NavigationLoader";
import GlobalPolicyListener from "@/components/corporate/TravelPolicy/GlobalPolicyListener";
import ProfileCompletionGuard from "@/components/b2c/ProfileCompletion/Guard/ProfileCompletionGuard";
import AIChatWidget from "@/components/AIChatWidget/AIChatWidget";
import { Provider } from "react-redux";
import { store } from "@/store/store";
import { fetchUserIp } from "@/utils/fetchUserIP";

export default function App({ Component, pageProps }) {
  useEffect(() => {
    const initialize = async () => {
      try {
        await fetchUserIp();

        // ✅ Initialize analytics only in production
        if (process.env.ENV === "prod" && typeof window !== "undefined") {
          const analytics = getAnalytics(app);

          if (analytics) {
            logEvent(analytics, "screen_view", {
              timestamp: new Date().toISOString(),
            });
          }
        }
      } catch (error) {
        console.error("Error during initialization:", error);
      }
    };

    initialize();
  }, []);

  return (
    <>
      <Provider store={store}>
        <LoginProvider>
          <Head>
            <meta
              name="viewport"
              content="width=device-width, initial-scale=1"
            />
          </Head>
          {/* <Dragabble/> */}
          <ToastContainer />
          <NavigationLoader />
          {/* Initialize WebSocket and Store only if logged in as corporate */}
          <StoreInitializer />
          <WebSocketInitializer />
          <NotificationInitializer />
          <GlobalPolicyListener />
          <AIChatWidget />
          <ProfileCompletionGuard>
            <Component {...pageProps} />
          </ProfileCompletionGuard>
        </LoginProvider>
      </Provider>
    </>
  );
}
