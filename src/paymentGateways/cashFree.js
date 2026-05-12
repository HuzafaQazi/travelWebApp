import { load } from "@cashfreepayments/cashfree-js";
import config from "@/config";
import { PAYMENT_URLS } from "@/utils/constants";

/**  {
  customReturnPath: "thank-you",
  customQueryParams: {
    booking: bookingId,
    ref: "xyz789",
    type: "flight",
  },
     }
*/

async function initCashFree(
  paymentSessionID,
  data,
  bookingId,
  travelCategory,
  paymentCategory,
  currentPath,
  companyId,
  options = {}
) {
  const {
    customReturnPath = "", // Your own path like /thank-you
    customQueryParams = {}, // Your own query params like { ref: "abc123", type: "hotel" }
  } = options;

  console.log(
    "travelCategory ",
    travelCategory,
    " paymentCategory ",
    paymentCategory
  );

  // Determine path and query string
  let path = "";
  let queryString = "";

  if (customReturnPath) {
    path = customReturnPath;
  } else if (paymentCategory === "WALLET_RECHARGE") {
    console.log("currentPath", currentPath);
    path = currentPath;
  } else {
    // Handle different travel categories and check for companyId
    const categoryUrls = PAYMENT_URLS.TRAVEL[travelCategory]?.[paymentCategory];

    if (!categoryUrls) {
      throw new Error(
        `Unsupported combination: travelCategory=${travelCategory}, paymentCategory=${paymentCategory}`
      );
    }

    // Use company URL if companyId exists and URL is defined for this category
    path =
      companyId && categoryUrls.CORPORATE
        ? categoryUrls.CORPORATE
        : categoryUrls.DEFAULT;

    // Add query parameters based on category and conditions
    if (travelCategory === 1 && companyId) {
      // For company hotels, include bookingId
      queryString = `?bookingId=${bookingId}`;
    } else if (travelCategory === 2 || travelCategory === 3) {
      // For flights and packages, keep original behavior
      queryString = `?booking_id=${bookingId}`;
    }
  }

  if (Object.keys(customQueryParams).length > 0) {
    const params = new URLSearchParams(customQueryParams);
    queryString = `?${params.toString()}`;
  }

  // Determine CashFree mode based on environment
  const mode =
    process.env.ENV === "qa" || process.env.ENV === "test"
      ? "sandbox"
      : "production";

  // Initialize CashFree
  const cashfree = await load({ mode });
  const version = cashfree.version();
  console.log(`Cashfree version is ${version}`);

  // Get base URL from config
  const baseurl = config.WEB_BASE_URL;
  console.log("baseurl =>", baseurl);
  console.log("path =>", path);
  console.log("queryString =>", queryString);

  // Prepare checkout options
  const checkoutOptions = {
    paymentSessionId: paymentSessionID,
    returnUrl: `${baseurl}${path}${queryString}`,
  };

  // Process checkout
  const result = await cashfree.checkout(checkoutOptions);
  console.log("cashfree result: ", result);

  return result;
}

export { initCashFree };
