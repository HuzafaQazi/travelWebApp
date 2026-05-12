import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/router";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faMagnifyingGlass,
  faXmark,
  faAngleDown,
  faTimes,
  faSliders,
  faXmarkCircle,
} from "@fortawesome/free-solid-svg-icons";
import axios from "@/utils/axios/axios";
import config from "@/config";
import { useSelector } from "react-redux";
import Dropdown from "./Dropdown";
import {
  transformRoles,
  transformLevels,
  transformBands,
  transformDesignations,
} from "@/utils/common";

const fetchAndSelectFilterByName = async (
  filterType,
  filterName, 
) => {
  let endpoint, dataKey, idKey, nameKey;

  switch (filterType) {
    case "role":
      endpoint = config.CORPORATE.ROLE_LIST;
      dataKey = "userRoles";
      idKey = "userRoleId";
      nameKey = "userRoleName";
      break;
    case "level":
      endpoint = config.CORPORATE.LEVEL_LIST;
      dataKey = "levels";
      idKey = "levelId";
      nameKey = "level";
      break;
    case "designation":
      endpoint = config.CORPORATE.DESIGNATION_LIST;
      dataKey = "designations";
      idKey = "designationId";
      nameKey = "designation";
      break;
    case "band":
      endpoint = config.CORPORATE.BAND_LIST;
      dataKey = "bands";
      idKey = "bandId";
      nameKey = "band";
      break;
    default:
      return null;
  }

  const payload = {
    searchKey: filterName,
    pageNo: 1,
    pageSize: 10,
  };

  try {
    const response = await axios.post(endpoint, payload);
    if (response.data?.status === "SUCCESS") {
      const data = response.data.data[dataKey] || [];
      const item = data.find((d) =>
        d[nameKey]?.toLowerCase().includes(filterName.toLowerCase())
      );
      if (item) {
        return { id: item[idKey], label: item[nameKey] };
      }
    }
  } catch (error) {
    console.error("Error fetching filter by name:", error);
  }
  return null;
};

