import { useState, useEffect, useRef, useCallback, memo, useMemo } from "react";
import { useSelector } from "react-redux";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPlane,
  faCaretDown,
  faCaretRight,
  faShareNodes,
  faBed,
  faSpinner,
  faTrashAlt,
  faTrain,
  faBus,
  faCar
} from "@fortawesome/free-solid-svg-icons";
import GlobalTravelPolicy from "./GlobalTravelPolicy";
import FlightPolicySection from "./Flight/FlightPolicySection";
import HotelPolicySection from "./Hotel/HotelPolicySection";
import axios, { fetchAndUpdateUserDetails } from "@/utils/axios/axios";
import config from "@/config";
import useFormValidator from "@/hooks/useFormValidator";
import showToast from "@/utils/toast";
import Loader from "@/components/corporate/loader/Loader";
import { TRAVEL_CATEGORIES } from "@/utils/constants";
import Modal from "@/components/corporate/modal/Modal";
import TransportPolicySection from "./TransportPolicySection";

const TravelPolicyList = ({
  travelPolicyData,
  onClose,
  expandedPolicyId,
  setExpandedPolicyId,
  activeTab: activeTabParent,
  fetchDataPerSection,
  isTravelVisible,
  setIsTravelVisible,
}) => {
  const userDetails = useSelector((state) => state?.user?.userInfo);
  const companyId = userDetails?.companyId;

  const { travelPolicies = [], count = 0 } = travelPolicyData;

  const initialRender = useRef(true);

  const initialFormData = useMemo(
    () => ({
      isGlobalTravelPolicy: count === 0,
      travelPolicyName: count === 0 ? "Global Travel Policy" : "",
      // companyId: "",
      departmentId: null,
      designationId: null,
      levelId: null,
      employeeId: null,
      bandId: null,
      isOverWrite: false,
      policyConfigData: [
        {
          travelCategory: TRAVEL_CATEGORIES.FLIGHTS,
          eligibility: [],
          budget: [],
          cabinClass: [],
          ssrTypes: [],
          dateChangeAllowed: false,
          bookingWindow: null,
          approvalConfiguration: [],
        },
        {
          travelCategory: TRAVEL_CATEGORIES.HOTELS,
          refundable: null,
          eligibility: [],
          budget: [],
          hotelCategory: [],
          filters: [],
          dateChangeAllowed: false,
          bookingWindow: null,
          approvalConfiguration: [],
        },
        {
          travelCategory: TRAVEL_CATEGORIES.TRAINS || "3",
          eligibility: [],
          budget: null,  // Single budget value for train
          dateChangeAllowed: false,
          bookingWindow: null,
          approvalConfiguration: [],
        },
        {
          travelCategory: TRAVEL_CATEGORIES.BUS || "4",
          eligibility: [],
          budget: null,  // Single budget value for bus
          dateChangeAllowed: false,
          bookingWindow: null,
          approvalConfiguration: [],
        },
        {
          travelCategory: TRAVEL_CATEGORIES.CAR_RENTAL || "5",
          eligibility: [],
          budget: null,  // Single budget value for car
          dateChangeAllowed: false,
          bookingWindow: null,
          approvalConfiguration: [],
        },
      ],
      // status: "active",
      // createdBy: "",
      // modifiedBy: "",
    }),
    [count]
  );

  const [activeTab, setActiveTab] = useState("flight");
  const [validationTrigger, setValidationTrigger] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [hasFetchedData, setHasFetchedData] = useState(false);
  const [duplicatePolicyId, setDuplicatePolicyId] = useState(null);
  const [selectedTravelPolicies, setSelectedTravelPolicies] = useState([]);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // masterData
  const [flightMaster, setFlightMaster] = useState(null);
  const [hotelMaster, setHotelMaster] = useState(null);
  const [trainMaster, setTrainMaster] = useState(null);
  const [busMaster, setBusMaster] = useState(null);
  const [carMaster, setCarMaster] = useState(null);

  const [formData, setFormData] = useState(initialFormData);

  // (department, designation, level, band, or employee) and the array of items.
  const [mappingDisplay, setMappingDisplay] = useState({
    type: "", // e.g. "department"
    items: [], // e.g. [ {id: '4', name: 'Design'}, ... ]
  });

  // if component unmounts
  useEffect(() => {
    return () => {
      setExpandedPolicyId(null);
      setIsTravelVisible(false);
    };
  }, [setExpandedPolicyId, setIsTravelVisible]);

  useEffect(() => {
    const fetchMasterData = async () => {
      try {
        // The master API that returns travelCategory=1 => hotels, travelCategory=2 => flights
        const resp = await axios.get(
          config.CORPORATE.TRAVEL_POLICY_MASTER_DATA
        );
        if (resp?.data?.status === "SUCCESS") {
          const masterList = resp?.data?.data; // array
          const flightObj = masterList.find(
            (m) => m.travelCategory === TRAVEL_CATEGORIES.FLIGHTS
          );
          const hotelObj = masterList.find(
            (m) => m.travelCategory === TRAVEL_CATEGORIES.HOTELS
          );
          const trainObj = masterList.find(
            (m) => m.travelCategory === (TRAVEL_CATEGORIES.TRAINS || "3")
          );
          const busObj = masterList.find(
            (m) => m.travelCategory === (TRAVEL_CATEGORIES.BUS || "4")
          );
          const carObj = masterList.find(
            (m) => m.travelCategory === (TRAVEL_CATEGORIES.CAR_RENTAL || "5")
          );
          setFlightMaster(flightObj);
          setHotelMaster(hotelObj);
          setTrainMaster(trainObj);
          setBusMaster(busObj);
          setCarMaster(carObj);
          setHasFetchedData(true);
        }
      } catch (err) {
        console.error("Error fetching master data:", err);
      } finally {
        setInitialLoading(false);
      }
    };

    if (initialRender.current) {
      initialRender.current = false;
      fetchMasterData();
    }
  }, []);

  useEffect(() => {
    if (isTravelVisible && count > 0) {
      const formData = {
        ...initialFormData,
        isGlobalTravelPolicy: false,
        travelPolicyName: "",
      };
      setFormData(formData);
      setMappingDisplay({ type: "", items: [] });
    }
  }, [count, isTravelVisible, initialFormData]);

  const flightErrorRef = useRef(null);
  const hotelErrorRef = useRef(null);
  const trainErrorRef = useRef(null);
  const busErrorRef = useRef(null);
  const carErrorRef = useRef(null);

  const customMessages = {
    required: "This field is required.",
    numeric: "This field must be a number.",
  };

  const customRules = {};

  const [validator] = useFormValidator(customMessages, customRules);

  const transformPolicyData = (policy) => {
    // Helper function to normalize strings for comparison
    const normalizeString = (str) => str?.toLowerCase().replace(/\s+/g, "") || "";

    // Get master data for all categories
    const flightMasterData = flightMaster?.masterData || [];
    const hotelMasterData = hotelMaster?.masterData || [];
    const trainMasterData = trainMaster?.masterData || [];
    const busMasterData = busMaster?.masterData || [];
    const carMasterData = carMaster?.masterData || [];

    // Extract configs for each category from policy data
    const flightData = policy?.policyConfigData?.find(
      (c) => c.travelCategory === TRAVEL_CATEGORIES.FLIGHTS
    ) || {};

    const hotelData = policy?.policyConfigData?.find(
      (c) => c.travelCategory === TRAVEL_CATEGORIES.HOTELS
    ) || {};

    const trainData = policy?.policyConfigData?.find(
      (c) => c.travelCategory === (TRAVEL_CATEGORIES.TRAINS || "3")
    ) || {};

    const busData = policy?.policyConfigData?.find(
      (c) => c.travelCategory === (TRAVEL_CATEGORIES.BUS || "4")
    ) || {};

    const carData = policy?.policyConfigData?.find(
      (c) => c.travelCategory === (TRAVEL_CATEGORIES.CAR_RENTAL || "5")
    ) || {};

    // FLIGHT DATA SYNCHRONIZATION
    const availableFlightRegions =
      flightMasterData
        .find((m) => normalizeString(m.value) === "budget")
        ?.data?.map((item) => String(item.regionalCategoryId)) || [];

    const availableFlightEligibility =
      flightMasterData
        .find((m) => normalizeString(m.value) === "eligibility")
        ?.data?.map((item) => item.eligibilityId) || [];

    const comfortSection = flightMasterData.find(
      (m) => normalizeString(m.value) === "comfortandconvenience"
    );

    const availableFlightCabinClass =
      comfortSection?.subvalues
        ?.find((s) => normalizeString(s.subvalue) === "class")
        ?.data?.map((item) => parseInt(item.cabinClassId)) || [];

    const availableFlightSsrTypes =
      comfortSection?.subvalues
        ?.find((s) => normalizeString(s.subvalue) === "add-ons")
        ?.data?.map((item) => parseInt(item.ssrTypeId)) || [];

    const availableFlightApprovalConfig =
      flightMasterData
        .find((m) => normalizeString(m.value) === "policyconfiguration")
        ?.travelApprovalConfigs?.map((item) => item.approvalConfigId) || [];

    // HOTEL DATA SYNCHRONIZATION
    const availableHotelRegions =
      hotelMasterData
        .find((m) => normalizeString(m.value) === "budget")
        ?.data?.map((item) => String(item.regionalCategoryId)) || [];

    const availableHotelEligibility =
      hotelMasterData
        .find((m) => normalizeString(m.value) === "eligibility")
        ?.data?.map((item) => item.eligibilityId) || [];

    const hotelCategorySection = hotelMasterData.find(
      (m) => normalizeString(m.value) === "hotelcategory"
    );

    const availableHotelCategories =
      hotelCategorySection?.subvalues
        ?.find((s) => normalizeString(s.subvalue) === "starratings")
        ?.data?.map((item) => parseInt(item.ratingId)) || [];

    const availableHotelFilters =
      hotelCategorySection?.subvalues
        ?.find((s) => normalizeString(s.subvalue) === "filters")
        ?.data?.map((item) => item.filterId) || [];

    const availableHotelApprovalConfig =
      hotelMasterData
        .find((m) => normalizeString(m.value) === "policyconfiguration")
        ?.travelApprovalConfigs?.map((item) => item.approvalConfigId) || [];

    // TRAIN DATA SYNCHRONIZATION
    const availableTrainEligibility =
      trainMasterData
        .find((m) => normalizeString(m.value) === "eligibility")
        ?.data?.map((item) => item.eligibilityId) || [];

    const availableTrainApprovalConfig =
      trainMasterData
        .find((m) => normalizeString(m.value) === "policyconfiguration")
        ?.travelApprovalConfigs?.map((item) => item.approvalConfigId) || [];

    // BUS DATA SYNCHRONIZATION
    const availableBusEligibility =
      busMasterData
        .find((m) => normalizeString(m.value) === "eligibility")
        ?.data?.map((item) => item.eligibilityId) || [];

    const availableBusApprovalConfig =
      busMasterData
        .find((m) => normalizeString(m.value) === "policyconfiguration")
        ?.travelApprovalConfigs?.map((item) => item.approvalConfigId) || [];

    // CAR RENTAL DATA SYNCHRONIZATION
    const availableCarEligibility =
      carMasterData
        .find((m) => normalizeString(m.value) === "eligibility")
        ?.data?.map((item) => item.eligibilityId) || [];

    const availableCarApprovalConfig =
      carMasterData
        .find((m) => normalizeString(m.value) === "policyconfiguration")
        ?.travelApprovalConfigs?.map((item) => item.approvalConfigId) || [];

    // Sync flight data
    const syncedFlightBudget = (flightData.budget || [])
      .filter((b) =>
        availableFlightRegions.includes(String(b.regionalCategoryId))
      )
      .map((b) => ({
        regionalCategoryId: String(b.regionalCategoryId),
        amount: b.amount,
      }));

    const syncedFlightEligibility = (flightData.eligibility || [])
      .filter((item) => availableFlightEligibility.includes(item.eligibilityId))
      .map((item) => item.eligibilityId);

    const syncedFlightCabinClass = (flightData.cabinClass || [])
      .filter((item) =>
        availableFlightCabinClass.includes(parseInt(item.cabinClassId))
      )
      .map((item) => parseInt(item.cabinClassId));

    const syncedFlightSsrTypes = (flightData.ssrTypes || [])
      .filter((item) =>
        availableFlightSsrTypes.includes(parseInt(item.ssrTypeId))
      )
      .map((item) => parseInt(item.ssrTypeId));

    const syncedFlightApprovalConfig = (flightData.approvalConfiguration || [])
      .filter((item) =>
        String(availableFlightApprovalConfig).includes(
          String(item.approvalConfigId)
        )
      )
      .map((item) => ({
        approvalConfigId: item.approvalConfigId,
      }));

    // Sync hotel data
    const syncedHotelBudget = (hotelData.budget || [])
      .filter((b) =>
        availableHotelRegions.includes(String(b.regionalCategoryId))
      )
      .map((b) => ({
        regionalCategoryId: String(b.regionalCategoryId),
        amount: b.amount,
      }));

    const syncedHotelEligibility = (hotelData.eligibility || [])
      .filter((item) => availableHotelEligibility.includes(item.eligibilityId))
      .map((item) => item.eligibilityId);

    const syncedHotelCategory = (hotelData.hotelCategory || [])
      .filter((item) =>
        availableHotelCategories.includes(parseInt(item.ratingId))
      )
      .map((item) => parseInt(item.ratingId));

    const syncedHotelFilters = (hotelData.filters || [])
      .filter((item) => availableHotelFilters.includes(item.filterId))
      .map((item) => item.filterId);

    const syncedHotelApprovalConfig = (hotelData.approvalConfiguration || [])
      .filter((item) =>
        String(availableHotelApprovalConfig).includes(
          String(item.approvalConfigId)
        )
      )
      .map((item) => ({
        approvalConfigId: item.approvalConfigId,
      }));

    // Sync train data
    const syncedTrainEligibility = (trainData.eligibility || [])
      .filter((item) => availableTrainEligibility.includes(item.eligibilityId))
      .map((item) => item.eligibilityId);

    const syncedTrainApprovalConfig = (trainData.approvalConfiguration || [])
      .filter((item) =>
        String(availableTrainApprovalConfig).includes(
          String(item.approvalConfigId)
        )
      )
      .map((item) => ({
        approvalConfigId: item.approvalConfigId,
      }));

    // Sync bus data
    const syncedBusEligibility = (busData.eligibility || [])
      .filter((item) => availableBusEligibility.includes(item.eligibilityId))
      .map((item) => item.eligibilityId);

    const syncedBusApprovalConfig = (busData.approvalConfiguration || [])
      .filter((item) =>
        String(availableBusApprovalConfig).includes(
          String(item.approvalConfigId)
        )
      )
      .map((item) => ({
        approvalConfigId: item.approvalConfigId,
      }));

    // Sync car data
    const syncedCarEligibility = (carData.eligibility || [])
      .filter((item) => availableCarEligibility.includes(item.eligibilityId))
      .map((item) => item.eligibilityId);

    const syncedCarApprovalConfig = (carData.approvalConfiguration || [])
      .filter((item) =>
        String(availableCarApprovalConfig).includes(
          String(item.approvalConfigId)
        )
      )
      .map((item) => ({
        approvalConfigId: item.approvalConfigId,
      }));

    return {
      isGlobalTravelPolicy: policy.isGlobal ?? false,
      travelPolicyName: policy.travelPolicyName ?? "",
      // companyId: policy.companyId ?? "",
      departmentId:
        (policy?.departments || []).map((d) => d.departmentId) ?? null,
      designationId:
        (policy?.designations || []).map((d) => d.designationId) ?? null,
      levelId: (policy?.levels || []).map((l) => l.levelId) ?? null,
      employeeId: (policy?.employees || []).map((e) => e.employeeId) ?? null,
      bandId: (policy?.bands || []).map((b) => b.bandId) ?? null,
      isOverWrite: false,
      travelPolicyId: policy._id,
      policyConfigData: [
        {
          travelCategory: TRAVEL_CATEGORIES.FLIGHTS,
          eligibility: syncedFlightEligibility,
          budget: syncedFlightBudget,
          cabinClass: syncedFlightCabinClass,
          ssrTypes: syncedFlightSsrTypes,
          dateChangeAllowed: flightData.dateChangeAllowed ?? false,
          bookingWindow: flightData?.bookingWindow ?? null,
          approvalConfiguration: syncedFlightApprovalConfig,
        },
        {
          travelCategory: TRAVEL_CATEGORIES.HOTELS,
          refundable: hotelData.refundable ?? null,
          eligibility: syncedHotelEligibility,
          budget: syncedHotelBudget,
          hotelCategory: syncedHotelCategory,
          filters: syncedHotelFilters,
          dateChangeAllowed: hotelData.dateChangeAllowed ?? false,
          bookingWindow: hotelData?.bookingWindow ?? null,
          approvalConfiguration: syncedHotelApprovalConfig,
        },
        {
          travelCategory: TRAVEL_CATEGORIES.TRAINS || "3",
          eligibility: syncedTrainEligibility,
          budget: trainData.budget || null,
          dateChangeAllowed: trainData.dateChangeAllowed ?? false,
          bookingWindow: trainData?.bookingWindow ?? null,
          approvalConfiguration: syncedTrainApprovalConfig,
        },
        {
          travelCategory: TRAVEL_CATEGORIES.BUS || "4",
          eligibility: syncedBusEligibility,
          budget: busData.budget || null,
          dateChangeAllowed: busData.dateChangeAllowed ?? false,
          bookingWindow: busData?.bookingWindow ?? null,
          approvalConfiguration: syncedBusApprovalConfig,
        },
        {
          travelCategory: TRAVEL_CATEGORIES.CAR_RENTAL || "5",
          eligibility: syncedCarEligibility,
          budget: carData.budget || null,
          dateChangeAllowed: carData.dateChangeAllowed ?? false,
          bookingWindow: carData?.bookingWindow ?? null,
          approvalConfiguration: syncedCarApprovalConfig,
        },
      ],
      // status: policy.status ?? "active",
      // createdBy: policy.createdBy ?? "",
      // modifiedBy: policy.modifiedBy ?? "",
    };
  };

  const determineAndSetMapping = (policy) => {
    // Suppose only 1 can be selected:
    if (policy.departments && policy.departments.length > 0) {
      setMappingDisplay({
        type: "department",
        items: policy.departments.map((dep) => ({
          id: dep.departmentId,
          name: dep.departmentName,
        })),
      });
    } else if (policy.designations && policy.designations.length > 0) {
      setMappingDisplay({
        type: "designation",
        items: policy.designations.map((dg) => ({
          id: dg.designationId,
          name: dg.designationName || "NoName",
        })),
      });
    } else if (policy.levels && policy.levels.length > 0) {
      setMappingDisplay({
        type: "level",
        items: policy.levels.map((lvl) => ({
          id: lvl.levelId,
          name: lvl.levelName || "NoName",
        })),
      });
    } else if (policy.bands && policy.bands.length > 0) {
      // if you had `bands`, etc.
      setMappingDisplay({
        type: "band",
        items: policy.bands.map((b) => ({
          id: b.bandId,
          name: b.bandName || "NoName",
        })),
      });
    } else if (policy.employees && policy.employees.length > 0) {
      setMappingDisplay({
        type: "employee",
        items: policy.employees.map((emp) => ({
          id: emp.employeeId,
          name: emp.employeeName,
        })),
      });
    } else {
      // If truly none are selected
      setMappingDisplay({ type: "", items: [] });
    }
  };

  const togglePolicyExpansion = (policy) => {
    const policyId = policy._id;
    if (expandedPolicyId === policyId) {
      setExpandedPolicyId(null);
      setMappingDisplay({ type: "", items: [] });
      setFormData((prev) => {
        // Only remove travelPolicyId if it exists
        if (prev.travelPolicyId) {
          const { travelPolicyId, ...rest } = prev;
          return {
            ...rest,
          };
        }
        return prev;
      });
    } else {
      setExpandedPolicyId(policyId);
      determineAndSetMapping(policy);
      const transformedData = transformPolicyData(policy);
      setFormData(transformedData);
    }
  };

  const handlePolicyConfigUpdate = useCallback((updatedData) => {
    setFormData((prev) => {
      // Check if the update affects the `policyConfigData` or the top-level keys
      if (updatedData.travelCategory) {
        // Update specific `policyConfigData` based on `travelCategory`
        return {
          ...prev,
          policyConfigData: prev.policyConfigData.map((config) =>
            config.travelCategory === updatedData.travelCategory
              ? { ...config, ...updatedData }
              : config
          ),
        };
      } else {
        // Update top-level keys directly
        return {
          ...prev,
          ...updatedData,
        };
      }
    });
  }, []);

  const validateAllTabs = () => {
    const flightConfig = formData.policyConfigData.find(
      (c) => c.travelCategory === TRAVEL_CATEGORIES.FLIGHTS
    );
    const hotelConfig = formData.policyConfigData.find(
      (c) => c.travelCategory === TRAVEL_CATEGORIES.HOTELS
    );
    let isValid = true;

    // Validate Flight Tab
    if (!validator.allValid() || flightConfig.budget.length === 0) {
      isValid = false;
      validator.showMessages();
      setActiveTab("flight");
      return isValid;
    }

    // Validate Hotel Tab
    if (!validator.allValid() || hotelConfig.budget.length === 0) {
      isValid = false;
      validator.showMessages();
      setActiveTab("hotel");
      return isValid;
    }

    return isValid;
  };

  const handleSave = async (policyId = null) => {
    // const isValid = validateAllTabs();
    const isValid = validator.allValid();
    if (!isValid) {
      validator.showMessages();
      setValidationTrigger((prev) => !prev);
      return;
    }
    try {
      setInitialLoading(true);
      const userInfo = userDetails?.loggedInDetails?.userDetails;
      const userName = `${userInfo?.firstName} ${userInfo?.lastName}`;
      const isUpdate = !!formData?.travelPolicyId;
      const endpoint = isUpdate
        ? config.CORPORATE.TRAVEL_POLICY_UPDATE
        : config.CORPORATE.TRAVEL_POLICY_ADD;
      const payload = {
        ...formData,
        // companyId,
        // createdBy: userName,
        // modifiedBy: userName,
      };
      const resp = await axios.post(endpoint, payload);
      if (resp?.data?.status === "SUCCESS") {
        showToast(
          "success",
          isUpdate
            ? "Policy updated successfully"
            : "Policy created successfully"
        );
        setFormData(initialFormData);
        validator.hideMessages();
        setExpandedPolicyId(null);
        setIsTravelVisible(false);
        fetchAndUpdateUserDetails(userInfo?._id);
        await fetchDataPerSection(activeTabParent);
      } else {
        console.error("Error saving policy:", resp?.data?.message);
      }
    } catch (error) {
      console.error("Error saving policy:", error);
      showToast(
        "error",
        error?.response?.data?.message ||
        "something went wrong, please try again later"
      );
    } finally {
      setInitialLoading(false);
    }
  };

  const handleDuplicate = async (e, policyId) => {
    e.stopPropagation();
    try {
      setDuplicatePolicyId(policyId);

      // Make API call to create duplicate
      const resp = await axios.post(config.CORPORATE.TRAVEL_POLICY_DUPLICATE, {
        travelPolicyId: policyId,
      });

      if (resp?.data?.status === "SUCCESS") {
        showToast("success", "Policy duplicated successfully");

        // Refresh the policy list
        await fetchDataPerSection(activeTabParent);
      } else {
        showToast("error", resp?.data?.message || "Failed to duplicate policy");
      }
    } catch (error) {
      console.error("Error duplicating policy:", error);
      showToast(
        "error",
        error?.response?.data?.message ||
        "Something went wrong while duplicating the policy"
      );
    } finally {
      setDuplicatePolicyId(null);
    }
  };

  const toggleSelection = (e, policyId) => {
    e.stopPropagation();
    setSelectedTravelPolicies((prev) =>
      prev.includes(policyId)
        ? prev.filter((selectedId) => selectedId !== policyId)
        : [...prev, policyId]
    );
  };

  const handleDelete = async () => {
    if (selectedTravelPolicies.length === 0) return;

    try {
      const payload = { ids: selectedTravelPolicies };
      const response = await axios.post(
        `${config.CORPORATE.TRAVEL_POLICY_DELETE}`,
        payload
      );
      if (response.data.status === "SUCCESS") {
        showToast("success", "Travel Policy deleted successfully!");
        setShowDeleteModal(false);
        setSelectedTravelPolicies([]);
        fetchDataPerSection(activeTabParent);
      }
    } catch (error) {
      console.error("Error deleting travel policies:", error);
      setShowDeleteModal(false);
      showToast(
        "error",
        error?.response?.data?.message ||
        "something went wrong, please try again later"
      );
    }
  };

  const handleShowDeleteModal = () => {
    setShowDeleteModal(true);
  };

  const handleCloseDeleteModal = () => {
    setShowDeleteModal(false);
  };

  return (
    <>
      <div className="flex justify-end">
        <button
          onClick={handleShowDeleteModal}
          disabled={selectedTravelPolicies.length === 0}
          className={`relative text-[#028fa3] ${selectedTravelPolicies.length === 0
            ? "opacity-50 cursor-not-allowed"
            : "hover:text-red-600 transition-colors duration-300 transform hover:scale-110"
            }`}
        >
          <FontAwesomeIcon icon={faTrashAlt} className="text-[#028fa3]" />
        </button>
      </div>
      {initialLoading && !hasFetchedData ? (
        <div className="flex justify-center items-center h-64">
          <FontAwesomeIcon
            icon={faSpinner}
            className="text-[#028fa3] text-5xl animate-spin"
          />
        </div>
      ) : count === 0 ? (
        <GlobalTravelPolicy
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          flightMaster={flightMaster}
          hotelMaster={hotelMaster}
          trainMaster={trainMaster}
          busMaster={busMaster}
          carMaster={carMaster}
          formData={formData}
          onFormUpdate={handlePolicyConfigUpdate}
          validator={validator}
          onSave={handleSave}
          refs={{ flightErrorRef, hotelErrorRef }}
          initialLoading={initialLoading}
          isReadOnly={count === 0}
          mappingDisplay={mappingDisplay}
          setMappingDisplay={setMappingDisplay}
        />
      ) : (
        travelPolicies.map((policy, index) => {
          const isExpanded = expandedPolicyId === policy._id;
          const isTemporaryPolicy = policy.isTemporary;
          const isGlobalPolicy = policy.isGlobal;

          return (
            <>
              <div
                key={policy._id}
                className="w-full mx-auto p-3 bg-white cursor-pointer  rounded-lg border-1 border-[#028fa350]"
              >
                {/* Header */}

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={selectedTravelPolicies.includes(policy._id)}
                    onChange={(e) =>
                      !isGlobalPolicy || !isTemporaryPolicy
                        ? toggleSelection(e, policy._id)
                        : null
                    }
                    className={`m-2 before:content[''] peer relative h-5 w-5 cursor-pointer appearance-none rounded-md border border-gray-300 transition-all before:absolute before:block before:h-12 before:w-12 before:-translate-y-2/4 before:-translate-x-2/4 before:rounded-full before:bg-blue-gray-500 before:opacity-0 before:transition-opacity checked:border-[#028fa3] checked:bg-[#028fa3] disabled:opacity-50
        disabled:cursor-not-allowed ${isGlobalPolicy || (isTemporaryPolicy && "cursor-not-allowed")
                      }`}
                    disabled={isGlobalPolicy || isTemporaryPolicy}
                  />
                  <div
                    className="sm:flex sm:justify-between w-full sm:items-center "
                    onClick={() =>
                      !isTravelVisible
                        ? togglePolicyExpansion(policy)
                        : () => { }
                    }
                  >
                    <div>
                      <div className="flex justify-between items-center ">
                        <div className="text-sm sm:text-xl font-medium text-gray-800 cursor-pointer">
                          {policy.travelPolicyName}
                        </div>
                        <div className="flex justify-end sm:hidden items-center gap-2">
                          {isTemporaryPolicy ? (
                            <button
                              className="px-2 py-1 bg-red-500 text-white rounded"
                              onClick={() => onClose(policy._id)}
                            >
                              Remove
                            </button>
                          ) : (
                            <>
                              <button
                                disabled={isTravelVisible}
                                onClick={(e) => handleDuplicate(e, policy._id)}
                                className={`flex items-center gap-1 text-[#028fa3] text-xs sm:text-base font-normal bg-[#169CB00D] border-1 border-[#028fa330] px-3 py-1 rounded-2xl ${isTravelVisible
                                  ? "cursor-not-allowed"
                                  : "cursor-pointer"
                                  }`}
                              >
                                {duplicatePolicyId === policy._id ? (
                                  <FontAwesomeIcon
                                    icon={faSpinner}
                                    spin
                                    className="text-[#028fa3]"
                                  />
                                ) : (
                                  "Duplicate"
                                )}
                              </button>
                              {/* <button
                            disabled={isTravelVisible}
                            className={`flex items-center gap-1 text-[#028fa3] text-xs sm:text-base font-normal bg-[#169CB00D] border-1 border-[#028fa330] px-3 py-1 rounded-2xl ${
                              isTravelVisible
                                ? "cursor-not-allowed"
                                : "cursor-pointer"
                            }`}
                          >
                            <FontAwesomeIcon
                              icon={faShareNodes}
                              className="text-base"
                            />
                            Share
                          </button> */}
                              <FontAwesomeIcon
                                icon={isExpanded ? faCaretDown : faCaretRight}
                                className={`text-gray-500 text-lg hover:text-gray-800 ${isTravelVisible
                                  ? "cursor-not-allowed"
                                  : "cursor-pointer"
                                  }`}
                                onClick={() =>
                                  !isTravelVisible
                                    ? togglePolicyExpansion(policy)
                                    : () => { }
                                }
                              />
                            </>
                          )}
                        </div>
                      </div>
                      <div className="text-xxs sm:text-sm text-[#171A19CC] mt-2 leading-3">
                        {isGlobalPolicy
                          ? "General rules will be applied to an entire Organization"
                          : "Assign travel policy based on Department, Designation, Levels, Bands, or Individual Employees."}
                      </div>
                    </div>
                    <div className="hidden sm:flex items-center gap-2">
                      {isTemporaryPolicy ? (
                        <button
                          className="px-2 py-1 bg-red-500 text-white rounded"
                          onClick={() => onClose(policy._id)}
                        >
                          Remove
                        </button>
                      ) : (
                        <>
                          <button
                            disabled={isTravelVisible}
                            onClick={(e) => handleDuplicate(e, policy._id)}
                            className={`flex items-center gap-1 text-[#028fa3] text-xs sm:text-base font-normal bg-[#169CB00D] border-1 border-[#028fa330] px-3 py-1 rounded-2xl ${isTravelVisible
                              ? "cursor-not-allowed"
                              : "cursor-pointer"
                              }`}
                          >
                            {duplicatePolicyId === policy._id ? (
                              <FontAwesomeIcon
                                icon={faSpinner}
                                spin
                                className="text-[#028fa3]"
                              />
                            ) : (
                              "Duplicate"
                            )}
                          </button>
                          {/* <button
                            disabled={isTravelVisible}
                            className={`flex items-center gap-1 text-[#028fa3] text-xs sm:text-base font-normal bg-[#169CB00D] border-1 border-[#028fa330] px-3 py-1 rounded-2xl ${
                              isTravelVisible
                                ? "cursor-not-allowed"
                                : "cursor-pointer"
                            }`}
                          >
                            <FontAwesomeIcon
                              icon={faShareNodes}
                              className="text-base"
                            />
                            Share
                          </button> */}
                          <FontAwesomeIcon
                            icon={isExpanded ? faCaretDown : faCaretRight}
                            className={`text-gray-500 text-lg hover:text-gray-800 ${isTravelVisible
                              ? "cursor-not-allowed"
                              : "cursor-pointer"
                              }`}
                            onClick={() =>
                              !isTravelVisible
                                ? togglePolicyExpansion(policy)
                                : () => { }
                            }
                          />
                        </>
                      )}
                    </div>
                  </div>
                </div>
                {isExpanded && (
                  <>
                    <div className=" mt-3 flex items-center w-full sm:w-fit border-1 border-[#028fa3] rounded-full overflow-x-auto">
                      <button
                        className={`flex items-center text-xs sm:text-base gap-2 px-4 py-2 ${activeTab === "flight"
                          ? " text-[#028fa3]"
                          : "bg-white text-gray-600"
                          }`}
                        onClick={() => setActiveTab("flight")}
                      >
                        <FontAwesomeIcon
                          icon={faPlane}
                          className="transform -rotate-90"
                        />
                        Flight
                      </button>

                      <div className="border-r border-[#028fa3] h-10"></div>

                      <button
                        className={`flex items-center text-xs sm:text-base gap-2 px-4 py-2 ${activeTab === "hotel"
                          ? "text-[#028fa3]"
                          : "bg-white text-gray-600"
                          }`}
                        onClick={() => setActiveTab("hotel")}
                      >
                        <FontAwesomeIcon icon={faBed} />
                        Hotel
                      </button>

                      {/* Train Tab */}
                      <div className="border-r border-[#028fa3] h-10"></div>

                      <button
                        className={`flex items-center text-xs sm:text-base gap-2 px-4 py-2 ${activeTab === "train"
                          ? "text-[#028fa3]"
                          : "bg-white text-gray-600"
                          }`}
                        onClick={() => setActiveTab("train")}
                      >
                        <FontAwesomeIcon icon={faTrain} />
                        Train
                      </button>

                      {/* Bus Tab */}
                      <div className="border-r border-[#028fa3] h-10"></div>

                      <button
                        className={`flex items-center text-xs sm:text-base gap-2 px-4 py-2 ${activeTab === "bus"
                          ? "text-[#028fa3]"
                          : "bg-white text-gray-600"
                          }`}
                        onClick={() => setActiveTab("bus")}
                      >
                        <FontAwesomeIcon icon={faBus} />
                        Bus
                      </button>

                      {/* Car Tab */}
                      <div className="border-r border-[#028fa3] h-10"></div>

                      <button
                        className={`flex items-center text-xs sm:text-base gap-2 px-4 py-2 ${activeTab === "car"
                          ? "text-[#028fa3]"
                          : "bg-white text-gray-600"
                          }`}
                        onClick={() => setActiveTab("car")}
                      >
                        <FontAwesomeIcon icon={faCar} />
                        Car
                      </button>
                    </div>

                    <div>
                      {activeTab === "flight" && (
                        <FlightPolicySection
                          masterData={flightMaster}
                          formData={formData}
                          onFormUpdate={handlePolicyConfigUpdate}
                          travelCategory={TRAVEL_CATEGORIES.FLIGHTS}
                          validator={validator}
                          refs={flightErrorRef}
                          isReadOnly={count === 0 || isGlobalPolicy}
                          mappingDisplay={mappingDisplay}
                          setMappingDisplay={setMappingDisplay}
                          isGlobalPolicy={isGlobalPolicy}
                        />
                      )}
                      {activeTab === "hotel" && (
                        <HotelPolicySection
                          masterData={hotelMaster}
                          formData={formData}
                          onFormUpdate={handlePolicyConfigUpdate}
                          travelCategory={TRAVEL_CATEGORIES.HOTELS}
                          validator={validator}
                          refs={hotelErrorRef}
                          isReadOnly={count === 0 || isGlobalPolicy}
                          mappingDisplay={mappingDisplay}
                          setMappingDisplay={setMappingDisplay}
                          isGlobalPolicy={isGlobalPolicy}
                        />
                      )}
                      {activeTab === "train" && (
                        <TransportPolicySection
                          masterData={trainMaster}
                          formData={formData}
                          onFormUpdate={handlePolicyConfigUpdate}
                          travelCategory={TRAVEL_CATEGORIES.TRAIN || "3"}
                          validator={validator}
                          refs={trainErrorRef}
                          isReadOnly={count === 0 || isGlobalPolicy}
                          mappingDisplay={mappingDisplay}
                          setMappingDisplay={setMappingDisplay}
                          isGlobalPolicy={isGlobalPolicy}
                        />
                      )}
                      {activeTab === "bus" && (
                        <TransportPolicySection
                          masterData={busMaster}
                          formData={formData}
                          onFormUpdate={handlePolicyConfigUpdate}
                          travelCategory={TRAVEL_CATEGORIES.BUS || "4"}
                          validator={validator}
                          refs={busErrorRef}
                          isReadOnly={count === 0 || isGlobalPolicy}
                          mappingDisplay={mappingDisplay}
                          setMappingDisplay={setMappingDisplay}
                          isGlobalPolicy={isGlobalPolicy}
                        />
                      )}
                      {activeTab === "car" && (
                        <TransportPolicySection
                          masterData={carMaster}
                          formData={formData}
                          onFormUpdate={handlePolicyConfigUpdate}
                          travelCategory={TRAVEL_CATEGORIES.CAR || "5"}
                          validator={validator}
                          refs={carErrorRef}
                          isReadOnly={count === 0 || isGlobalPolicy}
                          mappingDisplay={mappingDisplay}
                          setMappingDisplay={setMappingDisplay}
                          isGlobalPolicy={isGlobalPolicy}
                        />
                      )}
                    </div>

                    <div className="flex justify-center gap-3">
                      <button
                        onClick={() => onClose(policy._id)}
                        className="px-4 py-2 text-sm font-medium text-gray-500 border border-gray-300 rounded-lg "
                      >
                        Cancel
                      </button>
                      <button
                        disabled={initialLoading}
                        onClick={() => handleSave(policy._id)}
                        className="px-4 py-2 text-sm font-medium text-white bg-[#028FA3] rounded-lg "
                      >
                        {initialLoading ? (
                          <div className="flex items-center gap-2">
                            <FontAwesomeIcon icon={faSpinner} spin />
                          </div>
                        ) : (
                          "Save"
                        )}
                      </button>
                    </div>
                  </>
                )}
              </div>
            </>
          );
        })
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <Modal
          title="Confirm Deletion"
          onClose={handleCloseDeleteModal}
          actions={
            <>
              <button
                className="bg-gray-500 text-white p-2 px-4 rounded-lg hover:bg-gray-700 transition-colors duration-300"
                onClick={handleCloseDeleteModal}
              >
                Cancel
              </button>
              <button
                className="bg-red-600 text-white p-2 px-4 rounded-lg hover:bg-red-800 transition-colors duration-300"
                onClick={handleDelete}
              >
                Delete
              </button>
            </>
          }
        >
          <p>
            Are you sure you want to delete the selected roles? This action
            cannot be undone.
          </p>
        </Modal>
      )}
    </>
  );
};

export default memo(TravelPolicyList, (prevProps, nextProps) => {
  return (
    prevProps.travelPolicyData.count === nextProps.travelPolicyData.count &&
    JSON.stringify(prevProps.travelPolicyData.travelPolicies) ===
    JSON.stringify(nextProps.travelPolicyData.travelPolicies) &&
    prevProps.expandedPolicyId === nextProps.expandedPolicyId &&
    prevProps.activeTab === nextProps.activeTab
  );
});
