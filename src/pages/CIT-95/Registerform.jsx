import React, { useState, useEffect, useCallback } from "react";
import "tailwindcss/tailwind.css";
import HeaderCommon from "@/components/HeaderCommon/HeaderCommon";
import B2CHeader from "@/components/flights/B2cHeader/Header";
import style from "./style.module.css";
import qugoImage from "../../../public/img/Qugo MICE White Logo-03 1.png";
import Clogo from "../../../public/img/event/Coimbatore_Institute_of_Technology_logo.png";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCalendarAlt,
  faMapMarkerAlt,
  faSync,
  faCheckCircle,
  faTimesCircle,
  faAngleUp,
  faAngleDown,
} from "@fortawesome/free-solid-svg-icons";
import Image from "next/image";
import Imagegallery from "../../components/events/imagegallery/imagegallery";
import TermsAndConditions from "../../components/events/registercomps/policy/TermsAndConditions";
import CancellationPolicy from "../../components/events/registercomps/policy/CancellationPolicy";
import HotelPolicy from "../../components/events/registercomps/policy/HotelPolicy";
import Payment from "../../components/events/registercomps/payment";
import AccommodationOptions from "@/components/events/registercomps/Accomodation";
import config from "@/config";
import { routeToPg } from "@/paymentGateways/pgRouting";
import showToast from "@/utils/toast";
import axios, { getTabId, getTabSpecificData } from "@/utils/axios/axios";
import { formatPrice } from "@/utils/common";

// Updated room pricing data based on the screenshot
const roomPricing = {
  "Deluxe King / Twin": {
    Single: { base: 5040, tax: 0, net: 5040 },
    Double: { base: 5600, tax: 0, net: 5600 },
    Triple: { base: 7280, tax: 0, net: 7280 },
  },
  Studio: {
    Single: { base: 5600, tax: 0, net: 5600 },
    Double: { base: 6160, tax: 0, net: 6160 },
  },
  "Elite King": {
    Single: { base: 10620, tax: 0, net: 10620 },
    Double: { base: 10620, tax: 0, net: 10620 },
    Triple: { base: 11682, tax: 0, net: 11682 },
  },
  "Elite Family": {
    Triple: { base: 12390, tax: 0, net: 12390 },
    "4 Pax": { base: 12390, tax: 0, net: 12390 },
  },
  Suite: {
    Triple: { base: 18880, tax: 0, net: 18880 },
    "4 Pax": { base: 18880, tax: 0, net: 18880 },
  },
};

// Room maximum occupancy mapping
const roomMaxOccupancy = {
  "Deluxe King / Twin": "Max 3 Adults",
  Studio: "Max 2 Adults",
  "Elite King": "Max 3 Adults",
  "Elite Family": "Max 4 Adults",
  Suite: "Max 4 Adults",
};

// Dynamic pricing constants
const DINNER_PRICE_PER_PERSON_PER_NIGHT = 2500;
const EVENT_FEE = 3000;
const FAREWELL_FEE = 2000;
const CONVENIENCE_FEE = 100;

