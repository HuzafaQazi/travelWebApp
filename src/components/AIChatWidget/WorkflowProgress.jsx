const STAGES = [
  { key: "GREET", label: "Start" },
  { key: "COLLECT_SEARCH_PARAMS", label: "Search" },
  { key: "SHOW_RESULTS", label: "Results" },
  { key: "CONFIRM_SELECTION", label: "Select" },
  { key: "COLLECT_PASSENGERS", label: "Pax" },
  { key: "CONFIRM_PASSENGERS", label: "Confirm" },
  { key: "SHOW_FARE_QUOTE", label: "Fare" },
  { key: "PAYMENT", label: "Pay" },
  { key: "BOOKING_COMPLETE", label: "Done" },
];

/**
 * Horizontal step progress bar showing how far through the booking workflow we are.
 */
export default function WorkflowProgress({ currentStage }) {
  const currentIdx = STAGES.findIndex((s) => s.key === currentStage);

  return (
    <div
      className="bg-gray-50 border-b border-gray-100 px-3 py-2 flex items-center gap-1"
      title={`Step: ${currentStage}`}
    >
      {STAGES.map((stage, i) => {
        const isDone = i < currentIdx;
        const isActive = i === currentIdx;
        return (
          <div
            key={stage.key}
            className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${
              isDone ? "bg-blue-500" : isActive ? "bg-blue-400" : "bg-gray-200"
            }`}
            title={stage.label}
          />
        );
      })}
    </div>
  );
}
