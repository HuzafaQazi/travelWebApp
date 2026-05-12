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
} from "../constants";

export const getLowestMaxCabinClass = (travelers) => {
  // If no travelers => default to rank=4 => user can pick “First Class”
  if (!travelers.length) return 4;

  // For each traveler, find the max cabin rank from their policy
  const perTravelerMaxRanks = travelers.map((travObj) => {
    const data = travObj?.data;
    if (!data?.travelPolicyDetails?.length) {
      // no policy => no restriction => rank=4
      return 4;
    }
    // Attempt to find flight config => travelCategory="2"
    let travelerMaxRank = 4; // fallback= “First Class”
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
            // but let's assume “1 => rank1, 2 => rank2, 3 => rank3, 4 => rank4”
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

export const interpretHotelEligibility = (travelPolicyData, travelCategory) => {
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

export const getMaxAllowedTravelers = (travelPolicyData, travelCategory) => {
  // If no policy, default => multiple
  if (!travelPolicyData || travelPolicyData.length === 0) {
    // fallback => 9
    return 9;
  }

  // find the config that has travelCategory === "2" (flights) or "1" (hotels)
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

/**
 * @param {Array} travelers - array of selected travelers (each { value, label, data: {...} }).
 * @param {string} travelCategory - "1" (hotels) or "2" (flights).
 * @returns {Object} e.g. { 1: 3000, 2: 8000, 3: 10000 } => min allowed budget for each region
 */

export const getMinBudgetsAcrossTravelers = (travelers, travelCategory) => {
  // We'll store region => min
  const budgetMap = {};

  // If no travelers or invalid input, return map with Infinity for all potential regions
  if (!travelers?.length) {
    // Add infinity values for both domestic and international
    budgetMap[FLIGHT_BUDGET_DOMESTIC_ID] = Infinity;
    budgetMap[FLIGHT_BUDGET_INTERNATIONAL_ID] = Infinity;
    return budgetMap;
  }

  // For each traveler, find the policyConfigData that matches travelCategory
  travelers.forEach((travObj) => {
    const data = travObj?.data;
    if (!data?.travelPolicyDetails?.length) return;

    const policyForCat = data.travelPolicyDetails[0]?.policyConfigData?.find(
      (c) => c.travelCategory === travelCategory
    );
    // e.g. policyForCat?.budget => [{ regionalCategoryId, amount }, ...]
    if (!policyForCat?.budget?.length) return;

    // For each budget item, update budgetMap with min
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
  });

  // For any region that didn't get a valid budget, set to Infinity
  if (!budgetMap[FLIGHT_BUDGET_DOMESTIC_ID]) {
    budgetMap[FLIGHT_BUDGET_DOMESTIC_ID] = Infinity;
  }
  if (!budgetMap[FLIGHT_BUDGET_INTERNATIONAL_ID]) {
    budgetMap[FLIGHT_BUDGET_INTERNATIONAL_ID] = Infinity;
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
 * @param {String} travelCategory - e.g. '2' for flights, '1' for hotels, etc.
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

  // 1) Locate the relevant policy config. e.g. flight => "2", hotel => "1"
  const policyData =
    travelerData?.travelPolicyDetails?.[0]?.policyConfigData?.find(
      (config) => config.travelCategory === travelCategory
    );

  if (!policyData) return reasons;

  const getCabinClassLabel = (value) => {
    const option = CABIN_CLASS_OPTIONS.find((opt) => opt.id === value);
    return option?.label ?? value;
  };
  const getCabinClassIdByLabel = (label) => {
    const option = CABIN_CLASS_OPTIONS.find((opt) => opt.label === label);
    return option?.id ?? label;
  };
  const checkBudget = (travelerData, policyData, reasons) => {
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

  const checkApprovalConfig = (travelerData, policyData, reasons) => {
    if (
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
      // 'policyData.cabinClass' is an array of numeric IDs (e.g. [2, 3])
      // 'usedCabinClass' is a string label (e.g. "Economy", "Business")

      const usedClassId = getCabinClassIdByLabel(travelerData.usedCabinClass);
      const allowedClassIds = policyData.cabinClass; // e.g. [3]

      // If the policy says [3] => we want to allow 1,2,3 (Economy=1, Premium=2, Business=3)
      // So we find the maximum allowed rank:
      const maxAllowedRank = Math.max(...allowedClassIds);

      // If the traveler's used rank is GREATER than maxAllowed => out of policy
      if (usedClassId > maxAllowedRank) {
        // Convert the array of IDs to labels (e.g. [3] => "Business")
        const allowedLabels = allowedClassIds
          .map((id) => getCabinClassLabel(id))
          .join(", ");

        reasons.push(
          `Cabin class out of policy. Allowed up to: ${allowedLabels}, used: ${travelerData.usedCabinClass}`
        );
      }
    }

    // Budget check if "split" approach (per-traveler)
    if (
      budgetCheckMethod === "split" &&
      travelerData?.usedBudget !== undefined &&
      travelerData?.regionId !== undefined
    ) {
      checkBudget(travelerData, policyData, reasons);
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
      checkBudget(travelerData, policyData, reasons);
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

  return reasons;
}

/**
 * Utility: Check if the matched corporateEmployee’s flight policy
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
    // or match by employeeId if that’s more reliable
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
