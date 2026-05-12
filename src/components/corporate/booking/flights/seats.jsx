// import React, { useEffect, useState } from "react";
// import showToast from "@/utils/toast";
// import { faInfoCircle } from "@fortawesome/free-solid-svg-icons";
// import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
// import {
//   canSelectSeatForEmployee,
//   findCorporateEmployeeForTraveler,
// } from "@/utils/corporate/travelPolicy";
// import style from "./styles.module.css";

// export default function Seats({
//   seatDynamic,
//   ssr,
//   travelers,
//   setTravelers,
//   travelerIndex,
//   setTravelerIndex,
//   handleSSRSelection,
//   corporateEmployees,
//   isSeatRequired = false,
// }) {
//   const [activeFlight, setActiveFlight] = useState(1);
//   const [ssrIndex, setSsrIndex] = useState(0);
//   const [ssrSegmentIndex, setSsrSegmentIndex] = useState(0);
//   const [segmentSsr, setSegmentSsr] = useState();
//   const [seatRows, setSeatRows] = useState([]);
//   const [selectedSeat, setSelectedSeat] = useState([]);
//   const [info, setInfo] = useState();
//   const [seatDynamicIndex, setSeatDynamicIndex] = useState(0);
//   const [hoveredSeat, setHoveredSeat] = useState(null);

//   const isSelected = (seat) => {
//     for (let i = 0; i < travelers.length; i++) {
//       const traveler = travelers[i];
//       const found = traveler.seatDynamic.some(
//         (selected) =>
//           selected.origin === seat.origin &&
//           selected.destination === seat.destination &&
//           selected.code === seat.code
//       );

//       if (found) {
//         return { isSelected: true, travelerIndex: i };
//       }
//     }

//     return { isSelected: false, travelerIndex: -1 };
//   };

//   const getSeatCode = (index) => {
//     // Get the current traveler
//     if (segmentSsr) {
//       const traveler = travelers[index];

//       // Loop through the traveler's seatDynamic and check if there's a match
//       const matchedSeat = traveler.seatDynamic.find(
//         (selected) =>
//           selected.origin === segmentSsr.rowSeats[0].seats[0].origin &&
//           selected.destination === segmentSsr.rowSeats[0].seats[0].destination
//       );

//       // If a match is found, return the selected seat's code, otherwise return "-"
//       return matchedSeat ? matchedSeat.code : "-";
//     }
//   };

//   const handleSeatClick = (seatObj, seatAllowed) => {
//     // ✅ Override travel policy if seat is required
//     if (!seatAllowed && !isSeatRequired) return;

//     // 1) Is seat already reserved?
//     const seatReserved =
//       seatObj.availablityType === 3 ||
//       seatObj.availablityType === 4 ||
//       seatObj.availablityType === 5;
//     if (seatReserved) {
//       showToast("error", "Seat is not available");
//       return;
//     }

//     // 2) Is seat selected by a different traveler?
//     const { isSelected: seatIsSelected, travelerIndex: seatOwner } =
//       isSelected(seatObj);
//     if (seatIsSelected && seatOwner !== travelerIndex) {
//       showToast("error", "Seat is already selected by another traveler");
//       return;
//     }

//     // 3) Check if SSR=3 is allowed for the current traveler.
//     const currentTraveler = travelers[travelerIndex];
//     // find matching corporateEmployee
//     const matchedEmp = findCorporateEmployeeForTraveler(
//       currentTraveler,
//       corporateEmployees
//     );

//     if (!matchedEmp) {
//       showToast("error", "No matching employee. Possibly out of policy.");
//       return;
//     }

//     if (!seatAllowed) {
//       showToast("error", "Out of policy for seat selection.");
//       return;
//     }

//     // 4) If we’re here => seat can be selected
//     handleSSRSelection("SEAT", seatObj);
//   };

