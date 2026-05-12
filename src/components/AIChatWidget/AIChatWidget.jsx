import { useState, useEffect, useRef, useCallback } from "react";
import { useSelector } from "react-redux";
import { Bot, X, Send, RotateCcw } from "lucide-react";
import { getTabSpecificData } from "@/utils/axios/axios";
import { useUserType } from "@/hooks/useUserType";
import { selectB2CUserId } from "@/store/selectors/b2cSelectors";
import { selectCorporateUserId } from "@/store/selectors/corporateSelectors";
import config from "@/config";
import axios from "@/utils/axios/axios";
import ChatMessage from "./ChatMessage";
import WorkflowProgress from "./WorkflowProgress";

export default function AIChatWidget() {
  const isCorporate = useUserType();

  const corporateUserId = useSelector(selectCorporateUserId);
  const b2cUserId = useSelector(selectB2CUserId);
  const userId = isCorporate ? corporateUserId : b2cUserId;

  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [conversationId, setConversationId] = useState(null);
  const [workflowStage, setWorkflowStage] = useState("GREET");
  const [historyLoaded, setHistoryLoaded] = useState(false);
  const [quickButtons, setQuickButtons] = useState([]);
  const [datePickerType, setDatePickerType] = useState(null); // "departure" | "return" | null
  const [datePickerMin, setDatePickerMin] = useState("");
  const [pickedDate, setPickedDate] = useState("");

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const abortRef = useRef(null);

  const userType = isCorporate ? "corporate" : "qugo";

  const baseURL = axios.defaults.baseURL ?? "";


  const getToken = useCallback(() => {
    const activeUserType = getTabSpecificData("activeUserType") || userType;
    return (
      getTabSpecificData(`${activeUserType}_accessToken`)?.replace(/"/g, "") ??
      ""
    );
  }, [userType]);

  const getRefreshToken = useCallback(() => {
    const activeUserType = getTabSpecificData("activeUserType") || userType;
    return (
      getTabSpecificData(`${activeUserType}_refreshToken`)?.replace(/"/g, "") ??
      ""
    );
  }, [userType]);

  // Load active conversation from API on mount (no sessionStorage)
  useEffect(() => {
    if (!userId || historyLoaded) return;

    const token = getToken();
    if (!token) {
      setHistoryLoaded(true);
      return;
    }

    fetch(`${baseURL}${config.AI_AGENT_MESSAGE_LIST}`, {
      headers: {
        Authorization: `Bearer ${token}`,
        "X-User-Type": userType,
        "X-Refresh-Token": getRefreshToken(),
      },
    })
      .then((res) => (res.ok ? res.json() : null))
      .then((json) => {
        const data = json?.data;
        if (!data?.conversation) return;

        setConversationId(data.conversation.conversationId);
        setWorkflowStage(data.conversation.workflowStage || "GREET");

        // Convert DB messages to widget message format
        const widgetMessages = (data.messages || [])
          .filter((m) => m.role === "user" || m.role === "assistant")
          .map((m, i) => ({
            id: i,
            sender: m.role === "user" ? "user" : "bot",
            text: m.content,
            type: "text",
            isStreaming: false,
          }));

        if (widgetMessages.length > 0) {
          setMessages(widgetMessages);
        }
      })
      .catch(() => {
        // Non-critical — widget works fine without history
      })
      .finally(() => {
        setHistoryLoaded(true);
      });
  }, [userId, historyLoaded, getToken, getRefreshToken, userType]);

  // Auto-scroll on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Focus input when panel opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  const finalizeBotMessage = useCallback((msgId, text) => {
    const linkMatch = text.match(/LINK:(https?:\/\/\S+)/);
    if (linkMatch) {
      const cleanText = text.replace(/LINK:\S+/g, "").trim();
      setMessages((prev) =>
        prev.map((m) =>
          m.id === msgId
            ? {
                ...m,
                text: cleanText,
                type: "payment",
                paymentLink: linkMatch[1],
                isStreaming: false,
              }
            : m,
        ),
      );
      return;
    }

    const confirmMatch = text.match(/CONFIRM:\{(.*?)\}/s);
    if (confirmMatch) {
      const cleanText = text.replace(/CONFIRM:\{.*?\}/s, "").trim();
      setMessages((prev) =>
        prev.map((m) =>
          m.id === msgId
            ? {
                ...m,
                text: cleanText,
                type: "confirm",
                confirmText: cleanText,
                isStreaming: false,
              }
            : m,
        ),
      );
      return;
    }

    setMessages((prev) =>
      prev.map((m) =>
        m.id === msgId ? { ...m, text, type: "text", isStreaming: false } : m,
      ),
    );
  }, []);

  const sendMessage = useCallback(
    async (text) => {
      if (!text.trim() || isStreaming) return;

      const token = getToken();
      if (!token || !userId) {
        setMessages((prev) => [
          ...prev,
          {
            id: Date.now(),
            sender: "bot",
            text: "Please log in to use the AI booking assistant.",
            type: "text",
          },
        ]);
        return;
      }

      setMessages((prev) => [
        ...prev,
        { id: Date.now(), sender: "user", text },
      ]);
      setInput("");
      setQuickButtons([]);
      setDatePickerType(null);
      setDatePickerMin("");
      setPickedDate("");
      setIsStreaming(true);

      const botMsgId = Date.now() + 1;
      setMessages((prev) => [
        ...prev,
        {
          id: botMsgId,
          sender: "bot",
          text: "",
          type: "text",
          isStreaming: true,
        },
      ]);

      const controller = new AbortController();
      abortRef.current = controller;

      try {
        const res = await fetch(`${baseURL}${config.AI_AGENT_MESSAGE_SEND}`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
            "X-User-Type": userType,
            "X-Refresh-Token": getRefreshToken(),
          },
          body: JSON.stringify({ message: text, conversationId, userType }),
          signal: controller.signal,
        });

        if (!res.ok) throw new Error(`HTTP ${res.status}`);

        // Extract conversation ID from response header if this is a new conversation
        const convId = res.headers.get("X-Conversation-Id");
        if (convId && !conversationId) {
          setConversationId(convId);
        }

        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let accumulated = "";

        while (true) {
          const { value, done } = await reader.read();
          if (done) break;

          const raw = decoder.decode(value);
          const lines = raw.split("\n\n");

          for (const line of lines) {
            if (!line.startsWith("data: ")) continue;
            let chunk;
            try {
              chunk = JSON.parse(line.slice(6));
            } catch {
              continue;
            }

            if (chunk === "END") {
              setIsStreaming(false);
              finalizeBotMessage(botMsgId, accumulated);
              break;
            }

            if (chunk.startsWith?.("STEP:")) {
              const stage = chunk.replace("STEP:", "").trim();
              setWorkflowStage(stage);
              continue;
            }

            if (chunk.startsWith?.("[Processing:")) continue;

            if (chunk.startsWith?.("CONV:")) {
              const cid = chunk.replace("CONV:", "").trim();
              if (cid && !conversationId) setConversationId(cid);
              continue;
            }

            if (chunk.startsWith?.("BUTTONS:")) {
              try {
                setQuickButtons(JSON.parse(chunk.slice(8)));
              } catch {
                /* ignore malformed */
              }
              continue;
            }

            if (chunk.startsWith?.("DATEPICKER:")) {
              const parts = chunk.replace("DATEPICKER:", "").split(":");
              setDatePickerType(parts[0]); // "departure" or "return"
              setDatePickerMin(
                parts[1] || new Date().toISOString().split("T")[0],
              );
              setPickedDate("");
              continue;
            }

            accumulated += chunk;
            setMessages((prev) =>
              prev.map((m) =>
                m.id === botMsgId
                  ? { ...m, text: accumulated, isStreaming: true }
                  : m,
              ),
            );
          }
        }
      } catch (err) {
        if (err.name !== "AbortError") {
          setMessages((prev) =>
            prev.map((m) =>
              m.id === botMsgId
                ? {
                    ...m,
                    text: "Sorry, I encountered an error. Please try again.",
                    isStreaming: false,
                  }
                : m,
            ),
          );
        }
      } finally {
        setIsStreaming(false);
        abortRef.current = null;
      }
    },
    [
      isStreaming,
      conversationId,
      getToken,
      getRefreshToken,
      userId,
      userType,
      finalizeBotMessage,
    ],
  );

  const handleConfirm = useCallback(
    (response) => {
      setMessages((prev) =>
        prev.map((m) => (m.type === "confirm" ? { ...m, type: "text" } : m)),
      );
      sendMessage(response === "yes" ? "Yes, proceed" : "No, cancel");
    },
    [sendMessage],
  );

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  const handleReset = async () => {
    abortRef.current?.abort();

    if (conversationId) {
      const resetUrl = `${baseURL}${config.AI_AGENT_MESSAGE_RESET.replace(
        "{conversationId}",
        conversationId,
      )}`;
      const token = getToken();
      try {
        await fetch(resetUrl, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "X-User-Type": userType,
          },
        });
      } catch {
        // Non-critical
      }
    }

    setMessages([]);
    setConversationId(null);
    setWorkflowStage("GREET");
    setIsStreaming(false);
  };

  // Only render when user is logged in
  if (!userId) return null;

  return (
    <>
      {/* Floating action button */}
      <button
        className="fixed bottom-20 right-4 z-[100] w-14 h-14 rounded-full bg-blue-600 hover:bg-blue-700 text-white shadow-lg flex items-center justify-center transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        onClick={() => setIsOpen((o) => !o)}
        aria-label="AI Booking Assistant"
        title="AI Booking Assistant"
      >
        {isOpen ? <X size={22} /> : <Bot size={22} />}
      </button>

      {/* Chat panel */}
      {isOpen && (
        <div className="fixed bottom-36 right-4 z-[100] w-96 h-[min(600px,calc(100dvh-10rem))] bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-gray-200 max-w-[calc(100vw-1rem)]">
          {/* Header */}
          <div className="bg-blue-600 text-white px-4 py-3 flex items-center gap-3 rounded-t-2xl">
            <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
              <Bot size={18} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-semibold text-sm leading-tight">
                AI Booking Assistant
              </div>
              <div className="text-blue-200 text-xs leading-tight">
                {isCorporate ? "Corporate account" : "Qugo account"} · Flights &
                more
              </div>
            </div>
            <button
              className="text-blue-200 hover:text-white text-xs flex items-center gap-1 px-2 py-1 rounded hover:bg-blue-500 transition-colors"
              onClick={handleReset}
              title="Start new conversation"
            >
              <RotateCcw size={12} /> New
            </button>
            <button
              className="text-blue-200 hover:text-white ml-1 p-1 rounded hover:bg-blue-500 transition-colors"
              onClick={() => setIsOpen(false)}
              aria-label="Close"
            >
              <X size={18} />
            </button>
          </div>

          {/* Workflow progress */}
          <WorkflowProgress currentStage={workflowStage} />

          {/* Messages area */}
          <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3 bg-gray-50">
            {messages.length === 0 && historyLoaded && (
              <div className="bg-white rounded-2xl rounded-bl-none px-4 py-3 text-gray-700 text-sm shadow-sm max-w-[85%]">
                Hi! I can help you book flights. Just tell me where you want to
                go — for example:{" "}
                <em className="text-blue-600">
                  {'"'}Book a flight from Delhi to Mumbai tomorrow for 1 adult
                  {'"'}
                </em>
              </div>
            )}

            {messages.map((msg) => (
              <ChatMessage
                key={msg.id}
                message={msg}
                onConfirm={handleConfirm}
              />
            ))}

            {/* Typing indicator */}
            {isStreaming && messages[messages.length - 1]?.text === "" && (
              <div className="bg-white rounded-2xl rounded-bl-none px-4 py-3 shadow-sm inline-flex gap-1 items-center max-w-[85%]">
                <div
                  className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                  style={{ animationDelay: "0ms" }}
                />
                <div
                  className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                  style={{ animationDelay: "150ms" }}
                />
                <div
                  className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                  style={{ animationDelay: "300ms" }}
                />
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick-pick buttons (e.g. Tomorrow / This Weekend / Pick a Date) */}
          {quickButtons.length > 0 && !isStreaming && (
            <div className="border-t border-gray-100 bg-white px-3 pt-2 pb-1 flex flex-wrap gap-1.5">
              {quickButtons.map((btn) => (
                <button
                  key={btn.id}
                  className="text-xs px-3 py-1.5 rounded-full border border-blue-500 text-blue-600 hover:bg-blue-50 transition-colors font-medium"
                  onClick={() => sendMessage(btn.id)}
                >
                  {btn.title}
                </button>
              ))}
            </div>
          )}

          {/* Input row */}
          <div className="border-t border-gray-200 bg-white px-3 py-3 flex gap-2 items-end">
            {datePickerType ? (
              /* Date picker mode */
              <>
                <div className="flex-1 flex flex-col gap-1">
                  <label className="text-xs text-gray-500">
                    {datePickerType === "return"
                      ? "Return date"
                      : "Departure date"}
                  </label>
                  <input
                    type="date"
                    className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    min={
                      datePickerMin || new Date().toISOString().split("T")[0]
                    }
                    value={pickedDate}
                    onChange={(e) => setPickedDate(e.target.value)}
                    autoFocus
                  />
                </div>
                <button
                  className="w-10 h-10 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed text-white flex items-center justify-center flex-shrink-0 transition-colors"
                  onClick={() => pickedDate && sendMessage(pickedDate)}
                  disabled={!pickedDate}
                  aria-label="Confirm date"
                >
                  <Send size={16} />
                </button>
              </>
            ) : (
              /* Normal text input */
              <>
                <textarea
                  ref={inputRef}
                  className="flex-1 resize-none rounded-xl border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-400 disabled:opacity-50 max-h-24 min-h-[40px]"
                  rows={1}
                  placeholder="Ask me to book a flight…"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  disabled={isStreaming}
                />
                <button
                  className="w-10 h-10 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed text-white flex items-center justify-center flex-shrink-0 transition-colors"
                  onClick={() => sendMessage(input)}
                  disabled={isStreaming || !input.trim()}
                  aria-label="Send"
                >
                  <Send size={16} />
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
