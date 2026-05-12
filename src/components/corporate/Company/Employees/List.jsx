import { useRef, useState, useEffect } from "react";
import { useSelector } from "react-redux";
import Image from "next/image";
import companyLogo from "@/images/corporate/countryimg.png";
import {
  faXmark,
  faTrashCan,
  faSpinner,
  faCircleDown,
  faPlus,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Modal from "@/components/corporate/modal/Modal";
import axios from "@/utils/axios/axios";
import config from "@/config";
import showToast from "@/utils/toast";
import DepartmentFilterBar from "./DepartmentFilterBar";
import EmployeeFilters from "./EmployeeFilters";
import EmployeeTable from "./EmployeeTable";
import EmployeeModals from "./EmployeeModals";

const EmployeeList = ({
  fetchDataPerSection,
  activeTab,
  isLoading,
  employeeData,
  departmentData,
  generateFilterObjectForEmployee,
  downloadDataAsExcel,
  selectedEmployeeFilterDepartments,
  setSelectedEmployeeFilterDepartments,
  shouldFetch,
  setShouldFetch,
  isEmpModalVisible,
  setEmpModalVisible,
  setBulkModalVisible,
  validator,
}) => {
  const userDetails = useSelector((state) => state?.user?.userInfo);

  const scrollRef = useRef(null);

  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10); // Default rows per page
  const [employeeSearchQuery, setEmployeeSearchQuery] = useState("");
  const [showDeleteModalEmployee, setShowDeleteModalEmployee] = useState(false);
  const [selectedEmployeesForDelete, setSelectedEmployeesForDelete] = useState(
    []
  );
  const [invalidInviteSelection, setInvalidInviteSelection] = useState(true);
  const [bulkReinviteLoading, setBulkReinviteLoading] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState(null);
  const [selectedRole, setSelectedRole] = useState([]);
  const [selectedLevel, setSelectedLevel] = useState([]);
  const [selectedBand, setSelectedBand] = useState([]);
  const [selectedDesignation, setSelectedDesignation] = useState([]);

  const [selectedRow, setSelectedRow] = useState(null);
  const [isSideSheetOpen, setIsSideSheetOpen] = useState(false);

  const employeeCount = employeeData?.paginationCount || 0;

  const totalPages = Math.ceil(employeeCount / rowsPerPage);
  const indexOfLastRow = currentPage * rowsPerPage;
  const indexOfFirstRow = indexOfLastRow - rowsPerPage;

  // Scroll to the selected department filter after the state update
  useEffect(() => {
    if (scrollRef.current && selectedEmployeeFilterDepartments.length > 0) {
      const selectedDepartment =
        selectedEmployeeFilterDepartments[
          selectedEmployeeFilterDepartments.length - 1
        ];
      const selectedDepartmentElement = scrollRef.current.querySelector(
        `[data-department-id="${selectedDepartment}"]`
      );

      if (selectedDepartmentElement) {
        const containerRect = scrollRef.current.getBoundingClientRect();
        const elementRect = selectedDepartmentElement.getBoundingClientRect();

        if (
          elementRect.left < containerRect.left ||
          elementRect.right > containerRect.right
        ) {
          const scrollLeft =
            selectedDepartmentElement.offsetLeft -
            (scrollRef.current.offsetWidth -
              selectedDepartmentElement.offsetWidth) /
              2;
          scrollRef.current.scrollLeft = scrollLeft;
        }
      }
    }
  }, [selectedEmployeeFilterDepartments]);

  useEffect(() => {
    if (shouldFetch) {
      const filterObject = generateFilterObjectForEmployee(
        selectedEmployeeFilterDepartments
      );
      const additionalFilters = { status: selectedStatus };
      const paginationData = { pageNo: currentPage, pageSize: rowsPerPage };
      fetchDataPerSection(
        activeTab,
        employeeSearchQuery,
        [filterObject],
        additionalFilters,
        paginationData
      );
    }
  }, [currentPage, rowsPerPage]);

  const handleShowDeleteModalEmployee = () => {
    setShowDeleteModalEmployee(true);
  };

  const handleCloseDeleteModalEmployee = () => {
    setShowDeleteModalEmployee(false);
  };

  const handleEmployeeDelete = async () => {
    try {
      const payload = selectedEmployeesForDelete.map((empId) => ({
        _id: empId,
        status: "Inactive",
      }));
      const response = await axios.post(
        `${config.CORPORATE.EMPLOYEE_DELETE}`,
        payload
      );
      if (response.data.status === "SUCCESS") {
        const filterObject = generateFilterObjectForEmployee(
          selectedEmployeeFilterDepartments
        );
        showToast("success", "Employee deleted successfully");
        setShowDeleteModalEmployee(false);
        setSelectedEmployeesForDelete([]);
        fetchDataPerSection(activeTab, employeeSearchQuery, [filterObject]);
      }
    } catch (error) {
      console.error("Error deleting departments:", error);
      setShowDeleteModalEmployee(false);
      showToast(
        "error",
        error?.response?.data?.message ||
          "something went wrong, please try again later"
      );
    }
  };

  const handleDownloadEmployeeData = async () => {
    const { companyId } = userDetails;
    const filterObject = generateFilterObjectForEmployee(
      selectedEmployeeFilterDepartments
    );

    const payload = {
      // companyId,
      filter: [filterObject],
      searchKey: employeeSearchQuery,
    };

    if (selectedStatus) {
      payload.status = selectedStatus;
    }
    if (selectedRole.length > 0) {
      payload.roleId = selectedRole;
    }
    if (selectedLevel.length > 0) {
      payload.levelId = selectedLevel;
    }
    if (selectedBand.length > 0) {
      payload.bandId = selectedBand;
    }
    if (selectedDesignation.length > 0) {
      payload.designationId = selectedDesignation;
    }

    await downloadDataAsExcel(payload, "employee_data");
  };

  const handleEmployeeSearchChange = (e) => {
    const updatedQuery = e.target.value;
    setEmployeeSearchQuery(updatedQuery);
    // Trigger data fetch with updated search key and filters
    const filterObject = generateFilterObjectForEmployee(
      selectedEmployeeFilterDepartments
    );
    const additionalFilters = {};
    const paginationData = { pageNo: currentPage, pageSize: rowsPerPage };
    fetchDataPerSection(
      activeTab,
      updatedQuery,
      [filterObject],
      additionalFilters,
      paginationData
    );
  };

  const handleEmployeeClearSearch = () => {
    setEmployeeSearchQuery("");
    const filterObject = generateFilterObjectForEmployee(
      selectedEmployeeFilterDepartments
    );
    const additionalFilters = {};
    const paginationData = { pageNo: currentPage, pageSize: rowsPerPage };
    fetchDataPerSection(
      activeTab,
      "",
      [filterObject],
      additionalFilters,
      paginationData
    );
  };

  const handleEmployeeDepartmentClickFilter = (departmentId) => {
    setSelectedEmployeeFilterDepartments((prev) => {
      let updatedFilters;
      if (departmentId === "ALL") {
        updatedFilters = prev.includes("ALL")
          ? prev.filter((id) => id !== "ALL")
          : ["ALL", ...prev];
      } else if (departmentId === "UNASSIGNED") {
        updatedFilters = prev.includes("UNASSIGNED")
          ? prev.filter((id) => id !== "UNASSIGNED")
          : [...prev, "UNASSIGNED"];
      } else {
        updatedFilters = prev.includes(departmentId)
          ? prev.filter((id) => id !== departmentId)
          : [...prev, departmentId];
      }

      // Generate filter object and call fetchDataPerSection
      const filterObject = generateFilterObjectForEmployee(updatedFilters);
      const additionalFilters = { status: selectedStatus };
      const paginationData = { pageNo: currentPage, pageSize: rowsPerPage };
      if (updatedFilters.length > 0) {
        fetchDataPerSection(
          activeTab,
          employeeSearchQuery,
          [filterObject],
          additionalFilters,
          paginationData
        );
      } else {
        fetchDataPerSection(
          activeTab,
          employeeSearchQuery,
          [],
          additionalFilters,
          paginationData
        );
      }
      // fetchDataPerSection(activeTab, employeeSearchQuery, [filterObject]);
      return updatedFilters;
    });
  };

  const handleEmployeeClearAll = () => {
    setEmployeeSearchQuery("");
    setSelectedStatus(null);
    setSelectedRole([]);
    setSelectedLevel([]);
    setSelectedBand([]);
    setSelectedDesignation([]);
    const filterObject = generateFilterObjectForEmployee(
      selectedEmployeeFilterDepartments
    );
    const additionalFilters = {};
    const paginationData = { pageNo: currentPage, pageSize: rowsPerPage };
    fetchDataPerSection(
      activeTab,
      "",
      [filterObject],
      additionalFilters,
      paginationData
    );
  };

  const handleEmployeeCheckboxClick = (
    event,
    employeeId = null,
    isSelectAll = false
  ) => {
    event.stopPropagation();

    const currentPageEmployees = employeeData.users.map((emp) => emp._id); // IDs on the current page
    let newSelectedEmployees = new Set(selectedEmployeesForDelete);

    if (isSelectAll) {
      // Handle "Select All" for the current page
      const allSelectedOnPage = currentPageEmployees.every((id) =>
        newSelectedEmployees.has(id)
      );

      if (allSelectedOnPage) {
        // If all are selected, deselect all on the current page
        currentPageEmployees.forEach((id) => newSelectedEmployees.delete(id));
      } else {
        // Otherwise, select all on the current page
        currentPageEmployees.forEach((id) => newSelectedEmployees.add(id));
      }
    } else {
      // Handle individual employee selection
      if (newSelectedEmployees.has(employeeId)) {
        newSelectedEmployees.delete(employeeId); // Deselect employee
      } else {
        newSelectedEmployees.add(employeeId); // Select employee
      }
    }

    setSelectedEmployeesForDelete([...newSelectedEmployees]); // Convert Set back to array

    // Check if any selected employees have 'Active' status
    const hasActiveEmployees = [...newSelectedEmployees].some((id) => {
      const employee = employeeData.users.find((emp) => emp._id === id);
      return employee?.status === "Active";
    });

    setInvalidInviteSelection(hasActiveEmployees);
  };

  const handleBulkReinvite = async () => {
    try {
      setBulkReinviteLoading(true);
      if (userDetails) {
        const { companyId } = userDetails;
        const payload = {
          employeeIds: selectedEmployeesForDelete,
          // companyId: companyId,
        };
        const response = await axios.post(
          `${config.CORPORATE.EMPLOYEE_REINVITE}`,
          payload
        );
        if (response?.data?.status === "SUCCESS") {
          showToast("success", "Re-invitations sent successfully.");
          setSelectedEmployeesForDelete([]);
          const filterObject = generateFilterObjectForEmployee(
            selectedEmployeeFilterDepartments
          );
          await fetchDataPerSection(activeTab, employeeSearchQuery, [
            filterObject,
          ]);
        } else {
          showToast("error", response?.data?.message || "Failed to re-invite.");
        }
      } else {
        showToast("error", "No user details found.");
      }
    } catch (error) {
      console.error("Error in bulk re-invite:", error);
      showToast("error", "An error occurred. Please try again.");
    } finally {
      setBulkReinviteLoading(false);
    }
  };

  const handleRowClick = async (selectedRow, index) => {
    setSelectedRow({ ...selectedRow, SelectedRowIndex: index });
    setIsSideSheetOpen(true);
  };

  return (
    <>
      {employeeData?.count === 0 ? (
        <div className="mt-4 p-5 w-4/6 justify-center m-auto">
          <div className="flex justify-between">
            <div className="m-2 p-2">
              <Image src={companyLogo} alt="logo" width={350} />
            </div>
            <div className="w-50 flex flex-col">
              <span>Add employees here!</span>
              <div className="flex gap-2">
                <button
                  className="bg-[#028fa3] text-white p-2 px-4 m-2 rounded text-sm flex items-center"
                  onClick={() => setEmpModalVisible(true)}
                >
                  <FontAwesomeIcon
                    icon={faPlus}
                    className="border-[1px] border-dotted rounded-full p-1 mr-2"
                  />
                  Invite Employees
                </button>
                <button
                  className="text-[#028fa3] border-[1px] border-solid border-[#028fa3] p-2 px-4 m-2 rounded text-sm flex items-center"
                  onClick={() => setBulkModalVisible(true)}
                >
                  <FontAwesomeIcon
                    icon={faPlus}
                    className="border-[1px] border-dotted border-[#028fa3] rounded-full p-1 mr-2"
                  />
                  Bulk Upload
                </button>
              </div>
              <span className="font-normal text-[15px] block border-b-2 border-gray-200 my-2 pb-2">
                This invitation will be sent on Mail, WhatsApp & Sms
              </span>
              {/* <span className="font-normal text-[15px]">
                Fill out the form and request a call to integrate with HRMS.
              </span>
              <div className="flex mt-2 justify-between">
                <div className="w-full">
                  <div className="relative w-full min-w-[50px] h-10">
                    <input
                      type="text"
                      id="firstName"
                      name="firstName"
                      className="block px-2.5 pb-2.5 pt-2.5 w-full text-sm text-gray-900 bg-transparent rounded-lg border-1 border-gray-300 appearance-none dark:text-black dark:border-gray-300 dark:focus:border-[#028fa3] focus:outline-none focus:ring-0 focus:border-[#028fa3]-600 peer"
                      placeholder=" "
                    />
                    <label
                      for="firstName"
                      className="absolute text-sm text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-white dark:bg-gray-900 px-2 peer-focus:px-2 peer-focus:text-[#028fa3] peer-focus:dark:text-[#028fa3] peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto start-1"
                    >
                      First Name
                      <span className="text-red-500 absolute  right-[-5px] m-1 mt-0">
                        *
                      </span>
                    </label>
                  </div>
                </div>
                <div className="w-full ml-5">
                  <div className="relative w-full min-w-[50px] h-10">
                    <input
                      type="tel"
                      id="mobile"
                      name="mobile"
                      className="block px-2.5 pb-2.5 pt-2.5 w-full text-sm text-gray-900 bg-transparent rounded-lg border-1 border-gray-300 appearance-none dark:text-black dark:border-gray-300 dark:focus:border-[#028fa3] focus:outline-none focus:ring-0 focus:border-[#028fa3]-600 peer"
                      placeholder=" "
                    />
                    <label
                      for="mobile"
                      className="absolute text-sm text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-white dark:bg-gray-900 px-2 peer-focus:px-2 peer-focus:text-[#028fa3] peer-focus:dark:text-[#028fa3] peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto start-1"
                    >
                      Mobile Number
                      <span className="text-red-500 absolute  right-[-5px] m-1 mt-0">
                        *
                      </span>
                    </label>
                  </div>
                </div>
              </div>
              <div className="h-fit flex justify-center mt-3">
                <button className="text-[#028fa3] text-[15px] p-2 px-4 font-medium border-[1px] border-solid rounded-xl border-[#028fa3]">
                  Request a call
                </button>
              </div> */}
            </div>
          </div>
        </div>
      ) : (
        <>
          <div className=" h-fit w-full flex justify-between items-center">
            <DepartmentFilterBar
              scrollRef={scrollRef}
              departmentData={departmentData}
              selectedEmployeeFilterDepartments={
                selectedEmployeeFilterDepartments
              }
              handleEmployeeDepartmentClickFilter={
                handleEmployeeDepartmentClickFilter
              }
            />
            <div className="flex gap-3 ml-0 sm:-ml-[100px]">
              <button
                disabled={
                  selectedEmployeesForDelete.length === 0 ||
                  invalidInviteSelection ||
                  bulkReinviteLoading
                }
                className={`p-2 border-[#028fa3] border-[1px] rounded-md px-3
        text-nowrap text-xxs sm:text-sm text-[#028fa3] ${
          (selectedEmployeesForDelete.length === 0 ||
            invalidInviteSelection ||
            bulkReinviteLoading) &&
          "opacity-50 cursor-not-allowed"
        }`}
                onClick={handleBulkReinvite}
                title={
                  invalidInviteSelection
                    ? "Invalid selection: Only employees with 'Inactive' status can be re-invited."
                    : ""
                }
              >
                Re-Invite
              </button>
              <button
                onClick={handleShowDeleteModalEmployee}
                disabled={selectedEmployeesForDelete.length === 0}
                className={`relative right-0 text-[#028fa3] ${
                  selectedEmployeesForDelete.length === 0
                    ? "opacity-50 cursor-not-allowed"
                    : "hover:text-red-600 transition-colors duration-300 transform hover:scale-110"
                }`}
              >
                <FontAwesomeIcon icon={faTrashCan} />
              </button>
            </div>
          </div>

          {/* search employees and filters  */}
          <div className="flex justify-between items-end sm:items-center">
            <EmployeeFilters
              employeeSearchQuery={employeeSearchQuery}
              handleEmployeeSearchChange={handleEmployeeSearchChange}
              handleEmployeeClearSearch={handleEmployeeClearSearch}
              handleEmployeeClearAll={handleEmployeeClearAll}
              selectedStatus={selectedStatus}
              setSelectedStatus={setSelectedStatus}
              selectedRole={selectedRole}
              setSelectedRole={setSelectedRole}
              selectedLevel={selectedLevel}
              setSelectedLevel={setSelectedLevel}
              selectedBand={selectedBand}
              setSelectedBand={setSelectedBand}
              selectedDesignation={selectedDesignation}
              setSelectedDesignation={setSelectedDesignation}
              generateFilterObjectForEmployee={generateFilterObjectForEmployee}
              selectedEmployeeFilterDepartments={
                selectedEmployeeFilterDepartments
              }
              fetchDataPerSection={fetchDataPerSection}
              activeTab={activeTab}
              paginationData={{
                pageNo: currentPage,
                pageSize: rowsPerPage,
              }}
              setShouldFetch={setShouldFetch}
            />
            <button
              className="flex justify-end"
              onClick={handleDownloadEmployeeData}
            >
              <FontAwesomeIcon
                icon={faCircleDown}
                className="text-[#028fa3] ml-4 mb-2 sm:mb-0"
              />
            </button>
          </div>
          {isLoading ? (
            <div className="flex justify-center items-center h-60">
              <FontAwesomeIcon
                icon={faSpinner}
                className="text-[#028fa3] text-5xl animate-spin"
              />
            </div>
          ) : (
            <>
              {employeeData?.users?.length > 0 ? (
                <EmployeeTable
                  employeeData={employeeData}
                  currentPage={currentPage}
                  rowsPerPage={rowsPerPage}
                  setRowsPerPage={setRowsPerPage}
                  employeeCount={employeeCount}
                  indexOfFirstRow={indexOfFirstRow}
                  indexOfLastRow={indexOfLastRow}
                  totalPages={totalPages}
                  setCurrentPage={setCurrentPage}
                  selectedEmployeesForDelete={selectedEmployeesForDelete}
                  handleEmployeeCheckboxClick={handleEmployeeCheckboxClick}
                  handleRowClick={handleRowClick}
                />
              ) : (
                employeeData?.users?.length === 0 &&
                !isLoading && (
                  <div className="flex flex-col items-center justify-center h-60 mt-6 bg-white border border-[#e0e0e0] rounded-lg shadow-lg p-8">
                    <FontAwesomeIcon
                      icon={faXmark}
                      className="text-[#ff6b6b] text-5xl mb-4"
                    />
                    <p className="text-[#333] text-xl font-semibold mb-2">
                      No Data Found
                    </p>
                    <p className="text-gray-600 text-sm text-center">
                      We couldn’t find any employees matching your search
                      criteria. Please try again with different keywords or
                      check your filters.
                    </p>
                  </div>
                )
              )}
            </>
          )}
        </>
      )}

      <EmployeeModals
        isEmpModalVisible={isEmpModalVisible}
        setEmpModalVisible={setEmpModalVisible}
        selectedRow={selectedRow}
        isSideSheetOpen={isSideSheetOpen}
        setIsSideSheetOpen={setIsSideSheetOpen}
        fetchDataPerSection={fetchDataPerSection}
        employeeSearchQuery={employeeSearchQuery}
        activeTab={activeTab}
        departmentData={departmentData}
        validator={validator}
        generateFilterObjectForEmployee={generateFilterObjectForEmployee}
        selectedEmployeeFilterDepartments={selectedEmployeeFilterDepartments}
        selectedStatus={selectedStatus}
        selectedRole={selectedRole}
        selectedLevel={selectedLevel}
        selectedBand={selectedBand}
        selectedDesignation={selectedDesignation}
        paginationData={{
          pageNo: currentPage,
          pageSize: rowsPerPage,
        }}
      />

      {showDeleteModalEmployee && (
        <Modal
          title="Confirm Deletion"
          onClose={handleCloseDeleteModalEmployee}
          actions={
            <>
              <button
                className="bg-gray-500 text-white p-2 px-4 rounded-lg hover:bg-gray-700 transition-colors duration-300"
                onClick={handleCloseDeleteModalEmployee}
              >
                Cancel
              </button>
              <button
                className="bg-red-600 text-white p-2 px-4 rounded-lg hover:bg-red-800 transition-colors duration-300"
                onClick={handleEmployeeDelete}
              >
                Delete
              </button>
            </>
          }
        >
          <p>
            Are you sure you want to delete this item? This action cannot be
            undone.
          </p>
        </Modal>
      )}
    </>
  );
};

export default EmployeeList;
