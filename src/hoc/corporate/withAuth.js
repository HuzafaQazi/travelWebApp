// withAuth.js
import { useRouter } from "next/router";
import { useEffect } from "react";
import { getTabSpecificData, handleLogout } from "@/utils/axios/axios";

const withAuth = (WrappedComponent) => {
  const Wrapper = (props) => {
    const router = useRouter();

    useEffect(() => {
      const token = getTabSpecificData("token");
      if (!token) {
        handleLogout(); // Call the logout function if token is not present
      }
    }, []);

    return <WrappedComponent {...props} />;
  };

  return Wrapper;
};

export default withAuth;
