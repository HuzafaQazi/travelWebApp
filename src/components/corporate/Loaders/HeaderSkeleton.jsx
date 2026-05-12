import React from "react";

const HeaderSkeleton = () => {
  return (
    <div className="w-full bg-white">
      <div className="max-w-full mx-auto px-2 py-2 flex justify-between items-center">
        {/* Logo shimmer */}
        <div className="flex flex-col gap-2">
          <div className="h-8 w-32 bg-gray-200 animate-pulse rounded"></div>
          <div className="h-2 w-24 bg-gray-200 animate-pulse rounded"></div>
        </div>

        {/* Middle nav shimmer - Desktop */}
        <div className="hidden md:flex gap-8">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="h-4 w-20 bg-gray-200 animate-pulse rounded"
            ></div>
          ))}
        </div>

        {/* Right side items shimmer */}
        <div className="flex items-center gap-4">
          {/* Wallet shimmer */}
          <div className="hidden md:flex items-center p-2 rounded-2xl border border-gray-200">
            <div className="h-8 w-8 bg-gray-200 animate-pulse rounded-full mr-2"></div>
            <div className="flex flex-col gap-1">
              <div className="h-3 w-16 bg-gray-200 animate-pulse rounded"></div>
              <div className="h-3 w-20 bg-gray-200 animate-pulse rounded"></div>
            </div>
          </div>

          {/* Switch button shimmer */}
          <div className="h-8 w-24 bg-gray-200 animate-pulse rounded-2xl"></div>

          {/* Profile circle shimmer */}
          <div className="h-8 w-8 bg-gray-200 animate-pulse rounded-full"></div>

          {/* Bell icon shimmer */}
          <div className="h-5 w-5 bg-gray-200 animate-pulse rounded-full"></div>
        </div>

        {/* Mobile menu button shimmer */}
        <div className="md:hidden h-6 w-6 bg-gray-200 animate-pulse rounded"></div>
      </div>
    </div>
  );
};

export default HeaderSkeleton;