//   const seat = (seatAllowed) => {
//     if (segmentSsr && seatRows.length > 0) {
//       return (
//         <div className="flex flex-col">
//           {/* Seat Row Labels (A, B, C, D, E, F) */}
//           <div className="flex gap-2 items-center">
//             {/* Empty div for row number alignment */}
//             <div className=" h-8"></div>
//             {/* Loop through seatRows to render seat labels with aisle space */}
//             {seatRows.map((seatColumn, index) => {
//               // Check if the seat type is an aisle in the first row of seats (row 0) to add aisle space
//               const firstRowSeat = segmentSsr.rowSeats[1].seats.find(
//                 (s) => s.seatNo === seatColumn
//               );

//               const isAisle = firstRowSeat?.seatTypeName
//                 ?.toLowerCase()
//                 .includes("aisle");

//               // Track the previous seat in the iteration
//               const previousSeat =
//                 index > 0
//                   ? segmentSsr.rowSeats[1].seats.find(
//                       (s) => s.seatNo === seatRows[index - 1]
//                     )
//                   : null;
//               const wasPreviousAisle = previousSeat?.seatTypeName
//                 ?.toLowerCase()
//                 .includes("aisle");

//               return (
//                 <React.Fragment key={index}>
//                   {/* Render seat column label */}
//                   <div className="w-8 h-8 text-center font-bold">
//                     {seatColumn}
//                   </div>

//                   {/* Add an aisle space if current seat is an aisle and previous seat wasn't an aisle */}
//                   {isAisle && !wasPreviousAisle && (
//                     <div className="w-8 h-8"></div>
//                   )}
//                 </React.Fragment>
//               );
//             })}
//           </div>

//           {/* Seat Rows */}
//           <div className="mt-2 flex gap-2 items-center justify-center">
//             <div className="flex gap-2 flex-col">
//               {segmentSsr.rowSeats.map((rowSeat, rowIndex) => {
//                 let previousSeat = null; // Initialize previous seat as null for each row

//                 return (
//                   <div key={rowIndex} className="flex gap-2">
//                     {/* Optional: Row Number Display */}
//                     <div className=" text-center font-bold">
//                       {rowSeat.rowNo}
//                     </div>

//                     {seatRows.map((seatColumn, seatIndex) => {
//                       // Find the seat for the current seatColumn (e.g., A, B, C)
//                       const seat = rowSeat.seats.find(
//                         (s) => s.seatNo === seatColumn
//                       );

//                       if (seat) {
//                         // Track the current seat to check against the previous one
//                         const isAisle = seat.seatTypeName
//                           ?.toLowerCase()
//                           .includes("aisle");
//                         const wasPreviousAisle = previousSeat?.seatTypeName
//                           ?.toLowerCase()
//                           .includes("aisle");

//                         const {
//                           isSelected: seatIsSelected,
//                           travelerIndex: seatOwner,
//                         } = isSelected(seat);

//                         const seatReserved =
//                           seat.availablityType === 3 ||
//                           seat.availablityType === 4 ||
//                           seat.availablityType === 5;

//                         let classNames =
//                           "w-8 h-8 border-[1px] rounded-md text-xxs flex items-center justify-center ";
//                         if (!seatAllowed) {
//                           classNames +=
//                             "cursor-not-allowed bg-gray-50 border-gray-200 ";
//                         } else if (seatIsSelected) {
//                           classNames +=
//                             "border-blue-500 bg-blue-300 cursor-pointer ";
//                         } else if (seatReserved) {
//                           classNames +=
//                             "bg-gray-200 border-gray-300 cursor-not-allowed ";
//                         } else if (seat.price === 0) {
//                           classNames +=
//                             "bg-green-300 border-green-500 cursor-pointer ";
//                         } else {
//                           classNames +=
//                             "bg-white border-gray-200 cursor-pointer ";
//                         }

//                         let seatLabel = seatReserved ? "X" : "0";
//                         if (!seatReserved && seat.price) {
//                           seatLabel = `₹${seat.price}`;
//                         }

