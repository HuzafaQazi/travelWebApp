import HotelCard from "./HotelCard";
import style from "../styles.module.css";

const Hotels = ({ bookings, activeTab, setActiveTab, onClose }) => {
  const tabConfig = {
    all: { id: 1, label: "All", status: "all" },
    Confirmed: { id: 2, label: "Upcoming Hotels", status: "Confirmed" },
    Completed: { id: 3, label: "Completed", status: "Completed" },
    Cancelled: { id: 4, label: "Failed", status: "FAILED" },
  };

  const handleTabChange = (tabKey) => {
    setActiveTab(tabConfig[tabKey].status);
  };

  return (
    <div className="p-2">
      <div className="flex justify-between items-center border-b pb-2 mb-4">
        {Object.entries(tabConfig).map(([key, { label, status }]) => (
          <span
            key={key}
            className={`text-lg cursor-pointer ${
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
        <div className="flex flex-col gap-3 ]">
          {bookings && bookings.length > 0 ? (
            bookings.map((hotel) => (
              <HotelCard
                key={hotel.bookingId}
                hotel={hotel}
                onClose={onClose}
              />
            ))
          ) : (
            <div className="text-center text-gray-500">
              No {activeTab !== "all" ? activeTab : ""} bookings found.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Hotels;
