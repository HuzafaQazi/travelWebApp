import MappingSection from "@/components/corporate/Company/TravelPolicy/MappingSection";
import EligibilitySection from "@/components/corporate/Company/TravelPolicy/EligibilitySection";
import BookingWindowSection from "@/components/corporate/Company/TravelPolicy/BookingWindowSection";
import ApprovalsSection from "@/components/corporate/Company/TravelPolicy/ApprovalsSection";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faTrain,
    faBus,
    faCar,
    faCircleInfo,
    faIndianRupeeSign,
    faUserGroup,
} from "@fortawesome/free-solid-svg-icons";
import Tooltip from "@/components/corporate/Company/TravelPolicy/Tooltip";
import style from "@/components/corporate/Company/TravelPolicy/style.module.css";
import { memo, useCallback } from "react";

// Helper to determine the correct icon based on transport type
const getTransportIcon = (travelCategory) => {
    switch (travelCategory) {
        case "3": return faTrain;
        case "4": return faBus;
        case "5": return faCar;
        default: return faTrain;
    }
};

// Helper to get transport name
const getTransportName = (travelCategory) => {
    switch (travelCategory) {
        case "3": return "Train";
        case "4": return "Bus";
        case "5": return "Car Rental";
        default: return "Transport";
    }
};

// Simplified Budget Section for transport (with single input)
const TransportBudgetSection = ({
    title,
    description,
    formData,
    travelCategory,
    onFormUpdate,
    validator,
}) => {
    const handleChange = useCallback(
        (value) => {
            if (value !== "" && !/^\d*\.?\d*$/.test(value)) {
                return;
            }

            // Get current budget for the specified travelCategory
            const currentConfig = formData.policyConfigData.find(
                (config) => config.travelCategory === travelCategory
            );

            const numericValue = value === "" ? null : Number(value);

            // Trigger update using onFormUpdate
            onFormUpdate({
                travelCategory,
                budget: numericValue,
            });
        },
        [formData, travelCategory, onFormUpdate]
    );

    const getBudgetValue = useCallback(() => {
        const currentConfig = formData.policyConfigData.find(
            (config) => config.travelCategory === travelCategory
        );
        return currentConfig?.budget || "";
    }, [formData, travelCategory]);

    return (
        <div className={`border-b border-gray-300 ${style.companyMob} pt-3 pb-3`}>
            <div className="flex justify-between">
                <div className="flex gap-3 items-center">
                    <FontAwesomeIcon
                        icon={faUserGroup}
                        className="text-lg text-[#028fa3] bg-[#028FA312] p-2 rounded-full"
                    />
                    <div>
                        <div className="text-[#171A19] font-semibold text-sm">{title}</div>
                        <div className="text-[#171A19] font-normal text-xs">
                            {description}
                        </div>
                    </div>
                </div>
            </div>

            <div className="mt-3 border-t border-[#4A4A4A0D] pt-3">
                <div className="flex items-center gap-3 w-full sm:w-4/6">
                    <div className="flex flex-col gap-3 justify-center items-start w-1/2 mx-auto sm:w-1/3">
                        <div className="flex items-center relative">
                            <div className="text-[#171A19] text-xs font-semibold sm:text-lg text-left sm:font-normal">
                                {getTransportName(travelCategory)} Budget
                            </div>
                            <div className="relative group">
                                <FontAwesomeIcon
                                    icon={faCircleInfo}
                                    className="text-[#028fa3] text-sm relative -top-3 ml-1 cursor-pointer"
                                />
                                <Tooltip content={`Limit for ${getTransportName(travelCategory)} expenses`} />
                            </div>
                        </div>

                        <div className="w-fit">
                            <div className="relative w-full min-w-[100px] h-10">
                                <div className="absolute inset-y-0 left-2 flex items-center pointer-events-none">
                                    <FontAwesomeIcon
                                        icon={faIndianRupeeSign}
                                        className="text-[#028FA3] text-sm"
                                    />
                                </div>
                                <input
                                    type="text"
                                    className="block pl-5 px-2.5 pb-2.5 pt-2.5 w-full text-sm text-[#028FA3] bg-transparent rounded-lg border-1 border-[#028fa3] appearance-none dark:text-black dark:border-[#028fa3] dark:focus:border-[#028fa3] focus:outline-none focus:ring-0 focus:border-[#028fa3]-600 peer"
                                    value={getBudgetValue()}
                                    onChange={(e) => handleChange(e.target.value)}
                                    placeholder=" "
                                />
                                <label className="absolute text-sm text-[#028FA3] dark:text-[#028FA3] duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-white dark:bg-gray-900 px-2 peer-focus:px-2 peer-focus:text-[#028fa3] peer-focus:dark:text-[#028fa3] peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto start-1">
                                    Amount
                                </label>
                                <div className="text-red-500 text-xxs mt-0"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

// Main Transport Policy Section Component
const TransportPolicySection = ({
    masterData,
    formData,
    onFormUpdate,
    travelCategory,
    validator,
    refs,
    isReadOnly,
    mappingDisplay,
    setMappingDisplay,
    isGlobalPolicy,
}) => {
    if (!masterData) {
        return <div>Loading {getTransportName(travelCategory)} policy data...</div>;
    }

    // Parse out the relevant sections from transport masterData
    const travelPolicyObj = masterData.masterData.find(
        (sec) => sec.value.toLowerCase().trim() === "travel policy"
    );
    const eligibilityObj = masterData.masterData.find(
        (sec) => sec.value === "Eligibility"
    );
    const budgetObj = masterData.masterData.find(
        (sec) => sec.value === "Budget"
    );
    const approvalsObj = masterData.masterData.find(
        (sec) => sec.value === "Policy Configuration"
    );
    const bookingWindowObj = masterData.masterData.find(
        (sec) => sec.value === "Booking Window"
    );

    const transportIcon = getTransportIcon(travelCategory);

    return (
        <div className="mt-2 rounded-lg w-full">
            {/* 1) MappingSection */}
            <MappingSection
                formData={formData}
                onFormUpdate={onFormUpdate}
                validator={validator}
                mappingData={travelPolicyObj}
                isReadOnly={isReadOnly}
                mappingDisplay={mappingDisplay}
                setMappingDisplay={setMappingDisplay}
                isGlobalPolicy={isGlobalPolicy}
            />

            {/* 2) Eligibility */}
            <EligibilitySection
                title={eligibilityObj?.value}
                description={eligibilityObj?.description}
                eligibilityData={eligibilityObj?.data || []}
                formData={formData}
                onFormUpdate={onFormUpdate}
                travelCategory={travelCategory}
                validator={validator}
            />

            {/* 3) Budget (Simplified for transport) */}
            <TransportBudgetSection
                title={budgetObj?.value}
                description={budgetObj?.description}
                formData={formData}
                onFormUpdate={onFormUpdate}
                travelCategory={travelCategory}
                validator={validator}
            />

            {/* 4) Booking Window */}
            {bookingWindowObj && (
                <BookingWindowSection
                    icon={travelCategory}
                    title={bookingWindowObj?.value}
                    description={bookingWindowObj?.description}
                    subvalues={bookingWindowObj?.subvalues || []}
                    formData={formData}
                    onFormUpdate={onFormUpdate}
                    travelCategory={travelCategory}
                    validator={validator}
                />
            )}

            {/* 5) Approvals */}
            <ApprovalsSection
                icon={travelCategory}
                title={approvalsObj?.value}
                description={approvalsObj?.description}
                approvalsData={approvalsObj?.travelApprovalConfigs || []}
                formData={formData}
                onFormUpdate={onFormUpdate}
                travelCategory={travelCategory}
                validator={validator}
            />
        </div>
    );
};

export default memo(TransportPolicySection, (prevProps, nextProps) => {
    return (
        prevProps.travelCategory === nextProps.travelCategory &&
        prevProps.formData === nextProps.formData &&
        prevProps.masterData === nextProps.masterData &&
        prevProps.isReadOnly === nextProps.isReadOnly &&
        prevProps.isGlobalPolicy === nextProps.isGlobalPolicy
    );
});