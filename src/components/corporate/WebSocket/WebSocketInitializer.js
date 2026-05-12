import useWebSockets from "@/hooks/useWebSockets";

const WebSocketInitializer = () => {
  useWebSockets(); // This will now have access to Redux context
  return null; // This component does not render anything
};

export default WebSocketInitializer;
