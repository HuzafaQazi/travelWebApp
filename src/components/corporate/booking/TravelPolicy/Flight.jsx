import style from "./../styles.module.css";
import { CABIN_CLASS_OPTIONS } from "@/utils/constants";
import { formatPrice } from "@/utils/common";

const TravelPolicy = ({ policyObj }) => {
  if (!policyObj) {
    return (
      <div className="p-2 text-sm">
        <span>No Flight Policy Assigned</span>
      </div>
    );
  }

  const {
    eligibility,
    budget,
    cabinClass,
    bookingWindow,
    approvalConfiguration,
    ssrTypes,
    dateChangeAllowed,
  } = policyObj;

  const eligibilityText = (() => {
    if (!eligibility || eligibility.length === 0) return "None";
    let arr = [];
    if (eligibility.includes("1")) arr.push("Self-book");
    if (eligibility.includes("2")) arr.push("Book for others");
    return arr.join(" + ");
  })();

  let domesticBudget = 0,
    internationalBudget = 0;
  if (Array.isArray(budget)) {
    budget.forEach((b) => {
      if (String(b.regionalCategoryId) === "1") domesticBudget = b.amount;
      if (String(b.regionalCategoryId) === "2") internationalBudget = b.amount;
    });
  }

  let cabinClassLabels = [];
  if (Array.isArray(cabinClass)) {
    cabinClass.forEach((id) => {
      const found = CABIN_CLASS_OPTIONS.find((opt) => opt.id === id);
      cabinClassLabels.push(found ? found.label : `Unknown #${id}`);
    });
  }

  let ssrTexts = [];
  if (Array.isArray(ssrTypes)) {
    ssrTypes.forEach((type) => {
      if (type === 1) ssrTexts.push("Meal");
      else if (type === 2) ssrTexts.push("Baggage");
      else if (type === 3) ssrTexts.push("Seat");
      else ssrTexts.push(`Unknown SSR#${type}`);
    });
  }

  const onlyInPolicy = approvalConfiguration?.some(
    (cfg) => cfg.approvalConfigId === 1
  );

  return (
    <div className={style.travelPolicy}>
      {/* Eligibility Section */}
      <div className="flex items-start border-b py-4">
        <span className="text-[#4A4A4A] font-semibold px-2 py-1 text-sm sm:text-base w-[32%]">
          Eligibility
        </span>
        <div>
          <span className="text-sm sm:text-base font-semibold text-[#028FA3]">
            {eligibilityText}
          </span>
          <p className="text-xs sm:text-sm font-medium text-[#171A19CC]">
            {eligibility.includes("1") && eligibility.includes("2") && (
              <>You can book for yourself, or for others.</>
            )}
            {eligibility.includes("1") && !eligibility.includes("2") && (
              <>You can book for yourself.</>
            )}
            {!eligibility.includes("1") && eligibility.includes("2") && (
              <>You can book for others.</>
            )}
          </p>
        </div>
      </div>

      {/* Budget Section */}
      <div className="flex items-start border-b py-4">
        <span className="text-[#4A4A4A] font-semibold px-2 py-1 text-sm sm:text-base w-[32%]">
          Budget
        </span>
        <div className="grid grid-cols-2 my-2 gap-10">
          <div className="mx-1">
            <span className="text-xs sm:text-base font-semibold text-[#028FA3]">
              Domestic Flights
            </span>
            <p className="text-sm font-medium text-[#171A19CC]">
              {domesticBudget === 0
                ? "No limit"
                : `Rs ${formatPrice(domesticBudget)}`}
            </p>
          </div>
          <div className="mx-1">
            <span className="text-xs sm:text-base font-semibold text-[#028FA3]">
              International Flights
            </span>
            <p className="text-sm font-medium text-[#171A19CC]">
              {internationalBudget === 0
                ? "No limit"
                : `Rs ${formatPrice(internationalBudget)}`}
            </p>
          </div>
        </div>
      </div>

      {/* Comfort and Convenience Section */}
      <div className="flex items-start border-b py-4">
        <span className="text-[#4A4A4A] font-semibold px-2 py-1 text-sm sm:text-base w-[32%]">
          Comfort and Convenience
        </span>
        <div className="grid grid-cols-1 my-2 gap-3">
          <div className="mx-1">
            <span className="text-xs sm:text-base font-semibold text-[#028FA3]">
              Class
            </span>
            <p className="text-sm font-medium text-[#171A19CC]">
              {cabinClassLabels.length ? cabinClassLabels.join(", ") : "None"}
            </p>
          </div>
          <div className="mx-1">
            <span className="text-xs sm:text-base font-semibold text-[#028FA3]">
              Add-ons
            </span>
            <p className="text-sm font-medium text-[#171A19CC]">
              {ssrTexts.length ? ssrTexts.join(", ") : "None"}
            </p>
          </div>
        </div>
      </div>

      {/* Booking Window Section */}
      <div className="flex items-start border-b py-4">
        <span className="text-[#4A4A4A] font-semibold px-2 py-1 text-sm sm:text-base w-[32%]">
          Booking Window
        </span>
        <div>
          <span className="text-xs sm:text-base font-medium text-[#171A19CC]">
            {!bookingWindow || Number(bookingWindow) === 0 ? (
              <>No limit on booking window</>
            ) : (
              <>
                Before{" "}
                <span className="text-[#028FA3] text-sm sm:text-base font-semibold">
                  {bookingWindow} days
                </span>
                , you must book or the window will close.
              </>
            )}
          </span>
        </div>
      </div>

      {/* In-Policy Booking Section */}
      <div className="flex items-start border-b py-4">
        <span className="text-[#4A4A4A] font-semibold px-2 py-1 text-sm sm:text-base w-[32%]">
          Only In-Policy Booking
        </span>
        <div>
          <label className="inline-flex items-center me-5 ">
            <input
              type="checkbox"
              checked={onlyInPolicy}
              readOnly
              value=""
              className="sr-only peer"
            />
            <div className="relative w-11 h-6 bg-gray-200 rounded-full peer dark:bg-gray-300 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#028fa3]" />
          </label>
        </div>
      </div>
    </div>
  );
};

export default TravelPolicy;
