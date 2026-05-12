const FlightConfirmationSkeleton = () => {
  return (
    <div className="bg-[#E5E9EB] h-96 flex gap-3 flex-1 pt-20 px-2">
      <div className="bg-white w-full h-fit overflow-y-scroll p-3 pt-5 mt-3 rounded-md">
        <div className="flex gap-2 mb-4">
          <div className="min-w-fit h-10 w-10 bg-gray-300 rounded-full" />
          <div className="flex flex-col gap-2 w-full">
            <div className="w-1/2 h-4 bg-gray-300 rounded-md" />
            <div className="w-2/3 h-3 bg-gray-300 rounded-md" />
            <div className="w-full h-2 bg-gray-200 rounded-md" />
          </div>
          <div className="ml-auto flex gap-2">
            <div className="bg-gray-300 w-20 h-8 rounded-md" />
            <div className="bg-gray-300 w-20 h-8 rounded-md" />
          </div>
        </div>

        {/* Booking Details */}
        <div className="border-[1px] border-gray-200 rounded-xl mt-3 p-3">
          <div className="w-1/4 h-5 bg-gray-300 rounded-md mb-2" />
          <div className="flex gap-5 mt-2">
            <div className="w-1/3 h-4 bg-gray-200 rounded-md" />
            <div className="w-1/3 h-4 bg-gray-200 rounded-md" />
          </div>
        </div>

        {/* Flight Details */}
        <div className="border-[1px] border-gray-200 rounded-xl mt-3 p-3">
          <div className="w-1/3 h-5 bg-gray-300 rounded-md mb-2" />
          <div className="flex justify-between gap-4">
            <div className="w-1/4 h-16 bg-gray-200 rounded-md" />
            <div className="w-1/4 h-8 bg-gray-200 rounded-md" />
            <div className="w-1/4 h-16 bg-gray-200 rounded-md" />
          </div>
          <div className="w-full h-1 mt-4 bg-gray-200 rounded-full" />
        </div>

        {/* Price Details */}
        <div className="border-[1px] border-gray-200 rounded-md mt-3 p-3">
          <div className="w-1/4 h-5 bg-gray-300 rounded-md mb-2" />
          <div className="flex flex-col gap-2 mt-2">
            <div className="w-2/3 h-4 bg-gray-200 rounded-md" />
            <div className="w-2/3 h-4 bg-gray-200 rounded-md" />
            <div className="w-1/2 h-5 bg-gray-300 rounded-md mt-4" />
          </div>
        </div>

        {/* Traveler Details */}
        <div className="border-[1px] border-gray-200 rounded-md mt-3 p-3">
          <div className="w-1/4 h-5 bg-gray-300 rounded-md mb-2" />
          <div className="w-full h-16 bg-gray-200 rounded-md" />
        </div>

        {/* GST Details */}
        <div className="border-[1px] border-gray-200 rounded-md mt-3 p-3 bg-white">
          <div className="w-1/4 h-5 bg-gray-300 rounded-md mb-2" />
          <div className="flex flex-col gap-2">
            <div className="w-2/3 h-4 bg-gray-200 rounded-md" />
            <div className="w-2/3 h-4 bg-gray-200 rounded-md" />
            <div className="w-2/3 h-4 bg-gray-200 rounded-md" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default FlightConfirmationSkeleton;
