import "tailwindcss/tailwind.css";
import { useState, useEffect } from "react";
import corpLogo from "../../../images/corporate/qugocorpadminlogo.png";
import corporateEmployee from "../../../images/corporate/corporate_employee.png";
import corporateAdmin from "../../../images/corporate/corporate_admin.png";
import qugoLogo from "../../../images/corporate/brand_logo.png";
import Image from "next/image";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faWallet,
  faBell,
  faXmarkCircle,
  faSignOutAlt,
} from "@fortawesome/free-solid-svg-icons";
import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";
import { useRouter } from "next/router";
import { switchToQugo } from "@/utils/common";
import ActivateModal from "@/components/corporate/Activation/Activate";
import Profile from "@/components/corporate/profileSideSheet/Profile";
import Notification from "../auth/Notification";
import { useSelector } from "react-redux";
import { createPortal } from "react-dom";
import { MODULE_ROUTES } from "@/utils/constants";
import HeaderSkeleton from "../Loaders/HeaderSkeleton";
import { handleLogout } from "@/utils/axios/axios";
import Popup from "reactjs-popup";
import { useLogin } from "@/store/context/LoginContext";
import FlightsPriceChangedPopup from "@/components/pricechangedpopup/flightspricechangedpopup";
import {
  selectCorporateIsAuthenticated,
  selectCorporateWalletBalance,
  selectCorporateUserInitials,
  selectCorporateCompanyName,
  selectCorporateUser,
} from "@/store/selectors/corporateSelectors";

