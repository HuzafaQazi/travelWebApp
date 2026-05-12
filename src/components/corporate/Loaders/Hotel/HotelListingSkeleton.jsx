import { Star } from "lucide-react";

const HotelListingSkeleton = () => {
  return (
    <div className="flex flex-col h-screen">

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-7xl mx-auto px-4 flex gap-6">
          {/* Filter Section Skeleton */}
          <div className="w-80 flex-shrink-0">
            <div className="bg-white rounded-lg shadow-sm p-5 space-y-6">
              {/* Price Range Filter */}
              <div className="space-y-4">
                <div className="w-24 h-5 bg-gray-200 rounded animate-pulse"></div>
                <div className="space-y-3">
                  <div className="w-full h-2 bg-gray-200 rounded animate-pulse"></div>
                  <div className="flex justify-between">
                    <div className="w-20 h-4 bg-gray-200 rounded animate-pulse"></div>
                    <div className="w-20 h-4 bg-gray-200 rounded animate-pulse"></div>
                  </div>
                </div>
              </div>

              <div className="w-full h-px bg-gray-100"></div>

              {/* Popular Filters */}
              <div className="space-y-4">
                <div className="w-32 h-5 bg-gray-200 rounded animate-pulse"></div>
                <div className="space-y-3">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <div className="w-4 h-4 bg-gray-200 rounded animate-pulse"></div>
                      <div className="flex justify-between w-full">
                        <div className="w-32 h-4 bg-gray-200 rounded animate-pulse"></div>
                        <div className="w-12 h-4 bg-gray-200 rounded animate-pulse"></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="w-full h-px bg-gray-100"></div>

              {/* Star Rating */}
              <div className="space-y-4">
                <div className="w-28 h-5 bg-gray-200 rounded animate-pulse"></div>
                <div className="space-y-3">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <div className="w-4 h-4 bg-gray-200 rounded animate-pulse"></div>
                      <div className="flex items-center gap-1">
                        {[...Array(5 - i)].map((_, j) => (
                          <Star key={j} className="w-4 h-4 text-gray-200" />
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="w-full h-px bg-gray-100"></div>

              {/* Amenities */}
              <div className="space-y-4">
                <div className="w-28 h-5 bg-gray-200 rounded animate-pulse"></div>
                <div className="space-y-3">
                  {[...Array(6)].map((_, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <div className="w-4 h-4 bg-gray-200 rounded animate-pulse"></div>
                      <div className="w-28 h-4 bg-gray-200 rounded animate-pulse"></div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Results Section */}
          <div className="flex-1">
            {/* Results Header */}
            <div className="bg-white rounded-lg shadow-sm p-4 mb-4">
              <div className="flex justify-between items-center">
                <div className="space-y-2">
                  <div className="w-64 h-6 bg-gray-200 rounded animate-pulse"></div>
                  <div className="w-40 h-4 bg-gray-200 rounded animate-pulse"></div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-32 h-9 bg-gray-200 rounded animate-pulse"></div>
                  <div className="w-40 h-9 bg-gray-200 rounded animate-pulse"></div>
                </div>
              </div>
            </div>

            {/* Hotel Cards */}
            <div className="space-y-4">
              {[...Array(5)].map((_, index) => (
                <div
                  key={index}
                  className="bg-white rounded-lg shadow-sm p-5 hover:shadow-md transition-shadow duration-200"
                >
                  <div className="flex gap-5">
                    {/* Image Section */}
                    <div className="relative flex-shrink-0">
                      <div className="w-48 h-48 bg-gray-200 rounded-lg animate-pulse"></div>
                      <div className="absolute top-2 left-2 w-16 h-6 bg-gray-300 rounded animate-pulse"></div>
                    </div>

                    {/* Content Section */}
                    <div className="flex-1 flex">
                      {/* Hotel Details */}
                      <div className="flex-1 space-y-4">
                        {/* Title & Rating */}
                        <div className="space-y-2">
                          <div className="h-6 bg-gray-200 rounded w-3/4 animate-pulse"></div>
                          <div className="flex items-center gap-2">
                            <div className="flex gap-0.5">
                              {[...Array(5)].map((_, i) => (
                                <Star
                                  key={i}
                                  className="w-4 h-4 text-gray-200"
                                />
                              ))}
                            </div>
                            <div className="w-20 h-4 bg-gray-200 rounded animate-pulse"></div>
                          </div>
                        </div>

                        {/* Location */}
                        <div className="h-4 bg-gray-200 rounded w-1/2 animate-pulse"></div>

                        {/* Features */}
                        <div className="flex flex-wrap gap-2">
                          {[...Array(3)].map((_, i) => (
                            <div
                              key={i}
                              className="h-6 bg-gray-200 rounded w-24 animate-pulse"
                            ></div>
                          ))}
                        </div>

                        {/* Description */}
                        <div className="space-y-1">
                          <div className="h-3 bg-gray-200 rounded w-full animate-pulse"></div>
                          <div className="h-3 bg-gray-200 rounded w-5/6 animate-pulse"></div>
                        </div>
                      </div>

                      {/* Price Section */}
                      <div className="w-48 flex flex-col items-end justify-between">
                        <div className="text-right space-y-1">
                          <div className="h-6 bg-gray-200 rounded w-32 animate-pulse"></div>
                          <div className="h-4 bg-gray-200 rounded w-24 animate-pulse"></div>
                        </div>
                        <div className="w-full space-y-2">
                          <div className="h-4 bg-gray-200 rounded w-full animate-pulse"></div>
                          <div className="h-10 bg-gray-200 rounded w-full animate-pulse"></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            <div className="mt-6 flex justify-center items-center gap-2">
              {[...Array(5)].map((_, i) => (
                <div
                  key={i}
                  className="w-10 h-10 bg-gray-200 rounded animate-pulse"
                ></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HotelListingSkeleton;
