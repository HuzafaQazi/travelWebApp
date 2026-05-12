import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPenToSquare } from "@fortawesome/free-solid-svg-icons";
import Pagination from "../Pagination";
import style from "./EmployeeTable.module.css";

const EmployeeTable = ({
  employeeData,
  currentPage,
  rowsPerPage,
  setRowsPerPage,
  employeeCount,
  indexOfFirstRow,
  indexOfLastRow,
  totalPages,
  setCurrentPage,
  selectedEmployeesForDelete,
  handleEmployeeCheckboxClick,
  handleRowClick,
}) => {
  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <div>
          <label
            htmlFor="rowsPerPage"
            className="mr-2 text-xs sm:text-sm text-[#028fa3] mt-4"
          >
            Rows per page:
          </label>
          <select
            id="rowsPerPage"
            value={rowsPerPage}
            onChange={(e) => setRowsPerPage(parseInt(e.target.value, 10))}
            className="border border-gray-300 rounded px-2 py-1 text-sm text-[#028fa3] cursor-pointer"
          >
            <option value={5}>5</option>
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={50}>50</option>
          </select>
        </div>
        <div className="text-xs text-right sm:text-sm text-[#028fa3] mt-4">
          Showing {indexOfFirstRow + 1} to{" "}
          {Math.min(indexOfLastRow, employeeCount)} of {employeeCount} entries
        </div>
      </div>
      <div className={style.tableContainer}>
        <table className={style.customTable}>
          <thead>
            <tr>
              <th>
                <input
                  type="checkbox"
                  className="mr-2 mt-3 h-5 w-5 cursor-pointer appearance-none rounded-md border border-gray-300 checked:border-[#028fa3] checked:bg-[#028fa3]"
                  checked={
                    employeeData.users.length > 0 &&
                    employeeData.users.every((emp) =>
                      selectedEmployeesForDelete.includes(emp._id)
                    )
                  }
                  onChange={(event) =>
                    handleEmployeeCheckboxClick(event, null, true)
                  }
                />
              </th>
              <th>Name</th>
              <th>Employee Id</th>
              <th>Department</th>
              <th>Role</th>
              <th>Level</th>
              <th>Band</th>
              <th>Designation</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Approver Name</th>
              <th>Address</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {employeeData?.users?.map((row, index) => (
              <tr key={index}>
                <td className={style.checkboxColumn}>
                  <input
                    type="checkbox"
                    className="mr-2 mt-3 h-5 w-5 cursor-pointer appearance-none rounded-md border border-gray-300 checked:border-[#028fa3] checked:bg-[#028fa3]"
                    id={`check-${index}`}
                    checked={selectedEmployeesForDelete.includes(row._id)}
                    onChange={(e) => handleEmployeeCheckboxClick(e, row._id)}
                  />
                  <FontAwesomeIcon
                    icon={faPenToSquare}
                    onClick={() => handleRowClick(row, index)}
                    className="mb-1 cursor-pointer"
                  />
                </td>
                <td className="flex flex-col px-2 py-3">
                  {`${row.firstName} ${row.lastName}`}
                  {row.status === "Inactive" ? (
                    <span className="text-xs bg-[#FF9C40] px-3 font-medium text-white w-fit rounded-md">
                      Invited
                    </span>
                  ) : (
                    <span className="invisible text-xs bg-[#FF9C40] px-3 font-medium text-white w-fit rounded-md">
                      Placeholder
                    </span>
                  )}
                </td>
                <td className="px-2 py-2">{row?.employeeId}</td>
                <td className="px-2 py-2">{row?.departmentName}</td>
                <td className="px-2 py-2">{row?.roleDetails?.userRoleName}</td>
                <td className="px-2 py-2">{row?.levelDetails?.level}</td>
                <td className="px-2 py-2">{row?.bandDetails?.band}</td>
                <td className="px-2 py-2">
                  {row?.designationDetails?.designation}
                </td>
                <td className="px-2 py-2">{row?.workEmail}</td>
                <td className="px-2 py-2">{row?.mobile}</td>
                <td className="relative px-2 py-2">
                  {row.approverUserDetails &&
                    row.approverUserDetails.length > 0 && (
                      <>
                        <span className="font-medium">
                          {row.approverUserDetails[0].firstName}{" "}
                          {row.approverUserDetails[0].lastName}
                        </span>
                        {row.approverUserDetails.length > 1 && (
                          <span className=" ml-2 font-bold cursor-pointer group">
                            +{row.approverUserDetails.length - 1}
                            <div className="absolute left-0 mt-1 w-fit bg-white border z-30 border-gray-300 shadow-lg text-black p-2 hidden group-hover:block">
                              {row.approverUserDetails
                                .slice(1)
                                .map((approver, idx) => (
                                  <div key={idx} className="py-1">
                                    {approver.firstName} {approver.lastName}
                                  </div>
                                ))}
                            </div>
                          </span>
                        )}
                      </>
                    )}
                </td>
                <td className="px-2 py-2">{row.address}</td>
                <td className="px-2 py-2">
                  {row.status.charAt(0).toUpperCase() + row.status.slice(1)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
        rowsPerPage={rowsPerPage}
      />
    </div>
  );
};

export default EmployeeTable;
