import { useState, useEffect, useRef } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faXmark,
  faSpinner,
  faAngleDown,
} from "@fortawesome/free-solid-svg-icons";
import axios from "@/utils/axios/axios";
import { createAbortController } from "@/utils/common";
import style from "./Dropdown.module.css";

const PAGE_SIZE = 10;

/**
 * 1) On first open, if firstPageData is empty => fetch page=1 => store in firstPageData, show that.
 * 2) If user scroll => fetch page=2 => store in extraPagesData => combined = firstPageData + extraPagesData
 * 3) If user closes and reopens => revert to showing only firstPageData, skip re-fetch page=1
 * 4) Searching always resets everything.
 */
const Dropdown = ({
  endpoint,
  transformer,
  selectedValue,
  onChange,
  placeholder = "Select",
  companyId,
  initialData = [],
}) => {
  const [isOpen, setIsOpen] = useState(false);

  // Keep a 'first page' for when user reopens
  const [firstPageData, setFirstPageData] = useState([]);
  // Additional data from scrolling or more pages
  const [extraPagesData, setExtraPagesData] = useState([]);

  // Local states
  const [searchKey, setSearchKey] = useState("");
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // For infinite scroll
  const containerRef = useRef(null);

  // If the user provided some initial data (like from props), treat it as the first page
  useEffect(() => {
    if (initialData && initialData.length > 0) {
      setFirstPageData(initialData);
      setHasMore(false); // assume no more if using initialData only
    }
  }, [initialData]);

  // Helper to fetch from the server
  const fetchData = async (pageNum, searchTerm) => {
    const payload = {
      companyId,
      searchKey: searchTerm,
      pageNo: pageNum,
      pageSize: PAGE_SIZE,
    };
    try {
      const signal = createAbortController();
      const response = await axios.post(endpoint, payload, { signal });
      if (response.data?.status === "SUCCESS") {
        return transformer(response?.data?.data);
      } else {
        throw new Error("Failed to load data.");
      }
    } catch (err) {
      if (err.name === "CanceledError") {
        console.log("Request aborted");
        return [];
      }
      throw err;
    }
  };

  // Main effect to handle opening the dropdown, or scrolling (page changes)
  useEffect(() => {
    if (!isOpen) return; // if closed, do nothing
    if (!companyId) return; // no company => skip

    // If we already have page=1 data and no search => we skip re-fetch for page=1
    const noNeedToRefetchFirstPage =
      page === 1 && !searchKey && firstPageData.length > 0;

    // If page=1, but we do have search => we need fresh data
    // or if we are fetching page>1 => load more
    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);

        const items = await fetchData(page, searchKey);

        if (page === 1) {
          // Searching or first open
          setFirstPageData(items);
          setExtraPagesData([]); // reset extra pages
        } else {
          // Append to extra pages
          setExtraPagesData((prev) => [...prev, ...items]);
        }
        setHasMore(items.length === PAGE_SIZE);
      } catch (err) {
        setError(err.message);
        setHasMore(false);
      } finally {
        setLoading(false);
      }
    };

    // Conditions:
    //   1) if it’s page=1 & no search & firstPageData is loaded => skip
    if (!noNeedToRefetchFirstPage) {
      loadData();
    }
  }, [isOpen, page, searchKey, companyId]);

  // On close -> we want to revert to first 10 only
  const handleOpen = () => {
    if (isOpen) {
      // We are about to close => do nothing special here
      setIsOpen(false);
    } else {
      // We are about to open
      setIsOpen(true);

      // If we already have firstPageData => just show it (no re-fetch)
      // but reset to page=1 in case we had scrolled previously
      setPage(1);
      setError(null);
      setHasMore(true);
      // Also if we want to discard the scrolled data:
      setExtraPagesData([]);
      // If user had typed something => keep or reset? You can decide
    }
  };

  // If user picks the same => unselect
  const handleOptionClick = (option) => {
    if (option.value === selectedValue) {
      onChange(null);
    } else {
      onChange(option.value);
    }
    setIsOpen(false);
  };

  // For infinite scroll
  const handleScroll = (e) => {
    if (!isOpen || loading || !hasMore) return;
    const { scrollTop, scrollHeight, clientHeight } = e.target;
    if (scrollTop + clientHeight >= scrollHeight - 10) {
      setPage((prev) => prev + 1);
    }
  };

  // Searching logic
  const handleSearchChange = (val) => {
    setSearchKey(val);
    setPage(1);
    setHasMore(true);
    setError(null);
  };

  const clearSearch = () => {
    setSearchKey("");
    setPage(1);
    setHasMore(true);
    setError(null);
  };

  // Combine firstPageData + extraPagesData
  const displayedData = [...firstPageData, ...extraPagesData];

  return (
    <div className="relative w-full">
      {isOpen && (
        <div
          className="fixed inset-0 bg-gray-500 bg-opacity-50 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}

      <button
        className="inline-flex justify-center h-14 items-center w-full rounded-md shadow-[0px_4px_4px_0px_rgba(22,156,176,0.14)] px-4 py-3 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none"
        onClick={handleOpen}
      >
        {selectedValue
          ? displayedData.find((d) => d.value === selectedValue)?.label ||
            placeholder
          : placeholder}
        <FontAwesomeIcon icon={faAngleDown} className="ml-2 text-gray-500" />
      </button>

      {isOpen && (
        <div
          className={style.dropdown}
          ref={containerRef}
          onScroll={handleScroll}
        >
          {/* Search bar */}
          <div className="p-2 flex items-center gap-2">
            <input
              type="text"
              value={searchKey}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="w-full border rounded p-2 text-sm"
              placeholder={`Search ${placeholder.toLowerCase()}...`}
            />
            {searchKey && (
              <FontAwesomeIcon
                icon={faXmark}
                className="text-[#028fa3] cursor-pointer hover:text-blue-600 transition-colors duration-300"
                onClick={clearSearch}
              />
            )}
          </div>

          <div className={style.dropdown1}>
            {loading && displayedData.length === 0 ? (
              <div className="p-3 text-sm text-gray-500 flex items-center gap-2">
                <FontAwesomeIcon icon={faSpinner} spin /> Loading...
              </div>
            ) : error ? (
              <div className="p-3 text-sm text-red-500">{error}</div>
            ) : displayedData.length === 0 ? (
              <div className="p-3 text-sm text-gray-500">
                No data available.
              </div>
            ) : (
              displayedData.map((option) => (
                <button
                  key={option.value}
                  className={`block p-3 py-2 text-left w-full text-sm ${
                    selectedValue === option.value
                      ? "border-l-4 border-[#028fa3] text-[#028fa3]"
                      : "text-gray-700"
                  } hover:bg-gray-100 focus:outline-none`}
                  onClick={() => handleOptionClick(option)}
                >
                  {option.label}
                </button>
              ))
            )}

            {/* If still loading & have partial data => show "Loading more..." */}
            {loading && displayedData.length > 0 && (
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
