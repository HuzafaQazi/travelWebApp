// hooks/useUserType.js
import { useState, useEffect } from "react";
import { isCorporateUser } from "@/utils/common";

export function useUserType() {
  const [corporateUser, setCorporateUser] = useState(null);

  useEffect(() => {
    const checkUserType = () => {
      const userDetails = isCorporateUser();
      setCorporateUser(userDetails);
    };

    checkUserType();

    window.addEventListener("userTypeChanged", checkUserType);

    return () => {
      window.removeEventListener("userTypeChanged", checkUserType);
    };
  }, []);

  return corporateUser;
}
