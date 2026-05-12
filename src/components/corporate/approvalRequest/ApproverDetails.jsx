import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCaretDown, faCaretUp } from "@fortawesome/free-solid-svg-icons";
import { useState } from "react";
import { getOutOfPolicyReasons } from "@/utils/corporate/travelPolicy";
import OutOfPolicyBadge from "../common/OutOfPolicyBadge";

const ApproverDetails = ({
  travellers,
  travelReason,
  approvalStatus,
  parentClassName,
  cancelledOn,
  travelCategory = "2",
}) => {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <>
      {travellers?.some(
        (traveller) => traveller?.data?.approverUserDetails?.length > 0
      ) && (
        <div className={parentClassName}>
          <div
            onClick={() => setIsOpen(!isOpen)}
            className="flex items-center justify-between cursor-pointer text-sm sm:text-lg text-[#171A19] font-semibold "
          >
            <div>Approver Details</div>
            {approvalStatus && approvalStatus !== "Pending" && cancelledOn && (
              <div className="text-[#171A19B2] text-xxs sm:text-xs">
                {approvalStatus} {cancelledOn ? " On " + cancelledOn : ""}
              </div>
            )}
            <FontAwesomeIcon
              icon={isOpen ? faCaretUp : faCaretDown}
              color="#028fa3"
            />
          </div>

          {isOpen && (
            <div className="mt-2 flex flex-col">
              {travellers?.map((traveller, index) => {
                const data = traveller?.data;
                const outOfPolicyReasons = getOutOfPolicyReasons(
                  data,
                  travelCategory
                );
                const travelerName = data.firstName + " " + data.lastName;

                return (
                  <React.Fragment key={index}>
                    {traveller?.data?.firstName && (
                      <div className="text-[#028fa3] mt-1 text-xxs sm:text-sm font-medium">
                        <div className="flex items-end">
                          <div className="text-xxs sm:text-sm text-[#000000]">
                            Requested for :
                          </div>
                          <div className="flex flex-col items-center">
                            <OutOfPolicyBadge
                              reasons={outOfPolicyReasons}
                              travelerName={travelerName}
                              showTravelerNameInTooltip={false}
                            />
                            {traveller?.data?.firstName}{" "}
                            {traveller?.data?.lastName}
                          </div>
                        </div>
                      </div>
                    )}

                    {traveller?.data?.approverUserDetails?.length > 0 ? (
                      <div className="text-sm font-light flex flex-wrap items-center ">
                        <span className="text-xxs sm:text-sm font-semibold">
                          Approver :
                        </span>{" "}
                        {traveller?.data?.approverUserDetails?.map(
                          (approver, index) => (
                            <div
                              key={index}
                              className="flex items-center mt-0 relative font-medium text-[#868687"
                            >
                              {approver?.approvalStatus === "Declined" && (
                                <span className="text-xxs sm:text-xs text-[#E53944] px-1 rounded-full bg-[#E539441A]">
                                  Declined by
                                </span>
                              )}
                              {approver?.approvalStatus === "Approved" && (
                                <span className="text-xxs sm:text-xs text-[#418C12] px-1 rounded-full bg-[#418C121A]">
                                  Approved by
                                </span>
                              )}
                              {approver?.approvalStatus === "Pending" && (
                                <span className="text-xxs sm:text-xs text-[#C2A406] px-1 rounded-full bg-[#C2A4061A]">
                                  Pending from
                                </span>
                              )}
                              <span className="text-xxs sm:text-sm">
                                {approver.workEmail}
                                {index <
                                  traveller?.data?.approverUserDetails?.length -
                                    1 && ","}
                              </span>
                            </div>
                          )
                        )}
                      </div>
                    ) : (
                      <div className="text-xxs sm:text-sm text-[rgba(23,_26,_25,_0.8)]">
                        <div className="text-red-500 ml-4">
                          No approvers assigned
                        </div>
                      </div>
                    )}
                  </React.Fragment>
                );
              })}
              {travelReason && (
                <div className="mt-2">
                  <span className="text-xxs sm:text-sm font-medium">
                    Reason of Travel:
                  </span>
                  <div className="text-xxs sm:text-sm text-[rgba(23,_26,_25,_0.8)]">
                    {travelReason}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </>
  );
};
export default ApproverDetails;
