import { useRef, useState } from "react";
import { useSelector } from "react-redux";
import Image from "next/image";
import companyLogo from "@/images/corporate/countryimg.png";
import style from "./List.module.css";
import {
  faMagnifyingGlass,
  faXmark,
  faTrashCan,
  faSpinner,
  faPenToSquare,
  faCircleDown,
  faChevronRight,
  faPlus,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Modal from "@/components/corporate/modal/Modal";
import AddDepartment from "@/components/corporate/Adding/AddDepartment";
import axios from "@/utils/axios/axios";
import config from "@/config";
import showToast from "@/utils/toast";

const Department = ({
  fetchDataPerSection,
  activeTab,
  isLoading,
  departmentData,
  redirectToEmployee,
  validator,
  downloadDataAsExcel,
  setParentData,
  isModalVisible,
  setModalVisible,
  setBulkModalVisible,
}) => {
  const userDetails = useSelector((state) => state?.user?.userInfo);

  const departmentInputRefs = useRef([]);

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [departmentSearchQuery, setDepartmentSearchQuery] = useState("");
  const [selectedDepartmentsForDelete, setSelectedDepartmentsForDelete] =
    useState([]);
  const [editingIndex, setEditingIndex] = useState(null);
  const [editedDepartment, setEditedDepartment] = useState("");

  const handleDepartmentSearchChange = (e) => {
    setDepartmentSearchQuery(e.target.value);
    fetchDataPerSection(activeTab, e.target.value);
  };

  const handleDepartmentSearchClick = () => {
    fetchDataPerSection(activeTab, departmentSearchQuery);
  };

  const handleDepartmentClearSearch = () => {
    setDepartmentSearchQuery("");
    fetchDataPerSection(activeTab, "");
  };

  const handleDepartmentInputChange = (e) => {
    e.stopPropagation();
    setEditedDepartment(e.target.value);
  };

  const handleShowDeleteModal = () => {
    setShowDeleteModal(true);
  };

  const handleCloseDeleteModal = () => {
    setShowDeleteModal(false);
  };

  const handleDepartmentEditClick = (e, index, currentName) => {
    e.stopPropagation();
    setEditingIndex(index);
    setEditedDepartment(currentName);

    setTimeout(() => {
      if (departmentInputRefs.current[index]) {
        departmentInputRefs.current[index].focus();
      }
    }, 0);
  };

  const handleDepartmentDelete = async () => {
    try {
      const response = await axios.post(
        `${config.CORPORATE.DEPARTMENT_DELETE}`,
        {
          _id: selectedDepartmentsForDelete,
          status: "inactive",
        }
      );
      if (response.data.status === "SUCCESS") {
        showToast("success", "Departments deleted successfully");
        setShowDeleteModal(false);
        setSelectedDepartmentsForDelete([]);
        fetchDataPerSection(activeTab, departmentSearchQuery);
      }
    } catch (error) {
      console.error("Error deleting departments:", error);
      setShowDeleteModal(false);
      showToast(
        "error",
        error?.response?.data?.message ||
          "something went wrong, please try again later"
      );
    }
  };

  const handleDepartmentCheckboxClick = (event, departmentId) => {
    event.stopPropagation();
    if (selectedDepartmentsForDelete.includes(departmentId)) {
      setSelectedDepartmentsForDelete(
        selectedDepartmentsForDelete.filter((id) => id !== departmentId)
      );
    } else {
      setSelectedDepartmentsForDelete([
        ...selectedDepartmentsForDelete,
        departmentId,
      ]);
    }
  };

  const handleDepartmentSaveClick = async (e, departmentId, index) => {
    e.stopPropagation();
    if (validator.allValid()) {
      const { loggedInDetails } = userDetails;
      const modifiedBy = `${loggedInDetails.userDetails._id}`;
      const payload = {
        id: departmentId,
        departmentName: editedDepartment,
        modifiedBy: modifiedBy,
        status: "Active",
      };
      try {
        const response = await axios.post(
          `${config.CORPORATE.DEPARTMENT_EDIT}`,
          payload
        );
        if (response.data.status === "SUCCESS") {
          // Update the departments array with the new name
          const updatedDepartments = [...departmentData.departments];
          // return;
          updatedDepartments[index] = {
            ...updatedDepartments[index],
            departmentName: editedDepartment,
          };

          // Update the state with the new departments array
          setParentData((prevState) => ({
            ...prevState,
            departments: updatedDepartments,
          }));

          // Reset editing state
          setEditingIndex(null);
          setEditedDepartment("");
          showToast("success", "Department updated successfully");
        }
      } catch (error) {
        console.error("Error updating department:", error);
        showToast(
          "error",
          error?.response?.data?.message ||
            "something went wrong, please try again later"
        );
      }
    } else {
      validator.showMessages();
      // Force a re-render to show validation messages
      setParentData({ ...departmentData });
    }
  };

  const handleDownloadDepartmentData = async (e, department) => {
    e.stopPropagation();
    const { companyId } = userDetails;
    const filterObject = {
      by: "DEPARTMENT",
      type: ["ASSIGNED"],
      values: [department.departmentId],
    };
    const payload = {
      // companyId,
      filter: [filterObject],
      searchKey: "",
    };

    await downloadDataAsExcel(payload, department?.departmentName);
  };

  const handleCancelDepartmentClick = (e) => {
    e.stopPropagation();
    setEditingIndex(null);
    setEditedDepartment("");
  };

  return (
    <>
      <div className="container h-fit flex justify-between items-center">
        <div className="relative">
          <input
            type="text"
            value={departmentSearchQuery}
            onChange={handleDepartmentSearchChange}
            className="h-14 w-64 font-normal text-sm pl-5 pr-5 cursor-pointer rounded-lg shadow-[0px_4px_4px_0px_rgba(22,156,176,0.14)] focus:shadow-xl focus:outline-none transition-shadow duration-300 ease-in-out"
            placeholder="Search by Department Name"
          />
          <div className="absolute top-4 right-4">
            {departmentSearchQuery.length === 0 && (
              <button
                onClick={handleDepartmentSearchClick}
                className="h-5 w-5 text-gray-600 rounded-lg hover:text-[#028fa3] transition-colors duration-300 transform hover:scale-110"
              >
                <FontAwesomeIcon icon={faMagnifyingGlass} />
              </button>
            )}
            {departmentSearchQuery.length > 0 && (
              <FontAwesomeIcon
                className="text-[#028fa3] cursor-pointer hover:text-blue-600 transition-colors duration-300 transform hover:scale-110"
                icon={faXmark}
                onClick={handleDepartmentClearSearch}
              />
            )}
          </div>
        </div>
        <button
          onClick={handleShowDeleteModal}
          disabled={selectedDepartmentsForDelete.length === 0}
          className={`relative text-[#028fa3] ${
            selectedDepartmentsForDelete.length === 0
              ? "opacity-50 cursor-not-allowed"
              : "hover:text-red-600 transition-colors duration-300 transform hover:scale-110"
          }`}
        >
          <FontAwesomeIcon icon={faTrashCan} />
        </button>
      </div>
      {isLoading ? (
        <div className="flex justify-center items-center h-60">
          <FontAwesomeIcon
            icon={faSpinner}
            className="text-[#028fa3] text-5xl animate-spin"
          />
        </div>
      ) : departmentData.count === 0 ? (
        <div className="p-5 w-11/12 justify-center m-auto">
          <div className="flex justify-between gap-10">
            <div className="m-2 p-2">
              <Image src={companyLogo} alt="logo" width={400} />
            </div>
            <div className="w-50 flex flex-col pt-4">
              <span>Create Departments Here!</span>
              <div className="flex gap-2">
                <button
                  className="bg-[#028fa3] text-white p-2 px-4 m-2 rounded text-sm flex items-center"
                  onClick={() => setModalVisible(true)}
                >
                  <FontAwesomeIcon
                    icon={faPlus}
                    className="border-[1px] border-dotted rounded-full p-1 mr-2"
                  />
                  Create Department
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
              <span className="font-normal text-[15px] block leading-tight my-2 pb-3 mb-3">
                Creating departments streamlines business organization and
                travel policy creation
              </span>
              <span className="font-normal text-[15px]">
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
                      htmlFor="mobile"
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
              </div>
            </div>
          </div>
        </div>
      ) : (
        <>
          {isLoading ? (
            <div className="flex justify-center items-center h-60">
              <FontAwesomeIcon
                icon={faSpinner}
                className="text-[#028fa3] text-5xl animate-spin"
              />
            </div>
          ) : (
            <div className={style.departmentContainer}>
              {departmentData?.departments?.length > 0
                ? departmentData.departments.map((department, index) => (
                    <div
                      key={index}
                      className="cursor-pointer  border-1 border-[#028FA330] p-2 mt-3 flex justify-between rounded-lg items-center gap-4 bg-gradient-to-r from-white to-[#f9f9f9] hover:bg-gradient-to-r hover:from-[#f9f9f9] hover:to-white transition-colors duration-300"
                      style={{
                        boxShadow: "4px 4px 4px 0px #169CB012",
                      }}
                      onClick={(e) => {
                        if (
                          e.target.type !== "checkbox" &&
                          e.target.type !== "text"
                        ) {
                          redirectToEmployee(department);
                        }
                      }}
                    >
                      <div className="p-2 flex items-center gap-4">
                        <div className="flex items-center">
                          <input
                            type="checkbox"
                            className="m-2 before:content[''] peer relative h-5 w-5 cursor-pointer appearance-none rounded-md border border-gray-300 transition-all before:absolute before:block before:h-12 before:w-12 before:-translate-y-2/4 before:-translate-x-2/4 before:rounded-full before:bg-blue-gray-500 before:opacity-0 before:transition-opacity checked:border-[#028fa3] checked:bg-[#028fa3]"
                            id={`check-${index}`}
                            checked={selectedDepartmentsForDelete.includes(
                              department._id
                            )}
                            onChange={(e) =>
                              handleDepartmentCheckboxClick(e, department._id)
                            }
                          />
                          <FontAwesomeIcon
                            icon={faPenToSquare}
                            className="w-4 h-4 ml-2"
                            onClick={(e) =>
                              handleDepartmentEditClick(
                                e,
                                index,
                                department.departmentName
                              )
                            }
                          />
                        </div>
                        <div className="flex items-center space-x-4">
                          {editingIndex === index ? (
                            <>
                              <input
                                type="text"
                                name="department"
                                value={editedDepartment}
                                onChange={handleDepartmentInputChange}
                                ref={(el) =>
                                  (departmentInputRefs.current[index] = el)
                                }
                                className="border-2 border-[#028fa3] text-lg text-[#028fa3] rounded-md p-2 focus:border-[#028fa3] focus:outline-none transition-all duration-300 ease-in-out"
                              />
                              <div className="text-red-500 text-xs mt-1">
                                {validator.message(
                                  "department",
                                  editedDepartment,
                                  "required|min:2|max:30"
                                )}
                              </div>
                            </>
                          ) : (
                            <span className="text-black font-semibold flex flex-col">
                              <span className="text-sm sm:text-lg">
                                {department.departmentName}
                              </span>
                              <span className="text-gray-500 text-xs sm:text-sm">
                                {department.employeeSize} Employees
                              </span>
                            </span>
                          )}
                          {editingIndex === index && (
                            <>
                              <button
                                className="bg-[#028fa3] text-white p-2 px-4 text-sm rounded-lg mt-2 hover:bg-[#026b80] transition-colors duration-300"
                                onClick={(e) =>
                                  handleDepartmentSaveClick(
                                    e,
                                    department._id,
                                    index
                                  )
                                }
                              >
                                Save
                              </button>
                              <button
                                className="bg-[#878786] text-white text-sm p-2 px-2 w-8 h-8 flex items-center justify-center rounded-full mt-1 hover:bg-[#6c6c6c] transition-colors duration-300"
                                onClick={handleCancelDepartmentClick}
                              >
                                <FontAwesomeIcon
                                  icon={faXmark}
                                  color="#ffffff"
                                />
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                      <div>
                        <button className="text-[#028fa3] hover:text-blue-600 transition-colors duration-300 transform hover:scale-110">
                          <FontAwesomeIcon
                            icon={faCircleDown}
                            className="ml-4"
                            onClick={(e) =>
                              handleDownloadDepartmentData(e, department)
                            }
                          />
                        </button>
                        <button className="text-[#028fa3] hover:text-blue-600 transition-colors duration-300 transform hover:scale-110">
                          <FontAwesomeIcon
                            icon={faChevronRight}
                            className="ml-4"
                          />
                        </button>
                      </div>
                    </div>
                  ))
                : departmentData?.departments?.length === 0 &&
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
                        We couldn’t find any departments matching your search
                        criteria. Please try again with different keywords or
                        check your filters.
                      </p>
                    </div>
                  )}
            </div>
          )}
        </>
      )}

      {isModalVisible && (
        <AddDepartment
          isVisible={isModalVisible}
          onClose={() => setModalVisible(false)}
          fetchList={fetchDataPerSection}
          searchKey={departmentSearchQuery}
        />
      )}

      {showDeleteModal && (
        <Modal
          title="Confirm Deletion"
          onClose={handleCloseDeleteModal}
          actions={
            <>
              <button
                className="bg-gray-500 text-white p-2 px-4 rounded-lg hover:bg-gray-700 transition-colors duration-300"
                onClick={handleCloseDeleteModal}
              >
                Cancel
              </button>
              <button
                className="bg-red-600 text-white p-2 px-4 rounded-lg hover:bg-red-800 transition-colors duration-300"
                onClick={handleDepartmentDelete}
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

export default Department;
