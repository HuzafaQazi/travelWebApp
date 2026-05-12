import "bootstrap/dist/css/bootstrap.css";
import style from "./styles.module.css";
import "reactjs-popup/dist/index.css";
import { analytics } from "../../../utils/firebase";
import { logEvent } from "firebase/analytics";
import { useUserType } from "@/hooks/useUserType";

export default function RoomListItem(props) {
  const corporateUser = useUserType();

  function formatDate(dateString) {
    const options = { year: "numeric", month: "long", day: "numeric" };
    return new Date(dateString).toLocaleDateString(undefined, options);
  }

  const handleSelectNow = () => {
    let isReserveAllowed = false;
    if (new Date(props.room.lastVoucherDate) > new Date()) {
      isReserveAllowed = true;
    }
    props.handleRoomSelect(props.room.roomIndex, props.room.supplierCategoryId);
    if (props.isSelectable) {
      props.onBookRoom(
        props.room,
        props.hotel,
        props.roomCombinationsArray,
        isReserveAllowed // props.isReserveAllowed  (old)
      );
      logEvent(analytics, "room_selected", {
        roomIndex: props.room.roomIndex,
      });
    }
  };

  return (
    <>
      <div
        className={`${style.roomitem} ${
          !props.isSelectable && !props.isSelected ? style.disabled : ""
        }`}
      >
        <div className={style.roombrief}>
          <div className={style.roomdescription}>
            {props.room.roomTypeName}
            <span className={style.redtext}>
            </span>
          </div>
          <div className={style.roomAmenities}>{props.room.amenities}</div>
          <div className={style.cancellationDetails}>
            <div className={style.cancellationPolicyContainer}>
              <div className={style.cancellationPolicy}>
                Cancellation Policy
                <div className={style.tooltip}>
                  <table className={style.cancellationTable}>
                    <thead>
                      <tr>
                        <th className={style.tooltipHead}>
                          Cancelled on or After
                        </th>
                        <th className={style.tooltipHead}>
                          Cancelled on or Before
                        </th>
                        <th className={style.tooltipHead}>
                          Cancellation Charges
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {props.room.cancellationPolicies.map(
                        (cancellationPolicy, cancellationIndex) => (
                          <tr key={cancellationIndex}>
                            <td className={style.tooltipbody}>
                              {formatDate(cancellationPolicy.FromDate)}
                            </td>
                            <td className={style.tooltipbody}>
                              {formatDate(cancellationPolicy.ToDate)}
                            </td>
                            {cancellationPolicy.ChargeType === 1 ? (
                              <td className={style.tooltipbody}>
                                {cancellationPolicy.Charge}{" "}
                                {cancellationPolicy.Currency}
                              </td>
                            ) : cancellationPolicy.ChargeType === 2 ? (
                              <td className={style.tooltipbody}>
                                {cancellationPolicy.Charge}%
                              </td>
                            ) : cancellationPolicy.ChargeType === 3 ? (
                              <td className={style.tooltipbody}>
                                {cancellationPolicy.Charge} Nights
                              </td>
                            ) : null}
                          </tr>
                        )
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
            {props.room.lastVoucherDate &&
              props.room.lastVoucherDate !== null &&
              new Date(props.room.lastVoucherDate) > new Date() &&
              !corporateUser && (
                <div className={style.reserveLine}>
                  Free Reserve Up to : {formatDate(props.room.lastVoucherDate)}
                </div>
              )}
          </div>
        </div>
        <div className={style.endcolumn}>
          <div className={style.price}>
            Rs. {props.room.price.qOfferedPriceRoundedOff.toFixed(2)}
          </div>
          {!props.isSelected ? (
            <div className={style.solidbutton} onClick={handleSelectNow}>
              Book Now
            </div>
          ) : (
            <div className={style.solidbuttonDisabled}>Selected</div>
          )}
        </div>
      </div>
    </>
  );
}
