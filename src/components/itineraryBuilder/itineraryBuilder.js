import Image from "next/image";
import { useState, useEffect, useRef } from "react";
import axios from "@/utils/axios/axios";
import style from "./styles.module.css";
import profile from "../../images/sendicon.png";
import chaticon from "../../images/chaticon.png";
const backendApiEndpoint =
  "https://uat.qtravelservice.qugo.io:3107/qtravels/searchService/api/v1.0/package/packagedetail";
const fetchData = async (query) => {
  try {
    const apiResponse = await axios.get(backendApiEndpoint);
    const data = apiResponse.data?.data;
    const matchingSections = data.filter(
      (section) =>
        section.description.toLowerCase().includes("itinerary") &&
        section.description.toLowerCase().includes("sikkim")
    );
    let response;
    if (matchingSections.length > 0) {
      response = "Here are the matching itinerary sections:\n";
      matchingSections.forEach((section, index) => {
        response += `Day ${index + 1}: ${section.title}\n${
          section.description
        }\n\n`;
      });
    } else {
      response = "I m sorry, but there are no matching itinerary sections.";
    }

    return response;
  } catch (error) {
    console.error("Error fetching itinerary data:", error);
    throw error;
  }
};
const ItineraryBuilder = () => {
  const [chatBotVisible, setChatBotVisible] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([]);
  const chatBotContainerRef = useRef(null);

  const handleChatBotToggle = () => {
    setChatBotVisible(!chatBotVisible);
  };

  const sendMessage = async () => {
    const userQuery = input.trim();
    if (userQuery === "") return;

    try {
      const botResponse = await fetchData(userQuery);
      setMessages([
        ...messages,
        { type: "user", text: userQuery },
        { type: "bot", text: botResponse },
      ]);
      setInput("");
    } catch (error) {
      console.error("Error processing user query:", error);
    }
  };

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (
        chatBotContainerRef.current &&
        !chatBotContainerRef.current.contains(event.target)
      ) {
        setChatBotVisible(false);
        document.body.style.overflow = "visible";
      }
    };

    if (chatBotVisible) {
      document.body.style.overflow = "hidden";
      document.addEventListener("click", handleOutsideClick);
    } else {
      document.body.style.overflow = "visible";
      document.removeEventListener("click", handleOutsideClick);
    }

    return () => {
      document.removeEventListener("click", handleOutsideClick);
      document.body.style.overflow = "visible";
    };
  }, [chatBotVisible]);
  return (
    <>
      <div className={style.chatBotIcon} onClick={handleChatBotToggle}></div>

      {chatBotVisible && (
        <div className={style.chatBotContainer}>
          <div>
            {messages.map((msg, index) => (
              <div
                key={index}
                style={{ padding: "8px", borderBottom: "1px solid #eee" }}
              >
                {msg.type === "user" ? (
                  <strong>User:</strong>
                ) : (
                  <strong>Bot:</strong>
                )}{" "}
                {msg.text}
              </div>
            ))}
          </div>

          <div className={style.iconContainer}>
            <div className={style.leftpart}>
              <Image className={style.Icon} src={chaticon}></Image>
            </div>

            <div className={style.box} onClick={handleChatBotToggle}>
              <div className={style.cross}>
                <div className={style.line}></div>
                <div className={style.line}></div>
              </div>
            </div>
          </div>

          <div className={style.middlepart}>
            <Image className={style.Icon1} src={chaticon}></Image>

            <div className={style.messagecontainer}>
              <div className={style.botmessage}>
                <p>Hey,Have a question regarding travel?</p>
              </div>
              <div className={style.typingIndicator}>
                <span className={style.typing1}>.</span>
                <span className={style.typing2}>.</span>
                <span className={style.typing3}>.</span>
                <span className={style.typing3}>.</span>
              </div>
            </div>
          </div>

          <div className={style.message}>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Enter your message"
              className={style.textarea}
            />
            <button className={style.sendbutton} onClick={sendMessage}>
              <Image className={style.listtileicon} src={profile}></Image>
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default ItineraryBuilder;
