// utils/pusher.js
import Pusher from "pusher-js";
import config from "@/config";

let _pusherInstance = null;

const getPusherInstance = () => {
  if (typeof window === "undefined") return null;
  if (!_pusherInstance) {
    _pusherInstance = new Pusher(config.PUSHER_KEY, {
      cluster: config.PUSHER_CLUSTER,
      encrypted: true,
    });
  }
  return _pusherInstance;
};

// ✅ Proxy makes it look like a real Pusher instance to all importers
// No changes needed in chatbot.js or any other file
const pusher = new Proxy(
  {},
  {
    get(_, prop) {
      const instance = getPusherInstance();
      if (!instance) {
        // SSR: return a no-op function so nothing crashes
        return () => ({
          bind: () => {},
          unbind: () => {},
        });
      }
      const value = instance[prop];
      // Bind methods to the real instance so `this` context is correct
      return typeof value === "function" ? value.bind(instance) : value;
    },
  },
);

export { pusher };
