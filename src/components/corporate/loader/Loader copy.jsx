const Loader = () => {
  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-gray-900 bg-opacity-50">
      <div className="flex items-center justify-center space-x-4 p-6 bg-white rounded-lg shadow-lg">
        <div className="w-4 h-4 bg-blue-500 rounded-full animate-pulse"></div>
        <div className="w-4 h-4 bg-green-500 rounded-full animate-pulse"></div>
        <div className="w-4 h-4 bg-yellow-500 rounded-full animate-pulse"></div>
        <p className="text-gray-800 font-semibold">Loading...</p>
      </div>
    </div>
  );
};

export default Loader;
