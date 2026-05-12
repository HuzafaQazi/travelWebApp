import { useState, useRef, useEffect, useMemo, useCallback } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft, faSpinner, faXmarkCircle } from "@fortawesome/free-solid-svg-icons";
import Image from "next/image";
import Select from "react-select";
import useFormValidator from "@/hooks/useFormValidator";
import logoSrc from "@/images/image 4.png";
import axios from "@/utils/axios/axios";
import config from "@/config";
import showToast from "@/utils/toast";
import { useSelector } from "react-redux";

const modalTypes = {
  LEVEL: "level",
  DESIGNATION: "designation",
  BAND: "band",
};

const modalConfig = {
  [modalTypes.LEVEL]: {
    title: "Create Levels",
    editTitle: "Edit Level",
    subtitle: "Create levels of the organization",
    editSubtitle: "Edit level of the organization",
    inputLabel: "Name of the level",
    buttonText: "Create Level",
    editButtonText: "Update Level",
    showLevelSelect: false,
    addApi: config.CORPORATE.LEVEL_ADD,
    updateApi: config.CORPORATE.LEVEL_UPDATE,
    successMessage: {
      create: "Level created successfully",
      update: "Level updated successfully",
    },
    transformPayload: (formData, userDetails, isEditMode, initialData) => ({
      level: formData.name,
      // status: "active",
      ...(isEditMode
        ? {
          _id: initialData._id,
          // modifiedBy: userDetails?.userId,
        }
        : {
          // companyId: userDetails?.companyId,
          // createdBy: userDetails?.userId,
          // modifiedBy: userDetails?.userId,
        }
      ),
    }),
    parseInitialData: (initialData) => ({
      name: initialData?.level || "",
      level: null,
    }),
  },
  [modalTypes.DESIGNATION]: {
    title: "Create Designation",
    editTitle: "Edit Designation",
    subtitle: "Add designation for the employees",
    editSubtitle: "Edit designation for the employees",
    inputLabel: "Name of the designation",
    buttonText: "Create Designation",
    editButtonText: "Update Designation",
    showLevelSelect: false,
    addApi: config.CORPORATE.DESIGNATION_ADD,
    updateApi: config.CORPORATE.DESIGNATION_UPDATE,
    successMessage: {
      create: "Designation created successfully",
      update: "Designation updated successfully",
    },
    transformPayload: (formData, userDetails, isEditMode, initialData) => ({
      designation: formData.name,
      // status: "active",
      ...(isEditMode
        ? {
          _id: initialData._id,
          // modifiedBy: userDetails?.userId,
        }
        : {
          // companyId: userDetails?.companyId,
          // createdBy: userDetails?.userId,
          // modifiedBy: userDetails?.userId,
        }),
    }),
    parseInitialData: (initialData) => ({
      name: initialData?.designation || "",
      level: null,
    }),
  },
  [modalTypes.BAND]: {
    title: "Create Bands",
    editTitle: "Edit Band",
    subtitle: "Create bands of the organization",
    editSubtitle: "Edit band of the organization",
    inputLabel: "Name of the band",
    buttonText: "Create Band",
    editButtonText: "Update Band",
    showLevelSelect: true,
    addApi: config.CORPORATE.BAND_ADD,
    updateApi: config.CORPORATE.BAND_UPDATE,
    successMessage: {
      create: "Band created successfully",
      update: "Band updated successfully",
    },
    transformPayload: (formData, userDetails, isEditMode, initialData) => ({
      band: formData.name,
      levelId: formData.level?.value,
      // status: "active",
      ...(isEditMode
        ? {
          _id: initialData._id,
          // modifiedBy: userDetails?.userId,
        }
        : {
          // companyId: userDetails?.companyId,
          // createdBy: userDetails?.userId,
          // modifiedBy: userDetails?.userId,
        }),
    }),
    parseInitialData: (initialData) => ({
      name: initialData?.band || "",
      level: initialData?.levelDetails
        ? { value: initialData?.levelDetails?._id, label: initialData?.levelDetails?.level }
        : null,
    }),
  },
};

