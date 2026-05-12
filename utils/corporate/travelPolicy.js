import {
  TRAVEL_CATEGORIES,
  CABIN_CLASS_OPTIONS,
  FLIGHT_SSR_SEAT_ID,
  FLIGHT_SSR_MEAL_ID,
  FLIGHT_SSR_BAGGAGE_ID,
  TRAVEL_FIELD_CONFIGS,
  TRAVEL_POLICY_APPROVAL_IN_POLICY_ID,
  FLIGHT_BUDGET_DOMESTIC_ID,
  FLIGHT_BUDGET_INTERNATIONAL_ID,
  TRAIN_MAX_ADULT_SELECTION,
  BUS_MAX_ADULT_SELECTION,
  CAR_MAX_ADULT_SELECTION,
} from "../constants";

export const getLowestMaxCabinClass = (travelers) => {
  // If no travelers => default to rank=4 => user can pick "First Class"
  if (!travelers.length) return 4;

  // For each traveler, find the max cabin rank from their policy
  const perTravelerMaxRanks = travelers.map((travObj) => {
    const data = travObj?.data;
    if (!data?.travelPolicyDetails?.length) {
      // no policy => no restriction => rank=4
      return 4;
    }
    // Attempt to find flight config => travelCategory="2"
    let travelerMaxRank = 4; // fallback= "First Class"
    try {
      const flightConfig = data.travelPolicyDetails[0].policyConfigData.find(
        (c) => c.travelCategory === TRAVEL_CATEGORIES.FLIGHTS
      );
      // flightConfig.cabinClass might be an array => e.g. [1,2,3]
      // find the maximum
      if (flightConfig?.cabinClass?.length) {
        travelerMaxRank = Math.max(
          ...flightConfig.cabinClass.map((num) => {
            // If cabinClass is [1,2,3], we map them to our rank scale
            // you might keep them the same if your data matches
            // but let's assume "1 => rank1, 2 => rank2, 3 => rank3, 4 => rank4"
            // if your data is already in 1..4, you can skip the map.
            if (num === 1) return 1; // Economy
            if (num === 2) return 2; // Premium
            if (num === 3) return 3; // Business
            if (num === 4) return 4; // First
            return 4; // fallback
          })
        );
      }
    } catch (e) {
      console.error("Error reading traveler flight config", e);
    }
    return travelerMaxRank;
  });

  // Now find the minimum across all travelers
  return Math.min(...perTravelerMaxRanks);
};

// Renamed to be more generic since it works for all travel categories
export const interpretTravelEligibility = (
  travelPolicyData,
  travelCategory
) => {
  // If no policy, default => multiple
  if (!travelPolicyData || travelPolicyData.length === 0) {
    // fallback => 9
    return { selfBook: true, canBookForOthers: false };
  }

  const foundConfig = travelPolicyData.find(
    (cfg) => cfg.travelCategory === travelCategory
  );
  if (!foundConfig) {
    // fallback => 9
    return { selfBook: true, canBookForOthers: false };
  }

  const eligibility = foundConfig.eligibility || [];

  // If not an array or no data, default to both false
  if (!Array.isArray(eligibility) || eligibility.length === 0) {
    return { selfBook: true, canBookForOthers: false };
  }

  return {
    // If array includes "1", user can self-book
    selfBook: eligibility.includes("1"),

    // If array includes "2", user can book for others
    canBookForOthers: eligibility.includes("2"),
  };
};

// Legacy alias for backward compatibility
export const interpretHotelEligibility = interpretTravelEligibility;

export const getMaxAllowedTravelers = (travelPolicyData, travelCategory) => {
  // If no policy, default => multiple
  if (!travelPolicyData || travelPolicyData.length === 0) {
    // fallback => 9
    return 9;
  }

  // find the config that has travelCategory === "2" (flights) or "1" (hotels) or "3", "4", "5" (transport)
  const foundConfig = travelPolicyData.find(
    (cfg) => cfg.travelCategory === travelCategory
  );
  if (!foundConfig) {
    // fallback => 9
    return 9;
  }

  // e.g. foundConfig.eligibility => [ '1' ] or [ '2' ] or [ '1','2' ] or empty
  const eligArray = foundConfig.eligibility || [];

  // If empty => no restriction => allow multiple => 9
  if (eligArray.length === 0) {
    return 9;
  }
  // If includes "2" => can do "book-for-others" => allow multiple => 9
  if (eligArray.includes("2")) {
    return 9;
  }
  // If includes only "1" => self-only => 1
  // (If it had "1" and "2", we would have returned 9 above.)
  // so here => it must be ["1"]
  return 1;
};

