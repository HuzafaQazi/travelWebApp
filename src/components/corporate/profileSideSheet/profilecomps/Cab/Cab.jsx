import React, { useEffect, useRef, useMemo, useState } from "react";
import CabCard from "./CabCard"; // Adjust the path as needed
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSpinner } from "@fortawesome/free-solid-svg-icons";

const Cabs = ({
  booking,
  counts,
  activeTab,
  setActiveTab,
  onClose,
  loadMore,
  hasMore,
  loading,
}) => {
  const tabs = [
    // { label: "All", value: "all" },
    { label: "Approved", value: "approved" },
    { label: "Quoted", value: "quoted" },
    { label: "Booked", value: "booked" },
    { label: "Cancelled", value: "cancelled" },
  ];
  const PAGE_SIZE = 5;
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
  }, [activeTab]);
  const bookingsArray = Array.isArray(booking) ? booking : [];
  const loadMoreRef = useRef(null);

  // Filter bookings locally instead of making API calls
  const filteredBookings = useMemo(() => {
    if (!activeTab || activeTab === "all") {
      return bookingsArray;
    }
    return bookingsArray.filter((b) => b?.bookingStatus === activeTab);
  }, [bookingsArray, activeTab]);

  // Calculate counts from local data
  const tabCounts = useMemo(() => {
    const localCounts = {
      all: bookingsArray.length,
      quoted: bookingsArray.filter((b) => b?.bookingStatus === "quoted").length,
      booked: bookingsArray.filter((b) => b?.bookingStatus === "booked").length,
      cancelled: bookingsArray.filter((b) => b?.bookingStatus === "cancelled")
        .length,
    };
    return localCounts;
  }, [bookingsArray]);

  // Set up Intersection Observer for infinite scroll (only for "all" tab)
  useEffect(() => {
    // if (!hasMore || loading || activeTab !== "all") return;
    if (visibleCount >= filteredBookings.length) return;
    const observer = new IntersectionObserver(
      (entries) => {
        // if (entries[0].isIntersecting) {
        //   loadMore();
        // }
         if (entries[0].isIntersecting) {
          setVisibleCount((prev) =>
            Math.min(prev + PAGE_SIZE, filteredBookings.length)
          );
        }
      },
      { threshold: 0.1 }
    );

    if (loadMoreRef.current) {
      observer.observe(loadMoreRef.current);
    }

    return () => {
      if (loadMoreRef.current) {
        observer.unobserve(loadMoreRef.current);
      }
    };
  }, [loadMore, hasMore, loading, activeTab]);

  // Handle tab changes without API calls
  const handleTabChange = (tabValue) => {
    console.log("Changing cab tab to:", tabValue, "without API call");
    setActiveTab(tabValue);
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Cab Bookings</h2>
      </div>

      {/* Tabs - Show count only for "all", others show filtered count */}
      <div className="flex space-x-4 mb-6 border-b border-gray-200">
        {tabs.map((tab) => (
          <button
            key={tab.value}
            onClick={() => handleTabChange(tab.value)}
            className={`pb-2 px-4 text-sm font-medium transition-colors duration-200 ${
              activeTab === tab.value
                ? "border-b-2 border-[#028fa3] text-[#028fa3]"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            {tab.label}
            {/* ({tabCounts[tab.value] || 0}) */}
          </button>
        ))}
      </div>

      {/* Cab Bookings List */}
      <div className="max-h-[calc(100vh-250px)] overflow-y-auto space-y-4 pr-2">
        {filteredBookings.length === 0 && !loading ? (
          <div className="text-center py-10">
            <p className="text-gray-500 text-lg">
              No cab bookings found for {activeTab} status.
            </p>
          </div>
        ) : (
          <>
            {/* {filteredBookings.map((booking) => (
              <CabCard key={booking?._id || Math.random()} booking={booking} onClose={onClose} />
            ))} */}
            {filteredBookings.slice(0, visibleCount).map((booking) => (
              <CabCard
                key={booking?._id || Math.random()}
                booking={booking}
                onClose={onClose}
              />
            ))}
            {/* Load more only for "all" tab */}
            {/* {hasMore && activeTab === "all" && ( */}
            {visibleCount < filteredBookings.length && (
              <div ref={loadMoreRef} className="py-4 text-center">
                {/* {loading ? (
                  <FontAwesomeIcon
                    icon={faSpinner}
                    spin
                    className="text-[#028fa3] text-xl"
                  />
                ) : (
                  <p className="text-gray-500">Scroll to load more...</p>
                )} */}
                <p className="text-gray-500">Scroll to load more...</p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Cabs;
