import style from "./style.module.css";
import { useUserType } from "@/hooks/useUserType";
import { formatPrice } from "@/utils/common";
import { useSelector } from "react-redux";

export default function UseWalletBalanceButton({
  walletBalance,
  checkwallet,
  goToWalletDetails,
}) {
  const userDetails = useSelector((state) => state?.user?.userInfo);

  const corporateUser = useUserType();

  const isWalletAllowed =
    userDetails?.loggedInDetails?.configuration?.walletAllowed;

  return (
    <div className={style.walletDetails}>
      <label className={style.walletDetail}>
        <div>
          {walletBalance > 0 && (
            <input
              type="checkbox"
              style={{ marginRight: "5px" }}
              onChange={checkwallet}
            />
          )}
          {walletBalance > 0 && (
            <span className={style.walletText}>Use Wallet Balance</span>
          )}
        </div>
        <p className={style.walletText1}>
          Balance: Rs.{" "}
          {!corporateUser || (corporateUser && isWalletAllowed)
            ? formatPrice(walletBalance)
            : "***"}
        </p>
      </label>
      <div>
        {(!corporateUser || (corporateUser && isWalletAllowed)) && (
          <div className={style.walletInfo}>
            <button className={style.recharge} onClick={goToWalletDetails}>
              Recharge Now
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