export const getDefaultMaxForCategory = (travelCategory) => {
  switch (travelCategory) {
    case TRAVEL_CATEGORIES.TRAINS:
      return TRAIN_MAX_ADULT_SELECTION;
    case TRAVEL_CATEGORIES.BUS:
      return BUS_MAX_ADULT_SELECTION;
    case TRAVEL_CATEGORIES.CAR_RENTAL:
      return CAR_MAX_ADULT_SELECTION;
    default:
      return 9;
  }
};

export const getTransportMaxAllowedTravelers = (
  travelPolicyData,
  travelCategory
) => {
  // Get the category-specific default maximum
  const categoryDefaultMax = getDefaultMaxForCategory(travelCategory);

  // If no policy data provided, return category-specific default
  if (!travelPolicyData || travelPolicyData.length === 0) {
    return categoryDefaultMax;
  }

  // Find the config for the specific transport category
  const foundConfig = travelPolicyData.find(
    (cfg) => cfg.travelCategory === travelCategory
  );

  // If no config found for this category, return category-specific default
  if (!foundConfig) {
    return categoryDefaultMax;
  }

  // Check eligibility array (["1"] = self-only, ["2"] or ["1","2"] = book for others)
  const eligArray = foundConfig.eligibility || [];

  // First check specific maxTravelers values by category
  if (foundConfig.maxTravelers !== undefined) {
    // If policy explicitly defines a maximum, use that value
    return parseInt(foundConfig.maxTravelers, 10) || categoryDefaultMax;
  }

  // If eligibility allows booking for others or is empty, return category default
  if (eligArray.includes("2") || eligArray.length === 0) {
    return categoryDefaultMax;
  }

  // If includes only "1" => self-only => 1
  return 1;
};

/**
 * Gets the category-specific name for max travelers display
 *
 * @param {string} travelCategory - "3" (train), "4" (bus), "5" (car)
 * @returns {string} - Display name for the category
 */
export const getTransportCategoryName = (travelCategory) => {
  switch (travelCategory) {
    case TRAVEL_CATEGORIES.FLIGHTS:
      return "flight";
    case TRAVEL_CATEGORIES.HOTELS:
      return "hotel";
    case TRAVEL_CATEGORIES.TRAINS:
      return "train";
    case TRAVEL_CATEGORIES.BUS:
      return "bus";
    case TRAVEL_CATEGORIES.CAR_RENTAL:
      return "car rental";
    default:
      return "transport";
  }
};

/**
 * @param {Array} travelers - array of selected travelers (each { value, label, data: {...} }).
 * @param {string} travelCategory - "1" (hotels), "2" (flights), "3" (train), "4" (bus), "5" (car).
 * @returns {Object} For categories 1 & 2: e.g. { 1: 3000, 2: 8000 } => min allowed budget for each region
 *                   For categories 3, 4, 5: e.g. { budget: 5000 } => min allowed single budget value
 */
export const getMinBudgetsAcrossTravelers = (travelers, travelCategory) => {
  // We'll store region => min for hotel/flight or a single budget value for transport
  const budgetMap = {};

  // Handle different categories differently
  const isTransportCategory = ["3", "4", "5"].includes(travelCategory);

  // If no travelers or invalid input, set default values
  if (!travelers?.length) {
    if (isTransportCategory) {
      // For transport categories, set single budget to Infinity
      budgetMap.budget = Infinity;
    } else {
      // For hotel/flight, set region-specific budgets to Infinity
      budgetMap[FLIGHT_BUDGET_DOMESTIC_ID] = Infinity;
      budgetMap[FLIGHT_BUDGET_INTERNATIONAL_ID] = Infinity;
    }
    return budgetMap;
  }

  // For each traveler, find the policyConfigData that matches travelCategory
  travelers.forEach((travObj) => {
    const data = travObj?.data;
    if (!data?.travelPolicyDetails?.length) return;

    const policyForCat = data.travelPolicyDetails[0]?.policyConfigData?.find(
      (c) => c.travelCategory === travelCategory
    );

    if (!policyForCat) return;

    // Handle transport categories (3, 4, 5) with single budget value
    if (isTransportCategory) {
      const budgetValue = policyForCat.budget;

      // Only consider valid numeric amounts
      if (
        budgetValue !== null &&
        budgetValue !== undefined &&
        !isNaN(budgetValue)
      ) {
        if (!budgetMap.budget || budgetValue < budgetMap.budget) {
          budgetMap.budget = budgetValue;
        }
      }
    }
    // Handle hotel/flight categories (1, 2) with region-specific budgets
    else if (Array.isArray(policyForCat.budget)) {
      // e.g. policyForCat?.budget => [{ regionalCategoryId, amount }, ...]
      policyForCat.budget.forEach((b) => {
        const regionId = b.regionalCategoryId;
        const amount = b.amount;
        // Only consider valid numeric amounts
        if (amount !== null && amount !== undefined && !isNaN(amount)) {
          if (!budgetMap[regionId]) {
            // not set => set it
            budgetMap[regionId] = amount;
          } else {
            // already have => keep the minimum
            budgetMap[regionId] = Math.min(budgetMap[regionId], amount);
          }
        }
      });
    }
  });

  // Set default values for any missing budget
  if (isTransportCategory) {
    if (!budgetMap.budget) {
      budgetMap.budget = Infinity;
    }
  } else {
    // For hotel/flight, set region-specific defaults
    if (!budgetMap[FLIGHT_BUDGET_DOMESTIC_ID]) {
      budgetMap[FLIGHT_BUDGET_DOMESTIC_ID] = Infinity;
    }
    if (!budgetMap[FLIGHT_BUDGET_INTERNATIONAL_ID]) {
      budgetMap[FLIGHT_BUDGET_INTERNATIONAL_ID] = Infinity;
    }
  }

  return budgetMap;
};

