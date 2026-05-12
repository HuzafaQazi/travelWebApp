import React from "react";
import { useSelector } from "react-redux";
import style from "./styles.module.css";
import "bootstrap/dist/css/bootstrap.css";
import { useState, useEffect } from "react";
import profile from "@/images/profile.png";
import briefcase from "@/images/briefcase.png";
import logoutIcon from "@/images/logoutIcon.png";
import Image from "next/image";
import { Collapse } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCaretDown,
  faCaretRight,
  faTrash,
} from "@fortawesome/free-solid-svg-icons";
import { handleLogout } from "@/utils/axios/axios";
import "react-toastify/dist/ReactToastify.css";
import TabTitle from "@/components/tabtitles/tabtitle";
import { useLogin } from "@/store/context/LoginContext";
import deleteUserAccount from "@/utils/deleteUserAccount";
import { useUserType } from "@/hooks/useUserType";
import FlightLoader from "@/components/loader/FlightLoader";

import ProfileSection from "./ProfileSection";
import BookingSection from "./BookingSection";
import DeleteAccountModal from "./DeleteAccountModal";
import {
  selectB2CWalletBalance,
  selectB2CUserId,
} from "@/store/selectors/b2cSelectors";
import showToast from "@/utils/toast";

const ProfileSheet = ({ isOpen, onClose }) => {
  const userId = useSelector(selectB2CUserId);
  const walletBalance = useSelector(selectB2CWalletBalance);

  const { setAccessToken, setShowLoginButton } = useLogin();
  const corporateUser = useUserType();

  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [showWarning, setShowWarning] = useState(false);
  const [parentLoader, setParentLoader] = useState(false);

  const handleDeleteUser1 = async () => {
    setShowWarning(true);
  };

  const handleConfirmDelete = async () => {
    await deleteUserAccount(userId);
    showToast("success","User account deleted successfully!");
    setTimeout(() => {
      handleProfileLogout();
    }, 1000);
    setShowWarning(false);
  };

  const handleCancelDelete = () => {
    setShowWarning(false);
  };

  useEffect(() => {
    if (showWarning) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "visible";
    }

    return () => {
      document.body.style.overflow = "visible";
    };
  }, [showWarning]);

  const handleProfileLogout = async () => {
    await handleLogout();
    setAccessToken(null);
    setShowLoginButton(true);
    onClose();
  };

  return (
    <>
      {/* Overlay */}
      <div
        className={`fixed inset-0 bg-black/40 z-[999999999999] transition-opacity duration-300 ${
          isOpen ? "opacity-100 visible" : "opacity-0 invisible"
        }`}
        onClick={onClose}
      />

      {/* Right Drawer */}
      <div
        className={`fixed top-0 right-0 h-screen w-full sm:w-[75%] bg-white z-[9999999999999] shadow-lg transform transition-transform duration-300 ease-in-out 
        ${isOpen ? "translate-x-0" : "translate-x-full"}`}
      >
        {/* Header */}
        <div className="flex justify-end items-end border-b px-2 bg-[#028fa3]">
          <button
            onClick={onClose}
            className="text-white hover:text-black text-2xl"
          >
            ×
          </button>
        </div>

        {/* Body */}
        <div className="p-0 overflow-y-auto h-full">
          <div className="p-0">
            <div className={style.bluebgcontainer1}>
              {parentLoader && <FlightLoader isContentRequired={false} />}
              <TabTitle title={"Profile"}>
                <div className={style.bluebgcontainer}>
                  {/* Profile container */}
                  <div
                    className={style.listtile}
                    onClick={() => {
                      setIsProfileOpen(!isProfileOpen);
                    }}
                    aria-controls="example-collapse-text"
                    aria-expanded={isProfileOpen}
                  >
                    <Image
                      className={style.listtileicon}
                      src={profile}
                      alt="Unable to load list tile icon"
                    ></Image>
                    <div className={style.listtilecontent}>
                      <div className={style.listtiletitle}>
                        Profile{" "}
                        <FontAwesomeIcon
                          icon={isProfileOpen ? faCaretDown : faCaretRight}
                          color="white"
                          style={{ fontSize: "20px", marginLeft: "8px" }}
                        />{" "}
                      </div>
                      <div className={style.listtiledescription1}>
                        Manage your login details
                      </div>
                    </div>
                  </div>
                  <Collapse in={isProfileOpen}>
                    <div className={isProfileOpen ? "visible" : "hidden"}>
                      <ProfileSection userID={userId} />
                    </div>
                  </Collapse>

                  {/* Booking container */}
                  <BookingSection
                    userID={userId}
                    corporateUser={corporateUser}
                    walletBalance={walletBalance}
                    setParentLoader={setParentLoader}
                    onClose={onClose}
                  />

                  <div
                    style={{
                      display: "flex",
                      marginLeft: "14px",
                      cursor: "pointer",
                      width: "32%",
                    }}
                    onClick={handleDeleteUser1}
                  >
                    <FontAwesomeIcon
                      icon={faTrash}
                      color="white"
                      className={style.listtileicon1}
                    />
                    <div className={style.listtilecontent}>
                      <div className={style.listtiletitle}>Delete Account </div>
                    </div>
                  </div>

                  <DeleteAccountModal
                    showWarning={showWarning}
                    walletBalance={walletBalance}
                    handleConfirmDelete={handleConfirmDelete}
                    handleCancelDelete={handleCancelDelete}
                  />

                  {/* Logout Button */}
                  <div
                    className={style.logoutButton}
                    onClick={handleProfileLogout}
                  >
                    <Image
                      className={style.logoutIcon}
                      src={logoutIcon}
                      alt="Unable to load list tile icon"
                    ></Image>
                    <div className={style.verticalLine}></div>
                    Logout
                  </div>
                </div>
              </TabTitle>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ProfileSheet;
