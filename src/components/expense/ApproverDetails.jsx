import React, { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCaretDown, faCaretUp, faCheckCircle, faClock, faTimesCircle, faExclamationTriangle } from "@fortawesome/free-solid-svg-icons";

const StatusBadge = ({ status }) => {
  const config = {
    Approved: { icon: faCheckCircle, color: "bg-green-100 text-green-700" },
    Declined: { icon: faTimesCircle, color: "bg-red-100 text-red-700" },
    Pending: { icon: faClock, color: "bg-yellow-100 text-yellow-700" },
  }[status] || config.Pending;

  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium ${config.color}`}>
      <FontAwesomeIcon icon={config.icon} className="text-[9px]" />
      {status}
    </span>
  );
};

const OutOfPolicyBadge = ({ reasons }) => {
  if (!reasons?.length) return null;
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-red-100 text-red-700 rounded-full text-[10px] font-medium">
      <FontAwesomeIcon icon={faExclamationTriangle} className="text-[9px]" />
      Out of Policy
    </span>
  );
};

export default function ApproverDetailsStatic() {
  const [isOpen, setIsOpen] = useState(true);

  const travellers = [
    {
      data: {
        firstName: "John",
        lastName: "Doe",
        approverUserDetails: [
          { workEmail: "manager@example.com", approvalStatus: "Approved" },
          { workEmail: "director@example.com", approvalStatus: "Pending" },
        ],
      },
    },
    {
      data: {
        firstName: "Priya",
        lastName: "Sharma",
        approverUserDetails: [
          { workEmail: "teamlead@example.com", approvalStatus: "Declined" },
        ],
      },
    },
  ];

  const travelReason = "Client meeting in Mumbai";

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden text-xs">
      {/* Compact Header */}
      <div
        onClick={() => setIsOpen(!isOpen)}
        className="px-4 py-2.5 bg-gray-50 border-b border-gray-200 flex items-center justify-between cursor-pointer hover:bg-gray-100 transition"
      >
        <span className="font-semibold text-gray-800">Approver Details</span>
        <FontAwesomeIcon
          icon={isOpen ? faCaretUp : faCaretDown}
          className="text-cyan-600 text-xs"
        />
      </div>

      {/* Compact Content */}
      {isOpen && (
        <div className="p-3 space-y-3">
          {travellers.map((traveller, i) => {
            const { firstName, lastName, approverUserDetails } = traveller.data;
            const isOutOfPolicy = firstName === "John";

            return (
              <div key={i} className="space-y-1.5">
                {/* Traveller + Badge */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-cyan-100 rounded-full flex items-center justify-center text-[10px] font-bold text-cyan-700">
                      {firstName[0]}
                    </div>
                    <span className="font-medium text-gray-900">
                      {firstName} {lastName}
                    </span>
                  </div>
                  {isOutOfPolicy && <OutOfPolicyBadge reasons={["Cabin class exceeded"]} />}
                </div>

                {/* Approvers */}
                <div className="pl-8 space-y-1">
                  {approverUserDetails.map((a, idx) => (
                    <div key={idx} className="flex items-center justify-between text-[11px]">
                      <span className="text-gray-600">{a.workEmail}</span>
                      <StatusBadge status={a.approvalStatus} />
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
 
          {/* Travel Reason */}
          {travelReason && (
            <div className="pt-2 border-t border-gray-200">
              <span className="text-gray-500 text-[11px]">Purpose:</span>{" "}
              <span className="font-medium text-gray-800">{travelReason}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}