// e.g. getMinBookingWindow(travelers, travelCategory) => number of days
export function getMinBookingWindow(
  travelers = [],
  travelCategory = TRAVEL_CATEGORIES.FLIGHTS
) {
  let minWindow = Infinity;
  travelers.forEach((trav) => {
    const policyArr = trav?.data?.travelPolicyDetails || [];
    const firstPolicy = policyArr[0];
    if (firstPolicy?.policyConfigData) {
      const catConfig = firstPolicy.policyConfigData.find(
        (c) => c.travelCategory === travelCategory
      );
      if (catConfig?.bookingWindow != null) {
        const numericWin = parseInt(catConfig.bookingWindow, 10);
        if (numericWin < minWindow) {
          minWindow = numericWin;
        }
      }
    }
  });
  return minWindow === Infinity ? 0 : minWindow;
}

/**
 * @param {Object} travelerData - The traveler's data object (including usage)
 * @param {String} travelCategory - e.g. '2' for flights, '1' for hotels, '3' for train, etc.
 * @return {String[]} reasons array describing out-of-policy items
 */
export function getOutOfPolicyReasons(
  travelerData,
  travelCategory,
  config = {}
) {
  if (!travelerData || !travelCategory) return [];

  const { budgetCheckMethod = "split" } = config;

  // We'll store all reasons in an array
  const reasons = [];

  // 1) Locate the relevant policy config. e.g. flight => "2", hotel => "1", train => "3"
  const policyData =
    travelerData?.travelPolicyDetails?.[0]?.policyConfigData?.find(
      (config) => config.travelCategory === travelCategory
    );

  if (!policyData) return reasons;

  const getCabinClassLabel = (value) => {
    // Add debug logging
    console.log("getCabinClassLabel input:", value, "type:", typeof value);

    if (!CABIN_CLASS_OPTIONS || !Array.isArray(CABIN_CLASS_OPTIONS)) {
      console.warn("CABIN_CLASS_OPTIONS not properly defined");
      return value; // Return the original value as fallback
    }

    const option = CABIN_CLASS_OPTIONS.find(
      (opt) =>
        opt &&
        (opt.id === value ||
          opt.id === Number(value) ||
          opt.id === String(value))
    );

    const result = option?.label ?? value;
    console.log("getCabinClassLabel result:", result);
    return result;
  };
  const getCabinClassIdByLabel = (label) => {
    console.log("getCabinClassIdByLabel input:", label);

    if (!CABIN_CLASS_OPTIONS || !Array.isArray(CABIN_CLASS_OPTIONS)) {
      console.warn("CABIN_CLASS_OPTIONS not properly defined");
      return label;
    }

    const option = CABIN_CLASS_OPTIONS.find(
      (opt) =>
        opt &&
        opt.label &&
        opt.label.toLowerCase() === String(label).toLowerCase()
    );

    const result = option?.id ?? label;
    console.log("getCabinClassIdByLabel result:", result);
    return result;
  };

  // Helper function for checking array budgets (used for hotel/flight)
  const checkArrayBudget = (travelerData, policyData, reasons) => {
    if (Array.isArray(policyData.budget)) {
      const bObj = policyData.budget.find(
        (b) => String(b.regionalCategoryId) === String(travelerData.regionId)
      );

      if (bObj?.amount !== undefined) {
        const allowedBudget = bObj.amount;
        const usedBudget = travelerData.usedBudget;

        // If usedBudget is an array => multi-segment (e.g., round-trip, multi-city)
        if (Array.isArray(usedBudget)) {
          // Check if first element is a number or object
          if (typeof usedBudget[0] === "number") {
            // If any flight in the array exceeds allowedBudget => out of policy
            const outOfPolicySegments = usedBudget.filter(
              (seg) => seg > allowedBudget
            );

            if (outOfPolicySegments.length > 0) {
              reasons.push(
                `Budget exceeded for ${outOfPolicySegments.length} segment(s). ` +
                  `Allowed per flight: ${allowedBudget}, ` +
                  `used segments: ${outOfPolicySegments.join(", ")}`
              );
            }
          } else {
            // New logic for array of objects => e.g. [{ cost, origin, destination }]
            usedBudget.forEach((segObj) => {
              if (segObj?.cost > allowedBudget) {
                // Show origin/destination in the reason
                reasons.push(
                  `Budget exceeded for segment ${segObj.origin}-${segObj.destination}. Allowed: ${allowedBudget}, used: ${segObj.cost}`
                );
              }
            });
          }
        } else {
          // Single flight => normal logic
          if (usedBudget > allowedBudget) {
            reasons.push(
              `Budget exceeded. Allowed: ${allowedBudget}, used: ${usedBudget}`
            );
          }
        }
      }
    }
  };

  // Helper function for checking single budget value (used for train/bus/car)
  const checkSingleBudget = (travelerData, policyData, reasons) => {
    if (policyData.budget !== undefined && policyData.budget !== null) {
      const allowedBudget = policyData.budget;
      const usedBudget = travelerData.usedBudget;

      if (usedBudget > allowedBudget) {
        const transportType =
          travelCategory === "3"
            ? "train"
            : travelCategory === "4"
            ? "bus"
            : travelCategory === "5"
            ? "car rental"
            : "transport";

        reasons.push(
          `${transportType} budget exceeded. Allowed: ${allowedBudget}, used: ${usedBudget}`
        );
      }
    }
  };

  const checkApprovalConfig = (travelerData, policyData, reasons) => {
    if (
      reasons.length > 0 &&
      Array.isArray(policyData.approvalConfiguration) &&
      travelerData.showApprovalReason
    ) {
      const requiresApproval = policyData.approvalConfiguration.some(
        (config) =>
          Number(config.approvalConfigId) ===
          TRAVEL_POLICY_APPROVAL_IN_POLICY_ID
      );

      if (requiresApproval) {
        reasons.push("In‐policy bookings only. No out‐of‐policy allowed.");
      }
    }
  };

  // Decide logic based on category
  if (travelCategory === TRAVEL_CATEGORIES.FLIGHTS) {
    // Only check cabin class if it exists in travelerData
    if (travelerData.usedCabinClass && Array.isArray(policyData.cabinClass)) {
      console.log("Checking cabin class policy...");
      console.log("Used cabin class:", travelerData.usedCabinClass);
      console.log("Policy cabin classes:", policyData.cabinClass);

      const usedClassId = getCabinClassIdByLabel(travelerData.usedCabinClass);
      const allowedClassIds = policyData.cabinClass.filter(
        (id) => id !== null && id !== undefined
      );

      console.log("Used class ID:", usedClassId);
      console.log("Allowed class IDs:", allowedClassIds);

      if (allowedClassIds.length === 0) {
        console.warn("No valid cabin class IDs found in policy");
        // Skip cabin class check if no valid IDs
      } else {
        // If the policy says [3] => we want to allow 1,2,3 (Economy=1, Premium=2, Business=3)
        // So we find the maximum allowed rank:
        const maxAllowedRank = Math.max(...allowedClassIds);
        console.log("Max allowed rank:", maxAllowedRank);

        // If the traveler's used rank is GREATER than maxAllowed => out of policy
        if (Number(usedClassId) > maxAllowedRank) {
          // Convert the array of IDs to labels, filtering out invalid ones
          const allowedLabels = allowedClassIds
            .map((id) => {
              const label = getCabinClassLabel(id);
              return label && label !== String(id) ? label : null;
            })
            .filter(Boolean) // Remove null/undefined values
            .join(", ");

          console.log("Allowed labels:", allowedLabels);

          // If no valid labels found, create a fallback message
          const labelText =
            allowedLabels ||
            `level ${maxAllowedRank} or below (ID: ${allowedClassIds.join(
              ", "
            )})`;

          reasons.push(
            `Cabin class out of policy. Allowed up to: ${labelText}, used: ${travelerData.usedCabinClass}`
          );
        }
      }
    }

    // Budget check if "split" approach (per-traveler)
    if (
      budgetCheckMethod === "split" &&
      travelerData?.usedBudget !== undefined &&
      travelerData?.regionId !== undefined
    ) {
      checkArrayBudget(travelerData, policyData, reasons);
    }

    checkApprovalConfig(travelerData, policyData, reasons);
  } else if (travelCategory === TRAVEL_CATEGORIES.HOTELS) {
    // Only check hotel category if it exists // e.g. [3,4]
    // Check star rating / category
    if (
      travelerData?.usedHotelCategory &&
      Array.isArray(policyData.hotelCategory) &&
      policyData.hotelCategory.length > 0
    ) {
      const maxAllowedStar = Math.max(...policyData.hotelCategory);
      const starRating = Number(travelerData.usedHotelCategory);

      // Check if the used star rating is higher than maximum allowed
      if (starRating > maxAllowedStar) {
        reasons.push(
          `Hotel category out of policy. Allowed up to ${maxAllowedStar} stars, used stars: ${travelerData.usedHotelCategory}`
        );
      }
    }

    // Budget check if "split" approach (per-traveler)
    if (
      budgetCheckMethod === "split" &&
      travelerData?.usedBudget !== undefined &&
      travelerData?.regionId !== undefined
    ) {
      checkArrayBudget(travelerData, policyData, reasons);
    }

    checkApprovalConfig(travelerData, policyData, reasons);

    if (policyData.refundable === "1") {
      if (
        !travelerData.usedIsRefundable &&
        travelerData.usedIsRefundable !== undefined
      ) {
        reasons.push(
          "Policy requires booking a refundable hotel room, but selected is non-refundable."
        );
      }
    }
  }
  // Transport categories (train, bus, car rental)
  else if (["3", "4", "5"].includes(travelCategory)) {
    // Budget check for transport categories (single value)
    if (
      budgetCheckMethod === "split" &&
      travelerData?.usedBudget !== undefined
    ) {
      checkSingleBudget(travelerData, policyData, reasons);
    }

    // Check approval configuration
    checkApprovalConfig(travelerData, policyData, reasons);

    // Add any transport-specific checks here
    // For example, if there are specific rules for train/bus/car that should be checked
  }

  return reasons;
}

