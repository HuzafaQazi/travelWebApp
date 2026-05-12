import { useCallback } from "react";
import { useEffect, useRef } from "react";
import { useState } from "react";
import Image from "next/image";
import config from "@/config";
import { Button } from "react-bootstrap";
import { fetchUserIp } from "../../../utils/fetchUserIP";
import axios, {
  getTabSpecificData,
  removeTabSpecificData,
  setTabSpecificData,
} from "@/utils/axios/axios";
import Signin from "@/pages/login";
import styles from "./styles.module.css";
import qugoLogo from "../../../public/img/Qugo Logo white-01 2 2.png";
import corporate from "../../../public/img/Qugo Corporate black.png";
import profileLogo from "../../../src/images/profile.png";
import mobQugoLogo from "../../../public/img/Qugo Logo mobile.png";
import { useRouter } from "next/router";
import { Modal } from "react-bootstrap";
import { Nav, Tab, Form } from "react-bootstrap";
import props from "prop-types";
import Popup from "reactjs-popup";
import useLocalStorage from "@/hooks/useLocalStorage";
import { useLogin } from "@/store/context/LoginContext";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTimes, faWallet } from "@fortawesome/free-solid-svg-icons";
import LoginModal from "../PosiflexLogin/LoginOtp";
import { switchToCorporate } from "@/utils/common";
import { useWalletBalance } from "@/hooks/useWalletBalance";
import showToast from "@/utils/toast";

