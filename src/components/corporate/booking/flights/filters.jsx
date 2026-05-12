import { faMinus } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSun, faMoon, faCloudSun } from "@fortawesome/free-solid-svg-icons";
import { useEffect, useMemo, useState } from "react";
import { Slider } from "@mui/material";
import pako from "pako";
import Image from "next/image";
import { logEvent } from "firebase/analytics";
import { analytics } from "@/utils/firebase";
import Select from "react-select";
import { TRAVEL_CATEGORIES } from "@/utils/constants";
import { constructOutOfPolicyEmployees } from "@/utils/corporate/travelPolicy";
import { getTabSpecificData, setTabSpecificData } from "@/utils/axios/axios";

const Filters = ({
  isOpen,
  onClose,
  filterData,
  flightsResponse,
  setFlightsResponse,
  response,
  selectedFilters,
  setSelectedFilters,
  type,
  flightsRequest,
  sortingCriteria,
  sortFlights,
  wayType,
  destinationIndex,
  isCorporate,
  setMulticityFlightsResponse,
  filterIndex,
  multicityFlightsResponse,
  flightsSelected,
  setFlightsSelected,
  activeSegment,
  regionId,
  activeTab,
  handleTabChange,
  selectedIndex,
  setSelectedIndex,
  onFilteredResultsChange,
  setflightsSelected,
  isInternationalFlight,
  fetchFlightsWithRefId,
  setMulticityResponse,
  setFilterData,
  isFooterNear,
}) => {
  // filters time change on hover
  const [originalResults, setOriginalResults] = useState([]);
  // const [selectedIndex, setSelectedIndex] = useState(0);
  const [isSpecificTimeframe, setIsSpecificTimeframe] = useState(false);
  const [isSpecificTimeframe1, setIsSpecificTimeframe1] = useState(false);
  const [timeRangeOptions, setTimeRangeOptions] = useState([]);
  const [departureTimeRange, setDepartureTimeRange] = useState([]);
  const [arrivalTimeRange, setArrivalTimeRange] = useState([]);
  const [disableDepApplyButton, setDisableDepApplyButton] = useState(false);
  const [disableArrApplyButton, setDisableArrApplyButton] = useState(false);

  useEffect(() => {
    let options = [];
    let i = 0;
    for (let hour = 0; hour < 24; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const formattedTime = `${String(hour).padStart(2, "0")}:${String(
          minute
        ).padStart(2, "0")}`;
        options.push({
          label: formattedTime,
          value: formattedTime,
          id: i,
        });
        i += 1;
      }
    }
    setTimeRangeOptions(options);
  }, []);

  const timeframes = [
    { value: "00:00-06:00", label: "Before 6 AM", icon: faSun },
    { value: "06:00-12:00", label: "6 AM - 12 PM", icon: faSun },
    { value: "12:00-18:00", label: "12 PM - 6 PM", icon: faCloudSun },
    { value: "18:00-23:59", label: "After 6 PM", icon: faMoon },
  ];

  const hasActiveFilters = () => {
    const currentFilters = selectedFilters?.[selectedIndex]?.[filterIndex];
    if (!currentFilters || !filterData?.[selectedIndex]) return false;

    // Check if any filter arrays have values
    if (currentFilters.stops?.length > 0) return true;
    if (currentFilters.airlines?.length > 0) return true;
    if (currentFilters.layovers?.length > 0) return true;
    if (currentFilters.destinations?.length > 0) return true;
    if (currentFilters.arrivals?.length > 0) return true;
    if (currentFilters.cabinClasses?.length > 0) return true;
    if (currentFilters.carrier?.length > 0) return true;
    if (currentFilters.departureTime?.length > 0) return true;
    if (currentFilters.arrivalTime?.length > 0) return true;
    if (currentFilters.inPolicyOnly) return true;

    // Check if price range is different from default
    const defaultMinPrice = filterData[selectedIndex]?.price?.min || 0;
    const defaultMaxPrice = filterData[selectedIndex]?.price?.max || 100000;
    if (currentFilters.price && Object.keys(currentFilters.price).length > 0) {
      if (
        currentFilters.price?.min !== defaultMinPrice ||
        currentFilters.price?.max !== defaultMaxPrice
      ) {
        return true;
      }
    }

    // Check if duration range is different from default
    const defaultMinDuration = filterData[selectedIndex]?.duration?.min || 0;
    const defaultMaxDuration = filterData[selectedIndex]?.duration?.max || 1440;
    if (
      currentFilters.duration &&
      Object.keys(currentFilters.duration).length > 0
    ) {
      if (
        currentFilters.duration?.min !== defaultMinDuration ||
        currentFilters.duration?.max !== defaultMaxDuration
      ) {
        return true;
      }
    }

    // Check refund filters
    if (
      currentFilters.refund?.refundable ||
      currentFilters.refund?.nonRefundable
    ) {
      return true;
    }

    return false;
  };

  const applySortingOnly = () => {
    if (!originalResults?.flightsResults) return;

    const sortedResults = sortFlights
      ? sortFlights(originalResults.flightsResults)
      : originalResults.flightsResults;

    setFlightsResponse((prev) => ({
      ...prev,
      flightsResults: sortedResults,
    }));

    if (onFilteredResultsChange) {
      onFilteredResultsChange(selectedIndex, sortedResults[selectedIndex]);
    }
  };

  const isValidSelection = (selectedFlight, flightResults) => {
    if (!selectedFlight?.resultIndex) return false;

    return flightResults.some((flight) => {
      // Check if the main flight matches
      if (flight.resultIndex === selectedFlight.resultIndex) {
        return true;
      }

      // Check if any fare classification matches (for ViewPrice selections)
      return flight.fareClassification?.some(
        (fare) => fare.resultIndex === selectedFlight.resultIndex
      );
    });
  };

  const handleSelect = (time) => {
    if (!isSpecificTimeframe) {
      setDepartureTimeRange([timeRangeOptions[0], timeRangeOptions[0]]);
    } else {
      setSelectedFilters((prevFilters) => {
        const updatedFilters = [...prevFilters];
        if (
          updatedFilters?.[selectedIndex]?.[
            filterIndex
          ]?.departureTime.includes(
            departureTimeRange?.[0]?.value +
              "-" +
              departureTimeRange?.[1]?.value
          )
        ) {
          updatedFilters[selectedIndex][filterIndex].departureTime =
            updatedFilters[selectedIndex][filterIndex].departureTime.filter(
              (t) =>
                t !==
                departureTimeRange[0].value + "-" + departureTimeRange[1].value
            );
        }
        return updatedFilters;
      });
      setDepartureTimeRange([]);
    }
    setIsSpecificTimeframe(!isSpecificTimeframe);
  };

  const handleSelect1 = (time) => {
    if (!isSpecificTimeframe1) {
      setArrivalTimeRange([timeRangeOptions[0], timeRangeOptions[0]]);
    } else {
      setSelectedFilters((prevFilters) => {
        const updatedFilters = [...prevFilters];
        if (
          updatedFilters[selectedIndex][filterIndex].arrivalTime.includes(
            arrivalTimeRange[0].value + "-" + arrivalTimeRange[1].value
          )
        ) {
          updatedFilters[selectedIndex][filterIndex].arrivalTime =
            updatedFilters[selectedIndex][filterIndex].arrivalTime.filter(
              (t) =>
                t !==
                arrivalTimeRange[0].value + "-" + arrivalTimeRange[1].value
            );
        }
        return updatedFilters;
      });
      setArrivalTimeRange([]);
    }
    setIsSpecificTimeframe1(!isSpecificTimeframe1);
  };

  const [range, setRange] = useState(() => [
    selectedFilters?.[selectedIndex]?.[filterIndex]?.price?.min ||
      filterData?.[selectedIndex]?.price?.min ||
      0,
    selectedFilters?.[selectedIndex]?.[filterIndex]?.price?.max ||
      filterData?.[selectedIndex]?.price?.max ||
      100000,
  ]);

  const [durationRange, setDurationRange] = useState(() => [
    selectedFilters?.[selectedIndex]?.[filterIndex]?.duration?.min ||
      filterData?.[selectedIndex]?.duration?.min ||
      0,
    selectedFilters?.[selectedIndex]?.[filterIndex]?.duration?.max ||
      filterData?.[selectedIndex]?.duration?.max ||
      1440,
  ]);

  useEffect(() => {
    setRange([
      filterData?.[selectedIndex]?.price?.min ||
        selectedFilters?.[selectedIndex]?.[filterIndex]?.price?.min ||
        filterData?.[selectedIndex]?.price?.max ||
        selectedFilters?.[selectedIndex]?.[filterIndex]?.price?.max,
    ]);
  }, [activeSegment]);

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
        if (flightsRequest.searchReqData.journeyType === "3") {
          const compressedmulticityData =
            getTabSpecificData("multicityFlights");
          if (compressedmulticityData) {
            const numbersmulticityArray = compressedmulticityData
              .split(",")
              .map(Number);
            const compressedmulticityUint8Array = new Uint8Array(
              numbersmulticityArray
            );
            const multicityEncodedResponse = pako.inflate(
              compressedmulticityUint8Array,
              {
                to: "string",
              }
            );
            if (multicityEncodedResponse) {
              const multicityDecodedResponse = JSON.parse(
                multicityEncodedResponse
              );
              setOriginalResults(multicityDecodedResponse[filterIndex]);
            }
          }
        } else {
          setOriginalResults(decodedResponse);
        }

        setRange([
          selectedFilters[selectedIndex]?.[filterIndex]?.price?.min ||
            filterData[selectedIndex]?.price?.min,
          selectedFilters[selectedIndex]?.[filterIndex]?.price?.max ||
            filterData[selectedIndex]?.price?.max,
        ]);
        setDurationRange([
          selectedFilters[selectedIndex]?.[filterIndex]?.duration?.min ||
            filterData[selectedIndex]?.duration?.min,
          selectedFilters[selectedIndex]?.[filterIndex]?.duration?.max ||
            filterData[selectedIndex]?.duration?.max,
        ]);
      }
    } else {
      console.error("No flightResponse found in localStorage");
    }
  }, [selectedFilters, filterData, selectedIndex, filterIndex]);

  useEffect(() => {
    let size = originalResults?.length;
    if (type === "all") {
      size = originalResults?.flightsResults?.length;
    }
    if (isOpen && size > 0 && type === "all") {
      // const hasFilters = hasActiveFilters();
      // if (hasFilters) {
      //   console.log("Applying filters because active filters detected");
      //   applyFilters();
      // } else if (sortingCriteria) {
      //   // If no filters but sorting criteria exists, apply sorting only
      //   console.log("Applying sorting only (no active filters)");
      //   applySortingOnly();
      // }

      applyFilters();
    }
    if (wayType === "multicity") {
      applyMultiCityFilters();
    }
  }, [range, durationRange, selectedFilters, originalResults, sortingCriteria]);

  const applyFilters = async (shouldClose = false) => {
    const filteredResults = originalResults.flightsResults.map(
      (flightResult, index) => {
        const filteredFlights = flightResult.flights.filter((result) => {
          const segments = result.segments[0];
          if (Array.isArray(segments)) {
            if (
              selectedFilters[index][filterIndex].stops.length > 0 &&
              !segments.every((segment) =>
                selectedFilters[index][filterIndex].stops.includes(
                  segment.stops
                )
              )
            ) {
              return false;
            }
          } else {
            if (
              selectedFilters?.[index]?.[filterIndex]?.stops?.length > 0 &&
              !selectedFilters?.[index]?.[filterIndex]?.stops?.includes(
                segments.stops
              )
            ) {
              return false;
            }
          }

          // Filter by airlines
          if (
            selectedFilters?.[index]?.[filterIndex]?.airlines?.length > 0 &&
            segments?.segment &&
            !segments?.segment?.some((segment) => {
              return selectedFilters?.[index]?.[
                filterIndex
              ]?.airlines?.includes(segment?.airline?.airlineCode);
            })
          ) {
            return false;
          }

          // Filter by layovers
          if (
            selectedFilters?.[index]?.[filterIndex]?.layovers?.length > 0 &&
            !segments?.segment?.some((segment) =>
              selectedFilters?.[index]?.[filterIndex]?.layovers?.includes(
                segment?.destination?.airport?.cityCode
              )
            )
          ) {
            return false;
          }

          // Filter by destinations
          if (
            selectedFilters?.[index]?.[filterIndex]?.destinations?.length > 0 &&
            !segments?.segment?.some((segment) =>
              selectedFilters?.[index]?.[filterIndex]?.destinations?.includes(
                segment?.destination?.airport?.airportCode
              )
            )
          ) {
            return false;
          }

          // Filter by arrivals
          if (
            selectedFilters?.[index]?.[filterIndex]?.arrivals?.length > 0 &&
            !segments?.segment?.some((segment) =>
              selectedFilters?.[index]?.[filterIndex]?.arrivals?.includes(
                segment?.origin?.airport?.airportCode
              )
            )
          ) {
            return false;
          }

          // Check inPolicyOnly
          const inPolicyOnly =
            selectedFilters?.[index]?.[filterIndex]?.inPolicyOnly || false;

          if (inPolicyOnly) {
            // Check if this flight is out-of-policy
            const outOfPolicyEmployees = constructOutOfPolicyEmployees(
              {
                totalAmount: result?.fare?.offeredFareRoundedOff || 0,
                regionId: regionId,
                corporateEmployees: flightsRequest?.corporateEmployees || [],
                showApprovalReason: false,
              },
              TRAVEL_CATEGORIES.FLIGHTS,
              {
                budgetCheckMethod: "split",
              }
            );
            // If outOfPolicyEmployees.length > 0 => flight is out-of-policy => exclude
            if (outOfPolicyEmployees.length > 0) {
              return false;
            }
          }

          // Filter by price range
          const roundedOffFare = result?.fare?.offeredFareRoundedOff;
          if (
            roundedOffFare <
              selectedFilters?.[index]?.[filterIndex]?.price?.min ||
            roundedOffFare > selectedFilters?.[index]?.[filterIndex]?.price?.max
          ) {
            return false;
          }
          const duration = segments?.journeyDuration;
          if (
            duration < selectedFilters?.[index]?.[filterIndex]?.duration?.min ||
            duration > selectedFilters?.[index]?.[filterIndex]?.duration?.max
          ) {
            return false;
          }

          // Filter by cabin classes
          if (
            selectedFilters?.[index]?.[filterIndex]?.cabinClasses?.length > 0 &&
            !segments?.segment?.some((segment) =>
              selectedFilters?.[index]?.[filterIndex]?.cabinClasses?.includes(
                segment?.cabinClass
              )
            )
          ) {
            return false;
          }

          // Filter by carrier (LCC)
          if (
            selectedFilters?.[index]?.[filterIndex]?.carrier?.length > 0 &&
            !selectedFilters?.[index]?.[filterIndex]?.carrier?.includes(
              result?.isLCC
            )
          ) {
            return false;
          }

          // Filter by Refund (Refundable)
          if (
            !(
              selectedFilters?.[index]?.[filterIndex]?.refund?.refundable &&
              selectedFilters?.[index]?.[filterIndex]?.refund?.nonRefundable
            ) &&
            selectedFilters?.[index]?.[filterIndex]?.refund &&
            ((selectedFilters?.[index]?.[filterIndex]?.refund?.refundable &&
              !result?.isRefundable) ||
              (selectedFilters?.[index]?.[filterIndex]?.refund?.nonRefundable &&
                result?.isRefundable))
          ) {
            return false;
          }

          // Filter by departureTimeRange
          if (
            selectedFilters?.[index]?.[filterIndex]?.departureTime?.length > 0
          ) {
            const departureTime =
              result?.segments[0]?.segment[0]?.origin.depTime;
            const time = departureTime.split("T")[1].substring(0, 5); // Extract "HH:mm"

            // Check if any time range contains the departure time
            const isInRange = selectedFilters[index][
              filterIndex
            ].departureTime.some((timeRange) => {
              const [start, end] = timeRange.split("-");
              return time >= start && time <= end;
            });

            if (!isInRange) {
              return false;
            }
          }

          // Filter by arrivalTimeRange
          if (
            selectedFilters?.[index]?.[filterIndex]?.arrivalTime?.length > 0
          ) {
            let segment = result?.segments[result?.segments.length - 1].segment;
            const arrivalTime =
              segment?.[segment.length - 1]?.destination.arrTime;
            const time = arrivalTime.split("T")[1].substring(0, 5); // Extract "HH:mm"

            // Check if any time range contains the departure time
            const isInRange = selectedFilters[index][
              filterIndex
            ].arrivalTime.some((timeRange) => {
              const [start, end] = timeRange.split("-");
              return time >= start && time <= end;
            });

            if (!isInRange) {
              return false;
            }
          }
          return true;
        });

        // Return the filtered flights for this flightResult
        return {
          ...flightResult,
          flights: filteredFlights,
        };
      }
    );

    const sortedResults = sortFlights
      ? sortFlights(filteredResults)
      : filteredResults;

    // Handle empty results for international flights
    // if (
    //   flightsRequest?.searchReqData?.journeyType === "2" &&
    //   isInternationalFlight
    // ) {
    //   // If departure has no results, clear return results too
    //   if (sortedResults[0]?.flights?.length === 0 && sortedResults.length > 1) {
    //     sortedResults[1] = { ...sortedResults[1], flights: [] };
    //   }
    // }

    // Clear selected flights for segments with no results
    // if (
    //   flightsRequest?.searchReqData?.journeyType === "2" &&
    //   flightsSelected.length >= 2
    // ) {
    //   const updatedFlightsSelected = [...flightsSelected];

    //   sortedResults.forEach((flightResult, segmentIndex) => {
    //     if (flightResult.flights.length === 0) {
    //       updatedFlightsSelected[segmentIndex] = null;
    //     } else if (flightsSelected[segmentIndex]) {
    //       // Existing logic for when flights exist
    //       const currentSelectedFlight = flightsSelected[segmentIndex];
    //       const selectedFlightExists = flightResult.flights.some(
    //         (flight) => flight.resultIndex === currentSelectedFlight.resultIndex
    //       );

    //       if (!selectedFlightExists) {
    //         updatedFlightsSelected[segmentIndex] = flightResult.flights[0];
    //       }
    //     }
    //   });

    //   setflightsSelected(updatedFlightsSelected);
    // }

    // Handle both domestic and international flights
    const isRoundTrip = flightsRequest?.searchReqData?.journeyType === "2";

    // For international flights
    if (isInternationalFlight) {
      const updatedFlightsSelected = [...flightsSelected];
      let hasChanges = false;
      let needsAPICall = false;

      // Handle departure segment (index 0)
      if (sortedResults[0]?.flights?.length > 0) {
        if (flightsSelected[0]) {
          const currentSelectedFlight = flightsSelected[0];
          const selectedFlightExists = isValidSelection(
            currentSelectedFlight,
            sortedResults[0].flights
          );

          if (!selectedFlightExists) {
            // If selected flight is filtered out, select the first available flight
            updatedFlightsSelected[0] = sortedResults[0].flights[0];
            hasChanges = true;
            needsAPICall = isRoundTrip; // Need to fetch return flights for new departure
          }
        } else {
          // No flight currently selected, auto-select first available flight
          updatedFlightsSelected[0] = sortedResults[0].flights[0];
          hasChanges = true;
          needsAPICall = isRoundTrip; // Need to fetch return flights for new departure
        }
      } else {
        // If no flights available, clear selection
        if (flightsSelected[0]) {
          updatedFlightsSelected[0] = null;
          hasChanges = true;
        }
      }

      // Update selection if there are changes
      if (hasChanges) {
        setflightsSelected(updatedFlightsSelected);
      }

      // For round-trip international flights, fetch return flights based on selected departure
      if (needsAPICall && updatedFlightsSelected[0]) {
        try {
          const firstFlightRefId =
            updatedFlightsSelected[0]?.segments?.[0]?.flightSegmentRefId;

          if (firstFlightRefId) {
            console.log("Fetching return flights for refId:", originalResults);
            const response = await fetchFlightsWithRefId(
              originalResults,
              firstFlightRefId,
              "2"
            );

            // Update the flights response with new return flights
            setFlightsResponse(response);

            // Set both departure and return flights
            setflightsSelected([
              updatedFlightsSelected[0], // Keep the selected departure flight
              response?.flightsResults?.[1]?.flights?.[0], // Auto-select first return flight
            ]);

            const updatedFilterData = [
              response.flightsResults[0]?.filterData,
              response.flightsResults[1]?.filterData,
            ].filter(Boolean);

            if (updatedFilterData.length === 2) {
              setFilterData(updatedFilterData);
            }
          }
        } catch (error) {
          console.error("Error fetching return flights:", error);
        }
      }
    }
    // For domestic round trips
    else if (isRoundTrip) {
      const updatedFlightsSelected = [...flightsSelected];
      let hasChanges = false;

      sortedResults.forEach((flightResult, segmentIndex) => {
        if (flightResult.flights.length > 0) {
          // Check if we have a currently selected flight for this segment
          if (flightsSelected[segmentIndex]) {
            const currentSelectedFlight = flightsSelected[segmentIndex];
            const selectedFlightExists = isValidSelection(
              currentSelectedFlight,
              flightResult.flights
            );

            if (!selectedFlightExists) {
              // Selected flight is filtered out, select first available
              updatedFlightsSelected[segmentIndex] = flightResult.flights[0];
              hasChanges = true;
            }
          } else {
            // No flight currently selected for this segment, auto-select first available
            updatedFlightsSelected[segmentIndex] = flightResult.flights[0];
            hasChanges = true;
          }
        } else {
          // No flights available for this segment, clear selection if exists
          if (flightsSelected[segmentIndex]) {
            updatedFlightsSelected[segmentIndex] = null;
            hasChanges = true;
          }
        }
      });

      // Only update if there are actual changes
      if (hasChanges) {
        setflightsSelected(updatedFlightsSelected);
      }
    }
    // For one-way and multi-city flights
    else {
      const isMultiCity = flightsRequest?.searchReqData?.journeyType === "3";

      if (isMultiCity) {
        // Handle multi-city flights - only update the active segment
        const activeSegmentIndex = activeSegment;
        const updatedFlightsSelected = [...flightsSelected];
        let hasChanges = false;
        let needsCascadingAPICalls = false;

        const currentSegmentResults = sortedResults[0];

        // Check if the currently selected flight for the active segment is still valid
        if (currentSegmentResults?.flights?.length > 0) {
          if (flightsSelected[activeSegmentIndex]) {
            const currentSelectedFlight = flightsSelected[activeSegmentIndex];
            const selectedFlightExists = isValidSelection(
              currentSelectedFlight,
              currentSegmentResults.flights
            );

            if (!selectedFlightExists) {
              updatedFlightsSelected[activeSegmentIndex] =
                currentSegmentResults.flights[0];
              hasChanges = true;
              needsCascadingAPICalls = true;
            }
          } else {
            // Auto-select first flight if none selected for active segment
            updatedFlightsSelected[activeSegmentIndex] =
              currentSegmentResults.flights[0];
            hasChanges = true;
            needsCascadingAPICalls = true;
          }
        } else {
          // Clear selection if no flights available for active segment
          if (flightsSelected[activeSegmentIndex]) {
            updatedFlightsSelected[activeSegmentIndex] = null;
            hasChanges = true;
          }
        }

        // Update selection if there are changes
        if (hasChanges) {
          setflightsSelected(updatedFlightsSelected);
        }
        // If we need to update subsequent segments (like in handleSelectButtonClick)
        if (
          needsCascadingAPICalls &&
          updatedFlightsSelected[activeSegmentIndex]
        ) {
          try {
            console.log(
              "Fetching updated flights for subsequent multi-city segments..."
            );

            let multiCityData = [...multicityFlightsResponse];
            let flights = [...updatedFlightsSelected];

            // Build segmentRef from all segments up to and including active segment
            let segmentRef = "";
            for (let i = 0; i <= activeSegmentIndex; i++) {
              if (flights[i]) {
                segmentRef += flights[i]?.segments?.[0]?.flightSegmentRefId;
              }
            }

            // Fetch updated flights for all subsequent segments
            for (let i = activeSegmentIndex + 1; i < flights.length; i++) {
              try {
                const data = await fetchFlightsWithRefId(
                  multicityFlightsResponse[i],
                  segmentRef,
                  "3"
                );

                multiCityData[i] = data;
                flights[i] = data?.flightsResults[0]?.flights?.[0];
                segmentRef +=
                  data?.flightsResults[0]?.flights?.[0]?.segments?.[0]
                    ?.flightSegmentRefId;
              } catch (error) {
                console.error(
                  `Error fetching flights for segment ${i}:`,
                  error
                );
                // Keep existing data if fetch fails
                break;
              }
            }

            // Update all states with new data
            setflightsSelected(flights);
            setMulticityFlightsResponse(multiCityData);

            // Compress and store updated multi-city data
            const compressedData = pako.deflate(JSON.stringify(multiCityData));
            setTabSpecificData("multicityFlights", compressedData);
            setMulticityResponse(multiCityData);

            // Update filter data for all segments
            const updatedFilterData = multiCityData
              .map(
                (segmentData) => segmentData?.flightsResults?.[0]?.filterData
              )
              .filter(Boolean); // Remove any undefined values

            if (updatedFilterData.length > 0) {
              setFilterData(updatedFilterData);
            }

            console.log("Updated multi-city flights after filter:", flights);
          } catch (error) {
            console.error(
              "Error updating subsequent multi-city segments:",
              error
            );
          }
        }
      } else {
        // Handle one-way flights (original logic)
        if (sortedResults[0]?.flights?.length > 0) {
          if (flightsSelected[0]) {
            const currentSelectedFlight = flightsSelected[0];
            const selectedFlightExists = isValidSelection(
              currentSelectedFlight,
              sortedResults[0].flights
            );

            if (!selectedFlightExists) {
              const updatedFlightsSelected = [...flightsSelected];
              updatedFlightsSelected[0] = sortedResults[0].flights[0];
              setflightsSelected(updatedFlightsSelected);
            }
          } else {
            // Auto-select first flight if none selected
            const updatedFlightsSelected = [...flightsSelected];
            updatedFlightsSelected[0] = sortedResults[0].flights[0];
            setflightsSelected(updatedFlightsSelected);
          }
        } else {
          // Clear selection if no flights available
          if (flightsSelected[0]) {
            setflightsSelected([null]);
          }
        }
      }
    }

    setFlightsResponse((prev) => ({
      ...prev,
      flightsResults: sortedResults,
    }));

    if (onFilteredResultsChange) {
      onFilteredResultsChange(selectedIndex, sortedResults[selectedIndex]);
    }

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
          selectedFilters[selectedIndex][filterIndex]?.stops.length > 0 &&
          !selectedFilters[selectedIndex][filterIndex]?.stops.includes(
            firstSegment.stops
          )
        ) {
          return false;
        }

        if (
          selectedFilters[selectedIndex][filterIndex]?.airlines.length > 0 &&
          !firstSegment.segment.some((segment) =>
            selectedFilters[selectedIndex][filterIndex]?.airlines.includes(
              segment.airline.airlineCode
            )
          )
        ) {
          return false;
        }

        if (
          selectedFilters[selectedIndex][filterIndex]?.layovers.length > 0 &&
          !firstSegment.segment.some((segment) =>
            selectedFilters[selectedIndex][filterIndex]?.layovers.includes(
              segment.destination.airport.cityCode
            )
          )
        ) {
          return false;
        }

        if (
          selectedFilters[selectedIndex][filterIndex]?.destinations.length >
            0 &&
          !firstSegment.segment.some((segment) =>
            selectedFilters[selectedIndex][filterIndex]?.destinations.includes(
              segment.destination.airport.airportCode
            )
          )
        ) {
          return false;
        }

        // Filter by arrivals
        if (
          selectedFilters[selectedIndex][filterIndex]?.arrivals.length > 0 &&
          !firstSegment.segment.some((segment) =>
            selectedFilters[selectedIndex][filterIndex]?.arrivals.includes(
              segment.origin.airport.airportCode
            )
          )
        ) {
          return false;
        }

        // 2) Check inPolicyOnly
        const inPolicyOnly =
          selectedFilters[selectedIndex][filterIndex]?.inPolicyOnly || false;

        if (inPolicyOnly) {
          // Check if this flight is out-of-policy
          const outOfPolicyEmployees = constructOutOfPolicyEmployees(
            {
              totalAmount: result?.fare?.offeredFareRoundedOff || 0,
              regionId: regionId,
              corporateEmployees: flightsRequest?.corporateEmployees || [],
              showApprovalReason: false,
            },
            TRAVEL_CATEGORIES.FLIGHTS,
            {
              budgetCheckMethod: "split",
            }
          );
          // If outOfPolicyEmployees.length > 0 => flight is out-of-policy => exclude
          if (outOfPolicyEmployees.length > 0) {
            return false;
          }
        }

        // Filter by price range
        const roundedOffFare = result.fare.offeredFareRoundedOff;
        if (roundedOffFare < range[0] || roundedOffFare > range[1]) {
          return false;
        }

        // Filter by cabin classes
        if (
          selectedFilters[selectedIndex][filterIndex]?.cabinClasses.length >
            0 &&
          !firstSegment.segment.some((segment) =>
            selectedFilters[selectedIndex][filterIndex]?.cabinClasses.includes(
              segment.cabinClass
            )
          )
        ) {
          return false;
        }

        // Filter by carrier
        if (
          selectedFilters[selectedIndex][filterIndex]?.carrier.length > 0 &&
          !selectedFilters[selectedIndex][filterIndex]?.carrier.includes(
            result.isLCC
          )
        ) {
          return false;
        }

        return true;
      });
      if (shouldClose) {
        onClose();
      }
    }
  };

  const clearFilters = () => {
    setRange([
      filterData[selectedIndex]?.price.min,
      filterData[selectedIndex]?.price.max,
    ]);
    setDurationRange([
      filterData[selectedIndex]?.duration.min,
      filterData[selectedIndex]?.duration.max,
    ]);
    setSelectedFilters([
      [
        {
          stops: [],
          airlines: [],
          layovers: [],
          destinations: [],
          arrivals: [],
          price: {},
          cabinClasses: [],
          carrier: [],
          refund: {},
          departureTime: [],
          arrivalTime: [],
          duration: {},
          inPolicyOnly: false,
        },
      ],
    ]);

    if (onFilteredResultsChange) {
      onFilteredResultsChange(segmentIndex, originalResults);
    }

    onClose();
  };

  const handleInPolicyToggle = () => {
    setSelectedFilters((prev) => {
      const updated = JSON.parse(JSON.stringify(prev));
      // Flip the boolean
      const currentValue =
        updated[selectedIndex][filterIndex].inPolicyOnly || false;
      updated[selectedIndex][filterIndex].inPolicyOnly = !currentValue;
      return updated;
    });
  };

  const handleFilterChange = (filterType, values) => {
    const updatedFilters = [...selectedFilters];

    updatedFilters.map((filters, index) => {
      filters.map((selectedFilter, i) => {
        if (index === selectedIndex && filterIndex === i) {
          updatedFilters[index][i] = {
            ...selectedFilter,
            [filterType]: values, // Update the specific filter type
          };
        }
        return selectedFilter;
      });
    });
    setSelectedFilters(updatedFilters);
  };

  const handleStopChange = (index) => {
    handleFilterChange(
      "stops",
      selectedFilters[selectedIndex][filterIndex]?.stops.includes(index)
        ? selectedFilters[selectedIndex][filterIndex]?.stops.filter(
            (stop) => stop !== index
          ) // Remove stop if already selected
        : [...selectedFilters[selectedIndex][filterIndex]?.stops, index] // Add new stop
    );
    logEvent(analytics, "flight_stops", {}); // Logging event (optional)
  };

  const handleAirlineChange = (airlineCode) => {
    handleFilterChange(
      "airlines",
      selectedFilters[selectedIndex][filterIndex]?.airlines.includes(
        airlineCode
      )
        ? selectedFilters[selectedIndex][filterIndex]?.airlines.filter(
            (selectedAirline) => selectedAirline !== airlineCode
          )
        : [
            ...selectedFilters[selectedIndex][filterIndex]?.airlines,
            airlineCode,
          ]
    );

    logEvent(analytics, "flight_airlines", {
      airlines: airlineCode,
    });
  };

  //airline changes
  const [showMoreAirlines, setShowMoreAirlines] = useState(false);

  const handleShowMoreAirlines = () => {
    setShowMoreAirlines((prev) => !prev); // Toggle the state
  };

  const MAX_AIRLINES = 5;

  const airlinesToDisplay = showMoreAirlines
    ? filterData[selectedIndex]?.airlines // Show all airlines if showMore is true
    : filterData[selectedIndex]?.airlines.slice(0, MAX_AIRLINES);

  const handleLayoverChange = (airportCode) => {
    handleFilterChange(
      "layovers",
      selectedFilters[selectedIndex][filterIndex]?.layovers.includes(
        airportCode
      )
        ? selectedFilters[selectedIndex][filterIndex]?.layovers.filter(
            (selectedLayover) => selectedLayover !== airportCode
          )
        : [
            ...selectedFilters[selectedIndex][filterIndex]?.layovers,
            airportCode,
          ]
    );
    logEvent(analytics, "flight_layovers", {
      layOvers: airportCode,
    });
  };

  //layover changes

  // const [showMore, setShowMore] = useState(false);
  // const handleShowMore = () => {
  //   setShowMore((prev) => !prev); // Toggle the show more state
  // };

  const [showMoreLayovers, setShowMoreLayovers] = useState({});

  // Update the handler
  const handleShowMore = (segmentIndex) => {
    setShowMoreLayovers((prev) => ({
      ...prev,
      [segmentIndex]: !prev[segmentIndex],
    }));
  };

  const MAX_LAYOVERS = 5;

  // const layoversToDisplay = showMore
  //   ? filterData[selectedIndex]?.layOvers // Show all layovers if showMore is true
  //   : filterData[selectedIndex]?.layOvers.slice(0, MAX_LAYOVERS);

  const layoversToDisplay = useMemo(() => {
    const layovers = filterData?.[selectedIndex]?.layOvers || [];
    const isExpanded = showMoreLayovers[selectedIndex];
    return isExpanded ? layovers : layovers.slice(0, MAX_LAYOVERS);
  }, [filterData, selectedIndex, showMoreLayovers]);

  const handleDestinationChange = (airportCode) => {
    handleFilterChange(
      "destinations",
      selectedFilters[selectedIndex][filterIndex]?.destinations.includes(
        airportCode
      )
        ? selectedFilters[selectedIndex][filterIndex]?.destinations.filter(
            (selectedDestination) => selectedDestination !== airportCode
          )
        : [
            ...selectedFilters[selectedIndex][filterIndex]?.destinations,
            airportCode,
          ]
    );
    logEvent(analytics, "flights_destination", {
      destination: airportCode,
    });
  };

  const handleArrivalChange = (airportCode) => {
    handleFilterChange(
      "arrivals",
      selectedFilters[selectedIndex][filterIndex]?.arrivals.includes(
        airportCode
      )
        ? selectedFilters[selectedIndex][filterIndex]?.arrivals.filter(
            (selectedArrival) => selectedArrival !== airportCode
          )
        : [
            ...selectedFilters[selectedIndex][filterIndex]?.arrivals,
            airportCode,
          ]
    );
    logEvent(analytics, "flights_arrival", {
      arrival: airportCode,
    });
  };

  const handleRefundFilterChange = (name) => {
    setSelectedFilters((prevFilters) => {
      const updatedFilters = JSON.parse(JSON.stringify(prevFilters)); // Deep copy

      // Ensure the structure is intact
      if (!updatedFilters[selectedIndex]) {
        updatedFilters[selectedIndex] = [];
      }

      if (!updatedFilters[selectedIndex][filterIndex]) {
        updatedFilters[selectedIndex][filterIndex] = { refund: {} };
      }

      // Toggle the specific filter
      updatedFilters[selectedIndex][filterIndex].refund[name] =
        !updatedFilters[selectedIndex][filterIndex].refund[name];

      return updatedFilters;
    });
  };

  const handleDepartureTimeFilterChange = (option, name, index) => {
    if (name === "departureTime") {
      let departureRange = [...departureTimeRange];
      departureRange[index] = option;
      setDepartureTimeRange(departureRange);
      if (departureRange[0].id > departureRange[1].id) {
        setDisableDepApplyButton(true);
      } else {
        setDisableDepApplyButton(false);
      }
    } else {
      let arrivalRange = [...arrivalTimeRange];
      arrivalRange[index] = option;
      setArrivalTimeRange(arrivalRange);
      if (arrivalRange[0].id > arrivalRange[1].id) {
        setDisableArrApplyButton(true);
      } else {
        setDisableArrApplyButton(false);
      }
    }
  };

  const handleApplyTimeframe = (name, timeFrame) => {
    setSelectedFilters((prevFilters) => {
      const updatedFilters = JSON.parse(JSON.stringify(prevFilters)); // Deep copy for immutability

      if (name === "departureTime") {
        const departureTimes =
          updatedFilters[selectedIndex][filterIndex].departureTime || [];

        if (departureTimes.includes(timeFrame.value)) {
          // Remove if the timeFrame exists
          updatedFilters[selectedIndex][filterIndex].departureTime =
            departureTimes.filter((time) => time !== timeFrame.value);
        } else {
          // Add if it doesn't exist
          updatedFilters[selectedIndex][filterIndex].departureTime.push(
            timeFrame.value
          );
        }
      } else if (name === "arrivalTime") {
        const arrivalTimes =
          updatedFilters[selectedIndex][filterIndex].arrivalTime || [];

        if (arrivalTimes.includes(timeFrame.value)) {
          // Remove if the timeFrame exists
          updatedFilters[selectedIndex][filterIndex].arrivalTime =
            arrivalTimes.filter((time) => time !== timeFrame.value);
        } else {
          // Add if it doesn't exist
          updatedFilters[selectedIndex][filterIndex].arrivalTime.push(
            timeFrame.value
          );
        }
      } else {
        // Handle range selections with deep copy
        if (!disableDepApplyButton && departureTimeRange.length > 0) {
          updatedFilters[selectedIndex][filterIndex].departureTime = [
            departureTimeRange[0].value + "-" + departureTimeRange[1].value,
          ];
        }
        if (!disableArrApplyButton && arrivalTimeRange.length > 0) {
          updatedFilters[selectedIndex][filterIndex].arrivalTime = [
            arrivalTimeRange[0].value + "-" + arrivalTimeRange[1].value,
          ];
        }
      }

      return updatedFilters;
    });
  };

  const handleCarrierChange = (carrierCode) => {
    handleFilterChange(
      "carrier",
      selectedFilters[selectedIndex][filterIndex]?.carrier.includes(carrierCode)
        ? selectedFilters[selectedIndex][filterIndex]?.carrier.filter(
            (selectedCarrier) => selectedCarrier !== carrierCode
          )
        : [...selectedFilters[selectedIndex][filterIndex]?.carrier, carrierCode]
    );
    logEvent(analytics, "flights_carrier", {
      carrier: carrierCode,
    });
  };

  const handleCabinClassChange = (cabinClassCode) => {
    handleFilterChange(
      "cabinClasses",
      selectedFilters[selectedIndex][filterIndex]?.cabinClasses.includes(
        cabinClassCode
      )
        ? selectedFilters[selectedIndex][filterIndex]?.cabinClasses.filter(
            (selectedCabinClass) => selectedCabinClass !== cabinClassCode
          )
        : [
            ...selectedFilters[selectedIndex][filterIndex]?.cabinClasses,
            cabinClassCode,
          ]
    );
    logEvent(analytics, "flights_cabinclass", {
      cabinClass: cabinClassCode,
    });
  };

  const handlePriceRangeChange = (event, newValue) => {
    setRange(newValue);
    let updatedFilters = selectedFilters;
    selectedFilters.map((filters, index) => {
      filters.map((selectedFilter, selectedFilterIndex) => {
        if (selectedIndex === index && selectedFilterIndex === filterIndex) {
          updatedFilters[index][selectedFilterIndex] = {
            ...selectedFilter,
            price: {
              min: newValue[0],
              max: newValue[1],
            },
          };
        }
      });
    });
    setSelectedFilters(updatedFilters);
  };

  const formatDuration = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;

    const hoursText = hours > 0 ? `${hours} hr` : "";
    const minutesText = remainingMinutes > 0 ? ` ${remainingMinutes} mins` : "";

    return `${hoursText}${minutesText}`;
  };

  const handleDurationRangeChange = (event, newValue) => {
    setDurationRange(newValue);
    let updatedFilters = selectedFilters;
    selectedFilters.map((filters, index) => {
      filters.map((selectedFilter, selectedFilterIndex) => {
        if (
          selectedIndex === index &&
          (filterIndex ? selectedFilterIndex === filterIndex : true)
        ) {
          updatedFilters[index][selectedFilterIndex] = {
            ...selectedFilter,
            duration: {
              min: newValue[0],
              max: newValue[1],
            },
          };
        }
      });
    });
    setSelectedFilters(updatedFilters);
  };

  const formatPrice = (price) => {
    if (price) {
      const priceStr = price.toString();
      const [integerPart, decimalPart] = priceStr.split(".");

      const lastThreeDigits = integerPart.slice(-3);
      const otherDigits = integerPart.slice(0, -3);

      const formattedIntegerPart =
        otherDigits.replace(/\B(?=(\d{2})+(?!\d))/g, ",") +
        (otherDigits.length > 0 ? "," : "") +
        lastThreeDigits;
      return decimalPart
        ? `${formattedIntegerPart}.${decimalPart}`
        : formattedIntegerPart;
    }
  };

  if (!filterData && !flightsResponse) {
    return;
  }

  const getSegmentIndex = () => {
    if (flightsRequest?.searchReqData?.journeyType === "2") {
      // Round-trip: use activeTab to determine which segment (0 for departure, 1 for return)
      return activeTab === "departure" ? 0 : 1;
    } else if (flightsRequest?.searchReqData?.journeyType === "3") {
      // Multi-city: use activeSegment
      return activeSegment;
    } else {
      // One-way: always 0
      return 0;
    }
  };

  const segmentIndex = getSegmentIndex();

  // Extract flight information from request data
  const getFlightInfoFromRequest = () => {
    const journeyType = flightsRequest?.searchReqData?.journeyType;

    if (journeyType === "3") {
      // Multi-city: get from multiCityDestinations array
      const segment = flightsRequest?.multiCityDestinations?.[segmentIndex];
      if (!segment) {
        return {
          originCity: "",
          originCountry: "",
          originCode: "",
          destinationCity: "",
          destinationCountry: "",
          destinationCode: "",
        };
      }

      return {
        originCity: segment.from?.label || segment.fromCity || "",
        originCountry: segment.from?.countryname || "",
        originCode: segment.from?.airportCode || segment.fromCityCode || "",
        destinationCity: segment.to?.label || segment.toCity || "",
        destinationCountry: segment.to?.countryname || "",
        destinationCode: segment.to?.airportCode || segment.toCityCode || "",
      };
    } else if (journeyType === "2") {
      // Round-trip: for departure use from->to, for return use to->from
      if (segmentIndex === 0) {
        // Departure segment
        return {
          originCity:
            flightsRequest?.selectedFromCity?.label ||
            flightsRequest?.fromCity ||
            "",
          originCountry: flightsRequest?.selectedFromCity?.countryname || "",
          originCode: flightsRequest?.selectedFromCity?.airportCode || "",
          destinationCity:
            flightsRequest?.selectedToCity?.label ||
            flightsRequest?.toCity ||
            "",
          destinationCountry: flightsRequest?.selectedToCity?.countryname || "",
          destinationCode: flightsRequest?.selectedToCity?.airportCode || "",
        };
      } else {
        // Return segment (reverse the cities)
        return {
          originCity:
            flightsRequest?.selectedToCity?.label ||
            flightsRequest?.toCity ||
            "",
          originCountry: flightsRequest?.selectedToCity?.countryname || "",
          originCode: flightsRequest?.selectedToCity?.airportCode || "",
          destinationCity:
            flightsRequest?.selectedFromCity?.label ||
            flightsRequest?.fromCity ||
            "",
          destinationCountry:
            flightsRequest?.selectedFromCity?.countryname || "",
          destinationCode: flightsRequest?.selectedFromCity?.airportCode || "",
        };
      }
    } else {
      // One-way: use from->to
      return {
        originCity:
          flightsRequest?.selectedFromCity?.label ||
          flightsRequest?.fromCity ||
          "",
        originCountry: flightsRequest?.selectedFromCity?.countryname || "",
        originCode: flightsRequest?.selectedFromCity?.airportCode || "",
        destinationCity:
          flightsRequest?.selectedToCity?.label || flightsRequest?.toCity || "",
        destinationCountry: flightsRequest?.selectedToCity?.countryname || "",
        destinationCode: flightsRequest?.selectedToCity?.airportCode || "",
      };
    }
  };

  // Get all flight information
  const flightInfo = getFlightInfoFromRequest();

  // Extract individual values
  const originCity = flightInfo.originCity;
  const originCountry = flightInfo.originCountry;
  const originCode = flightInfo.originCode;
  const destinationCity = flightInfo.destinationCity;
  const destinationCountry = flightInfo.destinationCountry;
  const destinationCode = flightInfo.destinationCode;

  return (
    <>
      {isOpen && (
        <>
          <div
            className={`relative block left-0 bottom-0 h-full ${isFooterNear ? "sm:h-[50px]" : "sm:h-[480px]"} w-full p-[3%] pt-2 rounded-md shadow-none z-[0] bg-[#03110A0D]`}
          >
            <div className="sm:static sticky top-0 left-0 right-0 w-full p-2 pt-2 bg-white flex flex-col justify-between z-[9] mt-2 rounded-md bg-opacity-1">
              <div className="">
                <h2 className="text-base" style={{ color: "#028fa3" }}>
                  Filters for your best search
                </h2>
              </div>
              <div className="flex justify-center overflow-x-scroll-hide">
                {flightsRequest?.searchReqData?.journeyType === "2" && (
                  <div className="flex justify-between gap-3 w-full">
                    <button
                      className={`px-4 text-xs py-2 w-1/2 rounded-md transition-colors ${
                        activeTab === "departure"
                          ? "bg-[#028fa3] text-white"
                          : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                      }`}
                      onClick={() => {
                        handleTabChange("departure");
                        setSelectedIndex(0);
                      }}
                    >
                      Departure
                    </button>
                    <button
                      className={`px-4 text-xs py-2 w-1/2 rounded-md transition-colors ${
                        activeTab === "return"
                          ? "bg-[#028fa3] text-white"
                          : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                      }`}
                      onClick={() => {
                        handleTabChange("return");
                        setSelectedIndex(1);
                      }}
                    >
                      Return
                    </button>
                  </div>
                )}
                {flightsRequest?.searchReqData?.journeyType !== "2" && (
                  <>
                    {flightsResponse.map((flightMap, index) => {
                      const originCity =
                        flightMap?.flights[0]?.segments?.[0]?.segment[0].origin
                          .airport.cityCode ??
                        originalResults.flightsResults[index]?.flights[0]
                          ?.segments?.[0]?.segment[0].origin.airport.cityCode;
                      const destinationCity =
                        flightMap?.flights[0]?.segments?.[0]?.segment[
                          flightMap?.flights[0]?.segments?.[0]?.segment
                            ?.length - 1
                        ].destination.airport.cityCode ??
                        originalResults.flightsResults[index]?.flights[0]
                          ?.segments?.[0]?.segment[
                          originalResults.flightsResults[index]?.flights[0]
                            ?.segments?.[0]?.segment?.length - 1
                        ].destination.airport.cityCode;
                      return (
                        <button
                          key={index}
                          onClick={() => setSelectedIndex(index)}
                          className={`w-1/3 min-w-fit font-medium text-base text-nowrap p-1 m-1 rounded-lg ${
                            selectedIndex === index
                              ? "bg-[#028fa3] text-white"
                              : "bg-white text-[#028fa3] border-[1px] border-[#028fa3]"
                          }`}
                        >
                          {originCity}
                          <FontAwesomeIcon icon={faMinus} />
                          {destinationCity}
                        </button>
                      );
                    })}
                  </>
                )}
              </div>
            </div>
                 <div
              className={`h-full ${isFooterNear ? "sm:h-[0px]" : "sm:h-[350px]"} overflow-y-auto pb-20 sm:pb-0 sm:overflow-y-scroll sm:[&::-webkit-scrollbar]:hidden`}
            >
            <div className="h-full  pb-20 sm:pb-0">
              <div className="w-[98%] ml-1 mt-2 p-[3%] shadow-[0px_4px_4px_0px] shadow-[rgba(2,143,163,0.13)] bg-white rounded-sm cursor-pointer">
                <div>Flight Policy</div>
                <div className="mt-3">
                  <label className="inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      className="sr-only peer"
                      checked={
                        selectedFilters?.[selectedIndex]?.[filterIndex]
                          ?.inPolicyOnly || false
                      }
                      onChange={handleInPolicyToggle}
                    />
                    <div className="relative w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-[#E5E1E2] peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#028fa3]"></div>
                    <span className="ms-3 text-[#171A19CC] font-normal text-base">
                      In policy fares only
                    </span>
                  </label>
                </div>
              </div>
              {/* price container */}

         
              <div className="w-[98%] ml-1 mt-2 p-[3%] shadow-[0px_4px_4px_0px] shadow-[rgba(2,143,163,0.13)] bg-white rounded-sm cursor-pointer">
                <div>Price</div>
                <div style={{ marginLeft: "9%", marginRight: "9%" }}>
                  <Slider
                    value={range}
                    onChange={handlePriceRangeChange}
                    valueLabelDisplay="auto"
                    min={filterData[selectedIndex]?.price.min}
                    max={filterData[selectedIndex]?.price?.max}
                    step={1}
                  />
                </div>
                <div
                  style={{ display: "flex", justifyContent: "space-between" }}
                >
                  <div>
                    <span style={{ fontWeight: "600" }}>Min:</span>
                    <span>{formatPrice(range[0])}</span>
                  </div>
                  <div>
                    <span style={{ fontWeight: "600" }}>Max:</span>
                    <span>{formatPrice(range[1])}</span>
                  </div>
                </div>
              </div>
              {/* stops container */}
              <div className="w-[98%] ml-[1%] mt-[2%] p-[3%] shadow-[0_4px_4px_0px] shadow-[rgba(2,143,163,0.13)] bg-white rounded-sm">
                <div>Stops</div>
                <div className="flex flex-col mt-[4%]">
                  {Array.from(
                    {
                      length:
                        filterData[selectedIndex]?.stops?.max -
                        filterData[selectedIndex]?.stops?.min +
                        1,
                    },
                    (_, index) => {
                      const stopCount =
                        filterData[selectedIndex]?.stops?.min + index;
                      return (
                        <>
                          <label
                            className="text-[#028fa3] w-fit text-nowrap py-[1%]  rounded-sm text-sm font-medium flex whitespace-nowrap cursor-pointer"
                            key={index}
                          >
                            <input
                              type="checkbox"
                              className="mr-[10%] cursor-pointer"
                              checked={selectedFilters[selectedIndex][
                                filterIndex
                              ]?.stops.includes(stopCount)}
                              onChange={() => handleStopChange(stopCount)}
                            />
                            {stopCount === 0
                              ? "Non-stop"
                              : `${stopCount} stop${stopCount > 1 ? "s" : ""}`}
                          </label>
                          {index <
                            filterData[selectedIndex]?.stops.max -
                              filterData[selectedIndex]?.stops.min}
                        </>
                      );
                    }
                  )}
                </div>
              </div>

              <div className="w-[98%] ml-[1%] mt-[5%] p-[3%] shadow-[0_4px_4px_0px_rgba(0,0,0,0.13)] bg-white rounded-md">
                <div>
                  Departure From{" "}
                  {/* {flightsRequest.journeyType === 2
                    ? flightsRequest.fromCity
                    : flightsRequest.selectedFromCity} */}
                  {originCity}({originCode}),{originCountry}
                </div>
                <div className="pt-2">
                  <div className="grid grid-cols-2 gap-2">
                    {timeframes.map((timeframe, index) => (
                      <button
                        key={index}
                        onClick={() =>
                          handleApplyTimeframe("departureTime", timeframe)
                        }
                        className={`flex items-center justify-start gap-2 p-2 py-3  border rounded-md transition-all text-xs
                        ${
                          selectedFilters?.[selectedIndex]?.[
                            filterIndex
                          ]?.departureTime?.includes(timeframe.value)
                            ? "border-blue-500 bg-blue-100"
                            : "border-gray-300"
                        }`}
                      >
                        <FontAwesomeIcon
                          icon={timeframe.icon}
                          className="text-gray-600"
                        />
                        <span>{timeframe.label}</span>
                      </button>
                    ))}
                  </div>

                  <div className="mt-3 border border-blue-500 p-2 rounded-md">
                    <label className="flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={isSpecificTimeframe}
                        onChange={handleSelect}
                        className="mr-2"
                      />
                      Select Specific Timeframe
                    </label>

                    {isSpecificTimeframe && timeRangeOptions.length > 0 && (
                      <div className="mt-2 space-y-4">
                        <div className="flex space-x-1 items-center">
                          <Select
                            className="border rounded p-2 text-xs cursor-pointer"
                            options={timeRangeOptions}
                            value={departureTimeRange[0] ?? timeRangeOptions[0]}
                            onChange={(selectedOption) =>
                              handleDepartureTimeFilterChange(
                                selectedOption,
                                "departureTime",
                                0
                              )
                            }
                          />

                          <span>to</span>

                          <Select
                            className="border rounded p-2 text-xs cursor-pointer"
                            options={timeRangeOptions}
                            value={departureTimeRange[1] ?? timeRangeOptions[0]}
                            onChange={(selectedOption) =>
                              handleDepartureTimeFilterChange(
                                selectedOption,
                                "departureTime",
                                1
                              )
                            }
                          />
                        </div>

                        {/* Apply button */}
                        <button
                          className="px-11 py-2 border-1 border-[#028fa3] text-[#028fa3] text-base font-semibold rounded"
                          onClick={handleApplyTimeframe}
                        >
                          APPLY TIMEFRAME
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="w-[98%] ml-[1%] mt-[5%] p-[3%] shadow-[0_4px_4px_0px_rgba(0,0,0,0.13)] bg-white rounded-md">
                <div>
                  Arrival At {destinationCity}({destinationCode}),
                  {destinationCountry}
                  {/* {flightsRequest.journeyType === 2
                    ? flightsRequest.toCity
                    : flightsRequest.selectedToCity} */}
                </div>

                <div className="pt-2">
                  <div className="grid grid-cols-2 gap-2">
                    {timeframes.map((timeframe, index) => (
                      <button
                        key={index}
                        onClick={() =>
                          handleApplyTimeframe("arrivalTime", timeframe)
                        }
                        className={`flex items-center justify-start gap-2 p-2 py-3  border rounded-md transition-all text-xs
                        ${
                          selectedFilters?.[selectedIndex]?.[
                            filterIndex
                          ]?.arrivalTime?.includes(timeframe.value)
                            ? "border-blue-500 bg-blue-100"
                            : "border-gray-300"
                        }`}
                      >
                        <FontAwesomeIcon
                          icon={timeframe.icon}
                          className="text-gray-600"
                        />
                        <span>{timeframe.label}</span>
                      </button>
                    ))}
                  </div>

                  <div className="mt-3 border border-blue-500 p-2 rounded-md">
                    <label className="flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={isSpecificTimeframe1}
                        onChange={handleSelect1}
                        className="mr-2"
                      />
                      Select Specific Timeframe
                    </label>

                    {isSpecificTimeframe1 && (
                      <div className="mt-2 space-y-4">
                        <div className="flex space-x-1 items-center">
                          <Select
                            className="border rounded p-2 text-xs cursor-pointer"
                            options={timeRangeOptions}
                            value={arrivalTimeRange[0] ?? timeRangeOptions[0]}
                            onChange={(selectedOption) =>
                              handleDepartureTimeFilterChange(
                                selectedOption,
                                "arrivalTime",
                                0
                              )
                            }
                          />

                          <span>to</span>

                          <Select
                            className="border rounded p-2 text-xs cursor-pointer"
                            options={timeRangeOptions}
                            value={arrivalTimeRange[1] ?? timeRangeOptions[0]}
                            onChange={(selectedOption) =>
                              handleDepartureTimeFilterChange(
                                selectedOption,
                                "arrivalTime",
                                1
                              )
                            }
                          />
                        </div>

                        {/* Apply button */}
                        <button
                          className="px-11 py-2 border-1 border-[#028fa3] text-[#028fa3] text-base font-semibold rounded"
                          onClick={handleApplyTimeframe}
                        >
                          APPLY TIMEFRAME
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* airlines container */}
              <div className="w-[98%] ml-[1%] p-[3%] bg-white rounded-md mt-[5%] shadow-[0_4px_4px_0px_rgba(0,0,0,0.16)]">
                <div>Preferred Airlines</div>
                <div className="pr-[2%]  ">
                  {airlinesToDisplay?.map((airline) => (
                    <label
                      className="flex justify-between items-center mt-[2%] cursor-pointer"
                      key={airline.airlineCode}
                    >
                      <div
                        style={{ display: "flex", gap: "8px" }}
                        className="items-center"
                      >
                        <input
                          className="cursor-pointer"
                          type="checkbox"
                          id={airline.airlineCode}
                          checked={selectedFilters[selectedIndex][
                            filterIndex
                          ]?.airlines.includes(airline.airlineCode)}
                          onChange={() =>
                            handleAirlineChange(airline.airlineCode)
                          }
                        />

                        <Image
                          src={airline.airlineLogoUrl}
                          alt="logo"
                          width={20}
                          height={20}
                          className="w-5 h-5 "
                        />
                        <span className="text-[#878786] text-base">{`${airline.airlineName} (${airline.noOfFlights})`}</span>
                      </div>
                      <span className="text-[#878786] text-right text-base whitespace-nowrap">
                        ₹ {formatPrice(Math.round(airline.minPrice))}
                      </span>
                    </label>
                  ))}

                  {/* Check if there are more than MAX_AIRLINES and show the See More button */}
                  {filterData[selectedIndex]?.airlines.length >
                    MAX_AIRLINES && (
                    <div className="mt-2">
                      <button
                        onClick={handleShowMoreAirlines}
                        className="text-[#028fa3] text-sm cursor-pointer"
                      >
                        {showMoreAirlines
                          ? "See Less"
                          : `See More (${
                              filterData[selectedIndex]?.airlines.length -
                              MAX_AIRLINES
                            })`}
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* {cabinClass container} */}

              <div className="w-[98%] ml-[1%] mt-[5%] p-[3%] shadow-[0_4px_4px_0px_rgba(0,0,0,0.13)] bg-white rounded-md">
                <div>Cabin Classes</div>
                {filterData[selectedIndex]?.cabinClasses.map((cabinClass) => (
                  <label
                    className="cursor-pointer block mb-[8px]"
                    key={cabinClass.cabinClassCode}
                  >
                    <input
                      className="cursor-pointer"
                      type="checkbox"
                      checked={selectedFilters[selectedIndex][
                        filterIndex
                      ]?.cabinClasses.includes(cabinClass.cabinClassCode)}
                      onChange={() =>
                        handleCabinClassChange(cabinClass.cabinClassCode)
                      }
                    />
                    <span className="text-[#878786] text-base ml-2">
                      {cabinClass.cabinClassName}
                    </span>
                  </label>
                ))}
              </div>

              {/* {carrier container} */}

              <div className="w-[98%] ml-[1%] mt-[5%] p-[3%] shadow-[0_4px_4px_0px_rgba(0,0,0,0.13)] bg-white rounded-md">
                <div>Carrier</div>
                {filterData[selectedIndex]?.carrier.map((carrierType) => (
                  <label
                    className="cursor-pointer block mb-[8px]"
                    key={carrierType.carrierTypeName}
                  >
                    <input
                      className="cursor-pointer"
                      type="checkbox"
                      checked={selectedFilters[selectedIndex][
                        filterIndex
                      ]?.carrier.includes(carrierType.carrierTypeValue)}
                      onChange={() =>
                        handleCarrierChange(carrierType.carrierTypeValue)
                      }
                    />
                    <span className="text-[#878786] text-base ml-2">
                      {carrierType.carrierTypeName}
                    </span>
                  </label>
                ))}
              </div>

              {/* Layover Container */}
              {layoversToDisplay?.length > 0 && (
                <div className="w-[98%] ml-[1%] mt-[5%] p-[3%] shadow-[0_4px_4px_0px_rgba(0,0,0,0.13)] bg-white rounded-md">
                  <div>Layover</div>

                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "1px",
                    }}
                  >
                    {layoversToDisplay.map((layover) => (
                      <label
                        className="mt-[2%] cursor-pointer"
                        key={layover.airportCode}
                      >
                        <div style={{ display: "flex", gap: "10px" }}>
                          <input
                            className="cursor-pointer"
                            type="checkbox"
                            id={layover.airportCode}
                            checked={selectedFilters[selectedIndex][
                              filterIndex
                            ]?.layovers.includes(layover.airportCode)}
                            onChange={() =>
                              handleLayoverChange(layover.airportCode)
                            }
                          />
                          <span className="text-[#878786] text-base">
                            {layover.city} ({layover.airportCode})
                          </span>
                        </div>
                      </label>
                    ))}

                    {filterData?.[selectedIndex]?.layOvers.length >
                      MAX_LAYOVERS && (
                      <div className="mt-2">
                        <button
                          // onClick={handleShowMore}
                           onClick={() => handleShowMore(selectedIndex)}
                          className="text-[#028fa3] text-sm cursor-pointer"
                        >
                          {showMoreLayovers[selectedIndex]
                            ? "See Less"
                            : `See More (${
                                filterData?.[selectedIndex]?.layOvers.length -
                                MAX_LAYOVERS
                              })`}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* destination airport container */}
              <div className="w-[98%] ml-[1%] mt-[5%] p-[3%] shadow-[0_4px_4px_0px_rgba(0,0,0,0.13)] bg-white rounded-md">
                <div>Arrival Airport</div>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "1px",
                  }}
                >
                  {filterData?.[selectedIndex]?.destinations.map(
                    (destination) => (
                      <label
                        className="cursor-pointer block mb-[8px]"
                        key={destination.airportCode}
                      >
                        <div style={{ display: "flex", gap: "10px" }}>
                          <input
                            className="cursor-pointer"
                            type="checkbox"
                            id={destination.airportCode}
                            checked={selectedFilters[selectedIndex][
                              filterIndex
                            ]?.destinations.includes(destination.airportCode)}
                            onChange={() =>
                              handleDestinationChange(destination.airportCode)
                            }
                          />
                          <span className="text-[#878786] text-base">
                            {`${destination.airportName} (${destination.airportCode})`}
                          </span>
                        </div>
                      </label>
                    )
                  )}
                </div>
              </div>

              {/* arrival airport Container */}
              <div className="w-[98%] ml-[1%] mt-[5%] p-[3%] shadow-[0_4px_4px_0px_rgba(0,0,0,0.13)] bg-white rounded-md">
                <div>Departure Airport</div>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "1px",
                  }}
                >
                  {filterData?.[selectedIndex]?.origins.map((origin) => (
                    <label
                      className="cursor-pointer block mb-[8px]"
                      key={origin.airportCode}
                    >
                      <div style={{ display: "flex", gap: "10px" }}>
                        <input
                          className="cursor-pointer"
                          type="checkbox"
                          id={origin.airportCode}
                          checked={selectedFilters[selectedIndex][
                            filterIndex
                          ]?.arrivals.includes(origin.airportCode)}
                          onChange={() =>
                            handleArrivalChange(origin.airportCode)
                          }
                        />
                        <span className="text-[#878786] text-base">
                          {`${origin.airportName} (${origin.airportCode})`}
                        </span>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              <div className="w-[98%] ml-[1%] mt-[5%] p-[3%] shadow-[0_4px_4px_0px_rgba(0,0,0,0.13)] bg-white rounded-md">
                <div>Duration</div>
                <div style={{ padding: "4%" }}>
                  <Slider
                    value={durationRange}
                    onChange={handleDurationRangeChange}
                    // valueLabelDisplay="auto"
                    min={filterData[selectedIndex]?.duration.min}
                    max={filterData[selectedIndex]?.duration?.max}
                    step={1}
                  />
                </div>

                <div
                  style={{ display: "flex", justifyContent: "space-between" }}
                  className="text-sm"
                >
                  <div>
                    <span>{formatDuration(durationRange[0])}</span>
                  </div>
                  <div>
                    <span>{formatDuration(durationRange[1])}</span>
                  </div>
                </div>
              </div>

              <div className="w-[98%] ml-[1%] mt-[5%] p-[3%] shadow-[0_4px_4px_0px_rgba(0,0,0,0.13)] bg-white rounded-md">
                <div>Refund</div>

                <div className="pt-2">
                  <label className="flex items-center text-[#878786] text-base cursor-pointer">
                    <input
                      type="checkbox"
                      className="mr-2"
                      id={`refundable_${selectedIndex}_${filterIndex}`}
                      checked={
                        selectedFilters[selectedIndex]?.[filterIndex]?.refund
                          ?.refundable
                      }
                      onChange={() => handleRefundFilterChange("refundable")}
                    />
                    Refundable
                  </label>
                  <label className="flex items-center text-[#878786] text-base cursor-pointer">
                    <input
                      type="checkbox"
                      className="mr-2"
                      id={`refundable_${selectedIndex}_${filterIndex}`}
                      checked={
                        selectedFilters[selectedIndex]?.[filterIndex]?.refund
                          .nonRefundable
                      }
                      onChange={() => handleRefundFilterChange("nonRefundable")}
                    />
                    Non Refundable
                  </label>
                </div>
              </div>
            </div>

            </div>
            {/* Cancel and apply filter button */}

            {type !== "all" && (
              <div className="w-[100%] flex justify-center gap-[15px] sticky bottom-0 mb-[6%] pb-[1%]">
                <button
                  className="w-[90%] rounded-sm p-[2%] text-white"
                  style={{
                    backgroundColor: "#878786",
                  }}
                  onClick={clearFilters}
                  disabled={
                    Object.values(selectedFilters).flat().length === 0 &&
                    range[0] === filterData?.[selectedIndex]?.price?.min &&
                    range[1] === filterData?.[selectedIndex]?.price?.max
                  }
                >
                  {/* Cancel */}
                  Clear
                </button>
                <button
                  className="w-[90%] rounded-sm p-[2%] text-white"
                  style={{ backgroundColor: "#028FA3" }}
                  onClick={() =>
                    wayType && wayType === "multicity"
                      ? applyMultiCityFilters(true)
                      : applyFilters(true)
                  }
                  disabled={
                    Object.values(selectedFilters).flat().length === 0 &&
                    range[0] === filterData?.[selectedIndex]?.price?.min &&
                    range[1] === filterData?.[selectedIndex]?.price?.max
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

export default Filters;
