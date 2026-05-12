import { useState } from "react";
import showToast from "@/utils/toast";
import { createMasterPassenger } from "@/utils/masterPassengerAPI";

const SaveMasterPassengerModal = ({
  passengerData,
  passengerType,
  travelCategory,
  onClose,
  onSaved,
}) => {
  const [saving, setSaving] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(
    travelCategory || "both"
  );

  const handleSave = async () => {
    setSaving(true);

    try {
      const dataToSave = {
        ...passengerData,
        passengerType,
        title: passengerData.title?.value || passengerData.title,
        travelCategory: selectedCategory,
      };

      const result = await createMasterPassenger(dataToSave);

      if (result.success) {
        showToast("success", "Passenger saved successfully!");
        if (onSaved) onSaved(result.data);
        onClose();
      } else {
        showToast("error", result.message);
      }
    } catch (error) {
      showToast("error", "Failed to save passenger");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
        {/* Header */}
        <div className="bg-gradient-to-r from-cyan-500 to-cyan-600 px-6 py-4 rounded-t-2xl">
          <h2 className="text-xl font-bold text-white">
            Save Passenger Details
          </h2>
          <p className="text-cyan-100 text-sm mt-1">
            Save for quick access in future bookings
          </p>
        </div>

        {/* Body */}
        <div className="p-6">
          <div className="mb-4">
            <p className="text-sm text-gray-600 mb-2">Passenger Name:</p>
            <p className="text-lg font-semibold text-gray-900">
              {passengerData.title?.value || passengerData.title}{" "}
              {passengerData.firstName} {passengerData.lastName}
            </p>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Save for:
            </label>
            <div className="space-y-2">
              <label className="flex items-center p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                <input
                  type="radio"
                  value="both"
                  checked={selectedCategory === "both"}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-4 h-4 text-cyan-600 focus:ring-cyan-500"
                />
                <span className="ml-3 text-sm text-gray-900">
                  Both Flights & Hotels
                </span>
              </label>
              <label className="flex items-center p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                <input
                  type="radio"
                  value="flights"
                  checked={selectedCategory === "flights"}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-4 h-4 text-cyan-600 focus:ring-cyan-500"
                />
                <span className="ml-3 text-sm text-gray-900">Flights Only</span>
              </label>
              <label className="flex items-center p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                <input
                  type="radio"
                  value="hotel"
                  checked={selectedCategory === "hotel"}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-4 h-4 text-cyan-600 focus:ring-cyan-500"
                />
                <span className="ml-3 text-sm text-gray-900">Hotels Only</span>
              </label>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            <button
              onClick={handleSave}
              disabled={saving}
              className="w-full bg-gradient-to-r from-cyan-500 to-cyan-600 text-white font-semibold py-3 rounded-lg hover:from-cyan-600 hover:to-cyan-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
            >
              {saving ? (
                <span className="flex items-center justify-center">
                  <svg
                    className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Saving...
                </span>
              ) : (
                "Save Passenger"
              )}
            </button>

            <button
              onClick={onClose}
              disabled={saving}
              className="w-full bg-gray-100 text-gray-700 font-semibold py-3 rounded-lg hover:bg-gray-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SaveMasterPassengerModal;
