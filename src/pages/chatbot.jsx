import "tailwindcss/tailwind.css";
import { useState, useEffect, useRef, useCallback } from "react";
import { Plane, Send, Loader, Trash2 } from "lucide-react";
import dynamic from "next/dynamic";
import axios, { getTabSpecificData, removeTabSpecificData, setTabSpecificData } from "@/utils/axios/axios";
import config from "@/config";
import { useGlobalEvent } from "@/hooks/useGlobalEvent";

function Home() {
  const { addEventListener } = useGlobalEvent("chatBotChanged");

  const [messages, setMessages] = useState(() => {
    if (typeof window !== "undefined") {
      const savedMessages = getTabSpecificData("chatHistory");
      return savedMessages ? JSON.parse(savedMessages) : [];
    }
    return [];
  });
  const [input, setInput] = useState("");
  const [options, setOptions] = useState(() => {
    if (typeof window !== "undefined") {
      const savedOptions = getTabSpecificData("chatOptions");
      return savedOptions ? JSON.parse(savedOptions) : [];
    }
    return [];
  });
  const [userId] = useState(() => {
    if (typeof window !== "undefined") {
      const savedUserId = getTabSpecificData("userId");
      return savedUserId || "1";
    }
    return "1";
  });
  const [isStreaming, setIsStreaming] = useState(false);
  const [isChatCleared, setIsChatCleared] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    setTabSpecificData("userId", userId);
  }, [userId]);

  useEffect(() => {
    if (!isChatCleared) {
      setTabSpecificData("chatHistory", JSON.stringify(messages));
    }
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isChatCleared]);

  useEffect(() => {
    if (!isChatCleared) {
      setTabSpecificData("chatOptions", JSON.stringify(options));
    }
  }, [options, isChatCleared]);

  useEffect(() => {
    if (messages.length === 0 && !isChatCleared) {
      handleSendMessage("initial", false);
    } else if (messages.length > 0 && !isChatCleared) {
      const lastMessage = messages[messages.length - 1];
      if (lastMessage.sender === "user") {
        handleSendMessage(lastMessage.text);
      } else if (options.length > 0) {
        setOptions(options);
      }
    }
  }, []);

  useEffect(() => {
    if (isChatCleared) {
      handleSendMessage("initial", false);
    }
  }, [isChatCleared]);

  const handleChatBotChanged = useCallback((data) => {
    console.log("ChatBot changed event received!", data);
    alert(222);
  }, []);

  useEffect(() => {
    const cleanup = addEventListener(handleChatBotChanged);
    return cleanup;
  }, [addEventListener, handleChatBotChanged]);

  const handleSendMessage = async (message, showInChat = true) => {
    setIsChatCleared(false);
    if (showInChat) {
      const newMessages = [...messages, { text: message, sender: "user" }];
      setMessages(newMessages);
    }
    setInput("");
    setOptions([]);
    setIsStreaming(true);
    // "http://localhost:3050/qtravels/eventsService/api/v1.0/messages/chat"

    try {
      const token = getTabSpecificData("accessToken")?.replace(/"/g, "");
      const response = await fetch(
        // "http://localhost:3050/qtravels/eventsService/api/v1.0/messages/chat",
        `${config.BASE_URL}${config.CHATBOT}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ userId, message }),
        }
      );

      const reader = response.body.getReader();

      const decoder = new TextDecoder();
      let botResponse = "";

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split("\n\n");

        for (const line of lines) {
          if (line.startsWith("data: OPTIONS:")) {
            const optionsData = JSON.parse(line.replace("data: OPTIONS:", ""));
            setOptions(optionsData);
          } else if (line.startsWith("data: ")) {
            const text = line.replace("data: ", "");
            botResponse += text;
            setMessages((prev) => {
              const updatedMessages = [...prev];
              if (
                updatedMessages.length > 0 &&
                updatedMessages[updatedMessages.length - 1].sender === "bot"
              ) {
                updatedMessages[updatedMessages.length - 1].text = botResponse;
              } else {
                updatedMessages.push({ text: botResponse, sender: "bot" });
              }
              return updatedMessages;
            });
          } else if (line.startsWith("event: end")) {
            setIsStreaming(false);
          }
        }
      }
    } catch (error) {
      console.log("Error:", error);
      console.error("Error:", error);
      setIsStreaming(false);
    }
  };

  const handleSendMessageBACKUP = async (message, showInChat = true) => {
    setIsChatCleared(false);
    if (showInChat) {
      const newMessages = [...messages, { text: message, sender: "user" }];
      setMessages(newMessages);
    }
    setInput("");
    setOptions([]);
    setIsStreaming(true);

    try {
      const response = await axios({
        method: "post",
        url: `${config.CHATBOT}`,
        data: {
          userId,
          message,
        },
        headers: {
          "Content-Type": "application/json",
        },
        responseType: "text",
        onDownloadProgress: (progressEvent) => {
          const data = progressEvent.event.target.responseText;
          const lines = data.split("\n\n");
          let botResponse = "";

          lines.forEach((line) => {
            if (line.startsWith("data: OPTIONS:")) {
              const optionsData = JSON.parse(
                line.replace("data: OPTIONS:", "")
              );
              setOptions(optionsData);
            } else if (line.startsWith("data: ")) {
              const textContent = line.replace("data: ", "");
              botResponse += textContent;
              setMessages((prev) => {
                const updatedMessages = [...prev];
                if (
                  updatedMessages.length > 0 &&
                  updatedMessages[updatedMessages.length - 1].sender === "bot"
                ) {
                  updatedMessages[updatedMessages.length - 1].text =
                    botResponse;
                } else {
                  updatedMessages.push({ text: botResponse, sender: "bot" });
                }
                return updatedMessages;
              });
            } else if (line.startsWith("event: end")) {
              setIsStreaming(false);
            }
          });
        },
      });

      setIsStreaming(false);
    } catch (error) {
      console.error("Error:", error);
      setIsStreaming(false);
    }
  };

  const handleClearChat = () => {
    setIsChatCleared(true);
    setMessages([]);
    setOptions([]);
    removeTabSpecificData("chatHistory");
    removeTabSpecificData("chatOptions");
  };

  return (
    <div className="flex flex-col h-screen bg-gradient-to-r from-blue-100 to-blue-300">
      <header className="bg-blue-600 text-white p-4 shadow-md flex justify-between items-center rounded-b-lg">
        <h1 className="text-2xl font-bold flex items-center">
          <Plane className="mr-2" /> Flight Booking Assistant
        </h1>
        <button
          onClick={handleClearChat}
          className="flex items-center bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-full transition duration-300 ease-in-out"
        >
          <Trash2 className="mr-1" /> Clear Chat
        </button>
      </header>
      <div className="flex-grow overflow-hidden flex flex-col">
        <div className="flex-grow overflow-y-auto p-4 pb-32 custom-scrollbar">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`mb-4 ${
                message.sender === "user" ? "text-right" : "text-left"
              }`}
            >
              <span
                className={`inline-block p-3 rounded-3xl max-w-[80%] shadow-lg ${
                  message.sender === "user"
                    ? "bg-blue-500 text-white"
                    : "bg-white text-gray-800"
                }`}
              >
                {message.text}
              </span>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
      </div>
      <div className="bg-white border-t border-gray-200 p-4 shadow-xl">
        {options.length > 0 ? (
          <div className="flex flex-wrap gap-2 mb-4">
            {options.map((option, index) => (
              <button
                key={index}
                onClick={() => handleSendMessage(option)}
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-full transition duration-300 ease-in-out"
                disabled={isStreaming}
              >
                {option}
              </button>
            ))}
          </div>
        ) : (
          <div className="flex items-center">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="flex-grow border border-gray-300 p-3 rounded-l-full focus:outline-none focus:ring-2 focus:ring-blue-500 custom-scrollbar"
              placeholder="Type your message..."
              disabled={isStreaming}
            />
            <button
              onClick={() => handleSendMessage(input)}
              className="bg-blue-500 hover:bg-blue-600 text-white p-3 rounded-r-full transition duration-300 ease-in-out"
              disabled={isStreaming || !input.trim()}
            >
              <Send size={24} />
            </button>
          </div>
        )}
        {isStreaming && (
          <div className="text-center mt-2 text-gray-500 flex items-center justify-center">
            <Loader className="animate-spin mr-2" size={20} />
            Assistant is typing...
          </div>
        )}
      </div>

      {/* Custom scrollbars */}
      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background-color: rgba(0, 0, 0, 0.3);
          border-radius: 10px;
        }
      `}</style>
    </div>
  );
}

export default dynamic(() => Promise.resolve(Home), { ssr: false });
