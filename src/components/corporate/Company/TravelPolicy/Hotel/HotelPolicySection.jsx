import { useState } from "react";

import MappingSection from "@/components/corporate/Company/TravelPolicy/MappingSection";
import EligibilitySection from "@/components/corporate/Company/TravelPolicy/EligibilitySection";
import BudgetSection from "@/components/corporate/Company/TravelPolicy/BudgetSection";
import HotelCategory from "@/components/corporate/Company/TravelPolicy/Hotel/HotelCategory";
import BookingWindowSection from "@/components/corporate/Company/TravelPolicy/BookingWindowSection";
import ApprovalsSection from "@/components/corporate/Company/TravelPolicy/ApprovalsSection";

const HotelPolicySection = ({
  masterData,
  formData,
  onFormUpdate,
  travelCategory,
  validator,
  isReadOnly,
  mappingDisplay,
  setMappingDisplay,
  isGlobalPolicy,
}) => {
  if (!masterData) {
    return <div>Loading hotel policy data...</div>;
  }

  const travelPolicyObj = masterData.masterData.find(
    (sec) => sec.value.toLowerCase().trim() === "travel policy"
  );
  const eligibilityObj = masterData.masterData.find(
    (sec) => sec.value === "Eligibility"
  );
  const budgetObj = masterData.masterData.find((sec) => sec.value === "Budget");
  const approvalsObj = masterData.masterData.find(
    (sec) => sec.value === "Policy Configuration"
  );
  const bookingWindowObj = masterData.masterData.find(
    (sec) => sec.value === "Booking Window"
  );
  const hotelCategoryObj = masterData.masterData.find(
    (sec) => sec.value === "Hotel Category"
  );

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

      {/* 3) Budget */}
      <BudgetSection
        title={budgetObj?.value}
        description={budgetObj?.description}
        budgets={budgetObj?.data || []}
        formData={formData}
        onFormUpdate={onFormUpdate}
        travelCategory={travelCategory}
        validator={validator}
      />

      <HotelCategory
        hotelCategoryData={hotelCategoryObj}
        formData={formData}
        onFormUpdate={onFormUpdate}
        travelCategory={travelCategory}
        validator={validator}
      />

      {/* 4) Booking Window */}
      <BookingWindowSection
        icon="hotel"
        title={bookingWindowObj?.value}
        description={bookingWindowObj?.description}
        subvalues={bookingWindowObj?.subvalues || []}
        formData={formData}
        onFormUpdate={onFormUpdate}
        travelCategory={travelCategory}
        validator={validator}
      />

      {/* 5) Approvals */}
      <ApprovalsSection
        icon="hotel"
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

export default HotelPolicySection;
