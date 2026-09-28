const FilterNoResultsMessage = ({ onOpenFilters }) => (
  <div className="flex flex-col items-center justify-center py-12 px-4">
    <div className="text-center max-w-md">
      <div className="text-6xl mb-4">🔍</div>
      <h3 className="text-xl font-semibold text-gray-800 mb-2">
        No Flights Match Your Filters
      </h3>
      <p className="text-gray-600 mb-6">
        Your current filter settings are too restrictive. Try adjusting some
        filters to see more flight options.
      </p>
      {/* Mobile only button */}
      <div className="md:hidden">
        <button
          onClick={onOpenFilters}
          className="bg-[#155EEF] text-white px-6 py-2 rounded-md hover:bg-[#027a8c] transition-colors"
        >
          Adjust Filters
        </button>
      </div>
    </div>
  </div>
);

export default FilterNoResultsMessage;