//                         const seatElement = (
//                           <>
//                             <div
//                               key={seatIndex}
//                               className="relative"
//                               onMouseEnter={() => {
//                                 if (!seatAllowed) setHoveredSeat(seat);
//                               }}
//                               onMouseLeave={() => {
//                                 if (!seatAllowed) setHoveredSeat(null);
//                               }}
//                             >
//                               <div
//                                 key={seatIndex}
//                                 className={classNames}
//                                 onClick={() =>
//                                   handleSeatClick(seat, seatAllowed)
//                                 }
//                               >
//                                 {seatLabel}
//                               </div>
//                               {!seatAllowed && hoveredSeat === seat && (
//                                 <div className="absolute z-50 top-[-2rem] left-1/2 -translate-x-1/2 w-max px-2 py-1 text-xs bg-gray-800 text-white rounded-md">
//                                   Out of policy
//                                   <div
//                                     className="absolute w-0 h-0 left-1/2 -translate-x-1/2
//                                border-[6px] border-transparent border-t-gray-800 bottom-[-12px]"
//                                   />
//                                 </div>
//                               )}
//                             </div>
//                           </>
//                         );

//                         // Add a gap after the seat if it's an aisle and the previous seat wasn't an aisle
//                         if (isAisle && !wasPreviousAisle) {
//                           previousSeat = seat; // Set the current seat as previous for the next iteration
//                           return (
//                             <>
//                               {seatElement}
//                               <div
//                                 key={`aisle-${rowIndex}-${seatIndex}`}
//                                 className="w-8 h-8 text-center"
//                               >
//                                 {seat.rowNo}
//                               </div>
//                             </>
//                           );
//                         } else {
//                           // Just render the seat
//                           previousSeat = seat; // Set the current seat as previous for the next iteration
//                           return seatElement;
//                         }
//                       } else {
//                         // If no seat exists for this column, render an empty placeholder
//                         return <div key={seatIndex} className="w-8  "></div>;
//                       }
//                     })}
//                   </div>
//                 );
//               })}
//             </div>
//           </div>
//         </div>
//       );
//     }
//   };

//   useEffect(() => {
//     setSegmentSsr(seatDynamic[ssrIndex][0].segmentSeat[ssrSegmentIndex]);
//     let ssrSegment =
//       seatDynamic[ssrIndex][seatDynamicIndex].segmentSeat[ssrSegmentIndex];
//     let rows = [];
//     if (ssrSegment.rowSeats.length > 1)
//       for (let i = 0; i < ssrSegment.rowSeats[1].seats.length; i++) {
//         if (ssrSegment.rowSeats[1].seats[i].seatNo != null) {
//           rows.push(ssrSegment.rowSeats[1].seats[i].seatNo);
//         }
//       }
//     setSeatRows(rows);
//   }, [ssrIndex, ssrSegmentIndex]);

//   let seatAllowed = isSeatRequired;
//   if (!isSeatRequired && travelers[travelerIndex]) {
//     // Only check policy if NOT required
//     const matchedEmp = findCorporateEmployeeForTraveler(
//       travelers[travelerIndex],
//       corporateEmployees
//     );
//     seatAllowed = canSelectSeatForEmployee(matchedEmp);
//   }

//   return (
//     <>
//       {/* Flight selection */}
//       <div>
//         <div className="flex border-b overflow-x-scroll hide-scrollbar">
//           {seatDynamic.map((segmentSeats, index) => {
//             return segmentSeats.map((seatDynamic, dynamicIndex) => {
//               return seatDynamic.segmentSeat.map((segmentSsr, segmentIndex) => {
//                 return (
//                   <button
//                     key={segmentIndex}
//                     className={`${
//                       ssrIndex === index &&
//                       seatDynamicIndex === dynamicIndex &&
//                       ssrSegmentIndex === segmentIndex
//                         ? "border-[#028fa3] text-[#028fa3]"
//                         : "text-gray-900"
//                     } px-4 py-2 border-b`}
//                     onClick={() => {
//                       setSsrIndex(index);
//                       setSsrSegmentIndex(segmentIndex);
//                       setSegmentSsr(segmentSsr);
//                       setSeatDynamicIndex(dynamicIndex);
//                     }}
//                   >
//                     {segmentSsr.rowSeats[0].seats[0].origin} -{" "}
//                     {segmentSsr.rowSeats[0].seats[0].destination}
//                   </button>
//                 );
//               });
//             });
//           })}
//         </div>
//         <div className="flex flex-col mt-3 gap-1">
//           {/* ✅ Show policy override notice */}
//           {isSeatRequired && (
//             <div className="p-3 bg-red-50 border-l-4 border-red-500 rounded-md mb-2">
//               <div className="flex items-center gap-2 text-sm text-red-800">
//                 <FontAwesomeIcon icon={faInfoCircle} />
//                 <span className="font-semibold">
//                   Seat selection is mandatory for all travelers
//                 </span>
//               </div>
//               <p className="text-xs text-red-700 mt-1 ml-6">
//                 This requirement overrides travel policy restrictions
//               </p>
//             </div>
//           )}
//           {!seatAllowed && !isSeatRequired && (
//             <div className="text-[#E53944] text-sm font-medium items-center bg-[#FBE2E3] rounded-lg w-fit px-2 py-1 flex gap-1">
//               <FontAwesomeIcon icon={faInfoCircle} />
//               Out Of Policy (No seat SSR)
//             </div>
//           )}