export default function HeaderCommon({ isAuthRequired = true }) {
  const {
    isOpen,
    closePopup,
    openPopup,
    showLoginButton,
    setShowLoginButton,
    userName,
    isPosiflexLoginModalVisible,
    setIsPosiflexLoginModalVisible,
    eventUserDetails,
    activeProfile,
  } = useLogin();

  console.log(showLoginButton);

  const { walletBalance } = useWalletBalance();

  const isInitialRender = useRef(true); // Track the initial render
  const [getUserDetails, setUserDetails] = useLocalStorage("userDetails");
  const [getAccessToken, setAccessToken] = useLocalStorage("accessToken");
  const [storedAccessToken, setStoredAccessToken] = useState("");
  const [loadedUserName, setLoadedUserName] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [posiflexButtonLoading, setPosiflexButtonLoading] = useState(false);
  const [isEffectInProgress, setIsEffectInProgress] = useState(false);
  const [isLoginButtonClicked, setIsLoginButtonClicked] = useState(false);

  // const [isSmallScreen, setIsSmallScreen] = useState(false);
  const router = useRouter();

  const [popupStyle, setPopupStyle] = useState({ width: "65%" });
  const [popupStyle1, setPopupStyle1] = useState({ width: "95%" });

  const [isHomePage, setIsHomePage] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setIsHomePage(window.location.pathname === "/CIT-95");
    }
  }, []);

  useEffect(() => {
    const handleResize = () => {
      const newStyle =
        window.innerWidth <= 550
          ? {
              position: "fixed",
              left: "0",
              bottom: "0",
              width: "100%",
              height: "55%",
              transition: "height 0.3s ease-in-out",
              borderRadius: "10px",
            }
          : {
              width: "65%",
              borderRadius: "10px",
            };

      setPopupStyle(newStyle);
      setPopupStyle1({
        ...newStyle,
        width: window.innerWidth <= 550 ? "100%" : "95%",
      });
    };

    handleResize();

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  useEffect(() => {
    // When the component mounts, check if a username is stored in localStorage
    const storedUserName = getTabSpecificData("userDetails");

    if (storedUserName) {
      setLoadedUserName(storedUserName);
    }
  }, []);

  const redirectToEvents = useCallback(async () => {
    if (isEffectInProgress) return;
    setIsEffectInProgress(true);
    const accessToken = getTabSpecificData("accessToken");
    if (accessToken) {
      const response = await getEventRegisteredDetails();
      if (response.data.id) {
        setIsPosiflexLoginModalVisible(false);
        return router.replace("/CIT-95");
      }
    }
    setIsPosiflexLoginModalVisible(true);
    setIsEffectInProgress(false);
  }, [isEffectInProgress, router, setIsPosiflexLoginModalVisible]);

  useEffect(() => {
    // Function to check if modal should be visible
    const checkModalVisibility = async () => {
      if (router.query.redirect === "events") {
        const accessToken = getTabSpecificData("accessToken"); // Check if user is authenticated
        if (accessToken) {
          // Check if event id exists in localStorage
          const isEventIdValid = await validateEventId();
          if (isEventIdValid) {
            setIsEffectInProgress(true);
            try {
              const response = await getEventRegisteredDetails(); // Fetch details if user is registered
              if (response.data.id) {
                setIsPosiflexLoginModalVisible(false); // Close modal if user is registered
                router.replace("/CIT-95"); // Redirect to events page
              } else {
                setIsPosiflexLoginModalVisible(true); // Show modal if user is not registered
              }
            } catch (error) {
              console.error(
                "Error fetching event registration details:",
                error,
              );
              showToast("info", "Error fetching event details");
            }
            setIsEffectInProgress(false);
          } else {
            // If no event id exists, decide your fallback behavior.
            // For example, you might simply show the modal.
            setIsPosiflexLoginModalVisible(true);
          }
        } else {
          setIsPosiflexLoginModalVisible(true);
        }
      }
    };

    // Check modal visibility on component mount
    checkModalVisibility();

    // Cleanup on unmount
    return () => {
      setIsPosiflexLoginModalVisible(false);
    };
  }, [router.query.redirect, isLoginButtonClicked]);

  const validateEventId = async () => {
    const storedEventId = getTabSpecificData("event_id");

    // if (!storedEventId) return false;
    if (!storedEventId) {
      clearEventData();
      return false;
    }

    try {
      // Fetch the current active event
      const response = await axios.get(`${config.EVENTS_ACTIVE_EVENT}`);

      if (response.data.status && response.data.data) {
        const activeEventId = response.data.data._id;

        // If stored event_id doesn't match active event_id, clear event-related data
        if (storedEventId !== activeEventId) {
          console.log(
            "Stored event_id doesn't match active event, clearing event data",
          );
          clearEventData();
          return false;
        }

        // Also check if event has ended (plus 1 day grace period)
        const eventEndDate = new Date(response.data.data.toDate);
        const gracePeriodDate = new Date(eventEndDate);
        gracePeriodDate.setDate(gracePeriodDate.getDate() + 1); // Add 1 day

        const currentDate = new Date();
        if (currentDate > gracePeriodDate) {
          console.log(
            "Event has ended (plus grace period), clearing event data",
          );
          clearEventData();
          return false;
        }

        return true; // Event ID is valid and event is still active
      }

      return false;
    } catch (error) {
      console.error("Error validating event ID:", error);
      return false;
    }
  };

  // Function to clear all event-related data
  const clearEventData = () => {
    const eventRelatedKeys = [
      "eventUserDetails",
      "event_id",
      "eventCleanupDate",
      "fcmToken",
      "eventRegistered",
      // Add any other event-related keys
    ];

    eventRelatedKeys.forEach((key) => removeTabSpecificData(key));
  };

  const handleOpenLoginModal = async () => {
    const userId = getTabSpecificData("userID");

    if (!userId) {
      clearEventData();
      // User ID is not available, show login modal
      setIsPosiflexLoginModalVisible(true);
      // openPopup();
      return;
    }

    setPosiflexButtonLoading(true);
    try {
      // First validate the stored event_id against active event
      const isEventIdValid = await validateEventId();

      if (!isEventIdValid) {
        // If event_id is invalid or event has ended, show login modal
        setIsPosiflexLoginModalVisible(true);
        return;
      }

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
    const eventId = getTabSpecificData("event_id");
    try {
      const response = await axios.get(
        `${config.EVENTS_REGISTRATION_DETAILS}?user_id=${userId}&event_id=${eventId}`,
      );

      if (response.data.status === true) {
        return response.data;
      } else {
        return { data: { id: null, status: false, data: null } };
      }
    } catch (error) {
      throw error;
    }
  }

  useEffect(() => {
    let accessToken = getTabSpecificData("accessToken");
    const fetchData = async () => {
      try {
        let userip = await fetchUserIp();
      } catch (error) {
        console.error("Error fetching user's IP:", error);
      }
    };

    fetchData(); // Invoke the async function immediately
    setStoredAccessToken(accessToken);
    if (accessToken) {
      setShowLoginButton(false);
    }
  }, [isAuthRequired, setShowLoginButton]);

  const goToProfile = () => {
    router.push("/profile");
  };

  const goToHome = () => {
    router.push("/");
  };

  const goToWalletDetails = () => {
    router.push("/walletDetails");
  };

  function updateUserName(details) {
    const userName = details.firstName;
    setTabSpecificData("userId", details.userId);
    setLoadedUserName(userName);
  }

  return (
    <>
      <div className={styles.headerContainer}>
        <div className={styles.mobileNav}>
          <span className={styles.menuIcon}>&#9776;</span>
        </div>

        <div className={styles.companyLogo}>
          <Image
            className={styles.qugoLogo}
            src={qugoLogo}
            alt="qugoLogo"
            onClick={goToHome}
          />
          <Image
            className={styles.mobLogo}
            src={mobQugoLogo}
            alt="mobqugoLogo"
            onClick={goToHome}
          />
        </div>

        <div
          className="gap-2 sm:gap-0"
          style={{ display: "flex", alignItems: "center" }}
        >
          <div
            className={styles.walletHeaderContainer}
            onClick={goToWalletDetails}
          >
            {!showLoginButton ? (
              <div className={styles.walletContainer}>
                <div className={styles.innerContainer}>
                  <FontAwesomeIcon
                    icon={faWallet}
                    className={styles.walletLogo}
                    color="white"
                  />
                  <div className={styles.walletInfo}>
                    <div className={styles.walletLabel}>Wallet</div>
                    <div className={styles.walletdiv}>
                      <div className={styles.walletAmount}>
                        Rs. {walletBalance}{" "}
                      </div>
                      <span
                        className={styles.rechargeLink}
                        onClick={goToWalletDetails}
                      >
                        Recharge
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <></>
            )}
          </div>

          <button
            className={styles.switchContainer}
            onClick={switchToCorporate}
          >
            <span className={styles.switch}>Switch to</span>
            <Image className={styles.CorpLogo} src={corporate} alt="qugoLogo" />
          </button>

          <div
            className="bg-[#028fa3] text-white p-[8px] cursor-pointer text-lg mx- items-center rounded-lg shadow-lg"
            onClick={handleOpenLoginModal}
          >
            Event
          </div>

          <div className={styles.DesktoprightNavPart}>
            {showLoginButton ? (
              <Button className={styles.loginbutton} onClick={openPopup}>
                Login
              </Button>
            ) : (
              <div className={styles.logindiv} onClick={goToProfile}>
                <div className={styles.logintext}>
                  Hey, {loadedUserName != "" ? `${loadedUserName}` : "User"}
                </div>
                <div className={styles.imagediv}>
                  <Image
                    className={styles.profileLogo}
                    src={profileLogo}
                    alt="profile Logo"
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

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
        closeOnDocumentClick={false}
        lockScroll
      >
        <div className={styles.loginPopup}>
          <button
            className={styles.closeButton}
            onClick={closePopup}
            tabIndex="-1"
          >
            <FontAwesomeIcon icon={faTimes} />
          </button>
          <Signin
            updateUserName={updateUserName}
            setIsLoginButtonClicked={setIsLoginButtonClicked}
            closePopup={closePopup}
            {...props}
          />
        </div>
      </Popup>

      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header /*closeButton*/ className={styles.modalheader}>
          <div className={styles.modalheaderimagediv}>
            <Image
              src={qugoLogo}
              className={styles.modalheaderlogo}
              alt="Unable to load Qugo logo"
            />
          </div>
          <div>Offers</div>
          <div className={styles.modaltitle}>Hey, User</div>
        </Modal.Header>
        <Modal.Body
          className="rounded"
          style={{ backgroundColor: "#028FA3", padding: "40px" }}
        >
          <div
            style={{
              backgroundColor: "white",
              borderRadius: "10px",
              padding: "20px",
            }}
          >
            <Tab.Container defaultActiveKey="profile">
              <Nav variant="tabs" fill>
                <Nav.Item>
                  <Nav.Link eventKey="profile" className={styles.customnavlink}>
                    Profile Details
                  </Nav.Link>
                </Nav.Item>
                <Nav.Item>
                  <Nav.Link eventKey="company" className={styles.customnavlink}>
                    Company Details
                  </Nav.Link>
                </Nav.Item>
              </Nav>
              <Tab.Content>
                <Tab.Pane eventKey="profile">
                  {/* Profile Details Elements */}
                  <div className="text-center mt-4">
                    <div
                      style={{
                        width: "120px",
                        height: "120px",
                        borderRadius: "50%",
                        background: "lightblue",
                        margin: "auto",
                      }}
                    ></div>
                  </div>

                  <div className="mb-3">
                    <label htmlFor="firstName" className="form-label">
                      First Name:
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      id="firstName"
                    />
                  </div>
                  <div className="mb-3">
                    <label htmlFor="lastName" className="form-label">
                      Last Name:
                    </label>
                    <input type="text" className="form-control" id="lastName" />
                  </div>
                  <div className="mb-3">
                    <label htmlFor="mobileNumber" className="form-label">
                      Mobile Number:
                    </label>
                    <input
                      type="tel"
                      className="form-control"
                      id="mobileNumber"
                    />
                  </div>
                  <div className="mb-3">
                    <label htmlFor="email" className="form-label">
                      Email Address:
                    </label>
                    <input type="email" className="form-control" id="email" />
                  </div>

                  <div className="text-center mt-4">
                    <button
                      className="btn btn-primary btn-rounded"
                      style={{
                        borderRadius: "50px",
                        backgroundColor: "#028FA3",
                        border: "none",
                        paddingLeft: "24px",
                        paddingRight: "24px",
                      }}
                      onClick={() => setShowModal(false)}
                    >
                      Save
                    </button>
                  </div>
                </Tab.Pane>
                <Tab.Pane eventKey="company">
                  {/* Company Details Elements */}
                  <Form>
                    <Form.Group controlId="companyName">
                      <Form.Label>Company Name</Form.Label>
                      <Form.Control type="text" />
                    </Form.Group>
                    <Form.Group controlId="companyAddress">
                      <Form.Label>Company Address</Form.Label>
                      <Form.Control type="text" />
                    </Form.Group>
                    {/* Add more company details elements */}
                  </Form>
                </Tab.Pane>
              </Tab.Content>
            </Tab.Container>
          </div>
        </Modal.Body>
      </Modal>
    </>
  );
}
