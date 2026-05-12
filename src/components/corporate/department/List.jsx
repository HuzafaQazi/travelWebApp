import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPencil } from "@fortawesome/free-solid-svg-icons";

const DepartmentList = ({
  departments,
  handleDepartmentEditClick,
  handleDepartmentSaveClick,
}) => {
  const [editingIndex, setEditingIndex] = useState(null);
  const [departmentName, setDepartmentName] = useState("");

  const handleEditClick = (index, name) => {
    setEditingIndex(index);
    setDepartmentName(name);
    handleDepartmentEditClick(index, name);
  };

  const handleCancelClick = () => {
    setEditingIndex(null);
    setDepartmentName("");
  };

  return (
    <div>
      {departments.map((department, index) => (
        <div key={department._id} className="mb-2">
          {editingIndex !== index ? (
            <span className="text-black font-normal">
              {department.departmentName}
              <FontAwesomeIcon
                icon={faPencil}
                className="w-4 h-4 ml-2"
                onClick={() =>
                  handleEditClick(index, department.departmentName)
                }
              />
            </span>
          ) : (
            <div>
              <input
                type="text"
                value={departmentName}
                onChange={(e) => setDepartmentName(e.target.value)}
                className="border p-1"
              />
              <button
                className="bg-[#028fa3] text-white p-2 px-4 text-sm ml-2"
                onClick={() => handleDepartmentSaveClick(department._id, index)}
              >
                Save
              </button>
              <button
                className="bg-gray-500 text-white p-2 px-4 text-sm ml-2"
                onClick={handleCancelClick}
              >
                Cancel
              </button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default DepartmentList;
