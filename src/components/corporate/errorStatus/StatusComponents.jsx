// StatusComponents.js
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faExclamationCircle,
  faInfoCircle,
} from "@fortawesome/free-solid-svg-icons";
import "tailwindcss/tailwind.css";

const StatusMessage = ({ icon, color, title, message }) => (
  <div className="flex items-center justify-center h-screen bg-gray-100">
    <div className="text-center p-8 bg-white rounded-lg shadow-md max-w-md w-full">
      <div className={`text-${color}-500 text-5xl mb-4`}>
        <FontAwesomeIcon icon={icon} />
      </div>
      <h2 className={`text-2xl font-bold text-${color}-600 mb-2`}>{title}</h2>
      <p className="text-gray-600">{message}</p>
    </div>
  </div>
);

export const ErrorMessage = ({ message,title }) => (
  <StatusMessage
    icon={faExclamationCircle}
    color="red"
    title={title}
    message={message}
  />
);

export const NoDataMessage = ({ message, title }) => (
  <StatusMessage
    icon={faInfoCircle}
    color="red"
    title={title}
    message={message}
  />
);
