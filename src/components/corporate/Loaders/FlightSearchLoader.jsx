// components/FlightSearchProgressLoader.jsx
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSpinner } from "@fortawesome/free-solid-svg-icons";

const FlightSearchProgressLoader = ({
  loading = false,
  progress = 0,
  message = "Searching flights...",
}) => {
  if (!loading) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4 shadow-2xl">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
            <FontAwesomeIcon
              icon={faSpinner}
              className="w-8 h-8 text-blue-600 animate-spin"
            />
          </div>
          <h3 className="text-lg font-semibold text-gray-900">
            Finding the Best Flights
          </h3>
        </div>

        {/* Progress Bar */}
        <div className="mb-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-gray-600">{message}</span>
            <span className="text-sm text-gray-500">
              {Math.round(progress)}%
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${Math.max(progress, 5)}%` }}
            />
          </div>
        </div>

        {/* Status Messages */}
        <div className="space-y-2 mb-6">
          <div
            className={`flex items-center text-sm ${
              progress > 15 ? "text-green-600" : "text-gray-400"
            }`}
          >
            <div
              className={`w-4 h-4 mr-2 rounded-full ${
                progress > 15 ? "bg-green-600" : "bg-gray-300"
              } flex items-center justify-center`}
            >
              {progress > 15 && <span className="text-white text-xs">✓</span>}
            </div>
            Contacting flight providers
          </div>

          <div
            className={`flex items-center text-sm ${
              progress > 60 ? "text-green-600" : "text-gray-400"
            }`}
          >
            <div
              className={`w-4 h-4 mr-2 rounded-full ${
                progress > 60 ? "bg-green-600" : "bg-gray-300"
              } flex items-center justify-center`}
            >
              {progress > 60 && <span className="text-white text-xs">✓</span>}
            </div>
            Processing flight options
          </div>

          <div
            className={`flex items-center text-sm ${
              progress > 90 ? "text-green-600" : "text-gray-400"
            }`}
          >
            <div
              className={`w-4 h-4 mr-2 rounded-full ${
                progress > 90 ? "bg-green-600" : "bg-gray-300"
              } flex items-center justify-center`}
            >
              {progress > 90 && <span className="text-white text-xs">✓</span>}
            </div>
            Preparing results
          </div>
        </div>

        {/* Tips */}
        <div className="bg-blue-50 rounded-lg p-4">
          <p className="text-sm text-blue-800">
            💡 We{"'"}re searching multiple airlines to find you the best deals
            and flight times.
          </p>
        </div>
      </div>
    </div>
  );
};

export default FlightSearchProgressLoader;