/**
 * Utility: Check if the matched corporateEmployee's flight policy
 * includes SSR Type = 3 (Seat selection).
 */
export const canSelectSeatForEmployee = (corporateEmployee) => {
  if (!corporateEmployee) return false;

  // Suppose employee has:
  //   emp.data.travelPolicyDetails => array of objects like { travelCategory: '2', ssrTypes: [...] }
  const flightPolicy =
    corporateEmployee.data.travelPolicyDetails?.[0]?.policyConfigData?.find(
      (pol) => pol.travelCategory === TRAVEL_CATEGORIES.FLIGHTS
    );

  if (!flightPolicy) return false;

  return (
    Array.isArray(flightPolicy.ssrTypes) &&
    flightPolicy.ssrTypes.includes(FLIGHT_SSR_SEAT_ID)
  );
};

export const canSelectMealForEmployee = (corporateEmployee) => {
  if (!corporateEmployee) return false;

  // Suppose employee has:
  //   emp.data.travelPolicyDetails => array of objects like { travelCategory: '2', ssrTypes: [...] }
  const flightPolicy =
    corporateEmployee.data.travelPolicyDetails?.[0]?.policyConfigData?.find(
      (pol) => pol.travelCategory === TRAVEL_CATEGORIES.FLIGHTS
    );

  if (!flightPolicy) return false;

  return (
    Array.isArray(flightPolicy.ssrTypes) &&
    flightPolicy.ssrTypes.includes(FLIGHT_SSR_MEAL_ID)
  );
};

