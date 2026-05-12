import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPlane,
  faCaretDown,
  faCaretRight,
  faShareNodes,
  faBed,
} from "@fortawesome/free-solid-svg-icons";
import Flight from "@/components/corporate/TravelPolicy/Flight";
import Hotel from "@/components/corporate/TravelPolicy/Hotel";

const TravelPolicy = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeTab, setActiveTab] = useState("flight");
  const [isEditing, setIsEditing] = useState(false);
  const [policyName, setPolicyName] = useState("Global Travel Policy");

  const toggleExpansion = () => {
    setIsExpanded(!isExpanded);
  };
  const handleEditClick = () => {
    setIsEditing(true); // Enable editing mode
  };

  const handleInputChange = (e) => {
    setPolicyName(e.target.value); // Update policy name
  };

  const handleBlur = () => {
    setIsEditing(false); // Exit editing mode when input loses focus
  };

  return (
    <>
      <div className="w-full mx-auto p-3 bg-white  rounded-lg border-1 border-[#028fa350]">
        {/* Header */}
        <div className="flex justify-between items-center ">
          <div>
            <div className="max-w-lg mx-auto">
              {isEditing ? (
                <div className="w-full">
                  <div className="relative w-full min-w-[50px] h-10">
                    <input
                      type="text"
                      id="editname"
                      name="editname"
                      value={policyName}
                      onChange={handleInputChange}
                      onBlur={handleBlur}
                      className="block px-2.5 pb-2.5 pt-2.5 w-full text-sm text-gray-900 bg-transparent rounded-lg border-1 border-gray-300 appearance-none focus:outline-none focus:ring-0 focus:border-[#028fa3]-600 peer"
                      placeholder=" "
                      autoFocus
                    />
                    <label
                      htmlFor="editname"
                      className="absolute text-sm text-gray-500 duration-300 transform -translate-y-4 scale-75 top-2 z-10 bg-white px-2 peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4"
                    >
                      Travel policy name
                      <span className="text-red-500 absolute right-[-5px] m-1 mt-0">
                        *
                      </span>
                    </label>
                  </div>
                </div>
              ) : (
                <div
                  className="text-sm sm:text-xl font-medium text-gray-800 cursor-pointer"
                  onClick={handleEditClick}
                >
                  {policyName}
                </div>
              )}
            </div>
            <div className="text-xxs sm:text-sm text-[#171A19CC] mt-2 leading-3">
              General rules will be applied to all Departments, Groups and
              Sub-groups
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button className="flex items-center gap-1 text-[#028fa3] text-xs sm:text-base font-normal bg-[#169CB00D] border-1 border-[#028fa330] px-3 py-1 rounded-2xl">
              Duplicate
            </button>
            <button className="flex items-center gap-1 text-[#028fa3] text-xs sm:text-base font-normal bg-[#169CB00D] border-1 border-[#028fa330] px-3 py-1 rounded-2xl">
              <FontAwesomeIcon icon={faShareNodes} className="text-base" />
              Share
            </button>
            <FontAwesomeIcon
              icon={isExpanded ? faCaretDown : faCaretRight}
              className="text-gray-500 cursor-pointer text-lg hover:text-gray-800"
              onClick={toggleExpansion}
            />
          </div>
        </div>
        {isExpanded && (
          <>
            <div className=" mt-3 flex items-center w-fit border-1 border-[#028fa3] rounded-full overflow-hidden">
              <button
                className={`flex items-center text-xs sm:text-base gap-2 px-4 py-2 ${
                  activeTab === "flight"
                    ? " text-[#028fa3]"
                    : "bg-white text-gray-600"
                }`}
                onClick={() => setActiveTab("flight")}
              >
                <FontAwesomeIcon
                  icon={faPlane}
                  className="transform -rotate-90"
                />
                Flight
              </button>

              <div className="border-r border-[#028fa3] h-10"></div>

              <button
                className={`flex items-center text-xs sm:text-base gap-2 px-4 py-2 ${
                  activeTab === "hotel"
                    ? "text-[#028fa3]"
                    : "bg-white text-gray-600"
                }`}
                onClick={() => setActiveTab("hotel")}
              >
                <FontAwesomeIcon icon={faBed} />
                Hotel
              </button>
            </div>

            <div>
              {activeTab === "flight" && <Flight />}
              {activeTab === "hotel" && <Hotel />}
            </div>

            <div className="flex justify-center gap-3">
              <button className="px-4 py-2 text-sm font-medium text-gray-500 border border-gray-300 rounded-lg ">
                Cancel
              </button>
              <button className="px-4 py-2 text-sm font-medium text-white bg-[#028FA3] rounded-lg ">
                Save
              </button>
            </div>
          </>
        )}
      </div>
    </>
  );
};

export default TravelPolicy;
