import { useCallback, useMemo, useRef } from "react";
import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { useRouter } from "next/router";
import style from "./styles.module.css";
import Header from "@/components/corporate/auth/Header";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSpinner } from "@fortawesome/free-solid-svg-icons";
import "tailwindcss/tailwind.css";
import BulkUpload from "@/components/corporate/bulk/BulkUpload";
import Travelpolicy from "@/components/corporate/TravelPolicy/travelPolicy";
import Addtravel from "@/components/corporate/TravelPolicy/addtravel/Addtravel";
// import AddDesignation from "@/components/corporate/Designation/AddDesignation";
import RoleList from "@/components/corporate/Company/Roles/RoleList";
import RoleAdd from "@/components/corporate/Company/Roles/RoleAdd";
import LevelList from "@/components/corporate/Company/Levels/LevelList";
import DesignationList from "@/components/corporate/Company/Designations/DesignationList";
import BandList from "@/components/corporate/Company/Bands/BandList";
import TravelPolicyList from "@/components/corporate/Company/TravelPolicy/List";
import Travelpolicy1 from "@/components/corporate/travelpoilcyN/travelpolicy";
import ComingSoon from "@/components/corporate/comingSoon";
import axios from "@/utils/axios/axios";
import config from "@/config";
import showToast from "@/utils/toast";
import useFormValidator from "@/hooks/useFormValidator";
import ProtectedRoute from "@/components/corporate/protectedRoute/ProtectedRoute";
import Footer1 from "@/components/corporate/footerCorporate/footerCorporate";
import { useUserPermissions } from "@/hooks/useUserPermissions";
import Head from "next/head";
import DepartmentList from "@/components/corporate/Company/Departments/List";
import EmployeeList from "@/components/corporate/Company/Employees/List";
import RenderButtons from "@/components/corporate/Company/RenderButtons";
import TabNavigation from "@/components/corporate/Company/TabNavigation";
import OrganizationModal from "@/components/corporate/Company/OrganizationModal";

