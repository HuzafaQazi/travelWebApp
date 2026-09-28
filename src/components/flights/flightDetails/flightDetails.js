import {
  faArrowRight,
  faBagShopping,
  faSuitcaseRolling,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import style from "./styles.module.css";
import React, { useEffect } from "react";
import Image from "next/image";

const FlightDetails = ({ onClose, handleTabClick, fareQuote }) => {
  const formatTime = (isoTimeString) => {
    const date = new Date(isoTimeString);
    const hours = date.getHours().toString().padStart(2, "0");
    const minutes = date.getMinutes().toString().padStart(2, "0");
    return `${hours}:${minutes}`;
  };

  // Format duration in the format "1 hr 30 mins"
  const formatDuration = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;

    const hoursText = hours > 0 ? `${hours} hr` : "";
    const minutesText = remainingMinutes > 0 ? ` ${remainingMinutes} mins` : "";

    return `${hoursText}${minutesText}`;
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const options = {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric",
    };
    return date.toLocaleDateString("en-US", options);
  };

  const formatLayoverTime = (layoverTime) => {
    let layoverTimeInHours = layoverTime / 60;
    const hours = Math.floor(layoverTimeInHours);
    const minutes = Math.round((layoverTimeInHours - hours) * 60);

    const formattedTime = [];
    if (hours > 0) {
      formattedTime.push(`${hours} ${hours === 1 ? "hr" : "hrs"}`);
    }
    if (minutes > 0) {
      formattedTime.push(`${minutes} ${minutes === 1 ? "min" : "mins"}`);
    }

    return formattedTime.join(" ");
  };

  useEffect(() => {
    // Add a class to the body element to disable scrolling
    document.body.style.overflow = "hidden";

    // Remove the class when the component is unmounted or closed
    return () => {
      document.body.style.overflow = "visible";
    };
  }, []);

  return (
    <div className={style.Date1}>
      <div className={style.flightFareHeads}>
        <div className={style.flightFareDetailsHead}>
          <span className={style.flightFareDetailsActive}>Flight Details</span>
        </div>
        <div className={style.flightDetailsContainer}>
          {fareQuote?.segments[0]?.segment?.map((segment, segmentIndex) => (
            <React.Fragment key={segmentIndex}>
              <div className={style.flightDetailsCard} key={segmentIndex}>
                <div className={style.citiesRefund}>
                  <div
                    style={{
                      display: "flex",
                      gap: "10px",
                      alignItems: "center",
                    }}
                  >
                    <span className={style.city1}>
                      {segment.origin.airport.cityName}
                    </span>
                    <FontAwesomeIcon icon={faArrowRight} />
                    <span className={style.city1}>
                      {segment.destination.airport.cityName}
                    </span>
                  </div>
                  <span className={style.city1}>
                    {fareQuote.isRefundable ? "REFUNDABLE" : "NON REFUNDABLE"}{" "}
                  </span>
                </div>
                <div className={style.flightDetailsCardContent}>
                  <div className={style.airlinesLogoClass}>
                    <div style={{ display: "flex", gap: "10px" }}>
                      {/* <FontAwesomeIcon icon={faPlaneUp} color="#155EEF" /> */}
                      <Image
                        src={segment.airline.airlineLogoUrl}
                        alt={segment.airline.airlineName}
                        width={30}
                        height={30}
                      />
                      <div style={{ display: "flex", flexDirection: "column" }}>
                        <span>{segment.airline.airlineName}</span>
                        <div
                          style={{
                            color: "#878786",
                            lineHeight: "1",
                            fontSize: "10px",
                          }}
                        >
                          {segment.airline.airlineCode}-
                          {segment.airline.flightNumber}
                        </div>
                      </div>
                      <div style={{ color: "#878786" }}></div>
                    </div>
                    <span className={style.city1}>
                      {segment.cabinClassName}
                    </span>
                  </div>
                  <div className={style.fromToTiming}>
                    <div style={{ display: "flex", flexDirection: "column" }}>
                      <span className={style.fromToTime}>
                        {formatTime(segment?.origin?.depTime)}
                      </span>
                      <span className={style.fromToCityName}>
                        {segment?.origin?.airport?.cityName}(
                        {segment?.origin?.airport?.cityCode})
                      </span>
                      <span className={style.flightDetailsCardDate}>
                        {formatDate(segment?.origin?.depTime)}
                      </span>
                    </div>
                    <div className={style.btwLineContent}>
                      <div className={style.dashLineText}>
                        {formatDuration(segment?.duration)}
                      </div>
                      <div className={style.dashLine}></div>
                    </div>
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        textAlign: "right",
                      }}
                    >
                      <span className={style.fromToTime}>
                        {formatTime(segment?.destination?.arrTime)}
                      </span>
                      <span className={style.fromToCityName}>
                        {segment?.destination?.airport?.cityName}(
                        {segment?.destination?.airport?.cityCode})
                      </span>
                      <span className={style.flightDetailsCardDate}>
                        {formatDate(segment?.destination?.arrTime)}
                      </span>
                    </div>
                  </div>
                  <div className={style.flightDetailsAirports}>
                    <div style={{ width: "35%", color: "#878786" }}>
                      {segment?.origin?.airport?.airportName},{" "}
                      {segment?.origin?.countryName}
                      <br />
                      <span style={{ color: "#155EEF" }}>
                        Terminal {segment?.origin?.airport?.terminal}
                      </span>
                    </div>
                    <div
                      style={{
                        alignSelf: "end",
                        color: "#878786",
                        width: "35%",
                        textAlign: "end",
                      }}
                      className={style.lastindex}
                    >
                      {segment?.destination?.airport?.airportName},{" "}
                      {segment?.destination?.countryName}
                      <br />
                      <span style={{ color: "#155EEF" }}>
                        Terminal {segment?.destination?.airport?.terminal}
                      </span>
                    </div>
                  </div>
                  {(segment?.cabinBaggage || segment?.baggage) && (
                    <div className={style.baggageDetails}>
                      {segment?.cabinBaggage && (
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "8px",
                          }}
                        >
                          <div>
                            <FontAwesomeIcon
                              icon={faBagShopping}
                              fontSize={15}
                              color={"#155EEF"}
                            />
                          </div>
                          <div
                            style={{
                              color: "#878786",
                              display: "flex",
                              flexDirection: "column",
                            }}
                          >
                            Cabbin Baggage
                            <span
                              style={{ color: "#000000", fontSize: "15px" }}
                            >
                              {segment?.cabinBaggage}
                            </span>
                          </div>
                        </div>
                      )}
                      {segment?.baggage && (
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "8px",
                          }}
                        >
                          <div>
                            <FontAwesomeIcon
                              icon={faSuitcaseRolling}
                              fontSize={15}
                              color={"#155EEF"}
                            />
                          </div>
                          <div
                            style={{
                              color: "#878786",
                              display: "flex",
                              flexDirection: "column",
                            }}
                          >
                            Checkin Baggage
                            <span
                              style={{ color: "#000000", fontSize: "15px" }}
                            >
                              {segment?.baggage}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
              {segmentIndex < fareQuote?.segments[0]?.segment?.length - 1 && (
                <div className={style.layoverDetails}>
                  Layover - {segment?.destination?.airport?.cityName}{" "}
                  {formatLayoverTime(segment?.destination?.layoverTime)}
                </div>
              )}
            </React.Fragment>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FlightDetails;
