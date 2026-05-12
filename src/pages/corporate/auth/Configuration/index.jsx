import { useState, useEffect, useRef } from "react";
import { useSelector } from "react-redux";
import axios, { fetchAndUpdateUserDetails } from "@/utils/axios/axios";
import Header from "@/components/corporate/auth/Header";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSpinner, faXmark } from "@fortawesome/free-solid-svg-icons";
import Footer2 from "@/components/corporate/footerCorporate/footerCorporate";
import AsyncSelect from "react-select/async";
import config from "@/config";
import Head from "next/head";
import showToast from "@/utils/toast";
import { createAbortController } from "@/utils/common";
import useFormValidator from "@/hooks/useFormValidator";
import style from "./style.module.css";
import CreatableSelect from "react-select/creatable";
import { useUserPermissions } from "@/hooks/useUserPermissions";

export default function Configuration() {
  const { userType } = useUserPermissions();

  // -------------------------------
  // Check if user is super admin
  // -------------------------------
  const isSuperAdmin = userType === 1;

  const userDetails = useSelector((state) => state?.user?.userInfo);
  const companyId = userDetails?.companyId;
  const userId = userDetails?.userId;

  const initialRender = useRef(true);

  // -------------------------------
  // States for wallet configuration
  // -------------------------------
  const [walletConfigs, setWalletConfigs] = useState([]);
  const [currentWalletConfig, setCurrentWalletConfig] = useState("");
  const [selectedWalletEmployees, setSelectedWalletEmployees] = useState([]);
  const [employeeInitialOptions, setEmployeeInitialOptions] = useState([]);
  const [employeeOptionLoading, setEmployeeOptionLoading] = useState(false);
  const [menuOpenedForEmployeeOption, setMenuOpenedForEmployeeOption] =
    useState(false);

  // -------------------------------
  // States for approval configuration
  // -------------------------------
  const [approvalConfigs, setApprovalConfigs] = useState([]);
  const [currentApprovalConfig, setCurrentApprovalConfig] = useState("");
  const [selectedApprovalEmployees, setSelectedApprovalEmployees] = useState(
    []
  );
  const [approvalEmployeeOptions, setApprovalEmployeeOptions] = useState([]);
  const [approvalEmployeeLoading, setApprovalEmployeeLoading] = useState(false);
  const [menuOpenedForApprovalOption, setMenuOpenedForApprovalOption] =
    useState(false);

  const [dynamicConfigs, setDynamicConfigs] = useState({});

  const [hasFetchedData, setHasFetchedData] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const [validationTrigger, setValidationTrigger] = useState(false);

  // -------------------------------
  // Validations
  // -------------------------------
  const customMessages = {
    required: "This field is required.",
    configRequired: "Please select a configuration option.",
    noEmployeesMsg: "Please select at least one employee.",
  };

  const customRules = {
    noEmployees: {
      required: true,
      message: "Please select at least one employee.",
      rule: (value) => {
        return value && Array.isArray(value) && value.length > 0;
      },
    },
    configSelection: {
      required: true,
      message: "Please select a configuration option.",
      rule: (value) => {
        return value && value.trim() !== "";
      },
    },
  };

  const [validator] = useFormValidator(customMessages, customRules);

  // -------------------------------
  // 1) Fetch master data
  // 2) Fetch current config
  // -------------------------------
  useEffect(() => {
    if ( initialRender.current === false) return;

    const fetchMasterData = async () => {
      try {
        const response = await axios.get(
          config.CORPORATE.CONFIGURATION_DYNAMIC_CONTENT
        );
        if (response?.data?.status) {
          const masterData = response.data.data;

          // Extract wallet config
          setWalletConfigs(masterData.WALLET || []);
          // Extract approval config
          setApprovalConfigs(masterData.APPROVAL || []);

          // Dynamic configs: any key that is not walletConfiguration or approvalConfiguration
          const dyn = {};
          Object.entries(masterData).forEach(([key, value]) => {
            if (key !== "WALLET" && key !== "APPROVAL") {
              dyn[key] = {
                configItems: value, // value is an array of configuration options
                current: "",
                selectedEmployees: [],
                employeeOptions: [],
                menuOpened: false,
                loading: false,
              };
            }
          });
          setDynamicConfigs(dyn);
          return dyn;
        }
        return null;
      } catch (error) {
        console.error("Error fetching wallet/approval configs:", error);
      }
    };

    const fetchCurrentConfig = async (dynamicConfigsFromMaster) => {
      try {
        const response = await axios.get(
          `${config.CORPORATE.CONFIGURATION_DETAIL}`
        );
        if (response?.data?.status) {
          const currentData = response?.data?.data;

          // Legacy: Wallet config
          if (currentData?.WALLET) {
            setCurrentWalletConfig(currentData.WALLET.configId);
            if (currentData.WALLET.employeeList?.length > 0) {
              const transformedWallet = currentData.WALLET.employeeList.map(
                (emp) => ({
                  value: emp._id,
                  label: emp.name,
                })
              );
              setSelectedWalletEmployees(transformedWallet);
            }
          }

          // Legacy: Approval config
          if (currentData?.APPROVAL) {
            setCurrentApprovalConfig(currentData.APPROVAL.configId);
            if (currentData.APPROVAL.employeeList?.length > 0) {
              const transformedApproval = currentData.APPROVAL.employeeList.map(
                (emp) => ({
                  value: emp._id,
                  label: emp.name,
                })
              );
              setSelectedApprovalEmployees(transformedApproval);
            }
          }

          if (dynamicConfigsFromMaster) {
            const merged = { ...dynamicConfigsFromMaster };

            // Dynamic: any keys other than WALLET and APPROVAL
            Object.entries(currentData).forEach(([key, value]) => {
              const upperKey = key.toUpperCase();
              if (
                upperKey !== "WALLET" &&
                upperKey !== "APPROVAL" &&
                merged[upperKey]
              ) {
                if (upperKey === "SUPER_ADMIN_NOTIFICATIONS") {
                  // Handle super admin notifications - it comes as config object
                  merged[upperKey] = {
                    ...merged[upperKey],
                    current: value.configId || "DISABLED",
                    selectedEmployees: [],
                  };
                } else {
                  merged[upperKey] = {
                    ...merged[upperKey],
                    current: value.configId,
                    selectedEmployees: (value.employeeList || []).map(
                      (emp) => ({
                        value: emp._id,
                        label: emp.name,
                      })
                    ),
                  };
                }
              }
            });
            setDynamicConfigs(merged);
          }
        }
      } catch (error) {
        console.error("Error fetching current config:", error);
      }
    };

    const fetchAllData = async () => {
      setIsLoading(true);
      try {
        // Get master data first, then use it for current config
        const dynamicConfigsFromMaster = await fetchMasterData();
        await fetchCurrentConfig(dynamicConfigsFromMaster);
        setHasFetchedData(true);
      } finally {
        setIsLoading(false);
      }
    };

    initialRender.current = false;
    fetchAllData();
  }, []);

  // -------------------------------
  // Handle changes for wallet config radio
  // -------------------------------
  const handleWalletOptionChange = (code) => {
    setCurrentWalletConfig(code);
    if (code !== "SPEC_EMP") {
      setSelectedWalletEmployees([]);
    }
  };

  // -------------------------------
  // Handle changes for approval config radio
  // -------------------------------
  const handleApprovalOptionChange = (code) => {
    setCurrentApprovalConfig(code);
    if (code !== "SPEC_EMP") {
      setSelectedApprovalEmployees([]);
    }
  };

  // -------------------------------
  // Handlers for dynamic configuration options
  // -------------------------------
  const handleDynamicOptionChange = (configType, code) => {
    setDynamicConfigs((prev) => ({
      ...prev,
      [configType]: { ...prev[configType], current: code },
    }));
  };

  const handleDynamicEmployeeSelection = (configType, selected) => {
    setDynamicConfigs((prev) => ({
      ...prev,
      [configType]: { ...prev[configType], selectedEmployees: selected || [] },
    }));
  };

  // -------------------------------
  // Handle super admin notification toggle (special case)
  // -------------------------------
  const handleSuperAdminToggle = () => {
    const currentValue =
      dynamicConfigs["SUPER_ADMIN_NOTIFICATIONS"]?.current || "DISABLED";
    const newValue = currentValue === "ENABLED" ? "DISABLED" : "ENABLED";
    handleDynamicOptionChange("SUPER_ADMIN_NOTIFICATIONS", newValue);
  };

  // -------------------------------
  // Generic fetch employees
  // -------------------------------
  const fetchDropdownData = async (searchKey = "") => {
    try {
      const payload = {
        // companyId,
        filter: [],
        searchKey,
        pageNo: 1,
        pageSize: 10,
      };
      const signal = createAbortController();
      const response = await axios.post(
        config.CORPORATE.EMPLOYEE_LIST,
        payload,
        {
          signal: signal,
        }
      );
      if (response.data?.status === "SUCCESS") {
        return response?.data?.data?.users?.map((traveler) => ({
          value: traveler._id,
          label: `${traveler.firstName || ""} ${traveler.lastName || ""}`,
        }));
      } else {
        showToast("error", `Failed to fetch employees`);
        return [];
      }
    } catch (error) {
      console.error(`Error fetching employees:`, error);
      showToast("error", "Error fetching data. Try again later.");
      return [];
    }
  };

  // -------------------------------
  // For wallet employees
  // -------------------------------
  const handleDropdownOpen = async () => {
    if (!menuOpenedForEmployeeOption) {
      setEmployeeOptionLoading(true);
      setMenuOpenedForEmployeeOption(true);
      if (employeeInitialOptions.length === 0) {
        const data = await fetchDropdownData();
        setEmployeeInitialOptions(data);
      }
      setEmployeeOptionLoading(false);
    }
  };

  const loadDropdownOptions = async (inputValue) => {
    return await fetchDropdownData(inputValue);
  };

  // -------------------------------
  // For approval employees
  // -------------------------------
  const handleApprovalDropdownOpen = async () => {
    if (!menuOpenedForApprovalOption) {
      setApprovalEmployeeLoading(true);
      setMenuOpenedForApprovalOption(true);
      if (approvalEmployeeOptions.length === 0) {
        const data = await fetchDropdownData();
        setApprovalEmployeeOptions(data);
      }
      setApprovalEmployeeLoading(false);
    }
  };

  const loadApprovalDropdownOptions = async (inputValue) => {
    return await fetchDropdownData(inputValue);
  };

  // Dynamic dropdown handlers per config type
  const handleDynamicDropdownOpen = async (configType) => {
    setDynamicConfigs((prev) => ({
      ...prev,
      [configType]: {
        ...prev[configType],
        menuOpened: true,
      },
    }));
    if (
      !dynamicConfigs[configType]?.employeeOptions ||
      dynamicConfigs[configType].employeeOptions.length === 0
    ) {
      setDynamicConfigs((prev) => ({
        ...prev,
        [configType]: { ...prev[configType], loading: true },
      }));
      const data = await fetchDropdownData();
      setDynamicConfigs((prev) => ({
        ...prev,
        [configType]: {
          ...prev[configType],
          employeeOptions: data,
          loading: false,
        },
      }));
    }
  };

  const loadDynamicDropdownOptions = async (inputValue, configType) => {
    return await fetchDropdownData(inputValue);
  };

  const removeDynamicEmployee = (configType, employeeId) => {
    setDynamicConfigs((prev) => ({
      ...prev,
      [configType]: {
        ...prev[configType],
        selectedEmployees: prev[configType].selectedEmployees.filter(
          (e) => e.value !== employeeId
        ),
      },
    }));
  };

  // -------------------------------
  // Save Final
  // -------------------------------
  const handleSave = async () => {
    // Validate
    if (!currentWalletConfig) {
      validator.showMessages();
      setValidationTrigger((prev) => !prev);
      return;
    }

    // 1) If user picked SPEC_EMP for wallet but no employees => show error
    if (
      currentWalletConfig === "SPEC_EMP" &&
      selectedWalletEmployees.length === 0
    ) {
      validator.showMessages();
      setValidationTrigger((prev) => !prev);
      return;
    }

    // 2) If user picked SPEC_EMP for approval but no employees => show error
    if (
      currentApprovalConfig === "SPEC_EMP" &&
      selectedApprovalEmployees.length === 0
    ) {
      validator.showMessages();
      setValidationTrigger((prev) => !prev);
      return;
    }

    // Validate dynamic configs:
    for (const [key, dynConfig] of Object.entries(dynamicConfigs)) {
      // Skip validation for SUPER_ADMIN_NOTIFICATIONS as it's just a toggle
      if (key === "SUPER_ADMIN_NOTIFICATIONS") {
        continue;
      }

      if (!dynConfig.current || dynConfig.current.trim() === "") {
        validator.showMessages();
        setValidationTrigger((prev) => !prev);
        return;
      }
      if (
        dynConfig.current === "SPEC_EMP" &&
        (!dynConfig.selectedEmployees ||
          dynConfig.selectedEmployees.length === 0)
      ) {
        validator.showMessages();
        setValidationTrigger((prev) => !prev);
        return;
      }
    }

    setIsLoading(true);
    try {
      // Build your final payload
      const payload = {
        // companyId,
        walletConfiguration: {
          code: currentWalletConfig,
          employeeList:
            currentWalletConfig === "SPEC_EMP"
              ? selectedWalletEmployees.map((e) => e.value)
              : [],
          status: "Active",
        },
        approvalConfiguration: {
          code: currentApprovalConfig,
          employeeList:
            currentApprovalConfig === "SPEC_EMP"
              ? selectedApprovalEmployees.map((e) => e.value)
              : [],
          status: "Active",
        },
        dynamicConfigurations: {},
      };

      Object.entries(dynamicConfigs).forEach(([configType, dynConfig]) => {
        payload.dynamicConfigurations[configType] = {
          code: dynConfig.current,
          employeeList:
            dynConfig.current === "SPEC_EMP"
              ? (dynConfig.selectedEmployees || []).map((e) => e.value)
              : [],
          status: "Active",
        };
      });

      const response = await axios.post(
        config.CORPORATE.CONFIGURATION_SAVE,
        payload
      );
      if (response?.data?.status) {
        validator.hideMessages();
        showToast("success", "Configuration saved successfully!");

        // Refresh user details if needed
        await fetchAndUpdateUserDetails(userId);
      } else {
        showToast("error", "Failed to save configuration.");
      }
    } catch (error) {
      console.error("Error saving configuration:", error);
      showToast("error", "Failed to save configuration.");
    } finally {
      setIsLoading(false);
    }
  };

  const customStyles = {
    control: (base, state) => ({
      ...base,
      backgroundColor: "#f6f6f6",
      borderColor: state.isFocused ? "#028fa3" : "#d9d9d9",
      boxShadow: state.isFocused ? "0 0 0 1px #028fa3" : "none",
      "&:hover": {
        borderColor: "#028fa3",
      },
      borderRadius: "8px",
      padding: "4px",
       cursor: "pointer",
    }),
    placeholder: (base) => ({
      ...base,
      color: "#828282",
      fontSize: "14px",
      cursor: "pointer",
    }),
    menu: (base) => ({
      ...base,
      backgroundColor: "white",
      borderRadius: "8px",
      marginTop: "4px",
      boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
    }),
    menuList: (base) => ({
      ...base,
      padding: "8px",
      cursor: "pointer",
    }),
    option: (base, state) => ({
      ...base,
      backgroundColor: state.isFocused ? "#028fa380" : "white",
      color: state.isFocused ? "white" : "#333",
      borderRadius: "4px",
       cursor: "pointer",
      padding: "8px 12px",
      "&:active": {
        backgroundColor: "#028fa3",
        color: "white",
       
      },
    }),
    multiValue: (base) => ({
      ...base,
      backgroundColor: "#028fa3",
      color: "white",
      borderRadius: "4px",
      padding: "2px 6px",
       cursor: "pointer",
    }),
    multiValueLabel: (base) => ({
      ...base,
      color: "white",
    }),
    multiValueRemove: (base) => ({
      ...base,
      color: "white",
      "&:hover": {
        backgroundColor: "#028fa3",
        color: "#ff6b6b",
      },
    }),
  };

  const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  return (
    <>
      <div className="shadow-[0_4px_6px_-1px_rgba(0,0,0,0.1),0_2px_4px_-1px_rgba(0,0,0,0.06)]">
        <Header />
        <Head>
          <title>Manage Configurations</title>
        </Head>
      </div>

      {isLoading && !hasFetchedData ? (
        <div className="flex flex-col items-center justify-center min-h-screen">
          <FontAwesomeIcon
            icon={faSpinner}
            spin
            className="text-[#028fa3] text-4xl"
          />
        </div>
      ) : (
        <div className={`bg-gray-100 ${style.companyMob}`}>
          <h2 className="text-2xl font-bold mb-1">Configuration</h2>
          <p className="text-gray-600 mb-6">
            Tailor the application to your needs
          </p>

          <div className="bg-white rounded-lg shadow-md p-8 w-full mx-auto">
            {/* -------- WALLET CONFIG SECTION -------- */}
            <div className="w-full mb-4 border-b border-gray-300 pb-4">
              <h2 className="text-lg text-[#028fa3] font-bold mb-4">
                Wallet Access Configuration
              </h2>

              <div className="mb-6">
                {walletConfigs.map((config) => (
                  <label
                    key={config._id}
                    className="flex items-center mb-2 cursor-pointer"
                  >
                    <input
                      type="radio"
                      name="walletAccess"
                      value={config.code}
                      checked={currentWalletConfig === config.code}
                      onChange={() => handleWalletOptionChange(config.code)}
                      className="mr-2"
                    />
                    <div className="flex flex-col">
                      <span className="text-gray-700 font-semibold">
                        {config.configName}
                      </span>
                      {config.configDesc && (
                        <span className="text-gray-700 text-sm">
                          {config.configDesc}
                        </span>
                      )}
                    </div>
                  </label>
                ))}
                <div className="text-red-500 text-xs mt-1">
                  {validator.message(
                    "walletAccess",
                    currentWalletConfig,
                    "required|configSelection"
                  )}
                </div>
              </div>

              {/* Employee Search Dropdown if SPEC_EMP */}
              {currentWalletConfig === "SPEC_EMP" && (
                <div className="w-64 mb-4">
                  <AsyncSelect
                    isMulti
                    cacheOptions
                    defaultOptions={
                      menuOpenedForEmployeeOption ? employeeInitialOptions : []
                    }
                    loadOptions={loadDropdownOptions}
                    onMenuOpen={handleDropdownOpen}
                    onChange={(selected) =>
                      setSelectedWalletEmployees(selected || [])
                    }
                    value={selectedWalletEmployees}
                    isLoading={employeeOptionLoading}
                    placeholder="Search employee by name"
                    classNamePrefix="react-select"
                    styles={customStyles}
                  />
                  <div className="text-red-500 text-xs mt-1">
                    {currentWalletConfig === "SPEC_EMP" &&
                      selectedWalletEmployees.length === 0 &&
                      validator.message(
                        "noEmployeesWallet",
                        selectedWalletEmployees,
                        "noEmployees"
                      )}
                  </div>
                </div>
              )}

              {/* Show selected employees for wallet */}
              {currentWalletConfig === "SPEC_EMP" &&
                selectedWalletEmployees.length > 0 && (
                  <div className="mt-4 p-2 border border-gray-200 rounded-lg bg-gray-50">
                    <h3 className="text-sm font-semibold text-gray-700">
                      Selected Employees:
                    </h3>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {selectedWalletEmployees.map((employee) => (
                        <span
                          key={employee.value}
                          className="flex items-center gap-2 px-3 py-1 bg-[#028fa350] rounded-full text-sm text-gray-800"
                        >
                          {employee.label}
                          <FontAwesomeIcon
                            icon={faXmark}
                            className="text-red-500 cursor-pointer hover:text-red-700"
                            onClick={() =>
                              setSelectedWalletEmployees((prev) =>
                                prev.filter((e) => e.value !== employee.value)
                              )
                            }
                          />
                        </span>
                      ))}
                    </div>
                  </div>
                )}
            </div>

            {/* -------- APPROVAL CONFIG SECTION -------- */}
            <div className="mb-6 border-b border-gray-300 pb-4">
              <h3 className="text-lg text-[#028fa3] font-bold mb-4">
                Manage Approvals
              </h3>

              <div className="mb-4">
                {approvalConfigs.map((conf) => (
                  <label
                    key={conf._id}
                    className="flex items-center mb-2 cursor-pointer"
                  >
                    <input
                      type="radio"
                      name="approvalAccess"
                      value={conf.code}
                      checked={currentApprovalConfig === conf.code}
                      onChange={() => handleApprovalOptionChange(conf.code)}
                      className="mr-2"
                    />
                    <div className="flex flex-col">
                      <span className="text-gray-700 font-semibold">
                        {conf.configName}
                      </span>
                      {conf.configDesc && (
                        <span className="text-gray-700 text-sm">
                          {conf.configDesc}
                        </span>
                      )}
                    </div>
                  </label>
                ))}

                <div className="text-red-500 text-xs mt-1">
                  {validator.message(
                    "approvalAccess",
                    currentApprovalConfig,
                    "required|configSelection"
                  )}
                </div>
              </div>

              {/* If "SPEC_EMP" => show employees */}
              {currentApprovalConfig === "SPEC_EMP" && (
                <div className="w-64 mb-4">
                  <AsyncSelect
                    isMulti
                    cacheOptions
                    defaultOptions={
                      menuOpenedForApprovalOption ? approvalEmployeeOptions : []
                    }
                    loadOptions={loadApprovalDropdownOptions}
                    onMenuOpen={handleApprovalDropdownOpen}
                    onChange={(selected) =>
                      setSelectedApprovalEmployees(selected || [])
                    }
                    value={selectedApprovalEmployees}
                    isLoading={approvalEmployeeLoading}
                    placeholder="Search employee by name"
                    classNamePrefix="react-select"
                    styles={customStyles}
                  />
                  <div className="text-red-500 text-xs mt-1">
                    {currentApprovalConfig === "SPEC_EMP" &&
                      selectedApprovalEmployees.length === 0 &&
                      validator.message(
                        "noEmployeesApproval",
                        selectedApprovalEmployees,
                        "noEmployees"
                      )}
                  </div>
                </div>
              )}

              {currentApprovalConfig === "SPEC_EMP" &&
                selectedApprovalEmployees.length > 0 && (
                  <div className="mt-4 p-2 border border-gray-200 rounded-lg bg-gray-50">
                    <h3 className="text-sm font-medium text-gray-700">
                      Selected Employees:
                    </h3>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {selectedApprovalEmployees.map((employee) => (
                        <span
                          key={employee.value}
                          className="flex items-center gap-2 px-3 py-1 bg-[#028fa350] rounded-full text-sm text-gray-800"
                        >
                          {employee.label}
                          <FontAwesomeIcon
                            icon={faXmark}
                            className="text-red-500 cursor-pointer hover:text-red-700"
                            onClick={() =>
                              setSelectedApprovalEmployees((prev) =>
                                prev.filter((e) => e.value !== employee.value)
                              )
                            }
                          />
                        </span>
                      ))}
                    </div>
                  </div>
                )}
            </div>

            {/* ----- Dynamic Configurations ----- */}
            {Object.entries(dynamicConfigs).map(([key, dynConfig]) => {
              // Special handling for SUPER_ADMIN_NOTIFICATIONS - show as toggle only for super admin
              if (
                key === "SUPER_ADMIN_NOTIFICATIONS" &&
                isSuperAdmin &&
                dynConfig.configItems?.length > 0
              ) {
                const isEnabled = dynConfig.current === "ENABLED";
                return (
                  <div key={key} className="mb-6 border-b border-gray-300 pb-4">
                    <h3 className="text-lg text-[#028fa3] font-bold mb-4">
                      Super Admin Notifications
                    </h3>
                    <div className="flex items-center justify-between">
                      <div className="flex flex-col">
                        <span className="text-gray-700 font-semibold">
                          Notify for All Approvers
                        </span>
                        <span className="text-gray-700 text-sm">
                          Do you want to get notified for all the approvers
                          activity?
                        </span>
                      </div>
                      <div className="flex items-center">
                        <label className="inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={isEnabled}
                            onChange={handleSuperAdminToggle}
                            className="sr-only"
                          />
                          <div
                            className={`relative w-11 h-6 rounded-full transition-colors duration-200 ease-in-out ${
                              isEnabled ? "bg-[#028fa3]" : "bg-gray-300"
                            }`}
                          >
                            <div
                              className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-md transform transition-transform duration-200 ease-in-out ${
                                isEnabled ? "translate-x-5" : "translate-x-0"
                              }`}
                            />
                          </div>
                          <span className="ml-3 text-gray-700">
                            {isEnabled ? "Enabled" : "Disabled"}
                          </span>
                        </label>
                      </div>
                    </div>
                  </div>
                );
              }

              // Don't show SUPER_ADMIN_NOTIFICATIONS for non-super admins
              if (key === "SUPER_ADMIN_NOTIFICATIONS") {
                return null;
              }

              // Regular configuration handling for other configs
              return (
                <div key={key} className="mb-6 border-b border-gray-300 pb-4">
                  <h3 className="text-lg text-[#028fa3] font-bold mb-4">
                    {key === "EMAIL_INVOICING" ? "Manage Email Invoicing" : key}
                  </h3>
                  {dynConfig.configItems &&
                    dynConfig.configItems.map((item) => (
                      <label
                        key={item._id}
                        className="flex items-center mb-2 cursor-pointer"
                      >
                        <input
                          type="radio"
                          name={key}
                          value={item.code}
                          checked={dynConfig.current === item.code}
                          onChange={() =>
                            handleDynamicOptionChange(key, item.code)
                          }
                          className="mr-2"
                        />
                        <div className="flex flex-col">
                          <span className="text-gray-700 font-semibold">
                            {item.configName}
                          </span>
                          {item.code !== "SPEC_EMP" && item.configDesc && (
                            <span className="text-gray-700 text-sm">
                              {item.configDesc}
                            </span>
                          )}
                        </div>
                      </label>
                    ))}
                  <div className="text-red-500 text-xs mt-1">
                    {validator.message(
                      key,
                      dynConfig.current,
                      "required|configSelection"
                    )}
                  </div>
                  {dynConfig.current === "SPEC_EMP" && (
                    <>
                      <div className="w-64 mb-4">
                        <CreatableSelect
                          isMulti
                          cacheOptions
                          defaultOptions={
                            dynConfig.menuOpened
                              ? dynConfig.employeeOptions
                              : []
                          }
                          options={
                            dynConfig.menuOpened
                              ? dynConfig.employeeOptions
                              : []
                          }
                          loadOptions={(inputValue) =>
                            loadDynamicDropdownOptions(inputValue, key)
                          }
                          onMenuOpen={() => handleDynamicDropdownOpen(key)}
                          onChange={(selected) =>
                            handleDynamicEmployeeSelection(key, selected)
                          }
                          value={dynConfig.selectedEmployees || []}
                          isLoading={dynConfig.loading}
                          placeholder="Search employee by name"
                          classNamePrefix="react-select"
                          styles={customStyles}
                          formatCreateLabel={(inputValue) =>
                            isValidEmail(inputValue)
                              ? `Add "${inputValue}"`
                              : "Please enter a valid email"
                          }
                          isValidNewOption={(inputValue) =>
                            isValidEmail(inputValue)
                          }
                          createOptionPosition="first"
                          onCreateOption={(inputValue) => {
                            if (isValidEmail(inputValue)) {
                              const currentSelected =
                                dynConfig.selectedEmployees || [];
                              if (
                                currentSelected.some(
                                  (option) =>
                                    option.value.toLowerCase() ===
                                    inputValue.toLowerCase()
                                )
                              ) {
                                showToast(
                                  "success",
                                  "This email is already added."
                                );
                                return;
                              }

                              const newOption = {
                                value: inputValue,
                                label: inputValue,
                                __isNew__: true,
                              };
                              handleDynamicEmployeeSelection(key, [
                                ...(dynConfig.selectedEmployees || []),
                                newOption,
                              ]);
                            }
                          }}
                        />
                        <div className="text-red-500 text-xs mt-1">
                          {dynConfig.current === "SPEC_EMP" &&
                            (!dynConfig.selectedEmployees ||
                              dynConfig.selectedEmployees.length === 0) &&
                            validator.message(
                              `noEmployees${key}`,
                              dynConfig.selectedEmployees,
                              "noEmployees"
                            )}
                        </div>
                      </div>
                      {/* Display selected employees */}
                      {dynConfig.selectedEmployees &&
                        dynConfig.selectedEmployees.length > 0 && (
                          <div className="mt-4 p-2 border border-gray-200 rounded-lg bg-gray-50">
                            <h3 className="text-sm font-semibold text-gray-700">
                              Selected Employees:
                            </h3>
                            <div className="flex flex-wrap gap-2 mt-2">
                              {dynConfig.selectedEmployees.map((employee) => (
                                <span
                                  key={employee.value}
                                  className="flex items-center gap-2 px-3 py-1 bg-[#028fa350] rounded-full text-sm text-gray-800"
                                >
                                  {employee.label}
                                  <FontAwesomeIcon
                                    icon={faXmark}
                                    className="text-red-500 cursor-pointer hover:text-red-700"
                                    onClick={() =>
                                      removeDynamicEmployee(key, employee.value)
                                    }
                                  />
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                    </>
                  )}
                </div>
              );
            })}

            {/* ------ Save Button ------ */}
            <div className="mt-4">
              <button
                onClick={handleSave}
                disabled={isLoading}
                className="bg-[#028fa3] text-white px-6 py-2 rounded-lg shadow-md hover:bg-[#027085] focus:outline-none disabled:opacity-50"
              >
                {isLoading ? (
                  <>
                    <FontAwesomeIcon
                      icon={faSpinner}
                      spin
                      className="text-white mr-2"
                    />
                    Saving...
                  </>
                ) : (
                  "Save Configuration"
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <div>
        <Footer2 />
      </div>
    </>
  );
}
