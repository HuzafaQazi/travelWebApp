import styles from "./styles.module.css";
import Image from "next/image";
import { useState, useEffect, useRef } from "react";
import luxeBg from "../../../../public/img/Rectangle 1862.png";
import qugoLogo from "../../../../public/img/Qugo Logo resize 2-01.png";
import gemsofindiabg from "../../../../public/img/gemofindiaBg.png";
import Link from "next/link";
import { redirectPackageDetail } from "../../../../utils/pageredirection";
import EnquiryForm from "@/components/form/EnquiryForm";
import Loader from "@/components/loader/loader";

import axios from "@/utils/axios/axios";
import config from "@/config";
import { toast } from "react-toastify";
import { useRouter } from "next/router";
import { LazyLoadImage } from "react-lazy-load-image-component";
import SkeletonLoader from "@/components/loader/SkeletonLoader";
export default function Offers({ gems_of_india, luxe_destinations }) {
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
        toast("Thank you for contacting us!");
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
    // setLoading(false);
  };

  return (
    <>
      {loading && <Loader />}

      {gems_of_india?.length > 0 && (
        <div className={styles.gemsofindia}>
          <h2 className={styles.topHeading}>Gems of India</h2>
          <div className={styles.headingUnderline}></div>
          <div className={styles.gemsContainer}>
            <Image
              className={styles.goiBg}
              src={gemsofindiabg}
              alt="gemsofindia"
            />
            <div className={styles.goiText}>
              <div className={styles.goiHead}>Namaskaram To India</div>
              <p className={styles.goiAbout}>
                Experience India&apos;s illustrious culture
              </p>
            </div>
            <div className={styles.goiCards}>
              {gems_of_india.map((destination) => (
                <div
                  key={destination.id}
                  className={styles.goiCard}
                  onClick={() =>
                    handleRedirect(
                      destination.id,
                      destination.title,
                      destination.country_name
                    )
                  }
                >
                  <Link
                    href={redirectPackageDetail(
                      destination.id,
                      destination.title,
                      destination.country_name
                    )}
                  >
                    <LazyLoadImage
                      className={styles.goicardBg}
                      src={destination.thumbnail_image}
                      alt={destination.title}
                      width={600}
                      height={600}
                      placeholder={<SkeletonLoader />}
                    />
                  </Link>
                  <div className={styles.cardText}>{destination.city_name}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {luxe_destinations?.length > 0 && (
        <div className={styles.luxe}>
          <h2 className={styles.topHeading}>
            Luxe <span className={styles.qugoColor}>QuGo</span> Destinations
          </h2>
          <div className={styles.headingUnderline}></div>
          <div className={styles.luxeContainer}>
            <Image className={styles.luxeBg} src={luxeBg} alt="luxebg" />
            <div className={styles.content}>
              <div className={styles.leftContent}>
                <div className={styles.title}>INTRODUCING</div>
                <div className={styles.logo}>
                  <Image
                    className={styles.logoimg}
                    src={qugoLogo}
                    alt="qugoLogo"
                    objectFit="contain"
                  />
                </div>
                <div className={styles.description}>
                  Escape to the ultimate level of luxury, complete with
                  distinctive facilities and services.
                </div>
                <div className={styles.button}>
                  <button
                    className={styles.enquiryBtn}
                    onClick={toggleBottomSheet}
                  >
                    Send Enquiry
                  </button>
                </div>
              </div>
              {isOpen && (
                <div
                  className={styles.overlay}
                  onClick={toggleBottomSheet}
                ></div>
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

              <div className={styles.rightContent}>
                {luxe_destinations.map((destination, index) => (
                  <div
                    key={index}
                    className={`${styles.squareCard} ${
                      index === 2 ? styles.squareCard3 : ""
                    }`}
                  >
                    <LazyLoadImage
                      className={styles.luxecardbg}
                      src={destination.image_url}
                      alt={destination.title}
                      width={400}
                      height={200}
                      placeholder={<SkeletonLoader />}
                    />
                    <div className={styles.luxeCardContent}>
                      <div className={styles.luxeCardLocation}>
                        {destination.title}
                      </div>
                      <div
                        className={styles.luxeCardDescription}
                        dangerouslySetInnerHTML={{
                          __html: destination.description,
                        }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
