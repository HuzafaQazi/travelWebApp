import { useState, useEffect } from "react";
import HeaderCommon from "@/components/HeaderCommon/HeaderCommon";
import B2CHeader from "@/components/flights/B2cHeader/Header";
import styles from "@/pages/packages/PackageDetail.module.css";
import { faCheck, faTimesCircle } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Button } from "react-bootstrap";
import useLocalStorage from "@/hooks/useLocalStorage";
import Footer from "@/components/footer/footer";
import { useRouter } from "next/router";
import {
  savePaymentDetails,
  packageBookingDetail,
  generateCommonInvoice,
  generateCommonPDFInvoice,
} from "../../../utils/profileAPI";
import Loader from "@/components/loader/loader";
import { toast } from "react-toastify";
import Link from "next/link";
import {
  getPaymentGateway,
  getPaymentSessionID,
} from "../../../utils/bookingAPI";
import { routeToPg } from "@/paymentGateways/pgRouting";
import { confirmPaymentPackages } from "../../../utils/walletApis";
import WebSocketService from "@/webSocketService/WebSocketService";
import { useUserType } from "@/hooks/useUserType";
import Header from "@/components/corporate/auth/Header";
import Footer1 from "@/components/corporate/footerCorporate/footerCorporate";
import { useWalletBalance } from "@/hooks/useWalletBalance";
import axios, { getTabSpecificData,setTabSpecificData,removeTabSpecificData } from "@/utils/axios/axios";
export default function Confirmbooking() {
  const router = useRouter();
  const { booking_id } = router.query;
  const [fetchedData, setFetchedData] = useState("");
  const [fetchedPackageBookingData, setFetchedPackageBookingData] =
    useState("");
  const [isPaymentPopup, setIsPaymentPopup] = useState(false);
  const [getUserID, setUserID] = useLocalStorage("userID");

  const { walletBalance, fetchBalance } = useWalletBalance();

  const [walletSelected, setWalletSelected] = useState(false);
  const [amountPayable, setAmountPayable] = useState();
  const [isLoading, setIsLoading] = useState(false);
  const corporateUser = useUserType();


  useEffect(() => {
    const webSocketService = new WebSocketService();
    if (booking_id) callBookingDetail();
    const topic = `/topic/${booking_id}`;
    const callback = (message, context) => {
      console.log("Received message:", message);
      if (booking_id) callBookingDetail();
    };

    webSocketService.connect(topic, callback, {});

    return () => {
      webSocketService.disconnect();
    };
  }, [booking_id]);

  const iconSize = "3x";
  function callBookingDetail() {
    const callPaymentDetail = async () => {
      try {
        const packageBookingDetailResp = await packageBookingDetail(booking_id);
        let paymentDetailResp;
        if (packageBookingDetailResp.data.amount_payable > 0)
          paymentDetailResp = await savePaymentDetails(booking_id, 3);

        if (
          packageBookingDetailResp.data.payment_status !== 0 ||
          paymentDetailResp.data.payment_status === "FAILED"
        ) {
          setFetchedData(packageBookingDetailResp.data);

          const encodedPayload = btoa(
            JSON.stringify(packageBookingDetailResp.data)
          );

          setTabSpecificData("packageBookingDetail", encodedPayload);
          setFetchedPackageBookingData(packageBookingDetailResp.data);

          let paymentStatus =
            packageBookingDetailResp?.data?.payment_status == 1
              ? "SUCCESS"
              : "FAILED";
         

          setFetchedData((prevResponse) => ({
            ...prevResponse,
            ps_payment_status: paymentStatus,
          }));
          if (paymentStatus === "SUCCESS") {
            if (packageBookingDetailResp.status) {
              const payload = {
                ...(packageBookingDetailResp.data.company_id && {
                  companyId: packageBookingDetailResp.data.company_id,
                }),
                bookingId: packageBookingDetailResp.data.booking_id,
                travelCategory: 3,
                invoiceData: {
                  id: packageBookingDetailResp.data.id,
                  user_id: packageBookingDetailResp.data.user_id,
                  package_id: packageBookingDetailResp.data.package_id,
                  user_name: packageBookingDetailResp.data.user_name,
                  email: packageBookingDetailResp.data.email,
                  mobile: packageBookingDetailResp.data.mobile,
                  destination: packageBookingDetailResp.data.destination,
                  date_of_travel: packageBookingDetailResp.data.date_of_travel,
                  guest_count: packageBookingDetailResp.data.guest_count,
                  discount_percentage:
                    packageBookingDetailResp.data?.discount_percentage || 0,
                  discount_price:
                    packageBookingDetailResp.data?.discount_price || 0,
                  price: packageBookingDetailResp.data?.price || 0,
                  total_price: packageBookingDetailResp.data?.total_price || 0,
                  wallet_amount:
                    packageBookingDetailResp.data?.wallet_amount_used,
                  payment_status: packageBookingDetailResp.data.payment_status,
                  booking_id: packageBookingDetailResp.data.booking_id,
                  createdAt: packageBookingDetailResp.data.createdAt,
                  updatedAt: packageBookingDetailResp.data.updatedAt,
                  package_ref: {
                    id: packageBookingDetailResp.data.package_ref.id,
                    title: packageBookingDetailResp.data.package_ref.title,
                    ratings: packageBookingDetailResp.data.package_ref.ratings,
                    reviews_count:
                      packageBookingDetailResp.data.package_ref.reviews_count,
                    price: packageBookingDetailResp.data.package_ref.price,
                    offer_price:
                      packageBookingDetailResp.data.package_ref?.offer_price ||
                      0,
                    offer_percentage:
                      packageBookingDetailResp.data.package_ref
                        ?.offer_percentage || 0,
                    no_of_days:
                      packageBookingDetailResp.data.package_ref?.no_of_days,
                    no_of_nights:
                      packageBookingDetailResp.data.package_ref?.no_of_nights,
                    highlights:
                      packageBookingDetailResp.data.package_ref?.highlights,
                    overview:
                      packageBookingDetailResp.data.package_ref?.overview,
                    thumbnail_image:
                      packageBookingDetailResp.data.package_ref
                        ?.thumbnail_image,
                    banner_image:
                      packageBookingDetailResp.data.package_ref?.banner_image,
                    gallery_images:
                      packageBookingDetailResp.data.package_ref?.gallery_images,
                    cityname:
                      packageBookingDetailResp.data.package_ref?.cityname,
                    countryname:
                      packageBookingDetailResp.data.package_ref?.countryname,
                  },
                },
              };
              await generateCommonInvoice(payload);

              const encodedResponse = getTabSpecificData(
                "packageBookingDetail"
              );
              if (encodedResponse) {
                // Remove local storage after decoding
                removeTabSpecificData("packageBookingDetail");
              }
            }
          }
        } else {
          setFetchedData((prevResponse) => ({
            ...prevResponse,
            ps_payment_status: "PENDING",
          }));
        }
      } catch (error) {
        console.log(error);
      }
    };
    if (booking_id) {
      callPaymentDetail();
    }
  }
  function formatTimestampToDDMMYYYY(timestamp) {
    const date = new Date(timestamp);
    const dd = String(date.getDate()).padStart(2, "0");
    const mm = String(date.getMonth() + 1).padStart(2, "0"); // Months are zero-based
    const yyyy = date.getFullYear();
    return dd + "/" + mm + "/" + yyyy;
  }

  const formatPrice = (price) => {
    return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };

  function generateDummyPdf() {
    // PDF content with a simple text "Hello, Dummy PDF!"
    const pdfContent =
      "%PDF-1.3\n1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n3 0 obj\n<< /Type /Page /Parent 2 0 R /Resources << /Font << /F1 4 0 R >> >> /MediaBox [0 0 612 792] /Contents 5 0 R >>\nendobj\n4 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj\n5 0 obj\n<< /Length 44 >>\nstream\nBT\n/F1 24 Tf\n100 100 Td\n(Hello, Dummy PDF!) Tj\nET\nendstream\nendobj\nxref\n0 6\n0000000000 65535 f \n0000000010 00000 n \n0000000060 00000 n \n0000000115 00000 n \n0000000215 00000 n \n0000000310 00000 n \ntrailer\n<< /Size 6 /Root 1 0 R >>\nstartxref\n410\n%%EOF\n";
    const encoder = new TextEncoder();
    return encoder.encode(pdfContent);
  }
  const handlePopupClick = (e) => {
    e.stopPropagation();
  };

  const handleClose = () => {
    setIsPaymentPopup(false);
  };

  const handleOutsideClick = () => {
    setIsPaymentPopup(false);
  };

  const checkwallet = async (e) => {
    e.stopPropagation();

    if (walletSelected) {

      setWalletSelected(false);
      setAmountPayable(fetchedPackageBookingData.total_price);
    } else {
      setWalletSelected(true);
      let payable = 0;
      if (fetchedPackageBookingData.total_price > walletBalance) {
        payable = fetchedPackageBookingData.total_price - walletBalance;
      }

      setAmountPayable(payable);
    }

  };

  const retryPayment = async () => {
    setIsLoading(true);
    try {
      if (booking_id) {
        const bookingId = booking_id;
        const total_price = fetchedPackageBookingData.total_price;
        const mobile_number = fetchedPackageBookingData.mobile;
        const pgRes = await getPaymentGateway();
        if (pgRes.status === "SUCCESS") {
          if (amountPayable > 0) {
            let getPaymeneSessionIDResp = await getPaymentSessionID(
              null,
              Math.max(0,Math.round(total_price) - Math.round(amountPayable)),
              0,
              "BOOKING",
              bookingId,
              Math.round(amountPayable),
              mobile_number,
              pgRes.data.pgCode,
              3
            );
            if (
              getPaymeneSessionIDResp !== null &&
              getPaymeneSessionIDResp.data.data.paymentSessionId !== ""
            ) {
              const queryParams = {
                package_id: fetchedPackageBookingData.package_id,
                booking_id: bookingId,
              };
              routeToPg(
                pgRes.data.pgCode,
                getPaymeneSessionIDResp.data.data.paymentSessionId,
                queryParams,
                bookingId,
                3,
                "BOOKING"
              );
            }
          } else {
            let confirmReq = {
              booking_id: bookingId,
              payment_status: 1,
              payment_amount: amountPayable,
              wallet_amount: total_price - amountPayable,
            };
            const resp = await confirmPaymentPackages(confirmReq);
            if (resp) {
              callBookingDetail();
              // router.push({
              //   pathname: "/packages/confirmbooking",
              //   query: { booking_id: bookingId},
              // });
            }
          }
        }
      }
    } catch (error) {
      console.log(error);
      toast("Something went wrong");
    }
    setIsLoading(false);
  };
  const handlePaymentPopup = async (e) => {
    e.stopPropagation();

    setAmountPayable(fetchedPackageBookingData.total_price);

    setIsPaymentPopup(!isPaymentPopup);
  };

  useEffect(() => {
    if (isPaymentPopup) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "visible";
    }

    return () => {
      document.body.style.overflow = "visible";
    };
  }, [isPaymentPopup]);
  const goToWalletDetails = () => {
    router.push("/walletDetails");
  };
  const fetchAndDownloadInvoice = async () => {
    try {
      const invoiceData = await generateCommonPDFInvoice(
        fetchedData.booking_id,
        3
      );
      const pdfData = invoiceData; // Binary PDF data
      if (pdfData && pdfData.byteLength > 0) {
        const blob = new Blob([pdfData], { type: "application/pdf" });

        // Trigger download
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = "INV_" + booking_id + ".pdf";
        link.click();

        return URL.revokeObjectURL(link.href);
      }
      return toast("something went wrong!");
    } catch (error) {
      console.error("Error fetching invoice data:", error);
    }
  };

  if (!fetchedData) {
    return <Loader />;
  }



  if (fetchedData.ps_payment_status === "FAILED") {
    return (
      <>
        <div className={styles.mainPage}>
          {!corporateUser ? (
            <div className={styles.secondheaderCommons}>
              {/* <HeaderCommon /> */}
              <B2CHeader/>
            </div>
          ) : (
            <div style={{ backgroundColor: "#ffffff" }}>
              <Header />
            </div>
          )}
          <div className={styles.paymentFailed}>
            <div>
              <div className={styles.paymentMessage}>
                Oops ! your last payment was failed. Please click on Retry
                Payment button to try again.
              </div>
              <div className={styles.paymentFailedButton}>
                {/* <div className={styles.goToHomePageButton}>Go To Home</div> */}
                {/* <div className={styles.retryButton}>Retry Payment</div> */}
                <div
                  className={styles.retryButtonLink}
                  onClick={handlePaymentPopup}
                >
                  <div className={styles.retryButton}>Retry Payment</div>
                </div>
                {isPaymentPopup && (
                  <div
                    className={styles.popupOverlay}
                    onClick={handleOutsideClick}
                  >
                    <div
                      onClick={handlePopupClick}
                      className={styles.popupContent}
                    >
                      <div>
                        {" "}
                        <FontAwesomeIcon
                          icon={faTimesCircle}
                          className={styles.closeIcon}
                          onClick={handleClose}
                        />
                      </div>
                      <div className={styles.walletSection}>
                        <div>
                          {walletBalance > 0 && (
                            <input
                              type="checkbox"
                              id="useWallet"
                              name="useWallet"
                              onChange={checkwallet}
                            />
                          )}
                          {walletBalance > 0 && (
                            <label
                              htmlFor="useWallet"
                              className={styles.useWalletLabel}
                            >
                              Use wallet payment
                            </label>
                          )}
                        </div>
                        <div className={styles.walletBalance}>
                          <span> Wallet Balance: Rs.</span>
                          <span className={styles.balanceAmount}>
                            {walletBalance}
                          </span>
                          <Link
                            href={{
                              pathname: "/walletDetails",
                              query: {
                                fromPage:
                                  typeof window !== "undefined"
                                    ? window.location.pathname +
                                      `?booking_id=${booking_id}`
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
                        className={styles.closeButton}
                        onClick={() => retryPayment()}
                        disabled={isLoading}
                      >
                        {" "}
                        {isLoading ? (
                          <div className={styles.loadingSpinner}></div>
                        ) : !walletSelected || amountPayable > 0 ? (
                          `Proceed to Pay Rs. ${amountPayable}`
                        ) : (
                          " Proceed to Book"
                        )}
                      </button>
                    </div>
                  </div>
                )}
              </div>
              <div className={styles.goToHomeLink}>
                <Link className={styles.goToHomeLinkTab} href={"/"}>
                  Go To Home
                </Link>
              </div>
            </div>
          </div>

          {!corporateUser ? <Footer /> : <Footer1 />}
        </div>
      </>
    );
  }

  return (
    <>
      <div className={styles.mainPage}>
        {!corporateUser ? (
          <div className={styles.secondheaderCommons}>
            {/* <HeaderCommon /> */}
            <B2CHeader/>
          </div>
        ) : (
          <div style={{ backgroundColor: "#ffffff" }}>
            <Header />
          </div>
        )}
        {fetchedData.ps_payment_status === "SUCCESS" && (
          <>
            <div className={styles.bookingContainer}>
              <div className={styles.topbookingContainer}>
                <div className={styles.leftBooking}>
                  <div className={styles.tickIcon}>
                    <FontAwesomeIcon
                      icon={faCheck}
                      size={iconSize}
                      style={{ color: "white" }}
                    />
                  </div>
                </div>
                <div className={styles.rightBooking}>
                  <div className={styles.topFlex}>
                    <div className={styles.bookingHead}>Booking Successful</div>

                    <div className={styles.invoiceButton}>
                      <Button
                        style={{
                          backgroundColor: "#028FA3",
                          fontSize: "9px",
                          padding: "0px",
                          border: "none",
                          display: "flex",
                          alignItems: "center",
                        }}
                        className="myButton"
                        onClick={fetchAndDownloadInvoice}
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="35"
                          height="35"
                          viewBox="0 0 53 53"
                          fill="none"
                        >
                          <g clip-path="url(#clip0_2907_2208)">
                            <path
                              d="M26.4997 9.16668C36.0547 9.16668 43.833 16.945 43.833 26.5C43.833 36.055 36.0547 43.8333 26.4997 43.8333C16.9447 43.8333 9.16634 36.055 9.16634 26.5C9.16634 16.945 16.9447 9.16668 26.4997 9.16668ZM26.4997 4.83334C14.5397 4.83334 4.83301 14.54 4.83301 26.5C4.83301 38.46 14.5397 48.1667 26.4997 48.1667C38.4597 48.1667 48.1663 38.46 48.1663 26.5C48.1663 14.54 38.4597 4.83334 26.4997 4.83334ZM28.6663 26.5V17.8333H24.333V26.5H17.833L26.4997 35.1667L35.1663 26.5H28.6663Z"
                              fill="white"
                            />
                          </g>
                          <defs>
                            <clipPath id="clip0_2907_2208">
                              <rect
                                width="52"
                                height="52"
                                fill="white"
                                transform="translate(0.5 0.5)"
                              />
                            </clipPath>
                          </defs>
                        </svg>
                        Download Invoice
                      </Button>
                    </div>
                  </div>
                  <div className={styles.bookingdetails}>
                    Booking details will be sent on your contact number and
                    email.
                  </div>

                  <div className={styles.idDetails}>
                    <div className={styles.bothid}>
                      <div className={styles.inlineId}>
                        Booking Id :{" "}
                        <div style={{ fontWeight: "normal" }}>
                          {" "}
                          {fetchedData.booking_id}
                        </div>
                      </div>
                      <div className={styles.inlineId}>
                        Package Id :{" "}
                        <div style={{ fontWeight: "normal" }}>
                          {" "}
                          {fetchedData.package_id}
                        </div>
                      </div>
                    </div>
                    <div className={styles.inlineId}>
                      Booked on :{" "}
                      <div style={{ fontWeight: "normal" }}>
                        {formatTimestampToDDMMYYYY(fetchedData.createdAt)}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className={styles.bottombookingContainer}>
                <div className={styles.detailsHead}>Booking Details</div>
                <div className={styles.packageName}>
                  Package{" "}
                  <div>
                    {fetchedData.package_ref.title} -{" "}
                    {fetchedData.package_ref.countryname},{" "}
                    {fetchedData.package_ref.cityname}
                  </div>
                </div>
                <div className={styles.packageName}>
                  Travel Date{" "}
                  <div>
                    {formatTimestampToDDMMYYYY(fetchedData.date_of_travel)}
                  </div>
                </div>
                <div className={styles.detailsHead}>Traveler Details</div>
                <div className={styles.packageName}>
                  Name of the traveler <div>{fetchedData.user_name}</div>
                </div>
                <div className={styles.packageName}>
                  Mobile Number <div>+ 91 {fetchedData.mobile}</div>
                </div>
                <div className={styles.packageName}>
                  Number of travelers <div>{fetchedData.guest_count}</div>
                </div>
                <div className={styles.detailsHead}>Payment Details</div>
                <div className={styles.packageName}>
                  Package Price{" "}
                  <div>
                    Rs {formatPrice(fetchedData.price)}
                  </div>
                </div>
                {fetchedData.discount_percentage && (
                  <div className={styles.packageName}>
                    Discount percentage{" "}
                    <div>{fetchedData.discount_percentage}%</div>
                  </div>
                )}
                {/* {fetchedData.wallet_amount_used > 0 && ( */}
                <div className={styles.packageName}>
                  Wallet Amount Paid{" "}
                  <div>Rs.{fetchedData.wallet_amount_used}</div>
                </div>
                {/* )} */}
                {fetchedData.amount_payable > 0 && (
                  <div className={styles.packageName}>
                    Amount Paid By Other Modes
                    <div> Rs.{fetchedData.amount_payable}</div>
                  </div>
                )}
              </div>
              <div className={styles.amountDetails}>
                <div>Total Amount </div>
                <div>Rs.{formatPrice(fetchedData.total_price)}</div>
              </div>
            </div>

            <div className={styles.highlights}>
              <div className={styles.highHead}>Highlights</div>
              <div
                dangerouslySetInnerHTML={{
                  __html: fetchedData.package_ref.highlights,
                }}
              ></div>
            </div>
          </>
        )}

        <Footer />
      </div>
    </>
  );
}
