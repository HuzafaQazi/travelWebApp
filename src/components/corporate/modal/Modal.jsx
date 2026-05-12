import PropTypes from "prop-types";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTimes } from "@fortawesome/free-solid-svg-icons";
import { useEffect, useRef } from "react";

const Modal = ({ title, children, onClose, actions }) => {
  const popupRef = useRef(null);

  useEffect(() => {
    const handleBodyScroll = () => {
      document.body.style.overflow = popupRef ? "hidden" : "auto";
    };

    handleBodyScroll();
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [popupRef]);

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

  return (
    <div className="fixed inset-0 z-50 flex justify-center items-center bg-black/20">
      {/* Modal Container */}
      <div
        className="relative bg-white rounded-2xl shadow-xl p-8 w-full max-w-lg mx-4 sm:mx-auto transform transition-transform duration-300"
        ref={popupRef}
      >
        {/* Modal Header */}
        <div className="flex justify-between items-center border-b pb-4 mb-6">
          <h2 className="text-2xl font-semibold text-gray-800">{title}</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-red-500 transition-colors duration-200"
          >
            <FontAwesomeIcon icon={faTimes} className="text-xl" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="text-gray-600 text-lg leading-relaxed">{children}</div>

        {/* Modal Actions */}
        <div className="flex justify-end gap-4 mt-6">{actions}</div>
      </div>
    </div>
  );
};

Modal.propTypes = {
  title: PropTypes.string.isRequired,
  children: PropTypes.node.isRequired,
  onClose: PropTypes.func.isRequired,
  actions: PropTypes.node.isRequired,
};

export default Modal;
