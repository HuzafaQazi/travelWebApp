import {
  faCaretDown,
  faCaretUp,
  faCircleInfo,
  faIndianRupeeSign,
  faPlane,
  faUserGroup,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useState, useRef } from "react";
import { faCheckCircle, faCircle } from "@fortawesome/free-regular-svg-icons";
const CustomDropdown = ({
  label,
  options,
  selectedValues,
  toggleVisibility,
  handleSelectionChange,
  isDropdownVisible,
  setDropdownVisible,
}) => {
  const dropdownRef = useRef(null);

  return (
    <div className="relative inline-block text-sm">
      {/* Dropdown Button */}
      <button
        className="px-4 py-2 border-1 rounded-full text-gray-700 bg-white border-[#028fa380] hover:bg-gray-100 flex items-center justify-between"
        onClick={() => setDropdownVisible(!isDropdownVisible)}
      >
        <div className="flex items-center gap-2">
          <FontAwesomeIcon
            icon={isDropdownVisible ? faCheckCircle : faCircle}
            className={`text-[#028fa3]`}
          />
          <span>{label}</span>
        </div>
        <FontAwesomeIcon
          icon={isDropdownVisible ? faCaretUp : faCaretDown}
          className="ml-2"
        />
      </button>

      {/* Dropdown Menu */}
      {isDropdownVisible && (
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
                checked={selectedValues.includes(option)}
                onChange={() => handleSelectionChange(option)}
              />
              <span className="ml-2 text-gray-700">{option}</span>
            </label>
          ))}
        </div>
      )}
    </div>
  );
};

