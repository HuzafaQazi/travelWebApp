import styles from "./style.module.css";
import Image from "next/image";
import { useEffect, useRef } from "react";
import { useState } from "react";
import weyngoLogo from "../../../public/img/weyngo_logo.png";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faAngleDoubleLeft,
  faAngleDoubleRight,
} from "@fortawesome/free-solid-svg-icons";
import StarRatings from "react-star-ratings";
import { redirectPackageDetail } from "../../../utils/pageredirection";
import { useRouter } from "next/router";
import Loader from "@/components/loader/loader";
import { logEvent } from "firebase/analytics";
import { analytics } from "../../../utils/firebase";

const FourthPage = ({ trending_packages, countryname }) => {
  const router = useRouter();

  const [loading, setLoading] = useState(false);

  const handleRedirect = (id, title, country_name) => {
    setLoading(true);
    const url = redirectPackageDetail(id, title, country_name);
    router.push(url);
    logEvent(analytics, "trending_travelguide", {
      package_id: id,
      package_title: title,
      countryname: country_name,
    });
  };

  const carouselTrackRef = useRef(null);
  const carouselTrackRef2 = useRef(null);
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
  const handleCarouselScroll2 = (direction) => {
    const scrollAmount = 300; // Adjust the scroll amount as needed

    if (carouselTrackRef2.current) {
      const currentScrollLeft = carouselTrackRef2.current.scrollLeft;

      if (direction === "prev") {
        // Scroll to the left
        carouselTrackRef2.current.scrollLeft = currentScrollLeft - scrollAmount;
      } else if (direction === "next") {
        // Scroll to the right
        carouselTrackRef2.current.scrollLeft = currentScrollLeft + scrollAmount;
      }
    }
  };

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
    return price?.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };

  return (
    <>
      {loading && <Loader />}

      <div className={styles["fourth-page"]}>
        <div className={styles["trending-heading"]}>
          <h2>Trending in {countryname}</h2>
          <div className={styles["horizontal"]}></div>
        </div>
        <div className={styles["white-back"]}>
          <div className={styles.relatedcarousel}>
            <div className={styles.relatedcarouselTrack} ref={carouselTrackRef}>
              {trending_packages.map((item) => (
                <div
                  className={styles.trendingcard}
                  key={item.id}
                  onClick={() =>
                    handleRedirect(item.id, item.title, item.country_name)
                  }
                >
                  <Image
                    className={styles.trendingcardBg}
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
                          src={weyngoLogo}
                          alt="WeynGo logo"
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
                          <button className={styles.bookbtn}>Book</button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
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
      </div>
    </>
  );
};

export default FourthPage;
