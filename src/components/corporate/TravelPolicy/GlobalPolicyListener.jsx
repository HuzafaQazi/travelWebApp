// GlobalPolicyListener.jsx
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { useSelector, useDispatch } from "react-redux";
import { resetPolicyChanged } from "@/store/slices/travellersSlice";

function GlobalPolicyListener() {
  const router = useRouter();
  const dispatch = useDispatch();
  const { policyChanged, showPolicyModal } = useSelector(
    (state) => state.travellers
  );
  const [visible, setVisible] = useState(false);

  // List of pages where we actually want to show the modal
  const allowedPaths = [
    "/corporate/auth/booking/flights/flightListing",
    "/corporate/auth/booking/flights/review",
    "/corporate/auth/booking/hotels/hotelListing",
    "/corporate/auth/booking/hotels/reviewBooking",
    // ... Add more pages in the future as needed
  ];

  useEffect(() => {
    const isAllowedPath = allowedPaths.includes(router.pathname);

    if (policyChanged && showPolicyModal && isAllowedPath) {
      // Show the modal only if on an allowed path
      setVisible(true);
    } else if (!isAllowedPath) {
      // If the user navigates away from an allowed path, reset the state
      dispatch(resetPolicyChanged());
      setVisible(false);
    }
  }, [policyChanged, showPolicyModal, router.pathname, dispatch]);

  const handleClose = () => {
    setVisible(false);
    // Reset the Redux flags so we don't keep triggering
    dispatch(resetPolicyChanged());

    // Optionally redirect them, e.g. back to /corporate/auth/booking
    // or anywhere else you prefer
    router.replace("/corporate/auth/booking");
  };

  return (
    <>
      {visible && (
        <div className="fixed inset-0 bg-black/60 z-[9999] flex items-center justify-center">
          <div className="bg-white p-6 rounded-md text-center max-w-md mx-auto">
            <h3 className="text-xl font-bold mb-3 text-red-600">
              Travel Policy Changed
            </h3>
            <p className="text-gray-700">
              Your company’s travel policy has changed. You must reselect
              travelers to comply with the new policy.
            </p>
            <button
              onClick={handleClose}
              className="mt-4 px-4 py-2 bg-[#028fa3] text-white font-medium rounded-md"
            >
              OK
            </button>
          </div>
        </div>
      )}
    </>
  );
}

export default GlobalPolicyListener;
