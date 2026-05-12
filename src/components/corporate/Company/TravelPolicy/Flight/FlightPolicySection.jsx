import MappingSection from "@/components/corporate/Company/TravelPolicy/MappingSection";
import EligibilitySection from "@/components/corporate/Company/TravelPolicy/EligibilitySection";
import BudgetSection from "@/components/corporate/Company/TravelPolicy/BudgetSection";
import ComfortAndConvenience from "@/components/corporate/Company/TravelPolicy/Flight/ComfortAndConvenience";
import BookingWindowSection from "@/components/corporate/Company/TravelPolicy/BookingWindowSection";
import ApprovalsSection from "@/components/corporate/Company/TravelPolicy/ApprovalsSection";

const FlightPolicySection = ({
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
    // If no master data is loaded yet, show a loader or placeholder
    return <div>Loading flight policy data...</div>;
  }

  // Parse out the relevant sections from flight masterData
  // Typically masterData.masterData = [ {value: "...", data: ...}, ... ]
  // We'll do minimal logic here. In your real code, you'd find each section by "value".
  const travelPolicyObj = masterData.masterData.find(
    (sec) => sec.value.toLowerCase().trim() === "travel policy"
  );
  const eligibilityObj = masterData.masterData.find(
    (sec) => sec.value === "Eligibility"
  );
  const budgetObj = masterData.masterData.find((sec) => sec.value === "Budget");
  const comfortObj = masterData.masterData.find(
    (sec) => sec.value === "Comfort and Convenience"
  );
  const approvalsObj = masterData.masterData.find(
    (sec) => sec.value === "Policy Configuration"
  );
  const bookingWindowObj = masterData.masterData.find(
    (sec) => sec.value === "Booking Window"
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

      {/* For flight, you may have sections like "Comfort and Convenience" too,
          but to keep it shorter, we skip or create another reusable section
       */}

      <ComfortAndConvenience
        comfortData={comfortObj}
        formData={formData}
        onFormUpdate={onFormUpdate}
        travelCategory={travelCategory}
        validator={validator}
      />

      {/* 4) Booking Window */}
      <BookingWindowSection
        icon="flight"
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
        icon="flight"
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

export default FlightPolicySection;