const FlightsPolicy = () => {
  const [visibleDropdown, setVisibleDropdown] = useState(null);

  const [departmentSelections, setDepartmentSelections] = useState([]);
  const [designationSelections, setDesignationSelections] = useState([]);
  const [roleSelections, setRoleSelections] = useState([]);
  const [teamSelections, setTeamSelections] = useState([]);

  const departmentOptions1 = ["Marketing", "HR", "IT", "Support"];
  const designationOptions1 = [
    "Director",
    "Analyst",
    "Specialist",
    "Consultant",
  ];
  const roleOptions = ["Admin", "Editor", "Viewer"];
  const teamOptions = ["Team A", "Team B", "Team C"];

  const handleDepartmentSelection = (option) => {
    setDepartmentSelections((prev) =>
      prev.includes(option)
        ? prev.filter((item) => item !== option)
        : [...prev, option]
    );
  };

  const handleDesignationSelection = (option) => {
    setDesignationSelections((prev) =>
      prev.includes(option)
        ? prev.filter((item) => item !== option)
        : [...prev, option]
    );
  };

  const handleRoleSelection = (option) => {
    setRoleSelections((prev) =>
      prev.includes(option)
        ? prev.filter((item) => item !== option)
        : [...prev, option]
    );
  };

  const handleTeamSelection = (option) => {
    setTeamSelections((prev) =>
      prev.includes(option)
        ? prev.filter((item) => item !== option)
        : [...prev, option]
    );
  };

  const toggleDropdownVisibility = (dropdown) => {
    setVisibleDropdown((prev) => (prev === dropdown ? null : dropdown));
  };

  return (
    <div className="mt-2 rounded-lg w-full">
      <div className="flex flex-col gap-3">
        <div className="border-b border-gray-300 p-3">
          <div className="w-1/2"></div>
          <div className="flex flex-col mt-0">
            <div className="block text-xs sm:text-base font-normal text-[#000000] ">
              Select the options to map against travel policies
            </div>
            <div className="block text-xxs sm:text-xs font-normal text-[#4A4A4A] ">
              This will align your travel policy to these selected option
            </div>
          </div>
          <div className="flex justify-between mt-2">
            <div className="space-y-4 space-x-2">
              {/* Department Dropdown */}
              <CustomDropdown
                label="Department"
                options={departmentOptions1}
                selectedValues={departmentSelections}
                toggleVisibility={() => toggleDropdownVisibility("department")}
                handleSelectionChange={handleDepartmentSelection}
                isDropdownVisible={visibleDropdown === "department"}
                setDropdownVisible={(isOpen) =>
                  isOpen
                    ? setVisibleDropdown("department")
                    : setVisibleDropdown(null)
                }
              />

              {/* Designation Dropdown */}
              <CustomDropdown
                label="Designation"
                options={designationOptions1}
                selectedValues={designationSelections}
                toggleVisibility={() => toggleDropdownVisibility("designation")}
                handleSelectionChange={handleDesignationSelection}
                isDropdownVisible={visibleDropdown === "designation"}
                setDropdownVisible={(isOpen) =>
                  isOpen
                    ? setVisibleDropdown("designation")
                    : setVisibleDropdown(null)
                }
              />

              {/* Role Dropdown */}
              <CustomDropdown
                label="level"
                options={roleOptions}
                selectedValues={roleSelections}
                toggleVisibility={() => toggleDropdownVisibility("role")}
                handleSelectionChange={handleRoleSelection}
                isDropdownVisible={visibleDropdown === "role"}
                setDropdownVisible={(isOpen) =>
                  isOpen ? setVisibleDropdown("role") : setVisibleDropdown(null)
                }
              />

              {/* Team Dropdown */}
              <CustomDropdown
                label="employee"
                options={teamOptions}
                selectedValues={teamSelections}
                toggleVisibility={() => toggleDropdownVisibility("team")}
                handleSelectionChange={handleTeamSelection}
                isDropdownVisible={visibleDropdown === "team"}
                setDropdownVisible={(isOpen) =>
                  isOpen ? setVisibleDropdown("team") : setVisibleDropdown(null)
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
                  Who can do the flight bookings{" "}
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
                      <br /> and cancel their flight.
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
                  There&#39;s a set limit for how much can be spent per person
                  per flight
                </div>
              </div>
            </div>
          </div>

          <div className="mt-3 border-t border-[#4A4A4A0D] pt-3">
            <div className="flex items-center gap-3 w-full sm:w-4/6 ">
              <div className="flex flex-col gap-3 justify-center items-start mx-auto w-1/3 ">
                <div className="text-[#171A19] text-sm sm:text-lg text-left font-normal">
                  Domestic Flights
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
                <div className="text-[#171A19] text-sm sm:text-lg font-normal">
                  International Flights
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
                  Comfort and Convenience
                </div>
                <div className="text-[#000000] font-normal text-xs">
                  Select which class of seats and add-on employees can choose
                </div>
              </div>
            </div>
          </div>
          <div className="mt-3 border-t border-[#4A4A4A0D]">
            <div className="flex flex-col gap-2">
              <div className="text-[#171A19] text-base font-semibold pl-24">
                Class
              </div>
              <div className="flex items-center gap-1 sm:gap-3 py-2">
                <div className="flex w-1/3 items-center justify-center">
                  <label className="flex items-center gap-2 text-xs sm:text-sm text-[#028fa3] border-1 border-[#028fa380] p-3 rounded-full font-medium">
                    {/* Styled Checkbox */}
                    <input
                      type="checkbox"
                      className="form-checkbox h-4 w-4 text-[#028fa3] border-1 border-[#028fa3] rounded focus:ring-[#028fa3] checked:bg-[#028fa3] checked:border-[#028fa3]"
                    />
                    <div>Economy</div>
                  </label>
                </div>
                <div className="h-20 border-l border-[#4A4A4A4D] "></div>
                <div className="flex w-1/3 items-center justify-center">
                  <label className="flex items-center gap-2 text-xs sm:text-sm text-[#028fa3] border-1 border-[#028fa380] p-3 rounded-full font-medium">
                    {/* Styled Checkbox */}
                    <input
                      type="checkbox"
                      className="form-checkbox h-4 w-4 text-[#028fa3] border-1 border-[#028fa3] rounded focus:ring-[#028fa3] checked:bg-[#028fa3] checked:border-[#028fa3]"
                    />
                    <div>Premium</div>
                  </label>
                </div>
                <div className="h-20 border-l border-[#4A4A4A4D] "></div>
                <div className="flex w-1/3 items-center justify-center">
                  <label className="flex items-center gap-2 text-xs sm:text-sm text-[#028fa3] border-1 border-[#028fa380] p-3 rounded-full font-medium">
                    {/* Styled Checkbox */}
                    <input
                      type="checkbox"
                      className="form-checkbox h-4 w-4 text-[#028fa3] border-1 border-[#028fa3] rounded focus:ring-[#028fa3] checked:bg-[#028fa3] checked:border-[#028fa3]"
                    />
                    <div>Business</div>
                  </label>
                </div>
              </div>
              <div className="flex flex-col border-t border-[#4A4A4A4D]">
                <div className="text-[#171A19] text-base font-semibold pl-24">
                  Add-ons
                </div>
                <div className="flex items-center gap-1 sm:gap-3 pt-1">
                  <div className="flex w-1/3 items-center justify-center">
                    <label className="flex items-center gap-2 text-sm text-[#171A19] font-normal">
                      <input
                        type="checkbox"
                        className="form-checkbox h-4 w-4 text-blue-500 border-gray-300 rounded focus:ring-blue-400"
                      />
                      <div className="flex flex-col">
                        {/* Row with text and icon */}
                        <div className="flex items-center relative">
                          <span className="text-[#171A19] text-xs sm:text-sm">
                            Meals
                          </span>
                        </div>
                        {/* Supporting text */}
                        <span className="text-[#171A19] text-xxs sm:text-xs">
                          Employees can only book <br /> for themselves
                        </span>
                      </div>
                    </label>
                  </div>

                  <div className="h-20 border-l border-[#4A4A4A4D] "></div>

                  <div className="flex w-1/3 items-center justify-center">
                    <label className="flex items-center gap-2 text-sm text-[#171A19] font-normal">
                      <input
                        type="checkbox"
                        className="form-checkbox h-4 w-4 text-blue-500 border-gray-300 rounded focus:ring-blue-400"
                      />
                      <div className="flex flex-col">
                        <div className="flex items-center  relative">
                          <span className="text-[#171A19] text-xs sm:text-sm">
                            Extra-baggage
                          </span>
                        </div>

                        <span className="text-[#171A19] text-xxs sm:text-xs">
                          Employees can only book <br /> for themselves{" "}
                        </span>
                      </div>
                    </label>
                  </div>

                  <div className="h-20 border-l border-[#4A4A4A4D] "></div>

                  <div className="flex w-1/3 items-center justify-center">
                    <label className="flex items-center gap-2 text-sm text-[#171A19] font-normal">
                      <input
                        type="checkbox"
                        className="form-checkbox h-4 w-4 text-blue-500 border-gray-300 rounded focus:ring-blue-400"
                      />
                      <div className="flex flex-col">
                        <div className="flex items-center  relative">
                          <span className="text-[#171A19] text-xs sm:text-sm">
                            Seat selection
                          </span>
                        </div>

                        <span className="text-[#171A19] text-xxs sm:text-xs">
                          Employees can only book <br /> for themselves{" "}
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
                icon={faPlane}
                className="text-lg text-[#028fa3] bg-[#028FA312] p-2 rounded-full transform -rotate-90"
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

        <div className=" p-3">
          <div className="flex justify-between">
            <div className="flex gap-3 items-center">
              <FontAwesomeIcon
                icon={faPlane}
                className="text-lg text-[#028fa3] bg-[#028FA312] p-2 rounded-full transform -rotate-90"
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

export default FlightsPolicy;
