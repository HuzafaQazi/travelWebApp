import { faMinus, faXmark } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Slider } from "@mui/material";
import pako from "pako";
import { useEffect, useState } from "react";
import {getTabSpecificData} from "@/utils/axios/axios";
import style from "./styles.module.css";
import Image from "next/image";
import { logEvent } from "firebase/analytics";
import { analytics } from "../../../../utils/firebase";

const FiltersPop1 = ({
  isOpen,
  onClose,
  filterData,
  flightsResponse,
  setFlightsResponse,
  selectedFilters,
  setSelectedFilters,
  flightsRequest,
  type,
  setFilterData,
  activeButton,
  setActiveButton,
  sortingCriteria,
  setSortingCriteria,
  sortFlights,
  setTmpFlights,
  tmpFlights,
  selectedFlight,
  handleDivClick,
  handleDivClick1,
  areAnyFiltersDefined,
  outboundCheckboxIndex,
  inboundCheckboxIndex,
  dataToFilter,
  selectedFlightResponse,
}) => {
  // filters time change on hover
  const [hoveredTimeBox, setHoveredTimeBox] = useState(null);
  const [originalResults, setOriginalResults] = useState([]);
  const [inboundFlights, setInboundFlights] = useState(null);
  const [outboundFlights, setOutboundFlights] = useState(null);
  const [selectedTab, setSelectedTab] = useState("outbound");

  const handleTabClick = (tab) => {
    setSelectedTab(tab);
  };

  const handleMouseEnter = (timeBox) => {
    setHoveredTimeBox(timeBox);
  };

  const handleMouseLeave = () => {
    setHoveredTimeBox(null);
  };

  const [range, setRange] = useState([
    filterData?.price?.min || selectedFilters?.price?.min,
    filterData?.price?.max || selectedFilters?.price?.max,
  ]);

  useEffect(() => {
    const compressedData = getTabSpecificData("twoWayFlightResponse");
    const numbersArray = compressedData.split(",").map(Number);

    const compressedUint8Array = new Uint8Array(numbersArray);

    const encodedResponse = pako.inflate(compressedUint8Array, {
      to: "string",
    });

    if (encodedResponse) {
      // Decode from base64
      const decodedResponse = JSON.parse(encodedResponse);
      const outboundFlights = decodedResponse.flightsResults[0];
      const inboundFlights = decodedResponse.flightsResults[1];
      setOutboundFlights(outboundFlights);
      setInboundFlights(inboundFlights);
      setOriginalResults(decodedResponse);
      setRange([
        selectedFilters?.price?.min || filterData?.price?.min,
        selectedFilters?.price?.max || filterData?.price?.max,
      ]);
    }
  }, [selectedFilters, filterData]);

  useEffect(() => {
    if (isOpen && (outboundFlights || inboundFlights) && range) {
      let filteredFlights;
      let filterType, sortType, func, index, index1;
      if (type === "all") {
        if (activeButton === "fromTo") {
          filteredFlights = outboundFlights.flights;
          filterType = "outbound";
          sortType = 1;
          func = handleDivClick1;
          index = outboundCheckboxIndex;
          index1 = inboundCheckboxIndex;
        } else if (activeButton === "toFrom") {
          filteredFlights = inboundFlights?.flights;
          filterType = "inbound";
          sortType = 2;
          func = handleDivClick;
          index = inboundCheckboxIndex;
          index1 = outboundCheckboxIndex;
        }
        applyDesktopFilters(
          false,
          filteredFlights,
          filterType,
          sortType,
          func,
          index,
          index1
        );
      } else {
        if (type === "outbound") {
          filteredFlights = outboundFlights.flights;
          sortType = 1;
          func = handleDivClick1;
          index = outboundCheckboxIndex;
          index1 = inboundCheckboxIndex;
        } else if (type === "inbound") {
          filteredFlights = inboundFlights.flights;
          sortType = 2;
          func = handleDivClick;
          index = inboundCheckboxIndex;
          index1 = outboundCheckboxIndex;
        }
        applyFilters(false, filteredFlights, sortType, func, index, index1);
      }
    }
  }, [range, outboundFlights, inboundFlights]);

  const applyFilters = (
    shouldClose = false,
    filteredFlights,
    sortType,
    callBack,
    index,
    index1
  ) => {
    if (filteredFlights) {
      const filteredResults = filteredFlights?.filter((result) => {
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
        filteredResults,
        sortType
      );

      setFlightsResponse(
        type,
        sortedResults,
        outboundFlights.flights,
        inboundFlights.flights
      );

      if (callBack) {
        let indexToBeSet = index || 0;
        let updatedSelectedFlight = selectedFlightResponse;
        const findSelectedFlight = sortedResults.find(
          (flight) => flight.resultIndex === selectedFlightResponse?.resultIndex
        );
        if (!findSelectedFlight) {
          updatedSelectedFlight = sortedResults[0];
          indexToBeSet = 0;
          index1 = 0;
        }
        callBack(updatedSelectedFlight, indexToBeSet, false, index1);
      }

      if (shouldClose) {
        onClose();
      }
    }
  };

  const applyDesktopFilters = (
    shouldClose = false,
    filteredFlights,
    type,
    sortType,
    callBack,
    index,
    index1
  ) => {
    if (filteredFlights) {
      const filteredResults = filteredFlights?.filter((result) => {
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
        filteredResults,
        sortType
      );

      setFlightsResponse(
        type,
        sortedResults,
        outboundFlights?.flights,
        inboundFlights?.flights
      );
      if (callBack) {
        let indexToBeSet = index || 0;
        let updatedSelectedFlight = selectedFlightResponse;
        const findSelectedFlight = sortedResults.find(
          (flight) => flight.resultIndex === selectedFlightResponse?.resultIndex
        );
        if (!findSelectedFlight) {
          updatedSelectedFlight = sortedResults[0];
          indexToBeSet = 0;
          index1 = 0;
        }
        callBack(updatedSelectedFlight, indexToBeSet, false, index1);
      }
      if (shouldClose) {
        onClose();
      }
    }
  };

  const clearFilters = () => {
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
    setRange([filterData?.price?.min, filterData?.price?.max]);
    if (type === "outbound") {
      setFlightsResponse(type, outboundFlights.flights);
    } else if (type === "inbound") {
      setFlightsResponse(type, inboundFlights.flights);
    } else if (type === "all") {
      let type, result;

      if (activeButton === "fromTo") {
        type = "outbound";
        result = outboundFlights;
      } else {
        type = "inbound";
        result = inboundFlights;
      }
      setFlightsResponse(type, result.flights);
    }
    onClose();
  };

  const handleFilterChange = (filterType, values) => {
    setSelectedFilters((prevFilters) => ({
      ...prevFilters,
      [filterType]: values,
    }));
  };

  const handleStopChange = (index) => {
    handleFilterChange(
      "stops",
      selectedFilters.stops.includes(index)
        ? selectedFilters.stops.filter((stop) => stop !== index)
        : [...selectedFilters.stops, index]
    );
    logEvent(analytics, "tw_flight_stops", {});
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
    logEvent(analytics, "tw_flight_airlines", {
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
    logEvent(analytics, "tw_flight_layovers", {
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
    logEvent(analytics, "tw_flights_destination", {
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
    logEvent(analytics, "tw_flights_arrival", {
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
    logEvent(analytics, "tw_flights_carrier", {
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
    logEvent(analytics, "tw_flights_cabinclass", {
      cabinClass: cabinClassCode,
    });
  };

  const handlePriceRangeChange = (event, newValue) => {
    setRange(newValue);
    setSelectedFilters((prevFilters) => ({
      ...prevFilters,
      price: {
        min: newValue[0],
        max: newValue[1],
      },
    }));
    logEvent(analytics, "tw_flights_price", {
      minPrice: newValue[0],
      maxPrice: newValue[1],
    });
  };

  const formatPrice = (price) => {
    if (price) {
      return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    }
  };

  const handleButtonClick = (button) => {
    let type;
    if (button === "fromTo") {
      type = "outbound";
    } else {
      type = "inbound";
    }

    logEvent(analytics, "tw_button_click", {
      button: button,
      type: type,
    });
    // setFilterData(type);
    setActiveButton(button);
    setSortingCriteria((prev) => ({
      ...prev,
      type,
    }));
  };

  return (
    <>
      {isOpen && (
        <>
          <div className={style.backdrop} onClick={onClose}></div>
          <div className={style.bottomSheet}>
            <div className={style.filterSheetHead}>
              <h2
                className={style.headFiltersBottom}
                style={{ color: "#028fa3" }}
              >
                Filters for your best search
              </h2>
              <button className={style.crossBtn} onClick={() => onClose(false)}>
                <FontAwesomeIcon icon={faXmark} />
              </button>
            </div>
            {type === "all" && (
              <div className={style.fromToDetails}>
                <button
                  className={
                    activeButton === "fromTo"
                      ? style.filterbuttonActive
                      : style.filterbutton
                  }
                  onClick={() => handleButtonClick("fromTo")}
                >
                  {flightsRequest?.searchReqData?.segments?.[0]?.origin}
                  <FontAwesomeIcon icon={faMinus} />
                  {flightsRequest?.searchReqData?.segments?.[0]?.destination}
                </button>
                <button
                  className={
                    activeButton === "toFrom"
                      ? style.filterbuttonActive
                      : style.filterbutton
                  }
                  onClick={() => handleButtonClick("toFrom")}
                >
                  {flightsRequest.searchReqData?.segments?.[1]?.origin}
                  <FontAwesomeIcon icon={faMinus} />
                  {flightsRequest.searchReqData?.segments?.[1]?.destination}
                </button>
              </div>
            )}
            <div className={style.scrollFiltersContent}>

              {/* price container */}
              <div className={style.priceSliderContainer}>
                <div className={style.topic}>Price</div>
                <div style={{ padding: "4%" }}>
                  <Slider
                    value={range}
                    onChange={handlePriceRangeChange}
                    valueLabelDisplay="auto"
                    min={filterData?.price?.min}
                    max={filterData?.price?.max}
                    step={1}
                  />
                </div>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    color: "black",
                  }}
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
                <div className={style.stops1}>Stops</div>
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
                            filterData?.stops?.max - filterData?.stops?.min && (
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
                <div className={style.stops1}>Preferred Airlines</div>
                <div className={style.airlineScroll}>
                  {filterData?.airlines?.map((airline) => (
                    <label
                      className={style.checkboxRow}
                      key={airline.airlineCode}
                    >
                      <div
                        style={{
                          display: "flex",
                          gap: "8px",
                          cursor: "pointer",
                        }}
                      >
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
                          alt={airline.airlineName}
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
                <div className={style.stops1}>Cabin Classes</div>
                {filterData?.cabinClasses?.map((cabinClass) => (
                  <label
                    className={style.checkboxRow1}
                    key={cabinClass.cabinClassCode}
                  >
                    <input
                      className={style.input2}
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

              <div className={style.carrierContainer}>
                <div className={style.stops1}>Carrier</div>
                {filterData?.carrier?.map((carrierType) => (
                  <label
                    className={style.checkboxRow1}
                    key={carrierType.carrierTypeName}
                  >
                    <input
                      className={style.input2}
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
                <div className={style.stops1}>Layover</div>

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
                  {filterData?.layOvers?.map((layover) => (
                    <label
                      className={style.checkboxRows}
                      key={layover.airportCode}
                    >
                      <div
                        style={{
                          display: "flex",
                          gap: "10px",
                          cursor: "pointer",
                        }}
                      >
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
                <div className={style.stops1}>Arrival Airport</div>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "1px",
                  }}
                >
                  {filterData?.destinations?.map((destination) => (
                    <label
                      className={style.checkboxRows}
                      key={destination.airportCode}
                    >
                      <div
                        style={{
                          display: "flex",
                          gap: "10px",
                          cursor: "pointer",
                        }}
                      >
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
                <div className={style.stops1}> Departure Airport</div>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "1px",
                  }}
                >
                  {filterData?.origins?.map((origin) => (
                    <label
                      className={style.checkboxRows}
                      key={origin.airportCode}
                    >
                      <div
                        style={{
                          display: "flex",
                          gap: "10px",
                          cursor: "pointer",
                        }}
                      >
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
                  style={{ backgroundColor: "#028FA3" }}
                  onClick={() =>
                    type === "all"
                      ? applyDesktopFilters(true)
                      : applyFilters(
                          true,
                          type === "outbound"
                            ? outboundFlights.flights
                            : inboundFlights.flights,
                          type === "outbound" ? 1 : 2,
                          type === "outbound" ? handleDivClick1 : handleDivClick
                        )
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

export default FiltersPop1;
