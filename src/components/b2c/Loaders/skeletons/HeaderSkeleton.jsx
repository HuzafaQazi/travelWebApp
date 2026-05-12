export default function HeaderSkeleton({ isMobile = false }) {
  if (isMobile) {
    return (
      <div className="flex items-center gap-2 animate-pulse">
        {/* Wallet skeleton */}
        <div className="bg-gray-200 rounded-full w-[28px] h-[28px]"></div>
        {/* Profile skeleton */}
        <div className="bg-gray-200 rounded-full w-[28px] h-[28px]"></div>
      </div>
    );
  }

  return (
    <div className="flex items-center space-x-1 sm:space-x-3 animate-pulse">
      {/* Wallet skeleton */}
      <div className="flex items-center p-1 rounded-xl bg-gray-200 h-[38px] w-[120px]"></div>

      {/* Corporate button skeleton */}
      <div className="flex flex-col items-center bg-gray-200 rounded-lg px-2 py-1 w-[100px] h-[50px]"></div>

      {/* Event button skeleton */}
      <div className="bg-gray-200 rounded-lg w-[60px] h-[35px]"></div>

      {/* User name skeleton */}
      <div className="flex items-center">
        <div className="bg-gray-200 h-4 w-24 rounded mr-2"></div>
        <div className="bg-gray-200 rounded-full w-5 h-5"></div>
      </div>
    </div>
  );
}