const OrganizationModal = ({
  isVisible,
  onClose,
  type,
  initialData = null,
  onSuccess = () => { },
}) => {
  const userDetails = useSelector((state) => state?.user?.userInfo);

  const initialRender = useRef(true);

  const [formData, setFormData] = useState({
    name: "",
    level: null,
  });
  const [levelOptions, setLevelOptions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [validationTrigger, setValidationTrigger] = useState(false);

  const customMessages = useMemo(
    () => ({
      required: "This field is required.",
    }),
    []
  );

  const customRules = useMemo(() => ({}), []);

  const [validator, updateValidator] = useFormValidator(
    customMessages,
    customRules
  );

  useEffect(() => {
    if (!isVisible) {
      setFormData({ name: "", level: null });
      updateValidator(customMessages, customRules);
    } else if (isVisible && initialData) {
      const parsedData = modalConfig[type].parseInitialData(initialData);
      setFormData(parsedData);
      console.log("parsedData", parsedData);
    }
  }, [
    isVisible,
    updateValidator,
    customMessages,
    customRules,
    initialData,
    type,
  ]);

  const fetchLevels = useCallback(async () => {
    try {
      const response = await axios.post(
        `${config.CORPORATE.LEVEL_LIST}`
      ); // Adjust API endpoint
      if (response?.data?.status === "SUCCESS") {
        const options = response?.data?.data?.levels?.map((level) => ({
          value: level._id,
          label: level.level,
        }));
        setLevelOptions(options);
      }
    } catch (error) {
      console.error("Error fetching levels:", error);
    }
  }, []);

  useEffect(() => {
    if (
      isVisible &&
      modalConfig[type].showLevelSelect &&
      initialRender.current
    ) {
      initialRender.current = false;
      fetchLevels();
    }
  }, [isVisible, type, fetchLevels]);

  if (!isVisible) return null;

  const modalSettings = modalConfig[type];
  const isEditMode = !!initialData;

  const handleInputChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      name: e.target.value,
    }));
  };

  const handleLevelChange = (selectedOption) => {
    setFormData((prev) => ({
      ...prev,
      level: selectedOption,
    }));
  };

  const handleSubmit = async () => {
    const isValid = validator.allValid();
    if (isValid) {
      try {
        setIsLoading(true);
        const payload = modalSettings.transformPayload(
          formData,
          userDetails,
          isEditMode,
          initialData
        );
        const url = isEditMode ? modalSettings.updateApi : modalSettings.addApi;
        const response = await axios.post(url, payload);
        if (response?.data?.status === "SUCCESS") {
          showToast(
            "success",
            isEditMode
              ? modalSettings.successMessage.update
              : modalSettings.successMessage.create
          );
          onSuccess(response.data);
          onClose();
        } else {
          showToast("error", "Operation failed. Please try again.");
        }
      } catch (error) {
        console.error("Submission error:", error);
        showToast("error", error?.response?.data?.Error?.ErrorMessage?.Error);
      } finally {
        setIsLoading(false);
      }
    } else {
      console.log(validator.getErrorMessages());
      validator.showMessages();
      setValidationTrigger((prev) => !prev);
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="flex items-center justify-center min-h-screen">
      <div className="relative top-5 ml-2 mr-2 sm:mx-auto p-3 border w-[95%] sm:w-2/4 shadow-lg rounded-md bg-white">
        {/* Header */}
        <div className="flex justify-between">
          <button
            type="button"
            className="text-gray-500 hover:text-gray-700"
            onClick={onClose}
            disabled={isLoading}
          >
            <FontAwesomeIcon icon={faArrowLeft} />
          </button>
          <button
            type="button"
            className="text-gray-500 hover:text-gray-700"
            onClick={onClose}
            disabled={isLoading}
          >
            <FontAwesomeIcon icon={faXmarkCircle} />
          </button>
        </div>

        {/* Title section */}
        <div className="flex m-auto w-[95%] sm:w-2/3 items-center">
          <Image src={logoSrc} alt="Organization Logo" width={100} />
          <div className="w-full flex flex-col sm:items-center">
            <span className="font-bold text-sm sm:text-base ">
              {isEditMode ? modalSettings.editTitle : modalSettings.title}
            </span>
            <span className="font-light text-xs sm:text-sm text-[#443C38]">
              {isEditMode ? modalSettings.editSubtitle : modalSettings.subtitle}
            </span>
          </div>
        </div>

        <div className="border-b mt-2" />

        {/* Name input */}
        <div className="w-full mt-4">
          <div className="relative w-full min-w-[50px] h-10">
            <input
              className="block px-2.5 pb-2.5 pt-2.5 w-full text-sm text-gray-900 bg-transparent rounded-lg border-1 border-gray-300 appearance-none dark:text-black dark:border-gray-300 dark:focus:border-[#028fa3] focus:outline-none focus:ring-0 focus:border-[#028fa3]-600 peer"
              placeholder=" "
              id="Name"
              value={formData.name}
              onChange={handleInputChange}
              onBlur={() => validator.showMessageFor("name")}
              disabled={isLoading}
              maxLength={30}
            />
            <label for="Name" className="absolute text-sm text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-white dark:bg-gray-900 px-2 peer-focus:px-2 peer-focus:text-[#028fa3] peer-focus:dark:text-[#028fa3] peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto start-1">
              {modalSettings.inputLabel}
            </label>
            <div className="text-red-500 text-xxs mt-1">
              {validator.message("name", formData.name, "required|min:2")}
            </div>
          </div>
        </div>

        {/* Level select for Bands */}
        {modalSettings.showLevelSelect && (
          <div className="relative w-full min-w-[50px] mt-12">
            <label className="absolute text-sm text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-white dark:bg-gray-900 px-2">
              Select Level
            </label>
            <Select
              options={levelOptions}
              value={formData.level}
              onChange={handleLevelChange}
              placeholder="Select"
              className="peer text-sm"
              isDisabled={isLoading}
              styles={{
                control: (baseStyles) => ({
                  ...baseStyles,
                  padding: "1px",
                  borderColor: "#d1d5db",
                  borderRadius: "0.5rem",
                  backgroundColor: "transparent",
                  boxShadow: "none",
                  "&:hover": { borderColor: "#028fa3" },
                  "&:focus-within": { borderColor: "#028fa3" },
                }),
              }}
            />
          </div>
        )}

        {/* Footer with action buttons */}
        <div className="border-b mt-2" />
        <div className="text-center">
          <div className="mt-2 flex justify-center gap-4">
            <button
              type="button"
              className="inline-flex justify-center w-fit rounded-md border border-gray-300 px-4 py-2 sm:text-base font-semibold sm:font-medium text-gray-500 shadow-sm text-xs"
              onClick={onClose}
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              type="button"
              className="inline-flex justify-center w-fit rounded-md border border-transparent px-4 py-2 bg-[#028fa3] sm:text-base font-semibold sm:font-medium text-white shadow-sm text-xs"
              onClick={handleSubmit}
              disabled={isLoading}
            >
              {isLoading
                ?
                // "Processing..."
                (
                  <FontAwesomeIcon icon={faSpinner} className="text-white" spin />
                )
                : isEditMode
                  ? modalSettings.editButtonText
                  : modalSettings.buttonText}
            </button>
          </div>
        </div>
      </div>
      </div>
    </div>
  );
};

export default OrganizationModal;
