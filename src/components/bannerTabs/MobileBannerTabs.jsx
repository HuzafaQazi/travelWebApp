import Image from "next/image";
import styles from "./MobileBannerTabs.module.css";

import icon1 from "../../../public/img/ion_home-outline.png";
import icon2 from "../../../public/img/Vector (1) 2.png";
import icon3 from "../../../public/img/Vector (2).png";

import { useLogin } from "@/store/context/LoginContext";
import { useRouter } from "next/router";
import { useState, useEffect } from "react";
import Loader from "../loader/loader";

const MobileBannerTabs = ({ isRedirect }) => {
  const { activeUrl, handleUrlChange } = useLogin();
  const router = useRouter();

  const [loading, setLoading] = useState(false);

  const handleRedirect = async (globalLink, redirectLink) => {
    handleUrlChange(globalLink);
    if (isRedirect) {
      setLoading(true);
      await router.push(redirectLink);
    }
  };

  const [isHomePage, setIsHomePage] = useState(false);

  useEffect(() => {
    // Check if running on the client
    if (typeof window !== "undefined") {
      setIsHomePage(window.location.pathname === "/");
    }
  }, []);

  return (
    <div className={styles.container}>
      {loading && <Loader />}
      <div
        className={isHomePage ? styles.linksContainer : styles.linksContainer1}
      >
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

export default MobileBannerTabs;
