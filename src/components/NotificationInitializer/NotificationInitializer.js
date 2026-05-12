import useFirebaseMessaging from "@/hooks/useCustomFirebase";

const NotificationInitializer = () => {
  useFirebaseMessaging(); // This will now have access to Redux context
  return null; // This component does not render anything
};

export default NotificationInitializer;