//           <div className="flex overflow-x-scroll hide-scrollbar gap-3 ">
//             {travelers &&
//               travelers.map((traveler, index) => (
//                 <div
//                   key={index}
//                   className={`flex rounded-md min-w-28 sm:min-w-36 flex-col gap-2 items-center p-2 ${
//                     travelerIndex === index
//                       ? "text-[#028fa3] border border-[#028FA32B]"
//                       : " border-[1px] border-[#0000000F] bg-custom-shadow1"
//                   }`}
//                   onClick={() => setTravelerIndex(index)}
//                 >
//                   <div className="text-xxs sm:text-sm">
//                     {traveler?.firstName} {traveler?.lastName}
//                   </div>
//                   <div className="bg-[#028FA30F] text-xxs sm:text-sm rounded-full p-1 px-3">
//                     {getSeatCode(index)}
//                   </div>
//                 </div>
//               ))}
//           </div>
//         </div>
//       </div>

//       {/* Seat selection */}
//       {/* <div className={style.seats}> */}
//       {/* <div className="h-[500px] overflow-y-scroll mt-3 flex flex-col justify-around sm:flex-row"> */}
//       <div className="h-[500px]  mt-3 flex flex-col justify-around sm:flex-row">
//         {/* seat guide */}
//         <div className="flex flex-col gap-2 bg-white sticky top-0 z-[99]">
//           <div className="flex gap-2 items-center">
//             <div
//               className={`w-5 h-5 border-[1px] rounded-md text-xxs flex items-center justify-center border-green-500 bg-green-300`}
//             ></div>
//             <div>Free</div>
//           </div>
//           <div className="flex gap-2 items-center">
//             <div
//               className={`w-5 h-5 border-[1px] rounded-md text-xxs flex items-center justify-center border-gray-500 bg-gray-200`}
//             ></div>
//             <div>Occupied</div>
//           </div>
//           <div className="flex gap-2 items-center">
//             <div
//               className={`w-5 h-5 border-[1px] rounded-md text-xxs flex items-center justify-center border-gray-500`}
//             ></div>
//             <div>Available</div>
//           </div>
//           <div className="flex gap-2 items-center">
//             <div
//               className={`w-5 h-5 border-[1px] rounded-md text-xxs flex items-center justify-center border-blue-500 bg-blue-300`}
//             ></div>
//             <div>Selected</div>
//           </div>
//         </div>
//         {/* Plane */}
//         <div className={style.seats}>
//           <div className="m-auto min-w-1/2 w-fit min-h-[500px] h-fit shadow-[2px_3px_8.6px_5px_#7D99B44D] p-2">
//             <div>{seat(seatAllowed)}</div>
//           </div>
//         </div>
//       </div>
//     </>
//   );
// }

import React, { useEffect, useState } from "react";
import { X } from "lucide-react";
import {
  canSelectSeatForEmployee,
  findCorporateEmployeeForTraveler,
} from "@/utils/corporate/travelPolicy";

