import { useState, useEffect, useRef } from "react";
import { useSelector } from "react-redux";
import Image from "next/image";
import bulkDep from "../../../images/bulkDep.png";
import "tailwindcss/tailwind.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFile, faSpinner } from "@fortawesome/free-solid-svg-icons";
import { FileUploader } from "react-drag-drop-files";
import axios from "@/utils/axios/axios";
import showToast from "@/utils/toast";
import config from "@/config";
import { toast } from "react-toastify";

const fileTypes = ["xlsx", "xls"];

const BulkUpload = ({
  isBulkVisible,
  isEmpBulkVisible,
  onClose,
  activeTab,
  fetchList,
}) => {
  const userDetails = useSelector((state) => state?.user?.userInfo);

  const popupRef = useRef(null);

  const [file, setFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const handleChange = (file) => {
    setFile(file);
  };

  useEffect(() => {
    const handleBodyScroll = () => {
      document.body.style.overflow =
        isEmpBulkVisible || isBulkVisible ? "hidden" : "auto";
    };

    handleBodyScroll();
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [isEmpBulkVisible, isBulkVisible]);

  const downloadTemplate = async () => {
    try {
      const response = await axios.get(
        `${config.CORPORATE.DOWNLOAD_TEMPLATE}`,
        {
          responseType: "blob",
        }
      );

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "template.xlsx");
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error("Error downloading template:", error);
      showToast("error", "Error downloading template. Please try again.");
    }
  };

  const uploadFile = async () => {
    if (!file) {
      showToast("info", "Please select a file to upload");
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    // const { companyId } = userDetails;
    const formData = new FormData();
    formData.append("file", file);
    // formData.append("companyId", companyId);

    try {
      const response = await axios.post(
        `${config.CORPORATE.IMPORT_TEMPLATE}`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
          onUploadProgress: (progressEvent) => {
            const percentCompleted = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            );
            setUploadProgress(percentCompleted);
          },
        }
      );
      showToast("success", "File uploaded successfully!");
      onClose();
      fetchList(activeTab);
    } catch (error) {
      console.log("Error uploading file:", error);
      // showToast("error", "Error uploading file. Please try again.");
      const errormessage =
        error?.response?.data?.Error?.ErrorMessage?.Error?.[0]?.message ||
        error?.response?.data?.errors ||
        error?.response?.data?.Error?.ErrorMessage?.Error ||
        "An error occurred. Please try again.";
      showToast("error", errormessage);
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const handleClickOutside = (event) => {
    if (popupRef.current && !popupRef.current.contains(event.target)) {
      onClose(); // Close the popup
    }
  };

  useEffect(() => {
    if (onClose) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [onClose]);

  if (!isEmpBulkVisible && !isBulkVisible) return null;

  return (
    <>
      <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 cursor-pointer">
        <div
          className="relative top-10 ml-2 mr-2 sm:mx-auto p-5 pt-2 px-3 border w-[95%] sm:w-2/6 shadow-lg rounded-xl bg-white h-auto"
          ref={popupRef}
        >
          <div className="flex justify-end">
            <button
              type="button"
              className="text-[#ffffff] hover:text-gray-700 bg-[#878786] p-0 px-2 rounded-full"
              onClick={onClose}
            >
              ×
            </button>
          </div>
          <div className="flex justify-center m-auto gap-2 w-auto">
            <Image src={bulkDep} alt="Add Department" width={100} />
            <div className="w-2/3 flex flex-col justify-center ml-5">
              <span className="text-lg">Add Data in bulk</span>
            </div>
          </div>
          <div className="border-b mt-2"></div>
          <div className="flex flex-col mt-5 h-auto border-b">
            <span className="font-medium text-sm">
              Step 1: Download the template
            </span>
            <button
              style={{ border: "0.5px solid #028fa3" }}
              className=" text-custom-blue text-sm w-fit p-3 px-10 rounded-full flex gap-2 items-center mt-3"
              onClick={downloadTemplate}
            >
              <FontAwesomeIcon icon={faFile} />
              Download the template
            </button>
            <span className="font-medium text-sm mt-3 mb-3">
              Step 2: Upload the template
            </span>
            <div className="border-2 border-dashed border-gray-300 p-4 rounded-md">
              <FileUploader
                handleChange={handleChange}
                name="file"
                types={fileTypes}
                maxSize={5}
                minSize={0}
                onSizeError={() => alert("File size is too large")}
                onTypeError={() => alert("Invalid file type")}
                multiple={false}
                label="Drag & Drop your file here or Click to browse"
                className="border-none p-4 bg-gray-100 rounded-lg "
              />
            </div>
            {file && (
              <div className="mt-4 p-2 bg-gray-100 rounded flex items-center justify-between">
                <span className="text-sm">{file.name}</span>
                <button
                  onClick={() => setFile(null)}
                  className="text-red-500 text-sm hover:text-red-700"
                >
                  Remove
                </button>
              </div>
            )}
            {isUploading && (
              <div className="mt-4">
                <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
                  <div
                    className="bg-[#028fa3] h-2.5 rounded-full"
                    style={{ width: `${uploadProgress}%` }}
                  ></div>
                </div>
                <p className="text-center mt-2">{uploadProgress}% Uploaded</p>
              </div>
            )}
          </div>
          <div className="text-center">
            <div className="mt-2 px-7 py-3 flex justify-center gap-4">
              <button
                type="button"
                className="inline-flex justify-center w-fit rounded-md border border-gray-300 px-4 py-2 text-base font-medium text-gray-500 shadow-sm sm:text-sm"
                onClick={onClose}
                disabled={isUploading}
              >
                Cancel
              </button>
              <button
                type="button"
                className="inline-flex justify-center w-fit rounded-md border border-transparent px-4 py-2 bg-[#028fa3] text-base font-medium text-white shadow-sm sm:text-sm"
                onClick={uploadFile}
                // disabled={isUploading || !file}
              >
                {isUploading ? (
                  <>
                    <FontAwesomeIcon icon={faSpinner} spin className="mr-2" />
                    Uploading...
                  </>
                ) : (
                  "Upload"
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default BulkUpload;
