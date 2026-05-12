import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import styles from "./style.module.css";
import useDestinationSearch from "../../../utils/packages/search";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTimes } from "@fortawesome/free-solid-svg-icons";
import { useLogin } from "@/store/context/LoginContext";
import { useRouter } from "next/router";
import axios, { getTabSpecificData,setTabSpecificData ,removeTabSpecificData} from "@/utils/axios/axios";

const Navigation = () => {
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
    setMatchingDestinations,
    isSearchOpen,
  } = useDestinationSearch();

  const { handleUrlChange } = useLogin();
  const router = useRouter();

  const [showSideNav, setShowSideNav] = useState(false);
  const searchInputRef = useRef(null);

  useEffect(() => {
    const storedDestination = getTabSpecificData("packages_destination");

    if (storedDestination !== null && storedDestination !== "undefined") {
      setDestination(storedDestination);
    }
  }, []);

  const toggleNav = () => {
    setShowSideNav((prevState) => !prevState);
  };

  const handleRedirect = async (globalLink, redirectLink) => {
    handleUrlChange(globalLink);
    await router.push(redirectLink);
  };

  const handleSearch = () => {
    const searchTerm = searchInputRef.current.value;
  };

  return (
    <nav>
      <nav className={styles["mobile-navbar"]}>
        <div
          onClick={toggleNav}
          className={`${styles["menu-icon"]} ${
            showSideNav ? styles["active"] : ""
          }`}
          id={styles["menu-icon"]}
        >
          &#9776;
        </div>
        <div className={`${styles["side-nav"]}`} id={styles["side-nav"]}>
          <ul className={styles["menu-items"]}>
            {/* Use Next.js Link component for internal page navigation */}
            <li>
              <Link href="#" onClick={() => handleLinkClick("hotels")}>
                Hotels
              </Link>
            </li>
          </ul>
          <div className={styles["search-container"]}>
            <input
              type="text"
              ref={searchInputRef}
              placeholder="Search destinations"
            />
            <button type="button" id="search-button" onClick={handleSearch}>
              Search
            </button>
          </div>
        </div>
      </nav>

      <div className={styles["top-links"]}>
        <Link onClick={() => handleRedirect("flights", "/")} href={"/"}>
          Flights
        </Link>
        <Link onClick={() => handleRedirect("hotels", "/")} href={"/"}>
          Hotels
        </Link>
        <Link
          onClick={() => handleRedirect("packages", "/")}
          href={"/"}
          class={styles["active"]}
        >
          Packages
        </Link>
      </div>

      <div class={styles["divider"]}></div>

      <div class={styles["search-box"]}>
        <input
          type="text"
          placeholder="Search Destinations"
          autoComplete="off"
          value={destination}
          onChange={handleDestinationChange}
          onFocus={() => setIsDropdownOpen(true)}
        />
        {destination && (
          <FontAwesomeIcon
            icon={faTimes}
            className={styles.clearIcon}
            onClick={() => setDestination("")}
          />
        )}
        {isDropdownOpen &&
          matchingDestinations.length > 0 &&
          destination.trim() !== "" && (
            <ul
              ref={dropdownRef}
              style={{
                listStyleType: "none",
                position: "absolute",
                marginTop: "1%",
                left: "15%",
                background: "#fff",
                zIndex: 1,
                border: "1px solid #ccc",
                padding: "0.5rem",
                borderRadius: "4px",
                boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
                // cursor: 'pointer'
              }}
              className={`${styles.scrollableDropdown}`}
            >
              {matchingDestinations.map((destination, index) => {
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

                  const content = isType1
                    ? `${destination.title}, ${destination.city_name}, ${destination.country_name}`
                    : isType3
                    ? `${destination.title}, ${destination.country_name}`
                    : destination.title;

                  return (
                    <li {...commonLiProps} key={destination.id}>
                      {content}
                    </li>
                  );
                } else {
                  return null;
                }
              })}
            </ul>
          )}
        {isDropdownOpen &&
          destination &&
          destination.length > 3 &&
          matchingDestinations.length === 0 &&
          isSearchOpen && (
            <ul
              ref={dropdownRef}
              style={{
                listStyleType: "none",
                position: "absolute",
                marginTop: "3%",
                left: "15%",
                background: "#fff",
                zIndex: 1,
                border: "1px solid #ccc",
                padding: "0.5rem",
                borderRadius: "4px",
                boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
              }}
              className={`${styles.scrollableDropdown}`}
            >
              <li style={{ padding: "0.25rem", color: "#999999" }}>
                No search results found.
              </li>
            </ul>
          )}
        <button onClick={loading ? null : search}>
          {loading ? <div className={styles.loadingSpinner} /> : "Search"}
        </button>
      </div>
    </nav>
  );
};

export default Navigation;
