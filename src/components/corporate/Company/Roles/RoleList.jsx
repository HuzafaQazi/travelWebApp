import style from "./RoleList.module.css";
import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faMagnifyingGlass,
  faTrashAlt,
  faXmark,
  faChevronRight,
  faCircleDown,
  faPenToSquare,
  faSpinner,
} from "@fortawesome/free-solid-svg-icons";
import Modal from "@/components/corporate/modal/Modal";
import NoState from "../NoState";
import axios from "@/utils/axios/axios";
import config from "@/config";
import showToast from "@/utils/toast";

const RoleList = ({
  roles,
  refreshRoles,
  openEditModal,
  activeTab,
  isLoading,
  setModalVisible,
  setBulkModalVisible,
  setActiveTab,
  setShouldFetch,
  redirectToEmployee,
  downloadDataAsExcel,
  companyId,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRoles, setSelectedRoles] = useState([]);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const handleSearchChange = async (e) => {
    setSearchQuery(e.target.value);
    await refreshRoles(activeTab, e.target.value);
  };

  const clearSearch = async () => {
    setSearchQuery("");
    await refreshRoles(activeTab, "");
  };

  const toggleSelection = (e, roleId) => {
    e.stopPropagation();
    setSelectedRoles((prev) =>
      prev.includes(roleId)
        ? prev.filter((selectedId) => selectedId !== roleId)
        : [...prev, roleId]
    );
  };

  const handleDelete = async () => {
    if (selectedRoles.length === 0) return;

    try {
      const payload = { ids: selectedRoles };
      const response = await axios.post(
        `${config.CORPORATE.ROLE_DELETE}`,
        payload
      );
      if (response.data.status === "SUCCESS") {
        showToast("success", "Roles deleted successfully!");
        setShowDeleteModal(false);
        setSelectedRoles([]);
        refreshRoles(activeTab, searchQuery);
      }
    } catch (error) {
      console.error("Error deleting roles:", error);
      setShowDeleteModal(false);
      showToast(
        "error",
        error?.response?.data?.message ||
          "something went wrong, please try again later"
      );
    }
  };

  const handleShowDeleteModal = () => {
    setShowDeleteModal(true);
  };

  const handleCloseDeleteModal = () => {
    setShowDeleteModal(false);
  };

  const handleViewEmployees = (e, roleName) => {
    const data = { name: roleName };
    redirectToEmployee(data, "role");
  };

  const handleDownloadData = async (e, data) => {
    e.stopPropagation();
    const filterObject = {
      by: "DEPARTMENT",
      type: [],
      values: [],
    };
    const payload = {
      // companyId,
      filter: [filterObject],
      searchKey: "",
      roleId: data?.userRoleId,
    };

    await downloadDataAsExcel(payload, data?.userRoleName);
  };

  return (
    <div>
      {/* Search and Delete Controls */}
      {roles?.count > 0 && (
        <div className="flex items-center justify-between mb-4 mx-3">
          {/* Search Input */}
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={handleSearchChange}
              className="h-14 w-64 font-normal text-sm pl-5 pr-6 rounded-lg shadow-[0px_4px_4px_0px_rgba(22,156,176,0.14)] focus:shadow-xl focus:outline-none transition-shadow duration-300 ease-in-out"
              placeholder="Search by Role name"
            />
            {searchQuery.length === 0 && (
              <button className="absolute top-4 right-2 h-5 w-5 text-gray-600 rounded-lg hover:text-[#028fa3] transition-colors duration-300 transform hover:scale-110">
                <FontAwesomeIcon
                  icon={faMagnifyingGlass}
                  className="text-[#878786]"
                />
              </button>
            )}
            {searchQuery && (
              <button
                onClick={clearSearch}
                className="absolute top-4 right-8 h-5 w-5 text-gray-600 rounded-lg hover:text-[#028fa3] transition-colors duration-300 transform hover:scale-110"
              >
                <FontAwesomeIcon
                  icon={faXmark}
                  className="text-[#028fa3] cursor-pointer hover:text-blue-600 transition-colors duration-300 transform hover:scale-110"
                />
              </button>
            )}
          </div>
          {/* Delete Button */}
          <div className="ml-4 flex space-x-2">
            <button
              onClick={handleShowDeleteModal}
              disabled={selectedRoles.length === 0}
              className={`relative text-[#028fa3] ${
                selectedRoles.length === 0
                  ? "opacity-50 cursor-not-allowed"
                  : "hover:text-red-600 transition-colors duration-300 transform hover:scale-110"
              }`}
            >
              <FontAwesomeIcon icon={faTrashAlt} className="text-[#028FA3]" />
            </button>
          </div>
        </div>
      )}
      {/* Loading State */}
      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <FontAwesomeIcon
            icon={faSpinner}
            className="text-[#028fa3] text-5xl animate-spin"
          />
        </div>
      ) : roles?.count === 0 ? (
        <NoState
          title="Create Roles Here!"
          description="Creating Roles streamlines business organization and travel policy creation"
          // additionalInfo="Fill out the form and request a call to integrate with HRMS."
          primaryButtonText="Create Role"
          secondaryButtonText="Bulk Upload"
          onPrimaryAction={() => setModalVisible(true)}
          onSecondaryAction={() => setBulkModalVisible(true)}
        />
      ) : (
        <div className={style.roleContainer}>
          {roles?.userRoles?.length > 0
            ? roles?.userRoles?.map((role, index) => (
                <div
                  key={index}
                  className="flex justify-between items-center border-1 cursor-pointer border-[#028FA330] rounded-lg p-3 mb-4 bg-gradient-to-r from-white to-[#f9f9f9] hover:bg-gradient-to-r hover:from-[#f9f9f9] hover:to-white transition-colors duration-300"
                  style={{ boxShadow: "0px 4px 4px 0px #169CB012" }}
                  onClick={(e) => {
                    // Handle redirect only if the target is not a checkbox
                    if (
                      e.target.type !== "checkbox" &&
                      e.target.type !== "text"
                    ) {
                      handleViewEmployees(e, role.userRoleName);
                    }
                  }}
                >
                  <div className={style.eligibitysubcontainer}>
                    <div className={style.eligibility}>
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={selectedRoles.includes(role._id)}
                          onChange={(e) => toggleSelection(e, role._id)}
                          className="m-2 before:content[''] peer relative h-5 w-5 cursor-pointer appearance-none rounded-md border border-gray-300 transition-all before:absolute before:block before:h-12 before:w-12 before:-translate-y-2/4 before:-translate-x-2/4 before:rounded-full before:bg-blue-gray-500 before:opacity-0 before:transition-opacity checked:border-[#028fa3] checked:bg-[#028fa3]"
                        />
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            openEditModal(role);
                          }}
                        >
                          <FontAwesomeIcon
                            icon={faPenToSquare}
                            className="h-4 w-4 mb-[2px] mr-2"
                          />
                        </button>
                        <div className="flex flex-col">
                          <div className={style.eligibilitytext}>
                            {role.userRoleName}
                          </div>
                          <div className={style.eligibilitysubtext}>
                            Allow {role.userRoleName} Access Controls
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="ml-4 flex space-x-2 items-center">
                    <div className="flex gap-3 items-center">
                      <button
                        onClick={(e) => handleDownloadData(e, role)}
                        className="text-[#028fa3] hover:text-blue-600 transition-colors duration-300 transform hover:scale-110"
                      >
                        <FontAwesomeIcon icon={faCircleDown} />
                      </button>
                      <button className="text-[#028fa3] hover:text-blue-600 transition-colors duration-300 transform hover:scale-110">
                        <FontAwesomeIcon icon={faChevronRight} />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            : roles?.userRoles?.length === 0 && (
                <div className="flex flex-col items-center justify-center h-60 mt-6 bg-white border border-[#e0e0e0] rounded-lg shadow-lg p-8">
                  <FontAwesomeIcon
                    icon={faXmark}
                    className="text-[#ff6b6b] text-5xl mb-4"
                  />
                  <p className="text-[#333] text-xl font-semibold mb-2">
                    No Data Found
                  </p>
                  <p className="text-gray-600 text-sm text-center">
                    We couldn’t find any roles matching your search criteria.
                    Please try again with different keywords or check your
                    filters.
                  </p>
                </div>
              )}
        </div>
      )}
      {/* Delete Confirmation Modal */}
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
                onClick={handleDelete}
              >
                Delete
              </button>
            </>
          }
        >
          <p>
            Are you sure you want to delete the selected roles? This action
            cannot be undone.
          </p>
        </Modal>
      )}
    </div>
  );
};

export default RoleList;
