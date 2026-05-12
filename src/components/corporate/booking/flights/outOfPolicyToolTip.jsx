import React from "react";

const Tooltip = ({ content }) => {
  return (
    <div
      className="
    text-left
      absolute
      z-50
      w-60
      left-1/5
      transform
      -translate-x-1/2
      bottom-full
      mb-2
      bg-gray-700
      text-white
      text-xs
      rounded-md
      px-3
      py-2
      pointer-events-none
      shadow-lg
      whitespace-normal
      before:content-['']
      before:absolute
      before:left-1/2
      before:top-full
      before:-translate-x-1/2
      before:border-4
      before:border-transparent
      before:border-t-gray-700
    "
    >
      {content ||
        "Only in-policy bookings can be booked. Choose another flight within the policy."}
    </div>
  );
};

export default Tooltip;
