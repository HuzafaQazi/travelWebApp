import { useState, useEffect, useRef } from "react";
import { components } from "react-select";
import AsyncSelect from "react-select/async";
import { useSelector, useDispatch } from "react-redux";
import {
  fetchEmployees,
  initializeLoggedInUser,
  setSelectedTravelers,
  setDefaultSelectionDone,
  setAdultsCount,
  setHasFetchedOnHome,
} from "@/store/slices/travellersSlice";
import { toast } from "react-toastify";
import showToast from "@/utils/toast";
import { Eye, X, Trash2, AlertCircle } from "lucide-react";
import ReactDOM from "react-dom";
import { useRouter } from "next/router";

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
          <span className="text-[#155EEF] font-medium ml-[1px]">
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

  const isRemoveDisabled =
    props.selectProps.maxAllowedTravelers === 1 &&
    props.selectProps.value.length === 1;

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
      {isSelected && !isDisabled && !isRemoveDisabled && (
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
  travelCategory = "2",
  maxAllowedTravelers = 9,
}) => {
  const dispatch = useDispatch();
  const router = useRouter();
  const {
    selectedTravelers,
    travelersByCategory,
    initialOptions,
    defaultSelectionDone,
    hasFetchedOnHome,
    status,
    error,
  } = useSelector((state) => state.travellers);
  const userDetails = useSelector((state) => state?.user?.userInfo);

  const isInitialRender = useRef(true);
  const [menuIsOpen, setMenuIsOpen] = useState(false);

  const [showTravelersList, setShowTravelersList] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const containerRef = useRef(null);
  const selectRef = useRef(null);
  const container2Ref = useRef(null);
  const didRunRef = useRef(false);
  const programmaticAdjustmentRef = useRef(false);

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

  // Fetch initial 20 employees
  useEffect(() => {
    dispatch(fetchEmployees({}));
  }, [dispatch]);

  const fetchCorporateEmployees = async (inputValue = "") => {
    const response = await dispatch(
      fetchEmployees({
        searchKey: inputValue,
        pageSize: 20,
        pageNo: 1,
      })
    );
    return response.payload;
  };

  useEffect(() => {
    if (didRunRef.current) return;
    didRunRef.current = true;

    const initializeTravelers = async () => {
      if (defaultSelectionDone) return;

      // If we have initialSelectedTravelers from parent
      if (initialSelectedTravelers && initialSelectedTravelers.length > 0) {
        dispatch(setSelectedTravelers(initialSelectedTravelers));
        onTravelerChange(initialSelectedTravelers);
        dispatch(setDefaultSelectionDone(true));
        return;
      }

      // If no initialSelectedTravelers and no currently selected travelers
      if (selectedTravelers.length === 0) {
        try {
          const loggedInUserOption = await dispatch(
            initializeLoggedInUser()
          ).unwrap();
          if (loggedInUserOption && loggedInUserOption.length > 0) {
            onTravelerChange(loggedInUserOption);
            // dispatch(setSelectedTravelers(loggedInUserOption));
            dispatch(setDefaultSelectionDone(true));
          }
        } catch (error) {
          console.error("Error initializing logged-in user:", error);
        }
      }
    };

    initializeTravelers();
  }, [
    defaultSelectionDone,
    dispatch,
    initialSelectedTravelers,
    selectedTravelers,
    onTravelerChange,
  ]);

  useEffect(() => {
    const fetchHomePageData = async () => {
      try {
        if (!isHomePage) return;

        // If already fetched on home before, do nothing (use state)
        if (hasFetchedOnHome) return;

        // Set adults count for homepage scenario
        programmaticAdjustmentRef.current = true; // Indicate programmatic change
        dispatch(setAdultsCount(1));

        // Force a non-cached fetch to ensure we get the logged-in user
        const loggedInUserOption = await dispatch(
          initializeLoggedInUser({ shouldCache: false })
        ).unwrap();

        if (loggedInUserOption?.length > 0) {
          dispatch(setSelectedTravelers(loggedInUserOption));
          onTravelerChange(loggedInUserOption);
          dispatch(setDefaultSelectionDone(true));
          dispatch(setHasFetchedOnHome(true));
        }
        programmaticAdjustmentRef.current = false; // Reset after completion
      } catch (error) {
        console.error("Error fetching homepage data:", error);
      }
    };

    // If isHomePage has changed to true, try to fetch
    if (isHomePage) {
      fetchHomePageData();
    }
  }, [isHomePage, dispatch, onTravelerChange]);

  useEffect(() => {
    let currentPath = router.asPath;
    const handleRouteChange = (nextPath) => {
      if (currentPath === nextPath) return;
      currentPath = nextPath;
      // Dispatch on any route change
      dispatch(setHasFetchedOnHome(false));
    };

    router.events.on("routeChangeStart", handleRouteChange);

    return () => {
      router.events.off("routeChangeStart", handleRouteChange);
    };
  }, [dispatch, router]);

  // useEffect(() => {
  //   if (
  //     selectedTravelers.length > 0 &&
  //     selectedTravelers.length < adultsCount
  //   ) {
  //     setMenuIsOpen(true);
  //   } else {
  //     setMenuIsOpen(false);
  //   }
  //   dispatch(
  //     fetchEmployees({
  //       searchKey: "",
  //       pageSize: 20,
  //       pageNo: 1,
  //       fetchFixedOptions: true,
  //     })
  //   );
  // }, [adultsCount, dispatch, selectedTravelers.length]);

  useEffect(() => {
    const handleClickOutside2 = async (event) => {
      try {
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
          // dispatch(
          //   fetchEmployees({
          //     searchKey: "",
          //     pageSize: 20,
          //     pageNo: 1,
          //     fetchFixedOptions: true,
          //   })
          // );
        }
      } catch (error) {
        console.log("error occured:", error);
      }
    };

    document.addEventListener("mousedown", handleClickOutside2);
    return () => document.removeEventListener("mousedown", handleClickOutside2);
  }, [selectedTravelers, adultsCount, dispatch]);

  useEffect(() => {
    if (!menuIsOpen) {
      dispatch(
        fetchEmployees({
          searchKey: "",
          pageSize: 20,
          pageNo: 1,
          fetchFixedOptions: true,
        })
      );
    }
  }, [menuIsOpen, dispatch]);

  useEffect(() => {
    if (selectedTravelers.length > adultsCount) {
      const updatedTravelers = selectedTravelers.slice(0, adultsCount);
      dispatch(setSelectedTravelers(updatedTravelers));
      onTravelerChange(updatedTravelers);
      if (!programmaticAdjustmentRef.current) {
        showToast("info", `Traveler count adjusted to match number of adults.`);
      }
    }
  }, [adultsCount]);

  const handleSelectChange = (selectedOptions) => {
    if (maxAllowedTravelers === 1) {
      const selectedEmployeeId = selectedOptions?.[0]?.data?.employeeId;
      const loggedInEmployeeId =
        userDetails?.loggedInDetails?.userDetails?.employeeId;

      if (selectedEmployeeId !== loggedInEmployeeId) {
        showToast("info", "You can only select yourself as the traveler.");
        return;
      }
    }
    if (adultsCount > 0) {
      if (selectedOptions?.length > adultsCount) {

          showToast("error",`You can only select up to ${adultsCount} travelers.`);
    
        return;
      }

      // setSelectedTravelers(selectedOptions || []);
      dispatch(setSelectedTravelers(selectedOptions || []));
      onTravelerChange(selectedOptions || []);
      if ((selectedOptions || []).length === adultsCount) {
        setMenuIsOpen(false); // Close menu automatically
      } else {
        setMenuIsOpen(true); // Keep menu open
      }
    }
  };

  const handleInputChange = async (input) => {
    if (input.trim() === "") {
      // If input is empty, reset to initial options
      await dispatch(
        fetchEmployees({
          searchKey: "",
          pageSize: 20,
          pageNo: 1,
          shouldCache: false,
        })
      );
    }
  };

  const handleRemoveTraveler = (travelerToRemove) => {
    const updatedTravelers = selectedTravelers.filter(
      (t) => t.value !== travelerToRemove.value
    );
    dispatch(setSelectedTravelers(updatedTravelers));
    onTravelerChange(updatedTravelers);
    if (updatedTravelers.length === 0) {
      setShowTravelersList(false);
    }
  };

  const handleRemoveAllTravelers = () => {
    dispatch(setSelectedTravelers([]));
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
  }, [showConfirmDialog, showTravelersList]);

  return (
    <>
      <div ref={containerRef}>
        <AsyncSelect
          ref={selectRef}
          isMulti
          defaultOptions={initialOptions}
          cacheOptions
          loadOptions={fetchCorporateEmployees}
          value={selectedTravelers}
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
              cursor:
                maxAllowedTravelers === 1 && selectedTravelers.length === 1
                  ? "not-allowed"
                  : "pointer",
              pointerEvents:
                maxAllowedTravelers === 1 && selectedTravelers.length === 1
                  ? "none"
                  : "auto",
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
              cursor:
                maxAllowedTravelers === 1 && selectedTravelers.length === 1
                  ? "not-allowed"
                  : "pointer",
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
            if (maxAllowedTravelers > 1) {
              setMenuIsOpen(true);
            }
          }}
          isOptionDisabled={(option) => {
            if (maxAllowedTravelers === 1 && selectedTravelers.length === 1) {
              return true; // Disable all options when max is 1 and one is selected
            }
            return (
              selectedTravelers.length >= adultsCount &&
              !selectedTravelers.some(
                (selected) => selected.value === option.value
              )
            );
          }}
          onKeyDown={(e) => {
            // Prevent backspace when maxAllowedTravelers === 1 and a traveler is selected
            if (
              e.key === "Backspace" &&
              maxAllowedTravelers === 1 &&
              selectedTravelers.length === 1
            ) {
              e.preventDefault();
            }
          }}
          // onKeyDown={(e) => {
          //   if (!menuIsOpen) {
          //     setMenuIsOpen(true);
          //   }
          // }}
        />
      </div>

      {selectedTravelers.length > 0 && (
        <button
          onClick={() => {
            if (
              !(maxAllowedTravelers === 1 && selectedTravelers.length === 1)
            ) {
              setShowTravelersList(true);
            }
          }}
          className={`absolute right-3 top-1/2 -translate-y-1/2 ${
            maxAllowedTravelers === 1 && selectedTravelers.length === 1
              ? "cursor-not-allowed"
              : "cursor-pointer"
          }  text-[#155EEF] hover:text-[#01707d] transition-colors duration-200 rounded-full hover:bg-[#155EEF]/10`}
          title="View Travelers"
          disabled={maxAllowedTravelers === 1 && selectedTravelers.length === 1}
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
                      className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#155EEF]"
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
                        {/* <span className="px-2.5 py-1 rounded-full bg-gray-100 text-gray-600 text-sm font-medium">
                        {selectedTravelers.length}
                      </span> */}
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
                              <div className="h-10 w-10 rounded-full bg-[#155EEF]/10 flex items-center justify-center">
                                <span className="text-[#155EEF] font-medium text-lg">
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
                              {/* <span className="text-sm font-medium">Remove</span> */}
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
                        className="px-6 py-2.5 bg-[#155EEF] text-white font-medium rounded-lg hover:bg-[#01707d] transition-all duration-200 shadow-sm hover:shadow"
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
