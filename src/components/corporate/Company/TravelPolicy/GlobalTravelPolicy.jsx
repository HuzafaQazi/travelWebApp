import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCaretDown,
  faShareNodes,
  faPlane,
  faBed,
  faSpinner,
  faTrain,
  faBus,
  faCar
} from "@fortawesome/free-solid-svg-icons";
import React from "react";
import FlightPolicySection from "./Flight/FlightPolicySection";
import HotelPolicySection from "./Hotel/HotelPolicySection";
import TransportPolicySection from "./TransportPolicySection";

const GlobalTravelPolicy = ({
  activeTab,
  setActiveTab,
  flightMaster,
  hotelMaster,
  trainMaster,
  busMaster,
  carMaster,
  formData,
  onFormUpdate,
  onSave,
  validator,
  refs,
  initialLoading,
  isReadOnly,
  mappingDisplay,
  setMappingDisplay,
}) => {
  return (
    <div className="w-full mx-auto p-3 bg-white  rounded-lg border-1 border-[#028fa350]">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <div className="text-sm sm:text-xl font-medium text-gray-800">
            {/* Not editable => just text */}
            Global Travel Policy
          </div>
          <div className="text-xxs sm:text-sm text-[#171A19CC] mt-2 leading-3">
            General rules will be applied to an entire Organization
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            className="flex items-center gap-1 text-[#028fa3] text-xs sm:text-base font-normal 
                 bg-[#169CB00D] border-1 border-[#028fa330] px-3 py-1 rounded-2xl 
                 cursor-not-allowed opacity-50"
            disabled
          >
            Duplicate
          </button>
          <button
            className="flex items-center gap-1 text-[#028fa3] text-xs sm:text-base font-normal 
                 bg-[#169CB00D] border-1 border-[#028fa330] px-3 py-1 rounded-2xl 
                 cursor-not-allowed opacity-50"
            disabled
          >
            <FontAwesomeIcon icon={faShareNodes} className="text-base" />
            Share
          </button>
          <FontAwesomeIcon
            icon={faCaretDown}
            className="text-gray-500  cursor-not-allowed text-lg hover:text-gray-800"
          />
        </div>
      </div>

      {/* Expanded content for "Global Travel Policy" */}
      <div className="mt-3 flex items-center w-fit border border-[#028fa3] rounded-full overflow-hidden">
        <button
          className={`flex items-center text-xs sm:text-base gap-2 px-4 py-2 ${activeTab === "flight" ? "text-[#028fa3]" : "bg-white text-gray-600"
            }`}
          onClick={() => setActiveTab("flight")}
        >
          <FontAwesomeIcon icon={faPlane} className="transform -rotate-90" />
          Flight
        </button>

        <div className="border-r border-[#028fa3] h-10"></div>

        <button
          className={`flex items-center text-xs sm:text-base gap-2 px-4 py-2 ${activeTab === "hotel" ? "text-[#028fa3]" : "bg-white text-gray-600"
            }`}
          onClick={() => setActiveTab("hotel")}
        >
          <FontAwesomeIcon icon={faBed} />
          Hotel
        </button>

        {/* Train Tab */}
        <div className="border-r border-[#028fa3] h-10"></div>

        <button
          className={`flex items-center text-xs sm:text-base gap-2 px-4 py-2 ${activeTab === "train"
            ? "text-[#028fa3]"
            : "bg-white text-gray-600"
            }`}
          onClick={() => setActiveTab("train")}
        >
          <FontAwesomeIcon icon={faTrain} />
          Train
        </button>

        {/* Bus Tab */}
        <div className="border-r border-[#028fa3] h-10"></div>

        <button
          className={`flex items-center text-xs sm:text-base gap-2 px-4 py-2 ${activeTab === "bus"
            ? "text-[#028fa3]"
            : "bg-white text-gray-600"
            }`}
          onClick={() => setActiveTab("bus")}
        >
          <FontAwesomeIcon icon={faBus} />
          Bus
        </button>

        {/* Car Tab */}
        <div className="border-r border-[#028fa3] h-10"></div>

        <button
          className={`flex items-center text-xs sm:text-base gap-2 px-4 py-2 ${activeTab === "car"
            ? "text-[#028fa3]"
            : "bg-white text-gray-600"
            }`}
          onClick={() => setActiveTab("car")}
        >
          <FontAwesomeIcon icon={faCar} />
          Car
        </button>
      </div>

      <div>
        {activeTab === "flight" && (
          <FlightPolicySection
            masterData={flightMaster}
            formData={formData}
            onFormUpdate={onFormUpdate}
            travelCategory="2"
            validator={validator}
            refs={refs.flightErrorRef}
            isReadOnly={isReadOnly}
            mappingDisplay={mappingDisplay}
            setMappingDisplay={setMappingDisplay}
            isGlobalPolicy={true}
          />
        )}
        {activeTab === "hotel" && (
          <HotelPolicySection
            masterData={hotelMaster}
            formData={formData}
            onFormUpdate={onFormUpdate}
            travelCategory="1"
            validator={validator}
            refs={refs.hotelErrorRef}
            isReadOnly={isReadOnly}
            mappingDisplay={mappingDisplay}
            setMappingDisplay={setMappingDisplay}
            isGlobalPolicy={true}
          />
        )}
        {activeTab === "train" && (
          <TransportPolicySection
            masterData={trainMaster}
            formData={formData}
            onFormUpdate={onFormUpdate}
            travelCategory={TRAVEL_CATEGORIES.TRAIN || "3"}
            validator={validator}
            refs={refs.trainErrorRef}
            isReadOnly={count === 0}
            mappingDisplay={mappingDisplay}
            setMappingDisplay={setMappingDisplay}
            isGlobalPolicy={isGlobalPolicy}
          />
        )}
        {activeTab === "bus" && (
          <TransportPolicySection
            masterData={busMaster}
            formData={formData}
            onFormUpdate={onFormUpdate}
            travelCategory={TRAVEL_CATEGORIES.BUS || "4"}
            validator={validator}
            refs={refs.busErrorRef}
            isReadOnly={count === 0}
            mappingDisplay={mappingDisplay}
            setMappingDisplay={setMappingDisplay}
            isGlobalPolicy={isGlobalPolicy}
          />
        )}
        {activeTab === "car" && (
          <TransportPolicySection
            masterData={carMaster}
            formData={formData}
            onFormUpdate={onFormUpdate}
            travelCategory={TRAVEL_CATEGORIES.CAR || "5"}
            validator={validator}
            refs={refs.carErrorRef}
            isReadOnly={count === 0}
            mappingDisplay={mappingDisplay}
            setMappingDisplay={setMappingDisplay}
            isGlobalPolicy={isGlobalPolicy}
          />
        )}
      </div>

      <div className="flex justify-center gap-3">
        <button className="px-4 py-2 text-sm font-medium text-gray-500 border border-gray-300 rounded-lg">
          Cancel
        </button>
        <button
          disabled={initialLoading}
          onClick={onSave}
          className="px-4 py-2 text-sm font-medium text-white bg-[#028FA3] rounded-lg"
        >
          {initialLoading ? (
            <div className="flex items-center gap-2">
              <FontAwesomeIcon icon={faSpinner} spin />
            </div>
          ) : (
            "Save"
          )}
        </button>
      </div>
    </div>
  );
};

export default GlobalTravelPolicy;
