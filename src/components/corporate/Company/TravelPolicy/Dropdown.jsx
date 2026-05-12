import React, { useState, useEffect, useRef } from "react";
import axios from "@/utils/axios/axios";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCaretDown,
  faCaretUp,
  faInfoCircle,
  faMagnifyingGlass,
  faXmark,
} from "@fortawesome/free-solid-svg-icons";
import { faCheckCircle, faCircle } from "@fortawesome/free-regular-svg-icons";
import Modal from "@/components/corporate/modal/Modal";

const PAGE_SIZE = 10;

function Dropdown({
  label,
  dropdownKey,
  selectedValues,
  onChange,
  endpoint,
  transformer,
  // companyId,
  highlightClass,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [dataCache, setDataCache] = useState([]); // store fetched items
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const containerRef = useRef(null);
  const dropdownRef = useRef(null);
  const [hasFetched, setHasFetched] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [showModal, setShowModal] = useState(false);

  // Helper function to deduplicate items based on value
  const deduplicateItems = (items) => {
    const seen = new Set();
    return items.filter((item) => {
      const duplicate = seen.has(item.value);
      seen.add(item.value);
      return !duplicate;
    });
  };

  const getRequestMethod = () => {
    return dropdownKey === "department" ? "GET" : "POST";
  };

  const buildRequestData = (pageNo, searchKey) => {
    const base = {
      // companyId,
      searchKey,
      pageNo,
      pageSize: PAGE_SIZE,
    };
    if (dropdownKey === "employee") {
      base.filter = [
        {
          by: "DEPARTMENT",
          type: [],
          values: [],
        },
      ];
    }
    return base;
  };

  const fetchData = async (pageToFetch, term) => {
    setIsLoading(true);
    try {
      const method = getRequestMethod();
      const payloadOrParams = buildRequestData(pageToFetch, term);

      let response;
      if (method === "GET") {
        response = await axios.get(endpoint, { params: payloadOrParams });
      } else {
        response = await axios.post(endpoint, payloadOrParams);
      }

      if (response.data?.status === "SUCCESS") {
        const items = transformer(response.data?.data || []);
        return items;
      }
      console.warn("API responded but status not SUCCESS");
      return [];
    } catch (error) {
      console.error(`Error fetching data for [${dropdownKey}]:`, error);
      return [];
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && !hasFetched) {
      handleFetchFirstPage();
    }
  }, [isOpen]);

  const handleFetchFirstPage = async () => {
    setPage(1);
    setHasMore(true);
    setDataCache([]);

    setIsLoading(true);
    const firstItems = await fetchData(1, searchTerm);
    setDataCache(firstItems);
    setIsLoading(false);

    setHasFetched(true);
    if (firstItems.length < PAGE_SIZE) {
      setHasMore(false);
    }
  };

  const handleScroll = async () => {
    if (!containerRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = containerRef.current;
    const nearBottom = scrollHeight - scrollTop <= clientHeight * 1.2;

    if (nearBottom && !isLoading && hasMore) {
      const nextPage = page + 1;
      setIsLoading(true);
      const newItems = await fetchData(nextPage, searchTerm);

      // Combine existing and new items, then deduplicate
      setDataCache((prevCache) => {
        const combinedItems = [...prevCache, ...newItems];
        const uniqueItems = deduplicateItems(combinedItems);

        // If after deduplication we have fewer new items than expected,
        // it likely means we've received mostly duplicates
        const actualNewItems = uniqueItems.length - prevCache.length;
        if (actualNewItems < PAGE_SIZE) {
          setHasMore(false);
        }

        return uniqueItems;
      });

      setIsLoading(false);
      setPage(nextPage);
    }
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    if (isOpen) document.addEventListener("mousedown", handleClickOutside);
    else document.removeEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const handleSearchChange = async (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    setPage(1);
    setHasMore(true);
    setDataCache([]);

    setIsLoading(true);
    const fresh = await fetchData(1, value);
    setDataCache(fresh);
    setIsLoading(false);
  };

  const handleClearSearch = async () => {
    setSearchTerm("");
    setPage(1);
    setHasMore(true);
    setDataCache([]);

    setIsLoading(true);
    const fresh = await fetchData(1, "");
    setDataCache(fresh);
    setIsLoading(false);
  };

  const handleCheckboxChange = (itemValue, itemLabel, hasTravelPolicy) => {
    if (selectedValues.includes(itemValue)) {
      // Unselecting: directly remove without showing modal
      handleSelection(itemValue, itemLabel, false);
      return;
    }

    if (hasTravelPolicy) {
      // Selecting an item with an existing policy
      setSelectedItem({ itemValue, itemLabel });
      setShowModal(true); // Show confirmation modal
    } else {
      // Normal selection (no existing policy)
      handleSelection(itemValue, itemLabel, false);
    }
  };

  const handleSelection = (itemValue, itemLabel, isForceOverwrite = false) => {
    const alreadySelected = selectedValues.includes(itemValue);
    let newSelected = [];
    if (alreadySelected) {
      // remove
      newSelected = selectedValues.filter((val) => val !== itemValue);
    } else {
      // add
      newSelected = [...selectedValues, itemValue];
    }

    // Build new array of objects
    const newSelectedObjects = newSelected.map((val) =>
      dataCache.find((i) => i.value === val)
    );

    // if not forcibly overwriting => check if ANY item hasTravelPolicy
    let isOverWrite = isForceOverwrite;
    if (!isForceOverwrite) {
      isOverWrite = newSelectedObjects.some((obj) => obj?.hasTravelPolicy);
    }

    // call parent's onChange => pass array of IDs, array of {id, name}, isOverWrite
    onChange(
      newSelected,
      newSelectedObjects.map((o) => ({ id: o.value, name: o.label })),
      isOverWrite
    );
  };

  const confirmOverwritePolicy = () => {
    if (selectedItem) {
      handleSelection(selectedItem.itemValue, selectedItem.itemLabel, true);
    }
    setShowModal(false);
  };

  const cancelOverwritePolicy = () => {
    setSelectedItem(null);
    setShowModal(false);
  };

  return (
    <div className="relative inline-block text-sm" ref={dropdownRef}>
      <button
        // className="px-4 py-2 border-[1px] rounded-full text-gray-700 bg-white border-[#028fa380] hover:bg-gray-100 flex items-center justify-between w-fit"
        className={`px-4 py-2 border-[1px] rounded-full text-gray-700  border-[#028fa380] hover:bg-gray-100 flex items-center justify-between w-fit ${highlightClass}`}
        onClick={() => setIsOpen((prev) => !prev)}
      >
        <div className="flex items-center gap-2">
          <FontAwesomeIcon
            icon={isOpen || highlightClass ? faCheckCircle : faCircle}
            className="text-[#028fa3]"
          />
          <span>{label}</span>
        </div>
        <FontAwesomeIcon
          icon={isOpen ? faCaretUp : faCaretDown}
          className="ml-2"
        />
      </button>

      {isOpen && (
        <div
          className="absolute mt-2 w-64 bg-white border border-gray-300 rounded-lg shadow-lg z-10"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center gap-2 p-2 border-b border-gray-200">
            <FontAwesomeIcon
              icon={faMagnifyingGlass}
              className="text-gray-400"
            />
            <input
              className="flex-1 min-w-0 border border-gray-200 rounded px-2 py-1 text-sm focus:outline-none"
              type="text"
              placeholder="Search..."
              value={searchTerm}
              onChange={handleSearchChange}
            />
            {searchTerm && (
              <button onClick={handleClearSearch}>
                <FontAwesomeIcon icon={faXmark} className="text-gray-400" />
              </button>
            )}
          </div>

          <div
            className="max-h-60 overflow-y-auto"
            ref={containerRef}
            onScroll={handleScroll}
          >
            {isLoading && dataCache.length === 0 && (
              <div className="p-2 text-center text-gray-500 text-sm">
                Loading...
              </div>
            )}

            {!isLoading && dataCache.length === 0 && (
              <div className="p-2 text-gray-500 text-sm">No results found.</div>
            )}

            {dataCache.map((item) => {
              const isChecked = selectedValues.includes(item.value);
              return (
                <label
                  key={item.value}
                  className="flex items-center px-4 py-2 hover:bg-gray-100 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    className="form-checkbox h-4 w-4 text-blue-500 border-gray-300 rounded focus:ring-blue-400"
                    checked={isChecked}
                    onChange={() =>
                      handleCheckboxChange(
                        item.value,
                        item.label,
                        item.hasTravelPolicy
                      )
                    }
                  />
                  <span className="ml-2 text-gray-700">
                    {item.label}{" "}
                    {item.hasTravelPolicy && (
                      <span className="ml-2 flex items-center">
                        <FontAwesomeIcon
                          icon={faInfoCircle}
                          className="text-red-500 mr-1"
                          title="Travel Policy Exists"
                        />
                        <span className="text-xs text-green-600 font-semibold">
                          (Policy Exists)
                        </span>
                      </span>
                    )}
                  </span>
                </label>
              );
            })}

            {isLoading && dataCache.length > 0 && (
              <div className="p-2 text-center text-gray-500 text-sm">
                Loading...
              </div>
            )}
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      {showModal && (
        <Modal
          title="Confirm Policy Overwrite"
          onClose={cancelOverwritePolicy}
          actions={
            <>
              <button
                className="bg-gray-500 text-white p-2 px-4 rounded-lg hover:bg-gray-700 transition-colors duration-300"
                onClick={cancelOverwritePolicy}
              >
                No
              </button>
              <button
                className="bg-blue-600 text-white p-2 px-4 rounded-lg hover:bg-blue-800 transition-colors duration-300"
                onClick={confirmOverwritePolicy}
              >
                Overwrite
              </button>
            </>
          }
        >
          <p>
            This selection already has a travel policy. Selecting this will
            overwrite the existing travel policy. Do you wish to continue?
          </p>
        </Modal>
      )}
    </div>
  );
}

export default Dropdown;
