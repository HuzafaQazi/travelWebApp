import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus } from "@fortawesome/free-solid-svg-icons";
import style from "./styles.module.css"

const RenderButtons = ({
  activeTab,
  handleOpenDepartment,
  handleOpenBulkDepartment,
  handleOpenEmpDepartment,
  handleOpenRoles,
  handleOpenLevels,
  handleOpenDesignation,
  handleOpenBands,
  handleOpenTravel,
  travelPolicyData,
  isTravelVisible,
}) => {
  if (activeTab === 1) {
    return (
      <div className="flex flex-row">
        <button
          className={`bg-[#028fa3] text-white ${style.companyMob} m-2 rounded text-xxs sm:text-sm flex items-center leading-[1.5]`}
          onClick={handleOpenDepartment}
        >
          <FontAwesomeIcon
            icon={faPlus}
            className="border-[1px] border-dotted rounded-full p-1 mr-1 sm:mr-2"
          />
          Create Department
        </button>
        <button
          className={`border-[1px] border-[#028fa3] text-[#028fa3] ${style.companyMob} m-2 rounded text-xxs sm:text-sm flex items-center leading-[1.5]`}
          onClick={handleOpenBulkDepartment}
        >
          <FontAwesomeIcon
            icon={faPlus}
            className="border-[1px] border-[#028fa3] border-dotted rounded-full p-1 mr-1 sm:mr-2"
          />
          Bulk Upload
        </button>
      </div>
    );
  }

  if (activeTab === 2) {
    return (
      <div className="flex flex-row">
        <button
          className={`bg-[#028fa3] text-white ${style.companyMob} m-2 rounded text-xxs sm:text-sm flex items-center leading-[1.5]`}
          onClick={handleOpenEmpDepartment}
        >
          <FontAwesomeIcon
            icon={faPlus}
            className="border border-dashed rounded-full p-1 mr-1 sm:mr-2"
          />
          Add Employee
        </button>
        <button
          className={`border border-[#028fa3] text-[#028fa3] ${style.companyMob} m-2 rounded text-xxs sm:text-sm flex items-center leading-[1.5]`}
          onClick={handleOpenBulkDepartment}
        >
          <FontAwesomeIcon
            icon={faPlus}
            className="border border-dashed rounded-full p-1 mr-1 sm:mr-2"
          />
          Bulk Upload
        </button>
      </div>
    );
  }

  if (activeTab === 3) {
    return (
      <div className="flex flex-row">
        <button
          className={`bg-[#028fa3] text-white ${style.companyMob} m-2 rounded text-xxs sm:text-sm flex items-center leading-[1.5] `}
          onClick={handleOpenRoles}
        >
          <FontAwesomeIcon
            icon={faPlus}
            className="border border-dashed rounded-full p-1 mr-1 sm:mr-2"
          />
          Create Role
        </button>
        <button
          className={`border-[1px] border-[#028fa3] text-[#028fa3] ${style.companyMob} m-2 rounded text-xxs sm:text-sm flex items-center leading-[1.5]`}
          onClick={handleOpenBulkDepartment}
        >
          <FontAwesomeIcon
            icon={faPlus}
            className="border-[1px] border-[#028fa3] border-dotted rounded-full p-1 mr-1 sm:mr-2"
          />
          Bulk Upload
        </button>
      </div>
    );
  }

  if (activeTab === 5) {
    return (
      <div className="flex flex-row">
        <button
          className={`bg-[#028fa3] text-white ${style.companyMob} m-2 rounded text-xxs sm:text-sm flex items-center leading-[1.5]`}
          onClick={handleOpenLevels}
        >
          <FontAwesomeIcon
            icon={faPlus}
            className="border border-dashed rounded-full p-1 mr-1 sm:mr-2"
          />
          Create Level
        </button>
        <button
          className={`border border-[#028fa3] text-[#028fa3] ${style.companyMob} m-2 rounded text-xxs sm:text-sm flex items-center leading-[1.5]`}
          onClick={handleOpenBulkDepartment}
        >
          <FontAwesomeIcon
            icon={faPlus}
            className="border border-dashed rounded-full p-1 mr-1 sm:mr-2"
          />
          Bulk Upload
        </button>
      </div>
    );
  }

  if (activeTab === 6) {
    return (
      <div className="flex flex-row">
        <button
          className={`bg-[#028fa3] text-white ${style.companyMob} m-2 rounded text-xxs sm:text-sm flex items-center leading-[1.5]`}
          onClick={handleOpenDesignation}
        >
          <FontAwesomeIcon
            icon={faPlus}
            className="border border-dashed rounded-full p-1 mr-1 sm:mr-2"
          />
          Create Designation
        </button>
        <button
          className={`border border-[#028fa3] text-[#028fa3] ${style.companyMob} m-2 rounded text-xxs sm:text-sm flex items-center leading-[1.5]`}
          onClick={handleOpenBulkDepartment}
        >
          <FontAwesomeIcon
            icon={faPlus}
            className="border border-dashed rounded-full p-1 mr-1 sm:mr-2"
          />
          Bulk Upload
        </button>
      </div>
    );
  }

  if (activeTab === 10) {
    return (
      <div className="flex flex-row">
        <button
          className={`bg-[#028fa3] text-white ${style.companyMob} m-2 rounded text-xxs sm:text-sm flex items-center leading-[1.5]`}
          onClick={handleOpenBands}
        >
          <FontAwesomeIcon
            icon={faPlus}
            className="border border-dashed rounded-full p-1 mr-1 sm:mr-2"
          />
          Create Band
        </button>
        <button
          className={`border border-[#028fa3] text-[#028fa3] ${style.companyMob} m-2 rounded text-xxs sm:text-sm flex items-center leading-[1.5]`}
          onClick={handleOpenBulkDepartment}
        >
          <FontAwesomeIcon
            icon={faPlus}
            className="border border-dashed rounded-full p-1 mr-1 sm:mr-2"
          />
          Bulk Upload
        </button>
      </div>
    );
  }

  if (activeTab === 7) {
    const isDisabled = travelPolicyData.count === 0 || isTravelVisible;
    return (
      <div className="flex flex-row">
        <button
          className={`bg-[#028fa3] text-white ${style.companyMob} m-2 rounded text-xs sm:text-lg flex items-center ${isDisabled ? "cursor-not-allowed opacity-50" : ""
            }`}
          onClick={isDisabled ? () => { } : handleOpenTravel}
          disabled={isDisabled}
        >
          <FontAwesomeIcon
            icon={faPlus}
            className="border-1 border-dashed rounded-full p-1 mr-1 sm:mr-2"
          />
          Add Travel Policy
        </button>
      </div>
    );
  }

  return null;
};

export default RenderButtons;
