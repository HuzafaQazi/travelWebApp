import Image from "next/image";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import headLogo from "../../../../public/img/brand_logo.png";
import qugoLogo from "../../../../public/img/brand_logo_mobile.png";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUser } from "@fortawesome/free-solid-svg-icons";
import config from "@/config";
import { Button } from "react-bootstrap";
import axios, {
  getTabSpecificData,
  removeTabSpecificData,
} from "@/utils/axios/axios";
import Signin from "@/pages/login";
import { useRouter } from "next/router";
import Popup from "reactjs-popup";
import { useLogin } from "@/store/context/LoginContext";
import FlightsPriceChangedPopup from "@/components/pricechangedpopup/flightspricechangedpopup";
import walletImg from "../../../../public/img/wallet.png";
import LoginModal from "@/components/PosiflexLogin/LoginOtp";
// import corporate from "../../../../public/img/Qugo Corporate black.png";
import corporate from "../../../../public/img/brand_corporate.png";
import { switchToCorporate } from "@/utils/common";
import ProfileSheet from "@/components/b2c/common/ProfileSheet";
import { usePathname } from "next/navigation";
import {
  selectB2CProfile,
  selectB2CUserFullName,
  selectB2CIsLoading,
  selectIsLoggedIn,
  selectB2CWalletBalance,
} from "@/store/selectors/b2cSelectors";
import HeaderSkeleton from "@/components/b2c/Loaders/skeletons/HeaderSkeleton";

const routeBackgroundColors = {
  "/": "bg-white",
  "/flights/oneway/list": "bg-[#028fa34d]",
  "/flights/oneway/review": "bg-[#028fa34d]",
  "/flights/confirmation": "bg-[#028fa34d]",
  "/flights/twoway/list": "bg-[#028fa34d]",
  "/flights/twoway/review": "bg-[#028fa34d]",
  "/flights/multicity/list": "bg-[#028fa34d]",
  "/flights/multicity/review": "bg-[#028fa34d]",
  "/walletDetails": "bg-[#028fa34d]",
  "/newBookingPage": "bg-[#028fa34d]",
  "/confirmbooking": "bg-[#028fa34d]",
  "/bookingdetail": "bg-[#028fa34d]",
  "/CIT-95/Confirm": "bg-[#028fa34d]",
  "/profile": "bg-[#028fa34d]",
  "/bookings/confirmation": "bg-[#028fa34d]",
  "/bookings/hotels/confirmation": "bg-[#028fa34d]",
  "/bookings/flightlisting": "bg-[#028fa34d]",
  "/bookings/review": "bg-[#028fa34d]",
  "/bookings/hotels/hotellisting": "bg-[#028fa34d]",
  "/bookings/hotels/review": "bg-[#028fa34d]",
};

const routeTextColors = {
  "/": "text-white",
  "/flights/oneway/list": "text-black",
  "/flights/oneway/review": "text-black",
  "/flights/confirmation": "text-black",
  "/flights/twoway/list": "text-black",
  "/flights/twoway/review": "text-black",
  "/flights/multicity/list": "text-black",
  "/flights/multicity/review": "text-black",
  "/walletDetails": "text-black",
  "/corporate/Careers": "text-black",
  "/newBookingPage": "text-black",
  "/confirmbooking": "text-black",
  "/bookingdetail": "text-black",
  "/CIT-95/Confirm": "text-black",
  "/profile": "text-black",
  "/bookings/confirmation": "text-black",
  "/bookings/hotels/confirmation": "text-black",
  "/bookings/flightlisting": "text-black",
  "/bookings/review": "text-black",
  "/bookings/hotels/hotellisting": "text-black",
  "/bookings/hotels/review": "text-black",
};

const defaultBackgroundColor = "bg-white";
const defaultTextColor = "text-white";

