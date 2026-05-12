/**
 * Renders a single chat message bubble.
 * Handles: user message, bot text, confirmation card, payment link card.
 */
export default function ChatMessage({ message, onConfirm }) {
  const { sender, text, type, paymentLink, confirmText, isStreaming } = message;

  if (sender === "user") {
    return (
      <div className="flex justify-end">
        <div className="bg-blue-600 text-white rounded-2xl rounded-br-none px-4 py-2 text-sm max-w-[80%] whitespace-pre-wrap break-words">
          {text}
        </div>
      </div>
    );
  }

  // Payment link card
  if (type === "payment" && paymentLink) {
    return (
      <div className="flex justify-start max-w-[90%]">
        <div className="bg-gradient-to-br from-blue-500 to-purple-600 text-white rounded-2xl rounded-bl-none p-4 shadow-md w-full">
          {text && <p className="text-sm mb-3 whitespace-pre-wrap">{text}</p>}
          <a
            href={paymentLink}
            target="_blank"
            rel="noopener noreferrer"
            className="block w-full text-center bg-white text-blue-700 font-semibold rounded-xl py-2 px-4 text-sm hover:bg-blue-50 transition-colors"
          >
            Complete Payment
          </a>
        </div>
      </div>
    );
  }

  // Confirmation card
  if (type === "confirm") {
    return (
      <div className="flex justify-start max-w-[90%]">
        <div className="bg-white border border-gray-200 rounded-2xl rounded-bl-none p-4 shadow-sm w-full">
          {(confirmText || text) && (
            <p className="text-sm text-gray-800 mb-3 whitespace-pre-wrap">
              {confirmText || text}
            </p>
          )}
          <div className="flex gap-2">
            <button
              className="flex-1 bg-green-500 hover:bg-green-600 text-white text-sm font-medium rounded-xl py-2 transition-colors"
              onClick={() => onConfirm?.("yes")}
            >
              Yes, proceed
            </button>
            <button
              className="flex-1 bg-red-100 hover:bg-red-200 text-red-700 text-sm font-medium rounded-xl py-2 transition-colors"
              onClick={() => onConfirm?.("no")}
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Regular bot message (plain text)
  return (
    <div className="flex justify-start">
      <div
        className={`bg-white text-gray-800 rounded-2xl rounded-bl-none px-4 py-3 text-sm max-w-[85%] shadow-sm whitespace-pre-wrap break-words ${
          isStreaming ? "opacity-80" : ""
        }`}
      >
        {text || <span className="text-gray-400 italic">…</span>}
      </div>
    </div>
  );
}
