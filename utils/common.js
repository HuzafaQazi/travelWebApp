import axios, {
  getQugoLoggedInUserDetails,
  getTabId,
  setTabSpecificData,
  getTabSpecificData,
  removeTabSpecificData,
  setActiveUserType,
} from "@/utils/axios/axios";
import config from "@/config";
import Router from "next/router";
import pako from "pako";
import { store } from "@/store/store";
import { loginUser } from "@/store/slices/userSlice";

export const getCountry = async () => {
  let responseData = [];
  try {
    const { data } = await axios.get(`${config.CORPORATE.COUNTRY}`, {
      authRequired: false,
    });
    if (data.status === "SUCCESS") {
      responseData = data.data;
    }
    return responseData;
  } catch (error) {
    console.log(error);
    throw error;
  }
};

export const getCity = async () => {
  let responseData = [];
  try {
    const { data } = await axios.get(`${config.CORPORATE.CITY}`, {
      authRequired: false,
    });
    if (data.status === "SUCCESS") {
      responseData = data.data.Cities;
    }
    return responseData;
  } catch (error) {
    console.log(error);
    throw error;
  }
};

export const getCityByCountry = async (cityName, countryCode) => {
  let responseData = [];
  try {
    const signal = createAbortController();
    const { data } = await axios.get(
      `${
        config.CORPORATE.CITY_BY_COUNTRY
      }?cityname=${cityName.trim()}&countrycode=${countryCode}`,
      {
        authRequired: false,
        signal: signal,
      }
    );
    if (data.status === "SUCCESS") {
      responseData = data.data;
    }
    return responseData;
  } catch (error) {
    console.log(error);
    throw error;
  }
};

export const loadCityOptions = async (inputValue, countryCode) => {
  try {
    if (inputValue) {
      const cities = await getCityByCountry(inputValue, countryCode);
      const options = cities.map((city) => ({
        value: city.citycode,
        label: city.cityname,
      }));
      return options;
    } else {
      return [];
    }
  } catch (error) {
    return [];
  }
};

export const switchToQugo = async () => {
  try {
    const sessionStorageItems = [
      { key: "accessToken" },
      { key: "phoneNumber" },
      { key: "userID" },
      { key: "userId" },
      { key: "userDetails" },
    ];

    sessionStorageItems.forEach(({ key, value }) => {
      if (value) {
        setTabSpecificData(key, `${value}`);
      } else {
        removeTabSpecificData(key);
      }
    });

    setActiveUserType("qugo");
    await Router.push("/bookings");
    window.dispatchEvent(new CustomEvent("userTypeChanged"));
  } catch (error) {
    console.error("Error switching to Qugo:", error);
  }
};

export const switchToCorporate = async () => {
  try {
    // Remove tab-specific data if no user info
    const keysToRemove = [
      "accessToken",
      "phoneNumber",
      "userID",
      "userId",
      "userDetails",
    ];
    keysToRemove.forEach((key) => {
      if (getTabSpecificData(key)) {
        removeTabSpecificData(key);
      }
    });
    setActiveUserType("corporate");
    await Router.push("/corporate");
    window.dispatchEvent(new CustomEvent("userTypeChanged"));
  } catch (error) {
    console.log(error);
  }
};

export const isCorporateUser = () => {
  return Boolean(getTabSpecificData("activeUserType") === "corporate");
};

export const formatPrice = (price) => {
  if (price) {
    return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  }
  return 0;
};

const abortControllerStore = {
  current: null,
};

export const createAbortController = () => {
  if (abortControllerStore.current) {
    abortControllerStore.current.abort(); // Cancel previous request
  }
  const abortController = new AbortController();
  abortControllerStore.current = abortController;
  return abortController.signal;
};

export const updateCorporateUserLocalStorage = (updatedUserData) => {
  try {
    // Retrieve existing corporate user details
    const compressedData = getTabSpecificData("corporateUserDetails");

    if (!compressedData) {
      console.error("No corporate user details found in local storage.");
      return;
    }

    // Decompress the existing data
    const numbersArray = compressedData.split(",").map(Number);
    const compressedUint8Array = new Uint8Array(numbersArray);
    const decodedData = pako.inflate(compressedUint8Array, { to: "string" });
    const existingDetails = JSON.parse(decodedData);

    // Update the user details in the existing data
    existingDetails.userDetails = {
      ...existingDetails.userDetails,
      ...updatedUserData,
    };

    // Compress and store the updated data back to local storage
    const updatedCompressedData = pako.deflate(JSON.stringify(existingDetails));

    setTabSpecificData("corporateUserDetails", updatedCompressedData);

    const updatedData = {
      userId: existingDetails.userDetails._id,
      companyId: existingDetails.companyDetails._id,
      loggedInDetails: existingDetails,
      tabId: getTabId(),
    };
    store.dispatch(loginUser(updatedData));
  } catch (error) {
    console.error(
      "Failed to update corporate user details in local storage:",
      error
    );
  }
};

export const transformDepartments = (data) => {
  const list = data.departments || [];
  return list.map((i) => ({
    value: i.departmentId,
    label: i.departmentName,
    hasTravelPolicy: i.isTravelPolicyExists,
  }));
};

export const transformRoles = (data) => {
  const roles = data.userRoles || [];
  return roles.map((r) => ({ value: r.userRoleId, label: r.userRoleName }));
};

