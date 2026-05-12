import React, { useState, useEffect } from "react";
import { Nav, Tab } from "react-bootstrap";
import { getPackagesBookingList } from "@/utils/profileAPI";
import BookingList from "@/components/packages/bookings/bookinglist";
import Loader from "@/components/loader/loader";
import style from "./styles.module.css";

export default function PackageBookings({ userID, onClose, isOpen }) {
  const [packagesBookingData, setPackagesBookingData] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && userID) {
      getPackagesBookedData(1);
    }
  }, [isOpen, userID]);

  const handlePackageTabChange = (eventKey) => {
    getPackagesBookedData(eventKey);
  };

  const getPackagesBookedData = async (type) => {
    try {
      setLoading(true);
      const bookingListResp = await getPackagesBookingList(userID, type);
      if (bookingListResp.status) {
        setPackagesBookingData(bookingListResp.data);
      }
    } catch (error) {
      console.log("Error occurred", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className={style.roundedTw}
      style={{
        backgroundColor: "#028FA3",
        padding: "40px",
        width: "120%",
      }}
    >
      <div
        style={{
          backgroundColor: "white",
          borderRadius: "10px",
          padding: "20px",
        }}
      >
        <Tab.Container defaultActiveKey="1" onSelect={handlePackageTabChange}>
          <Nav variant="tabs" fill className={style.customNav}>
            <Nav.Item>
              <Nav.Link eventKey="1" className={style.customnavlink}>
                All
              </Nav.Link>
            </Nav.Item>
            <Nav.Item>
              <Nav.Link eventKey="2" className={style.customnavlink}>
                CONFIRMED
              </Nav.Link>
            </Nav.Item>
            <Nav.Item>
              <Nav.Link eventKey="3" className={style.customnavlink}>
                COMPLETED
              </Nav.Link>
            </Nav.Item>
          </Nav>
          <Tab.Content>
            <Tab.Pane eventKey="1">
              {loading ? (
                <Loader />
              ) : (
                <div className={style.myHotelDropdownTab}>
                  {packagesBookingData?.length > 0 ? (
                    <div className={style.myBookingListContainer}>
                      {packagesBookingData.map((booking) => (
                        <BookingList
                          key={booking.id}
                          booking={booking}
                          type="all"
                          onClose={onClose}
                        />
                      ))}
                    </div>
                  ) : (
                    <div>
                      <div className={style.noBookingText}>
                        <p>You currently have no recents bookings</p>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </Tab.Pane>
            <Tab.Pane eventKey="2">
              {loading ? (
                <Loader />
              ) : (
                <div>
                  {packagesBookingData.length > 0 ? (
                    <div className={style.myBookingListContainer}>
                      {packagesBookingData.map((booking) => (
                        <BookingList
                          key={booking.id}
                          booking={booking}
                          type="confirmed"
                        />
                      ))}
                    </div>
                  ) : (
                    <div>
                      <div className={style.noBookingText}>
                        <p>You currently have no confirmed bookings</p>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </Tab.Pane>
            <Tab.Pane eventKey="3">
              {loading ? (
                <Loader />
              ) : (
                <div>
                  {packagesBookingData.length > 0 ? (
                    <div className={style.myBookingListContainer}>
                      {packagesBookingData.map((booking) => (
                        <BookingList
                          key={booking.id}
                          booking={booking}
                          type="completed"
                        />
                      ))}
                    </div>
                  ) : (
                    <div>
                      <div className={style.noBookingText}>
                        <p>You currently have no completed bookings</p>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </Tab.Pane>
          </Tab.Content>
        </Tab.Container>
      </div>
    </div>
  );
}
