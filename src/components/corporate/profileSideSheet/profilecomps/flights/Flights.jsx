import FlightCard from "./FlightCard";
import style from "../styles.module.css";

const Flights = ({ booking, activeTab, setActiveTab, onClose }) => {
  const tabConfig = {
    all: { id: 1, label: "All", status: "all" },
    Confirmed: { id: 2, label: "Upcoming Flights", status: "Confirmed" },
    Completed: { id: 3, label: "Completed", status: "Completed" },
    Cancelled: { id: 4, label: "Failed", status: "FAILED" },
  };

  const handleTabChange = (tabKey) => {
    setActiveTab(tabConfig[tabKey].status);
  };

  return (
    <>
      <div className="p-3 ">
        <div className="flex justify-between items-center border-b pb-2 mb-4">
          {Object.entries(tabConfig).map(([key, { label, status }]) => (
            <span
              key={key}
              className={`text-xs sm:text-lg cursor-pointer ${
                activeTab === status
                  ? "text-[#028FA3] font-semibold"
                  : "text-[#878786] font-normal"
              }`}
              onClick={() => handleTabChange(key)}
            >
              {label}
            </span>
          ))}
        </div>
        <div className={style.Profile1}>
          <div className="flex flex-col gap-3 ">
            {booking && booking.length > 0 ? (
              booking.map((flight) => (
                <FlightCard key={flight.bookingId} flight={flight} onClose={onClose} />
              ))
            ) : (
              <div className="text-center text-gray-500">
                No {activeTab !== "all" ? activeTab : ""} bookings found.
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default Flights;
