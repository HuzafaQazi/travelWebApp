import Image from "next/image";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faXmark } from "@fortawesome/free-solid-svg-icons";
import check from "@/images/corporate/Ok.png";
import style from "./../styles.module.css";
import { formatPrice } from "@/utils/common";

const HotelTravelPolicy = ({ policyObj }) => {
  if (!policyObj) {
    return (
      <div className="p-2 text-sm">
        <span>No Hotel Policy Assigned</span>
      </div>
    );
  }

  const {
    eligibility,
    budget,
    refundable,
    hotelCategory,
    filters,
    bookingWindow,
    approvalConfiguration,
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

  let starText = "Any stars";
  if (hotelCategory && hotelCategory.length > 0) {
    starText = hotelCategory.map((n) => `${n} Star`).join(", ");
  }

  let filterText = "None";
  if (filters && filters.length > 0) {
    filterText = filters
      .map((f) => {
        if (f === "1") return "Breakfast";
        if (f === "2") return "Lunch";
        if (f === "3") return "Dinner";
        return `Unknown #${f}`;
      })
      .join(", ");
  }

  const isRefundable = refundable === "1";
  const onlyInPolicy = approvalConfiguration?.some(
    (cfg) => cfg.approvalConfigId === 1
  );

  return (
    <div className={style.travelPolicy}>
      <div className="flex items-start border-b py-4">
        <span className="text-[#4A4A4A] font-semibold px-2 py-1 text-sm sm:text-base w-[32%]">
          Eligibility
        </span>
        <div>
          <span className="text-sm sm:text-base font-semibold text-[#155EEF]">
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

      <div className="flex items-start border-b py-4">
        <span className="text-[#4A4A4A] font-semibold px-2 py-1text-sm sm:text-base w-[32%]">
          Budget
        </span>
        <div className="grid grid-cols-2 my-2 gap-10">
          <div className="mx-1">
            <span className="text-xs sm:text-base font-semibold text-[#155EEF]">
              Domestic Stays
            </span>
            <p className="text-xs sm:text-base font-medium text-[#171A19CC]">
              {domesticBudget === 0
                ? "No limit"
                : `Rs ${formatPrice(domesticBudget)}`}
            </p>
          </div>
          <div className="mx-1">
            <span className="text-xs sm:text-base font-semibold text-[#155EEF]">
              International Stays
            </span>
            <p className="text-xs sm:text-base  font-medium text-[#171A19CC]">
              {internationalBudget === 0
                ? "No limit"
                : `Rs ${formatPrice(internationalBudget)}`}
            </p>
          </div>
        </div>
      </div>

      <div className="flex items-start border-b py-4">
        <span className="text-[#4A4A4A] font-semibold px-2 py-1 text-sm sm:text-base w-[32%]">
          Comfort and Convenience
        </span>
        <div className="grid grid-cols-1 my-2 gap-3">
          <div className="flex gap-4">
            <div className="mx-1 ">
              <span className="text-xs sm:text-base font-semibold text-[#155EEF]">
                Star
              </span>
              <p className="text-xs sm:text-sm font-medium text-[#171A19CC]">
                {starText}
              </p>
            </div>
            {isRefundable ? (
              <div className="flex items-center text-sm sm:text-base font-semibold text-[#155EEF]">
                <Image src={check} alt="Ok" className="w-5 h-5 mr-2" />
                Refundable
              </div>
            ) : (
              <div className="flex items-center text-sm sm:text-base font-semibold text-red-400">
                <FontAwesomeIcon icon={faXmark} className="mr-2" />
                Non-Refundable
              </div>
            )}
          </div>
          {/* <div className="mx-1">
            <span className="text-base font-semibold text-[#155EEF]">
              Filters
            </span>
            <p className="text-sm font-medium text-[#171A19CC]">{filterText}</p>
          </div> */}
        </div>
      </div>

      <div className="flex items-start border-b py-4">
        <span className="text-[#4A4A4A] font-semibold px-2 py-1 text-sm sm:text-base w-[32%]">
          Booking Window
        </span>
        <div>
          <span className="text-xs sm:text-sm font-medium text-[#171A19CC]">
            {!bookingWindow || Number(bookingWindow) === 0 ? (
              <>No limit on booking window</>
            ) : (
              <>
                Before{" "}
                <span className="text-[#155EEF] text-sm sm:text-base font-semibold">
                  {bookingWindow} days
                </span>
                , you must book or the window will close.
              </>
            )}
          </span>
        </div>
      </div>

      <div className="flex items-start border-b py-4">
        <span className="text-[#4A4A4A] font-semibold px-2 py-1 text-sm sm:text-base w-[32%]">
          Only In-Policy Booking
        </span>
        <div>
          <label className="inline-flex items-center me-5 ">
            <input
              type="checkbox"
              value=""
              checked={onlyInPolicy}
              readOnly
              className="sr-only peer"
            />
            <div className="relative w-11 h-6 bg-gray-200 rounded-full peer dark:bg-gray-300 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#155EEF]"></div>
          </label>
        </div>
      </div>
    </div>
  );
};

export default HotelTravelPolicy;
