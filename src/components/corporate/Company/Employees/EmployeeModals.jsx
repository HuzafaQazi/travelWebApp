import React from "react";
import AddEmployee from "./Add";
import EditEmployee from "./Edit";

const EmployeeModals = ({
  isEmpModalVisible,
  setEmpModalVisible,
  selectedRow,
  isSideSheetOpen,
  setIsSideSheetOpen,
  fetchDataPerSection,
  employeeSearchQuery,
  activeTab,
  departmentData,
  validator,
  generateFilterObjectForEmployee,
  selectedEmployeeFilterDepartments,
  selectedStatus,
  selectedRole,
  selectedLevel,
  selectedBand,
  selectedDesignation,
  paginationData,
}) => {
  return (
    <>
      {isEmpModalVisible && (
        <AddEmployee
          isEmpVisible={isEmpModalVisible}
          onClose={() => setEmpModalVisible(false)}
          activeTab={activeTab}
          fetchList={fetchDataPerSection}
          searchKey={employeeSearchQuery}
          generateFilterObjectForEmployee={generateFilterObjectForEmployee}
          selectedEmployeeFilterDepartments={selectedEmployeeFilterDepartments}
          selectedStatus={selectedStatus}
          selectedRole={selectedRole}
          selectedLevel={selectedLevel}
          selectedBand={selectedBand}
          selectedDesignation={selectedDesignation}
          paginationData={paginationData}
        />
      )}
      {isSideSheetOpen && (
        <EditEmployee
          selectedRow={selectedRow}
          isOpen={isSideSheetOpen}
          setIsOpen={setIsSideSheetOpen}
          fetchDataPerSection={fetchDataPerSection}
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
          paginationData={paginationData}
        />
      )}
    </>
  );
};

export default EmployeeModals;
