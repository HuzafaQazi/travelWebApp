const RequestCardSkeleton = ({ count = 1, type = "default" }) => {
  return (
    <div className="flex gap-3">
      {[...Array(count)].map((_, index) => (
        <div
          key={index}
          className="w-[30%] bg-white shadow-md p-4 rounded-lg animate-pulse flex flex-col justify-between"
        >
          {/* Image Placeholder */}
          <div className="h-36 bg-gray-200 rounded-lg"></div>

          {/* Title and Subtitles */}
          <div className="mt-4">
            <div className="h-5 bg-gray-200 rounded-md w-3/4 mb-3"></div>
            <div className="h-4 bg-gray-200 rounded-md w-2/3 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded-md w-1/2"></div>
          </div>

          {/* Buttons based on type */}
          {type === "proceed" && (
            <div className="mt-4">
              <div className="h-10 bg-gray-200 rounded-md w-full"></div>
            </div>
          )}
          {type === "approval" && (
            <div className="mt-4 flex gap-2">
              <div className="h-10 bg-gray-200 rounded-md w-1/2"></div>
              <div className="h-10 bg-gray-200 rounded-md w-1/2"></div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default RequestCardSkeleton;
