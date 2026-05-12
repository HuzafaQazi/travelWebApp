import { useState, useEffect, useRef, useCallback } from "react";
import { components } from "react-select";
import AsyncSelect from "react-select/async";
import { useSelector, useDispatch } from "react-redux";
import {
  fetchEmployees,
  initializeLoggedInUser,
  setSelectedTravelers,
  setDefaultSelectionDone,
  setAdultsCount,
  setAdultsCountHotel,
  setHasFetchedOnHome,
} from "@/store/slices/travellersSlice";
import { toast } from "react-toastify";
import showToast from "@/utils/toast";
import { Eye, X, Trash2, AlertCircle, InfoIcon } from "lucide-react";
import ReactDOM from "react-dom";
import { useRouter } from "next/router";
import { TRAVEL_CATEGORIES } from "@/utils/constants";
import axios from "@/utils/axios/axios";
import config from "@/config";

const CustomControl = ({ children, ...props }) => {
  const [showTooltip, setShowTooltip] = useState(false);

  return (
    <div
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
      className="relative"
    >
      <components.Control {...props}>{children}</components.Control>

      {/* Enhanced Tooltip */}
      {props.selectProps.isSelfBooking && (
        <div
          className={`
            absolute z-50 -bottom-12 left-1/2 sm:left-[90%] -translate-x-1/2 w-max 
            transition-all duration-200 ease-in-out transform
            ${
              showTooltip
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-1 pointer-events-none"
            }
          `}
        >
          <div className="relative bg-gray-800 text-white text-sm px-4 py-2 rounded-lg shadow-lg">
            <div
              className="absolute -top-2 left-1/2 -translate-x-1/2 w-0 h-0 
                          border-[6px] border-transparent border-b-gray-800"
            ></div>
            <div className="flex items-center space-x-2">
              <InfoIcon size={14} className="text-gray-300" />
              <span className="whitespace-nowrap font-medium">
                Self-booking mode: Only you can be selected
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

/**
 * CustomValueContainer:
 * - Renders the selected traveler name(s).
 * - If multiple travelers are selected, show "Name +X" format.
 */
const CustomValueContainer = (props) => {
  const { children, getValue, selectProps, showFullList } = props;
  const selectedTravelers = getValue();
  const inputValue = selectProps.inputValue;
  const isNotAllowed = selectProps.maxAllowedTravelers;

  let displayValue = "";
  let countDisplay = "";

  const cursorStyle = isNotAllowed ? "cursor-not-allowed" : "cursor-pointer";

  // e.g. "John"
  if (selectedTravelers.length === 1) {
    displayValue = selectedTravelers[0].label;
  }
  // e.g. "John +3"
  else if (selectedTravelers.length > 1) {
    displayValue = selectedTravelers[0].label;
    countDisplay = ` +${selectedTravelers.length - 1}`;
  }

  return (
    <components.ValueContainer {...props}>
      {/* If no travelers and no input, show placeholder */}
      {selectedTravelers.length === 0 && !inputValue ? (
        <span className="absolute left-0 top-1/2 transform -translate-y-1/2 text-gray-500">
          {selectProps.placeholder}
        </span>
      ) : (
        <>
          <span
            className={`overflow-hidden text-ellipsis whitespace-nowrap max-w-[70%] text-[#000000] font-medium ${cursorStyle}`}
          >
            {displayValue}
          </span>
          <span
            className={`text-[#028fa3] font-medium ml-[1px] ${cursorStyle}`}
          >
            {countDisplay}
          </span>
        </>
      )}
      {/* The actual children from react-select (hidden or shown depending on showFullList). */}
      {showFullList && children}
      {!showFullList && children[1]}
    </components.ValueContainer>
  );
};

/**
 * CustomOption:
 * - Custom rendering for the dropdown items.
 * - Disables the "X" remove icon if only 1 traveler is allowed AND 1 is already selected.
 */
const CustomOption = (props) => {
  const { data, innerRef, innerProps, isSelected, isDisabled } = props;

  // If only 1 traveler is allowed, and we already have 1 selected => prevent remove
  const isRemoveDisabled =
    props.selectProps.maxAllowedTravelers === 1 &&
    props.selectProps.value.length >= 1;

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
      <span>{data.label}</span>
      {/** If selected, show an inline "✖" remove icon. Disable if only 1 is allowed. */}
      {isSelected && !isDisabled && !isRemoveDisabled && (
        <span
          onClick={(e) => {
            e.stopPropagation();
            const filteredVals = props.selectProps.value.filter(
              (item) => item.value !== data.value
            );
            props.selectProps.onChange(filteredVals);
          }}
          className="text-red-500 cursor-pointer ml-2 hover:text-red-700"
        >
          ✖
        </span>
      )}
    </div>
  );
};

/**
 * SelectTravellers:
 * - Main component to select travelers from a corporate employees list (async).
 * - Manages traveler state from Redux (with per-category logic).
 * - If "maxAllowedTravelers=1", restrict user to self only.
 */
const SelectTravellers = ({
  adultsCount,
  onTravelerChange,
  initialSelectedTravelers = [],
  backgroundColor,
  isHomePage,
  modalRef,
  travelCategory = "2", // e.g. "2" for flights, "1" for hotels
  maxAllowedTravelers = 9,
}) => {
  const dispatch = useDispatch();
  const router = useRouter();

  // Redux states
  const {
    loggedInTraveler,
    selectedTravelers,
    travelersByCategory,
    initialOptions,
    defaultSelectionDone,
    hasFetchedOnHome,
    adultsCountHotel,
    adultsCount: adultsCountFlight,
    status,
    error,
  } = useSelector((state) => state.travellers);

  const userDetails = useSelector((state) => state?.user?.userInfo);

  // Local states
  const [menuIsOpen, setMenuIsOpen] = useState(false);

  const [showTravelersList, setShowTravelersList] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  const [travelersOptions, setTravelersOptions] = useState([]);
  const [travelerLoading, setTravelerLoading] = useState(false);

  const [isListPage, setIsListPage] = useState(false);

  // Refs for handling clicks outside
  const containerRef = useRef(null);
  const selectRef = useRef(null);
  const container2Ref = useRef(null);

  // Flags to prevent repeated runs or auto-changes
  const didRunRef = useRef(false);
  const programmaticAdjustmentRef = useRef(false);
  const initialHomePageRender = useRef(true);

  const handleDropdownOpen = useCallback(async () => {
    try {
      if (!menuIsOpen) {
        setTravelerLoading(true);
        setMenuIsOpen(true);
        const payload = {
          // companyId: userDetails?.companyId,
          filter: [],
          searchKey: "",
          pageSize: 20,
          pageNo: 1,
        };
        const response = await axios.post(
          `${config.CORPORATE.EMPLOYEE_LIST}`,
          payload
        );
        if (response?.data?.status === "SUCCESS") {
          const data = response?.data?.data?.users?.map((traveler) => ({
            value: traveler._id,
            label: `${traveler.firstName || ""} ${traveler.lastName || ""}`,
            data: traveler,
          }));
          setTravelersOptions(data);
        }
        setTravelerLoading(false);
      }
    } catch (error) {
      console.error(`Error fetching employee dropdown:`, error);
    }
  }, [menuIsOpen, userDetails?.companyId]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const isListPage =
        window.location.pathname ===
        "/corporate/auth/booking/hotels/hotelListing";
      setIsListPage(isListPage);
    }
  }, []);

  /**
   * 1) On mount, fetch employees (initial 20).
   */
  useEffect(() => {
    dispatch(fetchEmployees({}));
  }, [dispatch]);

  /**
   * closeTravelersListIfClickedOutside:
   * - Closes the list of travelers if user clicks outside the `modalRef` or `container2Ref`.
   */
  useEffect(() => {
    const closeTravelersListIfClickedOutside = (event) => {
      const isContainerDefined = container2Ref.current !== undefined;
      const isModalDefined = modalRef && modalRef.current !== undefined;

      if (
        isContainerDefined &&
        !container2Ref?.current?.contains(event.target) &&
        isModalDefined &&
        !modalRef?.current?.contains(event.target)
      ) {
        setShowTravelersList(false);
      }
    };

    document.addEventListener("mousedown", closeTravelersListIfClickedOutside);
    return () => {
      document.removeEventListener(
        "mousedown",
        closeTravelersListIfClickedOutside
      );
    };
  }, [modalRef]);

  /**
   * 6) Close or keep open the menu based on how many are selected vs. adultsCount.
   */
  useEffect(() => {
    const handleClickOutside2 = (event) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target)
      ) {
        if (
          travelersByCategory[travelCategory].length > 0 &&
          travelersByCategory[travelCategory].length < adultsCount
        ) {
          // setMenuIsOpen(true);
          if (!menuIsOpen) {
            handleDropdownOpen();
          }
        } else {
          setMenuIsOpen(false);
        }
      }
    };

    document.addEventListener("mousedown", handleClickOutside2);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside2);
    };
  }, [
    travelersByCategory,
    travelCategory,
    adultsCount,
    menuIsOpen,
    handleDropdownOpen,
  ]);

  useEffect(() => {
    if (maxAllowedTravelers === 1) {
      // For flights:
      if (travelCategory === TRAVEL_CATEGORIES.FLIGHTS) {
        if (adultsCountFlight !== 1) {
          dispatch(setAdultsCount(1));
          showToast("error", "Self-booking enabled. Traveler count set to 1.");
        }
      }
      // For hotels:
      else if (travelCategory === TRAVEL_CATEGORIES.HOTELS) {
        if (adultsCountHotel[0] !== 1) {
          dispatch(setAdultsCountHotel([1]));
          showToast("error", "Self-booking enabled. Traveler count set to 1.");
        }
      }

      // Trim to the first traveler (if more than 1 selected)
      if (travelersByCategory[travelCategory].length > 1) {
        const singleTraveler = [travelersByCategory[travelCategory][0]];
        dispatch(
          setSelectedTravelers({
            travelers: singleTraveler,
            category: travelCategory,
          })
        );
        onTravelerChange(singleTraveler);
      }
    }
  }, [
    maxAllowedTravelers,
    travelCategory,
    travelersByCategory,
    adultsCountFlight,
    adultsCountHotel,
    dispatch,
    onTravelerChange,
  ]);

  /**
   * 3) Initialize travelers on mount:
   *   - If we already set default travelers => skip.
   *   - Otherwise, if "initialSelectedTravelers" is provided => use them.
   *   - Otherwise, if no one is selected for this category => try to set the loggedInUser.
   */
  useEffect(() => {
    if (didRunRef.current) return;
    didRunRef.current = true;

    const doInitialization = async () => {
      if (defaultSelectionDone) return;

      programmaticAdjustmentRef.current = true;
      // If we have an initial array from the parent
      if (initialSelectedTravelers && initialSelectedTravelers.length > 0) {
        dispatch(
          setSelectedTravelers({
            travelers: initialSelectedTravelers,
            category: travelCategory,
          })
        );
        onTravelerChange(initialSelectedTravelers);
        dispatch(setDefaultSelectionDone(true));
        return;
      }

      // If none is selected in this category
      if (travelersByCategory[travelCategory].length === 0) {
        try {
          // If no loggedIn traveler yet, fetch
          if (!loggedInTraveler) {
            await dispatch(initializeLoggedInUser());
          }

          // Then store the loggedIn user as default
          if (loggedInTraveler) {
            dispatch(
              setSelectedTravelers({
                travelers: [loggedInTraveler],
                category: travelCategory,
              })
            );
            onTravelerChange([loggedInTraveler]);
            dispatch(setDefaultSelectionDone(true));
          }
        } catch (error) {
          console.error("Error initializing logged-in user:", error);
        } finally {
          programmaticAdjustmentRef.current = false;
        }
      }
    };

    doInitialization();
  }, [
    defaultSelectionDone,
    dispatch,
    initialSelectedTravelers,
    selectedTravelers,
    onTravelerChange,
    travelCategory,
    loggedInTraveler,
    travelersByCategory,
  ]);

  /**
   * 4) If it's the home page => fetch user specifically for home scenario once.
   */

  useEffect(() => {
    const fetchForHomePageIfNeeded = async () => {
      try {
        if (!isHomePage) return;
        if (hasFetchedOnHome) return;

        programmaticAdjustmentRef.current = true;
        dispatch(setAdultsCount(1));
        dispatch(setAdultsCountHotel([1]));

        // Force a non-cached fetch
        const user = await dispatch(
          initializeLoggedInUser({ shouldCache: false })
        ).unwrap();

        if (user) {
          dispatch(
            setSelectedTravelers({
              travelers: [user],
              resetUserForAll: true,
            })
          );
          onTravelerChange([user]);
          dispatch(setDefaultSelectionDone(true));
          dispatch(setHasFetchedOnHome(true));
        }

        programmaticAdjustmentRef.current = false;
      } catch (error) {
        console.error("Error fetching homepage data:", error);
      }
    };

    if (isHomePage && initialHomePageRender.current) {
      initialHomePageRender.current = false;
      fetchForHomePageIfNeeded();
    }
  }, [isHomePage, dispatch, onTravelerChange, hasFetchedOnHome]);

  /**
   * 5) Listen for route changes -> reset "hasFetchedOnHome" so we re-fetch next time.
   */
  useEffect(() => {
    let currentPath = router.asPath;
    const handleRouteChange = (nextPath) => {
      if (currentPath === nextPath) return;
      currentPath = nextPath;
      dispatch(setHasFetchedOnHome(false));
    };

    router.events.on("routeChangeStart", handleRouteChange);
    return () => {
      router.events.off("routeChangeStart", handleRouteChange);
    };
  }, [dispatch, router]);

  /**
   * 8) If user tries to select more travelers than "adultsCount", trim them.
   */
  useEffect(() => {
    if (travelersByCategory[travelCategory].length > adultsCount) {
      const updatedTravelers = travelersByCategory[travelCategory].slice(
        0,
        adultsCount
      );
      dispatch(
        setSelectedTravelers({
          travelers: updatedTravelers,
          category: travelCategory,
        })
      );
      onTravelerChange(updatedTravelers);
      if (!programmaticAdjustmentRef.current) {
        showToast("info", `Traveler count adjusted to match number of adults.`);
      }
    }
  }, [
    adultsCount,
    dispatch,
    travelersByCategory,
    onTravelerChange,
    travelCategory,
  ]);

  /**
   * 7) Once menu is closed, re-fetch the employees with default filter
   */
  // useEffect(() => {
  //   if (!menuIsOpen) {
  //     dispatch(
  //       fetchEmployees({
  //         searchKey: "",
  //         pageSize: 20,
  //         pageNo: 1,
  //         fetchFixedOptions: true,
  //       })
  //     );
  //   }
  // }, [menuIsOpen, dispatch]);

  /**
   * If a modal (RemoveAll / ShowTravellers) is open => disable body scroll
   */
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

  /**
   * 2) Function to load employees asynchronously.
   */
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

  /**
   * handleSelectChange:
   * - Called when user selects or deselects travelers from the dropdown.
   */
  const handleSelectChange = (selectedOptions) => {
    // If only 1 traveler allowed, it must be the loggedIn user
    if (maxAllowedTravelers === 1) {
      const chosenEmployeeId = selectedOptions?.[0]?.data?.employeeId;
      const loggedEmployeeId =
        userDetails?.loggedInDetails?.userDetails?.employeeId;

      if (chosenEmployeeId !== loggedEmployeeId) {
        showToast("info", "You can only select yourself as the traveler.");
        return;
      }
    }

    if (adultsCount > 0) {
      // If user tries to pick more than "adultsCount"
      if (selectedOptions?.length > adultsCount) {
   
          showToast("info",`You can only select up to ${adultsCount} travelers.`);
   
        return;
      }

      // Otherwise commit to Redux
      dispatch(
        setSelectedTravelers({
          travelers: selectedOptions || [],
          category: travelCategory,
        })
      );
      onTravelerChange(selectedOptions || []);

      // If we now match the count, automatically close
      if ((selectedOptions || []).length === adultsCount) {
        setMenuIsOpen(false);
      } else {
        setMenuIsOpen(true);
      }
    }
  };

  /**
   * handleInputChange:
   * - If user clears the search text, re-fetch with empty search.
   */
  const handleInputChange = async (input) => {
    if (input.trim() === "") {
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

  /**
   * handleRemoveTraveler:
   * - Remove a single traveler from the selection
   */
  const handleRemoveTraveler = (travelerToRemove) => {
    const updated = travelersByCategory[travelCategory].filter(
      (t) => t.value !== travelerToRemove.value
    );
    dispatch(
      setSelectedTravelers({
        travelers: updated,
        category: travelCategory,
      })
    );
    onTravelerChange(updated);

    if (updated.length === 0) {
      setShowTravelersList(false);
    }
  };

  /**
   * handleRemoveAllTravelers:
   * - Remove all travelers
   */
  const handleRemoveAllTravelers = () => {
    dispatch(
      setSelectedTravelers({
        travelers: [],
        category: travelCategory,
      })
    );
    onTravelerChange([]);
    setShowConfirmDialog(false);
    setShowTravelersList(false);
    showToast("error","All travelers have been removed");
  };

  /**
   * toggleMenu: open or close the dropdown menu
   */
  const toggleMenu = (forceOpen) => {
    if (typeof forceOpen === "boolean") {
      setMenuIsOpen(forceOpen);
    } else {
      setMenuIsOpen((prev) => !prev);
    }
  };

  // ---- JSX Return ----

  return (
    <>
      {/* MAIN SELECT WRAPPER */}
      <div ref={containerRef}>
        <AsyncSelect
          ref={selectRef}
          isMulti
          // defaultOptions={initialOptions}
          defaultOptions={travelersOptions}
          cacheOptions
          loadOptions={fetchCorporateEmployees}
          value={travelersByCategory[travelCategory]}
          onChange={handleSelectChange}
          // onInputChange={handleInputChange}
          blurInputOnSelect={false}
          placeholder="Travelers"
          className={`react-select-container ${
            maxAllowedTravelers === 1 &&
            travelersByCategory[travelCategory].length >= 1 &&
            "cursor-not-allowed"
          }`}
          classNamePrefix="react-select"
          menuIsOpen={menuIsOpen}
          // onMenuOpen={() => {
          //   // if (maxAllowedTravelers > 1) {
          //   setMenuIsOpen(true);
          //   // }
          // }}
          onMenuOpen={handleDropdownOpen}
          isLoading={travelerLoading}
          // If only one traveler is allowed & already 1 selected => disable the entire UI
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
                  : //  "0.5rem 1rem 0.5rem 2rem":
                  isListPage
                  ? "1.2rem 1rem 1.2rem 2rem"
                  : "0.5rem 1rem 0.5rem 2rem",
              cursor:
                maxAllowedTravelers === 1 &&
                travelersByCategory[travelCategory].length >= 1
                  ? "not-allowed"
                  : "pointer",
              pointerEvents:
                maxAllowedTravelers === 1 &&
                travelersByCategory[travelCategory].length >= 1
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
              margin: 0,
              padding: 0,
            }),
            valueContainer: (provided) => ({
              ...provided,
              padding: 0,
              display: "flex",
              flexWrap: "nowrap",
              overflowX: "auto",
              whiteSpace: "nowrap",
              maxWidth: "100%",
              cursor:
                maxAllowedTravelers === 1 &&
                travelersByCategory[travelCategory].length >= 1
                  ? "not-allowed"
                  : "pointer",
              scrollbarWidth: "none",
              // "-ms-overflow-style": "none",
              // "&::-webkit-scrollbar": {
              //   display: "none",
              // },
            }),
            menu: (provided) => ({
              ...provided,
              maxHeight: "300px",
              overflowY: "auto",
              scrollbarWidth: "none",
              // "-ms-overflow-style": "none",
              // "::-webkit-scrollbar": {
              //   display: "none",
              // },
            }),
            menuList: (provided) => ({
              ...provided,
              padding: 0,
              overflowY: "auto",
              height: "100%",
              // "::-webkit-scrollbar": {
              //   width: "5px",
              // },
              // "::-webkit-scrollbar-track": {
              //   backgroundColor: "#f0f0f0",
              // },
              // "::-webkit-scrollbar-thumb": {
              //   backgroundColor: "#171A1930",
              //   borderRadius: "4px",
              // },
              // "::-webkit-scrollbar-thumb:hover": {
              //   backgroundColor: "#01707d",
              // },
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
            Control: CustomControl,
            ValueContainer: CustomValueContainer,
            Option: CustomOption,
            DropdownIndicator: () => null,
            IndicatorSeparator: () => null,
            ClearIndicator: () => null,
          }}
          maxAllowedTravelers={
            maxAllowedTravelers === 1 &&
            travelersByCategory[travelCategory].length >= 1
          }
          isSelfBooking={maxAllowedTravelers === 1}
          isOptionDisabled={(option) => {
            // If only 1 traveler is allowed and we have 1 -> block further selection
            if (
              maxAllowedTravelers === 1 &&
              travelersByCategory[travelCategory].length >= 1
            ) {
              return true;
            }
            // Also, if we've reached "adultsCount" -> block further picks
            return (
              travelersByCategory[travelCategory].length >= adultsCount &&
              !travelersByCategory[travelCategory].some(
                (selected) => selected.value === option.value
              )
            );
          }}
          onKeyDown={(e) => {
            // Prevent backspace if only 1 traveler is allowed and 1 selected
            if (
              e.key === "Backspace" &&
              maxAllowedTravelers === 1 &&
              travelersByCategory[travelCategory].length >= 1
            ) {
              e.preventDefault();
            }
          }}
        />
      </div>

      {/* EYE ICON: shows "View travelers" if any selected */}
      {travelersByCategory[travelCategory].length > 0 && (
        <button
          onClick={() => {
            // If 1 traveler forced => do not allow opening
            if (
              maxAllowedTravelers === 1 &&
              travelersByCategory[travelCategory].length >= 1
            ) {
              // Possibly show a toast or do nothing
              return;
            }
            setShowTravelersList(true);
          }}
          className={`absolute right-3 top-1/2 -translate-y-1/2 ${
            maxAllowedTravelers === 1 &&
            travelersByCategory[travelCategory].length >= 1
              ? "cursor-not-allowed"
              : "cursor-pointer"
          } text-[#028fa3] hover:text-[#01707d] transition-colors duration-200 rounded-full hover:bg-[#028fa3]/10`}
          title="View Travelers"
          disabled={
            maxAllowedTravelers === 1 &&
            travelersByCategory[travelCategory].length >= 1
          }
        >
          <Eye size={20} />
        </button>
      )}

      {/* DIALOG: Confirm remove ALL travelers */}
      {showConfirmDialog &&
        ReactDOM.createPortal(
          <div className="fixed inset-0 z-[60] flex items-center justify-center">
            <div
              className="absolute inset-0 bg-black/50"
              onClick={() => setShowConfirmDialog(false)}
            />
            <div className="relative bg-white rounded-lg shadow-xl p-6 w-full max-w-md m-4 transform transition-all">
              <div className="flex items-start gap-4">
                <AlertCircle className="h-6 w-6 text-red-500" />
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
                  className="hover:bg-gray-100 rounded-full transition-colors duration-200"
                >
                  <X size={18} className="text-gray-500" />
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}

      {/* MODAL: Show selected travelers in a scrollable list */}
      <div ref={container2Ref}>
        {showTravelersList &&
          ReactDOM.createPortal(
            <div ref={modalRef} className="fixed inset-0 z-[999999999]">
              <div className="absolute inset-0 bg-black/50 transition-opacity duration-300" />
              <div className="fixed inset-0 flex items-start justify-center p-4 cursor-pointer">
                <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl transform transition-all duration-300 scale-100 mt-15 p-6">
                  <div className="flex justify-between items-center mb-4">
                    <div className="flex items-center gap-4">
                      <h2 className="text-2xl font-semibold text-gray-800">
                        Selected Travelers (
                        {travelersByCategory[travelCategory].length})
                      </h2>
                    </div>

                    <div className="flex items-center gap-2">
                      {travelersByCategory[travelCategory].length > 0 && (
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

                  {/* The list of travelers */}
                  <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-2">
                    {travelersByCategory[travelCategory].length > 0 ? (
                      travelersByCategory[travelCategory].map((traveler) => (
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
                      className="px-6 py-2.5 bg-[#028fa3] text-white font-medium rounded-lg hover:bg-[#01707d] transition-all duration-200 shadow-sm hover:shadow"
                    >
                      Close
                    </button>
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
