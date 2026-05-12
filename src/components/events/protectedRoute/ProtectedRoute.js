import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import axios, { getTabSpecificData, removeTabSpecificData } from '@/utils/axios/axios';;
import { useLogin } from "@/store/context/LoginContext";
import config from "@/config";
import Loader from "@/components/loader/loader";


const ProtectedRoute = ({ children }) => {
  const router = useRouter();
  const {
    eventUserDetails,
    setIsPosiflexLoginModalVisible,
    updateEventUserDetails,
  } = useLogin();
  const [isVerified, setIsVerified] = useState(false);

  useEffect(() => {
    const verifyUser = async () => {
      const userId = getTabSpecificData("userID");
      const eventId = getTabSpecificData("event_id");
      const accessToken = getTabSpecificData("accessToken");

      if (userId && accessToken) {
        try {
          const response = await axios.get(
            `${config.EVENTS_REGISTRATION_DETAILS}?user_id=${userId}&event_id=${eventId}`
          );

          if (response.data.data.id) {
            setIsVerified(true);
            updateEventUserDetails(response.data.data);
          } else {
            removeTabSpecificData("eventUserDetails");
            removeTabSpecificData("fcmToken");
            removeTabSpecificData("eventRegistered");
            removeTabSpecificData("event_id");
            router.push("/?redirect=events");
          }
        } catch (error) {
          console.error("Error verifying user:", error);
          removeTabSpecificData("eventUserDetails");
          removeTabSpecificData("fcmToken");
          removeTabSpecificData("eventRegistered");
          removeTabSpecificData("event_id");
          router.push("/?redirect=events");
        }
      } else {
        router.push("/?redirect=events");
      }
    };

    verifyUser();
  }, [router, updateEventUserDetails, setIsPosiflexLoginModalVisible]);

  if (!isVerified) {
    return <Loader />; // or a loading spinner
  }

  return children;
};

export default ProtectedRoute;
