import React, { useState, useEffect } from "react";
import {
  getMasterPassengers,
  deleteMasterPassenger,
} from "@/utils/masterPassengerAPI";
import showToast from "@/utils/toast";
import MasterPassengerForm from "./MasterPassengerForm";

export default function MasterPassengerList() {
  const [passengers, setPassengers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPassenger, setSelectedPassenger] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [filterType, setFilterType] = useState("all");
  const [filterCategory, setFilterCategory] = useState("all");
  const [deleting, setDeleting] = useState(null);

  // Limit and count tracking
  const [limits, setLimits] = useState({
    maxFlightPassengersLimit: 0,
    maxHotelPassengersLimit: 0,
    maxTotalPassengersLimit: 0,
  });
  const [counts, setCounts] = useState({
    totalCount: 0,
    flightCount: 0,
    hotelCount: 0,
    bothCount: 0,
    effectiveFlightCount: 0,
    effectiveHotelCount: 0,
  });
  const [canAdd, setCanAdd] = useState({
    canAddFlight: true,
    canAddHotel: true,
    canAddBoth: true,
    canAddAny: true,
  });
  const [remaining, setRemaining] = useState({
    flightRemaining: 0,
    hotelRemaining: 0,
    totalRemaining: 0,
  });

  useEffect(() => {
    fetchPassengers();
  }, [filterType, filterCategory]);

  const fetchPassengers = async () => {
    setLoading(true);
    const filters = {};

    if (filterType !== "all") {
      filters.passengerType = filterType;
    }

    if (filterCategory !== "all") {
      filters.travelCategory = filterCategory;
    }

    const result = await getMasterPassengers(filters);

    if (result.success) {
      setPassengers(result.data);
      setLimits(result.limits || {});
      setCounts(result.counts || {});
      setCanAdd(result.canAdd || {});
      setRemaining(result.remaining || {});
    } else {
      showToast("error", result.message);
    }
    setLoading(false);
  };

  const handleDelete = async (passengerId) => {
    if (!window.confirm("Are you sure you want to delete this passenger?")) {
      return;
    }

    setDeleting(passengerId);
    const result = await deleteMasterPassenger(passengerId);

    if (result.success) {
      showToast("success", "Passenger deleted successfully");
      fetchPassengers();
    } else {
      showToast("error", result.message);
    }
    setDeleting(null);
  };

  const handleEdit = (passenger) => {
    setSelectedPassenger(passenger);
    setShowForm(true);
  };

  const handleAdd = () => {
    // Check if user can add any passenger
    if (!canAdd.canAddAny) {
      if (counts.totalCount >= limits.maxTotalPassengersLimit) {
        showToast(
          "error",
          `You have reached the maximum limit of ${limits.maxTotalPassengersLimit} passengers.`
        );
      } else {
        showToast(
          "error",
          "You have reached the passenger limits for all categories."
        );
      }
      return;
    }

    setSelectedPassenger(null);
    setShowForm(true);
  };

  const handleFormClose = () => {
    setShowForm(false);
    setSelectedPassenger(null);
    fetchPassengers();
  };

  const formatDate = (date) => {
    if (!date) return "N/A";
    return new Date(date).toLocaleDateString("en-GB");
  };

  const getPassengerTypeLabel = (type) => {
    const labels = { adult: "Adult", child: "Child", infant: "Infant" };
    return labels[type] || type;
  };

  const getTravelCategoryLabel = (category) => {
    const labels = {
      flights: "Flights",
      hotel: "Hotels",
      both: "Both",
    };
    return labels[category] || category;
  };

  const getBadgeColor = (type) => {
    const colors = {
      adult: "bg-blue-100 text-blue-700",
      child: "bg-green-100 text-green-700",
      infant: "bg-purple-100 text-purple-700",
    };
    return colors[type] || "bg-gray-100 text-gray-700";
  };

  const getProgressColor = (remaining, limit) => {
    const percentage = ((limit - remaining) / limit) * 100;
    if (percentage >= 90) return "bg-danger";
    if (percentage >= 70) return "bg-warning";
    return "bg-success";
  };

  if (showForm) {
    return (
      <MasterPassengerForm
        passenger={selectedPassenger}
        onClose={handleFormClose}
        onSaved={handleFormClose}
        limits={limits}
        counts={counts}
        canAdd={canAdd}
        remaining={remaining}
      />
    );
  }

  return (
    <div>
      {/* Passenger Limits Banner */}
      <div className="card mb-4 shadow-sm border-0">
        <div className="card-body">
          <div className="row g-3">
            {/* Flight Passengers */}
            <div className="col-md-4">
              <div className="d-flex align-items-center justify-content-between mb-2">
                <div className="d-flex align-items-center gap-2">
                  <i className="bi bi-airplane-fill text-primary"></i>
                  <h6 className="mb-0 fw-semibold">Flight Passengers</h6>
                </div>
                <span className="badge bg-primary">
                  {counts.effectiveFlightCount} /{" "}
                  {limits.maxFlightPassengersLimit}
                </span>
              </div>
              <div className="progress" style={{ height: "8px" }}>
                <div
                  className={`progress-bar ${getProgressColor(
                    remaining.flightRemaining,
                    limits.maxFlightPassengersLimit
                  )}`}
                  role="progressbar"
                  style={{
                    width: `${
                      (counts.effectiveFlightCount /
                        limits.maxFlightPassengersLimit) *
                      100
                    }%`,
                  }}
                ></div>
              </div>
              <small className="text-muted">
                {remaining.flightRemaining} slot
                {remaining.flightRemaining !== 1 ? "s" : ""} remaining
              </small>
            </div>

            {/* Hotel Passengers */}
            <div className="col-md-4">
              <div className="d-flex align-items-center justify-content-between mb-2">
                <div className="d-flex align-items-center gap-2">
                  <i className="bi bi-building text-success"></i>
                  <h6 className="mb-0 fw-semibold">Hotel Passengers</h6>
                </div>
                <span className="badge bg-success">
                  {counts.effectiveHotelCount} /{" "}
                  {limits.maxHotelPassengersLimit}
                </span>
              </div>
              <div className="progress" style={{ height: "8px" }}>
                <div
                  className={`progress-bar ${getProgressColor(
                    remaining.hotelRemaining,
                    limits.maxHotelPassengersLimit
                  )}`}
                  role="progressbar"
                  style={{
                    width: `${
                      (counts.effectiveHotelCount /
                        limits.maxHotelPassengersLimit) *
                      100
                    }%`,
                  }}
                ></div>
              </div>
              <small className="text-muted">
                {remaining.hotelRemaining} slot
                {remaining.hotelRemaining !== 1 ? "s" : ""} remaining
              </small>
            </div>

            {/* Total Passengers */}
            <div className="col-md-4">
              <div className="d-flex align-items-center justify-content-between mb-2">
                <div className="d-flex align-items-center gap-2">
                  <i className="bi bi-people-fill text-info"></i>
                  <h6 className="mb-0 fw-semibold">Total Passengers</h6>
                </div>
                <span className="badge bg-info">
                  {counts.totalCount} / {limits.maxTotalPassengersLimit}
                </span>
              </div>
              <div className="progress" style={{ height: "8px" }}>
                <div
                  className={`progress-bar ${getProgressColor(
                    remaining.totalRemaining,
                    limits.maxTotalPassengersLimit
                  )}`}
                  role="progressbar"
                  style={{
                    width: `${
                      (counts.totalCount / limits.maxTotalPassengersLimit) * 100
                    }%`,
                  }}
                ></div>
              </div>
              <small className="text-muted">
                {remaining.totalRemaining} slot
                {remaining.totalRemaining !== 1 ? "s" : ""} remaining
              </small>
            </div>
          </div>

          {/* Warning when nearing limit */}
          {!canAdd.canAddAny && (
            <div
              className="alert alert-danger mt-3 mb-0 d-flex align-items-center"
              role="alert"
            >
              <i className="bi bi-exclamation-triangle-fill me-2"></i>
              <div>
                <strong>Passenger Limit Reached!</strong> You have reached the
                maximum number of passengers allowed. Please delete some
                passengers to add new ones.
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Filters and Add Button */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="flex-1">
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="form-control"
          >
            <option value="all">All Types</option>
            <option value="adult">Adults</option>
            <option value="child">Children</option>
            <option value="infant">Infants</option>
          </select>
        </div>
        <div className="flex-1">
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="form-control"
          >
            <option value="all">All Categories</option>
            <option value="flights">Flights</option>
            <option value="hotel">Hotels</option>
            <option value="both">Both</option>
          </select>
        </div>
        <button
          onClick={handleAdd}
          className="btn btn-primary"
          disabled={!canAdd.canAddAny}
          style={{
            backgroundColor: canAdd.canAddAny ? "#028FA3" : "#6c757d",
            border: "none",
            whiteSpace: "nowrap",
            cursor: canAdd.canAddAny ? "pointer" : "not-allowed",
            opacity: canAdd.canAddAny ? 1 : 0.65,
          }}
          title={
            !canAdd.canAddAny
              ? `Limit reached (${counts.totalCount}/${limits.maxTotalPassengersLimit})`
              : "Add new passenger"
          }
        >
          {!canAdd.canAddAny && <i className="bi bi-lock-fill me-2"></i>}+ Add
          Passenger
        </button>
      </div>

      {/* Passenger List */}
      {loading ? (
        <div className="text-center py-12">
          <div className="spinner-border text-primary" role="status">
            <span className="sr-only">Loading...</span>
          </div>
        </div>
      ) : passengers.length === 0 ? (
        <div className="text-center py-12">
          <svg
            className="w-20 h-20 mx-auto mb-4 text-gray-300"
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
          <p className="text-gray-500 text-lg font-medium mb-2">
            No saved passengers
          </p>
          <p className="text-gray-400 text-sm mb-4">
            Start by adding your first passenger
          </p>
          <button
            onClick={handleAdd}
            className="btn btn-primary"
            disabled={!canAdd.canAddAny}
            style={{
              backgroundColor: canAdd.canAddAny ? "#028FA3" : "#6c757d",
              border: "none",
              cursor: canAdd.canAddAny ? "pointer" : "not-allowed",
              opacity: canAdd.canAddAny ? 1 : 0.65,
            }}
          >
            + Add Passenger
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {passengers.map((passenger) => (
            <div
              key={passenger._id}
              className="border rounded-lg p-4 hover:shadow-md transition-shadow bg-white"
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h4 className="font-semibold text-lg mb-0">
                      {passenger.title} {passenger.firstName}{" "}
                      {passenger.lastName}
                    </h4>
                    <span
                      className={`px-2 py-1 text-xs font-medium rounded ${getBadgeColor(
                        passenger.passengerType
                      )}`}
                    >
                      {getPassengerTypeLabel(passenger.passengerType)}
                    </span>
                    <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs font-medium rounded">
                      {getTravelCategoryLabel(passenger.travelCategory)}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-600">
                    {passenger.email && (
                      <div className="flex items-center gap-2">
                        <svg
                          className="w-4 h-4 text-gray-400"
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
                        <span className="truncate">{passenger.email}</span>
                      </div>
                    )}
                    {passenger.contactNo && (
                      <div className="flex items-center gap-2">
                        <svg
                          className="w-4 h-4 text-gray-400"
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
                    {passenger.dateOfBirth && (
                      <div className="flex items-center gap-2">
                        <svg
                          className="w-4 h-4 text-gray-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                          />
                        </svg>
                        <span>DOB: {formatDate(passenger.dateOfBirth)}</span>
                      </div>
                    )}
                    {passenger.passportNo && (
                      <div className="flex items-center gap-2">
                        <svg
                          className="w-4 h-4 text-gray-400"
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
                        <span>Passport: {passenger.passportNo}</span>
                      </div>
                    )}
                  </div>

                  {passenger.usageCount > 0 && (
                    <div className="flex items-center gap-2 mt-2 text-xs text-gray-500">
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
                      <span>
                        Used {passenger.usageCount} time
                        {passenger.usageCount !== 1 ? "s" : ""}
                      </span>
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2 ml-4">
                  <button
                    onClick={() => handleEdit(passenger)}
                    className="btn btn-sm btn-outline-primary"
                    title="Edit"
                  >
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
                        d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                      />
                    </svg>
                  </button>
                  <button
                    onClick={() => handleDelete(passenger._id)}
                    disabled={deleting === passenger._id}
                    className="btn btn-sm btn-outline-danger"
                    title="Delete"
                  >
                    {deleting === passenger._id ? (
                      <div
                        className="spinner-border spinner-border-sm"
                        role="status"
                      >
                        <span className="sr-only">Loading...</span>
                      </div>
                    ) : (
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
                    )}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
