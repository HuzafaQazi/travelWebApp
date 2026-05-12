import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { useSelector } from "react-redux";
import ProfileCompletionModal from "../Modal/ProfileCompletionModal";
import {
  selectIsLoggedIn,
  selectB2CUserId,
  selectIsProfileIncomplete,
  selectB2CHasCheckedAuth,
} from "@/store/selectors/b2cSelectors";
import { selectCorporateIsAuthenticated } from "@/store/selectors/corporateSelectors";
import { getActiveUserType } from "@/utils/axios/axios";

const ProfileCompletionGuard = ({ children }) => {
  const router = useRouter();
  const isB2CLoggedIn = useSelector(selectIsLoggedIn);
  const isCorporateLoggedIn = useSelector(selectCorporateIsAuthenticated);
  const userId = useSelector(selectB2CUserId);
  const isProfileIncomplete = useSelector(selectIsProfileIncomplete);
  const hasCheckedAuth = useSelector(selectB2CHasCheckedAuth);

  const [showModal, setShowModal] = useState(false);

  // Routes where profile completion is not required
  const exemptRoutes = [
    "/", // Home page (but check if logged in)
    "/corporate", // Corporate login
  ];

  // Check if current route is exempt
  const isExemptRoute = exemptRoutes.includes(router.pathname);

  useEffect(() => {
    // Wait for auth check to complete
    if (!hasCheckedAuth) {
      return;
    }

    // ✅ Only check for QUGO users (not corporate)
    const activeUserType = getActiveUserType();
    const isQugoUser = activeUserType === "qugo";

    // Only proceed if user is logged in as Qugo/B2C user
    if (isQugoUser && isB2CLoggedIn && userId) {
      // Check if profile is incomplete
      if (isProfileIncomplete) {
        console.log(
          "🚨 Qugo user profile incomplete, showing completion modal"
        );
        setShowModal(true);
      } else {
        setShowModal(false);
      }
    } else {
      // User not logged in as Qugo or is corporate user, don't show modal
      setShowModal(false);
    }
  }, [
    isB2CLoggedIn,
    userId,
    isProfileIncomplete,
    hasCheckedAuth,
    router.pathname,
    isExemptRoute,
    isCorporateLoggedIn,
  ]);

  return (
    <>
      <ProfileCompletionModal show={showModal} userId={userId} />
      {children}
    </>
  );
};

export default ProfileCompletionGuard;
