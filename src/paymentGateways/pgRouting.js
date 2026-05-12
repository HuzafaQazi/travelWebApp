import { initCashFree } from "./cashFree";
import { initPhonePe } from "./phonePe";

async function routeToPg(
  pgCode,
  paymentSessionID,
  queryData,
  bookingId,
  travelCategory,
  paymentCategory,
  currentPath,
  companyId = null,
  options = {}
) {
  switch (pgCode) {
    case "CAS001":
      console.log("inside switch");
      let res = await initCashFree(
        paymentSessionID,
        queryData,
        bookingId,
        travelCategory,
        paymentCategory,
        currentPath,
        companyId,
        options
      );
      return res;
    // break;
    case "PHN002":
      console.log("inside switch 2");
      initPhonePe(paymentSessionID);
      break;
    default:
      break;
  }
}

export { routeToPg };
