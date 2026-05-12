import HeaderCommon from "@/components/HeaderCommon/HeaderCommon";
import B2CHeader from "@/components/flights/B2cHeader/Header";
import style from "./style.module.css";
import { useState, useEffect, useRef } from "react";
import ProtectedRoute from "@/components/events/protectedRoute/ProtectedRoute";
import { ChevronDown, ChevronUp, Plus, Minus } from "lucide-react";
import { MapPinIcon, CalendarIcon } from "@heroicons/react/24/solid";
import SuperRoomBooking from "../../components/hotelRoomEvent/superiorRoom";
import BusinessClassRoomBooking from "../../components/hotelRoomEvent/businessRoom";
import JuniorSuiteBooking from "../../components/hotelRoomEvent/juniorRoom";
import HotelCard from "../../components/events/hotelcard/hotelcard";
import axios from "@/utils/axios/axios";
import config from "@/config";

export default function EventForm() {
  const bookingSectionRef = useRef(null);

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [destination, setDestination] = useState(
    "RADISSON BLU HOTEL, Kannan Colony, Pazavanthangal, Chennai, Tamil Nadu, India"
  );

  const [roomAvailability, setRoomAvailability] = useState({
    superior: 0,
    business: 0,
    junior: 0,
  });

  const [checkinDate, setCheckinDate] = useState("");
  const [checkoutDate, setCheckoutDate] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [rooms, setRooms] = useState(1);
  const [roomsData, setRoomsData] = useState([
    {
      id: 1,
      adults: 1,
      children: 0,
      childrenAges: [],
    },
  ]);

  useEffect(() => {
    const fetchRoomAvailability = async () => {
      try {
        setIsLoading(true);
        // Replace with your actual API endpoint
        const response = await axios(config.EVENTS_ROOM_AVAILS);

        if (response?.data?.status) {
          // Convert array to object for easier access
          const availabilityData = {};
          response?.data?.data.forEach((room) => {
            availabilityData[room.roomType] = room.availableRooms;
          });

          setRoomAvailability(availabilityData);
        } else {
          throw new Error("Failed to fetch room availability");
        }
      } catch (err) {
        console.error("Error fetching room availability:", err);
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRoomAvailability();
  }, []);

  const handleScroll = () => {
    if (bookingSectionRef.current) {
      bookingSectionRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  const addRoom = () => {
    if (rooms < 5) {
      setRooms(rooms + 1);
      setRoomsData([
        ...roomsData,
        {
          id: rooms + 1,
          adults: 1,
          children: 0,
          childrenAges: [],
        },
      ]);
    }
  };

  const removeRoom = (roomId) => {
    if (rooms > 1) {
      setRooms(rooms - 1);
      setRoomsData(roomsData.filter((room) => room.id !== roomId));
    }
  };

  const incrementAdults = (roomId) => {
    setRoomsData(
      roomsData.map((room) => {
        if (room.id === roomId && room.adults < 4) {
          return { ...room, adults: room.adults + 1 };
        }
        return room;
      })
    );
  };

  const decrementAdults = (roomId) => {
    setRoomsData(
      roomsData.map((room) => {
        if (room.id === roomId && room.adults > 1) {
          return { ...room, adults: room.adults - 1 };
        }
        return room;
      })
    );
  };

  const incrementChildren = (roomId) => {
    setRoomsData(
      roomsData.map((room) => {
        if (room.id === roomId && room.children < 4) {
          const updatedChildrenAges = [...room.childrenAges, 0];
          return {
            ...room,
            children: room.children + 1,
            childrenAges: updatedChildrenAges,
          };
        }
        return room;
      })
    );
  };

  const decrementChildren = (roomId) => {
    setRoomsData(
      roomsData.map((room) => {
        if (room.id === roomId && room.children > 0) {
          const updatedChildrenAges = room.childrenAges.slice(0, -1);
          return {
            ...room,
            children: room.children - 1,
            childrenAges: updatedChildrenAges,
          };
        }
        return room;
      })
    );
  };

  const updateChildAge = (roomId, childIndex, age) => {
    setRoomsData(
      roomsData.map((room) => {
        if (room.id === roomId) {
          const updatedChildrenAges = [...room.childrenAges];
          updatedChildrenAges[childIndex] = parseInt(age);
          return { ...room, childrenAges: updatedChildrenAges };
        }
        return room;
      })
    );
  };

  const getTotalGuests = () => {
    return roomsData.reduce((total, room) => {
      return total + room.adults + room.children;
    }, 0);
  };

  const handleDone = () => {
    setIsOpen(false);
    // Additional logic if needed when selection is complete
  };

  // Min and max dates
  const minDate = "2025-07-01";
  const maxDate = "2025-07-07";

  useEffect(() => {
    // Set default dates
    setCheckinDate("2025-07-01");
    setCheckoutDate("2025-07-02");
  }, []);

  const handleCheckinChange = (e) => {
    const newCheckinDate = e.target.value;
    setCheckinDate(newCheckinDate);

    // If checkout is before new checkin, update checkout to the day after checkin
    if (newCheckinDate >= checkoutDate) {
      const nextDay = new Date(newCheckinDate);
      nextDay.setDate(nextDay.getDate() + 1);
      const nextDayFormatted = nextDay.toISOString().split("T")[0];

      // But don't exceed max date
      if (nextDayFormatted <= maxDate) {
        setCheckoutDate(nextDayFormatted);
      } else {
        setCheckoutDate(maxDate);
      }
    }
  };

  // Children age options from 2 to 12
  const childAgeOptions = Array.from({ length: 11 }, (_, i) => i + 2);

  return (
    <ProtectedRoute>
      {/* <div className="flex flex-col justify-between relative w-full h-[50vh] overflow-hidden"> */}
      <div className={style.relativeContainer1}>
        <div className={style.header}>
          {/* <HeaderCommon /> */}
          <B2CHeader/>
        </div>
        {/* <div className="bg-[#028fa3] h-[50vh]"></div> */}
        <div className={style.Bgimage1}></div>
        <div className="absolute top-[15%] sm:top-[30%] left-0 w-[100%] flex py-5">
          <div className="relative rounded-md bg-white py-2 w-[95%] px-4 mx-auto">
            <form className="flex flex-col items-center space-x-4 w-full">
              <div className="flex flex-col sm:flex-row w-full">
                {/* Destination or Hotel Input */}
                <div className="w-full sm:w-1/3">
                  <div className="flex flex-col">
                    <label htmlFor="destination" className="text-gray-500">
                      Where are you going?
                    </label>
                    <div className="flex items-center border border-gray-300 p-2 rounded shadow-sm">
                      <MapPinIcon className="h-5 w-5 text-black" />
                      <input
                        id="destination"
                        type="text"
                        placeholder="Destination or hotel"
                        className="flex-1 ml-2 text-black placeholder-gray-400 focus:outline-none"
                        value={destination}
                        readOnly
                        // onChange={(e) => setDestination(e.target.value)}
                      />
                    </div>
                  </div>
                </div>

                {/* Check-in Date Selector */}
                <div className="w-full sm:w-1/2 flex mx-2 sm:mx-0 gap-3">
                  <div className="w-1/2">
                    <div className="flex flex-col">
                      <label htmlFor="checkin" className="text-gray-500">
                        Check-in
                      </label>
                      <div className="flex items-center border border-gray-300 p-2 rounded shadow-sm">
                        <CalendarIcon className="h-5 w-5 text-black" />
                        <input
                          id="checkin"
                          type="date"
                          className="flex-1 ml-2 text-black focus:outline-none"
                          value={checkinDate}
                          onChange={handleCheckinChange}
                          min={minDate}
                          max={maxDate}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Check-out Date Selector */}
                  <div className="w-1/2">
                    <div className="flex flex-col">
                      <label htmlFor="checkout" className="text-gray-500">
                        Check-out
                      </label>
                      <div className="flex items-center border border-gray-300 p-2 rounded shadow-sm">
                        <CalendarIcon className="h-5 w-5 text-black" />
                        <input
                          id="checkout"
                          type="date"
                          className="flex-1 ml-2 text-black focus:outline-none"
                          value={checkoutDate}
                          onChange={(e) => setCheckoutDate(e.target.value)}
                          min={checkinDate}
                          max={maxDate}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* rooms and guests */}
                <div className="flex flex-col w-full sm:w-1/3">
                  <label htmlFor="roomsguests" className="text-gray-500">
                    Rooms & Guests
                  </label>
                  <div className="relative w-full font-sans">
                    <button
                      type="button"
                      onClick={toggleDropdown}
                      className="flex items-center justify-between w-full p-2 border border-gray-300 rounded-md shadow-sm bg-white"
                      aria-expanded={isOpen}
                      aria-haspopup="true"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="text-gray-500">
                          <svg
                            className="w-6 h-6"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                            ></path>
                          </svg>
                        </div>
                        <div>
                          <span className="font-medium text-gray-800">
                            {rooms} {rooms === 1 ? "room" : "rooms"},{" "}
                            {getTotalGuests()}{" "}
                            {getTotalGuests() === 1 ? "guest" : "guests"}
                          </span>
                        </div>
                      </div>
                      <div className="text-gray-500">
                        {isOpen ? (
                          <ChevronUp size={20} />
                        ) : (
                          <ChevronDown size={20} />
                        )}
                      </div>
                    </button>

                    {/* Dropdown Panel */}
                    {isOpen && (
                      <div
                        className="absolute z-50 w-full mt-2 bg-white border border-gray-200 rounded-md shadow-lg"
                        style={{ zIndex: 50 }}
                      >
                        <div className="p-4">
                          {/* Rooms Counter */}
                          <div className="flex items-center justify-between mb-6">
                            <span className="text-lg font-medium text-gray-800">
                              Rooms
                            </span>
                            <div className="flex items-center">
                              <button
                                type="button"
                                onClick={() => {
                                  if (rooms > 1) {
                                    // Remove the last room from roomsData
                                    const updatedRoomsData = [...roomsData];
                                    updatedRoomsData.pop();

                                    setRooms(rooms - 1);
                                    setRoomsData(updatedRoomsData);
                                  }
                                }}
                                className={`flex items-center justify-center w-8 h-8 rounded-full bg-gray-100 ${
                                  rooms <= 1
                                    ? "opacity-50 cursor-not-allowed"
                                    : "hover:bg-gray-200"
                                }`}
                                disabled={rooms <= 1}
                              >
                                <Minus size={18} />
                              </button>
                              <span className="mx-4 w-8 text-center font-medium text-lg">
                                {rooms}
                              </span>
                              <button
                                type="button"
                                onClick={() => {
                                  if (rooms < 5) {
                                    addRoom();
                                  }
                                }}
                                className={`flex items-center justify-center w-8 h-8 rounded-full bg-gray-100 ${
                                  rooms >= 1
                                    ? "opacity-50 cursor-not-allowed"
                                    : "hover:bg-gray-200"
                                }`}
                                disabled={rooms >= 1}
                              >
                                <Plus size={18} />
                              </button>
                            </div>
                          </div>

                          {/* Divider */}
                          <hr className="my-4" />

                          {/* Room Details */}
                          {roomsData.map((room) => (
                            <div
                              key={room.id}
                              className="mb-6 pb-6 border-b border-gray-200 last:border-0"
                            >
                              <div className="flex items-center justify-between mb-4">
                                <span className="font-medium text-gray-800">
                                  Room {room.id}
                                </span>
                                {rooms > 1 && room.id === roomsData.length && (
                                  <button
                                    type="button"
                                    onClick={() => removeRoom(room.id)}
                                    className="text-red-600 font-medium hover:text-red-800"
                                  >
                                    REMOVE
                                  </button>
                                )}
                              </div>

                              {/* Adults Counter */}
                              <div className="flex items-center justify-between mb-4">
                                <span className="text-gray-700">
                                  No of adults
                                </span>
                                <div className="flex items-center">
                                  <button
                                    type="button"
                                    onClick={() => decrementAdults(room.id)}
                                    className={`flex items-center justify-center w-8 h-8 rounded-full bg-gray-100 ${
                                      room.adults <= 1
                                        ? "opacity-50 cursor-not-allowed"
                                        : "hover:bg-gray-200"
                                    }`}
                                    disabled={room.adults <= 1}
                                  >
                                    <Minus size={18} />
                                  </button>
                                  <span className="mx-4 w-8 text-center font-medium text-lg">
                                    {room.adults}
                                  </span>
                                  <button
                                    type="button"
                                    onClick={() => incrementAdults(room.id)}
                                    className={`flex items-center justify-center w-8 h-8 rounded-full bg-gray-100 ${
                                      room.adults >= 4
                                        ? "opacity-50 cursor-not-allowed"
                                        : "hover:bg-gray-200"
                                    }`}
                                    disabled={room.adults >= 4}
                                  >
                                    <Plus size={18} />
                                  </button>
                                </div>
                              </div>

                              {/* Children Counter */}
                              <div className="flex items-center justify-between mb-4">
                                <div>
                                  <div className="text-gray-700">
                                    No of children
                                  </div>
                                  <div className="text-gray-500 text-sm">
                                    (Up to 12 years old)
                                  </div>
                                </div>
                                <div className="flex items-center">
                                  <button
                                    type="button"
                                    onClick={() => decrementChildren(room.id)}
                                    className={`flex items-center justify-center w-8 h-8 rounded-full bg-gray-100 ${
                                      room.children <= 0
                                        ? "opacity-50 cursor-not-allowed"
                                        : "hover:bg-gray-200"
                                    }`}
                                    disabled={room.children <= 0}
                                  >
                                    <Minus size={18} />
                                  </button>
                                  <span className="mx-4 w-8 text-center font-medium text-lg">
                                    {room.children}
                                  </span>
                                  <button
                                    type="button"
                                    onClick={() => incrementChildren(room.id)}
                                    className={`flex items-center justify-center w-8 h-8 rounded-full bg-gray-100 ${
                                      room.children >= 4
                                        ? "opacity-50 cursor-not-allowed"
                                        : "hover:bg-gray-200"
                                    }`}
                                    disabled={room.children >= 4}
                                  >
                                    <Plus size={18} />
                                  </button>
                                </div>
                              </div>

                              {/* Child Age Selectors */}
                              {room.children > 0 && (
                                <div className="mt-4 space-y-3">
                                  {room.childrenAges.map((age, index) => (
                                    <div
                                      key={index}
                                      className="flex items-center justify-between"
                                    >
                                      <span className="text-gray-700">
                                        Age of child {index + 1}
                                      </span>
                                      <select
                                        value={age}
                                        onChange={(e) =>
                                          updateChildAge(
                                            room.id,
                                            index,
                                            e.target.value
                                          )
                                        }
                                        className="form-select border border-gray-300 rounded-md p-2 w-20"
                                      >
                                        {childAgeOptions.map((option) => (
                                          <option key={option} value={option}>
                                            {option}{" "}
                                            {option === 1 ? "year" : "years"}
                                          </option>
                                        ))}
                                      </select>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          ))}

                          {/* Add New Room button */}
                          <div className="flex items-center mt-4">
                            <button
                              type="button"
                              onClick={handleDone}
                              className="ml-auto bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-6 rounded-full"
                            >
                              DONE
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              {/* <div className="w-full mt-4 sm:mt-0 sm:w-fit mx-auto">
                <button
                  type="button"
                  onClick={handleScroll}
                  className="bg-red-500 text-white px-4 py-2 rounded-full flex items-center justify-center w-full"
                >
                  <span className="ml-2">Continue</span>
                </button>
              </div> */}
            </form>
          </div>
        </div>
      </div>
      {isLoading ? (
        <div className="w-full py-8 text-center">
          <p className="text-gray-600">Loading room availability...</p>
        </div>
      ) : error ? (
        <div className="w-full py-8 text-center">
          <p className="text-red-500">Error: {error}</p>
        </div>
      ) : (
        <div className="w-full flex flex-col sm:flex-row">
          <HotelCard />
          <div ref={bookingSectionRef} className="w-full">
            <SuperRoomBooking
              destination={destination}
              numberOfRooms={rooms}
              roomsData={roomsData}
              checkinDate={checkinDate}
              checkoutDate={checkoutDate}
              roomType="superior"
              availableRooms={roomAvailability.superior || 0}
            />
            <BusinessClassRoomBooking
              destination={destination}
              numberOfRooms={rooms}
              roomsData={roomsData}
              checkinDate={checkinDate}
              checkoutDate={checkoutDate}
              roomType="business"
              availableRooms={roomAvailability.business || 0}
            />
            <JuniorSuiteBooking
              destination={destination}
              numberOfRooms={rooms}
              roomsData={roomsData}
              checkinDate={checkinDate}
              checkoutDate={checkoutDate}
              roomType="junior"
              availableRooms={roomAvailability.junior || 0}
            />
          </div>
        </div>
      )}
    </ProtectedRoute>
  );
}
