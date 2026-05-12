import {
  faAngleDoubleLeft,
  faAngleDoubleRight,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import StarRatings from "react-star-ratings";
import qugoLogo from "../../../../public/img/Qugo Logo mobile.png";
import { redirectPackageDetail } from "../../../../utils/pageredirection";
import styles from "./style.module.css";

const FourthPage = ({ related_packages }) => {
  const carouselTrackRef = useRef(null);
  const [selectedCard, setSelectedCard] = useState(null);

  const handleCarouselScroll = (direction) => {
    const scrollAmount = 300; // Adjust the scroll amount as needed

    if (carouselTrackRef.current) {
      const currentScrollLeft = carouselTrackRef.current.scrollLeft;

      if (direction === "prev") {
        // Scroll to the left
        carouselTrackRef.current.scrollLeft = currentScrollLeft - scrollAmount;
      } else if (direction === "next") {
        // Scroll to the right
        carouselTrackRef.current.scrollLeft = currentScrollLeft + scrollAmount;
      }
      updateScrollArrowsVisibility();
    }
  };

  const updateScrollArrowsVisibility = () => {
    if (carouselTrackRef.current) {
      const currentScrollLeft = carouselTrackRef.current.scrollLeft;
      const maxScrollLeft =
        carouselTrackRef.current.scrollWidth -
        carouselTrackRef.current.clientWidth;

      const prevArrow = document.querySelector('[data-direction="prev"]');
      const nextArrow = document.querySelector('[data-direction="next"]');

      if (prevArrow) {
        prevArrow.style.visibility =
          currentScrollLeft > 0 ? "visible" : "hidden";
      }

      if (nextArrow) {
        nextArrow.style.visibility =
          currentScrollLeft < maxScrollLeft ? "visible" : "hidden";
      }
    }
  };

  useEffect(() => {
    updateScrollArrowsVisibility();

    const handleResize = () => {
      updateScrollArrowsVisibility();
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  // ratings
  const [starDimension, setStarDimension] = useState("15px");

  useEffect(() => {
    const handleResize = () => {
      const newStarDimension = window.innerWidth < 768 ? "15px" : "15px";
      setStarDimension(newStarDimension);
    };

    // Add event listener to handle window resize
    window.addEventListener("resize", handleResize);

    // Initial setting based on window width
    const initialStarDimension = window.innerWidth < 768 ? "20px" : "20px";
    setStarDimension(initialStarDimension);

    // Clean up the event listener when the component is unmounted
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  const formatPrice = (price) => {
    return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };

  return (
    related_packages.length > 0 && (
      <div className={styles["fourth-page"]}>
        <div className={styles["fourth-head"]}>
          <center>
            <h2 className={styles["head-style"]}>Related Packages</h2>
          </center>
          <center>
            <hr />
          </center>
        </div>
        <div className={styles["white-back"]}>
          <div className={styles.relatedcarousel}>
            <div className={styles.relatedcarouselTrack} ref={carouselTrackRef}>
              {related_packages.map((item) => (
                <div className={styles.relatedcard} key={item.id}>
                  <Link
                    href={redirectPackageDetail(
                      item.id,
                      item.title,
                      item.country_name
                    )}
                  >
                    <Image
                      className={styles.cardBg}
                      src={item.thumbnail_image}
                      alt={item.title}
                      height={700}
                      width={600}
                    />

                    <div className={styles.thailandContent}>
                      <div className={styles.topContent}>
                        <div className={styles.logo}>
                          <Image
                            className={styles.qugoLogo}
                            src={qugoLogo}
                            alt="logo"
                          />
                        </div>
                        <div className={styles.tripDuration}>
                          <h4 className={styles.noOfDays}>
                            {item.no_of_days}DAY
                          </h4>
                          <h4 className={styles.noOfDays}>
                            {item.no_of_nights}NIGHT
                          </h4>
                        </div>
                      </div>
                      <div className={styles.bottomContent}>
                        <h2 className={styles.cardheading}>{item.title}</h2>
                        <div className={styles.relatedPackagesRating}>
                          <StarRatings
                            rating={item.ratings}
                            starRatedColor="#ffffff"
                            starEmptyColor="#333333"
                            starDimension={starDimension}
                            starSpacing="1px"
                            numberOfStars={5}
                            style={{ marginTop: "20px" }}
                          />
                          <div className={styles.starsAlign}>
                            {item.ratings}
                            {item.reviews_count &&
                              ` (${item.reviews_count} reviews)`}
                          </div>
                        </div>
                        <div className={styles.priceBox}>
                          <div className={styles.Packageprice}>
                            Rs.{" "}
                            {item.offer_price
                              ? formatPrice(item.offer_price)
                              : formatPrice(item.price)}
                          </div>
                          <div className={styles.bookButton}>
                            <button className={styles.bookbtn}>Book Now</button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Link>
                </div>
              ))}
            </div>
          </div>
          <button
            className={styles.carouselControl}
            data-direction="prev"
            onClick={() => handleCarouselScroll("prev")}
          >
            <FontAwesomeIcon icon={faAngleDoubleLeft} />
          </button>
          <button
            className={styles.carouselControl}
            data-direction="next"
            onClick={() => handleCarouselScroll("next")}
          >
            <FontAwesomeIcon icon={faAngleDoubleRight} />
          </button>
        </div>
      </div>
    )
  );
};

export default FourthPage;
