import { useState, useRef } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBed,
  faCaretDown,
  faCaretUp,
  faCircleInfo,
  faIndianRupeeSign,
  faUserGroup,
} from "@fortawesome/free-solid-svg-icons";
import { faCheckCircle, faCircle } from "@fortawesome/free-regular-svg-icons";

const Dropdown = ({
  label,
  options,
  selectedItems,
  toggleDropdown,
  handleCheckboxChange,
  dropdownOpen,
  setDropdownOpen,
}) => {
  const dropdownRef = useRef(null);
  return (
    <div className="relative inline-block text-sm">
      {/* Dropdown Button */}
      <button
        className="px-4 py-2 border-1 rounded-full text-gray-700 bg-white border-[#028fa380] hover:bg-gray-100 flex items-center justify-between"
        onClick={() => setDropdownOpen(!dropdownOpen)}
      >
        <div className="flex items-center gap-2">
          <FontAwesomeIcon
            icon={dropdownOpen ? faCheckCircle : faCircle}
            className={`text-[#028fa3]`}
          />
          <span>{label}</span>
        </div>
        <FontAwesomeIcon
          icon={dropdownOpen ? faCaretUp : faCaretDown}
          className="ml-2"
        />
      </button>

      {/* Dropdown Menu */}
      {dropdownOpen && (
        <div
          className="absolute mt-2 w-full bg-white border border-gray-300 rounded-lg shadow-lg z-10"
          onClick={(e) => e.stopPropagation()} // Prevent event propagation
        >
          {options.map((option, index) => (
            <label
              key={index}
              className="flex items-center px-4 py-2 hover:bg-gray-100 cursor-pointer"
            >
              <input
                type="checkbox"
                className="form-checkbox h-4 w-4 text-blue-500 border-gray-300 rounded focus:ring-blue-400"
                checked={selectedItems.includes(option)}
                onChange={() => handleCheckboxChange(option)}
              />
              <span className="ml-2 text-gray-700">{option}</span>
            </label>
          ))}
        </div>
      )}
    </div>
  );
};

