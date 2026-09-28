import { useEffect, useRef } from "react";
import { useState } from "react";
import Image from "next/image";
import styles from "./CommonBanner.module.css";
import HeaderCommon from "@/components/HeaderCommon/HeaderCommon";
import B2CHeader from "@/components/flights/B2cHeader/Header"
import Header from "../corporate/auth/Header";
import bigbg from "../../../public/img/landingPageBg.png";
import bannerBg from "../../../public/img/corpBgBanner.png";
import feature1 from "../../../public/img/feature1.png";
import feature2 from "../../../public/img/feature2.png";
import feature3 from "../../../public/img/feature3.png";
import feature4 from "../../../public/img/feature4.png";
import mobbg from "../../../public/img/mobBG.png";
import Link from "next/link";
import Loader from "@/components/loader/loader";
import { useLogin } from "@/store/context/LoginContext";
import FlightBanner from "../flights/banner/banner";
import HotelBanner from "../landingpage/banner/banner";
import PackageBanner from "../packages/banner";
import FlightLoader from "../loader/FlightLoader";
import HotelLoader from "../loader/HotelLoader";
import PackageLoader from "../loader/PackageLoader";
import Carousel from "../PartnersCarousal/partnersCarousal";
import { useRouter } from "next/router";
import { redirectPackageDetail } from "../../../utils/pageredirection";
import useLocalStorage from "@/hooks/useLocalStorage";
import { useUserType } from "@/hooks/useUserType";

