// import React, { useEffect, useState } from "react";
// import showToast from "@/utils/toast";
// import { faInfoCircle } from "@fortawesome/free-solid-svg-icons";
// import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
// import style from "./styles.module.css";

// export default function Seats({
//   seatDynamic,
//   ssr,
//   travelers,
//   setTravelers,
//   travelerIndex,
//   setTravelerIndex,
//   handleSSRSelection,
// }) {
//   console.log("the travelers are",travelers)
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
//     if (segmentSsr) {
//       const traveler = travelers[index];
//       const matchedSeat = traveler.seatDynamic.find(
//         (selected) =>
//           selected.origin === segmentSsr.rowSeats[0].seats[0].origin &&
//           selected.destination === segmentSsr.rowSeats[0].seats[0].destination
//       );
//       return matchedSeat ? matchedSeat.code : "-";
//     }
//   };

//   const handleSeatClick = (seatObj) => {
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

//     // 3) If we’re here => seat can be selected
//     handleSSRSelection("SEAT", seatObj);
//   };

//   const seat = () => {
//     if (segmentSsr && seatRows.length > 0) {
//       return (
//         <div className="flex flex-col">
//           {/* Seat Row Labels (A, B, C, D, E, F) */}
//           <div className="flex gap-2 items-center">
//             {/* Empty div for row number alignment */}
//             <div className=" h-8"></div>
//             {/* Loop through seatRows to render seat labels with aisle space */}
//             {seatRows.map((seatColumn, index) => {
//               const firstRowSeat = segmentSsr.rowSeats[1].seats.find(
//                 (s) => s.seatNo === seatColumn
//               );
//               const isAisle = firstRowSeat?.seatTypeName
//                 ?.toLowerCase()
//                 .includes("aisle");
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
//                   <div className="w-8 h-8 text-center font-bold">
//                     {seatColumn}
//                   </div>
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
//                 let previousSeat = null;
//                 return (
//                   <div key={rowIndex} className="flex gap-2">
//                     <div className=" text-center font-bold">
//                       {rowSeat.rowNo}
//                     </div>
//                     {seatRows.map((seatColumn, seatIndex) => {
//                       const seat = rowSeat.seats.find(
//                         (s) => s.seatNo === seatColumn
//                       );
//                       if (seat) {
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
//                         if (seatIsSelected) {
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
//                           <div
//                             key={seatIndex}
//                             className="relative"
//                           >
//                             <div
//                               className={classNames}
//                               onClick={() => handleSeatClick(seat)}
//                             >
//                               {seatLabel}
//                             </div>
//                           </div>
//                         );
//                         if (isAisle && !wasPreviousAisle) {
//                           previousSeat = seat;
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
//                           previousSeat = seat;
//                           return seatElement;
//                         }
//                       } else {
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
//           <div className="flex overflow-x-scroll hide-scrollbar gap-3 ">
//             {travelers &&
//               travelers.map((traveler, index) => (
//                 <React.Fragment key={index}>
//                 {traveler?.paxType !== "3" && (
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
//                 )}
//                 </React.Fragment>
//               ))}
//           </div>
//         </div>
//       </div>

//       {/* Seat selection */}
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
//             <div>{seat()}</div>
//           </div>
//         </div>
//       </div>
//     </>
//   );
// }

import React, { useEffect, useState } from "react";
import { X } from "lucide-react";

