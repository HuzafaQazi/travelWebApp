import styles from "./styles.module.css";
import { useEffect, useRef } from "react";

export default function FlightsPriceChangedPopup({
  flightOldPrice,
  flightNewPrice,
  closePopup,
}) {
  const popupRef = useRef(null);

  useEffect(() => {
    document.addEventListener("click", handleDocumentClick);
    return () => {
      document.removeEventListener("click", handleDocumentClick);
    };
  }, []);

  const okButtonClicked = () => {
    closePopup();
  };

  const handleDocumentClick = (e) => {
    if (popupRef.current && !popupRef.current.contains(e.target)) {
      e.preventDefault(); // Prevent the default behavior of closing the popup
    }
  };

  useEffect(() => {
    if (popupRef) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "visible";
    }

    return () => {
      document.body.style.overflow = "visible";
    };
  }, [popupRef]);

  return (
    <>
      <div
        className={styles.modalBackdrop}
        // onClick={onBackdropClick}
      ></div>
      {popupRef && (
        <div className={styles.model} ref={popupRef}>
          <div className={styles.updated}>Update</div>
          <hr></hr>
          <div className={styles.confirmation}>
            <div>
              There are changes in the Flights Policy, Cancellation Policy and
              Flights Price. Kindly review the updated information.
            </div>
            {flightOldPrice != flightNewPrice && (
              <>
                <div className={styles.priceChanges}>
                  <div style={{ fontWeight: "bold", textAlign: "center" }}>
                    Old Price : {flightOldPrice}
                  </div>
                  <div style={{ fontWeight: "bold", textAlign: "center" }}>
                    New Price : {flightNewPrice}
                  </div>
                </div>
              </>
            )}
          </div>
          <hr></hr>
          <div className={styles.okButtonContainer}>
            <div className={styles.okButton} onClick={okButtonClicked}>
              Ok
            </div>
          </div>
        </div>
      )}
    </>
  );
}