const JubileeAlumniForm = () => {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    city: "",
    branch: "App Science",
    attendingWith: "Individual",
    individualRoomType: "Individual room", // New field for individual room type
    sharingRemarks: "", // For sharing room remarks
    familyMembers: "",
    roomsRequired: 1,
    roomCategory: "Deluxe King / Twin", // Default room category
    categoryBifurcation: "",
    checkinDates: "4-6", // Default to 4th-6th July
    eventDays: {
      selectedDay: "4and5", // Auto selected for staying guests
    },
    airportTransfer: false,
    arrivalDateTime: "",
    flightNumber: "",
    arrivalAirport: "",
    earlyLateOption: "no",
    earlyCheckin: false,
    lateCheckout: false,
    specialRequests: "",
    radissonStay: "Yes", // Default to Yes
    occupancyType: "Single", // Default occupancy type
    attendEvent: "yes", // Default to yes for staying guests
    memberCount: "1", // Default to 1
    attendDinner: "yes", // Always yes for staying guests - auto add-on
    cabType: "",
    flightBookingAssistance: false,
    accommodationOptions: [], // Track selected accommodation options
    tshirtSize: "",
    gender: "Male", // Default gender selection
  });

  // New states for multi-room support
  const [roomCombinations, setRoomCombinations] = useState([]);
  const [selectedCombination, setSelectedCombination] = useState(null);
  const [roomAvailability, setRoomAvailability] = useState({});
  const [isCheckingAvailability, setIsCheckingAvailability] = useState(false);

  const [isShowMoreOpen, setIsShowMoreOpen] = useState(false);

  const [userDetailsLoaded, setUserDetailsLoaded] = useState(false);
  const [isNameReadOnly, setIsNameReadOnly] = useState(false);
  const [isPhoneReadOnly, setIsPhoneReadOnly] = useState(false);

  const [priceBreakdown, setPriceBreakdown] = useState({
    roomCharges: 0,
    dinnerCharges: 0,
    eventCharges: 0,
    accommodationCharges: 0,
    transportationCharges: 0,
    totalPrice: 0,
  });

  // State for popups
  const [showPopup, setShowPopup] = useState(false);
  const [showOccupancyPopup, setShowOccupancyPopup] = useState(false);
  const [occupancyPopupMessage, setOccupancyPopupMessage] = useState("");
  const [loading, setLoading] = useState(false);

  // Function to fetch room availability
  const fetchRoomAvailability = useCallback(async () => {
    setIsCheckingAvailability(true);
    try {
      // Make the API request
      const response = await axios.get(`${config.EVENTS_ROOM_AVAILS}`);

      if (response?.data?.status && Array.isArray(response.data.data)) {
        // Transform the array of room objects into a map of roomType -> availableRooms
        const availabilityMap = {};

        response.data.data.forEach((room) => {
          if (room.roomType && typeof room.availableRooms === "number") {
            availabilityMap[room.roomType] = room.availableRooms;
          }
        });

        // Set the transformed data
        setRoomAvailability(availabilityMap);

        console.log("Room availability loaded:", availabilityMap);
      } else {
        // If the API response is not in the expected format, use mock data
        const mockAvailability = {
          "Deluxe King / Twin": 5,
          Studio: 3,
          "Elite King": 2,
          "Elite Family": 1,
          Suite: 0, // Simulate one room type being unavailable
        };
        setRoomAvailability(mockAvailability);

        console.warn(
          "Using mock availability data due to unexpected API response format"
        );
      }
    } catch (error) {
      console.error("Error fetching room availability:", error);
      showToast(
        "error",
        "Unable to fetch room availability. Please try again."
      );

      // Set mock data for demonstration in case of error
      const mockAvailability = {
        "Deluxe King / Twin": 5,
        Studio: 3,
        "Elite King": 2,
        "Elite Family": 1,
        Suite: 0, // Simulate one room type being unavailable
      };
      setRoomAvailability(mockAvailability);
    } finally {
      setIsCheckingAvailability(false);
    }
  }, []);

  // Helper function to check if a room is available
  const isRoomAvailable = useCallback(
    (category) => {
      if (!roomAvailability || Object.keys(roomAvailability).length === 0)
        return true; // Assume available if no data
      return roomAvailability[category] > 0;
    },
    [roomAvailability]
  );

  // Check if two combinations are equal (deep equality check)
  const areRoomCombinationsEqual = useCallback((combo1, combo2) => {
    if (!combo1 || !combo2) return false;

    // Check if total price and capacity match
    if (
      combo1.totalPrice !== combo2.totalPrice ||
      combo1.totalCapacity !== combo2.totalCapacity ||
      combo1.rooms.length !== combo2.rooms.length
    ) {
      return false;
    }

    // Check if every room matches (using a simple JSON comparison)
    // Sort both arrays by category and occupancy to ensure consistent ordering
    const sortRooms = (rooms) =>
      [...rooms].sort((a, b) => {
        if (a.category !== b.category)
          return a.category.localeCompare(b.category);
        return a.occupancyType.localeCompare(b.occupancyType);
      });

    const rooms1 = sortRooms(combo1.rooms);
    const rooms2 = sortRooms(combo2.rooms);

    // Compare JSON representation of sorted rooms
    return JSON.stringify(rooms1) === JSON.stringify(rooms2);
  }, []);

  // Function to generate all possible room combinations
  // Modify the generateRoomCombinations function to deduplicate combinations
  const generateRoomCombinations = useCallback(() => {
    if (
      !formData.familyMembers ||
      !formData.roomsRequired ||
      formData.attendingWith !== "Family"
    ) {
      setRoomCombinations([]);
      return;
    }

    const totalMembers = parseInt(formData.familyMembers);
    const roomCount = parseInt(formData.roomsRequired);

    if (
      isNaN(totalMembers) ||
      isNaN(roomCount) ||
      roomCount <= 0 ||
      totalMembers <= 0
    ) {
      setRoomCombinations([]);
      return;
    }

    // Get all room categories with their max occupancy
    const roomTypes = Object.keys(roomPricing).map((category) => {
      const occupancyKeys = Object.keys(roomPricing[category]);
      const maxOccupancy = Math.max(
        ...occupancyKeys.map((key) => {
          if (key === "Single") return 1;
          if (key === "Double") return 2;
          if (key === "Triple") return 3;
          if (key === "4 Pax") return 4;
          return 0;
        })
      );

      return {
        category,
        maxOccupancy,
        // Get available occupancy types
        occupancyTypes: occupancyKeys.map((key) => ({
          type: key,
          capacity:
            key === "Single"
              ? 1
              : key === "Double"
              ? 2
              : key === "Triple"
              ? 3
              : key === "4 Pax"
              ? 4
              : 0,
        })),
      };
    });

    // Generate all possible combinations
    const possibleCombinations = [];

    // Helper function for recursive combination generation
    const generateCombinations = (remaining, rooms, combination = []) => {
      if (rooms === 0) {
        if (remaining === 0) {
          possibleCombinations.push([...combination]);
        }
        return;
      }

      // Try each room type and occupancy
      for (const room of roomTypes) {
        for (const occupancy of room.occupancyTypes) {
          if (occupancy.capacity <= remaining) {
            combination.push({
              category: room.category,
              occupancyType: occupancy.type,
              occupancyCapacity: occupancy.capacity,
              price: roomPricing[room.category][occupancy.type].net,
            });

            generateCombinations(
              remaining - occupancy.capacity,
              rooms - 1,
              combination
            );

            combination.pop();
          }
        }
      }
    };

    generateCombinations(totalMembers, roomCount);

    // Filter combinations to ensure they use exactly roomCount rooms
    // and all members are accommodated
    const validCombinations = possibleCombinations.filter(
      (combo) => combo.length === roomCount
    );

    // Calculate total price for each combination
    const pricedCombinations = validCombinations.map((combo) => {
      const totalPrice = combo.reduce((sum, room) => sum + room.price, 0);
      return {
        rooms: combo,
        totalPrice,
        totalCapacity: combo.reduce(
          (sum, room) => sum + room.occupancyCapacity,
          0
        ),
      };
    });

    // Sort by lowest price first
    pricedCombinations.sort((a, b) => a.totalPrice - b.totalPrice);

    // NEW CODE: Deduplicate combinations before setting state
    const uniqueCombinations = [];
    for (const combo of pricedCombinations) {
      // Check if this combination is already in our unique list
      const isDuplicate = uniqueCombinations.some((existingCombo) =>
        areRoomCombinationsEqual(existingCombo, combo)
      );

      if (!isDuplicate) {
        uniqueCombinations.push(combo);
      }
    }

    setRoomCombinations(uniqueCombinations);

    // Auto-select first combination if none selected
    if (uniqueCombinations.length > 0 && !selectedCombination) {
      setSelectedCombination(uniqueCombinations[0]);
    }
  }, [
    formData.familyMembers,
    formData.roomsRequired,
    formData.attendingWith,
    selectedCombination,
    areRoomCombinationsEqual,
  ]);

  // Function to select a room combination
  const selectRoomCombination = (combination) => {
    setSelectedCombination(combination);

    // Update form data with selected combination info
    // We'll update the first room's category and occupancy in the form
    if (combination && combination.rooms.length > 0) {
      const firstRoom = combination.rooms[0];
      setFormData((prev) => ({
        ...prev,
        roomCategory: firstRoom.category,
        occupancyType: firstRoom.occupancyType,
      }));
    }
  };

  const getOccupancyOptions = useCallback(() => {
    const available = roomPricing[formData.roomCategory] || {};
    let options = Object.keys(available);

    // If individual room is selected, only show Single option
    if (
      formData.attendingWith === "Individual" &&
      formData.individualRoomType === "Individual room"
    ) {
      return ["Single"];
    }

    // If sharing room is selected, exclude "Single" option
    if (
      formData.attendingWith === "Individual" &&
      formData.individualRoomType === "Sharing room"
    ) {
      options = options.filter((option) => option !== "Single");
    }

    // If family is selected, automatically set based on family size
    if (formData.attendingWith === "Family" && formData.familyMembers) {
      const familySize = parseInt(formData.familyMembers);
      if (familySize === 2) return ["Double"];
      if (familySize === 3) return ["Triple"];
      if (familySize === 4) return ["4 Pax"];
      // If family size is greater than 4, show all available options except Single
      return options.filter((option) => option !== "Single");
    }

    return options;
  }, [
    formData.roomCategory,
    formData.attendingWith,
    formData.individualRoomType,
    formData.familyMembers,
  ]);

  const getAvailableRoomCategories = useCallback(() => {
    // If individual room is selected, only show categories with Single occupancy
    if (
      formData.attendingWith === "Individual" &&
      formData.individualRoomType === "Individual room"
    ) {
      return Object.keys(roomPricing).filter(
        (category) => roomPricing[category]["Single"]
      );
    }

    // If family is selected, filter based on family size
    if (formData.attendingWith === "Family" && formData.familyMembers) {
      const familySize = parseInt(formData.familyMembers);

      return Object.keys(roomPricing).filter((category) => {
        const roomOccupancies = roomPricing[category];

        if (familySize === 2) {
          // Show categories with Double or higher occupancy
          return Object.keys(roomOccupancies).some(
            (occ) => occ === "Double" || occ === "Triple" || occ === "4 Pax"
          );
        } else if (familySize === 3) {
          // Show categories with Triple or higher occupancy
          return Object.keys(roomOccupancies).some(
            (occ) => occ === "Triple" || occ === "4 Pax"
          );
        } else if (familySize === 4) {
          // Show only categories with 4 Pax occupancy
          return Object.keys(roomOccupancies).some((occ) => occ === "4 Pax");
        }

        // For family size > 4, show all categories except Single occupancy only
        return (
          Object.keys(roomOccupancies).length > 1 || !roomOccupancies["Single"]
        );
      });
    }

    // Otherwise, show all categories
    return Object.keys(roomPricing);
  }, [
    formData.attendingWith,
    formData.individualRoomType,
    formData.familyMembers,
  ]);

  // Fetch user details on component mount
  useEffect(() => {
    const fetchUserDetails = async () => {
      try {
        const userId = getTabSpecificData("userID");
        const eventId = getTabSpecificData("event_id");

        if (userId && eventId) {
          const response = await axios.get(
            `${config.EVENTS_REGISTRATION_DETAILS}?user_id=${userId}&event_id=${eventId}`
          );

          if (response?.data?.data) {
            const userData = response.data.data;

            // Update form with user data
            setFormData((prev) => ({
              ...prev,
              fullName: userData.full_name || "",
              phone: userData.mobile || "",
              email: userData.email || "",
              city: userData.city || "",
            }));

            // Set read-only states
            setIsNameReadOnly(!!userData.full_name);
            setIsPhoneReadOnly(!!userData.mobile);
          }
          setUserDetailsLoaded(true);
        }
      } catch (error) {
        console.error("Error fetching user details:", error);
        setUserDetailsLoaded(true);
      }
    };

    fetchUserDetails();
  }, []);

  // Calculate price with multi-room support
  const calculateTotalPrice = useCallback(() => {
    let roomCharges = 0,
      dinnerCharges = 0,
      eventCharges = 0,
      accommodationCharges = 0,
      transportationCharges = 0,
      convenienceFee = CONVENIENCE_FEE;

    // Room
    if (
      formData.radissonStay === "Yes" &&
      formData.roomCategory &&
      formData.occupancyType
    ) {
      const nights = formData.checkinDates === "4-6" ? 2 : 1;

      // For multi-room family bookings, use the selectedCombination price
      if (
        formData.attendingWith === "Family" &&
        parseInt(formData.roomsRequired) > 1 &&
        selectedCombination
      ) {
        roomCharges = selectedCombination.totalPrice * nights;
      } else {
        // For single room or when no combination is selected
        const price =
          roomPricing[formData.roomCategory]?.[formData.occupancyType];
        if (price) {
          let roomPrice = price.net;

          // Apply proportional discount for sharing room based on occupancy
          if (
            formData.attendingWith === "Individual" &&
            formData.individualRoomType === "Sharing room"
          ) {
            const occupants = {
              Double: 2,
              Triple: 3,
              "4 Pax": 4,
            };
            const numberOfOccupants = occupants[formData.occupancyType] || 2;
            roomPrice = Math.round(roomPrice / numberOfOccupants);
          }

          roomCharges = roomPrice * formData.roomsRequired * nights;
        }
      }
    }

    // Dinner
    if (formData.radissonStay === "Yes" && formData.checkinDates) {
      const nights = formData.checkinDates === "4-6" ? 2 : 1;
      let participants = 1;
      if (formData.attendingWith === "Family" && formData.familyMembers) {
        participants = parseInt(formData.familyMembers, 10) || 1;
      }
      dinnerCharges = DINNER_PRICE_PER_PERSON_PER_NIGHT * participants * nights;
    } else if (
      formData.attendEvent === "yes" &&
      formData.eventDays?.selectedDay
    ) {
      const participants = parseInt(formData.memberCount, 10) || 1;
      let days = 0;
      if (formData.eventDays.selectedDay === "4and5") days = 2;
      else if (formData.eventDays.selectedDay === "5only") days = 1;
      dinnerCharges = DINNER_PRICE_PER_PERSON_PER_NIGHT * participants * days;
    }

    // Event
    if (formData.radissonStay === "Yes") {
      // Auto add-on for staying guests
      eventCharges = EVENT_FEE;
    } else if (formData.attendEvent === "yes") {
      // For non-staying guests who want to attend
      const day = formData.eventDays?.selectedDay;
      if (day) {
        eventCharges = day === "6" ? FAREWELL_FEE : EVENT_FEE;
      }
    }

    // Accommodation (Early check-in / Late check-out)
    if (
      formData.accommodationOptions &&
      formData.accommodationOptions.length > 0
    ) {
      const roomPrice =
        roomPricing[formData.roomCategory]?.[formData.occupancyType]?.net || 0;

      accommodationCharges = formData.accommodationOptions.reduce(
        (sum, opt) => {
          let charge = 0;
          if (opt.priceType === "fullNight") {
            charge = roomPrice; // Full night charges
          } else if (opt.priceType === "halfDay") {
            charge = Math.round(roomPrice / 2); // Half day charges
          } else if (opt.priceType === "fullDay") {
            charge = roomPrice; // Full day charges
          }

          // Apply sharing room discount if applicable
          if (
            formData.attendingWith === "Individual" &&
            formData.individualRoomType === "Sharing room"
          ) {
            const occupants = {
              Double: 2,
              Triple: 3,
              "4 Pax": 4,
            };
            const numberOfOccupants = occupants[formData.occupancyType] || 2;
            charge = Math.round(charge / numberOfOccupants);
          }

          return sum + charge;
        },
        0
      );
    }

    // Transportation
    if (formData.airportTransfer && formData.cabType) {
      const cabPrices = { Sedan: 600, Innova: 1100, Crysta: 1600 };
      transportationCharges = cabPrices[formData.cabType] || 0;
    }

    const totalPrice =
      roomCharges +
      dinnerCharges +
      eventCharges +
      accommodationCharges +
      transportationCharges +
      convenienceFee;

    setPriceBreakdown({
      roomCharges,
      dinnerCharges,
      eventCharges,
      accommodationCharges,
      transportationCharges,
      convenienceFee,
      totalPrice,
    });
  }, [
    formData.radissonStay,
    formData.roomCategory,
    formData.occupancyType,
    formData.roomsRequired,
    formData.checkinDates,
    formData.attendingWith,
    formData.individualRoomType,
    formData.familyMembers,
    formData.attendEvent,
    formData.eventDays,
    formData.memberCount,
    formData.accommodationOptions,
    formData.airportTransfer,
    formData.cabType,
    selectedCombination,
  ]);

  // Auto-select occupancy based on family size
  useEffect(() => {
    if (formData.attendingWith === "Family" && formData.familyMembers) {
      const familySize = parseInt(formData.familyMembers);
      let newOccupancy = formData.occupancyType;

      if (familySize === 2) newOccupancy = "Double";
      else if (familySize === 3) newOccupancy = "Triple";
      else if (familySize === 4) newOccupancy = "4 Pax";

      // Only update if changed
      if (newOccupancy !== formData.occupancyType) {
        // Check if the new occupancy is available for the current room category
        const availableOptions = getOccupancyOptions();
        if (availableOptions.includes(newOccupancy)) {
          setFormData((prev) => ({
            ...prev,
            occupancyType: newOccupancy,
          }));
        }
      }
    }
  }, [
    formData.familyMembers,
    formData.attendingWith,
    formData.occupancyType,
    getOccupancyOptions,
  ]);

  // Generate room combinations when needed
  useEffect(() => {
    if (
      formData.attendingWith === "Family" &&
      formData.familyMembers &&
      parseInt(formData.roomsRequired) > 1
    ) {
      generateRoomCombinations();
    } else {
      // Clear combinations when not needed
      setRoomCombinations([]);
      setSelectedCombination(null);
    }
  }, [
    formData.attendingWith,
    formData.familyMembers,
    formData.roomsRequired,
    generateRoomCombinations,
  ]);

  // Fetch room availability when form is loaded or dates change
  useEffect(() => {
    if (formData.radissonStay === "Yes" && userDetailsLoaded) {
      fetchRoomAvailability();
    }
  }, [formData.radissonStay, userDetailsLoaded, fetchRoomAvailability]);

  // Ensure room category is valid for individual room selection
  useEffect(() => {
    if (
      formData.attendingWith === "Individual" &&
      formData.individualRoomType === "Individual room"
    ) {
      // Check if current room category supports Single occupancy
      if (!roomPricing[formData.roomCategory]?.["Single"]) {
        // Switch to first available room with Single occupancy
        const availableRooms = Object.keys(roomPricing).filter(
          (room) => roomPricing[room]["Single"]
        );
        if (availableRooms.length > 0) {
          setFormData((prev) => ({
            ...prev,
            roomCategory: availableRooms[0],
            occupancyType: "Single",
          }));
        }
      }
    }
  }, [
    formData.attendingWith,
    formData.individualRoomType,
    formData.roomCategory,
  ]);

  // Auto-select first occupancy when room category changes
  useEffect(() => {
    if (!formData.roomCategory) return;

    const options = getOccupancyOptions();

    // If current occupancy is not available (e.g., Single for sharing room), select first available
    if (options.length > 0 && !options.includes(formData.occupancyType)) {
      setFormData((prev) => ({
        ...prev,
        occupancyType: options[0],
      }));
    }
  }, [
    formData.roomCategory,
    formData.occupancyType,
    formData.individualRoomType,
    formData.attendingWith,
    getOccupancyOptions,
  ]);

  // Reset early/late check-in when sharing room is selected
  useEffect(() => {
    if (
      formData.attendingWith === "Individual" &&
      formData.individualRoomType === "Sharing room"
    ) {
      if (
        formData.earlyLateOption === "yes" ||
        formData.accommodationOptions.length > 0
      ) {
        setFormData((prev) => ({
          ...prev,
          earlyLateOption: "no",
          accommodationOptions: [],
        }));
      }
    }
  }, [formData.attendingWith, formData.individualRoomType]);

  // Auto-select room category based on family size
  useEffect(() => {
    if (formData.attendingWith === "Family" && formData.familyMembers) {
      const familySize = parseInt(formData.familyMembers);
      const availableCategories = getAvailableRoomCategories();

      // First check if current room category is still valid
      if (!availableCategories.includes(formData.roomCategory)) {
        // Switch to first available category
        if (availableCategories.length > 0) {
          setFormData((prev) => ({
            ...prev,
            roomCategory: availableCategories[0],
          }));
        }
      }

      // Then check if current occupancy matches family size
      let expectedOccupancy;
      if (familySize === 2) expectedOccupancy = "Double";
      else if (familySize === 3) expectedOccupancy = "Triple";
      else if (familySize === 4) expectedOccupancy = "4 Pax";

      // Check if expected occupancy is available for current room category
      if (
        expectedOccupancy &&
        !roomPricing[formData.roomCategory]?.[expectedOccupancy]
      ) {
        // Current room doesn't support the needed occupancy, find one that does
        const compatibleCategory = availableCategories[0];
        if (compatibleCategory) {
          setFormData((prev) => ({
            ...prev,
            roomCategory: compatibleCategory,
            occupancyType: expectedOccupancy,
          }));
        }
      }
    }
  }, [
    formData.familyMembers,
    formData.attendingWith,
    formData.roomCategory,
    getAvailableRoomCategories,
  ]);

  useEffect(() => {
    calculateTotalPrice();
  }, [calculateTotalPrice]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (name.startsWith("eventDays")) {
      setFormData((prev) => ({
        ...prev,
        eventDays: {
          ...prev.eventDays,
          [name.split(".")[1]]: checked,
        },
      }));
    } else if (type === "checkbox") {
      setFormData((prev) => ({ ...prev, [name]: checked }));
    } else if (name === "occupancyType") {
      setFormData((prev) => ({ ...prev, [name]: value }));

      // Show popup for Triple and Quad occupancy
      if (value === "Triple") {
        setOccupancyPopupMessage(
          "Please note: Every third person will be provided with an extra mattress and bed."
        );
        setShowOccupancyPopup(true);
      } else if (value === "4 Pax") {
        setOccupancyPopupMessage(
          "Please note: The third and fourth person will be provided with an extra mattress and bed."
        );
        setShowOccupancyPopup(true);
      }
    } else if (name === "roomCategory") {
      // Special handling for room category changes
      const availableOccupancies = roomPricing[value] || {};
      const occupancies = Object.keys(availableOccupancies);

      setFormData((prev) => ({
        ...prev,
        roomCategory: value,
        // If current occupancy isn't available for new room, select first available
        occupancyType: occupancies.includes(prev.occupancyType)
          ? prev.occupancyType
          : occupancies[0] || "",
      }));
    } else if (name === "attendingWith") {
      // Reset occupancy and room count when switching between Individual and Family
      let updates = {
        attendingWith: value,
        roomsRequired: 1, // Always reset to 1
        occupancyType:
          value === "Individual" &&
          formData.individualRoomType === "Individual room"
            ? "Single"
            : "Double",
      };

      // If switching to Individual with Individual room, check if current room category supports Single
      if (
        value === "Individual" &&
        formData.individualRoomType === "Individual room"
      ) {
        if (!roomPricing[formData.roomCategory]?.["Single"]) {
          // Switch to first available room with Single occupancy
          const availableRooms = Object.keys(roomPricing).filter(
            (room) => roomPricing[room]["Single"]
          );
          if (availableRooms.length > 0) {
            updates.roomCategory = availableRooms[0];
          }
        }
      }

      setFormData((prev) => ({
        ...prev,
        ...updates,
      }));
    } else if (name === "individualRoomType") {
      // When switching between individual room types
      const newValue = value;
      let updates = {
        individualRoomType: newValue,
        roomsRequired: 1, // Always 1 for individual
        // If switching to individual room, set to Single occupancy
        occupancyType: newValue === "Individual room" ? "Single" : "Double",
      };

      // If switching to sharing room, disable early/late check-in
      if (newValue === "Sharing room") {
        updates.earlyLateOption = "no";
        updates.accommodationOptions = [];
      }

      // Check if current room category is still valid
      if (newValue === "Individual room") {
        // Check if current room category supports Single occupancy
        if (!roomPricing[formData.roomCategory]?.["Single"]) {
          // Switch to first available room with Single occupancy
          const availableRooms = Object.keys(roomPricing).filter(
            (room) => roomPricing[room]["Single"]
          );
          if (availableRooms.length > 0) {
            updates.roomCategory = availableRooms[0];
          }
        }
      }

      setFormData((prev) => ({
        ...prev,
        ...updates,
      }));
    } else if (name === "radissonStay") {
      // Reset early/late check-in option and accommodation when not staying at O by TAMARA
      if (value === "No") {
        setFormData((prev) => ({
          ...prev,
          radissonStay: value,
          earlyLateOption: "no", // Reset this to "no"
          accommodationOptions: [], // Clear accommodation options
          attendEvent: "yes", // Default to yes when not staying
          eventDays: {
            ...prev.eventDays,
            selectedDay: "4and5", // Default to 4th & 5th July
          },
        }));
      } else {
        setFormData((prev) => ({ ...prev, [name]: value }));
      }
    } else if (name === "roomsRequired") {
      // When changing number of rooms
      const roomsCount = parseInt(value);

      // Reset selected combination when changing room count
      setSelectedCombination(null);

      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));

      // If family booking with multiple rooms, trigger room combination generation
      // if (
      //   formData.attendingWith === "Family" &&
      //   formData.familyMembers &&
      //   roomsCount > 1
      // ) {
      //   setTimeout(() => generateRoomCombinations(), 0);
      // }
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleAccommodationSelect = (selected) => {
    setFormData((prev) => ({
      ...prev,
      accommodationOptions: selected,
    }));
  };

  const handleAccommodationRemove = (accommodationId) => {
    const updatedAccommodations = formData.accommodationOptions.filter(
      (acc) => acc.id !== accommodationId
    );
    handleAccommodationSelect(updatedAccommodations);
  };

  // Check if a combination is fully available
  const isCombinationAvailable = useCallback(
    (combination) => {
      return combination.rooms.every((room) => isRoomAvailable(room.category));
    },
    [isRoomAvailable]
  );

  // Component for displaying room combinations
  const RoomCombinationSelector = () => {
    if (!roomCombinations || roomCombinations.length === 0) {
      return (
        <div className="mt-4 p-3 border rounded bg-gray-50 text-gray-800">
          <p>
            No valid room combinations found for your group size and room count.
          </p>
          <p className="text-sm text-gray-600 mt-2">
            Try adjusting the number of rooms or family members.
          </p>
        </div>
      );
    }

    // First identify recommended combinations (top 3 available ones that fit the family)
    const recommendedCombinations = roomCombinations
      .filter(
        (combo) =>
          combo.totalCapacity >= parseInt(formData.familyMembers) &&
          isCombinationAvailable(combo)
      )
      .slice(0, 3);

    // Then identify remaining combinations
    const remainingCombinations = roomCombinations.filter(
      (combo) => !recommendedCombinations.includes(combo)
    );

    // Handle combination selection with event stopping
    const handleCombinationSelect = (e, combination) => {
      e.stopPropagation(); // Prevent event from bubbling to details element
      if (isCombinationAvailable(combination)) {
        selectRoomCombination(combination);
      }
    };

    // Toggle show more section
    const toggleShowMore = (e) => {
      e.preventDefault();
      setIsShowMoreOpen(!isShowMoreOpen);
    };

    return (
      <div className="mt-6">
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-lg font-semibold">Room Combinations</h3>
          <button
            type="button"
            onClick={fetchRoomAvailability}
            className="px-3 py-1 bg-blue-500 text-white rounded-md hover:bg-blue-600 flex items-center text-sm"
            disabled={isCheckingAvailability}
          >
            {isCheckingAvailability ? (
              <>
                <FontAwesomeIcon icon={faSync} className="fa-spin mr-2" />
                Checking...
              </>
            ) : (
              <>
                <FontAwesomeIcon icon={faSync} className="mr-2" />
                Refresh Availability
              </>
            )}
          </button>
        </div>

        {isCheckingAvailability && (
          <div className="mb-4 p-2 bg-blue-50 rounded text-center text-blue-800">
            <FontAwesomeIcon icon={faSync} className="fa-spin mr-2" />
            <span>Checking room availability...</span>
          </div>
        )}

        {/* Grid layout for better space utilization */}
        <div className="mb-6">
          <h4 className="font-medium text-green-700 mb-2">
            Recommended Options
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {recommendedCombinations.map((combination, index) => (
              <div
                key={index}
                className={`border rounded-lg p-3 ${
                  areRoomCombinationsEqual(selectedCombination, combination)
                    ? "border-blue-500 bg-blue-50 ring-2 ring-blue-300"
                    : isCombinationAvailable(combination)
                    ? "border-gray-200 hover:border-blue-300 cursor-pointer"
                    : "border-gray-200 opacity-60 bg-gray-50 cursor-not-allowed"
                }`}
                onClick={(e) => handleCombinationSelect(e, combination)}
              >
                <div className="flex justify-between items-center">
                  <div className="flex items-center">
                    {areRoomCombinationsEqual(
                      selectedCombination,
                      combination
                    ) && (
                      <span className="mr-2 text-blue-500">
                        <FontAwesomeIcon icon={faCheckCircle} />
                      </span>
                    )}
                    <span className="font-medium">Option {index + 1}</span>
                  </div>
                  <div className="text-right">
                    <span className="font-semibold">
                      ₹{combination.totalPrice}
                    </span>
                    <span className="text-xs text-gray-500 block">
                      per night
                    </span>
                  </div>
                </div>

                <div className="mt-2 text-sm">
                  {combination.rooms.map((room, roomIndex) => (
                    <div
                      key={roomIndex}
                      className="flex justify-between py-1 border-b border-gray-100"
                    >
                      <span>
                        <span className="text-gray-500">
                          Room {roomIndex + 1}:
                        </span>{" "}
                        {room.category.split(" ")[0]}{" "}
                        <span className="text-xs text-gray-500">
                          ({room.occupancyType})
                        </span>
                      </span>
                      <span
                        className={`text-xs px-1.5 py-0.5 rounded-full ${
                          isRoomAvailable(room.category)
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {isRoomAvailable(room.category) ? "✓" : "×"}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="mt-2 flex justify-between text-xs text-gray-600">
                  <span>Capacity: {combination.totalCapacity} guests</span>
                  <span
                    className={`${
                      combination.totalCapacity >=
                      parseInt(formData.familyMembers)
                        ? "text-green-600"
                        : "text-red-500"
                    }`}
                  >
                    {combination.totalCapacity >=
                    parseInt(formData.familyMembers)
                      ? "Sufficient"
                      : "Insufficient"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Show toggle for viewing all combinations */}
        {remainingCombinations.length > 0 && (
          <div className="mb-4">
            <div className="cursor-pointer">
              <div
                onClick={toggleShowMore}
                className="font-medium text-blue-600 hover:text-blue-800 flex items-center mb-2"
              >
                <span>
                  {isShowMoreOpen ? "Hide" : "Show"}{" "}
                  {remainingCombinations.length} more options
                </span>
                <FontAwesomeIcon
                  icon={isShowMoreOpen ? faAngleUp : faAngleDown}
                  className="ml-1"
                />
              </div>

              {isShowMoreOpen && (
                <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
                  {remainingCombinations.map((combination, index) => (
                    <div
                      key={index}
                      className={`border rounded-lg p-3 ${
                        areRoomCombinationsEqual(
                          selectedCombination,
                          combination
                        )
                          ? "border-blue-500 bg-blue-50 ring-2 ring-blue-300"
                          : isCombinationAvailable(combination)
                          ? "border-gray-200 hover:border-blue-300 cursor-pointer"
                          : "border-gray-200 opacity-60 bg-gray-50 cursor-not-allowed"
                      }`}
                      onClick={(e) => handleCombinationSelect(e, combination)}
                    >
                      <div className="flex justify-between items-center">
                        <div className="flex items-center">
                          {areRoomCombinationsEqual(
                            selectedCombination,
                            combination
                          ) && (
                            <span className="mr-2 text-blue-500">
                              <FontAwesomeIcon icon={faCheckCircle} />
                            </span>
                          )}
                          <span className="font-medium">
                            Alt Option {index + 1}
                          </span>
                        </div>
                        <div className="text-right">
                          <span className="font-semibold">
                            ₹{combination.totalPrice}
                          </span>
                          <span className="text-xs text-gray-500 block">
                            per night
                          </span>
                        </div>
                      </div>

                      <div className="mt-2 text-sm">
                        {combination.rooms.map((room, roomIndex) => (
                          <div
                            key={roomIndex}
                            className="flex justify-between py-1 border-b border-gray-100"
                          >
                            <span>
                              <span className="text-gray-500">
                                Room {roomIndex + 1}:
                              </span>{" "}
                              {room.category.split(" ")[0]}{" "}
                              <span className="text-xs text-gray-500">
                                ({room.occupancyType})
                              </span>
                            </span>
                            <span
                              className={`text-xs px-1.5 py-0.5 rounded-full ${
                                isRoomAvailable(room.category)
                                  ? "bg-green-100 text-green-700"
                                  : "bg-red-100 text-red-700"
                              }`}
                            >
                              {isRoomAvailable(room.category) ? "✓" : "×"}
                            </span>
                          </div>
                        ))}
                      </div>

                      <div className="mt-2 flex justify-between text-xs text-gray-600">
                        <span>
                          Capacity: {combination.totalCapacity} guests
                        </span>
                        <span
                          className={`${
                            combination.totalCapacity >=
                            parseInt(formData.familyMembers)
                              ? "text-green-600"
                              : "text-red-500"
                          }`}
                        >
                          {combination.totalCapacity >=
                          parseInt(formData.familyMembers)
                            ? "Sufficient"
                            : "Insufficient"}
                        </span>
                      </div>

                      {!isCombinationAvailable(combination) && (
                        <div className="mt-2 text-xs text-red-500 bg-red-50 p-2 rounded text-center">
                          <FontAwesomeIcon
                            icon={faTimesCircle}
                            className="mr-1"
                          />
                          One or more rooms unavailable
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    );
  };

  const isIndianMobile = (mobileNum) => {
    if (!mobileNum) return false;
    // Indian mobile numbers start with 6, 7, 8, or 9 and are 10 digits long
    const indianMobileRegex = /^[6-9]\d{9}$/;
    return indianMobileRegex.test(mobileNum);
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    setLoading(true);

    // Basic validations
    if (!formData.email || formData.email.trim() === "") {
      showToast(
        "error",
        "Please enter your email address to proceed with the booking."
      );
      setLoading(false);
      return; // Exit early if email is not provided
    }

    if (formData.attendingWith === "Family") {
      if (!formData.familyMembers || formData.familyMembers.trim() === "") {
        showToast(
          "error",
          "Please enter the number of family members when attending with family."
        );
        setLoading(false);
        return;
      }

      const familySize = parseInt(formData.familyMembers);
      if (isNaN(familySize) || familySize < 2) {
        showToast(
          "error",
          "Number of family members must be at least 2 (including yourself)."
        );
        setLoading(false);
        return;
      }

      // Validate rooms required for family bookings
      if (formData.radissonStay === "Yes") {
        if (!formData.roomsRequired) {
          showToast(
            "error",
            "Please specify the number of rooms required for your family."
          );
          setLoading(false);
          return;
        }

        const roomCount = parseInt(formData.roomsRequired);
        if (isNaN(roomCount) || roomCount < 1) {
          showToast("error", "Number of rooms required must be at least 1.");
          setLoading(false);
          return;
        }

        // Check family size vs room capacity
        if (familySize > 0 && roomCount > 0 && familySize / roomCount > 4) {
          showToast(
            "error",
            "Too many people for the number of rooms (max 4 per room). Please increase the number of rooms or reduce family members."
          );
          setLoading(false);
          return;
        }
      }
    }

    if (!formData.tshirtSize || formData.tshirtSize.trim() === "") {
      showToast("error", "Please select your T-shirt size to proceed.");
      setLoading(false);
      return;
    }

    // Check room availability for multi-room bookings
    if (
      formData.radissonStay === "Yes" &&
      formData.attendingWith === "Family" &&
      parseInt(formData.roomsRequired) > 1
    ) {
      if (!selectedCombination) {
        showToast("error", "Please select a room combination.");
        setLoading(false);
        return;
      }

      // Check if each room in the combination is available
      const unavailableRooms = selectedCombination.rooms.filter(
        (room) => !isRoomAvailable(room.category)
      );

      if (unavailableRooms.length > 0) {
        showToast(
          "error",
          `The following room types are not available: ${unavailableRooms
            .map((r) => r.category)
            .join(", ")}`
        );
        setLoading(false);
        return;
      }
    } else if (formData.radissonStay === "Yes") {
      // Check single room availability
      if (!isRoomAvailable(formData.roomCategory)) {
        showToast(
          "error",
          `${formData.roomCategory} rooms are not available for your selected dates.`
        );
        setLoading(false);
        return;
      }
    }

    const userId = getTabSpecificData("userID");
    const eventId = getTabSpecificData("event_id");

    try {
      // First check if user already has a booking
      const checkBookingResponse = await axios.get(
        `${config.EVENTS_USER_HAS_BOOKING}`
          .replace(":userId", userId)
          .replace(":eventId", eventId)
      );

      if (checkBookingResponse?.data?.data?.hasBooking) {
        const existingBookingId = checkBookingResponse?.data?.data?.bookingId;

        // Show toast with a custom config that includes onClick for redirection
        showToast(
          "info",
          "You already have a booking for this event. Click here to view your booking details.",
          {
            autoClose: 8000, // Give users more time to click
            onClick: () => {
              // Open the confirmation page in a new tab
              window.open(
                `/CIT-95/Confirm?bookingId=${existingBookingId}`,
                "_blank"
              );
            },
            style: { cursor: "pointer" }, // Change cursor to indicate it's clickable
          }
        );
        setLoading(false);
        return; // Exit early if user already has a booking
      }

      // Prepare booking data
      const bookingData = {
        userId: userId,
        eventId: eventId,
        personalInfo: {
          fullName: formData.fullName,
          email: formData.email,
          phone: formData.phone,
          city: formData.city,
          branch: formData.branch,
          tshirtSize: formData.tshirtSize,
          gender: formData.gender,
        },
        stayDetails:
          formData.radissonStay === "Yes"
            ? {
                checkinDates: formData.checkinDates,
                attendingWith: formData.attendingWith,
                individualRoomType:
                  formData.attendingWith === "Individual"
                    ? formData.individualRoomType
                    : null,
                sharingRemarks: formData.sharingRemarks || "",
                familyMembers: formData.familyMembers,
                roomsRequired: formData.roomsRequired,
                roomCategory: formData.roomCategory,
                occupancyType: formData.occupancyType,
                accommodationOptions: formData.accommodationOptions,
                dinnerCharges: priceBreakdown.dinnerCharges,
                // Add room combination for multi-room bookings
                roomCombination:
                  formData.attendingWith === "Family" &&
                  parseInt(formData.roomsRequired) > 1 &&
                  selectedCombination
                    ? selectedCombination.rooms
                    : null,
              }
            : null,
        eventDetails: {
          attendEvent: formData.attendEvent,
          eventDays: formData.eventDays,
          memberCount: formData.memberCount,
          eventCharges: priceBreakdown.eventCharges,
          dinnerCharges:
            formData.radissonStay !== "Yes" ? priceBreakdown.dinnerCharges : 0,
        },
        transportation: {
          airportTransfer: formData.airportTransfer,
          cabType: formData.cabType || "",
          flightNumber: formData.flightNumber || "",
          arrivalDateTime: formData.arrivalDateTime || "",
          arrivalAirport: formData.arrivalAirport || "",
          flightBookingAssistance: formData.flightBookingAssistance,
          price: priceBreakdown.transportationCharges,
        },
        specialRequests: formData.specialRequests,
        pricing: {
          roomCharges: priceBreakdown.roomCharges,
          dinnerCharges: priceBreakdown.dinnerCharges,
          eventCharges: priceBreakdown.eventCharges,
          accommodationCharges: priceBreakdown.accommodationCharges,
          transportationCharges: priceBreakdown.transportationCharges,
          convenienceFee: priceBreakdown.convenienceFee,
          totalPrice: priceBreakdown.totalPrice,
        },
      };

      const orderResponse = await axios.post(
        `${config.EVENTS_CREATE_ORDER}`,
        bookingData
      );

      if (orderResponse?.data?.status) {
        const bookingId = orderResponse?.data?.data?.bookingId;

        const pgResponse = await axios.get(config.GET_PAYMENT_GATEWAY);

        if (pgResponse?.data?.status === "SUCCESS") {
          let mobile,
            isInternational = false;
          const pgCode = pgResponse?.data?.data?.pgCode;
          const isIndian = isIndianMobile(
            getTabSpecificData("phoneNumber")
          );
          if (!isIndian) {
            // mobile = localStorage?.phoneNumber
            //   ?.replace(/"/g, "")
            //   .substring(0, 10);
            mobile = "9999999999";
            isInternational = true;
          } else {
            mobile = getTabSpecificData("phoneNumber");
            isInternational = false;
          }
          const grandTotal = priceBreakdown.totalPrice;

          const payload = {
            pgCode: pgCode,
            redirectUrl: `${config.WEB_BASE_URL}CIT-95/Confirm?bookingId=${bookingId}`,
            travelCategory: 4,
            walletAmount: 0,
            charges: 0,
            paymentCategory: "BOOKING",
            bookingId: bookingId,
            orderAmount: parseFloat(grandTotal),
            orderCurrency: "INR",
            isInternational: isInternational,
            customerDetails: {
              customerName: formData.fullName,
              customerEmail: formData.email,
              customerPhone: mobile,
            },
          };
          const response = await axios.post(
            `${config.GET_SESSION_ID}`,
            payload
          );
          if (response?.data?.status === "SUCCESS") {
            const session = response?.data?.data;
            const queryParams = {
              bookingId: bookingId,
            };
            await routeToPg(
              pgCode,
              session.paymentSessionId,
              queryParams,
              bookingId,
              4,
              "BOOKING",
              "",
              "",
              {
                customReturnPath: "CIT-95/Confirm",
                customQueryParams: {
                  bookingId: bookingId,
                },
              }
            );
          }
        }
      }
    } catch (error) {
      console.error("Error creating booking:", error);
      showToast(
        "error",
        "There was an error processing your booking. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className={style.relativeContainer}>
        <div className={style.header}>
          {/* <HeaderCommon /> */}
          <B2CHeader/>
        </div>
        <div className={style.Bgimage}></div>
        <div className={style.overlayContent}>
          {/* <Image className={style.posiflexLogo} src={Posiflex} alt="qugoLogo" /> */}
          <div className="mt-[7%]">
            <div className="grid place-items-center h-full">
              <Image
                className=""
                width={100}
                height={100}
                src={Clogo}
                alt="qugoLogo"
              />
            </div>

            <div className="text-center sm:text-3xl font-semibold">
              CIT-95 <br /> PEARL JUBILEE ALUMINI MEET
            </div>
            <div>
              <div className={style.imagecontainer}>
                <div className={style.maintext2}>Powered by</div>
                <Image
                  className={style.qugoLogo}
                  src={qugoImage}
                  alt="qugoLogo"
                />
              </div>
            </div>
          </div>
        </div>
        <div className={style.belowBg}>
          <div className={style.text}>
            <FontAwesomeIcon icon={faCalendarAlt} className={style.icon} /> 4th
            July - 6th July, 2025
          </div>
          <div className={style.text}>
            <FontAwesomeIcon icon={faMapMarkerAlt} className={style.icon} /> O
            by TAMARA Coimbatore
          </div>
        </div>
      </div>
      <div className=" sm:flex gap-3 m-2">
        <form
          onSubmit={handleSubmit}
          className="w-full sm:w-[70%] mt-1 px-3 py-3 sm:p-8 bg-gradient-to-b from-gray-100 to-gray-200 rounded-lg shadow-lg space-y-6"
        >
          <h2 className="text-3xl font-bold text-gray-800 mb-6">
            Enter the details
          </h2>

          {/* Personal Information */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Full Name */}
            <div className="flex flex-col">
              <label className="text-sm text-gray-700 ml-1 mb-1">
                Full Name
              </label>
              <input
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                className={`${inputClass} ${
                  isNameReadOnly ? "bg-gray-100" : ""
                }`}
                placeholder="Enter your full name"
                readOnly={isNameReadOnly}
              />
            </div>

            {/* Phone with required asterisk */}
            <div className="flex flex-col">
              <label className="text-sm text-gray-700 ml-1 mb-1">
                Phone Number <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className={`${inputClass} ${
                  isPhoneReadOnly ? "bg-gray-100" : ""
                }`}
                placeholder="Enter your phone number"
                readOnly={isPhoneReadOnly}
              />
            </div>

            {/* Email */}
            <div className="flex flex-col">
              <label className="text-sm text-gray-700 ml-1 mb-1">
                Email <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className={inputClass}
                placeholder="Enter your email"
              />

              <span className="text-xs text-gray-600 mt-1 ml-1">
                <i className="fas fa-info-circle mr-1"></i>
                You will receive booking confirmation on this email
              </span>
            </div>

            <div className="flex flex-col h-fit">
              <label
                htmlFor="branch"
                className="block mb-1 text-sm font-medium text-gray-700"
              >
                Select Branch
              </label>
              <select
                id="branch"
                name="branch"
                value={formData.branch}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-md px-4 py-3 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {[
                  "App Science",
                  "Chemical",
                  "Civil",
                  "CSE",
                  "CT",
                  "ECE",
                  "EEE",
                  "Mechanical",
                ].map((branch) => (
                  <option key={branch} value={branch}>
                    {branch}
                  </option>
                ))}
              </select>
            </div>

            {/* City */}
            <div className="flex flex-col">
              <label className="text-sm text-gray-700 ml-1 mb-1">City</label>
              <input
                type="text"
                name="city"
                value={formData.city}
                onChange={handleChange}
                className={inputClass}
                placeholder="Enter your city"
              />
            </div>
          </div>

          {/* Stay Reservation */}
          <div className="mb-6">
            <label className="block font-semibold text-gray-700 mb-2">
              Would you like to reserve your stay at O by TAMARA?
            </label>
            <div className="flex gap-6">
              {["Yes", "No"].map((option) => (
                <label
                  key={option}
                  className="flex items-center gap-2 text-gray-800"
                >
                  <input
                    type="radio"
                    name="radissonStay"
                    value={option}
                    checked={formData.radissonStay === option}
                    onChange={handleChange}
                  />
                  {option}
                </label>
              ))}
            </div>
          </div>

          {/* Only show below if user says Yes */}
          {formData.radissonStay === "Yes" && (
            <>
              <div className="mt-6">
                <label className="block font-semibold text-gray-700 mb-2">
                  Select Check-in and Check-out Date:
                </label>
                <div className="flex flex-col gap-2">
                  <label className="flex items-center gap-2 text-gray-800">
                    <input
                      type="radio"
                      name="checkinDate"
                      value="4-6"
                      checked={formData.checkinDates === "4-6"}
                      onChange={(e) => {
                        const value = e.target.value;
                        setFormData((prev) => ({
                          ...prev,
                          checkinDates: value,
                        }));
                      }}
                    />
                    4th July 2025, 11 AM to 6th July 2025, 12 PM
                  </label>

                  <label className="flex items-center gap-2 text-gray-800">
                    <input
                      type="radio"
                      name="checkinDate"
                      value="5-6"
                      checked={formData.checkinDates === "5-6"}
                      onChange={(e) => {
                        const value = e.target.value;
                        setFormData((prev) => ({
                          ...prev,
                          checkinDates: value,
                        }));
                      }}
                    />
                    5th July 2025, 11 AM to 6th July 2025, 12 PM
                  </label>
                </div>
              </div>

              <div className="mb-6">
                <label className="block font-semibold text-gray-700 mb-2">
                  Are you attending as:
                </label>
                <div className="flex gap-6">
                  {["Individual", "Family"].map((type) => (
                    <label
                      key={type}
                      className="flex items-center gap-2 text-gray-800"
                    >
                      <input
                        type="radio"
                        name="attendingWith"
                        value={type}
                        checked={formData.attendingWith === type}
                        onChange={handleChange}
                      />
                      {type}
                    </label>
                  ))}
                </div>

                {/* Individual Room Options */}
                {formData.attendingWith === "Individual" && (
                  <div className="mt-4">
                    <label className="block font-medium text-gray-700 mb-2">
                      Room Preference:
                    </label>
                    <div className="flex gap-6">
                      {["Individual room", "Sharing room"].map((roomType) => (
                        <label
                          key={roomType}
                          className="flex items-center gap-2 text-gray-800"
                        >
                          <input
                            type="radio"
                            name="individualRoomType"
                            value={roomType}
                            checked={formData.individualRoomType === roomType}
                            onChange={handleChange}
                          />
                          {roomType}
                        </label>
                      ))}
                    </div>

                    {/* Sharing Room Remarks */}
                    {formData.individualRoomType === "Sharing room" && (
                      <div className="mt-4">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Remarks: Please mention the other friend{"'"}s name
                          that you are sharing this room
                        </label>
                        <textarea
                          name="sharingRemarks"
                          value={formData.sharingRemarks}
                          onChange={handleChange}
                          placeholder="Ex: - Baskar, Kartik, Anand etc."
                          className="w-full border border-gray-300 rounded-md p-2"
                          rows={2}
                        />
                      </div>
                    )}
                  </div>
                )}

                {/* Family Option */}
                {formData.attendingWith === "Family" && (
                  <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="flex flex-col">
                      <label
                        htmlFor="familyMembers"
                        className="text-sm font-medium text-gray-700 mb-1"
                      >
                        Number of Family Members (including yourself)
                      </label>
                      <input
                        id="familyMembers"
                        name="familyMembers"
                        type="number"
                        min="2"
                        value={formData.familyMembers}
                        onChange={handleChange}
                        className={inputClass}
                        placeholder="e.g. 3"
                      />
                    </div>

                    <div className="flex flex-col">
                      <label
                        htmlFor="roomsRequired"
                        className="text-sm font-medium text-gray-700 mb-1"
                      >
                        Number of Rooms Required
                      </label>
                      <input
                        type="number"
                        min="1"
                        id="roomsRequired"
                        name="roomsRequired"
                        value={formData.roomsRequired}
                        onChange={handleChange}
                        className={inputClass}
                        placeholder="e.g. 2"
                      />

                      {parseInt(formData.familyMembers) > 0 &&
                        parseInt(formData.roomsRequired) > 0 && (
                          <div className="text-sm text-blue-600 mt-1">
                            {parseInt(formData.familyMembers) /
                              parseInt(formData.roomsRequired) >
                            4 ? (
                              <span className="text-red-500">
                                <FontAwesomeIcon
                                  icon={faTimesCircle}
                                  className="mr-1"
                                />
                                Too many people for the number of rooms (max 4
                                per room)
                              </span>
                            ) : (
                              <span>
                                <FontAwesomeIcon
                                  icon={faCheckCircle}
                                  className="mr-1"
                                />
                                {Math.ceil(
                                  parseInt(formData.familyMembers) /
                                    parseInt(formData.roomsRequired)
                                )}
                                {Math.ceil(
                                  parseInt(formData.familyMembers) /
                                    parseInt(formData.roomsRequired)
                                ) === 1
                                  ? " person"
                                  : " people"}{" "}
                                per room
                              </span>
                            )}
                          </div>
                        )}
                    </div>
                  </div>
                )}
              </div>

              {/* Show multi-room combinations for family bookings */}
              {formData.attendingWith === "Family" &&
              formData.familyMembers &&
              parseInt(formData.roomsRequired) > 1 ? (
                <div>
                  {/* Room availability checker */}
                  <RoomCombinationSelector />
                </div>
              ) : (
                /* Show single room selection UI for individual or single room family bookings */
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {/* Occupancy Type */}
                  <div className="flex flex-col">
                    <label
                      htmlFor="occupancyType"
                      className="text-sm font-medium text-gray-700 mb-1"
                    >
                      Occupancy Type
                    </label>
                    <select
                      id="occupancyType"
                      name="occupancyType"
                      value={formData.occupancyType}
                      onChange={handleChange}
                      className={inputClass}
                    >
                      {getOccupancyOptions().map((opt) => (
                        <option key={opt} value={opt}>
                          {opt}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Room Category */}
                  <div className="flex flex-col">
                    <label
                      htmlFor="roomCategory"
                      className="text-sm font-medium text-gray-700 mb-1 flex items-center"
                    >
                      Room Category
                      <button
                        type="button"
                        onClick={fetchRoomAvailability}
                        className="ml-2 text-xs text-blue-600 hover:underline flex items-center"
                        disabled={isCheckingAvailability}
                      >
                        {isCheckingAvailability ? (
                          <>
                            <FontAwesomeIcon
                              icon={faSync}
                              className="fa-spin mr-1"
                            />{" "}
                            Checking...
                          </>
                        ) : (
                          <>
                            <FontAwesomeIcon icon={faSync} className="mr-1" />{" "}
                            Check Availability
                          </>
                        )}
                      </button>
                    </label>
                    <select
                      id="roomCategory"
                      name="roomCategory"
                      value={formData.roomCategory}
                      onChange={handleChange}
                      className={inputClass}
                    >
                      {getAvailableRoomCategories().map((room) => (
                        <option
                          key={room}
                          value={room}
                          disabled={
                            Object.keys(roomAvailability).length > 0 &&
                            !isRoomAvailable(room)
                          }
                        >
                          {room} - {roomMaxOccupancy[room]}
                          {Object.keys(roomAvailability).length > 0 &&
                            ` (${
                              isRoomAvailable(room)
                                ? "Available"
                                : "Unavailable"
                            })`}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              )}

              {formData.roomCategory &&
                formData.occupancyType &&
                !(
                  formData.attendingWith === "Family" &&
                  parseInt(formData.roomsRequired) > 1
                ) && (
                  <div className="mt-4 p-3 border rounded bg-gray-50 text-gray-800">
                    <p>
                      <strong>Room Type:</strong> {formData.roomCategory} -{" "}
                      {roomMaxOccupancy[formData.roomCategory]}
                    </p>
                    <p>
                      <strong>Occupancy:</strong> {formData.occupancyType}
                    </p>
                    <p>
                      <strong>Number of Rooms:</strong> {formData.roomsRequired}
                    </p>
                    {formData.attendingWith === "Individual" &&
                      formData.individualRoomType === "Sharing room" && (
                        <p>
                          <strong>Room Type:</strong> Sharing (
                          {formData.occupancyType === "Double"
                            ? "50%"
                            : formData.occupancyType === "Triple"
                            ? "1/3"
                            : formData.occupancyType === "4 Pax"
                            ? "1/4"
                            : "50%"}{" "}
                          per person)
                        </p>
                      )}
                    <p>
                      <strong>Price:</strong> ₹
                      {formData.attendingWith === "Individual" &&
                      formData.individualRoomType === "Sharing room"
                        ? (() => {
                            const basePrice =
                              roomPricing[formData.roomCategory]?.[
                                formData.occupancyType
                              ]?.net || 0;
                            const occupants = {
                              Double: 2,
                              Triple: 3,
                              "4 Pax": 4,
                            };
                            const numberOfOccupants =
                              occupants[formData.occupancyType] || 2;
                            return Math.round(basePrice / numberOfOccupants);
                          })()
                        : roomPricing[formData.roomCategory]?.[
                            formData.occupancyType
                          ]?.net || 0}{" "}
                      Per night Per room
                    </p>
                    <p>
                      <strong>Total Price:</strong> ₹
                      {formData.attendingWith === "Individual" &&
                      formData.individualRoomType === "Sharing room"
                        ? (() => {
                            const basePrice =
                              roomPricing[formData.roomCategory]?.[
                                formData.occupancyType
                              ]?.net || 0;
                            const occupants = {
                              Double: 2,
                              Triple: 3,
                              "4 Pax": 4,
                            };
                            const numberOfOccupants =
                              occupants[formData.occupancyType] || 2;
                            return (
                              Math.round(basePrice / numberOfOccupants) *
                              Number(formData.roomsRequired || 1)
                            );
                          })()
                        : (roomPricing[formData.roomCategory]?.[
                            formData.occupancyType
                          ]?.net || 0) *
                          Number(formData.roomsRequired || 1)}{" "}
                      Per night
                    </p>

                    {/* Show availability status */}
                    {Object.keys(roomAvailability).length > 0 && (
                      <p className="mt-2">
                        <strong>Availability:</strong>
                        <span
                          className={`ml-2 px-2 py-1 rounded-full text-sm ${
                            isRoomAvailable(formData.roomCategory)
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          <FontAwesomeIcon
                            icon={
                              isRoomAvailable(formData.roomCategory)
                                ? faCheckCircle
                                : faTimesCircle
                            }
                            className="mr-1"
                          />
                          {isRoomAvailable(formData.roomCategory)
                            ? `Available (${
                                roomAvailability[formData.roomCategory]
                              } rooms)`
                            : "Unavailable"}
                        </span>
                      </p>
                    )}
                  </div>
                )}

              {/* Display selected combination summary */}
              {selectedCombination &&
                formData.attendingWith === "Family" &&
                parseInt(formData.roomsRequired) > 1 && (
                  <div className="mt-4 p-3 border rounded bg-blue-50 text-gray-800">
                    <h4 className="font-semibold mb-2">
                      Selected Room Combination
                    </h4>
                    {selectedCombination.rooms.map((room, index) => (
                      <p
                        key={index}
                        className="flex justify-between border-b pb-1 mb-1"
                      >
                        <span>
                          <strong>Room {index + 1}:</strong> {room.category} -{" "}
                          {room.occupancyType}
                        </span>
                        <span>₹{room.price}</span>
                      </p>
                    ))}
                    <p className="mt-2 flex justify-between font-semibold">
                      <span>Total Price Per Night:</span>
                      <span>₹{selectedCombination.totalPrice}</span>
                    </p>
                    <p className="mt-1 flex justify-between font-semibold">
                      <span>
                        Total for {formData.checkinDates === "4-6" ? "2" : "1"}{" "}
                        nights:
                      </span>
                      <span>
                        ₹
                        {selectedCombination.totalPrice *
                          (formData.checkinDates === "4-6" ? 2 : 1)}
                      </span>
                    </p>
                  </div>
                )}

              <Imagegallery />
            </>
          )}

          {/* Event Participation - Auto add-on for staying guests */}
          {formData.radissonStay === "Yes" && (
            <div className="mt-6">
              <label className="block font-semibold text-gray-700 mb-2">
                Event Participation
                {/* (Auto add-on) */}
              </label>

              <div className="flex flex-col gap-2 text-gray-800">
                <div className="flex items-center gap-2">
                  <span className="font-medium">
                    4th & 5th July – ₹3,000 (Charged once per registration)
                  </span>
                </div>
                <div className="text-sm text-gray-600">
                  <div>
                    Event participation is automatically included for all
                    staying guests
                  </div>
                </div>
              </div>
            </div>
          )}

          {formData.radissonStay !== "Yes" && (
            <div className="mt-6">
              <label className="block font-semibold text-gray-700 mb-2">
                Will you be attending the event?
              </label>
              <div className="flex gap-6 mb-4">
                <label className="flex items-center gap-2 text-gray-800">
                  <input
                    type="radio"
                    name="attendEvent"
                    value="yes"
                    checked={formData.attendEvent === "yes"}
                    onChange={() =>
                      setFormData((prev) => ({ ...prev, attendEvent: "yes" }))
                    }
                  />
                  Yes
                </label>
                {/* <label className="flex items-center gap-2 text-gray-800">
                  <input
                    type="radio"
                    name="attendEvent"
                    value="no"
                    checked={formData.attendEvent === "no"}
                    onChange={() =>
                      setFormData((prev) => ({ ...prev, attendEvent: "no" }))
                    }
                  />
                  No
                </label> */}
              </div>

              {formData.attendEvent === "yes" && (
                <>
                  {/* Number of Members */}
                  <div className="mb-4">
                    <label className="block text-gray-700 font-medium mb-1">
                      Number of Members Attending:
                    </label>
                    <input
                      type="number"
                      name="memberCount"
                      value={formData.memberCount}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          memberCount: e.target.value,
                        }))
                      }
                      className="w-32 border border-gray-300 rounded-md px-3 py-2"
                      min="1"
                    />
                  </div>

                  {/* Event Days */}
                  <div>
                    <label className="block font-semibold text-gray-700 mb-2">
                      Event Participation
                    </label>

                    {/* 4th & 5th July */}
                    <div className="mb-2 text-gray-700">
                      <label className="block mb-1 font-medium">
                        <input
                          type="radio"
                          name="eventDays"
                          value="4and5"
                          checked={formData.eventDays?.selectedDay === "4and5"}
                          onChange={(e) =>
                            setFormData((prev) => ({
                              ...prev,
                              eventDays: {
                                ...prev.eventDays,
                                selectedDay: e.target.value,
                              },
                            }))
                          }
                          className="mr-2"
                        />
                        I&#8217;m interested in attending the Event on 4th July
                        5th July & 6th July (No-Stay) <br />
                        Event Fee: <strong>₹3,000</strong> & Dinner Cost{" "}
                        <strong>₹2,500</strong> Per Person/Per Day
                      </label>
                    </div>

                    {/* 5th July Only */}
                    <div className="mb-2 text-gray-700">
                      <label className="block mb-1 font-medium">
                        <input
                          type="radio"
                          name="eventDays"
                          value="5only"
                          checked={formData.eventDays?.selectedDay === "5only"}
                          onChange={(e) =>
                            setFormData((prev) => ({
                              ...prev,
                              eventDays: {
                                ...prev.eventDays,
                                selectedDay: e.target.value,
                              },
                            }))
                          }
                          className="mr-2"
                        />
                        I&#8217;m interested in attending the Event on 5th July
                        & 6th July (No-stay) <br />
                        Event Fee: <strong>₹3,000</strong> & Dinner Cost{" "}
                        <strong>₹2,500</strong> Per Person/Per Day
                      </label>
                    </div>

                    {/* 6th July */}
                    <div className="text-gray-700 mb-4">
                      <label className="block mb-1 font-medium">
                        <input
                          type="radio"
                          name="eventDays"
                          value="6"
                          checked={formData.eventDays?.selectedDay === "6"}
                          onChange={(e) => {
                            setFormData((prev) => ({
                              ...prev,
                              eventDays: {
                                ...prev.eventDays,
                                selectedDay: e.target.value,
                              },
                            }));
                            setShowPopup(true);
                          }}
                          className="mr-2"
                        />
                        I&#8217;m interested in attending the college Day event
                        only on 6th July (No-stay & No-dinner) <br />
                        Event Fee: <strong>₹2,000</strong>
                      </label>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}

          {formData.radissonStay === "Yes" && (
            <div>
              <label className="block font-semibold text-gray-700 mb-2">
                Cocktail Dinner Charges
              </label>

              <div className="flex flex-col gap-2 text-gray-800">
                <div className="flex items-center gap-2">
                  <span className="font-medium">
                    Per Person Per Night:{" "}
                    <strong>₹{DINNER_PRICE_PER_PERSON_PER_NIGHT}</strong>
                    {/* (Auto add-on) */}
                  </span>
                </div>
                {formData.checkinDates && (
                  <div className="text-sm text-gray-600">
                    <div className="flex gap-3">
                      <div>
                        Nights: {formData.checkinDates === "4-6" ? "2" : "1"}
                      </div>
                      <div>
                        Participants:{" "}
                        {formData.attendingWith === "Family"
                          ? formData.familyMembers || 1
                          : 1}
                      </div>
                    </div>
                    <div className="font-semibold mt-1">
                      Total Dinner Charges: ₹{priceBreakdown.dinnerCharges}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {formData.radissonStay === "Yes" &&
            !(
              formData.attendingWith === "Individual" &&
              formData.individualRoomType === "Sharing room"
            ) && (
              <div className="mt-6">
                <label className="block font-semibold text-gray-700 mb-2">
                  Do you need early check-in or late check-out?
                </label>
                <div className="flex gap-6">
                  <label className="flex items-center gap-2 text-gray-800">
                    <input
                      type="radio"
                      name="earlyLateOption"
                      value="yes"
                      checked={formData.earlyLateOption === "yes"}
                      onChange={() =>
                        setFormData((prev) => ({
                          ...prev,
                          earlyLateOption: "yes",
                        }))
                      }
                    />
                    Yes
                  </label>
                  <label className="flex items-center gap-2 text-gray-800">
                    <input
                      type="radio"
                      name="earlyLateOption"
                      value="no"
                      checked={formData.earlyLateOption === "no"}
                      onChange={() =>
                        setFormData((prev) => ({
                          ...prev,
                          earlyLateOption: "no",
                        }))
                      }
                    />
                    No
                  </label>
                </div>
              </div>
            )}

          {/* Conditionally render AccommodationOptions */}
          {formData.earlyLateOption === "yes" && (
            <AccommodationOptions
              onSelect={handleAccommodationSelect}
              selectedOptions={formData.accommodationOptions}
              roomCategory={formData.roomCategory}
              occupancyType={formData.occupancyType}
              isSharing={
                formData.attendingWith === "Individual" &&
                formData.individualRoomType === "Sharing room"
              }
            />
          )}

          <div className="mt-6">
            <label className="block font-semibold text-gray-700 mb-2">
              Please select your T-shirt Size (Applicable for Primary Alumni
              Guest only)
              <span className="text-red-500">*</span>
            </label>

            {/* Gender Selection */}
            <div className="mb-4">
              <label className="block font-medium text-gray-700 mb-2">
                Gender:
              </label>
              <div className="flex gap-6">
                {["Male", "Female"].map((genderOption) => (
                  <label
                    key={genderOption}
                    className="flex items-center gap-2 text-gray-800"
                  >
                    <input
                      type="radio"
                      name="gender"
                      value={genderOption}
                      checked={formData.gender === genderOption}
                      onChange={handleChange}
                    />
                    {genderOption}
                  </label>
                ))}
              </div>
            </div>

            {/* T-shirt Size Selection */}
            <div className="flex flex-col">
              <label className="text-sm font-medium text-gray-700 mb-1">
                T-shirt Size:
              </label>
              <select
                name="tshirtSize"
                value={formData.tshirtSize}
                onChange={handleChange}
                className={inputClass}
              >
                <option value="">Select T-shirt Size</option>
                {formData.gender === "Male" ? (
                  <>
                    <option value="S">S (38)</option>
                    <option value="M">M (40)</option>
                    <option value="L">L (42)</option>
                    <option value="XL">XL (44)</option>
                    <option value="XXL">XXL (46)</option>
                  </>
                ) : (
                  <>
                    <option value="S">S</option>
                    <option value="M">M</option>
                    <option value="L">L</option>
                    <option value="XL">XL</option>
                    <option value="XXL">XXL</option>
                  </>
                )}
              </select>
            </div>
          </div>

          <div>
            <label className="block font-semibold text-gray-700 mb-2">
              Do you require Arrival airport transfer?
            </label>
            <div className="flex gap-6">
              <label className="flex items-center gap-2 text-gray-800">
                <input
                  type="radio"
                  name="airportTransfer"
                  value="yes"
                  checked={formData.airportTransfer === true}
                  onChange={() =>
                    setFormData((prev) => ({
                      ...prev,
                      airportTransfer: true,
                      // flightBookingAssistance: null, // Reset assistance field if switching
                    }))
                  }
                />
                Yes
              </label>
              <label className="flex items-center gap-2 text-gray-800">
                <input
                  type="radio"
                  name="airportTransfer"
                  value="no"
                  checked={formData.airportTransfer === false}
                  onChange={() =>
                    setFormData((prev) => ({
                      ...prev,
                      airportTransfer: false,
                    }))
                  }
                />
                No
              </label>
            </div>

            {/* If Airport Transfer is YES */}
            {formData.airportTransfer === true && (
              <>
                <div className="mt-4">
                  <label className="block font-semibold text-gray-700 mb-2">
                    1. Flight Arrival Details (for Airport Transfer):
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <input
                      type="datetime-local"
                      name="arrivalDateTime"
                      value={formData.arrivalDateTime}
                      onChange={handleChange}
                      className={inputClass}
                    />
                    <input
                      type="text"
                      name="flightNumber"
                      placeholder="Flight Number"
                      value={formData.flightNumber}
                      onChange={handleChange}
                      className={inputClass}
                    />
                    <input
                      type="text"
                      name="arrivalAirport"
                      placeholder="Arrival Airport"
                      value={formData.arrivalAirport}
                      onChange={handleChange}
                      className={inputClass}
                    />
                  </div>
                </div>
                <div className="mt-6">
                  <label className="block font-semibold text-gray-700 mb-4">
                    2. Select Your Cab
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {[
                      {
                        type: "Sedan",
                        price: 600,
                        image: "🚗",
                        title: "3 person",
                      },
                      {
                        type: "Innova",
                        price: 1100,
                        image: "🚙",
                        title: "5 person",
                      },
                      {
                        type: "Crysta",
                        price: 1600,
                        image: "🚘",
                        title: "5 person",
                      },
                    ].map((cab) => (
                      <div
                        key={cab.type}
                        onClick={() =>
                          setFormData((prev) => ({
                            ...prev,
                            cabType: cab.type,
                          }))
                        }
                        className={`cursor-pointer border rounded-lg p-1 text-center transition ${
                          formData.cabType === cab.type
                            ? "border-blue-500 bg-blue-50"
                            : "border-gray-200"
                        }`}
                      >
                        <div className="mx-auto mb-2"> {cab.image}</div>
                        <div className="font-medium">₹{cab.price}</div>
                        <div className="font-medium">
                          {cab.type} ({cab.title})
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}

            {/* If Airport Transfer is NO, ask for flight booking assistance */}
            {/* {formData.airportTransfer === false && ( */}
            <div className="mt-4 bg-white p-2 rounded-lg">
              <label className="block font-semibold text-gray-700 mb-2">
                Do you need assistance in flight booking?
              </label>
              <div className="flex gap-6">
                <label className="flex items-center gap-2 text-gray-800">
                  <input
                    type="radio"
                    name="flightBookingAssistance"
                    value="yes"
                    checked={formData.flightBookingAssistance === true}
                    onChange={() =>
                      setFormData((prev) => ({
                        ...prev,
                        flightBookingAssistance: true,
                      }))
                    }
                  />
                  Yes
                </label>
                <label className="flex items-center gap-2 text-gray-800">
                  <input
                    type="radio"
                    name="flightBookingAssistance"
                    value="no"
                    checked={formData.flightBookingAssistance === false}
                    onChange={() =>
                      setFormData((prev) => ({
                        ...prev,
                        flightBookingAssistance: false,
                      }))
                    }
                  />
                  No
                </label>
              </div>
            </div>
            {/* )} */}
          </div>

          {/* Special Requests */}
          <textarea
            name="specialRequests"
            rows={3}
            value={formData.specialRequests}
            onChange={handleChange}
            placeholder="Special requests or notes (e.g., dietary needs, accessibility)..."
            className="w-full border rounded-md p-3 bg-gray-50"
          />
          <TermsAndConditions />
          <HotelPolicy />
          <CancellationPolicy />

          {/* Price Breakdown */}
          {priceBreakdown.totalPrice > 0 && (
            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <h3 className="text-lg font-semibold mb-3">Price Breakdown</h3>
              <div className="space-y-2">
                {priceBreakdown.roomCharges > 0 && (
                  <div className="flex justify-between">
                    <span>Room Charges:</span>
                    <span>₹{formatPrice(priceBreakdown.roomCharges)}</span>
                  </div>
                )}
                {priceBreakdown.dinnerCharges > 0 && (
                  <div className="flex justify-between">
                    <span>Dinner Charges:</span>
                    <span>₹{formatPrice(priceBreakdown.dinnerCharges)}</span>
                  </div>
                )}
                {priceBreakdown.eventCharges > 0 && (
                  <div className="flex justify-between">
                    <span>Event Charges:</span>
                    <span>₹{formatPrice(priceBreakdown.eventCharges)}</span>
                  </div>
                )}
                {priceBreakdown.accommodationCharges > 0 && (
                  <div>
                    <div className="flex justify-between">
                      <span>Early Check-in/Late Checkout:</span>
                      <span>
                        ₹{formatPrice(priceBreakdown.accommodationCharges)}
                      </span>
                    </div>
                    {formData.accommodationOptions.map((opt, index) => (
                      <div key={index} className="text-sm text-gray-600 ml-4">
                        {opt.title} ({opt.timing}) -{" "}
                        {opt.priceLabel || "Charges"}: ₹{opt.price || 0}
                      </div>
                    ))}
                  </div>
                )}
                {priceBreakdown.transportationCharges > 0 && (
                  <div className="flex justify-between">
                    <span>Transportation:</span>
                    <span>
                      ₹{formatPrice(priceBreakdown.transportationCharges)}
                    </span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Payment Gateway Charges:</span>
                  <span>₹{formatPrice(CONVENIENCE_FEE)}</span>
                </div>
                <div className="border-t pt-2 font-semibold">
                  <div className="flex justify-between">
                    <span>Total Amount:</span>
                    <span>₹{formatPrice(priceBreakdown.totalPrice)}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Submit Button */}
          <div className="flex justify-center">
            <button
              type="submit"
              disabled={loading}
              className="flex justify-center items-center bg-[#027A8C] text-white px-6 py-3 rounded-md hover:bg-[#026675] transition disabled:opacity-50"
            >
              {loading ? "Processing..." : "Submit Registration"}
            </button>
          </div>
        </form>
        <div className="sm:w-[30%] w-full">
          <Payment
            bookingData={formData}
            priceBreakdown={priceBreakdown}
            onAccommodationRemove={handleAccommodationRemove}
            onSubmit={handleSubmit}
            loading={loading}
            // Add room combination details for multi-room bookings
            selectedRoomCombination={selectedCombination}
          />
        </div>
      </div>

      {/* Popup for 6th July goodies */}
      {showPopup && formData.eventDays?.selectedDay === "6" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-xl p-6 max-w-sm shadow-lg text-center">
            <h2 className="text-lg font-semibold mb-3">Note</h2>
            <p className="text-sm mb-4">
              The members attending event only on 6th July will receive T shirt
              and Group photo frame mementos.
            </p>
            <button
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
              onClick={() => setShowPopup(false)}
            >
              Got it
            </button>
          </div>
        </div>
      )}

      {/* Popup for occupancy information */}
      {showOccupancyPopup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-xl p-6 max-w-md shadow-lg text-center">
            <h2 className="text-lg font-semibold mb-3">Important Note</h2>
            <p className="text-md mb-4">{occupancyPopupMessage}</p>
            <button
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
              onClick={() => setShowOccupancyPopup(false)}
            >
              I Understand
            </button>
          </div>
        </div>
      )}
    </>
  );
};

// Tailwind Input Style
const inputClass =
  "border border-gray-300 bg-white p-3 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-blue-500";

export default JubileeAlumniForm;
