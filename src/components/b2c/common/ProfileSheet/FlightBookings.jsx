import React, { useState, useEffect } from "react";
import { Nav, Tab } from "react-bootstrap";
import { getFlightBookingList } from "@/utils/profileAPI";
import MyBookingListItem1 from "@/components/flightBookingList/mybookinglistitem";
import Loader from "@/components/loader/loader";
import style from "./styles.module.css";

export default function FlightBookings({
  // userID,
  corporateUser,
  walletBalance,
  setParentLoader,
  onClose,
  isOpen,
}) {
  const [allBooking, setAllBooking] = useState([]);
  const [reservedBooking, setReservedBooking] = useState([]);
  const [completedBooking, setCompletedBooking] = useState([]);
  const [confirmedBooking, setConfirmedBooking] = useState([]);
  const [cancelledBooking, setCancelledBooking] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen ) {
      getFlightBookingData("all");
    }
  }, [isOpen]);

  const handleTab1Change = (eventKey) => {
    getFlightBookingData(eventKey);
  };

  const getFlightBookingData = async (status) => {
    try {
      setLoading(true);
      const bookingListResp = await getFlightBookingList(
        // userID,
        status,
        corporateUser
      );

      await updateFlightBookingList(status, bookingListResp.data);
    } catch (error) {
      console.error("Error occurred while fetching booking data", error);
    } finally {
      setLoading(false);
    }
  };

  const updateFlightBookingList = async (status, bookings) => {
    switch (status) {
      case "all":
        setAllBooking(bookings);
        break;
      case "Reserved":
        setReservedBooking(bookings);
        break;
      case "Confirmed":
        setConfirmedBooking(bookings);
        break;
      case "Cancelled":
        setCancelledBooking(bookings);
        break;
      case "Completed":
        setCompletedBooking(bookings);
        break;
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
        <Tab.Container defaultActiveKey="all" onSelect={handleTab1Change}>
          <Nav variant="tabs" fill className={style.customNav}>
            <Nav.Item>
              <Nav.Link eventKey="all" className={style.customnavlink}>
                All
              </Nav.Link>
            </Nav.Item>

            <Nav.Item>
              <Nav.Link eventKey="Confirmed" className={style.customnavlink}>
                UPCOMING FLIGHTS
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
                  {allBooking?.length > 0 ? (
                    <div className={style.myBookingListContainer}>
                      {allBooking.slice().map((booking) => (
                        <MyBookingListItem1
                          key={booking.id}
                          booking={booking}
                          type="all"
                          walletBalance={walletBalance}
                          setParentLoader={setParentLoader}
                          onClose={onClose}
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
            <Tab.Pane eventKey="Confirmed">
              {loading ? (
                <Loader />
              ) : (
                <div>
                  {confirmedBooking != null && confirmedBooking.length > 0 ? (
                    <div className={style.myBookingListContainer}>
                      {confirmedBooking.slice().map((booking) => (
                        <MyBookingListItem1
                          key={booking.id}
                          booking={booking}
                          type="Confirmed"
                          walletBalance={walletBalance}
                          setParentLoader={setParentLoader}
                        />
                      ))}
                    </div>
                  ) : (
                    <div>
                      <div className={style.noBookingText}>
                        <p>You currently have no Upcoming flight bookings</p>
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
                  {reservedBooking != null && reservedBooking.length > 0 ? (
                    <div className={style.myBookingListContainer}>
                      {reservedBooking.slice().map((booking) => (
                        <MyBookingListItem1
                          key={booking.id}
                          booking={booking}
                          type="Reserved"
                          walletBalance={walletBalance}
                          setParentLoader={setParentLoader}
                        />
                      ))}
                    </div>
                  ) : (
                    <div>
                      <div className={style.noBookingText}>
                        <p>You currently have no Reserved bookings</p>
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
                  {completedBooking != null && completedBooking.length > 0 ? (
                    <div className={style.myBookingListContainer}>
                      {completedBooking.map((booking) => (
                        <MyBookingListItem1
                          key={booking.id}
                          booking={booking}
                          type="Completed"
                          walletBalance={walletBalance}
                          setParentLoader={setParentLoader}
                        />
                      ))}
                    </div>
                  ) : (
                    <div>
                      <div className={style.noBookingText}>
                        <p>You currently have no Completed bookings</p>
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
                  {cancelledBooking != null && cancelledBooking.length > 0 ? (
                    <div className={style.myBookingListContainer}>
                      {cancelledBooking.map((booking) => (
                        <MyBookingListItem1
                          key={booking.id}
                          booking={booking}
                          type="Cancelled"
                          walletBalance={walletBalance}
                          setParentLoader={setParentLoader}
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
          </Tab.Content>
        </Tab.Container>
      </div>
    </div>
  );
}
