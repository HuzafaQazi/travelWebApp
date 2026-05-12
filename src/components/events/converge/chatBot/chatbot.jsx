import { useState, useEffect, useRef, useCallback } from "react";
import useSWR from "swr";
import axios, { getTabSpecificData } from "@/utils/axios/axios";
import Image from "next/image";
import Picker from "@emoji-mart/react";
import style from "./style.module.css";
import circle from "../../../../../public/img/Group 483 (1).png";
import linehr from "../../../../../public/img/Rectangle 24438.png";
import share from "../../../../../public/img/Component 189.png";
import smile from "../../../../../public/img/smile.png";
import config from "@/config";
import { pusher } from "../../../../../utils/pusher";

const fetcher = async (url) => {
  const userId = getTabSpecificData("userID").replace(/"/g, "");
  const userId1 =getTabSpecificData("userID").replace(/"/g, "");
  const eventId = getTabSpecificData("event_id").replace(/"/g, "");
  const userId2 = "1";
  const response = await axios.get(
    `${url}?user_id=${userId}&user_id1=${userId1}&user_id2=${userId2}&event_id=${eventId}`
  );
  return response.data.data;
};

const Chat = ({ isOpen, onClose }) => {
  const [message, setMessage] = useState("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const emojiPickerRef = useRef(null);
  const chatListRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  const {
    data: chatList,
    error,
    mutate: refreshChatList,
  } = useSWR(config.EVENTS_MESSAGE_LIST, fetcher, { revalidateOnFocus: false });

  useEffect(() => {
    if (!chatList) return;
    scrollToBottom();
  }, [chatList]);

  useEffect(() => {
    if (showEmojiPicker) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "visible";
    }

    return () => {
      document.body.style.overflow = "visible";
    };
  }, [showEmojiPicker]);

  const handleNewMessage = useCallback(
    (newMessage) => {
      const formattedMessage = {
        id: newMessage.id,
        content: newMessage.content,
        sender: { id: newMessage.sender },
        receiver: { id: newMessage.receiver },
        createdAt: newMessage.createdAt,
      };
      refreshChatList((messages) => {
        // Prevent duplicate messages
        if (!messages.some((msg) => msg.id === newMessage.id)) {
          return [...messages, formattedMessage];
        }
        return messages;
      }, false);
    },
    [refreshChatList]
  );

  const handleTyping = useCallback(
    (typingInfo) => {
      const userId = getTabSpecificData("userID").replace(/"/g, "");
      if (typingInfo.sender !== userId) {
        setIsTyping(true);
        if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
        typingTimeoutRef.current = setTimeout(() => {
          setIsTyping(false);
        }, 3000);
      }
    },
    [setIsTyping]
  );

  useEffect(() => {
    const userId = getTabSpecificData("userID").replace(/"/g, "");
    const eventId = getTabSpecificData("event_id").replace(/"/g, "");
    if (!userId) return;

    const channel = pusher.subscribe(`chat-${eventId}-${userId}`);
    channel.bind("new-message", handleNewMessage);
    channel.bind("typing", handleTyping);

    return () => {
      channel.unbind("new-message", handleNewMessage);
      channel.unbind("typing", handleTyping);
      pusher.unsubscribe(`chat-${eventId}-${userId}`);
    };
  }, [handleNewMessage, handleTyping]);

  const scrollToBottom = () => {
    if (chatListRef.current) {
      chatListRef.current.scrollTop = chatListRef.current.scrollHeight;
    }
  };

  const handleClickOutside = (event) => {
    if (
      emojiPickerRef.current &&
      !emojiPickerRef.current.contains(event.target)
    ) {
      setShowEmojiPicker(false);
    }
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleMessageSend = async () => {
    if (message.trim() === "") return;
    try {
      const userId = getTabSpecificData("userID").replace(/"/g, "");
      const eventId = getTabSpecificData("event_id").replace(/"/g, "");
      const newMessage = {
        id: Date.now().toString(),
        content: message,
        sender: { id: userId },
        receiver: { id: "1" },
        createdAt: new Date().toISOString(),
      };
      refreshChatList((messages) => [...messages, newMessage], false);
      setMessage("");

      const payload = {
        id: newMessage.id,
        user_id: userId,
        event_id: eventId,
        sender: userId,
        receiver: "1",
        content: message,
      };
      const response = await axios.post(
        `${config.EVENTS_MESSAGE_SEND}`,
        payload
      );
      if (response.data.status) {
        // refreshChatList();
      }
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleMessageSend();
    } else {
      // sendTypingEvent();
    }
  };

  const handleEmojiSelect = (emoji) => {
    setMessage((prevMessage) => prevMessage + emoji.native);
    setShowEmojiPicker(false);
    // sendTypingEvent();
  };

  const isCurrentUserMessage = (userId) => {
    const currentUserId = getTabSpecificData("userID").replace(/"/g, "");
    return userId === currentUserId;
  };

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    const hours = date.getHours();
    const minutes = date.getMinutes();
    return `${hours}:${minutes < 10 ? "0" : ""}${minutes}`;
  };

  return (
    <>
      <div className={style.chatcontainer}>
        <div className={style.Qugoimage}>
          <div className={style.header}>
            <div className={style.Qugoimage1}>
              <Image src={circle} alt="Profile" className={style.Qugoicon} />
              <div className={style.chat}>Chat with Qugo</div>
            </div>
            <div onClick={onClose} className={style.crossmark}>
              &times;
            </div>
          </div>
          <div>
            <Image src={linehr} alt="Profile" className={style.Qugoicon1} />
          </div>
        </div>

        <ul className={style.chatList} ref={chatListRef}>
          {chatList &&
            chatList.map((chat, index) => (
              <li
                key={chat.id}
                className={
                  isCurrentUserMessage(chat.sender.id)
                    ? style.currentUserMessage
                    : style.otherUserMessage
                }
                style={{
                  marginBottom:
                    index > 0 &&
                    (chatList[index].sender.id === chatList[index - 1].sender.id
                      ? "5px"
                      : "5px"),
                }}
              >
                <div className={style.messageContainer}>
                  <div className={style.sender}></div>
                  <div
                    className={style.message}
                    dangerouslySetInnerHTML={{ __html: chat.content }}
                  />
                  <div className={style.timestamp}>
                    {formatTimestamp(chat.createdAt)}
                  </div>
                </div>
              </li>
            ))}
          {isTyping && <li className={style.typingIndicator}>Typing...</li>}
        </ul>

        <div className={style.inputcontainer}>
          <div className={style.inputWrapper}>
            <input
              type="text"
              className={style.messageInput}
              placeholder="Type your message here"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={handleKeyDown}
            />
            <Image
              src={smile}
              alt="Smile"
              className={style.smileicon}
              onClick={() => setShowEmojiPicker((prev) => !prev)}
            />
          </div>
          {showEmojiPicker && (
            <div className={style.emojiPicker} ref={emojiPickerRef}>
              <Picker onEmojiSelect={handleEmojiSelect} />
            </div>
          )}
          <div onClick={handleMessageSend}>
            <Image src={share} alt="Share" className={style.Qugoicon77} />
          </div>
        </div>
      </div>
    </>
  );
};

export default Chat;
