import { useState, useEffect, useRef } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faLocationDot,
  faPlaneDeparture,
  faTimes,
} from "@fortawesome/free-solid-svg-icons";

const LocationInput = ({
  placeholder,
  onSelect,
  handleFromDestinationChange,
  handleToDestinationChange,
  handleSelectDestination,
  matchingFromDestinations,
  matchingToDestinations,
  fromDestination,
  toDestination,
  isHomePage,
  multiCityIndex,
  activeWay,
  multiCityDestinations,
  handleMultiCityDestinationChange,
  setMultiCityDestinations,
  handleMultiCitySelectDestination,
  matchingMultiCityDestinations,
  isDropdownVisible, // Accept the prop here
}) => {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [destination, setDestination] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const inputRef = useRef(null);
  const dropdownRef = useRef(null);

  useEffect(() => {
    if (query.length > 1) {
      const filteredSuggestions = airportData.filter(
        (airport) =>
          airport.name.toLowerCase().includes(query.toLowerCase()) ||
          airport.city.toLowerCase().includes(query.toLowerCase()) ||
          airport.code.toLowerCase().includes(query.toLowerCase())
      );
      setSuggestions(filteredSuggestions);
    } else {
      setSuggestions([]);
    }
  }, [query]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target) &&
        inputRef.current &&
        !inputRef.current.contains(event.target)
      ) {
        setShowDropdown(false);
        setFocusedIndex(-1);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Add keyboard navigation handler
  const handleKeyDown = (e) => {
    if (!showDropdown || !suggestions || !suggestions.length) return;

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setFocusedIndex((prev) =>
          prev < suggestions.length - 1 ? prev + 1 : prev
        );
        // Scroll into view if necessary
        if (dropdownRef.current) {
          const focused = dropdownRef.current.children[focusedIndex + 1];
          if (focused) {
            focused.scrollIntoView({ block: "nearest" });
          }
        }
        break;
      case "ArrowUp":
        e.preventDefault();
        setFocusedIndex((prev) => (prev > 0 ? prev - 1 : prev));
        // Scroll into view if necessary
        if (dropdownRef.current) {
          const focused = dropdownRef.current.children[focusedIndex - 1];
          if (focused) {
            focused.scrollIntoView({ block: "nearest" });
          }
        }
        break;
      case "Enter":
        e.preventDefault();
        if (focusedIndex >= 0) {
          const selectedDestination = suggestions[focusedIndex];
          if (activeWay === 3) {
            handleMultiCitySelectDestination(
              selectedDestination,
              placeholder.toLowerCase(),
              multiCityIndex
            );
          } else {
            handleSelectDestination(
              selectedDestination,
              placeholder.toLowerCase()
            );
          }
          setShowDropdown(false);
          setFocusedIndex(-1);
        }
        break;
      case "Escape":
        setShowDropdown(false);
        setFocusedIndex(-1);
        break;
      case "Tab":
        setShowDropdown(false);
        setFocusedIndex(-1);
        break;
    }
  };

  const handleLocationChange = (e) => {
    if (activeWay === 3) {
      handleMultiCityDestinationChange(
        e,
        multiCityIndex,
        placeholder.toLowerCase()
      );
    } else {
      if (placeholder === "From") {
        handleFromDestinationChange(e);
      } else {
        handleToDestinationChange(e);
      }
    }
    setFocusedIndex(-1);
  };

  useEffect(() => {
    if (activeWay === 3) {
      if (placeholder === "From") {
        if (multiCityDestinations[multiCityIndex]?.from != "") {
          setSuggestions(matchingMultiCityDestinations[multiCityIndex]?.from);
          // setShowDropdown(true);
          setDestination(multiCityDestinations[multiCityIndex]?.from);
        } else {
          setSuggestions([]);
          setDestination("");
        }
      } else {
        if (multiCityDestinations[multiCityIndex]?.to !== "") {
          setSuggestions(matchingMultiCityDestinations[multiCityIndex]?.to);
          setDestination(multiCityDestinations[multiCityIndex]?.to);
        } else {
          setSuggestions([]);
          setDestination("");
        }
      }
    } else {
      if (placeholder === "From") {
        if (fromDestination !== "") {
          setSuggestions(matchingFromDestinations);
          setDestination(fromDestination);
        } else {
          setSuggestions([]);
          setDestination("");
        }
      } else {
        if (toDestination !== "") {
          setSuggestions(matchingToDestinations);
          setDestination(toDestination);
        } else {
          setSuggestions([]);
          setDestination("");
        }
      }
    }
  }, [
    matchingFromDestinations,
    matchingToDestinations,
    fromDestination,
    toDestination,
    multiCityDestinations,
    matchingMultiCityDestinations,
  ]);

  const handleClearInput = (e) => {
    e.target.value = "";
    setDestination("");
    setQuery("");
    if (activeWay === 3) {
      handleMultiCityDestinationChange(
        e,
        multiCityIndex,
        placeholder.toLowerCase()
      );
    } else {
      if (placeholder === "From") {
        handleFromDestinationChange(e);
      } else {
        handleToDestinationChange(e);
      }
    }
  };

  return (
    <div className="w-full h-full">
      <div className="relative h-full">
        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
          <FontAwesomeIcon
            icon={faLocationDot}
            className="w-5 h-5 text-gray-400"
          />
        </div>
        <input
          ref={inputRef}
          type="text"
          className={`w-full h-full font-medium text-[#000000] ${
            isHomePage
              ? "text-base cursor-pointer bg-[#f6f6f6]"
              : `text-base ${isDropdownVisible ? "bg-[#f6f6f6]" : "bg-white"}`
          } pl-8 pr-8 py-2 focus:bg-white rounded-xl placeholder-gray-500`}
          placeholder={placeholder}
          value={destination}
          onChange={handleLocationChange}
          onFocus={() => setShowDropdown(true)}
          onKeyDown={handleKeyDown}
        />
        {destination && (
          <FontAwesomeIcon
            icon={faTimes}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 cursor-pointer"
            onClick={handleClearInput}
          />
        )}
        {showDropdown && suggestions && suggestions.length > 0 && (
          <div
            ref={dropdownRef}
            style={{ width: "200%" }}
            className="absolute mt-1 bg-white border border-gray-300 rounded-md shadow-lg z-10 max-w-fit max-h-80 overflow-y-auto"
          >
            {suggestions.map((destination, index) => (
              <div
                key={index}
                className={`p-2 cursor-pointer flex flex-col ${
                  index === focusedIndex ? "bg-blue-100" : "hover:bg-gray-100"
                }`}
                onClick={() => {
                  if (activeWay === 3) {
                    handleMultiCitySelectDestination(
                      destination,
                      placeholder.toLowerCase(),
                      multiCityIndex
                    );
                  } else {
                    handleSelectDestination(
                      destination,
                      placeholder.toLowerCase()
                    );
                  }
                  setShowDropdown(false);
                  setFocusedIndex(-1);
                }}
                onMouseEnter={() => setFocusedIndex(index)}
              >
                <div>
                  <FontAwesomeIcon
                    icon={faPlaneDeparture}
                    color="#028fa3"
                    size="xs"
                  />
                  <span className="font-semibold text-base ml-2">
                    {destination.cityname}
                  </span>
                </div>
                <span className="text-sm font-medium text-gray-500 text-nowrap">
                  {destination.airportName}, {destination.countryname} (
                  {destination.airportCode})
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default LocationInput;