const EmployeeFilters = ({
  employeeSearchQuery,
  handleEmployeeSearchChange,
  handleEmployeeClearSearch,
  handleEmployeeClearAll,
  selectedStatus,
  setSelectedStatus,
  selectedRole,
  setSelectedRole,
  selectedLevel,
  setSelectedLevel,
  selectedBand,
  setSelectedBand,
  selectedDesignation,
  setSelectedDesignation,
  generateFilterObjectForEmployee,
  selectedEmployeeFilterDepartments,
  fetchDataPerSection,
  activeTab,
  paginationData,
  setShouldFetch,
}) => {
  const router = useRouter();
  const userDetails = useSelector((state) => state?.user?.userInfo);


  const [statusOpen, setStatusOpen] = useState(false);

  const [roleInitialData, setRoleInitialData] = useState([]);
  const [levelInitialData, setLevelInitialData] = useState([]);
  const [bandInitialData, setBandInitialData] = useState([]);
  const [designationInitialData, setDesignationInitialData] = useState([]);
  const [mobileSheetOpen, setMobileSheetOpen] = useState(false);

  const toggleMobileSheet = () => setMobileSheetOpen(!mobileSheetOpen);

  const initialRender = useRef(true);

  useEffect(() => {
    const { role, level, band, designation, status } = router.query;

    if (status) setSelectedStatus(status);

    const applyFiltersFromQuery = async () => {
      // setShouldFetch(false);
      let newRoleId = selectedRole;
      let newLevelId = selectedLevel;
      let newBandId = selectedBand;
      let newDesignationId = selectedDesignation;

      if (role) {
        const roleItem = await fetchAndSelectFilterByName(
          "role",
          role,
        );
        if (roleItem) {
          newRoleId = roleItem.id;
          setRoleInitialData([{ value: roleItem.id, label: roleItem.label }]);
        }
      }
      if (level) {
        const levelItem = await fetchAndSelectFilterByName(
          "level",
          level,
        );
        if (levelItem) {
          newLevelId = levelItem.id;
          setLevelInitialData([
            { value: levelItem.id, label: levelItem.label },
          ]);
        }
      }
      if (band) {
        const bandItem = await fetchAndSelectFilterByName(
          "band",
          band,

        );
        if (bandItem) {
          newBandId = bandItem.id;
          setBandInitialData([{ value: bandItem.id, label: bandItem.label }]);
        }
      }
      if (designation) {
        const designationItem = await fetchAndSelectFilterByName(
          "designation",
          designation,
        );
        if (designationItem) {
          newDesignationId = designationItem.id;
          setDesignationInitialData([
            { value: designationItem.id, label: designationItem.label },
          ]);
        }
      }

      // Set states after fetching all IDs
      setSelectedRole(newRoleId);
      setSelectedLevel(newLevelId);
      setSelectedBand(newBandId);
      setSelectedDesignation(newDesignationId);

      // Once everything is set, trigger a fetch
      const filterObject = generateFilterObjectForEmployee(
        selectedEmployeeFilterDepartments
      );
      const additionalFilters = {
        status: selectedStatus,
        roleId: newRoleId,
        levelId: newLevelId,
        bandId: newBandId,
        designationId: newDesignationId,
      };

      await fetchDataPerSection(
        activeTab,
        employeeSearchQuery,
        [filterObject],
        additionalFilters,
        paginationData
      );

      // setShouldFetch(true);

      router.replace(router.pathname);
    };
    if (initialRender.current && Object.keys(router.query).length > 0) {
      initialRender.current = false;
      applyFiltersFromQuery();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router.query]);

  const handleDropdownChange = async (dropdownType, values) => {
    // Update state based on the dropdownType
    switch (dropdownType) {
      case "roleId":
        setSelectedRole(values);
        break;
      case "levelId":
        setSelectedLevel(values);
        break;
      case "bandId":
        setSelectedBand(values);
        break;
      case "designationId":
        setSelectedDesignation(values);
        break;
      case "status":
        const newStatus = values === selectedStatus ? null : values;
        setSelectedStatus(newStatus);
        break;
      default:
        break;
    }

    // Generate additional filters for the API
    const filterObject = generateFilterObjectForEmployee(
      selectedEmployeeFilterDepartments
    );

    const additionalFilters = {
      roleId: selectedRole,
      levelId: selectedLevel,
      bandId: selectedBand,
      designationId: selectedDesignation,
      status: selectedStatus,
      [dropdownType]: values, // Ensure the latest value is included
    };
    // Trigger the fetch API
    await fetchDataPerSection(
      activeTab,
      employeeSearchQuery,
      [filterObject],
      additionalFilters,
      paginationData
    );
  };

  useEffect(() => {
    const handleBodyScroll = () => {
      document.body.style.overflow = mobileSheetOpen ? "hidden" : "auto";
    };

    handleBodyScroll();
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [mobileSheetOpen]);

  return (
    <div className="flex gap-3 items-center justify-center flex-wrap sm:flex-nowrap">
      <div className="relative mt-2">
        <input
          type="text"
          className="h-14 w-64 sm:w-80 font-normal text-[14px] pl-5 pr-8 cursor-pointer rounded-lg z-0 shadow-[0px_4px_4px_0px_rgba(22,156,176,0.14)] focus:shadow focus:outline-none"
          placeholder="Search by employee ID or name"
          value={employeeSearchQuery}
          onChange={handleEmployeeSearchChange}
        />
        <div className="absolute top-1/2 right-2 transform -translate-y-1/2">
          {employeeSearchQuery.length === 0 ? (
            <FontAwesomeIcon
              icon={faMagnifyingGlass}
              className="text-gray-600"
            />
          ) : (
            <FontAwesomeIcon
              icon={faXmark}
              className="text-[#028fa3] cursor-pointer hover:text-blue-600 transition-colors duration-300 transform hover:scale-110"
              onClick={handleEmployeeClearSearch}
            />
          )}
        </div>
      </div>

      <div className="hidden sm:flex space-x-4">
        <div className="w-32 mt-2">
          <Dropdown
            selectedValue={selectedRole}
            onChange={(value) => handleDropdownChange("roleId", value)}
            placeholder="Role"
            endpoint={config.CORPORATE.ROLE_LIST}
            transformer={transformRoles}
            // companyId={companyId}
            initialData={roleInitialData}
            isMulti={true}
          />
        </div>

        <div className="w-32 mt-2">
          <Dropdown
            selectedValue={selectedLevel}
            onChange={(value) => handleDropdownChange("levelId", value)}
            placeholder="Level"
            endpoint={config.CORPORATE.LEVEL_LIST}
            transformer={transformLevels}
            // companyId={companyId}
            initialData={levelInitialData}
            isMulti={true}
          />
        </div>

        <div className="w-32 mt-2">
          <Dropdown
            selectedValue={selectedBand}
            onChange={(value) => handleDropdownChange("bandId", value)}
            placeholder="Band"
            endpoint={config.CORPORATE.BAND_LIST}
            transformer={transformBands}
           
            initialData={bandInitialData}
            isMulti={true}
          />
        </div>

        <div className="w-32 mt-2">
          <Dropdown
            selectedValue={selectedDesignation}
            onChange={(value) => handleDropdownChange("designationId", value)}
            placeholder="Designation"
            endpoint={config.CORPORATE.DESIGNATION_LIST}
            transformer={transformDesignations}

            initialData={designationInitialData}
            isMulti={true}
          />
        </div>

        <div className="relative w-32 mt-2">
          {statusOpen && (
            <div
              className="fixed inset-0 bg-gray-500 bg-opacity-50 z-40"
              onClick={() => setStatusOpen(false)}
            />
          )}
          <button
            className="inline-flex justify-center h-14 items-center  w-full rounded-md shadow-[0px_4px_4px_0px_rgba(22,156,176,0.14)] px-4 py-3 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none"
            onClick={() => setStatusOpen(!statusOpen)}
          >
            {selectedStatus || "Status"}
            <FontAwesomeIcon
              icon={faAngleDown}
              className="ml-2 text-gray-500"
            />
          </button>
          {statusOpen && (
            <div className="absolute right-0 mt-2 w-full rounded-lg z-50 shadow-lg bg-white">
              <button
                className={`block p-3 py-2 text-left w-full rounded-t-lg text-sm ${
                  selectedStatus === "Active"
                    ? "border-l-4 border-[#028fa3] text-[#028fa3]"
                    : "text-gray-700"
                } hover:bg-gray-100 focus:outline-none`}
                onClick={() => {
                  handleDropdownChange("status", "Active");
                  setStatusOpen(false);
                }}
              >
                Active
              </button>
              <button
                className={`block p-3 py-2 w-full text-left rounded-b-lg text-sm ${
                  selectedStatus === "Inactive"
                    ? "border-l-4 border-[#028fa3] text-[#028fa3]"
                    : "text-gray-700"
                } hover:bg-gray-100 focus:outline-none`}
                onClick={() => {
                  handleDropdownChange("status", "Inactive");
                  setStatusOpen(false);
                }}
              >
                Inactive
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="sm:hidden">
        {mobileSheetOpen && (
          <div
            className="fixed inset-0 z-50 bg-gray-800 bg-opacity-50"
            onClick={toggleMobileSheet}
          >
            <div
              className="absolute left-0 top-0 h-full w-3/5 bg-white shadow-lg p-4"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold">Filters</h2>
                <FontAwesomeIcon
                  icon={faXmarkCircle}
                  className="text-gray-500 cursor-pointer"
                  onClick={toggleMobileSheet}
                />
              </div>
              <div className="w-32 mt-2">
                <Dropdown
                  selectedValue={selectedRole}
                  onChange={(value) => handleDropdownChange("roleId", value)}
                  placeholder="Role"
                  endpoint={config.CORPORATE.ROLE_LIST}
                  transformer={transformRoles}
                  initialData={roleInitialData}
                />
              </div>

              <div className="w-32 mt-2">
                <Dropdown
                  selectedValue={selectedLevel}
                  onChange={(value) => handleDropdownChange("levelId", value)}
                  placeholder="Level"
                  endpoint={config.CORPORATE.LEVEL_LIST}
                  transformer={transformLevels}
                  initialData={levelInitialData}
                />
              </div>

              <div className="w-32 mt-2">
                <Dropdown
                  selectedValue={selectedBand}
                  onChange={(value) => handleDropdownChange("bandId", value)}
                  placeholder="Band"
                  endpoint={config.CORPORATE.BAND_LIST}
                  transformer={transformBands}

                  initialData={bandInitialData}
                />
              </div>

              <div className="w-32 mt-2">
                <Dropdown
                  selectedValue={selectedDesignation}
                  onChange={(value) =>
                    handleDropdownChange("designationId", value)
                  }
                  placeholder="Designation"
                  endpoint={config.CORPORATE.DESIGNATION_LIST}
                  transformer={transformDesignations}

                  initialData={designationInitialData}
                />
              </div>

              <div className="relative w-32 mt-2">
                {statusOpen && (
                  <div
                    className="fixed inset-0 bg-gray-500 bg-opacity-50 z-40"
                    onClick={() => setStatusOpen(false)}
                  />
                )}
                <button
                  className="inline-flex justify-center h-14 items-center  w-full rounded-md shadow-[0px_4px_4px_0px_rgba(22,156,176,0.14)] px-4 py-3 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none"
                  onClick={() => setStatusOpen(!statusOpen)}
                >
                  {selectedStatus || "Status"}
                  <FontAwesomeIcon
                    icon={faAngleDown}
                    className="ml-2 text-gray-500"
                  />
                </button>
                {statusOpen && (
                  <div className="absolute right-0 mt-2 w-full rounded-lg z-50 shadow-lg bg-white">
                    <button
                      className={`block p-3 py-2 text-left w-full rounded-t-lg text-sm ${
                        selectedStatus === "Active"
                          ? "border-l-4 border-[#028fa3] text-[#028fa3]"
                          : "text-gray-700"
                      } hover:bg-gray-100 focus:outline-none`}
                      onClick={() => {
                        handleDropdownChange("status", "Active");
                        setStatusOpen(false);
                      }}
                    >
                      Active
                    </button>
                    <button
                      className={`block p-3 py-2 w-full text-left rounded-b-lg text-sm ${
                        selectedStatus === "Inactive"
                          ? "border-l-4 border-[#028fa3] text-[#028fa3]"
                          : "text-gray-700"
                      } hover:bg-gray-100 focus:outline-none`}
                      onClick={() => {
                        handleDropdownChange("status", "Inactive");
                        setStatusOpen(false);
                      }}
                    >
                      Inactive
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="flex justify-between items-center w-full sm:w-fit">
        <button
          className="w-fit h-10 px-4 p-2 bg-white shadow-[0px_4px_4px_0px_rgba(22,156,176,0.14)] text-gray-500 rounded-md flex sm:hidden"
          onClick={toggleMobileSheet}
        >
          <FontAwesomeIcon icon={faSliders} className="w-4 h-4" />
        </button>
        <button
          disabled={
            !(
              employeeSearchQuery ||
              selectedStatus ||
              selectedRole ||
              selectedLevel ||
              selectedBand ||
              selectedDesignation
            )
          }
          className={`w-fit sm:w-full sm:w-auto text-center h-10 sm:h-14 p-2 px-4 text-sm bg-[#028fa3] text-white rounded-lg  sm:mt-2 focus:outline-none ${
            !(
              employeeSearchQuery ||
              selectedStatus ||
              selectedStatus ||
              selectedRole ||
              selectedLevel ||
              selectedBand ||
              selectedDesignation
            )
              ? "opacity-50 cursor-not-allowed"
              : ""
          }`}
          onClick={handleEmployeeClearAll}
        >
          Clear all
        </button>
      </div>
    </div>
  );
};

export default EmployeeFilters;