export const canSelectBaggageForEmployee = (corporateEmployee) => {
  if (!corporateEmployee) return false;

  // Suppose employee has:
  //   emp.data.travelPolicyDetails => array of objects like { travelCategory: '2', ssrTypes: [...] }
  const flightPolicy =
    corporateEmployee.data.travelPolicyDetails?.[0]?.policyConfigData?.find(
      (pol) => pol.travelCategory === TRAVEL_CATEGORIES.FLIGHTS
    );

  if (!flightPolicy) return false;

  return (
    Array.isArray(flightPolicy.ssrTypes) &&
    flightPolicy.ssrTypes.includes(FLIGHT_SSR_BAGGAGE_ID)
  );
};

export const findTravelersMissingApproval = (
  data = {},
  travelCategory = TRAVEL_CATEGORIES.FLIGHTS,
  budgetCheckMethod = "split"
) => {
  // If no data or no employees, return false
  if (!data?.corporateEmployees || !Array.isArray(data.corporateEmployees)) {
    return false;
  }

  const result = data.corporateEmployees.some((traveler) => {
    // If no traveler data or policy details, this traveler doesn't need approval
    if (!traveler?.data?.travelPolicyDetails?.[0]?.policyConfigData) {
      return false;
    }

    const policyConfig =
      traveler.data.travelPolicyDetails[0].policyConfigData.find(
        (config) => config.travelCategory === travelCategory
      );

    // If no policy config found for this category, this traveler doesn't need approval
    if (!policyConfig || !policyConfig.approvalConfiguration) {
      return false;
    }

    const requiresApproval = policyConfig.approvalConfiguration.some(
      (config) =>
        Number(config.approvalConfigId) === TRAVEL_POLICY_APPROVAL_IN_POLICY_ID
    );

    // If doesn't require approval, this traveler doesn't need approval
    if (!requiresApproval) {
      return false;
    }

    // Check for out-of-policy reasons
    const outOfPolicyReasons = constructOutOfPolicyEmployees(
      data,
      travelCategory,
      { budgetCheckMethod }
    );

    // Return true only if there are out-of-policy reasons
    return outOfPolicyReasons.length > 0;
  });

  // Ensure we return a boolean
  return result === true;
};

