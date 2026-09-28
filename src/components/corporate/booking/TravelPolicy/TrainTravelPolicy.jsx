import style from "./../styles.module.css";
import { formatPrice } from "@/utils/common";

const TrainTravelPolicy = ({ policyObj }) => {
    if (!policyObj) {
        return (
            <div className="p-2 text-sm">
                <span>No Train Travel Policy Assigned</span>
            </div>
        );
    }

    const {
        eligibility,
        budget,
        bookingWindow,
        approvalConfiguration,
        dateChangeAllowed,
    } = policyObj;

    const eligibilityText = (() => {
        if (!eligibility || eligibility.length === 0) return "None";
        let arr = [];
        if (eligibility.includes("1")) arr.push("Self-book");
        if (eligibility.includes("2")) arr.push("Book for others");
        return arr.join(" + ");
    })();

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

            {/* Budget Section */}
            <div className="flex items-start border-b py-4">
                <span className="text-[#4A4A4A] font-semibold px-2 py-1 text-sm sm:text-base w-[32%]">
                    Budget
                </span>
                <div className="my-2">
                    <div className="mx-1">
                        <span className="text-xs sm:text-base font-semibold text-[#155EEF]">
                            Train Travel
                        </span>
                        <p className="text-sm font-medium text-[#171A19CC]">
                            {!budget || budget === 0
                                ? "No limit"
                                : `Rs ${formatPrice(budget)}`}
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
                                <span className="text-[#155EEF] text-sm sm:text-base font-semibold">
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
                    <label className="inline-flex items-center me-5 cursor-pointer">
                        <input
                            type="checkbox"
                            checked={onlyInPolicy}
                            readOnly
                            value=""
                            className="sr-only peer"
                        />
                        <div className="relative w-11 h-6 bg-gray-200 rounded-full peer dark:bg-gray-300 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#155EEF]" />
                    </label>
                </div>
            </div>
        </div>
    );
};

export default TrainTravelPolicy;