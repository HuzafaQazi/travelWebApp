import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPlaneDeparture,
  faPlaneArrival,
  faCalendarAlt,
  faClock,
  faHotel,
  faCar,
  faUser,
  faInfoCircle,
  faMapMarkerAlt,
  faRupeeSign,
  faSuitcase,
} from "@fortawesome/free-solid-svg-icons";

const iconMap = {
  From: faPlaneDeparture,
  To: faPlaneArrival,
  "Departure Date": faCalendarAlt,
  "Return Date": faCalendarAlt,
  Travelers: faUser,
  Class: faSuitcase,
  Hotel: faHotel,
  "Check-in": faCalendarAlt,
  "Check-out": faCalendarAlt,
  "Car Rental": faCar,
  Pickup: faMapMarkerAlt,
  "Drop-off": faMapMarkerAlt,
  Amount: faRupeeSign,
  Purpose: faInfoCircle,
};

export default function TravelDetails({ sectionTitle, data }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 mb-5 shadow-sm">
      {/* Compact Title */}
      <h3 className="text-sm font-bold text-gray-800 mb-3 flex items-center gap-2">
        <div className="w-1.5 h-6 bg-gradient-to-b from-cyan-500 to-teal-600 rounded-full"></div>
        {sectionTitle}
      </h3>

      {/* Tight Grid – Small Boxes */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        {data.map((item, index) => {
          const Icon = iconMap[item.label] || faInfoCircle;

          return (
            <div
              key={index}
              className="bg-gray-50 rounded-lg border border-gray-200 p-2.5 flex items-center gap-2.5 hover:bg-gray-100 transition-all duration-200"
            >
              {/* Tiny Icon */}
              <div className="w-7 h-7 bg-cyan-100 rounded-md flex items-center justify-center flex-shrink-0">
                <FontAwesomeIcon icon={Icon} className="text-cyan-600 text-xs" />
              </div>

              {/* Label & Value */}
              <div className="flex-1 min-w-0">
                <p className="text-xs text-gray-500 font-medium truncate">
                  {item.label}
                </p>
                <p className="text-sm font-semibold text-gray-900 truncate">
                  {item.value || "—"}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}