export const findCorporateEmployeeForTraveler = (
  traveler,
  corporateEmployees
) => {
  if (!traveler || !corporateEmployees?.length) return null;
  const tFirst = traveler.firstName?.toLowerCase()?.trim() ?? "";
  const tLast = traveler.lastName?.toLowerCase()?.trim() ?? "";
  const tEmail = traveler.email?.toLowerCase()?.trim() ?? "";

  return corporateEmployees.find((emp) => {
    const eFirst = emp.data.firstName?.toLowerCase()?.trim() ?? "";
    const eLast = emp.data.lastName?.toLowerCase()?.trim() ?? "";
    const eEmail = emp.data.workEmail?.toLowerCase()?.trim() ?? "";
    // or match by employeeId if that's more reliable
    return eFirst === tFirst && eLast === tLast && eEmail === tEmail;
  });
};

export const refactorCorporateEmployeesForPolicyCheck = (
  employees,
  fieldsToAdd,
  sourceData
) => {
  return employees.map((employee) => {
    const additionalData = {};

    Object.entries(fieldsToAdd).forEach(([fieldName, valueGenerator]) => {
      // Only add the field if a value generator is provided and returns non-null/undefined value
      if (valueGenerator) {
        const value =
          typeof valueGenerator === "function"
            ? valueGenerator(sourceData, employee)
            : valueGenerator;

        if (value !== undefined && value !== null) {
          additionalData[fieldName] = value;
        }
      }
    });

    return {
      ...employee,
      data: {
        ...employee.data,
        ...additionalData,
      },
    };
  });
};

// Example usage for flights
export const getFlightEmployeeData = (data) => {
  const numTravelers = data?.corporateEmployees?.length;
  const costPerTraveler = Array.isArray(data?.totalAmount)
    ? data?.totalAmount.map((amount) =>
        typeof amount === "number" ? amount / numTravelers : amount
      )
    : data?.totalAmount / numTravelers;

  const flightFields = {
    usedCabinClass: () => data?.flightCabinClass,
    usedBudget: () => costPerTraveler,
    regionId: () => data?.regionId,
    showApprovalReason: () => data?.showApprovalReason,
  };

  return refactorCorporateEmployeesForPolicyCheck(
    data.corporateEmployees,
    flightFields,
    data
  );
};

// Example usage for hotels
export const getHotelEmployeeData = (data) => {
  const hotelFields = {
    usedHotelCategory: () => data?.hotelCategory,
    usedBudget: () => data?.totalAmount,
    regionId: () => data?.regionId,
    showApprovalReason: () => data?.showApprovalReason,
    usedIsRefundable: () => data?.isRefundable,
  };

  return refactorCorporateEmployeesForPolicyCheck(
    data.corporateEmployees,
    hotelFields,
    data
  );
};

