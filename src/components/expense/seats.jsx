import React, { useEffect, useState } from "react";
import showToast from "@/utils/toast";
import { faInfoCircle } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  canSelectSeatForEmployee,
  findCorporateEmployeeForTraveler,
} from "@/utils/corporate/travelPolicy";
import style from "./styles.module.css";

export default function Seats({
  seatDynamic,
  ssr,
  travelers,
  setTravelers,
  travelerIndex,
  setTravelerIndex,
  handleSSRSelection,
  corporateEmployees,
}) {
  const [activeFlight, setActiveFlight] = useState(1);
  const [ssrIndex, setSsrIndex] = useState(0);
  const [ssrSegmentIndex, setSsrSegmentIndex] = useState(0);
  const [segmentSsr, setSegmentSsr] = useState();
  const [seatRows, setSeatRows] = useState([]);
  const [selectedSeat, setSelectedSeat] = useState([]);
  const [info, setInfo] = useState();
  const [seatDynamicIndex, setSeatDynamicIndex] = useState(0);
  const [hoveredSeat, setHoveredSeat] = useState(null);

  const isSelected = (seat) => {
    for (let i = 0; i < travelers.length; i++) {
      const traveler = travelers[i];
      const found = traveler.seatDynamic.some(
        (selected) =>
          selected.origin === seat.origin &&
          selected.destination === seat.destination &&
          selected.code === seat.code
      );

      if (found) {
        return { isSelected: true, travelerIndex: i };
      }
    }

    return { isSelected: false, travelerIndex: -1 };
  };

  const getSeatCode = (index) => {
    // Get the current traveler
    if (segmentSsr) {
      const traveler = travelers[index];

      // Loop through the traveler's seatDynamic and check if there's a match
      const matchedSeat = traveler.seatDynamic.find(
        (selected) =>
          selected.origin === segmentSsr.rowSeats[0].seats[0].origin &&
          selected.destination === segmentSsr.rowSeats[0].seats[0].destination
      );

      // If a match is found, return the selected seat's code, otherwise return "-"
      return matchedSeat ? matchedSeat.code : "-";
    }
  };

  const handleSeatClick = (seatObj, seatAllowed) => {
    if (!seatAllowed) return;

    // 1) Is seat already reserved?
    const seatReserved =
      seatObj.availablityType === 3 ||
      seatObj.availablityType === 4 ||
      seatObj.availablityType === 5;
    if (seatReserved) {
      showToast("error", "Seat is not available");
      return;
    }

    // 2) Is seat selected by a different traveler?
    const { isSelected: seatIsSelected, travelerIndex: seatOwner } =
      isSelected(seatObj);
    if (seatIsSelected && seatOwner !== travelerIndex) {
      showToast("error", "Seat is already selected by another traveler");
      return;
    }

    // 3) Check if SSR=3 is allowed for the current traveler.
    const currentTraveler = travelers[travelerIndex];
    // find matching corporateEmployee
    const matchedEmp = findCorporateEmployeeForTraveler(
      currentTraveler,
      corporateEmployees
    );

    if (!matchedEmp) {
      showToast("error", "No matching employee. Possibly out of policy.");
      return;
    }

    if (!seatAllowed) {
      showToast("error", "Out of policy for seat selection.");
      return;
    }

    // 4) If we’re here => seat can be selected
    handleSSRSelection("SEAT", seatObj);
  };

  const seat = (seatAllowed) => {
    if (segmentSsr && seatRows.length > 0) {
      return (
        <div className="flex flex-col">
          {/* Seat Row Labels (A, B, C, D, E, F) */}
          <div className="flex gap-2 items-center">
            {/* Empty div for row number alignment */}
            <div className=" h-8"></div>
            {/* Loop through seatRows to render seat labels with aisle space */}
            {seatRows.map((seatColumn, index) => {
              // Check if the seat type is an aisle in the first row of seats (row 0) to add aisle space
              const firstRowSeat = segmentSsr.rowSeats[1].seats.find(
                (s) => s.seatNo === seatColumn
              );

              const isAisle = firstRowSeat?.seatTypeName
                ?.toLowerCase()
                .includes("aisle");

              // Track the previous seat in the iteration
              const previousSeat =
                index > 0
                  ? segmentSsr.rowSeats[1].seats.find(
                      (s) => s.seatNo === seatRows[index - 1]
                    )
                  : null;
              const wasPreviousAisle = previousSeat?.seatTypeName
                ?.toLowerCase()
                .includes("aisle");

              return (
                <React.Fragment key={index}>
                  {/* Render seat column label */}
                  <div className="w-8 h-8 text-center font-bold">
                    {seatColumn}
                  </div>

                  {/* Add an aisle space if current seat is an aisle and previous seat wasn't an aisle */}
                  {isAisle && !wasPreviousAisle && (
                    <div className="w-8 h-8"></div>
                  )}
                </React.Fragment>
              );
            })}
          </div>

          {/* Seat Rows */}
          <div className="mt-2 flex gap-2 items-center justify-center">
            <div className="flex gap-2 flex-col">
              {segmentSsr.rowSeats.map((rowSeat, rowIndex) => {
                let previousSeat = null; // Initialize previous seat as null for each row

                return (
                  <div key={rowIndex} className="flex gap-2">
                    {/* Optional: Row Number Display */}
                    <div className=" text-center font-bold">
                      {rowSeat.rowNo}
                    </div>

                    {seatRows.map((seatColumn, seatIndex) => {
                      // Find the seat for the current seatColumn (e.g., A, B, C)
                      const seat = rowSeat.seats.find(
                        (s) => s.seatNo === seatColumn
                      );

                      if (seat) {
                        // Track the current seat to check against the previous one
                        const isAisle = seat.seatTypeName
                          ?.toLowerCase()
                          .includes("aisle");
                        const wasPreviousAisle = previousSeat?.seatTypeName
                          ?.toLowerCase()
                          .includes("aisle");

                        const {
                          isSelected: seatIsSelected,
                          travelerIndex: seatOwner,
                        } = isSelected(seat);

                        const seatReserved =
                          seat.availablityType === 3 ||
                          seat.availablityType === 4 ||
                          seat.availablityType === 5;

                        let classNames =
                          "w-8 h-8 border-[1px] rounded-md text-xxs flex items-center justify-center ";
                        if (!seatAllowed) {
                          classNames +=
                            "cursor-not-allowed bg-gray-50 border-gray-200 ";
                        } else if (seatIsSelected) {
                          classNames +=
                            "border-blue-500 bg-blue-300 cursor-pointer ";
                        } else if (seatReserved) {
                          classNames +=
                            "bg-gray-200 border-gray-300 cursor-not-allowed ";
                        } else if (seat.price === 0) {
                          classNames +=
                            "bg-green-300 border-green-500 cursor-pointer ";
                        } else {
                          classNames +=
                            "bg-white border-gray-200 cursor-pointer ";
                        }

                        let seatLabel = seatReserved ? "X" : "0";
                        if (!seatReserved && seat.price) {
                          seatLabel = `₹${seat.price}`;
                        }

                        const seatElement = (
                          <>
                            <div
                              key={seatIndex}
                              className="relative"
                              onMouseEnter={() => {
                                if (!seatAllowed) setHoveredSeat(seat);
                              }}
                              onMouseLeave={() => {
                                if (!seatAllowed) setHoveredSeat(null);
                              }}
                            >
                              <div
                                key={seatIndex}
                                className={classNames}
                                onClick={() =>
                                  handleSeatClick(seat, seatAllowed)
                                }
                              >
                                {seatLabel}
                              </div>
                              {!seatAllowed && hoveredSeat === seat && (
                                <div className="absolute z-50 top-[-2rem] left-1/2 -translate-x-1/2 w-max px-2 py-1 text-xs bg-gray-800 text-white rounded-md">
                                  Out of policy
                                  <div
                                    className="absolute w-0 h-0 left-1/2 -translate-x-1/2
                               border-[6px] border-transparent border-t-gray-800 bottom-[-12px]"
                                  />
                                </div>
                              )}
                            </div>
                          </>
                        );

                        // Add a gap after the seat if it's an aisle and the previous seat wasn't an aisle
                        if (isAisle && !wasPreviousAisle) {
                          previousSeat = seat; // Set the current seat as previous for the next iteration
                          return (
                            <>
                              {seatElement}
                              <div
                                key={`aisle-${rowIndex}-${seatIndex}`}
                                className="w-8 h-8 text-center"
                              >
                                {seat.rowNo}
                              </div>
                            </>
                          );
                        } else {
                          // Just render the seat
                          previousSeat = seat; // Set the current seat as previous for the next iteration
                          return seatElement;
                        }
                      } else {
                        // If no seat exists for this column, render an empty placeholder
                        return <div key={seatIndex} className="w-8  "></div>;
                      }
                    })}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      );
    }
  };
  useEffect(() => {
    setSegmentSsr(seatDynamic[ssrIndex][0].segmentSeat[ssrSegmentIndex]);
    let ssrSegment =
      seatDynamic[ssrIndex][seatDynamicIndex].segmentSeat[ssrSegmentIndex];
    let rows = [];
    if (ssrSegment.rowSeats.length > 1)
      for (let i = 0; i < ssrSegment.rowSeats[1].seats.length; i++) {
        if (ssrSegment.rowSeats[1].seats[i].seatNo != null) {
          rows.push(ssrSegment.rowSeats[1].seats[i].seatNo);
        }
      }
    setSeatRows(rows);
  }, [ssrIndex, ssrSegmentIndex]);

  let seatAllowed = false;
  if (travelers[travelerIndex]) {
    const matchedEmp = findCorporateEmployeeForTraveler(
      travelers[travelerIndex],
      corporateEmployees
    );
    seatAllowed = canSelectSeatForEmployee(matchedEmp);
  }

  return (
    <>
      {/* Flight selection */}
      <div>
        <div className="flex border-b overflow-x-scroll hide-scrollbar">
          {seatDynamic.map((segmentSeats, index) => {
            return segmentSeats.map((seatDynamic, dynamicIndex) => {
              return seatDynamic.segmentSeat.map((segmentSsr, segmentIndex) => {
                return (
                  <button
                    key={segmentIndex}
                    className={`${
                      ssrIndex === index &&
                      seatDynamicIndex === dynamicIndex &&
                      ssrSegmentIndex === segmentIndex
                        ? "border-[#155EEF] text-[#155EEF]"
                        : "text-gray-900"
                    } px-4 py-2 border-b`}
                    onClick={() => {
                      setSsrIndex(index);
                      setSsrSegmentIndex(segmentIndex);
                      setSegmentSsr(segmentSsr);
                      setSeatDynamicIndex(dynamicIndex);
                    }}
                  >
                    {segmentSsr.rowSeats[0].seats[0].origin} -{" "}
                    {segmentSsr.rowSeats[0].seats[0].destination}
                  </button>
                );
              });
            });
          })}
        </div>
        <div className="flex flex-col mt-3 gap-1">
          {!seatAllowed && (
            <div className="text-[#E53944] text-sm font-medium items-center bg-[#FBE2E3] rounded-lg w-fit px-2 py-1 flex gap-1">
              <FontAwesomeIcon icon={faInfoCircle} />
              Out Of Policy (No seat SSR)
            </div>
          )}

          <div className="flex overflow-x-scroll hide-scrollbar gap-3 ">
            {travelers &&
              travelers.map((traveler, index) => (
                <div
                  key={index}
                  className={`flex rounded-md min-w-28 sm:min-w-36 flex-col gap-2 items-center p-2 ${
                    travelerIndex === index
                      ? "text-[#155EEF] border border-[#155EEF2B]"
                      : " border-[1px] border-[#0000000F] bg-custom-shadow1"
                  }`}
                  onClick={() => setTravelerIndex(index)}
                >
                  <div className="text-xxs sm:text-sm">
                    {traveler?.firstName} {traveler?.lastName}
                  </div>
                  <div className="bg-[#155EEF0F] text-xxs sm:text-sm rounded-full p-1 px-3">
                    {getSeatCode(index)}
                  </div>
                </div>
              ))}
          </div>
        </div>
      </div>

      {/* Seat selection */}
      {/* <div className={style.seats}> */}
      {/* <div className="h-[500px] overflow-y-scroll mt-3 flex flex-col justify-around sm:flex-row"> */}
      <div className="h-[500px]  mt-3 flex flex-col justify-around sm:flex-row">
        {/* seat guide */}
        <div className="flex flex-col gap-2 bg-white sticky top-0 z-[99]">
          <div className="flex gap-2 items-center">
            <div
              className={`w-5 h-5 border-[1px] rounded-md text-xxs flex items-center justify-center border-green-500 bg-green-300`}
            ></div>
            <div>Free</div>
          </div>
          <div className="flex gap-2 items-center">
            <div
              className={`w-5 h-5 border-[1px] rounded-md text-xxs flex items-center justify-center border-gray-500 bg-gray-200`}
            ></div>
            <div>Occupied</div>
          </div>
          <div className="flex gap-2 items-center">
            <div
              className={`w-5 h-5 border-[1px] rounded-md text-xxs flex items-center justify-center border-gray-500`}
            ></div>
            <div>Available</div>
          </div>
          <div className="flex gap-2 items-center">
            <div
              className={`w-5 h-5 border-[1px] rounded-md text-xxs flex items-center justify-center border-blue-500 bg-blue-300`}
            ></div>
            <div>Selected</div>
          </div>
        </div>
        {/* Plane */}
        <div className={style.seats}>
          <div className="m-auto min-w-1/2 w-fit min-h-[500px] h-fit shadow-[2px_3px_8.6px_5px_#7D99B44D] p-2">
            <div>{seat(seatAllowed)}</div>
          </div>
        </div>
      </div>
    </>
  );
}
