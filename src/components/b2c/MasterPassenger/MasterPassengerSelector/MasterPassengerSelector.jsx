import { useState, useEffect } from "react";
import showToast from "@/utils/toast";
import {
  getMasterPassengers,
  deleteMasterPassenger,
  incrementMasterPassengerUsage,
} from "@/utils/masterPassengerAPI";

const MasterPassengerSelector = ({
  passengerType,
  travelCategory,
  onSelect,
  onClose,
  selectedMasterIds = [],
}) => {
  const [masterPassengers, setMasterPassengers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  // ✅ NEW: Delete confirmation modal state
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [passengerToDelete, setPassengerToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    fetchMasterPassengers();
  }, [passengerType, travelCategory]);

  const fetchMasterPassengers = async () => {
    setLoading(true);
    const result = await getMasterPassengers({
      passengerType,
      travelCategory,
    });

    if (result.success) {
      setMasterPassengers(result.data);
    } else {
      showToast("error", result.message);
    }
    setLoading(false);
  };

  const handleSelect = async (passenger) => {
    await incrementMasterPassengerUsage(passenger._id);
    onSelect(passenger);
    onClose();
  };

  // ✅ UPDATED: Show delete modal instead of window.confirm
  const handleDeleteClick = (passenger, e) => {
    e.stopPropagation();
    setPassengerToDelete(passenger);
    setShowDeleteModal(true);
  };

  // ✅ NEW: Actual delete handler
  const handleConfirmDelete = async () => {
    if (!passengerToDelete) return;

    setIsDeleting(true);
    const result = await deleteMasterPassenger(passengerToDelete._id);

    if (result.success) {
      showToast("success", "Passenger deleted successfully");
      fetchMasterPassengers();
      setShowDeleteModal(false);
      setPassengerToDelete(null);
    } else {
      showToast("error", result.message);
    }
    setIsDeleting(false);
  };

  // ✅ NEW: Cancel delete handler
  const handleCancelDelete = () => {
    setShowDeleteModal(false);
    setPassengerToDelete(null);
  };

  const filteredPassengers = masterPassengers.filter((passenger) => {
    if (selectedMasterIds.includes(passenger._id)) {
      return false;
    }

    const fullName =
      `${passenger.firstName} ${passenger.lastName}`.toLowerCase();
    return fullName.includes(searchTerm.toLowerCase());
  });

  const getPassengerTypeLabel = (type) => {
    const labels = {
      adult: "Adult",
      child: "Child",
      infant: "Infant",
    };
    return labels[type] || type;
  };

  return (
    <>
      <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[80vh] flex flex-col">
          {/* Header */}
          <div className="bg-gradient-to-r from-cyan-500 to-cyan-600 px-6 py-4 rounded-t-2xl">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-white">
                  Select Saved Passenger
                </h2>
                <p className="text-cyan-100 text-sm mt-1">
                  {getPassengerTypeLabel(passengerType)} ·{" "}
                  {travelCategory === "flights" ? "Flights" : "Hotels"}
                </p>
              </div>
              <button
                onClick={onClose}
                className="text-white hover:bg-white/20 rounded-full p-2 transition-colors"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
          </div>

          {/* Search */}
          <div className="p-4 border-b border-gray-200">
            <div className="relative">
              <input
                type="text"
                placeholder="Search by name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none"
              />
              <svg
                className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
          </div>

          {/* Passenger List */}
          <div className="flex-1 overflow-y-auto p-4">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-600"></div>
              </div>
            ) : filteredPassengers.length === 0 ? (
              <div className="text-center py-12">
                <svg
                  className="w-16 h-16 text-gray-300 mx-auto mb-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                  />
                </svg>
                <p className="text-gray-500 text-lg font-medium">
                  {searchTerm
                    ? "No matching passengers found"
                    : selectedMasterIds.length > 0
                    ? "All saved passengers are already selected"
                    : "No saved passengers found"}
                </p>
                <p className="text-gray-400 text-sm mt-1">
                  {searchTerm
                    ? "Try a different search term"
                    : selectedMasterIds.length > 0
                    ? "Change passenger names to select different saved passengers"
                    : "Save passenger details for quick access"}
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {filteredPassengers.map((passenger) => (
                  <div
                    key={passenger._id}
                    onClick={() => handleSelect(passenger)}
                    className="group relative p-4 border border-gray-200 rounded-lg hover:border-cyan-500 hover:bg-cyan-50 transition-all cursor-pointer"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <h3 className="text-lg font-semibold text-gray-900">
                            {passenger.title?.value || passenger.title}{" "}
                            {passenger.firstName} {passenger.lastName}
                          </h3>
                          <span className="px-2 py-0.5 bg-cyan-100 text-cyan-700 text-xs font-medium rounded whitespace-nowrap">
                            {getPassengerTypeLabel(passenger.passengerType)}
                          </span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2 text-sm text-gray-600">
                          {passenger.email && (
                            <div className="flex items-center gap-1">
                              <svg
                                className="w-4 h-4 text-gray-400 flex-shrink-0"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                                />
                              </svg>
                              <span className="truncate">
                                {passenger.email}
                              </span>
                            </div>
                          )}
                          {passenger.contactNo && (
                            <div className="flex items-center gap-1">
                              <svg
                                className="w-4 h-4 text-gray-400 flex-shrink-0"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                                />
                              </svg>
                              <span>{passenger.contactNo}</span>
                            </div>
                          )}
                          {passenger.passportNo && (
                            <div className="flex items-center gap-1">
                              <svg
                                className="w-4 h-4 text-gray-400 flex-shrink-0"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                                />
                              </svg>
                              <span className="truncate">
                                Passport: {passenger.passportNo}
                              </span>
                            </div>
                          )}
                          {passenger.pan && (
                            <div className="flex items-center gap-1">
                              <svg
                                className="w-4 h-4 text-gray-400 flex-shrink-0"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2"
                                />
                              </svg>
                              <span>PAN: {passenger.pan}</span>
                            </div>
                          )}
                        </div>

                        {passenger.usageCount > 0 && (
                          <div className="flex items-center gap-1 mt-2 text-xs text-gray-500">
                            <svg
                              className="w-3 h-3"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                              />
                            </svg>
                            <span>Used {passenger.usageCount} times</span>
                          </div>
                        )}
                      </div>

                      {/* ✅ UPDATED: Always visible delete button */}
                      <button
                        onClick={(e) => handleDeleteClick(passenger, e)}
                        className="flex-shrink-0 p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete passenger"
                      >
                        <svg
                          className="w-5 h-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                          />
                        </svg>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="border-t border-gray-200 p-4 bg-gray-50 rounded-b-2xl">
            <button
              onClick={onClose}
              className="w-full px-4 py-2 bg-gray-200 text-gray-700 font-medium rounded-lg hover:bg-gray-300 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>

      {/* ✅ NEW: Delete Confirmation Modal */}
      {showDeleteModal && passengerToDelete && (
        <div className="fixed inset-0 z-[100000] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
            {/* Modal Header */}
            <div className="bg-red-500 px-6 py-4">
              <div className="flex items-center gap-3">
                <div className="flex-shrink-0 w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                  <svg
                    className="w-6 h-6 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                    />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-white">
                  Delete Passenger?
                </h3>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6">
              <p className="text-gray-700 mb-4">
                Are you sure you want to delete{" "}
                <span className="font-semibold">
                  {passengerToDelete.title?.value || passengerToDelete.title}{" "}
                  {passengerToDelete.firstName} {passengerToDelete.lastName}
                </span>
                ?
              </p>
              <p className="text-sm text-gray-500">
                This action cannot be undone. All saved information for this
                passenger will be permanently removed.
              </p>
            </div>

            {/* Modal Footer */}
            <div className="bg-gray-50 px-6 py-4 flex gap-3 justify-end">
              <button
                onClick={handleCancelDelete}
                disabled={isDeleting}
                className="px-4 py-2 bg-white border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                disabled={isDeleting}
                className="px-4 py-2 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isDeleting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                    Deleting...
                  </>
                ) : (
                  <>
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                      />
                    </svg>
                    Delete
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default MasterPassengerSelector;
