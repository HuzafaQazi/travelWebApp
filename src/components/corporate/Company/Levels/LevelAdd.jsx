import { faArrowLeft, faXmarkCircle } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useState } from "react";
import Image from "next/image";
import addDep from "@/images/image 4.png";
import { FileUploader } from "react-drag-drop-files";
import { faFileAlt } from "@fortawesome/free-regular-svg-icons";

const LevelAdd = ({ isLevelVisible, onClose }) => {
  const [file, setFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const handleChange = (file) => {
    setFile(file);
  };
  if (!isLevelVisible) return null;
  return (
    <>
      <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 cursor-pointer">
        <div className="relative top-5 mx-auto p-3 border w-2/4 shadow-lg rounded-md bg-white">
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
          <div className="flex m-auto w-2/3 items-center">
            <Image src={addDep} alt="Add Department" width={100} />
            <div className="w-full flex flex-col items-center">
              <span className="font-bold ">Create Levels</span>
              <span
                className="font-light text text-sm"
                style={{ color: "#443C38" }}
              >
                Create levels of the organization
              </span>
            </div>
          </div>
          <div className="border-b mt-2"></div>
          <div className="w-full mt-4">
            <div className="relative w-full min-w-[50px] h-10">
              <input
                className="block px-2.5 pb-2.5 pt-2.5 w-full text-sm text-gray-900 bg-transparent rounded-lg border-1 border-gray-300 appearance-none dark:text-black dark:border-gray-300 dark:focus:border-[#028fa3] focus:outline-none focus:ring-0 focus:border-[#028fa3]-600 peer"
                placeholder=" "
              />
              <label className="absolute text-sm text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-white dark:bg-gray-900 px-2 peer-focus:px-2 peer-focus:text-[#028fa3] peer-focus:dark:text-[#028fa3] peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto start-1">
                Name of the level
              </label>
            </div>
          </div>
          <div className="flex flex-col mt-5 h-auto border-b">
            <div className="font-semibold py-2 text-lg text-[]">
              Add employees to the level{" "}
            </div>
            <span className="font-medium text-sm">
              Step 1: Download the template
            </span>
            <button
              style={{ border: "0.5px solid #028fa3" }}
              className=" text-custom-blue text-sm w-fit p-3 px-10 rounded-full flex gap-2 items-center mt-3"
            >
              <FontAwesomeIcon icon={faFileAlt} />
              Download the template
            </button>
            <span className="font-medium text-sm mt-3 mb-3">
              Step 2: Upload the template
            </span>
            <div className="border-2 border-dashed border-gray-300 p-4 rounded-md">
              <FileUploader
                handleChange={handleChange}
                name="file"
                className="border-none p-4 bg-gray-100 rounded-lg"
              ></FileUploader>
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
          </div>
          <div className="border-b mt-2"></div>
          <div className="text-center">
            <div className="mt-2 flex justify-center gap-4">
              <button
                type="button"
                className="inline-flex justify-center w-fit rounded-md border border-gray-300 px-4 py-2 text-base font-medium text-gray-500 shadow-sm sm:text-sm"
                onClick={onClose}
              >
                Cancel
              </button>
              <button
                type="button"
                className="inline-flex justify-center w-fit rounded-md border border-transparent px-4 py-2 bg-[#028fa3] text-base font-medium text-white shadow-sm sm:text-sm"
                onClick={onClose}
              >
                Create Level
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
export default LevelAdd;
