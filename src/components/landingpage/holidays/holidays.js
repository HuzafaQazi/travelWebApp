import styles from "./styles.module.css";
import Image from "next/image";
import { useEffect, useRef } from "react";
import { useState } from "react";
import flower from "../../../../public/img/flower.png";
import groupTour from "../../../../public/img/grouptourbg.png";
import Link from "next/link";
import { redirectPackageDetail } from "../../../../utils/pageredirection";
import EnquiryForm from "@/components/form/EnquiryForm";
import Loader from "@/components/loader/loader";
import { useRouter } from "next/router";
import { toast } from "react-toastify";
import axios from "@/utils/axios/axios";
import config from "@/config";
import SkeletonLoader from "@/components/loader/SkeletonLoader";
import { LazyLoadImage } from "react-lazy-load-image-component";
import { logEvent } from "firebase/analytics";
import { analytics } from "../../../../utils/firebase";
export default function Holidays({ holidays_by_theme, group_tours }) {
  const router = useRouter();

  const initialFormData = {
    countryCode: "+91",
    mobileNumber: "",
    name: "",
    email: "",
    destination: "",
    travelDate: "",
    guestCount: "",
    message: "",
  };

  const [formData, setFormData] = useState(initialFormData);
  const [isOpen, setIsOpen] = useState(false);
  const [isOtpRequest, setIsOtpRequest] = useState(false);
  const bottomSheetRef = useRef(null);
  const [isLoading, setIsLoading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isToastVisible, setIsToastVisible] = useState(false);

  const toggleBottomSheet = () => {
    setIsOpen(!isOpen);
    setIsOtpRequest(false);
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
    // Handle form submission here with formData
    // Example: Send the form data to an API
    try {
      setIsLoading(true);
      const payload = {
        mobile_number: formData.mobileNumber,
        name: formData.name,
        email: formData.email,
        destination: formData.destination,
        travel_date: formData.travelDate,
        guest_count: formData.guestCount,
        message: formData.message,
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
        logEvent(analytics, "enquiry_submission", {
          mobile_number: formData.mobileNumber,
          name: formData.name,
          destination: formData.destination,
          travel_date: formData.travelDate,
        });
        if (!isToastVisible) {
          toast("Thank you for contacting us!");
          setIsToastVisible(true);

          // Reset the flag after a specific duration (e.g., 3 seconds)
          setTimeout(() => {
            setIsToastVisible(false);
          }, 6000);
        }

        setFormData(initialFormData); // Reset the form data
        toggleBottomSheet();
      }
    } catch (error) {
      toast("Something went wrong");
    } finally {
      setIsLoading(false); // Set loading state to false after submission
    }
  };

  const handleRedirect = (id, title, country_name) => {
    setLoading(true);
    const url = redirectPackageDetail(id, title, country_name);
    router.push(url);
    logEvent(analytics, "holidays_redirect", {
      country_name: country_name,
      title: title,
    });
  };

  return (
    <>
      {holidays_by_theme?.length > 0 && (
        <div className={styles.holidays}>
          <h2 className={styles.topHeading}>Holidays by Themes</h2>
          <div className={styles.headingUnderline}></div>
          <div className={styles.holidaysContainer}>
            <div className={styles.column1}>
              <Image
                src={flower}
                alt="Your Image Alt Text"
                style={{ width: "100%", height: "-webkit-fill-available" }}
              />
            </div>
            <div className={styles.column2}>
              <div className={styles.row1}>EXPLORE</div>
              <div className={styles.row2}>HOLIDAYS</div>
              <div className={styles.row1}>By QuGo Themes</div>
              <div className={styles.row3}>
                Choose from carefully <br /> designed packages.
              </div>
              <button className={styles.button} onClick={toggleBottomSheet}>
                Send Enquiry
              </button>
            </div>
            {/* enquiry form bottomsheet starts */}
            {isOpen && (
              <div className={styles.overlay} onClick={toggleBottomSheet}></div>
            )}
            <div
              className={`${styles.bottomSheet} ${isOpen ? styles.open : ""}`}
              ref={bottomSheetRef}
            >
              <button
                className={styles.closeButton}
                onClick={toggleBottomSheet}
              >
                &times;
              </button>
              <div className={styles.bottomSheetContent}>
                {isOtpRequest ? (
                  <></>
                ) : (
                  <>
                    <EnquiryForm
                      formData={formData}
                      setFormData={setFormData}
                      onSubmit={handleEnquirySubmit}
                      isLoading={isLoading}
                    />
                  </>
                )}
              </div>
            </div>
            {/* enquiry form bottomsheet ends */}

            {holidays_by_theme.map((theme, index) => {
              let columnStyle = styles.column3; // Default style for index 0

              if (index === 1) {
                columnStyle = styles.column4;
              } else if (index === 2) {
                columnStyle = styles.column5;
              }

              return (
                <div key={index} className={columnStyle}>
                  <Image
                    src={theme.image_url}
                    alt={theme.title}
                    className={styles.column3Img}
                    width={800}
                    height={800}
                  />
                  <div
                    className={styles.columnsText}
                    dangerouslySetInnerHTML={{ __html: theme.description }}
                  ></div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {loading && <Loader />}

      {group_tours?.length > 0 && (
        <div className={styles.groupTour}>
          <h2 className={styles.topHeading}>Explore Group Tour</h2>
          <div className={styles.headingUnderline}></div>
          <div className={styles.groupTourContainer}>
            <Image
              className={styles.grouptourbg}
              src={groupTour}
              alt="grouptour"
              objectFit="contain"
            />
            <div className={styles.groupTourCards}>
              {group_tours.map((tour, index) => {
                const description = tour.description.slice(0, 80);
                const descriptionWithoutTags = description
                  .replace(/(<([^>]+)>)/gi, "")
                  .replace(/&nbsp;/g, " ");

                return (
                  <div key={index} className={styles.Tourcard}>
                    <Link
                      href={redirectPackageDetail(
                        tour.id,
                        tour.title,
                        tour.country_name
                      )}
                    >
                      {/* <Suspense fallback={<SkeletonLoader />}> */}
                      <LazyLoadImage
                        className={styles.cardimg}
                        src={tour.thumbnail_image}
                        alt={tour.title}
                        width={700}
                        height={700}
                        placeholder={<SkeletonLoader />}
                      />
                      {/* </Suspense> */}
                    </Link>
                    <div className={styles.cardContent}>
                      <h2 className={styles.exploreCardHeading}>
                        {tour.title}
                      </h2>
                      <hr className={styles.hr} />
                      <div className={styles.exploreCardDetails}>
                        {descriptionWithoutTags}
                        {tour.description.length > 120 && (
                          <Link
                            href={redirectPackageDetail(
                              tour.id,
                              tour.title,
                              tour.country_name
                            )}
                            className={styles.readMore}
                          >
                            <span className={styles.readMoreContainer}>
                              Read More
                            </span>
                          </Link>
                        )}
                      </div>

                      <div className={styles.bookButton}>
                        <button
                          className={styles.bookNowBtn}
                          onClick={() =>
                            handleRedirect(
                              tour.id,
                              tour.title,
                              tour.country_name
                            )
                          }
                        >
                          Book now
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
