import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import Image from "next/image";
import addDep from "@/images/image 4.png";
import "tailwindcss/tailwind.css";
import {
  faArrowLeft,
  faXmarkCircle,
  faSpinner,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import axios from "@/utils/axios/axios";
import config from "@/config";
import showToast from "@/utils/toast";
import useFormValidator from "@/hooks/useFormValidator";

const RoleAdd = ({
  isVisible,
  onClose,
  activeTab,
  refreshRoles,
  isEdit = false,
  roleData = {},
}) => {
  const userDetails = useSelector((state) => state?.user?.userInfo);

  const [modules, setModules] = useState([]);
  const [permissions, setPermissions] = useState([]);
  const [selectedPermissions, setSelectedPermissions] = useState({});
  const [roleName, setRoleName] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [validationTrigger, setValidationTrigger] = useState(false);

  const customMessages = {
    required: "This field is required.",
  };

  const customRules = {};

  const [validator] = useFormValidator(customMessages, customRules);

  const fetchModulesAndPermissions = async () => {
    try {
      const [moduleResponse, permissionResponse] = await Promise.all([
        axios.get(`${config.CORPORATE.ROLE_ALLOWED_MODULES}`),
        axios.get(`${config.CORPORATE.ROLE_ALLOWED_PERMISSIONS}`),
      ]);

      if (
        moduleResponse.data.status === "SUCCESS" &&
        permissionResponse.data.status === "SUCCESS"
      ) {
        const activeModules = moduleResponse.data.data.corporatemodules.filter(
          (module) => module.status.toLowerCase() === "active"
        );
        const activePermissions =
          permissionResponse.data.data.permissions.filter(
            (permission) => permission.status.toLowerCase() === "active"
          );

        setModules(activeModules);
        setPermissions(activePermissions);

        // Initialize selectedPermissions state
        const initialPermissions = {};
        activeModules.forEach((module) => {
          initialPermissions[module.moduleId] = [];
        });

        if (isEdit && roleData?.modules) {
          // Filter roleData modules to ensure they exist in activeModules
          roleData.modules.forEach((module) => {
            const matchedModule = activeModules.find(
              (activeModule) => activeModule.moduleId === module.moduleId
            );

            if (matchedModule && module?.permissions) {
              // Filter permissions to ensure they exist in activePermissions
              const validPermissions = module?.permissions
                .filter(
                  (perm) =>
                    activePermissions.some(
                      (activePerm) =>
                        activePerm.permissionId === perm.permissionId
                    ) && perm.permissionId != null // Exclude null permissionIds
                )
                .map((perm) => perm.permissionId);

              initialPermissions[module.moduleId] = validPermissions;
            }
          });
          setRoleName(roleData.userRoleName || "");
        }
        setSelectedPermissions(initialPermissions);
      }
    } catch (error) {
      console.error("Error fetching modules and permissions:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isVisible) {
      fetchModulesAndPermissions();
    } else {
      // Optionally reset the state when modal closes
      setRoleName("");
      setSelectedPermissions({});
    }
  }, [isVisible]);

  const handlePermissionToggle = (moduleId, permissionId) => {
    setSelectedPermissions((prevState) => {
      const modulePermissions = prevState[moduleId] || [];
      const updatedPermissions = modulePermissions.includes(permissionId)
        ? modulePermissions.filter((id) => id !== permissionId)
        : [...modulePermissions, permissionId];

      return { ...prevState, [moduleId]: updatedPermissions };
    });
  };

  const handleSubmit = async () => {
    try {
      const isValid = validator.allValid();
      if (!isValid) {
        validator.showMessages();
        setValidationTrigger((prev) => !prev);
        return;
      }
      const { companyId, userId } = userDetails;
      const payload = {
        // companyId,
        userRoleName: roleName,
        // status: "active",
        modules: Object.entries(selectedPermissions).map(
          ([moduleId, perms]) => ({
            moduleId: parseInt(moduleId),
            permissions: perms.map((id) => parseInt(id)),
          })
        ),
        // createdBy: userId,
        // modifiedBy: userId,
      };

      if (isEdit) {
        payload.userRoleId = roleData?.userRoleId;
      }

      const endpoint = isEdit
        ? `${config.CORPORATE.ROLE_UPDATE}`
        : `${config.CORPORATE.ROLE_ADD}`;

      const response = await axios.post(endpoint, payload);
      if (response.data.status === "SUCCESS") {
        showToast(
          "success",
          `Role ${isEdit ? "updated" : "created"} successfully!`
        );
        await refreshRoles(activeTab);
        onClose();
      } else {
        showToast(
          "error",
          `Failed to ${isEdit ? "update" : "create"} role. Please try again.`
        );
      }
    } catch (error) {
      console.error(`Error ${isEdit ? "updating" : "creating"} role:`, error);
      // console.log("error for craeting role",error?.response?.data?.Error?.ErrorMessage?.Error)

      let errorMessage =
          error?.response?.data?.error?.errorMessage[0].data ||
          error?.response?.data?.Error?.ErrorMessage?.Error
          "Something went wrong, please try after some time";
      // console.log("error for craeting role",error?.statuscode)
      if (
        error?.response?.data?.Error?.ErrorMessage?.Error ===
        "User role already exists"
        //  ||
        // error?.response?.data?.error?.errorMessage?.[0]?.data ===
        // "Fare Quote failed from the Supplier end. Please try again."
      ) {
        errorMessage =
          "User role already exists";
 // Redirect to a specific page
      }
      showToast(
        "error",errorMessage
        // `Error ${
        //   isEdit ? "updating" : "creating"
        // } role. Please check the console for details.`
      );
    }
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 cursor-pointer">
      <div className="relative top-5 ml-2 mr-2 sm:mx-auto p-3 border w-[95%] sm:w-2/4 shadow-lg rounded-md bg-white">
        {/* Header */}
        <div className="flex justify-between">
          <button
            type="button"
            className="text-gray-500 hover:text-gray-700"
            onClick={onClose}
          >
            <FontAwesomeIcon icon={faArrowLeft} />
          </button>
          <button
            type="button"
            className="text-gray-500 hover:text-gray-700"
            onClick={onClose}
          >
            <FontAwesomeIcon icon={faXmarkCircle} />
          </button>
        </div>

        {/* Title Section */}
        <div className="flex m-auto w-[90%] sm:w-2/3 items-center">
          <Image src={addDep} alt="Add Department" width={100} />
          <div className="w-full flex flex-col sm:items-center">
            <span className="font-bold text-sm sm:text-base">
              {" "}
              {isEdit ? "Edit Role" : "Create Role"}
            </span>
            <span
              className="font-light text-xs sm:text-sm text-[#443C38]"
              style={{ color: "#443C38" }}
            >
              {isEdit ? "Update role & permissions" : "Add roles & permissions"}
            </span>
          </div>
        </div>
        <div className="border-b mt-2"></div>
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <FontAwesomeIcon icon={faSpinner} spin />
          </div>
        ) : (
          <>
            {/* Role Name Input */}
            <div className="w-full mt-4">
              <div className="relative w-full min-w-[50px] h-10">
                <input
                  className="block px-2.5 pb-2.5 pt-2.5 w-full text-sm text-gray-900 bg-transparent rounded-lg border-1 border-gray-300 appearance-none dark:text-black dark:border-gray-300 dark:focus:border-[#028fa3] focus:outline-none focus:ring-0 focus:border-[#028fa3]-600 peer"
                  placeholder=" "
                  id="nameOfRole"
                  type="text"
                  value={roleName}
                  onChange={(e) => setRoleName(e.target.value)}
                  maxLength={30}
                />
                <label
                  htmlFor="nameOfRole"
                  className="absolute text-sm text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-white dark:bg-gray-900 px-2 peer-focus:px-2 peer-focus:text-[#028fa3] peer-focus:dark:text-[#028fa3] peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto start-1"
                >
                  Name of the role
                </label>
                <div className="text-red-500 text-xs mt-1">
                  {validator.message("nameOfRole", roleName, "required|min:2")}
                </div>
              </div>
            </div>

            {/* Modules and Permissions */}
            <div className="mt-4 h-auto border-b">
              <div className="text-lg font-medium text-[#171A19]">
                Allow Access Controls
              </div>
              {modules.map((module) => (
                <div
                  key={module._id}
                  className="flex justify-between items-center py-3 border-b-2 border-[#D9D9D950]"
                >
                  <div className={`text-[#171A19] text-sm sm:text-base font-normal`}>
                    {module.moduleName}
                  </div>
                  <div className="flex gap-4 items-center justify-center">
                    {permissions.map((permission) => (
                      <div key={permission._id} className="flex gap-2">
                        <div className="text-[#171A19] font-normal text-sm sm:text-base">
                          {permission.permissionName}
                        </div>
                        <label className="inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            className="sr-only peer"
                            checked={selectedPermissions[
                              module.moduleId
                            ]?.includes(permission.permissionId)}
                            onChange={() =>
                              handlePermissionToggle(
                                module.moduleId,
                                permission.permissionId
                              )
                            }
                          />
                          <div className="relative w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-[#E5E1E2] peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#028fa3]"></div>
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Footer Buttons */}
            <div className="text-center">
              <div className="mt-2 px-7 py-3 flex justify-center gap-4">
                <button
                  type="button"
                  className="inline-flex justify-center w-fit rounded-md border border-gray-300 px-4 py-2 sm:text-base font-semibold sm:font-medium text-gray-500 shadow-sm text-xs"
                  onClick={onClose}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="inline-flex justify-center w-fit rounded-md border border-transparent px-4 py-2 bg-[#028fa3] sm:text-base font:semibold sm:font-medium text-white shadow-sm text-xs"
                  onClick={handleSubmit}
                >
                  {isEdit ? "Update Role" : "Create Role"}
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default RoleAdd;
