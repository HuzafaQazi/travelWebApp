import { toast, Bounce } from "react-toastify";
// import "react-toastify/dist/ReactToastify.css";

let activeToastId = null;

const showToast = (type = "", message = "", config = {}) => {
  const toastConfig = {
    position: "top-right",
    autoClose: 5000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
    progress: undefined,
    theme: "light",
    transition: Bounce,
    onClose: () => {
      activeToastId = null;
    }, // Reset active toast ID when toast is closed
    ...config, // Merge with custom config
  };

  // If a toast is already active, update it
  if (activeToastId) {
    toast.update(activeToastId, {
      ...toastConfig,
      render: message, // Update the message content
      type, // Update the toast type
    });
  } else {
    // If no toast is active, create a new one
    switch (type) {
      case "success":
        activeToastId = toast.success(message, toastConfig);
        break;
      case "error":
        activeToastId = toast.error(message, toastConfig);
        break;
      case "info":
        activeToastId = toast.info(message, toastConfig);
        break;
      case "warning":
        activeToastId = toast.warning(message, toastConfig);
        break;
      default:
        activeToastId = toast(message, toastConfig);
        break;
    }
  }
};

export default showToast;
