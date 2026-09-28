import { useState } from "react";
import PolicyModal from "@/components/corporate/approvalRequest/outpolicy";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCaretDown,
  faCaretUp,
  faCircleInfo,
} from "@fortawesome/free-solid-svg-icons";
import { getOutOfPolicyReasons } from "@/utils/corporate/travelPolicy";
import OutOfPolicyBadge from "../common/OutOfPolicyBadge";

const TravellerDetails = ({ travellers, travelCategory }) => {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <>
      {travellers?.length > 0 && (
        <div className="bg-white p-4 mt-2 rounded-lg">
          <div
            className="flex items-center justify-between font-medium cursor-pointer"
            onClick={() => setIsOpen(!isOpen)}
          >
            Traveler Details
            <FontAwesomeIcon
              icon={isOpen ? faCaretUp : faCaretDown}
              color="#155EEF"
            />
          </div>
          {isOpen && (
            <div className="mt-2">
              {travellers.map((traveler) => {
                const data = traveler?.data;
                let outOfPolicyReasons = [];
                let travelerName = "";
                if (data) {
                  outOfPolicyReasons = getOutOfPolicyReasons(
                    data,
                    travelCategory
                  );
                  travelerName = data?.name;
                }

                return (
                  <div
                    key={traveler?.data?.id ?? traveler?.id}
                    className="flex items-center gap-5 mb-4"
                  >
                    <div className="flex flex-col h-fit">
                      <OutOfPolicyBadge
                        reasons={outOfPolicyReasons}
                        travelerName={travelerName}
                        showTravelerNameInTooltip={false}
                      />
                      <span className="text-[#155EEF] font-medium">
                        {traveler?.data?.name ?? traveler?.name}
                      </span>
                      <span className="text-sm font-medium">
                        {traveler?.data?.email ?? traveler?.email}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </>
  );
};

export default TravellerDetails;