export default function Seats({
  seatDynamic,
  ssr,
  travelers,
  setTravelers,
  travelerIndex,
  setTravelerIndex,
  handleSSRSelection,
  isSeatRequired = false,
}) {
  const [ssrIndex, setSsrIndex] = useState(0);
  const [ssrSegmentIndex, setSsrSegmentIndex] = useState(0);
  const [segmentSsr, setSegmentSsr] = useState();
  const [seatLayout, setSeatLayout] = useState({
    columns: [],
    aisleAfter: new Set(),
  });
  const [seatDynamicIndex, setSeatDynamicIndex] = useState(0);

  // const isSelected = (seat) => {
  //   const currentSegment = segmentSsr?.rowSeats?.[0]?.seats?.[0];

  //   if (!currentSegment) return { isSelected: false, travelerIndex: -1 };
  //   for (let i = 0; i < travelers.length; i++) {
  //     const traveler = travelers[i];
  //     const found = traveler.seatDynamic.some(
  //       (selected) =>
  //         selected.origin === currentSegment.origin &&
  //         selected.destination === currentSegment.destination &&
  //         selected.code === seat.code
  //     );
  //     if (found) {
  //       return { isSelected: true, travelerIndex: i };
  //     }
  //   }
  //   return { isSelected: false, travelerIndex: -1 };
  // };

  const isSelected = (seat) => {
    const key = `${seat.origin}-${seat.destination}`;

    for (let i = 0; i < travelers.length; i++) {
      const found = travelers[i].seatDynamic.find(
        (s) => `${s.origin}-${s.destination}` === key && s.code === seat.code
      );

      if (found) {
        return { isSelected: true, travelerIndex: i };
      }
    }

    return { isSelected: false, travelerIndex: -1 };
  };

  const getSeatCode = (index) => {
    if (segmentSsr) {
      const traveler = travelers[index];
      const matchedSeat = traveler.seatDynamic.find(
        (selected) =>
          selected.origin === segmentSsr.rowSeats[0].seats[0].origin &&
          selected.destination === segmentSsr.rowSeats[0].seats[0].destination
      );
      return matchedSeat ? matchedSeat.code : "-";
    }
  };

  const handleSeatClick = (seatObj) => {
    const seatReserved =
      seatObj.availablityType === 3 ||
      seatObj.availablityType === 4 ||
      seatObj.availablityType === 5;
    if (seatReserved) {
      alert("Seat is not available");
      return;
    }

    const { isSelected: seatIsSelected, travelerIndex: seatOwner } =
      isSelected(seatObj);
    if (seatIsSelected && seatOwner !== travelerIndex) {
      alert("Seat is already selected by another traveler");
      return;
    }

    handleSSRSelection("SEAT", seatObj);
  };

  // Comprehensive analysis of entire seat structure
  const analyzeSeatLayout = (ssrSegment) => {
    if (!ssrSegment || ssrSegment.rowSeats.length === 0) {
      return { columns: [], aisleAfter: new Set() };
    }

    // Step 1: Collect all unique columns and their types across ALL rows
    const columnSet = new Set();
    const columnTypeFrequency = {}; // Track most common type for each column

    for (let rowIndex = 0; rowIndex < ssrSegment.rowSeats.length; rowIndex++) {
      const rowSeats = ssrSegment.rowSeats[rowIndex].seats;

      for (let seatIndex = 0; seatIndex < rowSeats.length; seatIndex++) {
        const seat = rowSeats[seatIndex];
        if (seat.seatNo) {
          columnSet.add(seat.seatNo);

          // Track seat types for this column
          if (!columnTypeFrequency[seat.seatNo]) {
            columnTypeFrequency[seat.seatNo] = {};
          }
          const typeName = seat.seatTypeName || "Unknown";
          columnTypeFrequency[seat.seatNo][typeName] =
            (columnTypeFrequency[seat.seatNo][typeName] || 0) + 1;
        }
      }
    }

    // Step 2: Sort columns alphabetically
    const columns = Array.from(columnSet).sort();

    // Step 3: Determine which columns should have aisle after them
    // Add gap between two consecutive seats if BOTH are aisle type
    const aisleAfter = new Set();

    for (let i = 0; i < columns.length - 1; i++) {
      const currentColumn = columns[i];
      const nextColumn = columns[i + 1];

      // Get most common type for current column
      const currentTypes = columnTypeFrequency[currentColumn];
      let currentMostCommonType = "";
      let currentMaxCount = 0;

      for (const [type, count] of Object.entries(currentTypes)) {
        if (count > currentMaxCount) {
          currentMaxCount = count;
          currentMostCommonType = type;
        }
      }

      // Get most common type for next column
      const nextTypes = columnTypeFrequency[nextColumn];
      let nextMostCommonType = "";
      let nextMaxCount = 0;

      for (const [type, count] of Object.entries(nextTypes)) {
        if (count > nextMaxCount) {
          nextMaxCount = count;
          nextMostCommonType = type;
        }
      }

      // Check if current seat contains "Aisle" in its type name
      const isCurrentAisle = currentMostCommonType
        .toLowerCase()
        .includes("aisle");
      // Check if next seat contains "Aisle" in its type name
      const isNextAisle = nextMostCommonType.toLowerCase().includes("aisle");

      // Add gap ONLY if BOTH current AND next columns are aisle type
      if (isCurrentAisle && isNextAisle) {
        aisleAfter.add(currentColumn);
      }
    }

    return { columns, aisleAfter };
  };

  const renderSeat = (seat, rowNo) => {
    if (!seat) {
      // Empty position - no seat exists
      return (
        <div className="w-8 h-8 sm:w-12 sm:h-12 border border-dashed border-gray-200 rounded-lg bg-gray-50 flex items-center justify-center">
          <X className="w-4 h-4 text-gray-200" />
        </div>
      );
    }

    const { isSelected: seatIsSelected } = isSelected(seat);
    const seatReserved =
      seat.availablityType === 3 ||
      seat.availablityType === 4 ||
      seat.availablityType === 5;

    let bgColor = "bg-white";
    let borderColor = "border-gray-300";
    let textColor = "text-gray-700";
    let cursor = "cursor-pointer hover:scale-105 hover:shadow-lg";

    if (seatIsSelected) {
      bgColor = "bg-blue-500";
      borderColor = "border-blue-600";
      textColor = "text-white";
    } else if (seatReserved) {
      bgColor = "bg-gray-300";
      borderColor = "border-gray-400";
      textColor = "text-gray-500";
      cursor = "cursor-not-allowed";
    } else if (seat.price === 0) {
      bgColor = "bg-green-100";
      borderColor = "border-green-500";
      textColor = "text-green-700";
    }

    const seatLabel = seatReserved
      ? "X"
      : seat.price > 0
      ? `₹${seat.price}`
      : "Free";

    return (
      <div
        className={`relative w-8 h-8 sm:w-12 sm:h-12 ${cursor} transition-all duration-200`}
        onClick={() => !seatReserved && handleSeatClick(seat)}
      >
        {/* Seat shape with armrests */}
        <div
          className={`w-full h-full ${bgColor} ${borderColor} border-2 rounded-t-xl rounded-b-md flex items-center justify-center shadow-sm`}
        >
          <div
            className={`text-[9px] font-bold ${textColor} text-center leading-tight`}
          >
            {seatLabel}
          </div>
        </div>
        {/* Left armrest */}
        <div
          className={`absolute -left-[3px] top-0 w-[3px] h-7 ${bgColor} rounded-l-sm`}
        ></div>
        {/* Right armrest */}
        <div
          className={`absolute -right-[3px] top-0 w-[3px] h-7 ${bgColor} rounded-r-sm`}
        ></div>
      </div>
    );
  };

  const renderSeats = () => {
    if (!segmentSsr || seatLayout.columns.length === 0) return null;

    const { columns, aisleAfter } = seatLayout;

    return (
      <div className="relative bg-gradient-to-b from-gray-100 via-white to-gray-100 rounded-[2rem] p-8 shadow-2xl border-4 border-gray-300">
        {/* Cockpit */}
        <div className="flex justify-center mb-8">
          <div className="w-36 h-20 bg-gradient-to-b from-blue-500 to-blue-600 rounded-t-full border-4 border-blue-700 flex items-end justify-center pb-3 shadow-lg">
            <div className="text-white text-xs font-bold tracking-wider">
              COCKPIT
            </div>
          </div>
        </div>

        {/* Column Headers */}
        <div className="flex gap-2 items-center justify-center mb-4 px-2">
          {columns.map((column) => (
            <React.Fragment key={`header-${column}`}>
              <div className="w-8 sm:w-12 text-center font-bold text-base text-gray-800">
                {column}
              </div>
              {aisleAfter.has(column) && (
                <div className="w-12 text-center text-[10px] text-gray-400 font-bold uppercase">
                  Aisle
                </div>
              )}
            </React.Fragment>
          ))}
        </div>

        {/* Window indicators */}
        <div className="absolute left-3 top-36 bottom-24 w-4 bg-gradient-to-b from-sky-300 via-sky-200 to-sky-300 rounded-full shadow-inner opacity-70 border-2 border-sky-400"></div>
        <div className="absolute right-3 top-36 bottom-24 w-4 bg-gradient-to-b from-sky-300 via-sky-200 to-sky-300 rounded-full shadow-inner opacity-70 border-2 border-sky-400"></div>

        {/* Seat Rows */}
        <div className="flex flex-col gap-3 px-2">
          {segmentSsr.rowSeats.map((rowSeat, rowIndex) => {
            if (rowIndex === 0) return null; // Skip header row

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
                      {renderSeat(seat, rowSeat.rowNo)}
                      {aisleAfter.has(column) && (
                        <div className="w-12 h-12 flex items-center justify-center bg-gradient-to-b from-gray-200 to-gray-100 rounded-lg border border-gray-300">
                          <div className="text-[11px] text-red-600 font-bold">
                            {seat?.rowNo}
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

        {/* Tail */}
        <div className="flex justify-center mt-8">
          <div className="w-48 h-16 bg-gradient-to-t from-gray-500 to-gray-400 rounded-b-full border-4 border-gray-600 shadow-lg"></div>
        </div>
      </div>
    );
  };

  useEffect(() => {
    if (!seatDynamic || !seatDynamic[ssrIndex]) return;

    setSegmentSsr(seatDynamic[ssrIndex][0].segmentSeat[ssrSegmentIndex]);
    const ssrSegment =
      seatDynamic[ssrIndex][seatDynamicIndex].segmentSeat[ssrSegmentIndex];

    const layout = analyzeSeatLayout(ssrSegment);
    setSeatLayout(layout);
  }, [ssrIndex, ssrSegmentIndex, seatDynamicIndex, seatDynamic]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 p-3">
      {/* Flight Selection */}
      {isSeatRequired && (
        <div className="mb-2 p-2 bg-yellow-50 border-l-4 border-yellow-400 text-sm">
          <strong>Required:</strong> Please select seats for all travelers
        </div>
      )}
      <div className="bg-white rounded-xl shadow-lg p-2 mb-6">
        <div className="flex border-b overflow-x-scroll hide-scrollbar mb-3">
          {seatDynamic.map((segmentSeats, index) => {
            return segmentSeats.map((seatDynamic, dynamicIndex) => {
              return seatDynamic.segmentSeat.map((segmentSsr, segmentIndex) => {
                const isActive =
                  ssrIndex === index &&
                  seatDynamicIndex === dynamicIndex &&
                  ssrSegmentIndex === segmentIndex;
                return (
                  <button
                    key={`${index}-${dynamicIndex}-${segmentIndex}`}
                    className={`px-4 py-2 border-b ${
                      isActive
                        ? "border-[#028fa3] text-[#028fa3]"
                        : "text-gray-900"
                    }`}
                    onClick={() => {
                      setSsrIndex(index);
                      setSsrSegmentIndex(segmentIndex);
                      setSegmentSsr(segmentSsr);
                      setSeatDynamicIndex(dynamicIndex);
                    }}
                  >
                    {segmentSsr.rowSeats[0].seats[0].origin} →{" "}
                    {segmentSsr.rowSeats[0].seats[0].destination}
                  </button>
                );
              });
            });
          })}
        </div>

        {/* Travelers */}
        <div className="flex overflow-x-auto gap-4 pb-2">
          {travelers &&
            travelers.map((traveler, index) => (
              <React.Fragment key={index}>
                {traveler?.paxType !== "3" && (
                  <div
                    className={`flex rounded-md min-w-28 sm:min-w-36 flex-col gap-2 items-center p-2 ${
                      travelerIndex === index
                        ? "text-[#028fa3] border border-[#028FA32B]"
                        : "border-[1px] border-[#0000000F] bg-custom-shadow1"
                    }`}
                    onClick={() => setTravelerIndex(index)}
                  >
                    <div className="text-sm font-semibold text-gray-800">
                      {traveler?.firstName || traveler?.lastName
                        ? `${traveler?.firstName || ""} ${
                            traveler?.lastName || ""
                          }`.trim()
                        : `Passenger ${index + 1}`}
                    </div>
                    <div className="bg-gradient-to-r from-teal-500 to-teal-600 text-white text-sm font-bold rounded-full px-4 py-1.5 shadow-md">
                      {getSeatCode(index)}
                    </div>
                  </div>
                )}
              </React.Fragment>
            ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex flex-col lg:flex-col gap-6">
        {/* Legend */}
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

        {/* Plane View */}
        <div className="flex-1 overflow-x-auto pb-4">
          <div className="inline-block min-w-full">{renderSeats()}</div>
        </div>
      </div>
    </div>
  );
}
