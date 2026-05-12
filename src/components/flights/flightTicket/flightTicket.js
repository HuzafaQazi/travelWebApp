import style from "./styles.module.css";

function FlightTicket() {
  return (
    <>
      <div className={style.fromToTiming}>
        <div
          style={{
            display: "flex",
            flexDirection: "row",
            justifyContent: "space-between",
            marginBottom: "-19px",
          }}
        >
          <div className={style.depRetDetails}>Departure Flight</div>
          <div className={style.Economy}>
            {outboundSegment?.[0]?.cabinClassName}
          </div>
          <div className={style.rightpartTicket1}>
            <span className={style.FareDetails1}>
              {/* faretype */}
              {flightData.flightsRequest?.searchReqData?.resultFareType ===
                "2" && "Regular Fares"}
              {flightData.flightsRequest?.searchReqData?.resultFareType ===
                "5" && "Senior Citizen"}
              {flightData.flightsRequest?.searchReqData?.resultFareType ===
                "3" && "Student"}
              {flightData.flightsRequest?.searchReqData?.resultFareType ===
                "4" && "Armed Forces"}
            </span>
          </div>
        </div>
        <div className={style.fromToTiming1}>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <span className={style.fromToTime}>
              {formatTime(outboundOrigin?.depTime)}
            </span>
            <span className={style.fromToCityName}>
              {outboundOrigin?.airport?.cityName}
            </span>
            <div className={style.fromToDate}>
              {formatDateWithDiv(outboundOrigin?.depTime, style)}
              {/* Fri, <span>July 16th</span> , 2023 */}
            </div>
          </div>

          <div className={style.btwLineContent}>
            <div className={style.dashLineText}>
              {/* {formatDuration(outboundDuration)}  */}
              {formatDuration(outJourneyDuration)}
            </div>
            <div className={style.dashLine}></div>
            <div className={style.dashLineText}>
              {flightData?.outboundFlightFareQuote?.segments?.[0]?.stops} Stop
            </div>
          </div>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              textAlign: "end",
              textWrap: "nowrap",
            }}
          >
            <span className={style.fromToTime}>
              {formatTime(outboundDestination?.arrTime)}
            </span>
            <span className={style.fromToCityName}>
              {outboundDestination?.airport?.cityName}
            </span>
            <div className={style.fromToDate}>
              {formatDateWithDiv(outboundDestination?.arrTime, style)}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default FlightTicket;
