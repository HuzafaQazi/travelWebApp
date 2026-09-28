// components/Aircraft.js
import Image from "next/image";
import styles from "./seatMap.module.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faXmark } from "@fortawesome/free-solid-svg-icons";

function SeatMap({
  passenger,
  passengerIndex,
  seatsData,
  seatStopsData,
  seatStopsIndex,
  handlePassengerInputChange,
  handleSeatMapClose,
  setSeatsData,
  setSeatStopsIndex,
  ssrDestinationsData,
  ssrDestinationIndex,
  type,
  setSsrDestinationIndex,
  handleSeatsOpen,
}) {
  const handleSeatSelect = (seat) => {
    const isActiveSeat =
      passenger[passengerIndex].seatDynamic.length > 0 &&
      passenger[passengerIndex].seatDynamic[ssrDestinationIndex] &&
      passenger[passengerIndex].seatDynamic[ssrDestinationIndex][
        seatStopsIndex[ssrDestinationIndex]
      ] &&
      passenger[passengerIndex].seatDynamic[ssrDestinationIndex][
        seatStopsIndex[ssrDestinationIndex]
      ].code === seat.code;
    const prevSelectedSeatCode =
      passenger[passengerIndex].seatDynamic.length > 0 &&
      passenger[passengerIndex].seatDynamic[ssrDestinationIndex] &&
      passenger[passengerIndex].seatDynamic[ssrDestinationIndex][
        seatStopsIndex[ssrDestinationIndex]
      ] &&
      passenger[passengerIndex].seatDynamic[ssrDestinationIndex][
        seatStopsIndex[ssrDestinationIndex]
      ].code;
    const seatObj = !isActiveSeat ? seat : {};
    const seatDataCopy = [...seatsData[ssrDestinationIndex]];
    const updatedSeatsData = seatDataCopy.map((seatGroup) => {
      return {
        ...seatGroup,
        seats: seatGroup.seats.map((s) =>
          s.code === prevSelectedSeatCode
            ? { ...s, availablityType: 1 }
            : s.code === seat.code
            ? { ...s, availablityType: 3 }
            : s
        ),
      };
    });
    setSeatsData((prev) => ({
      ...prev,
      [ssrDestinationIndex]: updatedSeatsData,
    }));
    handlePassengerInputChange(passengerIndex, "seat", seatObj);
  };

  const handleChangeStops = (stop, index) => {
    setSeatStopsIndex({ [ssrDestinationIndex]: index });
  };

  const handleChangeSsrDestination = (destination, index) => {
    handleSeatsOpen(passengerIndex, index);
  };

  const selectedStop =
    seatStopsData[ssrDestinationIndex][seatStopsIndex[ssrDestinationIndex]];

  const updatedSeatStopsData = seatStopsData[ssrDestinationIndex];

  const updatedSeatsData = seatsData[ssrDestinationIndex];

  const tableData = [
    { status: "Unoccupied", color: "white" },
    { status: "Reserved", color: "yellow" },
    { status: "Occupied", color: "grey" },
    { status: "Selected", color: "#155EEF" },
  ];

  return (
    <>
      <div className={styles.mobileDesign}>
        <div className={styles.BackBtnContainer}>
          <button onClick={handleSeatMapClose} className={styles.BackBtn}>
            <FontAwesomeIcon icon={faXmark} />
          </button>
        </div>
        {passenger[passengerIndex].seatDynamic.length > 0 &&
          passenger[passengerIndex].seatDynamic?.[ssrDestinationIndex] &&
          passenger[passengerIndex].seatDynamic?.[ssrDestinationIndex]?.[
            seatStopsIndex?.[ssrDestinationIndex]
          ] && (
            <div style={{ marginLeft: "2%", marginBottom: "1%" }}>
              <h4>Seat details</h4>
              <span style={{ fontWeight: "bold" }}>
                Seat number :{" "}
                <span style={{ fontWeight: "normal", color: "#155EEF" }}>
                  {
                    passenger[passengerIndex].seatDynamic?.[
                      ssrDestinationIndex
                    ][seatStopsIndex?.[ssrDestinationIndex]]?.code
                  }
                </span>
              </span>
              <br />
              <span style={{ fontWeight: "bold" }}>
                Price :{" "}
                <span style={{ fontWeight: "normal", color: "#155EEF" }}>
                  {
                    passenger[passengerIndex].seatDynamic[ssrDestinationIndex][
                      seatStopsIndex[ssrDestinationIndex]
                    ].price
                  }
                </span>
              </span>
            </div>
          )}

        {ssrDestinationsData.length > 0 &&
          ssrDestinationsData.map((destination, index) => (
            <button
              className={
                index === ssrDestinationIndex
                  ? styles.selectedStopActive
                  : styles.selectedStopNon
              }
              style={{ marginBottom: "10px", width: "30%" }}
              onClick={() => handleChangeSsrDestination(destination, index)}
              key={index}
            >{`${destination.value}`}</button>
          ))}
        <br />
        {updatedSeatStopsData.map((stop, index) => (
          <button
            className={
              index === seatStopsIndex[ssrDestinationIndex]
                ? styles.selectedStopActive
                : styles.selectedStopNon
            }
            onClick={() => handleChangeStops(stop, index)}
            key={index}
          >{`${stop.origin}-${stop.destination}`}</button>
        ))}

        <div
          style={{
            display: "flex",
            flexDirection: "row",
            justifyContent: "space-around",
          }}
        >
          {tableData.map((item, index) => (
            <div key={index} className={styles.seatGuide}>
              <div
                style={{
                  width: "20px",
                  height: "20px",
                  backgroundColor: item.color,
                  marginBottom: "5px",
                  border: "1px solid black",
                }}
              />
              <div>{item.status}</div>
            </div>
          ))}
        </div>
        <div className={styles.seatsContainer}>
          {updatedSeatsData.length > 0 ? (
            <div className={styles.aircraft}>
              <div className={styles["aircraft-body"]}>
                <div className={styles["top-left-exists"]}>
                  <Image
                    src="https://i.ibb.co/ftwgLCL/exist.png"
                    alt="Exists"
                    width={32}
                    height={32}
                  />
                </div>
                <div className={styles["top-right-exists"]}>
                  <Image
                    src="https://i.ibb.co/ftwgLCL/exist.png"
                    alt="Exists"
                    width={32}
                    height={32}
                  />
                </div>

                <div className={styles.seats}>
                  {updatedSeatsData.map((seatGroup, groupIndex) => (
                    <div
                      key={groupIndex}
                      className={`${styles["seats-triple"]} ${
                        groupIndex === 0 ? styles["first-line"] : ""
                      } ${
                        groupIndex === updatedSeatsData.length - 1
                          ? styles["last-line"]
                          : ""
                      }`}
                      data-line={groupIndex + 1}
                    >
                      {seatGroup.seats.map((seat, seatIndex) => {
                        const isAvailable =
                          seat.availablityType === 1 &&
                          selectedStop.origin === seat.origin &&
                          selectedStop.destination === seat.destination;
                        const isActiveSeat =
                          passenger?.[passengerIndex]?.seatDynamic?.length >
                            0 &&
                          passenger?.[passengerIndex]?.seatDynamic?.[
                            ssrDestinationIndex
                          ]?.[seatStopsIndex?.[ssrDestinationIndex]] &&
                          passenger?.[passengerIndex]?.seatDynamic?.[
                            ssrDestinationIndex
                          ]?.[seatStopsIndex?.[ssrDestinationIndex]]?.code ===
                            seat.code;
                        return (
                          <div
                            key={seatIndex}
                            className={`${styles.seat} ${
                              isActiveSeat ? styles.active : ""
                            } ${!isAvailable ? styles.empty : ""}`}
                            {...(groupIndex === 0 ||
                            groupIndex === updatedSeatsData.length - 1
                              ? { "data-letter": seat.seatNo }
                              : {})}
                            onClick={() =>
                              isAvailable || isActiveSeat
                                ? handleSeatSelect(seat)
                                : null
                            }
                          >
                            {seat.seatNo && (
                              <span
                                className={`${styles.price} ${
                                  isActiveSeat ? styles.priceActive : ""
                                }`}
                              >{`₹${seat.price}`}</span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  ))}
                </div>

                <div className={styles["bottom-left-exists"]}>
                  <Image
                    src="https://i.ibb.co/ftwgLCL/exist.png"
                    alt="Exists"
                    width={32}
                    height={32}
                  />
                </div>
                <div className={styles["bottom-right-exists"]}>
                  <Image
                    src="https://i.ibb.co/ftwgLCL/exist.png"
                    alt="Exists"
                    width={32}
                    height={32}
                  />
                </div>
                <div className={styles["aircraft-top-wing"]}>
                  <div className={styles.exists}>
                    <div>
                      <Image
                        src="https://i.ibb.co/ftwgLCL/exist.png"
                        alt="Exists"
                        width={32}
                        height={32}
                      />
                    </div>
                    <div>
                      <Image
                        src="https://i.ibb.co/ftwgLCL/exist.png"
                        alt="Exists"
                        width={32}
                        height={32}
                      />
                    </div>
                  </div>
                </div>
                <div className={styles["aircraft-bottom-wing"]}>
                  <div className={styles.exists}>
                    <div>
                      <Image
                        src="https://i.ibb.co/ftwgLCL/exist.png"
                        alt="Exists"
                        width={32}
                        height={32}
                      />
                    </div>
                    <div>
                      <Image
                        src="https://i.ibb.co/ftwgLCL/exist.png"
                        alt="Exists"
                        width={32}
                        height={32}
                      />
                    </div>
                  </div>
                </div>
                <div className={styles["aircraft-head"]}>
                  <div className={styles["aircraft-head-body"]}>
                    <div className={styles.windows}>
                      <Image
                        src="https://i.ibb.co/F5hp29L/windows.png"
                        alt="Windows"
                        width={150}
                        height={150}
                      />
                    </div>
                    <div className={styles["front-lavatory"]}>
                      <Image
                        src="https://i.ibb.co/NVT4SZ1/lavatory.png"
                        alt="Front Lavatory"
                        width={50}
                        height={100}
                      />
                    </div>
                  </div>
                </div>
                <div className={styles["aircraft-tail"]}>
                  <div className={styles["aircraft-tail-body"]}>
                    <div className={styles["back-lavatory"]}>
                      <Image
                        src="https://i.ibb.co/NVT4SZ1/lavatory.png"
                        alt="Back Lavatory"
                        width={50}
                        height={100}
                      />
                      <Image
                        src="https://i.ibb.co/NVT4SZ1/lavatory.png"
                        alt="Back Lavatory"
                        width={50}
                        height={100}
                      />
                    </div>
                  </div>
                </div>
                {/* Add other elements */}
              </div>
            </div>
          ) : (
            <div>No data found</div>
          )}{" "}
        </div>
        <div className={styles.proceedBtnContainer}>
          <button onClick={handleSeatMapClose} className={styles.proceedBtn}>
            Proceed
          </button>
        </div>
      </div>
    </>
  );
}

export default SeatMap;