export default function Company() {
  const userDetails = useSelector((state) => state?.user?.userInfo);
  const companyId = useMemo(
    () => userDetails?.companyId,
    [userDetails?.companyId]
  );

  const router = useRouter();
  const { userType } = useUserPermissions();

  const [activeTab, setActiveTab] = useState(1);
  const [isModalVisible, setModalVisible] = useState(false);
  const [isEmpModalVisible, setEmpModalVisible] = useState(false);
  const [isBulkModalVisible, setBulkModalVisible] = useState(false);
  const [isRoleModalVisible, setRoleModalVisible] = useState(false);
  const [isLevelModalVisible, setIsLevelModalVisible] = useState(false);
  const [isTravelModalVisible, setIsTravelModalVisible] = useState(false);
  const [departments, setDepartments] = useState({});
  const [
    selectedEmployeeFilterDepartments,
    setSelectedEmployeeFilterDepartments,
  ] = useState([]);
  const [employees, setEmployees] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [roles, setRoles] = useState([]);
  const [levels, setLevels] = useState([]);
  const [designations, setDesignations] = useState([]);
  const [bands, setBands] = useState([]);
  const [travelPolicies, setTravelPolicies] = useState([]);

  const [shouldFetch, setShouldFetch] = useState(true);
  const [isDesignationModalVisible, setIsDesignationModalVisible] =
    useState(false);
  const [isBandsModalVisible, setIsBandsModalVisible] = useState(false);

  const [editingRole, setEditingRole] = useState(null);
  const [editingLevel, setEditingLevel] = useState(null);
  const [editingDesignation, setEditingDesignation] = useState(null);
  const [editingBand, setEditingBand] = useState(null);

  const [expandedPolicyId, setExpandedPolicyId] = useState(null);

  const customMessages = {
    required: "This field is required.",
  };

  const customRules = {
    myCustomRule: {
      message: "The :attribute must start with a letter.",
      rule: (val, params, validator) =>
        validator.helpers.testRegex(val, /^[a-zA-Z].*$/),
      required: true,
    },
  };

  const [validator, updateValidator] = useFormValidator(
    customMessages,
    customRules
  );

  const updateRules = (type) => {
    let customRules = {};
    let customMessages = {};
    if (type === 1) {
      customMessages = {
        required: "This field is required.",
      };
    } else if (type === 2) {
      customMessages = {
        required: "This field is required.",
        validMobile: "Invalid or incomplete mobile number.",
        validEmail: "Invalid email format.",
      };

      customRules = {
        validMobile: {
          // Define the custom validation function for a valid mobile number.
          message: "Invalid or incomplete mobile number.",
          rule: (val, params, validator) => {
            // The regular expression to match a 10-digit mobile number.
            const regex = /^[6789]\d{9}$/;
            return regex.test(val);
          },
        },
        validEmail: {
          message: "Invalid email format.",
          rule: (val, params, validator) => {
            const regex =
              /^[a-zA-Z0-9]+((\.[a-zA-Z0-9]+)|(_[a-zA-Z0-9]+)|(-[a-zA-Z0-9]+)|(\+[a-zA-Z0-9]+))*@[a-zA-Z0-9-]+(\.[a-zA-Z]{2,})+$/;
            return regex.test(val);
          },
        },
        validEmployeeID: {
          message:
            "Employee ID must be 2 to 15 characters long and can contain alphanumeric and special characters.",
          rule: (val, params, validator) => {
            const regex =
              /^[a-zA-Z0-9!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?`~]{2,15}$/;
            return regex.test(val);
          },
        },
        validPassportNumber: {
          message: "Passport Number does not match the format",
          rule: (val, params, validator) => {
            const regex = /^[A-Za-z0-9]{3,30}$/;
            return regex.test(val);
          },
        },
        validExpiryDate: {
          message: "Date should be greater than today's date.",
          rule: (val, params, validator) => {
            const issueDate = new Date(val);
            const today = new Date();
            return issueDate > today;
          },
        },
        validIssueDate: {
          message: "Date should not be greater than today's date.",
          rule: (val, params, validator) => {
            const issueDate = new Date(val);
            const today = new Date();
            return issueDate <= today;
          },
        },
        dobValidation: {
          message:
            "Date of birth should indicate an age greater than 12 years.",
          rule: (val, params, validator) => {
            const selectedDate = new Date(val);
            const currentDate = new Date();

            // Calculate the date 12 years ago
            const minDate = new Date(
              currentDate.getFullYear() - 12,
              currentDate.getMonth(),
              currentDate.getDate()
            );

            return selectedDate <= minDate;
          },
        },
      };
    }
    updateValidator(customMessages, customRules);
  };

  useEffect(() => {
    updateRules(activeTab);
  }, [activeTab]);

  useEffect(() => {
    if (isModalVisible) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }

    // Clean up on component unmount
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [isModalVisible]);

  useEffect(() => {
    if (
      isRoleModalVisible ||
      isLevelModalVisible ||
      isDesignationModalVisible ||
      isBandsModalVisible
    ) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }

    // Clean up on component unmount
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [
    isRoleModalVisible,
    isLevelModalVisible,
    isDesignationModalVisible,
    isBandsModalVisible,
  ]);

  const handleOpenDepartment = () => {
    setModalVisible(true);
  };

  const handleOpenEmpDepartment = () => {
    setEmpModalVisible(true);
  };

  const handleOpenBulkDepartment = () => {
    setBulkModalVisible(true);
  };

  const handleCloseRoles = () => {
    setRoleModalVisible(false);
  };

  const handleOpenRoles = () => {
    setEditingRole(null);
    setRoleModalVisible(true);
  };

  const handleEditRole = (role) => {
    setEditingRole(role); // Set the role to be edited
    setRoleModalVisible(true);
  };

  const handleEditLevel = (level) => {
    setEditingLevel(level);
    setIsLevelModalVisible(true);
  };

  const handleEditDesignation = (designation) => {
    setEditingDesignation(designation);
    setIsDesignationModalVisible(true);
  };

  const handleEditBand = (band) => {
    setEditingBand(band);
    setIsBandsModalVisible(true);
  };

  const handleOpenLevels = () => {
    setEditingLevel(null);
    setIsLevelModalVisible(true);
  };

  // Function to close the modal
  const handleCloselevels = () => {
    setIsLevelModalVisible(false);
  };

  const handleCloseBulkDepartment = () => {
    setBulkModalVisible(false);
  };

  const handleOpenTravel = () => {
    const tempPolicy = {
      _id: `temp-${Date.now()}`, // Temporary unique ID
      travelPolicyName: "",
      status: "draft",
      isTemporary: true,
    };
    setTravelPolicies((prev) => ({
      ...prev,
      travelPolicies: [tempPolicy, ...prev.travelPolicies],
      count: prev.count + 1,
    }));
    setExpandedPolicyId(tempPolicy._id);

    setIsTravelModalVisible(true);
  };

  const handleCloseTravel = (policyId) => {
    const policy = travelPolicies.travelPolicies.find(
      (p) => p._id === policyId
    );
    if (policy.isTemporary) {
      // Remove temporary policy
      setTravelPolicies((prev) => ({
        ...prev,
        travelPolicies: prev.travelPolicies.filter((p) => p._id !== policyId),
        count: prev.count - 1,
      }));
      if (expandedPolicyId === policyId) {
        setExpandedPolicyId(null);
      }
    } else {
      // For existing policies, collapse the form
      if (expandedPolicyId === policyId) {
        setExpandedPolicyId(null);
      }
    }
    setIsTravelModalVisible(false);
  };

  const handleOpenDesignation = () => {
    setEditingDesignation(null);
    setIsDesignationModalVisible(true);
  };

  // Function to close the Designation modal
  const handleCloseDesignation = () => {
    setIsDesignationModalVisible(false);
  };

  const handleOpenBands = () => {
    setEditingBand(null);
    setIsBandsModalVisible(true);
  };

  // Function to close the Bands modal
  const handleCloseBands = () => {
    setIsBandsModalVisible(false);
  };

  const fetchDepartments = useCallback(
    async (searchQuery = "") => {
      // const { companyId } = userDetails;
      const signal = abortControllerRef.current.signal;
      try {
        let response = await axios.get(
          // `${config.CORPORATE.DEPARTMENT_LIST}?companyId=${companyId}&departmentName=${searchQuery}`,
           `${config.CORPORATE.DEPARTMENT_LIST}?departmentName=${searchQuery}`,
          { signal }
        );
        if (response.data.status === "SUCCESS") {
          const { count, departments } = response.data.data;

          if (searchQuery) {
            // Update only departments if there's a search query
            setDepartments((prev) => ({
              ...prev,
              departments,
            }));
          } else {
            // Update both departments and count if there's no search query
            setDepartments({ count, departments });
          }
        }
      } catch (error) {
        console.log("Error fetching departments:", error);
      }
    },
    [companyId]
  );

  const abortControllerRef = useRef(null);
  const fetchDataPerSection = useCallback(
    async (
      tab,
      searchQuery = "",
      selectedFilters = [],
      additionalFilters = {},
      paginationData = {}
    ) => {
      setIsLoading(true);
      try {
        // const { companyId } = userDetails;
        let response;
        let payload;

        // Cancel previous request if it exists
        if (abortControllerRef.current) {
          abortControllerRef.current.abort();
        }

        // Create new AbortController
        abortControllerRef.current = new AbortController();
        const signal = abortControllerRef.current.signal;

        switch (tab) {
          case 1: // Fetch departments
            await fetchDepartments(searchQuery);
            break;

          case 2: // Fetch employees
            payload = {
              // companyId,
              searchKey: searchQuery,
              filter: selectedFilters,
              pageNo: paginationData?.pageNo ?? 1,
              pageSize: paginationData?.pageSize ?? 10,
              sortBy: "id",
            };
            if (additionalFilters.status) {
              payload.status = additionalFilters.status;
            }
            if (additionalFilters?.roleId?.length > 0) {
              payload.roleId = additionalFilters.roleId;
            }
            if (additionalFilters?.levelId?.length > 0) {
              payload.levelId = additionalFilters.levelId;
            }
            if (additionalFilters?.bandId?.length > 0) {
              payload.bandId = additionalFilters.bandId;
            }
            if (additionalFilters?.designationId?.length > 0) {
              payload.designationId = additionalFilters.designationId;
            }
            response = await axios.post(
              `${config.CORPORATE.EMPLOYEE_LIST}`,
              payload,
              { signal }
            );
            if (response.data.status === "SUCCESS") {
              const { count, users } = response.data.data;
              const hasActiveFilters = selectedFilters.some(
                (filter) => filter.values.length > 0 || filter.type.length > 0
              );
              const hasAdditionalFilters = Object.keys(additionalFilters).some(
                (key) => additionalFilters[key]
              );
              if (searchQuery || hasActiveFilters || hasAdditionalFilters) {
                // Update only employees if there's a search query
                setEmployees((prev) => ({
                  ...prev,
                  users,
                  paginationCount: count,
                }));
              } else {
                // Update both employees and count if there's no search query
                setEmployees({ count, users, paginationCount: count });
              }
            }
            break;

          case 3: // Fetch roles
            payload = {
              // companyId,
              searchKey: searchQuery,
              sortBy: null,
            };
            response = await axios.post(
              `${config.CORPORATE.ROLE_LIST}`,
              payload,
              {
                signal,
              }
            );
            if (response.data.status === "SUCCESS") {
              const { userRoles, count } = response.data.data;
              if (searchQuery) {
                setRoles((prev) => ({
                  ...prev,
                  userRoles,
                }));
              } else {
                setRoles({ userRoles, count });
              }
            }
            break;

          case 5: // Fetch levels
            payload = {
              // companyId,
              searchKey: searchQuery,
              sortBy: null,
            };
            response = await axios.post(
              `${config.CORPORATE.LEVEL_LIST}`,
              payload,
              { signal }
            );
            if (response.data.status === "SUCCESS") {
              const { levels, totalLevels } = response.data.data;
              if (searchQuery) {
                setLevels((prev) => ({
                  ...prev,
                  levels,
                }));
              } else {
                setLevels({ levels, count: totalLevels });
              }
            }
            break;

          case 6: // Fetch designation
            payload = {
              // companyId,
              searchKey: searchQuery,
              sortBy: null,
            };
            response = await axios.post(
              `${config.CORPORATE.DESIGNATION_LIST}`,
              payload,
              { signal }
            );
            if (response.data.status === "SUCCESS") {
              const { designations, count } = response.data.data;
              if (searchQuery) {
                setDesignations((prev) => ({
                  ...prev,
                  designations,
                }));
              } else {
                setDesignations({ designations, count });
              }
            }
            break;

          case 7: // Fetch Travel Policy
            payload = {
              // companyId,
            };
            response = await axios.post(
              `${config.CORPORATE.TRAVEL_POLICY_LIST}`,
              payload,
              { signal }
            );
            if (response.data.status === "SUCCESS") {
              const { corporateTravelPolicies, count } = response.data.data;
              if (searchQuery) {
                setTravelPolicies((prev) => ({
                  ...prev,
                  travelPolicies: corporateTravelPolicies,
                }));
              } else {
                setTravelPolicies({
                  travelPolicies: corporateTravelPolicies ?? [],
                  count: count ?? 0,
                });
              }
            }
            break;

          case 10: // Fetch Bands
            payload = {
              // companyId,
              searchKey: searchQuery,
              sortBy: null,
            };
            response = await axios.post(
              `${config.CORPORATE.BAND_LIST}`,
              payload,
              {
                signal,
              }
            );
            if (response.data.status === "SUCCESS") {
              const { bands, totalBands } = response.data.data;
              if (searchQuery) {
                setBands((prev) => ({
                  ...prev,
                  bands,
                }));
              } else {
                setBands({ bands, count: totalBands });
              }
            }
            break;

          // Add more cases for other tabs if needed
          default:
            break;
        }
        setIsLoading(false);
      } catch (error) {
        setIsLoading(false);
        console.error(`Error fetching data for tab ${tab}:`, error);
      } finally {
        // setIsLoading(false);
      }
    },
    [companyId, fetchDepartments]
  );

  useEffect(() => {
    if (shouldFetch) {
      fetchDataPerSection(activeTab);
    }
    setShouldFetch(true); // Reset shouldFetch after handling
  }, [activeTab, fetchDataPerSection]);

  const generateFilterObjectForEmployee = (selectedDepts) => {
    const hasAll = selectedDepts.includes("ALL");
    const hasUnassigned = selectedDepts.includes("UNASSIGNED");
    const hasAssigned = selectedDepts.some(
      (dept) => dept !== "ALL" && dept !== "UNASSIGNED"
    );

    let type = [];
    if (hasAll) type.push("ALL");
    if (hasUnassigned) type.push("UNASSIGNED");
    if (hasAssigned) type.push("ASSIGNED");

    return {
      by: "DEPARTMENT",
      type: type,
      values: hasAssigned
        ? selectedDepts.filter(
            (dept) => dept !== "ALL" && dept !== "UNASSIGNED"
          )
        : [],
    };
  };

  const downloadDataAsExcel = async (payload, filename) => {
    try {
      const response = await axios.post(
        `${config.CORPORATE.EMPLOYEE_DATA_DOWNLOAD}`,
        payload,
        { responseType: "blob" }
      );

      // Get the current date in yyyy-mm-dd format
      const currentDate = new Date().toISOString().slice(0, 10);

      // Construct the full filename with the current date
      const fullFilename = `${filename}_${currentDate}.xlsx`;

      // Create a URL for the blob
      const url = window.URL.createObjectURL(new Blob([response.data]));

      // Create a link element to trigger the download
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", fullFilename);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error("Error downloading data:", error);
      showToast("error", "Error downloading data. Please try again.");
    }
  };

  const redirectToEmployee = async (data, filterType = null) => {
    try {
      let filter;
      const additionalFilters = {};
      const paginationData = { pageNo: 1, pageSize: 10 };
      if (!filterType) {
        filter = {
          by: "DEPARTMENT",
          type: ["ASSIGNED"],
          values: [data.departmentId],
        };
        setSelectedEmployeeFilterDepartments([data.departmentId]);
        await fetchDataPerSection(
          2,
          "",
          filter ? [filter] : [],
          additionalFilters,
          paginationData
        );
      } else {
        router.push({
          pathname: router.pathname,
          query: { [filterType.toLowerCase()]: data.name },
        });
      }
      setShouldFetch(false);
      setActiveTab(2);
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <ProtectedRoute>
      <Head>
        <title>Manage Company</title>
      </Head>
      {isLoading && !shouldFetch ? (
        <FontAwesomeIcon icon={faSpinner} spin />
      ) : (
        <div className={style.pageContainer}>
          <div className="shadow-[0_4px_6px_-1px_rgba(0,0,0,0.1),0_2px_4px_-1px_rgba(0,0,0,0.06)]">
            <Header userType={userType} />
          </div>
          <div className={`bg-[#E5E9EB] h-fit pb-5 ${style.companyMob}`}>
            <div
              className={`bg-white h-auto flex-col text-black font-medium text-xl rounded-xl ${style.compInner}`}
            >
              <div className="h-fit text-base  sm:text-2xl flex  sm:flex-row justify-between items-center">
                Company Setup
                <RenderButtons
                  activeTab={activeTab}
                  handleOpenDepartment={handleOpenDepartment}
                  handleOpenBulkDepartment={handleOpenBulkDepartment}
                  handleOpenEmpDepartment={handleOpenEmpDepartment}
                  handleOpenRoles={handleOpenRoles}
                  handleOpenLevels={handleOpenLevels}
                  handleOpenDesignation={handleOpenDesignation}
                  handleOpenBands={handleOpenBands}
                  handleOpenTravel={handleOpenTravel}
                  travelPolicyData={travelPolicies}
                  isTravelVisible={isTravelModalVisible}
                />
              </div>
              <div className="w-full">
                <TabNavigation
                  activeTab={activeTab}
                  setActiveTab={setActiveTab}
                />
                <div
                  className={`mt-1 justify-center m-auto ${style.compInner}`}
                >
                  {isBulkModalVisible && (
                    <BulkUpload
                      isBulkVisible={isBulkModalVisible}
                      onClose={handleCloseBulkDepartment}
                      activeTab={activeTab}
                      fetchList={fetchDataPerSection}
                    />
                  )}

                  {activeTab === 1 && (
                    <DepartmentList
                      activeTab={activeTab}
                      fetchDataPerSection={fetchDataPerSection}
                      isLoading={isLoading}
                      departmentData={departments}
                      redirectToEmployee={redirectToEmployee}
                      validator={validator}
                      downloadDataAsExcel={downloadDataAsExcel}
                      setParentData={setDepartments}
                      isModalVisible={isModalVisible}
                      setModalVisible={setModalVisible}
                      setBulkModalVisible={setBulkModalVisible}
                    />
                  )}
                  {activeTab === 2 && (
                    <EmployeeList
                      activeTab={activeTab}
                      fetchDataPerSection={fetchDataPerSection}
                      isLoading={isLoading}
                      employeeData={employees}
                      departmentData={departments}
                      validator={validator}
                      generateFilterObjectForEmployee={
                        generateFilterObjectForEmployee
                      }
                      downloadDataAsExcel={downloadDataAsExcel}
                      selectedEmployeeFilterDepartments={
                        selectedEmployeeFilterDepartments
                      }
                      setSelectedEmployeeFilterDepartments={
                        setSelectedEmployeeFilterDepartments
                      }
                      shouldFetch={shouldFetch}
                      setShouldFetch={setShouldFetch}
                      isEmpModalVisible={isEmpModalVisible}
                      setEmpModalVisible={setEmpModalVisible}
                      setBulkModalVisible={setBulkModalVisible}
                    />
                  )}
                  {activeTab === 3 && (
                    <>
                      {isRoleModalVisible && (
                        <RoleAdd
                          isVisible={isRoleModalVisible}
                          onClose={handleCloseRoles}
                          refreshRoles={fetchDataPerSection}
                          activeTab={activeTab}
                          isEdit={!!editingRole}
                          roleData={editingRole}
                        />
                      )}
                      <RoleList
                        activeTab={activeTab}
                        roles={roles}
                        isLoading={isLoading}
                        refreshRoles={fetchDataPerSection}
                        openEditModal={handleEditRole}
                        setModalVisible={handleOpenRoles}
                        setBulkModalVisible={setBulkModalVisible}
                        setActiveTab={setActiveTab}
                        setShouldFetch={setShouldFetch}
                        redirectToEmployee={redirectToEmployee}
                        downloadDataAsExcel={downloadDataAsExcel}
                        // companyId={companyId}
                      />
                    </>
                  )}

                  {activeTab === 5 && (
                    <>
                      {isLevelModalVisible && (
                        <OrganizationModal
                          isVisible={isLevelModalVisible}
                          onClose={handleCloselevels}
                          type="level" // or "designation" or "band"
                          onSuccess={async (data) => {
                            // Handle successful creation/update
                            await fetchDataPerSection(5);
                          }}
                          initialData={editingLevel}
                        />
                      )}
                      <LevelList
                        fetchDataPerSection={fetchDataPerSection}
                        activeTab={activeTab}
                        levelsData={levels}
                        isLoading={isLoading}
                        setModalVisible={setIsLevelModalVisible}
                        setBulkModalVisible={setBulkModalVisible}
                        openEditModal={handleEditLevel}
                        redirectToEmployee={redirectToEmployee}
                        downloadDataAsExcel={downloadDataAsExcel}
                        // companyId={companyId}
                      />
                    </>
                  )}
                  {activeTab === 6 && (
                    <>
                      {isDesignationModalVisible && (
                        <OrganizationModal
                          isVisible={isDesignationModalVisible}
                          onClose={handleCloseDesignation}
                          type="designation" // or "designation" or "band"
                          onSuccess={async (data) => {
                            // Handle successful creation/update
                            await fetchDataPerSection(6);
                          }}
                          initialData={editingDesignation}
                        />
                      )}
                      <DesignationList
                        fetchDataPerSection={fetchDataPerSection}
                        activeTab={activeTab}
                        isLoading={isLoading}
                        designationData={designations}
                        setModalVisible={setIsDesignationModalVisible}
                        setBulkModalVisible={setBulkModalVisible}
                        openEditModal={handleEditDesignation}
                        redirectToEmployee={redirectToEmployee}
                        downloadDataAsExcel={downloadDataAsExcel}
                        // companyId={companyId}
                      />
                    </>
                  )}

                  {activeTab === 10 && (
                    <>
                      {isBandsModalVisible && (
                        <OrganizationModal
                          isVisible={isBandsModalVisible}
                          onClose={handleCloseBands}
                          type="band" // or "designation" or "band"
                          onSuccess={async (data) => {
                            // Handle successful creation/update
                            await fetchDataPerSection(10);
                          }}
                          initialData={editingBand}
                        />
                      )}
                      <BandList
                        fetchDataPerSection={fetchDataPerSection}
                        activeTab={activeTab}
                        isLoading={isLoading}
                        bandData={bands}
                        setModalVisible={setIsBandsModalVisible}
                        setBulkModalVisible={setBulkModalVisible}
                        openEditModal={handleEditBand}
                        redirectToEmployee={redirectToEmployee}
                        downloadDataAsExcel={downloadDataAsExcel}
                        // companyId={companyId}
                      />
                    </>
                  )}
                  {activeTab === 4 && <Travelpolicy1 />}

                  {activeTab === 7 && (
                    <>
                      <div className="flex flex-col gap-3">
                        <TravelPolicyList
                          travelPolicyData={travelPolicies}
                          expandedPolicyId={expandedPolicyId}
                          setExpandedPolicyId={setExpandedPolicyId}
                          onClose={handleCloseTravel}
                          activeTab={activeTab}
                          fetchDataPerSection={fetchDataPerSection}
                          isTravelVisible={isTravelModalVisible}
                          setIsTravelVisible={setIsTravelModalVisible}
                        />
                        {/* {isTravelModalVisible && (
                          <Addtravel
                            isTravelVisible={isTravelModalVisible}
                            onClose={handleCloseTravel}
                          />
                        )} */}
                      </div>
                    </>
                  )}

                  {activeTab === 8 && <ComingSoon />}
                </div>
              </div>
            </div>
          </div>

          <div>
            <Footer1 />
          </div>
        </div>
      )}
    </ProtectedRoute>
  );
}
