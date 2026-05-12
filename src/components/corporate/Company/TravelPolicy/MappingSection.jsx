import { useSelector } from "react-redux";
import TravelPolicyNameInput from "./TravelPolicyNameInput";
import Dropdown from "./Dropdown";
import {
  transformDepartments,
  transformRoles,
  transformLevels,
  transformBands,
  transformDesignations,
  transformEmployees,
} from "@/utils/common";
import config from "@/config";

const MappingSection = ({
  mappingData,
  formData,
  onFormUpdate,
  validator,
  isReadOnly,
  mappingDisplay = { type: "", items: [] },
  setMappingDisplay,
  isGlobalPolicy,
}) => {
  const userDetails = useSelector((state) => state?.user?.userInfo);
  const companyId = userDetails?.companyId;

  /**
   * Single method that updates formData so only the selected key
   * retains the new IDs, and all other keys are cleared (null).
   *
   * @param {string} dropdownKey - e.g. "department", "band", "level"
   * @param {string[]} newSelectedArray - array of selected IDs
   */
  const handleSelectionChange = (
    dropdownKey,
    newSelectedArray,
    newItems,
    isOverWrite
  ) => {
    // newSelectedArray: array of IDs (like ["dept1","dept2"])
    // newItems: array of objects with {id, name}, so we can display them

    // First, clear all possible keys in formData
    const updatedFormData = {
      ...formData,
      departmentId: null,
      designationId: null,
      levelId: null,
      employeeId: null,
      bandId: null,
      isOverWrite,
    };

    // Then set only the chosen key
    switch (dropdownKey) {
      case "department":
        updatedFormData.departmentId = newSelectedArray;
        break;
      case "designation":
        updatedFormData.designationId = newSelectedArray;
        break;
      case "level":
        updatedFormData.levelId = newSelectedArray;
        break;
      case "employee":
        updatedFormData.employeeId = newSelectedArray;
        break;
      case "band":
        updatedFormData.bandId = newSelectedArray;
        break;
      default:
        console.warn("Unhandled dropdownKey:", dropdownKey);
    }

    onFormUpdate(updatedFormData);

    setMappingDisplay({
      type: dropdownKey, // "department", "employee", etc.
      items: newItems, // e.g. [{id: "dept1", name: "Design Dept"}, ...]
    });
  };

  const isAnyDropdownSelected =
    (formData.departmentId && formData.departmentId.length > 0) ||
    (formData.designationId && formData.designationId.length > 0) ||
    (formData.levelId && formData.levelId.length > 0) ||
    (formData.employeeId && formData.employeeId.length > 0) ||
    (formData.bandId && formData.bandId.length > 0);

  const travelPolicyNameField = mappingData.subvalues.find(
    (item) => item.subvalue.toLowerCase().trim() === "edit the name"
  );

  const mappingDropdowns = mappingData.subvalues.find(
    (item) =>
      item.subvalue.toLowerCase().trim() ===
      "select the options to map against travel policies"
  );

  // const getHighlightClass = (dropdownKey) => {
  //   return mappingDisplay.type === dropdownKey ? "bg-[#028fa350]" : "";
  // };
  const getHighlightClass = (dropdownKey) => {
    // Check if items are selected and the current dropdown key matches the selected type
    if (
      mappingDisplay.type === dropdownKey &&
      mappingDisplay.items.length > 0
    ) {
      return "bg-[#028fa350]"; // Apply highlight if items are selected
    }
    return ""; // No highlight if no items are selected
  };

  return (
    <div className="p-3 border-b border-gray-300">
      {/* This field to edit policy name */}
      {travelPolicyNameField && (
        <TravelPolicyNameInput
          formData={formData}
          onFormUpdate={onFormUpdate}
          validator={validator}
          placeholder={travelPolicyNameField.placeHolder}
          isReadOnly={isReadOnly}
        />
      )}

      {mappingDropdowns && !isGlobalPolicy && (
        <>
          <div className="flex flex-col mt-3">
            <div className="text-xs sm:text-base font-normal text-[#000000]">
              {mappingDropdowns.subvalue}
            </div>
            <div className="text-xxs sm:text-xs font-normal text-[#4A4A4A]">
              {mappingDropdowns.description}
            </div>
          </div>

          <div className="flex flex-wrap gap-4 mt-3">
            {mappingDropdowns.data.includes("Department") && (
              <Dropdown
                label="Department"
                dropdownKey="department"
                selectedValues={formData.departmentId || []}
                onChange={(newSelectedIds, newSelectedObjects, isOverWrite) =>
                  handleSelectionChange(
                    "department",
                    newSelectedIds,
                    newSelectedObjects,
                    isOverWrite
                  )
                }
                endpoint={config.CORPORATE.DEPARTMENT_LIST}
                transformer={transformDepartments}
                // companyId={companyId}
                highlightClass={getHighlightClass("department")}
              />
            )}
            {mappingDropdowns.data.includes("Designation") && (
              <Dropdown
                label="Designation"
                dropdownKey="designation"
                selectedValues={formData.designationId || []}
                onChange={(newSelectedIds, newSelectedObjects, isOverWrite) =>
                  handleSelectionChange(
                    "designation",
                    newSelectedIds,
                    newSelectedObjects,
                    isOverWrite
                  )
                }
                endpoint={config.CORPORATE.DESIGNATION_LIST}
                transformer={transformDesignations}
                // companyId={companyId}
                highlightClass={getHighlightClass("designation")}
              />
            )}
            {mappingDropdowns.data.includes("Levels") && (
              <Dropdown
                label="Level"
                dropdownKey="level"
                selectedValues={formData.levelId || []}
                onChange={(newSelectedIds, newSelectedObjects, isOverWrite) =>
                  handleSelectionChange(
                    "level",
                    newSelectedIds,
                    newSelectedObjects,
                    isOverWrite
                  )
                }
                endpoint={config.CORPORATE.LEVEL_LIST}
                transformer={transformLevels}
                // companyId={companyId}
                highlightClass={getHighlightClass("level")}
              />
            )}
            {mappingDropdowns.data.includes("Bands") && (
              <Dropdown
                label="Band"
                dropdownKey="band"
                selectedValues={formData.bandId || []}
                onChange={(newSelectedIds, newSelectedObjects, isOverWrite) =>
                  handleSelectionChange(
                    "band",
                    newSelectedIds,
                    newSelectedObjects,
                    isOverWrite
                  )
                }
                endpoint={config.CORPORATE.BAND_LIST}
                transformer={transformBands}
                // companyId={companyId}
                highlightClass={getHighlightClass("band")}
              />
            )}
            {mappingDropdowns.data.includes("Employee") && (
              <Dropdown
                label="Employee"
                dropdownKey="employee"
                selectedValues={formData.employeeId || []}
                onChange={(newSelectedIds, newSelectedObjects, isOverWrite) =>
                  handleSelectionChange(
                    "employee",
                    newSelectedIds,
                    newSelectedObjects,
                    isOverWrite
                  )
                }
                endpoint={config.CORPORATE.EMPLOYEE_LIST}
                transformer={transformEmployees}
                // companyId={companyId}
                highlightClass={getHighlightClass("employee")}
              />
            )}
          </div>
        </>
      )}

      {mappingDisplay.type &&
        mappingDisplay.items.length > 0 &&
        !isGlobalPolicy && (
          <div className="mt-3 p-2 border border-gray-200 rounded-lg bg-gray-50">
            <h4 className="text-sm font-semibold capitalize">
              Selected {mappingDisplay.type}:
            </h4>
            <ul className="list-disc pl-5 text-xs mt-1">
              {mappingDisplay.items.map((obj) => (
                <li key={obj.id}>{obj.name}</li>
              ))}
            </ul>
          </div>
        )}

      <div className="text-red-500 text-xs mt-1">
        {mappingDropdowns &&
          !isGlobalPolicy &&
          validator.message(
            "dropdowns",
            isAnyDropdownSelected ? "valid" : "",
            "required",
            {
              messages: { required: "At least one dropdown must be selected." },
            }
          )}
      </div>
    </div>
  );
};

export default MappingSection;
