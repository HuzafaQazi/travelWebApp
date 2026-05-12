import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCaretDown,
  faMagnifyingGlass,
  faShareNodes,
} from "@fortawesome/free-solid-svg-icons";

const Trips = () => {
  const [activeTab, setActiveTab] = useState(2);
  const [isTravelOpen, setIsTravelOpen] = useState(false);
  const [selectedOption, setSelectedOption] = useState("Travel Type");

  const toggleDropdown = () => setIsTravelOpen(!isTravelOpen);

  const handleOptionSelect = (option) => {
    setSelectedOption(option);
    setIsTravelOpen(false);
  };
  return (
    <div className="p-3 ">
      <div className="flex justify-between items-center border-b pb-2 mb-4">
        <span
          className={`text-lg cursor-pointer ${
            activeTab === 1
              ? "text-[#028FA3] font-semibold"
              : "text-[#878786] font-normal"
          }`}
          onClick={() => setActiveTab(1)}
        >
          Upcoming Trips
        </span>
        <span
          className={`text-lg cursor-pointer ${
            activeTab === 2
              ? "text-[#028FA3] font-semibold"
              : "text-[#878786] font-normal"
          }`}
          onClick={() => setActiveTab(2)}
        >
          Completed
        </span>
        <span
          className={`text-lg cursor-pointer ${
            activeTab === 3
              ? "text-[#028FA3] font-semibold"
              : "text-[#878786] font-normal"
          }`}
          onClick={() => setActiveTab(3)}
        ></span>
      </div>
      {activeTab === 1 && <></>}

      {activeTab === 2 && (
        <>
          <div>
            <div className="flex space-x-4 ">
              <div className="relative">
                <button className=" absolute top-4 left-2 h-5 w-5 text-gray-600 rounded-lg hover:text-[#028fa3] transition-colors duration-300 transform hover:scale-110">
                  <FontAwesomeIcon
                    icon={faMagnifyingGlass}
                    className="text-[#878786]"
                  />
                </button>
                <input
                  type="text"
                  className="h-14 w-64 font-normal text-xs text-[#ABABABB2] pl-12 pr-5 rounded-lg shadow-[0px_4px_4px_0px_rgba(22,156,176,0.14)] focus:shadow-xl focus:outline-none transition-shadow duration-300 ease-in-out"
                  placeholder="Search through dates, trip name "
                />
              </div>

              {/* Date Button */}
              <div className="border-1 border-[#028FA340] rounded-full px-4 py-2 flex items-center justify-between">
                <span className="text-[#878786] font-normal text-xs">Date</span>
                <FontAwesomeIcon
                  icon={faCaretDown}
                  className="text-gray-500 ml-2"
                />
              </div>

              {/* Travel Type Button */}
              <div className="relative w-34 ">
                <div
                  className=" w-34 h-14 border-1 border-[#028FA340] rounded-full px-4 py-2 flex items-center justify-between cursor-pointer"
                  onClick={toggleDropdown}
                >
                  <span className="text-[#878786] font-normal text-sm">
                    {selectedOption}
                  </span>
                  <FontAwesomeIcon
                    icon={faCaretDown}
                    className="text-gray-500 ml-2"
                  />
                </div>

                {isTravelOpen && (
                  <div className="absolute mt-1 w-full bg-white border border-[#028FA340] rounded-lg shadow-lg">
                    <div
                      className={`px-4 py-2 cursor-pointer ${
                        selectedOption === "Flight"
                          ? "text-[#028fa3] font-bold"
                          : "text-gray-500"
                      }`}
                      onClick={() => handleOptionSelect("Flight")}
                    >
                      Flight
                    </div>
                    <div
                      className={`px-4 py-2 cursor-pointer ${
                        selectedOption === "Hotel"
                          ? "text-[#028fa3] font-bold"
                          : "text-gray-500"
                      }`}
                      onClick={() => handleOptionSelect("Hotel")}
                    >
                      Hotel
                    </div>
                  </div>
                )}
              </div>
            </div>
            <div className="flex flex-col gap-3 mt-3">
              <div
                className="border-1 border-[#028FA350] p-3 rounded-2xl"
                style={{
                  boxShadow:
                    "0px 4px 4px 0px #169CB00D, 0px -2px 4px 0px #169CB00D",
                }}
              >
                <div className="flex items-end justify-end">
                  <FontAwesomeIcon
                    icon={faShareNodes}
                    className="text-[#028FA3] text-base"
                  />
                </div>

                <div className="flex flex-col mb-3">
                  <div className="flex flex-col gap-0">
                    <div className="text-[#443C38] text-lg font-medium">
                      Trip to Delhi
                    </div>
                    <div className="text-[#028FA3] text-base font-medium">
                      7 Jan - 10 Jan
                    </div>

                    <div className="flex justify-between items-center mt-3 mb-4">
                      {/* Flight Information */}
                      <div className="flex flex-col">
                        <div className="flex items-center justify-between gap-5 w-full">
                          <div className="flex items-center space-x-1 text-sm">
                            <span className="font-semibold text-[#443C38]">
                              Flight:
                            </span>
                            <span className="text-[#443C38]">
                              Bangalore - Delhi | 16:20 | Terminal 1
                            </span>
                          </div>
                          <div className="text-[#030F0C80] underline text-xs">
                            Flight Details
                          </div>
                        </div>

                        {/* Stay Information */}
                        <div className="flex items-center justify-between gap-5 w-full">
                          <div className="flex items-center space-x-1 text-sm">
                            <span className="font-semibold text-[#443C38]">
                              Stay:
                            </span>
                            <span className="text-[#443C38]">
                              Leela Palace | 1 Room
                            </span>
                          </div>
                          <div className="text-[#030F0C80] underline text-xs">
                            Hotel Details
                          </div>
                        </div>
                      </div>

                      {/* Price Information */}
                      <div className="text-right">
                        <div className="text-[#028FA3] text-sm font-normal">
                          Rs 7,000
                        </div>
                        <div className="text-[#028FA3] text-sm font-normal">
                          Rs 2,450
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className=" flex justify-between items-center">
                  <span className="text-[#028FA3] text-lg font-medium">
                    Total Trip Amount Paid
                  </span>
                  <span className="text-[#028FA3] text-xl font-medium">
                    Rs 17,896
                  </span>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {activeTab === 3 && <></>}
    </div>
  );
};

export default Trips;
