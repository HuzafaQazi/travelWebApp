import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTriangleExclamation } from "@fortawesome/free-solid-svg-icons";

const PolicyPopup = ({ onClose }) => {
  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      {/* Background overlay */}
      <div className="fixed inset-0 bg-black opacity-50"></div>

      {/* Popup box */}
      <div className="relative bg-white p-6 rounded-xl shadow-lg z-10 w-80">
        {/* Close button */}
        <div className="absolute top-0 left-0 w-full h-2 bg-red-500 rounded-t-full"></div>
        <button
          className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
          onClick={onClose}
        >
          &#10005;
        </button>

        {/* Warning Icon */}
        <div className="flex justify-center items-center mb-0">
          <div className="text-red-500 text-4xl">
            <FontAwesomeIcon icon={faTriangleExclamation} />
          </div>
        </div>

        {/* Title */}
        <h2 className="text-center text-xl font-semibold mb-2 cursor-pointer">
          Out of Policy
          <div className="absolute left-[-8px] top-1/2 transform -translate-y-1/2 w-0 h-0 border-t-8 border-t-transparent border-r-8 border-r-white border-b-8 border-b-transparent"></div>
        </h2>

        {/* Content */}
        <div className="text-left text-gray-700">
          <p className="font-semibold">
            Reason: <span className="font-normal">Budget Limit exceed</span>
          </p>
          <p className="font-semibold">
            Department: <span className="font-normal">Sales</span>
          </p>
          <p className="font-semibold">
            Level: <span className="font-normal">Sales 1</span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default PolicyPopup;
