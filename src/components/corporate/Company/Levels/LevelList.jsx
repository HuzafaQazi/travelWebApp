import { useState } from "react";
import NoState from "../NoState";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPenToSquare,
  faTrashAlt,
  faMagnifyingGlass,
  faSpinner,
  faXmark,
  faCircleDown,
  faChevronRight,
} from "@fortawesome/free-solid-svg-icons";
import Modal from "@/components/corporate/modal/Modal";
import axios from "@/utils/axios/axios";
import config from "@/config";
import showToast from "@/utils/toast";
import style from "./LevelList.module.css";

const LevelList = ({
  fetchDataPerSection,
  activeTab,
  levelsData,
  isLoading,
  setModalVisible,
  setBulkModalVisible,
  openEditModal,
  redirectToEmployee,
  downloadDataAsExcel,
  companyId,
}) => {
  const [selectedLevels, setSelectedLevels] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const toggleSelection = (e, id) => {
    e.stopPropagation();
    setSelectedLevels((prev) =>
      prev.includes(id)
        ? prev.filter((selectedId) => selectedId !== id)
        : [...prev, id]
    );
  };

  const handleDelete = async () => {
    if (selectedLevels.length === 0) return;

    try {
      const payload = { ids: selectedLevels };
      const response = await axios.post(
        `${config.CORPORATE.LEVEL_DELETE}`,
        payload
      );
      if (response.data.status === "SUCCESS") {
        showToast("success", "Levels deleted successfully");
        setShowDeleteModal(false);
        setSelectedLevels([]);
        fetchDataPerSection(activeTab, searchQuery);
      }
    } catch (error) {
      console.error("Error deleting bands:", error);
      setShowDeleteModal(false);
      showToast(
        "error",
        error?.response?.data?.message ||
          "something went wrong, please try again later"
      );
    }
  };

  const handleSearchChange = async (e) => {
    setSearchQuery(e.target.value);
    await fetchDataPerSection(activeTab, e.target.value);
  };

  const clearSearch = async () => {
    setSearchQuery("");
    await fetchDataPerSection(activeTab, "");
  };

  const handleShowDeleteModal = () => {
    setShowDeleteModal(true);
  };

  const handleCloseDeleteModal = () => {
    setShowDeleteModal(false);
  };

  const handleViewEmployees = (e, levelName) => {
    const data = { name: levelName };
    redirectToEmployee(data, "level");
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
      levelId: data?.levelId,
    };

    await downloadDataAsExcel(payload, data?.level);
  };

  return (
    <>
      <div className="p-2 bg-white rounded-lg">
        {/* Search and Delete Controls */}
        {levelsData?.count > 0 && (
          <div className="flex items-center justify-between mb-4">
            {/* Search Input */}
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={handleSearchChange}
                className="h-14 w-64 font-normal text-sm pl-12 pr-5 rounded-lg shadow-[0px_4px_4px_0px_rgba(22,156,176,0.14)] focus:shadow-xl focus:outline-none transition-shadow duration-300 ease-in-out"
                placeholder="Search by Level name"
              />
              {searchQuery.length === 0 && (
                <button className="absolute top-4 right-4 h-5 w-5 text-gray-600 rounded-lg hover:text-[#028fa3] transition-colors duration-300 transform hover:scale-110">
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
                disabled={selectedLevels.length === 0}
                className={`relative text-[#028fa3] ${
                  selectedLevels.length === 0
                    ? "opacity-50 cursor-not-allowed"
                    : "hover:text-red-600 transition-colors duration-300 transform hover:scale-110"
                }`}
              >
                <FontAwesomeIcon icon={faTrashAlt} className="text-[#028FA3]" />
              </button>
            </div>
          </div>
        )}

        {/* Content */}
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <FontAwesomeIcon
              icon={faSpinner}
              className="text-[#028fa3] text-5xl animate-spin"
            />
          </div>
        ) : levelsData?.count === 0 ? (
          <NoState
            title="Create Levels Here!"
            description="Creating Levels streamlines business organization and travel policy creation"
            // additionalInfo="Fill out the form and request a call to integrate with HRMS."
            primaryButtonText="Create Level"
            secondaryButtonText="Bulk Upload"
            onPrimaryAction={() => setModalVisible(true)}
            onSecondaryAction={() => setBulkModalVisible(true)}
            // formFields={[
            //   {
            //     id: "firstName",
            //     name: "firstName",
            //     label: "First Name",
            //     required: true,
            //   },
            //   {
            //     id: "mobile",
            //     name: "mobile",
            //     label: "Mobile Number",
            //     required: true,
            //     type: "tel",
            //   },
            // ]}
            // formButtonText="Request a call"
            // onFormSubmit={null}
          />
        ) : (
          <div>
            <div className={style.levelContainer}>
              {levelsData?.levels?.length > 0 ? (
                levelsData?.levels?.map((level, index) => (
                  <div
                    key={index}
                    className="flex justify-between items-center border-1 cursor-pointer border-[#028FA330] rounded-lg p-3 mb-4 bg-gradient-to-r from-white to-[#f9f9f9] hover:bg-gradient-to-r hover:from-[#f9f9f9] hover:to-white transition-colors duration-300"
                    style={{ boxShadow: "0px 4px 4px 0px #169CB012" }}
                    onClick={(e) => {
                      if (
                        e.target.type !== "checkbox" &&
                        e.target.type !== "text"
                      ) {
                        handleViewEmployees(e, level?.level);
                      }
                    }}
                  >
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={selectedLevels.includes(level._id)}
                        onChange={(e) => toggleSelection(e, level._id)}
                        className="m-2 before:content[''] peer relative h-5 w-5 cursor-pointer appearance-none rounded-md border border-gray-300 transition-all before:absolute before:block before:h-12 before:w-12 before:-translate-y-2/4 before:-translate-x-2/4 before:rounded-full before:bg-blue-gray-500 before:opacity-0 before:transition-opacity checked:border-[#028fa3] checked:bg-[#028fa3]"
                      />
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          openEditModal(level);
                        }}
                      >
                        <FontAwesomeIcon
                          icon={faPenToSquare}
                          className="h-4 w-4 mb-[2px] mr-2"
                        />
                      </button>
                      <div className="flex flex-col">
                        <div className="font-semibold text-sm sm:text-lg text-[#171A19]">
                          {level?.level}
                        </div>
                        <div className="text-xs sm:text-sm font-medium text-[#878786]">
                          {level?.noOfEmployees} Employees
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-3 items-center">
                      <button
                        onClick={(e) => handleDownloadData(e, level)}
                        className="text-[#028fa3] hover:text-blue-600 transition-colors duration-300 transform hover:scale-110"
                      >
                        <FontAwesomeIcon icon={faCircleDown} />
                      </button>
                      <button className="text-[#028fa3] hover:text-blue-600 transition-colors duration-300 transform hover:scale-110">
                        <FontAwesomeIcon icon={faChevronRight} />
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="flex flex-col items-center justify-center h-60 mt-6 bg-white border border-[#e0e0e0] rounded-lg shadow-lg p-8">
                  <FontAwesomeIcon
                    icon={faXmark}
                    className="text-[#ff6b6b] text-5xl mb-4"
                  />
                  <p className="text-[#333] text-xl font-semibold mb-2">
                    No Data Found
                  </p>
                  <p className="text-gray-600 text-sm text-center">
                    We couldn’t find any levels matching your search criteria.
                    Please try again with different keywords or check your
                    filters.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

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
            Are you sure you want to delete this item? This action cannot be
            undone.
          </p>
        </Modal>
      )}
    </>
  );
};

export default LevelList;
