import B2CHeader from "@/components/flights/B2cHeader/Header";
import Image from "next/image";
import style from "./style.module.css";
import Clogo from "../../../public/img/event/Coimbatore_Institute_of_Technology_logo.png";
import qugoImage from "../../../public/img/Qugo MICE White Logo-03 1.png";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCalendarAlt,
  faMapMarkerAlt,
} from "@fortawesome/free-solid-svg-icons";
import { useState, useEffect, useRef } from "react";
import Details from "@/components/events/YourDetails/Details";
import Converge from "@/components/events/converge/converge";
import College from "@/components/events/converge/CollageAlumni";
import Footer from "@/components/footer/footer";
import Gallery from "@/components/events/Gallery/EventGallery";
import phone from "../../../public/img/call.png";
import Chat from "@/components/events/converge/chatBot/chatbot";
import ProtectedRoute from "@/components/events/protectedRoute/ProtectedRoute";
import initFirebaseMessaging from "@/utils/notifications/initFirebaseMessaging";
import { useRouter } from "next/router";

export default function Event() {
  const router = useRouter();

  const [activeTab, setActiveTab] = useState("converge");
  const [isChatOpen, setIsChatOpen] = useState(false);
  const chatBoxRef = useRef(null);

  const handleOpenChat = () => {
    setIsChatOpen(true);
  };

  const handleCloseChat = () => {
    setIsChatOpen(false);
  };

  // const handleRedirectToForm = () => {
  //   window.location.href = "/Posiflex/eventForm";
  // };

  const handleRedirectToForm = () => {
    router.replace("/CIT-95/Registerform");
  };

  const handleTabClick = (tabName) => {
    setActiveTab(tabName); // Update state when a tab is clicked
  };

  const handleClickOutside = (event) => {
    if (chatBoxRef.current && !chatBoxRef.current.contains(event.target)) {
      handleCloseChat();
    }
  };

  useEffect(() => {
    if (isChatOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isChatOpen]);

  useEffect(() => {
    if (isChatOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "visible";
    }

    return () => {
      document.body.style.overflow = "visible";
    };
  }, [isChatOpen]);

  useEffect(() => {
    const initializeFirebase = async () => {
      try {
        await initFirebaseMessaging();
      } catch (error) {
        console.error("Firebase initialization error:", error);
      }
    };

    initializeFirebase();
  }, []);

  return (
    <ProtectedRoute>
      <div className={style.relativeContainer}>
        <div className={style.header}>
          {/* <HeaderCommon /> */}
          <B2CHeader />
        </div>
        <div className={style.Bgimage}></div>

        {/* src={Bg}
          alt="Unable to load list tile icon" */}
        {/* /> */}

        <div className={style.overlayContent}>
          {/* <Image className={style.posiflexLogo} src={Posiflex} alt="qugoLogo" /> */}
          <div className="mt-[7%]">
            <div className="grid place-items-center h-full">
              <Image
                className=""
                width={100}
                height={100}
                src={Clogo}
                alt="Coimbatore Institute of Technology logo"
              />
            </div>

            <div className="text-center sm:text-3xl font-semibold">
              CIT-95 <br /> PEARL JUBILEE ALUMINI MEET
            </div>

            {/* <div className="text-center text-2xl font-semibold">
              <span>Radisson Blu Hotel Coimbatore</span>
            </div> */}
            <div>
              <div className={style.imagecontainer}>
                <div className={style.maintext2}>Powered by</div>
                <Image
                  className={style.qugoLogo}
                  src={qugoImage}
                  alt="WeynGo Logo"
                />
              </div>
            </div>
          </div>
          {/* <div className={style.underline}>
            <a
              href="https://events.posiflexindia.com/golden-bonanza/"
              target="_blank"
              rel="noopener noreferrer"
              className={style.underlineBtn1}
            >
              <button className={style.underlineBtn2}>GOLDEN BUNDLE BONANZA 2.0</button>
            </a>
          </div> */}
          <div className={style.underline}>
            {/* <a
              href="https://qa.qugo.io/Posiflex/eventForm"
              target="_self"
              rel="noopener noreferrer"
              className={style.underlineBtn1}
            > */}
            <div className={style.underlineBtn1}>
              <button
                onClick={handleRedirectToForm}
                className={style.underlineBtn2}
              >
                Register Now
              </button>
            </div>
            {/* </a> */}
          </div>
        </div>
        <div className={style.belowBg}>
          <div className={style.text}>
            <FontAwesomeIcon icon={faCalendarAlt} className={style.icon} /> 4th
            July - 6th July, 2025
          </div>
          <div className={style.text}>
            <FontAwesomeIcon icon={faMapMarkerAlt} className={style.icon} /> O
            by TAMARA Coimbatore
          </div>
        </div>
      </div>
      <div className={style.mainContent}>
        <div className={style.tabHeadings}>
          <div
            className={`${style.heading} ${
              activeTab === "converge" ? style.activeHeading : ""
            }`}
            onClick={() => handleTabClick("converge")}
          >
            Alumini Meet 2025
          </div>
          <div
            className={`${style.heading} ${
              activeTab === "gallery" ? style.activeHeading : ""
            }`}
            onClick={() => handleTabClick("gallery")}
          >
            Gallery
          </div>
          <div
            className={`${style.heading} ${
              activeTab === "details" ? style.activeHeading : ""
            }`}
            onClick={() => handleTabClick("details")}
          >
            Your Details
          </div>
        </div>
        {activeTab === "converge" && (
          <div className={style.tabContainer}>
            {/* <Converge /> */}
            <College />
          </div>
        )}
        {activeTab === "gallery" && (
          <div className={style.tabContainer}>
            <Gallery />
          </div>
        )}
        {activeTab === "details" && (
          <div className={style.tabContainer}>
            <Details />
          </div>
        )}
      </div>
      <Footer />
      <div className={style.chaticon} onClick={handleOpenChat}>
        <div className={style.ChatBackground1}>
          <button className={style.ChatBackground}>
            Chat with us for enquiry {"  "} |
            <Image src={phone} alt="Profile" className={style.smileicon1} />
          </button>
        </div>
      </div>
      {isChatOpen && (
        <div className={style.chatBox} ref={chatBoxRef}>
          <Chat onClose={handleCloseChat} />
        </div>
      )}
    </ProtectedRoute>
  );
}