export default function Seats({
  seatDynamic,
  ssr,
  travelers,
  setTravelers,
  travelerIndex,
  setTravelerIndex,
  handleSSRSelection,
  corporateEmployees,
  isSeatRequired = false,
}) {
  const [ssrIndex, setSsrIndex] = useState(0);
  const [ssrSegmentIndex, setSsrSegmentIndex] = useState(0);
  const [seatDynamicIndex, setSeatDynamicIndex] = useState(0);
  const [segmentSsr, setSegmentSsr] = useState();
  const [seatLayout, setSeatLayout] = useState({
    columns: [],
    aisleAfter: new Set(),
  });
  const [hoveredSeat, setHoveredSeat] = useState(null);

  const isSelected = (seat) => {
    const key = `${seat.origin}-${seat.destination}`;
    for (let i = 0; i < travelers.length; i++) {
      const found = travelers[i].seatDynamic.find(
        (s) => `${s.origin}-${s.destination}` === key && s.code === seat.code
      );
      if (found) return { isSelected: true, travelerIndex: i };
    }
    return { isSelected: false, travelerIndex: -1 };
  };

  const getSeatCode = (index) => {
    if (!segmentSsr) return "-";
    const traveler = travelers[index];
    const seat = traveler.seatDynamic.find(
      (s) =>
        s.origin === segmentSsr.rowSeats[0].seats[0].origin &&
        s.destination === segmentSsr.rowSeats[0].seats[0].destination
    );
    return seat ? seat.code : "-";
  };

  const analyzeSeatLayout = (segment) => {
    const columnSet = new Set();
    const columnTypeFrequency = {};
    segment.rowSeats.forEach((row) => {
      row.seats.forEach((seat) => {
        if (seat.seatNo) {
          columnSet.add(seat.seatNo);
          columnTypeFrequency[seat.seatNo] ||= {};
          const type = seat.seatTypeName || "unknown";
          columnTypeFrequency[seat.seatNo][type] =
            (columnTypeFrequency[seat.seatNo][type] || 0) + 1;
        }
      });
    });

    const columns = Array.from(columnSet).sort();
    const aisleAfter = new Set();

    for (let i = 0; i < columns.length - 1; i++) {
      const c1 = columns[i];
      const c2 = columns[i + 1];
      const t1 = Object.entries(columnTypeFrequency[c1]).sort(
        (a, b) => b[1] - a[1]
      )[0][0];
      const t2 = Object.entries(columnTypeFrequency[c2]).sort(
        (a, b) => b[1] - a[1]
      )[0][0];
      if (
        t1.toLowerCase().includes("aisle") &&
        t2.toLowerCase().includes("aisle")
      ) {
        aisleAfter.add(c1);
      }
    }

    return { columns, aisleAfter };
  };

  const isSeatAllowed = (() => {
    if (isSeatRequired) return true;
    const traveler = travelers[travelerIndex];
    const emp = findCorporateEmployeeForTraveler(traveler, corporateEmployees);
    return canSelectSeatForEmployee(emp);
  })();

  useEffect(() => {
    if (!isSeatAllowed && travelers[travelerIndex]?.seatDynamic.length) {
      setTravelers((prev) =>
        prev.map((t, i) =>
          i === travelerIndex ? { ...t, seatDynamic: [] } : t
        )
      );
    }
  }, [travelerIndex, isSeatAllowed]);

  const handleSeatClick = (seat) => {
    if (!isSeatAllowed) return;
    const reserved = [3, 4, 5].includes(seat.availablityType);
    if (reserved) return;
    const { isSelected: sel, travelerIndex: owner } = isSelected(seat);
    if (sel && owner !== travelerIndex) return;
    handleSSRSelection("SEAT", seat);
  };

  const renderSeat = (seat) => {
    if (!seat)
      return (
        <div className="w-8 h-8 sm:w-12 sm:h-12 border border-dashed border-gray-200 rounded-lg bg-gray-50 flex items-center justify-center">
          <X className="w-4 h-4 text-gray-200" />
        </div>
      );

    const { isSelected: sel } = isSelected(seat);
    const reserved = [3, 4, 5].includes(seat.availablityType);

    let bg = "bg-white";
    let border = "border-gray-300";
    let text = "text-gray-700";
    let cursor = "cursor-pointer";

    if (!isSeatAllowed) cursor = "cursor-not-allowed";
    else if (sel) {
      bg = "bg-blue-500";
      border = "border-blue-600";
      text = "text-white";
    } else if (reserved) {
      bg = "bg-gray-300";
      border = "border-gray-400";
      text = "text-gray-500";
      cursor = "cursor-not-allowed";
    } else if (seat.price === 0) {
      bg = "bg-green-100";
      border = "border-green-500";
      text = "text-green-700";
    }

    const label = reserved ? "X" : seat.price ? `₹${seat.price}` : "Free";

    return (
      <div
        className={`relative w-8 h-8 sm:w-12 sm:h-12 ${cursor}`}
        onClick={() => handleSeatClick(seat)}
        onMouseEnter={() => !isSeatAllowed && setHoveredSeat(seat)}
        onMouseLeave={() => setHoveredSeat(null)}
      >
        <div
          className={`w-full h-full ${bg} ${border} border-2 rounded-t-xl rounded-b-md flex items-center justify-center`}
        >
          <div className={`text-[9px] font-bold ${text}`}>{label}</div>
        </div>
        <div className={`absolute -left-[3px] top-0 w-[3px] h-7 ${bg}`} />
        <div className={`absolute -right-[3px] top-0 w-[3px] h-7 ${bg}`} />
        {!isSeatAllowed && hoveredSeat === seat && (
          <div className="absolute z-50 -top-7 left-1/2 -translate-x-1/2 bg-black text-white text-xs px-2 py-1 rounded">
            Out of policy
          </div>
        )}
      </div>
    );
  };

  const getRowNo = (rowSeat) => {
    if (!rowSeat?.seats?.length) return null;

    const validSeat = rowSeat.seats.find(
      (s) => s?.seatNo && s?.rowNo && s.rowNo !== "0"
    );

    return validSeat?.rowNo || null;
  };

  const renderSeats = () => {
    if (!segmentSsr || seatLayout.columns.length === 0) return null;
    const { columns, aisleAfter } = seatLayout;

    return (
      <div className="relative bg-gradient-to-b from-gray-100 via-white to-gray-100 rounded-[2rem] p-8 shadow-2xl border-4 border-gray-300">
        <div className="flex justify-center mb-8">
          <div className="w-36 h-20 bg-gradient-to-b from-blue-500 to-blue-600 rounded-t-full border-4 border-blue-700 flex items-end justify-center pb-3">
            <div className="text-white text-xs font-bold tracking-wider">
              COCKPIT
            </div>
          </div>
        </div>

        <div className="flex gap-2 items-center justify-center mb-4 px-2">
          {columns.map((column) => (
            <React.Fragment key={`header-${column}`}>
              <div className="w-8 sm:w-12 text-center font-bold">{column}</div>
              {aisleAfter.has(column) && (
                <div className="w-12 text-center text-xs text-gray-400">
                  AISLE
                </div>
              )}
            </React.Fragment>
          ))}
        </div>

        <div className="absolute left-3 top-36 bottom-24 w-4 bg-sky-300 rounded-full" />
        <div className="absolute right-3 top-36 bottom-24 w-4 bg-sky-300 rounded-full" />

        <div className="flex flex-col gap-3 px-2">
          {segmentSsr.rowSeats.map((rowSeat, rowIndex) => {
            if (rowIndex === 0) return null;
            const rowNo = getRowNo(rowSeat);
            if (!rowNo) return null;
            return (
              <div
                key={rowIndex}
                className="flex gap-2 items-center justify-center"
              >
                {/* Seats for this row */}
                {columns.map((column) => {
                  const seat = rowSeat.seats.find((s) => s.seatNo === column);

                  return (
                    <React.Fragment key={`${rowIndex}-${column}`}>
                      {renderSeat(seat)}

                      {aisleAfter.has(column) && (
                        <div className="w-12 h-12 flex items-center justify-center bg-gradient-to-b from-gray-200 to-gray-100 rounded-lg border border-gray-300">
                          <div className="text-[11px] text-red-600 font-bold">
                            {rowNo}
                          </div>
                        </div>
                      )}
                    </React.Fragment>
                  );
                })}
              </div>
            );
          })}
        </div>

        <div className="flex justify-center mt-8">
          <div className="w-48 h-16 bg-gray-400 rounded-b-full border-4 border-gray-600" />
        </div>
      </div>
    );
  };

  useEffect(() => {
    const segment =
      seatDynamic?.[ssrIndex]?.[seatDynamicIndex]?.segmentSeat?.[
        ssrSegmentIndex
      ];
    if (!segment) return;
    setSegmentSsr(segment);
    setSeatLayout(analyzeSeatLayout(segment));
  }, [ssrIndex, ssrSegmentIndex, seatDynamicIndex, seatDynamic]);

  return (
    <div className="p-1">
      <div className="bg-white rounded-xl shadow-lg p-2 mb-6">
        <div className="flex border-b overflow-x-auto mb-3">
          {seatDynamic.map((s, i) =>
            s.map((d, di) =>
              d.segmentSeat.map((seg, si) => (
                <button
                  key={`${i}-${di}-${si}`}
                  className={`px-4 py-2 border-b ${
                    ssrIndex === i &&
                    seatDynamicIndex === di &&
                    ssrSegmentIndex === si
                      ? "border-[#028fa3] text-[#028fa3]"
                      : ""
                  }`}
                  onClick={() => {
                    setSsrIndex(i);
                    setSeatDynamicIndex(di);
                    setSsrSegmentIndex(si);
                  }}
                >
                  {seg.rowSeats[0].seats[0].origin} →{" "}
                  {seg.rowSeats[0].seats[0].destination}
                </button>
              ))
            )
          )}
        </div>

        <div className="flex gap-4 overflow-x-auto pb-2">
          {travelers.map((t, i) => {
            const emp = findCorporateEmployeeForTraveler(t, corporateEmployees);
            const seatAllowed = isSeatRequired || canSelectSeatForEmployee(emp);

            return (
              <div
                key={i}
                onClick={() => setTravelerIndex(i)}
                className={`min-w-32 p-2 rounded border-[2px] ${
                  travelerIndex === i ? "border-[#028fa3] shadow-xl" : "border-gray-200"
                }`}
              >
                <div className="text-sm font-semibold text-gray-800 text-center">
                  {t.firstName || `Passenger ${i + 1}`}
                </div>

                {!seatAllowed && (
                  <div className="mt-1 text-[11px] text-red-600 font-semibold text-center">
                    Out Of Policy (No seat SSR)
                  </div>
                )}

                <div className="mt-2 text-center bg-teal-500 text-white rounded-full py-1 text-sm font-bold">
                  {seatAllowed ? getSeatCode(i) : "-"}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-lg p-2 w-full">
        <h3 className="font-bold text-xl mb-4 text-gray-800 border-b-2 border-gray-200 pb-2">
          Seat Guide
        </h3>
        <div className="grid grid-cols-2 sm:flex gap-2 sm:gap-5">
          <div className="flex items-center w-fit gap-3">
            <div className="w-12 h-12 bg-green-100 border-2 border-green-500 rounded-t-xl rounded-b-md shadow-sm"></div>
            <span className="text-sm font-medium">Free Seat</span>
          </div>
          <div className="flex items-center w-fit gap-3">
            <div className="w-12 h-12 bg-white border-2 border-gray-300 rounded-t-xl rounded-b-md shadow-sm"></div>
            <span className="text-sm font-medium">Available</span>
          </div>
          <div className="flex items-center w-fit gap-3">
            <div className="w-12 h-12 bg-gray-300 border-2 border-gray-400 rounded-t-xl rounded-b-md shadow-sm"></div>
            <span className="text-sm font-medium">Occupied</span>
          </div>
          <div className="flex items-center w-fit gap-3">
            <div className="w-12 h-12 bg-blue-500 border-2 border-blue-600 rounded-t-xl rounded-b-md shadow-sm"></div>
            <span className="text-sm font-medium">Selected</span>
          </div>
          <div className="flex items-center w-fit gap-3">
            <div className="w-12 h-12 bg-gray-50 border border-dashed border-gray-300 rounded-lg flex items-center justify-center">
              <X className="w-5 h-5 text-gray-300" />
            </div>
            <span className="text-sm font-medium">Not Available</span>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-x-auto pb-4">
        <div className="inline-block min-w-full">{renderSeats()}</div>
      </div>
    </div>
  );
}