// New: Example usage for trains
export const getTrainEmployeeData = (data) => {
  const numTravelers = data?.corporateEmployees?.length;
  const costPerTraveler =
    typeof data?.totalAmount === "number"
      ? data.totalAmount / numTravelers
      : data?.totalAmount;

  const trainFields = {
    usedBudget: () => costPerTraveler,
    showApprovalReason: () => data?.showApprovalReason,
  };

  return refactorCorporateEmployeesForPolicyCheck(
    data.corporateEmployees,
    trainFields,
    data
  );
};

// New: Example usage for buses
export const getBusEmployeeData = (data) => {
  const numTravelers = data?.corporateEmployees?.length;
  const costPerTraveler =
    typeof data?.totalAmount === "number"
      ? data.totalAmount / numTravelers
      : data?.totalAmount;

  const busFields = {
    usedBudget: () => costPerTraveler,
    showApprovalReason: () => data?.showApprovalReason,
  };

  return refactorCorporateEmployeesForPolicyCheck(
    data.corporateEmployees,
    busFields,
    data
  );
};

// New: Example usage for car rentals
export const getCarEmployeeData = (data) => {
  const numTravelers = data?.corporateEmployees?.length;
  const costPerTraveler =
    typeof data?.totalAmount === "number"
      ? data.totalAmount / numTravelers
      : data?.totalAmount;

  const carFields = {
    usedBudget: () => costPerTraveler,
    showApprovalReason: () => data?.showApprovalReason,
  };

  return refactorCorporateEmployeesForPolicyCheck(
    data.corporateEmployees,
    carFields,
    data
  );
};

export const constructOutOfPolicyEmployees = (
  data,
  travelCategory,
  options = {}
) => {
  // Guard clause for invalid data
  if (!data?.corporateEmployees?.length) {
    return [];
  }

  const { budgetCheckMethod = "split" } = options;

  const calculateCostPerTraveler = (totalAmount, numTravelers) => {
    // For hotels (category 1), use full amount per traveler
    if (travelCategory === TRAVEL_CATEGORIES.HOTELS) {
      return totalAmount;
    }

    // For other categories, split the amount
    return Array.isArray(totalAmount)
      ? totalAmount.map((amount) =>
          typeof amount === "number" ? amount / numTravelers : amount
        )
      : totalAmount / numTravelers;
  };

  // Get the appropriate field configuration based on travel category
  const fieldConfig = TRAVEL_FIELD_CONFIGS[travelCategory];

  if (!fieldConfig) {
    console.warn(`Unknown travel category: ${travelCategory}`);
    return [];
  }

  // First transform the employee data with the appropriate fields
  const transformedEmployees = refactorCorporateEmployeesForPolicyCheck(
    data.corporateEmployees,
    fieldConfig,
    data
  );

  // 2) If using 'collective' approach, figure out group budget
  let finalTransformed = [...transformedEmployees];

  if (budgetCheckMethod === "collective") {
    // Sum budgets across all travelers
    const isTransportCategory = ["3", "4", "5"].includes(travelCategory);

    if (isTransportCategory) {
      // For transport categories, sum single budget values
      const sumOfAllBudgets = transformedEmployees.reduce((acc, emp) => {
        let singleBudget = 0;
        const policy =
          emp?.data?.travelPolicyDetails?.[0]?.policyConfigData?.find(
            (p) => p.travelCategory === travelCategory
          );
        if (policy?.budget !== undefined && policy?.budget !== null) {
          singleBudget = policy.budget || 0;
        }
        return acc + singleBudget;
      }, 0);

      if (sumOfAllBudgets < data.totalAmount) {
        // Force them all out-of-policy for budget reason
        finalTransformed = transformedEmployees.map((emp) => ({
          ...emp,
          data: {
            ...emp.data,
            forcedOutOfPolicyReason: `Budget exceeded collectively. 
              Sum of budgets=${sumOfAllBudgets}, cost=${data.totalAmount}`,
          },
        }));
      }
    } else {
      // For hotel/flight categories, sum region-specific budgets
      const sumOfAllBudgets = transformedEmployees.reduce((acc, emp) => {
        let regionBudget = 0;
        const policy =
          emp?.data?.travelPolicyDetails?.[0]?.policyConfigData?.find(
            (p) => p.travelCategory === travelCategory
          );
        if (policy?.budget?.length) {
          const bMatch = policy.budget.find(
            (b) => String(b.regionalCategoryId) === String(emp.data.regionId)
          );
          regionBudget = bMatch?.amount || 0;
        }
        return acc + regionBudget;
      }, 0);

      if (sumOfAllBudgets < data.totalAmount) {
        // Force them all out-of-policy for budget reason
        finalTransformed = transformedEmployees.map((emp) => ({
          ...emp,
          data: {
            ...emp.data,
            forcedOutOfPolicyReason: `Budget exceeded collectively. 
              Sum of budgets=${sumOfAllBudgets}, cost=${data.totalAmount}`,
          },
        }));
      }
    }
  } else {
    // 'split' => cost-per-traveler
    const numTravelers = transformedEmployees.length;
    const costPerTraveler = calculateCostPerTraveler(
      data.totalAmount,
      numTravelers
    );

    finalTransformed = transformedEmployees.map((emp) => ({
      ...emp,
      data: {
        ...emp.data,
        usedBudget: costPerTraveler,
      },
    }));
  }

  // 3) Gather who is out-of-policy
  const outOfPolicy = finalTransformed
    .map((employee) => {
      const baseReasons = getOutOfPolicyReasons(employee.data, travelCategory, {
        budgetCheckMethod,
      });
      let reasons = [...baseReasons];
      if (employee.data.forcedOutOfPolicyReason) {
        reasons.push(employee.data.forcedOutOfPolicyReason);
      }
      if (reasons.length === 0) return null; // in-policy
      return {
        name: `${employee?.data?.firstName} ${employee?.data?.lastName}`,
        reasons,
      };
    })
    .filter(Boolean);

  return outOfPolicy;
};

