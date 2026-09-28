import Image from "next/image";
import qugologo from "../../images/qugoLogo.png";
import "bootstrap/dist/css/bootstrap.css";
import style from "./styles.module.css";
import { useRouter } from "next/router";
import useLocalStorage from "@/hooks/useLocalStorage";
import { useState, useEffect } from "react";
import walletImg from "../../../public/img/wallet.png";
import corporate from "../../../public/img/Qugo Corporate black.png";
import { useLogin } from "@/store/context/LoginContext";
import { switchToCorporate } from "@/utils/common";
import axios, { getTabSpecificData, removeTabSpecificData, setTabSpecificData } from "@/utils/axios/axios";

export default function ProfileHeader({ isCorporateUser, walletBalance }) {
  const { activeProfile } = useLogin();

  const [getUserDetails, setUserDetails] = useLocalStorage("userDetails");
  const [loadedUserName, setLoadedUserName] = useState("User");
  const [storedUserName, setstoredUserName] = useState();
  const [cleanedUserName, setcleanedUserName] = useState();
  const [getUserID, setUserID] = useLocalStorage("userID");

  const router = useRouter();
  const goToHome = () => {
    router.push("/");
  };

  const goToProfile = () => {
    router.push("/profile");
  };

  useEffect(() => {
    if (typeof window !== "undefined" && window.sessionStorage) {
      // Retrieve the username from localStorage
      const storedUserName = getTabSpecificData("userDetails");

      // Check if the stored username exists and clean it (remove double quotes)
      if (storedUserName) {
        const cleanedUserName = storedUserName.replace(/"/g, "");
        setcleanedUserName(cleanedUserName);
      }
    }
  });

  const goToWalletDetails = () => {
    router.push("/walletDetails");
  };

  return (
    <>
      <div className={style.modalheader}>
        <div className={style.modalheaderimagediv}>
          <Image
            src={qugologo}
            className={style.modalheaderlogo}
            alt="WeynGo Logo"
            onClick={goToHome}
            style={{ cursor: "pointer" }}
          />
        </div>
        <div
          className={style.walletHeaderContainer}
          onClick={goToWalletDetails}
        >
          <div className={style.walletContainer}>
            <div className={style.innerContainer}>
              <Image
                className={style.walletLogo}
                src={walletImg}
                alt="walletImg"
                // onClick={goToHome}
              />
              <div className={style.walletInfo}>
                <div className={style.walletLabel}>Wallet</div>
                <div className={style.walletdiv}>
                  <div className={style.walletAmount}>Rs .{walletBalance} </div>
                  <span
                    className={style.rechargeLink}
                    onClick={goToWalletDetails}
                  >
                    Recharge
                  </span>
                </div>
              </div>
            </div>
          </div>
          {/* Your other div content */}
        </div>

        <button className={style.switchContainer} onClick={switchToCorporate}>
          <span className={style.switch}>Switch to</span>
          <Image className={style.CorpLogo} src={corporate} alt="WeynGo Corporate Logo" />
        </button>

        <div className={style.modaltitle} onClick={goToProfile}>
          Hey, {cleanedUserName || "User"}
        </div>
      </div>
    </>
  );
}
