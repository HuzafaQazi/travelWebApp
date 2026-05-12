import React, { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCaretDown } from "@fortawesome/free-solid-svg-icons";
import { formatPrice } from "@/utils/common";

const CancellationPolicy = ({ roomData }) => {
  const [isPolicyOpen, setIsPolicyOpen] = useState(false);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const getChargeDisplay = (policy) => {
    switch (policy.ChargeType) {
      case 1:
        return `${formatPrice(policy.Charge)} ${policy.Currency}`;
      case 2:
        return `${policy.Charge}%`;
      case 3:
        return `${policy.Charge} Nights`;
      default:
        return "N/A";
    }
  };

  const processRoomPolicies = (roomName, cancellationPolicies) => {
    const processedPolicies = [];
    const now = new Date();

    // Check for free cancellation
    if (
      cancellationPolicies?.length > 0 &&
      now < new Date(cancellationPolicies[0].FromDate)
    ) {
      processedPolicies.push({
        roomName,
        fromDate: "Now",
        toDate: formatDate(cancellationPolicies[0].FromDate),
        charges: "Free Cancellation",
      });
    }

    // Add other cancellation policies
    cancellationPolicies?.forEach((policy, index) => {
      processedPolicies.push({
        roomName,
        fromDate: formatDate(policy.FromDate),
        toDate: formatDate(policy.ToDate),
        // toDate:
        //   index === cancellationPolicies.length - 1
        //     ? "Departure"
        //     : formatDate(cancellationPolicies[index + 1].FromDate),
        charges: getChargeDisplay(policy),
      });
    });

    return processedPolicies;
  };

  const allPolicies = roomData?.flatMap(({ roomName, cancellationPolicies }) =>
    processRoomPolicies(roomName, cancellationPolicies)
  );

  return (
    <>
      {allPolicies.length > 0 && (
        <div className="bg-white p-4 rounded-lg mt-2">
          <div
            className="flex items-center justify-between font-medium cursor-pointer"
            onClick={() => setIsPolicyOpen(!isPolicyOpen)}
          >
            Cancellation Policy
            <FontAwesomeIcon icon={faCaretDown} color="#028fa3" />
          </div>

          {isPolicyOpen && (
            <>
              <div
                className="fixed inset-0 bg-black opacity-50 z-50 cursor-pointer"
                onClick={() => setIsPolicyOpen(false)}
              ></div>
              <div className="z-50 relative">
                <div className="bg-white p-0 border border-dashed border-gray-300 rounded-2xl mt-2">
                  <div className="grid grid-cols-4 divide-x divide-black-300 rounded-2xl">
                    <div className="text-center p-1.5 border-b border-gray-300">
                      <span className="font-semibold text-xs sm:text-base">Room</span>
                    </div>
                    <div className="text-center p-1.5 border-b border-gray-300">
                      <span className="font-semibold  text-xs sm:text-base">
                        Cancellation From
                      </span>
                    </div>
                    <div className="text-center p-1.5 border-b border-gray-300">
                      <span className="font-semibold  text-xs sm:text-base">
                        Cancellation To
                      </span>
                    </div>
                    <div className="text-center p-1.5 border-b border-gray-300">
                      <span className="font-semibold  text-xs sm:text-base">
                        Cancellation Charges
                      </span>
                    </div>

                    {allPolicies.map((policy, index) => (
                      <React.Fragment key={index}>
                        <div
                          // className="text-center p-2 rounded-bl-2xl border-b border-gray-300"
                          className={`text-center p-2 border-b border-gray-300 ${
                            index === allPolicies.length - 1
                              ? "rounded-bl-2xl"
                              : ""
                          }`}
                        >
                          <p className="mt-2 text-xs sm:text-sm text-gray-600">
                            {policy.roomName}
                          </p>
                        </div>
                        <div className="text-center p-2 border-b border-gray-300">
                          <p className="mt-2 text-xs sm:text-sm text-gray-600">
                            {policy.fromDate}
                          </p>
                        </div>
                        <div className="text-center p-2 border-b border-gray-300">
                          <p className="mt-2 text-sm text-gray-600">
                            {policy.toDate}
                          </p>
                        </div>
                        <div
                          //  className="text-center p-2 border-b rounded-br-2xl  border-gray-300"
                          className={`text-center p-2 border-b border-gray-300 ${
                            index === allPolicies.length - 1
                              ? "rounded-br-2xl"
                              : ""
                          }`}
                        >
                          <p className="mt-2 text-sm text-[#028FA3]">
                            {policy.charges}
                          </p>
                        </div>
                      </React.Fragment>
                    ))}
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </>
  );
};

export default CancellationPolicy;