const Header = () => {
  const router = useRouter();
  const { id } = router.query;

  const {
    isFlightPricePopupOpen,
    closeFlightPricePopup,
    flightOldPrice,
    flightNewPrice,
  } = useLogin();

  const pathname = usePathname();

  const isCurrentRoute = (route) => router.pathname === route;

  const isAuthenticated = useSelector(selectCorporateIsAuthenticated);
  const walletBalance = useSelector(selectCorporateWalletBalance);
  const userInitials = useSelector(selectCorporateUserInitials);
  const companyName = useSelector(selectCorporateCompanyName);
  const user = useSelector(selectCorporateUser);

  const hasCheckedAuth = useSelector((s) => s.user.hasCheckedAuth);
  const userDetails = useSelector((state) => state?.user?.userInfo);
  const approvalCount = useSelector((state) => state?.approvals?.count);
  const notificationCount = useSelector((state) => state?.notifications?.count);
  const rolesModulesAndPermissions =
    userDetails?.loggedInDetails?.rolesModulesAndPermissions ?? [];

  const [pageLoading, setPageLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [isSideSheetOpen, setIsSideSheetOpen] = useState(false);

  const [isTopSheetOpen, setTopSheetOpen] = useState(false);
  const [isActivateModalVisible, setIsActivateModalVisible] = useState(false);
  const [width, setWidth] = useState("180px"); // Default width
  const [isNavOpen, setIsNavOpen] = useState(false);
  const [popupStylings, setPopupStylings] = useState({ width: "50%" });

  const toggleNav = () => {
    setIsNavOpen(!isNavOpen);
  };

  const handleProfileLogout = async () => {
    // setLoading(true);
    await handleLogout();
    // setLoading(false);
  };

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
    if (window.innerWidth < 600) {
      setWidth("120px");
    } else {
      setWidth("180px");
    }
  };

  useEffect(() => {
    handleResize(); // Set initial width
    window.addEventListener("resize", handleResize); // Update width on resize

    return () => {
      window.removeEventListener("resize", handleResize); // Cleanup on unmount
    };
  }, []);

  // Function to close ActivateModal
  const handleCloseActivateModal = () => {
    setIsActivateModalVisible(false);
  };

  const toggleTopSheet = () => {
    setTopSheetOpen(!isTopSheetOpen);
  };
  const handleOpenSideSheet = () => {
    if (isNavOpen) {
      setIsNavOpen(false);
      setIsSideSheetOpen(true);
    } else {
      setIsSideSheetOpen(true);
    }
  };

  const handleCloseSideSheet = () => {
    setIsSideSheetOpen(false);
  };

  const handlePageRedirect = async (url) => {
    setPageLoading(true);
    await router.push(url);
    setPageLoading(false);
  };

  const handleOpenSignupModal = () => {
    setCorporateSignupModalVisible(true);
  };

  const redirectProfile = async () => {
    await router.push("/");
  };

  const redirectBooking = async () => {
    if (isAuthenticated) {
      await router.push("/corporate/auth/booking");
    } else {
      await router.push("/corporate");
    }
  };

  const handleClickOutside = (event) => {
    if (!event.target.closest(".popupContent") === null) {
      setIsSideSheetOpen(false);
    }
  };

  useEffect(() => {
    if (isSideSheetOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isSideSheetOpen]);

  useEffect(() => {
    const handleBodyScroll = () => {
      document.body.style.overflow = isSideSheetOpen ? "hidden" : "auto";
    };

    handleBodyScroll();
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [isSideSheetOpen]);

  const isRouteActive = (route, MODULE_ROUTES) => {
    const currentPath = pathname;

    // Get the module based on the route
    const matchedModule = Object.values(MODULE_ROUTES).find(
      (m) => m.route === route,
    );

    // Check if current path matches main route or any nested routes
    return (
      currentPath === route ||
      (matchedModule?.nestedRoutes || []).some(
        (nestedRoute) => currentPath === nestedRoute,
      )
    );
  };

  const loginType = userDetails?.loggedInDetails?.userDetails?.userTypeId;

  const isAdmin = loginType === 1;

  // If rolesModulesAndPermissions is null/empty => show all modules
  const isModulesEmpty =
    !rolesModulesAndPermissions || rolesModulesAndPermissions.length === 0;

  // Build the nav modules:
  let navModules = [];
  if (isModulesEmpty || isAdmin) {
    // show all modules from MODULE_ROUTES
    navModules = Object.entries(MODULE_ROUTES)
      .map(([moduleId, routeInfo]) => ({
        moduleId: parseInt(moduleId),
        name: routeInfo.name,
        route: routeInfo.route,
      }))
      .sort((a, b) => a.moduleId - b.moduleId);
  } else {
    // Show only modules user has
    navModules = rolesModulesAndPermissions
      // only keep modules that exist in MODULE_ROUTES
      .filter((rm) => MODULE_ROUTES[rm.moduleId])
      // map them to a simpler object: {moduleId, name, route}
      .map((rm) => ({
        moduleId: parseInt(rm.moduleId),
        name: MODULE_ROUTES[rm.moduleId].name,
        route: MODULE_ROUTES[rm.moduleId].route,
      }))
      .sort((a, b) => a.moduleId - b.moduleId);
  }

  if (!hasCheckedAuth) {
    return <HeaderSkeleton />;
  }

  return (
    <>
      {isAuthenticated ? (
        <div>
          <div>
            <header className=" sticky top-0 z-0 bg-custom-light">
              <div className="max-w-full mx-auto px-2 py-2 flex justify-between items-center">
                <div className="flex flex-col items-start">
                  <div className="flex items-start">
                    {isAdmin ? (
                      <Image
                        onClick={redirectBooking}
                        src={corpLogo}
                        alt="Logo"
                        style={{ width }}
                        className="cursor-pointer"
                      />
                    ) : (
                      <Image
                        onClick={redirectBooking}
                        src={corporateEmployee}
                        alt="Logo"
                        style={{ width }}
                        className="cursor-pointer"
                      />
                    )}
                  </div>
                  <div className="text-[6px] sm:text-xxs font-bold text-left">
                    {companyName}
                  </div>
                </div>

                {/* Middle nav: DESKTOP */}
                <nav className={`${isOpen ? "block" : "hidden"} md:block`}>
                  <ul className="flex items-center">
                    {navModules.map(({ moduleId, name, route }) => {
                      const isActive = isRouteActive(route, MODULE_ROUTES);
                      return (
                        <li className="mx-2" key={moduleId}>
                          <div
                            onClick={() => handlePageRedirect(route)}
                            className={clsx(
                              "cursor-pointer no-underline hover:text-[#028fa3]",
                              { "text-[#028fa3]": isActive },
                            )}
                          >
                            <span className="inline-block pb-1 relative">
                              {name}
                              {isActive && (
                                <span className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-[30px] h-[2px] bg-[#028fa3]" />
                              )}
                              {/* Optional: if Approvals => show count */}
                              {moduleId === 3 && approvalCount > 0 && (
                                <span className="absolute -top-3 -right-3 bg-red-600 text-white text-xxs font-semibold py-[0.2rem] px-[0.2rem] rounded-full">
                                  +{approvalCount}
                                </span>
                              )}
                            </span>
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                </nav>

                {/* Right side nav: Desktop */}
                <nav className="hidden md:block">
                  <ul className="flex items-center">
                    {userDetails?.loggedInDetails?.configuration
                      ?.walletAllowed && (
                      <div
                        className="p-2 lg:px-2 md:mx-2 bg-[rgba(2,_143,_163,_0.12)] w-fit flex items-center text-[#028fa3] text-center border border-[#028fa3] rounded-2xl cursor-pointer"
                        onClick={() => handlePageRedirect("/walletDetails")}
                      >
                        <FontAwesomeIcon
                          icon={faWallet}
                          size="md"
                          style={{
                            color: "#028fa3",
                            backgroundColor: "rgba(2, 143, 163, 0.12)",
                            padding: "10px",
                            borderRadius: "30%",
                            marginRight: "10px",
                          }}
                        />
                        <div className="flex-col w-fit">
                          <div className="text-sm font-bold">Wallet</div>
                          <div className="border border-b-0 border-[#028fa3]"></div>
                          <div className="text-sm font-light text-nowrap">
                            Rs. {walletBalance}{" "}
                            <span
                              className="text-[rgba(150,_163,_2,_1)] font-medium ml-2"
                              onClick={() =>
                                handlePageRedirect("/walletDetails")
                              }
                            >
                              {/* Recharge */}
                            </span>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* <TimerHeader/> */}

                    <div
                      onClick={switchToQugo}
                      className="p-2 lg:px-4 md:mx-2 text-[#028fa3] text-sm text-center border border-solid border-[#028fa3] rounded-2xl cursor-pointer"
                    >
                      Switch to
                      <Image src={qugoLogo} alt="Logo" width={70} />
                    </div>
                    <div
                      className="p-2 py-1 cursor-pointer lg:px-4 md:mx-2 text-white bg-[#028fa3] text-md text-center border border-solid border-[#028fa3] rounded-full"
                      onClick={handleOpenSideSheet}
                    >
                      {userInitials}
                    </div>
                    {isSideSheetOpen && (
                      <Profile
                        isOpen={isSideSheetOpen}
                        onClose={handleCloseSideSheet}
                      />
                    )}

                    <div
                      className="relative inline-block mr-3 cursor-pointer"
                      onClick={toggleTopSheet}
                    >
                      {/* Bell Icon */}
                      <FontAwesomeIcon
                        icon={faBell}
                        className="text-[#878786] w-[20px] h-[20px] mt"
                      />

                      {/* Notification Count */}
                      {notificationCount > 0 && (
                        <span
                          className="absolute border-1 border-[#FFFFFF] top-0 right-0 transform translate-x-1/2 -translate-y-1/2 cursor-pointer bg-red-600 text-white text-xxxs font-medium p-0.5 rounded-full"
                          onClick={toggleTopSheet}
                        >
                          +{notificationCount}
                        </span>
                      )}
                    </div>

                    <Notification
                      isOpen={isTopSheetOpen}
                      onClose={toggleTopSheet}
                    />
                  </ul>
                </nav>

                {/* Mobile menu toggle */}
                <nav className="flex gap-2 items-center md:hidden">
                  <div
                    onClick={switchToQugo}
                    className="p-2 lg:px-4 flex flex-col items-center justify-center md:mx-2 text-[#028fa3] text-xxs sm:text-sm text-center border border-solid border-[#028fa3] rounded-2xl cursor-pointer"
                  >
                    Switch to
                    <Image src={qugoLogo} alt="Logo" width={50} />
                  </div>
                  <div
                    className="relative inline-block mr-3 cursor-pointer"
                    onClick={toggleTopSheet}
                  >
                    {/* Bell Icon */}
                    <FontAwesomeIcon
                      icon={faBell}
                      className="text-[#878786] w-[20px] h-[20px] mt"
                    />

                    {/* Notification Count */}
                    {notificationCount > 0 && (
                      <span
                        className="absolute border-1 border-[#FFFFFF] top-0 right-0 transform translate-x-1/2 -translate-y-1/2 cursor-pointer bg-red-600 text-white text-xxxs font-medium p-0.5 rounded-full"
                        onClick={toggleTopSheet}
                      >
                        +{notificationCount}
                      </span>
                    )}
                  </div>
                  <button
                    onClick={toggleNav}
                    className="text-300 hover:text-white focus:outline-none focus:shadow-outline-gray"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      className="h-6 w-6"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 6h16M4 12h16M4 18h16"
                      />
                    </svg>
                  </button>
                </nav>
              </div>
            </header>

            {/* MOBILE NAV */}

            {isNavOpen && (
              <>
                <div
                  className="fixed inset-0  bg-black/70  z-[99999999] cursor-pointer"
                  onClick={toggleNav} // Close the nav when clicking the overlay
                ></div>
                {createPortal(
                  <div className="fixed top-0 right-0 w-64 h-full bg-white shadow-lg z-[9999999999]">
                    <div className="flex justify-between mt-1 mx-1">
                      <button onClick={toggleNav} className="p-2">
                        <FontAwesomeIcon icon={faXmarkCircle} />
                      </button>
                    </div>
                    <ul className="flex flex-col items-start p-4">
                      {navModules.map(({ moduleId, name, route }) => {
                        const isActive = pathname === route;
                        return (
                          <li key={moduleId} className="my-2">
                            <div
                              onClick={() => {
                                handlePageRedirect(route);
                                toggleNav();
                              }}
                              className={clsx(
                                "cursor-pointer no-underline hover:text-[#028fa3]",
                                { "text-[#028fa3]": isActive },
                              )}
                            >
                              {name}
                              {/* Approvals count if moduleId=3 */}
                              {moduleId === 3 && approvalCount > 0 && (
                                <span className="ml-2 bg-red-600 text-white text-xxs font-semibold px-1 rounded-full">
                                  +{approvalCount}
                                </span>
                              )}
                            </div>
                          </li>
                        );
                      })}

                      <div
                        className="flex gap-2 mt-2 items-center cursor-pointer text-[#FF4D4D] hover:text-[#FF3333] transition-colors duration-200"
                        onClick={handleProfileLogout}
                      >
                        <FontAwesomeIcon icon={faSignOutAlt} />
                        <span className="font-medium text-base">Logout</span>
                      </div>

                      <div className="w-56 flex justify-between items-center absolute bottom-4">
                        {userDetails?.loggedInDetails?.configuration
                          ?.walletAllowed && (
                          <li className="my-2">
                            <div
                              className="p-2 lg:px-2 md:mx-2 bg-[rgba(2,_143,_163,_0.12)] w-fit flex items-center text-[#028fa3] text-center border border-[#028fa3] rounded-2xl cursor-pointer"
                              onClick={() =>
                                handlePageRedirect("/walletDetails")
                              }
                            >
                              <FontAwesomeIcon
                                icon={faWallet}
                                size="md"
                                style={{
                                  color: "#028fa3",
                                  backgroundColor: "rgba(2, 143, 163, 0.12)",
                                  padding: "10px",
                                  borderRadius: "30%",
                                  marginRight: "10px",
                                }}
                              />
                              <div className="flex-col w-fit">
                                <div className="text-xs sm:text-sm font-bold">
                                  Wallet
                                </div>
                                <div className="border border-b-0 border-[#028fa3]"></div>
                                <div className="text-xs sm:text-sm font-light text-nowrap">
                                  Rs. {walletBalance}{" "}
                                  <span
                                    className="text-[rgba(150,_163,_2,_1)] font-medium ml-2"
                                    onClick={() =>
                                      handlePageRedirect("/walletDetails")
                                    }
                                  >
                                    {/* Recharge */}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </li>
                        )}
                        <div
                          className="p-2 py-1 cursor-pointer lg:px-4 md:mx-2 text-white bg-[#028fa3] text-md text-center border border-solid border-[#028fa3] rounded-full"
                          onClick={handleOpenSideSheet}
                        >
                          {userInitials}
                        </div>
                      </div>
                    </ul>
                  </div>,
                  document.body,
                )}
              </>
            )}
          </div>
        </div>
      ) : (
        <div>
          <div className="flex justify-between p-2 py-2">
            <div className="w-2/12 sm:w-1/5 h-3/5 sm:h-1/5">
              <Image
                onClick={redirectBooking}
                src={corporateAdmin}
                alt="Company Logo"
                className="h-3/5 sm:h-1/5 mt-2 sm:!mt-0 -ml-1 sm:ml-0  cursor-pointer"
              />
            </div>
            <div className="flex gap-2 sm:gap-5 w-1/5 justify-center">
              <button
                className={`text-xxs sm:text-lg font-normal ${
                  isCurrentRoute("/corporate/aboutpage")
                    ? "text-[#028FA3] text-xl font-bold"
                    : "text-[#878786]"
                }`}
                onClick={() => handlePageRedirect("/corporate/aboutpage")}
              >
                <span className="inline-block pb-1 relative">
                  About
                  {isCurrentRoute("/corporate/aboutpage") && (
                    <span className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-[30px] border-b-2 border-[#028FA3]"></span>
                  )}
                </span>
              </button>
              <button
                className={`text-xxs sm:text-lg font-normal ${
                  isCurrentRoute("/corporate/solution")
                    ? "text-[#028FA3] text-xl font-bold"
                    : "text-[#878786]"
                }`}
                onClick={() => handlePageRedirect("/corporate/solution")}
              >
                <span className="inline-block pb-1 relative">
                  Solutions
                  {isCurrentRoute("/corporate/solution") && (
                    <span className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-[30px] border-b-2 border-[#028FA3]"></span>
                  )}
                </span>
              </button>
            </div>

            <div className="flex gap-1 sm:gap-3 w-fit sm:w-1/5 justify-end">
              {isAuthenticated && (
                <>
                  <div
                    className="p-2 lg:px-2 md:mx-2 bg-[rgba(2,_143,_163,_0.12)] w-fit flex items-center text-[#028fa3] text-center border border-[#028fa3] rounded-2xl cursor-pointer"
                    onClick={() => handlePageRedirect("/walletDetails")}
                  >
                    <FontAwesomeIcon
                      icon={faWallet}
                      size="md"
                      style={{
                        color: "#028fa3",
                        backgroundColor: "rgba(2, 143, 163, 0.12)",
                        padding: "10px",
                        borderRadius: "30%",
                        marginRight: "10px",
                      }}
                    />
                    <div className="flex-col w-fit">
                      <div className="text-sm font-bold">Wallet</div>
                      <div className="border border-b-0 border-[#028fa3]"></div>
                      <div className="text-sm font-light text-nowrap">
                        Rs. {walletBalance}{" "}
                        <span
                          className="text-[rgba(150,_163,_2,_1)] font-medium ml-2"
                          onClick={() => handlePageRedirect("/walletDetails")}
                        >
                          {/* Recharge */}
                        </span>
                      </div>
                    </div>
                  </div>
                </>
              )}
              <div className="flex gap-1 sm:gap-2 items-center">
                <div
                  className="flex flex-col items-center justify-center px-2 sm:px-3 py-2 text-[#028fa3] text-xxs sm:text-base text-center border border-solid border-[#028fa3] rounded-md cursor-pointer h-8 sm:h-fit"
                  onClick={switchToQugo}
                >
                  <span
                    className="leading-tight text-xxs mb-1"
                    style={{ textWrap: "nowrap" }}
                  >
                    Switch to
                  </span>
                  <Image
                    src={qugoLogo}
                    alt="Logo"
                    width={70}
                    className="w-6 sm:w-8 h-auto"
                  />
                </div>

                {!isAuthenticated ? (
                  <>
                    <button
                      className="w-fit px-2 sm:px-3 h-fit py-2 border border-[#878786] text-xxs sm:text-base rounded-md text-[#878786]"
                      onClick={() =>
                        handlePageRedirect("/corporate/loginPage/Login")
                      }
                    >
                      LOGIN
                    </button>
                    <button
                      className="w-fit px-2 sm:px-3 h-fit py-2 rounded-md text-xxs sm:text-base text-white bg-[#D5B300]"
                      onClick={() =>
                        handlePageRedirect("/corporate/loginPage/Signup")
                      }
                    >
                      SIGNUP
                    </button>

                    <ActivateModal
                      encodedData={id}
                      isOpen={isActivateModalVisible}
                      onClose={handleCloseActivateModal}
                      onSignup={handleOpenSignupModal}
                    />
                  </>
                ) : (
                  <div className="flex gap-3">
                    <button
                      className="w-fit px-2 sm:px-3 py-2 rounded-md text-xxs sm:text-base text-white bg-[#D5B300]"
                      onClick={redirectProfile}
                    >
                      BOOKING
                    </button>
                    <Link
                      href="/profile"
                      className="p-4 py-4 lg:px-4 md:mx-2 text-white bg-[#028fa3] text-sm font-medium text-center border border-solid border-[#028fa3] rounded-full"
                    >
                      {userDetails?.loggedInDetails?.userDetails?.firstName
                        ?.toUpperCase()
                        .charAt(0)}
                      {userDetails?.loggedInDetails?.userDetails?.lastName
                        ?.toUpperCase()
                        .charAt(0)}
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      <Popup
        open={isFlightPricePopupOpen}
        style={{ zIndex: 100000 }}
        overlayStyle={{ background: "rgba(0, 0, 0, 0.2)" }}
        contentStyle={{
          width: "50%",
          height: true ? "fit-content" : "250px",
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
          />
        </div>
      </Popup>
    </>
  );
};

export default Header;
