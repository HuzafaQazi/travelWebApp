import SideSheet from "./sideSheet";
import { useState, useEffect } from "react";
import whatsapp from "../../../../../public/img/whatsappchat.png";
import Image from "next/image";
import { faPlane } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

export default function BottomSheet({
  isOpen,
  onClose,
  data,
  setShareData,
  journeyDetails,
  setParentSideSheet,
  whatsAppShareLimit,
}) {
  const [isSideSheetOpen, setIsSideSheetOpen] = useState(false);

  const handleSideSheetOpen = () => {
    setIsSideSheetOpen(true); // Open bottom sheet
    onClose();
  };

  const handleSideSheetClose = () => {
    setIsSideSheetOpen(false); // Close side sheet
    if (data.length > 0) {
      // Reopen bottom sheet if there are still shared flights
      setParentSideSheet(true);
    }
  };

  const handleClearSelectedShare = () => {
    setShareData([]);
    onClose();
  };

  useEffect(() => {
    if (isSideSheetOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "visible";
    }

    return () => {
      document.body.style.overflow = "visible";
    };
  }, [isSideSheetOpen]);

  //   if (!isOpen) return null;

  return (
    <>
      <div>
        <div
          className={`fixed bottom-0 left-0 z-50 w-full bg-white px-3 py-2 transition-transform ${
            isOpen ? "translate-y-0" : "translate-y-full"
          }`}
          style={{ height: "15vh" }}
        >
          <div className="flex justify-end items-center">
            <button
              onClick={handleClearSelectedShare}
              className="text-xl font-bold"
            >
              &times;
            </button>
          </div>
          <div className="flex justify-between mx-2">
            <div className="flex justify-center items-center">
              <Image
                src={whatsapp}
                alt="WhatsApp Icon"
                className="w-[20px] sm:w-[40px] h-fit"
              />
              <div className="ml-2 font-semibold text-xs sm:text-xl text-[#461e3a]">
                <span>Share details on WhatsApp</span>{" "}
                {data && <span>{data.message}</span>}
              </div>
            </div>

            <div className="flex justify-center gap-3 items-center">
              <div className="text-[#155EEF] flex items-center sm:block">
                <span>
                  <FontAwesomeIcon
                    icon={faPlane}
                    className="h-4 w-4 transform -rotate-45"
                  />{" "}
                </span>{" "}
                <span className="text-[#000000] text-xs sm:text-base font-semibold">
                  ({data?.length}/{whatsAppShareLimit})
                </span>
              </div>
              <button
                className="font-bold text-white text-xs sm:text-lg p-2 bg-[#155EEF] rounded-lg "
                onClick={handleSideSheetOpen}
              >
                REVIEW & SHARE
              </button>
            </div>
          </div>
        </div>
        <SideSheet
          isOpen={isSideSheetOpen}
          onClose={handleSideSheetClose}
          flights={data}
          setShareData={setShareData}
          journeyDetails={journeyDetails}
          whatsAppShareLimit={whatsAppShareLimit}
        />
      </div>
    </>
  );
}
