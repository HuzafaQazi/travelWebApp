import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { RWebShare } from "react-web-share";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faShareNodes } from "@fortawesome/free-solid-svg-icons";
import style from "./shareicon.module.css";
import config from "@/config";

export default function Shareicon() {
  const router = useRouter();
  const [shareUrl, setShareUrl] = useState("");

  useEffect(() => {
    setShareUrl(config.WEB_BASE_URL + router.asPath);
    const handleBeforeUnload = (event) => {
      event.preventDefault();
      event.returnValue =
        "Are you sure you want to leave? Your changes may not be saved.";
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [router.asPath]);

  const handleShare = () => {
    console.log("Shared successfully!");
  };

  return (
    <div className={style.whatsappcontainer}>
      <RWebShare
        data={{
          text: "Checkout the latest Flight Booking details",
          url: shareUrl,
          title: "QuGo Best Flight Booking Website",
        }}
        onClick={handleShare}
      >
        <div className={style.whatsappIcon1}>
          <FontAwesomeIcon icon={faShareNodes} className={style.whatsappIcon} />
        </div>
      </RWebShare>
    </div>
  );
}