export const transformLevels = (data) => {
  const items = data.levels || [];
  return items.map((i) => ({
    value: i.levelId,
    label: i.level,
    hasTravelPolicy: i.isTravelPolicyExists,
  }));
};

export const transformBands = (data) => {
  const list = data?.bands || [];
  return list.map((b) => ({
    value: b.bandId,
    label: b.band,
    hasTravelPolicy: b.isTravelPolicyExists,
  }));
};

export const transformDesignations = (data) => {
  const desigs = data?.designations || [];
  return desigs.map((d) => ({
    value: d.designationId,
    label: d.designation,
    hasTravelPolicy: d.isTravelPolicyExists,
  }));
};

export const transformEmployees = (data) => {
  const employees = data?.users || [];
  return employees.map((e) => ({
    value: e._id,
    label: `${e.firstName} ${e.lastName}`,
    hasTravelPolicy: e.travelPolicyDetails.length > 0,
  }));
};

export const checkIfRoomRefundable = (room) => {
  if (!room?.cancellationPolicies?.length) {
    return false; // no policy => assume non-refundable
  }
  const now = new Date();
  const totalRoomCost = room.price?.qOfferedPriceRoundedOff || 0;
  for (const policy of room.cancellationPolicies) {
    const policyStart = new Date(policy.FromDate);
    if (policyStart > now) {
      if (policy.ChargeType === 2) {
        if (policy.Charge < 100) {
          return true;
        }
      } else if (policy.ChargeType === 1) {
        if (policy.Charge < totalRoomCost) {
          return true;
        }
      }
    }
  }
  return false;
};

export const transformTravelPolicy = (policy) => {
  if (!policy) return null;
  return {
    _id: policy._id,
    travelPolicyName: policy.travelPolicyName,
    policyConfigData: (policy.policyConfigData || []).map((config) => {
      if (config.travelCategory === "2") {
        // Flight policy transformation
        return {
          travelCategory: config.travelCategory,
          eligibility: config.eligibility || [],
          budget: (config.budget || []).map((b) => ({
            regionalCategoryId: b.regionalCategoryId,
            amount: b.amount,
          })),
          cabinClass: (config.cabinClass || []).map((c) => c.cabinClassId),
          ssrTypes: (config.ssrTypes || []).map((s) => s.ssrTypeId),
          dateChangeAllowed: config.dateChangeAllowed,
          bookingWindow: config.bookingWindow,
          approvalConfiguration: (config.approvalConfiguration || []).map(
            (a) => ({
              approvalConfigId: a.approvalConfigId,
            })
          ),
        };
      } else if (config.travelCategory === "1") {
        // Hotel policy transformation
        return {
          travelCategory: config.travelCategory,
          refundable: config.refundable,
          eligibility: config.eligibility || [],
          budget: (config.budget || []).map((b) => ({
            regionalCategoryId: b.regionalCategoryId,
            amount: b.amount,
          })),
          hotelCategory: (config.hotelCategory || []).map(
            (h) => h.hotelCategoryId
          ),
          filters: config.filters || [],
          dateChangeAllowed: config.dateChangeAllowed,
          bookingWindow: config.bookingWindow,
          approvalConfiguration: (config.approvalConfiguration || []).map(
            (a) => ({
              approvalConfigId: a.approvalConfigId,
            })
          ),
        };
      } else {
        // If unknown travelCategory, return as is
        return config;
      }
    }),
  };
};

export function getUserCountryCode(reduxUser) {
  const reduxUserCountryCode =
    reduxUser?.loggedInDetails?.companyDetails?.countryDetails?.alpha2code;
  // 1) Try Redux
  if (
    reduxUser &&
    typeof reduxUserCountryCode === "string" &&
    reduxUserCountryCode
  ) {
    return reduxUserCountryCode;
  }

  // 2) Fallback to localStorage
  try {
    const raw = getTabSpecificData("userLocation");
    if (!raw) return null;

    const loc = JSON.parse(raw);
    // ipapi.co returns “country”, “country_code”, or “country_code_iso3” keys
    return (
      loc.country_code ||
      loc.country?.toString() || // if you stored under `country`
      loc.countryCode || // or some other key
      null
    );
  } catch {
    return null;
  }
}

export const extractFlightSegmentsInfo = (flightData) => {
  if (!flightData?.fareQuote?.data)
    return { uniqueAirlines: [], allRoutes: [] };

  const allRoutes = [];

  flightData.fareQuote.data.forEach((fareQuoteItem, index) => {
    const segments = fareQuoteItem.data.segments;

    segments.forEach((segment, segmentIndex) => {
      const firstSegment = segment.segment[0];
      const lastSegment = segment.segment[segment.segment.length - 1];

      const origin = firstSegment.origin.airport.cityCode;
      const destination = lastSegment.destination.airport.cityCode;
      const airlineCode = firstSegment.airline.airlineCode;
      const airlineName = firstSegment.airline.airlineName;

      // Create a unique identifier for this route-airline combination
      const routeId = `${origin}-${destination}-${airlineCode}`;

      allRoutes.push({
        routeId,
        origin,
        destination,
        airlineCode,
        airlineName,
        segmentType: index === 0 ? "outbound" : "inbound",
        segmentIndex: segmentIndex,
      });
    });
  });

  // Get unique airlines (for UI display)
  const uniqueAirlines = allRoutes.filter(
    (route, index, self) =>
      index === self.findIndex((r) => r.airlineCode === route.airlineCode)
  );

  return { uniqueAirlines, allRoutes };
};
