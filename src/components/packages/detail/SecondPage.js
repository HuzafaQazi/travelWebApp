import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import Image from "next/image";
import flatpickr from "flatpickr";
import "flatpickr/dist/themes/light.css";
import { faMapMarkerAlt, faClock } from "@fortawesome/free-solid-svg-icons";
import StarRatings from "react-star-ratings";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import styles from "./style.module.css";
import EnquiryForm from "@/components/form/package/EnquiryForm";
import {
  getPaymentGateway,
  getPaymentSessionID,
} from "../../../../utils/bookingAPI";
import { routeToPg } from "@/paymentGateways/pgRouting";
import { useLogin } from "@/store/context/LoginContext";
import useLocalStorage from "@/hooks/useLocalStorage";
import axios, { handleLogout } from "@/utils/axios/axios";
import config from "@/config";
import { useRouter } from "next/router";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { logEvent } from "firebase/analytics";
import { analytics } from "../../../../utils/firebase";
import { confirmPaymentPackages } from "../../../../utils/walletApis";
import { getUserStatus } from "@/utils/userStatus";
import showToast from "@/utils/toast";
import { useUserType } from "@/hooks/useUserType";
import  { getTabSpecificData,setTabSpecificData ,removeTabSpecificData} from "@/utils/axios/axios";

