import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCaretDown, faCaretUp } from "@fortawesome/free-solid-svg-icons";
import { useState } from "react";

export default function TravelerDetails() {
  const [isOpen, setIsOpen] = useState(true);
  const [selectedSegment, setSelectedSegment] = useState(0);

  // ---------------------------
  // MOCK STATIC DATA HERE
  // ---------------------------
  const bookingDetails = [
    {
      data: {
        isDomestic: true,
        segmentPassengerSsr: [
          {
            origin: "BLR",
            destination: "DEL",
            fare: { offeredFareRoundedOff: 5200 },
            ssr: [
              {
                passengerName: "John Doe",
                passengerEmail: "john@example.com",
                ticketNumber: "TICK1234",
                seatNumber: "12A",
                cabbinBaggage: "7kg",
                baggage: "15kg",
                otherBaggage: "-",
                mealName: "Veg Meal",
              },
              {
                passengerName: "Priya Sharma",
                passengerEmail: "priya@example.com",
                ticketNumber: "TICK5678",
                seatNumber: "12B",
                cabbinBaggage: "7kg",
                baggage: "20kg",
                otherBaggage: "-",
                mealName: "Non-Veg Meal",
              },
            ],
          },

          {
            origin: "DEL",
            destination: "SXR",
            fare: { offeredFareRoundedOff: 4800 },
            ssr: [
              {
                passengerName: "John Doe",
                passengerEmail: "john@example.com",
                ticketNumber: "TICK3333",
                seatNumber: "14C",
                cabbinBaggage: "7kg",
                baggage: "20kg",
                otherBaggage: "-",
                mealName: "-",
              },
            ],
          },
        ],
      },
    },
  ];

  const selectedSSR =
    bookingDetails[0].data.segmentPassengerSsr[selectedSegment]?.ssr || [];

  return (
    <div className="p-3 border rounded-md shadow-sm bg-white">
      {/* Header */}
      <div
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between cursor-pointer"
      >
        <div className="font-medium">Traveler Details</div>
        <FontAwesomeIcon
          icon={isOpen ? faCaretUp : faCaretDown}
          color="#028fa3"
        />
      </div>

      {isOpen && (
        <>
          {/* Segment Selection */}
          <div className="flex gap-2 mt-3">
            {bookingDetails[0].data.segmentPassengerSsr.map((seg, idx) => (
              <button
                key={idx}
                onClick={() => setSelectedSegment(idx)}
                className={`p-2 px-3 rounded-md text-sm ${
                  selectedSegment === idx
                    ? "bg-[#028fa3] text-white"
                    : "border border-[#028fa3] text-[#028fa3]"
                }`}
              >
                {seg.origin} - {seg.destination}
              </button>
            ))}
          </div>

          {/* Table Header */}
          {selectedSSR.length > 0 && (
            <div className="grid grid-cols-7 gap-2 text-center border-b pb-2 font-semibold text-sm mt-4">
              <div>Passenger Name</div>
              <div>Ticket No</div>
              <div>Seat</div>
              <div>Cabin Bag</div>
              <div>Checkin Bag</div>
              <div>Other Bag</div>
              <div>Meal</div>
            </div>
          )}

          {/* Passenger Rows */}
          <div className="flex flex-col gap-2 mt-2">
            {selectedSSR.map((p, idx) => (
              <div
                key={idx}
                className="grid grid-cols-7 gap-2 text-center border-b pb-2 text-sm"
              >
                <div>
                  <div className="font-medium text-[#028fa3]">
                    {p.passengerName}
                  </div>
                  <div className="text-xs text-gray-500">{p.passengerEmail}</div>
                </div>

                <div className="text-xs">{p.ticketNumber}</div>
                <div className="text-xs">{p.seatNumber}</div>
                <div className="text-xs">{p.cabbinBaggage}</div>
                <div className="text-xs">{p.baggage}</div>
                <div className="text-xs">{p.otherBaggage}</div>
                <div className="text-xs">{p.mealName}</div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
