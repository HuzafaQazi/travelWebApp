import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import Select from "react-select";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUser, faTimes } from "@fortawesome/free-solid-svg-icons";
import { toast } from "react-toastify";
import axios from "@/utils/axios/axios";
import config from "@/config";
import showToast from "@/utils/toast";

const TravelerSelectDropdown = ({
  corporateUser,
  adultsCount,
  onTravelerChange,
  initialSelectedTravelers = [],
}) => {
  const userDetails = useSelector((state) => state?.user?.userInfo);

  const [showTravellerSelection, setShowTravellerSelection] = useState(false);
  const [selectedTravelers, setSelectedTravelers] = useState(
    initialSelectedTravelers
  );
  const [corporateEmployeeOptions, setCorporateEmployeeOptions] = useState([]);

  useEffect(() => {
    const fetchCorporateEmployees = async (companyId) => {
      try {
        const response = await axios.post(`${config.CORPORATE.EMPLOYEE_LIST}`, {
          // companyId,
          filter: [],
          // status: "Active",
        });
        if (response?.data?.status === "SUCCESS") {
          const employeeOptions = response?.data?.data?.users?.map(
            (traveler) => ({
              value: traveler._id,
              label: `${traveler.firstName || ""} ${traveler.lastName || ""}`,
              data: traveler,
            })
          );
          setCorporateEmployeeOptions(employeeOptions);
        }
      } catch (error) {
        console.log(error);
      }
    };
    if (corporateUser) {
      const { companyId } = userDetails;
      fetchCorporateEmployees(companyId);
    }
  }, [corporateUser, userDetails]);

  useEffect(() => {
    if (selectedTravelers.length > adultsCount) {
      const updatedTravelers = selectedTravelers.slice(0, adultsCount);
      setSelectedTravelers(updatedTravelers);
      onTravelerChange(updatedTravelers); // Update parent component's state
      showToast("error",`Traveler count adjusted to match number of adults.`);
    }
  }, [adultsCount]);

  useEffect(() => {
    setSelectedTravelers(initialSelectedTravelers);
  }, [initialSelectedTravelers]);

  const handleShowTravellerSelection = () => {
    setShowTravellerSelection(true);
  };

  const handleRemoveTraveler = (event, travelerToRemove) => {
    event.stopPropagation();
    const updatedTravelers = selectedTravelers.filter(
      (traveler) => traveler.data._id !== travelerToRemove.data._id
    );
    setSelectedTravelers(updatedTravelers);
    onTravelerChange(updatedTravelers);
  };

  const handleSelectChange = (selectedOptions) => {
    if (adultsCount > 0) {
      if (selectedOptions.length > adultsCount) {
        showToast("error",`You can only select up to ${adultsCount} travelers.`);
        return;
      }
      setSelectedTravelers(selectedOptions);
      onTravelerChange(selectedOptions);
    }
  };

  // removing down arrow from select dropdown of title
  const customComponents = {
    IndicatorSeparator: () => null,
    DropdownIndicator: () => null,
  };

  if (!corporateUser) return null;

  return (
    <>
      {!showTravellerSelection && (
        <button
          className="bg-white p-2 px-4 rounded-full flex items-center gap-1 text-xs"
          onClick={handleShowTravellerSelection}
        >
          <FontAwesomeIcon
            icon={faUser}
            size="sm"
            style={{
              color: "#ffffff",
              backgroundColor: "#028fa3",
              padding: "5px",
              borderRadius: "50%",
            }}
          />
          Traveler:
          {selectedTravelers.length === 0 ? (
            <span className="text-[#028fa3]">Select Travelers</span>
          ) : (
            <div className="flex flex-wrap gap-1">
              {selectedTravelers.map((traveler, index) => (
                <span
                  key={traveler.value}
                  className="flex items-center gap-1 text-[#028fa3]"
                >
                  {traveler.label}
                  <FontAwesomeIcon
                    icon={faTimes}
                    size="sm"
                    style={{ cursor: "pointer" }}
                    onClick={(e) => handleRemoveTraveler(e, traveler)}
                  />
                  {index < selectedTravelers.length - 1 && <span>, </span>}
                </span>
              ))}
            </div>
          )}
        </button>
      )}

      {showTravellerSelection && (
        <>
          <Select
            isClearable
            placeholder="Select By Employee Id Or Name"
            className="text-sm font-medium text-[#878786] z-20"
            isMulti
            isSearchable
            options={corporateEmployeeOptions}
            value={selectedTravelers}
            onChange={handleSelectChange}
            filterOption={(option, inputValue) => {
              const { label, data } = option;
              return (
                label.toLowerCase().includes(inputValue.toLowerCase()) ||
                data?.data?.employeeId
                  ?.toLowerCase()
                  ?.includes(inputValue.toLowerCase())
              );
            }}
            components={customComponents}
            styles={{
              menu: (provided) => ({
                ...provided,
                zIndex: 9999,
              }),
              multiValue: (provided) => ({
                ...provided,
                backgroundColor: "#e1f5fe",
                borderRadius: "9999px",
              }),
              multiValueLabel: (provided) => ({
                ...provided,
                color: "#028fa3",
              }),
              multiValueRemove: (provided) => ({
                ...provided,
                color: "#028fa3",
                ":hover": {
                  backgroundColor: "#b3e5fc",
                  color: "#028fa3",
                },
              }),
              option: (provided, state) => ({
                ...provided,
                backgroundColor: state.isFocused ? "#b3e5fc" : "#fff", // Background color on hover (focused state)
                color: state.isFocused ? "#028fa3" : "#000", // Text color on hover
                ":hover": {
                  backgroundColor: "#b3e5fc", // Background color on hover
                  color: "#028fa3", // Text color on hover
                },
              }),
            }}
          />
          <button
            className="bg-[#028fa3] text-white p-2 px-4 rounded-full mt-2"
            onClick={() => setShowTravellerSelection(false)}
          >
            {selectedTravelers.length === 0 ? "Cancel" : "Done"}
          </button>
        </>
      )}
    </>
  );
};

export default TravelerSelectDropdown;
