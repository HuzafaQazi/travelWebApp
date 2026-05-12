import style from "./style.module.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Link from "next/link";
import { faTimesCircle } from "@fortawesome/free-solid-svg-icons";
export default function PaymentPopup({
  isLoading,
  walletBalance,
  walletSelected,
  amountPayable,
  checkwallet,
  handlePopupClick,
  handleProceedToPayClick,
  handleClose,
  totalAmount,
  bookingId,
}) {
  return (
    <div className={style.popupOverlay}>
      <div onClick={handlePopupClick} className={style.popupContent}>
        <div>
          {" "}
          <FontAwesomeIcon
            icon={faTimesCircle}
            className={style.closeIcon}
            onClick={handleClose}
          />
        </div>
        <div className={style.walletSection}>
          <div>
            <input
              type="checkbox"
              id="useWallet"
              name="useWallet"
              onChange={(e) => checkwallet(e, totalAmount)}
            />
            <label htmlFor="useWallet" className={style.useWalletLabel}>
              Use wallet payment
            </label>
          </div>
          <div className={style.walletBalance}>
            <span>Wallet Balance: Rs.</span>
            <span className={style.balanceAmount}>{walletBalance}</span>
            <Link
              href={{
                pathname: "/walletDetails",
                query: {
                  fromPage:
                    typeof window !== "undefined"
                      ? window?.location?.pathname +
                        `?booking_id=${bookingId}&profile=${true}`
                      : "/walletDetails",
                },
              }}
              as={`/walletDetails`}
            >
              Recharge now
            </Link>
          </div>
        </div>
        <button
          className={style.closeButton}
          onClick={() => handleProceedToPayClick(totalAmount)}
          disabled={isLoading}
        >
          {isLoading ? (
            <div className={style.loadingSpinner}></div>
          ) : !walletSelected || amountPayable > 0 ? (
            `Proceed to Pay Rs. ${amountPayable}`
          ) : (
            " Proceed to Book"
          )}
        </button>
      </div>
    </div>
  );
}
