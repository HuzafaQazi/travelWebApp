import Signin from "@/pages/login";
import { useState } from "react";
import Popup from "reactjs-popup";

const PopupExample = () => {
  const [isOpen, setIsOpen] = useState(false);

  const openPopup = () => {
    setIsOpen(true);
  };

  const closePopup = () => {
    setIsOpen(false);
  };

  return (
    <div>
      <button onClick={openPopup}>Open Popup</button>

      <Popup
        open={isOpen}
        style={{ zIndex: 100000 }}
        contentStyle={{ width: "65%", innerHeight: "800px" }}
        onClose={closePopup}
      >
        <div>
          <Signin />
        </div>
      </Popup>
    </div>
  );
};

export default PopupExample;
