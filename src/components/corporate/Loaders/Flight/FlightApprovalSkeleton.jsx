const FlightApprovalSkeleton = () => {
  return (
    <div className="bg-[#E5E9EB] p-4 pt-8 pb-52">
      <div className="flex gap-4 mt-2">
        {/* Left Section */}
        <div className="w-3/4">
          {/* Travel Request Status Skeleton */}
          <div className="h-8 bg-gray-300 animate-pulse rounded-md mb-2" />

          {/* Approver Details Skeleton */}
          <div className="bg-white p-4 mt-2 rounded-lg space-y-4">
            <div className="h-6 bg-gray-300 animate-pulse rounded-md" />
            <div className="h-6 bg-gray-300 animate-pulse rounded-md" />
          </div>

          {/* Flight Details Skeleton */}
          <div className="bg-white rounded-md w-full h-fit p-4 mt-2">
            <div className="h-6 bg-gray-300 animate-pulse rounded-md mb-2" />
            <div className="h-24 bg-gray-200 animate-pulse rounded-md" />
          </div>

          {/* Traveler Details Skeleton */}
          <div className="bg-white rounded-md w-full h-fit p-4 mt-2 space-y-2">
            <div className="h-6 bg-gray-300 animate-pulse rounded-md" />
            <div className="h-6 bg-gray-300 animate-pulse rounded-md" />
            <div className="h-6 bg-gray-300 animate-pulse rounded-md" />
          </div>

          {/* GST Details Skeleton */}
          <div className="border-[1px] border-[#155EEF2E] shadow-[6px_6px_30px_0px_#7D99B40D] rounded-md mt-3 p-3 bg-white space-y-4">
            <div className="h-6 bg-gray-300 animate-pulse rounded-md" />
            <div className="h-6 bg-gray-300 animate-pulse rounded-md" />
          </div>

          {/* Wallet Balance and Action Button Skeleton */}
          <div className="mt-4 space-y-2">
            <div className="h-10 bg-gray-300 animate-pulse rounded-md w-1/2" />
            <div className="h-10 bg-gray-300 animate-pulse rounded-md w-1/3" />
          </div>

          {/* Request Modal Skeleton */}
          <div className="mt-4">
            <div className="h-10 bg-gray-300 animate-pulse rounded-md" />
          </div>

          {/* Cancel Modal Skeleton */}
          <div className="mt-4">
            <div className="h-10 bg-gray-300 animate-pulse rounded-md" />
          </div>
        </div>

        {/* Right Section */}
        <div className="w-2/6 space-y-4">
          <div className="h-10 bg-gray-300 animate-pulse rounded-lg" />
          <div className="w-full mt-3 bg-white p-3 h-fit rounded-md">
            <div className="h-6 bg-gray-300 animate-pulse rounded-md mb-2" />
            <div className="h-20 bg-gray-200 animate-pulse rounded-md" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default FlightApprovalSkeleton;
