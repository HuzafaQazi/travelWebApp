import React, { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

const PortalTooltip = ({ children, show, text }) => {
  const [mounted, setMounted] = useState(false);
  const elRef = useRef(null);

  useEffect(() => {
    elRef.current = document.createElement("div");
    document.body.appendChild(elRef.current);
    setMounted(true);

    return () => {
      document.body.removeChild(elRef.current);
    };
  }, []);

  return (
    <>
      {children}
      {show &&
        mounted &&
        createPortal(
          <div
            className="
            fixed z-50 
            left-1/2 top-1/2 
            px-4 py-2 rounded-lg shadow-lg
            bg-gray-800 text-white text-sm
            whitespace-nowrap
          "
          >
            {text}
          </div>,
          elRef.current
        )}
    </>
  );
};

export default PortalTooltip;
