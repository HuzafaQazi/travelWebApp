import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import EnquiryForm from "@/components/form/package/EnquiryForm";
import { useLogin } from "@/store/context/LoginContext";
import Head from "next/head";
import Footer from "@/components/footer/footer";
import axios, { getTabSpecificData } from "@/utils/axios/axios";
import config from "@/config";
import HeaderCommon from "@/components/HeaderCommon/HeaderCommon";
import "flatpickr/dist/themes/light.css";
import { toast } from "react-toastify";
import Enquiry2 from "@/components/form/Enquiry2";
import bottomSheetStyles from "../../components/landingpage/holidays/styles.module.css";
import styles from "./styles.module.css";
import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeftLong } from "@fortawesome/free-solid-svg-icons";
import { useUserType } from "@/hooks/useUserType";
import Header from "@/components/corporate/auth/Header";
import Footer1 from "@/components/corporate/footerCorporate/footerCorporate";

export default function Home({ serverLoading, apiData }) {
  const { openPopup, isLoggedIn } = useLogin();
  const corporateUser = useUserType();

  const [isOpen, setIsOpen] = useState(false);
  const [isOtpRequest, setIsOtpRequest] = useState(false);
  const bottomSheetRef = useRef(null);
  const initialFormData = {
    countryCode: "+91",
    mobileNumber: "",
    name: "",
    email: "",
    destination: "",
    travelDate: new Date().toISOString().split("T")[0],
    guestCount: "1",
    message: "",
  };

  if (typeof sessionStorage !== "undefined") {
    // Safely access localStorage here
    if (getTabSpecificData("phoneNumber")) {
      initialFormData.mobileNumber = getTabSpecificData("phoneNumber");
    }
    if (getTabSpecificData("email")) {
      initialFormData.email = getTabSpecificData("email");
    }
  }

  if (apiData.countryname) {
    initialFormData.destination = apiData.countryname;
  }
  const [isLoading, setIsLoading] = useState(false);
  const [expandedIndex, setExpandedIndex] = useState(null);

  // State to store the selected dates
  const [checkinDate, setCheckinDate] = useState("");
  const [formData, setFormData] = useState(initialFormData);

  const [showFullDescription, setShowFullDescription] = useState(false);

  const toggleBottomSheet = (package_id, country_name) => {
    if (country_name) {
      setFormData((prevData) => ({ ...prevData, destination: country_name }));
    }
    setIsOpen(!isOpen);
    setIsOtpRequest(false);

    // Enable or disable background scrolling
    if (!isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
  };

  const closeBottomSheet = (event) => {
    if (
      bottomSheetRef.current &&
      !bottomSheetRef.current.contains(event.target)
    ) {
      setIsOpen(false);
      document.body.style.overflow = "auto";
    }
  };
  useEffect(() => {
    if (isOpen) {
      document.addEventListener("mousedown", closeBottomSheet);
    } else {
      document.removeEventListener("mousedown", closeBottomSheet);
    }
    return () => {
      document.removeEventListener("mousedown", closeBottomSheet);
    };
  }, [isOpen]);

  const handleEnquirySubmit = async (formData) => {
    const userId = getTabSpecificData("userID");
    if (!isLoggedIn) {
      return openPopup();
    }
    let payload;
    const package_payment_flag = false;
    const packageId = null;
    // make payment form
    if (package_payment_flag) {
      try {
        setIsLoading(true);
        payload = {
          user_id: userId,
          package_id: props.id,
          package_ref: {
            id: props.id,
            title: props.title,
            ratings: props.ratings,
            reviews_count: props.reviews_count,
            price: props.price,
            offer_price: props.offer_price,
            offer_percentage: props.offer_percentage,
            no_of_days: props.no_of_days,
            no_of_nights: props.no_of_nights,
            highlights: props.highlights,
            overview: props.overview,
            thumbnail_image: props.thumbnail_image,
            banner_image: props.banner_image,
            gallery_images: props.gallery_images,
            cityname: props.cityname,
            countryname: props.countryname,
          },
          user_name: formData.name,
          email: formData.email,
          mobile: formData.mobileNumber,
          destination: formData.destination,
          date_of_travel: formData.travelDate,
          guest_count: formData.guestCount,
          discount_percentage: formData.discount_percentage,
          discount_price: formData.discount_price,
          price: formData.price,
          total_price: formData.total_price,
          wallet_amount_used: formData.wallet_amount_used,
          amount_payable: formData.total_payable,
        };
        const configuration = {
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
          },
        };

        const { data } = await axios.post(
          `${config.PACKAGE_BOOKING}`,
          payload,
          configuration
        );
        if (data.status) {
          const bookingId = data.data.booking_id;
          if (parseFloat(formData.amount_payable) > 0) {
            const pgRes = await getPaymentGateway();
            if (pgRes.status === "SUCCESS") {
              let getPaymeneSessionIDResp = await getPaymentSessionID(
                null,
                0,
                bookingId,
                Math.max(0,parseFloat(formData.amount_payable)),
                formData.mobileNumber,
                pgRes.data.pgCode,
                3
              );
              if (
                getPaymeneSessionIDResp !== null &&
                getPaymeneSessionIDResp.data.data.paymentSessionId !== ""
              ) {
                const queryParams = {
                  package_id: props.id,
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
            }
          } else {
            router.push(`/packages/confirmbooking?booking_id=${bookingId}`);
          }
        }
      } catch (error) {
        console.log(error);
        toast("Something went wrong");
      } finally {
        setIsLoading(false);
      }
    } else {
      // send enquiry form
      try {
        setIsLoading(true);
        payload = {
          mobile_number: formData.mobileNumber,
          name: formData.name,
          email: formData.email,
          destination: formData.destination,
          travel_date: formData.travelDate,
          guest_count: formData.guestCount,
          message: formData.message,
          // package_id: props.id,
        };
        if (packageId) {
          payload.package_id = packageId;
        }
        const configuration = {
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
          },
        };

        const { data } = await axios.post(
          `${config.SEND_ENQUIRY}`,
          payload,
          configuration
        );
        if (data.status) {
          toast("Thank you for contacting us!");
          setFormData(initialFormData); // Reset the form data
          //  setCheckinDate("");
          if (packageId) {
            toggleBottomSheet();
          }
        }
      } catch (error) {
        toast("Something went wrong");
      } finally {
        setIsLoading(false);
      }
    }
  };

  const toggleDescription = (index) => {
    setExpandedIndex((prevIndex) => (prevIndex === index ? null : index));
  };

  return (
    <div>
      <Head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>
          {apiData.seo_meta_title ? apiData.seo_meta_title : "Blog details"}
        </title>
        {apiData.seo_meta_description && (
          <meta name="description" content={apiData.seo_meta_description} />
        )}
        {apiData.seo_meta_robots && (
          <meta name="robots" content={apiData.seo_meta_robots} />
        )}
        {apiData.seo_meta_keywords && (
          <meta name="keywords" content={apiData.seo_meta_keywords} />
        )}
      </Head>
      {!corporateUser ? (
        <div
          style={{
            backgroundColor: "#028fa3",
            position: "unset",
            height: "60px",
          }}
        >
          <HeaderCommon isAuthRequired={false} />
        </div>
      ) : (
        <div style={{ backgroundColor: "#ffffff" }}>
          <Header />
        </div>
      )}

      <div
        style={{
          marginTop: "2%",
          marginLeft: "5%",
        }}
      ></div>

      <>
        {apiData.must_visits_section.length > 0 && (
          <div className={styles["third-page"]}>
            <div className={styles["left-container"]}>
              <div className={styles.beachHeading}>
                <Link
                  style={{
                    backgroundColor: "#028fa3",
                    padding: "1.4% 1.9%",
                    borderRadius: "35px",
                    textDecoration: "none",
                    color: "white",
                  }}
                  href="/blogs"
                >
                  <FontAwesomeIcon icon={faArrowLeftLong} color="white" />
                </Link>
                <h2 className={styles.mustvisitHeading}>{apiData.cityname}</h2>
                <div className={styles["horizontal"]}></div>
              </div>
              {apiData.must_visits_section.map((item, index) => {
                const description =
                  expandedIndex === index
                    ? item.description
                    : item.description
                      .slice(0, 200)
                      .replace(/(<([^>]+)>)/gi, "");
                return (
                  <div className={styles["big-card"]} key={item.id}>
                    <div className={styles["beach-bg"]}>
                      <Image
                        className={styles.mustVisitBg}
                        src={item.image}
                        alt={item.image_alt || "mustVisit"}
                        width={400}
                        height={180}
                      />
                      <div className={styles.guideBgContent}>
                        <div className={styles.guideNum}>0{index + 1}</div>
                        {/* <div className={styles.guideTitle}>{item.title}</div> */}
                      </div>
                    </div>
                    <h2 className={styles.guideTitle}>{item.title}</h2>
                    <div className={styles["para-about"]}>
                      <div
                        dangerouslySetInnerHTML={{ __html: description }}
                        style={{ marginBottom: "0" }}
                      />
                      {item.description.length > 200 && (
                        <a
                          onClick={() => toggleDescription(index)}
                          style={{
                            cursor: "pointer",
                            color: "blue",
                            textDecoration: "underline",
                          }}
                        >
                          {expandedIndex === index ? "View Less" : "View More"}
                        </a>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
            <div className={styles.rightContainer}>
              <div className={styles.formPlaceRight}>
                <EnquiryForm
                  formData={formData}
                  setFormData={setFormData}
                  onSubmit={handleEnquirySubmit}
                  isLoading={isLoading}
                  checkinDate={checkinDate}
                  setCheckinDate={setCheckinDate}
                  package_payment_flag={true}
                  isAuthRequired={false}
                />
              </div>
            </div>
          </div>
        )}
        {/* enquiry form bottomsheet starts */}
        {isOpen && (
          <div
            className={bottomSheetStyles.overlay}
            onClick={toggleBottomSheet}
          ></div>
        )}
        <div
          className={`${bottomSheetStyles.bottomSheet} ${isOpen ? bottomSheetStyles.open : ""
            }`}
          ref={bottomSheetRef}
        >
          <button
            className={bottomSheetStyles.closeButton}
            onClick={toggleBottomSheet}
          >
            &times;
          </button>
          <div className={bottomSheetStyles.bottomSheetContent}>
            {isOtpRequest ? (
              <></>
            ) : (
              <>
                <Enquiry2
                  formData={formData}
                  setFormData={setFormData}
                  onSubmit={handleEnquirySubmit}
                  isLoading={isLoading}
                />
              </>
            )}
          </div>
        </div>
        {/* enquiry form bottomsheet ends  */}
      </>

      {!corporateUser ? (
          <Footer />
        ) : (
          <Footer1 />
        )}
    </div>
  );
}

export async function getServerSideProps(context) {
  try {
    const slug = context.params.param[2];
    const url = `http://localhost:3030/qtravels/searchService/api/v1.0/blog/detail`;
    // const response = await axios.get(`${url}/${slug}`);
    const response = await axios.get(`${config.BLOG_DETAIL}/${slug}`);

    const data = response.data?.data;

    console.log(data);

    if (!data) {
      return {
        notFound: true, // Show "Not Found" page
      };
    }

    return {
      props: {
        serverLoading: false,
        apiData: data,
      },
    };
  } catch (error) {
    console.log(error);
    console.error("Error fetching data:", error);
    return {
      notFound: true, // Show "Not Found" page on error
    };
  }
}