/**
 * @param {Object[]} employees - Array of employee objects
 * @param {number} regionId - 1 => domestic, 2 => international
 * @returns {Object} { maxStarRating: number, maxBudget: number }
 */
export function getMaxStarRatingAndBudget(employees, regionId = 1) {
  let maxStarRating = 0; // will track the highest star rating
  let maxBudget = 0; // will track the highest budget for the region

  if (!employees || !employees.length) {
    return { maxStarRating: 0, maxBudget: 0 };
  }

  // For each employee => read the "hotel" policy => find the maximum star rating array => take its max
  // also read the budget array => find the budget for regionId => keep track of the max
  employees.forEach((emp) => {
    const policyDetails = emp?.data?.travelPolicyDetails?.[0]?.policyConfigData;
    if (!policyDetails || !Array.isArray(policyDetails)) return;

    const hotelPolicy = policyDetails.find(
      (p) => String(p.travelCategory) === TRAVEL_CATEGORIES.HOTELS // "1" => hotels
    );
    if (!hotelPolicy) return;

    // 1) star rating
    if (
      Array.isArray(hotelPolicy.hotelCategory) &&
      hotelPolicy.hotelCategory.length
    ) {
      const employeeMaxStar = Math.max(...hotelPolicy.hotelCategory);
      if (employeeMaxStar > maxStarRating) {
        maxStarRating = employeeMaxStar;
      }
    }

    // 2) budgets
    // e.g. budget: [{ regionalCategoryId: 1, amount: 4000}, { regionalCategoryId:2, amount:7000 }]
    if (Array.isArray(hotelPolicy.budget)) {
      const budgetForRegion = hotelPolicy.budget.find(
        (b) => Number(b.regionalCategoryId) === Number(regionId)
      );
      if (budgetForRegion?.amount && budgetForRegion.amount > maxBudget) {
        maxBudget = budgetForRegion.amount;
      }
    }
  });

  return { maxStarRating, maxBudget };
}

// New: Get max budget for transport categories (train, bus, car)
export function getMaxBudgetForTransport(employees, travelCategory) {
  let maxBudget = 0;

  if (
    !employees ||
    !employees.length ||
    !["3", "4", "5"].includes(travelCategory)
  ) {
    return maxBudget;
  }

  // For each employee, read the policy for specified transport category
  employees.forEach((emp) => {
    const policyDetails = emp?.data?.travelPolicyDetails?.[0]?.policyConfigData;
    if (!policyDetails || !Array.isArray(policyDetails)) return;

    const transportPolicy = policyDetails.find(
      (p) => String(p.travelCategory) === travelCategory
    );
    if (!transportPolicy) return;

    // Check single budget value
    if (
      transportPolicy.budget !== undefined &&
      transportPolicy.budget !== null
    ) {
      const budget = parseFloat(transportPolicy.budget);
      if (!isNaN(budget) && budget > maxBudget) {
        maxBudget = budget;
      }
    }
  });

  return maxBudget;
}
