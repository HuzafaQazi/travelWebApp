import { useState, useEffect } from "react";
import HeaderCommon from "@/components/HeaderCommon/HeaderCommon";
import B2CHeader from "@/components/flights/B2cHeader/Header";
import styles from "@/pages/packages/PackageDetail.module.css";
import { Button } from "react-bootstrap";
import Footer from "@/components/footer/footer";
import { useRouter } from "next/router";
import {
  packageBookingDetail,
  generateCommonInvoice,
  generateCommonPDFInvoice
} from "../../../utils/profileAPI";
import Loader from "@/components/loader/loader";
import { toast } from "react-toastify";
import { logEvent } from "firebase/analytics";
import { analytics } from "../../../utils/firebase";
import { useUserType } from "@/hooks/useUserType";
import Header from "@/components/corporate/auth/Header";
import Footer1 from "@/components/corporate/footerCorporate/footerCorporate";

export default function Confirmbooking() {
  const router = useRouter();
  const { booking_id } = router.query;
  const corporateUser = useUserType();

  const [fetchedData, setFetchedData] = useState("");

  useEffect(() => {
    const callPaymentDetail = async () => {
      try {
        const packageBookingDetailResp = await packageBookingDetail(booking_id);
        if (packageBookingDetailResp.status) {
          setFetchedData({
            ...packageBookingDetailResp.data,
          });
        }
      } catch (error) {
        console.log(error);
      }
    };

    callPaymentDetail();
  }, [booking_id]);

  const iconSize = "3x";

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

  const fetchAndDownloadInvoice = async () => {
    try {
      const payload = {
        bookingId: fetchedData.booking_id,
        travelCategory: 3,
        invoiceData: {
          id: fetchedData.id,
          user_id: fetchedData.user_id,
          package_id: fetchedData.package_id,
          user_name: fetchedData.user_name,
          email: fetchedData.email,
          mobile: fetchedData.mobile,
          destination: fetchedData.destination,
          date_of_travel: fetchedData.date_of_travel,
          guest_count: fetchedData.guest_count,
          discount_percentage: fetchedData?.discount_percentage || 0,
          discount_price: fetchedData?.discount_price || 0,
          wallet_amount: fetchedData.wallet_amount_used,
          price: fetchedData?.price || 0,
          total_price: fetchedData?.total_price || 0,
          payment_status: fetchedData.payment_status,
          booking_id: fetchedData.booking_id,
          createdAt: fetchedData.createdAt,
          updatedAt: fetchedData.updatedAt,
          package_ref: {
            id: fetchedData.package_ref.id,
            title: fetchedData.package_ref.title,
            ratings: fetchedData.package_ref.ratings,
            reviews_count: fetchedData.package_ref.reviews_count,
            price: fetchedData.package_ref.price,
            offer_price: fetchedData.package_ref?.offer_price || 0,
            offer_percentage: fetchedData.package_ref?.offer_percentage || 0,
            no_of_days: fetchedData.package_ref?.no_of_days,
            no_of_nights: fetchedData.package_ref?.no_of_nights,
            highlights: fetchedData.package_ref?.highlights,
            overview: fetchedData.package_ref?.overview,
            thumbnail_image: fetchedData.package_ref?.thumbnail_image,
            banner_image: fetchedData.package_ref?.banner_image,
            gallery_images: fetchedData.package_ref?.gallery_images,
            cityname: fetchedData.package_ref?.cityname,
            countryname: fetchedData.package_ref?.countryname,
          },
        },
      };
      const invoiceDataresp = await generateCommonInvoice(payload);
      if (invoiceDataresp) {
        const invoiceData = await generateCommonPDFInvoice(
          fetchedData.booking_id,
          3
        );
        const pdfData = invoiceData; // Binary PDF data
        if (pdfData && pdfData.byteLength > 0) {
          const blob = new Blob([pdfData], { type: "application/pdf" });


          logEvent(analytics, 'package_invoice_download', {
            bookingId: fetchedData.booking_id,
            travelCategory: 3,
            user_name: fetchedData.user_name,
            mobile: fetchedData.mobile,
          })
          // Trigger download
          const link = document.createElement("a");
          link.href = URL.createObjectURL(blob);
          link.download = "INV_" + booking_id + ".pdf";
          link.click();

          return URL.revokeObjectURL(link.href);
        }
      }
      return toast("something went wrong!");
    } catch (error) {
      console.error("Error fetching invoice data:", error);
    }
  };

  if (!fetchedData) {
    return <Loader />;
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
        <div className={styles.bookingContainer}>
          <div className={styles.topbookingContainer}>
            <div className={styles.rightBooking}>
              <div className={styles.topFlex}>
                <div className={styles.bookingHead}>Booking Details</div>

                <div className={styles.invoiceButton}>
                  <Button
                    style={{
                      backgroundColor: "#028FA3",
                      fontSize: "10px",
                      padding: "0px",
                      border: 'none',
                      display: "flex",
                      alignItems: "center",
                      border: "none",
                    }}
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
              <div>{formatTimestampToDDMMYYYY(fetchedData.date_of_travel)}</div>
            </div>
            <div className={styles.detailsHead}>Traveler Details</div>
            <div className={styles.packageName}>
              Name of the traveler <div>Mr {fetchedData.user_name}</div>
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
                Rs.{formatPrice(fetchedData.price)}
                {/* {fetchedData.discount_percentage
                  ? formatPrice(fetchedData.total_price)
                  : formatPrice(fetchedData.price)} */}
              </div>
            </div>
            {fetchedData.discount_percentage && (
              <div className={styles.packageName}>
                Discount percentage{" "}
                <div> {fetchedData.discount_percentage}%</div>
              </div>
            )}
            {/* {fetchedData.wallet_amount_used > 0 && ( */}
            <div className={styles.packageName}>
              Wallet Amount Paid{" "}
              <div> Rs.{fetchedData.wallet_amount_used}</div>
            </div>
            {/* )} */}
            {/* {fetchedData.amount_payable && ( */}
            {fetchedData.amount_payable > 0 && (
              <div className={styles.packageName}>
                Amount Paid By Other Modes
                <div> Rs.{fetchedData.amount_payable}</div>
              </div>
            )}

            {/* )} */}
          </div>
          <div className={styles.amountDetails}>
            <div> Total Amount</div>
            <div>Rs {formatPrice(fetchedData.total_price)}</div>
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

        {!corporateUser ? (
          <Footer />
        ) : (
          <Footer1 />
        )}
      </div>
    </>
  );
}
