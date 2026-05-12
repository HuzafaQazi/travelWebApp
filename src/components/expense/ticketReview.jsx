import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faClock } from "@fortawesome/free-solid-svg-icons";
import Image from "next/image";

export default function TicketReview() {
  
  const flightDetails = [
    {
      isRefundable: true,
      segments: [
        {
          stops: 1,
          journeyDuration: 185,
          segment: [
            {
              airline: {
                airlineName: "IndiGo",
                airlineCode: "6E",
                flightNumber: "3421",
                airlineLogoUrl: "https://upload.wikimedia.org/wikipedia/commons/8/88/IndiGo_logo.svg"
              },
              origin: {
                depTime: "2025-02-15T06:45:00",
                airport: {
                  airportName: "Kempegowda International Airport",
                  airportCode: "BLR"
                }
              },
              destination: {
                arrTime: "2025-02-15T10:50:00",
                airport: {
                  airportName: "Chhatrapati Shivaji International Airport",
                  airportCode: "BOM"
                }
              },
              cabinClassName: "Economy",
              cabinBaggage: "7kg",
              baggage: "15kg",
              journeyTypeName: "One Way"
            }
          ]
        }
      ]
    }
  ];

  // --- FIXED HELPERS (SSR SAFE) ---
  const formatTime = (dateString) => {
    const date = new Date(dateString);
    let hours = date.getHours();
    const minutes = date.getMinutes().toString().padStart(2, "0");
    const ampm = hours >= 12 ? "PM" : "AM";
    hours = hours % 12 || 12;
    return `${hours}:${minutes} ${ampm}`;
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
    return `${days[date.getDay()]}, ${months[date.getMonth()]} ${date.getDate()}`;
  };

  const formatDuration = (mins) => {
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    return `${h}h ${m}m`;
  };

  const flightDayDifference = (start, end) => {
    const d1 = new Date(start);
    const d2 = new Date(end);
    return d2.getDate() - d1.getDate();
  };

  // --- UI ---
  return (
    <>
      {flightDetails.map((flight, index) =>
        flight.segments.map((segment, i) => {
          const stopCount = segment.stops;
          const dep = segment.segment[0].origin;
          const arr = segment.segment[segment.segment.length - 1].destination;
          const airline = segment.segment[0].airline;
          const daysAfter = flightDayDifference(dep.depTime, arr.arrTime);

          return (
            <div key={index + "-" + i} className="border rounded-lg p-4 bg-white mt-4 shadow-sm">

              {/* INFO ROW */}
              <div className="flex justify-between w-full">
                <div className="flex gap-3 items-center">
                  <Image src={airline.airlineLogoUrl} alt="" width={40} height={40} className="rounded-full" />
                  <div className="text-xs font-semibold">
                    {airline.airlineName}, {airline.airlineCode} {airline.flightNumber}
                  </div>
                </div>

                <div className="flex gap-2 text-[10px]">
                  <span className="border px-2 py-1 rounded-md">{segment.segment[0].journeyTypeName}</span>
                  <span className="border px-2 py-1 rounded-md">{segment.segment[0].cabinClassName}</span>
                </div>
              </div>

              {/* DATE */}
              <div className="flex justify-between mt-2 text-xs text-gray-500">
                <span>{formatDate(dep.depTime)}</span>
                <span>{formatDate(arr.arrTime)}</span>
              </div>

              {/* TIME ROW */}
              <div className="flex justify-between items-center mt-3">
                <div className="text-base font-semibold">{formatTime(dep.depTime)}</div>

                <div className="text-center text-xs text-gray-600">
                  <FontAwesomeIcon icon={faClock} className="mr-1" />
                  {formatDuration(segment.journeyDuration)} | {stopCount} Stop
                </div>

                <div className="text-base font-semibold">
                  {formatTime(arr.arrTime)} {daysAfter > 0 && <span className="text-[9px] text-gray-500">(+{daysAfter}D)</span>}
                </div>
              </div>

              {/* AIRPORTS */}
              <div className="flex justify-between mt-2 text-xs">
                <div>
                  <div className="font-semibold text-[#028fa3]">{dep.airport.airportCode}</div>
                  <div className="text-gray-600">{dep.airport.airportName}</div>
                </div>
                <div className="text-right">
                  <div className="font-semibold text-[#028fa3]">{arr.airport.airportCode}</div>
                  <div className="text-gray-600">{arr.airport.airportName}</div>
                </div>
              </div>
            </div>
          );
        })
      )}
    </>
  );
}
