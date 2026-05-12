import { useSelector } from "react-redux";
import { useRouter } from "next/router";
import { useEffect } from "react";
import {
  selectIsLoggedIn,
  selectB2CUserId,
} from "@/store/selectors/b2cSelectors";

export const withB2CAuth = (ModalComponent) => {
  return function ProtectedModal({ isOpen, onClose, ...props }) {
    const router = useRouter();
    const isAuthenticated = useSelector(selectIsLoggedIn);
    const userId = useSelector(selectB2CUserId);

    useEffect(() => {
      if (isOpen && (!isAuthenticated || !userId)) {
        console.log("ProtectedModal: User not authenticated, closing modal");
        onClose();
        // Show login modal or redirect
        router.push("/?showLogin=true", undefined, { shallow: true });
      }
    }, [isOpen, isAuthenticated, userId, onClose, router]);

    if (!isAuthenticated || !userId) {
      return null;
    }

    return <ModalComponent isOpen={isOpen} onClose={onClose} {...props} />;
  };
};

// Usage:
// export default withB2CAuth(ProfileModal);
