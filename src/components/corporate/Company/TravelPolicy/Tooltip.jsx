import React from "react";

const Tooltip = ({ content }) => {
  return (
    <div className="absolute z-50 hidden group-hover:block bg-white w-[140px] sm:w-[200px] text-black border-1 border-[#028fa350] text-xs rounded px-2 py-1 top-3 left-1/2 transform -translate-x-1/2">
      {content}
    </div>
  );
};

export default Tooltip;
