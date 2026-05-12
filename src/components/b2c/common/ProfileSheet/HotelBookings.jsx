// components/ProfileSheet/HotelBookings.jsx
import React, { useState, useEffect } from "react";
import { Nav, Tab } from "react-bootstrap";
import { getBookingList } from "@/utils/profileAPI";
import MyBookingListItem from "@/components/mybookinglistitem/mybookinglistitem";
import Loader from "@/components/loader/loader";
import style from "./styles.module.css";

export default function HotelBookings({ userID, corporateUser, isOpen }) {
  const [allBookings, setAllBookings] = useState([]);
  const [reservedBookings, setReservedBookings] = useState([]);
  const [completedBookings, setCompletedBookings] = useState([]);
  const [confirmedBookings, setConfirmedBookings] = useState([]);
  const [cancelledBookings, setCancelledBookings] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && userID) {
      getBookingData("all");
    }
  }, [isOpen, userID]);

  const handleTabChange = (eventKey) => {
    getBookingData(eventKey);
  };

  const getBookingData = async (status) => {
    try {
      setLoading(true);
      const bookingListResp = await getBookingList(
        userID,
        status,
        corporateUser
      );

      await updateBookingList(status, bookingListResp.data);
    } catch (error) {
      console.log("Error occurred", error);
    } finally {
      setLoading(false);
    }
  };

  const updateBookingList = async (status, bookings) => {
    switch (status) {
      case "all":
        setAllBookings(bookings);
        break;
      case "Reserved":
        setReservedBookings(bookings);
        break;
      case "Confirmed":
        setConfirmedBookings(bookings);
        break;
      case "Cancelled":
        setCancelledBookings(bookings);
        break;
      case "Completed":
        setCompletedBookings(bookings);
        break;
    }
  };

  return (
    <div
      className={style.roundedTwo}
      style={{
        backgroundColor: "#028FA3",
        padding: "40px",
        width: "120%",
      }}
    >
      <div
        className={style.borderradius}
        style={{
          backgroundColor: "white",
          borderRadius: "10px",
        }}
      >
        <Tab.Container defaultActiveKey="all" onSelect={handleTabChange}>
          <Nav variant="tabs" fill>
            <Nav.Item>
              <Nav.Link eventKey="all" className={style.customnavlink}>
                All
              </Nav.Link>
            </Nav.Item>
            <Nav.Item>
              <Nav.Link eventKey="Reserved" className={style.customnavlink}>
                RESERVED
              </Nav.Link>
            </Nav.Item>
            <Nav.Item>
              <Nav.Link eventKey="Confirmed" className={style.customnavlink}>
                CONFIRMED
              </Nav.Link>
            </Nav.Item>
            <Nav.Item>
              <Nav.Link eventKey="Cancelled" className={style.customnavlink}>
                CANCELLED
              </Nav.Link>
            </Nav.Item>
            <Nav.Item>
              <Nav.Link eventKey="Completed" className={style.customnavlink}>
                COMPLETED
              </Nav.Link>
            </Nav.Item>
          </Nav>
          <Tab.Content>
            <Tab.Pane eventKey="all">
              {loading ? (
                <Loader />
              ) : (
                <div className={style.myHotelDropdownTab}>
                  {allBookings?.length > 0 ? (
                    <div className={style.myBookingListContainer}>
                      {allBookings.map((booking) => (
                        <MyBookingListItem
                          key={booking.id}
                          booking={booking}
                          type="all"
                        />
                      ))}
                    </div>
                  ) : (
                    <div>
                      <div className={style.noBookingText}>
                        <p>You currently have no recent bookings</p>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </Tab.Pane>
            <Tab.Pane eventKey="Reserved">
              {loading ? (
                <Loader />
              ) : (
                <div>
                  {reservedBookings != null && reservedBookings.length > 0 ? (
                    <div className={style.myBookingListContainer}>
                      {reservedBookings.map((booking) => (
                        <MyBookingListItem
                          key={booking.id}
                          booking={booking}
                          type="Reserved"
                        />
                      ))}
                    </div>
                  ) : (
                    <div>
                      <div className={style.noBookingText}>
                        <p>You currently have no reserved bookings</p>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </Tab.Pane>
            <Tab.Pane eventKey="Confirmed">
              {loading ? (
                <Loader />
              ) : (
                <div>
                  {confirmedBookings != null && confirmedBookings.length > 0 ? (
                    <div className={style.myBookingListContainer}>
                      {confirmedBookings.map((booking) => (
                        <MyBookingListItem
                          key={booking.id}
                          booking={booking}
                          type="Confirmed"
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
            <Tab.Pane eventKey="Cancelled">
              {loading ? (
                <Loader />
              ) : (
                <div>
                  {cancelledBookings != null && cancelledBookings.length > 0 ? (
                    <div className={style.myBookingListContainer}>
                      {cancelledBookings.map((booking) => (
                        <MyBookingListItem
                          key={booking.id}
                          booking={booking}
                          type="Cancelled"
                        />
                      ))}
                    </div>
                  ) : (
                    <div>
                      <div className={style.noBookingText}>
                        <p>You currently have no cancelled bookings</p>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </Tab.Pane>
            <Tab.Pane eventKey="Completed">
              {loading ? (
                <Loader />
              ) : (
                <div>
                  {completedBookings != null && completedBookings.length > 0 ? (
                    <div className={style.myBookingListContainer}>
                      {completedBookings.map((booking) => (
                        <MyBookingListItem
                          key={booking.id}
                          booking={booking}
                          type="Completed"
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
          </Tab.Content>
        </Tab.Container>
      </div>
    </div>
  );
}
