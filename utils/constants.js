export const MODULE_ROUTES = {
  1: {
    name: "Booking",
    route: "/corporate/auth/booking",
    nestedRoutes: [
      "/corporate/auth/booking/flights/flightListing",
      "/corporate/auth/booking/flights/review",
      "/corporate/auth/booking/flights/flightApproval",
      "/corporate/auth/booking/flights/flightConfirm",
      "/corporate/auth/booking/hotels/hotelListing",
      "/corporate/auth/booking/hotels/reviewBooking",
      "/corporate/auth/booking/hotels/approvalStatus",
      "/corporate/auth/booking/hotels/confirmation",
    ],
  },
  2: {
    name: "Company",
    route: "/corporate/auth/company",
    nestedRoutes: [],
  },
  3: {
    name: "Approvals",
    route: "/corporate/auth/booking/approval",
    nestedRoutes: [],
  },
  4: {
    name: "Configuration",
    route: "/corporate/auth/Configuration",
    nestedRoutes: [],
  },
  // 5: {
  //   name: "Dashboard",
  //   route: "/corporate/auth/dashboard",
  //   nestedRoutes: [],
  // },
};

export const PAYMENT_URLS = {
  TRAVEL: {
    1: {
      BOOKING: {
        DEFAULT: "/bookings/hotels/confirmation",
        CORPORATE: "/corporate/auth/booking/hotels/confirmation", // URL when companyId exists
      },
    },
    2: {
      BOOKING: {
        DEFAULT: "/bookings/confirmation",
        CORPORATE: "/corporate/auth/booking/flights/flightConfirm", // URL when companyId exists
      },
    },
    3: {
      BOOKING: {
        DEFAULT: "/packages/confirmbooking",
      },
    },
  },
  WALLET_RECHARGE: {
    DEFAULT: "", // Will use currentPath
  },
};

export const FLIGHT_MAX_ADULT_SELECTION = 9;
export const FLIGHT_MIN_ADULT_SELECTION = 1;
export const HOTEL_MAX_ADULT_SELECTION = 8;
export const HOTEL_MIN_ADULT_SELECTION = 1;
export const HOTEL_MAX_ROOM_SELECTION = 6;

export const TRAIN_MIN_ADULT_SELECTION = 1;
export const TRAIN_MAX_ADULT_SELECTION = 4;
export const BUS_MIN_ADULT_SELECTION = 1;
export const BUS_MAX_ADULT_SELECTION = 4;
export const CAR_MIN_ADULT_SELECTION = 1;
export const CAR_MAX_ADULT_SELECTION = 4;

export const HOTEL_BUDGET_DOMESTIC_ID = 1;
export const HOTEL_BUDGET_INTERNATIONAL_ID = 2;
export const HOTEL_FILTER_BREAKFAST_ID = 1;
export const HOTEL_FILTER_LUNCH_ID = 2;
export const HOTEL_FILTER_DINNER_ID = 3;

export const FLIGHT_SSR_MEAL_ID = 1;
export const FLIGHT_SSR_BAGGAGE_ID = 2;
export const FLIGHT_SSR_SEAT_ID = 3;
export const FLIGHT_BUDGET_DOMESTIC_ID = 1;
export const FLIGHT_BUDGET_INTERNATIONAL_ID = 2;

export const TRAVEL_POLICY_APPROVAL_IN_POLICY_ID = 1;

export const WHATSAPP_SHARE_LIMIT = 10;

export const TRAVEL_CATEGORIES = {
  HOTELS: "1",
  FLIGHTS: "2",
  TRAINS: "3",
  BUS: "4",
  CAR_RENTAL: "5",
};

export const CABIN_CLASS_OPTIONS = [
  { id: 1, value: "2", label: "Economy" },
  { id: 2, value: "3", label: "Premium Economy" },
  { id: 3, value: "4", label: "Business" },
  { id: 4, value: "6", label: "First Class" },
];

export const TRAVEL_FIELD_CONFIGS = {
  [TRAVEL_CATEGORIES.FLIGHTS]: {
    usedCabinClass: (data) => data?.flightCabinClass,
    usedBudget: (data) => data?.totalAmount,
    regionId: (data) => data?.regionId,
    showApprovalReason: (data) => data?.showApprovalReason ?? false,
  },
  [TRAVEL_CATEGORIES.HOTELS]: {
    usedHotelCategory: (data) => data?.hotelCategory,
    usedBudget: (data) => data?.totalAmount,
    regionId: (data) => data?.regionId,
    showApprovalReason: (data) => data?.showApprovalReason ?? false,
    usedIsRefundable: (data) => data?.isRefundable,
  },
};

export const FLIGHT_INPOLICY_CONTENT =
  "Only in-policy bookings can be booked. Choose another flight within the policy.";
export const HOTEL_INPOLICY_CONTENT =
  "Only in-policy bookings can be booked. Choose another hotel within the policy.";