const SecondPage = ({ activeButton, handleClick, itineraryRef, ...props }) => {
  const userDetails = useSelector((state) => state?.user?.userInfo);

  const router = useRouter();
  const corporateUser = useUserType();

  const [isToastVisible, setIsToastVisible] = useState(false);

  const { openPopup, isLoggedIn } = useLogin();
  const formatDate = (dateString) => {
    let date = new Date(dateString);
    let year = date.getFullYear();
    let month = (date.getMonth() + 1).toString().padStart(2, "0"); // Months are zero-based
    let day = date.getDate().toString().padStart(2, "0");

    // Format the date as YYYY-MM-DD
    let formattedDate = `${year}-${month}-${day}`;
    return formattedDate;
  };
  const initialFormData = {
    countryCode: "+91",
    mobileNumber: "",
    name: "",
    email: "",
    destination: "",
    travelDate: formatDate(new Date()),
    guestCount: "1",
    message: "",
  };

  let price = props.price;
  let offerPrice = props.offer_price;
  let offerPercentage = props.offer_percentage;
  let BOOKING_ID;
  let userId;

  if (typeof sessionStorage !== "undefined") {
    // Safely access localStorage here
    if (getTabSpecificData("phoneNumber")) {
      initialFormData.mobileNumber = getTabSpecificData("phoneNumber");
    }
    if (getTabSpecificData("email")) {
      initialFormData.email = getTabSpecificData("email");
    }
    if (getTabSpecificData("userID")) {
      userId = getTabSpecificData("userID");
    }
    const encodedResponse = getTabSpecificData("packageBookingDetail");

    if (encodedResponse) {
      const decodedResponse = JSON.parse(atob(encodedResponse));
      if (
        props.id === decodedResponse.package_id &&
        userId === decodedResponse.user_id &&
        !decodedResponse.payment_status
      ) {
        initialFormData.guestCount = decodedResponse.guest_count;
        initialFormData.name = decodedResponse.user_name;
        initialFormData.email = decodedResponse.email;
        initialFormData.destination = decodedResponse.destination;

        price = decodedResponse.price;
        offerPrice = decodedResponse.discount_price;
        offerPercentage = decodedResponse.discount_percentage;
        BOOKING_ID = decodedResponse.booking_id;
      }
    }
  }

  if (props.countryname) {
    initialFormData.destination = props.countryname;
  }

  const [isLoading, setIsLoading] = useState(false);

  // State to store the selected dates
  const [checkinDate, setCheckinDate] = useState("");
  const [getAccessToken, setAccessToken] = useLocalStorage("accessToken");
  const [getPhoneNumber, setPhoneNumber] = useLocalStorage("phoneNumber");
  const [getEmail, setEmail] = useLocalStorage("email");
  const [getUserID, setUserID] = useLocalStorage("userID");

  const [selectedTravelers, setSelectedTravelers] = useState([]);

  useEffect(() => {
    if (!checkinDate) {
      // Only update if checkinDate is not set

      if (typeof sessionStorage !== "undefined") {
        // Safely access localStorage here
        const encodedResponse = getTabSpecificData("packageBookingDetail");

        if (encodedResponse) {
          const decodedResponse = JSON.parse(atob(encodedResponse));
          if (props.id === decodedResponse.package_id) {
            // Set checkinDate after initializing other form data
            setCheckinDate(() => {
              const travelDate = new Date(decodedResponse.date_of_travel);
              if (!isNaN(travelDate.getTime())) {
                const formattedDate = travelDate.toISOString().slice(0, 10);
                return formattedDate;
              } else {
                // Handle the case where initialFormData.date_of_travel is an invalid date
                console.log(
                  "Invalid date format:",
                  initialFormData.date_of_travel
                );
                return ""; // or provide a default date
              }
            });
          }
        }
      }
    }
  }, [checkinDate, initialFormData]); // Add other dependencies as needed

  // State for itinerary sections and reviews
  const [itinerarySections, setItinerarySections] = useState(
    props.package_itineraries
  );
  const [getFormData, setPackagesFormData] = useLocalStorage("formData");

  // State for booking form data
  // const [formData, setFormData] = useState(getFormData() ?? initialFormData);
  const [formData, setFormData] = useState(initialFormData);

  // State for itinerary expansion
  const [expandedSections, setExpandedSections] = useState(() =>
    itinerarySections.map((_, index) => index)
  );

  // Function to handle itinerary section toggle
  const toggleSection = (index) => {
    setExpandedSections((prevExpandedSections) =>
      prevExpandedSections.includes(index)
        ? prevExpandedSections.filter((item) => item !== index)
        : [...prevExpandedSections, index]
    );
  };

  const iconStyle = {
    fontSize: "3.2vw",
    marginLeft: "3%",
    color: "#028FA3",
  };

  const phoneNumber = "7204186969";

  const handlePhoneNumberClick = () => {
    window.location.href = `tel:${phoneNumber.replace(/-/g, "")}`;
  };

  useEffect(() => {
    // Listen to route changes and set loading to false when the route changes
    const handleRouteChange = () => {
      if (getTabSpecificData("packageBookingDetail")) {
        removeTabSpecificData("packageBookingDetail");
      }
    };

    router.events.on("routeChangeComplete", handleRouteChange);

    // Cleanup the event listener
    return () => {
      router.events.off("routeChangeComplete", handleRouteChange);
    };
  }, [router]);

  const handleTravelerChange = (newTravelers) => {
    setSelectedTravelers(newTravelers);
    if (newTravelers.length > 0) {
      const firstTraveler = newTravelers?.[0]?.data;

      setFormData((prevFormData) => ({
        ...prevFormData,
        name: `${firstTraveler.firstName} ${firstTraveler.lastName}`,
        email: firstTraveler.workEmail,
        mobileNumber: firstTraveler.mobile,
      }));
    } else {
      // If no travelers are selected, reset the form fields to empty values
      setFormData((prevFormData) => ({
        ...prevFormData,
        name: "",
        email: "",
        mobileNumber: "",
      }));
    }
  };

  const handleEnquirySubmit = async (formData) => {
    const userId = getTabSpecificData("userID");
    if (!isLoggedIn && !userId) {
      return openPopup();
    }
    let payload;
    // make payment form
    if (props.package_payment_flag) {
      if (corporateUser) {
        const totalAdults = formData?.guestCount || 1;
        if (selectedTravelers.length === 0) {
          showToast("info", "Please select travelers for your booking.");
          return;
        }
        if (selectedTravelers.length < totalAdults) {
          showToast(
            "info",
            "The number of selected travelers cannot be less than the number of adults."
          );
          return;
        }

        if (selectedTravelers.length > totalAdults) {
          showToast(
            "info",
            "The number of selected travelers cannot exceed the number of adults."
          );
          return;
        }

        if (totalAdults > 9 || selectedTravelers.length > 9) {
          showToast(
            "info",
            "The total number of adults and selected travelers cannot exceed 9."
          );
          return;
        }
      }

      const travelerDetails =
        corporateUser && selectedTravelers.length > 0
          ? selectedTravelers?.[0]?.data
          : null;

      try {
        const userId = getTabSpecificData("userID");
        const reponse = await getUserStatus(userId);

        if (reponse.data.status === "inactive") {
          await handleLogout();
          return;
        }

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
          user_name:
            corporateUser && travelerDetails
              ? `${travelerDetails.firstName} ${travelerDetails.lastName}`
              : formData.name,
          email:
            corporateUser && travelerDetails
              ? travelerDetails.workEmail
              : formData.email,
          mobile:
            corporateUser && travelerDetails
              ? travelerDetails.mobile
              : formData.mobileNumber,
          destination: formData.destination,
          date_of_travel: formData.travelDate,
          guest_count: formData.guestCount,
          discount_percentage: formData.discount_percentage,
          discount_price: formData.discount_price,
          price: formData.price,
          total_price: formData.total_price,
          wallet_amount_used: formData.wallet_amount_used,
          amount_payable: formData.amount_payable,
        };

        if (corporateUser) {
          const corporateEmployees = selectedTravelers.map(
            (traveller) => traveller.data
          );
          const { companyId } = userDetails;
          payload.company_id = companyId;
          payload.corporate_employees = corporateEmployees;
        }

        logEvent(analytics, "payment_form_submission", {
          package_id: props.id,
          user_id: userId,
          name: formData.name,
          mobile: formData.mobileNumber,
          bookingID: BOOKING_ID,
        });

        const configuration = {
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
          },
        };
        let bookingId;
        if (!BOOKING_ID) {
          const { data } = await axios.post(
            `${config.PACKAGE_BOOKING}`,
            payload,
            configuration
          );
          if (data.status) {
            bookingId = data.data.booking_id;
          }
        } else {
          bookingId = BOOKING_ID;
        }
        logEvent(analytics, "payment_form_submission", {
          package_id: props.id,
          user_id: userId,
          name: formData.name,
          mobile: formData.mobileNumber,
          bookingID: bookingId,
        });
        if (parseFloat(formData.amount_payable) > 0) {
          const pgRes = await getPaymentGateway();
          if (pgRes.status === "SUCCESS") {
            let getPaymeneSessionIDResp = await getPaymentSessionID(
              null,
              Math.max(0,formData.wallet_amount_used),
              0,
              "BOOKING",
              bookingId,
              Math.max(0,parseFloat(formData.amount_payable)),
              formData.mobileNumber,
              pgRes.data.pgCode,
              3,
              null,
              payload.company_id ? payload.company_id : null
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
          let confirmReq = {
            booking_id: bookingId,
            payment_status: 1,
            payment_amount: parseFloat(formData.amount_payable),
            wallet_amount: formData.wallet_amount_used,
          };
          const resp = await confirmPaymentPackages(confirmReq);
          if (resp) {
            router.push(`/packages/confirmbooking?booking_id=${bookingId}`);
          }
        }
      } catch (error) {
        console.log(error);

        if (
          error?.response?.Error?.ErrorMessage?.Error ===
            "userId doesnot exists" ||
          error?.response?.Error?.ErrorCode === "400"
        ) {
          await handleLogout();
        }
        if (!isToastVisible) {
          showToast("info",error?.response?.data?.message ?? "Something went wrong");
          setIsToastVisible(true);

          // Reset the flag after a specific duration (e.g., 3 seconds)
          setTimeout(() => {
            setIsToastVisible(false);
          }, 6000);
        }
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
          package_id: props.id,
        };
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
          showToast("info","Thank you for contacting us!");
          setFormData(initialFormData); // Reset the form data
          // setPackagesFormData(initialFormData);
          setCheckinDate("");
        }
      } catch (error) {
        showToast("info","Something went wrong");
      } finally {
        setIsLoading(false);
      }
    }
  };

  const formatPrice = (price) => {
    return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };

  return (
    <div className={styles["second-page"]}>
      {/* left part starts */}
      <div className={styles["left-container"]}>
        <div className={styles["package-details"]}>
          {/* vertical bar */}
          <div className={styles["vertical"]}></div>
          <h2>
            {props.title} - {props.countryname}, <span></span>
            {props.cityname}
          </h2>
          <div className={styles["ratings"]}>
            <StarRatings
              rating={props.ratings}
              starRatedColor="#f8d64e"
              starEmptyColor="#cccccc"
              starDimension="20px"
              starSpacing="2px"
              numberOfStars={5}
              //   name={`rating-${index}`}
            />
            <span style={{ color: "black" }} id={styles["ratingValue"]}></span>
            <span style={{ color: "black" }} id={styles["reviewsCount"]}></span>
          </div>
          <div className={styles["details-icons"]}>
            <Image
              src="/img/icon-park-outline_transporter.png"
              alt="Icon 1"
              width={41}
              height={41}
            />
            <Image
              src="/img/ion_fast-food-outline.png"
              alt="Icon 2"
              width={41}
              height={41}
            />
            <Image
              src="/img/octicon_home-16.png"
              alt="Icon 3"
              width={41}
              height={41}
            />
            <Image
              src="/img/game-icons_binoculars.png"
              alt="Icon 4"
              width={41}
              height={41}
            />
            <Image
              style={{ height: "5dvh", width: "2px" }}
              src="/img/Line 35.png"
              alt="Icon 5"
              width={41}
              height={41}
            />
            <FontAwesomeIcon icon={faMapMarkerAlt} style={iconStyle} />
            <div className={styles.locationName}>{props.countryname}</div>
            <Image
              style={{
                height: "5dvh",
                width: "2px",
                marginLeft: "1%",
              }}
              src="/img/Line 35.png"
              alt="Icon 7"
              width={41}
              height={41}
            />
            <FontAwesomeIcon icon={faClock} style={iconStyle} />
            <div className={styles.locationName}>
              {props.no_of_days}D/{props.no_of_nights}N
            </div>
          </div>
        </div>
        <div className={styles["highlights"]}>
          <h3>HIGHLIGHTS</h3>
          <div dangerouslySetInnerHTML={{ __html: props.highlights }}></div>
        </div>
        <div className={styles["overview"]}>
          <h5>OVERVIEW</h5>
          <div dangerouslySetInnerHTML={{ __html: props.overview }}></div>
        </div>

        {/* Itinerary */}
        <div className={styles["itinerary"]} id="itinerary" ref={itineraryRef}>
          <div className={styles.navbar}>
            {props.showItinerary && (
              <button
                className={activeButton === "itinerary" ? styles.active : ""}
                onClick={() => handleClick("itinerary")}
                data-div="itinerary"
              >
                Itinerary
              </button>
            )}
            {props.showPolicy && (
              <button
                className={activeButton === "policy" ? styles.active : ""}
                onClick={() => handleClick("policy")}
                data-div="policy"
              >
                Policy
              </button>
            )}
          </div>
          <hr />
          <div className={styles.content}>
            <ul className={styles.tree}>
              {itinerarySections.map((section, index) => (
                <li key={index}>
                  <span className={styles.connect}></span>
                  <div
                    className={styles.section}
                    onClick={() => toggleSection(index)}
                  >
                    <div className={styles["section-details"]}>
                      <button className={styles["expand-btn"]}>
                        Day {index + 1}
                      </button>
                      <h5>{section.title}</h5>
                      <span
                        // className={styles.arrow}
                        className={`${styles.arrow} ${
                          expandedSections.includes(index)
                            ? styles["arrow-inverted"]
                            : ""
                        }`}
                        onClick={() => toggleSection(index)}
                      ></span>
                    </div>
                    {expandedSections.includes(index) && (
                      <div className={styles.hiddenParaContainer}>
                        <div
                          className={styles["hidden-para"]}
                          dangerouslySetInnerHTML={{
                            __html: section.description,
                          }}
                        ></div>
                      </div>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
      {/* left part ends */}

      {/* right part starts */}
      <div className={styles["right-container"]}>
        <div className={styles["price-box"]}>
          {props.offer_price ? (
            <>
              <h6>
                Starting from &nbsp; <del>INR {formatPrice(props.price)}</del>{" "}
              </h6>
              <h4 className={styles["actual-price"]}>
                INR {formatPrice(props.offer_price)}
              </h4>
              <p>per adult</p>
            </>
          ) : (
            <>
              <h4 className={styles["actual-price"]}>
                INR {formatPrice(props.price)}
              </h4>
              <p>per adult</p>
            </>
          )}
        </div>
        <EnquiryForm
          formData={formData}
          setFormData={setFormData}
          onSubmit={handleEnquirySubmit}
          isLoading={isLoading}
          checkinDate={checkinDate}
          setCheckinDate={setCheckinDate}
          packagePaymentFlag={props.package_payment_flag}
          price={price}
          offerPrice={offerPrice}
          offerPercentage={offerPercentage}
          form_offer_contents={props.form_offer_contents}
          package_payment_flag={props.package_payment_flag}
          handleTravelerChange={handleTravelerChange}
          selectedTravelers={selectedTravelers}
        />
        {/* </div> */}
        <div className={styles["query"]}>
          <h2>ANY QUESTIONS?</h2>
          <center>
            <hr />
          </center>
          <p>
            Our Destination expert will be happy to help you resolve your
            queries for this tour.
          </p>
          <div className={styles["qugo-service"]}>
            <Image
              src="/img/mdi_customer-service.png"
              alt="Image"
              width={91}
              height={91}
            />
            <div className={styles["contact-details"]}>
              <p className={styles["num"]} onClick={handlePhoneNumberClick}>
                {phoneNumber}
              </p>
              <p className={styles["timing"]}>10:00 AM - 09:00 PM (MON-SAT)</p>
            </div>
          </div>
          <div className={styles["why-qugo"]}>
            <h3>Why</h3>
            <Image
              src="/img/weyngo_logo.png"
              alt="WeynGo"
              width={120}
              height={40}
              style={{ marginLeft: "1%", objectFit: "contain" }}
            />
            <h3>?</h3>
          </div>
          <h5>Verified Reviews</h5>
          <ul>
            <li>25000+ Pictures and Reviews on the platform.</li>
            <li>10000+ Tours and Activities</li>
            <li>
              We have activities across 17 countries, across every category so
              that you never miss best things to do anywhere.
            </li>
          </ul>
          <h5>Customer Delight</h5>
          <ul>
            <li>
              {" "}
              We are always able to support you so that you have a hassle-free
              experience.
            </li>
          </ul>
        </div>
        <div className={styles.map}>
          <Image
            src="/img/bagPackageDetailsPage.png"
            alt="Image"
            width={900}
            height={300}
            className={styles["thailandMap"]}
          />
        </div>
      </div>
      {/* right part ends */}
    </div>
  );
};

export default SecondPage;
