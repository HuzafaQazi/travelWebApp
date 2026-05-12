import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import "flatpickr/dist/themes/light.css";
import StarRatings from "react-star-ratings";
import styles from "./style.module.css";
import EnquiryForm from "@/components/form/package/EnquiryForm";
import { useLogin } from "@/store/context/LoginContext";
import Loader from "@/components/loader/loader";
import { redirectPackageDetail } from "../../../utils/pageredirection";
import { useRouter } from "next/router";
import SimpleReactValidator from "simple-react-validator";
import axios, { getTabSpecificData } from '@/utils/axios/axios';
import config from "@/config";
import { toast } from "react-toastify";
import Enquiry2 from "@/components/form/Enquiry2";
import bottomSheetStyles from "../../components/landingpage/holidays/styles.module.css";
import { logEvent } from "firebase/analytics";
import { analytics } from "../../../utils/firebase";

const ThirdPage = ({
  must_visit_packages,
  travel_articles,
  countryname,
  package_payment_flag,
  form_offer_contents,
}) => {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [isOtpRequest, setIsOtpRequest] = useState(false);
  const [packageId, setPackageId] = useState("");
  const bottomSheetRef = useRef(null);
  const { openPopup, isLoggedIn } = useLogin();
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const toggleBottomSheet = (package_id, country_name) => {
    if (package_id) {
      setPackageId(package_id);
    }
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

  const [, forceUpdate] = useState(0);
  const simpleValidator = useRef(
    new SimpleReactValidator({
      element: (message) => <div className="text-danger">{message}</div>,
      messages: {
        required: "This field is required.",
        email: "Invalid email format.",
        validMobile: "Invalid or incomplete Indian mobile number.",
        // Add custom messages for other validation rules as needed.
      },
      validators: {
        validMobile: {
          // Define the custom validation function for a valid Indian mobile number.
          message: "Invalid or incomplete Indian mobile number.",
          rule: (val, params, validator) => {
            // The regular expression to match a 10-digit Indian mobile number.
            const regex = /^[6789]\d{9}$/;
            return regex.test(val);
          },
        },
      },
    })
  );
  const currentDate = new Date().toISOString().split("T")[0];
  const handleChange1 = (e) => {
    const { name, value } = e.target;

    const cleanValue = value.replace(/[^0-9]/g, "");

    const intValue = parseInt(cleanValue, 10);

    if (!isNaN(intValue) && intValue > 0) {
      setFormData((prevData) => ({ ...prevData, [name]: intValue }));
    } else if (value === "") {
      setFormData((prevData) => ({ ...prevData, [name]: "" }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const formValid = simpleValidator.current.allValid();

    if (formValid) {
      onSubmit(formData);
      simpleValidator.current.hideMessages();
    } else {
      simpleValidator.current.showMessages();
      forceUpdate((prevState) => !prevState); // Toggle state to force a re-render
    }
  };
  const initialFormData = {
    countryCode: "+91",
    mobileNumber: "",
    name: "",
    email: "",
    destination: "",
    travelDate: "",
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

  if (countryname) {
    initialFormData.destination = countryname;
  }
  const [isLoading, setIsLoading] = useState(false);
  const [loading, setLoading] = useState(false);

  // State to store the selected dates
  const [checkinDate, setCheckinDate] = useState("");
  const [formData, setFormData] = useState(initialFormData);

  const [checkoutDate, setCheckoutDate] = useState("");
  const [showFullDescription, setShowFullDescription] = useState(false);
  const [starDimension, setStarDimension] = useState("15px");

  const toggleDescription = () => {
    setShowFullDescription((prev) => !prev);
  };

  useEffect(() => {
    const handleResize = () => {
      const newStarDimension = window.innerWidth < 768 ? "15px" : "15px";
      setStarDimension(newStarDimension);
    };

    // Add event listener to handle window resize
    window.addEventListener("resize", handleResize);

    // Initial setting based on window width
    const initialStarDimension = window.innerWidth < 768 ? "15px" : "15px";
    setStarDimension(initialStarDimension);

    // Clean up the event listener when the component is unmounted
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  const handleEnquirySubmit = async (formData) => {
    const userId = getTabSpecificData("userID");
    if (!isLoggedIn) {
      return openPopup();
    }
    let payload;
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
          wallet_amount_used:formData.wallet_amount_used,
          amount_payable:formData.total_payable
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
          if(parseFloat(formData.amount_payable)>0){
          const pgRes = await getPaymentGateway();
          if (pgRes.status === "SUCCESS") {
            let getPaymeneSessionIDResp = await getPaymentSessionID(
              null,
              0,
              "BOOKING",
              bookingId,
              Math.max(0,parseFloat(formData.amount_payable)),
              formData.mobileNumber,
              pgRes.data.pgCode,
              3,
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
          }}else{
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
  const handleRedirect = (id, title, country_name) => {
    setLoading(true);
    const url = redirectPackageDetail(id, title, country_name);
    router.push(url);
    logEvent(analytics, 'must_visit_beaches', {
      id, title, country_name
    })
  };
  return (
    <>
      {must_visit_packages.length > 0 && (
        <div className={styles["third-page"]}>
          {loading && <Loader />}
          <div className={styles["left-container"]}>
            <div className={styles["beach-heading"]}>
              <h2 className={styles.mustvisitHeading}>
                Must Visit Beaches in {countryname}
              </h2>
              <div className={styles["horizontal"]}></div>
            </div>
            {must_visit_packages.map((item, index) => {
              const description = showFullDescription
                ? item.description
                : item.description.slice(0, 200).replace(/(<([^>]+)>)/gi, "");
              return (
                <div
                  className={styles["big-card"]}
                  key={item.id}
                //  onClick={() =>
                //     handleRedirect(item.id, item.title, item.country_name)
                //  }
                >
                  <div className={styles["beach-bg"]}>
                    <Image
                      className={styles.mustVisitBg}
                      src={item.banner_image}
                      alt="mustVisit"
                      width={400}
                      height={180}
                    />
                    <div className={styles.guideBgContent}>
                      <div className={styles.guideNum}>0{index + 1}</div>
                      <div className={styles.guideTitle}>{item.title}</div>
                    </div>
                  </div>
                  <div className={styles["para-about"]}>
                    <div
                      dangerouslySetInnerHTML={{ __html: description }}
                      style={{ marginBottom: "0" }}
                    />
                    {item.description.length > 200 && (
                      <a
                        onClick={toggleDescription}
                        style={{
                          cursor: "pointer",
                          color: "blue",
                          textDecoration: "underline",
                        }}
                      >
                        {showFullDescription ? "View Less" : "View More"}
                      </a>
                    )}
                  </div>
                  <div className={styles["beach-package"]}>
                    <div className={styles["package-img"]}>
                      <Image
                        onClick={() =>
                          handleRedirect(item.id, item.title, item.country_name)
                        }
                        src={item.thumbnail_image}
                        alt={item.title}
                        width={400}
                        height={180}
                      />
                    </div>
                    <div className={styles["rating-package"]}>
                      <h6 className={styles.ratingHead}>
                        {item.title}, {item.city_name}
                      </h6>
                      <div className={styles.starsAlignContent}>
                        <StarRatings
                          rating={item.ratings}
                          starRatedColor="#f8d64e"
                          starEmptyColor="#cccccc"
                          starDimension={starDimension}
                          starSpacing="1px"
                          numberOfStars={5}
                        />
                      </div>
                      <span className={styles["review-count"]}>
                        {item.reviews_count} reviews
                      </span>
                      <div className={styles["time-logo"]}>
                        <Image
                          onClick={() =>
                            handleRedirect(
                              item.id,
                              item.title,
                              item.country_name
                            )
                          }
                          src="/img/Vector.png"
                          alt="time"
                          width={30}
                          height={30}
                        />
                        <span>
                          <strong>8 Hr</strong>
                        </span>
                      </div>
                      <div className={styles["location-logo"]}>
                        <Image
                          src="/img/carbon_location-filled.png"
                          alt="location"
                          width={35}
                          height={35}
                        />
                        <strong>
                          <span className={styles.bigcardCityLocation}>
                            {item.city_name}
                          </span>
                        </strong>
                      </div>
                    </div>
                    <div className={styles["package-price"]}>
                      <center>
                        <h6 className={styles.packageStarting}>
                          Starting From
                        </h6>
                      </center>
                      {item.offer_price ? ( // Check if offer_price exists
                        <>
                          <center>
                            <strike>
                              <p className={styles.bigCardPackagePrice}>
                                Rs. {item.price}
                              </p>
                            </strike>
                          </center>
                          <center>
                            <h3>
                              <strong>Rs. {item.offer_price}</strong>
                            </h3>
                          </center>
                        </>
                      ) : (
                        <center>
                          <h3>
                            <strong>Rs. {item.price}</strong>
                          </h3>
                        </center>
                      )}
                      <center>
                        <p>per person</p>
                      </center>
                      <center>
                        <button
                          type="submit"
                          onClick={() =>
                            toggleBottomSheet(item.id, item.country_name)
                          }
                        >
                          Send Enquiry
                        </button>
                      </center>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          <div className={styles["right-container"]}>
            <div className={styles.formPlaceRight}>
              <EnquiryForm
                formData={formData}
                setFormData={setFormData}
                onSubmit={handleEnquirySubmit}
                isLoading={isLoading}
                checkinDate={checkinDate}
                setCheckinDate={setCheckinDate}
                packagePaymentFlag={package_payment_flag}
                form_offer_contents={form_offer_contents}
                package_payment_flag={package_payment_flag}
              />
            </div>
            <div className={styles["short-links"]}>
              <div className={styles["related-articles"]}>
                <h2>Related Articles</h2>
                <div className={styles["horizontal"]}></div>
              </div>
              {travel_articles.map((article) => (
                <div className={styles["article"]} key={article.id}>
                  <div className={styles["image-article"]}>
                    <Image
                      className={styles.imageArticles}
                      src={article.image}
                      alt={article.title}
                      width={100}
                      height={100}
                    />
                  </div>
                  <div className={styles["article-heading"]}>
                    <h3>{article.title}</h3>
                  </div>
                </div>
              ))}
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
  );
};
export default ThirdPage;
