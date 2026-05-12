import { useRef } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCaretDown, faCaretUp } from "@fortawesome/free-solid-svg-icons";
import { faCheckCircle, faCircle } from "@fortawesome/free-regular-svg-icons";

/**
 * Reusable dropdown component that displays multiple checkboxes.
 *
 * Props:
 *  - label: string
 *  - options: string[]
 *  - selectedValues: string[]
 *  - onChange: function(option: string) => void
 *  - dropdownOpen: boolean
 *  - setDropdownOpen: function(boolean)
 */
const CheckboxListDropdown = ({
  label,
  options,
  selectedValues,
  dropdownOpen,
  setDropdownOpen,
  onChange,
}) => {
  const dropdownRef = useRef(null);

  return (
    <div className="relative inline-block text-sm">
      {/* Dropdown Button */}
      <button
        className="px-4 py-2 border-1 rounded-full text-gray-700 bg-white border-[#028fa380] hover:bg-gray-100 flex items-center justify-between"
        onClick={() => setDropdownOpen(!dropdownOpen)}
      >
        <div className="flex items-center gap-2">
          <FontAwesomeIcon
            icon={dropdownOpen ? faCheckCircle : faCircle}
            className="text-[#028fa3]"
          />
          <span>{label}</span>
        </div>
        <FontAwesomeIcon
          icon={dropdownOpen ? faCaretUp : faCaretDown}
          className="ml-2"
        />
      </button>

      {/* Dropdown Menu */}
      {dropdownOpen && (
        <div
          ref={dropdownRef}
          className="absolute mt-2 w-full bg-white border border-gray-300 rounded-lg shadow-lg z-10"
          onClick={(e) => e.stopPropagation()} // Prevent event propagation
        >
          {options.map((option, index) => (
            <label
              key={index}
              className="flex items-center px-4 py-2 hover:bg-gray-100 cursor-pointer"
            >
              <input
                type="checkbox"
                className="form-checkbox h-4 w-4 text-blue-500 border-gray-300 rounded focus:ring-blue-400"
                checked={selectedValues.includes(option)}
                onChange={() => onChange(option)}
              />
              <span className="ml-2 text-gray-700">{option}</span>
            </label>
          ))}
        </div>
      )}
    </div>
  );
};

export default CheckboxListDropdown;
