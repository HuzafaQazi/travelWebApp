import { useEffect, useState, useRef } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronDown } from "@fortawesome/free-solid-svg-icons";
import style from "./styles.module.css";

const TabNavigation = ({ activeTab, setActiveTab }) => {
  const dropdownRef = useRef(null);

  const [dropdownVisible, setDropdownVisible] = useState(false);
  const [selectedItem, setSelectedItem] = useState("Roles");
  const [dropdownTab, setDropdownTab] = useState(3);

  const handleClickOutside = (event) => {
    if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
      setDropdownVisible(false);
    }
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleDropdownSelect = (value) => {
    setSelectedItem(value);
    // Map the value back to a tab number if needed
    let newTab;
    switch (value) {
      case "Roles":
        newTab = 3;
        break;
      case "Level":
        newTab = 5;
        break;
      case "Bands":
        newTab = 10;
        break;
      case "Designation":
        newTab = 6;
        break;
      default:
        newTab = 3;
    }
    setDropdownTab(newTab);
    setActiveTab(newTab);
    setDropdownVisible(false);
    // Fetch data or do something after selection
  };

  const getSelectedItemFromTab = (tab) => {
    switch (tab) {
      case 3:
        return "Roles";
      case 5:
        return "Level";
      case 10:
        return "Bands";
      case 6:
        return "Designation";
      default:
        return "Roles";
    }
  };

  // Compute dropdown options based on the currently selected item
  const dropdownOptions = [
    { name: "Roles", value: "Roles" },
    { name: "Levels", value: "Level" },
    { name: "Bands", value: "Bands" },
    { name: "Designation", value: "Designation" },
  ].filter((item) => item.value !== selectedItem);

  const handleMainTextClick = (tabNumber) => {
    // Clicking on the main text should switch tabs (and fetch data),
    // not toggle dropdown unless already on that tab.
    if (activeTab !== tabNumber) {
      setActiveTab(tabNumber);
      setSelectedItem(getSelectedItemFromTab(tabNumber));
      setDropdownTab(tabNumber);
      setDropdownVisible(false);
    } else {
      // If already on this tab, toggle dropdown
      setDropdownVisible(!dropdownVisible);
    }
  };

  const handleArrowClick = (e) => {
    e.stopPropagation();
    // Only toggle the dropdown, do not switch tabs
    setDropdownVisible(!dropdownVisible);
  };

  return (
    <div className="flex items-center justify-between sm:justify-start space-x-0 sm:space-x-4 border-b border-[#d5d5d5] dark:border-gray-400">
      {/* Departments Tab */}
      <button
        className={`${
          activeTab === 1
            ? "border-b-2 border-[#028fa3] text-[#028fa3]"
            : "border-transparent text-gray-500 hover:border-[#028fa3] hover:text-[#028fa3] font-normal"
        } py-2 text-xs text-nowrap sm:text-base ${style.buttonMobile}`}
        onClick={() => {
          setActiveTab(1);
          setDropdownVisible(false);
        }}
      >
        Departments
      </button>

      {/* Employees Tab */}
      <button
        className={`${
          activeTab === 2
            ? "border-b-2 border-[#028fa3] text-[#028fa3]"
            : "border-transparent text-gray-500 hover:border-[#028fa3] hover:text-[#028fa3] font-normal"
        } py-2 text-xs  text-nowrap sm:text-base ${style.buttonMobile}`}
        onClick={() => {
          setActiveTab(2);
          setDropdownVisible(false);
        }}
      >
        Employees
      </button>

      {/* Dropdown (Roles/Levels/Bands/Designation) */}
      <div className="relative" ref={dropdownRef}>
        <button
          className={`${
            [3, 5, 6, 10].includes(activeTab)
              ? "border-b-2 border-[#028fa3] text-[#028fa3] font-bold"
              : "border-transparent text-gray-500 hover:border-[#028fa3] hover:text-[#028fa3] font-normal"
          } py-2 font-medium text-nowrap text-xs sm:text-base ${
            style.buttonMobile
          }`}
          onClick={() => handleMainTextClick(dropdownTab)}
        >
          {selectedItem}
          <FontAwesomeIcon
            icon={faChevronDown}
            onClick={handleArrowClick}
            className="ml-1 text-sm cursor-pointer"
          />
        </button>

        {dropdownVisible && (
          <div className="absolute mt-2 bg-white border border-gray-300 rounded-lg shadow-lg w-fit sm:w-[200px] z-50">
            <ul className="py-0 pl-2 pr-2 pt-2">
              {dropdownOptions.map((item) => (
                <li
                  key={item.name}
                  className={`p-1 cursor-pointer text-sm sm:text-lg ${
                    selectedItem === item.value
                      ? "text-[#028fa3] font-medium"
                      : "text-[#443C38CC] font-normal"
                  }`}
                  onClick={() => handleDropdownSelect(item.value)}
                >
                  {item.name}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Travel Policy Tab */}
      <button
        className={`${
          activeTab === 7
            ? "border-b-2 border-[#028fa3] text-[#028fa3] font-bold"
            : "border-transparent text-gray-500 hover:border-[#028fa3] hover:text-[#028fa3] font-normal"
        } py-2 font-medium text-xs text-nowrap sm:text-base ${
          style.buttonMobile
        }`}
        onClick={() => {
          setActiveTab(7);
          setDropdownVisible(false);
        }}
      >
        Travel Policy
      </button>
    </div>
  );
};

export default TabNavigation;
