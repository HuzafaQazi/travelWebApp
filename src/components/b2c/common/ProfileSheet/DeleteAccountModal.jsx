import React from "react";
import style from "./styles.module.css";

export default function DeleteAccountModal({
  showWarning,
  walletBalance,
  handleConfirmDelete,
  handleCancelDelete,
}) {
  if (!showWarning) return null;

  return (
    <div className={style.popupOverlay}>
      <div className={style.popupContent}>
        {walletBalance > 0 && (
          <div className={style.walletText1}>
            Your wallet Balance{" "}
            <span className={style.walletText}>Rs.{walletBalance}</span>{" "}
          </div>
        )}

        <div className={style.walletText1}>
          {" "}
          Are you sure still you want to delete your account?
        </div>
        <div className={style.buttonContainer}>
          <button
            className={`${style.button} ${style.delete}`}
            onClick={handleConfirmDelete}
          >
            Yes
          </button>
          <button
            className={`${style.button} ${style.cancel}`}
            onClick={handleCancelDelete}
          >
            No
          </button>
        </div>
      </div>
    </div>
  );
}