export default function CommonBanner({ promotions, onPageLoading }) {
  const { isOpen, isPosiflexLoginModalVisible, activeUrl } = useLogin();
  const corporateUser = useUserType();
  const router = useRouter();
  const [showFullDescription, setShowFullDescription] = useState(false);
  const [pageLoading, setPageLoading] = useState(false);
  const [bottomSheetFlightsVisible, setBottomSheetFlightsVisible] =
    useState(false);
  const bottomSheetFlightsRef = useRef(null);
  const [windowWidth, setWindowWidth] = useState(0);
  const [routeLoading, setRouteLoading] = useState(false);
  const [getFormData, setPackagesFormData] = useLocalStorage("formData");

  const [selectedTravelers, setSelectedTravelers] = useState([]);

  const handleTravelerChange = (newTravelers) => {
    setSelectedTravelers(newTravelers);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        bottomSheetFlightsRef.current &&
        !bottomSheetFlightsRef.current.contains(event.target)
      ) {
        setBottomSheetFlightsVisible(false);
      }
    };

    document.addEventListener("click", handleClickOutside);

    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, [bottomSheetFlightsRef]);

  useEffect(() => {
    setPackagesFormData(null);
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };
    setWindowWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  // for promotion cards auto scroll
  const containerRef = useRef(null);
  const scrollInterval = 3000; // Interval for automatic scrolling (adjust as needed)
  const numCardsToShow = 1; // Number of cards to show at once

  // Clone the card elements to create an infinite loop
  const cloneCards = () => {
    const container = containerRef.current;
    const cards = container?.querySelectorAll(`.${styles.promotionCard}`);
    const numOriginalCards = cards?.length;
    // Check if there are original cards to clone
    if (numOriginalCards === 0 || numOriginalCards === undefined) {
      return;
    }
    const numClones = numCardsToShow * 2;

    for (let i = 0; i < numClones; i++) {
      const clone = cards[i % numOriginalCards].cloneNode(true);
      container.appendChild(clone);
    }
  };

  const handleRedirect = (id, title, country_name) => {
    // setPageLoading(true);
    const url = redirectPackageDetail(id, title, country_name);
    router.push(url);
  };

  useEffect(() => {
    cloneCards();

    const container = containerRef.current;

    // Function to scroll to the next card
    const scrollNext = () => {
      if (!containerRef || !container) {
        return;
      }
      if (container) {
        const cardWidth = container.querySelector(
          `.${styles.promotionCard}`
        )?.offsetWidth;

        // Calculate the position of the next card without showing the previous card
        const nextCardPosition =
          Math.ceil(container.scrollLeft / cardWidth) * cardWidth;

        // Scroll to the next card's position with smooth behavior
        container.scrollTo({
          left: nextCardPosition,
          behavior: "smooth",
        });
      }
    };

    // Set an interval to scroll automatically
    const intervalId = setInterval(scrollNext, scrollInterval);

    // Clean up the interval when the component unmounts
    return () => clearInterval(intervalId);
  }, []);

  return (
    <>
      <div
        className={`${styles.blurContainer} ${
          isOpen || isPosiflexLoginModalVisible ? styles.blurBackground : ""
        }`}
      >
        {/* <main className={styles.mainBg}> */}
        <div className={`${styles.banner}`}>
          {!corporateUser ? (
            <Image
              className={styles.bannerBG}
              src={bigbg}
              alt="banner bg"
              layout="fill"
              objectFit="cover"
              objectPosition="center"
            />
          ) : (
            <Image
              className={styles.bannerBG}
              src={bannerBg}
              alt="banner bg"
              layout="fill"
              objectFit="cover"
              objectPosition="center"
            />
          )}
          <Image className={styles.mobbg} src={mobbg} alt="mob bg" />
          {!corporateUser ? (
            <div
              className={`${styles.headerCommons} ${
                isPosiflexLoginModalVisible ? styles.noBlur : ""
              }`}
            >
              {/* <HeaderCommon /> */}
              <B2CHeader/>
            </div>
          ) : (
            <div style={{ backgroundColor: "#ffffff", position: "relative" }}>
              <Header />
            </div>
          )}

          {activeUrl === "flights" && (
            <FlightBanner
              selectedTravelers={selectedTravelers}
              setSelectedTravelers={setSelectedTravelers}
              handleTravelerChange={handleTravelerChange}
              setPageLoading={setPageLoading}
            />
          )}
          {activeUrl === "hotels" && (
            <HotelBanner
              selectedTravelers={selectedTravelers}
              setSelectedTravelers={setSelectedTravelers}
              handleTravelerChange={handleTravelerChange}
              setPageLoading={setPageLoading}
            />
          )}
          {activeUrl === "packages" && (
            <PackageBanner setPageLoading={setPageLoading} />
          )}

          {pageLoading && activeUrl === "flights" && <FlightLoader />}
          {pageLoading && activeUrl === "hotels" && <HotelLoader />}
          {pageLoading && activeUrl === "packages" && <PackageLoader />}
          {onPageLoading(pageLoading)}

          {promotions?.length > 0 && (
            <div className={styles.promotionContainerBig}>
              <div className={styles.promotionCards}>
                <div className={styles.promotionHeading}>
                  Promotions for you
                </div>
                <div className={styles.headingUnderline}></div>
                <div
                  className={styles.promotionCardContainer}
                  ref={containerRef}
                >
                  {promotions.map((promotion, index) => {
                    const description = showFullDescription
                      ? promotion.description
                      : promotion.description.slice(0, 100);
                    const descriptionWithoutTags = description.replace(
                      /(<([^>]+)>)/gi,
                      ""
                    );

                    return (
                      <div
                        key={index}
                        className={styles.promotionCard}
                        onClick={() =>
                          handleRedirect(
                            promotion.id,
                            promotion.title,
                            promotion.country_name
                          )
                        }
                      >
                        <video
                          className={styles.promoCardBg}
                          autoPlay
                          loop
                          muted
                        >
                          <source src={promotion.video_url} type="video/mp4" />
                          Your browser does not support the video tag.
                        </video>
                        <div className={styles.textOverlay}>
                          <h6 className={styles.overlayHeading}>
                            {promotion.country_name}
                          </h6>
                          <div className={styles.overlayDescription}>
                            <div
                              dangerouslySetInnerHTML={{
                                __html: descriptionWithoutTags,
                              }}
                            />
                            {promotion.description.length > 100 &&
                              !showFullDescription && (
                                <Link href="#" className={styles.readMore}>
                                  Read More
                                </Link>
                              )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          <div className={styles.mobfeatures}>
            <div className={styles.feature}>
              <Image
                className={styles.featureicons}
                src={feature1}
                alt="feature 1"
              />
              <div className={styles.featureDetails}>
                <h3 className={styles.featureHeading}>TRAVEL</h3>
                <p className={styles.featureDescription}>
                  Embracing new experiences
                </p>
              </div>
            </div>
            <div className={`${styles.feature} ${styles.feature2}`}>
              <Image
                className={styles.featureicons}
                src={feature2}
                alt="feature 2"
              />
              <div className={styles.featureDetails}>
                <h3 className={styles.featureHeading}>Efficiency</h3>
                <p className={styles.featureDescription}>
                  Streamlined Bookings
                </p>
              </div>
            </div>
            <div className={styles.feature3}>
              <Image
                className={styles.featureicons3}
                src={feature3}
                alt="feature 3"
              />
              <div className={styles.featureDetails}>
                <h3 className={styles.featureHeading}>Personalization</h3>
                <p className={styles.featureDescription}>
                  Catering to your needs
                </p>
              </div>
            </div>
            <div className={styles.feature4}>
              <Image
                className={styles.featureicons}
                src={feature4}
                alt="feature 4"
              />
              <div className={styles.featureDetails}>
                <h3 className={styles.featureHeading}>Hospitality</h3>
                <p className={styles.featureDescription}>
                  24/7 Assistance provided
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* place for bottomsheet of traveler and class */}

        <div className={styles.features}>
          <div className={styles.feature}>
            <Image
              className={styles.featureicons}
              src={feature1}
              alt="feature 1"
            />
            <div className={styles.featureDetails}>
              <h3 className={styles.featureHeading}>TRAVEL</h3>
              <p className={styles.featureDescription}>
                Embracing new experiences
              </p>
            </div>
          </div>
          <div className={styles.feature}>
            <Image
              className={styles.featureicons}
              src={feature2}
              alt="feature 1"
            />
            <div className={styles.featureDetails}>
              <h3 className={styles.featureHeading}>Efficiency</h3>
              <p className={styles.featureDescription}>Streamlined Bookings</p>
            </div>
          </div>
          <div className={styles.feature}>
            <Image
              className={styles.featureicons}
              src={feature3}
              alt="feature 1"
            />
            <div className={styles.featureDetails}>
              <h3 className={styles.featureHeading}>Personalization</h3>
              <p className={styles.featureDescription}>
                Catering to your needs
              </p>
            </div>
          </div>
          <div className={styles.feature}>
            <Image
              className={styles.featureicons}
              src={feature4}
              alt="feature 1"
            />
            <div className={styles.featureDetails}>
              <h3 className={styles.featureHeading}>Hospitality</h3>
              <p className={styles.featureDescription}>
                24/7 Assistance provided
              </p>
            </div>
          </div>
        </div>
        {/* <div className={styles.partnersHeader}>Our Esteemed Customers</div>
        <div className={styles.headingUnderline}></div>
        <Carousel /> */}
        {/* </main> */}
      </div>
      {routeLoading && <Loader />}
    </>
  );
}
