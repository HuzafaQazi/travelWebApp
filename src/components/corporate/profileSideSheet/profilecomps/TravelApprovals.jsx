import { useState } from "react";
import {
  faBed,
  faCaretDown,
  faMagnifyingGlass,
  faPlane,
  faSuitcaseRolling,
  faXmarkCircle,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import style from "../profilecomps/styles.module.css";

const TravelApprovals = () => {
  const [activeTab, setActiveTab] = useState(1);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedReason, setSelectedReason] = useState("");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeclineOpen, setIsDeclineOpen] = useState(false);
  const [isApprove, setIsApprove] = useState(false);
  const [isTravelOpen, setIsTravelOpen] = useState(false);
  const [selectedOption, setSelectedOption] = useState("Travel Type");
  const [menuOpen, setMenuOpen] = useState(false);
  const [currentSelection, setCurrentSelection] = useState("Travel Type");

  const toggleMenu = () => setMenuOpen(!menuOpen);

  const handleSelection = (option) => {
    setCurrentSelection(option);
    setMenuOpen(false);
  };

  const toggleDropdown = () => setIsTravelOpen(!isTravelOpen);

  const handleOptionSelect = (option) => {
    setSelectedOption(option);
    setIsTravelOpen(false);
  };

  const handleApproveOpen = () => {
    setIsApprove(true);
  };
  const handleApproveClose = () => {
    setIsApprove(false);
  };

  const handleDeclineOpen = () => {
    setIsDeclineOpen(true);
  };
  const handleDeclineClose = () => {
    setIsDeclineOpen(false);
  };

  const handleOpen = () => {
    setIsOpen(false);
    setIsModalOpen(true);
  };

  const handleRequestClose = () => {
    setIsModalOpen(false);
    setIsOpen(false);
  };

  const handleCancelClick = () => {
    setIsOpen(true);
  };

  const handleClose = () => {
    setIsOpen(false);
  };

  const handleReasonChange = (event) => {
    setSelectedReason(event.target.value);
  };

  return (
    <div className="p-3 ">
      <div className="flex justify-around items-center border-b pb-2 mb-4">
        <span
          className={` cursor-pointer ${
            activeTab === 1 ? "text-[#028FA3] " : "text-[#878786] "
          }`}
          onClick={() => setActiveTab(1)}
        >
          <div className="text-lg font-semibold text-center">
            Your Travel Requests
          </div>
          <div className="text-sm font-normal text-center">
            You have requested for approval
          </div>
        </span>
        <span
          className={` cursor-pointer ${
            activeTab === 2 ? "text-[#028FA3]" : "text-[#878786]"
          }`}
          onClick={() => setActiveTab(2)}
        >
          <div className="text-lg font-semibold text-center">
            For you to approve
          </div>
          <div className="text-sm font-normal text-center">
            Travel requests require your approval
          </div>
        </span>
      </div>
      <div className={style.Profile2}>
        <div className="px-2 ">
          {activeTab === 1 && (
            <>
              <div>
                <div className="flex space-x-4 mb-4 ">
                  <div className="relative">
                    <button className=" absolute top-4 left-2 h-5 w-5 text-gray-600 rounded-lg hover:text-[#028fa3] transition-colors duration-300 transform hover:scale-110">
                      <FontAwesomeIcon
                        icon={faMagnifyingGlass}
                        className="text-[#878786]"
                      />
                    </button>
                    <input
                      type="text"
                      className="h-14 w-64 font-normal text-xs text-[#000000] pl-12 pr-5 rounded-lg shadow-[0px_4px_4px_0px_rgba(22,156,176,0.14)] focus:shadow-xl focus:outline-none transition-shadow duration-300 ease-in-out cursor-pointer"
                      placeholder="Search through dates, trip name "
                    />
                  </div>
                  <div className="relative w-48">
                    <div
                      className=" w-48 h-14 border-1 border-[#028FA340] rounded-full px-4 py-2 flex items-center justify-between cursor-pointer"
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
                <div className="flex flex-col gap-3">
                  <div
                    className="border-1 border-[#028FA350] p-3 rounded-2xl"
                    style={{
                      boxShadow:
                        "0px 4px 4px 0px #169CB00D, 0px -2px 4px 0px #169CB00D",
                    }}
                  >
                    <div className="flex flex-col mb-3">
                      <div className="flex flex-col gap-1">
                        <div className="flex justify-between items-center">
                          <div className="text-[#443C38] text-lg font-medium">
                            {" "}
                            <FontAwesomeIcon icon={faBed} className="mr-2" />
                            Stay in Mariott, Bengaluru
                          </div>
                          <div className="text-[#028FA3] underline text-xs">
                            Hotel Details
                          </div>
                        </div>
                        <div className="text-base text-[#030F0C80] font-normal">
                          {" "}
                          Wed, 21st Mar - 23rd Mar |{" "}
                          <span className="font-semibold">
                            Booking ID
                          </span> : {6087885612}{" "}
                        </div>
                        <div className="flex justify-between ">
                          <div className="text-base text-[#030F0C80] font-normal">
                            Bhavya | 1 Room(s)
                          </div>
                          <button
                            className="border-1 border-[#E53944] text-base font-normal p-2 rounded-lg text-[#E53944]"
                            onClick={handleCancelClick}
                          >
                            Cancel Request
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="text-base font-medium text-[#443C38CC]">
                      Status:{" "}
                      <span className="text-[#D5B300]">Not yet approved</span>{" "}
                    </div>

                    <div className=" flex justify-between items-center border-t border-[#028FA350] py-2 -mb-3 -mx-4">
                      <span className="text-[#028FA3] text-lg font-medium px-3">
                        Amount to be paid
                      </span>
                      <span className="text-[#028FA3] text-xl font-medium px-3">
                        Rs 17,896
                      </span>
                    </div>
                  </div>

                  <div
                    className="border-1 border-[#028FA350] p-3 rounded-2xl"
                    style={{
                      boxShadow:
                        "0px 4px 4px 0px #169CB00D, 0px -2px 4px 0px #169CB00D",
                    }}
                  >
                    <div className="flex flex-col mb-3">
                      <div className="flex flex-col gap-1">
                        <div className="flex justify-between items-center">
                          <div className="text-[#443C38] text-lg font-medium">
                            {" "}
                            <FontAwesomeIcon
                              icon={faPlane}
                              className="h-4 w-6 transform -rotate-45"
                            />
                            Flight Bengaluru to Delhi
                          </div>
                          <div className="text-[#028FA3] underline text-xs">
                            Flight details
                          </div>
                        </div>
                        <div className="text-[#030F0C80] ">
                          Wed, 21st Mar, 5:20 p.m.
                        </div>
                        <div className="text-base text-[#030F0C80] font-normal">
                          {" "}
                          <span className="font-semibold">
                            Booking ID
                          </span> : {6087885612} |{" "}
                          <span className="font-semibold">PNR</span> :{" "}
                          {6087885612}{" "}
                        </div>
                        <div className="flex justify-between">
                          <div className="text-base text-[#030F0C80] font-normal">
                            Bhavya Saraf
                          </div>
                          <button
                            className="border-1 border-[#E53944] text-base font-normal p-2 rounded-lg text-[#E53944]"
                            onClick={handleCancelClick}
                          >
                            Cancel Request
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="text-base font-medium text-[#443C38CC]">
                      Status:{" "}
                      <span className="text-[#D5B300]">Not yet approved</span>{" "}
                    </div>

                    <div className=" flex justify-between items-center border-t border-[#028FA350] py-2 -mb-3 -mx-4">
                      <span className="text-[#028FA3] text-lg font-medium px-3">
                        Amount to be paid
                      </span>
                      <span className="text-[#028FA3] text-xl font-medium px-3">
                        Rs 17,896
                      </span>
                    </div>
                  </div>

                  <div
                    className="border-1 border-[#028FA350] p-3 rounded-2xl"
                    style={{
                      boxShadow:
                        "0px 4px 4px 0px #169CB00D, 0px -2px 4px 0px #169CB00D",
                    }}
                  >
                    <div className="flex flex-col mb-3">
                      <div className="flex flex-col gap-1">
                        <div className="flex justify-between items-center">
                          <div className="text-[#443C38] text-lg font-medium">
                            {" "}
                            <FontAwesomeIcon
                              icon={faPlane}
                              className="h-4 w-6 transform -rotate-45"
                            />
                            Flight Bengaluru to Delhi
                          </div>
                          <div className="text-[#028FA3] underline text-xs">
                            Flight details
                          </div>
                        </div>
                        <div className="text-[#030F0C80] ">
                          Wed, 21st Mar, 5:20 p.m.
                        </div>
                        <div className="text-base text-[#030F0C80] font-normal">
                          {" "}
                          <span className="font-semibold">
                            Booking ID
                          </span> : {6087885612} |{" "}
                          <span className="font-semibold">PNR</span> :{" "}
                          {6087885612}{" "}
                        </div>
                        <div className="flex justify-between">
                          <div className="text-base text-[#030F0C80] font-normal">
                            Bhavya Saraf, Anamika Aggarwal{" "}
                            <span className="font-medium text-[#028FA3]">
                              +2
                            </span>
                          </div>
                          <button className="border-1 border-[#028FA3] text-base font-normal p-2 rounded-lg text-[#028FA3]">
                            Review & Pay
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="text-base font-medium text-[#443C38CC]">
                      Status: <span className="text-[#418C12]">Approved</span>{" "}
                    </div>

                    <div className=" flex justify-between items-center border-t border-[#028FA350] py-2 -mb-3 -mx-4">
                      <span className="text-[#028FA3] text-lg font-medium px-3">
                        Amount to be paid
                      </span>
                      <span className="text-[#028FA3] text-xl font-medium px-3">
                        Rs 17,896
                      </span>
                    </div>
                  </div>

                  <div
                    className="border-1 border-[#028FA350] p-3 rounded-2xl"
                    style={{
                      boxShadow:
                        "0px 4px 4px 0px #169CB00D, 0px -2px 4px 0px #169CB00D",
                    }}
                  >
                    <div className="flex flex-col mb-3">
                      <div className="flex flex-col gap-1">
                        <div className="flex justify-between items-center">
                          <div className="text-[#443C38] text-lg font-medium">
                            {" "}
                            <FontAwesomeIcon
                              icon={faPlane}
                              className="h-4 w-6 transform -rotate-45"
                            />
                            Flight Bengaluru to Delhi
                          </div>
                          {/* <div className="text-[#028FA3] underline text-xs">Flight details</div> */}
                        </div>
                        <div className="text-[#229DAF]  ">
                          Wed, 21st Mar, 5:20 p.m.
                        </div>
                        <div className="text-base text-[#030F0C80] font-normal">
                          {" "}
                          <span className="font-semibold">
                            Booking ID
                          </span> : {6087885612} |{" "}
                          <span className="font-semibold">PNR</span> :{" "}
                          {6087885612}{" "}
                        </div>
                        <div className="flex justify-between">
                          <div className="text-base text-[#030F0C80] font-normal">
                            Bhavya Saraf, Anamika Aggarwal{" "}
                            <span className="font-medium text-[#028FA3]">
                              +2
                            </span>
                          </div>
                          <button className="bg-[#028FA314] text-base font-normal p-2 rounded-lg text-[#028FA3]">
                            View Details
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="text-base font-medium text-[#443C38CC]">
                      Status: <span className="text-[#418C12]">Approved</span>{" "}
                    </div>

                    <div className=" flex justify-between items-center border-t border-[#028FA350] py-2 -mb-3 -mx-4">
                      <span className="text-[#028FA3] text-lg font-medium px-3">
                        Amount to be paid
                      </span>
                      <span className="text-[#028FA3] text-xl font-medium px-3">
                        Rs 17,896
                      </span>
                    </div>
                  </div>

                  <div
                    className="border-1 border-[#028FA350] p-3 rounded-2xl"
                    style={{
                      boxShadow:
                        "0px 4px 4px 0px #169CB00D, 0px -2px 4px 0px #169CB00D",
                    }}
                  >
                    <div className="flex flex-col mb-3">
                      <div className="flex flex-col gap-1">
                        <div className="flex justify-between items-center">
                          <div className="text-[#443C38] text-lg font-medium">
                            {" "}
                            <FontAwesomeIcon
                              icon={faSuitcaseRolling}
                              className="mr-2 "
                            />
                            Trip to Mumbai
                          </div>
                          {/* <div className="text-[#028FA3] underline text-xs">Flight details</div> */}
                        </div>
                        <div className="text-[#229DAF] ">7 Jan - 10 Jan</div>
                        <div className="flex justify-between items-center mt-0 mb-0">
                          {/* Flight Information */}
                          <div className="flex flex-col">
                            <div className="flex items-center justify-between gap-5 w-full">
                              <div className="flex items-center space-x-1 text-sm">
                                <span className="font-semibold text-[#030F0C80]">
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
                                <span className="font-semibold text-[#030F0C80]">
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

                    <div className="text-base font-medium text-[#443C38CC]">
                      Status: <span className="text-[#418C12]">Approved</span>{" "}
                    </div>

                    <div className=" flex justify-between items-center border-t border-[#028FA350] py-2 -mb-3 -mx-4">
                      <span className="text-[#028FA3] text-lg font-medium px-3">
                        Amount to be paid
                      </span>
                      <span className="text-[#028FA3] text-xl font-medium px-3">
                        Rs 17,896
                      </span>
                    </div>
                  </div>
                </div>

                {isOpen && (
                  <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
                    <div className="bg-white p-3 rounded-lg shadow-lg w-fit">
                      <div className="flex justify-between items-center space-x-4">
                        <div className="text-xl text-[#030F0C] font-semibold">
                          Want to cancel your Travel Request?
                        </div>
                        <button
                          onClick={handleClose}
                          className="text-[#878786] flex flex-end"
                        >
                          <FontAwesomeIcon
                            icon={faXmarkCircle}
                            className="ml-2 "
                          />
                        </button>
                      </div>
                      <div className="text-xs text-[#443C38] font-normal">
                        Approvers will be informed when a request is cancelled.
                      </div>

                      <div className="mt-4">
                        <div className="font-medium text-lg text-[#030F0C] ">
                          Reason for cancelling?
                        </div>
                        <div className="mt-2">
                          <label
                            className={`flex items-center mb-2 text-base ${
                              selectedReason === "Change in travel plans"
                                ? "text-[#028FA3]" // Text color when selected
                                : "text-[#443C38CC]" // Text color when not selected
                            }`}
                          >
                            <input
                              type="radio"
                              name="reason"
                              value="Change in travel plans"
                              checked={
                                selectedReason === "Change in travel plans"
                              }
                              onChange={handleReasonChange}
                              className={`mr-2 ${
                                selectedReason === "Change in travel plans"
                                  ? "accent-[#028FA3]" // Radio button color when selected
                                  : "accent-[#878786]" // Radio button color when not selected
                              }`}
                            />
                            Change in travel plans
                          </label>

                          <label
                            className={`flex items-center mb-2 text-base ${
                              selectedReason === "Finding better travel options"
                                ? "text-[#028FA3]" // Text color when selected
                                : "text-[#443C38CC]" // Text color when not selected
                            }`}
                          >
                            <input
                              type="radio"
                              name="reason"
                              value="Finding better travel options"
                              checked={
                                selectedReason ===
                                "Finding better travel options"
                              }
                              onChange={handleReasonChange}
                              className={`mr-2 ${
                                selectedReason ===
                                "Finding better travel options"
                                  ? "accent-[#028FA3]" // Radio button color when selected
                                  : "accent-[#878786]" // Radio button color when not selected
                              }`}
                            />
                            Finding better travel options
                          </label>

                          <label
                            className={`flex items-center mb-2 text-base ${
                              selectedReason === "Trip got cancelled"
                                ? "text-[#028FA3]" // Text color when selected
                                : "text-[#443C38CC]" // Text color when not selected
                            }`}
                          >
                            <input
                              type="radio"
                              name="reason"
                              value="Trip got cancelled"
                              checked={selectedReason === "Trip got cancelled"}
                              onChange={handleReasonChange}
                              className={`mr-2 ${
                                selectedReason === "Trip got cancelled"
                                  ? "accent-[#028FA3]" // Radio button color when selected
                                  : "accent-[#878786]" // Radio button color when not selected
                              }`}
                            />
                            Trip got cancelled
                          </label>

                          <label
                            className={`flex items-center text-base ${
                              selectedReason === "Others"
                                ? "text-[#028FA3]" // Text color when selected
                                : "text-[#443C38CC]" // Text color when not selected
                            }`}
                          >
                            <input
                              type="radio"
                              name="reason"
                              value="Others"
                              checked={selectedReason === "Others"}
                              onChange={handleReasonChange}
                              className={`mr-2 ${
                                selectedReason === "Others"
                                  ? "accent-[#028FA3]" // Radio button color when selected
                                  : "accent-[#878786]" // Radio button color when not selected
                              }`}
                            />
                            Others
                          </label>

                          {selectedReason === "Others" && (
                            <>
                              <textarea
                                className="mt-2 w-full border border-[#028FA3] rounded-lg p-2 focus:outline-none focus:ring-1 focus:ring-[#028FA3]"
                                placeholder="Please mention the reason for travel here"
                                rows={3}
                              ></textarea>
                              <div className="text-[#878786] text-xxs font-normal">
                                This message will be included in the email.
                              </div>
                            </>
                          )}
                        </div>
                      </div>

                      <div className="mt-6 flex justify-center">
                        <button
                          className="bg-[#028FA3] text-white py-2 px-6 rounded-full hover:bg-[#0097A7]"
                          onClick={handleOpen}
                        >
                          Cancel Request
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {isModalOpen && (
                  <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
                    <div className="bg-white w-[100%] max-w-md p-6 rounded-lg shadow-lg">
                      <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-semibold text-[#030F0C]">
                          Request Cancelled
                        </h2>
                        <button
                          onClick={handleRequestClose}
                          className="text-[#878786]"
                        >
                          <FontAwesomeIcon
                            icon={faXmarkCircle}
                            className="ml-2"
                          />
                        </button>
                      </div>
                      <div className="text-sm font-normal text-[#443C38] mb-4">
                        Your travel request has been cancelled. Your
                        <span className="text-[#028FA3]">
                          {" "}
                          approver will be notified{" "}
                        </span>
                        about this cancellation.
                      </div>
                      <button
                        className="bg-[#028FA3] text-white py-2 px-6 rounded-full hover:bg-[#0097A7] mx-auto"
                        onClick={handleRequestClose}
                      >
                        Okay
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </>
          )}

          {activeTab === 2 && (
            <>
              <div>
                <div className="mt-2">
                  <div className="relative w-48">
                    {/* Dropdown button */}
                    <div
                      className="w-48 h-16 border-1 border-[#028FA350] rounded-full px-4 py-2 flex items-center justify-between cursor-pointer"
                      onClick={toggleMenu}
                    >
                      <span className="text-[#878786] font-normal text-sm">
                        {currentSelection}
                      </span>{" "}
                      {/* Updated variable name */}
                      <FontAwesomeIcon
                        icon={faCaretDown}
                        className="text-gray-500 ml-2"
                      />
                    </div>

                    {/* Dropdown menu */}
                    {menuOpen && (
                      <div className="absolute mt-1 w-full bg-white border border-[#028FA340] rounded-lg shadow-lg">
                        <div
                          className={`px-4 py-2 cursor-pointer ${
                            currentSelection === "Flight"
                              ? "text-[#028fa3] font-bold"
                              : "text-gray-500"
                          }`}
                          onClick={() => handleSelection("Flight")} // Updated function name
                        >
                          Flight
                        </div>
                        <div
                          className={`px-4 py-2 cursor-pointer ${
                            currentSelection === "Hotel"
                              ? "text-[#028fa3] font-bold"
                              : "text-gray-500"
                          }`}
                          onClick={() => handleSelection("Hotel")} // Updated function name
                        >
                          Hotel
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex flex-col mt-3 gap-3">
                  <div
                    className="border-1 border-[#028FA350] p-3 rounded-2xl"
                    style={{
                      boxShadow:
                        "0px 4px 4px 0px #169CB00D, 0px -2px 4px 0px #169CB00D",
                    }}
                  >
                    <div className="flex flex-col mb-3">
                      <div className="flex flex-col gap-1">
                        <div className="flex justify-between items-center">
                          <div className="text-[#443C38] text-lg font-medium">
                            {" "}
                            <FontAwesomeIcon icon={faBed} className="mr-2" />
                            Stay in Mariott, Bengaluru
                          </div>
                          <div className="text-[#028FA3] underline text-xs">
                            Hotel Details
                          </div>
                        </div>
                        <div className="text-base text-[#030F0C80] font-normal">
                          {" "}
                          Wed, 21st Mar - 23rd Mar |{" "}
                          <span className="font-semibold">
                            Booking ID
                          </span> : {6087885612}{" "}
                        </div>
                        <div className="flex justify-between ">
                          <div className="text-base text-[#030F0C80] font-normal">
                            Bhavya | 1 Room(s)
                          </div>
                        </div>
                      </div>

                      <div className="flex justify-end">
                        <div className="flex gap-2">
                          <button
                            className=" bg-[#418C1226] p-2 px-4 text-[#418C12] rounded-full text-sm font-semibold mt-2"
                            onClick={handleApproveOpen}
                          >
                            APPROVE
                          </button>
                          <button
                            className=" bg-[#FFFFFF] p-2 px-4 text-[#E53944] border-1 border-[#E5394450] rounded-full text-sm font-semibold mt-2"
                            onClick={handleDeclineOpen}
                          >
                            DECLINE
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className=" flex justify-between items-center border-t border-[#028FA350] py-2 -mb-3 -mx-4">
                      <span className="text-[#028FA3] text-lg font-medium px-3">
                        Amount to be paid
                      </span>
                      <span className="text-[#028FA3] text-xl font-medium px-3">
                        Rs 17,896
                      </span>
                    </div>
                  </div>

                  <div
                    className="border-1 border-[#028FA350] p-3 rounded-2xl"
                    style={{
                      boxShadow:
                        "0px 4px 4px 0px #169CB00D, 0px -2px 4px 0px #169CB00D",
                    }}
                  >
                    <div className="flex flex-col mb-3">
                      <div className="flex flex-col gap-1">
                        <div className="flex justify-between items-center">
                          <div className="text-[#443C38] text-lg font-medium">
                            {" "}
                            <FontAwesomeIcon
                              icon={faPlane}
                              className="h-4 w-6 transform -rotate-45"
                            />
                            Flight Bengaluru to Delhi
                          </div>
                          <div className="text-[#028FA3] underline text-xs">
                            Flight details
                          </div>
                        </div>
                        <div className="text-[#229DAF]  ">
                          Wed, 21st Mar, 5:20 p.m.
                        </div>
                        <div className="text-base text-[#030F0C80] font-normal">
                          {" "}
                          <span className="font-semibold">
                            Booking ID
                          </span> : {6087885612} |{" "}
                          <span className="font-semibold">PNR</span> :{" "}
                          {6087885612}{" "}
                        </div>
                        <div className="flex justify-between">
                          <div className="text-base text-[#030F0C80] font-normal">
                            Bhavya Saraf, Anamika Aggarwal{" "}
                            <span className="font-medium text-[#028FA3]">
                              +2
                            </span>
                          </div>
                        </div>

                        <div className="flex justify-end">
                          <div className="flex gap-2">
                            <button
                              className=" bg-[#418C1226] p-2 px-4 text-[#418C12] rounded-full text-sm font-semibold mt-2"
                              onClick={handleApproveOpen}
                            >
                              APPROVE
                            </button>
                            <button
                              className=" bg-[#FFFFFF] p-2 px-4 text-[#E53944] border-1 border-[#E5394450] rounded-full text-sm font-semibold mt-2"
                              onClick={handleDeclineOpen}
                            >
                              DECLINE
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className=" flex justify-between items-center border-t border-[#028FA350] py-2 -mb-3 -mx-4">
                      <span className="text-[#028FA3] text-lg font-medium px-3">
                        Amount to be paid
                      </span>
                      <span className="text-[#028FA3] text-xl font-medium px-3">
                        Rs 17,896
                      </span>
                    </div>
                  </div>

                  <div
                    className="border-1 border-[#028FA350] p-3 rounded-2xl"
                    style={{
                      boxShadow:
                        "0px 4px 4px 0px #169CB00D, 0px -2px 4px 0px #169CB00D",
                    }}
                  >
                    <div className="flex flex-col mb-3">
                      <div className="flex flex-col gap-1">
                        <div className="flex justify-between items-center">
                          <div className="text-[#443C38] text-lg font-medium">
                            {" "}
                            <FontAwesomeIcon
                              icon={faSuitcaseRolling}
                              className="mr-2 "
                            />
                            Trip to Mumbai
                          </div>
                          {/* <div className="text-[#028FA3] underline text-xs">Flight details</div> */}
                        </div>
                        <div className="text-[#229DAF] ">7 Jan - 10 Jan</div>
                        <div className="flex justify-between items-center mt-0 mb-0">
                          {/* Flight Information */}
                          <div className="flex flex-col">
                            <div className="flex items-center justify-between gap-5 w-full">
                              <div className="flex items-center space-x-1 text-sm">
                                <span className="font-semibold text-[#030F0C80]">
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
                                <span className="font-semibold text-[#030F0C80]">
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

                        <div className="flex justify-between">
                          <div className="text-base text-[#030F0C80] font-normal">
                            Bhavya Saraf, Anamika Aggarwal{" "}
                            <span className="font-medium text-[#028FA3]">
                              +2
                            </span>
                          </div>
                        </div>

                        <div className="flex justify-end">
                          <div className="flex gap-2">
                            <button
                              className=" bg-[#418C1226] p-2 px-4 text-[#418C12] rounded-full text-sm font-semibold mt-2"
                              onClick={handleApproveOpen}
                            >
                              APPROVE
                            </button>
                            <button
                              className=" bg-[#FFFFFF] p-2 px-4 text-[#E53944] border-1 border-[#E5394450] rounded-full text-sm font-semibold mt-2"
                              onClick={handleDeclineOpen}
                            >
                              DECLINE
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className=" flex justify-between items-center border-t border-[#028FA350] py-2 -mb-3 -mx-4">
                      <span className="text-[#028FA3] text-lg font-medium px-3">
                        Amount to be paid
                      </span>
                      <span className="text-[#028FA3] text-xl font-medium px-3">
                        Rs 17,896
                      </span>
                    </div>
                  </div>
                </div>

                {isDeclineOpen && (
                  <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
                    <div className="bg-white p-3 rounded-lg shadow-lg w-fit">
                      <div className="flex justify-between items-center gap-[150px]">
                        <div className="text-xl text-[#030F0C] font-semibold">
                          Reason for Declining
                        </div>
                        <button
                          onClick={handleDeclineClose}
                          className="text-[#878786] flex justify-end flex-end"
                        >
                          <FontAwesomeIcon
                            icon={faXmarkCircle}
                            className="ml-2 "
                          />
                        </button>
                      </div>
                      <div className="text-xs text-[#443C38] font-normal">
                        Travelers will be informed when a request is declined.
                      </div>

                      <div className="mt-4">
                        <div className="mt-2">
                          <label
                            className={`flex items-center mb-2 text-base ${
                              selectedReason === "Policy Violation"
                                ? "text-[#028FA3]" // Text color when selected
                                : "text-[#443C38CC]" // Text color when not selected
                            }`}
                          >
                            <input
                              type="radio"
                              name="reason"
                              value="Policy Violation"
                              checked={selectedReason === "Policy Violation"}
                              onChange={handleReasonChange}
                              className={`mr-2 ${
                                selectedReason === "Policy Violation"
                                  ? "accent-[#028FA3]" // Radio button color when selected
                                  : "accent-[#878786]" // Radio button color when not selected
                              }`}
                            />
                            Policy Violation
                          </label>

                          <label
                            className={`flex items-center mb-2 text-base ${
                              selectedReason === " Non-essential Travel"
                                ? "text-[#028FA3]" // Text color when selected
                                : "text-[#443C38CC]" // Text color when not selected
                            }`}
                          >
                            <input
                              type="radio"
                              name="reason"
                              value=" Non-essential Travel"
                              checked={
                                selectedReason === " Non-essential Travel"
                              }
                              onChange={handleReasonChange}
                              className={`mr-2 ${
                                selectedReason === " Non-essential Travel"
                                  ? "accent-[#028FA3]" // Radio button color when selected
                                  : "accent-[#878786]" // Radio button color when not selected
                              }`}
                            />
                            Non-essential Travel
                          </label>

                          <label
                            className={`flex items-center mb-2 text-base ${
                              selectedReason === "Budget exceeding"
                                ? "text-[#028FA3]" // Text color when selected
                                : "text-[#443C38CC]" // Text color when not selected
                            }`}
                          >
                            <input
                              type="radio"
                              name="reason"
                              value="Budget exceeding"
                              checked={selectedReason === "Budget exceeding"}
                              onChange={handleReasonChange}
                              className={`mr-2 ${
                                selectedReason === "Budget exceeding"
                                  ? "accent-[#028FA3]" // Radio button color when selected
                                  : "accent-[#878786]" // Radio button color when not selected
                              }`}
                            />
                            Budget exceeding
                          </label>

                          <label
                            className={`flex items-center text-base ${
                              selectedReason === "Others"
                                ? "text-[#028FA3]" // Text color when selected
                                : "text-[#443C38CC]" // Text color when not selected
                            }`}
                          >
                            <input
                              type="radio"
                              name="reason"
                              value="Others"
                              checked={selectedReason === "Others"}
                              onChange={handleReasonChange}
                              className={`mr-2 ${
                                selectedReason === "Others"
                                  ? "accent-[#028FA3]" // Radio button color when selected
                                  : "accent-[#878786]" // Radio button color when not selected
                              }`}
                            />
                            Others
                          </label>

                          {selectedReason === "Others" && (
                            <>
                              <textarea
                                className="mt-2 w-full border border-[#028FA3] rounded-lg p-2 focus:outline-none focus:ring-1 focus:ring-[#028FA3]"
                                placeholder="Please mention the reason for travel here"
                                rows={3}
                              ></textarea>
                              <div className="text-[#878786] text-xxs font-normal">
                                This message will be included in the email.
                              </div>
                            </>
                          )}
                        </div>
                      </div>

                      <div className="mt-6 flex justify-center">
                        <button
                          className="bg-[#028FA3] text-white py-2 px-6 rounded-full hover:bg-[#0097A7]"
                          onClick={handleDeclineClose}
                        >
                          DECLINE REQUEST
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {isApprove && (
                  <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
                    <div className="bg-white p-3 rounded-lg shadow-lg w-fit">
                      <div className="flex justify-between items-center gap-[150px]">
                        <div className="text-xl text-[#030F0C] font-semibold">
                          Approve Request
                        </div>
                        <button
                          onClick={handleApproveClose}
                          className="text-[#878786] flex justify-end flex-end"
                        >
                          <FontAwesomeIcon
                            icon={faXmarkCircle}
                            className="ml-2 "
                          />
                        </button>
                      </div>
                      <div className="text-xs text-[#443C38] font-normal">
                        Travelers will be informed when a request is approved.
                      </div>

                      <div className="mt-4">
                        <div className="mt-2">
                          <div className="flex flex-col mb-2">
                            <label
                              className={`flex items-center mb-0 text-base ${
                                selectedReason === "Approve"
                                  ? "text-[#028FA3]" // Text color when selected
                                  : "text-[#443C38CC]" // Text color when not selected
                              }`}
                            >
                              <input
                                type="radio"
                                name="reason"
                                value="Approve"
                                checked={selectedReason === "Approve"}
                                onChange={handleReasonChange}
                                className={`mr-2 ${
                                  selectedReason === "Approve"
                                    ? "accent-[#028FA3]" // Radio button color when selected
                                    : "accent-[#878786]" // Radio button color when not selected
                                }`}
                              />
                              Approve
                            </label>
                            <div className="text-[#443C38B2] font-normal text-xs">
                              {" "}
                              Clicking this will approve the request without
                              initiating payment.
                            </div>
                          </div>
                          <div className="flex flex-col mb-2">
                            <label
                              className={`flex items-center mb-0 text-base ${
                                selectedReason === "Approve and Pay"
                                  ? "text-[#028FA3]" // Text color when selected
                                  : "text-[#443C38CC]" // Text color when not selected
                              }`}
                            >
                              <input
                                type="radio"
                                name="reason"
                                value="Approve and Pay"
                                checked={selectedReason === "Approve and Pay"}
                                onChange={handleReasonChange}
                                className={`mr-2 ${
                                  selectedReason === "Approve and Pay"
                                    ? "accent-[#028FA3]" // Radio button color when selected
                                    : "accent-[#878786]" // Radio button color when not selected
                                }`}
                              />
                              Approve and Pay
                            </label>
                            <div className="text-[#443C38B2] font-normal text-xs">
                              {" "}
                              Clicking this button will approve the request and
                              proceed to the payment process.
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="mt-6 flex justify-center">
                        <button
                          className="bg-[#028FA3] text-white py-2 px-12 rounded-full hover:bg-[#0097A7]"
                          onClick={handleApproveClose}
                        >
                          APPROVE REQUEST
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default TravelApprovals;
