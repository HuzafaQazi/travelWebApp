import { useState } from "react";

export default function CancelBooking({ isOpen, onClose, onCancelRequest }) {
  const [selectedOption, setSelectedOption] = useState("");

  const [message, setMessage] = useState("");

  const handleOptionChange = (event) => {
    setSelectedOption(event.target.value);
  };

  const handleMessageChange = (event) => {
    setMessage(event.target.value);
  };

  const handleCancelRequest = () => {
    // Add cancellation logic here
    onCancelRequest();
    onClose();
  };

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
        <div className="bg-white p-6 pt-1 rounded-lg shadow-lg max-w-lg w-2/5">
          <div className="w-full flex justify-end">
            <div
              className="px-2 rounded-full bg-gray-600 w-fit text-white"
              onClick={onClose}
            >
              x
            </div>
          </div>
          <div className="text-base font-medium">
            Are you sure you want to cancel your Travel Request ?
          </div>
          <div className="mb-6 text-xs font-light">
            If you cancel your request, Your approver will be notified about the
            cancellation.
          </div>
          <div>
            <div>Reason for Cancellation</div>
            <div className="mt-2 flex flex-col gap-2">
              <div className="flex items-center space-x-2">
                <input
                  type="radio"
                  id="option1"
                  name="radioGroup"
                  value="option1"
                  checked={selectedOption === "option1"}
                  onChange={handleOptionChange}
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300"
                />
                <label
                  htmlFor="option1"
                  className="text-sm font-light text-gray-700"
                >
                  Travel dates changed
                </label>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="radio"
                  id="option2"
                  name="radioGroup"
                  value="option2"
                  checked={selectedOption === "option2"}
                  onChange={handleOptionChange}
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300"
                />
                <label
                  htmlFor="option2"
                  className="text-sm font-light text-gray-700"
                >
                  Trip got cancelled
                </label>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="radio"
                  id="option3"
                  name="radioGroup"
                  value="option3"
                  checked={selectedOption === "option3"}
                  onChange={handleOptionChange}
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300"
                />

                <label
                  htmlFor="option3"
                  className="text-sm font-light text-gray-700"
                >
                  Others
                </label>
              </div>
            </div>
          </div>
          <div className="mt-2">
            <textarea
              id="message"
              rows="4"
              class="block p-2.5 w-full text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300"
              placeholder="Please mention the reason for cancelling the request here."
            ></textarea>
            <div className="text-xs font-light">
              This message will be included in the email.
            </div>
          </div>
          <div className="w-full flex items-center justify-center mt-5">
            <button
              className="px-4 py-2 bg-[#155EEF] text-white rounded-md"
              onClick={() => {
                // Add cancellation logic here
                closeModal();
              }}
            >
              Cancel Request
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