export default function CommonHeader(props) {
  const {
    isOpen,
    closePopup,
    openPopup,
    isFlightPricePopupOpen,
    closeFlightPricePopup,
    flightOldPrice,
    flightNewPrice,
    isPosiflexLoginModalVisible,
    setIsPosiflexLoginModalVisible,
  } = useLogin();

  const pathname = usePathname();
  const isHome = pathname === "/" || pathname === "/bookings";

  const router = useRouter();

  const isCareersPage = router.pathname === "/corporate/Careers";

  const profile = useSelector(selectB2CProfile);
  const fullName = useSelector(selectB2CUserFullName);
  const isReduxLoading = useSelector(selectB2CIsLoading);
  const isLoggedIn = useSelector(selectIsLoggedIn);
  const walletBalance = useSelector(selectB2CWalletBalance);

  const [popupStyle, setPopupStyle] = useState({ width: "65%" });
  const [popupStyle1, setPopupStyle1] = useState({ width: "95%" });
  const [popupStylings, setPopupStylings] = useState({ width: "50%" });
  const [posiflexButtonLoading, setPosiflexButtonLoading] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const walletBackgroundColor =
    routeBackgroundColors[router.pathname] || defaultBackgroundColor;

  const walletTextColor = routeTextColors[router.pathname] || defaultTextColor;
  const handleClickOutside = (event) => {
    if (!event.target.closest(".popupContent") === null) {
      setIsProfileOpen(false);
    }
  };
  useEffect(() => {
    if (isProfileOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isProfileOpen]);

  useEffect(() => {
    if (isProfileOpen) {
      // Save current scroll position
      const scrollY = window.scrollY;

      // Apply styles to body
      document.body.style.position = "fixed";
      document.body.style.top = `-${scrollY}px`;
      document.body.style.left = "0";
      document.body.style.right = "0";
      document.body.style.overflow = "hidden";

      return () => {
        // Restore body styles
        document.body.style.position = "";
        document.body.style.top = "";
        document.body.style.left = "";
        document.body.style.right = "";
        document.body.style.overflow = "";

        // Restore scroll position
        window.scrollTo(0, scrollY);
      };
    }
  }, [isProfileOpen]);
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth <= 550) {
        setPopupStyle({
          position: "fixed",
          left: "0",
          bottom: "0",
          width: "100%",
          height: "65%",
          transition: "height 0.3s ease-in-out",
          borderRadius: "10px",
        });
      } else {
        setPopupStyle({ width: "65%", borderRadius: "10px" });
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth <= 768) {
        setPopupStylings({
          width: "80%",
          height: "fit-content",
          transition: "height 0.3s ease-in-out",
          borderRadius: "10px",
        });
      } else {
        setPopupStylings({ width: "50%", borderRadius: "10px" });
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleOpenLoginModal = async () => {
    const userId = getTabSpecificData("userID");

    if (!userId) {
      setIsPosiflexLoginModalVisible(true);
      return;
    }

    setPosiflexButtonLoading(true);
    try {
      const response = await getEventRegisteredDetails();
      if (!response.data.id) {
        removeTabSpecificData("fcmToken");
        removeTabSpecificData("eventRegistered");
        removeTabSpecificData("event_id");
        return setIsPosiflexLoginModalVisible(true);
      }

      if (response.data.id) {
        if (window.location.pathname !== "/CIT-95") {
          return await router.push("/CIT-95");
        }
      } else {
        setIsPosiflexLoginModalVisible(true);
      }
    } catch (error) {
      console.log(error);
      setIsPosiflexLoginModalVisible(true);
      removeTabSpecificData("fcmToken");
      removeTabSpecificData("eventRegistered");
      removeTabSpecificData("event_id");
    } finally {
      setPosiflexButtonLoading(false);
    }
  };

  const handleCloseLoginModal = () => {
    setIsPosiflexLoginModalVisible(false);
  };

  async function getEventRegisteredDetails() {
    const userId = getTabSpecificData("userID");
    try {
      const response = await axios.get(
        `${config.EVENTS_REGISTRATION_DETAILS}?user_id=${userId}`,
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  const goToWalletDetails = () => {
    router.push("/walletDetails");
  };

  const goToHome = () => {
    router.push("/");
  };

  if (isReduxLoading) {
    return (
      <>
        {/* Desktop Header with Skeleton */}
        <div className="hidden md:flex justify-between pt-2 pb-2 pr-4">
          <div className="mt-2 pl-4">
            <Image
              className="w-[60px] h-[25px] cursor-pointer"
              src={isHome ? qugoLogo : headLogo}
              alt="headLogo"
              onClick={goToHome}
            />
          </div>

          <HeaderSkeleton />
        </div>

        {/* Mobile Header with Skeleton */}
        <div className="block md:hidden pt-2 pb-2 px-3">
          <div className="flex items-center justify-between gap-2">
            <div className="flex-shrink-0">
              <Image
                className="w-[50px] h-[23px] cursor-pointer"
                src={isHome ? qugoLogo : headLogo}
                alt="headLogo"
                onClick={goToHome}
              />
            </div>

            <HeaderSkeleton isMobile={true} />
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <div className="hidden md:flex justify-between pt-2 pb-2 pr-4">
        <div className="mt-2 pl-4">
          <Image
            className="w-[90px] h-auto cursor-pointer"
            src={isHome ? qugoLogo : headLogo}
            alt="headLogo"
            onClick={goToHome}
          />
        </div>

        <div className="flex items-center space-x-1 sm:space-x-3">
          {!isCareersPage && (
            <>
              {isLoggedIn && (
                <div
                  className={`flex items-center p-1 rounded-xl ${walletBackgroundColor} h-[38px] cursor-pointer`}
                  onClick={goToWalletDetails}
                >
                  <div className="flex items-center">
                    <Image
                      className="w-[30px] h-[30px] mr-2"
                      src={walletImg}
                      alt="walletImg"
                    />
                    <div className="text-[11px] text-[#028fa3]">
                      <div className="font-bold sm:inline hidden">Wallet</div>
                      <div className="flex sm:flex-row flex-col">
                        <div className="text-[#028fa3] sm:mr-1 sm:font-normal font-[400] sm:text-[11px] text-[10px]">
                          Rs .{walletBalance || 0}
                        </div>
                        <span
                          className="hidden text-[#96a302] cursor-pointer"
                          onClick={goToWalletDetails}
                        >
                          Recharge
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}

          {!isCareersPage && (
            <button
              className={`flex flex-col items-center ${walletBackgroundColor} rounded-lg px-2 py-1`}
              onClick={switchToCorporate}
            >
              <div className="font-roboto text-xs font-normal leading-5 tracking-tight text-[#028fa3]">
                Switch to
              </div>
              <Image
                className="w-[100px] pr-1"
                src={corporate}
                alt="qugoLogo"
              />
            </button>
          )}

          {/* <div
            className="bg-[#028fa3] text-white px-2 py-1 text-lg cursor-pointer rounded-lg shadow-md"
            onClick={handleOpenLoginModal}
          >
            Event
          </div> */}

          <div className="self-center ml-2">
            {!isLoggedIn ? (
              <Button
                className="bg-[#028fa3] text-white rounded-lg px-4 py-2 border-none"
                onClick={openPopup}
              >
                Login
              </Button>
            ) : (
              <>
                <div
                  className="flex items-center mb-1.5 cursor-pointer whitespace-nowrap"
                  onClick={() => setIsProfileOpen(true)}
                >
                  <div className={`flex items-center ${walletTextColor}`}>
                    <div className="sm:block hidden">Hey, {fullName}</div>
                    <FontAwesomeIcon icon={faUser} className="ml-1.5" />
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="block md:hidden pt-2 pb-2 px-3">
        <div className="flex items-center justify-between gap-2">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Image
              className="w-[50px] h-[23px] cursor-pointer"
              src={headLogo}
              alt="headLogo"
              onClick={goToHome}
            />
          </div>

          {/* Right Side Actions */}
          <div className="flex items-center gap-2">
            {!isCareersPage && (
              <>
                {/* Corporate and Event Toggle Group */}
                <div
                  className={`flex items-center ${walletBackgroundColor} rounded-full p-0.5 h-[28px]`}
                >
                  {/* Corporate Button */}
                  <button
                    className="px-2 h-[24px] text-[12px] text-[#028fa3] font-medium flex items-center justify-center rounded-full hover:bg-white/50 transition-colors"
                    onClick={switchToCorporate}
                  >
                    corporate
                  </button>

                  {/* Divider */}
                  <div className="w-px h-4 bg-slate-300"></div>

                  {/* Event Button */}
                  {/* <button
                    className="px-2 h-[24px] text-[12px] text-[#028fa3] font-medium flex items-center justify-center rounded-full hover:bg-white/50 transition-colors"
                    onClick={handleOpenLoginModal}
                  >
                    Event
                  </button> */}
                </div>

                {/* Wallet Icon Only - When Logged In */}
                {isLoggedIn && (
                  <button
                    className="bg-gradient-to-r from-teal-50 to-teal-100 rounded-full w-[28px] h-[28px] flex items-center justify-center border border-teal-200"
                    onClick={goToWalletDetails}
                  >
                    <Image
                      className="w-[14px] h-[14px]"
                      src={walletImg}
                      alt="walletImg"
                    />
                  </button>
                )}

                {/* Profile / Login Icon */}
                {!isLoggedIn ? (
                  <button
                    className={`${walletBackgroundColor} rounded-full w-fit px-3 h-[28px] flex items-center justify-center`}
                    onClick={openPopup}
                  >
                    <div className="text-[12px] text-[#028fa3]">Login</div>
                  </button>
                ) : (
                  <button
                    className={`${walletBackgroundColor} rounded-full w-[28px] h-[28px] flex items-center justify-center`}
                    onClick={() => setIsProfileOpen(true)}
                  >
                    <FontAwesomeIcon
                      icon={faUser}
                      className="text-[12px] text-[#028fa3]"
                    />
                  </button>
                )}
              </>
            )}

            {/* Careers Page Layout */}
            {isCareersPage && (
              <>
                {/* Event Button */}
                {/* <button
                  className={`${walletBackgroundColor} rounded-full px-2.5 h-[28px] text-[9px] text-[#028fa3] font-medium flex items-center justify-center`}
                  onClick={handleOpenLoginModal}
                >
                  Event
                </button> */}

                {/* Profile / Login Icon */}
                {!isLoggedIn ? (
                  <button
                    className={`${walletBackgroundColor} rounded-full w-[28px] h-[28px] flex items-center justify-center`}
                    onClick={openPopup}
                  >
                    <FontAwesomeIcon
                      icon={faUser}
                      className="text-[11px] text-[#028fa3]"
                    />
                  </button>
                ) : (
                  <button
                    className={`${walletBackgroundColor} rounded-full w-[28px] h-[28px] flex items-center justify-center`}
                    onClick={() => setIsProfileOpen(true)}
                  >
                    <FontAwesomeIcon
                      icon={faUser}
                      className="text-[11px] text-[#028fa3]"
                    />
                  </button>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Profile Drawer */}

      {isPosiflexLoginModalVisible && (
        <Popup
          open={isPosiflexLoginModalVisible}
          style={{ zIndex: 100000, borderRadius: "10px" }}
          overlayStyle={{
            background: "transparent",
            backdropFilter: "blur(5px)",
          }}
          onClose={handleCloseLoginModal}
          contentStyle={popupStyle1}
          modal
          closeOnDocumentClick={false}
          lockScroll
        >
          <LoginModal
            isOpen={isPosiflexLoginModalVisible}
            onClose={handleCloseLoginModal}
            getEventRegisteredDetails={getEventRegisteredDetails}
          />
        </Popup>
      )}

      <Popup
        open={isOpen}
        style={{ zIndex: 100000, borderRadius: "10px" }}
        overlayStyle={{
          background: "transparent",
          backdropFilter: "blur(5px)",
        }}
        onClose={closePopup}
        contentStyle={popupStyle}
        modal
        closeOnDocumentClick
        lockScroll
      >
        <div className="relative">
          <button
            className="absolute top-0 right-0 p-4 text-[#028fa3] text-xl bg-transparent border-none outline-none rounded-tr-lg"
            onClick={closePopup}
          >
            &times;
          </button>
          <Signin closePopup={closePopup} {...props} />
        </div>
      </Popup>

      <Popup
        open={isFlightPricePopupOpen}
        style={{ zIndex: 100000 }}
        overlayStyle={{ background: "rgba(0, 0, 0, 0.2)" }}
        contentStyle={{
          width: "50%",
          height: "fit-content",
          paddingBottom: "2%",
          backgroundColor: "white",
          boxShadow: "0px 4px 4px 0px #169CB045",
          ...popupStylings,
        }}
        onClose={closeFlightPricePopup}
        modal
        closeOnDocumentClick={false}
        lockScroll
      >
        <div>
          <FlightsPriceChangedPopup
            flightOldPrice={flightOldPrice}
            flightNewPrice={flightNewPrice}
            closePopup={closeFlightPricePopup}
            {...props}
          />
        </div>
      </Popup>

      {isProfileOpen && (
        <ProfileSheet
          isOpen={isProfileOpen}
          onClose={() => setIsProfileOpen(false)}
        />
      )}
    </>
  );
}
