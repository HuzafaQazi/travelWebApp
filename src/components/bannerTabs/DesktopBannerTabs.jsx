import Image from "next/image";
import styles from "./DesktopBannerTabs.module.css";

import icon1 from "../../../public/img/ion_home-outline.png";
import icon2 from "../../../public/img/Vector (1) 2.png";
import icon3 from "../../../public/img/Vector (2).png";

import { useLogin } from "@/store/context/LoginContext";
import { useRouter } from "next/router";
import { useState } from "react";
import Loader from "../loader/loader";

const DesktopBannerTabs = ({ isRedirect }) => {
  const { activeUrl, handleUrlChange } = useLogin();
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [isCorporateUser, setIsCorporateUser] = useState(false);

  const handleRedirect = async (globalLink, redirectLink) => {
    handleUrlChange(globalLink);
    if (isRedirect) {
      setLoading(true);
      await router.push(redirectLink);
    }
  };

  return (
    <div className={styles.container}>
      {loading && <Loader />}
      <div className={styles.linksContainer}>
        <div
          className={`${styles.link} ${
            activeUrl === "flights" ? styles.activeLink : ""
          }`}
          onClick={() => handleRedirect("flights", "/")}
        >
          <Image className={styles.vectorIcons} src={icon2} alt="icon-2" />
          <a href="javascript:void(0)" className={styles.linkTag}>
            Flights
          </a>
        </div>
        <div
          className={`${styles.link} ${
            activeUrl === "hotels" ? styles.activeLink : ""
          }`}
          onClick={() => handleRedirect("hotels", "/")}
        >
          <Image className={styles.vectorIcons} src={icon1} alt="icon-1" />
          <a href="javascript:void(0)" className={styles.linkTag}>
            Hotels
          </a>
        </div>
        <div
          className={`${styles.link} ${
            activeUrl === "packages" ? styles.activeLink : ""
          }`}
          onClick={() => handleRedirect("packages", "/")}
        >
          <Image className={styles.vectorIcons} src={icon3} alt="icon-3" />
          <a href="javascript:void(0)" className={styles.linkTag}>
            Packages
          </a>
        </div>
      </div>
      <hr className={styles.divider} />
    </div>
  );
};

export default DesktopBannerTabs;
