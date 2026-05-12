const FlightSearchErrorMessage = ({ error }) => {
  const getErrorIcon = (errorType) => {
    const iconMap = {
      network: "🌐",
      timeout: "⏰",
      server: "🔧",
      validation: "⚠️",
      policy: "📋",
      default: "❌",
    };

    return iconMap[errorType] || iconMap.default;
  };

  const getErrorType = (errorMessage) => {
    const message = errorMessage?.toLowerCase() || "";

    if (message.includes("network") || message.includes("connection"))
      return "network";
    if (message.includes("timeout") || message.includes("expired"))
      return "timeout";
    if (message.includes("server") || message.includes("internal"))
      return "server";
    if (message.includes("policy") || message.includes("out of policy"))
      return "policy";
    if (message.includes("validation") || message.includes("invalid"))
      return "validation";

    return "default";
  };

  const getHelpfulSuggestions = (errorType) => {
    const suggestions = {
      network: [
        "Check your internet connection",
        "Try refreshing the page",
        "Disable any VPN or proxy temporarily",
      ],
      timeout: [
        "The request took too long to complete",
        "Try searching again in a few moments",
        "Consider selecting fewer destinations or travelers",
      ],
      server: [
        "Our servers are experiencing temporary issues",
        "Please wait a few minutes before trying again",
        "Contact support if the problem persists",
      ],
      policy: [
        "Review your travel policy requirements",
        "Adjust your search criteria to meet policy guidelines",
        "Contact your travel administrator for assistance",
      ],
      validation: [
        "Check that all required fields are filled correctly",
        "Verify your dates are in the correct format",
        "Ensure departure date is before return date",
      ],
      default: [
        "Please try your search again",
        "Check that all information is entered correctly",
        "Contact support if the issue continues",
      ],
    };

    return suggestions[errorType] || suggestions.default;
  };

  const errorType = getErrorType(error?.message);
  const suggestions = getHelpfulSuggestions(errorType);

  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 min-h-[500px] bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="text-center max-w-2xl bg-white rounded-xl shadow-lg p-8 border border-gray-200">
        {/* Error Icon */}
        <div className="text-8xl mb-6 animate-pulse">
          {getErrorIcon(errorType)}
        </div>

        {/* Error Title */}
        <h2 className="text-2xl font-bold text-gray-900 mb-3">
          {error?.title || "Search Unavailable"}
        </h2>

        {/* Error Message */}
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <p className="text-red-800 text-base leading-relaxed">
            {error?.message ||
              "We encountered an issue while searching for flights. Please try again."}
          </p>
        </div>

        {/* Helpful Suggestions */}
        <div className="text-left bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-3 flex items-center">
            <span className="mr-2">💡</span>
            What you can try:
          </h3>
          <ul className="space-y-2">
            {suggestions.map((suggestion, index) => (
              <li key={index} className="flex items-start text-blue-800">
                <span className="text-blue-600 mr-2 mt-1">•</span>
                <span className="text-sm leading-relaxed">{suggestion}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Additional Information */}
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6">
          <div className="flex items-center justify-center text-gray-600 text-sm">
            <span className="mr-2">🕒</span>
            <span>Error occurred at {new Date().toLocaleTimeString()}</span>
          </div>
        </div>

        {/* Contact Information */}
        <div className="border-t border-gray-200 pt-6">
          <p className="text-gray-500 text-sm mb-4">
            Need additional help? Our support team is available to assist you.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <div className="flex items-center text-gray-600 text-sm">
              <span className="mr-2">📧</span>
              <span>bookings@qugo.io</span>
            </div>
            <div className="hidden sm:block text-gray-300">|</div>
            <div className="flex items-center text-gray-600 text-sm">
              <span className="mr-2">📞</span>
              <span>1-800-FLIGHTS</span>
            </div>
          </div>
        </div>

        {/* Technical Details (for debugging, can be hidden in production) */}
        {process.env.NODE_ENV === "development" && error?.technical && (
          <details className="mt-6 text-left">
            <summary className="cursor-pointer text-gray-500 text-sm hover:text-gray-700">
              Technical Details (Development Only)
            </summary>
            <pre className="mt-2 p-3 bg-gray-100 rounded text-xs text-gray-700 overflow-auto">
              {JSON.stringify(error.technical, null, 2)}
            </pre>
          </details>
        )}
      </div>
    </div>
  );
};

export default FlightSearchErrorMessage;
