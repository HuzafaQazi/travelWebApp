import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faXmarkCircle
} from "@fortawesome/free-solid-svg-icons";
import { useState } from "react";

const CancelModal = ({ isCancel, onClose }) => {
  const MAX_TAGS = 5;
  const [tags, setTags] = useState([]);

  const handleAddTag = (tag) => {
    setTags((prevTags) => [...prevTags, tag]);
  };

  const handleDeleteTag = (index) => {
    setTags((prevTags) => prevTags.filter((_, i) => i !== index));
  };
  if (!isCancel) return null;

  return (
    <div className="p-6">
      <div className="fixed inset-0 flex items-center justify-center z-50">
        {/* Background overlay */}
        <div
          className="fixed inset-0 bg-black opacity-50"
          onClick={onClose}
        ></div>

        {/* Popup box */}
        <div className="relative w-fit my-6 mx-auto max-w-4xl">
          {/*content*/}
          <div className="border-0 p-2 rounded-lg shadow-lg relative flex flex-col w-full bg-white outline-none focus:outline-none">
            {/*header*/}
            <div className="flex flex-col p-2  rounded-t">
              <div className="flex items-center justify-between">
                <span className="text-3xl font-semibold">
                  {/* Modal Title */}
                </span>
                <button
                  className="p-1 ml-auto bg-transparent border-0 text-black opacity-50 float-right text-xl leading-none font-semibold outline-none focus:outline-none"
                  onClick={onClose}
                >
                  <FontAwesomeIcon icon={faXmarkCircle} color="#000000" />
                </button>
              </div>
              <div className="flex flex-col pr-36">
                <span className="text-lg font-semibold">
                  Are you sure you want to cancel your Travel Request ?
                </span>
                <span className="text-sm font-light">
                  If you cancel your request, Your approver will be notified
                  about the cancellation.
                </span>
              </div>
            </div>
            {/*body*/}

            <div className="relative p-4 pb-2">
              <span className="font-semibold">
                Reason For Travel <span className="text-red-500">*</span>
              </span>
              <div className="mt-2">
                <div class="flex items-center mb-2">
                  <input
                    id="default-radio-1"
                    type="radio"
                    value=""
                    name="default-radio"
                    class="w-4 h-4 bg-gray-100 border-gray-300 focus:outline-none dark:bg-gray-700 dark:border-gray-600"
                  />
                  <label
                    for="default-radio-1"
                    class="ms-2 text-sm font-medium text-gray-900 dark:text-gray-500 peer-checked:text-[#028FA3]"
                  >
                    Business Meeting
                  </label>
                </div>
                <div class="flex items-center mb-2">
                  <input
                    id="default-radio-1"
                    type="radio"
                    value=""
                    name="default-radio"
                    class="w-4 h-4 bg-gray-100 border-gray-300 focus:outline-none dark:bg-gray-700 dark:border-gray-600"
                  />
                  <label
                    for="default-radio-1"
                    class="ms-2 text-sm font-medium text-gray-900 dark:text-gray-500 peer-checked:text-[#028FA3]"
                  >
                    Sales Visit
                  </label>
                </div>
                <div class="flex items-center mb-2">
                  <input
                    id="default-radio-1"
                    type="radio"
                    value=""
                    name="default-radio"
                    class="w-4 h-4 bg-gray-100 border-gray-300 focus:outline-none dark:bg-gray-700 dark:border-gray-600"
                  />
                  <label
                    for="default-radio-1"
                    class="ms-2 text-sm font-medium text-gray-900 dark:text-gray-500 peer-checked:text-[#028FA3]"
                  >
                    Client Visit
                  </label>
                </div>
              </div>
            </div>

            <div className="relative p-2 flex flex-col">
              <div className="mt-2">
                <textarea
                  placeholder="Please mention the reason for cancelling the request here."
                  className="mt-3 w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:border-[#028FA3]"
                  rows={4}
                />
              </div>
            </div>
            {/*footer*/}
            <div className="flex items-center justify-center rounded-b">
              <button
                className="bg-[#028fa3] text-white active:bg-[#028fa3] text-sm px-2 py-3 rounded outline-none focus:outline-none ease-linear transition-all duration-150 w-[40%] mb-2"
                type="button"
                onClick={onClose}
              >
                Cancel Request
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CancelModal;
