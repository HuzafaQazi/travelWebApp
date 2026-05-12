import { useSelector } from "react-redux";

export const useUserPermissions = () => {
  const userDetails = useSelector((state) => state?.user?.userInfo);

  const loggedInDetails = userDetails?.loggedInDetails;
  const userType = loggedInDetails?.userDetails?.userTypeId;
  const isApprover = userType === 2 && loggedInDetails?.userDetails?.isApprover;
  const isAdminApprover =
    userType === 1 && loggedInDetails?.userDetails?.isApprover;

  return { userType, isApprover, isAdminApprover };
};
