const HotelDetailsSkeleton = () => {
  return (
    <div className="flex flex-col h-[120vh] bg-[#F9FAFB]">
      {/* Main Content Container */}
      <div className="flex flex-1 mb-16 overflow-hidden">
        {/* ViewMore Section */}
        <div className="w-1/2 h-[calc(150vh-17rem)] p-4 overflow-y-auto border-r border-gray-200 bg-white">
          <div className="p-4 bg-white rounded-lg shadow">
            {/* Hotel Name Skeleton */}
            <div className="animate-pulse space-y-4">
              <div className="flex items-center space-x-2">
                <div className="h-8 bg-gray-200 rounded w-3/4" />
                <div className="flex space-x-1">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="w-4 h-4 bg-gray-200 rounded" />
                  ))}
                </div>
              </div>

              {/* Address */}
              <div className="h-4 bg-gray-200 rounded w-1/2" />

              {/* Tabs */}
              <div className="flex gap-20 border-b border-gray-200 pb-2">
                {["About", "Amenities", "Location"].map((tab) => (
                  <div key={tab} className="h-6 bg-gray-200 rounded w-16" />
                ))}
              </div>

              {/* Image Gallery */}
              <div className="flex gap-2">
                <div className="w-1/2">
                  <div className="h-[200px] bg-gray-200 rounded-lg" />
                </div>
                <div className="w-1/2 grid grid-cols-2 gap-2">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="h-[97px] bg-gray-200 rounded-lg" />
                  ))}
                </div>
              </div>

              {/* Content Sections */}
              {[...Array(3)].map((_, i) => (
                <div key={i} className="space-y-2">
                  <div className="h-6 bg-gray-200 rounded w-1/4" />
                  <div className="space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-full" />
                    <div className="h-4 bg-gray-200 rounded w-5/6" />
                    <div className="h-4 bg-gray-200 rounded w-4/6" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ViewRoom Section */}
        <div className="w-1/2 h-[calc(150vh-17rem)] p-4 overflow-y-auto bg-white">
          <div className="p-4 bg-white rounded-lg shadow">
            <div className="animate-pulse space-y-4">
              {/* Room Cards */}
              {[...Array(3)].map((_, i) => (
                <div
                  key={i}
                  className="p-4 border border-gray-200 rounded-lg space-y-4"
                >
                  {/* Room Title */}
                  <div className="h-6 bg-gray-200 rounded w-3/4" />

                  {/* Room Details */}
                  <div className="flex justify-between">
                    <div className="space-y-2 w-2/3">
                      <div className="h-4 bg-gray-200 rounded w-1/2" />
                      <div className="h-4 bg-gray-200 rounded w-full" />
                    </div>
                    <div className="flex flex-col items-end space-y-2">
                      <div className="h-6 bg-gray-200 rounded w-24" />
                      <div className="h-8 bg-gray-200 rounded-full w-24" />
                    </div>
                  </div>

                  {/* Amenities */}
                  <div className="space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-1/4" />
                    <div className="grid grid-cols-2 gap-2">
                      {[...Array(4)].map((_, j) => (
                        <div
                          key={j}
                          className="h-4 bg-gray-200 rounded w-full"
                        />
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HotelDetailsSkeleton;
