import { useState, useEffect, useRef } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faXmarkCircle, faSpinner } from "@fortawesome/free-solid-svg-icons";
import MultiInput from "@/components/corporate/common/multiInput/MultiInput";
import axios from "@/utils/axios/axios";
import config from "@/config";
import useFormValidator from "@/hooks/useFormValidator";
import style from "./styles.module.css";

const RequestModal = ({
  isOpen,
  onClose,
  onSubmit,
  title,
  subtitle,
  showReasonInput = true,
  showDescriptionInput = false,
  showApproverDetails = false,
  travellers,
  buttonConfig = { cancel: "Close", submit: "Send Approval Request" },
  isReasonRequired = true,
  isDescriptionRequired = false,
  cancelPopup = false,
}) => {
  const [approvalReasons, setApprovalReasons] = useState([]);
  const [selectedReason, setSelectedReason] = useState("");
  const [description, setDescription] = useState("");
  const [validationTrigger, setValidationTrigger] = useState(false);
  const [showOtherDescription, setShowOtherDescription] = useState(false);
  const [loading, setLoading] = useState(false);
  const isInitialRender = useRef(true);
  const reasonInputRef = useRef(null);
  const descriptionInputRef = useRef(null);
  const [isSentRequestOpen, setIsSentRequestOpen] = useState(false);

  useEffect(() => {
    const fetchApprovalReasons = async () => {
      if (showReasonInput) {
        try {
          const endpoint = cancelPopup
            ? `${config.CORPORATE.GET_CANCELLATION_REASONS}`
            : `${config.CORPORATE.GET_APPROVAL_REASONS}`;
          const response = await axios.get(endpoint);
          if (response?.data?.status === "SUCCESS") {
            setApprovalReasons(response?.data?.data);
          }
        } catch (error) {
          console.error("Error fetching approval reasons:", error);
        }
      }
    };

    if (isInitialRender.current) {
      isInitialRender.current = false;
      fetchApprovalReasons();
    }
  }, [showReasonInput]);

  const isOtherReason = (reason) => {
    const normalizedReason = reason.trim().toLowerCase();
    return normalizedReason === "other" || normalizedReason === "others";
  };

  const handleReasonChange = (e) => {
    const selectedValue = e.target.value;
    setSelectedReason(selectedValue);

    // Check if the selected reason is "Other" or "Others"
    const shouldShowDescription = isOtherReason(selectedValue);
    setShowOtherDescription(shouldShowDescription);

    // Clear description when switching reasons
    if (!shouldShowDescription) {
      setDescription("");
    }
  };

  const handleDescriptionChange = (e) => {
    setDescription(e.target.value);
  };

  const scrollToError = () => {
    if (isReasonRequired && !selectedReason && reasonInputRef.current) {
      reasonInputRef.current.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
      return;
    }

    const isOtherReasonSelected = isOtherReason(selectedReason);
    if (
      (isDescriptionRequired || isOtherReasonSelected) &&
      !description &&
      descriptionInputRef.current
    ) {
      descriptionInputRef.current.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }
  };

  const handleSubmit = async () => {
    try {
      const isOtherReasonSelected = isOtherReason(selectedReason);
      if (
        (isReasonRequired && !selectedReason) ||
        (isDescriptionRequired && !description) ||
        (isOtherReasonSelected && !description)
      ) {
        validator.showMessages();
        setValidationTrigger((prev) => !prev);
        setTimeout(scrollToError, 200);
        return;
      }
      setLoading(true);

      if (onSubmit) {
        await onSubmit({ reason: selectedReason, description });
      }
      onClose();
      setIsSentRequestOpen(true);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  const customMessages = {
    required: "This field is required.",
  };
  const customRules = {};
  const [validator] = useFormValidator(customMessages, customRules);

  if (!isOpen) return null;

  return (
    <div className="p-4">
      <div className="fixed inset-0 flex items-center justify-center z-[99999]">
        <div
          className="fixed inset-0 bg-black opacity-50"
          onClick={onClose}
        ></div>

        <div className="relative w-fit my-6 mx-2 sm:mx-auto max-w-4xl max-h-full ">
          <div className="border-0 rounded-lg shadow-lg relative flex flex-col w-full bg-white outline-none focus:outline-none">
            <div className="flex flex-col p-2 border-b border-solid border-blueGray-200 rounded-t">
              <div className="flex items-center justify-between">
                <button
                  className="p-1 ml-auto bg-transparent border-0 text-black opacity-50 float-right text-xl leading-none font-semibold outline-none focus:outline-none"
                  onClick={onClose}
                >
                  <FontAwesomeIcon
                    icon={faXmarkCircle}
                    color="#000000"
                    className="hover:text-[#155EEF]"
                  />
                </button>
              </div>
              <div className="flex flex-col items-center justify-center mx-auto">
                <span className="text-xs sm:text-xl font-semibold">
                  {title}
                </span>
                {!cancelPopup && (
                  <span className="text-xxs sm:text-sm font-medium">
                    {subtitle}
                  </span>
                )}
              </div>
            </div>

            {(showApproverDetails ||
              showReasonInput ||
              showDescriptionInput ||
              showOtherDescription) && (
              <div className={style.cancel}>
                {showApproverDetails &&
                  travellers &&
                  travellers?.some(
                    (traveller) =>
                      traveller?.data?.approverUserDetails?.length > 0
                  ) && (
                    <div className="relative p-6 pb-6 flex flex-col">
                      <span className="text-xs sm:text-base font-semibold">
                        Approval Required From{" "}
                        <span className="text-red-400">*</span>
                      </span>
                      {travellers?.map((traveller, index) => (
                        <div key={index} className="mt-3">
                          <p className="font-medium text-xs sm:text-base">
                            {traveller.label}
                          </p>
                          <div className="border text-[#155EEF] border-gray-300 p-2 rounded-lg mt-1">
                            <MultiInput
                              tags={traveller?.data?.approverUserDetails?.map(
                                (a) => ({
                                  id: a._id,
                                  text: `${a.firstName} ${a.lastName}`,
                                })
                              )}
                              readOnly={true}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                {showReasonInput && (
                  <div className="relative p-6 pb-4" ref={reasonInputRef}>
                    <span className="text-xs sm:text-base font-semibold">
                      {cancelPopup
                        ? "Reason For Cancellation"
                        : "Reason For Travel"}
                      <span className="text-red-400">*</span>
                    </span>
                    <div className="text-red-500 text-xs mt-1">
                      {isReasonRequired &&
                        !selectedReason &&
                        validator.message(
                          "travel-reason",
                          selectedReason,
                          "required"
                        )}
                    </div>
                    <div
                      //  className="mt-2 max-h-40 overflow-y-auto scrollbar-thin scrollbar-thumb scrollbar-track"
                      className="mt-2 grid grid-cols-4 "
                    >
                      {approvalReasons?.map((reason) => (
                        <div
                          key={reason._id}
                          className="flex items-center mb-2 cursor-pointer"
                        >
                          <input
                            id={`reason-${reason._id}`}
                            type="radio"
                            value={reason.reason.trim()}
                            name="travel-reason"
                            checked={
                              selectedReason.trim() === reason.reason.trim()
                            }
                            onChange={handleReasonChange}
                            className="w-4 h-4 cursor-pointer bg-gray-100 border-gray-300 focus:outline-none dark:bg-gray-700 dark:border-gray-600"
                          />
                          <label
                            htmlFor={`reason-${reason._id}`}
                            className="ms-2 text-xxs sm:text-sm cursor-pointer font-medium text-gray-900 dark:text-gray-500"
                          >
                            {reason.reason}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {(showDescriptionInput || showOtherDescription) && (
                  <div className="relative p-6 pt-2" ref={descriptionInputRef}>
                    {/* <span className="font-semibold">Description</span> */}
                    <textarea
                      value={description}
                      onChange={handleDescriptionChange}
                      placeholder={
                        showOtherDescription &&
                        !showDescriptionInput &&
                        !cancelPopup
                          ? "Please specify your reason for travel"
                          : "Please mention the reason for cancelling the request here."
                      }
                      className="mt-2 w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:border-[#155EEF]"
                      rows={4}
                    />
                    <div className="text-red-500 text-xs mt-1">
                      {((isDescriptionRequired && !description) ||
                        (showOtherDescription && !description)) &&
                        validator.message(
                          "description",
                          description,
                          "required"
                        )}
                    </div>
                  </div>
                )}
              </div>
            )}

            <div className="flex gap-2 items-center justify-center p-6 border-t border-solid border-blueGray-200 rounded-b">
              {buttonConfig.cancel && (
                <button
                  className="text-gray-400 background-transparent border rounded border-gray-300 px-3 py-2 text-sm outline-none focus:outline-none mr-1 mb-2 ease-linear transition-all duration-150 hover:bg-[#155EEF] hover:text-white"
                  type="button"
                  onClick={onClose}
                >
                  {buttonConfig.cancel}
                </button>
              )}
              <button
                className={`bg-[#155EEF] min-w-40 text-white active:bg-[#155EEF] text-sm px-3 py-2 rounded outline-none focus:outline-none mb-2 ease-linear transition-all duration-150 ${
                  !buttonConfig.cancel ? "w-[30%]" : ""
                }`}
                type="button"
                disabled={loading}
                onClick={handleSubmit}
              >
                {loading ? (
                  <FontAwesomeIcon icon={faSpinner} spin />
                ) : (
                  buttonConfig.submit
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {isSentRequestOpen && (
        <sentRequest onClose={() => setIsSentRequestOpen(false)} />
      )}
    </div>
  );
};

export default RequestModal;
