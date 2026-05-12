import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faClock } from "@fortawesome/free-solid-svg-icons";

const ApprovalStatusSkeleton = () => {
  return (
    <div className="bg-[#E5E9EB] p-4 pt-8 pb-52 animate-pulse">
      <div className="flex gap-4 mt-4">
        {/* Left Section */}
        <div className="w-2/3 space-y-4">
          {/* Travel Request Status Skeleton */}
          <div className="bg-white p-4 rounded-lg space-y-4">
            <div className="h-6 w-1/3 bg-gray-200 rounded"></div>
          </div>

          {/* Waiting Time Skeleton */}
          <div className="bg-white p-4 rounded-lg font-medium text-sm space-y-4">
            <div className="flex items-center gap-2">
              <FontAwesomeIcon icon={faClock} color="#7E0ED6" />
              <div className="h-4 w-1/2 bg-gray-200 rounded"></div>
            </div>
          </div>

          {/* Approver Details Skeleton */}
          <div className="bg-white p-4 mt-2 rounded-lg space-y-4">
            <div className="h-6 w-1/2 bg-gray-200 rounded"></div>
            {[...Array(3)].map((_, idx) => (
              <div key={idx} className="flex gap-4 items-center">
                <div className="h-10 w-10 bg-gray-200 rounded-full"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-1/3 bg-gray-200 rounded"></div>
                  <div className="h-4 w-1/4 bg-gray-200 rounded"></div>
                </div>
              </div>
            ))}
          </div>

          {/* Traveller Details Skeleton */}
          <div className="bg-white p-4 rounded-lg space-y-4">
            <div className="h-6 w-1/3 bg-gray-200 rounded"></div>
            {[...Array(2)].map((_, idx) => (
              <div key={idx} className="flex gap-4">
                <div className="h-10 w-1/2 bg-gray-200 rounded"></div>
                <div className="h-10 w-1/2 bg-gray-200 rounded"></div>
              </div>
            ))}
          </div>

          {/* GST Details Skeleton */}
          <div className="bg-white p-4 rounded-lg space-y-4">
            <div className="h-6 w-1/2 bg-gray-200 rounded"></div>
            <div className="h-10 w-full bg-gray-200 rounded"></div>
          </div>

          {/* Cancellation Policy Skeleton */}
          <div className="bg-white p-4 rounded-lg space-y-4">
            <div className="h-6 w-1/2 bg-gray-200 rounded"></div>
            {[...Array(3)].map((_, idx) => (
              <div key={idx} className="h-4 w-full bg-gray-200 rounded"></div>
            ))}
          </div>

          {/* Action Button Skeleton */}
          <div className="p-4 mt-2">
            <div className="w-1/4 h-10 bg-gray-200 rounded-full"></div>
          </div>
        </div>

        {/* Right Section - Hotel Review Skeleton */}
        <div className="w-1/3 space-y-4">
          {/* Cancel Request Button Skeleton */}
          <div className="h-12 bg-gray-200 rounded-lg"></div>

          {/* Hotel Review Skeleton */}
          <div className="bg-white p-4 rounded-lg space-y-4">
            <div className="h-6 w-2/3 bg-gray-200 rounded"></div>
            <div className="h-48 w-full bg-gray-200 rounded-lg"></div>
            <div className="h-4 w-3/4 bg-gray-200 rounded"></div>
            <div className="h-4 w-1/2 bg-gray-200 rounded"></div>

            {/* Price Breakup Skeleton */}
            <div className="space-y-3">
              <div className="h-6 w-1/3 bg-gray-200 rounded"></div>
              <div className="flex justify-between">
                <div className="h-4 w-1/2 bg-gray-200 rounded"></div>
                <div className="h-4 w-1/4 bg-gray-200 rounded"></div>
              </div>
              <div className="flex justify-between">
                <div className="h-4 w-1/2 bg-gray-200 rounded"></div>
                <div className="h-4 w-1/4 bg-gray-200 rounded"></div>
              </div>
              <div className="flex justify-between">
                <div className="h-4 w-1/2 bg-gray-200 rounded"></div>
                <div className="h-4 w-1/4 bg-gray-200 rounded"></div>
              </div>
              <div className="flex justify-between">
                <div className="h-4 w-1/2 bg-gray-200 rounded"></div>
                <div className="h-4 w-1/4 bg-gray-200 rounded"></div>
              </div>
            </div>

            {/* Total Amount Skeleton */}
            <div className="flex justify-between">
              <div className="h-6 w-1/2 bg-gray-200 rounded"></div>
              <div className="h-6 w-1/4 bg-gray-200 rounded"></div>
            </div>

            {/* Price Increase Notice Skeleton */}
            <div className="h-8 w-full bg-[#E729291A] rounded-lg"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ApprovalStatusSkeleton;
