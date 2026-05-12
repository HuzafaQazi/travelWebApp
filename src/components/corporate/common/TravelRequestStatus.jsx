import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import { faCopy, faShareNodes } from "@fortawesome/free-solid-svg-icons";
import { faWhatsapp } from "@fortawesome/free-brands-svg-icons";

const TravelRequestStatus = ({ approvalStatus, paymentStatus }) => {
  const [isCopied, setIsCopied] = useState(false);

  const shareGeneral = () => {
    if (navigator.share) {
      navigator
        .share({
          title: "Travel Request Status",
          text: "Check out my travel request status",
          url: window.location.href,
        })
        .then(() => {
          console.log("Successful share");
        })
        .catch((error) => {
          console.log("Error sharing:", error);
        });
    } else {
      alert(
        "Web Share API is not supported in your browser. You can copy the URL instead."
      );
    }
  };

  const shareOnWhatsApp = () => {
    const text = encodeURIComponent(
      `Check out my travel request status: ${window.location.href}`
    );
    window.open(`https://web.whatsapp.com/send/?text=${text}`, "_blank");
  };

  const copyToClipboard = () => {
    navigator.clipboard
      .writeText(window.location.href)
      .then(() => {
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000); 
      })
      .catch((err) => {
        console.error("Failed to copy: ", err);
      });
  };

  const statusMessages = {
    Pending: {
      message: (
        <>
          Your travel request is
          <span className="text-[#7E0ED6]"> waiting for approval!</span>
        </>
      ),
    },
    Approved: {
      message: (
        <>
          Your travel request
          <span className="text-[#418C12]">
            {" "}
            has been Approved {paymentStatus === "success" && "and Paid"}!
          </span>
        </>
      ),
    },
    Cancelled: {
      message: (
        <>
          Your travel request is
          <span className="text-[#E53944]"> Cancelled!</span>
        </>
      ),
    },
    Declined: {
      message: (
        <>
          Your travel request
          <span className="text-[#E53944]"> has been Declined</span>
        </>
      ),
    },
  };

  const approvalText = statusMessages[approvalStatus]?.message || null;

  return approvalText ? (
    <div className="flex flex-row items-center">
      <div className="text-sm sm:text-2xl font-medium">{approvalText}</div>
      <div className="flex bg-white w-fit sm:w-[10%] ml-2 items-center space-x-2 rounded-lg px-2 py-2">
        <FontAwesomeIcon
          onClick={() => {
            shareGeneral();
          }}
          icon={faShareNodes}
          color="#878786"
          className="cursor-pointer"
        />
        <FontAwesomeIcon
          onClick={() => {
            shareOnWhatsApp();
          }}
          icon={faWhatsapp}
          color="#00D95F"
          className="cursor-pointer"
        />
        <FontAwesomeIcon
          onClick={() => {
            copyToClipboard();
          }}
          icon={faCopy}
          color="#878786"
          className="cursor-pointer"
        />
        {isCopied && (
          <div className="fixed inset-0 flex items-center justify-center z-50">
            <div className="bg-gradient-to-r from-[#E2F7E2] to-[#D0FFD0] shadow-xl rounded-lg p-6 text-center max-w-sm">
              <div className="text-xl font-semibold text-[#418C12] mb-2">
                🎉 URL Copied!
              </div>
              <div className="text-gray-800 mb-4">
                The URL has been successfully copied to your clipboard.
              </div>
              <div className="text-sm text-gray-500">
                Share it with your friends!
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  ) : null;
};

export default TravelRequestStatus;
