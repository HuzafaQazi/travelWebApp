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

// ============================================================================
// WEYNGO BRAND DESIGN SYSTEM CONSTANTS
// Palette: White + Navy + Blue with Violet accents
// ============================================================================

export const WEYNGO_LOGO = "/img/weyngo_logo.png";

// Base Color Palette
export const WEYNGO_COLORS = {
  // Brand Blues
  primaryBlue: "#155EEF",     // Primary CTA, selected tab/option, feature icons, focus ring
  vibrantBlue: "#2589FF",     // Active tab, active underline, hover states
  deepNavy: "#071B49",        // Brand navy for headings, title text, dark contrast

  // Brand Accents
  violetPurple: "#6D28D9",    // Secondary CTA, gradient transition end
  premiumPurple: "#8B2BE2",   // AI / Luxury / Premium badges & highlights
  specialAccent: "#C026D3",   // Special highlights, fuchsia accents

  // Surfaces & Backgrounds
  white: "#FFFFFF",           // Card backgrounds, white contrast
  pageBg: "#F8FAFC",          // Clean slate-50 page background
  cardBg: "#FFFFFF",          // Elevated card background
  heroOverlay: "rgba(7, 27, 73, 0.72)", // Deep navy translucent hero overlay

  // Text Colors
  textMain: "#0F172A",        // High contrast primary body text (slate-900)
  textSecondary: "#475569",   // Muted descriptive text (slate-600)
  textMuted: "#94A3B8",       // Subtle disabled/caption text (slate-400)
  textLight: "#FFFFFF",       // White text on dark/gradient backgrounds

  // Borders & Inputs
  borderLight: "#E2E8F0",     // Default subtle card & input border
  inputFocus: "#155EEF",      // Input focus border & ring
  inputHover: "#2589FF",      // Input hover border
};

// Gradients
export const WEYNGO_GRADIENTS = {
  searchButton: "linear-gradient(90deg, #155EEF 0%, #6D28D9 100%)",
  internationalUnderline: "linear-gradient(90deg, #155EEF 0%, #6D28D9 100%)",
  primaryCTA: "linear-gradient(90deg, #155EEF 0%, #6D28D9 100%)",
  logoFlow: "linear-gradient(90deg, #155EEF 0%, #2589FF 35%, #6D28D9 75%, #8B2BE2 100%)",
  subtleCard: "linear-gradient(135deg, rgba(21, 94, 239, 0.05) 0%, rgba(109, 40, 217, 0.05) 100%)",
};

// Element-Specific Color Mapping (exact specification)
export const WEYNGO_ELEMENT_COLORS = {
  // Existing element -> New color mapping
  flightsActiveTab: "#2589FF",
  activeUnderline: "#2589FF",
  oneWaySelected: "#155EEF",
  searchButton: "linear-gradient(90deg, #155EEF 0%, #6D28D9 100%)",
  featureIcons: "#155EEF",
  featureHeadings: "#071B49",
  internationalTripsHeading: "#071B49",
  internationalTripsUnderline: "linear-gradient(90deg, #155EEF 0%, #6D28D9 100%)",
  heroOverlay: "rgba(7, 27, 73, 0.72)",
  inputFocus: "#155EEF",
  inputHover: "#2589FF",
  primaryCTA: "#155EEF",
  secondaryCTA: "#6D28D9",
  premiumAIElements: "#8B2BE2",
  specialAccent: "#C026D3",
  whiteCards: "#FFFFFF",
  pageBackground: "#F8FAFC",
  mainText: "#0F172A",
  secondaryText: "#475569",
};

// Background Color Utilities
export const WEYNGO_BG_COLORS = {
  page: "#F8FAFC",
  card: "#FFFFFF",
  heroOverlay: "rgba(7, 27, 73, 0.72)",
  activeTab: "#2589FF",
  selectedOption: "#155EEF",
  primaryCTA: "#155EEF",
  secondaryCTA: "#6D28D9",
  searchButtonGradient: "linear-gradient(90deg, #155EEF 0%, #6D28D9 100%)",
  subtleBlue: "rgba(21, 94, 239, 0.08)",
  subtleViolet: "rgba(109, 40, 217, 0.08)",
};

// Font Colors
export const WEYNGO_FONT_COLORS = {
  main: "#0F172A",
  secondary: "#475569",
  heading: "#071B49",
  primary: "#155EEF",
  active: "#2589FF",
  violet: "#6D28D9",
  premium: "#8B2BE2",
  accent: "#C026D3",
  white: "#FFFFFF",
  muted: "#94A3B8",
};

// Font Families
export const WEYNGO_FONT_FAMILIES = {
  primary: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
  secondary: "'Roboto', sans-serif",
  headings: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
};

// Ready-to-use Font and Typography Styles
export const WEYNGO_FONT_STYLES = {
  h1: {
    fontFamily: WEYNGO_FONT_FAMILIES.headings,
    color: WEYNGO_FONT_COLORS.heading,
    fontWeight: 700,
    fontSize: "2rem",
    lineHeight: 1.2,
  },
  h2: {
    fontFamily: WEYNGO_FONT_FAMILIES.headings,
    color: WEYNGO_FONT_COLORS.heading,
    fontWeight: 700,
    fontSize: "1.5rem",
    lineHeight: 1.3,
  },
  h3: {
    fontFamily: WEYNGO_FONT_FAMILIES.headings,
    color: WEYNGO_FONT_COLORS.heading,
    fontWeight: 600,
    fontSize: "1.25rem",
    lineHeight: 1.4,
  },
  featureHeading: {
    fontFamily: WEYNGO_FONT_FAMILIES.headings,
    color: WEYNGO_FONT_COLORS.heading,
    fontWeight: 700,
    fontSize: "1.1rem",
  },
  sectionHeading: {
    fontFamily: WEYNGO_FONT_FAMILIES.headings,
    color: WEYNGO_FONT_COLORS.heading,
    fontWeight: 700,
  },
  mainText: {
    fontFamily: WEYNGO_FONT_FAMILIES.primary,
    color: WEYNGO_FONT_COLORS.main,
    fontSize: "0.95rem",
    lineHeight: 1.5,
  },
  secondaryText: {
    fontFamily: WEYNGO_FONT_FAMILIES.primary,
    color: WEYNGO_FONT_COLORS.secondary,
    fontSize: "0.875rem",
    lineHeight: 1.4,
  },
  caption: {
    fontFamily: WEYNGO_FONT_FAMILIES.primary,
    color: WEYNGO_FONT_COLORS.secondary,
    fontSize: "0.75rem",
  },
  navActive: {
    fontFamily: WEYNGO_FONT_FAMILIES.primary,
    color: WEYNGO_FONT_COLORS.active,
    fontWeight: 600,
  },
  ctaButton: {
    fontFamily: WEYNGO_FONT_FAMILIES.primary,
    color: WEYNGO_FONT_COLORS.white,
    fontWeight: 600,
    fontSize: "0.95rem",
  },
};

// Unified WeynGo Theme Export
export const WEYNGO_THEME = {
  logo: WEYNGO_LOGO,
  colors: WEYNGO_COLORS,
  elements: WEYNGO_ELEMENT_COLORS,
  gradients: WEYNGO_GRADIENTS,
  backgrounds: WEYNGO_BG_COLORS,
  fontColors: WEYNGO_FONT_COLORS,
  fontFamilies: WEYNGO_FONT_FAMILIES,
  fontStyles: WEYNGO_FONT_STYLES,
};

