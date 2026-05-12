// components/ReviewBookingSkeleton.js

const ReviewBookingSkeleton = () => {
  return (
    <div className="bg-[#E5E9EB] p-4 pb-52 animate-pulse">
      <div className="h-8 w-64 bg-gray-200 rounded mb-6"></div>
      <div className="flex gap-4">
        {/* Left Section */}
        <div className="w-3/4 space-y-4">
          {/* Approver Skeleton */}
          <div className="bg-white p-4 rounded-lg space-y-4">
            <div className="h-6 w-1/2 bg-gray-200 rounded"></div>
            <div className="flex gap-4">
              <div className="h-10 w-10 bg-gray-200 rounded-full"></div>
              <div className="flex-1 space-y-2">
                <div className="h-4 w-1/3 bg-gray-200 rounded"></div>
                <div className="h-4 w-1/4 bg-gray-200 rounded"></div>
              </div>
            </div>
          </div>

          {/* Traveler Details Form Skeleton */}
          <div className="bg-white p-4 rounded-lg space-y-4">
            <div className="h-6 w-1/2 bg-gray-200 rounded"></div>
            {[...Array(2)].map((_, idx) => (
              <div key={idx} className="space-y-4">
                <div className="flex gap-4">
                  <div className="h-10 w-1/3 bg-gray-200 rounded"></div>
                  <div className="h-10 w-1/3 bg-gray-200 rounded"></div>
                  <div className="h-10 w-1/3 bg-gray-200 rounded"></div>
                </div>
                <div className="flex gap-4">
                  <div className="h-10 w-1/2 bg-gray-200 rounded"></div>
                  <div className="h-10 w-1/2 bg-gray-200 rounded"></div>
                </div>
              </div>
            ))}
          </div>

          {/* Contact Details Skeleton */}
          <div className="bg-white p-4 rounded-lg space-y-4">
            <div className="h-6 w-1/2 bg-gray-200 rounded"></div>
            <div className="flex gap-4">
              <div className="h-10 w-1/2 bg-gray-200 rounded"></div>
              <div className="h-10 w-1/2 bg-gray-200 rounded"></div>
            </div>
          </div>

          {/* GST Details Skeleton */}
          <div className="bg-white p-4 rounded-lg space-y-4">
            <div className="h-6 w-1/2 bg-gray-200 rounded"></div>
            <div className="h-10 w-full bg-gray-200 rounded"></div>
          </div>

          {/* Cancellation Policy Skeleton */}
          <div className="bg-white p-4 rounded-lg space-y-4">
            <div className="h-6 w-1/2 bg-gray-200 rounded"></div>
            {[...Array(2)].map((_, idx) => (
              <div key={idx} className="h-4 w-full bg-gray-200 rounded"></div>
            ))}
          </div>

          {/* Proceed Button Skeleton */}
          <div className="p-4 mt-2">
            <div className="flex items-center">
              <div className="w-4 h-4 bg-gray-200 rounded mr-2"></div>
              <div className="h-4 w-3/4 bg-gray-200 rounded"></div>
            </div>
            <div className="mt-8">
              <div className="w-1/4 h-10 bg-gray-200 rounded-full"></div>
            </div>
          </div>
        </div>

        {/* Right Section - Hotel Review Skeleton */}
        <div className="w-2/5 bg-white p-4 rounded-lg h-fit space-y-4">
          <div className="h-6 w-1/2 bg-gray-200 rounded"></div>
          <div className="h-40 w-full bg-gray-200 rounded"></div>
          <div className="h-4 w-3/4 bg-gray-200 rounded"></div>
          <div className="h-4 w-1/2 bg-gray-200 rounded"></div>
          <div className="h-6 w-full bg-gray-200 rounded"></div>
          <div className="h-6 w-full bg-gray-200 rounded"></div>
        </div>
      </div>
    </div>
  );
};

export default ReviewBookingSkeleton;
