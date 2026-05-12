// useGlobalEvent.js
import { removeTabSpecificData, setTabSpecificData } from "@/utils/axios/axios";
import { useCallback } from "react";

const EVENT_PREFIX = "GLOBAL_EVENT_";

export function useGlobalEvent(eventName) {
  const fullEventName = EVENT_PREFIX + eventName;

  const dispatchEvent = useCallback(
    (data) => {
      if (typeof window !== "undefined") {
        const event = new CustomEvent(fullEventName, { detail: data });
        window.dispatchEvent(event);

        // Also set in localStorage to trigger event in other tabs/windows
        setTabSpecificData(
          fullEventName,
          JSON.stringify({ detail: data, timestamp: Date.now() })
        );
        removeTabSpecificData(fullEventName); // Immediately remove to allow future events
      }
    },
    [fullEventName]
  );

  const addEventListener = useCallback(
    (callback) => {
      const handleEvent = (event) => {
        callback(event.detail);
      };

      const handleStorageEvent = (event) => {
        if (event.key === fullEventName && event.newValue) {
          const data = JSON.parse(event.newValue);
          callback(data.detail);
        }
      };

      if (typeof window !== "undefined") {
        window.addEventListener(fullEventName, handleEvent);
        window.addEventListener("storage", handleStorageEvent);
      }

      return () => {
        if (typeof window !== "undefined") {
          window.removeEventListener(fullEventName, handleEvent);
          window.removeEventListener("storage", handleStorageEvent);
        }
      };
    },
    [fullEventName]
  );

  return { dispatchEvent, addEventListener };
}
