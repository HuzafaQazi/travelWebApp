const FlightReviewSkeleton = () => {
  return (
    <div className="animate-pulse space-y-4">
      {/* Stepper */}
      <div className="bg-white w-full h-14 mt-2 sticky top-0 left-0 z-[999] flex justify-center">
        <div className="flex items-center justify-center space-x-5">
          <div className="flex items-center space-x-2">
            <div className="rounded-full w-5 h-5 bg-gray-300" />
            <span className="w-24 h-5 bg-gray-300 rounded-md" />
          </div>
          <div className="w-12 h-[1px] bg-gray-300 mx-4" />
          <div className="flex items-center space-x-2">
            <div className="rounded-full w-5 h-5 bg-gray-300" />
            <span className="w-24 h-5 bg-gray-300 rounded-md" />
          </div>
          <div className="w-12 h-[1px] bg-gray-300 mx-4" />
          <div className="flex items-center space-x-2">
            <div className="rounded-full w-5 h-5 bg-gray-300" />
            <span className="w-24 h-5 bg-gray-300 rounded-md" />
          </div>
        </div>
      </div>

      {/* Review Booking Section */}
      <div className="bg-[#E5E9EB] h-full flex gap-3 flex-1 pt-3 px-4">
        <div className="w-4/6 mt-2 space-y-4">
          {/* Approver Section */}
          <div className="bg-white p-4 rounded-lg">
            <div className="h-5 w-40 bg-gray-300 rounded-md mb-2" />
            <div className="space-y-2">
              <div className="w-full h-4 bg-gray-300 rounded-md" />
              <div className="w-full h-4 bg-gray-300 rounded-md" />
            </div>
          </div>

          {/* Flight Information */}
          <div className="bg-white p-4 rounded-md mt-2">
            <div className="h-5 w-48 bg-gray-300 rounded-md mb-2" />
            <div className="space-y-2">
              <div className="w-full h-4 bg-gray-300 rounded-md" />
              <div className="w-full h-4 bg-gray-300 rounded-md" />
            </div>
          </div>

          {/* Traveler Details Form */}
          <div className="bg-white p-4 rounded-md mt-2">
            <div className="h-5 w-48 bg-gray-300 rounded-md mb-2" />
            <div className="space-y-2">
              <div className="w-full h-4 bg-gray-300 rounded-md" />
              <div className="w-full h-4 bg-gray-300 rounded-md" />
              <div className="w-full h-4 bg-gray-300 rounded-md" />
            </div>
          </div>

          {/* Contact Details */}
          <div className="bg-white p-4 rounded-md mt-2 flex items-center gap-3">
            <div className="w-2/6 space-y-2">
              <div className="h-5 bg-gray-300 rounded-md mb-2 w-32" />
              <div className="w-full h-4 bg-gray-300 rounded-md" />
            </div>
            <div className="w-2/6">
              <div className="w-full h-10 bg-gray-300 rounded-md" />
            </div>
            <div className="w-2/6">
              <div className="w-full h-10 bg-gray-300 rounded-md" />
            </div>
          </div>

          {/* Add-ons Section */}
          <div className="bg-white p-4 rounded-md mt-2">
            <div className="h-5 w-48 bg-gray-300 rounded-md mb-2" />
            <div className="space-y-2">
              <div className="w-full h-10 bg-gray-300 rounded-md" />
              <div className="w-full h-10 bg-gray-300 rounded-md" />
              <div className="w-full h-10 bg-gray-300 rounded-md" />
            </div>
          </div>

          {/* GST Details */}
          <div className="bg-white p-4 rounded-md mt-2">
            <div className="h-5 w-48 bg-gray-300 rounded-md mb-2" />
            <div className="space-y-2">
              <div className="w-full h-4 bg-gray-300 rounded-md" />
              <div className="w-full h-4 bg-gray-300 rounded-md" />
              <div className="w-full h-4 bg-gray-300 rounded-md" />
            </div>
          </div>

          {/* Request Approval Button */}
          <div className="w-36 h-10 bg-gray-300 rounded-full mt-4" />
        </div>

        {/* Fare Summary */}
        <div className="w-2/6 bg-white p-3 rounded-md mt-2 space-y-4">
          <div className="h-5 w-32 bg-gray-300 rounded-md mb-2" />
          <div className="space-y-2">
            <div className="w-full h-4 bg-gray-300 rounded-md" />
            <div className="w-full h-4 bg-gray-300 rounded-md" />
            <div className="w-full h-4 bg-gray-300 rounded-md" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default FlightReviewSkeleton;
