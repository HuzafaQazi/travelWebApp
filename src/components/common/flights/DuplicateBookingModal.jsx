
import { useEffect, useRef } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faTriangleExclamation,
  faTicket,
  faCircleXmark,
  faCircleCheck,
} from "@fortawesome/free-solid-svg-icons";

/**
 * DuplicateBookingModal
 *
 * Props:
 *   passengers  – array of DuplicateBookingInfo objects from the backend
 *   onConfirm   – called when the user clicks "Yes, proceed anyway"
 *   onCancel    – called when the user dismisses
 */
export default function DuplicateBookingModal({
  passengers = [],
  onConfirm,
  onCancel,
}) {
  const cancelBtnRef = useRef(null);

  // Trap focus on mount; return focus on unmount
  useEffect(() => {
    cancelBtnRef.current?.focus();
    const handleKey = (e) => {
      if (e.key === "Escape") onCancel();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [onCancel]);

  return (
    // ── Backdrop ────────────────────────────────────────────────────────────
    <div
      className="fixed inset-0 z-[99999] flex items-center justify-center p-4"
      style={{
        backgroundColor: "rgba(0,0,0,0.55)",
        backdropFilter: "blur(3px)",
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onCancel();
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="dup-modal-title"
    >
      {/* ── Card ──────────────────────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
        {/* Header strip */}
        <div className="bg-amber-50 border-b border-amber-200 px-6 py-4 flex items-start gap-3">
          <div className="mt-0.5 text-amber-500 text-2xl flex-shrink-0">
            <FontAwesomeIcon icon={faTriangleExclamation} />
          </div>
          <div>
            <h2
              id="dup-modal-title"
              className="text-base font-semibold text-gray-900 leading-snug"
            >
              Duplicate Booking Detected
            </h2>
            <p className="text-sm text-gray-600 mt-0.5">
              One or more passengers already have an active booking on this
              flight.
            </p>
          </div>
        </div>

        {/* Passenger list */}
        <div className="px-6 py-4 space-y-3 max-h-60 overflow-y-auto">
          {passengers.map((pax, idx) => (
            <div
              key={idx}
              className="flex items-start gap-3 rounded-xl border border-gray-100 bg-gray-50 p-3"
            >
              <div className="mt-0.5 text-[#028fa3] text-lg flex-shrink-0">
                <FontAwesomeIcon icon={faTicket} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-900 text-sm truncate">
                  {pax.passengerName}
                </p>
                <div className="flex flex-wrap gap-x-3 gap-y-0.5 mt-1 text-xs text-gray-500">
                  {pax.pnr && (
                    <span>
                      PNR:&nbsp;
                      <span className="font-semibold text-gray-700">
                        {pax.pnr}
                      </span>
                    </span>
                  )}
                  {pax.flightRoute && (
                    <span>
                      Route:&nbsp;
                      <span className="font-semibold text-gray-700">
                        {pax.flightRoute}
                      </span>
                    </span>
                  )}
                  {pax.departureDate && (
                    <span>
                      Date:&nbsp;
                      <span className="font-semibold text-gray-700">
                        {pax.departureDate}
                      </span>
                    </span>
                  )}
                  {pax.existingBookingId && (
                    <span>
                      Booking ID:&nbsp;
                      <span className="font-semibold text-gray-700">
                        {pax.existingBookingId}
                      </span>
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Warning note */}
        <div className="px-6 pb-2">
          <p className="text-xs text-gray-500 leading-relaxed">
            Proceeding may result in a double booking. Please confirm only if
            you intend to create an additional booking for the listed
            passenger(s).
          </p>
        </div>

        {/* Action buttons */}
        <div className="px-6 py-4 flex flex-col-reverse sm:flex-row gap-3 border-t border-gray-100">
          <button
            ref={cancelBtnRef}
            onClick={onCancel}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5
                       rounded-full border border-gray-300 text-gray-700 text-sm font-medium
                       hover:bg-gray-50 active:scale-[.98] transition-all"
          >
            <FontAwesomeIcon icon={faCircleXmark} />
            Cancel
          </button>

          <button
            onClick={onConfirm}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5
                       rounded-full bg-[#028fa3] text-white text-sm font-medium
                       hover:bg-[#027a8c] active:scale-[.98] transition-all shadow-sm"
          >
            <FontAwesomeIcon icon={faCircleCheck} />
            Yes, proceed anyway
          </button>
        </div>
      </div>
    </div>
  );
}
