import style from "./styles.module.css";
import Image from "next/image";
import { useEffect } from "react";
import { useState } from "react";
import headLogo from "../../../../public/img/Qugo Logo resize 2-01.png";
import qugoLogo from "../../../../public/img/Qugo Logo white-01 2 2.png";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUser } from "@fortawesome/free-solid-svg-icons";
import config from "@/config";
import { Button } from "react-bootstrap";
import { fetchUserIp } from "../../../../utils/fetchUserIP";
import axios, {
  getTabSpecificData,
  removeTabSpecificData,
} from "@/utils/axios/axios";
import Signin from "@/pages/login";
import { useRouter } from "next/router";
import { Modal } from "react-bootstrap";
import { Nav, Tab, Form } from "react-bootstrap";
import Popup from "reactjs-popup";
import { useLogin } from "@/store/context/LoginContext";
import FlightsPriceChangedPopup from "@/components/pricechangedpopup/flightspricechangedpopup";
import walletImg from "../../../../public/img/wallet.png";
import LoginModal from "@/components/PosiflexLogin/LoginOtp";
import corporate from "../../../../public/img/Qugo Corporate black.png";
import { switchToCorporate } from "@/utils/common";
import { useWalletBalance } from "@/hooks/useWalletBalance";
export default function CommonHeader(props) {
  const {
    isOpen,
    closePopup,
    openPopup,
    showLoginButton,
    setShowLoginButton,
    userName,
    isFlightPricePopupOpen,
    openFlightPricePopup,
    closeFlightPricePopup,
    flightOldPrice,
    flightNewPrice,
    isPosiflexLoginModalVisible,
    setIsPosiflexLoginModalVisible,
    activeProfile,
  } = useLogin();

  const { walletBalance } = useWalletBalance();
  const [storedAccessToken, setStoredAccessToken] = useState("");
  const [showModal, setShowModal] = useState(false);
  const router = useRouter();

  const [popupStyle, setPopupStyle] = useState({ width: "65%" });
  const [popupStyle1, setPopupStyle1] = useState({ width: "95%" });
  const [popupStylings, setPopupStylings] = useState({ width: "50%" });
  const [posiflexButtonLoading, setPosiflexButtonLoading] = useState(false);

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

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  const handleCloseLoginModal = () => {
    setIsPosiflexLoginModalVisible(false);
  };

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

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  useEffect(() => {
    let accessToken = getTabSpecificData("accessToken");
    const fetchData = async () => {
      try {
        let userip = await fetchUserIp();
      } catch (error) {
        console.error("Error fetching user's IP:", error);
      }
    };

    fetchData();
    setStoredAccessToken(accessToken);
    if (accessToken) {
      setShowLoginButton(false);
    }
  }, []);

  const [isHomePage, setIsHomePage] = useState(false);
  useEffect(() => {
    // Check if running on the client
    if (typeof window !== "undefined") {
      setIsHomePage(window.location.pathname === "/CIT-95");
    }
  }, []);

  const isCareersPage = router.pathname === "/corporate/Careers";

  const handleOpenLoginModal = async () => {
    const isRegistered = getTabSpecificData("eventRegistered");
    const userId = getTabSpecificData("userID");

    if (!userId) {
      // User ID is not available, show login modal
      setIsPosiflexLoginModalVisible(true);
      // openPopup();
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

  async function getEventRegisteredDetails() {
    const userId = getTabSpecificData("userID");
    try {
      const response = await axios.get(
        `${config.EVENTS_REGISTRATION_DETAILS}?user_id=${userId}`
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  const goToProfile = () => {
    router.push("/profile");
  };

  const goToWalletDetails = () => {
    router.push("/walletDetails");
  };

  const goToHome = () => {
    router.push("/");
  };

  return (
    <>
      <div className={style.header}>
        <div className={style.qugoLogo}>
          <Image
            className={style.qugoHeaderLogo}
            src={headLogo}
            alt="headLogo"
            onClick={goToHome}
          />
        </div>
        {/* <div> */}

        <div className={style.walletContainerHead}>
          {!isCareersPage && (
            <>
              {!showLoginButton ? (
                <div
                  className={style.walletHeaderContainer}
                  onClick={goToWalletDetails}
                >
                  <div className={style.walletContainer}>
                    <div className={style.innerContainer}>
                      <Image
                        className={style.walletLogo}
                        src={walletImg}
                        alt="walletImg"
                      />
                      <div className={style.walletInfo}>
                        <div className={style.walletLabel}>Wallet</div>
                        <div className={style.walletdiv}>
                          <div className={style.walletAmount}>
                            Rs .{walletBalance}{" "}
                          </div>
                          <span
                            className={style.rechargeLink}
                            onClick={goToWalletDetails}
                          >
                            Recharge
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <></>
              )}
            </>
          )}
          {!isCareersPage && (
            <button
              className={style.switchContainer}
              onClick={switchToCorporate}
            >
              <span className={style.switch}>Switch to</span>
              <Image
                className={style.CorpLogo}
                src={corporate}
                alt="qugoLogo"
              />
            </button>
          )}

          <div
            className="bg-[#028fa3] text-white p-3 text-lg cursor-pointer mx- items-center rounded-lg shadow-md"
            onClick={handleOpenLoginModal}
          >
            Event
          </div>

          <div className={style.loginNavbar}>
            {
              // storedAccessToken ? (
              showLoginButton ? (
                <Button className={style.loginbutton} onClick={openPopup}>
                  Login
                </Button>
              ) : (
                <div className={style.logindiv} onClick={goToProfile}>
                  <div className={style.loginText}>
                    <div className={style.loginText1}>
                      Hey, {userName !== "" ? `${userName}` : "User"}
                    </div>
                    <FontAwesomeIcon
                      icon={faUser}
                      style={{ marginLeft: "5px" }}
                    />
                  </div>
                </div>
              )
            }
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
        closeOnDocumentClick
        lockScroll
      >
        <div className={style.loginPopup}>
          <button className={style.closeButton} onClick={closePopup}>
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
            {...props}
          />
        </div>
      </Popup>

      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header className={style.modalheader}>
          <div className={style.modalheaderimagediv}>
            <Image
              src={qugoLogo}
              className={style.modalheaderlogo}
              alt="Unable to load Qugo logo"
            />
          </div>
          <div>Offers</div>
          <div className={style.modaltitle}>Hey, User</div>
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
                  <Nav.Link eventKey="profile" className={style.customnavlink}>
                    Profile Details
                  </Nav.Link>
                </Nav.Item>
                <Nav.Item>
                  <Nav.Link eventKey="company" className={style.customnavlink}>
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
