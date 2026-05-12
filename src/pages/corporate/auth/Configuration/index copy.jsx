import Header from "@/components/corporate/auth/Header";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faXmark } from "@fortawesome/free-solid-svg-icons";
import { useState, useRef, useEffect } from "react";
import Footer2 from "@/components/corporate/footerCorporate/footerCorporate";

const Configuration = () => {
  const dropdownRef = useRef(null);
  const [selectedOption, setSelectedOption] = useState("");
  const [searchKey, setSearchKey] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [data, setData] = useState([
    { value: "employee1", label: "Employee 1" },
    { value: "employee2", label: "Employee 2" },
    { value: "employee3", label: "Employee 3" },
    { value: "employee4", label: "Employee 4" },
  ]);
  const [filteredData, setFilteredData] = useState(data);

  const handleOptionChange = (e) => {
    setSelectedOption(e.target.value);
    if (e.target.value !== "specific") {
      setSearchKey("");
      setFilteredData(data); // Reset the filtered data
    }
  };
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleSearch = (e) => {
    const value = e.target.value;
    setSearchKey(value);
    if (value) {
      const filtered = data.filter((employee) =>
        employee.label.toLowerCase().includes(value.toLowerCase())
      );
      setFilteredData(filtered);
    } else {
      setFilteredData(data);
    }
  };

  const handleOptionClick = (option) => {
    setSearchKey(option.label); // Set the clicked option as the search key
    setIsDropdownOpen(false);
  };

  return (
    <>
      <div className="shadow-[0_4px_6px_-1px_rgba(0,0,0,0.1),0_2px_4px_-1px_rgba(0,0,0,0.06)]">
        <Header />
      </div>
      <div className="bg-gray-100 p-6">
        <h2 className="text-2xl font-bold mb-1">Configuration</h2>
        <p className="text-gray-600 mb-6">
          Tailor the application to your needs
        </p>
        <div className="bg-white rounded-lg shadow-md p-8 w-full mx-auto">
          <div className="w-full mb-4 border-b border-gray-300">
            <h2 className="text-lg text-[#028fa3] font-bold mb-4">
              Wallet Access Configuration
            </h2>

            {/* Radio Buttons */}
            <div className="mb-6">
              <label className="flex items-center mb-2">
                <input
                  type="radio"
                  name="walletAccess"
                  value="admin"
                  onChange={handleOptionChange}
                  className="mr-2"
                />
                Only admin access to wallet
              </label>
              <label className="flex items-center mb-2">
                <input
                  type="radio"
                  name="walletAccess"
                  value="everyone"
                  onChange={handleOptionChange}
                  className="mr-2"
                />
                Everyone&rsquo;s access to wallet
              </label>
              <label className="flex items-center mb-2">
                <input
                  type="radio"
                  name="walletAccess"
                  value="specific"
                  onChange={handleOptionChange}
                  className="mr-2"
                />
                Specific employees access to wallet
              </label>
            </div>

            {/* Employee Search Dropdown */}
            {selectedOption === "specific" && (
              <div className="relative w-64 mb-4" ref={dropdownRef}>
                <div
                  className="p-2 flex items-center gap-2 border rounded cursor-pointer"
                  onClick={() => setIsDropdownOpen(true)} // Toggle dropdown on click
                >
                  <input
                    type="text"
                    value={searchKey}
                    onChange={handleSearch}
                    className="w-full border-none focus:outline-none focus:ring-0 text-sm"
                    placeholder="Search employee by name"
                    onFocus={() => setIsDropdownOpen(true)} // Open dropdown when focused
                  />
                  {searchKey && (
                    <FontAwesomeIcon
                      icon={faXmark}
                      className="text-[#028fa3] cursor-pointer hover:text-blue-600 transition-colors duration-300"
                      onClick={() => {
                        setSearchKey("");
                        setFilteredData(data); // Reset the data when clearing the search
                      }}
                    />
                  )}
                </div>

                {isDropdownOpen && (
                  <div className="absolute left-0 right-0 mt-2 w-full rounded-lg shadow-lg bg-white max-h-64 overflow-auto z-50">
                    {filteredData.length === 0 ? (
                      <div className="p-3 text-sm text-gray-500">
                        No employees found.
                      </div>
                    ) : (
                      filteredData.map((option) => (
                        <button
                          key={option.value}
                          className="block p-3 py-2 text-left w-full text-sm hover:bg-gray-100 focus:outline-none"
                          onClick={() => handleOptionClick(option)}
                        >
                          {option.label}
                        </button>
                      ))
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="mb-6">
            <h3 className="text-lg text-[#028fa3] font-semibold mb-1">
              Manage Approvals
            </h3>
            <p className="text-gray-500 mb-3">
              Providing access to groups and subgroups of employees within the
              organizational hierarchy.
            </p>
            <div className="flex gap-6">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="approval"
                  defaultChecked
                  className="w-4 h-4"
                />
                <div className="flex flex-col">
                  <span className="text-gray-700 font-semibold">
                    Anyone&rsquo;s approval is required
                  </span>
                  <span className="text-gray-700 text-sm">
                    If this feature is enabled, the acceptance of any one
                    approver <br /> is required for an employee who has more
                    than one approver.
                  </span>
                </div>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="radio" name="approval" className="w-4 h-4" />
                <div className="flex flex-col">
                  <span className="text-gray-700 font-semibold">
                    Everyone&rsquo;s approvals is required
                  </span>
                  <span className="text-gray-700 text-sm">
                    If this feature is enabled, the acceptance of all approvers
                    is <br /> required for an employee who has more than one
                    approver.
                  </span>
                </div>
              </label>
            </div>
          </div>
          <div className="mt-4">
            <div className="text-[#171A19] text-sm font-normal">
              {" "}
              Specific employee dont require approval for Booking
            </div>
            <div className="flex flex-col gap-1 ">
              <div class="w-1/2">
                <label className="block text-gray-700 text-xs mb-2">
                  Select employees who dont need to send approval requests
                </label>
                <div
                  id="employee-container"
                  className="flex flex-wrap items-center border border-blue-500 rounded p-2 bg-gray-50 space-x-2"
                >
                  <input
                    type="text"
                    id="employee-input"
                    placeholder="Enter the employee name"
                    className="flex-grow outline-none border-none bg-transparent p-1 text-sm text-gray-700 focus:outline-none"
                    onkeypress="handleKeyPress(event)"
                  />
                </div>
              </div>
            </div>
          </div>

          <div class="flex justify-center mt-4 items-center ">
            <button class="bg-[#028fa3] text-white px-6 py-2 rounded-lg shadow-md hover:bg-[#028fa3] focus:outline-none">
              Save
            </button>
          </div>
        </div>
      </div>

      <div>
        <Footer2 />
      </div>
    </>
  );
};

export default Configuration;