const HotelPolicy = () => {
  const [openDropdown, setOpenDropdown] = useState(null); // To track which dropdown is open
  const [departmentItems, setDepartmentItems] = useState([]);
  const [designationItems, setDesignationItems] = useState([]);
  const [levelItems, setLevelItems] = useState([]);
  const [employeeItems, setEmployeeItems] = useState([]);
  // Example options for each dropdown
  const departmentOptions = ["Sales", "Finance", "Software"];
  const designationOptions = ["Manager", "Executive", "Lead", "Intern"];
  const levelOptions = ["Level 1", "Level 2", "Level 3"];
  const employeeOptions = ["John Doe", "Jane Smith", "Alex Johnson"];

  const handleDepartmentChange = (option) => {
    setDepartmentItems((prev) =>
      prev.includes(option)
        ? prev.filter((item) => item !== option)
        : [...prev, option]
    );
  };

  const handleDesignationChange = (option) => {
    setDesignationItems((prev) =>
      prev.includes(option)
        ? prev.filter((item) => item !== option)
        : [...prev, option]
    );
  };

  const handleLevelChange = (option) => {
    setLevelItems((prev) =>
      prev.includes(option)
        ? prev.filter((item) => item !== option)
        : [...prev, option]
    );
  };

  const handleEmployeeChange = (option) => {
    setEmployeeItems((prev) =>
      prev.includes(option)
        ? prev.filter((item) => item !== option)
        : [...prev, option]
    );
  };

  const toggleDropdown = (dropdown) => {
    setOpenDropdown((prev) => (prev === dropdown ? null : dropdown));
  };

  return (
    <div className="mt-2 rounded-lg w-full">
      {/* Header Section */}

      <div className="flex flex-col gap-3">
        <div className="border-b border-gray-300 p-3">
          <div className="w-1/2"></div>
          <div className="flex flex-col mt-0">
            <div className="block text-base font-normal text-[#000000] ">
              Select the options to map against travel policies
            </div>
            <div className="block text-xs font-normal text-[#4A4A4A] ">
              This will align your travel policy to these selected option
            </div>
          </div>
          <div className="flex justify-between mt-2">
            <div className="space-y-4 space-x-2">
              {/* Department Dropdown */}
              <Dropdown
                label="Department"
                options={departmentOptions}
                selectedItems={departmentItems}
                toggleDropdown={() => toggleDropdown("department")}
                handleCheckboxChange={handleDepartmentChange}
                dropdownOpen={openDropdown === "department"}
                setDropdownOpen={(isOpen) =>
                  isOpen ? setOpenDropdown("department") : setOpenDropdown(null)
                }
              />

              {/* Designation Dropdown */}
              <Dropdown
                label="Designation"
                options={designationOptions}
                selectedItems={designationItems}
                toggleDropdown={() => toggleDropdown("designation")}
                handleCheckboxChange={handleDesignationChange}
                dropdownOpen={openDropdown === "designation"}
                setDropdownOpen={(isOpen) =>
                  isOpen
                    ? setOpenDropdown("designation")
                    : setOpenDropdown(null)
                }
              />

              {/* Level Dropdown */}
              <Dropdown
                label="Level"
                options={levelOptions}
                selectedItems={levelItems}
                toggleDropdown={() => toggleDropdown("level")}
                handleCheckboxChange={handleLevelChange}
                dropdownOpen={openDropdown === "level"}
                setDropdownOpen={(isOpen) =>
                  isOpen ? setOpenDropdown("level") : setOpenDropdown(null)
                }
              />

              {/* Employee Dropdown */}
              <Dropdown
                label="Employee"
                options={employeeOptions}
                selectedItems={employeeItems}
                toggleDropdown={() => toggleDropdown("employee")}
                handleCheckboxChange={handleEmployeeChange}
                dropdownOpen={openDropdown === "employee"}
                setDropdownOpen={(isOpen) =>
                  isOpen ? setOpenDropdown("employee") : setOpenDropdown(null)
                }
              />
            </div>
          </div>
        </div>

        <div className="border-b border-gray-300 p-3">
          <div className="flex justify-between">
            <div className="flex gap-3 items-center">
              <FontAwesomeIcon
                icon={faUserGroup}
                className="text-lg text-[#028fa3] bg-[#028FA312] p-2 rounded-full"
              />
              <div>
                <div className="text-[#171A19] font-semibold text-sm">
                  Eligibility{" "}
                </div>
                <div className="text-[#000000] font-normal text-xs">
                  Who can do the hotel bookings{" "}
                </div>
              </div>
            </div>
          </div>

          <div className="mt-3 border-t border-[#4A4A4A0D]">
            {/* Self Book Option */}
            <div className="flex  items-center justify-center pt-1">
              <div className="flex w-1/2 items-center justify-center">
                <label className="flex items-center gap-2 text-sm text-[#171A19] font-normal">
                  <input
                    type="checkbox"
                    className="form-checkbox h-4 w-4 text-blue-500 border-gray-300 rounded focus:ring-blue-400"
                  />
                  <div className="flex flex-col">
                    {/* Row with text and icon */}
                    <div className="flex items-center relative">
                      <span className="text-[#171A19] text-sm">Self Book</span>
                      <FontAwesomeIcon
                        icon={faCircleInfo}
                        className="text-[#028fa3] text-sm relative -top-2 "
                      />
                    </div>
                    {/* Supporting text */}
                    <span className="text-[#171A19] text-xs" zl>
                      This lets employees book, utilize wallet, change the date,
                      <br />
                      and cancel their hotel stay.
                    </span>
                  </div>
                </label>
              </div>

              <div className="h-20 border-l border-[#4A4A4A0D] "></div>
              {/* Book for Others Option */}
              <div className="flex w-1/2 items-center justify-center ">
                <label className="flex items-center gap-2 text-sm text-[#171A19] font-normal">
                  <input
                    type="checkbox"
                    className="form-checkbox h-4 w-4 text-blue-500 border-gray-300 rounded focus:ring-blue-400"
                  />
                  <div className="flex flex-col">
                    <div className="flex items-center  relative">
                      <span className="text-[#171A19] text-sm">
                        Book for others
                      </span>
                      <FontAwesomeIcon
                        icon={faCircleInfo}
                        className="text-[#028fa3] text-sm relative -top-2 "
                      />
                    </div>

                    <span className="text-[#171A19] text-xs">
                      This lets employees book for other colleagues{" "}
                    </span>
                  </div>
                </label>
              </div>
            </div>
          </div>
        </div>

        <div className="border-b border-gray-300 p-3">
          <div className="flex justify-between">
            <div className="flex gap-3 items-center">
              <FontAwesomeIcon
                icon={faUserGroup}
                className="text-lg text-[#028fa3] bg-[#028FA312] p-2 rounded-full"
              />
              <div>
                <div className="text-[#171A19] font-semibold text-sm">
                  Budget
                </div>
                <div className="text-[#171A19] font-normal text-xs">
                  Theres a set limit for how much can be spent per person per
                  room
                </div>
              </div>
            </div>
          </div>
          <div className="mt-3 border-t border-[#4A4A4A0D] pt-3">
            <div className="flex items-center gap-3 w-3/4 ">
              <div className="flex flex-col gap-3 justify-center items-start mx-auto w-1/3 ">
                <div className="text-[#171A19] text-lg text-left font-normal">
                  Domestic Stay{" "}
                </div>
                <div className="w-fit">
                  <div className="relative w-full min-w-[100px]  h-10">
                    <div className="absolute inset-y-0 left-2 flex items-center pointer-events-none">
                      <FontAwesomeIcon
                        icon={faIndianRupeeSign}
                        className="text-[#028FA3] text-sm"
                      />
                    </div>
                    <input
                      type="text"
                      id="amount"
                      name="amount"
                      className="block pl-5 px-2.5 pb-2.5 pt-2.5 w-full text-sm text-[#028FA3]  bg-transparent rounded-lg border-1 border-[#028fa3] appearance-none dark:text-black dark:border-[#028fa3] dark:focus:border-[#028fa3] focus:outline-none focus:ring-0 focus:border-[#028fa3]-600 peer"
                      placeholder=" "
                    />
                    <label
                      for="amount"
                      className="absolute text-sm text-[#028FA3] dark:text-[#028FA3] duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-white dark:bg-gray-900 px-2 peer-focus:px-2 peer-focus:text-[#028fa3] peer-focus:dark:text-[#028fa3] peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto start-1"
                    >
                      Amount
                    </label>
                    <div className="text-red-500 text-xxs mt-0"></div>
                  </div>
                </div>
              </div>
              <div className="h-20 border-l border-[#4A4A4A0D] "></div>
              <div className="flex flex-col gap-3 justify-center items-start mx-auto w-1/3 ">
                <div className="text-[#171A19] text-lg font-normal">
                  International Stay{" "}
                </div>
                <div className="w-fit">
                  <div className="relative w-full min-w-[100px]  h-10">
                    <div className="absolute inset-y-0 left-2 flex items-center pointer-events-none">
                      <FontAwesomeIcon
                        icon={faIndianRupeeSign}
                        className="text-[#028FA3] text-sm"
                      />
                    </div>
                    <input
                      type="text"
                      id="amount1"
                      name="amount1"
                      className="block pl-5 px-2.5 pb-2.5 pt-2.5 w-full text-sm text-[#028FA3]  bg-transparent rounded-lg border-1 border-[#028fa3] appearance-none dark:text-black dark:border-[#028fa3] dark:focus:border-[#028fa3] focus:outline-none focus:ring-0 focus:border-[#028fa3]-600 peer"
                      placeholder=" "
                    />
                    <label
                      for="amount1"
                      className="absolute  text-sm text-[#028FA3] dark:text-[#028FA3] duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-white dark:bg-gray-900 px-2 peer-focus:px-2 peer-focus:text-[#028fa3] peer-focus:dark:text-[#028fa3] peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto start-1"
                    >
                      Amount
                    </label>
                    <div className="text-red-500 text-xxs mt-0"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="border-b border-gray-300 p-3">
          <div className="flex justify-between">
            <div className="flex gap-3 items-center">
              <FontAwesomeIcon
                icon={faUserGroup}
                className="text-lg text-[#028fa3] bg-[#028FA312] p-2 rounded-full"
              />
              <div>
                <div className="text-[#171A19] font-semibold text-sm">
                  Hotel Category
                </div>
                <div className="text-[#000000] font-normal text-xs">
                  Select the category of the hotel
                </div>
              </div>
            </div>
          </div>
          <div className="mt-3 border-t border-[#4A4A4A0D]">
            <div className="flex flex-col gap-2">
              <div>
                <div className="flex items-center gap-3 p-2">
                  <div className="flex flex-col w-1/3 gap-2 items-center justify-center">
                    <div className="text-[#171A19] text-sm font-semibold">
                      Star Ratings
                    </div>
                    <div>
                      <div class="flex space-x-4 p-2 border rounded-lg text-sm ">
                        <div class="flex items-center space-x-1">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            class="w-5 h-5 text-gray-400"
                          >
                            <path
                              stroke-linecap="round"
                              stroke-linejoin="round"
                              stroke-width="2"
                              d="M12 17.75l-6.4 3.79 1.22-7.09-5.15-5.02 7.13-1.04L12 2.25l3.2 6.34 7.14 1.04-5.16 5.02 1.23 7.09-6.41-3.79z"
                            />
                          </svg>
                          <span class="text-gray-500">3</span>
                        </div>

                        <div class="flex items-center space-x-1">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            class="w-5 h-5 text-gray-400"
                          >
                            <path
                              stroke-linecap="round"
                              stroke-linejoin="round"
                              stroke-width="2"
                              d="M12 17.75l-6.4 3.79 1.22-7.09-5.15-5.02 7.13-1.04L12 2.25l3.2 6.34 7.14 1.04-5.16 5.02 1.23 7.09-6.41-3.79z"
                            />
                          </svg>
                          <span class="text-gray-500">4</span>
                        </div>

                        <div class="flex items-center space-x-1">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            class="w-5 h-5 text-gray-400"
                          >
                            <path
                              stroke-linecap="round"
                              stroke-linejoin="round"
                              stroke-width="2"
                              d="M12 17.75l-6.4 3.79 1.22-7.09-5.15-5.02 7.13-1.04L12 2.25l3.2 6.34 7.14 1.04-5.16 5.02 1.23 7.09-6.41-3.79z"
                            />
                          </svg>
                          <span class="text-gray-500">5</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex w-1/3 items-center justify-center">
                    <label className="flex items-center gap-2 text-sm text-[#171A19] font-normal">
                      <input
                        type="checkbox"
                        className="form-checkbox h-4 w-4 text-blue-500 border-gray-300 rounded focus:ring-blue-400"
                      />
                      <div className="flex flex-col">
                        {/* Row with text and icon */}
                        <div className="flex items-center relative">
                          <span className="text-[#171A19] text-sm">
                            Refundable
                          </span>
                        </div>
                        {/* Supporting text */}
                        <span className="text-[#171A19] text-xs">
                          Employees can choose <br /> hotels that has refund
                          policy
                        </span>
                      </div>
                    </label>
                  </div>
                </div>
              </div>
              <div className="flex flex-col border-t border-[#4A4A4A0D]">
                <div className="text-[#171A19] text-base font-semibold pl-24">
                  Filters
                </div>
                <div className="flex items-center gap-3 pt-1">
                  <div className="flex w-1/3 items-center justify-center">
                    <label className="flex items-center gap-2 text-sm text-[#171A19] font-normal">
                      <input
                        type="checkbox"
                        className="form-checkbox h-4 w-4 text-blue-500 border-gray-300 rounded focus:ring-blue-400"
                      />
                      <div className="flex flex-col">
                        {/* Row with text and icon */}
                        <div className="flex items-center relative">
                          <span className="text-[#171A19] text-sm">
                            Breakfast
                          </span>
                        </div>
                        {/* Supporting text */}
                        <span className="text-[#171A19] text-xs">
                          Employees can choose <br /> hotels that offer
                          breakfast
                        </span>
                      </div>
                    </label>
                  </div>

                  <div className="h-20 border-l border-[#4A4A4A0D] "></div>

                  <div className="flex w-1/3 items-center justify-center">
                    <label className="flex items-center gap-2 text-sm text-[#171A19] font-normal">
                      <input
                        type="checkbox"
                        className="form-checkbox h-4 w-4 text-blue-500 border-gray-300 rounded focus:ring-blue-400"
                      />
                      <div className="flex flex-col">
                        <div className="flex items-center  relative">
                          <span className="text-[#171A19] text-sm">Lunch</span>
                        </div>

                        <span className="text-[#171A19] text-xs">
                          Employees can choose <br />
                          hotels that offer Lunch
                        </span>
                      </div>
                    </label>
                  </div>

                  <div className="h-20 border-l border-[#4A4A4A0D] "></div>

                  <div className="flex w-1/3 items-center justify-center">
                    <label className="flex items-center gap-2 text-sm text-[#171A19] font-normal">
                      <input
                        type="checkbox"
                        className="form-checkbox h-4 w-4 text-blue-500 border-gray-300 rounded focus:ring-blue-400"
                      />
                      <div className="flex flex-col">
                        <div className="flex items-center  relative">
                          <span className="text-[#171A19] text-sm">Dinner</span>
                        </div>

                        <span className="text-[#171A19] text-xs">
                          Employees can choose
                          <br /> hotels that offer Dinner
                        </span>
                      </div>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="border-b border-gray-300 p-3">
          <div className="flex justify-between">
            <div className="flex gap-3 items-center">
              <FontAwesomeIcon
                icon={faBed}
                className="text-lg text-[#028fa3] bg-[#028FA312] p-2 rounded-full "
              />
              <div>
                <div className="text-[#171A19] font-semibold text-sm">
                  Booking Window
                </div>
                <div className="text-[#000000] font-normal text-xs">
                  Booking Timeframe: Theres a time limit for booking hotels
                  within policy
                </div>
              </div>
            </div>
          </div>
          <div className="mt-3 border-t border-[#4A4A4A0D]">
            <div className="flex items-center gap-3 w-1/2 py-5">
              <div className="flex flex-col gap-3 justify-center items-start mx-auto">
                <div className="w-fit">
                  <div className="relative w-full min-w-[100px]  h-10">
                    <input
                      type="date"
                      id="from"
                      name="from"
                      className="block px-2.5 pb-2.5 pt-2.5 w-full text-sm text-[#028FA3]  bg-transparent rounded-lg border-1 border-[#028fa3] appearance-none dark:text-[#028fa3] dark:border-[#028fa3] dark:focus:border-[#028fa3] focus:outline-none focus:ring-0 focus:border-[#028fa3]-600 peer"
                      placeholder=""
                    />
                    <label
                      for="from"
                      className="absolute text-sm text-[#028FA3] dark:text-[#028FA3] duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-white dark:bg-gray-900 px-2 peer-focus:px-2 peer-focus:text-[#028fa3] peer-focus:dark:text-[#028fa3] peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto start-1"
                    >
                      From
                    </label>
                    <div className="text-red-500 text-xxs mt-0"></div>
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-3 justify-center items-start mx-auto ">
                <div className="w-fit">
                  <div className="relative w-full min-w-[100px]  h-10">
                    <input
                      type="date"
                      id="to"
                      name="to"
                      className="block px-2.5 pb-2.5 pt-2.5 w-full text-sm text-[#028FA3]  bg-transparent rounded-lg border-1 border-[#028fa3] appearance-none dark:text-[#028fa3] dark:border-[#028fa3] dark:focus:border-[#028fa3] focus:outline-none focus:ring-0 focus:border-[#028fa3]-600 peer"
                      placeholder=""
                    />
                    <label
                      for="to"
                      className="absolute text-sm text-[#028FA3] dark:text-[#028FA3] duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-white dark:bg-gray-900 px-2 peer-focus:px-2 peer-focus:text-[#028fa3] peer-focus:dark:text-[#028fa3] peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto start-1"
                    >
                      To
                    </label>
                    <div className="text-red-500 text-xxs mt-0"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="p-3">
          <div className="flex justify-between">
            <div className="flex gap-3 items-center">
              <FontAwesomeIcon
                icon={faBed}
                className="text-lg text-[#028fa3] bg-[#028FA312] p-2 rounded-full "
              />
              <div>
                <div className="text-[#171A19] font-semibold text-sm">
                  Approvals
                </div>
                <div className="text-[#000000] font-normal text-xs">
                  Control and manage the approval flow of the employees
                </div>
              </div>
            </div>
          </div>

          <div className="mt-3 border-t pt-3 ml-10 border-[#4A4A4A0D]">
            <div className="flex flex-col gap-3">
              <div className="flex justify-between">
                <div className="text-[#171A19] text-sm font-normal ">
                  Employees can <span className="font-semibold">only</span> do
                  in-policy bookings
                </div>
                <div className="mt-0">
                  <label className="inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" />
                    <div className="relative w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-[#E5E1E2] peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#028fa3]"></div>
                  </label>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HotelPolicy;
