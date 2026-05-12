import { useState, useEffect, useRef } from "react";
import { useSelector } from "react-redux";
import Select, { components } from "react-select";
import { toast } from "react-toastify";
import axios from "@/utils/axios/axios";
import config from "@/config";
import { Eye, X, Trash2, AlertCircle } from "lucide-react";
import ReactDOM from "react-dom";

const CustomValueContainer = (props) => {
  const { children, getValue, selectProps, showFullList } = props;
  const selectedTravelers = getValue();
  const inputValue = selectProps.inputValue;

  let displayValue = "";
  let countDisplay = "";

  if (selectedTravelers.length === 1) {
    displayValue = selectedTravelers[0].label;
  } else if (selectedTravelers.length > 1) {
    displayValue = selectedTravelers[0].label;
    countDisplay = ` +${selectedTravelers.length - 1}`;
  }

  return (
    <components.ValueContainer {...props}>
      {selectedTravelers.length === 0 && !inputValue ? (
        <span className="absolute left-0 top-1/2 transform -translate-y-1/2 text-gray-500">
          {selectProps.placeholder}
        </span>
      ) : (
        <>
          <span className="overflow-hidden text-ellipsis whitespace-nowrap max-w-[70%] text-[#000000] font-medium">
            {displayValue}
          </span>
          <span className="text-[#028fa3] font-medium ml-[1px]">
            {countDisplay}
          </span>
        </>
      )}
      {showFullList && children}
      {!showFullList && children[1]}
    </components.ValueContainer>
  );
};

const CustomOption = (props) => {
  const { data, innerRef, innerProps, isSelected, isDisabled } = props;

  return (
    <div
      ref={innerRef}
      {...innerProps}
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "8px 12px",
        backgroundColor: isDisabled ? "#f5f5f5" : "white",
        color: isDisabled ? "#b3b3b3" : "#333",
        cursor: isDisabled ? "not-allowed" : "pointer",
        transition: "background-color 0.2s ease",
      }}
      className={isDisabled ? "cursor-not-allowed" : "hover:bg-gray-100"}
    >
      {data.label}
      {isSelected && !isDisabled && (
        <span
          onClick={(e) => {
            e.stopPropagation();
            props.selectProps.onChange(
              props.selectProps.value.filter(
                (item) => item.value !== data.value
              )
            );
          }}
          className="text-red-500 cursor-pointer ml-2 hover:text-red-700"
        >
          ✖
        </span>
      )}
    </div>
  );
};

