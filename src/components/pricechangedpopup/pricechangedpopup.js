import styles from "./styles.module.css";
import { useState, useEffect, useRef } from "react";

export default function PriceChangedPopup({
  blockResponse,
  selectedRooms,
  bookRoomApiCall,
  closePopup,
}) {
  const [oldprice, setoldprice] = useState();
  const [newprice, setnewprice] = useState();
  const popupRef = useRef(null);

  useEffect(() => {
    const newPrice = setTotalPrice(selectedRooms);
    const oldPrice = setTotalPriceForBlockResponse(
      blockResponse.data.BlockRoomResult.HotelRoomsDetails
    );
    setoldprice(oldPrice);
    setnewprice(newPrice);

    document.addEventListener("click", handleDocumentClick);
    return () => {
      document.removeEventListener("click", handleDocumentClick);
    };
  }, []);

  const okButtonClicked = () => {
    bookRoomApiCall(blockResponse);
    closePopup();
  };
  function setTotalPrice(roomList) {
    let totalPrice = 0;
    let currencyCode = ""; // Variable to store the currency code

    for (const room of roomList) {
      const { price } = room;
      const { qOfferedPriceRoundedOff, currencyCode: roomCurrencyCode } = price; // Destructure the currency code

      currencyCode = roomCurrencyCode;
      totalPrice += qOfferedPriceRoundedOff * 1;
    }

    return `${totalPrice} ${currencyCode}`;
  }

  function setTotalPriceForBlockResponse(roomList) {
    let totalPrice = 0;
    let currencyCode = ""; // Variable to store the currency code

    for (const room of roomList) {
      const { Price } = room;
      const { qOfferedPriceRoundedOff, CurrencyCode: roomCurrencyCode } = Price; // Destructure the currency code

      currencyCode = roomCurrencyCode;
      totalPrice += qOfferedPriceRoundedOff * 1;
    }

    return `${totalPrice} ${currencyCode}`;
  }

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
      <div className={styles.modalBackdrop}></div>
      {popupRef && (
        <div className={styles.model} ref={popupRef}>
          <div className={styles.updated}>Update</div>
          <hr></hr>
          <div className={styles.confirmation}>
            <div>
              There are changes in the Hotel Policy, Cancellation Policy, or
              Room Price. Kindly review the updated information.
            </div>
            {blockResponse &&
              blockResponse.data.BlockRoomResult.IsPriceChanged &&
              oldprice != newprice && (
                <>
                  <div style={{ fontWeight: "bold" }}>
                    Old Price : {oldprice}
                  </div>
                  <div style={{ fontWeight: "bold" }}>
                    New Price : {newprice}
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
