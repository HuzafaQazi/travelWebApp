import React, { useState } from "react";
import Image from "next/image";
import { Collapse } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCaretDown, faCaretRight } from "@fortawesome/free-solid-svg-icons";
import briefcase from "@/images/briefcase.png";
import flight from "@/images/flight.png";
import hotel from "@/images/hotel.png";
import packages from "@/images/package.png";
import FlightBookings from "./FlightBookings";
import HotelBookings from "./HotelBookings";
import PackageBookings from "./PackageBookings";
import style from "./styles.module.css";

export default function BookingSection({
  userID,
  corporateUser,
  walletBalance,
  setParentLoader,
  onClose,
}) {
  const [isMyHotelBookingOpen, setIsMyHotelBookingOpen] = useState(false);
  const [isMyFlightBookingOpen, setIsMyFlightBookingOpen] = useState(false);
  const [isMyPackageBookingOpen, setIsMyPackageBookingOpen] = useState(false);

  return (
    <div className={style.listtile} alt="Unable to load list tile icon">
      <Image
        className={style.listtileicon}
        src={briefcase}
        alt="Unabel to load list tile icon"
      ></Image>
      <div className={style.listtilecontent}>
        <div className={style.listtiletitle}>My Booking </div>
        <div className={style.listtiledescription1}>
          Check the status of your booking
          <div
            className={style.listtilechild}
            alt="Unable to load list tile icon"
            onClick={() => {
              setIsMyFlightBookingOpen(!isMyFlightBookingOpen);
            }}
            aria-controls="example-collapse-text"
            aria-expanded={isMyFlightBookingOpen}
          >
            <Image
              className={style.listtileicon}
              src={flight}
              alt="Unabel to load list tile icon"
            ></Image>
            <div className={style.listtiletitlechild}>
              Flight
              <FontAwesomeIcon
                icon={isMyFlightBookingOpen ? faCaretDown : faCaretRight}
                color="white"
                style={{ fontSize: "20px", marginLeft: "8px" }}
              />
            </div>
          </div>
          <Collapse in={isMyFlightBookingOpen}>
            <div className={isMyFlightBookingOpen ? "visible" : "hidden"}>
              <FlightBookings
                userID={userID}
                corporateUser={corporateUser}
                walletBalance={walletBalance}
                setParentLoader={setParentLoader}
                onClose={onClose}
                isOpen={isMyFlightBookingOpen}
              />
            </div>
          </Collapse>
        </div>
        <div
          className={style.listtilechild}
          alt="Unable to load list tile icon"
          onClick={() => {
            setIsMyHotelBookingOpen(!isMyHotelBookingOpen);
          }}
          aria-controls="example-collapse-text"
          aria-expanded={isMyHotelBookingOpen}
        >
          <Image
            className={style.listtileicon}
            src={hotel}
            alt="Unabel to load list tile icon"
          ></Image>
          <div className={style.listtiletitlechild}>
            Hotel
            <FontAwesomeIcon
              icon={isMyHotelBookingOpen ? faCaretDown : faCaretRight}
              color="white"
              style={{ fontSize: "20px", marginLeft: "8px" }}
            />
          </div>
        </div>
        <Collapse in={isMyHotelBookingOpen}>
          <div className={isMyHotelBookingOpen ? "visible" : "hidden"}>
            <HotelBookings
              userID={userID}
              corporateUser={corporateUser}
              isOpen={isMyHotelBookingOpen}
            />
          </div>
        </Collapse>

        {/* {packages profile} */}
        <div
          className={style.listtilechild}
          alt="Unable to load list tile icon"
          onClick={() => {
            setIsMyPackageBookingOpen(!isMyPackageBookingOpen);
          }}
        >
          <Image
            className={style.listtileicon}
            src={packages}
            alt="Unable to load list tile icon"
          ></Image>
          <div className={style.listtiletitlechild}>
            Packages
            <FontAwesomeIcon
              icon={isMyPackageBookingOpen ? faCaretDown : faCaretRight}
              color="white"
              style={{ fontSize: "20px", marginLeft: "8px" }}
            />
          </div>
        </div>
        <Collapse in={isMyPackageBookingOpen}>
          <div className={isMyPackageBookingOpen ? "visible" : "hidden"}>
            <PackageBookings
              userID={userID}
              onClose={onClose}
              isOpen={isMyPackageBookingOpen}
            />
          </div>
        </Collapse>
      </div>
    </div>
  );
}
