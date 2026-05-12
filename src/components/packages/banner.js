import {
  faCity,
  faEarthAmericas,
  faTimes,
  faUmbrellaBeach,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useEffect, useState } from "react";
import styles from "./style.module.css";
import useDestinationSearch from "../../../utils/packages/search";
import MobileBannerTabs from "../bannerTabs/MobileBannerTabs";

export default function Banner({ setPageLoading }) {
  const {
    destination,
    matchingDestinations,
    selectedItemIndex,
    isDropdownOpen,
    loading,
    redirectionRoute,
    handleDestinationChange,
    handleSelectDestination,
    search,
    setIsDropdownOpen,
    setDestination,
    openPopup,
    dropdownRef,
  } = useDestinationSearch();

  useEffect(() => {
    setPageLoading(loading);
  }, [loading]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (
        e.key === "ArrowDown" &&
        selectedItemIndex < matchingDestinations.length - 1
      ) {
        setSelectedItemIndex(selectedItemIndex + 1);
      } else if (e.key === "ArrowUp" && selectedItemIndex > 0) {
        setSelectedItemIndex(selectedItemIndex - 1);
      } else if (e.key === "Enter" && selectedItemIndex >= 0) {
        handleSelectDestination(matchingDestinations[selectedItemIndex]);
      }
    };

    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("click", handleClickOutside);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("click", handleClickOutside);
    };
  }, [selectedItemIndex, matchingDestinations]);

  const [isHomePage, setIsHomePage] = useState(false);
  useEffect(() => {
    if (typeof window !== "undefined") {
      setIsHomePage(window.location.pathname === "/");
    }
  }, []);

  const [isHomePage1, setIsHomePage1] = useState(false);
  useEffect(() => {
    if (typeof window !== "undefined") {
      setIsHomePage1(window.location.pathname === "/" ||window.location.pathname === "/bookings");
    }
  }, []);

  return (
    <>
      <div className={styles.box}>
        <div className={` ${isHomePage1 ? styles.navbox1: styles.navbox}`}>
          {/* <MobileBannerTabs /> */}
          {!isHomePage1 && <MobileBannerTabs />}
          <div className={styles.selectors}>
            <div className={`${styles.selector} ${styles.selector1}`}>
              <div className={styles.searchCross}>
                <input
                  type="text"
                  className={`${styles.formControl} ${styles.formInput}`}
                  id="destination"
                  autoComplete="off"
                  placeholder="Search Country,City or Package Name"
                  value={destination}
                  onChange={handleDestinationChange}
                  onFocus={() => setIsDropdownOpen(true)}
                />
                {destination && (
                  <FontAwesomeIcon
                    icon={faTimes}
                    className={
                      isHomePage ? styles.clearIcon1 : styles.clearIcon
                    }
                    onClick={() => setDestination("")}
                  />
                )}
              </div>
              {isDropdownOpen && destination.trim() !== "" && (
                <ul
                  ref={dropdownRef}
                  style={{
                    listStyleType: "none",
                    position: "absolute",
                    // top: "45%",
                    background: "#fff",
                    zIndex: 1,
                    border: "1px solid #ccc",
                    padding: "0.5rem",
                    borderRadius: "4px",
                    boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
                  }}
                  className={`${styles.scrollableDropdown}`}
                >
                  {matchingDestinations.length > 0 &&
                  destination.length >= 1 ? (
                    matchingDestinations.map((destination, index) => {
                      const isType1 = destination.type === 1;
                      const isType2 = destination.type === 2;
                      const isType3 = destination.type === 3;

                      if (isType1 || isType2 || isType3) {
                        const commonLiProps = {
                          key: destination.id,
                          onClick: () => handleSelectDestination(destination),
                          style: {
                            padding: "0.25rem",
                            cursor: "pointer",
                            ":hover": {
                              background: "#ff0000",
                            },
                            color: "#000000",
                            background:
                              index === selectedItemIndex
                                ? "lightgray"
                                : "transparent",
                          },
                        };

                        const content = isType1 ? (
                          <div>
                            <div>
                              <FontAwesomeIcon
                                icon={faUmbrellaBeach}
                                size="sm"
                                color="#028fa3"
                              />
                              <span className="font-semibold ml-2 text-nowrap">
                                {destination.title} ({destination.city_name})
                              </span>
                            </div>
                            <span className="text-sm text-gray-500 font-medium text-nowrap">
                              {destination.title}, {destination.country_name}
                            </span>
                          </div>
                        ) : isType3 ? (
                          <div>
                            <FontAwesomeIcon
                              icon={faCity}
                              size="sm"
                              color="#028fa3"
                            />
                            <span className="font-semibold ml-2 text-nowrap">
                              {destination.title} ({destination.country_name})
                            </span>
                          </div>
                        ) : (
                          <div>
                            <FontAwesomeIcon
                              icon={faEarthAmericas}
                              size="sm"
                              color="#028fa3"
                            />
                            <span className="ml-2 font-semibold">
                              {destination.title}
                            </span>
                          </div>
                        );

                        return (
                          <li {...commonLiProps} key={destination.id}>
                            {content}
                          </li>
                        );
                      } else {
                        return null;
                      }
                    })
                  ) : (
                    <li style={{ padding: "0.25rem", color: "#999999" }}>
                      No search results found.
                    </li>
                  )}
                </ul>
              )}
            </div>
          </div>
          <button
            className={styles.searchButton}
            onClick={loading ? null : search}
          >
            {loading ? <div className={styles.loadingSpinner} /> : "Search"}
          </button>
        </div>
      </div>
    </>
  );
}
