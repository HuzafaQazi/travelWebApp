import Image from "next/image";
import "bootstrap/dist/css/bootstrap.css";
import style from "./styles.module.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSearch } from "@fortawesome/free-solid-svg-icons";
import qugologo from "../../images/qugoLogo.png";
import { Button } from "react-bootstrap";
import { useState } from "react";
import Popup from "reactjs-popup";
import Signin from "@/pages/login";
import props from "prop-types";
import { Modal } from "react-bootstrap";
import qugoLogo1 from "../../images/qugoLogo1.png";
import { Nav, Tab, Form } from "react-bootstrap";

export default function HotelSearchShort() {
  const [isOpen, setIsOpen] = useState(false);
  const [showLoginButton, setShowLoginButton] = useState(true);
  const [showModal, setShowModal] = useState(false);

  const openPopup = () => {
    setShowLoginButton(false);
    setIsOpen(true);
  };

  const closePopup = () => {
    setIsOpen(false);
  };

  const openModal = () => {
    setShowModal(true);
  };

  return (
    <>
      <div>
        <div className={style.hotelSearchMainDiv}>
          <div className={style.container}>
            <div id={style.banner} className={style.topbanner}>
              <Image
                className={style.qugoLogo}
                src={qugologo}
                alt="Qugo Logo"
              />
              {showLoginButton ? (
                <Button className={style.loginbutton} onClick={openPopup}>
                  Login
                </Button>
              ) : (
                <div className={style.logindiv} onClick={openModal}>
                  <div
                    style={{
                      width: "30px",
                      height: "30px",
                      borderRadius: "50%",
                      background: "lightblue",
                    }}
                  ></div>
                  <div className={style.logintext}>Hey, User</div>
                </div>
              )}

              {/* This is the login popup/dialog */}
              <Popup
                open={isOpen}
                style={{ zIndex: 100000 }}
                contentStyle={{ width: "65%", height: "590px" }}
                onClose={closePopup}
              >
                <div>
                  <Signin closePopup={closePopup} {...props} />
                </div>
              </Popup>

              {/* This is the profile modal/dialog */}
              <Modal show={showModal} onHide={() => setShowModal(false)}>
                <Modal.Header /*closeButton*/ className={style.modalheader}>
                  <div className={style.modalheaderimagediv}>
                    <Image
                      src={qugoLogo1}
                      className={style.modalheaderlogo}
                      alt="Unable to load Qugo logo"
                    />
                  </div>
                  <div>Offers</div>
                  <div className={style.modaltitle}>Hey, Bhavya</div>
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
                          <Nav.Link
                            eventKey="profile"
                            className={style.customnavlink}
                          >
                            Profile Details
                          </Nav.Link>
                        </Nav.Item>
                        <Nav.Item>
                          <Nav.Link
                            eventKey="company"
                            className={style.customnavlink}
                          >
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
                            <input
                              type="text"
                              className="form-control"
                              id="lastName"
                            />
                          </div>
                          <div className="mb-3">
                            <label
                              htmlFor="mobileNumber"
                              className="form-label"
                            >
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
                            <input
                              type="email"
                              className="form-control"
                              id="email"
                            />
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

                    {/* ... modal content ... */}
                  </div>
                </Modal.Body>
              </Modal>
            </div>
          </div>
          <div className={`${style.container} ${style.search}`}>
            <div id="hotelSearch" className="hotelSearch">
              <div className={`container ${style.searchButtons}`}>
                <button
                  className={`${style.searchButton} ${style.searchHotelButton}`}
                >
                  Hotels
                </button>
                <button className={style.searchButton}>Flights</button>
                <button className={style.searchButton}>Packages</button>
              </div>
              <div className="container">
                <div className="row">
                  <div className="col-lg-12  align-items-stretch">
                    <div className={style.searchHotels}>
                      <div className="container">
                        <div className={`row ${style.tableRow}`}>
                          <div
                            className={`col-xl-4  align-items-stretch ${style.citySearch}`}
                          >
                            <div className="icon-box mt-4 mt-xl-0">
                              <i className="bx bx-cube-alt"></i>
                              <p className={style.searchHeadingFont}>
                                DESTINATION
                              </p>
                              <p className={style.cityName}>Vishakhapatnam</p>
                            </div>
                          </div>
                          <div
                            className={`col-xl-5  align-items-stretch ${style.citySearch}`}
                          >
                            <div className="row">
                              <div className="col-xl-6  align-items-stretch">
                                <div className="icon-box mt-2 mt-xl-0">
                                  <i className="bx bx-cube-alt"></i>
                                  <p className={style.searchHeadingFont}>
                                    CHECK-IN
                                  </p>
                                  <p className={style.searchDate}>
                                    12th April, 2023
                                  </p>
                                  <p className={style.searchDay}>Saturday</p>
                                </div>
                              </div>
                              <div className="col-xl-6  align-items-stretch">
                                <div className="icon-box mt-2 mt-xl-0">
                                  <i className="bx bx-cube-alt"></i>
                                  <p className={style.searchHeadingFont}>
                                    CHECK-OUT
                                  </p>
                                  <p className={style.searchDate}>
                                    18th April, 2023
                                  </p>
                                  <p className={style.searchDay}>Saturday</p>
                                </div>
                              </div>
                            </div>
                          </div>
                          <div className={`col-xl-3  align-items-stretch`}>
                            <div className="icon-box mt-4 mt-xl-0">
                              <i className="bx bx-cube-alt"></i>
                              <p className={style.searchHeadingFont}>
                                ROOMS & GUESTS
                              </p>
                              <p className={style.searchPax}>
                                1 Room | 2 Guests
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="container">
                        <div className={style.hotelSearchButton}>
                          <div>
                            <FontAwesomeIcon
                              className={style.hotelSearchIcon}
                              icon={faSearch}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
