import { faMinus, faXmark } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useEffect, useState } from "react";
import style from "./styles.module.css";
import { getTabSpecificData } from "@/utils/axios/axios";
import { Slider } from "@mui/material";
import pako from "pako";
import Image from "next/image";
import { logEvent } from "firebase/analytics";
import { analytics } from "../../../../utils/firebase";

const FiltersPop = ({
  isOpen,
  onClose,
  filterData,
  flightsResponse,
  setFlightsResponse,
  selectedFilters,
  setSelectedFilters,
  type,
  flightsRequest,
  sortingCriteria,
  sortFlights,
  wayType,
  destinationIndex,
  isCorporate,
}) => {
  // filters time change on hover
  const [hoveredTimeBox, setHoveredTimeBox] = useState(null);
  const [originalResults, setOriginalResults] = useState([]);

  const handleMouseEnter = (timeBox) => {
    setHoveredTimeBox(timeBox);
  };

  const handleMouseLeave = () => {
    setHoveredTimeBox(null);
  };

  function handleChanges(event, newValue) {
    setRange(newValue);
  }

  const [range, setRange] = useState([
    selectedFilters?.price?.min || filterData?.price?.min,
    selectedFilters?.price?.max || filterData?.price?.max,
  ]);

  // useEffect(() => {
  //   // Reset filters when the component mounts or flightsResponse changes
  //   setSelectedFilters({
  //     stops: [],
  //     airlines: [],
  //     layovers: [],
  //     destinations: [],
  //     arrivals: [],
  //   });
  //   setRange([filterData?.price?.min, filterData?.price?.max]);
  // }, [flightsResponse]);

  useEffect(() => {
    const compressedData = getTabSpecificData("flightResponse");
    if (compressedData) {
      const numbersArray = compressedData.split(",").map(Number);

      const compressedUint8Array = new Uint8Array(numbersArray);

      const encodedResponse = pako.inflate(compressedUint8Array, {
        to: "string",
      });

      if (encodedResponse) {
        // Decode from base64
        const decodedResponse = JSON.parse(encodedResponse);
        setOriginalResults(decodedResponse);
        setRange([
          selectedFilters?.price?.min || filterData?.price?.min,
          selectedFilters?.price?.max || filterData?.price?.max,
        ]);
      }
    } else {
      console.error("No flightResponse found in localStorage");
    }
  }, [selectedFilters, filterData]);

  useEffect(() => {
    let size = originalResults?.length;
    if (type === "all") {
      size = originalResults?.flightsResults?.length;
    }
    if (isOpen && size > 0 && type === "all" && wayType !== "multicity") {
      applyFilters();
    }
    if (wayType === "multicity") {
      applyMultiCityFilters();
    }
  }, [range, selectedFilters, originalResults, sortingCriteria]);

  const applyFilters = (shouldClose = false) => {
    const filteredResults = originalResults.flightsResults[0].flights.filter(
      (result) => {
        const firstSegment = result.segments[0];

        // Filter by stops
        if (
          selectedFilters.stops.length > 0 &&
          !selectedFilters.stops.includes(firstSegment.stops)
        ) {
          return false;
        }
        if (
          selectedFilters.airlines.length > 0 &&
          !firstSegment.segment.some((segment) =>
            selectedFilters.airlines.includes(segment.airline.airlineCode)
          )
        ) {
          return false;
        }
        if (
          selectedFilters.layovers.length > 0 &&
          !firstSegment.segment.some((segment) =>
            selectedFilters.layovers.includes(
              segment.destination.airport.cityCode
            )
          )
        ) {
          return false;
        }
        if (
          selectedFilters.destinations.length > 0 &&
          !firstSegment.segment.some((segment) =>
            selectedFilters.destinations.includes(
              segment.destination.airport.airportCode
            )
          )
        ) {
          return false;
        }

        // Filter by arrivals
        if (
          selectedFilters.arrivals.length > 0 &&
          !firstSegment.segment.some((segment) =>
            selectedFilters.arrivals.includes(
              segment.origin.airport.airportCode
            )
          )
        ) {
          return false;
        }

        // Filter by price range
        const roundedOffFare = result.fare.offeredFareRoundedOff;
        if (roundedOffFare < range[0] || roundedOffFare > range[1]) {
          return false;
        }

        // Filter by cabin classes
        if (
          selectedFilters.cabinClasses.length > 0 &&
          !firstSegment.segment.some((segment) =>
            selectedFilters.cabinClasses.includes(segment.cabinClass)
          )
        ) {
          return false;
        }

        // Filter by carrier
        if (
          selectedFilters.carrier.length > 0 &&
          !selectedFilters.carrier.includes(result.isLCC)
        ) {
          return false;
        }

        return true;
      }
    );
    const sortedResults = sortFlights(
      sortingCriteria.criteria,
      sortingCriteria.order,
      filteredResults
    );
    setFlightsResponse((prev) => ({
      ...prev,
      flightsResults: [
        {
          ...prev.flightsResults[0],
          flights: sortedResults,
        },
      ],
    }));
    if (shouldClose) {
      onClose();
    }
  };
  const applyMultiCityFilters = (shouldClose = false) => {
    if (flightsResponse) {
      const updatedResponse = [...flightsResponse];
      const filteredResults = updatedResponse.filter((result) => {
        const firstSegment = result.segments[0];

        // Filter by stops
        if (
          selectedFilters.stops.length > 0 &&
          !selectedFilters.stops.includes(firstSegment.stops)
        ) {
          return false;
        }

        if (
          selectedFilters.airlines.length > 0 &&
          !firstSegment.segment.some((segment) =>
            selectedFilters.airlines.includes(segment.airline.airlineCode)
          )
        ) {
          return false;
        }

        if (
          selectedFilters.layovers.length > 0 &&
          !firstSegment.segment.some((segment) =>
            selectedFilters.layovers.includes(
              segment.destination.airport.cityCode
            )
          )
        ) {
          return false;
        }

        if (
          selectedFilters.destinations.length > 0 &&
          !firstSegment.segment.some((segment) =>
            selectedFilters.destinations.includes(
              segment.destination.airport.airportCode
            )
          )
        ) {
          return false;
        }

        // Filter by arrivals
        if (
          selectedFilters.arrivals.length > 0 &&
          !firstSegment.segment.some((segment) =>
            selectedFilters.arrivals.includes(
              segment.origin.airport.airportCode
            )
          )
        ) {
          return false;
        }

        // Filter by price range
        const roundedOffFare = result.fare.offeredFareRoundedOff;
        if (roundedOffFare < range[0] || roundedOffFare > range[1]) {
          return false;
        }

        // Filter by cabin classes
        if (
          selectedFilters.cabinClasses.length > 0 &&
          !firstSegment.segment.some((segment) =>
            selectedFilters.cabinClasses.includes(segment.cabinClass)
          )
        ) {
          return false;
        }

        // Filter by carrier
        if (
          selectedFilters.carrier.length > 0 &&
          !selectedFilters.carrier.includes(result.isLCC)
        ) {
          return false;
        }

        return true;
      });
      const sortedResults = sortFlights(
        sortingCriteria.criteria,
        sortingCriteria.order,
        filteredResults
      );
      setFlightsResponse(sortedResults);
      if (shouldClose) {
        onClose();
      }
    }
  };

  const clearFilters = () => {
    setRange([filterData.price.min, filterData.price.max]);
    if (wayType === "multicity") {
      setSelectedFilters((prevFilters) => {
        const updatedFilters = [...prevFilters];
        updatedFilters[destinationIndex] = {
          stops: [],
          airlines: [],
          layovers: [],
          destinations: [],
          arrivals: [],
          price: {},
          cabinClasses: [],
          carrier: [],
        };
        return updatedFilters;
      });

      setFlightsResponse(flightsResponse);
    } else {
      setSelectedFilters({
        stops: [],
        airlines: [],
        layovers: [],
        destinations: [],
        arrivals: [],
        price: {},
        cabinClasses: [],
        carrier: [],
      });
      setFlightsResponse((prev) => ({
        ...prev,
        ...originalResults,
      }));
    }
    onClose();
  };

  const handleFilterChange = (filterType, values) => {
    if (wayType === "multicity") {
      setSelectedFilters((prevFilters) => {
        const updatedFilters = [...prevFilters];
        updatedFilters[destinationIndex] = {
          ...updatedFilters[destinationIndex],
          [filterType]: values,
        };
        return updatedFilters;
      });
    } else {
      setSelectedFilters((prevFilters) => ({
        ...prevFilters,
        [filterType]: values,
      }));
    }
  };

  const handleStopChange = (index) => {
    handleFilterChange(
      "stops",
      selectedFilters.stops.includes(index)
        ? selectedFilters.stops.filter((stop) => stop !== index)
        : [...selectedFilters.stops, index]
    );
    logEvent(analytics, "flight_stops", {});
  };

  const handleAirlineChange = (airlineCode) => {
    handleFilterChange(
      "airlines",
      selectedFilters.airlines.includes(airlineCode)
        ? selectedFilters.airlines.filter(
            (selectedAirline) => selectedAirline !== airlineCode
          )
        : [...selectedFilters.airlines, airlineCode]
    );

    logEvent(analytics, "flight_airlines", {
      airlines: airlineCode,
    });
  };

  const handleLayoverChange = (airportCode) => {
    handleFilterChange(
      "layovers",
      selectedFilters.layovers.includes(airportCode)
        ? selectedFilters.layovers.filter(
            (selectedLayover) => selectedLayover !== airportCode
          )
        : [...selectedFilters.layovers, airportCode]
    );
    logEvent(analytics, "flight_layovers", {
      layOvers: airportCode,
    });
  };

  const handleDestinationChange = (airportCode) => {
    handleFilterChange(
      "destinations",
      selectedFilters.destinations.includes(airportCode)
        ? selectedFilters.destinations.filter(
            (selectedDestination) => selectedDestination !== airportCode
          )
        : [...selectedFilters.destinations, airportCode]
    );
    logEvent(analytics, "flights_destination", {
      destination: airportCode,
    });
  };

  const handleArrivalChange = (airportCode) => {
    handleFilterChange(
      "arrivals",
      selectedFilters.arrivals.includes(airportCode)
        ? selectedFilters.arrivals.filter(
            (selectedArrival) => selectedArrival !== airportCode
          )
        : [...selectedFilters.arrivals, airportCode]
    );
    logEvent(analytics, "flights_arrival", {
      arrival: airportCode,
    });
  };

  const handleCarrierChange = (carrierCode) => {
    handleFilterChange(
      "carrier",
      selectedFilters.carrier.includes(carrierCode)
        ? selectedFilters.carrier.filter(
            (selectedCarrier) => selectedCarrier !== carrierCode
          )
        : [...selectedFilters.carrier, carrierCode]
    );
    logEvent(analytics, "flights_carrier", {
      carrier: carrierCode,
    });
  };

  const handleCabinClassChange = (cabinClassCode) => {
    handleFilterChange(
      "cabinClasses",
      selectedFilters.cabinClasses.includes(cabinClassCode)
        ? selectedFilters.cabinClasses.filter(
            (selectedCabinClass) => selectedCabinClass !== cabinClassCode
          )
        : [...selectedFilters.cabinClasses, cabinClassCode]
    );
    logEvent(analytics, "flights_cabinclass", {
      cabinClass: cabinClassCode,
    });
  };

  const handlePriceRangeChange = (event, newValue) => {
    setRange(newValue);
    if (wayType === "multicity") {
      setSelectedFilters((prevFilters) => {
        const updatedFilters = [...prevFilters];
        updatedFilters[destinationIndex] = {
          ...updatedFilters[destinationIndex],
          price: {
            min: newValue[0],
            max: newValue[1],
          },
        };
        return updatedFilters;
      });
    } else {
      setSelectedFilters((prevFilters) => ({
        ...prevFilters,
        price: {
          min: newValue[0],
          max: newValue[1],
        },
      }));
    }
    logEvent(analytics, "flights_price", {
      minPrice: newValue[0],
      maxPrice: newValue[1],
    });
  };

  const formatPrice = (price) => {
    if (price) {
      return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    }
  };

  if (!filterData && !flightsResponse) {
    return;
  }

  return (
    <>
      {isOpen && (
        <>
          <div className={style.backdrop} onClick={onClose}></div>
          <div className={style.bottomSheet}>
            <div className={style.filterSheetHead}>
              <h2
                className={style.headFiltersBottom}
                style={{ color: "#155EEF" }}
              >
                Filters for your best search
              </h2>
              <button className={style.crossBtn} onClick={() => onClose(false)}>
                <FontAwesomeIcon icon={faXmark} />
              </button>
            </div>
            <div className={style.fromToDetails}>
              <button className={style.filterbutton}>
                {wayType && wayType === "multicity"
                  ? flightsRequest.multiCityDestinations?.[destinationIndex]
                      ?.fromCityCode
                  : flightsRequest.searchReqData.segments[0].origin}
                <FontAwesomeIcon icon={faMinus} />
                {wayType && wayType === "multicity"
                  ? flightsRequest.multiCityDestinations?.[destinationIndex]
                      ?.toCityCode
                  : flightsRequest.searchReqData.segments[0].destination}
              </button>
            </div>
            <div className={style.scrollFiltersContent}>
              {/* corporate travel policy */}
              {isCorporate && (
                <div className={style.priceSliderContainer}>
                  <div className="text-sm">Travel Policy</div>
                  <div className="flex justify-between items-center mt-3">
                    <div className="flex">
                      <label class="inline-flex items-center cursor-pointer">
                        <input type="checkbox" value="" class="sr-only peer" />
                        <div class="relative w-11 h-6 bg-gray-200 rounded-full peer dark:bg-gray-300 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#155EEF]"></div>
                      </label>
                    </div>
                    <div className="text-xs">In-policy options only</div>
                  </div>
                </div>
              )}

              {/* price container */}
              <div className={style.priceSliderContainer}>
                <div>Price</div>
                <div style={{ padding: "4%" }}>
                  <Slider
                    value={range}
                    onChange={handlePriceRangeChange}
                    valueLabelDisplay="auto"
                    min={filterData?.price.min}
                    max={filterData?.price?.max}
                    step={1}
                  />
                </div>
                <div
                  style={{ display: "flex", justifyContent: "space-between" }}
                >
                  <div>
                    <span style={{ fontWeight: "600" }}>Min:</span>
                    <span>{range[0]}</span>
                  </div>
                  <div>
                    <span style={{ fontWeight: "600" }}>Max:</span>
                    <span>{range[1]}</span>
                  </div>
                </div>
              </div>
              {/* stops container */}
              <div className={style.stopsContainer}>
                <div>Stops</div>
                <div className={style.stopsSwitches}>
                  {Array.from(
                    {
                      length:
                        filterData?.stops?.max - filterData?.stops?.min + 1,
                    },
                    (_, index) => {
                      const stopCount = filterData?.stops?.min + index;

                      return (
                        <>
                          <label className={style.stops} key={index}>
                            <input
                              type="checkbox"
                              className={style.inpt}
                              checked={selectedFilters.stops.includes(
                                stopCount
                              )}
                              onChange={() => handleStopChange(stopCount)}
                            />
                            {stopCount === 0
                              ? "Non-stop"
                              : `${stopCount} stop${stopCount > 1 ? "s" : ""}`}
                          </label>
                          {index <
                            filterData.stops.max - filterData.stops.min && (
                            <hr className={style.horizontalRule} />
                          )}
                        </>
                      );
                    }
                  )}
                </div>
              </div>

              {/* airlines container */}
              <div className={style.airlinesContainer}>
                <div>Preferred Airlines</div>
                <div className={style.airlineScroll}>
                  {filterData.airlines.map((airline) => (
                    <label
                      className={style.checkboxRow}
                      key={airline.airlineCode}
                    >
                      <div style={{ display: "flex", gap: "8px" }}>
                        <input
                          className={style.input2}
                          type="checkbox"
                          id={airline.airlineCode}
                          checked={selectedFilters.airlines.includes(
                            airline.airlineCode
                          )}
                          onChange={() =>
                            handleAirlineChange(airline.airlineCode)
                          }
                        />
                        <Image
                          src={airline.airlineLogoUrl}
                          alt="logo"
                          width={20}
                          height={20}
                        />
                        <span
                          className={style.greyText}
                        >{`${airline.airlineName} (${airline.noOfFlights})`}</span>
                      </div>
                      <span className={style.greyText}>
                        ₹ {formatPrice(Math.round(airline.minPrice))}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* {cabinClass container} */}

              <div className={style.cabinContainer}>
                <div>Cabin Classes</div>
                {filterData.cabinClasses.map((cabinClass) => (
                  <label
                    className={style.checkboxRow1}
                    key={cabinClass.cabinClassCode}
                  >
                    <input
                      className={style.cursore}
                      type="checkbox"
                      checked={selectedFilters.cabinClasses.includes(
                        cabinClass.cabinClassCode
                      )}
                      onChange={() =>
                        handleCabinClassChange(cabinClass.cabinClassCode)
                      }
                    />
                    <span className={style.greyText}>
                      {cabinClass.cabinClassName}
                    </span>
                  </label>
                ))}
              </div>

              {/* {carrier container} */}

              <div className={style.carrierContainer}>
                <div>Carrier</div>
                {filterData.carrier.map((carrierType) => (
                  <label
                    className={style.checkboxRow1}
                    key={carrierType.carrierTypeName}
                  >
                    <input
                      className={style.cursore}
                      type="checkbox"
                      checked={selectedFilters.carrier.includes(
                        carrierType.carrierTypeValue
                      )}
                      onChange={() =>
                        handleCarrierChange(carrierType.carrierTypeValue)
                      }
                    />
                    <span className={style.greyText}>
                      {carrierType.carrierTypeName}
                    </span>
                  </label>
                ))}
              </div>

              {/* Layover Container */}
              <div className={style.layoverContainer}>
                <div>Layover</div>

                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "1px",
                    maxHeight: "200px",
                    overflowY: "auto",
                  }}
                  className={style.layoverScroll}
                >
                  {filterData.layOvers.map((layover) => (
                    <label
                      className={style.checkboxRows}
                      key={layover.airportCode}
                    >
                      <div style={{ display: "flex", gap: "10px" }}>
                        <input
                          className={style.input2}
                          type="checkbox"
                          id={layover.airportCode}
                          checked={selectedFilters.layovers.includes(
                            layover.airportCode
                          )}
                          onChange={() =>
                            handleLayoverChange(layover.airportCode)
                          }
                        />
                        <span className={style.greyText}>
                          {layover.city} ({layover.airportCode})
                        </span>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* destination airport container */}
              <div className={style.destAirportContainer}>
                <div>Arrival Airport</div>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "1px",
                  }}
                >
                  {filterData.destinations.map((destination) => (
                    <label
                      className={style.checkboxRows}
                      key={destination.airportCode}
                    >
                      <div style={{ display: "flex", gap: "10px" }}>
                        <input
                          className={style.input2}
                          type="checkbox"
                          id={destination.airportCode}
                          checked={selectedFilters.destinations.includes(
                            destination.airportCode
                          )}
                          onChange={() =>
                            handleDestinationChange(destination.airportCode)
                          }
                        />
                        <span className={style.greyText}>
                          {`${destination.airportName} (${destination.airportCode})`}
                        </span>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* arrival airport Container */}
              <div className={style.destAirportContainer}>
                <div>Departure Airport</div>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "1px",
                  }}
                >
                  {filterData.origins.map((origin) => (
                    <label
                      className={style.checkboxRows}
                      key={origin.airportCode}
                    >
                      <div style={{ display: "flex", gap: "10px" }}>
                        <input
                          className={style.input2}
                          type="checkbox"
                          id={origin.airportCode}
                          checked={selectedFilters.arrivals.includes(
                            origin.airportCode
                          )}
                          onChange={() =>
                            handleArrivalChange(origin.airportCode)
                          }
                        />
                        <span className={style.greyText}>
                          {`${origin.airportName} (${origin.airportCode})`}
                        </span>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            </div>
            {/* Cancel and apply filter button */}

            {type !== "all" && (
              <div className={style.cancelApplyContainer}>
                <button
                  className={style.filtersBtn}
                  style={{
                    backgroundColor: "#878786",
                  }}
                  onClick={clearFilters}
                  disabled={
                    Object.values(selectedFilters).flat().length === 0 &&
                    range[0] === filterData?.price?.min &&
                    range[1] === filterData?.price?.max
                  }
                >
                  {/* Cancel */}
                  Clear
                </button>
                <button
                  className={style.filtersBtn}
                  style={{ backgroundColor: "#155EEF" }}
                  onClick={() =>
                    wayType && wayType === "multicity"
                      ? applyMultiCityFilters(true)
                      : applyFilters(true)
                  }
                  disabled={
                    Object.values(selectedFilters).flat().length === 0 &&
                    range[0] === filterData?.price?.min &&
                    range[1] === filterData?.price?.max
                  }
                >
                  Apply Filter
                </button>
              </div>
            )}
          </div>
        </>
      )}
    </>
  );
};

export default FiltersPop;
