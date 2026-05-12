const FlightListingSkeleton = () => {
  return (
    <div className="flex flex-col h-screen">
      {/* Main Content */}
      <div className="flex-1 overflow-y-auto pt-[1rem]">
        <div className="max-w-7xl mx-auto px-4 flex gap-6">
          {/* Filter Section Skeleton */}
          <div className="w-80 flex-shrink-0">
            <div className="bg-white rounded-lg shadow-sm p-5 space-y-6">
              {/* Departure and Arrival Filters */}
              <div className="space-y-4">
                <div className="w-32 h-5 bg-gray-200 rounded animate-pulse"></div>
                <div className="space-y-3">
                  <div className="w-full h-10 bg-gray-200 rounded animate-pulse"></div>
                  <div className="w-full h-10 bg-gray-200 rounded animate-pulse"></div>
                </div>
              </div>

              <div className="w-full h-px bg-gray-100"></div>

              {/* Airline Filter */}
              <div className="space-y-4">
                <div className="w-32 h-5 bg-gray-200 rounded animate-pulse"></div>
                <div className="space-y-3">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <div className="w-4 h-4 bg-gray-200 rounded animate-pulse"></div>
                      <div className="w-32 h-4 bg-gray-200 rounded animate-pulse"></div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="w-full h-px bg-gray-100"></div>

              {/* Stopover Options */}
              <div className="space-y-4">
                <div className="w-32 h-5 bg-gray-200 rounded animate-pulse"></div>
                <div className="space-y-3">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <div className="w-4 h-4 bg-gray-200 rounded animate-pulse"></div>
                      <div className="w-24 h-4 bg-gray-200 rounded animate-pulse"></div>
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

            {/* Flight Cards */}
            <div className="space-y-4">
              {[...Array(5)].map((_, index) => (
                <div
                  key={index}
                  className="bg-white rounded-lg shadow-sm p-5 hover:shadow-md transition-shadow duration-200"
                >
                  <div className="flex gap-5">
                    {/* Logo Section */}
                    <div className="relative flex-shrink-0">
                      <div className="w-16 h-16 bg-gray-200 rounded-full animate-pulse"></div>
                    </div>

                    {/* Flight Details */}
                    <div className="flex-1 flex">
                      {/* Flight Info */}
                      <div className="flex-1 space-y-4">
                        {/* Airline Name & Flight Number */}
                        <div className="space-y-2">
                          <div className="h-6 bg-gray-200 rounded w-3/4 animate-pulse"></div>
                          <div className="flex items-center gap-2">
                            {/* <Airplane className="w-4 h-4 text-gray-200" /> */}
                            <div className="w-20 h-4 bg-gray-200 rounded animate-pulse"></div>
                          </div>
                        </div>

                        {/* Departure and Arrival */}
                        <div className="flex justify-between">
                          <div className="space-y-1">
                            <div className="h-4 bg-gray-200 rounded w-16 animate-pulse"></div>
                            <div className="h-4 bg-gray-200 rounded w-24 animate-pulse"></div>
                          </div>
                          <div className="space-y-1">
                            <div className="h-4 bg-gray-200 rounded w-16 animate-pulse"></div>
                            <div className="h-4 bg-gray-200 rounded w-24 animate-pulse"></div>
                          </div>
                        </div>

                        {/* Flight Duration */}
                        <div className="h-4 bg-gray-200 rounded w-1/2 animate-pulse"></div>

                        {/* Amenities */}
                        <div className="flex flex-wrap gap-2">
                          {[...Array(3)].map((_, i) => (
                            <div
                              key={i}
                              className="h-6 bg-gray-200 rounded w-20 animate-pulse"
                            ></div>
                          ))}
                        </div>
                      </div>

                      {/* Price Section */}
                      <div className="w-32 flex flex-col items-end justify-between">
                        <div className="text-right space-y-1">
                          <div className="h-6 bg-gray-200 rounded w-20 animate-pulse"></div>
                          <div className="h-4 bg-gray-200 rounded w-16 animate-pulse"></div>
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

export default FlightListingSkeleton;
