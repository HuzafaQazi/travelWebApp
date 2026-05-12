import { useLogin } from "@/store/context/LoginContext";
import DesktopNavigation from "../desktopNavigation/desktopNavigation";
import NavigationModify from "../navigationModify/navigationModify";
import styles from "./styles.module.css";

export default function Banner({
  setPageLoading,
  selectedTravelers,
  setSelectedTravelers,
  handleTravelerChange,
}) {
  const { isLoggedIn } = useLogin();

  return (
    <>
      <div className={styles.navigationContainer}>
        <NavigationModify
          setPageLoading={setPageLoading}
          selectedTravelers={selectedTravelers}
          setSelectedTravelers={setSelectedTravelers}
          handleTravelerChange={handleTravelerChange}
        />
      </div>
      <div className={styles.desktopNavigationContainer}>
        <DesktopNavigation
          setPageLoading={setPageLoading}
          selectedTravelers={selectedTravelers}
          setSelectedTravelers={setSelectedTravelers}
          handleTravelerChange={handleTravelerChange}
        />
      </div>
    </>
  );
}
