import { useState, useEffect, useRef } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faXmark,
  faSpinner,
  faAngleDown,
  faCheck,
} from "@fortawesome/free-solid-svg-icons";
import axios from "@/utils/axios/axios";
import { createAbortController } from "@/utils/common";
import style from "./Dropdown.module.css";

const PAGE_SIZE = 10;

const Dropdown = ({
  endpoint,
  transformer,
  selectedValue,
  onChange,
  placeholder = "Select",

  initialData = [],
  isMulti = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [data, setData] = useState([]);
  const [searchKey, setSearchKey] = useState("");
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const containerRef = useRef(null);

  const fetchData = async ( searchKey, page) => {
    const payload = {
      searchKey,
      pageNo: page,
      pageSize: PAGE_SIZE,
    };
    try {
      const signal = createAbortController();
      const response = await axios.post(endpoint, payload, { signal });
      if (response.data?.status === "SUCCESS") {
        return transformer(response?.data?.data);
      } else {
        throw new Error("Failed to load data");
      }
    } catch (error) {
      if (error.name === "CanceledError") {
        console.log("Request aborted");
        return [];
      }
      throw error;
    }
  };

  useEffect(() => {
    if (initialData && initialData.length > 0) {
      setData(initialData);
      setHasMore(false); // assume initialData is complete for initial display
    }
  }, [initialData]);

  useEffect(() => {
    if (!isOpen ) return;

    const loadDataOnOpen = async () => {
      if (loading || !hasMore) return;
      setLoading(true);
      setError(null);
      try {
        const items = await fetchData(searchKey, page);
        let combined;
        if (page === 1) {
          const itemMap = new Map();

          // Add initialData first
          initialData.forEach((item) => {
            itemMap.set(item.value, item);
          });

          // Add fetched items, overwriting any duplicates from initialData
          items.forEach((item) => {
            itemMap.set(item.value, item);
          });

          // Convert Map back to array
          combined = Array.from(itemMap.values());
        } else {
          // For subsequent pages, merge with existing data while maintaining uniqueness
          const itemMap = new Map();

          // Add existing data first
          data.forEach((item) => {
            itemMap.set(item.value, item);
          });

          // Add new items, overwriting any duplicates
          items.forEach((item) => {
            itemMap.set(item.value, item);
          });

          combined = Array.from(itemMap.values());
        }

        setData(combined);
        setHasMore(items.length === PAGE_SIZE);
      } catch (err) {
        setError(err.message);
        setHasMore(false);
      } finally {
        setLoading(false);
      }
    };

    loadDataOnOpen();

    return () => {
      createAbortController(); // Abort ongoing requests on component unmount
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, page, searchKey]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    if (isOpen) document.addEventListener("mousedown", handleClickOutside);
    else document.removeEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  const toggleDropdown = () => {
    setIsOpen((prev) => !prev);
    if (!isOpen) {
      // If opening => reset data, page, etc.
      setOptions([]);
      setPage(1);
      setHasMore(true);
      setSearchKey("");
      setError(null);
    }
  };

  const handleOpen = () => {
    if (!isOpen) {
      // Reset pagination on open
      setData([]);
      setPage(1);
      setHasMore(true);
      setError(null);
    }
    setIsOpen(!isOpen);
  };

  const handleSingleSelect = (option) => {
    onChange(option.value === selectedValue ? null : option);
    setIsOpen(false);
  };

  // Handle multi select
  const handleMultiSelect = (option) => {
    const isSelected = selectedValue.includes(option.value);
    if (isSelected) {
      // remove
      const updated = selectedValue.filter((val) => val !== option.value);
      onChange(updated);
    } else {
      // add
      onChange([...selectedValue, option.value]);
    }
    // keep the dropdown open to allow multiple picks
  };

  const handleOptionClick = (val) => {
    if (isMulti) {
      handleMultiSelect(val);
    } else {
      handleSingleSelect(val);
    }
  };

  const handleScroll = (e) => {
    if (!isOpen || loading || !hasMore) return;
    const { scrollTop, scrollHeight, clientHeight } = e.target;
    if (scrollTop + clientHeight >= scrollHeight - 10) {
      setPage((prev) => prev + 1);
    }
  };

  const getDisplayText = () => {
    if (!selectedValue || selectedValue.length === 0) return placeholder;

    if (!isMulti) {
      const selected = data.find((d) => d.value === selectedValue);
      return selected ? selected.label : placeholder;
    }

    const selectedCount = selectedValue.length;
    if (selectedCount === 0) return placeholder;
    if (selectedCount === 1) {
      const selected = data.find((d) => d.value === selectedValue[0]);
      return selected ? selected.label : placeholder;
    }
    return `${selectedCount} selected`;
  };

  return (
    <div className="relative w-full">
      {isOpen && (
        <div
          className="fixed inset-0 bg-gray-500 bg-opacity-50 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}
      <button
        className="inline-flex justify-center h-14  items-center w-full rounded-md shadow-[0px_4px_4px_0px_rgba(22,156,176,0.14)] px-4 py-3 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none"
        onClick={handleOpen}
      >
        <span className="truncate">{getDisplayText()}</span>
        <FontAwesomeIcon icon={faAngleDown} className="ml-2 text-gray-500" />
      </button>
      {isOpen && (
        <div
          className={style.dropdown}
          ref={containerRef}
          onScroll={handleScroll}
        >
          <div className="p-2 flex items-center gap-2">
            <input
              type="text"
              value={searchKey}
              onChange={(e) => {
                setSearchKey(e.target.value);
                setPage(1);
                setData([]);
                setHasMore(true);
                setError(null);
              }}
              className="w-full border rounded p-2 text-sm"
              placeholder={`Search ${placeholder.toLowerCase()}...`}
            />
            {searchKey && (
              <FontAwesomeIcon
                icon={faXmark}
                className="text-[#028fa3] cursor-pointer hover:text-blue-600 transition-colors duration-300"
                onClick={() => {
                  setSearchKey("");
                  setPage(1);
                  setData([]);
                  setHasMore(true);
                  setError(null);
                }}
              />
            )}
          </div>

          <div className={style.dropdown1}>
            {loading && data.length === 0 ? (
              <div className="p-3 text-sm text-gray-500 flex items-center gap-2">
                <FontAwesomeIcon icon={faSpinner} spin /> Loading...
              </div>
            ) : error ? (
              <div className="p-3 text-sm text-red-500">{error}</div>
            ) : data.length === 0 ? (
              <div className="p-3 text-sm text-gray-500">
                No data available.
              </div>
            ) : (
              data.map((option) => {
                const isSelected = isMulti
                  ? selectedValue.includes(option.value)
                  : option.value === selectedValue;
                return (
                  <button
                    key={option.value}
                    className={`block p-3 py-2 text-left w-full  text-sm ${
                      isSelected
                        ? "border-l-4 border-[#028fa3] text-[#028fa3]"
                        : "text-gray-700"
                    } hover:bg-gray-100 focus:outline-none`}
                    onClick={() => handleOptionClick(option)}
                  >
                    <div className="flex items-center gap-3">
                      {isMulti && (
                        <label className="relative flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={selectedValue.includes(option.value)}
                            onChange={() => handleOptionClick(option)}
                            className="peer hidden"
                          />
                          <div className="w-5 h-5 border-2 border-gray-400 rounded-md peer-checked:bg-[#028fa3] peer-checked:border-[#028fa3] flex items-center justify-center transition-all">
                            {selectedValue.includes(option.value) && (
                              <FontAwesomeIcon
                                icon={faCheck}
                                className="text-white text-xs"
                              />
                            )}
                          </div>
                        </label>
                      )}
                      <span>{option.label}</span>
                    </div>
                  </button>
                );
              })
            )}
            {loading && data.length > 0 && (
              <div className="p-3 text-sm text-gray-500 flex items-center gap-2">
                <FontAwesomeIcon icon={faSpinner} spin /> Loading more...
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Dropdown;
