import React, { createContext, useContext, useState, useEffect } from "react";
import { useRouter } from "next/router";
import { useUserType } from "@/hooks/useUserType";
import { getTabSpecificData, setTabSpecificData } from "@/utils/axios/axios";

const LoginContext = createContext();

export const useLogin = () => {
  return useContext(LoginContext);
};

export const LoginProvider = ({ children }) => {
  const router = useRouter();
  const corporateUser = useUserType();

  const [isOpen, setIsOpen] = useState(false);
  const [accessToken, setAccessToken] = useState(null); // Add access token state
  const [showLoginButton, setShowLoginButton] = useState(true);
  const [userName, setUserName] = useState("");
  const [isFlightPricePopupOpen, setIsFlightPricePopupOpen] = useState(false);
  const [flightOldPrice, setFlightOldPrice] = useState(null);
  const [flightNewPrice, setFlightNewPrice] = useState(null);
  const [flightPriceUpdateCallback, setFlightPriceUpdateCallback] =
    useState(null);
  const [activeUrl, setActiveUrl] = useState("flights");
  const [activeProfile, setActiveProfile] = useState("qa");
  const [eventUserDetails, setEventUserDetails] = useState(null);
  const [isPosiflexLoginModalVisible, setIsPosiflexLoginModalVisible] =
    useState(false);

  // coporate related states
  const [isCorporateLoginModalVisible, setCorporateLoginModalVisible] =
    useState(false);
  const [isCorporateSignupModalVisible, setCorporateSignupModalVisible] =
    useState(false);

  const openPopup = () => {
    corporateUser ? setCorporateLoginModalVisible(true) : setIsOpen(true);
  };

  const closePopup = (showLoginButton) => {
    if (corporateUser) {
      setCorporateLoginModalVisible(false);
    } else {
      if (showLoginButton !== undefined) {
        setIsOpen(false);
        setShowLoginButton(showLoginButton);
      }
    }
  };

  const openFlightPricePopup = (oldPrice, newPrice, callback = null) => {
    setFlightOldPrice(oldPrice);
    setFlightNewPrice(newPrice);
    setIsFlightPricePopupOpen(true);
    if (callback !== null) {
      setFlightPriceUpdateCallback(() => callback);
    }
  };

  const closeFlightPricePopup = () => {
    setIsFlightPricePopupOpen(false);

    if (flightPriceUpdateCallback) {
      flightPriceUpdateCallback();
      setFlightPriceUpdateCallback(null); // Reset callback after executing
    }

    // Reset prices when the popup is closed
    setFlightOldPrice(null);
    setFlightNewPrice(null);
  };

  const handleUrlChange = (url) => {
    setActiveUrl(url);
  };

  const updateEventUserDetails = (details) => {
    if (JSON.stringify(eventUserDetails) !== JSON.stringify(details)) {
      setEventUserDetails(details);
      setTabSpecificData("eventUserDetails", JSON.stringify(details));
    }
  };

  useEffect(() => {
    // Check for the access token in local storage
    const token = getTabSpecificData("accessToken")?.replace(/"/g, "") || "";
    const storedEventUserDetails = getTabSpecificData("eventUserDetails");
    const userName = getTabSpecificData("userDetails")?.replace(/"/g, "") || "";
    if (token) {
      setAccessToken(token);
      setUserName(userName);
    }
    if (storedEventUserDetails) {
      setEventUserDetails(JSON.parse(storedEventUserDetails));
    }
    setActiveProfile(process.env.ENV);
  }, []);

  useEffect(() => {
    const activeTab = router?.query?.activeTab;
    if (activeTab) {
      setActiveUrl(activeTab);
    }
  }, [router]);

  useEffect(() => {
    const handleQugoLogout = () => {
      setShowLoginButton(true);
      setAccessToken(null);
      setUserName("");
    };

    window.addEventListener("qugoLogout", handleQugoLogout);

    return () => {
      window.removeEventListener("qugoLogout", handleQugoLogout);
    };
  }, []);

  const isLoggedIn = !!accessToken;

  return (
    <LoginContext.Provider
      value={{
        openPopup,
        closePopup,
        showLoginButton,
        isOpen,
        accessToken,
        setAccessToken,
        isLoggedIn,
        setShowLoginButton,
        userName,
        openFlightPricePopup,
        closeFlightPricePopup,
        flightOldPrice,
        flightNewPrice,
        isFlightPricePopupOpen,
        activeUrl,
        handleUrlChange,
        isPosiflexLoginModalVisible,
        setIsPosiflexLoginModalVisible,
        updateEventUserDetails,
        eventUserDetails,
        activeProfile,

        // coporate related
        isCorporateLoginModalVisible,
        isCorporateSignupModalVisible,
        setCorporateLoginModalVisible,
        setCorporateSignupModalVisible,
      }}
    >
      {children}
    </LoginContext.Provider>
  );
};