const SelectTravellers = ({
  adultsCount,
  onTravelerChange,
  initialSelectedTravelers = [],
  backgroundColor,
  isHomePage,
  modalRef,
  travelCategory,
}) => {
  const userDetails = useSelector((state) => state?.user?.userInfo);

  const isInitialRender = useRef(true);

  const [selectedTravelers, setSelectedTravelers] = useState(
    initialSelectedTravelers
  );
  const [corporateEmployeeOptions, setCorporateEmployeeOptions] = useState([]);
  const [menuIsOpen, setMenuIsOpen] = useState(false);
  const [isToastVisible, setIsToastVisible] = useState(false);
  const [showTravelersList, setShowTravelersList] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [defaultSelectionDone, setDefaultSelectionDone] = useState(false);
  const containerRef = useRef(null);
  const selectRef = useRef(null);
  const container2Ref = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      // Defensive checks to ensure refs are defined
      const isContainer2RefDefined = container2Ref.current !== undefined;
      const isModalRefDefined = modalRef && modalRef.current !== undefined;

      if (
        isContainer2RefDefined &&
        !container2Ref?.current?.contains(event.target) &&
        isModalRefDefined &&
        !modalRef?.current?.contains(event.target) // Check if the click is outside the modal
      ) {
        setShowTravelersList(false); // Close travelers list if clicked outside
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [modalRef]);

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

    if (isInitialRender.current) {
      isInitialRender.current = false;
      if (userDetails) {
        fetchCorporateEmployees(userDetails.companyId);
      }
    }
  }, [userDetails]);

  useEffect(() => {
    if (!defaultSelectionDone) {
      const loggedInUser = userDetails;
      if (
        loggedInUser &&
        selectedTravelers.length === 0 &&
        corporateEmployeeOptions.length > 0
      ) {
        const loggedInUserOption = corporateEmployeeOptions.find(
          (employee) => employee.value === loggedInUser.userId
        );

        if (loggedInUserOption) {
          setSelectedTravelers([loggedInUserOption]);
          onTravelerChange([loggedInUserOption]); // Notify parent component
          setDefaultSelectionDone(true); // Mark default selection as done
        }
      }
    }
  }, [
    corporateEmployeeOptions,
    selectedTravelers,
    defaultSelectionDone,
    userDetails,
    onTravelerChange,
  ]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target)
      ) {
        if (
          selectedTravelers.length > 0 &&
          selectedTravelers.length < adultsCount
        ) {
          setMenuIsOpen(true);
        } else {
          setMenuIsOpen(false);
        }
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [selectedTravelers, adultsCount]);

  useEffect(() => {
    if (selectedTravelers.length > adultsCount) {
      const updatedTravelers = selectedTravelers.slice(0, adultsCount);
      setSelectedTravelers(updatedTravelers);
      onTravelerChange(updatedTravelers);
      showToast("info",`Traveler count adjusted to match number of adults.`);
    }
  }, [adultsCount]);

  useEffect(() => {
    setSelectedTravelers(initialSelectedTravelers);
  }, [initialSelectedTravelers]);

  const handleSelectChange = (selectedOptions) => {
    if (adultsCount > 0) {
      if (selectedOptions?.length > adultsCount) {

          showToast("info",`You can only select up to ${adultsCount} travelers.`);

        return;
      }
      setSelectedTravelers(selectedOptions || []);
      onTravelerChange(selectedOptions || []);
      if ((selectedOptions || []).length === adultsCount) {
        setMenuIsOpen(false); // Close menu automatically
      } else {
        setMenuIsOpen(true); // Keep menu open
      }
    }
  };

  const handleRemoveTraveler = (travelerToRemove) => {
    const updatedTravelers = selectedTravelers.filter(
      (t) => t.value !== travelerToRemove.value
    );
    setSelectedTravelers(updatedTravelers);
    onTravelerChange(updatedTravelers);
    if (updatedTravelers.length === 0) {
      setShowTravelersList(false);
    }
  };

  const handleRemoveAllTravelers = () => {
    setSelectedTravelers([]);
    onTravelerChange([]);
    setShowConfirmDialog(false);
    setShowTravelersList(false);
    showToast("error","All travelers have been removed");
  };

  const toggleMenu = (forceOpen) => {
    if (forceOpen !== undefined) {
      setMenuIsOpen(forceOpen);
    } else {
      setMenuIsOpen((prev) => !prev);
    }
  };

  useEffect(() => {
    if (showConfirmDialog || showTravelersList) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "visible";
    }

    return () => {
      document.body.style.overflow = "visible";
    };
  }, [showConfirmDialog || showTravelersList]);

  useEffect(() => {
    if (showConfirmDialog || showTravelersList) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "visible";
    }

    return () => {
      document.body.style.overflow = "visible";
    };
  }, [showConfirmDialog || showTravelersList]);

  return (
    <>
      <div ref={containerRef}>
        <Select
          ref={selectRef}
          isMulti
          options={corporateEmployeeOptions}
          value={selectedTravelers.length > 0 ? selectedTravelers : null}
          onChange={handleSelectChange}
          blurInputOnSelect={false}
          placeholder="Travelers"
          className="react-select-container"
          classNamePrefix="react-select"
          styles={{
            control: (provided) => ({
              ...provided,
              backgroundColor,
              borderRadius: "8px",
              border: "none",
              boxShadow: "none",
              padding:
                travelCategory === "hotel"
                  ? "1.2rem 1rem 1.2rem 2rem"
                  : isHomePage
                  ? "1.2rem 1rem 1.2rem 2rem"
                  : "0.5rem 1rem 0.5rem 2rem",
              cursor: "pointer",
              "&:hover": {
                border: "none",
              },
            }),
            placeholder: (provided) => ({
              ...provided,
              display: "none",
            }),
            input: (provided) => ({
              ...provided,
              color: "inherit",
              margin: "0",
              padding: "0",
            }),
            valueContainer: (provided) => ({
              ...provided,
              padding: "0",
              display: "flex",
              flexWrap: "nowrap",
              overflowX: "auto",
              whiteSpace: "nowrap",
              maxWidth: "100%",
              cursor: "pointer",
              scrollbarWidth: "none",
              "-ms-overflow-style": "none",
              "&::-webkit-scrollbar": {
                display: "none",
              },
            }),
            menu: (provided) => ({
              ...provided,
              maxHeight: "300px",
              overflowY: "auto",
              scrollbarWidth: "none",
              "-ms-overflow-style": "none",
              "::-webkit-scrollbar": {
                display: "none",
              },
            }),
            menuList: (provided) => ({
              ...provided,
              padding: "0",
              overflowY: "auto",
              height: "100%",
              "::-webkit-scrollbar": {
                width: "5px",
              },
              "::-webkit-scrollbar-track": {
                backgroundColor: "#f0f0f0",
              },
              "::-webkit-scrollbar-thumb": {
                backgroundColor: "#171A1930",
                borderRadius: "4px",
              },
              "::-webkit-scrollbar-thumb:hover": {
                backgroundColor: "#01707d",
              },
            }),
            option: (provided, state) => ({
              ...provided,
              backgroundColor: state.isFocused ? "#f5f5f5" : "white",
              color: "#333",
              cursor: state.isDisabled ? "not-allowed" : "pointer",
              "&:active": {
                backgroundColor: "#e5e7eb",
              },
              "&:hover": {
                backgroundColor: "#f5f5f5",
              },
            }),
          }}
          components={{
            ValueContainer: CustomValueContainer,
            Option: CustomOption,
            DropdownIndicator: () => null,
            IndicatorSeparator: () => null,
            ClearIndicator: () => null,
          }}
          menuIsOpen={menuIsOpen}
          onMenuOpen={() => {
            setMenuIsOpen(true);
          }}
          isOptionDisabled={(option) => {
            return (
              selectedTravelers.length >= adultsCount &&
              !selectedTravelers.some(
                (selected) => selected.value === option.value
              )
            );
          }}
          onKeyDown={(e) => {
            if (!menuIsOpen) {
              setMenuIsOpen(true);
            }
          }}
        />
      </div>

      {selectedTravelers.length > 0 && (
        <button
          onClick={() => setShowTravelersList(true)}
          className="absolute right-3 top-1/2 -translate-y-1/2  text-[#028fa3] hover:text-[#01707d] transition-colors duration-200 rounded-full hover:bg-[#028fa3]/10"
          title="View Travelers"
        >
          <Eye size={20} />
        </button>
      )}

      {/* Confirm Dialog */}
      {showConfirmDialog &&
        ReactDOM.createPortal(
          <div className="fixed inset-0 z-[60] flex items-center justify-center">
            <div
              className="absolute inset-0 bg-black/50 "
              onClick={() => setShowConfirmDialog(false)}
            />
            <div className="relative bg-white rounded-lg shadow-xl p-6 w-full max-w-md m-4 transform transition-all">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0">
                  <AlertCircle className="h-6 w-6 text-red-500" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Remove All Travelers
                  </h3>
                  <p className="mt-2 text-sm text-gray-500">
                    Are you sure you want to remove all travelers? This action
                    cannot be undone.
                  </p>
                  <div className="mt-4 flex gap-3 justify-end">
                    <button
                      onClick={() => setShowConfirmDialog(false)}
                      className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#028fa3]"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleRemoveAllTravelers}
                      className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                    >
                      Remove All
                    </button>
                  </div>
                </div>
                <button
                  onClick={() => setShowConfirmDialog(false)}
                  className=" hover:bg-gray-100 rounded-full transition-colors duration-200"
                >
                  <X size={18} className="text-gray-500" />
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}

      {/* Modal */}
      <div ref={container2Ref}>
        {showTravelersList &&
          ReactDOM.createPortal(
            <div ref={modalRef} className="fixed inset-0 z-[999999999]">
              <div className="absolute inset-0 bg-black/50  transition-opacity duration-300" />
              <div className="fixed inset-0 flex items-start justify-center p-4 cursor-pointer">
                <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl transform transition-all duration-300 scale-100 mt-15">
                  {" "}
                  <div className="p-6">
                    <div className="flex justify-between items-center mb-4">
                      <div className="flex items-center gap-4">
                        <h2 className="text-2xl font-semibold text-gray-800">
                          Selected Travelers({selectedTravelers.length})
                        </h2>
                      </div>
                      <div className="flex items-center gap-2">
                        {selectedTravelers.length > 0 && (
                          <button
                            onClick={() => {
                              setShowConfirmDialog(true);
                              setShowTravelersList(false);
                            }}
                            className="flex items-center gap-2 px-3 py-1.5 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-md transition-colors duration-200"
                          >
                            <Trash2 size={18} />
                            <span className="text-sm font-medium">
                              Remove All
                            </span>
                          </button>
                        )}
                        <button
                          onClick={() => setShowTravelersList(false)}
                          className="p-2 hover:bg-gray-100 rounded-full transition-colors duration-200"
                        >
                          <X size={24} className="text-gray-500" />
                        </button>
                      </div>
                    </div>

                    <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-2">
                      {selectedTravelers.length > 0 ? (
                        selectedTravelers.map((traveler) => (
                          <div
                            key={traveler.value}
                            className="flex items-center justify-between p-2 bg-gray-50 rounded-lg hover:bg-gray-100 transition-all duration-200"
                          >
                            <div className="flex items-center space-x-3">
                              <div className="h-10 w-10 rounded-full bg-[#028fa3]/10 flex items-center justify-center">
                                <span className="text-[#028fa3] font-medium text-lg">
                                  {traveler.label.charAt(0)}
                                </span>
                              </div>
                              <span className="text-gray-700 font-medium">
                                {traveler.label}
                              </span>
                            </div>
                            <button
                              onClick={() => handleRemoveTraveler(traveler)}
                              className="flex items-center gap-2 px-3 py-1.5 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-md transition-colors duration-200"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        ))
                      ) : (
                        <div className="flex flex-col items-center justify-center py-12 text-gray-500">
                          <div className="rounded-full bg-gray-100 p-3 mb-3">
                            <AlertCircle size={24} className="text-gray-400" />
                          </div>
                          <p className="text-lg font-medium">
                            No travelers selected
                          </p>
                          <p className="text-sm text-gray-400 mt-1">
                            Select travelers from the dropdown above
                          </p>
                        </div>
                      )}
                    </div>

                    <div className="mt-6 flex justify-end">
                      <button
                        onClick={() => setShowTravelersList(false)}
                        className="px-6 py-2.5 bg-[#028fa3] text-white font-medium rounded-lg hover:bg-[#01707d] transition-all duration-200 shadow-sm hover:shadow"
                      >
                        Close
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>,
            document.body
          )}
      </div>
    </>
  );
};

export default SelectTravellers;
