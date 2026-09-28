import styles from "./style.module.css";
import NextImage from "next/image";
import { useEffect, useRef } from "react";
import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faAngleDoubleLeft,
  faAngleDoubleRight,
} from "@fortawesome/free-solid-svg-icons";
import Loader from "@/components/loader/loader";
import { redirectPackageDetail } from "../../../utils/pageredirection";
import { useRouter } from "next/router";
import StarRatings from "react-star-ratings";
import { logEvent } from "firebase/analytics";
import { analytics } from "../../../utils/firebase";

const ThirdPage = ({ country_name, tour_packages }) => {
  const router = useRouter();

  const carouselTrackRef = useRef(null);
  const [selectedCard, setSelectedCard] = useState(null);
  const [loading, setLoading] = useState(false);
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
    }
  };

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

  const handleRedirect = (id, title, country_name) => {
    setLoading(true);
    const url = redirectPackageDetail(id, title, country_name);
    router.push(url);
    logEvent(analytics, 'tour_packages', {
      country: country_name,
      title:title
    })
  };

  return (
    <>
      {loading && <Loader />}
      <div className={styles["third-page"]}>
        <div className={styles["third-head"]}>
          <h2>{country_name} Tour Packages</h2>
          <center>
            <hr />
          </center>
        </div>
        <div className={styles["white-back"]}>
          <div className={styles.packagescarousel}>
            <div
              className={styles.packagescarouselTrack}
              ref={carouselTrackRef}
            >
              {tour_packages.map((pack, index) => (
                <div
                  className={styles.packagescard}
                  key={pack.id}
                  onClick={() =>
                    handleRedirect(pack.id, pack.title, pack.country_name)
                  }
                >
                  <NextImage
                    className={styles.popCardBg1}
                    src={pack.thumbnail_image}
                    alt={pack.title}
                    width={350}
                    height={350}
                  />
                  <div className={styles.packagesCardContent}>
                    <div className={styles.packagesCardtopContent}>
                      <div className={styles.logo}>
                        <NextImage
                          className={styles.popLogo}
                          src="/img/weyngo_logo_white.png"
                          alt="WeynGo logo"
                          width={60}
                          height={20}
                        />
                      </div>
                      <div className={styles.packagesCardDays}>
                        <div className={styles.noOfDays}>
                          {pack.no_of_days}DAY
                        </div>
                        <div className={styles.noOfDays}>
                          {pack.no_of_nights}NIGHT
                        </div>
                      </div>
                    </div>
                    <div className={styles.packagesCardbottomContent}>
                      <h2 className={styles.packagesCardheading}>
                        {pack.title}
                      </h2>
                      <div className={styles.packagesCardrating}>
                        <StarRatings
                          rating={pack.ratings}
                          starRatedColor="#ffffff"
                          starEmptyColor="#333333"
                          starDimension={starDimension}
                          starSpacing="1px"
                          numberOfStars={5}
                          style={{ marginTop: "20px" }}
                        />
                        <div className={styles.starsAlign}>
                          {pack.ratings}
                          {pack.reviews_count &&
                            ` (${pack.reviews_count} reviews)`}
                        </div>
                      </div>
                      <div className={styles.packagesCardpriceBox}>
                        <div className={styles.packagesCardPackageprice}>
                          Rs.
                          {pack.offer_price
                            ? formatPrice(pack.offer_price)
                            : formatPrice(pack.price)}
                        </div>
                        <div className={styles.packagesCardbookButton}>
                          <button className={styles.packagesCardbookbtn}>
                            Book Now
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
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
    </>
  );
};

export default ThirdPage;
